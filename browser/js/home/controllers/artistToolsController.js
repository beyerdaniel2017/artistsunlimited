  app.config(function($stateProvider) {
      $stateProvider
          .state('artistTools', {
              url: '/artist-tools',
              templateUrl: 'js/home/views/artistTools/artistTools.html',
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
              url: '/profile',
              templateUrl: 'js/home/views/artistTools/profile.html',
              controller: 'ArtistToolsController'
          })
          .state('artistToolsDownloadGatewayList', {
              url: '/download-gateway',
              params: {
                  submission: null
              },
              templateUrl: 'js/home/views/artistTools/downloadGateway.list.html',
              controller: 'ArtistToolsController'
          })
          .state('artistToolsDownloadGatewayAnalytics', {
              url: '/analytics',
              params: {
                  submission: null
              },
              templateUrl: 'js/home/views/artistTools/analytics.html',
              controller: 'artistToolsDownloadGatewayAnalytics'
          });
  });

  app.controller("artistToolsDownloadGatewayAnalytics", function($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, $auth, SessionService, ArtistToolsService) {
      $scope.authFacbook = function(id, days) {
          if (id) { //calling for registration !
              alert("registering Channel, please refresh after few moments to load analytics data");
              return $http({
                  method: 'POST',
                  url: '/api/analytics/facebook',
                  data: {
                      pageid: id.id
                  }
              }).then(function(success) {
                  $scope.showFacebookPages = false;
                  delete $scope.facebookPages;
                  console.log(success);
                  $scope.authFacbook();
              }, function(error) {
                  console.log(error);
              });
          }
          $scope.enableGraph = false;
          $http({
              method: 'POST',
              url: '/api/analytics/facebook',
              data: {
                  day_limit: days
              }
          }).success(function(success_http) {
              $scope.displayError = false;
              $scope.daysCallbackFunction = 'authFacbook';
              $scope.showDayChanger = true;
              $scope.graph_data = success_http;
              $scope.enableGraph = true;
          }).error(function() {
              FB.login(function(response_token, success) {
                  if (!response_token.authResponse) return console.log("User did not authorize fully!");
                  $http({
                      method: 'POST',
                      url: '/api/analytics/facebook',
                      data: {
                          access_token: response_token.authResponse.accessToken
                      }
                  }).success(function(response) {
                      $scope.facebookPages = response.pages;
                      $scope.showFacebookPages = true;
                  }).error(function(error) {
                      alert("Error while registering page :" + error);
                  });
                  //$scope.accessToken = response_token.accessToken;
              }, {
                  scope: 'pages_show_list,user_likes'
              });
          });
      };

      $scope.authTwitter = function(acccess_key, days) {
          $scope.showDayChanger = false;
          $scope.enableGraph = false;
          $http({
              method: 'POST',
              url: '/api/analytics/twitter',
              data: {
                  day_limit: days
              }
          }).then(function(success) {
              $scope.daysCallbackFunction = 'authTwitter';
              $scope.showDayChanger = true;
              $scope.graph_data = success.data;
              $scope.enableGraph = true;
          }, function(failure) {
              $auth.authenticate('twitter').then(function(success_twitter) {
                  $http({
                      method: 'POST',
                      url: '/api/analytics/twitter',
                      data: {
                          access_token_key: success_twitter.data.oauth_token,
                          access_token_secret: success_twitter.data.oauth_token_secret,
                          screen_name: success_twitter.data.screen_name
                      }
                  }).then(function(success) {
                      $scope.showFollowers = false;
                      $scope.authTwitter();
                  }, function(error) {
                      console.log(error);
                  });
              });
          });
      };

      $scope.authInstagram = function(channelId, days) {
          $scope.showDayChanger = false;
          $scope.enableGraph = false;
          $http({
              method: 'POST',
              url: '/api/analytics/instagram',
              data: {
                  day_limit: days
              }
          }).then(function(success) {
              $scope.daysCallbackFunction = 'authInstagram';
              $scope.showDayChanger = true;
              $scope.graph_data = success.data;
              $scope.enableGraph = true;
          }, function(failure) {
              $auth.authenticate('instagram').then(function(success) {
                  $http({
                      method: 'POST',
                      url: '/api/analytics/instagram',
                      data: {
                          access_token: success.access_token
                      }
                  }).then(function(success) {
                      $scope.authInstagram();
                  }, function(failure) {
                      return console.log("<authInstagram>failed when trying to register user" + JSON.stringify(failure));
                  });
              }, function(failure) {
                  console.log("failure while authentication of instagram" + JSON.stringify(failure));
              });
          });
      };

      $scope.authYoutube = function(channelId, days) {
          $scope.showDayChanger = false;
          if (channelId) { //calling for registration !
              alert("registering Channel, please refresh after few moments to load analytics data");
              return $http({
                  method: 'POST',
                  url: '/api/analytics/youtube/stats',
                  data: {
                      register: true,
                      channelId: channelId
                  }
              }).then(function(success) {
                  $scope.showYoutubeChannel = false;
                  delete $scope.youtubeChannel;
                  console.log(success);
                  $scope.authYoutube();
              }, function(error) {
                  console.log(error);
              });
          }
          $scope.enableGraph = false;
          $http({
              method: 'POST',
              url: '/api/analytics/youtube/stats',
              data: {
                  day_limit: days
              }
          }).success(function(success_http) {
              $scope.displayError = false;
              $scope.daysCallbackFunction = 'authYoutube';
              $scope.showDayChanger = true;
              $scope.graph_data = success_http;
              $scope.enableGraph = true;
          }).error(function() {
              $auth.authenticate('google').then(function(success) {
                  $scope.youtubeChannel = success.data;
                  $scope.showYoutubeChannel = true;
              }, function(failure) {
                  console.log("failed from authorization server>>>>" + JSON.stringify(failure));
              });
          });
      };
      $scope.alert = function(data) {
          alert(data);
      };
  });
  app.controller('graphControler', function($scope) {
      // $scope.data = [{
      //     key: "Cumulative Return",
      //     values: value_array
      // }];
      $scope.options = {
          margin: {
              top: 20
          },
          series: [{
              axis: "y",
              dataset: "timed",
              key: "val_0",
              label: "Analytics data",
              color: "hsla(88, 48%, 48%, 1)",
              type: [
                  "line"
              ],
              id: "mySeries0"
          }],
          axes: {
              x: {
                  key: "x",
                  type: "date"
              }
          }
      };
      $scope.data = {
          timed: []
      };
      for (var local_data in $scope.graph_data) {
          $scope.data.timed.push({
              x: local_data,
              val_0: $scope.graph_data[local_data]
          });
      }
      for (var i in $scope.data.timed) {
          $scope.data.timed[i].x = new Date($scope.data.timed[i].x);
      }
  });
  app.controller('ArtistToolsController', function($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, SessionService, ArtistToolsService) {
          $scope.user = JSON.parse(SessionService.getUser());

          /* Init boolean variables for show/hide and other functionalities */

          $scope.processing = false;
          $scope.isTrackAvailable = false;
          $scope.message = {
              val: '',
              visible: false
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

          $scope.logout = function() {
              $http.post('/api/logout').then(function() {
                  SessionService.deleteUser();
                  $state.go('login');
                  window.location.href = '/login';
              });
          };

          console.log($stateParams.submission);
          if ($stateParams.submission) {
              $scope.openThankYouModal.thankYou($stateParams.submission._id);
          }


          $scope.showProfileInfo = function() {
              $scope.profile.data = JSON.parse(SessionService.getUser());
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
                  .then(function(res) {
                      if (res.data === 'Email Error') {
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
      })
      .controller('OpenThankYouModalController', function($scope) {})
