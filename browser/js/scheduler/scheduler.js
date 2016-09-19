app.config(function($stateProvider) {
  $stateProvider.state('scheduler', {
    url: '/admin/scheduler',
    templateUrl: 'js/scheduler/scheduler.html',
    controller: 'adminSchedulerController',
    resolve: {
      paidReposts: function($http, $window, SessionService) {
        if (!SessionService.getUser()) {
          $window.localStorage.setItem('returnstate', 'scheduler');
          $window.location.href = '/admin';
        }
        return $http.get('/api/users/getUserPaidRepostAccounts')
        .then(function(res) {
          if(res.data.length >0){
            var PaidUserId = SessionService.addActionsfoAccountIndexSRD();
            if(res.data[0]!=undefined && (PaidUserId==null || PaidUserId==undefined || PaidUserId=="undefined")){
              SessionService.addActionsfoAccount('BehalfUser',res.data[0]._id,res.data[0].soundcloud.id);
              SessionService.setUserPaidRepostAccounts(res.data[0]);
            }
          }          
          return res.data;
        })
        .then(null, function(err) {
          $.Zebra_Dialog("error getting the paidReposts");
          return;
        })
      },
      events: function($http, paidReposts, SessionService) {       
        if(paidReposts.length > 0){
          var soundcloudId = SessionService.getSoundCloudId();
          return $http.get('/api/events/forUser/' + soundcloudId)
          .then(function(res) {
            return res.data;
          })
          .then(null, function(err) {
            $.Zebra_Dialog("error getting your events");
            return;
          })
        }   
        else{
          return [];
        }
      }
    }
  });
});

