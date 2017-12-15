require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const request = require('request');
const mongodb = require('mongodb');
const port = process.env.PORT || 5001;
const Airtable = require('airtable');
// const thePrecious = process.env.AIR_TABLE_KEY;
const thePrecious = 'Bearer keySPG804go0FXK3F'
//console.log(thePrecious);
//console.log(process.env);
const slackModel = require('./slackModel');
const slackSearch = require('./search');
const axios = require('axios');
const qs = require('querystring');
const debug = require('debug')('slash-command-template:index');
const users = require('./users.js');

Airtable.configure({
  endpointUrl: 'https://api.airtable.com/v0/appMs812ZOuhtf8Un/Table%201',
  apiKey: thePrecious
});
let base = Airtable.base('appMs812ZOuhtf8Un');

const server = express();

mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost/arc_hive', {useMongoClient: true});

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));

/*=======================================================================
=========================================================================
* AIRTABLE ROUTES
=========================================================================
========================================================================*/

/*************************************************************************
* =============AIRTABLE QUERY-GET ROUTE==============
* -This route is triggered when the 'create' function in search.js sends
* an HTTP request containing the search parameters
**************************************************************************/
server.get('/', (req, res) => {
  let tagVal = req.body.tags;
  let cohortVal = req.body.cohort;
  const brownBagVal = req.body.brownbag;
  let sortParam = 'asc'
  if (req.body.sort) {
    sortParam = req.body.sort;
  }
  if (tagVal) {
    tagVal = tagVal.toUpperCase();
  }
  if(cohortVal) {
    cohortVal = cohortVal.toUpperCase();
  }
  const path = {
    allRec: 'https://api.airtable.com/v0/appMs812ZOuhtf8Un/tblWIvD0du6JQqdlx?filterByFormula=',
    onlyBrownBags: 'IF(Brownbag%2C+Link)',
    noBrownBags: 'IF(NOT(Brownbag)%2C+Link)',
    cohort: 'OR(IF(FIND(%22' + cohortVal + '%22%2C+ARRAYJOIN(Cohort%2C+%22+%22))%2C+Link)%2C+IF(FIND(%22all%22%2C+ARRAYJOIN(Cohort%2C+%22+%22))%2C+Link))',
    tags: 'IF(FIND(%22' + tagVal + '%22%2C+ARRAYJOIN(Tags%2C+%22+%22))%2C+Link)',
    sort: '&sort%5B0%5D%5Bfield%5D=Created&sort%5B0%5D%5Bdirection%5D=' + sortParam
  };
  const pathArray = [];
  let url = path.allRec;
  if (tagVal) {
    pathArray.push(path.tags);
  }
  if (cohortVal) {
    console.log(cohortVal);
    pathArray.push(path.cohort);
  }
  if (brownBagVal) {
    pathArray.push(path[brownBagVal]);
  }
  if (pathArray.length === 1) {
    url += pathArray[0];
  } else if (pathArray.length > 1) {
    url += 'AND(' + pathArray.join('%2C+') + ')';
  }

  // console.log(url);
  const g = {
    method: 'GET',
    uri: url + path.sort,
    headers: {
      Authorization: process.env.AIR_TABLE_KEY,
      'content-type': 'application/json',
    },
    json: true
  };
  request(g, (error, response, body) => {
    if (error) {
      console.log(error);
      return;
    }
    if (sortParam === 'asc') {
      sortParam = 'oldest to newest';
    } else {
      sortParam = 'newest to oldest'
    }
    const sendToSlack = {
      Records: body.records,
      userId: req.body.userId,
      tags: tagVal,
      cohort: cohortVal,
      brownbag: brownBagVal,
      sortParam: sortParam
    };
    // console.log(sendToSlack);
    slackSearch.sendConfirmation(sendToSlack);
    res.send(body);
  });
});

/*************************************************************************
* =============AIRTABLE CREATE-POST ROUTE==============
**************************************************************************/
server.post('/', (req, res) => {
  console.log(JSON.stringify(req.body));
  let brownbag = null;
  let cohort = ['N/A'];
  let tags = ['N/A'];
  let link = req.body.arcLink;
  if (req.body.cohort) {
    cohort = req.body.cohort.toUpperCase().split(', ');
  }
  if (req.body.arcTime) {
    link += '?t=' + req.body.arcTime;
  }
  if (req.body.tags) {
    tags = req.body.tags.toUpperCase().split(', ');
  }
  if (req.body.brownbag) {
    brownbag = true;
  }
  const p = {
    method: 'POST',
    uri: 'https://api.airtable.com/v0/appMs812ZOuhtf8Un/Table%201',
    headers: {
      Authorization: process.env.AIR_TABLE_KEY,
      'content-type': 'application/json',
    },
    body: {
      "fields": {
        Link: link,
        Title: req.body.arcTitle,
        Cohort: cohort,
        Tags: tags,
        Brownbag: brownbag,
      }
    },
    json: true
  };
  request(p, (error, response, body) => {
    if (error) {
      console.log('HI I AM AN ERROR')
      console.log(error);
      return;
    }
     console.log('server 158 Response: ' + JSON.stringify(response));
     console.log('server 159 Body: ' + JSON.stringify(body));
    // console.log(req.body);
    slackSearch.arcConfirmation(req.body);
    res.send(JSON.stringify(body));
  });
});

