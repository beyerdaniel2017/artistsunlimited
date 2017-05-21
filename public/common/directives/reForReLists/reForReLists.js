app.directive('reforrelists', function($http) {
  return {
    templateUrl: 'js/common/directives/reForReLists/reForReLists.html',
    restrict: 'E',
    scope: false,
    controller: function rfrListsController($scope, $rootScope, $http, SessionService, $state, $timeout, $window) {
      $scope.state = 'reForReInteraction';
      $scope.activeTab = ($window.localStorage.getItem('activetab') ? $window.localStorage.getItem('activetab') : '1');
      $scope.user = SessionService.getUser();
      $rootScope.userlinkedAccounts = ($scope.user.linkedAccounts ? $scope.user.linkedAccounts : []);
      $scope.otherUsers = [];
      $scope.type = 'remind';
      $scope.listDayIncr = 0;
      $scope.now = new Date();
      var path = window.location.pathname;
      $scope.isAdminRoute = false;
      if (path.indexOf("admin/") != -1) {
        $scope.isAdminRoute = true
      } else if(path.indexOf("thirdparty/") != -1){
        $scope.isthirdparty = true;
      } else {
        $scope.isAdminRoute = false;
      }
      $scope.itemview = "calendar";
      $scope.manageView = "calendar";
      if ($scope.activeTab == "3") {
        $window.localStorage.setItem('activetab', '1');
      }

      if (window.location.href.indexOf('artistTools/reForReLists#organizeschedule') != -1) {
        $scope.activeTab = "2";
      } else
      if (window.location.href.indexOf('artistTools/reForReLists#managetrades') != -1) {
        $scope.activeTab = "3";
      }

      $scope.currentTab = "SearchTrade";
      $scope.searchURL = "";
      $scope.sliderSearchMin = Math.log((($scope.user.soundcloud.followers) ? parseInt($scope.user.soundcloud.followers / 2) : 0)) / Math.log(1.1);
      $scope.sliderSearchMax = Math.log((($scope.user.soundcloud.followers) ? parseInt($scope.user.soundcloud.followers * 1.2) : 200000000)) / Math.log(1.1);
      $scope.minSearchTradefollowers = Math.pow(1.1, $scope.sliderSearchMin);
      $scope.maxSearchTradefollowers = Math.pow(1.1, $scope.sliderSearchMax);
      $scope.sliderManageMin = 0;
      $scope.sliderManageMax = 200000000;

      $scope.minManageTradefollowers = Math.pow(1.1, $scope.sliderManageMin);
      $scope.maxManageTradefollowers = Math.pow(1.1, $scope.sliderManageMax);
      $scope.$watch(function() {
        return $scope.sliderSearchMin
      }, function(newVal, oldVal) {
        $scope.minSearchTradefollowers = Math.pow(1.1, newVal)
      })
      $scope.$watch(function() {
        return $scope.sliderSearchMax
      }, function(newVal, oldVal) {
        $scope.maxSearchTradefollowers = Math.pow(1.1, newVal);
      })

      $scope.$watch(function() {
        return $scope.sliderManageMin
      }, function(newVal, oldVal) {
        $scope.minManageTradefollowers = Math.pow(1.1, newVal)
      })
      $scope.$watch(function() {
        return $scope.sliderManageMax
      }, function(newVal, oldVal) {
        $scope.maxManageTradefollowers = Math.pow(1.1, newVal);
      })

      $scope.sortby = "Recent Alert";
      $scope.sort_order = "ascending";
      var searchTradeRange = {
        skip: 0,
        limit: 12
      }

      $scope.dayIncr = 0;
      $scope.incrDay = function() {
        if ($scope.dayIncr < 21) $scope.dayIncr++;
      }
      $scope.decrDay = function() {
        if ($scope.dayIncr > 0) $scope.dayIncr--;
      }
      $scope.currentDate = new Date();
      var daysArray = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

      $scope.searchByFollowers = function() {
        $scope.searchURL = "";
        $scope.sendSearch();
      }

      $scope.viewSoundcloud = function(user) {
        window.location.href = user.soundcloud.permalinkURL;
      }

      $scope.sendSearch = function() {
        $scope.processing = true;
        $scope.searchUser = [];
        $http.post('/api/users/bySCURL/', {
            url: $scope.searchURL,
            minFollower: $scope.minSearchTradefollowers,
            maxFollower: $scope.maxSearchTradefollowers,
            recordRange: {
              skip: 0,
              limit: 12
            }
          })
          .then(function(res) {
            $scope.processing = false;
            $scope.searchUser = res.data;
          })
          .then(undefined, function(err) {
            $scope.success = false;
            $scope.processing = false;
            $scope.searchUser = [];
            $.Zebra_Dialog("Please enter Artist url.");
          })
          .then(null, function(err) {
            $scope.success = false;
            $scope.processing = false;
            $scope.searchUser = [];
            $.Zebra_Dialog("Did not find user.");
          });
      }

      $scope.hello = function(obj) {
        $state.go('reForReInteraction', obj);
      }

      $scope.editRepostEvent = function(item) {
        $scope.afcount = 0;
        $scope.makeEvent = {};
        $scope.deleteEventData = item;
        $scope.manageView = "newsong";
        $scope.editChannelArr = [];
        var newObj = angular.copy(item);
        $scope.makeEventURL = newObj.trackInfo.trackURL;
        $scope.selectedSlot = newObj.trackInfo.day;
        $scope.makeEvent.unrepostHours = newObj.trackInfo.unrepostHours;
        $scope.unrepostEnable = newObj.trackInfo.unrepostHours ? true : false;
        var channels = newObj.trackInfo.otherChannels;
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
        if (item.trackInfo.type == 'traded' && item.trackInfo.trackURL) {
          document.getElementById('scPlayer').style.visibility = "visible";
          $scope.showPlayer = true;
        }
        $scope.newEvent = false;
        $scope.makeEvent.day = $scope.selectedSlot;
        $scope.makeEvent.userID = newObj.trackInfo.userID;
        $scope.makeEvent.owner = newObj.trackInfo.owner;
        $scope.makeEvent._id = newObj.trackInfo._id;
        $scope.makeEvent.trackURL = $scope.makeEventURL;
        $scope.makeEvent.title = newObj.trackInfo.title;
        $scope.makeEvent.trackID = newObj.trackInfo.trackID;
        $scope.makeEvent.artistName = newObj.trackInfo.artistName;
      }

      $scope.searchCurrentTrade = function() {
        var cTrades = [];
        $scope.currentTrades = [];
        angular.forEach($scope.currentTradesCopy, function(trade) {
          if ($scope.searchURL != "") {
            var url = $scope.searchURL;
            url = url.toString().replace('http://', '').replace('https://', '');
            if ((trade.other.user.soundcloud.permalinkURL.indexOf(url) != -1)) {
              cTrades.push(trade);
            }
          } else if (parseInt($scope.maxManageTradefollowers) > 0) {
            if (trade.other.user.soundcloud.followers >= $scope.minManageTradefollowers && trade.other.user.soundcloud.followers <= $scope.maxManageTradefollowers) {
              cTrades.push(trade);
            }
          }
        });
        $scope.currentTrades = cTrades;
        console.log($scope.currentTrades);
        if (!$scope.$$phase) $scope.$apply();
      }

      $scope.tradeType = {
        Requests: true,
        Requested: true,
        TradePartners: true
      };

      $scope.filterByTradeType = function() {
        $scope.processing = true;
        var tradeType = $scope.tradeType;
        tradeType = JSON.stringify(tradeType);
        $http.get('/api/trades/withUser/' + $scope.user._id + '?tradeType=' + tradeType)
          .then(function(res) {
            var trades = res.data;
            console.log(trades);
            $scope.currentTrades = [];
            trades.forEach(function(trade) {
              trade.other = (trade.p1.user._id == $scope.user._id) ? trade.p2 : trade.p1;
              trade.user = (trade.p1.user._id == $scope.user._id) ? trade.p1 : trade.p2;
            });
            $scope.currentTrades = trades;
            console.log($scope.currentTrades);
            $scope.processing = false;
          })
      }
      $scope.sortResult = function(sortby) {
        $scope.sortby = sortby;
        var sort_order = $scope.sort_order;
        if (sortby == "Followers") {
          if (sort_order == "ascending") {
            $scope.currentTrades.sort(function(a, b) {
              return b.other.user.soundcloud.followers - a.other.user.soundcloud.followers;
            })
            $scope.sort_order = "descending";
          } else {
            $scope.currentTrades.sort(function(a, b) {
              return a.other.user.soundcloud.followers - b.other.user.soundcloud.followers;
            })
            $scope.sort_order = "ascending";
          }
        } else if (sortby == "Unfilled Slots") {
          if (sort_order == "ascending") {
            $scope.currentTrades.sort(function(a, b) {
              return b.unfilledTrackCount - a.unfilledTrackCount;
            })
            $scope.sort_order = "descending";
          } else {
            $scope.currentTrades.sort(function(a, b) {
              return a.unfilledTrackCount - b.unfilledTrackCount;
            })
            $scope.sort_order = "ascending";
          }
        } else {
          if (sort_order == "ascending") {
            $scope.currentTrades.sort(function(a, b) {
              return a.other.alert.toLowerCase() < b.other.alert.toLowerCase();
            });
            $scope.sort_order = "descending";
          } else {
            $scope.currentTrades.sort(function(a, b) {
              return a.other.alert.toLowerCase() > b.other.alert.toLowerCase();
            });
            $scope.sort_order = "ascending";
          }
        }
      }

      $scope.setView = function(type) {
        $scope.itemView = type;
        $scope.shownTrades = $scope.currentTrades.filter(function(trade) {
          if (type == 'inbox') return trade.other.accepted;
          else return trade.user.accepted;
        }).sort(function(trade) {
          if (['change', 'message'].includes(trade.user.alert)) return -1;
          else return 1
        })
      }

      $scope.setManageView = function(type) {
        $scope.manageView = type;
      };

      $scope.loadMoreUsers = function() {
        $scope.loadingMoreUsers = true;
        searchTradeRange.skip += 12;
        searchTradeRange.limit = 12;
        $http.post('/api/users/bySCURL/', {
            url: $scope.searchURL,
            minFollower: $scope.minSearchTradefollowers,
            maxFollower: $scope.maxSearchTradefollowers,
            recordRange: searchTradeRange
          })
          .then(function(res) {
            $scope.loadingMoreUsers = false;
            $scope.processing = false;
            if (res.data.length > 0) {
              angular.forEach(res.data, function(d) {
                $scope.searchUser.push(d);
              });
            }
          })
          .then(null, function(err) {
            $scope.loadingMoreUsers = false;
            $scope.success = false;
            $scope.processing = false;
            $scope.searchUser = [];
            $.Zebra_Dialog("Please enter Artist url.");
          });
      };

      $scope.$on('loadTrades', function(e) {
        if (window.location.href.includes('reForReLists') && !window.location.href.includes('#organizeschedule') && !window.location.href.includes('#managetrades')) $scope.loadMoreUsers();
      });

      $scope.openTrade = function(user) {
        var found = $scope.currentTrades.find(function(trade) {
          return (trade.other.user._id == user._id);
        });
        if (found) {
          $scope.goToTrade(found);
        } else {
          var trade = {
            messages: [{
              date: new Date(),
              senderId: SessionService.getUser()._id,
              text: SessionService.getUser().soundcloud.username + ' opened a trade.',
              type: 'alert'
            }],
            repeatFor: 0,
            p1: {
              user: SessionService.getUser()._id,
              alert: "none",
              slots: [],
              accepted: true
            },
            p2: {
              user: user._id,
              alert: "change",
              slots: [],
              accepted: false
            }
          }
          $scope.processing = true;
          $http.post('/api/trades/new', trade)
            .then(function(res) {
              $scope.processing = false;
              console.log(res.data);
              $scope.goToTrade(res.data);
            })
            .then(null, function(err) {
              $scope.processing = false;
              $.Zebra_Dialog("Error in creating trade");
            });
        }
      }

      $scope.goToTrade = function(trade) {
        if ($scope.isthirdparty) {
          window.location.href = '/thirdparty/trade/' + trade.p1.user.soundcloud.pseudoname + '/' + trade.p2.user.soundcloud.pseudoname;
        } else if ($scope.isAdminRoute) {
          window.location.href = '/admin/trade/' + trade.p1.user.soundcloud.pseudoname + '/' + trade.p2.user.soundcloud.pseudoname;
        } else {
          window.location.href = '/artistTools/trade/' + trade.p1.user.soundcloud.pseudoname + '/' + trade.p2.user.soundcloud.pseudoname;
        }
      }

      $scope.manage = function(trade) {
        console.log(trade);
        $scope.goToTrade(trade);
      }

      $scope.remindTrade = function(trade, index) {
        $('#pop').modal('show');
        $scope.theTrade = trade;
        $scope.tradeID = trade._id;
        if (!$scope.$$phase) $scope.$apply()
      }

      if (window.localStorage.getItem("showPopup")) {
        var trade = JSON.parse(window.localStorage.getItem("showPopup"));
        window.localStorage.removeItem("showPopup");
        setTimeout(function() {
          $scope.remindTrade(trade, 0);
        }, 500)
      }

      $scope.sendMail = function(sharelink) {
        $scope.fbMessageLink = sharelink;
        $window.open("mailto:example@demo.com?body=" + sharelink, "_self");
      };

      $scope.deleteTrade = function(tradeID, index) {
        $.Zebra_Dialog('Are you sure you want to delete this trade?', {
          'type': 'confirmation',
          'buttons': [{
            caption: 'No',
            callback: function() {
              console.log('No was clicked');
            }
          }, {
            caption: 'Yes',
            callback: function() {
              $scope.processing = true;
              $http.post('/api/trades/delete', {
                  id: tradeID
                })
                .then(function(res) {
                  $scope.processing = false;
                  $scope.shownTrades.splice(index, 1);
                })
                .then(null, function(err) {
                  $scope.processing = false;
                  $.Zebra_Dialog('Error accepting');
                })
            }
          }]
        });
      }

      $scope.checkNotification = function() {
        $scope.$parent.shownotification = false
        $scope.currentTrades.forEach(function(trade) {
          if (trade.other.accepted) {
            $scope.$parent.shownotification = true;
          }
        });
      }

      $scope.hideNotification = function() {
        $http.put('/api/trades/hideNotification', $scope.shownTrades)
          .then(function(res) {})
          .then(null, function(err) {
            $scope.checkNotification();
          })
      }


      $scope.setCurrentTab = function(currentTab) {
        $scope.currentTab = currentTab;
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
          }
        }
      }

      $scope.dayIncr = 7;
      $scope.incrDay = function() {
        if ($scope.dayIncr < 21) $scope.dayIncr++;
      }

      $scope.decrDay = function() {
        if ($scope.dayIncr > 0) $scope.dayIncr--;
      }

      $scope.dayOfWeekAsString = function(date) {
        var dayIndex = date.getDay();
        if (screen.width > '744') {
          return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex];
        }
        return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayIndex];
      }

      $scope.getStyle = function() {
        return {
          'border-radius': '4px',
          'border-width': '1px'
        };
      }

      $scope.getEventStyle = function(repostEvent) {
        if (repostEvent.type == 'empty') {
          return {}
        } else if (repostEvent.type == 'traded' && repostEvent.trackInfo.trackID) {
          return {
            'background-color': '#B22222',
            'height': '20px',
            // 'margin': '2px',
            'border-radius': '4px'
          }
        } else if (repostEvent.type == 'traded' && !repostEvent.trackInfo.trackID) {
          return {
            'background-color': '#2b9fda',
            'height': '20px',
            // 'margin': '2px',
            'border-radius': '4px'
          }
        } else if (repostEvent.type == 'multiple') {
          var unfilled = false;
          repostEvent.events.forEach(function(event) {
            if (!event.trackInfo.trackID) unfilled = true;
          })
          if (unfilled) {
            return {
              'background-color': '#7A549B',
              'height': '20px',
              'border-radius': '4px'
            }
          } else {
            return {
              'background-color': '#B22222',
              'height': '20px',
              'border-radius': '4px'
            }
          }
        }
      }

      $scope.getEventText = function(repostEvent) {
        if (repostEvent.type == 'traded') return repostEvent.userInfo.username
        else if (repostEvent.type == 'multiple') return 'Multiple Slots'
      }

      $scope.fillDateArrays = function(repostEvent) {
        var calendar = [];
        var today = new Date();
        today.setDate(today.getDate() - 7);
        for (var i = 0; i < 29; i++) {
          var calDay = {};
          calDay.day = new Date(today);
          calDay.day.setDate(today.getDate() + i);
          var dayEvents = repostEvent.filter(function(ev) {
            return (new Date(ev.trackInfo.day).toLocaleDateString() == calDay.day.toLocaleDateString());
          });
          var eventArray = [];
          for (var j = 0; j < 24; j++) {
            eventArray[j] = {
              type: "empty"
            };
          }
          dayEvents.forEach(function(ev) {
            if (eventArray[new Date(ev.trackInfo.day).getHours()].type == 'empty') {
              ev.type = 'traded';
              eventArray[new Date(ev.trackInfo.day).getHours()] = ev;
            } else if (eventArray[new Date(ev.trackInfo.day).getHours()].type == 'traded') {
              var event = {
                type: 'multiple',
                events: []
              }
              event.events.push(eventArray[new Date(ev.trackInfo.day).getHours()])
              event.events.push(ev);
              eventArray[new Date(ev.trackInfo.day).getHours()] = event;
            } else if (eventArray[new Date(ev.trackInfo.day).getHours()].type == 'multiple') {
              eventArray[new Date(ev.trackInfo.day).getHours()].events.push(ev);
            }
          });
          calDay.events = eventArray;
          calendar.push(calDay);
        }
        return calendar;
      };

      $scope.calendar = $scope.fillDateArrays($scope.events);
      $scope.isView = false;
      $scope.clickedSlot = function(day, hour, data) {
        if (data.type == 'multiple') {
          var buttons = [];
          data.events.forEach(function(ev) {
            var button = {
              caption: ev.userInfo.username,
              callback: function() {
                $scope.openPopup(day, hour, ev);
                if (!$scope.$$phase) $scope.$apply();
              }
            }
            buttons.push(button);
          })
          $.Zebra_Dialog('Which slot do you want to edit?', {
            'type': 'question',
            'buttons': buttons
          });
        } else {
          $scope.openPopup(day, hour, data);
        }
      }

      $scope.openPopup = function(day, hour, data) {
        $scope.afcount = 0;
        $scope.deleteEventData = data;
        document.getElementById('scPopupPlayer').style.visibility = "hidden";
        document.getElementById('scPopupPlayer').innerHTML = "";
        $scope.makeEvent = {};
        var makeDay = new Date(day);
        makeDay.setHours(hour);
        $scope.makeEvent = JSON.parse(JSON.stringify(data.trackInfo));
        $scope.makeEvent._id = data.trackInfo._id;
        $scope.makeEvent.day = new Date(data.trackInfo.day);
        $scope.makeEvent.url = data.trackInfo.trackURL;
        $scope.makeEvent.comment = data.trackInfo.comment;
        $scope.makeEvent.timeGap = data.trackInfo.timeGap;
        $scope.makeEvent.artist = data.userInfo;
        var repostDate = new Date(data.trackInfo.day);
        var unrepostDate = new Date(data.trackInfo.unrepostDate);
        var diff = Math.abs(new Date(unrepostDate).getTime() - new Date(repostDate).getTime()) / 3600000;
        $scope.makeEvent.unrepostHours = diff;
        var d = new Date(day).getDay();
        var channels = data.trackInfo.otherChannels;
        $scope.displayChannels = [];
        for (var i = 0; i < $scope.events.length; i++) {
          if (channels.indexOf($scope.events[i].userInfo.id) > -1) {
            $scope.displayChannels.push($scope.events[i].userInfo.username);
          }
        }
        $scope.showOverlay = true;
        var calDay = {};
        var calendarDay = $scope.calendar.find(function(calD) {
          return calD.day.toLocaleDateString() == day.toLocaleDateString();
        });
        if (data.trackInfo.trackURL) {
          $scope.isView = true;
          SC.Widget('scPopupPlayer').load($scope.makeEvent.url, {
            auto_play: false,
            show_artwork: false
          });
          document.getElementById('scPopupPlayer').style.visibility = "visible";
          $scope.showPlayer = true;
        } else {
          $scope.isView = false;
          document.getElementById('scPopupPlayer').style.visibility = "hidden";
          $scope.showPlayer = false;
        }
      }

      $scope.closeModal = function() {
        $scope.showOverlay = false;
      }

      $scope.deleteEvent = function() {
        var eventId = $scope.deleteEventData.trackInfo._id;
        $.Zebra_Dialog('Are you sure you want to delete this trade?', {
          'type': 'question',
          'buttons': [{
            caption: 'Cancel',
            callback: function() {}
          }, {
            caption: 'Yes',
            callback: function() {
              $http.delete('/api/events/repostEvents/' + eventId)
                .then(function(res) {
                  $scope.showOverlay = false;
                  $state.reload();
                  $scope.activeTab = "3";
                })
                .then(null, function(err) {
                  $scope.processing = false;
                  $.Zebra_Dialog("ERROR: Did not delete.")
                });
            }
          }]
        });
      }

      $scope.saveEvent = function() {
        $scope.processing = true;
        var req = $http.put('/api/events/repostEvents', $scope.makeEvent)
          .then(function(res) {
            $scope.makeEventURL = "";
            $scope.makeEvent = null;
            $scope.eventComment = "";
            document.getElementById('scPlayer').style.visibility = "hidden";
            document.getElementById('scPopupPlayer').style.visibility = "hidden";
            $scope.unrepostHours = 1;
            $scope.tabSelected = true;
            $scope.trackType = "";
            $scope.trackArtistID = 0;
            if ($scope.manageView == "newsong") {
              $scope.manageView = "list";
            }
            $http.get("/api/events/getRepostEvents/" + $scope.user._id)
              .then(function(res) {
                $scope.processing = false;
                $scope.calendar = $scope.fillDateArrays(res.data);
                $scope.listevents = res.data;
              }).then(null, function(err) {
                $scope.processing = false;
                $.Zebra_Dialog(err.data);
              });
            $scope.showOverlay = false;
          })
          .then(null, function(err) {
            $scope.processing = false;
            $.Zebra_Dialog(err.data);
          });
      }

      $scope.choseArtist = function(user) {
        $scope.searchURL = user.permalink_url;
        $scope.sendSearch();
      }

      $scope.choseTrack1 = function(track) {
        $scope.showPlayer = true;
        $scope.fillMakeEvent(track);
        var popupPlayerWidget = SC.Widget('scPopupPlayer');
        popupPlayerWidget.load(track.permalink_url, {
          auto_play: false,
          show_artwork: false,
          callback: function() {
            console.log($scope.showPlayer);
            console.log($scope.makeEvent);
            document.getElementById('scPopupPlayer').style.visibility = "visible";
            console.log(document.getElementById('scPopupPlayer'));
            if (!$scope.$$phase) $scope.$apply();
          }
        });
      }

      $scope.fillMakeEvent = function(track) {
        $scope.makeEvent.trackID = track.id;
        $scope.makeEvent.title = track.title;
        $scope.makeEvent.trackURL = track.permalink_url;
        $scope.makeEvent.trackArtUrl = track.artwork_url;
        $scope.makeEvent.trackArtUrl = track.artwork_url;
        $scope.makeEvent.artistName = track.user.username;
      }

      $scope.choseTrack = function(track) {
        $scope.showPlayer = true;
        $scope.fillMakeEvent(track);
        var playerWidget = SC.Widget('scPlayer');
        playerWidget.load(track.permalink_url, {
          auto_play: false,
          show_artwork: true,
          callback: function() {
            document.getElementById('scPlayer').style.visibility = "visible";
            if (!$scope.$$phase) $scope.$apply();
          }
        });
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
      $scope.scheduleRepostEvent = function(data) {
        if (data.trackInfo) {
          $scope.deleteEventData = data;
          $scope.manageView = "newsong";
          document.getElementById('scPlayer').style.visibility = "hidden";
          document.getElementById('scPlayer').innerHTML = "";
          var day = new Date(data.trackInfo.day);
          $scope.makeEvent = {};
          $scope.makeEvent._id = data.trackInfo._id;
          $scope.makeEvent.day = new Date(data.trackInfo.day);
          $scope.makeEvent.url = data.trackInfo.trackURL;
          $scope.makeEvent.comment = data.trackInfo.comment;
          $scope.makeEvent.timeGap = data.trackInfo.timeGap;
          $scope.makeEvent.artist = data.userInfo;
          var repostDate = new Date(data.trackInfo.day);
          var unrepostDate = new Date(data.trackInfo.unrepostDate);
          var diff = Math.abs(new Date(unrepostDate).getTime() - new Date(repostDate).getTime()) / 3600000;
          $scope.makeEvent.unrepostHours = diff;
          $scope.makeEvent.unrepostDate = unrepostDate;
          var d = new Date(day).getDay();
          var channels = data.trackInfo.otherChannels;
          $scope.displayChannels = [];
          for (var i = 0; i < $scope.events.length; i++) {
            if (channels.indexOf($scope.events[i].userInfo.id) > -1) {
              $scope.displayChannels.push($scope.events[i].userInfo.username);
            }
          }
          var calDay = {};
          var calendarDay = $scope.calendar.find(function(calD) {
            return calD.day.toLocaleDateString() == day.toLocaleDateString();
          });
          $scope.showPlayer = false;
        }
      }

      $scope.addNewSongCancel = function() {
        $scope.manageView = "list";
      }

      $scope.allowSave = function() {
        if (!$scope.makeEvent) return false;
        return new Date($scope.makeEvent.day) > new Date();
      }

      $scope.autofillAll = function() {
        $.Zebra_Dialog('Are you sure you want to fill all your slots with your autofill tracks?', {
          'type': 'question',
          'buttons': [{
            caption: 'Cancel',
            callback: function() {}
          }, {
            caption: 'Yes',
            callback: function() {
              $scope.processing = true;
              $http.put("/api/events/repostEvents/autofillAll")
                .then(function(res) {
                  return $http.get('/api/events/getRepostEvents/' + $scope.user._id)
                })
                .then(function(res) {
                  console.log(res.data);
                  $scope.calendar = $scope.fillDateArrays(res.data);
                  $scope.listevents = res.data;
                  $scope.processing = false;
                }).then(null, console.log);
            }
          }]
        });
      }

      $scope.offer = function(trade) {
        if ($scope.itemView == 'sent') {
          return "You are offering " + trade.user.slots.length * (trade.repeatFor > 0 ? trade.repeatFor : 1) + " slots (" + (trade.user.slots.length * trade.user.user.soundcloud.followers * (trade.repeatFor > 0 ? trade.repeatFor : 1)).toLocaleString() + " follower exposure)<br>and asking for " + trade.other.slots.length * (trade.repeatFor > 0 ? trade.repeatFor : 1) + " slots (" + (trade.other.slots.length * trade.other.user.soundcloud.followers * (trade.repeatFor > 0 ? trade.repeatFor : 1)).toLocaleString() + " follower exposure)."
        } else {
          return trade.other.user.soundcloud.username + " is offering " + trade.other.slots.length * (trade.repeatFor > 0 ? trade.repeatFor : 1) + " slots (" + (trade.other.slots.length * trade.other.user.soundcloud.followers * (trade.repeatFor > 0 ? trade.repeatFor : 1)).toLocaleString() + " follower exposure)<br>and asking for " + trade.user.slots.length * (trade.repeatFor > 0 ? trade.repeatFor : 1) + " slots (" + (trade.user.slots.length * trade.user.user.soundcloud.followers * (trade.repeatFor > 0 ? trade.repeatFor : 1)).toLocaleString() + " follower exposure)."
        }
      }

      /*Manage Trades end*/
      $scope.getUserNetwork();
      $scope.verifyBrowser();
      $scope.checkNotification();
      $scope.sortResult($scope.sortby);
      $scope.loadMoreUsers();
      $scope.setView("inbox");
      
      if ($window.localStorage.getItem('inboxState')) {
        $scope.setView($window.localStorage.getItem('inboxState'));
        $window.localStorage.removeItem('inboxState');
      }
    }
  }
})
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24vZGlyZWN0aXZlcy9yZUZvclJlTGlzdHMvcmVGb3JSZUxpc3RzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5kaXJlY3RpdmUoJ3JlZm9ycmVsaXN0cycsIGZ1bmN0aW9uKCRodHRwKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvcmVGb3JSZUxpc3RzL3JlRm9yUmVMaXN0cy5odG1sJyxcclxuICAgIHJlc3RyaWN0OiAnRScsXHJcbiAgICBzY29wZTogZmFsc2UsXHJcbiAgICBjb250cm9sbGVyOiBmdW5jdGlvbiByZnJMaXN0c0NvbnRyb2xsZXIoJHNjb3BlLCAkcm9vdFNjb3BlLCAkaHR0cCwgU2Vzc2lvblNlcnZpY2UsICRzdGF0ZSwgJHRpbWVvdXQsICR3aW5kb3cpIHtcclxuICAgICAgJHNjb3BlLnN0YXRlID0gJ3JlRm9yUmVJbnRlcmFjdGlvbic7XHJcbiAgICAgICRzY29wZS5hY3RpdmVUYWIgPSAoJHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnYWN0aXZldGFiJykgPyAkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhY3RpdmV0YWInKSA6ICcxJyk7XHJcbiAgICAgICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICAgICAkcm9vdFNjb3BlLnVzZXJsaW5rZWRBY2NvdW50cyA9ICgkc2NvcGUudXNlci5saW5rZWRBY2NvdW50cyA/ICRzY29wZS51c2VyLmxpbmtlZEFjY291bnRzIDogW10pO1xyXG4gICAgICAkc2NvcGUub3RoZXJVc2VycyA9IFtdO1xyXG4gICAgICAkc2NvcGUudHlwZSA9ICdyZW1pbmQnO1xyXG4gICAgICAkc2NvcGUubGlzdERheUluY3IgPSAwO1xyXG4gICAgICAkc2NvcGUubm93ID0gbmV3IERhdGUoKTtcclxuICAgICAgdmFyIHBhdGggPSB3aW5kb3cubG9jYXRpb24ucGF0aG5hbWU7XHJcbiAgICAgICRzY29wZS5pc0FkbWluUm91dGUgPSBmYWxzZTtcclxuICAgICAgaWYgKHBhdGguaW5kZXhPZihcImFkbWluL1wiKSAhPSAtMSkge1xyXG4gICAgICAgICRzY29wZS5pc0FkbWluUm91dGUgPSB0cnVlXHJcbiAgICAgIH0gZWxzZSBpZihwYXRoLmluZGV4T2YoXCJ0aGlyZHBhcnR5L1wiKSAhPSAtMSl7XHJcbiAgICAgICAgJHNjb3BlLmlzdGhpcmRwYXJ0eSA9IHRydWU7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgJHNjb3BlLmlzQWRtaW5Sb3V0ZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgICRzY29wZS5pdGVtdmlldyA9IFwiY2FsZW5kYXJcIjtcclxuICAgICAgJHNjb3BlLm1hbmFnZVZpZXcgPSBcImNhbGVuZGFyXCI7XHJcbiAgICAgIGlmICgkc2NvcGUuYWN0aXZlVGFiID09IFwiM1wiKSB7XHJcbiAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYWN0aXZldGFiJywgJzEnKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ2FydGlzdFRvb2xzL3JlRm9yUmVMaXN0cyNvcmdhbml6ZXNjaGVkdWxlJykgIT0gLTEpIHtcclxuICAgICAgICAkc2NvcGUuYWN0aXZlVGFiID0gXCIyXCI7XHJcbiAgICAgIH0gZWxzZVxyXG4gICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignYXJ0aXN0VG9vbHMvcmVGb3JSZUxpc3RzI21hbmFnZXRyYWRlcycpICE9IC0xKSB7XHJcbiAgICAgICAgJHNjb3BlLmFjdGl2ZVRhYiA9IFwiM1wiO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuY3VycmVudFRhYiA9IFwiU2VhcmNoVHJhZGVcIjtcclxuICAgICAgJHNjb3BlLnNlYXJjaFVSTCA9IFwiXCI7XHJcbiAgICAgICRzY29wZS5zbGlkZXJTZWFyY2hNaW4gPSBNYXRoLmxvZygoKCRzY29wZS51c2VyLnNvdW5kY2xvdWQuZm9sbG93ZXJzKSA/IHBhcnNlSW50KCRzY29wZS51c2VyLnNvdW5kY2xvdWQuZm9sbG93ZXJzIC8gMikgOiAwKSkgLyBNYXRoLmxvZygxLjEpO1xyXG4gICAgICAkc2NvcGUuc2xpZGVyU2VhcmNoTWF4ID0gTWF0aC5sb2coKCgkc2NvcGUudXNlci5zb3VuZGNsb3VkLmZvbGxvd2VycykgPyBwYXJzZUludCgkc2NvcGUudXNlci5zb3VuZGNsb3VkLmZvbGxvd2VycyAqIDEuMikgOiAyMDAwMDAwMDApKSAvIE1hdGgubG9nKDEuMSk7XHJcbiAgICAgICRzY29wZS5taW5TZWFyY2hUcmFkZWZvbGxvd2VycyA9IE1hdGgucG93KDEuMSwgJHNjb3BlLnNsaWRlclNlYXJjaE1pbik7XHJcbiAgICAgICRzY29wZS5tYXhTZWFyY2hUcmFkZWZvbGxvd2VycyA9IE1hdGgucG93KDEuMSwgJHNjb3BlLnNsaWRlclNlYXJjaE1heCk7XHJcbiAgICAgICRzY29wZS5zbGlkZXJNYW5hZ2VNaW4gPSAwO1xyXG4gICAgICAkc2NvcGUuc2xpZGVyTWFuYWdlTWF4ID0gMjAwMDAwMDAwO1xyXG5cclxuICAgICAgJHNjb3BlLm1pbk1hbmFnZVRyYWRlZm9sbG93ZXJzID0gTWF0aC5wb3coMS4xLCAkc2NvcGUuc2xpZGVyTWFuYWdlTWluKTtcclxuICAgICAgJHNjb3BlLm1heE1hbmFnZVRyYWRlZm9sbG93ZXJzID0gTWF0aC5wb3coMS4xLCAkc2NvcGUuc2xpZGVyTWFuYWdlTWF4KTtcclxuICAgICAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gJHNjb3BlLnNsaWRlclNlYXJjaE1pblxyXG4gICAgICB9LCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCkge1xyXG4gICAgICAgICRzY29wZS5taW5TZWFyY2hUcmFkZWZvbGxvd2VycyA9IE1hdGgucG93KDEuMSwgbmV3VmFsKVxyXG4gICAgICB9KVxyXG4gICAgICAkc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiAkc2NvcGUuc2xpZGVyU2VhcmNoTWF4XHJcbiAgICAgIH0sIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKSB7XHJcbiAgICAgICAgJHNjb3BlLm1heFNlYXJjaFRyYWRlZm9sbG93ZXJzID0gTWF0aC5wb3coMS4xLCBuZXdWYWwpO1xyXG4gICAgICB9KVxyXG5cclxuICAgICAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4gJHNjb3BlLnNsaWRlck1hbmFnZU1pblxyXG4gICAgICB9LCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCkge1xyXG4gICAgICAgICRzY29wZS5taW5NYW5hZ2VUcmFkZWZvbGxvd2VycyA9IE1hdGgucG93KDEuMSwgbmV3VmFsKVxyXG4gICAgICB9KVxyXG4gICAgICAkc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiAkc2NvcGUuc2xpZGVyTWFuYWdlTWF4XHJcbiAgICAgIH0sIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKSB7XHJcbiAgICAgICAgJHNjb3BlLm1heE1hbmFnZVRyYWRlZm9sbG93ZXJzID0gTWF0aC5wb3coMS4xLCBuZXdWYWwpO1xyXG4gICAgICB9KVxyXG5cclxuICAgICAgJHNjb3BlLnNvcnRieSA9IFwiUmVjZW50IEFsZXJ0XCI7XHJcbiAgICAgICRzY29wZS5zb3J0X29yZGVyID0gXCJhc2NlbmRpbmdcIjtcclxuICAgICAgdmFyIHNlYXJjaFRyYWRlUmFuZ2UgPSB7XHJcbiAgICAgICAgc2tpcDogMCxcclxuICAgICAgICBsaW1pdDogMTJcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmRheUluY3IgPSAwO1xyXG4gICAgICAkc2NvcGUuaW5jckRheSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICgkc2NvcGUuZGF5SW5jciA8IDIxKSAkc2NvcGUuZGF5SW5jcisrO1xyXG4gICAgICB9XHJcbiAgICAgICRzY29wZS5kZWNyRGF5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKCRzY29wZS5kYXlJbmNyID4gMCkgJHNjb3BlLmRheUluY3ItLTtcclxuICAgICAgfVxyXG4gICAgICAkc2NvcGUuY3VycmVudERhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICB2YXIgZGF5c0FycmF5ID0gWydzdW5kYXknLCAnbW9uZGF5JywgJ3R1ZXNkYXknLCAnd2VkbmVzZGF5JywgJ3RodXJzZGF5JywgJ2ZyaWRheScsICdzYXR1cmRheSddO1xyXG5cclxuICAgICAgJHNjb3BlLnNlYXJjaEJ5Rm9sbG93ZXJzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLnNlYXJjaFVSTCA9IFwiXCI7XHJcbiAgICAgICAgJHNjb3BlLnNlbmRTZWFyY2goKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnZpZXdTb3VuZGNsb3VkID0gZnVuY3Rpb24odXNlcikge1xyXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdXNlci5zb3VuZGNsb3VkLnBlcm1hbGlua1VSTDtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnNlbmRTZWFyY2ggPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgJHNjb3BlLnNlYXJjaFVzZXIgPSBbXTtcclxuICAgICAgICAkaHR0cC5wb3N0KCcvYXBpL3VzZXJzL2J5U0NVUkwvJywge1xyXG4gICAgICAgICAgICB1cmw6ICRzY29wZS5zZWFyY2hVUkwsXHJcbiAgICAgICAgICAgIG1pbkZvbGxvd2VyOiAkc2NvcGUubWluU2VhcmNoVHJhZGVmb2xsb3dlcnMsXHJcbiAgICAgICAgICAgIG1heEZvbGxvd2VyOiAkc2NvcGUubWF4U2VhcmNoVHJhZGVmb2xsb3dlcnMsXHJcbiAgICAgICAgICAgIHJlY29yZFJhbmdlOiB7XHJcbiAgICAgICAgICAgICAgc2tpcDogMCxcclxuICAgICAgICAgICAgICBsaW1pdDogMTJcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkc2NvcGUuc2VhcmNoVXNlciA9IHJlcy5kYXRhO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC50aGVuKHVuZGVmaW5lZCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5zdWNjZXNzID0gZmFsc2U7XHJcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICRzY29wZS5zZWFyY2hVc2VyID0gW107XHJcbiAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKFwiUGxlYXNlIGVudGVyIEFydGlzdCB1cmwuXCIpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgICAkc2NvcGUuc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkc2NvcGUuc2VhcmNoVXNlciA9IFtdO1xyXG4gICAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkRpZCBub3QgZmluZCB1c2VyLlwiKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuaGVsbG8gPSBmdW5jdGlvbihvYmopIHtcclxuICAgICAgICAkc3RhdGUuZ28oJ3JlRm9yUmVJbnRlcmFjdGlvbicsIG9iaik7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5lZGl0UmVwb3N0RXZlbnQgPSBmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgJHNjb3BlLmFmY291bnQgPSAwO1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQgPSB7fTtcclxuICAgICAgICAkc2NvcGUuZGVsZXRlRXZlbnREYXRhID0gaXRlbTtcclxuICAgICAgICAkc2NvcGUubWFuYWdlVmlldyA9IFwibmV3c29uZ1wiO1xyXG4gICAgICAgICRzY29wZS5lZGl0Q2hhbm5lbEFyciA9IFtdO1xyXG4gICAgICAgIHZhciBuZXdPYmogPSBhbmd1bGFyLmNvcHkoaXRlbSk7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudFVSTCA9IG5ld09iai50cmFja0luZm8udHJhY2tVUkw7XHJcbiAgICAgICAgJHNjb3BlLnNlbGVjdGVkU2xvdCA9IG5ld09iai50cmFja0luZm8uZGF5O1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQudW5yZXBvc3RIb3VycyA9IG5ld09iai50cmFja0luZm8udW5yZXBvc3RIb3VycztcclxuICAgICAgICAkc2NvcGUudW5yZXBvc3RFbmFibGUgPSBuZXdPYmoudHJhY2tJbmZvLnVucmVwb3N0SG91cnMgPyB0cnVlIDogZmFsc2U7XHJcbiAgICAgICAgdmFyIGNoYW5uZWxzID0gbmV3T2JqLnRyYWNrSW5mby5vdGhlckNoYW5uZWxzO1xyXG4gICAgICAgIGlmIChjaGFubmVscy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGNoYW5uZWxzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgJHNjb3BlLmxpbmtlZEFjY291bnRzLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGNoYW5uZWxzW2ldID09ICRzY29wZS5saW5rZWRBY2NvdW50c1tqXS5zb3VuZGNsb3VkLmlkKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuZWRpdENoYW5uZWxBcnIucHVzaCgkc2NvcGUubGlua2VkQWNjb3VudHNbal0ubmFtZSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAkc2NvcGUuY2hhbm5lbEFyciA9ICRzY29wZS5lZGl0Q2hhbm5lbEFycjtcclxuICAgICAgICB9XHJcbiAgICAgICAgU0MuV2lkZ2V0KCdzY1BsYXllcicpLmxvYWQoJHNjb3BlLm1ha2VFdmVudFVSTCwge1xyXG4gICAgICAgICAgYXV0b19wbGF5OiBmYWxzZSxcclxuICAgICAgICAgIHNob3dfYXJ0d29yazogdHJ1ZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChpdGVtLnRyYWNrSW5mby50eXBlID09ICd0cmFkZWQnICYmIGl0ZW0udHJhY2tJbmZvLnRyYWNrVVJMKSB7XHJcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XHJcbiAgICAgICAgICAkc2NvcGUuc2hvd1BsYXllciA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICRzY29wZS5uZXdFdmVudCA9IGZhbHNlO1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQuZGF5ID0gJHNjb3BlLnNlbGVjdGVkU2xvdDtcclxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnVzZXJJRCA9IG5ld09iai50cmFja0luZm8udXNlcklEO1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQub3duZXIgPSBuZXdPYmoudHJhY2tJbmZvLm93bmVyO1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQuX2lkID0gbmV3T2JqLnRyYWNrSW5mby5faWQ7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC50cmFja1VSTCA9ICRzY29wZS5tYWtlRXZlbnRVUkw7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC50aXRsZSA9IG5ld09iai50cmFja0luZm8udGl0bGU7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC50cmFja0lEID0gbmV3T2JqLnRyYWNrSW5mby50cmFja0lEO1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQuYXJ0aXN0TmFtZSA9IG5ld09iai50cmFja0luZm8uYXJ0aXN0TmFtZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnNlYXJjaEN1cnJlbnRUcmFkZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBjVHJhZGVzID0gW107XHJcbiAgICAgICAgJHNjb3BlLmN1cnJlbnRUcmFkZXMgPSBbXTtcclxuICAgICAgICBhbmd1bGFyLmZvckVhY2goJHNjb3BlLmN1cnJlbnRUcmFkZXNDb3B5LCBmdW5jdGlvbih0cmFkZSkge1xyXG4gICAgICAgICAgaWYgKCRzY29wZS5zZWFyY2hVUkwgIT0gXCJcIikge1xyXG4gICAgICAgICAgICB2YXIgdXJsID0gJHNjb3BlLnNlYXJjaFVSTDtcclxuICAgICAgICAgICAgdXJsID0gdXJsLnRvU3RyaW5nKCkucmVwbGFjZSgnaHR0cDovLycsICcnKS5yZXBsYWNlKCdodHRwczovLycsICcnKTtcclxuICAgICAgICAgICAgaWYgKCh0cmFkZS5vdGhlci51c2VyLnNvdW5kY2xvdWQucGVybWFsaW5rVVJMLmluZGV4T2YodXJsKSAhPSAtMSkpIHtcclxuICAgICAgICAgICAgICBjVHJhZGVzLnB1c2godHJhZGUpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKHBhcnNlSW50KCRzY29wZS5tYXhNYW5hZ2VUcmFkZWZvbGxvd2VycykgPiAwKSB7XHJcbiAgICAgICAgICAgIGlmICh0cmFkZS5vdGhlci51c2VyLnNvdW5kY2xvdWQuZm9sbG93ZXJzID49ICRzY29wZS5taW5NYW5hZ2VUcmFkZWZvbGxvd2VycyAmJiB0cmFkZS5vdGhlci51c2VyLnNvdW5kY2xvdWQuZm9sbG93ZXJzIDw9ICRzY29wZS5tYXhNYW5hZ2VUcmFkZWZvbGxvd2Vycykge1xyXG4gICAgICAgICAgICAgIGNUcmFkZXMucHVzaCh0cmFkZSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgICAkc2NvcGUuY3VycmVudFRyYWRlcyA9IGNUcmFkZXM7XHJcbiAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLmN1cnJlbnRUcmFkZXMpO1xyXG4gICAgICAgIGlmICghJHNjb3BlLiQkcGhhc2UpICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnRyYWRlVHlwZSA9IHtcclxuICAgICAgICBSZXF1ZXN0czogdHJ1ZSxcclxuICAgICAgICBSZXF1ZXN0ZWQ6IHRydWUsXHJcbiAgICAgICAgVHJhZGVQYXJ0bmVyczogdHJ1ZVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgJHNjb3BlLmZpbHRlckJ5VHJhZGVUeXBlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAgIHZhciB0cmFkZVR5cGUgPSAkc2NvcGUudHJhZGVUeXBlO1xyXG4gICAgICAgIHRyYWRlVHlwZSA9IEpTT04uc3RyaW5naWZ5KHRyYWRlVHlwZSk7XHJcbiAgICAgICAgJGh0dHAuZ2V0KCcvYXBpL3RyYWRlcy93aXRoVXNlci8nICsgJHNjb3BlLnVzZXIuX2lkICsgJz90cmFkZVR5cGU9JyArIHRyYWRlVHlwZSlcclxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICB2YXIgdHJhZGVzID0gcmVzLmRhdGE7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHRyYWRlcyk7XHJcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50VHJhZGVzID0gW107XHJcbiAgICAgICAgICAgIHRyYWRlcy5mb3JFYWNoKGZ1bmN0aW9uKHRyYWRlKSB7XHJcbiAgICAgICAgICAgICAgdHJhZGUub3RoZXIgPSAodHJhZGUucDEudXNlci5faWQgPT0gJHNjb3BlLnVzZXIuX2lkKSA/IHRyYWRlLnAyIDogdHJhZGUucDE7XHJcbiAgICAgICAgICAgICAgdHJhZGUudXNlciA9ICh0cmFkZS5wMS51c2VyLl9pZCA9PSAkc2NvcGUudXNlci5faWQpID8gdHJhZGUucDEgOiB0cmFkZS5wMjtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50VHJhZGVzID0gdHJhZGVzO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUuY3VycmVudFRyYWRlcyk7XHJcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICAgICRzY29wZS5zb3J0UmVzdWx0ID0gZnVuY3Rpb24oc29ydGJ5KSB7XHJcbiAgICAgICAgJHNjb3BlLnNvcnRieSA9IHNvcnRieTtcclxuICAgICAgICB2YXIgc29ydF9vcmRlciA9ICRzY29wZS5zb3J0X29yZGVyO1xyXG4gICAgICAgIGlmIChzb3J0YnkgPT0gXCJGb2xsb3dlcnNcIikge1xyXG4gICAgICAgICAgaWYgKHNvcnRfb3JkZXIgPT0gXCJhc2NlbmRpbmdcIikge1xyXG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudFRyYWRlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gYi5vdGhlci51c2VyLnNvdW5kY2xvdWQuZm9sbG93ZXJzIC0gYS5vdGhlci51c2VyLnNvdW5kY2xvdWQuZm9sbG93ZXJzO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAkc2NvcGUuc29ydF9vcmRlciA9IFwiZGVzY2VuZGluZ1wiO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJHNjb3BlLmN1cnJlbnRUcmFkZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGEub3RoZXIudXNlci5zb3VuZGNsb3VkLmZvbGxvd2VycyAtIGIub3RoZXIudXNlci5zb3VuZGNsb3VkLmZvbGxvd2VycztcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgJHNjb3BlLnNvcnRfb3JkZXIgPSBcImFzY2VuZGluZ1wiO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSBpZiAoc29ydGJ5ID09IFwiVW5maWxsZWQgU2xvdHNcIikge1xyXG4gICAgICAgICAgaWYgKHNvcnRfb3JkZXIgPT0gXCJhc2NlbmRpbmdcIikge1xyXG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudFRyYWRlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gYi51bmZpbGxlZFRyYWNrQ291bnQgLSBhLnVuZmlsbGVkVHJhY2tDb3VudDtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgJHNjb3BlLnNvcnRfb3JkZXIgPSBcImRlc2NlbmRpbmdcIjtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICRzY29wZS5jdXJyZW50VHJhZGVzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgICAgICAgIHJldHVybiBhLnVuZmlsbGVkVHJhY2tDb3VudCAtIGIudW5maWxsZWRUcmFja0NvdW50O1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAkc2NvcGUuc29ydF9vcmRlciA9IFwiYXNjZW5kaW5nXCI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmIChzb3J0X29yZGVyID09IFwiYXNjZW5kaW5nXCIpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmN1cnJlbnRUcmFkZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGEub3RoZXIuYWxlcnQudG9Mb3dlckNhc2UoKSA8IGIub3RoZXIuYWxlcnQudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICRzY29wZS5zb3J0X29yZGVyID0gXCJkZXNjZW5kaW5nXCI7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkc2NvcGUuY3VycmVudFRyYWRlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gYS5vdGhlci5hbGVydC50b0xvd2VyQ2FzZSgpID4gYi5vdGhlci5hbGVydC50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHNjb3BlLnNvcnRfb3JkZXIgPSBcImFzY2VuZGluZ1wiO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnNldFZpZXcgPSBmdW5jdGlvbih0eXBlKSB7XHJcbiAgICAgICAgJHNjb3BlLml0ZW1WaWV3ID0gdHlwZTtcclxuICAgICAgICAkc2NvcGUuc2hvd25UcmFkZXMgPSAkc2NvcGUuY3VycmVudFRyYWRlcy5maWx0ZXIoZnVuY3Rpb24odHJhZGUpIHtcclxuICAgICAgICAgIGlmICh0eXBlID09ICdpbmJveCcpIHJldHVybiB0cmFkZS5vdGhlci5hY2NlcHRlZDtcclxuICAgICAgICAgIGVsc2UgcmV0dXJuIHRyYWRlLnVzZXIuYWNjZXB0ZWQ7XHJcbiAgICAgICAgfSkuc29ydChmdW5jdGlvbih0cmFkZSkge1xyXG4gICAgICAgICAgaWYgKFsnY2hhbmdlJywgJ21lc3NhZ2UnXS5pbmNsdWRlcyh0cmFkZS51c2VyLmFsZXJ0KSkgcmV0dXJuIC0xO1xyXG4gICAgICAgICAgZWxzZSByZXR1cm4gMVxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5zZXRNYW5hZ2VWaWV3ID0gZnVuY3Rpb24odHlwZSkge1xyXG4gICAgICAgICRzY29wZS5tYW5hZ2VWaWV3ID0gdHlwZTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgICRzY29wZS5sb2FkTW9yZVVzZXJzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLmxvYWRpbmdNb3JlVXNlcnMgPSB0cnVlO1xyXG4gICAgICAgIHNlYXJjaFRyYWRlUmFuZ2Uuc2tpcCArPSAxMjtcclxuICAgICAgICBzZWFyY2hUcmFkZVJhbmdlLmxpbWl0ID0gMTI7XHJcbiAgICAgICAgJGh0dHAucG9zdCgnL2FwaS91c2Vycy9ieVNDVVJMLycsIHtcclxuICAgICAgICAgICAgdXJsOiAkc2NvcGUuc2VhcmNoVVJMLFxyXG4gICAgICAgICAgICBtaW5Gb2xsb3dlcjogJHNjb3BlLm1pblNlYXJjaFRyYWRlZm9sbG93ZXJzLFxyXG4gICAgICAgICAgICBtYXhGb2xsb3dlcjogJHNjb3BlLm1heFNlYXJjaFRyYWRlZm9sbG93ZXJzLFxyXG4gICAgICAgICAgICByZWNvcmRSYW5nZTogc2VhcmNoVHJhZGVSYW5nZVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAkc2NvcGUubG9hZGluZ01vcmVVc2VycyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICBpZiAocmVzLmRhdGEubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChyZXMuZGF0YSwgZnVuY3Rpb24oZCkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnNlYXJjaFVzZXIucHVzaChkKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgICAkc2NvcGUubG9hZGluZ01vcmVVc2VycyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkc2NvcGUuc3VjY2VzcyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkc2NvcGUuc2VhcmNoVXNlciA9IFtdO1xyXG4gICAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIlBsZWFzZSBlbnRlciBBcnRpc3QgdXJsLlwiKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9O1xyXG5cclxuICAgICAgJHNjb3BlLiRvbignbG9hZFRyYWRlcycsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5jbHVkZXMoJ3JlRm9yUmVMaXN0cycpICYmICF3aW5kb3cubG9jYXRpb24uaHJlZi5pbmNsdWRlcygnI29yZ2FuaXplc2NoZWR1bGUnKSAmJiAhd2luZG93LmxvY2F0aW9uLmhyZWYuaW5jbHVkZXMoJyNtYW5hZ2V0cmFkZXMnKSkgJHNjb3BlLmxvYWRNb3JlVXNlcnMoKTtcclxuICAgICAgfSk7XHJcblxyXG4gICAgICAkc2NvcGUub3BlblRyYWRlID0gZnVuY3Rpb24odXNlcikge1xyXG4gICAgICAgIHZhciBmb3VuZCA9ICRzY29wZS5jdXJyZW50VHJhZGVzLmZpbmQoZnVuY3Rpb24odHJhZGUpIHtcclxuICAgICAgICAgIHJldHVybiAodHJhZGUub3RoZXIudXNlci5faWQgPT0gdXNlci5faWQpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGlmIChmb3VuZCkge1xyXG4gICAgICAgICAgJHNjb3BlLmdvVG9UcmFkZShmb3VuZCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHZhciB0cmFkZSA9IHtcclxuICAgICAgICAgICAgbWVzc2FnZXM6IFt7XHJcbiAgICAgICAgICAgICAgZGF0ZTogbmV3IERhdGUoKSxcclxuICAgICAgICAgICAgICBzZW5kZXJJZDogU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpLl9pZCxcclxuICAgICAgICAgICAgICB0ZXh0OiBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkuc291bmRjbG91ZC51c2VybmFtZSArICcgb3BlbmVkIGEgdHJhZGUuJyxcclxuICAgICAgICAgICAgICB0eXBlOiAnYWxlcnQnXHJcbiAgICAgICAgICAgIH1dLFxyXG4gICAgICAgICAgICByZXBlYXRGb3I6IDAsXHJcbiAgICAgICAgICAgIHAxOiB7XHJcbiAgICAgICAgICAgICAgdXNlcjogU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpLl9pZCxcclxuICAgICAgICAgICAgICBhbGVydDogXCJub25lXCIsXHJcbiAgICAgICAgICAgICAgc2xvdHM6IFtdLFxyXG4gICAgICAgICAgICAgIGFjY2VwdGVkOiB0cnVlXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHAyOiB7XHJcbiAgICAgICAgICAgICAgdXNlcjogdXNlci5faWQsXHJcbiAgICAgICAgICAgICAgYWxlcnQ6IFwiY2hhbmdlXCIsXHJcbiAgICAgICAgICAgICAgc2xvdHM6IFtdLFxyXG4gICAgICAgICAgICAgIGFjY2VwdGVkOiBmYWxzZVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgICAkaHR0cC5wb3N0KCcvYXBpL3RyYWRlcy9uZXcnLCB0cmFkZSlcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMuZGF0YSk7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLmdvVG9UcmFkZShyZXMuZGF0YSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJFcnJvciBpbiBjcmVhdGluZyB0cmFkZVwiKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuZ29Ub1RyYWRlID0gZnVuY3Rpb24odHJhZGUpIHtcclxuICAgICAgICBpZiAoJHNjb3BlLmlzdGhpcmRwYXJ0eSkge1xyXG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL3RoaXJkcGFydHkvdHJhZGUvJyArIHRyYWRlLnAxLnVzZXIuc291bmRjbG91ZC5wc2V1ZG9uYW1lICsgJy8nICsgdHJhZGUucDIudXNlci5zb3VuZGNsb3VkLnBzZXVkb25hbWU7XHJcbiAgICAgICAgfSBlbHNlIGlmICgkc2NvcGUuaXNBZG1pblJvdXRlKSB7XHJcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4vdHJhZGUvJyArIHRyYWRlLnAxLnVzZXIuc291bmRjbG91ZC5wc2V1ZG9uYW1lICsgJy8nICsgdHJhZGUucDIudXNlci5zb3VuZGNsb3VkLnBzZXVkb25hbWU7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hcnRpc3RUb29scy90cmFkZS8nICsgdHJhZGUucDEudXNlci5zb3VuZGNsb3VkLnBzZXVkb25hbWUgKyAnLycgKyB0cmFkZS5wMi51c2VyLnNvdW5kY2xvdWQucHNldWRvbmFtZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5tYW5hZ2UgPSBmdW5jdGlvbih0cmFkZSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHRyYWRlKTtcclxuICAgICAgICAkc2NvcGUuZ29Ub1RyYWRlKHRyYWRlKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnJlbWluZFRyYWRlID0gZnVuY3Rpb24odHJhZGUsIGluZGV4KSB7XHJcbiAgICAgICAgJCgnI3BvcCcpLm1vZGFsKCdzaG93Jyk7XHJcbiAgICAgICAgJHNjb3BlLnRoZVRyYWRlID0gdHJhZGU7XHJcbiAgICAgICAgJHNjb3BlLnRyYWRlSUQgPSB0cmFkZS5faWQ7XHJcbiAgICAgICAgaWYgKCEkc2NvcGUuJCRwaGFzZSkgJHNjb3BlLiRhcHBseSgpXHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmICh3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJzaG93UG9wdXBcIikpIHtcclxuICAgICAgICB2YXIgdHJhZGUgPSBKU09OLnBhcnNlKHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbShcInNob3dQb3B1cFwiKSk7XHJcbiAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKFwic2hvd1BvcHVwXCIpO1xyXG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAkc2NvcGUucmVtaW5kVHJhZGUodHJhZGUsIDApO1xyXG4gICAgICAgIH0sIDUwMClcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnNlbmRNYWlsID0gZnVuY3Rpb24oc2hhcmVsaW5rKSB7XHJcbiAgICAgICAgJHNjb3BlLmZiTWVzc2FnZUxpbmsgPSBzaGFyZWxpbms7XHJcbiAgICAgICAgJHdpbmRvdy5vcGVuKFwibWFpbHRvOmV4YW1wbGVAZGVtby5jb20/Ym9keT1cIiArIHNoYXJlbGluaywgXCJfc2VsZlwiKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgICRzY29wZS5kZWxldGVUcmFkZSA9IGZ1bmN0aW9uKHRyYWRlSUQsIGluZGV4KSB7XHJcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coJ0FyZSB5b3Ugc3VyZSB5b3Ugd2FudCB0byBkZWxldGUgdGhpcyB0cmFkZT8nLCB7XHJcbiAgICAgICAgICAndHlwZSc6ICdjb25maXJtYXRpb24nLFxyXG4gICAgICAgICAgJ2J1dHRvbnMnOiBbe1xyXG4gICAgICAgICAgICBjYXB0aW9uOiAnTm8nLFxyXG4gICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgY29uc29sZS5sb2coJ05vIHdhcyBjbGlja2VkJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgY2FwdGlvbjogJ1llcycsXHJcbiAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgICAgICAgJGh0dHAucG9zdCgnL2FwaS90cmFkZXMvZGVsZXRlJywge1xyXG4gICAgICAgICAgICAgICAgICBpZDogdHJhZGVJRFxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvd25UcmFkZXMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coJ0Vycm9yIGFjY2VwdGluZycpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfV1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmNoZWNrTm90aWZpY2F0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLiRwYXJlbnQuc2hvd25vdGlmaWNhdGlvbiA9IGZhbHNlXHJcbiAgICAgICAgJHNjb3BlLmN1cnJlbnRUcmFkZXMuZm9yRWFjaChmdW5jdGlvbih0cmFkZSkge1xyXG4gICAgICAgICAgaWYgKHRyYWRlLm90aGVyLmFjY2VwdGVkKSB7XHJcbiAgICAgICAgICAgICRzY29wZS4kcGFyZW50LnNob3dub3RpZmljYXRpb24gPSB0cnVlO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuaGlkZU5vdGlmaWNhdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRodHRwLnB1dCgnL2FwaS90cmFkZXMvaGlkZU5vdGlmaWNhdGlvbicsICRzY29wZS5zaG93blRyYWRlcylcclxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge30pXHJcbiAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmNoZWNrTm90aWZpY2F0aW9uKCk7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICB9XHJcblxyXG5cclxuICAgICAgJHNjb3BlLnNldEN1cnJlbnRUYWIgPSBmdW5jdGlvbihjdXJyZW50VGFiKSB7XHJcbiAgICAgICAgJHNjb3BlLmN1cnJlbnRUYWIgPSBjdXJyZW50VGFiO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUudmVyaWZ5QnJvd3NlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChuYXZpZ2F0b3IudXNlckFnZW50LnNlYXJjaChcIkNocm9tZVwiKSA9PSAtMSAmJiBuYXZpZ2F0b3IudXNlckFnZW50LnNlYXJjaChcIlNhZmFyaVwiKSAhPSAtMSkge1xyXG4gICAgICAgICAgdmFyIHBvc2l0aW9uID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5zZWFyY2goXCJWZXJzaW9uXCIpICsgODtcclxuICAgICAgICAgIHZhciBlbmQgPSBuYXZpZ2F0b3IudXNlckFnZW50LnNlYXJjaChcIiBTYWZhcmlcIik7XHJcbiAgICAgICAgICB2YXIgdmVyc2lvbiA9IG5hdmlnYXRvci51c2VyQWdlbnQuc3Vic3RyaW5nKHBvc2l0aW9uLCBlbmQpO1xyXG4gICAgICAgICAgaWYgKHBhcnNlSW50KHZlcnNpb24pIDwgOSkge1xyXG4gICAgICAgICAgICAkLlplYnJhX0RpYWxvZygnWW91IGhhdmUgb2xkIHZlcnNpb24gb2Ygc2FmYXJpLiBDbGljayA8YSBocmVmPVwiaHR0cHM6Ly9zdXBwb3J0LmFwcGxlLmNvbS9kb3dubG9hZHMvc2FmYXJpXCI+aGVyZTwvYT4gdG8gZG93bmxvYWQgdGhlIGxhdGVzdCB2ZXJzaW9uIG9mIHNhZmFyaSBmb3IgYmV0dGVyIHNpdGUgZXhwZXJpZW5jZS4nLCB7XHJcbiAgICAgICAgICAgICAgJ3R5cGUnOiAnY29uZmlybWF0aW9uJyxcclxuICAgICAgICAgICAgICAnYnV0dG9ucyc6IFt7XHJcbiAgICAgICAgICAgICAgICBjYXB0aW9uOiAnT0snXHJcbiAgICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgICAgJ29uQ2xvc2UnOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiaHR0cHM6Ly9zdXBwb3J0LmFwcGxlLmNvbS9kb3dubG9hZHMvc2FmYXJpXCI7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5kYXlJbmNyID0gNztcclxuICAgICAgJHNjb3BlLmluY3JEYXkgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoJHNjb3BlLmRheUluY3IgPCAyMSkgJHNjb3BlLmRheUluY3IrKztcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmRlY3JEYXkgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoJHNjb3BlLmRheUluY3IgPiAwKSAkc2NvcGUuZGF5SW5jci0tO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuZGF5T2ZXZWVrQXNTdHJpbmcgPSBmdW5jdGlvbihkYXRlKSB7XHJcbiAgICAgICAgdmFyIGRheUluZGV4ID0gZGF0ZS5nZXREYXkoKTtcclxuICAgICAgICBpZiAoc2NyZWVuLndpZHRoID4gJzc0NCcpIHtcclxuICAgICAgICAgIHJldHVybiBbXCJTdW5kYXlcIiwgXCJNb25kYXlcIiwgXCJUdWVzZGF5XCIsIFwiV2VkbmVzZGF5XCIsIFwiVGh1cnNkYXlcIiwgXCJGcmlkYXlcIiwgXCJTYXR1cmRheVwiXVtkYXlJbmRleF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBbXCJTdW5cIiwgXCJNb25cIiwgXCJUdWVcIiwgXCJXZWRcIiwgXCJUaHVcIiwgXCJGcmlcIiwgXCJTYXRcIl1bZGF5SW5kZXhdO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuZ2V0U3R5bGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgJ2JvcmRlci1yYWRpdXMnOiAnNHB4JyxcclxuICAgICAgICAgICdib3JkZXItd2lkdGgnOiAnMXB4J1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5nZXRFdmVudFN0eWxlID0gZnVuY3Rpb24ocmVwb3N0RXZlbnQpIHtcclxuICAgICAgICBpZiAocmVwb3N0RXZlbnQudHlwZSA9PSAnZW1wdHknKSB7XHJcbiAgICAgICAgICByZXR1cm4ge31cclxuICAgICAgICB9IGVsc2UgaWYgKHJlcG9zdEV2ZW50LnR5cGUgPT0gJ3RyYWRlZCcgJiYgcmVwb3N0RXZlbnQudHJhY2tJbmZvLnRyYWNrSUQpIHtcclxuICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNCMjIyMjInLFxyXG4gICAgICAgICAgICAnaGVpZ2h0JzogJzIwcHgnLFxyXG4gICAgICAgICAgICAvLyAnbWFyZ2luJzogJzJweCcsXHJcbiAgICAgICAgICAgICdib3JkZXItcmFkaXVzJzogJzRweCdcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2UgaWYgKHJlcG9zdEV2ZW50LnR5cGUgPT0gJ3RyYWRlZCcgJiYgIXJlcG9zdEV2ZW50LnRyYWNrSW5mby50cmFja0lEKSB7XHJcbiAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6ICcjMmI5ZmRhJyxcclxuICAgICAgICAgICAgJ2hlaWdodCc6ICcyMHB4JyxcclxuICAgICAgICAgICAgLy8gJ21hcmdpbic6ICcycHgnLFxyXG4gICAgICAgICAgICAnYm9yZGVyLXJhZGl1cyc6ICc0cHgnXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmIChyZXBvc3RFdmVudC50eXBlID09ICdtdWx0aXBsZScpIHtcclxuICAgICAgICAgIHZhciB1bmZpbGxlZCA9IGZhbHNlO1xyXG4gICAgICAgICAgcmVwb3N0RXZlbnQuZXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgaWYgKCFldmVudC50cmFja0luZm8udHJhY2tJRCkgdW5maWxsZWQgPSB0cnVlO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIGlmICh1bmZpbGxlZCkge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICdiYWNrZ3JvdW5kLWNvbG9yJzogJyM3QTU0OUInLFxyXG4gICAgICAgICAgICAgICdoZWlnaHQnOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgJ2JvcmRlci1yYWRpdXMnOiAnNHB4J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNCMjIyMjInLFxyXG4gICAgICAgICAgICAgICdoZWlnaHQnOiAnMjBweCcsXHJcbiAgICAgICAgICAgICAgJ2JvcmRlci1yYWRpdXMnOiAnNHB4J1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuZ2V0RXZlbnRUZXh0ID0gZnVuY3Rpb24ocmVwb3N0RXZlbnQpIHtcclxuICAgICAgICBpZiAocmVwb3N0RXZlbnQudHlwZSA9PSAndHJhZGVkJykgcmV0dXJuIHJlcG9zdEV2ZW50LnVzZXJJbmZvLnVzZXJuYW1lXHJcbiAgICAgICAgZWxzZSBpZiAocmVwb3N0RXZlbnQudHlwZSA9PSAnbXVsdGlwbGUnKSByZXR1cm4gJ011bHRpcGxlIFNsb3RzJ1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuZmlsbERhdGVBcnJheXMgPSBmdW5jdGlvbihyZXBvc3RFdmVudCkge1xyXG4gICAgICAgIHZhciBjYWxlbmRhciA9IFtdO1xyXG4gICAgICAgIHZhciB0b2RheSA9IG5ldyBEYXRlKCk7XHJcbiAgICAgICAgdG9kYXkuc2V0RGF0ZSh0b2RheS5nZXREYXRlKCkgLSA3KTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI5OyBpKyspIHtcclxuICAgICAgICAgIHZhciBjYWxEYXkgPSB7fTtcclxuICAgICAgICAgIGNhbERheS5kYXkgPSBuZXcgRGF0ZSh0b2RheSk7XHJcbiAgICAgICAgICBjYWxEYXkuZGF5LnNldERhdGUodG9kYXkuZ2V0RGF0ZSgpICsgaSk7XHJcbiAgICAgICAgICB2YXIgZGF5RXZlbnRzID0gcmVwb3N0RXZlbnQuZmlsdGVyKGZ1bmN0aW9uKGV2KSB7XHJcbiAgICAgICAgICAgIHJldHVybiAobmV3IERhdGUoZXYudHJhY2tJbmZvLmRheSkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gY2FsRGF5LmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHZhciBldmVudEFycmF5ID0gW107XHJcbiAgICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IDI0OyBqKyspIHtcclxuICAgICAgICAgICAgZXZlbnRBcnJheVtqXSA9IHtcclxuICAgICAgICAgICAgICB0eXBlOiBcImVtcHR5XCJcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGRheUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2KSB7XHJcbiAgICAgICAgICAgIGlmIChldmVudEFycmF5W25ldyBEYXRlKGV2LnRyYWNrSW5mby5kYXkpLmdldEhvdXJzKCldLnR5cGUgPT0gJ2VtcHR5Jykge1xyXG4gICAgICAgICAgICAgIGV2LnR5cGUgPSAndHJhZGVkJztcclxuICAgICAgICAgICAgICBldmVudEFycmF5W25ldyBEYXRlKGV2LnRyYWNrSW5mby5kYXkpLmdldEhvdXJzKCldID0gZXY7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZXZlbnRBcnJheVtuZXcgRGF0ZShldi50cmFja0luZm8uZGF5KS5nZXRIb3VycygpXS50eXBlID09ICd0cmFkZWQnKSB7XHJcbiAgICAgICAgICAgICAgdmFyIGV2ZW50ID0ge1xyXG4gICAgICAgICAgICAgICAgdHlwZTogJ211bHRpcGxlJyxcclxuICAgICAgICAgICAgICAgIGV2ZW50czogW11cclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgZXZlbnQuZXZlbnRzLnB1c2goZXZlbnRBcnJheVtuZXcgRGF0ZShldi50cmFja0luZm8uZGF5KS5nZXRIb3VycygpXSlcclxuICAgICAgICAgICAgICBldmVudC5ldmVudHMucHVzaChldik7XHJcbiAgICAgICAgICAgICAgZXZlbnRBcnJheVtuZXcgRGF0ZShldi50cmFja0luZm8uZGF5KS5nZXRIb3VycygpXSA9IGV2ZW50O1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50QXJyYXlbbmV3IERhdGUoZXYudHJhY2tJbmZvLmRheSkuZ2V0SG91cnMoKV0udHlwZSA9PSAnbXVsdGlwbGUnKSB7XHJcbiAgICAgICAgICAgICAgZXZlbnRBcnJheVtuZXcgRGF0ZShldi50cmFja0luZm8uZGF5KS5nZXRIb3VycygpXS5ldmVudHMucHVzaChldik7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgY2FsRGF5LmV2ZW50cyA9IGV2ZW50QXJyYXk7XHJcbiAgICAgICAgICBjYWxlbmRhci5wdXNoKGNhbERheSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjYWxlbmRhcjtcclxuICAgICAgfTtcclxuXHJcbiAgICAgICRzY29wZS5jYWxlbmRhciA9ICRzY29wZS5maWxsRGF0ZUFycmF5cygkc2NvcGUuZXZlbnRzKTtcclxuICAgICAgJHNjb3BlLmlzVmlldyA9IGZhbHNlO1xyXG4gICAgICAkc2NvcGUuY2xpY2tlZFNsb3QgPSBmdW5jdGlvbihkYXksIGhvdXIsIGRhdGEpIHtcclxuICAgICAgICBpZiAoZGF0YS50eXBlID09ICdtdWx0aXBsZScpIHtcclxuICAgICAgICAgIHZhciBidXR0b25zID0gW107XHJcbiAgICAgICAgICBkYXRhLmV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2KSB7XHJcbiAgICAgICAgICAgIHZhciBidXR0b24gPSB7XHJcbiAgICAgICAgICAgICAgY2FwdGlvbjogZXYudXNlckluZm8udXNlcm5hbWUsXHJcbiAgICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLm9wZW5Qb3B1cChkYXksIGhvdXIsIGV2KTtcclxuICAgICAgICAgICAgICAgIGlmICghJHNjb3BlLiQkcGhhc2UpICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgYnV0dG9ucy5wdXNoKGJ1dHRvbik7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coJ1doaWNoIHNsb3QgZG8geW91IHdhbnQgdG8gZWRpdD8nLCB7XHJcbiAgICAgICAgICAgICd0eXBlJzogJ3F1ZXN0aW9uJyxcclxuICAgICAgICAgICAgJ2J1dHRvbnMnOiBidXR0b25zXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgJHNjb3BlLm9wZW5Qb3B1cChkYXksIGhvdXIsIGRhdGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLm9wZW5Qb3B1cCA9IGZ1bmN0aW9uKGRheSwgaG91ciwgZGF0YSkge1xyXG4gICAgICAgICRzY29wZS5hZmNvdW50ID0gMDtcclxuICAgICAgICAkc2NvcGUuZGVsZXRlRXZlbnREYXRhID0gZGF0YTtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQb3B1cFBsYXllcicpLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BvcHVwUGxheWVyJykuaW5uZXJIVE1MID0gXCJcIjtcclxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50ID0ge307XHJcbiAgICAgICAgdmFyIG1ha2VEYXkgPSBuZXcgRGF0ZShkYXkpO1xyXG4gICAgICAgIG1ha2VEYXkuc2V0SG91cnMoaG91cik7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZGF0YS50cmFja0luZm8pKTtcclxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50Ll9pZCA9IGRhdGEudHJhY2tJbmZvLl9pZDtcclxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LmRheSA9IG5ldyBEYXRlKGRhdGEudHJhY2tJbmZvLmRheSk7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC51cmwgPSBkYXRhLnRyYWNrSW5mby50cmFja1VSTDtcclxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LmNvbW1lbnQgPSBkYXRhLnRyYWNrSW5mby5jb21tZW50O1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQudGltZUdhcCA9IGRhdGEudHJhY2tJbmZvLnRpbWVHYXA7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC5hcnRpc3QgPSBkYXRhLnVzZXJJbmZvO1xyXG4gICAgICAgIHZhciByZXBvc3REYXRlID0gbmV3IERhdGUoZGF0YS50cmFja0luZm8uZGF5KTtcclxuICAgICAgICB2YXIgdW5yZXBvc3REYXRlID0gbmV3IERhdGUoZGF0YS50cmFja0luZm8udW5yZXBvc3REYXRlKTtcclxuICAgICAgICB2YXIgZGlmZiA9IE1hdGguYWJzKG5ldyBEYXRlKHVucmVwb3N0RGF0ZSkuZ2V0VGltZSgpIC0gbmV3IERhdGUocmVwb3N0RGF0ZSkuZ2V0VGltZSgpKSAvIDM2MDAwMDA7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC51bnJlcG9zdEhvdXJzID0gZGlmZjtcclxuICAgICAgICB2YXIgZCA9IG5ldyBEYXRlKGRheSkuZ2V0RGF5KCk7XHJcbiAgICAgICAgdmFyIGNoYW5uZWxzID0gZGF0YS50cmFja0luZm8ub3RoZXJDaGFubmVscztcclxuICAgICAgICAkc2NvcGUuZGlzcGxheUNoYW5uZWxzID0gW107XHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkc2NvcGUuZXZlbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBpZiAoY2hhbm5lbHMuaW5kZXhPZigkc2NvcGUuZXZlbnRzW2ldLnVzZXJJbmZvLmlkKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5kaXNwbGF5Q2hhbm5lbHMucHVzaCgkc2NvcGUuZXZlbnRzW2ldLnVzZXJJbmZvLnVzZXJuYW1lKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgJHNjb3BlLnNob3dPdmVybGF5ID0gdHJ1ZTtcclxuICAgICAgICB2YXIgY2FsRGF5ID0ge307XHJcbiAgICAgICAgdmFyIGNhbGVuZGFyRGF5ID0gJHNjb3BlLmNhbGVuZGFyLmZpbmQoZnVuY3Rpb24oY2FsRCkge1xyXG4gICAgICAgICAgcmV0dXJuIGNhbEQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09IGRheS50b0xvY2FsZURhdGVTdHJpbmcoKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBpZiAoZGF0YS50cmFja0luZm8udHJhY2tVUkwpIHtcclxuICAgICAgICAgICRzY29wZS5pc1ZpZXcgPSB0cnVlO1xyXG4gICAgICAgICAgU0MuV2lkZ2V0KCdzY1BvcHVwUGxheWVyJykubG9hZCgkc2NvcGUubWFrZUV2ZW50LnVybCwge1xyXG4gICAgICAgICAgICBhdXRvX3BsYXk6IGZhbHNlLFxyXG4gICAgICAgICAgICBzaG93X2FydHdvcms6IGZhbHNlXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BvcHVwUGxheWVyJykuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xyXG4gICAgICAgICAgJHNjb3BlLnNob3dQbGF5ZXIgPSB0cnVlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAkc2NvcGUuaXNWaWV3ID0gZmFsc2U7XHJcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQb3B1cFBsYXllcicpLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xyXG4gICAgICAgICAgJHNjb3BlLnNob3dQbGF5ZXIgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5jbG9zZU1vZGFsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5kZWxldGVFdmVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBldmVudElkID0gJHNjb3BlLmRlbGV0ZUV2ZW50RGF0YS50cmFja0luZm8uX2lkO1xyXG4gICAgICAgICQuWmVicmFfRGlhbG9nKCdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZGVsZXRlIHRoaXMgdHJhZGU/Jywge1xyXG4gICAgICAgICAgJ3R5cGUnOiAncXVlc3Rpb24nLFxyXG4gICAgICAgICAgJ2J1dHRvbnMnOiBbe1xyXG4gICAgICAgICAgICBjYXB0aW9uOiAnQ2FuY2VsJyxcclxuICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKCkge31cclxuICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgY2FwdGlvbjogJ1llcycsXHJcbiAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAkaHR0cC5kZWxldGUoJy9hcGkvZXZlbnRzL3JlcG9zdEV2ZW50cy8nICsgZXZlbnRJZClcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvd092ZXJsYXkgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgJHN0YXRlLnJlbG9hZCgpO1xyXG4gICAgICAgICAgICAgICAgICAkc2NvcGUuYWN0aXZlVGFiID0gXCIzXCI7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKFwiRVJST1I6IERpZCBub3QgZGVsZXRlLlwiKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1dXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5zYXZlRXZlbnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgdmFyIHJlcSA9ICRodHRwLnB1dCgnL2FwaS9ldmVudHMvcmVwb3N0RXZlbnRzJywgJHNjb3BlLm1ha2VFdmVudClcclxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAkc2NvcGUubWFrZUV2ZW50VVJMID0gXCJcIjtcclxuICAgICAgICAgICAgJHNjb3BlLm1ha2VFdmVudCA9IG51bGw7XHJcbiAgICAgICAgICAgICRzY29wZS5ldmVudENvbW1lbnQgPSBcIlwiO1xyXG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcclxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUG9wdXBQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcclxuICAgICAgICAgICAgJHNjb3BlLnVucmVwb3N0SG91cnMgPSAxO1xyXG4gICAgICAgICAgICAkc2NvcGUudGFiU2VsZWN0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgICAkc2NvcGUudHJhY2tUeXBlID0gXCJcIjtcclxuICAgICAgICAgICAgJHNjb3BlLnRyYWNrQXJ0aXN0SUQgPSAwO1xyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLm1hbmFnZVZpZXcgPT0gXCJuZXdzb25nXCIpIHtcclxuICAgICAgICAgICAgICAkc2NvcGUubWFuYWdlVmlldyA9IFwibGlzdFwiO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICRodHRwLmdldChcIi9hcGkvZXZlbnRzL2dldFJlcG9zdEV2ZW50cy9cIiArICRzY29wZS51c2VyLl9pZClcclxuICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuY2FsZW5kYXIgPSAkc2NvcGUuZmlsbERhdGVBcnJheXMocmVzLmRhdGEpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmxpc3RldmVudHMgPSByZXMuZGF0YTtcclxuICAgICAgICAgICAgICB9KS50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKGVyci5kYXRhKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKGVyci5kYXRhKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuY2hvc2VBcnRpc3QgPSBmdW5jdGlvbih1c2VyKSB7XHJcbiAgICAgICAgJHNjb3BlLnNlYXJjaFVSTCA9IHVzZXIucGVybWFsaW5rX3VybDtcclxuICAgICAgICAkc2NvcGUuc2VuZFNlYXJjaCgpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuY2hvc2VUcmFjazEgPSBmdW5jdGlvbih0cmFjaykge1xyXG4gICAgICAgICRzY29wZS5zaG93UGxheWVyID0gdHJ1ZTtcclxuICAgICAgICAkc2NvcGUuZmlsbE1ha2VFdmVudCh0cmFjayk7XHJcbiAgICAgICAgdmFyIHBvcHVwUGxheWVyV2lkZ2V0ID0gU0MuV2lkZ2V0KCdzY1BvcHVwUGxheWVyJyk7XHJcbiAgICAgICAgcG9wdXBQbGF5ZXJXaWRnZXQubG9hZCh0cmFjay5wZXJtYWxpbmtfdXJsLCB7XHJcbiAgICAgICAgICBhdXRvX3BsYXk6IGZhbHNlLFxyXG4gICAgICAgICAgc2hvd19hcnR3b3JrOiBmYWxzZSxcclxuICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLnNob3dQbGF5ZXIpO1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUubWFrZUV2ZW50KTtcclxuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUG9wdXBQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BvcHVwUGxheWVyJykpO1xyXG4gICAgICAgICAgICBpZiAoISRzY29wZS4kJHBoYXNlKSAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5maWxsTWFrZUV2ZW50ID0gZnVuY3Rpb24odHJhY2spIHtcclxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQgPSB0cmFjay5pZDtcclxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnRpdGxlID0gdHJhY2sudGl0bGU7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC50cmFja1VSTCA9IHRyYWNrLnBlcm1hbGlua191cmw7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC50cmFja0FydFVybCA9IHRyYWNrLmFydHdvcmtfdXJsO1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQudHJhY2tBcnRVcmwgPSB0cmFjay5hcnR3b3JrX3VybDtcclxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LmFydGlzdE5hbWUgPSB0cmFjay51c2VyLnVzZXJuYW1lO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuY2hvc2VUcmFjayA9IGZ1bmN0aW9uKHRyYWNrKSB7XHJcbiAgICAgICAgJHNjb3BlLnNob3dQbGF5ZXIgPSB0cnVlO1xyXG4gICAgICAgICRzY29wZS5maWxsTWFrZUV2ZW50KHRyYWNrKTtcclxuICAgICAgICB2YXIgcGxheWVyV2lkZ2V0ID0gU0MuV2lkZ2V0KCdzY1BsYXllcicpO1xyXG4gICAgICAgIHBsYXllcldpZGdldC5sb2FkKHRyYWNrLnBlcm1hbGlua191cmwsIHtcclxuICAgICAgICAgIGF1dG9fcGxheTogZmFsc2UsXHJcbiAgICAgICAgICBzaG93X2FydHdvcms6IHRydWUsXHJcbiAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcclxuICAgICAgICAgICAgaWYgKCEkc2NvcGUuJCRwaGFzZSkgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuc2F2ZVVzZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgJGh0dHAucHV0KFwiL2FwaS9kYXRhYmFzZS9wcm9maWxlXCIsICRzY29wZS51c2VyKVxyXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZShyZXMuZGF0YSk7XHJcbiAgICAgICAgICAgICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkVycm9yOiBkaWQgbm90IHNhdmVcIik7XHJcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgICAkc2NvcGUuc2NoZWR1bGVSZXBvc3RFdmVudCA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICBpZiAoZGF0YS50cmFja0luZm8pIHtcclxuICAgICAgICAgICRzY29wZS5kZWxldGVFdmVudERhdGEgPSBkYXRhO1xyXG4gICAgICAgICAgJHNjb3BlLm1hbmFnZVZpZXcgPSBcIm5ld3NvbmdcIjtcclxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xyXG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUGxheWVyJykuaW5uZXJIVE1MID0gXCJcIjtcclxuICAgICAgICAgIHZhciBkYXkgPSBuZXcgRGF0ZShkYXRhLnRyYWNrSW5mby5kYXkpO1xyXG4gICAgICAgICAgJHNjb3BlLm1ha2VFdmVudCA9IHt9O1xyXG4gICAgICAgICAgJHNjb3BlLm1ha2VFdmVudC5faWQgPSBkYXRhLnRyYWNrSW5mby5faWQ7XHJcbiAgICAgICAgICAkc2NvcGUubWFrZUV2ZW50LmRheSA9IG5ldyBEYXRlKGRhdGEudHJhY2tJbmZvLmRheSk7XHJcbiAgICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnVybCA9IGRhdGEudHJhY2tJbmZvLnRyYWNrVVJMO1xyXG4gICAgICAgICAgJHNjb3BlLm1ha2VFdmVudC5jb21tZW50ID0gZGF0YS50cmFja0luZm8uY29tbWVudDtcclxuICAgICAgICAgICRzY29wZS5tYWtlRXZlbnQudGltZUdhcCA9IGRhdGEudHJhY2tJbmZvLnRpbWVHYXA7XHJcbiAgICAgICAgICAkc2NvcGUubWFrZUV2ZW50LmFydGlzdCA9IGRhdGEudXNlckluZm87XHJcbiAgICAgICAgICB2YXIgcmVwb3N0RGF0ZSA9IG5ldyBEYXRlKGRhdGEudHJhY2tJbmZvLmRheSk7XHJcbiAgICAgICAgICB2YXIgdW5yZXBvc3REYXRlID0gbmV3IERhdGUoZGF0YS50cmFja0luZm8udW5yZXBvc3REYXRlKTtcclxuICAgICAgICAgIHZhciBkaWZmID0gTWF0aC5hYnMobmV3IERhdGUodW5yZXBvc3REYXRlKS5nZXRUaW1lKCkgLSBuZXcgRGF0ZShyZXBvc3REYXRlKS5nZXRUaW1lKCkpIC8gMzYwMDAwMDtcclxuICAgICAgICAgICRzY29wZS5tYWtlRXZlbnQudW5yZXBvc3RIb3VycyA9IGRpZmY7XHJcbiAgICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnVucmVwb3N0RGF0ZSA9IHVucmVwb3N0RGF0ZTtcclxuICAgICAgICAgIHZhciBkID0gbmV3IERhdGUoZGF5KS5nZXREYXkoKTtcclxuICAgICAgICAgIHZhciBjaGFubmVscyA9IGRhdGEudHJhY2tJbmZvLm90aGVyQ2hhbm5lbHM7XHJcbiAgICAgICAgICAkc2NvcGUuZGlzcGxheUNoYW5uZWxzID0gW107XHJcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8ICRzY29wZS5ldmVudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgICAgaWYgKGNoYW5uZWxzLmluZGV4T2YoJHNjb3BlLmV2ZW50c1tpXS51c2VySW5mby5pZCkgPiAtMSkge1xyXG4gICAgICAgICAgICAgICRzY29wZS5kaXNwbGF5Q2hhbm5lbHMucHVzaCgkc2NvcGUuZXZlbnRzW2ldLnVzZXJJbmZvLnVzZXJuYW1lKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdmFyIGNhbERheSA9IHt9O1xyXG4gICAgICAgICAgdmFyIGNhbGVuZGFyRGF5ID0gJHNjb3BlLmNhbGVuZGFyLmZpbmQoZnVuY3Rpb24oY2FsRCkge1xyXG4gICAgICAgICAgICByZXR1cm4gY2FsRC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICAkc2NvcGUuc2hvd1BsYXllciA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmFkZE5ld1NvbmdDYW5jZWwgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUubWFuYWdlVmlldyA9IFwibGlzdFwiO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuYWxsb3dTYXZlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKCEkc2NvcGUubWFrZUV2ZW50KSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKCRzY29wZS5tYWtlRXZlbnQuZGF5KSA+IG5ldyBEYXRlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5hdXRvZmlsbEFsbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQuWmVicmFfRGlhbG9nKCdBcmUgeW91IHN1cmUgeW91IHdhbnQgdG8gZmlsbCBhbGwgeW91ciBzbG90cyB3aXRoIHlvdXIgYXV0b2ZpbGwgdHJhY2tzPycsIHtcclxuICAgICAgICAgICd0eXBlJzogJ3F1ZXN0aW9uJyxcclxuICAgICAgICAgICdidXR0b25zJzogW3tcclxuICAgICAgICAgICAgY2FwdGlvbjogJ0NhbmNlbCcsXHJcbiAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbigpIHt9XHJcbiAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIGNhcHRpb246ICdZZXMnLFxyXG4gICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICRodHRwLnB1dChcIi9hcGkvZXZlbnRzL3JlcG9zdEV2ZW50cy9hdXRvZmlsbEFsbFwiKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZXZlbnRzL2dldFJlcG9zdEV2ZW50cy8nICsgJHNjb3BlLnVzZXIuX2lkKVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhyZXMuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICRzY29wZS5jYWxlbmRhciA9ICRzY29wZS5maWxsRGF0ZUFycmF5cyhyZXMuZGF0YSk7XHJcbiAgICAgICAgICAgICAgICAgICRzY29wZS5saXN0ZXZlbnRzID0gcmVzLmRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICB9KS50aGVuKG51bGwsIGNvbnNvbGUubG9nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfV1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLm9mZmVyID0gZnVuY3Rpb24odHJhZGUpIHtcclxuICAgICAgICBpZiAoJHNjb3BlLml0ZW1WaWV3ID09ICdzZW50Jykge1xyXG4gICAgICAgICAgcmV0dXJuIFwiWW91IGFyZSBvZmZlcmluZyBcIiArIHRyYWRlLnVzZXIuc2xvdHMubGVuZ3RoICogKHRyYWRlLnJlcGVhdEZvciA+IDAgPyB0cmFkZS5yZXBlYXRGb3IgOiAxKSArIFwiIHNsb3RzIChcIiArICh0cmFkZS51c2VyLnNsb3RzLmxlbmd0aCAqIHRyYWRlLnVzZXIudXNlci5zb3VuZGNsb3VkLmZvbGxvd2VycyAqICh0cmFkZS5yZXBlYXRGb3IgPiAwID8gdHJhZGUucmVwZWF0Rm9yIDogMSkpLnRvTG9jYWxlU3RyaW5nKCkgKyBcIiBmb2xsb3dlciBleHBvc3VyZSk8YnI+YW5kIGFza2luZyBmb3IgXCIgKyB0cmFkZS5vdGhlci5zbG90cy5sZW5ndGggKiAodHJhZGUucmVwZWF0Rm9yID4gMCA/IHRyYWRlLnJlcGVhdEZvciA6IDEpICsgXCIgc2xvdHMgKFwiICsgKHRyYWRlLm90aGVyLnNsb3RzLmxlbmd0aCAqIHRyYWRlLm90aGVyLnVzZXIuc291bmRjbG91ZC5mb2xsb3dlcnMgKiAodHJhZGUucmVwZWF0Rm9yID4gMCA/IHRyYWRlLnJlcGVhdEZvciA6IDEpKS50b0xvY2FsZVN0cmluZygpICsgXCIgZm9sbG93ZXIgZXhwb3N1cmUpLlwiXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJldHVybiB0cmFkZS5vdGhlci51c2VyLnNvdW5kY2xvdWQudXNlcm5hbWUgKyBcIiBpcyBvZmZlcmluZyBcIiArIHRyYWRlLm90aGVyLnNsb3RzLmxlbmd0aCAqICh0cmFkZS5yZXBlYXRGb3IgPiAwID8gdHJhZGUucmVwZWF0Rm9yIDogMSkgKyBcIiBzbG90cyAoXCIgKyAodHJhZGUub3RoZXIuc2xvdHMubGVuZ3RoICogdHJhZGUub3RoZXIudXNlci5zb3VuZGNsb3VkLmZvbGxvd2VycyAqICh0cmFkZS5yZXBlYXRGb3IgPiAwID8gdHJhZGUucmVwZWF0Rm9yIDogMSkpLnRvTG9jYWxlU3RyaW5nKCkgKyBcIiBmb2xsb3dlciBleHBvc3VyZSk8YnI+YW5kIGFza2luZyBmb3IgXCIgKyB0cmFkZS51c2VyLnNsb3RzLmxlbmd0aCAqICh0cmFkZS5yZXBlYXRGb3IgPiAwID8gdHJhZGUucmVwZWF0Rm9yIDogMSkgKyBcIiBzbG90cyAoXCIgKyAodHJhZGUudXNlci5zbG90cy5sZW5ndGggKiB0cmFkZS51c2VyLnVzZXIuc291bmRjbG91ZC5mb2xsb3dlcnMgKiAodHJhZGUucmVwZWF0Rm9yID4gMCA/IHRyYWRlLnJlcGVhdEZvciA6IDEpKS50b0xvY2FsZVN0cmluZygpICsgXCIgZm9sbG93ZXIgZXhwb3N1cmUpLlwiXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvKk1hbmFnZSBUcmFkZXMgZW5kKi9cclxuICAgICAgJHNjb3BlLmdldFVzZXJOZXR3b3JrKCk7XHJcbiAgICAgICRzY29wZS52ZXJpZnlCcm93c2VyKCk7XHJcbiAgICAgICRzY29wZS5jaGVja05vdGlmaWNhdGlvbigpO1xyXG4gICAgICAkc2NvcGUuc29ydFJlc3VsdCgkc2NvcGUuc29ydGJ5KTtcclxuICAgICAgJHNjb3BlLmxvYWRNb3JlVXNlcnMoKTtcclxuICAgICAgJHNjb3BlLnNldFZpZXcoXCJpbmJveFwiKTtcclxuICAgICAgXHJcbiAgICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdpbmJveFN0YXRlJykpIHtcclxuICAgICAgICAkc2NvcGUuc2V0Vmlldygkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdpbmJveFN0YXRlJykpO1xyXG4gICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2luYm94U3RhdGUnKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSkiXSwiZmlsZSI6ImNvbW1vbi9kaXJlY3RpdmVzL3JlRm9yUmVMaXN0cy9yZUZvclJlTGlzdHMuanMifQ==
