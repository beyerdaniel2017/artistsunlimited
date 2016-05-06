  app.config(function($stateProvider) {
    $stateProvider.state('prPlans', {
      url: '/prPlans',
      templateUrl: 'js/prPlans/prPlans.html',
      controller: 'prPlansController'
    });
  });

  app.controller('prPlansController', function($rootScope, $state, $scope, $http,PrPlanService) {
    $scope.prPlans = {};
    $scope.processing = false;
    $scope.openSocialDialog=function(type)
    {
      $.Zebra_Dialog(type);
    }
  	$scope.savePrPlan=function()
  	{
      if (!$scope.prPlans.file || !$scope.prPlans.email || !$scope.prPlans.name || !$scope.prPlans.budget) {
        $.Zebra_Dialog("Please fill in all fields")
      }
      else{
        $scope.processing = true;
        $scope.message.visible = false;
        var data = new FormData();
        for (var prop in $scope.prPlans) {
          data.append(prop, $scope.prPlans[prop]);
        }

        PrPlanService
        .savePrPlan(data)
        .then(receiveResponse)
        .catch(catchError);
      
        function receiveResponse(res) {
          $scope.processing = false;
          if (res.status === 200) {
            $scope.prPlans = {};
            angular.element("input[type='file']").val(null);
            $.Zebra_Dialog("Thank you! Your request has been submitted successfully.");
            return;
          }
          $.Zebra_Dialog("Error in processing the request. Please try again.");
        }

        function catchError(res) {
          $scope.processing = false;
          $.Zebra_Dialog("Error in processing the request. Please try again.");
        }
      }
    }
  });