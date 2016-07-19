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
  $scope.genre = "";
  $scope.skip = 0;
  $scope.limit = 10;
  if (!SessionService.getUser()) {
    $state.go('admin');
  }
  $scope.user=SessionService.getUser();
  $scope.uniqueGroup = [];
  if($scope.user.paidRepost.length > 0){
    $scope.user.paidRepost.forEach(function(acc){
      if(acc.group != "" && $scope.uniqueGroup.indexOf(acc.group) === -1){
        $scope.uniqueGroup.push(acc.group);        
      } 
    });
  }

  $scope.genreArray = [
    'Alternative Rock',
    'Ambient',
    'Creative',
    'Chill',
    'Classical',
    'Country',
    'Dance & EDM',
    'Dancehall',
    'Deep House',
    'Disco',
    'Drum & Bass',
    'Dubstep',
    'Electronic',
    'Festival',
    'Folk',
    'Hip-Hop/RNB',
    'House',
    'Indie/Alternative',
    'Latin',
    'Trap',
    'Vocalists/Singer-Songwriter'
  ];

  $scope.getSubmissionsByGenre = function(){
    $scope.showingElements = [];
    $scope.skip = 0;
    $scope.loadSubmissions();
  }

  $scope.loadSubmissions = function() {
    $scope.processing = true;
    $http.get('/api/submissions/unaccepted?genre='+encodeURIComponent($scope.genre)+"&skip="+$scope.skip+"&limit="+$scope.limit)
      .then(function(res) {
      $scope.processing = false;
      if (res.data.length > 0) {
        angular.forEach(res.data, function(d) {
          d.displayType = 'channel';
          $scope.showingElements.push(d);
      });
  }
    setTimeout(function() {
        $scope.showingElements.forEach(function(sub) {
        SC.oEmbed(sub.trackURL, {
          element: document.getElementById(sub.trackID + "player"),
          auto_play: false,
          maxheight: 150
        });
      }, 50)
    });
    })
    .then(null, function(err) {
      $scope.processing = false;
      $.Zebra_Dialog('Error: Could not get channels.')
      console.log(err);
    });
  }

  $scope.loadMore = function() {
    $scope.skip += 10;
    $scope.loadSubmissions();
    // var loadElements = [];
    // for (let i = $scope.counter; i < $scope.counter + 15; i++) {
    //   var sub = $scope.submissions[i];
    //   if (sub) {
    //     $scope.showingElements.push(sub);
    //     loadElements.push(sub);
    //   }
    // }
    // setTimeout(function() {
    //   loadElements.forEach(function(sub) {
    //     SC.oEmbed(sub.trackURL, {
    //       element: document.getElementById(sub.trackID + "player"),
    //       auto_play: false,
    //       maxheight: 150
    //     });
    //   }, 50)
    // });
    // $scope.counter += 15;
  }

  $scope.changeBox = function(sub, chan) {
    var index = sub.channelIDS.indexOf(chan.id);
    if (index == -1) {
      sub.channelIDS.push(chan.id);
    } else {
      sub.channelIDS.splice(index, 1);
    }
  }

  $scope.changeBoxGroup = function(sub, group) {
    $scope.user.paidRepost.forEach(function(acc){
      if(acc.group != "" && acc.group == group){
        var index = sub.channelIDS.indexOf(acc.id);
        if (index == -1) {
          sub.channelIDS.push(acc.id);
        } else {
          sub.channelIDS.splice(index, 1);
        }      
      }
    });    
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