app.config(function($stateProvider) {
  $stateProvider.state('autoEmailsNew', {
    url: '/admin/database/autoEmails/new',
    templateUrl: 'js/database/autoEmails/autoEmails.html',
    controller: 'AutoEmailsController'
  });
});

app.config(function($stateProvider) {
  $stateProvider.state('autoEmailsEdit', {
    url: '/admin/database/autoEmails/edit/:templateId',
    templateUrl: 'js/database/autoEmails/autoEmails.html',
    controller: 'AutoEmailsController',
    // resolve: {
    //   template: function($http) {
    //     return $http.get('/api/database/autoEmails/biweekly?isArtist=true')
    //       .then(function(res) {
    //         var template = res.data;
    //         if (template) {
    //           return template;
    //         } else {
    //           return {
    //             purpose: "Biweekly Email"
    //           }
    //         }
    //       })
    //       .then(null, function(err) {
    //         $.Zebra_Dialog("ERROR: Something went wrong.");
    //       })
    //   }
    // }
  });
});

app.controller('AutoEmailsController', function($rootScope, $state, $scope, $http, $stateParams, AuthService) {
  $scope.loggedIn = false;


  $scope.isStateParams = false;
  if ($stateParams.templateId) {
    $scope.isStateParams = true;
  }
  // $scope.template = template;

  $scope.template = {
    isArtist: false
  };

  $scope.getTemplate = function() {
    if ($stateParams.templateId) {
      $scope.processing = true;
      $http.get('/api/database/autoEmails?templateId=' + $stateParams.templateId)
        .then(function(res) {
          var template = res.data;
          $scope.processing = false;
          if (template) {
            $scope.template = template;
          } else {
            $scope.template = {};
          }
        })
        .then(null, function(err) {
          $.Zebra_Dialog("ERROR: Something went wrong.");
        });
    } else {
      return false;
    }
  };

  // console.log(template);
  $scope.save = function() {
    $scope.processing = true;
    $http.post('/api/database/autoEmails/', $scope.template)
      .then(function(res) {
        $.Zebra_Dialog("Saved email template.")
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

});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXRhYmFzZS9hdXRvRW1haWxzL2F1dG9FbWFpbHMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhdXRvRW1haWxzTmV3Jywge1xyXG4gICAgdXJsOiAnL2FkbWluL2RhdGFiYXNlL2F1dG9FbWFpbHMvbmV3JyxcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvZGF0YWJhc2UvYXV0b0VtYWlscy9hdXRvRW1haWxzLmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ0F1dG9FbWFpbHNDb250cm9sbGVyJ1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYXV0b0VtYWlsc0VkaXQnLCB7XHJcbiAgICB1cmw6ICcvYWRtaW4vZGF0YWJhc2UvYXV0b0VtYWlscy9lZGl0Lzp0ZW1wbGF0ZUlkJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvZGF0YWJhc2UvYXV0b0VtYWlscy9hdXRvRW1haWxzLmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ0F1dG9FbWFpbHNDb250cm9sbGVyJyxcclxuICAgIC8vIHJlc29sdmU6IHtcclxuICAgIC8vICAgdGVtcGxhdGU6IGZ1bmN0aW9uKCRodHRwKSB7XHJcbiAgICAvLyAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9kYXRhYmFzZS9hdXRvRW1haWxzL2Jpd2Vla2x5P2lzQXJ0aXN0PXRydWUnKVxyXG4gICAgLy8gICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAvLyAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IHJlcy5kYXRhO1xyXG4gICAgLy8gICAgICAgICBpZiAodGVtcGxhdGUpIHtcclxuICAgIC8vICAgICAgICAgICByZXR1cm4gdGVtcGxhdGU7XHJcbiAgICAvLyAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAvLyAgICAgICAgICAgcmV0dXJuIHtcclxuICAgIC8vICAgICAgICAgICAgIHB1cnBvc2U6IFwiQml3ZWVrbHkgRW1haWxcIlxyXG4gICAgLy8gICAgICAgICAgIH1cclxuICAgIC8vICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgfSlcclxuICAgIC8vICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgLy8gICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkVSUk9SOiBTb21ldGhpbmcgd2VudCB3cm9uZy5cIik7XHJcbiAgICAvLyAgICAgICB9KVxyXG4gICAgLy8gICB9XHJcbiAgICAvLyB9XHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ0F1dG9FbWFpbHNDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCAkc3RhdGVQYXJhbXMsIEF1dGhTZXJ2aWNlKSB7XHJcbiAgJHNjb3BlLmxvZ2dlZEluID0gZmFsc2U7XHJcblxyXG5cclxuICAkc2NvcGUuaXNTdGF0ZVBhcmFtcyA9IGZhbHNlO1xyXG4gIGlmICgkc3RhdGVQYXJhbXMudGVtcGxhdGVJZCkge1xyXG4gICAgJHNjb3BlLmlzU3RhdGVQYXJhbXMgPSB0cnVlO1xyXG4gIH1cclxuICAvLyAkc2NvcGUudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcclxuXHJcbiAgJHNjb3BlLnRlbXBsYXRlID0ge1xyXG4gICAgaXNBcnRpc3Q6IGZhbHNlXHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmdldFRlbXBsYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoJHN0YXRlUGFyYW1zLnRlbXBsYXRlSWQpIHtcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAkaHR0cC5nZXQoJy9hcGkvZGF0YWJhc2UvYXV0b0VtYWlscz90ZW1wbGF0ZUlkPScgKyAkc3RhdGVQYXJhbXMudGVtcGxhdGVJZClcclxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IHJlcy5kYXRhO1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIGlmICh0ZW1wbGF0ZSkge1xyXG4gICAgICAgICAgICAkc2NvcGUudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICRzY29wZS50ZW1wbGF0ZSA9IHt9O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkVSUk9SOiBTb21ldGhpbmcgd2VudCB3cm9uZy5cIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgLy8gY29uc29sZS5sb2codGVtcGxhdGUpO1xyXG4gICRzY29wZS5zYXZlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL2F1dG9FbWFpbHMvJywgJHNjb3BlLnRlbXBsYXRlKVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAkLlplYnJhX0RpYWxvZyhcIlNhdmVkIGVtYWlsIHRlbXBsYXRlLlwiKVxyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICQuWmVicmFfRGlhbG9nKFwiRVJST1I6IE1lc3NhZ2UgY291bGQgbm90IHNhdmUuXCIpXHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICAvLyAkc2NvcGUubG9naW4gPSBmdW5jdGlvbigpIHtcclxuICAvLyAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAvLyAgICRodHRwLnBvc3QoJy9hcGkvbG9naW4nLCB7XHJcbiAgLy8gICAgIHBhc3N3b3JkOiAkc2NvcGUucGFzc3dvcmRcclxuICAvLyAgIH0pLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgLy8gICAgICRyb290U2NvcGUucGFzc3dvcmQgPSAkc2NvcGUucGFzc3dvcmQ7XHJcbiAgLy8gICAgICRzY29wZS5sb2dnZWRJbiA9IHRydWU7XHJcbiAgLy8gICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgLy8gICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcclxuICAvLyAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAvLyAgICAgJC5aZWJyYV9EaWFsb2coJ1dyb25nIFBhc3N3b3JkJyk7XHJcbiAgLy8gICB9KTtcclxuICAvLyB9XHJcblxyXG4gICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICRodHRwLmdldCgnL2FwaS9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4nO1xyXG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICQuWmVicmFfRGlhbG9nKCdXcm9uZyBQYXNzd29yZCcpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxufSk7Il0sImZpbGUiOiJkYXRhYmFzZS9hdXRvRW1haWxzL2F1dG9FbWFpbHMuanMifQ==
