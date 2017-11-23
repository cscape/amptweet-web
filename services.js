var express = require('express');
var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');
var mongoURL = process.env.MONGODB_URI;
var Twitter = require('twitter');

let Services = {};

console.log("Services started.");

Array.prototype.diff = function(compareToArray) {
  return this.filter(function(i) {return compareToArray.indexOf(i) < 0;});
};

(function AutoLiker(){ 
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
    if (useStream === false) {
      let interval = setInterval(() => {checkTL()}, 600000); //every 6 minutes
      let lastTweet;
      function checkTL() {
        console.log(`Sent request for ${credentials.id}`);
        client.get('statuses/home_timeline', {
          count: 15, since_id: lastTweet, include_entities: false
        }, function(error, tweets, response) {
          console.log(`Got response for ${credentials.id}`);
          if (!error) {
            let tweet = tweets[0];
            lastTweet = tweet.id_str;
            if (tweet.user.id_str !== credentials.id) {
              client.post('favorites/create', {
                id: tweet.id_str, include_entities: false
              }, function(error, tweet, response){
                console.log(`Got LIKE response for ${credentials.id}`)
                if (error) console.error(error);
                else console.log(`Liked ${tweet.id_str}`);
              });
            }
          } else {
            console.log(error);
          }
        });
      }
      if (tracker.accounts[credentials.id] && tracker.accounts[credentials.id].enabled === true) {
        if (tracker.accounts[credentials.id].instances) {
          tracker.accounts[credentials.id].instances[0]++;
          clearInterval(interval);
        } else if (!tracker.accounts[credentials.id].instances) {
          tracker.accounts[credentials.id].instances = [0];
          checkTL();
        }
      } else {
        clearInterval(interval);
      }
    } else if (useStream === true) {
      if (tracker.accounts[credentials.id] && tracker.accounts[credentials.id].enabled === true) {
          if (tracker.accounts[credentials.id].instances) {
            tracker.accounts[credentials.id].instances[0]++;
          } else if (!tracker.accounts[credentials.id].instances) {
            tracker.accounts[credentials.id].instances = [0];
            //OK to go

            client.stream('statuses/filter', {
              
            })
          }
      }
    }
  }
})();

Services.UpdateFollowers = (id, token, secret) => {
  let client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: token,
    access_token_secret: secret
  });
  let struct = {
    user_id: id,
    follower_count: 0,
    followers: [],
    unfollowers: [],
    new_followers: []
  };
  let findOp = {"user_id": id};
  console.log(findOp);
  // Use connect method to connect to the server
  MongoClient.connect(mongoURL, function(err, db) {
    assert.equal(null, err);
    db.createCollection("twitter-stats", function (err, results) {
      results.findOne(findOp, function(err, doc){

        let getFollowers = function(callback) {
          this.getList = (callback) => {
            let cursor = -1;
            function repeatList() {
              client.get('followers/list', 
                {user_id: id, cursor: cursor, count: 200,
                  skip_status: true, include_user_entities: false}, function (err, data, raw){
                let followerList = struct.followers;
                struct.followers = followerList.concat(data.users);
                cursor = data.next_cursor_str;
                if (parseInt(cursor) === 0) {
                  callback();
                } else {
                  repeatList();
                }
              });
            }
            repeatList();
          }
          this.getCount = (callback) => {
            client.get('users/show', {user_id: id}, function (err, data){
              struct.follower_count = data.followers_count;
              this.getList(callback);
            });
          }
          // Initiates getFollowers.getCount() when getFollowers() is called
          this.getCount(callback);
        }

        if (doc) {
          getFollowers(function(){
            // ["398233278", "7328737129401", "438792910", etc...]
            let NewFollowers = struct.followers.map(function(item, index) {
              if (item.hasOwnProperty('id_str')) {
                return item.id_str;
                } else {
                return null;
                }
            });
            let OldFollowers = doc.followers.map(function(item, index) {
              if (item.hasOwnProperty('id_str')) {
                return item.id_str;
                } else {
                return null;
                }
            });

            let unfollowerIDs = OldFollowers.diff(NewFollowers);
            let newFollowerIDs = NewFollowers.diff(OldFollowers);
            
            let unfollowerList = doc.followers.filter(function(item) {
              if (unfollowerIDs.indexOf(item.id_str) >= 0) {
                return item;
              }
            });
            let newFollowerList = struct.followers.filter(function(item) {
              if (newFollowerIDs.indexOf(item.id_str) >= 0) {
                return item;
              }
            });

            struct.unfollowers = unfollowerList;
            struct.new_followers = newFollowerList;

            results.findOneAndUpdate(findOp, {$set: struct}, function (err, result1){
              db.close();
            });
          });
        } else {
          getFollowers(function(){
            results.insertOne(struct, function (err, res) {
              db.close();
            })
          })
        }
      })
    });
    
  });
};

module.exports = Services;