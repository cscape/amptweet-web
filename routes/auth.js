let express = require('express');
let OAuth = require('oauth').OAuth;

let consumer_key = process.env.TWITTER_CONSUMER_KEY;
let consumer_secret = process.env.TWITTER_CONSUMER_SECRET;
let callback_url = 'https://amptweet.herokuapp.com/auth/twitter/callback';

let router = express.Router();

let TwitterAuth = new OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  consumer_key,
  consumer_secret,
  '1.0A',
  callback_url,
  'HMAC-SHA1'
);

/* Listen for GET on /auth/twitter/redirect */
router.get('/twitter/redirect', function(req, res) {
  TwitterAuth.getOAuthRequestToken(function (error, OAuthToken, OAuthTokenSecret, results) {
    TwitterAuth.data = {
      OAuthToken: OAuthToken,
      OAuthTokenSecret: OAuthToken,
      authURL: 'https://twitter.com/' + 'oauth/authenticate?oauth_token=' + OAuthToken
    };
    res.status(302) // HTTP Redirect - 302 Found
      .append("Location", TwitterAuth.data.authURL);
    res.end();
  });
});

router.all('/twitter/callback', function(req, res) {
  TwitterAuth.getOAuthAccessToken(req.query.oauth_token, 
    TwitterAuth.data.OAuthTokenSecret, req.query.oauth_verifier,
    function (error, OAuthAccessToken, OAuthAccessTokenSecret, results) {
      if (error) {
        res.render('error', {
          title: 'AmpTweet',
          message: 'Error occured while getting access token',
          error: {
            status: "",
            stack: error
          }
        }).end();
        return false;
      }

      TwitterAuth.get('https://api.twitter.com/1.1/account/verify_credentials.json',
        OAuthAccessToken,
        OAuthAccessTokenSecret,
        function (error, twitterResponseData, result) {
          if (error) {
            res.render('error', {
              title: 'AmpTweet',
              message: 'Error occured while verifying credentias',
              error: {
                status: "",
                stack: error
              }
            }).end();
            return;
          }
          try {
            JSON.parse(twitterResponseData);
          } catch (parseError) {
            res.render('error', {
              title: 'AmpTweet',
              message: 'Error occured while parsing Twitter response data',
              error: {
                status: "",
                stack: parseError
              }
            }).end();
          }
          response.end(twitterResponseData);
        });
    }
  );
});

module.exports = router;
