let express = require('express');
let OAuth = require('oauth').OAuth;
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
let Services = require(__base + 'services');

var mongoURL = process.env.MONGODB_URI;
let consumer_key = process.env.TWITTER_CONSUMER_KEY;
let consumer_secret = process.env.TWITTER_CONSUMER_SECRET;
let debugStatus = typeof v8debug === 'object';
let rootURL = 'http://amptweet.com';
let callback_url = rootURL + '/auth/twitter/callback';

let router = express.Router();
let TwitterAuth = new OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  consumer_key,
  consumer_secret,
  '1.0A',
  '',
  'HMAC-SHA1'
);

let createUser = function (username, id, token, secret) {
  let struct = {
    twitter: {
      username: username,
      id: id,
      accessToken: token,
      accessTokenSecret: secret
    }
  };
  let findOp = {"twitter.id": id};
  console.log(findOp);
  // Use connect method to connect to the server
  MongoClient.connect(mongoURL, function(err, db) {
    assert.equal(null, err);
    db.createCollection("users", function (err, results) {
      results.findOne(findOp, function(err, result){
        console.log(JSON.stringify(result));
        if (result) {
          results.findOneAndUpdate(findOp, {$set: struct}, function (err, result1){
            Services.UpdateFollowers(id, token, secret);
            db.close();
          })
        } else {
          results.insertOne(struct, function (err, res) {
            Services.UpdateFollowers(id, token, secret);
            db.close();
          })
        }
      })
    });
    
  });
};

/* Listen for GET on /auth/twitter/redirect */
router.all('/twitter/redirect', function(req, res) {
  let incookieURL = req.cookies.hosted_on;
  let inrootURL = typeof incookieURL === 'undefined' ? 'https://amptweet.com' : incookieURL;
  TwitterAuth.getOAuthRequestToken(function (error, OAuthToken, OAuthTokenSecret, results) {
    TwitterAuth.data = {
      OAuthToken: OAuthToken,
      OAuthTokenSecret: OAuthTokenSecret,
      authURL: 'https://twitter.com/' + 'oauth/authenticate?oauth_token=' 
        + OAuthToken + '&callback_url=' + inrootURL + '/auth/twitter/callback'
    };
    res.status(302) // HTTP Redirect - 302 Found
      .append("Location", TwitterAuth.data.authURL);
    res.end();
  });
});

router.all('/twitter/callback', function(req, res) {
  let incookieURL = req.cookies.hosted_on;
  let inrootURL = typeof incookieURL === 'undefined' ? 'https://amptweet.com' : incookieURL;
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
          createUser(
            JSON.parse(twitterResponseData).screen_name,
            JSON.parse(twitterResponseData).id_str,
            OAuthAccessToken,
            OAuthAccessTokenSecret
          );
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
            .append("Location", inrootURL + '/dashboard')
            .end();
        });
    }
  );
});

router.all('/twitter/logout', function(req, res) {
  let incookieURL = req.cookies.hosted_on;
  let inrootURL = typeof incookieURL === 'undefined' ? 'https://amptweet.com' : incookieURL;
  if (!req.user) {
    res.status(302)
      .append("Location", inrootURL + '/')
      .end();
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
