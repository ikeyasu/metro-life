'use strict';

var Tokyometro = require("../tokyometro.model");
var LENGTH_NEAR_BY = 5;

exports.requestStationsNearBy = function(station, railway, callback) {
  Tokyometro.requestStationsFromRailway(railway, function(err, res) {
    var stations = res[0]["odpt:stationOrder"];
    var index = stations.reduce(function(prev, cur) {
      if (cur["odpt:station"] === station) {
        return cur["odpt:index"];
      }
      return prev;
    }, -1);

    var dest1 =  stations[0] ["odpt:station"];
    var dest2 =  stations[stations.length - 1] ["odpt:station"];
    var result = {};
    var startIndex = Math.max(index - LENGTH_NEAR_BY, 0);
    result[dest2] = stations.slice(startIndex, index).map(function(x) {
      return x["odpt:station"];
    }).reverse();
    var endIndex = Math.min(stations.length, index + LENGTH_NEAR_BY + 1);
    result[dest1] = stations.slice(index + 1, endIndex).map(function(x) {
      return x["odpt:station"];
    });
    callback(null, result);
  });
};


exports.requestRailDirection = function(station, callback) {
  Tokyometro.request({"rdf:type": "odpt:StationTimetable", "odpt:station": station},
      function(err, res) {
        callback(null, _.uniq(res.reduce(function(prev, cur) {
          prev.push(cur["odpt:railDirection"]);
          return prev;
        }, [])));
      });
};

exports.convertToRailway = function(station) {
  var splitted = station.split(/[.:]/)
  return splitted[0] + "." + "Railway:" + splitted[2] + "." + splitted[3];
}

exports.convertToRailDirection = function(station) {
  var splitted = station.split(/[.:]/)
  return splitted[0] + "." + "RailDirection:" + splitted[2] + "." + splitted[4];
}
