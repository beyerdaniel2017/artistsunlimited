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
        SessionService.create(res.data.user);
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
        $window.localStorage.setItem('logintoken', res.data.logintoken);
        SessionService.create(res.data.user);
        if ($stateParams.submission) {
          $state.go('artistToolsDownloadGatewayNew', {
            'submission': $stateParams.submission
          });
          return;
        }
        $state.go('reForReLists');
      })
      .then(null, function(err) {
        $.Zebra_Dialog('Error: Could not log in');
        $scope.processing = false;
      });
  };
});