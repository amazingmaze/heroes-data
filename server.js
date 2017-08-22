var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var heroes = require('./routes/heroes');
var scrape = require('./routes/scrape');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 1337;        // set our port

var router = express.Router();

var fs = require('fs');

// Set view Engine
app.set('view engine', 'ejs');

// LOAD DATA INTO MEMORY
var data = require('./data/heroes.json');
var heroNames = require('./data/heroes-info.json');

// CRUD-methods
app.get( '/', function(req, res) {
  // Get all heroes from DB
  // temp: using from MEMORY
  res.render('pages/index.ejs', {heroes: heroNames});

});
app.get( '/:hero', function(req, res) {
  // Get single hero from db
});
app.post( '/:hero', function(req, res) {
  // Update hero in DB
});

//app.use('/api', router);
app.use('/api/heroes', heroes);
app.use('/scrape', scrape);

app.listen(port);
console.log('Magic happens on port ' + port);
