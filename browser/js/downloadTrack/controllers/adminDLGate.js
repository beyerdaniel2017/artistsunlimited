app.config(function($stateProvider) {
  $stateProvider.state('downloadGate', {
    url: '/admin/downloadGate',
    templateUrl: 'js/downloadTrack/views/adminDLGate.html',
    controller: 'AdminDLGateController'
  });
});

app.controller('AdminDLGateController', function($http, $rootScope, $scope) {

  $scope.artists = [];
  $scope.playlists = [];
  $scope.addArtist = function() {
    $scope.artists.push({});
  }
  $scope.artistURLChange = function(a) {
    var artist = $scope.artists[$scope.artists.indexOf(a)];
    console.log(artist);
    $scope.processing = true;
    $http.post('/api/soundcloud/resolve', {
        url: artist.url
      })
      .then(function(res) {
        console.log(res.data);
        artist.avatar = res.data.avatar_url;
        artist.username = res.data.username;
        artist.id = res.data.id;
        $scope.processing = false;
      })
      .then(null, function(err) {
        alert('Artists not found');
        $scope.processing = false;
      })
  }

  $scope.addPlaylist = function() {
    $scope.playlists.push({});
  }
  $scope.playlistURLChange = function(p) {
    var playlist = $scope.playlists[$scope.playlists.indexOf(p)];
    console.log(playlist);
    $scope.processing = true;
    $http.post('/api/soundcloud/resolve', {
        url: playlist.url
      })
      .then(function(res) {
        console.log(res.data);
        playlist.avatar = res.data.artwork_url;
        playlist.title = res.data.title;
        playlist.id = res.data.id;
        $scope.processing = false;
      })
      .then(null, function(err) {
        alert('Playlist not found');
        $scope.processing = false;
      })
  }

  $scope.trackURLChange = function() {
    if ($scope.track.trackURL !== '') {
      $scope.processing = true;
      $http.post('/api/soundcloud/resolve', {
          url: $scope.track.trackURL
        })
        .then(function(res) {
          $scope.track.trackTitle = res.data.title;
          $scope.track.trackID = res.data.id;
          $scope.track.artistID = res.data.user.id;
          $scope.track.trackArtworkURL = res.data.artwork_url.replace('large.jpg', 't500x500.jpg');
          $scope.track.artistArtworkURL = res.data.user.avatar_url;
          $scope.track.artistUsername = res.data.user.username;
          $scope.track.SMLinks = {};
          return $http.get('/api/soundcloud/soundcloudConfig')
        })
        .then(function(res) {
          SC.initialize({
            client_id: res.data.clientID,
            redirect_uri: res.data.callbackURL
          });
          return SC.get('/users/' + $scope.track.artistID + '/web-profiles');
        })
        .then(function(profiles) {
          profiles.forEach(function(prof) {
            $scope.track.SMLinks[prof.service] = prof.url;
          });
          $scope.processing = false;
        })
        .then(null, function(err) {
          $scope.track.trackID = null;
          alert('Song not found or forbidden');
          $scope.processing = false;
        });
    }
  }

  $scope.saveDownloadGate = function() {
    if (!$scope.track.email || !$scope.track.downloadURL) {
      alert('Please fill in all fields');
      return false;
    }
    if (!$scope.track.trackID) {
      alert('Track Not Found');
      return false;
    }
    $scope.processing = true;
    var sendObj = $scope.track;
    sendObj.artistIDS = [$scope.track.artistID];
    $scope.artists.forEach(function(a) {
      sendObj.artistIDS.push(a.id);
    });
    sendObj.playlistIDS = [];
    $scope.playlists.forEach(function(p) {
      sendObj.playlistIDS.push(p.id);
    });
    console.log(sendObj);
    $http.post('/api/database/downloadurl', sendObj)
      .then(function(res) {
        $scope.track = {
          trackURL: '',
          downloadURL: '',
          email: ''
        };
        alert("SUCCESS: Url saved successfully");
        $scope.processing = false;
        window.location.reload();
      })
      .then(null, function(err) {
        alert("ERROR: Error in saving url");
        $scope.processing = false;
      });
  }

});