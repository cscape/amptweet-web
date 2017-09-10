var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  if (req.user) {
    res.render('index', {
      title: `Welcome`,
      user: req.user
    });
  } else {
    res.render('index', { title: 'AmpTweet' });
  }
});

module.exports = router;