app.controller('adminSchedulerController', function($rootScope, $state, $scope, $http, AuthService, SessionService, $window, paidReposts, events) {
  if (!SessionService.getUser()) {
    $state.go('admin');
  }
  $scope.isLoggedIn = SessionService.getUser() ? true : false;
  $scope.searchString = "";
  var formActions = SessionService.getActionsfoAccount();
  var PaidUserId = SessionService.addActionsfoAccountIndexSRD();
  var soundcloudId = SessionService.getSoundCloudId();
  $scope.paidUsers=[];
  paidReposts.forEach(function(pr){
    $scope.paidUsers.push(pr);
  })
  
  // if(PaidUserId!=undefined && formActions!=undefined && $scope.paidUsers.length>0 && soundcloudId!=undefined){
  //   $http.get('/api/events/forUser/' + soundcloudId,function(error,res){
  //     if(res){
  //       events = [];
  //       events = res.data;
  //     }
  //   });
  // }
  // else
  if(PaidUserId==undefined && formActions==undefined && $scope.paidUsers.length>0){
    PaidUserId= $scope.paidUsers[0]._id;
  } 
  
  if($scope.paidUsers.length==0){
    $.Zebra_Dialog('Error: There is no any user record found.');
    return;
  }
  $scope.paidusersId = PaidUserId;

  $scope.user = SessionService.getUserPaidRepostAccounts(PaidUserId);

  $scope.paidusersRec = $scope.user;

  $scope.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  var daysArray = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  $scope.currentDate = new Date();
  $scope.dateCompare = getshortdate($scope.currentDate);
  $scope.time = formatAMPM($scope.currentDate);
  $scope.showEmailModal = false;
  $scope.makeEventURL = "";
  $scope.showOverlay = false;
  $scope.processiong = false;
  events.forEach(function(ev) {
    ev.day = new Date(ev.day);
  });
  $scope.events = events;
  
  $scope.hideall = false;
  $scope.itemview = "calender";
  $scope.dayIncr = 0;
  $scope.listDayIncr = 0;
  $scope.eventDate = new Date();
  $scope.autoFillTracks = [];
  $scope.trackList = [];
  $scope.trackListObj = null;
  $scope.trackListSlotObj = null;
  $scope.newQueueSong = "";
  $scope.trackArtistID = 0;
  $scope.trackType = "";
  $scope.timeGap = '1';
  $scope.otherChannels = {};
  $scope.listevents = [];
  $scope.tabSelected = true;
  $scope.listAvailableSlots = [];
  $scope.displayType = 'channel';
  $scope.paidCommentsArr = [];
  $scope.tradeCommentsArr = [];
  $scope.popup = false;
  $scope.selectedSlot = {};
  $scope.unrepostHours = 1;
  var commentIndex = 0;
  $scope.eventComment = ($scope.user.repostSettings!=undefined ? 
      (
        $scope.user.repostSettings.schedule && 
        $scope.user.repostSettings.schedule.comments && 
        $scope.user.repostSettings.schedule.comments.length > 0
       ? $scope.user.repostSettings.schedule.comments[0] : '') : '');
  var defaultAvailableSlots = {
    sunday: [],
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: []
  };
  $scope.searchStringVal="";
  $scope.channelArr = [];
  $scope.groupArr = [];
  $scope.selectedGroups = {};
  $scope.selectedChannel = {};
  $scope.uniqueGroup = [];

  for (var i = 0; i < $scope.user.paidRepost.length; i++) {
    $scope.user.paidRepost[i].groups.forEach(function(acc) {
      if (acc != "" && $scope.uniqueGroup.indexOf(acc) === -1) {
        $scope.uniqueGroup.push(acc);
      }
    });
  }

  $scope.linkedAccounts = [];

  $scope.getLinkedAccounts = function() {
    setTimeout(function() {
      var linked = $rootScope.userlinkedAccounts ? $rootScope.userlinkedAccounts:[];
      for (var i = 0; i < linked.length; i++) {
        if (linked[i]!=undefined && linked[i]._id != $scope.user._id) {
          $scope.linkedAccounts.push(linked[i]);
        }
      }
    }, 1000);
  }

  $scope.checkCommentEnable = function() {
    if ($scope.user.repostSettings!=undefined && $scope.user.repostSettings.schedule!=undefined) {
      if ($scope.user.repostSettings.schedule.comment == false) {
        $scope.disable = true;
        $scope.commentEvent = false;
        $scope.eventComment = "";
        $scope.commentSrc = 'assets/images/noComment.png';
      } else {
        $scope.disable = false;
        $scope.commentEvent = true;
        $scope.commentSrc = 'assets/images/comment.png';
      }
    }
  }
  $scope.checkLikeEnable = function() {
    if ($scope.user.repostSettings!=undefined && $scope.user.repostSettings.schedule!=undefined) {
      if ($scope.user.repostSettings.schedule.like == false) {
        $scope.likeSrc = 'assets/images/like.png';
        $scope.likeEvent = false;
      } else {
        $scope.likeSrc = 'assets/images/likeTrue.png';
        $scope.likeEvent = true;
      }
    }
  }
  $scope.changeLikeCommentIcons = function(type) {
    if (type == 'like') {
      if ($scope.likeSrc == 'assets/images/like.png') {
        $scope.likeSrc = 'assets/images/likeTrue.png';
        $scope.likeEvent = true;
      } else {
        $scope.likeSrc = 'assets/images/like.png';
        $scope.likeEvent = false
      }
    } else {
      if ($scope.commentSrc == 'assets/images/comment.png') {
        $scope.commentSrc = 'assets/images/noComment.png';
        $scope.commentEvent = false;
        $scope.disable = true;
        $scope.eventComment = "";
      } else {
        $scope.commentSrc = 'assets/images/comment.png';
        $scope.commentEvent = true;
        $scope.disable = false;
        commentIndex = 0;
        $scope.eventComment = $scope.user.repostSettings!=undefined ? $scope.user.repostSettings.schedule.comments[commentIndex]:"";
      }
    }
    //$scope.saveRepostSettings();
  }

  $scope.getPrevNextComment = function(type) {
    if($scope.user.repostSettings!=undefined){
    if (type == 'next') {
      if (commentIndex < $scope.user.repostSettings.schedule.comments.length - 1) {
        commentIndex = commentIndex + 1;
        $scope.searchStringVal.eventComment = $scope.user.repostSettings.schedule.comments[commentIndex];
      }
    } else {
      if (commentIndex >= 1) {
        commentIndex = commentIndex - 1;
        $scope.searchStringVal.eventComment = $scope.user.repostSettings.schedule.comments[commentIndex];
      }
    }
  }
  }

  $scope.saveRepostSettings = function() {
    $http.put('/api/database/updateRepostSettings', {
      repostSettings: $scope.user.repostSettings,
      id: $scope.user._id
    }).then(function(res) {
      //SessionService.create(res.data);
      //$scope.user = SessionService.getUser();
      SessionService.setUserPaidRepostAccounts(res.data);
      $scope.user = SessionService.getUserPaidRepostAccounts(PaidUserId);
      $scope.checkCommentEnable();
      $scope.checkLikeEnable();
    });
  }

  $scope.saveComments = function(value, type,index) {

    var comments = [];
    if (type == 'schedule' && value) {
      comments = ($scope.user.repostSettings.schedule.comments ? $scope.user.repostSettings.schedule.comments : []);
      if(index==undefined)
      comments.push(value);
      else
        comments[index] = value;

      $scope.user.repostSettings.schedule.comments = comments;
      $scope.saveRepostSettings();
      $scope.scheduleComment = "";
    } else if (type == 'trade' && value) {
      comments = ($scope.user.repostSettings.trade.comments ? $scope.user.repostSettings.trade.comments : []);
      if(index==undefined)
      comments.push(value);
      else
        comments[index] = value;
      $scope.user.repostSettings.trade.comments = comments;
      $scope.saveRepostSettings();
      $scope.tradeComment = "";
    }
    else{
      $.Zebra_Dialog("Please enter comment");
      return;
    }
  }

  $scope.editComments = function(comment, type,index) {
    $scope.scheduleCommentIndex=index;
    if (type == 'schedule') {
      $('#scheduleCommentModal').modal('show');      
      $scope.scheduleComment = comment;
    } else if (type == 'trade') {
      $('#tradeCommentModal').modal('show');
      $scope.tradeComment = comment;
    }
  }

  $scope.setActive = function(type) {
    $scope.displayType = type;
  }

  $scope.setChannel = function(value) {
    if ($scope.displayType == 'channel') {
      var index = $scope.channelArr.indexOf(value);
      if (index == -1) {
        $scope.channelArr.push(value);
      } else {
        $scope.channelArr.splice(index, 1);
      }
    }
    $scope.otherChannelsAndGroups();
    $scope.followersCount();
  }

  $scope.setGroup = function(value) {
    if ($scope.displayType == 'group') {
      var index = $scope.groupArr.indexOf(value);
      if (index == -1) {
        $scope.groupArr.push(value);
      } else {
        $scope.groupArr.splice(index, 1);
      }
    }
    $scope.otherChannelsAndGroups();
    $scope.followersCount();
  }

  function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = (hours < 10 ? hours : hours) + ':' + minutes + ampm;
    return strTime;
  }

  $scope.availableSlots = (($scope.user.availableSlots != undefined) ? $scope.user.availableSlots : defaultAvailableSlots);

  $scope.setView = function(view) {
    $scope.itemview = view;
    $scope.getListEvents();
  };

  $scope.trackChange = function(index) {
    $scope.makeEventURL = $scope.trackListSlotObj.permalink_url;
    $scope.changeURL();
  };

  $scope.showTab = function() {
    $scope.tabSelected = true;
  }

  $scope.addNewSong = function() {
    $scope.isEdit = false;
    $scope.tabSelected = false;
    $scope.makeEventURL = "";
    $scope.searchStringVal={};
    $scope.searchStringVal.searchSelection = [];
    $scope.searchStringVal.unrepostHours="1";
    $scope.makeEvent = {};
    $scope.submission={};
    $scope.searchStringVal.timeGap = "";
    $scope.searchStringVal.eventComment = $scope.user.repostSettings ? ($scope.user.repostSettings.schedule.comments.length ? $scope.user.repostSettings.schedule.comments[0] : "") : "";
    $scope.searchStringVal.channelArr = [];
    $scope.searchStringVal.selectedSlot = ""; 
    var hour = ConvertStringTimeToUTC();
    var makeDay = new Date();
    makeDay.setHours(hour);
    $scope.searchStringVal.day = makeDay;
    $scope.followersCount();
    $scope.checkCommentEnable();
    $scope.checkLikeEnable();

    document.getElementById('scPlayer').style.visibility = "hidden";
  }


  $scope.changedSearch = function(kind) {
    $("#searchString,#searchString1").next("ul").show();
    
    $scope.searchStringVal.searchString;
    $scope.searchStringVal.searchSelection = [];
    $scope.searchStringVal.searchError = false;
    $scope.searchStringVal.searching = true;
    if ($scope.searchStringVal.searchString != "") {
      $http.post('/api/search', {
        q: $scope.searchStringVal.searchString,
        kind: kind
      }).then(function(res) {
        $scope.searchStringVal.searching = false;
        if (res.data.item) {
          if (res.data.item.kind != kind) {
            $scope.searchStringVal.serachError = "Please enter a " + kind + " URL.";
          } else {
            $scope.selectedItem(res.data.item);
          }
        } else {
          if(res.data.collection.length > 0){
            $scope.searchStringVal.searchSelection = res.data.collection;
            $scope.searchStringVal.searchSelection.forEach(function(item) {
              $scope.setItemText(item)
            })
          }
          else{
            $scope.searchError = "We could not find a " + kind + "."
          }
        }
      }).then(null, function(err) {
        $scope.searchStringVal.searching = false;
        $scope.searchStringVal.searchError = "We could not find a " + kind + "."
      });
    }
  }

  $scope.setItemText = function(item) {

    switch (item.kind) {
      case 'track':
        item.displayName = item.title + ' - ' + item.user.username;
        break;
      case 'playlist':
        item.displayName = item.title + ' - ' + item.user.username;
        break;
      case 'user':
        item.displayName = user.username;
        break;
    }
  }

  $scope.selectedItem = function(item) {

      $scope.searchStringVal.searching = false;
      $scope.searchStringVal.searchError = false;
      $("#searchString,#searchString1").next("ul").hide();
      //custom code to process item choice//
      $scope.searchStringVal.searchString = item.title;
      $scope.searchStringVal.trackID = item.id;
      $scope.searchStringVal.title = item.title;
      $scope.searchStringVal.trackURL = item.permalink_url;
      $scope.searchStringVal.trackArtUrl = item.artwork_url;
      SC.oEmbed($scope.searchStringVal.trackURL, {
        element: document.getElementById('scPlayer'),
        auto_play: false,
        maxheight: 150
      })

      document.getElementById('scPlayer').style.visibility = "visible";
      $scope.processing = false;
       $scope.searchStringVal.searching = false;
      $scope.searchStringVal.searchError = false;
    }
    //end search//

  $scope.urlChange = function() {
    $http.post('/api/soundcloud/resolve', {
        url: $scope.url
      })
      .then(function(res) {
        if (res.data.kind != "track") throw (new Error(''));
        $scope.searchStringVal.trackID = res.data.id;
        $scope.searchStringVal.title = res.data.title;
        $scope.searchStringVal.trackURL = res.data.trackURL;
        $scope.searchStringVal.trackArtUrl = item.artwork_url;
        SC.oEmbed($scope.searchStringVal.trackURL, {
          element: document.getElementById('scPlayer'),
          auto_play: false,
          maxheight: 150
        })
        document.getElementById('scPlayer').style.visibility = "visible";
        $scope.processing = false;
        $scope.notFound = false;
      }).then(null, function(err) {
        if (err.status != 403) {
          $.Zebra_Dialog("We are not allowed to access tracks by this artist with the Soundcloud API. We apologize for the inconvenience, and we are working with Soundcloud to resolve this issue.");
          $scope.notFound = true;
        } else {
          $scope.searchStringVal.trackURL = $scope.url;
          SC.oEmbed($scope.searchStringVal.trackURL, {
            element: document.getElementById('scPlayer'),
            auto_play: false,
            maxheight: 150
          })
        }
        $scope.searchStringVal.trackID = null;

        $scope.processing = false;
        document.getElementById('scPlayer').style.visibility = "hidden";
      });
  }

  $scope.submit = function() {
    if (!$scope.searchStringVal.email || !$scope.searchStringVal.name) {
      $.Zebra_Dialog("Please fill in all fields")
    } else {
      $scope.processing = true;
      $http.post('/api/submissions', {
          email: $scope.searchStringVal.email,
          trackID: $scope.searchStringVal.trackID,
          name: $scope.searchStringVal.name,
          title: $scope.searchStringVal.title,
          trackURL: $scope.searchStringVal.trackURL,
          channelIDS: [],
          invoiceIDS: [],
          userID: $scope.userID,
          genre: $scope.searchStringVal.genre
        })
        .then(function(res) {
          $.Zebra_Dialog("Your song has been submitted and will be reviewed soon.");
          $scope.processing = false;
          $scope.notFound = false;
          $scope.searchStringVal = {};
          document.getElementById('scPlayer').style.visibility = "hidden";
          $scope.searchStringVal.url = "";
        })
        .then(null, function(err) {
          $scope.processing = false;
          $.Zebra_Dialog("Error: Could not submit song.");
        });
    }
  }


  $scope.isEdit = false;
  $scope.EditNewSong = function(item,action) {
    $scope.editChannelArr = [];
    $scope.tabSelected = false;

    var newObj = item;

    $scope.searchStringVal={};
    $scope.searchStringVal.searchString = newObj.event.trackURL;
     if(action=="view")
      $scope.isEdit = true;

    $scope.searchStringVal.selectedSlot = newObj.event.day;
    $scope.searchStringVal.eventComment = newObj.event.comment;
    $scope.searchStringVal.timeGap = newObj.event.timeGap;
    $scope.searchStringVal.unrepostHours = newObj.event.unrepostHours;
    $scope.searchStringVal.unrepostEnable = newObj.event.unrepostHours ? true : false;
    var channels = newObj.event.otherChannels;
    if (channels.length > 0) {
      for (var i = 0; i < channels.length; i++) {
        for (var j = 0; j < $scope.linkedAccounts.length; j++) {
          if (channels[i] == $scope.linkedAccounts[j].soundcloud.id) {
            $scope.editChannelArr.push($scope.linkedAccounts[j].name);
          }
        }
      }
      $scope.searchStringVal.channelArr = $scope.editChannelArr;
    }

    SC.oEmbed($scope.searchStringVal.searchString, {
      element: document.getElementById('scPlayer'),
      auto_play: false,
      maxheight: 120
    })
    document.getElementById('scPlayer').style.visibility = "visible";
    $scope.followersCount();

  }

  $scope.addNewSongCancel = function() {
    $scope.tabSelected = true;
    $scope.searchStringVal = {};
    $scope.makeEvent = null;
  }

  function getshortdate(d) {
    var YYYY = d.getFullYear();
    var M = d.getMonth() + 1;
    var D = d.getDate();
    var MM = (M < 10) ? ('0' + M) : M;
    var DD = (D < 10) ? ('0' + D) : D;
    var result = MM + "/" + DD + "/" + YYYY;
    return result;
  }

  $scope.getPreviousEvents = function() {
    $scope.listDayIncr--;
    $scope.getListEvents();
  }

  $scope.getListEvents = function() {
    $scope.listevents = [];
    var currentDate = new Date();

    currentDate.setDate(currentDate.getDate() + $scope.listDayIncr);

    for (var i = 0; i < 7; i++) {
      var d = new Date(currentDate);
      d.setDate(d.getDate() + i);
      var currentDay = parseInt(d.getDay());
      var strDdate = getshortdate(d);
      var slots = $scope.availableSlots[daysArray[currentDay]];
      slots = slots.sort(function(a, b) {
        return a - b
      });
      angular.forEach(slots, function(s) {
        var item = new Object();
        var h = s;
        var time = '';
        if (h >= 12) {
          h = h - 12;
          time = h + ":00" + " PM";
        } else {
          time = h + ":00" + " AM";
        }

        var calendarDay = $scope.calendar.find(function(calD) {
          return calD.day.toLocaleDateString() == d.toLocaleDateString();
        });
        var event = calendarDay.events.find(function(ev) {
          return new Date(ev.day).getHours() == s;
        });

        item.event = event;
        item.date = strDdate + " " + time;

        if(!item.event && new Date(item.date).getDate() == new Date().getDate())
        {
          var eventTime = new Date(item.date).getHours();
          var currTime = new Date().getDate();
    
              if(eventTime > currTime)
                {
        $scope.listevents.push(item);
                }
         }
         else
         {
        $scope.listevents.push(item);
         }
         
        if (event == undefined && new Date(item.date) > new Date()) {
          item.slotdate = d;
          item.slottime = time;
          $scope.listAvailableSlots.push(item);
        }
      });
    }
  }

  $scope.getNextEvents = function() {
    $scope.listDayIncr++;
    $scope.getListEvents();
  }

  $scope.getNextDayOfWeek = function() {
    var thisDay = new Date();
    for (var i = 0; i < 7; i++) {
      thisDay.setDate(thisDay.getDate() + 1);
    }
  }

  $scope.clickedSlotsave = function(day, hour) {
    var pushhour = parseInt(hour);
    if ($scope.availableSlots[daysArray[day]].indexOf(pushhour) > -1) {
      $scope.availableSlots[daysArray[day]].splice($scope.availableSlots[daysArray[day]].indexOf(pushhour), 1);
    } else {
      $scope.availableSlots[daysArray[day]].push(pushhour);
    }
    $http.post('/api/events/saveAvailableSlots', {
      availableslots: $scope.availableSlots,
      id: $scope.user._id
    }).then(function(res) {
      //SessionService.create(res.data);
      SessionService.setUserPaidRepostAccounts(res.data);
      $scope.user = SessionService.getUserPaidRepostAccounts(PaidUserId);
      //$scope.user = SessionService.getUser();
      $scope.availableSlots = $scope.user.availableSlots;
    });
  }

  $scope.setSlotStyle = function(day, hour) {
    var style = {};
    if ($scope.availableSlots[daysArray[day]].indexOf(hour) > -1) {
      style = {
        'background-color': "#fff",
        'border-color': "#999"
      };
    }
    return style;
  }

  $scope.getChannels = function() {
    $scope.channels = ["Emil", "Tobias", "Linus"];
  }
  $scope.trackListChange = function(index) {
    $scope.newQueueSong = $scope.trackListObj.permalink_url;
    $scope.changeQueueSong();
  };

  $scope.getTrackListFromSoundcloud = function() {
    var profile = $scope.user;
    if (profile.soundcloud) {
      $scope.processing = true;
      SC.get('/users/' + profile.soundcloud.id + '/tracks', {
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

  $scope.openHelpModal = function() {
    var displayText = "Schedule your reposts using the assigned slots, and indicate your preference for un-reposting after 24 hours. Keep in mind that the scheduler will not allow you to repost and un-repost within a period of 48 hours.Arrow icons pointing downwards indicate that you have marked the track to be un-reposted after 24 hours.Orange-colored slots are reserved for trades initiated using the repost-for-repost platform.<br><br><a style='text-align:center; margin:0 auto;' href='mailto:coayscue@artistsunlimited.co?subject=Artists Unlimited Help' target='_top'>Email Tech Support</a>";
    $.Zebra_Dialog(displayText, {
      width: 600
    });
  }

  $scope.saveUser = function() {
    $scope.processing = true;
    $http.put("/api/database/profile", $scope.user)
      .then(function(res) {
        //SessionService.create(res.data);
        SessionService.setUserPaidRepostAccounts(res.data);
        $scope.user = SessionService.getUserPaidRepostAccounts(PaidUserId);
        //$scope.user = SessionService.getUser();
        $scope.processing = false;
      })
      .then(null, function(err) {
        $.Zebra_Dialog("Error: did not save");
        $scope.processing = false;
      });
  }


  $scope.dayIncr = 7;
  $scope.incrDay = function() {
    if ($scope.dayIncr < 49) $scope.dayIncr++;
  }

  $scope.decrDay = function() {
    if ($scope.dayIncr > 0) $scope.dayIncr--;
  }

  function ConvertStringTimeToUTC(strTime) {
    var time = String(strTime);
    var hours = Number(time.split(':')[0]);
    var AMPM = time.split(' ')[1];
    if (AMPM === "PM" && hours < 12) {
      hours = hours + 12
    }
    if (AMPM === "AM" && hours === 12) {
      hours = hours - 12
    }
    var sHours = hours.toString();
    if (hours < 10) {
      sHours = "0" + sHours
    }
    return sHours;
  }


  $scope.clickAvailableSlots = function(selectedSlot) {


    selectedSlot = JSON.parse(selectedSlot);
    var day = new Date(selectedSlot.slotdate);
    var hour = ConvertStringTimeToUTC(selectedSlot.slottime);
    var calDay = {};
    var calendarDay = $scope.calendar.find(function(calD) {
      return calD.day.toLocaleDateString() == day.toLocaleDateString();
    });

    if (!$scope.searchStringVal) {
      $scope.searchStringVal = {
        userID: $scope.user.soundcloud.id,
        type: "track"
      };
    }
    $scope.newEvent = true;
    var makeDay = new Date(selectedSlot.slotdate);
    makeDay.setHours(hour);
    $scope.searchStringVal.day = makeDay;
    $scope.searchStringVal.searchString = $scope.searchStringVal.trackURL;
  }

  $scope.clickedSlot = function(day, hour, data) {

    $scope.popup = true;
     $scope.searchStringVal={};
    var d = new Date(day).getDay();

    if ($scope.availableSlots[daysArray[d]].indexOf(hour) == -1) return;
    var today = new Date();
    if (today.toLocaleDateString() == day.toLocaleDateString() && today.getHours() > hour) return;
    $scope.showOverlay = true;
    var calDay = {};
    var calendarDay = $scope.calendar.find(function(calD) {
      return calD.day.toLocaleDateString() == day.toLocaleDateString();
    });
    $scope.searchStringVal.searchString = "";
    $scope.trackListSlotObj = undefined;
    $scope.searchStringVal = JSON.parse(JSON.stringify(calendarDay.events[hour]));
    $scope.updateReach();

    if (data.type == "empty") {
      var makeDay = new Date(day);
      makeDay.setHours(hour);
      $scope.searchStringVal = {
        userID: $scope.user.soundcloud.id,
        day: makeDay,
        type: "track"
      };
      $scope.searchStringVal.unrepostDate = (data.day!=undefined ? new Date(data.day.getTime() + 24 * 60 * 60 * 1000) : new Date(new Date().getTime() + 24 * 60 * 60 * 1000));
      $scope.searchStringVal.unrepost = true;
      $scope.newEvent = true;
      document.getElementById('scPopupPlayer').style.visibility = "hidden";
    } else {
      $scope.editChannelArr = [];
      var channels = data.otherChannels;
      if (channels.length > 0) {
        for (var i = 0; i < channels.length; i++) {
          for (var j = 0; j < $scope.linkedAccounts.length; j++) {
            if (channels[i] == $scope.linkedAccounts[j].soundcloud.id) {
              $scope.editChannelArr.push($scope.linkedAccounts[j].name);
            }
          }
        }
        $scope.searchStringVal.channelArr = $scope.editChannelArr;
      }

      if(data._id!=undefined)
        $scope.searchStringVal._id = data._id;

      $scope.searchStringVal.unrepostHours = data.unrepostHours;
      $scope.searchStringVal.timeGap = data.timeGap;
      $scope.searchStringVal.checkgap = parseInt(data.timeGap);
      $scope.searchStringVal.day = new Date(data.day);
      $scope.searchStringVal.unrepostDate = new Date(data.unrepostDate);
      $scope.searchStringVal.unrepost = (data.unrepostDate > new Date());
      $scope.searchStringVal.searchString = data.trackURL;
      $scope.searchStringVal.eventComment = ($scope.user.repostSettings!=undefined && $scope.user.repostSettings.schedule!=undefined)  ? ($scope.user.repostSettings.schedule.comments!=undefined && $scope.user.repostSettings.schedule.comments.length ? $scope.user.repostSettings.schedule.comments[0] : "") : "";
      $scope.followersCount();
      SC.oEmbed($scope.searchStringVal.trackURL, {
        element: document.getElementById('scPopupPlayer'),
        auto_play: false,
        maxheight: 150
      });
      $scope.newEvent = false;
    }
  }

  // $scope.changeQueueSlot = function() {
  //   $scope.makeEvent.title = null;
  //   $scope.makeEvent.trackURL = null;
  //   $scope.makeEvent.artistName = null;
  //   $scope.makeEvent.trackID = null;
  //   $scope.makeEventURL = null;
  // }
   //search//
 
  $scope.log = function() {
    //console.log($scope.otherChannels);
  }

  $scope.changeURL = function() {


    
    if ($scope.makeEventURL) {
      $scope.processing = true;
      var player = (($scope.popup == false) ? document.getElementById('scPlayer') : document.getElementById('scPopupPlayer'));
      $http.post('/api/soundcloud/resolve', {
          url: $scope.makeEventURL
        })
        .then(function(res) {
          if (!$scope.makeEvent) {
            $scope.makeEvent = {};
          }
          $scope.makeEvent.type = "track";
          $scope.trackArtistID = res.data.user.id;
          $scope.trackType = res.data.kind;
          if (res.data.kind != "playlist") {
            if (res.data.user.id != $scope.user.soundcloud.id) {
              $scope.makeEvent.trackID = res.data.id;
              $scope.makeEvent.title = res.data.title;
              $scope.makeEvent.trackURL = res.data.trackURL;
              $scope.makeEvent.trackArtUrl = res.data.artwork_url;
              if (res.data.user) {
                $scope.makeEvent.artistName = res.data.user.username;
              }

              SC.oEmbed($scope.makeEventURL, {
                element: player,
                auto_play: false,
                maxheight: 150
              })
              if ($scope.popup == false) {
                player.style.visibility = "visible";
              } else {
                player.style.visibility = "visible";
              }
              $scope.notFound = false;
              $scope.processing = false;
            } else {
              $scope.notFound = false;
              $scope.processing = false;
              $.Zebra_Dialog("You cannot repost your own track.");
            }
          } else {
            $scope.notFound = false;
            $scope.processing = false;
            $.Zebra_Dialog("Sorry! We don't allow scheduling playlists here. Please enter a track url instead.");
          }
        }).then(null, function(err) {
          $.Zebra_Dialog("We are not allowed to access tracks by this artist with the Soundcloud API. We apologize for the inconvenience, and we are working with Soundcloud to resolve this issue.");
          player.style.visibility = "hidden";
          $scope.notFound = true;
          $scope.processing = false;
        });
    }
  }

  $scope.deleteEvent = function() {
    if (!$scope.newEvent) {
      $scope.processing = true;
      $http.delete('/api/events/repostEvents/' + $scope.makeEvent._id)
        .then(function(res) {
          return $scope.refreshEvents();
        })
        .then(function(res) {
          $scope.showOverlay = false;
          $scope.processing = false;
        })
        .then(null, function(err) {
          $scope.processing = false;
          $.Zebra_Dialog("ERROR: Did not delete.")
        });
    } else {
      var calendarDay = $scope.calendar.find(function(calD) {
        return calD.day.toLocaleDateString() == $scope.makeEvent.day.toLocaleDateString();
      });
      calendarDay.events[$scope.makeEvent.day.getHours()] = {
        type: "empty"
      };
      var events
      $scope.showOverlay = false;
    }
  }

  $scope.setCalendarEvent = function(event) {
    event.day = new Date(event.day);
    var calendarDay = $scope.calendar.find(function(calD) {
      return calD.day.toLocaleDateString() == event.day.toLocaleDateString();
    });
    calendarDay.events[event.day.getHours()] = event;
  }

  $scope.changeUnrepost = function() {
    if ($scope.makeEvent.unrepost) {
      $scope.makeEvent.day = new Date($scope.makeEvent.day);
      $scope.makeEvent.unrepostDate = new Date($scope.makeEvent.day.getTime() + 24 * 60 * 60 * 1000);
    } else {
      $scope.makeEvent.unrepostDate = new Date(0);
    }
  }

  $scope.findUnrepostOverlap = function() {
    if (!$scope.makeEvent.trackID) return false;
    var blockEvents = $scope.events.filter(function(event) {
      event.day = new Date(event.day);
      event.unrepostDate = new Date(event.unrepostDate);
      if (moment($scope.makeEvent.day).format('LLL') == moment(event.day).format('LLL') && $scope.makeEvent.trackID == event.trackID) return false;
      return ($scope.makeEvent.trackID == event.trackID && event.unrepostDate.getTime() > $scope.makeEvent.day.getTime() - 24 * 3600000 && event.day.getTime() < $scope.makeEvent.unrepostDate.getTime() + 24 * 3600000);
    })
    return blockEvents.length > 0;
  }

  $scope.otherChannelsAndGroups = function() {

    $scope.selectedGroupChannelIDS = [];
    if ($scope.role == 'admin') {
      $scope.groupAndChannel = $scope.searchStringVal.channelArr.concat($scope.groupArr);
      $scope.groupAndChannel.forEach(function(g) {
        $scope.user.paidRepost.forEach(function(acc) {
          if (acc.groups.indexOf(g) != -1) {
            if ($scope.selectedGroupChannelIDS.indexOf(acc.id) == -1) {
              $scope.selectedGroupChannelIDS.push(acc.id);
            }
          } else {
            if (acc.username == g) {
              if ($scope.selectedGroupChannelIDS.indexOf(acc.id) == -1) {
                $scope.selectedGroupChannelIDS.push(acc.id);
              }
            }
          }
        });
      });
      return $scope.selectedGroupChannelIDS;
    } else {
      $scope.channelArr.forEach(function(ch) {
        $scope.linkedAccounts.forEach(function(acc) {
          if (acc.soundcloud && acc.soundcloud.username == ch) {
            if ($scope.selectedGroupChannelIDS.indexOf(acc.soundcloud.id) == -1) {
              $scope.selectedGroupChannelIDS.push(acc.soundcloud.id);
            }
          }
        });
      });
      return $scope.selectedGroupChannelIDS;
    }
  }

  $scope.saveEvent = function() {
    $scope.makeEvent={};
    var otherChannels = $scope.otherChannelsAndGroups();
    if (otherChannels.length > 0) {
      $scope.makeEvent.otherChannels = otherChannels;
    } else {
      $scope.makeEvent.otherChannels = [];
    }
    if ($scope.searchStringVal.unrepostEnable) {
      $scope.makeEvent.unrepostDate = new Date($scope.searchStringVal.day.getTime() + (parseInt($scope.searchStringVal.unrepostHours) * 60 * 60 * 1000));
      $scope.makeEvent.unrepost = true;
    } else {
      $scope.makeEvent.unrepostDate = new Date(0);
      $scope.makeEvent.unrepost = false;
    }

    $scope.makeEvent.userID = $scope.user.soundcloud.id;
    $scope.makeEvent.like = $scope.likeEvent;
    $scope.makeEvent.unrepostHours = $scope.searchStringVal.unrepostHours;
    $scope.makeEvent.timeGap = $scope.searchStringVal.timeGap;
    $scope.makeEvent.comment = ($scope.commentEvent == true ? $scope.searchStringVal.eventComment : '');
    $scope.makeEvent.unrepostEnable = $scope.searchStringVal.unrepostEnable;
    
    $scope.makeEvent.trackID = $scope.searchStringVal.trackID;
    $scope.makeEvent.trackURL = $scope.searchStringVal.trackURL;
    $scope.makeEvent.trackArtUrl = $scope.searchStringVal.trackArtUrl;
    $scope.makeEvent.title=$scope.searchStringVal.title;
    $scope.makeEvent.name= $scope.searchStringVal.name;
    $scope.makeEvent.day= $scope.searchStringVal.day;
    $scope.makeEvent.owner= $scope.user._id;
    $scope.makeEvent.email= $scope.user.email;
    
    

    if ($scope.trackType == "playlist") {
      $.Zebra_Dialog("Sorry! We don't currently allow playlist reposting. Please enter a track url instead.");
      return;
    } else if ($scope.trackArtistID == $scope.user.soundcloud.id) {
      $.Zebra_Dialog("Sorry! You cannot schedule your own track to be reposted.")
      return;
    } else if ($scope.findUnrepostOverlap()) {
      $.Zebra_Dialog('Issue! This repost will cause this track to be both unreposted and reposted within a 24 hour time period. If you are unreposting, please allow 48 hours between scheduled reposts.');
      return;
    }
    if (!$scope.makeEvent.trackID && ($scope.makeEvent.type == "track")) {
      $.Zebra_Dialog("Enter a track URL");
    } else {
      $scope.processing = true;
      if ($scope.newEvent) {
        for (var key in $scope.otherChannels) {
          if ($scope.otherChannels[key]) $scope.makeEvent.otherChannels.push(key);
        }
        $scope.makeEvent.timeGap = parseInt($scope.searchStringVal.timeGap);
        var req = $http.post('/api/events/repostEventsScheduler', $scope.makeEvent)
        $scope.otherChannels = [];
        $scope.searchStringVal.timeGap = '1';
      } else {
        var req = $http.put('/api/events/repostEvents', $scope.searchStringVal)
      }
      req
        .then(function(res) {
          if (res) {
            $scope.repostResponse = res.data._id;
          }
          $scope.makeEventURL = "";
          $scope.makeEvent = null;
          $scope.eventComment = "";
          document.getElementById('scPlayer').style.visibility = "hidden";
          document.getElementById('scPopupPlayer').style.visibility = "hidden";
          $scope.searchStringVal.unrepostHours = 1;
          $scope.tabSelected = true;
          $scope.searchStringVal.trackType = "";
          $scope.trackArtistID = 0;
          return $scope.refreshEvents();
        })
        .then(function(res) {
          if (res) {
            $scope.repostResponse = res.data._id;
          }
          $scope.makeEventURL = "";
          $scope.makeEvent = null;
          $scope.eventComment = "";
          document.getElementById('scPlayer').style.visibility = "hidden";
          document.getElementById('scPopupPlayer').style.visibility = "hidden";
          $scope.searchStringVal.unrepostHours = 1;
          $scope.tabSelected = true;
          $scope.showOverlay = false;
          $scope.processing = false;
          $scope.searchStringVal.trackType = "";
          $scope.trackArtistID = 0;
        })
        .then(null, function(err) {
          $scope.processing = false;
          $.Zebra_Dialog("ERROR: Did not save.");
        });
    }
  }
  $scope.emailSlot = function() {
    var mailto_link = "mailto:?subject=Repost of " + $scope.makeEvent.title + '&body=Hey,\n\n I am reposting your song ' + $scope.makeEvent.title + ' on ' + $scope.user.soundcloud.username + ' on ' + $scope.makeEvent.day.toLocaleDateString() + '.\n\n Best, \n' + $scope.user.soundcloud.username;
    location.href = encodeURI(mailto_link);
  }

  $scope.backEvent = function() {
    $scope.makeEvent = null;
    $scope.searchStringVal.trackType = "";
    $scope.trackArtistID = 0;
    $scope.showOverlay = false;
  }


  $scope.removeQueueSong = function(index) {
    $scope.user.queue.splice(index, 1);
    $scope.saveUser()
    $scope.loadQueueSongs();
  }

  $scope.addSong = function() {
    if ($scope.user.queue.indexOf($scope.newQueueID) != -1) return;

    $scope.user.queue.push($scope.newQueueID);
    $scope.saveUser();
    $scope.newQueueSong = undefined;
    $scope.trackListObj = "";
    $scope.newQueue = undefined;
    $scope.loadQueueSongs();
  }

  $scope.changeQueueSong = function() {
    if ($scope.newQueueSong != "") {
      $scope.processing = true;
      $http.post('/api/soundcloud/resolve', {
          url: $scope.newQueueSong
        })
        .then(function(res) {
          $scope.processing = false;
          var track = res.data;
          $scope.newQueue = track;
          $scope.newQueueID = track.id;
        })
        .then(null, function(err) {
          $.Zebra_Dialog("We are not allowed to access tracks by this artist with the Soundcloud API. We apologize for the inconvenience, and we are working with Soundcloud to resolve this issue.");
          $scope.processing = false;
        });
    }
  }

  $scope.moveUp = function(index) {
    if (index == 0) return;
    var s = $scope.user.queue[index];
    $scope.user.queue[index] = $scope.user.queue[index - 1];
    $scope.user.queue[index - 1] = s;
    $scope.saveUser();
    $scope.loadQueueSongs();
  }

  $scope.moveDown = function(index) {
    if (index == $scope.user.queue.length - 1) return;
    var s = $scope.user.queue[index];
    $scope.user.queue[index] = $scope.user.queue[index + 1];
    $scope.user.queue[index + 1] = s;
    $scope.saveUser();
    $scope.loadQueueSongs();
  }

  $scope.loadQueueSongs = function(queue) {
    $scope.autoFillTracks = [];
    $scope.user.queue.forEach(function(songID) {
      SC.get('/tracks/' + songID)
        .then(function(track) {
          $scope.autoFillTracks.push(track);
          $scope.$digest();
        }, console.log);
    })
  }
  if ($scope.user && $scope.user.queue) {
    $scope.loadQueueSongs();
  }

  $scope.dayOfWeekAsString = function(date) {
    var dayIndex = date.getDay();
    if (screen.width > '744') {
      return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex];
    }
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayIndex];
  }

  $scope.unrepostSymbol = function(event) {
    if (!event.unrepostDate) return;
    event.unrepostDate = new Date(event.unrepostDate);
    return event.unrepostDate > new Date();
  }

  $scope.getStyle = function(event, date, day, hour) {
    var style = {};
    var currentDay = new Date(date).getDay();
    var date = (new Date(date)).setHours(hour)
    if ($scope.availableSlots[daysArray[currentDay]] && $scope.availableSlots[daysArray[currentDay]].indexOf(hour) > -1 && date > (new Date())) {
      style = {
        'background-color': '#fff',
        'border-color': "#999",
      }
    }
    return style;
  }

  $scope.getEventStyle = function(event) {

    if (event.type == 'empty') {
      return {}
    } else if (event.type == 'track' || event.type == 'queue') {
      return {
        'background-color': '#FF0000'
      }
    } else if (event.type == 'traded') {
      return {
        'background-color': '#FF6347'
      }
    } else if (event.type == 'paid') {
      return {
        'background-color': '#FFBBDD'
      }
    }
  }

  $scope.refreshEvents = function() {
    $scope.user = SessionService.getUserPaidRepostAccounts(PaidUserId);
    return $http.get('/api/events/forUser/' + $scope.user.soundcloud.id)
      .then(function(res) {
        var events = res.data
        events.forEach(function(ev) {
          ev.day = new Date(ev.day);
        });
        $scope.events = events;
        $scope.calendar = $scope.fillDateArrays(events);

      })
  }

  $scope.fillDateArrays = function(events) {
    var calendar = [];
    var todayDate = new Date();
    var today = new Date(todayDate.setDate(todayDate.getDate() - 7));
    for (var i = 0; i < 49; i++) {
      var calDay = {};
      calDay.day = new Date()
      calDay.day.setDate(today.getDate() + i);
      var dayEvents = events.filter(function(ev) {
          return (ev.day.toLocaleDateString() == calDay.day.toLocaleDateString());
      });
      var eventArray = [];
      for (var j = 0; j < 24; j++) {
        eventArray[j] = {
          type: "empty"
        };
      }

      dayEvents.forEach(function(ev) {
        eventArray[ev.day.getHours()] = ev;
      });
      calDay.events = eventArray;
      calendar.push(calDay);
    }
    return calendar;
  };

  $scope.calendar = $scope.fillDateArrays(events);

  $scope.updateEmail = function(email) {
    var answer = email;
    var myArray = answer.match(/[a-z\._\-!#$%&'+/=?^_`{}|~]+@[a-z0-9\-]+\.\S{2,3}/igm);
    if (myArray) {
      $scope.user.email = answer;

      return $http.put('/api/database/profile', $scope.user)
        .then(function(res) {
           SessionService.setUserPaidRepostAccounts(res.data);
          //SessionService.create(res.data);
          //$scope.user = SessionService.getUser();
          $scope.user = SessionService.getUserPaidRepostAccounts(PaidUserId);
          $scope.hideall = false;
          $('#emailModal').modal('hide');
          $scope.showEmailModal = false;
        })
        .then(null, function(err) {
          setTimeout(function() {
            $scope.showEmailModal = false;
            $scope.promptForEmail();
          }, 600);
        })
    } else {
      setTimeout(function() {
        $scope.showEmailModal = false;
        $scope.promptForEmail();
      }, 600);
    }
  }

  $scope.promptForEmail = function() {
    if (!$scope.user.email) {
      $scope.showEmailModal = true;
      setTimeout(function() {
      $('#emailModal').modal('show');
      },300);
    }
  }
  $scope.verifyBrowser = function() {
    if (navigator.userAgent.search("Chrome") == -1 && navigator.userAgent.search("Safari") != -1) {
      var position = navigator.userAgent.search("Version") + 8;
      var end = navigator.userAgent.search(" Safari");
      var version = navigator.userAgent.substring(position, end);
      if (parseInt(version) < 9) {
        $.Zebra_Dialog('You have old version of safari. Click <a href="https://support.apple.com/downloads/safari">here</a> to download the latest version of safari for better site experience.', {
          'type': 'confirmation',
          'buttons': [{
            caption: 'OK'
          }],
          'onClose': function() {
            $window.location.href = "https://support.apple.com/downloads/safari";
          }
        });
      } else {
        $scope.promptForEmail();
      }
    } else {
      $scope.promptForEmail();
    }
  }

  $scope.getUserNetwork = function() {
    $http.get("/api/database/userNetworks")
      .then(function(networks) {
        $rootScope.userlinkedAccounts = networks.data;
      })
  }

  $scope.updateReach = function() {
    $scope.repostReach = 0;
    $scope.repostReach = $scope.user.soundcloud.followers;
    for (var key in $scope.otherChannels) {
      if ($scope.otherChannels[key]) {
        var acct = $scope.userlinkedAccounts.find(function(acct) {
          return acct.soundcloud.id == key;
        })
        $scope.repostReach += acct.soundcloud.followers;
      }
    }
  }

  $scope.followersCount = function() {

    var count = $scope.user.soundcloud.followers;
    var channels = $scope.otherChannelsAndGroups();
    if ($scope.role == 'admin') {
      for (var i = 0; i < $scope.user.paidRepost.length; i++) {
        if (channels.indexOf($scope.user.paidRepost[i].id) > -1) {
          count = count + $scope.user.paidRepost[i].followers;
        }
      }
    } else {
      for (var i = 0; i < $scope.linkedAccounts.length; i++) {
        if (channels.indexOf($scope.linkedAccounts[i].soundcloud.id) > -1) {
          count = count + $scope.linkedAccounts[i].soundcloud.followers;
        }
      }
    }
    $scope.followCounts = count;
  }

  $scope.sendMail = function(id) {
    $scope.fbMessageLink = "https://localhost:1443/repostevents?id=" + id;
    $window.open("mailto:example@demo.com?body=" + $scope.fbMessageLink, "_self");
  };
  $scope.followersCount();
  $scope.checkCommentEnable();
  $scope.checkLikeEnable();
  $scope.updateReach();
  $scope.getUserNetwork();
  $scope.verifyBrowser();
 // $scope.fillDateArrays(events);
  


});