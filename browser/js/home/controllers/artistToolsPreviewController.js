app.controller("ArtistToolsPreviewController", ['$rootScope',
    '$state',
    '$stateParams',
    '$scope',
    '$http',
    '$location',
    '$window',
    '$uibModal',
    '$timeout',
    'SessionService',
    'ArtistToolsService',
    function($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, SessionService, ArtistToolsService) {
        var track = JSON.parse(window.localStorage.getItem('trackPreviewData'));
        console.log(track);
        if (!track.trackTitle) {
            alert('Track Not Found');
            $state.go("artistTools.downloadGateway.list");
            return false;
        }

        $scope.track = track;
    }
]);