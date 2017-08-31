var express = require('express');
var router = express.Router();
var scraper = require('../app/services/scraper');
var axios = require('axios');
var fs = require('fs');
var Hero = require('../app/models/hero');

// LOAD DATA INTO MEMORY
var data = require('../data/heroes.json');
var heroNames = require('../data/heroes-info.json');
var heroesRaw = require('../data/heroes-raw.json');



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

// -------------------------------------------------
router.post('/icy/:hero', (req, res) => {
  // From body, get name and icyUrl
  let hero = req.params.hero;
  let icyUrl = req.body.icyUrl;
  // Scrape icy using new url
  let scrapeUrl = require('../app/services/scrapeUrl');
  scrapeUrl.scrapeIcyUrl(hero, icyUrl).then( (result) => {
    // Find and update hero with new icy builds
    Hero.findOneAndUpdate({name: hero}, {icybuilds: result}, (err, hero) => {
      if(err) console.log(err);
      console.log(hero + " updated..");
      res.redirect("/");
    });
  });
});

// Temporary
var loadJsonIntoDb = function() {
  var heroes = [];
  data.forEach( (hero) => {
    let h = hero[0];
    h.icyUrl = heroesRaw.filter( hh => hh.name === h.name)[0].icyUrl;
    h.wikiUrl = heroesRaw.filter( hh => hh.name === h.name)[0].wikiUrl;
    heroes.push(Hero(h));
  });
  Hero.insertMany( heroes, function(err, results) {
    if(err) throw err;
    console.log("DATABASE: Success!");
  });
}

module.exports = router;
