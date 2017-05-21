app.config(function($stateProvider, $authProvider, $httpProvider) {
  $stateProvider.state('download', {
    url: '/download',
    templateUrl: 'js/downloadTrack/views/downloadTrack.view.html',
    controller: 'DownloadTrackController'
  });
  $stateProvider.state('downloadnew', {
    url: '/download/:username/:title',
    templateUrl: 'js/downloadTrack/views/downloadTrack.view.html',
    controller: 'DownloadTrackController'
  });
  $authProvider.instagram({
    clientId: '0b2ab47baa464c31bf6d8e9f301d4469'
  });

  // Instagram
  $authProvider.instagram({
    name: 'instagram',
    url: '/api/download/auth/instagram',
    authorizationEndpoint: 'https://api.instagram.com/oauth/authorize',
    redirectUri: 'https://localhost:1443/download',
    requiredUrlParams: ['scope'],
    scope: ['basic', 'relationships', 'public_content', 'follower_list'],
    scopeDelimiter: '+',
    type: '2.0'
  });

  $authProvider.twitter({
    url: '/api/download/twitter/auth',
    authorizationEndpoint: 'https://api.twitter.com/oauth/authenticate',
    redirectUri: 'https://localhost:1443/download', //must match website
    type: '1.0',
    popupOptions: {
      width: 495,
      height: 645
    }
  });
})

