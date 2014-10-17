/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /trains              ->  list of all trains
 * GET     /trains/:id          ->  show
 * GET     /trains/delayed      ->  list of delayed trains
 */

'use strict';

var _ = require('lodash');
var Tokyometro = require('../tokyometro.model');

// Get station info
exports.show = function(req, res) {
  Tokyometro.requestStation(
      req.params.id, function(err, json){
    if(err) { return handleError(res, err); }
    if(!json) { return res.send(404); }
    return res.json(json);
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
