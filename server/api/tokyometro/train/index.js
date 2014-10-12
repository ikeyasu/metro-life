'use strict';

var express = require('express');
var controller = require('./train.controller');

var router = express.Router();

router.get('/', controller.index);
router.get('/delayed', controller.delayed);
router.get('/:id', controller.show);

module.exports = router;
