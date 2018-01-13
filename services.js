const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');
const Twitter = require('twitter');

const mongoURL = process.env.MONGODB_URI;
const Services = {};
Services.UpdateFollowersData = {};

const debugStatus = typeof v8debug === 'object'
  || /--debug|--inspect/.test(process.execArgv.join(' '));

/** Compares two arrays and returns the overlapping values
 * @param {array} one The array to be compared from
 * @param {array} two The array to be compared to
 * @returns {array} Array including only common values in both one and two.
 */
const arrayDiff = (one, two) => one.filter(i => two.indexOf(i) < 0);

if (!debugStatus) {
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
      let interval;
      let lastTweet;

      /** Check Twitter Timeline
       * @return {null} Doesn't return anything.
       */
      function checkTL() {
        client.get('statuses/home_timeline', {
          count: 15, since_id: lastTweet, include_entities: false
        }, (error, tweets, response) => {
          if (!error && response) {
            const tweet = tweets[0];
            lastTweet = tweet.id_str;
            if (tweet.user.id_str !== credentials.id
             && tweet.favorited !== true) {
              client.post('favorites/create', {
                id: tweet.id_str, include_entities: false
              }, (err, likedTweets, rawdata) => {
                if (rawdata && likedTweets);
              });
            }
          } else {
            switch (error.code) {
              case 89: // Invalid/expired token, delete from DB
                clearInterval(interval);
                break;
              case 32: // Could not authenticate, delete from DB
                clearInterval(interval);
                break;
              case 326: // Locked account, delete from DB
                clearInterval(interval);
                break;
              case 88: // Rate limit exceeded
                break;
              default: // other errors
                console.error(error);
                break;
            }
          }
        });
      }

      if (useStream === false) {
        interval = setInterval(() => { checkTL(); }, 900000); // every 9 minutes

        if (tracker.accounts[credentials.id] && tracker.accounts[credentials.id].enabled === true) {
          if (tracker.accounts[credentials.id].instances) {
            tracker.accounts[credentials.id].instances[0] += 1;
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
            tracker.accounts[credentials.id].instances[0] += 1;
          } else if (!tracker.accounts[credentials.id].instances) {
            tracker.accounts[credentials.id].instances = [0];
              // OK to go

            client.stream('statuses/filter', {

            });
          }
        }
      }
    }

    /** MongoDB filtering query
     * @description This filter selects only
     * users with the autolike service turned on.
     */
    const query = { 'services.autolike': true };
    MongoClient.connect(mongoURL, (err, db) => {
      /** @desc Ensures no errors occurred */
      assert.equal(null, err);
      /** Opens users collection in database */
      db.collection('users', (err2, collection) => {
        setInterval(() => {
          collection.find(query, (err3, docs) => {
            tracker.reset();
            docs.forEach((doc) => {
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
  }());
} else {
  console.log('Services failed to start due to debug status.');
}

Services.UpdateFollowersData.filterUserData = (user, callback1) => {
  const $finalUser = {};
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
  Object.keys(user).forEach((property) => {
    if (allowedKeys.indexOf(property) > -1) {
      $finalUser[property] = user[property];
    }
    if (Object.keys($finalUser).length >= allowedKeys.length) {
      callback1($finalUser);
    }
  });
};

Services.UpdateFollowersData.Struct = class Struct {
  constructor() {
    this.struct = {
      user_id: 0,
      counts: {
        followers: 0,
        new_followers: 0,
        unfollowers: 0
      },
      unfollowers: [],
      followers: []
    };
  }
};

Services.UpdateFollowersData.connectDB = (callback) => {
  MongoClient.connect(mongoURL, (err, dbObject) => {
    if (err) throw err;
    else callback(dbObject);
  });
};

Services.UpdateFollowersData.twitterCollection = (dbObject, callback) => {
  dbObject.createCollection('twitter-stats', (err, collectionObject) => {
    if (err) throw err;
    else callback(collectionObject);
  });
};

Services.UpdateFollowersData.findInDatabase = (collectionObject, findOptions, callback) => {
  collectionObject.findOne(findOptions, (err, doc) => {
    if (err) throw err;
    else callback(doc);
  });
};

Services.UpdateFollowersData.DBHandler = (findOptions, callback) => {
  const dbHandlers = Services.UpdateFollowersData;
  dbHandlers.connectDB((dbObject) => {
    dbHandlers.twitterCollection(dbObject, (collectionObject) => {
      dbHandlers.findInDatabase(collectionObject, findOptions, (doc) => {
        callback(doc, collectionObject, dbObject);
      });
    });
  });
};

/** Gets followers list from Twitter
 * @param {object[]} client A new instance of a Twitter object.
 * @param {number} userID The user ID of a Twitter user.
 * @param {function} callback The callback function
 * @returns {void} Does not return anything
 */
Services.UpdateFollowersData.getFollowers = (client, struct, userID, callback) => {
  Services.UpdateFollowersData.getFollowerCount(client, struct, userID, (newStruct) => {
    Services.UpdateFollowersData.getFollowerList(client, newStruct, userID, (followerList,
      struct2) => {
      callback(followerList, struct2);
    });
  });
};

Services.UpdateFollowersData.getFollowerCount = (client, struct, userID, callback) => {
  client.get('users/show', { user_id: userID }, (err, data) => {
    struct.counts.followers = data.followers_count;
    callback(struct);
  });
};

Services.UpdateFollowersData.getFollowerList = (client, newStruct, userID, callback) => {
  let cursor = -1;
  const repeatList = () => {
    const options = {
      user_id: userID,
      cursor,
      count: 200,
      skip_status: true,
      include_user_entities: false
    };
    client.get('followers/list', options, (err, data) => {
      if (err) throw err;

      const followerList = newStruct.followers;
      newStruct.followers = followerList.concat(data.users);
      cursor = data.next_cursor_str;

      // Checks to see if there's no more pages of followers left
      if (parseInt(cursor, 10) === 0) callback(newStruct.followers, newStruct);
      else repeatList();
    });
  };
  repeatList();
};

Services.UpdateFollowersData.metaFollowerSort = (doc, struct, callback) => {
  const NewFollowers = struct.followers.map((item) => {
    if (item.id_str) return item.id_str;
    return null;
  });
  const OldFollowers = doc.followers.map((item) => {
    if (item.id_str) return item.id_str;
    return null;
  });

  const unfollowerIDs = arrayDiff(OldFollowers, NewFollowers);
  const newFollowerIDs = arrayDiff(NewFollowers, OldFollowers);

  Services.UpdateFollowersData.createMeta(unfollowerIDs, newFollowerIDs, doc, struct,
  (followerList, unfollowerList, newStruct) => {
    callback(followerList, unfollowerList, newFollowerIDs.length, unfollowerIDs.length, newStruct);
  });
};

Services.UpdateFollowersData.createMeta = (unfollowerIDs, newFollowerIDs, doc, struct, callback) => {
  const followerList = struct.followers.map((item) => {
    let $item;
    Services.UpdateFollowersData.filterUserData(item, (user) => {
      const $this = user;
      if (!$this.metadata) $this.metadata = {};
      if (newFollowerIDs.indexOf(item.id_str) >= 0) {
        $this.metadata.new_follower = true;
        $this.metadata.followed_at = (new Date()).toString();
        $this.metadata.unfollower = false;
        $item = $this;
        return $this;
      }
      $this.metadata.unfollower = false;
      $this.metadata.new_follower = false;
      $item = $this;
      return $this;
    });
    return $item;
  });
  const unfollowerList = doc.followers.filter((item) => {
    let $item = null;
    if (unfollowerIDs.indexOf(item.id_str) >= 0) {
      Services.UpdateFollowersData.filterUserData(item, (user) => {
        const $this = user;
        if (!$this.metadata) $this.metadata = {};
        $this.metadata.unfollower = true;
        $this.metadata.new_follower = false;
        $this.metadata.unfollowed_at = (new Date()).toString();
        $item = $this;
        return $this;
      });
    }
    return $item;
  });
  callback(followerList, unfollowerList, struct);
};

Services.UpdateFollowersData.followSort = (doc, struct, collectionObject, callback) => {
  const userID = struct.user_id;
  Services.UpdateFollowersData.metaFollowerSort(doc, struct, (followerList, unfollowerList,
    newFollowerIDs, unfollowerIDs, newStruct) => {
    newStruct.counts.new_followers = newFollowerIDs;
    newStruct.counts.unfollowers = unfollowerIDs;
    newStruct.unfollowers = unfollowerList;
    newStruct.followers = followerList;
    collectionObject.findOneAndUpdate({ user_id: userID }, { $set: newStruct }, (err, response) => {
      if (err) throw err;
      callback(newStruct, response);
    });
  });
};

Services.UpdateFollowersData.followSortNew = (collectionObject, struct, callback) => {
  const metaList = struct.followers.map((item) => {
    let $item;
    Services.UpdateFollowersData.filterUserData(item, (user) => {
      const $this = user;
      if (!$this.metadata) $this.metadata = {};
      $this.metadata.unfollower = false;
      $this.metadata.new_follower = true;
      $this.metadata.followed_at = (new Date()).toString();
      $item = $this;
      return $this;
    });
    return $item;
  });
  struct.followers = metaList;
  struct.counts.unfollowers = 0;
  struct.counts.new_followers = 0;
  collectionObject.insertOne(struct, (err, response) => {
    if (err) throw err;
    else callback(struct, response);
  });
};

Services.UpdateFollowers = (userID, token, secret, callback) => {
  const client = new Twitter({
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: token,
    access_token_secret: secret
  });
  const struct = (new Services.UpdateFollowersData.Struct()).struct;
  struct.user_id = userID;

  // Use connect method to connect to the server
  Services.UpdateFollowersData.DBHandler({ user_id: userID }, (doc, collectionObject) => {
    Services.UpdateFollowersData.getFollowers(client, struct, userID, (followerList, newStruct) => {
      if (doc) {
        Services.UpdateFollowersData.followSort(doc, newStruct, collectionObject, () => {
          callback();
        });
      } else {
        Services.UpdateFollowersData.followSortNew(collectionObject, newStruct, () => {
          callback();
        });
      }
    });
  });
};

module.exports = Services;
