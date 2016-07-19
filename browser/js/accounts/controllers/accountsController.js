app.config(function($stateProvider) {
  $stateProvider.state('accounts', {
    url: '/admin/accounts',
    templateUrl: 'js/accounts/views/accounts.html',
    controller: 'accountsController'
  })
});

app.controller('accountsController', function($rootScope, $state, $scope, $http, AuthService, SessionService,$sce,accountService) {
	if (!SessionService.getUser()) {
  	$state.go('admin');
	}
 	$scope.user = SessionService.getUser();
 	$scope.soundcloudLogin = function() {
    $scope.processing = true;
    SC.connect()
    .then(function(res) {
      $rootScope.accessToken = res.oauth_token;
      return $http.post('/api/login/soundCloudAuthentication', {
        token: res.oauth_token
      });
    })
    .then(function(res) {
      var scInfo = res.data.user.soundcloud;
      scInfo.group = "";     
      scInfo.price = 0;    
      $http.post('/api/database/updateUserAccount', {
        soundcloudInfo: scInfo,
      }).then(function(user) {
        $scope.processing = false;
        location.reload();
      });
    })
    .then(null, function(err) {
      $.Zebra_Dialog('Error: Could not log in');
      $scope.processing = false;
    });
	};

  $scope.deletePaidRepost = function(index) {
    $.Zebra_Dialog('Do you really want to delete this account?', {
      'buttons': [{
        caption: 'Yes',
        callback: function() {
          var postRepost = $scope.user.paidRepost[index].id;
          accountService.deleteUserAccount(postRepost)
          .then(function(res){
            $scope.user.paidRepost.splice(index, 1);
          })
        }
      },
      { 
        caption: 'No', 
        callback: function() {} 
      }]
    });
  };

  $scope.updateGroup = function(account){
    $scope.processing = true;
    $http.post('/api/database/updateGroup', {
      paidRepost: $scope.user.paidRepost,
    }).then(function(res) {
      $scope.processing = false;
      SessionService.create(res.data);
      $scope.user = SessionService.getUser();
    });
  }
});