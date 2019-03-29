var mongoose = require("mongoose");
var User = require("../models/userModel");

var userController = {};

userController.list = function(req, res) {
    User.find({}).exec(function (err, user) {
      if (err) {
        console.log("Error:", err);
      }
      else {
       res.send("200")
       console.log({user: user});
    
      }
    });
  };

  // Show user by id
userController.show = function(req, res) {
    User.findOne({_id: req.params.id}).exec(function (err, user) {
      if (err) {
        console.log("Error:", err);
      }
      else {
        res.send("200")
        console.log({user: user});
      
      }
    });
  };


  
  // Save new user
  userController.save = function(req, res) {
    var user = new User(req.body);
    user.save(function(err) {
      if(err) {
        console.log(err);
       
      } else {
        res.send("200")
  
      }
    });
  };
  
  // Update a user
 userController.update = function(req, res) {
    User.findByIdAndUpdate(req.params.id, { $set: { name: req.body.name, address: req.body.address}}, { new: true }, function (err, user) {
      if (err) {
        console.log(err);
      }
      res.send("200")
      
    });
  };
  
  // Delete a user
userController.delete = function(req, res) {
    User.remove({_id: req.params.id}, function(err) {
      if(err) {
        console.log(err);
      }
      else {
        res.send("200")
    
      }
    });
  };
  
  module.exports = userController;