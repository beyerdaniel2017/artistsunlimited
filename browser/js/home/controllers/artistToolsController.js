 app.config(function($stateProvider) {
  $stateProvider
	 .state('artistTools', {
	    url: '/artist-tools',
	    templateUrl: 'js/home/views/artistTools/artistTools.html',
	    controller: 'ArtistToolsController',
      abstract: true,
      resolve : {
        allowed : function($q, $state, SessionService) {
          var deferred = $q.defer();
          var user = SessionService.getUser();
          if(user) {
            deferred.resolve();
          } else {
            deferred.reject();
            window.location.href = '/login';
          }
          
          return deferred.promise;
        }
      }
    })
	  .state('artistTools.profile', {
	    url: '/profile',
	    templateUrl: 'js/home/views/artistTools/profile.html',
	    controller: 'ArtistToolsController'
	  })
	  .state('artistTools.downloadGateway', {
	    url: '/download-gateway',
	    templateUrl: 'js/home/views/artistTools/downloadGateway.html',
	    controller: 'ArtistToolsController'
	  });
});

app.controller('ArtistToolsController', ['$rootScope',
  '$state',
  '$scope',
  '$http',
  '$location',
  '$window',
  '$uibModal',
  'SessionService',
  function($rootScope, $state, $scope, $http, $location, $window, $uibModal, SessionService) {
  	
    $scope.track = {};
    $scope.processing = false;
    $scope.artists = [];
    $scope.playlists = [];
    $scope.modalInstance = {};
    $scope.modal = {};
    $scope.profile = {};
    $scope.openModal = {
      downloadURL: function(downloadURL) {
        console.log(downloadURL);
        $scope.modal.downloadURL = downloadURL;
        $scope.modalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'downloadURL.html',
          controller: 'ArtistToolsController',
          scope: $scope
        });
      }
    };

    $scope.closeModal = function() {
      $scope.modalInstance.close();
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
    };

    $scope.artistURLChange = function() {
      var artist = {};
      $scope.processing = true;
      $http.post('/api/soundcloud/resolve', {
          url: $scope.artist.url
        })
        .then(function(res) {
          artist.avatar = res.data.avatar_url;
          artist.username = res.data.username;
          artist.id = res.data.id;
          $scope.artists.push(artist);
          $scope.processing = false;
        })
        .then(null, function(err) {
          alert('Artists not found');
          $scope.processing = false;
        });
    };

    $scope.playlistURLChange = function(p) {
      var playlist = {};
      $scope.processing = true;
      $http.post('/api/soundcloud/resolve', {
          url: $scope.playlist.url
        })
        .then(function(res) {
          playlist.avatar = res.data.artwork_url;
          playlist.title = res.data.title;
          playlist.id = res.data.id;
          $scope.artists.push(playlist);
          $scope.processing = false;
        })
        .then(null, function(err) {
          alert('Playlist not found');
          $scope.processing = false;
        });
    };

    $scope.saveDownloadGate = function() {
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
          $scope.playlists = [];
          $scope.artists = [];
          $scope.openModal.downloadURL(res.data);
          $scope.processing = false;
        })
        .then(null, function(err) {
          alert("ERROR: Error in saving url");
          $scope.processing = false;
        });
    };

    $scope.logout = function() {
      $http.post('/api/logout').then(function(){
        SessionService.deleteUser();
        $state.go('home');
      });
    };

    $scope.showProfileInfo = function() {
      $scope.profile = JSON.parse(SessionService.getUser());
    }

  }
]);