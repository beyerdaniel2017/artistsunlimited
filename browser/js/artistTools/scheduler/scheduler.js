app.config(function($stateProvider) {
  $stateProvider.state('artistToolsScheduler', {
    url: '/artistTools/scheduler',
    templateUrl: 'js/artistTools/scheduler/scheduler.html',
    controller: 'ATSchedulerController',
    resolve: {
      events: function($http, $window, SessionService) {
        if (!SessionService.getUser()) {
          $window.localStorage.setItem('returnstate', 'artistToolsScheduler');
          $window.location.href = '/login';
        }
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
  });
});

app.controller('ATSchedulerController', function($rootScope, $state, $scope, $http, AuthService, $window, events, SessionService) {
  if (!SessionService.getUser()) {
    $state.go('login');
  } else {
    $window.localStorage.removeItem('returnstate');
  }
  $scope.user = SessionService.getUser();
  $scope.makeEventURL = "";
  $scope.showOverlay = false;
  $scope.processiong = false;
  events.forEach(function(ev) {
    ev.day = new Date(ev.day);
  });
  $scope.events = events;
  $scope.hideall = false;

  $scope.dayIncr = 0;

  $scope.autoFillTracks = [];
  $scope.trackList = [];
  $scope.trackListObj = null;
  $scope.trackListSlotObj = null;
  $scope.newQueueSong = "";

  $scope.trackChange = function(index) {
    $scope.makeEventURL = $scope.trackListSlotObj.permalink_url;
    $scope.changeURL();
  };

  $scope.trackListChange = function(index) {
    $scope.newQueueSong = $scope.trackListObj.permalink_url;
    $scope.changeQueueSong();
  };

  $scope.getTrackListFromSoundcloud = function() {
    var profile = $scope.user;
    if (profile.soundcloud) {
      $scope.processing = true;
      SC.get('/users/' + profile.soundcloud.id + '/tracks', {
          filter: 'public'
        })
        .then(function(tracks) {
          $scope.trackList = tracks;
          $scope.processing = false;
          $scope.$apply();
        })
        .catch(function(response) {
          $scope.processing = false;
          $scope.$apply();
        });
    }
  }

  $scope.saveUser = function() {
    $scope.processing = true;
    $http.put("/api/database/profile", $scope.user)
      .then(function(res) {
        SessionService.create(res.data);
        $scope.user = SessionService.getUser();
        $scope.processing = false;
      })
      .then(null, function(err) {
        $.Zebra_Dialog("Error: did not save");
        $scope.processing = false;
      });
  }

  $scope.dayIncr = 0;

  $scope.saveUser = function() {
    $scope.processing = true;
    $http.put("/api/database/profile", $scope.user)
      .then(function(res) {
        SessionService.create(res.data);
        $scope.user = SessionService.getUser();
        $scope.processing = false;
      })
      .then(null, function(err) {
        $.Zebra_Dialog("Error: did not save");
        $scope.processing = false;
      });
  }

  $scope.incrDay = function() {
    if ($scope.dayIncr < 21) $scope.dayIncr++;
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
    $scope.trackListSlotObj = undefined;
    $scope.makeEvent = JSON.parse(JSON.stringify(calendarDay.events[hour]));
    // if ($scope.makeEvent.type == 'traded' || $scope.makeEvent.type == 'paid') {
    //   $scope.showOverlay = false;
    //   $scope.makeEvent = undefined;
    //   $.Zebra_Dialog("Cannot manage a traded or paid slot.");
    //   return;
    // }
    if ($scope.makeEvent.type == "empty") {
      var makeDay = new Date(day);
      makeDay.setHours(hour);
      $scope.makeEvent = {
        userID: $scope.user.soundcloud.id,
        day: makeDay,
        type: "track"
      };
      $scope.makeEvent.unrepostDate = new Date($scope.makeEvent.day.getTime() + 24 * 60 * 60 * 1000);
      $scope.makeEvent.unrepost = true;
      $scope.newEvent = true;
    } else {
      $scope.makeEvent.day = new Date($scope.makeEvent.day);
      $scope.makeEvent.unrepostDate = new Date($scope.makeEvent.unrepostDate);
      $scope.makeEvent.unrepost = ($scope.makeEvent.unrepostDate > new Date());
      $scope.makeEventURL = $scope.makeEvent.trackURL;
      SC.oEmbed('https://api.soundcloud.com/tracks/' + $scope.makeEvent.trackID, {
        element: document.getElementById('scPlayer'),
        auto_play: false,
        maxheight: 150
      });
      $scope.newEvent = false;
    }
    console.log($scope.makeEvent.type);
  }

  $scope.changeQueueSlot = function() {
    $scope.makeEvent.title = null;
    $scope.makeEvent.trackURL = null;
    $scope.makeEvent.artistName = null;
    $scope.makeEvent.trackID = null;
    $scope.makeEventURL = null;
  }

  $scope.changeURL = function() {
    if ($scope.makeEventURL != "") {
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
          $.Zebra_Dialog("We are not allowed to access tracks by this artist with the Soundcloud API. We apologize for the inconvenience, and we are working with Soundcloud to resolve this issue.");
          document.getElementById('scPlayer').style.visibility = "hidden";
          $scope.notFound = true;
          $scope.processing = false;
        });
    }
  }

  $scope.deleteEvent = function() {
    if (!$scope.newEvent) {
      $scope.processing = true;
      $http.delete('/api/events/repostEvents/' + $scope.makeEvent._id)
        .then(function(res) {
          return $scope.refreshEvents();
        })
        .then(function(res) {
          $scope.showOverlay = false;
          $scope.processing = false;
        })
        .then(null, function(err) {
          $scope.processing = false;
          $.Zebra_Dialog("ERROR: Did not delete.")
        });
    } else {
      var calendarDay = $scope.calendar.find(function(calD) {
        return calD.day.toLocaleDateString() == $scope.makeEvent.day.toLocaleDateString();
      });
      calendarDay.events[$scope.makeEvent.day.getHours()] = {
        type: "empty"
      };
      var events
      $scope.showOverlay = false;
    }
  }

  $scope.setCalendarEvent = function(event) {
    event.day = new Date(event.day);
    var calendarDay = $scope.calendar.find(function(calD) {
      return calD.day.toLocaleDateString() == event.day.toLocaleDateString();
    });
    calendarDay.events[event.day.getHours()] = event;
  }

  $scope.changeUnrepost = function() {
    if ($scope.makeEvent.unrepost) {
      $scope.makeEvent.day = new Date($scope.makeEvent.day);
      $scope.makeEvent.unrepostDate = new Date($scope.makeEvent.day.getTime() + 24 * 60 * 60 * 1000);
    } else {
      $scope.makeEvent.unrepostDate = new Date(0);
    }
  }

  $scope.findUnrepostOverlap = function() {
    if (!$scope.makeEvent.trackID) return false;
    var blockEvents = $scope.events.filter(function(event) {
      event.day = new Date(event.day);
      event.unrepostDate = new Date(event.unrepostDate);
      if (moment($scope.makeEvent.day).format('LLL') == moment(event.day).format('LLL') && $scope.makeEvent.trackID == event.trackID) return false;
      return ($scope.makeEvent.trackID == event.trackID && event.unrepostDate.getTime() > $scope.makeEvent.day.getTime() - 24 * 3600000 && event.day.getTime() < $scope.makeEvent.unrepostDate.getTime() + 24 * 3600000);
    })
    return blockEvents.length > 0;
  }

  $scope.saveEvent = function() {
    if (!$scope.findUnrepostOverlap()) {
      if (!$scope.makeEvent.trackID && ($scope.makeEvent.type == "track")) {
        $.Zebra_Dialog("Enter a track URL");
      } else {
        console.log($scope.makeEvent);
        $scope.processing = true;
        if ($scope.newEvent) {
          var req = $http.post('/api/events/repostEvents', $scope.makeEvent)
        } else {
          var req = $http.put('/api/events/repostEvents', $scope.makeEvent)
        }
        req
          .then(function(res) {
            return $scope.refreshEvents();
          })
          .then(function(res) {
            $scope.showOverlay = false;
            $scope.processing = false;
          })
          .then(null, function(err) {
            $scope.processing = false;
            $.Zebra_Dialog("ERROR: Did not save.");
          });
      }
    } else {
      $.Zebra_Dialog('Issue! This repost will cause this track to be both unreposted and reposted within a 24 hour time period. If you are unreposting, please allow 48 hours between scheduled reposts.');
    }
  }
  $scope.emailSlot = function() {
    var mailto_link = "mailto:?subject=Repost of " + $scope.makeEvent.title + '&body=Hey,\n\n I am reposting your song ' + $scope.makeEvent.title + ' on ' + $scope.user.soundcloud.username + ' on ' + $scope.makeEvent.day.toLocaleDateString() + '.\n\n Best, \n' + $scope.user.soundcloud.username;
    location.href = encodeURI(mailto_link);
  }

  $scope.backEvent = function() {
    $scope.makeEvent = null;
    $scope.showOverlay = false;
  }

  $scope.removeQueueSong = function(index) {
    $scope.user.queue.splice(index, 1);
    $scope.saveUser()
    $scope.loadQueueSongs();
  }

  $scope.addSong = function() {
    if ($scope.user.queue.indexOf($scope.newQueueID) != -1) return;
    $scope.user.queue.push($scope.newQueueID);
    $scope.saveUser();
    $scope.newQueueSong = undefined;
    $scope.trackListObj = "";
    $scope.newQueue = undefined;
    $scope.loadQueueSongs();
  }

  $scope.changeQueueSong = function() {
    if ($scope.newQueueSong != "") {
      $scope.processing = true;
      $http.post('/api/soundcloud/resolve', {
          url: $scope.newQueueSong
        })
        .then(function(res) {
          $scope.processing = false;
          var track = res.data;
          $scope.newQueue = track;
          $scope.newQueueID = track.id;
        })
        .then(null, function(err) {
          $.Zebra_Dialog("We are not allowed to access tracks by this artist with the Soundcloud API. We apologize for the inconvenience, and we are working with Soundcloud to resolve this issue.");
          $scope.processing = false;
        });
    }
  }

  $scope.moveUp = function(index) {
    if (index == 0) return;
    var s = $scope.user.queue[index];
    $scope.user.queue[index] = $scope.user.queue[index - 1];
    $scope.user.queue[index - 1] = s;
    $scope.saveUser();
    $scope.loadQueueSongs();
  }

  $scope.moveDown = function(index) {
    if (index == $scope.user.queue.length - 1) return;
    var s = $scope.user.queue[index];
    $scope.user.queue[index] = $scope.user.queue[index + 1];
    $scope.user.queue[index + 1] = s;
    $scope.saveUser();
    $scope.loadQueueSongs();
  }

  $scope.loadQueueSongs = function(queue) {
    $scope.autoFillTracks = [];
    $scope.user.queue.forEach(function(songID) {
      SC.get('/tracks/' + songID)
        .then(function(track) {
          $scope.autoFillTracks.push(track);
          $scope.$digest();
        }, console.log);
    })
  }
  if ($scope.user && $scope.user.queue) {
    $scope.loadQueueSongs();
  }

  $scope.dayOfWeekAsString = function(date) {
    var dayIndex = date.getDay();
    if (screen.width > '744') {
      return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex];
    }
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayIndex];
  }

  $scope.unrepostSymbol = function(event) {
    if (!event.unrepostDate) return;
    event.unrepostDate = new Date(event.unrepostDate);
    return event.unrepostDate > new Date();
  }

  $scope.getStyle = function(event) {
    if (event.type == 'empty') {
      return {}
    } else if (event.type == 'track' || event.type == 'queue') {
      return {
        'background-color': '#67f967'
      }
    } else if (event.type == 'traded') {
      return {
        'background-color': '#FFDA97'
      }
    } else if (event.type == 'paid') {
      return {
        'background-color': '#FFBBDD'
      }
    }
  }

  $scope.refreshEvents = function() {
    return $http.get('/api/events/forUser/' + SessionService.getUser().soundcloud.id)
      .then(function(res) {
        var events = res.data
        events.forEach(function(ev) {
          ev.day = new Date(ev.day);
        });
        $scope.events = events;
        $scope.calendar = $scope.fillDateArrays(events);
      })
  }

  $scope.fillDateArrays = function(events) {
    var calendar = [];
    var today = new Date();
    for (var i = 0; i < 29; i++) {
      var calDay = {};
      calDay.day = new Date()
      calDay.day.setDate(today.getDate() + i);
      var dayEvents = events.filter(function(ev) {
        return (ev.day.toLocaleDateString() == calDay.day.toLocaleDateString());
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
  };

  $scope.calendar = $scope.fillDateArrays(events);

  function promptForEmail() {
    if (!$scope.user.email) {
      $scope.hideall = true;
      $.Zebra_Dialog('Please enter your email. To use the repost scheduling tools, we need your email to alert you when your soundcloud access token expires.<br><br> <input id="txtemail" type="email" placeholder="example@domain.com" style="width:400px; border-radius:3px;padding:5px"/>', {
        'type': 'confirmation',
        width: 600,
        'buttons': [{
          caption: 'OK',
          callback: function() {
            var answer = $("#txtemail").val();
            if (answer == "") {
              $state.go('artistToolsDownloadGatewayList');
            } else {
              var myArray = answer.match(/[a-z\._\-!#$%&'+/=?^_`{}|~]+@[a-z0-9\-]+\.\S{2,3}/igm);
              if (myArray) {
                $scope.user.email = answer;
                return $http.put('/api/database/profile', $scope.user)
                  .then(function(res) {
                    SessionService.create(res.data);
                    $scope.user = SessionService.getUser();
                    $scope.hideall = false;
                  })
                  .then(null, function(err) {
                    setTimeout(function() {
                      promptForEmail();
                    }, 600);
                  })
              } else {
                setTimeout(function() {
                  promptForEmail();
                }, 600);
              }
            }
          }
        }]
      });
    }
  }
  $scope.verifyBrowser = function() {
    if (navigator.userAgent.search("Chrome") == -1 && navigator.userAgent.search("Safari") != -1) {
      var position = navigator.userAgent.search("Version") + 8;
      var end = navigator.userAgent.search(" Safari");
      var version = navigator.userAgent.substring(position, end);
      if (parseInt(version) < 9) {
        $.Zebra_Dialog('You have old version of safari. Click <a href="https://support.apple.com/downloads/safari">here</a> to download the latest version of safari for better site experience.', {
          'type': 'confirmation',
          'buttons': [{
            caption: 'OK'
          }],
          'onClose': function() {
            $window.location.href = "https://support.apple.com/downloads/safari";
          }
        });
      } else {
        promptForEmail();
      }
    } else {
      promptForEmail();
    }
  }
  $scope.verifyBrowser();
});