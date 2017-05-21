app.directive('adminsettings', function($http) {
  return {
    templateUrl: 'js/common/directives/settings/adminSettings.html',
    restrict: 'E',
    scope: false,
    controller: function adminSettingsController($rootScope, $state, $scope, $http, $window, AccountSettingServices, SessionService) {
      $scope.stepButton = [{
        "name": "SUBMITTER'S EMAIL",
        "appendText": " {SUBMITTERS_EMAIL} "
      }, {
        "name": "SUBMITTER'S NAME",
        "appendText": " {SUBMITTERS_NAME} "
      }, {
        "name": "TRACK TITLE",
        "appendText": " {TRACK_TITLE} "
      }, {
        "name": "TRACK TITLE WITH LINK",
        "appendText": " {TRACK_TITLE_WITH_LINK} "
      }, {
        "name": "TRACK ARTIST",
        "appendText": " {TRACK_ARTIST} "
      }, {
        "name": "TRACK ARTIST WITH LINK",
        "appendText": " {TRACK_ARTIST_WITH_LINK} "
      }, {
        "name": "TRACK ARTWORK",
        "appendText": " {TRACK_ARTWORK} "
      }, {
        "name": "SUBMITTED TO ACCOUNT NAME",
        "appendText": " {SUBMITTED_TO_ACCOUNT_NAME} "
      }, {
        "name": "SUBMITTED ACCOUNT NAME WITH LINK",
        "appendText": " {SUBMITTED_ACCOUNT_NAME_WITH_LINK} "
      }, {
        "name": "ACCEPTED CHANNELS LIST",
        "appendText": " {ACCEPTED_CHANNEL_LIST} "
      }, {
        "name": "ACCEPTED CHANNELS LIST WITH LINKS",
        "appendText": " {ACCEPTED_CHANNEL_LIST_WITH_LINK} "
      }, {
        "name": "TODAYS DATE",
        "appendText": " {TODAYSDATE} "
      }];

      $scope.customBox = {
        "acceptance": {
          "title": "",
          "subject": "",
          "body": ""
        },
        "decline": {
          "title": "",
          "subject": "",
          "body": ""
        }
      };

      if ($scope.AccountsStepData.paypal == undefined) {
        $scope.AccountsStepData.paypal = {};
        $scope.AccountsStepData.paypal.varify = false;
        $scope.AccountsStepData.paypal.processchannel = false;
      }
      $scope.errorverification = false;
      $scope.verified = false;
      $scope.waitoneminute = false;


      if (window.location.href.indexOf('admin/basic/step1#generalInfo') != -1) {
        $('.nav-tabs a[href="#generalInfo"]').tab('show');
      } else if (window.location.href.indexOf('admin/basic/step1#sce') != -1) {
        $('.nav-tabs a[href="#sce"]').tab('show');
      } else if (window.location.href.indexOf('admin/basic/step1#psce') != -1) {
        $('.nav-tabs a[href="#psce"]').tab('show');
      } else if (window.location.href.indexOf('admin/basic/step1#notifications') != -1) {
        $('.nav-tabs a[href="#notifications"]').tab('show');
      } else if (window.location.href.indexOf('admin/basic/step1#paypalInfo') != -1) {
        $('.nav-tabs a[href="#paypalInfo"]').tab('show');
      }
      $scope.showPasswordChange = false;

      $scope.addEventClass = function(index, type) {
        $('.selectedBox').removeClass("selectedBox");
        $("." + type + index).addClass("selectedBox");
        console.log(type + index);
      }

      $scope.addCustomEmails = function() {
        if ($scope.AccountsStepData.customizeemails.length > 0)
          $scope.AccountsStepData.customizeemails.push($scope.customBox);
      }

      $scope.sendTestMail = function(type) {
        $scope.testEmailType = type;
        $scope.showTestEmailModal = true;
        $('#emailModal').modal('show');
      }

      $scope.sendMail = function(email) {
        if (email != "") {
          var emailObj = "";
          if ($scope.testEmailType == "repostaccept") {
            emailObj = $scope.AccountsStepData.repostCustomizeEmails[0].acceptance;
          }
          if ($scope.testEmailType == "repostdecline") {
            emailObj = $scope.AccountsStepData.repostCustomizeEmails[0].decline;
          }
          if ($scope.testEmailType == "premieraccept") {
            emailObj = $scope.AccountsStepData.premierCustomizeEmails[0].acceptance;
          }
          if ($scope.testEmailType == "premierdecline") {
            emailObj = $scope.AccountsStepData.premierCustomizeEmails[0].decline;
          }
          var mailObj = {};
          mailObj.email = email;
          mailObj.emailObj = emailObj;
          $http.post('/api/accountsteps/sendTestEmail', mailObj)
            .then(function(res) {
              if (res.data.success) {
                $scope.showTestEmailModal = false;
                $('#emailModal').modal('hide');
              }
            })
            .catch(function() {
              $scope.showTestEmailModal = false;
              $('#emailModal').modal('hide');
              $.Zebra_Dialog('Error in sending mail.');
            })
        }
      }

      $scope.currentTab = window.location.href.split('#')[1];
      $scope.closeModal = function() {
        $scope.showTestEmailModal = false;
        $('#emailModal').modal('hide');
      }

      $scope.isFirstLogin = function() {
        if (!!$scope.AccountsStepData.paypal_email) {
          $scope.activeTab = ['general', 'sce', 'psce', 'notifications', 'paypalInfo'];
        } else {
          window.location.href = '/admin/basic/step1#generalInfo';
          $scope.activeTab = ['general'];
        }
      }

      $scope.isFirstLogin();
      $scope.nextStep = function(step, currentData, type) {
        if (type == "basic") {
          switch (step) {
            case 1:
              $state.go("basicstep1");
              break;
            case 2:
              var next = true;
              var body = {};
              if ($scope.AccountsStepData.email == "") {
                next = false;
                $.Zebra_Dialog('Error: Enter email address');
              } else if ($scope.AccountsStepData.email != "") {
                body.email = $scope.AccountsStepData.email;
              }
              if ($scope.AccountsStepData.newpassword != "" && $scope.AccountsStepData.newconfirmpassword != $scope.AccountsStepData.newpassword) {
                next = false;
                $.Zebra_Dialog('Error: Password doesn’t match');
              } else if ($scope.AccountsStepData.newpassword != "" && $scope.AccountsStepData.newconfirmpassword == $scope.AccountsStepData.newpassword) {
                body.password = $scope.AccountsStepData.newpassword;
              }
              if ($scope.AccountsStepData.profilePicture == "https://i1.sndcdn.com/avatars-000223599301-0ns076-t500x500.jpg") {
                next = false;
                $.Zebra_Dialog('Error: Please upload your profile image');
              }
              if ($scope.AccountsStepData.profilePicture != "") {
                body.pictureUrl = $scope.AccountsStepData.profilePicture;
              }

              if (next) {
                AccountSettingServices.updateAdminProfile(body)
                  .then(function(res) {
                    if (res.data.message) {
                      $.Zebra_Dialog('Error: Email already register.');

                    } else {
                      $scope.AccountsStepData.newpassword = "";
                      $scope.AccountsStepData.newconfirmpassword = "";
                      $scope.processing = false;
                      $scope.AccountsStepData.repostCustomizeEmails = (($scope.AccountsStepData.repostCustomizeEmails.length > 0) ? $scope.AccountsStepData.repostCustomizeEmails : [{
                        "acceptance": {
                          "title": "ACCEPTANCE EMAIL",
                          "subject": "Congratulations on your Submission - {TRACK_TITLE}",
                          "body": "Hey {SUBMITTERS_NAME}!\n\nFirst and foremost thank you for submitting {TRACK_TITLE_WITH_LINK}! We’ve reviewed your submission and it has been approved for a repost on {SUBMITTED_ACCOUNT_NAME_WITH_LINK} and more. All you need to do is click the button below. You are open to repeat your promotion on any of these pages as many times as you would like, and the promotion page will remain active forever.\n\nWe thoroughly enjoyed listening to your production and we hope that in the future you submit your music to us. Keep working hard and put your heart into your productions, we will be here to help you with the rest.",
                          "buttonText": "Accept",
                          "buttonBgColor": "#592e2e"
                        },
                        "decline": {
                          "title": "DECLINE EMAIL",
                          "subject": "Music Submission",
                          "body": "Hey {SUBMITTERS_NAME},\n\nThank you for submitting your track {TRACK_TITLE_WITH_LINK}! Sadly we have to inform you that we don’t think the track is ready to be shared by our channels. With that being said, do not get discouraged as many names that are now trending on SoundCloud have been turned down before. Keep in touch and we are always here to gladly review more tracks in the future.\n\nGood luck and stay true to yourself.",
                          "buttonText": "Decline",
                          "buttonBgColor": "#592e2e"
                        }
                      }]);
                      //rascal 3-30
                      //$scope.activeTab.push('sce');
                      //$('.nav-tabs a[href="#sce"]').tab('show');
                      SessionService.createAdminUser($scope.AccountsStepData);
                    }
                  })
                  .catch(function() {
                    $.Zebra_Dialog('Error: Error inprocessing the request.');
                  });
              } else {
                return;
              }
              break;
            case 3:
              AccountSettingServices.updateAdminProfile({
                  repostCustomizeEmails: $scope.AccountsStepData.repostCustomizeEmails
                })
                .then(function(res) {
                  $scope.processing = false;
                })
                .catch(function() {});
              // $scope.AccountsStepData.premierCustomizeEmails = (($scope.AccountsStepData.premierCustomizeEmails.length > 0) ? $scope.AccountsStepData.premierCustomizeEmails : [{
              //  "acceptance": {
              //    "title": "ACCEPTANCE EMAIL",
              //    "subject": "Congratulations on your Submission -",
              //    "body": "Hey {NAME}!\n\nFirst and foremost thank you for submitting {TRACK_TITLE_WITH_LINK} ! We’ve reviewed your submission and it has been approved for a repost on {nameofchannelsubmitted} and more. All you need to do is click the button below. You are open to repeat your promotion on any of these pages as many times as you would like, and the promotion page will remain active forever.\n\nWe thoroughly enjoyed listening to your production and we hope that in the future you submit your music to us. Keep working hard and put your heart into your productions, we will be here to help you with the rest.",
              //    "buttonText": "Accept",
              //    "buttonBgColor": "#592e2e"
              //  },
              //  "decline": {
              //    "title": "DECLINE EMAIL",
              //    "subject": "Music Submission",
              //    "body": "Hey {NAME},\n\nThank you for submitting your track {TRACK_TITLE_WITH_LINK} ! Sadly we have to inform you that we don’t think the track is ready to be shared by our channels. With that being said, do not get discouraged as many names that are now trending on SoundCloud have been turned down before. Keep in touch and we are always here to gladly review more tracks in the future.\n\nGood luck and stay true to yourself.",
              //    "buttonText": "Decline",
              //    "buttonBgColor": "#592e2e"
              //  }
              // }]);
              //rascal 3-30
              //$scope.activeTab.push('notifications');
              //$('.nav-tabs a[href="#notifications"]').tab('show');
              SessionService.createAdminUser($scope.AccountsStepData);
              break;
            case 4:
              AccountSettingServices.updateAdminProfile({
                  premierCustomizeEmails: $scope.AccountsStepData.premierCustomizeEmails
                })
                .then(function(res) {
                  //rascal_3-30
                  // $scope.activeTab.push('notifications');
                  //$('.nav-tabs a[href="#notifications"]').tab('show');
                  $scope.processing = false;
                })
                .catch(function() {});
              SessionService.createAdminUser($scope.AccountsStepData);
              break;
            case 5:
              AccountSettingServices.updateAdminProfile({
                  notificationSettings: $scope.AccountsStepData.notificationSettings,
                  email: $scope.AccountsStepData.email
                })
                .then(function(res) {
                  $scope.processing = false;
                })
                .catch(function() {});
              $scope.errorverification = false;
              $scope.verified = false;
              $scope.waitoneminute = false;
              SessionService.createAdminUser($scope.AccountsStepData);
              if ($scope.AccountsStepData.paypal == undefined) {
                $scope.AccountsStepData.paypal = {};
                $scope.AccountsStepData.paypal.varify = false;
                $scope.AccountsStepData.paypal.processchannel = false;
              }
              //rascal_3-30
              //$scope.activeTab.push('paypalInfo');
              //$('.nav-tabs a[href="#paypalInfo"]').tab('show');
              SessionService.createAdminUser($scope.AccountsStepData);
              break;
          }
        }

        if (type == "channel") {
          switch (step) {
            case 1:
              $http.get("/connect/logout?return_to=https://soundcloud.com/connect?client_id=8002f0f8326d869668523d8e45a53b90&display=popup&redirect_uri=https://" + window.location.host + "/callback.html&response_type=code_and_token&scope=non-expiring&state=SoundCloud_Dialog_5fead");
              $state.go("channelstep1");
              break;
            case 2:
              SessionService.createAdminUser($scope.AccountsStepData);
              break;
            case 3:
              var next = true;
              if ($scope.AccountsStepData.price == 0 || $scope.AccountsStepData.price == undefined) {
                next = false;
                $.Zebra_Dialog('Error: Enter Price');
              }

              if (next) {
                AccountSettingServices.updatePaidRepost({
                    userID: $scope.AccountsStepData.submissionData.userID,
                    price: $scope.AccountsStepData.price,
                    description: $scope.AccountsStepData.description,
                    groups: $scope.AccountsStepData.submissionData.groups ? $scope.AccountsStepData.submissionData.groups : [],
                    submissionUrl: $scope.AccountsStepData.submissionData.submissionUrl,
                    premierUrl: $scope.AccountsStepData.submissionData.premierUrl
                  })
                  .then(function(res) {
                    SessionService.createAdminUser($scope.AccountsStepData);
                  })
                  .catch(function() {});
              } else {
                return;
              }
              break;
            case 4:
              AccountSettingServices.addCustomize({
                  userID: $scope.AccountsStepData.submissionData.userID,
                  type: $scope.AccountsStepData.postData.type,
                  background: $scope.AccountsStepData.postData.background,
                  logo: $scope.AccountsStepData.postData.logo,
                  heading: $scope.AccountsStepData.postData.heading,
                  subHeading: $scope.AccountsStepData.postData.subHeading,
                  inputFields: $scope.AccountsStepData.postData.inputFields,
                  button: $scope.AccountsStepData.postData.button
                })
                .then(function(res) {
                  SessionService.createAdminUser($scope.AccountsStepData);
                })
                .catch(function() {});
              break;
            case 5:
              AccountSettingServices.addCustomize({
                  userID: $scope.AccountsStepData.submissionData.userID,
                  type: $scope.AccountsStepData.premier.type,
                  background: $scope.AccountsStepData.premier.background,
                  logo: $scope.AccountsStepData.premier.logo,
                  heading: $scope.AccountsStepData.premier.heading,
                  subHeading: $scope.AccountsStepData.premier.subHeading,
                  inputFields: $scope.AccountsStepData.premier.inputFields,
                  button: $scope.AccountsStepData.premier.button
                })
                .then(function(res) {
                  if ($scope.AccountsStepData.availableSlots == undefined) $scope.AccountsStepData.availableSlots = defaultAvailableSlots;
                  SessionService.createAdminUser($scope.AccountsStepData);
                })
                .catch(function() {});
              break;
            case 6:
              AccountSettingServices.updateUserAvailableSlot({
                  _id: $scope.AccountsStepData.submissionData.userID,
                  availableSlots: $scope.AccountsStepData.availableSlots
                })
                .then(function(res) {
                  $scope.processing = false;
                })
                .catch(function() {});
              break;
            case 7:
              SessionService.removeAccountusers($scope.AccountsStepData);
              $rootScope.enableNavigation = false;
              $state.go("accounts");
              break;
          }
        }
      }

      $scope.appendBody = function(btn, type) {
        var ids = "#sce";
        if (type == "premier") ids = "#psce";
        console.log($(ids).find('.selectedBox'))
        if ($(ids).find('.selectedBox').length) {
          console.log($(ids).find('.selectedBox'))
          var boxIndex = $(ids).find('.selectedBox').attr("index");
          var cursorPos = $(ids).find('.selectedBox').prop('selectionStart');
          var v = $(ids).find('.selectedBox').val();
          var textBefore = v.substring(0, cursorPos);
          var textAfter = v.substring(cursorPos, v.length);
          var newtext = textBefore + btn.appendText + textAfter;
          $(ids).find('.selectedBox').val(newtext);
          $(ids).find('.selectedBox').trigger('input');
          // if (type == "repost") {
          //  if ($(ids).find('.selectedBox').hasClass("declinebox")) {
          //    $scope.AccountsStepData.repostCustomizeEmails[boxIndex].decline.body = newtext;
          //  } else if ($(ids).find('.selectedBox').hasClass("acceptancebox")) {
          //    $scope.AccountsStepData.repostCustomizeEmails[boxIndex].acceptance.body = newtext;
          //  }
          // } else {
          //  if ($(ids).find('.selectedBox').hasClass("declinebox")) {
          //    $scope.AccountsStepData.premierCustomizeEmails[boxIndex].decline.body = newtext;
          //  } else if ($(ids).find('.selectedBox').hasClass("acceptancebox")) {
          //    $scope.AccountsStepData.premierCustomizeEmails[boxIndex].acceptance.body = newtext;
          //  }
          // }
          $(ids).find('.selectedBox').removeClass("selectedBox");
          SessionService.createAdminUser($scope.AccountsStepData);
        }
      }

      $scope.generateRandomNumber = function() {
        var min = 0.01,
          max = 0.09,
          numbers = (Math.random() * (max - min) + min).toFixed(2);
        return numbers
      }

      var daysArray = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

      var defaultAvailableSlots = {
        'sunday': [1, 4, 8, 11, 14, 17, 20],
        'monday': [1, 4, 8, 11, 14, 17, 20],
        'tuesday': [1, 4, 8, 11, 14, 17, 20],
        'wednesday': [1, 4, 8, 11, 14, 17, 20],
        'thursday': [1, 4, 8, 11, 14, 17, 20],
        'friday': [1, 4, 8, 11, 14, 17, 20],
        'saturday': [1, 4, 8, 11, 14, 17, 20]
      };

      $scope.sendTrailAmount = function() {
        var amountEmail = $scope.AccountsStepData.paypal_email;
        $scope.processing = true;
        $scope.errorverification = false;
        if ($scope.isValidEmailAddress(amountEmail)) {
          var price1 = $scope.generateRandomNumber();
          var price2 = $scope.generateRandomNumber();
          $scope.AccountsStepData.paypal.price1 = price1;
          $scope.AccountsStepData.paypal.price2 = price2;
          var paymentDetails = {};
          paymentDetails.email = amountEmail;
          paymentDetails.price = price1;
          $http.post('/api/accountsteps/sendVarificationAccount', paymentDetails)
            .then(function(res) {
              if (res) {
                paymentDetails.price = price2;
                $http.post('/api/accountsteps/sendVarificationAccount', paymentDetails)
                  .then(function(res) {
                    if (res) {
                      $scope.AccountsStepData.paypal.varify = true;
                      $scope.verified = false;
                      $scope.waitoneminute = true;
                      $scope.processing = false;
                    }
                  })
              } else {
                $scope.errorverification = true;
                $scope.processing = false;
              }
            });
        }
      }

      $scope.isValidEmailAddress = function(emailAddress) {
        var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
        return pattern.test(emailAddress);
      };

      $scope.varifyaccount = function() {
        $scope.processing = true;
        $scope.errorverification = false;
        $scope.verified = false;
        $scope.waitoneminute = false;
        var paypaldata = $scope.AccountsStepData.paypal;
        if ((paypaldata.price1 == parseFloat(paypaldata.pricea) && paypaldata.price2 == parseFloat(paypaldata.priceb)) || (paypaldata.price1 == parseFloat(paypaldata.priceb) && paypaldata.price2 == parseFloat(paypaldata.pricea))) {
          $scope.AccountsStepData.paypal.processchannel = true;
          AccountSettingServices.updateAdminProfile({
              paypal_email: $scope.AccountsStepData.paypal_email
            })
            .then(function(res) {
              $scope.processing = false;
              $scope.verified = true;
              $scope.waitoneminute = false;
              SessionService.createAdminUser($scope.AccountsStepData);
              $state.go('channelstep1');
            })
            .catch(function() {});
          $scope.processing = false;
        } else {
          $scope.errorverification = true;
          $scope.processing = false;
        }
      }

      $scope.updateLOGOIMAGE = function() {
        $scope.processing = true;
        if ($scope.AccountsStepData.profilePicture != "") {
          if (!(typeof $scope.AccountsStepData.profilePicture === 'undefined')) {
            AccountSettingServices.uploadFile($scope.AccountsStepData.profilePicture).then(function(res) {
              if (res) {
                $scope.AccountsStepData.profilePicture = res.data.Location;
                $scope.processing = false;
              }
            });
          }
        } else {
          $scope.processing = false;
        }
      }

    }
  }
})

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24vZGlyZWN0aXZlcy9zZXR0aW5ncy9hZG1pblNldHRpbmdzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5kaXJlY3RpdmUoJ2FkbWluc2V0dGluZ3MnLCBmdW5jdGlvbigkaHR0cCkge1xuICByZXR1cm4ge1xuICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvc2V0dGluZ3MvYWRtaW5TZXR0aW5ncy5odG1sJyxcbiAgICByZXN0cmljdDogJ0UnLFxuICAgIHNjb3BlOiBmYWxzZSxcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbiBhZG1pblNldHRpbmdzQ29udHJvbGxlcigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsICR3aW5kb3csIEFjY291bnRTZXR0aW5nU2VydmljZXMsIFNlc3Npb25TZXJ2aWNlKSB7XG4gICAgICAkc2NvcGUuc3RlcEJ1dHRvbiA9IFt7XG4gICAgICAgIFwibmFtZVwiOiBcIlNVQk1JVFRFUidTIEVNQUlMXCIsXG4gICAgICAgIFwiYXBwZW5kVGV4dFwiOiBcIiB7U1VCTUlUVEVSU19FTUFJTH0gXCJcbiAgICAgIH0sIHtcbiAgICAgICAgXCJuYW1lXCI6IFwiU1VCTUlUVEVSJ1MgTkFNRVwiLFxuICAgICAgICBcImFwcGVuZFRleHRcIjogXCIge1NVQk1JVFRFUlNfTkFNRX0gXCJcbiAgICAgIH0sIHtcbiAgICAgICAgXCJuYW1lXCI6IFwiVFJBQ0sgVElUTEVcIixcbiAgICAgICAgXCJhcHBlbmRUZXh0XCI6IFwiIHtUUkFDS19USVRMRX0gXCJcbiAgICAgIH0sIHtcbiAgICAgICAgXCJuYW1lXCI6IFwiVFJBQ0sgVElUTEUgV0lUSCBMSU5LXCIsXG4gICAgICAgIFwiYXBwZW5kVGV4dFwiOiBcIiB7VFJBQ0tfVElUTEVfV0lUSF9MSU5LfSBcIlxuICAgICAgfSwge1xuICAgICAgICBcIm5hbWVcIjogXCJUUkFDSyBBUlRJU1RcIixcbiAgICAgICAgXCJhcHBlbmRUZXh0XCI6IFwiIHtUUkFDS19BUlRJU1R9IFwiXG4gICAgICB9LCB7XG4gICAgICAgIFwibmFtZVwiOiBcIlRSQUNLIEFSVElTVCBXSVRIIExJTktcIixcbiAgICAgICAgXCJhcHBlbmRUZXh0XCI6IFwiIHtUUkFDS19BUlRJU1RfV0lUSF9MSU5LfSBcIlxuICAgICAgfSwge1xuICAgICAgICBcIm5hbWVcIjogXCJUUkFDSyBBUlRXT1JLXCIsXG4gICAgICAgIFwiYXBwZW5kVGV4dFwiOiBcIiB7VFJBQ0tfQVJUV09SS30gXCJcbiAgICAgIH0sIHtcbiAgICAgICAgXCJuYW1lXCI6IFwiU1VCTUlUVEVEIFRPIEFDQ09VTlQgTkFNRVwiLFxuICAgICAgICBcImFwcGVuZFRleHRcIjogXCIge1NVQk1JVFRFRF9UT19BQ0NPVU5UX05BTUV9IFwiXG4gICAgICB9LCB7XG4gICAgICAgIFwibmFtZVwiOiBcIlNVQk1JVFRFRCBBQ0NPVU5UIE5BTUUgV0lUSCBMSU5LXCIsXG4gICAgICAgIFwiYXBwZW5kVGV4dFwiOiBcIiB7U1VCTUlUVEVEX0FDQ09VTlRfTkFNRV9XSVRIX0xJTkt9IFwiXG4gICAgICB9LCB7XG4gICAgICAgIFwibmFtZVwiOiBcIkFDQ0VQVEVEIENIQU5ORUxTIExJU1RcIixcbiAgICAgICAgXCJhcHBlbmRUZXh0XCI6IFwiIHtBQ0NFUFRFRF9DSEFOTkVMX0xJU1R9IFwiXG4gICAgICB9LCB7XG4gICAgICAgIFwibmFtZVwiOiBcIkFDQ0VQVEVEIENIQU5ORUxTIExJU1QgV0lUSCBMSU5LU1wiLFxuICAgICAgICBcImFwcGVuZFRleHRcIjogXCIge0FDQ0VQVEVEX0NIQU5ORUxfTElTVF9XSVRIX0xJTkt9IFwiXG4gICAgICB9LCB7XG4gICAgICAgIFwibmFtZVwiOiBcIlRPREFZUyBEQVRFXCIsXG4gICAgICAgIFwiYXBwZW5kVGV4dFwiOiBcIiB7VE9EQVlTREFURX0gXCJcbiAgICAgIH1dO1xuXG4gICAgICAkc2NvcGUuY3VzdG9tQm94ID0ge1xuICAgICAgICBcImFjY2VwdGFuY2VcIjoge1xuICAgICAgICAgIFwidGl0bGVcIjogXCJcIixcbiAgICAgICAgICBcInN1YmplY3RcIjogXCJcIixcbiAgICAgICAgICBcImJvZHlcIjogXCJcIlxuICAgICAgICB9LFxuICAgICAgICBcImRlY2xpbmVcIjoge1xuICAgICAgICAgIFwidGl0bGVcIjogXCJcIixcbiAgICAgICAgICBcInN1YmplY3RcIjogXCJcIixcbiAgICAgICAgICBcImJvZHlcIjogXCJcIlxuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBpZiAoJHNjb3BlLkFjY291bnRzU3RlcERhdGEucGF5cGFsID09IHVuZGVmaW5lZCkge1xuICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wYXlwYWwgPSB7fTtcbiAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucGF5cGFsLnZhcmlmeSA9IGZhbHNlO1xuICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wYXlwYWwucHJvY2Vzc2NoYW5uZWwgPSBmYWxzZTtcbiAgICAgIH1cbiAgICAgICRzY29wZS5lcnJvcnZlcmlmaWNhdGlvbiA9IGZhbHNlO1xuICAgICAgJHNjb3BlLnZlcmlmaWVkID0gZmFsc2U7XG4gICAgICAkc2NvcGUud2FpdG9uZW1pbnV0ZSA9IGZhbHNlO1xuXG5cbiAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdhZG1pbi9iYXNpYy9zdGVwMSNnZW5lcmFsSW5mbycpICE9IC0xKSB7XG4gICAgICAgICQoJy5uYXYtdGFicyBhW2hyZWY9XCIjZ2VuZXJhbEluZm9cIl0nKS50YWIoJ3Nob3cnKTtcbiAgICAgIH0gZWxzZSBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignYWRtaW4vYmFzaWMvc3RlcDEjc2NlJykgIT0gLTEpIHtcbiAgICAgICAgJCgnLm5hdi10YWJzIGFbaHJlZj1cIiNzY2VcIl0nKS50YWIoJ3Nob3cnKTtcbiAgICAgIH0gZWxzZSBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignYWRtaW4vYmFzaWMvc3RlcDEjcHNjZScpICE9IC0xKSB7XG4gICAgICAgICQoJy5uYXYtdGFicyBhW2hyZWY9XCIjcHNjZVwiXScpLnRhYignc2hvdycpO1xuICAgICAgfSBlbHNlIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdhZG1pbi9iYXNpYy9zdGVwMSNub3RpZmljYXRpb25zJykgIT0gLTEpIHtcbiAgICAgICAgJCgnLm5hdi10YWJzIGFbaHJlZj1cIiNub3RpZmljYXRpb25zXCJdJykudGFiKCdzaG93Jyk7XG4gICAgICB9IGVsc2UgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ2FkbWluL2Jhc2ljL3N0ZXAxI3BheXBhbEluZm8nKSAhPSAtMSkge1xuICAgICAgICAkKCcubmF2LXRhYnMgYVtocmVmPVwiI3BheXBhbEluZm9cIl0nKS50YWIoJ3Nob3cnKTtcbiAgICAgIH1cbiAgICAgICRzY29wZS5zaG93UGFzc3dvcmRDaGFuZ2UgPSBmYWxzZTtcblxuICAgICAgJHNjb3BlLmFkZEV2ZW50Q2xhc3MgPSBmdW5jdGlvbihpbmRleCwgdHlwZSkge1xuICAgICAgICAkKCcuc2VsZWN0ZWRCb3gnKS5yZW1vdmVDbGFzcyhcInNlbGVjdGVkQm94XCIpO1xuICAgICAgICAkKFwiLlwiICsgdHlwZSArIGluZGV4KS5hZGRDbGFzcyhcInNlbGVjdGVkQm94XCIpO1xuICAgICAgICBjb25zb2xlLmxvZyh0eXBlICsgaW5kZXgpO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUuYWRkQ3VzdG9tRW1haWxzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICgkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5jdXN0b21pemVlbWFpbHMubGVuZ3RoID4gMClcbiAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5jdXN0b21pemVlbWFpbHMucHVzaCgkc2NvcGUuY3VzdG9tQm94KTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLnNlbmRUZXN0TWFpbCA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgJHNjb3BlLnRlc3RFbWFpbFR5cGUgPSB0eXBlO1xuICAgICAgICAkc2NvcGUuc2hvd1Rlc3RFbWFpbE1vZGFsID0gdHJ1ZTtcbiAgICAgICAgJCgnI2VtYWlsTW9kYWwnKS5tb2RhbCgnc2hvdycpO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUuc2VuZE1haWwgPSBmdW5jdGlvbihlbWFpbCkge1xuICAgICAgICBpZiAoZW1haWwgIT0gXCJcIikge1xuICAgICAgICAgIHZhciBlbWFpbE9iaiA9IFwiXCI7XG4gICAgICAgICAgaWYgKCRzY29wZS50ZXN0RW1haWxUeXBlID09IFwicmVwb3N0YWNjZXB0XCIpIHtcbiAgICAgICAgICAgIGVtYWlsT2JqID0gJHNjb3BlLkFjY291bnRzU3RlcERhdGEucmVwb3N0Q3VzdG9taXplRW1haWxzWzBdLmFjY2VwdGFuY2U7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICgkc2NvcGUudGVzdEVtYWlsVHlwZSA9PSBcInJlcG9zdGRlY2xpbmVcIikge1xuICAgICAgICAgICAgZW1haWxPYmogPSAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5yZXBvc3RDdXN0b21pemVFbWFpbHNbMF0uZGVjbGluZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCRzY29wZS50ZXN0RW1haWxUeXBlID09IFwicHJlbWllcmFjY2VwdFwiKSB7XG4gICAgICAgICAgICBlbWFpbE9iaiA9ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXJDdXN0b21pemVFbWFpbHNbMF0uYWNjZXB0YW5jZTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCRzY29wZS50ZXN0RW1haWxUeXBlID09IFwicHJlbWllcmRlY2xpbmVcIikge1xuICAgICAgICAgICAgZW1haWxPYmogPSAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyQ3VzdG9taXplRW1haWxzWzBdLmRlY2xpbmU7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBtYWlsT2JqID0ge307XG4gICAgICAgICAgbWFpbE9iai5lbWFpbCA9IGVtYWlsO1xuICAgICAgICAgIG1haWxPYmouZW1haWxPYmogPSBlbWFpbE9iajtcbiAgICAgICAgICAkaHR0cC5wb3N0KCcvYXBpL2FjY291bnRzdGVwcy9zZW5kVGVzdEVtYWlsJywgbWFpbE9iailcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICBpZiAocmVzLmRhdGEuc3VjY2Vzcykge1xuICAgICAgICAgICAgICAgICRzY29wZS5zaG93VGVzdEVtYWlsTW9kYWwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAkKCcjZW1haWxNb2RhbCcpLm1vZGFsKCdoaWRlJyk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICRzY29wZS5zaG93VGVzdEVtYWlsTW9kYWwgPSBmYWxzZTtcbiAgICAgICAgICAgICAgJCgnI2VtYWlsTW9kYWwnKS5tb2RhbCgnaGlkZScpO1xuICAgICAgICAgICAgICAkLlplYnJhX0RpYWxvZygnRXJyb3IgaW4gc2VuZGluZyBtYWlsLicpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAkc2NvcGUuY3VycmVudFRhYiA9IHdpbmRvdy5sb2NhdGlvbi5ocmVmLnNwbGl0KCcjJylbMV07XG4gICAgICAkc2NvcGUuY2xvc2VNb2RhbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAkc2NvcGUuc2hvd1Rlc3RFbWFpbE1vZGFsID0gZmFsc2U7XG4gICAgICAgICQoJyNlbWFpbE1vZGFsJykubW9kYWwoJ2hpZGUnKTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLmlzRmlyc3RMb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoISEkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wYXlwYWxfZW1haWwpIHtcbiAgICAgICAgICAkc2NvcGUuYWN0aXZlVGFiID0gWydnZW5lcmFsJywgJ3NjZScsICdwc2NlJywgJ25vdGlmaWNhdGlvbnMnLCAncGF5cGFsSW5mbyddO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hZG1pbi9iYXNpYy9zdGVwMSNnZW5lcmFsSW5mbyc7XG4gICAgICAgICAgJHNjb3BlLmFjdGl2ZVRhYiA9IFsnZ2VuZXJhbCddO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5pc0ZpcnN0TG9naW4oKTtcbiAgICAgICRzY29wZS5uZXh0U3RlcCA9IGZ1bmN0aW9uKHN0ZXAsIGN1cnJlbnREYXRhLCB0eXBlKSB7XG4gICAgICAgIGlmICh0eXBlID09IFwiYmFzaWNcIikge1xuICAgICAgICAgIHN3aXRjaCAoc3RlcCkge1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAkc3RhdGUuZ28oXCJiYXNpY3N0ZXAxXCIpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgdmFyIG5leHQgPSB0cnVlO1xuICAgICAgICAgICAgICB2YXIgYm9keSA9IHt9O1xuICAgICAgICAgICAgICBpZiAoJHNjb3BlLkFjY291bnRzU3RlcERhdGEuZW1haWwgPT0gXCJcIikge1xuICAgICAgICAgICAgICAgIG5leHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAkLlplYnJhX0RpYWxvZygnRXJyb3I6IEVudGVyIGVtYWlsIGFkZHJlc3MnKTtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmICgkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5lbWFpbCAhPSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgYm9keS5lbWFpbCA9ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLmVtYWlsO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmICgkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5uZXdwYXNzd29yZCAhPSBcIlwiICYmICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLm5ld2NvbmZpcm1wYXNzd29yZCAhPSAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5uZXdwYXNzd29yZCkge1xuICAgICAgICAgICAgICAgIG5leHQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAkLlplYnJhX0RpYWxvZygnRXJyb3I6IFBhc3N3b3JkIGRvZXNu4oCZdCBtYXRjaCcpO1xuICAgICAgICAgICAgICB9IGVsc2UgaWYgKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLm5ld3Bhc3N3b3JkICE9IFwiXCIgJiYgJHNjb3BlLkFjY291bnRzU3RlcERhdGEubmV3Y29uZmlybXBhc3N3b3JkID09ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLm5ld3Bhc3N3b3JkKSB7XG4gICAgICAgICAgICAgICAgYm9keS5wYXNzd29yZCA9ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLm5ld3Bhc3N3b3JkO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmICgkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcm9maWxlUGljdHVyZSA9PSBcImh0dHBzOi8vaTEuc25kY2RuLmNvbS9hdmF0YXJzLTAwMDIyMzU5OTMwMS0wbnMwNzYtdDUwMHg1MDAuanBnXCIpIHtcbiAgICAgICAgICAgICAgICBuZXh0ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coJ0Vycm9yOiBQbGVhc2UgdXBsb2FkIHlvdXIgcHJvZmlsZSBpbWFnZScpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmICgkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcm9maWxlUGljdHVyZSAhPSBcIlwiKSB7XG4gICAgICAgICAgICAgICAgYm9keS5waWN0dXJlVXJsID0gJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJvZmlsZVBpY3R1cmU7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAobmV4dCkge1xuICAgICAgICAgICAgICAgIEFjY291bnRTZXR0aW5nU2VydmljZXMudXBkYXRlQWRtaW5Qcm9maWxlKGJvZHkpXG4gICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJlcy5kYXRhLm1lc3NhZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAkLlplYnJhX0RpYWxvZygnRXJyb3I6IEVtYWlsIGFscmVhZHkgcmVnaXN0ZXIuJyk7XG5cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5uZXdwYXNzd29yZCA9IFwiXCI7XG4gICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEubmV3Y29uZmlybXBhc3N3b3JkID0gXCJcIjtcbiAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnJlcG9zdEN1c3RvbWl6ZUVtYWlscyA9ICgoJHNjb3BlLkFjY291bnRzU3RlcERhdGEucmVwb3N0Q3VzdG9taXplRW1haWxzLmxlbmd0aCA+IDApID8gJHNjb3BlLkFjY291bnRzU3RlcERhdGEucmVwb3N0Q3VzdG9taXplRW1haWxzIDogW3tcbiAgICAgICAgICAgICAgICAgICAgICAgIFwiYWNjZXB0YW5jZVwiOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwidGl0bGVcIjogXCJBQ0NFUFRBTkNFIEVNQUlMXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwic3ViamVjdFwiOiBcIkNvbmdyYXR1bGF0aW9ucyBvbiB5b3VyIFN1Ym1pc3Npb24gLSB7VFJBQ0tfVElUTEV9XCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFwiYm9keVwiOiBcIkhleSB7U1VCTUlUVEVSU19OQU1FfSFcXG5cXG5GaXJzdCBhbmQgZm9yZW1vc3QgdGhhbmsgeW91IGZvciBzdWJtaXR0aW5nIHtUUkFDS19USVRMRV9XSVRIX0xJTkt9ISBXZeKAmXZlIHJldmlld2VkIHlvdXIgc3VibWlzc2lvbiBhbmQgaXQgaGFzIGJlZW4gYXBwcm92ZWQgZm9yIGEgcmVwb3N0IG9uIHtTVUJNSVRURURfQUNDT1VOVF9OQU1FX1dJVEhfTElOS30gYW5kIG1vcmUuIEFsbCB5b3UgbmVlZCB0byBkbyBpcyBjbGljayB0aGUgYnV0dG9uIGJlbG93LiBZb3UgYXJlIG9wZW4gdG8gcmVwZWF0IHlvdXIgcHJvbW90aW9uIG9uIGFueSBvZiB0aGVzZSBwYWdlcyBhcyBtYW55IHRpbWVzIGFzIHlvdSB3b3VsZCBsaWtlLCBhbmQgdGhlIHByb21vdGlvbiBwYWdlIHdpbGwgcmVtYWluIGFjdGl2ZSBmb3JldmVyLlxcblxcbldlIHRob3JvdWdobHkgZW5qb3llZCBsaXN0ZW5pbmcgdG8geW91ciBwcm9kdWN0aW9uIGFuZCB3ZSBob3BlIHRoYXQgaW4gdGhlIGZ1dHVyZSB5b3Ugc3VibWl0IHlvdXIgbXVzaWMgdG8gdXMuIEtlZXAgd29ya2luZyBoYXJkIGFuZCBwdXQgeW91ciBoZWFydCBpbnRvIHlvdXIgcHJvZHVjdGlvbnMsIHdlIHdpbGwgYmUgaGVyZSB0byBoZWxwIHlvdSB3aXRoIHRoZSByZXN0LlwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcImJ1dHRvblRleHRcIjogXCJBY2NlcHRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJidXR0b25CZ0NvbG9yXCI6IFwiIzU5MmUyZVwiXG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgXCJkZWNsaW5lXCI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJ0aXRsZVwiOiBcIkRFQ0xJTkUgRU1BSUxcIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJzdWJqZWN0XCI6IFwiTXVzaWMgU3VibWlzc2lvblwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcImJvZHlcIjogXCJIZXkge1NVQk1JVFRFUlNfTkFNRX0sXFxuXFxuVGhhbmsgeW91IGZvciBzdWJtaXR0aW5nIHlvdXIgdHJhY2sge1RSQUNLX1RJVExFX1dJVEhfTElOS30hIFNhZGx5IHdlIGhhdmUgdG8gaW5mb3JtIHlvdSB0aGF0IHdlIGRvbuKAmXQgdGhpbmsgdGhlIHRyYWNrIGlzIHJlYWR5IHRvIGJlIHNoYXJlZCBieSBvdXIgY2hhbm5lbHMuIFdpdGggdGhhdCBiZWluZyBzYWlkLCBkbyBub3QgZ2V0IGRpc2NvdXJhZ2VkIGFzIG1hbnkgbmFtZXMgdGhhdCBhcmUgbm93IHRyZW5kaW5nIG9uIFNvdW5kQ2xvdWQgaGF2ZSBiZWVuIHR1cm5lZCBkb3duIGJlZm9yZS4gS2VlcCBpbiB0b3VjaCBhbmQgd2UgYXJlIGFsd2F5cyBoZXJlIHRvIGdsYWRseSByZXZpZXcgbW9yZSB0cmFja3MgaW4gdGhlIGZ1dHVyZS5cXG5cXG5Hb29kIGx1Y2sgYW5kIHN0YXkgdHJ1ZSB0byB5b3Vyc2VsZi5cIixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgXCJidXR0b25UZXh0XCI6IFwiRGVjbGluZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBcImJ1dHRvbkJnQ29sb3JcIjogXCIjNTkyZTJlXCJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICB9XSk7XG4gICAgICAgICAgICAgICAgICAgICAgLy9yYXNjYWwgMy0zMFxuICAgICAgICAgICAgICAgICAgICAgIC8vJHNjb3BlLmFjdGl2ZVRhYi5wdXNoKCdzY2UnKTtcbiAgICAgICAgICAgICAgICAgICAgICAvLyQoJy5uYXYtdGFicyBhW2hyZWY9XCIjc2NlXCJdJykudGFiKCdzaG93Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlQWRtaW5Vc2VyKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coJ0Vycm9yOiBFcnJvciBpbnByb2Nlc3NpbmcgdGhlIHJlcXVlc3QuJyk7XG4gICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgIEFjY291bnRTZXR0aW5nU2VydmljZXMudXBkYXRlQWRtaW5Qcm9maWxlKHtcbiAgICAgICAgICAgICAgICAgIHJlcG9zdEN1c3RvbWl6ZUVtYWlsczogJHNjb3BlLkFjY291bnRzU3RlcERhdGEucmVwb3N0Q3VzdG9taXplRW1haWxzXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oKSB7fSk7XG4gICAgICAgICAgICAgIC8vICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXJDdXN0b21pemVFbWFpbHMgPSAoKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXJDdXN0b21pemVFbWFpbHMubGVuZ3RoID4gMCkgPyAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyQ3VzdG9taXplRW1haWxzIDogW3tcbiAgICAgICAgICAgICAgLy8gIFwiYWNjZXB0YW5jZVwiOiB7XG4gICAgICAgICAgICAgIC8vICAgIFwidGl0bGVcIjogXCJBQ0NFUFRBTkNFIEVNQUlMXCIsXG4gICAgICAgICAgICAgIC8vICAgIFwic3ViamVjdFwiOiBcIkNvbmdyYXR1bGF0aW9ucyBvbiB5b3VyIFN1Ym1pc3Npb24gLVwiLFxuICAgICAgICAgICAgICAvLyAgICBcImJvZHlcIjogXCJIZXkge05BTUV9IVxcblxcbkZpcnN0IGFuZCBmb3JlbW9zdCB0aGFuayB5b3UgZm9yIHN1Ym1pdHRpbmcge1RSQUNLX1RJVExFX1dJVEhfTElOS30gISBXZeKAmXZlIHJldmlld2VkIHlvdXIgc3VibWlzc2lvbiBhbmQgaXQgaGFzIGJlZW4gYXBwcm92ZWQgZm9yIGEgcmVwb3N0IG9uIHtuYW1lb2ZjaGFubmVsc3VibWl0dGVkfSBhbmQgbW9yZS4gQWxsIHlvdSBuZWVkIHRvIGRvIGlzIGNsaWNrIHRoZSBidXR0b24gYmVsb3cuIFlvdSBhcmUgb3BlbiB0byByZXBlYXQgeW91ciBwcm9tb3Rpb24gb24gYW55IG9mIHRoZXNlIHBhZ2VzIGFzIG1hbnkgdGltZXMgYXMgeW91IHdvdWxkIGxpa2UsIGFuZCB0aGUgcHJvbW90aW9uIHBhZ2Ugd2lsbCByZW1haW4gYWN0aXZlIGZvcmV2ZXIuXFxuXFxuV2UgdGhvcm91Z2hseSBlbmpveWVkIGxpc3RlbmluZyB0byB5b3VyIHByb2R1Y3Rpb24gYW5kIHdlIGhvcGUgdGhhdCBpbiB0aGUgZnV0dXJlIHlvdSBzdWJtaXQgeW91ciBtdXNpYyB0byB1cy4gS2VlcCB3b3JraW5nIGhhcmQgYW5kIHB1dCB5b3VyIGhlYXJ0IGludG8geW91ciBwcm9kdWN0aW9ucywgd2Ugd2lsbCBiZSBoZXJlIHRvIGhlbHAgeW91IHdpdGggdGhlIHJlc3QuXCIsXG4gICAgICAgICAgICAgIC8vICAgIFwiYnV0dG9uVGV4dFwiOiBcIkFjY2VwdFwiLFxuICAgICAgICAgICAgICAvLyAgICBcImJ1dHRvbkJnQ29sb3JcIjogXCIjNTkyZTJlXCJcbiAgICAgICAgICAgICAgLy8gIH0sXG4gICAgICAgICAgICAgIC8vICBcImRlY2xpbmVcIjoge1xuICAgICAgICAgICAgICAvLyAgICBcInRpdGxlXCI6IFwiREVDTElORSBFTUFJTFwiLFxuICAgICAgICAgICAgICAvLyAgICBcInN1YmplY3RcIjogXCJNdXNpYyBTdWJtaXNzaW9uXCIsXG4gICAgICAgICAgICAgIC8vICAgIFwiYm9keVwiOiBcIkhleSB7TkFNRX0sXFxuXFxuVGhhbmsgeW91IGZvciBzdWJtaXR0aW5nIHlvdXIgdHJhY2sge1RSQUNLX1RJVExFX1dJVEhfTElOS30gISBTYWRseSB3ZSBoYXZlIHRvIGluZm9ybSB5b3UgdGhhdCB3ZSBkb27igJl0IHRoaW5rIHRoZSB0cmFjayBpcyByZWFkeSB0byBiZSBzaGFyZWQgYnkgb3VyIGNoYW5uZWxzLiBXaXRoIHRoYXQgYmVpbmcgc2FpZCwgZG8gbm90IGdldCBkaXNjb3VyYWdlZCBhcyBtYW55IG5hbWVzIHRoYXQgYXJlIG5vdyB0cmVuZGluZyBvbiBTb3VuZENsb3VkIGhhdmUgYmVlbiB0dXJuZWQgZG93biBiZWZvcmUuIEtlZXAgaW4gdG91Y2ggYW5kIHdlIGFyZSBhbHdheXMgaGVyZSB0byBnbGFkbHkgcmV2aWV3IG1vcmUgdHJhY2tzIGluIHRoZSBmdXR1cmUuXFxuXFxuR29vZCBsdWNrIGFuZCBzdGF5IHRydWUgdG8geW91cnNlbGYuXCIsXG4gICAgICAgICAgICAgIC8vICAgIFwiYnV0dG9uVGV4dFwiOiBcIkRlY2xpbmVcIixcbiAgICAgICAgICAgICAgLy8gICAgXCJidXR0b25CZ0NvbG9yXCI6IFwiIzU5MmUyZVwiXG4gICAgICAgICAgICAgIC8vICB9XG4gICAgICAgICAgICAgIC8vIH1dKTtcbiAgICAgICAgICAgICAgLy9yYXNjYWwgMy0zMFxuICAgICAgICAgICAgICAvLyRzY29wZS5hY3RpdmVUYWIucHVzaCgnbm90aWZpY2F0aW9ucycpO1xuICAgICAgICAgICAgICAvLyQoJy5uYXYtdGFicyBhW2hyZWY9XCIjbm90aWZpY2F0aW9uc1wiXScpLnRhYignc2hvdycpO1xuICAgICAgICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGVBZG1pblVzZXIoJHNjb3BlLkFjY291bnRzU3RlcERhdGEpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgQWNjb3VudFNldHRpbmdTZXJ2aWNlcy51cGRhdGVBZG1pblByb2ZpbGUoe1xuICAgICAgICAgICAgICAgICAgcHJlbWllckN1c3RvbWl6ZUVtYWlsczogJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJlbWllckN1c3RvbWl6ZUVtYWlsc1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgICAvL3Jhc2NhbF8zLTMwXG4gICAgICAgICAgICAgICAgICAvLyAkc2NvcGUuYWN0aXZlVGFiLnB1c2goJ25vdGlmaWNhdGlvbnMnKTtcbiAgICAgICAgICAgICAgICAgIC8vJCgnLm5hdi10YWJzIGFbaHJlZj1cIiNub3RpZmljYXRpb25zXCJdJykudGFiKCdzaG93Jyk7XG4gICAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKCkge30pO1xuICAgICAgICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGVBZG1pblVzZXIoJHNjb3BlLkFjY291bnRzU3RlcERhdGEpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNTpcbiAgICAgICAgICAgICAgQWNjb3VudFNldHRpbmdTZXJ2aWNlcy51cGRhdGVBZG1pblByb2ZpbGUoe1xuICAgICAgICAgICAgICAgICAgbm90aWZpY2F0aW9uU2V0dGluZ3M6ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLm5vdGlmaWNhdGlvblNldHRpbmdzLFxuICAgICAgICAgICAgICAgICAgZW1haWw6ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLmVtYWlsXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oKSB7fSk7XG4gICAgICAgICAgICAgICRzY29wZS5lcnJvcnZlcmlmaWNhdGlvbiA9IGZhbHNlO1xuICAgICAgICAgICAgICAkc2NvcGUudmVyaWZpZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgJHNjb3BlLndhaXRvbmVtaW51dGUgPSBmYWxzZTtcbiAgICAgICAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlQWRtaW5Vc2VyKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhKTtcbiAgICAgICAgICAgICAgaWYgKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBheXBhbCA9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wYXlwYWwgPSB7fTtcbiAgICAgICAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wYXlwYWwudmFyaWZ5ID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucGF5cGFsLnByb2Nlc3NjaGFubmVsID0gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgLy9yYXNjYWxfMy0zMFxuICAgICAgICAgICAgICAvLyRzY29wZS5hY3RpdmVUYWIucHVzaCgncGF5cGFsSW5mbycpO1xuICAgICAgICAgICAgICAvLyQoJy5uYXYtdGFicyBhW2hyZWY9XCIjcGF5cGFsSW5mb1wiXScpLnRhYignc2hvdycpO1xuICAgICAgICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGVBZG1pblVzZXIoJHNjb3BlLkFjY291bnRzU3RlcERhdGEpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodHlwZSA9PSBcImNoYW5uZWxcIikge1xuICAgICAgICAgIHN3aXRjaCAoc3RlcCkge1xuICAgICAgICAgICAgY2FzZSAxOlxuICAgICAgICAgICAgICAkaHR0cC5nZXQoXCIvY29ubmVjdC9sb2dvdXQ/cmV0dXJuX3RvPWh0dHBzOi8vc291bmRjbG91ZC5jb20vY29ubmVjdD9jbGllbnRfaWQ9ODAwMmYwZjgzMjZkODY5NjY4NTIzZDhlNDVhNTNiOTAmZGlzcGxheT1wb3B1cCZyZWRpcmVjdF91cmk9aHR0cHM6Ly9cIiArIHdpbmRvdy5sb2NhdGlvbi5ob3N0ICsgXCIvY2FsbGJhY2suaHRtbCZyZXNwb25zZV90eXBlPWNvZGVfYW5kX3Rva2VuJnNjb3BlPW5vbi1leHBpcmluZyZzdGF0ZT1Tb3VuZENsb3VkX0RpYWxvZ181ZmVhZFwiKTtcbiAgICAgICAgICAgICAgJHN0YXRlLmdvKFwiY2hhbm5lbHN0ZXAxXCIpO1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgMjpcbiAgICAgICAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlQWRtaW5Vc2VyKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhKTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIDM6XG4gICAgICAgICAgICAgIHZhciBuZXh0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgaWYgKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByaWNlID09IDAgfHwgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJpY2UgPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgbmV4dCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKCdFcnJvcjogRW50ZXIgUHJpY2UnKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmIChuZXh0KSB7XG4gICAgICAgICAgICAgICAgQWNjb3VudFNldHRpbmdTZXJ2aWNlcy51cGRhdGVQYWlkUmVwb3N0KHtcbiAgICAgICAgICAgICAgICAgICAgdXNlcklEOiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5zdWJtaXNzaW9uRGF0YS51c2VySUQsXG4gICAgICAgICAgICAgICAgICAgIHByaWNlOiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmljZSxcbiAgICAgICAgICAgICAgICAgICAgZGVzY3JpcHRpb246ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICAgICAgICBncm91cHM6ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnN1Ym1pc3Npb25EYXRhLmdyb3VwcyA/ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnN1Ym1pc3Npb25EYXRhLmdyb3VwcyA6IFtdLFxuICAgICAgICAgICAgICAgICAgICBzdWJtaXNzaW9uVXJsOiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5zdWJtaXNzaW9uRGF0YS5zdWJtaXNzaW9uVXJsLFxuICAgICAgICAgICAgICAgICAgICBwcmVtaWVyVXJsOiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5zdWJtaXNzaW9uRGF0YS5wcmVtaWVyVXJsXG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZUFkbWluVXNlcigkc2NvcGUuQWNjb3VudHNTdGVwRGF0YSk7XG4gICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKCkge30pO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIGNhc2UgNDpcbiAgICAgICAgICAgICAgQWNjb3VudFNldHRpbmdTZXJ2aWNlcy5hZGRDdXN0b21pemUoe1xuICAgICAgICAgICAgICAgICAgdXNlcklEOiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5zdWJtaXNzaW9uRGF0YS51c2VySUQsXG4gICAgICAgICAgICAgICAgICB0eXBlOiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS50eXBlLFxuICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJHNjb3BlLkFjY291bnRzU3RlcERhdGEucG9zdERhdGEuYmFja2dyb3VuZCxcbiAgICAgICAgICAgICAgICAgIGxvZ286ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBvc3REYXRhLmxvZ28sXG4gICAgICAgICAgICAgICAgICBoZWFkaW5nOiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS5oZWFkaW5nLFxuICAgICAgICAgICAgICAgICAgc3ViSGVhZGluZzogJHNjb3BlLkFjY291bnRzU3RlcERhdGEucG9zdERhdGEuc3ViSGVhZGluZyxcbiAgICAgICAgICAgICAgICAgIGlucHV0RmllbGRzOiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS5pbnB1dEZpZWxkcyxcbiAgICAgICAgICAgICAgICAgIGJ1dHRvbjogJHNjb3BlLkFjY291bnRzU3RlcERhdGEucG9zdERhdGEuYnV0dG9uXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZUFkbWluVXNlcigkc2NvcGUuQWNjb3VudHNTdGVwRGF0YSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oKSB7fSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA1OlxuICAgICAgICAgICAgICBBY2NvdW50U2V0dGluZ1NlcnZpY2VzLmFkZEN1c3RvbWl6ZSh7XG4gICAgICAgICAgICAgICAgICB1c2VySUQ6ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnN1Ym1pc3Npb25EYXRhLnVzZXJJRCxcbiAgICAgICAgICAgICAgICAgIHR5cGU6ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIudHlwZSxcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIuYmFja2dyb3VuZCxcbiAgICAgICAgICAgICAgICAgIGxvZ286ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIubG9nbyxcbiAgICAgICAgICAgICAgICAgIGhlYWRpbmc6ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIuaGVhZGluZyxcbiAgICAgICAgICAgICAgICAgIHN1YkhlYWRpbmc6ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIuc3ViSGVhZGluZyxcbiAgICAgICAgICAgICAgICAgIGlucHV0RmllbGRzOiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyLmlucHV0RmllbGRzLFxuICAgICAgICAgICAgICAgICAgYnV0dG9uOiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyLmJ1dHRvblxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLkFjY291bnRzU3RlcERhdGEuYXZhaWxhYmxlU2xvdHMgPT0gdW5kZWZpbmVkKSAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5hdmFpbGFibGVTbG90cyA9IGRlZmF1bHRBdmFpbGFibGVTbG90cztcbiAgICAgICAgICAgICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZUFkbWluVXNlcigkc2NvcGUuQWNjb3VudHNTdGVwRGF0YSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oKSB7fSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA2OlxuICAgICAgICAgICAgICBBY2NvdW50U2V0dGluZ1NlcnZpY2VzLnVwZGF0ZVVzZXJBdmFpbGFibGVTbG90KHtcbiAgICAgICAgICAgICAgICAgIF9pZDogJHNjb3BlLkFjY291bnRzU3RlcERhdGEuc3VibWlzc2lvbkRhdGEudXNlcklELFxuICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlU2xvdHM6ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLmF2YWlsYWJsZVNsb3RzXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oKSB7fSk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSA3OlxuICAgICAgICAgICAgICBTZXNzaW9uU2VydmljZS5yZW1vdmVBY2NvdW50dXNlcnMoJHNjb3BlLkFjY291bnRzU3RlcERhdGEpO1xuICAgICAgICAgICAgICAkcm9vdFNjb3BlLmVuYWJsZU5hdmlnYXRpb24gPSBmYWxzZTtcbiAgICAgICAgICAgICAgJHN0YXRlLmdvKFwiYWNjb3VudHNcIik7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAkc2NvcGUuYXBwZW5kQm9keSA9IGZ1bmN0aW9uKGJ0biwgdHlwZSkge1xuICAgICAgICB2YXIgaWRzID0gXCIjc2NlXCI7XG4gICAgICAgIGlmICh0eXBlID09IFwicHJlbWllclwiKSBpZHMgPSBcIiNwc2NlXCI7XG4gICAgICAgIGNvbnNvbGUubG9nKCQoaWRzKS5maW5kKCcuc2VsZWN0ZWRCb3gnKSlcbiAgICAgICAgaWYgKCQoaWRzKS5maW5kKCcuc2VsZWN0ZWRCb3gnKS5sZW5ndGgpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygkKGlkcykuZmluZCgnLnNlbGVjdGVkQm94JykpXG4gICAgICAgICAgdmFyIGJveEluZGV4ID0gJChpZHMpLmZpbmQoJy5zZWxlY3RlZEJveCcpLmF0dHIoXCJpbmRleFwiKTtcbiAgICAgICAgICB2YXIgY3Vyc29yUG9zID0gJChpZHMpLmZpbmQoJy5zZWxlY3RlZEJveCcpLnByb3AoJ3NlbGVjdGlvblN0YXJ0Jyk7XG4gICAgICAgICAgdmFyIHYgPSAkKGlkcykuZmluZCgnLnNlbGVjdGVkQm94JykudmFsKCk7XG4gICAgICAgICAgdmFyIHRleHRCZWZvcmUgPSB2LnN1YnN0cmluZygwLCBjdXJzb3JQb3MpO1xuICAgICAgICAgIHZhciB0ZXh0QWZ0ZXIgPSB2LnN1YnN0cmluZyhjdXJzb3JQb3MsIHYubGVuZ3RoKTtcbiAgICAgICAgICB2YXIgbmV3dGV4dCA9IHRleHRCZWZvcmUgKyBidG4uYXBwZW5kVGV4dCArIHRleHRBZnRlcjtcbiAgICAgICAgICAkKGlkcykuZmluZCgnLnNlbGVjdGVkQm94JykudmFsKG5ld3RleHQpO1xuICAgICAgICAgICQoaWRzKS5maW5kKCcuc2VsZWN0ZWRCb3gnKS50cmlnZ2VyKCdpbnB1dCcpO1xuICAgICAgICAgIC8vIGlmICh0eXBlID09IFwicmVwb3N0XCIpIHtcbiAgICAgICAgICAvLyAgaWYgKCQoaWRzKS5maW5kKCcuc2VsZWN0ZWRCb3gnKS5oYXNDbGFzcyhcImRlY2xpbmVib3hcIikpIHtcbiAgICAgICAgICAvLyAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5yZXBvc3RDdXN0b21pemVFbWFpbHNbYm94SW5kZXhdLmRlY2xpbmUuYm9keSA9IG5ld3RleHQ7XG4gICAgICAgICAgLy8gIH0gZWxzZSBpZiAoJChpZHMpLmZpbmQoJy5zZWxlY3RlZEJveCcpLmhhc0NsYXNzKFwiYWNjZXB0YW5jZWJveFwiKSkge1xuICAgICAgICAgIC8vICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnJlcG9zdEN1c3RvbWl6ZUVtYWlsc1tib3hJbmRleF0uYWNjZXB0YW5jZS5ib2R5ID0gbmV3dGV4dDtcbiAgICAgICAgICAvLyAgfVxuICAgICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgICAgLy8gIGlmICgkKGlkcykuZmluZCgnLnNlbGVjdGVkQm94JykuaGFzQ2xhc3MoXCJkZWNsaW5lYm94XCIpKSB7XG4gICAgICAgICAgLy8gICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJlbWllckN1c3RvbWl6ZUVtYWlsc1tib3hJbmRleF0uZGVjbGluZS5ib2R5ID0gbmV3dGV4dDtcbiAgICAgICAgICAvLyAgfSBlbHNlIGlmICgkKGlkcykuZmluZCgnLnNlbGVjdGVkQm94JykuaGFzQ2xhc3MoXCJhY2NlcHRhbmNlYm94XCIpKSB7XG4gICAgICAgICAgLy8gICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJlbWllckN1c3RvbWl6ZUVtYWlsc1tib3hJbmRleF0uYWNjZXB0YW5jZS5ib2R5ID0gbmV3dGV4dDtcbiAgICAgICAgICAvLyAgfVxuICAgICAgICAgIC8vIH1cbiAgICAgICAgICAkKGlkcykuZmluZCgnLnNlbGVjdGVkQm94JykucmVtb3ZlQ2xhc3MoXCJzZWxlY3RlZEJveFwiKTtcbiAgICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGVBZG1pblVzZXIoJHNjb3BlLkFjY291bnRzU3RlcERhdGEpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5nZW5lcmF0ZVJhbmRvbU51bWJlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgbWluID0gMC4wMSxcbiAgICAgICAgICBtYXggPSAwLjA5LFxuICAgICAgICAgIG51bWJlcnMgPSAoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluKS50b0ZpeGVkKDIpO1xuICAgICAgICByZXR1cm4gbnVtYmVyc1xuICAgICAgfVxuXG4gICAgICB2YXIgZGF5c0FycmF5ID0gWydzdW5kYXknLCAnbW9uZGF5JywgJ3R1ZXNkYXknLCAnd2VkbmVzZGF5JywgJ3RodXJzZGF5JywgJ2ZyaWRheScsICdzYXR1cmRheSddO1xuXG4gICAgICB2YXIgZGVmYXVsdEF2YWlsYWJsZVNsb3RzID0ge1xuICAgICAgICAnc3VuZGF5JzogWzEsIDQsIDgsIDExLCAxNCwgMTcsIDIwXSxcbiAgICAgICAgJ21vbmRheSc6IFsxLCA0LCA4LCAxMSwgMTQsIDE3LCAyMF0sXG4gICAgICAgICd0dWVzZGF5JzogWzEsIDQsIDgsIDExLCAxNCwgMTcsIDIwXSxcbiAgICAgICAgJ3dlZG5lc2RheSc6IFsxLCA0LCA4LCAxMSwgMTQsIDE3LCAyMF0sXG4gICAgICAgICd0aHVyc2RheSc6IFsxLCA0LCA4LCAxMSwgMTQsIDE3LCAyMF0sXG4gICAgICAgICdmcmlkYXknOiBbMSwgNCwgOCwgMTEsIDE0LCAxNywgMjBdLFxuICAgICAgICAnc2F0dXJkYXknOiBbMSwgNCwgOCwgMTEsIDE0LCAxNywgMjBdXG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUuc2VuZFRyYWlsQW1vdW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhbW91bnRFbWFpbCA9ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBheXBhbF9lbWFpbDtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgICAkc2NvcGUuZXJyb3J2ZXJpZmljYXRpb24gPSBmYWxzZTtcbiAgICAgICAgaWYgKCRzY29wZS5pc1ZhbGlkRW1haWxBZGRyZXNzKGFtb3VudEVtYWlsKSkge1xuICAgICAgICAgIHZhciBwcmljZTEgPSAkc2NvcGUuZ2VuZXJhdGVSYW5kb21OdW1iZXIoKTtcbiAgICAgICAgICB2YXIgcHJpY2UyID0gJHNjb3BlLmdlbmVyYXRlUmFuZG9tTnVtYmVyKCk7XG4gICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucGF5cGFsLnByaWNlMSA9IHByaWNlMTtcbiAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wYXlwYWwucHJpY2UyID0gcHJpY2UyO1xuICAgICAgICAgIHZhciBwYXltZW50RGV0YWlscyA9IHt9O1xuICAgICAgICAgIHBheW1lbnREZXRhaWxzLmVtYWlsID0gYW1vdW50RW1haWw7XG4gICAgICAgICAgcGF5bWVudERldGFpbHMucHJpY2UgPSBwcmljZTE7XG4gICAgICAgICAgJGh0dHAucG9zdCgnL2FwaS9hY2NvdW50c3RlcHMvc2VuZFZhcmlmaWNhdGlvbkFjY291bnQnLCBwYXltZW50RGV0YWlscylcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICBpZiAocmVzKSB7XG4gICAgICAgICAgICAgICAgcGF5bWVudERldGFpbHMucHJpY2UgPSBwcmljZTI7XG4gICAgICAgICAgICAgICAgJGh0dHAucG9zdCgnL2FwaS9hY2NvdW50c3RlcHMvc2VuZFZhcmlmaWNhdGlvbkFjY291bnQnLCBwYXltZW50RGV0YWlscylcbiAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucGF5cGFsLnZhcmlmeSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnZlcmlmaWVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLndhaXRvbmVtaW51dGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmVycm9ydmVyaWZpY2F0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAkc2NvcGUuaXNWYWxpZEVtYWlsQWRkcmVzcyA9IGZ1bmN0aW9uKGVtYWlsQWRkcmVzcykge1xuICAgICAgICB2YXIgcGF0dGVybiA9IC9eKFthLXpcXGQhIyQlJicqK1xcLVxcLz0/Xl9ge3x9flxcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0rKFxcLlthLXpcXGQhIyQlJicqK1xcLVxcLz0/Xl9ge3x9flxcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0rKSp8XCIoKChbIFxcdF0qXFxyXFxuKT9bIFxcdF0rKT8oW1xceDAxLVxceDA4XFx4MGJcXHgwY1xceDBlLVxceDFmXFx4N2ZcXHgyMVxceDIzLVxceDViXFx4NWQtXFx4N2VcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdfFxcXFxbXFx4MDEtXFx4MDlcXHgwYlxceDBjXFx4MGQtXFx4N2ZcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkqKChbIFxcdF0qXFxyXFxuKT9bIFxcdF0rKT9cIilAKChbYS16XFxkXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXXxbYS16XFxkXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXVthLXpcXGRcXC0uX35cXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKlthLXpcXGRcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKVxcLikrKFthLXpcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdfFthLXpcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdW2EtelxcZFxcLS5fflxcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0qW2EtelxcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pXFwuPyQvaTtcbiAgICAgICAgcmV0dXJuIHBhdHRlcm4udGVzdChlbWFpbEFkZHJlc3MpO1xuICAgICAgfTtcblxuICAgICAgJHNjb3BlLnZhcmlmeWFjY291bnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgICAkc2NvcGUuZXJyb3J2ZXJpZmljYXRpb24gPSBmYWxzZTtcbiAgICAgICAgJHNjb3BlLnZlcmlmaWVkID0gZmFsc2U7XG4gICAgICAgICRzY29wZS53YWl0b25lbWludXRlID0gZmFsc2U7XG4gICAgICAgIHZhciBwYXlwYWxkYXRhID0gJHNjb3BlLkFjY291bnRzU3RlcERhdGEucGF5cGFsO1xuICAgICAgICBpZiAoKHBheXBhbGRhdGEucHJpY2UxID09IHBhcnNlRmxvYXQocGF5cGFsZGF0YS5wcmljZWEpICYmIHBheXBhbGRhdGEucHJpY2UyID09IHBhcnNlRmxvYXQocGF5cGFsZGF0YS5wcmljZWIpKSB8fCAocGF5cGFsZGF0YS5wcmljZTEgPT0gcGFyc2VGbG9hdChwYXlwYWxkYXRhLnByaWNlYikgJiYgcGF5cGFsZGF0YS5wcmljZTIgPT0gcGFyc2VGbG9hdChwYXlwYWxkYXRhLnByaWNlYSkpKSB7XG4gICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucGF5cGFsLnByb2Nlc3NjaGFubmVsID0gdHJ1ZTtcbiAgICAgICAgICBBY2NvdW50U2V0dGluZ1NlcnZpY2VzLnVwZGF0ZUFkbWluUHJvZmlsZSh7XG4gICAgICAgICAgICAgIHBheXBhbF9lbWFpbDogJHNjb3BlLkFjY291bnRzU3RlcERhdGEucGF5cGFsX2VtYWlsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICRzY29wZS52ZXJpZmllZCA9IHRydWU7XG4gICAgICAgICAgICAgICRzY29wZS53YWl0b25lbWludXRlID0gZmFsc2U7XG4gICAgICAgICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZUFkbWluVXNlcigkc2NvcGUuQWNjb3VudHNTdGVwRGF0YSk7XG4gICAgICAgICAgICAgICRzdGF0ZS5nbygnY2hhbm5lbHN0ZXAxJyk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKCkge30pO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHNjb3BlLmVycm9ydmVyaWZpY2F0aW9uID0gdHJ1ZTtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgICRzY29wZS51cGRhdGVMT0dPSU1BR0UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgICBpZiAoJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJvZmlsZVBpY3R1cmUgIT0gXCJcIikge1xuICAgICAgICAgIGlmICghKHR5cGVvZiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcm9maWxlUGljdHVyZSA9PT0gJ3VuZGVmaW5lZCcpKSB7XG4gICAgICAgICAgICBBY2NvdW50U2V0dGluZ1NlcnZpY2VzLnVwbG9hZEZpbGUoJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJvZmlsZVBpY3R1cmUpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgIGlmIChyZXMpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcm9maWxlUGljdHVyZSA9IHJlcy5kYXRhLkxvY2F0aW9uO1xuICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICB9XG4gIH1cbn0pXG4iXSwiZmlsZSI6ImNvbW1vbi9kaXJlY3RpdmVzL3NldHRpbmdzL2FkbWluU2V0dGluZ3MuanMifQ==
