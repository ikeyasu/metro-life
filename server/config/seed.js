/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';

var Train = require('../api/tokyometro/train/train.model');
var Tokyometro = require('../api/tokyometro/tokyometro.model');
var TRAINTABLE_SOURCE = 'data/traintimetable.20141019.txt';
var fs = require('fs');
var readline = require('readline');

Tokyometro.ImportLog.findOne({source: TRAINTABLE_SOURCE}, function(err, doc) {
  if (doc) return;

  // first import
  Train.TrainTimetable.find({}).remove(function() {
    var rs = fs.ReadStream( __dirname + '/' + TRAINTABLE_SOURCE, {encoding: 'utf8'});
    var rl = readline.createInterface({'input': rs, 'output': {}});
    rl.on('line', function(line) {
      Train.TrainTimetable.create({
        trainNumber: JSON.parse(line)["odpt:trainNumber"],
        json: line
      });
    });
    Tokyometro.ImportLog.create({
      tableName: "TrainTimetable",
      source: TRAINTABLE_SOURCE,
      updated: new Date()
    });
  });
});

exports.TRAINTABLE_SOURCE = TRAINTABLE_SOURCE;
