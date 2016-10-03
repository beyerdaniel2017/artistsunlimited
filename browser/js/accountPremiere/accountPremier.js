app.config(function($stateProvider) {
  $stateProvider.state('custompremier', {
    url: '/custompremiere/:username/:submitpart',
    templateUrl: 'js/accountPremiere/accountPremier.view.html',
    controller: 'AccountPremierController',
    resolve: {
      userID : function($stateParams, $http, $window) {
        var username = $stateParams.username;
        var submitpart = $stateParams.submitpart;
        return $http.get('/api/users/getUserByURL/' + username + '/' + submitpart)
        .then(function(res) {
          return res.data;
        })
        .then(null, function(err) {
          $.Zebra_Dialog("error getting your events");
          return;
        })
      },
      customizeSettings: function($http, customizeService, userID) {
        return customizeService.getCustomPageSettings(userID, 'premiere')
        .then(function(response) {
          return response;
        })
        .then(null, function(err) {
          $.Zebra_Dialog("error getting your customize settings");
          return;
        })
      }
    }
  });
});

app.controller('AccountPremierController', function($rootScope, $state, $scope, userID, customizeSettings, $http, customizeService, $location, PremierService) {
  $scope.premierObj = {};
  $scope.customizeSettings = customizeSettings;
  $scope.message = {
    val: '',
    visible: false
  };
  $scope.processing = false;
  $scope.savePremier = function() {
    //$.Zebra_Dialog('This may take a little while.')
    $scope.processing = true;
    $scope.message.visible = false;
    var data = new FormData();
    for (var prop in $scope.premierObj) {
      data.append(prop, $scope.premierObj[prop]);
    }
    data.append("userID", userID);
    PremierService
    .savePremier(data)
    .then(receiveResponse)
    .catch(catchError);

    function receiveResponse(res) {
      $scope.processing = false;
      if (res.status === 200) {
        //$scope.message.visible = true;
        //$scope.message.val = 'Thank you! Your message has been sent successfully.';
        $scope.premierObj = {};
        angular.element("input[type='file']").val(null);
        $.Zebra_Dialog('Thank you! Your message has been sent successfully.')
      } else {
        //$scope.message.visible = true;
        //$scope.message.val = 'Error processing. Please try again or send your track to edward@peninsulamgmt.com.';
        $.Zebra_Dialog('Error processing. Please try again or send your track to edward@peninsulamgmt.com.')
      }
    }

    function catchError(res) {
      $scope.processing = false;
      $.Zebra_Dialog('Error processing. Please try again or send your track to edward@peninsulamgmt.com.')
    }
  };
});