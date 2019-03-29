const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
var faker = require("faker");
exports.token = function (r) {
   var identity = faker.name.findName();
  
    // Used when generating any kind of tokens
    const twilioAccountSid = 'ACf8b17e1b9eb8d2b9b82432a5ff60c926';
    const twilioApiKey = 'SK8f26003fdfb220f3b3a7af42c57f1f12';
    const twilioApiSecret = 'N9ptLeTFAnNy33ontLmYXyZbzcum4wYs';

    // Used specifically for creating Voice tokens
   


    // Create Video Grant
    const videoGrant = new VideoGrant({
    room: 'cool room',
    });

    // Create an access token which we will sign and return to the client,
    // containing the grant we just created
    const token = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret);
    token.addGrant(videoGrant);
    token.identity = identity;
     
    data={ identity: identity,
      token: token.toJwt()}
    // Serialize the token to a JWT string
    return data

  };