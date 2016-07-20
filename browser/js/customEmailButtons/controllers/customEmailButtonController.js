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
      toEmail: 'virendra.chouhan@linkites.com',
      subject: 'subject 1',
      buttonText: 'button 1',
      buttonBgColor: '#592e2e'
    });
  }
  $scope.saveSettings=function(){
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
      buttonText: '',
      buttonBgColor: ''
    });
  }

  $scope.removeItem = function(index) {
    $scope.customEmailButtons.splice(index, 1);
  }
});