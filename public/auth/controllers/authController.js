app.config(function($stateProvider) {
  $stateProvider
    .state('login', {
      url: '/login',
      params: {
        submission: null
      },
      templateUrl: 'js/auth/views/login.html',
      controller: 'AuthController',
      resolve: {
        config: function(AppConfig) {
          return AppConfig.fetchConfig().then(function(res) {
            return AppConfig.setConfig(res.data);
          })
        }
      }
    })
    .state('signup', {
      url: '/signup',
      templateUrl: 'js/auth/views/signup.html',
      controller: 'AuthController'
    });
});

app.controller('AuthController', function($rootScope, $state, $stateParams, $scope, $http, $uibModal, $window, AuthService, SessionService, socket) {
  $scope.loginObj = {};
  $scope.message = {
    val: '',
    visible: false
  };

  if ($window.localStorage.getItem('returnstate') == 'reForReInteraction') {
    $.Zebra_Dialog("Please log in with the account who's trade you wish to view.", {
      'type': 'question',
      'buttons': [{
        caption: 'Cancel',
        callback: function() {
          $window.localStorage.removeItem('returnstate');
          $window.localStorage.removeItem('user1Name');
          $window.localStorage.removeItem('user2Name');
        }
      }, {
        caption: 'Log In',
        callback: function() {
          $scope.soundcloudLogin();
        }
      }]
    });
  }

  if (SessionService.getUser()) {
    $state.go('reForReLists')
  }
  $scope.openModal = {
    signupConfirm: function() {
      $scope.modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'signupComplete.html',
        controller: 'AuthController',
        scope: $scope
      });
    }
  };

  $scope.login = function() {
    $scope.message = {
      val: '',
      visible: false
    };
    AuthService
      .login($scope.loginObj)
      .then(handleLoginResponse)
      .catch(handleLoginError)

    function handleLoginResponse(res) {
      if (res.status === 200 && res.data.success) {
        var userData = res.data.user;
        userData.isAdmin = false;
        SessionService.create(userData);
        $state.go('reForReLists');
      } else {
        $scope.message = {
          val: res.data.message,
          visible: true
        };
      }
    }

    function handleLoginError(res) {
      $scope.message = {
        val: 'Error in processing your request',
        visible: true
      };

    }
  };

  $scope.updateEmail = function(email) {
    var answer = email;
    var myArray = answer.match(/[a-z\._\-!#$%&'+/=?^_`{}|~]+@[a-z0-9\-]+\.\S{2,3}/igm);
    if (myArray) {
      $scope.user.email = answer;
      return $http.put('/api/database/profile', $scope.user)
        .then(function(res) {
          SessionService.create(res.data);
          $scope.user = SessionService.getUser();
          $scope.hideall = false;
          $('#emailModal').modal('hide');
          $scope.showEmailModal = false;
          window.location.reload();
        })
        .then(null, function(err) {
          setTimeout(function() {
            $scope.showEmailModal = false;
            $scope.promptForEmail();
          }, 600);
        })
    } else {
      setTimeout(function() {
        $scope.showEmailModal = false;
        $scope.promptForEmail();
      }, 600);
    }
  }

  $scope.closeModal = function() {
    $('#emailModal').modal('hide');
  }

  $scope.promptForEmail = function() {
    console.log('prompting');
    $scope.showEmailModal = true;
    $('#emailModal').modal('show');
    if (!$scope.$$phase) $scope.$apply();
  }

  $scope.thirdPartyLogin = function(userdata) {
    AuthService
      .thirdPartylogin(userdata)
      .then(handleLoginResponse)
      .catch(handleLoginError)

    function handleLoginResponse(res) {
      if (res.status === 200 && res.data.success) {
        SessionService.create(res.data.user);
        $state.go('reForReLists');
      } else {
        $.Zebra_Dialog("Invalid Username OR Password.");
      }
    }

    function handleLoginError(res) {
      $.Zebra_Dialog("Error in processing your request");
    }
  }

  $scope.checkIfSubmission = function() {
    if ($stateParams.submission) {
      $scope.soundcloudLogin();
    }
  }
  $scope.signup = function() {
    $scope.message = {
      val: '',
      visible: false
    };
    if ($scope.signupObj.password != $scope.signupObj.confirmPassword) {
      $scope.message = {
        val: 'Password doesn\'t match with confirm password',
        visible: true
      };
      return;
    }
    AuthService
      .signup($scope.signupObj)
      .then(handleSignupResponse)
      .catch(handleSignupError)

    function handleSignupResponse(res) {
      $state.go('login');
    }

    function handleSignupError(res) {}
  };

  $scope.soundcloudLogin = function() {
    $scope.processing = true;
    SC.connect()
      .then(function(res) {
        $rootScope.accessToken = res.oauth_token;
        return $http.post('/api/login/soundCloudLogin', {
          token: res.oauth_token,
          password: 'test'
        });
      })
      .then(function(res) {
        $scope.processing = false;
        var userData = res.data.user;
        userData.isAdmin = false;
        SessionService.create(userData);
        $scope.user = SessionService.getUser();
        if (!$scope.user.email) {
          $scope.promptForEmail();
        } else {
          $scope.redirectLogin();
        }
      })
      .then(null, function(err) {
        console.log(err);
        $scope.processing = false;
        $scope.$apply();
        $.Zebra_Dialog('Error: Could not log in');
      });
  };

  $scope.redirectLogin = function() {
    if ($stateParams.submission) {
      $state.go('artistToolsDownloadGatewayNew', {
        'submission': $stateParams.submission
      });
      return;
    }
    $scope.processing = false;
    console.log($window.localStorage.getItem('returnstate'));
    if (!$scope.$$phase) $rootScope.$apply();
    if ($window.localStorage.getItem('returnstate') != undefined) {
      console.log('not undefined');
      if ($window.localStorage.getItem('returnstate') == "reForReInteraction") {
        console.log('/artistTools/trade/' + $window.localStorage.getItem('user1Name') + '/' + $window.localStorage.getItem('user2Name'))
        window.location.href = '/artistTools/trade/' + $window.localStorage.getItem('user1Name') + '/' + $window.localStorage.getItem('user2Name');
      } else if ($window.localStorage.getItem('returnstate') == "artistToolsDownloadGatewayEdit") {
        $state.go($window.localStorage.getItem('returnstate'), {
          gatewayID: $window.localStorage.getItem('tid')
        });
      } else {
        $state.go($window.localStorage.getItem('returnstate'));
      }
    } else {
      $state.go('artistToolsScheduler');
    }
  }
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhdXRoL2NvbnRyb2xsZXJzL2F1dGhDb250cm9sbGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlclxyXG4gICAgLnN0YXRlKCdsb2dpbicsIHtcclxuICAgICAgdXJsOiAnL2xvZ2luJyxcclxuICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgc3VibWlzc2lvbjogbnVsbFxyXG4gICAgICB9LFxyXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2F1dGgvdmlld3MvbG9naW4uaHRtbCcsXHJcbiAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ29udHJvbGxlcicsXHJcbiAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICBjb25maWc6IGZ1bmN0aW9uKEFwcENvbmZpZykge1xyXG4gICAgICAgICAgcmV0dXJuIEFwcENvbmZpZy5mZXRjaENvbmZpZygpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBBcHBDb25maWcuc2V0Q29uZmlnKHJlcy5kYXRhKTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG4gICAgLnN0YXRlKCdzaWdudXAnLCB7XHJcbiAgICAgIHVybDogJy9zaWdudXAnLFxyXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2F1dGgvdmlld3Mvc2lnbnVwLmh0bWwnLFxyXG4gICAgICBjb250cm9sbGVyOiAnQXV0aENvbnRyb2xsZXInXHJcbiAgICB9KTtcclxufSk7XHJcblxyXG5hcHAuY29udHJvbGxlcignQXV0aENvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgJHNjb3BlLCAkaHR0cCwgJHVpYk1vZGFsLCAkd2luZG93LCBBdXRoU2VydmljZSwgU2Vzc2lvblNlcnZpY2UsIHNvY2tldCkge1xyXG4gICRzY29wZS5sb2dpbk9iaiA9IHt9O1xyXG4gICRzY29wZS5tZXNzYWdlID0ge1xyXG4gICAgdmFsOiAnJyxcclxuICAgIHZpc2libGU6IGZhbHNlXHJcbiAgfTtcclxuXHJcbiAgaWYgKCR3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3JldHVybnN0YXRlJykgPT0gJ3JlRm9yUmVJbnRlcmFjdGlvbicpIHtcclxuICAgICQuWmVicmFfRGlhbG9nKFwiUGxlYXNlIGxvZyBpbiB3aXRoIHRoZSBhY2NvdW50IHdobydzIHRyYWRlIHlvdSB3aXNoIHRvIHZpZXcuXCIsIHtcclxuICAgICAgJ3R5cGUnOiAncXVlc3Rpb24nLFxyXG4gICAgICAnYnV0dG9ucyc6IFt7XHJcbiAgICAgICAgY2FwdGlvbjogJ0NhbmNlbCcsXHJcbiAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgncmV0dXJuc3RhdGUnKTtcclxuICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3VzZXIxTmFtZScpO1xyXG4gICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndXNlcjJOYW1lJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgY2FwdGlvbjogJ0xvZyBJbicsXHJcbiAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgJHNjb3BlLnNvdW5kY2xvdWRMb2dpbigpO1xyXG4gICAgICAgIH1cclxuICAgICAgfV1cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgaWYgKFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKSkge1xyXG4gICAgJHN0YXRlLmdvKCdyZUZvclJlTGlzdHMnKVxyXG4gIH1cclxuICAkc2NvcGUub3Blbk1vZGFsID0ge1xyXG4gICAgc2lnbnVwQ29uZmlybTogZnVuY3Rpb24oKSB7XHJcbiAgICAgICRzY29wZS5tb2RhbEluc3RhbmNlID0gJHVpYk1vZGFsLm9wZW4oe1xyXG4gICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3NpZ251cENvbXBsZXRlLmh0bWwnLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ29udHJvbGxlcicsXHJcbiAgICAgICAgc2NvcGU6ICRzY29wZVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAkc2NvcGUubG9naW4gPSBmdW5jdGlvbigpIHtcclxuICAgICRzY29wZS5tZXNzYWdlID0ge1xyXG4gICAgICB2YWw6ICcnLFxyXG4gICAgICB2aXNpYmxlOiBmYWxzZVxyXG4gICAgfTtcclxuICAgIEF1dGhTZXJ2aWNlXHJcbiAgICAgIC5sb2dpbigkc2NvcGUubG9naW5PYmopXHJcbiAgICAgIC50aGVuKGhhbmRsZUxvZ2luUmVzcG9uc2UpXHJcbiAgICAgIC5jYXRjaChoYW5kbGVMb2dpbkVycm9yKVxyXG5cclxuICAgIGZ1bmN0aW9uIGhhbmRsZUxvZ2luUmVzcG9uc2UocmVzKSB7XHJcbiAgICAgIGlmIChyZXMuc3RhdHVzID09PSAyMDAgJiYgcmVzLmRhdGEuc3VjY2Vzcykge1xyXG4gICAgICAgIHZhciB1c2VyRGF0YSA9IHJlcy5kYXRhLnVzZXI7XHJcbiAgICAgICAgdXNlckRhdGEuaXNBZG1pbiA9IGZhbHNlO1xyXG4gICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZSh1c2VyRGF0YSk7XHJcbiAgICAgICAgJHN0YXRlLmdvKCdyZUZvclJlTGlzdHMnKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkc2NvcGUubWVzc2FnZSA9IHtcclxuICAgICAgICAgIHZhbDogcmVzLmRhdGEubWVzc2FnZSxcclxuICAgICAgICAgIHZpc2libGU6IHRydWVcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaGFuZGxlTG9naW5FcnJvcihyZXMpIHtcclxuICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XHJcbiAgICAgICAgdmFsOiAnRXJyb3IgaW4gcHJvY2Vzc2luZyB5b3VyIHJlcXVlc3QnLFxyXG4gICAgICAgIHZpc2libGU6IHRydWVcclxuICAgICAgfTtcclxuXHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLnVwZGF0ZUVtYWlsID0gZnVuY3Rpb24oZW1haWwpIHtcclxuICAgIHZhciBhbnN3ZXIgPSBlbWFpbDtcclxuICAgIHZhciBteUFycmF5ID0gYW5zd2VyLm1hdGNoKC9bYS16XFwuX1xcLSEjJCUmJysvPT9eX2B7fXx+XStAW2EtejAtOVxcLV0rXFwuXFxTezIsM30vaWdtKTtcclxuICAgIGlmIChteUFycmF5KSB7XHJcbiAgICAgICRzY29wZS51c2VyLmVtYWlsID0gYW5zd2VyO1xyXG4gICAgICByZXR1cm4gJGh0dHAucHV0KCcvYXBpL2RhdGFiYXNlL3Byb2ZpbGUnLCAkc2NvcGUudXNlcilcclxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZShyZXMuZGF0YSk7XHJcbiAgICAgICAgICAkc2NvcGUudXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcclxuICAgICAgICAgICRzY29wZS5oaWRlYWxsID0gZmFsc2U7XHJcbiAgICAgICAgICAkKCcjZW1haWxNb2RhbCcpLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgICAkc2NvcGUuc2hvd0VtYWlsTW9kYWwgPSBmYWxzZTtcclxuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnNob3dFbWFpbE1vZGFsID0gZmFsc2U7XHJcbiAgICAgICAgICAgICRzY29wZS5wcm9tcHRGb3JFbWFpbCgpO1xyXG4gICAgICAgICAgfSwgNjAwKTtcclxuICAgICAgICB9KVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUuc2hvd0VtYWlsTW9kYWwgPSBmYWxzZTtcclxuICAgICAgICAkc2NvcGUucHJvbXB0Rm9yRW1haWwoKTtcclxuICAgICAgfSwgNjAwKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gICRzY29wZS5jbG9zZU1vZGFsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkKCcjZW1haWxNb2RhbCcpLm1vZGFsKCdoaWRlJyk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUucHJvbXB0Rm9yRW1haWwgPSBmdW5jdGlvbigpIHtcclxuICAgIGNvbnNvbGUubG9nKCdwcm9tcHRpbmcnKTtcclxuICAgICRzY29wZS5zaG93RW1haWxNb2RhbCA9IHRydWU7XHJcbiAgICAkKCcjZW1haWxNb2RhbCcpLm1vZGFsKCdzaG93Jyk7XHJcbiAgICBpZiAoISRzY29wZS4kJHBoYXNlKSAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUudGhpcmRQYXJ0eUxvZ2luID0gZnVuY3Rpb24odXNlcmRhdGEpIHtcclxuICAgIEF1dGhTZXJ2aWNlXHJcbiAgICAgIC50aGlyZFBhcnR5bG9naW4odXNlcmRhdGEpXHJcbiAgICAgIC50aGVuKGhhbmRsZUxvZ2luUmVzcG9uc2UpXHJcbiAgICAgIC5jYXRjaChoYW5kbGVMb2dpbkVycm9yKVxyXG5cclxuICAgIGZ1bmN0aW9uIGhhbmRsZUxvZ2luUmVzcG9uc2UocmVzKSB7XHJcbiAgICAgIGlmIChyZXMuc3RhdHVzID09PSAyMDAgJiYgcmVzLmRhdGEuc3VjY2Vzcykge1xyXG4gICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZShyZXMuZGF0YS51c2VyKTtcclxuICAgICAgICAkc3RhdGUuZ28oJ3JlRm9yUmVMaXN0cycpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICQuWmVicmFfRGlhbG9nKFwiSW52YWxpZCBVc2VybmFtZSBPUiBQYXNzd29yZC5cIik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBoYW5kbGVMb2dpbkVycm9yKHJlcykge1xyXG4gICAgICAkLlplYnJhX0RpYWxvZyhcIkVycm9yIGluIHByb2Nlc3NpbmcgeW91ciByZXF1ZXN0XCIpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmNoZWNrSWZTdWJtaXNzaW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoJHN0YXRlUGFyYW1zLnN1Ym1pc3Npb24pIHtcclxuICAgICAgJHNjb3BlLnNvdW5kY2xvdWRMb2dpbigpO1xyXG4gICAgfVxyXG4gIH1cclxuICAkc2NvcGUuc2lnbnVwID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUubWVzc2FnZSA9IHtcclxuICAgICAgdmFsOiAnJyxcclxuICAgICAgdmlzaWJsZTogZmFsc2VcclxuICAgIH07XHJcbiAgICBpZiAoJHNjb3BlLnNpZ251cE9iai5wYXNzd29yZCAhPSAkc2NvcGUuc2lnbnVwT2JqLmNvbmZpcm1QYXNzd29yZCkge1xyXG4gICAgICAkc2NvcGUubWVzc2FnZSA9IHtcclxuICAgICAgICB2YWw6ICdQYXNzd29yZCBkb2VzblxcJ3QgbWF0Y2ggd2l0aCBjb25maXJtIHBhc3N3b3JkJyxcclxuICAgICAgICB2aXNpYmxlOiB0cnVlXHJcbiAgICAgIH07XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIEF1dGhTZXJ2aWNlXHJcbiAgICAgIC5zaWdudXAoJHNjb3BlLnNpZ251cE9iailcclxuICAgICAgLnRoZW4oaGFuZGxlU2lnbnVwUmVzcG9uc2UpXHJcbiAgICAgIC5jYXRjaChoYW5kbGVTaWdudXBFcnJvcilcclxuXHJcbiAgICBmdW5jdGlvbiBoYW5kbGVTaWdudXBSZXNwb25zZShyZXMpIHtcclxuICAgICAgJHN0YXRlLmdvKCdsb2dpbicpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhhbmRsZVNpZ251cEVycm9yKHJlcykge31cclxuICB9O1xyXG5cclxuICAkc2NvcGUuc291bmRjbG91ZExvZ2luID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICBTQy5jb25uZWN0KClcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgJHJvb3RTY29wZS5hY2Nlc3NUb2tlbiA9IHJlcy5vYXV0aF90b2tlbjtcclxuICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9sb2dpbi9zb3VuZENsb3VkTG9naW4nLCB7XHJcbiAgICAgICAgICB0b2tlbjogcmVzLm9hdXRoX3Rva2VuLFxyXG4gICAgICAgICAgcGFzc3dvcmQ6ICd0ZXN0J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIHZhciB1c2VyRGF0YSA9IHJlcy5kYXRhLnVzZXI7XHJcbiAgICAgICAgdXNlckRhdGEuaXNBZG1pbiA9IGZhbHNlO1xyXG4gICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZSh1c2VyRGF0YSk7XHJcbiAgICAgICAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgICAgaWYgKCEkc2NvcGUudXNlci5lbWFpbCkge1xyXG4gICAgICAgICAgJHNjb3BlLnByb21wdEZvckVtYWlsKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICRzY29wZS5yZWRpcmVjdExvZ2luKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICQuWmVicmFfRGlhbG9nKCdFcnJvcjogQ291bGQgbm90IGxvZyBpbicpO1xyXG4gICAgICB9KTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUucmVkaXJlY3RMb2dpbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCRzdGF0ZVBhcmFtcy5zdWJtaXNzaW9uKSB7XHJcbiAgICAgICRzdGF0ZS5nbygnYXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlOZXcnLCB7XHJcbiAgICAgICAgJ3N1Ym1pc3Npb24nOiAkc3RhdGVQYXJhbXMuc3VibWlzc2lvblxyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgIGNvbnNvbGUubG9nKCR3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3JldHVybnN0YXRlJykpO1xyXG4gICAgaWYgKCEkc2NvcGUuJCRwaGFzZSkgJHJvb3RTY29wZS4kYXBwbHkoKTtcclxuICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdyZXR1cm5zdGF0ZScpICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICBjb25zb2xlLmxvZygnbm90IHVuZGVmaW5lZCcpO1xyXG4gICAgICBpZiAoJHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncmV0dXJuc3RhdGUnKSA9PSBcInJlRm9yUmVJbnRlcmFjdGlvblwiKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJy9hcnRpc3RUb29scy90cmFkZS8nICsgJHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlcjFOYW1lJykgKyAnLycgKyAkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyMk5hbWUnKSlcclxuICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYXJ0aXN0VG9vbHMvdHJhZGUvJyArICR3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3VzZXIxTmFtZScpICsgJy8nICsgJHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlcjJOYW1lJyk7XHJcbiAgICAgIH0gZWxzZSBpZiAoJHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncmV0dXJuc3RhdGUnKSA9PSBcImFydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5RWRpdFwiKSB7XHJcbiAgICAgICAgJHN0YXRlLmdvKCR3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3JldHVybnN0YXRlJyksIHtcclxuICAgICAgICAgIGdhdGV3YXlJRDogJHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndGlkJylcclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkc3RhdGUuZ28oJHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncmV0dXJuc3RhdGUnKSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICRzdGF0ZS5nbygnYXJ0aXN0VG9vbHNTY2hlZHVsZXInKTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG4iXSwiZmlsZSI6ImF1dGgvY29udHJvbGxlcnMvYXV0aENvbnRyb2xsZXIuanMifQ==
