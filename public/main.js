'use strict';
window.app = angular.module('FullstackGeneratedApp', ['fsaPreBuilt', 'ui.router', 'ui.bootstrap', 'ngAnimate']);

app.config(function ($urlRouterProvider, $locationProvider) {
  // This turns off hashbang urls (/#about) and changes it to something normal (/about)
  $locationProvider.html5Mode(true);
  // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
  $urlRouterProvider.otherwise('/');
});

// This app.run is for controlling access to specific states.
app.run(function ($rootScope, AuthService, $state) {

  // The given state requires an authenticated user.
  var destinationStateRequiresAuth = function destinationStateRequiresAuth(state) {
    return state.data && state.data.authenticate;
  };

  // $stateChangeStart is an event fired
  // whenever the process of changing a state begins.
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

    if (!destinationStateRequiresAuth(toState)) {
      // The destination state does not require authentication
      // Short circuit with return.
      return;
    }

    if (AuthService.isAuthenticated()) {
      // The user is authenticated.
      // Short circuit with return.
      return;
    }

    // Cancel navigating to new state.
    event.preventDefault();

    AuthService.getLoggedInUser().then(function (user) {
      // If a user is retrieved, then renavigate to the destination
      // (the second time, AuthService.isAuthenticated() will work)
      // otherwise, if no user is logged in, go to "login" state.
      if (user) {
        $state.go(toState.name, toParams);
      } else {
        $state.go('login');
      }
    });
  });
});

app.config(function ($stateProvider) {
  $stateProvider.state('database', {
    url: '/admin/database',
    templateUrl: 'js/database/database.html',
    controller: 'DatabaseController'
  });
});

app.directive('notificationBar', ['socket', function (socket) {
  return {
    restrict: 'EA',
    scope: true,
    template: '<div style="margin: 0 auto;width:50%" ng-show="bar.visible">' + '<uib-progress><uib-bar value="bar.value" type="{{bar.type}}"><span>{{bar.value}}%</span></uib-bar></uib-progress>' + '</div>',
    link: function link($scope, iElm, iAttrs, controller) {
      socket.on('notification', function (data) {
        var percentage = parseInt(Math.floor(data.counter / data.total * 100), 10);
        $scope.bar.value = percentage;
        if (percentage === 100) {
          $scope.bar.visible = false;
          $scope.bar.value = 0;
        }
      });
    }
  };
}]);

app.controller('DatabaseController', function ($rootScope, $state, $scope, $http, AuthService, socket) {
  $scope.addUser = {};
  $scope.query = {};
  $scope.trdUsrQuery = {};
  $scope.queryCols = [{
    name: 'username',
    value: 'username'
  }, {
    name: 'genre',
    value: 'genre'
  }, {
    name: 'name',
    value: 'name'
  }, {
    name: 'URL',
    value: 'scURL'
  }, {
    name: 'email',
    value: 'email'
  }, {
    name: 'description',
    value: 'description'
  }, {
    name: 'followers',
    value: 'followers'
  }, {
    name: 'number of tracks',
    value: 'numTracks'
  }, {
    name: 'facebook',
    value: 'facebookURL'
  }, {
    name: 'instagram',
    value: 'instagramURL'
  }, {
    name: 'twitter',
    value: 'twitterURL'
  }, {
    name: 'youtube',
    value: 'youtubeURL'
  }, {
    name: 'websites',
    value: 'websites'
  }, {
    name: 'auto email day',
    value: 'emailDayNum'
  }, {
    name: 'all emails',
    value: 'allEmails'
  }];
  $scope.downloadButtonVisible = false;
  $scope.track = {
    trackUrl: '',
    downloadUrl: '',
    email: ''
  };
  $scope.bar = {
    type: 'success',
    value: 0,
    visible: false
  };
  $scope.paidRepost = {
    soundCloudUrl: ''
  };

  $scope.login = function () {
    $scope.processing = true;
    $http.post('/api/login', {
      password: $scope.password
    }).then(function () {
      $rootScope.password = $scope.password;
      $scope.loggedIn = true;
      $scope.processing = false;
    })['catch'](function (err) {
      $scope.processing = false;
      alert('Wrong Password');
    });
  };

  $scope.logout = function () {
    $http.get('/api/logout').then(function () {
      window.location.href = '/admin';
    })['catch'](function (err) {
      $scope.processing = false;
      alert('Wrong Password');
    });
  };

  $scope.saveAddUser = function () {
    $scope.processing = true;
    $scope.addUser.password = $rootScope.password;
    $http.post('/api/database/adduser', $scope.addUser).then(function (res) {
      alert("Success: Database is being populated. You will be emailed when it is complete.");
      $scope.processing = false;
      $scope.bar.visible = true;
    })['catch'](function (err) {
      alert('Bad submission');
      $scope.processing = false;
    });
  };

  $scope.createUserQueryDoc = function () {
    var query = {};
    if ($scope.query.artist == "artists") {
      query.artist = true;
    } else if ($scope.query.artist == "non-artists") {
      query.artist = false;
    }
    var flwrQry = {};
    if ($scope.query.followersGT) {
      flwrQry.$gt = $scope.query.followersGT;
      query.followers = flwrQry;
    }
    if ($scope.query.followersLT) {
      flwrQry.$lt = $scope.query.followersLT;
      query.followers = flwrQry;
    }
    if ($scope.query.genre) query.genre = $scope.query.genre;
    if ($scope.queryCols) {
      query.columns = $scope.queryCols.filter(function (elm) {
        return elm.value !== null;
      }).map(function (elm) {
        return elm.value;
      });
    }
    if ($scope.query.trackedUsersURL) query.trackedUsersURL = $scope.query.trackedUsersURL;
    var body = {
      query: query,
      password: $rootScope.password
    };
    $scope.processing = true;
    $http.post('/api/database/followers', body).then(function (res) {
      $scope.filename = res.data;
      $scope.downloadButtonVisible = true;
      $scope.processing = false;
    }).then(null, function (err) {
      alert("ERROR: Bad Query or No Matches");
      $scope.processing = false;
    });
  };

  $scope.createTrdUsrQueryDoc = function () {
    var query = {};
    var flwrQry = {};
    if ($scope.trdUsrQuery.followersGT) {
      flwrQry.$gt = $scope.trdUsrQuery.followersGT;
      query.followers = flwrQry;
    }
    if ($scope.trdUsrQuery.followersLT) {
      flwrQry.$lt = $scope.trdUsrQuery.followersLT;
      query.followers = flwrQry;
    }
    if ($scope.trdUsrQuery.genre) query.genre = $scope.trdUsrQuery.genre;
    var body = {
      query: query,
      password: $rootScope.password
    };
    $scope.processing = true;
    $http.post('/api/database/trackedUsers', body).then(function (res) {
      $scope.trdUsrFilename = res.data;
      $scope.downloadTrdUsrButtonVisible = true;
      $scope.processing = false;
    }).then(null, function (err) {
      alert("ERROR: Bad Query or No Matches");
      $scope.processing = false;
    });
  };

  $scope.download = function (filename) {
    var anchor = angular.element('<a/>');
    anchor.attr({
      href: filename,
      download: filename
    })[0].click();
    $scope.downloadButtonVisible = false;
    $scope.downloadTrdUsrButtonVisible = false;
  };

  $scope.saveDownloadUrl = function () {
    $scope.processing = true;
    $http.post('/api/database/downloadurl', $scope.track).then(function (res) {
      $scope.track = {
        trackUrl: '',
        downloadUrl: '',
        email: ''
      };
      alert("SUCCESS: Url saved successfully");
      $scope.processing = false;
    }).then(null, function (err) {
      alert("ERROR: Error in saving url");
      $scope.processing = false;
    });
  };

  $scope.savePaidRepostChannel = function () {
    $scope.processing = true;
    $http.post('/api/database/paidrepost', $scope.paidRepost).then(function (res) {
      $scope.paidRepost = {
        soundCloudUrl: ''
      };
      alert("SUCCESS: Url saved successfully");
      $scope.processing = false;
    }).then(null, function (err) {
      alert("ERROR: Error in saving url");
      $scope.processing = false;
    });
  };

  /* Listen to socket events */

  socket.on('notification', function (data) {
    var percentage = parseInt(Math.floor(data.counter / data.total * 100), 10);
    $scope.bar.value = percentage;
    if (percentage === 100) {
      $scope.statusBarVisible = false;
      $scope.bar.value = 0;
    }
  });
});
(function () {

  'use strict';
  // Hope you didn't forget Angular! Duh-doy.
  if (!window.angular) throw new Error('I can\'t find Angular!');

  var app = angular.module('fsaPreBuilt', []);

  app.factory('initSocket', function () {
    if (!window.io) throw new Error('socket.io not found!');
    return window.io(window.location.origin);
  });

  app.factory('socket', function ($rootScope, initSocket) {
    return {
      on: function on(eventName, callback) {
        initSocket.on(eventName, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            callback.apply(initSocket, args);
          });
        });
      },
      emit: function emit(eventName, data, callback) {
        initSocket.emit(eventName, data, function () {
          var args = arguments;
          $rootScope.$apply(function () {
            if (callback) {
              callback.apply(initSocket, args);
            }
          });
        });
      }
    };
  });

  // AUTH_EVENTS is used throughout our app to
  // broadcast and listen from and to the $rootScope
  // for important events about authentication flow.
  app.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
  });

  app.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
    var statusDict = {
      401: AUTH_EVENTS.notAuthenticated,
      403: AUTH_EVENTS.notAuthorized,
      419: AUTH_EVENTS.sessionTimeout,
      440: AUTH_EVENTS.sessionTimeout
    };
    return {
      responseError: function responseError(response) {
        $rootScope.$broadcast(statusDict[response.status], response);
        return $q.reject(response);
      }
    };
  });

  app.config(function ($httpProvider) {
    $httpProvider.interceptors.push(['$injector', function ($injector) {
      return $injector.get('AuthInterceptor');
    }]);
  });

  app.service('AuthService', function ($http, Session, $rootScope, AUTH_EVENTS, $q) {

    function onSuccessfulLogin(response) {
      var data = response.data;
      Session.create(data.id, data.user);
      $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
      return data.user;
    }

    // Uses the session factory to see if an
    // authenticated user is currently registered.
    this.isAuthenticated = function () {
      return !!Session.user;
    };

    this.getLoggedInUser = function (fromServer) {

      // If an authenticated session exists, we
      // return the user attached to that session
      // with a promise. This ensures that we can
      // always interface with this method asynchronously.

      // Optionally, if true is given as the fromServer parameter,
      // then this cached value will not be used.

      if (this.isAuthenticated() && fromServer !== true) {
        return $q.when(Session.user);
      }

      // Make request GET /session.
      // If it returns a user, call onSuccessfulLogin with the response.
      // If it returns a 401 response, we catch it and instead resolve to null.
      return $http.get('/session').then(onSuccessfulLogin)['catch'](function () {
        return null;
      });
    };

    this.login = function (credentials) {
      return $http.post('/login', credentials).then(onSuccessfulLogin)['catch'](function () {
        return $q.reject({
          message: 'Invalid login credentials.'
        });
      });
    };

    this.logout = function () {
      return $http.get('/logout').then(function () {
        Session.destroy();
        $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
      });
    };
  });

  app.service('Session', function ($rootScope, AUTH_EVENTS) {

    var self = this;

    $rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
      self.destroy();
    });

    $rootScope.$on(AUTH_EVENTS.sessionTimeout, function () {
      self.destroy();
    });

    this.id = null;
    this.user = null;

    this.create = function (sessionId, user) {
      this.id = sessionId;
      this.user = user;
    };

    this.destroy = function () {
      this.id = null;
      this.user = null;
    };
  });
})();
app.config(function ($stateProvider) {
  $stateProvider.state('admin', {
    url: '/admin',
    templateUrl: 'js/login/login.html',
    controller: 'AdminLoginController'
  });
});

app.controller('AdminLoginController', function ($rootScope, $state, $scope, $http, AuthService) {
  $scope.counter = 0;
  $scope.showingElements = [];
  $scope.submissions = [];

  $scope.login = function () {
    $scope.processing = true;
    $http.post('/api/login', {
      password: $scope.password
    }).then(function () {
      $rootScope.password = $scope.password;
      $scope.showSubmissions = true;
      $scope.loadSubmissions();
      $scope.processing = false;
    })['catch'](function (err) {
      $scope.processing = false;
      alert('Wrong Password');
    });
  };

  $scope.logout = function () {
    $http.get('/api/logout').then(function () {
      window.location.href = '/admin';
    })['catch'](function (err) {
      $scope.processing = false;
      alert('Wrong Password');
    });
  };

  $scope.manage = function () {
    $scope.processing = true;
    $http.get('/api/soundcloud/soundcloudConfig').then(function (res) {
      SC.initialize({
        client_id: res.data.clientID,
        redirect_uri: res.data.callbackURL,
        scope: "non-expiring"
      });
      return SC.connect();
    }).then(function (res) {
      $rootScope.accessToken = res.oauth_token;
      return $http.post('/api/login/authenticated', {
        token: res.oauth_token,
        password: $rootScope.password
      });
    }).then(function (res) {
      $scope.processing = false;
      $rootScope.schedulerInfo = res.data;
      $rootScope.schedulerInfo.events.forEach(function (ev) {
        ev.day = new Date(ev.day);
      });
      $state.go('scheduler');
    }).then(null, function (err) {
      alert('Error: Could not log in');
      $scope.processing = false;
    });
  };

  $scope.loadSubmissions = function () {
    $scope.processing = true;
    $http.get('/api/submissions/unaccepted').then(function (res) {
      $scope.submissions = res.data;
      console.log(res.data);
      $scope.loadMore();
      return $http.get('/api/channels');
    }).then(function (res) {
      $scope.channels = res.data;
      $scope.processing = false;
    }).then(null, function (err) {
      $scope.processing = false;
      alert('Error: Could not get channels.');
      console.log(err);
    });
  };

  $scope.loadMore = function () {
    var loadElements = [];
    for (var i = $scope.counter; i < $scope.counter + 15; i++) {
      var sub = $scope.submissions[i];
      $scope.showingElements.push(sub);
      loadElements.push(sub);
    }
    setTimeout(function () {
      console.log(loadElements);
      loadElements.forEach(function (sub) {
        SC.oEmbed("http://api.soundcloud.com/tracks/" + sub.trackID, {
          element: document.getElementById(sub.trackID + "player"),
          auto_play: false,
          maxheight: 150
        });
      }, 50);
    });
    $scope.counter += 15;
  };

  $scope.changeBox = function (sub, chan) {
    var index = sub.channelIDS.indexOf(chan.channelID);
    if (index == -1) {
      sub.channelIDS.push(chan.channelID);
    } else {
      sub.channelIDS.splice(index, 1);
    }
  };

  $scope.save = function (submi) {
    if (submi.channelIDS.length == 0) {
      $scope.decline(submi);
    } else {
      submi.password = $rootScope.password;
      $scope.processing = true;
      $http.put("/api/submissions/save", submi).then(function (sub) {
        $scope.submissions.splice($scope.submissions.indexOf(submi), 1);
        window.alert("Saved");
        $scope.processing = false;
      }).then(null, function (err) {
        $scope.processing = false;
        window.alert("ERROR: did not Save");
      });
    }
  };

  $scope.ignore = function (submission) {
    $scope.processing = true;
    $http['delete']('/api/submissions/ignore/' + submission._id + '/' + $rootScope.password).then(function (res) {
      var index = $scope.submissions.indexOf(submission);
      $scope.submissions.splice(index, 1);
      window.alert("Ignored");
      $scope.processing = false;
    }).then(null, function (err) {
      $scope.processing = false;
      window.alert("ERROR: did not Ignore");
    });
  };

  $scope.decline = function (submission) {
    $scope.processing = true;
    $http['delete']('/api/submissions/decline/' + submission._id + '/' + $rootScope.password).then(function (res) {
      var index = $scope.submissions.indexOf(submission);
      $scope.submissions.splice(index, 1);
      window.alert("Declined");
      $scope.processing = false;
    }).then(null, function (err) {
      $scope.processing = false;
      window.alert("ERROR: did not Decline");
    });
  };
});
app.config(function ($stateProvider) {
  $stateProvider.state('scheduler', {
    url: '/scheduler',
    templateUrl: 'js/scheduler/scheduler.html',
    controller: 'SchedulerController'
  });
});

