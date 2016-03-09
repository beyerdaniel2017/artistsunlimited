app.config(function($stateProvider) {
  $stateProvider.state('database', {
    url: '/admin/database',
    templateUrl: 'js/database/database.html',
    controller: 'DatabaseController'
  });
});


app.controller('DatabaseController', function($rootScope, $state, $scope, $http, AuthService, SOUNDCLOUD) {
  $scope.addUser = {};

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

  $scope.saveAddUser = function() {
    $scope.processing = true;
    $scope.addUser.password = $rootScope.password;
    console.log($scope.addUser);
    $http.post('/api/database/adduser', $scope.addUser)
      .then(function(res) {
        console.log(res);
        // alert('User ' + res.data.userName + "'s followers added");
        $scope.processing = false;
      })
      .catch(function(err) {
        alert('Bad submission');
        $scope.processing = false;
      });
  }

});