app.service('customizeService', ['$http', function($http) {
	function addCustomize(data) {
		return $http.post('/api/customsubmissions/addCustomSubmission', data);
	}
  	function uploadFile(data) {
		var fd = new FormData();
		fd.append('file', data);
		return $http({
			method: 'POST',
			url: '/api/aws',
			headers: {'Content-Type': undefined },
			tranformRequest: angular.identify,
			data: fd
		})
		.then(function (response){
			console.log("service res",response);
			return response.data;
		});
	}
	function getCustomPageSettings(userID){
		return $http({
			method: 'GET',
			url: '/api/customsubmissions/getCustomSubmission/'+userID
		})
		.then(function (response){
			return response.data;
		});
	}

	return {
		addCustomize: addCustomize,
		uploadFile:uploadFile,
		getCustomPageSettings: getCustomPageSettings
	};
}]);