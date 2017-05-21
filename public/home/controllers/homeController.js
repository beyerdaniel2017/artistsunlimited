app.config(function($stateProvider) {
  $stateProvider
    .state('home', {
      url: '/',
      templateUrl: 'js/home/views/home.html',
      controller: 'HomeController'
    })
    .state('about', {
      url: '/about',
      templateUrl: 'js/home/views/about.html',
      controller: 'HomeController'
    })
    .state('services', {
      url: '/services',
      templateUrl: 'js/home/views/services.html',
      controller: 'HomeController'
    })
    .state('faqs', {
      url: '/faqs',
      templateUrl: 'js/home/views/faqs.html',
      controller: 'HomeController'
    })
    .state('apply', {
      url: '/apply',
      templateUrl: 'js/home/views/apply.html',
      controller: 'HomeController'
    })
    .state('contact', {
      url: '/contact',
      templateUrl: 'js/home/views/contact.html',
      controller: 'HomeController'
    });
});

app.controller('HomeController', ['$rootScope',
  '$state',
  '$scope',
  '$http',
  '$location',
  '$window',
  'HomeService',
  function($rootScope, $state, $scope, $http, $location, $window, HomeService) {

    $scope.applicationObj = {};
    $scope.artist = {};
    $scope.sent = {
      application: false,
      artistEmail: false
    };
    $scope.message = {
      application: {
        val: '',
        visible: false
      },
      artistEmail: {
        val: '',
        visible: false
      }
    };

    /* Apply page start */

    $scope.toggleApplicationSent = function() {
      $scope.message = {
        application: {
          val: '',
          visible: false
        }
      };
      $scope.sent.application = !$scope.sent.application;
    };

    $scope.saveApplication = function() {

      $scope.message.application = {
        val: '',
        visible: false
      };

      HomeService
        .saveApplication($scope.applicationObj)
        .then(saveApplicationResponse)
        .catch(saveApplicationError)

      function saveApplicationResponse(res) {
        if (res.status === 200) {
          $scope.applicationObj = {};
          $scope.sent.application = true;
        }
      }

      function saveApplicationError(res) {
        if (res.status === 400) {
          $scope.message.application = {
            val: 'Email already exists!',
            visible: true
          };
          return;
        }
        $scope.message.application = {
          val: 'Error in processing your request',
          visible: true
        };
      }
    };

    /* Apply page end */

    /* Artist Tools page start */

    $scope.toggleArtistEmail = function() {
      $scope.message = {
        artistEmail: {
          val: '',
          visible: false
        }
      };
      $scope.sent.artistEmail = !$scope.sent.artistEmail;
    };

    $scope.saveArtistEmail = function() {
      HomeService
        .saveArtistEmail($scope.artist)
        .then(artistEmailResponse)
        .catch(artistEmailError)

      function artistEmailResponse(res) {
        if (res.status === 200) {
          $scope.artist = {};
          $scope.sent.artistEmail = true;
        }
      }

      function artistEmailError(res) {
        if (res.status === 400) {
          $scope.message.artistEmail = {
            val: 'Email already exists!',
            visible: true
          };
          return;
        }

        $scope.message.artistEmail = {
          val: 'Error in processing your request',
          visible: true
        };
      }
    };

    /* Artist Tools page end */
  }
]);

