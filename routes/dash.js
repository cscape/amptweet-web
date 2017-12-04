const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  if (req.user) {
    res.render('dashboard', {
      title: 'Dashboard',
      user: req.user
    });
  } else {
    res.render('error', {
      title: 'Error',
      message: 'You are not logged in.',
      error: {
        status: 403,
        stack: ''
      }
    });
  }
});

module.exports = router;
