var Joi = require('joi');

var user = {
    body: {
        _id:Joi.string().required(),
        username:Joi.string().required(),
        password: Joi.string().required(),
        firstname:Joi.string().required(),
        lastname:Joi.string().required(),
        country:Joi.string().required(),
        usertype:Joi.string().required(),
        twilioToken:''
    }
}

module.exports = user;