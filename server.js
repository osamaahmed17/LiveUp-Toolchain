var express = require("express");
var app = express();
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
var http = require('http')
var router = express.Router();
const server = http.createServer(app);
var usersController = require('./controllers/userController');
var socketIO = require('socket.io');
var cors = require('cors');
var io = socketIO(server);


app.use(cors())
app.use('/', usersController);
app.use(express.static(__dirname + '/views'));


io.on('connection', socket => {
    socket.emit("FromAPI", "Osama"); // Emitting a new message. It will be consumed by the client
    socket.on("disconnect", () => {
        console.log("Client disconnected");
      })
})



server.listen(process.env.PORT || 3000, function () {
    console.log("Apps is on localhost:3000");

});

module.exports = app;