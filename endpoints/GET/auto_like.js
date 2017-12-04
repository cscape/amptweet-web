const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

const mongoURL = process.env.MONGODB_URI;

/** Tweet Auto-Like Checker
 * @param {object} req Express request object
 * @param {object} res Express response object
 * @return {null} Doesn't return anything.
 */
const autolike = function autolike(req, res) {
  function dispatcher(status) {
    return res.send({
      status: 200,
      message: 'OK',
      data: {
        status
      }
    });
  }
  if (req.user) {
    const query = { 'twitter.id': req.user.profile.id };
    MongoClient.connect(mongoURL, (err, db) => {
      assert.equal(null, err);
      db.collection('users', (err, collection) => {
        collection.findOne(query, (err1, doc1) => {
          console.log(doc1);
          if (typeof doc1.services !== 'undefined') {
            collection.findOne(query, (err2, doc2) => {
              dispatcher(doc2.services.autolike);
              db.close();
            });
          } else {
            collection.findOneAndUpdate(query, { $set:
            {
              services: {
                autolike: false
              }
            }
            });
            dispatcher(false);
          }
        });
      });
    });
  } else {
    res.end();
  }
};

module.exports = autolike;
