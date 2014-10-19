'use strict';

var Tokyometro = require("../tokyometro.model");
var Station = require("../station/station.model");

exports.requestTrainsNearBy = function(station, railway, callback) {
  Tokyometro.requestTrains(function(err, allTrains) {
    Station.requestStationsNearBy(station, railway, function(err, stations) {
      function reduceNearStation(prev, cur, index) {
        var nearTrains = findTrainsAtStation(cur, allTrains);
        if (nearTrains.length > 0)
          prev.push(nearTrains);
        return prev;
      }
      for (var dest in stations) {
        stations[dest] = stations[dest].reduce(reduceNearStation, []);
      }
      callback(undefined, stations);
    });
  });
};

function findTrainsAtStation(station, trains) {
  return trains.reduce(function(prev, cur) {
    if (cur["odpt:fromStation"] === station)
      prev.push(cur);
    return prev
  }, []);
}
