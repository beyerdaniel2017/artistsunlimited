app.directive('adminsettings', function($http) {
  return {
    templateUrl: 'js/common/directives/settings/adminSettings.html',
    restrict: 'E',
    scope: false,
    controller: function adminSettingsController($rootScope, $state, $scope, $http, $window, AccountSettingServices, SessionService) {
    	$scope.stepButton = [{
	     "name": "TRACK TITLE WITH LINK", 
	     "appendText": " {TRACK_TITLE_WITH_LINK} " 
	    },
	    { 
	      "name": "SUBMITTERS EMAIL", 
	      "appendText": " {SUBMITTERS_EMAIL} " 
	    },
	    { 
	      "name": "TRACK TITLE", 
	      "appendText": " {TRACK_TITLE} " 
	    },
	    { 
	      "name": "TRACK ARTIST WITH LINK", 
	      "appendText": " {TRACK_ARTIST_WITH_LINK} " 
	    },
	    { 
	      "name": "TRACK ARTIST", 
	      "appendText": " {TRACK_ARTIST} " 
	    },
	    { 
	      "name": "TRACK ARTWORK", 
	      "appendText": " {TRACK_ARTWORK} " 
	    },
	    { 
	      "name": "SUBMITTED TO ACCOUNT NAME", 
	      "appendText": " {SUBMITTED_TO_ACCOUNT_NAME} " 
	    },
	    { 
	      "name": "SUBMITTED ACCOUNT NAME WITH LINK", 
	      "appendText": " {SUBMITTED_ACCOUNT_NAME_WITH_LINK} " 
	    },
	    { 
	      "name": "ACCEPTED CHANNEL LIST", 
	      "appendText": " {ACCEPTED_CHANNEL_LIST} " 
	    },
	    { 
	      "name": "ACCEPTED CHANNEL LIST WITH LINK", 
	      "appendText": " {ACCEPTED_CHANNEL_LIST_WITH_LINK} " },
	    { 
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

	      if(window.location.href.indexOf('admin/basic/step1#generalInfo') != -1)
	      {
	        $('.nav-tabs a[href="#generalInfo"]').tab('show');
	      }else if(window.location.href.indexOf('admin/basic/step1#sce') != -1)
	      {
	      	$('.nav-tabs a[href="#sce"]').tab('show');
	      }else if(window.location.href.indexOf('admin/basic/step1#sce') != -1)
	      {
	      	 $('.nav-tabs a[href="#sce"]').tab('show');
	      }else if(window.location.href.indexOf('admin/basic/step1#psce') != -1)
	      {
	      	 $('.nav-tabs a[href="#psce"]').tab('show');
	      }else if(window.location.href.indexOf('admin/basic/step1#notifications') != -1)
	      {
	      	 $('.nav-tabs a[href="#notifications"]').tab('show');
	      }else if(window.location.href.indexOf('admin/basic/step1#paypalInfo') != -1)
	      {
	      	 $('.nav-tabs a[href="#paypalInfo"]').tab('show');
	      }

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
	                SessionService.createAdminUser($scope.AccountsStepData);
	                $.Zebra_Dialog('Changes saved successfully.');
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
	          $.Zebra_Dialog('Changes saved successfully.');
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
	          $.Zebra_Dialog('Changes saved successfully.');
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
	            $.Zebra_Dialog('Changes saved successfully.');
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
              $.Zebra_Dialog('Changes saved successfully.');
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
	                  $.Zebra_Dialog('Changes saved successfully.');
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
	              $.Zebra_Dialog('Changes saved successfully.');
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
	                $.Zebra_Dialog('Changes saved successfully.');
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
	            $.Zebra_Dialog('Changes saved successfully.');
	            break;
      			case 7:
	            SessionService.removeAccountusers($scope.AccountsStepData);
	            $state.go("accounts");
	            break; 
    			}
    		}
    	}

	    $scope.appendBody = function(btn, type) {
	    	var ids = "#sce";
	    	if(type=="premier")
	          ids = "#psce";
	        if ($(ids).find('.selectedBox').length) {
	        var boxIndex = $(ids).find('.selectedBox').attr("index");
	        var cursorPos = $(ids).find('.selectedBox').prop('selectionStart');
	        var v = $(ids).find('.selectedBox').val();
	        var textBefore = v.substring(0, cursorPos);
	        var textAfter = v.substring(cursorPos, v.length);
	        var newtext = textBefore + btn.appendText + textAfter;
	       
	        if (type == "repost") {
	          if ($(ids).find('.selectedBox').hasClass("declinebox")) {
	            $scope.AccountsStepData.repostCustomizeEmails[boxIndex].decline.body = newtext;
	          } else if ($(ids).find('.selectedBox').hasClass("acceptancebox")) {
	            $scope.AccountsStepData.repostCustomizeEmails[boxIndex].acceptance.body = newtext;
	          }
	        } else {
	          if ($(ids).find('.selectedBox').hasClass("declinebox")) {
	            $scope.AccountsStepData.premierCustomizeEmails[boxIndex].decline.body = newtext;
	          } else if ($(ids).find('.selectedBox').hasClass("acceptancebox")) {
	            $scope.AccountsStepData.premierCustomizeEmails[boxIndex].acceptance.body = newtext;
	          }
	        }
	        $(ids).find('textarea').removeClass("selectedBox");
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
		}
  }
})