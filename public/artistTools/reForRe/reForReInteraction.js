app.config(function($stateProvider) {
  $stateProvider
    .state('reForReInteraction', {
      url: '/artistTools/trade/:user1Name/:user2Name',
      templateUrl: 'js/artistTools/reForRe/reForReInteraction.html',
      controller: 'ReForReInteractionController',
      resolve: {
        login: function($rootScope, $http, $stateParams, $window, SessionService, $state) {
          if ($window.localStorage.getItem('isAdminAuthenticate')) {
            $window.location.href = '/admin/trade/' + $stateParams.user1Name + '/' + $stateParams.user2Name;
          } else {
            if (SessionService.getUser()) {
              return $rootScope.getUserNetwork()
                .then(function() {
                  var repName = SessionService.getUser().soundcloud.pseudoname;
                  if (repName == $stateParams.user1Name || repName == $stateParams.user2Name) {
                    return 'ok'
                  } else {
                    var found = $rootScope.userlinkedAccounts.find(function(user) {
                      var repName = user.soundcloud.pseudoname;
                      return (repName == $stateParams.user1Name || repName == $stateParams.user2Name)
                    })
                    if (found) {
                      $rootScope.changeUserAdmin(found)
                    } else {
                      if ($window.localStorage.getItem('returnstate') == 'reForReInteraction') {
                        $window.localStorage.removeItem('returnstate');
                        $window.localStorage.removeItem('user1Name');
                        $window.localStorage.removeItem('user2Name');
                        $state.go('artistToolsScheduler');
                      } else {
                        $window.localStorage.setItem('returnstate', 'reForReInteraction');
                        $window.localStorage.setItem('user1Name', $stateParams.user1Name);
                        $window.localStorage.setItem('user2Name', $stateParams.user2Name);
                        SessionService.deleteUser();
                        $window.location.href = '/login';
                      }
                    }
                  }
                }).then(null, console.log);
            } else {
              $window.localStorage.setItem('returnstate', 'reForReInteraction');
              $window.localStorage.setItem('user1Name', $stateParams.user1Name);
              $window.localStorage.setItem('user2Name', $stateParams.user2Name);
              SessionService.deleteUser();
              $window.location.href = '/login';
            }
          }
        },
        trade: function($rootScope, $http, $stateParams, $window, SessionService) {
          return $http.get('/api/trades/withUsers/' + $stateParams.user1Name + '/' + $stateParams.user2Name)
            .then(function(res) {
              var user = SessionService.getUser('subAdmin');
              var trade = res.data;
              trade.p1.user.pseudoAvailableSlots = createPseudoAvailableSlots(trade.p1.user);
              trade.p2.user.pseudoAvailableSlots = createPseudoAvailableSlots(trade.p2.user);
              trade.other = (trade.p1.user._id == user._id) ? trade.p2 : trade.p1;
              trade.user = (trade.p1.user._id == user._id) ? trade.p1 : trade.p2;
              return trade;
            }).then(null, console.log)
        },
        events: function($http, $window, SessionService) {
          return $http.get('/api/events/forUser/' + SessionService.getUser().soundcloud.id)
            .then(function(res) {
              return res.data;
            })
            .then(null, function(err) {
              $.Zebra_Dialog("error getting your events");
              return;
            })
        },
        p1Events: function($http, trade) {
          return $http.get('/api/events/forUser/' + trade.p1.user.soundcloud.id)
            .then(function(res) {
              return res.data;
            })
            .then(null, function(err) {
              $.Zebra_Dialog("error getting your events");
              return;
            })
        },
        p2Events: function($http, trade) {
          return $http.get('/api/events/forUser/' + trade.p2.user.soundcloud.id)
            .then(function(res) {
              return res.data;
            })
            .then(null, function(err) {
              $.Zebra_Dialog("error getting other's events events");
              return;
            })
        }
      },
    })
});

