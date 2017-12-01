const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;
const Airtable = require('airtable');
require('dotenv').config();
const thePrecious = process.env.AIR_TABLE_KEY;
const slackModel = require('./slackModel');

Airtable.configure({
  endpointUrl: 'https://api.airtable.com/v0/appMs812ZOuhtf8Un/Table%201',
  apiKey: 'keySPG804go0FXK3F'
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
  /*let base = new Airtable({apiKey: ATKEY}).base('appMs812ZOuhtf8Un');
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
  if (req.body) {
    data2.push(JSON.stringify(req.body.text));
    data = JSON.stringify(req.body.text);
    /*const slackBlob = req.body;
    const newPost = new slackModel(slackBlob);
    fullData.push(newPost);*/
    res.send(data);
    return;
  }
  res.send(data);
});

server.listen(port, () => {
  console.log(`Servs up dude ${port}`);
});
