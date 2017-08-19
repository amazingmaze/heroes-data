var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var axios = require('axios');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 1337;        // set our port

var router = express.Router();
var scraper = require('./app/services/scraper');

var fs = require('fs');

// LOAD DATA INTO MEMORY
var data = require('./data/heroes.json');
var heroNames = require('./data/heroes-info.json');

/*** EXTERNAL API ROUTES **/
router.get('/heroes', function(req, res) {
  res.json(data);
});

router.get('/heroes/names', function(req, res) {
  res.json(data.map( hero => hero[0].name));
});

router.get('/heroes/:hero', function(req, res) {
  var lodash = require('lodash');
  res.json(data.filter( hero => hero[0].name === lodash.capitalize(req.params.hero) ));
});


/*** INTERNAL AUTHORIZED (TODO) ONLY SCRAPER LINKS. **/
router.get('/scrape/heroes', function(req, res) {
  let heroesPromises = heroNames.map(function(hero){
    return scraper.getHero(hero.name);
  });

  Promise.all(heroesPromises).then( function(heroes) {
    fs.writeFile('./data/heroes.json', JSON.stringify(heroes), 'utf8');
    res.json(heroes);
  })
});

// TODO: Get images from icy-veins or other source
router.get('/scrape/heroes/images', function(req, res) {

});

// TODO: Get builds from from icy-veins
router.get('/scrape/heroes/icy-builds/:hero', function(req, res) {
  scraper.scrapeIcyBuilds(req.params.hero).then( value => {
    console.log(value);
  })
});

router.get('/scrape/heroes/info', function(req, res) {
  scraper.getHeroesInfo().then( function(value) {
    fs.writeFile('./data/heroes-info.json', JSON.stringify(value), 'utf8');
    res.json(value);
  });
});

router.get('/scrape/heroes/names', function(req, res) {
  scraper.getHeroesInfo().then( function(value) {
    res.json(value.map(function(hero) {
      return hero.name;
    }));
  });
});

router.get('/scrape/heroes/:hero', function(req, res) {
    scraper.getHero(req.params.hero).then( function(value) {
      res.json(value);
    });
});

/*** ------------------------------------------ **/

app.use('/api', router);

app.listen(port);
console.log('Magic happens on port ' + port);
