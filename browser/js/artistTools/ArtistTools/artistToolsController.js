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

app.controller('ArtistToolsController', function($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, SessionService, ArtistToolsService) {})
  .controller('OpenThankYouModalController', function($scope) {})