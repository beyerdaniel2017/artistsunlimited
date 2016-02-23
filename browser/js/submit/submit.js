app.config(function($stateProvider) {
  $stateProvider.state('submitSong', {
    url: '/',
    templateUrl: 'js/submit/submit.html',
    controller: 'SubmitSongController'
  });
});

app.controller('SubmitSongController', function($rootScope, $state, $scope, $http, CLIENT_ID) {

  $scope.urlChange = function() {
    var getPath = 'http://api.soundcloud.com/resolve.json?url=' + $scope.url + '&client_id=' + CLIENT_ID;
    $http.get(getPath)
      .then(function(res) {
        console.log(res.data);
        $scope.track = res.data;
        $scope.track.uri
        SC.oEmbed($scope.url, {
          element: document.getElementById('scPlayer'),
          auto_play: false,
          maxheight: 150
        });
        document.getElementById('scPlayer').style.visibility = "visible";
        $scope.notFound = false;
      }).then(null, function(err) {
        document.getElementById('scPlayer').style.visibility = "hidden";
        $scope.notFound = true;
      });
  }

  $scope.submit = function() {

    $http.post('/api/submissions', {
        email: $scope.email,
        trackID: $scope.track.id,
        name: $scope.name,
        channelIDS: [],
        invoiceIDS: []
      })
      .then(function(res) {
        window.alert("Your song has been submitted and will be reviewed soon.");
        location.reload();
      })
      .then(null, function(err) {
        window.alert("Error: " + err.message);
      });
  }
});