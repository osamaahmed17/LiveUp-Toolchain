var cfenv = require("cfenv");
var expressJoi = require('express-joi-validator');
var jwt = require('jsonwebtoken');
var express = require("express");
var user = require('../models/user');
var verify = require('../auth/verify');
var router = express.Router();
var cloudant, mydb;

/*-------------------------------Cloudantant Configuration--------------------------------*/
var vcapLocal; // load local VCAP configuration  and service credentials
try {
  vcapLocal = require('../vcap-local.json');
  console.log("Loaded local VCAP", vcapLocal);
} catch (e) { }
const appEnvOpts = vcapLocal ? { vcap: vcapLocal} : {}
const appEnv = cfenv.getAppEnv(appEnvOpts);
var Cloudant = require('@cloudant/cloudant');  // Load the Cloudant library.
if (appEnv.services['cloudantNoSQLDB'] || appEnv.getService(/cloudant/)) {
  if (appEnv.services['cloudantNoSQLDB']) {    // Initialize database with credentials
    cloudant = Cloudant(appEnv.services['cloudantNoSQLDB'][0].credentials);  // CF service named 'cloudantNoSQLDB'
  } else {
     cloudant = Cloudant(appEnv.getService(/cloudant/).credentials);   // user-provided service with 'cloudant' in its name
  }
} else if (process.env.CLOUDANT_URL){
  cloudant = Cloudant(process.env.CLOUDANT_URL);
}
if(cloudant) {
  var dbName = 'mydb';    //database name
  cloudant.db.create(dbName, function(err, data) {   // Create a new "mydb" database.
    if(!err) //err if database doesn't already exists
      console.log("Created database: " + dbName);
  });
  mydb = cloudant.db.use(dbName);     // Specify the database we are going to use (mydb)...
}
/*----------------------------------------------------------------------------------------------*/


/*------------------------------All User Routes and Configuration--------------------------------*/

/*------------------------------For Signin/Login--------------------------------*/
router.post('/users/signin', function(req, res, next) {
    mydb.find({
        selector: { _id: req.body._id}
    }, function(err, body) {
        if(!err) {
            var user = body.docs[0];
            if(user && req.body.password==user.password) {
                var payload = {
                  username:req.body.username,
                  password:req.body.password,
                  firstname:req.body.firstname,
                  lastname:req.body.lastname,
                  country:req.body.country,
                  usertype:req.body.usertype
                };
                
                var token = jwt.sign(payload, process.env.SECRET_KEY, {
                    expiresIn: 3600
                });
                
                return res.status(200).json({
                    token: token
                });
            } else {
                return res.status(401).json({ error: 'Incorrect id or password.' });
            }
        } else {
            return res.status(401).json({ error: 'Authentication failed.' });
        }
    });
  });
  /*----------------------------------------------------------------------------------------------*/


  /*------------------------------------For Dashboard--------------------------------*/
  router.get('/users', verify.verifyUser, function(req, res, next){
    mydb.find({
        selector: { schema: 'User' }
    }, function(err, body) {
        if(!err) {
            res.status(200).json(body.docs);
        } else {
            return next(err);
        }
    });
  });
 /*----------------------------------------------------------------------------------------------*/


  /*------------------------------For SiginUp-----------------------------------------------------*/
  router.post('/users/signup', expressJoi(user), function(req, res, next) {
    mydb.insert({
        _id:req.body._id,
        username:req.body.username,
        password:req.body.password,
        firstname:req.body.firstname,
        lastname:req.body.lastname,
        country:req.body.country,
        usertype:req.body.usertype,
        schema: 'User'
    }, function(err, body) {
        if(!err) {
            return res.status(200).json({
              username:req.body.username,
              password:req.body.password,
              firstname:req.body.firstname,
              lastname:req.body.lastname,
              country:req.body.country,
              usertype:req.body.usertype,
            });
        } else {
            return next(err);
        }
    });
  });
 /*----------------------------------------------------------------------------------------------*/
  module.exports = router;