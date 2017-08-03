let express = require('express');
let OAuth = require('oauth').OAuth;

/* Twitter for Windows Phone keys are used as a backfill
 * in case the environment variables are not present.
 */
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
  TwitterAuth.getOAuthRequestToken(function (error, oAuthToken, oAuthTokenSecret, results) {
    TwitterAuth.authURL = 'https://twitter.com/' + 'oauth/authenticate?oauth_token=' + oAuthToken;
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
