app.config(function($stateProvider) {
  $stateProvider.state('submissions', {
    url: '/admin/submissions',
    templateUrl: 'js/submissions/views/submissions.html',
    controller: 'SubmissionController'
  });
});

app.controller('SubmissionController', function($rootScope, $state, $scope, $http, AuthService, SessionService) {
  $scope.counter = 0;
  $scope.showingElements = [];
  $scope.submissions = [];
  if (!SessionService.getUser()) {
    $state.go('admin');
  }
  $scope.logout = function() {
    $http.get('/api/logout').then(function() {
      SessionService.deleteUser();
      window.location.href = '/admin';
    }).catch(function(err) {
      $scope.processing = false;
      $.Zebra_Dialog('Wrong Password');
    });
  }

  $scope.loadSubmissions = function() {
    $scope.processing = true;
    $http.get('/api/submissions/unaccepted')
      .then(function(res) {
        $scope.submissions = res.data;
        $scope.loadMore();
        return $http.get('/api/channels');
      })
      .then(function(res) {
        $scope.channels = res.data;
        $scope.processing = false;
      })
      .then(null, function(err) {
        $scope.processing = false;
        $.Zebra_Dialog('Error: Could not get channels.')
        console.log(err);
      });
  }

  $scope.loadMore = function() {
    var loadElements = [];
    for (let i = $scope.counter; i < $scope.counter + 15; i++) {
      var sub = $scope.submissions[i];
      if (sub) {
        $scope.showingElements.push(sub);
        loadElements.push(sub);
      }
    }
    setTimeout(function() {
      console.log(loadElements);
      loadElements.forEach(function(sub) {
        SC.oEmbed(sub.trackURL, {
          element: document.getElementById(sub.trackID + "player"),
          auto_play: false,
          maxheight: 150
        });
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
    console.log(submi);
    if (submi.channelIDS.length == 0) {
      $scope.decline(submi);
    } else {
      submi.password = $rootScope.password;
      $scope.processing = true;
      $http.put("/api/submissions/save", submi)
        .then(function(sub) {
          $scope.showingElements.splice($scope.showingElements.indexOf(submi), 1);
          $.Zebra_Dialog("Saved");
          $scope.processing = false;
        })
        .then(null, function(err) {
          $scope.processing = false;
          $.Zebra_Dialog("ERROR: did not Save")
        })
    }
  }

  $scope.ignore = function(submission) {
    $scope.processing = true;
    $http.delete('/api/submissions/ignore/' + submission._id + '/' + $rootScope.password)
      .then(function(res) {
        var index = $scope.showingElements.indexOf(submission);
        $scope.showingElements.splice(index, 1);
        $.Zebra_Dialog("Ignored");
        $scope.processing = false;
      })
      .then(null, function(err) {
        $scope.processing = false;
        $.Zebra_Dialog("ERROR: did not Ignore");
      });
  }

  $scope.decline = function(submission) {
    $scope.processing = true;
    $http.delete('/api/submissions/decline/' + submission._id + '/' + $rootScope.password)
      .then(function(res) {
        var index = $scope.showingElements.indexOf(submission);
        $scope.showingElements.splice(index, 1);
        $.Zebra_Dialog("Declined");
        $scope.processing = false
      })
      .then(null, function(err) {
        $scope.processing = false;
        $.Zebra_Dialog("ERROR: did not Decline");
      });
  }

  $scope.youtube = function(submission) {
    $scope.processing = true;
    $http.post('/api/submissions/youtubeInquiry', submission)
      .then(function(res) {
        $scope.processing = false;
        $.Zebra_Dialog('Sent to Zach');
      })
  }

  $scope.sendMore = function(submission) {
    $scope.processing = true;
    $http.post('/api/submissions/sendMoreInquiry', submission)
      .then(function(res) {
        $scope.processing = false;
        $.Zebra_Dialog('Sent Email');
      })
  }
});