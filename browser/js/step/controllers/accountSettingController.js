app.config(function($stateProvider) {
  $stateProvider.state('step1', {
    url: '/admin/step1',
    templateUrl: 'js/step/views/step1.html',
    controller: 'accountSettingController'
  });

  $stateProvider.state('step2', {
    url: '/admin/step2',
    templateUrl: 'js/step/views/step2.html',
    controller: 'accountSettingController'
  });

  $stateProvider.state('step3', {
    url: '/admin/step3',
    templateUrl: 'js/step/views/step3.html',
    controller: 'accountSettingController'
  });

  $stateProvider.state('step4', {
    url: '/admin/step4',
    templateUrl: 'js/step/views/step4.html',
    controller: 'accountSettingController'
  });

  $stateProvider.state('step5', {
    url: '/admin/step5',
    templateUrl: 'js/step/views/step5.html',
    controller: 'accountSettingController'
  });

  $stateProvider.state('step6', {
    url: '/admin/step6',
    templateUrl: 'js/step/views/step6.html',
    controller: 'accountSettingController'
  });

  $stateProvider.state('step7', {
    url: '/admin/step7',
    templateUrl: 'js/step/views/step7.html',
    controller: 'accountSettingController'
  });

});

app.controller('accountSettingController', function($rootScope, $state, $scope, $http, $window, AccountSettingServices, SessionService) {
  
  $scope.isLoggedIn = SessionService.getUser() ? true : false;
  if (!SessionService.getUser()) {
    $state.go('admin');
  }
  
  $scope.stepButton = [
    {"name":"SONG URL","appendText":" {SONGURL} "},
    {"name":"EMAIL","appendText":" {EMAIL} "},
    {"name":"SONG NAME","appendText":" {SONGNAME} "},
    {"name":"ARTIST","appendText":" {ARTIST} "},
    {"name":"NAME","appendText":" {NAME} "},
    {"name":"NAME OF TRACK","appendText":" {NAMEOFTRACK} "},
    {"name":"TRACK COVER ART","appendText":" {TRACKCOVERART} "},
    {"name":"MY CHANNEL","appendText":" {MYCHANNEL} "},
    {"name":"TODAYS DATE","appendText":" {TODAYSDATE} "}
  ];

  $scope.user=SessionService.getUser();
  if($state.current.url=="/admin/step1"){
    $scope.AccountsStepData=SessionService.getAdminUser();
    if($scope.AccountsStepData==undefined)
      $scope.AccountsStepData = SessionService.getUser();
    else
      $scope.AccountsStepData = SessionService.getAdminUser();

    if(SessionService.getAdminUser()==undefined && $scope.AccountsStepData.submissionData==undefined){
      SessionService.createAdminUser($scope.AccountsStepData);
    }
    
    if($scope.AccountsStepData.profilePicture==undefined || $scope.AccountsStepData.profilePicture==""){
      $scope.AccountsStepData.profilePicture = "assets/images/info_button.png";
    }
  }
  else{
    $scope.AccountsStepData= SessionService.getAdminUser();
  }

  $scope.updateProfileWithPicture = function(data) {
    $scope.processing = true;
    if(typeof $scope.profilepic === 'undefined')
    {
      //saveToDb(null,$scope.AccountsStepData.profilePicture);
    }
    else
    {
      // AccountSettingServices.uploadFile($scope.profilepic.file).then(function(res) {
      //   if (res.success) {
      //     saveToDb(res,res.data.Location);
      //   }
      // });
    }       
    
    function saveToDb(res,url)
    {
      // AccountSettingServices
      // .updateAdminProfile({
      //   username: data.name,
      //   pictureUrl: url
      // })
      // .then(function(res) {
      //   SessionService.create(res.data);
      //   $scope.user = SessionService.getUser();
      //   $scope.processing = false;
      //   $.Zebra_Dialog('Profile updated Successfully');
      // })
      // .catch(function() {
      // });
    }
  } 
    $scope.nextStep = function(step,currentData){
      console.log(step);
      switch(step){
        case 1 : 
          $state.go("step1");
          break;
        case 2: 
          var next = true;
          if($scope.AccountsStepData.name=="" || $scope.AccountsStepData.email=="")
            next =false;
          if($scope.AccountsStepData.newpassword!="" && $scope.AccountsStepData.newconfirmpassword!=$scope.AccountsStepData.newpassword)
            next =false;
          if(next){
            var profilePicture = $("#profilePicture").attr("src");
            $scope.AccountsStepData.profilePictureData = profilePicture;
            SessionService.createAdminUser($scope.AccountsStepData);
            $state.go("step2");
          }
          else
            return;
          break; 
        case 3: 
          SessionService.createAdminUser($scope.AccountsStepData);
          $state.go("step3");
          break; 
        case 4: 
          $scope.AccountsStepData.postData =  $scope.AccountsStepData.postData ? $scope.AccountsStepData.postData:{};
          $scope.AccountsStepData.postData.background = $scope.AccountsStepData.postData.background ? $scope.AccountsStepData.postData.background:{};

          SessionService.createAdminUser($scope.AccountsStepData);
          $state.go("step4");
          break;     
        case 5: 
          var templateLogo = $("#templateLogo").attr("src");
          $scope.AccountsStepData.postData.logo.images = templateLogo;
          $scope.AccountsStepData.premier =  $scope.AccountsStepData.premier ? $scope.AccountsStepData.premier:{};
          $scope.AccountsStepData.premier.background = $scope.AccountsStepData.premier.background ? $scope.AccountsStepData.premier.background:{};

          SessionService.createAdminUser($scope.AccountsStepData);
          $state.go("step5");
          break;   

        case 6: 
          var templateLogo = $("#templatepremierLogo").attr("src");
          $scope.AccountsStepData.premier.logo.images = templateLogo;
          SessionService.createAdminUser($scope.AccountsStepData);
          $state.go("step6");
          break;  
        case 7: 

          $scope.AccountsStepData.customizeemails = $scope.AccountsStepData.customizeemails ? $scope.AccountsStepData.customizeemails:{"acceptance":{"subject":"","body":""},"decline":{"subject":"","body":""}};
          SessionService.createAdminUser($scope.AccountsStepData);
          $state.go("step7");
          break;      
      }
    }

    $scope.addBackGroundImage = function(image,step){
      if(step==4){
        $scope.AccountsStepData.postData =  $scope.AccountsStepData.postData ? $scope.AccountsStepData.postData:{};
        $scope.AccountsStepData.postData.background = $scope.AccountsStepData.postData.background ? $scope.AccountsStepData.postData.background:{};
        $scope.AccountsStepData.postData.background.images = image;
      }
      else if(step==5){
        $scope.AccountsStepData.premier =  $scope.AccountsStepData.premier ? $scope.AccountsStepData.premier:{};
        $scope.AccountsStepData.premier.background = $scope.AccountsStepData.premier.background ? $scope.AccountsStepData.postData.background:{};
        $scope.AccountsStepData.premier.background.images = image;
      }
    }

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
        scInfo.groups = [];
        scInfo.description = "";    
        scInfo.price = 1;    
        $http.post('/api/database/updateUserAccount', {
          soundcloudInfo: scInfo,
        }).then(function(user) {
          $scope.processing = false;
          scInfo.PriceForEachRepost = 0;
          $scope.AccountsStepData.submissionData =scInfo;
          var url = $scope.AccountsStepData.submissionData.username+'.artistsunlimited.com/submit';
          $scope.AccountsStepData.submissionData.submitURL=url;
          SessionService.createAdminUser($scope.AccountsStepData);        
        });
      })
      .then(null, function(err) {
        $.Zebra_Dialog('Error: Could not log in');
        $scope.processing = false;
      });
    }; 


  $scope.appendBody = function(btn){
    if($('.selectedBox').length){
      var cursorPos = $('.selectedBox').prop('selectionStart');
      var v = $('.selectedBox').val();
      var textBefore = v.substring(0,  cursorPos );
      var textAfter  = v.substring( cursorPos, v.length );
      var newtext = textBefore+ btn.appendText +textAfter;

      if($('.selectedBox').hasClass("decline")){
        $scope.AccountsStepData.customizeemails.decline.body = newtext;
      }
      else if($('.selectedBox').hasClass("acceptance")){
        $scope.AccountsStepData.customizeemails.acceptance.body = newtext; 
      }
      $('textarea').removeClass("selectedBox");
      SessionService.createAdminUser($scope.AccountsStepData);   
    }
  } 

});