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
	function($rootScope, $state, $scope, $http, $location, $window) {

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