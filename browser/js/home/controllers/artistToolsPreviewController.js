app.config(function($stateProvider) {
    $stateProvider
        .state('artistToolsDownloadGatewayPreview', {
            url: '/download-gateway/preview',
            params: {
                submission: null
            },
            templateUrl: 'js/home/views/artistTools/preview.html',
            controller: 'ArtistToolsPreviewController'
        })
});


app.controller("ArtistToolsPreviewController", function($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, SessionService, ArtistToolsService) {
    var track = JSON.parse(window.localStorage.getItem('trackPreviewData'));
    console.log(track);
    if (!track.trackTitle) {
        alert('Track Not Found');
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
        alert('No download in preview mode.')
    }
});