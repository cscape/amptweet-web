let express = require('express');
let OAuth = require('oauth').OAuth;

/* Twitter for Windows Phone keys are used as a backfill
 * in case the environment variables are not present.
 */
let consumer_key = process.env.TWITTER_CONSUMER_KEY ||
  'yN3DUNVO0Me63IAQdhTfCA';
let consumer_secret = process.env.TWITTER_CONSUMER_SECRET ||
  'c768oTKdzAjIYCmpSNIdZbGaG0t6rOhSFQP0S5uC79g';
let callback_url = process.env.TWITTER_CALLBACK_URL || 
  'https://amptweet.herokuapp.com/auth/twitter/callback';

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
    TwitterAuth.authURL = 'https://twitter.com/' + 'oauth/authenticate?oauth_token=' + OAuthToken;
    res.status(302) // HTTP Redirect - 302 Found
      .append("Location", TwitterAuth.authURL);
    res.end();
  });
});

router.all('/twitter/callback', function(req, res) {
  res.send(req.body);
  res.end();
});

module.exports = router;
