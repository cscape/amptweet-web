let express = require('express');
let OAuth = require('oauth').OAuth;

let consumer_key = process.env.TWITTER_CONSUMER_KEY;
let consumer_secret = process.env.TWITTER_CONSUMER_SECRET;
let debugStatus = typeof v8debug === 'object';
let rootURL = debugStatus === false ? 'https://amptweet.herokuapp.com' : 'http://127.0.0.1:3000';
let callback_url = rootURL + '/auth/twitter/callback';

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
router.all('/twitter/redirect', function(req, res) {
  TwitterAuth.getOAuthRequestToken(function (error, OAuthToken, OAuthTokenSecret, results) {
    TwitterAuth.data = {
      OAuthToken: OAuthToken,
      OAuthTokenSecret: OAuthTokenSecret,
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
        });
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
            });
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
            });
          }
          console.log(`AccessToken-> ${OAuthAccessToken}\r\nAccessSecret->${OAuthAccessTokenSecret}`)
          res.status(302)
            .cookie('twitter_session_token',
              Buffer.from(
                JSON.stringify({
                  "access_token": OAuthAccessToken,
                  "access_token_secret": OAuthAccessTokenSecret
                })
              ).toString('base64'), {
                expires: 0, // session cookie
                httpOnly: true
              }
            )
            .cookie('twitter_user_id',
              JSON.parse(twitterResponseData).id_str, {
                expires: 0, //session cookie
                httpOnly: false
              }
            )
            // Redirect to dashboard after successful login
            .append("Location", rootURL + '/dashboard')
            .end();
        });
    }
  );
});

router.all('/twitter/logout', function(req, res) {
  if (!req.user) {
    res.status(302)
      .append("Location", rootURL + '/')
  } else {
    res.status(200)
      .clearCookie('twitter_user_id')
      .clearCookie('twitter_session_token')
      .render('error', {
        title: 'Goodbye',
        message: 'You are now signed out of AmpTweet.',
        error: {
          status: "See you soon",
          stack: ""
        }
      })
      .end();
  }
});

router.get('/testing', function(req, res) {
  res.send(req.rawHeaders);
});
module.exports = router;
