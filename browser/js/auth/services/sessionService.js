app.factory('SessionService', function($cookies, $http) {

	function create(data) {
		$cookies.putObject('user', data);
	}

	function deleteUser() {
		$cookies.remove('user');
	}

	function getUser() {
		var user = $cookies.get('user');
		if (user) {
			return JSON.parse($cookies.get('user'));
		}
	}

	function refreshUser() {
		var curUser = getUser();
		console.log(curUser);
		if (curUser) {
			$http.get('/api/users/byId/' + curUser._id)
				.then(function(res) {
					create(res.data);
				})
		}
	}

	return {
		create: create,
		deleteUser: deleteUser,
		getUser: getUser,
		refreshUser: refreshUser
	};
});