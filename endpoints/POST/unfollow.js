let express = require('express');
let MongoClient = require('mongodb').MongoClient;
let assert = require('assert');

const unfollow = function (req, res) {
  let userToUnfollow;
  if (req.body.unfollow) {
    userToUnfollow = req.body.unfollow;
  } else if (req.query['unfollow']) {
    userToUnfollow = req.query['unfollow'];
  }

  let query = {"user_id": req.user.profile.id};
    MongoClient.connect(mongoURL, function(err, db) {
      assert.equal(null, err);
      db.collection("twitter-stats", function (err, collection) {
        collection.findOne(query, function (err, doc) {
          if (doc) {
            console.log(doc.counts);
            status(doc.counts.followers);
            db.close();
          } else {
            throw ({
                status: 500,
                message: "User does not exist.",
                render: false
            })
          }
        })
      });  
    });

  if (req.user) {
    function status(list) {
      return res.send({
        'status': 200,
        'message': 'OK',
        'data': {
          users: list
        }
      });
    }
  } else {
    res.end();
  }
};

module.exports = unfollow;
