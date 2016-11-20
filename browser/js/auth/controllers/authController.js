app.config(function($stateProvider) {
  $stateProvider
    .state('login', {
      url: '/login',
      params: {
        submission: null
      },
      templateUrl: 'js/auth/views/login.html',
      controller: 'AuthController'
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
        if ($stateParams.submission) {
          $state.go('artistToolsDownloadGatewayNew', {
            'submission': $stateParams.submission
          });
          return;
        }
        $scope.processing = false;
        if (!$scope.$$phase) $rootScope.$apply();
        console.log($window.localStorage.getItem('returnstate'));
        if ($window.localStorage.getItem('returnstate') != undefined) {
          if ($window.localStorage.getItem('returnstate') == "reForReInteraction") {
            window.location.href = '/artistTools/trade/' + $window.localStorage.getItem('user1Name') + '/' + $window.localStorage.getItem('user2Name');
          } else if ($window.localStorage.getItem('returnstate') == "artistToolsDownloadGatewayEdit") {
            $state.go($window.localStorage.getItem('returnstate'), {
              gatewayID: $window.localStorage.getItem('tid')
            });
          } else {
            $state.go($window.localStorage.getItem('returnstate'));
          }
        } else {
          console.log('go')
          $state.go('artistToolsScheduler');
        }
      })
      .then(null, function(err) {
        console.log(err);
        $scope.processing = false;
        $scope.$apply();
        $.Zebra_Dialog('Error: Could not log in');
      });
  };
});