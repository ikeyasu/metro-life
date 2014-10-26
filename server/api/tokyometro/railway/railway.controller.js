/**
 * Using Rails-like standard naming convention for endpoints.
 * GET     /railways/          ->  index
 */

'use strict';

var Tokyometro = require('../tokyometro.model');

// Get station info
exports.index = function(req, res) {
  Tokyometro.request({"rdf:type": "odpt:Railway"}, function(err, json){
    if(err) { return handleError(res, err); }
    if(!json) { return res.send(404); }
    return res.json(json);
  });
};

function handleError(res, err) {
  return res.send(500, err);
}
