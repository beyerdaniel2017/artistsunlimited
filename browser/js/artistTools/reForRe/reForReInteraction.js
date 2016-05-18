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

app.controller("ReForReInteractionController", function($rootScope, $state, $scope, $http, AuthService, $window, usersEvents, othersEvents, trade, SessionService, socket, $stateParams) {
  $scope.user = SessionService.getUser();
  $scope.msgHistory=[];
  $scope.makeEventURL = "";
  $scope.showOverlay = false;
  $scope.processiong = false;
  usersEvents.forEach(function(ev) {
    ev.day = new Date(ev.day);
  });
  othersEvents.forEach(function(ev) {
    ev.day = new Date(ev.day);
  });
  $scope.hideall = false;
  $scope.calendarp1 = fillDateArrays(usersEvents);
  $scope.calendarp2 = fillDateArrays(othersEvents);
  $scope.dayIncr = 0;
  $scope.incrDay = function() {
    if ($scope.dayIncr < 14) $scope.dayIncr++;
  }

  $scope.decrDay = function() {
    if ($scope.dayIncr > 0) $scope.dayIncr--;
  }

  $scope.clickedSlot = function(day, hour) {
    var today = new Date();
    if (today.toLocaleDateString() == day.toLocaleDateString() && today.getHours() > hour) return;
    $scope.showOverlay = true;
    var calDay = {};
    var calendarDay = $scope.calendarp1.find(function(calD) {
      return calD.day.toLocaleDateString() == day.toLocaleDateString();
    });
      var makeDay = new Date(day);
    makeDay.setHours(hour,0,0,0);
    $.Zebra_Dialog("Are you sure? You want to make "+moment(makeDay).format('LLL') + " a traded slot?",{
        'type': 'confirmation',
        'buttons':  [
          {caption: 'Yes', callback: function() { 
            socket.emit('send:message', {
              message: $scope.user.name + " created a trade slot at "+moment(makeDay).format('LLL'),
              type: 'alert',
              id: $scope.user._id,
              tradeID: $stateParams.tradeID
      });
          }},
          {caption: 'No', callback: function() { 
            console.log('No was clicked');
          }}
        ]
    }
    );
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
    if(message.tradeID == $stateParams.tradeID){
    $scope.msgHistory.push(message);
    $scope.message = message.message;
    }
  });


  socket.on('get:message', function(data) {
    if (data[0] != '') {
      if(data[0]._id == $stateParams.tradeID){
      $scope.msgHistory = data[0] ? data[0].messages : [];
    }
    }
  });

  $scope.sendMessage = function() {
    socket.emit('send:message', {
      message: $scope.message,
      type: 'message',
      id:$scope.user._id,
      tradeID: $stateParams.tradeID
    });
    $scope.message = '';
  };

  $scope.getMessage = function() {
    socket.emit('get:message', $stateParams.tradeID);
  }
});