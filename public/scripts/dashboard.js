AmpTweet.controller('dashHead', ['$http', function dashHead($http){
  let ctrl = this;
  $http.get('/api/follower_count').then((response) => {
    const count = response.data.data.count;
    ctrl.followerCount = count;
  });
  $http.get('/api/follower_count_new').then((response) => {
    const count = response.data.data.count;
    ctrl.newFollowerCount = count;
  });
  $http.get('/api/follower_count_unfollowers').then((response) => {
    const count = response.data.data.count;
    ctrl.unfollowerCount = count;
  });
}]);

AmpTweet.controller('unfollowerCtrl', ['$http', function unfollowerCtrl($http) {
  let ctrl = this;
  ctrl.show = false;
  ctrl.unfollowers = [];
  $http.get('/api/unfollowers').then((response) => {
    if (response.data.data && response.data.data.users) {
      ctrl.show = true;
      ctrl.unfollowers = response.data.data.users;
    } else {
      ctrl.show = false;
    }
  });
}]);

AmpTweet.controller('newfollowerCtrl', ['$http', function unfollowerCtrl($http) {
  let ctrl = this;
  ctrl.show = false;
  ctrl.unfollowers = [];
  $http.get('/api/new_followers').then((response) => {
    if (response.data.data && response.data.data.users) {
      ctrl.show = true;
      ctrl.newfollowers = response.data.data.users;
    } else {
      ctrl.show = false;
    }
  });
}]);

AmpTweet.controller('autolike', ['$http', function autolike($http) {
  let autolike = this;
  autolike.status = false;
  autolike.loading = true;
  $http.get('/api/auto_like').then((response) => {
    if (response.data.data.status === true) {
      autolike.status = true;
      autolike.loading = false;
    } else {
      autolike.status = false;
      autolike.loading = false;
    }
  });

  autolike.init = function init() {
    let status = {};
    if (autolike.status === true) {
      status = { turn: 'off' };
    } else {
      status = { turn: 'on' };
    }
    autolike.loading = true;
    $http.post('/api/auto_like', status).then((response) => {
      if (response.data.data.status === true) {
        autolike.status = true;
        autolike.loading = false;
      } else {
        autolike.status = false;
        autolike.loading = false;
      }
    });
  };
}]);
