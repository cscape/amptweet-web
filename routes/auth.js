let express = require('express');
let OAuth = require('oauth').OAuth;

let consumer_key = process.env.TWITTER_CONSUMER_KEY;
let consumer_secret = process.env.TWITTER_CONSUMER_SECRET;
let router = express.Router();

let TwitterAuth = new OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  consumer_key,
  consumer_secret,
  '1.0A',
  null,
  'HMAC-SHA1'
);

/* Listen for GET on /auth/twitter/redirect */
router.get('/twitter/redirect', function(req, res) {
  let callback_url = req.protocol + '://' + req.get('host') + '/auth/twitter/callback';
  
  TwitterAuth.getOAuthRequestToken(function (error, OAuthToken, OAuthTokenSecret, results) {
    TwitterAuth.authURL = 'https://twitter.com/' + 'oauth/authenticate?oauth_token=' + OAuthToken;
    res.sendStatus(302); // HTTP Redirect - 302 Found
    res.append("Location", TwitterAuth.authURL);
    res.end();
  });
});

router.all('/twitter/callback', function(req, res) {
  res.send(req.body);
  res.end();
});

router.get('/', function(req, res) {
  res.sendStatus(302); // HTTP Redirect - 302 Found
  res.render('error', {
    title: 'AmpTweet',
    message: "302",
    error: {
      status: "This URL is not accessible, redirecting to homepage..."
    }
  });

  setTimeout(() => {
    res.append("Location", req.protocol + '://' + req.get('host'));
    res.end();
  }, 4000);
});

module.exports = router;
