
app.config(function($stateProvider) {
  $stateProvider.state('download', {
    url: '/download',
    templateUrl: 'js/downloadTrack/views/downloadTrack.html',
    controller: 'DownloadTrackController'
  });
});

app.controller('DownloadTrackController',
	['$rootScope',
		'$state',
		'$scope',
		'$http',
		'$location',
		'DownloadTrackService',
		function($rootScope, $state, $scope, $http, $location, DownloadTrackService) {

			$scope.processing = false;
			$scope.embedTrack = false;
			$scope.trackData = {};	
			$scope.downloadTrack = function() {
				$scope.processing = true;
				var trackId = $location.search().trackid;
				DownloadTrackService
					.getDownloadTrack(trackId)
					.then(receiveDownloadTrack)
					.then(receiveTrackData)
					.catch(catchDownloadTrackError);
		  };

		  function receiveDownloadTrack(result) {
				$scope.track = {
          trackUrl: result.data[0].trackUrl,
          downloadUrl: result.data[0].downloadUrl,
          email: result.data[0].email
        };
       

        return DownloadTrackService.getTrackData($scope.track);
			}

			function receiveTrackData(result) {
				$scope.trackData.trackID = result.data.id;
        $scope.trackData.title = result.data.title;
        $scope.trackData.trackURL = result.data.trackURL;
        SC.oEmbed($scope.trackData.trackURL, {
          element: document.getElementById('scPlayer'),
          auto_play: false,
          maxheight: 150
        });
        $scope.embedTrack = true;
        $scope.processing = false;
			}

			function catchDownloadTrackError() {
		    $scope.processing = false;
		    $scope.embedTrack = false;
			}

}]);