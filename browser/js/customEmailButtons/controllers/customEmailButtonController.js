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