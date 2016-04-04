

app.factory('SessionService', ['$cookies', function($cookies) {
	
	function create(data) {
		$cookies.putObject('user', data);
	}

	function deleteUser() {
		$cookies.remove('user');
	}

	function getUser() {
		return $cookies.get('user');
	}

	return {
		create: create,
		deleteUser: deleteUser,
		getUser: getUser
	};
}]);
