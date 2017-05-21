app.config(function($stateProvider) {
  $stateProvider.state('scheduler', {
    url: '/admin/scheduler',
    templateUrl: 'js/scheduler/scheduler.html',
    controller: 'adminSchedulerController',
    resolve: {
      events: function($http, $window, SessionService) {
        if (!SessionService.getUser()) {
          $window.localStorage.setItem('returnstate', 'artistToolsScheduler');
          $window.location.href = '/admin';
        }
        return $http.get('/api/events/forUser/' + SessionService.getUser().soundcloud.id)
          .then(function(res) {
            console.log(res + " admin soundcloud.id");
            return res.data;
          })
          .then(null, function(err) {
            $.Zebra_Dialog("error getting your events");
            return;
          })
      }
    }
  })
});

app.controller('adminSchedulerController', function($rootScope, $state, $scope, $http, AuthService, $window, events, SessionService) {
  if (!SessionService.getUser()) {
    $state.go('login');
  } else {
    $window.localStorage.removeItem('returnstate');
  }
  events.forEach(function(ev) {
    ev.day = new Date(ev.day);
  });
  $scope.curATUser = SessionService.getUser();
  $scope.events = events;
  $scope.isLoggedIn = SessionService.getUser() ? true : false;
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzY2hlZHVsZXIvc2NoZWR1bGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnc2NoZWR1bGVyJywge1xyXG4gICAgdXJsOiAnL2FkbWluL3NjaGVkdWxlcicsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL3NjaGVkdWxlci9zY2hlZHVsZXIuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnYWRtaW5TY2hlZHVsZXJDb250cm9sbGVyJyxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgZXZlbnRzOiBmdW5jdGlvbigkaHR0cCwgJHdpbmRvdywgU2Vzc2lvblNlcnZpY2UpIHtcclxuICAgICAgICBpZiAoIVNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKSkge1xyXG4gICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncmV0dXJuc3RhdGUnLCAnYXJ0aXN0VG9vbHNTY2hlZHVsZXInKTtcclxuICAgICAgICAgICR3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2V2ZW50cy9mb3JVc2VyLycgKyBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkuc291bmRjbG91ZC5pZClcclxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMgKyBcIiBhZG1pbiBzb3VuZGNsb3VkLmlkXCIpO1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKFwiZXJyb3IgZ2V0dGluZyB5b3VyIGV2ZW50c1wiKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pXHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ2FkbWluU2NoZWR1bGVyQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgQXV0aFNlcnZpY2UsICR3aW5kb3csIGV2ZW50cywgU2Vzc2lvblNlcnZpY2UpIHtcclxuICBpZiAoIVNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKSkge1xyXG4gICAgJHN0YXRlLmdvKCdsb2dpbicpO1xyXG4gIH0gZWxzZSB7XHJcbiAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdyZXR1cm5zdGF0ZScpO1xyXG4gIH1cclxuICBldmVudHMuZm9yRWFjaChmdW5jdGlvbihldikge1xyXG4gICAgZXYuZGF5ID0gbmV3IERhdGUoZXYuZGF5KTtcclxuICB9KTtcclxuICAkc2NvcGUuY3VyQVRVc2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICRzY29wZS5ldmVudHMgPSBldmVudHM7XHJcbiAgJHNjb3BlLmlzTG9nZ2VkSW4gPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkgPyB0cnVlIDogZmFsc2U7XHJcbn0pOyJdLCJmaWxlIjoic2NoZWR1bGVyL3NjaGVkdWxlci5qcyJ9
