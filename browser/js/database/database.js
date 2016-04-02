app.config(function($stateProvider) {
  $stateProvider.state('database', {
    url: '/admin/database',
    templateUrl: 'js/database/database.html',
    controller: 'DatabaseController'
  });
});

app.directive('notificationBar', ['socket', function(socket) {
  return {
    restrict: 'EA',
    scope: true,
    template: '<div style="margin: 0 auto;width:50%" ng-show="bar.visible">' +
      '<uib-progress><uib-bar value="bar.value" type="{{bar.type}}"><span>{{bar.value}}%</span></uib-bar></uib-progress>' +
      '</div>',
    link: function($scope, iElm, iAttrs, controller) {
      socket.on('notification', function(data) {
        var percentage = parseInt(Math.floor(data.counter / data.total * 100), 10);
        $scope.bar.value = percentage;
        if (percentage === 100) {
          $scope.bar.visible = false;
          $scope.bar.value = 0;
        }
      });
    }
  };
}]);

app.controller('DatabaseController', function($rootScope, $state, $scope, $http, AuthService, socket) {
  $scope.addUser = {};
  $scope.query = {};
  $scope.trdUsrQuery = {};
  $scope.queryCols = [{
    name: 'username',
    value: 'username'
  }, {
    name: 'genre',
    value: 'genre'
  }, {
    name: 'name',
    value: 'name'
  }, {
    name: 'URL',
    value: 'scURL'
  }, {
    name: 'email',
    value: 'email'
  }, {
    name: 'description',
    value: 'description'
  }, {
    name: 'followers',
    value: 'followers'
  }, {
    name: 'number of tracks',
    value: 'numTracks'
  }, {
    name: 'facebook',
    value: 'facebookURL'
  }, {
    name: 'instagram',
    value: 'instagramURL'
  }, {
    name: 'twitter',
    value: 'twitterURL'
  }, {
    name: 'youtube',
    value: 'youtubeURL'
  }, {
    name: 'websites',
    value: 'websites'
  }, {
    name: 'auto email day',
    value: 'emailDayNum'
  }, {
    name: 'all emails',
    value: 'allEmails'
  }];
  $scope.downloadButtonVisible = false;
  $scope.track = {
    trackUrl: '',
    downloadUrl: '',
    email: ''
  };
  $scope.bar = {
    type: 'success',
    value: 0,
    visible: false
  };
  $scope.paidRepost = {
    soundCloudUrl: ''
  };

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
        $scope.bar.visible = true;
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
    if ($scope.queryCols) {
      query.columns = $scope.queryCols.filter(function(elm) {
        return elm.value !== null;
      }).map(function(elm) {
        return elm.value;
      });
    }
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

  $scope.downloadUrlChange = function() {
    if ($scope.track.trackURL !== '') {
      $scope.processing = true;
      $http.post('/api/soundcloud/resolve', {
          url: $scope.track.trackURL
        })
        .then(function(res) {
          $scope.track.trackID = res.data.id;
          $scope.track.artistID = res.data.user_id;
          $scope.track.artworkURL = res.data.artwork_url.replace('large.jpg', 't500x500.jpg');
          $scope.processing = false;
        }).then(null, function(err) {
          $scope.track.trackID = null;
          $scope.notFound = true;
          $scope.processing = false;
        });
    }
  }

  $scope.saveDownloadUrl = function() {
    if (!$scope.track.playlistID || !$scope.track.email || !$scope.track.downloadURL) {
      alert('Please fill in all fields');
      return false;
    }
    if (!$scope.track.trackID) {
      alert('Track Not Found');
      return false;
    }
    $scope.processing = true;
    $http.post('/api/database/downloadurl', $scope.track)
      .then(function(res) {
        $scope.track = {
          trackURL: '',
          downloadURL: '',
          email: '',
          playlistID: ''
        };
        alert("SUCCESS: Url saved successfully");
        $scope.processing = false;
      })
      .then(null, function(err) {
        alert("ERROR: Error in saving url");
        $scope.processing = false;
      });
  }

  $scope.savePaidRepostChannel = function() {
    $scope.processing = true;
    $http.post('/api/database/paidrepost', $scope.paidRepost)
      .then(function(res) {
        $scope.paidRepost = {
          soundCloudUrl: ''
        };
        alert("SUCCESS: Url saved successfully");
        $scope.processing = false;
      })
      .then(null, function(err) {
        alert("ERROR: Error in saving url");
        $scope.processing = false;
      });
  }

  /* Listen to socket events */

  socket.on('notification', function(data) {
    var percentage = parseInt(Math.floor(data.counter / data.total * 100), 10);
    $scope.bar.value = percentage;
    if (percentage === 100) {
      $scope.statusBarVisible = false;
      $scope.bar.value = 0;
    }
  });
});