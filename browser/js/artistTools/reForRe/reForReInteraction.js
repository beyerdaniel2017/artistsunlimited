app.config(function($stateProvider) {
  $stateProvider
    .state('reForReInteraction', {
      url: '/artistTools/reForReInteraction/:tradeID',
      templateUrl: 'js/artistTools/reForRe/reForReInteraction.html',
      controller: 'ReForReInteractionController',
      resolve: {
        trade: function($http, $stateParams, $window, SessionService) {
          if (!SessionService.getUser()) {
            $window.localStorage.setItem('returnstate', 'reForReInteraction');
            $window.localStorage.setItem('tid', $stateParams.tradeID);
            $window.location.href = '/login';
          }
          return $http.get('/api/trades/byID/' + $stateParams.tradeID)
            .then(function(res) {
              return res.data;
            })
        },
        p1Events: function($http, trade) {
          return $http.get('/api/events/forUser/' + trade.p1.user.soundcloud.id)
            .then(function(res) {
              return res.data;
            })
            .then(null, function(err) {
              $.Zebra_Dialog("error getting your events");
              return;
            })
        },
        p2Events: function($http, trade) {
          return $http.get('/api/events/forUser/' + trade.p2.user.soundcloud.id)
            .then(function(res) {
              return res.data;
            })
            .then(null, function(err) {
              $.Zebra_Dialog("error getting other's events events");
              return;
            })
        },
        currentTrades: function($http, SessionService) {
          var user = SessionService.getUser();
          return $http.get('/api/trades/withUser/' + user._id)
            .then(function(res) {
              var trades = res.data;
              trades.forEach(function(trade) {
                trade.other = (trade.p1.user._id == user._id) ? trade.p2 : trade.p1;
                trade.user = (trade.p1.user._id == user._id) ? trade.p1 : trade.p2;
              });
              trades.sort(function(a, b) {
                if (a.user.alert == "change") {
                  return -1;
                } else if (a.user.alert == "placement") {
                  return -1
                } else {
                  return 1;
                }
              })
              return trades;
            })
        }
      },
      onExit: function($http, $stateParams, SessionService, socket) {
        $http.put('/api/trades/offline', {
          tradeID: $stateParams.tradeID
        });
        socket.disconnect();
      }
    })
});

