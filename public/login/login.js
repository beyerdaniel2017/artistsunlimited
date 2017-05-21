app.config(function($stateProvider) {
  $stateProvider.state('admin', {
    url: '/admin',
    templateUrl: 'js/login/login.html',
    controller: 'AdminLoginController'
  });
});

app.controller('AdminLoginController', function($rootScope, $state, $scope, $http, AuthService, SessionService, $window) {
  $scope.counter = 0;
  $scope.showingElements = [];
  $scope.submissions = [];
  $scope.loginObj = {};
  $scope.subadminObj = {};
  var userData = SessionService.getUser();
  $scope.isLoggedIn = SessionService.getUser() ? true : false;
  if ($scope.isLoggedIn) {
    if (userData.paypal_email == undefined || userData.paypal_email == "") {
      $state.go('basicstep1');
    } else {
      SessionService.removeAccountusers();
      $state.go('accounts');
    }
  }

  $scope.login = function() {
    $scope.signinError = "";
    AuthService
      .login($scope.loginObj)
      .then(handleLoginResponse)
      .catch(handleLoginError)

    function handleLoginResponse(res) {
      if (res.status === 200 && res.data.success) {
        console.log("rascal admin login test");
        var userData = res.data.user;
        userData.isAdmin = true;
        
        $window.localStorage.setItem('isAdminAuthenticate', true);
        SessionService.create(userData);
        $scope.getIncompleteTradesCount();
        userData.loginInfo = $scope.loginObj;
        $window.localStorage.setItem('adminUser', JSON.stringify(userData));
        $window.localStorage.setItem('hasBeenAdmin', true);
        $scope.getSubmissionCount();
        if (userData.paypal_email == undefined || userData.paypal_email == "")
          $state.go('basicstep1');
        else
        if (!userData.paidRepost[0]) {
          SessionService.addActionsfoAccount('Add', 'index');
          $state.go('channelstep1');
        } else {
          $http.get('/api/users/byId/' + userData.paidRepost[0].userID)
            .then(function(res) {
              $window.localStorage.setItem('prevATUser', JSON.stringify(res.data));
              SessionService.removeAccountusers();
              window.location.href = '/admin/submissions';
            })
            .then(console.debug);
        }
      } else {
        $scope.signinError = "Invalid Email or Password.";
      }
    }

    function handleLoginError(res) {
      $scope.signinError = "Error in processing your request";
    }
  }
  //sub login function
/*  $scope.subadmin = function() {
     console.log("rascal subadmin");
     console.log($scope.subadminObj.email);
     $http.post('/api/thirdpartyuser/login', {           
        email: $scope.subadminObj.email,
        password: $scope.subadminObj.password
      }).then(function(res) {
      console.log("rascal res");
      //window.location.href = '/admin/submissions';
      console.log(les);
      });
  }*/

  $scope.subadmin = function() {
    $scope.signinError = "";
    AuthService
      .subadmin($scope.subadminObj)
      .then(handleLoginResponse)
      .catch(handleLoginError)
      /*
    function handleLoginResponse(res) {
      if (res.status === 200 && res.data.success) {
        var userData = res.data.user;
        userData.isAdmin = true;
        console.log(userData + "userData");
        $window.localStorage.setItem('isAdminAuthenticate', true);
        SessionService.create(userData);
        console.log("rascal admin login test");

        $scope.getIncompleteTradesCount();
        userData.loginInfo = $scope.subadminObj;
        console.log(userData.loginInfo + "loginInfo");
        alert(userData.loginInfo);
        $window.localStorage.setItem('adminUser', JSON.stringify(userData));
        $window.localStorage.setItem('hasBeenAdmin', true);
        $scope.getSubmissionCount();
        if (userData.paypal_email == undefined || userData.paypal_email == "")
          $state.go('basicstep1');
        else
        if (!userData.paidRepost[0]) {
          SessionService.addActionsfoAccount('Add', 'index');
          $state.go('channelstep1');
        } else {
          $http.get('/api/users/byId/' + userData.paidRepost[0].userID)
            .then(function(res) {
              $window.localStorage.setItem('prevATUser', JSON.stringify(res.data));
              SessionService.removeAccountusers();
              window.location.href = '/admin/scheduler';
            })
            .then(console.debug);
        }        
      } else {
        $scope.signinError = "Invalid Email or Password.";
      }
    }*/
    function handleLoginResponse(res) {
      if (res.status === 200 && res.data.success) {
        var userData = res.data.user;
        userData.isAdmin = true;
        console.log(userData + "userData");
        $window.localStorage.setItem('isAdminAuthenticate', true);
        SessionService.create(userData);
        console.log("rascal admin login test");
        $window.localStorage.setItem('isthirdpartyAuthenticate', true);
        $scope.getIncompleteTradesCount();
        userData.loginInfo = $scope.subadminObj;
        $window.localStorage.setItem('adminUser', JSON.stringify(userData));
        $window.localStorage.setItem('hasBeenAdmin', true);
        if (userData.paypal_email == undefined || userData.paypal_email == ""){
          console.log("basicstep1");
          $state.go('thirdpartybasicstep1');
        }
            
      } else {
        $scope.signinError = "Invalid Email or Password.";
      }
    }
    function handleLoginError(res) {
      $scope.signinError = "Error in processing your request";
    }
  }




  $scope.logout = function() {
    $http.get('/api/logout').then(function() {
      SessionService.deleteUser();
      window.location.href = '/admin';
    }).catch(function(err) {
      $scope.processing = false;
      $.Zebra_Dialog('Wrong Password');
    });
  }
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJsb2dpbi9sb2dpbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XHJcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2FkbWluJywge1xyXG4gICAgdXJsOiAnL2FkbWluJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvbG9naW4vbG9naW4uaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnQWRtaW5Mb2dpbkNvbnRyb2xsZXInXHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ0FkbWluTG9naW5Db250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCBBdXRoU2VydmljZSwgU2Vzc2lvblNlcnZpY2UsICR3aW5kb3cpIHtcclxuICAkc2NvcGUuY291bnRlciA9IDA7XHJcbiAgJHNjb3BlLnNob3dpbmdFbGVtZW50cyA9IFtdO1xyXG4gICRzY29wZS5zdWJtaXNzaW9ucyA9IFtdO1xyXG4gICRzY29wZS5sb2dpbk9iaiA9IHt9O1xyXG4gICRzY29wZS5zdWJhZG1pbk9iaiA9IHt9O1xyXG4gIHZhciB1c2VyRGF0YSA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcclxuICAkc2NvcGUuaXNMb2dnZWRJbiA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKSA/IHRydWUgOiBmYWxzZTtcclxuICBpZiAoJHNjb3BlLmlzTG9nZ2VkSW4pIHtcclxuICAgIGlmICh1c2VyRGF0YS5wYXlwYWxfZW1haWwgPT0gdW5kZWZpbmVkIHx8IHVzZXJEYXRhLnBheXBhbF9lbWFpbCA9PSBcIlwiKSB7XHJcbiAgICAgICRzdGF0ZS5nbygnYmFzaWNzdGVwMScpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgU2Vzc2lvblNlcnZpY2UucmVtb3ZlQWNjb3VudHVzZXJzKCk7XHJcbiAgICAgICRzdGF0ZS5nbygnYWNjb3VudHMnKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLnNpZ25pbkVycm9yID0gXCJcIjtcclxuICAgIEF1dGhTZXJ2aWNlXHJcbiAgICAgIC5sb2dpbigkc2NvcGUubG9naW5PYmopXHJcbiAgICAgIC50aGVuKGhhbmRsZUxvZ2luUmVzcG9uc2UpXHJcbiAgICAgIC5jYXRjaChoYW5kbGVMb2dpbkVycm9yKVxyXG5cclxuICAgIGZ1bmN0aW9uIGhhbmRsZUxvZ2luUmVzcG9uc2UocmVzKSB7XHJcbiAgICAgIGlmIChyZXMuc3RhdHVzID09PSAyMDAgJiYgcmVzLmRhdGEuc3VjY2Vzcykge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwicmFzY2FsIGFkbWluIGxvZ2luIHRlc3RcIik7XHJcbiAgICAgICAgdmFyIHVzZXJEYXRhID0gcmVzLmRhdGEudXNlcjtcclxuICAgICAgICB1c2VyRGF0YS5pc0FkbWluID0gdHJ1ZTtcclxuICAgICAgICBcclxuICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdpc0FkbWluQXV0aGVudGljYXRlJywgdHJ1ZSk7XHJcbiAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlKHVzZXJEYXRhKTtcclxuICAgICAgICAkc2NvcGUuZ2V0SW5jb21wbGV0ZVRyYWRlc0NvdW50KCk7XHJcbiAgICAgICAgdXNlckRhdGEubG9naW5JbmZvID0gJHNjb3BlLmxvZ2luT2JqO1xyXG4gICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2FkbWluVXNlcicsIEpTT04uc3RyaW5naWZ5KHVzZXJEYXRhKSk7XHJcbiAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaGFzQmVlbkFkbWluJywgdHJ1ZSk7XHJcbiAgICAgICAgJHNjb3BlLmdldFN1Ym1pc3Npb25Db3VudCgpO1xyXG4gICAgICAgIGlmICh1c2VyRGF0YS5wYXlwYWxfZW1haWwgPT0gdW5kZWZpbmVkIHx8IHVzZXJEYXRhLnBheXBhbF9lbWFpbCA9PSBcIlwiKVxyXG4gICAgICAgICAgJHN0YXRlLmdvKCdiYXNpY3N0ZXAxJyk7XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIGlmICghdXNlckRhdGEucGFpZFJlcG9zdFswXSkge1xyXG4gICAgICAgICAgU2Vzc2lvblNlcnZpY2UuYWRkQWN0aW9uc2ZvQWNjb3VudCgnQWRkJywgJ2luZGV4Jyk7XHJcbiAgICAgICAgICAkc3RhdGUuZ28oJ2NoYW5uZWxzdGVwMScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAkaHR0cC5nZXQoJy9hcGkvdXNlcnMvYnlJZC8nICsgdXNlckRhdGEucGFpZFJlcG9zdFswXS51c2VySUQpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3ByZXZBVFVzZXInLCBKU09OLnN0cmluZ2lmeShyZXMuZGF0YSkpO1xyXG4gICAgICAgICAgICAgIFNlc3Npb25TZXJ2aWNlLnJlbW92ZUFjY291bnR1c2VycygpO1xyXG4gICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hZG1pbi9zdWJtaXNzaW9ucyc7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKGNvbnNvbGUuZGVidWcpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkc2NvcGUuc2lnbmluRXJyb3IgPSBcIkludmFsaWQgRW1haWwgb3IgUGFzc3dvcmQuXCI7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBoYW5kbGVMb2dpbkVycm9yKHJlcykge1xyXG4gICAgICAkc2NvcGUuc2lnbmluRXJyb3IgPSBcIkVycm9yIGluIHByb2Nlc3NpbmcgeW91ciByZXF1ZXN0XCI7XHJcbiAgICB9XHJcbiAgfVxyXG4gIC8vc3ViIGxvZ2luIGZ1bmN0aW9uXHJcbi8qICAkc2NvcGUuc3ViYWRtaW4gPSBmdW5jdGlvbigpIHtcclxuICAgICBjb25zb2xlLmxvZyhcInJhc2NhbCBzdWJhZG1pblwiKTtcclxuICAgICBjb25zb2xlLmxvZygkc2NvcGUuc3ViYWRtaW5PYmouZW1haWwpO1xyXG4gICAgICRodHRwLnBvc3QoJy9hcGkvdGhpcmRwYXJ0eXVzZXIvbG9naW4nLCB7ICAgICAgICAgICBcclxuICAgICAgICBlbWFpbDogJHNjb3BlLnN1YmFkbWluT2JqLmVtYWlsLFxyXG4gICAgICAgIHBhc3N3b3JkOiAkc2NvcGUuc3ViYWRtaW5PYmoucGFzc3dvcmRcclxuICAgICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgY29uc29sZS5sb2coXCJyYXNjYWwgcmVzXCIpO1xyXG4gICAgICAvL3dpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hZG1pbi9zdWJtaXNzaW9ucyc7XHJcbiAgICAgIGNvbnNvbGUubG9nKGxlcyk7XHJcbiAgICAgIH0pO1xyXG4gIH0qL1xyXG5cclxuICAkc2NvcGUuc3ViYWRtaW4gPSBmdW5jdGlvbigpIHtcclxuICAgICRzY29wZS5zaWduaW5FcnJvciA9IFwiXCI7XHJcbiAgICBBdXRoU2VydmljZVxyXG4gICAgICAuc3ViYWRtaW4oJHNjb3BlLnN1YmFkbWluT2JqKVxyXG4gICAgICAudGhlbihoYW5kbGVMb2dpblJlc3BvbnNlKVxyXG4gICAgICAuY2F0Y2goaGFuZGxlTG9naW5FcnJvcilcclxuICAgICAgLypcclxuICAgIGZ1bmN0aW9uIGhhbmRsZUxvZ2luUmVzcG9uc2UocmVzKSB7XHJcbiAgICAgIGlmIChyZXMuc3RhdHVzID09PSAyMDAgJiYgcmVzLmRhdGEuc3VjY2Vzcykge1xyXG4gICAgICAgIHZhciB1c2VyRGF0YSA9IHJlcy5kYXRhLnVzZXI7XHJcbiAgICAgICAgdXNlckRhdGEuaXNBZG1pbiA9IHRydWU7XHJcbiAgICAgICAgY29uc29sZS5sb2codXNlckRhdGEgKyBcInVzZXJEYXRhXCIpO1xyXG4gICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2lzQWRtaW5BdXRoZW50aWNhdGUnLCB0cnVlKTtcclxuICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUodXNlckRhdGEpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwicmFzY2FsIGFkbWluIGxvZ2luIHRlc3RcIik7XHJcblxyXG4gICAgICAgICRzY29wZS5nZXRJbmNvbXBsZXRlVHJhZGVzQ291bnQoKTtcclxuICAgICAgICB1c2VyRGF0YS5sb2dpbkluZm8gPSAkc2NvcGUuc3ViYWRtaW5PYmo7XHJcbiAgICAgICAgY29uc29sZS5sb2codXNlckRhdGEubG9naW5JbmZvICsgXCJsb2dpbkluZm9cIik7XHJcbiAgICAgICAgYWxlcnQodXNlckRhdGEubG9naW5JbmZvKTtcclxuICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhZG1pblVzZXInLCBKU09OLnN0cmluZ2lmeSh1c2VyRGF0YSkpO1xyXG4gICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2hhc0JlZW5BZG1pbicsIHRydWUpO1xyXG4gICAgICAgICRzY29wZS5nZXRTdWJtaXNzaW9uQ291bnQoKTtcclxuICAgICAgICBpZiAodXNlckRhdGEucGF5cGFsX2VtYWlsID09IHVuZGVmaW5lZCB8fCB1c2VyRGF0YS5wYXlwYWxfZW1haWwgPT0gXCJcIilcclxuICAgICAgICAgICRzdGF0ZS5nbygnYmFzaWNzdGVwMScpO1xyXG4gICAgICAgIGVsc2VcclxuICAgICAgICBpZiAoIXVzZXJEYXRhLnBhaWRSZXBvc3RbMF0pIHtcclxuICAgICAgICAgIFNlc3Npb25TZXJ2aWNlLmFkZEFjdGlvbnNmb0FjY291bnQoJ0FkZCcsICdpbmRleCcpO1xyXG4gICAgICAgICAgJHN0YXRlLmdvKCdjaGFubmVsc3RlcDEnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgJGh0dHAuZ2V0KCcvYXBpL3VzZXJzL2J5SWQvJyArIHVzZXJEYXRhLnBhaWRSZXBvc3RbMF0udXNlcklEKVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdwcmV2QVRVc2VyJywgSlNPTi5zdHJpbmdpZnkocmVzLmRhdGEpKTtcclxuICAgICAgICAgICAgICBTZXNzaW9uU2VydmljZS5yZW1vdmVBY2NvdW50dXNlcnMoKTtcclxuICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4vc2NoZWR1bGVyJztcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oY29uc29sZS5kZWJ1Zyk7XHJcbiAgICAgICAgfSAgICAgICAgXHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgJHNjb3BlLnNpZ25pbkVycm9yID0gXCJJbnZhbGlkIEVtYWlsIG9yIFBhc3N3b3JkLlwiO1xyXG4gICAgICB9XHJcbiAgICB9Ki9cclxuICAgIGZ1bmN0aW9uIGhhbmRsZUxvZ2luUmVzcG9uc2UocmVzKSB7XHJcbiAgICAgIGlmIChyZXMuc3RhdHVzID09PSAyMDAgJiYgcmVzLmRhdGEuc3VjY2Vzcykge1xyXG4gICAgICAgIHZhciB1c2VyRGF0YSA9IHJlcy5kYXRhLnVzZXI7XHJcbiAgICAgICAgdXNlckRhdGEuaXNBZG1pbiA9IHRydWU7XHJcbiAgICAgICAgY29uc29sZS5sb2codXNlckRhdGEgKyBcInVzZXJEYXRhXCIpO1xyXG4gICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2lzQWRtaW5BdXRoZW50aWNhdGUnLCB0cnVlKTtcclxuICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUodXNlckRhdGEpO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKFwicmFzY2FsIGFkbWluIGxvZ2luIHRlc3RcIik7XHJcbiAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaXN0aGlyZHBhcnR5QXV0aGVudGljYXRlJywgdHJ1ZSk7XHJcbiAgICAgICAgJHNjb3BlLmdldEluY29tcGxldGVUcmFkZXNDb3VudCgpO1xyXG4gICAgICAgIHVzZXJEYXRhLmxvZ2luSW5mbyA9ICRzY29wZS5zdWJhZG1pbk9iajtcclxuICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdhZG1pblVzZXInLCBKU09OLnN0cmluZ2lmeSh1c2VyRGF0YSkpO1xyXG4gICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2hhc0JlZW5BZG1pbicsIHRydWUpO1xyXG4gICAgICAgIGlmICh1c2VyRGF0YS5wYXlwYWxfZW1haWwgPT0gdW5kZWZpbmVkIHx8IHVzZXJEYXRhLnBheXBhbF9lbWFpbCA9PSBcIlwiKXtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKFwiYmFzaWNzdGVwMVwiKTtcclxuICAgICAgICAgICRzdGF0ZS5nbygndGhpcmRwYXJ0eWJhc2ljc3RlcDEnKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgICAgIFxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICRzY29wZS5zaWduaW5FcnJvciA9IFwiSW52YWxpZCBFbWFpbCBvciBQYXNzd29yZC5cIjtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gaGFuZGxlTG9naW5FcnJvcihyZXMpIHtcclxuICAgICAgJHNjb3BlLnNpZ25pbkVycm9yID0gXCJFcnJvciBpbiBwcm9jZXNzaW5nIHlvdXIgcmVxdWVzdFwiO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcblxyXG5cclxuXHJcbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJGh0dHAuZ2V0KCcvYXBpL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgIFNlc3Npb25TZXJ2aWNlLmRlbGV0ZVVzZXIoKTtcclxuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2FkbWluJztcclxuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAkLlplYnJhX0RpYWxvZygnV3JvbmcgUGFzc3dvcmQnKTtcclxuICAgIH0pO1xyXG4gIH1cclxufSk7XHJcbiJdLCJmaWxlIjoibG9naW4vbG9naW4uanMifQ==
