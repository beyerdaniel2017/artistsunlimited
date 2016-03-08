app.config(function($stateProvider) {
  $stateProvider.state('database', {
    url: '/admin/database',
    templateUrl: 'js/database/database.html',
    controller: 'DatabaseController'
  });
});


app.controller('DatabaseController', function($rootScope, $state, $scope, $http, AuthService, SOUNDCLOUD) {
  $scope.addUser = {};

  $scope.urlChange = function(ind) {
    $http.post('/api/soundcloud/soundcloudUser', {
        url: $scope.url
      })
      .then(function(res) {
        $scope.addUser.username = res.name
        document.getElementById('scPlayer' + ind).style.visibility = "visible";
      }).then(null, function(err) {
        document.getElementById('scPlayer').style.visibility = "hidden";
      });
  }

  $scope.login = function() {
    $scope.processing = true;
    $http.post('/api/login', {
      password: $scope.password
    }).then(function() {
      $rootScope.password = $scope.password;
      $scope.loggedIn = true;
      $scope.processing = false;
    }).catch(function(err) {
      $scope.processing = false;
      alert('Wrong Password');
    });
  }

});