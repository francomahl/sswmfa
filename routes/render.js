var express = require('express');
var router = express.Router();
var SDB = require('../models/db');
//below autogenerated routes
router.get('/', function (req, res) {
  res.render('rendered/index', { title: 'Index' });
});

module.exports = router;
