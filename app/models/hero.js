var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var heroSchema = new Schema( {
  name: String,
  abilities: [ {
    name: String,
    desc: String,
    img: String
  }],
  talents: [{
    lvl: String,
    talents: [{
      name: String,
      desc: String,
      img: String
    }]
  }],
  image: String,
  webm: String,
  icyUrl: String,
  wikiUrl: String,
  icybuilds: [{
    id: String,
    name: String,
    talents: [{
      id: String,
      name: String
    }]
  }],
  updated_at: Date
});

heroSchema.pre('save', function(next) {
  let currentDate = new Date();
  this.updated_at = currentDate;
  next();
});

module.exports = mongoose.model('Hero', heroSchema);
