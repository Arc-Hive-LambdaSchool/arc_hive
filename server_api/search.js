const axios = require('axios');
const debug = require('debug')('slash-command-template:search');
const qs = require('querystring');
const users = require('./users');

/*
 *  Send ticket creation confirmation via
 *  chat.postMessage to the user who created it
 */
const sendConfirmation = (search) => {
  console.log(search);
  axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: search.userId,
    text: 'View links below',
    attachments: JSON.stringify([
      {
        title: `Ticket created for ${search.userEmail}`,
        // Get this from the 3rd party helpdesk system
        title_link: 'http://example.com',
        text: search.text,
        fields: [
          {
            title: 'Tags',
            value: search.tags || 'None provided',
          },
          {
            title: 'Cohort',
            value: search.cohort || 'None provided',
            short: true,
          },
          {
            title: 'Brownbag',
            value: search.brownbag || 'No',
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

// Create helpdesk search. Call users.find to get the user's email address
// from their user ID
const create = (userId, submission) => {
  const search = {};

  const fetchUserEmail = new Promise((resolve, reject) => {
    users.find(userId).then((result) => {
      debug(`Find user: ${userId}`);
      resolve(result.data.user.profile.email);
    }).catch((err) => { reject(err); });
  });

  fetchUserEmail.then((result) => {
    search.userId = userId;
    search.userEmail = result;
    // search.title = submission.title;
    search.tags = submission.tags;
    search.cohort = submission.cohort;
    search.brownbag = submission.brownbag;
    sendConfirmation(search);
    return search;
  }).catch((err) => { console.error(err); });
};

module.exports = { create, sendConfirmation };
