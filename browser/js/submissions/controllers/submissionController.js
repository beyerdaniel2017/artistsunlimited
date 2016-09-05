app.config(function($stateProvider) {
  $stateProvider.state('submissions', {
    url: '/admin/submissions',
    templateUrl: 'js/submissions/views/submissions.html',
    controller: 'SubmissionController'
  });
});

app.controller('SubmissionController', function($rootScope, $state, $scope, $http, $window, AuthService, SessionService) {
  $scope.counter = 0;
  $scope.showingElements = [];
  $scope.submissions = [];
  $scope.selectedGroups = [];
  $scope.selectedChannelIDS = [];
  $scope.selectedGroupChannelIDS = [];
  $scope.selectedChannelName = [];
  $scope.genre = "";
  $scope.displayType = 'channel';
  $scope.skip = 0;
  $scope.limit = 10;
  $scope.isLoggedIn = SessionService.getUser() ? true : false;
  if (!SessionService.getUser()) {
    $state.go('admin');
  }
  $scope.user=SessionService.getUser();
  $scope.uniqueGroup = [];
  for (var i = 0; i < $scope.user.paidRepost.length; i++) {
    $scope.user.paidRepost[i].groups.forEach(function(acc) {
      if (acc != "" && $scope.uniqueGroup.indexOf(acc) === -1) {
        $scope.uniqueGroup.push(acc);
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
    var genre=$scope.genre.replace(/[0-9]/g, '');
    var selectedGenre= genre.replace('(','').replace(')','').trim();
    $scope.processing = true;
    $http.get('/api/submissions/unaccepted?genre='+encodeURIComponent(selectedGenre)+"&skip="+$scope.skip+"&limit="+$scope.limit)
      .then(function(res) {
      $scope.processing = false;
      if (res.data.length > 0) {
        angular.forEach(res.data, function(d) {
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
    var index = $scope.selectedChannelIDS.indexOf(chan.id);
    if (index == -1) {
      $scope.selectedChannelIDS.push(chan.id);
      $scope.selectedChannelName.push(chan.username);
    } else {
      $scope.selectedChannelIDS.splice(index, 1);
      $scope.selectedChannelName.splice(index, 1);
    }
  }

  $scope.changeBoxGroup = function(sub, group) {
    var ind = $scope.selectedGroups.indexOf(group);
    if(sub[group]){
      if (ind == -1) {
        $scope.selectedGroups.push(group);
      }
    }
    else{
      $scope.selectedGroups.splice(ind, 1);
    }
    $scope.selectedGroupChannelIDS = [];
    $scope.selectedGroups.forEach(function(g){
    $scope.user.paidRepost.forEach(function(acc){
        if(acc.groups.indexOf(g) != -1){
          if($scope.selectedGroupChannelIDS.indexOf(acc.id) == -1){
            $scope.selectedGroupChannelIDS.push(acc.id);
        }      
      }
    });    
    });
  }

  $scope.save = function(submi) {
    $scope.selectedChannelIDS.forEach(function(cid){
      if($scope.selectedGroupChannelIDS.indexOf(cid) == -1){
        $scope.selectedGroupChannelIDS.push(cid);
      }
    });
    submi.channelIDS = $scope.selectedGroupChannelIDS;
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

  $scope.openEmailClient = function(sub, item){
    var toEmail = (item.toEmail == '{email}' ? sub.email : item.toEmail);
    var subject = (item.subject != undefined ? item.subject : "");
    if(subject != ""){
      subject = subject.replace('{title}', sub.title);
      subject = subject.replace('{name}', sub.name);
      subject = subject.replace('{url}', sub.trackURL);
    }    
    var body = (item.emailBody != undefined ? item.emailBody : "");
    if(body != ""){
      body = body.replace('{name}', sub.name);
      body = body.replace('{email}', sub.email);
      body = body.replace('{title}', sub.title);
      body = body.replace('{url}', sub.trackURL);
    }
    var link = "mailto:"+ toEmail
      + "?subject=" + escape(subject)
      + "&body=" + escape(body); 
    $window.location.href = link;
  }

  $scope.getSubmissionByGenre = function() {
    $http.get('/api/submissions/getGroupedSubmissions').then(function(res) {
      var unacceptedSubmission = res.data;
      for(var i=0; i< $scope.genreArray.length; i++){
        for(var j=0; j<unacceptedSubmission.length; j++){
          if($scope.genreArray[i] == unacceptedSubmission[j]._id){
            $scope.genreArray[i] = $scope.genreArray[i] +' ('+ unacceptedSubmission[j].total_count + ')';
          }
        }
      }
    });
  }
  $scope.getSubmissionByGenre();
  $scope.loadSubmissions();
});