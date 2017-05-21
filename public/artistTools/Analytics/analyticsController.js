app.config(function($stateProvider) {
  $stateProvider
    .state('artistToolsAnalytics', {
      url: '/analytics',
      params: {
        submission: null
      },
      templateUrl: 'js/artistTools/Analytics/analytics.html',
      controller: 'artistToolsAnalytics'
    });
});

app.controller("artistToolsAnalytics", function($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, $auth, SessionService, ArtistToolsService) {
  $scope.user = SessionService.getUser();
  if (!SessionService.getUser()) {
    $state.go('login');
  } else {
    $window.localStorage.removeItem('returnstate');
    $window.localStorage.removeItem('tid');
  }
  $scope.authFacbook = function(id, days) {
    if (id) { //calling for registration !
      alert("registering Channel, please refresh after few moments to load analytics data");
      return $http({
        method: 'POST',
        url: '/api/analytics/facebook',
        data: {
          pageid: id.id
        }
      }).then(function(success) {
        $scope.showFacebookPages = false;
        delete $scope.facebookPages;
        console.log(success);
        $scope.authFacbook();
      }, function(error) {
        console.log(error);
      });
    }
    $scope.enableGraph = false;
    $http({
      method: 'POST',
      url: '/api/analytics/facebook',
      data: {
        day_limit: days
      }
    }).success(function(success_http) {
      $scope.displayError = false;
      $scope.daysCallbackFunction = 'authFacbook';
      $scope.showDayChanger = true;
      $scope.graph_data = success_http;
      $scope.enableGraph = true;
    }).error(function() {
      FB.login(function(response_token, success) {
        if (!response_token.authResponse) return console.log("User did not authorize fully!");
        $http({
          method: 'POST',
          url: '/api/analytics/facebook',
          data: {
            access_token: response_token.authResponse.accessToken
          }
        }).success(function(response) {
          $scope.facebookPages = response.pages;
          $scope.showFacebookPages = true;
        }).error(function(error) {
          alert("Error while registering page :" + error);
        });
        //$scope.accessToken = response_token.accessToken;
      }, {
        scope: 'pages_show_list,user_likes'
      });
    });
  };

  $scope.authTwitter = function(acccess_key, days) {
    $scope.showDayChanger = false;
    $scope.enableGraph = false;
    $http({
      method: 'POST',
      url: '/api/analytics/twitter',
      data: {
        day_limit: days
      }
    }).then(function(success) {
      $scope.daysCallbackFunction = 'authTwitter';
      $scope.showDayChanger = true;
      $scope.graph_data = success.data;
      $scope.enableGraph = true;
    }, function(failure) {
      $auth.authenticate('twitter').then(function(success_twitter) {
        $http({
          method: 'POST',
          url: '/api/analytics/twitter',
          data: {
            access_token_key: success_twitter.data.oauth_token,
            access_token_secret: success_twitter.data.oauth_token_secret,
            screen_name: success_twitter.data.screen_name
          }
        }).then(function(success) {
          $scope.showFollowers = false;
          $scope.authTwitter();
        }, function(error) {
          console.log(error);
        });
      });
    });
  };

  $scope.authInstagram = function(channelId, days) {
    $scope.showDayChanger = false;
    $scope.enableGraph = false;
    $http({
      method: 'POST',
      url: '/api/analytics/instagram',
      data: {
        day_limit: days
      }
    }).then(function(success) {
      $scope.daysCallbackFunction = 'authInstagram';
      $scope.showDayChanger = true;
      $scope.graph_data = success.data;
      $scope.enableGraph = true;
    }, function(failure) {
      $auth.authenticate('instagram').then(function(success) {
        $http({
          method: 'POST',
          url: '/api/analytics/instagram',
          data: {
            access_token: success.access_token
          }
        }).then(function(success) {
          $scope.authInstagram();
        }, function(failure) {
          return console.log("<authInstagram>failed when trying to register user" + JSON.stringify(failure));
        });
      }, function(failure) {
        console.log("failure while authentication of instagram" + JSON.stringify(failure));
      });
    });
  };

  $scope.authYoutube = function(channelId, days) {
    $scope.showDayChanger = false;
    if (channelId) { //calling for registration !
      alert("registering Channel, please refresh after few moments to load analytics data");
      return $http({
        method: 'POST',
        url: '/api/analytics/youtube/stats',
        data: {
          register: true,
          channelId: channelId
        }
      }).then(function(success) {
        $scope.showYoutubeChannel = false;
        delete $scope.youtubeChannel;
        console.log(success);
        $scope.authYoutube();
      }, function(error) {
        console.log(error);
      });
    }
    $scope.enableGraph = false;
    $http({
      method: 'POST',
      url: '/api/analytics/youtube/stats',
      data: {
        day_limit: days
      }
    }).success(function(success_http) {
      $scope.displayError = false;
      $scope.daysCallbackFunction = 'authYoutube';
      $scope.showDayChanger = true;
      $scope.graph_data = success_http;
      $scope.enableGraph = true;
    }).error(function() {
      $auth.authenticate('google').then(function(success) {
        $scope.youtubeChannel = success.data;
        $scope.showYoutubeChannel = true;
      }, function(failure) {
        console.log("failed from authorization server>>>>" + JSON.stringify(failure));
      });
    });
  };
  $scope.alert = function(data) {
    alert(data);
  };
});
app.controller('graphControler', function($scope) {
  // $scope.data = [{
  //     key: "Cumulative Return",
  //     values: value_array
  // }];
  $scope.options = {
    margin: {
      top: 20
    },
    series: [{
      axis: "y",
      dataset: "timed",
      key: "val_0",
      label: "Analytics data",
      color: "hsla(88, 48%, 48%, 1)",
      type: [
        "line"
      ],
      id: "mySeries0"
    }],
    axes: {
      x: {
        key: "x",
        type: "date"
      }
    }
  };
  $scope.data = {
    timed: []
  };
  for (var local_data in $scope.graph_data) {
    $scope.data.timed.push({
      x: local_data,
      val_0: $scope.graph_data[local_data]
    });
  }
  for (var i in $scope.data.timed) {
    $scope.data.timed[i].x = new Date($scope.data.timed[i].x);
  }
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcnRpc3RUb29scy9BbmFseXRpY3MvYW5hbHl0aWNzQ29udHJvbGxlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XHJcbiAgJHN0YXRlUHJvdmlkZXJcclxuICAgIC5zdGF0ZSgnYXJ0aXN0VG9vbHNBbmFseXRpY3MnLCB7XHJcbiAgICAgIHVybDogJy9hbmFseXRpY3MnLFxyXG4gICAgICBwYXJhbXM6IHtcclxuICAgICAgICBzdWJtaXNzaW9uOiBudWxsXHJcbiAgICAgIH0sXHJcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvYXJ0aXN0VG9vbHMvQW5hbHl0aWNzL2FuYWx5dGljcy5odG1sJyxcclxuICAgICAgY29udHJvbGxlcjogJ2FydGlzdFRvb2xzQW5hbHl0aWNzJ1xyXG4gICAgfSk7XHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoXCJhcnRpc3RUb29sc0FuYWx5dGljc1wiLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uLCAkd2luZG93LCAkdWliTW9kYWwsICR0aW1lb3V0LCAkYXV0aCwgU2Vzc2lvblNlcnZpY2UsIEFydGlzdFRvb2xzU2VydmljZSkge1xyXG4gICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gIGlmICghU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSB7XHJcbiAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XHJcbiAgfSBlbHNlIHtcclxuICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3JldHVybnN0YXRlJyk7XHJcbiAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd0aWQnKTtcclxuICB9XHJcbiAgJHNjb3BlLmF1dGhGYWNib29rID0gZnVuY3Rpb24oaWQsIGRheXMpIHtcclxuICAgIGlmIChpZCkgeyAvL2NhbGxpbmcgZm9yIHJlZ2lzdHJhdGlvbiAhXHJcbiAgICAgIGFsZXJ0KFwicmVnaXN0ZXJpbmcgQ2hhbm5lbCwgcGxlYXNlIHJlZnJlc2ggYWZ0ZXIgZmV3IG1vbWVudHMgdG8gbG9hZCBhbmFseXRpY3MgZGF0YVwiKTtcclxuICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICB1cmw6ICcvYXBpL2FuYWx5dGljcy9mYWNlYm9vaycsXHJcbiAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgcGFnZWlkOiBpZC5pZFxyXG4gICAgICAgIH1cclxuICAgICAgfSkudGhlbihmdW5jdGlvbihzdWNjZXNzKSB7XHJcbiAgICAgICAgJHNjb3BlLnNob3dGYWNlYm9va1BhZ2VzID0gZmFsc2U7XHJcbiAgICAgICAgZGVsZXRlICRzY29wZS5mYWNlYm9va1BhZ2VzO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHN1Y2Nlc3MpO1xyXG4gICAgICAgICRzY29wZS5hdXRoRmFjYm9vaygpO1xyXG4gICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAkc2NvcGUuZW5hYmxlR3JhcGggPSBmYWxzZTtcclxuICAgICRodHRwKHtcclxuICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgIHVybDogJy9hcGkvYW5hbHl0aWNzL2ZhY2Vib29rJyxcclxuICAgICAgZGF0YToge1xyXG4gICAgICAgIGRheV9saW1pdDogZGF5c1xyXG4gICAgICB9XHJcbiAgICB9KS5zdWNjZXNzKGZ1bmN0aW9uKHN1Y2Nlc3NfaHR0cCkge1xyXG4gICAgICAkc2NvcGUuZGlzcGxheUVycm9yID0gZmFsc2U7XHJcbiAgICAgICRzY29wZS5kYXlzQ2FsbGJhY2tGdW5jdGlvbiA9ICdhdXRoRmFjYm9vayc7XHJcbiAgICAgICRzY29wZS5zaG93RGF5Q2hhbmdlciA9IHRydWU7XHJcbiAgICAgICRzY29wZS5ncmFwaF9kYXRhID0gc3VjY2Vzc19odHRwO1xyXG4gICAgICAkc2NvcGUuZW5hYmxlR3JhcGggPSB0cnVlO1xyXG4gICAgfSkuZXJyb3IoZnVuY3Rpb24oKSB7XHJcbiAgICAgIEZCLmxvZ2luKGZ1bmN0aW9uKHJlc3BvbnNlX3Rva2VuLCBzdWNjZXNzKSB7XHJcbiAgICAgICAgaWYgKCFyZXNwb25zZV90b2tlbi5hdXRoUmVzcG9uc2UpIHJldHVybiBjb25zb2xlLmxvZyhcIlVzZXIgZGlkIG5vdCBhdXRob3JpemUgZnVsbHkhXCIpO1xyXG4gICAgICAgICRodHRwKHtcclxuICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgdXJsOiAnL2FwaS9hbmFseXRpY3MvZmFjZWJvb2snLFxyXG4gICAgICAgICAgZGF0YToge1xyXG4gICAgICAgICAgICBhY2Nlc3NfdG9rZW46IHJlc3BvbnNlX3Rva2VuLmF1dGhSZXNwb25zZS5hY2Nlc3NUb2tlblxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pLnN1Y2Nlc3MoZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICRzY29wZS5mYWNlYm9va1BhZ2VzID0gcmVzcG9uc2UucGFnZXM7XHJcbiAgICAgICAgICAkc2NvcGUuc2hvd0ZhY2Vib29rUGFnZXMgPSB0cnVlO1xyXG4gICAgICAgIH0pLmVycm9yKGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgICBhbGVydChcIkVycm9yIHdoaWxlIHJlZ2lzdGVyaW5nIHBhZ2UgOlwiICsgZXJyb3IpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIC8vJHNjb3BlLmFjY2Vzc1Rva2VuID0gcmVzcG9uc2VfdG9rZW4uYWNjZXNzVG9rZW47XHJcbiAgICAgIH0sIHtcclxuICAgICAgICBzY29wZTogJ3BhZ2VzX3Nob3dfbGlzdCx1c2VyX2xpa2VzJ1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5hdXRoVHdpdHRlciA9IGZ1bmN0aW9uKGFjY2Nlc3Nfa2V5LCBkYXlzKSB7XHJcbiAgICAkc2NvcGUuc2hvd0RheUNoYW5nZXIgPSBmYWxzZTtcclxuICAgICRzY29wZS5lbmFibGVHcmFwaCA9IGZhbHNlO1xyXG4gICAgJGh0dHAoe1xyXG4gICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgdXJsOiAnL2FwaS9hbmFseXRpY3MvdHdpdHRlcicsXHJcbiAgICAgIGRhdGE6IHtcclxuICAgICAgICBkYXlfbGltaXQ6IGRheXNcclxuICAgICAgfVxyXG4gICAgfSkudGhlbihmdW5jdGlvbihzdWNjZXNzKSB7XHJcbiAgICAgICRzY29wZS5kYXlzQ2FsbGJhY2tGdW5jdGlvbiA9ICdhdXRoVHdpdHRlcic7XHJcbiAgICAgICRzY29wZS5zaG93RGF5Q2hhbmdlciA9IHRydWU7XHJcbiAgICAgICRzY29wZS5ncmFwaF9kYXRhID0gc3VjY2Vzcy5kYXRhO1xyXG4gICAgICAkc2NvcGUuZW5hYmxlR3JhcGggPSB0cnVlO1xyXG4gICAgfSwgZnVuY3Rpb24oZmFpbHVyZSkge1xyXG4gICAgICAkYXV0aC5hdXRoZW50aWNhdGUoJ3R3aXR0ZXInKS50aGVuKGZ1bmN0aW9uKHN1Y2Nlc3NfdHdpdHRlcikge1xyXG4gICAgICAgICRodHRwKHtcclxuICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgdXJsOiAnL2FwaS9hbmFseXRpY3MvdHdpdHRlcicsXHJcbiAgICAgICAgICBkYXRhOiB7XHJcbiAgICAgICAgICAgIGFjY2Vzc190b2tlbl9rZXk6IHN1Y2Nlc3NfdHdpdHRlci5kYXRhLm9hdXRoX3Rva2VuLFxyXG4gICAgICAgICAgICBhY2Nlc3NfdG9rZW5fc2VjcmV0OiBzdWNjZXNzX3R3aXR0ZXIuZGF0YS5vYXV0aF90b2tlbl9zZWNyZXQsXHJcbiAgICAgICAgICAgIHNjcmVlbl9uYW1lOiBzdWNjZXNzX3R3aXR0ZXIuZGF0YS5zY3JlZW5fbmFtZVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24oc3VjY2Vzcykge1xyXG4gICAgICAgICAgJHNjb3BlLnNob3dGb2xsb3dlcnMgPSBmYWxzZTtcclxuICAgICAgICAgICRzY29wZS5hdXRoVHdpdHRlcigpO1xyXG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmF1dGhJbnN0YWdyYW0gPSBmdW5jdGlvbihjaGFubmVsSWQsIGRheXMpIHtcclxuICAgICRzY29wZS5zaG93RGF5Q2hhbmdlciA9IGZhbHNlO1xyXG4gICAgJHNjb3BlLmVuYWJsZUdyYXBoID0gZmFsc2U7XHJcbiAgICAkaHR0cCh7XHJcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICB1cmw6ICcvYXBpL2FuYWx5dGljcy9pbnN0YWdyYW0nLFxyXG4gICAgICBkYXRhOiB7XHJcbiAgICAgICAgZGF5X2xpbWl0OiBkYXlzXHJcbiAgICAgIH1cclxuICAgIH0pLnRoZW4oZnVuY3Rpb24oc3VjY2Vzcykge1xyXG4gICAgICAkc2NvcGUuZGF5c0NhbGxiYWNrRnVuY3Rpb24gPSAnYXV0aEluc3RhZ3JhbSc7XHJcbiAgICAgICRzY29wZS5zaG93RGF5Q2hhbmdlciA9IHRydWU7XHJcbiAgICAgICRzY29wZS5ncmFwaF9kYXRhID0gc3VjY2Vzcy5kYXRhO1xyXG4gICAgICAkc2NvcGUuZW5hYmxlR3JhcGggPSB0cnVlO1xyXG4gICAgfSwgZnVuY3Rpb24oZmFpbHVyZSkge1xyXG4gICAgICAkYXV0aC5hdXRoZW50aWNhdGUoJ2luc3RhZ3JhbScpLnRoZW4oZnVuY3Rpb24oc3VjY2Vzcykge1xyXG4gICAgICAgICRodHRwKHtcclxuICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgdXJsOiAnL2FwaS9hbmFseXRpY3MvaW5zdGFncmFtJyxcclxuICAgICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgICAgYWNjZXNzX3Rva2VuOiBzdWNjZXNzLmFjY2Vzc190b2tlblxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24oc3VjY2Vzcykge1xyXG4gICAgICAgICAgJHNjb3BlLmF1dGhJbnN0YWdyYW0oKTtcclxuICAgICAgICB9LCBmdW5jdGlvbihmYWlsdXJlKSB7XHJcbiAgICAgICAgICByZXR1cm4gY29uc29sZS5sb2coXCI8YXV0aEluc3RhZ3JhbT5mYWlsZWQgd2hlbiB0cnlpbmcgdG8gcmVnaXN0ZXIgdXNlclwiICsgSlNPTi5zdHJpbmdpZnkoZmFpbHVyZSkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9LCBmdW5jdGlvbihmYWlsdXJlKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJmYWlsdXJlIHdoaWxlIGF1dGhlbnRpY2F0aW9uIG9mIGluc3RhZ3JhbVwiICsgSlNPTi5zdHJpbmdpZnkoZmFpbHVyZSkpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5hdXRoWW91dHViZSA9IGZ1bmN0aW9uKGNoYW5uZWxJZCwgZGF5cykge1xyXG4gICAgJHNjb3BlLnNob3dEYXlDaGFuZ2VyID0gZmFsc2U7XHJcbiAgICBpZiAoY2hhbm5lbElkKSB7IC8vY2FsbGluZyBmb3IgcmVnaXN0cmF0aW9uICFcclxuICAgICAgYWxlcnQoXCJyZWdpc3RlcmluZyBDaGFubmVsLCBwbGVhc2UgcmVmcmVzaCBhZnRlciBmZXcgbW9tZW50cyB0byBsb2FkIGFuYWx5dGljcyBkYXRhXCIpO1xyXG4gICAgICByZXR1cm4gJGh0dHAoe1xyXG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgIHVybDogJy9hcGkvYW5hbHl0aWNzL3lvdXR1YmUvc3RhdHMnLFxyXG4gICAgICAgIGRhdGE6IHtcclxuICAgICAgICAgIHJlZ2lzdGVyOiB0cnVlLFxyXG4gICAgICAgICAgY2hhbm5lbElkOiBjaGFubmVsSWRcclxuICAgICAgICB9XHJcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24oc3VjY2Vzcykge1xyXG4gICAgICAgICRzY29wZS5zaG93WW91dHViZUNoYW5uZWwgPSBmYWxzZTtcclxuICAgICAgICBkZWxldGUgJHNjb3BlLnlvdXR1YmVDaGFubmVsO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHN1Y2Nlc3MpO1xyXG4gICAgICAgICRzY29wZS5hdXRoWW91dHViZSgpO1xyXG4gICAgICB9LCBmdW5jdGlvbihlcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAkc2NvcGUuZW5hYmxlR3JhcGggPSBmYWxzZTtcclxuICAgICRodHRwKHtcclxuICAgICAgbWV0aG9kOiAnUE9TVCcsXHJcbiAgICAgIHVybDogJy9hcGkvYW5hbHl0aWNzL3lvdXR1YmUvc3RhdHMnLFxyXG4gICAgICBkYXRhOiB7XHJcbiAgICAgICAgZGF5X2xpbWl0OiBkYXlzXHJcbiAgICAgIH1cclxuICAgIH0pLnN1Y2Nlc3MoZnVuY3Rpb24oc3VjY2Vzc19odHRwKSB7XHJcbiAgICAgICRzY29wZS5kaXNwbGF5RXJyb3IgPSBmYWxzZTtcclxuICAgICAgJHNjb3BlLmRheXNDYWxsYmFja0Z1bmN0aW9uID0gJ2F1dGhZb3V0dWJlJztcclxuICAgICAgJHNjb3BlLnNob3dEYXlDaGFuZ2VyID0gdHJ1ZTtcclxuICAgICAgJHNjb3BlLmdyYXBoX2RhdGEgPSBzdWNjZXNzX2h0dHA7XHJcbiAgICAgICRzY29wZS5lbmFibGVHcmFwaCA9IHRydWU7XHJcbiAgICB9KS5lcnJvcihmdW5jdGlvbigpIHtcclxuICAgICAgJGF1dGguYXV0aGVudGljYXRlKCdnb29nbGUnKS50aGVuKGZ1bmN0aW9uKHN1Y2Nlc3MpIHtcclxuICAgICAgICAkc2NvcGUueW91dHViZUNoYW5uZWwgPSBzdWNjZXNzLmRhdGE7XHJcbiAgICAgICAgJHNjb3BlLnNob3dZb3V0dWJlQ2hhbm5lbCA9IHRydWU7XHJcbiAgICAgIH0sIGZ1bmN0aW9uKGZhaWx1cmUpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhcImZhaWxlZCBmcm9tIGF1dGhvcml6YXRpb24gc2VydmVyPj4+PlwiICsgSlNPTi5zdHJpbmdpZnkoZmFpbHVyZSkpO1xyXG4gICAgICB9KTtcclxuICAgIH0pO1xyXG4gIH07XHJcbiAgJHNjb3BlLmFsZXJ0ID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgYWxlcnQoZGF0YSk7XHJcbiAgfTtcclxufSk7XHJcbmFwcC5jb250cm9sbGVyKCdncmFwaENvbnRyb2xlcicsIGZ1bmN0aW9uKCRzY29wZSkge1xyXG4gIC8vICRzY29wZS5kYXRhID0gW3tcclxuICAvLyAgICAga2V5OiBcIkN1bXVsYXRpdmUgUmV0dXJuXCIsXHJcbiAgLy8gICAgIHZhbHVlczogdmFsdWVfYXJyYXlcclxuICAvLyB9XTtcclxuICAkc2NvcGUub3B0aW9ucyA9IHtcclxuICAgIG1hcmdpbjoge1xyXG4gICAgICB0b3A6IDIwXHJcbiAgICB9LFxyXG4gICAgc2VyaWVzOiBbe1xyXG4gICAgICBheGlzOiBcInlcIixcclxuICAgICAgZGF0YXNldDogXCJ0aW1lZFwiLFxyXG4gICAgICBrZXk6IFwidmFsXzBcIixcclxuICAgICAgbGFiZWw6IFwiQW5hbHl0aWNzIGRhdGFcIixcclxuICAgICAgY29sb3I6IFwiaHNsYSg4OCwgNDglLCA0OCUsIDEpXCIsXHJcbiAgICAgIHR5cGU6IFtcclxuICAgICAgICBcImxpbmVcIlxyXG4gICAgICBdLFxyXG4gICAgICBpZDogXCJteVNlcmllczBcIlxyXG4gICAgfV0sXHJcbiAgICBheGVzOiB7XHJcbiAgICAgIHg6IHtcclxuICAgICAgICBrZXk6IFwieFwiLFxyXG4gICAgICAgIHR5cGU6IFwiZGF0ZVwiXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG4gICRzY29wZS5kYXRhID0ge1xyXG4gICAgdGltZWQ6IFtdXHJcbiAgfTtcclxuICBmb3IgKHZhciBsb2NhbF9kYXRhIGluICRzY29wZS5ncmFwaF9kYXRhKSB7XHJcbiAgICAkc2NvcGUuZGF0YS50aW1lZC5wdXNoKHtcclxuICAgICAgeDogbG9jYWxfZGF0YSxcclxuICAgICAgdmFsXzA6ICRzY29wZS5ncmFwaF9kYXRhW2xvY2FsX2RhdGFdXHJcbiAgICB9KTtcclxuICB9XHJcbiAgZm9yICh2YXIgaSBpbiAkc2NvcGUuZGF0YS50aW1lZCkge1xyXG4gICAgJHNjb3BlLmRhdGEudGltZWRbaV0ueCA9IG5ldyBEYXRlKCRzY29wZS5kYXRhLnRpbWVkW2ldLngpO1xyXG4gIH1cclxufSk7Il0sImZpbGUiOiJhcnRpc3RUb29scy9BbmFseXRpY3MvYW5hbHl0aWNzQ29udHJvbGxlci5qcyJ9
