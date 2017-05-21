app.config(function($stateProvider) {
  $stateProvider
    .state('artistToolsDownloadGatewayEdit', {
      url: '/artistTools/downloadGateway/edit/:gatewayID',
      templateUrl: 'js/artistTools/downloadGateway/downloadGateway.html',
      controller: 'ArtistToolsDownloadGatewayController',
      resolve: {
        isLoggedIn: function($stateParams, $window, SessionService) {
          if (!SessionService.getUser()) {
            $window.localStorage.setItem('returnstate', 'artistToolsDownloadGatewayEdit');
            $window.localStorage.setItem('tid', $stateParams.gatewayID);
            $window.location.href = '/login';
          }
          return true;
        }
      }
    })
    .state('artistToolsDownloadGatewayNew', {
      url: '/artistTools/downloadGateway/new',
      params: {
        submission: null
      },
      templateUrl: 'js/artistTools/downloadGateway/downloadGateway.html',
      controller: 'ArtistToolsDownloadGatewayController',
      resolve: {
        isLoggedIn: function($stateParams, $window, SessionService) {
          if (!SessionService.getUser()) {
            $window.localStorage.setItem('returnstate', 'artistToolsDownloadGatewayNew');
            $window.location.href = '/login';
          }
          return true;
        }
      }
    })
});

app.controller('ArtistToolsDownloadGatewayController', function($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, SessionService, ArtistToolsService, AdminDLGateService) {
  /* Init Download Gateway form data */
  $scope.user = SessionService.getUser();
  if (!SessionService.getUser()) {
    $state.go('login');
  } else {
    $window.localStorage.removeItem('returnstate');
    $window.localStorage.removeItem('tid');
  }
  $scope.curATUser = SessionService.getUser();
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcnRpc3RUb29scy9kb3dubG9hZEdhdGV3YXkvZG93bmxvYWRHYXRld2F5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlclxyXG4gICAgLnN0YXRlKCdhcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheUVkaXQnLCB7XHJcbiAgICAgIHVybDogJy9hcnRpc3RUb29scy9kb3dubG9hZEdhdGV3YXkvZWRpdC86Z2F0ZXdheUlEJyxcclxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hcnRpc3RUb29scy9kb3dubG9hZEdhdGV3YXkvZG93bmxvYWRHYXRld2F5Lmh0bWwnLFxyXG4gICAgICBjb250cm9sbGVyOiAnQXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlDb250cm9sbGVyJyxcclxuICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgIGlzTG9nZ2VkSW46IGZ1bmN0aW9uKCRzdGF0ZVBhcmFtcywgJHdpbmRvdywgU2Vzc2lvblNlcnZpY2UpIHtcclxuICAgICAgICAgIGlmICghU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSB7XHJcbiAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3JldHVybnN0YXRlJywgJ2FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5RWRpdCcpO1xyXG4gICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0aWQnLCAkc3RhdGVQYXJhbXMuZ2F0ZXdheUlEKTtcclxuICAgICAgICAgICAgJHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9sb2dpbic7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICAuc3RhdGUoJ2FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5TmV3Jywge1xyXG4gICAgICB1cmw6ICcvYXJ0aXN0VG9vbHMvZG93bmxvYWRHYXRld2F5L25ldycsXHJcbiAgICAgIHBhcmFtczoge1xyXG4gICAgICAgIHN1Ym1pc3Npb246IG51bGxcclxuICAgICAgfSxcclxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hcnRpc3RUb29scy9kb3dubG9hZEdhdGV3YXkvZG93bmxvYWRHYXRld2F5Lmh0bWwnLFxyXG4gICAgICBjb250cm9sbGVyOiAnQXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlDb250cm9sbGVyJyxcclxuICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgIGlzTG9nZ2VkSW46IGZ1bmN0aW9uKCRzdGF0ZVBhcmFtcywgJHdpbmRvdywgU2Vzc2lvblNlcnZpY2UpIHtcclxuICAgICAgICAgIGlmICghU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSB7XHJcbiAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3JldHVybnN0YXRlJywgJ2FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5TmV3Jyk7XHJcbiAgICAgICAgICAgICR3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvbG9naW4nO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KVxyXG59KTtcclxuXHJcbmFwcC5jb250cm9sbGVyKCdBcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheUNvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uLCAkd2luZG93LCAkdWliTW9kYWwsICR0aW1lb3V0LCBTZXNzaW9uU2VydmljZSwgQXJ0aXN0VG9vbHNTZXJ2aWNlLCBBZG1pbkRMR2F0ZVNlcnZpY2UpIHtcclxuICAvKiBJbml0IERvd25sb2FkIEdhdGV3YXkgZm9ybSBkYXRhICovXHJcbiAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgaWYgKCFTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkpIHtcclxuICAgICRzdGF0ZS5nbygnbG9naW4nKTtcclxuICB9IGVsc2Uge1xyXG4gICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgncmV0dXJuc3RhdGUnKTtcclxuICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3RpZCcpO1xyXG4gIH1cclxuICAkc2NvcGUuY3VyQVRVc2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG59KTsiXSwiZmlsZSI6ImFydGlzdFRvb2xzL2Rvd25sb2FkR2F0ZXdheS9kb3dubG9hZEdhdGV3YXkuanMifQ==
