metro-life
==========

How to run locally
==================

Checkout sources

    $ git clone git@github.com:ikeyasu/metro-life.git

Run mongoDB

    $ mongod --dbpath mongodb/

Edit `server/config/local.env.js`

    $ cd metro-life
    $ cp server/config/local.env.sample.js server/config/local.env.js 
    $ vi server/config/local.env.js


    module.exports = {
      DOMAIN:           'http://localhost:9000',
      SESSION_SECRET:   'metrolife-secret',
      // See https://developer.tokyometroapp.jp/oauth/applications
      TOKYOMETRO_ACCESS_TOKEN: '{access token}',
      // Control debug level for modules using visionmedia/debug
      DEBUG: ''
    };


Open another terminal and run server

    $ grunt serve
