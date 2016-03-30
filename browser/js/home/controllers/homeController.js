app.config(function($stateProvider) {
	$stateProvider.state('home', {
		url: '/',
		templateUrl: 'js/home/views/home.html',
		controller: 'HomeController'
	});
});

app.controller('HomeController', ['$rootScope',
	'$state',
	'$scope',
	'$http',
	'$location',
	'$window',
  'HomeService',
	function($rootScope, $state, $scope, $http, $location, $window, HomeService) {

    $scope.applicationObj = {};
    $scope.message = {
      application: {
        val: '',
        visible: false
      }
    };

    $scope.saveApplication = function() {
      
      $scope.message.application = {
        val: '',
        visible: false
      };

      if($scope.applicationObj.password !== $scope.applicationObj.confirmPassword) {
        $scope.message.application = {
          val: 'Password and Confirm password do not match',
          visible: true
        };

        return false;
      }
      HomeService
        .saveApplication($scope.applicationObj)
        .then(saveApplicationResponse)
        .catch(saveApplicationError)

      function saveApplicationResponse(res) {
        if(res.status === 200) {
          $scope.applicationObj = {};
          $scope.message.application = {
            val: 'Application submitted successfully!',
            visible: true
          };
        }
      }
      function saveApplicationError() {
        $scope.message.application = {
          val: 'Error in processing your request',
          visible: true
        };
      }
    }
}]);

app.directive('affixer', function ($window) {
  return {
    restrict: 'EA',
    link: function ($scope, $element) {
      var win = angular.element($window);
      var topOffset = $element[0].offsetTop;
      
      function affixElement() {              
          
        if ($window.pageYOffset > topOffset) {
          $element.css('position', 'fixed');
          $element.css('top', '3.5%');
        } else {
          $element.css('position', '');
          $element.css('top', '');
        }
      }
      
      $scope.$on('$routeChangeStart', function() {
         win.unbind('scroll', affixElement);
      });
      win.bind('scroll', affixElement);                        
    }
  };
})