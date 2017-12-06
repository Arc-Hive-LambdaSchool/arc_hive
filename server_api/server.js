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

server.get('/:search/:value', (req, res) => {
  let search = req.params.search;
  const val = req.params.value;
  const allRec = 'https://api.airtable.com/v0/appMs812ZOuhtf8Un/tblWIvD0du6JQqdlx';
  const brownBags = '?filterByFormula=IF(Brownbag%2C+Link)';
  const notBrownBags = '?filterByFormula=IF(NOT(Brownbag)%2C+Link)';
  const byCohort = '?filterByFormula=OR(IF(FIND(%22' + val + '%22%2C+ARRAYJOIN(Cohort%2C+%22+%22))%2C+Link)%2C+IF(FIND(%22all%22%2C+ARRAYJOIN(Cohort%2C+%22+%22))%2C+Link))';
  const byTags = '?filterByFormula=OR(IF(FIND(%22' + val + '%22%2C+ARRAYJOIN(Tags%2C+%22+%22))%2C+Link)%2C+IF(FIND(%22DoNotUse%22%2C+ARRAYJOIN(Tags%2C+%22+%22))%2C+Link))';

  switch (search) {
    case 'brownBags':
      search = brownBags;
      break;
    case 'notBrownBags':
      search = notBrownBags;
      break;
    case 'byCohort':
      search = byCohort;
      break;
    case 'byTags':
      search = byTags;
      break;
    default:
      break;
  }
  const g = {
    method: 'GET',
    uri: allRec + search,
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

server.post('/', (req, res) => {
  const p = {
    method: 'POST',
    uri: 'https://api.airtable.com/v0/appMs812ZOuhtf8Un/Table%201',
    headers: {
      Authorization: 'Bearer keySPG804go0FXK3F',
      'content-type': 'application/json',
    },
    body: {
      "fields": {
        Link: req.body.fields.Link,
        Title: req.body.fields.Title,
        Cohort: req.body.fields.Cohort,
        Tags: req.body.fields.Tags
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
    // console.log('Response: ' + JSON.stringify(response));
    // console.log('Body: ' + JSON.stringify(body));
    // console.log(req.body);
    res.send(JSON.stringify(body));
  });
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
