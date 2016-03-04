app.config(function($stateProvider) {
  $stateProvider.state('admin', {
    url: '/admin',
    templateUrl: 'js/login/login.html',
    controller: 'AdminLoginController'
  });
});


app.controller('AdminLoginController', function($rootScope, $state, $scope, $http, AuthService, SOUNDCLOUD) {
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
      alert('Wrong Password');
    });
  }

  $scope.manage = function() {
    $scope.processing = true;
    SC.initialize({
      client_id: SOUNDCLOUD.clientID,
      redirect_uri: SOUNDCLOUD.redirectURL,
      scope: "non-expiring"
    });
    SC.connect().then(function(res) {
        $rootScope.accessToken = res.oauth_token;
        $http.post('/api/login/authenticated', {
            token: res.oauth_token,
            password: $rootScope.password,
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
            $scope.processing = false;
            alert('Error: Account not manageable.');
          });
      })
      .then(null, function(err) {
        alert('Error: Could not log in');
        $scope.processing = false;
      });
  }

  $scope.loadSubmissions = function() {
    $scope.processing = true;
    $http.get('/api/submissions/unaccepted')
      .then(function(res) {
        $scope.submissions = res.data;
        setTimeout(function() {
          $scope.submissions.forEach(function(sub) {
            SC.oEmbed("http://api.soundcloud.com/tracks/" + sub.trackID, {
              element: document.getElementById(sub.trackID + "player"),
              auto_play: false,
              maxheight: 150
            });
          });
        }, 50);
        return $http.get('/api/channels');
      })
      .then(function(res) {
        $scope.channels = res.data;
        $scope.processing = false;
      })
      .then(null, function(err) {
        $scope.processing = false;
        alert('Error: Could not get channels.')
        console.log(err);
      });
  }

  $scope.changeBox = function(sub, chan) {
    var index = sub.channelIDS.indexOf(chan.channelID);
    if (index == -1) {
      sub.channelIDS.push(chan.channelID);
    } else {
      sub.channelIDS.splice(index, 1);
    }
  }

  $scope.save = function(submi) {
    if (submi.channelIDS.length == 0) {
      $scope.decline(submi);
    } else {
      submi.password = $rootScope.password;
      $scope.processing = true;
      $http.put("/api/submissions/save", submi)
        .then(function(sub) {
          $scope.submissions.splice($scope.submissions.indexOf(submi), 1);
          window.alert("Saved");
          $scope.processing = false;
        })
        .then(null, function(err) {
          $scope.processing = false;
          window.alert("ERROR: did not Save")
        })
    }
  }

  $scope.ignore = function(submission) {
    $scope.processing = true;
    $http.delete('/api/submissions/ignore/' + submission._id + '/' + $rootScope.password)
      .then(function(res) {
        var index = $scope.submissions.indexOf(submission);
        $scope.submissions.splice(index, 1);
        window.alert("Ignored");
        $scope.processing = false;
      })
      .then(null, function(err) {
        $scope.processing = false;
        window.alert("ERROR: did not Ignore");
      });
  }

  $scope.decline = function(submission) {
    $scope.processing = true;
    $http.delete('/api/submissions/decline/' + submission._id + '/' + $rootScope.password)
      .then(function(res) {
        var index = $scope.submissions.indexOf(submission);
        $scope.submissions.splice(index, 1);
        window.alert("Declined");
        $scope.processing = false
      })
      .then(null, function(err) {
        $scope.processing = false;
        window.alert("ERROR: did not Decline");
      });
  }
});