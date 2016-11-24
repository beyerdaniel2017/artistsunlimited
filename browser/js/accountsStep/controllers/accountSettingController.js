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
    $scope.AccountsStepData.postData = {
      heading: {
        text: "",
        style: {
          fontSize: 18
        }
      },
      subHeading: {
        text: ""
      }
    }
    $scope.AccountsStepData.premier = {
      heading: {
        text: "",
        style: {
          fontSize: 18
        }
      },
      subHeading: {
        text: ""
      }
    }
    $scope.AccountsStepData.postData.heading.text = "Submission for Promotion";
    $scope.AccountsStepData.postData.subHeading.text = "Our mission is to simply bring the best music to the people. We also have a strong commitment to providing feedback and guidance for rising artists. We guarantee that your song will be listened to and critiqued by our dedicated staff if it passes our submission process. Although we cannot guarantee support for your submission on our promotional platforms such as SoundCloud, YouTube, and Facebook, we will make sure to get back to you with a response.";
    $scope.AccountsStepData.premier.heading.text = "Premier Submission for Promotion";
    $scope.AccountsStepData.premier.subHeading.text = "Our mission is to simply bring the best music to the people. We also have a strong commitment to providing feedback and guidance for rising artists. We guarantee that your song will be listened to and critiqued by our dedicated staff if it passes our submission process. Although we cannot guarantee support for your submission on our promotional platforms such as SoundCloud, YouTube, and Facebook, we will make sure to get back to you with a response.";
    $scope.AccountsStepData.formActions = formActions;
  } else if (formActions == "Edit") {
    if ($scope.AccountsStepData == undefined)
      $scope.AccountsStepData = {};

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
          $scope.AccountsStepData.repostSettings = res.data.repostSettings;
          $scope.AccountsStepData.price = res.data.price;
          $scope.AccountsStepData.description = res.data.description;
          $scope.AccountsStepData.slotsTimezone = res.data.slotsTimezone;
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
                $scope.AccountsStepData.slotsTimezone = response.data.slotsTimezone;
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
                });
            })
        });
    } else {
      $scope.AccountsStepData = SessionService.getAdminUser();
    }
  }
});