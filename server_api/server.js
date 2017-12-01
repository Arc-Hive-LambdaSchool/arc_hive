const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const port = process.env.PORT || 5000;

const server = express();

mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost/arc_hive', {useMongoClient: true});

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));

server.get('/', (req, res) => {
  console.log('Hello world - get');
  const data = 'hello world - get';
  res.json({data});
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
