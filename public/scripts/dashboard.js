$.get('/api/follower_count', (data) => {
  const count = data.data.count;
  $('#followerCount b').text(count);
  $('#followerCount').append(' Followers');
});

$.get('/api/new_followers', (data) => {
  $('body md-content.main').append('<div class="_mtxs newfollows" container>');
  $('.newfollows').append('<h4>New Followers</h4>');
  $('.newfollows').append('<ul>');
  if (data.data && data.data.users) {
    data.data.users.forEach((item, index) => {
      $('.newfollows ul').append(`
              <li>
                  <img src="${item.profile_image_url_https}">
                  <a href="https://www.twitter.com/${item.screen_name}">
                      <span>
                          <b> ${item.name} </b>
                      </span>
                      <span>@${item.screen_name}</span>
                  </a>
              </li>
          `);
    });
  }
});

$.get('/api/unfollowers', (data) => {
  $('body md-content.main').append('<div class="_mtxs unfollows" container>');
  $('.unfollows').append('<h4>Unfollowers</h4>');
  $('.unfollows').append('<ul>');
  if (data.data && data.data.users) {
    data.data.users.forEach((item, index) => {
      $('.unfollows ul').append(`
              <li>
                  <img src="${item.profile_image_url_https}">
                  <a href="https://www.twitter.com/${item.screen_name}">
                      <span>
                          <b> ${item.name} </b>
                      </span>
                      <span>@${item.screen_name}</span>
                  </a>
              </li>
          `);
    });
  }
});

AmpTweet.controller('autolike', ['$http', function($http) {
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
  
  /*$scope.autolike.init = function() {
    $scope.autolike.loading = true;
    if ($scope.autolike.status === true) {
      return  $http
      .get('/api/stuff');
      .then(data => {
        console.log('Boom!', data);
      });
  
        $.post('/api/auto_like', { turn: 'off' }, (data) => {
          if (data.data.status === true) {
            $scope.autolike.status = true;
            $scope.autolike.loading = false;
            resolve(true);
          } else {
            $scope.autolike.status = false;
            $scope.autolike.loading = false;
            resolve(false);
          }
        });
      });
    } else {
      return $q(function(resolve, retract) {
        $.post('/api/auto_like', { turn: 'on' }, (data) => {
          if (data.data.status === true) {
            $scope.autolike.status = true;
            $scope.autolike.loading = false;
            resolve(true);
          } else {
            $scope.autolike.status = false;
            $scope.autolike.loading = false;
            resolve(false);
          }
        });
      });
    }
  };*/
}]);
