app.config(function($stateProvider) {
  $stateProvider
    .state('login', {
      url: '/login',
      templateUrl: 'js/auth/views/login.html',
      controller: 'AuthController'
    })
    .state('signup', {
      url: '/signup',
      templateUrl: 'js/auth/views/signup.html',
      controller: 'AuthController'
    });
});

app.controller('AuthController', function($rootScope, $state, $scope, $http, $uibModal, $window, AuthService, SessionService, socket) {
  
  $scope.loginObj = {};
  $scope.message = {
    val: '',
    visible: false
  };
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
      if(res.status === 200 && res.data.success) {
        SessionService.create(res.data.user);
        $state.go('artistTools.downloadGateway.list');
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


  $scope.signup = function() {
    $scope.message = {
      val: '',
      visible: false
    };
    if($scope.signupObj.password != $scope.signupObj.confirmPassword){
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

    function handleSignupError(res) {
    }
  };

  $scope.soundcloudLogin = function() {
    SC.connect()
      .then(function (res) {
        $rootScope.accessToken = res.oauth_token;
        return $http.post('/api/login/soundCloudLogin', {
          token: res.oauth_token,
          password: 'test'
        });
      })
      .then(function (res) {
        $scope.processing = false;
        SessionService.create(res.data.user);
        $state.go('artistTools.downloadGateway.list');
      })
      .then(null, function (err) {
        alert('Error: Could not log in');
        $scope.processing = false;
      });
  };
});