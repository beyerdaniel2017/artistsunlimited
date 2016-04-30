app.config(function($stateProvider) {
  $stateProvider.state('complete', {
    url: '/complete',
    templateUrl: 'js/pay/thankyou.html',
    controller: 'ThankyouController'
  });
});

app.controller('ThankyouController', function($http, $scope, $location) {
  $scope.processing = true;
  $http.put('/api/submissions/completedPayment', $location.search())
    .then(function(res) {
      $scope.processing = false;
      $scope.submission = res.data.submission;
      $scope.events = res.data.events;
      $scope.events.forEach(function(ev) {
        ev.date = new Date(ev.date);
      })
    })
    .then(null, function(err) {
      $.Zebra_Dialog('There was an error processing your request');
    })
});