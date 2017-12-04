// require('dotenv').load();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;
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
let data2 = [];
const fullData = [];

mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost/arc_hive', {useMongoClient: true});

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));

server.get('/', (req, res) => {
  console.log('Hello world - get');
  const data = 'hello world - get';
  /*let base = new Airtable({apiKey: thePrecious}).base('appMs812ZOuhtf8Un');
  base('Table 1').find('recDVfMW2yBtY0Cxi', (err, record) => {
    if (err) {
      console.log(err);
      return res.json({"Error": err.message, "Stack": err.stack});

    }
    console.log(record);
    return res.json({"Record": record});
  });*/
  if (data2 && fullData) {
    res.json({data2, fullData});
    return;
  }
  res.send(data);
});

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

server.listen(port, () => {
  console.log(`Servs up dude ${port}`);
});
