

app.service('DownloadTrackService', ['$http', function($http){
	
	function getDownloadTrack(data) {
		return $http.get('/api/download/track?trackid=' + data);
	}

	function getTrackData(data) {
		return $http({
			"method": "POST", 
			"url": "/api/soundcloud/soundcloudTrack", 
			"data": {
				url: data.trackUrl
			}
		});
	}
	return {
		getDownloadTrack: getDownloadTrack,
		getTrackData: getTrackData
	};
}]);
