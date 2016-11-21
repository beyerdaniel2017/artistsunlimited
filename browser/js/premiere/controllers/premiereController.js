app.config(function($stateProvider) {
  $stateProvider.state('premiere', {
    url: '/premiere',
    templateUrl: 'js/premiere/views/premiere.html',
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
    window.location.href = '/LaTropicál/premiere'
    $scope.userID = $location.search().id;
    $scope.genreArray = [
      'Alternative Rock',
      'Ambient',
      'Creative',
      'Chill',
      'Classical',
      'Country',
      'Dance & EDM',
      'Dancehall',
      'Deep House',
      'Disco',
      'Drum & Bass',
      'Dubstep',
      'Electronic',
      'Festival',
      'Folk',
      'Hip-Hop/RNB',
      'House',
      'Indie/Alternative',
      'Latin',
      'Trap',
      'Vocalists/Singer-Songwriter'
    ];

    $scope.premierObj = {};
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
      data.append("userID", $scope.userID);
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
          // if (res.status === 400) {
          //   $scope.message = {
          //     visible: true,
          //     val: res.data
          //   };
          //   return;
          // }
          // $scope.message = {
          //   visible: true,
          //   val: 'Error in processing the request. Please try again or send the submissions to edward@peninsulamgmt.com.'
          // };
      }
    };

    $scope.getUserID = function() {
      if ($scope.userID == undefined) {
        $http.get('/api/users/getUserID')
          .then(function(res) {
            $scope.userID = res.data;
          });
      }
    }
    $scope.getUserID();
  }
]);