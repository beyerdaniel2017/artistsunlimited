app.config(function($stateProvider) {
  $stateProvider.state('submitSong', {
    url: '/submit',
    templateUrl: 'js/submit/submit.view.html',
    controller: 'SubmitSongController'
  });
});

app.controller('SubmitSongController', function($rootScope, $state, $scope, $http) {

  $scope.submission = {};

  $scope.urlChange = function() {
    $scope.processing = true;
    $http.post('/api/soundcloud/resolve', {
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
        $scope.submission.trackID = null;
        $scope.notFound = true;
        $scope.processing = false;
        document.getElementById('scPlayer').style.visibility = "hidden";
      });
  }

  $scope.submit = function() {
    if (!$scope.submission.email || !$scope.submission.name) {
      $.Zebra_Dialog("Please fill in all fields")
    } else if (!$scope.submission.trackID) {
      $.Zebra_Dialog("Track Not Found");
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
          window.$.Zebra_Dialog("Your song has been submitted and will be reviewed soon.");
          location.reload();
        })
        .then(null, function(err) {
          $scope.processing = false;
          window.$.Zebra_Dialog("Error: Could not submit song.");
        });
    }
  }
});