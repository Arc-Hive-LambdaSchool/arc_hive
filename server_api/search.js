const axios = require('axios');
const debug = require('debug')('slash-command-template:slackSearch');
const qs = require('querystring');
const users = require('./users');
const request = require('request');


const sendConfirmation = (slackSearch) => {
  // console.log(slackSearch);
  console.log('SEARCH: \n' + slackSearch);
  axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: slackSearch.userId,
    text: 'View links below',
    attachments: JSON.stringify([
      {
        fields: [
          {
            title: 'Title: ',
            value: slackSearch.Records[0].Title,
          },
          {
            title: 'Link: ',
            value: slackSearch.Records[0].Link,
          }
        ],
      },
    ]),
  })).then((result) => {
    debug('sendConfirmation: %o', result.data);
  }).catch((err) => {
    debug('sendConfirmation error: %o', err);
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
    // slackSearch.title = submission.title;
    slackSearch.tags = submission.tags;
    slackSearch.cohort = submission.cohort;
    slackSearch.brownbag = submission.brownbag;
    // sendConfirmation(slackSearch);
    const g = {
      method: 'GET',
      uri: 'https://pacific-waters-60975.herokuapp.com/',
      headers: {
        Authorization: 'Bearer keySPG804go0FXK3F',
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
    return slackSearch;
  }).catch((err) => { console.error(err); });
};

module.exports = { create, sendConfirmation };
