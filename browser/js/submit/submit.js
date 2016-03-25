app.config(function($stateProvider) {
  $stateProvider.state('submitSong', {
    url: '/',
    templateUrl: 'js/submit/submit.html',
    controller: 'SubmitSongController'
  });
});

app.controller('SubmitSongController', function($rootScope, $state, $scope, $http) {

  $scope.submission = {};

  $scope.urlChange = function() {
    $scope.processing = true;
    $http.post('/api/soundcloud/soundcloudTrack', {
        url: $scope.url
      })
      .then(function(res) {
        $scope.submission.trackID = res.data.id;
        $scope.submission.title = res.data.title;
        $scope.submission.trackURL = res.data.trackURL;
        SC.oEmbed($scope.submission.trackURL, {
          element: document.getElementById('scPlayer'),
          auto_play: false,
          maxheight: 150
        })
        document.getElementById('scPlayer').style.visibility = "visible";
        $scope.processing = false;
        $scope.notFound = false;
      }).then(null, function(err) {
        $scope.notFound = true;
        $scope.processing = false;
        document.getElementById('scPlayer').style.visibility = "hidden";
      });
  }

  $scope.submit = function() {
    if (!$scope.trackID) {
      alert("Track Not Found");
    } else {
      $scope.processing = true;
      $http.post('/api/submissions', {
          email: $scope.submission.email,
          trackID: $scope.submission.trackID,
          name: $scope.submission.name,
          title: $scope.submission.title,
          trackURL: $scope.submission.trackURL,
          channelIDS: [],
          invoiceIDS: []
        })
        .then(function(res) {
          console.log(res.data);
          window.alert("Your song has been submitted and will be reviewed soon.");
          location.reload();
        })
        .then(null, function(err) {
          $scope.processing = false;
          window.alert("Error: Could not submit song.");
        });
    }
  }
});