

app.service('HomeService', ['$http', function($http){
	
	function saveApplication(data) {
		return $http.post('/api/home/application', data);
	}

	return {
		saveApplication: saveApplication
	};
}]);
