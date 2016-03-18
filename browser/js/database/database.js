app.config(function($stateProvider) {
  $stateProvider.state('database', {
    url: '/admin/database',
    templateUrl: 'js/database/database.html',
    controller: 'DatabaseController'
  });
});


app.controller('DatabaseController', function($rootScope, $state, $scope, $http, AuthService, SOUNDCLOUD, socket) {
  $scope.addUser = {};
  $scope.query = {};
  $scope.trdUsrQuery = {};
  $scope.downloadButtonVisible = false;
  $scope.statusBarVisible = false;
  $scope.track = {
    trackUrl: '',
    downloadUrl: '',
    email: ''
  };
  $scope.bar = {
    type: 'success',
    value: 0
  };
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

  $scope.logout = function() {
    $http.get('/api/logout').then(function() {
      window.location.href = '/admin';
    }).catch(function(err) {
      $scope.processing = false;
      alert('Wrong Password');
    });
  }


  $scope.saveAddUser = function() {
    $scope.processing = true;
    $scope.addUser.password = $rootScope.password;
    $http.post('/api/database/adduser', $scope.addUser)
      .then(function(res) {
        alert("Success: Database is being populated. You will be emailed when it is complete.");
        $scope.processing = false;
        $scope.statusBarVisible = true;
      })
      .catch(function(err) {
        alert('Bad submission');
        $scope.processing = false;
      });
  }

  $scope.createUserQueryDoc = function() {
    $scope.createUserQueryDoc.blah = "asd"
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
    if ($scope.query.columns) query.columns = $scope.query.columns;
    if ($scope.query.trackedUsersURL) query.trackedUsersURL = $scope.query.trackedUsersURL;
    var body = {
      query: query,
      password: $rootScope.password
    };
    $scope.processing = true;
    $http.post('/api/database/followers', body)
      .then(function(res) {
        $scope.filename = res.data;
        $scope.downloadButtonVisible = true;
        $scope.processing = false;
      })
      .then(null, function(err) {
        alert("ERROR: Bad Query or No Matches");
        $scope.processing = false;
      });
  }

  $scope.createTrdUsrQueryDoc = function() {
    var query = {};
    var flwrQry = {};
    if ($scope.trdUsrQuery.followersGT) {
      flwrQry.$gt = $scope.trdUsrQuery.followersGT;
      query.followers = flwrQry;
    }
    if ($scope.trdUsrQuery.followersLT) {
      flwrQry.$lt = $scope.trdUsrQuery.followersLT;
      query.followers = flwrQry;
    }
    if ($scope.trdUsrQuery.genre) query.genre = $scope.trdUsrQuery.genre;
    var body = {
      query: query,
      password: $rootScope.password
    };
    $scope.processing = true;
    $http.post('/api/database/trackedUsers', body)
      .then(function(res) {
        $scope.trdUsrFilename = res.data;
        $scope.downloadTrdUsrButtonVisible = true;
        $scope.processing = false;
      })
      .then(null, function(err) {
        alert("ERROR: Bad Query or No Matches");
        $scope.processing = false;
      });
  }

  $scope.download = function(filename) {
    var anchor = angular.element('<a/>');
    anchor.attr({
      href: filename,
      download: filename
    })[0].click();
    $scope.downloadButtonVisible = false;
    $scope.downloadTrdUsrButtonVisible = false;
  }

  $scope.saveDownloadUrl = function() {
    $scope.processing = true;
    $http.post('/api/database/downloadurl', $scope.track)
      .then(function(res) {
        $scope.track = {
          trackUrl: '',
          downloadUrl: '',
          email: ''
        }
        alert("SUCCESS: Url saved successfully");
        $scope.processing = false;
      })
      .then(null, function(err) {
        alert("ERROR: Error in saving url");
        $scope.processing = false;
      });
  }


  /* Listen to socket events */

  socket.on('notification', function(data){
    var percentage = parseInt(Math.floor(data.counter / data.total * 100), 10);
    $scope.bar.value = percentage;
    if(percentage === 100) {
      $scope.statusBarVisible = false;
      $scope.bar.value = 0;
    }
  });
});