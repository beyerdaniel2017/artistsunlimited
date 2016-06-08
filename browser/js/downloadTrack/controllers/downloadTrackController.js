app.config(function($stateProvider) {
	$stateProvider.state('download', {
		url: '/download',
		templateUrl: 'js/downloadTrack/views/downloadTrack.view.html',
		controller: 'DownloadTrackController'
	});
});

app.controller('DownloadTrackController', ['$rootScope',
	'$state',
	'$scope',
	'$http',
	'$location',
	'$window',
	'$q',
	'DownloadTrackService',
	function($rootScope, $state, $scope, $http, $location, $window, $q, DownloadTrackService) {

		/* Normal JS vars and functions not bound to scope */
		var playerObj = null;

		/* $scope bindings start */

		$scope.trackData = {
			trackName: 'Mixing and Mastering',
			userName: 'la tropical'
		};
		$scope.toggle = true;
		$scope.togglePlay = function() {
			$scope.toggle = !$scope.toggle;
			if ($scope.toggle) {
				playerObj.pause();
			} else {
				playerObj.play();
			}
		}
		$scope.processing = false;
		$scope.embedTrack = false;
		$scope.downloadURLNotFound = false;
		$scope.errorText = '';
		$scope.followBoxImageUrl = 'assets/images/who-we-are.png';
		$scope.recentTracks = [];

		/* Default processing on page load */

		$scope.getDownloadTrack = function() {

			$scope.processing = true;
			var trackID = $location.search().trackid;
			DownloadTrackService
				.getDownloadTrack(trackID)
				.then(receiveDownloadTrack)
				.then(receiveRecentTracks)
				.then(initPlay)
				.catch(catchDownloadTrackError);

			function receiveDownloadTrack(result) {
				$scope.track = result.data;
				$scope.backgroundStyle = function() {
					return {
						'background-image': 'url(' + $scope.track.trackArtworkURL + ')',
						'background-repeat': 'no-repeat',
						'background-size': 'cover'
					}
				}

				$scope.embedTrack = true;
				$scope.processing = false;

				if ($scope.track.showDownloadTracks === 'user') {
					return DownloadTrackService.getRecentTracks({
						userID: $scope.track.userid,
						trackID: $scope.track._id
					});
				} else {
					return $q.resolve('resolve');
				}
			}

			function receiveRecentTracks(res) {
				if ((typeof res === 'object') && res.data) {
					$scope.recentTracks = res.data;
				}
				return SC.stream('/tracks/' + $scope.track.trackID);
			}

			function initPlay(player) {
				playerObj = player;
			}

			function catchDownloadTrackError() {
				$.Zebra_Dialog('Song Not Found');
				$scope.processing = false;
				$scope.embedTrack = false;
			}
		};


		/* On click download track button */

		$scope.downloadTrack = function() {
			if ($scope.track.comment && !$scope.track.commentText) {
				$.Zebra_Dialog('Please write a comment!');
				return false;
			}
			$scope.processing = true;
			$scope.errorText = '';

			SC.connect()
				.then(performTasks)
				.then(initDownload)
				.catch(catchTasksError)

			function performTasks(res) {
				$scope.track.token = res.oauth_token;
				return DownloadTrackService.performTasks($scope.track);
			}

			function initDownload(res) {
				$scope.processing = false;
				if ($scope.track.downloadURL && $scope.track.downloadURL !== '') {
					$window.location.href = $scope.track.downloadURL;
				} else {
					$scope.errorText = 'Error! Could not fetch download URL';
					$scope.downloadURLNotFound = true;
				}
				$scope.$apply();
			}

			function catchTasksError(err) {
				$.Zebra_Dialog('Error in processing your request');
				$scope.processing = false;
				$scope.$apply();
			}

		};
	}
]);