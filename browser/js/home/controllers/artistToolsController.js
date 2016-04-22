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
      params: { 
        submission: null
      },
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
      params: { 
        submission: null 
      },
      views: {
        'gateway': {
          templateUrl: 'js/home/views/artistTools/downloadGateway.html',
          controller: 'ArtistToolsController'
        } 
      }
    })
    .state('artistTools.downloadGateway.preview', {
      url: '/download-gateway/preview',
      params: { 
        submission: null 
      },
      views: {
        'gateway': {
          templateUrl: 'js/home/views/artistTools/preview.html',
          controller: 'ArtistToolsPreviewController'
        } 
      }
    });
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
      artistUsername: '',
      trackTitle: '',
      trackArtworkURL: '',
      SMLinks: [],
      like: false,
      comment: false,
      repost: false,
      artists: [{
        url: '',
        avatar: '',
        username: '',
        id: -1,
        permanentLink: false
      }],
      showDownloadTracks: 'user'
    };
    $scope.profile = {};
    
    /* Init downloadGateway list */

    $scope.downloadGatewayList = [];

    /* Init track list and trackListObj*/
    $scope.trackList = [];
    $scope.trackListObj = null;

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
    };

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
      if($scope.editProfileModalInstance.close) {
        $scope.editProfileModalInstance.close();
      }
    };

    $scope.thankYouModalInstance = {};
    $scope.thankYouModal = {};
    $scope.openThankYouModal = {
      thankYou: function(submissionID) {
        $scope.thankYouModal.submissionID = submissionID;
        $scope.modalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'thankYou.html',
          controller: 'ArtistToolsController',
          scope: $scope
        });
      }
    };
    $scope.closeThankYouModal = function() {
      $scope.thankYouModalInstance.close();
    };

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
        artistUsername: '',
        trackTitle: '',
        trackArtworkURL: '',
        SMLinks: [],
        like: false,
        comment: false,
        repost: false,
        artists: [{
          url: '',
          avatar: '',
          username: '',
          id: -1,
          permanentLink: false
        }],
        showDownloadTracks: 'user'
      };
      angular.element("input[type='file']").val(null);
    }

    /* Check if stateParams has gatewayID to initiate edit */
    $scope.checkIfEdit = function() {
      if($stateParams.gatewayID) {
        $scope.getDownloadGateway($stateParams.gatewayID);
      }
    };

    $scope.checkIfSubmission = function() {
      if($stateParams.submission) {
        if($state.includes('artistTools.downloadGateway.new')) {
          $scope.track.trackURL = $rootScope.submission.trackURL;
          $scope.trackURLChange();
          return;
        }
        $scope.openThankYouModal.thankYou($stateParams.submission._id);
        $rootScope.submission = null;
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
            $scope.track.description = res.data.description;
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

    $scope.trackListChange = function(index) {

      /* Set booleans */

      $scope.isTrackAvailable = false;
      $scope.processing = true;

      /* Set track data */

      var track = $scope.trackListObj;
      $scope.track.trackURL = track.permalink_url;
      $scope.track.trackTitle = track.title;
      $scope.track.trackID = track.id;
      $scope.track.artistID = track.user.id;
      $scope.track.description = track.description;
      $scope.track.trackArtworkURL = track.artwork_url ? track.artwork_url.replace('large.jpg', 't500x500.jpg') : '';
      $scope.track.artistArtworkURL = track.user.avatar_url ? track.user.avatar_url : '';
      $scope.track.artistURL = track.user.permalink_url;
      $scope.track.artistUsername = track.user.username;
      $scope.track.SMLinks = [];

      SC.get('/users/' + $scope.track.artistID + '/web-profiles')
        .then(handleWebProfiles)
        .catch(handleError);

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
        $scope.$apply();
      }

      function handleError(err) {
        $scope.track.trackID = null;
        alert('Song not found or forbidden');
        $scope.processing = false;
        $scope.$apply();
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
          $scope.track.artists[index].avatar = res.data.avatar_url ? res.data.avatar_url : '';
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
    };

    $scope.addArtist = function() {
      if($scope.track.artists.length > 2) {
        return false;
      }

      $scope.track.artists.push({
        url: '',
        avatar: '',
        username: '',
        id: -1,
        permanentLink: false
      });
    };

    $scope.addSMLink = function() {
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

    $scope.saveDownloadGate = function() {
      if (!$scope.track.trackID) {
        alert('Track Not Found');
        return false;
      }
      // $scope.track.showDownloadTracks = ($scope.track.showDownloadTracks === true) ? 'user' : 'none';

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

      // var permanentLinks = $scope.track.permanentLinks.filter(function(item) {
      //   return item.url !== '';
      // }).map(function(item){
      //   return item.url;
      // });
      // sendObj.append('permanentLinks', JSON.stringify(permanentLinks));

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
          // $scope.track.showDownloadTracks = ($scope.track.showDownloadTracks === 'user') ? true : false;
          // $scope.trackListObj = null;
          $scope.processing = false;
          if($stateParams.submission) {
            $state.go('artistTools.downloadGateway.list', { 'submission' : $stateParams.submission });
            return;
          }
          $state.go('artistTools.downloadGateway.list');
          // if($scope.track._id) {
          //   return;
          // }
          // resetDownloadGateway();
          // $scope.openModal.downloadURL(res.data);
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
        $state.go('login');
      });
    };

    $scope.showProfileInfo = function() {
      $scope.profile.data = JSON.parse(SessionService.getUser());
      if(($scope.profile.data.permanentLinks && $scope.profile.data.permanentLinks.length === 0) || !$scope.profile.data.permanentLinks) {
        $scope.profile.data.permanentLinks = [{
          url: '',
          avatar: '',
          username: '',
          id: -1,
          permanentLink: true
        }];
      };
      $scope.profile.isAvailable = {};
      $scope.profile.isAvailable.email = $scope.profile.data.email ? true : false;
      $scope.profile.isAvailable.password = $scope.profile.data.password ? true : false;
      $scope.profile.isAvailable.soundcloud = $scope.profile.data.soundcloud ? true : false;
      $scope.profile.data.password = '';
    };

    $scope.saveProfileInfo = function() {

      $scope.message = {
        value: '',
        visible: false
      };

      var permanentLinks = $scope.profile.data.permanentLinks.filter(function(item) {
        return item.id !== -1;
      }).map(function(item){
        delete item['$$hashKey'];
        return item;
      });

      var sendObj = {
        name: '',
        password: '',
        permanentLinks: JSON.stringify(permanentLinks)
      }
      if ($scope.profile.field === 'name') {
        sendObj.name = $scope.profile.data.name;
      } else if ($scope.profile.field === 'password') {
        sendObj.password = $scope.profile.data.password;
      } else if ($scope.profile.field === 'email') {
        sendObj.email = $scope.profile.data.email;
      }

      ArtistToolsService
        .saveProfileInfo(sendObj)
        .then(function(res){
          if(res.data === 'Email Error') {
            $scope.message = {
              value: 'Email already exists!',
              visible: true
            };
            return;
          }
          SessionService.create(res.data);
          $scope.closeEditProfileModal();
        })
        .catch(function(res) {

        });
    };

    $scope.removePermanentLink = function(index) {
      $scope.profile.data.permanentLinks.splice(index, 1);
    };

    $scope.addPermanentLink = function() {
      if($scope.profile.data.permanentLinks.length > 2) {
        return false;
      }

      $scope.profile.data.permanentLinks.push({
        url: '',
        avatar: '',
        username: '',
        id: -1,
        permanentLink: true
      });
    };

    $scope.permanentLinkURLChange = function(index) {
      var permanentLink = {};
      $scope.processing = true;
      ArtistToolsService
        .resolveData({
          url: $scope.profile.data.permanentLinks[index].url
        })
        .then(function(res) {
          $scope.profile.data.permanentLinks[index].avatar = res.data.avatar_url ? res.data.avatar_url : '';
          $scope.profile.data.permanentLinks[index].username = res.data.permalink;
          $scope.profile.data.permanentLinks[index].id = res.data.id;
          $scope.processing = false;
        })
        .catch(function(err) {
          alert('Artists not found');
          $scope.processing = false;
        });
    };

    $scope.saveSoundCloudAccountInfo = function() {
      SC.connect()
        .then(saveInfo)
        .then(handleResponse)
        .catch(handleError);

        function saveInfo(res) {
          return ArtistToolsService.saveSoundCloudAccountInfo({
            token: res.oauth_token
          });
        }

        function handleResponse(res) {
          $scope.processing = false;
          if(res.status === 200 && (res.data.success === true)) {
            SessionService.create(res.data.data);
            $scope.profile.data = res.data.data;
            $scope.profile.isAvailable.soundcloud = true;
          } else {
            $scope.message = {
              value: 'You already have an account with this soundcloud username',
              visible: true
            };
          }
          $scope.$apply();
        }

        function handleError(err) {
          $scope.processing = false;
        }
    };

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
    };

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
          if(!$scope.track.showDownloadTracks) {
            $scope.track.showDownloadTracks = 'user';
          }
          $scope.track.SMLinks = SMLinksArray;
          $scope.track.permanentLinks = permanentLinksArray;
          $scope.track.playlistIDS = []; 
          // $scope.track.showDownloadTracks = ($scope.track.showDownloadTracks === 'user') ? true : false;

          $scope.processing = false;
        }

        function handleError(res) {
          $scope.processing = false;
        }
    };

    $scope.deleteDownloadGateway = function(index) {
      if(confirm("Do you really want to delete this track?")) {
        var downloadGateWayID = $scope.downloadGatewayList[index]._id;
        $scope.processing = true;
        ArtistToolsService
          .deleteDownloadGateway({
            id: downloadGateWayID
          })
          .then(handleResponse)
          .catch(handleError);

          function handleResponse(res) {
            $scope.processing = false;
            $scope.downloadGatewayList.splice(index, 1);
          }

          function handleError(res) {
            $scope.processing = false;
          }
      }
    };

    $scope.getTrackListFromSoundcloud = function() {
      var profile = JSON.parse(SessionService.getUser());
      if(profile.soundcloud) {
        $scope.processing = true;
        SC.get('/users/' + profile.soundcloud.id + '/tracks')
        .then(function(tracks) {
          $scope.trackList = tracks;
          $scope.processing = false;
          $scope.$apply();
        })
        .catch(function(response) {
          $scope.processing = false;
          $scope.$apply();
        });
      }
    }

    $scope.test = function(){
      console.log('hello');
      if($scope.track.trackFile == "*.mp3") {
        angular.element("input[ng-model='track.downloadURL']").val(null);
      }

    //   angular.forEach(
    // angular.element("input[type='file']"),
    // function(inputElem) {
    //   angular.element(inputElem).val(null);
    // });
      }


    // if($scope.track.trackFile == *.mp3) {
    //   $scope.track.downloadURL == '';
    // }
    
    $scope.$watch('track', function(newVal, oldVal)
    {
        if(newVal.trackTitle)
            window.localStorage.setItem('trackPreviewData',JSON.stringify(newVal));
    },true);
    
  }
]);