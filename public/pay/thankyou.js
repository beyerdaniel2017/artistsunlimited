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
      console.log(res.data);
      $scope.processing = false;
      window.location.href = res.data.link;
    })
    .then(null, function(err) {
      $scope.processing = false;
      $.Zebra_Dialog(err.data);
    })
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwYXkvdGhhbmt5b3UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdjb21wbGV0ZScsIHtcclxuICAgIHVybDogJy9jb21wbGV0ZScsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL3BheS90aGFua3lvdS5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdUaGFua3lvdUNvbnRyb2xsZXInXHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ1RoYW5reW91Q29udHJvbGxlcicsIGZ1bmN0aW9uKCRodHRwLCAkc2NvcGUsICRsb2NhdGlvbikge1xyXG4gICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAkc2NvcGUubm90aWZpZWQgPSBmYWxzZTtcclxuICAkaHR0cC5wdXQoJy9hcGkvc3VibWlzc2lvbnMvY29tcGxldGVkUGF5bWVudCcsICRsb2NhdGlvbi5zZWFyY2goKSlcclxuICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICBjb25zb2xlLmxvZyhyZXMuZGF0YSk7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gcmVzLmRhdGEubGluaztcclxuICAgIH0pXHJcbiAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgJC5aZWJyYV9EaWFsb2coZXJyLmRhdGEpO1xyXG4gICAgfSlcclxufSk7Il0sImZpbGUiOiJwYXkvdGhhbmt5b3UuanMifQ==
