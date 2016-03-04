app.config(function($stateProvider) {
  $stateProvider.state('submitSong', {
    url: '/',
    templateUrl: 'js/submit/submit.html',
    controller: 'SubmitSongController'
  });
});

app.controller('SubmitSongController', function($rootScope, $state, $scope, $http) {

  $scope.urlChange = function() {
    $http.post('/api/soundcloud/soundcloudTrack', {
        url: $scope.url
      })
      .then(function(res) {
        $scope.trackID = res.data.trackID;
        SC.oEmbed($scope.url, {
          element: document.getElementById('scPlayer'),
          auto_play: false,
          maxheight: 150
        })
        document.getElementById('scPlayer').style.visibility = "visible";
        $scope.notFound = false;
      }).then(null, function(err) {
        $scope.notFound = true;
        $scope.processing = false;
        document.getElementById('scPlayer').style.visibility = "hidden";
      });

  }

  $scope.submit = function() {
    $scope.processing = true;
    $http.post('/api/submissions', {
        email: $scope.email,
        trackID: $scope.trackID,
        name: $scope.name,
        channelIDS: [],
        invoiceIDS: []
      })
      .then(function(res) {
        console.log(res.data);
        $scope.processing = false;
        window.alert("Your song has been submitted and will be reviewed soon.");
        location.reload();
      })
      .then(null, function(err) {
        $scope.processing = false;
        window.alert("Error: Could not submit song.");
      });
  }
});