app.config(function($stateProvider) {
  $stateProvider.state('scheduler', {
    url: '/scheduler',
    templateUrl: 'js/scheduler/scheduler.html',
    controller: 'SchedulerController'
  });
});


app.controller('SchedulerController', function($rootScope, $state, $scope, $http, AuthService, CLIENT_ID) {

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
    $scope.channel.password = $rootScope.password;
    $http.put("/api/channels", $scope.channel)
      .then(function(res) {
        window.alert("Saved");
        $scope.channel = res.data;
      })
      .then(null, function(err) {
        window.alert("Error: did not save");
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
      $scope.makeEvent = {
        channelID: $scope.channel.channelID,
        day: new Date(day),
        hour: hour,
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
    if ($scope.makeEvent.paid == false) {
      if (!$scope.canLowerOpenEvents()) {
        $scope.makeEvent.paid = true;
        window.alert('Not enough unfilled "paid" slots.')
      } {
        $scope.makeEvent.trackID = undefined;
        $scope.makeEventURL = undefined;
      }
    } else {
      $scope.makeEvent.trackID = undefined;
      $scope.makeEventURL = undefined;
    }
  }

  $scope.changeURL = function() {
    var getPath = 'http://api.soundcloud.com/resolve.json?url=' + $scope.makeEventURL + '&client_id=' + CLIENT_ID;
    console.log(getPath);
    $http.get(getPath)
      .then(function(res) {
        var track = res.data;
        SC.oEmbed(track.uri, {
          element: document.getElementById('scPlayer'),
          auto_play: false,
          maxheight: 150
        });
        $scope.makeEvent.trackID = track.id;
      });
  }

  $scope.deleteEvent = function() {
    if ($scope.canLowerOpenEvents()) {
      if (!$scope.newEvent) {
        $http.delete('/api/events/' + $scope.makeEvent._id + '/' + $rootScope.password)
          .then(function(res) {
            var calendarDay = $scope.calendar.find(function(calD) {
              return calD.day.toLocaleDateString() == $scope.makeEvent.day.toLocaleDateString();
            });
            calendarDay.events[$scope.makeEvent.hour] = "-";
            $scope.showOverlay = false;
            window.alert("Deleted");
          })
          .then(null, function(err) {
            window.alert("ERROR: did not Delete.")
          });
      } else {
        var calendarDay = $scope.calendar.find(function(calD) {
          return calD.day.toLocaleDateString() == $scope.makeEvent.day.toLocaleDateString();
        });
        calendarDay.events[$scope.makeEvent.hour] = "-";
        var events
        $scope.showOverlay = false;
      }
    } else {
      window.alert('Not enough unfilled "paid" slots.')
    }
  }

  $scope.saveEvent = function() {
    if (!$scope.makeEvent.trackID && !$scope.makeEvent.paid) {
      window.alert("Enter a track URL");
    } else {
      if ($scope.newEvent) {
        $scope.makeEvent.password = $rootScope.password;
        $http.post('/api/events', $scope.makeEvent)
          .then(function(res) {
            var event = res.data;
            event.day = new Date(event.day);
            var calendarDay = $scope.calendar.find(function(calD) {
              return calD.day.toLocaleDateString() == event.day.toLocaleDateString();
            });
            calendarDay.events[event.hour] = event;
            $scope.showOverlay = false;
            window.alert("Saved");
          })
          .then(null, function(err) {
            window.alert("ERROR: did not Save.");
          });
      } else {
        $scope.newEvent.password = $rootScope.password;

        $http.put('/api/events', $scope.makeEvent)
          .then(function(res) {
            var event = res.data;
            console.log("RES");
            console.log(event);
            event.day = new Date(event.day);
            var calendarDay = $scope.calendar.find(function(calD) {
              return calD.day.toLocaleDateString() == event.day.toLocaleDateString();
            });
            calendarDay.events[event.hour] = event;
            $scope.showOverlay = false;
            window.alert("Saved");
          })
          .then(null, function(err) {
            window.alert("ERROR: did not Save.");
          });
      }
    }
  }

  $scope.backEvent = function() {
    $scope.makeEvent = null;
    $scope.showOverlay = false;
  }

  // $scope.accept = function(submission) {
  //   if ($scope.canLowerOpenEvents()) {
  //     $http.put('/api/submissions/accept', submission)
  //       .then(function(res) {
  //         console.log("RES")
  //         console.log(res.data);
  //         var index = $scope.submissions.indexOf(submission);
  //         $scope.submissions[index] = res.data;
  //         $scope.loadSubmissions();
  //         console.log($scope.submissions);
  //         window.alert("Accepted. Invoice sent.");
  //       })
  //       .then(null, function(err) {
  //         window.alert("ERROR: did not Accept.");
  //       });
  //   } else {
  //     window.alert('Not enough unfilled "paid" slots.')
  //   }
  // }

  // $scope.decline = function(submission) {
  //   $http.delete('/api/submissions/decline/' + submission._id)
  //     .then(function(res) {
  //       console.log(res.data);
  //       var index = $scope.submissions.indexOf(submission);
  //       $scope.submissions.splice(index, 1);
  //       window.alert("Declined");
  //     })
  //     .then(null, function(err) {
  //       window.alert("ERROR: did not Decline");
  //     });
  // }

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
    var getPath = 'http://api.soundcloud.com/resolve.json?url=' + $scope.newQueueSong + '&client_id=' + CLIENT_ID;
    console.log(getPath);
    $http.get(getPath)
      .then(function(res) {
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

  $scope.canLowerOpenEvents = function() {
    var waitingSubs = $scope.submissions.filter(function(sub) {
      return sub.invoiceID;
    });
    var openSlots = [];
    $scope.calendar.forEach(function(day) {
      day.events.forEach(function(ev) {
        if (ev.paid && !ev.trackID) openSlots.push(ev);
      });
    });
    var openNum = openSlots.length - waitingSubs.length;
    console.log(openSlots);
    console.log(waitingSubs);
    return openNum > 0;
  }

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
      eventArray[ev.hour] = ev;
    });
    calDay.events = eventArray;
    calendar.push(calDay);
  }
  return calendar;
}