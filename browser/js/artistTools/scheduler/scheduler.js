app.config(function($stateProvider) {
      $stateProvider.state('artistToolsScheduler', {
            url: '/artistTools/scheduler',
            templateUrl: 'js/artistTools/scheduler/scheduler.html',
            controller: 'ATSchedulerController',
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
      });
});

app.controller('ATSchedulerController', function($rootScope, $state, $scope, $http, AuthService, $window, events, SessionService) {
      $scope.user = SessionService.getUser();
      $scope.makeEventURL = "";
      $scope.showOverlay = false;
      $scope.processiong = false;
      events.forEach(function(ev) {
            ev.day = new Date(ev.day);
      });
      $scope.hideall = false;

      function promptForEmail() {
            if (!$scope.user.email) {
                  $scope.hideall = true;

                  var answer = prompt('To use the scheduler, we need your email to alert you when your access token goes bad. What is your email?');
                  if (!answer) {
                        $state.go('artistToolsDownloadGatewayList');
                  }
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
                                    $.Zebra_Dialog("Error saving.")
                                    promptForEmail();
                              })
                  } else {
                        promptForEmail();
                  }

            }
      }
      promptForEmail();

      $scope.calendar = $scope.fillDateArrays(events);
      $scope.dayIncr = 0;

      $scope.saveUser = function() {
            $scope.processing = true;
            $http.put("/api/database/profile", $scope.user)
                  .then(function(res) {
                        $.Zebra_Dialog("Saved");
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
            $scope.makeEvent = calendarDay.events[hour];
            if ($scope.makeEvent.type == 'traded') {
                  $scope.showOverlay = false;
                  $scope.makeEvent = undefined;
                  $.Zebra_Dialog("Cannot manage a traded slot.");
                  return;
            }
            if ($scope.makeEvent.type == "empty") {
                  var makeDay = new Date(day);
                  makeDay.setHours(hour);
                  $scope.makeEvent = {
                        userID: $scope.user.soundcloud.id,
                        day: makeDay,
                        type: "track"
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

      $scope.changeQueueSlot = function() {
            $scope.makeEvent.title = null;
            $scope.makeEvent.trackURL = null;
            $scope.makeEvent.artistName = null;
            $scope.makeEvent.trackID = null;
            $scope.makeEventURL = null;
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
                  $http.delete('/api/events/repostEvents/' + $scope.makeEvent._id)
                        .then(function(res) {
                              var calendarDay = $scope.calendar.find(function(calD) {
                                    return calD.day.toLocaleDateString() == $scope.makeEvent.day.toLocaleDateString();
                              });
                              calendarDay.events[$scope.makeEvent.day.getHours()] = {
                                    type: "empty"
                              };
                              $scope.showOverlay = false;
                              $scope.processing = false;
                              $.Zebra_Dialog("Deleted");
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

      $scope.saveEvent = function() {
            if (!$scope.makeEvent.trackID && ($scope.makeEvent.type == "track")) {
                  $.Zebra_Dialog("Enter a track URL");
            } else {
                  if ($scope.newEvent) {
                        $scope.makeEvent.password = $rootScope.password;
                        $scope.processing = true;
                        $http.post('/api/events/repostEvents', $scope.makeEvent)
                              .then(function(res) {
                                    var event = res.data;
                                    event.day = new Date(event.day);
                                    var calendarDay = $scope.calendar.find(function(calD) {
                                          return calD.day.toLocaleDateString() == event.day.toLocaleDateString();
                                    });
                                    calendarDay.events[event.day.getHours()] = event;
                                    $scope.showOverlay = false;
                                    $scope.processing = false;
                                    if (event.type == "queue") {
                                          $.Zebra_Dialog("Saved. The next track in your queue will be reposted at this time.");
                                    } else {
                                          $.Zebra_Dialog("Saved. The track is now scheduled for reposting.");
                                    }
                              })
                              .then(null, function(err) {
                                    $scope.processing = false;
                                    $.Zebra_Dialog("ERROR: Did not save.");
                              });
                  } else {
                        $scope.processing = true;
                        $http.put('/api/events/repostEvents', $scope.makeEvent)
                              .then(function(res) {
                                    var event = res.data;
                                    event.day = new Date(event.day);
                                    var calendarDay = $scope.calendar.find(function(calD) {
                                          return calD.day.toLocaleDateString() == event.day.toLocaleDateString();
                                    });
                                    calendarDay.events[event.day.getHours()] = event;
                                    $scope.showOverlay = false;
                                    $scope.processing = false;
                                    if (event.type = "queue") {
                                          $.Zebra_Dialog("Saved. The next track in your queue will be reposted at this time.");
                                    } else {
                                          $.Zebra_Dialog("Saved. The track is now scheduled for reposting.");
                                    }
                              })
                              .then(null, function(err) {
                                    $scope.processing = false;
                                    $.Zebra_Dialog("ERROR: Did not save.");
                              });
                  }
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
      }

      $scope.addSong = function() {
            if ($scope.user.queue.indexOf($scope.newQueueID) != -1) return;
            $scope.user.queue.push($scope.newQueueID);
            $scope.saveUser();
            $scope.newQueueSong = undefined;
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
            var s = $scope.user.queue[index];
            $scope.user.queue[index] = $scope.user.queue[index - 1];
            $scope.user.queue[index - 1] = s;
            $scope.saveUser();
            $scope.loadQueueSongs([$scope.user.queue[index], $scope.user.queue[index - 1]]);
      }

      $scope.moveDown = function(index) {
            if (index == $scope.user.queue.length - 1) return;
            var s = $scope.user.queue[index];
            $scope.user.queue[index] = $scope.user.queue[index + 1];
            $scope.user.queue[index + 1] = s;
            $scope.saveUser();
            $scope.loadQueueSongs([$scope.user.queue[index], $scope.user.queue[index + 1]]);
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
      if ($scope.user && $scope.user.queue) {
            $scope.loadQueueSongs($scope.user.queue);
      }

      $scope.dayOfWeekAsString = function(date) {
            var dayIndex = date.getDay();
            return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex];
      }

      $scope.getStyle = function(event) {
            if (event.type == 'empty') {
                  return {}
            } else if (event.type == 'track') {
                  return {
                        'background-color': '#67f967'
                  }
            } else if (event.type == 'queue') {
                  return {
                        'background-color': 'yellow'
                  }
            } else if (event.type == 'traded') {
                  return {
                        'background-color': '#FFC966'
                  }
            }
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
});