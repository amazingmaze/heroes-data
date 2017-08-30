const express    = require('express'),
  app        = express(),
  bodyParser = require('body-parser'),
  heroes = require('./routes/heroes'),
  scrape = require('./routes/scrape'),
  morgan = require('morgan'),
  config = require('./config'),
  session = require('express-session');

// Database/Mongoose related
var db = require('./app/services/db');
var Hero = require('./app/models/hero');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(morgan('dev'));

var port = process.env.PORT || 8181;        // set our port
var host = process.argv[2] || '0.0.0.0';
var router = express.Router();

// Set view Engine
app.set('view engine', 'ejs');

// initialize db
db.initialize();
app.use(session( { secret: config.API_SECRET} ));


app.use('/api/heroes', heroes);
// Prevent favicon request. (or just supply one)
app.get('/favicon.ico', function(req, res) {
    res.status(204);
});


function checkAuth(req, res, next){
  if((req.url != '/api/heroes') && (!req.session || !req.session.authenticated)){
    res.render('pages/unauthorised', {status: 403});
    return;
  }
  next();
}

app.get('/login', function(req, res, next) {
  res.render('pages/login')
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

app.post('/login', function(req, res, next) {
  if(req.body.password === config.API_PASSWORD){
    req.session.authenticated = true;
    res.redirect('/');
  } else {
    console.log("Wrong password, sleeping..");
    sleep(1000).then( () => {
      console.log(" .. awoke");
      res.redirect('/login');
    });

  }
});

app.get('/logout', function (req, res, next) {
		delete req.session.authenticated;
		res.redirect('/');
	});

  // GET ALL HEROES
  app.get( '/', function(req, res) {
    Hero.find({}, function(err, heroes) {
    let loggedIn = req.session.authenticated ? true : false;
    if (err) throw err;
      res.render('pages/index.ejs', {heroes: heroes, loggedIn: loggedIn });
    });
  });

app.use(checkAuth);

// GET HERO
app.get('/:hero', function(req, res) {
  // Get single hero from db
  Hero.find( { name: req.params.hero}, (err, hero) => {
    res.render('pages/hero.ejs', {selected: hero[0]});
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

app.use('/scrape', scrape);

app.listen(port, host);
console.log('Magic happens on ' + host + ':' + port);
