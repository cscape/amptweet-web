var express = require('express');
var router = express.Router();
var path = require('path');

function rte (name) {
  return require(`${__base}endpoints/${name}.js`);
}

router.get('/auto_like', rte('GET/auto_like'));
router.get('/follower_count', rte('GET/follower_count'));

router.post('/auto_like', rte('POST/auto_like'));

router.all('/*', function(req, res) {
  throw ({
    status: 404,
    message: "Endpoint is invalid or does not exist.",
    render: false
  })
})

module.exports = router;
