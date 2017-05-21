app.config(function($stateProvider) {
  $stateProvider.state('customemailbuttons', {
    url: '/admin/customemailbuttons',
    templateUrl: 'js/customEmailButtons/views/customEmailButtons.html',
    controller: 'CustomEmailButtonController'
  })
});

app.controller('CustomEmailButtonController', function($rootScope, $state, $scope, $http, AuthService, SessionService,$sce,customizeService) {
  if (!SessionService.getUser()) {
    $state.go('admin');
  }
  $scope.user = SessionService.getUser();
  $scope.customEmailButtons = $scope.user.customEmailButtons ? $scope.user.customEmailButtons : [];
  if($scope.customEmailButtons.length == 0){
    $scope.customEmailButtons.push({
      toEmail: '',
      subject: '',
      emailBody: '',
      buttonText: '',
      buttonBgColor: ''
    });
  }
  $scope.saveSettings=function(){
    var valid = true;
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    angular.forEach($scope.customEmailButtons, function(cb) {
      if(cb.toEmail != "{email}"){
        var validEmail = re.test(cb.toEmail);
        if (!validEmail) {
          valid = false;
        }
      }
    });
    if(!valid){
      $.Zebra_Dialog('Please enter {email} or a well formatted email id in Tom Email field.');
      return;
    }
    $scope.processing = true;
    $scope.user.customEmailButtons = $scope.customEmailButtons;
    $http.post('/api/database/updateCustomEmailButtons', {
      customEmailButtons: $scope.user.customEmailButtons,
    }).then(function(res) {
      $scope.processing = false;
      SessionService.create(res.data);
      $scope.user = SessionService.getUser();
    });
  }

  $scope.addItem = function() {
    $scope.customEmailButtons.push({
      toEmail: '',
      subject: '',
      emailBody: '',
      buttonText: '',
      buttonBgColor: ''
    });
  }

  $scope.removeItem = function(index) {
    $scope.customEmailButtons.splice(index, 1);
  }
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjdXN0b21FbWFpbEJ1dHRvbnMvY29udHJvbGxlcnMvY3VzdG9tRW1haWxCdXR0b25Db250cm9sbGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnY3VzdG9tZW1haWxidXR0b25zJywge1xyXG4gICAgdXJsOiAnL2FkbWluL2N1c3RvbWVtYWlsYnV0dG9ucycsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2N1c3RvbUVtYWlsQnV0dG9ucy92aWV3cy9jdXN0b21FbWFpbEJ1dHRvbnMuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnQ3VzdG9tRW1haWxCdXR0b25Db250cm9sbGVyJ1xyXG4gIH0pXHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ0N1c3RvbUVtYWlsQnV0dG9uQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgQXV0aFNlcnZpY2UsIFNlc3Npb25TZXJ2aWNlLCRzY2UsY3VzdG9taXplU2VydmljZSkge1xyXG4gIGlmICghU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSB7XHJcbiAgICAkc3RhdGUuZ28oJ2FkbWluJyk7XHJcbiAgfVxyXG4gICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICRzY29wZS5jdXN0b21FbWFpbEJ1dHRvbnMgPSAkc2NvcGUudXNlci5jdXN0b21FbWFpbEJ1dHRvbnMgPyAkc2NvcGUudXNlci5jdXN0b21FbWFpbEJ1dHRvbnMgOiBbXTtcclxuICBpZigkc2NvcGUuY3VzdG9tRW1haWxCdXR0b25zLmxlbmd0aCA9PSAwKXtcclxuICAgICRzY29wZS5jdXN0b21FbWFpbEJ1dHRvbnMucHVzaCh7XHJcbiAgICAgIHRvRW1haWw6ICcnLFxyXG4gICAgICBzdWJqZWN0OiAnJyxcclxuICAgICAgZW1haWxCb2R5OiAnJyxcclxuICAgICAgYnV0dG9uVGV4dDogJycsXHJcbiAgICAgIGJ1dHRvbkJnQ29sb3I6ICcnXHJcbiAgICB9KTtcclxuICB9XHJcbiAgJHNjb3BlLnNhdmVTZXR0aW5ncz1mdW5jdGlvbigpe1xyXG4gICAgdmFyIHZhbGlkID0gdHJ1ZTtcclxuICAgIHZhciByZSA9IC9eKChbXjw+KClcXFtcXF1cXFxcLiw7Olxcc0BcIl0rKFxcLltePD4oKVxcW1xcXVxcXFwuLDs6XFxzQFwiXSspKil8KFwiLitcIikpQCgoXFxbWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfV0pfCgoW2EtekEtWlxcLTAtOV0rXFwuKStbYS16QS1aXXsyLH0pKSQvO1xyXG4gICAgYW5ndWxhci5mb3JFYWNoKCRzY29wZS5jdXN0b21FbWFpbEJ1dHRvbnMsIGZ1bmN0aW9uKGNiKSB7XHJcbiAgICAgIGlmKGNiLnRvRW1haWwgIT0gXCJ7ZW1haWx9XCIpe1xyXG4gICAgICAgIHZhciB2YWxpZEVtYWlsID0gcmUudGVzdChjYi50b0VtYWlsKTtcclxuICAgICAgICBpZiAoIXZhbGlkRW1haWwpIHtcclxuICAgICAgICAgIHZhbGlkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIGlmKCF2YWxpZCl7XHJcbiAgICAgICQuWmVicmFfRGlhbG9nKCdQbGVhc2UgZW50ZXIge2VtYWlsfSBvciBhIHdlbGwgZm9ybWF0dGVkIGVtYWlsIGlkIGluIFRvbSBFbWFpbCBmaWVsZC4nKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgJHNjb3BlLnVzZXIuY3VzdG9tRW1haWxCdXR0b25zID0gJHNjb3BlLmN1c3RvbUVtYWlsQnV0dG9ucztcclxuICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvdXBkYXRlQ3VzdG9tRW1haWxCdXR0b25zJywge1xyXG4gICAgICBjdXN0b21FbWFpbEJ1dHRvbnM6ICRzY29wZS51c2VyLmN1c3RvbUVtYWlsQnV0dG9ucyxcclxuICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZShyZXMuZGF0YSk7XHJcbiAgICAgICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuYWRkSXRlbSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLmN1c3RvbUVtYWlsQnV0dG9ucy5wdXNoKHtcclxuICAgICAgdG9FbWFpbDogJycsXHJcbiAgICAgIHN1YmplY3Q6ICcnLFxyXG4gICAgICBlbWFpbEJvZHk6ICcnLFxyXG4gICAgICBidXR0b25UZXh0OiAnJyxcclxuICAgICAgYnV0dG9uQmdDb2xvcjogJydcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLnJlbW92ZUl0ZW0gPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgJHNjb3BlLmN1c3RvbUVtYWlsQnV0dG9ucy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gIH1cclxufSk7Il0sImZpbGUiOiJjdXN0b21FbWFpbEJ1dHRvbnMvY29udHJvbGxlcnMvY3VzdG9tRW1haWxCdXR0b25Db250cm9sbGVyLmpzIn0=
