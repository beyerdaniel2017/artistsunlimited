app.config(function($stateProvider) {
  $stateProvider.state('database', {
    url: '/admin/database',
    templateUrl: 'js/database/database.html',
    controller: 'DatabaseController'
  });
});


app.controller('DatabaseController', function($rootScope, $state, $scope, $http, AuthService, SOUNDCLOUD) {
  $scope.addUser = {};
  $scope.query = {};
  $scope.downloadButtonVisible = false;

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

  $scope.createUserQueryDoc = function() {
    var query = {};
    if ($scope.query.artist == "artists") {
      query.artist = true;
    } else if ($scope.query.artist == "non-artists") {
      query.artist = false;
    }
    var flwrQry = {};
    if ($scope.query.followersGT) {
      flwrQry.$gt = $scope.query.followersGT;
      query.followers = flwrQry;
    }
    if ($scope.query.followersLT) {
      flwrQry.$lt = $scope.query.followersLT;
      query.followers = flwrQry;
    }
    if ($scope.query.genre) query.genre = $scope.query.genre;
    if ($scope.query.trackedUsersURL) query.trackedUsersURL = $scope.query.trackedUsersURL;
    var body = {
      query: query,
      password: $rootScope.password
    };
    console.log(query);
    $scope.processing = true;
    $http.post('/api/database/followers', body)
      .then(function(res) {
        console.log(res);
        $scope.downloadButtonVisible = true;
        $scope.processing = false;
      })
      .then(null, function(err) {
        alert("ERROR: Bad Query or No Matches");
        $scope.processing = false;
      });
  }

  $scope.download = function() {
    $scope.downloadButtonVisible = false;
    $scope.processing = true;
    $http.get('/api/database/downloadFile')
      .then(function(res) {
        console.log(res);
        var anchor = angular.element('<a/>');
        anchor.attr({
          href: 'data:attachment/csv;charset=utf-8,' + encodeURI(res.data),
          target: '_blank',
          download: 'userDBQuery.csv'
        })[0].click();
        $scope.processing = false;
      })
      .then(null, function(err) {
        alert("ERROR: Unable to download");
        $scope.processing = false;
      })
  }
});