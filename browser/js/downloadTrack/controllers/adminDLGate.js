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
    // $scope.artists = [{
    //   "id": 86560544,
    //   "username": "La Tropical",
    //   "url": "https://soundcloud.com/latropical"
    // }, {
    //   "id": 206926900,
    //   "username": "Red Tag",
    //   "url": "https://soundcloud.com/red-tag"
    // }, {
    //   "id": 64684860,
    //   "username": "Etiquette Noir",
    //   "url": "https://soundcloud.com/etiquettenoir"
    // }, {
    //   "id": 164339022,
    //   "username": "Le Sol",
    //   "url": "https://soundcloud.com/lesolmusique"
    // }, {
    //   "id": 203522426,
    //   "username": "Classy Records",
    //   "url": "https://soundcloud.com/onlyclassy"
    // }, {
    //   "id": 56395358,
    //   "url": "https://soundcloud.com/deeperbeat",
    //   "username": "DeeperBeet",
    // }];
    // $scope.playlists = [];
    // $scope.addArtist = function() {
    //   $scope.artists.push({});
    // }
    // $scope.removeArtist = function(a) {
    //   $scope.artists.splice($scope.artists.indexOf(a), 1);
    // }
    // $scope.artistURLChange = function(a) {
    //   var artist = $scope.artists[$scope.artists.indexOf(a)];
    //   $scope.processing = true;
    //   $http.post('/api/soundcloud/resolve', {
    //       url: artist.url
    //     })
    //     .then(function(res) {
    //       artist.avatar = res.data.avatar_url;
    //       artist.username = res.data.username;
    //       artist.id = res.data.id;
    //       $scope.processing = false;
    //     })
    //     .then(null, function(err) {
    //       alert('Artists not found');
    //       $scope.processing = false;
    //     })
    // }

    // $scope.addPlaylist = function() {
    //   $scope.playlists.push({});
    // }
    // $scope.removePlaylist = function(p) {
    //   $scope.playlists.splice($scope.playlists.indexOf(p), 1);
    // }
    // $scope.playlistURLChange = function(p) {
    //   var playlist = $scope.playlists[$scope.playlists.indexOf(p)];
    //   $scope.processing = true;
    //   $http.post('/api/soundcloud/resolve', {
    //       url: playlist.url
    //     })
    //     .then(function(res) {
    //       playlist.avatar = res.data.artwork_url;
    //       playlist.title = res.data.title;
    //       playlist.id = res.data.id;
    //       $scope.processing = false;
    //     })
    //     .then(null, function(err) {
    //       alert('Playlist not found');
    //       $scope.processing = false;
    //     })
    // }

    // $scope.trackURLChange = function() {
    //   if ($scope.track.trackURL !== '') {
    //     $scope.processing = true;
    //     $http.post('/api/soundcloud/resolve', {
    //         url: $scope.track.trackURL
    //       })
    //       .then(function(res) {
    //         $scope.track.trackTitle = res.data.title;
    //         $scope.track.trackID = res.data.id;
    //         $scope.track.artistID = res.data.user.id;
    //         $scope.track.trackArtworkURL = res.data.artwork_url.replace('large.jpg', 't500x500.jpg');
    //         $scope.track.artistArtworkURL = res.data.user.avatar_url;
    //         $scope.track.artistUsername = res.data.user.username;
    //         $scope.track.SMLinks = {};
    //         return SC.get('/users/' + $scope.track.artistID + '/web-profiles');
    //       })
    //       .then(function(profiles) {
    //         profiles.forEach(function(prof) {
    //           if (['twitter', 'youtube', 'facebook', 'spotify', 'soundcloud', 'instagram'].indexOf(prof.service) != -1) $scope.track.SMLinks[prof.service] = prof.url;
    //         });
    //         $scope.processing = false;
    //       })
    //       .then(null, function(err) {
    //         $scope.track.trackID = null;
    //         alert('Song not found or forbidden');
    //         $scope.processing = false;
    //       });
    //   }
    // }

    // $scope.saveDownloadGate = function() {
    //   if (!$scope.track.email || !$scope.track.downloadURL) {
    //     alert('Please fill in all fields');
    //     return false;
    //   }
    //   if (!$scope.track.trackID) {
    //     alert('Track Not Found');
    //     return false;
    //   }
    //   $scope.processing = true;
    //   var sendObj = $scope.track;
    //   sendObj.artistIDS = [$scope.track.artistID];
    //   $scope.artists.forEach(function(a) {
    //     sendObj.artistIDS.push(a.id);
    //   });
    //   sendObj.playlistIDS = [];
    //   $scope.playlists.forEach(function(p) {
    //     sendObj.playlistIDS.push(p.id);
    //   });
    //   $http.post('/api/database/downloadurl', sendObj)
    //     .then(function(res) {
    //       $scope.track = {
    //         trackURL: '',
    //         downloadURL: '',
    //         email: ''
    //       };
    //       alert("SUCCESS: Url saved successfully");
    //       $scope.processing = false;
    //       window.location.reload();
    //     })
    //     .then(null, function(err) {
    //       alert("ERROR: Error in saving url");
    //       $scope.processing = false;
    //     });
    // }

    // $scope.getDownloadList = function() {
    //     $http.get('/api/database/downloadurl')
    //       .then(handleResponse)
    //       .catch(handleError);

    //       function handleResponse(res) {
    //         console.log(res);
    //         $scope.downloadGatewayList = res.data;
    //       }

    //       function handleError(res) {

    //       }
    //   }
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
        permanentLinks: [{
          url: '',
        }],
        like: false,
        comment: false,
        repost: false,
        artists: [{
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
        }, {
          "id": 209865882,
          "url": "https://soundcloud.com/a-la-mer",
          "username": "A La Mer",
        }, {
          "id": 61594988,
          "username": "Royal X",
          "url": "https://soundcloud.com/royalxx"
        }, {
          "channelID": 210908986,
          "url": "https://soundcloud.com/supportifysupports",
          "username": "Supportify Supports",
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
          alert('Song not found or forbidden');
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
          alert('Artists not found');
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
          alert('Playlist not found');
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

    $scope.removePermanentLink = function(index) {
      $scope.track.permanentLinks.splice(index, 1);
    };

    $scope.addPermanentLink = function() {
      if ($scope.track.permanentLinks.length > 2) {
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

      /* permanentLinks */

      var permanentLinks = $scope.track.permanentLinks.filter(function(item) {
        return item.url !== '';
      }).map(function(item) {
        return item.url;
      });
      sendObj.append('permanentLinks', JSON.stringify(permanentLinks));

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
          alert("ERROR: Error in saving url");
          $scope.processing = false;
        });
    };

    $scope.logout = function() {
      $http.post('/api/logout').then(function() {
        SessionService.deleteUser();
        $state.go('home');
      });
    };

    $scope.showProfileInfo = function() {
      $scope.profile = JSON.parse(SessionService.getUser());
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
        var permanentLinks = res.data.permanentLinks ? res.data.permanentLinks : [''];
        var SMLinksArray = [];
        var permanentLinksArray = [];

        for (var link in SMLinks) {
          SMLinksArray.push({
            key: link,
            value: SMLinks[link]
          });
        }
        permanentLinks.forEach(function(item) {
          permanentLinksArray.push({
            url: item
          })
        });
        $scope.track.SMLinks = SMLinksArray;
        $scope.track.permanentLinks = permanentLinksArray;
        console.log($scope.track);
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