# ![AmpTweet](https://f000.backblazeb2.com/file/brand-assets/Logotype_Black.png)&nbsp;&nbsp;&nbsp;[![Build Status](https://www.bitrise.io/app/dbbcddd2536e0248/status.svg?token=cw7O2wKQdMdSWbrcdbo3jw)](https://www.bitrise.io/app/dbbcddd2536e0248) [![build status](https://gitlab.com/amptweet/amptweet-web/badges/master/build.svg)](https://gitlab.com/amptweet/amptweet-web/commits/master)

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

## About Mirroring

**Please do not open pull requests on GitHub.** Currently, only merge requests will be accepted on GitLab.

This project is currently hosted on GitLab and continuously mirrored on GitHub.

### Why?
It allows for easier discovery of the project and many free development services are available only to GitHub users.
Mirroring the project on GitHub allows for using CI and deployment services not available on GitLab.
This reduces the costs necessary to maintain the project and keeps it free.

### How?
The project is being mirrored using a proprietary Node.js package created by @ciolt which uses GitLab webhooks to do a one-directional sync to GitHub.
A bi-directional sync may be considered in the future, but is not necessary as of right now.
GitLab's remote repository push feature is too slow and a faster, more reliable method was needed.

### Note about branches

Branching works really weirdly with the mirror on GitHub.
It's quite wonky, not recommended to use branches.
Consider a merge request into the master branch instead.

## License

ISC
