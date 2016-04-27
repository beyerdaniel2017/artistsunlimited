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
          SessionService.create(res.data);
          $scope.closeEditProfileModal();
        })
        .catch(function(res) {
          $scope.processing = false;
          alert('error saving');
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