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
	'DownloadTrackService',
	function($rootScope, $state, $scope, $http, $location, $window, DownloadTrackService) {

		/* Normal JS vars and functions not bound to scope */

		var taskObj = {};
		var track = {};
		var trackData = {};
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
			var trackId = $location.search().trackid;
			DownloadTrackService
				.getConfig()
				.then(initSC)
				.then(fetchDownloadTrack)
				.then(receiveDownloadTrack)
				.then(receiveTrackData)
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
				return DownloadTrackService.getDownloadTrack(trackId);
			}


			function receiveDownloadTrack(result) {
				track = {
					trackURL: result.data.trackUrl,
					downloadURL: result.data.downloadUrl,
					artworkUrl: result.data.artworkURL,
					email: result.data.email
				};
				$scope.backgroundStyle = function() {
					return {
						'background-image': 'url(' + track.artworkUrl + ')',
						'background-repeat': 'no-repeat',
						'background-size': 'cover'
					}
				}
				return DownloadTrackService.getTrackData(track);
			}

			function receiveTrackData(result) {
				trackData = {
					trackID: result.data.id,
					artistID: result.data.user_id,
					title: result.data.title,
					downloadURL: result.data.download_url,
					trackURL: result.data.trackURL
				};
				$scope.followBoxImageUrl = track.artworkUrl;

				$scope.trackData.trackName = result.data.title;
				$scope.trackData.userName = result.data.user.username;

				// SC.oEmbed(trackData.trackURL, {
				// 	element: document.getElementById('scPlayer'),
				// 	auto_play: false,
				// 	maxheight: 150
				// });

				$scope.embedTrack = true;
				$scope.processing = false;

				return SC.stream('/tracks/' + trackData.trackID);
			}

			function initPlay(player) {
				playerObj = player;
				playerObj.play();
			}

			function catchDownloadTrackError() {
				$scope.processing = false;
				$scope.embedTrack = false;
			}
		};


		/* On click download track button */

		$scope.downloadTrack = function() {
			$scope.processing = true;
			$scope.errorText = '';
			$http.get('api/soundcloud/soundcloudConfig')
				.then(function(res) {
					SC.initialize({
						client_id: res.data.clientID,
						redirect_uri: res.data.callbackURL,
						scope: 'non-expiring'
					});
					$scope.clientIDString = res.data.clientID.toString();
					return SC.connect();
				})
				.then(performTasks)
				.then(initDownload)
				.catch(catchTasksError)

			function performTasks(res) {
				taskObj = {
					token: res.oauth_token,
					trackId: trackData.trackID,
					artistId: trackData.artistID
				};
				return DownloadTrackService.performTasks(taskObj);
			}

			function initDownload(res) {

				if (track.downloadURL && track.downloadURL !== '') {
					$window.location.href = track.downloadURL;
				} else if (trackData.downloadURL && taskObj.token) {
					$window.location.href = trackData.downloadURL + '?cliend_id=' + $scope.clientIDString + '&oauth_token=' + taskObj.token.toString();
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