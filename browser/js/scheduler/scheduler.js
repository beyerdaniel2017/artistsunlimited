app.config(function($stateProvider) {
  $stateProvider.state('scheduler', {
    url: '/scheduler',
    templateUrl: 'js/scheduler/scheduler.html',
    controller: 'SchedulerController'
  });
});


app.controller('SchedulerController', function($rootScope, $state, $scope, $http, AuthService, SOUNDCLOUD) {

  $scope.makeEventURL = "";
  $scope.showOverlay = false;
  var info = $rootScope.schedulerInfo;
  if (!info) {
    $state.go('admin');
  }
  $scope.channel = info.channel;
  $scope.submissions = info.submissions;

  $scope.calendar = fillDateArrays(info.events);
  $scope.dayIncr = 0;

  $scope.saveChannel = function() {
    $scope.processing = true;
    $scope.channel.password = $rootScope.password;
    $http.put("/api/channels", $scope.channel)
      .then(function(res) {
        window.alert("Saved");
        $scope.channel = res.data;
        $scope.processing = false;
      })
      .then(null, function(err) {
        window.alert("Error: did not save");
        $scope.processing = false;
      });
  }

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
        channelID: $scope.channel.channelID,
        day: makeDay,
        paid: false
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

  $scope.changePaid = function() {
    $scope.makeEvent.trackID = undefined;
    $scope.makeEventURL = undefined;
  }

  $scope.changeURL = function() {
    $scope.processing = true;
    $http.post('/api/soundcloud/soundcloudTrack', {
        url: $scope.makeEventURL
      })
      .then(function(res) {
        $scope.makeEvent.trackID = res.data.trackID;
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

  $scope.deleteEvent = function() {
    if (!$scope.newEvent) {
      $scope.processing = true;
      $http.delete('/api/events/' + $scope.makeEvent._id + '/' + $rootScope.password)
        .then(function(res) {
          var calendarDay = $scope.calendar.find(function(calD) {
            return calD.day.toLocaleDateString() == $scope.makeEvent.day.toLocaleDateString();
          });
          calendarDay.events[$scope.makeEvent.day.getHours()] = "-";
          $scope.showOverlay = false;
          $scope.processing = false;
          window.alert("Deleted");
        })
        .then(null, function(err) {
          $scope.processing = false;
          window.alert("ERROR: did not Delete.")
        });
    } else {
      var calendarDay = $scope.calendar.find(function(calD) {
        return calD.day.toLocaleDateString() == $scope.makeEvent.day.toLocaleDateString();
      });
      calendarDay.events[$scope.makeEvent.getHours()] = "-";
      var events
      $scope.showOverlay = false;
    }
  }

  $scope.saveEvent = function() {
    if (!$scope.makeEvent.trackID && !$scope.makeEvent.paid) {
      window.alert("Enter a track URL");
    } else {
      if ($scope.newEvent) {
        $scope.makeEvent.password = $rootScope.password;
        $scope.processing = true;
        $http.post('/api/events', $scope.makeEvent)
          .then(function(res) {
            var event = res.data;
            event.day = new Date(event.day);
            var calendarDay = $scope.calendar.find(function(calD) {
              return calD.day.toLocaleDateString() == event.day.toLocaleDateString();
            });
            calendarDay.events[event.day.getHours()] = event;
            $scope.showOverlay = false;
            $scope.processing = false;
            window.alert("Saved");
          })
          .then(null, function(err) {
            $scope.processing = false;
            window.alert("ERROR: did not Save.");
          });
      } else {
        $scope.newEvent.password = $rootScope.password;
        $scope.processing = true;
        $http.put('/api/events', $scope.makeEvent)
          .then(function(res) {
            var event = res.data;
            event.day = new Date(event.day);
            var calendarDay = $scope.calendar.find(function(calD) {
              return calD.day.toLocaleDateString() == event.day.toLocaleDateString();
            });
            calendarDay.events[event.getHours()] = event;
            $scope.showOverlay = false;
            $scope.processing = false;
            window.alert("Saved");
          })
          .then(null, function(err) {
            $scope.processing = false;
            window.alert("ERROR: did not Save.");
          });
      }
    }
  }

  $scope.backEvent = function() {
    $scope.makeEvent = null;
    $scope.showOverlay = false;
  }

  $scope.removeQueueSong = function(index) {
    $scope.channel.queue.splice(index, 1);
    $scope.saveChannel();
  }

  $scope.addSong = function() {
    if ($scope.channel.queue.indexOf($scope.newQueueID) != -1) return;
    $scope.channel.queue.push($scope.newQueueID);
    $scope.saveChannel();
    $scope.newQueueSong = undefined;
    $scope.changeQueueSong();
    $scope.loadQueueSongs([$scope.newQueueID]);
  }

  $scope.changeQueueSong = function() {
    $scope.processing = true;
    var getPath = 'http://api.soundcloud.com/resolve.json?url=' + $scope.newQueueSong + '&client_id=' + SOUNDCLOUD.clientID;
    $http.get(getPath)
      .then(function(res) {
        $scope.processing = false;
        var track = res.data;
        // SC.oEmbed(track.uri, {
        //   element: document.getElementById('newQueuePlayer'),
        //   auto_play: false,
        //   maxheight: 150
        // });
        $scope.newQueueID = track.id;
      });
  }

  $scope.moveUp = function(index) {
    if (index == 0) return;
    var s = $scope.channel.queue[index];
    $scope.channel.queue[index] = $scope.channel.queue[index - 1];
    $scope.channel.queue[index - 1] = s;
    $scope.saveChannel();
    $scope.loadQueueSongs([$scope.channel.queue[index], $scope.channel.queue[index - 1]]);
  }

  $scope.moveDown = function(index) {
    if (index == $scope.channel.queue.length - 1) return;
    var s = $scope.channel.queue[index];
    $scope.channel.queue[index] = $scope.channel.queue[index + 1];
    $scope.channel.queue[index + 1] = s;
    $scope.saveChannel();
    $scope.loadQueueSongs([$scope.channel.queue[index], $scope.channel.queue[index + 1]]);
  }

  // $scope.canLowerOpenEvents = function() {
  //   var waitingSubs = $scope.submissions.filter(function(sub) {
  //     return sub.invoiceID;
  //   });
  //   var openSlots = [];
  //   $scope.calendar.forEach(function(day) {
  //     day.events.forEach(function(ev) {
  //       if (ev.paid && !ev.trackID) openSlots.push(ev);
  //     });
  //   });
  //   var openNum = openSlots.length - waitingSubs.length;
  //   return openNum > 0;
  // }

  $scope.loadSubmissions = function() {
    setTimeout(function() {
      $scope.submissions.forEach(function(sub) {
        SC.oEmbed("http://api.soundcloud.com/tracks/" + sub.trackID, {
          element: document.getElementById(sub.trackID + "player"),
          auto_play: false,
          maxheight: 150
        });
      });
    }, 50);
  }

  $scope.loadQueueSongs = function(queue) {
    setTimeout(function() {
      queue.forEach(function(songID) {
        SC.oEmbed("http://api.soundcloud.com/tracks/" + songID, {
          element: document.getElementById(songID + "player"),
          auto_play: false,
          maxheight: 150
        });
      });
    }, 50);
  }

  $scope.loadQueueSongs($scope.channel.queue);
  $scope.loadSubmissions();

});

function fillDateArrays(events) {
  var calendar = [];
  var today = new Date();
  for (var i = 0; i < 21; i++) {
    var calDay = {};
    calDay.day = new Date()
    calDay.day.setDate(today.getDate() + i);
    var dayEvents = events.filter(function(ev) {
      return (ev.day.toLocaleDateString() == calDay.day.toLocaleDateString());
    });
    var eventArray = [];
    for (var j = 0; j < 24; j++) {
      eventArray[j] = "-";
    }
    dayEvents.forEach(function(ev) {
      eventArray[ev.day.getHours()] = ev;
    });
    calDay.events = eventArray;
    calendar.push(calDay);
  }
  return calendar;
}