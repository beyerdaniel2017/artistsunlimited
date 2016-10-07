app.config(function($stateProvider) {
  $stateProvider.state('submitSong', {
    url: '/submit',
    templateUrl: 'js/submit/submit.view.html',
    controller: 'SubmitSongController'
  });
  $stateProvider.state('customsubmits', {
    url: '/custom/:username/:submitpart',
    templateUrl: 'js/submit/submit.view.html',
    controller: 'SubmitSongController',
    resolve: {
      getUserByURL: function($stateParams, $http, $window) {
        var username = $stateParams.username;
        var submitpart = $stateParams.submitpart;
        if (submitpart.indexOf('submit') != -1) {
          $window.location.href = '/customsubmit/' + username + '/' + submitpart;
        } else {
          $window.location.href = '/custompremiere/' + username + '/' + submitpart;
        }
      }
    }
  });
});

app.controller('SubmitSongController', function($rootScope, $state, $scope, $http, $location) {
  $scope.submission = {};
  $scope.userID = $location.search().id;
  $scope.searchString = "";
  // $scope.genreArray = [
  //   'Alternative Rock',
  //   'Ambient',
  //   'Creative',
  //   'Chill',
  //   'Classical',
  //   'Country',
  //   'Dance & EDM',
  //   'Dancehall',
  //   'Deep House',
  //   'Disco',
  //   'Drum & Bass',
  //   'Dubstep',
  //   'Electronic',
  //   'Festival',
  //   'Folk',
  //   'Hip-Hop/RNB',
  //   'House',
  //   'Indie/Alternative',
  //   'Latin',
  //   'Trap',
  //   'Vocalists/Singer-Songwriter'
  // ];

  // $scope.choseTrack = function(track) {
  //   $scope.searchString = track.title;
  //   $scope.submission.trackID = track.id;
  //   $scope.submission.title = track.title;
  //   $scope.submission.trackURL = track.permalink_url;
  //   SC.oEmbed($scope.submission.trackURL, {
  //     element: document.getElementById('scPlayer'),
  //     auto_play: false,
  //     maxheight: 150
  //   })
  //   document.getElementById('scPlayer').style.visibility = "visible";
  // }

  $scope.choseTrack = function(track) {
    $scope.searchString = track.title;
    $scope.submission.trackID = track.id;
    $scope.submission.title = track.title;
    $scope.submission.trackURL = track.permalink_url;
    SC.Widget('scPlayer').load(track.permalink_url, {
      auto_play: false,
      show_artwork: true
    });
    document.getElementById('scPlayer').style.visibility = "visible";
  }

  $scope.submit = function() {
    if (!$scope.submission.email || !$scope.submission.name || !$scope.submission.trackID) {
      $.Zebra_Dialog("Please fill in all fields")
    } else {
      $scope.processing = true;
      $http.post('/api/submissions', {
          email: $scope.submission.email,
          trackID: $scope.submission.trackID,
          name: $scope.submission.name,
          title: $scope.submission.title,
          trackURL: $scope.submission.trackURL,
          channelIDS: [],
          invoiceIDS: [],
          userID: $scope.userID,
          genre: ''
        })
        .then(function(res) {
          $.Zebra_Dialog("Your song has been submitted and will be reviewed soon.");
          $scope.processing = false;
          $scope.notFound = false;
          $scope.submission = {};
          $scope.searchString = "";
          document.getElementById('scPlayer').style.visibility = "hidden";
          document.getElementById('scPlayerCustom').style.visibility = "hidden";
          $scope.url = "";
        })
        .then(null, function(err) {
          $scope.processing = false;
          $.Zebra_Dialog("Error: Could not submit song.");
        });
    }
  }

  $scope.getUserID = function() {
    if ($scope.userID == undefined) {
      $http.get('/api/users/getUserID')
        .then(function(res) {
          $scope.userID = res.data;
        });
    }
  }

  $scope.getUserID();
});