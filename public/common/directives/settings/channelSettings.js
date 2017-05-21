app.directive('channelsettings', function($http) {
  return {
    templateUrl: 'js/common/directives/settings/channelSettings.html',
    restrict: 'E',
    scope: false,
    controller: function channelSettingsController($rootScope, $state, $scope, $http, $window, AccountSettingServices, SessionService) {
      var commentIndex = 0;
      $scope.saveRepostSettings = function(type) {
        if (type == 'paid') {
          AccountSettingServices.updateAdminProfile({
              repostSettings: $scope.user.repostSettings
            })
            .then(function(res) {
              $scope.processing = false;
            })
            .catch(function() {});
        } else {
          $http.put('/api/database/updateRepostSettings', {
            repostSettings: $scope.AccountsStepData.repostSettings,
            id: $scope.AccountsStepData.submissionData.userID
          }).then(function(res) {
            SessionService.createAdminUser($scope.AccountsStepData);
          });
        }
      }

      if (window.location.href.indexOf('admin/channel/step1#submissionUrl') != -1) {
        $('.nav-tabs a[href="#submissionUrl"]').tab('show');
      } else if (window.location.href.indexOf('admin/channel/step1#setPrice') != -1) {
        $('.nav-tabs a[href="#setPrice"]').tab('show');
      } else if (window.location.href.indexOf('admin/channel/step1#customSubmission') != -1) {
        $('.nav-tabs a[href="#customSubmission"]').tab('show');
      } else if (window.location.href.indexOf('admin/channel/step1#customPremiereSubmission') != -1) {
        $('.nav-tabs a[href="#customPremiereSubmission"]').tab('show');
      } else if (window.location.href.indexOf('admin/channel/step1#repostPreferences') != -1) {
        $('.nav-tabs a[href="#repostPreferences"]').tab('show');
      } else if (window.location.href.indexOf('admin/channel/step1#manageReposts') != -1) {
        $('.nav-tabs a[href="#manageReposts"]').tab('show');
      }

      $scope.finish = function() {
        $http.get('/api/users/byID/' + $scope.AccountsStepData.submissionData.userID).then(function(res) {
          $window.localStorage.setItem('prevATUser', JSON.stringify(res.data))
          window.location.href = window.location.origin + "/admin/accounts";
        }).then(null, console.log)
      }

      $scope.defaultsRep = function() {
        var oldId = $scope.AccountsStepData.postData._id;
        $scope.AccountsStepData.postData = JSON.parse(JSON.stringify($scope.defaultSubmitPage));
        $scope.AccountsStepData.postData.heading.text = "Submission for Repost";
        $scope.AccountsStepData.postData.logo.images = $scope.AccountsStepData.postData.background.images = $scope.AccountsStepData.submissionData.avatarURL;
        $scope.AccountsStepData.postData.type = "submit";
        $scope.AccountsStepData.postData._id = oldId;
      }

      $scope.defaultsPrem = function() {
        var oldId = $scope.AccountsStepData.premier._id;
        $scope.AccountsStepData.premier = JSON.parse(JSON.stringify($scope.defaultSubmitPage));
        $scope.AccountsStepData.premier.heading.text = "Submission for Premiere";
        $scope.AccountsStepData.premier.logo.images = $scope.AccountsStepData.premier.background.images = $scope.AccountsStepData.submissionData.avatarURL;
        $scope.AccountsStepData.premier.type = "premiere";
        $scope.AccountsStepData.premier._id = oldId;
      }

      $scope.undoRep = function() {
        console.log($scope.AccountsStepData.postData._id);
        if (!$scope.AccountsStepData.postData._id) {
          $scope.defaultsRep();
        } else {
          $http.get('/api/customSubmissions/getCustomSubmission/' + $scope.AccountsStepData.postData.userID + '/' + $scope.AccountsStepData.postData.type)
            .then(function(res) {
              console.log(res.data);
              $scope.AccountsStepData.postData = res.data;
            })
        }
      }

      $scope.undoPrem = function() {
        if (!$scope.AccountsStepData.premier._id) {
          $scope.defaultsPrem();
        } else {
          $http.get('/api/customSubmissions/getCustomSubmission/' + $scope.AccountsStepData.premier.userID + '/' + $scope.AccountsStepData.premier.type)
            .then(function(res) {
              $scope.AccountsStepData.premier = res.data;
            })
        }
      }

      $scope.matchRep = function() {
        var oldId = $scope.AccountsStepData.premier._id;
        var saveHeading = $scope.AccountsStepData.premier.heading.text;
        var saveSubheading = $scope.AccountsStepData.premier.subHeading.text;
        $scope.AccountsStepData.premier = $scope.AccountsStepData.postData;
        $scope.AccountsStepData.premier.heading.text = saveHeading;
        $scope.AccountsStepData.premier.subHeading.text = saveSubheading;
        $scope.AccountsStepData.premier._id = oldId;
        $scope.AccountsStepData.premier.type = "premiere";
      }

      $scope.enableTemplate = function(template, type) {
        if (type == 'submit') {
          var oldId = $scope.AccountsStepData.postData._id;
          var saveHeading = $scope.AccountsStepData.postData.heading.text;
          var saveSubheading = $scope.AccountsStepData.postData.subHeading.text;
          var saveBG = $scope.AccountsStepData.postData.background.images;
          var saveLogo = $scope.AccountsStepData.postData.logo.images;
          $scope.AccountsStepData.postData = JSON.parse(JSON.stringify(template));
          $scope.AccountsStepData.postData.logo.images = saveLogo;
          $scope.AccountsStepData.postData.background.images = saveBG;
          $scope.AccountsStepData.postData.heading.text = saveHeading;
          $scope.AccountsStepData.postData.subHeading.text = saveSubheading;
          $scope.AccountsStepData.postData.type = "submit";
          $scope.AccountsStepData.postData._id = oldId;
        } else {
          var oldId = $scope.AccountsStepData.premier._id;
          var saveHeading = $scope.AccountsStepData.premier.heading.text;
          var saveSubheading = $scope.AccountsStepData.premier.subHeading.text;
          var saveBG = $scope.AccountsStepData.premier.background.images;
          var saveLogo = $scope.AccountsStepData.premier.logo.images;
          $scope.AccountsStepData.premier = JSON.parse(JSON.stringify(template));
          $scope.AccountsStepData.premier.logo.images = saveLogo;
          $scope.AccountsStepData.premier.background.images = saveBG;
          $scope.AccountsStepData.premier.heading.text = saveHeading;
          $scope.AccountsStepData.premier.subHeading.text = saveSubheading;
          $scope.AccountsStepData.premier.type = "submit";
          $scope.AccountsStepData.premier._id = oldId;
        }
      }

      $scope.deleteTemplate = function(ind) {
        $scope.processing = true;
        $scope.user.templates.splice(ind, 1);
        $http.post('/api/users/saveTemplates', $scope.user.templates)
          .then(function(res) {
            $scope.user.templates = res.data;
            $scope.processing = false;
          }).then(null, alert);
      }

      $scope.saveTemplate = function() {
        $scope.processing = true;
        if (!$scope.user.templates) $scope.user.templates = [];
        $scope.user.templates.push($scope.AccountsStepData.postData);
        $http.post('/api/users/saveTemplates', $scope.user.templates)
          .then(function(res) {
            $scope.user.templates = res.data;
            $scope.processing = false;
            $.Zebra_Dialog('Template Saved');
          }).then(null, alert);
      }

      $scope.saveComments = function(value, type, index) {
        var comments = [];
        if (type == 'paid' && value) {
          comments = ($scope.user.repostSettings.paid.comments ? $scope.user.repostSettings.paid.comments : []);
          if (index == undefined)
            comments.push(value);
          else
            comments[index] = value;

          $scope.user.repostSettings.paid.comments = comments;
          $scope.saveRepostSettings('paid');
          $scope.paidComment = "";
        } else if (type == 'schedule' && value) {
          comments = ($scope.AccountsStepData.repostSettings.schedule.comments ? $scope.AccountsStepData.repostSettings.schedule.comments : []);
          if (index == undefined)
            comments.push(value);
          else
            comments[index] = value;

          $scope.AccountsStepData.repostSettings.schedule.comments = comments;
          $scope.saveRepostSettings('schedule');
          $scope.scheduleComment = "";
        } else if (type == 'trade' && value) {
          comments = ($scope.AccountsStepData.repostSettings.trade.comments ? $scope.AccountsStepData.repostSettings.trade.comments : []);
          if (index == undefined)
            comments.push(value);
          else
            comments[index] = value;
          $scope.AccountsStepData.repostSettings.trade.comments = comments;
          $scope.saveRepostSettings('trade');
          $scope.tradeComment = "";
        } else {
          $.Zebra_Dialog("Please enter comment");
          return;
        }
      }

      $scope.editComments = function(comment, type, index) {
        $scope.scheduleCommentIndex = index;
        if (type == 'paid') {
          $('#paidCommentModal').modal('show');
          $scope.paidComment = comment;
        }
        if (type == 'schedule') {
          $('#scheduleCommentModal').modal('show');
          $scope.scheduleComment = comment;
        } else if (type == 'trade') {
          $('#tradeCommentModal').modal('show');
          $scope.tradeComment = comment;
        }
      }

      $scope.saveUser = function() {
        $scope.processing = true;
        $http.put("/api/database/profile", {
          queue: $scope.AccountsStepData.queue,
          _id: $scope.AccountsStepData.submissionData.userID
        }).then(function(res) {
          $scope.processing = false;
        }).then(null, function(err) {
          $.Zebra_Dialog("Error: did not save");
          $scope.processing = false;
        });
      }

      /*Repost settings end*/
      $scope.finishAdmin = function() {
        $state.go("accounts");
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

      $scope.addGroup = function(val) {
        $scope.group = "";
        $("#group").val('');
        if ($scope.AccountsStepData.submissionData.groups == undefined) {
          $scope.AccountsStepData.submissionData.groups = [];
        }
        if ($scope.AccountsStepData.submissionData.groups != undefined && $scope.AccountsStepData.submissionData.groups.indexOf(val) == -1) {
          $scope.AccountsStepData.submissionData.groups.push(val);
        }
      }

      $scope.removeGroup = function(index) {
        if ($scope.AccountsStepData.submissionData.groups.length > 0) {
          $scope.AccountsStepData.submissionData.groups.splice(index, 1);
        }
      }

      $scope.isValidEmailAddress = function(emailAddress) {
        var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
        return pattern.test(emailAddress);
      };

      $scope.updateLOGOIMAGE = function(step) {
        $scope.processing = true;
        if ($scope.AccountsStepData.profilePicture != "" && step == 1) {
          if (!(typeof $scope.AccountsStepData.profilePicture === 'undefined')) {
            AccountSettingServices.uploadFile($scope.AccountsStepData.profilePicture).then(function(res) {
              if (res) {
                $scope.AccountsStepData.profilePicture = res.data.Location;
                $scope.processing = false;
              }
            });
          }
        } else if ($scope.AccountsStepData.postData != undefined && $scope.AccountsStepData.postData.logo.images != "" && step == 3) {
          if (!(typeof $scope.AccountsStepData.postData.logo.images === 'undefined')) {
            AccountSettingServices.uploadFile($scope.AccountsStepData.postData.logo.images).then(function(res) {
              if (res) {
                $scope.AccountsStepData.postData.logo.images = res.data.Location;
                $scope.processing = false;
              }
            });
          }
        } else if ($scope.AccountsStepData.premier != undefined && $scope.AccountsStepData.premier.logo.images != "" && step == 4) {
          if (!(typeof $scope.AccountsStepData.premier.logo.images === 'undefined')) {
            AccountSettingServices.uploadFile($scope.AccountsStepData.premier.logo.images).then(function(res) {
              if (res) {
                $scope.AccountsStepData.premier.logo.images = res.data.Location;
                $scope.processing = false;
              }
            });
          }
        } else {
          $scope.processing = false;
        }
      }

      $scope.updateBackgroundIMAGE = function(step) {
        $scope.processing = true;
        if ($scope.AccountsStepData.postData != undefined && $scope.AccountsStepData.postData.logo.images != "" && step == 3) {
          if (!(typeof $scope.AccountsStepData.postData.background.images === 'undefined')) {
            AccountSettingServices.uploadFile($scope.AccountsStepData.postData.background.images).then(function(res) {
              if (res) {
                $scope.AccountsStepData.postData.background.images = res.data.Location;
                $scope.processing = false;
              }
            });
          }
        } else if ($scope.AccountsStepData.premier != undefined && $scope.AccountsStepData.premier.background.images != "" && step == 4) {
          if (!(typeof $scope.AccountsStepData.premier.background.images === 'undefined')) {
            AccountSettingServices.uploadFile($scope.AccountsStepData.premier.background.images).then(function(res) {
              if (res) {
                $scope.AccountsStepData.premier.background.images = res.data.Location;
                $scope.processing = false;
              }
            });
          }
        } else {
          $scope.processing = false;
        }
      }

      $scope.soundcloudLogin = function() {
        if ($scope.AccountsStepData.submissionData == undefined) {
          $scope.AccountsStepData.submissionData = {};
        }
        $scope.processing = true;
        SC.connect().then(function(res) {
            $rootScope.accessToken = res.oauth_token;
            return $http.post('/api/login/soundCloudAuthentication', {
              token: res.oauth_token,
              password: 'test'
            });
          })
          .then(function(res) {
            var scInfo = {};
            scInfo.userID = res.data.user._id;
            $scope.paidRepostId = res.data.user._id;
            $scope.defaultSubmitPage.userID = scInfo.userID;
            $scope.AccountsStepData.postData = JSON.parse(JSON.stringify($scope.defaultSubmitPage));
            $scope.AccountsStepData.premier = JSON.parse(JSON.stringify($scope.defaultSubmitPage));
            $scope.AccountsStepData.postData.type = "submit";
            $scope.AccountsStepData.premier.type = "premiere";
            $scope.AccountsStepData.premier.heading.test = "Submission for Premiere";
            console.log($scope.AccountsStepData.postData)
            console.log($scope.AccountsStepData.premier);
            $scope.AccountsStepData.postData.logo.images = $scope.AccountsStepData.postData.background.images = $scope.AccountsStepData.premier.logo.images = $scope.AccountsStepData.premier.background.images = res.data.user.soundcloud.avatarURL;
            $scope.AccountsStepData.pseudoAvailableSlots = createPseudoAvailableSlots(res.data.user);
            $scope.AccountsStepData.astzOffset = res.data.user.astzOffset;
            $scope.AccountsStepData.repostSettings = res.data.user.repostSettings;
            console.log(res.data.user);
            AccountSettingServices.checkUsercount({
                "userID": scInfo.userID,
                'action': "id"
              })
              .then(function(result) {
                if (!result.data) {
                  scInfo.groups = [];
                  scInfo.description = "";
                  scInfo.price = 1;
                  $scope.AccountsStepData.submissionData = res.data.user.soundcloud;
                  $scope.AccountsStepData.submissionData.userID = res.data.user._id;
                  var username = res.data.user.soundcloud.permalinkURL.substring(res.data.user.soundcloud.permalinkURL.indexOf('.com/') + 5)
                  var url = window.location.origin + '/' + username + '/submit';
                  var premierurl = window.location.origin + '/' + username + '/premiere';
                  AccountSettingServices.checkUsercount({
                      "url": url,
                      'action': "url"
                    })
                    .then(function(result) {
                      if (result.data) {
                        url = window.location.origin + '/' + username + result.data + '/submit';
                        premierurl = window.location.origin + '/' + username + result.data + '/premiere';
                        $scope.AccountsStepData.submissionData.submissionUrl = url;
                        $scope.AccountsStepData.submissionData.premierUrl = premierurl;
                      } else {
                        $scope.AccountsStepData.submissionData.submissionUrl = url;
                        $scope.AccountsStepData.submissionData.premierUrl = premierurl;
                      }
                      scInfo.submissionUrl = url;
                      scInfo.premierUrl = premierurl;
                      $http.post('/api/database/updateUserAccount', {
                        soundcloudInfo: scInfo,
                      }).then(function(user) {
                        user.data.paidRepost.reverse();
                      });
                      $http.post('/api/database/profile/edit', {
                        userID: scInfo.userID,
                        admin: true
                      }).then(function(user) {

                      });
                      SessionService.createAdminUser($scope.AccountsStepData);
                      $scope.processing = false;
                      $scope.nextStep(2, $scope.AccountsStepData, 'channel')
                    }).then(null, function() {
                      console.log(err);
                      $.Zebra_Dialog("Error logging in")
                    })
                } else {
                  $.Zebra_Dialog('Error: This user already exists');
                  $scope.processing = false;
                  location.reload();
                }
              }).then(null, function() {
                console.log(err);
                $.Zebra_Dialog("Error logging in")
              })
          })
          .then(null, function(err) {
            console.log(err);
            $.Zebra_Dialog('Error: Could not log in');
            $scope.processing = false;
          });
      };

      $scope.isPaidRepost = function() {
        if ($scope.AccountsStepData.formActions == 'Edit') {
          $scope.activeTab = ['submissionUrl', 'setPrice', 'customSubmission', 'customPremiereSubmission', 'repostPreferences', 'manageReposts'];
        } else {
          $scope.activeTab = ['submissionUrl'];
        }
      }

      $scope.isPaidRepost();

      $scope.nextStep = function(step, currentData, type) {
        if (type == "channel") {
          switch (step) {
            case 1:
              $http.get("/connect/logout?return_to=https://soundcloud.com/connect?client_id=8002f0f8326d869668523d8e45a53b90&display=popup&redirect_uri=https://" + window.location.host + "/callback.html&response_type=code_and_token&scope=non-expiring&state=SoundCloud_Dialog_5fead");
              break;
            case 2:
              if (!$scope.AccountsStepData.price) $scope.AccountsStepData.price = Math.max(Math.floor($scope.AccountsStepData.submissionData.followers / 3000), 7);
              SessionService.createAdminUser($scope.AccountsStepData);
              $scope.activeTab.push('setPrice');
              $('.nav-tabs a[href="#setPrice"]').tab('show');
              break;
            case 3:
              var next = true;
              if ($scope.AccountsStepData.price < 6 || $scope.AccountsStepData.price == undefined) {
                next = false;
                $scope.AccountsStepData.price = 6;
                $.Zebra_Dialog('Please enter a price (minimum $6).');
                return;
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
                    $scope.activeTab.push('customSubmission');
                    $('.nav-tabs a[href="#customSubmission"]').tab('show');
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
                  type: 'submit',
                  background: $scope.AccountsStepData.postData.background,
                  logo: $scope.AccountsStepData.postData.logo,
                  heading: $scope.AccountsStepData.postData.heading,
                  subHeading: $scope.AccountsStepData.postData.subHeading,
                  inputFields: $scope.AccountsStepData.postData.inputFields,
                  button: $scope.AccountsStepData.postData.button,
                  layout: $scope.AccountsStepData.postData.layout
                })
                .then(function(res) {
                  $scope.activeTab.push('customPremiereSubmission');
                  $('.nav-tabs a[href="#customPremiereSubmission"]').tab('show');
                  SessionService.createAdminUser($scope.AccountsStepData);
                })
                .catch(function() {});
              break;
            case 5:
              AccountSettingServices.addCustomize({
                  userID: $scope.AccountsStepData.submissionData.userID,
                  type: 'premiere',
                  background: $scope.AccountsStepData.premier.background,
                  logo: $scope.AccountsStepData.premier.logo,
                  heading: $scope.AccountsStepData.premier.heading,
                  subHeading: $scope.AccountsStepData.premier.subHeading,
                  inputFields: $scope.AccountsStepData.premier.inputFields,
                  button: $scope.AccountsStepData.premier.button,
                  layout: $scope.AccountsStepData.premier.layout
                })
                .then(function(res) {
                  $scope.finish();
                  // if ($scope.AccountsStepData.pseudoAvailableSlots == undefined) $scope.AccountsStepData.pseudoAvailableSlots = defaultAvailableSlots;
                  // if (!$scope.AccountsStepData.astzOffset) $scope.AccountsStepData.astzOffset = -300;
                  // SessionService.createAdminUser($scope.AccountsStepData);
                  // $scope.activeTab.push('repostPreferences');
                  // $('.nav-tabs a[href="#repostPreferences"]').tab('show');
                })
                .then(null, alert);
              break;
            case 6:
              //update from pseudo
              $scope.AccountsStepData.availableSlots = createAvailableSlots($scope.AccountsStepData, $scope.AccountsStepData.pseudoAvailableSlots)
              AccountSettingServices.updateUserAvailableSlot({
                  _id: $scope.AccountsStepData.submissionData.userID,
                  availableSlots: $scope.AccountsStepData.availableSlots
                })
                .then(function(res) {
                  $scope.processing = false;
                  $scope.AccountsStepData.queue = res.data.queue;
                  $scope.loadQueueSongs();
                  $scope.activeTab.push('manageReposts');
                  $('.nav-tabs a[href="#manageReposts"]').tab('show');
                })
                .catch(function() {});
              break;
            case 7:
              SessionService.removeAccountusers($scope.AccountsStepData);
              // $state.go("accounts");
              break;
          }
        }
      }

      $scope.openModal = function(type) {
        if (type === 'paid') {
          $('#paidCommentModal').modal('show');
        }
      }

      $scope.setSlotStyle = function(day, hour) {
        var style = {};
        if ($scope.AccountsStepData.pseudoAvailableSlots != undefined) {
          if ($scope.AccountsStepData.pseudoAvailableSlots[daysArray[day]] != undefined && $scope.AccountsStepData.pseudoAvailableSlots[daysArray[day]].indexOf(hour) > -1) {
            style = {
              'background-color': "#fff",
              'border-color': "#999"
            };
          }
        }
        return style;
      }

      $scope.tooManyReposts = function(day, hour) {
        var startDayInt = (day + 6) % 7;
        var allSlots = []
        var wouldBeSlots = JSON.parse(JSON.stringify($scope.AccountsStepData.pseudoAvailableSlots));
        wouldBeSlots[daysArray[day]].push(hour);
        for (var i = 0; i < 3; i++) {
          wouldBeSlots[daysArray[(startDayInt + i) % 7]]
            .forEach(function(slot) {
              allSlots.push(slot + i * 24);
            })
        }
        allSlots = allSlots.sort(function(a, b) {
          return a - b;
        })
        var checkingSlots = [];
        var status = false;
        allSlots.forEach(function(slot) {
          var i = 0;
          while (i < checkingSlots.length) {
            if (Math.abs(checkingSlots[i] - slot) > 24) checkingSlots.splice(i, 1);
            else i++;
          }
          checkingSlots.push(slot);
          if (checkingSlots.length > 10) {
            status = true;
          }
        })
        return status;
      }

      $scope.clickedSlotsave = function(day, hour) {
        var pushhour = parseInt(hour);
        if ($scope.AccountsStepData.pseudoAvailableSlots != undefined && $scope.AccountsStepData.pseudoAvailableSlots[daysArray[day]].indexOf(pushhour) > -1) {
          $scope.AccountsStepData.pseudoAvailableSlots[daysArray[day]].splice($scope.AccountsStepData.pseudoAvailableSlots[daysArray[day]].indexOf(pushhour), 1);
        } else if ($scope.tooManyReposts(day, hour)) {
          $.Zebra_Dialog("Cannot enable slot. We only allow 10 reposts within 24 hours to prevent you from being repost blocked.");
          return;
        } else if ($scope.AccountsStepData.pseudoAvailableSlots != undefined) {
          $scope.AccountsStepData.pseudoAvailableSlots[daysArray[day]].push(pushhour);
        }
      }

      $scope.updateCustomLogoImage = function() {
        $scope.processing = true;
        if ($scope.AccountsStepData.postData != undefined && $scope.AccountsStepData.postData.logo.images != "") {
          if (!(typeof $scope.AccountsStepData.postData.logo.images === 'undefined')) {
            AccountSettingServices.uploadFile($scope.AccountsStepData.postData.logo.images).then(function(res) {
              if (res) {
                $scope.AccountsStepData.postData.logo.images = res.data.Location;
                $scope.processing = false;
              }
            });
          }
        } else {
          $scope.processing = false;
        }
      }

      $scope.updatePremierLogoImage = function() {
        $scope.processing = true;
        if ($scope.AccountsStepData.premier != undefined && $scope.AccountsStepData.premier.logo.images != "") {
          if (!(typeof $scope.AccountsStepData.premier.logo.images === 'undefined')) {
            AccountSettingServices.uploadFile($scope.AccountsStepData.premier.logo.images).then(function(res) {
              if (res) {
                $scope.AccountsStepData.premier.logo.images = res.data.Location;
                $scope.processing = false;
              }
            });
          }
        } else {
          $scope.processing = false;
        }
      }

      $scope.uploadCustomBackground = function() {
          $scope.processing = true;
          if ($scope.AccountsStepData.postData != undefined && $scope.AccountsStepData.postData.background.images != "") {
            if (!(typeof $scope.AccountsStepData.postData.background.images === 'undefined')) {
              AccountSettingServices.uploadFile($scope.AccountsStepData.postData.background.images).then(function(res) {
                if (res) {
                  $scope.AccountsStepData.postData.background.images = res.data.Location;
                  $scope.processing = false;
                }
              });
            }
          } else {
            $scope.processing = false;
          }
        }
        // $scope.fontFam = "'Aref Ruqaa', cursive";
      $scope.uploadPremierBackground = function() {
        $scope.processing = true;
        if ($scope.AccountsStepData.premier != undefined && $scope.AccountsStepData.premier.background.images != "") {
          if (!(typeof $scope.AccountsStepData.premier.background.images === 'undefined')) {
            AccountSettingServices.uploadFile($scope.AccountsStepData.premier.background.images).then(function(res) {
              if (res) {
                $scope.AccountsStepData.premier.background.images = res.data.Location;
                $scope.processing = false;
              }
            });
          }
        } else {
          $scope.processing = false;
        }
      }

      $scope.changeFont = function(fnt, title) {
        $scope[fnt] = title;
      }

      $scope.fontFamilies = [{
        title: "Aref Ruqaa",
        css: "'Aref Ruqaa', serif"
      }, {
        title: "Open Sans",
        css: "'Open Sans', sans-serif"
      }, {
        title: "Space Mono",
        css: "'Space Mono', monospace"
      }, {
        title: "Roboto Slab",
        css: "'Roboto Slab', serif"
      }, {
        title: "Merriweather",
        css: "'Merriweather', serif"
      }, {
        title: "Molle",
        css: "'Molle', cursive"
      }, {
        title: "Playfair Display",
        css: "'Playfair Display', serif"
      }, {
        title: "Indie Flower",
        css: "'Indie Flower', cursive"
      }, {
        title: "Nova Script",
        css: "'Nova Script', cursive"
      }, {
        title: "Inconsolata",
        css: "'Inconsolata', monospace"
      }, {
        title: "Lobster",
        css: "'Lobster', cursive"
      }, {
        title: "Arvo",
        css: "'Arvo', serif"
      }, {
        title: "Yanone Kaffeesatz",
        css: "'Yanone Kaffeesatz', sans-serif"
      }, {
        title: "Abel",
        css: "'Abel', sans-serif"
      }, {
        title: "Gloria Hallelujah",
        css: "'Gloria Hallelujah', cursive"
      }, {
        title: "Pacifico",
        css: "'Pacifico', cursive"
      }, {
        title: "Bungee",
        css: "'Bungee', cursive"
      }, {
        title: "Exo",
        css: "'Exo', sans-serif"
      }, {
        title: "Shadows Into Light",
        css: "'Shadows Into Light', cursive"
      }, {
        title: "Dancing Script",
        css: "'Dancing Script', cursive"
      }, {
        title: "Play",
        css: "'Play', sans-serif"
      }, {
        title: "Amatic SC",
        css: "'Amatic SC', cursive"
      }, {
        title: "Poiret One",
        css: "'Poiret One', cursive"
      }, {
        title: "Orbitron",
        css: "'Orbitron', sans-serif"
      }, {
        title: "Sahitya",
        css: "'Sahitya', serif"
      }, {
        title: "Architects Daughter",
        css: "'Architects Daughter', cursive"
      }, {
        title: "Acme",
        css: "'Acme', sans-serif"
      }, {
        title: "Cinzel",
        css: "'Cinzel', serif"
      }, {
        title: "Josefin Slab",
        css: "'Josefin Slab', serif"
      }, {
        title: "Lobster Two",
        css: "'Lobster Two', cursive"
      }, {
        title: "Permanent Marker",
        css: "'Permanent Marker', cursive"
      }, {
        title: "Chewy",
        css: "'Chewy', cursive"
      }, {
        title: "Special Elite",
        css: "'Special Elite', cursive"
      }, {
        title: "Calligraffitti",
        css: "'Calligraffitti', cursive"
      }, {
        title: "Ceviche One",
        css: "'Ceviche One', cursive"
      }, {
        title: "Press Start 2P",
        css: "'Press Start 2P', cursive"
      }, {
        title: "Cinzel Decorative",
        css: "'Cinzel Decorative', cursive"
      }]
    }
  }
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24vZGlyZWN0aXZlcy9zZXR0aW5ncy9jaGFubmVsU2V0dGluZ3MuanMiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwLmRpcmVjdGl2ZSgnY2hhbm5lbHNldHRpbmdzJywgZnVuY3Rpb24oJGh0dHApIHtcclxuICByZXR1cm4ge1xyXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9zZXR0aW5ncy9jaGFubmVsU2V0dGluZ3MuaHRtbCcsXHJcbiAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgc2NvcGU6IGZhbHNlLFxyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24gY2hhbm5lbFNldHRpbmdzQ29udHJvbGxlcigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsICR3aW5kb3csIEFjY291bnRTZXR0aW5nU2VydmljZXMsIFNlc3Npb25TZXJ2aWNlKSB7XHJcbiAgICAgIHZhciBjb21tZW50SW5kZXggPSAwO1xyXG4gICAgICAkc2NvcGUuc2F2ZVJlcG9zdFNldHRpbmdzID0gZnVuY3Rpb24odHlwZSkge1xyXG4gICAgICAgIGlmICh0eXBlID09ICdwYWlkJykge1xyXG4gICAgICAgICAgQWNjb3VudFNldHRpbmdTZXJ2aWNlcy51cGRhdGVBZG1pblByb2ZpbGUoe1xyXG4gICAgICAgICAgICAgIHJlcG9zdFNldHRpbmdzOiAkc2NvcGUudXNlci5yZXBvc3RTZXR0aW5nc1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oKSB7fSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICRodHRwLnB1dCgnL2FwaS9kYXRhYmFzZS91cGRhdGVSZXBvc3RTZXR0aW5ncycsIHtcclxuICAgICAgICAgICAgcmVwb3N0U2V0dGluZ3M6ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnJlcG9zdFNldHRpbmdzLFxyXG4gICAgICAgICAgICBpZDogJHNjb3BlLkFjY291bnRzU3RlcERhdGEuc3VibWlzc2lvbkRhdGEudXNlcklEXHJcbiAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGVBZG1pblVzZXIoJHNjb3BlLkFjY291bnRzU3RlcERhdGEpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignYWRtaW4vY2hhbm5lbC9zdGVwMSNzdWJtaXNzaW9uVXJsJykgIT0gLTEpIHtcclxuICAgICAgICAkKCcubmF2LXRhYnMgYVtocmVmPVwiI3N1Ym1pc3Npb25VcmxcIl0nKS50YWIoJ3Nob3cnKTtcclxuICAgICAgfSBlbHNlIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdhZG1pbi9jaGFubmVsL3N0ZXAxI3NldFByaWNlJykgIT0gLTEpIHtcclxuICAgICAgICAkKCcubmF2LXRhYnMgYVtocmVmPVwiI3NldFByaWNlXCJdJykudGFiKCdzaG93Jyk7XHJcbiAgICAgIH0gZWxzZSBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignYWRtaW4vY2hhbm5lbC9zdGVwMSNjdXN0b21TdWJtaXNzaW9uJykgIT0gLTEpIHtcclxuICAgICAgICAkKCcubmF2LXRhYnMgYVtocmVmPVwiI2N1c3RvbVN1Ym1pc3Npb25cIl0nKS50YWIoJ3Nob3cnKTtcclxuICAgICAgfSBlbHNlIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdhZG1pbi9jaGFubmVsL3N0ZXAxI2N1c3RvbVByZW1pZXJlU3VibWlzc2lvbicpICE9IC0xKSB7XHJcbiAgICAgICAgJCgnLm5hdi10YWJzIGFbaHJlZj1cIiNjdXN0b21QcmVtaWVyZVN1Ym1pc3Npb25cIl0nKS50YWIoJ3Nob3cnKTtcclxuICAgICAgfSBlbHNlIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdhZG1pbi9jaGFubmVsL3N0ZXAxI3JlcG9zdFByZWZlcmVuY2VzJykgIT0gLTEpIHtcclxuICAgICAgICAkKCcubmF2LXRhYnMgYVtocmVmPVwiI3JlcG9zdFByZWZlcmVuY2VzXCJdJykudGFiKCdzaG93Jyk7XHJcbiAgICAgIH0gZWxzZSBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignYWRtaW4vY2hhbm5lbC9zdGVwMSNtYW5hZ2VSZXBvc3RzJykgIT0gLTEpIHtcclxuICAgICAgICAkKCcubmF2LXRhYnMgYVtocmVmPVwiI21hbmFnZVJlcG9zdHNcIl0nKS50YWIoJ3Nob3cnKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmZpbmlzaCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRodHRwLmdldCgnL2FwaS91c2Vycy9ieUlELycgKyAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5zdWJtaXNzaW9uRGF0YS51c2VySUQpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdwcmV2QVRVc2VyJywgSlNPTi5zdHJpbmdpZnkocmVzLmRhdGEpKVxyXG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgXCIvYWRtaW4vYWNjb3VudHNcIjtcclxuICAgICAgICB9KS50aGVuKG51bGwsIGNvbnNvbGUubG9nKVxyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuZGVmYXVsdHNSZXAgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgb2xkSWQgPSAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS5faWQ7XHJcbiAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucG9zdERhdGEgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KCRzY29wZS5kZWZhdWx0U3VibWl0UGFnZSkpO1xyXG4gICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBvc3REYXRhLmhlYWRpbmcudGV4dCA9IFwiU3VibWlzc2lvbiBmb3IgUmVwb3N0XCI7XHJcbiAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucG9zdERhdGEubG9nby5pbWFnZXMgPSAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS5iYWNrZ3JvdW5kLmltYWdlcyA9ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnN1Ym1pc3Npb25EYXRhLmF2YXRhclVSTDtcclxuICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS50eXBlID0gXCJzdWJtaXRcIjtcclxuICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS5faWQgPSBvbGRJZDtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmRlZmF1bHRzUHJlbSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBvbGRJZCA9ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIuX2lkO1xyXG4gICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KCRzY29wZS5kZWZhdWx0U3VibWl0UGFnZSkpO1xyXG4gICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIuaGVhZGluZy50ZXh0ID0gXCJTdWJtaXNzaW9uIGZvciBQcmVtaWVyZVwiO1xyXG4gICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIubG9nby5pbWFnZXMgPSAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyLmJhY2tncm91bmQuaW1hZ2VzID0gJHNjb3BlLkFjY291bnRzU3RlcERhdGEuc3VibWlzc2lvbkRhdGEuYXZhdGFyVVJMO1xyXG4gICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIudHlwZSA9IFwicHJlbWllcmVcIjtcclxuICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyLl9pZCA9IG9sZElkO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUudW5kb1JlcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBvc3REYXRhLl9pZCk7XHJcbiAgICAgICAgaWYgKCEkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS5faWQpIHtcclxuICAgICAgICAgICRzY29wZS5kZWZhdWx0c1JlcCgpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAkaHR0cC5nZXQoJy9hcGkvY3VzdG9tU3VibWlzc2lvbnMvZ2V0Q3VzdG9tU3VibWlzc2lvbi8nICsgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucG9zdERhdGEudXNlcklEICsgJy8nICsgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucG9zdERhdGEudHlwZSlcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5sb2cocmVzLmRhdGEpO1xyXG4gICAgICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBvc3REYXRhID0gcmVzLmRhdGE7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUudW5kb1ByZW0gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoISRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIuX2lkKSB7XHJcbiAgICAgICAgICAkc2NvcGUuZGVmYXVsdHNQcmVtKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICRodHRwLmdldCgnL2FwaS9jdXN0b21TdWJtaXNzaW9ucy9nZXRDdXN0b21TdWJtaXNzaW9uLycgKyAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyLnVzZXJJRCArICcvJyArICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIudHlwZSlcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJlbWllciA9IHJlcy5kYXRhO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLm1hdGNoUmVwID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG9sZElkID0gJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJlbWllci5faWQ7XHJcbiAgICAgICAgdmFyIHNhdmVIZWFkaW5nID0gJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJlbWllci5oZWFkaW5nLnRleHQ7XHJcbiAgICAgICAgdmFyIHNhdmVTdWJoZWFkaW5nID0gJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJlbWllci5zdWJIZWFkaW5nLnRleHQ7XHJcbiAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJlbWllciA9ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBvc3REYXRhO1xyXG4gICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIuaGVhZGluZy50ZXh0ID0gc2F2ZUhlYWRpbmc7XHJcbiAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJlbWllci5zdWJIZWFkaW5nLnRleHQgPSBzYXZlU3ViaGVhZGluZztcclxuICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyLl9pZCA9IG9sZElkO1xyXG4gICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIudHlwZSA9IFwicHJlbWllcmVcIjtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmVuYWJsZVRlbXBsYXRlID0gZnVuY3Rpb24odGVtcGxhdGUsIHR5cGUpIHtcclxuICAgICAgICBpZiAodHlwZSA9PSAnc3VibWl0Jykge1xyXG4gICAgICAgICAgdmFyIG9sZElkID0gJHNjb3BlLkFjY291bnRzU3RlcERhdGEucG9zdERhdGEuX2lkO1xyXG4gICAgICAgICAgdmFyIHNhdmVIZWFkaW5nID0gJHNjb3BlLkFjY291bnRzU3RlcERhdGEucG9zdERhdGEuaGVhZGluZy50ZXh0O1xyXG4gICAgICAgICAgdmFyIHNhdmVTdWJoZWFkaW5nID0gJHNjb3BlLkFjY291bnRzU3RlcERhdGEucG9zdERhdGEuc3ViSGVhZGluZy50ZXh0O1xyXG4gICAgICAgICAgdmFyIHNhdmVCRyA9ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBvc3REYXRhLmJhY2tncm91bmQuaW1hZ2VzO1xyXG4gICAgICAgICAgdmFyIHNhdmVMb2dvID0gJHNjb3BlLkFjY291bnRzU3RlcERhdGEucG9zdERhdGEubG9nby5pbWFnZXM7XHJcbiAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkodGVtcGxhdGUpKTtcclxuICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBvc3REYXRhLmxvZ28uaW1hZ2VzID0gc2F2ZUxvZ287XHJcbiAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS5iYWNrZ3JvdW5kLmltYWdlcyA9IHNhdmVCRztcclxuICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBvc3REYXRhLmhlYWRpbmcudGV4dCA9IHNhdmVIZWFkaW5nO1xyXG4gICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucG9zdERhdGEuc3ViSGVhZGluZy50ZXh0ID0gc2F2ZVN1YmhlYWRpbmc7XHJcbiAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS50eXBlID0gXCJzdWJtaXRcIjtcclxuICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBvc3REYXRhLl9pZCA9IG9sZElkO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB2YXIgb2xkSWQgPSAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyLl9pZDtcclxuICAgICAgICAgIHZhciBzYXZlSGVhZGluZyA9ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIuaGVhZGluZy50ZXh0O1xyXG4gICAgICAgICAgdmFyIHNhdmVTdWJoZWFkaW5nID0gJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJlbWllci5zdWJIZWFkaW5nLnRleHQ7XHJcbiAgICAgICAgICB2YXIgc2F2ZUJHID0gJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJlbWllci5iYWNrZ3JvdW5kLmltYWdlcztcclxuICAgICAgICAgIHZhciBzYXZlTG9nbyA9ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIubG9nby5pbWFnZXM7XHJcbiAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeSh0ZW1wbGF0ZSkpO1xyXG4gICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJlbWllci5sb2dvLmltYWdlcyA9IHNhdmVMb2dvO1xyXG4gICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJlbWllci5iYWNrZ3JvdW5kLmltYWdlcyA9IHNhdmVCRztcclxuICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIuaGVhZGluZy50ZXh0ID0gc2F2ZUhlYWRpbmc7XHJcbiAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyLnN1YkhlYWRpbmcudGV4dCA9IHNhdmVTdWJoZWFkaW5nO1xyXG4gICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJlbWllci50eXBlID0gXCJzdWJtaXRcIjtcclxuICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIuX2lkID0gb2xkSWQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuZGVsZXRlVGVtcGxhdGUgPSBmdW5jdGlvbihpbmQpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgJHNjb3BlLnVzZXIudGVtcGxhdGVzLnNwbGljZShpbmQsIDEpO1xyXG4gICAgICAgICRodHRwLnBvc3QoJy9hcGkvdXNlcnMvc2F2ZVRlbXBsYXRlcycsICRzY29wZS51c2VyLnRlbXBsYXRlcylcclxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAkc2NvcGUudXNlci50ZW1wbGF0ZXMgPSByZXMuZGF0YTtcclxuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIH0pLnRoZW4obnVsbCwgYWxlcnQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuc2F2ZVRlbXBsYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAgIGlmICghJHNjb3BlLnVzZXIudGVtcGxhdGVzKSAkc2NvcGUudXNlci50ZW1wbGF0ZXMgPSBbXTtcclxuICAgICAgICAkc2NvcGUudXNlci50ZW1wbGF0ZXMucHVzaCgkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YSk7XHJcbiAgICAgICAgJGh0dHAucG9zdCgnL2FwaS91c2Vycy9zYXZlVGVtcGxhdGVzJywgJHNjb3BlLnVzZXIudGVtcGxhdGVzKVxyXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICRzY29wZS51c2VyLnRlbXBsYXRlcyA9IHJlcy5kYXRhO1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkLlplYnJhX0RpYWxvZygnVGVtcGxhdGUgU2F2ZWQnKTtcclxuICAgICAgICAgIH0pLnRoZW4obnVsbCwgYWxlcnQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuc2F2ZUNvbW1lbnRzID0gZnVuY3Rpb24odmFsdWUsIHR5cGUsIGluZGV4KSB7XHJcbiAgICAgICAgdmFyIGNvbW1lbnRzID0gW107XHJcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3BhaWQnICYmIHZhbHVlKSB7XHJcbiAgICAgICAgICBjb21tZW50cyA9ICgkc2NvcGUudXNlci5yZXBvc3RTZXR0aW5ncy5wYWlkLmNvbW1lbnRzID8gJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3MucGFpZC5jb21tZW50cyA6IFtdKTtcclxuICAgICAgICAgIGlmIChpbmRleCA9PSB1bmRlZmluZWQpXHJcbiAgICAgICAgICAgIGNvbW1lbnRzLnB1c2godmFsdWUpO1xyXG4gICAgICAgICAgZWxzZVxyXG4gICAgICAgICAgICBjb21tZW50c1tpbmRleF0gPSB2YWx1ZTtcclxuXHJcbiAgICAgICAgICAkc2NvcGUudXNlci5yZXBvc3RTZXR0aW5ncy5wYWlkLmNvbW1lbnRzID0gY29tbWVudHM7XHJcbiAgICAgICAgICAkc2NvcGUuc2F2ZVJlcG9zdFNldHRpbmdzKCdwYWlkJyk7XHJcbiAgICAgICAgICAkc2NvcGUucGFpZENvbW1lbnQgPSBcIlwiO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSAnc2NoZWR1bGUnICYmIHZhbHVlKSB7XHJcbiAgICAgICAgICBjb21tZW50cyA9ICgkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5yZXBvc3RTZXR0aW5ncy5zY2hlZHVsZS5jb21tZW50cyA/ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnJlcG9zdFNldHRpbmdzLnNjaGVkdWxlLmNvbW1lbnRzIDogW10pO1xyXG4gICAgICAgICAgaWYgKGluZGV4ID09IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgY29tbWVudHMucHVzaCh2YWx1ZSk7XHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGNvbW1lbnRzW2luZGV4XSA9IHZhbHVlO1xyXG5cclxuICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnJlcG9zdFNldHRpbmdzLnNjaGVkdWxlLmNvbW1lbnRzID0gY29tbWVudHM7XHJcbiAgICAgICAgICAkc2NvcGUuc2F2ZVJlcG9zdFNldHRpbmdzKCdzY2hlZHVsZScpO1xyXG4gICAgICAgICAgJHNjb3BlLnNjaGVkdWxlQ29tbWVudCA9IFwiXCI7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09ICd0cmFkZScgJiYgdmFsdWUpIHtcclxuICAgICAgICAgIGNvbW1lbnRzID0gKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnJlcG9zdFNldHRpbmdzLnRyYWRlLmNvbW1lbnRzID8gJHNjb3BlLkFjY291bnRzU3RlcERhdGEucmVwb3N0U2V0dGluZ3MudHJhZGUuY29tbWVudHMgOiBbXSk7XHJcbiAgICAgICAgICBpZiAoaW5kZXggPT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICBjb21tZW50cy5wdXNoKHZhbHVlKTtcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgY29tbWVudHNbaW5kZXhdID0gdmFsdWU7XHJcbiAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5yZXBvc3RTZXR0aW5ncy50cmFkZS5jb21tZW50cyA9IGNvbW1lbnRzO1xyXG4gICAgICAgICAgJHNjb3BlLnNhdmVSZXBvc3RTZXR0aW5ncygndHJhZGUnKTtcclxuICAgICAgICAgICRzY29wZS50cmFkZUNvbW1lbnQgPSBcIlwiO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIlBsZWFzZSBlbnRlciBjb21tZW50XCIpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmVkaXRDb21tZW50cyA9IGZ1bmN0aW9uKGNvbW1lbnQsIHR5cGUsIGluZGV4KSB7XHJcbiAgICAgICAgJHNjb3BlLnNjaGVkdWxlQ29tbWVudEluZGV4ID0gaW5kZXg7XHJcbiAgICAgICAgaWYgKHR5cGUgPT0gJ3BhaWQnKSB7XHJcbiAgICAgICAgICAkKCcjcGFpZENvbW1lbnRNb2RhbCcpLm1vZGFsKCdzaG93Jyk7XHJcbiAgICAgICAgICAkc2NvcGUucGFpZENvbW1lbnQgPSBjb21tZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodHlwZSA9PSAnc2NoZWR1bGUnKSB7XHJcbiAgICAgICAgICAkKCcjc2NoZWR1bGVDb21tZW50TW9kYWwnKS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgICAgJHNjb3BlLnNjaGVkdWxlQ29tbWVudCA9IGNvbW1lbnQ7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09ICd0cmFkZScpIHtcclxuICAgICAgICAgICQoJyN0cmFkZUNvbW1lbnRNb2RhbCcpLm1vZGFsKCdzaG93Jyk7XHJcbiAgICAgICAgICAkc2NvcGUudHJhZGVDb21tZW50ID0gY29tbWVudDtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5zYXZlVXNlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgICAkaHR0cC5wdXQoXCIvYXBpL2RhdGFiYXNlL3Byb2ZpbGVcIiwge1xyXG4gICAgICAgICAgcXVldWU6ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnF1ZXVlLFxyXG4gICAgICAgICAgX2lkOiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5zdWJtaXNzaW9uRGF0YS51c2VySURcclxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICB9KS50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJFcnJvcjogZGlkIG5vdCBzYXZlXCIpO1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLypSZXBvc3Qgc2V0dGluZ3MgZW5kKi9cclxuICAgICAgJHNjb3BlLmZpbmlzaEFkbWluID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHN0YXRlLmdvKFwiYWNjb3VudHNcIik7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5nZW5lcmF0ZVJhbmRvbU51bWJlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBtaW4gPSAwLjAxLFxyXG4gICAgICAgICAgbWF4ID0gMC4wOSxcclxuICAgICAgICAgIG51bWJlcnMgPSAoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4pICsgbWluKS50b0ZpeGVkKDIpO1xyXG4gICAgICAgIHJldHVybiBudW1iZXJzXHJcbiAgICAgIH1cclxuICAgICAgdmFyIGRheXNBcnJheSA9IFsnc3VuZGF5JywgJ21vbmRheScsICd0dWVzZGF5JywgJ3dlZG5lc2RheScsICd0aHVyc2RheScsICdmcmlkYXknLCAnc2F0dXJkYXknXTtcclxuXHJcbiAgICAgIHZhciBkZWZhdWx0QXZhaWxhYmxlU2xvdHMgPSB7XHJcbiAgICAgICAgJ3N1bmRheSc6IFsxLCA0LCA4LCAxMSwgMTQsIDE3LCAyMF0sXHJcbiAgICAgICAgJ21vbmRheSc6IFsxLCA0LCA4LCAxMSwgMTQsIDE3LCAyMF0sXHJcbiAgICAgICAgJ3R1ZXNkYXknOiBbMSwgNCwgOCwgMTEsIDE0LCAxNywgMjBdLFxyXG4gICAgICAgICd3ZWRuZXNkYXknOiBbMSwgNCwgOCwgMTEsIDE0LCAxNywgMjBdLFxyXG4gICAgICAgICd0aHVyc2RheSc6IFsxLCA0LCA4LCAxMSwgMTQsIDE3LCAyMF0sXHJcbiAgICAgICAgJ2ZyaWRheSc6IFsxLCA0LCA4LCAxMSwgMTQsIDE3LCAyMF0sXHJcbiAgICAgICAgJ3NhdHVyZGF5JzogWzEsIDQsIDgsIDExLCAxNCwgMTcsIDIwXVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgJHNjb3BlLmFkZEdyb3VwID0gZnVuY3Rpb24odmFsKSB7XHJcbiAgICAgICAgJHNjb3BlLmdyb3VwID0gXCJcIjtcclxuICAgICAgICAkKFwiI2dyb3VwXCIpLnZhbCgnJyk7XHJcbiAgICAgICAgaWYgKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnN1Ym1pc3Npb25EYXRhLmdyb3VwcyA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnN1Ym1pc3Npb25EYXRhLmdyb3VwcyA9IFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoJHNjb3BlLkFjY291bnRzU3RlcERhdGEuc3VibWlzc2lvbkRhdGEuZ3JvdXBzICE9IHVuZGVmaW5lZCAmJiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5zdWJtaXNzaW9uRGF0YS5ncm91cHMuaW5kZXhPZih2YWwpID09IC0xKSB7XHJcbiAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5zdWJtaXNzaW9uRGF0YS5ncm91cHMucHVzaCh2YWwpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnJlbW92ZUdyb3VwID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICBpZiAoJHNjb3BlLkFjY291bnRzU3RlcERhdGEuc3VibWlzc2lvbkRhdGEuZ3JvdXBzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnN1Ym1pc3Npb25EYXRhLmdyb3Vwcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmlzVmFsaWRFbWFpbEFkZHJlc3MgPSBmdW5jdGlvbihlbWFpbEFkZHJlc3MpIHtcclxuICAgICAgICB2YXIgcGF0dGVybiA9IC9eKFthLXpcXGQhIyQlJicqK1xcLVxcLz0/Xl9ge3x9flxcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0rKFxcLlthLXpcXGQhIyQlJicqK1xcLVxcLz0/Xl9ge3x9flxcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0rKSp8XCIoKChbIFxcdF0qXFxyXFxuKT9bIFxcdF0rKT8oW1xceDAxLVxceDA4XFx4MGJcXHgwY1xceDBlLVxceDFmXFx4N2ZcXHgyMVxceDIzLVxceDViXFx4NWQtXFx4N2VcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdfFxcXFxbXFx4MDEtXFx4MDlcXHgwYlxceDBjXFx4MGQtXFx4N2ZcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKSkqKChbIFxcdF0qXFxyXFxuKT9bIFxcdF0rKT9cIilAKChbYS16XFxkXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXXxbYS16XFxkXFx1MDBBMC1cXHVEN0ZGXFx1RjkwMC1cXHVGRENGXFx1RkRGMC1cXHVGRkVGXVthLXpcXGRcXC0uX35cXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKlthLXpcXGRcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdKVxcLikrKFthLXpcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdfFthLXpcXHUwMEEwLVxcdUQ3RkZcXHVGOTAwLVxcdUZEQ0ZcXHVGREYwLVxcdUZGRUZdW2EtelxcZFxcLS5fflxcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0qW2EtelxcdTAwQTAtXFx1RDdGRlxcdUY5MDAtXFx1RkRDRlxcdUZERjAtXFx1RkZFRl0pXFwuPyQvaTtcclxuICAgICAgICByZXR1cm4gcGF0dGVybi50ZXN0KGVtYWlsQWRkcmVzcyk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkc2NvcGUudXBkYXRlTE9HT0lNQUdFID0gZnVuY3Rpb24oc3RlcCkge1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgICBpZiAoJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJvZmlsZVBpY3R1cmUgIT0gXCJcIiAmJiBzdGVwID09IDEpIHtcclxuICAgICAgICAgIGlmICghKHR5cGVvZiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcm9maWxlUGljdHVyZSA9PT0gJ3VuZGVmaW5lZCcpKSB7XHJcbiAgICAgICAgICAgIEFjY291bnRTZXR0aW5nU2VydmljZXMudXBsb2FkRmlsZSgkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcm9maWxlUGljdHVyZSkudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgICBpZiAocmVzKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcm9maWxlUGljdHVyZSA9IHJlcy5kYXRhLkxvY2F0aW9uO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoJHNjb3BlLkFjY291bnRzU3RlcERhdGEucG9zdERhdGEgIT0gdW5kZWZpbmVkICYmICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBvc3REYXRhLmxvZ28uaW1hZ2VzICE9IFwiXCIgJiYgc3RlcCA9PSAzKSB7XHJcbiAgICAgICAgICBpZiAoISh0eXBlb2YgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucG9zdERhdGEubG9nby5pbWFnZXMgPT09ICd1bmRlZmluZWQnKSkge1xyXG4gICAgICAgICAgICBBY2NvdW50U2V0dGluZ1NlcnZpY2VzLnVwbG9hZEZpbGUoJHNjb3BlLkFjY291bnRzU3RlcERhdGEucG9zdERhdGEubG9nby5pbWFnZXMpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHJlcykge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucG9zdERhdGEubG9nby5pbWFnZXMgPSByZXMuZGF0YS5Mb2NhdGlvbjtcclxuICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIgIT0gdW5kZWZpbmVkICYmICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIubG9nby5pbWFnZXMgIT0gXCJcIiAmJiBzdGVwID09IDQpIHtcclxuICAgICAgICAgIGlmICghKHR5cGVvZiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyLmxvZ28uaW1hZ2VzID09PSAndW5kZWZpbmVkJykpIHtcclxuICAgICAgICAgICAgQWNjb3VudFNldHRpbmdTZXJ2aWNlcy51cGxvYWRGaWxlKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIubG9nby5pbWFnZXMpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHJlcykge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJlbWllci5sb2dvLmltYWdlcyA9IHJlcy5kYXRhLkxvY2F0aW9uO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnVwZGF0ZUJhY2tncm91bmRJTUFHRSA9IGZ1bmN0aW9uKHN0ZXApIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgaWYgKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBvc3REYXRhICE9IHVuZGVmaW5lZCAmJiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS5sb2dvLmltYWdlcyAhPSBcIlwiICYmIHN0ZXAgPT0gMykge1xyXG4gICAgICAgICAgaWYgKCEodHlwZW9mICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBvc3REYXRhLmJhY2tncm91bmQuaW1hZ2VzID09PSAndW5kZWZpbmVkJykpIHtcclxuICAgICAgICAgICAgQWNjb3VudFNldHRpbmdTZXJ2aWNlcy51cGxvYWRGaWxlKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBvc3REYXRhLmJhY2tncm91bmQuaW1hZ2VzKS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgIGlmIChyZXMpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBvc3REYXRhLmJhY2tncm91bmQuaW1hZ2VzID0gcmVzLmRhdGEuTG9jYXRpb247XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmICgkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyICE9IHVuZGVmaW5lZCAmJiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyLmJhY2tncm91bmQuaW1hZ2VzICE9IFwiXCIgJiYgc3RlcCA9PSA0KSB7XHJcbiAgICAgICAgICBpZiAoISh0eXBlb2YgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJlbWllci5iYWNrZ3JvdW5kLmltYWdlcyA9PT0gJ3VuZGVmaW5lZCcpKSB7XHJcbiAgICAgICAgICAgIEFjY291bnRTZXR0aW5nU2VydmljZXMudXBsb2FkRmlsZSgkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyLmJhY2tncm91bmQuaW1hZ2VzKS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgIGlmIChyZXMpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIuYmFja2dyb3VuZC5pbWFnZXMgPSByZXMuZGF0YS5Mb2NhdGlvbjtcclxuICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5zb3VuZGNsb3VkTG9naW4gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoJHNjb3BlLkFjY291bnRzU3RlcERhdGEuc3VibWlzc2lvbkRhdGEgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5zdWJtaXNzaW9uRGF0YSA9IHt9O1xyXG4gICAgICAgIH1cclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgU0MuY29ubmVjdCgpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuYWNjZXNzVG9rZW4gPSByZXMub2F1dGhfdG9rZW47XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2xvZ2luL3NvdW5kQ2xvdWRBdXRoZW50aWNhdGlvbicsIHtcclxuICAgICAgICAgICAgICB0b2tlbjogcmVzLm9hdXRoX3Rva2VuLFxyXG4gICAgICAgICAgICAgIHBhc3N3b3JkOiAndGVzdCdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgIHZhciBzY0luZm8gPSB7fTtcclxuICAgICAgICAgICAgc2NJbmZvLnVzZXJJRCA9IHJlcy5kYXRhLnVzZXIuX2lkO1xyXG4gICAgICAgICAgICAkc2NvcGUucGFpZFJlcG9zdElkID0gcmVzLmRhdGEudXNlci5faWQ7XHJcbiAgICAgICAgICAgICRzY29wZS5kZWZhdWx0U3VibWl0UGFnZS51c2VySUQgPSBzY0luZm8udXNlcklEO1xyXG4gICAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YSA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoJHNjb3BlLmRlZmF1bHRTdWJtaXRQYWdlKSk7XHJcbiAgICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KCRzY29wZS5kZWZhdWx0U3VibWl0UGFnZSkpO1xyXG4gICAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS50eXBlID0gXCJzdWJtaXRcIjtcclxuICAgICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJlbWllci50eXBlID0gXCJwcmVtaWVyZVwiO1xyXG4gICAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyLmhlYWRpbmcudGVzdCA9IFwiU3VibWlzc2lvbiBmb3IgUHJlbWllcmVcIjtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLkFjY291bnRzU3RlcERhdGEucG9zdERhdGEpXHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIpO1xyXG4gICAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS5sb2dvLmltYWdlcyA9ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBvc3REYXRhLmJhY2tncm91bmQuaW1hZ2VzID0gJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJlbWllci5sb2dvLmltYWdlcyA9ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIuYmFja2dyb3VuZC5pbWFnZXMgPSByZXMuZGF0YS51c2VyLnNvdW5kY2xvdWQuYXZhdGFyVVJMO1xyXG4gICAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wc2V1ZG9BdmFpbGFibGVTbG90cyA9IGNyZWF0ZVBzZXVkb0F2YWlsYWJsZVNsb3RzKHJlcy5kYXRhLnVzZXIpO1xyXG4gICAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5hc3R6T2Zmc2V0ID0gcmVzLmRhdGEudXNlci5hc3R6T2Zmc2V0O1xyXG4gICAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5yZXBvc3RTZXR0aW5ncyA9IHJlcy5kYXRhLnVzZXIucmVwb3N0U2V0dGluZ3M7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHJlcy5kYXRhLnVzZXIpO1xyXG4gICAgICAgICAgICBBY2NvdW50U2V0dGluZ1NlcnZpY2VzLmNoZWNrVXNlcmNvdW50KHtcclxuICAgICAgICAgICAgICAgIFwidXNlcklEXCI6IHNjSW5mby51c2VySUQsXHJcbiAgICAgICAgICAgICAgICAnYWN0aW9uJzogXCJpZFwiXHJcbiAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXN1bHQpIHtcclxuICAgICAgICAgICAgICAgIGlmICghcmVzdWx0LmRhdGEpIHtcclxuICAgICAgICAgICAgICAgICAgc2NJbmZvLmdyb3VwcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgICBzY0luZm8uZGVzY3JpcHRpb24gPSBcIlwiO1xyXG4gICAgICAgICAgICAgICAgICBzY0luZm8ucHJpY2UgPSAxO1xyXG4gICAgICAgICAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5zdWJtaXNzaW9uRGF0YSA9IHJlcy5kYXRhLnVzZXIuc291bmRjbG91ZDtcclxuICAgICAgICAgICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEuc3VibWlzc2lvbkRhdGEudXNlcklEID0gcmVzLmRhdGEudXNlci5faWQ7XHJcbiAgICAgICAgICAgICAgICAgIHZhciB1c2VybmFtZSA9IHJlcy5kYXRhLnVzZXIuc291bmRjbG91ZC5wZXJtYWxpbmtVUkwuc3Vic3RyaW5nKHJlcy5kYXRhLnVzZXIuc291bmRjbG91ZC5wZXJtYWxpbmtVUkwuaW5kZXhPZignLmNvbS8nKSArIDUpXHJcbiAgICAgICAgICAgICAgICAgIHZhciB1cmwgPSB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgJy8nICsgdXNlcm5hbWUgKyAnL3N1Ym1pdCc7XHJcbiAgICAgICAgICAgICAgICAgIHZhciBwcmVtaWVydXJsID0gd2luZG93LmxvY2F0aW9uLm9yaWdpbiArICcvJyArIHVzZXJuYW1lICsgJy9wcmVtaWVyZSc7XHJcbiAgICAgICAgICAgICAgICAgIEFjY291bnRTZXR0aW5nU2VydmljZXMuY2hlY2tVc2VyY291bnQoe1xyXG4gICAgICAgICAgICAgICAgICAgICAgXCJ1cmxcIjogdXJsLFxyXG4gICAgICAgICAgICAgICAgICAgICAgJ2FjdGlvbic6IFwidXJsXCJcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3VsdCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5kYXRhKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybCA9IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4gKyAnLycgKyB1c2VybmFtZSArIHJlc3VsdC5kYXRhICsgJy9zdWJtaXQnO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBwcmVtaWVydXJsID0gd2luZG93LmxvY2F0aW9uLm9yaWdpbiArICcvJyArIHVzZXJuYW1lICsgcmVzdWx0LmRhdGEgKyAnL3ByZW1pZXJlJztcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEuc3VibWlzc2lvbkRhdGEuc3VibWlzc2lvblVybCA9IHVybDtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEuc3VibWlzc2lvbkRhdGEucHJlbWllclVybCA9IHByZW1pZXJ1cmw7XHJcbiAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5zdWJtaXNzaW9uRGF0YS5zdWJtaXNzaW9uVXJsID0gdXJsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5zdWJtaXNzaW9uRGF0YS5wcmVtaWVyVXJsID0gcHJlbWllcnVybDtcclxuICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgIHNjSW5mby5zdWJtaXNzaW9uVXJsID0gdXJsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgc2NJbmZvLnByZW1pZXJVcmwgPSBwcmVtaWVydXJsO1xyXG4gICAgICAgICAgICAgICAgICAgICAgJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS91cGRhdGVVc2VyQWNjb3VudCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc291bmRjbG91ZEluZm86IHNjSW5mbyxcclxuICAgICAgICAgICAgICAgICAgICAgIH0pLnRoZW4oZnVuY3Rpb24odXNlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VyLmRhdGEucGFpZFJlcG9zdC5yZXZlcnNlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvcHJvZmlsZS9lZGl0Jywge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB1c2VySUQ6IHNjSW5mby51c2VySUQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGFkbWluOiB0cnVlXHJcbiAgICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcclxuXHJcbiAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZUFkbWluVXNlcigkc2NvcGUuQWNjb3VudHNTdGVwRGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLm5leHRTdGVwKDIsICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLCAnY2hhbm5lbCcpXHJcbiAgICAgICAgICAgICAgICAgICAgfSkudGhlbihudWxsLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICAgICAgICAgICAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkVycm9yIGxvZ2dpbmcgaW5cIilcclxuICAgICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coJ0Vycm9yOiBUaGlzIHVzZXIgYWxyZWFkeSBleGlzdHMnKTtcclxuICAgICAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSkudGhlbihudWxsLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICAgICAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkVycm9yIGxvZ2dpbmcgaW5cIilcclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgICAkLlplYnJhX0RpYWxvZygnRXJyb3I6IENvdWxkIG5vdCBsb2cgaW4nKTtcclxuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgJHNjb3BlLmlzUGFpZFJlcG9zdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICgkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5mb3JtQWN0aW9ucyA9PSAnRWRpdCcpIHtcclxuICAgICAgICAgICRzY29wZS5hY3RpdmVUYWIgPSBbJ3N1Ym1pc3Npb25VcmwnLCAnc2V0UHJpY2UnLCAnY3VzdG9tU3VibWlzc2lvbicsICdjdXN0b21QcmVtaWVyZVN1Ym1pc3Npb24nLCAncmVwb3N0UHJlZmVyZW5jZXMnLCAnbWFuYWdlUmVwb3N0cyddO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAkc2NvcGUuYWN0aXZlVGFiID0gWydzdWJtaXNzaW9uVXJsJ107XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuaXNQYWlkUmVwb3N0KCk7XHJcblxyXG4gICAgICAkc2NvcGUubmV4dFN0ZXAgPSBmdW5jdGlvbihzdGVwLCBjdXJyZW50RGF0YSwgdHlwZSkge1xyXG4gICAgICAgIGlmICh0eXBlID09IFwiY2hhbm5lbFwiKSB7XHJcbiAgICAgICAgICBzd2l0Y2ggKHN0ZXApIHtcclxuICAgICAgICAgICAgY2FzZSAxOlxyXG4gICAgICAgICAgICAgICRodHRwLmdldChcIi9jb25uZWN0L2xvZ291dD9yZXR1cm5fdG89aHR0cHM6Ly9zb3VuZGNsb3VkLmNvbS9jb25uZWN0P2NsaWVudF9pZD04MDAyZjBmODMyNmQ4Njk2Njg1MjNkOGU0NWE1M2I5MCZkaXNwbGF5PXBvcHVwJnJlZGlyZWN0X3VyaT1odHRwczovL1wiICsgd2luZG93LmxvY2F0aW9uLmhvc3QgKyBcIi9jYWxsYmFjay5odG1sJnJlc3BvbnNlX3R5cGU9Y29kZV9hbmRfdG9rZW4mc2NvcGU9bm9uLWV4cGlyaW5nJnN0YXRlPVNvdW5kQ2xvdWRfRGlhbG9nXzVmZWFkXCIpO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDI6XHJcbiAgICAgICAgICAgICAgaWYgKCEkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmljZSkgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJpY2UgPSBNYXRoLm1heChNYXRoLmZsb29yKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnN1Ym1pc3Npb25EYXRhLmZvbGxvd2VycyAvIDMwMDApLCA3KTtcclxuICAgICAgICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGVBZG1pblVzZXIoJHNjb3BlLkFjY291bnRzU3RlcERhdGEpO1xyXG4gICAgICAgICAgICAgICRzY29wZS5hY3RpdmVUYWIucHVzaCgnc2V0UHJpY2UnKTtcclxuICAgICAgICAgICAgICAkKCcubmF2LXRhYnMgYVtocmVmPVwiI3NldFByaWNlXCJdJykudGFiKCdzaG93Jyk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgICB2YXIgbmV4dCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgaWYgKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByaWNlIDwgNiB8fCAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmljZSA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgICAgIG5leHQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByaWNlID0gNjtcclxuICAgICAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKCdQbGVhc2UgZW50ZXIgYSBwcmljZSAobWluaW11bSAkNikuJyk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmIChuZXh0KSB7XHJcbiAgICAgICAgICAgICAgICBBY2NvdW50U2V0dGluZ1NlcnZpY2VzLnVwZGF0ZVBhaWRSZXBvc3Qoe1xyXG4gICAgICAgICAgICAgICAgICAgIHVzZXJJRDogJHNjb3BlLkFjY291bnRzU3RlcERhdGEuc3VibWlzc2lvbkRhdGEudXNlcklELFxyXG4gICAgICAgICAgICAgICAgICAgIHByaWNlOiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmljZSxcclxuICAgICAgICAgICAgICAgICAgICBkZXNjcmlwdGlvbjogJHNjb3BlLkFjY291bnRzU3RlcERhdGEuZGVzY3JpcHRpb24sXHJcbiAgICAgICAgICAgICAgICAgICAgZ3JvdXBzOiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5zdWJtaXNzaW9uRGF0YS5ncm91cHMgPyAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5zdWJtaXNzaW9uRGF0YS5ncm91cHMgOiBbXSxcclxuICAgICAgICAgICAgICAgICAgICBzdWJtaXNzaW9uVXJsOiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5zdWJtaXNzaW9uRGF0YS5zdWJtaXNzaW9uVXJsLFxyXG4gICAgICAgICAgICAgICAgICAgIHByZW1pZXJVcmw6ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnN1Ym1pc3Npb25EYXRhLnByZW1pZXJVcmxcclxuICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmFjdGl2ZVRhYi5wdXNoKCdjdXN0b21TdWJtaXNzaW9uJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJCgnLm5hdi10YWJzIGFbaHJlZj1cIiNjdXN0b21TdWJtaXNzaW9uXCJdJykudGFiKCdzaG93Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlQWRtaW5Vc2VyKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhKTtcclxuICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKCkge30pO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDQ6XHJcbiAgICAgICAgICAgICAgQWNjb3VudFNldHRpbmdTZXJ2aWNlcy5hZGRDdXN0b21pemUoe1xyXG4gICAgICAgICAgICAgICAgICB1c2VySUQ6ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnN1Ym1pc3Npb25EYXRhLnVzZXJJRCxcclxuICAgICAgICAgICAgICAgICAgdHlwZTogJ3N1Ym1pdCcsXHJcbiAgICAgICAgICAgICAgICAgIGJhY2tncm91bmQ6ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBvc3REYXRhLmJhY2tncm91bmQsXHJcbiAgICAgICAgICAgICAgICAgIGxvZ286ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBvc3REYXRhLmxvZ28sXHJcbiAgICAgICAgICAgICAgICAgIGhlYWRpbmc6ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBvc3REYXRhLmhlYWRpbmcsXHJcbiAgICAgICAgICAgICAgICAgIHN1YkhlYWRpbmc6ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBvc3REYXRhLnN1YkhlYWRpbmcsXHJcbiAgICAgICAgICAgICAgICAgIGlucHV0RmllbGRzOiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS5pbnB1dEZpZWxkcyxcclxuICAgICAgICAgICAgICAgICAgYnV0dG9uOiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS5idXR0b24sXHJcbiAgICAgICAgICAgICAgICAgIGxheW91dDogJHNjb3BlLkFjY291bnRzU3RlcERhdGEucG9zdERhdGEubGF5b3V0XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICRzY29wZS5hY3RpdmVUYWIucHVzaCgnY3VzdG9tUHJlbWllcmVTdWJtaXNzaW9uJyk7XHJcbiAgICAgICAgICAgICAgICAgICQoJy5uYXYtdGFicyBhW2hyZWY9XCIjY3VzdG9tUHJlbWllcmVTdWJtaXNzaW9uXCJdJykudGFiKCdzaG93Jyk7XHJcbiAgICAgICAgICAgICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZUFkbWluVXNlcigkc2NvcGUuQWNjb3VudHNTdGVwRGF0YSk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKCkge30pO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDU6XHJcbiAgICAgICAgICAgICAgQWNjb3VudFNldHRpbmdTZXJ2aWNlcy5hZGRDdXN0b21pemUoe1xyXG4gICAgICAgICAgICAgICAgICB1c2VySUQ6ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnN1Ym1pc3Npb25EYXRhLnVzZXJJRCxcclxuICAgICAgICAgICAgICAgICAgdHlwZTogJ3ByZW1pZXJlJyxcclxuICAgICAgICAgICAgICAgICAgYmFja2dyb3VuZDogJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJlbWllci5iYWNrZ3JvdW5kLFxyXG4gICAgICAgICAgICAgICAgICBsb2dvOiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyLmxvZ28sXHJcbiAgICAgICAgICAgICAgICAgIGhlYWRpbmc6ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIuaGVhZGluZyxcclxuICAgICAgICAgICAgICAgICAgc3ViSGVhZGluZzogJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJlbWllci5zdWJIZWFkaW5nLFxyXG4gICAgICAgICAgICAgICAgICBpbnB1dEZpZWxkczogJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJlbWllci5pbnB1dEZpZWxkcyxcclxuICAgICAgICAgICAgICAgICAgYnV0dG9uOiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyLmJ1dHRvbixcclxuICAgICAgICAgICAgICAgICAgbGF5b3V0OiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyLmxheW91dFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgICAkc2NvcGUuZmluaXNoKCk7XHJcbiAgICAgICAgICAgICAgICAgIC8vIGlmICgkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wc2V1ZG9BdmFpbGFibGVTbG90cyA9PSB1bmRlZmluZWQpICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBzZXVkb0F2YWlsYWJsZVNsb3RzID0gZGVmYXVsdEF2YWlsYWJsZVNsb3RzO1xyXG4gICAgICAgICAgICAgICAgICAvLyBpZiAoISRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLmFzdHpPZmZzZXQpICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLmFzdHpPZmZzZXQgPSAtMzAwO1xyXG4gICAgICAgICAgICAgICAgICAvLyBTZXNzaW9uU2VydmljZS5jcmVhdGVBZG1pblVzZXIoJHNjb3BlLkFjY291bnRzU3RlcERhdGEpO1xyXG4gICAgICAgICAgICAgICAgICAvLyAkc2NvcGUuYWN0aXZlVGFiLnB1c2goJ3JlcG9zdFByZWZlcmVuY2VzJyk7XHJcbiAgICAgICAgICAgICAgICAgIC8vICQoJy5uYXYtdGFicyBhW2hyZWY9XCIjcmVwb3N0UHJlZmVyZW5jZXNcIl0nKS50YWIoJ3Nob3cnKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihudWxsLCBhbGVydCk7XHJcbiAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgIGNhc2UgNjpcclxuICAgICAgICAgICAgICAvL3VwZGF0ZSBmcm9tIHBzZXVkb1xyXG4gICAgICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLmF2YWlsYWJsZVNsb3RzID0gY3JlYXRlQXZhaWxhYmxlU2xvdHMoJHNjb3BlLkFjY291bnRzU3RlcERhdGEsICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBzZXVkb0F2YWlsYWJsZVNsb3RzKVxyXG4gICAgICAgICAgICAgIEFjY291bnRTZXR0aW5nU2VydmljZXMudXBkYXRlVXNlckF2YWlsYWJsZVNsb3Qoe1xyXG4gICAgICAgICAgICAgICAgICBfaWQ6ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnN1Ym1pc3Npb25EYXRhLnVzZXJJRCxcclxuICAgICAgICAgICAgICAgICAgYXZhaWxhYmxlU2xvdHM6ICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLmF2YWlsYWJsZVNsb3RzXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnF1ZXVlID0gcmVzLmRhdGEucXVldWU7XHJcbiAgICAgICAgICAgICAgICAgICRzY29wZS5sb2FkUXVldWVTb25ncygpO1xyXG4gICAgICAgICAgICAgICAgICAkc2NvcGUuYWN0aXZlVGFiLnB1c2goJ21hbmFnZVJlcG9zdHMnKTtcclxuICAgICAgICAgICAgICAgICAgJCgnLm5hdi10YWJzIGFbaHJlZj1cIiNtYW5hZ2VSZXBvc3RzXCJdJykudGFiKCdzaG93Jyk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKCkge30pO1xyXG4gICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICBjYXNlIDc6XHJcbiAgICAgICAgICAgICAgU2Vzc2lvblNlcnZpY2UucmVtb3ZlQWNjb3VudHVzZXJzKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhKTtcclxuICAgICAgICAgICAgICAvLyAkc3RhdGUuZ28oXCJhY2NvdW50c1wiKTtcclxuICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5vcGVuTW9kYWwgPSBmdW5jdGlvbih0eXBlKSB7XHJcbiAgICAgICAgaWYgKHR5cGUgPT09ICdwYWlkJykge1xyXG4gICAgICAgICAgJCgnI3BhaWRDb21tZW50TW9kYWwnKS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnNldFNsb3RTdHlsZSA9IGZ1bmN0aW9uKGRheSwgaG91cikge1xyXG4gICAgICAgIHZhciBzdHlsZSA9IHt9O1xyXG4gICAgICAgIGlmICgkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wc2V1ZG9BdmFpbGFibGVTbG90cyAhPSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgIGlmICgkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wc2V1ZG9BdmFpbGFibGVTbG90c1tkYXlzQXJyYXlbZGF5XV0gIT0gdW5kZWZpbmVkICYmICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBzZXVkb0F2YWlsYWJsZVNsb3RzW2RheXNBcnJheVtkYXldXS5pbmRleE9mKGhvdXIpID4gLTEpIHtcclxuICAgICAgICAgICAgc3R5bGUgPSB7XHJcbiAgICAgICAgICAgICAgJ2JhY2tncm91bmQtY29sb3InOiBcIiNmZmZcIixcclxuICAgICAgICAgICAgICAnYm9yZGVyLWNvbG9yJzogXCIjOTk5XCJcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN0eWxlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUudG9vTWFueVJlcG9zdHMgPSBmdW5jdGlvbihkYXksIGhvdXIpIHtcclxuICAgICAgICB2YXIgc3RhcnREYXlJbnQgPSAoZGF5ICsgNikgJSA3O1xyXG4gICAgICAgIHZhciBhbGxTbG90cyA9IFtdXHJcbiAgICAgICAgdmFyIHdvdWxkQmVTbG90cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHNldWRvQXZhaWxhYmxlU2xvdHMpKTtcclxuICAgICAgICB3b3VsZEJlU2xvdHNbZGF5c0FycmF5W2RheV1dLnB1c2goaG91cik7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAzOyBpKyspIHtcclxuICAgICAgICAgIHdvdWxkQmVTbG90c1tkYXlzQXJyYXlbKHN0YXJ0RGF5SW50ICsgaSkgJSA3XV1cclxuICAgICAgICAgICAgLmZvckVhY2goZnVuY3Rpb24oc2xvdCkge1xyXG4gICAgICAgICAgICAgIGFsbFNsb3RzLnB1c2goc2xvdCArIGkgKiAyNCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGFsbFNsb3RzID0gYWxsU2xvdHMuc29ydChmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgICByZXR1cm4gYSAtIGI7XHJcbiAgICAgICAgfSlcclxuICAgICAgICB2YXIgY2hlY2tpbmdTbG90cyA9IFtdO1xyXG4gICAgICAgIHZhciBzdGF0dXMgPSBmYWxzZTtcclxuICAgICAgICBhbGxTbG90cy5mb3JFYWNoKGZ1bmN0aW9uKHNsb3QpIHtcclxuICAgICAgICAgIHZhciBpID0gMDtcclxuICAgICAgICAgIHdoaWxlIChpIDwgY2hlY2tpbmdTbG90cy5sZW5ndGgpIHtcclxuICAgICAgICAgICAgaWYgKE1hdGguYWJzKGNoZWNraW5nU2xvdHNbaV0gLSBzbG90KSA+IDI0KSBjaGVja2luZ1Nsb3RzLnNwbGljZShpLCAxKTtcclxuICAgICAgICAgICAgZWxzZSBpKys7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjaGVja2luZ1Nsb3RzLnB1c2goc2xvdCk7XHJcbiAgICAgICAgICBpZiAoY2hlY2tpbmdTbG90cy5sZW5ndGggPiAxMCkge1xyXG4gICAgICAgICAgICBzdGF0dXMgPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgcmV0dXJuIHN0YXR1cztcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmNsaWNrZWRTbG90c2F2ZSA9IGZ1bmN0aW9uKGRheSwgaG91cikge1xyXG4gICAgICAgIHZhciBwdXNoaG91ciA9IHBhcnNlSW50KGhvdXIpO1xyXG4gICAgICAgIGlmICgkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wc2V1ZG9BdmFpbGFibGVTbG90cyAhPSB1bmRlZmluZWQgJiYgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHNldWRvQXZhaWxhYmxlU2xvdHNbZGF5c0FycmF5W2RheV1dLmluZGV4T2YocHVzaGhvdXIpID4gLTEpIHtcclxuICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBzZXVkb0F2YWlsYWJsZVNsb3RzW2RheXNBcnJheVtkYXldXS5zcGxpY2UoJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHNldWRvQXZhaWxhYmxlU2xvdHNbZGF5c0FycmF5W2RheV1dLmluZGV4T2YocHVzaGhvdXIpLCAxKTtcclxuICAgICAgICB9IGVsc2UgaWYgKCRzY29wZS50b29NYW55UmVwb3N0cyhkYXksIGhvdXIpKSB7XHJcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkNhbm5vdCBlbmFibGUgc2xvdC4gV2Ugb25seSBhbGxvdyAxMCByZXBvc3RzIHdpdGhpbiAyNCBob3VycyB0byBwcmV2ZW50IHlvdSBmcm9tIGJlaW5nIHJlcG9zdCBibG9ja2VkLlwiKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9IGVsc2UgaWYgKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBzZXVkb0F2YWlsYWJsZVNsb3RzICE9IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHNldWRvQXZhaWxhYmxlU2xvdHNbZGF5c0FycmF5W2RheV1dLnB1c2gocHVzaGhvdXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnVwZGF0ZUN1c3RvbUxvZ29JbWFnZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgICBpZiAoJHNjb3BlLkFjY291bnRzU3RlcERhdGEucG9zdERhdGEgIT0gdW5kZWZpbmVkICYmICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBvc3REYXRhLmxvZ28uaW1hZ2VzICE9IFwiXCIpIHtcclxuICAgICAgICAgIGlmICghKHR5cGVvZiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS5sb2dvLmltYWdlcyA9PT0gJ3VuZGVmaW5lZCcpKSB7XHJcbiAgICAgICAgICAgIEFjY291bnRTZXR0aW5nU2VydmljZXMudXBsb2FkRmlsZSgkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS5sb2dvLmltYWdlcykudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgICBpZiAocmVzKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS5sb2dvLmltYWdlcyA9IHJlcy5kYXRhLkxvY2F0aW9uO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnVwZGF0ZVByZW1pZXJMb2dvSW1hZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgaWYgKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIgIT0gdW5kZWZpbmVkICYmICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIubG9nby5pbWFnZXMgIT0gXCJcIikge1xyXG4gICAgICAgICAgaWYgKCEodHlwZW9mICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIubG9nby5pbWFnZXMgPT09ICd1bmRlZmluZWQnKSkge1xyXG4gICAgICAgICAgICBBY2NvdW50U2V0dGluZ1NlcnZpY2VzLnVwbG9hZEZpbGUoJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJlbWllci5sb2dvLmltYWdlcykudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgICBpZiAocmVzKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyLmxvZ28uaW1hZ2VzID0gcmVzLmRhdGEuTG9jYXRpb247XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUudXBsb2FkQ3VzdG9tQmFja2dyb3VuZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgaWYgKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBvc3REYXRhICE9IHVuZGVmaW5lZCAmJiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS5iYWNrZ3JvdW5kLmltYWdlcyAhPSBcIlwiKSB7XHJcbiAgICAgICAgICAgIGlmICghKHR5cGVvZiAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS5iYWNrZ3JvdW5kLmltYWdlcyA9PT0gJ3VuZGVmaW5lZCcpKSB7XHJcbiAgICAgICAgICAgICAgQWNjb3VudFNldHRpbmdTZXJ2aWNlcy51cGxvYWRGaWxlKCRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnBvc3REYXRhLmJhY2tncm91bmQuaW1hZ2VzKS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlcykge1xyXG4gICAgICAgICAgICAgICAgICAkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wb3N0RGF0YS5iYWNrZ3JvdW5kLmltYWdlcyA9IHJlcy5kYXRhLkxvY2F0aW9uO1xyXG4gICAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAvLyAkc2NvcGUuZm9udEZhbSA9IFwiJ0FyZWYgUnVxYWEnLCBjdXJzaXZlXCI7XHJcbiAgICAgICRzY29wZS51cGxvYWRQcmVtaWVyQmFja2dyb3VuZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgICBpZiAoJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJlbWllciAhPSB1bmRlZmluZWQgJiYgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJlbWllci5iYWNrZ3JvdW5kLmltYWdlcyAhPSBcIlwiKSB7XHJcbiAgICAgICAgICBpZiAoISh0eXBlb2YgJHNjb3BlLkFjY291bnRzU3RlcERhdGEucHJlbWllci5iYWNrZ3JvdW5kLmltYWdlcyA9PT0gJ3VuZGVmaW5lZCcpKSB7XHJcbiAgICAgICAgICAgIEFjY291bnRTZXR0aW5nU2VydmljZXMudXBsb2FkRmlsZSgkc2NvcGUuQWNjb3VudHNTdGVwRGF0YS5wcmVtaWVyLmJhY2tncm91bmQuaW1hZ2VzKS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgIGlmIChyZXMpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5BY2NvdW50c1N0ZXBEYXRhLnByZW1pZXIuYmFja2dyb3VuZC5pbWFnZXMgPSByZXMuZGF0YS5Mb2NhdGlvbjtcclxuICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5jaGFuZ2VGb250ID0gZnVuY3Rpb24oZm50LCB0aXRsZSkge1xyXG4gICAgICAgICRzY29wZVtmbnRdID0gdGl0bGU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5mb250RmFtaWxpZXMgPSBbe1xyXG4gICAgICAgIHRpdGxlOiBcIkFyZWYgUnVxYWFcIixcclxuICAgICAgICBjc3M6IFwiJ0FyZWYgUnVxYWEnLCBzZXJpZlwiXHJcbiAgICAgIH0sIHtcclxuICAgICAgICB0aXRsZTogXCJPcGVuIFNhbnNcIixcclxuICAgICAgICBjc3M6IFwiJ09wZW4gU2FucycsIHNhbnMtc2VyaWZcIlxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgdGl0bGU6IFwiU3BhY2UgTW9ub1wiLFxyXG4gICAgICAgIGNzczogXCInU3BhY2UgTW9ubycsIG1vbm9zcGFjZVwiXHJcbiAgICAgIH0sIHtcclxuICAgICAgICB0aXRsZTogXCJSb2JvdG8gU2xhYlwiLFxyXG4gICAgICAgIGNzczogXCInUm9ib3RvIFNsYWInLCBzZXJpZlwiXHJcbiAgICAgIH0sIHtcclxuICAgICAgICB0aXRsZTogXCJNZXJyaXdlYXRoZXJcIixcclxuICAgICAgICBjc3M6IFwiJ01lcnJpd2VhdGhlcicsIHNlcmlmXCJcclxuICAgICAgfSwge1xyXG4gICAgICAgIHRpdGxlOiBcIk1vbGxlXCIsXHJcbiAgICAgICAgY3NzOiBcIidNb2xsZScsIGN1cnNpdmVcIlxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgdGl0bGU6IFwiUGxheWZhaXIgRGlzcGxheVwiLFxyXG4gICAgICAgIGNzczogXCInUGxheWZhaXIgRGlzcGxheScsIHNlcmlmXCJcclxuICAgICAgfSwge1xyXG4gICAgICAgIHRpdGxlOiBcIkluZGllIEZsb3dlclwiLFxyXG4gICAgICAgIGNzczogXCInSW5kaWUgRmxvd2VyJywgY3Vyc2l2ZVwiXHJcbiAgICAgIH0sIHtcclxuICAgICAgICB0aXRsZTogXCJOb3ZhIFNjcmlwdFwiLFxyXG4gICAgICAgIGNzczogXCInTm92YSBTY3JpcHQnLCBjdXJzaXZlXCJcclxuICAgICAgfSwge1xyXG4gICAgICAgIHRpdGxlOiBcIkluY29uc29sYXRhXCIsXHJcbiAgICAgICAgY3NzOiBcIidJbmNvbnNvbGF0YScsIG1vbm9zcGFjZVwiXHJcbiAgICAgIH0sIHtcclxuICAgICAgICB0aXRsZTogXCJMb2JzdGVyXCIsXHJcbiAgICAgICAgY3NzOiBcIidMb2JzdGVyJywgY3Vyc2l2ZVwiXHJcbiAgICAgIH0sIHtcclxuICAgICAgICB0aXRsZTogXCJBcnZvXCIsXHJcbiAgICAgICAgY3NzOiBcIidBcnZvJywgc2VyaWZcIlxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgdGl0bGU6IFwiWWFub25lIEthZmZlZXNhdHpcIixcclxuICAgICAgICBjc3M6IFwiJ1lhbm9uZSBLYWZmZWVzYXR6Jywgc2Fucy1zZXJpZlwiXHJcbiAgICAgIH0sIHtcclxuICAgICAgICB0aXRsZTogXCJBYmVsXCIsXHJcbiAgICAgICAgY3NzOiBcIidBYmVsJywgc2Fucy1zZXJpZlwiXHJcbiAgICAgIH0sIHtcclxuICAgICAgICB0aXRsZTogXCJHbG9yaWEgSGFsbGVsdWphaFwiLFxyXG4gICAgICAgIGNzczogXCInR2xvcmlhIEhhbGxlbHVqYWgnLCBjdXJzaXZlXCJcclxuICAgICAgfSwge1xyXG4gICAgICAgIHRpdGxlOiBcIlBhY2lmaWNvXCIsXHJcbiAgICAgICAgY3NzOiBcIidQYWNpZmljbycsIGN1cnNpdmVcIlxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgdGl0bGU6IFwiQnVuZ2VlXCIsXHJcbiAgICAgICAgY3NzOiBcIidCdW5nZWUnLCBjdXJzaXZlXCJcclxuICAgICAgfSwge1xyXG4gICAgICAgIHRpdGxlOiBcIkV4b1wiLFxyXG4gICAgICAgIGNzczogXCInRXhvJywgc2Fucy1zZXJpZlwiXHJcbiAgICAgIH0sIHtcclxuICAgICAgICB0aXRsZTogXCJTaGFkb3dzIEludG8gTGlnaHRcIixcclxuICAgICAgICBjc3M6IFwiJ1NoYWRvd3MgSW50byBMaWdodCcsIGN1cnNpdmVcIlxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgdGl0bGU6IFwiRGFuY2luZyBTY3JpcHRcIixcclxuICAgICAgICBjc3M6IFwiJ0RhbmNpbmcgU2NyaXB0JywgY3Vyc2l2ZVwiXHJcbiAgICAgIH0sIHtcclxuICAgICAgICB0aXRsZTogXCJQbGF5XCIsXHJcbiAgICAgICAgY3NzOiBcIidQbGF5Jywgc2Fucy1zZXJpZlwiXHJcbiAgICAgIH0sIHtcclxuICAgICAgICB0aXRsZTogXCJBbWF0aWMgU0NcIixcclxuICAgICAgICBjc3M6IFwiJ0FtYXRpYyBTQycsIGN1cnNpdmVcIlxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgdGl0bGU6IFwiUG9pcmV0IE9uZVwiLFxyXG4gICAgICAgIGNzczogXCInUG9pcmV0IE9uZScsIGN1cnNpdmVcIlxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgdGl0bGU6IFwiT3JiaXRyb25cIixcclxuICAgICAgICBjc3M6IFwiJ09yYml0cm9uJywgc2Fucy1zZXJpZlwiXHJcbiAgICAgIH0sIHtcclxuICAgICAgICB0aXRsZTogXCJTYWhpdHlhXCIsXHJcbiAgICAgICAgY3NzOiBcIidTYWhpdHlhJywgc2VyaWZcIlxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgdGl0bGU6IFwiQXJjaGl0ZWN0cyBEYXVnaHRlclwiLFxyXG4gICAgICAgIGNzczogXCInQXJjaGl0ZWN0cyBEYXVnaHRlcicsIGN1cnNpdmVcIlxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgdGl0bGU6IFwiQWNtZVwiLFxyXG4gICAgICAgIGNzczogXCInQWNtZScsIHNhbnMtc2VyaWZcIlxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgdGl0bGU6IFwiQ2luemVsXCIsXHJcbiAgICAgICAgY3NzOiBcIidDaW56ZWwnLCBzZXJpZlwiXHJcbiAgICAgIH0sIHtcclxuICAgICAgICB0aXRsZTogXCJKb3NlZmluIFNsYWJcIixcclxuICAgICAgICBjc3M6IFwiJ0pvc2VmaW4gU2xhYicsIHNlcmlmXCJcclxuICAgICAgfSwge1xyXG4gICAgICAgIHRpdGxlOiBcIkxvYnN0ZXIgVHdvXCIsXHJcbiAgICAgICAgY3NzOiBcIidMb2JzdGVyIFR3bycsIGN1cnNpdmVcIlxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgdGl0bGU6IFwiUGVybWFuZW50IE1hcmtlclwiLFxyXG4gICAgICAgIGNzczogXCInUGVybWFuZW50IE1hcmtlcicsIGN1cnNpdmVcIlxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgdGl0bGU6IFwiQ2hld3lcIixcclxuICAgICAgICBjc3M6IFwiJ0NoZXd5JywgY3Vyc2l2ZVwiXHJcbiAgICAgIH0sIHtcclxuICAgICAgICB0aXRsZTogXCJTcGVjaWFsIEVsaXRlXCIsXHJcbiAgICAgICAgY3NzOiBcIidTcGVjaWFsIEVsaXRlJywgY3Vyc2l2ZVwiXHJcbiAgICAgIH0sIHtcclxuICAgICAgICB0aXRsZTogXCJDYWxsaWdyYWZmaXR0aVwiLFxyXG4gICAgICAgIGNzczogXCInQ2FsbGlncmFmZml0dGknLCBjdXJzaXZlXCJcclxuICAgICAgfSwge1xyXG4gICAgICAgIHRpdGxlOiBcIkNldmljaGUgT25lXCIsXHJcbiAgICAgICAgY3NzOiBcIidDZXZpY2hlIE9uZScsIGN1cnNpdmVcIlxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgdGl0bGU6IFwiUHJlc3MgU3RhcnQgMlBcIixcclxuICAgICAgICBjc3M6IFwiJ1ByZXNzIFN0YXJ0IDJQJywgY3Vyc2l2ZVwiXHJcbiAgICAgIH0sIHtcclxuICAgICAgICB0aXRsZTogXCJDaW56ZWwgRGVjb3JhdGl2ZVwiLFxyXG4gICAgICAgIGNzczogXCInQ2luemVsIERlY29yYXRpdmUnLCBjdXJzaXZlXCJcclxuICAgICAgfV1cclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG4iXSwiZmlsZSI6ImNvbW1vbi9kaXJlY3RpdmVzL3NldHRpbmdzL2NoYW5uZWxTZXR0aW5ncy5qcyJ9
