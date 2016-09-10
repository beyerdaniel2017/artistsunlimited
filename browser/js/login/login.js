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
  var userData = SessionService.getUser();
  $scope.isLoggedIn = SessionService.getUser() ? true : false;
  if($scope.isLoggedIn){
    if(userData.paypal_email==undefined || userData.paypal_email=="")
    $state.go('basicstep1');
    else{
      SessionService.removeAccountusers();
      $state.go('accounts');
  }
  }

  $scope.login = function() {
    $scope.message = {
      val: '',
      visible: false
    };
    AuthService
      .login($scope.loginObj)
      .then(handleLoginResponse)
      .catch(handleLoginError)

    function handleLoginResponse(res) {
      if (res.status === 200 && res.data.success) {
        var userData = res.data.user;
        userData.isAdmin = true;
        SessionService.create(userData);
        if(userData.paypal_email==undefined || userData.paypal_email=="")
        $state.go('basicstep1');
        else{
          SessionService.removeAccountusers();
          $state.go('accounts');
        }

      } else {
        $scope.message = {
          val: res.data.message,
          visible: true
        };
      }
    }

    function handleLoginError(res) {
      $scope.message = {
        val: 'Error in processing your request',
        visible: true
      };
    }
  };
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