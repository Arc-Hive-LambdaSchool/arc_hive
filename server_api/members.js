const qs = require('querystring');
const axios = require('axios');

const memberList = (slackUserId) => {
  const body = { token: process.env.SLACK_ACCESS_TOKEN, channel: process.env.STAFF_TEST_CHANNEL };
  const promise = axios.post
  ('https://slack.com/api/conversations.members', qs.stringify(body));
  return promise;
};


module.exports = { memberList };
