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
        usersEvents: function($http, SessionService) {
          return $http.get('/api/events/forUser/' + SessionService.getUser().soundcloud.id)
            .then(function(res) {
              return res.data;
            })
            .then(null, function(err) {
              $.Zebra_Dialog("error getting your events");
              return;
            })
        },
        othersEvents: function($http, $stateParams, trade, SessionService) {
          var otherUser = (SessionService.getUser()._id == trade.p1.user._id) ? trade.p2.user : trade.p1.user;
          return $http.get('/api/events/forUser/' + otherUser.soundcloud.id)
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

app.controller("ReForReInteractionController", function($rootScope, $state, $scope, $http, AuthService, $window, usersEvents, othersEvents, trade, SessionService, socket, $stateParams) {
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
    var today = new Date();
    if (today.toLocaleDateString() == day.toLocaleDateString() && today.getHours() > hour) return;

    var calendarDay = calendar.find(function(calD) {
      return calD.day.toLocaleDateString() == day.toLocaleDateString();
    });
    var makeDay = new Date(day);
    makeDay.setHours(hour, 0, 0, 0);

    if (eventtype == "trade") {
      $.Zebra_Dialog("Are you sure? You want to remove trade slot at " + moment(makeDay).format('LLL'), {
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
      $.Zebra_Dialog("Are you sure? You want to make " + moment(makeDay).format('LLL') + " a traded slot?", {
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
                console.log(trade.p1.slots);
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
  $scope.setEventDays = function(arr) {
    arr.forEach(function(ev) {
      ev.day = new Date(ev.day);
    })
  }
  $scope.setEventDays(usersEvents);
  $scope.setEventDays(othersEvents);
  $scope.setEventDays(trade.p1.slots);
  $scope.setEventDays(trade.p2.slots);
  $scope.calendarp1 = $scope.fillDateArrays(usersEvents, trade.p1.slots);
  $scope.calendarp2 = $scope.fillDateArrays(othersEvents, trade.p2.slots);
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
    hours = hours ? hours : 12; // the hour '0' should be '12'
    minutes = minutes < 10 ? '0' + minutes : minutes;
    var strTime = hours + ':' + minutes + ' ' + ampm;
    return strTime;
  }
});