app.controller('SchedulerController', function ($rootScope, $state, $scope, $http, AuthService) {

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

  $scope.saveChannel = function () {
    $scope.processing = true;
    $scope.channel.password = $rootScope.password;
    $http.put("/api/channels", $scope.channel).then(function (res) {
      window.alert("Saved");
      $scope.channel = res.data;
      $scope.processing = false;
    }).then(null, function (err) {
      window.alert("Error: did not save");
      $scope.processing = false;
    });
  };

  $scope.incrDay = function () {
    if ($scope.dayIncr < 14) $scope.dayIncr++;
  };

  $scope.decrDay = function () {
    if ($scope.dayIncr > 0) $scope.dayIncr--;
  };

  $scope.clickedSlot = function (day, hour) {
    var today = new Date();
    if (today.toLocaleDateString() == day.toLocaleDateString() && today.getHours() > hour) return;
    $scope.showOverlay = true;
    var calDay = {};
    var calendarDay = $scope.calendar.find(function (calD) {
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
  };

  $scope.changePaid = function () {
    $scope.makeEvent.trackID = undefined;
    $scope.makeEventURL = undefined;
  };

  $scope.changeURL = function () {
    $scope.processing = true;
    $http.post('/api/soundcloud/soundcloudTrack', {
      url: $scope.makeEventURL
    }).then(function (res) {
      $scope.makeEvent.trackID = res.data.id;
      $scope.makeEvent.title = res.data.title;
      $scope.makeEvent.trackURL = res.data.trackURL;
      SC.oEmbed($scope.makeEventURL, {
        element: document.getElementById('scPlayer'),
        auto_play: false,
        maxheight: 150
      });
      document.getElementById('scPlayer').style.visibility = "visible";
      $scope.notFound = false;
      $scope.processing = false;
    }).then(null, function (err) {
      document.getElementById('scPlayer').style.visibility = "hidden";
      $scope.notFound = true;
      $scope.processing = false;
    });
  };

  $scope.deleteEvent = function () {
    if (!$scope.newEvent) {
      $scope.processing = true;
      $http['delete']('/api/events/' + $scope.makeEvent._id + '/' + $rootScope.password).then(function (res) {
        var calendarDay = $scope.calendar.find(function (calD) {
          return calD.day.toLocaleDateString() == $scope.makeEvent.day.toLocaleDateString();
        });
        calendarDay.events[$scope.makeEvent.day.getHours()] = "-";
        $scope.showOverlay = false;
        $scope.processing = false;
        window.alert("Deleted");
      }).then(null, function (err) {
        $scope.processing = false;
        window.alert("ERROR: did not Delete.");
      });
    } else {
      var calendarDay = $scope.calendar.find(function (calD) {
        return calD.day.toLocaleDateString() == $scope.makeEvent.day.toLocaleDateString();
      });
      calendarDay.events[$scope.makeEvent.getHours()] = "-";
      var events;
      $scope.showOverlay = false;
    }
  };

  $scope.saveEvent = function () {
    if (!$scope.makeEvent.trackID && !$scope.makeEvent.paid) {
      window.alert("Enter a track URL");
    } else {
      if ($scope.newEvent) {
        $scope.makeEvent.password = $rootScope.password;
        $scope.processing = true;
        $http.post('/api/events', $scope.makeEvent).then(function (res) {
          var event = res.data;
          event.day = new Date(event.day);
          var calendarDay = $scope.calendar.find(function (calD) {
            return calD.day.toLocaleDateString() == event.day.toLocaleDateString();
          });
          calendarDay.events[event.day.getHours()] = event;
          $scope.showOverlay = false;
          $scope.processing = false;
          window.alert("Saved");
        }).then(null, function (err) {
          $scope.processing = false;
          window.alert("ERROR: did not Save.");
        });
      } else {
        $scope.newEvent.password = $rootScope.password;
        $scope.processing = true;
        $http.put('/api/events', $scope.makeEvent).then(function (res) {
          var event = res.data;
          event.day = new Date(event.day);
          var calendarDay = $scope.calendar.find(function (calD) {
            return calD.day.toLocaleDateString() == event.day.toLocaleDateString();
          });
          calendarDay.events[event.getHours()] = event;
          $scope.showOverlay = false;
          $scope.processing = false;
          window.alert("Saved");
        }).then(null, function (err) {
          $scope.processing = false;
          window.alert("ERROR: did not Save.");
        });
      }
    }
  };

  $scope.backEvent = function () {
    $scope.makeEvent = null;
    $scope.showOverlay = false;
  };

  $scope.removeQueueSong = function (index) {
    $scope.channel.queue.splice(index, 1);
    $scope.saveChannel();
  };

  $scope.addSong = function () {
    if ($scope.channel.queue.indexOf($scope.newQueueID) != -1) return;
    $scope.channel.queue.push($scope.newQueueID);
    $scope.saveChannel();
    $scope.newQueueSong = undefined;
    $scope.changeQueueSong();
    $scope.loadQueueSongs([$scope.newQueueID]);
  };

  $scope.changeQueueSong = function () {
    $scope.processing = true;
    $http.get('api/soundcloud/soundcloudConfig').then(function (res) {
      SC.initialize({
        client_id: res.data.clientID,
        redirect_uri: res.data.callbackURL,
        scope: "non-expiring"
      });
      $scope.clientIDString = res.data.clientID.toString();
      var getPath = 'http://api.soundcloud.com/resolve.json?url=' + $scope.newQueueSong + '&client_id=' + $scope.clientIDString;
      return $http.get(getPath);
    }).then(function (res) {
      $scope.processing = false;
      var track = res.data;
      // SC.oEmbed(track.uri, {
      //   element: document.getElementById('newQueuePlayer'),
      //   auto_play: false,
      //   maxheight: 150
      // });
      $scope.newQueueID = track.id;
    });
  };

  $scope.moveUp = function (index) {
    if (index == 0) return;
    var s = $scope.channel.queue[index];
    $scope.channel.queue[index] = $scope.channel.queue[index - 1];
    $scope.channel.queue[index - 1] = s;
    $scope.saveChannel();
    $scope.loadQueueSongs([$scope.channel.queue[index], $scope.channel.queue[index - 1]]);
  };

  $scope.moveDown = function (index) {
    if (index == $scope.channel.queue.length - 1) return;
    var s = $scope.channel.queue[index];
    $scope.channel.queue[index] = $scope.channel.queue[index + 1];
    $scope.channel.queue[index + 1] = s;
    $scope.saveChannel();
    $scope.loadQueueSongs([$scope.channel.queue[index], $scope.channel.queue[index + 1]]);
  };

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

  $scope.loadSubmissions = function () {
    setTimeout(function () {
      $scope.submissions.forEach(function (sub) {
        SC.oEmbed("http://api.soundcloud.com/tracks/" + sub.trackID, {
          element: document.getElementById(sub.trackID + "player"),
          auto_play: false,
          maxheight: 150
        });
      });
    }, 50);
  };

  $scope.loadQueueSongs = function (queue) {
    setTimeout(function () {
      queue.forEach(function (songID) {
        SC.oEmbed("http://api.soundcloud.com/tracks/" + songID, {
          element: document.getElementById(songID + "player"),
          auto_play: false,
          maxheight: 150
        });
      });
    }, 50);
  };
  if ($scope.channel && $scope.channel.queue) {
    $scope.loadQueueSongs($scope.channel.queue);
  }
  $scope.loadSubmissions();
});

function fillDateArrays(events) {
  var calendar = [];
  var today = new Date();
  for (var i = 0; i < 21; i++) {
    var calDay = {};
    calDay.day = new Date();
    calDay.day.setDate(today.getDate() + i);
    var dayEvents = events.filter(function (ev) {
      return ev.day.toLocaleDateString() == calDay.day.toLocaleDateString();
    });
    var eventArray = [];
    for (var j = 0; j < 24; j++) {
      eventArray[j] = "-";
    }
    dayEvents.forEach(function (ev) {
      eventArray[ev.day.getHours()] = ev;
    });
    calDay.events = eventArray;
    calendar.push(calDay);
  }
  return calendar;
}
app.config(function ($stateProvider) {
  $stateProvider.state('submitSong', {
    url: '/',
    templateUrl: 'js/submit/submit.html',
    controller: 'SubmitSongController'
  });
});

app.controller('SubmitSongController', function ($rootScope, $state, $scope, $http) {

  $scope.submission = {};

  $scope.urlChange = function () {
    $scope.processing = true;
    $http.post('/api/soundcloud/soundcloudTrack', {
      url: $scope.url
    }).then(function (res) {
      $scope.submission.trackID = res.data.id;
      $scope.submission.title = res.data.title;
      $scope.submission.trackURL = res.data.trackURL;
      SC.oEmbed($scope.submission.trackURL, {
        element: document.getElementById('scPlayer'),
        auto_play: false,
        maxheight: 150
      });
      document.getElementById('scPlayer').style.visibility = "visible";
      $scope.processing = false;
      $scope.notFound = false;
    }).then(null, function (err) {
      $scope.notFound = true;
      $scope.processing = false;
      document.getElementById('scPlayer').style.visibility = "hidden";
    });
  };

  $scope.submit = function () {
    $scope.processing = true;
    $http.post('/api/submissions', {
      email: $scope.submission.email,
      trackID: $scope.submission.trackID,
      name: $scope.submission.name,
      title: $scope.submission.title,
      trackURL: $scope.submission.trackURL,
      channelIDS: [],
      invoiceIDS: []
    }).then(function (res) {
      console.log(res.data);
      window.alert("Your song has been submitted and will be reviewed soon.");
      location.reload();
    }).then(null, function (err) {
      $scope.processing = false;
      window.alert("Error: Could not submit song.");
    });
  };
});
app.config(function ($stateProvider) {
  $stateProvider.state('autoEmailsNew', {
    url: '/admin/database/autoEmails/new',
    templateUrl: 'js/database/autoEmails/autoEmails.html',
    controller: 'AutoEmailsController'
  });
});

app.config(function ($stateProvider) {
  $stateProvider.state('autoEmailsEdit', {
    url: '/admin/database/autoEmails/edit/:templateId',
    templateUrl: 'js/database/autoEmails/autoEmails.html',
    controller: 'AutoEmailsController'
  });
});

// resolve: {
//   template: function($http) {
//     return $http.get('/api/database/autoEmails/biweekly?isArtist=true')
//       .then(function(res) {
//         var template = res.data;
//         if (template) {
//           return template;
//         } else {
//           return {
//             purpose: "Biweekly Email"
//           }
//         }
//       })
//       .then(null, function(err) {
//         alert("ERROR: Something went wrong.");
//       })
//   }
// }
app.controller('AutoEmailsController', function ($rootScope, $state, $scope, $http, $stateParams, AuthService) {
  $scope.loggedIn = false;

  $scope.isStateParams = false;
  if ($stateParams.templateId) {
    $scope.isStateParams = true;
  }
  // $scope.template = template;

  $scope.template = {
    isArtist: false
  };

  $scope.getTemplate = function () {
    if ($stateParams.templateId) {
      $scope.processing = true;
      $http.get('/api/database/autoEmails?templateId=' + $stateParams.templateId).then(function (res) {
        var template = res.data;
        $scope.processing = false;
        if (template) {
          $scope.template = template;
        } else {
          $scope.template = {};
        }
      }).then(null, function (err) {
        alert("ERROR: Something went wrong.");
      });
    } else {
      return false;
    }
  };

  // console.log(template);
  $scope.save = function () {
    $scope.processing = true;
    $http.post('/api/database/autoEmails/', $scope.template).then(function (res) {
      alert("Saved email template.");
      $scope.processing = false;
    }).then(null, function (err) {
      alert("ERROR: Message could not save.");
      $scope.processing = false;
    });
  };

  // $scope.login = function() {
  //   $scope.processing = true;
  //   $http.post('/api/login', {
  //     password: $scope.password
  //   }).then(function() {
  //     $rootScope.password = $scope.password;
  //     $scope.loggedIn = true;
  //     $scope.processing = false;
  //   }).catch(function(err) {
  //     $scope.processing = false;
  //     alert('Wrong Password');
  //   });
  // }

  $scope.logout = function () {
    $http.get('/api/logout').then(function () {
      window.location.href = '/admin';
    })['catch'](function (err) {
      $scope.processing = false;
      alert('Wrong Password');
    });
  };
});
app.config(function ($stateProvider) {
  $stateProvider.state('autoEmailsList', {
    url: '/admin/database/autoEmails',
    templateUrl: 'js/database/autoEmails/autoEmailsList.html',
    controller: 'AutoEmailsListController',
    resolve: {
      templates: function templates($http) {
        return $http.get('/api/database/autoEmails').then(function (res) {
          var template = res.data;
          if (template) {
            return template;
          } else {
            return {
              purpose: "Biweekly Email"
            };
          }
        }).then(null, function (err) {
          alert("ERROR: Something went wrong.");
        });
      }
    }
  });
});

app.controller('AutoEmailsListController', function ($rootScope, $state, $scope, $http, AuthService, templates) {
  $scope.loggedIn = false;
  $scope.templates = templates;

  // $scope.getTemplate = function() {
  //   $scope.processing = true;
  //   $http.get('/api/database/autoEmails/biweekly?isArtist=' + String($scope.template.isArtist))
  //     .then(function(res) {
  //       var template = res.data;
  //       $scope.processing = false;
  //       if (template) {
  //         $scope.template = template;
  //       } else {
  //         $scope.template = {
  //           purpose: "Biweekly Email",
  //           isArtist: false
  //         };
  //       }
  //     })
  //     .then(null, function(err) {
  //       alert("ERROR: Something went wrong.");
  //     });
  // };

  // console.log(template);
  $scope.save = function () {
    $scope.processing = true;
    $http.post('/api/database/autoEmails', $scope.template).then(function (res) {
      alert("Saved email.");
      $scope.processing = false;
    }).then(null, function (err) {
      alert("ERROR: Message could not save.");
      $scope.processing = false;
    });
  };

  // $scope.login = function() {
  //   $scope.processing = true;
  //   $http.post('/api/login', {
  //     password: $scope.password
  //   }).then(function() {
  //     $rootScope.password = $scope.password;
  //     $scope.loggedIn = true;
  //     $scope.processing = false;
  //   }).catch(function(err) {
  //     $scope.processing = false;
  //     alert('Wrong Password');
  //   });
  // }

  $scope.logout = function () {
    $http.get('/api/logout').then(function () {
      window.location.href = '/admin';
    })['catch'](function (err) {
      $scope.processing = false;
      alert('Wrong Password');
    });
  };
});
app.config(function ($stateProvider) {
  $stateProvider.state('download', {
    url: '/download',
    templateUrl: 'js/downloadTrack/views/downloadTrack.html',
    controller: 'DownloadTrackController'
  });
});

app.controller('DownloadTrackController', ['$rootScope', '$state', '$scope', '$http', '$location', '$window', 'DownloadTrackService', function ($rootScope, $state, $scope, $http, $location, $window, DownloadTrackService) {

  var taskObj = {};
  var track = {};
  var trackData = {};
  $scope.processing = false;
  $scope.embedTrack = false;
  $scope.downloadURLNotFound = false;
  $scope.errorText = '';

  /* Default processing on page load */

  $scope.getDownloadTrack = function () {
    $scope.processing = true;
    var trackId = $location.search().trackid;
    DownloadTrackService.getDownloadTrack(trackId).then(receiveDownloadTrack).then(receiveTrackData)['catch'](catchDownloadTrackError);

    function receiveDownloadTrack(result) {
      track = {
        trackURL: result.data.trackUrl,
        downloadURL: result.data.downloadUrl,
        email: result.data.email
      };

      return DownloadTrackService.getTrackData(track);
    }

    function receiveTrackData(result) {

      trackData = {
        trackID: result.data.id,
        artistID: result.data.user_id,
        title: result.data.title,
        downloadURL: result.data.download_url,
        trackURL: result.data.trackURL
      };

      SC.oEmbed(trackData.trackURL, {
        element: document.getElementById('scPlayer'),
        auto_play: false,
        maxheight: 150
      });
      $scope.embedTrack = true;
      $scope.processing = false;
    }

    function catchDownloadTrackError() {
      $scope.processing = false;
      $scope.embedTrack = false;
    }
  };

  /* On click download track button */

  $scope.downloadTrack = function () {
    $scope.processing = true;
    $scope.errorText = '';
    $http.get('api/soundcloud/soundcloudConfig').then(function (res) {
      SC.initialize({
        client_id: res.data.clientID,
        redirect_uri: res.data.callbackURL,
        scope: "non-expiring"
      });
      $scope.clientIDString = res.data.clientID.toString();
      return SC.connect();
    }).then(performTasks).then(initDownload)['catch'](catchTasksError);

    function performTasks(res) {
      taskObj = {
        token: res.oauth_token,
        trackId: trackData.trackID,
        artistId: trackData.artistID
      };
      return DownloadTrackService.performTasks(taskObj);
    }

    function initDownload(res) {
      /* Need to intiate download here */

      if (track.downloadURL && track.downloadURL !== '') {
        $window.location.href = track.downloadURL;
      } else if (trackData.downloadURL && taskObj.token) {
        $window.location.href = trackData.downloadURL + '?cliend_id=' + $scope.clientIDString + '&oauth_token=' + taskObj.token.toString();
      } else {
        $scope.errorText = 'Error! Could not fetch download URL';
        $scope.downloadURLNotFound = true;
        $scope.$apply();
      }
      $scope.processing = false;
      return;
    }

    function catchTasksError(err) {
      alert('Error in processing your request');
      $scope.processing = false;
    }
  };
}]);

app.service('DownloadTrackService', ['$http', function ($http) {

  function getDownloadTrack(data) {
    return $http.get('/api/download/track?trackid=' + data);
  }

  function getTrackData(data) {
    return $http.post('/api/soundcloud/soundcloudTrack', { url: data.trackURL });
  }

  function performTasks(data) {
    return $http.post('api/download/tasks', data);
  }

  return {
    getDownloadTrack: getDownloadTrack,
    getTrackData: getTrackData,
    performTasks: performTasks
  };
}]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImRhdGFiYXNlL2RhdGFiYXNlLmpzIiwiZnNhL2ZzYS1wcmUtYnVpbHQuanMiLCJsb2dpbi9sb2dpbi5qcyIsInNjaGVkdWxlci9zY2hlZHVsZXIuanMiLCJzdWJtaXQvc3VibWl0LmpzIiwiZGF0YWJhc2UvYXV0b0VtYWlscy9hdXRvRW1haWxzLmpzIiwiZGF0YWJhc2UvYXV0b0VtYWlscy9hdXRvRW1haWxzTGlzdC5qcyIsImRvd25sb2FkVHJhY2svY29udHJvbGxlcnMvZG93bmxvYWRUcmFja0NvbnRyb2xsZXIuanMiLCJkb3dubG9hZFRyYWNrL3NlcnZpY2VzL2Rvd25sb2FkVHJhY2tTZXJ2aWNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQUEsQ0FBQTtBQUNBLE1BQUEsQ0FBQSxHQUFBLEdBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSx1QkFBQSxFQUFBLENBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQSxjQUFBLEVBQUEsV0FBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQSxpQkFBQSxFQUFBOztBQUVBLG1CQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBOztBQUVBLG9CQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOzs7QUFHQSxHQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7OztBQUdBLE1BQUEsNEJBQUEsR0FBQSxTQUFBLDRCQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxDQUFBO0dBQ0EsQ0FBQTs7OztBQUlBLFlBQUEsQ0FBQSxHQUFBLENBQUEsbUJBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsUUFBQSxFQUFBOztBQUVBLFFBQUEsQ0FBQSw0QkFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBOzs7QUFHQSxhQUFBO0tBQ0E7O0FBRUEsUUFBQSxXQUFBLENBQUEsZUFBQSxFQUFBLEVBQUE7OztBQUdBLGFBQUE7S0FDQTs7O0FBR0EsU0FBQSxDQUFBLGNBQUEsRUFBQSxDQUFBOztBQUVBLGVBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7Ozs7QUFJQSxVQUFBLElBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsRUFBQSxRQUFBLENBQUEsQ0FBQTtPQUNBLE1BQUE7QUFDQSxjQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO09BQ0E7S0FDQSxDQUFBLENBQUE7R0FFQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FDbERBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsaUJBQUE7QUFDQSxlQUFBLEVBQUEsMkJBQUE7QUFDQSxjQUFBLEVBQUEsb0JBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxpQkFBQSxFQUFBLENBQUEsUUFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0EsU0FBQTtBQUNBLFlBQUEsRUFBQSxJQUFBO0FBQ0EsU0FBQSxFQUFBLElBQUE7QUFDQSxZQUFBLEVBQUEsOERBQUEsR0FDQSxtSEFBQSxHQUNBLFFBQUE7QUFDQSxRQUFBLEVBQUEsY0FBQSxNQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxVQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsRUFBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLElBQUEsRUFBQTtBQUNBLFlBQUEsVUFBQSxHQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxHQUFBLFVBQUEsQ0FBQTtBQUNBLFlBQUEsVUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsR0FBQSxDQUFBLE9BQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBO1NBQ0E7T0FDQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLG9CQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLEtBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsV0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQTtBQUNBLFFBQUEsRUFBQSxVQUFBO0FBQ0EsU0FBQSxFQUFBLFVBQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLE9BQUE7QUFDQSxTQUFBLEVBQUEsT0FBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsTUFBQTtBQUNBLFNBQUEsRUFBQSxNQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxLQUFBO0FBQ0EsU0FBQSxFQUFBLE9BQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLE9BQUE7QUFDQSxTQUFBLEVBQUEsT0FBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsYUFBQTtBQUNBLFNBQUEsRUFBQSxhQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxXQUFBO0FBQ0EsU0FBQSxFQUFBLFdBQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLGtCQUFBO0FBQ0EsU0FBQSxFQUFBLFdBQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLFVBQUE7QUFDQSxTQUFBLEVBQUEsYUFBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsV0FBQTtBQUNBLFNBQUEsRUFBQSxjQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxTQUFBO0FBQ0EsU0FBQSxFQUFBLFlBQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLFNBQUE7QUFDQSxTQUFBLEVBQUEsWUFBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsVUFBQTtBQUNBLFNBQUEsRUFBQSxVQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxnQkFBQTtBQUNBLFNBQUEsRUFBQSxhQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxZQUFBO0FBQ0EsU0FBQSxFQUFBLFdBQUE7R0FDQSxDQUFBLENBQUE7QUFDQSxRQUFBLENBQUEscUJBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsS0FBQSxHQUFBO0FBQ0EsWUFBQSxFQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsRUFBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxHQUFBLEdBQUE7QUFDQSxRQUFBLEVBQUEsU0FBQTtBQUNBLFNBQUEsRUFBQSxDQUFBO0FBQ0EsV0FBQSxFQUFBLEtBQUE7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFVBQUEsR0FBQTtBQUNBLGlCQUFBLEVBQUEsRUFBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLEtBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsRUFBQTtBQUNBLGNBQUEsRUFBQSxNQUFBLENBQUEsUUFBQTtLQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLGdCQUFBLENBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUE7S0FDQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSx1QkFBQSxFQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsZ0ZBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsR0FBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUE7S0FDQSxDQUFBLFNBQ0EsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGtCQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLElBQUEsU0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLE1BQUEsR0FBQSxJQUFBLENBQUE7S0FDQSxNQUFBLElBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLElBQUEsYUFBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLE1BQUEsR0FBQSxLQUFBLENBQUE7S0FDQTtBQUNBLFFBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLFNBQUEsR0FBQSxPQUFBLENBQUE7S0FDQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLFNBQUEsR0FBQSxPQUFBLENBQUE7S0FDQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUEsS0FBQSxDQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLFNBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxPQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxlQUFBLEdBQUEsQ0FBQSxLQUFBLEtBQUEsSUFBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGVBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0FBQ0EsUUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLGVBQUEsRUFBQSxLQUFBLENBQUEsZUFBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsZUFBQSxDQUFBO0FBQ0EsUUFBQSxJQUFBLEdBQUE7QUFDQSxXQUFBLEVBQUEsS0FBQTtBQUNBLGNBQUEsRUFBQSxVQUFBLENBQUEsUUFBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsRUFBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEscUJBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsb0JBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxLQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsV0FBQSxDQUFBLFdBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLEdBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsU0FBQSxHQUFBLE9BQUEsQ0FBQTtLQUNBO0FBQ0EsUUFBQSxNQUFBLENBQUEsV0FBQSxDQUFBLFdBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLEdBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsU0FBQSxHQUFBLE9BQUEsQ0FBQTtLQUNBO0FBQ0EsUUFBQSxNQUFBLENBQUEsV0FBQSxDQUFBLEtBQUEsRUFBQSxLQUFBLENBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxJQUFBLEdBQUE7QUFDQSxXQUFBLEVBQUEsS0FBQTtBQUNBLGNBQUEsRUFBQSxVQUFBLENBQUEsUUFBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsNEJBQUEsRUFBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsY0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsMkJBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsUUFBQSxNQUFBLEdBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLEVBQUEsUUFBQTtBQUNBLGNBQUEsRUFBQSxRQUFBO0tBQ0EsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLHFCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLDJCQUFBLEdBQUEsS0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsMkJBQUEsRUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsR0FBQTtBQUNBLGdCQUFBLEVBQUEsRUFBQTtBQUNBLG1CQUFBLEVBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxFQUFBO09BQ0EsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxpQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLDRCQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEscUJBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLDBCQUFBLEVBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUE7QUFDQSxxQkFBQSxFQUFBLEVBQUE7T0FDQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLGlDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsNEJBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOzs7O0FBS0EsUUFBQSxDQUFBLEVBQUEsQ0FBQSxjQUFBLEVBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxRQUFBLFVBQUEsR0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsR0FBQSxVQUFBLENBQUE7QUFDQSxRQUFBLFVBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsZ0JBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ2pRQSxDQUFBLFlBQUE7O0FBRUEsY0FBQSxDQUFBOztBQUVBLE1BQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxFQUFBLE1BQUEsSUFBQSxLQUFBLENBQUEsd0JBQUEsQ0FBQSxDQUFBOztBQUVBLE1BQUEsR0FBQSxHQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsYUFBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBOztBQUVBLEtBQUEsQ0FBQSxPQUFBLENBQUEsWUFBQSxFQUFBLFlBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsRUFBQSxNQUFBLElBQUEsS0FBQSxDQUFBLHNCQUFBLENBQUEsQ0FBQTtBQUNBLFdBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQSxDQUFBOztBQUVBLEtBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLFVBQUEsRUFBQTtBQUNBLFdBQUE7QUFDQSxRQUFBLEVBQUEsWUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxFQUFBLENBQUEsU0FBQSxFQUFBLFlBQUE7QUFDQSxjQUFBLElBQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxvQkFBQSxDQUFBLE1BQUEsQ0FBQSxZQUFBO0FBQ0Esb0JBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO1dBQ0EsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0E7QUFDQSxVQUFBLEVBQUEsY0FBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLFFBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUEsWUFBQTtBQUNBLGNBQUEsSUFBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLG9CQUFBLENBQUEsTUFBQSxDQUFBLFlBQUE7QUFDQSxnQkFBQSxRQUFBLEVBQUE7QUFDQSxzQkFBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7YUFDQTtXQUNBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBO0tBQ0EsQ0FBQTtHQUNBLENBQUEsQ0FBQTs7Ozs7QUFLQSxLQUFBLENBQUEsUUFBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLGdCQUFBLEVBQUEsb0JBQUE7QUFDQSxlQUFBLEVBQUEsbUJBQUE7QUFDQSxpQkFBQSxFQUFBLHFCQUFBO0FBQ0Esa0JBQUEsRUFBQSxzQkFBQTtBQUNBLG9CQUFBLEVBQUEsd0JBQUE7QUFDQSxpQkFBQSxFQUFBLHFCQUFBO0dBQ0EsQ0FBQSxDQUFBOztBQUVBLEtBQUEsQ0FBQSxPQUFBLENBQUEsaUJBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxFQUFBLEVBQUEsV0FBQSxFQUFBO0FBQ0EsUUFBQSxVQUFBLEdBQUE7QUFDQSxTQUFBLEVBQUEsV0FBQSxDQUFBLGdCQUFBO0FBQ0EsU0FBQSxFQUFBLFdBQUEsQ0FBQSxhQUFBO0FBQ0EsU0FBQSxFQUFBLFdBQUEsQ0FBQSxjQUFBO0FBQ0EsU0FBQSxFQUFBLFdBQUEsQ0FBQSxjQUFBO0tBQ0EsQ0FBQTtBQUNBLFdBQUE7QUFDQSxtQkFBQSxFQUFBLHVCQUFBLFFBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsVUFBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsUUFBQSxDQUFBLENBQUE7QUFDQSxlQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7T0FDQTtLQUNBLENBQUE7R0FDQSxDQUFBLENBQUE7O0FBRUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGFBQUEsRUFBQTtBQUNBLGlCQUFBLENBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLFdBQUEsRUFDQSxVQUFBLFNBQUEsRUFBQTtBQUNBLGFBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUE7S0FDQSxDQUNBLENBQUEsQ0FBQTtHQUNBLENBQUEsQ0FBQTs7QUFFQSxLQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxFQUFBLEVBQUE7O0FBRUEsYUFBQSxpQkFBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLFVBQUEsSUFBQSxHQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxhQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLEVBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxVQUFBLENBQUEsV0FBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsSUFBQSxDQUFBO0tBQ0E7Ozs7QUFJQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxhQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFVBQUEsVUFBQSxFQUFBOzs7Ozs7Ozs7O0FBVUEsVUFBQSxJQUFBLENBQUEsZUFBQSxFQUFBLElBQUEsVUFBQSxLQUFBLElBQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7T0FDQTs7Ozs7QUFLQSxhQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLGlCQUFBLENBQUEsU0FBQSxDQUFBLFlBQUE7QUFDQSxlQUFBLElBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUVBLENBQUE7O0FBRUEsUUFBQSxDQUFBLEtBQUEsR0FBQSxVQUFBLFdBQUEsRUFBQTtBQUNBLGFBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsV0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLGlCQUFBLENBQUEsU0FDQSxDQUFBLFlBQUE7QUFDQSxlQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLDRCQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxlQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLFVBQUEsQ0FBQSxXQUFBLENBQUEsYUFBQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBO0dBQ0EsQ0FBQSxDQUFBOztBQUVBLEtBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQTs7QUFFQSxRQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsY0FBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsZ0JBQUEsRUFBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOztBQUVBLGNBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGNBQUEsRUFBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxFQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsRUFBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO0tBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsT0FBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO0tBQ0EsQ0FBQTtHQUVBLENBQUEsQ0FBQTtDQUVBLENBQUEsRUFBQSxDQUFBO0FDM0pBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsUUFBQTtBQUNBLGVBQUEsRUFBQSxxQkFBQTtBQUNBLGNBQUEsRUFBQSxzQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFHQSxHQUFBLENBQUEsVUFBQSxDQUFBLHNCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsV0FBQSxFQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsZUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxLQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLEVBQUE7QUFDQSxjQUFBLEVBQUEsTUFBQSxDQUFBLFFBQUE7S0FDQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxnQkFBQSxDQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBO0tBQ0EsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQSxrQ0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsUUFBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBO0FBQ0Esb0JBQUEsRUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFdBQUE7QUFDQSxhQUFBLEVBQUEsY0FBQTtPQUNBLENBQUEsQ0FBQTtBQUNBLGFBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsV0FBQSxHQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsMEJBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxHQUFBLENBQUEsV0FBQTtBQUNBLGdCQUFBLEVBQUEsVUFBQSxDQUFBLFFBQUE7T0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLGFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxhQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLEVBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEVBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLHlCQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxHQUFBLENBQUEsNkJBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxXQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGVBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxnQ0FBQSxDQUFBLENBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsUUFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLFlBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxTQUFBLElBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBO0FBQ0EsVUFBQSxHQUFBLEdBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxlQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7S0FDQTtBQUNBLGNBQUEsQ0FBQSxZQUFBO0FBQ0EsYUFBQSxDQUFBLEdBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLE1BQUEsQ0FBQSxtQ0FBQSxHQUFBLEdBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxpQkFBQSxFQUFBLFFBQUEsQ0FBQSxjQUFBLENBQUEsR0FBQSxDQUFBLE9BQUEsR0FBQSxRQUFBLENBQUE7QUFDQSxtQkFBQSxFQUFBLEtBQUE7QUFDQSxtQkFBQSxFQUFBLEdBQUE7U0FDQSxDQUFBLENBQUE7T0FDQSxFQUFBLEVBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsSUFBQSxFQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsUUFBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxLQUFBLElBQUEsQ0FBQSxDQUFBLEVBQUE7QUFDQSxTQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7S0FDQSxNQUFBO0FBQ0EsU0FBQSxDQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxRQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUEsTUFBQSxJQUFBLENBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7S0FDQSxNQUFBO0FBQ0EsV0FBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsR0FBQSxDQUFBLHVCQUFBLEVBQUEsS0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFdBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7T0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxxQkFBQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxVQUFBLENBQUEsMEJBQUEsR0FBQSxVQUFBLENBQUEsR0FBQSxHQUFBLEdBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSx1QkFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsVUFBQSxDQUFBLDJCQUFBLEdBQUEsVUFBQSxDQUFBLEdBQUEsR0FBQSxHQUFBLEdBQUEsVUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFVBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFdBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsd0JBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ3ZLQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFlBQUE7QUFDQSxlQUFBLEVBQUEsNkJBQUE7QUFDQSxjQUFBLEVBQUEscUJBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBR0EsR0FBQSxDQUFBLFVBQUEsQ0FBQSxxQkFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFdBQUEsRUFBQTs7QUFFQSxRQUFBLENBQUEsWUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsTUFBQSxJQUFBLEdBQUEsVUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLE1BQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0dBQ0E7QUFDQSxRQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsV0FBQSxHQUFBLElBQUEsQ0FBQSxXQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFFBQUEsR0FBQSxjQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQSxDQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQSxlQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxxQkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLE9BQUEsR0FBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQTtBQUNBLFFBQUEsS0FBQSxHQUFBLElBQUEsSUFBQSxFQUFBLENBQUE7QUFDQSxRQUFBLEtBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxLQUFBLENBQUEsUUFBQSxFQUFBLEdBQUEsSUFBQSxFQUFBLE9BQUE7QUFDQSxVQUFBLENBQUEsV0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsV0FBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFlBQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsU0FBQSxHQUFBLFdBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxTQUFBLElBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxPQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxhQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFNBQUEsR0FBQTtBQUNBLGlCQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBO0FBQ0EsV0FBQSxFQUFBLE9BQUE7QUFDQSxZQUFBLEVBQUEsS0FBQTtPQUNBLENBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtLQUNBLE1BQUE7QUFDQSxZQUFBLENBQUEsWUFBQSxHQUFBLG9DQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLG9DQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLEtBQUE7QUFDQSxpQkFBQSxFQUFBLEdBQUE7T0FDQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsWUFBQSxHQUFBLFNBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFNBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLGlDQUFBLEVBQUE7QUFDQSxTQUFBLEVBQUEsTUFBQSxDQUFBLFlBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsWUFBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLFFBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBO0FBQ0EsaUJBQUEsRUFBQSxLQUFBO0FBQ0EsaUJBQUEsRUFBQSxHQUFBO09BQ0EsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsR0FBQSxRQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsV0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsV0FBQSxVQUFBLENBQUEsY0FBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxHQUFBLEdBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxXQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxpQkFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7QUFDQSxtQkFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsd0JBQUEsQ0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0EsTUFBQTtBQUNBLFVBQUEsV0FBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7QUFDQSxpQkFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EsVUFBQSxNQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsbUJBQUEsQ0FBQSxDQUFBO0tBQ0EsTUFBQTtBQUNBLFVBQUEsTUFBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLGFBQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxFQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsZUFBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxjQUFBLFdBQUEsR0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLG1CQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxDQUFBO1dBQ0EsQ0FBQSxDQUFBO0FBQ0EscUJBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7T0FDQSxNQUFBO0FBQ0EsY0FBQSxDQUFBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsYUFBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLEVBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxlQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsV0FBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsbUJBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLENBQUE7V0FDQSxDQUFBLENBQUE7QUFDQSxxQkFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsc0JBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0E7S0FDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFNBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFNBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsRUFBQSxPQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxZQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxHQUFBLENBQUEsaUNBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQTtBQUNBLG9CQUFBLEVBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBO0FBQ0EsYUFBQSxFQUFBLGNBQUE7T0FDQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsY0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxPQUFBLEdBQUEsNkNBQUEsR0FBQSxNQUFBLENBQUEsWUFBQSxHQUFBLGFBQUEsR0FBQSxNQUFBLENBQUEsY0FBQSxDQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTs7Ozs7O0FBTUEsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsUUFBQSxLQUFBLElBQUEsQ0FBQSxFQUFBLE9BQUE7QUFDQSxRQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsY0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFFBQUEsS0FBQSxJQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLEVBQUEsT0FBQTtBQUNBLFFBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7OztBQWdCQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxjQUFBLENBQUEsWUFBQTtBQUNBLFlBQUEsQ0FBQSxXQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLE1BQUEsQ0FBQSxtQ0FBQSxHQUFBLEdBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxpQkFBQSxFQUFBLFFBQUEsQ0FBQSxjQUFBLENBQUEsR0FBQSxDQUFBLE9BQUEsR0FBQSxRQUFBLENBQUE7QUFDQSxtQkFBQSxFQUFBLEtBQUE7QUFDQSxtQkFBQSxFQUFBLEdBQUE7U0FDQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7S0FDQSxFQUFBLEVBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsY0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFlBQUE7QUFDQSxXQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLE1BQUEsQ0FBQSxtQ0FBQSxHQUFBLE1BQUEsRUFBQTtBQUNBLGlCQUFBLEVBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxNQUFBLEdBQUEsUUFBQSxDQUFBO0FBQ0EsbUJBQUEsRUFBQSxLQUFBO0FBQ0EsbUJBQUEsRUFBQSxHQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0EsRUFBQSxFQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7QUFDQSxNQUFBLE1BQUEsQ0FBQSxPQUFBLElBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7R0FDQTtBQUNBLFFBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxTQUFBLGNBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxNQUFBLFFBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxNQUFBLEtBQUEsR0FBQSxJQUFBLElBQUEsRUFBQSxDQUFBO0FBQ0EsT0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxJQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxVQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsU0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0tBQ0E7QUFDQSxhQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsRUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0dBQ0E7QUFDQSxTQUFBLFFBQUEsQ0FBQTtDQUNBO0FDalRBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxZQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsR0FBQTtBQUNBLGVBQUEsRUFBQSx1QkFBQTtBQUNBLGNBQUEsRUFBQSxzQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLHNCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUE7O0FBRUEsUUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFNBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLGlDQUFBLEVBQUE7QUFDQSxTQUFBLEVBQUEsTUFBQSxDQUFBLEdBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxRQUFBLENBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsS0FBQTtBQUNBLGlCQUFBLEVBQUEsR0FBQTtPQUNBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxHQUFBLFFBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLGtCQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxLQUFBO0FBQ0EsYUFBQSxFQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsT0FBQTtBQUNBLFVBQUEsRUFBQSxNQUFBLENBQUEsVUFBQSxDQUFBLElBQUE7QUFDQSxXQUFBLEVBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxLQUFBO0FBQ0EsY0FBQSxFQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsUUFBQTtBQUNBLGdCQUFBLEVBQUEsRUFBQTtBQUNBLGdCQUFBLEVBQUEsRUFBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEseURBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsK0JBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ3pEQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsZUFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLGdDQUFBO0FBQ0EsZUFBQSxFQUFBLHdDQUFBO0FBQ0EsY0FBQSxFQUFBLHNCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxnQkFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLDZDQUFBO0FBQ0EsZUFBQSxFQUFBLHdDQUFBO0FBQ0EsY0FBQSxFQUFBLHNCQUFBO0dBbUJBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLHNCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsWUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBOztBQUdBLFFBQUEsQ0FBQSxhQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsTUFBQSxZQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLGFBQUEsR0FBQSxJQUFBLENBQUE7R0FDQTs7O0FBR0EsUUFBQSxDQUFBLFFBQUEsR0FBQTtBQUNBLFlBQUEsRUFBQSxLQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsV0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLFlBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxHQUFBLENBQUEsc0NBQUEsR0FBQSxZQUFBLENBQUEsVUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxRQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLFFBQUEsR0FBQSxRQUFBLENBQUE7U0FDQSxNQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxRQUFBLEdBQUEsRUFBQSxDQUFBO1NBQ0E7T0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSw4QkFBQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7S0FDQSxNQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7OztBQUdBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSwyQkFBQSxFQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsdUJBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxnQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQkEsUUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxHQUFBLFFBQUEsQ0FBQTtLQUNBLENBQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQzFHQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsZ0JBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSw0QkFBQTtBQUNBLGVBQUEsRUFBQSw0Q0FBQTtBQUNBLGNBQUEsRUFBQSwwQkFBQTtBQUNBLFdBQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxtQkFBQSxLQUFBLEVBQUE7QUFDQSxlQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsMEJBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxjQUFBLFFBQUEsRUFBQTtBQUNBLG1CQUFBLFFBQUEsQ0FBQTtXQUNBLE1BQUE7QUFDQSxtQkFBQTtBQUNBLHFCQUFBLEVBQUEsZ0JBQUE7YUFDQSxDQUFBO1dBQ0E7U0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGVBQUEsQ0FBQSw4QkFBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7T0FDQTtLQUNBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsMEJBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxXQUFBLEVBQUEsU0FBQSxFQUFBO0FBQ0EsUUFBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsU0FBQSxHQUFBLFNBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF1QkEsUUFBQSxDQUFBLElBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLDBCQUFBLEVBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsZ0NBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUE7S0FDQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUN2RkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxXQUFBO0FBQ0EsZUFBQSxFQUFBLDJDQUFBO0FBQ0EsY0FBQSxFQUFBLHlCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEseUJBQUEsRUFBQSxDQUFBLFlBQUEsRUFDQSxRQUFBLEVBQ0EsUUFBQSxFQUNBLE9BQUEsRUFDQSxXQUFBLEVBQ0EsU0FBQSxFQUNBLHNCQUFBLEVBQ0EsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsU0FBQSxFQUFBLE9BQUEsRUFBQSxvQkFBQSxFQUFBOztBQUVBLE1BQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLE1BQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLE1BQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsbUJBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQTs7OztBQUlBLFFBQUEsQ0FBQSxnQkFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUEsT0FBQSxHQUFBLFNBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUE7QUFDQSx3QkFBQSxDQUNBLGdCQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLG9CQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsZ0JBQUEsQ0FBQSxTQUNBLENBQUEsdUJBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsb0JBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxXQUFBLEdBQUE7QUFDQSxnQkFBQSxFQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsUUFBQTtBQUNBLG1CQUFBLEVBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBO0FBQ0EsYUFBQSxFQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQTtPQUNBLENBQUE7O0FBRUEsYUFBQSxvQkFBQSxDQUFBLFlBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsZ0JBQUEsQ0FBQSxNQUFBLEVBQUE7O0FBRUEsZUFBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsRUFBQTtBQUNBLGdCQUFBLEVBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBO0FBQ0EsYUFBQSxFQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQTtBQUNBLG1CQUFBLEVBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsZ0JBQUEsRUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLFFBQUE7T0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxRQUFBLENBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsS0FBQTtBQUNBLGlCQUFBLEVBQUEsR0FBQTtPQUNBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLHVCQUFBLEdBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOzs7O0FBS0EsUUFBQSxDQUFBLGFBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxHQUFBLENBQUEsaUNBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQTtBQUNBLG9CQUFBLEVBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBO0FBQ0EsYUFBQSxFQUFBLGNBQUE7T0FDQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsY0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0EsYUFBQSxFQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFlBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxZQUFBLENBQUEsU0FDQSxDQUFBLGVBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsWUFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsR0FBQTtBQUNBLGFBQUEsRUFBQSxHQUFBLENBQUEsV0FBQTtBQUNBLGVBQUEsRUFBQSxTQUFBLENBQUEsT0FBQTtBQUNBLGdCQUFBLEVBQUEsU0FBQSxDQUFBLFFBQUE7T0FDQSxDQUFBO0FBQ0EsYUFBQSxvQkFBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsWUFBQSxDQUFBLEdBQUEsRUFBQTs7O0FBR0EsVUFBQSxLQUFBLENBQUEsV0FBQSxJQUFBLEtBQUEsQ0FBQSxXQUFBLEtBQUEsRUFBQSxFQUFBO0FBQ0EsZUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsS0FBQSxDQUFBLFdBQUEsQ0FBQTtPQUNBLE1BQUEsSUFBQSxTQUFBLENBQUEsV0FBQSxJQUFBLE9BQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxlQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxTQUFBLENBQUEsV0FBQSxHQUFBLGFBQUEsR0FBQSxNQUFBLENBQUEsY0FBQSxHQUFBLGVBQUEsR0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO09BQ0EsTUFBQTtBQUNBLGNBQUEsQ0FBQSxTQUFBLEdBQUEscUNBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxtQkFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtPQUNBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxhQUFBO0tBQ0E7O0FBRUEsYUFBQSxlQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGtDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0E7R0FFQSxDQUFBO0NBQ0EsQ0FDQSxDQUFBLENBQUE7O0FDekhBLEdBQUEsQ0FBQSxPQUFBLENBQUEsc0JBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxXQUFBLGdCQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDhCQUFBLEdBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLFlBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsaUNBQUEsRUFBQSxFQUFBLEdBQUEsRUFBQSxJQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEsWUFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxvQkFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsU0FBQTtBQUNBLG9CQUFBLEVBQUEsZ0JBQUE7QUFDQSxnQkFBQSxFQUFBLFlBQUE7QUFDQSxnQkFBQSxFQUFBLFlBQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBLENBQUEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbndpbmRvdy5hcHAgPSBhbmd1bGFyLm1vZHVsZSgnRnVsbHN0YWNrR2VuZXJhdGVkQXBwJywgWydmc2FQcmVCdWlsdCcsICd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJywgJ25nQW5pbWF0ZSddKTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlcikge1xuICAgIC8vIFRoaXMgdHVybnMgb2ZmIGhhc2hiYW5nIHVybHMgKC8jYWJvdXQpIGFuZCBjaGFuZ2VzIGl0IHRvIHNvbWV0aGluZyBub3JtYWwgKC9hYm91dClcbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG4gICAgLy8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xufSk7XG5cbi8vIFRoaXMgYXBwLnJ1biBpcyBmb3IgY29udHJvbGxpbmcgYWNjZXNzIHRvIHNwZWNpZmljIHN0YXRlcy5cbmFwcC5ydW4oZnVuY3Rpb24gKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUpIHtcblxuICAgIC8vIFRoZSBnaXZlbiBzdGF0ZSByZXF1aXJlcyBhbiBhdXRoZW50aWNhdGVkIHVzZXIuXG4gICAgdmFyIGRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGggPSBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAgICAgcmV0dXJuIHN0YXRlLmRhdGEgJiYgc3RhdGUuZGF0YS5hdXRoZW50aWNhdGU7XG4gICAgfTtcblxuICAgIC8vICRzdGF0ZUNoYW5nZVN0YXJ0IGlzIGFuIGV2ZW50IGZpcmVkXG4gICAgLy8gd2hlbmV2ZXIgdGhlIHByb2Nlc3Mgb2YgY2hhbmdpbmcgYSBzdGF0ZSBiZWdpbnMuXG4gICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcykge1xuXG4gICAgICAgIGlmICghZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCh0b1N0YXRlKSkge1xuICAgICAgICAgICAgLy8gVGhlIGRlc3RpbmF0aW9uIHN0YXRlIGRvZXMgbm90IHJlcXVpcmUgYXV0aGVudGljYXRpb25cbiAgICAgICAgICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgICAgIC8vIFRoZSB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQuXG4gICAgICAgICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FuY2VsIG5hdmlnYXRpbmcgdG8gbmV3IHN0YXRlLlxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIC8vIElmIGEgdXNlciBpcyByZXRyaWV2ZWQsIHRoZW4gcmVuYXZpZ2F0ZSB0byB0aGUgZGVzdGluYXRpb25cbiAgICAgICAgICAgIC8vICh0aGUgc2Vjb25kIHRpbWUsIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpIHdpbGwgd29yaylcbiAgICAgICAgICAgIC8vIG90aGVyd2lzZSwgaWYgbm8gdXNlciBpcyBsb2dnZWQgaW4sIGdvIHRvIFwibG9naW5cIiBzdGF0ZS5cbiAgICAgICAgICAgIGlmICh1c2VyKSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKHRvU3RhdGUubmFtZSwgdG9QYXJhbXMpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG5cbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZGF0YWJhc2UnLCB7XG4gICAgdXJsOiAnL2FkbWluL2RhdGFiYXNlJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2RhdGFiYXNlL2RhdGFiYXNlLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdEYXRhYmFzZUNvbnRyb2xsZXInXG4gIH0pO1xufSk7XG5cbmFwcC5kaXJlY3RpdmUoJ25vdGlmaWNhdGlvbkJhcicsIFsnc29ja2V0JywgZnVuY3Rpb24oc29ja2V0KSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgc2NvcGU6IHRydWUsXG4gICAgdGVtcGxhdGU6ICc8ZGl2IHN0eWxlPVwibWFyZ2luOiAwIGF1dG87d2lkdGg6NTAlXCIgbmctc2hvdz1cImJhci52aXNpYmxlXCI+JyArXG4gICAgICAnPHVpYi1wcm9ncmVzcz48dWliLWJhciB2YWx1ZT1cImJhci52YWx1ZVwiIHR5cGU9XCJ7e2Jhci50eXBlfX1cIj48c3Bhbj57e2Jhci52YWx1ZX19JTwvc3Bhbj48L3VpYi1iYXI+PC91aWItcHJvZ3Jlc3M+JyArXG4gICAgICAnPC9kaXY+JyxcbiAgICBsaW5rOiBmdW5jdGlvbigkc2NvcGUsIGlFbG0sIGlBdHRycywgY29udHJvbGxlcikge1xuICAgICAgc29ja2V0Lm9uKCdub3RpZmljYXRpb24nLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBwZXJjZW50YWdlID0gcGFyc2VJbnQoTWF0aC5mbG9vcihkYXRhLmNvdW50ZXIgLyBkYXRhLnRvdGFsICogMTAwKSwgMTApO1xuICAgICAgICAkc2NvcGUuYmFyLnZhbHVlID0gcGVyY2VudGFnZTtcbiAgICAgICAgaWYgKHBlcmNlbnRhZ2UgPT09IDEwMCkge1xuICAgICAgICAgICRzY29wZS5iYXIudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICRzY29wZS5iYXIudmFsdWUgPSAwO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XSk7XG5cbmFwcC5jb250cm9sbGVyKCdEYXRhYmFzZUNvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsIEF1dGhTZXJ2aWNlLCBzb2NrZXQpIHtcbiAgJHNjb3BlLmFkZFVzZXIgPSB7fTtcbiAgJHNjb3BlLnF1ZXJ5ID0ge307XG4gICRzY29wZS50cmRVc3JRdWVyeSA9IHt9O1xuICAkc2NvcGUucXVlcnlDb2xzID0gW3tcbiAgICBuYW1lOiAndXNlcm5hbWUnLFxuICAgIHZhbHVlOiAndXNlcm5hbWUnXG4gIH0sIHtcbiAgICBuYW1lOiAnZ2VucmUnLFxuICAgIHZhbHVlOiAnZ2VucmUnXG4gIH0sIHtcbiAgICBuYW1lOiAnbmFtZScsXG4gICAgdmFsdWU6ICduYW1lJ1xuICB9LCB7XG4gICAgbmFtZTogJ1VSTCcsXG4gICAgdmFsdWU6ICdzY1VSTCdcbiAgfSwge1xuICAgIG5hbWU6ICdlbWFpbCcsXG4gICAgdmFsdWU6ICdlbWFpbCdcbiAgfSwge1xuICAgIG5hbWU6ICdkZXNjcmlwdGlvbicsXG4gICAgdmFsdWU6ICdkZXNjcmlwdGlvbidcbiAgfSwge1xuICAgIG5hbWU6ICdmb2xsb3dlcnMnLFxuICAgIHZhbHVlOiAnZm9sbG93ZXJzJ1xuICB9LCB7XG4gICAgbmFtZTogJ251bWJlciBvZiB0cmFja3MnLFxuICAgIHZhbHVlOiAnbnVtVHJhY2tzJ1xuICB9LCB7XG4gICAgbmFtZTogJ2ZhY2Vib29rJyxcbiAgICB2YWx1ZTogJ2ZhY2Vib29rVVJMJ1xuICB9LCB7XG4gICAgbmFtZTogJ2luc3RhZ3JhbScsXG4gICAgdmFsdWU6ICdpbnN0YWdyYW1VUkwnXG4gIH0sIHtcbiAgICBuYW1lOiAndHdpdHRlcicsXG4gICAgdmFsdWU6ICd0d2l0dGVyVVJMJ1xuICB9LCB7XG4gICAgbmFtZTogJ3lvdXR1YmUnLFxuICAgIHZhbHVlOiAneW91dHViZVVSTCdcbiAgfSwge1xuICAgIG5hbWU6ICd3ZWJzaXRlcycsXG4gICAgdmFsdWU6ICd3ZWJzaXRlcydcbiAgfSwge1xuICAgIG5hbWU6ICdhdXRvIGVtYWlsIGRheScsXG4gICAgdmFsdWU6ICdlbWFpbERheU51bSdcbiAgfSwge1xuICAgIG5hbWU6ICdhbGwgZW1haWxzJyxcbiAgICB2YWx1ZTogJ2FsbEVtYWlscydcbiAgfV07XG4gICRzY29wZS5kb3dubG9hZEJ1dHRvblZpc2libGUgPSBmYWxzZTtcbiAgJHNjb3BlLnRyYWNrID0ge1xuICAgIHRyYWNrVXJsOiAnJyxcbiAgICBkb3dubG9hZFVybDogJycsXG4gICAgZW1haWw6ICcnXG4gIH07XG4gICRzY29wZS5iYXIgPSB7XG4gICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgIHZhbHVlOiAwLFxuICAgIHZpc2libGU6IGZhbHNlXG4gIH07XG4gICRzY29wZS5wYWlkUmVwb3N0ID0ge1xuICAgIHNvdW5kQ2xvdWRVcmw6ICcnXG4gIH07XG5cbiAgJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLnBvc3QoJy9hcGkvbG9naW4nLCB7XG4gICAgICBwYXNzd29yZDogJHNjb3BlLnBhc3N3b3JkXG4gICAgfSkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICRyb290U2NvcGUucGFzc3dvcmQgPSAkc2NvcGUucGFzc3dvcmQ7XG4gICAgICAkc2NvcGUubG9nZ2VkSW4gPSB0cnVlO1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICBhbGVydCgnV3JvbmcgUGFzc3dvcmQnKTtcbiAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAkaHR0cC5nZXQoJy9hcGkvbG9nb3V0JykudGhlbihmdW5jdGlvbigpIHtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hZG1pbic7XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgYWxlcnQoJ1dyb25nIFBhc3N3b3JkJyk7XG4gICAgfSk7XG4gIH1cblxuICAkc2NvcGUuc2F2ZUFkZFVzZXIgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJHNjb3BlLmFkZFVzZXIucGFzc3dvcmQgPSAkcm9vdFNjb3BlLnBhc3N3b3JkO1xuICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvYWRkdXNlcicsICRzY29wZS5hZGRVc2VyKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIGFsZXJ0KFwiU3VjY2VzczogRGF0YWJhc2UgaXMgYmVpbmcgcG9wdWxhdGVkLiBZb3Ugd2lsbCBiZSBlbWFpbGVkIHdoZW4gaXQgaXMgY29tcGxldGUuXCIpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAkc2NvcGUuYmFyLnZpc2libGUgPSB0cnVlO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgYWxlcnQoJ0JhZCBzdWJtaXNzaW9uJyk7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5jcmVhdGVVc2VyUXVlcnlEb2MgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcXVlcnkgPSB7fTtcbiAgICBpZiAoJHNjb3BlLnF1ZXJ5LmFydGlzdCA9PSBcImFydGlzdHNcIikge1xuICAgICAgcXVlcnkuYXJ0aXN0ID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKCRzY29wZS5xdWVyeS5hcnRpc3QgPT0gXCJub24tYXJ0aXN0c1wiKSB7XG4gICAgICBxdWVyeS5hcnRpc3QgPSBmYWxzZTtcbiAgICB9XG4gICAgdmFyIGZsd3JRcnkgPSB7fTtcbiAgICBpZiAoJHNjb3BlLnF1ZXJ5LmZvbGxvd2Vyc0dUKSB7XG4gICAgICBmbHdyUXJ5LiRndCA9ICRzY29wZS5xdWVyeS5mb2xsb3dlcnNHVDtcbiAgICAgIHF1ZXJ5LmZvbGxvd2VycyA9IGZsd3JRcnk7XG4gICAgfVxuICAgIGlmICgkc2NvcGUucXVlcnkuZm9sbG93ZXJzTFQpIHtcbiAgICAgIGZsd3JRcnkuJGx0ID0gJHNjb3BlLnF1ZXJ5LmZvbGxvd2Vyc0xUO1xuICAgICAgcXVlcnkuZm9sbG93ZXJzID0gZmx3clFyeTtcbiAgICB9XG4gICAgaWYgKCRzY29wZS5xdWVyeS5nZW5yZSkgcXVlcnkuZ2VucmUgPSAkc2NvcGUucXVlcnkuZ2VucmU7XG4gICAgaWYgKCRzY29wZS5xdWVyeUNvbHMpIHtcbiAgICAgIHF1ZXJ5LmNvbHVtbnMgPSAkc2NvcGUucXVlcnlDb2xzLmZpbHRlcihmdW5jdGlvbihlbG0pIHtcbiAgICAgICAgcmV0dXJuIGVsbS52YWx1ZSAhPT0gbnVsbDtcbiAgICAgIH0pLm1hcChmdW5jdGlvbihlbG0pIHtcbiAgICAgICAgcmV0dXJuIGVsbS52YWx1ZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoJHNjb3BlLnF1ZXJ5LnRyYWNrZWRVc2Vyc1VSTCkgcXVlcnkudHJhY2tlZFVzZXJzVVJMID0gJHNjb3BlLnF1ZXJ5LnRyYWNrZWRVc2Vyc1VSTDtcbiAgICB2YXIgYm9keSA9IHtcbiAgICAgIHF1ZXJ5OiBxdWVyeSxcbiAgICAgIHBhc3N3b3JkOiAkcm9vdFNjb3BlLnBhc3N3b3JkXG4gICAgfTtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS9mb2xsb3dlcnMnLCBib2R5KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS5maWxlbmFtZSA9IHJlcy5kYXRhO1xuICAgICAgICAkc2NvcGUuZG93bmxvYWRCdXR0b25WaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgYWxlcnQoXCJFUlJPUjogQmFkIFF1ZXJ5IG9yIE5vIE1hdGNoZXNcIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5jcmVhdGVUcmRVc3JRdWVyeURvYyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBxdWVyeSA9IHt9O1xuICAgIHZhciBmbHdyUXJ5ID0ge307XG4gICAgaWYgKCRzY29wZS50cmRVc3JRdWVyeS5mb2xsb3dlcnNHVCkge1xuICAgICAgZmx3clFyeS4kZ3QgPSAkc2NvcGUudHJkVXNyUXVlcnkuZm9sbG93ZXJzR1Q7XG4gICAgICBxdWVyeS5mb2xsb3dlcnMgPSBmbHdyUXJ5O1xuICAgIH1cbiAgICBpZiAoJHNjb3BlLnRyZFVzclF1ZXJ5LmZvbGxvd2Vyc0xUKSB7XG4gICAgICBmbHdyUXJ5LiRsdCA9ICRzY29wZS50cmRVc3JRdWVyeS5mb2xsb3dlcnNMVDtcbiAgICAgIHF1ZXJ5LmZvbGxvd2VycyA9IGZsd3JRcnk7XG4gICAgfVxuICAgIGlmICgkc2NvcGUudHJkVXNyUXVlcnkuZ2VucmUpIHF1ZXJ5LmdlbnJlID0gJHNjb3BlLnRyZFVzclF1ZXJ5LmdlbnJlO1xuICAgIHZhciBib2R5ID0ge1xuICAgICAgcXVlcnk6IHF1ZXJ5LFxuICAgICAgcGFzc3dvcmQ6ICRyb290U2NvcGUucGFzc3dvcmRcbiAgICB9O1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL3RyYWNrZWRVc2VycycsIGJvZHkpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHNjb3BlLnRyZFVzckZpbGVuYW1lID0gcmVzLmRhdGE7XG4gICAgICAgICRzY29wZS5kb3dubG9hZFRyZFVzckJ1dHRvblZpc2libGUgPSB0cnVlO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBhbGVydChcIkVSUk9SOiBCYWQgUXVlcnkgb3IgTm8gTWF0Y2hlc1wiKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmRvd25sb2FkID0gZnVuY3Rpb24oZmlsZW5hbWUpIHtcbiAgICB2YXIgYW5jaG9yID0gYW5ndWxhci5lbGVtZW50KCc8YS8+Jyk7XG4gICAgYW5jaG9yLmF0dHIoe1xuICAgICAgaHJlZjogZmlsZW5hbWUsXG4gICAgICBkb3dubG9hZDogZmlsZW5hbWVcbiAgICB9KVswXS5jbGljaygpO1xuICAgICRzY29wZS5kb3dubG9hZEJ1dHRvblZpc2libGUgPSBmYWxzZTtcbiAgICAkc2NvcGUuZG93bmxvYWRUcmRVc3JCdXR0b25WaXNpYmxlID0gZmFsc2U7XG4gIH1cblxuICAkc2NvcGUuc2F2ZURvd25sb2FkVXJsID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvZG93bmxvYWR1cmwnLCAkc2NvcGUudHJhY2spXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHNjb3BlLnRyYWNrID0ge1xuICAgICAgICAgIHRyYWNrVXJsOiAnJyxcbiAgICAgICAgICBkb3dubG9hZFVybDogJycsXG4gICAgICAgICAgZW1haWw6ICcnXG4gICAgICAgIH07XG4gICAgICAgIGFsZXJ0KFwiU1VDQ0VTUzogVXJsIHNhdmVkIHN1Y2Nlc3NmdWxseVwiKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgYWxlcnQoXCJFUlJPUjogRXJyb3IgaW4gc2F2aW5nIHVybFwiKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLnNhdmVQYWlkUmVwb3N0Q2hhbm5lbCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL3BhaWRyZXBvc3QnLCAkc2NvcGUucGFpZFJlcG9zdClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUucGFpZFJlcG9zdCA9IHtcbiAgICAgICAgICBzb3VuZENsb3VkVXJsOiAnJ1xuICAgICAgICB9O1xuICAgICAgICBhbGVydChcIlNVQ0NFU1M6IFVybCBzYXZlZCBzdWNjZXNzZnVsbHlcIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGFsZXJ0KFwiRVJST1I6IEVycm9yIGluIHNhdmluZyB1cmxcIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfVxuXG5cbiAgLyogTGlzdGVuIHRvIHNvY2tldCBldmVudHMgKi9cblxuICBzb2NrZXQub24oJ25vdGlmaWNhdGlvbicsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB2YXIgcGVyY2VudGFnZSA9IHBhcnNlSW50KE1hdGguZmxvb3IoZGF0YS5jb3VudGVyIC8gZGF0YS50b3RhbCAqIDEwMCksIDEwKTtcbiAgICAkc2NvcGUuYmFyLnZhbHVlID0gcGVyY2VudGFnZTtcbiAgICBpZiAocGVyY2VudGFnZSA9PT0gMTAwKSB7XG4gICAgICAkc2NvcGUuc3RhdHVzQmFyVmlzaWJsZSA9IGZhbHNlO1xuICAgICAgJHNjb3BlLmJhci52YWx1ZSA9IDA7XG4gICAgfVxuICB9KTtcbn0pOyIsIihmdW5jdGlvbigpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcbiAgICAvLyBIb3BlIHlvdSBkaWRuJ3QgZm9yZ2V0IEFuZ3VsYXIhIER1aC1kb3kuXG4gICAgaWYgKCF3aW5kb3cuYW5ndWxhcikgdGhyb3cgbmV3IEVycm9yKCdJIGNhblxcJ3QgZmluZCBBbmd1bGFyIScpO1xuXG4gICAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdmc2FQcmVCdWlsdCcsIFtdKTtcblxuICAgIGFwcC5mYWN0b3J5KCdpbml0U29ja2V0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghd2luZG93LmlvKSB0aHJvdyBuZXcgRXJyb3IoJ3NvY2tldC5pbyBub3QgZm91bmQhJyk7XG4gICAgICAgIHJldHVybiB3aW5kb3cuaW8od2luZG93LmxvY2F0aW9uLm9yaWdpbik7XG4gICAgfSk7XG5cbiAgICBhcHAuZmFjdG9yeSgnc29ja2V0JywgZnVuY3Rpb24oJHJvb3RTY29wZSwgaW5pdFNvY2tldCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgb246IGZ1bmN0aW9uKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBpbml0U29ja2V0Lm9uKGV2ZW50TmFtZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KGluaXRTb2NrZXQsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbWl0OiBmdW5jdGlvbihldmVudE5hbWUsIGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgaW5pdFNvY2tldC5lbWl0KGV2ZW50TmFtZSwgZGF0YSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KGluaXRTb2NrZXQsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgLy8gQVVUSF9FVkVOVFMgaXMgdXNlZCB0aHJvdWdob3V0IG91ciBhcHAgdG9cbiAgICAvLyBicm9hZGNhc3QgYW5kIGxpc3RlbiBmcm9tIGFuZCB0byB0aGUgJHJvb3RTY29wZVxuICAgIC8vIGZvciBpbXBvcnRhbnQgZXZlbnRzIGFib3V0IGF1dGhlbnRpY2F0aW9uIGZsb3cuXG4gICAgYXBwLmNvbnN0YW50KCdBVVRIX0VWRU5UUycsIHtcbiAgICAgICAgbG9naW5TdWNjZXNzOiAnYXV0aC1sb2dpbi1zdWNjZXNzJyxcbiAgICAgICAgbG9naW5GYWlsZWQ6ICdhdXRoLWxvZ2luLWZhaWxlZCcsXG4gICAgICAgIGxvZ291dFN1Y2Nlc3M6ICdhdXRoLWxvZ291dC1zdWNjZXNzJyxcbiAgICAgICAgc2Vzc2lvblRpbWVvdXQ6ICdhdXRoLXNlc3Npb24tdGltZW91dCcsXG4gICAgICAgIG5vdEF1dGhlbnRpY2F0ZWQ6ICdhdXRoLW5vdC1hdXRoZW50aWNhdGVkJyxcbiAgICAgICAgbm90QXV0aG9yaXplZDogJ2F1dGgtbm90LWF1dGhvcml6ZWQnXG4gICAgfSk7XG5cbiAgICBhcHAuZmFjdG9yeSgnQXV0aEludGVyY2VwdG9yJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHEsIEFVVEhfRVZFTlRTKSB7XG4gICAgICAgIHZhciBzdGF0dXNEaWN0ID0ge1xuICAgICAgICAgICAgNDAxOiBBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLFxuICAgICAgICAgICAgNDAzOiBBVVRIX0VWRU5UUy5ub3RBdXRob3JpemVkLFxuICAgICAgICAgICAgNDE5OiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCxcbiAgICAgICAgICAgIDQ0MDogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXRcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3BvbnNlRXJyb3I6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KHN0YXR1c0RpY3RbcmVzcG9uc2Uuc3RhdHVzXSwgcmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QocmVzcG9uc2UpXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICBhcHAuY29uZmlnKGZ1bmN0aW9uKCRodHRwUHJvdmlkZXIpIHtcbiAgICAgICAgJGh0dHBQcm92aWRlci5pbnRlcmNlcHRvcnMucHVzaChbXG4gICAgICAgICAgICAnJGluamVjdG9yJyxcbiAgICAgICAgICAgIGZ1bmN0aW9uKCRpbmplY3Rvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiAkaW5qZWN0b3IuZ2V0KCdBdXRoSW50ZXJjZXB0b3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSk7XG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnQXV0aFNlcnZpY2UnLCBmdW5jdGlvbigkaHR0cCwgU2Vzc2lvbiwgJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMsICRxKSB7XG5cbiAgICAgICAgZnVuY3Rpb24gb25TdWNjZXNzZnVsTG9naW4ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIHZhciBkYXRhID0gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIFNlc3Npb24uY3JlYXRlKGRhdGEuaWQsIGRhdGEudXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzKTtcbiAgICAgICAgICAgIHJldHVybiBkYXRhLnVzZXI7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVc2VzIHRoZSBzZXNzaW9uIGZhY3RvcnkgdG8gc2VlIGlmIGFuXG4gICAgICAgIC8vIGF1dGhlbnRpY2F0ZWQgdXNlciBpcyBjdXJyZW50bHkgcmVnaXN0ZXJlZC5cbiAgICAgICAgdGhpcy5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAhIVNlc3Npb24udXNlcjtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdldExvZ2dlZEluVXNlciA9IGZ1bmN0aW9uKGZyb21TZXJ2ZXIpIHtcblxuICAgICAgICAgICAgLy8gSWYgYW4gYXV0aGVudGljYXRlZCBzZXNzaW9uIGV4aXN0cywgd2VcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdXNlciBhdHRhY2hlZCB0byB0aGF0IHNlc3Npb25cbiAgICAgICAgICAgIC8vIHdpdGggYSBwcm9taXNlLiBUaGlzIGVuc3VyZXMgdGhhdCB3ZSBjYW5cbiAgICAgICAgICAgIC8vIGFsd2F5cyBpbnRlcmZhY2Ugd2l0aCB0aGlzIG1ldGhvZCBhc3luY2hyb25vdXNseS5cblxuICAgICAgICAgICAgLy8gT3B0aW9uYWxseSwgaWYgdHJ1ZSBpcyBnaXZlbiBhcyB0aGUgZnJvbVNlcnZlciBwYXJhbWV0ZXIsXG4gICAgICAgICAgICAvLyB0aGVuIHRoaXMgY2FjaGVkIHZhbHVlIHdpbGwgbm90IGJlIHVzZWQuXG5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzQXV0aGVudGljYXRlZCgpICYmIGZyb21TZXJ2ZXIgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEud2hlbihTZXNzaW9uLnVzZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBNYWtlIHJlcXVlc3QgR0VUIC9zZXNzaW9uLlxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIHVzZXIsIGNhbGwgb25TdWNjZXNzZnVsTG9naW4gd2l0aCB0aGUgcmVzcG9uc2UuXG4gICAgICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgNDAxIHJlc3BvbnNlLCB3ZSBjYXRjaCBpdCBhbmQgaW5zdGVhZCByZXNvbHZlIHRvIG51bGwuXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvc2Vzc2lvbicpLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pLmNhdGNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmxvZ2luID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvbG9naW4nLCBjcmVkZW50aWFscylcbiAgICAgICAgICAgICAgICAudGhlbihvblN1Y2Nlc3NmdWxMb2dpbilcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ0ludmFsaWQgbG9naW4gY3JlZGVudGlhbHMuJ1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgU2Vzc2lvbi5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnU2Vzc2lvbicsIGZ1bmN0aW9uKCRyb290U2NvcGUsIEFVVEhfRVZFTlRTKSB7XG5cbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcblxuICAgICAgICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uKHNlc3Npb25JZCwgdXNlcikge1xuICAgICAgICAgICAgdGhpcy5pZCA9IHNlc3Npb25JZDtcbiAgICAgICAgICAgIHRoaXMudXNlciA9IHVzZXI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAgICAgICAgIHRoaXMudXNlciA9IG51bGw7XG4gICAgICAgIH07XG5cbiAgICB9KTtcblxufSkoKTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhZG1pbicsIHtcbiAgICB1cmw6ICcvYWRtaW4nLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvbG9naW4vbG9naW4uaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0FkbWluTG9naW5Db250cm9sbGVyJ1xuICB9KTtcbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdBZG1pbkxvZ2luQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgQXV0aFNlcnZpY2UpIHtcbiAgJHNjb3BlLmNvdW50ZXIgPSAwO1xuICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzID0gW107XG4gICRzY29wZS5zdWJtaXNzaW9ucyA9IFtdO1xuXG4gICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2xvZ2luJywge1xuICAgICAgcGFzc3dvcmQ6ICRzY29wZS5wYXNzd29yZFxuICAgIH0pLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAkcm9vdFNjb3BlLnBhc3N3b3JkID0gJHNjb3BlLnBhc3N3b3JkO1xuICAgICAgJHNjb3BlLnNob3dTdWJtaXNzaW9ucyA9IHRydWU7XG4gICAgICAkc2NvcGUubG9hZFN1Ym1pc3Npb25zKCk7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIGFsZXJ0KCdXcm9uZyBQYXNzd29yZCcpO1xuICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICRodHRwLmdldCgnL2FwaS9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2FkbWluJztcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICBhbGVydCgnV3JvbmcgUGFzc3dvcmQnKTtcbiAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5tYW5hZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAuZ2V0KCcvYXBpL3NvdW5kY2xvdWQvc291bmRjbG91ZENvbmZpZycpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgU0MuaW5pdGlhbGl6ZSh7XG4gICAgICAgICAgY2xpZW50X2lkOiByZXMuZGF0YS5jbGllbnRJRCxcbiAgICAgICAgICByZWRpcmVjdF91cmk6IHJlcy5kYXRhLmNhbGxiYWNrVVJMLFxuICAgICAgICAgIHNjb3BlOiBcIm5vbi1leHBpcmluZ1wiXG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gU0MuY29ubmVjdCgpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkcm9vdFNjb3BlLmFjY2Vzc1Rva2VuID0gcmVzLm9hdXRoX3Rva2VuO1xuICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9sb2dpbi9hdXRoZW50aWNhdGVkJywge1xuICAgICAgICAgIHRva2VuOiByZXMub2F1dGhfdG9rZW4sXG4gICAgICAgICAgcGFzc3dvcmQ6ICRyb290U2NvcGUucGFzc3dvcmQsXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICRyb290U2NvcGUuc2NoZWR1bGVySW5mbyA9IHJlcy5kYXRhO1xuICAgICAgICAkcm9vdFNjb3BlLnNjaGVkdWxlckluZm8uZXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXYpIHtcbiAgICAgICAgICBldi5kYXkgPSBuZXcgRGF0ZShldi5kYXkpO1xuICAgICAgICB9KTtcbiAgICAgICAgJHN0YXRlLmdvKCdzY2hlZHVsZXInKTtcbiAgICAgIH0pXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgYWxlcnQoJ0Vycm9yOiBDb3VsZCBub3QgbG9nIGluJyk7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5sb2FkU3VibWlzc2lvbnMgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAuZ2V0KCcvYXBpL3N1Ym1pc3Npb25zL3VuYWNjZXB0ZWQnKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS5zdWJtaXNzaW9ucyA9IHJlcy5kYXRhO1xuICAgICAgICBjb25zb2xlLmxvZyhyZXMuZGF0YSk7XG4gICAgICAgICRzY29wZS5sb2FkTW9yZSgpO1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2NoYW5uZWxzJyk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS5jaGFubmVscyA9IHJlcy5kYXRhO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICBhbGVydCgnRXJyb3I6IENvdWxkIG5vdCBnZXQgY2hhbm5lbHMuJylcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmxvYWRNb3JlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxvYWRFbGVtZW50cyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAkc2NvcGUuY291bnRlcjsgaSA8ICRzY29wZS5jb3VudGVyICsgMTU7IGkrKykge1xuICAgICAgdmFyIHN1YiA9ICRzY29wZS5zdWJtaXNzaW9uc1tpXTtcbiAgICAgICRzY29wZS5zaG93aW5nRWxlbWVudHMucHVzaChzdWIpO1xuICAgICAgbG9hZEVsZW1lbnRzLnB1c2goc3ViKTtcbiAgICB9XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIGNvbnNvbGUubG9nKGxvYWRFbGVtZW50cyk7XG4gICAgICBsb2FkRWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihzdWIpIHtcbiAgICAgICAgU0Mub0VtYmVkKFwiaHR0cDovL2FwaS5zb3VuZGNsb3VkLmNvbS90cmFja3MvXCIgKyBzdWIudHJhY2tJRCwge1xuICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHN1Yi50cmFja0lEICsgXCJwbGF5ZXJcIiksXG4gICAgICAgICAgYXV0b19wbGF5OiBmYWxzZSxcbiAgICAgICAgICBtYXhoZWlnaHQ6IDE1MFxuICAgICAgICB9KTtcbiAgICAgIH0sIDUwKVxuICAgIH0pO1xuICAgICRzY29wZS5jb3VudGVyICs9IDE1O1xuICB9XG5cbiAgJHNjb3BlLmNoYW5nZUJveCA9IGZ1bmN0aW9uKHN1YiwgY2hhbikge1xuICAgIHZhciBpbmRleCA9IHN1Yi5jaGFubmVsSURTLmluZGV4T2YoY2hhbi5jaGFubmVsSUQpO1xuICAgIGlmIChpbmRleCA9PSAtMSkge1xuICAgICAgc3ViLmNoYW5uZWxJRFMucHVzaChjaGFuLmNoYW5uZWxJRCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN1Yi5jaGFubmVsSURTLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLnNhdmUgPSBmdW5jdGlvbihzdWJtaSkge1xuICAgIGlmIChzdWJtaS5jaGFubmVsSURTLmxlbmd0aCA9PSAwKSB7XG4gICAgICAkc2NvcGUuZGVjbGluZShzdWJtaSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN1Ym1pLnBhc3N3b3JkID0gJHJvb3RTY29wZS5wYXNzd29yZDtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICRodHRwLnB1dChcIi9hcGkvc3VibWlzc2lvbnMvc2F2ZVwiLCBzdWJtaSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oc3ViKSB7XG4gICAgICAgICAgJHNjb3BlLnN1Ym1pc3Npb25zLnNwbGljZSgkc2NvcGUuc3VibWlzc2lvbnMuaW5kZXhPZihzdWJtaSksIDEpO1xuICAgICAgICAgIHdpbmRvdy5hbGVydChcIlNhdmVkXCIpO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgd2luZG93LmFsZXJ0KFwiRVJST1I6IGRpZCBub3QgU2F2ZVwiKVxuICAgICAgICB9KVxuICAgIH1cbiAgfVxuXG4gICRzY29wZS5pZ25vcmUgPSBmdW5jdGlvbihzdWJtaXNzaW9uKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLmRlbGV0ZSgnL2FwaS9zdWJtaXNzaW9ucy9pZ25vcmUvJyArIHN1Ym1pc3Npb24uX2lkICsgJy8nICsgJHJvb3RTY29wZS5wYXNzd29yZClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICB2YXIgaW5kZXggPSAkc2NvcGUuc3VibWlzc2lvbnMuaW5kZXhPZihzdWJtaXNzaW9uKTtcbiAgICAgICAgJHNjb3BlLnN1Ym1pc3Npb25zLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHdpbmRvdy5hbGVydChcIklnbm9yZWRcIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIHdpbmRvdy5hbGVydChcIkVSUk9SOiBkaWQgbm90IElnbm9yZVwiKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmRlY2xpbmUgPSBmdW5jdGlvbihzdWJtaXNzaW9uKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLmRlbGV0ZSgnL2FwaS9zdWJtaXNzaW9ucy9kZWNsaW5lLycgKyBzdWJtaXNzaW9uLl9pZCArICcvJyArICRyb290U2NvcGUucGFzc3dvcmQpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gJHNjb3BlLnN1Ym1pc3Npb25zLmluZGV4T2Yoc3VibWlzc2lvbik7XG4gICAgICAgICRzY29wZS5zdWJtaXNzaW9ucy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB3aW5kb3cuYWxlcnQoXCJEZWNsaW5lZFwiKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZVxuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB3aW5kb3cuYWxlcnQoXCJFUlJPUjogZGlkIG5vdCBEZWNsaW5lXCIpO1xuICAgICAgfSk7XG4gIH1cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3NjaGVkdWxlcicsIHtcbiAgICB1cmw6ICcvc2NoZWR1bGVyJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL3NjaGVkdWxlci9zY2hlZHVsZXIuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ1NjaGVkdWxlckNvbnRyb2xsZXInXG4gIH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ1NjaGVkdWxlckNvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsIEF1dGhTZXJ2aWNlKSB7XG5cbiAgJHNjb3BlLm1ha2VFdmVudFVSTCA9IFwiXCI7XG4gICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICB2YXIgaW5mbyA9ICRyb290U2NvcGUuc2NoZWR1bGVySW5mbztcbiAgaWYgKCFpbmZvKSB7XG4gICAgJHN0YXRlLmdvKCdhZG1pbicpO1xuICB9XG4gICRzY29wZS5jaGFubmVsID0gaW5mby5jaGFubmVsO1xuICAkc2NvcGUuc3VibWlzc2lvbnMgPSBpbmZvLnN1Ym1pc3Npb25zO1xuXG4gICRzY29wZS5jYWxlbmRhciA9IGZpbGxEYXRlQXJyYXlzKGluZm8uZXZlbnRzKTtcbiAgJHNjb3BlLmRheUluY3IgPSAwO1xuXG4gICRzY29wZS5zYXZlQ2hhbm5lbCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkc2NvcGUuY2hhbm5lbC5wYXNzd29yZCA9ICRyb290U2NvcGUucGFzc3dvcmQ7XG4gICAgJGh0dHAucHV0KFwiL2FwaS9jaGFubmVsc1wiLCAkc2NvcGUuY2hhbm5lbClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICB3aW5kb3cuYWxlcnQoXCJTYXZlZFwiKTtcbiAgICAgICAgJHNjb3BlLmNoYW5uZWwgPSByZXMuZGF0YTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgd2luZG93LmFsZXJ0KFwiRXJyb3I6IGRpZCBub3Qgc2F2ZVwiKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmluY3JEYXkgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLmRheUluY3IgPCAxNCkgJHNjb3BlLmRheUluY3IrKztcbiAgfVxuXG4gICRzY29wZS5kZWNyRGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCRzY29wZS5kYXlJbmNyID4gMCkgJHNjb3BlLmRheUluY3ItLTtcbiAgfVxuXG4gICRzY29wZS5jbGlja2VkU2xvdCA9IGZ1bmN0aW9uKGRheSwgaG91cikge1xuICAgIHZhciB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgaWYgKHRvZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09IGRheS50b0xvY2FsZURhdGVTdHJpbmcoKSAmJiB0b2RheS5nZXRIb3VycygpID4gaG91cikgcmV0dXJuO1xuICAgICRzY29wZS5zaG93T3ZlcmxheSA9IHRydWU7XG4gICAgdmFyIGNhbERheSA9IHt9O1xuICAgIHZhciBjYWxlbmRhckRheSA9ICRzY29wZS5jYWxlbmRhci5maW5kKGZ1bmN0aW9uKGNhbEQpIHtcbiAgICAgIHJldHVybiBjYWxELmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSBkYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XG4gICAgfSk7XG4gICAgJHNjb3BlLm1ha2VFdmVudFVSTCA9IHVuZGVmaW5lZDtcbiAgICAkc2NvcGUubWFrZUV2ZW50ID0gY2FsZW5kYXJEYXkuZXZlbnRzW2hvdXJdO1xuICAgIGlmICgkc2NvcGUubWFrZUV2ZW50ID09IFwiLVwiKSB7XG4gICAgICB2YXIgbWFrZURheSA9IG5ldyBEYXRlKGRheSk7XG4gICAgICBtYWtlRGF5LnNldEhvdXJzKGhvdXIpO1xuICAgICAgJHNjb3BlLm1ha2VFdmVudCA9IHtcbiAgICAgICAgY2hhbm5lbElEOiAkc2NvcGUuY2hhbm5lbC5jaGFubmVsSUQsXG4gICAgICAgIGRheTogbWFrZURheSxcbiAgICAgICAgcGFpZDogZmFsc2VcbiAgICAgIH07XG4gICAgICAkc2NvcGUubmV3RXZlbnQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUubWFrZUV2ZW50VVJMID0gJ2h0dHBzOi8vYXBpLnNvdW5kY2xvdWQuY29tL3RyYWNrcy8nICsgJHNjb3BlLm1ha2VFdmVudC50cmFja0lEO1xuICAgICAgU0Mub0VtYmVkKCdodHRwczovL2FwaS5zb3VuZGNsb3VkLmNvbS90cmFja3MvJyArICRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCwge1xuICAgICAgICBlbGVtZW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKSxcbiAgICAgICAgYXV0b19wbGF5OiBmYWxzZSxcbiAgICAgICAgbWF4aGVpZ2h0OiAxNTBcbiAgICAgIH0pO1xuICAgICAgJHNjb3BlLm5ld0V2ZW50ID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLmNoYW5nZVBhaWQgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQgPSB1bmRlZmluZWQ7XG4gICAgJHNjb3BlLm1ha2VFdmVudFVSTCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gICRzY29wZS5jaGFuZ2VVUkwgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAucG9zdCgnL2FwaS9zb3VuZGNsb3VkL3NvdW5kY2xvdWRUcmFjaycsIHtcbiAgICAgICAgdXJsOiAkc2NvcGUubWFrZUV2ZW50VVJMXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCA9IHJlcy5kYXRhLmlkO1xuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnRpdGxlID0gcmVzLmRhdGEudGl0bGU7XG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQudHJhY2tVUkwgPSByZXMuZGF0YS50cmFja1VSTDtcbiAgICAgICAgU0Mub0VtYmVkKCRzY29wZS5tYWtlRXZlbnRVUkwsIHtcbiAgICAgICAgICBlbGVtZW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKSxcbiAgICAgICAgICBhdXRvX3BsYXk6IGZhbHNlLFxuICAgICAgICAgIG1heGhlaWdodDogMTUwXG4gICAgICAgIH0pXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcbiAgICAgICAgJHNjb3BlLm5vdEZvdW5kID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KS50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgICAgJHNjb3BlLm5vdEZvdW5kID0gdHJ1ZTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmRlbGV0ZUV2ZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCEkc2NvcGUubmV3RXZlbnQpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICRodHRwLmRlbGV0ZSgnL2FwaS9ldmVudHMvJyArICRzY29wZS5tYWtlRXZlbnQuX2lkICsgJy8nICsgJHJvb3RTY29wZS5wYXNzd29yZClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdmFyIGNhbGVuZGFyRGF5ID0gJHNjb3BlLmNhbGVuZGFyLmZpbmQoZnVuY3Rpb24oY2FsRCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbEQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09ICRzY29wZS5tYWtlRXZlbnQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNhbGVuZGFyRGF5LmV2ZW50c1skc2NvcGUubWFrZUV2ZW50LmRheS5nZXRIb3VycygpXSA9IFwiLVwiO1xuICAgICAgICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgd2luZG93LmFsZXJ0KFwiRGVsZXRlZFwiKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJFUlJPUjogZGlkIG5vdCBEZWxldGUuXCIpXG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgY2FsZW5kYXJEYXkgPSAkc2NvcGUuY2FsZW5kYXIuZmluZChmdW5jdGlvbihjYWxEKSB7XG4gICAgICAgIHJldHVybiBjYWxELmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSAkc2NvcGUubWFrZUV2ZW50LmRheS50b0xvY2FsZURhdGVTdHJpbmcoKTtcbiAgICAgIH0pO1xuICAgICAgY2FsZW5kYXJEYXkuZXZlbnRzWyRzY29wZS5tYWtlRXZlbnQuZ2V0SG91cnMoKV0gPSBcIi1cIjtcbiAgICAgIHZhciBldmVudHNcbiAgICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gICRzY29wZS5zYXZlRXZlbnQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoISRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCAmJiAhJHNjb3BlLm1ha2VFdmVudC5wYWlkKSB7XG4gICAgICB3aW5kb3cuYWxlcnQoXCJFbnRlciBhIHRyYWNrIFVSTFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCRzY29wZS5uZXdFdmVudCkge1xuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnBhc3N3b3JkID0gJHJvb3RTY29wZS5wYXNzd29yZDtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgICAkaHR0cC5wb3N0KCcvYXBpL2V2ZW50cycsICRzY29wZS5tYWtlRXZlbnQpXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB2YXIgZXZlbnQgPSByZXMuZGF0YTtcbiAgICAgICAgICAgIGV2ZW50LmRheSA9IG5ldyBEYXRlKGV2ZW50LmRheSk7XG4gICAgICAgICAgICB2YXIgY2FsZW5kYXJEYXkgPSAkc2NvcGUuY2FsZW5kYXIuZmluZChmdW5jdGlvbihjYWxEKSB7XG4gICAgICAgICAgICAgIHJldHVybiBjYWxELmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSBldmVudC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNhbGVuZGFyRGF5LmV2ZW50c1tldmVudC5kYXkuZ2V0SG91cnMoKV0gPSBldmVudDtcbiAgICAgICAgICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHdpbmRvdy5hbGVydChcIlNhdmVkXCIpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgd2luZG93LmFsZXJ0KFwiRVJST1I6IGRpZCBub3QgU2F2ZS5cIik7XG4gICAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkc2NvcGUubmV3RXZlbnQucGFzc3dvcmQgPSAkcm9vdFNjb3BlLnBhc3N3b3JkO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAgICRodHRwLnB1dCgnL2FwaS9ldmVudHMnLCAkc2NvcGUubWFrZUV2ZW50KVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdmFyIGV2ZW50ID0gcmVzLmRhdGE7XG4gICAgICAgICAgICBldmVudC5kYXkgPSBuZXcgRGF0ZShldmVudC5kYXkpO1xuICAgICAgICAgICAgdmFyIGNhbGVuZGFyRGF5ID0gJHNjb3BlLmNhbGVuZGFyLmZpbmQoZnVuY3Rpb24oY2FsRCkge1xuICAgICAgICAgICAgICByZXR1cm4gY2FsRC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gZXZlbnQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjYWxlbmRhckRheS5ldmVudHNbZXZlbnQuZ2V0SG91cnMoKV0gPSBldmVudDtcbiAgICAgICAgICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHdpbmRvdy5hbGVydChcIlNhdmVkXCIpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgd2luZG93LmFsZXJ0KFwiRVJST1I6IGRpZCBub3QgU2F2ZS5cIik7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLmJhY2tFdmVudCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5tYWtlRXZlbnQgPSBudWxsO1xuICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICB9XG5cbiAgJHNjb3BlLnJlbW92ZVF1ZXVlU29uZyA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgJHNjb3BlLmNoYW5uZWwucXVldWUuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAkc2NvcGUuc2F2ZUNoYW5uZWwoKTtcbiAgfVxuXG4gICRzY29wZS5hZGRTb25nID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCRzY29wZS5jaGFubmVsLnF1ZXVlLmluZGV4T2YoJHNjb3BlLm5ld1F1ZXVlSUQpICE9IC0xKSByZXR1cm47XG4gICAgJHNjb3BlLmNoYW5uZWwucXVldWUucHVzaCgkc2NvcGUubmV3UXVldWVJRCk7XG4gICAgJHNjb3BlLnNhdmVDaGFubmVsKCk7XG4gICAgJHNjb3BlLm5ld1F1ZXVlU29uZyA9IHVuZGVmaW5lZDtcbiAgICAkc2NvcGUuY2hhbmdlUXVldWVTb25nKCk7XG4gICAgJHNjb3BlLmxvYWRRdWV1ZVNvbmdzKFskc2NvcGUubmV3UXVldWVJRF0pO1xuICB9XG5cbiAgJHNjb3BlLmNoYW5nZVF1ZXVlU29uZyA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5nZXQoJ2FwaS9zb3VuZGNsb3VkL3NvdW5kY2xvdWRDb25maWcnKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIFNDLmluaXRpYWxpemUoe1xuICAgICAgICAgIGNsaWVudF9pZDogcmVzLmRhdGEuY2xpZW50SUQsXG4gICAgICAgICAgcmVkaXJlY3RfdXJpOiByZXMuZGF0YS5jYWxsYmFja1VSTCxcbiAgICAgICAgICBzY29wZTogXCJub24tZXhwaXJpbmdcIlxuICAgICAgICB9KTtcbiAgICAgICAgJHNjb3BlLmNsaWVudElEU3RyaW5nID0gcmVzLmRhdGEuY2xpZW50SUQudG9TdHJpbmcoKTtcbiAgICAgICAgdmFyIGdldFBhdGggPSAnaHR0cDovL2FwaS5zb3VuZGNsb3VkLmNvbS9yZXNvbHZlLmpzb24/dXJsPScgKyAkc2NvcGUubmV3UXVldWVTb25nICsgJyZjbGllbnRfaWQ9JyArICRzY29wZS5jbGllbnRJRFN0cmluZztcbiAgICAgICAgcmV0dXJuICRodHRwLmdldChnZXRQYXRoKVxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB2YXIgdHJhY2sgPSByZXMuZGF0YTtcbiAgICAgICAgLy8gU0Mub0VtYmVkKHRyYWNrLnVyaSwge1xuICAgICAgICAvLyAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXdRdWV1ZVBsYXllcicpLFxuICAgICAgICAvLyAgIGF1dG9fcGxheTogZmFsc2UsXG4gICAgICAgIC8vICAgbWF4aGVpZ2h0OiAxNTBcbiAgICAgICAgLy8gfSk7XG4gICAgICAgICRzY29wZS5uZXdRdWV1ZUlEID0gdHJhY2suaWQ7XG4gICAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5tb3ZlVXAgPSBmdW5jdGlvbihpbmRleCkge1xuICAgIGlmIChpbmRleCA9PSAwKSByZXR1cm47XG4gICAgdmFyIHMgPSAkc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleF07XG4gICAgJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXhdID0gJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXggLSAxXTtcbiAgICAkc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleCAtIDFdID0gcztcbiAgICAkc2NvcGUuc2F2ZUNoYW5uZWwoKTtcbiAgICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MoWyRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4XSwgJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXggLSAxXV0pO1xuICB9XG5cbiAgJHNjb3BlLm1vdmVEb3duID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICBpZiAoaW5kZXggPT0gJHNjb3BlLmNoYW5uZWwucXVldWUubGVuZ3RoIC0gMSkgcmV0dXJuO1xuICAgIHZhciBzID0gJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXhdO1xuICAgICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4XSA9ICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4ICsgMV07XG4gICAgJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXggKyAxXSA9IHM7XG4gICAgJHNjb3BlLnNhdmVDaGFubmVsKCk7XG4gICAgJHNjb3BlLmxvYWRRdWV1ZVNvbmdzKFskc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleF0sICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4ICsgMV1dKTtcbiAgfVxuXG4gIC8vICRzY29wZS5jYW5Mb3dlck9wZW5FdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgLy8gICB2YXIgd2FpdGluZ1N1YnMgPSAkc2NvcGUuc3VibWlzc2lvbnMuZmlsdGVyKGZ1bmN0aW9uKHN1Yikge1xuICAvLyAgICAgcmV0dXJuIHN1Yi5pbnZvaWNlSUQ7XG4gIC8vICAgfSk7XG4gIC8vICAgdmFyIG9wZW5TbG90cyA9IFtdO1xuICAvLyAgICRzY29wZS5jYWxlbmRhci5mb3JFYWNoKGZ1bmN0aW9uKGRheSkge1xuICAvLyAgICAgZGF5LmV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2KSB7XG4gIC8vICAgICAgIGlmIChldi5wYWlkICYmICFldi50cmFja0lEKSBvcGVuU2xvdHMucHVzaChldik7XG4gIC8vICAgICB9KTtcbiAgLy8gICB9KTtcbiAgLy8gICB2YXIgb3Blbk51bSA9IG9wZW5TbG90cy5sZW5ndGggLSB3YWl0aW5nU3Vicy5sZW5ndGg7XG4gIC8vICAgcmV0dXJuIG9wZW5OdW0gPiAwO1xuICAvLyB9XG5cbiAgJHNjb3BlLmxvYWRTdWJtaXNzaW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUuc3VibWlzc2lvbnMuZm9yRWFjaChmdW5jdGlvbihzdWIpIHtcbiAgICAgICAgU0Mub0VtYmVkKFwiaHR0cDovL2FwaS5zb3VuZGNsb3VkLmNvbS90cmFja3MvXCIgKyBzdWIudHJhY2tJRCwge1xuICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHN1Yi50cmFja0lEICsgXCJwbGF5ZXJcIiksXG4gICAgICAgICAgYXV0b19wbGF5OiBmYWxzZSxcbiAgICAgICAgICBtYXhoZWlnaHQ6IDE1MFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sIDUwKTtcbiAgfVxuXG4gICRzY29wZS5sb2FkUXVldWVTb25ncyA9IGZ1bmN0aW9uKHF1ZXVlKSB7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHF1ZXVlLmZvckVhY2goZnVuY3Rpb24oc29uZ0lEKSB7XG4gICAgICAgIFNDLm9FbWJlZChcImh0dHA6Ly9hcGkuc291bmRjbG91ZC5jb20vdHJhY2tzL1wiICsgc29uZ0lELCB7XG4gICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc29uZ0lEICsgXCJwbGF5ZXJcIiksXG4gICAgICAgICAgYXV0b19wbGF5OiBmYWxzZSxcbiAgICAgICAgICBtYXhoZWlnaHQ6IDE1MFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sIDUwKTtcbiAgfVxuICBpZiAoJHNjb3BlLmNoYW5uZWwgJiYgJHNjb3BlLmNoYW5uZWwucXVldWUpIHtcbiAgICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MoJHNjb3BlLmNoYW5uZWwucXVldWUpO1xuICB9XG4gICRzY29wZS5sb2FkU3VibWlzc2lvbnMoKTtcblxufSk7XG5cbmZ1bmN0aW9uIGZpbGxEYXRlQXJyYXlzKGV2ZW50cykge1xuICB2YXIgY2FsZW5kYXIgPSBbXTtcbiAgdmFyIHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAyMTsgaSsrKSB7XG4gICAgdmFyIGNhbERheSA9IHt9O1xuICAgIGNhbERheS5kYXkgPSBuZXcgRGF0ZSgpXG4gICAgY2FsRGF5LmRheS5zZXREYXRlKHRvZGF5LmdldERhdGUoKSArIGkpO1xuICAgIHZhciBkYXlFdmVudHMgPSBldmVudHMuZmlsdGVyKGZ1bmN0aW9uKGV2KSB7XG4gICAgICByZXR1cm4gKGV2LmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSBjYWxEYXkuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpKTtcbiAgICB9KTtcbiAgICB2YXIgZXZlbnRBcnJheSA9IFtdO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgMjQ7IGorKykge1xuICAgICAgZXZlbnRBcnJheVtqXSA9IFwiLVwiO1xuICAgIH1cbiAgICBkYXlFdmVudHMuZm9yRWFjaChmdW5jdGlvbihldikge1xuICAgICAgZXZlbnRBcnJheVtldi5kYXkuZ2V0SG91cnMoKV0gPSBldjtcbiAgICB9KTtcbiAgICBjYWxEYXkuZXZlbnRzID0gZXZlbnRBcnJheTtcbiAgICBjYWxlbmRhci5wdXNoKGNhbERheSk7XG4gIH1cbiAgcmV0dXJuIGNhbGVuZGFyO1xufSIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3N1Ym1pdFNvbmcnLCB7XG4gICAgdXJsOiAnLycsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9zdWJtaXQvc3VibWl0Lmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdTdWJtaXRTb25nQ29udHJvbGxlcidcbiAgfSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ1N1Ym1pdFNvbmdDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwKSB7XG5cbiAgJHNjb3BlLnN1Ym1pc3Npb24gPSB7fTtcblxuICAkc2NvcGUudXJsQ2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLnBvc3QoJy9hcGkvc291bmRjbG91ZC9zb3VuZGNsb3VkVHJhY2snLCB7XG4gICAgICAgIHVybDogJHNjb3BlLnVybFxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUuc3VibWlzc2lvbi50cmFja0lEID0gcmVzLmRhdGEuaWQ7XG4gICAgICAgICRzY29wZS5zdWJtaXNzaW9uLnRpdGxlID0gcmVzLmRhdGEudGl0bGU7XG4gICAgICAgICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrVVJMID0gcmVzLmRhdGEudHJhY2tVUkw7XG4gICAgICAgIFNDLm9FbWJlZCgkc2NvcGUuc3VibWlzc2lvbi50cmFja1VSTCwge1xuICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLFxuICAgICAgICAgIGF1dG9fcGxheTogZmFsc2UsXG4gICAgICAgICAgbWF4aGVpZ2h0OiAxNTBcbiAgICAgICAgfSlcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUGxheWVyJykuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAkc2NvcGUubm90Rm91bmQgPSBmYWxzZTtcbiAgICAgIH0pLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICRzY29wZS5ub3RGb3VuZCA9IHRydWU7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUuc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLnBvc3QoJy9hcGkvc3VibWlzc2lvbnMnLCB7XG4gICAgICAgIGVtYWlsOiAkc2NvcGUuc3VibWlzc2lvbi5lbWFpbCxcbiAgICAgICAgdHJhY2tJRDogJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tJRCxcbiAgICAgICAgbmFtZTogJHNjb3BlLnN1Ym1pc3Npb24ubmFtZSxcbiAgICAgICAgdGl0bGU6ICRzY29wZS5zdWJtaXNzaW9uLnRpdGxlLFxuICAgICAgICB0cmFja1VSTDogJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tVUkwsXG4gICAgICAgIGNoYW5uZWxJRFM6IFtdLFxuICAgICAgICBpbnZvaWNlSURTOiBbXVxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICBjb25zb2xlLmxvZyhyZXMuZGF0YSk7XG4gICAgICAgIHdpbmRvdy5hbGVydChcIllvdXIgc29uZyBoYXMgYmVlbiBzdWJtaXR0ZWQgYW5kIHdpbGwgYmUgcmV2aWV3ZWQgc29vbi5cIik7XG4gICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB3aW5kb3cuYWxlcnQoXCJFcnJvcjogQ291bGQgbm90IHN1Ym1pdCBzb25nLlwiKTtcbiAgICAgIH0pO1xuICB9XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhdXRvRW1haWxzTmV3Jywge1xuICAgIHVybDogJy9hZG1pbi9kYXRhYmFzZS9hdXRvRW1haWxzL25ldycsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9kYXRhYmFzZS9hdXRvRW1haWxzL2F1dG9FbWFpbHMuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0F1dG9FbWFpbHNDb250cm9sbGVyJ1xuICB9KTtcbn0pO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhdXRvRW1haWxzRWRpdCcsIHtcbiAgICB1cmw6ICcvYWRtaW4vZGF0YWJhc2UvYXV0b0VtYWlscy9lZGl0Lzp0ZW1wbGF0ZUlkJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2RhdGFiYXNlL2F1dG9FbWFpbHMvYXV0b0VtYWlscy5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnQXV0b0VtYWlsc0NvbnRyb2xsZXInLFxuICAgIC8vIHJlc29sdmU6IHtcbiAgICAvLyAgIHRlbXBsYXRlOiBmdW5jdGlvbigkaHR0cCkge1xuICAgIC8vICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2RhdGFiYXNlL2F1dG9FbWFpbHMvYml3ZWVrbHk/aXNBcnRpc3Q9dHJ1ZScpXG4gICAgLy8gICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgLy8gICAgICAgICB2YXIgdGVtcGxhdGUgPSByZXMuZGF0YTtcbiAgICAvLyAgICAgICAgIGlmICh0ZW1wbGF0ZSkge1xuICAgIC8vICAgICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgLy8gICAgICAgICB9IGVsc2Uge1xuICAgIC8vICAgICAgICAgICByZXR1cm4ge1xuICAgIC8vICAgICAgICAgICAgIHB1cnBvc2U6IFwiQml3ZWVrbHkgRW1haWxcIlxuICAgIC8vICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgICAgfSlcbiAgICAvLyAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAvLyAgICAgICAgIGFsZXJ0KFwiRVJST1I6IFNvbWV0aGluZyB3ZW50IHdyb25nLlwiKTtcbiAgICAvLyAgICAgICB9KVxuICAgIC8vICAgfVxuICAgIC8vIH1cbiAgfSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0F1dG9FbWFpbHNDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCAkc3RhdGVQYXJhbXMsIEF1dGhTZXJ2aWNlKSB7XG4gICRzY29wZS5sb2dnZWRJbiA9IGZhbHNlO1xuXG5cbiAgJHNjb3BlLmlzU3RhdGVQYXJhbXMgPSBmYWxzZTtcbiAgaWYoJHN0YXRlUGFyYW1zLnRlbXBsYXRlSWQpIHtcbiAgICAkc2NvcGUuaXNTdGF0ZVBhcmFtcyA9IHRydWU7XG4gIH1cbiAgLy8gJHNjb3BlLnRlbXBsYXRlID0gdGVtcGxhdGU7XG5cbiAgJHNjb3BlLnRlbXBsYXRlID0ge1xuICAgIGlzQXJ0aXN0OiBmYWxzZVxuICB9O1xuXG4gICRzY29wZS5nZXRUZW1wbGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmKCRzdGF0ZVBhcmFtcy50ZW1wbGF0ZUlkKSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAkaHR0cC5nZXQoJy9hcGkvZGF0YWJhc2UvYXV0b0VtYWlscz90ZW1wbGF0ZUlkPScgKyAkc3RhdGVQYXJhbXMudGVtcGxhdGVJZClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdmFyIHRlbXBsYXRlID0gcmVzLmRhdGE7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICBpZiAodGVtcGxhdGUpIHtcbiAgICAgICAgICAgICRzY29wZS50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkc2NvcGUudGVtcGxhdGUgPSB7fTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgIGFsZXJ0KFwiRVJST1I6IFNvbWV0aGluZyB3ZW50IHdyb25nLlwiKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH07XG5cbiAgLy8gY29uc29sZS5sb2codGVtcGxhdGUpO1xuICAkc2NvcGUuc2F2ZSA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL2F1dG9FbWFpbHMvJywgJHNjb3BlLnRlbXBsYXRlKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIGFsZXJ0KFwiU2F2ZWQgZW1haWwgdGVtcGxhdGUuXCIpXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGFsZXJ0KFwiRVJST1I6IE1lc3NhZ2UgY291bGQgbm90IHNhdmUuXCIpXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8vICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAvLyAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgLy8gICAkaHR0cC5wb3N0KCcvYXBpL2xvZ2luJywge1xuICAvLyAgICAgcGFzc3dvcmQ6ICRzY29wZS5wYXNzd29yZFxuICAvLyAgIH0pLnRoZW4oZnVuY3Rpb24oKSB7XG4gIC8vICAgICAkcm9vdFNjb3BlLnBhc3N3b3JkID0gJHNjb3BlLnBhc3N3b3JkO1xuICAvLyAgICAgJHNjb3BlLmxvZ2dlZEluID0gdHJ1ZTtcbiAgLy8gICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gIC8vICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gIC8vICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAvLyAgICAgYWxlcnQoJ1dyb25nIFBhc3N3b3JkJyk7XG4gIC8vICAgfSk7XG4gIC8vIH1cblxuICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgJGh0dHAuZ2V0KCcvYXBpL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4nO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIGFsZXJ0KCdXcm9uZyBQYXNzd29yZCcpO1xuICAgIH0pO1xuICB9XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2F1dG9FbWFpbHNMaXN0Jywge1xuICAgIHVybDogJy9hZG1pbi9kYXRhYmFzZS9hdXRvRW1haWxzJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2RhdGFiYXNlL2F1dG9FbWFpbHMvYXV0b0VtYWlsc0xpc3QuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0F1dG9FbWFpbHNMaXN0Q29udHJvbGxlcicsXG4gICAgcmVzb2x2ZToge1xuICAgICAgdGVtcGxhdGVzOiBmdW5jdGlvbigkaHR0cCkge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2RhdGFiYXNlL2F1dG9FbWFpbHMnKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykgeyBcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IHJlcy5kYXRhO1xuICAgICAgICAgICAgaWYgKHRlbXBsYXRlKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcHVycG9zZTogXCJCaXdlZWtseSBFbWFpbFwiXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgYWxlcnQoXCJFUlJPUjogU29tZXRoaW5nIHdlbnQgd3JvbmcuXCIpO1xuICAgICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignQXV0b0VtYWlsc0xpc3RDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCBBdXRoU2VydmljZSwgdGVtcGxhdGVzKSB7XG4gICRzY29wZS5sb2dnZWRJbiA9IGZhbHNlO1xuICAkc2NvcGUudGVtcGxhdGVzID0gdGVtcGxhdGVzO1xuXG4gIC8vICRzY29wZS5nZXRUZW1wbGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgLy8gICAkaHR0cC5nZXQoJy9hcGkvZGF0YWJhc2UvYXV0b0VtYWlscy9iaXdlZWtseT9pc0FydGlzdD0nICsgU3RyaW5nKCRzY29wZS50ZW1wbGF0ZS5pc0FydGlzdCkpXG4gIC8vICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgLy8gICAgICAgdmFyIHRlbXBsYXRlID0gcmVzLmRhdGE7XG4gIC8vICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gIC8vICAgICAgIGlmICh0ZW1wbGF0ZSkge1xuICAvLyAgICAgICAgICRzY29wZS50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAvLyAgICAgICB9IGVsc2Uge1xuICAvLyAgICAgICAgICRzY29wZS50ZW1wbGF0ZSA9IHtcbiAgLy8gICAgICAgICAgIHB1cnBvc2U6IFwiQml3ZWVrbHkgRW1haWxcIixcbiAgLy8gICAgICAgICAgIGlzQXJ0aXN0OiBmYWxzZVxuICAvLyAgICAgICAgIH07XG4gIC8vICAgICAgIH1cbiAgLy8gICAgIH0pXG4gIC8vICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgLy8gICAgICAgYWxlcnQoXCJFUlJPUjogU29tZXRoaW5nIHdlbnQgd3JvbmcuXCIpO1xuICAvLyAgICAgfSk7XG4gIC8vIH07XG5cbiAgLy8gY29uc29sZS5sb2codGVtcGxhdGUpO1xuICAkc2NvcGUuc2F2ZSA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL2F1dG9FbWFpbHMnLCAkc2NvcGUudGVtcGxhdGUpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgYWxlcnQoXCJTYXZlZCBlbWFpbC5cIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGFsZXJ0KFwiRVJST1I6IE1lc3NhZ2UgY291bGQgbm90IHNhdmUuXCIpXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8vICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAvLyAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgLy8gICAkaHR0cC5wb3N0KCcvYXBpL2xvZ2luJywge1xuICAvLyAgICAgcGFzc3dvcmQ6ICRzY29wZS5wYXNzd29yZFxuICAvLyAgIH0pLnRoZW4oZnVuY3Rpb24oKSB7XG4gIC8vICAgICAkcm9vdFNjb3BlLnBhc3N3b3JkID0gJHNjb3BlLnBhc3N3b3JkO1xuICAvLyAgICAgJHNjb3BlLmxvZ2dlZEluID0gdHJ1ZTtcbiAgLy8gICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gIC8vICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gIC8vICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAvLyAgICAgYWxlcnQoJ1dyb25nIFBhc3N3b3JkJyk7XG4gIC8vICAgfSk7XG4gIC8vIH1cblxuICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgJGh0dHAuZ2V0KCcvYXBpL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4nO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIGFsZXJ0KCdXcm9uZyBQYXNzd29yZCcpO1xuICAgIH0pO1xuICB9XG5cbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnZG93bmxvYWQnLCB7XG5cdFx0dXJsOiAnL2Rvd25sb2FkJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2Rvd25sb2FkVHJhY2svdmlld3MvZG93bmxvYWRUcmFjay5odG1sJyxcblx0XHRjb250cm9sbGVyOiAnRG93bmxvYWRUcmFja0NvbnRyb2xsZXInXG5cdH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdEb3dubG9hZFRyYWNrQ29udHJvbGxlcicsIFsnJHJvb3RTY29wZScsXG5cdCckc3RhdGUnLFxuXHQnJHNjb3BlJyxcblx0JyRodHRwJyxcblx0JyRsb2NhdGlvbicsXG5cdCckd2luZG93Jyxcblx0J0Rvd25sb2FkVHJhY2tTZXJ2aWNlJyxcblx0ZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCAkbG9jYXRpb24sICR3aW5kb3csIERvd25sb2FkVHJhY2tTZXJ2aWNlKSB7XG5cblx0XHR2YXIgdGFza09iaiA9IHt9O1xuXHRcdHZhciB0cmFjayA9IHt9O1xuXHRcdHZhciB0cmFja0RhdGEgPSB7fTtcblx0XHQkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuXHRcdCRzY29wZS5lbWJlZFRyYWNrID0gZmFsc2U7XG5cdFx0JHNjb3BlLmRvd25sb2FkVVJMTm90Rm91bmQgPSBmYWxzZTtcblx0XHQkc2NvcGUuZXJyb3JUZXh0ID0gJyc7XG5cblx0XHQvKiBEZWZhdWx0IHByb2Nlc3Npbmcgb24gcGFnZSBsb2FkICovXG5cblx0XHQkc2NvcGUuZ2V0RG93bmxvYWRUcmFjayA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0JHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuXHRcdFx0dmFyIHRyYWNrSWQgPSAkbG9jYXRpb24uc2VhcmNoKCkudHJhY2tpZDtcblx0XHRcdERvd25sb2FkVHJhY2tTZXJ2aWNlXG5cdFx0XHRcdC5nZXREb3dubG9hZFRyYWNrKHRyYWNrSWQpXG5cdFx0XHRcdC50aGVuKHJlY2VpdmVEb3dubG9hZFRyYWNrKVxuXHRcdFx0XHQudGhlbihyZWNlaXZlVHJhY2tEYXRhKVxuXHRcdFx0XHQuY2F0Y2goY2F0Y2hEb3dubG9hZFRyYWNrRXJyb3IpO1xuXG5cdFx0XHRmdW5jdGlvbiByZWNlaXZlRG93bmxvYWRUcmFjayhyZXN1bHQpIHtcblx0XHRcdFx0dHJhY2sgPSB7XG5cdFx0XHRcdFx0dHJhY2tVUkw6IHJlc3VsdC5kYXRhLnRyYWNrVXJsLFxuXHRcdFx0XHRcdGRvd25sb2FkVVJMOiByZXN1bHQuZGF0YS5kb3dubG9hZFVybCxcblx0XHRcdFx0XHRlbWFpbDogcmVzdWx0LmRhdGEuZW1haWxcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRyZXR1cm4gRG93bmxvYWRUcmFja1NlcnZpY2UuZ2V0VHJhY2tEYXRhKHRyYWNrKTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gcmVjZWl2ZVRyYWNrRGF0YShyZXN1bHQpIHtcblxuXHRcdFx0XHR0cmFja0RhdGEgPSB7XG5cdFx0XHRcdFx0dHJhY2tJRDogcmVzdWx0LmRhdGEuaWQsXG5cdFx0XHRcdFx0YXJ0aXN0SUQ6IHJlc3VsdC5kYXRhLnVzZXJfaWQsXG5cdFx0XHRcdFx0dGl0bGU6IHJlc3VsdC5kYXRhLnRpdGxlLFxuXHRcdFx0XHRcdGRvd25sb2FkVVJMOiByZXN1bHQuZGF0YS5kb3dubG9hZF91cmwsXG5cdFx0XHRcdFx0dHJhY2tVUkw6IHJlc3VsdC5kYXRhLnRyYWNrVVJMXG5cdFx0XHRcdH07XG5cblx0XHRcdFx0U0Mub0VtYmVkKHRyYWNrRGF0YS50cmFja1VSTCwge1xuXHRcdFx0XHRcdGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLFxuXHRcdFx0XHRcdGF1dG9fcGxheTogZmFsc2UsXG5cdFx0XHRcdFx0bWF4aGVpZ2h0OiAxNTBcblx0XHRcdFx0fSk7XG5cdFx0XHRcdCRzY29wZS5lbWJlZFRyYWNrID0gdHJ1ZTtcblx0XHRcdFx0JHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gY2F0Y2hEb3dubG9hZFRyYWNrRXJyb3IoKSB7XG5cdFx0XHRcdCRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG5cdFx0XHRcdCRzY29wZS5lbWJlZFRyYWNrID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fTtcblxuXG5cdFx0LyogT24gY2xpY2sgZG93bmxvYWQgdHJhY2sgYnV0dG9uICovXG5cblx0XHQkc2NvcGUuZG93bmxvYWRUcmFjayA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0JHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuXHRcdFx0JHNjb3BlLmVycm9yVGV4dCA9ICcnO1xuXHRcdFx0JGh0dHAuZ2V0KCdhcGkvc291bmRjbG91ZC9zb3VuZGNsb3VkQ29uZmlnJylcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRcdFx0U0MuaW5pdGlhbGl6ZSh7XG5cdFx0XHRcdFx0XHRjbGllbnRfaWQ6IHJlcy5kYXRhLmNsaWVudElELFxuXHRcdFx0XHRcdFx0cmVkaXJlY3RfdXJpOiByZXMuZGF0YS5jYWxsYmFja1VSTCxcblx0XHRcdFx0XHRcdHNjb3BlOiBcIm5vbi1leHBpcmluZ1wiXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0JHNjb3BlLmNsaWVudElEU3RyaW5nID0gcmVzLmRhdGEuY2xpZW50SUQudG9TdHJpbmcoKTtcblx0XHRcdFx0XHRyZXR1cm4gU0MuY29ubmVjdCgpO1xuXHRcdFx0XHR9KVxuXHRcdFx0XHQudGhlbihwZXJmb3JtVGFza3MpXG5cdFx0XHRcdC50aGVuKGluaXREb3dubG9hZClcblx0XHRcdFx0LmNhdGNoKGNhdGNoVGFza3NFcnJvcilcblxuXHRcdFx0ZnVuY3Rpb24gcGVyZm9ybVRhc2tzKHJlcykge1xuXHRcdFx0XHR0YXNrT2JqID0ge1xuXHRcdFx0XHRcdHRva2VuOiByZXMub2F1dGhfdG9rZW4sXG5cdFx0XHRcdFx0dHJhY2tJZDogdHJhY2tEYXRhLnRyYWNrSUQsXG5cdFx0XHRcdFx0YXJ0aXN0SWQ6IHRyYWNrRGF0YS5hcnRpc3RJRFxuXHRcdFx0XHR9O1xuXHRcdFx0XHRyZXR1cm4gRG93bmxvYWRUcmFja1NlcnZpY2UucGVyZm9ybVRhc2tzKHRhc2tPYmopO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBpbml0RG93bmxvYWQocmVzKSB7XG5cdFx0XHRcdC8qIE5lZWQgdG8gaW50aWF0ZSBkb3dubG9hZCBoZXJlICovXG5cblx0XHRcdFx0aWYgKHRyYWNrLmRvd25sb2FkVVJMICYmIHRyYWNrLmRvd25sb2FkVVJMICE9PSAnJykge1xuXHRcdFx0XHRcdCR3aW5kb3cubG9jYXRpb24uaHJlZiA9IHRyYWNrLmRvd25sb2FkVVJMO1xuXHRcdFx0XHR9IGVsc2UgaWYgKHRyYWNrRGF0YS5kb3dubG9hZFVSTCAmJiB0YXNrT2JqLnRva2VuKSB7XG5cdFx0XHRcdFx0JHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdHJhY2tEYXRhLmRvd25sb2FkVVJMICsgJz9jbGllbmRfaWQ9JyArICRzY29wZS5jbGllbnRJRFN0cmluZyArICcmb2F1dGhfdG9rZW49JyArIHRhc2tPYmoudG9rZW4udG9TdHJpbmcoKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHQkc2NvcGUuZXJyb3JUZXh0ID0gJ0Vycm9yISBDb3VsZCBub3QgZmV0Y2ggZG93bmxvYWQgVVJMJztcblx0XHRcdFx0XHQkc2NvcGUuZG93bmxvYWRVUkxOb3RGb3VuZCA9IHRydWU7XG5cdFx0XHRcdFx0JHNjb3BlLiRhcHBseSgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdCRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gY2F0Y2hUYXNrc0Vycm9yKGVycikge1xuXHRcdFx0XHRhbGVydCgnRXJyb3IgaW4gcHJvY2Vzc2luZyB5b3VyIHJlcXVlc3QnKTtcblx0XHRcdFx0JHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcblx0XHRcdH1cblxuXHRcdH07XG5cdH1cbl0pOyIsIlxuXG5hcHAuc2VydmljZSgnRG93bmxvYWRUcmFja1NlcnZpY2UnLCBbJyRodHRwJywgZnVuY3Rpb24oJGh0dHApe1xuXHRcblx0ZnVuY3Rpb24gZ2V0RG93bmxvYWRUcmFjayhkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS9kb3dubG9hZC90cmFjaz90cmFja2lkPScgKyBkYXRhKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGdldFRyYWNrRGF0YShkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvc291bmRjbG91ZC9zb3VuZGNsb3VkVHJhY2snLCB7IHVybDogZGF0YS50cmFja1VSTCB9KTtcblx0fVxuXG5cdGZ1bmN0aW9uIHBlcmZvcm1UYXNrcyhkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJ2FwaS9kb3dubG9hZC90YXNrcycsIGRhdGEpO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRnZXREb3dubG9hZFRyYWNrOiBnZXREb3dubG9hZFRyYWNrLFxuXHRcdGdldFRyYWNrRGF0YTogZ2V0VHJhY2tEYXRhLFxuXHRcdHBlcmZvcm1UYXNrczogcGVyZm9ybVRhc2tzXG5cdH07XG59XSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
