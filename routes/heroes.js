
var express = require('express');
var router = express.Router();
var Hero = require('../app/models/hero');
var counters = require('./counters/counters');

/*** EXTERNAL API ROUTES **/
router.get('/', function(req, res) {
  Hero.find( {}, (err, heroes) => {
    if(err) console.log(err);
    res.json(heroes);
  });

});

router.get('/names', function(req, res) {
  res.json(data.map( hero => hero[0].name));
});

router.get('/:hero', function(req, res) {
  var lodash = require('lodash');
  // Get hero from db
  Hero.find( {name: lodash.capitalize(req.params.hero)}, (err, hero) => {
    if(err) console.log(err);
    res.json(hero);
  });
});

router.use('/counters', counters);

module.exports = router;
