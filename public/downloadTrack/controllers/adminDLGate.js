app.config(function($stateProvider) {
  $stateProvider.state('downloadGate', {
    url: '/admin/downloadGate',
    templateUrl: 'js/downloadTrack/views/adminDLGate.html',
    controller: 'AdminDLGateController'
  });
});

app.config(function($stateProvider) {
  $stateProvider.state('downloadGateList', {
    url: '/admin/downloadGate/list',
    templateUrl: 'js/downloadTrack/views/adminDLGate.list.html',
    controller: 'AdminDLGateController'
  });
});

app.config(function($stateProvider) {
  $stateProvider.state('downloadGateEdit', {
    url: '/admin/downloadGate/edit/:gatewayID',
    templateUrl: 'js/downloadTrack/views/adminDLGate.html',
    controller: 'AdminDLGateController'
  });
});


app.controller('AdminDLGateController', ['$rootScope',
  '$state',
  '$stateParams',
  '$scope',
  '$http',
  '$location',
  '$window',
  '$uibModal',
  'SessionService',
  'AdminDLGateService',
  function($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, SessionService, AdminDLGateService) {
    if (!SessionService.getUser()) {
      $state.go('admin');
    }
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
      like: false,
      comment: false,
      repost: false,
      artists: [{
        url: '',
        avatar: 'assets/images/who-we-are.png',
        username: '',
        id: -1,
        permanentLink: false
      }],
      playlists: [{
        url: '',
        avatar: '',
        title: '',
        id: ''
      }]
    };

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
        like: false,
        comment: false,
        repost: false,
        artists: [{
          url: '',
          avatar: 'assets/images/who-we-are.png',
          username: '',
          id: -1,
          permanentLink: false
        }],
        playlists: [{
          url: '',
          avatar: '',
          title: '',
          id: ''
        }]
      };
      angular.element("input[type='file']").val(null);
    }

    /* Check if stateParams has gatewayID to initiate edit */
    $scope.checkIfEdit = function() {
      if ($stateParams.gatewayID) {
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
        AdminDLGateService
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
          $.Zebra_Dialog('Song not found or forbidden');
          $scope.processing = false;
        }
      }
    };

    $scope.artistURLChange = function(index) {
      var artist = {};
      $scope.processing = true;
      AdminDLGateService
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
          $.Zebra_Dialog('Artists not found');
          $scope.processing = false;
        });
    };

    $scope.addPlaylist = function() {
      $scope.track.playlists.push({
        url: '',
        avatar: '',
        title: '',
        id: ''
      });
    }
    $scope.removePlaylist = function(index) {
      $scope.track.playlists.splice(index, 1);
    }
    $scope.playlistURLChange = function(index) {
      $scope.processing = true;
      AdminDLGateService
        .resolveData({
          url: $scope.track.playlists[index].url
        })
        .then(function(res) {
          $scope.track.playlists[index].avatar = res.data.artwork_url;
          $scope.track.playlists[index].title = res.data.title;
          $scope.track.playlists[index].id = res.data.id;
          $scope.processing = false;
        })
        .then(null, function(err) {
          $.Zebra_Dialog('Playlist not found');
          $scope.processing = false;
        })
    }


    $scope.removeArtist = function(index) {
      $scope.track.artists.splice(index, 1);
    }

    $scope.addArtist = function() {
      if ($scope.track.artists.length > 2) {
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
      var findLink = $scope.track.SMLinks.filter(function(item) {
        return item.key === host;
      });
      if (findLink.length > 0) {
        return false;
      }
      $scope.track.SMLinks[index].key = host;
    };

    $scope.saveDownloadGate = function() {
      if (!$scope.track.trackID) {
        $.Zebra_Dialog('Track Not Found');
        return false;
      }
      $scope.processing = true;
      var sendObj = new FormData();

      /* Append data to sendObj start */

      /* Track */
      for (var prop in $scope.track) {
        sendObj.append(prop, $scope.track[prop]);
      }

      /* artists */

      var artists = $scope.track.artists.filter(function(item) {
        return item.id !== -1;
      }).map(function(item) {
        delete item['$$hashKey'];
        return item;
      });
      sendObj.append('artists', JSON.stringify(artists));

      /* playlists */

      var playlists = $scope.track.playlists.filter(function(item) {
        return item.id !== -1;
      }).map(function(item) {
        delete item['$$hashKey'];
        return item;
      });
      sendObj.append('playlists', JSON.stringify(playlists));

      /* SMLinks */

      var SMLinks = {};
      $scope.track.SMLinks.forEach(function(item) {
        SMLinks[item.key] = item.value;
      });
      sendObj.append('SMLinks', JSON.stringify(SMLinks));

      /* Append data to sendObj end */

      var options = {
        method: 'POST',
        url: '/api/database/downloadurl',
        headers: {
          'Content-Type': undefined
        },
        transformRequest: angular.identity,
        data: sendObj
      };
      $http(options)
        .then(function(res) {
          $scope.processing = false;
          if ($scope.track._id) {
            // $scope.openModal.downloadURL(res.data.trackURL);
            return;
          }
          resetDownloadGateway();
          $scope.openModal.downloadURL(res.data);
        })
        .then(null, function(err) {
          $scope.processing = false;
          $.Zebra_Dialog("ERROR: Error in saving url");
          $scope.processing = false;
        });
    };

    $scope.logout = function() {
      $http.post('/api/logout').then(function() {
        SessionService.deleteUser();
        $state.go('admin');
      });
    };

    $scope.showProfileInfo = function() {
      $scope.profile = SessionService.getUser();
    }

    $scope.getDownloadList = function() {
      AdminDLGateService
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
      AdminDLGateService
        .getDownloadGateway({
          id: downloadGateWayID
        })
        .then(handleResponse)
        .catch(handleError);

      function handleResponse(res) {

        $scope.isTrackAvailable = true;
        $scope.track = res.data;

        var SMLinks = res.data.SMLinks ? res.data.SMLinks : {};
        var SMLinksArray = [];

        for (var link in SMLinks) {
          SMLinksArray.push({
            key: link,
            value: SMLinks[link]
          });
        }
        $scope.track.SMLinks = SMLinksArray;
        $scope.processing = false;
      }

      function handleError(res) {
        $scope.processing = false;
      }
    };

    $scope.deleteDownloadGateway = function(index) {

      if (confirm("Do you really want to delete this track?")) {
        var downloadGateWayID = $scope.downloadGatewayList[index]._id;
        $scope.processing = true;
        AdminDLGateService
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
      } else {
        return false
      }
    };
  }

]);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkb3dubG9hZFRyYWNrL2NvbnRyb2xsZXJzL2FkbWluRExHYXRlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZG93bmxvYWRHYXRlJywge1xyXG4gICAgdXJsOiAnL2FkbWluL2Rvd25sb2FkR2F0ZScsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2Rvd25sb2FkVHJhY2svdmlld3MvYWRtaW5ETEdhdGUuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnQWRtaW5ETEdhdGVDb250cm9sbGVyJ1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZG93bmxvYWRHYXRlTGlzdCcsIHtcclxuICAgIHVybDogJy9hZG1pbi9kb3dubG9hZEdhdGUvbGlzdCcsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2Rvd25sb2FkVHJhY2svdmlld3MvYWRtaW5ETEdhdGUubGlzdC5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdBZG1pbkRMR2F0ZUNvbnRyb2xsZXInXHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkb3dubG9hZEdhdGVFZGl0Jywge1xyXG4gICAgdXJsOiAnL2FkbWluL2Rvd25sb2FkR2F0ZS9lZGl0LzpnYXRld2F5SUQnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9kb3dubG9hZFRyYWNrL3ZpZXdzL2FkbWluRExHYXRlLmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ0FkbWluRExHYXRlQ29udHJvbGxlcidcclxuICB9KTtcclxufSk7XHJcblxyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ0FkbWluRExHYXRlQ29udHJvbGxlcicsIFsnJHJvb3RTY29wZScsXHJcbiAgJyRzdGF0ZScsXHJcbiAgJyRzdGF0ZVBhcmFtcycsXHJcbiAgJyRzY29wZScsXHJcbiAgJyRodHRwJyxcclxuICAnJGxvY2F0aW9uJyxcclxuICAnJHdpbmRvdycsXHJcbiAgJyR1aWJNb2RhbCcsXHJcbiAgJ1Nlc3Npb25TZXJ2aWNlJyxcclxuICAnQWRtaW5ETEdhdGVTZXJ2aWNlJyxcclxuICBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uLCAkd2luZG93LCAkdWliTW9kYWwsIFNlc3Npb25TZXJ2aWNlLCBBZG1pbkRMR2F0ZVNlcnZpY2UpIHtcclxuICAgIGlmICghU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSB7XHJcbiAgICAgICRzdGF0ZS5nbygnYWRtaW4nKTtcclxuICAgIH1cclxuICAgIC8qIEluaXQgYm9vbGVhbiB2YXJpYWJsZXMgZm9yIHNob3cvaGlkZSBhbmQgb3RoZXIgZnVuY3Rpb25hbGl0aWVzICovXHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSBmYWxzZTtcclxuICAgICRzY29wZS5tZXNzYWdlID0ge1xyXG4gICAgICB2YWw6ICcnLFxyXG4gICAgICB2aXNpYmxlOiBmYWxzZVxyXG4gICAgfTtcclxuXHJcbiAgICAvKiBJbml0IERvd25sb2FkIEdhdGV3YXkgZm9ybSBkYXRhICovXHJcblxyXG4gICAgJHNjb3BlLnRyYWNrID0ge1xyXG4gICAgICBhcnRpc3RVc2VybmFtZTogJ0xhIFRyb3BpY8OhbCcsXHJcbiAgICAgIHRyYWNrVGl0bGU6ICdQYW50ZW9uZSAvIFRyYXZlbCcsXHJcbiAgICAgIHRyYWNrQXJ0d29ya1VSTDogJ2Fzc2V0cy9pbWFnZXMvd2hvLXdlLWFyZS5wbmcnLFxyXG4gICAgICBTTUxpbmtzOiBbXSxcclxuICAgICAgbGlrZTogZmFsc2UsXHJcbiAgICAgIGNvbW1lbnQ6IGZhbHNlLFxyXG4gICAgICByZXBvc3Q6IGZhbHNlLFxyXG4gICAgICBhcnRpc3RzOiBbe1xyXG4gICAgICAgIHVybDogJycsXHJcbiAgICAgICAgYXZhdGFyOiAnYXNzZXRzL2ltYWdlcy93aG8td2UtYXJlLnBuZycsXHJcbiAgICAgICAgdXNlcm5hbWU6ICcnLFxyXG4gICAgICAgIGlkOiAtMSxcclxuICAgICAgICBwZXJtYW5lbnRMaW5rOiBmYWxzZVxyXG4gICAgICB9XSxcclxuICAgICAgcGxheWxpc3RzOiBbe1xyXG4gICAgICAgIHVybDogJycsXHJcbiAgICAgICAgYXZhdGFyOiAnJyxcclxuICAgICAgICB0aXRsZTogJycsXHJcbiAgICAgICAgaWQ6ICcnXHJcbiAgICAgIH1dXHJcbiAgICB9O1xyXG5cclxuICAgIC8qIEluaXQgZG93bmxvYWRHYXRld2F5IGxpc3QgKi9cclxuXHJcbiAgICAkc2NvcGUuZG93bmxvYWRHYXRld2F5TGlzdCA9IFtdO1xyXG5cclxuICAgIC8qIEluaXQgbW9kYWwgaW5zdGFuY2UgdmFyaWFibGVzIGFuZCBtZXRob2RzICovXHJcblxyXG4gICAgJHNjb3BlLm1vZGFsSW5zdGFuY2UgPSB7fTtcclxuICAgICRzY29wZS5tb2RhbCA9IHt9O1xyXG4gICAgJHNjb3BlLm9wZW5Nb2RhbCA9IHtcclxuICAgICAgZG93bmxvYWRVUkw6IGZ1bmN0aW9uKGRvd25sb2FkVVJMKSB7XHJcbiAgICAgICAgJHNjb3BlLm1vZGFsLmRvd25sb2FkVVJMID0gZG93bmxvYWRVUkw7XHJcbiAgICAgICAgJHNjb3BlLm1vZGFsSW5zdGFuY2UgPSAkdWliTW9kYWwub3Blbih7XHJcbiAgICAgICAgICBhbmltYXRpb246IHRydWUsXHJcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2Rvd25sb2FkVVJMLmh0bWwnLFxyXG4gICAgICAgICAgY29udHJvbGxlcjogJ0FydGlzdFRvb2xzQ29udHJvbGxlcicsXHJcbiAgICAgICAgICBzY29wZTogJHNjb3BlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICAkc2NvcGUuY2xvc2VNb2RhbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAkc2NvcGUubW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qIEluaXQgcHJvZmlsZSAqL1xyXG4gICAgJHNjb3BlLnByb2ZpbGUgPSB7fTtcclxuXHJcbiAgICAvKiBNZXRob2QgZm9yIHJlc2V0dGluZyBEb3dubG9hZCBHYXRld2F5IGZvcm0gKi9cclxuXHJcbiAgICBmdW5jdGlvbiByZXNldERvd25sb2FkR2F0ZXdheSgpIHtcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSBmYWxzZTtcclxuICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XHJcbiAgICAgICAgdmFsOiAnJyxcclxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgJHNjb3BlLnRyYWNrID0ge1xyXG4gICAgICAgIGFydGlzdFVzZXJuYW1lOiAnTGEgVHJvcGljw6FsJyxcclxuICAgICAgICB0cmFja1RpdGxlOiAnUGFudGVvbmUgLyBUcmF2ZWwnLFxyXG4gICAgICAgIHRyYWNrQXJ0d29ya1VSTDogJ2Fzc2V0cy9pbWFnZXMvd2hvLXdlLWFyZS5wbmcnLFxyXG4gICAgICAgIFNNTGlua3M6IFtdLFxyXG4gICAgICAgIGxpa2U6IGZhbHNlLFxyXG4gICAgICAgIGNvbW1lbnQ6IGZhbHNlLFxyXG4gICAgICAgIHJlcG9zdDogZmFsc2UsXHJcbiAgICAgICAgYXJ0aXN0czogW3tcclxuICAgICAgICAgIHVybDogJycsXHJcbiAgICAgICAgICBhdmF0YXI6ICdhc3NldHMvaW1hZ2VzL3doby13ZS1hcmUucG5nJyxcclxuICAgICAgICAgIHVzZXJuYW1lOiAnJyxcclxuICAgICAgICAgIGlkOiAtMSxcclxuICAgICAgICAgIHBlcm1hbmVudExpbms6IGZhbHNlXHJcbiAgICAgICAgfV0sXHJcbiAgICAgICAgcGxheWxpc3RzOiBbe1xyXG4gICAgICAgICAgdXJsOiAnJyxcclxuICAgICAgICAgIGF2YXRhcjogJycsXHJcbiAgICAgICAgICB0aXRsZTogJycsXHJcbiAgICAgICAgICBpZDogJydcclxuICAgICAgICB9XVxyXG4gICAgICB9O1xyXG4gICAgICBhbmd1bGFyLmVsZW1lbnQoXCJpbnB1dFt0eXBlPSdmaWxlJ11cIikudmFsKG51bGwpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qIENoZWNrIGlmIHN0YXRlUGFyYW1zIGhhcyBnYXRld2F5SUQgdG8gaW5pdGlhdGUgZWRpdCAqL1xyXG4gICAgJHNjb3BlLmNoZWNrSWZFZGl0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIGlmICgkc3RhdGVQYXJhbXMuZ2F0ZXdheUlEKSB7XHJcbiAgICAgICAgJHNjb3BlLmdldERvd25sb2FkR2F0ZXdheSgkc3RhdGVQYXJhbXMuZ2F0ZXdheUlEKTtcclxuICAgICAgICAvLyBpZighJHN0YXRlUGFyYW1zLmRvd25sb2FkR2F0ZXdheSkge1xyXG4gICAgICAgIC8vICAgJHNjb3BlLmdldERvd25sb2FkR2F0ZXdheSgkc3RhdGVQYXJhbXMuZ2F0ZXdheUlEKTtcclxuICAgICAgICAvLyB9IGVsc2Uge1xyXG4gICAgICAgIC8vICAgJHNjb3BlLnRyYWNrID0gJHN0YXRlUGFyYW1zLmRvd25sb2FkR2F0ZXdheTtcclxuICAgICAgICAvLyB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAkc2NvcGUudHJhY2tVUkxDaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKCRzY29wZS50cmFjay50cmFja1VSTCAhPT0gJycpIHtcclxuICAgICAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgICBBZG1pbkRMR2F0ZVNlcnZpY2VcclxuICAgICAgICAgIC5yZXNvbHZlRGF0YSh7XHJcbiAgICAgICAgICAgIHVybDogJHNjb3BlLnRyYWNrLnRyYWNrVVJMXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLnRoZW4oaGFuZGxlVHJhY2tEYXRhQW5kR2V0UHJvZmlsZXMpXHJcbiAgICAgICAgICAudGhlbihoYW5kbGVXZWJQcm9maWxlcylcclxuICAgICAgICAgIC5jYXRjaChoYW5kbGVFcnJvcik7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVRyYWNrRGF0YUFuZEdldFByb2ZpbGVzKHJlcykge1xyXG4gICAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrVGl0bGUgPSByZXMuZGF0YS50aXRsZTtcclxuICAgICAgICAgICRzY29wZS50cmFjay50cmFja0lEID0gcmVzLmRhdGEuaWQ7XHJcbiAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0SUQgPSByZXMuZGF0YS51c2VyLmlkO1xyXG4gICAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrQXJ0d29ya1VSTCA9IHJlcy5kYXRhLmFydHdvcmtfdXJsID8gcmVzLmRhdGEuYXJ0d29ya191cmwucmVwbGFjZSgnbGFyZ2UuanBnJywgJ3Q1MDB4NTAwLmpwZycpIDogJyc7XHJcbiAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0QXJ0d29ya1VSTCA9IHJlcy5kYXRhLnVzZXIuYXZhdGFyX3VybCA/IHJlcy5kYXRhLnVzZXIuYXZhdGFyX3VybCA6ICcnO1xyXG4gICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdFVSTCA9IHJlcy5kYXRhLnVzZXIucGVybWFsaW5rX3VybDtcclxuICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RVc2VybmFtZSA9IHJlcy5kYXRhLnVzZXIudXNlcm5hbWU7XHJcbiAgICAgICAgICAkc2NvcGUudHJhY2suU01MaW5rcyA9IFtdO1xyXG4gICAgICAgICAgcmV0dXJuIFNDLmdldCgnL3VzZXJzLycgKyAkc2NvcGUudHJhY2suYXJ0aXN0SUQgKyAnL3dlYi1wcm9maWxlcycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlV2ViUHJvZmlsZXMocHJvZmlsZXMpIHtcclxuICAgICAgICAgIHByb2ZpbGVzLmZvckVhY2goZnVuY3Rpb24ocHJvZikge1xyXG4gICAgICAgICAgICBpZiAoWyd0d2l0dGVyJywgJ3lvdXR1YmUnLCAnZmFjZWJvb2snLCAnc3BvdGlmeScsICdzb3VuZGNsb3VkJywgJ2luc3RhZ3JhbSddLmluZGV4T2YocHJvZi5zZXJ2aWNlKSAhPSAtMSkge1xyXG4gICAgICAgICAgICAgICRzY29wZS50cmFjay5TTUxpbmtzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAga2V5OiBwcm9mLnNlcnZpY2UsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogcHJvZi51cmxcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyKSB7XHJcbiAgICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tJRCA9IG51bGw7XHJcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZygnU29uZyBub3QgZm91bmQgb3IgZm9yYmlkZGVuJyk7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAkc2NvcGUuYXJ0aXN0VVJMQ2hhbmdlID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgdmFyIGFydGlzdCA9IHt9O1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgIEFkbWluRExHYXRlU2VydmljZVxyXG4gICAgICAgIC5yZXNvbHZlRGF0YSh7XHJcbiAgICAgICAgICB1cmw6ICRzY29wZS50cmFjay5hcnRpc3RzW2luZGV4XS51cmxcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdHNbaW5kZXhdLmF2YXRhciA9IHJlcy5kYXRhLmF2YXRhcl91cmw7XHJcbiAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0c1tpbmRleF0udXNlcm5hbWUgPSByZXMuZGF0YS51c2VybmFtZTtcclxuICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RzW2luZGV4XS5pZCA9IHJlcy5kYXRhLmlkO1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICQuWmVicmFfRGlhbG9nKCdBcnRpc3RzIG5vdCBmb3VuZCcpO1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgJHNjb3BlLmFkZFBsYXlsaXN0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICRzY29wZS50cmFjay5wbGF5bGlzdHMucHVzaCh7XHJcbiAgICAgICAgdXJsOiAnJyxcclxuICAgICAgICBhdmF0YXI6ICcnLFxyXG4gICAgICAgIHRpdGxlOiAnJyxcclxuICAgICAgICBpZDogJydcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAkc2NvcGUucmVtb3ZlUGxheWxpc3QgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAkc2NvcGUudHJhY2sucGxheWxpc3RzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9XHJcbiAgICAkc2NvcGUucGxheWxpc3RVUkxDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgIEFkbWluRExHYXRlU2VydmljZVxyXG4gICAgICAgIC5yZXNvbHZlRGF0YSh7XHJcbiAgICAgICAgICB1cmw6ICRzY29wZS50cmFjay5wbGF5bGlzdHNbaW5kZXhdLnVybFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAkc2NvcGUudHJhY2sucGxheWxpc3RzW2luZGV4XS5hdmF0YXIgPSByZXMuZGF0YS5hcnR3b3JrX3VybDtcclxuICAgICAgICAgICRzY29wZS50cmFjay5wbGF5bGlzdHNbaW5kZXhdLnRpdGxlID0gcmVzLmRhdGEudGl0bGU7XHJcbiAgICAgICAgICAkc2NvcGUudHJhY2sucGxheWxpc3RzW2luZGV4XS5pZCA9IHJlcy5kYXRhLmlkO1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coJ1BsYXlsaXN0IG5vdCBmb3VuZCcpO1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAkc2NvcGUucmVtb3ZlQXJ0aXN0ID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdHMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH1cclxuXHJcbiAgICAkc2NvcGUuYWRkQXJ0aXN0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIGlmICgkc2NvcGUudHJhY2suYXJ0aXN0cy5sZW5ndGggPiAyKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUudHJhY2suYXJ0aXN0cy5wdXNoKHtcclxuICAgICAgICB1cmw6ICcnLFxyXG4gICAgICAgIGF2YXRhcjogJ2Fzc2V0cy9pbWFnZXMvd2hvLXdlLWFyZS5wbmcnLFxyXG4gICAgICAgIHVzZXJuYW1lOiAnJyxcclxuICAgICAgICBpZDogLTFcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLmFkZFNNTGluayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAvLyBleHRlcm5hbFNNTGlua3MrKztcclxuICAgICAgLy8gJHNjb3BlLnRyYWNrLlNNTGlua3NbJ2tleScgKyBleHRlcm5hbFNNTGlua3NdID0gJyc7XHJcbiAgICAgICRzY29wZS50cmFjay5TTUxpbmtzLnB1c2goe1xyXG4gICAgICAgIGtleTogJycsXHJcbiAgICAgICAgdmFsdWU6ICcnXHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgICRzY29wZS5yZW1vdmVTTUxpbmsgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAkc2NvcGUudHJhY2suU01MaW5rcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgfTtcclxuICAgICRzY29wZS5TTUxpbmtDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xyXG5cclxuICAgICAgZnVuY3Rpb24gZ2V0TG9jYXRpb24oaHJlZikge1xyXG4gICAgICAgIHZhciBsb2NhdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xyXG4gICAgICAgIGxvY2F0aW9uLmhyZWYgPSBocmVmO1xyXG4gICAgICAgIGlmIChsb2NhdGlvbi5ob3N0ID09IFwiXCIpIHtcclxuICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSBsb2NhdGlvbi5ocmVmO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbG9jYXRpb247XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBsb2NhdGlvbiA9IGdldExvY2F0aW9uKCRzY29wZS50cmFjay5TTUxpbmtzW2luZGV4XS52YWx1ZSk7XHJcbiAgICAgIHZhciBob3N0ID0gbG9jYXRpb24uaG9zdG5hbWUuc3BsaXQoJy4nKVswXTtcclxuICAgICAgdmFyIGZpbmRMaW5rID0gJHNjb3BlLnRyYWNrLlNNTGlua3MuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICByZXR1cm4gaXRlbS5rZXkgPT09IGhvc3Q7XHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAoZmluZExpbmsubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICAkc2NvcGUudHJhY2suU01MaW5rc1tpbmRleF0ua2V5ID0gaG9zdDtcclxuICAgIH07XHJcblxyXG4gICAgJHNjb3BlLnNhdmVEb3dubG9hZEdhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKCEkc2NvcGUudHJhY2sudHJhY2tJRCkge1xyXG4gICAgICAgICQuWmVicmFfRGlhbG9nKCdUcmFjayBOb3QgRm91bmQnKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICB2YXIgc2VuZE9iaiA9IG5ldyBGb3JtRGF0YSgpO1xyXG5cclxuICAgICAgLyogQXBwZW5kIGRhdGEgdG8gc2VuZE9iaiBzdGFydCAqL1xyXG5cclxuICAgICAgLyogVHJhY2sgKi9cclxuICAgICAgZm9yICh2YXIgcHJvcCBpbiAkc2NvcGUudHJhY2spIHtcclxuICAgICAgICBzZW5kT2JqLmFwcGVuZChwcm9wLCAkc2NvcGUudHJhY2tbcHJvcF0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKiBhcnRpc3RzICovXHJcblxyXG4gICAgICB2YXIgYXJ0aXN0cyA9ICRzY29wZS50cmFjay5hcnRpc3RzLmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgcmV0dXJuIGl0ZW0uaWQgIT09IC0xO1xyXG4gICAgICB9KS5tYXAoZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgIGRlbGV0ZSBpdGVtWyckJGhhc2hLZXknXTtcclxuICAgICAgICByZXR1cm4gaXRlbTtcclxuICAgICAgfSk7XHJcbiAgICAgIHNlbmRPYmouYXBwZW5kKCdhcnRpc3RzJywgSlNPTi5zdHJpbmdpZnkoYXJ0aXN0cykpO1xyXG5cclxuICAgICAgLyogcGxheWxpc3RzICovXHJcblxyXG4gICAgICB2YXIgcGxheWxpc3RzID0gJHNjb3BlLnRyYWNrLnBsYXlsaXN0cy5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgIHJldHVybiBpdGVtLmlkICE9PSAtMTtcclxuICAgICAgfSkubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICBkZWxldGUgaXRlbVsnJCRoYXNoS2V5J107XHJcbiAgICAgICAgcmV0dXJuIGl0ZW07XHJcbiAgICAgIH0pO1xyXG4gICAgICBzZW5kT2JqLmFwcGVuZCgncGxheWxpc3RzJywgSlNPTi5zdHJpbmdpZnkocGxheWxpc3RzKSk7XHJcblxyXG4gICAgICAvKiBTTUxpbmtzICovXHJcblxyXG4gICAgICB2YXIgU01MaW5rcyA9IHt9O1xyXG4gICAgICAkc2NvcGUudHJhY2suU01MaW5rcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICBTTUxpbmtzW2l0ZW0ua2V5XSA9IGl0ZW0udmFsdWU7XHJcbiAgICAgIH0pO1xyXG4gICAgICBzZW5kT2JqLmFwcGVuZCgnU01MaW5rcycsIEpTT04uc3RyaW5naWZ5KFNNTGlua3MpKTtcclxuXHJcbiAgICAgIC8qIEFwcGVuZCBkYXRhIHRvIHNlbmRPYmogZW5kICovXHJcblxyXG4gICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICB1cmw6ICcvYXBpL2RhdGFiYXNlL2Rvd25sb2FkdXJsJyxcclxuICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogdW5kZWZpbmVkXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0cmFuc2Zvcm1SZXF1ZXN0OiBhbmd1bGFyLmlkZW50aXR5LFxyXG4gICAgICAgIGRhdGE6IHNlbmRPYmpcclxuICAgICAgfTtcclxuICAgICAgJGh0dHAob3B0aW9ucylcclxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICBpZiAoJHNjb3BlLnRyYWNrLl9pZCkge1xyXG4gICAgICAgICAgICAvLyAkc2NvcGUub3Blbk1vZGFsLmRvd25sb2FkVVJMKHJlcy5kYXRhLnRyYWNrVVJMKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmVzZXREb3dubG9hZEdhdGV3YXkoKTtcclxuICAgICAgICAgICRzY29wZS5vcGVuTW9kYWwuZG93bmxvYWRVUkwocmVzLmRhdGEpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJFUlJPUjogRXJyb3IgaW4gc2F2aW5nIHVybFwiKTtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgJGh0dHAucG9zdCgnL2FwaS9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIFNlc3Npb25TZXJ2aWNlLmRlbGV0ZVVzZXIoKTtcclxuICAgICAgICAkc3RhdGUuZ28oJ2FkbWluJyk7XHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAkc2NvcGUuc2hvd1Byb2ZpbGVJbmZvID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICRzY29wZS5wcm9maWxlID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICAgfVxyXG5cclxuICAgICRzY29wZS5nZXREb3dubG9hZExpc3QgPSBmdW5jdGlvbigpIHtcclxuICAgICAgQWRtaW5ETEdhdGVTZXJ2aWNlXHJcbiAgICAgICAgLmdldERvd25sb2FkTGlzdCgpXHJcbiAgICAgICAgLnRoZW4oaGFuZGxlUmVzcG9uc2UpXHJcbiAgICAgICAgLmNhdGNoKGhhbmRsZUVycm9yKTtcclxuXHJcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlcykge1xyXG4gICAgICAgICRzY29wZS5kb3dubG9hZEdhdGV3YXlMaXN0ID0gcmVzLmRhdGE7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKHJlcykge1xyXG5cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qIE1ldGhvZCBmb3IgZ2V0dGluZyBEb3dubG9hZEdhdGV3YXkgaW4gY2FzZSBvZiBlZGl0ICovXHJcblxyXG4gICAgJHNjb3BlLmdldERvd25sb2FkR2F0ZXdheSA9IGZ1bmN0aW9uKGRvd25sb2FkR2F0ZVdheUlEKSB7XHJcbiAgICAgIC8vIHJlc2V0RG93bmxvYWRHYXRld2F5KCk7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgQWRtaW5ETEdhdGVTZXJ2aWNlXHJcbiAgICAgICAgLmdldERvd25sb2FkR2F0ZXdheSh7XHJcbiAgICAgICAgICBpZDogZG93bmxvYWRHYXRlV2F5SURcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGhhbmRsZVJlc3BvbnNlKVxyXG4gICAgICAgIC5jYXRjaChoYW5kbGVFcnJvcik7XHJcblxyXG4gICAgICBmdW5jdGlvbiBoYW5kbGVSZXNwb25zZShyZXMpIHtcclxuXHJcbiAgICAgICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSB0cnVlO1xyXG4gICAgICAgICRzY29wZS50cmFjayA9IHJlcy5kYXRhO1xyXG5cclxuICAgICAgICB2YXIgU01MaW5rcyA9IHJlcy5kYXRhLlNNTGlua3MgPyByZXMuZGF0YS5TTUxpbmtzIDoge307XHJcbiAgICAgICAgdmFyIFNNTGlua3NBcnJheSA9IFtdO1xyXG5cclxuICAgICAgICBmb3IgKHZhciBsaW5rIGluIFNNTGlua3MpIHtcclxuICAgICAgICAgIFNNTGlua3NBcnJheS5wdXNoKHtcclxuICAgICAgICAgICAga2V5OiBsaW5rLFxyXG4gICAgICAgICAgICB2YWx1ZTogU01MaW5rc1tsaW5rXVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICRzY29wZS50cmFjay5TTUxpbmtzID0gU01MaW5rc0FycmF5O1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKHJlcykge1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgJHNjb3BlLmRlbGV0ZURvd25sb2FkR2F0ZXdheSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcblxyXG4gICAgICBpZiAoY29uZmlybShcIkRvIHlvdSByZWFsbHkgd2FudCB0byBkZWxldGUgdGhpcyB0cmFjaz9cIikpIHtcclxuICAgICAgICB2YXIgZG93bmxvYWRHYXRlV2F5SUQgPSAkc2NvcGUuZG93bmxvYWRHYXRld2F5TGlzdFtpbmRleF0uX2lkO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgICBBZG1pbkRMR2F0ZVNlcnZpY2VcclxuICAgICAgICAgIC5kZWxldGVEb3dubG9hZEdhdGV3YXkoe1xyXG4gICAgICAgICAgICBpZDogZG93bmxvYWRHYXRlV2F5SURcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAudGhlbihoYW5kbGVSZXNwb25zZSlcclxuICAgICAgICAgIC5jYXRjaChoYW5kbGVFcnJvcik7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlcykge1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICRzY29wZS5kb3dubG9hZEdhdGV3YXlMaXN0LnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihyZXMpIHtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbl0pOyJdLCJmaWxlIjoiZG93bmxvYWRUcmFjay9jb250cm9sbGVycy9hZG1pbkRMR2F0ZS5qcyJ9
