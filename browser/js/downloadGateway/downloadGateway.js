app.config(function($stateProvider) {
  $stateProvider
    .state('adminDownloadGateway', {
      url: '/admin/downloadGateway',
      templateUrl: 'js/downloadGateway/downloadGateway.list.html',
      controller: 'AdminDownloadGatewayController',
      resolve: {
        isLoggedIn: function($stateParams, $window, SessionService) {
          if (!SessionService.getUser()) {
            $window.localStorage.setItem('returnstate', 'adminDownloadGateway');
            $window.localStorage.setItem('tid', $stateParams.gatewayID);
            $window.location.href = '/admin';
          }
          return true;
        },
      }
    })
    .state('adminDownloadGatewayEdit', {
      url: '/admin/downloadGateway/edit/:gatewayID',
      templateUrl: 'js/downloadGateway/downloadGateway.html',
      controller: 'AdminDownloadGatewayController',
      resolve: {
        isLoggedIn: function($stateParams, $window, SessionService) {
          if (!SessionService.getUser()) {
            $window.localStorage.setItem('returnstate', 'adminDownloadGatewayEdit');
            $window.localStorage.setItem('tid', $stateParams.gatewayID);
            $window.location.href = '/admin';
          }
          return true;
        },
      }
    })
    .state('adminDownloadGatewayNew', {
      url: '/admin/downloadGateway/new',
      params: {
        submission: null
      },
      templateUrl: 'js/downloadGateway/downloadGateway.html',
      controller: 'AdminDownloadGatewayController',
      resolve: {
        isLoggedIn: function($stateParams, $window, SessionService) {
          if (!SessionService.getUser()) {
            $window.localStorage.setItem('returnstate', 'adminDownloadGatewayNew');
            $window.location.href = '/admin';
          }
          return true;
        },
      }
    })
    .state('adminDownloadGatewayPreview', {
      url: '/admin/downloadGateway/preview',
      params: {
        submission: null
      },
      templateUrl: 'js/downloadGateway/preview.html',
      controller: 'AdminDownloadGatewayController',
    })
});

