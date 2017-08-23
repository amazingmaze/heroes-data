
var heroUrls = require('../../data/heroes-raw.json');
var axios = require('axios');
var lodash = require('lodash');
var cheerio = require('cheerio');

var scrapeIcyUrl = function(heroName) {
  let icyUrl = heroUrls.filter( hero => {
    return (hero.name === heroName);
  })[0].icyUrl;
  let responsePromise = axios.get(icyUrl)
    .then( response => {
      let html = response.data;
      var $ = cheerio.load(html);
      let builds = $('div.heroes_tldr_talents');
      let buildsObj = [];

      let buildNames = $('div.heroes-tldr').find('h4');

      builds.each( (i, build) => {
        let talentsObj = [];
        let buildName = $(build).prev().text();
        buildName = buildName.substring(0, buildName.indexOf('(')).trim();

        let talents = $(build).find('a.heroes_tldr_talent_tier');
        talents.each( (idx, talent) => {
          let name = $(talent).find('img').attr('alt');
          name = name.replace('Icon', '').trim();
          talentsObj.push({
            id: idx,
            name: name
          });
        });
        buildsObj.push({
          id: i,
          name: buildName,
          talents: talentsObj
        });
      });

      return buildsObj;

    })
    .catch( err => {console.log(err) })

    return responsePromise;
}

// 2#. Scrape information from https://heroesofthestorm.gamepedia.com/Valla for each hero
var scrapeHeroWiki = function(heroName) {
  console.log(`Scraping ${heroName}....`);
  let wikiUrl = heroUrls.filter( hero => {
    return (hero.name === heroName);
  })[0].wikiUrl;
  var responsePromise = axios.get(wikiUrl)
  .then(function(response) {
    let html = response.data;

    var $ = cheerio.load(html);
    let hero = {};
    hero = [ {
      name: lodash.capitalize(heroName),
      abilities: scrapeAbilities($),
      talents: scrapeTalents($),
      image: scrapeImage($)
    }];

    return hero;
  })
  .catch(function(error) {console.log(error);})

  return responsePromise;
}


module.exports = {
  scrapeIcyUrl: scrapeIcyUrl,
  scrapeHeroWiki: scrapeHeroWiki
}
