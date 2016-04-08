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
      abstract: true,
      url: '',
      template: '<div ui-view="gateway"></div>',
      controller: 'ArtistToolsController'
    })
    .state('artistTools.downloadGateway.list', {
      url: '/download-gateway',
      views: {
        'gateway': {
          templateUrl: 'js/home/views/artistTools/downloadGateway.list.html',
          controller: 'ArtistToolsController'
        } 
      }
    })
    .state('artistTools.downloadGateway.edit', {
      url: '/download-gateway/edit/:gatewayID',
      views: {
        'gateway': {
          templateUrl: 'js/home/views/artistTools/downloadGateway.html',
          controller: 'ArtistToolsController'
        } 
      }
    })
    .state('artistTools.downloadGateway.new', {
      url: '/download-gateway/new',
      views: {
        'gateway': {
          templateUrl: 'js/home/views/artistTools/downloadGateway.html',
          controller: 'ArtistToolsController'
        } 
      }
    });
    // .state('artistTools.downloadGatewayList', {
    //   url: '/download-gateway/list',
    //   templateUrl: 'js/home/views/artistTools/downloadGateway.list.html',
    //   controller: 'ArtistToolsController'
    // })
    // .state('artistTools.downloadGatewayEdit', {
    //   url: '/download-gateway/edit/:gatewayID',
    //   templateUrl: 'js/home/views/artistTools/downloadGateway.html',
    //   controller: 'ArtistToolsController'
    // })
});

