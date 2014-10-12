'use strict';

var should = require('should');
var app = require('../../../app');
var request = require('supertest');

describe('GET /api/tokyometro/trains', function() {
  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/tokyometro/trains')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});

describe('GET /api/tokyometro/trains/delayed', function() {
  it('should respond with JSON array', function(done) {
    request(app)
      .get('/api/tokyometro/trains/delayed')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) return done(err);
        res.body.should.be.instanceof(Array);
        done();
      });
  });
});