app.controller("ReForReInteractionController", function($rootScope, $state, $scope, $http, AuthService, $window, SessionService, socket, $stateParams, trade, p1Events, p2Events, currentTrades) {
  $scope.user = SessionService.getUser();
  if (!SessionService.getUser()) {
    $state.go('login');
  } else {
    $window.localStorage.removeItem('returnstate');
    $window.localStorage.removeItem('tid');
  }
  $scope.processing = false;
  socket.connect();
  $scope.msgHistory = [];
  $scope.makeEventURL = "";
  $scope.showOverlay = false;
  $scope.processiong = false;
  $scope.hideall = false;
  $scope.trade = trade;
  $scope.p1Events = p1Events;
  $scope.p2Events = p2Events;
  $scope.currentTrades = currentTrades;
  $scope.tradeIndex = currentTrades.findIndex(function(el) {
    return el._id == $scope.trade._id;
  });
  var person = $scope.trade.p1.user._id == $scope.user._id ? $scope.trade.p1 : $scope.trade.p2;
  $scope.user.accepted = person.accepted;
  $scope.p1dayIncr = 0;
  $scope.p2dayIncr = 0;

  $scope.trackList = [];

  $scope.trackListChange = function(index) {
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
          $scope.$apply();
        })
        .catch(function(response) {
          $scope.processing = false;
          $scope.$apply();
        });
    }
  }

  $scope.getSchedulerID = function(uid) {
    return ((uid == $scope.user._id) ? "scheduler-left" : "scheduler-right");
  }

  $scope.user.accepted = $scope.trade.p1.user._id == $scope.user._id ? $scope.trade.p1.accepted : $scope.trade.p2.accepted;
  $scope.curTrade = JSON.stringify($.grep($scope.currentTrades, function(e) {
    return e._id == $scope.trade._id;
  }));

  $scope.refreshCalendar = function() {
    $scope.user = SessionService.getUser();
    $http.get('/api/trades/getTradeData/' + $stateParams.tradeID)
      .then(function(res) {
        $scope.trade = res.data.trade;
        $scope.p2Events = res.data.p2Events;
        $scope.p1Events = res.data.p1Events;
        var trds = res.data.userTrades;
        trds.forEach(function(trade) {
          trade.other = (trade.p1.user._id == $scope.user._id) ? trade.p2 : trade.p1;
          trade.user = (trade.p1.user._id == $scope.user._id) ? trade.p1 : trade.p2;

        });
        $scope.currentTrades = trds;
        $scope.user.accepted = $scope.trade.p1.user._id == $scope.user._id ? $scope.trade.p1.accepted : $scope.trade.p2.accepted;
        $scope.tradeIndex = currentTrades.findIndex(function(el) {
          return el._id == $scope.trade._id;
        });
        $scope.fillCalendar();
        $scope.updateAlerts();
        $scope.processing = false;
      })
      .then(null, function(err) {
        $scope.processing = false;
        $.Zebra_Dialog('Error getting data.');
      })
  }

  $scope.incrp1 = function(inc) {
    if ($scope.p1dayIncr < 21) $scope.p1dayIncr++;
  }
  $scope.decrp1 = function(inc) {
    if ($scope.p1dayIncr > 0) $scope.p1dayIncr--;
  }
  $scope.incrp2 = function(inc) {
    if ($scope.p2dayIncr < 21) $scope.p2dayIncr++;
  }
  $scope.decrp2 = function(inc) {
    if ($scope.p2dayIncr > 0) $scope.p2dayIncr--;
  }

  $scope.changeURL = function() {
    if($scope.makeEvent.URL != ""){
    $scope.processing = true;
    $http.post('/api/soundcloud/resolve', {
        url: $scope.makeEvent.URL
      })
      .then(function(res) {
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
      }).then(null, function(err) {
        $.Zebra_Dialog("We are not allowed to access tracks by this artist with the Soundcloud API. We apologize for the inconvenience, and we are working with Soundcloud to resolve this issue.");
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

  $scope.changeTrade = function(index) {
    console.log(index);
    $state.go('reForReInteraction', {
      tradeID: $scope.currentTrades[index]._id
    })
  }

  $scope.backEvent = function() {
    $scope.makeEvent = undefined;
    $scope.showOverlay = false;
  }

  $scope.deleteEvent = function() {
    $scope.makeEvent.person.slots = $scope.makeEvent.person.slots.filter(function(slot, index) {
      return !(moment(slot.day).format('LLL') == moment($scope.makeEvent.day).format('LLL'));
    });
    $scope.trade.p1.accepted = $scope.trade.p2.accepted = false;
    $scope.processing = true;
    $http.put('/api/trades', $scope.trade)
      .then(function(res) {
        $scope.showOverlay = false;
        $scope.trade = res.data;
        $scope.emitMessage("REMOVED SLOT from " + $scope.makeEvent.person.user.soundcloud.username + " for " + moment($scope.makeEvent.day).format('LLL'), 'alert');
        //$scope.processing = false;
      })
      .then(null, function(err) {
        $scope.showOverlay = false;
        $scope.processing = false;
        $.Zebra_Dialog('Error deleting.');
      })
  }

  $scope.saveEvent = function() {
    if (!$scope.unrepostOverlap()) {
      $scope.processing = true;
      if ($scope.makeEvent.type == 'traded') {
        var req = new Promise(function(resolve, reject) {
          if ($scope.makeEvent._id) $http.put('/api/events/repostEvents', $scope.makeEvent).then(resolve, reject);
          else $http.post('/api/events/repostEvents', $scope.makeEvent).then(resolve, reject);
        })
        req
          .then(function(res) {
            //$scope.processing = false;
            $scope.showOverlay = false;
            $scope.refreshCalendar();
          })
          .then(null, function(err) {
            $scope.processing = false;
            $.Zebra_Dialog('Error saving.');
          })
      } else if ($scope.makeEvent.type == 'trade') {
        $scope.makeEvent.person.slots = $scope.makeEvent.person.slots.filter(function(slot, index) {
          return !(moment(slot.day).format('LLL') === moment($scope.makeEvent.day).format('LLL'));
        });
        $scope.makeEvent.person.slots.push($scope.makeEvent);
        var alertMessage = "CHANGED SLOT on " + $scope.makeEvent.person.user.soundcloud.username + " on " + moment($scope.makeEvent.day).format('LLL')
        $scope.makeEvent.person = undefined;
        $scope.trade.p1.accepted = $scope.trade.p2.accepted = false;
        $http.put('/api/trades', $scope.trade)
          .then(function(res) {
            //$scope.processing = false;
            $scope.showOverlay = false;
            $scope.trade = res.data;
            $scope.emitMessage(alertMessage, 'alert');
          })
          .then(null, function(err) {
            $scope.processing = false;
            $.Zebra_Dialog('Error with request');
          })
      }
    } else {
      $.Zebra_Dialog('Issue! This repost will cause the to be both unreposted and reposted within a 24 hour time period. If you are unreposting, please allow 48 hours between scheduled reposts.');
    }
  }

  $scope.emailSlot = function() {
    var mailto_link = "mailto:?subject=Repost of " + $scope.makeEvent.title + '&body=Hey,\n\n I am reposting your song ' + $scope.makeEvent.title + ' on ' + $scope.makeEventAccount.username + ' on ' + $scope.makeEvent.day.toLocaleDateString() + '.\n\n Best, \n' + $scope.user.soundcloud.username;
    location.href = encodeURI(mailto_link);
  }

  $scope.setUpAndOpenMakeEvent = function(event, person) {
    $scope.showOverlay = true;
    $scope.makeEvent = JSON.parse(JSON.stringify(event));
    $scope.makeEvent.trackListObj = null;
    $scope.makeEvent.day = new Date($scope.makeEvent.day);
    if ($scope.makeEvent.unrepostDate) $scope.makeEvent.unrepostDate = new Date($scope.makeEvent.unrepostDate);
    if ($scope.makeEvent.unrepostDate > new Date()) {
      $scope.makeEvent.unrepostDate = new Date($scope.makeEvent.unrepostDate);
      $scope.makeEvent.unrepost = true;
    } else {
      $scope.makeEvent.unrepostDate = new Date(0);
      $scope.makeEvent.unrepost = false;
    }
    $scope.makeEvent.person = person;
    $scope.makeEvent.URL = $scope.makeEvent.trackURL;
    SC.oEmbed($scope.makeEvent.trackURL, {
      element: document.getElementById('scPlayer'),
      auto_play: false,
      maxheight: 150
    });
  }

  $scope.changeUnrepost = function() {
    if ($scope.makeEvent.unrepost) {
      $scope.makeEvent.day = new Date($scope.makeEvent.day);
      $scope.makeEvent.unrepostDate = new Date($scope.makeEvent.day.getTime() + 24 * 60 * 60 * 1000);
    } else {
      $scope.makeEvent.unrepostDate = new Date(0);
    }
  }

  $scope.clickedSlot = function(day, dayOffset, hour, calendar, person, event) {
    if ($scope.user.accepted) {
      $.Zebra_Dialog("You can't make changes to this trade because you already accepted it. You will be able to make changes if the other person makes a change.");
      return;
    }
    var makeDay = new Date(day);
    makeDay.setHours(hour, 30, 0, 0);
    if (makeDay < new Date()) {
      $.Zebra_Dialog('Timeslot has passed.');
      return;
    }

    switch (event.type) {
      case 'queue':
      case 'track':
        $.Zebra_Dialog('Cannot manage this time slot.');
        return;
        break;

      case 'empty':

        var calEvent = {
          type: "trade",
          day: makeDay,
          userID: person.user.soundcloud.id,
          unrepostDate: new Date(makeDay.getTime() + 24 * 60 * 60 * 1000)
        };
        $scope.setUpAndOpenMakeEvent(calEvent, person);
        break;

      case 'trade':
        $scope.setUpAndOpenMakeEvent(event, person);
        break;

      case 'traded':
        if (event.owner == $scope.user._id) {
          $scope.setUpAndOpenMakeEvent(event, person);
        } else {
          $.Zebra_Dialog('Cannot manage this time slot.');
          return;
        }
        break;
    }
  }

  $scope.email = function() {
    var otherUser = $scope.trade.p1.user._id == $scope.user._id ? $scope.trade.p2.user : $scope.trade.p1.user;
    var mailto_link = "mailto:" + otherUser.email + "?subject=Repost for repost with " + $scope.user.soundcloud.username + '&body=Hey ' + otherUser.soundcloud.username + ',\n\n Repost for repost? I scheduled a trade here! -> ArtistsUnlimited.co/login\n\nBest,\n' + $scope.user.soundcloud.username;
    location.href = encodeURI(mailto_link);
  }

  $scope.accept = function() {
      if ($scope.trade.p1.user._id == $scope.user._id) {
        var accString = $scope.trade.p2.accepted ? "If you accept, the trade will be made. You will have the right to schedule the slots you are trading for, and the other person will have rights to the slots you are trading with." : "If you click accept, you will not be able to make changes to the trade being negotiated. If the other person makes a change, you will then be given the right to make changes and accept those changes again. If the other person also accepts, the trade will be made.";
      } else {
        var accString = $scope.trade.p1.accepted ? "If you accept, the trade will be made. You will have the right to schedule the slots you are trading for, and the other person will have rights to the slots you are trading with." : "If you click accept, you will not be able to make changes to the trade being negotiated. If the other person makes a change, you will then be given the right to make changes and accept those changes again. If the other person also accepts, the trade will be made.";
      }
      $.Zebra_Dialog(accString, {
        'type': 'confirmation',
        'buttons': [{
          caption: 'Accept',
          callback: function() {
            if ($scope.user.queue && $scope.user.queue.length == 0) {
              $('#autoFillTrack').modal('show');
            } else {
              $scope.user.accepted = true;
              if ($scope.trade.p1.user._id == $scope.user._id) {
                $scope.trade.p1.accepted = true;
              } else {
                $scope.trade.p2.accepted = true;
              }
              $scope.processing = true;
              $http.put('/api/trades', $scope.trade)
                .then(function(res) {
                  $scope.processing = false;
                  $scope.trade = res.data;
                  if ($scope.trade.p1.accepted && $scope.trade.p2.accepted) $scope.completeTrade();
                  else $scope.emitMessage('---- ' + $scope.user.soundcloud.username + " accepted the trade ----", 'alert');
                })
                .then(null, function(err) {
                  $scope.processing = false;
                  $.Zebra_Dialog('Error accepting');
                })
            }
          }
        }, {
          caption: 'Cancel',
          callback: function() {
            console.log('No was clicked');
          }
        }]
      });
    }
    //overlay autofill track start//

  $scope.autoFillTracks = [];
  $scope.trackList = [];
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
    if($scope.newQueueSong != ""){
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
    //overlay autofill track end//
  $scope.dayOfWeekAsString = function(date) {
    var dayIndex = date.getDay();
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex];
  }

  socket.on('init', function(data) {
    $scope.name = data.name;
    $scope.users = data.users;
  });

  socket.on('send:message', function(message) {
    if (message.tradeID == $stateParams.tradeID) {
      $scope.msgHistory.push(message);
      $scope.message = message.message;
      $scope.trade.messages.push(message);
      if (message.type == "alert") {
        $scope.refreshCalendar();
      }
    }
  });

  socket.on('get:message', function(data) {
    if (data != '') {
      if (data._id == $stateParams.tradeID) {
        $scope.msgHistory = data ? data.messages : [];
      }
    }
  });

  $scope.emitMessage = function(message, type) {
    // if($scope.trade.p1.user._id == $scope.user._id && $scope.trade.p2.online == false){
    //   $scope.trade.p2.alert = "change";
    // } else if ($scope.trade.p2.user._id == $scope.user._id && $scope.trade.p1.online == false) {
    //   $scope.trade.p1.alert = "change";
    // }  
    socket.emit('send:message', {
      message: message,
      type: type,
      id: $scope.user._id,
      tradeID: $stateParams.tradeID
    });
    $scope.message = '';
  }

  $scope.getMessage = function() {
    socket.emit('get:message', $stateParams.tradeID);
  }

  $scope.fillDateArrays = function(events, slots) {
    var calendar = [];
    var today = new Date();
    for (var i = 0; i < 29; i++) {
      var calDay = {};
      calDay.day = new Date()
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
    var op1String = JSON.stringify($scope.trade.p1.slots);
    var lastString = op1String;
    do {
      lastString = op1String;
      $scope.trade.p1.slots.forEach(function(slot) {
        if (slot.day < now) {
          slot.day.setHours(now.getHours() + Math.floor(Math.random() * 10) + 14);
          change = true;
        }
      });
      $scope.p1Events.forEach(function(event) {
        $scope.trade.p1.slots.forEach(function(slot) {
          if (slot.day.toLocaleDateString() == event.day.toLocaleDateString() && slot.day.getHours() == event.day.getHours()) {
            slot.day.setHours(slot.day.getHours() + Math.floor(Math.random() * 10) + 1);
            change = true;
          }
        })
      })
      op1String = JSON.stringify($scope.trade.p1.slots);
    } while (op1String != lastString);

    var op2String = JSON.stringify($scope.trade.p2.slots)
    do {
      lastString = op2String;
      $scope.trade.p2.slots.forEach(function(slot) {
        if (slot.day < now) {
          slot.day.setHours(now.getHours() + Math.floor(Math.random() * 10) + 14);
          change = true;
        }
      });
      $scope.p2Events.forEach(function(event) {
        $scope.trade.p2.slots.forEach(function(slot) {
          if (slot.day.toLocaleDateString() == event.day.toLocaleDateString() && slot.day.getHours() == event.day.getHours()) {
            slot.day.setHours(slot.day.getHours() + Math.floor(Math.random() * 10) + 1);
            change = true;
          }
        })
      })
      op2String = JSON.stringify($scope.trade.p2.slots);
    } while (op2String != lastString);

    if (change) {
      $scope.trade.p1.accepted = $scope.trade.p2.accepted = false;
      $scope.processing = true;
      $http.put('/api/trades', $scope.trade)
        .then(function(res) {
          $scope.processing = false;
          $scope.trade = res.data;
          $scope.fillCalendar();
          $scope.emitMessage("MOVED OVERLAPPED SLOTS", 'alert');
        })
        .then(null, function(err) {
          window.location.reload()
        })
    } else {
      $scope.calendarp1 = $scope.fillDateArrays($scope.p1Events, $scope.trade.p1.slots);
      $scope.calendarp2 = $scope.fillDateArrays($scope.p2Events, $scope.trade.p2.slots);
    }
  }
  $scope.fillCalendar();

  $scope.updateAlerts = function() {
    if ($scope.trade.p1.user._id == $scope.user._id) {
      $scope.trade.p1.alert = "none";
      $scope.trade.p1.online = true;
    }

    if ($scope.trade.p2.user._id == $scope.user._id) {
      $scope.trade.p2.alert = "none";
      $scope.trade.p2.online = true;
    }
    $scope.$parent.shownotification = false;
    $http.put('/api/trades', $scope.trade);
  }

  $scope.completeTrade = function() {
    $scope.processing = true;
    $scope.trade.p1.slots.forEach(function(slot) {
      var event = slot;
      event.type = 'traded';
      event.owner = $scope.trade.p2.user._id
      $http.post('/api/events/repostEvents', event);
    })
    $scope.trade.p2.slots.forEach(function(slot) {
      var event = slot;
      event.type = 'traded';
      event.owner = $scope.trade.p1.user._id
      $http.post('/api/events/repostEvents', event);
    })
    $scope.trade.p1.accepted = $scope.trade.p2.accepted = false;
    $scope.trade.p1.slots = $scope.trade.p2.slots = [];
    $http.put('/api/trades', $scope.trade)
      .then(function(res) {
        setTimeout(function() {
          $scope.emitMessage('---- ' + $scope.user.soundcloud.username + " accepted the trade ----", 'alert');
          setTimeout(function() {
            $scope.processing = false;
            $scope.emitMessage("TRADE COMPLETED", 'alert');
          }, 500)
        }, 1500)

      })
      .then(null, console.log);
  }

  $scope.getStyle = function(event) {
    if (event.type == 'empty') {
      return {}
    } else if (event.type == 'trade') {
      return {
        'background-color': '#ADD8E6'
      }
    } else if (event.type == 'track' || event.type == 'queue' || event.type == 'paid') {
      return {
        'background-color': '#eeeeee',
        'color': 'rgba(0,0,0,0)'
      }
    } else if (event.type == 'traded') {
      if (event.owner == $scope.user._id) {
        return {
          'background-color': '#FFE1AB'
        }
      } else {
        return {
          'background-color': '#eeeeee',
          'color': 'rgba(0,0,0,0)'
        }
      }
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
    return (event.type == 'trade' || event.type == 'traded' && event.owner == $scope.user._id)
  }

  $scope.followerShow = function() {
    return (screen.width > '436');
  }

  function promptForEmail() {
    if (!$scope.user.email) {
      $scope.hideall = true;
      $.Zebra_Dialog('Please enter your email. To use the repost scheduling tools, we need your email to alert you when your soundcloud access token expires.<br><br> <input id="txtremail" type="email" placeholder="example@domain.com" style="width:400px; border-radius:3px;padding:5px"/>', {
        'type': 'confirmation',
        width: 600,
        'buttons': [{
          caption: 'OK',
          callback: function() {
            var answer = $("#txtremail").val();
            if (answer == "") {
              $state.go('artistToolsDownloadGatewayList');
            } else {
              var myArray = answer.match(/[a-z\._\-!#$%&'+/=?^_`{}|~]+@[a-z0-9\-]+\.\S{2,3}/igm);
              if (myArray) {
                $scope.user.email = answer;
                return $http.put('/api/database/profile', $scope.user)
                  .then(function(res) {
                    SessionService.create(res.data);
                    $scope.user = SessionService.getUser();
                    $scope.hideall = false;
                  })
                  .then(null, function(err) {
                    $.Zebra_Dialog("Error saving.");
                    setTimeout(function() {
                      promptForEmail();
                    }, 600);
                  })
              } else {
                setTimeout(function() {
                  promptForEmail();
                }, 600);
              }
            }
          }
        }],
      });
    }
  }
  $scope.openHelpModal = function() {
    var displayText = "This interface shows your scheduler and the scheduler for the user you are trading with, labeled on the top of each respective schedule. Your calendar will always be on the left.<br/><br/><img src='assets/images/grey-slot.png'/> Grey slots represents slots that are already taken.<br><br/><img src='assets/images/blue-slot.png'/>  Blue slots represent slots that are being bargained in the trade.<br/><br/><img src='assets/images/arrow-slot.png'/>  An Arrow within a slot means it will be unreposted after 24 hours.<br/><br>The chat window on the bottom allows you to chat with your Repost Partner about your trade.<br/>Email will automatically open a new email on your mailing app, allowing you to message your repost partner via email for your trade.<br/><br/>How to use AU's Repost for Repost System:<br/>1. Start by deciding how you would like to trade with your partner.<br/>2. Mark slots on your calendar and mark slots on your partners calendar.<br/>3. Click accept<br/><br/>When your partner returns to AU, he will be able to accept your trade. If accepted, you will be able to schedule reposts on the slots designated on your partner’s calendar; your partner will be able to schedule reposts on the slots designated on your calendar. If you are away from keyboard at the time of your trade, tracks that are in your 'auto-fill' queue (hyperlink to autofill queu) in the scheduler will automatically be scheduled for repost.<br/><br/>Tips:<br/>1. Make sure you are fair with your trades. If you have half as many followers as your partner, offer 2 reposts on your calendar in exchange for 1 repost on theirs.<br />2. Make sure you check your trades on a regular basis. People are much more likely to constantly trade reposts with you if you are reliable.<br />3. Try communicating with the user on Facebook, Email, SoundCloud messenger or any messaging app to make sure they take action on trades when it is their turn. A friendly 'Hey, let me know when you accept the trade on AU! Thanks again for trading with me :)' is enough to ensure a good flow of communication for your trades!";
    $.Zebra_Dialog(displayText, {
      width: 900
    });
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
        promptForEmail();
      }
    } else {
      promptForEmail();
    }
  }

  $scope.updateAlerts();
  $scope.verifyBrowser();
});


app.directive('timeSlot', function(moment) {
  return {
    restrict: 'E',
    scope: {
      startDate: "@",
      eachDate: '@',
      previousDate: '@'
    },
    link: function(scope, element, attrs) {
      Date.prototype.addHours = function(h) {
        this.setHours(this.getHours() + h);
        return this;
      };

      var dateObj = {
        startDate: new Date(scope.startDate),
        eachDate: new Date(scope.eachDate),
        previousDate: (scope.previousDate) ? new Date(scope.previousDate) : null
      };
      var prevDate = (dateObj.previousDate) ? dateObj.previousDate.toLocaleString().split(',')[0] : null;
      var eacDate = (dateObj.eachDate) ? dateObj.eachDate.toLocaleString().split(',')[0] : null;
      var prvHours = (dateObj.previousDate) ? dateObj.previousDate.getHours() : 0;
      var echHours = (dateObj.eachDate) ? dateObj.eachDate.getHours() : 0;
      if (!prevDate) {
        scope.slot = isTodayDate(dateObj.previousDate, dateObj.eachDate) + ' ' + formatAMPM(dateObj.eachDate);
      } else if ((prevDate != eacDate) && (prvHours != echHours)) {
        scope.slot = isTodayDate(dateObj.previousDate, dateObj.eachDate) + ' ' + formatAMPM(dateObj.eachDate);
      } else if ((prevDate == eacDate) && (prvHours != echHours)) {
        scope.slot = isTodayDate(dateObj.previousDate, dateObj.eachDate) + ' ' + formatAMPM(dateObj.eachDate);
      } else if ((prevDate != eacDate) && (prvHours == echHours)) {
        scope.slot = isTodayDate(dateObj.previousDate, dateObj.eachDate) + ' ' + formatAMPM(dateObj.eachDate);
      }
    },
    replace: 'true',
    template: '<p class="time">{{slot}}</p>'
  };

  function isTodayDate(prevDate, eacDate) {
    if ((moment().format('MM-DD-YYYY') == moment(prevDate).format('MM-DD-YYYY')) || (moment().format('MM-DD-YYYY') == moment(eacDate).format('MM-DD-YYYY'))) {
      return 'Today, ';
    } else {
      return moment(eacDate).format('MMMM DD YYYY, ');
    }
  }

  function formatAMPM(date) {
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }
});