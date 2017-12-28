let express = require('express');
let MongoClient = require('mongodb').MongoClient;
let assert = require('assert');

const autolike = function (req, res) {
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

module.exports = autolike;
