app.config(function($stateProvider) {
  $stateProvider.state('thirdpartybasicstep1', {
    url: '/thirdparty/basic/step1',
    templateUrl: 'js/thirdpartyStep/views/basicstep1.html',
    controller: 'thirdpartyaccountSettingController'
  });

 });

app.controller('thirdpartyaccountSettingController', function($rootScope, $state, $scope, $http, $window, AccountSettingServices, SessionService) {

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
      if ($state.current.url == "/thirdparty/basic/step1") {
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
      if ($state.current.url == "/thirdparty/basic/step1") {
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
    if ($state.current.url == "/thirdparty/basic/step1") {
      $scope.AccountsStepData = SessionService.getUser();
      $scope.AccountsStepData.formActions = formActions;
    } else
      $scope.AccountsStepData = SessionService.getAdminUser();
  } 
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ0aGlyZHBhcnR5U3RlcC9jb250cm9sbGVycy9hY2NvdW50U2V0dGluZ0NvbnRyb2xsZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCd0aGlyZHBhcnR5YmFzaWNzdGVwMScsIHtcclxuICAgIHVybDogJy90aGlyZHBhcnR5L2Jhc2ljL3N0ZXAxJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvdGhpcmRwYXJ0eVN0ZXAvdmlld3MvYmFzaWNzdGVwMS5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICd0aGlyZHBhcnR5YWNjb3VudFNldHRpbmdDb250cm9sbGVyJ1xyXG4gIH0pO1xyXG5cclxuIH0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ3RoaXJkcGFydHlhY2NvdW50U2V0dGluZ0NvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsICR3aW5kb3csIEFjY291bnRTZXR0aW5nU2VydmljZXMsIFNlc3Npb25TZXJ2aWNlKSB7XHJcblxyXG4gICRzY29wZS5kZWZhdWx0U3VibWl0UGFnZSA9IHtcclxuICAgIFwiYnV0dG9uXCI6IHtcclxuICAgICAgXCJ0ZXh0XCI6IFwiU3VibWl0XCIsXHJcbiAgICAgIFwic3R5bGVcIjoge1xyXG4gICAgICAgIFwiZm9udENvbG9yXCI6IFwicmdiYSgwLDAsMCwxKVwiLFxyXG4gICAgICAgIFwiYmdDb2xvclwiOiBcInJnYmEoMjU1LDI1NSwyNTUsMSlcIixcclxuICAgICAgICBcImZvbnRTaXplXCI6IDE1LFxyXG4gICAgICAgIFwiYm9yZGVyXCI6IDEsXHJcbiAgICAgICAgXCJib3JkZXJSYWRpdXNcIjogMTBcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwiaW5wdXRGaWVsZHNcIjoge1xyXG4gICAgICBcInN0eWxlXCI6IHtcclxuICAgICAgICBcImJvcmRlckNvbG9yXCI6IFwicmdiYSgxNzksMTc5LDE3OSwxKVwiLFxyXG4gICAgICAgIFwiYm9yZGVyUmFkaXVzXCI6IDEwLFxyXG4gICAgICAgIFwiYm9yZGVyXCI6IDFcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwic3ViSGVhZGluZ1wiOiB7XHJcbiAgICAgIFwidGV4dFwiOiBcIk91ciBtaXNzaW9uIGlzIHRvIGNvbm5lY3QgbXVzaWNpYW5zIHRvIHRoZWlyIGF1ZGllbmNlcy4gQnkgc3VibWl0dGluZyB5b3VyIHRyYWNrLCB5b3UgcmVjZWl2ZSB0aGUgb3Bwb3J0dW5pdHkgdG8gYmUgcmV2aWV3ZWQgYnkgY291bnRsZXNzIGluZHVzdHJ5IGxlYWRpbmcgbXVzaWMgcHJvbW90ZXJzIGFuZCBpbmRlcGVuZGVudCBsYWJlbHMuIEFsdGhvdWdoIHdlIGNhbuKAmXQgZ3VhcmFudGVlIHlvdXIgdHJhY2sgd2lsbCBiZSBhY2NlcHRlZCwgd2UgY2FuIGVuc3VyZSB0aGF0IGV2ZXJ5IHN1Ym1pc3Npb24gd2lsbCBnZXQgaGVhcmQgYW5kIGNvbnNpZGVyZWQuXCIsXHJcbiAgICAgIFwic3R5bGVcIjoge1xyXG4gICAgICAgIFwiZm9udEZhbWlseVwiOiBcIidPcGVuIFNhbnMnLCBzYW5zLXNlcmlmXCIsXHJcbiAgICAgICAgXCJmb250Q29sb3JcIjogXCJyZ2JhKDEyMCwxMjAsMTIwLDEpXCIsXHJcbiAgICAgICAgXCJmb250U2l6ZVwiOiAxNVxyXG4gICAgICB9XHJcbiAgICB9LFxyXG4gICAgXCJoZWFkaW5nXCI6IHtcclxuICAgICAgXCJ0ZXh0XCI6IFwiU3VibWlzc2lvblwiLFxyXG4gICAgICBcInN0eWxlXCI6IHtcclxuICAgICAgICBcImZvbnRTaXplXCI6IDMyLFxyXG4gICAgICAgIFwiZm9udEZhbWlseVwiOiBcIidPcGVuIFNhbnMnLCBzYW5zLXNlcmlmXCIsXHJcbiAgICAgICAgXCJmb250Q29sb3JcIjogXCJyZ2JhKDEyMCwxMjAsMTIwLDEpXCJcclxuICAgICAgfVxyXG4gICAgfSxcclxuICAgIFwibG9nb1wiOiB7XHJcbiAgICAgIFwiYWxpZ25cIjogXCJjZW50ZXJcIixcclxuICAgICAgXCJpbWFnZXNcIjogXCJcIlxyXG4gICAgfSxcclxuICAgIFwiYmFja2dyb3VuZFwiOiB7XHJcbiAgICAgIFwiYmx1clwiOiA0MCxcclxuICAgICAgXCJpbWFnZXNcIjogXCJcIlxyXG4gICAgfSxcclxuICAgIFwibGF5b3V0XCI6ICc0J1xyXG4gIH1cclxuICAkc2NvcGUubG9hZEZvbnROYW1lcyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLnJlcEhlYWRGb250ID0gJHNjb3BlLkFjY291bnRzU3RlcERhdGEucG9zdERhdGEuaGVhZGluZy5zdHlsZS5mb250RmFtaWx5ID8gJHNjb3BlLkFjY291bnRzU3RlcERhdGEucG9zdERhdGEuaGVhZGluZy5zdHlsZS5mb250RmFtaWx5LnN1YnN0cmluZygxLCAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS5oZWFkaW5nLnN0eWxlLmZvbnRGYW1pbHkuaW5kZXhPZihcIicsXCIpKSA6IFwiXCI7XHJcbiAgICAkc2NvcGUucmVwU3ViaGVhZEZvbnQgPSAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS5zdWJIZWFkaW5nLnN0eWxlLmZvbnRGYW1pbHkgPyAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS5zdWJIZWFkaW5nLnN0eWxlLmZvbnRGYW1pbHkuc3Vic3RyaW5nKDEsICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBvc3REYXRhLnN1YkhlYWRpbmcuc3R5bGUuZm9udEZhbWlseS5pbmRleE9mKFwiJyxcIikpIDogXCJcIjtcclxuICAgICRzY29wZS5wcmVtSGVhZEZvbnQgPSAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyLmhlYWRpbmcuc3R5bGUuZm9udEZhbWlseSA/ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIuaGVhZGluZy5zdHlsZS5mb250RmFtaWx5LnN1YnN0cmluZygxLCAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyLmhlYWRpbmcuc3R5bGUuZm9udEZhbWlseS5pbmRleE9mKFwiJyxcIikpIDogXCJcIjtcclxuICAgICRzY29wZS5wcmVtU3ViaGVhZEZvbnQgPSAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyLnN1YkhlYWRpbmcuc3R5bGUuZm9udEZhbWlseSA/ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIuc3ViSGVhZGluZy5zdHlsZS5mb250RmFtaWx5LnN1YnN0cmluZygxLCAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyLnN1YkhlYWRpbmcuc3R5bGUuZm9udEZhbWlseS5pbmRleE9mKFwiJyxcIikpIDogXCJcIjtcclxuICB9XHJcblxyXG4gICRzY29wZS5pc0xvZ2dlZEluID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpID8gdHJ1ZSA6IGZhbHNlO1xyXG4gIGlmICghJHNjb3BlLmlzTG9nZ2VkSW4pIHtcclxuICAgICRzdGF0ZS5nbygnYWRtaW4nKTtcclxuICB9XHJcbiAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgJHNjb3BlLnNob3dUZXN0RW1haWxNb2RhbCA9IGZhbHNlO1xyXG4gICRzY29wZS5lcnJvcnZlcmlmaWNhdGlvbiA9IGZhbHNlO1xyXG4gICRzY29wZS52ZXJpZmllZCA9IGZhbHNlO1xyXG4gICRzY29wZS53YWl0b25lbWludXRlID0gZmFsc2U7XHJcbiAgY29uc29sZS5sb2coJ3VzZXInLCAkc2NvcGUudXNlcik7XHJcbiAgdmFyIGZvcm1BY3Rpb25zID0gU2Vzc2lvblNlcnZpY2UuZ2V0QWN0aW9uc2ZvQWNjb3VudCgpID8gU2Vzc2lvblNlcnZpY2UuZ2V0QWN0aW9uc2ZvQWNjb3VudCgpIDogMDtcclxuICBpZiAoIWZvcm1BY3Rpb25zICYmIGZvcm1BY3Rpb25zICE9IFwiQWRkXCIgJiYgZm9ybUFjdGlvbnMgIT0gXCJFZGl0XCIpIHtcclxuICAgICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICAgaWYgKCRzY29wZS51c2VyICYmICRzY29wZS51c2VyLnJvbGUgPT0gJ2FkbWluJykge1xyXG4gICAgICAkcm9vdFNjb3BlLmVuYWJsZU5hdmlnYXRpb24gPSAkc2NvcGUudXNlci5wYWlkUmVwb3N0Lmxlbmd0aCA+IDAgPyBmYWxzZSA6IHRydWU7XHJcbiAgICB9XHJcbiAgICAkc2NvcGUuc2hvd1Rlc3RFbWFpbE1vZGFsID0gZmFsc2U7XHJcbiAgICAkc2NvcGUuZXJyb3J2ZXJpZmljYXRpb24gPSBmYWxzZTtcclxuICAgICRzY29wZS52ZXJpZmllZCA9IGZhbHNlO1xyXG4gICAgJHNjb3BlLndhaXRvbmVtaW51dGUgPSBmYWxzZTtcclxuICAgIC8vY29uc29sZS5sb2coJ3VzZXInLCRzY29wZS51c2VyKTtcclxuICAgIHZhciBmb3JtQWN0aW9ucyA9IFNlc3Npb25TZXJ2aWNlLmdldEFjdGlvbnNmb0FjY291bnQoKSA/IFNlc3Npb25TZXJ2aWNlLmdldEFjdGlvbnNmb0FjY291bnQoKSA6IDA7XHJcbiAgICBpZiAoIWZvcm1BY3Rpb25zICYmIGZvcm1BY3Rpb25zICE9IFwiQWRkXCIgJiYgZm9ybUFjdGlvbnMgIT0gXCJFZGl0XCIpIHtcclxuICAgICAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgIGlmICgkc3RhdGUuY3VycmVudC51cmwgPT0gXCIvdGhpcmRwYXJ0eS9iYXNpYy9zdGVwMVwiKSB7XHJcbiAgICAgICAgaWYgKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5mb3JtQWN0aW9ucyA9IGZvcm1BY3Rpb25zO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YSA9IFNlc3Npb25TZXJ2aWNlLmdldEFkbWluVXNlcigpO1xyXG4gICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEuZm9ybUFjdGlvbnMgPSBmb3JtQWN0aW9ucztcclxuICAgICAgICB9XHJcbiAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEubmV3cGFzc3dvcmQgPSBcIlwiO1xyXG4gICAgICAgIGlmIChTZXNzaW9uU2VydmljZS5nZXRBZG1pblVzZXIoKSA9PSB1bmRlZmluZWQgJiYgJHNjb3BlLkFjY291bnRzU3RlcERhdGEuc3VibWlzc2lvbkRhdGEgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGVBZG1pblVzZXIoJHNjb3BlLkFjY291bnRzU3RlcERhdGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJvZmlsZVBpY3R1cmUgPT0gdW5kZWZpbmVkIHx8ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByb2ZpbGVQaWN0dXJlID09IFwiXCIpIHtcclxuICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByb2ZpbGVQaWN0dXJlID0gXCJodHRwczovL2kxLnNuZGNkbi5jb20vYXZhdGFycy0wMDAyMjM1OTkzMDEtMG5zMDc2LXQ1MDB4NTAwLmpwZ1wiO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YSA9IFNlc3Npb25TZXJ2aWNlLmdldEFkbWluVXNlcigpO1xyXG4gICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLmZvcm1BY3Rpb25zID0gJyc7XHJcbiAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEubmV3cGFzc3dvcmQgPSBcIlwiO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKGZvcm1BY3Rpb25zID09IFwiQWRtaW5cIikge1xyXG4gICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YSA9IHt9O1xyXG4gICAgICBpZiAoJHN0YXRlLmN1cnJlbnQudXJsID09IFwiL3RoaXJkcGFydHkvYmFzaWMvc3RlcDFcIikge1xyXG4gICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLmZvcm1BY3Rpb25zID0gZm9ybUFjdGlvbnM7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEgPSBTZXNzaW9uU2VydmljZS5nZXRBZG1pblVzZXIoKTtcclxuICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5mb3JtQWN0aW9ucyA9IGZvcm1BY3Rpb25zO1xyXG4gICAgICB9XHJcbiAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLm5ld3Bhc3N3b3JkID0gXCJcIjtcclxuICAgICAgaWYgKFNlc3Npb25TZXJ2aWNlLmdldEFkbWluVXNlcigpID09IHVuZGVmaW5lZCAmJiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5zdWJtaXNzaW9uRGF0YSA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGVBZG1pblVzZXIoJHNjb3BlLkFjY291bnRzU3RlcERhdGEpO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICgkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcm9maWxlUGljdHVyZSA9PSB1bmRlZmluZWQgfHwgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJvZmlsZVBpY3R1cmUgPT0gXCJcIikge1xyXG4gICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByb2ZpbGVQaWN0dXJlID0gXCJodHRwczovL2kxLnNuZGNkbi5jb20vYXZhdGFycy0wMDAyMjM1OTkzMDEtMG5zMDc2LXQ1MDB4NTAwLmpwZ1wiO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YSA9IFNlc3Npb25TZXJ2aWNlLmdldEFkbWluVXNlcigpO1xyXG4gICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5mb3JtQWN0aW9ucyA9ICcnO1xyXG4gICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5uZXdwYXNzd29yZCA9IFwiXCI7XHJcbiAgICB9XHJcbiAgfSBlbHNlIGlmIChmb3JtQWN0aW9ucyA9PSBcIkFkbWluXCIpIHtcclxuICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhID0ge307XHJcbiAgICBpZiAoJHN0YXRlLmN1cnJlbnQudXJsID09IFwiL3RoaXJkcGFydHkvYmFzaWMvc3RlcDFcIikge1xyXG4gICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YSA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcclxuICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEuZm9ybUFjdGlvbnMgPSBmb3JtQWN0aW9ucztcclxuICAgIH0gZWxzZVxyXG4gICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YSA9IFNlc3Npb25TZXJ2aWNlLmdldEFkbWluVXNlcigpO1xyXG4gIH0gXHJcbn0pO1xyXG4iXSwiZmlsZSI6InRoaXJkcGFydHlTdGVwL2NvbnRyb2xsZXJzL2FjY291bnRTZXR0aW5nQ29udHJvbGxlci5qcyJ9
