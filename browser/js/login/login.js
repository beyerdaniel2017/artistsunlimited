app.config(function($stateProvider) {
  $stateProvider.state('admin', {
    url: '/admin',
    templateUrl: 'js/login/login.html',
    controller: 'AdminLoginController'
  });
});


app.controller('AdminLoginController', function($rootScope, $state, $scope, $http, AuthService, oEmbedFactory) {
  $scope.counter = 0;
  $scope.showingElements = [];
  $scope.submissions = [];

  $scope.login = function() {
    $scope.processing = true;
    $http.post('/api/login', {
      password: $scope.password
    }).then(function() {
      $rootScope.password = $scope.password;
      $scope.showSubmissions = true;
      $scope.loadSubmissions();
      $scope.processing = false;
    }).catch(function(err) {
      $scope.processing = false;
      $.Zebra_Dialog('Wrong Password');
    });
  }

  $scope.logout = function() {
    $http.get('/api/logout').then(function() {
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