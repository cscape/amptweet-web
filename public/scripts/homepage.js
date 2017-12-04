AmpTweet.controller('twitterSignIn', ['$scope', function($scope) {
  this.signInText = 'Sign in with Twitter';
  this.signIn = function() {
    window.location = '/auth/twitter/redirect';
  };
}]);