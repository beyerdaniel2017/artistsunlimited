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
    window.location.href = '/EtiquetteNoir/premiere'
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
          $scope.premierObj = {};
          angular.element("input[type='file']").val(null);
          $.Zebra_Dialog('Thank you! Your message has been sent successfully.')
        } else {
          $.Zebra_Dialog('Error processing. Please try again or send your track to edward@peninsulamgmt.com.')
        }
      }

      function catchError(res) {
        $scope.processing = false;
        $.Zebra_Dialog('Error processing. Please try again or send your track to edward@peninsulamgmt.com.')
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwcmVtaWVyZS9jb250cm9sbGVycy9wcmVtaWVyZUNvbnRyb2xsZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdwcmVtaWVyZScsIHtcclxuICAgIHVybDogJy9wcmVtaWVyZScsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL3ByZW1pZXJlL3ZpZXdzL3ByZW1pZXJlLmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ1ByZW1pZXJDb250cm9sbGVyJ1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmFwcC5jb250cm9sbGVyKCdQcmVtaWVyQ29udHJvbGxlcicsIFsnJHJvb3RTY29wZScsXHJcbiAgJyRzdGF0ZScsXHJcbiAgJyRzY29wZScsXHJcbiAgJyRodHRwJyxcclxuICAnJGxvY2F0aW9uJyxcclxuICAnJHdpbmRvdycsXHJcbiAgJ1ByZW1pZXJTZXJ2aWNlJyxcclxuICBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgJHdpbmRvdywgUHJlbWllclNlcnZpY2UpIHtcclxuICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9FdGlxdWV0dGVOb2lyL3ByZW1pZXJlJ1xyXG4gICAgJHNjb3BlLnVzZXJJRCA9ICRsb2NhdGlvbi5zZWFyY2goKS5pZDtcclxuICAgICRzY29wZS5nZW5yZUFycmF5ID0gW1xyXG4gICAgICAnQWx0ZXJuYXRpdmUgUm9jaycsXHJcbiAgICAgICdBbWJpZW50JyxcclxuICAgICAgJ0NyZWF0aXZlJyxcclxuICAgICAgJ0NoaWxsJyxcclxuICAgICAgJ0NsYXNzaWNhbCcsXHJcbiAgICAgICdDb3VudHJ5JyxcclxuICAgICAgJ0RhbmNlICYgRURNJyxcclxuICAgICAgJ0RhbmNlaGFsbCcsXHJcbiAgICAgICdEZWVwIEhvdXNlJyxcclxuICAgICAgJ0Rpc2NvJyxcclxuICAgICAgJ0RydW0gJiBCYXNzJyxcclxuICAgICAgJ0R1YnN0ZXAnLFxyXG4gICAgICAnRWxlY3Ryb25pYycsXHJcbiAgICAgICdGZXN0aXZhbCcsXHJcbiAgICAgICdGb2xrJyxcclxuICAgICAgJ0hpcC1Ib3AvUk5CJyxcclxuICAgICAgJ0hvdXNlJyxcclxuICAgICAgJ0luZGllL0FsdGVybmF0aXZlJyxcclxuICAgICAgJ0xhdGluJyxcclxuICAgICAgJ1RyYXAnLFxyXG4gICAgICAnVm9jYWxpc3RzL1Npbmdlci1Tb25nd3JpdGVyJ1xyXG4gICAgXTtcclxuXHJcbiAgICAkc2NvcGUucHJlbWllck9iaiA9IHt9O1xyXG4gICAgJHNjb3BlLm1lc3NhZ2UgPSB7XHJcbiAgICAgIHZhbDogJycsXHJcbiAgICAgIHZpc2libGU6IGZhbHNlXHJcbiAgICB9O1xyXG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAkc2NvcGUuc2F2ZVByZW1pZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgLy8kLlplYnJhX0RpYWxvZygnVGhpcyBtYXkgdGFrZSBhIGxpdHRsZSB3aGlsZS4nKVxyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICRzY29wZS5tZXNzYWdlLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgdmFyIGRhdGEgPSBuZXcgRm9ybURhdGEoKTtcclxuICAgICAgZm9yICh2YXIgcHJvcCBpbiAkc2NvcGUucHJlbWllck9iaikge1xyXG4gICAgICAgIGRhdGEuYXBwZW5kKHByb3AsICRzY29wZS5wcmVtaWVyT2JqW3Byb3BdKTtcclxuICAgICAgfVxyXG4gICAgICBkYXRhLmFwcGVuZChcInVzZXJJRFwiLCAkc2NvcGUudXNlcklEKTtcclxuICAgICAgUHJlbWllclNlcnZpY2VcclxuICAgICAgICAuc2F2ZVByZW1pZXIoZGF0YSlcclxuICAgICAgICAudGhlbihyZWNlaXZlUmVzcG9uc2UpXHJcbiAgICAgICAgLmNhdGNoKGNhdGNoRXJyb3IpO1xyXG5cclxuICAgICAgZnVuY3Rpb24gcmVjZWl2ZVJlc3BvbnNlKHJlcykge1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKHJlcy5zdGF0dXMgPT09IDIwMCkge1xyXG4gICAgICAgICAgJHNjb3BlLnByZW1pZXJPYmogPSB7fTtcclxuICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChcImlucHV0W3R5cGU9J2ZpbGUnXVwiKS52YWwobnVsbCk7XHJcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZygnVGhhbmsgeW91ISBZb3VyIG1lc3NhZ2UgaGFzIGJlZW4gc2VudCBzdWNjZXNzZnVsbHkuJylcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coJ0Vycm9yIHByb2Nlc3NpbmcuIFBsZWFzZSB0cnkgYWdhaW4gb3Igc2VuZCB5b3VyIHRyYWNrIHRvIGVkd2FyZEBwZW5pbnN1bGFtZ210LmNvbS4nKVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gY2F0Y2hFcnJvcihyZXMpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICQuWmVicmFfRGlhbG9nKCdFcnJvciBwcm9jZXNzaW5nLiBQbGVhc2UgdHJ5IGFnYWluIG9yIHNlbmQgeW91ciB0cmFjayB0byBlZHdhcmRAcGVuaW5zdWxhbWdtdC5jb20uJylcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAkc2NvcGUuZ2V0VXNlcklEID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIGlmICgkc2NvcGUudXNlcklEID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICRodHRwLmdldCgnL2FwaS91c2Vycy9nZXRVc2VySUQnKVxyXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICRzY29wZS51c2VySUQgPSByZXMuZGF0YTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAkc2NvcGUuZ2V0VXNlcklEKCk7XHJcbiAgfVxyXG5dKTsiXSwiZmlsZSI6InByZW1pZXJlL2NvbnRyb2xsZXJzL3ByZW1pZXJlQ29udHJvbGxlci5qcyJ9
