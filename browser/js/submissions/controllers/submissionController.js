app.config(function($stateProvider) {
  $stateProvider.state('submissions', {
    url: '/submissions',
    templateUrl: 'js/submissions/views/submissions.html',
    controller: 'SubmissionController'
  });
});


app.controller('SubmissionController', function($rootScope, $state, $scope, $http, AuthService, oEmbedFactory) {

  $scope.logout = function() {
    $http.get('/api/logout').then(function() {
      window.location.href = '/admin';
    }).catch(function(err) {
      $scope.processing = false;
      alert('Wrong Password');
    });
  }

  $scope.loadSubmissions = function() {
    $scope.processing = true;
    $http.get('/api/submissions/unaccepted')
      .then(function(res) {
        $scope.submissions = res.data;
        console.log(res.data);
        $scope.loadMore();
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

  $scope.loadMore = function() {
    var loadElements = [];
    for (let i = $scope.counter; i < $scope.counter + 15; i++) {
      var sub = $scope.submissions[i];
      $scope.showingElements.push(sub);
      loadElements.push(sub);
    }
    setTimeout(function() {
      console.log(loadElements);
      loadElements.forEach(function(sub) {
        oEmbedFactory.embedSong(sub);
      }, 50)
    });
    $scope.counter += 15;
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
          $scope.showingElements.splice($scope.showingElements.indexOf(submi), 1);
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
        var index = $scope.showingElements.indexOf(submission);
        $scope.showingElements.splice(index, 1);
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
        var index = $scope.showingElements.indexOf(submission);
        $scope.showingElements.splice(index, 1);
        window.alert("Declined");
        $scope.processing = false
      })
      .then(null, function(err) {
        $scope.processing = false;
        window.alert("ERROR: did not Decline");
      });
  }
});