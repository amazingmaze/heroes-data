var express = require('express');
var router = express.Router();
var scraper = require('../../app/services/scrapeCounters');

router.get('/strong/:hero', function(req, res) {
  scraper.scrapeStrongAgainst(req.params.hero, 5).then( value => {
    res.json(value);
  })
});

router.get('/weak/:hero', function(req, res) {
  scraper.scrapeWeakAgainst(req.params.hero, 5).then( value => {
    res.json(value);
  })
});

router.get('/with/:hero', function(req, res) {
  scraper.scrapeGoodWith(req.params.hero, 5).then( value => {
    res.json(value);
  })
});

router.get('/:hero', function(req, res){
  scraper.scrapeStrongAgainst(req.params.hero, 5)
    .then( value => {
    return { strong: value};
  }).then(hero => {
    scraper.scrapeWeakAgainst(req.params.hero, 5)
    .then(value => {
      hero.weak = value;
      return hero;
    })
    .then(hero => {
      scraper.scrapeGoodWith(req.params.hero, 5)
      .then( value => {
        hero.with = value;
        return hero;
      }).then( hero => {
        res.json(hero);
      });
    })
  })
});
module.exports = router;
