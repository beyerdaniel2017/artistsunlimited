app.config(function($stateProvider) {
  $stateProvider.state('repostevents', {
    url: '/repostevents',
    templateUrl: 'js/repostEvents/views/repostEvents.html',
    controller: 'RepostEventsController',
    resolve: {
      repostEvent: function($http, $location) {
        var eventid = $location.search().id;
        return $http.get('/api/events/respostEvent/' + eventid)
        .then(function(res) {
          return res.data;
        })
        .then(null, function(err) {
          $.Zebra_Dialog("error getting your events");
          return;
        })
      }
    }
  });
});
app.controller('RepostEventsController', function($rootScope, $state, $scope, repostEvent, $http, $location, $window, $q, $sce, $auth, SessionService) {
  $scope.user = SessionService.getUser();
  $scope.itemview = "calender";  
  $scope.setView = function(view) {
    $scope.itemview = view;
  };
  $scope.listevents = repostEvent;
  $scope.trackImage = repostEvent[0].trackInfo.artistUrl;
  $scope.dayIncr = 0;
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
  
  $scope.getEventStyle = function(repostEvent) {
    if (repostEvent.type == 'empty') {
      return {}
    } else if (repostEvent.trackInfo.type == 'track' || repostEvent.trackInfo.type == 'queue') {
      console.log('track');
      return {
        'background-color': '#67f967'
      }
    } else if (repostEvent.trackInfo.type == 'traded') {
      return {
        'background-color': '#FFDA97'
      }
    } else if (repostEvent.trackInfo.type == 'paid') {
      return {
        'background-color': '#FFBBDD'
      }
    }
  }

  repostEvent.forEach(function(ev) {
    ev.day = new Date(ev.day);
  });
  $scope.events = repostEvent;
  $scope.fillDateArrays = function(repostEvent) {
    var calendar = [];
    var today = new Date();
    for (var i = 0; i < 29; i++) {
      var calDay = {};
      calDay.day = new Date()
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
        eventArray[new Date(ev.trackInfo.day).getHours()] = ev;
      });

      calDay.events = eventArray;
      calendar.push(calDay);
    }
    return calendar;
  };

  $scope.calendar = $scope.fillDateArrays(repostEvent);
  $scope.fillDateArrays(repostEvent);

});