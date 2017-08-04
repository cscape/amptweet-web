var express = require('express');
var OAuth = require('oauth').OAuth;
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  if (req.user) {
    res.render('index', {
      title: `AmpTweet`,
      user: req.user
    });
  } else {
    res.render('index', { title: 'AmpTweet' });
  }
});

module.exports = router;
