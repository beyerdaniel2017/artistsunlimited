app.config(function($stateProvider) {
  $stateProvider.state('premiersubmissions', {
    url: '/admin/premiersubmissions',
    templateUrl: 'js/premierSubmissions/views/premierSubmissions.html',
    controller: 'PremierSubmissionController'
  });
});

app.controller('PremierSubmissionController', function($rootScope, $state, $scope, $http, AuthService, SessionService,$sce) {
  $scope.counter = 0;
  $scope.showingElements = [];
  $scope.submissions = [];
  if (!SessionService.getUser()) {
    $state.go('admin');
  }
  $scope.logout = function() {
    $http.get('/api/logout').then(function() {
      SessionService.deleteUser();
      window.location.href = '/admin';
    }).catch(function(err) {
      $scope.processing = false;
      $.Zebra_Dialog('Wrong Password');
    });
  }

  $scope.loadSubmissions = function() {
    $scope.processing = true;
    $http.get('/api/premier/unaccepted')
    .then(function(res) {
      $scope.submissions = res.data;
      $scope.loadMore();
       $scope.processing = false;
    })
    .then(null, function(err) {
      $scope.processing = false;
      $.Zebra_Dialog('Error: No premier submissions found.')
      console.log(err);
    });
  }

  $scope.loadMore = function() {
    var loadElements = [];
    for (let i = $scope.counter; i < $scope.counter + 15; i++) {
      var sub = $scope.submissions[i];
      if (sub) {
        $scope.showingElements.push(sub);
        loadElements.push(sub);
      }
    }
    $scope.counter += 15;
  }

  $scope.accept = function(submi) {
    $scope.processing = true;
    submi.status = "accepted";
    $http.put("/api/premier/accept", submi)
    .then(function(sub) {
      $scope.showingElements.splice($scope.showingElements.indexOf(submi), 1);
      $.Zebra_Dialog("Accepted");
      $scope.processing = false;
    })
    .then(null, function(err) {
      $scope.processing = false;
      $.Zebra_Dialog("ERROR: did not Save")
    })    
  }

  $scope.decline = function(submission) {
    $scope.processing = true;
    submission.status = "declined";
    $http.put('/api/premier/decline',submission)
    .then(function(res) {
      var index = $scope.showingElements.indexOf(submission);
      $scope.showingElements.splice(index, 1);
      $.Zebra_Dialog("Declined");
      $scope.processing = false
    })
    .then(null, function(err) {
      $scope.processing = false;
      $.Zebra_Dialog("ERROR: did not Decline");
    });
  }
});

app.filter('trusted', ['$sce', function ($sce) {
  return function(url) {
    return $sce.trustAsResourceUrl(url);
  };
}]);