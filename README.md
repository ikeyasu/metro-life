[![Travis CI Status](https://travis-ci.org/ikeyasu/metro-life.svg)](https://travis-ci.org/ikeyasu/metro-life) [![Stories in Ready](https://badge.waffle.io/ikeyasu/metro-life.png?label=ready&title=Ready)](https://waffle.io/ikeyasu/metro-life)
metro-life
==========

How to run locally
==================

Intall dependencies.

OSX:

    $ brew install mongodb memcached

Checkout sources

    $ git clone git@github.com:ikeyasu/metro-life.git

Run mongoDB. (It's not under the 'metro-life' directory.)

    $ mkdir -f mongodb-metr-life
    $ mongod --dbpath mongodb-metr-life/

Run memcached. (Open new console)

    $ memcached

Install dependencies. (Open new console)

    $ cd metro-life
    $ npm install
    $ bower install

Edit `server/config/local.env.js`

    $ cp server/config/local.env.sample.js server/config/local.env.js 
    $ vi server/config/local.env.js

server/config/local.env.js

    module.exports = {
      DOMAIN:           'http://localhost:9000',
      SESSION_SECRET:   'metrolife-secret',
      // See https://developer.tokyometroapp.jp/oauth/applications
      TOKYOMETRO_ACCESS_TOKEN: '{access token}', // <=== EDIT HERE!
      // Control debug level for modules using visionmedia/debug
      DEBUG: ''
    };


Open another terminal and run server

    $ grunt serve


Testing
=======

See [generator-angular-fullstack](https://github.com/DaftMonk/generator-angular-fullstack#testing) for details.

Jasmine and Mocha tests
-----------------------

Run tests

    $ grunt test # Run all tests
    $ grunt test:client # client tests only (Jasmine)
    $ grunt test:server # server tests only (Mocha)

Protractor tests
----------------

You need to first run

    $ npm run update-webdriver

Then,

    $ grunt test:e2e
