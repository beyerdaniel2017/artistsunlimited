app.config(function($stateProvider) {
  $stateProvider.state('autoEmailsList', {
    url: '/admin/database/autoEmails',
    templateUrl: 'js/database/autoEmails/autoEmailsList.html',
    controller: 'AutoEmailsListController',
    resolve: {
      templates: function($http) {
        return $http.get('/api/database/autoEmails')
          .then(function(res) {
            var template = res.data;
            if (template) {
              return template;
            } else {
              return {
                purpose: "Biweekly Email"
              }
            }
          })
          .then(null, function(err) {
            $.Zebra_Dialog("ERROR: Something went wrong.");
          })
      }
    }
  });
});

app.controller('AutoEmailsListController', function($rootScope, $state, $scope, $http, AuthService, templates) {
  $scope.loggedIn = false;
  $scope.templates = templates;

  // $scope.getTemplate = function() {
  //   $scope.processing = true;
  //   $http.get('/api/database/autoEmails/biweekly?isArtist=' + String($scope.template.isArtist))
  //     .then(function(res) {
  //       var template = res.data;
  //       $scope.processing = false;
  //       if (template) {
  //         $scope.template = template;
  //       } else {
  //         $scope.template = {
  //           purpose: "Biweekly Email",
  //           isArtist: false
  //         };
  //       }
  //     })
  //     .then(null, function(err) {
  //       $.Zebra_Dialog("ERROR: Something went wrong.");
  //     });
  // };

  // console.log(template);
  $scope.save = function() {
    $scope.processing = true;
    $http.post('/api/database/autoEmails', $scope.template)
      .then(function(res) {
        $.Zebra_Dialog("Saved email.");
        $scope.processing = false;
      })
      .then(null, function(err) {
        $.Zebra_Dialog("ERROR: Message could not save.")
        $scope.processing = false;
      });
  }

  // $scope.login = function() {
  //   $scope.processing = true;
  //   $http.post('/api/login', {
  //     password: $scope.password
  //   }).then(function() {
  //     $rootScope.password = $scope.password;
  //     $scope.loggedIn = true;
  //     $scope.processing = false;
  //   }).catch(function(err) {
  //     $scope.processing = false;
  //     $.Zebra_Dialog('Wrong Password');
  //   });
  // }

  $scope.logout = function() {
    $http.get('/api/logout').then(function() {
      window.location.href = '/admin';
    }).catch(function(err) {
      $scope.processing = false;
      $.Zebra_Dialog('Wrong Password');
    });
  }

})
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXRhYmFzZS9hdXRvRW1haWxzL2F1dG9FbWFpbHNMaXN0LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYXV0b0VtYWlsc0xpc3QnLCB7XHJcbiAgICB1cmw6ICcvYWRtaW4vZGF0YWJhc2UvYXV0b0VtYWlscycsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2RhdGFiYXNlL2F1dG9FbWFpbHMvYXV0b0VtYWlsc0xpc3QuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnQXV0b0VtYWlsc0xpc3RDb250cm9sbGVyJyxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgdGVtcGxhdGVzOiBmdW5jdGlvbigkaHR0cCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZGF0YWJhc2UvYXV0b0VtYWlscycpXHJcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgdmFyIHRlbXBsYXRlID0gcmVzLmRhdGE7XHJcbiAgICAgICAgICAgIGlmICh0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICAgcHVycG9zZTogXCJCaXdlZWtseSBFbWFpbFwiXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKFwiRVJST1I6IFNvbWV0aGluZyB3ZW50IHdyb25nLlwiKTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxufSk7XHJcblxyXG5hcHAuY29udHJvbGxlcignQXV0b0VtYWlsc0xpc3RDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCBBdXRoU2VydmljZSwgdGVtcGxhdGVzKSB7XHJcbiAgJHNjb3BlLmxvZ2dlZEluID0gZmFsc2U7XHJcbiAgJHNjb3BlLnRlbXBsYXRlcyA9IHRlbXBsYXRlcztcclxuXHJcbiAgLy8gJHNjb3BlLmdldFRlbXBsYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgLy8gICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgLy8gICAkaHR0cC5nZXQoJy9hcGkvZGF0YWJhc2UvYXV0b0VtYWlscy9iaXdlZWtseT9pc0FydGlzdD0nICsgU3RyaW5nKCRzY29wZS50ZW1wbGF0ZS5pc0FydGlzdCkpXHJcbiAgLy8gICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gIC8vICAgICAgIHZhciB0ZW1wbGF0ZSA9IHJlcy5kYXRhO1xyXG4gIC8vICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgLy8gICAgICAgaWYgKHRlbXBsYXRlKSB7XHJcbiAgLy8gICAgICAgICAkc2NvcGUudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcclxuICAvLyAgICAgICB9IGVsc2Uge1xyXG4gIC8vICAgICAgICAgJHNjb3BlLnRlbXBsYXRlID0ge1xyXG4gIC8vICAgICAgICAgICBwdXJwb3NlOiBcIkJpd2Vla2x5IEVtYWlsXCIsXHJcbiAgLy8gICAgICAgICAgIGlzQXJ0aXN0OiBmYWxzZVxyXG4gIC8vICAgICAgICAgfTtcclxuICAvLyAgICAgICB9XHJcbiAgLy8gICAgIH0pXHJcbiAgLy8gICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gIC8vICAgICAgICQuWmVicmFfRGlhbG9nKFwiRVJST1I6IFNvbWV0aGluZyB3ZW50IHdyb25nLlwiKTtcclxuICAvLyAgICAgfSk7XHJcbiAgLy8gfTtcclxuXHJcbiAgLy8gY29uc29sZS5sb2codGVtcGxhdGUpO1xyXG4gICRzY29wZS5zYXZlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL2F1dG9FbWFpbHMnLCAkc2NvcGUudGVtcGxhdGUpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICQuWmVicmFfRGlhbG9nKFwiU2F2ZWQgZW1haWwuXCIpO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICQuWmVicmFfRGlhbG9nKFwiRVJST1I6IE1lc3NhZ2UgY291bGQgbm90IHNhdmUuXCIpXHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAkc2NvcGUubG9naW4gPSBmdW5jdGlvbigpIHtcclxuICAvLyAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAvLyAgICRodHRwLnBvc3QoJy9hcGkvbG9naW4nLCB7XHJcbiAgLy8gICAgIHBhc3N3b3JkOiAkc2NvcGUucGFzc3dvcmRcclxuICAvLyAgIH0pLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgLy8gICAgICRyb290U2NvcGUucGFzc3dvcmQgPSAkc2NvcGUucGFzc3dvcmQ7XHJcbiAgLy8gICAgICRzY29wZS5sb2dnZWRJbiA9IHRydWU7XHJcbiAgLy8gICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgLy8gICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcclxuICAvLyAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAvLyAgICAgJC5aZWJyYV9EaWFsb2coJ1dyb25nIFBhc3N3b3JkJyk7XHJcbiAgLy8gICB9KTtcclxuICAvLyB9XHJcblxyXG4gICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICRodHRwLmdldCgnL2FwaS9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4nO1xyXG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICQuWmVicmFfRGlhbG9nKCdXcm9uZyBQYXNzd29yZCcpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxufSkiXSwiZmlsZSI6ImRhdGFiYXNlL2F1dG9FbWFpbHMvYXV0b0VtYWlsc0xpc3QuanMifQ==
