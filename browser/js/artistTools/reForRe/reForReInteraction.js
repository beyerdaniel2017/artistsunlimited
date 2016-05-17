app.config(function($stateProvider) {
	$stateProvider
	.state('reForReInteraction', {
		url: '/artistTools/reForReInteraction',
		params: {
			submission: null
		},
		templateUrl: 'js/artistTools/reForRe/reForReInteraction.html',
		controller: 'ReForReInteractionController',
    resolve: {
      events: function($http, SessionService) {
        return $http.get('/api/events/forUser/' + SessionService.getUser().soundcloud.id)
        .then(function(res) {
          return res.data;
	})
        .then(null, function(err) {
          $.Zebra_Dialog("error getting your events");
          return;
        })
      }
    }
	})
});

app.controller("ReForReInteractionController", function($rootScope, $state, $scope, $http, AuthService, $window, events, SessionService,socket) {
	$scope.user = SessionService.getUser();
  $scope.makeEventURL = "";
  $scope.showOverlay = false;
  $scope.processiong = false;
  events.forEach(function(ev) {
    ev.day = new Date(ev.day);
  });
  $scope.hideall = false;
  $scope.calendar = fillDateArrays(events);
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
    var calendarDay = $scope.calendar.find(function(calD) {
      return calD.day.toLocaleDateString() == day.toLocaleDateString();
    });
  
    $scope.makeEventURL = undefined;
    $scope.makeEvent = calendarDay.events[hour];
    if ($scope.makeEvent == "-") {
      var makeDay = new Date(day);
      makeDay.setHours(hour);
      $scope.makeEvent = {
        userID: $scope.user.soundcloud.id,
        day: makeDay,
        queueSlot: false
      };
      $scope.newEvent = true;
    } else {
      $scope.makeEventURL = 'https://api.soundcloud.com/tracks/' + $scope.makeEvent.trackID;
      SC.oEmbed('https://api.soundcloud.com/tracks/' + $scope.makeEvent.trackID, {
        element: document.getElementById('scPlayer'),
        auto_play: false,
        maxheight: 150
});
      $scope.newEvent = false;
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

  socket.on('init', function (data) {
    // $scope.();
    $scope.name = data.name;
    $scope.users = data.users;
  });

  socket.on('send:message', function (message) {
    $scope.msgHistory.push(message);
    $scope.message = message.message;
  });

  socket.on('get:message', function (data) {
    $scope.msgHistory=[];
    $scope.msgHistory = data[0] ? data[0].messages : [];
  });

  $scope.sendMessage = function () {    
    socket.emit('send:message', {
      message: $scope.message,
      id:$scope.user._id
    });
    $scope.message = '';
  };

  $scope.getMessage = function () {
    socket.emit('get:message');
  }
});