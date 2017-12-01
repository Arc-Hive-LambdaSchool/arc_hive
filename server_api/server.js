const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;
const Airtable = require('airtable');
require('dotenv').config();
// const AirTable = process.env.AIR_TABLE_KEY;
const ATKEY = 'keySPG804go0FXK3F';

Airtable.configure({
  endpointUrl: 'https://api.airtable.com/v0/appMs812ZOuhtf8Un/Table%201',
  apiKey: ATKEY
});
let base = Airtable.base('appMs812ZOuhtf8Un');

const server = express();
let data2 = {};

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
  if (data2) {
    res.json({data2});
    return;
  }
  res.send(data);
});

server.post('/', (req, res) => {
  console.log('Hello world - post');
  let data = 'hello world - post';
  console.log(req.body);
  if (req.body) {
    data2 = JSON.stringify(req.body.text);
    res.send(data2);
    return;
  }
  res.send(data);
});

server.listen(port, () => {
  console.log(`Servs up dude ${port}`);
});
