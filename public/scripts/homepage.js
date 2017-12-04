AmpTweet.controller('twitterSignIn', [function() {
  this.signInText = 'Sign in with Twitter';
  this.signIn = function() {
    window.location = '/auth/twitter/redirect';
  };
}]);