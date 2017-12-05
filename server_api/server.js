// require('dotenv').load();
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

Airtable.configure({
  endpointUrl: 'https://api.airtable.com/v0/appMs812ZOuhtf8Un/Table%201',
  apiKey: thePrecious
});
let base = Airtable.base('appMs812ZOuhtf8Un');

const server = express();
let data2 = [];
const fullData = [];

mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost/arc_hive', {useMongoClient: true});

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));

const g = {
  method: 'GET',
  uri: 'https://api.airtable.com/v0/appMs812ZOuhtf8Un/Table%201',
  headers: {
    Authorization: 'Bearer keySPG804go0FXK3F',
    'content-type': 'application/json',
    'id': 'recDVfMW2yBtY0Cxi'
  }
};

server.get('/', (req, res) => {
  request(g, (error, response, body) => {
    if (error) {
      console.log(error);
      return;
    }
    console.log('Response: ' + JSON.stringify(response));
    console.log('Body: ' + body);
    res.send(body);
  });
});

server.post('/', (req, res) => {
  // console.log(req.body.fields.Link);
  const rbf = req.body.fields;
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

/*
server.post('/', (req, res) => {
  let data = 'hello world - post';
  let title;
  let link;
  let cohort;
  const tags = [];
  if (req.body) {
    data2.push(JSON.stringify(req.body.text));
    data = JSON.stringify(req.body.text);
    const slackBlob = req.body;
    const infoSplit = slackBlob.text.split(', ');
    let index = infoSplit.length;
    for (let i = 0; i < infoSplit.length; i++) {
      // console.log(index);
      if (i <= 6) {
        switch (infoSplit[i].toLowerCase()) {
          case 'title':
            title = infoSplit[i+1];
            // console.log(title);
            break;
          case 'link':
            link = infoSplit[i+1];
            // console.log(link);
            break;
          case 'cohort':
            cohort = infoSplit[i+1];
            // console.log(cohort);
            break;
          case 'tags':
            let index = i;
            // console.log(tags);
            // console.log(index);
            break;
          default:
            break;
        }
      } else {
        tags.push(infoSplit[i]);
        // console.log(tags);
      }
    }
    let base = new Airtable({apiKey: 'thePrecious'})
    .base('appMs812ZOuhtf8Un');
    console.log(title);
    console.log(link);
    console.log(cohort);
    console.log(tags);

    base('Table 1').create({
      "Title":  title,
      "YouTube link": link,
      "cohort": cohort,
      "tags": tags
    }, (err, record) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(record.getId());
});
    res.send(data.concat(fullData));
    return;
  }
  res.send(data);
});
*/

server.listen(port, () => {
  console.log(`Servs up dude ${port}`);
});
