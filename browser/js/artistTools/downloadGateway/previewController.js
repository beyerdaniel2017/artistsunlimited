app.config(function($stateProvider) {
    $stateProvider
        .state('artistToolsDownloadGatewayPreview', {
            url: '/artistTools/downloadGateway/preview',
            params: {
                submission: null
            },
            templateUrl: 'js/artistTools/downloadGateway/preview.html',
            controller: 'ArtistToolsPreviewController'
        })
});

app.controller("ArtistToolsPreviewController", function($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, SessionService, ArtistToolsService, DownloadTrackService) {
  $scope.user = SessionService.getUser();
  $scope.recentTracks = [];
    var track = JSON.parse(window.localStorage.getItem('trackPreviewData'));
    if (!track.trackTitle) {
        $.Zebra_Dialog('Track Not Found');
        $state.go("artistToolsDownloadGatewayList");
        return false;
    }

    $scope.track = track;
    $scope.player = {};
    SC.stream('/tracks/' + $scope.track.trackID)
        .then(function(p) {
            $scope.player = p;
        })

    $scope.toggle = true;
    $scope.togglePlay = function() {
        $scope.toggle = !$scope.toggle;
        if ($scope.toggle) {
            $scope.player.pause();
        } else {
            $scope.player.play();
        }
    }
    $scope.nodl = function() {
        $.Zebra_Dialog('No download in preview mode.')
    }

  $scope.getRecentTracks = function(){
    if ($scope.track && $scope.track.showDownloadTracks === 'user') {
      DownloadTrackService.getRecentTracks({
        userID: $scope.track.userid,
        trackID: $scope.track._id
      })
      .then(function(res){
        if ((typeof res === 'object') && res.data) {
          $scope.recentTracks = res.data;
        }
      })
    }
  }

  $scope.getRecentTracks();
});