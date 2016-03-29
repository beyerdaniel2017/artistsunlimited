app.config(function($stateProvider) {
	$stateProvider.state('premier', {
		url: '/premier',
		templateUrl: 'js/premier/views/premier.html',
		controller: 'PremierController'
	});
});

app.controller('PremierController', ['$rootScope',
	'$state',
	'$scope',
	'$http',
	'$location',
	'$window',
  'PremierService',
	function($rootScope, $state, $scope, $http, $location, $window, PremierService) {

    $scope.premierObj = {};

    $scope.message = {
      val: '',
      visible: false
    };
    $scope.savePremier = function() {
      $scope.message.visbile = false;
      var data = new FormData();
      for(var prop in $scope.premierObj) {
        data.append(prop, $scope.premierObj[prop]);
      }
      PremierService
        .savePremier(data)
        .then(receiveResponse)
        .catch(catchError);

      function receiveResponse(res) {
        if(res.status === 200) {
          $scope.message.visible = true;
          $scope.message.val = 'Thank you! Your message has been sent successfully.';
          $scope.premierObj = {};
          angular.element("input[type='file']").val(null);
          return;
        }
        $scope.message.visible = true;
        $scope.message.val = 'Error in processing the request. Please try again.';
      }

      function catchError() {
        $scope.message.visible = true;
        $scope.message.val = 'Error in processing the request. Please try again.';
      }
    };
}]);
