/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /railways/          ->  index
 */

'use strict';

var Tokyometro = require('../tokyometro.model');
var Railway = require('./railway.model.js');

// Get station info
exports.index = function(req, res) {
  Railway.requestWithJapaneseName({"rdf:type": "odpt:Railway"})
    .then(function(json){
    return res.json(json);
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
