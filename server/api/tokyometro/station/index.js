'use strict';

var express = require('express');
var controller = require('./station.controller');

var router = express.Router();

router.get('/:station', controller.show);
router.get('/nearby/:station', controller.nearby);
router.get('/raildirection/:station', controller.raildirection);
router.get('/timetable/:station/:direction', controller.timetable);
router.get('/timetable/:station/:direction/:type', controller.timetable);

module.exports = router;
