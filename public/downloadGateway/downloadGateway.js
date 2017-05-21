app.config(function($stateProvider) {
  $stateProvider
    .state('adminDownloadGateway', {
      url: '/admin/downloadGateway',
      templateUrl: 'js/downloadGateway/downloadGateway.list.html',
      controller: 'AdminDownloadGatewayController',
      resolve: {
        isLoggedIn: function($stateParams, $window, SessionService) {
          if (!SessionService.getUser()) {
            $window.localStorage.setItem('returnstate', 'adminDownloadGateway');
            $window.localStorage.setItem('tid', $stateParams.gatewayID);
            $window.location.href = '/admin';
          }
          return true;
        },
      }
    })
    .state('adminDownloadGatewayEdit', {
      url: '/admin/downloadGateway/edit/:gatewayID',
      templateUrl: 'js/downloadGateway/downloadGateway.html',
      controller: 'AdminDownloadGatewayController',
      resolve: {
        isLoggedIn: function($stateParams, $window, SessionService) {
          if (!SessionService.getUser()) {
            $window.localStorage.setItem('returnstate', 'adminDownloadGatewayEdit');
            $window.localStorage.setItem('tid', $stateParams.gatewayID);
            $window.location.href = '/admin';
          }
          return true;
        },
      }
    })
    .state('adminDownloadGatewayNew', {
      url: '/admin/downloadGateway/new',
      params: {
        submission: null
      },
      templateUrl: 'js/downloadGateway/downloadGateway.html',
      controller: 'AdminDownloadGatewayController',
      resolve: {
        isLoggedIn: function($stateParams, $window, SessionService) {
          if (!SessionService.getUser()) {
            $window.localStorage.setItem('returnstate', 'adminDownloadGatewayNew');
            $window.location.href = '/admin';
          }
          return true;
        },
      }
    })
    .state('adminDownloadGatewayPreview', {
      url: '/admin/downloadGateway/preview',
      params: {
        submission: null
      },
      templateUrl: 'js/downloadGateway/preview.html',
      controller: 'AdminDownloadGatewayController',
    })
});

