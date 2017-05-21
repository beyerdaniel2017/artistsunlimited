app.service('accountService', ['$http', function($http) {

	function deleteUserAccount(id) {
		return $http({
				method: 'put',
				url: '/api/database/deleteUserAccount/' + id
			})
			.then(function(response) {
				return response.data;
			});
	}

	return {
		deleteUserAccount: deleteUserAccount
	};
}]);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhY2NvdW50cy9hY2NvdW50U2VydmljZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHAuc2VydmljZSgnYWNjb3VudFNlcnZpY2UnLCBbJyRodHRwJywgZnVuY3Rpb24oJGh0dHApIHtcclxuXHJcblx0ZnVuY3Rpb24gZGVsZXRlVXNlckFjY291bnQoaWQpIHtcclxuXHRcdHJldHVybiAkaHR0cCh7XHJcblx0XHRcdFx0bWV0aG9kOiAncHV0JyxcclxuXHRcdFx0XHR1cmw6ICcvYXBpL2RhdGFiYXNlL2RlbGV0ZVVzZXJBY2NvdW50LycgKyBpZFxyXG5cdFx0XHR9KVxyXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xyXG5cdFx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHJldHVybiB7XHJcblx0XHRkZWxldGVVc2VyQWNjb3VudDogZGVsZXRlVXNlckFjY291bnRcclxuXHR9O1xyXG59XSk7Il0sImZpbGUiOiJhY2NvdW50cy9hY2NvdW50U2VydmljZS5qcyJ9
