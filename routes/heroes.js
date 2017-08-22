
var express = require('express');
var router = express.Router();

// LOAD DATA INTO MEMORY
var data = require('../data/heroes.json');
var heroNames = require('../data/heroes-info.json');

/*** EXTERNAL API ROUTES **/
router.get('/', function(req, res) {
  res.json(data);
});

router.get('/names', function(req, res) {
  console.log("Got into the API atleast");
  res.json(data.map( hero => hero[0].name));
});

router.get('/:hero', function(req, res) {
  var lodash = require('lodash');
  res.json(data.filter( hero => hero[0].name === lodash.capitalize(req.params.hero) ));
});

module.exports = router;
