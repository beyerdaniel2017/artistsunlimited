app.config(function($stateProvider) {
  $stateProvider.state('downloadGate', {
    url: '/admin/downloadGate',
    templateUrl: 'js/downloadTrack/views/adminDLGate.html',
    controller: 'AdminDLGateController'
  });
});

app.controller('AdminDLGateController', function($http, $rootScope, $scope, AppConfig) {

  var appConfig = AppConfig.getConfig();

  $scope.artists = [{
    "id": 86560544,
    "username": "La Tropical",
    "url": "https://soundcloud.com/latropical"
  }, {
    "id": 206926900,
    "username": "Red Tag",
    "url": "https://soundcloud.com/red-tag"
  }, {
    "id": 64684860,
    "username": "Etiquette Noir",
    "url": "https://soundcloud.com/etiquettenoir"
  }, {
    "id": 164339022,
    "username": "Le Sol",
    "url": "https://soundcloud.com/lesolmusique"
  }, {
    "id": 203522426,
    "username": "Classy Records",
    "url": "https://soundcloud.com/onlyclassy"
  }, {
    "id": 56395358,
    "url": "https://soundcloud.com/deeperbeat",
    "username": "DeeperBeet",
  }];
  $scope.playlists = [];
  $scope.addArtist = function() {
    $scope.artists.push({});
  }
  $scope.removeArtist = function(a) {
    $scope.artists.splice($scope.artists.indexOf(a), 1);
  }
  $scope.artistURLChange = function(a) {
    var artist = $scope.artists[$scope.artists.indexOf(a)];
    $scope.processing = true;
    $http.post('/api/soundcloud/resolve', {
        url: artist.url
      })
      .then(function(res) {
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
  $scope.removePlaylist = function(p) {
    $scope.playlists.splice($scope.playlists.indexOf(p), 1);
  }
  $scope.playlistURLChange = function(p) {
    var playlist = $scope.playlists[$scope.playlists.indexOf(p)];
    $scope.processing = true;
    $http.post('/api/soundcloud/resolve', {
        url: playlist.url
      })
      .then(function(res) {
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
          SC.initialize({
            client_id: appConfig.clientID,
            redirect_uri: appConfig.callbackURL
          });
          return SC.get('/users/' + $scope.track.artistID + '/web-profiles');
        })
        .then(function(profiles) {
          profiles.forEach(function(prof) {
            if (['twitter', 'youtube', 'facebook', 'spotify', 'soundcloud', 'instagram'].indexOf(prof.service) != -1) $scope.track.SMLinks[prof.service] = prof.url;
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