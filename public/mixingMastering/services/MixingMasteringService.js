app.service('MixingMasteringService', ['$http', function($http){
	function saveMixingMastering(data) {
		return $http({
			method: 'POST',
			url: '/api/mixingmastering',
			headers: {'Content-Type': undefined },
			transformRequest: angular.identity,
			data: data
		});
	}
	return {
		saveMixingMastering: saveMixingMastering
	};
}]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtaXhpbmdNYXN0ZXJpbmcvc2VydmljZXMvTWl4aW5nTWFzdGVyaW5nU2VydmljZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHAuc2VydmljZSgnTWl4aW5nTWFzdGVyaW5nU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbigkaHR0cCl7XHJcblx0ZnVuY3Rpb24gc2F2ZU1peGluZ01hc3RlcmluZyhkYXRhKSB7XHJcblx0XHRyZXR1cm4gJGh0dHAoe1xyXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcclxuXHRcdFx0dXJsOiAnL2FwaS9taXhpbmdtYXN0ZXJpbmcnLFxyXG5cdFx0XHRoZWFkZXJzOiB7J0NvbnRlbnQtVHlwZSc6IHVuZGVmaW5lZCB9LFxyXG5cdFx0XHR0cmFuc2Zvcm1SZXF1ZXN0OiBhbmd1bGFyLmlkZW50aXR5LFxyXG5cdFx0XHRkYXRhOiBkYXRhXHJcblx0XHR9KTtcclxuXHR9XHJcblx0cmV0dXJuIHtcclxuXHRcdHNhdmVNaXhpbmdNYXN0ZXJpbmc6IHNhdmVNaXhpbmdNYXN0ZXJpbmdcclxuXHR9O1xyXG59XSk7XHJcbiJdLCJmaWxlIjoibWl4aW5nTWFzdGVyaW5nL3NlcnZpY2VzL01peGluZ01hc3RlcmluZ1NlcnZpY2UuanMifQ==
