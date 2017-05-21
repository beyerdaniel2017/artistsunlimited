app.directive('dllist', function($http) {
  return {
    templateUrl: 'js/common/directives/downloadGateway/list.html',
    restrict: 'E',
    scope: false,
    controller: function dlListController($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, SessionService, ArtistToolsService) {
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
        $scope.saveProfileInfo();
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

      // Add third party credentials
      // $scope.addThirdPartyDetails = function(userdata) {
      //   $scope.processing = true;
      //   $http.put("/api/database/thirdPartyDetails", {
      //       userid: $scope.user._id,
      //       data: userdata
      //     })
      //   .then(function(res) {
      //     if(res.data){
      //       SessionService.create(res.data);
      //       $scope.user = SessionService.getUser();
      //       $scope.processing = false;
      //       $.Zebra_Dialog("Changes saved succesfully");  
      //       } else {
      //       $.Zebra_Dialog("Error in processing the request. Please try again.");
      //       $scope.processing = false;
      //     }   
      //   })
      //   .then(null, function(err) {
      //     $.Zebra_Dialog("Error in processing the request. Please try again.");
      //     $scope.processing = false;
      //   });
      // }

      // Remove third party access from user
      // $scope.removeThirdPartyAccess = function() {
      //   $scope.processing = true;
      //   $http.put("/api/database/deleteThirdPartyAccess", {
      //       userid: $scope.user._id
      //     })
      //   .then(function(res) {
      //     SessionService.create(res.data);
      //     $scope.user = SessionService.getUser();
      //     $scope.thirdPartyInfo = ($scope.user.thirdPartyInfo ? $scope.user.thirdPartyInfo : null);
      //     $scope.hasThirdPartyFields = ($scope.user.thirdPartyInfo ? true : false);
      //     $scope.processing = false;
      //     $.Zebra_Dialog("Account removed succesfully");        
      //   })
      //   .then(null, function(err) {
      //     $.Zebra_Dialog("Error in processing the request. Please try again.");
      //     $scope.processing = false;
      //   });
      // }

      // Save linked accounts
      // $scope.saveLinkedAccount = function(data) {
      //   if ($scope.hasThirdPartyFields) {
      //   $scope.processing = true;
      //     $http.put("/api/database/saveLinkedAccount", {
      //         userid: $scope.user._id,
      //         data: data
      //       })
      //   .then(function(res) {
      //     if(res.data){
      //       SessionService.create(res.data);
      //       $scope.user = SessionService.getUser();
      //       $rootScope.userlinkedAccounts = ($scope.user.linkedAccounts ? $scope.user.linkedAccounts : []);
      //       $scope.processing = false;
      //       $scope.linkedAccountData = {};
      //       $.Zebra_Dialog("Account linked succesfully");   
      //         } else {
      //       $scope.processing = false;
      //       $.Zebra_Dialog("No account found with given username and password.");   
      //     }   
      //   })
      //   .then(null, function(err) {
      //     $.Zebra_Dialog("Error in processing the request. Please try again.");
      //     $scope.processing = false;
      //   });
      //   } else {
      //     $.Zebra_Dialog("You must add third party access to this account to link another account.")
      //   }
      // }

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
            $scope.processing = false;
            $.Zebra_Dialog('Please retry in 1 second.');
            setTimeout(function() {
              window.location.reload();
            }, 1000);
          });
      };

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
    }
  }
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24vZGlyZWN0aXZlcy9kb3dubG9hZEdhdGV3YXkvbGlzdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHAuZGlyZWN0aXZlKCdkbGxpc3QnLCBmdW5jdGlvbigkaHR0cCkge1xyXG4gIHJldHVybiB7XHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL2Rvd25sb2FkR2F0ZXdheS9saXN0Lmh0bWwnLFxyXG4gICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgIHNjb3BlOiBmYWxzZSxcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIGRsTGlzdENvbnRyb2xsZXIoJHJvb3RTY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsICRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgJHdpbmRvdywgJHVpYk1vZGFsLCAkdGltZW91dCwgU2Vzc2lvblNlcnZpY2UsIEFydGlzdFRvb2xzU2VydmljZSkge1xyXG4gICAgICAkc2NvcGUudXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcclxuICAgICAgaWYgKCFTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkpIHtcclxuICAgICAgICB2YXIgcGF0aCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcclxuICAgICAgICBpZiAocGF0aCA9PSBcIi9hcnRpc3RUb29scy9wcm9maWxlXCIpIHtcclxuICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3JldHVybnN0YXRlJywgJ2FydGlzdFRvb2xzUHJvZmlsZScpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAocGF0aCA9PSBcIi9hcnRpc3RUb29scy9kb3dubG9hZEdhdGV3YXlcIikge1xyXG4gICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncmV0dXJuc3RhdGUnLCAnYXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlMaXN0Jyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdyZXR1cm5zdGF0ZScpO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBwYXRoID0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xyXG4gICAgICAkc2NvcGUuaXNBZG1pblJvdXRlID0gZmFsc2U7XHJcbiAgICAgIGlmIChwYXRoLmluZGV4T2YoXCJhZG1pbi9cIikgIT0gLTEpIHtcclxuICAgICAgICAkc2NvcGUuaXNBZG1pblJvdXRlID0gdHJ1ZVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICRzY29wZS5pc0FkbWluUm91dGUgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICAkc2NvcGUubGlua2VkQWNjb3VudERhdGEgPSB7fTtcclxuICAgICAgJHNjb3BlLnRoaXJkUGFydHlJbmZvID0gKCRzY29wZS51c2VyLnRoaXJkUGFydHlJbmZvID8gJHNjb3BlLnVzZXIudGhpcmRQYXJ0eUluZm8gOiBudWxsKTtcclxuICAgICAgJHNjb3BlLmhhc1RoaXJkUGFydHlGaWVsZHMgPSAoJHNjb3BlLnVzZXIudGhpcmRQYXJ0eUluZm8gPyB0cnVlIDogZmFsc2UpO1xyXG4gICAgICAvKiBJbml0IGJvb2xlYW4gdmFyaWFibGVzIGZvciBzaG93L2hpZGUgYW5kIG90aGVyIGZ1bmN0aW9uYWxpdGllcyAqL1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IGZhbHNlO1xyXG4gICAgICAkc2NvcGUubWVzc2FnZSA9IHtcclxuICAgICAgICB2YWw6ICcnLFxyXG4gICAgICAgIHZpc2libGU6IGZhbHNlXHJcbiAgICAgIH07XHJcblxyXG4gICAgICAvKiBBcHBseSBwYWdlIGVuZCAqL1xyXG4gICAgICAkc2NvcGUuZ290b1NldHRpbmdzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgU2Vzc2lvblNlcnZpY2UuYWRkQWN0aW9uc2ZvQWNjb3VudCgnQWRtaW4nLCAkc2NvcGUudXNlci5faWQpXHJcbiAgICAgICAgJHN0YXRlLmdvKFwiYmFzaWNzdGVwMVwiKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyogSW5pdCBkb3dubG9hZEdhdGV3YXkgbGlzdCAqL1xyXG5cclxuICAgICAgJHNjb3BlLmRvd25sb2FkR2F0ZXdheUxpc3QgPSBbXTtcclxuXHJcbiAgICAgIC8qIEluaXQgbW9kYWwgaW5zdGFuY2UgdmFyaWFibGVzIGFuZCBtZXRob2RzICovXHJcblxyXG4gICAgICAkc2NvcGUubW9kYWxJbnN0YW5jZSA9IHt9O1xyXG4gICAgICAkc2NvcGUubW9kYWwgPSB7fTtcclxuICAgICAgJHNjb3BlLm9wZW5Nb2RhbCA9IHtcclxuICAgICAgICBkb3dubG9hZFVSTDogZnVuY3Rpb24oZG93bmxvYWRVUkwpIHtcclxuICAgICAgICAgICRzY29wZS5tb2RhbC5kb3dubG9hZFVSTCA9IGRvd25sb2FkVVJMO1xyXG4gICAgICAgICAgJHNjb3BlLm1vZGFsSW5zdGFuY2UgPSAkdWliTW9kYWwub3Blbih7XHJcbiAgICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdkb3dubG9hZFVSTC5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0FydGlzdFRvb2xzQ29udHJvbGxlcicsXHJcbiAgICAgICAgICAgIHNjb3BlOiAkc2NvcGVcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgLy9vdmVybGF5IGF1dG9maWxsIHRyYWNrIHN0YXJ0Ly9cclxuICAgICAgJHNjb3BlLmxpbmtlZEFjY291bnRzID0gW107XHJcbiAgICAgICRzY29wZS5hdXRvRmlsbFRyYWNrcyA9IFtdO1xyXG4gICAgICAkc2NvcGUudHJhY2tMaXN0ID0gW107XHJcbiAgICAgICRzY29wZS50cmFja0xpc3RPYmogPSBudWxsO1xyXG4gICAgICAkc2NvcGUudHJhY2tMaXN0U2xvdE9iaiA9IG51bGw7XHJcbiAgICAgICRzY29wZS5uZXdRdWV1ZVNvbmcgPSBcIlwiO1xyXG4gICAgICAkc2NvcGUudHJhY2tzUXVldWUgPSBbXTtcclxuXHJcbiAgICAgICRzY29wZS50cmFja0NoYW5nZSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudFVSTCA9ICRzY29wZS50cmFja0xpc3RTbG90T2JqLnBlcm1hbGlua191cmw7XHJcbiAgICAgICAgJHNjb3BlLmNoYW5nZVVSTCgpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgJHNjb3BlLnRyYWNrTGlzdENoYW5nZSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgJHNjb3BlLm5ld1F1ZXVlU29uZyA9ICRzY29wZS50cmFja0xpc3RPYmoucGVybWFsaW5rX3VybDtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgJHNjb3BlLmNoYW5nZVF1ZXVlU29uZygpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgJHNjb3BlLnNob3dUaHJpZFBhcnR5Qm94ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLmhhc1RoaXJkUGFydHlGaWVsZHMgPSB0cnVlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUucGVybWFuZW50TGlua3MgPSBbXTtcclxuICAgICAgJHNjb3BlLmNob3NlQXJ0aXN0ID0gZnVuY3Rpb24oYXJ0aXN0KSB7XHJcbiAgICAgICAgdmFyIHBlcm1hbmVudExpbmsgPSB7fTtcclxuICAgICAgICAkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzLnB1c2goe1xyXG4gICAgICAgICAgdXJsOiBhcnRpc3QucGVybWFsaW5rX3VybCxcclxuICAgICAgICAgIGF2YXRhcjogYXJ0aXN0LmF2YXRhcl91cmwgPyBhcnRpc3QuYXZhdGFyX3VybCA6ICcnLFxyXG4gICAgICAgICAgdXNlcm5hbWU6IGFydGlzdC51c2VybmFtZSxcclxuICAgICAgICAgIGlkOiBhcnRpc3QuaWQsXHJcbiAgICAgICAgICBwZXJtYW5lbnRMaW5rOiB0cnVlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJHNjb3BlLnNhdmVQcm9maWxlSW5mbygpO1xyXG4gICAgICB9XHJcbiAgICAgICRzY29wZS5hZGRTb25nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKCRzY29wZS51c2VyLnF1ZXVlLmluZGV4T2YoJHNjb3BlLm5ld1F1ZXVlSUQpICE9IC0xKSByZXR1cm47XHJcbiAgICAgICAgaWYgKCRzY29wZS50cmFja3NRdWV1ZS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8ICRzY29wZS50cmFja3NRdWV1ZS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLnVzZXIucXVldWUuaW5kZXhPZigkc2NvcGUudHJhY2tzUXVldWVbaV0pID09IC0xKSB7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnVzZXIucXVldWUucHVzaCgkc2NvcGUudHJhY2tzUXVldWVbaV0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmICgkc2NvcGUubmV3UXVldWVJRCAhPSBudWxsKSB7XHJcbiAgICAgICAgICAgICRzY29wZS51c2VyLnF1ZXVlLnB1c2goJHNjb3BlLm5ld1F1ZXVlSUQpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAkc2NvcGUuc2F2ZVVzZXIoKTtcclxuICAgICAgICAkc2NvcGUubmV3UXVldWVTb25nID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICRzY29wZS50cmFja0xpc3RPYmogPSBcIlwiO1xyXG4gICAgICAgICRzY29wZS5uZXdRdWV1ZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAkc2NvcGUudHJhY2tzUXVldWUgPSBbXTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmNoYW5nZVF1ZXVlU29uZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICgkc2NvcGUubmV3UXVldWVTb25nICE9IFwiXCIpIHtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICRodHRwLnBvc3QoJy9hcGkvc291bmRjbG91ZC9yZXNvbHZlJywge1xyXG4gICAgICAgICAgICAgIHVybDogJHNjb3BlLm5ld1F1ZXVlU29uZ1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIHZhciB0cmFjayA9IHJlcy5kYXRhO1xyXG4gICAgICAgICAgICAgIGlmICh0cmFjay5raW5kID09IFwicGxheWxpc3RcIikge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRyYWNrc0FyciA9IHRyYWNrLnRyYWNrcztcclxuICAgICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0cmFja3NBcnIsIGZ1bmN0aW9uKHQpIHtcclxuICAgICAgICAgICAgICAgICAgJHNjb3BlLm5ld1F1ZXVlSUQgPSB0LmlkO1xyXG4gICAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2tzUXVldWUucHVzaCgkc2NvcGUubmV3UXVldWVJRCk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLm5ld1F1ZXVlID0gdHJhY2s7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUubmV3UXVldWVJRCA9IHRyYWNrLmlkO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIldlIGFyZSBub3QgYWxsb3dlZCB0byBhY2Nlc3MgdHJhY2tzIGJ5IHRoaXMgYXJ0aXN0IHdpdGggdGhlIFNvdW5kY2xvdWQgQVBJLiBXZSBhcG9sb2dpemUgZm9yIHRoZSBpbmNvbnZlbmllbmNlLCBhbmQgd2UgYXJlIHdvcmtpbmcgd2l0aCBTb3VuZGNsb3VkIHRvIHJlc29sdmUgdGhpcyBpc3N1ZS5cIik7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuc2F2ZVVzZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgJGh0dHAucHV0KFwiL2FwaS9kYXRhYmFzZS9wcm9maWxlXCIsICRzY29wZS51c2VyKVxyXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZShyZXMuZGF0YSk7XHJcbiAgICAgICAgICAgICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MoKTtcclxuICAgICAgICAgICAgLy8gJHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJFcnJvcjogZGlkIG5vdCBzYXZlXCIpO1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgJCgnI2F1dG9GaWxsVHJhY2snKS5tb2RhbCgnaGlkZScpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuZ2V0VHJhY2tMaXN0RnJvbVNvdW5kY2xvdWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgcHJvZmlsZSA9ICRzY29wZS51c2VyO1xyXG4gICAgICAgIGlmIChwcm9maWxlLnNvdW5kY2xvdWQpIHtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgICAgIFNDLmdldCgnL3VzZXJzLycgKyBwcm9maWxlLnNvdW5kY2xvdWQuaWQgKyAnL3RyYWNrcycsIHtcclxuICAgICAgICAgICAgICBmaWx0ZXI6ICdwdWJsaWMnXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHRyYWNrcykge1xyXG4gICAgICAgICAgICAgICRzY29wZS50cmFja0xpc3QgPSB0cmFja3M7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5yZW1vdmVRdWV1ZVNvbmcgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICRzY29wZS51c2VyLnF1ZXVlLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgJHNjb3BlLnNhdmVVc2VyKClcclxuICAgICAgICAgIC8vJHNjb3BlLmxvYWRRdWV1ZVNvbmdzKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5sb2FkUXVldWVTb25ncyA9IGZ1bmN0aW9uKHF1ZXVlKSB7XHJcbiAgICAgICAgJHNjb3BlLmF1dG9GaWxsVHJhY2tzID0gW107XHJcbiAgICAgICAgJHNjb3BlLnVzZXIucXVldWUuZm9yRWFjaChmdW5jdGlvbihzb25nSUQpIHtcclxuICAgICAgICAgIFNDLmdldCgnL3RyYWNrcy8nICsgc29uZ0lEKVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbih0cmFjaykge1xyXG4gICAgICAgICAgICAgICRzY29wZS5hdXRvRmlsbFRyYWNrcy5wdXNoKHRyYWNrKTtcclxuICAgICAgICAgICAgICAkc2NvcGUuJGRpZ2VzdCgpO1xyXG4gICAgICAgICAgICB9LCBjb25zb2xlLmxvZyk7XHJcbiAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgICBpZiAoJHNjb3BlLnVzZXIgJiYgJHNjb3BlLnVzZXIucXVldWUpIHtcclxuICAgICAgICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MoKTtcclxuICAgICAgfVxyXG4gICAgICAvL292ZXJsYXkgYXV0b2ZpbGwgdHJhY2sgZW5kLy9cclxuICAgICAgJHNjb3BlLmNsb3NlTW9kYWwgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUubW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgJHNjb3BlLmVkaXRQcm9maWxlTW9kYWxJbnN0YW5jZSA9IHt9O1xyXG4gICAgICAkc2NvcGUuZWRpdFByb2ZpbGVtb2RhbCA9IHt9O1xyXG4gICAgICAkc2NvcGUub3BlbkVkaXRQcm9maWxlTW9kYWwgPSB7XHJcbiAgICAgICAgZWRpdFByb2ZpbGU6IGZ1bmN0aW9uKGZpZWxkKSB7XHJcbiAgICAgICAgICAkc2NvcGUucHJvZmlsZS5maWVsZCA9IGZpZWxkO1xyXG4gICAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5lZGl0UHJvZmlsZU1vZGFsSW5zdGFuY2UgPSAkdWliTW9kYWwub3Blbih7XHJcbiAgICAgICAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxyXG4gICAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnZWRpdFByb2ZpbGUuaHRtbCcsXHJcbiAgICAgICAgICAgICAgY29udHJvbGxlcjogJ0FydGlzdFRvb2xzQ29udHJvbGxlcicsXHJcbiAgICAgICAgICAgICAgc2NvcGU6ICRzY29wZVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0sIDApO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgICRzY29wZS5jbG9zZUVkaXRQcm9maWxlTW9kYWwgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUuc2hvd1Byb2ZpbGVJbmZvKCk7XHJcbiAgICAgICAgaWYgKCRzY29wZS5lZGl0UHJvZmlsZU1vZGFsSW5zdGFuY2UuY2xvc2UpIHtcclxuICAgICAgICAgICRzY29wZS5lZGl0UHJvZmlsZU1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkc2NvcGUudGhhbmtZb3VNb2RhbEluc3RhbmNlID0ge307XHJcbiAgICAgICRzY29wZS50aGFua1lvdU1vZGFsID0ge307XHJcbiAgICAgICRzY29wZS5vcGVuVGhhbmtZb3VNb2RhbCA9IHtcclxuICAgICAgICB0aGFua1lvdTogZnVuY3Rpb24oc3VibWlzc2lvbklEKSB7XHJcbiAgICAgICAgICAkc2NvcGUudGhhbmtZb3VNb2RhbC5zdWJtaXNzaW9uSUQgPSBzdWJtaXNzaW9uSUQ7XHJcbiAgICAgICAgICAkc2NvcGUubW9kYWxJbnN0YW5jZSA9ICR1aWJNb2RhbC5vcGVuKHtcclxuICAgICAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RoYW5rWW91Lmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnT3BlblRoYW5rWW91TW9kYWxDb250cm9sbGVyJyxcclxuICAgICAgICAgICAgc2NvcGU6ICRzY29wZVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICAkc2NvcGUuY2xvc2VUaGFua1lvdU1vZGFsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLnRoYW5rWW91TW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xyXG4gICAgICB9O1xyXG4gICAgICAvKiBJbml0IHByb2ZpbGUgKi9cclxuICAgICAgJHNjb3BlLnByb2ZpbGUgPSB7fTtcclxuICAgICAgaWYgKCRzdGF0ZVBhcmFtcy5zdWJtaXNzaW9uKSB7XHJcbiAgICAgICAgJHNjb3BlLm9wZW5UaGFua1lvdU1vZGFsLnRoYW5rWW91KCRzdGF0ZVBhcmFtcy5zdWJtaXNzaW9uLl9pZCk7XHJcbiAgICAgIH1cclxuICAgICAgJHNjb3BlLnNob3dQcm9maWxlSW5mbyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS5wcm9maWxlLmRhdGEgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgICAgaWYgKCgkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzICYmICRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3MubGVuZ3RoID09PSAwKSB8fCAhJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcykge1xyXG4gICAgICAgICAgJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcyA9IFt7XHJcbiAgICAgICAgICAgIHVybDogJycsXHJcbiAgICAgICAgICAgIGF2YXRhcjogJycsXHJcbiAgICAgICAgICAgIHVzZXJuYW1lOiAnJyxcclxuICAgICAgICAgICAgaWQ6IC0xLFxyXG4gICAgICAgICAgICBwZXJtYW5lbnRMaW5rOiB0cnVlXHJcbiAgICAgICAgICB9XTtcclxuICAgICAgICB9O1xyXG4gICAgICAgICRzY29wZS5wcm9maWxlLmlzQXZhaWxhYmxlID0ge307XHJcbiAgICAgICAgJHNjb3BlLnByb2ZpbGUuaXNBdmFpbGFibGUuZW1haWwgPSAkc2NvcGUucHJvZmlsZS5kYXRhLmVtYWlsID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgICAgICRzY29wZS5wcm9maWxlLmlzQXZhaWxhYmxlLnBhc3N3b3JkID0gJHNjb3BlLnByb2ZpbGUuZGF0YS5wYXNzd29yZCA/IHRydWUgOiBmYWxzZTtcclxuICAgICAgICAkc2NvcGUucHJvZmlsZS5pc0F2YWlsYWJsZS5zb3VuZGNsb3VkID0gJHNjb3BlLnByb2ZpbGUuZGF0YS5zb3VuZGNsb3VkID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgICAgICRzY29wZS5wcm9maWxlLmRhdGEucGFzc3dvcmQgPSAnJztcclxuICAgICAgfTtcclxuXHJcbiAgICAgICRzY29wZS5zYXZlUHJvZmlsZUluZm8gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUubWVzc2FnZSA9IHtcclxuICAgICAgICAgIHZhbHVlOiAnJyxcclxuICAgICAgICAgIHZpc2libGU6IGZhbHNlXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgcGVybWFuZW50TGlua3MgPSAkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzLmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICByZXR1cm4gaXRlbS5pZCAhPT0gLTE7XHJcbiAgICAgICAgfSkubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgIGRlbGV0ZSBpdGVtWyckJGhhc2hLZXknXTtcclxuICAgICAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgICAgIH0pO1xyXG5cclxuICAgICAgICB2YXIgc2VuZE9iaiA9IHtcclxuICAgICAgICAgIG5hbWU6ICcnLFxyXG4gICAgICAgICAgcGFzc3dvcmQ6ICcnLFxyXG4gICAgICAgICAgZW1haWw6ICcnLFxyXG4gICAgICAgICAgcGVybWFuZW50TGlua3M6IEpTT04uc3RyaW5naWZ5KHBlcm1hbmVudExpbmtzKVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoJHNjb3BlLnByb2ZpbGUuZmllbGQgPT09ICduYW1lJykge1xyXG4gICAgICAgICAgc2VuZE9iai5uYW1lID0gJHNjb3BlLnByb2ZpbGUuZGF0YS5uYW1lO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoJHNjb3BlLnByb2ZpbGUuZmllbGQgPT09ICdwYXNzd29yZCcpIHtcclxuICAgICAgICAgIHNlbmRPYmoucGFzc3dvcmQgPSAkc2NvcGUucHJvZmlsZS5kYXRhLnBhc3N3b3JkO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoJHNjb3BlLnByb2ZpbGUuZmllbGQgPT09ICdlbWFpbCcpIHtcclxuICAgICAgICAgIHNlbmRPYmouZW1haWwgPSAkc2NvcGUucHJvZmlsZS5kYXRhLmVtYWlsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAgIEFydGlzdFRvb2xzU2VydmljZVxyXG4gICAgICAgICAgLnNhdmVQcm9maWxlSW5mbyhzZW5kT2JqKVxyXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGlmIChyZXMuZGF0YSA9PT0gJ0VtYWlsIEVycm9yJykge1xyXG4gICAgICAgICAgICAgICRzY29wZS5tZXNzYWdlID0ge1xyXG4gICAgICAgICAgICAgICAgdmFsdWU6ICdFbWFpbCBhbHJlYWR5IGV4aXN0cyEnLFxyXG4gICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZVxyXG4gICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGlmIChwZXJtYW5lbnRMaW5rcyAhPSBcIlwiKSB7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLmxpbmtVcmwgPSBcIlwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZShyZXMuZGF0YSk7XHJcbiAgICAgICAgICAgICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICAgICAgICAgICAkc2NvcGUuY2xvc2VFZGl0UHJvZmlsZU1vZGFsKCk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkLlplYnJhX0RpYWxvZygnZXJyb3Igc2F2aW5nJyk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgIC8vIEFkZCB0aGlyZCBwYXJ0eSBjcmVkZW50aWFsc1xyXG4gICAgICAvLyAkc2NvcGUuYWRkVGhpcmRQYXJ0eURldGFpbHMgPSBmdW5jdGlvbih1c2VyZGF0YSkge1xyXG4gICAgICAvLyAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgLy8gICAkaHR0cC5wdXQoXCIvYXBpL2RhdGFiYXNlL3RoaXJkUGFydHlEZXRhaWxzXCIsIHtcclxuICAgICAgLy8gICAgICAgdXNlcmlkOiAkc2NvcGUudXNlci5faWQsXHJcbiAgICAgIC8vICAgICAgIGRhdGE6IHVzZXJkYXRhXHJcbiAgICAgIC8vICAgICB9KVxyXG4gICAgICAvLyAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAvLyAgICAgaWYocmVzLmRhdGEpe1xyXG4gICAgICAvLyAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUocmVzLmRhdGEpO1xyXG4gICAgICAvLyAgICAgICAkc2NvcGUudXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcclxuICAgICAgLy8gICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgLy8gICAgICAgJC5aZWJyYV9EaWFsb2coXCJDaGFuZ2VzIHNhdmVkIHN1Y2Nlc2Z1bGx5XCIpOyAgXHJcbiAgICAgIC8vICAgICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vICAgICAgICQuWmVicmFfRGlhbG9nKFwiRXJyb3IgaW4gcHJvY2Vzc2luZyB0aGUgcmVxdWVzdC4gUGxlYXNlIHRyeSBhZ2Fpbi5cIik7XHJcbiAgICAgIC8vICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIC8vICAgICB9ICAgXHJcbiAgICAgIC8vICAgfSlcclxuICAgICAgLy8gICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgLy8gICAgICQuWmVicmFfRGlhbG9nKFwiRXJyb3IgaW4gcHJvY2Vzc2luZyB0aGUgcmVxdWVzdC4gUGxlYXNlIHRyeSBhZ2Fpbi5cIik7XHJcbiAgICAgIC8vICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAvLyAgIH0pO1xyXG4gICAgICAvLyB9XHJcblxyXG4gICAgICAvLyBSZW1vdmUgdGhpcmQgcGFydHkgYWNjZXNzIGZyb20gdXNlclxyXG4gICAgICAvLyAkc2NvcGUucmVtb3ZlVGhpcmRQYXJ0eUFjY2VzcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAvLyAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgLy8gICAkaHR0cC5wdXQoXCIvYXBpL2RhdGFiYXNlL2RlbGV0ZVRoaXJkUGFydHlBY2Nlc3NcIiwge1xyXG4gICAgICAvLyAgICAgICB1c2VyaWQ6ICRzY29wZS51c2VyLl9pZFxyXG4gICAgICAvLyAgICAgfSlcclxuICAgICAgLy8gICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgLy8gICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZShyZXMuZGF0YSk7XHJcbiAgICAgIC8vICAgICAkc2NvcGUudXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcclxuICAgICAgLy8gICAgICRzY29wZS50aGlyZFBhcnR5SW5mbyA9ICgkc2NvcGUudXNlci50aGlyZFBhcnR5SW5mbyA/ICRzY29wZS51c2VyLnRoaXJkUGFydHlJbmZvIDogbnVsbCk7XHJcbiAgICAgIC8vICAgICAkc2NvcGUuaGFzVGhpcmRQYXJ0eUZpZWxkcyA9ICgkc2NvcGUudXNlci50aGlyZFBhcnR5SW5mbyA/IHRydWUgOiBmYWxzZSk7XHJcbiAgICAgIC8vICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAvLyAgICAgJC5aZWJyYV9EaWFsb2coXCJBY2NvdW50IHJlbW92ZWQgc3VjY2VzZnVsbHlcIik7ICAgICAgICBcclxuICAgICAgLy8gICB9KVxyXG4gICAgICAvLyAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAvLyAgICAgJC5aZWJyYV9EaWFsb2coXCJFcnJvciBpbiBwcm9jZXNzaW5nIHRoZSByZXF1ZXN0LiBQbGVhc2UgdHJ5IGFnYWluLlwiKTtcclxuICAgICAgLy8gICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIC8vICAgfSk7XHJcbiAgICAgIC8vIH1cclxuXHJcbiAgICAgIC8vIFNhdmUgbGlua2VkIGFjY291bnRzXHJcbiAgICAgIC8vICRzY29wZS5zYXZlTGlua2VkQWNjb3VudCA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgLy8gICBpZiAoJHNjb3BlLmhhc1RoaXJkUGFydHlGaWVsZHMpIHtcclxuICAgICAgLy8gICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgIC8vICAgICAkaHR0cC5wdXQoXCIvYXBpL2RhdGFiYXNlL3NhdmVMaW5rZWRBY2NvdW50XCIsIHtcclxuICAgICAgLy8gICAgICAgICB1c2VyaWQ6ICRzY29wZS51c2VyLl9pZCxcclxuICAgICAgLy8gICAgICAgICBkYXRhOiBkYXRhXHJcbiAgICAgIC8vICAgICAgIH0pXHJcbiAgICAgIC8vICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgIC8vICAgICBpZihyZXMuZGF0YSl7XHJcbiAgICAgIC8vICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZShyZXMuZGF0YSk7XHJcbiAgICAgIC8vICAgICAgICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICAgICAvLyAgICAgICAkcm9vdFNjb3BlLnVzZXJsaW5rZWRBY2NvdW50cyA9ICgkc2NvcGUudXNlci5saW5rZWRBY2NvdW50cyA/ICRzY29wZS51c2VyLmxpbmtlZEFjY291bnRzIDogW10pO1xyXG4gICAgICAvLyAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAvLyAgICAgICAkc2NvcGUubGlua2VkQWNjb3VudERhdGEgPSB7fTtcclxuICAgICAgLy8gICAgICAgJC5aZWJyYV9EaWFsb2coXCJBY2NvdW50IGxpbmtlZCBzdWNjZXNmdWxseVwiKTsgICBcclxuICAgICAgLy8gICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAvLyAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAvLyAgICAgICAkLlplYnJhX0RpYWxvZyhcIk5vIGFjY291bnQgZm91bmQgd2l0aCBnaXZlbiB1c2VybmFtZSBhbmQgcGFzc3dvcmQuXCIpOyAgIFxyXG4gICAgICAvLyAgICAgfSAgIFxyXG4gICAgICAvLyAgIH0pXHJcbiAgICAgIC8vICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgIC8vICAgICAkLlplYnJhX0RpYWxvZyhcIkVycm9yIGluIHByb2Nlc3NpbmcgdGhlIHJlcXVlc3QuIFBsZWFzZSB0cnkgYWdhaW4uXCIpO1xyXG4gICAgICAvLyAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgLy8gICB9KTtcclxuICAgICAgLy8gICB9IGVsc2Uge1xyXG4gICAgICAvLyAgICAgJC5aZWJyYV9EaWFsb2coXCJZb3UgbXVzdCBhZGQgdGhpcmQgcGFydHkgYWNjZXNzIHRvIHRoaXMgYWNjb3VudCB0byBsaW5rIGFub3RoZXIgYWNjb3VudC5cIilcclxuICAgICAgLy8gICB9XHJcbiAgICAgIC8vIH1cclxuXHJcbiAgICAgIC8vIHJlbW92ZSBsaW5rZWQgYWNjb3VudHNcclxuICAgICAgJHNjb3BlLnJlbW92ZUxpbmtlZEFjY291bnQgPSBmdW5jdGlvbihhY2NvdW50KSB7XHJcbiAgICAgICAgJHJvb3RTY29wZS51c2VybGlua2VkQWNjb3VudHMuc3BsaWNlKCRyb290U2NvcGUudXNlcmxpbmtlZEFjY291bnRzLmluZGV4T2YoYWNjb3VudCksIDEpO1xyXG4gICAgICAgICRodHRwLnB1dCgnL2FwaS9kYXRhYmFzZS9uZXR3b3JrYWNjb3VudCcsICRyb290U2NvcGUudXNlcmxpbmtlZEFjY291bnRzKVxyXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUudXNlcmxpbmtlZEFjY291bnRzID0gcmVzLmRhdGEuY2hhbm5lbHM7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUudXNlcmxpbmtlZEFjY291bnRzID0gcmVzLmRhdGEuY2hhbm5lbHM7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUucmVtb3ZlUGVybWFuZW50TGluayA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICRzY29wZS5zYXZlUHJvZmlsZUluZm8oKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgICRzY29wZS5oaWRlYnV0dG9uID0gZmFsc2U7XHJcbiAgICAgICRzY29wZS5hZGRQZXJtYW5lbnRMaW5rID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgICAgIGlmICgkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzLmxlbmd0aCA+PSAyICYmICEkc2NvcGUudXNlci5hZG1pbikge1xyXG4gICAgICAgICAgJHNjb3BlLmhpZGVidXR0b24gPSB0cnVlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3MubGVuZ3RoID4gMiAmJiAhJHNjb3BlLnVzZXIuYWRtaW4pIHtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3MucHVzaCh7XHJcbiAgICAgICAgICB1cmw6ICcnLFxyXG4gICAgICAgICAgYXZhdGFyOiAnJyxcclxuICAgICAgICAgIHVzZXJuYW1lOiAnJyxcclxuICAgICAgICAgIGlkOiAtMSxcclxuICAgICAgICAgIHBlcm1hbmVudExpbms6IHRydWVcclxuICAgICAgICB9KTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgICRzY29wZS5wZXJtYW5lbnRMaW5rVVJMQ2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHBlcm1hbmVudExpbmsgPSB7fTtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgQXJ0aXN0VG9vbHNTZXJ2aWNlXHJcbiAgICAgICAgICAucmVzb2x2ZURhdGEoe1xyXG4gICAgICAgICAgICB1cmw6ICRzY29wZS5saW5rVXJsXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3MucHVzaCh7XHJcbiAgICAgICAgICAgICAgdXJsOiByZXMuZGF0YS5wZXJtYWxpbmtfdXJsLFxyXG4gICAgICAgICAgICAgIGF2YXRhcjogcmVzLmRhdGEuYXZhdGFyX3VybCA/IHJlcy5kYXRhLmF2YXRhcl91cmwgOiAnJyxcclxuICAgICAgICAgICAgICB1c2VybmFtZTogcmVzLmRhdGEudXNlcm5hbWUsXHJcbiAgICAgICAgICAgICAgaWQ6IHJlcy5kYXRhLmlkLFxyXG4gICAgICAgICAgICAgIHBlcm1hbmVudExpbms6IHRydWVcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgICAkLlplYnJhX0RpYWxvZygnQXJ0aXN0cyBub3QgZm91bmQnKTtcclxuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgJHNjb3BlLnNhdmVTb3VuZENsb3VkQWNjb3VudEluZm8gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBTQy5jb25uZWN0KClcclxuICAgICAgICAgIC50aGVuKHNhdmVJbmZvKVxyXG4gICAgICAgICAgLnRoZW4oaGFuZGxlUmVzcG9uc2UpXHJcbiAgICAgICAgICAuY2F0Y2goaGFuZGxlRXJyb3IpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBzYXZlSW5mbyhyZXMpIHtcclxuICAgICAgICAgIHJldHVybiBBcnRpc3RUb29sc1NlcnZpY2Uuc2F2ZVNvdW5kQ2xvdWRBY2NvdW50SW5mbyh7XHJcbiAgICAgICAgICAgIHRva2VuOiByZXMub2F1dGhfdG9rZW5cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UocmVzKSB7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgaWYgKHJlcy5zdGF0dXMgPT09IDIwMCAmJiAocmVzLmRhdGEuc3VjY2VzcyA9PT0gdHJ1ZSkpIHtcclxuICAgICAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlKHJlcy5kYXRhLmRhdGEpO1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvZmlsZS5kYXRhID0gcmVzLmRhdGEuZGF0YTtcclxuICAgICAgICAgICAgJHNjb3BlLnByb2ZpbGUuaXNBdmFpbGFibGUuc291bmRjbG91ZCA9IHRydWU7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkc2NvcGUubWVzc2FnZSA9IHtcclxuICAgICAgICAgICAgICB2YWx1ZTogJ1lvdSBhbHJlYWR5IGhhdmUgYW4gYWNjb3VudCB3aXRoIHRoaXMgc291bmRjbG91ZCB1c2VybmFtZScsXHJcbiAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZVxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyKSB7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgICRzY29wZS5nZXREb3dubG9hZExpc3QgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBBcnRpc3RUb29sc1NlcnZpY2VcclxuICAgICAgICAgIC5nZXREb3dubG9hZExpc3QoKVxyXG4gICAgICAgICAgLnRoZW4oaGFuZGxlUmVzcG9uc2UpXHJcbiAgICAgICAgICAuY2F0Y2goaGFuZGxlRXJyb3IpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVSZXNwb25zZShyZXMpIHtcclxuICAgICAgICAgICRzY29wZS5kb3dubG9hZEdhdGV3YXlMaXN0ID0gcmVzLmRhdGE7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihlcnIpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKGVycilcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkc2NvcGUuZGVsZXRlRG93bmxvYWRHYXRld2F5ID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICBpZiAoY29uZmlybShcIkRvIHlvdSByZWFsbHkgd2FudCB0byBkZWxldGUgdGhpcyB0cmFjaz9cIikpIHtcclxuICAgICAgICAgIHZhciBkb3dubG9hZEdhdGVXYXlJRCA9ICRzY29wZS5kb3dubG9hZEdhdGV3YXlMaXN0W2luZGV4XS5faWQ7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgICBBcnRpc3RUb29sc1NlcnZpY2VcclxuICAgICAgICAgICAgLmRlbGV0ZURvd25sb2FkR2F0ZXdheSh7XHJcbiAgICAgICAgICAgICAgaWQ6IGRvd25sb2FkR2F0ZVdheUlEXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKGhhbmRsZVJlc3BvbnNlKVxyXG4gICAgICAgICAgICAuY2F0Y2goaGFuZGxlRXJyb3IpO1xyXG5cclxuICAgICAgICAgIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlcykge1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkc2NvcGUuZG93bmxvYWRHYXRld2F5TGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKHJlcykge1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgICRzY29wZS5zb3VuZGNsb3VkTG9naW4gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBTQy5jb25uZWN0KClcclxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICBpZiAocmVzLm9hdXRoX3Rva2VuID09IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKS5zb3VuZGNsb3VkLnRva2VuKSB7XHJcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdhbHJlYWR5IGFkZGVkJyk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICRyb290U2NvcGUuYWNjZXNzVG9rZW4gPSByZXMub2F1dGhfdG9rZW47XHJcbiAgICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvbG9naW4vc291bmRDbG91ZEF1dGhlbnRpY2F0aW9uJywge1xyXG4gICAgICAgICAgICAgICAgdG9rZW46IHJlcy5vYXV0aF90b2tlbixcclxuICAgICAgICAgICAgICAgIHBhc3N3b3JkOiAndGVzdCdcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICB2YXIgbGlua2VkQWNjb3VudElEID0gcmVzLmRhdGEudXNlci5faWQ7XHJcbiAgICAgICAgICAgICRodHRwLnBvc3QoXCIvYXBpL2RhdGFiYXNlL25ldHdvcmthY2NvdW50XCIsIHtcclxuICAgICAgICAgICAgICAgIHVzZXJJRDogJHNjb3BlLnVzZXIuX2lkLFxyXG4gICAgICAgICAgICAgICAgbGlua2VkQWNjb3VudElEOiBsaW5rZWRBY2NvdW50SURcclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2cocmVzLmRhdGEubWVzc2FnZSk7XHJcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLnVzZXJsaW5rZWRBY2NvdW50cyA9IHJlcy5kYXRhLmRhdGEuY2hhbm5lbHM7XHJcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgICAgICAgICB9LCAxMDAwKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coJ1BsZWFzZSByZXRyeSBpbiAxIHNlY29uZC4nKTtcclxuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgICAgIH0sIDEwMDApO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkc2NvcGUudmVyaWZ5QnJvd3NlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChuYXZpZ2F0b3IudXNlckFnZW50LnNlYXJjaChcIkNocm9tZVwiKSA9PSAtMSAmJiBuYXZpZ2F0b3IudXNlckFnZW50LnNlYXJjaChcIlNhZmFyaVwiKSAhPSAtMSkge1xyXG4gICAgICAgICAgdmFyIHBvc2l0aW9uID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5zZWFyY2goXCJWZXJzaW9uXCIpICsgODtcclxuICAgICAgICAgIHZhciBlbmQgPSBuYXZpZ2F0b3IudXNlckFnZW50LnNlYXJjaChcIiBTYWZhcmlcIik7XHJcbiAgICAgICAgICB2YXIgdmVyc2lvbiA9IG5hdmlnYXRvci51c2VyQWdlbnQuc3Vic3RyaW5nKHBvc2l0aW9uLCBlbmQpO1xyXG4gICAgICAgICAgaWYgKHBhcnNlSW50KHZlcnNpb24pIDwgOSkge1xyXG4gICAgICAgICAgICAkLlplYnJhX0RpYWxvZygnWW91IGhhdmUgb2xkIHZlcnNpb24gb2Ygc2FmYXJpLiBDbGljayA8YSBocmVmPVwiaHR0cHM6Ly9zdXBwb3J0LmFwcGxlLmNvbS9kb3dubG9hZHMvc2FmYXJpXCI+aGVyZTwvYT4gdG8gZG93bmxvYWQgdGhlIGxhdGVzdCB2ZXJzaW9uIG9mIHNhZmFyaSBmb3IgYmV0dGVyIHNpdGUgZXhwZXJpZW5jZS4nLCB7XHJcbiAgICAgICAgICAgICAgJ3R5cGUnOiAnY29uZmlybWF0aW9uJyxcclxuICAgICAgICAgICAgICAnYnV0dG9ucyc6IFt7XHJcbiAgICAgICAgICAgICAgICBjYXB0aW9uOiAnT0snXHJcbiAgICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgICAgJ29uQ2xvc2UnOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiaHR0cHM6Ly9zdXBwb3J0LmFwcGxlLmNvbS9kb3dubG9hZHMvc2FmYXJpXCI7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5nZXRVc2VyTmV0d29yaygpO1xyXG4gICAgICAkc2NvcGUudmVyaWZ5QnJvd3NlcigpO1xyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcbiJdLCJmaWxlIjoiY29tbW9uL2RpcmVjdGl2ZXMvZG93bmxvYWRHYXRld2F5L2xpc3QuanMifQ==
