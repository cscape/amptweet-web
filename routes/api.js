var express = require('express');
var router = express.Router();

function rte (name) {
  return require(`./endpoints/${name}.js`);
}

/* GET home page. */
router.all('/', function(req, res) {
  if (!req.user) {
    return res.send({
      "status": "400",
      "message": "Unauthorized or not logged in."
    });
  } else if (req.user) {
    router.get('/auto_like', rte('GET/auto_like'));
    router.post('/auto_like', rte('POST/auto_like'));
    router.all('/*', function(req, res){
      return res.send({
        "status": "404",
        "message": "Endpoint is invalid or does not exist."
      })
    })
  }
});

module.exports = router;
