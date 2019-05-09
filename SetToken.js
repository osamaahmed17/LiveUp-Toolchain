const AccessToken = require('twilio').jwt.AccessToken;
const VideoGrant = AccessToken.VideoGrant;
var faker = require("faker");
exports.token = function (r) {
   var identity = faker.name.findName();
  
    // Used when generating any kind of tokens
    const twilioAccountSid = 'ACbf1e7230935c21db8dd1d8f188386767';
    const twilioApiKey = 'SK4ad84307ba2d5e3e2818e9f0238a091f';
    const twilioApiSecret = 'XPsf7Afaf3x1iJdwo0W18zjwXVw8Wt39';

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