const axios = require('axios');
const debug = require('debug')('slash-command-template:slackSearch');
const qs = require('querystring');
const users = require('./users');
const request = require('request');


const sendConfirmation = (slackSearch) => {
  // console.log(slackSearch);
  const field = [];
  for (let i = 0; i < slackSearch.Records.length; i++) {
    field.push({
      title: `${slackSearch.Records[i].fields.Title}`,
      value: slackSearch.Records[i].fields.Link,
    })
  }
  if (field.length === 0) {
    field.push({
      title: `No records matched your search for Tags: ${slackSearch.searchTags}, Cohort: ${slackSearch.searchCohort}, BrownBag: ${slackSearch.searchBB}`,
      value: 'Make sure search parameters are correct and/or try a more general search'
    });
  }
  axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: slackSearch.userId,
    text: 'View links below',
    attachments: JSON.stringify([
      {
        fields: field,
      },
    ]),
  })).then((result) => {
    debug('sendConfirmation: %o', result.data);
  }).catch((err) => {
    debug('sendConfirmation error: %o', err);
    console.error(err);
  });
};

const arcConfirmation = (slackSearch) => {
  // console.log(slackSearch);
  let slackChannel = slackSearch.cohort;
  slackChannel = ['CS1', 'CS2', 'CS3', 'CS4', 'CS5', 'CS6', 'CS7', 'CS8', 'CS9',
    'CS10', 'CS11', 'CS12', 'CS13', 'CS14', 'CS15', 'CS16', 'CS17', 'CS18', 'CS19', 'CS20', 'CS21',
   'CS22', 'CS23', 'CS24'];
   if (slackChannel === 'ALL') {
     slackChannel = ['CS1', 'CS2', 'CS3', 'CS4', 'CS5', 'CS6', 'CS7', 'CS8', 'CS9',
       'CS10', 'CS11', 'CS12', 'CS13', 'CS14', 'CS15', 'CS16', 'CS17', 'CS18', 'CS19', 'CS20', 'CS21',
      'CS22', 'CS23', 'CS24'];
   }
   console.log(slackChannel);
  axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
    token: process.env.SLACK_ACCESS_TOKEN,
    // response_type: "in_channel",
    channel: `#${slackChannel}`,
    text: '@channel video has been successfully inserted to Airtable',
    attachments: JSON.stringify([
      {
        fields: [
          {
            title: `${slackSearch.arcTitle}`,
            value: slackSearch.arcLink
          }
        ],
      },
    ]),
  })).then((result) => {
    debug('arcConfirmation: %o', result.data);
  }).catch((err) => {
    debug('arcConfirmation error: %o', err);
    console.error(err);
  });
};

const create = (userId, submission) => {
  const slackSearch = {};

  const fetchUserEmail = new Promise((resolve, reject) => {
    users.find(userId).then((result) => {
      debug(`Find user: ${userId}`);
      resolve(result.data.user.profile.email);
    }).catch((err) => { reject(err); });
  });

  fetchUserEmail.then((result) => {
    slackSearch.userId = userId;
    slackSearch.userEmail = result;
    slackSearch.tags = submission.tags;
    slackSearch.cohort = submission.cohort.toUpperCase();
    slackSearch.brownbag = submission.brownbag;
    slackSearch.sort = submission.sort;
    slackSearch.arcLink = submission.arcLink;
    slackSearch.arcTitle = submission.arcTitle;
    if (slackSearch.arcLink) {
      console.log('99 search: ' + JSON.stringify(slackSearch));
      const p = {
        method: 'POST',
        uri: 'https://pacific-waters-60975.herokuapp.com/',
        headers: {
          Authorization: process.env.AIR_TABLE_KEY,
          'content-type': 'application/json',
        },
        body: slackSearch,
        json: true
      };
      request(p, (error, response, body) => {
        if (error) {
          console.log(error);
          return;
        }
      });
    } else {
      const g = {
        method: 'GET',
        uri: 'https://pacific-waters-60975.herokuapp.com/',
        headers: {
          Authorization: process.env.AIR_TABLE_KEY,
          'content-type': 'application/json',
        },
        body: slackSearch,
        json: true
      };
      request(g, (error, response, body) => {
        if (error) {
          console.log(error);
          return;
        }
      });
    }
  }).catch((err) => { console.error(err); });
};

module.exports = { create, sendConfirmation, arcConfirmation };
