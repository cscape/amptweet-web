### **THIS PROJECT IS UNMAINTAINED**

# AmpTweet

AmpTweet is a project made to bring a high standard of Twitter management to the public ― free!

The testing server is publicly accessible **[here](https://amptweet.herokuapp.com)**.

## Quick Start

First, install the dependencies.

```bash
$ npm install
```

Next, you'll need to set up environment variables for the web server to work properly. You'll need to specify your Twitter consumer key and consumer secret which you can obtain on [Twitter Apps](https://apps.twitter.com/). Alternatively, you can also look up keys to other clients already published online such as Tweetbot. You'll also need to set up your own MongoDB instance and obtain its connection URL (with the credentials in it).

### Windows

```console
:: Run these commands within a command prompt
:: with elevated privileges. If you encounter
:: issues try appending each SETX command with
:: the argument /M (adds variable system-wide)
setx TWITTER_CONSUMER_KEY "abc123"
setx TWITTER_CONSUMER_SECRET "321abc123"
setx MONGODB_URI "mongodb://user:password@example.com:100/"
```

### Mac OS X/Linux (Bash)

```bash
$ export TWITTER_CONSUMER_KEY=abc123
$ export TWITTER_CONSUMER_SECRET=321abc123
$ export MONGODB_URI=mongodb://user:password@example.com:100/
```

Next, you can start the server by running `npm start` which will run the start script defined in `package.json`

## License

ISC
