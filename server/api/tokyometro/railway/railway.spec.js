'use strict';

var should = require('should');
var app = require('../../../app');
var request = require('supertest');

describe('GET /api/tokyometro/railways', function() {
  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/tokyometro/railways')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        res.body.length.should.equal(10);
        done();
      });
  });
});

