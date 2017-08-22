var express = require('express');
var router = express.Router();
var scraper = require('../app/services/scraper');
var axios = require('axios');

// LOAD DATA INTO MEMORY
var data = require('../data/heroes.json');
var heroNames = require('../data/heroes-info.json');

/*** INTERNAL AUTHORIZED (TODO). **/
router.get('/heroes', function(req, res) {
  let heroesPromises = heroNames.map(function(hero){
    return scraper.getHero(hero.name);
  });

  Promise.all(heroesPromises).then( function(heroes) {
    fs.writeFile('./data/heroes.json', JSON.stringify(heroes), 'utf8');
    res.json(heroes);
  })
});

// TODO: Get images from icy-veins or other source
router.get('/heroes/images', function(req, res) {

});

// TODO: Get builds from from icy-veins
router.get('/heroes/icy-builds/:hero', function(req, res) {
  scraper.scrapeIcyBuilds(req.params.hero).then( value => {
    console.log(value);
  })
});

router.get('/heroes/info', function(req, res) {
  scraper.getHeroesInfo().then( function(value) {
    fs.writeFile('./data/heroes-info.json', JSON.stringify(value), 'utf8');
    res.json(value);
  });
});

router.get('/heroes/names', function(req, res) {
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

module.exports = router;
