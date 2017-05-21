app.config(function($stateProvider) {
  $stateProvider
    .state('artistTools', {
      url: '/artistTools',
      templateUrl: 'js/artistTools/ArtistTools/artistTools.html',
      controller: 'ArtistToolsController',
      abstract: true,
      resolve: {
        allowed: function($q, $state, SessionService) {
          var deferred = $q.defer();
          var user = SessionService.getUser();
          if (user) {
            deferred.resolve();
          } else {
            deferred.reject();
            window.location.href = '/login';
          }
          return deferred.promise;
        }
      }
    })
    .state('artistToolsProfile', {
      url: '/artistTools/profile',
      templateUrl: 'js/artistTools/ArtistTools/profile.html',
      controller: 'ArtistToolsController'
    })
    .state('artistToolsDownloadGatewayList', {
      url: '/artistTools/downloadGateway',
      params: {
        submission: null
      },
      templateUrl: 'js/artistTools/ArtistTools/downloadGateway.list.html',
      controller: 'ArtistToolsController'
    })
});

app.controller('ArtistToolsController', function($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, SessionService, ArtistToolsService) {
    $scope.user = SessionService.getUser();
    if (!SessionService.getUser()) {
      var path = window.location.pathname;
      if (path == "/artistTools/profile") {
        $window.localStorage.setItem('returnstate', 'artistToolsProfile');
      } else if (path == "/artistTools/downloadGateway") {
        $window.localStorage.setItem('returnstate', 'artistToolsDownloadGatewayList');
      }
      $state.go('login');
    } else {
      $window.localStorage.removeItem('returnstate');
    }
    var path = window.location.pathname;
    $scope.isAdminRoute = false;
    if (path.indexOf("admin/") != -1) {
      $scope.isAdminRoute = true
    } else {
      $scope.isAdminRoute = false;
    }
    $scope.linkedAccountData = {};
    $scope.thirdPartyInfo = ($scope.user.thirdPartyInfo ? $scope.user.thirdPartyInfo : null);
    $scope.hasThirdPartyFields = ($scope.user.thirdPartyInfo ? true : false);
    /* Init boolean variables for show/hide and other functionalities */
    $scope.processing = false;
    $scope.isTrackAvailable = false;
    $scope.message = {
      val: '',
      visible: false
    };

    /* Apply page end */
    $scope.gotoSettings = function() {
      SessionService.addActionsfoAccount('Admin', $scope.user._id)
      $state.go("basicstep1");
    }

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
    //overlay autofill track start//
    $scope.linkedAccounts = [];
    $scope.autoFillTracks = [];
    $scope.trackList = [];
    $scope.trackListObj = null;
    $scope.trackListSlotObj = null;
    $scope.newQueueSong = "";
    $scope.tracksQueue = [];

    $scope.trackChange = function(index) {
      $scope.makeEventURL = $scope.trackListSlotObj.permalink_url;
      $scope.changeURL();
    };

    $scope.trackListChange = function(index) {
      $scope.newQueueSong = $scope.trackListObj.permalink_url;
      $scope.processing = true;
      $scope.changeQueueSong();
    };

    $scope.showThridPartyBox = function() {
      $scope.hasThirdPartyFields = true;
    }

    $scope.permanentLinks = [];
    $scope.choseArtist = function(artist) {
      var permanentLink = {};
      $scope.profile.data.permanentLinks.push({
        url: artist.permalink_url,
        avatar: artist.avatar_url ? artist.avatar_url : '',
        username: artist.username,
        id: artist.id,
        permanentLink: true
      });
    }
    $scope.addSong = function() {
      if ($scope.user.queue.indexOf($scope.newQueueID) != -1) return;
      if ($scope.tracksQueue.length > 0) {
        for (var i = 0; i < $scope.tracksQueue.length; i++) {
          if ($scope.user.queue.indexOf($scope.tracksQueue[i]) == -1) {
            $scope.user.queue.push($scope.tracksQueue[i]);
          }
        }
      } else {
        if ($scope.newQueueID != null) {
          $scope.user.queue.push($scope.newQueueID);
        }
      }
      $scope.saveUser();
      $scope.newQueueSong = undefined;
      $scope.trackListObj = "";
      $scope.newQueue = undefined;
      $scope.tracksQueue = [];
    }

    $scope.changeQueueSong = function() {
      if ($scope.newQueueSong != "") {
        $scope.processing = true;
        $http.post('/api/soundcloud/resolve', {
            url: $scope.newQueueSong
          })
          .then(function(res) {
            $scope.processing = false;
            var track = res.data;
            if (track.kind == "playlist") {
              var tracksArr = track.tracks;
              angular.forEach(tracksArr, function(t) {
                $scope.newQueueID = t.id;
                $scope.tracksQueue.push($scope.newQueueID);
              });
            } else {
              $scope.newQueue = track;
              $scope.newQueueID = track.id;
            }
            $scope.processing = false;
          })
          .then(null, function(err) {
            $.Zebra_Dialog("We are not allowed to access tracks by this artist with the Soundcloud API. We apologize for the inconvenience, and we are working with Soundcloud to resolve this issue.");
            $scope.processing = false;
          });
      }
    }

    $scope.saveUser = function() {
      $scope.processing = true;
      $http.put("/api/database/profile", $scope.user)
        .then(function(res) {
          SessionService.create(res.data);
          $scope.user = SessionService.getUser();
          $scope.processing = false;
          $scope.loadQueueSongs();
          // $window.location.reload();
        })
        .then(null, function(err) {
          $.Zebra_Dialog("Error: did not save");
          $scope.processing = false;
        });
      $('#autoFillTrack').modal('hide');
    }

    $scope.getTrackListFromSoundcloud = function() {
      var profile = $scope.user;
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

    $scope.removeQueueSong = function(index) {
      $scope.user.queue.splice(index, 1);
      $scope.saveUser()
        //$scope.loadQueueSongs();
    }

    $scope.loadQueueSongs = function(queue) {
      $scope.autoFillTracks = [];
      $scope.user.queue.forEach(function(songID) {
        SC.get('/tracks/' + songID)
          .then(function(track) {
            $scope.autoFillTracks.push(track);
            $scope.$digest();
          }, console.log);
      })
    }
    if ($scope.user && $scope.user.queue) {
      $scope.loadQueueSongs();
    }
    //overlay autofill track end//
    $scope.closeModal = function() {
      $scope.modalInstance.close();
    };

    $scope.saveNotifications = function() {
      $http.put('/api/database/profile/notifications', $scope.profile.data)
        .then(function(res) {
          SessionService.create(res.data);
          $scope.user = SessionService.getUser();
        })
        .catch(function(res) {
          $.Zebra_Dialog('error saving');
        });
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
      if ($scope.editProfileModalInstance.close) {
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
          controller: 'OpenThankYouModalController',
          scope: $scope
        });
      }
    };
    $scope.closeThankYouModal = function() {
      $scope.thankYouModalInstance.close();
    };
    /* Init profile */
    $scope.profile = {};
    if ($stateParams.submission) {
      $scope.openThankYouModal.thankYou($stateParams.submission._id);
    }
    $scope.showProfileInfo = function() {
      $scope.profile.data = SessionService.getUser();
      if (($scope.profile.data.permanentLinks && $scope.profile.data.permanentLinks.length === 0) || !$scope.profile.data.permanentLinks) {
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
      }).map(function(item) {
        delete item['$$hashKey'];
        return item;
      });

      var sendObj = {
        name: '',
        password: '',
        email: '',
        permanentLinks: JSON.stringify(permanentLinks)
      }
      if ($scope.profile.field === 'name') {
        sendObj.name = $scope.profile.data.name;
      } else if ($scope.profile.field === 'password') {
        sendObj.password = $scope.profile.data.password;
      } else if ($scope.profile.field === 'email') {
        sendObj.email = $scope.profile.data.email;
      }

      $scope.processing = true;
      ArtistToolsService
        .saveProfileInfo(sendObj)
        .then(function(res) {
          $scope.processing = false;
          if (res.data === 'Email Error') {
            $scope.message = {
              value: 'Email already exists!',
              visible: true
            };
            return;
          }
          if (permanentLinks != "") {
            $scope.linkUrl = "";
          }
          SessionService.create(res.data);
          $scope.user = SessionService.getUser();
          $scope.closeEditProfileModal();
        })
        .catch(function(res) {
          $scope.processing = false;
          $.Zebra_Dialog('error saving');
        });
    };

    // remove linked accounts
    $scope.removeLinkedAccount = function(account) {
      $rootScope.userlinkedAccounts.splice($rootScope.userlinkedAccounts.indexOf(account), 1);
      $http.put('/api/database/networkaccount', $rootScope.userlinkedAccounts)
        .then(function(res) {
          $rootScope.userlinkedAccounts = res.data.channels;
          $rootScope.userlinkedAccounts = res.data.channels;
        })
    }

    $scope.removePermanentLink = function(index) {
      $scope.profile.data.permanentLinks.splice(index, 1);
      $scope.saveProfileInfo();
    };

    $scope.hidebutton = false;
    $scope.addPermanentLink = function() {

      if ($scope.profile.data.permanentLinks.length >= 2 && !$scope.user.admin) {
        $scope.hidebutton = true;
      }

      if ($scope.profile.data.permanentLinks.length > 2 && !$scope.user.admin) {
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

    $scope.permanentLinkURLChange = function() {
      var permanentLink = {};
      $scope.processing = true;
      ArtistToolsService
        .resolveData({
          url: $scope.linkUrl
        })
        .then(function(res) {
          $scope.profile.data.permanentLinks.push({
            url: res.data.permalink_url,
            avatar: res.data.avatar_url ? res.data.avatar_url : '',
            username: res.data.username,
            id: res.data.id,
            permanentLink: true
          });
          $scope.processing = false;
        })
        .catch(function(err) {
          $.Zebra_Dialog('Artists not found');
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
        if (res.status === 200 && (res.data.success === true)) {
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

      function handleError(err) {
        console.log(err)
      }
    };

    $scope.deleteDownloadGateway = function(index) {
      if (confirm("Do you really want to delete this track?")) {
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

    $scope.soundcloudLogin = function() {
      SC.connect()
        .then(function(res) {
          if (res.oauth_token == SessionService.getUser().soundcloud.token) {
            throw new Error('already added');
          } else {
            $scope.processing = true;
            $rootScope.accessToken = res.oauth_token;
            return $http.post('/api/login/soundCloudAuthentication', {
              token: res.oauth_token,
              password: 'test'
            });
          }
        })
        .then(function(res) {
          var linkedAccountID = res.data.user._id;
          $http.post("/api/database/networkaccount", {
              userID: $scope.user._id,
              linkedAccountID: linkedAccountID
            })
            .then(function(res) {
              $.Zebra_Dialog(res.data.message);
              $rootScope.userlinkedAccounts = res.data.data.channels;
              setTimeout(function() {
                window.location.reload();
              }, 1000);
            });
        })
        .then(null, function(err) {
          console.log(err);
          if (err.message == 'already added') {
            $scope.processing = false;
            window.localStorage.setItem('samelinkedaccount', true);
            window.location.reload();
          }
        });
    };

    if (window.localStorage.getItem('samelinkedaccount')) {
      window.localStorage.removeItem('samelinkedaccount');
      $scope.soundcloudLogin();
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

    $scope.getUserNetwork();
    $scope.verifyBrowser();
  })
  .controller('OpenThankYouModalController', function($scope) {})
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcnRpc3RUb29scy9BcnRpc3RUb29scy9hcnRpc3RUb29sc0NvbnRyb2xsZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyXHJcbiAgICAuc3RhdGUoJ2FydGlzdFRvb2xzJywge1xyXG4gICAgICB1cmw6ICcvYXJ0aXN0VG9vbHMnLFxyXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2FydGlzdFRvb2xzL0FydGlzdFRvb2xzL2FydGlzdFRvb2xzLmh0bWwnLFxyXG4gICAgICBjb250cm9sbGVyOiAnQXJ0aXN0VG9vbHNDb250cm9sbGVyJyxcclxuICAgICAgYWJzdHJhY3Q6IHRydWUsXHJcbiAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICBhbGxvd2VkOiBmdW5jdGlvbigkcSwgJHN0YXRlLCBTZXNzaW9uU2VydmljZSkge1xyXG4gICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcclxuICAgICAgICAgIHZhciB1c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICAgICAgICAgaWYgKHVzZXIpIHtcclxuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XHJcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9sb2dpbic7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICAuc3RhdGUoJ2FydGlzdFRvb2xzUHJvZmlsZScsIHtcclxuICAgICAgdXJsOiAnL2FydGlzdFRvb2xzL3Byb2ZpbGUnLFxyXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2FydGlzdFRvb2xzL0FydGlzdFRvb2xzL3Byb2ZpbGUuaHRtbCcsXHJcbiAgICAgIGNvbnRyb2xsZXI6ICdBcnRpc3RUb29sc0NvbnRyb2xsZXInXHJcbiAgICB9KVxyXG4gICAgLnN0YXRlKCdhcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheUxpc3QnLCB7XHJcbiAgICAgIHVybDogJy9hcnRpc3RUb29scy9kb3dubG9hZEdhdGV3YXknLFxyXG4gICAgICBwYXJhbXM6IHtcclxuICAgICAgICBzdWJtaXNzaW9uOiBudWxsXHJcbiAgICAgIH0sXHJcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvYXJ0aXN0VG9vbHMvQXJ0aXN0VG9vbHMvZG93bmxvYWRHYXRld2F5Lmxpc3QuaHRtbCcsXHJcbiAgICAgIGNvbnRyb2xsZXI6ICdBcnRpc3RUb29sc0NvbnRyb2xsZXInXHJcbiAgICB9KVxyXG59KTtcclxuXHJcbmFwcC5jb250cm9sbGVyKCdBcnRpc3RUb29sc0NvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uLCAkd2luZG93LCAkdWliTW9kYWwsICR0aW1lb3V0LCBTZXNzaW9uU2VydmljZSwgQXJ0aXN0VG9vbHNTZXJ2aWNlKSB7XHJcbiAgICAkc2NvcGUudXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcclxuICAgIGlmICghU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSB7XHJcbiAgICAgIHZhciBwYXRoID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xyXG4gICAgICBpZiAocGF0aCA9PSBcIi9hcnRpc3RUb29scy9wcm9maWxlXCIpIHtcclxuICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdyZXR1cm5zdGF0ZScsICdhcnRpc3RUb29sc1Byb2ZpbGUnKTtcclxuICAgICAgfSBlbHNlIGlmIChwYXRoID09IFwiL2FydGlzdFRvb2xzL2Rvd25sb2FkR2F0ZXdheVwiKSB7XHJcbiAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncmV0dXJuc3RhdGUnLCAnYXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlMaXN0Jyk7XHJcbiAgICAgIH1cclxuICAgICAgJHN0YXRlLmdvKCdsb2dpbicpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgncmV0dXJuc3RhdGUnKTtcclxuICAgIH1cclxuICAgIHZhciBwYXRoID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xyXG4gICAgJHNjb3BlLmlzQWRtaW5Sb3V0ZSA9IGZhbHNlO1xyXG4gICAgaWYgKHBhdGguaW5kZXhPZihcImFkbWluL1wiKSAhPSAtMSkge1xyXG4gICAgICAkc2NvcGUuaXNBZG1pblJvdXRlID0gdHJ1ZVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJHNjb3BlLmlzQWRtaW5Sb3V0ZSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgJHNjb3BlLmxpbmtlZEFjY291bnREYXRhID0ge307XHJcbiAgICAkc2NvcGUudGhpcmRQYXJ0eUluZm8gPSAoJHNjb3BlLnVzZXIudGhpcmRQYXJ0eUluZm8gPyAkc2NvcGUudXNlci50aGlyZFBhcnR5SW5mbyA6IG51bGwpO1xyXG4gICAgJHNjb3BlLmhhc1RoaXJkUGFydHlGaWVsZHMgPSAoJHNjb3BlLnVzZXIudGhpcmRQYXJ0eUluZm8gPyB0cnVlIDogZmFsc2UpO1xyXG4gICAgLyogSW5pdCBib29sZWFuIHZhcmlhYmxlcyBmb3Igc2hvdy9oaWRlIGFuZCBvdGhlciBmdW5jdGlvbmFsaXRpZXMgKi9cclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IGZhbHNlO1xyXG4gICAgJHNjb3BlLm1lc3NhZ2UgPSB7XHJcbiAgICAgIHZhbDogJycsXHJcbiAgICAgIHZpc2libGU6IGZhbHNlXHJcbiAgICB9O1xyXG5cclxuICAgIC8qIEFwcGx5IHBhZ2UgZW5kICovXHJcbiAgICAkc2NvcGUuZ290b1NldHRpbmdzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIFNlc3Npb25TZXJ2aWNlLmFkZEFjdGlvbnNmb0FjY291bnQoJ0FkbWluJywgJHNjb3BlLnVzZXIuX2lkKVxyXG4gICAgICAkc3RhdGUuZ28oXCJiYXNpY3N0ZXAxXCIpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qIEluaXQgZG93bmxvYWRHYXRld2F5IGxpc3QgKi9cclxuXHJcbiAgICAkc2NvcGUuZG93bmxvYWRHYXRld2F5TGlzdCA9IFtdO1xyXG5cclxuICAgIC8qIEluaXQgbW9kYWwgaW5zdGFuY2UgdmFyaWFibGVzIGFuZCBtZXRob2RzICovXHJcblxyXG4gICAgJHNjb3BlLm1vZGFsSW5zdGFuY2UgPSB7fTtcclxuICAgICRzY29wZS5tb2RhbCA9IHt9O1xyXG4gICAgJHNjb3BlLm9wZW5Nb2RhbCA9IHtcclxuICAgICAgZG93bmxvYWRVUkw6IGZ1bmN0aW9uKGRvd25sb2FkVVJMKSB7XHJcbiAgICAgICAgJHNjb3BlLm1vZGFsLmRvd25sb2FkVVJMID0gZG93bmxvYWRVUkw7XHJcbiAgICAgICAgJHNjb3BlLm1vZGFsSW5zdGFuY2UgPSAkdWliTW9kYWwub3Blbih7XHJcbiAgICAgICAgICBhbmltYXRpb246IHRydWUsXHJcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2Rvd25sb2FkVVJMLmh0bWwnLFxyXG4gICAgICAgICAgY29udHJvbGxlcjogJ0FydGlzdFRvb2xzQ29udHJvbGxlcicsXHJcbiAgICAgICAgICBzY29wZTogJHNjb3BlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICAvL292ZXJsYXkgYXV0b2ZpbGwgdHJhY2sgc3RhcnQvL1xyXG4gICAgJHNjb3BlLmxpbmtlZEFjY291bnRzID0gW107XHJcbiAgICAkc2NvcGUuYXV0b0ZpbGxUcmFja3MgPSBbXTtcclxuICAgICRzY29wZS50cmFja0xpc3QgPSBbXTtcclxuICAgICRzY29wZS50cmFja0xpc3RPYmogPSBudWxsO1xyXG4gICAgJHNjb3BlLnRyYWNrTGlzdFNsb3RPYmogPSBudWxsO1xyXG4gICAgJHNjb3BlLm5ld1F1ZXVlU29uZyA9IFwiXCI7XHJcbiAgICAkc2NvcGUudHJhY2tzUXVldWUgPSBbXTtcclxuXHJcbiAgICAkc2NvcGUudHJhY2tDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAkc2NvcGUubWFrZUV2ZW50VVJMID0gJHNjb3BlLnRyYWNrTGlzdFNsb3RPYmoucGVybWFsaW5rX3VybDtcclxuICAgICAgJHNjb3BlLmNoYW5nZVVSTCgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAkc2NvcGUudHJhY2tMaXN0Q2hhbmdlID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgJHNjb3BlLm5ld1F1ZXVlU29uZyA9ICRzY29wZS50cmFja0xpc3RPYmoucGVybWFsaW5rX3VybDtcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAkc2NvcGUuY2hhbmdlUXVldWVTb25nKCk7XHJcbiAgICB9O1xyXG5cclxuICAgICRzY29wZS5zaG93VGhyaWRQYXJ0eUJveCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAkc2NvcGUuaGFzVGhpcmRQYXJ0eUZpZWxkcyA9IHRydWU7XHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLnBlcm1hbmVudExpbmtzID0gW107XHJcbiAgICAkc2NvcGUuY2hvc2VBcnRpc3QgPSBmdW5jdGlvbihhcnRpc3QpIHtcclxuICAgICAgdmFyIHBlcm1hbmVudExpbmsgPSB7fTtcclxuICAgICAgJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcy5wdXNoKHtcclxuICAgICAgICB1cmw6IGFydGlzdC5wZXJtYWxpbmtfdXJsLFxyXG4gICAgICAgIGF2YXRhcjogYXJ0aXN0LmF2YXRhcl91cmwgPyBhcnRpc3QuYXZhdGFyX3VybCA6ICcnLFxyXG4gICAgICAgIHVzZXJuYW1lOiBhcnRpc3QudXNlcm5hbWUsXHJcbiAgICAgICAgaWQ6IGFydGlzdC5pZCxcclxuICAgICAgICBwZXJtYW5lbnRMaW5rOiB0cnVlXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgJHNjb3BlLmFkZFNvbmcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKCRzY29wZS51c2VyLnF1ZXVlLmluZGV4T2YoJHNjb3BlLm5ld1F1ZXVlSUQpICE9IC0xKSByZXR1cm47XHJcbiAgICAgIGlmICgkc2NvcGUudHJhY2tzUXVldWUubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJHNjb3BlLnRyYWNrc1F1ZXVlLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBpZiAoJHNjb3BlLnVzZXIucXVldWUuaW5kZXhPZigkc2NvcGUudHJhY2tzUXVldWVbaV0pID09IC0xKSB7XHJcbiAgICAgICAgICAgICRzY29wZS51c2VyLnF1ZXVlLnB1c2goJHNjb3BlLnRyYWNrc1F1ZXVlW2ldKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgaWYgKCRzY29wZS5uZXdRdWV1ZUlEICE9IG51bGwpIHtcclxuICAgICAgICAgICRzY29wZS51c2VyLnF1ZXVlLnB1c2goJHNjb3BlLm5ld1F1ZXVlSUQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICAkc2NvcGUuc2F2ZVVzZXIoKTtcclxuICAgICAgJHNjb3BlLm5ld1F1ZXVlU29uZyA9IHVuZGVmaW5lZDtcclxuICAgICAgJHNjb3BlLnRyYWNrTGlzdE9iaiA9IFwiXCI7XHJcbiAgICAgICRzY29wZS5uZXdRdWV1ZSA9IHVuZGVmaW5lZDtcclxuICAgICAgJHNjb3BlLnRyYWNrc1F1ZXVlID0gW107XHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLmNoYW5nZVF1ZXVlU29uZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAoJHNjb3BlLm5ld1F1ZXVlU29uZyAhPSBcIlwiKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAgICRodHRwLnBvc3QoJy9hcGkvc291bmRjbG91ZC9yZXNvbHZlJywge1xyXG4gICAgICAgICAgICB1cmw6ICRzY29wZS5uZXdRdWV1ZVNvbmdcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgdmFyIHRyYWNrID0gcmVzLmRhdGE7XHJcbiAgICAgICAgICAgIGlmICh0cmFjay5raW5kID09IFwicGxheWxpc3RcIikge1xyXG4gICAgICAgICAgICAgIHZhciB0cmFja3NBcnIgPSB0cmFjay50cmFja3M7XHJcbiAgICAgICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHRyYWNrc0FyciwgZnVuY3Rpb24odCkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLm5ld1F1ZXVlSUQgPSB0LmlkO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrc1F1ZXVlLnB1c2goJHNjb3BlLm5ld1F1ZXVlSUQpO1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICRzY29wZS5uZXdRdWV1ZSA9IHRyYWNrO1xyXG4gICAgICAgICAgICAgICRzY29wZS5uZXdRdWV1ZUlEID0gdHJhY2suaWQ7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJXZSBhcmUgbm90IGFsbG93ZWQgdG8gYWNjZXNzIHRyYWNrcyBieSB0aGlzIGFydGlzdCB3aXRoIHRoZSBTb3VuZGNsb3VkIEFQSS4gV2UgYXBvbG9naXplIGZvciB0aGUgaW5jb252ZW5pZW5jZSwgYW5kIHdlIGFyZSB3b3JraW5nIHdpdGggU291bmRjbG91ZCB0byByZXNvbHZlIHRoaXMgaXNzdWUuXCIpO1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAkc2NvcGUuc2F2ZVVzZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAkaHR0cC5wdXQoXCIvYXBpL2RhdGFiYXNlL3Byb2ZpbGVcIiwgJHNjb3BlLnVzZXIpXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUocmVzLmRhdGEpO1xyXG4gICAgICAgICAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgJHNjb3BlLmxvYWRRdWV1ZVNvbmdzKCk7XHJcbiAgICAgICAgICAvLyAkd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkVycm9yOiBkaWQgbm90IHNhdmVcIik7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAkKCcjYXV0b0ZpbGxUcmFjaycpLm1vZGFsKCdoaWRlJyk7XHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLmdldFRyYWNrTGlzdEZyb21Tb3VuZGNsb3VkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIHZhciBwcm9maWxlID0gJHNjb3BlLnVzZXI7XHJcbiAgICAgIGlmIChwcm9maWxlLnNvdW5kY2xvdWQpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgU0MuZ2V0KCcvdXNlcnMvJyArIHByb2ZpbGUuc291bmRjbG91ZC5pZCArICcvdHJhY2tzJywge1xyXG4gICAgICAgICAgICBmaWx0ZXI6ICdwdWJsaWMnXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24odHJhY2tzKSB7XHJcbiAgICAgICAgICAgICRzY29wZS50cmFja0xpc3QgPSB0cmFja3M7XHJcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAkc2NvcGUucmVtb3ZlUXVldWVTb25nID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgJHNjb3BlLnVzZXIucXVldWUuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgJHNjb3BlLnNhdmVVc2VyKClcclxuICAgICAgICAvLyRzY29wZS5sb2FkUXVldWVTb25ncygpO1xyXG4gICAgfVxyXG5cclxuICAgICRzY29wZS5sb2FkUXVldWVTb25ncyA9IGZ1bmN0aW9uKHF1ZXVlKSB7XHJcbiAgICAgICRzY29wZS5hdXRvRmlsbFRyYWNrcyA9IFtdO1xyXG4gICAgICAkc2NvcGUudXNlci5xdWV1ZS5mb3JFYWNoKGZ1bmN0aW9uKHNvbmdJRCkge1xyXG4gICAgICAgIFNDLmdldCgnL3RyYWNrcy8nICsgc29uZ0lEKVxyXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24odHJhY2spIHtcclxuICAgICAgICAgICAgJHNjb3BlLmF1dG9GaWxsVHJhY2tzLnB1c2godHJhY2spO1xyXG4gICAgICAgICAgICAkc2NvcGUuJGRpZ2VzdCgpO1xyXG4gICAgICAgICAgfSwgY29uc29sZS5sb2cpO1xyXG4gICAgICB9KVxyXG4gICAgfVxyXG4gICAgaWYgKCRzY29wZS51c2VyICYmICRzY29wZS51c2VyLnF1ZXVlKSB7XHJcbiAgICAgICRzY29wZS5sb2FkUXVldWVTb25ncygpO1xyXG4gICAgfVxyXG4gICAgLy9vdmVybGF5IGF1dG9maWxsIHRyYWNrIGVuZC8vXHJcbiAgICAkc2NvcGUuY2xvc2VNb2RhbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAkc2NvcGUubW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xyXG4gICAgfTtcclxuXHJcbiAgICAkc2NvcGUuc2F2ZU5vdGlmaWNhdGlvbnMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgJGh0dHAucHV0KCcvYXBpL2RhdGFiYXNlL3Byb2ZpbGUvbm90aWZpY2F0aW9ucycsICRzY29wZS5wcm9maWxlLmRhdGEpXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUocmVzLmRhdGEpO1xyXG4gICAgICAgICAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZygnZXJyb3Igc2F2aW5nJyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLmVkaXRQcm9maWxlTW9kYWxJbnN0YW5jZSA9IHt9O1xyXG4gICAgJHNjb3BlLmVkaXRQcm9maWxlbW9kYWwgPSB7fTtcclxuICAgICRzY29wZS5vcGVuRWRpdFByb2ZpbGVNb2RhbCA9IHtcclxuICAgICAgZWRpdFByb2ZpbGU6IGZ1bmN0aW9uKGZpZWxkKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2ZpbGUuZmllbGQgPSBmaWVsZDtcclxuICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICRzY29wZS5lZGl0UHJvZmlsZU1vZGFsSW5zdGFuY2UgPSAkdWliTW9kYWwub3Blbih7XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdlZGl0UHJvZmlsZS5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0FydGlzdFRvb2xzQ29udHJvbGxlcicsXHJcbiAgICAgICAgICAgIHNjb3BlOiAkc2NvcGVcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0sIDApO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgICRzY29wZS5jbG9zZUVkaXRQcm9maWxlTW9kYWwgPSBmdW5jdGlvbigpIHtcclxuICAgICAgJHNjb3BlLnNob3dQcm9maWxlSW5mbygpO1xyXG4gICAgICBpZiAoJHNjb3BlLmVkaXRQcm9maWxlTW9kYWxJbnN0YW5jZS5jbG9zZSkge1xyXG4gICAgICAgICRzY29wZS5lZGl0UHJvZmlsZU1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAkc2NvcGUudGhhbmtZb3VNb2RhbEluc3RhbmNlID0ge307XHJcbiAgICAkc2NvcGUudGhhbmtZb3VNb2RhbCA9IHt9O1xyXG4gICAgJHNjb3BlLm9wZW5UaGFua1lvdU1vZGFsID0ge1xyXG4gICAgICB0aGFua1lvdTogZnVuY3Rpb24oc3VibWlzc2lvbklEKSB7XHJcbiAgICAgICAgJHNjb3BlLnRoYW5rWW91TW9kYWwuc3VibWlzc2lvbklEID0gc3VibWlzc2lvbklEO1xyXG4gICAgICAgICRzY29wZS5tb2RhbEluc3RhbmNlID0gJHVpYk1vZGFsLm9wZW4oe1xyXG4gICAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxyXG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0aGFua1lvdS5odG1sJyxcclxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdPcGVuVGhhbmtZb3VNb2RhbENvbnRyb2xsZXInLFxyXG4gICAgICAgICAgc2NvcGU6ICRzY29wZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgJHNjb3BlLmNsb3NlVGhhbmtZb3VNb2RhbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAkc2NvcGUudGhhbmtZb3VNb2RhbEluc3RhbmNlLmNsb3NlKCk7XHJcbiAgICB9O1xyXG4gICAgLyogSW5pdCBwcm9maWxlICovXHJcbiAgICAkc2NvcGUucHJvZmlsZSA9IHt9O1xyXG4gICAgaWYgKCRzdGF0ZVBhcmFtcy5zdWJtaXNzaW9uKSB7XHJcbiAgICAgICRzY29wZS5vcGVuVGhhbmtZb3VNb2RhbC50aGFua1lvdSgkc3RhdGVQYXJhbXMuc3VibWlzc2lvbi5faWQpO1xyXG4gICAgfVxyXG4gICAgJHNjb3BlLnNob3dQcm9maWxlSW5mbyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAkc2NvcGUucHJvZmlsZS5kYXRhID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICAgICBpZiAoKCRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3MgJiYgJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcy5sZW5ndGggPT09IDApIHx8ICEkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcyA9IFt7XHJcbiAgICAgICAgICB1cmw6ICcnLFxyXG4gICAgICAgICAgYXZhdGFyOiAnJyxcclxuICAgICAgICAgIHVzZXJuYW1lOiAnJyxcclxuICAgICAgICAgIGlkOiAtMSxcclxuICAgICAgICAgIHBlcm1hbmVudExpbms6IHRydWVcclxuICAgICAgICB9XTtcclxuICAgICAgfTtcclxuICAgICAgJHNjb3BlLnByb2ZpbGUuaXNBdmFpbGFibGUgPSB7fTtcclxuICAgICAgJHNjb3BlLnByb2ZpbGUuaXNBdmFpbGFibGUuZW1haWwgPSAkc2NvcGUucHJvZmlsZS5kYXRhLmVtYWlsID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgICAkc2NvcGUucHJvZmlsZS5pc0F2YWlsYWJsZS5wYXNzd29yZCA9ICRzY29wZS5wcm9maWxlLmRhdGEucGFzc3dvcmQgPyB0cnVlIDogZmFsc2U7XHJcbiAgICAgICRzY29wZS5wcm9maWxlLmlzQXZhaWxhYmxlLnNvdW5kY2xvdWQgPSAkc2NvcGUucHJvZmlsZS5kYXRhLnNvdW5kY2xvdWQgPyB0cnVlIDogZmFsc2U7XHJcbiAgICAgICRzY29wZS5wcm9maWxlLmRhdGEucGFzc3dvcmQgPSAnJztcclxuICAgIH07XHJcblxyXG4gICAgJHNjb3BlLnNhdmVQcm9maWxlSW5mbyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAkc2NvcGUubWVzc2FnZSA9IHtcclxuICAgICAgICB2YWx1ZTogJycsXHJcbiAgICAgICAgdmlzaWJsZTogZmFsc2VcclxuICAgICAgfTtcclxuICAgICAgdmFyIHBlcm1hbmVudExpbmtzID0gJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcy5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgIHJldHVybiBpdGVtLmlkICE9PSAtMTtcclxuICAgICAgfSkubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICBkZWxldGUgaXRlbVsnJCRoYXNoS2V5J107XHJcbiAgICAgICAgcmV0dXJuIGl0ZW07XHJcbiAgICAgIH0pO1xyXG5cclxuICAgICAgdmFyIHNlbmRPYmogPSB7XHJcbiAgICAgICAgbmFtZTogJycsXHJcbiAgICAgICAgcGFzc3dvcmQ6ICcnLFxyXG4gICAgICAgIGVtYWlsOiAnJyxcclxuICAgICAgICBwZXJtYW5lbnRMaW5rczogSlNPTi5zdHJpbmdpZnkocGVybWFuZW50TGlua3MpXHJcbiAgICAgIH1cclxuICAgICAgaWYgKCRzY29wZS5wcm9maWxlLmZpZWxkID09PSAnbmFtZScpIHtcclxuICAgICAgICBzZW5kT2JqLm5hbWUgPSAkc2NvcGUucHJvZmlsZS5kYXRhLm5hbWU7XHJcbiAgICAgIH0gZWxzZSBpZiAoJHNjb3BlLnByb2ZpbGUuZmllbGQgPT09ICdwYXNzd29yZCcpIHtcclxuICAgICAgICBzZW5kT2JqLnBhc3N3b3JkID0gJHNjb3BlLnByb2ZpbGUuZGF0YS5wYXNzd29yZDtcclxuICAgICAgfSBlbHNlIGlmICgkc2NvcGUucHJvZmlsZS5maWVsZCA9PT0gJ2VtYWlsJykge1xyXG4gICAgICAgIHNlbmRPYmouZW1haWwgPSAkc2NvcGUucHJvZmlsZS5kYXRhLmVtYWlsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgIEFydGlzdFRvb2xzU2VydmljZVxyXG4gICAgICAgIC5zYXZlUHJvZmlsZUluZm8oc2VuZE9iailcclxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICBpZiAocmVzLmRhdGEgPT09ICdFbWFpbCBFcnJvcicpIHtcclxuICAgICAgICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgdmFsdWU6ICdFbWFpbCBhbHJlYWR5IGV4aXN0cyEnLFxyXG4gICAgICAgICAgICAgIHZpc2libGU6IHRydWVcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHBlcm1hbmVudExpbmtzICE9IFwiXCIpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmxpbmtVcmwgPSBcIlwiO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlKHJlcy5kYXRhKTtcclxuICAgICAgICAgICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICAgICAgICAgJHNjb3BlLmNsb3NlRWRpdFByb2ZpbGVNb2RhbCgpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICQuWmVicmFfRGlhbG9nKCdlcnJvciBzYXZpbmcnKTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgLy8gcmVtb3ZlIGxpbmtlZCBhY2NvdW50c1xyXG4gICAgJHNjb3BlLnJlbW92ZUxpbmtlZEFjY291bnQgPSBmdW5jdGlvbihhY2NvdW50KSB7XHJcbiAgICAgICRyb290U2NvcGUudXNlcmxpbmtlZEFjY291bnRzLnNwbGljZSgkcm9vdFNjb3BlLnVzZXJsaW5rZWRBY2NvdW50cy5pbmRleE9mKGFjY291bnQpLCAxKTtcclxuICAgICAgJGh0dHAucHV0KCcvYXBpL2RhdGFiYXNlL25ldHdvcmthY2NvdW50JywgJHJvb3RTY29wZS51c2VybGlua2VkQWNjb3VudHMpXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAkcm9vdFNjb3BlLnVzZXJsaW5rZWRBY2NvdW50cyA9IHJlcy5kYXRhLmNoYW5uZWxzO1xyXG4gICAgICAgICAgJHJvb3RTY29wZS51c2VybGlua2VkQWNjb3VudHMgPSByZXMuZGF0YS5jaGFubmVscztcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuICAgICRzY29wZS5yZW1vdmVQZXJtYW5lbnRMaW5rID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAkc2NvcGUuc2F2ZVByb2ZpbGVJbmZvKCk7XHJcbiAgICB9O1xyXG5cclxuICAgICRzY29wZS5oaWRlYnV0dG9uID0gZmFsc2U7XHJcbiAgICAkc2NvcGUuYWRkUGVybWFuZW50TGluayA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgaWYgKCRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3MubGVuZ3RoID49IDIgJiYgISRzY29wZS51c2VyLmFkbWluKSB7XHJcbiAgICAgICAgJHNjb3BlLmhpZGVidXR0b24gPSB0cnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAoJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcy5sZW5ndGggPiAyICYmICEkc2NvcGUudXNlci5hZG1pbikge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcy5wdXNoKHtcclxuICAgICAgICB1cmw6ICcnLFxyXG4gICAgICAgIGF2YXRhcjogJycsXHJcbiAgICAgICAgdXNlcm5hbWU6ICcnLFxyXG4gICAgICAgIGlkOiAtMSxcclxuICAgICAgICBwZXJtYW5lbnRMaW5rOiB0cnVlXHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAkc2NvcGUucGVybWFuZW50TGlua1VSTENoYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICB2YXIgcGVybWFuZW50TGluayA9IHt9O1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgIEFydGlzdFRvb2xzU2VydmljZVxyXG4gICAgICAgIC5yZXNvbHZlRGF0YSh7XHJcbiAgICAgICAgICB1cmw6ICRzY29wZS5saW5rVXJsXHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3MucHVzaCh7XHJcbiAgICAgICAgICAgIHVybDogcmVzLmRhdGEucGVybWFsaW5rX3VybCxcclxuICAgICAgICAgICAgYXZhdGFyOiByZXMuZGF0YS5hdmF0YXJfdXJsID8gcmVzLmRhdGEuYXZhdGFyX3VybCA6ICcnLFxyXG4gICAgICAgICAgICB1c2VybmFtZTogcmVzLmRhdGEudXNlcm5hbWUsXHJcbiAgICAgICAgICAgIGlkOiByZXMuZGF0YS5pZCxcclxuICAgICAgICAgICAgcGVybWFuZW50TGluazogdHJ1ZVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coJ0FydGlzdHMgbm90IGZvdW5kJyk7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAkc2NvcGUuc2F2ZVNvdW5kQ2xvdWRBY2NvdW50SW5mbyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBTQy5jb25uZWN0KClcclxuICAgICAgICAudGhlbihzYXZlSW5mbylcclxuICAgICAgICAudGhlbihoYW5kbGVSZXNwb25zZSlcclxuICAgICAgICAuY2F0Y2goaGFuZGxlRXJyb3IpO1xyXG5cclxuICAgICAgZnVuY3Rpb24gc2F2ZUluZm8ocmVzKSB7XHJcbiAgICAgICAgcmV0dXJuIEFydGlzdFRvb2xzU2VydmljZS5zYXZlU291bmRDbG91ZEFjY291bnRJbmZvKHtcclxuICAgICAgICAgIHRva2VuOiByZXMub2F1dGhfdG9rZW5cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UocmVzKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICBpZiAocmVzLnN0YXR1cyA9PT0gMjAwICYmIChyZXMuZGF0YS5zdWNjZXNzID09PSB0cnVlKSkge1xyXG4gICAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlKHJlcy5kYXRhLmRhdGEpO1xyXG4gICAgICAgICAgJHNjb3BlLnByb2ZpbGUuZGF0YSA9IHJlcy5kYXRhLmRhdGE7XHJcbiAgICAgICAgICAkc2NvcGUucHJvZmlsZS5pc0F2YWlsYWJsZS5zb3VuZGNsb3VkID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XHJcbiAgICAgICAgICAgIHZhbHVlOiAnWW91IGFscmVhZHkgaGF2ZSBhbiBhY2NvdW50IHdpdGggdGhpcyBzb3VuZGNsb3VkIHVzZXJuYW1lJyxcclxuICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZVxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihlcnIpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgICRzY29wZS5nZXREb3dubG9hZExpc3QgPSBmdW5jdGlvbigpIHtcclxuICAgICAgQXJ0aXN0VG9vbHNTZXJ2aWNlXHJcbiAgICAgICAgLmdldERvd25sb2FkTGlzdCgpXHJcbiAgICAgICAgLnRoZW4oaGFuZGxlUmVzcG9uc2UpXHJcbiAgICAgICAgLmNhdGNoKGhhbmRsZUVycm9yKTtcclxuXHJcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlcykge1xyXG4gICAgICAgICRzY29wZS5kb3dubG9hZEdhdGV3YXlMaXN0ID0gcmVzLmRhdGE7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycikge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKGVycilcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAkc2NvcGUuZGVsZXRlRG93bmxvYWRHYXRld2F5ID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgaWYgKGNvbmZpcm0oXCJEbyB5b3UgcmVhbGx5IHdhbnQgdG8gZGVsZXRlIHRoaXMgdHJhY2s/XCIpKSB7XHJcbiAgICAgICAgdmFyIGRvd25sb2FkR2F0ZVdheUlEID0gJHNjb3BlLmRvd25sb2FkR2F0ZXdheUxpc3RbaW5kZXhdLl9pZDtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgQXJ0aXN0VG9vbHNTZXJ2aWNlXHJcbiAgICAgICAgICAuZGVsZXRlRG93bmxvYWRHYXRld2F5KHtcclxuICAgICAgICAgICAgaWQ6IGRvd25sb2FkR2F0ZVdheUlEXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLnRoZW4oaGFuZGxlUmVzcG9uc2UpXHJcbiAgICAgICAgICAuY2F0Y2goaGFuZGxlRXJyb3IpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVSZXNwb25zZShyZXMpIHtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAkc2NvcGUuZG93bmxvYWRHYXRld2F5TGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlRXJyb3IocmVzKSB7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAkc2NvcGUuc291bmRjbG91ZExvZ2luID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIFNDLmNvbm5lY3QoKVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgaWYgKHJlcy5vYXV0aF90b2tlbiA9PSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkuc291bmRjbG91ZC50b2tlbikge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ2FscmVhZHkgYWRkZWQnKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgJHJvb3RTY29wZS5hY2Nlc3NUb2tlbiA9IHJlcy5vYXV0aF90b2tlbjtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvbG9naW4vc291bmRDbG91ZEF1dGhlbnRpY2F0aW9uJywge1xyXG4gICAgICAgICAgICAgIHRva2VuOiByZXMub2F1dGhfdG9rZW4sXHJcbiAgICAgICAgICAgICAgcGFzc3dvcmQ6ICd0ZXN0J1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgdmFyIGxpbmtlZEFjY291bnRJRCA9IHJlcy5kYXRhLnVzZXIuX2lkO1xyXG4gICAgICAgICAgJGh0dHAucG9zdChcIi9hcGkvZGF0YWJhc2UvbmV0d29ya2FjY291bnRcIiwge1xyXG4gICAgICAgICAgICAgIHVzZXJJRDogJHNjb3BlLnVzZXIuX2lkLFxyXG4gICAgICAgICAgICAgIGxpbmtlZEFjY291bnRJRDogbGlua2VkQWNjb3VudElEXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKHJlcy5kYXRhLm1lc3NhZ2UpO1xyXG4gICAgICAgICAgICAgICRyb290U2NvcGUudXNlcmxpbmtlZEFjY291bnRzID0gcmVzLmRhdGEuZGF0YS5jaGFubmVscztcclxuICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gICAgICAgICAgICAgIH0sIDEwMDApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgICAgIGlmIChlcnIubWVzc2FnZSA9PSAnYWxyZWFkeSBhZGRlZCcpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdzYW1lbGlua2VkYWNjb3VudCcsIHRydWUpO1xyXG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgIGlmICh3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3NhbWVsaW5rZWRhY2NvdW50JykpIHtcclxuICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdzYW1lbGlua2VkYWNjb3VudCcpO1xyXG4gICAgICAkc2NvcGUuc291bmRjbG91ZExvZ2luKCk7XHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLnZlcmlmeUJyb3dzZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKG5hdmlnYXRvci51c2VyQWdlbnQuc2VhcmNoKFwiQ2hyb21lXCIpID09IC0xICYmIG5hdmlnYXRvci51c2VyQWdlbnQuc2VhcmNoKFwiU2FmYXJpXCIpICE9IC0xKSB7XHJcbiAgICAgICAgdmFyIHBvc2l0aW9uID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5zZWFyY2goXCJWZXJzaW9uXCIpICsgODtcclxuICAgICAgICB2YXIgZW5kID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5zZWFyY2goXCIgU2FmYXJpXCIpO1xyXG4gICAgICAgIHZhciB2ZXJzaW9uID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5zdWJzdHJpbmcocG9zaXRpb24sIGVuZCk7XHJcbiAgICAgICAgaWYgKHBhcnNlSW50KHZlcnNpb24pIDwgOSkge1xyXG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coJ1lvdSBoYXZlIG9sZCB2ZXJzaW9uIG9mIHNhZmFyaS4gQ2xpY2sgPGEgaHJlZj1cImh0dHBzOi8vc3VwcG9ydC5hcHBsZS5jb20vZG93bmxvYWRzL3NhZmFyaVwiPmhlcmU8L2E+IHRvIGRvd25sb2FkIHRoZSBsYXRlc3QgdmVyc2lvbiBvZiBzYWZhcmkgZm9yIGJldHRlciBzaXRlIGV4cGVyaWVuY2UuJywge1xyXG4gICAgICAgICAgICAndHlwZSc6ICdjb25maXJtYXRpb24nLFxyXG4gICAgICAgICAgICAnYnV0dG9ucyc6IFt7XHJcbiAgICAgICAgICAgICAgY2FwdGlvbjogJ09LJ1xyXG4gICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgJ29uQ2xvc2UnOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAkd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcImh0dHBzOi8vc3VwcG9ydC5hcHBsZS5jb20vZG93bmxvYWRzL3NhZmFyaVwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAkc2NvcGUuZ2V0VXNlck5ldHdvcmsoKTtcclxuICAgICRzY29wZS52ZXJpZnlCcm93c2VyKCk7XHJcbiAgfSlcclxuICAuY29udHJvbGxlcignT3BlblRoYW5rWW91TW9kYWxDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlKSB7fSkiXSwiZmlsZSI6ImFydGlzdFRvb2xzL0FydGlzdFRvb2xzL2FydGlzdFRvb2xzQ29udHJvbGxlci5qcyJ9