app.controller('DownloadTrackController', function($rootScope, $state, $scope, $http, $location, $window, $q, DownloadTrackService, $sce, $auth, SessionService, $stateParams) {
  $scope.user = SessionService.getUser();
  /* Normal JS vars and functions not bound to scope */
  var playerObj = null;
  $scope.recentTracks = [];
  /* $scope bindings start */
  $scope.trackData = {
    trackName: 'Mixing and Mastering',
    userName: 'la tropical'
  };

  $scope.showSignUp = false;
  if ($state.$current.name == "downloadnew") {
    $scope.showSignUp = true;
  }

  $scope.toggle = true;
  $scope.togglePlay = function() {
    if (!playerObj) {
      $.Zebra_Dialog("Playing not allowed");
    }
    $scope.toggle = !$scope.toggle;
    if ($scope.toggle) {
      playerObj.pause();
    } else {
      playerObj.play();
    }
  }
  $scope.processing = false;
  $scope.embedTrack = false;
  $scope.downloadURLNotFound = false;
  $scope.errorText = '';
  $scope.followBoxImageUrl = 'assets/images/who-we-are.png';

  $scope.initiateDownload = function() {
    $scope.processing = false;
    if ($scope.track.downloadURL && $scope.track.downloadURL !== '') {
      $window.location.href = $scope.track.downloadURL;
    } else {
      $scope.errorText = 'Error! Could not fetch download URL';
      $scope.downloadURLNotFound = true;
    }
  }

  /* Function for Instagram */
  $scope.authenticateInstagram = function() {
    $auth.authenticate('instagram').then(function(response) {
      var userName = $scope.track.socialPlatformValue;
      $http({
        method: "POST",
        url: '/api/download/instagram/follow_user',
        data: {
          'access_token': response.data,
          'q': userName
        }
      }).then(function(user) {
        if (user.data.succ) {
          $scope.initiateDownload();
        }
      });
    });
  }

  /* Function for Twitter */
  $scope.authenticateTwitter = function() {
    $auth.authenticate('twitter').then(function(response) {
      var twitterUsers = [];
      if ($scope.track.socialPlatform == 'twitterFollow') {
        if ($scope.track.socialPlatformValue.indexOf(',') > -1) {
          var userNames = $scope.track.socialPlatformValue.split(',');
          for (var i = 0; i < userNames.length; i++) {
            twitterUsers.push(userNames[i]);
          }
        } else {
          twitterUsers.push($scope.track.socialPlatformValue);
        }

        function followTwitterUser(index) {
          if (index < twitterUsers.length) {
            $http({
                method: "POST",
                url: '/api/download/twitter/follow',
                data: {
                  screen_name: twitterUsers[index],
                  accessToken: response.data,
                  trackID: $scope.track._id
                }
              })
              .then(function(records) {
                index++;
                followTwitterUser(index)
              });
          } else {
            window.location.replace($scope.track.downloadURL);
          }
        }
        followTwitterUser(0);
      } else if ($scope.track.socialPlatform == 'twitterPost') {
        response.data.socialPlatformValue = $scope.track.socialPlatformValue;
        $http({
          method: "POST",
          url: '/api/download/twitter/post',
          data: {
            data: response.data,
            trackID: $scope.track._id
          }
        }).then(function(records) {
          if (records.statusText === "OK") {
            window.location.replace($scope.track.downloadURL);
          } else {
            $.Zebra_Dialog('Error in processing the request. Please try again.');
          }
        });
      }
    });
  }

  /* Function for Youtube */
  $scope.authenticateYoutube = function(track) {
    $scope.processing = true;
    var totalArray = [];
    if ($scope.track.socialPlatformValue) {
      $scope.track.youtube = [];
      if ($scope.track.socialPlatformValue.indexOf(',') > -1) {
        var urls = $scope.track.socialPlatformValue.split(',');
        for (var i = 0; i < urls.length; i++) {
          totalArray.push(urls[i]);
        }
      } else {
        totalArray.push($scope.track.socialPlatformValue);
      }

      //var totalArray = [$scope.track.socialPlatformValue, "https://www.youtube.com/channel/UCbfKEQZZzHN0egYXinbb7jg", "https://www.youtube.com/channel/UCvQyEDsKwJoJLKXeCvY2OfQ", "https://www.youtube.com/channel/UCcqpdWD_k3xM4AOjvs-FitQ", "https://www.youtube.com/channel/UCbA0xiM4E5Sbf1WMmhTGOOg", "https://www.youtube.com/channel/UC2HG82SETkcx8pOE75bYJ6g"]
      var promiseArr = [];
      totalArray.forEach(function(url) {
        var idPromise = new Promise(function(resolve, reject) {
          if (url.includes('/channel/')) {
            resolve(url.substring(url.indexOf('/channel/') + 9, url.length));
          } else {
            var username = url.substring(url.indexOf('/user/') + 6, url.length)
            var idArray = [];
            $http.get('https://www.googleapis.com/youtube/v3/channels?key=AIzaSyBOuRHx25VQ69MrTEcvn-hIdkZ8NsZwsLw&forUsername=' + username + '&part=id')
              .then(function(res) {
                if (res.data.items[0]) resolve(res.data.items[0].id);
              })
              .then(null, reject);
          }
        });
        promiseArr.push(idPromise);
      })
      Promise.all(promiseArr)
        .then(function(idArray) {
          return $http({
            method: "GET",
            url: '/api/download/subscribe',
            params: {
              downloadURL: $scope.track.downloadURL,
              channelIDS: idArray,
              trackID: $scope.track._id
            }
          })
        })
        .then(function(response) {
          $scope.processing = false;
          window.open(response.data.url, '_self')
          window.focus()
        })
        .then(null, function() {
          $scope.processing = false;
          $.Zebra_Dialog('Youtube channel to subscribe to not found');
        })
    }
  }

  $scope.backgroundStyle = function() {
    // console.log('$scope.track',$scope.track);
    // return {
    //   'background-image': 'url(' + $scope.track.trackArtworkURL + ')',
    //   'background-repeat': 'no-repeat',
    //   'background-size': 'cover'
    // }
  }

  $scope.getTrackByID = function(trackID) {
    DownloadTrackService
      .getDownloadTrack(trackID)
      .then(receiveDownloadTrack)
      .catch(catchDownloadTrackError);

    function receiveDownloadTrack(result) {
      if (result.data) {
        window.location.href = result.data.trackDownloadUrl
      }
    }

    function catchDownloadTrackError(err) {
      $.Zebra_Dialog('Song Not Found');
      $scope.processing = false;
      $scope.embedTrack = false;
    }
  }

  $scope.getTrackByUrl = function(username, title) {
    DownloadTrackService
      .getDownloadTrackByUrl({
        username: username,
        title: title
      })
      .then(receiveDownloadTrack)
      .then(receiveRecentTracks)
      .then(initPlay)
      .catch(catchDownloadTrackError);

    function receiveDownloadTrack(result) {
      $scope.track = result.data;
      console.log($scope.track);
      $scope.backgroundStyle = function() {
        return {
          'background-image': 'url(' + $scope.track.trackArtworkURL + ')',
          'background-repeat': 'no-repeat',
          'background-size': 'cover'
        }
      }
      $scope.embedTrack = true;
      $scope.processing = false;
      if ($scope.track.showDownloadTracks === 'user') {
        return DownloadTrackService.getRecentTracks({
          userID: $scope.track.userid,
          trackID: $scope.track._id
        });
      } else {
        return $q.resolve('resolve');
      }
    }

    function receiveRecentTracks(res) {
      if ((typeof res === 'object') && res.data) {
        $scope.recentTracks = res.data;
      }
      return SC.stream('/tracks/' + $scope.track.trackID);
    }

    function initPlay(player) {
      console.log(player);
      playerObj = player;
    }

    function catchDownloadTrackError(err) {
      if (!err.status == 403) {
        $.Zebra_Dialog('Song Not Found');
        $scope.processing = false;
        $scope.embedTrack = false;
      }
    }
  }

  /* Default processing on page load */
  $scope.getDownloadTrack = function() {
    $scope.processing = true;
    var trackID = $location.search().trackid;
    if (trackID != undefined) {
      $scope.getTrackByID(trackID);
    } else {
      var username = $stateParams.username;
      var title = $stateParams.title;
      $scope.getTrackByUrl(username, title);
    }
  };

  /* On click download track button */
  $scope.authenticateSoundcloud = function() {
    if ($scope.track.comment && !$scope.track.commentText) {
      $.Zebra_Dialog('Please write a comment!');
      return false;
    }
    $scope.processing = true;
    $scope.errorText = '';

    SC.connect()
      .then(performTasks)
      .then(initDownload)
      .catch(catchTasksError)

    function performTasks(res) {
      $scope.track.token = res.oauth_token;
      return DownloadTrackService.performTasks($scope.track);
    }

    function initDownload(res) {
      $scope.processing = false;
      if ($scope.track.downloadURL && $scope.track.downloadURL !== '') {
        $window.location.href = $scope.track.downloadURL;
      } else {
        $scope.errorText = 'Error! Could not fetch download URL';
        $scope.downloadURLNotFound = true;
      }
      $scope.$apply();
    }

    function catchTasksError(err) {
      $.Zebra_Dialog('Error in processing your request');
      $scope.processing = false;
      $scope.$apply();
    }
  };

  $scope.downloadTrackFacebookShare = function(shareURL) {
    window.fbAsyncInit = function() {
      FB.init({
        appId: '1576897469267996',
        xfbml: true,
        version: 'v2.6'
      });
      FB.ui({
        method: 'share',
        href: shareURL
      }, function(response) {
        if (response && !response.error_code) {
          if ($scope.track.downloadURL && $scope.track.downloadURL !== '') {
            $window.location.href = $scope.track.downloadURL;
          } else {
            $scope.errorText = 'Error! Could not fetch download URL';
            $scope.downloadURLNotFound = true;
          }
          $scope.$apply();
        } else if (response && response.error_code === 4201) {
          console.log("User cancelled: " + decodeURIComponent(response.error_message));
        } else {
          console.log("Not OK: " + JSON.stringify(response));
          alert("You have cancelled sharing on facebook.");
        }
      });
    };

    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) {
        return;
      }
      js = d.createElement(s);
      js.id = id;
      js.src = "//connect.facebook.net/en_US/sdk.js";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }

  $scope.downloadTrackFacebookLike = function(fblikeid) {
    setTimeout(function() {
      //window.fbAsyncInit = function() {
      FB.init({
        appId: '1576897469267996',
        xfbml: true,
        version: 'v2.6'
      });
      FB.Event.subscribe('edge.create', function(href, widget) {
        window.location = fblikeid.downloadURL;
      });
      //};
      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
          return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    }, 500);
  };
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkb3dubG9hZFRyYWNrL2NvbnRyb2xsZXJzL2Rvd25sb2FkVHJhY2tDb250cm9sbGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIsICRhdXRoUHJvdmlkZXIsICRodHRwUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZG93bmxvYWQnLCB7XHJcbiAgICB1cmw6ICcvZG93bmxvYWQnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9kb3dubG9hZFRyYWNrL3ZpZXdzL2Rvd25sb2FkVHJhY2sudmlldy5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdEb3dubG9hZFRyYWNrQ29udHJvbGxlcidcclxuICB9KTtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZG93bmxvYWRuZXcnLCB7XHJcbiAgICB1cmw6ICcvZG93bmxvYWQvOnVzZXJuYW1lLzp0aXRsZScsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2Rvd25sb2FkVHJhY2svdmlld3MvZG93bmxvYWRUcmFjay52aWV3Lmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ0Rvd25sb2FkVHJhY2tDb250cm9sbGVyJ1xyXG4gIH0pO1xyXG4gICRhdXRoUHJvdmlkZXIuaW5zdGFncmFtKHtcclxuICAgIGNsaWVudElkOiAnMGIyYWI0N2JhYTQ2NGMzMWJmNmQ4ZTlmMzAxZDQ0NjknXHJcbiAgfSk7XHJcblxyXG4gIC8vIEluc3RhZ3JhbVxyXG4gICRhdXRoUHJvdmlkZXIuaW5zdGFncmFtKHtcclxuICAgIG5hbWU6ICdpbnN0YWdyYW0nLFxyXG4gICAgdXJsOiAnL2FwaS9kb3dubG9hZC9hdXRoL2luc3RhZ3JhbScsXHJcbiAgICBhdXRob3JpemF0aW9uRW5kcG9pbnQ6ICdodHRwczovL2FwaS5pbnN0YWdyYW0uY29tL29hdXRoL2F1dGhvcml6ZScsXHJcbiAgICByZWRpcmVjdFVyaTogJ2h0dHBzOi8vbG9jYWxob3N0OjE0NDMvZG93bmxvYWQnLFxyXG4gICAgcmVxdWlyZWRVcmxQYXJhbXM6IFsnc2NvcGUnXSxcclxuICAgIHNjb3BlOiBbJ2Jhc2ljJywgJ3JlbGF0aW9uc2hpcHMnLCAncHVibGljX2NvbnRlbnQnLCAnZm9sbG93ZXJfbGlzdCddLFxyXG4gICAgc2NvcGVEZWxpbWl0ZXI6ICcrJyxcclxuICAgIHR5cGU6ICcyLjAnXHJcbiAgfSk7XHJcblxyXG4gICRhdXRoUHJvdmlkZXIudHdpdHRlcih7XHJcbiAgICB1cmw6ICcvYXBpL2Rvd25sb2FkL3R3aXR0ZXIvYXV0aCcsXHJcbiAgICBhdXRob3JpemF0aW9uRW5kcG9pbnQ6ICdodHRwczovL2FwaS50d2l0dGVyLmNvbS9vYXV0aC9hdXRoZW50aWNhdGUnLFxyXG4gICAgcmVkaXJlY3RVcmk6ICdodHRwczovL2xvY2FsaG9zdDoxNDQzL2Rvd25sb2FkJywgLy9tdXN0IG1hdGNoIHdlYnNpdGVcclxuICAgIHR5cGU6ICcxLjAnLFxyXG4gICAgcG9wdXBPcHRpb25zOiB7XHJcbiAgICAgIHdpZHRoOiA0OTUsXHJcbiAgICAgIGhlaWdodDogNjQ1XHJcbiAgICB9XHJcbiAgfSk7XHJcbn0pXHJcblxyXG5hcHAuY29udHJvbGxlcignRG93bmxvYWRUcmFja0NvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgJHdpbmRvdywgJHEsIERvd25sb2FkVHJhY2tTZXJ2aWNlLCAkc2NlLCAkYXV0aCwgU2Vzc2lvblNlcnZpY2UsICRzdGF0ZVBhcmFtcykge1xyXG4gICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gIC8qIE5vcm1hbCBKUyB2YXJzIGFuZCBmdW5jdGlvbnMgbm90IGJvdW5kIHRvIHNjb3BlICovXHJcbiAgdmFyIHBsYXllck9iaiA9IG51bGw7XHJcbiAgJHNjb3BlLnJlY2VudFRyYWNrcyA9IFtdO1xyXG4gIC8qICRzY29wZSBiaW5kaW5ncyBzdGFydCAqL1xyXG4gICRzY29wZS50cmFja0RhdGEgPSB7XHJcbiAgICB0cmFja05hbWU6ICdNaXhpbmcgYW5kIE1hc3RlcmluZycsXHJcbiAgICB1c2VyTmFtZTogJ2xhIHRyb3BpY2FsJ1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5zaG93U2lnblVwID0gZmFsc2U7XHJcbiAgaWYgKCRzdGF0ZS4kY3VycmVudC5uYW1lID09IFwiZG93bmxvYWRuZXdcIikge1xyXG4gICAgJHNjb3BlLnNob3dTaWduVXAgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLnRvZ2dsZSA9IHRydWU7XHJcbiAgJHNjb3BlLnRvZ2dsZVBsYXkgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICghcGxheWVyT2JqKSB7XHJcbiAgICAgICQuWmVicmFfRGlhbG9nKFwiUGxheWluZyBub3QgYWxsb3dlZFwiKTtcclxuICAgIH1cclxuICAgICRzY29wZS50b2dnbGUgPSAhJHNjb3BlLnRvZ2dsZTtcclxuICAgIGlmICgkc2NvcGUudG9nZ2xlKSB7XHJcbiAgICAgIHBsYXllck9iai5wYXVzZSgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcGxheWVyT2JqLnBsYXkoKTtcclxuICAgIH1cclxuICB9XHJcbiAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAkc2NvcGUuZW1iZWRUcmFjayA9IGZhbHNlO1xyXG4gICRzY29wZS5kb3dubG9hZFVSTE5vdEZvdW5kID0gZmFsc2U7XHJcbiAgJHNjb3BlLmVycm9yVGV4dCA9ICcnO1xyXG4gICRzY29wZS5mb2xsb3dCb3hJbWFnZVVybCA9ICdhc3NldHMvaW1hZ2VzL3doby13ZS1hcmUucG5nJztcclxuXHJcbiAgJHNjb3BlLmluaXRpYXRlRG93bmxvYWQgPSBmdW5jdGlvbigpIHtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICBpZiAoJHNjb3BlLnRyYWNrLmRvd25sb2FkVVJMICYmICRzY29wZS50cmFjay5kb3dubG9hZFVSTCAhPT0gJycpIHtcclxuICAgICAgJHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJHNjb3BlLnRyYWNrLmRvd25sb2FkVVJMO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJHNjb3BlLmVycm9yVGV4dCA9ICdFcnJvciEgQ291bGQgbm90IGZldGNoIGRvd25sb2FkIFVSTCc7XHJcbiAgICAgICRzY29wZS5kb3dubG9hZFVSTE5vdEZvdW5kID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qIEZ1bmN0aW9uIGZvciBJbnN0YWdyYW0gKi9cclxuICAkc2NvcGUuYXV0aGVudGljYXRlSW5zdGFncmFtID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkYXV0aC5hdXRoZW50aWNhdGUoJ2luc3RhZ3JhbScpLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgdmFyIHVzZXJOYW1lID0gJHNjb3BlLnRyYWNrLnNvY2lhbFBsYXRmb3JtVmFsdWU7XHJcbiAgICAgICRodHRwKHtcclxuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxyXG4gICAgICAgIHVybDogJy9hcGkvZG93bmxvYWQvaW5zdGFncmFtL2ZvbGxvd191c2VyJyxcclxuICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAnYWNjZXNzX3Rva2VuJzogcmVzcG9uc2UuZGF0YSxcclxuICAgICAgICAgICdxJzogdXNlck5hbWVcclxuICAgICAgICB9XHJcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24odXNlcikge1xyXG4gICAgICAgIGlmICh1c2VyLmRhdGEuc3VjYykge1xyXG4gICAgICAgICAgJHNjb3BlLmluaXRpYXRlRG93bmxvYWQoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKiBGdW5jdGlvbiBmb3IgVHdpdHRlciAqL1xyXG4gICRzY29wZS5hdXRoZW50aWNhdGVUd2l0dGVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkYXV0aC5hdXRoZW50aWNhdGUoJ3R3aXR0ZXInKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgIHZhciB0d2l0dGVyVXNlcnMgPSBbXTtcclxuICAgICAgaWYgKCRzY29wZS50cmFjay5zb2NpYWxQbGF0Zm9ybSA9PSAndHdpdHRlckZvbGxvdycpIHtcclxuICAgICAgICBpZiAoJHNjb3BlLnRyYWNrLnNvY2lhbFBsYXRmb3JtVmFsdWUuaW5kZXhPZignLCcpID4gLTEpIHtcclxuICAgICAgICAgIHZhciB1c2VyTmFtZXMgPSAkc2NvcGUudHJhY2suc29jaWFsUGxhdGZvcm1WYWx1ZS5zcGxpdCgnLCcpO1xyXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB1c2VyTmFtZXMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgdHdpdHRlclVzZXJzLnB1c2godXNlck5hbWVzW2ldKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdHdpdHRlclVzZXJzLnB1c2goJHNjb3BlLnRyYWNrLnNvY2lhbFBsYXRmb3JtVmFsdWUpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZm9sbG93VHdpdHRlclVzZXIoaW5kZXgpIHtcclxuICAgICAgICAgIGlmIChpbmRleCA8IHR3aXR0ZXJVc2Vycy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgJGh0dHAoe1xyXG4gICAgICAgICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICAgICAgICAgIHVybDogJy9hcGkvZG93bmxvYWQvdHdpdHRlci9mb2xsb3cnLFxyXG4gICAgICAgICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICAgICAgICBzY3JlZW5fbmFtZTogdHdpdHRlclVzZXJzW2luZGV4XSxcclxuICAgICAgICAgICAgICAgICAgYWNjZXNzVG9rZW46IHJlc3BvbnNlLmRhdGEsXHJcbiAgICAgICAgICAgICAgICAgIHRyYWNrSUQ6ICRzY29wZS50cmFjay5faWRcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlY29yZHMpIHtcclxuICAgICAgICAgICAgICAgIGluZGV4Kys7XHJcbiAgICAgICAgICAgICAgICBmb2xsb3dUd2l0dGVyVXNlcihpbmRleClcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKCRzY29wZS50cmFjay5kb3dubG9hZFVSTCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZvbGxvd1R3aXR0ZXJVc2VyKDApO1xyXG4gICAgICB9IGVsc2UgaWYgKCRzY29wZS50cmFjay5zb2NpYWxQbGF0Zm9ybSA9PSAndHdpdHRlclBvc3QnKSB7XHJcbiAgICAgICAgcmVzcG9uc2UuZGF0YS5zb2NpYWxQbGF0Zm9ybVZhbHVlID0gJHNjb3BlLnRyYWNrLnNvY2lhbFBsYXRmb3JtVmFsdWU7XHJcbiAgICAgICAgJGh0dHAoe1xyXG4gICAgICAgICAgbWV0aG9kOiBcIlBPU1RcIixcclxuICAgICAgICAgIHVybDogJy9hcGkvZG93bmxvYWQvdHdpdHRlci9wb3N0JyxcclxuICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgZGF0YTogcmVzcG9uc2UuZGF0YSxcclxuICAgICAgICAgICAgdHJhY2tJRDogJHNjb3BlLnRyYWNrLl9pZFxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVjb3Jkcykge1xyXG4gICAgICAgICAgaWYgKHJlY29yZHMuc3RhdHVzVGV4dCA9PT0gXCJPS1wiKSB7XHJcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKCRzY29wZS50cmFjay5kb3dubG9hZFVSTCk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkLlplYnJhX0RpYWxvZygnRXJyb3IgaW4gcHJvY2Vzc2luZyB0aGUgcmVxdWVzdC4gUGxlYXNlIHRyeSBhZ2Fpbi4nKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKiBGdW5jdGlvbiBmb3IgWW91dHViZSAqL1xyXG4gICRzY29wZS5hdXRoZW50aWNhdGVZb3V0dWJlID0gZnVuY3Rpb24odHJhY2spIHtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgIHZhciB0b3RhbEFycmF5ID0gW107XHJcbiAgICBpZiAoJHNjb3BlLnRyYWNrLnNvY2lhbFBsYXRmb3JtVmFsdWUpIHtcclxuICAgICAgJHNjb3BlLnRyYWNrLnlvdXR1YmUgPSBbXTtcclxuICAgICAgaWYgKCRzY29wZS50cmFjay5zb2NpYWxQbGF0Zm9ybVZhbHVlLmluZGV4T2YoJywnKSA+IC0xKSB7XHJcbiAgICAgICAgdmFyIHVybHMgPSAkc2NvcGUudHJhY2suc29jaWFsUGxhdGZvcm1WYWx1ZS5zcGxpdCgnLCcpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdXJscy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgdG90YWxBcnJheS5wdXNoKHVybHNbaV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICB0b3RhbEFycmF5LnB1c2goJHNjb3BlLnRyYWNrLnNvY2lhbFBsYXRmb3JtVmFsdWUpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvL3ZhciB0b3RhbEFycmF5ID0gWyRzY29wZS50cmFjay5zb2NpYWxQbGF0Zm9ybVZhbHVlLCBcImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2NoYW5uZWwvVUNiZktFUVpaekhOMGVnWVhpbmJiN2pnXCIsIFwiaHR0cHM6Ly93d3cueW91dHViZS5jb20vY2hhbm5lbC9VQ3ZReUVEc0t3Sm9KTEtYZUN2WTJPZlFcIiwgXCJodHRwczovL3d3dy55b3V0dWJlLmNvbS9jaGFubmVsL1VDY3FwZFdEX2szeE00QU9qdnMtRml0UVwiLCBcImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2NoYW5uZWwvVUNiQTB4aU00RTVTYmYxV01taFRHT09nXCIsIFwiaHR0cHM6Ly93d3cueW91dHViZS5jb20vY2hhbm5lbC9VQzJIRzgyU0VUa2N4OHBPRTc1YllKNmdcIl1cclxuICAgICAgdmFyIHByb21pc2VBcnIgPSBbXTtcclxuICAgICAgdG90YWxBcnJheS5mb3JFYWNoKGZ1bmN0aW9uKHVybCkge1xyXG4gICAgICAgIHZhciBpZFByb21pc2UgPSBuZXcgUHJvbWlzZShmdW5jdGlvbihyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICAgIGlmICh1cmwuaW5jbHVkZXMoJy9jaGFubmVsLycpKSB7XHJcbiAgICAgICAgICAgIHJlc29sdmUodXJsLnN1YnN0cmluZyh1cmwuaW5kZXhPZignL2NoYW5uZWwvJykgKyA5LCB1cmwubGVuZ3RoKSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICB2YXIgdXNlcm5hbWUgPSB1cmwuc3Vic3RyaW5nKHVybC5pbmRleE9mKCcvdXNlci8nKSArIDYsIHVybC5sZW5ndGgpXHJcbiAgICAgICAgICAgIHZhciBpZEFycmF5ID0gW107XHJcbiAgICAgICAgICAgICRodHRwLmdldCgnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20veW91dHViZS92My9jaGFubmVscz9rZXk9QUl6YVN5Qk91Ukh4MjVWUTY5TXJURWN2bi1oSWRrWjhOc1p3c0x3JmZvclVzZXJuYW1lPScgKyB1c2VybmFtZSArICcmcGFydD1pZCcpXHJcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzLmRhdGEuaXRlbXNbMF0pIHJlc29sdmUocmVzLmRhdGEuaXRlbXNbMF0uaWQpO1xyXG4gICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgLnRoZW4obnVsbCwgcmVqZWN0KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICBwcm9taXNlQXJyLnB1c2goaWRQcm9taXNlKTtcclxuICAgICAgfSlcclxuICAgICAgUHJvbWlzZS5hbGwocHJvbWlzZUFycilcclxuICAgICAgICAudGhlbihmdW5jdGlvbihpZEFycmF5KSB7XHJcbiAgICAgICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgICAgICBtZXRob2Q6IFwiR0VUXCIsXHJcbiAgICAgICAgICAgIHVybDogJy9hcGkvZG93bmxvYWQvc3Vic2NyaWJlJyxcclxuICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgZG93bmxvYWRVUkw6ICRzY29wZS50cmFjay5kb3dubG9hZFVSTCxcclxuICAgICAgICAgICAgICBjaGFubmVsSURTOiBpZEFycmF5LFxyXG4gICAgICAgICAgICAgIHRyYWNrSUQ6ICRzY29wZS50cmFjay5faWRcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgd2luZG93Lm9wZW4ocmVzcG9uc2UuZGF0YS51cmwsICdfc2VsZicpXHJcbiAgICAgICAgICB3aW5kb3cuZm9jdXMoKVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coJ1lvdXR1YmUgY2hhbm5lbCB0byBzdWJzY3JpYmUgdG8gbm90IGZvdW5kJyk7XHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gICRzY29wZS5iYWNrZ3JvdW5kU3R5bGUgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vIGNvbnNvbGUubG9nKCckc2NvcGUudHJhY2snLCRzY29wZS50cmFjayk7XHJcbiAgICAvLyByZXR1cm4ge1xyXG4gICAgLy8gICAnYmFja2dyb3VuZC1pbWFnZSc6ICd1cmwoJyArICRzY29wZS50cmFjay50cmFja0FydHdvcmtVUkwgKyAnKScsXHJcbiAgICAvLyAgICdiYWNrZ3JvdW5kLXJlcGVhdCc6ICduby1yZXBlYXQnLFxyXG4gICAgLy8gICAnYmFja2dyb3VuZC1zaXplJzogJ2NvdmVyJ1xyXG4gICAgLy8gfVxyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmdldFRyYWNrQnlJRCA9IGZ1bmN0aW9uKHRyYWNrSUQpIHtcclxuICAgIERvd25sb2FkVHJhY2tTZXJ2aWNlXHJcbiAgICAgIC5nZXREb3dubG9hZFRyYWNrKHRyYWNrSUQpXHJcbiAgICAgIC50aGVuKHJlY2VpdmVEb3dubG9hZFRyYWNrKVxyXG4gICAgICAuY2F0Y2goY2F0Y2hEb3dubG9hZFRyYWNrRXJyb3IpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHJlY2VpdmVEb3dubG9hZFRyYWNrKHJlc3VsdCkge1xyXG4gICAgICBpZiAocmVzdWx0LmRhdGEpIHtcclxuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9IHJlc3VsdC5kYXRhLnRyYWNrRG93bmxvYWRVcmxcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNhdGNoRG93bmxvYWRUcmFja0Vycm9yKGVycikge1xyXG4gICAgICAkLlplYnJhX0RpYWxvZygnU29uZyBOb3QgRm91bmQnKTtcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgJHNjb3BlLmVtYmVkVHJhY2sgPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gICRzY29wZS5nZXRUcmFja0J5VXJsID0gZnVuY3Rpb24odXNlcm5hbWUsIHRpdGxlKSB7XHJcbiAgICBEb3dubG9hZFRyYWNrU2VydmljZVxyXG4gICAgICAuZ2V0RG93bmxvYWRUcmFja0J5VXJsKHtcclxuICAgICAgICB1c2VybmFtZTogdXNlcm5hbWUsXHJcbiAgICAgICAgdGl0bGU6IHRpdGxlXHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKHJlY2VpdmVEb3dubG9hZFRyYWNrKVxyXG4gICAgICAudGhlbihyZWNlaXZlUmVjZW50VHJhY2tzKVxyXG4gICAgICAudGhlbihpbml0UGxheSlcclxuICAgICAgLmNhdGNoKGNhdGNoRG93bmxvYWRUcmFja0Vycm9yKTtcclxuXHJcbiAgICBmdW5jdGlvbiByZWNlaXZlRG93bmxvYWRUcmFjayhyZXN1bHQpIHtcclxuICAgICAgJHNjb3BlLnRyYWNrID0gcmVzdWx0LmRhdGE7XHJcbiAgICAgIGNvbnNvbGUubG9nKCRzY29wZS50cmFjayk7XHJcbiAgICAgICRzY29wZS5iYWNrZ3JvdW5kU3R5bGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgJ2JhY2tncm91bmQtaW1hZ2UnOiAndXJsKCcgKyAkc2NvcGUudHJhY2sudHJhY2tBcnR3b3JrVVJMICsgJyknLFxyXG4gICAgICAgICAgJ2JhY2tncm91bmQtcmVwZWF0JzogJ25vLXJlcGVhdCcsXHJcbiAgICAgICAgICAnYmFja2dyb3VuZC1zaXplJzogJ2NvdmVyJ1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICAkc2NvcGUuZW1iZWRUcmFjayA9IHRydWU7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIGlmICgkc2NvcGUudHJhY2suc2hvd0Rvd25sb2FkVHJhY2tzID09PSAndXNlcicpIHtcclxuICAgICAgICByZXR1cm4gRG93bmxvYWRUcmFja1NlcnZpY2UuZ2V0UmVjZW50VHJhY2tzKHtcclxuICAgICAgICAgIHVzZXJJRDogJHNjb3BlLnRyYWNrLnVzZXJpZCxcclxuICAgICAgICAgIHRyYWNrSUQ6ICRzY29wZS50cmFjay5faWRcclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICByZXR1cm4gJHEucmVzb2x2ZSgncmVzb2x2ZScpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcmVjZWl2ZVJlY2VudFRyYWNrcyhyZXMpIHtcclxuICAgICAgaWYgKCh0eXBlb2YgcmVzID09PSAnb2JqZWN0JykgJiYgcmVzLmRhdGEpIHtcclxuICAgICAgICAkc2NvcGUucmVjZW50VHJhY2tzID0gcmVzLmRhdGE7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFNDLnN0cmVhbSgnL3RyYWNrcy8nICsgJHNjb3BlLnRyYWNrLnRyYWNrSUQpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGluaXRQbGF5KHBsYXllcikge1xyXG4gICAgICBjb25zb2xlLmxvZyhwbGF5ZXIpO1xyXG4gICAgICBwbGF5ZXJPYmogPSBwbGF5ZXI7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gY2F0Y2hEb3dubG9hZFRyYWNrRXJyb3IoZXJyKSB7XHJcbiAgICAgIGlmICghZXJyLnN0YXR1cyA9PSA0MDMpIHtcclxuICAgICAgICAkLlplYnJhX0RpYWxvZygnU29uZyBOb3QgRm91bmQnKTtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICRzY29wZS5lbWJlZFRyYWNrID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8qIERlZmF1bHQgcHJvY2Vzc2luZyBvbiBwYWdlIGxvYWQgKi9cclxuICAkc2NvcGUuZ2V0RG93bmxvYWRUcmFjayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgdmFyIHRyYWNrSUQgPSAkbG9jYXRpb24uc2VhcmNoKCkudHJhY2tpZDtcclxuICAgIGlmICh0cmFja0lEICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICAkc2NvcGUuZ2V0VHJhY2tCeUlEKHRyYWNrSUQpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdmFyIHVzZXJuYW1lID0gJHN0YXRlUGFyYW1zLnVzZXJuYW1lO1xyXG4gICAgICB2YXIgdGl0bGUgPSAkc3RhdGVQYXJhbXMudGl0bGU7XHJcbiAgICAgICRzY29wZS5nZXRUcmFja0J5VXJsKHVzZXJuYW1lLCB0aXRsZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLyogT24gY2xpY2sgZG93bmxvYWQgdHJhY2sgYnV0dG9uICovXHJcbiAgJHNjb3BlLmF1dGhlbnRpY2F0ZVNvdW5kY2xvdWQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICgkc2NvcGUudHJhY2suY29tbWVudCAmJiAhJHNjb3BlLnRyYWNrLmNvbW1lbnRUZXh0KSB7XHJcbiAgICAgICQuWmVicmFfRGlhbG9nKCdQbGVhc2Ugd3JpdGUgYSBjb21tZW50IScpO1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAkc2NvcGUuZXJyb3JUZXh0ID0gJyc7XHJcblxyXG4gICAgU0MuY29ubmVjdCgpXHJcbiAgICAgIC50aGVuKHBlcmZvcm1UYXNrcylcclxuICAgICAgLnRoZW4oaW5pdERvd25sb2FkKVxyXG4gICAgICAuY2F0Y2goY2F0Y2hUYXNrc0Vycm9yKVxyXG5cclxuICAgIGZ1bmN0aW9uIHBlcmZvcm1UYXNrcyhyZXMpIHtcclxuICAgICAgJHNjb3BlLnRyYWNrLnRva2VuID0gcmVzLm9hdXRoX3Rva2VuO1xyXG4gICAgICByZXR1cm4gRG93bmxvYWRUcmFja1NlcnZpY2UucGVyZm9ybVRhc2tzKCRzY29wZS50cmFjayk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaW5pdERvd25sb2FkKHJlcykge1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICBpZiAoJHNjb3BlLnRyYWNrLmRvd25sb2FkVVJMICYmICRzY29wZS50cmFjay5kb3dubG9hZFVSTCAhPT0gJycpIHtcclxuICAgICAgICAkd2luZG93LmxvY2F0aW9uLmhyZWYgPSAkc2NvcGUudHJhY2suZG93bmxvYWRVUkw7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgJHNjb3BlLmVycm9yVGV4dCA9ICdFcnJvciEgQ291bGQgbm90IGZldGNoIGRvd25sb2FkIFVSTCc7XHJcbiAgICAgICAgJHNjb3BlLmRvd25sb2FkVVJMTm90Rm91bmQgPSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBjYXRjaFRhc2tzRXJyb3IoZXJyKSB7XHJcbiAgICAgICQuWmVicmFfRGlhbG9nKCdFcnJvciBpbiBwcm9jZXNzaW5nIHlvdXIgcmVxdWVzdCcpO1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmRvd25sb2FkVHJhY2tGYWNlYm9va1NoYXJlID0gZnVuY3Rpb24oc2hhcmVVUkwpIHtcclxuICAgIHdpbmRvdy5mYkFzeW5jSW5pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBGQi5pbml0KHtcclxuICAgICAgICBhcHBJZDogJzE1NzY4OTc0NjkyNjc5OTYnLFxyXG4gICAgICAgIHhmYm1sOiB0cnVlLFxyXG4gICAgICAgIHZlcnNpb246ICd2Mi42J1xyXG4gICAgICB9KTtcclxuICAgICAgRkIudWkoe1xyXG4gICAgICAgIG1ldGhvZDogJ3NoYXJlJyxcclxuICAgICAgICBocmVmOiBzaGFyZVVSTFxyXG4gICAgICB9LCBmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgIGlmIChyZXNwb25zZSAmJiAhcmVzcG9uc2UuZXJyb3JfY29kZSkge1xyXG4gICAgICAgICAgaWYgKCRzY29wZS50cmFjay5kb3dubG9hZFVSTCAmJiAkc2NvcGUudHJhY2suZG93bmxvYWRVUkwgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICR3aW5kb3cubG9jYXRpb24uaHJlZiA9ICRzY29wZS50cmFjay5kb3dubG9hZFVSTDtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICRzY29wZS5lcnJvclRleHQgPSAnRXJyb3IhIENvdWxkIG5vdCBmZXRjaCBkb3dubG9hZCBVUkwnO1xyXG4gICAgICAgICAgICAkc2NvcGUuZG93bmxvYWRVUkxOb3RGb3VuZCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChyZXNwb25zZSAmJiByZXNwb25zZS5lcnJvcl9jb2RlID09PSA0MjAxKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhcIlVzZXIgY2FuY2VsbGVkOiBcIiArIGRlY29kZVVSSUNvbXBvbmVudChyZXNwb25zZS5lcnJvcl9tZXNzYWdlKSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiTm90IE9LOiBcIiArIEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlKSk7XHJcbiAgICAgICAgICBhbGVydChcIllvdSBoYXZlIGNhbmNlbGxlZCBzaGFyaW5nIG9uIGZhY2Vib29rLlwiKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAoZnVuY3Rpb24oZCwgcywgaWQpIHtcclxuICAgICAgdmFyIGpzLCBmanMgPSBkLmdldEVsZW1lbnRzQnlUYWdOYW1lKHMpWzBdO1xyXG4gICAgICBpZiAoZC5nZXRFbGVtZW50QnlJZChpZCkpIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAganMgPSBkLmNyZWF0ZUVsZW1lbnQocyk7XHJcbiAgICAgIGpzLmlkID0gaWQ7XHJcbiAgICAgIGpzLnNyYyA9IFwiLy9jb25uZWN0LmZhY2Vib29rLm5ldC9lbl9VUy9zZGsuanNcIjtcclxuICAgICAgZmpzLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGpzLCBmanMpO1xyXG4gICAgfShkb2N1bWVudCwgJ3NjcmlwdCcsICdmYWNlYm9vay1qc3NkaycpKTtcclxuICB9XHJcblxyXG4gICRzY29wZS5kb3dubG9hZFRyYWNrRmFjZWJvb2tMaWtlID0gZnVuY3Rpb24oZmJsaWtlaWQpIHtcclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgIC8vd2luZG93LmZiQXN5bmNJbml0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIEZCLmluaXQoe1xyXG4gICAgICAgIGFwcElkOiAnMTU3Njg5NzQ2OTI2Nzk5NicsXHJcbiAgICAgICAgeGZibWw6IHRydWUsXHJcbiAgICAgICAgdmVyc2lvbjogJ3YyLjYnXHJcbiAgICAgIH0pO1xyXG4gICAgICBGQi5FdmVudC5zdWJzY3JpYmUoJ2VkZ2UuY3JlYXRlJywgZnVuY3Rpb24oaHJlZiwgd2lkZ2V0KSB7XHJcbiAgICAgICAgd2luZG93LmxvY2F0aW9uID0gZmJsaWtlaWQuZG93bmxvYWRVUkw7XHJcbiAgICAgIH0pO1xyXG4gICAgICAvL307XHJcbiAgICAgIChmdW5jdGlvbihkLCBzLCBpZCkge1xyXG4gICAgICAgIHZhciBqcywgZmpzID0gZC5nZXRFbGVtZW50c0J5VGFnTmFtZShzKVswXTtcclxuICAgICAgICBpZiAoZC5nZXRFbGVtZW50QnlJZChpZCkpIHtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAganMgPSBkLmNyZWF0ZUVsZW1lbnQocyk7XHJcbiAgICAgICAganMuaWQgPSBpZDtcclxuICAgICAgICBqcy5zcmMgPSBcIi8vY29ubmVjdC5mYWNlYm9vay5uZXQvZW5fVVMvc2RrLmpzXCI7XHJcbiAgICAgICAgZmpzLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGpzLCBmanMpO1xyXG4gICAgICB9KGRvY3VtZW50LCAnc2NyaXB0JywgJ2ZhY2Vib29rLWpzc2RrJykpO1xyXG4gICAgfSwgNTAwKTtcclxuICB9O1xyXG59KTsiXSwiZmlsZSI6ImRvd25sb2FkVHJhY2svY29udHJvbGxlcnMvZG93bmxvYWRUcmFja0NvbnRyb2xsZXIuanMifQ==
