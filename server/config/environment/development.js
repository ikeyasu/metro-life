'use strict';

// Development specific configuration
// ==================================
module.exports = {
  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/metrolife-dev'
  },

  seedDB: true,
  usingMock: true
};
