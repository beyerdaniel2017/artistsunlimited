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
	'AppConfig',
	'DownloadTrackService',
	function($rootScope, $state, $scope, $http, $location, $window, AppConfig, DownloadTrackService) {

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

		/* Default processing on page load */

		$scope.getDownloadTrack = function() {

			$scope.processing = true;
			var trackID = $location.search().trackid;
			AppConfig
				.fetchConfig()
				.then(initSC)
				.then(fetchDownloadTrack)
				.then(receiveDownloadTrack)
				.then(initPlay)
				.catch(catchDownloadTrackError);

			function initSC(res) {
				return SC.initialize({
					client_id: res.data.clientID,
					redirect_uri: res.data.callbackURL,
					scope: 'non-expiring'
				});
			}

			function fetchDownloadTrack() {
				return DownloadTrackService.getDownloadTrack(trackID);
			}

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

				return SC.stream('/tracks/' + $scope.track.trackID);
			}

			function initPlay(player) {
				playerObj = player;
			}

			function catchDownloadTrackError() {
				alert('Song Not Found');
				$scope.processing = false;
				$scope.embedTrack = false;
			}
		};


		/* On click download track button */

		$scope.downloadTrack = function() {
			var appConfig = AppConfig.getConfig();
			if ($scope.track.comment && !$scope.track.commentText) {
				alert('Please write a comment!');
				return false;
			}
			$scope.processing = true;
			$scope.errorText = '';
			SC.initialize({
				client_id: appConfig.clientID,
				redirect_uri: appConfig.callbackURL,
				scope: 'non-expiring'
			});
					
			$scope.clientIDString = appConfig.clientID.toString();
			SC.connect()
				.then(performTasks)
				.then(initDownload)
				.catch(catchTasksError)

			function performTasks(res) {
				$scope.track.token = res.oauth_token;
				return DownloadTrackService.performTasks($scope.track);
			}

			function initDownload(res) {
				if ($scope.track.downloadURL && $scope.track.downloadURL !== '') {
					$window.location.href = $scope.track.downloadURL;
				} else if ($scope.track.downloadURL && $scope.track.token) {
					$window.location.href = trackData.downloadURL + '?cliend_id=' + $scope.clientIDString + '&oauth_token=' + $scope.track.token.toString();
				} else {
					$scope.errorText = 'Error! Could not fetch download URL';
					$scope.downloadURLNotFound = true;
					$scope.$apply();
				}
				$scope.processing = false;
			}

			function catchTasksError(err) {
				alert('Error in processing your request');
				$scope.processing = false;
			}

		};
	}
]);