/*=======================================================================
=========================================================================
* SLACK ROUTES
=========================================================================
========================================================================*/

/*************************************************************************
* =============SLACK COMMANDS-POST ROUTE==============
**************************************************************************/
server.post('/commands', (req, res) => {
  // extract the verification token, slash command text,
  // and trigger ID from payload
  const { token, text, trigger_id } = req.body;

  // check that the verification token matches expected value
  if (token === process.env.SLACK_VERIFICATION_TOKEN) {
    // create the dialog payload - includes the dialog structure, Slack API token,
    // and trigger ID
    const dialog = {
      token: process.env.SLACK_ACCESS_TOKEN,
      trigger_id,
      dialog: JSON.stringify({
        title: 'LS Videos',
        callback_id: 'submit-search',
        submit_label: 'Submit',
        elements: [
          {
            label: 'Tags',
            type: 'text',
            name: 'tags',
            optional: true,
            /* options: [
              { label: 'JS', value: 'JS' },
              { label: 'React', value: 'React' },
              { label: 'Redux', value: 'Redux' },
              { label: 'Auth', value: 'Auth' },
              { label: 'C', value: 'C' },
              { label: 'Testing', value: 'Testing' },
            ], */
          },
          {
            label: 'Cohort',
            optional: true,
            type: 'text',
            name: 'cohort',
            /* options: [
              { label: 'CS1', value: 'CS1' },
              { label: 'CS2', value: 'CS2' },
              { label: 'CS3', value: 'CS3' },
              { label: 'CS4', value: 'CS4' },
            ], */
          },
          {
            label: 'Brownbag?',
            optional: true,
            type: 'select',
            name: 'brownbag',
            options: [
              { label: 'Only Brownbags', value: 'onlyBrownBags' },
              { label: 'No Brownbags', value: 'noBrownBags' },
            ]
          },
          {
            label: 'Sorted By',
            optional: true,
            type: 'select',
            name: 'sort',
            value: 'asc',
            options: [
              { label: 'Newest First', value: 'desc' },
              { label: 'Oldest First', value: 'asc' },
            ]
          },
        ],
      }),
    };

    // open the dialog by calling dialogs.open method and sending the payload
    axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog))
      .then((result) => {
        debug('dialog.open: %o', result.data);
        res.send('');
      }).catch((err) => {
        debug('dialog.open call failed: %o', err);
        res.sendStatus(500);
      });
  } else {
    debug('Verification token mismatch');
    res.sendStatus(500);
  }
});

/*************************************************************************
* ==============SLACK INTERACTIVE-COMPONENT-POST ROUTE==============
**************************************************************************/
server.post('/interactive-component', (req, res) => {
  const body = JSON.parse(req.body.payload);

  // check that the verification token matches expected value
  if (body.token === process.env.SLACK_VERIFICATION_TOKEN) {
    debug(`Form submission received: ${body.submission.trigger_id}`);

    // immediately respond with a empty 200 response to let
    // Slack know the command was received
    res.send('');

    // create Helpdesk ticket
    slackSearch.create(body.user.id, body.submission);
  } else {
    debug('Token mismatch');
    res.sendStatus(500);
  }
});

