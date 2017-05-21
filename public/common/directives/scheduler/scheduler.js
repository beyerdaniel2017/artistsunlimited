app.directive('scheduler', function($http) {
  return {
    templateUrl: 'js/common/directives/scheduler/scheduler.html',
    restrict: 'E',
    scope: false,
    controller: function schedulerController($rootScope, $state, $scope, $http, AuthService, $window, SessionService) {
      $scope.months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
      var daysArray = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      $scope.currentDate = new Date();
      $scope.type = 'share';
      $scope.dateCompare = getshortdate($scope.currentDate);
      $scope.time = formatAMPM($scope.currentDate);
      $scope.user = SessionService.getUser();
      $scope.showEmailModal = false;
      $scope.makeEventURL = "";
      $scope.showPlayer = false;
      $scope.showOverlay = false;
      $scope.processiong = false;
      $scope.hideall = false;
      $scope.itemview = "calender";
      $scope.dayIncr = 7;
      $scope.listDayIncr = 0;
      $scope.eventDate = new Date();
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
      $scope.openSlots = [];
      $scope.displayType = 'channel';
      $scope.paidCommentsArr = [];
      $scope.tradeCommentsArr = [];
      $scope.popup = false;
      $scope.selectedSlot = {};
      $scope.now = new Date();
      $scope.alreadyLoaded = false;
      $scope.unrepostHours = 48;
      var commentIndex = 0;
      $scope.isView = false;
      $scope.isTraded = false;
      $scope.origin = window.location.origin;
      $scope.eventComment = ($scope.user.repostSettings && $scope.user.repostSettings.schedule && $scope.user.repostSettings.schedule.comments && $scope.user.repostSettings.schedule.comments.length > 0) ? $scope.user.repostSettings.schedule.comments[Math.random() * $scope.user.repostSettings.schedule.comments.length >> 0] : '';
      var defaultAvailableSlots = {
        sunday: [],
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: []
      };

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

      if (window.location.href.indexOf('scheduler#myschedule') != -1) {
        $('.nav-tabs a[href="#myschedule"]').tab('show');
      } else if (window.location.href.indexOf('scheduler#organizeschedule') != -1) {
        $('.nav-tabs a[href="#organizeschedule"]').tab('show');
      } else if (window.location.href.indexOf('scheduler#managereposts') != -1) {
        $('.nav-tabs a[href="#managereposts"]').tab('show');
      }

      $scope.setRepostHours = function() {
        if ($scope.unrepostEnable) {
          $scope.unrepostHours = "48";
        } else {
          $scope.unrepostHours = "";
        }
      }

      $scope.choseTrack1 = function(track) {
        $scope.searchString = track.title;
        $scope.makeEventURL = track.permalink_url;
        $scope.makeEvent.trackID = track.id;
        $scope.makeEvent.title = track.title;
        $scope.makeEvent.trackArtUrl = track.artwork_url;
        $scope.makeEvent.artistName = track.user.username;
        $scope.makeEvent.trackURL = track.permalink_url
        $scope.showPlayer = true;
        var playerWidget = SC.Widget('scPopupPlayer');
        playerWidget.load($scope.makeEventURL, {
          auto_play: false,
          show_artwork: false,
          callback: function() {
            document.getElementById('scPopupPlayer').style.visibility = "visible";
            if (!$scope.$$phase) $scope.$apply();
          }
        });
        $scope.warnAboutPrevRepost();
      }

      $scope.choseTrack = function(track) {
        $scope.makeEventURL = track.permalink_url;
        $scope.searchString = track.title;
        $scope.makeEvent.trackID = track.id;
        $scope.makeEvent.title = track.title;
        $scope.makeEvent.trackArtUrl = track.artwork_url;
        $scope.makeEvent.artistName = track.user.username;
        $scope.makeEvent.trackURL = track.permalink_url;
        $scope.showPlayer = true;
        var popupPlayerWidget = SC.Widget('scPlayer');
        popupPlayerWidget.load($scope.makeEventURL, {
          auto_play: false,
          show_artwork: true,
          callback: function() {
            document.getElementById('scPlayer').style.visibility = "visible";
            if (!$scope.$$phase) $scope.$apply();
          }
        });
        $scope.warnAboutPrevRepost();
      }

      $scope.warnAboutPrevRepost = function() {
        var filtered = $scope.events.filter(function(event) {
          return event.trackID == $scope.makeEvent.trackID && event.day < $scope.makeEvent.day;
        })
        filtered.sort(function(a, b) {
          return b.day - a.day;
        })
        if (filtered[0] && filtered[0].unrepostDate < filtered[0].day) {
          $.Zebra_Dialog('FYI: This song will not be reposted unless you unrepost the previous repost of this track, which is scheduled for ' + filtered[0].day.toLocaleString() + '.');
        }
      }

      $scope.linkedAccounts = [];
      /*Get Linked Accounts*/
      $scope.getLinkedAccounts = function() {
        var linked = $rootScope.userlinkedAccounts;
        for (var i = 0; i < linked.length; i++) {
          if (linked[i]._id != $scope.user._id) {
            $scope.linkedAccounts.push(linked[i]);
          }
        }
        if (!$scope.$$phase) $scope.$apply();
      }

      $scope.checkCommentEnable = function() {
        if ($scope.user.repostSettings && $scope.user.repostSettings.schedule) {
          if ($scope.user.repostSettings.schedule.comment == false) {
            $scope.disable = true;
            $scope.commentEvent = false;
            $scope.eventComment = "";
            $scope.commentSrc = 'assets/images/noComment.svg';
          } else {
            $scope.disable = false;
            $scope.commentEvent = true;
            if ($scope.slotType == 'track') {
              $scope.eventComment = ($scope.user.repostSettings && $scope.user.repostSettings.schedule && $scope.user.repostSettings.schedule.comments && $scope.user.repostSettings.schedule.comments.length > 0) ? $scope.user.repostSettings.schedule.comments[Math.random() * $scope.user.repostSettings.schedule.comments.length] : '';
            }
            $scope.commentSrc = 'assets/images/comment.svg';
          }
        }
        if ($scope.user.repostSettings && $scope.user.repostSettings.trade) {
          if ($scope.user.repostSettings.trade.comment == false) {
            $scope.disable = true;
            $scope.commentEvent = false;
            $scope.eventComment = "";
            $scope.commentSrc = 'assets/images/noComment.svg';
          } else {
            $scope.disable = false;
            $scope.commentEvent = true;
            if ($scope.slotType == 'traded') {
              $scope.eventComment = ($scope.user.repostSettings && $scope.user.repostSettings.trade && $scope.user.repostSettings.trade.comments && $scope.user.repostSettings.trade.comments.length > 0) ? $scope.user.repostSettings.trade.comments[Math.random() * $scope.user.repostSettings.trade.comments.length] : '';
            }
            $scope.commentSrc = 'assets/images/comment.svg';
          }
        }
      }

      $scope.checkLikeEnable = function() {
        if ($scope.user.repostSettings && $scope.user.repostSettings.schedule) {
          if ($scope.user.repostSettings.schedule.like == false) {
            $scope.likeSrc = 'assets/images/like.svg';
            $scope.likeEvent = false;
          } else {
            $scope.likeSrc = 'assets/images/likeTrue.svg';
            $scope.likeEvent = true;
          }
        }
      }
      $scope.changeLikeCommentIcons = function(type) {
        console.log(type);
        if (type == 'like') {
          console.log($scope.likeSrc);
          if ($scope.likeSrc == 'assets/images/like.svg') {
            $scope.likeSrc = 'assets/images/likeTrue.svg';
            $scope.likeEvent = true;
          } else {
            $scope.likeSrc = 'assets/images/like.svg';
            $scope.likeEvent = false;
          }
          console.log($scope.likeSrc)
        } else {
          console.log($scope.commentSrc);
          if ($scope.commentSrc == 'assets/images/comment.svg') {
            $scope.commentSrc = 'assets/images/noComment.svg';
            $scope.makeEvent.isComment = false;
            $scope.commentEvent = false;
            $scope.disable = true;
            $scope.eventComment = "";
          } else {
            $scope.commentSrc = 'assets/images/comment.svg';
            $scope.commentEvent = true;
            $scope.makeEvent.isComment = true;
            $scope.disable = false;
            commentIndex = 0;
            if ($scope.slotType == 'track') {
              $scope.eventComment = $scope.isComment ? $scope.isComment : ($scope.user.repostSettings.schedule.comments.length > 1 ? $scope.user.repostSettings.schedule.comments[Math.random() * $scope.user.repostSettings.schedule.comments.length >> 0] : $scope.user.repostSettings.schedule.comments[0]);
            } else {
              $scope.eventComment = $scope.isComment ? $scope.isComment : ($scope.user.repostSettings.trade.comments.length > 1 ? $scope.user.repostSettings.trade.comments[Math.random() * $scope.user.repostSettings.trade.comments.length >> 0] : $scope.user.repostSettings.trade.comments[0]);
            }
          }
        }
      }

      $scope.getPrevNextComment = function(type) {
        if (type == 'next') {
          if ($scope.slotType == 'track' && commentIndex < $scope.user.repostSettings.schedule.comments.length - 1) {
            commentIndex = commentIndex + 1;
            $scope.eventComment = $scope.user.repostSettings.schedule.comments[commentIndex];
          } else if ($scope.slotType == 'traded' && commentIndex < $scope.user.repostSettings.trade.comments.length - 1) {
            commentIndex = commentIndex + 1;
            $scope.eventComment = $scope.user.repostSettings.trade.comments[commentIndex];
          }
        } else {
          if ($scope.slotType == 'track' && commentIndex >= 1) {
            commentIndex = commentIndex - 1;
            $scope.eventComment = $scope.user.repostSettings.schedule.comments[commentIndex];
          } else if ($scope.slotType == 'traded' && commentIndex >= 1) {
            commentIndex = commentIndex - 1;
            $scope.eventComment = $scope.user.repostSettings.trade.comments[commentIndex];
          }
        }
      }

      $scope.saveRepostSettings = function() {
        $http.put('/api/database/updateRepostSettings', {
          repostSettings: $scope.user.repostSettings,
          id: $scope.user._id
        }).then(function(res) {
          console.log(res.data);
          SessionService.create(res.data);
          $scope.user = SessionService.getUser();
          $scope.checkCommentEnable();
          $scope.checkLikeEnable();
        });
      }

      $scope.deleteComment = function(commentIndex, type) {
        if (type == 'schedule') {
          $scope.user.repostSettings.schedule.comments.splice(commentIndex, 1);
        } else if (type == 'trade') {
          $scope.user.repostSettings.trade.comments.splice(commentIndex, 1);
        }
        $scope.saveRepostSettings();
      }

      $scope.saveComments = function(value, type, index) {
        var comments = [];
        if (type == 'schedule' && value) {
          comments = ($scope.user.repostSettings.schedule.comments ? $scope.user.repostSettings.schedule.comments : []);
          if (index == undefined)
            comments.push(value);
          else
            comments[index] = value;

          $scope.user.repostSettings.schedule.comments = comments;
          $scope.saveRepostSettings();
          $scope.scheduleComment = "";
        } else if (type == 'trade' && value) {
          comments = ($scope.user.repostSettings.trade.comments ? $scope.user.repostSettings.trade.comments : []);
          if (index == undefined)
            comments.push(value);
          else
            comments[index] = value;
          $scope.user.repostSettings.trade.comments = comments;
          $scope.saveRepostSettings();
          $scope.tradeComment = "";
        } else {
          $.Zebra_Dialog("Please enter comment");
          return;
        }
      }

      $scope.editComments = function(comment, type, index) {
        console.log(index);
        $scope.scheduleCommentIndex = index;
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
      $scope.pseudoAvailableSlots = (($scope.user.pseudoAvailableSlots != undefined) ? $scope.user.pseudoAvailableSlots : defaultAvailableSlots);
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
        $scope.makeEvent = {
          type: 'track'
        };
        $scope.unrepostHours = "48";
        $scope.unrepostEnable = true;
        $scope.eventComment = "";
        $scope.channelArr = [];
        $scope.selectedSlot = "";
        $scope.followersCount();
        $scope.setScheduleLikeComment();
        $scope.showPlayer = false;
        $scope.getListEvents();
        if ($scope.listAvailableSlots[0]) $scope.selectedSlot = $scope.firstSlot = JSON.stringify($scope.listAvailableSlots[0]);
        $scope.clickAvailableSlots($scope.firstSlot);
      }

      $scope.isSchedule = false;
      $scope.scheduleSong = function(date) {
        $scope.isTraded = false;
        $scope.afcount = 0;
        $scope.isEdit = false;
        $scope.isSchedule = true;
        $scope.tabSelected = false;
        $scope.isView = false;
        $scope.unrepostEnable = true;
        $scope.unrepostHours = "48";
        $scope.newEvent = true;
        $scope.showPlayer = false;
        $scope.isComment = "";
        $scope.setScheduleLikeComment();
        document.getElementById('scPlayer').style.visibility = "hidden";
        $scope.makeEvent = {
          userID: $scope.user.soundcloud.id,
          type: "track"
        };
        $scope.selectedSlot = date;
        var selectedSlot = new Date($scope.selectedSlot);
        var day = new Date(selectedSlot.getTime() - selectedSlot.getTimezoneOffset() * 60000).toISOString();
        var hour = ConvertStringTimeToUTC(selectedSlot.getHours());
        var makeDay = new Date(day);
        makeDay.setHours(hour);
        $scope.makeEvent.day = makeDay;
        $scope.selectedSlot = new Date(date);
        $scope.editChannelArr = [];
        $scope.channelArr = [];
        $scope.slotType = 'track';
      }

      $scope.isEdit = false;
      $scope.EditNewSong = function(item, editable) {
        $scope.afcount = 0;
        $scope.editChannelArr = [];
        $scope.tabSelected = false;
        $scope.isEdit = true;
        $scope.isTraded = false;
        $scope.isSchedule = false;
        $scope.deleteEventData = item;
        var newObj = angular.copy(item);
        $scope.makeEventURL = newObj.event.trackURL;
        $scope.selectedSlot = newObj.event.day;
        $scope.likeSrc = (newObj.event.like == true) ? 'assets/images/likeTrue.svg' : 'assets/images/like.svg';
        $scope.likeEvent = newObj.event.like;
        $scope.commentSrc = (newObj.event.comment != "") ? 'assets/images/comment.svg' : 'assets/images/noComment.svg';
        $scope.commentEvent = (newObj.event.comment != "" ? true : false);
        $scope.disable = !$scope.commentEvent;
        $scope.eventComment = "";
        if ($scope.commentEvent) {
          $scope.eventComment = newObj.event.comment;
          $scope.isComment = newObj.event.comment;
        }
        $scope.timeGap = newObj.event.timeGap;
        $scope.unrepostHours = newObj.event.unrepostHours;
        $scope.unrepostEnable = new Date(newObj.event.unrepostDate) > new Date(1000);
        var channels = newObj.event.otherChannels;
        if (channels.length > 0) {
          for (var i = 0; i < channels.length; i++) {
            for (var j = 0; j < $scope.linkedAccounts.length; j++) {
              if (channels[i] == $scope.linkedAccounts[j].soundcloud.id) {
                $scope.editChannelArr.push($scope.linkedAccounts[j].name);
              }
            }
          }
          $scope.channelArr = $scope.editChannelArr;
        }
        SC.Widget('scPlayer').load($scope.makeEventURL, {
          auto_play: false,
          show_artwork: true
        });
        $scope.slotType = item.event.type;
        if ($scope.slotType == "traded" || $scope.slotType == 'paid')
          $scope.isTraded = true;
        $scope.showPlayer = true;
        document.getElementById('scPlayer').style.visibility = "visible";
        if (item.event.type == 'traded' && item.event.trackURL) {
          $scope.isView = true;
        } else if (item.event.type == 'traded' && !item.event.trackURL) {
          $scope.setTradedLikeComment();
        } else if (item.event.type == 'traded' && !item.event.trackURL) {
          $scope.setTradedLikeComment();
        }
        $scope.followersCount();
        $scope.makeEvent = {};
        $scope.newEvent = false;
        var selectedSlot = $scope.selectedSlot;
        var day = new Date(selectedSlot.getTime() - selectedSlot.getTimezoneOffset() * 60000).toISOString();
        var hour = ConvertStringTimeToUTC(selectedSlot.getHours());
        var makeDay = new Date(day);
        makeDay.setHours(hour);
        $scope.makeEvent.trackID = newObj.event.trackID;
        $scope.makeEvent.day = makeDay;
        $scope.makeEvent._id = newObj.event._id;
        $scope.makeEvent.trackURL = $scope.makeEventURL;
        $scope.makeEvent.title = newObj.event.title;
        $scope.makeEvent.type = item.event.type;
        $scope.makeEvent.owner = newObj.event.owner;
      }

      $scope.addNewSongCancel = function() {
        $scope.tabSelected = true;
        $scope.makeEventURL = "";
        $scope.makeEvent = null;
        $scope.showPlayer = false;
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
          var slots = $scope.pseudoAvailableSlots[daysArray[currentDay]];
          slots = slots.sort(function(a, b) {
            return a - b
          });

          angular.forEach(slots, function(s) {
            var item = new Object();
            var h = s;
            var time = '';
            if (h >= 12) {
              h = h - 12;
              time = h + " PM";
            } else {
              time = h + " AM";
            }

            var calendarDay = $scope.calendar.find(function(calD) {
              return calD.day.toLocaleDateString() == d.toLocaleDateString();
            });
            var event = calendarDay.events.find(function(ev) {
              return new Date(ev.day).getHours() == s;
            });

            item.event = event;
            var dt = new Date(strDdate);
            dt.setHours(s);
            item.date = new Date(dt);
            if (!item.event) {
              if (new Date(item.date).getTime() > new Date().getTime()) {
                $scope.listevents.push(item);
              }
            } else if (item.event) {
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

      $scope.toggleAvailableSlot = function(day, hour) {
        var pushhour = parseInt(hour);
        if ($scope.pseudoAvailableSlots[daysArray[day]].indexOf(pushhour) > -1) {
          if ($scope.pseudoAvailableSlots[daysArray[day]].length <= 2) {
            $.Zebra_Dialog("Cannot remove slot. You must have at least 2 repost slots per day.");
          } else {
            $scope.pseudoAvailableSlots[daysArray[day]].splice($scope.pseudoAvailableSlots[daysArray[day]].indexOf(pushhour), 1);
          }
        } else if ($scope.tooManyReposts(day, hour)) {
          $.Zebra_Dialog("Cannot schedule slot. We only allow 12 reposts within 24 hours to prevent you from being repost blocked.");
          return;
        } else {
          $scope.pseudoAvailableSlots[daysArray[day]].push(pushhour);
        }
        $scope.user.availableSlots = createAvailableSlots($scope.user, $scope.pseudoAvailableSlots);
        $http.post('/api/events/saveAvailableSlots', {
          availableslots: $scope.user.availableSlots,
          id: $scope.user._id
        }).then(function(res) {
          SessionService.create(res.data);
          $scope.user = SessionService.getUser();
        }).then(null, console.log);
      }

      $scope.tooManyReposts = function(day, hour) {
        var startDayInt = (day + 6) % 7;
        var allSlots = []
        var wouldBeSlots = JSON.parse(JSON.stringify($scope.pseudoAvailableSlots));
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
            if (Math.abs(checkingSlots[i] - slot) >= 24) checkingSlots.splice(i, 1);
            else i++;
          }
          checkingSlots.push(slot);
          if (checkingSlots.length > 12) {
            status = true;
          }
        })
        return status;
      }

      $scope.setSlotStyle = function(day, hour) {
        var style = {
          'border-radius': '4px'
        };
        if ($scope.pseudoAvailableSlots && $scope.pseudoAvailableSlots[daysArray[day]].indexOf(hour) > -1) {
          style = {
            'background-color': "#fff",
            'border-color': "#999",
            'border-radius': '4px',
          };
        }
        return style;
      }

      $scope.getChannels = function() {
        $scope.channels = ["Emil", "Tobias", "Linus"];
      }

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
              if (!$scope.$$phase) $scope.$apply();
            })
            .catch(function(response) {
              $scope.processing = false;
              if (!$scope.$$phase) $scope.$apply();
            });
        }
      }

      $scope.saveUser = function() {
        $scope.processing = true;
        $http.put("/api/database/profile", $scope.user)
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

      $scope.incrDay = function() {
        if ($scope.dayIncr < 42) $scope.dayIncr++;
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
        if (!$scope.makeEvent) {
          $scope.makeEvent = {
            userID: $scope.user.soundcloud.id,
            type: "track"
          };
        }
        $scope.newEvent = true;
        var makeDay = new Date(selectedSlot.slotdate);
        makeDay.setHours(hour);
        $scope.makeEvent.day = makeDay;
        $scope.makeEventURL = $scope.makeEvent.trackURL;
      }

      $scope.populateOpenSlots = function() {
        $scope.openSlots = [];
        var currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + $scope.listDayIncr);
        for (var i = 0; i < 7; i++) {
          var d = new Date(currentDate);
          d.setDate(d.getDate() + i);
          var currentDay = parseInt(d.getDay());
          var strDdate = getshortdate(d);
          var slots = $scope.pseudoAvailableSlots[daysArray[currentDay]];
          slots = slots.sort(function(a, b) {
            return a - b
          });

          angular.forEach(slots, function(s) {
            var item = new Object();
            var h = s;
            var time = '';
            if (h >= 12) {
              h = h - 12;
              time = h + " PM";
            } else {
              time = h + " AM";
            }

            var calendarDay = $scope.calendar.find(function(calD) {
              return calD.day.toLocaleDateString() == d.toLocaleDateString();
            });
            var event = calendarDay.events.find(function(ev) {
              return new Date(ev.day).getHours() == s;
            });

            item.event = event;
            var dt = new Date(strDdate);
            dt.setHours(s);
            item.date = new Date(dt);
            if (!item.event) {
              if (new Date(item.date).getTime() > new Date().getTime()) {
                $scope.listevents.push(item);
              }
            } else if (item.event) {
              $scope.listevents.push(item);
            }
            if (event == undefined && new Date(item.date) > new Date()) {
              item.slotdate = d;
              item.slottime = time;
              var newDate = new Date(item.date);
              newDate.setMinutes(30);
              $scope.openSlots.push(newDate);
            }
          });
        }
      }

      $scope.makeEventDayChange = function() {
        $scope.makeEvent.day = new Date(parseInt($scope.makeEventDay));
      }

      $scope.clickedSlot = function(day, hour, data) {
        $scope.afcount = 0;
        $scope.isView = false;
        $scope.popup = true;
        $scope.slotType = 'track';
        var d = new Date(day).getDay();
        if ($scope.pseudoAvailableSlots[daysArray[d]].indexOf(hour) == -1 && data.type == 'empty') return;
        var makeDay = new Date(day);
        makeDay.setHours(hour);
        if ($scope.user.blockRelease && new Date($scope.user.blockRelease).getTime() > new Date(makeDay).getTime()) {
          $.Zebra_Dialog("Sorry! You are blocked till date " + moment($scope.user.blockRelease).format('LLL'));
          return;
        }
        $scope.showOverlay = true;
        var calDay = {};
        var calendarDay = $scope.calendar.find(function(calD) {
          return calD.day.toLocaleDateString() == day.toLocaleDateString();
        });
        $scope.makeEventURL = "";
        $scope.trackListSlotObj = undefined;
        $scope.makeEvent = JSON.parse(JSON.stringify(calendarDay.events[hour]));
        $scope.unrepostEnable = new Date($scope.makeEvent.unrepostDate) > new Date(1000);
        $scope.unrepostHours = "";
        $scope.updateReach();
        $scope.setScheduleLikeComment();
        if ($scope.makeEvent.type == "empty") {
          makeDay = new Date(day);
          makeDay.setHours(hour);
          $scope.makeEvent = {
            userID: $scope.user.soundcloud.id,
            day: makeDay,
            type: "track"
          };
          $scope.channelArr = [];
          $scope.isEdit = false;
          $scope.isTraded = false;
          if ($scope.commentEvent == true)
            $scope.eventComment = ($scope.user.repostSettings && $scope.user.repostSettings.schedule && $scope.user.repostSettings.schedule.comments && $scope.user.repostSettings.schedule.comments.length > 0) ? $scope.user.repostSettings.schedule.comments[Math.random() * $scope.user.repostSettings.schedule.comments.length >> 0] : '';
          $scope.isComment = "";
          document.getElementById('scPopupPlayer').style.visibility = "hidden";
          $scope.showPlayer = false;
          $scope.makeEvent.day = new Date($scope.makeEvent.day);
          $scope.makeEventDay = JSON.stringify($scope.makeEvent.day.getTime());
          $scope.makeEvent.unrepostDate = new Date($scope.makeEvent.day.getTime() + 24 * 60 * 60 * 1000);
          $scope.unrepostEnable = true;
          $scope.unrepostHours = "48";
          $scope.makeEvent.unrepost = true;
          $scope.newEvent = true;
          $scope.editChannelArr = [];
          $scope.channelArr = [];
          $scope.makeEvent.hoursBetween = 1;
        } else {
          if (data.type == 'traded' || data.type == 'paid') $scope.isTraded = true;
          $scope.isEdit = true;
          $scope.likeSrc = (data.like == true) ? 'assets/images/likeTrue.svg' : 'assets/images/like.svg';
          $scope.likeEvent = data.like;
          $scope.commentSrc = (data.comment != "") ? 'assets/images/comment.svg' : 'assets/images/noComment.svg';
          $scope.commentEvent = (data.comment != "" ? true : false);
          if ($scope.commentEvent == false) {
            $scope.eventComment = "";
          }
          $scope.disable = ($scope.commentEvent == true) ? false : true;

          $scope.editChannelArr = [];
          $scope.channelArr = [];
          var channels = data.otherChannels;
          if (channels.length > 0) {
            for (var i = 0; i < channels.length; i++) {
              for (var j = 0; j < $scope.linkedAccounts.length; j++) {
                if (channels[i] == $scope.linkedAccounts[j].soundcloud.id) {
                  $scope.editChannelArr.push($scope.linkedAccounts[j].name);
                }
              }
            }
            $scope.channelArr = $scope.editChannelArr;
          }
          $scope.timeGap = data.timeGap;
          $scope.followersCount();
          var repostDate = new Date($scope.makeEvent.day);
          var unrepostDate = new Date($scope.makeEvent.unrepostDate);
          var diff = Math.abs(new Date(unrepostDate).getTime() - new Date(repostDate).getTime()) / 3600000;
          $scope.makeEvent.unrepostHours = diff;
          $scope.unrepostHours = data.unrepostHours;
          $scope.makeEvent.day = new Date($scope.makeEvent.day);
          $scope.makeEventDay = JSON.stringify($scope.makeEvent.day.getTime());
          $scope.makeEvent.unrepostDate = new Date($scope.makeEvent.unrepostDate);
          $scope.makeEvent.unrepost = ($scope.makeEvent.unrepostDate > new Date());
          $scope.makeEventURL = $scope.makeEvent.trackURL;
          $scope.makeEvent.trackID = data.trackID;
          $scope.makeEvent.hoursBetween = 1;
          $scope.newEvent = false;
          SC.Widget('scPopupPlayer').load($scope.makeEventURL, {
            auto_play: false,
            show_artwork: false
          });
          $scope.showPlayer = true;
          document.getElementById('scPopupPlayer').style.visibility = "visible";
          if (data.type == 'traded' && data.trackURL) {
            $scope.slotType = 'traded';
            $scope.isView = true;
            $scope.eventComment = "";
            $scope.isComment = "";
            if ($scope.commentEvent) {
              $scope.eventComment = $scope.makeEvent.comment;
              $scope.isComment = $scope.makeEvent.comment;
            }
          } else
          if (data.type != 'traded' && data.trackURL) {
            $scope.slotType = 'track';
            $scope.showPlayer = true;
            if ($scope.commentEvent)
              $scope.eventComment = $scope.makeEvent.comment;
            $scope.isComment = $scope.makeEvent.comment;
          } else
          if (data.type == 'traded' && !data.trackURL) {
            $scope.setTradedLikeComment();
            $scope.slotType = 'traded';
            $scope.showPlayer = false;
          }
        }
        console.log($scope.makeEvent.day);
        $scope.populateOpenSlots();
      }

      $scope.setScheduleLikeComment = function() {
        if ($scope.user.repostSettings && $scope.user.repostSettings.schedule) {
          if ($scope.user.repostSettings.schedule.like == false) {
            $scope.likeSrc = 'assets/images/like.svg';
            $scope.likeEvent = false;
          } else {
            $scope.likeSrc = 'assets/images/likeTrue.svg';
            $scope.likeEvent = true;
          }
        }

        if ($scope.user.repostSettings && $scope.user.repostSettings.schedule && $scope.user.repostSettings.schedule.comment == false) {
          $scope.disable = true;
          $scope.commentEvent = false;
          $scope.eventComment = "";
          $scope.commentSrc = 'assets/images/noComment.svg';
        } else {
          $scope.disable = false;
          $scope.commentEvent = true;
          $scope.eventComment = ($scope.user.repostSettings && $scope.user.repostSettings.schedule && $scope.user.repostSettings.schedule.comments && $scope.user.repostSettings.schedule.comments.length > 0) ? $scope.user.repostSettings.schedule.comments[Math.random() * $scope.user.repostSettings.schedule.comments.length >> 0] : '';
          $scope.commentSrc = 'assets/images/comment.svg';
        }
      }

      $scope.setTradedLikeComment = function() {
        if ($scope.user.repostSettings && $scope.user.repostSettings.trade) {
          if ($scope.user.repostSettings.trade.like == false) {
            $scope.likeSrc = 'assets/images/like.svg';
            $scope.likeEvent = false;
          } else {
            $scope.likeSrc = 'assets/images/likeTrue.svg';
            $scope.likeEvent = true;
          }
        }

        if ($scope.user.repostSettings && $scope.user.repostSettings.trade && $scope.user.repostSettings.trade.comment == false) {
          $scope.disable = true;
          $scope.commentEvent = false;
          $scope.eventComment = "";
          $scope.commentSrc = 'assets/images/noComment.svg';
        } else {
          $scope.disable = false;
          $scope.commentEvent = true;
          $scope.eventComment = ($scope.user.repostSettings && $scope.user.repostSettings.trade && $scope.user.repostSettings.trade.comments && $scope.user.repostSettings.trade.comments.length > 0) ? $scope.user.repostSettings.trade.comments[Math.random() * $scope.user.repostSettings.trade.comments.length >> 0] : '';
          $scope.commentSrc = 'assets/images/comment.svg';
        }
      }

      $scope.changeQueueSlot = function() {
        $scope.makeEvent.title = null;
        $scope.makeEvent.trackURL = null;
        $scope.makeEvent.artistName = null;
        $scope.makeEvent.trackID = null;
        $scope.makeEventURL = null;
      }

      $scope.log = function() {
        console.log($scope.otherChannels);
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
              $scope.showPlayer = false;
              $state.reload();
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

      $scope.findUnrepostOverlap = function() {
        if (!$scope.makeEvent.trackID) return false;
        var blockEvents = $scope.events.filter(function(event) {
          if (event._id == $scope.makeEvent._id || $scope.makeEvent.trackID != event.trackID) return false;
          event.day = new Date(event.day);
          event.unrepostDate = new Date(event.unrepostDate);
          var eventLowerBound = $scope.makeEvent.day.getTime();
          var eventUpperBound = $scope.makeEvent.unrepostDate > $scope.makeEvent.day ? $scope.makeEvent.unrepostDate.getTime() + 24 * 3600000 : $scope.makeEvent.day.getTime() + 48 * 3600000;
          var makeEventLowerBound = event.day.getTime();
          var makeEventUpperBound = event.unrepostDate > event.day ? event.unrepostDate.getTime() + 24 * 3600000 : event.day.getTime() + 48 * 3600000;
          return ((event.day.getTime() > eventLowerBound && event.day.getTime() < eventUpperBound) || ($scope.makeEvent.day.getTime() > makeEventLowerBound && $scope.makeEvent.day.getTime() < makeEventUpperBound));
        })
        return blockEvents.length > 0;
      }

      $scope.otherChannelsAndGroups = function() {
        $scope.selectedGroupChannelIDS = [];
        if ($scope.role == 'admin') {
          $scope.groupAndChannel = $scope.channelArr.concat($scope.groupArr);
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
        var otherChannels = $scope.otherChannelsAndGroups();
        if (otherChannels.length > 0) {
          $scope.makeEvent.otherChannels = otherChannels;
        } else {
          $scope.makeEvent.otherChannels = [];
        }
        if ($scope.unrepostEnable) {
          $scope.makeEvent.unrepostDate = new Date($scope.makeEvent.day.getTime() + (parseInt($scope.unrepostHours) * 60 * 60 * 1000));
          $scope.makeEvent.unrepost = true;
        } else {
          $scope.makeEvent.unrepostDate = new Date(0);
          $scope.makeEvent.unrepost = false;
        }
        $scope.makeEvent.userID = $scope.user.soundcloud.id;
        $scope.makeEvent.like = $scope.likeEvent;
        $scope.makeEvent.unrepostHours = $scope.unrepostHours;
        $scope.makeEvent.timeGap = $scope.timeGap;
        $scope.makeEvent.comment = ($scope.commentEvent == true ? $scope.eventComment : '');
        if ($scope.trackType == "playlist") {
          $.Zebra_Dialog("Sorry! We don't currently allow playlist reposting. Please enter a track url instead.");
          return;
        } else if ($scope.trackArtistID == $scope.user.soundcloud.id) {
          $.Zebra_Dialog("Sorry! You cannot schedule your own track to be reposted.")
          return;
        } else if ($scope.findUnrepostOverlap()) {
          $.Zebra_Dialog('Issue! Please allow at least 24 hours between unreposting a track and re-reposting it and at least 48 hours between reposts of the same track.');
          return;
        }
        if (!$scope.makeEvent.trackID && ($scope.makeEvent.type == "track")) {
          $.Zebra_Dialog("Pleae add a track.");
        } else {
          $scope.processing = true;
          if ($scope.newEvent) {
            for (var key in $scope.otherChannels) {
              if ($scope.otherChannels[key]) $scope.makeEvent.otherChannels.push(key);
            }
            $scope.makeEvent.timeGap = parseInt($scope.timeGap);
            var req = $http.post('/api/events/repostEventsScheduler', $scope.makeEvent)
            $scope.otherChannels = [];
            $scope.timeGap = '1';
          } else {
            var req = $http.put('/api/events/repostEvents', $scope.makeEvent);
          }
          req
            .then(function(res) {
              if (res) {
                $scope.repostResponse = res.data;
                $scope.repostResponse.user = $scope.user;
                $('#pop').modal('show');
              }
              $scope.makeEventURL = "";
              $scope.makeEvent = null;
              $scope.eventComment = "";
              $scope.unrepostEnable = false;
              document.getElementById('scPlayer').style.visibility = "hidden";
              document.getElementById('scPopupPlayer').style.visibility = "hidden";
              $scope.unrepostHours = 1;
              $scope.tabSelected = true;
              $scope.trackType = "";
              $scope.trackArtistID = 0;
              return $scope.refreshEvents();
            })
            .then(function(res) {
              if (res) {
                $scope.repostResponse = res.data;
                $scope.repostResponse.user = $scope.user;
                $('#pop').modal('show');
              }
              $scope.makeEventURL = "";
              $scope.makeEvent = null;
              $scope.eventComment = "";
              $scope.unrepostEnable = false;
              document.getElementById('scPlayer').style.visibility = "hidden";
              document.getElementById('scPopupPlayer').style.visibility = "hidden";
              $scope.unrepostHours = 1;
              $scope.tabSelected = true;
              $scope.showOverlay = false;
              $scope.processing = false;
              $scope.trackType = "";
              $scope.trackArtistID = 0;
              $scope.refreshEvents();
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
        $scope.trackType = "";
        $scope.trackArtistID = 0;
        $scope.showOverlay = false;
        $scope.unrepostEnable = false;
        $scope.unrepostHours = "";
        $scope.showPlayer = false;
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
        var style = {
          'border-radius': '4px'
        };
        var currentDay = new Date(date).getDay();

        var date = (new Date(date)).setHours(hour)
        if ($scope.pseudoAvailableSlots[daysArray[currentDay]] && $scope.pseudoAvailableSlots[daysArray[currentDay]].indexOf(hour) > -1 && date > (new Date())) {
          style = {
            'background-color': '#fff',
            'border-color': "#999",
            'border-radius': '4px'
          }
        }
        return style;
      }

      $scope.getEventStyle = function(event) {
        if (event.type == 'empty') {
          return {}
        } else if (event.type == 'track' || event.type == 'queue') {
          return {
            'background-color': '#FF7676',
            'margin': '2px',
            'height': '18px',
            'border-radius': '4px'
          }
        } else if (event.type == 'traded') {
          return {
            'background-color': '#FFD450',
            'margin': '2px',
            'height': '18px',
            'border-radius': '4px'
          }
        } else if (event.type == 'paid') {
          return {
            'background-color': '#FFBBDD',
            'margin': '2px',
            'height': '18px',
            'border-radius': '4px'
          }
        }
      }

      $scope.refreshEvents = function() {
        return $http.get('/api/events/forUser/' + SessionService.getUser().soundcloud.id)
          .then(function(res) {
            var events = res.data
            events.forEach(function(ev) {
              ev.day = new Date(ev.day);
              ev.unrepostDate = ev.unrepostDate ? new Date(ev.unrepostDate) : new Date(0);
            });
            $scope.events = events;
            $scope.calendar = $scope.fillDateArrays(events);
            $scope.getListEvents();

          })
      }

      $scope.fillDateArrays = function(events) {
        var calendar = [];
        var today = new Date();
        today.setDate(today.getDate() - 7);
        for (var i = 0; i < 49; i++) {
          var calDay = {};
          calDay.day = new Date(today);
          calDay.day.setDate(today.getDate() + i);
          var dayEvents = $scope.events.filter(function(ev) {
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

      $scope.calendar = $scope.fillDateArrays($scope.events);

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
          }
        }
      }

      $scope.updateReach = function() {
        $scope.repostReach = 0;
        $scope.repostReach = $scope.user.soundcloud.followers;
        for (var key in $scope.otherChannels) {
          if ($scope.otherChannels[key]) {
            var acct = $rootScope.userlinkedAccounts.find(function(acct) {
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
              if (!$scope.$$phase) $scope.$apply();
            })
            .catch(function(response) {
              $scope.processing = false;
              if (!$scope.$$phase) $scope.$apply();
            });
        }
      }

      $scope.shareEvent = function() {
        $scope.repostResponse = $scope.makeEvent;
        $scope.repostResponse.user = $scope.user;
        $('#pop').modal('show');
      }

      $scope.getUserNetwork()
        .then(function() {
          $scope.getLinkedAccounts();
        });
      $scope.followersCount();
      $scope.checkCommentEnable();
      $scope.checkLikeEnable();
      $scope.updateReach();
      $scope.verifyBrowser();
    }
  }
})

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24vZGlyZWN0aXZlcy9zY2hlZHVsZXIvc2NoZWR1bGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5kaXJlY3RpdmUoJ3NjaGVkdWxlcicsIGZ1bmN0aW9uKCRodHRwKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvc2NoZWR1bGVyL3NjaGVkdWxlci5odG1sJyxcclxuICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICBzY29wZTogZmFsc2UsXHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbiBzY2hlZHVsZXJDb250cm9sbGVyKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgQXV0aFNlcnZpY2UsICR3aW5kb3csIFNlc3Npb25TZXJ2aWNlKSB7XHJcbiAgICAgICRzY29wZS5tb250aHMgPSBbJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseScsICdBdWd1c3QnLCAnU2VwdGVtYmVyJywgJ09jdG9iZXInLCAnTm92ZW1iZXInLCAnRGVjZW1iZXInXTtcclxuICAgICAgdmFyIGRheXNBcnJheSA9IFsnc3VuZGF5JywgJ21vbmRheScsICd0dWVzZGF5JywgJ3dlZG5lc2RheScsICd0aHVyc2RheScsICdmcmlkYXknLCAnc2F0dXJkYXknXTtcclxuICAgICAgJHNjb3BlLmN1cnJlbnREYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgJHNjb3BlLnR5cGUgPSAnc2hhcmUnO1xyXG4gICAgICAkc2NvcGUuZGF0ZUNvbXBhcmUgPSBnZXRzaG9ydGRhdGUoJHNjb3BlLmN1cnJlbnREYXRlKTtcclxuICAgICAgJHNjb3BlLnRpbWUgPSBmb3JtYXRBTVBNKCRzY29wZS5jdXJyZW50RGF0ZSk7XHJcbiAgICAgICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICAgICAkc2NvcGUuc2hvd0VtYWlsTW9kYWwgPSBmYWxzZTtcclxuICAgICAgJHNjb3BlLm1ha2VFdmVudFVSTCA9IFwiXCI7XHJcbiAgICAgICRzY29wZS5zaG93UGxheWVyID0gZmFsc2U7XHJcbiAgICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2lvbmcgPSBmYWxzZTtcclxuICAgICAgJHNjb3BlLmhpZGVhbGwgPSBmYWxzZTtcclxuICAgICAgJHNjb3BlLml0ZW12aWV3ID0gXCJjYWxlbmRlclwiO1xyXG4gICAgICAkc2NvcGUuZGF5SW5jciA9IDc7XHJcbiAgICAgICRzY29wZS5saXN0RGF5SW5jciA9IDA7XHJcbiAgICAgICRzY29wZS5ldmVudERhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAkc2NvcGUudHJhY2tMaXN0ID0gW107XHJcbiAgICAgICRzY29wZS50cmFja0xpc3RPYmogPSBudWxsO1xyXG4gICAgICAkc2NvcGUudHJhY2tMaXN0U2xvdE9iaiA9IG51bGw7XHJcbiAgICAgICRzY29wZS5uZXdRdWV1ZVNvbmcgPSBcIlwiO1xyXG4gICAgICAkc2NvcGUudHJhY2tBcnRpc3RJRCA9IDA7XHJcbiAgICAgICRzY29wZS50cmFja1R5cGUgPSBcIlwiO1xyXG4gICAgICAkc2NvcGUudGltZUdhcCA9ICcxJztcclxuICAgICAgJHNjb3BlLm90aGVyQ2hhbm5lbHMgPSB7fTtcclxuICAgICAgJHNjb3BlLmxpc3RldmVudHMgPSBbXTtcclxuICAgICAgJHNjb3BlLnRhYlNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgJHNjb3BlLmxpc3RBdmFpbGFibGVTbG90cyA9IFtdO1xyXG4gICAgICAkc2NvcGUub3BlblNsb3RzID0gW107XHJcbiAgICAgICRzY29wZS5kaXNwbGF5VHlwZSA9ICdjaGFubmVsJztcclxuICAgICAgJHNjb3BlLnBhaWRDb21tZW50c0FyciA9IFtdO1xyXG4gICAgICAkc2NvcGUudHJhZGVDb21tZW50c0FyciA9IFtdO1xyXG4gICAgICAkc2NvcGUucG9wdXAgPSBmYWxzZTtcclxuICAgICAgJHNjb3BlLnNlbGVjdGVkU2xvdCA9IHt9O1xyXG4gICAgICAkc2NvcGUubm93ID0gbmV3IERhdGUoKTtcclxuICAgICAgJHNjb3BlLmFscmVhZHlMb2FkZWQgPSBmYWxzZTtcclxuICAgICAgJHNjb3BlLnVucmVwb3N0SG91cnMgPSA0ODtcclxuICAgICAgdmFyIGNvbW1lbnRJbmRleCA9IDA7XHJcbiAgICAgICRzY29wZS5pc1ZpZXcgPSBmYWxzZTtcclxuICAgICAgJHNjb3BlLmlzVHJhZGVkID0gZmFsc2U7XHJcbiAgICAgICRzY29wZS5vcmlnaW4gPSB3aW5kb3cubG9jYXRpb24ub3JpZ2luO1xyXG4gICAgICAkc2NvcGUuZXZlbnRDb21tZW50ID0gKCRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzICYmICRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzLnNjaGVkdWxlICYmICRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzLnNjaGVkdWxlLmNvbW1lbnRzICYmICRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzLnNjaGVkdWxlLmNvbW1lbnRzLmxlbmd0aCA+IDApID8gJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3Muc2NoZWR1bGUuY29tbWVudHNbTWF0aC5yYW5kb20oKSAqICRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzLnNjaGVkdWxlLmNvbW1lbnRzLmxlbmd0aCA+PiAwXSA6ICcnO1xyXG4gICAgICB2YXIgZGVmYXVsdEF2YWlsYWJsZVNsb3RzID0ge1xyXG4gICAgICAgIHN1bmRheTogW10sXHJcbiAgICAgICAgbW9uZGF5OiBbXSxcclxuICAgICAgICB0dWVzZGF5OiBbXSxcclxuICAgICAgICB3ZWRuZXNkYXk6IFtdLFxyXG4gICAgICAgIHRodXJzZGF5OiBbXSxcclxuICAgICAgICBmcmlkYXk6IFtdLFxyXG4gICAgICAgIHNhdHVyZGF5OiBbXVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgJHNjb3BlLmNoYW5uZWxBcnIgPSBbXTtcclxuICAgICAgJHNjb3BlLmdyb3VwQXJyID0gW107XHJcbiAgICAgICRzY29wZS5zZWxlY3RlZEdyb3VwcyA9IHt9O1xyXG4gICAgICAkc2NvcGUuc2VsZWN0ZWRDaGFubmVsID0ge307XHJcbiAgICAgICRzY29wZS51bmlxdWVHcm91cCA9IFtdO1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8ICRzY29wZS51c2VyLnBhaWRSZXBvc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAkc2NvcGUudXNlci5wYWlkUmVwb3N0W2ldLmdyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uKGFjYykge1xyXG4gICAgICAgICAgaWYgKGFjYyAhPSBcIlwiICYmICRzY29wZS51bmlxdWVHcm91cC5pbmRleE9mKGFjYykgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICRzY29wZS51bmlxdWVHcm91cC5wdXNoKGFjYyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh3aW5kb3cubG9jYXRpb24uaHJlZi5pbmRleE9mKCdzY2hlZHVsZXIjbXlzY2hlZHVsZScpICE9IC0xKSB7XHJcbiAgICAgICAgJCgnLm5hdi10YWJzIGFbaHJlZj1cIiNteXNjaGVkdWxlXCJdJykudGFiKCdzaG93Jyk7XHJcbiAgICAgIH0gZWxzZSBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignc2NoZWR1bGVyI29yZ2FuaXplc2NoZWR1bGUnKSAhPSAtMSkge1xyXG4gICAgICAgICQoJy5uYXYtdGFicyBhW2hyZWY9XCIjb3JnYW5pemVzY2hlZHVsZVwiXScpLnRhYignc2hvdycpO1xyXG4gICAgICB9IGVsc2UgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ3NjaGVkdWxlciNtYW5hZ2VyZXBvc3RzJykgIT0gLTEpIHtcclxuICAgICAgICAkKCcubmF2LXRhYnMgYVtocmVmPVwiI21hbmFnZXJlcG9zdHNcIl0nKS50YWIoJ3Nob3cnKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnNldFJlcG9zdEhvdXJzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKCRzY29wZS51bnJlcG9zdEVuYWJsZSkge1xyXG4gICAgICAgICAgJHNjb3BlLnVucmVwb3N0SG91cnMgPSBcIjQ4XCI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICRzY29wZS51bnJlcG9zdEhvdXJzID0gXCJcIjtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5jaG9zZVRyYWNrMSA9IGZ1bmN0aW9uKHRyYWNrKSB7XHJcbiAgICAgICAgJHNjb3BlLnNlYXJjaFN0cmluZyA9IHRyYWNrLnRpdGxlO1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnRVUkwgPSB0cmFjay5wZXJtYWxpbmtfdXJsO1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCA9IHRyYWNrLmlkO1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQudGl0bGUgPSB0cmFjay50aXRsZTtcclxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnRyYWNrQXJ0VXJsID0gdHJhY2suYXJ0d29ya191cmw7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC5hcnRpc3ROYW1lID0gdHJhY2sudXNlci51c2VybmFtZTtcclxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnRyYWNrVVJMID0gdHJhY2sucGVybWFsaW5rX3VybFxyXG4gICAgICAgICRzY29wZS5zaG93UGxheWVyID0gdHJ1ZTtcclxuICAgICAgICB2YXIgcGxheWVyV2lkZ2V0ID0gU0MuV2lkZ2V0KCdzY1BvcHVwUGxheWVyJyk7XHJcbiAgICAgICAgcGxheWVyV2lkZ2V0LmxvYWQoJHNjb3BlLm1ha2VFdmVudFVSTCwge1xyXG4gICAgICAgICAgYXV0b19wbGF5OiBmYWxzZSxcclxuICAgICAgICAgIHNob3dfYXJ0d29yazogZmFsc2UsXHJcbiAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BvcHVwUGxheWVyJykuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xyXG4gICAgICAgICAgICBpZiAoISRzY29wZS4kJHBoYXNlKSAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJHNjb3BlLndhcm5BYm91dFByZXZSZXBvc3QoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmNob3NlVHJhY2sgPSBmdW5jdGlvbih0cmFjaykge1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnRVUkwgPSB0cmFjay5wZXJtYWxpbmtfdXJsO1xyXG4gICAgICAgICRzY29wZS5zZWFyY2hTdHJpbmcgPSB0cmFjay50aXRsZTtcclxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQgPSB0cmFjay5pZDtcclxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnRpdGxlID0gdHJhY2sudGl0bGU7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC50cmFja0FydFVybCA9IHRyYWNrLmFydHdvcmtfdXJsO1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQuYXJ0aXN0TmFtZSA9IHRyYWNrLnVzZXIudXNlcm5hbWU7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC50cmFja1VSTCA9IHRyYWNrLnBlcm1hbGlua191cmw7XHJcbiAgICAgICAgJHNjb3BlLnNob3dQbGF5ZXIgPSB0cnVlO1xyXG4gICAgICAgIHZhciBwb3B1cFBsYXllcldpZGdldCA9IFNDLldpZGdldCgnc2NQbGF5ZXInKTtcclxuICAgICAgICBwb3B1cFBsYXllcldpZGdldC5sb2FkKCRzY29wZS5tYWtlRXZlbnRVUkwsIHtcclxuICAgICAgICAgIGF1dG9fcGxheTogZmFsc2UsXHJcbiAgICAgICAgICBzaG93X2FydHdvcms6IHRydWUsXHJcbiAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcclxuICAgICAgICAgICAgaWYgKCEkc2NvcGUuJCRwaGFzZSkgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICRzY29wZS53YXJuQWJvdXRQcmV2UmVwb3N0KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS53YXJuQWJvdXRQcmV2UmVwb3N0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIGZpbHRlcmVkID0gJHNjb3BlLmV2ZW50cy5maWx0ZXIoZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgIHJldHVybiBldmVudC50cmFja0lEID09ICRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCAmJiBldmVudC5kYXkgPCAkc2NvcGUubWFrZUV2ZW50LmRheTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIGZpbHRlcmVkLnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgICAgcmV0dXJuIGIuZGF5IC0gYS5kYXk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICBpZiAoZmlsdGVyZWRbMF0gJiYgZmlsdGVyZWRbMF0udW5yZXBvc3REYXRlIDwgZmlsdGVyZWRbMF0uZGF5KSB7XHJcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZygnRllJOiBUaGlzIHNvbmcgd2lsbCBub3QgYmUgcmVwb3N0ZWQgdW5sZXNzIHlvdSB1bnJlcG9zdCB0aGUgcHJldmlvdXMgcmVwb3N0IG9mIHRoaXMgdHJhY2ssIHdoaWNoIGlzIHNjaGVkdWxlZCBmb3IgJyArIGZpbHRlcmVkWzBdLmRheS50b0xvY2FsZVN0cmluZygpICsgJy4nKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5saW5rZWRBY2NvdW50cyA9IFtdO1xyXG4gICAgICAvKkdldCBMaW5rZWQgQWNjb3VudHMqL1xyXG4gICAgICAkc2NvcGUuZ2V0TGlua2VkQWNjb3VudHMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbGlua2VkID0gJHJvb3RTY29wZS51c2VybGlua2VkQWNjb3VudHM7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5rZWQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGlmIChsaW5rZWRbaV0uX2lkICE9ICRzY29wZS51c2VyLl9pZCkge1xyXG4gICAgICAgICAgICAkc2NvcGUubGlua2VkQWNjb3VudHMucHVzaChsaW5rZWRbaV0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoISRzY29wZS4kJHBoYXNlKSAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5jaGVja0NvbW1lbnRFbmFibGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3MgJiYgJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3Muc2NoZWR1bGUpIHtcclxuICAgICAgICAgIGlmICgkc2NvcGUudXNlci5yZXBvc3RTZXR0aW5ncy5zY2hlZHVsZS5jb21tZW50ID09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5kaXNhYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgJHNjb3BlLmNvbW1lbnRFdmVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkc2NvcGUuZXZlbnRDb21tZW50ID0gXCJcIjtcclxuICAgICAgICAgICAgJHNjb3BlLmNvbW1lbnRTcmMgPSAnYXNzZXRzL2ltYWdlcy9ub0NvbW1lbnQuc3ZnJztcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICRzY29wZS5kaXNhYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICRzY29wZS5jb21tZW50RXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLnNsb3RUeXBlID09ICd0cmFjaycpIHtcclxuICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRDb21tZW50ID0gKCRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzICYmICRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzLnNjaGVkdWxlICYmICRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzLnNjaGVkdWxlLmNvbW1lbnRzICYmICRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzLnNjaGVkdWxlLmNvbW1lbnRzLmxlbmd0aCA+IDApID8gJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3Muc2NoZWR1bGUuY29tbWVudHNbTWF0aC5yYW5kb20oKSAqICRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzLnNjaGVkdWxlLmNvbW1lbnRzLmxlbmd0aF0gOiAnJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkc2NvcGUuY29tbWVudFNyYyA9ICdhc3NldHMvaW1hZ2VzL2NvbW1lbnQuc3ZnJztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzICYmICRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzLnRyYWRlKSB7XHJcbiAgICAgICAgICBpZiAoJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3MudHJhZGUuY29tbWVudCA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAkc2NvcGUuZGlzYWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICRzY29wZS5jb21tZW50RXZlbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgJHNjb3BlLmV2ZW50Q29tbWVudCA9IFwiXCI7XHJcbiAgICAgICAgICAgICRzY29wZS5jb21tZW50U3JjID0gJ2Fzc2V0cy9pbWFnZXMvbm9Db21tZW50LnN2Zyc7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkc2NvcGUuZGlzYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkc2NvcGUuY29tbWVudEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgaWYgKCRzY29wZS5zbG90VHlwZSA9PSAndHJhZGVkJykge1xyXG4gICAgICAgICAgICAgICRzY29wZS5ldmVudENvbW1lbnQgPSAoJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3MgJiYgJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3MudHJhZGUgJiYgJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3MudHJhZGUuY29tbWVudHMgJiYgJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3MudHJhZGUuY29tbWVudHMubGVuZ3RoID4gMCkgPyAkc2NvcGUudXNlci5yZXBvc3RTZXR0aW5ncy50cmFkZS5jb21tZW50c1tNYXRoLnJhbmRvbSgpICogJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3MudHJhZGUuY29tbWVudHMubGVuZ3RoXSA6ICcnO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICRzY29wZS5jb21tZW50U3JjID0gJ2Fzc2V0cy9pbWFnZXMvY29tbWVudC5zdmcnO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmNoZWNrTGlrZUVuYWJsZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICgkc2NvcGUudXNlci5yZXBvc3RTZXR0aW5ncyAmJiAkc2NvcGUudXNlci5yZXBvc3RTZXR0aW5ncy5zY2hlZHVsZSkge1xyXG4gICAgICAgICAgaWYgKCRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzLnNjaGVkdWxlLmxpa2UgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmxpa2VTcmMgPSAnYXNzZXRzL2ltYWdlcy9saWtlLnN2Zyc7XHJcbiAgICAgICAgICAgICRzY29wZS5saWtlRXZlbnQgPSBmYWxzZTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICRzY29wZS5saWtlU3JjID0gJ2Fzc2V0cy9pbWFnZXMvbGlrZVRydWUuc3ZnJztcclxuICAgICAgICAgICAgJHNjb3BlLmxpa2VFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgICRzY29wZS5jaGFuZ2VMaWtlQ29tbWVudEljb25zID0gZnVuY3Rpb24odHlwZSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHR5cGUpO1xyXG4gICAgICAgIGlmICh0eXBlID09ICdsaWtlJykge1xyXG4gICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLmxpa2VTcmMpO1xyXG4gICAgICAgICAgaWYgKCRzY29wZS5saWtlU3JjID09ICdhc3NldHMvaW1hZ2VzL2xpa2Uuc3ZnJykge1xyXG4gICAgICAgICAgICAkc2NvcGUubGlrZVNyYyA9ICdhc3NldHMvaW1hZ2VzL2xpa2VUcnVlLnN2Zyc7XHJcbiAgICAgICAgICAgICRzY29wZS5saWtlRXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJHNjb3BlLmxpa2VTcmMgPSAnYXNzZXRzL2ltYWdlcy9saWtlLnN2Zyc7XHJcbiAgICAgICAgICAgICRzY29wZS5saWtlRXZlbnQgPSBmYWxzZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5saWtlU3JjKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUuY29tbWVudFNyYyk7XHJcbiAgICAgICAgICBpZiAoJHNjb3BlLmNvbW1lbnRTcmMgPT0gJ2Fzc2V0cy9pbWFnZXMvY29tbWVudC5zdmcnKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5jb21tZW50U3JjID0gJ2Fzc2V0cy9pbWFnZXMvbm9Db21tZW50LnN2Zyc7XHJcbiAgICAgICAgICAgICRzY29wZS5tYWtlRXZlbnQuaXNDb21tZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICRzY29wZS5jb21tZW50RXZlbnQgPSBmYWxzZTtcclxuICAgICAgICAgICAgJHNjb3BlLmRpc2FibGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAkc2NvcGUuZXZlbnRDb21tZW50ID0gXCJcIjtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICRzY29wZS5jb21tZW50U3JjID0gJ2Fzc2V0cy9pbWFnZXMvY29tbWVudC5zdmcnO1xyXG4gICAgICAgICAgICAkc2NvcGUuY29tbWVudEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICAgJHNjb3BlLm1ha2VFdmVudC5pc0NvbW1lbnQgPSB0cnVlO1xyXG4gICAgICAgICAgICAkc2NvcGUuZGlzYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICBjb21tZW50SW5kZXggPSAwO1xyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLnNsb3RUeXBlID09ICd0cmFjaycpIHtcclxuICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRDb21tZW50ID0gJHNjb3BlLmlzQ29tbWVudCA/ICRzY29wZS5pc0NvbW1lbnQgOiAoJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3Muc2NoZWR1bGUuY29tbWVudHMubGVuZ3RoID4gMSA/ICRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzLnNjaGVkdWxlLmNvbW1lbnRzW01hdGgucmFuZG9tKCkgKiAkc2NvcGUudXNlci5yZXBvc3RTZXR0aW5ncy5zY2hlZHVsZS5jb21tZW50cy5sZW5ndGggPj4gMF0gOiAkc2NvcGUudXNlci5yZXBvc3RTZXR0aW5ncy5zY2hlZHVsZS5jb21tZW50c1swXSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50Q29tbWVudCA9ICRzY29wZS5pc0NvbW1lbnQgPyAkc2NvcGUuaXNDb21tZW50IDogKCRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzLnRyYWRlLmNvbW1lbnRzLmxlbmd0aCA+IDEgPyAkc2NvcGUudXNlci5yZXBvc3RTZXR0aW5ncy50cmFkZS5jb21tZW50c1tNYXRoLnJhbmRvbSgpICogJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3MudHJhZGUuY29tbWVudHMubGVuZ3RoID4+IDBdIDogJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3MudHJhZGUuY29tbWVudHNbMF0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuZ2V0UHJldk5leHRDb21tZW50ID0gZnVuY3Rpb24odHlwZSkge1xyXG4gICAgICAgIGlmICh0eXBlID09ICduZXh0Jykge1xyXG4gICAgICAgICAgaWYgKCRzY29wZS5zbG90VHlwZSA9PSAndHJhY2snICYmIGNvbW1lbnRJbmRleCA8ICRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzLnNjaGVkdWxlLmNvbW1lbnRzLmxlbmd0aCAtIDEpIHtcclxuICAgICAgICAgICAgY29tbWVudEluZGV4ID0gY29tbWVudEluZGV4ICsgMTtcclxuICAgICAgICAgICAgJHNjb3BlLmV2ZW50Q29tbWVudCA9ICRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzLnNjaGVkdWxlLmNvbW1lbnRzW2NvbW1lbnRJbmRleF07XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKCRzY29wZS5zbG90VHlwZSA9PSAndHJhZGVkJyAmJiBjb21tZW50SW5kZXggPCAkc2NvcGUudXNlci5yZXBvc3RTZXR0aW5ncy50cmFkZS5jb21tZW50cy5sZW5ndGggLSAxKSB7XHJcbiAgICAgICAgICAgIGNvbW1lbnRJbmRleCA9IGNvbW1lbnRJbmRleCArIDE7XHJcbiAgICAgICAgICAgICRzY29wZS5ldmVudENvbW1lbnQgPSAkc2NvcGUudXNlci5yZXBvc3RTZXR0aW5ncy50cmFkZS5jb21tZW50c1tjb21tZW50SW5kZXhdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBpZiAoJHNjb3BlLnNsb3RUeXBlID09ICd0cmFjaycgJiYgY29tbWVudEluZGV4ID49IDEpIHtcclxuICAgICAgICAgICAgY29tbWVudEluZGV4ID0gY29tbWVudEluZGV4IC0gMTtcclxuICAgICAgICAgICAgJHNjb3BlLmV2ZW50Q29tbWVudCA9ICRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzLnNjaGVkdWxlLmNvbW1lbnRzW2NvbW1lbnRJbmRleF07XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKCRzY29wZS5zbG90VHlwZSA9PSAndHJhZGVkJyAmJiBjb21tZW50SW5kZXggPj0gMSkge1xyXG4gICAgICAgICAgICBjb21tZW50SW5kZXggPSBjb21tZW50SW5kZXggLSAxO1xyXG4gICAgICAgICAgICAkc2NvcGUuZXZlbnRDb21tZW50ID0gJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3MudHJhZGUuY29tbWVudHNbY29tbWVudEluZGV4XTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5zYXZlUmVwb3N0U2V0dGluZ3MgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkaHR0cC5wdXQoJy9hcGkvZGF0YWJhc2UvdXBkYXRlUmVwb3N0U2V0dGluZ3MnLCB7XHJcbiAgICAgICAgICByZXBvc3RTZXR0aW5nczogJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3MsXHJcbiAgICAgICAgICBpZDogJHNjb3BlLnVzZXIuX2lkXHJcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKHJlcy5kYXRhKTtcclxuICAgICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZShyZXMuZGF0YSk7XHJcbiAgICAgICAgICAkc2NvcGUudXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcclxuICAgICAgICAgICRzY29wZS5jaGVja0NvbW1lbnRFbmFibGUoKTtcclxuICAgICAgICAgICRzY29wZS5jaGVja0xpa2VFbmFibGUoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmRlbGV0ZUNvbW1lbnQgPSBmdW5jdGlvbihjb21tZW50SW5kZXgsIHR5cGUpIHtcclxuICAgICAgICBpZiAodHlwZSA9PSAnc2NoZWR1bGUnKSB7XHJcbiAgICAgICAgICAkc2NvcGUudXNlci5yZXBvc3RTZXR0aW5ncy5zY2hlZHVsZS5jb21tZW50cy5zcGxpY2UoY29tbWVudEluZGV4LCAxKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gJ3RyYWRlJykge1xyXG4gICAgICAgICAgJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3MudHJhZGUuY29tbWVudHMuc3BsaWNlKGNvbW1lbnRJbmRleCwgMSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICRzY29wZS5zYXZlUmVwb3N0U2V0dGluZ3MoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnNhdmVDb21tZW50cyA9IGZ1bmN0aW9uKHZhbHVlLCB0eXBlLCBpbmRleCkge1xyXG4gICAgICAgIHZhciBjb21tZW50cyA9IFtdO1xyXG4gICAgICAgIGlmICh0eXBlID09ICdzY2hlZHVsZScgJiYgdmFsdWUpIHtcclxuICAgICAgICAgIGNvbW1lbnRzID0gKCRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzLnNjaGVkdWxlLmNvbW1lbnRzID8gJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3Muc2NoZWR1bGUuY29tbWVudHMgOiBbXSk7XHJcbiAgICAgICAgICBpZiAoaW5kZXggPT0gdW5kZWZpbmVkKVxyXG4gICAgICAgICAgICBjb21tZW50cy5wdXNoKHZhbHVlKTtcclxuICAgICAgICAgIGVsc2VcclxuICAgICAgICAgICAgY29tbWVudHNbaW5kZXhdID0gdmFsdWU7XHJcblxyXG4gICAgICAgICAgJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3Muc2NoZWR1bGUuY29tbWVudHMgPSBjb21tZW50cztcclxuICAgICAgICAgICRzY29wZS5zYXZlUmVwb3N0U2V0dGluZ3MoKTtcclxuICAgICAgICAgICRzY29wZS5zY2hlZHVsZUNvbW1lbnQgPSBcIlwiO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZSA9PSAndHJhZGUnICYmIHZhbHVlKSB7XHJcbiAgICAgICAgICBjb21tZW50cyA9ICgkc2NvcGUudXNlci5yZXBvc3RTZXR0aW5ncy50cmFkZS5jb21tZW50cyA/ICRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzLnRyYWRlLmNvbW1lbnRzIDogW10pO1xyXG4gICAgICAgICAgaWYgKGluZGV4ID09IHVuZGVmaW5lZClcclxuICAgICAgICAgICAgY29tbWVudHMucHVzaCh2YWx1ZSk7XHJcbiAgICAgICAgICBlbHNlXHJcbiAgICAgICAgICAgIGNvbW1lbnRzW2luZGV4XSA9IHZhbHVlO1xyXG4gICAgICAgICAgJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3MudHJhZGUuY29tbWVudHMgPSBjb21tZW50cztcclxuICAgICAgICAgICRzY29wZS5zYXZlUmVwb3N0U2V0dGluZ3MoKTtcclxuICAgICAgICAgICRzY29wZS50cmFkZUNvbW1lbnQgPSBcIlwiO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIlBsZWFzZSBlbnRlciBjb21tZW50XCIpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmVkaXRDb21tZW50cyA9IGZ1bmN0aW9uKGNvbW1lbnQsIHR5cGUsIGluZGV4KSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coaW5kZXgpO1xyXG4gICAgICAgICRzY29wZS5zY2hlZHVsZUNvbW1lbnRJbmRleCA9IGluZGV4O1xyXG4gICAgICAgIGlmICh0eXBlID09ICdzY2hlZHVsZScpIHtcclxuICAgICAgICAgICQoJyNzY2hlZHVsZUNvbW1lbnRNb2RhbCcpLm1vZGFsKCdzaG93Jyk7XHJcbiAgICAgICAgICAkc2NvcGUuc2NoZWR1bGVDb21tZW50ID0gY29tbWVudDtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGUgPT0gJ3RyYWRlJykge1xyXG4gICAgICAgICAgJCgnI3RyYWRlQ29tbWVudE1vZGFsJykubW9kYWwoJ3Nob3cnKTtcclxuICAgICAgICAgICRzY29wZS50cmFkZUNvbW1lbnQgPSBjb21tZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnNldEFjdGl2ZSA9IGZ1bmN0aW9uKHR5cGUpIHtcclxuICAgICAgICAkc2NvcGUuZGlzcGxheVR5cGUgPSB0eXBlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuc2V0Q2hhbm5lbCA9IGZ1bmN0aW9uKHZhbHVlKSB7XHJcbiAgICAgICAgaWYgKCRzY29wZS5kaXNwbGF5VHlwZSA9PSAnY2hhbm5lbCcpIHtcclxuICAgICAgICAgIHZhciBpbmRleCA9ICRzY29wZS5jaGFubmVsQXJyLmluZGV4T2YodmFsdWUpO1xyXG4gICAgICAgICAgaWYgKGluZGV4ID09IC0xKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5jaGFubmVsQXJyLnB1c2godmFsdWUpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJHNjb3BlLmNoYW5uZWxBcnIuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgJHNjb3BlLm90aGVyQ2hhbm5lbHNBbmRHcm91cHMoKTtcclxuICAgICAgICAkc2NvcGUuZm9sbG93ZXJzQ291bnQoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnNldEdyb3VwID0gZnVuY3Rpb24odmFsdWUpIHtcclxuICAgICAgICBpZiAoJHNjb3BlLmRpc3BsYXlUeXBlID09ICdncm91cCcpIHtcclxuICAgICAgICAgIHZhciBpbmRleCA9ICRzY29wZS5ncm91cEFyci5pbmRleE9mKHZhbHVlKTtcclxuICAgICAgICAgIGlmIChpbmRleCA9PSAtMSkge1xyXG4gICAgICAgICAgICAkc2NvcGUuZ3JvdXBBcnIucHVzaCh2YWx1ZSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkc2NvcGUuZ3JvdXBBcnIuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgJHNjb3BlLm90aGVyQ2hhbm5lbHNBbmRHcm91cHMoKTtcclxuICAgICAgICAkc2NvcGUuZm9sbG93ZXJzQ291bnQoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gZm9ybWF0QU1QTShkYXRlKSB7XHJcbiAgICAgICAgdmFyIGhvdXJzID0gZGF0ZS5nZXRIb3VycygpO1xyXG4gICAgICAgIHZhciBtaW51dGVzID0gZGF0ZS5nZXRNaW51dGVzKCk7XHJcbiAgICAgICAgdmFyIGFtcG0gPSBob3VycyA+PSAxMiA/ICdQTScgOiAnQU0nO1xyXG4gICAgICAgIGhvdXJzID0gaG91cnMgJSAxMjtcclxuICAgICAgICBob3VycyA9IGhvdXJzID8gaG91cnMgOiAxMjsgLy8gdGhlIGhvdXIgJzAnIHNob3VsZCBiZSAnMTInXHJcbiAgICAgICAgbWludXRlcyA9IG1pbnV0ZXMgPCAxMCA/ICcwJyArIG1pbnV0ZXMgOiBtaW51dGVzO1xyXG4gICAgICAgIHZhciBzdHJUaW1lID0gKGhvdXJzIDwgMTAgPyBob3VycyA6IGhvdXJzKSArICc6JyArIG1pbnV0ZXMgKyBhbXBtO1xyXG4gICAgICAgIHJldHVybiBzdHJUaW1lO1xyXG4gICAgICB9XHJcbiAgICAgICRzY29wZS5wc2V1ZG9BdmFpbGFibGVTbG90cyA9ICgoJHNjb3BlLnVzZXIucHNldWRvQXZhaWxhYmxlU2xvdHMgIT0gdW5kZWZpbmVkKSA/ICRzY29wZS51c2VyLnBzZXVkb0F2YWlsYWJsZVNsb3RzIDogZGVmYXVsdEF2YWlsYWJsZVNsb3RzKTtcclxuICAgICAgJHNjb3BlLnNldFZpZXcgPSBmdW5jdGlvbih2aWV3KSB7XHJcbiAgICAgICAgJHNjb3BlLml0ZW12aWV3ID0gdmlldztcclxuICAgICAgICAkc2NvcGUuZ2V0TGlzdEV2ZW50cygpO1xyXG4gICAgICB9O1xyXG4gICAgICAkc2NvcGUudHJhY2tDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnRVUkwgPSAkc2NvcGUudHJhY2tMaXN0U2xvdE9iai5wZXJtYWxpbmtfdXJsO1xyXG4gICAgICAgICRzY29wZS5jaGFuZ2VVUkwoKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgICRzY29wZS5zaG93VGFiID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLnRhYlNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmFkZE5ld1NvbmcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUuaXNFZGl0ID0gZmFsc2U7XHJcbiAgICAgICAgJHNjb3BlLnRhYlNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudFVSTCA9IFwiXCI7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudCA9IHtcclxuICAgICAgICAgIHR5cGU6ICd0cmFjaydcclxuICAgICAgICB9O1xyXG4gICAgICAgICRzY29wZS51bnJlcG9zdEhvdXJzID0gXCI0OFwiO1xyXG4gICAgICAgICRzY29wZS51bnJlcG9zdEVuYWJsZSA9IHRydWU7XHJcbiAgICAgICAgJHNjb3BlLmV2ZW50Q29tbWVudCA9IFwiXCI7XHJcbiAgICAgICAgJHNjb3BlLmNoYW5uZWxBcnIgPSBbXTtcclxuICAgICAgICAkc2NvcGUuc2VsZWN0ZWRTbG90ID0gXCJcIjtcclxuICAgICAgICAkc2NvcGUuZm9sbG93ZXJzQ291bnQoKTtcclxuICAgICAgICAkc2NvcGUuc2V0U2NoZWR1bGVMaWtlQ29tbWVudCgpO1xyXG4gICAgICAgICRzY29wZS5zaG93UGxheWVyID0gZmFsc2U7XHJcbiAgICAgICAgJHNjb3BlLmdldExpc3RFdmVudHMoKTtcclxuICAgICAgICBpZiAoJHNjb3BlLmxpc3RBdmFpbGFibGVTbG90c1swXSkgJHNjb3BlLnNlbGVjdGVkU2xvdCA9ICRzY29wZS5maXJzdFNsb3QgPSBKU09OLnN0cmluZ2lmeSgkc2NvcGUubGlzdEF2YWlsYWJsZVNsb3RzWzBdKTtcclxuICAgICAgICAkc2NvcGUuY2xpY2tBdmFpbGFibGVTbG90cygkc2NvcGUuZmlyc3RTbG90KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmlzU2NoZWR1bGUgPSBmYWxzZTtcclxuICAgICAgJHNjb3BlLnNjaGVkdWxlU29uZyA9IGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgICAgICAkc2NvcGUuaXNUcmFkZWQgPSBmYWxzZTtcclxuICAgICAgICAkc2NvcGUuYWZjb3VudCA9IDA7XHJcbiAgICAgICAgJHNjb3BlLmlzRWRpdCA9IGZhbHNlO1xyXG4gICAgICAgICRzY29wZS5pc1NjaGVkdWxlID0gdHJ1ZTtcclxuICAgICAgICAkc2NvcGUudGFiU2VsZWN0ZWQgPSBmYWxzZTtcclxuICAgICAgICAkc2NvcGUuaXNWaWV3ID0gZmFsc2U7XHJcbiAgICAgICAgJHNjb3BlLnVucmVwb3N0RW5hYmxlID0gdHJ1ZTtcclxuICAgICAgICAkc2NvcGUudW5yZXBvc3RIb3VycyA9IFwiNDhcIjtcclxuICAgICAgICAkc2NvcGUubmV3RXZlbnQgPSB0cnVlO1xyXG4gICAgICAgICRzY29wZS5zaG93UGxheWVyID0gZmFsc2U7XHJcbiAgICAgICAgJHNjb3BlLmlzQ29tbWVudCA9IFwiXCI7XHJcbiAgICAgICAgJHNjb3BlLnNldFNjaGVkdWxlTGlrZUNvbW1lbnQoKTtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcclxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50ID0ge1xyXG4gICAgICAgICAgdXNlcklEOiAkc2NvcGUudXNlci5zb3VuZGNsb3VkLmlkLFxyXG4gICAgICAgICAgdHlwZTogXCJ0cmFja1wiXHJcbiAgICAgICAgfTtcclxuICAgICAgICAkc2NvcGUuc2VsZWN0ZWRTbG90ID0gZGF0ZTtcclxuICAgICAgICB2YXIgc2VsZWN0ZWRTbG90ID0gbmV3IERhdGUoJHNjb3BlLnNlbGVjdGVkU2xvdCk7XHJcbiAgICAgICAgdmFyIGRheSA9IG5ldyBEYXRlKHNlbGVjdGVkU2xvdC5nZXRUaW1lKCkgLSBzZWxlY3RlZFNsb3QuZ2V0VGltZXpvbmVPZmZzZXQoKSAqIDYwMDAwKS50b0lTT1N0cmluZygpO1xyXG4gICAgICAgIHZhciBob3VyID0gQ29udmVydFN0cmluZ1RpbWVUb1VUQyhzZWxlY3RlZFNsb3QuZ2V0SG91cnMoKSk7XHJcbiAgICAgICAgdmFyIG1ha2VEYXkgPSBuZXcgRGF0ZShkYXkpO1xyXG4gICAgICAgIG1ha2VEYXkuc2V0SG91cnMoaG91cik7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC5kYXkgPSBtYWtlRGF5O1xyXG4gICAgICAgICRzY29wZS5zZWxlY3RlZFNsb3QgPSBuZXcgRGF0ZShkYXRlKTtcclxuICAgICAgICAkc2NvcGUuZWRpdENoYW5uZWxBcnIgPSBbXTtcclxuICAgICAgICAkc2NvcGUuY2hhbm5lbEFyciA9IFtdO1xyXG4gICAgICAgICRzY29wZS5zbG90VHlwZSA9ICd0cmFjayc7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5pc0VkaXQgPSBmYWxzZTtcclxuICAgICAgJHNjb3BlLkVkaXROZXdTb25nID0gZnVuY3Rpb24oaXRlbSwgZWRpdGFibGUpIHtcclxuICAgICAgICAkc2NvcGUuYWZjb3VudCA9IDA7XHJcbiAgICAgICAgJHNjb3BlLmVkaXRDaGFubmVsQXJyID0gW107XHJcbiAgICAgICAgJHNjb3BlLnRhYlNlbGVjdGVkID0gZmFsc2U7XHJcbiAgICAgICAgJHNjb3BlLmlzRWRpdCA9IHRydWU7XHJcbiAgICAgICAgJHNjb3BlLmlzVHJhZGVkID0gZmFsc2U7XHJcbiAgICAgICAgJHNjb3BlLmlzU2NoZWR1bGUgPSBmYWxzZTtcclxuICAgICAgICAkc2NvcGUuZGVsZXRlRXZlbnREYXRhID0gaXRlbTtcclxuICAgICAgICB2YXIgbmV3T2JqID0gYW5ndWxhci5jb3B5KGl0ZW0pO1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnRVUkwgPSBuZXdPYmouZXZlbnQudHJhY2tVUkw7XHJcbiAgICAgICAgJHNjb3BlLnNlbGVjdGVkU2xvdCA9IG5ld09iai5ldmVudC5kYXk7XHJcbiAgICAgICAgJHNjb3BlLmxpa2VTcmMgPSAobmV3T2JqLmV2ZW50Lmxpa2UgPT0gdHJ1ZSkgPyAnYXNzZXRzL2ltYWdlcy9saWtlVHJ1ZS5zdmcnIDogJ2Fzc2V0cy9pbWFnZXMvbGlrZS5zdmcnO1xyXG4gICAgICAgICRzY29wZS5saWtlRXZlbnQgPSBuZXdPYmouZXZlbnQubGlrZTtcclxuICAgICAgICAkc2NvcGUuY29tbWVudFNyYyA9IChuZXdPYmouZXZlbnQuY29tbWVudCAhPSBcIlwiKSA/ICdhc3NldHMvaW1hZ2VzL2NvbW1lbnQuc3ZnJyA6ICdhc3NldHMvaW1hZ2VzL25vQ29tbWVudC5zdmcnO1xyXG4gICAgICAgICRzY29wZS5jb21tZW50RXZlbnQgPSAobmV3T2JqLmV2ZW50LmNvbW1lbnQgIT0gXCJcIiA/IHRydWUgOiBmYWxzZSk7XHJcbiAgICAgICAgJHNjb3BlLmRpc2FibGUgPSAhJHNjb3BlLmNvbW1lbnRFdmVudDtcclxuICAgICAgICAkc2NvcGUuZXZlbnRDb21tZW50ID0gXCJcIjtcclxuICAgICAgICBpZiAoJHNjb3BlLmNvbW1lbnRFdmVudCkge1xyXG4gICAgICAgICAgJHNjb3BlLmV2ZW50Q29tbWVudCA9IG5ld09iai5ldmVudC5jb21tZW50O1xyXG4gICAgICAgICAgJHNjb3BlLmlzQ29tbWVudCA9IG5ld09iai5ldmVudC5jb21tZW50O1xyXG4gICAgICAgIH1cclxuICAgICAgICAkc2NvcGUudGltZUdhcCA9IG5ld09iai5ldmVudC50aW1lR2FwO1xyXG4gICAgICAgICRzY29wZS51bnJlcG9zdEhvdXJzID0gbmV3T2JqLmV2ZW50LnVucmVwb3N0SG91cnM7XHJcbiAgICAgICAgJHNjb3BlLnVucmVwb3N0RW5hYmxlID0gbmV3IERhdGUobmV3T2JqLmV2ZW50LnVucmVwb3N0RGF0ZSkgPiBuZXcgRGF0ZSgxMDAwKTtcclxuICAgICAgICB2YXIgY2hhbm5lbHMgPSBuZXdPYmouZXZlbnQub3RoZXJDaGFubmVscztcclxuICAgICAgICBpZiAoY2hhbm5lbHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGFubmVscy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8ICRzY29wZS5saW5rZWRBY2NvdW50cy5sZW5ndGg7IGorKykge1xyXG4gICAgICAgICAgICAgIGlmIChjaGFubmVsc1tpXSA9PSAkc2NvcGUubGlua2VkQWNjb3VudHNbal0uc291bmRjbG91ZC5pZCkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmVkaXRDaGFubmVsQXJyLnB1c2goJHNjb3BlLmxpbmtlZEFjY291bnRzW2pdLm5hbWUpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgJHNjb3BlLmNoYW5uZWxBcnIgPSAkc2NvcGUuZWRpdENoYW5uZWxBcnI7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIFNDLldpZGdldCgnc2NQbGF5ZXInKS5sb2FkKCRzY29wZS5tYWtlRXZlbnRVUkwsIHtcclxuICAgICAgICAgIGF1dG9fcGxheTogZmFsc2UsXHJcbiAgICAgICAgICBzaG93X2FydHdvcms6IHRydWVcclxuICAgICAgICB9KTtcclxuICAgICAgICAkc2NvcGUuc2xvdFR5cGUgPSBpdGVtLmV2ZW50LnR5cGU7XHJcbiAgICAgICAgaWYgKCRzY29wZS5zbG90VHlwZSA9PSBcInRyYWRlZFwiIHx8ICRzY29wZS5zbG90VHlwZSA9PSAncGFpZCcpXHJcbiAgICAgICAgICAkc2NvcGUuaXNUcmFkZWQgPSB0cnVlO1xyXG4gICAgICAgICRzY29wZS5zaG93UGxheWVyID0gdHJ1ZTtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XHJcbiAgICAgICAgaWYgKGl0ZW0uZXZlbnQudHlwZSA9PSAndHJhZGVkJyAmJiBpdGVtLmV2ZW50LnRyYWNrVVJMKSB7XHJcbiAgICAgICAgICAkc2NvcGUuaXNWaWV3ID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2UgaWYgKGl0ZW0uZXZlbnQudHlwZSA9PSAndHJhZGVkJyAmJiAhaXRlbS5ldmVudC50cmFja1VSTCkge1xyXG4gICAgICAgICAgJHNjb3BlLnNldFRyYWRlZExpa2VDb21tZW50KCk7XHJcbiAgICAgICAgfSBlbHNlIGlmIChpdGVtLmV2ZW50LnR5cGUgPT0gJ3RyYWRlZCcgJiYgIWl0ZW0uZXZlbnQudHJhY2tVUkwpIHtcclxuICAgICAgICAgICRzY29wZS5zZXRUcmFkZWRMaWtlQ29tbWVudCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkc2NvcGUuZm9sbG93ZXJzQ291bnQoKTtcclxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50ID0ge307XHJcbiAgICAgICAgJHNjb3BlLm5ld0V2ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgdmFyIHNlbGVjdGVkU2xvdCA9ICRzY29wZS5zZWxlY3RlZFNsb3Q7XHJcbiAgICAgICAgdmFyIGRheSA9IG5ldyBEYXRlKHNlbGVjdGVkU2xvdC5nZXRUaW1lKCkgLSBzZWxlY3RlZFNsb3QuZ2V0VGltZXpvbmVPZmZzZXQoKSAqIDYwMDAwKS50b0lTT1N0cmluZygpO1xyXG4gICAgICAgIHZhciBob3VyID0gQ29udmVydFN0cmluZ1RpbWVUb1VUQyhzZWxlY3RlZFNsb3QuZ2V0SG91cnMoKSk7XHJcbiAgICAgICAgdmFyIG1ha2VEYXkgPSBuZXcgRGF0ZShkYXkpO1xyXG4gICAgICAgIG1ha2VEYXkuc2V0SG91cnMoaG91cik7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC50cmFja0lEID0gbmV3T2JqLmV2ZW50LnRyYWNrSUQ7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC5kYXkgPSBtYWtlRGF5O1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQuX2lkID0gbmV3T2JqLmV2ZW50Ll9pZDtcclxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnRyYWNrVVJMID0gJHNjb3BlLm1ha2VFdmVudFVSTDtcclxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnRpdGxlID0gbmV3T2JqLmV2ZW50LnRpdGxlO1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQudHlwZSA9IGl0ZW0uZXZlbnQudHlwZTtcclxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50Lm93bmVyID0gbmV3T2JqLmV2ZW50Lm93bmVyO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuYWRkTmV3U29uZ0NhbmNlbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS50YWJTZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudFVSTCA9IFwiXCI7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudCA9IG51bGw7XHJcbiAgICAgICAgJHNjb3BlLnNob3dQbGF5ZXIgPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gZ2V0c2hvcnRkYXRlKGQpIHtcclxuICAgICAgICB2YXIgWVlZWSA9IGQuZ2V0RnVsbFllYXIoKTtcclxuICAgICAgICB2YXIgTSA9IGQuZ2V0TW9udGgoKSArIDE7XHJcbiAgICAgICAgdmFyIEQgPSBkLmdldERhdGUoKTtcclxuICAgICAgICB2YXIgTU0gPSAoTSA8IDEwKSA/ICgnMCcgKyBNKSA6IE07XHJcbiAgICAgICAgdmFyIEREID0gKEQgPCAxMCkgPyAoJzAnICsgRCkgOiBEO1xyXG4gICAgICAgIHZhciByZXN1bHQgPSBNTSArIFwiL1wiICsgREQgKyBcIi9cIiArIFlZWVk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmdldFByZXZpb3VzRXZlbnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLmxpc3REYXlJbmNyLS07XHJcbiAgICAgICAgJHNjb3BlLmdldExpc3RFdmVudHMoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmdldExpc3RFdmVudHMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUubGlzdGV2ZW50cyA9IFtdO1xyXG4gICAgICAgIHZhciBjdXJyZW50RGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgY3VycmVudERhdGUuc2V0RGF0ZShjdXJyZW50RGF0ZS5nZXREYXRlKCkgKyAkc2NvcGUubGlzdERheUluY3IpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNzsgaSsrKSB7XHJcbiAgICAgICAgICB2YXIgZCA9IG5ldyBEYXRlKGN1cnJlbnREYXRlKTtcclxuICAgICAgICAgIGQuc2V0RGF0ZShkLmdldERhdGUoKSArIGkpO1xyXG4gICAgICAgICAgdmFyIGN1cnJlbnREYXkgPSBwYXJzZUludChkLmdldERheSgpKTtcclxuICAgICAgICAgIHZhciBzdHJEZGF0ZSA9IGdldHNob3J0ZGF0ZShkKTtcclxuICAgICAgICAgIHZhciBzbG90cyA9ICRzY29wZS5wc2V1ZG9BdmFpbGFibGVTbG90c1tkYXlzQXJyYXlbY3VycmVudERheV1dO1xyXG4gICAgICAgICAgc2xvdHMgPSBzbG90cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEgLSBiXHJcbiAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICBhbmd1bGFyLmZvckVhY2goc2xvdHMsIGZ1bmN0aW9uKHMpIHtcclxuICAgICAgICAgICAgdmFyIGl0ZW0gPSBuZXcgT2JqZWN0KCk7XHJcbiAgICAgICAgICAgIHZhciBoID0gcztcclxuICAgICAgICAgICAgdmFyIHRpbWUgPSAnJztcclxuICAgICAgICAgICAgaWYgKGggPj0gMTIpIHtcclxuICAgICAgICAgICAgICBoID0gaCAtIDEyO1xyXG4gICAgICAgICAgICAgIHRpbWUgPSBoICsgXCIgUE1cIjtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICB0aW1lID0gaCArIFwiIEFNXCI7XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgIHZhciBjYWxlbmRhckRheSA9ICRzY29wZS5jYWxlbmRhci5maW5kKGZ1bmN0aW9uKGNhbEQpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gY2FsRC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gZC50b0xvY2FsZURhdGVTdHJpbmcoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHZhciBldmVudCA9IGNhbGVuZGFyRGF5LmV2ZW50cy5maW5kKGZ1bmN0aW9uKGV2KSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGV2LmRheSkuZ2V0SG91cnMoKSA9PSBzO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGl0ZW0uZXZlbnQgPSBldmVudDtcclxuICAgICAgICAgICAgdmFyIGR0ID0gbmV3IERhdGUoc3RyRGRhdGUpO1xyXG4gICAgICAgICAgICBkdC5zZXRIb3VycyhzKTtcclxuICAgICAgICAgICAgaXRlbS5kYXRlID0gbmV3IERhdGUoZHQpO1xyXG4gICAgICAgICAgICBpZiAoIWl0ZW0uZXZlbnQpIHtcclxuICAgICAgICAgICAgICBpZiAobmV3IERhdGUoaXRlbS5kYXRlKS5nZXRUaW1lKCkgPiBuZXcgRGF0ZSgpLmdldFRpbWUoKSkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmxpc3RldmVudHMucHVzaChpdGVtKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoaXRlbS5ldmVudCkge1xyXG4gICAgICAgICAgICAgICRzY29wZS5saXN0ZXZlbnRzLnB1c2goaXRlbSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKGV2ZW50ID09IHVuZGVmaW5lZCAmJiBuZXcgRGF0ZShpdGVtLmRhdGUpID4gbmV3IERhdGUoKSkge1xyXG4gICAgICAgICAgICAgIGl0ZW0uc2xvdGRhdGUgPSBkO1xyXG4gICAgICAgICAgICAgIGl0ZW0uc2xvdHRpbWUgPSB0aW1lO1xyXG4gICAgICAgICAgICAgICRzY29wZS5saXN0QXZhaWxhYmxlU2xvdHMucHVzaChpdGVtKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuZ2V0TmV4dEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS5saXN0RGF5SW5jcisrO1xyXG4gICAgICAgICRzY29wZS5nZXRMaXN0RXZlbnRzKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5nZXROZXh0RGF5T2ZXZWVrID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHRoaXNEYXkgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNzsgaSsrKSB7XHJcbiAgICAgICAgICB0aGlzRGF5LnNldERhdGUodGhpc0RheS5nZXREYXRlKCkgKyAxKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS50b2dnbGVBdmFpbGFibGVTbG90ID0gZnVuY3Rpb24oZGF5LCBob3VyKSB7XHJcbiAgICAgICAgdmFyIHB1c2hob3VyID0gcGFyc2VJbnQoaG91cik7XHJcbiAgICAgICAgaWYgKCRzY29wZS5wc2V1ZG9BdmFpbGFibGVTbG90c1tkYXlzQXJyYXlbZGF5XV0uaW5kZXhPZihwdXNoaG91cikgPiAtMSkge1xyXG4gICAgICAgICAgaWYgKCRzY29wZS5wc2V1ZG9BdmFpbGFibGVTbG90c1tkYXlzQXJyYXlbZGF5XV0ubGVuZ3RoIDw9IDIpIHtcclxuICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJDYW5ub3QgcmVtb3ZlIHNsb3QuIFlvdSBtdXN0IGhhdmUgYXQgbGVhc3QgMiByZXBvc3Qgc2xvdHMgcGVyIGRheS5cIik7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkc2NvcGUucHNldWRvQXZhaWxhYmxlU2xvdHNbZGF5c0FycmF5W2RheV1dLnNwbGljZSgkc2NvcGUucHNldWRvQXZhaWxhYmxlU2xvdHNbZGF5c0FycmF5W2RheV1dLmluZGV4T2YocHVzaGhvdXIpLCAxKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKCRzY29wZS50b29NYW55UmVwb3N0cyhkYXksIGhvdXIpKSB7XHJcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkNhbm5vdCBzY2hlZHVsZSBzbG90LiBXZSBvbmx5IGFsbG93IDEyIHJlcG9zdHMgd2l0aGluIDI0IGhvdXJzIHRvIHByZXZlbnQgeW91IGZyb20gYmVpbmcgcmVwb3N0IGJsb2NrZWQuXCIpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAkc2NvcGUucHNldWRvQXZhaWxhYmxlU2xvdHNbZGF5c0FycmF5W2RheV1dLnB1c2gocHVzaGhvdXIpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkc2NvcGUudXNlci5hdmFpbGFibGVTbG90cyA9IGNyZWF0ZUF2YWlsYWJsZVNsb3RzKCRzY29wZS51c2VyLCAkc2NvcGUucHNldWRvQXZhaWxhYmxlU2xvdHMpO1xyXG4gICAgICAgICRodHRwLnBvc3QoJy9hcGkvZXZlbnRzL3NhdmVBdmFpbGFibGVTbG90cycsIHtcclxuICAgICAgICAgIGF2YWlsYWJsZXNsb3RzOiAkc2NvcGUudXNlci5hdmFpbGFibGVTbG90cyxcclxuICAgICAgICAgIGlkOiAkc2NvcGUudXNlci5faWRcclxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlKHJlcy5kYXRhKTtcclxuICAgICAgICAgICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICAgICAgIH0pLnRoZW4obnVsbCwgY29uc29sZS5sb2cpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUudG9vTWFueVJlcG9zdHMgPSBmdW5jdGlvbihkYXksIGhvdXIpIHtcclxuICAgICAgICB2YXIgc3RhcnREYXlJbnQgPSAoZGF5ICsgNikgJSA3O1xyXG4gICAgICAgIHZhciBhbGxTbG90cyA9IFtdXHJcbiAgICAgICAgdmFyIHdvdWxkQmVTbG90cyA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoJHNjb3BlLnBzZXVkb0F2YWlsYWJsZVNsb3RzKSk7XHJcbiAgICAgICAgd291bGRCZVNsb3RzW2RheXNBcnJheVtkYXldXS5wdXNoKGhvdXIpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMzsgaSsrKSB7XHJcbiAgICAgICAgICB3b3VsZEJlU2xvdHNbZGF5c0FycmF5WyhzdGFydERheUludCArIGkpICUgN11dXHJcbiAgICAgICAgICAgIC5mb3JFYWNoKGZ1bmN0aW9uKHNsb3QpIHtcclxuICAgICAgICAgICAgICBhbGxTbG90cy5wdXNoKHNsb3QgKyBpICogMjQpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH1cclxuICAgICAgICBhbGxTbG90cyA9IGFsbFNsb3RzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgICAgcmV0dXJuIGEgLSBiO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgdmFyIGNoZWNraW5nU2xvdHMgPSBbXTtcclxuICAgICAgICB2YXIgc3RhdHVzID0gZmFsc2U7XHJcbiAgICAgICAgYWxsU2xvdHMuZm9yRWFjaChmdW5jdGlvbihzbG90KSB7XHJcbiAgICAgICAgICB2YXIgaSA9IDA7XHJcbiAgICAgICAgICB3aGlsZSAoaSA8IGNoZWNraW5nU2xvdHMubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyhjaGVja2luZ1Nsb3RzW2ldIC0gc2xvdCkgPj0gMjQpIGNoZWNraW5nU2xvdHMuc3BsaWNlKGksIDEpO1xyXG4gICAgICAgICAgICBlbHNlIGkrKztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNoZWNraW5nU2xvdHMucHVzaChzbG90KTtcclxuICAgICAgICAgIGlmIChjaGVja2luZ1Nsb3RzLmxlbmd0aCA+IDEyKSB7XHJcbiAgICAgICAgICAgIHN0YXR1cyA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICByZXR1cm4gc3RhdHVzO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuc2V0U2xvdFN0eWxlID0gZnVuY3Rpb24oZGF5LCBob3VyKSB7XHJcbiAgICAgICAgdmFyIHN0eWxlID0ge1xyXG4gICAgICAgICAgJ2JvcmRlci1yYWRpdXMnOiAnNHB4J1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgaWYgKCRzY29wZS5wc2V1ZG9BdmFpbGFibGVTbG90cyAmJiAkc2NvcGUucHNldWRvQXZhaWxhYmxlU2xvdHNbZGF5c0FycmF5W2RheV1dLmluZGV4T2YoaG91cikgPiAtMSkge1xyXG4gICAgICAgICAgc3R5bGUgPSB7XHJcbiAgICAgICAgICAgICdiYWNrZ3JvdW5kLWNvbG9yJzogXCIjZmZmXCIsXHJcbiAgICAgICAgICAgICdib3JkZXItY29sb3InOiBcIiM5OTlcIixcclxuICAgICAgICAgICAgJ2JvcmRlci1yYWRpdXMnOiAnNHB4JyxcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzdHlsZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmdldENoYW5uZWxzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLmNoYW5uZWxzID0gW1wiRW1pbFwiLCBcIlRvYmlhc1wiLCBcIkxpbnVzXCJdO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuZ2V0VHJhY2tMaXN0RnJvbVNvdW5kY2xvdWQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgcHJvZmlsZSA9ICRzY29wZS51c2VyO1xyXG4gICAgICAgIGlmIChwcm9maWxlLnNvdW5kY2xvdWQpIHtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgICAgIFNDLmdldCgnL3VzZXJzLycgKyBwcm9maWxlLnNvdW5kY2xvdWQuaWQgKyAnL3RyYWNrcycsIHtcclxuICAgICAgICAgICAgICBmaWx0ZXI6ICdwdWJsaWMnXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHRyYWNrcykge1xyXG4gICAgICAgICAgICAgICRzY29wZS50cmFja0xpc3QgPSB0cmFja3M7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICBpZiAoISRzY29wZS4kJHBoYXNlKSAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgaWYgKCEkc2NvcGUuJCRwaGFzZSkgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5zYXZlVXNlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgICAkaHR0cC5wdXQoXCIvYXBpL2RhdGFiYXNlL3Byb2ZpbGVcIiwgJHNjb3BlLnVzZXIpXHJcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlKHJlcy5kYXRhKTtcclxuICAgICAgICAgICAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKFwiRXJyb3I6IGRpZCBub3Qgc2F2ZVwiKTtcclxuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuaW5jckRheSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICgkc2NvcGUuZGF5SW5jciA8IDQyKSAkc2NvcGUuZGF5SW5jcisrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuZGVjckRheSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICgkc2NvcGUuZGF5SW5jciA+IDApICRzY29wZS5kYXlJbmNyLS07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIENvbnZlcnRTdHJpbmdUaW1lVG9VVEMoc3RyVGltZSkge1xyXG4gICAgICAgIHZhciB0aW1lID0gU3RyaW5nKHN0clRpbWUpO1xyXG4gICAgICAgIHZhciBob3VycyA9IE51bWJlcih0aW1lLnNwbGl0KCc6JylbMF0pO1xyXG4gICAgICAgIHZhciBBTVBNID0gdGltZS5zcGxpdCgnICcpWzFdO1xyXG4gICAgICAgIGlmIChBTVBNID09PSBcIlBNXCIgJiYgaG91cnMgPCAxMikge1xyXG4gICAgICAgICAgaG91cnMgPSBob3VycyArIDEyXHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmIChBTVBNID09PSBcIkFNXCIgJiYgaG91cnMgPT09IDEyKSB7XHJcbiAgICAgICAgICBob3VycyA9IGhvdXJzIC0gMTJcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHNIb3VycyA9IGhvdXJzLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgaWYgKGhvdXJzIDwgMTApIHtcclxuICAgICAgICAgIHNIb3VycyA9IFwiMFwiICsgc0hvdXJzXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBzSG91cnM7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5jbGlja0F2YWlsYWJsZVNsb3RzID0gZnVuY3Rpb24oc2VsZWN0ZWRTbG90KSB7XHJcbiAgICAgICAgc2VsZWN0ZWRTbG90ID0gSlNPTi5wYXJzZShzZWxlY3RlZFNsb3QpO1xyXG4gICAgICAgIHZhciBkYXkgPSBuZXcgRGF0ZShzZWxlY3RlZFNsb3Quc2xvdGRhdGUpO1xyXG4gICAgICAgIHZhciBob3VyID0gQ29udmVydFN0cmluZ1RpbWVUb1VUQyhzZWxlY3RlZFNsb3Quc2xvdHRpbWUpO1xyXG4gICAgICAgIHZhciBjYWxEYXkgPSB7fTtcclxuICAgICAgICB2YXIgY2FsZW5kYXJEYXkgPSAkc2NvcGUuY2FsZW5kYXIuZmluZChmdW5jdGlvbihjYWxEKSB7XHJcbiAgICAgICAgICByZXR1cm4gY2FsRC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmICghJHNjb3BlLm1ha2VFdmVudCkge1xyXG4gICAgICAgICAgJHNjb3BlLm1ha2VFdmVudCA9IHtcclxuICAgICAgICAgICAgdXNlcklEOiAkc2NvcGUudXNlci5zb3VuZGNsb3VkLmlkLFxyXG4gICAgICAgICAgICB0eXBlOiBcInRyYWNrXCJcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICAgICRzY29wZS5uZXdFdmVudCA9IHRydWU7XHJcbiAgICAgICAgdmFyIG1ha2VEYXkgPSBuZXcgRGF0ZShzZWxlY3RlZFNsb3Quc2xvdGRhdGUpO1xyXG4gICAgICAgIG1ha2VEYXkuc2V0SG91cnMoaG91cik7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC5kYXkgPSBtYWtlRGF5O1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnRVUkwgPSAkc2NvcGUubWFrZUV2ZW50LnRyYWNrVVJMO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUucG9wdWxhdGVPcGVuU2xvdHMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUub3BlblNsb3RzID0gW107XHJcbiAgICAgICAgdmFyIGN1cnJlbnREYXRlID0gbmV3IERhdGUoKTtcclxuICAgICAgICBjdXJyZW50RGF0ZS5zZXREYXRlKGN1cnJlbnREYXRlLmdldERhdGUoKSArICRzY29wZS5saXN0RGF5SW5jcik7XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCA3OyBpKyspIHtcclxuICAgICAgICAgIHZhciBkID0gbmV3IERhdGUoY3VycmVudERhdGUpO1xyXG4gICAgICAgICAgZC5zZXREYXRlKGQuZ2V0RGF0ZSgpICsgaSk7XHJcbiAgICAgICAgICB2YXIgY3VycmVudERheSA9IHBhcnNlSW50KGQuZ2V0RGF5KCkpO1xyXG4gICAgICAgICAgdmFyIHN0ckRkYXRlID0gZ2V0c2hvcnRkYXRlKGQpO1xyXG4gICAgICAgICAgdmFyIHNsb3RzID0gJHNjb3BlLnBzZXVkb0F2YWlsYWJsZVNsb3RzW2RheXNBcnJheVtjdXJyZW50RGF5XV07XHJcbiAgICAgICAgICBzbG90cyA9IHNsb3RzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgICAgICByZXR1cm4gYSAtIGJcclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChzbG90cywgZnVuY3Rpb24ocykge1xyXG4gICAgICAgICAgICB2YXIgaXRlbSA9IG5ldyBPYmplY3QoKTtcclxuICAgICAgICAgICAgdmFyIGggPSBzO1xyXG4gICAgICAgICAgICB2YXIgdGltZSA9ICcnO1xyXG4gICAgICAgICAgICBpZiAoaCA+PSAxMikge1xyXG4gICAgICAgICAgICAgIGggPSBoIC0gMTI7XHJcbiAgICAgICAgICAgICAgdGltZSA9IGggKyBcIiBQTVwiO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHRpbWUgPSBoICsgXCIgQU1cIjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgdmFyIGNhbGVuZGFyRGF5ID0gJHNjb3BlLmNhbGVuZGFyLmZpbmQoZnVuY3Rpb24oY2FsRCkge1xyXG4gICAgICAgICAgICAgIHJldHVybiBjYWxELmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSBkLnRvTG9jYWxlRGF0ZVN0cmluZygpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgdmFyIGV2ZW50ID0gY2FsZW5kYXJEYXkuZXZlbnRzLmZpbmQoZnVuY3Rpb24oZXYpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gbmV3IERhdGUoZXYuZGF5KS5nZXRIb3VycygpID09IHM7XHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgaXRlbS5ldmVudCA9IGV2ZW50O1xyXG4gICAgICAgICAgICB2YXIgZHQgPSBuZXcgRGF0ZShzdHJEZGF0ZSk7XHJcbiAgICAgICAgICAgIGR0LnNldEhvdXJzKHMpO1xyXG4gICAgICAgICAgICBpdGVtLmRhdGUgPSBuZXcgRGF0ZShkdCk7XHJcbiAgICAgICAgICAgIGlmICghaXRlbS5ldmVudCkge1xyXG4gICAgICAgICAgICAgIGlmIChuZXcgRGF0ZShpdGVtLmRhdGUpLmdldFRpbWUoKSA+IG5ldyBEYXRlKCkuZ2V0VGltZSgpKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUubGlzdGV2ZW50cy5wdXNoKGl0ZW0pO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIGlmIChpdGVtLmV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLmxpc3RldmVudHMucHVzaChpdGVtKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBpZiAoZXZlbnQgPT0gdW5kZWZpbmVkICYmIG5ldyBEYXRlKGl0ZW0uZGF0ZSkgPiBuZXcgRGF0ZSgpKSB7XHJcbiAgICAgICAgICAgICAgaXRlbS5zbG90ZGF0ZSA9IGQ7XHJcbiAgICAgICAgICAgICAgaXRlbS5zbG90dGltZSA9IHRpbWU7XHJcbiAgICAgICAgICAgICAgdmFyIG5ld0RhdGUgPSBuZXcgRGF0ZShpdGVtLmRhdGUpO1xyXG4gICAgICAgICAgICAgIG5ld0RhdGUuc2V0TWludXRlcygzMCk7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLm9wZW5TbG90cy5wdXNoKG5ld0RhdGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5tYWtlRXZlbnREYXlDaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LmRheSA9IG5ldyBEYXRlKHBhcnNlSW50KCRzY29wZS5tYWtlRXZlbnREYXkpKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmNsaWNrZWRTbG90ID0gZnVuY3Rpb24oZGF5LCBob3VyLCBkYXRhKSB7XHJcbiAgICAgICAgJHNjb3BlLmFmY291bnQgPSAwO1xyXG4gICAgICAgICRzY29wZS5pc1ZpZXcgPSBmYWxzZTtcclxuICAgICAgICAkc2NvcGUucG9wdXAgPSB0cnVlO1xyXG4gICAgICAgICRzY29wZS5zbG90VHlwZSA9ICd0cmFjayc7XHJcbiAgICAgICAgdmFyIGQgPSBuZXcgRGF0ZShkYXkpLmdldERheSgpO1xyXG4gICAgICAgIGlmICgkc2NvcGUucHNldWRvQXZhaWxhYmxlU2xvdHNbZGF5c0FycmF5W2RdXS5pbmRleE9mKGhvdXIpID09IC0xICYmIGRhdGEudHlwZSA9PSAnZW1wdHknKSByZXR1cm47XHJcbiAgICAgICAgdmFyIG1ha2VEYXkgPSBuZXcgRGF0ZShkYXkpO1xyXG4gICAgICAgIG1ha2VEYXkuc2V0SG91cnMoaG91cik7XHJcbiAgICAgICAgaWYgKCRzY29wZS51c2VyLmJsb2NrUmVsZWFzZSAmJiBuZXcgRGF0ZSgkc2NvcGUudXNlci5ibG9ja1JlbGVhc2UpLmdldFRpbWUoKSA+IG5ldyBEYXRlKG1ha2VEYXkpLmdldFRpbWUoKSkge1xyXG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJTb3JyeSEgWW91IGFyZSBibG9ja2VkIHRpbGwgZGF0ZSBcIiArIG1vbWVudCgkc2NvcGUudXNlci5ibG9ja1JlbGVhc2UpLmZvcm1hdCgnTExMJykpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkc2NvcGUuc2hvd092ZXJsYXkgPSB0cnVlO1xyXG4gICAgICAgIHZhciBjYWxEYXkgPSB7fTtcclxuICAgICAgICB2YXIgY2FsZW5kYXJEYXkgPSAkc2NvcGUuY2FsZW5kYXIuZmluZChmdW5jdGlvbihjYWxEKSB7XHJcbiAgICAgICAgICByZXR1cm4gY2FsRC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnRVUkwgPSBcIlwiO1xyXG4gICAgICAgICRzY29wZS50cmFja0xpc3RTbG90T2JqID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KGNhbGVuZGFyRGF5LmV2ZW50c1tob3VyXSkpO1xyXG4gICAgICAgICRzY29wZS51bnJlcG9zdEVuYWJsZSA9IG5ldyBEYXRlKCRzY29wZS5tYWtlRXZlbnQudW5yZXBvc3REYXRlKSA+IG5ldyBEYXRlKDEwMDApO1xyXG4gICAgICAgICRzY29wZS51bnJlcG9zdEhvdXJzID0gXCJcIjtcclxuICAgICAgICAkc2NvcGUudXBkYXRlUmVhY2goKTtcclxuICAgICAgICAkc2NvcGUuc2V0U2NoZWR1bGVMaWtlQ29tbWVudCgpO1xyXG4gICAgICAgIGlmICgkc2NvcGUubWFrZUV2ZW50LnR5cGUgPT0gXCJlbXB0eVwiKSB7XHJcbiAgICAgICAgICBtYWtlRGF5ID0gbmV3IERhdGUoZGF5KTtcclxuICAgICAgICAgIG1ha2VEYXkuc2V0SG91cnMoaG91cik7XHJcbiAgICAgICAgICAkc2NvcGUubWFrZUV2ZW50ID0ge1xyXG4gICAgICAgICAgICB1c2VySUQ6ICRzY29wZS51c2VyLnNvdW5kY2xvdWQuaWQsXHJcbiAgICAgICAgICAgIGRheTogbWFrZURheSxcclxuICAgICAgICAgICAgdHlwZTogXCJ0cmFja1wiXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgICAgJHNjb3BlLmNoYW5uZWxBcnIgPSBbXTtcclxuICAgICAgICAgICRzY29wZS5pc0VkaXQgPSBmYWxzZTtcclxuICAgICAgICAgICRzY29wZS5pc1RyYWRlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgaWYgKCRzY29wZS5jb21tZW50RXZlbnQgPT0gdHJ1ZSlcclxuICAgICAgICAgICAgJHNjb3BlLmV2ZW50Q29tbWVudCA9ICgkc2NvcGUudXNlci5yZXBvc3RTZXR0aW5ncyAmJiAkc2NvcGUudXNlci5yZXBvc3RTZXR0aW5ncy5zY2hlZHVsZSAmJiAkc2NvcGUudXNlci5yZXBvc3RTZXR0aW5ncy5zY2hlZHVsZS5jb21tZW50cyAmJiAkc2NvcGUudXNlci5yZXBvc3RTZXR0aW5ncy5zY2hlZHVsZS5jb21tZW50cy5sZW5ndGggPiAwKSA/ICRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzLnNjaGVkdWxlLmNvbW1lbnRzW01hdGgucmFuZG9tKCkgKiAkc2NvcGUudXNlci5yZXBvc3RTZXR0aW5ncy5zY2hlZHVsZS5jb21tZW50cy5sZW5ndGggPj4gMF0gOiAnJztcclxuICAgICAgICAgICRzY29wZS5pc0NvbW1lbnQgPSBcIlwiO1xyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUG9wdXBQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcclxuICAgICAgICAgICRzY29wZS5zaG93UGxheWVyID0gZmFsc2U7XHJcbiAgICAgICAgICAkc2NvcGUubWFrZUV2ZW50LmRheSA9IG5ldyBEYXRlKCRzY29wZS5tYWtlRXZlbnQuZGF5KTtcclxuICAgICAgICAgICRzY29wZS5tYWtlRXZlbnREYXkgPSBKU09OLnN0cmluZ2lmeSgkc2NvcGUubWFrZUV2ZW50LmRheS5nZXRUaW1lKCkpO1xyXG4gICAgICAgICAgJHNjb3BlLm1ha2VFdmVudC51bnJlcG9zdERhdGUgPSBuZXcgRGF0ZSgkc2NvcGUubWFrZUV2ZW50LmRheS5nZXRUaW1lKCkgKyAyNCAqIDYwICogNjAgKiAxMDAwKTtcclxuICAgICAgICAgICRzY29wZS51bnJlcG9zdEVuYWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAkc2NvcGUudW5yZXBvc3RIb3VycyA9IFwiNDhcIjtcclxuICAgICAgICAgICRzY29wZS5tYWtlRXZlbnQudW5yZXBvc3QgPSB0cnVlO1xyXG4gICAgICAgICAgJHNjb3BlLm5ld0V2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICRzY29wZS5lZGl0Q2hhbm5lbEFyciA9IFtdO1xyXG4gICAgICAgICAgJHNjb3BlLmNoYW5uZWxBcnIgPSBbXTtcclxuICAgICAgICAgICRzY29wZS5tYWtlRXZlbnQuaG91cnNCZXR3ZWVuID0gMTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgaWYgKGRhdGEudHlwZSA9PSAndHJhZGVkJyB8fCBkYXRhLnR5cGUgPT0gJ3BhaWQnKSAkc2NvcGUuaXNUcmFkZWQgPSB0cnVlO1xyXG4gICAgICAgICAgJHNjb3BlLmlzRWRpdCA9IHRydWU7XHJcbiAgICAgICAgICAkc2NvcGUubGlrZVNyYyA9IChkYXRhLmxpa2UgPT0gdHJ1ZSkgPyAnYXNzZXRzL2ltYWdlcy9saWtlVHJ1ZS5zdmcnIDogJ2Fzc2V0cy9pbWFnZXMvbGlrZS5zdmcnO1xyXG4gICAgICAgICAgJHNjb3BlLmxpa2VFdmVudCA9IGRhdGEubGlrZTtcclxuICAgICAgICAgICRzY29wZS5jb21tZW50U3JjID0gKGRhdGEuY29tbWVudCAhPSBcIlwiKSA/ICdhc3NldHMvaW1hZ2VzL2NvbW1lbnQuc3ZnJyA6ICdhc3NldHMvaW1hZ2VzL25vQ29tbWVudC5zdmcnO1xyXG4gICAgICAgICAgJHNjb3BlLmNvbW1lbnRFdmVudCA9IChkYXRhLmNvbW1lbnQgIT0gXCJcIiA/IHRydWUgOiBmYWxzZSk7XHJcbiAgICAgICAgICBpZiAoJHNjb3BlLmNvbW1lbnRFdmVudCA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAkc2NvcGUuZXZlbnRDb21tZW50ID0gXCJcIjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgICRzY29wZS5kaXNhYmxlID0gKCRzY29wZS5jb21tZW50RXZlbnQgPT0gdHJ1ZSkgPyBmYWxzZSA6IHRydWU7XHJcblxyXG4gICAgICAgICAgJHNjb3BlLmVkaXRDaGFubmVsQXJyID0gW107XHJcbiAgICAgICAgICAkc2NvcGUuY2hhbm5lbEFyciA9IFtdO1xyXG4gICAgICAgICAgdmFyIGNoYW5uZWxzID0gZGF0YS5vdGhlckNoYW5uZWxzO1xyXG4gICAgICAgICAgaWYgKGNoYW5uZWxzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGFubmVscy5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgJHNjb3BlLmxpbmtlZEFjY291bnRzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoY2hhbm5lbHNbaV0gPT0gJHNjb3BlLmxpbmtlZEFjY291bnRzW2pdLnNvdW5kY2xvdWQuaWQpIHtcclxuICAgICAgICAgICAgICAgICAgJHNjb3BlLmVkaXRDaGFubmVsQXJyLnB1c2goJHNjb3BlLmxpbmtlZEFjY291bnRzW2pdLm5hbWUpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkc2NvcGUuY2hhbm5lbEFyciA9ICRzY29wZS5lZGl0Q2hhbm5lbEFycjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgICRzY29wZS50aW1lR2FwID0gZGF0YS50aW1lR2FwO1xyXG4gICAgICAgICAgJHNjb3BlLmZvbGxvd2Vyc0NvdW50KCk7XHJcbiAgICAgICAgICB2YXIgcmVwb3N0RGF0ZSA9IG5ldyBEYXRlKCRzY29wZS5tYWtlRXZlbnQuZGF5KTtcclxuICAgICAgICAgIHZhciB1bnJlcG9zdERhdGUgPSBuZXcgRGF0ZSgkc2NvcGUubWFrZUV2ZW50LnVucmVwb3N0RGF0ZSk7XHJcbiAgICAgICAgICB2YXIgZGlmZiA9IE1hdGguYWJzKG5ldyBEYXRlKHVucmVwb3N0RGF0ZSkuZ2V0VGltZSgpIC0gbmV3IERhdGUocmVwb3N0RGF0ZSkuZ2V0VGltZSgpKSAvIDM2MDAwMDA7XHJcbiAgICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnVucmVwb3N0SG91cnMgPSBkaWZmO1xyXG4gICAgICAgICAgJHNjb3BlLnVucmVwb3N0SG91cnMgPSBkYXRhLnVucmVwb3N0SG91cnM7XHJcbiAgICAgICAgICAkc2NvcGUubWFrZUV2ZW50LmRheSA9IG5ldyBEYXRlKCRzY29wZS5tYWtlRXZlbnQuZGF5KTtcclxuICAgICAgICAgICRzY29wZS5tYWtlRXZlbnREYXkgPSBKU09OLnN0cmluZ2lmeSgkc2NvcGUubWFrZUV2ZW50LmRheS5nZXRUaW1lKCkpO1xyXG4gICAgICAgICAgJHNjb3BlLm1ha2VFdmVudC51bnJlcG9zdERhdGUgPSBuZXcgRGF0ZSgkc2NvcGUubWFrZUV2ZW50LnVucmVwb3N0RGF0ZSk7XHJcbiAgICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnVucmVwb3N0ID0gKCRzY29wZS5tYWtlRXZlbnQudW5yZXBvc3REYXRlID4gbmV3IERhdGUoKSk7XHJcbiAgICAgICAgICAkc2NvcGUubWFrZUV2ZW50VVJMID0gJHNjb3BlLm1ha2VFdmVudC50cmFja1VSTDtcclxuICAgICAgICAgICRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCA9IGRhdGEudHJhY2tJRDtcclxuICAgICAgICAgICRzY29wZS5tYWtlRXZlbnQuaG91cnNCZXR3ZWVuID0gMTtcclxuICAgICAgICAgICRzY29wZS5uZXdFdmVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgU0MuV2lkZ2V0KCdzY1BvcHVwUGxheWVyJykubG9hZCgkc2NvcGUubWFrZUV2ZW50VVJMLCB7XHJcbiAgICAgICAgICAgIGF1dG9fcGxheTogZmFsc2UsXHJcbiAgICAgICAgICAgIHNob3dfYXJ0d29yazogZmFsc2VcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgJHNjb3BlLnNob3dQbGF5ZXIgPSB0cnVlO1xyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUG9wdXBQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XHJcbiAgICAgICAgICBpZiAoZGF0YS50eXBlID09ICd0cmFkZWQnICYmIGRhdGEudHJhY2tVUkwpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnNsb3RUeXBlID0gJ3RyYWRlZCc7XHJcbiAgICAgICAgICAgICRzY29wZS5pc1ZpZXcgPSB0cnVlO1xyXG4gICAgICAgICAgICAkc2NvcGUuZXZlbnRDb21tZW50ID0gXCJcIjtcclxuICAgICAgICAgICAgJHNjb3BlLmlzQ29tbWVudCA9IFwiXCI7XHJcbiAgICAgICAgICAgIGlmICgkc2NvcGUuY29tbWVudEV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLmV2ZW50Q29tbWVudCA9ICRzY29wZS5tYWtlRXZlbnQuY29tbWVudDtcclxuICAgICAgICAgICAgICAkc2NvcGUuaXNDb21tZW50ID0gJHNjb3BlLm1ha2VFdmVudC5jb21tZW50O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2VcclxuICAgICAgICAgIGlmIChkYXRhLnR5cGUgIT0gJ3RyYWRlZCcgJiYgZGF0YS50cmFja1VSTCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuc2xvdFR5cGUgPSAndHJhY2snO1xyXG4gICAgICAgICAgICAkc2NvcGUuc2hvd1BsYXllciA9IHRydWU7XHJcbiAgICAgICAgICAgIGlmICgkc2NvcGUuY29tbWVudEV2ZW50KVxyXG4gICAgICAgICAgICAgICRzY29wZS5ldmVudENvbW1lbnQgPSAkc2NvcGUubWFrZUV2ZW50LmNvbW1lbnQ7XHJcbiAgICAgICAgICAgICRzY29wZS5pc0NvbW1lbnQgPSAkc2NvcGUubWFrZUV2ZW50LmNvbW1lbnQ7XHJcbiAgICAgICAgICB9IGVsc2VcclxuICAgICAgICAgIGlmIChkYXRhLnR5cGUgPT0gJ3RyYWRlZCcgJiYgIWRhdGEudHJhY2tVUkwpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnNldFRyYWRlZExpa2VDb21tZW50KCk7XHJcbiAgICAgICAgICAgICRzY29wZS5zbG90VHlwZSA9ICd0cmFkZWQnO1xyXG4gICAgICAgICAgICAkc2NvcGUuc2hvd1BsYXllciA9IGZhbHNlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUubWFrZUV2ZW50LmRheSk7XHJcbiAgICAgICAgJHNjb3BlLnBvcHVsYXRlT3BlblNsb3RzKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5zZXRTY2hlZHVsZUxpa2VDb21tZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKCRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzICYmICRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzLnNjaGVkdWxlKSB7XHJcbiAgICAgICAgICBpZiAoJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3Muc2NoZWR1bGUubGlrZSA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgICAkc2NvcGUubGlrZVNyYyA9ICdhc3NldHMvaW1hZ2VzL2xpa2Uuc3ZnJztcclxuICAgICAgICAgICAgJHNjb3BlLmxpa2VFdmVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJHNjb3BlLmxpa2VTcmMgPSAnYXNzZXRzL2ltYWdlcy9saWtlVHJ1ZS5zdmcnO1xyXG4gICAgICAgICAgICAkc2NvcGUubGlrZUV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICgkc2NvcGUudXNlci5yZXBvc3RTZXR0aW5ncyAmJiAkc2NvcGUudXNlci5yZXBvc3RTZXR0aW5ncy5zY2hlZHVsZSAmJiAkc2NvcGUudXNlci5yZXBvc3RTZXR0aW5ncy5zY2hlZHVsZS5jb21tZW50ID09IGZhbHNlKSB7XHJcbiAgICAgICAgICAkc2NvcGUuZGlzYWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAkc2NvcGUuY29tbWVudEV2ZW50ID0gZmFsc2U7XHJcbiAgICAgICAgICAkc2NvcGUuZXZlbnRDb21tZW50ID0gXCJcIjtcclxuICAgICAgICAgICRzY29wZS5jb21tZW50U3JjID0gJ2Fzc2V0cy9pbWFnZXMvbm9Db21tZW50LnN2Zyc7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICRzY29wZS5kaXNhYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAkc2NvcGUuY29tbWVudEV2ZW50ID0gdHJ1ZTtcclxuICAgICAgICAgICRzY29wZS5ldmVudENvbW1lbnQgPSAoJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3MgJiYgJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3Muc2NoZWR1bGUgJiYgJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3Muc2NoZWR1bGUuY29tbWVudHMgJiYgJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3Muc2NoZWR1bGUuY29tbWVudHMubGVuZ3RoID4gMCkgPyAkc2NvcGUudXNlci5yZXBvc3RTZXR0aW5ncy5zY2hlZHVsZS5jb21tZW50c1tNYXRoLnJhbmRvbSgpICogJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3Muc2NoZWR1bGUuY29tbWVudHMubGVuZ3RoID4+IDBdIDogJyc7XHJcbiAgICAgICAgICAkc2NvcGUuY29tbWVudFNyYyA9ICdhc3NldHMvaW1hZ2VzL2NvbW1lbnQuc3ZnJztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5zZXRUcmFkZWRMaWtlQ29tbWVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICgkc2NvcGUudXNlci5yZXBvc3RTZXR0aW5ncyAmJiAkc2NvcGUudXNlci5yZXBvc3RTZXR0aW5ncy50cmFkZSkge1xyXG4gICAgICAgICAgaWYgKCRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzLnRyYWRlLmxpa2UgPT0gZmFsc2UpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmxpa2VTcmMgPSAnYXNzZXRzL2ltYWdlcy9saWtlLnN2Zyc7XHJcbiAgICAgICAgICAgICRzY29wZS5saWtlRXZlbnQgPSBmYWxzZTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICRzY29wZS5saWtlU3JjID0gJ2Fzc2V0cy9pbWFnZXMvbGlrZVRydWUuc3ZnJztcclxuICAgICAgICAgICAgJHNjb3BlLmxpa2VFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3MgJiYgJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3MudHJhZGUgJiYgJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3MudHJhZGUuY29tbWVudCA9PSBmYWxzZSkge1xyXG4gICAgICAgICAgJHNjb3BlLmRpc2FibGUgPSB0cnVlO1xyXG4gICAgICAgICAgJHNjb3BlLmNvbW1lbnRFdmVudCA9IGZhbHNlO1xyXG4gICAgICAgICAgJHNjb3BlLmV2ZW50Q29tbWVudCA9IFwiXCI7XHJcbiAgICAgICAgICAkc2NvcGUuY29tbWVudFNyYyA9ICdhc3NldHMvaW1hZ2VzL25vQ29tbWVudC5zdmcnO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAkc2NvcGUuZGlzYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgJHNjb3BlLmNvbW1lbnRFdmVudCA9IHRydWU7XHJcbiAgICAgICAgICAkc2NvcGUuZXZlbnRDb21tZW50ID0gKCRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzICYmICRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzLnRyYWRlICYmICRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzLnRyYWRlLmNvbW1lbnRzICYmICRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzLnRyYWRlLmNvbW1lbnRzLmxlbmd0aCA+IDApID8gJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3MudHJhZGUuY29tbWVudHNbTWF0aC5yYW5kb20oKSAqICRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzLnRyYWRlLmNvbW1lbnRzLmxlbmd0aCA+PiAwXSA6ICcnO1xyXG4gICAgICAgICAgJHNjb3BlLmNvbW1lbnRTcmMgPSAnYXNzZXRzL2ltYWdlcy9jb21tZW50LnN2Zyc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuY2hhbmdlUXVldWVTbG90ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC50aXRsZSA9IG51bGw7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC50cmFja1VSTCA9IG51bGw7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC5hcnRpc3ROYW1lID0gbnVsbDtcclxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQgPSBudWxsO1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnRVUkwgPSBudWxsO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUubG9nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLm90aGVyQ2hhbm5lbHMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuZGVsZXRlRXZlbnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoISRzY29wZS5uZXdFdmVudCkge1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgJGh0dHAuZGVsZXRlKCcvYXBpL2V2ZW50cy9yZXBvc3RFdmVudHMvJyArICRzY29wZS5tYWtlRXZlbnQuX2lkKVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLnJlZnJlc2hFdmVudHMoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAkc2NvcGUuc2hvd1BsYXllciA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICRzdGF0ZS5yZWxvYWQoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkVSUk9SOiBEaWQgbm90IGRlbGV0ZS5cIilcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHZhciBjYWxlbmRhckRheSA9ICRzY29wZS5jYWxlbmRhci5maW5kKGZ1bmN0aW9uKGNhbEQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNhbEQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09ICRzY29wZS5tYWtlRXZlbnQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBjYWxlbmRhckRheS5ldmVudHNbJHNjb3BlLm1ha2VFdmVudC5kYXkuZ2V0SG91cnMoKV0gPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiZW1wdHlcIlxyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnNldENhbGVuZGFyRXZlbnQgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgIGV2ZW50LmRheSA9IG5ldyBEYXRlKGV2ZW50LmRheSk7XHJcbiAgICAgICAgdmFyIGNhbGVuZGFyRGF5ID0gJHNjb3BlLmNhbGVuZGFyLmZpbmQoZnVuY3Rpb24oY2FsRCkge1xyXG4gICAgICAgICAgcmV0dXJuIGNhbEQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09IGV2ZW50LmRheS50b0xvY2FsZURhdGVTdHJpbmcoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBjYWxlbmRhckRheS5ldmVudHNbZXZlbnQuZGF5LmdldEhvdXJzKCldID0gZXZlbnQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5maW5kVW5yZXBvc3RPdmVybGFwID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKCEkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQpIHJldHVybiBmYWxzZTtcclxuICAgICAgICB2YXIgYmxvY2tFdmVudHMgPSAkc2NvcGUuZXZlbnRzLmZpbHRlcihmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgaWYgKGV2ZW50Ll9pZCA9PSAkc2NvcGUubWFrZUV2ZW50Ll9pZCB8fCAkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQgIT0gZXZlbnQudHJhY2tJRCkgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgZXZlbnQuZGF5ID0gbmV3IERhdGUoZXZlbnQuZGF5KTtcclxuICAgICAgICAgIGV2ZW50LnVucmVwb3N0RGF0ZSA9IG5ldyBEYXRlKGV2ZW50LnVucmVwb3N0RGF0ZSk7XHJcbiAgICAgICAgICB2YXIgZXZlbnRMb3dlckJvdW5kID0gJHNjb3BlLm1ha2VFdmVudC5kYXkuZ2V0VGltZSgpO1xyXG4gICAgICAgICAgdmFyIGV2ZW50VXBwZXJCb3VuZCA9ICRzY29wZS5tYWtlRXZlbnQudW5yZXBvc3REYXRlID4gJHNjb3BlLm1ha2VFdmVudC5kYXkgPyAkc2NvcGUubWFrZUV2ZW50LnVucmVwb3N0RGF0ZS5nZXRUaW1lKCkgKyAyNCAqIDM2MDAwMDAgOiAkc2NvcGUubWFrZUV2ZW50LmRheS5nZXRUaW1lKCkgKyA0OCAqIDM2MDAwMDA7XHJcbiAgICAgICAgICB2YXIgbWFrZUV2ZW50TG93ZXJCb3VuZCA9IGV2ZW50LmRheS5nZXRUaW1lKCk7XHJcbiAgICAgICAgICB2YXIgbWFrZUV2ZW50VXBwZXJCb3VuZCA9IGV2ZW50LnVucmVwb3N0RGF0ZSA+IGV2ZW50LmRheSA/IGV2ZW50LnVucmVwb3N0RGF0ZS5nZXRUaW1lKCkgKyAyNCAqIDM2MDAwMDAgOiBldmVudC5kYXkuZ2V0VGltZSgpICsgNDggKiAzNjAwMDAwO1xyXG4gICAgICAgICAgcmV0dXJuICgoZXZlbnQuZGF5LmdldFRpbWUoKSA+IGV2ZW50TG93ZXJCb3VuZCAmJiBldmVudC5kYXkuZ2V0VGltZSgpIDwgZXZlbnRVcHBlckJvdW5kKSB8fCAoJHNjb3BlLm1ha2VFdmVudC5kYXkuZ2V0VGltZSgpID4gbWFrZUV2ZW50TG93ZXJCb3VuZCAmJiAkc2NvcGUubWFrZUV2ZW50LmRheS5nZXRUaW1lKCkgPCBtYWtlRXZlbnRVcHBlckJvdW5kKSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICByZXR1cm4gYmxvY2tFdmVudHMubGVuZ3RoID4gMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLm90aGVyQ2hhbm5lbHNBbmRHcm91cHMgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUuc2VsZWN0ZWRHcm91cENoYW5uZWxJRFMgPSBbXTtcclxuICAgICAgICBpZiAoJHNjb3BlLnJvbGUgPT0gJ2FkbWluJykge1xyXG4gICAgICAgICAgJHNjb3BlLmdyb3VwQW5kQ2hhbm5lbCA9ICRzY29wZS5jaGFubmVsQXJyLmNvbmNhdCgkc2NvcGUuZ3JvdXBBcnIpO1xyXG4gICAgICAgICAgJHNjb3BlLmdyb3VwQW5kQ2hhbm5lbC5mb3JFYWNoKGZ1bmN0aW9uKGcpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnVzZXIucGFpZFJlcG9zdC5mb3JFYWNoKGZ1bmN0aW9uKGFjYykge1xyXG4gICAgICAgICAgICAgIGlmIChhY2MuZ3JvdXBzLmluZGV4T2YoZykgIT0gLTEpIHtcclxuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuc2VsZWN0ZWRHcm91cENoYW5uZWxJRFMuaW5kZXhPZihhY2MuaWQpID09IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICRzY29wZS5zZWxlY3RlZEdyb3VwQ2hhbm5lbElEUy5wdXNoKGFjYy5pZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChhY2MudXNlcm5hbWUgPT0gZykge1xyXG4gICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLnNlbGVjdGVkR3JvdXBDaGFubmVsSURTLmluZGV4T2YoYWNjLmlkKSA9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zZWxlY3RlZEdyb3VwQ2hhbm5lbElEUy5wdXNoKGFjYy5pZCk7XHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICByZXR1cm4gJHNjb3BlLnNlbGVjdGVkR3JvdXBDaGFubmVsSURTO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAkc2NvcGUuY2hhbm5lbEFyci5mb3JFYWNoKGZ1bmN0aW9uKGNoKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5saW5rZWRBY2NvdW50cy5mb3JFYWNoKGZ1bmN0aW9uKGFjYykge1xyXG4gICAgICAgICAgICAgIGlmIChhY2Muc291bmRjbG91ZCAmJiBhY2Muc291bmRjbG91ZC51c2VybmFtZSA9PSBjaCkge1xyXG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS5zZWxlY3RlZEdyb3VwQ2hhbm5lbElEUy5pbmRleE9mKGFjYy5zb3VuZGNsb3VkLmlkKSA9PSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAkc2NvcGUuc2VsZWN0ZWRHcm91cENoYW5uZWxJRFMucHVzaChhY2Muc291bmRjbG91ZC5pZCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcmV0dXJuICRzY29wZS5zZWxlY3RlZEdyb3VwQ2hhbm5lbElEUztcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5zYXZlRXZlbnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgb3RoZXJDaGFubmVscyA9ICRzY29wZS5vdGhlckNoYW5uZWxzQW5kR3JvdXBzKCk7XHJcbiAgICAgICAgaWYgKG90aGVyQ2hhbm5lbHMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgJHNjb3BlLm1ha2VFdmVudC5vdGhlckNoYW5uZWxzID0gb3RoZXJDaGFubmVscztcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgJHNjb3BlLm1ha2VFdmVudC5vdGhlckNoYW5uZWxzID0gW107XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgkc2NvcGUudW5yZXBvc3RFbmFibGUpIHtcclxuICAgICAgICAgICRzY29wZS5tYWtlRXZlbnQudW5yZXBvc3REYXRlID0gbmV3IERhdGUoJHNjb3BlLm1ha2VFdmVudC5kYXkuZ2V0VGltZSgpICsgKHBhcnNlSW50KCRzY29wZS51bnJlcG9zdEhvdXJzKSAqIDYwICogNjAgKiAxMDAwKSk7XHJcbiAgICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnVucmVwb3N0ID0gdHJ1ZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgJHNjb3BlLm1ha2VFdmVudC51bnJlcG9zdERhdGUgPSBuZXcgRGF0ZSgwKTtcclxuICAgICAgICAgICRzY29wZS5tYWtlRXZlbnQudW5yZXBvc3QgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC51c2VySUQgPSAkc2NvcGUudXNlci5zb3VuZGNsb3VkLmlkO1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQubGlrZSA9ICRzY29wZS5saWtlRXZlbnQ7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC51bnJlcG9zdEhvdXJzID0gJHNjb3BlLnVucmVwb3N0SG91cnM7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC50aW1lR2FwID0gJHNjb3BlLnRpbWVHYXA7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC5jb21tZW50ID0gKCRzY29wZS5jb21tZW50RXZlbnQgPT0gdHJ1ZSA/ICRzY29wZS5ldmVudENvbW1lbnQgOiAnJyk7XHJcbiAgICAgICAgaWYgKCRzY29wZS50cmFja1R5cGUgPT0gXCJwbGF5bGlzdFwiKSB7XHJcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIlNvcnJ5ISBXZSBkb24ndCBjdXJyZW50bHkgYWxsb3cgcGxheWxpc3QgcmVwb3N0aW5nLiBQbGVhc2UgZW50ZXIgYSB0cmFjayB1cmwgaW5zdGVhZC5cIik7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfSBlbHNlIGlmICgkc2NvcGUudHJhY2tBcnRpc3RJRCA9PSAkc2NvcGUudXNlci5zb3VuZGNsb3VkLmlkKSB7XHJcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIlNvcnJ5ISBZb3UgY2Fubm90IHNjaGVkdWxlIHlvdXIgb3duIHRyYWNrIHRvIGJlIHJlcG9zdGVkLlwiKVxyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoJHNjb3BlLmZpbmRVbnJlcG9zdE92ZXJsYXAoKSkge1xyXG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coJ0lzc3VlISBQbGVhc2UgYWxsb3cgYXQgbGVhc3QgMjQgaG91cnMgYmV0d2VlbiB1bnJlcG9zdGluZyBhIHRyYWNrIGFuZCByZS1yZXBvc3RpbmcgaXQgYW5kIGF0IGxlYXN0IDQ4IGhvdXJzIGJldHdlZW4gcmVwb3N0cyBvZiB0aGUgc2FtZSB0cmFjay4nKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCEkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQgJiYgKCRzY29wZS5tYWtlRXZlbnQudHlwZSA9PSBcInRyYWNrXCIpKSB7XHJcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIlBsZWFlIGFkZCBhIHRyYWNrLlwiKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgaWYgKCRzY29wZS5uZXdFdmVudCkge1xyXG4gICAgICAgICAgICBmb3IgKHZhciBrZXkgaW4gJHNjb3BlLm90aGVyQ2hhbm5lbHMpIHtcclxuICAgICAgICAgICAgICBpZiAoJHNjb3BlLm90aGVyQ2hhbm5lbHNba2V5XSkgJHNjb3BlLm1ha2VFdmVudC5vdGhlckNoYW5uZWxzLnB1c2goa2V5KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnRpbWVHYXAgPSBwYXJzZUludCgkc2NvcGUudGltZUdhcCk7XHJcbiAgICAgICAgICAgIHZhciByZXEgPSAkaHR0cC5wb3N0KCcvYXBpL2V2ZW50cy9yZXBvc3RFdmVudHNTY2hlZHVsZXInLCAkc2NvcGUubWFrZUV2ZW50KVxyXG4gICAgICAgICAgICAkc2NvcGUub3RoZXJDaGFubmVscyA9IFtdO1xyXG4gICAgICAgICAgICAkc2NvcGUudGltZUdhcCA9ICcxJztcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHZhciByZXEgPSAkaHR0cC5wdXQoJy9hcGkvZXZlbnRzL3JlcG9zdEV2ZW50cycsICRzY29wZS5tYWtlRXZlbnQpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmVxXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgIGlmIChyZXMpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5yZXBvc3RSZXNwb25zZSA9IHJlcy5kYXRhO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnJlcG9zdFJlc3BvbnNlLnVzZXIgPSAkc2NvcGUudXNlcjtcclxuICAgICAgICAgICAgICAgICQoJyNwb3AnKS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAkc2NvcGUubWFrZUV2ZW50VVJMID0gXCJcIjtcclxuICAgICAgICAgICAgICAkc2NvcGUubWFrZUV2ZW50ID0gbnVsbDtcclxuICAgICAgICAgICAgICAkc2NvcGUuZXZlbnRDb21tZW50ID0gXCJcIjtcclxuICAgICAgICAgICAgICAkc2NvcGUudW5yZXBvc3RFbmFibGUgPSBmYWxzZTtcclxuICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcclxuICAgICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQb3B1cFBsYXllcicpLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xyXG4gICAgICAgICAgICAgICRzY29wZS51bnJlcG9zdEhvdXJzID0gMTtcclxuICAgICAgICAgICAgICAkc2NvcGUudGFiU2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICRzY29wZS50cmFja1R5cGUgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICRzY29wZS50cmFja0FydGlzdElEID0gMDtcclxuICAgICAgICAgICAgICByZXR1cm4gJHNjb3BlLnJlZnJlc2hFdmVudHMoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgaWYgKHJlcykge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnJlcG9zdFJlc3BvbnNlID0gcmVzLmRhdGE7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUucmVwb3N0UmVzcG9uc2UudXNlciA9ICRzY29wZS51c2VyO1xyXG4gICAgICAgICAgICAgICAgJCgnI3BvcCcpLm1vZGFsKCdzaG93Jyk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICRzY29wZS5tYWtlRXZlbnRVUkwgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICRzY29wZS5tYWtlRXZlbnQgPSBudWxsO1xyXG4gICAgICAgICAgICAgICRzY29wZS5ldmVudENvbW1lbnQgPSBcIlwiO1xyXG4gICAgICAgICAgICAgICRzY29wZS51bnJlcG9zdEVuYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xyXG4gICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BvcHVwUGxheWVyJykuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnVucmVwb3N0SG91cnMgPSAxO1xyXG4gICAgICAgICAgICAgICRzY29wZS50YWJTZWxlY3RlZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAkc2NvcGUudHJhY2tUeXBlID0gXCJcIjtcclxuICAgICAgICAgICAgICAkc2NvcGUudHJhY2tBcnRpc3RJRCA9IDA7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnJlZnJlc2hFdmVudHMoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkVSUk9SOiBEaWQgbm90IHNhdmUuXCIpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5lbWFpbFNsb3QgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgbWFpbHRvX2xpbmsgPSBcIm1haWx0bzo/c3ViamVjdD1SZXBvc3Qgb2YgXCIgKyAkc2NvcGUubWFrZUV2ZW50LnRpdGxlICsgJyZib2R5PUhleSxcXG5cXG4gSSBhbSByZXBvc3RpbmcgeW91ciBzb25nICcgKyAkc2NvcGUubWFrZUV2ZW50LnRpdGxlICsgJyBvbiAnICsgJHNjb3BlLnVzZXIuc291bmRjbG91ZC51c2VybmFtZSArICcgb24gJyArICRzY29wZS5tYWtlRXZlbnQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpICsgJy5cXG5cXG4gQmVzdCwgXFxuJyArICRzY29wZS51c2VyLnNvdW5kY2xvdWQudXNlcm5hbWU7XHJcbiAgICAgICAgbG9jYXRpb24uaHJlZiA9IGVuY29kZVVSSShtYWlsdG9fbGluayk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5iYWNrRXZlbnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50ID0gbnVsbDtcclxuICAgICAgICAkc2NvcGUudHJhY2tUeXBlID0gXCJcIjtcclxuICAgICAgICAkc2NvcGUudHJhY2tBcnRpc3RJRCA9IDA7XHJcbiAgICAgICAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XHJcbiAgICAgICAgJHNjb3BlLnVucmVwb3N0RW5hYmxlID0gZmFsc2U7XHJcbiAgICAgICAgJHNjb3BlLnVucmVwb3N0SG91cnMgPSBcIlwiO1xyXG4gICAgICAgICRzY29wZS5zaG93UGxheWVyID0gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5kYXlPZldlZWtBc1N0cmluZyA9IGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgICAgICB2YXIgZGF5SW5kZXggPSBkYXRlLmdldERheSgpO1xyXG4gICAgICAgIGlmIChzY3JlZW4ud2lkdGggPiAnNzQ0Jykge1xyXG4gICAgICAgICAgcmV0dXJuIFtcIlN1bmRheVwiLCBcIk1vbmRheVwiLCBcIlR1ZXNkYXlcIiwgXCJXZWRuZXNkYXlcIiwgXCJUaHVyc2RheVwiLCBcIkZyaWRheVwiLCBcIlNhdHVyZGF5XCJdW2RheUluZGV4XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIFtcIlN1blwiLCBcIk1vblwiLCBcIlR1ZVwiLCBcIldlZFwiLCBcIlRodVwiLCBcIkZyaVwiLCBcIlNhdFwiXVtkYXlJbmRleF07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS51bnJlcG9zdFN5bWJvbCA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKCFldmVudC51bnJlcG9zdERhdGUpIHJldHVybjtcclxuICAgICAgICBldmVudC51bnJlcG9zdERhdGUgPSBuZXcgRGF0ZShldmVudC51bnJlcG9zdERhdGUpO1xyXG4gICAgICAgIHJldHVybiBldmVudC51bnJlcG9zdERhdGUgPiBuZXcgRGF0ZSgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuZ2V0U3R5bGUgPSBmdW5jdGlvbihldmVudCwgZGF0ZSwgZGF5LCBob3VyKSB7XHJcbiAgICAgICAgdmFyIHN0eWxlID0ge1xyXG4gICAgICAgICAgJ2JvcmRlci1yYWRpdXMnOiAnNHB4J1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgdmFyIGN1cnJlbnREYXkgPSBuZXcgRGF0ZShkYXRlKS5nZXREYXkoKTtcclxuXHJcbiAgICAgICAgdmFyIGRhdGUgPSAobmV3IERhdGUoZGF0ZSkpLnNldEhvdXJzKGhvdXIpXHJcbiAgICAgICAgaWYgKCRzY29wZS5wc2V1ZG9BdmFpbGFibGVTbG90c1tkYXlzQXJyYXlbY3VycmVudERheV1dICYmICRzY29wZS5wc2V1ZG9BdmFpbGFibGVTbG90c1tkYXlzQXJyYXlbY3VycmVudERheV1dLmluZGV4T2YoaG91cikgPiAtMSAmJiBkYXRlID4gKG5ldyBEYXRlKCkpKSB7XHJcbiAgICAgICAgICBzdHlsZSA9IHtcclxuICAgICAgICAgICAgJ2JhY2tncm91bmQtY29sb3InOiAnI2ZmZicsXHJcbiAgICAgICAgICAgICdib3JkZXItY29sb3InOiBcIiM5OTlcIixcclxuICAgICAgICAgICAgJ2JvcmRlci1yYWRpdXMnOiAnNHB4J1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3R5bGU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5nZXRFdmVudFN0eWxlID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBpZiAoZXZlbnQudHlwZSA9PSAnZW1wdHknKSB7XHJcbiAgICAgICAgICByZXR1cm4ge31cclxuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LnR5cGUgPT0gJ3RyYWNrJyB8fCBldmVudC50eXBlID09ICdxdWV1ZScpIHtcclxuICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNGRjc2NzYnLFxyXG4gICAgICAgICAgICAnbWFyZ2luJzogJzJweCcsXHJcbiAgICAgICAgICAgICdoZWlnaHQnOiAnMThweCcsXHJcbiAgICAgICAgICAgICdib3JkZXItcmFkaXVzJzogJzRweCdcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LnR5cGUgPT0gJ3RyYWRlZCcpIHtcclxuICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNGRkQ0NTAnLFxyXG4gICAgICAgICAgICAnbWFyZ2luJzogJzJweCcsXHJcbiAgICAgICAgICAgICdoZWlnaHQnOiAnMThweCcsXHJcbiAgICAgICAgICAgICdib3JkZXItcmFkaXVzJzogJzRweCdcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50LnR5cGUgPT0gJ3BhaWQnKSB7XHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6ICcjRkZCQkREJyxcclxuICAgICAgICAgICAgJ21hcmdpbic6ICcycHgnLFxyXG4gICAgICAgICAgICAnaGVpZ2h0JzogJzE4cHgnLFxyXG4gICAgICAgICAgICAnYm9yZGVyLXJhZGl1cyc6ICc0cHgnXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUucmVmcmVzaEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZXZlbnRzL2ZvclVzZXIvJyArIFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKS5zb3VuZGNsb3VkLmlkKVxyXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgIHZhciBldmVudHMgPSByZXMuZGF0YVxyXG4gICAgICAgICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbihldikge1xyXG4gICAgICAgICAgICAgIGV2LmRheSA9IG5ldyBEYXRlKGV2LmRheSk7XHJcbiAgICAgICAgICAgICAgZXYudW5yZXBvc3REYXRlID0gZXYudW5yZXBvc3REYXRlID8gbmV3IERhdGUoZXYudW5yZXBvc3REYXRlKSA6IG5ldyBEYXRlKDApO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHNjb3BlLmV2ZW50cyA9IGV2ZW50cztcclxuICAgICAgICAgICAgJHNjb3BlLmNhbGVuZGFyID0gJHNjb3BlLmZpbGxEYXRlQXJyYXlzKGV2ZW50cyk7XHJcbiAgICAgICAgICAgICRzY29wZS5nZXRMaXN0RXZlbnRzKCk7XHJcblxyXG4gICAgICAgICAgfSlcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmZpbGxEYXRlQXJyYXlzID0gZnVuY3Rpb24oZXZlbnRzKSB7XHJcbiAgICAgICAgdmFyIGNhbGVuZGFyID0gW107XHJcbiAgICAgICAgdmFyIHRvZGF5ID0gbmV3IERhdGUoKTtcclxuICAgICAgICB0b2RheS5zZXREYXRlKHRvZGF5LmdldERhdGUoKSAtIDcpO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNDk7IGkrKykge1xyXG4gICAgICAgICAgdmFyIGNhbERheSA9IHt9O1xyXG4gICAgICAgICAgY2FsRGF5LmRheSA9IG5ldyBEYXRlKHRvZGF5KTtcclxuICAgICAgICAgIGNhbERheS5kYXkuc2V0RGF0ZSh0b2RheS5nZXREYXRlKCkgKyBpKTtcclxuICAgICAgICAgIHZhciBkYXlFdmVudHMgPSAkc2NvcGUuZXZlbnRzLmZpbHRlcihmdW5jdGlvbihldikge1xyXG4gICAgICAgICAgICByZXR1cm4gKGV2LmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSBjYWxEYXkuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdmFyIGV2ZW50QXJyYXkgPSBbXTtcclxuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgMjQ7IGorKykge1xyXG4gICAgICAgICAgICBldmVudEFycmF5W2pdID0ge1xyXG4gICAgICAgICAgICAgIHR5cGU6IFwiZW1wdHlcIlxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGRheUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2KSB7XHJcbiAgICAgICAgICAgIGV2ZW50QXJyYXlbZXYuZGF5LmdldEhvdXJzKCldID0gZXY7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGNhbERheS5ldmVudHMgPSBldmVudEFycmF5O1xyXG4gICAgICAgICAgY2FsZW5kYXIucHVzaChjYWxEYXkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2FsZW5kYXI7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkc2NvcGUuY2FsZW5kYXIgPSAkc2NvcGUuZmlsbERhdGVBcnJheXMoJHNjb3BlLmV2ZW50cyk7XHJcblxyXG4gICAgICAkc2NvcGUudmVyaWZ5QnJvd3NlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChuYXZpZ2F0b3IudXNlckFnZW50LnNlYXJjaChcIkNocm9tZVwiKSA9PSAtMSAmJiBuYXZpZ2F0b3IudXNlckFnZW50LnNlYXJjaChcIlNhZmFyaVwiKSAhPSAtMSkge1xyXG4gICAgICAgICAgdmFyIHBvc2l0aW9uID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5zZWFyY2goXCJWZXJzaW9uXCIpICsgODtcclxuICAgICAgICAgIHZhciBlbmQgPSBuYXZpZ2F0b3IudXNlckFnZW50LnNlYXJjaChcIiBTYWZhcmlcIik7XHJcbiAgICAgICAgICB2YXIgdmVyc2lvbiA9IG5hdmlnYXRvci51c2VyQWdlbnQuc3Vic3RyaW5nKHBvc2l0aW9uLCBlbmQpO1xyXG4gICAgICAgICAgaWYgKHBhcnNlSW50KHZlcnNpb24pIDwgOSkge1xyXG4gICAgICAgICAgICAkLlplYnJhX0RpYWxvZygnWW91IGhhdmUgb2xkIHZlcnNpb24gb2Ygc2FmYXJpLiBDbGljayA8YSBocmVmPVwiaHR0cHM6Ly9zdXBwb3J0LmFwcGxlLmNvbS9kb3dubG9hZHMvc2FmYXJpXCI+aGVyZTwvYT4gdG8gZG93bmxvYWQgdGhlIGxhdGVzdCB2ZXJzaW9uIG9mIHNhZmFyaSBmb3IgYmV0dGVyIHNpdGUgZXhwZXJpZW5jZS4nLCB7XHJcbiAgICAgICAgICAgICAgJ3R5cGUnOiAnY29uZmlybWF0aW9uJyxcclxuICAgICAgICAgICAgICAnYnV0dG9ucyc6IFt7XHJcbiAgICAgICAgICAgICAgICBjYXB0aW9uOiAnT0snXHJcbiAgICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgICAgJ29uQ2xvc2UnOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiaHR0cHM6Ly9zdXBwb3J0LmFwcGxlLmNvbS9kb3dubG9hZHMvc2FmYXJpXCI7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS51cGRhdGVSZWFjaCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS5yZXBvc3RSZWFjaCA9IDA7XHJcbiAgICAgICAgJHNjb3BlLnJlcG9zdFJlYWNoID0gJHNjb3BlLnVzZXIuc291bmRjbG91ZC5mb2xsb3dlcnM7XHJcbiAgICAgICAgZm9yICh2YXIga2V5IGluICRzY29wZS5vdGhlckNoYW5uZWxzKSB7XHJcbiAgICAgICAgICBpZiAoJHNjb3BlLm90aGVyQ2hhbm5lbHNba2V5XSkge1xyXG4gICAgICAgICAgICB2YXIgYWNjdCA9ICRyb290U2NvcGUudXNlcmxpbmtlZEFjY291bnRzLmZpbmQoZnVuY3Rpb24oYWNjdCkge1xyXG4gICAgICAgICAgICAgIHJldHVybiBhY2N0LnNvdW5kY2xvdWQuaWQgPT0ga2V5O1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAkc2NvcGUucmVwb3N0UmVhY2ggKz0gYWNjdC5zb3VuZGNsb3VkLmZvbGxvd2VycztcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5mb2xsb3dlcnNDb3VudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBjb3VudCA9ICRzY29wZS51c2VyLnNvdW5kY2xvdWQuZm9sbG93ZXJzO1xyXG4gICAgICAgIHZhciBjaGFubmVscyA9ICRzY29wZS5vdGhlckNoYW5uZWxzQW5kR3JvdXBzKCk7XHJcbiAgICAgICAgaWYgKCRzY29wZS5yb2xlID09ICdhZG1pbicpIHtcclxuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJHNjb3BlLnVzZXIucGFpZFJlcG9zdC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoY2hhbm5lbHMuaW5kZXhPZigkc2NvcGUudXNlci5wYWlkUmVwb3N0W2ldLmlkKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgY291bnQgPSBjb3VudCArICRzY29wZS51c2VyLnBhaWRSZXBvc3RbaV0uZm9sbG93ZXJzO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJHNjb3BlLmxpbmtlZEFjY291bnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGlmIChjaGFubmVscy5pbmRleE9mKCRzY29wZS5saW5rZWRBY2NvdW50c1tpXS5zb3VuZGNsb3VkLmlkKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICAgY291bnQgPSBjb3VudCArICRzY29wZS5saW5rZWRBY2NvdW50c1tpXS5zb3VuZGNsb3VkLmZvbGxvd2VycztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAkc2NvcGUuZm9sbG93Q291bnRzID0gY291bnQ7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5nZXRUcmFja0xpc3RGcm9tU291bmRjbG91ZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBwcm9maWxlID0gJHNjb3BlLnVzZXI7XHJcbiAgICAgICAgaWYgKHByb2ZpbGUuc291bmRjbG91ZCkge1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgU0MuZ2V0KCcvdXNlcnMvJyArIHByb2ZpbGUuc291bmRjbG91ZC5pZCArICcvdHJhY2tzJywge1xyXG4gICAgICAgICAgICAgIGZpbHRlcjogJ3B1YmxpYydcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24odHJhY2tzKSB7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrTGlzdCA9IHRyYWNrcztcclxuICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIGlmICghJHNjb3BlLiQkcGhhc2UpICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICBpZiAoISRzY29wZS4kJHBoYXNlKSAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnNoYXJlRXZlbnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUucmVwb3N0UmVzcG9uc2UgPSAkc2NvcGUubWFrZUV2ZW50O1xyXG4gICAgICAgICRzY29wZS5yZXBvc3RSZXNwb25zZS51c2VyID0gJHNjb3BlLnVzZXI7XHJcbiAgICAgICAgJCgnI3BvcCcpLm1vZGFsKCdzaG93Jyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5nZXRVc2VyTmV0d29yaygpXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAkc2NvcGUuZ2V0TGlua2VkQWNjb3VudHMoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgJHNjb3BlLmZvbGxvd2Vyc0NvdW50KCk7XHJcbiAgICAgICRzY29wZS5jaGVja0NvbW1lbnRFbmFibGUoKTtcclxuICAgICAgJHNjb3BlLmNoZWNrTGlrZUVuYWJsZSgpO1xyXG4gICAgICAkc2NvcGUudXBkYXRlUmVhY2goKTtcclxuICAgICAgJHNjb3BlLnZlcmlmeUJyb3dzZXIoKTtcclxuICAgIH1cclxuICB9XHJcbn0pXHJcbiJdLCJmaWxlIjoiY29tbW9uL2RpcmVjdGl2ZXMvc2NoZWR1bGVyL3NjaGVkdWxlci5qcyJ9
