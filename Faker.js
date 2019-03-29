
exports.faker = function (r) {
    var identity = faker.name.findName();
    token.identity = identity;
    // Used when generating any kind of tokens
    const twilioAccountSid = 'ACf8b17e1b9eb8d2b9b82432a5ff60c926';
    const twilioApiKey = 'SK8f26003fdfb220f3b3a7af42c57f1f12';
    const twilioApiSecret = 'N9ptLeTFAnNy33ontLmYXyZbzcum4wYs';

    // Used specifically for creating Voice tokens
    const identity = 'user';



    // Create Video Grant
    const videoGrant = new VideoGrant({
    room: 'cool room',
    });

    // Create an access token which we will sign and return to the client,
    // containing the grant we just created
    const token = new AccessToken(twilioAccountSid, twilioApiKey, twilioApiSecret);
    token.addGrant(videoGrant);
    token.identity = identity;

    // Serialize the token to a JWT string
    return token.toJwt();

  };