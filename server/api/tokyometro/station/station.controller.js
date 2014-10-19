/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /station/:station          ->  show
 * GET     /station/nearby/:station   ->  show
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

function handleError(res, err) {
  return res.send(500, err);
}
