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


const twilioAccountSid = 'AC5938395f66b03f9813dd368aff0b73c2';
const twilioApiKey = 'SK0039c3ca9e8a580db97b418081bc5e0f';
const twilioApiSecret = 'QTfJaeaWIzrrxfOPZZU4jDAoYehcqsS0';
var identity=''
const videoGrant = new VideoGrant({
  room: 'Pakistan',
});
const twilioToken = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret,3600,identity);

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
router.post('/users/delete', function (req, res, next) {
  mydb.find({
    selector: { username: req.body.username }
  }, function (err, body) {
    if (!err) {
      var user = body.docs[0];
      id = user._id;
      rev = user._rev;
      mydb.destroy(id, rev, function (err, body, header) {
        if (!err) {
          return res.status(200).json({ success: 'success' });
        }
        else {
          return res.status(400).json({ error: err });
        }
      });

    } else {
      return res.status(400).json({ error: err });

    }
  });
});



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
  return jwt.encode({ sub: user.username }, secret);
}
/*------------------------------For SiginUp-----------------------------------------------------*/
router.post('/users/signup', expressJoi(user), function (req, res, next) {
  twilioToken.identity = req.body.username;
  twilioToken.addGrant(videoGrant);
  var username = req.body.username;
  var password = req.body.password;
  var fullname = req.body.fullname;
  var country = req.body.country;
  var token = twilioToken.toJwt()
  var schema = 'User'
  if (!username || !password) {
    return res.status(422).send({ error: 'You must provide username and password' });
  }
  const user = {
    username: username,
    password: password,
    fullname: fullname,
    country: country,
    twilioToken: token,
    schema: schema
  }
  mydb.insert(user, function (err, body) {
    if (err) { return next(err); }
    res.json({ token: tokenForUser(user), user: user })
  });
});
/*----------------------------------------------------------------------------------------------*/
module.exports = router;