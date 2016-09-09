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

});

app.controller('accountSettingController', function($rootScope, $state, $scope, $http, $window, AccountSettingServices, SessionService) {

    $scope.isLoggedIn = SessionService.getUser() ? true : false;
    if (!$scope.isLoggedIn) {
        $state.go('admin');
    }

    $scope.user = SessionService.getUser();
    if ($state.current.url == "/admin/basic/step1") {
        $scope.AccountsStepData = SessionService.getAdminUser();
        if ($scope.AccountsStepData == undefined)
            $scope.AccountsStepData = SessionService.getUser();
        else
            $scope.AccountsStepData = SessionService.getAdminUser();

        if (SessionService.getAdminUser() == undefined && $scope.AccountsStepData.submissionData == undefined) {
            SessionService.createAdminUser($scope.AccountsStepData);
        }

        if ($scope.AccountsStepData.profilePicture == undefined || $scope.AccountsStepData.profilePicture == "") {
            $scope.AccountsStepData.profilePicture = "assets/images/info_button.png";
        }
    } else {
        $scope.AccountsStepData = SessionService.getAdminUser();
    }

    $scope.generateRandomNumber = function() {
        var min = 0.01,
        max = 0.09,
        numbers = (Math.random() * (max - min) + min).toFixed(2);
        return numbers
    }
    var daysArray = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    var defaultAvailableSlots = {
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: []
  };
   
    $scope.stepButton = [
        { "name": "SONG URL", "appendText": " {SONGURL} " },
        { "name": "EMAIL", "appendText": " {EMAIL} " },
        { "name": "SONG NAME", "appendText": " {SONGNAME} " },
        { "name": "ARTIST", "appendText": " {ARTIST} " },
        { "name": "NAME", "appendText": " {NAME} " },
        { "name": "NAME OF TRACK", "appendText": " {NAMEOFTRACK} " },
        { "name": "TRACK COVER ART", "appendText": " {TRACKCOVERART} " },
        { "name": "MY CHANNEL", "appendText": " {MYCHANNEL} " },
        { "name": "TODAYS DATE", "appendText": " {TODAYSDATE} " }
    ];

    $scope.customBox = { "acceptance": { "title": "", "subject": "", "body": "" }, "decline": { "title": "", "subject": "", "body": "" } };

    

    $scope.addEventClass = function(index, type) {
        $('textarea').removeClass("selectedBox");
        $("." + type + '.' + type + index).addClass("selectedBox");
    }

    $scope.addCustomEmails = function() {
        if ($scope.AccountsStepData.customizeemails.length > 0)
            $scope.AccountsStepData.customizeemails.push($scope.customBox);
    }

    
    $scope.nextStep = function(step, currentData, type) {

        if (type == "basic") {
            switch (step) {
                case 1:
                    $state.go("basicstep1");
                    break;
                case 2:
                    var next = true;
                    if ($scope.AccountsStepData.email == "")
                        next = false;
                    if ($scope.AccountsStepData.newpassword != "" && $scope.AccountsStepData.newconfirmpassword != $scope.AccountsStepData.newpassword)
                        next = false;
                    if (next) {
                        $scope.AccountsStepData.customizeemails = $scope.AccountsStepData.customizeemails ? $scope.AccountsStepData.customizeemails : [{ "acceptance": { "title": "ACCEPTANCE  EMAIL", "subject": "", "body": "" }, "decline": { "title": "DECLINE  EMAIL", "subject": "", "body": "" } }];
                        SessionService.createAdminUser($scope.AccountsStepData);
                        $state.go("basicstep2");
                    } else
                        return;
                    break;
                case 3:
                    SessionService.createAdminUser($scope.AccountsStepData);
                    $state.go("basicstep3");
                    break;
            }
        }

        if (type == "channel") {
            switch (step) {
                case 1:
                    $state.go("channelstep1");
                    break;
                case 2:
                    SessionService.createAdminUser($scope.AccountsStepData);
                    $state.go("channelstep2");
                    break;
                case 3:
                    var next = true;
                    if ($scope.AccountsStepData.price == "" || $scope.AccountsStepData.price == undefined)
                        next = false;

                    if (next) {
                        $scope.AccountsStepData.postData = $scope.AccountsStepData.postData ? $scope.AccountsStepData.postData : {};
                        $scope.AccountsStepData.postData.background = $scope.AccountsStepData.postData.background ? $scope.AccountsStepData.postData.background : {};
                        SessionService.createAdminUser($scope.AccountsStepData);
                        $state.go("channelstep3");
                    } else
                        return;
                    break;
                case 4:
                    var templateLogo = $("#templateLogo").attr("src");
                    $scope.AccountsStepData.postData.logo.images = templateLogo;
                    $scope.AccountsStepData.premier =  $scope.AccountsStepData.premier ? $scope.AccountsStepData.premier:{};
                    $scope.AccountsStepData.premier.background = $scope.AccountsStepData.premier.background ? $scope.AccountsStepData.premier.background:{};
                    SessionService.createAdminUser($scope.AccountsStepData);

                    $state.go("channelstep4");
                    break;
                case 5:
                    var templateLogo = $("#templatepremierLogo").attr("src");
                    $scope.AccountsStepData.premier.logo.images = templateLogo;
                    if($scope.AccountsStepData.availableSlots==undefined)
                    $scope.AccountsStepData.availableSlots=defaultAvailableSlots;
                    SessionService.createAdminUser($scope.AccountsStepData);
                    $state.go("channelstep5");
                    break;

                case 6:
                    var templateLogo = $("#templatepremierLogo").attr("src");
                    $scope.AccountsStepData.premier.logo.images = templateLogo;
                    SessionService.createAdminUser($scope.AccountsStepData);
                    $state.go("channelstep6");
                    break;
            }
        }
    }

    $scope.isValidEmailAddress = function(emailAddress) {
        var pattern = /^([a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+(\.[a-z\d!#$%&'*+\-\/=?^_`{|}~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]+)*|"((([ \t]*\r\n)?[ \t]+)?([\x01-\x08\x0b\x0c\x0e-\x1f\x7f\x21\x23-\x5b\x5d-\x7e\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|\\[\x01-\x09\x0b\x0c\x0d-\x7f\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))*(([ \t]*\r\n)?[ \t]+)?")@(([a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\d\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.)+([a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]|[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF][a-z\d\-._~\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]*[a-z\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])\.?$/i;
        return pattern.test(emailAddress);
    };

    $scope.addBackGroundImage = function(image, step) {
      console.log(step);

        if (step == 3) {
            // $scope.AccountsStepData.postData = $scope.AccountsStepData.postData ? $scope.AccountsStepData.postData : {};
            // $scope.AccountsStepData.postData.background = $scope.AccountsStepData.postData.background ? $scope.AccountsStepData.postData.background : {};
            $scope.AccountsStepData.postData.background.images = image;
            $scope.AccountsStepData.postData.background.blur = 0;
        } else if (step == 4) {
            // $scope.AccountsStepData.premier = $scope.AccountsStepData.premier ? $scope.AccountsStepData.premier : {};
            // $scope.AccountsStepData.premier.background = $scope.AccountsStepData.premier.background ? $scope.AccountsStepData.postData.background : {};
            $scope.AccountsStepData.premier.background.images = image;
            $scope.AccountsStepData.premier.background.blur = 0;
        }
    }

    $scope.soundcloudLogin = function() {

        if ($scope.AccountsStepData.submissionData == undefined)
            $scope.AccountsStepData.submissionData = {};

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
                    console.log(user);
                    $scope.AccountsStepData.submissionData = user.config.data.soundcloudInfo;

                    var url = $scope.AccountsStepData.submissionData.username + '.artistsunlimited.com/submit';
                    $scope.AccountsStepData.submissionData.submitURL = url;
                    $scope.AccountsStepData.submissionData.userId = user.data._id;
                    SessionService.createAdminUser($scope.AccountsStepData);
                });
            })
            .then(null, function(err) {
                $.Zebra_Dialog('Error: Could not log in');
                $scope.processing = false;
            });
    };


    $scope.appendBody = function(btn) {
        if ($('.selectedBox').length) {
            var boxIndex = $('.selectedBox').attr("index");
            var cursorPos = $('.selectedBox').prop('selectionStart');
            var v = $('.selectedBox').val();
            var textBefore = v.substring(0, cursorPos);
            var textAfter = v.substring(cursorPos, v.length);
            var newtext = textBefore + btn.appendText + textAfter;

            if ($('.selectedBox').hasClass("decline")) {
                $scope.AccountsStepData.customizeemails[boxIndex].decline.body = newtext;
            } else if ($('.selectedBox').hasClass("acceptance")) {
                $scope.AccountsStepData.customizeemails[boxIndex].acceptance.body = newtext;
            }
            $('textarea').removeClass("selectedBox");
            SessionService.createAdminUser($scope.AccountsStepData);
        }
    }

    $scope.sendTrailAmount = function() {
        var amountEmail = $scope.AccountsStepData.paypal.email;
        if ($scope.isValidEmailAddress(amountEmail)) {
            var amount1 = $scope.generateRandomNumber();
            var amount2 = $scope.generateRandomNumber();
            $scope.AccountsStepData.paypal.amount1 = amount1;
            $scope.AccountsStepData.paypal.amount2 = amount2;
            console.log(amountEmail + '=======' + amount1 + '========' + amount2);
        }
    }

    $scope.setSlotStyle = function(day,hour){
      if (!$scope.AccountsStepData.availableSlots.length){
        $scope.AccountsStepData.availableSlots=defaultAvailableSlots;
      }

      var style = {};
      if ($scope.AccountsStepData.availableSlots!=undefined ){
        if($scope.AccountsStepData.availableSlots[daysArray[day]]!=undefined && $scope.AccountsStepData.availableSlots[daysArray[day]].indexOf(hour) > -1)
          style = {'background-color': "#fff", 'border-color': "#999"};
      }
      return style;
    }

    $scope.clickedSlotsave = function(day, hour) {

      var pushhour = parseInt(hour);
      if ($scope.AccountsStepData.availableSlots!=undefined && $scope.AccountsStepData.availableSlots[daysArray[day]].indexOf(pushhour) > -1){
        $scope.AccountsStepData.availableSlots[daysArray[day]].splice($scope.AccountsStepData.availableSlots[daysArray[day]].indexOf(pushhour), 1);
      }else if($scope.AccountsStepData.availableSlots!=undefined){
        
        $scope.AccountsStepData.availableSlots[daysArray[day]].push(pushhour);
      }      
    }
});
