const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;
const ATKey = import('../.env');
const AirTable = process.env.AIR_TABLE_KEY;

const server = express();

mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost/arc_hive', {useMongoClient: true});

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));

server.get('/', (req, res) => {
  console.log('Hello world - get');
  const data = 'hello world - get';
  const data2 = process.env;
  res.json({data, data2});
});

server.post('/', (req, res) => {
  console.log('Hello world - post');
  let data = 'hello world - post';
  console.log(req.body);
  if (req.body) {
    data = req.body;
  }
  res.json({data});
});

server.listen(port, () => {
  console.log(`Servs up dude ${port}`);
});
