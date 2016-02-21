app.config(function($stateProvider) {
  $stateProvider.state('admin', {
    url: '/admin',
    templateUrl: 'js/login/login.html',
    controller: 'AdminLoginController'
  });
});


app.controller('AdminLoginController', function($rootScope, $state, $scope, $http, AuthService, CLIENT_ID) {
  $scope.login = function() {
    $http.post('/api/login', {
      password: $scope.password
    }).then(function() {
      $rootScope.password = $scope.password;
      $scope.showSubmissions = true;
      $scope.loadSubmissions();
    }).catch(function(err) {
      alert('Wrong Password');
    });
  }

  $scope.manage = function() {
    SC.initialize({
      client_id: "bd30924b4a322ba9e488c06edc73f909",
      redirect_uri: "http://serene-sands-30935.herokuapp.com/callback.html",
      scope: "non-expiring"
    });
    SC.connect().then(function(res) {
      $rootScope.accessToken = res.oauth_token;
      $http.post('/api/login/authenticated', {
          token: res.oauth_token,
          password: $rootScope.password,
        })
        .then(function(res) {
          $rootScope.schedulerInfo = res.data;
          $rootScope.schedulerInfo.events.forEach(function(ev) {
            ev.day = new Date(ev.day);
          });
          $state.go('scheduler');
        })
        .then(null, function(err) {
          alert('Error: Account not manageable.');
        });
    });
  }

  $scope.loadSubmissions = function() {
    $http.get('/api/submissions')
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
        console.log(res.data);
        return $http.get('/api/channels');
      })
      .then(function(res) {
        $scope.channels = res.data;
        console.log(res.data);
      })
      .then(null, function(err) {
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
      $http.put("/api/submissions/save", submi)
        .then(function(sub) {
          $scope.submissions.splice($scope.submissions.indexOf(submi), 1);
          window.alert("Saved");
        })
        .then(null, function(err) {
          window.alert("ERROR: did not Save")
        })
    }
  }

  $scope.ignore = function(submission) {
    $http.delete('/api/submissions/ignore/' + submission._id + '/' + $rootScope.password)
      .then(function(res) {
        console.log(res.data);
        var index = $scope.submissions.indexOf(submission);
        $scope.submissions.splice(index, 1);
        window.alert("Ignored");
      })
      .then(null, function(err) {
        window.alert("ERROR: did not Ignore");
      });
  }

  $scope.decline = function(submission) {
    $http.delete('/api/submissions/decline/' + submission._id + '/' + $rootScope.password)
      .then(function(res) {
        console.log(res.data);
        var index = $scope.submissions.indexOf(submission);
        $scope.submissions.splice(index, 1);
        window.alert("Declined");
      })
      .then(null, function(err) {
        window.alert("ERROR: did not Decline");
      });
  }


});