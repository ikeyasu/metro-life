/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /station/:station          ->  show
 * GET     /station/nearby/:station   ->  staion nearby
 * GET     /station/raildirection/:station   ->  raildirection at the station
 */

'use strict';

var _ = require('lodash');
var Tokyometro = require('../tokyometro.model');
var Station = require('./station.model');

// Get station info
exports.show = function(req, res) {
  Tokyometro.requestStation(
      req.params.station, function(err, json){
    if(err) { return handleError(res, err); }
    if(!json) { return res.send(404); }
    return res.json(json);
  });
};

// Get stations near by the specified station
exports.nearby = function(req, res) {
  Station.requestStationsNearBy(
      req.params.station,
      Station.convertToRailway(req.params.station),
  function(err, json){
    if(err) { return handleError(res, err); }
    if(!json) { return res.send(404); }
    return res.json(json);
  });
};

// Get stations near by the specified station
exports.raildirection = function(req, res) {
  Station.requestRailDirection(
      req.params.station,
  function(err, json){
    if(err) { return handleError(res, err); }
    if(!json) { return res.send(404); }
    return res.json(json);
  });
};

// Get station's timetable
exports.timetable = function(req, res) {
  var type = req.params.type ? req.params.type : "weekdays";
  Tokyometro.request({
    "rdf:type": "odpt:StationTimetable",
    "odpt:station": req.params.station,
    "odpt:railDirection": Station.convertToRailDirection(req.params.direction)
  }, function(err, json){
    if(err) { return handleError(res, err); }
    if(!json) { return res.send(404); }
    var ret = json.reduce(function(prev, cur) {
      if (type === "saturdays" && cur["odpt:saturdays"]) {
        return cur["odpt:saturdays"];
      } else if (type === "holidays" && cur["odpt:holidays"]) {
        return cur["odpt:holidays"];
      } else if (type === "weekdays" && cur["odpt:weekdays"]) {
        return cur["odpt:weekdays"];
      }
      return prev;
    }, null);
    return res.json(ret);
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
