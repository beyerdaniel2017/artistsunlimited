app.config(function($stateProvider) {
  $stateProvider.state('customsubmit', {
    url: '/customsubmit/:username/:submitpart',
    templateUrl: 'js/accountSubmit/accountsubmit.view.html',
    controller: 'AccountSubmitSongController',
    resolve: {
      userID : function($stateParams, $http, $window) {
        var username = $stateParams.username;
        var submitpart = $stateParams.submitpart;
        return $http.get('/api/users/getUserByURL/' + username + '/' + submitpart)
        .then(function(res) {
          return res.data;
        })
        .then(null, function(err) {
          $.Zebra_Dialog("error getting your events");
          return;
        })
      },
      customizeSettings: function($http, customizeService, userID) {
        return customizeService.getCustomPageSettings(userID, 'submit')
        .then(function(response) {
          return response;
        })
        .then(null, function(err) {
          $.Zebra_Dialog("error getting your customize settings");
          return;
        })
      }
    }
  });
});

app.controller('AccountSubmitSongController', function($rootScope, $state, $scope, userID, customizeSettings, $http, customizeService, $location) {
  $scope.submission = {};
  $scope.customizeSettings = customizeSettings;
  $scope.searchString = "";
  $scope.showPlayer = false;
  $scope.choseTrack = function(track) {
    $scope.searchString = track.title;
    $scope.submission.trackID = track.id;
    $scope.submission.title = track.title;
    $scope.submission.trackURL = track.permalink_url;
    SC.Widget('scPlayerCustom').load($scope.submission.trackURL, {
      auto_play: false,
          show_artwork: true
        });
    $scope.showPlayer = true;
    document.getElementById('scPlayerCustom').style.visibility = "visible";
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
        userID: userID,
        genre: ''
      })
      .then(function(res) {
        $.Zebra_Dialog("Your song has been submitted and will be reviewed soon.");
        $scope.processing = false;
        $scope.notFound = false;
        $scope.submission = {};
        $scope.searchString = "";
        document.getElementById('scPlayerCustom').style.visibility = "hidden";
        $scope.url = "";
      })
      .then(null, function(err) {
        $scope.processing = false;
        $.Zebra_Dialog("Error: Could not submit song.");
      });
    }
  }
});