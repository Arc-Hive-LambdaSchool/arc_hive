const axios = require('axios');
const debug = require('debug')('slash-command-template:slackSearch');
const qs = require('querystring');
const users = require('./users');
const request = require('request');


const sendConfirmation = (slackSearch) => {
  console.log(slackSearch);
  const field = [];
  for (let i = 0; i < slackSearch.Records.length; i++) {
    field.push({
      title: `${slackSearch.Records[i].fields.Title}`,
      value: slackSearch.Records[i].fields.Link,
    })
  }
  if (field.length === 0) {
    field.push({
      title: `No records match your search for Tags: ${slackSearch.tags}, Cohort: ${slackSearch.cohort}, Brownbag: ${slackSearch.brownbag}`,
      value: 'Please make sure your input is correct and/or try a less specific search'
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
  const cohorts = [];
  let slackChan;
  // const chanList = ['#CS1', '#CS2', '#CS3', '#CS4', '#CS5', '#CS6', '#CS7', '#CS8', '#CS9', '#CS10', '#CS11', '#CS12'];
  if (slackSearch.cohort === null) {
    cohorts.push(slackSearch.userId);
  } else if (slackSearch.cohort.toUpperCase() === 'ALL') {
    for (let i = 1; i <= 12; i++) {
      cohorts.push('#CS' + [i]);
    }
  } else {
    cohorts.push(`#${slackSearch.cohort.toUpperCase()}`);
  }
  // console.log(slackChan[0]);
  for (let i = 0; i < cohorts.length; i++) {
    // console.log(`length: ${slackChan.length}`);
    // console.log(slackChan[0]);
    axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
      token: process.env.SLACK_ACCESS_TOKEN,
      response_type: "in_channel",
      channel: `${cohorts[i]}`,
      text: `<!channel> Video has been successfully uploaded`,
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
  }
};

const arcError = (slackSearch) => {
  axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
    token: process.env.SLACK_ACCESS_TOKEN,
    response_type: "in_channel",
    channel: `${slackSearch.userId}`,
    text: `Error! Upload unsuccessful. You entered an invalid keyword`,
    /* attachments: JSON.stringify([
      {
        fields: [
          {
            title: `${slackSearch.arcTitle}`,
            value: slackSearch.arcLink
          }
        ],
      },
    ]), */
  })).then((result) => {
    debug('arcConfirmation: %o', result.data);
  }).catch((err) => {
    debug('arcConfirmation error: %o', err);
    console.error(err);
  });
};

const timestampConfirmation = (slackSearch) => {
  const newLink = slackSearch.arcLink + '?t=' + slackSearch.arcTime;
  axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: slackSearch.userId,
    text: '@channel',
    attachments: JSON.stringify([
      {
        title: 'timestamp test',
        fields: [
          {
            title: 'Title',
            value: slackSearch.arcTitle,
          },
          // {
          //   title: 'Instructor',
          //   value: slackSearch.arcInstructor,
          // },
          {
            title: 'new link',
            value: newLink,
          },
          {
            title: 'Tags',
            value: slackSearch.tags,
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
    slackSearch.tags = submission.tags;
    slackSearch.cohort = submission.cohort;
    slackSearch.brownbag = submission.brownbag;
    slackSearch.sort = submission.sort;
    slackSearch.arcLink = submission.arcLink;
    slackSearch.arcTitle = submission.arcTitle;
    slackSearch.arcTime = submission.arcTime;

    if (slackSearch.arcLink) {
      if (submission.keyword === process.env.KEYWORD) {
        // console.log('99 search: ' + JSON.stringify(slackSearch));
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
        arcError(slackSearch);
      }
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
