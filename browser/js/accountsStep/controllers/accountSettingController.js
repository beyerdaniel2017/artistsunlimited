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
        } else
            $scope.AccountsStepData = SessionService.getAdminUser();
    } else if (formActions == "Add") {
        $scope.AccountsStepData = SessionService.getAdminUser() ? SessionService.getAdminUser() : {};
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
                    $scope.AccountsStepData.submissionData.username = res.data.user.username;
                    $scope.AccountsStepData.submissionData.avatarURL = res.data.user.avatarURL;
                    $scope.AccountsStepData.submissionData.followers = res.data.user.followers;
                    $scope.AccountsStepData.submissionData.userID = res.data.userID;
                    userId = res.data.userID;
                    $scope.AccountsStepData.price = res.data.price;
                    $scope.AccountsStepData.description = res.data.description;
                    if (res.data.availableSlots) {
                        $scope.AccountsStepData.availableSlots = res.data.availableSlots;
                    } else {
                        $scope.AccountsStepData.availableSlots = {
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
                                if (response.data.availableSlots) {
                                    $scope.AccountsStepData.availableSlots = response.data.availableSlots;
                                } else {
                                    $scope.AccountsStepData.availableSlots = {
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

    $scope.stepButton = [{
        "name": "SONG URL",
        "appendText": " {SONGURL} "
    }, {
        "name": "EMAIL",
        "appendText": " {EMAIL} "
    }, {
        "name": "SONG NAME",
        "appendText": " {SONGNAME} "
    }, {
        "name": "ARTIST",
        "appendText": " {ARTIST} "
    }, {
        "name": "NAME",
        "appendText": " {NAME} "
    }, {
        "name": "NAME OF TRACK",
        "appendText": " {NAMEOFTRACK} "
    }, {
        "name": "TRACK COVER ART",
        "appendText": " {TRACKCOVERART} "
    }, {
        "name": "SUBMITTED CHANNEL",
        "appendText": " {SUBMITTEDCHANNEL} "
    }, {
        "name": "ACCEPTED CHANNEL LIST",
        "appendText": " {ACCEPTEDCHANNELLIST} "
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

    $scope.addEventClass = function(index, type) {
        $('textarea').removeClass("selectedBox");
        $("." + type).addClass("selectedBox");
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
                        $.Zebra_Dialog('Mail sent successfully.');
                    }
                })
                .catch(function() {
                    if (res.data.success) {
                        $scope.showTestEmailModal = false;
                        $('#emailModal').modal('hide');
                        $.Zebra_Dialog('Error in sending mail.');
                    }
                })
        }
    }

    $scope.closeModal = function() {
        $scope.showTestEmailModal = false;
        $('#emailModal').modal('hide');
    }

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
                                            "title": "ACCEPTANCE  EMAIL",
                                            "subject": "Congratulations on your Submission -",
                                            "body": "Hey {NAME}!\n\nFirst of all thank you so much for submitting your track The Story of Future R&B to us! We checkedout your submission and our team was absolutely grooving with the track and we believe it’s ready to be reposted and shared by channels on our network. All you need to do is click the button below.\nTo maintain our feed’s integrity, we do not offer more than one repost of the approved track per channel. With that said, if you are interested in more extensive PR packages and campaigns that guarante eanywhere from 25,000 to 300,000 plays and corresponding likes/reposts depending on your budget please send us an email @ artistsunlimited.pr@gmail.com. We thoroughly enjoyed listening to your production and we hope that in the future you submit your music to our network. Keep working hard and putting your heart into your art, we will be here to help you with the rest.\nAll the best,\n\nEdward Sanchez\nPeninsula MGMT Team\nwww.facebook.com/edwardlatropical\n",
                                            "buttonText": "Accept",
                                            "buttonBgColor": "#592e2e"
                                        },
                                        "decline": {
                                            "title": "DECLINE  EMAIL",
                                            "subject": "Music Submission",
                                            "body": "Hey {NAME},\n\nFirst of all thank you so much for submitting your track <a href='{SONGURL}'>{SONGNAME}</a> to us! We checked out your submission and our team doesn’t think the track is ready to be reposted and shared by our channels. With that being said, do not get discouraged as many names that are now trending on SoundCloud have once submitted music to us and others that we’re at one point rejected. There is only 1 secret to success in the music industry and it’s looking as deep as you can into yourself and express what you find to be most raw. Don’t rush the art, it will come.\n\n We look forward to hearing your future compositions and please remember to submit them at <a href='https://artistsunlimited.com/submit'>Artists Unlimited</a>.\n\nGoodluck and stay true to the art,\n\nEdward Sanchez\n Peninsula MGMT Team \nwww.facebook.com/edwardlatropical",
                                            "buttonText": "Decline",
                                            "buttonBgColor": "#592e2e"
                                        }
                                    }]);
                                    setTimeout(function() {
                                        SessionService.createAdminUser($scope.AccountsStepData);
                                        $state.go("basicstep2");
                                    }, 500);
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
                    $scope.AccountsStepData.premierCustomizeEmails = (($scope.AccountsStepData.premierCustomizeEmails.length > 0) ? $scope.AccountsStepData.premierCustomizeEmails : [{
                        "acceptance": {
                            "title": "ACCEPTANCE  EMAIL",
                            "subject": "Congratulations on your Submission -",
                            "body": "Hey {NAME}!\n\nFirst of all thank you so much for submitting your track The Story of Future R&B to us! We checkedout your submission and our team was absolutely grooving with the track and we believe it’s ready to be reposted and shared by channels on our network. All you need to do is click the button below.\nTo maintain our feed’s integrity, we do not offer more than one repost of the approved track per channel. With that said, if you are interested in more extensive PR packages and campaigns that guarante eanywhere from 25,000 to 300,000 plays and corresponding likes/reposts depending on your budget please send us an email @ artistsunlimited.pr@gmail.com. We thoroughly enjoyed listening to your production and we hope that in the future you submit your music to our network. Keep working hard and putting your heart into your art, we will be here to help you with the rest.\nAll the best,\n\nEdward Sanchez\nPeninsula MGMT Team\nwww.facebook.com/edwardlatropical\n",
                            "buttonText": "Accept",
                            "buttonBgColor": "#592e2e"
                        },
                        "decline": {
                            "title": "DECLINE  EMAIL",
                            "subject": "Music Submission",
                            "body": "Hey {NAME},\n\nFirst of all thank you so much for submitting your track <a href='{SONGURL}'>{SONGNAME}</a> to us! We checked out your submission and our team doesn’t think the track is ready to be reposted and shared by our channels. With that being said, do not get discouraged as many names that are now trending on SoundCloud have once submitted music to us and others that we’re at one point rejected. There is only 1 secret to success in the music industry and it’s looking as deep as you can into yourself and express what you find to be most raw. Don’t rush the art, it will come.\n\n We look forward to hearing your future compositions and please remember to submit them at <a href='https://artistsunlimited.com/submit'>Artists Unlimited</a>.\n\nGoodluck and stay true to the art,\n\nEdward Sanchez\n Peninsula MGMT Team \nwww.facebook.com/edwardlatropical",
                            "buttonText": "Decline",
                            "buttonBgColor": "#592e2e"
                        }
                    }]);
                    SessionService.createAdminUser($scope.AccountsStepData);
                    $state.go("basicstep3");
                    break;
                case 4:
                    AccountSettingServices.updateAdminProfile({
                            premierCustomizeEmails: $scope.AccountsStepData.premierCustomizeEmails
                        })
                        .then(function(res) {
                            $scope.processing = false;
                        })
                        .catch(function() {});

                    SessionService.createAdminUser($scope.AccountsStepData);
                    $state.go("basicstep4");
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
                    SessionService.createAdminUser($scope.AccountsStepData);
                    $state.go("basicstep5");
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
                    $state.go("channelstep2");
                    break;
                case 3:
                    var next = true;
                    if ($scope.AccountsStepData.price == "" || $scope.AccountsStepData.price == undefined) {
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
                                $state.go("channelstep3");
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
                            $state.go("channelstep4");
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
                            $state.go("channelstep5");
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
                    SessionService.removeAccountusers($scope.AccountsStepData);
                    $state.go("accounts");
                    break;
            }
        }
    }

    $scope.addGroup = function(val) {
        $scope.group = "";
        $("#group").val('');
        if ($scope.AccountsStepData.submissionData.groups == undefined)
            $scope.AccountsStepData.submissionData.groups = [];

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

    // $scope.addBackGroundImage = function(image, step) {
    //   console.log(step);

    //     if (step == 3) {
    //         $scope.AccountsStepData.postData.background.images = image;
    //         $scope.AccountsStepData.postData.background.blur = 0;
    //     } else if (step == 4) {
    //         $scope.AccountsStepData.premier.background.images = image;
    //         $scope.AccountsStepData.premier.background.blur = 0;
    //     }
    // }

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
        if ($scope.AccountsStepData.submissionData == undefined)
            $scope.AccountsStepData.submissionData = {};

        $scope.processing = true;
        SC.connect().then(function(res) {
                $rootScope.accessToken = res.oauth_token;
                return $http.post('/api/login/soundCloudAuthentication', {
                    token: res.oauth_token
                });
            })
            .then(function(res) {
                var scInfo = {};
                scInfo.userID = res.data.user._id;
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
                            var usernames = res.data.user.soundcloud.username.replace(" ", "");
                            var url = 'https://artistsunlimited.com/custom/' + usernames + '/submit';
                            var premierurl = 'https://artistsunlimited.com/custom/' + usernames + '/premiere';
                            AccountSettingServices.checkUsercount({
                                    "url": url,
                                    'action': "url"
                                })
                                .then(function(result) {
                                    if (result.data) {
                                        url = 'https://artistsunlimited.com/custom/' + usernames + '/submit' + result.data;
                                        premierurl = 'https://artistsunlimited.com/custom/' + usernames + '/premiere' + result.data;
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
                                })
                                .catch(function() {});
                        } else {
                            $.Zebra_Dialog('Error: This user already exists');
                            $scope.processing = false;
                            location.reload();
                        }
                    });
            })
            .then(null, function(err) {
                $.Zebra_Dialog('Error: Could not log in');
                $scope.processing = false;
            });
    };

    $scope.appendBody = function(btn, type) {
        if ($('.selectedBox').length) {
            var boxIndex = $('.selectedBox').attr("index");
            var cursorPos = $('.selectedBox').prop('selectionStart');
            var v = $('.selectedBox').val();
            var textBefore = v.substring(0, cursorPos);
            var textAfter = v.substring(cursorPos, v.length);
            var newtext = textBefore + btn.appendText + textAfter;
            if (type == "repost") {
                if ($('.selectedBox').hasClass("declinebox")) {
                    $scope.AccountsStepData.repostCustomizeEmails[boxIndex].decline.body = newtext;
                } else if ($('.selectedBox').hasClass("acceptancebox")) {
                    $scope.AccountsStepData.repostCustomizeEmails[boxIndex].acceptance.body = newtext;
                }
            } else {
                if ($('.selectedBox').hasClass("declinebox")) {
                    $scope.AccountsStepData.premierCustomizeEmails[boxIndex].decline.body = newtext;
                } else if ($('.selectedBox').hasClass("acceptancebox")) {
                    $scope.AccountsStepData.premierCustomizeEmails[boxIndex].acceptance.body = newtext;
                }
            }
            $('textarea').removeClass("selectedBox");
            SessionService.createAdminUser($scope.AccountsStepData);
        }
    }

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
                })
                .catch(function() {});
            $scope.processing = false;
        } else {
            $scope.errorverification = true;
            $scope.processing = false;
        }
    }

    $scope.setSlotStyle = function(day, hour) {

        // if (!$scope.AccountsStepData.availableSlots.length) {
        //     $scope.AccountsStepData.availableSlots = defaultAvailableSlots;
        // }
        var style = {};
        if ($scope.AccountsStepData.availableSlots != undefined) {
            if ($scope.AccountsStepData.availableSlots[daysArray[day]] != undefined && $scope.AccountsStepData.availableSlots[daysArray[day]].indexOf(hour) > -1)
                style = {
                    'background-color': "#fff",
                    'border-color': "#999"
                };
        }
        return style;
    }

    $scope.tooManyReposts = function(day, hour) {
        var startDayInt = (day + 6) % 7;
        var allSlots = []
        var wouldBeSlots = JSON.parse(JSON.stringify($scope.AccountsStepData.availableSlots));
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
            if (checkingSlots.length > 8) {
                console.log('errorSlots');
                console.log(checkingSlots);
                status = true;
            }
        })
        return status;
    }

    $scope.clickedSlotsave = function(day, hour) {
        var pushhour = parseInt(hour);

        if ($scope.AccountsStepData.availableSlots != undefined && $scope.AccountsStepData.availableSlots[daysArray[day]].indexOf(pushhour) > -1) {
            $scope.AccountsStepData.availableSlots[daysArray[day]].splice($scope.AccountsStepData.availableSlots[daysArray[day]].indexOf(pushhour), 1);
        } else if ($scope.tooManyReposts(day, hour)) {
            $.Zebra_Dialog("Cannot enable slot. We only allow 8 reposts within 24 hours to prevent you from being repost blocked.");
            return;
        } else if ($scope.AccountsStepData.availableSlots != undefined) {
            $scope.AccountsStepData.availableSlots[daysArray[day]].push(pushhour);
        }
    }
});