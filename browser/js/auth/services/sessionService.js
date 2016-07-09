app.factory('SessionService', function($cookies, $http, $window) {

	function create(data) {
		$window.localStorage.setItem('user', JSON.stringify(data));
	}

	function deleteUser() {
		$window.localStorage.removeItem('user');
	}

	function getUser() {
		if ($window.localStorage.getItem('user')) {
			var user = JSON.parse($window.localStorage.getItem('user'));
		}
		if (user) {
			return user;
		}
	}

	function refreshUser() {
		var curUser = getUser();
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