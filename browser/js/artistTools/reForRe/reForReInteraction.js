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
              console.log(res.data);
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
      }
    })
});



app.controller("ReForReInteractionController", function($rootScope, $state, $scope, $http, AuthService, $window, p1Events, p2Events, trade, SessionService, socket, $stateParams) {

  $scope.trade = trade;
  $scope.user = SessionService.getUser();
  $scope.msgHistory = [];
  $scope.makeEventURL = "";
  $scope.showOverlay = false;
  $scope.processiong = false;
  $scope.hideall = false;
  $scope.p1dayIncr = 0;
  $scope.p2dayIncr = 0;

  $scope.incrp1 = function(inc) {
    if ($scope.p1dayIncr < 14) $scope.p1dayIncr++;
  }
  $scope.decrp1 = function(inc) {
    if ($scope.p1dayIncr > 0) $scope.p1dayIncr--;
  }
  $scope.incrp2 = function(inc) {
    if ($scope.p2dayIncr < 14) $scope.p2dayIncr++;
  }
  $scope.decrp2 = function(inc) {
    if ($scope.p2dayIncr > 0) $scope.p2dayIncr--;
  }

  $scope.clickedSlot = function(day, dayOffset, hour, calendar, person, eventtype) {
    var p = SessionService.getUser()._id == $scope.trade.p1.user._id ? $scope.trade.p1 : $scope.trade.p2;
    if (p.accepted) {
      $.Zebra_Dialog("You can't make changes to this trade because you already accepted it. You will be able to make changes if the other person makes a change.");
      return;
    }
    var today = new Date();
    if (today.toLocaleDateString() == day.toLocaleDateString() && today.getHours() > hour) return;

    var calendarDay = calendar.find(function(calD) {
      return calD.day.toLocaleDateString() == day.toLocaleDateString();
    });
    var makeDay = new Date(day);
    makeDay.setHours(hour, 0, 0, 0);

    if (eventtype == "trade") {
      $.Zebra_Dialog("REMOVE trade slot at " + moment(makeDay).format('LLL') + ' ?', {
        'type': 'confirmation',
        'buttons': [{
          caption: 'Yes',
          callback: function() {
            var saveTrade = new Promise(function(resolve, reject) {
              var calEvent = {
                type: "empty"
              };
              calendar[dayOffset].events[hour] = calEvent;
              if (person == $scope.trade.p1) {
                angular.forEach($scope.trade.p1.slots, function(slot, index) {
                  if (moment(slot.day).format('LLL') === moment(makeDay).format('LLL')) {
                    $scope.trade.p1.slots.splice(index, 1);
                  }
                });
                $http.put('/api/trades', $scope.trade)
                  .then(resolve)
                  .then(null, reject)
              } else {
                angular.forEach($scope.trade.p2.slots, function(slot, index) {
                  if (moment(slot.day).format('LLL') === moment(makeDay).format('LLL')) {
                    $scope.trade.p2.slots.splice(index, 1);
                  }
                });
                $http.put('/api/trades', $scope.trade)
                  .then(resolve)
                  .then(null, reject)
              }
            });
            saveTrade.then(function(res) {
                $scope.trade = res.data;
                socket.emit('send:message', {
                  message: "REMOVED SLOT from " + person.user.soundcloud.username + " for " + moment(makeDay).format('LLL'),
                  type: 'alert',
                  id: $scope.user._id,
                  tradeID: $stateParams.tradeID
                });
              })
              .then(null, function(err) {
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
    } else if (eventtype == "empty") {
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
              if (person == $scope.trade.p1) {
                $scope.trade.p1.slots.push(calEvent);
                $http.put('/api/trades', $scope.trade)
                  .then(resolve)
                  .then(null, reject)
              } else {
                $scope.trade.p2.slots.push(calEvent);
                $http.put('/api/trades', $scope.trade)
                  .then(resolve)
                  .then(null, reject)
              }
            });
            saveTrade.then(function(res) {
                $scope.trade = res.data;
                socket.emit('send:message', {
                  message: "ADDED SLOT to " + person.user.soundcloud.username + " for " + moment(makeDay).format('LLL'),
                  type: 'alert',
                  id: $scope.user._id,
                  tradeID: $stateParams.tradeID
                });
              })
              .then(null, function(err) {
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
    } else {
      $.Zebra_Dialog('Cannot manage this time slot.');
    }
  }

  $scope.email = function() {
    var otherUser = $scope.trade.p1.user._id == $scope.user._id ? $scope.trade.p2.user : $scope.trade.p1.user;
    var mailto_link = "mailto:" + otherUser.email + "?subject=Repost for repost with " + $scope.user.soundcloud.username + '&body=Hey ' + otherUser.soundcloud.username + ',\n\n Repost for repost? I scheduled a trade here! -> www.artistsunlimited.co/login\n\nBest,\n' + $scope.user.soundcloud.username;
    location.href = encodeURI(mailto_link);
  }

  $scope.accept = function() {
    if ($scope.trade.p1.user._id == SessionService.getUser()._id) {
      $scope.trade.p1.accepted = true;
      var accString = $scope.trade.p2.accepted ? "If you accept, the trade will be made. You will have the right to schedule the slots you are trading for, and the other person will have rights to the slots you are trading with." : "If you click accept, you will not be able to make changes to the trade being negotiated. If the other person makes a change, you will then be given the right to make changes and accept those changes again. If the other person also accepts, the trade will be made.";
    } else {
      $scope.trade.p2.accepted = true;
      var accString = $scope.trade.p1.accepted ? "If you accept, the trade will be made. You will have the right to schedule the slots you are trading for, and the other person will have rights to the slots you are trading with." : "If you click accept, you will not be able to make changes to the trade being negotiated. If the other person makes a change, you will then be given the right to make changes and accept those changes again. If the other person also accepts, the trade will be made.";
    }
    $.Zebra_Dialog(accString, {
      'type': 'confirmation',
      'buttons': [{
        caption: 'Accept',
        callback: function() {
          if ($scope.trade.p1.user._id == SessionService.getUser()._id) {
            $scope.trade.p1.accepted = true;
          } else {
            $scope.trade.p2.accepted = true;
          }
          $http.put('/api/trades/accept', $scope.trade)
            .then(function(res) {
              $scope.trade = res.data;
              $scope.processing = false;
              socket.emit('send:message', {
                message: $scope.user.soundcloud.username + " accepted the trade",
                type: 'alert',
                id: $scope.user._id,
                tradeID: $stateParams.tradeID
              });
            })
            .then(null, function(err) {
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

  $scope.backEvent = function() {
    $scope.makeEvent = null;
    $scope.showOverlay = false;
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
    }
  });

  socket.on('get:message', function(data) {
    if (data[0] != '') {
      if (data[0]._id == $stateParams.tradeID) {
        $scope.msgHistory = data[0] ? data[0].messages : [];
      }
    }
  });

  $scope.sendMessage = function() {
    socket.emit('send:message', {
      message: $scope.message,
      type: 'message',
      id: $scope.user._id,
      tradeID: $stateParams.tradeID
    });
    $scope.message = '';
  };

  $scope.getMessage = function() {
    socket.emit('get:message', $stateParams.tradeID);
  }

  $scope.fillDateArrays = function(events, slots) {
    var calendar = [];
    var today = new Date();
    for (var i = 0; i < 21; i++) {
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
      $http.put('/api/trades', $scope.trade)
        .then(function(res) {
          $scope.trade = res.data;
          $scope.fillCalendar();
          socket.emit('send:message', {
            message: "OVERLAPPED SLOTS REMOVED: " + (op1Length - $scope.trade.p1.slots.length) + " from " + $scope.trade.p1.user.soundcloud.username + " and " + (op2Length - $scope.trade.p2.slots.length) + " from " + $scope.trade.p2.user.soundcloud.username,
            type: 'alert',
            id: $scope.user._id,
            tradeID: $stateParams.tradeID
          });
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
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }
});