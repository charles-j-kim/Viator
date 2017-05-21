const mongoose = require('mongoose');
const findOrCreate = require('mongoose-find-or-create');
// mongoose.connect('mongodb://localhost/legacy');
mongoose.connect('mongodb://infamousfrogs:Hackreactor21@ds143191.mlab.com:43191/viator-legacy');
mongoose.Promise = require('bluebird');
const db = mongoose.connection;

db.on('error', () => {
  console.log('mongoose connection error');
});

db.once('open', () => {
  console.log('mongoose connected successfully');
});


const userSchema = mongoose.Schema({

  user: String,
  month: String,
  day: String,
  year: String,
  Airline: String,
  flight: String,
  destination: String,
  returnFlight: String,
  returnMonth: String,
  returnDay: String,
  returnMonth: String

});

const itinerarySchema = mongoose.Schema({

  user: String,
  airline: String,
  flightNumber: String,
  date: String,
  primary: String,
  secondary: String,
  url: String,
  type: String

});

userSchema.plugin(findOrCreate);


const historyStorage = mongoose.model('historyStorage', userSchema);
const itineraryStorage = mongoose.model('itineraryStorage', itinerarySchema);


module.exports = {
  User: historyStorage,
  Itinerary: itineraryStorage
};