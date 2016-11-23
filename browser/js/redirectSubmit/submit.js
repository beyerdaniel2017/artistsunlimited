app.config(function($stateProvider) {
  $stateProvider.state('submitSong', {
    url: '/submit',
    templateUrl: 'js/accountSubmit/accountsubmit.view.html',
    controller: 'redirectController'
  });
  $stateProvider.state('customsubmits', {
    url: '/custom/:username/:submitpart',
    templateUrl: 'js/accountSubmit/accountsubmit.view.html',
    controller: 'SubmitSongController',
    resolve: {
      getUserByURL: function($stateParams, $http, $window) {
        var username = $stateParams.username;
        var submitpart = $stateParams.submitpart;
        if (submitpart.indexOf('submit') != -1) {
          $window.location.href = '/' + username + '/submit';
        } else {
          $window.location.href = '/' + username + '/premiere';
        }
        return new Promise(function(fulfill, reject) {});
      }
    }
  });
});
app.controller('redirectController', function() {
  window.location.href = '/EtiquetteNoir/submit'
})

app.controller('SubmitSongController', function($rootScope, $state, $scope, $http, $location) {
  $scope.submission = {};
  $scope.userID = $location.search().id;
  $scope.searchString = "";


  $scope.choseTrack = function(track) {
    $scope.submission.trackID = track.id;
    $scope.submission.title = track.title;
    $scope.submission.trackURL = track.permalink_url;
    console.log($scope.submission);
    var widget = SC.Widget('scPlayer');
    widget.load(track.permalink_url, {
      auto_play: false,
      show_artwork: true,
      callback: function() {
        console.log($scope.submission);
        if ($scope.submission.title == "--unknown--") {
          widget.getCurrentSound(function(track) {
            console.log(track);
            $scope.submission.trackID = track.id;
            $scope.submission.title = track.title;
            $scope.submission.trackURL = track.permalink_url
          })
        }
      }
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