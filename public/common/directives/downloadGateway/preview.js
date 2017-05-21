app.directive('dlpreview', function($http) {
  return {
    templateUrl: 'js/common/directives/downloadGateway/preview.html',
    restrict: 'E',
    scope: false,
    controller: function previewController($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, SessionService, ArtistToolsService, DownloadTrackService) {
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

      $scope.getRecentTracks = function() {
        if ($scope.track && $scope.track.showDownloadTracks === 'user') {
          DownloadTrackService.getRecentTracks({
              userID: $scope.track.userid,
              trackID: $scope.track._id
            })
            .then(function(res) {
              if ((typeof res === 'object') && res.data) {
                $scope.recentTracks = res.data;
              }
            })
        }
      }

      $scope.getRecentTracks();
    }
  }
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24vZGlyZWN0aXZlcy9kb3dubG9hZEdhdGV3YXkvcHJldmlldy5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHAuZGlyZWN0aXZlKCdkbHByZXZpZXcnLCBmdW5jdGlvbigkaHR0cCkge1xyXG4gIHJldHVybiB7XHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL2Rvd25sb2FkR2F0ZXdheS9wcmV2aWV3Lmh0bWwnLFxyXG4gICAgcmVzdHJpY3Q6ICdFJyxcclxuICAgIHNjb3BlOiBmYWxzZSxcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIHByZXZpZXdDb250cm9sbGVyKCRyb290U2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCAkc2NvcGUsICRodHRwLCAkbG9jYXRpb24sICR3aW5kb3csICR1aWJNb2RhbCwgJHRpbWVvdXQsIFNlc3Npb25TZXJ2aWNlLCBBcnRpc3RUb29sc1NlcnZpY2UsIERvd25sb2FkVHJhY2tTZXJ2aWNlKSB7XHJcbiAgICAgICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICAgICAkc2NvcGUucmVjZW50VHJhY2tzID0gW107XHJcbiAgICAgIHZhciB0cmFjayA9IEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0cmFja1ByZXZpZXdEYXRhJykpO1xyXG4gICAgICBpZiAoIXRyYWNrLnRyYWNrVGl0bGUpIHtcclxuICAgICAgICAkLlplYnJhX0RpYWxvZygnVHJhY2sgTm90IEZvdW5kJyk7XHJcbiAgICAgICAgJHN0YXRlLmdvKFwiYXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlMaXN0XCIpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnRyYWNrID0gdHJhY2s7XHJcbiAgICAgICRzY29wZS5wbGF5ZXIgPSB7fTtcclxuICAgICAgU0Muc3RyZWFtKCcvdHJhY2tzLycgKyAkc2NvcGUudHJhY2sudHJhY2tJRClcclxuICAgICAgICAudGhlbihmdW5jdGlvbihwKSB7XHJcbiAgICAgICAgICAkc2NvcGUucGxheWVyID0gcDtcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgJHNjb3BlLnRvZ2dsZSA9IHRydWU7XHJcbiAgICAgICRzY29wZS50b2dnbGVQbGF5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLnRvZ2dsZSA9ICEkc2NvcGUudG9nZ2xlO1xyXG4gICAgICAgIGlmICgkc2NvcGUudG9nZ2xlKSB7XHJcbiAgICAgICAgICAkc2NvcGUucGxheWVyLnBhdXNlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICRzY29wZS5wbGF5ZXIucGxheSgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICAkc2NvcGUubm9kbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQuWmVicmFfRGlhbG9nKCdObyBkb3dubG9hZCBpbiBwcmV2aWV3IG1vZGUuJylcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmdldFJlY2VudFRyYWNrcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICgkc2NvcGUudHJhY2sgJiYgJHNjb3BlLnRyYWNrLnNob3dEb3dubG9hZFRyYWNrcyA9PT0gJ3VzZXInKSB7XHJcbiAgICAgICAgICBEb3dubG9hZFRyYWNrU2VydmljZS5nZXRSZWNlbnRUcmFja3Moe1xyXG4gICAgICAgICAgICAgIHVzZXJJRDogJHNjb3BlLnRyYWNrLnVzZXJpZCxcclxuICAgICAgICAgICAgICB0cmFja0lEOiAkc2NvcGUudHJhY2suX2lkXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgIGlmICgodHlwZW9mIHJlcyA9PT0gJ29iamVjdCcpICYmIHJlcy5kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUucmVjZW50VHJhY2tzID0gcmVzLmRhdGE7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmdldFJlY2VudFRyYWNrcygpO1xyXG4gICAgfVxyXG4gIH1cclxufSk7Il0sImZpbGUiOiJjb21tb24vZGlyZWN0aXZlcy9kb3dubG9hZEdhdGV3YXkvcHJldmlldy5qcyJ9
