app.config(function($stateProvider) {
  $stateProvider.state('admin', {
    url: '/admin',
    templateUrl: 'js/login/login.html',
    controller: 'AdminLoginController'
  });
});

app.controller('AdminLoginController', function($rootScope, $state, $scope, $http, AuthService, SessionService,$window) {
  $scope.counter = 0;
  $scope.showingElements = [];
  $scope.submissions = [];
  $scope.loginObj = {};
  $scope.isLoggedIn = SessionService.getUser() ? true : false; 
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
        $window.localStorage.setItem('logintoken', res.data.logintoken);
        SessionService.create(res.data.user);
        $state.go('submissions');
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
  $scope.logout = function() {
    $http.get('/api/logout').then(function() {
      SessionService.deleteUser();
      window.location.href = '/admin';
    }).catch(function(err) {
      $scope.processing = false;
      $.Zebra_Dialog('Wrong Password');
    });
  }
  $scope.manage = function() {
    $scope.processing = true;
    SC.connect()
      .then(function(res) {
        $rootScope.accessToken = res.oauth_token;
        return $http.post('/api/login/authenticated', {
          token: res.oauth_token,
          password: $rootScope.password,
        })
      })
      .then(function(res) {
        $scope.processing = false;
        $rootScope.schedulerInfo = res.data;
        $rootScope.schedulerInfo.events.forEach(function(ev) {
          ev.day = new Date(ev.day);
        });
        $state.go('scheduler');
      })
      .then(null, function(err) {
        $.Zebra_Dialog('Error: Could not log in');
        $scope.processing = false;
      });
  }
});