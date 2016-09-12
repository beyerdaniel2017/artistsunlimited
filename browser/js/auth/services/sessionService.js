app.factory('SessionService', function($cookies, $http, $window) {

	function create(data) {
		$window.localStorage.setItem('user', JSON.stringify(data));
	}

	function deleteUser() {
		$window.localStorage.removeItem('user');
		$window.localStorage.removeItem('AdminUser');
		$window.localStorage.removeItem('addActionsfoAccount');
		$window.localStorage.removeItem('addActionsfoAccountIndex');
	}

	function removeAccountusers(){
		$window.localStorage.removeItem('addActionsfoAccount');
		$window.localStorage.removeItem('addActionsfoAccountIndex');
		$window.localStorage.removeItem('AdminUser');	
	}

	function addActionsfoAccount(actions,index) {
		$window.localStorage.setItem('addActionsfoAccount',actions);
		$window.localStorage.setItem('addActionsfoAccountIndex',index);
	}

	function getActionsfoAccount() {
		return $window.localStorage.getItem('addActionsfoAccount');
	}

	function getActionsfoAccountIndex() {
		return $window.localStorage.getItem('addActionsfoAccountIndex');
	}

	function getUser() {
		try {
			var user = JSON.parse($window.localStorage.getItem('user'));
			if (user) {
				return user;
			}
		} catch (e) {}
	}

	function createAdminUser(data) {
		$window.localStorage.setItem('AdminUser', JSON.stringify(data));
	}

	function getAdminUser() {
		try {
			var user = JSON.parse($window.localStorage.getItem('AdminUser'));
			if (user) {
				return user;
			}
		} catch (e) {}
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
		refreshUser: refreshUser,
		createAdminUser: createAdminUser,
		getAdminUser: getAdminUser,
		removeAccountusers:removeAccountusers,
		addActionsfoAccount:addActionsfoAccount,
		getActionsfoAccount:getActionsfoAccount,
		getActionsfoAccountIndex:getActionsfoAccountIndex
	};
});