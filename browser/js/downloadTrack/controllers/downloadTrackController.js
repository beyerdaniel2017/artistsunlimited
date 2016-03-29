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

		var taskObj = {};
		var track = {};
		var trackData = {};
		$scope.trackData = {
			trackName: 'Mixing and Mastering',
			userName: 'la tropical'
		};
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
				.getDownloadTrack(trackId)
				.then(receiveDownloadTrack)
				.then(receiveTrackData)
				.catch(catchDownloadTrackError);

			function receiveDownloadTrack(result) {
				track = {
					trackURL: result.data.trackUrl,
					downloadURL: result.data.downloadUrl,
					artworkUrl: result.data.artworkURL,
					email: result.data.email
				};
				$scope.blurContainerStyle = function() {
					return {
						'background-image': 'url(' + track.artworkUrl + ')',
						'background-repeat': 'no-repeat',
						'background-size': 'cover'
					}
				}
				// $('.blur-container').css('background-image', 'url(' + track.artworkUrl + ')');
				// $('.blur-container').css('background-repeat', 'no-repeat');
				// $('.blur-container').css('background-size', 'cover');
				$scope.followBoxImageUrl = track.artworkUrl;
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

				$scope.trackData.trackName = result.data.title;
				$scope.trackData.userName = result.data.user.username;

				// SC.oEmbed(trackData.trackURL, {
				// 	element: document.getElementById('scPlayer'),
				// 	auto_play: false,
				// 	maxheight: 150
				// });
				$scope.embedTrack = true;
				$scope.processing = false;
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
				/* Need to intiate download here */

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