

app.service('DownloadTrackService', ['$http', function($http){
	
	function getDownloadTrack(data) {
		return $http.get('/api/download/track?trackid=' + data);
	}

	function getTrackData(data) {
		return $http.post('/api/soundcloud/soundcloudTrack', { url: data.trackURL });
	}

	function performTasks(data) {
		return $http.post('api/download/tasks', data);
	}

	return {
		getDownloadTrack: getDownloadTrack,
		getTrackData: getTrackData,
		performTasks: performTasks
	};
}]);
