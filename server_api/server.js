const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const port = process.env.PORT || 3001;

const server = express();

mongoose.Promise = global.Promise;
// mongoose.connect('mongodb://localhost/arc_hive', {useMongoClient: true});

server.use(bodyParser.json());
server.use(bodyParser.urlencoded({extended: true}));

server.get('/', (req, res) => {
  if (err) {
    res.status(422);
    res.json({'Error message: ': err.message, 'Error stack: ': err.stack});
    return;
  }
  res.json({'Hey, I am up and running!'});
});

server.listen(port, () => {
  console.log(`Servs up dude ${port}`);
});
