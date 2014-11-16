/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /trains                   ->  list of all trains
 * GET     /trains/:id               ->  show
 * GET     /trains/delayed           ->  list of delayed trains
 * GET     /trains/nearby/:station   ->  list of trains near by the station
 * GET     /trains/timetable/:train?type=:type ->  timetable
 */

'use strict';

var _ = require('lodash');
var Tokyometro = require('../tokyometro.model');
var Train = require('./train.model');
var Station = require('../station/station.model');

// Get list
exports.index = function(req, res) {
  Tokyometro.requestTrains(function(err, json){
    if (err) return res.send(500, err);
    return res.json(200, json);
  });
};

// Get delayed trains
exports.delayed = function(req, res) {
  Tokyometro.requestTrains(function(err, json){
    if (err) return res.send(500, err);
    return res.json(200, json.reduce(function(a, b){
      if (b['odpt:delay'] > 0)
        return a.concat(b);
      return a
    }, []));
  });
};

// Get a single
exports.show = function(req, res) {
  // Not implemented yet
  return res.send(500);
};

// Get trains nearby the staton
exports.nearby = function(req, res) {
  Train.requestTrainsNearBy(
    req.params.station,
    Station.convertToRailway(req.params.station),
  function(err, json){
    if (err) return res.send(500, err);
    return res.json(200, json);
  });
};

// Get train's timetable
exports.timetable = function(req, res) {
  var type = req.params.type ? req.params.type : "weekdays";
  Tokyometro.request({
    "rdf:type": "odpt:TrainTimetable",
    "odpt:train": req.params.train
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
