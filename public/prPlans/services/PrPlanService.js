app.service('PrPlanService', ['$http', function($http){
	
	function savePrPlan(data) {
		return $http({
			method: 'POST',
			url: '/api/prplan',
			headers: {'Content-Type': undefined },
			transformRequest: angular.identity,
			data: data
		});
	}
	return {
		savePrPlan: savePrPlan
	};
}]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwclBsYW5zL3NlcnZpY2VzL1ByUGxhblNlcnZpY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwLnNlcnZpY2UoJ1ByUGxhblNlcnZpY2UnLCBbJyRodHRwJywgZnVuY3Rpb24oJGh0dHApe1xyXG5cdFxyXG5cdGZ1bmN0aW9uIHNhdmVQclBsYW4oZGF0YSkge1xyXG5cdFx0cmV0dXJuICRodHRwKHtcclxuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXHJcblx0XHRcdHVybDogJy9hcGkvcHJwbGFuJyxcclxuXHRcdFx0aGVhZGVyczogeydDb250ZW50LVR5cGUnOiB1bmRlZmluZWQgfSxcclxuXHRcdFx0dHJhbnNmb3JtUmVxdWVzdDogYW5ndWxhci5pZGVudGl0eSxcclxuXHRcdFx0ZGF0YTogZGF0YVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cdHJldHVybiB7XHJcblx0XHRzYXZlUHJQbGFuOiBzYXZlUHJQbGFuXHJcblx0fTtcclxufV0pO1xyXG4iXSwiZmlsZSI6InByUGxhbnMvc2VydmljZXMvUHJQbGFuU2VydmljZS5qcyJ9
