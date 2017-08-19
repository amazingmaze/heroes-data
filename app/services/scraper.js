
var axios = require('axios');

// #1. Get all hero names. https://api.hotslogs.com/Public/Data/Heroes their group and subgroup
var getHeroesInfo = function () {
  var heroes = axios.get('https://api.hotslogs.com/Public/Data/Heroes')
    .then(function (response) {
      let heroNamesAndRoles = [];
      heroNamesAndRoles = response.data.map( function(hero) {
        return {
          name: hero.PrimaryName,
          role: hero.Group,
          subrole: hero.SubGroup
        };
      });
      return heroNamesAndRoles;
    })
    .catch(function (error) {
      console.log(error);
    });
    return heroes;
}

var getHeroes = function() {
  return getHeroesInfo().then(function(heroes){
    return new Promise( function(resolve, reject) {
      let listOfHeroes = heroes.slice(1-4);
      let promises = listOfHeroes.forEach(function(hero){
        return scrapeHeroInfo(hero.name).then(function(heroObj){
          heroObj.role = hero.role;
          heroObj.subrole = hero.subrole;
          return heroObj;
        })
      });
      resolve(promises);
    });
  });
}

var scrapeAbilities = function($) {

  let abilities = [];
  $('div.skill').each(function(i, element) {

    let skill = {};
    skill.name = $(element).find('span.skill-name')[0].children[0].data;
    let details = $(element).find('div.skill-details')[0];

    if(details.children.length > 1){
      skill.details = {};
      if( $(element).find('span.skill-cost').length ){
        skill.details.cost = $(element).find('span.skill-cost')[0].children[0].data;
      }
      skill.details.cd = $(element).find('span.skill-cooldown')[0].children[0].data;
    }

    let desc = '';
    if($(element).find('div.skill-description')[0].children.length > 1) {
      skill.desc = $(element).find('div.skill-description').text();
    } else {
      skill.desc = $(element).find('div.skill-description')[0].children[0].data;
    }
    skill.img = $(element).find('div.skill-image').children().first().children().first().attr('src');

    abilities.push(skill);
  });

  return abilities;
}

var scrapeTalents = function($){
  let talents = [];
  $('div.talent-tier').each(function(i, element) {
    let talentTier = {
      lvl: '',
      talents: []
    };

    talentTier.lvl = $(element).children().first().text();
    $(element).find('.talent').each( function(i, element) {
      talentTier.talents.push({
        name: $(element).find('.talent-name').text(),
        desc: $(element).find('.talent-description').text(),
        img:  $(element).find('.talent-icon').children().first().children().first().attr('src')
      });
    });
    talents.push(talentTier);
  });

  return talents;
}

// Not fully operational. Not all heroes are working. Good for scraping older heroes, newly added heroes
// tend to have other formats on their webm links. For simplicity these links should be added manually.
// Edge-cases exist aswell, formatting on e g. Li-Ming doesn't fit into below function. TODO: either manually add or look into
// improving the function.
var scrapeWebm = function($, heroName) {
  let skinName = $('span.nobreak.ajaxoutertt').first().parent().children().first().children().first().attr('alt');
  var lodash = require('lodash');
  skinName = skinName.replace(lodash.capitalize(heroName), '');
  skinName = skinName.replace('.jpg', '');
  skinName = lodash.camelCase(skinName);
  skinName = skinName.replace(' ', '');
  skinName = lodash.lowerCase(heroName) + '_' + skinName + '.webm';
  let url = 'http://media.blizzard.com/heroes/videos/heroes/skins/' + skinName;
  //console.log(url);
  // example: http://media.blizzard.com/heroes/videos/heroes/skins/artanis_hierarchOfTheDaelaam.webm
  return url;
}

var scrapeImage = function($){
  return $('span.nobreak.ajaxoutertt').first().parent().children().first().children().first().attr('src');
}

var scrapeIcyBuilds = function(heroInput) {
  // Convert formatting
  console.log("HERO (before): ", heroInput);
  heroInput = heroInput.replace(/_/g, '-').replace('ú', 'u').replace(/\s/g, '-').replace('\'', '' ).replace(/\./g, '');
    //
  console.log("HERO (after): ", heroInput);
  let responseHtml = axios.get(`https://www.icy-veins.com/heroes/${heroInput}-build-guide`)
    .then( response => {
      let html = response.data;
      var cheerio = require('cheerio');
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

    return responseHtml;
}

// 2#. Scrape information from https://heroesofthestorm.gamepedia.com/Valla for each hero
var scrapeHeroInfo = function(heroInput) {
  console.log(`Scraping ${heroInput}....`);

  var lodash = require('lodash');
  var responseHtml = axios.get('https://heroesofthestorm.gamepedia.com/' + heroInput)
  .then(function(response) {
    let html = response.data;
    var cheerio = require('cheerio');
    var $ = cheerio.load(html);
    let hero = {};
    hero = [ {
      name: lodash.capitalize(heroInput),
      abilities: scrapeAbilities($),
      talents: scrapeTalents($),
      image: scrapeImage($),
      webm: scrapeWebm($, heroInput),
      icybuilds: {}
    }];

    //console.log(hero);
    return hero;
  }).then( (hero) => {
    return scrapeIcyBuilds(lodash.toLower(hero[0].name)).then( result => {
        hero[0].icybuilds = result;
        return hero;
    });

  })
  .catch(function(error) {console.log(error);})

  return responseHtml;
}

module.exports = {
  getHero: scrapeHeroInfo,
  getHeroes: getHeroes,
  getHeroesInfo: getHeroesInfo,
  scrapeIcyBuilds: scrapeIcyBuilds
}
