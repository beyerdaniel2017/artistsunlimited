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

app.controller('AuthController', function($rootScope, $state, $scope, $http, AuthService, SessionService, socket) {
	
	$scope.loginObj = {};

  $scope.login = function() {
  	AuthService
  		.login($scope.loginObj)
  		.then(handleLoginResponse)
  		.catch(handleLoginError)
  	
  	function handleLoginResponse(res) {
      if(res.status === 200 && res.data.success) {
        SessionService.create(res.data.user);
        $state.go('artistTools.downloadGateway');
      }
  	}

  	function handleLoginError(res) {
  	}
  };


  $scope.signup = function() {
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
});