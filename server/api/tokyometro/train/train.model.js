'use strict';

var Tokyometro = require("../tokyometro.model");
var Station = require("../station/station.model");

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/*jshint -W083 */
exports.requestTrainsNearBy = function(station, railway, callback) {
  Tokyometro.requestTrains(function(err, allTrains) {
    Station.requestStationsNearBy(station, railway, function(err, stations) {
      for (var dest in stations) {
        stations[dest] = stations[dest].reduce(function (prev, cur, index) {
          var nearTrains = findTrainsAtStation(cur, dest, allTrains);
          if (nearTrains.length > 0)
            prev.push(nearTrains);
          return prev;
        }, []);
      }
      callback(undefined, stations);
    });
  });
};

function findTrainsAtStation(station, destStation, trains) {
  return trains.reduce(function(prev, cur) {
    if (cur["odpt:fromStation"] === station &&
        cur["odpt:railDirection"] === Station.convertToRailDirection(destStation))
      prev.push(cur);
    return prev
  }, []);
}

var TrainTimetableSchema = new Schema({
  trainNumber: String,
  json: String
});

exports.TrainTimetable = mongoose.model('TrainTimetable', TrainTimetableSchema);
