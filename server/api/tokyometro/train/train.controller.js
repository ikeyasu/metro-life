/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /trains              ->  list of all trains
 * GET     /trains/:id          ->  show
 * GET     /trains/delayed      ->  list of delayed trains
 */

'use strict';

var _ = require('lodash');
var Tokyometro = require('../tokyometro.model');

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
  return res.send(500, err);
};

function handleError(res, err) {
  return res.send(500, err);
}