/*************************************************************************
* ==============SLACK ARCCOMMANDS-POST ROUTE==============
**************************************************************************/
server.post('/arcCommands', (req, res) => {
  // extract the verification token, slash command text,
  // and trigger ID from payload
  const { token, text, trigger_id, user_id } = req.body;

  const findUser = (userId) => {

    const fetchUserName = new Promise((resolve, reject) => {
      users.find(userId).then((result) => {
        debug(`Find user: ${userId}`);
        resolve(result.data.user.profile.real_name);
      }).catch((err) => { reject(err); });
    });

    fetchUserName.then((result) => {
      openDialog(result);
      return;
    }).catch((err) => { console.error(err); });
  };

  findUser(user_id);
  // check that the verification token matches expected value
  const openDialog = (userName) => {
    if (token === process.env.SLACK_VERIFICATION_TOKEN) {
      // create the dialog payload - includes the dialog structure, Slack API token,
      // and trigger ID
      const dialog = {
        token: process.env.SLACK_ACCESS_TOKEN,
        trigger_id,
        dialog: JSON.stringify({
          title: 'LS Videos',
          callback_id: 'submit-search',
          submit_label: 'Submit',
          elements: [
            {
              label: 'Enter video link here',
              type: 'text',
              name: 'arcLink',
              value: text,
            },
            {
              label: 'Enter video title',
              type: 'text',
              name: 'arcTitle',
              value: `[Title] by ${userName}`,
              hint: 'Replace "[Title]" with your title',
            },
            {
              label: 'Password',
              type: 'text',
              name: 'password',
            },
            {
              label: 'Tags',
              type: 'text',
              name: 'tags',
              optional: true,
              hint: 'add tags separated by a comma. Ex: React, Redux, Brownbag'
              /* options: [
                { label: 'JS', value: 'JS' },
                { label: 'React', value: 'React' },
                { label: 'Redux', value: 'Redux' },
                { label: 'Auth', value: 'Auth' },
                { label: 'C', value: 'C' },
                { label: 'Testing', value: 'Testing' },
              ], */
            },
            {
              label: 'Cohort',
              type: 'text',
              name: 'cohort',
              optional: true,
              /* options: [
                { label: 'CS1', value: 'CS1' },
                { label: 'CS2', value: 'CS2' },
                { label: 'CS3', value: 'CS3' },
                { label: 'CS4', value: 'CS4' },
              ], */
            },
            // {
            //   label: 'Brownbag?',
            //   optional: true,
            //   type: 'select',
            //   name: 'brownbag',
            //   options: [
            //     { label: 'Yes', value: true },
            //   ]
            // }
          ],
        }),
      };

      axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog))
        .then((result) => {
          debug('dialog.open: %o', result.data);
          res.send('');
        }).catch((err) => {
          debug('dialog.open call failed: %o', err);
          res.sendStatus(500);
        });
    } else {
      debug('Verification token mismatch');
      res.sendStatus(500);
    }
  }
});

/*************************************************************************
* ==============SLACK ARCCOMMANDS-POST ROUTE==============
**************************************************************************/
server.post('/timestamp', (req, res) => {
  const { token, text, trigger_id, user_id } = req.body;

  const findUser = (userId) => {

    const fetchUserName = new Promise((resolve, reject) => {
      users.find(userId).then((result) => {
        debug(`Find user: ${userId}`);
        resolve(result.data.user.profile.real_name);
      }).catch((err) => { reject(err); });
    });

    fetchUserName.then((result) => {
      openDialog(result);
      return;
    }).catch((err) => { console.error(err); });
  };

  findUser(user_id);

  const openDialog = (userName) => {
    if (token === process.env.SLACK_VERIFICATION_TOKEN) {
      const dialog = {
        token: process.env.SLACK_ACCESS_TOKEN,
        trigger_id,
        dialog: JSON.stringify({
          title: 'add a timestamp',
          callback_id: 'submit-search',
          submit_label: 'Submit',
          elements: [
            {
              label: 'Video Link',
              type: 'text',
              name: 'arcLink',
              value: text,
            },
            {
              label: 'Video Title',
              type: 'text',
              name: 'arcTitle',
            },
            {
              label: 'Password',
              type: 'text',
              name: 'password'
            },
            // {
            //   label: 'Instructor',
            //   type: 'text',
            //   name: 'arcInstructor',
            //   value: userName,
            // },
            {
              label: 'Enter time',
              type: 'text',
              name: 'arcTime',
              hint: 'e.g. 1h2m35s'
            },
            {
              label: 'Tags',
              type: 'text',
              name: 'tags',
            },
          ],
        }),
      };

      axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog))
        .then((result) => {
          debug('dialog.open: %o', result.data);
          res.send('');
        }).catch((err) => {
          debug('dialog.open call failed: %o', err);
          res.sendStatus(500);
        });
    } else {
      debug('Verification token mismatch');
      res.sendStatus(500);
    }
  };
});



server.listen(port, () => {
  console.log(`Servs up dude ${port}`);
});

/*
const MONGO_URL = 'mongodb://arc_hive_admin:arc hive 555@ds013475.mlab.com:13475/arc_hive_testdb';

MongoClient.connect(MONGO_URL, (err, db) => {
  if (err) {
    return console.log(err);
  }

  // Do something with db here, like inserting a record
  db.collection('arc_hive_testdb').insertOne(
    {
      text: 'Hopefully this works!'
    },
    function (err, res) {
      if (err) {
        db.close();
        return console.log(err);
      }
      // Success
      db.close();
    }
  )
});
*/
