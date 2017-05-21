app.config(function($stateProvider) {
  $stateProvider.state('artistToolsScheduler', {
    url: '/artistTools/scheduler',
    templateUrl: 'js/artistTools/scheduler/scheduler.html',
    controller: 'ATSchedulerController',
    resolve: {
      events: function($http, $window, SessionService) {
        if (!SessionService.getUser()) {
          $window.localStorage.setItem('returnstate', 'artistToolsScheduler');
          $window.location.href = '/login';
        }
        return $http.get('/api/events/forUser/' + SessionService.getUser().soundcloud.id)
          .then(function(res) {
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

app.controller('ATSchedulerController', function($rootScope, $state, $scope, $http, AuthService, $window, events, SessionService) {
  if (!SessionService.getUser()) {
    $state.go('login');
  } else {
    $window.localStorage.removeItem('returnstate');
  }
  events.forEach(function(ev) {
    ev.day = new Date(ev.day);
  });
  $scope.events = events;
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcnRpc3RUb29scy9zY2hlZHVsZXIvc2NoZWR1bGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYXJ0aXN0VG9vbHNTY2hlZHVsZXInLCB7XHJcbiAgICB1cmw6ICcvYXJ0aXN0VG9vbHMvc2NoZWR1bGVyJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvYXJ0aXN0VG9vbHMvc2NoZWR1bGVyL3NjaGVkdWxlci5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdBVFNjaGVkdWxlckNvbnRyb2xsZXInLFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICBldmVudHM6IGZ1bmN0aW9uKCRodHRwLCAkd2luZG93LCBTZXNzaW9uU2VydmljZSkge1xyXG4gICAgICAgIGlmICghU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSB7XHJcbiAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdyZXR1cm5zdGF0ZScsICdhcnRpc3RUb29sc1NjaGVkdWxlcicpO1xyXG4gICAgICAgICAgJHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9sb2dpbic7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZXZlbnRzL2ZvclVzZXIvJyArIFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKS5zb3VuZGNsb3VkLmlkKVxyXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJlcnJvciBnZXR0aW5nIHlvdXIgZXZlbnRzXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSlcclxufSk7XHJcblxyXG5hcHAuY29udHJvbGxlcignQVRTY2hlZHVsZXJDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCBBdXRoU2VydmljZSwgJHdpbmRvdywgZXZlbnRzLCBTZXNzaW9uU2VydmljZSkge1xyXG4gIGlmICghU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSB7XHJcbiAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XHJcbiAgfSBlbHNlIHtcclxuICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3JldHVybnN0YXRlJyk7XHJcbiAgfVxyXG4gIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2KSB7XHJcbiAgICBldi5kYXkgPSBuZXcgRGF0ZShldi5kYXkpO1xyXG4gIH0pO1xyXG4gICRzY29wZS5ldmVudHMgPSBldmVudHM7XHJcbn0pOyJdLCJmaWxlIjoiYXJ0aXN0VG9vbHMvc2NoZWR1bGVyL3NjaGVkdWxlci5qcyJ9
