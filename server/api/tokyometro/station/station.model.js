'use strict';

var _ = require('lodash');
var Tokyometro = require("../tokyometro.model");
var StationTable = require("../../../config/data/stations.20141103");

exports.request = function(station, callback) {
  return Tokyometro.request({"rdf:type": "odpt:Station", "owl:sameAs": station}, callback);
};

exports.convertToJapaneseName = function(station) {
  var stationIndex = _(StationTable.data).findIndex(function(s) {
    var splittedTarget = station.split(/[.:]/);
    var splitted = s["owl:sameAs"].split(/[.:]/);
    return splitted[4] === splittedTarget[4];
  });
  return StationTable.data[stationIndex]["dc:title"];
};

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
    result[dest2] = stations.slice(0, index).map(function(x) {
      return x["odpt:station"];
    }).reverse();
    result[dest1] = stations.slice(index + 1, stations.length).map(function(x) {
      return x["odpt:station"];
    });
    callback(null, result);
  });
};


exports.requestRailDirection = function(station, callback) {
  Tokyometro.request({"rdf:type": "odpt:StationTimetable", "odpt:station": station})
    .then(function(res) {
      callback(null, _.uniq(res.reduce(function(prev, cur) {
        prev.push({
          "odpt:railDirection": cur["odpt:railDirection"],
          'dc:title': exports.convertToJapaneseName(
              exports.convertRailDirectionToTerminalStation(
                cur["odpt:railDirection"], station))
        });
        return prev;
      }, [])));
    });
};

exports.convertToRailway = function(station) {
  var splitted = station.split(/[.:]/)
  return splitted[0] + "." + "Railway:" + splitted[2] + "." + splitted[3];
}

exports.convertRailDirectionToTerminalStation = function(raildirection, station) {
  // odpt.RailDirection:TokyoMetro.Nakano and odpt.Station:TokyoMetro.Tozai.Urayasu
  // => odpt.Station:TokyoMetro.Tozai.Nakano
  var splittedStation = station.split(/[.:]/)
  var splittedRaildirection = raildirection.split(/[.:]/)
  return splittedStation[0] + "." + "Station:" + splittedStation[2] + "." + splittedStation[3] + "." + splittedRaildirection[3];
}

exports.convertToRailDirection = function(station) {
  var splitted = station.split(/[.:]/)
  return splitted[0] + "." + "RailDirection:" + splitted[2] + "." + splitted[4];
}
