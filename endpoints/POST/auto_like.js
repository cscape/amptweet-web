var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var mongoURL = process.env.MONGODB_URI;

let autolike = function (req, res) {
  if (req.user) {
    let setStatus;
    if (req.body.turn) {
      setStatus = req.body.turn === 'on' ? true : false;
    } else if (req.query['turn']) {
      setStatus = req.query['turn'] === 'on' ? true : false;
    }
    
    let query = {"twitter.id": req.user.profile.id};
    MongoClient.connect(mongoURL, function (err, db) {
      assert.equal(null, err);
      db.collection("users", function (err, collection) {
        collection.findOne(query, function (err, doc) {
          collection.findOneAndUpdate(query, { $set: 
            {
              services: {
                autolike: setStatus
              }
            }
          });
          statusOnOff(setStatus);
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
  } else {
    res.end();
  }
}

module.exports = autolike;
