app.service('DownloadTrackService', ['$http', function($http) {

	function getDownloadTrack(data) {
		return $http.get('/api/download/track?trackID=' + data);
	}

	function getDownloadTrackByUrl(data) {
		return $http.get('/api/download/trackByURL/'+data.username+'/'+data.title);
	}

	function getTrackData(data) {
		return $http.post('/api/soundcloud/resolve', {
			url: data.trackURL
		});
	}

	function performTasks(data) {
		return $http.post('api/download/tasks', data);
	}

	function getRecentTracks(data) {
		return $http.get('/api/download/track/recent?userID=' + data.userID + '&trackID=' + data.trackID);
	}

	return {
		getDownloadTrack: getDownloadTrack,
		getDownloadTrackByUrl: getDownloadTrackByUrl,
		getTrackData: getTrackData,
		performTasks: performTasks,
		getRecentTracks: getRecentTracks
	};
}]);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkb3dubG9hZFRyYWNrL3NlcnZpY2VzL2Rvd25sb2FkVHJhY2tTZXJ2aWNlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5zZXJ2aWNlKCdEb3dubG9hZFRyYWNrU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbigkaHR0cCkge1xyXG5cclxuXHRmdW5jdGlvbiBnZXREb3dubG9hZFRyYWNrKGRhdGEpIHtcclxuXHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZG93bmxvYWQvdHJhY2s/dHJhY2tJRD0nICsgZGF0YSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZXREb3dubG9hZFRyYWNrQnlVcmwoZGF0YSkge1xyXG5cdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS9kb3dubG9hZC90cmFja0J5VVJMLycrZGF0YS51c2VybmFtZSsnLycrZGF0YS50aXRsZSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZXRUcmFja0RhdGEoZGF0YSkge1xyXG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvc291bmRjbG91ZC9yZXNvbHZlJywge1xyXG5cdFx0XHR1cmw6IGRhdGEudHJhY2tVUkxcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcGVyZm9ybVRhc2tzKGRhdGEpIHtcclxuXHRcdHJldHVybiAkaHR0cC5wb3N0KCdhcGkvZG93bmxvYWQvdGFza3MnLCBkYXRhKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldFJlY2VudFRyYWNrcyhkYXRhKSB7XHJcblx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2Rvd25sb2FkL3RyYWNrL3JlY2VudD91c2VySUQ9JyArIGRhdGEudXNlcklEICsgJyZ0cmFja0lEPScgKyBkYXRhLnRyYWNrSUQpO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdGdldERvd25sb2FkVHJhY2s6IGdldERvd25sb2FkVHJhY2ssXHJcblx0XHRnZXREb3dubG9hZFRyYWNrQnlVcmw6IGdldERvd25sb2FkVHJhY2tCeVVybCxcclxuXHRcdGdldFRyYWNrRGF0YTogZ2V0VHJhY2tEYXRhLFxyXG5cdFx0cGVyZm9ybVRhc2tzOiBwZXJmb3JtVGFza3MsXHJcblx0XHRnZXRSZWNlbnRUcmFja3M6IGdldFJlY2VudFRyYWNrc1xyXG5cdH07XHJcbn1dKTsiXSwiZmlsZSI6ImRvd25sb2FkVHJhY2svc2VydmljZXMvZG93bmxvYWRUcmFja1NlcnZpY2UuanMifQ==
