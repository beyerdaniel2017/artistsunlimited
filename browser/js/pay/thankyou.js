app.config(function($stateProvider) {
  $stateProvider.state('complete', {
    url: '/complete',
    templateUrl: 'js/pay/thankyou.html',
    controller: 'ThankyouController'
  });
});

app.controller('ThankyouController', function($http, $scope, $location) {
  $scope.processing = true;
  $scope.notified = false;
  $http.put('/api/submissions/completedPayment', $location.search())
    .then(function(res) {
      // var trackId = res.data.events[0].event._id; 
      // $scope.submission = res.data.submission;
      // if (res.data.status == 'notify') {
      //   $scope.notified = true;
      //   $scope.events = [];
      // } else {
      //   $scope.events = res.data.events;
      //   $scope.events.forEach(function(ev) {
      //     ev.date = new Date(ev.date);
      //   })
      // }
      console.log(res.data);
      $scope.processing = false;
      window.location.href = location.origin + "/repostevents/" + res.data.username.replace(/ /g, '_') + "/" + res.data.title.replace(/ /g, '_') + "?paid=" + true;
    })
    .then(null, function(err) {
      $.Zebra_Dialog('There was an error processing your request');
    })
});