app.controller("ReForReInteractionController", function($rootScope, $state, $scope, $http, AuthService, $window, SessionService, socket, $stateParams, trade, p1Events, p2Events) {
  $scope.user = SessionService.getUser();
  if (!SessionService.getUser()) {
    $state.go('login');
  } else {
    $window.localStorage.removeItem('returnstate');
    $window.localStorage.removeItem('user1ID');
    $window.localStorage.removeItem('user2ID');
  }
  $scope.trade = trade;
  $scope.msgHistory = trade.messages;
  // $scope.currentTrades = currentTrades;
  $scope.p1Events = p1Events;
  $scope.p2Events = p2Events;
  $scope.stateParams = $stateParams;
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcnRpc3RUb29scy9yZUZvclJlL3JlRm9yUmVJbnRlcmFjdGlvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XHJcbiAgJHN0YXRlUHJvdmlkZXJcclxuICAgIC5zdGF0ZSgncmVGb3JSZUludGVyYWN0aW9uJywge1xyXG4gICAgICB1cmw6ICcvYXJ0aXN0VG9vbHMvdHJhZGUvOnVzZXIxTmFtZS86dXNlcjJOYW1lJyxcclxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hcnRpc3RUb29scy9yZUZvclJlL3JlRm9yUmVJbnRlcmFjdGlvbi5odG1sJyxcclxuICAgICAgY29udHJvbGxlcjogJ1JlRm9yUmVJbnRlcmFjdGlvbkNvbnRyb2xsZXInLFxyXG4gICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgbG9naW46IGZ1bmN0aW9uKCRyb290U2NvcGUsICRodHRwLCAkc3RhdGVQYXJhbXMsICR3aW5kb3csIFNlc3Npb25TZXJ2aWNlLCAkc3RhdGUpIHtcclxuICAgICAgICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdpc0FkbWluQXV0aGVudGljYXRlJykpIHtcclxuICAgICAgICAgICAgJHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hZG1pbi90cmFkZS8nICsgJHN0YXRlUGFyYW1zLnVzZXIxTmFtZSArICcvJyArICRzdGF0ZVBhcmFtcy51c2VyMk5hbWU7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBpZiAoU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuICRyb290U2NvcGUuZ2V0VXNlck5ldHdvcmsoKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgIHZhciByZXBOYW1lID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpLnNvdW5kY2xvdWQucHNldWRvbmFtZTtcclxuICAgICAgICAgICAgICAgICAgaWYgKHJlcE5hbWUgPT0gJHN0YXRlUGFyYW1zLnVzZXIxTmFtZSB8fCByZXBOYW1lID09ICRzdGF0ZVBhcmFtcy51c2VyMk5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJ29rJ1xyXG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBmb3VuZCA9ICRyb290U2NvcGUudXNlcmxpbmtlZEFjY291bnRzLmZpbmQoZnVuY3Rpb24odXNlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgdmFyIHJlcE5hbWUgPSB1c2VyLnNvdW5kY2xvdWQucHNldWRvbmFtZTtcclxuICAgICAgICAgICAgICAgICAgICAgIHJldHVybiAocmVwTmFtZSA9PSAkc3RhdGVQYXJhbXMudXNlcjFOYW1lIHx8IHJlcE5hbWUgPT0gJHN0YXRlUGFyYW1zLnVzZXIyTmFtZSlcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmb3VuZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS5jaGFuZ2VVc2VyQWRtaW4oZm91bmQpXHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdyZXR1cm5zdGF0ZScpID09ICdyZUZvclJlSW50ZXJhY3Rpb24nKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3JldHVybnN0YXRlJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3VzZXIxTmFtZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd1c2VyMk5hbWUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhcnRpc3RUb29sc1NjaGVkdWxlcicpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncmV0dXJuc3RhdGUnLCAncmVGb3JSZUludGVyYWN0aW9uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3VzZXIxTmFtZScsICRzdGF0ZVBhcmFtcy51c2VyMU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCd1c2VyMk5hbWUnLCAkc3RhdGVQYXJhbXMudXNlcjJOYW1lKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgU2Vzc2lvblNlcnZpY2UuZGVsZXRlVXNlcigpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2xvZ2luJztcclxuICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH0pLnRoZW4obnVsbCwgY29uc29sZS5sb2cpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3JldHVybnN0YXRlJywgJ3JlRm9yUmVJbnRlcmFjdGlvbicpO1xyXG4gICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3VzZXIxTmFtZScsICRzdGF0ZVBhcmFtcy51c2VyMU5hbWUpO1xyXG4gICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3VzZXIyTmFtZScsICRzdGF0ZVBhcmFtcy51c2VyMk5hbWUpO1xyXG4gICAgICAgICAgICAgIFNlc3Npb25TZXJ2aWNlLmRlbGV0ZVVzZXIoKTtcclxuICAgICAgICAgICAgICAkd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2xvZ2luJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdHJhZGU6IGZ1bmN0aW9uKCRyb290U2NvcGUsICRodHRwLCAkc3RhdGVQYXJhbXMsICR3aW5kb3csIFNlc3Npb25TZXJ2aWNlKSB7XHJcbiAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3RyYWRlcy93aXRoVXNlcnMvJyArICRzdGF0ZVBhcmFtcy51c2VyMU5hbWUgKyAnLycgKyAkc3RhdGVQYXJhbXMudXNlcjJOYW1lKVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgICB2YXIgdXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoJ3N1YkFkbWluJyk7XHJcbiAgICAgICAgICAgICAgdmFyIHRyYWRlID0gcmVzLmRhdGE7XHJcbiAgICAgICAgICAgICAgdHJhZGUucDEudXNlci5wc2V1ZG9BdmFpbGFibGVTbG90cyA9IGNyZWF0ZVBzZXVkb0F2YWlsYWJsZVNsb3RzKHRyYWRlLnAxLnVzZXIpO1xyXG4gICAgICAgICAgICAgIHRyYWRlLnAyLnVzZXIucHNldWRvQXZhaWxhYmxlU2xvdHMgPSBjcmVhdGVQc2V1ZG9BdmFpbGFibGVTbG90cyh0cmFkZS5wMi51c2VyKTtcclxuICAgICAgICAgICAgICB0cmFkZS5vdGhlciA9ICh0cmFkZS5wMS51c2VyLl9pZCA9PSB1c2VyLl9pZCkgPyB0cmFkZS5wMiA6IHRyYWRlLnAxO1xyXG4gICAgICAgICAgICAgIHRyYWRlLnVzZXIgPSAodHJhZGUucDEudXNlci5faWQgPT0gdXNlci5faWQpID8gdHJhZGUucDEgOiB0cmFkZS5wMjtcclxuICAgICAgICAgICAgICByZXR1cm4gdHJhZGU7XHJcbiAgICAgICAgICAgIH0pLnRoZW4obnVsbCwgY29uc29sZS5sb2cpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBldmVudHM6IGZ1bmN0aW9uKCRodHRwLCAkd2luZG93LCBTZXNzaW9uU2VydmljZSkge1xyXG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9ldmVudHMvZm9yVXNlci8nICsgU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpLnNvdW5kY2xvdWQuaWQpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJlcnJvciBnZXR0aW5nIHlvdXIgZXZlbnRzXCIpO1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIHAxRXZlbnRzOiBmdW5jdGlvbigkaHR0cCwgdHJhZGUpIHtcclxuICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZXZlbnRzL2ZvclVzZXIvJyArIHRyYWRlLnAxLnVzZXIuc291bmRjbG91ZC5pZClcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcImVycm9yIGdldHRpbmcgeW91ciBldmVudHNcIik7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcDJFdmVudHM6IGZ1bmN0aW9uKCRodHRwLCB0cmFkZSkge1xyXG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9ldmVudHMvZm9yVXNlci8nICsgdHJhZGUucDIudXNlci5zb3VuZGNsb3VkLmlkKVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKFwiZXJyb3IgZ2V0dGluZyBvdGhlcidzIGV2ZW50cyBldmVudHNcIik7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgfSxcclxuICAgIH0pXHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoXCJSZUZvclJlSW50ZXJhY3Rpb25Db250cm9sbGVyXCIsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgQXV0aFNlcnZpY2UsICR3aW5kb3csIFNlc3Npb25TZXJ2aWNlLCBzb2NrZXQsICRzdGF0ZVBhcmFtcywgdHJhZGUsIHAxRXZlbnRzLCBwMkV2ZW50cykge1xyXG4gICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gIGlmICghU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSB7XHJcbiAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XHJcbiAgfSBlbHNlIHtcclxuICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3JldHVybnN0YXRlJyk7XHJcbiAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd1c2VyMUlEJyk7XHJcbiAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd1c2VyMklEJyk7XHJcbiAgfVxyXG4gICRzY29wZS50cmFkZSA9IHRyYWRlO1xyXG4gICRzY29wZS5tc2dIaXN0b3J5ID0gdHJhZGUubWVzc2FnZXM7XHJcbiAgLy8gJHNjb3BlLmN1cnJlbnRUcmFkZXMgPSBjdXJyZW50VHJhZGVzO1xyXG4gICRzY29wZS5wMUV2ZW50cyA9IHAxRXZlbnRzO1xyXG4gICRzY29wZS5wMkV2ZW50cyA9IHAyRXZlbnRzO1xyXG4gICRzY29wZS5zdGF0ZVBhcmFtcyA9ICRzdGF0ZVBhcmFtcztcclxufSk7Il0sImZpbGUiOiJhcnRpc3RUb29scy9yZUZvclJlL3JlRm9yUmVJbnRlcmFjdGlvbi5qcyJ9
