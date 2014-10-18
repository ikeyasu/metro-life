'use strict';

var should = require('should');
var app = require('../../../app');
var request = require('supertest');

describe('GET /api/tokyometro/stations/odpt.Station:TokyoMetro.Ginza.AoyamaItchome', function() {
  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/tokyometro/stations/odpt.Station:TokyoMetro.Ginza.AoyamaItchome')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        res.body[0]["dc:title"].should.equal("青山一丁目");
        done();
      });
  });
});
