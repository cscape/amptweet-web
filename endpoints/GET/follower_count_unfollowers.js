const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const mongoURL = process.env.MONGODB_URI;

module.exports = function (req, res) {
  if (req.user) {
    const query = { user_id: req.user.profile.id };
    MongoClient.connect(mongoURL, (err, db) => {
      assert.equal(null, err);
      db.collection('twitter-stats', (err, collection) => {
        collection.findOne(query, (err, doc) => {
          console.log(doc);
          if (doc) {
            status(doc.counts.unfollowers);
            db.close();
          } else {
            throw ({
              status: 500,
              message: 'User does not exist.',
              render: false
            });
          }
        });
      });
    });

    function status(count) {
      return res.send({
        status: 200,
        message: 'OK',
        data: {
            count
        }
      });
    }
  } else {
    res.end();
  }
};
