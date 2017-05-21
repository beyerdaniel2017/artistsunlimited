app.config(function($stateProvider) {
  $stateProvider.state('settings', {
    url: '/admin/settings',
    templateUrl: 'js/settings/views/settings.html',
    controller: 'settingsController'
  })
});

app.controller('settingsController', function($rootScope, $state, $scope, $http, SettingService, SessionService) {
  if (!SessionService.getUser()) {
    $state.go('admin');
  }

  $scope.user = SessionService.getUser();
  $scope.profile = SessionService.getUser();  
  $scope.updateProfileWithPicture = function(data) {
    $scope.processing = true;
    if(typeof $scope.profilepic === 'undefined')
    {
      saveToDb(null, $scope.profile.profilePicture);
    }
    else
    {
      SettingService.uploadFile($scope.profilepic.file).then(function(res) {
        if (res.success) {
          saveToDb(res, res.data.Location);
        }
      });
    }

    function saveToDb(res,url)
    {
      SettingService
        .updateAdminProfile({
          username: data.name,
          pictureUrl: url
        })
        .then(function(res) {
          SessionService.create(res.data);
          $scope.user = SessionService.getUser();
          $scope.processing = false;
          $.Zebra_Dialog('Profile updated Successfully');
        })
      .catch(function() {
      });
    }
  }

  $scope.updatePassword = function(data) {
    if (data.newPassword != data.confirmPassword) {
      $.Zebra_Dialog('Password doesn\'t match with confirm password');
      return;
    } 
    else {
      $scope.processing = true;
      SettingService
        .updateAdminProfile({
          password: data.newPassword,
        }).then(function(res) {
          $scope.processing = false;
          $.Zebra_Dialog('Password changed successfully.');
      }).catch(function() {
      });
    }
  }
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzZXR0aW5ncy9jb250cm9sbGVyL3NldHRpbmdzQ29udHJvbGxlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XHJcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3NldHRpbmdzJywge1xyXG4gICAgdXJsOiAnL2FkbWluL3NldHRpbmdzJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvc2V0dGluZ3Mvdmlld3Mvc2V0dGluZ3MuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnc2V0dGluZ3NDb250cm9sbGVyJ1xyXG4gIH0pXHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ3NldHRpbmdzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgU2V0dGluZ1NlcnZpY2UsIFNlc3Npb25TZXJ2aWNlKSB7XHJcbiAgaWYgKCFTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkpIHtcclxuICAgICRzdGF0ZS5nbygnYWRtaW4nKTtcclxuICB9XHJcblxyXG4gICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICRzY29wZS5wcm9maWxlID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpOyAgXHJcbiAgJHNjb3BlLnVwZGF0ZVByb2ZpbGVXaXRoUGljdHVyZSA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgIGlmKHR5cGVvZiAkc2NvcGUucHJvZmlsZXBpYyA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICB7XHJcbiAgICAgIHNhdmVUb0RiKG51bGwsICRzY29wZS5wcm9maWxlLnByb2ZpbGVQaWN0dXJlKTtcclxuICAgIH1cclxuICAgIGVsc2VcclxuICAgIHtcclxuICAgICAgU2V0dGluZ1NlcnZpY2UudXBsb2FkRmlsZSgkc2NvcGUucHJvZmlsZXBpYy5maWxlKS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgIGlmIChyZXMuc3VjY2Vzcykge1xyXG4gICAgICAgICAgc2F2ZVRvRGIocmVzLCByZXMuZGF0YS5Mb2NhdGlvbik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBzYXZlVG9EYihyZXMsdXJsKVxyXG4gICAge1xyXG4gICAgICBTZXR0aW5nU2VydmljZVxyXG4gICAgICAgIC51cGRhdGVBZG1pblByb2ZpbGUoe1xyXG4gICAgICAgICAgdXNlcm5hbWU6IGRhdGEubmFtZSxcclxuICAgICAgICAgIHBpY3R1cmVVcmw6IHVybFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUocmVzLmRhdGEpO1xyXG4gICAgICAgICAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coJ1Byb2ZpbGUgdXBkYXRlZCBTdWNjZXNzZnVsbHknKTtcclxuICAgICAgICB9KVxyXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oKSB7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgJHNjb3BlLnVwZGF0ZVBhc3N3b3JkID0gZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgaWYgKGRhdGEubmV3UGFzc3dvcmQgIT0gZGF0YS5jb25maXJtUGFzc3dvcmQpIHtcclxuICAgICAgJC5aZWJyYV9EaWFsb2coJ1Bhc3N3b3JkIGRvZXNuXFwndCBtYXRjaCB3aXRoIGNvbmZpcm0gcGFzc3dvcmQnKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfSBcclxuICAgIGVsc2Uge1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgIFNldHRpbmdTZXJ2aWNlXHJcbiAgICAgICAgLnVwZGF0ZUFkbWluUHJvZmlsZSh7XHJcbiAgICAgICAgICBwYXNzd29yZDogZGF0YS5uZXdQYXNzd29yZCxcclxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICQuWmVicmFfRGlhbG9nKCdQYXNzd29yZCBjaGFuZ2VkIHN1Y2Nlc3NmdWxseS4nKTtcclxuICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oKSB7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxufSk7Il0sImZpbGUiOiJzZXR0aW5ncy9jb250cm9sbGVyL3NldHRpbmdzQ29udHJvbGxlci5qcyJ9
