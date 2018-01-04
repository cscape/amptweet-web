const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const Twitter = require('twitter');

const mongoURL = process.env.MONGODB_URI;
const Services = {};
const debugStatus = typeof v8debug === 'object'
  || /--debug|--inspect/.test(process.execArgv.join(' '));

Array.prototype.diff = function (compareToArray) {
  return this.filter(i => compareToArray.indexOf(i) < 0);
};

if (!debugStatus) {
  console.log('Services started.');

  (function AutoLiker() {
    /** Twitter Accounts Tracker
     * @description Keeps track of all accounts and
     * whether the Tweet-Liker is on or off.
     * @type {{accounts: {id: {accessToken: string, accessTokenSecret: string, enabled: boolean}}}}
     */
    const tracker = {
      accounts: {},
      /** Reset Accounts List
       * @desc Reset the accounts list in the tracker.
       * @return {true} Returns true
       */
      reset: () => {
        this.accounts = {};
        return true;
      }
    };

    /** MongoDB filtering query
     * @description This filter selects only
     * users with the autolike service turned on.
     */
    const query = { 'services.autolike': true };
    /** @desc Interval is used to check for updates */
    let dbInterval;
    MongoClient.connect(mongoURL, (err, db) => {
      /** @desc Ensures no errors occurred */
      assert.equal(null, err);
      /** Opens users collection in database */
      db.collection('users', (err, collection) => {
        dbInterval = setInterval(() => {
          collection.find(query, (err, docs) => {
            tracker.reset();
            docs.forEach((doc, index) => {
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
     * @param {{accessToken: string, accessTokenSecret: string, id: number}} credentials
     * An object consisting of properties accessToken, accessTokenSecret, and the Twitter ID.
     * @param {boolean} useStream Choose whether to use the stream or not (not supported)
     * @return {null} Doesn't return anything.
     */
    function initLiker(credentials, useStream) {
      const client = new Twitter({
        consumer_key: process.env.TWITTER_CONSUMER_KEY,
        consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
        access_token_key: credentials.accessToken,
        access_token_secret: credentials.accessTokenSecret
      });
      let lastTweet;

      /** Check Twitter Timeline
       * @return {null} Doesn't return anything.
       */
      function checkTL() {
        console.log(`Sent request for ${credentials.id}`);
        client.get('statuses/home_timeline', {
          count: 15, since_id: lastTweet, include_entities: false
        }, (error, tweets, response) => {
          console.log(`Got response for ${credentials.id}`);
          if (!error) {
            const tweet = tweets[0];
            lastTweet = tweet.id_str;
            if (tweet.user.id_str !== credentials.id
             && tweet.favorited !== true) {
              client.post('favorites/create', {
                id: tweet.id_str, include_entities: false
              }, (error, tweet, response) => {
                console.log(`Got LIKE response for ${credentials.id}`);
                if (error) console.error(error);
                else console.log(`Liked ${tweet.id_str}`);
              });
            }
          } else {
            console.log(error);
          }
        });
      }

      if (useStream === false) {
        const interval = setInterval(() => { checkTL(); }, 600000); // every 6 minutes

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
              // OK to go

            client.stream('statuses/filter', {

            });
          }
        }
      }
    }
  }());
} else {
  console.log('Services failed to start due to debug status.');
}

Services.UpdateFollowers = (id, token, secret) => {
  const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: token,
    access_token_secret: secret
  });
  const struct = {
    user_id: id,
    counts: {
      followers: 0,
      new_followers: 0,
      unfollowers: 0
    },
    followers: [],
    unfollowers: [],
    new_followers: []
  };
  const findOp = { user_id: id };
  // Use connect method to connect to the server
  MongoClient.connect(mongoURL, (err, db) => {
    assert.equal(null, err);
    db.createCollection('twitter-stats', (err, results) => {
      results.findOne(findOp, (err, doc) => {
        const getFollowers = function (callback) {
          /** Gets followers list from Twitter */
          this.getList = (callback) => {
            let cursor = -1;
            function repeatList() {
              client.get('followers/list',
                { user_id: id,
                  cursor,
                  count: 200,
                  skip_status: true,
                  include_user_entities: false }, (err, data, raw) => {
                    const followerList = struct.followers;
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
          };
          this.getCount = (callback) => {
            client.get('users/show', { user_id: id }, function (err, data) {
              struct.counts.followers = data.followers_count;
              this.getList(callback);
            });
          };
          // Initiates getFollowers.getCount() when getFollowers() is called
          this.getCount(callback);
        };

        if (doc) {
          getFollowers(() => {
            // ["398233278", "7328737129401", "438792910", etc...]
            const NewFollowers = struct.followers.map((item, index) => {
              if (item.hasOwnProperty('id_str')) {
                return item.id_str;
              }
              return null;
            });
            const OldFollowers = doc.followers.map((item, index) => {
              if (item.hasOwnProperty('id_str')) {
                return item.id_str;
              }  
                return null;
              
            });

            const unfollowerIDs = OldFollowers.diff(NewFollowers);
            const newFollowerIDs = NewFollowers.diff(OldFollowers);

            const unfollowerList = doc.followers.filter((item) => {
              if (unfollowerIDs.indexOf(item.id_str) >= 0) {
                return item;
              }
            });
            const newFollowerList = struct.followers.filter((item) => {
              if (newFollowerIDs.indexOf(item.id_str) >= 0) {
                return item;
              }
            });

            struct.unfollowers = unfollowerList;
            struct.new_followers = newFollowerList;
            struct.counts.new_followers = newFollowerIDs.length;
            struct.counts.unfollowers = unfollowerIDs.length;

            results.findOneAndUpdate(findOp, { $set: struct }, (err, result1) => {
              db.close();
            });
          });
        } else {
          getFollowers(() => {
            results.insertOne(struct, (err, res) => {
              db.close();
            });
          });
        }
      });
    });
  });
};

Services.UpdateFollowers = (id, token, secret) => {
  const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: token,
    access_token_secret: secret
  });
  const struct = {
    user_id: id,
    counts: {
      followers: 0,
      new_followers: 0,
      unfollowers: 0
    },
    unfollowers: [],
    followers: []
  };
  function filterUserData(user, callback) {
    let userNew = {};
    const allowedKeys = [
      'id_str',
      'name',
      'screen_name',
      'protected',
      'followers_count',
      'friends_count',
      'created_at',
      'favourites_count',
      'lang',
      'profile_image_url_https',
      'following',
      'follow_request_sent',
      'muting',
      'blocking',
      'blocked_by'
    ];
    for (var property in user) {
      if (allowedKeys.indexOf(property) > -1) {
        userNew[property] = user[property];
      }
      if (Object.keys(userNew).length >= allowedKeys.length) {
        callback(userNew);
        return userNew;
      }
    }
  }
  const findOp = { user_id: id };
  // Use connect method to connect to the server
  MongoClient.connect(mongoURL, (err, db) => {
    assert.equal(null, err);
    db.createCollection('twitter-stats', (err, results) => {
      results.findOne(findOp, (err, doc) => {
        const getFollowers = function (callback) {
          /** Gets followers list from Twitter */
          this.getList = (callback) => {
            let cursor = -1;
            function repeatList() {
              client.get('followers/list',
                { user_id: id,
                  cursor,
                  count: 200,
                  skip_status: true,
                  include_user_entities: false }, (err, data, raw) => {
                    if (err) {
                      throw ({
                        status: 500,
                        message: err.errors,
                        render: false
                      });
                    }
                    const followerList = struct.followers;
                    const users = data.users;
                    struct.followers = followerList.concat(users);
                    cursor = data.next_cursor_str;
                    if (parseInt(cursor) === 0) {
                      callback();
                    } else {
                      repeatList();
                    }
                  });
            }
            repeatList();
          };
          this.getCount = (callback) => {
            client.get('users/show', { user_id: id }, function (err, data) {
              struct.counts.followers = data.followers_count;
              this.getList(callback);
            });
          };
          // Initiates getFollowers.getCount() when getFollowers() is called
          this.getCount(callback);
        };

        if (doc) {
          getFollowers(() => {
            // ["398233278", "7328737129401", "438792910", etc...]
            const NewFollowers = struct.followers.map((item, index) => {
              if (item.hasOwnProperty('id_str')) {
                return item.id_str;
              }
              return null;
            });
            const OldFollowers = doc.followers.map((item, index) => {
              if (item.hasOwnProperty('id_str')) {
                return item.id_str;
              }
              return null;
            });

            const unfollowerIDs = OldFollowers.diff(NewFollowers);
            const newFollowerIDs = NewFollowers.diff(OldFollowers);

            const metaList = (struct.followers.map((item, index) => {
              return filterUserData(item, ($this) => {
                $this.metadata = {};
                if (newFollowerIDs.indexOf(item.id_str) >= 0) {
                  $this.metadata.new_follower = true;
                  $this.metadata.followed_at = (new Date()).toString();
                  $this.metadata.unfollower = false;
                  return $this;
                } else {
                  $this.metadata.unfollower = false;
                  $this.metadata.new_follower = false;
                  return $this;
                }
              });
            }));

            const unfollowerList = doc.followers.filter((item) => {
              if (unfollowerIDs.indexOf(item.id_str) >= 0) {
                return filterUserData(item, ($this) => {
                  $this.metadata = {};
                  $this.metadata.unfollower = true;
                  $this.metadata.new_follower = false;
                  $this.metadata.unfollowed_at = (new Date()).toString();
                  return $this;
                });
              }
            });

            struct.counts.new_followers = newFollowerIDs.length;
            struct.counts.unfollowers = unfollowerIDs.length;
            struct.unfollowers = unfollowerList;
            struct.followers = metaList;

            results.findOneAndUpdate(findOp, { $set: struct }, (err2, result1) => {
              db.close();
            });
          });
        } else {
          getFollowers(() => {
            const metaList = (struct.followers.map((item, index) => {
              return filterUserData(item, ($this) => {
                $this.metadata = {};
                $this.metadata.unfollower = false;
                $this.metadata.new_follower = false;
                $this.metadata.followed_at = (new Date()).toString();
                return $this;
              });
            }));
            struct.followers = metaList;
            struct.counts.unfollowers = 0;
            struct.counts.new_followers = 0;
            results.insertOne(struct, (err2, res) => {
              db.close();
            });
          });
        }
      });
    });
  });
};

module.exports = Services;
