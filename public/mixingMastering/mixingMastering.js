app.config(function($stateProvider) {
  $stateProvider.state('mixingMastering', {
    url: '/mixingMastering',
    templateUrl: 'js/mixingMastering/mixingMastering.html',
    controller: 'mixingMasteringController'
  });
});

app.controller('mixingMasteringController', function($rootScope, $state, $scope, $http, MixingMasteringService) {
  $scope.mixingMastering = {};
  $scope.processing = false;
  $scope.saveMixingMastering = function() {
    if (!$scope.mixingMastering.file || !$scope.mixingMastering.email || !$scope.mixingMastering.name || !$scope.mixingMastering.comment) {
      $.Zebra_Dialog("Please fill in all fields")
    } 
    else 
    {
      $scope.processing = true;
      $scope.message.visible = false;
      var data = new FormData();
      for (var prop in $scope.mixingMastering) {
        data.append(prop, $scope.mixingMastering[prop]);
      }

      MixingMasteringService
      .saveMixingMastering(data)
      .then(receiveResponse)
      .catch(catchError);

      function receiveResponse(res) {
        $scope.processing = false;
        if (res.status === 200) {
          $scope.mixingMastering = {};
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJtaXhpbmdNYXN0ZXJpbmcvbWl4aW5nTWFzdGVyaW5nLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbWl4aW5nTWFzdGVyaW5nJywge1xyXG4gICAgdXJsOiAnL21peGluZ01hc3RlcmluZycsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL21peGluZ01hc3RlcmluZy9taXhpbmdNYXN0ZXJpbmcuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnbWl4aW5nTWFzdGVyaW5nQ29udHJvbGxlcidcclxuICB9KTtcclxufSk7XHJcblxyXG5hcHAuY29udHJvbGxlcignbWl4aW5nTWFzdGVyaW5nQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgTWl4aW5nTWFzdGVyaW5nU2VydmljZSkge1xyXG4gICRzY29wZS5taXhpbmdNYXN0ZXJpbmcgPSB7fTtcclxuICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICRzY29wZS5zYXZlTWl4aW5nTWFzdGVyaW5nID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoISRzY29wZS5taXhpbmdNYXN0ZXJpbmcuZmlsZSB8fCAhJHNjb3BlLm1peGluZ01hc3RlcmluZy5lbWFpbCB8fCAhJHNjb3BlLm1peGluZ01hc3RlcmluZy5uYW1lIHx8ICEkc2NvcGUubWl4aW5nTWFzdGVyaW5nLmNvbW1lbnQpIHtcclxuICAgICAgJC5aZWJyYV9EaWFsb2coXCJQbGVhc2UgZmlsbCBpbiBhbGwgZmllbGRzXCIpXHJcbiAgICB9IFxyXG4gICAgZWxzZSBcclxuICAgIHtcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAkc2NvcGUubWVzc2FnZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIHZhciBkYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICAgIGZvciAodmFyIHByb3AgaW4gJHNjb3BlLm1peGluZ01hc3RlcmluZykge1xyXG4gICAgICAgIGRhdGEuYXBwZW5kKHByb3AsICRzY29wZS5taXhpbmdNYXN0ZXJpbmdbcHJvcF0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBNaXhpbmdNYXN0ZXJpbmdTZXJ2aWNlXHJcbiAgICAgIC5zYXZlTWl4aW5nTWFzdGVyaW5nKGRhdGEpXHJcbiAgICAgIC50aGVuKHJlY2VpdmVSZXNwb25zZSlcclxuICAgICAgLmNhdGNoKGNhdGNoRXJyb3IpO1xyXG5cclxuICAgICAgZnVuY3Rpb24gcmVjZWl2ZVJlc3BvbnNlKHJlcykge1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKHJlcy5zdGF0dXMgPT09IDIwMCkge1xyXG4gICAgICAgICAgJHNjb3BlLm1peGluZ01hc3RlcmluZyA9IHt9O1xyXG4gICAgICAgICAgYW5ndWxhci5lbGVtZW50KFwiaW5wdXRbdHlwZT0nZmlsZSddXCIpLnZhbChudWxsKTtcclxuICAgICAgICAgICQuWmVicmFfRGlhbG9nKFwiVGhhbmsgeW91ISBZb3VyIHJlcXVlc3QgaGFzIGJlZW4gc3VibWl0dGVkIHN1Y2Nlc3NmdWxseS5cIik7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgICQuWmVicmFfRGlhbG9nKFwiRXJyb3IgaW4gcHJvY2Vzc2luZyB0aGUgcmVxdWVzdC4gUGxlYXNlIHRyeSBhZ2Fpbi5cIik7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGNhdGNoRXJyb3IocmVzKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkVycm9yIGluIHByb2Nlc3NpbmcgdGhlIHJlcXVlc3QuIFBsZWFzZSB0cnkgYWdhaW4uXCIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59KTsiXSwiZmlsZSI6Im1peGluZ01hc3RlcmluZy9taXhpbmdNYXN0ZXJpbmcuanMifQ==
