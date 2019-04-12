var jwt = require('jsonwebtoken'); 
var dotenv = require('dotenv');
dotenv.load();

exports.verifyUser = function (req, res, next) {
    var token = req.headers.authorization;
    
    if(!token) {
        return res.status(401).json({ error: 'No token provided.' });
    }
    
    tokenParts = token.split(' ');
    
    if(tokenParts[0] == 'Bearer' && tokenParts[1]) {
        jwt.verify(tokenParts[1],  process.env.SECRET_KEY, function(err, decoded) {
            if(!err) {
                req.decoded = decoded;
                next();
            } else {
                return res.status(401).json({ error: 'Authentication failed.' });
            }
        });
    } else {
        return res.status(401).json({ error: 'Invalid token.' });
    }
}