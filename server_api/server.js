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
* =============AIRTABLE GET ROUTE=============
**************************************************************************
server.get('/', (req, res) => {
  const g = {
    method: 'GET',
    uri: 'https://api.airtable.com/v0/appMs812ZOuhtf8Un/tblWIvD0du6JQqdlx',
    headers: {
      Authorization: 'Bearer keySPG804go0FXK3F',
      'content-type': 'application/json',
      'id': 'recDVfMW2yBtY0Cxi'
    }
  };
  console.log(g.uri);
  request(g, (error, response, body) => {
    if (error) {
      console.log(error);
      return;
    }
    // console.log('Response: ' + JSON.stringify(response));
    // console.log('Body: ' + body);
    res.send(body);
  });
});
*/
/*************************************************************************
* =============AIRTABLE QUERY-GET ROUTE==============
**************************************************************************/
server.get('/', (req, res) => {
  const tagVal = req.body.tags;
  const cohortVal = req.body.cohort;
  const brownBagVal = req.body.brownbag;
  const path = {
    allRec: 'https://api.airtable.com/v0/appMs812ZOuhtf8Un/tblWIvD0du6JQqdlx?filterByFormula=',
    onlyBrownBags: 'IF(Brownbag%2C+Link)',
    noBrownBags: 'IF(NOT(Brownbag)%2C+Link)',
    cohort: 'OR(IF(FIND(%22' + req.body.cohort + '%22%2C+ARRAYJOIN(Cohort%2C+%22+%22))%2C+Link)%2C+IF(FIND(%22all%22%2C+ARRAYJOIN(Cohort%2C+%22+%22))%2C+Link))',
    tags: 'IF(FIND(%22' + req.body.tags + '%22%2C+ARRAYJOIN(Tags%2C+%22+%22))%2C+Link)'
  };
  const pathArray = [];
  let url = path.allRec;
  if (tagVal) {
    pathArray.push(path.tags);
  }
  if (cohortVal) {
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

  console.log(url);
  const g = {
    method: 'GET',
    uri: url,
    headers: {
      Authorization: 'Bearer keySPG804go0FXK3F',
      'content-type': 'application/json',
    },
    json: true
  };
  request(g, (error, response, body) => {
    if (error) {
      console.log(error);
      return;
    }
    const sendToSlack = {
      Records: body.records,
      userId: req.body.userId
    };
    slackSearch.sendConfirmation(sendToSlack);
    res.send(body);
  });
});

/*************************************************************************
* =============AIRTABLE CREATE-POST ROUTE==============
**************************************************************************/
server.post('/', (req, res) => {
  console.log(JSON.stringify(req.body));
  const p = {
    method: 'POST',
    uri: 'https://api.airtable.com/v0/appMs812ZOuhtf8Un/Table%201',
    headers: {
      Authorization: 'Bearer keySPG804go0FXK3F',
      'content-type': 'application/json',
    },
    body: {
      "fields": {
        Link: req.body.arcLink,
        Title: req.body.arcTitle,
        // Cohort: req.body.cohort,
        // Tags: req.body.tags
      }
    },
    json: true
  };
  console.log('server 141: ' + JSON.stringify(p.body));
  request(p, (error, response, body) => {
    if (error) {
      console.log('HI I AM AN ERROR')
      console.log(error);
      return;
    }
    console.log('server 148 Response: ' + JSON.stringify(response));
    console.log('server 149 Body: ' + JSON.stringify(body));
    console.log(req.body);
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
            type: 'select',
            name: 'tags',
            optional: true,
            options: [
              { label: 'JS', value: 'JS' },
              { label: 'React', value: 'React' },
              { label: 'Redux', value: 'Redux' },
              { label: 'Auth', value: 'Auth' },
              { label: 'C', value: 'C' },
              { label: 'Testing', value: 'Testing' },
            ],
          },
          {
            label: 'Cohort',
            optional: true,
            type: 'select',
            name: 'cohort',
            options: [
              { label: 'CS1', value: 'CS1' },
              { label: 'CS2', value: 'CS2' },
              { label: 'CS3', value: 'CS3' },
              { label: 'CS4', value: 'CS4' },
            ],
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
          }
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
            label: 'Enter video link here',
            type: 'text',
            name: 'arcLink',
            value: text,
            // value: 'enter link here',
          },
          {
            label: 'Enter video title',
            type: 'text',
            name: 'arcTitle',
            // value: 'enter title here',
          },
          {
            label: 'Tags',
            type: 'select',
            name: 'tags',
            options: [
              { label: 'JS', value: 'JS' },
              { label: 'React', value: 'React' },
              { label: 'Redux', value: 'Redux' },
              { label: 'Auth', value: 'Auth' },
              { label: 'C', value: 'C' },
              { label: 'Testing', value: 'Testing' },
            ],
          },
          {
            label: 'Cohort',
            type: 'select',
            name: 'cohort',
            options: [
              { label: 'CS1', value: 'CS1' },
              { label: 'CS2', value: 'CS2' },
              { label: 'CS3', value: 'CS3' },
              { label: 'CS4', value: 'CS4' },
            ],
          },
          {
            label: 'Brownbag?',
            optional: true,
            type: 'select',
            name: 'brownbag',
            options: [
              { label: 'Yes', value: 'true' },
            ]
          }
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
