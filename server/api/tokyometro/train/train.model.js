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
          return prev.concat(findTrainsAtStation(cur, dest, allTrains));
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
  }, [])
  .sort(function(a, b) {
    if (a["odpt:toStation"] === b["odpt:toStation"]) return 0
    if (a["odpt:toStation"] === null) return -1;
    if (b["odpt:toStation"] === null) return 1;
    throw new Error("can never get here.");
  });
}

