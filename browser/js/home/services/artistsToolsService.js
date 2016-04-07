

app.service('ArtistToolsService', ['$http', function($http){

	function resolveData(data) {
		return $http.post('/api/soundcloud/resolve', data);
	}

	function getDownloadList() {
		return $http.get('/api/database/downloadurl');
	}

	function getDownloadGateway(data) {
		return $http.get('/api/database/downloadurl/' + data.id);
	}

	function saveProfileInfo(data) {
		return $http.post('/api/database/editProfile', data);
	}

	return {
		resolveData: resolveData,
		getDownloadList: getDownloadList,
		getDownloadGateway: getDownloadGateway,
		saveProfileInfo: saveProfileInfo
	};
}]);
