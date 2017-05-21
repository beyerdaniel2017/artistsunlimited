app.config(function($stateProvider) {
  $stateProvider.state('basicstep1', {
    url: '/admin/basic/step1',
    templateUrl: 'js/accountsStep/views/basicstep1.html',
    controller: 'accountSettingController'
  });

  $stateProvider.state('basicstep2', {
    url: '/admin/basic/step2',
    templateUrl: 'js/accountsStep/views/basicstep2.html',
    controller: 'accountSettingController'
  });

  $stateProvider.state('basicstep3', {
    url: '/admin/basic/step3',
    templateUrl: 'js/accountsStep/views/basicstep3.html',
    controller: 'accountSettingController'
  });

  $stateProvider.state('basicstep4', {
    url: '/admin/basic/step4',
    templateUrl: 'js/accountsStep/views/basicstep4.html',
    controller: 'accountSettingController'
  });

  $stateProvider.state('basicstep5', {
    url: '/admin/basic/step5',
    templateUrl: 'js/accountsStep/views/basicstep5.html',
    controller: 'accountSettingController'
  });

  $stateProvider.state('channelstep1', {
    url: '/admin/channel/step1',
    templateUrl: 'js/accountsStep/views/channelstep1.html',
    controller: 'accountSettingController'
  });

  $stateProvider.state('channelstep2', {
    url: '/admin/channel/step2',
    templateUrl: 'js/accountsStep/views/channelstep2.html',
    controller: 'accountSettingController'
  });

  $stateProvider.state('channelstep3', {
    url: '/admin/channel/step3',
    templateUrl: 'js/accountsStep/views/channelstep3.html',
    controller: 'accountSettingController'
  });

  $stateProvider.state('channelstep4', {
    url: '/admin/channel/step4',
    templateUrl: 'js/accountsStep/views/channelstep4.html',
    controller: 'accountSettingController'
  });

  $stateProvider.state('channelstep5', {
    url: '/admin/channel/step5',
    templateUrl: 'js/accountsStep/views/channelstep5.html',
    controller: 'accountSettingController'
  });

  $stateProvider.state('channelstep6', {
    url: '/admin/channel/step6',
    templateUrl: 'js/accountsStep/views/channelstep6.html',
    controller: 'accountSettingController'
  });
  $stateProvider.state('channelstep7', {
    url: '/admin/channel/step7',
    templateUrl: 'js/accountsStep/views/channelstep7.html',
    controller: 'accountSettingController'
  });
});

