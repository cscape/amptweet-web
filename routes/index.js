var express = require('express');
var OAuth = require('oauth').OAuth;
var router = express.Router();
var Twitter = require('twitter');

let consumer_key = process.env.TWITTER_CONSUMER_KEY;
let consumer_secret = process.env.TWITTER_CONSUMER_SECRET;
let rootURL = 'https://amptweet.herokuapp.com'
let callback_url = rootURL + '/auth/twitter/callback';

/* GET home page. */
router.get('/', function(req, res) {
  if (req.cookies.twitter_session_token && req.cookies.twitter_user_id) {
    let Session = JSON.parse(Buffer.from(
      req.cookies.twitter_session_token, 'base64')
      .toString('ascii')
    );
    let TwitterAuth = new Twitter({
      consumer_key: consumer_key,
      consumer_secret: consumer_secret,
      access_token_key: Session.access_token,
      access_token_secret: Session.access_token_secret
    });
    console.log(Session);
    let UserID = parseInt(req.cookies.twitter_user_id);
    TwitterAuth.get('users/lookup', {
      user_id: UserID
    }, function (error, data, rawData) {
      if (!error) {
        let objdata = JSON.parse(data);
        let user = {
          profile: {
            avatar: objdata.profile_image_url_https,
            name: objdata.name,
            username: objdata.screen_name
          }
        };
        res.render('index', {
          title: `AmpTweet`,
          user
        });
      } else {
        console.log(error);
        console.log(data);
        res.render('error', {
          title: 'AmpTweet',
          message: 'Error',
          error: {
            status: "",
            stack: new Error(JSON.stringify(error))
          }
        });
        return false;
      }
    });
  } else {
    res.render('index', { title: 'AmpTweet' });
  }
});

module.exports = router;
