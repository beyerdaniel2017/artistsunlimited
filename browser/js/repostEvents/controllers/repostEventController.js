app.config(function($stateProvider) {
  $stateProvider.state('repostevents', {
    url: '/repostevents',
    templateUrl: 'js/repostEvents/views/repostEvents.html',
    controller: 'RepostEventsController',
    resolve: {
      repostEvent: function($http, $location) {
        var eventid = $location.search().id;
        var paid = $location.search().paid;
        var url = '/api/events/respostEvent/' + eventid;
        if (paid != undefined) {
          url = '/api/events/respostEvent/getPaidReposts/' + eventid;
        }
        console.log('url', url);
        return $http.get(url)
          .then(function(res) {
            return res.data;
          })
          .then(null, function(err) {
            $.Zebra_Dialog("This repost event does not exist.");
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
  var daysArray = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  $scope.listevents = repostEvent;
  $scope.trackImage = repostEvent[0].trackInfo.trackArtUrl;
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
      return {
        'background-color': '#FF7676'
      }
    } else if (repostEvent.trackInfo.type == 'traded') {
      return {
        'background-color': '#FFD450'
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

  $scope.backEvent = function() {
    $scope.makeEvent = null;
    $scope.trackType = "";
    $scope.trackArtistID = 0;
    $scope.showOverlay = false;
  }

  $scope.calendar = $scope.fillDateArrays(repostEvent);
  $scope.clickedSlot = function(day, hour, data) {
    if (data.trackInfo) {
      $scope.makeEvent = {};
      $scope.popup = true;
      var makeDay = new Date(day);
      makeDay.setHours(hour);
      $scope.makeEvent.day = new Date(makeDay);
      $scope.makeEvent.url = data.trackInfo.trackURL;
      $scope.makeEvent.comment = data.trackInfo.comment;
      var diff = (new Date(data.trackInfo.unrepostDate).getTime() - new Date(data.trackInfo.day).getTime()) / 3600000;
      if (diff > 0) $scope.makeEvent.unrepostHours = diff;
      $scope.unrepostEnable = diff > 0;
      $scope.makeEvent.timeGap = data.trackInfo.timeGap;
      $scope.makeEvent.username = data.userInfo.username;
      if (data.trackInfo.like) $scope.likeSrc = 'assets/images/likeTrue.svg';
      else $scope.likeSrc = 'assets/images/like.svg';
      if (data.trackInfo.comment) $scope.commentSrc = 'assets/images/comment.svg';
      else $scope.commentSrc = 'assets/images/noComment.svg';
      var d = new Date(day).getDay();
      var channels = data.trackInfo.otherChannels;
      $scope.displayChannels = [];
      for (var i = 0; i < repostEvent.length; i++) {
        if (channels.indexOf(repostEvent[i].userInfo.id) > -1) {
          $scope.displayChannels.push(repostEvent[i].userInfo.username);
        }
      }

      $scope.showOverlay = true;
      var calDay = {};
      var calendarDay = $scope.calendar.find(function(calD) {
        return calD.day.toLocaleDateString() == day.toLocaleDateString();
      })

      SC.Widget('scPopupPlayer').load($scope.makeEvent.url, {
        auto_play: false,
        show_artwork: false
      });
      document.getElementById('scPopupPlayer').style.visibility = "visible";
    }
  }
  $scope.fillDateArrays(repostEvent);
});