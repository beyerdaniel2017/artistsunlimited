app.directive('channelsettings', function($http) {
  return {
    templateUrl: 'js/common/directives/settings/channelSettings.html',
    restrict: 'E',
    scope: false,
    controller: function channelSettingsController($rootScope, $state, $scope, $http, $window, AccountSettingServices, SessionService) {
	   var commentIndex = 0;
	   $scope.saveRepostSettings = function(type) {
	    if(type == 'paid'){
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
      	window.location.href = window.location.origin + "/admin/accounts";
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
	    
	  $scope.choseTrack = function(track) {
	    $scope.newQueue = track;
	    $scope.newQueueID = track.id;
	  }
	  $scope.trackListChange = function(item) {
	    $scope.newQueueSong = $scope.trackListObj.permalink_url;
	    $scope.choseTrack(item)
	  };
	  $scope.getTrackListFromSoundcloud = function() {
	    if ($scope.AccountsStepData.submissionData) {
	      var id = $scope.AccountsStepData.submissionData.id ? $scope.AccountsStepData.submissionData.id : $scope.AccountsStepData.submissionData.user.id;
	      $scope.processing = true;
	      SC.get('/users/' + id + '/tracks', {
	        filter: 'public'
	      })
	      .then(function(tracks) {
	        $scope.trackList = tracks;
	        $scope.processing = false;
	        $scope.$apply();
	      })
	      .catch(function(response) {
	        $scope.processing = false;
	        $scope.$apply();
	      });
	    }
	  }
	  $scope.removeQueueSong = function(index) {
	    $scope.AccountsStepData.queue.splice(index, 1);
	    $http.put('/api/database/updateRepostSettings', {
	      queue: $scope.AccountsStepData.queue,
	      id: $scope.AccountsStepData.submissionData.userID
	    }).then(function(res) {
	      SessionService.createAdminUser($scope.AccountsStepData);
	    });
	    $scope.loadQueueSongs();
	  }

	  $scope.addSong = function() {
				if ($scope.AccountsStepData.queue == undefined) {
	      $scope.AccountsStepData.queue=[]   
	    }
	                     
	    if ($scope.AccountsStepData.queue.indexOf($scope.newQueueID) != -1) return;
	      $scope.AccountsStepData.queue.push($scope.newQueueID);
	      $http.put('/api/database/profile', {
	        queue: $scope.AccountsStepData.queue,
	        _id: $scope.AccountsStepData.submissionData.userID
	      }).then(function(res) {
	        SessionService.createAdminUser($scope.AccountsStepData);
	      });
	      $scope.newQueueSong = undefined;
	      $scope.trackListObj = "";
	      $scope.newQueue = undefined;
	      $scope.loadQueueSongs();
	    }

	    $scope.saveUser = function() {
        $scope.processing = true;
        $http.put("/api/database/profile", { queue: $scope.AccountsStepData.queue,
	        _id: $scope.AccountsStepData.submissionData.userID})
          .then(function(res) {
            SessionService.create(res.data);
            $scope.user = SessionService.getUser();
            $scope.processing = false;
          })
          .then(null, function(err) {
            $.Zebra_Dialog("Error: did not save");
            $scope.processing = false;
          });
      	}
        
        /*sort start*/
     	var tmpList = []; 
     	$scope.sortingLog = [];
     	$scope.sortableOptions = {
      	update: function(e, ui) {
	        var logEntry = tmpList.map(function(i){
	          return i.id;
	        });
	        $scope.AccountsStepData.queue = [];
	        $scope.sortingLog.push('Update: ' + logEntry);
	        $scope.AccountsStepData.queue = logEntry;
	        //$scope.saveUser();
	      },
	      stop: function(e, ui) {
	        // this callback has the changed model
	        var logEntry = tmpList.map(function(i){
	          return i.id;
	        });
	        $scope.AccountsStepData.queue = [];
	        $scope.sortingLog.push('Stop: ' + logEntry);
	        $scope.AccountsStepData.queue = logEntry;
         	$scope.saveUser();
	      }
	    };
      	/*sort end*/
	    $scope.loadQueueSongs = function(queue) {      
	   setTimeout(function(){
			if ($scope.AccountsStepData.queue == undefined) {
	        	$scope.AccountsStepData.queue=[];  
	      }
	      var i = 0;
	      $scope.autoFillTracks = [];
	      $scope.AccountsStepData.queue.forEach(function(songID) {
	        SC.get('/tracks/' + songID)
	        .then(function(track) {
	          $scope.autoFillTracks.push(track);
	            i++;
	            tmpList = $scope.autoFillTracks;
	            $scope.list = tmpList;
	          $scope.$digest();
	        }, console.log);
	      })
	   }, 3000);
	    
	    }
	    $scope.loadQueueSongs();
	    $scope.choseAutoFillTrack = function(track) {
	        $scope.searchString = track.title;
	        $scope.newQueueID = track.id;
	        $scope.addSong();
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
	      if ($scope.AccountsStepData.submissionData.groups == undefined){
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
	      if ($scope.AccountsStepData.submissionData == undefined){
	        $scope.AccountsStepData.submissionData = {};
	      }
	      $scope.processing = true;
	      SC.connect().then(function(res) {
	        $rootScope.accessToken = res.oauth_token;
	        return $http.post('/api/login/soundCloudAuthentication', {
	          token: res.oauth_token
	        });
	      })
	      .then(function(res) {
	      	var price = (res.data.user.soundcloud.followers)/3000;
                $scope.AccountsStepData.price = parseInt(price);
	        var scInfo = {};
	        scInfo.userID = res.data.user._id;
	        $scope.paidRepostId = res.data.user._id;
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
	            var url = window.location.origin + '/' + usernames + '/submit';
	            var premierurl = window.location.origin +'/' + usernames + '/premiere';
	            AccountSettingServices.checkUsercount({
	              "url": url,
	              'action': "url"
	            })
	            .then(function(result) {
	              if (result.data) {
	                url = window.location.origin + '/' +usernames + '/submit/' + result.data;
	                premierurl = window.location.origin + '/' + usernames + '/premiere/' + result.data;
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

			$scope.isPaidRepost = function() {
				if ($scope.AccountsStepData.formActions == 'Edit') {
	          $scope.activeTab = ['submissionUrl','setPrice','customSubmission','customPremiereSubmission','repostPreferences','manageReposts'];
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
              SessionService.createAdminUser($scope.AccountsStepData);
                $scope.activeTab.push('setPrice');
                 $('.nav-tabs a[href="#setPrice"]').tab('show');
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
	              	$scope.activeTab.push('customSubmission');
	              	$('.nav-tabs a[href="#customSubmission"]').tab('show');
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
	              type: 'submit',
	              background: $scope.AccountsStepData.postData.background,
	              logo: $scope.AccountsStepData.postData.logo,
	              heading: $scope.AccountsStepData.postData.heading,
	              subHeading: $scope.AccountsStepData.postData.subHeading,
	              inputFields: $scope.AccountsStepData.postData.inputFields,
	              button: $scope.AccountsStepData.postData.button
	            })
	            .then(function(res) {
	              $scope.activeTab.push('customPremiereSubmission');
	              $('.nav-tabs a[href="#customPremiereSubmission"]').tab('show');
	              SessionService.createAdminUser($scope.AccountsStepData);
	              $.Zebra_Dialog('Changes saved successfully.');
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
	              button: $scope.AccountsStepData.premier.button
	            })
	            .then(function(res) {
	              if ($scope.AccountsStepData.availableSlots == undefined) $scope.AccountsStepData.availableSlots = defaultAvailableSlots;
	                SessionService.createAdminUser($scope.AccountsStepData);
	                $scope.activeTab.push('repostPreferences');
	                $('.nav-tabs a[href="#repostPreferences"]').tab('show');
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
	              $scope.AccountsStepData.queue = res.data.queue;
	              $scope.loadQueueSongs();
	              $scope.activeTab.push('manageReposts');
	              $('.nav-tabs a[href="#manageReposts"]').tab('show');

	            })
	            .catch(function() {});
	            $.Zebra_Dialog('Changes saved successfully.');
	            break;
      			case 7:
	            SessionService.removeAccountusers($scope.AccountsStepData);
	           // $state.go("accounts");
	            break; 
    			}
    		}
    	}
        
			$scope.openModal = function(type) {
		  if (type==='paid'){
		    $('#paidCommentModal').modal('show');
		  }
		}

	    $scope.setSlotStyle = function(day, hour) {
	      var style = {};
	      if ($scope.AccountsStepData.availableSlots != undefined) {
	        if ($scope.AccountsStepData.availableSlots[daysArray[day]] != undefined && $scope.AccountsStepData.availableSlots[daysArray[day]].indexOf(hour) > -1){
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
    }
   }
});