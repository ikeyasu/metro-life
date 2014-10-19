'use strict';

var express = require('express');
var controller = require('./station.controller');

var router = express.Router();

router.get('/:station', controller.show);
router.get('/nearby/:station', controller.nearby);

module.exports = router;
