var express = require('express');
var router = express.Router();
var Token=require('../SetToken')
var user = require("../controllers/userController.js");

/* GET users listing. */
router.get('/', function(req, res, next) {
  console.log(Token.token())
  user.list(req, res);
});

// Get single user by id
router.get('/show/:id', function(req, res) {
  user.show(req, res);
});


// Save user
router.post('/save', function(req, res) {
  user.save(req, res);
});


// Edit update
router.post('/update/:id', function(req, res) {
  user.update(req, res);
});

// delete user
router.post('/delete/:id', function(req, res, next) {
  user.delete(req, res);
});

module.exports = router;