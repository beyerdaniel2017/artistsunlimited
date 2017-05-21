app.service('thirdpartyservice', ['$http', function($http) {

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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ0aGlyZHBhcnR5L3RoaXJkcGFydHlzZXJ2aWNlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5zZXJ2aWNlKCd0aGlyZHBhcnR5c2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbigkaHR0cCkge1xuXG5cdGZ1bmN0aW9uIGRlbGV0ZVVzZXJBY2NvdW50KGlkKSB7XG5cdFx0cmV0dXJuICRodHRwKHtcblx0XHRcdFx0bWV0aG9kOiAncHV0Jyxcblx0XHRcdFx0dXJsOiAnL2FwaS9kYXRhYmFzZS9kZWxldGVVc2VyQWNjb3VudC8nICsgaWRcblx0XHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRkZWxldGVVc2VyQWNjb3VudDogZGVsZXRlVXNlckFjY291bnRcblx0fTtcbn1dKTsiXSwiZmlsZSI6InRoaXJkcGFydHkvdGhpcmRwYXJ0eXNlcnZpY2UuanMifQ==
