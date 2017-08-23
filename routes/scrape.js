var express = require('express');
var router = express.Router();
var scraper = require('../app/services/scraper');
var axios = require('axios');
var fs = require('fs');

// LOAD DATA INTO MEMORY
var data = require('../data/heroes.json');
var heroNames = require('../data/heroes-info.json');

/*** INTERNAL AUTHORIZED (TODO). **/
router.get('/heroes', function(req, res) {
  let heroesPromises = heroNames.map(function(hero){
    return scraper.getHero(hero.name);
  });

  Promise.all(heroesPromises).then( function(heroes) {
    fs.writeFile('../data/heroes.json', JSON.stringify(heroes), 'utf8');
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
    fs.writeFile('../data/heroes-info.json', JSON.stringify(value), 'utf8');
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

router.get('/heroes/:hero', function(req, res) {
    scraper.getHero(req.params.hero).then( function(value) {
      res.json(value);
    });
});

// Post-req to scrape hero links etc from the data file.
router.post('/info/raw-fresh', function(req, res) {
  let heroesInfo = data.map((hero) => {
    hero = hero[0];
    let wikiUrl = `https://heroesofthestorm.gamepedia.com/${hero.name}`;
    var lodash = require('lodash');
    let newHeroName = lodash.toLower(hero.name.replace(/_/g, '-').replace('ú', 'u').replace(/\s/g, '-').replace('\'', '' ).replace(/\./g, ''));
    let icyUrl = `https://www.icy-veins.com/heroes/${newHeroName}-build-guide`;
    let webmUrl =  hero.webm;
    return {
      name: hero.name,
      wikiUrl,
      icyUrl,
      webmUrl
    };
  });
  fs.writeFile('./data/heroes-raw.json', JSON.stringify(heroesInfo), 'utf8');
  res.json(heroesInfo);
});

router.get('/info/raw', function(req, res) {
  let raw = require('../data/heroes-raw.json');
  res.json(raw);
});

router.get('/info/icy/:hero', function(req, res) {
  let scrapeUrl = require('../app/services/scrapeUrl');
  scrapeUrl.scrapeIcyUrl(req.params.hero).then(function(value){
    res.json(value);
  });

});

router.get('/info/wiki/:hero', function(req, res) {
  let scrapeUrl = require('../app/services/scrapeUrl');
  scrapeUrl.scrapeHeroWiki(req.params.hero).then(function(value){
    res.json(value);
  });

});

module.exports = router;
