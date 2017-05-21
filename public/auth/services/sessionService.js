app.factory('SessionService', function($cookies, $http, $window, $state) {

	function create(data) {
		console.log(data);
		data.pseudoAvailableSlots = createPseudoAvailableSlots(data);
		$window.localStorage.setItem('user', JSON.stringify(data));
	}

	function deleteUser() {
		$window.localStorage.removeItem('user');
		$window.localStorage.removeItem('AdminUser');
		$window.localStorage.removeItem('addActionsfoAccount');
		$window.localStorage.removeItem('addActionsfoAccountIndex');
		$window.localStorage.removeItem('addActionsfoAccountIndexSRD');
		$window.localStorage.removeItem('soundCloudId');
		$window.localStorage.removeItem('PaidRepostAccounts');
		$window.localStorage.removeItem('isAdminAuthenticate');
	}

	function removeAccountusers() {
		$window.localStorage.removeItem('addActionsfoAccount');
		$window.localStorage.removeItem('addActionsfoAccountIndex');
		$window.localStorage.removeItem('addActionsfoAccountIndexSRD');
		$window.localStorage.removeItem('AdminUser');
		$window.localStorage.removeItem('soundCloudId');
		$window.localStorage.removeItem('PaidRepostAccounts');
	}

	function addActionsfoAccount(actions, index, soundCloudId) {
		$window.localStorage.setItem('addActionsfoAccount', actions);
		$window.localStorage.setItem('addActionsfoAccountIndex', index);
		if (soundCloudId) {
			$window.localStorage.setItem('addActionsfoAccountIndexSRD', index);
			$window.localStorage.setItem('soundCloudId', soundCloudId);
		}
	}

	function removePaidRepostAccounts() {
		$window.localStorage.removeItem('PaidRepostAccounts');
	}

	function getActionsfoAccount() {
		return $window.localStorage.getItem('addActionsfoAccount');
	}

	function getActionsfoAccountIndex() {
		return $window.localStorage.getItem('addActionsfoAccountIndex');
	}

	function addActionsfoAccountIndexSRD() {
		return $window.localStorage.getItem('addActionsfoAccountIndexSRD');
	}

	function getSoundCloudId() {
		return $window.localStorage.getItem('soundCloudId');
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

	function setUserPaidRepostAccounts(data) {
		$window.localStorage.setItem('PaidRepostAccounts', JSON.stringify(data));
	}

	function getUserPaidRepostAccounts(id) {
		if (id != undefined) {
			try {
				var accounts = JSON.parse($window.localStorage.getItem('PaidRepostAccounts'));
				if ((typeof accounts === "object") && (accounts !== null)) {
					return accounts;
				} else {
					var user = accounts.find(function(acc) {
						return acc._id == id;
					});
					console.log("user", user);
					return user;
				}
			} catch (e) {}
		}
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
				}).then(null, function() {
					if (window.location.pathname.indexOf('artistTools') != -1) {
						$window.localStorage.removeItem('user');
						$state.go('login')
					} else if (window.location.pathname.indexOf('admin') != -1) {
						$window.localStorage.removeItem('user');
						$state.go('admin')
					} else {
						$window.localStorage.removeItem('user');
					}

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
		removeAccountusers: removeAccountusers,
		addActionsfoAccount: addActionsfoAccount,
		getActionsfoAccount: getActionsfoAccount,
		getActionsfoAccountIndex: getActionsfoAccountIndex,
		setUserPaidRepostAccounts: setUserPaidRepostAccounts,
		getUserPaidRepostAccounts: getUserPaidRepostAccounts,
		removePaidRepostAccounts: removePaidRepostAccounts,
		getSoundCloudId: getSoundCloudId,
		addActionsfoAccountIndexSRD: addActionsfoAccountIndexSRD
	};
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhdXRoL3NlcnZpY2VzL3Nlc3Npb25TZXJ2aWNlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5mYWN0b3J5KCdTZXNzaW9uU2VydmljZScsIGZ1bmN0aW9uKCRjb29raWVzLCAkaHR0cCwgJHdpbmRvdywgJHN0YXRlKSB7XHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZShkYXRhKSB7XHJcblx0XHRjb25zb2xlLmxvZyhkYXRhKTtcclxuXHRcdGRhdGEucHNldWRvQXZhaWxhYmxlU2xvdHMgPSBjcmVhdGVQc2V1ZG9BdmFpbGFibGVTbG90cyhkYXRhKTtcclxuXHRcdCR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3VzZXInLCBKU09OLnN0cmluZ2lmeShkYXRhKSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkZWxldGVVc2VyKCkge1xyXG5cdFx0JHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndXNlcicpO1xyXG5cdFx0JHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnQWRtaW5Vc2VyJyk7XHJcblx0XHQkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdhZGRBY3Rpb25zZm9BY2NvdW50Jyk7XHJcblx0XHQkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdhZGRBY3Rpb25zZm9BY2NvdW50SW5kZXgnKTtcclxuXHRcdCR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2FkZEFjdGlvbnNmb0FjY291bnRJbmRleFNSRCcpO1xyXG5cdFx0JHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnc291bmRDbG91ZElkJyk7XHJcblx0XHQkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdQYWlkUmVwb3N0QWNjb3VudHMnKTtcclxuXHRcdCR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2lzQWRtaW5BdXRoZW50aWNhdGUnKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHJlbW92ZUFjY291bnR1c2VycygpIHtcclxuXHRcdCR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2FkZEFjdGlvbnNmb0FjY291bnQnKTtcclxuXHRcdCR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2FkZEFjdGlvbnNmb0FjY291bnRJbmRleCcpO1xyXG5cdFx0JHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnYWRkQWN0aW9uc2ZvQWNjb3VudEluZGV4U1JEJyk7XHJcblx0XHQkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdBZG1pblVzZXInKTtcclxuXHRcdCR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3NvdW5kQ2xvdWRJZCcpO1xyXG5cdFx0JHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnUGFpZFJlcG9zdEFjY291bnRzJyk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBhZGRBY3Rpb25zZm9BY2NvdW50KGFjdGlvbnMsIGluZGV4LCBzb3VuZENsb3VkSWQpIHtcclxuXHRcdCR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2FkZEFjdGlvbnNmb0FjY291bnQnLCBhY3Rpb25zKTtcclxuXHRcdCR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2FkZEFjdGlvbnNmb0FjY291bnRJbmRleCcsIGluZGV4KTtcclxuXHRcdGlmIChzb3VuZENsb3VkSWQpIHtcclxuXHRcdFx0JHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYWRkQWN0aW9uc2ZvQWNjb3VudEluZGV4U1JEJywgaW5kZXgpO1xyXG5cdFx0XHQkd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdzb3VuZENsb3VkSWQnLCBzb3VuZENsb3VkSWQpO1xyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcmVtb3ZlUGFpZFJlcG9zdEFjY291bnRzKCkge1xyXG5cdFx0JHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgnUGFpZFJlcG9zdEFjY291bnRzJyk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZXRBY3Rpb25zZm9BY2NvdW50KCkge1xyXG5cdFx0cmV0dXJuICR3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2FkZEFjdGlvbnNmb0FjY291bnQnKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldEFjdGlvbnNmb0FjY291bnRJbmRleCgpIHtcclxuXHRcdHJldHVybiAkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhZGRBY3Rpb25zZm9BY2NvdW50SW5kZXgnKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGFkZEFjdGlvbnNmb0FjY291bnRJbmRleFNSRCgpIHtcclxuXHRcdHJldHVybiAkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhZGRBY3Rpb25zZm9BY2NvdW50SW5kZXhTUkQnKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldFNvdW5kQ2xvdWRJZCgpIHtcclxuXHRcdHJldHVybiAkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdzb3VuZENsb3VkSWQnKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldFVzZXIoKSB7XHJcblx0XHR0cnkge1xyXG5cdFx0XHR2YXIgdXNlciA9IEpTT04ucGFyc2UoJHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndXNlcicpKTtcclxuXHRcdFx0aWYgKHVzZXIpIHtcclxuXHRcdFx0XHRyZXR1cm4gdXNlcjtcclxuXHRcdFx0fVxyXG5cdFx0fSBjYXRjaCAoZSkge31cclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGNyZWF0ZUFkbWluVXNlcihkYXRhKSB7XHJcblx0XHQkd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdBZG1pblVzZXInLCBKU09OLnN0cmluZ2lmeShkYXRhKSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzZXRVc2VyUGFpZFJlcG9zdEFjY291bnRzKGRhdGEpIHtcclxuXHRcdCR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ1BhaWRSZXBvc3RBY2NvdW50cycsIEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldFVzZXJQYWlkUmVwb3N0QWNjb3VudHMoaWQpIHtcclxuXHRcdGlmIChpZCAhPSB1bmRlZmluZWQpIHtcclxuXHRcdFx0dHJ5IHtcclxuXHRcdFx0XHR2YXIgYWNjb3VudHMgPSBKU09OLnBhcnNlKCR3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ1BhaWRSZXBvc3RBY2NvdW50cycpKTtcclxuXHRcdFx0XHRpZiAoKHR5cGVvZiBhY2NvdW50cyA9PT0gXCJvYmplY3RcIikgJiYgKGFjY291bnRzICE9PSBudWxsKSkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIGFjY291bnRzO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHR2YXIgdXNlciA9IGFjY291bnRzLmZpbmQoZnVuY3Rpb24oYWNjKSB7XHJcblx0XHRcdFx0XHRcdHJldHVybiBhY2MuX2lkID09IGlkO1xyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0XHRjb25zb2xlLmxvZyhcInVzZXJcIiwgdXNlcik7XHJcblx0XHRcdFx0XHRyZXR1cm4gdXNlcjtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH0gY2F0Y2ggKGUpIHt9XHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZXRBZG1pblVzZXIoKSB7XHJcblx0XHR0cnkge1xyXG5cdFx0XHR2YXIgdXNlciA9IEpTT04ucGFyc2UoJHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnQWRtaW5Vc2VyJykpO1xyXG5cdFx0XHRpZiAodXNlcikge1xyXG5cdFx0XHRcdHJldHVybiB1c2VyO1xyXG5cdFx0XHR9XHJcblx0XHR9IGNhdGNoIChlKSB7fVxyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcmVmcmVzaFVzZXIoKSB7XHJcblx0XHR2YXIgY3VyVXNlciA9IGdldFVzZXIoKTtcclxuXHRcdGlmIChjdXJVc2VyKSB7XHJcblx0XHRcdCRodHRwLmdldCgnL2FwaS91c2Vycy9ieUlkLycgKyBjdXJVc2VyLl9pZClcclxuXHRcdFx0XHQudGhlbihmdW5jdGlvbihyZXMpIHtcclxuXHRcdFx0XHRcdGNyZWF0ZShyZXMuZGF0YSk7XHJcblx0XHRcdFx0fSkudGhlbihudWxsLCBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuaW5kZXhPZignYXJ0aXN0VG9vbHMnKSAhPSAtMSkge1xyXG5cdFx0XHRcdFx0XHQkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd1c2VyJyk7XHJcblx0XHRcdFx0XHRcdCRzdGF0ZS5nbygnbG9naW4nKVxyXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuaW5kZXhPZignYWRtaW4nKSAhPSAtMSkge1xyXG5cdFx0XHRcdFx0XHQkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd1c2VyJyk7XHJcblx0XHRcdFx0XHRcdCRzdGF0ZS5nbygnYWRtaW4nKVxyXG5cdFx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdFx0JHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndXNlcicpO1xyXG5cdFx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHR9KVxyXG5cdFx0fVxyXG5cdH1cclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdGNyZWF0ZTogY3JlYXRlLFxyXG5cdFx0ZGVsZXRlVXNlcjogZGVsZXRlVXNlcixcclxuXHRcdGdldFVzZXI6IGdldFVzZXIsXHJcblx0XHRyZWZyZXNoVXNlcjogcmVmcmVzaFVzZXIsXHJcblx0XHRjcmVhdGVBZG1pblVzZXI6IGNyZWF0ZUFkbWluVXNlcixcclxuXHRcdGdldEFkbWluVXNlcjogZ2V0QWRtaW5Vc2VyLFxyXG5cdFx0cmVtb3ZlQWNjb3VudHVzZXJzOiByZW1vdmVBY2NvdW50dXNlcnMsXHJcblx0XHRhZGRBY3Rpb25zZm9BY2NvdW50OiBhZGRBY3Rpb25zZm9BY2NvdW50LFxyXG5cdFx0Z2V0QWN0aW9uc2ZvQWNjb3VudDogZ2V0QWN0aW9uc2ZvQWNjb3VudCxcclxuXHRcdGdldEFjdGlvbnNmb0FjY291bnRJbmRleDogZ2V0QWN0aW9uc2ZvQWNjb3VudEluZGV4LFxyXG5cdFx0c2V0VXNlclBhaWRSZXBvc3RBY2NvdW50czogc2V0VXNlclBhaWRSZXBvc3RBY2NvdW50cyxcclxuXHRcdGdldFVzZXJQYWlkUmVwb3N0QWNjb3VudHM6IGdldFVzZXJQYWlkUmVwb3N0QWNjb3VudHMsXHJcblx0XHRyZW1vdmVQYWlkUmVwb3N0QWNjb3VudHM6IHJlbW92ZVBhaWRSZXBvc3RBY2NvdW50cyxcclxuXHRcdGdldFNvdW5kQ2xvdWRJZDogZ2V0U291bmRDbG91ZElkLFxyXG5cdFx0YWRkQWN0aW9uc2ZvQWNjb3VudEluZGV4U1JEOiBhZGRBY3Rpb25zZm9BY2NvdW50SW5kZXhTUkRcclxuXHR9O1xyXG59KTsiXSwiZmlsZSI6ImF1dGgvc2VydmljZXMvc2Vzc2lvblNlcnZpY2UuanMifQ==
