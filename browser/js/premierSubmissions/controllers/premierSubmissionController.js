app.config(function($stateProvider) {
  $stateProvider.state('premiersubmissions', {
    url: '/admin/premiersubmissions',
    templateUrl: 'js/premierSubmissions/views/premierSubmissions.html',
    controller: 'PremierSubmissionController'
  });
});

app.controller('PremierSubmissionController', function($rootScope, $state, $scope, $http, AuthService, SessionService,$sce) {
  if (!SessionService.getUser()) {
    $state.go('admin');
  }
  $scope.counter = 0;
  $scope.channels = [];
  $scope.showingElements = [];
  $scope.submissions = [];
  $scope.genre = "";
  $scope.skip = 0;
  $scope.limit = 10;
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

  $scope.logout = function() {
    $http.get('/api/logout').then(function() {
      SessionService.deleteUser();
      window.location.href = '/admin';
    }).catch(function(err) {
      $scope.processing = false;
      $.Zebra_Dialog('Wrong Password');
    });
  }

  $scope.getSubmissionsByGenre = function(){
    $scope.showingElements = [];
    $scope.skip = 0;
    $scope.loadSubmissions();
  }

  $scope.loadSubmissions = function() {
    $scope.processing = true;
    $http.get('/api/premier/unaccepted?genre='+$scope.genre+"&skip="+$scope.skip+"&limit="+$scope.limit)
    .then(function(res) {
       $scope.processing = false;
      if (res.data.length > 0) {
        angular.forEach(res.data, function(d) {
          d.channelName = null;
          d.emailBody = "";
          $scope.showingElements.push(d);
        });
      }
    })
    .then(null, function(err) {
      $scope.processing = false;
      $.Zebra_Dialog('Error: No premier submissions found.')
      console.log(err);
    });
  }

  $scope.loadMore = function() {
    $scope.skip += 10;
    $scope.loadSubmissions();
    //var loadElements = [];
    // for (let i = $scope.counter; i < $scope.counter + 15; i++) {
    //   var sub = $scope.submissions[i];
    //   if (sub) {
    //     sub.channelName = null;
    //     sub.emailBody = "";
    //     $scope.showingElements.push(sub);
    //     loadElements.push(sub);
    //   }
    // }
    // $scope.counter += 15;
  }

  $scope.accept = function(submi) {
    $scope.processing = true;
    submi.status = "accepted";
    $http.put("/api/premier/accept", submi)
    .then(function(sub) {
      $scope.showingElements.splice($scope.showingElements.indexOf(submi), 1);
      $.Zebra_Dialog("Accepted");
      $scope.processing = false;
    })
    .then(null, function(err) {
      $scope.processing = false;
      $.Zebra_Dialog("ERROR: did not Save")
    })    
  }

  $scope.decline = function(submission) {
    $scope.processing = true;
    submission.status = "declined";
    $http.put('/api/premier/decline',submission)
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

  $scope.channelChange = function(submission){
    var channelName = submission.channelName.displayName;
    var emailBody = "";
    switch (channelName) {
      case 'The Plug':
        emailBody = "Hey "+ submission.name + ",%0D%0A%0D%0AThank you for submitting your track to us here at Artists Unlimited. We are very interested in your submission and we think that it could really fit one of our SoundCloud channels, "+ submission.channelName.displayName +", "+submission.channelName.url+" %0D%0A%0D%0AMy name is Luiz Kupfer and I help curate the channel. I just have a couple of questions regarding your submission to help make me understand the record a bit more:%0D%0A%0D%0A1. Is it 100 percent original? Is there any copyright infringement in this track? (vocals that you do not have permission to use, etc)%0D%0A2. Do you own all of the rights to the track? (i.e. are you currently in engaged in a publishing  or master right contract that we would need permission to release your music?)%0D%0A3. Are you interested solely on releasing the track on SoundCloud (for Free Download) or are you interested in having us take care of uploading the track to Spotify, iTunes and promote the track on all platforms, rather than just Sound Cloud.%0D%0A%0D%0AAll best and looking forward to hearing from you soon,%0D%0A%0D%0ALuiz Kupfer%0D%0AAU Network%0D%0Aluiz@peninsulamgmt.com";
        break;
      case 'Royal X':
        emailBody = "Hey "+ submission.name + ",%0D%0A%0D%0AThank you for submitting your track to us here at Artists Unlimited. We are very interested in your submission and we think that it could really fit one of our SoundCloud channels, "+ submission.channelName.displayName +", "+submission.channelName.url+" %0D%0A%0D%0AMy name is Rafael Rocha and I help curate the channel. I just have a couple of questions regarding your submission to help make me understand the record a bit more:%0D%0A%0D%0A1. Is it 100 percent original? Is there any copyright infringement in this track? (vocals that you do not have permission to use, etc)%0D%0A2. Do you own all of the rights to the track? (i.e. are you currently in engaged in a publishing  or master right contract that we would need permission to release your music?)%0D%0A3. Are you interested solely on releasing the track on SoundCloud (for Free Download) or are you interested in having us take care of uploading the track to Spotify, iTunes and promote the track on all platforms, rather than just Sound Cloud.%0D%0A%0D%0AAll best and looking forward to hearing from you soon,%0D%0A%0D%0ARafael Rocha%0D%0AAU Network%0D%0Aroyalxofficial@gmail.com";
        break;
      default:
        emailBody = "Hey "+ submission.name + ",%0D%0A%0D%0AThank you for submitting your track to us here at Artists Unlimited. We are very interested in your submission and we think that it could really fit one of our SoundCloud channels, "+ submission.channelName.displayName +", "+submission.channelName.url+" %0D%0A%0D%0AMy name is Edward Sanchez and I help curate the channel. I just have a couple of questions regarding your submission to help make me understand the record a bit more:%0D%0A%0D%0A1. Is it 100 percent original? Is there any copyright infringement in this track? (vocals that you do not have permission to use, etc)%0D%0A2. Do you own all of the rights to the track? (i.e. are you currently in engaged in a publishing  or master right contract that we would need permission to release your music?)%0D%0A3. Are you interested solely on releasing the track on SoundCloud (for Free Download) or are you interested in having us take care of uploading the track to Spotify, iTunes and promote the track on all platforms, rather than just Sound Cloud.%0D%0A%0D%0AAll best and looking forward to hearing from you soon,%0D%0A%0D%0AEdward Sanchez%0D%0AAU Network%0D%0Aedward@peninsulamgmt.com";
        break;
    }
    submission.emailBody = emailBody;
  }

  $scope.delete = function(submission) {
    $.Zebra_Dialog('Are you sure you really want to delete ?', {
      'buttons': [{
        caption: 'Yes',
        callback: function() {
          $scope.processing = true;
          $http.post("/api/premier/delete", {id : submission._id})
          .then(function(sub) {
            $scope.showingElements.splice($scope.showingElements.indexOf(submission), 1);
            $scope.processing = false;
          })
          .then(null, function(err) {
            $scope.processing = false;
          });
        }
      },{ 
        caption: 'Cancel', 
        callback: function() {} 
      }]
    });
  }

  $scope.getChannels = function() {
    $http.get('/api/channels/')
    .then(function(res) {
      $scope.channels = res.data;
    })
    .then(null, function(err) {
      $scope.processing = false;
      $.Zebra_Dialog('Error: No channels found.')
    });
  }
});

app.filter('trusted', ['$sce', function ($sce) {
  return function(url) {
    return $sce.trustAsResourceUrl(url);
  };
}]);