app.directive('affixer', function($window) {
  return {
    restrict: 'EA',
    link: function($scope, $element) {
      var win = angular.element($window);
      var topOffset = $element[0].offsetTop;

      function affixElement() {

        if ($window.pageYOffset > topOffset) {
          $element.css('position', 'fixed');
          $element.css('top', '3.5%');
        } else {
          $element.css('position', '');
          $element.css('top', '');
        }
      }

      $scope.$on('$routeChangeStart', function() {
        win.unbind('scroll', affixElement);
      });
      win.bind('scroll', affixElement);
    }
  };
})
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJob21lL2NvbnRyb2xsZXJzL2hvbWVDb250cm9sbGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlclxyXG4gICAgLnN0YXRlKCdob21lJywge1xyXG4gICAgICB1cmw6ICcvJyxcclxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL3ZpZXdzL2hvbWUuaHRtbCcsXHJcbiAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcclxuICAgIH0pXHJcbiAgICAuc3RhdGUoJ2Fib3V0Jywge1xyXG4gICAgICB1cmw6ICcvYWJvdXQnLFxyXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvYWJvdXQuaHRtbCcsXHJcbiAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcclxuICAgIH0pXHJcbiAgICAuc3RhdGUoJ3NlcnZpY2VzJywge1xyXG4gICAgICB1cmw6ICcvc2VydmljZXMnLFxyXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3Mvc2VydmljZXMuaHRtbCcsXHJcbiAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcclxuICAgIH0pXHJcbiAgICAuc3RhdGUoJ2ZhcXMnLCB7XHJcbiAgICAgIHVybDogJy9mYXFzJyxcclxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL3ZpZXdzL2ZhcXMuaHRtbCcsXHJcbiAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcclxuICAgIH0pXHJcbiAgICAuc3RhdGUoJ2FwcGx5Jywge1xyXG4gICAgICB1cmw6ICcvYXBwbHknLFxyXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvYXBwbHkuaHRtbCcsXHJcbiAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcclxuICAgIH0pXHJcbiAgICAuc3RhdGUoJ2NvbnRhY3QnLCB7XHJcbiAgICAgIHVybDogJy9jb250YWN0JyxcclxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL3ZpZXdzL2NvbnRhY3QuaHRtbCcsXHJcbiAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcclxuICAgIH0pO1xyXG59KTtcclxuXHJcbmFwcC5jb250cm9sbGVyKCdIb21lQ29udHJvbGxlcicsIFsnJHJvb3RTY29wZScsXHJcbiAgJyRzdGF0ZScsXHJcbiAgJyRzY29wZScsXHJcbiAgJyRodHRwJyxcclxuICAnJGxvY2F0aW9uJyxcclxuICAnJHdpbmRvdycsXHJcbiAgJ0hvbWVTZXJ2aWNlJyxcclxuICBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgJHdpbmRvdywgSG9tZVNlcnZpY2UpIHtcclxuXHJcbiAgICAkc2NvcGUuYXBwbGljYXRpb25PYmogPSB7fTtcclxuICAgICRzY29wZS5hcnRpc3QgPSB7fTtcclxuICAgICRzY29wZS5zZW50ID0ge1xyXG4gICAgICBhcHBsaWNhdGlvbjogZmFsc2UsXHJcbiAgICAgIGFydGlzdEVtYWlsOiBmYWxzZVxyXG4gICAgfTtcclxuICAgICRzY29wZS5tZXNzYWdlID0ge1xyXG4gICAgICBhcHBsaWNhdGlvbjoge1xyXG4gICAgICAgIHZhbDogJycsXHJcbiAgICAgICAgdmlzaWJsZTogZmFsc2VcclxuICAgICAgfSxcclxuICAgICAgYXJ0aXN0RW1haWw6IHtcclxuICAgICAgICB2YWw6ICcnLFxyXG4gICAgICAgIHZpc2libGU6IGZhbHNlXHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLyogQXBwbHkgcGFnZSBzdGFydCAqL1xyXG5cclxuICAgICRzY29wZS50b2dnbGVBcHBsaWNhdGlvblNlbnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XHJcbiAgICAgICAgYXBwbGljYXRpb246IHtcclxuICAgICAgICAgIHZhbDogJycsXHJcbiAgICAgICAgICB2aXNpYmxlOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgJHNjb3BlLnNlbnQuYXBwbGljYXRpb24gPSAhJHNjb3BlLnNlbnQuYXBwbGljYXRpb247XHJcbiAgICB9O1xyXG5cclxuICAgICRzY29wZS5zYXZlQXBwbGljYXRpb24gPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICRzY29wZS5tZXNzYWdlLmFwcGxpY2F0aW9uID0ge1xyXG4gICAgICAgIHZhbDogJycsXHJcbiAgICAgICAgdmlzaWJsZTogZmFsc2VcclxuICAgICAgfTtcclxuXHJcbiAgICAgIEhvbWVTZXJ2aWNlXHJcbiAgICAgICAgLnNhdmVBcHBsaWNhdGlvbigkc2NvcGUuYXBwbGljYXRpb25PYmopXHJcbiAgICAgICAgLnRoZW4oc2F2ZUFwcGxpY2F0aW9uUmVzcG9uc2UpXHJcbiAgICAgICAgLmNhdGNoKHNhdmVBcHBsaWNhdGlvbkVycm9yKVxyXG5cclxuICAgICAgZnVuY3Rpb24gc2F2ZUFwcGxpY2F0aW9uUmVzcG9uc2UocmVzKSB7XHJcbiAgICAgICAgaWYgKHJlcy5zdGF0dXMgPT09IDIwMCkge1xyXG4gICAgICAgICAgJHNjb3BlLmFwcGxpY2F0aW9uT2JqID0ge307XHJcbiAgICAgICAgICAkc2NvcGUuc2VudC5hcHBsaWNhdGlvbiA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBzYXZlQXBwbGljYXRpb25FcnJvcihyZXMpIHtcclxuICAgICAgICBpZiAocmVzLnN0YXR1cyA9PT0gNDAwKSB7XHJcbiAgICAgICAgICAkc2NvcGUubWVzc2FnZS5hcHBsaWNhdGlvbiA9IHtcclxuICAgICAgICAgICAgdmFsOiAnRW1haWwgYWxyZWFkeSBleGlzdHMhJyxcclxuICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZVxyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgJHNjb3BlLm1lc3NhZ2UuYXBwbGljYXRpb24gPSB7XHJcbiAgICAgICAgICB2YWw6ICdFcnJvciBpbiBwcm9jZXNzaW5nIHlvdXIgcmVxdWVzdCcsXHJcbiAgICAgICAgICB2aXNpYmxlOiB0cnVlXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKiBBcHBseSBwYWdlIGVuZCAqL1xyXG5cclxuICAgIC8qIEFydGlzdCBUb29scyBwYWdlIHN0YXJ0ICovXHJcblxyXG4gICAgJHNjb3BlLnRvZ2dsZUFydGlzdEVtYWlsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICRzY29wZS5tZXNzYWdlID0ge1xyXG4gICAgICAgIGFydGlzdEVtYWlsOiB7XHJcbiAgICAgICAgICB2YWw6ICcnLFxyXG4gICAgICAgICAgdmlzaWJsZTogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgICRzY29wZS5zZW50LmFydGlzdEVtYWlsID0gISRzY29wZS5zZW50LmFydGlzdEVtYWlsO1xyXG4gICAgfTtcclxuXHJcbiAgICAkc2NvcGUuc2F2ZUFydGlzdEVtYWlsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIEhvbWVTZXJ2aWNlXHJcbiAgICAgICAgLnNhdmVBcnRpc3RFbWFpbCgkc2NvcGUuYXJ0aXN0KVxyXG4gICAgICAgIC50aGVuKGFydGlzdEVtYWlsUmVzcG9uc2UpXHJcbiAgICAgICAgLmNhdGNoKGFydGlzdEVtYWlsRXJyb3IpXHJcblxyXG4gICAgICBmdW5jdGlvbiBhcnRpc3RFbWFpbFJlc3BvbnNlKHJlcykge1xyXG4gICAgICAgIGlmIChyZXMuc3RhdHVzID09PSAyMDApIHtcclxuICAgICAgICAgICRzY29wZS5hcnRpc3QgPSB7fTtcclxuICAgICAgICAgICRzY29wZS5zZW50LmFydGlzdEVtYWlsID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGFydGlzdEVtYWlsRXJyb3IocmVzKSB7XHJcbiAgICAgICAgaWYgKHJlcy5zdGF0dXMgPT09IDQwMCkge1xyXG4gICAgICAgICAgJHNjb3BlLm1lc3NhZ2UuYXJ0aXN0RW1haWwgPSB7XHJcbiAgICAgICAgICAgIHZhbDogJ0VtYWlsIGFscmVhZHkgZXhpc3RzIScsXHJcbiAgICAgICAgICAgIHZpc2libGU6IHRydWVcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUubWVzc2FnZS5hcnRpc3RFbWFpbCA9IHtcclxuICAgICAgICAgIHZhbDogJ0Vycm9yIGluIHByb2Nlc3NpbmcgeW91ciByZXF1ZXN0JyxcclxuICAgICAgICAgIHZpc2libGU6IHRydWVcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qIEFydGlzdCBUb29scyBwYWdlIGVuZCAqL1xyXG4gIH1cclxuXSk7XHJcblxyXG5hcHAuZGlyZWN0aXZlKCdhZmZpeGVyJywgZnVuY3Rpb24oJHdpbmRvdykge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogJ0VBJyxcclxuICAgIGxpbms6IGZ1bmN0aW9uKCRzY29wZSwgJGVsZW1lbnQpIHtcclxuICAgICAgdmFyIHdpbiA9IGFuZ3VsYXIuZWxlbWVudCgkd2luZG93KTtcclxuICAgICAgdmFyIHRvcE9mZnNldCA9ICRlbGVtZW50WzBdLm9mZnNldFRvcDtcclxuXHJcbiAgICAgIGZ1bmN0aW9uIGFmZml4RWxlbWVudCgpIHtcclxuXHJcbiAgICAgICAgaWYgKCR3aW5kb3cucGFnZVlPZmZzZXQgPiB0b3BPZmZzZXQpIHtcclxuICAgICAgICAgICRlbGVtZW50LmNzcygncG9zaXRpb24nLCAnZml4ZWQnKTtcclxuICAgICAgICAgICRlbGVtZW50LmNzcygndG9wJywgJzMuNSUnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgJGVsZW1lbnQuY3NzKCdwb3NpdGlvbicsICcnKTtcclxuICAgICAgICAgICRlbGVtZW50LmNzcygndG9wJywgJycpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB3aW4udW5iaW5kKCdzY3JvbGwnLCBhZmZpeEVsZW1lbnQpO1xyXG4gICAgICB9KTtcclxuICAgICAgd2luLmJpbmQoJ3Njcm9sbCcsIGFmZml4RWxlbWVudCk7XHJcbiAgICB9XHJcbiAgfTtcclxufSkiXSwiZmlsZSI6ImhvbWUvY29udHJvbGxlcnMvaG9tZUNvbnRyb2xsZXIuanMifQ==
