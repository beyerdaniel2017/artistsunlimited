

app.service('HomeService', ['$http', function($http){
	
	function saveApplication(data) {
		return $http.post('/api/home/application', data);
	}

	function saveArtistEmail(data) {
		return $http.post('/api/home/artistemail', data);
	}

	return {
		saveApplication: saveApplication,
		saveArtistEmail: saveArtistEmail
	};
}]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJob21lL3NlcnZpY2VzL2hvbWVTZXJ2aWNlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIlxyXG5cclxuYXBwLnNlcnZpY2UoJ0hvbWVTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKXtcclxuXHRcclxuXHRmdW5jdGlvbiBzYXZlQXBwbGljYXRpb24oZGF0YSkge1xyXG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvaG9tZS9hcHBsaWNhdGlvbicsIGRhdGEpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2F2ZUFydGlzdEVtYWlsKGRhdGEpIHtcclxuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2hvbWUvYXJ0aXN0ZW1haWwnLCBkYXRhKTtcclxuXHR9XHJcblxyXG5cdHJldHVybiB7XHJcblx0XHRzYXZlQXBwbGljYXRpb246IHNhdmVBcHBsaWNhdGlvbixcclxuXHRcdHNhdmVBcnRpc3RFbWFpbDogc2F2ZUFydGlzdEVtYWlsXHJcblx0fTtcclxufV0pO1xyXG4iXSwiZmlsZSI6ImhvbWUvc2VydmljZXMvaG9tZVNlcnZpY2UuanMifQ==
