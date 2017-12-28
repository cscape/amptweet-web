let AmpTweet = angular.module('AmpTweet', ['ngMaterial'])
  .config(function($mdThemingProvider) {
    $mdThemingProvider.theme('default')
      .primaryPalette('red', {
        default: '500'
      })
      .accentPalette('purple', {
        default: '500'
      });
    $mdThemingProvider.theme('default-dark', 'default')
      .dark();
    $mdThemingProvider.theme('follows')
      .primaryPalette('green', {
        default: '500'
      })
      .accentPalette('red', {
        default: '500'
      });
  });

AmpTweet.controller('headerCtrl', [ function() {
  const header = this;
  header.account = {};
  header.account.signOut = function() {
    window.location.href = '/auth/twitter/logout';
  };
}]);

/*$(document).on('ready', () =>  {
  $(".top-bar .account-info .name").click(function (e) {
    e.stopPropagation();
    e.preventDefault();
    let optionsbox = $(".top-bar .account-options");
    let tween;

    if (optionsbox.css("display") === "none") {
      TweenLite.to(optionsbox, 0.5, {
        ease: Power4.easeOut,
        boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.35)",
        top: "3rem",
        opacity: 1,
        display: 'block'
      });
    } else {
      TweenLite.to(optionsbox, 0.5, {
        ease: Power4.easeOut,
        boxShadow: "0px 0px 0px rgba(0, 0, 0, 0.35)",
        top: "2rem",
        opacity: 0,
        display: 'none'
    });
    }
  });
});*/
