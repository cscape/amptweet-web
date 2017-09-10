var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var mongoURL = process.env.MONGODB_URI;

// Use connect method to connect to the server
MongoClient.connect(url, function(err, db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");

  db.close();
});

let autolike = function (req, res) {
  let userID = req.user.profile.id;

}

module.exports = autolike;
