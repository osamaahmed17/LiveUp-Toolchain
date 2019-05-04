var Joi = require('joi');

var user = {
    body: {
        _id:Joi.string().required(),
        username:Joi.string().required(),
        password: Joi.string().required(),
        fullname:Joi.string().required(),
        country:Joi.string().required(),
        twilioToken:''
    }
}

module.exports = user;