app.controller('ArtistToolsController', ['$rootScope',
  '$state',
  '$stateParams',
  '$scope',
  '$http',
  '$location',
  '$window',
  '$uibModal',
  '$timeout',
  'SessionService',
  'ArtistToolsService',
  function($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, SessionService, ArtistToolsService) {
  
    /* Init boolean variables for show/hide and other functionalities */

    $scope.processing = false;
    $scope.isTrackAvailable = false;
    $scope.message = {
      val: '',
      visible: false
    };

    /* Init Download Gateway form data */

    $scope.track = {
      artistUsername: 'La Tropicál',
      trackTitle: 'Panteone / Travel',
      trackArtworkURL: 'assets/images/who-we-are.png',
      SMLinks: [],
      permanentLinks: [{
        url: '',
      }],
      like: false,
      comment: false,
      repost: false,
      artists: [{
        url: '',
        avatar: 'assets/images/who-we-are.png',
        username: '',
        id: -1
      }]
    };
    $scope.profile = {};
    
    /* Init downloadGateway list */

    $scope.downloadGatewayList = [];

    /* Init modal instance variables and methods */

    $scope.modalInstance = {};
    $scope.modal = {};
    $scope.openModal = {
      downloadURL: function(downloadURL) {
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

    $scope.editProfileModalInstance = {};
    $scope.editProfilemodal = {};
    $scope.openEditProfileModal = {
      editProfile: function(field) {
        $scope.profile.field = field;
        $timeout(function() {  
          $scope.editProfileModalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'editProfile.html',
            controller: 'ArtistToolsController',
            scope: $scope
          });
        }, 0);
      }
    };
    $scope.closeEditProfileModal = function() {
      $scope.showProfileInfo();
      $scope.editProfileModalInstance.close();
    }

    /* Init profile */
    $scope.profile = {};

    /* Method for resetting Download Gateway form */

    function resetDownloadGateway() {
      $scope.processing = false;
      $scope.isTrackAvailable = false;
      $scope.message = {
        val: '',
        visible: false
      };

      $scope.track = {
        artistUsername: 'La Tropicál',
        trackTitle: 'Panteone / Travel',
        trackArtworkURL: 'assets/images/who-we-are.png',
        SMLinks: [],
        permanentLinks: [{
          url: '',
        }],
        like: false,
        comment: false,
        repost: false,
        artists: [{
          url: '',
          avatar: 'assets/images/who-we-are.png',
          username: '',
          id: -1
        }]
      };
      // $scope.playlists = [{
      //   url: ''
      // }];
      // $scope.artists = [{
      //   url: '',
      //   avatar: 'assets/images/who-we-are.png',
      //   username: '',
      //   id: -1
      // }];
      // $scope.SMLinks = [];
      angular.element("input[type='file']").val(null);
    }

    /* Check if stateParams has gatewayID to initiate edit */
    $scope.checkIfEdit = function() {
      if($stateParams.gatewayID) {
        $scope.getDownloadGateway($stateParams.gatewayID);
        // if(!$stateParams.downloadGateway) {
        //   $scope.getDownloadGateway($stateParams.gatewayID);
        // } else {
        //   $scope.track = $stateParams.downloadGateway;
        // }
      }
    }

    $scope.trackURLChange = function() {
      if ($scope.track.trackURL !== '') {
        $scope.isTrackAvailable = false;
        $scope.processing = true;
        ArtistToolsService
          .resolveData({
            url: $scope.track.trackURL
          })
          .then(handleTrackDataAndGetProfiles)
          .then(handleWebProfiles)
          .catch(handleError);

          function handleTrackDataAndGetProfiles(res) {
            $scope.track.trackTitle = res.data.title;
            $scope.track.trackID = res.data.id;
            $scope.track.artistID = res.data.user.id;
            $scope.track.trackArtworkURL = res.data.artwork_url ? res.data.artwork_url.replace('large.jpg', 't500x500.jpg') : '';
            $scope.track.artistArtworkURL = res.data.user.avatar_url ? res.data.user.avatar_url : '';
            $scope.track.artistURL = res.data.user.permalink_url;
            $scope.track.artistUsername = res.data.user.username;
            $scope.track.SMLinks = [];
            return SC.get('/users/' + $scope.track.artistID + '/web-profiles');
          }

          function handleWebProfiles(profiles) {
            profiles.forEach(function(prof) {
              if (['twitter', 'youtube', 'facebook', 'spotify', 'soundcloud', 'instagram'].indexOf(prof.service) != -1) {
                $scope.track.SMLinks.push({
                  key: prof.service,
                  value: prof.url
                });
              }
            });
            $scope.isTrackAvailable = true;
            $scope.processing = false;
          }

          function handleError(err) {
            $scope.track.trackID = null;
            alert('Song not found or forbidden');
            $scope.processing = false;
          }
      }
    };

    $scope.artistURLChange = function(index) {
      var artist = {};
      $scope.processing = true;
      ArtistToolsService
        .resolveData({
          url: $scope.track.artists[index].url
        })
        .then(function(res) {
          $scope.track.artists[index].avatar = res.data.avatar_url;
          $scope.track.artists[index].username = res.data.username;
          $scope.track.artists[index].id = res.data.id;
          $scope.processing = false;
        })
        .catch(function(err) {
          alert('Artists not found');
          $scope.processing = false;
        });
    };

    $scope.removeArtist = function(index) {
      $scope.track.artists.splice(index, 1);
    }

    $scope.addArtist = function() {
      if($scope.track.artists.length > 2) {
        return false;
      }

      $scope.track.artists.push({
        url: '',
        avatar: 'assets/images/who-we-are.png',
        username: '',
        id: -1
      });
    }

    $scope.addSMLink = function() {
      // externalSMLinks++;
      // $scope.track.SMLinks['key' + externalSMLinks] = '';
      $scope.track.SMLinks.push({
        key: '',
        value: ''
      });
    };
    $scope.removeSMLink = function(index) {
      $scope.track.SMLinks.splice(index, 1);
    };
    $scope.SMLinkChange = function(index) {

      function getLocation(href) {
        var location = document.createElement("a");
        location.href = href;
        if (location.host == "") {
          location.href = location.href;
        }
        return location;
      }

      var location = getLocation($scope.track.SMLinks[index].value);
      var host = location.hostname.split('.')[0];
      var findLink = $scope.track.SMLinks.filter(function(item){
        return item.key === host;
      });
      if(findLink.length > 0) {
        return false;
      }
      $scope.track.SMLinks[index].key = host;
    };

    $scope.removePermanentLink = function(index) {
      $scope.track.permanentLinks.splice(index, 1);
    };

    $scope.addPermanentLink = function() {
      if($scope.track.permanentLinks.length > 2) {
        return false;
      }

      $scope.track.permanentLinks.push({
        url: ''
      });
    }

    // $scope.playlistURLChange = function(p) {
    //   var playlist = {};
    //   $scope.processing = true;
    //   $http.post('/api/soundcloud/resolve', {
    //       url: $scope.playlist.url
    //     })
    //     .then(function(res) {
    //       playlist.avatar = res.data.artwork_url;
    //       playlist.title = res.data.title;
    //       playlist.id = res.data.id;
    //       $scope.artists.push(playlist);
    //       $scope.processing = false;
    //     })
    //     .then(null, function(err) {
    //       alert('Playlist not found');
    //       $scope.processing = false;
    //     });
    // };

    $scope.saveDownloadGate = function() {
      if (!$scope.track.trackID) {
        alert('Track Not Found');
        return false;
      }
      $scope.processing = true;
      var sendObj = new FormData();

      /* Append data to sendObj start */

      /* Track */
      for (var prop in $scope.track) {
        sendObj.append(prop, $scope.track[prop]);
      }

      /* artistIDs */

      var artists = $scope.track.artists.filter(function(item) {
        return item.id !== -1;
      }).map(function(item){
        delete item['$$hashKey'];
        return item;
      })
      sendObj.append('artists', JSON.stringify(artists));
      
      /* permanentLinks */

      var permanentLinks = $scope.track.permanentLinks.filter(function(item) {
        return item.url !== '';
      }).map(function(item){
        return item.url;
      });
      sendObj.append('permanentLinks', JSON.stringify(permanentLinks));

      /* SMLinks */

      var SMLinks = {};
      $scope.track.SMLinks.forEach(function(item) {
        SMLinks[item.key] = item.value;
      });
      sendObj.append('SMLinks', JSON.stringify(SMLinks));

       /* Check for playlists in case of edit */

      if($scope.track.playlists) {
        sendObj.append('playlists', JSON.stringify($scope.track.playlists));
      }

      /* Append data to sendObj end */

       var options = { 
        method: 'POST',
        url: '/api/database/downloadurl',
        headers: {'Content-Type': undefined },
        transformRequest: angular.identity,
        data: sendObj
      };
      $http(options)
        .then(function(res) {
          $scope.processing = false;
          if($scope.track._id) {
            return;
          }
          resetDownloadGateway();
          $scope.openModal.downloadURL(res.data);
        })
        .then(null, function(err) {
          $scope.processing = false;
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
      $scope.profile.password = '';
      if($scope.profile.soundcloud) {
        $scope.profile.loginAgent = 'soundcloud';
      } else {
        $scope.profile.loginAgent = 'local';
      }
    }

    $scope.saveProfileInfo = function() {
      var sendObj = {
        name: '',
        password: ''
      }
      if ($scope.profile.field === 'name') {
        sendObj.name = $scope.profile.name;
      } else if ($scope.profile.field === 'password') {
        sendObj.password = $scope.profile.password;
      }

      ArtistToolsService
        .saveProfileInfo(sendObj)
        .then(function(res){
          SessionService.create(res.data);
          $scope.closeEditProfileModal();
        })
        .catch(function(res) {

        });
    }

    $scope.getDownloadList = function() {
      ArtistToolsService
        .getDownloadList()
        .then(handleResponse)
        .catch(handleError);

        function handleResponse(res) {
          $scope.downloadGatewayList = res.data;
        }

        function handleError(res) {

        }
    }

    /* Method for getting DownloadGateway in case of edit */

    $scope.getDownloadGateway = function(downloadGateWayID) {
      // resetDownloadGateway();
      $scope.processing = true;
      ArtistToolsService
        .getDownloadGateway({
          id: downloadGateWayID
        })
        .then(handleResponse)
        .catch(handleError);

        function handleResponse(res) {
          
          $scope.isTrackAvailable = true;
          $scope.track = res.data;

          var SMLinks = res.data.SMLinks ? res.data.SMLinks : {};
          var permanentLinks = res.data.permanentLinks ? res.data.permanentLinks : [''];
          var SMLinksArray = [];
          var permanentLinksArray = [];

          for(var link in SMLinks) {
            SMLinksArray.push({
              key: link,
              value: SMLinks[link]
            });
          }
          permanentLinks.forEach(function(item){
            permanentLinksArray.push({
              url: item
            })
          });
          $scope.track.SMLinks = SMLinksArray;
          $scope.track.permanentLinks = permanentLinksArray;
          $scope.track.playlistIDS = [];  

          $scope.processing = false;
        }

        function handleError(res) {
          $scope.processing = false;
        }
    }
  }
]);