app.controller('AdminDownloadGatewayController', function($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, SessionService, AdminToolsService, AdminDLGateService, DownloadTrackService) {
  // /* Init Download Gateway form data */
  $scope.isLoggedIn = SessionService.getUser() ? true : false;
  $scope.curATUser = SessionService.getUser();
  // var formActions = SessionService.getActionsfoAccount();
  // var PaidUserId = SessionService.addActionsfoAccountIndexSRD();
  // var soundcloudId = SessionService.getSoundCloudId();
  // $scope.paidUsers = [];
  // paidReposts.forEach(function(pr) {
  //   $scope.paidUsers.push(pr);
  // })

  // if (PaidUserId == undefined && formActions == undefined && $scope.paidUsers.length > 0) {
  //   PaidUserId = $scope.paidUsers[0]._id;
  // }

  // if ($scope.paidUsers.length == 0) {
  //   $.Zebra_Dialog('Error: There is no any user record found.');
  //   return;
  // }

  // $scope.paidusersId = PaidUserId;

  // $scope.user = SessionService.getUserPaidRepostAccounts(PaidUserId);

  // $scope.paidusersRec = $scope.user;

  // //overlay autofill track start//
  // $scope.linkedAccounts = [];
  // $scope.autoFillTracks = [];
  // $scope.trackList = [];
  // $scope.trackListSlotObj = null;
  // $scope.newQueueSong = "";
  // $scope.tracksQueue = [];
  // $scope.profile = {};
  // $scope.trackList = [];
  // $scope.trackListObj = null;


  // $scope.linkedAccountData = {};
  // $scope.thirdPartyInfo = ($scope.user.thirdPartyInfo ? $scope.user.thirdPartyInfo : null);
  // $scope.hasThirdPartyFields = ($scope.user.thirdPartyInfo ? true : false);
  // /* Init boolean variables for show/hide and other functionalities */
  // $scope.processing = false;
  // $scope.isTrackAvailable = false;
  // $scope.message = {
  //   val: '',
  //   visible: false
  // };

  // /* Init downloadGateway list */
  // $scope.downloadGatewayList = [];
  // /* Init modal instance variables and methods */

  // $scope.modalInstance = {};
  // $scope.modal = {};
  // $scope.openModal = {
  //   downloadURL: function(downloadURL) {
  //     $scope.modal.downloadURL = downloadURL;
  //     $scope.modalInstance = $uibModal.open({
  //       animation: true,
  //       templateUrl: 'downloadURL.html',
  //       controller: 'ArtistToolsController',
  //       scope: $scope
  //     });
  //   }
  // };

  // $scope.changeQueueSong = function() {
  //   if ($scope.newQueueSong != "") {
  //     $scope.processing = true;
  //     $http.post('/api/soundcloud/resolve', {
  //         url: $scope.newQueueSong
  //       })
  //       .then(function(res) {
  //         $scope.processing = false;
  //         var track = res.data;
  //         if (track.kind == "playlist") {
  //           var tracksArr = track.tracks;
  //           angular.forEach(tracksArr, function(t) {
  //             $scope.newQueueID = t.id;
  //             $scope.tracksQueue.push($scope.newQueueID);
  //           });
  //         } else {
  //           $scope.newQueue = track;
  //           $scope.newQueueID = track.id;
  //         }
  //         $scope.processing = false;
  //       })
  //       .then(null, function(err) {
  //         $.Zebra_Dialog("We are not allowed to access tracks by this artist with the Soundcloud API. We apologize for the inconvenience, and we are working with Soundcloud to resolve this issue.");
  //         $scope.processing = false;
  //       });
  //   }
  // }

  // $scope.saveUser = function() {
  //   $scope.processing = true;
  //   $http.put("/api/database/profile", $scope.user)
  //     .then(function(res) {
  //       SessionService.setUserPaidRepostAccounts(res.data);
  //       $scope.user = SessionService.getUserPaidRepostAccounts(PaidUserId);
  //       $scope.processing = false;
  //       $scope.loadQueueSongs();
  //       // $window.location.reload();
  //     })
  //     .then(null, function(err) {
  //       $.Zebra_Dialog("Error: did not save");
  //       $scope.processing = false;
  //     });
  //   $('#autoFillTrack').modal('hide');
  // }

  // $scope.getTrackListFromSoundcloud = function() {
  //   var profile = $scope.user;
  //   if (profile.soundcloud) {
  //     $scope.processing = true;
  //     SC.get('/users/' + profile.soundcloud.id + '/tracks', {
  //         filter: 'public'
  //       })
  //       .then(function(tracks) {
  //         $scope.trackList = tracks;
  //         $scope.processing = false;
  //         $scope.$apply();
  //       })
  //       .catch(function(response) {
  //         $scope.processing = false;
  //         $scope.$apply();
  //       });
  //   }
  // }

  // $scope.removeQueueSong = function(index) {
  //   $scope.user.queue.splice(index, 1);
  //   $scope.saveUser()
  //     //$scope.loadQueueSongs();
  // }

  // $scope.loadQueueSongs = function(queue) {
  //   $scope.autoFillTracks = [];
  //   $scope.user.queue.forEach(function(songID) {
  //     SC.get('/tracks/' + songID)
  //       .then(function(track) {
  //         $scope.autoFillTracks.push(track);
  //         $scope.$digest();
  //       }, console.log);
  //   })
  // }

  // if ($scope.user && $scope.user.queue) {
  //   $scope.loadQueueSongs();
  // }
  // //overlay autofill track end//
  // $scope.closeModal = function() {
  //   $scope.modalInstance.close();
  // };

  // $scope.openHelpModal = function() {
  //   if ($state.current.url == '/artistTools/profile') {
  //     var displayText = "<h3>Help</h3><span style='font-weight:bold'>Permanent Links:</span> Add artist soundcloud urls here to make the artists followed on every one of your download gates.<br><br><a style='text-align:center; margin:0 auto;' href='mailto:coayscue@artistsunlimited.co?subject=Artists Unlimited Help' target='_top'>Email Tech Support</a>";
  //   } else if ($state.current.url == '/artistTools/downloadGateway') {
  //     var displayText = "<h3>Help</h3><span style='font-weight:bold'>List of downloads gateways:</span> This is a list of your download gates. You can create a new one, edit, delete one or view a download gate in the list.<br><br><a style='text-align:center; margin:0 auto;' href='mailto:coayscue@artistsunlimited.co?subject=Artists Unlimited Help' target='_top'>Email Tech Support</a>";
  //   }
  //   $.Zebra_Dialog(displayText, {
  //     width: 600
  //   });
  // }

  // $scope.editProfileModalInstance = {};
  // $scope.editProfilemodal = {};
  // $scope.openEditProfileModal = {
  //   editProfile: function(field) {
  //     $scope.profile.field = field;
  //     $timeout(function() {
  //       $scope.editProfileModalInstance = $uibModal.open({
  //         animation: true,
  //         templateUrl: 'editProfile.html',
  //         controller: 'ArtistToolsController',
  //         scope: $scope
  //       });
  //     }, 0);
  //   }
  // };

  // $scope.closeEditProfileModal = function() {
  //   $scope.showProfileInfo();
  //   if ($scope.editProfileModalInstance.close) {
  //     $scope.editProfileModalInstance.close();
  //   }
  // };

  // $scope.thankYouModalInstance = {};
  // $scope.thankYouModal = {};
  // $scope.openThankYouModal = {
  //   thankYou: function(submissionID) {
  //     $scope.thankYouModal.submissionID = submissionID;
  //     $scope.modalInstance = $uibModal.open({
  //       animation: true,
  //       templateUrl: 'thankYou.html',
  //       controller: 'OpenThankYouModalController',
  //       scope: $scope
  //     });
  //   }
  // };
  // $scope.closeThankYouModal = function() {
  //   $scope.thankYouModalInstance.close();
  // };
  // /* Init profile */
  // $scope.profile = {};
  // if ($stateParams.submission) {
  //   $scope.openThankYouModal.thankYou($stateParams.submission._id);
  // }
  // $scope.showProfileInfo = function() {
  //   $scope.userdata = $scope.user;
  //   $scope.profile.data = $scope.user;
  //   if (($scope.profile.data.permanentLinks && $scope.profile.data.permanentLinks.length === 0) || !$scope.profile.data.permanentLinks) {
  //     /*$scope.profile.data.permanentLinks = [{
  //       url: '',
  //       avatar: '',
  //       username: '',
  //       id: -1,
  //       permanentLink: true
  //     }];*/
  //   };
  //   $scope.profile.isAvailable = {};
  //   $scope.profile.isAvailable.email = $scope.profile.data.email ? true : false;
  //   $scope.profile.isAvailable.password = $scope.profile.data.password ? true : false;
  //   $scope.profile.isAvailable.soundcloud = $scope.profile.data.soundcloud ? true : false;
  //   $scope.profile.data.password = '';
  // };

  // $scope.saveProfileInfo = function() {
  //   $scope.message = {
  //     value: '',
  //     visible: false
  //   };
  //   var permanentLinks = $scope.permanentLinks.filter(function(item) {
  //     return item.id !== -1;
  //   }).map(function(item) {
  //     delete item['$$hashKey'];
  //     return item;
  //   });

  //   var sendObj = {
  //     userID: $scope.profile.data._id,
  //     permanentLinks: JSON.stringify(permanentLinks)
  //   }
  //   if ($scope.profile.field === 'name') {
  //     sendObj.name = $scope.profile.data.name;
  //   } else if ($scope.profile.field === 'password') {
  //     sendObj.password = $scope.profile.data.password;
  //   } else if ($scope.profile.field === 'email') {
  //     sendObj.email = $scope.profile.data.email;
  //   }

  //   $scope.processing = true;
  //   AdminToolsService
  //     .saveProfileInfo(sendObj)
  //     .then(function(res) {
  //       $scope.processing = false;
  //       if (res.data === 'Email Error') {
  //         $scope.message = {
  //           value: 'Email already exists!',
  //           visible: true
  //         };
  //         return;
  //       }
  //       if (permanentLinks != "") {
  //         $scope.linkUrl = "";
  //       }
  //       SessionService.setUserPaidRepostAccounts(res.data);
  //       $scope.user = SessionService.getUserPaidRepostAccounts(PaidUserId);
  //       $scope.closeEditProfileModal();
  //     })
  //     .catch(function(res) {
  //       $scope.processing = false;
  //       $.Zebra_Dialog('error saving');
  //     });
  // };

  // // remove linked accounts
  // $scope.removeLinkedAccount = function(account) {
  //   $rootScope.userlinkedAccounts.splice($rootScope.userlinkedAccounts.indexOf(account), 1);
  //   $http.put('/api/database/networkaccount', $rootScope.userlinkedAccounts)
  //     .then(function(res) {
  //       console.log(res.data);
  //       $rootScope.userlinkedAccounts = res.data.channels;
  //     })
  // }

  // $scope.removePermanentLink = function(index) {
  //   $scope.permanentLinks.splice(index, 1);
  //   $scope.saveProfileInfo();
  // };

  // $scope.hidebutton = false;
  // $scope.addPermanentLink = function() {
  //   if ($scope.profile.data.permanentLinks.length >= 2 && !$scope.user.admin) {
  //     $scope.hidebutton = true;
  //   }

  //   if ($scope.profile.data.permanentLinks.length > 2 && !$scope.user.admin) {
  //     return false;
  //   }

  // };

  // $scope.permanentLinkURLChange = function() {
  //   var permanentLink = {};
  //   $scope.processing = true;
  //   AdminToolsService
  //     .resolveData({
  //       url: $scope.linkUrl
  //     })
  //     .then(function(res) {
  //       $scope.profile.data.permanentLinks.push({
  //         url: res.data.permalink_url,
  //         avatar: res.data.avatar_url ? res.data.avatar_url : '',
  //         username: res.data.username,
  //         id: res.data.id,
  //         permanentLink: true
  //       });
  //       $scope.processing = false;
  //     })
  //     .catch(function(err) {
  //       $.Zebra_Dialog('Artists not found');
  //       $scope.processing = false;
  //     });
  // };

  // $scope.permanentLinks = [];
  // $scope.choseArtist = function(artist) {
  //   var permanentLink = {};
  //   $scope.permanentLinks.push({
  //     url: artist.permalink_url,
  //     avatar: artist.avatar_url ? artist.avatar_url : '',
  //     username: artist.username,
  //     id: artist.id,
  //     permanentLink: true
  //   });
  // }

  // $scope.choseArtistNew = function(artist) {
  //   var permanentLink = {};
  //   $scope.track.artists.push({
  //     url: artist.permalink_url,
  //     avatar: artist.avatar_url ? artist.avatar_url : '',
  //     username: artist.username,
  //     id: artist.id,
  //     permanentLink: true
  //   });
  // }
  // $scope.chosePlaylist = function(playlist) {
  //   var permanentLink = {};
  //   $scope.track.playlists.push({
  //     url: playlist.permalink_url,
  //     avatar: playlist.avatar_url ? playlist.avatar_url : '',
  //     title: playlist.title,
  //     id: playlist.id,
  //   });
  // }
  // $scope.saveSoundCloudAccountInfo = function() {
  //   SC.connect()
  //     .then(saveInfo)
  //     .then(handleResponse)
  //     .catch(handleError);

  //   function saveInfo(res) {
  //     return AdminToolsService.saveSoundCloudAccountInfo({
  //       token: res.oauth_token
  //     });
  //   }

  //   function handleResponse(res) {
  //     $scope.processing = false;
  //     if (res.status === 200 && (res.data.success === true)) {
  //       SessionService.setUserPaidRepostAccounts(res.data.data);
  //       $scope.user = SessionService.getUserPaidRepostAccounts(res.data.data._id);
  //       $scope.profile.data = res.data.data;
  //       $scope.profile.isAvailable.soundcloud = true;
  //     } else {
  //       $scope.message = {
  //         value: 'You already have an account with this soundcloud username',
  //         visible: true
  //       };
  //     }
  //     $scope.$apply();
  //   }

  //   function handleError(err) {
  //     $scope.processing = false;
  //   }
  // };

  // $scope.getDownloadList = function() {
  //   AdminToolsService
  //     .getDownloadList($scope.user._id)
  //     .then(handleResponse)
  //     .catch(handleError);

  //   function handleResponse(res) {
  //     $scope.downloadGatewayList = [];
  //     var i = -1;
  //     var nextFunc = function() {
  //       i++;
  //       if (i < res.data.length) {
  //         var data = res.data[i];
  //         $scope.downloadGatewayList.push(data);
  //         nextFunc();
  //       }
  //     }
  //     nextFunc();
  //   }

  //   function handleError(err) {
  //     console.log(err)
  //   }
  // };

  // $scope.deleteDownloadGateway = function(index) {
  //   if (confirm("Do you really want to delete this track?")) {
  //     var downloadGateWayID = $scope.downloadGatewayList[index]._id;
  //     $scope.processing = true;
  //     AdminToolsService
  //       .deleteDownloadGateway({
  //         id: downloadGateWayID
  //       })
  //       .then(handleResponse)
  //       .catch(handleError);

  //     function handleResponse(res) {
  //       $scope.processing = false;
  //       $scope.downloadGatewayList.splice(index, 1);
  //     }

  //     function handleError(res) {
  //       $scope.processing = false;
  //     }
  //   }
  // };

  // $scope.soundcloudLogin = function() {
  //   SC.connect()
  //     .then(function(res) {
  //       if (res.oauth_token == SessionService.getUser().soundcloud.token) {
  //         throw new Error('already added');
  //       } else {
  //         $scope.processing = true;
  //         $rootScope.accessToken = res.oauth_token;
  //         return $http.post('/api/login/soundCloudAuthentication', {
  //           token: res.oauth_token
  //         });
  //       }
  //     })
  //     .then(function(res) {
  //       var linkedAccountID = res.data.user._id;
  //       $http.post("/api/database/networkaccount", {
  //           userID: $scope.user._id,
  //           linkedAccountID: linkedAccountID
  //         })
  //         .then(function(res) {
  //           $.Zebra_Dialog(res.data.message);
  //           $rootScope.userlinkedAccounts = res.data.data.channels;
  //           setTimeout(function() {
  //             window.location.reload();
  //           }, 1000);
  //         });
  //     })
  //     .then(null, function(err) {
  //       console.log(err);
  //       $scope.processing = false;
  //       $.Zebra_Dialog('Please retry in 1 second.');
  //       setTimeout(function() {
  //         window.location.reload();
  //       }, 1000);
  //     });
  // };

  // $scope.showTitle = [];
  // $scope.track = {
  //   artistUsername: '',
  //   trackTitle: '',
  //   trackArtworkURL: '',
  //   SMLinks: [],
  //   like: false,
  //   comment: false,
  //   repost: false,
  //   artists: [],
  //   playlists: [],
  //   showDownloadTracks: 'user',
  //   admin: $scope.user.admin,
  //   file: {}
  // };

  // $scope.trackListChange = function(index) {
  //   $scope.isTrackAvailable = false;
  //   $scope.processing = true;
  //   var track = index;
  //   if ($scope.trackListObj)
  //     var track = $scope.trackListObj;

  //   $scope.track.trackURL = track.permalink_url;
  //   $scope.track.trackTitle = track.title;
  //   $scope.track.trackID = track.id;
  //   $scope.track.artistID = track.user.id;
  //   $scope.track.description = track.description;
  //   $scope.track.trackArtworkURL = track.artwork_url ? track.artwork_url.replace('large.jpg', 't500x500.jpg') : '';
  //   $scope.track.artistArtworkURL = track.user.avatar_url ? track.user.avatar_url : '';
  //   $scope.track.artistURL = track.user.permalink_url;
  //   $scope.track.artistUsername = track.user.username;
  //   $scope.track.SMLinks = [];

  //   SC.get('/users/' + $scope.track.artistID + '/web-profiles')
  //     .then(handleWebProfiles)
  //     .catch(handleError);

  //   function handleWebProfiles(profiles) {
  //     profiles.forEach(function(prof) {
  //       if (['twitter', 'youtube', 'facebook', 'spotify', 'soundcloud', 'instagram'].indexOf(prof.service) != -1) {
  //         $scope.track.SMLinks.push({
  //           key: prof.service,
  //           value: prof.url
  //         });
  //       }
  //     });
  //     $scope.isTrackAvailable = true;
  //     $scope.processing = false;
  //     $scope.$apply();
  //   }

  //   function handleError(err) {
  //     $scope.track.trackID = null;
  //     $.Zebra_Dialog('Song not found or forbidden');
  //     $scope.processing = false;
  //     $scope.$apply();
  //   }
  // };

  // $scope.openHelpModal = function() {
  //   var displayText = "<span style='font-weight:bold'>Song: </span>Choose or enter the url for the song you want to make the download gate for. If you make it for one of your tracks, the download link will be automatically added to your track on soundcloud.<br><br><span style='font-weight:bold'>Social Media Links: </span>The links that you add here will appear on the download gateway page.<br><br><span style='font-weight:bold'>Download File: </span>Either provide a link to a downloadable file or upload an mp3 file. If you upload an mp3, we format the file with the album artwork, title, and artist of your soundcloud track so that it will look good on a music player.<br><br><span style='font-weight:bold'>Artists to Follow and Actions: </span>The artists you add will be followed on this download gate. Under actions, you can make 'Liking', 'Reposting' and 'Commenting' mandatory on the download.<br><br><a style='text-align:center; margin:0 auto;' href='mailto:coayscue@artistsunlimited.co?subject=Artists Unlimited Help' target='_top'>Email Tech Support</a>";
  //   $.Zebra_Dialog(displayText, {
  //     width: 600
  //   });
  // }

  // $scope.removeSMLink = function(index) {
  //   $scope.track.SMLinks.splice(index, 1);
  // };

  // $scope.saveDownloadGate = function() {
  //   if (!($scope.track.downloadURL || ($scope.track.file && $scope.track.file.name))) {
  //     $.Zebra_Dialog('Enter a download file');
  //     return false;
  //   }

  //   if (!$scope.track.trackID) {
  //     $.Zebra_Dialog('Track Not Found');
  //     return false;
  //   }
  //   $scope.processing = true;
  //   var sendObj = new FormData();
  //   for (var prop in $scope.track) {
  //     sendObj.append(prop, $scope.track[prop]);
  //   }
  //   var artists = $scope.track.artists.filter(function(item) {
  //     return item.id !== -1;
  //   }).map(function(item) {
  //     delete item['$$hashKey'];
  //     return item;
  //   });

  //   var playlists = $scope.track.playlists.filter(function(item) {
  //     return item.id !== -1;
  //   }).map(function(item) {
  //     delete item['$$hashKey'];
  //     return item;
  //   });

  //   sendObj.append('artists', JSON.stringify(artists));
  //   var SMLinks = {};
  //   $scope.track.SMLinks.forEach(function(item) {
  //     SMLinks[item.key] = item.value;
  //   });
  //   sendObj.append('SMLinks', JSON.stringify(SMLinks));
  //   if ($scope.track.playlists) {
  //     sendObj.append('playlists', JSON.stringify($scope.track.playlists));
  //   }
  //   sendObj.append('user', JSON.stringify($scope.user));
  //   sendObj.append('adminaction', "admin");

  //   var options = {
  //     method: 'POST',
  //     url: '/api/database/downloadurl',
  //     headers: {
  //       'Content-Type': undefined
  //     },
  //     transformRequest: angular.identity,
  //     data: sendObj
  //   };

  //   $http(options)
  //     .then(function(res) {
  //       $scope.processing = false;
  //       if ($stateParams.submission) {
  //         $state.go('adminDownloadGateway', {
  //           'submission': $stateParams.submission
  //         });
  //       } else {
  //         if ($scope.user.soundcloud.id == $scope.track.artistID) {
  //           $.Zebra_Dialog('Download gateway was saved and added to the track.');
  //         } else {
  //           $.Zebra_Dialog('Download gateway saved.');
  //         }
  //         $state.go('adminDownloadGateway');
  //       }
  //     })
  //     .then(null, function(err) {
  //       $scope.processing = false;
  //       $.Zebra_Dialog("ERROR: Error in saving url");
  //       $scope.processing = false;
  //     });
  // };

  // $scope.checkIfEdit = function() {
  //   if ($stateParams.gatewayID) {
  //     $scope.getDownloadGateway($stateParams.gatewayID);
  //   } else {
  //     $scope.showTitle = [];
  //     $scope.track = {
  //       artistUsername: '',
  //       trackTitle: '',
  //       trackArtworkURL: '',
  //       SMLinks: [],
  //       like: false,
  //       comment: false,
  //       repost: false,
  //       artists: [],
  //       playlists: [],
  //       showDownloadTracks: 'user',
  //       admin: $scope.user.admin,
  //       file: {}
  //     };
  //     $scope.profile = {};
  //   }
  // };

  // $scope.getTrackListFromSoundcloud = function() {
  //   var profile = $scope.user;

  //   if (profile.soundcloud) {
  //     $scope.processing = true;
  //     SC.get('/users/' + profile.soundcloud.id + '/tracks', {
  //         filter: 'public'
  //       })
  //       .then(function(tracks) {
  //         $scope.trackList = tracks;
  //         $scope.processing = false;
  //         $scope.$apply();
  //       })
  //       .catch(function(response) {
  //         $scope.processing = false;
  //         $scope.$apply();
  //       });
  //   }
  // }

  // $scope.checkIfSubmission = function() {
  //   if ($stateParams.submission) {
  //     if ($state.includes('artistToolsDownloadGatewayNew')) {
  //       $scope.track.trackURL = $rootScope.submission.trackURL;
  //       $scope.trackURLChange();
  //       return;
  //     }
  //     $scope.openThankYouModal.thankYou($stateParams.submission._id);
  //     $rootScope.submission = null;
  //   }
  // }

  // $scope.resolveYoutube = function() {
  //   if (!($scope.track.socialPlatformValue.includes('/channel/') || $scope.track.socialPlatformValue.includes('/user/'))) {
  //     $.Zebra_Dialog('Enter a valid Youtube channel url.');
  //     return;
  //   }
  // }

  // // $scope.trackURLChange = function() {
  // //   if ($scope.track.trackURL !== '') {
  // //     $scope.isTrackAvailable = false;
  // //     $scope.processing = true;
  // //     AdminToolsService.resolveData({
  // //       url: $scope.track.trackURL
  // //     }).then(handleTrackDataAndGetProfiles).then(handleWebProfiles).catch(handleError);

  // //     function handleTrackDataAndGetProfiles(res) {
  // //       $scope.track.trackTitle = res.data.title;
  // //       $scope.track.trackID = res.data.id;
  // //       $scope.track.artistID = res.data.user.id;
  // //       $scope.track.description = res.data.description;
  // //       $scope.track.trackArtworkURL = res.data.artwork_url ? res.data.artwork_url.replace('large.jpg', 't500x500.jpg') : '';
  // //       $scope.track.artistArtworkURL = res.data.user.avatar_url ? res.data.user.avatar_url.replace('large.jpg', 't500x500.jpg') : '';
  // //       $scope.track.artistURL = res.data.user.permalink_url;
  // //       $scope.track.artistUsername = res.data.user.username;
  // //       $scope.track.SMLinks = [];
  // //       return SC.get('/users/' + $scope.track.artistID + '/web-profiles');
  // //     }

  // //     function handleWebProfiles(profiles) {
  // //       profiles.forEach(function(prof) {
  // //         if (['twitter', 'youtube', 'facebook', 'spotify', 'soundcloud', 'instagram'].indexOf(prof.service) != -1) {
  // //           $scope.track.SMLinks.push({
  // //             key: prof.service,
  // //             value: prof.url
  // //           });
  // //         }
  // //       });

  // //       $scope.isTrackAvailable = true;
  // //       $scope.processing = false;
  // //     }

  // //     function handleError(err) {
  // //       $scope.track.trackID = null;
  // //       $.Zebra_Dialog('Song not found or forbidden');
  // //       $scope.processing = false;
  // //     }
  // //   }
  // // }

  // $scope.SMLinkChange = function(index) {
  //   function getLocation(href) {
  //     var location = document.createElement("a");
  //     location.href = href;
  //     if (location.host == "") {
  //       location.href = location.href;
  //     }
  //     return location;
  //   }

  //   var location = getLocation($scope.track.SMLinks[index].value);
  //   var host = location.hostname.split('.')[0];
  //   if (host === 'www') host = location.hostname.split('.')[1];
  //   var findLink = $scope.track.SMLinks.filter(function(item) {
  //     return item.key === host;
  //   });

  //   if (findLink.length > 0) {
  //     return false;
  //   }
  //   $scope.track.SMLinks[index].key = host;
  // }

  // $scope.addSMLink = function() {
  //   $scope.track.SMLinks.push({
  //     key: '',
  //     value: ''
  //   });
  // }

  // $scope.clearOrFile = function() {
  //   if ($scope.track.downloadURL) {
  //     angular.element("input[type='file']").val(null);
  //   }
  // }

  // $scope.artistURLChange = function(index) {
  //   var artist = {};
  //   if ($scope.track.artists[index].url != "") {
  //     $scope.processing = true;
  //     AdminToolsService.resolveData({
  //       url: $scope.track.artists[index].url
  //     }).then(function(res) {
  //       $scope.track.artists[index].avatar = res.data.avatar_url ? res.data.avatar_url : '';
  //       $scope.track.artists[index].username = res.data.username;
  //       $scope.track.artists[index].id = res.data.id;
  //       $scope.processing = false;
  //     }).catch(function(err) {
  //       $.Zebra_Dialog('Artists not found');
  //       $scope.processing = false;
  //     });
  //   }
  // }

  // $scope.removeArtist = function(index) {
  //   $scope.track.artists.splice(index, 1);
  // }

  // $scope.addArtist = function() {
  //   $scope.track.artists.push({
  //     url: '',
  //     avatar: '',
  //     username: '',
  //     id: -1,
  //     permanentLink: false
  //   });
  // }
  // $scope.addPlaylist = function() {
  //   $scope.track.playlists.push({
  //     url: '',
  //     avatar: '',
  //     title: '',
  //     id: ''
  //   });
  // }
  // $scope.removePlaylist = function(index) {
  //   $scope.track.playlists.splice(index, 1);
  // }
  // $scope.playlistURLChange = function(index) {
  //   $scope.processing = true;
  //   AdminDLGateService
  //     .resolveData({
  //       url: $scope.track.playlists[index].url
  //     })
  //     .then(function(res) {
  //       $scope.track.playlists[index].avatar = res.data.artwork_url;
  //       $scope.track.playlists[index].title = res.data.title;
  //       $scope.track.playlists[index].id = res.data.id;
  //       $scope.processing = false;
  //     })
  //     .then(null, function(err) {
  //       $.Zebra_Dialog('Playlist not found');
  //       $scope.processing = false;
  //     })
  // }

  // function resetDownloadGateway() {
  //   $scope.processing = false;
  //   $scope.isTrackAvailable = false;
  //   $scope.message = {
  //     val: '',
  //     visible: false
  //   };

  //   $scope.track = {
  //     artistUsername: '',
  //     trackTitle: '',
  //     trackArtworkURL: '',
  //     SMLinks: [],
  //     like: false,
  //     comment: false,
  //     repost: false,
  //     artists: [{
  //       url: '',
  //       avatar: '',
  //       username: '',
  //       id: -1,
  //       permanentLink: false
  //     }],
  //     showDownloadTracks: 'user'
  //   };
  //   angular.element("input[type='file']").val(null);
  // }



  // $scope.getDownloadGateway = function(downloadGateWayID) {
  //   // resetDownloadGateway();
  //   $scope.processing = true;
  //   AdminToolsService
  //     .getDownloadGateway({
  //       id: downloadGateWayID
  //     })
  //     .then(handleResponse)
  //     .catch(handleError);

  //   function handleResponse(res) {

  //     $scope.isTrackAvailable = true;
  //     $scope.track = res.data;

  //     var SMLinks = res.data.SMLinks ? res.data.SMLinks : {};
  //     var permanentLinks = res.data.permanentLinks ? res.data.permanentLinks : [''];
  //     var SMLinksArray = [];
  //     var permanentLinksArray = [];

  //     for (var link in SMLinks) {
  //       SMLinksArray.push({
  //         key: link,
  //         value: SMLinks[link]
  //       });
  //     }
  //     permanentLinks.forEach(function(item) {
  //       permanentLinksArray.push({
  //         url: item
  //       })
  //     });
  //     if (!$scope.track.showDownloadTracks) {
  //       $scope.track.showDownloadTracks = 'user';
  //     }
  //     $scope.track.SMLinks = SMLinksArray;
  //     $scope.track.permanentLinks = permanentLinksArray;
  //     $scope.track.playlistIDS = [];
  //     // $scope.track.showDownloadTracks = ($scope.track.showDownloadTracks === 'user') ? true : false;
  //     //console.log($scope.track);
  //     $scope.processing = false;
  //   }

  //   function handleError(res) {
  //     $scope.processing = false;
  //   }
  // };

  // $scope.clearOrInput = function() {
  //   $scope.track.downloadURL = "";
  // }

  // $scope.preview = function(track) {
  //   window.localStorage.setItem('trackPreviewData', JSON.stringify(track));
  //   var url = $state.href('adminDownloadGatewayPreview');
  //   $window.open(url, '_blank');
  // }

  // $scope.verifyBrowser = function() {
  //   if (navigator.userAgent.search("Chrome") == -1 && navigator.userAgent.search("Safari") != -1) {
  //     var position = navigator.userAgent.search("Version") + 8;
  //     var end = navigator.userAgent.search(" Safari");
  //     var version = navigator.userAgent.substring(position, end);
  //     if (parseInt(version) < 9) {
  //       $.Zebra_Dialog('You have old version of safari. Click <a href="https://support.apple.com/downloads/safari">here</a> to download the latest version of safari for better site experience.', {
  //         'type': 'confirmation',
  //         'buttons': [{
  //           caption: 'OK'
  //         }],
  //         'onClose': function() {
  //           $window.location.href = "https://support.apple.com/downloads/safari";
  //         }
  //       });
  //     }
  //   }
  // }

  // $scope.getUserNetwork();
  // $scope.verifyBrowser();
  // $scope.recentTracks = [];
  // var track = JSON.parse(window.localStorage.getItem('trackPreviewData'));
  // if (track != "" && track != null && track != undefined) {
  //   if (!track.trackTitle) {
  //     $.Zebra_Dialog('Track Not Found');
  //     $state.go("adminDownloadGatewayList");
  //     return false;
  //   }

  //   $scope.track = track;
  //   $scope.player = {};
  //   SC.stream('/tracks/' + $scope.track.trackID)
  //     .then(function(p) {
  //       $scope.player = p;
  //     })

  //   $scope.toggle = true;
  //   $scope.togglePlay = function() {
  //     $scope.toggle = !$scope.toggle;
  //     if ($scope.toggle) {
  //       $scope.player.pause();
  //     } else {
  //       $scope.player.play();
  //     }
  //   }
  //   $scope.nodl = function() {
  //     $.Zebra_Dialog('No download in preview mode.')
  //   }

  //   $scope.getRecentTracks = function() {
  //     if ($scope.track && $scope.track.showDownloadTracks === 'user') {
  //       DownloadTrackService.getRecentTracks({
  //           userID: $scope.track.userid,
  //           trackID: $scope.track._id
  //         })
  //         .then(function(res) {
  //           if ((typeof res === 'object') && res.data) {
  //             $scope.recentTracks = res.data;
  //           }
  //         })
  //     }
  //   }
  //   $scope.getRecentTracks();
  // }


  // $scope.changedSearch = function(kind) {
  //   $("#searchString,#searchString1").next("ul").show();

  //   $scope.track.searchSelection = [];
  //   $scope.track.searchError = false;
  //   $scope.track.searching = true;
  //   if ($scope.track.trackURL != "") {
  //     $http.post('/api/search', {
  //       q: $scope.track.trackURL,
  //       kind: kind
  //     }).then(function(res) {
  //       $scope.track.searching = false;
  //       if (res.data.item) {

  //         $scope.selectedItem(res.data.item);
  //       } else {
  //         $scope.track.searchSelection = res.data.collection;
  //         $scope.track.searchSelection.forEach(function(item) {
  //           $scope.setItemText(item)
  //         })
  //       }
  //     }).then(null, function(err) {
  //       $scope.track.searching = false;
  //       $scope.track.searchError = "We could not find a " + kind + "."
  //     });
  //   }
  // }

  // $scope.setItemText = function(item) {

  //   switch (item.kind) {
  //     case 'track':
  //       item.displayName = item.title + ' - ' + item.user.username;
  //       break;
  //     case 'playlist':
  //       item.displayName = item.title + ' - ' + item.user.username;
  //       break;
  //     case 'user':
  //       item.displayName = user.username;
  //       break;
  //   }
  // }
  // $scope.choseTrack = function(item) {
  //   var player = document.getElementById('scPopupPlayer');
  //   if ($scope.tabSelected == false) {
  //     player = document.getElementById('scPlayer');
  //   }
  //   $scope.searchSelection = [];
  //   $scope.searchError = undefined;
  //   $scope.searchString = item.displayName;
  //   $scope.track.trackTitle = item.displayName;
  //   $scope.track.trackID = item.id;
  //   $scope.track.artistID = item.user.id;
  //   $scope.track.description = item.description;
  //   $scope.track.trackArtworkURL = item.artwork_url ? item.artwork_url.replace('large.jpg', 't500x500.jpg') : '';
  //   $scope.track.artistArtworkURL = item.user.avatar_url ? item.user.avatar_url.replace('large.jpg', 't500x500.jpg') : '';
  //   $scope.track.artistURL = item.user.permalink_url;
  //   $scope.track.artistUsername = item.user.username;
  //   $scope.track.SMLinks = [];
  //   SC.get('/users/' + $scope.track.artistID + '/web-profiles')
  //     .then(handleWebProfiles)
  //     .catch(handleError);

  //   function handleWebProfiles(profiles) {
  //     profiles.forEach(function(prof) {
  //       if (['twitter', 'youtube', 'facebook', 'spotify', 'soundcloud', 'instagram'].indexOf(prof.service) != -1) {
  //         $scope.track.SMLinks.push({
  //           key: prof.service,
  //           value: prof.url
  //         });
  //       }
  //     });
  //     $scope.isTrackAvailable = true;
  //     $scope.processing = false;
  //     $scope.$apply();
  //   }

  //   function handleError(err) {
  //     $scope.track.trackID = null;
  //     $.Zebra_Dialog('Song not found or forbidden');
  //     $scope.processing = false;
  //     $scope.$apply();
  //   }
  // }
  // $scope.selectedItem = function(item) {
  //     $scope.track.searching = false;
  //     $scope.track.searchError = false;
  //     $("#searchString,#searchString1").next("ul").hide();

  //     if (item.trackURL != "") {
  //       $scope.track.trackTitle = item.title;
  //       $scope.track.trackID = item.id;
  //       $scope.track.artistID = item.user.id;
  //       $scope.track.trackURL = item.title;
  //       $scope.track.playlists = [];
  //       $scope.track.downloadURL = "";
  //       $scope.track.like = false;
  //       $scope.track.repost = false;
  //       $scope.track.comment = false;
  //       $scope.track.description = item.description;
  //       $scope.track.trackArtworkURL = item.artwork_url ? item.artwork_url.replace('large.jpg', 't500x500.jpg') : '';
  //       $scope.track.artistArtworkURL = item.user.avatar_url ? item.user.avatar_url.replace('large.jpg', 't500x500.jpg') : '';
  //       $scope.track.artistURL = item.user.permalink_url;
  //       $scope.track.artistUsername = item.user.username;
  //       $scope.track.SMLinks = [];
  //       SC.get('/users/' + $scope.track.artistID + '/web-profiles', function(profiles) {
  //         profiles.forEach(function(prof) {
  //           if (['twitter', 'youtube', 'facebook', 'spotify', 'soundcloud', 'instagram'].indexOf(prof.service) != -1) {
  //             $scope.track.SMLinks.push({
  //               key: prof.service,
  //               value: prof.url
  //             });
  //           }
  //         });
  //       });

  //       $scope.isTrackAvailable = true;
  //       $scope.processing = false;
  //       $scope.track.searching = false;
  //       $scope.track.searchError = false;
  //     } else {
  //       $scope.track.trackID = null;
  //       $.Zebra_Dialog('Song not found or forbidden');
  //       $scope.processing = false;
  //     }
  //   }
  //   //end search//

  // $scope.urlChange = function() {
  //   $http.post('/api/soundcloud/resolve', {
  //       url: $scope.url
  //     })
  //     .then(function(res) {
  //       if (res.data.kind != "track") throw (new Error(''));
  //       $scope.track.trackID = res.data.id;
  //       $scope.track.title = res.data.title;
  //       $scope.track.trackURL = res.data.trackURL;
  //       $scope.track.artistArtworkURL = item.artwork_url;

  //       $scope.processing = false;
  //       $scope.notFound = false;
  //     }).then(null, function(err) {
  //       if (err.status != 403) {
  //         $.Zebra_Dialog("We are not allowed to access tracks by this artist with the Soundcloud API. We apologize for the inconvenience, and we are working with Soundcloud to resolve this issue.");
  //         $scope.notFound = true;
  //       } else {
  //         $scope.track.trackURL = $scope.url;

  //       }
  //       $scope.track.trackID = null;
  //       $scope.processing = false;
  //     });
  // }
});