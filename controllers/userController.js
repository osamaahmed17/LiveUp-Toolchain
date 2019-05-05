var cfenv = require("cfenv");
var expressJoi = require('express-joi-validator');
const jwt = require('jwt-simple');
var express = require("express");
var user = require('../models/user');
var router = express.Router();
const withAuth = require('../auth/verify');
const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
var cloudant, mydb;


/*-------------------------------Twilio Configuration--------------------------------*/
const twilioAccountSid = 'ACf8b17e1b9eb8d2b9b82432a5ff60c926';
const twilioApiKey = 'SK8f26003fdfb220f3b3a7af42c57f1f12';
const twilioApiSecret = 'N9ptLeTFAnNy33ontLmYXyZbzcum4wYs';
const videoGrant = new VideoGrant({
  room: 'cool room',
});
const twilioToken = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret);

/*----------------------------------------------------------------------------------------------*/
const secret = 'mysecretsshhh';

/*-------------------------------Cloudantant Configuration--------------------------------*/
var vcapLocal; // load local VCAP configuration  and service credentials
try {
  vcapLocal = require('../vcap-local.json');
  console.log("Loaded local VCAP", vcapLocal);
} catch (e) { }
const appEnvOpts = vcapLocal ? { vcap: vcapLocal } : {}
const appEnv = cfenv.getAppEnv(appEnvOpts);
var Cloudant = require('@cloudant/cloudant');  // Load the Cloudant library.
if (appEnv.services['cloudantNoSQLDB'] || appEnv.getService(/cloudant/)) {
  if (appEnv.services['cloudantNoSQLDB']) {    // Initialize database with credentials
    cloudant = Cloudant(appEnv.services['cloudantNoSQLDB'][0].credentials);  // CF service named 'cloudantNoSQLDB'
  } else {
    cloudant = Cloudant(appEnv.getService(/cloudant/).credentials);   // user-provided service with 'cloudant' in its name
  }
} else if (process.env.CLOUDANT_URL) {
  cloudant = Cloudant(process.env.CLOUDANT_URL);
}
if (cloudant) {
  var dbName = 'mydb';    //database name
  cloudant.db.create(dbName, function (err, data) {   // Create a new "mydb" database.
    if (!err) //err if database doesn't already exists
      console.log("Created database: " + dbName);
  });
  mydb = cloudant.db.use(dbName);     // Specify the database we are going to use (mydb)...
}
/*----------------------------------------------------------------------------------------------*/


/*------------------------------All User Routes and Configuration--------------------------------*/

/*------------------------------For Signin/Login--------------------------------*/
router.post('/users/signin', function (req, res, next) {
  mydb.find({
    selector: { username: req.body.username }
  }, function (err, body) {
    if (!err) {
      var user = body.docs[0];
      if (req.body.password == user.password) {
        var payload = {
          username: req.body.username,
          password: req.body.password,
          fullname: req.body.fullname,
          country: req.body.country,
          twilioToken: twilioToken.toJwt()
        };
        res.send({ token: tokenForUser(payload) });
      } else {
        return res
          .status(400)
          .json({ passwordincorrect: "Password incorrect" });
      }

    } else {
      return res.status(401).json({ error: 'Authentication failed.' });
    }
  });
});
/*----------------------------------------------------------------------------------------------*/


/*------------------------------------For Dashboard--------------------------------*/
router.get('/users', function (req, res, next) {
  mydb.find({
    selector: { schema: 'User' }
  }, function (err, body) {
    if (!err) {
      return res.send(body.docs);

    } else {
      return res.status(400).json({ error: err });
      ;

    }
  });
});


/*-----------------------------For Checking Authentication------------------------------------------*/
router.get('/checkToken', withAuth, function (req, res) {
  res.sendStatus(200);
});

/*----------------------------------------------------------------------------------------------*/
function tokenForUser(user) {
  return jwt.encode({ sub: user.username },secret);
}
/*------------------------------For SiginUp-----------------------------------------------------*/
router.post('/users/signup', expressJoi(user), function (req, res, next) {
  twilioToken.identity = req.body.username;
  twilioToken.addGrant(videoGrant);
  var username=req.body.username;
  var password=req.body.password;
  var fullname=req.body.fullname;
  var country =req.body.country;
  var token=twilioToken.toJwt()
  if (!username || !password) {
    return res.status(422).send({ error: 'You must provide username and password'});
  }
  const user={
    username: username,
    password: password,
    fullname: fullname,
    country: country,
    twilioToken:token 
  }
  mydb.insert(user, function (err, body) {
   if(err){return next(err);}
   res.json({token:tokenForUser(user)})
  });
});
/*----------------------------------------------------------------------------------------------*/
module.exports = router;