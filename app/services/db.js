var config = require('../../config');
var mongoose = require('mongoose');

var database = {
  initialize(){
    var uri = "mongodb://192.168.1.144:27017/heroes";
    mongoose.connect(uri);
    db = mongoose.connection;
    db.on('error', console.error.bind(console, 'connection error'));
    db.once('open', function() {
      console.log("CONNECTED TO DB!");
      return db;
    });
  },
  close(){
    console.log("DATABASE CONNECTION CLOSED!");
    db.close();
  }
}

module.exports = database;
