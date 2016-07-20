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
      scInfo.description = "";    
      scInfo.price = 1;    
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
       }, {
        caption: 'No', 
        callback: function() {} 
      }]
    });
  };

  $scope.updateGroup = function(account){
    var priceFlag = true;
    for (var i =  $scope.user.paidRepost.length - 1; i >= 0; i--) {
      if ($scope.user.paidRepost[i].price){
        priceFlag=true;
      } else{
        priceFlag=false;
        break;
      }
    }
    if (!priceFlag){
      return $.Zebra_Dialog('Price can not be empty.');
    }
    $scope.processing = true;
    $http.post('/api/database/updateGroup', {
      paidRepost: $scope.user.paidRepost,
    }).then(function(res) {
      $scope.processing = false;
      SessionService.create(res.data);
      $scope.user = SessionService.getUser();
    });
  }
    
  $scope.addItems=function(rowid,index){
    $("#"+rowid).toggleClass();
  }
});