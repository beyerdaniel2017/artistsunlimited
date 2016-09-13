app.config(function($stateProvider) {
  $stateProvider
  .state('artistToolsDownloadGatewayEdit', {
    url: '/artistTools/downloadGateway/edit/:gatewayID',
    templateUrl: 'js/artistTools/downloadGateway/downloadGateway.html',
    controller: 'ArtistToolsDownloadGatewayController',
    resolve: {
      isLoggedIn: function($stateParams, $window, SessionService) {
        if (!SessionService.getUser()) {
          $window.localStorage.setItem('returnstate', 'artistToolsDownloadGatewayEdit');
          $window.localStorage.setItem('tid', $stateParams.gatewayID);
          $window.location.href = '/login';
        }
        return true;
      }
    }
  })
  .state('artistToolsDownloadGatewayNew', {
    url: '/artistTools/downloadGateway/new',
    params: {
      submission: null
    },
    templateUrl: 'js/artistTools/downloadGateway/downloadGateway.html',
    controller: 'ArtistToolsDownloadGatewayController',
    resolve: {
      isLoggedIn: function($stateParams, $window, SessionService) {
        if (!SessionService.getUser()) {
          $window.localStorage.setItem('returnstate', 'artistToolsDownloadGatewayNew');
          $window.location.href = '/login';
        }
        return true;
      }
    }
  })
});

