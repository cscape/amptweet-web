var Twitter = require('twitter');
let consumer_key = process.env.TWITTER_CONSUMER_KEY;
let consumer_secret = process.env.TWITTER_CONSUMER_SECRET;

let userInfo = function (req, res, next) {
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
    let UserID = req.cookies.twitter_user_id;

    TwitterAuth.get('users/show', {
      user_id: UserID
    }, function (error, data, rawData) {
      if (!error) {
        // note: [data] is already in JSON format
        // rawData is the raw plaintext
        let user = {
          profile: {
            avatar: data.profile_image_url_https,
            name: data.name,
            username: data.screen_name
          }
        };
        req.user = user;
        next();
      } else {
        res.render('error', {
          title: 'AmpTweet',
          message: 'Error',
          error: {
            status: 500,
            stack: new Error(JSON.stringify(error))
          }
        });
        return false;
      }
    });
  } else {
    // User not logged in
    req.user = null;
    next();
  }
};

module.exports = userInfo;