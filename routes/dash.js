var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  if (req.user) {
    res.render('dashboard', {
      title: `AmpTweet`,
      user: req.user
    });
  } else {
    throw new Error(404);
  }
});

module.exports = router;
