app.config(function($stateProvider) {
  $stateProvider
    .state('reForReInteraction', {
      url: '/artistTools/reForReInteraction/:tradeID',
      templateUrl: 'js/artistTools/reForRe/reForReInteraction.html',
      controller: 'ReForReInteractionController',
      resolve: {
        trade: function($http, $stateParams) {
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
        }
      },
      onExit: function(socket) {
        socket.disconnect();
      }
    })
});

app.controller("ReForReInteractionController", function($rootScope, $state, $scope, $http, AuthService, $window, p1Events, p2Events, trade, SessionService, socket, $stateParams) {
  if (!SessionService.getUser()) {
    $state.go('login');
  }
  $scope.processing = false;
  socket.connect();
  $scope.trade = trade;
  $scope.user = SessionService.getUser();
  var person = $scope.trade.p1.user._id == $scope.user._id ? $scope.trade.p1 : $scope.trade.p2;
  $scope.user.accepted = person.accepted;
  $scope.msgHistory = [];
  $scope.makeEventURL = "";
  $scope.showOverlay = false;
  $scope.processiong = false;
  $scope.hideall = false;
  $scope.p1dayIncr = 0;
  $scope.p2dayIncr = 0;

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
    $scope.processing = true;
    $http.post('/api/soundcloud/resolve', {
        url: $scope.makeEventURL
      })
      .then(function(res) {
        $scope.makeEvent.trackID = res.data.id;
        $scope.makeEvent.title = res.data.title;
        $scope.makeEvent.trackURL = res.data.trackURL;
        if (res.data.user) $scope.makeEvent.artistName = res.data.user.username;
        SC.oEmbed($scope.makeEventURL, {
          element: document.getElementById('scPlayer'),
          auto_play: false,
          maxheight: 150
        })
        document.getElementById('scPlayer').style.visibility = "visible";
        $scope.notFound = false;
        $scope.processing = false;
      }).then(null, function(err) {
        document.getElementById('scPlayer').style.visibility = "hidden";
        $scope.notFound = true;
        $scope.processing = false;
      });
  }


  $scope.unrepostOverlap = function() {
    var events = ($scope.user._id == $scope.trade.p1._id) ? p1Events : p2Events;
    var blockEvents = events.filter(function(event) {
      event.day = new Date(event.day);
      event.unrepostDate = new Date(event.unrepostDate);
      return ($scope.makeEvent.trackID == event.trackID && event.unrepostDate.getTime() > $scope.makeEvent.day.getTime() - 24 * 3600000 && event.day.getTime() < $scope.makeEvent.unrepostDate.getTime() + 24 * 3600000);
    })
    return blockEvents.length > 0;
  }


  $scope.refreshCalendar = function() {
    return $http.get('/api/events/forUser/' + $scope.trade.p1.user.soundcloud.id)
      .then(function(res) {
        p1Events = res.data;
        return $http.get('/api/events/forUser/' + $scope.trade.p2.user.soundcloud.id)
      })
      .then(function(res) {
        p2Events = res.data;
        return $http.get('/api/trades/byID/' + $stateParams.tradeID)
      })
      .then(function(res) {
        $scope.trade = res.data;
        var person = $scope.trade.p1.user._id == $scope.user._id ? $scope.trade.p1 : $scope.trade.p2;
        $scope.user.accepted = person.accepted;
        $scope.fillCalendar();
        $scope.processing = false;
      })
  }

  $scope.backEvent = function() {
    $scope.makeEvent = undefined;
    $scope.showOverlay = false;
  }

  $scope.deleteEvent = function() {
    $scope.makeEvent.person.slots.filter(function(slot, index) {
      return !(moment(slot.day).format('LLL') === moment(makeDay).format('LLL'));
    });
    $scope.trade.p1.accepted = $scope.trade.p2.accepted = false;
    $scope.processing = true;
    $http.put('/api/trades', $scope.trade)
      .then(function(res) {
        $scope.processing = false;
        $scope.trade = res.data;
        $scope.emitMessage("REMOVED SLOT from " + $scope.makeEvent.person.user.soundcloud.username + " for " + moment(makeDay).format('LLL'), 'alert');
      })
      .then(null, function(err) {
        $scope.processing = false;
        $.Zebra_Dialog('Error with request');
      })
  }

  $scope.saveEvent = function() {
    console.log($scope.makeEvent);
    if (!$scope.unrepostOverlap()) {
      $scope.processing = true;
      console.log(1);
      $http.put('/api/events/repostEvents', $scope.makeEvent)
        .then(function(res) {
          return $scope.refreshCalendar();
        })
        .then(function(res) {
          $scope.showOverlay = false;
        })
        .then(null, function(err) {
          $scope.processing = false;
          $.Zebra_Dialog('Error saving');
        })
    } else {
      $.Zebra_Dialog('Issue! This repost will cause this track to be both unreposted and reposted within a 24 hour time period. If you are unreposting, please allow 48 hours between scheduled reposts.');
    }
  }

  $scope.emailSlot = function() {
    var mailto_link = "mailto:?subject=Repost of " + $scope.makeEvent.title + '&body=Hey,\n\n I am reposting your song ' + $scope.makeEvent.title + ' on ' + $scope.makeEventAccount.username + ' on ' + $scope.makeEvent.day.toLocaleDateString() + '.\n\n Best, \n' + $scope.user.soundcloud.username;
    location.href = encodeURI(mailto_link);
  }

  $scope.setUpAndOpenMakeEvent = function(event, person) {
    $scope.showOverlay = true;
    $scope.makeEvent = JSON.parse(JSON.stringify(event));
    $scope.makeEvent.day = new Date($scope.makeEvent.day);
    if ($scope.makeEvent.unrepostDate) {
      $scope.makeEvent.unrepostDate = new Date($scope.makeEvent.unrepostDate);
    }
    $scope.makeEvent.person = person;
    $scope.makeEvent.URL = $scope.makeEvent.trackURL;
    $scope.makeEvent.editable = (!(event.trackID && event.type == 'traded') && !(person.user._id == $scope.user._id));
    SC.oEmbed($scope.makeEvent.trackURL, {
      element: document.getElementById('scPlayer'),
      auto_play: false,
      maxheight: 150
    });
  }

  $scope.clickedSlot = function(day, dayOffset, hour, calendar, person, event) {
    var makeDay = new Date(day);
    makeDay.setHours(hour, 30, 0, 0);

    switch (event.type) {
      case 'queue':
      case 'track':
        $.Zebra_Dialog('Cannot manage this time slot.');
        return;
        break;

      case 'empty':
        if (person.acceted) {
          $.Zebra_Dialog("You can't make changes to this trade because you already accepted it. You will be able to make changes if the other person makes a change.");
          return;
        }
        var calEvent = {
          type: "trade",
          day: makeDay,
          userID: person.user.soundcloud.id
        };
        $scope.setUpAndOpenMakeEvent(calEvent, person);
        break;

      case 'trade':
        if (person.acceted) {
          $.Zebra_Dialog("You can't make changes to this trade because you already accepted it. You will be able to make changes if the other person makes a change.");
          return;
        }
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

    if (event.type == 'traded' && event.owner == $scope.user._id) {
      $scope.makeEventAccount = person.user.soundcloud;
      $scope.showOverlay = true;
      $scope.makeEvent = JSON.parse(JSON.stringify(event));
      $scope.makeEvent.day = new Date($scope.makeEvent.day);
      $scope.makeEvent.unrepostDate = new Date($scope.makeEvent.unrepostDate);
      $scope.makeEventURL = $scope.makeEvent.trackURL;
      SC.oEmbed($scope.makeEvent.trackURL, {
        element: document.getElementById('scPlayer'),
        auto_play: false,
        maxheight: 150
      });
    } else if (p.accepted) {
      $.Zebra_Dialog("You can't make changes to this trade because you already accepted it. You will be able to make changes if the other person makes a change.");
      return;
    } else {
      $.Zebra_Dialog('Cannot manage this time slot.');
    }
    // var today = new Date();
    // if (today.toLocaleDateString() == day.toLocaleDateString() && today.getHours() > hour) return;
    // var calendarDay = calendar.find(function(calD) {
    //   return calD.day.toLocaleDateString() == day.toLocaleDateString();
    // });
    var makeDay = new Date(day);
    makeDay.setHours(hour, 30, 0, 0);

    if (event.type == "trade") {

      $.Zebra_Dialog("REMOVE trade slot at " + moment(makeDay).format('LLL') + ' ?', {
        'type': 'confirmation',
        'buttons': [{
          caption: 'Yes',
          callback: function() {
            var saveTrade = new Promise(function(resolve, reject) {
              // var calEvent = {
              //   type: "empty"
              // };
              // calendar[dayOffset].events[hour] = calEvent;
              // $scope.processing = true;
              if (person == $scope.trade.p1) {
                angular.forEach($scope.trade.p1.slots, function(slot, index) {
                  if (moment(slot.day).format('LLL') === moment(makeDay).format('LLL')) {
                    $scope.trade.p1.slots.splice(index, 1);
                  }
                });
                $scope.trade.p1.accepted = $scope.trade.p2.accepted = false;
                $http.put('/api/trades', $scope.trade)
                  .then(resolve)
                  .then(null, reject)
              } else {
                angular.forEach($scope.trade.p2.slots, function(slot, index) {
                  if (moment(slot.day).format('LLL') === moment(makeDay).format('LLL')) {
                    $scope.trade.p2.slots.splice(index, 1);
                  }
                });
                $scope.trade.p1.accepted = $scope.trade.p2.accepted = false;
                $http.put('/api/trades', $scope.trade)
                  .then(resolve)
                  .then(null, reject)
              }
            });
            saveTrade.then(function(res) {
                $scope.processing = false;
                $scope.trade = res.data;
                $scope.emitMessage("REMOVED SLOT from " + person.user.soundcloud.username + " for " + moment(makeDay).format('LLL'), 'alert');
              })
              .then(null, function(err) {
                $scope.processing = false;
                $.Zebra_Dialog('Error with request');
              })
          }
        }, {
          caption: 'No',
          callback: function() {
            console.log('No was clicked');
          }
        }]
      });
    } else if (event.type == "empty") {
      $.Zebra_Dialog("Make " + moment(makeDay).format('LLL') + " a traded slot?", {
        'type': 'confirmation',
        'buttons': [{
          caption: 'Yes',
          callback: function() {
            var saveTrade = new Promise(function(resolve, reject) {
              var calEvent = {
                type: "trade",
                day: makeDay,
                userID: person.user.soundcloud.id
              };
              calendar[dayOffset].events[hour] = calEvent;
              $scope.processing = true;
              if (person == $scope.trade.p1) {
                $scope.trade.p1.slots.push(calEvent);
                $scope.trade.p1.accepted = $scope.trade.p2.accepted = false;
                $http.put('/api/trades', $scope.trade)
                  .then(resolve)
                  .then(null, reject)
              } else {
                $scope.trade.p2.slots.push(calEvent);
                $scope.trade.p1.accepted = $scope.trade.p2.accepted = false;
                $http.put('/api/trades', $scope.trade)
                  .then(resolve)
                  .then(null, reject)
              }
            });
            saveTrade.then(function(res) {
                $scope.processing = false;
                $scope.trade = res.data;
                $scope.emitMessage("ADDED SLOT to " + person.user.soundcloud.username + " for " + moment(makeDay).format('LLL'), 'alert');
              })
              .then(null, function(err) {
                $scope.processing = false;
                console.log(err);
                $.Zebra_Dialog('Error with request');
              })
          }
        }, {
          caption: 'No',
          callback: function() {
            console.log('No was clicked');
          }
        }]
      });
    } else if (event.type == 'queue' || event.type == 'track') {

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
              $scope.emitMessage('---- ' + $scope.user.soundcloud.username + " accepted the trade ----", 'alert');
              if ($scope.trade.p1.accepted && $scope.trade.p2.accepted) $scope.completeTrade();
            })
            .then(null, function(err) {
              $scope.processing = false;
              $.Zebra_Dialog('Error accepting');
            })
        }
      }, {
        caption: 'Cancel',
        callback: function() {
          console.log('No was clicked');
        }
      }]
    });
  }

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

  $scope.toggleUnrepost = function() {
    console.log('here');
    $scope.trade.p1.accepted = $scope.trade.p2.accepted = false;
    $http.put('/api/trades', $scope.trade)
      .then(function(res) {
        $scope.emitMessage($scope.user.soundcloud.username + " toggled unrepost", "alert");
      })
  }

  $scope.emitMessage = function(message, type) {
    if ($scope.trade.p1.user._id == $scope.user._id) {
      $scope.trade.p2.alert = "change";
    } else {
      $scope.trade.p1.alert = "change";
    }
    socket.emit('send:message', {
      message: message,
      type: type,
      id: $scope.user._id,
      tradeID: $stateParams.tradeID,
      trade: $scope.trade
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
    setEventDays(p1Events);
    setEventDays(p2Events);
    setEventDays($scope.trade.p1.slots);
    setEventDays($scope.trade.p2.slots);

    var op1Length = $scope.trade.p1.slots.length;
    p1Events.forEach(function(event) {
      $scope.trade.p1.slots = $scope.trade.p1.slots.filter(function(slot) {
        return !(slot.day.toLocaleDateString() == event.day.toLocaleDateString() && slot.day.getHours() == event.day.getHours())
      })
    })
    var op2Length = $scope.trade.p2.slots.length;
    p2Events.forEach(function(event) {
      $scope.trade.p2.slots = $scope.trade.p2.slots.filter(function(slot) {
        return !(slot.day.toLocaleDateString() == event.day.toLocaleDateString() && slot.day.getHours() == event.day.getHours())
      })
    })

    if (op1Length != $scope.trade.p1.slots.length || op2Length != $scope.trade.p2.slots.length) {
      $scope.trade.p1.accepted = $scope.trade.p2.accepted = false;
      $scope.processing = true;
      $http.put('/api/trades', $scope.trade)
        .then(function(res) {
          $scope.processing = false;
          $scope.trade = res.data;
          $scope.fillCalendar();
          $scope.emitMessage("OVERLAPPED SLOTS REMOVED: " + (op1Length - $scope.trade.p1.slots.length) + " from " + $scope.trade.p1.user.soundcloud.username + " and " + (op2Length - $scope.trade.p2.slots.length) + " from " + $scope.trade.p2.user.soundcloud.username, 'alert');
        })
        .then(null, function(err) {
          window.location.reload()
        })
    } else {
      $scope.calendarp1 = $scope.fillDateArrays(p1Events, $scope.trade.p1.slots);
      $scope.calendarp2 = $scope.fillDateArrays(p2Events, $scope.trade.p2.slots);
    }
  }
  $scope.fillCalendar();

  $scope.updateAlerts = function() {
    if ($scope.trade.p1.user._id == $scope.user._id) {
      $scope.trade.p1.alert = "none";
    } else if ($scope.trade.p2.user._id == $scope.user._id) {
      $scope.trade.p2.alert = "none";
    }
    $http.put('/api/trades', $scope.trade);
  }
  $scope.updateAlerts();

  $scope.calcUnrepostDate = function(slot) {
    slot.day = new Date(slot.day);
    if ($scope.trade.unrepost) {
      var day = new Date();
      day.setTime(slot.day.getTime() + 24 * 60 * 60 * 1000);
      return day;
    } else {
      return new Date(0);
    }
  }

  $scope.completeTrade = function() {
    $scope.processing = true;
    $scope.trade.p1.slots.forEach(function(slot) {
      var event = {
        type: 'traded',
        owner: $scope.trade.p2.user._id,
        userID: slot.userID,
        day: slot.day,
        unrepostDate: $scope.calcUnrepostDate(slot)
      }
      $http.post('/api/events/repostEvents', event);
    })
    $scope.trade.p2.slots.forEach(function(slot) {
      var event = {
        type: 'traded',
        owner: $scope.trade.p1.user._id,
        userID: slot.userID,
        day: slot.day,
        unrepostDate: $scope.calcUnrepostDate(slot)
      }
      $http.post('/api/events/repostEvents', event);
    })
    $scope.processing = true;
    setTimeout(function() {
      $scope.trade.p1.accepted = $scope.trade.p2.accepted = false;
      $scope.trade.p1.slots = [];
      $scope.trade.p2.slots = [];
      $http.put('/api/trades', $scope.trade)
        .then(function(res) {
          $scope.emitMessage("TRADE COMPLETED", "alert");
        })
    }, 2000)
  }

  $scope.getStyle = function(event) {
    if (event.type == 'empty') {
      return {}
    } else if (event.type == 'trade') {
      return {
        'background-color': '#ADD8E6'
      }
    } else if (event.type == 'track' || event.type == 'queue') {
      return {
        'background-color': '#dddddd',
        'color': 'rgba(0,0,0,0)'
      }
    } else if (event.type == 'traded') {
      if (event.owner == $scope.user._id) {
        return {
          'background-color': '#FFE1AB'
        }
      } else {
        return {
          'background-color': '#dddddd',
          'color': 'rgba(0,0,0,0)'
        }
      }
    }
  }

  $scope.dayOfWeekAsString = function(date) {
    var dayIndex = date.getDay();
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex];
  }
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
    template: '<p class="time" >{{slot}}</p>'
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