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
