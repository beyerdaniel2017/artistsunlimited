app.directive('dlgate', function($http) {
  return {
    templateUrl: 'js/common/directives/downloadGateway/downloadGateway.html',
    restrict: 'E',
    scope: false,
    controller: function dlGateController($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, SessionService, ArtistToolsService, AdminDLGateService) {
      $scope.showTitle = [];
      $scope.user = SessionService.getUser();
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
        youtube: [],
        twitter: [],
        showDownloadTracks: 'user',
        admin: $scope.user.admin,
        file: {}
      };

      var path = $window.location.pathname;
      $scope.isAdminRoute = false;
      if (path.indexOf("admin/") != -1) {
        $scope.isAdminRoute = true
      } else {
        $scope.isAdminRoute = false;
      }

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
          if (!$scope.$$phase) $scope.$apply();
        }

        function handleError(err) {
          $scope.track.trackID = null;
          $.Zebra_Dialog('Song not found or forbidden');
          $scope.processing = false;
          if (!$scope.$$phase) $scope.$apply();
        }
      };

      $scope.openYoutubeModal = function() {
        $('#youtube').modal('show');
      }

      $scope.removeSMLink = function(index) {
        $scope.track.SMLinks.splice(index, 1);
      };

      $scope.saveDownloadGate = function() {
        if ($scope.track.youtube && $scope.track.youtube.length > 0) {
          $scope.track.socialPlatformValue = $scope.track.youtube.toString();
        } else if ($scope.track.twitter && $scope.track.twitter.length > 0) {
          $scope.track.socialPlatformValue = $scope.track.twitter.toString();
        }

        if (!($scope.track.downloadURL.includes('http') || ($scope.track.file && $scope.track.file.name))) {
          $.Zebra_Dialog('Provide a download file or link (include "http://").');
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
              if ($scope.isAdminRoute) {
                $state.go('adminDownloadGatewayList', {
                  'submission': $stateParams.submission
                });
              } else {
                $state.go('artistToolsDownloadGatewayList', {
                  'submission': $stateParams.submission
                });
              }

            } else {
              if ($scope.user.soundcloud.id == $scope.track.artistID) {
                $.Zebra_Dialog('Download gateway was saved and added to the track.');
              } else {
                $.Zebra_Dialog('Download gateway saved.');
              }
              if ($scope.isAdminRoute) {
                $state.go('adminDownloadGateway');
              } else {
                $state.go('artistToolsDownloadGatewayList');
              }
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
              if (!$scope.$$phase) $scope.$apply();
            })
            .catch(function(response) {
              $scope.processing = false;
              if (!$scope.$$phase) $scope.$apply();
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

      $scope.resolveYoutube = function(youtube) {
        if (!(youtube.includes('/channel/') || youtube.includes('/user/'))) {
          $.Zebra_Dialog('Enter a valid Youtube channel url.');
          return;
        } else {
          var length = $scope.track.youtube.length;
          if ($scope.track.youtube.indexOf(youtube) == -1) {
            $scope.track.youtube[length - 1] = youtube;
          }
        }
      }

      $scope.resolveTwitter = function(twitter) {
        var length = $scope.track.twitter.length;
        if ($scope.track.twitter.indexOf(twitter) == -1) {
          $scope.track.twitter[length - 1] = twitter;
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

      $scope.choseArtist = function(artist) {
        var permanentLink = {};
        $scope.track.artists.push({
          url: artist.permalink_url,
          avatar: artist.avatar_url ? artist.avatar_url : '',
          username: artist.username,
          id: artist.id,
          permanentLink: true
        });
      }
      $scope.chosePlaylist = function(playlist) {
        var permanentLink = {};
        $scope.track.playlists.push({
          url: playlist.permalink_url,
          avatar: playlist.avatar_url ? playlist.avatar_url : '',
          title: playlist.title,
          id: playlist.id,
        });
      }
      $scope.choseTrack = function(item) {
        $scope.searchSelection = [];
        $scope.searchError = undefined;
        $scope.searchString = item.displayName;
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
          if (!$scope.$$phase) $scope.$apply();
        }

        function handleError(err) {
          $scope.track.trackID = null;
          $.Zebra_Dialog('Song not found or forbidden');
          $scope.processing = false;
          if (!$scope.$$phase) $scope.$apply();
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
          $scope.track.youtube = [];
          $scope.track.twitter = [];
          if ($scope.track.socialPlatformValue) {
            if ($scope.track.socialPlatform == 'youtubeSubscribe') {
              if ($scope.track.socialPlatformValue.indexOf(',') > -1) {
                var urls = $scope.track.socialPlatformValue.split(',');
                for (var i = 0; i < urls.length; i++) {
                  $scope.track.youtube.push(urls[i]);
                }
              } else {
                $scope.track.youtube.push($scope.track.socialPlatformValue);
              }
            } else if ($scope.track.socialPlatform == 'twitterFollow') {
              $scope.track.twitter = [];
              if ($scope.track.socialPlatformValue.indexOf(',') > -1) {
                var urls = $scope.track.socialPlatformValue.split(',');
                for (var i = 0; i < urls.length; i++) {
                  $scope.track.twitter.push(urls[i]);
                }
              } else {
                $scope.track.twitter.push($scope.track.socialPlatformValue);
              }
            }
          }


          $scope.searchString = $scope.track.trackTitle;
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
        var url = $scope.isAdminRoute ? $state.href('adminDownloadGatewayPreview') : $state.href('artistToolsDownloadGatewayPreview');
        //var url = $state.href('artistToolsDownloadGatewayPreview');
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

      $scope.addYouTubeUrl = function() {
        $scope.track.youtube.push('');
      }
      $scope.removeYouTubes = function(index) {
        $scope.track.youtube.splice(index, 1);
      }

      $scope.addTwitterUrl = function() {
        $scope.track.twitter.push('');
      }
      $scope.removeTwitter = function(index) {
        $scope.track.twitter.splice(index, 1);
      }
      $scope.getUserNetwork();
      $scope.verifyBrowser();
    }
  }
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24vZGlyZWN0aXZlcy9kb3dubG9hZEdhdGV3YXkvZG93bmxvYWRHYXRld2F5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5kaXJlY3RpdmUoJ2RsZ2F0ZScsIGZ1bmN0aW9uKCRodHRwKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvZG93bmxvYWRHYXRld2F5L2Rvd25sb2FkR2F0ZXdheS5odG1sJyxcclxuICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICBzY29wZTogZmFsc2UsXHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbiBkbEdhdGVDb250cm9sbGVyKCRyb290U2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCAkc2NvcGUsICRodHRwLCAkbG9jYXRpb24sICR3aW5kb3csICR1aWJNb2RhbCwgJHRpbWVvdXQsIFNlc3Npb25TZXJ2aWNlLCBBcnRpc3RUb29sc1NlcnZpY2UsIEFkbWluRExHYXRlU2VydmljZSkge1xyXG4gICAgICAkc2NvcGUuc2hvd1RpdGxlID0gW107XHJcbiAgICAgICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICAgICAkc2NvcGUudHJhY2sgPSB7XHJcbiAgICAgICAgYXJ0aXN0VXNlcm5hbWU6ICcnLFxyXG4gICAgICAgIHRyYWNrVGl0bGU6ICcnLFxyXG4gICAgICAgIHRyYWNrQXJ0d29ya1VSTDogJycsXHJcbiAgICAgICAgU01MaW5rczogW10sXHJcbiAgICAgICAgbGlrZTogZmFsc2UsXHJcbiAgICAgICAgY29tbWVudDogZmFsc2UsXHJcbiAgICAgICAgcmVwb3N0OiBmYWxzZSxcclxuICAgICAgICBhcnRpc3RzOiBbXSxcclxuICAgICAgICBwbGF5bGlzdHM6IFtdLFxyXG4gICAgICAgIHlvdXR1YmU6IFtdLFxyXG4gICAgICAgIHR3aXR0ZXI6IFtdLFxyXG4gICAgICAgIHNob3dEb3dubG9hZFRyYWNrczogJ3VzZXInLFxyXG4gICAgICAgIGFkbWluOiAkc2NvcGUudXNlci5hZG1pbixcclxuICAgICAgICBmaWxlOiB7fVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgdmFyIHBhdGggPSAkd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lO1xyXG4gICAgICAkc2NvcGUuaXNBZG1pblJvdXRlID0gZmFsc2U7XHJcbiAgICAgIGlmIChwYXRoLmluZGV4T2YoXCJhZG1pbi9cIikgIT0gLTEpIHtcclxuICAgICAgICAkc2NvcGUuaXNBZG1pblJvdXRlID0gdHJ1ZVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICRzY29wZS5pc0FkbWluUm91dGUgPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnByb2ZpbGUgPSB7fTtcclxuICAgICAgLyogSW5pdCB0cmFjayBsaXN0IGFuZCB0cmFja0xpc3RPYmoqL1xyXG4gICAgICAkc2NvcGUudHJhY2tMaXN0ID0gW107XHJcbiAgICAgICRzY29wZS50cmFja0xpc3RPYmogPSBudWxsO1xyXG5cclxuICAgICAgLyogTWV0aG9kIGZvciByZXNldHRpbmcgRG93bmxvYWQgR2F0ZXdheSBmb3JtICovXHJcblxyXG4gICAgICAkc2NvcGUudHJhY2tMaXN0Q2hhbmdlID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuXHJcbiAgICAgICAgLyogU2V0IGJvb2xlYW5zICovXHJcblxyXG4gICAgICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gZmFsc2U7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAvKiBTZXQgdHJhY2sgZGF0YSAqL1xyXG5cclxuICAgICAgICB2YXIgdHJhY2sgPSAkc2NvcGUudHJhY2tMaXN0T2JqO1xyXG4gICAgICAgICRzY29wZS50cmFjay50cmFja1VSTCA9IHRyYWNrLnBlcm1hbGlua191cmw7XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrVGl0bGUgPSB0cmFjay50aXRsZTtcclxuICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tJRCA9IHRyYWNrLmlkO1xyXG4gICAgICAgICRzY29wZS50cmFjay5hcnRpc3RJRCA9IHRyYWNrLnVzZXIuaWQ7XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLmRlc2NyaXB0aW9uID0gdHJhY2suZGVzY3JpcHRpb247XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrQXJ0d29ya1VSTCA9IHRyYWNrLmFydHdvcmtfdXJsID8gdHJhY2suYXJ0d29ya191cmwucmVwbGFjZSgnbGFyZ2UuanBnJywgJ3Q1MDB4NTAwLmpwZycpIDogJyc7XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdEFydHdvcmtVUkwgPSB0cmFjay51c2VyLmF2YXRhcl91cmwgPyB0cmFjay51c2VyLmF2YXRhcl91cmwgOiAnJztcclxuICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0VVJMID0gdHJhY2sudXNlci5wZXJtYWxpbmtfdXJsO1xyXG4gICAgICAgICRzY29wZS50cmFjay5hcnRpc3RVc2VybmFtZSA9IHRyYWNrLnVzZXIudXNlcm5hbWU7XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MgPSBbXTtcclxuXHJcbiAgICAgICAgU0MuZ2V0KCcvdXNlcnMvJyArICRzY29wZS50cmFjay5hcnRpc3RJRCArICcvd2ViLXByb2ZpbGVzJylcclxuICAgICAgICAgIC50aGVuKGhhbmRsZVdlYlByb2ZpbGVzKVxyXG4gICAgICAgICAgLmNhdGNoKGhhbmRsZUVycm9yKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlV2ViUHJvZmlsZXMocHJvZmlsZXMpIHtcclxuICAgICAgICAgIHByb2ZpbGVzLmZvckVhY2goZnVuY3Rpb24ocHJvZikge1xyXG4gICAgICAgICAgICBpZiAoWyd0d2l0dGVyJywgJ3lvdXR1YmUnLCAnZmFjZWJvb2snLCAnc3BvdGlmeScsICdzb3VuZGNsb3VkJywgJ2luc3RhZ3JhbSddLmluZGV4T2YocHJvZi5zZXJ2aWNlKSAhPSAtMSkge1xyXG4gICAgICAgICAgICAgICRzY29wZS50cmFjay5TTUxpbmtzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAga2V5OiBwcm9mLnNlcnZpY2UsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogcHJvZi51cmxcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgaWYgKCEkc2NvcGUuJCRwaGFzZSkgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyKSB7XHJcbiAgICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tJRCA9IG51bGw7XHJcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZygnU29uZyBub3QgZm91bmQgb3IgZm9yYmlkZGVuJyk7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgaWYgKCEkc2NvcGUuJCRwaGFzZSkgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgICRzY29wZS5vcGVuWW91dHViZU1vZGFsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJCgnI3lvdXR1YmUnKS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUucmVtb3ZlU01MaW5rID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAkc2NvcGUudHJhY2suU01MaW5rcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgJHNjb3BlLnNhdmVEb3dubG9hZEdhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoJHNjb3BlLnRyYWNrLnlvdXR1YmUgJiYgJHNjb3BlLnRyYWNrLnlvdXR1YmUubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgJHNjb3BlLnRyYWNrLnNvY2lhbFBsYXRmb3JtVmFsdWUgPSAkc2NvcGUudHJhY2sueW91dHViZS50b1N0cmluZygpO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoJHNjb3BlLnRyYWNrLnR3aXR0ZXIgJiYgJHNjb3BlLnRyYWNrLnR3aXR0ZXIubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgJHNjb3BlLnRyYWNrLnNvY2lhbFBsYXRmb3JtVmFsdWUgPSAkc2NvcGUudHJhY2sudHdpdHRlci50b1N0cmluZygpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCEoJHNjb3BlLnRyYWNrLmRvd25sb2FkVVJMLmluY2x1ZGVzKCdodHRwJykgfHwgKCRzY29wZS50cmFjay5maWxlICYmICRzY29wZS50cmFjay5maWxlLm5hbWUpKSkge1xyXG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coJ1Byb3ZpZGUgYSBkb3dubG9hZCBmaWxlIG9yIGxpbmsgKGluY2x1ZGUgXCJodHRwOi8vXCIpLicpO1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCEkc2NvcGUudHJhY2sudHJhY2tJRCkge1xyXG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coJ1RyYWNrIE5vdCBGb3VuZCcpO1xyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgdmFyIHNlbmRPYmogPSBuZXcgRm9ybURhdGEoKTtcclxuICAgICAgICBmb3IgKHZhciBwcm9wIGluICRzY29wZS50cmFjaykge1xyXG4gICAgICAgICAgc2VuZE9iai5hcHBlbmQocHJvcCwgJHNjb3BlLnRyYWNrW3Byb3BdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGFydGlzdHMgPSAkc2NvcGUudHJhY2suYXJ0aXN0cy5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgcmV0dXJuIGl0ZW0uaWQgIT09IC0xO1xyXG4gICAgICAgIH0pLm1hcChmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICBkZWxldGUgaXRlbVsnJCRoYXNoS2V5J107XHJcbiAgICAgICAgICByZXR1cm4gaXRlbTtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgdmFyIHBsYXlsaXN0cyA9ICRzY29wZS50cmFjay5wbGF5bGlzdHMuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgIHJldHVybiBpdGVtLmlkICE9PSAtMTtcclxuICAgICAgICB9KS5tYXAoZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgZGVsZXRlIGl0ZW1bJyQkaGFzaEtleSddO1xyXG4gICAgICAgICAgcmV0dXJuIGl0ZW07XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIHNlbmRPYmouYXBwZW5kKCdhcnRpc3RzJywgSlNPTi5zdHJpbmdpZnkoYXJ0aXN0cykpO1xyXG4gICAgICAgIHZhciBTTUxpbmtzID0ge307XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICBTTUxpbmtzW2l0ZW0ua2V5XSA9IGl0ZW0udmFsdWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2VuZE9iai5hcHBlbmQoJ1NNTGlua3MnLCBKU09OLnN0cmluZ2lmeShTTUxpbmtzKSk7XHJcbiAgICAgICAgaWYgKCRzY29wZS50cmFjay5wbGF5bGlzdHMpIHtcclxuICAgICAgICAgIHNlbmRPYmouYXBwZW5kKCdwbGF5bGlzdHMnLCBKU09OLnN0cmluZ2lmeSgkc2NvcGUudHJhY2sucGxheWxpc3RzKSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgdXJsOiAnL2FwaS9kYXRhYmFzZS9kb3dubG9hZHVybCcsXHJcbiAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiB1bmRlZmluZWRcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgICB0cmFuc2Zvcm1SZXF1ZXN0OiBhbmd1bGFyLmlkZW50aXR5LFxyXG4gICAgICAgICAgZGF0YTogc2VuZE9ialxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJGh0dHAob3B0aW9ucylcclxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpZiAoJHN0YXRlUGFyYW1zLnN1Ym1pc3Npb24pIHtcclxuICAgICAgICAgICAgICBpZiAoJHNjb3BlLmlzQWRtaW5Sb3V0ZSkge1xyXG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhZG1pbkRvd25sb2FkR2F0ZXdheUxpc3QnLCB7XHJcbiAgICAgICAgICAgICAgICAgICdzdWJtaXNzaW9uJzogJHN0YXRlUGFyYW1zLnN1Ym1pc3Npb25cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5TGlzdCcsIHtcclxuICAgICAgICAgICAgICAgICAgJ3N1Ym1pc3Npb24nOiAkc3RhdGVQYXJhbXMuc3VibWlzc2lvblxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBpZiAoJHNjb3BlLnVzZXIuc291bmRjbG91ZC5pZCA9PSAkc2NvcGUudHJhY2suYXJ0aXN0SUQpIHtcclxuICAgICAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKCdEb3dubG9hZCBnYXRld2F5IHdhcyBzYXZlZCBhbmQgYWRkZWQgdG8gdGhlIHRyYWNrLicpO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkLlplYnJhX0RpYWxvZygnRG93bmxvYWQgZ2F0ZXdheSBzYXZlZC4nKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgaWYgKCRzY29wZS5pc0FkbWluUm91dGUpIHtcclxuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnYWRtaW5Eb3dubG9hZEdhdGV3YXknKTtcclxuICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheUxpc3QnKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJFUlJPUjogRXJyb3IgaW4gc2F2aW5nIHVybFwiKTtcclxuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgJHNjb3BlLmNoZWNrSWZFZGl0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKCRzdGF0ZVBhcmFtcy5nYXRld2F5SUQpIHtcclxuICAgICAgICAgICRzY29wZS5nZXREb3dubG9hZEdhdGV3YXkoJHN0YXRlUGFyYW1zLmdhdGV3YXlJRCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgJHNjb3BlLmdldFRyYWNrTGlzdEZyb21Tb3VuZGNsb3VkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHByb2ZpbGUgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgICAgaWYgKHByb2ZpbGUuc291bmRjbG91ZCkge1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgU0MuZ2V0KCcvdXNlcnMvJyArIHByb2ZpbGUuc291bmRjbG91ZC5pZCArICcvdHJhY2tzJywge1xyXG4gICAgICAgICAgICAgIGZpbHRlcjogJ3B1YmxpYydcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24odHJhY2tzKSB7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrTGlzdCA9IHRyYWNrcztcclxuICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIGlmICghJHNjb3BlLiQkcGhhc2UpICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICBpZiAoISRzY29wZS4kJHBoYXNlKSAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmNoZWNrSWZTdWJtaXNzaW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKCRzdGF0ZVBhcmFtcy5zdWJtaXNzaW9uKSB7XHJcbiAgICAgICAgICBpZiAoJHN0YXRlLmluY2x1ZGVzKCdhcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheU5ldycpKSB7XHJcbiAgICAgICAgICAgICRzY29wZS50cmFjay50cmFja1VSTCA9ICRyb290U2NvcGUuc3VibWlzc2lvbi50cmFja1VSTDtcclxuICAgICAgICAgICAgJHNjb3BlLnRyYWNrVVJMQ2hhbmdlKCk7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAkc2NvcGUub3BlblRoYW5rWW91TW9kYWwudGhhbmtZb3UoJHN0YXRlUGFyYW1zLnN1Ym1pc3Npb24uX2lkKTtcclxuICAgICAgICAgICRyb290U2NvcGUuc3VibWlzc2lvbiA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUucmVzb2x2ZVlvdXR1YmUgPSBmdW5jdGlvbih5b3V0dWJlKSB7XHJcbiAgICAgICAgaWYgKCEoeW91dHViZS5pbmNsdWRlcygnL2NoYW5uZWwvJykgfHwgeW91dHViZS5pbmNsdWRlcygnL3VzZXIvJykpKSB7XHJcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZygnRW50ZXIgYSB2YWxpZCBZb3V0dWJlIGNoYW5uZWwgdXJsLicpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB2YXIgbGVuZ3RoID0gJHNjb3BlLnRyYWNrLnlvdXR1YmUubGVuZ3RoO1xyXG4gICAgICAgICAgaWYgKCRzY29wZS50cmFjay55b3V0dWJlLmluZGV4T2YoeW91dHViZSkgPT0gLTEpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnlvdXR1YmVbbGVuZ3RoIC0gMV0gPSB5b3V0dWJlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnJlc29sdmVUd2l0dGVyID0gZnVuY3Rpb24odHdpdHRlcikge1xyXG4gICAgICAgIHZhciBsZW5ndGggPSAkc2NvcGUudHJhY2sudHdpdHRlci5sZW5ndGg7XHJcbiAgICAgICAgaWYgKCRzY29wZS50cmFjay50d2l0dGVyLmluZGV4T2YodHdpdHRlcikgPT0gLTEpIHtcclxuICAgICAgICAgICRzY29wZS50cmFjay50d2l0dGVyW2xlbmd0aCAtIDFdID0gdHdpdHRlcjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS50cmFja1VSTENoYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICgkc2NvcGUudHJhY2sudHJhY2tVUkwgIT09ICcnKSB7XHJcbiAgICAgICAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgQXJ0aXN0VG9vbHNTZXJ2aWNlLnJlc29sdmVEYXRhKHtcclxuICAgICAgICAgICAgdXJsOiAkc2NvcGUudHJhY2sudHJhY2tVUkxcclxuICAgICAgICAgIH0pLnRoZW4oaGFuZGxlVHJhY2tEYXRhQW5kR2V0UHJvZmlsZXMpLnRoZW4oaGFuZGxlV2ViUHJvZmlsZXMpLmNhdGNoKGhhbmRsZUVycm9yKTtcclxuXHJcbiAgICAgICAgICBmdW5jdGlvbiBoYW5kbGVUcmFja0RhdGFBbmRHZXRQcm9maWxlcyhyZXMpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrVGl0bGUgPSByZXMuZGF0YS50aXRsZTtcclxuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrSUQgPSByZXMuZGF0YS5pZDtcclxuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdElEID0gcmVzLmRhdGEudXNlci5pZDtcclxuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLmRlc2NyaXB0aW9uID0gcmVzLmRhdGEuZGVzY3JpcHRpb247XHJcbiAgICAgICAgICAgICRzY29wZS50cmFjay50cmFja0FydHdvcmtVUkwgPSByZXMuZGF0YS5hcnR3b3JrX3VybCA/IHJlcy5kYXRhLmFydHdvcmtfdXJsLnJlcGxhY2UoJ2xhcmdlLmpwZycsICd0NTAweDUwMC5qcGcnKSA6ICcnO1xyXG4gICAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0QXJ0d29ya1VSTCA9IHJlcy5kYXRhLnVzZXIuYXZhdGFyX3VybCA/IHJlcy5kYXRhLnVzZXIuYXZhdGFyX3VybC5yZXBsYWNlKCdsYXJnZS5qcGcnLCAndDUwMHg1MDAuanBnJykgOiAnJztcclxuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdFVSTCA9IHJlcy5kYXRhLnVzZXIucGVybWFsaW5rX3VybDtcclxuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdFVzZXJuYW1lID0gcmVzLmRhdGEudXNlci51c2VybmFtZTtcclxuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MgPSBbXTtcclxuICAgICAgICAgICAgcmV0dXJuIFNDLmdldCgnL3VzZXJzLycgKyAkc2NvcGUudHJhY2suYXJ0aXN0SUQgKyAnL3dlYi1wcm9maWxlcycpO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGZ1bmN0aW9uIGhhbmRsZVdlYlByb2ZpbGVzKHByb2ZpbGVzKSB7XHJcbiAgICAgICAgICAgIHByb2ZpbGVzLmZvckVhY2goZnVuY3Rpb24ocHJvZikge1xyXG4gICAgICAgICAgICAgIGlmIChbJ3R3aXR0ZXInLCAneW91dHViZScsICdmYWNlYm9vaycsICdzcG90aWZ5JywgJ3NvdW5kY2xvdWQnLCAnaW5zdGFncmFtJ10uaW5kZXhPZihwcm9mLnNlcnZpY2UpICE9IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2suU01MaW5rcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAga2V5OiBwcm9mLnNlcnZpY2UsXHJcbiAgICAgICAgICAgICAgICAgIHZhbHVlOiBwcm9mLnVybFxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihlcnIpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrSUQgPSBudWxsO1xyXG4gICAgICAgICAgICAkLlplYnJhX0RpYWxvZygnU29uZyBub3QgZm91bmQgb3IgZm9yYmlkZGVuJyk7XHJcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuU01MaW5rQ2hhbmdlID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICBmdW5jdGlvbiBnZXRMb2NhdGlvbihocmVmKSB7XHJcbiAgICAgICAgICB2YXIgbG9jYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcclxuICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSBocmVmO1xyXG4gICAgICAgICAgaWYgKGxvY2F0aW9uLmhvc3QgPT0gXCJcIikge1xyXG4gICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gbG9jYXRpb24uaHJlZjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBsb2NhdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBsb2NhdGlvbiA9IGdldExvY2F0aW9uKCRzY29wZS50cmFjay5TTUxpbmtzW2luZGV4XS52YWx1ZSk7XHJcbiAgICAgICAgdmFyIGhvc3QgPSBsb2NhdGlvbi5ob3N0bmFtZS5zcGxpdCgnLicpWzBdO1xyXG4gICAgICAgIGlmIChob3N0ID09PSAnd3d3JykgaG9zdCA9IGxvY2F0aW9uLmhvc3RuYW1lLnNwbGl0KCcuJylbMV07XHJcbiAgICAgICAgdmFyIGZpbmRMaW5rID0gJHNjb3BlLnRyYWNrLlNNTGlua3MuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgIHJldHVybiBpdGVtLmtleSA9PT0gaG9zdDtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKGZpbmRMaW5rLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3NbaW5kZXhdLmtleSA9IGhvc3Q7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5hZGRTTUxpbmsgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUudHJhY2suU01MaW5rcy5wdXNoKHtcclxuICAgICAgICAgIGtleTogJycsXHJcbiAgICAgICAgICB2YWx1ZTogJydcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmNsZWFyT3JGaWxlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKCRzY29wZS50cmFjay5kb3dubG9hZFVSTCkge1xyXG4gICAgICAgICAgYW5ndWxhci5lbGVtZW50KFwiaW5wdXRbdHlwZT0nZmlsZSddXCIpLnZhbChudWxsKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5hcnRpc3RVUkxDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgIHZhciBhcnRpc3QgPSB7fTtcclxuICAgICAgICBpZiAoJHNjb3BlLnRyYWNrLmFydGlzdHNbaW5kZXhdLnVybCAhPSBcIlwiKSB7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgICBBcnRpc3RUb29sc1NlcnZpY2UucmVzb2x2ZURhdGEoe1xyXG4gICAgICAgICAgICB1cmw6ICRzY29wZS50cmFjay5hcnRpc3RzW2luZGV4XS51cmxcclxuICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RzW2luZGV4XS5hdmF0YXIgPSByZXMuZGF0YS5hdmF0YXJfdXJsID8gcmVzLmRhdGEuYXZhdGFyX3VybCA6ICcnO1xyXG4gICAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0c1tpbmRleF0udXNlcm5hbWUgPSByZXMuZGF0YS51c2VybmFtZTtcclxuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdHNbaW5kZXhdLmlkID0gcmVzLmRhdGEuaWQ7XHJcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coJ0FydGlzdHMgbm90IGZvdW5kJyk7XHJcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5jaG9zZUFydGlzdCA9IGZ1bmN0aW9uKGFydGlzdCkge1xyXG4gICAgICAgIHZhciBwZXJtYW5lbnRMaW5rID0ge307XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdHMucHVzaCh7XHJcbiAgICAgICAgICB1cmw6IGFydGlzdC5wZXJtYWxpbmtfdXJsLFxyXG4gICAgICAgICAgYXZhdGFyOiBhcnRpc3QuYXZhdGFyX3VybCA/IGFydGlzdC5hdmF0YXJfdXJsIDogJycsXHJcbiAgICAgICAgICB1c2VybmFtZTogYXJ0aXN0LnVzZXJuYW1lLFxyXG4gICAgICAgICAgaWQ6IGFydGlzdC5pZCxcclxuICAgICAgICAgIHBlcm1hbmVudExpbms6IHRydWVcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICAkc2NvcGUuY2hvc2VQbGF5bGlzdCA9IGZ1bmN0aW9uKHBsYXlsaXN0KSB7XHJcbiAgICAgICAgdmFyIHBlcm1hbmVudExpbmsgPSB7fTtcclxuICAgICAgICAkc2NvcGUudHJhY2sucGxheWxpc3RzLnB1c2goe1xyXG4gICAgICAgICAgdXJsOiBwbGF5bGlzdC5wZXJtYWxpbmtfdXJsLFxyXG4gICAgICAgICAgYXZhdGFyOiBwbGF5bGlzdC5hdmF0YXJfdXJsID8gcGxheWxpc3QuYXZhdGFyX3VybCA6ICcnLFxyXG4gICAgICAgICAgdGl0bGU6IHBsYXlsaXN0LnRpdGxlLFxyXG4gICAgICAgICAgaWQ6IHBsYXlsaXN0LmlkLFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgICRzY29wZS5jaG9zZVRyYWNrID0gZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICRzY29wZS5zZWFyY2hTZWxlY3Rpb24gPSBbXTtcclxuICAgICAgICAkc2NvcGUuc2VhcmNoRXJyb3IgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgJHNjb3BlLnNlYXJjaFN0cmluZyA9IGl0ZW0uZGlzcGxheU5hbWU7XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrVGl0bGUgPSBpdGVtLnRpdGxlO1xyXG4gICAgICAgICRzY29wZS50cmFjay50cmFja0lEID0gaXRlbS5pZDtcclxuICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0SUQgPSBpdGVtLnVzZXIuaWQ7XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLmRlc2NyaXB0aW9uID0gaXRlbS5kZXNjcmlwdGlvbjtcclxuICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tBcnR3b3JrVVJMID0gaXRlbS5hcnR3b3JrX3VybCA/IGl0ZW0uYXJ0d29ya191cmwucmVwbGFjZSgnbGFyZ2UuanBnJywgJ3Q1MDB4NTAwLmpwZycpIDogJyc7XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdEFydHdvcmtVUkwgPSBpdGVtLnVzZXIuYXZhdGFyX3VybCA/IGl0ZW0udXNlci5hdmF0YXJfdXJsLnJlcGxhY2UoJ2xhcmdlLmpwZycsICd0NTAweDUwMC5qcGcnKSA6ICcnO1xyXG4gICAgICAgICRzY29wZS50cmFjay5hcnRpc3RVUkwgPSBpdGVtLnVzZXIucGVybWFsaW5rX3VybDtcclxuICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0VXNlcm5hbWUgPSBpdGVtLnVzZXIudXNlcm5hbWU7XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MgPSBbXTtcclxuICAgICAgICBTQy5nZXQoJy91c2Vycy8nICsgJHNjb3BlLnRyYWNrLmFydGlzdElEICsgJy93ZWItcHJvZmlsZXMnKVxyXG4gICAgICAgICAgLnRoZW4oaGFuZGxlV2ViUHJvZmlsZXMpXHJcbiAgICAgICAgICAuY2F0Y2goaGFuZGxlRXJyb3IpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVXZWJQcm9maWxlcyhwcm9maWxlcykge1xyXG4gICAgICAgICAgcHJvZmlsZXMuZm9yRWFjaChmdW5jdGlvbihwcm9mKSB7XHJcbiAgICAgICAgICAgIGlmIChbJ3R3aXR0ZXInLCAneW91dHViZScsICdmYWNlYm9vaycsICdzcG90aWZ5JywgJ3NvdW5kY2xvdWQnLCAnaW5zdGFncmFtJ10uaW5kZXhPZihwcm9mLnNlcnZpY2UpICE9IC0xKSB7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBrZXk6IHByb2Yuc2VydmljZSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBwcm9mLnVybFxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICBpZiAoISRzY29wZS4kJHBoYXNlKSAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihlcnIpIHtcclxuICAgICAgICAgICRzY29wZS50cmFjay50cmFja0lEID0gbnVsbDtcclxuICAgICAgICAgICQuWmVicmFfRGlhbG9nKCdTb25nIG5vdCBmb3VuZCBvciBmb3JiaWRkZW4nKTtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICBpZiAoISRzY29wZS4kJHBoYXNlKSAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUucmVtb3ZlQXJ0aXN0ID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0cy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuYWRkQXJ0aXN0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdHMucHVzaCh7XHJcbiAgICAgICAgICB1cmw6ICcnLFxyXG4gICAgICAgICAgYXZhdGFyOiAnJyxcclxuICAgICAgICAgIHVzZXJuYW1lOiAnJyxcclxuICAgICAgICAgIGlkOiAtMSxcclxuICAgICAgICAgIHBlcm1hbmVudExpbms6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgJHNjb3BlLmFkZFBsYXlsaXN0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLnBsYXlsaXN0cy5wdXNoKHtcclxuICAgICAgICAgIHVybDogJycsXHJcbiAgICAgICAgICBhdmF0YXI6ICcnLFxyXG4gICAgICAgICAgdGl0bGU6ICcnLFxyXG4gICAgICAgICAgaWQ6ICcnXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgICAgJHNjb3BlLnJlbW92ZVBsYXlsaXN0ID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAkc2NvcGUudHJhY2sucGxheWxpc3RzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgIH1cclxuICAgICAgJHNjb3BlLnBsYXlsaXN0VVJMQ2hhbmdlID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgQWRtaW5ETEdhdGVTZXJ2aWNlXHJcbiAgICAgICAgICAucmVzb2x2ZURhdGEoe1xyXG4gICAgICAgICAgICB1cmw6ICRzY29wZS50cmFjay5wbGF5bGlzdHNbaW5kZXhdLnVybFxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAkc2NvcGUudHJhY2sucGxheWxpc3RzW2luZGV4XS5hdmF0YXIgPSByZXMuZGF0YS5hcnR3b3JrX3VybDtcclxuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnBsYXlsaXN0c1tpbmRleF0udGl0bGUgPSByZXMuZGF0YS50aXRsZTtcclxuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnBsYXlsaXN0c1tpbmRleF0uaWQgPSByZXMuZGF0YS5pZDtcclxuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coJ1BsYXlsaXN0IG5vdCBmb3VuZCcpO1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gcmVzZXREb3dubG9hZEdhdGV3YXkoKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICRzY29wZS5tZXNzYWdlID0ge1xyXG4gICAgICAgICAgdmFsOiAnJyxcclxuICAgICAgICAgIHZpc2libGU6IGZhbHNlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLnRyYWNrID0ge1xyXG4gICAgICAgICAgYXJ0aXN0VXNlcm5hbWU6ICcnLFxyXG4gICAgICAgICAgdHJhY2tUaXRsZTogJycsXHJcbiAgICAgICAgICB0cmFja0FydHdvcmtVUkw6ICcnLFxyXG4gICAgICAgICAgU01MaW5rczogW10sXHJcbiAgICAgICAgICBsaWtlOiBmYWxzZSxcclxuICAgICAgICAgIGNvbW1lbnQ6IGZhbHNlLFxyXG4gICAgICAgICAgcmVwb3N0OiBmYWxzZSxcclxuICAgICAgICAgIGFydGlzdHM6IFt7XHJcbiAgICAgICAgICAgIHVybDogJycsXHJcbiAgICAgICAgICAgIGF2YXRhcjogJycsXHJcbiAgICAgICAgICAgIHVzZXJuYW1lOiAnJyxcclxuICAgICAgICAgICAgaWQ6IC0xLFxyXG4gICAgICAgICAgICBwZXJtYW5lbnRMaW5rOiBmYWxzZVxyXG4gICAgICAgICAgfV0sXHJcbiAgICAgICAgICBzaG93RG93bmxvYWRUcmFja3M6ICd1c2VyJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgYW5ndWxhci5lbGVtZW50KFwiaW5wdXRbdHlwZT0nZmlsZSddXCIpLnZhbChudWxsKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLyogTWV0aG9kIGZvciBnZXR0aW5nIERvd25sb2FkR2F0ZXdheSBpbiBjYXNlIG9mIGVkaXQgKi9cclxuXHJcbiAgICAgICRzY29wZS5nZXREb3dubG9hZEdhdGV3YXkgPSBmdW5jdGlvbihkb3dubG9hZEdhdGVXYXlJRCkge1xyXG4gICAgICAgIC8vIHJlc2V0RG93bmxvYWRHYXRld2F5KCk7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAgIEFydGlzdFRvb2xzU2VydmljZVxyXG4gICAgICAgICAgLmdldERvd25sb2FkR2F0ZXdheSh7XHJcbiAgICAgICAgICAgIGlkOiBkb3dubG9hZEdhdGVXYXlJRFxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC50aGVuKGhhbmRsZVJlc3BvbnNlKVxyXG4gICAgICAgICAgLmNhdGNoKGhhbmRsZUVycm9yKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UocmVzKSB7XHJcblxyXG4gICAgICAgICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSB0cnVlO1xyXG4gICAgICAgICAgJHNjb3BlLnRyYWNrID0gcmVzLmRhdGE7XHJcbiAgICAgICAgICAkc2NvcGUudHJhY2sueW91dHViZSA9IFtdO1xyXG4gICAgICAgICAgJHNjb3BlLnRyYWNrLnR3aXR0ZXIgPSBbXTtcclxuICAgICAgICAgIGlmICgkc2NvcGUudHJhY2suc29jaWFsUGxhdGZvcm1WYWx1ZSkge1xyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLnRyYWNrLnNvY2lhbFBsYXRmb3JtID09ICd5b3V0dWJlU3Vic2NyaWJlJykge1xyXG4gICAgICAgICAgICAgIGlmICgkc2NvcGUudHJhY2suc29jaWFsUGxhdGZvcm1WYWx1ZS5pbmRleE9mKCcsJykgPiAtMSkge1xyXG4gICAgICAgICAgICAgICAgdmFyIHVybHMgPSAkc2NvcGUudHJhY2suc29jaWFsUGxhdGZvcm1WYWx1ZS5zcGxpdCgnLCcpO1xyXG4gICAgICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB1cmxzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgICAgICAgICRzY29wZS50cmFjay55b3V0dWJlLnB1c2godXJsc1tpXSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS50cmFjay55b3V0dWJlLnB1c2goJHNjb3BlLnRyYWNrLnNvY2lhbFBsYXRmb3JtVmFsdWUpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmICgkc2NvcGUudHJhY2suc29jaWFsUGxhdGZvcm0gPT0gJ3R3aXR0ZXJGb2xsb3cnKSB7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnR3aXR0ZXIgPSBbXTtcclxuICAgICAgICAgICAgICBpZiAoJHNjb3BlLnRyYWNrLnNvY2lhbFBsYXRmb3JtVmFsdWUuaW5kZXhPZignLCcpID4gLTEpIHtcclxuICAgICAgICAgICAgICAgIHZhciB1cmxzID0gJHNjb3BlLnRyYWNrLnNvY2lhbFBsYXRmb3JtVmFsdWUuc3BsaXQoJywnKTtcclxuICAgICAgICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdXJscy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2sudHdpdHRlci5wdXNoKHVybHNbaV0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2sudHdpdHRlci5wdXNoKCRzY29wZS50cmFjay5zb2NpYWxQbGF0Zm9ybVZhbHVlKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuXHJcblxyXG4gICAgICAgICAgJHNjb3BlLnNlYXJjaFN0cmluZyA9ICRzY29wZS50cmFjay50cmFja1RpdGxlO1xyXG4gICAgICAgICAgdmFyIFNNTGlua3MgPSByZXMuZGF0YS5TTUxpbmtzID8gcmVzLmRhdGEuU01MaW5rcyA6IHt9O1xyXG4gICAgICAgICAgdmFyIHBlcm1hbmVudExpbmtzID0gcmVzLmRhdGEucGVybWFuZW50TGlua3MgPyByZXMuZGF0YS5wZXJtYW5lbnRMaW5rcyA6IFsnJ107XHJcbiAgICAgICAgICB2YXIgU01MaW5rc0FycmF5ID0gW107XHJcbiAgICAgICAgICB2YXIgcGVybWFuZW50TGlua3NBcnJheSA9IFtdO1xyXG5cclxuICAgICAgICAgIGZvciAodmFyIGxpbmsgaW4gU01MaW5rcykge1xyXG4gICAgICAgICAgICBTTUxpbmtzQXJyYXkucHVzaCh7XHJcbiAgICAgICAgICAgICAga2V5OiBsaW5rLFxyXG4gICAgICAgICAgICAgIHZhbHVlOiBTTUxpbmtzW2xpbmtdXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcGVybWFuZW50TGlua3MuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgIHBlcm1hbmVudExpbmtzQXJyYXkucHVzaCh7XHJcbiAgICAgICAgICAgICAgdXJsOiBpdGVtXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGlmICghJHNjb3BlLnRyYWNrLnNob3dEb3dubG9hZFRyYWNrcykge1xyXG4gICAgICAgICAgICAkc2NvcGUudHJhY2suc2hvd0Rvd25sb2FkVHJhY2tzID0gJ3VzZXInO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MgPSBTTUxpbmtzQXJyYXk7XHJcbiAgICAgICAgICAkc2NvcGUudHJhY2sucGVybWFuZW50TGlua3MgPSBwZXJtYW5lbnRMaW5rc0FycmF5O1xyXG4gICAgICAgICAgJHNjb3BlLnRyYWNrLnBsYXlsaXN0SURTID0gW107XHJcbiAgICAgICAgICAvLyAkc2NvcGUudHJhY2suc2hvd0Rvd25sb2FkVHJhY2tzID0gKCRzY29wZS50cmFjay5zaG93RG93bmxvYWRUcmFja3MgPT09ICd1c2VyJykgPyB0cnVlIDogZmFsc2U7XHJcbiAgICAgICAgICAvL2NvbnNvbGUubG9nKCRzY29wZS50cmFjayk7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlRXJyb3IocmVzKSB7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuXHJcbiAgICAgICRzY29wZS5jbGVhck9ySW5wdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUudHJhY2suZG93bmxvYWRVUkwgPSBcIlwiO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUucHJldmlldyA9IGZ1bmN0aW9uKHRyYWNrKSB7XHJcbiAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0cmFja1ByZXZpZXdEYXRhJywgSlNPTi5zdHJpbmdpZnkodHJhY2spKTtcclxuICAgICAgICB2YXIgdXJsID0gJHNjb3BlLmlzQWRtaW5Sb3V0ZSA/ICRzdGF0ZS5ocmVmKCdhZG1pbkRvd25sb2FkR2F0ZXdheVByZXZpZXcnKSA6ICRzdGF0ZS5ocmVmKCdhcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheVByZXZpZXcnKTtcclxuICAgICAgICAvL3ZhciB1cmwgPSAkc3RhdGUuaHJlZignYXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlQcmV2aWV3Jyk7XHJcbiAgICAgICAgJHdpbmRvdy5vcGVuKHVybCwgJ19ibGFuaycpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUudmVyaWZ5QnJvd3NlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChuYXZpZ2F0b3IudXNlckFnZW50LnNlYXJjaChcIkNocm9tZVwiKSA9PSAtMSAmJiBuYXZpZ2F0b3IudXNlckFnZW50LnNlYXJjaChcIlNhZmFyaVwiKSAhPSAtMSkge1xyXG4gICAgICAgICAgdmFyIHBvc2l0aW9uID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5zZWFyY2goXCJWZXJzaW9uXCIpICsgODtcclxuICAgICAgICAgIHZhciBlbmQgPSBuYXZpZ2F0b3IudXNlckFnZW50LnNlYXJjaChcIiBTYWZhcmlcIik7XHJcbiAgICAgICAgICB2YXIgdmVyc2lvbiA9IG5hdmlnYXRvci51c2VyQWdlbnQuc3Vic3RyaW5nKHBvc2l0aW9uLCBlbmQpO1xyXG4gICAgICAgICAgaWYgKHBhcnNlSW50KHZlcnNpb24pIDwgOSkge1xyXG4gICAgICAgICAgICAkLlplYnJhX0RpYWxvZygnWW91IGhhdmUgb2xkIHZlcnNpb24gb2Ygc2FmYXJpLiBDbGljayA8YSBocmVmPVwiaHR0cHM6Ly9zdXBwb3J0LmFwcGxlLmNvbS9kb3dubG9hZHMvc2FmYXJpXCI+aGVyZTwvYT4gdG8gZG93bmxvYWQgdGhlIGxhdGVzdCB2ZXJzaW9uIG9mIHNhZmFyaSBmb3IgYmV0dGVyIHNpdGUgZXhwZXJpZW5jZS4nLCB7XHJcbiAgICAgICAgICAgICAgJ3R5cGUnOiAnY29uZmlybWF0aW9uJyxcclxuICAgICAgICAgICAgICAnYnV0dG9ucyc6IFt7XHJcbiAgICAgICAgICAgICAgICBjYXB0aW9uOiAnT0snXHJcbiAgICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgICAgJ29uQ2xvc2UnOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiaHR0cHM6Ly9zdXBwb3J0LmFwcGxlLmNvbS9kb3dubG9hZHMvc2FmYXJpXCI7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5hZGRZb3VUdWJlVXJsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLnlvdXR1YmUucHVzaCgnJyk7XHJcbiAgICAgIH1cclxuICAgICAgJHNjb3BlLnJlbW92ZVlvdVR1YmVzID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAkc2NvcGUudHJhY2sueW91dHViZS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuYWRkVHdpdHRlclVybCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS50cmFjay50d2l0dGVyLnB1c2goJycpO1xyXG4gICAgICB9XHJcbiAgICAgICRzY29wZS5yZW1vdmVUd2l0dGVyID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAkc2NvcGUudHJhY2sudHdpdHRlci5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICB9XHJcbiAgICAgICRzY29wZS5nZXRVc2VyTmV0d29yaygpO1xyXG4gICAgICAkc2NvcGUudmVyaWZ5QnJvd3NlcigpO1xyXG4gICAgfVxyXG4gIH1cclxufSk7Il0sImZpbGUiOiJjb21tb24vZGlyZWN0aXZlcy9kb3dubG9hZEdhdGV3YXkvZG93bmxvYWRHYXRld2F5LmpzIn0=
