const express = require('express');
const OAuth = require('oauth').OAuth;
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const Services = require('../services');

const mongoURL = process.env.MONGODB_URI;
const consumerKey = process.env.TWITTER_CONSUMER_KEY;
const consumerSecret = process.env.TWITTER_CONSUMER_SECRET;
const rootURL = process.env.AMPTWEET_ROOT_URL || 'https://amptweet.com';
const callbackURL = `${rootURL}/auth/twitter/callback`;

const router = express.Router();
const TwitterAuth = new OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  consumerKey,
  consumerSecret,
  '1.0A',
  callbackURL,
  'HMAC-SHA1'
);

const updateUser = function updateUser(username, id, token, secret, callback) {
  const struct = {
    twitter: {
      username,
      id,
      accessToken: token,
      accessTokenSecret: secret
    }
  };
  const findOp = { 'twitter.id': id };
  // Use connect method to connect to the server
  MongoClient.connect(mongoURL, (err, db) => {
    assert.equal(null, err);
    db.createCollection('users', (err2, results) => {
      results.findOne(findOp, (err3, result) => {
        if (result) {
          results.findOneAndUpdate(findOp, { $set: struct }, (err4) => {
            if (err4) throw err4;
            Services.UpdateFollowers(id, token, secret, () => { callback(); });
            db.close();
          });
        } else {
          results.insertOne(struct, (err5) => {
            if (err5) throw err5;
            Services.UpdateFollowers(id, token, secret, () => { callback(); });
            db.close();
          });
        }
      });
    });
  });
};

/* Listen for GET on /auth/twitter/redirect */
router.all('/twitter/redirect', (req, res) => {
  const incookieURL = req.cookies.hosted_on;
  const inrootURL = typeof incookieURL === 'undefined' ? 'https://amptweet.com' : incookieURL;
  TwitterAuth.getOAuthRequestToken((error, OAuthToken, OAuthTokenSecret) => {
    if (error) {
      res.render('error', {
        title: 'AmpTweet',
        message: 'Error occured while getting request token',
        error: {
          status: '500',
          stack: error
        }
      });
      return false;
    }
    TwitterAuth.data = {
      OAuthToken,
      OAuthTokenSecret,
      authURL: `${'https://twitter.com/oauth/authenticate?oauth_token='}${
         OAuthToken}&callback_url=${inrootURL}/auth/twitter/callback`
    };
    res.status(302) // HTTP Redirect - 302 Found
      .append('Location', TwitterAuth.data.authURL);
    res.end();
  });
});

router.all('/twitter/callback', (req, res) => {
  const incookieURL = req.cookies.hosted_on;
  const inrootURL = typeof incookieURL === 'undefined' ? 'https://amptweet.com' : incookieURL;
  return TwitterAuth.getOAuthAccessToken(req.query.oauth_token,
    TwitterAuth.data.OAuthTokenSecret, req.query.oauth_verifier,
    (error, OAuthAccessToken, OAuthAccessTokenSecret) => {
      if (error) {
        res.render('error', {
          title: 'AmpTweet',
          message: 'Error occured while getting access token',
          error: {
            status: '',
            stack: error
          }
        });
        return false;
      }

      return TwitterAuth.get('https://api.twitter.com/1.1/account/verify_credentials.json',
        OAuthAccessToken,
        OAuthAccessTokenSecret,
        (error2, twitterResponseData) => {
          if (error2) {
            res.render('error', {
              title: 'AmpTweet',
              message: 'Error occured while verifying credentias',
              error: {
                status: '',
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
                status: '',
                stack: parseError
              }
            });
          }
          updateUser(
            JSON.parse(twitterResponseData).screen_name,
            JSON.parse(twitterResponseData).id_str,
            OAuthAccessToken,
            OAuthAccessTokenSecret,
            () => {
              res.status(302)
                .cookie('twitter_session_token',
                  Buffer.from(
                    JSON.stringify({
                      access_token: OAuthAccessToken,
                      access_token_secret: OAuthAccessTokenSecret
                    })
                  ).toString('base64'), {
                    expires: 0, // session cookie
                    httpOnly: true
                  }
                )
                .cookie('twitter_user_id',
                  JSON.parse(twitterResponseData).id_str, {
                    expires: 0, // session cookie
                    httpOnly: false
                  }
                )
                // Redirect to dashboard after successful login
                .append('Location', `${inrootURL}/dashboard`)
                .end();
            }
          );
        });
    }
  );
});

router.all('/twitter/logout', (req, res) => {
  const incookieURL = req.cookies.hosted_on;
  const inrootURL = typeof incookieURL === 'undefined' ? 'https://amptweet.com' : incookieURL;
  if (!req.user) {
    res.status(302)
      .append('Location', `${inrootURL}/`)
      .end();
  } else {
    res.status(200)
      .clearCookie('twitter_user_id')
      .clearCookie('twitter_session_token')
      .render('error', {
        title: 'Goodbye',
        type: 'signout',
        message: 'You are now signed out of AmpTweet.',
        error: {
          status: 'See you soon',
          stack: ''
        }
      });
  }
});

router.get('/testing', (req, res) => {
  res.send(req.rawHeaders);
});


module.exports = router;
