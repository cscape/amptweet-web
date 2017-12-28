const express = require('express');
const path = require('path');

const router = express.Router();

/** Routes Pages to Endpoint
 * @param {string} name Name of directory
 * @return {string} Directory
 */
function rte(name) {
  const requireDIR = `${global.baseDIR}endpoints/${name}.js`;
  const directory = require(requireDIR);
  return directory;
}

router.get('/auto_like', rte('GET/auto_like'));
router.get('/follower_count', rte('GET/follower_count'));
router.get('/follower_count_new', rte('GET/follower_count_new'));
router.get('/follower_count_unfollowers', rte('GET/follower_count_unfollowers'));
router.get('/new_followers', rte('GET/new_followers'));
router.get('/unfollowers', rte('GET/unfollowers'));

router.post('/auto_like', rte('POST/auto_like'));
router.post('/unfollow', rte('POST/unfollow'));

router.all('/*', () => {
  const error = {
    status: 404,
    message: 'Endpoint is invalid or does not exist.',
    render: false
  };
  throw error;
});

module.exports = router;
