app.directive('rfrinteraction', function($http) {
  return {
    templateUrl: 'js/common/directives/rfrInteraction/rfrInteraction.html',
    restrict: 'E',
    scope: false,
    controller: function rfrInteractionController($rootScope, $state, $scope, $http, AuthService, $window, SessionService, socket, moment) {
      var path = window.location.pathname;
      $window.localStorage.setItem('activetab', '1');
      $scope.isAdminRoute = false;
      if (path.indexOf("admin/") != -1) {
        $scope.isAdminRoute = true;
      }else if(path.indexOf("thirdparty/") != -1){
        $scope.isthirdparty = true;
      }  else {
        $scope.isAdminRoute = false;
      }
      $scope.shownotification = false;
      $scope.chatOpen = false;
      $scope.type = 'remind';
      $scope.change = false;
      $scope.showUndo = false;
      $scope.showEmailModal = false;
      $scope.processing = false;
      socket.connect();
      $scope.makeEventURL = "";
      $scope.showOverlay = false;
      $scope.processong = false;
      $scope.hideall = false;

      $scope.trackArtistID = 0;
      $scope.trackType = "";
      $scope.listDayIncr = 0;
      // $scope.selectTrade = $scope.currentTrades.find(function(el) {
      //   return el._id == $scope.trade._id;
      // });
      var person = $scope.trade.p1.user._id == $scope.user._id ? $scope.trade.p1 : $scope.trade.p2;
      $scope.user.accepted = person.accepted;
      $scope.p1dayIncr = 0;
      $scope.p2dayIncr = 0;
      $scope.repeatOn = ($scope.trade.repeatFor > 0);
      $scope.currentDate = new Date();
      $scope.daysArray = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      $scope.itemview = "calender";

      $scope.setView = function(view) {
        $scope.itemview = view;
        var personNum = $scope.activeUser._id == $scope.trade.p1.user._id ? 'p1' : 'p2';
        $scope.getListEvents(personNum);
      };

      $scope.trackList = [];

      $scope.activeUser = $scope.user;
      $scope.changeActiveUser = function(user) {
        $scope.activeUser = user;
        if (!$scope.$$phase) $scope.$apply();
      }

      $scope.changeRepeatOn = function() {
        $scope.showUndo = true;
        $scope.repeatOn = !$scope.repeatOn;
        if ($scope.reapeatOn) {
          $scope.trade.repeatFor = 4;
        } else {
          $scope.trade.repeatFor = 0;
        }
      }

      $scope.changeRepeatFor = function() {
        $scope.showUndo = true;
        $scope.trade.repeatFor = parseInt($scope.trade.repeatFor);
        if ($scope.trade.repeatFor > 52) {
          $scope.trade.repeatFor = 52;
        } else if ($scope.trade.repeatFor < 0 || $scope.trade.repeatFor == NaN) {
          $scope.trade.repeatFor = 0;
        }
        $scope.repeatOn = $scope.trade.repeatFor > 0;
      }

      $scope.trackListChangeEvent = function(index) {
        $scope.makeEvent.URL = $scope.makeEvent.trackListObj.permalink_url;
        $scope.changeURL();
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
              if (!$scope.$$phase) $scope.$apply();
            })
            .catch(function(response) {
              $scope.processing = false;
              if (!$scope.$$phase) $scope.$apply();
            });
        }
      }

      $scope.getSchedulerID = function(uid) {
        return ((uid == $scope.user._id) ? "scheduler-left" : "scheduler-right");
      }

      $scope.user.accepted = $scope.trade.p1.user._id == $scope.user._id ? $scope.trade.p1.accepted : $scope.trade.p2.accepted;
      // $scope.curTrade = JSON.stringify($.grep($scope.currentTrades, function(e) {
      //   return e._id == $scope.trade._id;
      // }));

      $scope.refreshCalendar = function() {
        $scope.fillCalendar();
        $scope.checkNotification();
      }

      $scope.backToLists = function() {
        console.log('hi')
        $state.go('reForReLists');
      }

      $scope.incrp1 = function(inc) {
        if ($scope.p1dayIncr < 42) $scope.p1dayIncr++;
        console.log($scope.p1dayIncr);
      }
      $scope.decrp1 = function(inc) {
        if ($scope.p1dayIncr > 0) $scope.p1dayIncr--;
      }
      $scope.incrp2 = function(inc) {
        if ($scope.p2dayIncr < 42) $scope.p2dayIncr++;
      }
      $scope.decrp2 = function(inc) {
        if ($scope.p2dayIncr > 0) $scope.p2dayIncr--;
      }

      $scope.changeURL = function() {
        if ($scope.makeEvent.URL != "") {
          $scope.processing = true;
          $http.post('/api/soundcloud/resolve', {
              url: $scope.makeEvent.URL
            })
            .then(function(res) {
              $scope.trackArtistID = res.data.user.id;
              $scope.trackType = res.data.kind;
              if (res.data.kind != "playlist") {
                $scope.makeEvent.trackID = res.data.id;
                $scope.makeEvent.title = res.data.title;
                $scope.makeEvent.trackURL = res.data.trackURL;
                if (res.data.user) $scope.makeEvent.artistName = res.data.user.username;
                SC.oEmbed($scope.makeEvent.URL, {
                  element: document.getElementById('scPlayer'),
                  auto_play: false,
                  maxheight: 150
                })
                document.getElementById('scPlayer').style.visibility = "visible";
                $scope.notFound = false;
                $scope.processing = false;
              } else {
                $scope.notFound = false;
                $scope.processing = false;
                $.Zebra_Dialog("Sorry! We do not currently allow playlist reposting. Please enter a track url instead.");
              }
            }).then(null, function(err) {
              $.Zebra_Dialog("We are not allowed to access this track from Soundcloud. We apologize for the inconvenience, and we are working with Soundcloud to resolve the issue.");
              document.getElementById('scPlayer').style.visibility = "hidden";
              $scope.notFound = true;
              $scope.processing = false;
            });
        }
      }


      $scope.unrepostOverlap = function() {
        if (!$scope.makeEvent.trackID) return false;
        var events = ($scope.makeEvent.person.user._id == $scope.trade.p1.user._id) ? $scope.p1Events : $scope.p2Events;
        var slots = $scope.makeEvent.person.slots;
        var blockEvents = events.filter(function(event) {
          event.day = new Date(event.day);
          event.unrepostDate = new Date(event.unrepostDate);
          if (moment($scope.makeEvent.day).format('LLL') == moment(event.day).format('LLL') && $scope.makeEvent.trackID == event.trackID) return false;
          return ($scope.makeEvent.trackID == event.trackID && event.unrepostDate.getTime() > $scope.makeEvent.day.getTime() - 24 * 3600000 && event.day.getTime() < $scope.makeEvent.unrepostDate.getTime() + 24 * 3600000);
        })
        var blockEvents2 = slots.filter(function(slot) {
          slot.day = new Date(slot.day);
          slot.unrepostDate = new Date(slot.unrepostDate);
          if (moment($scope.makeEvent.day).format('LLL') == moment(slot.day).format('LLL') && $scope.makeEvent.trackID == slot.trackID) return false;
          return ($scope.makeEvent.trackID == slot.trackID && slot.unrepostDate.getTime() > $scope.makeEvent.day.getTime() - 24 * 3600000 && slot.day.getTime() < $scope.makeEvent.unrepostDate.getTime() + 24 * 3600000);
        })
        return blockEvents.length > 0 || blockEvents2.length > 0;
      }

      $scope.changeTrade = function(trade) {
        $state.go('reForReInteraction', {
          tradeID: trade._id
        })
      }

      $scope.backEvent = function() {
        $scope.makeEvent = undefined;
        $scope.trackType = "";
        $scope.trackArtistID = 0;
        $scope.showOverlay = false;
      }

      $scope.deleteEvent = function(calEvent, person) {
        person.slots = person.slots.filter(function(slot, index) {
          return !(moment(slot.day).format('LLL') == moment(calEvent.day).format('LLL'));
        });
        $scope.showUndo = true;
        $scope.fillCalendar();
      }

      $scope.checkNotification = function() {
        var user = SessionService.getUser();
        if (user) {
          return $http.get('/api/trades/withUser/' + user._id)
            .then(function(res) {
              var trades = res.data;
              var trade = trades.find(function(t) {
                return t._id.toString() == $scope.trade._id.toString();
              });
              console.log('trade', trade);
              if (trade) {
                if (trade.p1.user._id == user._id) {
                  if (trade.p1.alert == "change" && $scope.chatOpen == false) {
                    $scope.shownotification = true;
                  }
                }
                if (trade.p2.user._id == user._id) {
                  if (trade.p2.alert == "change" && $scope.chatOpen == false) {
                    $scope.shownotification = true;
                  }
                }
              }
            });
        } else {
          return 'ok';
        }
      }
      $scope.saveTrade = function() {
        if ($scope.trade.p1.user._id == $scope.user._id) {
          $scope.trade.p1.accepted = true;
          $scope.trade.p2.accepted = false;
        } else {
          $scope.trade.p2.accepted = true;
          $scope.trade.p1.accepted = false;
        }
        if ($scope.trade.p1.slots.length == 0 || $scope.trade.p2.slots.length == 0) {
          $.Zebra_Dialog("Issue! At least one slot on each account must be selected.");
        } else {
          $.Zebra_Dialog("Request trade? Giving " + $scope.stringSlots($scope.trade.user) + " (" + $scope.stringReach($scope.trade.user) + ") for " + $scope.stringSlots($scope.trade.other) + " (" + $scope.stringReach($scope.trade.other) + ").", {
            'type': 'confirmation',
            'buttons': [{
              caption: 'Cancel',
              callback: function() {
                console.log('No was clicked');
              }
            }, {
              caption: 'Request',
              callback: function() {
                $scope.processing = true;
                $scope.trade.changed = true;
                $http.put('/api/trades', $scope.trade)
                  .then(function(res) {
                    res.data.other = ($scope.trade.p1.user._id == $scope.user._id) ? $scope.trade.p2 : $scope.trade.p1;
                    res.data.user = ($scope.trade.p1.user._id == $scope.user._id) ? $scope.trade.p1 : $scope.trade.p2;
                    $scope.trade = res.data;
                    $scope.emitMessage($scope.user.soundcloud.username + " requested/updated this trade.", 'alert');
                    $scope.processing = false;
                    $scope.showUndo = false;
                    $window.localStorage.setItem('activetab', '2');
                    $window.localStorage.setItem('inboxState', 'sent');
                    window.localStorage.setItem("showPopup", JSON.stringify($scope.trade));
                    if ($scope.isthirdparty) {
                      $state.go('thirdpartyRepostTraders');
                    }else if ($scope.isAdminRoute) {
                      $state.go('adminRepostTraders');
                    } else {
                      $state.go('reForReLists');
                    }
                  })
                  .then(null, function(err) {
                    $scope.showOverlay = false;
                    $scope.processing = false;
                    $.Zebra_Dialog('Error requesting');
                  })
              }
            }]
          });
        }
      }

      $scope.openChat = function() {
        $scope.chatOpen = true;
        $scope.msgCount = 0;
        $scope.shownotification = false;
      }

      $scope.undo = function() {
        $scope.processing = true;
        $http.get('/api/trades/byID/' + $scope.trade._id)
          .then(function(res) {
            $scope.processing = false;
            $scope.trade = res.data;
            $scope.trade.other = ($scope.trade.p1.user._id == $scope.user._id) ? $scope.trade.p2 : $scope.trade.p1;
            $scope.trade.user = ($scope.trade.p1.user._id == $scope.user._id) ? $scope.trade.p1 : $scope.trade.p2;
            $scope.trade.user.user.pseudoAvailableSlots = createPseudoAvailableSlots($scope.trade.user.user);
            $scope.trade.other.user.pseudoAvailableSlots = createPseudoAvailableSlots($scope.trade.other.user);
            $scope.fillCalendar();
            var personNum = $scope.activeUser._id == $scope.trade.p1.user._id ? 'p1' : 'p2';
            $scope.getListEvents(personNum);
            $scope.showUndo = false;
          }).then(null, console.log)
      };

      $scope.saveEvent = function(event, person) {
        person.slots = person.slots.filter(function(slot, index) {
          return !(moment(slot.day).format('LLL') === moment(event.day).format('LLL'));
        });
        person.slots.push(event);
        $scope.showUndo = true;
        $scope.fillCalendar();
      }

      $scope.totalReach = function(person) {
        return "Total Reach: " + (person.slots.length * person.user.soundcloud.followers * ($scope.trade.repeatFor > 0 ? $scope.trade.repeatFor : 1)).toLocaleString();
      }

      $scope.stringReach = function(person) {
        return (person.slots.length * person.user.soundcloud.followers * ($scope.trade.repeatFor > 0 ? $scope.trade.repeatFor : 1)).toLocaleString() + " follower exposure";
      }

      $scope.totalSlots = function(person) {
        return person.slots.length * ($scope.trade.repeatFor > 0 ? $scope.trade.repeatFor : 1) + " Slots";
      }

      $scope.stringSlots = function(person) {
        return person.slots.length * ($scope.trade.repeatFor > 0 ? $scope.trade.repeatFor : 1) + " slots";
      }

      $scope.emailSlot = function() {
        var mailto_link = "mailto:?subject=Repost of " + $scope.makeEvent.title + '&body=Hey,\n\n I am reposting your song ' + $scope.makeEvent.title + ' on ' + $scope.makeEventAccount.username + ' on ' + $scope.makeEvent.day.toLocaleDateString() + '.\n\n Best, \n' + $scope.user.soundcloud.username;
        location.href = encodeURI(mailto_link);
      }

      $scope.changeUnrepost = function() {
        if ($scope.makeEvent.unrepost) {
          $scope.makeEvent.day = new Date($scope.makeEvent.day);
          $scope.makeEvent.unrepostDate = new Date($scope.makeEvent.day.getTime() + 48 * 60 * 60 * 1000);
        } else {
          $scope.makeEvent.unrepostDate = new Date(0);
        }
      }

      $scope.clickedSlot = function(day, dayOffset, hour, calendar, person, event) {
        var style = {};
        var currentDay = new Date(day).getDay();

        var date = (new Date(day)).setHours(hour);
        if (!($scope.activeUser.pseudoAvailableSlots[$scope.daysArray[currentDay]] && $scope.activeUser.pseudoAvailableSlots[$scope.daysArray[currentDay]].indexOf(hour) > -1 && date > (new Date().getTime() + 24 * 3600000)) || ($scope.activeUser.blockRelease && new Date($scope.activeUser.blockRelease) > date)) {
          if (event.type != 'trade') return false;
        }

        var makeDay = new Date(day);
        makeDay.setHours(hour, 30, 0, 0);
        switch (event.type) {
          case 'queue':
          case 'track':
          case 'paid':
          case 'traded':
            return false;
            break;
          case 'empty':
            var calEvent = {
              type: "trade",
              day: makeDay,
              userID: person.user.soundcloud.id,
              unrepostDate: new Date(makeDay.getTime() + 48 * 60 * 60 * 1000)
            };
            $scope.saveEvent(calEvent, person);
            break;
          case 'trade':
            $scope.deleteEvent(event, person);
            break;
        }
      }

      $scope.email = function() {
        var otherUser = $scope.trade.p1.user._id == $scope.user._id ? $scope.trade.p2.user : $scope.trade.p1.user;
        var mailto_link = "mailto:" + otherUser.email + "?subject=Repost for repost with " + $scope.user.soundcloud.username + '&body=Hey ' + otherUser.soundcloud.username + ',\n\n Repost for repost? I scheduled a trade here! -> ArtistsUnlimited.co/login\n\nBest,\n' + $scope.user.soundcloud.username;
        location.href = encodeURI(mailto_link);
      }

      $scope.acceptTrade = function() {
        $.Zebra_Dialog("Accept trade? Giving " + $scope.stringSlots($scope.trade.user) + " (" + $scope.stringReach($scope.trade.user) + ") for " + $scope.stringSlots($scope.trade.other) + " (" + $scope.stringReach($scope.trade.other) + ").", {
          'type': 'confirmation',
          'buttons': [{
            caption: 'Cancel',
            callback: function() {
              console.log('No was clicked');
            }
          }, {
            caption: 'Accept',
            callback: function() {
              $scope.completeTrade();
            }
          }]
        });
      }

      $scope.autoFillTracks = [];
      $scope.trackListObj = null;
      $scope.trackListSlotObj = null;
      $scope.newQueueSong = "";

      $scope.trackChange = function(index) {
        $scope.makeEventURL = $scope.trackListSlotObj.permalink_url;
        $scope.changeURL();
      };

      $scope.trackListChange = function(index) {
        $scope.newQueueSong = $scope.trackListObj.permalink_url;
        $scope.processing = true;
        $scope.changeQueueSong();
      };

      $scope.addSong = function() {

        if ($scope.user.queue.indexOf($scope.newQueueID) != -1) return;
        $scope.user.queue.push($scope.newQueueID);
        $scope.saveUser();
        $scope.newQueueSong = undefined;
        $scope.trackListObj = "";
        $scope.newQueue = undefined;
        $scope.accept();
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
              $scope.newQueueSong = "";
              $('#autoFillTrack').modal('hide');
              $.Zebra_Dialog("We are not allowed to access tracks by this artist with the Soundcloud API. We apologize for the inconvenience, and we are working with Soundcloud to resolve this issue.");
              $scope.processing = false;
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
          $('#autoFillTrack').modal('hide');
        }
        //overlay autofill track end//

      socket.on('init', function(data) {
        $scope.name = data.name;
        $scope.users = data.users;
      });

      socket.on('send:message', function(message) {
        console.log('send');
        console.log(message);
        if (message.tradeID == $scope.trade._id) {
          $scope.msgHistory.push(message);
          $scope.message = message.message;
          $scope.checkNotification();
          $scope.trade.messages.push(message);
          if (message.type == "alert") {
            $scope.refreshCalendar();
          }
        }
      });

      socket.on('get:message', function(data) {
        console.log('get')
        console.log(data);
        $scope.msgCount = 0;
        if (data != '' && data._id == $scope.trade._id) {
          $scope.msgHistory = data ? data.messages : [];
          $scope.msgCount++;
          $scope.checkNotification();
          if ($scope.msgHistory[$scope.msgHistory.length - 1].type == "alert") {
            $scope.undo();
          }
        }
      });

      $scope.msgCount = 0;
      $scope.emitMessage = function(message, type) {
        socket.emit('send:message', {
          message: message,
          type: type,
          id: $scope.user._id,
          tradeID: $scope.trade._id
        });
        $scope.message = '';
      }

      $scope.getMessage = function() {
        socket.emit('get:message', $scope.trade._id);
      }

      $scope.fillDateArrays = function(events, slots) {
        var calendar = [];
        var today = new Date();
        for (var i = 0; i < 50; i++) {
          var calDay = {};
          calDay.day = new Date(today);
          calDay.day.setDate(today.getDate() + i);
          var dayEvents = events.filter(function(ev) {
            return (ev.day.toLocaleDateString() == calDay.day.toLocaleDateString());
          });
          slots.forEach(function(slot) {
            if (slot.day.toLocaleDateString() == calDay.day.toLocaleDateString()) dayEvents.push(slot);
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
      }

      $scope.fillCalendar = function() {
        $scope.repeatOn = $scope.trade.repeatFor > 0;

        function setEventDays(arr) {
          arr.forEach(function(ev) {
            ev.day = new Date(ev.day);
          })
        }
        setEventDays($scope.p1Events);
        setEventDays($scope.p2Events);
        setEventDays($scope.trade.p1.slots);
        setEventDays($scope.trade.p2.slots);

        var now = new Date()
        now.setHours(now.getHours(), 30, 0, 0);

        var change = false;
        $scope.trade.p1.slots = $scope.trade.p1.slots.filter(function(slot) {
          if (slot.day < now) {
            change = true;
            return false;
          } else return true
        });
        $scope.p1Events.forEach(function(event) {
          $scope.trade.p1.slots = $scope.trade.p1.slots.filter(function(slot) {
            if (slot.day.toLocaleDateString() == event.day.toLocaleDateString() && slot.day.getHours() == event.day.getHours()) {
              change = true;
              return false;
            } else return true;
          })
        })

        $scope.trade.p2.slots = $scope.trade.p2.slots.filter(function(slot) {
          if (slot.day < now) {
            change = true;
            return false;
          } else return true
        });
        $scope.p2Events.forEach(function(event) {
          $scope.trade.p2.slots = $scope.trade.p2.slots.filter(function(slot) {
            if (slot.day.toLocaleDateString() == event.day.toLocaleDateString() && slot.day.getHours() == event.day.getHours()) {
              change = true;
              return false;
            } else return true;
          })
        })
        $scope.calendarp1 = $scope.fillDateArrays($scope.p1Events, $scope.trade.p1.slots);
        $scope.calendarp2 = $scope.fillDateArrays($scope.p2Events, $scope.trade.p2.slots);
      }
      $scope.fillCalendar();

      // $scope.updateAlerts = function() {
      //   if ($scope.trade.p1.user._id == $scope.user._id) {
      //     $scope.trade.p1.alert = "none";
      //   }

      //   if ($scope.trade.p2.user._id == $scope.user._id) {
      //     $scope.trade.p2.alert = "none";
      //   }
      //   $http.put('/api/trades', $scope.trade);
      //   $scope.shownotification = false;
      // }

      $scope.completeTrade = function() {
        $scope.processing = true;
        if ($scope.trade.repeatFor > 0) {
          var now = new Date();
          now.setHours(0);
          now.setMinutes(0);
          var endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
          var p1WeekSlots = $scope.trade.p1.slots.filter(function(slot) {
            return slot.day < endDate;
          })
          var p2WeekSlots = $scope.trade.p2.slots.filter(function(slot) {
            return slot.day < endDate;
          })
          for (var i = 0; i < $scope.trade.repeatFor; i++) {

            p1WeekSlots.forEach(function(slot) {
              var event = JSON.parse(JSON.stringify(slot));
              event.type = 'traded';
              event.owner = $scope.trade.p2.user._id;
              event.day = new Date((new Date(slot.day)).getTime() + i * 7 * 24 * 60 * 60 * 1000);
              event.unrepostDate = new Date(event.day.getTime() + 48 * 60 * 60 * 1000);
              $scope.createEventWithUserTradeSettings(event, $scope.trade.p1.user);
            })

            p2WeekSlots.forEach(function(slot) {
              var event = JSON.parse(JSON.stringify(slot));
              event.type = 'traded';
              event.owner = $scope.trade.p1.user._id
              event.day = new Date((new Date(slot.day)).getTime() + i * 7 * 24 * 60 * 60 * 1000);
              event.unrepostDate = new Date(event.day.getTime() + 48 * 60 * 60 * 1000);
              $scope.createEventWithUserTradeSettings(event, $scope.trade.p2.user);
            })
          }
        } else {
          $scope.trade.p1.slots.forEach(function(slot) {
            var event = slot;
            event.type = 'traded';
            event.owner = $scope.trade.p2.user._id;
            $scope.createEventWithUserTradeSettings(event, $scope.trade.p1.user);
          })
          $scope.trade.p2.slots.forEach(function(slot) {
            var event = slot;
            event.type = 'traded';
            event.owner = $scope.trade.p1.user._id;
            $scope.createEventWithUserTradeSettings(event, $scope.trade.p2.user);
          })
        }
        $scope.trade.p1.accepted = $scope.trade.p2.accepted = true;
        $scope.trade.p1.slots = $scope.trade.p2.slots = [];
        $scope.trade.changed = true;
        $http.put('/api/trades', $scope.trade)
          .then(function(res) {
            $window.localStorage.setItem('activetab', '3');
            if ($scope.isAdminRoute) {
              $state.go('adminRepostTraders');
            } else {
              $rootScope.newManageSlots = true;
              $state.go('reForReLists');
            }
          })
          .then(null, console.log);
      }

      $scope.createEventWithUserTradeSettings = function(event, user) {
        if (user && user.repostSettings) {
          event.like = ((user.repostSettings.trade && user.repostSettings.trade.like) ? user.repostSettings.trade.like : false);
          var userTradeComments = ((user.repostSettings.trade && user.repostSettings.trade.comments) ? user.repostSettings.trade.comments : []);
          if (userTradeComments.length > 0) {
            event.comment = userTradeComments[Math.floor(Math.random() * userTradeComments.length)];
          }
          $http.post('/api/events/repostEvents', event);
        } else {
          $http.post('/api/events/repostEvents', event);
        }
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
        var personNum = $scope.activeUser._id == $scope.trade.p1.user._id ? 'p1' : 'p2';
        $scope.getListEvents(personNum);
      }

      $scope.getNextEvents = function() {
        $scope.listDayIncr++;
        var personNum = $scope.activeUser._id == $scope.trade.p1.user._id ? 'p1' : 'p2';
        $scope.getListEvents(personNum);
      }

      $scope.toggleSlot = function(item) {
        var personNum = $scope.activeUser._id == $scope.trade.p1.user._id ? 'p1' : 'p2';
        $scope.clickedSlot(item.date, {}, item.date.getHours(), {}, $scope.trade[personNum], item.event);
        $scope.getListEvents(personNum);
      }

      $scope.getListEvents = function(userNum) {
        $scope.listEvents = [];
        var currentDate = new Date();
        currentDate.setDate(currentDate.getDate() + $scope.listDayIncr);
        for (var i = 0; i < 7; i++) {
          var d = new Date(currentDate);
          d.setDate(d.getDate() + i);
          var currentDay = d.getDay();
          var strDdate = getshortdate(d);
          var slots = $scope.trade[userNum].user.pseudoAvailableSlots[$scope.daysArray[currentDay]];
          slots = slots.sort(function(a, b) {
            return a - b
          });
          angular.forEach(slots, function(hour) {
            var item = new Object();
            var calendarDay = $scope['calendar' + userNum].find(function(calD) {
              return calD.day.toLocaleDateString() == d.toLocaleDateString();
            });
            var event = calendarDay.events.find(function(ev) {
              return new Date(ev.day).getHours() == hour;
            });

            item.event = (event ? event : {
              type: 'empty'
            })
            var dt = new Date(d);
            dt.setHours(hour);
            item.date = new Date(dt);
            if (item.date > (new Date().getTime() + 24 * 3600000))
              $scope.listEvents.push(item);
          });
        }
        if (!$scope.$$phase) $scope.$apply();
      }

      $scope.getUnrepostDate = function(item) {
        return new Date(item.date.getTime() + 48 * 60 * 60 * 1000)
      }

      $scope.getStyle = function(event, date, day, hour) {
        var style = {
          'border-radius': '4px',
          'border-width': '1px'
        };
        var currentDay = new Date(date).getDay();
        var date = (new Date(date)).setHours(hour)
        if ($scope.activeUser.pseudoAvailableSlots[$scope.daysArray[currentDay]] && $scope.activeUser.pseudoAvailableSlots[$scope.daysArray[currentDay]].indexOf(hour) > -1 && date > (new Date().getTime() + 24 * 3600000) && (event.type == 'empty' || event.type == 'trade') && !($scope.activeUser.blockRelease && new Date($scope.activeUser.blockRelease).getTime() > date)) {
          style = {
            'background-color': '#fff',
            'border-color': "#999",
            'border-width': '1px',
            'border-radius': '4px'
          }
        }
        return style;
      }

      $scope.getEventStyle = function(event) {
        if (event && event.type == 'trade') {
          return {
            'background-color': '#FFD450',
            'height': '18px',
            'margin': '2px',
            'border-radius': '4px'
          }
        } else {
          return {}
        }
      }

      $scope.dayOfWeekAsString = function(date) {
        var dayIndex = date.getDay();
        return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex];

      }


      $scope.unrepostSymbol = function(event) {
        if (!event.unrepostDate) return;
        event.unrepostDate = new Date(event.unrepostDate);
        return event.unrepostDate > new Date();
      }

      $scope.showBoxInfo = function(event) {
        return (event.type == 'trade' || event.type == 'traded')
      }

      $scope.followerShow = function() {
        return (screen.width > '436');
      }

      $scope.updateEmail = function(email) {
        var answer = email;
        var myArray = answer.match(/[a-z\._\-!#$%&'+/=?^_`{}|~]+@[a-z0-9\-]+\.\S{2,3}/igm);
        if (myArray) {
          $scope.user.email = answer;
          return $http.put('/api/database/profile', $scope.user)
            .then(function(res) {
              SessionService.create(res.data);
              $scope.user = SessionService.getUser();
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
          $('#emailModal').modal('show');
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

      $scope.remindTrade = function() {
        $('#pop').modal('show');
      }
      $scope.verifyBrowser();
      $scope.checkNotification();
    }
  }
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24vZGlyZWN0aXZlcy9yZnJJbnRlcmFjdGlvbi9yZnJJbnRlcmFjdGlvbi5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHAuZGlyZWN0aXZlKCdyZnJpbnRlcmFjdGlvbicsIGZ1bmN0aW9uKCRodHRwKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvcmZySW50ZXJhY3Rpb24vcmZySW50ZXJhY3Rpb24uaHRtbCcsXHJcbiAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgc2NvcGU6IGZhbHNlLFxyXG4gICAgY29udHJvbGxlcjogZnVuY3Rpb24gcmZySW50ZXJhY3Rpb25Db250cm9sbGVyKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgQXV0aFNlcnZpY2UsICR3aW5kb3csIFNlc3Npb25TZXJ2aWNlLCBzb2NrZXQsIG1vbWVudCkge1xyXG4gICAgICB2YXIgcGF0aCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcclxuICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYWN0aXZldGFiJywgJzEnKTtcclxuICAgICAgJHNjb3BlLmlzQWRtaW5Sb3V0ZSA9IGZhbHNlO1xyXG4gICAgICBpZiAocGF0aC5pbmRleE9mKFwiYWRtaW4vXCIpICE9IC0xKSB7XHJcbiAgICAgICAgJHNjb3BlLmlzQWRtaW5Sb3V0ZSA9IHRydWU7XHJcbiAgICAgIH1lbHNlIGlmKHBhdGguaW5kZXhPZihcInRoaXJkcGFydHkvXCIpICE9IC0xKXtcclxuICAgICAgICAkc2NvcGUuaXN0aGlyZHBhcnR5ID0gdHJ1ZTtcclxuICAgICAgfSAgZWxzZSB7XHJcbiAgICAgICAgJHNjb3BlLmlzQWRtaW5Sb3V0ZSA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgICRzY29wZS5zaG93bm90aWZpY2F0aW9uID0gZmFsc2U7XHJcbiAgICAgICRzY29wZS5jaGF0T3BlbiA9IGZhbHNlO1xyXG4gICAgICAkc2NvcGUudHlwZSA9ICdyZW1pbmQnO1xyXG4gICAgICAkc2NvcGUuY2hhbmdlID0gZmFsc2U7XHJcbiAgICAgICRzY29wZS5zaG93VW5kbyA9IGZhbHNlO1xyXG4gICAgICAkc2NvcGUuc2hvd0VtYWlsTW9kYWwgPSBmYWxzZTtcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgc29ja2V0LmNvbm5lY3QoKTtcclxuICAgICAgJHNjb3BlLm1ha2VFdmVudFVSTCA9IFwiXCI7XHJcbiAgICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc29uZyA9IGZhbHNlO1xyXG4gICAgICAkc2NvcGUuaGlkZWFsbCA9IGZhbHNlO1xyXG5cclxuICAgICAgJHNjb3BlLnRyYWNrQXJ0aXN0SUQgPSAwO1xyXG4gICAgICAkc2NvcGUudHJhY2tUeXBlID0gXCJcIjtcclxuICAgICAgJHNjb3BlLmxpc3REYXlJbmNyID0gMDtcclxuICAgICAgLy8gJHNjb3BlLnNlbGVjdFRyYWRlID0gJHNjb3BlLmN1cnJlbnRUcmFkZXMuZmluZChmdW5jdGlvbihlbCkge1xyXG4gICAgICAvLyAgIHJldHVybiBlbC5faWQgPT0gJHNjb3BlLnRyYWRlLl9pZDtcclxuICAgICAgLy8gfSk7XHJcbiAgICAgIHZhciBwZXJzb24gPSAkc2NvcGUudHJhZGUucDEudXNlci5faWQgPT0gJHNjb3BlLnVzZXIuX2lkID8gJHNjb3BlLnRyYWRlLnAxIDogJHNjb3BlLnRyYWRlLnAyO1xyXG4gICAgICAkc2NvcGUudXNlci5hY2NlcHRlZCA9IHBlcnNvbi5hY2NlcHRlZDtcclxuICAgICAgJHNjb3BlLnAxZGF5SW5jciA9IDA7XHJcbiAgICAgICRzY29wZS5wMmRheUluY3IgPSAwO1xyXG4gICAgICAkc2NvcGUucmVwZWF0T24gPSAoJHNjb3BlLnRyYWRlLnJlcGVhdEZvciA+IDApO1xyXG4gICAgICAkc2NvcGUuY3VycmVudERhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAkc2NvcGUuZGF5c0FycmF5ID0gWydzdW5kYXknLCAnbW9uZGF5JywgJ3R1ZXNkYXknLCAnd2VkbmVzZGF5JywgJ3RodXJzZGF5JywgJ2ZyaWRheScsICdzYXR1cmRheSddO1xyXG4gICAgICAkc2NvcGUuaXRlbXZpZXcgPSBcImNhbGVuZGVyXCI7XHJcblxyXG4gICAgICAkc2NvcGUuc2V0VmlldyA9IGZ1bmN0aW9uKHZpZXcpIHtcclxuICAgICAgICAkc2NvcGUuaXRlbXZpZXcgPSB2aWV3O1xyXG4gICAgICAgIHZhciBwZXJzb25OdW0gPSAkc2NvcGUuYWN0aXZlVXNlci5faWQgPT0gJHNjb3BlLnRyYWRlLnAxLnVzZXIuX2lkID8gJ3AxJyA6ICdwMic7XHJcbiAgICAgICAgJHNjb3BlLmdldExpc3RFdmVudHMocGVyc29uTnVtKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgICRzY29wZS50cmFja0xpc3QgPSBbXTtcclxuXHJcbiAgICAgICRzY29wZS5hY3RpdmVVc2VyID0gJHNjb3BlLnVzZXI7XHJcbiAgICAgICRzY29wZS5jaGFuZ2VBY3RpdmVVc2VyID0gZnVuY3Rpb24odXNlcikge1xyXG4gICAgICAgICRzY29wZS5hY3RpdmVVc2VyID0gdXNlcjtcclxuICAgICAgICBpZiAoISRzY29wZS4kJHBoYXNlKSAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5jaGFuZ2VSZXBlYXRPbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS5zaG93VW5kbyA9IHRydWU7XHJcbiAgICAgICAgJHNjb3BlLnJlcGVhdE9uID0gISRzY29wZS5yZXBlYXRPbjtcclxuICAgICAgICBpZiAoJHNjb3BlLnJlYXBlYXRPbikge1xyXG4gICAgICAgICAgJHNjb3BlLnRyYWRlLnJlcGVhdEZvciA9IDQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICRzY29wZS50cmFkZS5yZXBlYXRGb3IgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmNoYW5nZVJlcGVhdEZvciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS5zaG93VW5kbyA9IHRydWU7XHJcbiAgICAgICAgJHNjb3BlLnRyYWRlLnJlcGVhdEZvciA9IHBhcnNlSW50KCRzY29wZS50cmFkZS5yZXBlYXRGb3IpO1xyXG4gICAgICAgIGlmICgkc2NvcGUudHJhZGUucmVwZWF0Rm9yID4gNTIpIHtcclxuICAgICAgICAgICRzY29wZS50cmFkZS5yZXBlYXRGb3IgPSA1MjtcclxuICAgICAgICB9IGVsc2UgaWYgKCRzY29wZS50cmFkZS5yZXBlYXRGb3IgPCAwIHx8ICRzY29wZS50cmFkZS5yZXBlYXRGb3IgPT0gTmFOKSB7XHJcbiAgICAgICAgICAkc2NvcGUudHJhZGUucmVwZWF0Rm9yID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgICAgJHNjb3BlLnJlcGVhdE9uID0gJHNjb3BlLnRyYWRlLnJlcGVhdEZvciA+IDA7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS50cmFja0xpc3RDaGFuZ2VFdmVudCA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC5VUkwgPSAkc2NvcGUubWFrZUV2ZW50LnRyYWNrTGlzdE9iai5wZXJtYWxpbmtfdXJsO1xyXG4gICAgICAgICRzY29wZS5jaGFuZ2VVUkwoKTtcclxuICAgICAgfTtcclxuXHJcbiAgICAgICRzY29wZS5nZXRUcmFja0xpc3RGcm9tU291bmRjbG91ZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBwcm9maWxlID0gJHNjb3BlLnVzZXI7XHJcbiAgICAgICAgaWYgKHByb2ZpbGUuc291bmRjbG91ZCkge1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgU0MuZ2V0KCcvdXNlcnMvJyArIHByb2ZpbGUuc291bmRjbG91ZC5pZCArICcvdHJhY2tzJywge1xyXG4gICAgICAgICAgICAgIGZpbHRlcjogJ3B1YmxpYydcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24odHJhY2tzKSB7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrTGlzdCA9IHRyYWNrcztcclxuICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIGlmICghJHNjb3BlLiQkcGhhc2UpICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICBpZiAoISRzY29wZS4kJHBoYXNlKSAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmdldFNjaGVkdWxlcklEID0gZnVuY3Rpb24odWlkKSB7XHJcbiAgICAgICAgcmV0dXJuICgodWlkID09ICRzY29wZS51c2VyLl9pZCkgPyBcInNjaGVkdWxlci1sZWZ0XCIgOiBcInNjaGVkdWxlci1yaWdodFwiKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnVzZXIuYWNjZXB0ZWQgPSAkc2NvcGUudHJhZGUucDEudXNlci5faWQgPT0gJHNjb3BlLnVzZXIuX2lkID8gJHNjb3BlLnRyYWRlLnAxLmFjY2VwdGVkIDogJHNjb3BlLnRyYWRlLnAyLmFjY2VwdGVkO1xyXG4gICAgICAvLyAkc2NvcGUuY3VyVHJhZGUgPSBKU09OLnN0cmluZ2lmeSgkLmdyZXAoJHNjb3BlLmN1cnJlbnRUcmFkZXMsIGZ1bmN0aW9uKGUpIHtcclxuICAgICAgLy8gICByZXR1cm4gZS5faWQgPT0gJHNjb3BlLnRyYWRlLl9pZDtcclxuICAgICAgLy8gfSkpO1xyXG5cclxuICAgICAgJHNjb3BlLnJlZnJlc2hDYWxlbmRhciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS5maWxsQ2FsZW5kYXIoKTtcclxuICAgICAgICAkc2NvcGUuY2hlY2tOb3RpZmljYXRpb24oKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmJhY2tUb0xpc3RzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJ2hpJylcclxuICAgICAgICAkc3RhdGUuZ28oJ3JlRm9yUmVMaXN0cycpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuaW5jcnAxID0gZnVuY3Rpb24oaW5jKSB7XHJcbiAgICAgICAgaWYgKCRzY29wZS5wMWRheUluY3IgPCA0MikgJHNjb3BlLnAxZGF5SW5jcisrO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5wMWRheUluY3IpO1xyXG4gICAgICB9XHJcbiAgICAgICRzY29wZS5kZWNycDEgPSBmdW5jdGlvbihpbmMpIHtcclxuICAgICAgICBpZiAoJHNjb3BlLnAxZGF5SW5jciA+IDApICRzY29wZS5wMWRheUluY3ItLTtcclxuICAgICAgfVxyXG4gICAgICAkc2NvcGUuaW5jcnAyID0gZnVuY3Rpb24oaW5jKSB7XHJcbiAgICAgICAgaWYgKCRzY29wZS5wMmRheUluY3IgPCA0MikgJHNjb3BlLnAyZGF5SW5jcisrO1xyXG4gICAgICB9XHJcbiAgICAgICRzY29wZS5kZWNycDIgPSBmdW5jdGlvbihpbmMpIHtcclxuICAgICAgICBpZiAoJHNjb3BlLnAyZGF5SW5jciA+IDApICRzY29wZS5wMmRheUluY3ItLTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmNoYW5nZVVSTCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICgkc2NvcGUubWFrZUV2ZW50LlVSTCAhPSBcIlwiKSB7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgICAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIHtcclxuICAgICAgICAgICAgICB1cmw6ICRzY29wZS5tYWtlRXZlbnQuVVJMXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICRzY29wZS50cmFja0FydGlzdElEID0gcmVzLmRhdGEudXNlci5pZDtcclxuICAgICAgICAgICAgICAkc2NvcGUudHJhY2tUeXBlID0gcmVzLmRhdGEua2luZDtcclxuICAgICAgICAgICAgICBpZiAocmVzLmRhdGEua2luZCAhPSBcInBsYXlsaXN0XCIpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCA9IHJlcy5kYXRhLmlkO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLm1ha2VFdmVudC50aXRsZSA9IHJlcy5kYXRhLnRpdGxlO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLm1ha2VFdmVudC50cmFja1VSTCA9IHJlcy5kYXRhLnRyYWNrVVJMO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlcy5kYXRhLnVzZXIpICRzY29wZS5tYWtlRXZlbnQuYXJ0aXN0TmFtZSA9IHJlcy5kYXRhLnVzZXIudXNlcm5hbWU7XHJcbiAgICAgICAgICAgICAgICBTQy5vRW1iZWQoJHNjb3BlLm1ha2VFdmVudC5VUkwsIHtcclxuICAgICAgICAgICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUGxheWVyJyksXHJcbiAgICAgICAgICAgICAgICAgIGF1dG9fcGxheTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgIG1heGhlaWdodDogMTUwXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUGxheWVyJykuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLm5vdEZvdW5kID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUubm90Rm91bmQgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIlNvcnJ5ISBXZSBkbyBub3QgY3VycmVudGx5IGFsbG93IHBsYXlsaXN0IHJlcG9zdGluZy4gUGxlYXNlIGVudGVyIGEgdHJhY2sgdXJsIGluc3RlYWQuXCIpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSkudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIldlIGFyZSBub3QgYWxsb3dlZCB0byBhY2Nlc3MgdGhpcyB0cmFjayBmcm9tIFNvdW5kY2xvdWQuIFdlIGFwb2xvZ2l6ZSBmb3IgdGhlIGluY29udmVuaWVuY2UsIGFuZCB3ZSBhcmUgd29ya2luZyB3aXRoIFNvdW5kY2xvdWQgdG8gcmVzb2x2ZSB0aGUgaXNzdWUuXCIpO1xyXG4gICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xyXG4gICAgICAgICAgICAgICRzY29wZS5ub3RGb3VuZCA9IHRydWU7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG5cclxuICAgICAgJHNjb3BlLnVucmVwb3N0T3ZlcmxhcCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICghJHNjb3BlLm1ha2VFdmVudC50cmFja0lEKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgdmFyIGV2ZW50cyA9ICgkc2NvcGUubWFrZUV2ZW50LnBlcnNvbi51c2VyLl9pZCA9PSAkc2NvcGUudHJhZGUucDEudXNlci5faWQpID8gJHNjb3BlLnAxRXZlbnRzIDogJHNjb3BlLnAyRXZlbnRzO1xyXG4gICAgICAgIHZhciBzbG90cyA9ICRzY29wZS5tYWtlRXZlbnQucGVyc29uLnNsb3RzO1xyXG4gICAgICAgIHZhciBibG9ja0V2ZW50cyA9IGV2ZW50cy5maWx0ZXIoZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgIGV2ZW50LmRheSA9IG5ldyBEYXRlKGV2ZW50LmRheSk7XHJcbiAgICAgICAgICBldmVudC51bnJlcG9zdERhdGUgPSBuZXcgRGF0ZShldmVudC51bnJlcG9zdERhdGUpO1xyXG4gICAgICAgICAgaWYgKG1vbWVudCgkc2NvcGUubWFrZUV2ZW50LmRheSkuZm9ybWF0KCdMTEwnKSA9PSBtb21lbnQoZXZlbnQuZGF5KS5mb3JtYXQoJ0xMTCcpICYmICRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCA9PSBldmVudC50cmFja0lEKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICByZXR1cm4gKCRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCA9PSBldmVudC50cmFja0lEICYmIGV2ZW50LnVucmVwb3N0RGF0ZS5nZXRUaW1lKCkgPiAkc2NvcGUubWFrZUV2ZW50LmRheS5nZXRUaW1lKCkgLSAyNCAqIDM2MDAwMDAgJiYgZXZlbnQuZGF5LmdldFRpbWUoKSA8ICRzY29wZS5tYWtlRXZlbnQudW5yZXBvc3REYXRlLmdldFRpbWUoKSArIDI0ICogMzYwMDAwMCk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICB2YXIgYmxvY2tFdmVudHMyID0gc2xvdHMuZmlsdGVyKGZ1bmN0aW9uKHNsb3QpIHtcclxuICAgICAgICAgIHNsb3QuZGF5ID0gbmV3IERhdGUoc2xvdC5kYXkpO1xyXG4gICAgICAgICAgc2xvdC51bnJlcG9zdERhdGUgPSBuZXcgRGF0ZShzbG90LnVucmVwb3N0RGF0ZSk7XHJcbiAgICAgICAgICBpZiAobW9tZW50KCRzY29wZS5tYWtlRXZlbnQuZGF5KS5mb3JtYXQoJ0xMTCcpID09IG1vbWVudChzbG90LmRheSkuZm9ybWF0KCdMTEwnKSAmJiAkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQgPT0gc2xvdC50cmFja0lEKSByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICByZXR1cm4gKCRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCA9PSBzbG90LnRyYWNrSUQgJiYgc2xvdC51bnJlcG9zdERhdGUuZ2V0VGltZSgpID4gJHNjb3BlLm1ha2VFdmVudC5kYXkuZ2V0VGltZSgpIC0gMjQgKiAzNjAwMDAwICYmIHNsb3QuZGF5LmdldFRpbWUoKSA8ICRzY29wZS5tYWtlRXZlbnQudW5yZXBvc3REYXRlLmdldFRpbWUoKSArIDI0ICogMzYwMDAwMCk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICByZXR1cm4gYmxvY2tFdmVudHMubGVuZ3RoID4gMCB8fCBibG9ja0V2ZW50czIubGVuZ3RoID4gMDtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmNoYW5nZVRyYWRlID0gZnVuY3Rpb24odHJhZGUpIHtcclxuICAgICAgICAkc3RhdGUuZ28oJ3JlRm9yUmVJbnRlcmFjdGlvbicsIHtcclxuICAgICAgICAgIHRyYWRlSUQ6IHRyYWRlLl9pZFxyXG4gICAgICAgIH0pXHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5iYWNrRXZlbnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50ID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICRzY29wZS50cmFja1R5cGUgPSBcIlwiO1xyXG4gICAgICAgICRzY29wZS50cmFja0FydGlzdElEID0gMDtcclxuICAgICAgICAkc2NvcGUuc2hvd092ZXJsYXkgPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmRlbGV0ZUV2ZW50ID0gZnVuY3Rpb24oY2FsRXZlbnQsIHBlcnNvbikge1xyXG4gICAgICAgIHBlcnNvbi5zbG90cyA9IHBlcnNvbi5zbG90cy5maWx0ZXIoZnVuY3Rpb24oc2xvdCwgaW5kZXgpIHtcclxuICAgICAgICAgIHJldHVybiAhKG1vbWVudChzbG90LmRheSkuZm9ybWF0KCdMTEwnKSA9PSBtb21lbnQoY2FsRXZlbnQuZGF5KS5mb3JtYXQoJ0xMTCcpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkc2NvcGUuc2hvd1VuZG8gPSB0cnVlO1xyXG4gICAgICAgICRzY29wZS5maWxsQ2FsZW5kYXIoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmNoZWNrTm90aWZpY2F0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgICAgaWYgKHVzZXIpIHtcclxuICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvdHJhZGVzL3dpdGhVc2VyLycgKyB1c2VyLl9pZClcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgdmFyIHRyYWRlcyA9IHJlcy5kYXRhO1xyXG4gICAgICAgICAgICAgIHZhciB0cmFkZSA9IHRyYWRlcy5maW5kKGZ1bmN0aW9uKHQpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiB0Ll9pZC50b1N0cmluZygpID09ICRzY29wZS50cmFkZS5faWQudG9TdHJpbmcoKTtcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICBjb25zb2xlLmxvZygndHJhZGUnLCB0cmFkZSk7XHJcbiAgICAgICAgICAgICAgaWYgKHRyYWRlKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAodHJhZGUucDEudXNlci5faWQgPT0gdXNlci5faWQpIHtcclxuICAgICAgICAgICAgICAgICAgaWYgKHRyYWRlLnAxLmFsZXJ0ID09IFwiY2hhbmdlXCIgJiYgJHNjb3BlLmNoYXRPcGVuID09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnNob3dub3RpZmljYXRpb24gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBpZiAodHJhZGUucDIudXNlci5faWQgPT0gdXNlci5faWQpIHtcclxuICAgICAgICAgICAgICAgICAgaWYgKHRyYWRlLnAyLmFsZXJ0ID09IFwiY2hhbmdlXCIgJiYgJHNjb3BlLmNoYXRPcGVuID09IGZhbHNlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnNob3dub3RpZmljYXRpb24gPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgcmV0dXJuICdvayc7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgICRzY29wZS5zYXZlVHJhZGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoJHNjb3BlLnRyYWRlLnAxLnVzZXIuX2lkID09ICRzY29wZS51c2VyLl9pZCkge1xyXG4gICAgICAgICAgJHNjb3BlLnRyYWRlLnAxLmFjY2VwdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICRzY29wZS50cmFkZS5wMi5hY2NlcHRlZCA9IGZhbHNlO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAkc2NvcGUudHJhZGUucDIuYWNjZXB0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgJHNjb3BlLnRyYWRlLnAxLmFjY2VwdGVkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICgkc2NvcGUudHJhZGUucDEuc2xvdHMubGVuZ3RoID09IDAgfHwgJHNjb3BlLnRyYWRlLnAyLnNsb3RzLmxlbmd0aCA9PSAwKSB7XHJcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIklzc3VlISBBdCBsZWFzdCBvbmUgc2xvdCBvbiBlYWNoIGFjY291bnQgbXVzdCBiZSBzZWxlY3RlZC5cIik7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICQuWmVicmFfRGlhbG9nKFwiUmVxdWVzdCB0cmFkZT8gR2l2aW5nIFwiICsgJHNjb3BlLnN0cmluZ1Nsb3RzKCRzY29wZS50cmFkZS51c2VyKSArIFwiIChcIiArICRzY29wZS5zdHJpbmdSZWFjaCgkc2NvcGUudHJhZGUudXNlcikgKyBcIikgZm9yIFwiICsgJHNjb3BlLnN0cmluZ1Nsb3RzKCRzY29wZS50cmFkZS5vdGhlcikgKyBcIiAoXCIgKyAkc2NvcGUuc3RyaW5nUmVhY2goJHNjb3BlLnRyYWRlLm90aGVyKSArIFwiKS5cIiwge1xyXG4gICAgICAgICAgICAndHlwZSc6ICdjb25maXJtYXRpb24nLFxyXG4gICAgICAgICAgICAnYnV0dG9ucyc6IFt7XHJcbiAgICAgICAgICAgICAgY2FwdGlvbjogJ0NhbmNlbCcsXHJcbiAgICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ05vIHdhcyBjbGlja2VkJyk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgICAgY2FwdGlvbjogJ1JlcXVlc3QnLFxyXG4gICAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICRzY29wZS50cmFkZS5jaGFuZ2VkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICRodHRwLnB1dCgnL2FwaS90cmFkZXMnLCAkc2NvcGUudHJhZGUpXHJcbiAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5kYXRhLm90aGVyID0gKCRzY29wZS50cmFkZS5wMS51c2VyLl9pZCA9PSAkc2NvcGUudXNlci5faWQpID8gJHNjb3BlLnRyYWRlLnAyIDogJHNjb3BlLnRyYWRlLnAxO1xyXG4gICAgICAgICAgICAgICAgICAgIHJlcy5kYXRhLnVzZXIgPSAoJHNjb3BlLnRyYWRlLnAxLnVzZXIuX2lkID09ICRzY29wZS51c2VyLl9pZCkgPyAkc2NvcGUudHJhZGUucDEgOiAkc2NvcGUudHJhZGUucDI7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnRyYWRlID0gcmVzLmRhdGE7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmVtaXRNZXNzYWdlKCRzY29wZS51c2VyLnNvdW5kY2xvdWQudXNlcm5hbWUgKyBcIiByZXF1ZXN0ZWQvdXBkYXRlZCB0aGlzIHRyYWRlLlwiLCAnYWxlcnQnKTtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93VW5kbyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ2FjdGl2ZXRhYicsICcyJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnaW5ib3hTdGF0ZScsICdzZW50Jyk7XHJcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKFwic2hvd1BvcHVwXCIsIEpTT04uc3RyaW5naWZ5KCRzY29wZS50cmFkZSkpO1xyXG4gICAgICAgICAgICAgICAgICAgIGlmICgkc2NvcGUuaXN0aGlyZHBhcnR5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ3RoaXJkcGFydHlSZXBvc3RUcmFkZXJzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfWVsc2UgaWYgKCRzY29wZS5pc0FkbWluUm91dGUpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnYWRtaW5SZXBvc3RUcmFkZXJzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygncmVGb3JSZUxpc3RzJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvd092ZXJsYXkgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKCdFcnJvciByZXF1ZXN0aW5nJyk7XHJcbiAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUub3BlbkNoYXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUuY2hhdE9wZW4gPSB0cnVlO1xyXG4gICAgICAgICRzY29wZS5tc2dDb3VudCA9IDA7XHJcbiAgICAgICAgJHNjb3BlLnNob3dub3RpZmljYXRpb24gPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnVuZG8gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgJGh0dHAuZ2V0KCcvYXBpL3RyYWRlcy9ieUlELycgKyAkc2NvcGUudHJhZGUuX2lkKVxyXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICRzY29wZS50cmFkZSA9IHJlcy5kYXRhO1xyXG4gICAgICAgICAgICAkc2NvcGUudHJhZGUub3RoZXIgPSAoJHNjb3BlLnRyYWRlLnAxLnVzZXIuX2lkID09ICRzY29wZS51c2VyLl9pZCkgPyAkc2NvcGUudHJhZGUucDIgOiAkc2NvcGUudHJhZGUucDE7XHJcbiAgICAgICAgICAgICRzY29wZS50cmFkZS51c2VyID0gKCRzY29wZS50cmFkZS5wMS51c2VyLl9pZCA9PSAkc2NvcGUudXNlci5faWQpID8gJHNjb3BlLnRyYWRlLnAxIDogJHNjb3BlLnRyYWRlLnAyO1xyXG4gICAgICAgICAgICAkc2NvcGUudHJhZGUudXNlci51c2VyLnBzZXVkb0F2YWlsYWJsZVNsb3RzID0gY3JlYXRlUHNldWRvQXZhaWxhYmxlU2xvdHMoJHNjb3BlLnRyYWRlLnVzZXIudXNlcik7XHJcbiAgICAgICAgICAgICRzY29wZS50cmFkZS5vdGhlci51c2VyLnBzZXVkb0F2YWlsYWJsZVNsb3RzID0gY3JlYXRlUHNldWRvQXZhaWxhYmxlU2xvdHMoJHNjb3BlLnRyYWRlLm90aGVyLnVzZXIpO1xyXG4gICAgICAgICAgICAkc2NvcGUuZmlsbENhbGVuZGFyKCk7XHJcbiAgICAgICAgICAgIHZhciBwZXJzb25OdW0gPSAkc2NvcGUuYWN0aXZlVXNlci5faWQgPT0gJHNjb3BlLnRyYWRlLnAxLnVzZXIuX2lkID8gJ3AxJyA6ICdwMic7XHJcbiAgICAgICAgICAgICRzY29wZS5nZXRMaXN0RXZlbnRzKHBlcnNvbk51bSk7XHJcbiAgICAgICAgICAgICRzY29wZS5zaG93VW5kbyA9IGZhbHNlO1xyXG4gICAgICAgICAgfSkudGhlbihudWxsLCBjb25zb2xlLmxvZylcclxuICAgICAgfTtcclxuXHJcbiAgICAgICRzY29wZS5zYXZlRXZlbnQgPSBmdW5jdGlvbihldmVudCwgcGVyc29uKSB7XHJcbiAgICAgICAgcGVyc29uLnNsb3RzID0gcGVyc29uLnNsb3RzLmZpbHRlcihmdW5jdGlvbihzbG90LCBpbmRleCkge1xyXG4gICAgICAgICAgcmV0dXJuICEobW9tZW50KHNsb3QuZGF5KS5mb3JtYXQoJ0xMTCcpID09PSBtb21lbnQoZXZlbnQuZGF5KS5mb3JtYXQoJ0xMTCcpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBwZXJzb24uc2xvdHMucHVzaChldmVudCk7XHJcbiAgICAgICAgJHNjb3BlLnNob3dVbmRvID0gdHJ1ZTtcclxuICAgICAgICAkc2NvcGUuZmlsbENhbGVuZGFyKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS50b3RhbFJlYWNoID0gZnVuY3Rpb24ocGVyc29uKSB7XHJcbiAgICAgICAgcmV0dXJuIFwiVG90YWwgUmVhY2g6IFwiICsgKHBlcnNvbi5zbG90cy5sZW5ndGggKiBwZXJzb24udXNlci5zb3VuZGNsb3VkLmZvbGxvd2VycyAqICgkc2NvcGUudHJhZGUucmVwZWF0Rm9yID4gMCA/ICRzY29wZS50cmFkZS5yZXBlYXRGb3IgOiAxKSkudG9Mb2NhbGVTdHJpbmcoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnN0cmluZ1JlYWNoID0gZnVuY3Rpb24ocGVyc29uKSB7XHJcbiAgICAgICAgcmV0dXJuIChwZXJzb24uc2xvdHMubGVuZ3RoICogcGVyc29uLnVzZXIuc291bmRjbG91ZC5mb2xsb3dlcnMgKiAoJHNjb3BlLnRyYWRlLnJlcGVhdEZvciA+IDAgPyAkc2NvcGUudHJhZGUucmVwZWF0Rm9yIDogMSkpLnRvTG9jYWxlU3RyaW5nKCkgKyBcIiBmb2xsb3dlciBleHBvc3VyZVwiO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUudG90YWxTbG90cyA9IGZ1bmN0aW9uKHBlcnNvbikge1xyXG4gICAgICAgIHJldHVybiBwZXJzb24uc2xvdHMubGVuZ3RoICogKCRzY29wZS50cmFkZS5yZXBlYXRGb3IgPiAwID8gJHNjb3BlLnRyYWRlLnJlcGVhdEZvciA6IDEpICsgXCIgU2xvdHNcIjtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnN0cmluZ1Nsb3RzID0gZnVuY3Rpb24ocGVyc29uKSB7XHJcbiAgICAgICAgcmV0dXJuIHBlcnNvbi5zbG90cy5sZW5ndGggKiAoJHNjb3BlLnRyYWRlLnJlcGVhdEZvciA+IDAgPyAkc2NvcGUudHJhZGUucmVwZWF0Rm9yIDogMSkgKyBcIiBzbG90c1wiO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuZW1haWxTbG90ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG1haWx0b19saW5rID0gXCJtYWlsdG86P3N1YmplY3Q9UmVwb3N0IG9mIFwiICsgJHNjb3BlLm1ha2VFdmVudC50aXRsZSArICcmYm9keT1IZXksXFxuXFxuIEkgYW0gcmVwb3N0aW5nIHlvdXIgc29uZyAnICsgJHNjb3BlLm1ha2VFdmVudC50aXRsZSArICcgb24gJyArICRzY29wZS5tYWtlRXZlbnRBY2NvdW50LnVzZXJuYW1lICsgJyBvbiAnICsgJHNjb3BlLm1ha2VFdmVudC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgKyAnLlxcblxcbiBCZXN0LCBcXG4nICsgJHNjb3BlLnVzZXIuc291bmRjbG91ZC51c2VybmFtZTtcclxuICAgICAgICBsb2NhdGlvbi5ocmVmID0gZW5jb2RlVVJJKG1haWx0b19saW5rKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmNoYW5nZVVucmVwb3N0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKCRzY29wZS5tYWtlRXZlbnQudW5yZXBvc3QpIHtcclxuICAgICAgICAgICRzY29wZS5tYWtlRXZlbnQuZGF5ID0gbmV3IERhdGUoJHNjb3BlLm1ha2VFdmVudC5kYXkpO1xyXG4gICAgICAgICAgJHNjb3BlLm1ha2VFdmVudC51bnJlcG9zdERhdGUgPSBuZXcgRGF0ZSgkc2NvcGUubWFrZUV2ZW50LmRheS5nZXRUaW1lKCkgKyA0OCAqIDYwICogNjAgKiAxMDAwKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgJHNjb3BlLm1ha2VFdmVudC51bnJlcG9zdERhdGUgPSBuZXcgRGF0ZSgwKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5jbGlja2VkU2xvdCA9IGZ1bmN0aW9uKGRheSwgZGF5T2Zmc2V0LCBob3VyLCBjYWxlbmRhciwgcGVyc29uLCBldmVudCkge1xyXG4gICAgICAgIHZhciBzdHlsZSA9IHt9O1xyXG4gICAgICAgIHZhciBjdXJyZW50RGF5ID0gbmV3IERhdGUoZGF5KS5nZXREYXkoKTtcclxuXHJcbiAgICAgICAgdmFyIGRhdGUgPSAobmV3IERhdGUoZGF5KSkuc2V0SG91cnMoaG91cik7XHJcbiAgICAgICAgaWYgKCEoJHNjb3BlLmFjdGl2ZVVzZXIucHNldWRvQXZhaWxhYmxlU2xvdHNbJHNjb3BlLmRheXNBcnJheVtjdXJyZW50RGF5XV0gJiYgJHNjb3BlLmFjdGl2ZVVzZXIucHNldWRvQXZhaWxhYmxlU2xvdHNbJHNjb3BlLmRheXNBcnJheVtjdXJyZW50RGF5XV0uaW5kZXhPZihob3VyKSA+IC0xICYmIGRhdGUgPiAobmV3IERhdGUoKS5nZXRUaW1lKCkgKyAyNCAqIDM2MDAwMDApKSB8fCAoJHNjb3BlLmFjdGl2ZVVzZXIuYmxvY2tSZWxlYXNlICYmIG5ldyBEYXRlKCRzY29wZS5hY3RpdmVVc2VyLmJsb2NrUmVsZWFzZSkgPiBkYXRlKSkge1xyXG4gICAgICAgICAgaWYgKGV2ZW50LnR5cGUgIT0gJ3RyYWRlJykgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIG1ha2VEYXkgPSBuZXcgRGF0ZShkYXkpO1xyXG4gICAgICAgIG1ha2VEYXkuc2V0SG91cnMoaG91ciwgMzAsIDAsIDApO1xyXG4gICAgICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xyXG4gICAgICAgICAgY2FzZSAncXVldWUnOlxyXG4gICAgICAgICAgY2FzZSAndHJhY2snOlxyXG4gICAgICAgICAgY2FzZSAncGFpZCc6XHJcbiAgICAgICAgICBjYXNlICd0cmFkZWQnOlxyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnZW1wdHknOlxyXG4gICAgICAgICAgICB2YXIgY2FsRXZlbnQgPSB7XHJcbiAgICAgICAgICAgICAgdHlwZTogXCJ0cmFkZVwiLFxyXG4gICAgICAgICAgICAgIGRheTogbWFrZURheSxcclxuICAgICAgICAgICAgICB1c2VySUQ6IHBlcnNvbi51c2VyLnNvdW5kY2xvdWQuaWQsXHJcbiAgICAgICAgICAgICAgdW5yZXBvc3REYXRlOiBuZXcgRGF0ZShtYWtlRGF5LmdldFRpbWUoKSArIDQ4ICogNjAgKiA2MCAqIDEwMDApXHJcbiAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICRzY29wZS5zYXZlRXZlbnQoY2FsRXZlbnQsIHBlcnNvbik7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAndHJhZGUnOlxyXG4gICAgICAgICAgICAkc2NvcGUuZGVsZXRlRXZlbnQoZXZlbnQsIHBlcnNvbik7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmVtYWlsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIG90aGVyVXNlciA9ICRzY29wZS50cmFkZS5wMS51c2VyLl9pZCA9PSAkc2NvcGUudXNlci5faWQgPyAkc2NvcGUudHJhZGUucDIudXNlciA6ICRzY29wZS50cmFkZS5wMS51c2VyO1xyXG4gICAgICAgIHZhciBtYWlsdG9fbGluayA9IFwibWFpbHRvOlwiICsgb3RoZXJVc2VyLmVtYWlsICsgXCI/c3ViamVjdD1SZXBvc3QgZm9yIHJlcG9zdCB3aXRoIFwiICsgJHNjb3BlLnVzZXIuc291bmRjbG91ZC51c2VybmFtZSArICcmYm9keT1IZXkgJyArIG90aGVyVXNlci5zb3VuZGNsb3VkLnVzZXJuYW1lICsgJyxcXG5cXG4gUmVwb3N0IGZvciByZXBvc3Q/IEkgc2NoZWR1bGVkIGEgdHJhZGUgaGVyZSEgLT4gQXJ0aXN0c1VubGltaXRlZC5jby9sb2dpblxcblxcbkJlc3QsXFxuJyArICRzY29wZS51c2VyLnNvdW5kY2xvdWQudXNlcm5hbWU7XHJcbiAgICAgICAgbG9jYXRpb24uaHJlZiA9IGVuY29kZVVSSShtYWlsdG9fbGluayk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5hY2NlcHRUcmFkZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQuWmVicmFfRGlhbG9nKFwiQWNjZXB0IHRyYWRlPyBHaXZpbmcgXCIgKyAkc2NvcGUuc3RyaW5nU2xvdHMoJHNjb3BlLnRyYWRlLnVzZXIpICsgXCIgKFwiICsgJHNjb3BlLnN0cmluZ1JlYWNoKCRzY29wZS50cmFkZS51c2VyKSArIFwiKSBmb3IgXCIgKyAkc2NvcGUuc3RyaW5nU2xvdHMoJHNjb3BlLnRyYWRlLm90aGVyKSArIFwiIChcIiArICRzY29wZS5zdHJpbmdSZWFjaCgkc2NvcGUudHJhZGUub3RoZXIpICsgXCIpLlwiLCB7XHJcbiAgICAgICAgICAndHlwZSc6ICdjb25maXJtYXRpb24nLFxyXG4gICAgICAgICAgJ2J1dHRvbnMnOiBbe1xyXG4gICAgICAgICAgICBjYXB0aW9uOiAnQ2FuY2VsJyxcclxuICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdObyB3YXMgY2xpY2tlZCcpO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9LCB7XHJcbiAgICAgICAgICAgIGNhcHRpb246ICdBY2NlcHQnLFxyXG4gICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLmNvbXBsZXRlVHJhZGUoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfV1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmF1dG9GaWxsVHJhY2tzID0gW107XHJcbiAgICAgICRzY29wZS50cmFja0xpc3RPYmogPSBudWxsO1xyXG4gICAgICAkc2NvcGUudHJhY2tMaXN0U2xvdE9iaiA9IG51bGw7XHJcbiAgICAgICRzY29wZS5uZXdRdWV1ZVNvbmcgPSBcIlwiO1xyXG5cclxuICAgICAgJHNjb3BlLnRyYWNrQ2hhbmdlID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50VVJMID0gJHNjb3BlLnRyYWNrTGlzdFNsb3RPYmoucGVybWFsaW5rX3VybDtcclxuICAgICAgICAkc2NvcGUuY2hhbmdlVVJMKCk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkc2NvcGUudHJhY2tMaXN0Q2hhbmdlID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAkc2NvcGUubmV3UXVldWVTb25nID0gJHNjb3BlLnRyYWNrTGlzdE9iai5wZXJtYWxpbmtfdXJsO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgICAkc2NvcGUuY2hhbmdlUXVldWVTb25nKCk7XHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkc2NvcGUuYWRkU29uZyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgICBpZiAoJHNjb3BlLnVzZXIucXVldWUuaW5kZXhPZigkc2NvcGUubmV3UXVldWVJRCkgIT0gLTEpIHJldHVybjtcclxuICAgICAgICAkc2NvcGUudXNlci5xdWV1ZS5wdXNoKCRzY29wZS5uZXdRdWV1ZUlEKTtcclxuICAgICAgICAkc2NvcGUuc2F2ZVVzZXIoKTtcclxuICAgICAgICAkc2NvcGUubmV3UXVldWVTb25nID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICRzY29wZS50cmFja0xpc3RPYmogPSBcIlwiO1xyXG4gICAgICAgICRzY29wZS5uZXdRdWV1ZSA9IHVuZGVmaW5lZDtcclxuICAgICAgICAkc2NvcGUuYWNjZXB0KCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5jaGFuZ2VRdWV1ZVNvbmcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoJHNjb3BlLm5ld1F1ZXVlU29uZyAhPSBcIlwiKSB7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgICAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIHtcclxuICAgICAgICAgICAgICB1cmw6ICRzY29wZS5uZXdRdWV1ZVNvbmdcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICB2YXIgdHJhY2sgPSByZXMuZGF0YTtcclxuICAgICAgICAgICAgICAkc2NvcGUubmV3UXVldWUgPSB0cmFjaztcclxuICAgICAgICAgICAgICAkc2NvcGUubmV3UXVldWVJRCA9IHRyYWNrLmlkO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgICAkc2NvcGUubmV3UXVldWVTb25nID0gXCJcIjtcclxuICAgICAgICAgICAgICAkKCcjYXV0b0ZpbGxUcmFjaycpLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJXZSBhcmUgbm90IGFsbG93ZWQgdG8gYWNjZXNzIHRyYWNrcyBieSB0aGlzIGFydGlzdCB3aXRoIHRoZSBTb3VuZGNsb3VkIEFQSS4gV2UgYXBvbG9naXplIGZvciB0aGUgaW5jb252ZW5pZW5jZSwgYW5kIHdlIGFyZSB3b3JraW5nIHdpdGggU291bmRjbG91ZCB0byByZXNvbHZlIHRoaXMgaXNzdWUuXCIpO1xyXG4gICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnNhdmVVc2VyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgICAkaHR0cC5wdXQoXCIvYXBpL2RhdGFiYXNlL3Byb2ZpbGVcIiwgJHNjb3BlLnVzZXIpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZShyZXMuZGF0YSk7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJFcnJvcjogZGlkIG5vdCBzYXZlXCIpO1xyXG4gICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgJCgnI2F1dG9GaWxsVHJhY2snKS5tb2RhbCgnaGlkZScpO1xyXG4gICAgICAgIH1cclxuICAgICAgICAvL292ZXJsYXkgYXV0b2ZpbGwgdHJhY2sgZW5kLy9cclxuXHJcbiAgICAgIHNvY2tldC5vbignaW5pdCcsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICAkc2NvcGUubmFtZSA9IGRhdGEubmFtZTtcclxuICAgICAgICAkc2NvcGUudXNlcnMgPSBkYXRhLnVzZXJzO1xyXG4gICAgICB9KTtcclxuXHJcbiAgICAgIHNvY2tldC5vbignc2VuZDptZXNzYWdlJywgZnVuY3Rpb24obWVzc2FnZSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdzZW5kJyk7XHJcbiAgICAgICAgY29uc29sZS5sb2cobWVzc2FnZSk7XHJcbiAgICAgICAgaWYgKG1lc3NhZ2UudHJhZGVJRCA9PSAkc2NvcGUudHJhZGUuX2lkKSB7XHJcbiAgICAgICAgICAkc2NvcGUubXNnSGlzdG9yeS5wdXNoKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgJHNjb3BlLm1lc3NhZ2UgPSBtZXNzYWdlLm1lc3NhZ2U7XHJcbiAgICAgICAgICAkc2NvcGUuY2hlY2tOb3RpZmljYXRpb24oKTtcclxuICAgICAgICAgICRzY29wZS50cmFkZS5tZXNzYWdlcy5wdXNoKG1lc3NhZ2UpO1xyXG4gICAgICAgICAgaWYgKG1lc3NhZ2UudHlwZSA9PSBcImFsZXJ0XCIpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnJlZnJlc2hDYWxlbmRhcigpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICBzb2NrZXQub24oJ2dldDptZXNzYWdlJywgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCdnZXQnKVxyXG4gICAgICAgIGNvbnNvbGUubG9nKGRhdGEpO1xyXG4gICAgICAgICRzY29wZS5tc2dDb3VudCA9IDA7XHJcbiAgICAgICAgaWYgKGRhdGEgIT0gJycgJiYgZGF0YS5faWQgPT0gJHNjb3BlLnRyYWRlLl9pZCkge1xyXG4gICAgICAgICAgJHNjb3BlLm1zZ0hpc3RvcnkgPSBkYXRhID8gZGF0YS5tZXNzYWdlcyA6IFtdO1xyXG4gICAgICAgICAgJHNjb3BlLm1zZ0NvdW50Kys7XHJcbiAgICAgICAgICAkc2NvcGUuY2hlY2tOb3RpZmljYXRpb24oKTtcclxuICAgICAgICAgIGlmICgkc2NvcGUubXNnSGlzdG9yeVskc2NvcGUubXNnSGlzdG9yeS5sZW5ndGggLSAxXS50eXBlID09IFwiYWxlcnRcIikge1xyXG4gICAgICAgICAgICAkc2NvcGUudW5kbygpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcblxyXG4gICAgICAkc2NvcGUubXNnQ291bnQgPSAwO1xyXG4gICAgICAkc2NvcGUuZW1pdE1lc3NhZ2UgPSBmdW5jdGlvbihtZXNzYWdlLCB0eXBlKSB7XHJcbiAgICAgICAgc29ja2V0LmVtaXQoJ3NlbmQ6bWVzc2FnZScsIHtcclxuICAgICAgICAgIG1lc3NhZ2U6IG1lc3NhZ2UsXHJcbiAgICAgICAgICB0eXBlOiB0eXBlLFxyXG4gICAgICAgICAgaWQ6ICRzY29wZS51c2VyLl9pZCxcclxuICAgICAgICAgIHRyYWRlSUQ6ICRzY29wZS50cmFkZS5faWRcclxuICAgICAgICB9KTtcclxuICAgICAgICAkc2NvcGUubWVzc2FnZSA9ICcnO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuZ2V0TWVzc2FnZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHNvY2tldC5lbWl0KCdnZXQ6bWVzc2FnZScsICRzY29wZS50cmFkZS5faWQpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuZmlsbERhdGVBcnJheXMgPSBmdW5jdGlvbihldmVudHMsIHNsb3RzKSB7XHJcbiAgICAgICAgdmFyIGNhbGVuZGFyID0gW107XHJcbiAgICAgICAgdmFyIHRvZGF5ID0gbmV3IERhdGUoKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDUwOyBpKyspIHtcclxuICAgICAgICAgIHZhciBjYWxEYXkgPSB7fTtcclxuICAgICAgICAgIGNhbERheS5kYXkgPSBuZXcgRGF0ZSh0b2RheSk7XHJcbiAgICAgICAgICBjYWxEYXkuZGF5LnNldERhdGUodG9kYXkuZ2V0RGF0ZSgpICsgaSk7XHJcbiAgICAgICAgICB2YXIgZGF5RXZlbnRzID0gZXZlbnRzLmZpbHRlcihmdW5jdGlvbihldikge1xyXG4gICAgICAgICAgICByZXR1cm4gKGV2LmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSBjYWxEYXkuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgc2xvdHMuZm9yRWFjaChmdW5jdGlvbihzbG90KSB7XHJcbiAgICAgICAgICAgIGlmIChzbG90LmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSBjYWxEYXkuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpKSBkYXlFdmVudHMucHVzaChzbG90KTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgdmFyIGV2ZW50QXJyYXkgPSBbXTtcclxuICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgMjQ7IGorKykge1xyXG4gICAgICAgICAgICBldmVudEFycmF5W2pdID0ge1xyXG4gICAgICAgICAgICAgIHR5cGU6IFwiZW1wdHlcIlxyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZGF5RXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXYpIHtcclxuICAgICAgICAgICAgZXZlbnRBcnJheVtldi5kYXkuZ2V0SG91cnMoKV0gPSBldjtcclxuICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgIGNhbERheS5ldmVudHMgPSBldmVudEFycmF5O1xyXG4gICAgICAgICAgY2FsZW5kYXIucHVzaChjYWxEYXkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY2FsZW5kYXI7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5maWxsQ2FsZW5kYXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUucmVwZWF0T24gPSAkc2NvcGUudHJhZGUucmVwZWF0Rm9yID4gMDtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0RXZlbnREYXlzKGFycikge1xyXG4gICAgICAgICAgYXJyLmZvckVhY2goZnVuY3Rpb24oZXYpIHtcclxuICAgICAgICAgICAgZXYuZGF5ID0gbmV3IERhdGUoZXYuZGF5KTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgIHNldEV2ZW50RGF5cygkc2NvcGUucDFFdmVudHMpO1xyXG4gICAgICAgIHNldEV2ZW50RGF5cygkc2NvcGUucDJFdmVudHMpO1xyXG4gICAgICAgIHNldEV2ZW50RGF5cygkc2NvcGUudHJhZGUucDEuc2xvdHMpO1xyXG4gICAgICAgIHNldEV2ZW50RGF5cygkc2NvcGUudHJhZGUucDIuc2xvdHMpO1xyXG5cclxuICAgICAgICB2YXIgbm93ID0gbmV3IERhdGUoKVxyXG4gICAgICAgIG5vdy5zZXRIb3Vycyhub3cuZ2V0SG91cnMoKSwgMzAsIDAsIDApO1xyXG5cclxuICAgICAgICB2YXIgY2hhbmdlID0gZmFsc2U7XHJcbiAgICAgICAgJHNjb3BlLnRyYWRlLnAxLnNsb3RzID0gJHNjb3BlLnRyYWRlLnAxLnNsb3RzLmZpbHRlcihmdW5jdGlvbihzbG90KSB7XHJcbiAgICAgICAgICBpZiAoc2xvdC5kYXkgPCBub3cpIHtcclxuICAgICAgICAgICAgY2hhbmdlID0gdHJ1ZTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgfSBlbHNlIHJldHVybiB0cnVlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgJHNjb3BlLnAxRXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICRzY29wZS50cmFkZS5wMS5zbG90cyA9ICRzY29wZS50cmFkZS5wMS5zbG90cy5maWx0ZXIoZnVuY3Rpb24oc2xvdCkge1xyXG4gICAgICAgICAgICBpZiAoc2xvdC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gZXZlbnQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpICYmIHNsb3QuZGF5LmdldEhvdXJzKCkgPT0gZXZlbnQuZGF5LmdldEhvdXJzKCkpIHtcclxuICAgICAgICAgICAgICBjaGFuZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICAgICAgfSBlbHNlIHJldHVybiB0cnVlO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICB9KVxyXG5cclxuICAgICAgICAkc2NvcGUudHJhZGUucDIuc2xvdHMgPSAkc2NvcGUudHJhZGUucDIuc2xvdHMuZmlsdGVyKGZ1bmN0aW9uKHNsb3QpIHtcclxuICAgICAgICAgIGlmIChzbG90LmRheSA8IG5vdykge1xyXG4gICAgICAgICAgICBjaGFuZ2UgPSB0cnVlO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgICB9IGVsc2UgcmV0dXJuIHRydWVcclxuICAgICAgICB9KTtcclxuICAgICAgICAkc2NvcGUucDJFdmVudHMuZm9yRWFjaChmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgJHNjb3BlLnRyYWRlLnAyLnNsb3RzID0gJHNjb3BlLnRyYWRlLnAyLnNsb3RzLmZpbHRlcihmdW5jdGlvbihzbG90KSB7XHJcbiAgICAgICAgICAgIGlmIChzbG90LmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSBldmVudC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgJiYgc2xvdC5kYXkuZ2V0SG91cnMoKSA9PSBldmVudC5kYXkuZ2V0SG91cnMoKSkge1xyXG4gICAgICAgICAgICAgIGNoYW5nZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgICAgICB9IGVsc2UgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgJHNjb3BlLmNhbGVuZGFycDEgPSAkc2NvcGUuZmlsbERhdGVBcnJheXMoJHNjb3BlLnAxRXZlbnRzLCAkc2NvcGUudHJhZGUucDEuc2xvdHMpO1xyXG4gICAgICAgICRzY29wZS5jYWxlbmRhcnAyID0gJHNjb3BlLmZpbGxEYXRlQXJyYXlzKCRzY29wZS5wMkV2ZW50cywgJHNjb3BlLnRyYWRlLnAyLnNsb3RzKTtcclxuICAgICAgfVxyXG4gICAgICAkc2NvcGUuZmlsbENhbGVuZGFyKCk7XHJcblxyXG4gICAgICAvLyAkc2NvcGUudXBkYXRlQWxlcnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIC8vICAgaWYgKCRzY29wZS50cmFkZS5wMS51c2VyLl9pZCA9PSAkc2NvcGUudXNlci5faWQpIHtcclxuICAgICAgLy8gICAgICRzY29wZS50cmFkZS5wMS5hbGVydCA9IFwibm9uZVwiO1xyXG4gICAgICAvLyAgIH1cclxuXHJcbiAgICAgIC8vICAgaWYgKCRzY29wZS50cmFkZS5wMi51c2VyLl9pZCA9PSAkc2NvcGUudXNlci5faWQpIHtcclxuICAgICAgLy8gICAgICRzY29wZS50cmFkZS5wMi5hbGVydCA9IFwibm9uZVwiO1xyXG4gICAgICAvLyAgIH1cclxuICAgICAgLy8gICAkaHR0cC5wdXQoJy9hcGkvdHJhZGVzJywgJHNjb3BlLnRyYWRlKTtcclxuICAgICAgLy8gICAkc2NvcGUuc2hvd25vdGlmaWNhdGlvbiA9IGZhbHNlO1xyXG4gICAgICAvLyB9XHJcblxyXG4gICAgICAkc2NvcGUuY29tcGxldGVUcmFkZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgICBpZiAoJHNjb3BlLnRyYWRlLnJlcGVhdEZvciA+IDApIHtcclxuICAgICAgICAgIHZhciBub3cgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgICAgbm93LnNldEhvdXJzKDApO1xyXG4gICAgICAgICAgbm93LnNldE1pbnV0ZXMoMCk7XHJcbiAgICAgICAgICB2YXIgZW5kRGF0ZSA9IG5ldyBEYXRlKG5vdy5nZXRUaW1lKCkgKyA3ICogMjQgKiA2MCAqIDYwICogMTAwMCk7XHJcbiAgICAgICAgICB2YXIgcDFXZWVrU2xvdHMgPSAkc2NvcGUudHJhZGUucDEuc2xvdHMuZmlsdGVyKGZ1bmN0aW9uKHNsb3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNsb3QuZGF5IDwgZW5kRGF0ZTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICB2YXIgcDJXZWVrU2xvdHMgPSAkc2NvcGUudHJhZGUucDIuc2xvdHMuZmlsdGVyKGZ1bmN0aW9uKHNsb3QpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNsb3QuZGF5IDwgZW5kRGF0ZTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8ICRzY29wZS50cmFkZS5yZXBlYXRGb3I7IGkrKykge1xyXG5cclxuICAgICAgICAgICAgcDFXZWVrU2xvdHMuZm9yRWFjaChmdW5jdGlvbihzbG90KSB7XHJcbiAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzbG90KSk7XHJcbiAgICAgICAgICAgICAgZXZlbnQudHlwZSA9ICd0cmFkZWQnO1xyXG4gICAgICAgICAgICAgIGV2ZW50Lm93bmVyID0gJHNjb3BlLnRyYWRlLnAyLnVzZXIuX2lkO1xyXG4gICAgICAgICAgICAgIGV2ZW50LmRheSA9IG5ldyBEYXRlKChuZXcgRGF0ZShzbG90LmRheSkpLmdldFRpbWUoKSArIGkgKiA3ICogMjQgKiA2MCAqIDYwICogMTAwMCk7XHJcbiAgICAgICAgICAgICAgZXZlbnQudW5yZXBvc3REYXRlID0gbmV3IERhdGUoZXZlbnQuZGF5LmdldFRpbWUoKSArIDQ4ICogNjAgKiA2MCAqIDEwMDApO1xyXG4gICAgICAgICAgICAgICRzY29wZS5jcmVhdGVFdmVudFdpdGhVc2VyVHJhZGVTZXR0aW5ncyhldmVudCwgJHNjb3BlLnRyYWRlLnAxLnVzZXIpO1xyXG4gICAgICAgICAgICB9KVxyXG5cclxuICAgICAgICAgICAgcDJXZWVrU2xvdHMuZm9yRWFjaChmdW5jdGlvbihzbG90KSB7XHJcbiAgICAgICAgICAgICAgdmFyIGV2ZW50ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShzbG90KSk7XHJcbiAgICAgICAgICAgICAgZXZlbnQudHlwZSA9ICd0cmFkZWQnO1xyXG4gICAgICAgICAgICAgIGV2ZW50Lm93bmVyID0gJHNjb3BlLnRyYWRlLnAxLnVzZXIuX2lkXHJcbiAgICAgICAgICAgICAgZXZlbnQuZGF5ID0gbmV3IERhdGUoKG5ldyBEYXRlKHNsb3QuZGF5KSkuZ2V0VGltZSgpICsgaSAqIDcgKiAyNCAqIDYwICogNjAgKiAxMDAwKTtcclxuICAgICAgICAgICAgICBldmVudC51bnJlcG9zdERhdGUgPSBuZXcgRGF0ZShldmVudC5kYXkuZ2V0VGltZSgpICsgNDggKiA2MCAqIDYwICogMTAwMCk7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLmNyZWF0ZUV2ZW50V2l0aFVzZXJUcmFkZVNldHRpbmdzKGV2ZW50LCAkc2NvcGUudHJhZGUucDIudXNlcik7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICRzY29wZS50cmFkZS5wMS5zbG90cy5mb3JFYWNoKGZ1bmN0aW9uKHNsb3QpIHtcclxuICAgICAgICAgICAgdmFyIGV2ZW50ID0gc2xvdDtcclxuICAgICAgICAgICAgZXZlbnQudHlwZSA9ICd0cmFkZWQnO1xyXG4gICAgICAgICAgICBldmVudC5vd25lciA9ICRzY29wZS50cmFkZS5wMi51c2VyLl9pZDtcclxuICAgICAgICAgICAgJHNjb3BlLmNyZWF0ZUV2ZW50V2l0aFVzZXJUcmFkZVNldHRpbmdzKGV2ZW50LCAkc2NvcGUudHJhZGUucDEudXNlcik7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgJHNjb3BlLnRyYWRlLnAyLnNsb3RzLmZvckVhY2goZnVuY3Rpb24oc2xvdCkge1xyXG4gICAgICAgICAgICB2YXIgZXZlbnQgPSBzbG90O1xyXG4gICAgICAgICAgICBldmVudC50eXBlID0gJ3RyYWRlZCc7XHJcbiAgICAgICAgICAgIGV2ZW50Lm93bmVyID0gJHNjb3BlLnRyYWRlLnAxLnVzZXIuX2lkO1xyXG4gICAgICAgICAgICAkc2NvcGUuY3JlYXRlRXZlbnRXaXRoVXNlclRyYWRlU2V0dGluZ3MoZXZlbnQsICRzY29wZS50cmFkZS5wMi51c2VyKTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICAgICRzY29wZS50cmFkZS5wMS5hY2NlcHRlZCA9ICRzY29wZS50cmFkZS5wMi5hY2NlcHRlZCA9IHRydWU7XHJcbiAgICAgICAgJHNjb3BlLnRyYWRlLnAxLnNsb3RzID0gJHNjb3BlLnRyYWRlLnAyLnNsb3RzID0gW107XHJcbiAgICAgICAgJHNjb3BlLnRyYWRlLmNoYW5nZWQgPSB0cnVlO1xyXG4gICAgICAgICRodHRwLnB1dCgnL2FwaS90cmFkZXMnLCAkc2NvcGUudHJhZGUpXHJcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgnYWN0aXZldGFiJywgJzMnKTtcclxuICAgICAgICAgICAgaWYgKCRzY29wZS5pc0FkbWluUm91dGUpIHtcclxuICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2FkbWluUmVwb3N0VHJhZGVycycpO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgICRyb290U2NvcGUubmV3TWFuYWdlU2xvdHMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICRzdGF0ZS5nbygncmVGb3JSZUxpc3RzJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAudGhlbihudWxsLCBjb25zb2xlLmxvZyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5jcmVhdGVFdmVudFdpdGhVc2VyVHJhZGVTZXR0aW5ncyA9IGZ1bmN0aW9uKGV2ZW50LCB1c2VyKSB7XHJcbiAgICAgICAgaWYgKHVzZXIgJiYgdXNlci5yZXBvc3RTZXR0aW5ncykge1xyXG4gICAgICAgICAgZXZlbnQubGlrZSA9ICgodXNlci5yZXBvc3RTZXR0aW5ncy50cmFkZSAmJiB1c2VyLnJlcG9zdFNldHRpbmdzLnRyYWRlLmxpa2UpID8gdXNlci5yZXBvc3RTZXR0aW5ncy50cmFkZS5saWtlIDogZmFsc2UpO1xyXG4gICAgICAgICAgdmFyIHVzZXJUcmFkZUNvbW1lbnRzID0gKCh1c2VyLnJlcG9zdFNldHRpbmdzLnRyYWRlICYmIHVzZXIucmVwb3N0U2V0dGluZ3MudHJhZGUuY29tbWVudHMpID8gdXNlci5yZXBvc3RTZXR0aW5ncy50cmFkZS5jb21tZW50cyA6IFtdKTtcclxuICAgICAgICAgIGlmICh1c2VyVHJhZGVDb21tZW50cy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIGV2ZW50LmNvbW1lbnQgPSB1c2VyVHJhZGVDb21tZW50c1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiB1c2VyVHJhZGVDb21tZW50cy5sZW5ndGgpXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgICRodHRwLnBvc3QoJy9hcGkvZXZlbnRzL3JlcG9zdEV2ZW50cycsIGV2ZW50KTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgJGh0dHAucG9zdCgnL2FwaS9ldmVudHMvcmVwb3N0RXZlbnRzJywgZXZlbnQpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gZ2V0c2hvcnRkYXRlKGQpIHtcclxuICAgICAgICB2YXIgWVlZWSA9IGQuZ2V0RnVsbFllYXIoKTtcclxuICAgICAgICB2YXIgTSA9IGQuZ2V0TW9udGgoKSArIDE7XHJcbiAgICAgICAgdmFyIEQgPSBkLmdldERhdGUoKTtcclxuICAgICAgICB2YXIgTU0gPSAoTSA8IDEwKSA/ICgnMCcgKyBNKSA6IE07XHJcbiAgICAgICAgdmFyIEREID0gKEQgPCAxMCkgPyAoJzAnICsgRCkgOiBEO1xyXG4gICAgICAgIHZhciByZXN1bHQgPSBNTSArIFwiL1wiICsgREQgKyBcIi9cIiArIFlZWVk7XHJcbiAgICAgICAgcmV0dXJuIHJlc3VsdDtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmdldFByZXZpb3VzRXZlbnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLmxpc3REYXlJbmNyLS07XHJcbiAgICAgICAgdmFyIHBlcnNvbk51bSA9ICRzY29wZS5hY3RpdmVVc2VyLl9pZCA9PSAkc2NvcGUudHJhZGUucDEudXNlci5faWQgPyAncDEnIDogJ3AyJztcclxuICAgICAgICAkc2NvcGUuZ2V0TGlzdEV2ZW50cyhwZXJzb25OdW0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuZ2V0TmV4dEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS5saXN0RGF5SW5jcisrO1xyXG4gICAgICAgIHZhciBwZXJzb25OdW0gPSAkc2NvcGUuYWN0aXZlVXNlci5faWQgPT0gJHNjb3BlLnRyYWRlLnAxLnVzZXIuX2lkID8gJ3AxJyA6ICdwMic7XHJcbiAgICAgICAgJHNjb3BlLmdldExpc3RFdmVudHMocGVyc29uTnVtKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnRvZ2dsZVNsb3QgPSBmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgdmFyIHBlcnNvbk51bSA9ICRzY29wZS5hY3RpdmVVc2VyLl9pZCA9PSAkc2NvcGUudHJhZGUucDEudXNlci5faWQgPyAncDEnIDogJ3AyJztcclxuICAgICAgICAkc2NvcGUuY2xpY2tlZFNsb3QoaXRlbS5kYXRlLCB7fSwgaXRlbS5kYXRlLmdldEhvdXJzKCksIHt9LCAkc2NvcGUudHJhZGVbcGVyc29uTnVtXSwgaXRlbS5ldmVudCk7XHJcbiAgICAgICAgJHNjb3BlLmdldExpc3RFdmVudHMocGVyc29uTnVtKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmdldExpc3RFdmVudHMgPSBmdW5jdGlvbih1c2VyTnVtKSB7XHJcbiAgICAgICAgJHNjb3BlLmxpc3RFdmVudHMgPSBbXTtcclxuICAgICAgICB2YXIgY3VycmVudERhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgICAgIGN1cnJlbnREYXRlLnNldERhdGUoY3VycmVudERhdGUuZ2V0RGF0ZSgpICsgJHNjb3BlLmxpc3REYXlJbmNyKTtcclxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDc7IGkrKykge1xyXG4gICAgICAgICAgdmFyIGQgPSBuZXcgRGF0ZShjdXJyZW50RGF0ZSk7XHJcbiAgICAgICAgICBkLnNldERhdGUoZC5nZXREYXRlKCkgKyBpKTtcclxuICAgICAgICAgIHZhciBjdXJyZW50RGF5ID0gZC5nZXREYXkoKTtcclxuICAgICAgICAgIHZhciBzdHJEZGF0ZSA9IGdldHNob3J0ZGF0ZShkKTtcclxuICAgICAgICAgIHZhciBzbG90cyA9ICRzY29wZS50cmFkZVt1c2VyTnVtXS51c2VyLnBzZXVkb0F2YWlsYWJsZVNsb3RzWyRzY29wZS5kYXlzQXJyYXlbY3VycmVudERheV1dO1xyXG4gICAgICAgICAgc2xvdHMgPSBzbG90cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGEgLSBiXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChzbG90cywgZnVuY3Rpb24oaG91cikge1xyXG4gICAgICAgICAgICB2YXIgaXRlbSA9IG5ldyBPYmplY3QoKTtcclxuICAgICAgICAgICAgdmFyIGNhbGVuZGFyRGF5ID0gJHNjb3BlWydjYWxlbmRhcicgKyB1c2VyTnVtXS5maW5kKGZ1bmN0aW9uKGNhbEQpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gY2FsRC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gZC50b0xvY2FsZURhdGVTdHJpbmcoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHZhciBldmVudCA9IGNhbGVuZGFyRGF5LmV2ZW50cy5maW5kKGZ1bmN0aW9uKGV2KSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGV2LmRheSkuZ2V0SG91cnMoKSA9PSBob3VyO1xyXG4gICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgIGl0ZW0uZXZlbnQgPSAoZXZlbnQgPyBldmVudCA6IHtcclxuICAgICAgICAgICAgICB0eXBlOiAnZW1wdHknXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIHZhciBkdCA9IG5ldyBEYXRlKGQpO1xyXG4gICAgICAgICAgICBkdC5zZXRIb3Vycyhob3VyKTtcclxuICAgICAgICAgICAgaXRlbS5kYXRlID0gbmV3IERhdGUoZHQpO1xyXG4gICAgICAgICAgICBpZiAoaXRlbS5kYXRlID4gKG5ldyBEYXRlKCkuZ2V0VGltZSgpICsgMjQgKiAzNjAwMDAwKSlcclxuICAgICAgICAgICAgICAkc2NvcGUubGlzdEV2ZW50cy5wdXNoKGl0ZW0pO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICghJHNjb3BlLiQkcGhhc2UpICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmdldFVucmVwb3N0RGF0ZSA9IGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICByZXR1cm4gbmV3IERhdGUoaXRlbS5kYXRlLmdldFRpbWUoKSArIDQ4ICogNjAgKiA2MCAqIDEwMDApXHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5nZXRTdHlsZSA9IGZ1bmN0aW9uKGV2ZW50LCBkYXRlLCBkYXksIGhvdXIpIHtcclxuICAgICAgICB2YXIgc3R5bGUgPSB7XHJcbiAgICAgICAgICAnYm9yZGVyLXJhZGl1cyc6ICc0cHgnLFxyXG4gICAgICAgICAgJ2JvcmRlci13aWR0aCc6ICcxcHgnXHJcbiAgICAgICAgfTtcclxuICAgICAgICB2YXIgY3VycmVudERheSA9IG5ldyBEYXRlKGRhdGUpLmdldERheSgpO1xyXG4gICAgICAgIHZhciBkYXRlID0gKG5ldyBEYXRlKGRhdGUpKS5zZXRIb3Vycyhob3VyKVxyXG4gICAgICAgIGlmICgkc2NvcGUuYWN0aXZlVXNlci5wc2V1ZG9BdmFpbGFibGVTbG90c1skc2NvcGUuZGF5c0FycmF5W2N1cnJlbnREYXldXSAmJiAkc2NvcGUuYWN0aXZlVXNlci5wc2V1ZG9BdmFpbGFibGVTbG90c1skc2NvcGUuZGF5c0FycmF5W2N1cnJlbnREYXldXS5pbmRleE9mKGhvdXIpID4gLTEgJiYgZGF0ZSA+IChuZXcgRGF0ZSgpLmdldFRpbWUoKSArIDI0ICogMzYwMDAwMCkgJiYgKGV2ZW50LnR5cGUgPT0gJ2VtcHR5JyB8fCBldmVudC50eXBlID09ICd0cmFkZScpICYmICEoJHNjb3BlLmFjdGl2ZVVzZXIuYmxvY2tSZWxlYXNlICYmIG5ldyBEYXRlKCRzY29wZS5hY3RpdmVVc2VyLmJsb2NrUmVsZWFzZSkuZ2V0VGltZSgpID4gZGF0ZSkpIHtcclxuICAgICAgICAgIHN0eWxlID0ge1xyXG4gICAgICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6ICcjZmZmJyxcclxuICAgICAgICAgICAgJ2JvcmRlci1jb2xvcic6IFwiIzk5OVwiLFxyXG4gICAgICAgICAgICAnYm9yZGVyLXdpZHRoJzogJzFweCcsXHJcbiAgICAgICAgICAgICdib3JkZXItcmFkaXVzJzogJzRweCdcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHN0eWxlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuZ2V0RXZlbnRTdHlsZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgaWYgKGV2ZW50ICYmIGV2ZW50LnR5cGUgPT0gJ3RyYWRlJykge1xyXG4gICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgJ2JhY2tncm91bmQtY29sb3InOiAnI0ZGRDQ1MCcsXHJcbiAgICAgICAgICAgICdoZWlnaHQnOiAnMThweCcsXHJcbiAgICAgICAgICAgICdtYXJnaW4nOiAnMnB4JyxcclxuICAgICAgICAgICAgJ2JvcmRlci1yYWRpdXMnOiAnNHB4J1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm4ge31cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5kYXlPZldlZWtBc1N0cmluZyA9IGZ1bmN0aW9uKGRhdGUpIHtcclxuICAgICAgICB2YXIgZGF5SW5kZXggPSBkYXRlLmdldERheSgpO1xyXG4gICAgICAgIHJldHVybiBbXCJTdW5kYXlcIiwgXCJNb25kYXlcIiwgXCJUdWVzZGF5XCIsIFwiV2VkbmVzZGF5XCIsIFwiVGh1cnNkYXlcIiwgXCJGcmlkYXlcIiwgXCJTYXR1cmRheVwiXVtkYXlJbmRleF07XHJcblxyXG4gICAgICB9XHJcblxyXG5cclxuICAgICAgJHNjb3BlLnVucmVwb3N0U3ltYm9sID0gZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICBpZiAoIWV2ZW50LnVucmVwb3N0RGF0ZSkgcmV0dXJuO1xyXG4gICAgICAgIGV2ZW50LnVucmVwb3N0RGF0ZSA9IG5ldyBEYXRlKGV2ZW50LnVucmVwb3N0RGF0ZSk7XHJcbiAgICAgICAgcmV0dXJuIGV2ZW50LnVucmVwb3N0RGF0ZSA+IG5ldyBEYXRlKCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5zaG93Qm94SW5mbyA9IGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgcmV0dXJuIChldmVudC50eXBlID09ICd0cmFkZScgfHwgZXZlbnQudHlwZSA9PSAndHJhZGVkJylcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmZvbGxvd2VyU2hvdyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHJldHVybiAoc2NyZWVuLndpZHRoID4gJzQzNicpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUudXBkYXRlRW1haWwgPSBmdW5jdGlvbihlbWFpbCkge1xyXG4gICAgICAgIHZhciBhbnN3ZXIgPSBlbWFpbDtcclxuICAgICAgICB2YXIgbXlBcnJheSA9IGFuc3dlci5tYXRjaCgvW2EtelxcLl9cXC0hIyQlJicrLz0/Xl9ge318fl0rQFthLXowLTlcXC1dK1xcLlxcU3syLDN9L2lnbSk7XHJcbiAgICAgICAgaWYgKG15QXJyYXkpIHtcclxuICAgICAgICAgICRzY29wZS51c2VyLmVtYWlsID0gYW5zd2VyO1xyXG4gICAgICAgICAgcmV0dXJuICRodHRwLnB1dCgnL2FwaS9kYXRhYmFzZS9wcm9maWxlJywgJHNjb3BlLnVzZXIpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZShyZXMuZGF0YSk7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLmhpZGVhbGwgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAkKCcjZW1haWxNb2RhbCcpLm1vZGFsKCdoaWRlJyk7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnNob3dFbWFpbE1vZGFsID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2hvd0VtYWlsTW9kYWwgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5wcm9tcHRGb3JFbWFpbCgpO1xyXG4gICAgICAgICAgICAgIH0sIDYwMCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5zaG93RW1haWxNb2RhbCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvbXB0Rm9yRW1haWwoKTtcclxuICAgICAgICAgIH0sIDYwMCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUucHJvbXB0Rm9yRW1haWwgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoISRzY29wZS51c2VyLmVtYWlsKSB7XHJcbiAgICAgICAgICAkc2NvcGUuc2hvd0VtYWlsTW9kYWwgPSB0cnVlO1xyXG4gICAgICAgICAgJCgnI2VtYWlsTW9kYWwnKS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICAkc2NvcGUudmVyaWZ5QnJvd3NlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmIChuYXZpZ2F0b3IudXNlckFnZW50LnNlYXJjaChcIkNocm9tZVwiKSA9PSAtMSAmJiBuYXZpZ2F0b3IudXNlckFnZW50LnNlYXJjaChcIlNhZmFyaVwiKSAhPSAtMSkge1xyXG4gICAgICAgICAgdmFyIHBvc2l0aW9uID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5zZWFyY2goXCJWZXJzaW9uXCIpICsgODtcclxuICAgICAgICAgIHZhciBlbmQgPSBuYXZpZ2F0b3IudXNlckFnZW50LnNlYXJjaChcIiBTYWZhcmlcIik7XHJcbiAgICAgICAgICB2YXIgdmVyc2lvbiA9IG5hdmlnYXRvci51c2VyQWdlbnQuc3Vic3RyaW5nKHBvc2l0aW9uLCBlbmQpO1xyXG4gICAgICAgICAgaWYgKHBhcnNlSW50KHZlcnNpb24pIDwgOSkge1xyXG4gICAgICAgICAgICAkLlplYnJhX0RpYWxvZygnWW91IGhhdmUgb2xkIHZlcnNpb24gb2Ygc2FmYXJpLiBDbGljayA8YSBocmVmPVwiaHR0cHM6Ly9zdXBwb3J0LmFwcGxlLmNvbS9kb3dubG9hZHMvc2FmYXJpXCI+aGVyZTwvYT4gdG8gZG93bmxvYWQgdGhlIGxhdGVzdCB2ZXJzaW9uIG9mIHNhZmFyaSBmb3IgYmV0dGVyIHNpdGUgZXhwZXJpZW5jZS4nLCB7XHJcbiAgICAgICAgICAgICAgJ3R5cGUnOiAnY29uZmlybWF0aW9uJyxcclxuICAgICAgICAgICAgICAnYnV0dG9ucyc6IFt7XHJcbiAgICAgICAgICAgICAgICBjYXB0aW9uOiAnT0snXHJcbiAgICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgICAgJ29uQ2xvc2UnOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiaHR0cHM6Ly9zdXBwb3J0LmFwcGxlLmNvbS9kb3dubG9hZHMvc2FmYXJpXCI7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICRzY29wZS5wcm9tcHRGb3JFbWFpbCgpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAkc2NvcGUucHJvbXB0Rm9yRW1haWwoKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5yZW1pbmRUcmFkZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICQoJyNwb3AnKS5tb2RhbCgnc2hvdycpO1xyXG4gICAgICB9XHJcbiAgICAgICRzY29wZS52ZXJpZnlCcm93c2VyKCk7XHJcbiAgICAgICRzY29wZS5jaGVja05vdGlmaWNhdGlvbigpO1xyXG4gICAgfVxyXG4gIH1cclxufSk7XHJcbiJdLCJmaWxlIjoiY29tbW9uL2RpcmVjdGl2ZXMvcmZySW50ZXJhY3Rpb24vcmZySW50ZXJhY3Rpb24uanMifQ==
