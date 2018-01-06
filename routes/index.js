const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  if (req.user) {
    res.render('index', {
      title: 'Welcome',
      user: req.user
    });
  } else {
    res.cookie('hosted_on', `https://${req.header('Host')}`)
      .render('index');
  }
});

module.exports = router;
