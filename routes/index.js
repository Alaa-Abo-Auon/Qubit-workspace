var express = require('express');
var router = express.Router();
var level_controller = require('../controllers/levelController');

// GET home page
router.get('/', function (req, res, next) {
  res.redirect('/admin');
});
// GET Home page (detail all of info)
router.get('/admin', level_controller.level_list);

module.exports = router;
