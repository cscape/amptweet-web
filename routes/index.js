var express = require('express');
var OAuth = require('oauth').OAuth;
var router = express.Router();

let consumer_key = process.env.TWITTER_CONSUMER_KEY;
let consumer_secret = process.env.TWITTER_CONSUMER_SECRET;
let rootURL = 'https://amptweet.herokuapp.com'
let callback_url = rootURL + '/auth/twitter/callback';

let TwitterAuth = new OAuth(
  'https://api.twitter.com/oauth/request_token',
  'https://api.twitter.com/oauth/access_token',
  consumer_key,
  consumer_secret,
  '1.0A',
  callback_url,
  'HMAC-SHA1'
);

/* GET home page. */
router.get('/', function(req, res) {
  if (req.cookies.twitter_session_token && req.cookies.twitter_user_id) {
    let Session = JSON.parse(req.cookies.twitter_session_token);
    let UserID = req.cookies.twitter_user_id;
    TwitterAuth.get(
      `https://api.twitter.com/1.1/users/show.json?user_id=${UserID}`,
      Session.access_token,
      Session.access_token_secret,
      function (error, data, result) {
        if (!error) {
          let user = {
            profile: {
              avatar: data.profile_image_url_https,
              name: data.name,
              username: data.screen_name
            }
          };
          res.render('index', {
            title: `AmpTweet`,
            user: user
          });
        } else {
          res.render('error', {
            title: 'AmpTweet',
            message: 'Error occured while getting access token',
            error: {
              status: "",
              stack: new Error(error)
            }
          });
          return false;
        }
      }
    );
  } else {
    res.render('index', { title: 'AmpTweet' });
  }
});

module.exports = router;
