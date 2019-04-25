var express = require("express");
var cors = require('cors');
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
var usersController = require('./controllers/userController');




app.use(cors()); 
app.use('/', usersController);
app.use(express.static(__dirname + '/views'));



var port = process.env.PORT || 3000
app.listen(port, function() {
    console.log("To view your app, open this link in your browser: http://localhost:" + port);
});

module.exports = app;