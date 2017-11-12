var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var mongoURL = process.env.MONGODB_URI;
var Twitter = require('twitter');

console.log("Services started.");
(function(){ 
  /** Twitter Accounts Tracker
   * @description Keeps track of all accounts and
   * whether the Tweet-Liker is on or off.
   * @type {{accounts: {id: {accessToken: string, accessTokenSecret: string, enabled: boolean}}}}
   */
  let tracker = {
    accounts: {},
    /** Reset Accounts List
     * @desc Reset the accounts list in the tracker.
     */
    reset: () => {
      this.accounts = {};
      return true;
    }
  }

  /** MongoDB filtering query
   * @description This filter selects only 
   * users with the autolike service turned on.
   */
  let query = {"services.autolike": true};
  /** @desc Interval is used to check for updates */
  let dbInterval;
  MongoClient.connect(mongoURL, function(err, db) {
    /** @desc Ensures no errors occurred */
    assert.equal(null, err);
    /** Opens users collection in database */
    db.collection("users", function (err, collection) {
      dbInterval = setInterval(function () {
        collection.find(query, function (err, docs) {
          tracker.reset();
          docs.forEach(function(doc, index) {
            tracker.accounts[doc.twitter.id] = {
              accessToken: doc.twitter.accessToken,
              accessTokenSecret: doc.twitter.accessTokenSecret,
              enabled: true
            };
            initLiker({
              accessToken: doc.twitter.accessToken,
              accessTokenSecret: doc.twitter.accessTokenSecret,
              id: doc.twitter.id
            }, false);
          });
        });
      }, 15e3);
    }); 
  });
  
  /** Initiate Liker Service
   * @desc Initiates the autoliker service for a specified user.
   */
  function initLiker(credentials, useStream) {
    let client = new Twitter({
      consumer_key: process.env.TWITTER_CONSUMER_KEY,
      consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
      access_token_key: credentials.accessToken,
      access_token_secret: credentials.accessTokenSecret
    });
    let lastTweet;
    function checkTL() {
      if (tracker.accounts[credentials.id] && tracker.accounts[credentials.id].enabled === true) {
        if (tracker.accounts[credentials.id].instances) {
          tracker.accounts[credentials.id].instances[0]++;
          clearInterval(interval);
        } else if (!tracker.accounts[credentials.id].instances) {
          tracker.accounts[credentials.id].instances = [0];
          client.get('statuses/home_timeline', {
            count: 1, since_id: lastTweet, include_entities: false
          }, function(error, tweets, response) {
            if (!error) {
              let tweet = tweets[0];
              console.log(`Got ${tweet.id_str}`)
              lastTweet = tweet.id_str;
              client.post('favorites/create', {
                id: tweet.id_str, include_entities: false
              }, function(error, tweet, response){
                if (error) console.error(error);
                else console.log(`Liked ${tweet.id_str}`);
              });
            } else {
              console.log(error);
            }
          });
        }
      } else {
        clearInterval(interval);
      }
    }
    checkTL();
    var interval = setInterval(() => {checkTL()}, 240e3);
  }
})();