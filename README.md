# AmpTweet [![Build Status](https://www.bitrise.io/app/dbbcddd2536e0248/status.svg?token=cw7O2wKQdMdSWbrcdbo3jw)](https://www.bitrise.io/app/dbbcddd2536e0248) [![CircleCI](https://circleci.com/gh/amptweet/amptweet-web.svg?style=svg)](https://circleci.com/gh/amptweet/amptweet-web) [![build status](https://gitlab.com/amptweet/amptweet-web/badges/master/build.svg)](https://gitlab.com/amptweet/amptweet-web/commits/master)

AmpTweet is a project made to bring a high standard of Twitter management to the public ― free!

The testing server is publicly accessible **[here](https://amptweet.herokuapp.com)**.

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
