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
				headers: {
					'Content-Type': undefined
				},
				tranformRequest: angular.identify,
				data: fd
			})
			.then(function(response) {
				return response.data;
			});
	}

	function getCustomPageSettings(userID, type) {
		return $http({
				method: 'GET',
				url: '/api/customsubmissions/getCustomSubmission/' + userID + '/' + type
			})
			.then(function(response) {
				return response.data;
			});
	}

	return {
		addCustomize: addCustomize,
		uploadFile: uploadFile,
		getCustomPageSettings: getCustomPageSettings
	};
}]);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjdXN0b21pemVTdWJtaXNzaW9uL2N1c3RvbWl6ZVNlcnZpY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwLnNlcnZpY2UoJ2N1c3RvbWl6ZVNlcnZpY2UnLCBbJyRodHRwJywgZnVuY3Rpb24oJGh0dHApIHtcclxuXHRmdW5jdGlvbiBhZGRDdXN0b21pemUoZGF0YSkge1xyXG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvY3VzdG9tc3VibWlzc2lvbnMvYWRkQ3VzdG9tU3VibWlzc2lvbicsIGRhdGEpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gdXBsb2FkRmlsZShkYXRhKSB7XHJcblx0XHR2YXIgZmQgPSBuZXcgRm9ybURhdGEoKTtcclxuXHRcdGZkLmFwcGVuZCgnZmlsZScsIGRhdGEpO1xyXG5cdFx0cmV0dXJuICRodHRwKHtcclxuXHRcdFx0XHRtZXRob2Q6ICdQT1NUJyxcclxuXHRcdFx0XHR1cmw6ICcvYXBpL2F3cycsXHJcblx0XHRcdFx0aGVhZGVyczoge1xyXG5cdFx0XHRcdFx0J0NvbnRlbnQtVHlwZSc6IHVuZGVmaW5lZFxyXG5cdFx0XHRcdH0sXHJcblx0XHRcdFx0dHJhbmZvcm1SZXF1ZXN0OiBhbmd1bGFyLmlkZW50aWZ5LFxyXG5cdFx0XHRcdGRhdGE6IGZkXHJcblx0XHRcdH0pXHJcblx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcblx0XHRcdH0pO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2V0Q3VzdG9tUGFnZVNldHRpbmdzKHVzZXJJRCwgdHlwZSkge1xyXG5cdFx0cmV0dXJuICRodHRwKHtcclxuXHRcdFx0XHRtZXRob2Q6ICdHRVQnLFxyXG5cdFx0XHRcdHVybDogJy9hcGkvY3VzdG9tc3VibWlzc2lvbnMvZ2V0Q3VzdG9tU3VibWlzc2lvbi8nICsgdXNlcklEICsgJy8nICsgdHlwZVxyXG5cdFx0XHR9KVxyXG5cdFx0XHQudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xyXG5cdFx0XHR9KTtcclxuXHR9XHJcblxyXG5cdHJldHVybiB7XHJcblx0XHRhZGRDdXN0b21pemU6IGFkZEN1c3RvbWl6ZSxcclxuXHRcdHVwbG9hZEZpbGU6IHVwbG9hZEZpbGUsXHJcblx0XHRnZXRDdXN0b21QYWdlU2V0dGluZ3M6IGdldEN1c3RvbVBhZ2VTZXR0aW5nc1xyXG5cdH07XHJcbn1dKTsiXSwiZmlsZSI6ImN1c3RvbWl6ZVN1Ym1pc3Npb24vY3VzdG9taXplU2VydmljZS5qcyJ9