app.controller('accountSettingController', function($rootScope, $state, $scope, $http, $window, AccountSettingServices, SessionService) {

  $scope.defaultSubmitPage = {
    "button": {
      "text": "Submit",
      "style": {
        "fontColor": "rgba(0,0,0,1)",
        "bgColor": "rgba(255,255,255,1)",
        "fontSize": 15,
        "border": 1,
        "borderRadius": 10
      }
    },
    "inputFields": {
      "style": {
        "borderColor": "rgba(179,179,179,1)",
        "borderRadius": 10,
        "border": 1
      }
    },
    "subHeading": {
      "text": "Our mission is to connect musicians to their audiences. By submitting your track, you receive the opportunity to be reviewed by countless industry leading music promoters and independent labels. Although we can’t guarantee your track will be accepted, we can ensure that every submission will get heard and considered.",
      "style": {
        "fontFamily": "'Open Sans', sans-serif",
        "fontColor": "rgba(120,120,120,1)",
        "fontSize": 15
      }
    },
    "heading": {
      "text": "Submission",
      "style": {
        "fontSize": 32,
        "fontFamily": "'Open Sans', sans-serif",
        "fontColor": "rgba(120,120,120,1)"
      }
    },
    "logo": {
      "align": "center",
      "images": ""
    },
    "background": {
      "blur": 40,
      "images": ""
    },
    "layout": '4'
  }

  $scope.loadFontNames = function() {
    $scope.repHeadFont = $scope.AccountsStepData.postData.heading.style.fontFamily ? $scope.AccountsStepData.postData.heading.style.fontFamily.substring(1, $scope.AccountsStepData.postData.heading.style.fontFamily.indexOf("',")) : "";
    $scope.repSubheadFont = $scope.AccountsStepData.postData.subHeading.style.fontFamily ? $scope.AccountsStepData.postData.subHeading.style.fontFamily.substring(1, $scope.AccountsStepData.postData.subHeading.style.fontFamily.indexOf("',")) : "";
    $scope.premHeadFont = $scope.AccountsStepData.premier.heading.style.fontFamily ? $scope.AccountsStepData.premier.heading.style.fontFamily.substring(1, $scope.AccountsStepData.premier.heading.style.fontFamily.indexOf("',")) : "";
    $scope.premSubheadFont = $scope.AccountsStepData.premier.subHeading.style.fontFamily ? $scope.AccountsStepData.premier.subHeading.style.fontFamily.substring(1, $scope.AccountsStepData.premier.subHeading.style.fontFamily.indexOf("',")) : "";
  }

  $scope.isLoggedIn = SessionService.getUser() ? true : false;
  if (!$scope.isLoggedIn) {
    $state.go('admin');
  }
  $scope.user = SessionService.getUser();
  $scope.showTestEmailModal = false;
  $scope.errorverification = false;
  $scope.verified = false;
  $scope.waitoneminute = false;
  console.log('user', $scope.user);
  var formActions = SessionService.getActionsfoAccount() ? SessionService.getActionsfoAccount() : 0;
  if (!formActions && formActions != "Add" && formActions != "Edit") {
    $scope.user = SessionService.getUser();
    if ($scope.user && $scope.user.role == 'admin') {
      $rootScope.enableNavigation = $scope.user.paidRepost.length > 0 ? false : true;
    }
    $scope.showTestEmailModal = false;
    $scope.errorverification = false;
    $scope.verified = false;
    $scope.waitoneminute = false;
    //console.log('user',$scope.user);
    var formActions = SessionService.getActionsfoAccount() ? SessionService.getActionsfoAccount() : 0;
    if (!formActions && formActions != "Add" && formActions != "Edit") {
      $scope.user = SessionService.getUser();
      if ($state.current.url == "/admin/basic/step1") {
        if ($scope.AccountsStepData == undefined) {
          $scope.AccountsStepData = SessionService.getUser();
          $scope.AccountsStepData.formActions = formActions;
        } else {
          $scope.AccountsStepData = SessionService.getAdminUser();
          $scope.AccountsStepData.formActions = formActions;
        }
        $scope.AccountsStepData.newpassword = "";
        if (SessionService.getAdminUser() == undefined && $scope.AccountsStepData.submissionData == undefined) {
          SessionService.createAdminUser($scope.AccountsStepData);
        }
        if ($scope.AccountsStepData.profilePicture == undefined || $scope.AccountsStepData.profilePicture == "") {
          $scope.AccountsStepData.profilePicture = "https://i1.sndcdn.com/avatars-000223599301-0ns076-t500x500.jpg";
        }
      } else {
        $scope.AccountsStepData = SessionService.getAdminUser();
        $scope.AccountsStepData.formActions = '';
        $scope.AccountsStepData.newpassword = "";
      }
    } else if (formActions == "Admin") {
      $scope.AccountsStepData = {};
      if ($state.current.url == "/admin/basic/step1") {
        $scope.AccountsStepData = SessionService.getUser();
        $scope.AccountsStepData.formActions = formActions;
      } else {
        $scope.AccountsStepData = SessionService.getAdminUser();
        $scope.AccountsStepData.formActions = formActions;
      }
      $scope.AccountsStepData.newpassword = "";
      if (SessionService.getAdminUser() == undefined && $scope.AccountsStepData.submissionData == undefined) {
        SessionService.createAdminUser($scope.AccountsStepData);
      }
      if ($scope.AccountsStepData.profilePicture == undefined || $scope.AccountsStepData.profilePicture == "") {
        $scope.AccountsStepData.profilePicture = "https://i1.sndcdn.com/avatars-000223599301-0ns076-t500x500.jpg";
      }
    } else {
      $scope.AccountsStepData = SessionService.getAdminUser();
      $scope.AccountsStepData.formActions = '';
      $scope.AccountsStepData.newpassword = "";
    }
  } else if (formActions == "Admin") {
    $scope.AccountsStepData = {};
    if ($state.current.url == "/admin/basic/step1") {
      $scope.AccountsStepData = SessionService.getUser();
      $scope.AccountsStepData.formActions = formActions;
    } else
      $scope.AccountsStepData = SessionService.getAdminUser();
  } else if (formActions == "Add") {
    $scope.AccountsStepData = SessionService.getAdminUser() ? SessionService.getAdminUser() : {};
    $scope.AccountsStepData.postData = JSON.parse(JSON.stringify($scope.defaultSubmitPage));
    $scope.AccountsStepData.premier = JSON.parse(JSON.stringify($scope.defaultSubmitPage));
    $scope.loadFontNames();
    $scope.AccountsStepData.postData.heading.text = "Submission for Repost";
    $scope.AccountsStepData.postData.type = "submit";
    $scope.AccountsStepData.premier.heading.text = "Submission for Premiere";
    $scope.AccountsStepData.premier.type = "premiere";
    $scope.AccountsStepData.formActions = formActions;
  } else if (formActions == "Edit") {
    if ($scope.AccountsStepData == undefined) $scope.AccountsStepData = {};
    $scope.AccountsStepData.formActions = formActions;
    var user_id = SessionService.getActionsfoAccountIndex();
    if (user_id != undefined && $scope.AccountsStepData.submissionData == undefined && $state.current.url == "/admin/channel/step1") {
      var userId = "";
      $http.get('/api/submissions/getAccountsByIndex/' + user_id)
        .then(function(res) {
          $scope.AccountsStepData.submissionData = res.data;
          $scope.AccountsStepData.submissionData.submissionUrl = res.data.submissionUrl.replace(/ /g, '');
          $scope.AccountsStepData.submissionData.submissionUrl = $scope.AccountsStepData.submissionData.submissionUrl.replace('/custom', '');
          $scope.AccountsStepData.submissionData.premierUrl = res.data.premierUrl.replace(/ /g, '');
          $scope.AccountsStepData.submissionData.premierUrl = $scope.AccountsStepData.submissionData.premierUrl.replace('/custom', '');
          $scope.AccountsStepData.submissionData.username = res.data.user.username;
          $scope.AccountsStepData.submissionData.avatarURL = res.data.user.avatarURL;
          $scope.AccountsStepData.submissionData.followers = res.data.user.followers;
          $scope.AccountsStepData.submissionData.userID = res.data.userID;
          userId = res.data.userID;
          $scope.defaultSubmitPage.userID = userId;
          $scope.AccountsStepData.repostSettings = res.data.repostSettings;
          $scope.AccountsStepData.price = res.data.price;
          $scope.AccountsStepData.description = res.data.description;
          $scope.AccountsStepData.astzOffset = res.data.astzOffset;
          if (res.data.availableSlots) {
            $scope.AccountsStepData.pseudoAvailableSlots = createPseudoAvailableSlots(res.data);
          } else {
            $scope.AccountsStepData.pseudoAvailableSlots = {
              'sunday': [1, 4, 8, 11, 14, 17, 20],
              'monday': [1, 4, 8, 11, 14, 17, 20],
              'tuesday': [1, 4, 8, 11, 14, 17, 20],
              'wednesday': [1, 4, 8, 11, 14, 17, 20],
              'thursday': [1, 4, 8, 11, 14, 17, 20],
              'friday': [1, 4, 8, 11, 14, 17, 20],
              'saturday': [1, 4, 8, 11, 14, 17, 20]
            }
          }
          $http.get('/api/users/byId/' + userId)
            .then(function(response) {
              if (response.data) {
                // $scope.AccountsStepData.repostSettings = response.data.repostSettings;
                $scope.AccountsStepData.queue = response.data.queue;
                $scope.AccountsStepData.repostSettings = response.data.repostSettings;
                $scope.AccountsStepData.astzOffset = response.data.astzOffset;
                if (response.data.availableSlots) {
                  $scope.AccountsStepData.pseudoAvailableSlots = createPseudoAvailableSlots(response.data);
                } else {
                  $scope.AccountsStepData.pseudoAvailableSlots = {
                    'sunday': [1, 4, 8, 11, 14, 17, 20],
                    'monday': [1, 4, 8, 11, 14, 17, 20],
                    'tuesday': [1, 4, 8, 11, 14, 17, 20],
                    'wednesday': [1, 4, 8, 11, 14, 17, 20],
                    'thursday': [1, 4, 8, 11, 14, 17, 20],
                    'friday': [1, 4, 8, 11, 14, 17, 20],
                    'saturday': [1, 4, 8, 11, 14, 17, 20]
                  }
                }
              }
              $http.get('/api/customsubmissions/getCustomSubmissionAll/' + userId)
                .then(function(response) {
                  var i = -1;
                  var nextFun = function() {
                    i++;
                    if (i < response.data.length) {
                      var loopdata = response.data[i];
                      if (loopdata.type == "submit") {
                        $scope.AccountsStepData.postData = loopdata;
                      } else if (loopdata.type == "premiere") {
                        $scope.AccountsStepData.premier = loopdata;
                      }
                      nextFun();
                    } else {
                      SessionService.createAdminUser($scope.AccountsStepData);
                    }
                  }
                  nextFun();
                  $scope.loadFontNames();
                });
            })
        });
    } else {
      $scope.AccountsStepData = SessionService.getAdminUser();
    }
  }
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhY2NvdW50c1N0ZXAvY29udHJvbGxlcnMvYWNjb3VudFNldHRpbmdDb250cm9sbGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYmFzaWNzdGVwMScsIHtcclxuICAgIHVybDogJy9hZG1pbi9iYXNpYy9zdGVwMScsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2FjY291bnRzU3RlcC92aWV3cy9iYXNpY3N0ZXAxLmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ2FjY291bnRTZXR0aW5nQ29udHJvbGxlcidcclxuICB9KTtcclxuXHJcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2Jhc2ljc3RlcDInLCB7XHJcbiAgICB1cmw6ICcvYWRtaW4vYmFzaWMvc3RlcDInLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9hY2NvdW50c1N0ZXAvdmlld3MvYmFzaWNzdGVwMi5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdhY2NvdW50U2V0dGluZ0NvbnRyb2xsZXInXHJcbiAgfSk7XHJcblxyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdiYXNpY3N0ZXAzJywge1xyXG4gICAgdXJsOiAnL2FkbWluL2Jhc2ljL3N0ZXAzJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvYWNjb3VudHNTdGVwL3ZpZXdzL2Jhc2ljc3RlcDMuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnYWNjb3VudFNldHRpbmdDb250cm9sbGVyJ1xyXG4gIH0pO1xyXG5cclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYmFzaWNzdGVwNCcsIHtcclxuICAgIHVybDogJy9hZG1pbi9iYXNpYy9zdGVwNCcsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2FjY291bnRzU3RlcC92aWV3cy9iYXNpY3N0ZXA0Lmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ2FjY291bnRTZXR0aW5nQ29udHJvbGxlcidcclxuICB9KTtcclxuXHJcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2Jhc2ljc3RlcDUnLCB7XHJcbiAgICB1cmw6ICcvYWRtaW4vYmFzaWMvc3RlcDUnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9hY2NvdW50c1N0ZXAvdmlld3MvYmFzaWNzdGVwNS5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdhY2NvdW50U2V0dGluZ0NvbnRyb2xsZXInXHJcbiAgfSk7XHJcblxyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdjaGFubmVsc3RlcDEnLCB7XHJcbiAgICB1cmw6ICcvYWRtaW4vY2hhbm5lbC9zdGVwMScsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2FjY291bnRzU3RlcC92aWV3cy9jaGFubmVsc3RlcDEuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnYWNjb3VudFNldHRpbmdDb250cm9sbGVyJ1xyXG4gIH0pO1xyXG5cclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnY2hhbm5lbHN0ZXAyJywge1xyXG4gICAgdXJsOiAnL2FkbWluL2NoYW5uZWwvc3RlcDInLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9hY2NvdW50c1N0ZXAvdmlld3MvY2hhbm5lbHN0ZXAyLmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ2FjY291bnRTZXR0aW5nQ29udHJvbGxlcidcclxuICB9KTtcclxuXHJcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2NoYW5uZWxzdGVwMycsIHtcclxuICAgIHVybDogJy9hZG1pbi9jaGFubmVsL3N0ZXAzJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvYWNjb3VudHNTdGVwL3ZpZXdzL2NoYW5uZWxzdGVwMy5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdhY2NvdW50U2V0dGluZ0NvbnRyb2xsZXInXHJcbiAgfSk7XHJcblxyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdjaGFubmVsc3RlcDQnLCB7XHJcbiAgICB1cmw6ICcvYWRtaW4vY2hhbm5lbC9zdGVwNCcsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2FjY291bnRzU3RlcC92aWV3cy9jaGFubmVsc3RlcDQuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnYWNjb3VudFNldHRpbmdDb250cm9sbGVyJ1xyXG4gIH0pO1xyXG5cclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnY2hhbm5lbHN0ZXA1Jywge1xyXG4gICAgdXJsOiAnL2FkbWluL2NoYW5uZWwvc3RlcDUnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9hY2NvdW50c1N0ZXAvdmlld3MvY2hhbm5lbHN0ZXA1Lmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ2FjY291bnRTZXR0aW5nQ29udHJvbGxlcidcclxuICB9KTtcclxuXHJcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2NoYW5uZWxzdGVwNicsIHtcclxuICAgIHVybDogJy9hZG1pbi9jaGFubmVsL3N0ZXA2JyxcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvYWNjb3VudHNTdGVwL3ZpZXdzL2NoYW5uZWxzdGVwNi5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdhY2NvdW50U2V0dGluZ0NvbnRyb2xsZXInXHJcbiAgfSk7XHJcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2NoYW5uZWxzdGVwNycsIHtcclxuICAgIHVybDogJy9hZG1pbi9jaGFubmVsL3N0ZXA3JyxcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvYWNjb3VudHNTdGVwL3ZpZXdzL2NoYW5uZWxzdGVwNy5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdhY2NvdW50U2V0dGluZ0NvbnRyb2xsZXInXHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ2FjY291bnRTZXR0aW5nQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgJHdpbmRvdywgQWNjb3VudFNldHRpbmdTZXJ2aWNlcywgU2Vzc2lvblNlcnZpY2UpIHtcclxuXHJcbiAgJHNjb3BlLmRlZmF1bHRTdWJtaXRQYWdlID0ge1xyXG4gICAgXCJidXR0b25cIjoge1xyXG4gICAgICBcInRleHRcIjogXCJTdWJtaXRcIixcclxuICAgICAgXCJzdHlsZVwiOiB7XHJcbiAgICAgICAgXCJmb250Q29sb3JcIjogXCJyZ2JhKDAsMCwwLDEpXCIsXHJcbiAgICAgICAgXCJiZ0NvbG9yXCI6IFwicmdiYSgyNTUsMjU1LDI1NSwxKVwiLFxyXG4gICAgICAgIFwiZm9udFNpemVcIjogMTUsXHJcbiAgICAgICAgXCJib3JkZXJcIjogMSxcclxuICAgICAgICBcImJvcmRlclJhZGl1c1wiOiAxMFxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJpbnB1dEZpZWxkc1wiOiB7XHJcbiAgICAgIFwic3R5bGVcIjoge1xyXG4gICAgICAgIFwiYm9yZGVyQ29sb3JcIjogXCJyZ2JhKDE3OSwxNzksMTc5LDEpXCIsXHJcbiAgICAgICAgXCJib3JkZXJSYWRpdXNcIjogMTAsXHJcbiAgICAgICAgXCJib3JkZXJcIjogMVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJzdWJIZWFkaW5nXCI6IHtcclxuICAgICAgXCJ0ZXh0XCI6IFwiT3VyIG1pc3Npb24gaXMgdG8gY29ubmVjdCBtdXNpY2lhbnMgdG8gdGhlaXIgYXVkaWVuY2VzLiBCeSBzdWJtaXR0aW5nIHlvdXIgdHJhY2ssIHlvdSByZWNlaXZlIHRoZSBvcHBvcnR1bml0eSB0byBiZSByZXZpZXdlZCBieSBjb3VudGxlc3MgaW5kdXN0cnkgbGVhZGluZyBtdXNpYyBwcm9tb3RlcnMgYW5kIGluZGVwZW5kZW50IGxhYmVscy4gQWx0aG91Z2ggd2UgY2Fu4oCZdCBndWFyYW50ZWUgeW91ciB0cmFjayB3aWxsIGJlIGFjY2VwdGVkLCB3ZSBjYW4gZW5zdXJlIHRoYXQgZXZlcnkgc3VibWlzc2lvbiB3aWxsIGdldCBoZWFyZCBhbmQgY29uc2lkZXJlZC5cIixcclxuICAgICAgXCJzdHlsZVwiOiB7XHJcbiAgICAgICAgXCJmb250RmFtaWx5XCI6IFwiJ09wZW4gU2FucycsIHNhbnMtc2VyaWZcIixcclxuICAgICAgICBcImZvbnRDb2xvclwiOiBcInJnYmEoMTIwLDEyMCwxMjAsMSlcIixcclxuICAgICAgICBcImZvbnRTaXplXCI6IDE1XHJcbiAgICAgIH1cclxuICAgIH0sXHJcbiAgICBcImhlYWRpbmdcIjoge1xyXG4gICAgICBcInRleHRcIjogXCJTdWJtaXNzaW9uXCIsXHJcbiAgICAgIFwic3R5bGVcIjoge1xyXG4gICAgICAgIFwiZm9udFNpemVcIjogMzIsXHJcbiAgICAgICAgXCJmb250RmFtaWx5XCI6IFwiJ09wZW4gU2FucycsIHNhbnMtc2VyaWZcIixcclxuICAgICAgICBcImZvbnRDb2xvclwiOiBcInJnYmEoMTIwLDEyMCwxMjAsMSlcIlxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJsb2dvXCI6IHtcclxuICAgICAgXCJhbGlnblwiOiBcImNlbnRlclwiLFxyXG4gICAgICBcImltYWdlc1wiOiBcIlwiXHJcbiAgICB9LFxyXG4gICAgXCJiYWNrZ3JvdW5kXCI6IHtcclxuICAgICAgXCJibHVyXCI6IDQwLFxyXG4gICAgICBcImltYWdlc1wiOiBcIlwiXHJcbiAgICB9LFxyXG4gICAgXCJsYXlvdXRcIjogJzQnXHJcbiAgfVxyXG5cclxuICAkc2NvcGUubG9hZEZvbnROYW1lcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLnJlcEhlYWRGb250ID0gJHNjb3BlLkFjY291bnRzU3RlcERhdGEucG9zdERhdGEuaGVhZGluZy5zdHlsZS5mb250RmFtaWx5ID8gJHNjb3BlLkFjY291bnRzU3RlcERhdGEucG9zdERhdGEuaGVhZGluZy5zdHlsZS5mb250RmFtaWx5LnN1YnN0cmluZygxLCAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS5oZWFkaW5nLnN0eWxlLmZvbnRGYW1pbHkuaW5kZXhPZihcIicsXCIpKSA6IFwiXCI7XHJcbiAgICAkc2NvcGUucmVwU3ViaGVhZEZvbnQgPSAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS5zdWJIZWFkaW5nLnN0eWxlLmZvbnRGYW1pbHkgPyAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS5zdWJIZWFkaW5nLnN0eWxlLmZvbnRGYW1pbHkuc3Vic3RyaW5nKDEsICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBvc3REYXRhLnN1YkhlYWRpbmcuc3R5bGUuZm9udEZhbWlseS5pbmRleE9mKFwiJyxcIikpIDogXCJcIjtcclxuICAgICRzY29wZS5wcmVtSGVhZEZvbnQgPSAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyLmhlYWRpbmcuc3R5bGUuZm9udEZhbWlseSA/ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIuaGVhZGluZy5zdHlsZS5mb250RmFtaWx5LnN1YnN0cmluZygxLCAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyLmhlYWRpbmcuc3R5bGUuZm9udEZhbWlseS5pbmRleE9mKFwiJyxcIikpIDogXCJcIjtcclxuICAgICRzY29wZS5wcmVtU3ViaGVhZEZvbnQgPSAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyLnN1YkhlYWRpbmcuc3R5bGUuZm9udEZhbWlseSA/ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIuc3ViSGVhZGluZy5zdHlsZS5mb250RmFtaWx5LnN1YnN0cmluZygxLCAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyLnN1YkhlYWRpbmcuc3R5bGUuZm9udEZhbWlseS5pbmRleE9mKFwiJyxcIikpIDogXCJcIjtcclxuICB9XHJcblxyXG4gICRzY29wZS5pc0xvZ2dlZEluID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpID8gdHJ1ZSA6IGZhbHNlO1xyXG4gIGlmICghJHNjb3BlLmlzTG9nZ2VkSW4pIHtcclxuICAgICRzdGF0ZS5nbygnYWRtaW4nKTtcclxuICB9XHJcbiAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgJHNjb3BlLnNob3dUZXN0RW1haWxNb2RhbCA9IGZhbHNlO1xyXG4gICRzY29wZS5lcnJvcnZlcmlmaWNhdGlvbiA9IGZhbHNlO1xyXG4gICRzY29wZS52ZXJpZmllZCA9IGZhbHNlO1xyXG4gICRzY29wZS53YWl0b25lbWludXRlID0gZmFsc2U7XHJcbiAgY29uc29sZS5sb2coJ3VzZXInLCAkc2NvcGUudXNlcik7XHJcbiAgdmFyIGZvcm1BY3Rpb25zID0gU2Vzc2lvblNlcnZpY2UuZ2V0QWN0aW9uc2ZvQWNjb3VudCgpID8gU2Vzc2lvblNlcnZpY2UuZ2V0QWN0aW9uc2ZvQWNjb3VudCgpIDogMDtcclxuICBpZiAoIWZvcm1BY3Rpb25zICYmIGZvcm1BY3Rpb25zICE9IFwiQWRkXCIgJiYgZm9ybUFjdGlvbnMgIT0gXCJFZGl0XCIpIHtcclxuICAgICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICAgaWYgKCRzY29wZS51c2VyICYmICRzY29wZS51c2VyLnJvbGUgPT0gJ2FkbWluJykge1xyXG4gICAgICAkcm9vdFNjb3BlLmVuYWJsZU5hdmlnYXRpb24gPSAkc2NvcGUudXNlci5wYWlkUmVwb3N0Lmxlbmd0aCA+IDAgPyBmYWxzZSA6IHRydWU7XHJcbiAgICB9XHJcbiAgICAkc2NvcGUuc2hvd1Rlc3RFbWFpbE1vZGFsID0gZmFsc2U7XHJcbiAgICAkc2NvcGUuZXJyb3J2ZXJpZmljYXRpb24gPSBmYWxzZTtcclxuICAgICRzY29wZS52ZXJpZmllZCA9IGZhbHNlO1xyXG4gICAgJHNjb3BlLndhaXRvbmVtaW51dGUgPSBmYWxzZTtcclxuICAgIC8vY29uc29sZS5sb2coJ3VzZXInLCRzY29wZS51c2VyKTtcclxuICAgIHZhciBmb3JtQWN0aW9ucyA9IFNlc3Npb25TZXJ2aWNlLmdldEFjdGlvbnNmb0FjY291bnQoKSA/IFNlc3Npb25TZXJ2aWNlLmdldEFjdGlvbnNmb0FjY291bnQoKSA6IDA7XHJcbiAgICBpZiAoIWZvcm1BY3Rpb25zICYmIGZvcm1BY3Rpb25zICE9IFwiQWRkXCIgJiYgZm9ybUFjdGlvbnMgIT0gXCJFZGl0XCIpIHtcclxuICAgICAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgIGlmICgkc3RhdGUuY3VycmVudC51cmwgPT0gXCIvYWRtaW4vYmFzaWMvc3RlcDFcIikge1xyXG4gICAgICAgIGlmICgkc2NvcGUuQWNjb3VudHNTdGVwRGF0YSA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEuZm9ybUFjdGlvbnMgPSBmb3JtQWN0aW9ucztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEgPSBTZXNzaW9uU2VydmljZS5nZXRBZG1pblVzZXIoKTtcclxuICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLmZvcm1BY3Rpb25zID0gZm9ybUFjdGlvbnM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLm5ld3Bhc3N3b3JkID0gXCJcIjtcclxuICAgICAgICBpZiAoU2Vzc2lvblNlcnZpY2UuZ2V0QWRtaW5Vc2VyKCkgPT0gdW5kZWZpbmVkICYmICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnN1Ym1pc3Npb25EYXRhID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlQWRtaW5Vc2VyKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByb2ZpbGVQaWN0dXJlID09IHVuZGVmaW5lZCB8fCAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcm9maWxlUGljdHVyZSA9PSBcIlwiKSB7XHJcbiAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcm9maWxlUGljdHVyZSA9IFwiaHR0cHM6Ly9pMS5zbmRjZG4uY29tL2F2YXRhcnMtMDAwMjIzNTk5MzAxLTBuczA3Ni10NTAweDUwMC5qcGdcIjtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEgPSBTZXNzaW9uU2VydmljZS5nZXRBZG1pblVzZXIoKTtcclxuICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5mb3JtQWN0aW9ucyA9ICcnO1xyXG4gICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLm5ld3Bhc3N3b3JkID0gXCJcIjtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmIChmb3JtQWN0aW9ucyA9PSBcIkFkbWluXCIpIHtcclxuICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEgPSB7fTtcclxuICAgICAgaWYgKCRzdGF0ZS5jdXJyZW50LnVybCA9PSBcIi9hZG1pbi9iYXNpYy9zdGVwMVwiKSB7XHJcbiAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEuZm9ybUFjdGlvbnMgPSBmb3JtQWN0aW9ucztcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YSA9IFNlc3Npb25TZXJ2aWNlLmdldEFkbWluVXNlcigpO1xyXG4gICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLmZvcm1BY3Rpb25zID0gZm9ybUFjdGlvbnM7XHJcbiAgICAgIH1cclxuICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEubmV3cGFzc3dvcmQgPSBcIlwiO1xyXG4gICAgICBpZiAoU2Vzc2lvblNlcnZpY2UuZ2V0QWRtaW5Vc2VyKCkgPT0gdW5kZWZpbmVkICYmICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnN1Ym1pc3Npb25EYXRhID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZUFkbWluVXNlcigkc2NvcGUuQWNjb3VudHNTdGVwRGF0YSk7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByb2ZpbGVQaWN0dXJlID09IHVuZGVmaW5lZCB8fCAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcm9maWxlUGljdHVyZSA9PSBcIlwiKSB7XHJcbiAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJvZmlsZVBpY3R1cmUgPSBcImh0dHBzOi8vaTEuc25kY2RuLmNvbS9hdmF0YXJzLTAwMDIyMzU5OTMwMS0wbnMwNzYtdDUwMHg1MDAuanBnXCI7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhID0gU2Vzc2lvblNlcnZpY2UuZ2V0QWRtaW5Vc2VyKCk7XHJcbiAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLmZvcm1BY3Rpb25zID0gJyc7XHJcbiAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLm5ld3Bhc3N3b3JkID0gXCJcIjtcclxuICAgIH1cclxuICB9IGVsc2UgaWYgKGZvcm1BY3Rpb25zID09IFwiQWRtaW5cIikge1xyXG4gICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEgPSB7fTtcclxuICAgIGlmICgkc3RhdGUuY3VycmVudC51cmwgPT0gXCIvYWRtaW4vYmFzaWMvc3RlcDFcIikge1xyXG4gICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YSA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcclxuICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEuZm9ybUFjdGlvbnMgPSBmb3JtQWN0aW9ucztcclxuICAgIH0gZWxzZVxyXG4gICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YSA9IFNlc3Npb25TZXJ2aWNlLmdldEFkbWluVXNlcigpO1xyXG4gIH0gZWxzZSBpZiAoZm9ybUFjdGlvbnMgPT0gXCJBZGRcIikge1xyXG4gICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEgPSBTZXNzaW9uU2VydmljZS5nZXRBZG1pblVzZXIoKSA/IFNlc3Npb25TZXJ2aWNlLmdldEFkbWluVXNlcigpIDoge307XHJcbiAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoJHNjb3BlLmRlZmF1bHRTdWJtaXRQYWdlKSk7XHJcbiAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSgkc2NvcGUuZGVmYXVsdFN1Ym1pdFBhZ2UpKTtcclxuICAgICRzY29wZS5sb2FkRm9udE5hbWVzKCk7XHJcbiAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS5oZWFkaW5nLnRleHQgPSBcIlN1Ym1pc3Npb24gZm9yIFJlcG9zdFwiO1xyXG4gICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucG9zdERhdGEudHlwZSA9IFwic3VibWl0XCI7XHJcbiAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyLmhlYWRpbmcudGV4dCA9IFwiU3VibWlzc2lvbiBmb3IgUHJlbWllcmVcIjtcclxuICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIudHlwZSA9IFwicHJlbWllcmVcIjtcclxuICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLmZvcm1BY3Rpb25zID0gZm9ybUFjdGlvbnM7XHJcbiAgfSBlbHNlIGlmIChmb3JtQWN0aW9ucyA9PSBcIkVkaXRcIikge1xyXG4gICAgaWYgKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhID09IHVuZGVmaW5lZCkgJHNjb3BlLkFjY291bnRzU3RlcERhdGEgPSB7fTtcclxuICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLmZvcm1BY3Rpb25zID0gZm9ybUFjdGlvbnM7XHJcbiAgICB2YXIgdXNlcl9pZCA9IFNlc3Npb25TZXJ2aWNlLmdldEFjdGlvbnNmb0FjY291bnRJbmRleCgpO1xyXG4gICAgaWYgKHVzZXJfaWQgIT0gdW5kZWZpbmVkICYmICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnN1Ym1pc3Npb25EYXRhID09IHVuZGVmaW5lZCAmJiAkc3RhdGUuY3VycmVudC51cmwgPT0gXCIvYWRtaW4vY2hhbm5lbC9zdGVwMVwiKSB7XHJcbiAgICAgIHZhciB1c2VySWQgPSBcIlwiO1xyXG4gICAgICAkaHR0cC5nZXQoJy9hcGkvc3VibWlzc2lvbnMvZ2V0QWNjb3VudHNCeUluZGV4LycgKyB1c2VyX2lkKVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEuc3VibWlzc2lvbkRhdGEgPSByZXMuZGF0YTtcclxuICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnN1Ym1pc3Npb25EYXRhLnN1Ym1pc3Npb25VcmwgPSByZXMuZGF0YS5zdWJtaXNzaW9uVXJsLnJlcGxhY2UoLyAvZywgJycpO1xyXG4gICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEuc3VibWlzc2lvbkRhdGEuc3VibWlzc2lvblVybCA9ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnN1Ym1pc3Npb25EYXRhLnN1Ym1pc3Npb25VcmwucmVwbGFjZSgnL2N1c3RvbScsICcnKTtcclxuICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnN1Ym1pc3Npb25EYXRhLnByZW1pZXJVcmwgPSByZXMuZGF0YS5wcmVtaWVyVXJsLnJlcGxhY2UoLyAvZywgJycpO1xyXG4gICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEuc3VibWlzc2lvbkRhdGEucHJlbWllclVybCA9ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnN1Ym1pc3Npb25EYXRhLnByZW1pZXJVcmwucmVwbGFjZSgnL2N1c3RvbScsICcnKTtcclxuICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnN1Ym1pc3Npb25EYXRhLnVzZXJuYW1lID0gcmVzLmRhdGEudXNlci51c2VybmFtZTtcclxuICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnN1Ym1pc3Npb25EYXRhLmF2YXRhclVSTCA9IHJlcy5kYXRhLnVzZXIuYXZhdGFyVVJMO1xyXG4gICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEuc3VibWlzc2lvbkRhdGEuZm9sbG93ZXJzID0gcmVzLmRhdGEudXNlci5mb2xsb3dlcnM7XHJcbiAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5zdWJtaXNzaW9uRGF0YS51c2VySUQgPSByZXMuZGF0YS51c2VySUQ7XHJcbiAgICAgICAgICB1c2VySWQgPSByZXMuZGF0YS51c2VySUQ7XHJcbiAgICAgICAgICAkc2NvcGUuZGVmYXVsdFN1Ym1pdFBhZ2UudXNlcklEID0gdXNlcklkO1xyXG4gICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucmVwb3N0U2V0dGluZ3MgPSByZXMuZGF0YS5yZXBvc3RTZXR0aW5ncztcclxuICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByaWNlID0gcmVzLmRhdGEucHJpY2U7XHJcbiAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5kZXNjcmlwdGlvbiA9IHJlcy5kYXRhLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEuYXN0ek9mZnNldCA9IHJlcy5kYXRhLmFzdHpPZmZzZXQ7XHJcbiAgICAgICAgICBpZiAocmVzLmRhdGEuYXZhaWxhYmxlU2xvdHMpIHtcclxuICAgICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHNldWRvQXZhaWxhYmxlU2xvdHMgPSBjcmVhdGVQc2V1ZG9BdmFpbGFibGVTbG90cyhyZXMuZGF0YSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wc2V1ZG9BdmFpbGFibGVTbG90cyA9IHtcclxuICAgICAgICAgICAgICAnc3VuZGF5JzogWzEsIDQsIDgsIDExLCAxNCwgMTcsIDIwXSxcclxuICAgICAgICAgICAgICAnbW9uZGF5JzogWzEsIDQsIDgsIDExLCAxNCwgMTcsIDIwXSxcclxuICAgICAgICAgICAgICAndHVlc2RheSc6IFsxLCA0LCA4LCAxMSwgMTQsIDE3LCAyMF0sXHJcbiAgICAgICAgICAgICAgJ3dlZG5lc2RheSc6IFsxLCA0LCA4LCAxMSwgMTQsIDE3LCAyMF0sXHJcbiAgICAgICAgICAgICAgJ3RodXJzZGF5JzogWzEsIDQsIDgsIDExLCAxNCwgMTcsIDIwXSxcclxuICAgICAgICAgICAgICAnZnJpZGF5JzogWzEsIDQsIDgsIDExLCAxNCwgMTcsIDIwXSxcclxuICAgICAgICAgICAgICAnc2F0dXJkYXknOiBbMSwgNCwgOCwgMTEsIDE0LCAxNywgMjBdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgICRodHRwLmdldCgnL2FwaS91c2Vycy9ieUlkLycgKyB1c2VySWQpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHJlc3BvbnNlLmRhdGEpIHtcclxuICAgICAgICAgICAgICAgIC8vICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnJlcG9zdFNldHRpbmdzID0gcmVzcG9uc2UuZGF0YS5yZXBvc3RTZXR0aW5ncztcclxuICAgICAgICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnF1ZXVlID0gcmVzcG9uc2UuZGF0YS5xdWV1ZTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnJlcG9zdFNldHRpbmdzID0gcmVzcG9uc2UuZGF0YS5yZXBvc3RTZXR0aW5ncztcclxuICAgICAgICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLmFzdHpPZmZzZXQgPSByZXNwb25zZS5kYXRhLmFzdHpPZmZzZXQ7XHJcbiAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UuZGF0YS5hdmFpbGFibGVTbG90cykge1xyXG4gICAgICAgICAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wc2V1ZG9BdmFpbGFibGVTbG90cyA9IGNyZWF0ZVBzZXVkb0F2YWlsYWJsZVNsb3RzKHJlc3BvbnNlLmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHNldWRvQXZhaWxhYmxlU2xvdHMgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJ3N1bmRheSc6IFsxLCA0LCA4LCAxMSwgMTQsIDE3LCAyMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgJ21vbmRheSc6IFsxLCA0LCA4LCAxMSwgMTQsIDE3LCAyMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgJ3R1ZXNkYXknOiBbMSwgNCwgOCwgMTEsIDE0LCAxNywgMjBdLFxyXG4gICAgICAgICAgICAgICAgICAgICd3ZWRuZXNkYXknOiBbMSwgNCwgOCwgMTEsIDE0LCAxNywgMjBdLFxyXG4gICAgICAgICAgICAgICAgICAgICd0aHVyc2RheSc6IFsxLCA0LCA4LCAxMSwgMTQsIDE3LCAyMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgJ2ZyaWRheSc6IFsxLCA0LCA4LCAxMSwgMTQsIDE3LCAyMF0sXHJcbiAgICAgICAgICAgICAgICAgICAgJ3NhdHVyZGF5JzogWzEsIDQsIDgsIDExLCAxNCwgMTcsIDIwXVxyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICRodHRwLmdldCgnL2FwaS9jdXN0b21zdWJtaXNzaW9ucy9nZXRDdXN0b21TdWJtaXNzaW9uQWxsLycgKyB1c2VySWQpXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICB2YXIgaSA9IC0xO1xyXG4gICAgICAgICAgICAgICAgICB2YXIgbmV4dEZ1biA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIGkrKztcclxuICAgICAgICAgICAgICAgICAgICBpZiAoaSA8IHJlc3BvbnNlLmRhdGEubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICB2YXIgbG9vcGRhdGEgPSByZXNwb25zZS5kYXRhW2ldO1xyXG4gICAgICAgICAgICAgICAgICAgICAgaWYgKGxvb3BkYXRhLnR5cGUgPT0gXCJzdWJtaXRcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YSA9IGxvb3BkYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIGlmIChsb29wZGF0YS50eXBlID09IFwicHJlbWllcmVcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyID0gbG9vcGRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICBuZXh0RnVuKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZUFkbWluVXNlcigkc2NvcGUuQWNjb3VudHNTdGVwRGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIG5leHRGdW4oKTtcclxuICAgICAgICAgICAgICAgICAgJHNjb3BlLmxvYWRGb250TmFtZXMoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEgPSBTZXNzaW9uU2VydmljZS5nZXRBZG1pblVzZXIoKTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG4iXSwiZmlsZSI6ImFjY291bnRzU3RlcC9jb250cm9sbGVycy9hY2NvdW50U2V0dGluZ0NvbnRyb2xsZXIuanMifQ==
