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
    if ($scope.url != "") {
      $scope.processing = true;
      $http.post('/api/soundcloud/resolve', {
          url: $scope.url
        })
        .then(function(res) {
          if (res.data.kind != "track") throw (new Error(''));
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
          if (err.status != 403) {
            $.Zebra_Dialog("We are not allowed to access tracks by this artist with the Soundcloud API. We apologize for the inconvenience, and we are working with Soundcloud to resolve this issue.");
            $scope.notFound = true;
          } else {
            $scope.submission.trackURL = $scope.url;
            SC.oEmbed($scope.submission.trackURL, {
              element: document.getElementById('scPlayer'),
              auto_play: false,
              maxheight: 150
            })
          }
          $scope.submission.trackID = null;

          $scope.processing = false;
          document.getElementById('scPlayer').style.visibility = "hidden";
        });
    }
  }

  $scope.submit = function() {
    if (!$scope.submission.email || !$scope.submission.name) {
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
          invoiceIDS: []
        })
        .then(function(res) {
          $.Zebra_Dialog("Your song has been submitted and will be reviewed soon.");
          $scope.processing = false;
          $scope.notFound = false;
          $scope.submission = {};
          document.getElementById('scPlayer').style.visibility = "hidden";
          $scope.url = "";
        })
        .then(null, function(err) {
          $scope.processing = false;
          $.Zebra_Dialog("Error: Could not submit song.");
        });
    }
  }
});