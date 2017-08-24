var express    = require('express');        // call express
var app        = express();                 // define our app using express
var bodyParser = require('body-parser');
var heroes = require('./routes/heroes');
var scrape = require('./routes/scrape');



app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 1337;        // set our port

var router = express.Router();
var fs = require('fs');

// Set view Engine
app.set('view engine', 'ejs');

// LOAD DATA INTO MEMORY
var data = require('./data/heroes.json');
var heroNames = require('./data/heroes-info.json');
var heroesRaw = require('./data/heroes-raw.json');

// Database/Mongoose related
var db = require('./app/services/db');
var Hero = require('./app/models/hero');
db.initialize();

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

// GET ALL HEROES
app.get( '/', function(req, res) {
  Hero.find({}, function(err, heroes) {
  if (err) throw err;
    res.render('pages/index.ejs', {heroes: heroes});
  });
});

// GET HERO
app.get('/:hero', function(req, res) {
  // Get single hero from db
  Hero.find( { name: req.params.hero}, (err, hero) => {
    res.render('pages/hero.ejs', {selected: hero[0] });
  });

});

// UPDATE HERO
app.post('/:hero', function(req, res) {
  Hero.findOneAndUpdate({ name: req.body.name },
    { name: req.body.name,icyUrl: req.body.icyUrl,wikiUrl: req.body.wikiUrl,webm: req.body.webm },
       function(err, hero) {
    if (err) throw err;
    // we have the updated user returned to us
    console.log("Updated hero: ", req.body.name);
    res.redirect("/");
  });
});

//app.use('/api', router);
app.use('/api/heroes', heroes);
app.use('/scrape', scrape);

app.listen(port);
console.log('Magic happens on port ' + port);