app.controller('ArtistToolsDownloadGatewayController', function($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, SessionService, ArtistToolsService, AdminDLGateService) {
  /* Init Download Gateway form data */
  $scope.user = SessionService.getUser();
  if (!SessionService.getUser()) {
    $state.go('login');
  } else {
    $window.localStorage.removeItem('returnstate');
    $window.localStorage.removeItem('tid');
  }
  $scope.showTitle = [];
  $scope.track = {
    artistUsername: '',
    trackTitle: '',
    trackArtworkURL: '',
    SMLinks: [],
    like: false,
    comment: false,
    repost: false,
    artists: [],
    playlists: [],
    showDownloadTracks: 'user',
    admin: $scope.user.admin,
    file: {}
  };
  $scope.profile = {};
  /* Init track list and trackListObj*/
  $scope.trackList = [];
  $scope.trackListObj = null;

  /* Method for resetting Download Gateway form */

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
      $.Zebra_Dialog('Song not found or forbidden');
      $scope.processing = false;
      $scope.$apply();
    }
  };

  $scope.openHelpModal = function() {
    var displayText = "<span style='font-weight:bold'>Song: </span>Choose or enter the url for the song you want to make the download gate for. If you make it for one of your tracks, the download link will be automatically added to your track on soundcloud.<br><br><span style='font-weight:bold'>Social Media Links: </span>The links that you add here will appear on the download gateway page.<br><br><span style='font-weight:bold'>Download File: </span>Either provide a link to a downloadable file or upload an mp3 file. If you upload an mp3, we format the file with the album artwork, title, and artist of your soundcloud track so that it will look good on a music player.<br><br><span style='font-weight:bold'>Artists to Follow and Actions: </span>The artists you add will be followed on this download gate. Under actions, you can make 'Liking', 'Reposting' and 'Commenting' mandatory on the download.<br><br><a style='text-align:center; margin:0 auto;' href='mailto:coayscue@artistsunlimited.co?subject=Artists Unlimited Help' target='_top'>Email Tech Support</a>";
    $.Zebra_Dialog(displayText, {
      width: 600
    });
  }

  $scope.removeSMLink = function(index) {
    $scope.track.SMLinks.splice(index, 1);
  };

  $scope.saveDownloadGate = function() {
    if (!($scope.track.downloadURL || ($scope.track.file && $scope.track.file.name))) {
      $.Zebra_Dialog('Enter a download file');
      return false;
    }

    if (!$scope.track.trackID) {
      $.Zebra_Dialog('Track Not Found');
      return false;
    }
    $scope.processing = true;
    var sendObj = new FormData();
    for (var prop in $scope.track) {
      sendObj.append(prop, $scope.track[prop]);
    }
    var artists = $scope.track.artists.filter(function(item) {
      return item.id !== -1;
    }).map(function(item) {
      delete item['$$hashKey'];
      return item;
    });

    var playlists = $scope.track.playlists.filter(function(item) {
      return item.id !== -1;
    }).map(function(item) {
      delete item['$$hashKey'];
      return item;
    });

    sendObj.append('artists', JSON.stringify(artists));
    var SMLinks = {};
    $scope.track.SMLinks.forEach(function(item) {
      SMLinks[item.key] = item.value;
    });
    sendObj.append('SMLinks', JSON.stringify(SMLinks));
    if ($scope.track.playlists) {
      sendObj.append('playlists', JSON.stringify($scope.track.playlists));
    }

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
      if ($stateParams.submission) {
        $state.go('artistToolsDownloadGatewayList', {
          'submission': $stateParams.submission
        });
      } else {
        if ($scope.user.soundcloud.id == $scope.track.artistID) {
          $.Zebra_Dialog('Download gateway was saved and added to the track.');
        } else {
          $.Zebra_Dialog('Download gateway saved.');
        }
        $state.go('artistToolsDownloadGatewayList');
      }
    })
    .then(null, function(err) {
      $scope.processing = false;
      $.Zebra_Dialog("ERROR: Error in saving url");
      $scope.processing = false;
    });
  };

  $scope.checkIfEdit = function() {
    if ($stateParams.gatewayID) {
      $scope.getDownloadGateway($stateParams.gatewayID);
    }
  };

  $scope.getTrackListFromSoundcloud = function() {
    var profile = SessionService.getUser();
    if (profile.soundcloud) {
      $scope.processing = true;
      SC.get('/users/' + profile.soundcloud.id + '/tracks', {
        filter: 'public'
      })
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

  $scope.checkIfSubmission = function() {
    if ($stateParams.submission) {
      if ($state.includes('artistToolsDownloadGatewayNew')) {
        $scope.track.trackURL = $rootScope.submission.trackURL;
        $scope.trackURLChange();
        return;
      }

      $scope.openThankYouModal.thankYou($stateParams.submission._id);
      $rootScope.submission = null;
    }
  }

  $scope.resolveYoutube = function() {
    if (!($scope.track.socialPlatformValue.includes('/channel/') || $scope.track.socialPlatformValue.includes('/user/'))) {
      $.Zebra_Dialog('Enter a valid Youtube channel url.');
      return;
    }
  }

  $scope.trackURLChange = function() {
    if ($scope.track.trackURL !== '') {
      $scope.isTrackAvailable = false;
      $scope.processing = true;
      ArtistToolsService.resolveData({
        url: $scope.track.trackURL
      }).then(handleTrackDataAndGetProfiles).then(handleWebProfiles).catch(handleError);

      function handleTrackDataAndGetProfiles(res) {
        $scope.track.trackTitle = res.data.title;
        $scope.track.trackID = res.data.id;
        $scope.track.artistID = res.data.user.id;
        $scope.track.description = res.data.description;
        $scope.track.trackArtworkURL = res.data.artwork_url ? res.data.artwork_url.replace('large.jpg', 't500x500.jpg') : '';
        $scope.track.artistArtworkURL = res.data.user.avatar_url ? res.data.user.avatar_url.replace('large.jpg', 't500x500.jpg') : '';
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
  }

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
    if (host === 'www') host = location.hostname.split('.')[1];
    var findLink = $scope.track.SMLinks.filter(function(item) {
      return item.key === host;
    });

    if (findLink.length > 0) {
      return false;
    }
    $scope.track.SMLinks[index].key = host;
  }

  $scope.addSMLink = function() {
    $scope.track.SMLinks.push({
      key: '',
      value: ''
    });
  }

  $scope.clearOrFile = function() {
    if ($scope.track.downloadURL) {
      angular.element("input[type='file']").val(null);
    }
  }

  $scope.artistURLChange = function(index) {
    var artist = {};
    if ($scope.track.artists[index].url != "") {
      $scope.processing = true;
      ArtistToolsService.resolveData({
        url: $scope.track.artists[index].url
      }).then(function(res) {
        $scope.track.artists[index].avatar = res.data.avatar_url ? res.data.avatar_url : '';
        $scope.track.artists[index].username = res.data.username;
        $scope.track.artists[index].id = res.data.id;
        $scope.processing = false;
      }).catch(function(err) {
        $.Zebra_Dialog('Artists not found');
        $scope.processing = false;
      });
    }
  }

  $scope.removeArtist = function(index) {
    $scope.track.artists.splice(index, 1);
  }

  $scope.addArtist = function() {
    $scope.track.artists.push({
      url: '',
      avatar: '',
      username: '',
      id: -1,
      permanentLink: false
    });
  }
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
      if (!$scope.track.showDownloadTracks) {
        $scope.track.showDownloadTracks = 'user';
      }
      $scope.track.SMLinks = SMLinksArray;
      $scope.track.permanentLinks = permanentLinksArray;
      $scope.track.playlistIDS = [];
      // $scope.track.showDownloadTracks = ($scope.track.showDownloadTracks === 'user') ? true : false;
      //console.log($scope.track);
      $scope.processing = false;
    }

    function handleError(res) {
      $scope.processing = false;
    }
  };

  $scope.clearOrInput = function() {
    $scope.track.downloadURL = "";
  }

  $scope.preview = function(track) {
    window.localStorage.setItem('trackPreviewData', JSON.stringify(track));
    var url = $state.href('artistToolsDownloadGatewayPreview');
    $window.open(url, '_blank');
  }

  $scope.verifyBrowser = function() {
    if (navigator.userAgent.search("Chrome") == -1 && navigator.userAgent.search("Safari") != -1) {
      var position = navigator.userAgent.search("Version") + 8;
      var end = navigator.userAgent.search(" Safari");
      var version = navigator.userAgent.substring(position, end);
      if (parseInt(version) < 9) {
        $.Zebra_Dialog('You have old version of safari. Click <a href="https://support.apple.com/downloads/safari">here</a> to download the latest version of safari for better site experience.', {
          'type': 'confirmation',
          'buttons': [{
            caption: 'OK'
          }],
          'onClose': function() {
            $window.location.href = "https://support.apple.com/downloads/safari";
          }
        });
      }
    }
  }
  $scope.getUserNetwork = function(){
    $http.get("/api/database/userNetworks")
    .then(function(networks){
      $rootScope.userlinkedAccounts = networks.data;
    })
  }

    //search//
  $scope.searchSelection = [];
  $scope.changedSearch = function(kind) {
    $scope.searchSelection = [];
    $scope.searchError = undefined;
    $scope.searching = true;
    if ($scope.searchString != "") {
      $http.post('/api/search', {
        q: $scope.searchString,
        kind: kind
      }).then(function(res) {
        $scope.searching = false;
        if (res.data.item) {
          if (res.data.item.kind != kind) {
            $scope.serachError = "Please enter a " + kind + " URL.";
          } else {
            $scope.selectedItem(res.data.item);
          }
        } else {
          $scope.searchSelection = res.data.collection;
          $scope.searchSelection.forEach(function(item) {
            $scope.setItemText(item)
          })
        }
      }).then(null, function(err) {
        $scope.searching = false;
        console.log(err)
        console.log('We could not find a ' + kind);
        $scope.searchError = "We could not find a " + kind + "."
      });
    }
  }

  $scope.setItemText = function(item) {
    switch (item.kind) {
      case 'track':
        item.displayName = item.title + ' - ' + item.user.username;
        break;
      case 'playlist':
        item.displayName = item.title + ' - ' + item.user.username;
        break;
      case 'user':
        item.displayName = user.username;
        break;
    }
  }

  $scope.selectedItem = function(item) {
    var player = document.getElementById('scPopupPlayer');
    if($scope.tabSelected == false){
      player = document.getElementById('scPlayer');
    }
    $scope.searchSelection = [];
    $scope.searchError = undefined;
    $scope.searchString = item.title;
    $scope.track.trackTitle = item.title;
    $scope.track.trackID = item.id;
    $scope.track.artistID = item.user.id;
    $scope.track.description = item.description;
    $scope.track.trackArtworkURL = item.artwork_url ? item.artwork_url.replace('large.jpg', 't500x500.jpg') : '';
    $scope.track.artistArtworkURL = item.user.avatar_url ? item.user.avatar_url.replace('large.jpg', 't500x500.jpg') : '';
    $scope.track.artistURL = item.user.permalink_url;
    $scope.track.artistUsername = item.user.username;
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
      $.Zebra_Dialog('Song not found or forbidden');
      $scope.processing = false;
      $scope.$apply();
    }
  }
  //end search//

  $scope.getUserNetwork();
  $scope.verifyBrowser();
});