app.controller('AdminDownloadGatewayController', function($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, SessionService, AdminToolsService, AdminDLGateService, DownloadTrackService) {
  // /* Init Download Gateway form data */
  $scope.isLoggedIn = SessionService.getUser() ? true : false;
  $scope.curATUser = SessionService.getUser();
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkb3dubG9hZEdhdGV3YXkvZG93bmxvYWRHYXRld2F5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlclxyXG4gICAgLnN0YXRlKCdhZG1pbkRvd25sb2FkR2F0ZXdheScsIHtcclxuICAgICAgdXJsOiAnL2FkbWluL2Rvd25sb2FkR2F0ZXdheScsXHJcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvZG93bmxvYWRHYXRld2F5L2Rvd25sb2FkR2F0ZXdheS5saXN0Lmh0bWwnLFxyXG4gICAgICBjb250cm9sbGVyOiAnQWRtaW5Eb3dubG9hZEdhdGV3YXlDb250cm9sbGVyJyxcclxuICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgIGlzTG9nZ2VkSW46IGZ1bmN0aW9uKCRzdGF0ZVBhcmFtcywgJHdpbmRvdywgU2Vzc2lvblNlcnZpY2UpIHtcclxuICAgICAgICAgIGlmICghU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSB7XHJcbiAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3JldHVybnN0YXRlJywgJ2FkbWluRG93bmxvYWRHYXRld2F5Jyk7XHJcbiAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3RpZCcsICRzdGF0ZVBhcmFtcy5nYXRld2F5SUQpO1xyXG4gICAgICAgICAgICAkd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2FkbWluJztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICAuc3RhdGUoJ2FkbWluRG93bmxvYWRHYXRld2F5RWRpdCcsIHtcclxuICAgICAgdXJsOiAnL2FkbWluL2Rvd25sb2FkR2F0ZXdheS9lZGl0LzpnYXRld2F5SUQnLFxyXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2Rvd25sb2FkR2F0ZXdheS9kb3dubG9hZEdhdGV3YXkuaHRtbCcsXHJcbiAgICAgIGNvbnRyb2xsZXI6ICdBZG1pbkRvd25sb2FkR2F0ZXdheUNvbnRyb2xsZXInLFxyXG4gICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgaXNMb2dnZWRJbjogZnVuY3Rpb24oJHN0YXRlUGFyYW1zLCAkd2luZG93LCBTZXNzaW9uU2VydmljZSkge1xyXG4gICAgICAgICAgaWYgKCFTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkpIHtcclxuICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncmV0dXJuc3RhdGUnLCAnYWRtaW5Eb3dubG9hZEdhdGV3YXlFZGl0Jyk7XHJcbiAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3RpZCcsICRzdGF0ZVBhcmFtcy5nYXRld2F5SUQpO1xyXG4gICAgICAgICAgICAkd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2FkbWluJztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiB0cnVlO1xyXG4gICAgICAgIH0sXHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICAuc3RhdGUoJ2FkbWluRG93bmxvYWRHYXRld2F5TmV3Jywge1xyXG4gICAgICB1cmw6ICcvYWRtaW4vZG93bmxvYWRHYXRld2F5L25ldycsXHJcbiAgICAgIHBhcmFtczoge1xyXG4gICAgICAgIHN1Ym1pc3Npb246IG51bGxcclxuICAgICAgfSxcclxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9kb3dubG9hZEdhdGV3YXkvZG93bmxvYWRHYXRld2F5Lmh0bWwnLFxyXG4gICAgICBjb250cm9sbGVyOiAnQWRtaW5Eb3dubG9hZEdhdGV3YXlDb250cm9sbGVyJyxcclxuICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgIGlzTG9nZ2VkSW46IGZ1bmN0aW9uKCRzdGF0ZVBhcmFtcywgJHdpbmRvdywgU2Vzc2lvblNlcnZpY2UpIHtcclxuICAgICAgICAgIGlmICghU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSB7XHJcbiAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3JldHVybnN0YXRlJywgJ2FkbWluRG93bmxvYWRHYXRld2F5TmV3Jyk7XHJcbiAgICAgICAgICAgICR3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4nO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfSxcclxuICAgICAgfVxyXG4gICAgfSlcclxuICAgIC5zdGF0ZSgnYWRtaW5Eb3dubG9hZEdhdGV3YXlQcmV2aWV3Jywge1xyXG4gICAgICB1cmw6ICcvYWRtaW4vZG93bmxvYWRHYXRld2F5L3ByZXZpZXcnLFxyXG4gICAgICBwYXJhbXM6IHtcclxuICAgICAgICBzdWJtaXNzaW9uOiBudWxsXHJcbiAgICAgIH0sXHJcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvZG93bmxvYWRHYXRld2F5L3ByZXZpZXcuaHRtbCcsXHJcbiAgICAgIGNvbnRyb2xsZXI6ICdBZG1pbkRvd25sb2FkR2F0ZXdheUNvbnRyb2xsZXInLFxyXG4gICAgfSlcclxufSk7XHJcblxyXG5hcHAuY29udHJvbGxlcignQWRtaW5Eb3dubG9hZEdhdGV3YXlDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsICRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgJHdpbmRvdywgJHVpYk1vZGFsLCAkdGltZW91dCwgU2Vzc2lvblNlcnZpY2UsIEFkbWluVG9vbHNTZXJ2aWNlLCBBZG1pbkRMR2F0ZVNlcnZpY2UsIERvd25sb2FkVHJhY2tTZXJ2aWNlKSB7XHJcbiAgLy8gLyogSW5pdCBEb3dubG9hZCBHYXRld2F5IGZvcm0gZGF0YSAqL1xyXG4gICRzY29wZS5pc0xvZ2dlZEluID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICRzY29wZS5jdXJBVFVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbn0pOyJdLCJmaWxlIjoiZG93bmxvYWRHYXRld2F5L2Rvd25sb2FkR2F0ZXdheS5qcyJ9
