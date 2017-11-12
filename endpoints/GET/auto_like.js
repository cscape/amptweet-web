var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var mongoURL = process.env.MONGODB_URI;

let autolike = function (req, res) {
  if (req.user) {
    let query = {"twitter.id": req.user.profile.id};
    MongoClient.connect(mongoURL, function(err, db) {
      assert.equal(null, err);
      db.collection("users", function (err, collection) {
        collection.findOne(query, function (err, doc) {
          console.log(doc);
          if (typeof doc.services !== 'undefined') {
            collection.findOne(query, function (err, doc) {
              statusOnOff(doc.services.autolike);
            });
          } else {
            collection.findOneAndUpdate(query, { $set: 
              {
                services: {
                  autolike: false
                }
              }
            });
            statusOnOff(false);
          }
        })
      });  
    });

    function statusOnOff (onOff) {
      return res.send({
        "status": 200,
        "message": "OK",
        "data": {
          "status": onOff
        }
      });
    }
  }
}

module.exports = autolike;
