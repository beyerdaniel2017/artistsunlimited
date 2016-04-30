app.config(function($stateProvider) {
      $stateProvider.state('artistToolsScheduler', {
            url: '/artisttools/scheduler',
            templateUrl: 'js/artistTools/scheduler/scheduler.html',
            controller: 'ATSchedulerController',
            resolve: {
                  events: function($http, SessionService) {
                        return $http.get('/api/events/forUser/' + JSON.parse(SessionService.getUser()).soundcloud.id)
                              .then(function(res) {
                                    return res.data;
                              })
                              .then(null, function(err) {
                                    $.Zebra_Dialog("error getting your events");
                              })
                  }

            }
      });
});

app.controller('ATSchedulerController', function($rootScope, $state, $scope, $http, AuthService, $window, events, SessionService) {
      $scope.user = JSON.parse(SessionService.getUser());
      console.log($scope.user);
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

                  var myArray = answer.match(/[a-z\._\-!#$%&'+/=?^_`{}|~]+@[a-z0-9\-]+\.\S{2,3}/igm);
                  if (myArray) {
                        $scope.user.email = answer;
                        return $http.put('/api/database/profile', $scope.user)
                              .then(function(res) {
                                    SessionService.create(res.data);
                                    $scope.user = JSON.parse(SessionService.getUser());
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

      $scope.calendar = fillDateArrays(events);
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

      $scope.changeQueueSlot = function() {
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
                  $http.delete('/api/events/repostEvents/' + $scope.makeEvent._id)
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
            if (!$scope.makeEvent.trackID && !$scope.makeEvent.queueSlot) {
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
                                    $.Zebra_Dialog("Saved");
                              })
                              .then(null, function(err) {
                                    $scope.processing = false;
                                    $.Zebra_Dialog("ERROR: did not Save.");
                              });
                  } else {
                        $scope.newEvent.password = $rootScope.password;
                        $scope.processing = true;
                        $http.put('/api/events/repostEvents', $scope.makeEvent)
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
            var mailto_link = "mailto:coayscue@gmail.com?subject=Repost of " + $scope.makeEvent.title + '&body=Hey,\n\n I am reposting your song ' + $scope.makeEvent.title + ' on ' + $scope.user.soundcloud.username + ' on ' + $scope.makeEvent.day.toLocaleDateString() + '.\n\n Best, \n' + $scope.user.soundcloud.username;
            location.href = encodeURI(mailto_link);
      }

      // $scope.scEmailSlot = function() {

      // }

      $scope.backEvent = function() {
            $scope.makeEvent = null;
            $scope.showOverlay = false;
      }

      $scope.removeQueueSong = function(index) {
            $scope.user.queue.splice(index, 1);
            $scope.saveUser();
      }

      $scope.addSong = function() {
            console.log($scope.user);
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
            return ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][dayIndex];
      }
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
};