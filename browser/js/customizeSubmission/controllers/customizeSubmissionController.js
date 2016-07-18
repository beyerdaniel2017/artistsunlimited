app.config(function($stateProvider) {
  $stateProvider.state('customizesubmission', {
    url: '/admin/customizesubmission',
    templateUrl: 'js/customizeSubmission/views/customizeSubmission.html',
    controller: 'CustomizeSubmissionController'
  })
});

app.controller('CustomizeSubmissionController', function($rootScope, $state, $scope, $http, AuthService, SessionService,$sce,customizeService) {
  if (!SessionService.getUser()) {
    $state.go('admin');
  }
  $scope.user = SessionService.getUser();
  $scope.submission = {}; 
  $scope.postData = {};
  $scope.genreArray = [
    'Alternative Rock',
    'Ambient',
    'Creative',
    'Chill',
    'Classical',
    'Country',
    'Dance & EDM',
    'Dancehall',
    'Deep House',
    'Disco',
    'Drum & Bass',
    'Dubstep',
    'Electronic',
    'Festival',
    'Folk',
    'Hip-Hop/RNB',
    'House',
    'Indie/Alternative',
    'Latin',
    'Trap',
    'Vocalists/Singer-Songwriter'
  ];

  $scope.saveSettings=function(){
    $scope.processing = true;
    //customizeService.uploadFile($scope.backImage.file).then(function(res){
      //var backImage=res.Location;
  	  //$scope.postData.backgroundimage=backImage;
      $scope.postData.userID = $scope.user._id;
      var subHeadingText = ($scope.postData.subHeading.text ? $scope.postData.subHeading.text.replace(/\r?\n/g, '<br />') : '');
      $scope.postData.subHeading.text = subHeadingText;     
      customizeService.addCustomize($scope.postData)
      .then(function(response){  
        $scope.processing = false;
        $.Zebra_Dialog("Saved Successfully");        
      }).catch(function (error) {
        console.log("er",error);
      });
    //}) 
  }

  $scope.getCustomizeSettings=function()
  {
    customizeService.getCustomPageSettings($scope.user._id)
    .then(function(response){
      $scope.postData = response;
      $scope.customizeSettings = response;
    });    
  }
});