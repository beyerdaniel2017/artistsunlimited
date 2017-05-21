app.service('PremierService', ['$http', function($http) {

	function savePremier(data) {
		return $http({
			method: 'POST',
			url: '/api/premier',
			headers: {
				'Content-Type': undefined
			},
			transformRequest: angular.identity,
			data: data
		});
	}

	return {
		savePremier: savePremier
	};
}]);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwcmVtaWVyZS9zZXJ2aWNlcy9wcmVtaWVyZVNlcnZpY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwLnNlcnZpY2UoJ1ByZW1pZXJTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKSB7XHJcblxyXG5cdGZ1bmN0aW9uIHNhdmVQcmVtaWVyKGRhdGEpIHtcclxuXHRcdHJldHVybiAkaHR0cCh7XHJcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxyXG5cdFx0XHR1cmw6ICcvYXBpL3ByZW1pZXInLFxyXG5cdFx0XHRoZWFkZXJzOiB7XHJcblx0XHRcdFx0J0NvbnRlbnQtVHlwZSc6IHVuZGVmaW5lZFxyXG5cdFx0XHR9LFxyXG5cdFx0XHR0cmFuc2Zvcm1SZXF1ZXN0OiBhbmd1bGFyLmlkZW50aXR5LFxyXG5cdFx0XHRkYXRhOiBkYXRhXHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHJldHVybiB7XHJcblx0XHRzYXZlUHJlbWllcjogc2F2ZVByZW1pZXJcclxuXHR9O1xyXG59XSk7Il0sImZpbGUiOiJwcmVtaWVyZS9zZXJ2aWNlcy9wcmVtaWVyZVNlcnZpY2UuanMifQ==
