app.config(function($stateProvider) {
  $stateProvider.state('scheduler', {
    url: '/admin/scheduler',
    templateUrl: 'js/scheduler/scheduler.html',
    controller: 'SchedulerController'
  });
});

app.controller('SchedulerController', function($rootScope, $state, $scope, $http, AuthService, SessionService, $window) {
  if (!SessionService.getUser()) {
    $state.go('admin');
  }
  $scope.makeEventURL = "";
  $scope.showOverlay = false;
  var info = $rootScope.schedulerInfo;
  if (!info) {
    $state.go('admin');
  }
  $scope.channel = info.channel;
  if (!$scope.channel) {
    $state.go('admin');
  }

  $scope.logout = function() {
    $http.get('/api/logout').then(function() {
      SessionService.deleteUser();
      window.location.href = '/admin';
    }).catch(function(err) {
      $scope.processing = false;
    });
  }
  $scope.submissions = info.submissions;

  $scope.dayIncr = 0;

  $scope.back = function() {
    window.location.reload();

  }

  $scope.saveChannel = function() {
    $scope.processing = true;
    $scope.channel.password = $rootScope.password;
    $http.put("/api/channels", $scope.channel)
      .then(function(res) {
        $.Zebra_Dialog("Saved");
        $scope.channel = res.data;
        $scope.processing = false;
      })
      .then(null, function(err) {
        $.Zebra_Dialog("Error: did not save");
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
    console.log($scope.makeEvent);
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
      $scope.makeEventURL = $scope.makeEvent.trackURL;
      SC.oEmbed($scope.makeEventURL, {
        element: document.getElementById('scPlayer'),
        auto_play: false,
        maxheight: 150
      });
      $scope.newEvent = false;
    }
  }

  $scope.changePaid = function() {
    $scope.makeEvent.title = undefined;
    $scope.makeEvent.trackURL = undefined;
    $scope.makeEvent.artistName = undefined;
    $scope.makeEvent.trackID = undefined;
    $scope.makeEventURL = undefined;
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

  $scope.deleteEvent = function() {
    if (!$scope.newEvent) {
      $scope.processing = true;
      $http.delete('/api/events/' + $scope.makeEvent._id)
        .then(function(res) {
          var calendarDay = $scope.calendar.find(function(calD) {
            return calD.day.toLocaleDateString() == $scope.makeEvent.day.toLocaleDateString();
          });
          calendarDay.events[$scope.makeEvent.day.getHours()] = "-";
          $scope.showOverlay = false;
          $scope.processing = false;
          $.Zebra_Dialog("Deleted");
        })
        .then(null, function(err) {
          $scope.processing = false;
          $.Zebra_Dialog("ERROR: did not Delete.")
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
      $.Zebra_Dialog("Enter a track URL");
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
            $.Zebra_Dialog("Saved");
          })
          .then(null, function(err) {
            $scope.processing = false;
            $.Zebra_Dialog("ERROR: did not Save.");
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
            $.Zebra_Dialog("Saved");
          })
          .then(null, function(err) {
            $scope.processing = false;
            $.Zebra_Dialog("ERROR: did not Save.");
          });
      }
    }
  }

  $scope.emailSlot = function() {
    var mailto_link = "mailto:coayscue@gmail.com?subject=Repost of " + $scope.makeEvent.title + '&body=Hey,\n\n I am reposting your song ' + $scope.makeEvent.title + ' on ' + $scope.channel.displayName + ' on ' + $scope.makeEvent.day.toLocaleDateString() + '.\n\n Best, \n' + $scope.channel.displayName;
    location.href = encodeURI(mailto_link);
  }

  // $scope.scEmailSlot = function() {

  // }

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
    $http.post('/api/soundcloud/resolve', {
        url: $scope.newQueueSong
      })
      .then(function(res) {
        $scope.processing = false;
        var track = res.data;
        $scope.newQueueID = track.id;
      })
      .then(null, function(err) {
        $.Zebra_Dialog("error getting song");
        $scope.processing = false;
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
  if ($scope.channel && $scope.channel.queue) {
    $scope.loadQueueSongs($scope.channel.queue);
  }
  $scope.loadSubmissions();

  $scope.dayOfWeekAsString = function(date) {
    var dayIndex = date.getDay();
    return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex];
  }

  $scope.fillDateArrays = function(events) {
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
  $scope.calendar = $scope.fillDateArrays(info.events);
});