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

mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost/arc_hive', {useMongoClient: true});

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));

server.get('/', (req, res) => {
  console.log('Hello world - get');
  const data = 'hello world - get';
  const data2 = ATKEY;
  /*let base = new Airtable({apiKey: ATKEY}).base('appMs812ZOuhtf8Un');
  base('Table 1').find('recDVfMW2yBtY0Cxi', (err, record) => {
    if (err) {
      console.log(err);
      return res.json({"Error": err.message, "Stack": err.stack});

    }
    console.log(record);
    return res.json({"Record": record});
  });*/
  res.json({data});
});

server.post('/', (req, res) => {
  console.log('Hello world - post');
  let data = 'hello world - post';
  console.log(req.body);
  if (req.body) {
    data = req.body.text;
    res.json({data});
    return;
  }
  res.json({data});
});

server.listen(port, () => {
  console.log(`Servs up dude ${port}`);
});
