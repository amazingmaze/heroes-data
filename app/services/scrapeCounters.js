var axios = require('axios');
var cheerio = require('cheerio');

const url = 'https://www.heroescounters.com/hero/';

var scrapeStrongAgainst = function(hero, length=5) {
  let responsePromise = axios.get(url + formatName(hero))
    .then( response => {
        let $ = cheerio.load(response.data);
        let counterlist = $('ul.counterlist-good').find('div.counter-box');
        let heroNames = [];
        counterlist.each( (i, hero) => {
          if(i >= length){
            return false;
          }
          let heroObj = {};
          heroObj.name = $(hero).find('h3').children().first().text();
          heroObj.score = $(hero).find('span.counter-box-points').children().first().text();
          heroObj.img = 'https://www.heroescounters.com' + $(hero).find('span.counter-box-avatar-frame').children().first().attr('src');
          heroNames.push(heroObj);
        });
        return heroNames;
    }).catch( err => {console.log(err) });

    return responsePromise;
};

var scrapeWeakAgainst = function(hero, length=5) {
  let responsePromise = axios.get(url + formatName(hero))
    .then( response => {
        let $ = cheerio.load(response.data);
        let counterlist = $('ul.counterlist-bad').find('div.counter-box');
        let heroNames = [];
        counterlist.each( (i, hero) => {
          if(i >= length){
            return false;
          }
          let heroObj = {};
          heroObj.name = $(hero).find('h3').children().first().text();
          heroObj.score = $(hero).find('span.counter-box-points').children().first().text();
          heroObj.img = 'https://www.heroescounters.com' + $(hero).find('span.counter-box-avatar-frame').children().first().attr('src');
          heroNames.push(heroObj);
        });
        return heroNames;
    }).catch( err => {console.log(err) });

    return responsePromise;
};

var scrapeGoodWith = function(hero, length=5) {
  let responsePromise = axios.get(url + formatName(hero))
    .then( response => {
        let $ = cheerio.load(response.data);
        let counterlist = $('ul.counterlist-together').find('div.counter-box');
        let heroNames = [];
        counterlist.each( (i, hero) => {
          if(i >= length){
            return false;
          }
          let heroObj = {};
          heroObj.name = $(hero).find('h3').children().first().text();
          heroObj.score = $(hero).find('span.counter-box-points').children().first().text();
          heroObj.img = 'https://www.heroescounters.com' + $(hero).find('span.counter-box-avatar-frame').children().first().attr('src');
          heroNames.push(heroObj);
        });
        return heroNames;
    }).catch( err => {console.log(err) });

    return responsePromise;
};

var formatName = function(name){
  return name.replace(/[^a-z]/gi,'').toLowerCase();
}

module.exports = {
  scrapeStrongAgainst: scrapeStrongAgainst,
  scrapeWeakAgainst: scrapeWeakAgainst,
  scrapeGoodWith: scrapeGoodWith
}
