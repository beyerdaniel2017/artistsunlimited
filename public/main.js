'use strict';
window.app = angular.module('FullstackGeneratedApp', ['fsaPreBuilt', 'ui.router', 'ui.bootstrap', 'ngAnimate']);

app.config(function ($urlRouterProvider, $locationProvider, $uiViewScrollProvider) {
  // This turns off hashbang urls (/#about) and changes it to something normal (/about)
  $locationProvider.html5Mode(true);
  // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
  $urlRouterProvider.otherwise('/');
  $uiViewScrollProvider.useAnchorScroll();
});

// This app.run is for controlling access to specific states.
app.run(function ($rootScope, AuthService, $state, $uiViewScroll) {
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

app.directive('fileread', [function () {
  return {
    scope: {
      fileread: '='
    },
    link: function link(scope, element, attributes) {
      element.bind('change', function (changeEvent) {
        scope.$apply(function () {
          console.log(changeEvent.target.files[0]);
          scope.fileread = changeEvent.target.files[0];
        });
      });
    }
  };
}]);

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

  $scope.downloadUrlChange = function () {
    if ($scope.track.trackUrl !== '') {

      $scope.processing = true;
      $http.post('/api/soundcloud/resolve', {
        url: $scope.track.trackUrl
      }).then(function (res) {
        $scope.track.trackID = res.data.id;
        $scope.track.artistID = res.data.user_id;
        $scope.track.artworkURL = res.data.artwork_url;
        $scope.processing = false;
      }).then(null, function (err) {
        $scope.track.trackID = null;
        $scope.notFound = true;
        $scope.processing = false;
      });
    }
  };

  $scope.saveDownloadUrl = function () {
    if (!$scope.track.trackID) {
      alert('Track Not Found');
      return false;
    }
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

app.controller('AdminLoginController', function ($rootScope, $state, $scope, $http, AuthService, oEmbedFactory) {
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
        oEmbedFactory.embedSong(sub);
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
        $scope.showingElements.splice($scope.showingElements.indexOf(submi), 1);
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
      var index = $scope.showingElements.indexOf(submission);
      $scope.showingElements.splice(index, 1);
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
      var index = $scope.showingElements.indexOf(submission);
      $scope.showingElements.splice(index, 1);
      window.alert("Declined");
      $scope.processing = false;
    }).then(null, function (err) {
      $scope.processing = false;
      window.alert("ERROR: did not Decline");
    });
  };
});
app.factory('oEmbedFactory', function () {
  return {
    embedSong: function embedSong(sub) {
      return SC.oEmbed("http://api.soundcloud.com/tracks/" + sub.trackID, {
        element: document.getElementById(sub.trackID + "player"),
        auto_play: false,
        maxheight: 150
      });
    }
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

  $scope.back = function () {
    window.location.reload();
  };

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
    $http.post('/api/soundcloud/resolve', {
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
    url: '/submit',
    templateUrl: 'js/submit/submit.view.html',
    controller: 'SubmitSongController'
  });
});

app.controller('SubmitSongController', function ($rootScope, $state, $scope, $http) {

  $scope.submission = {};

  $scope.urlChange = function () {
    $scope.processing = true;
    $http.post('/api/soundcloud/resolve', {
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
      $scope.submission.trackID = null;
      $scope.notFound = true;
      $scope.processing = false;
      document.getElementById('scPlayer').style.visibility = "hidden";
    });
  };

  $scope.submit = function () {
    if (!$scope.submission.email || !$scope.submission.name) {
      alert("Please fill in all fields");
    } else if (!$scope.submission.trackID) {
      alert("Track Not Found");
    } else {
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
    }
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
    templateUrl: 'js/downloadTrack/views/downloadTrack.view.html',
    controller: 'DownloadTrackController'
  });
});

app.controller('DownloadTrackController', ['$rootScope', '$state', '$scope', '$http', '$location', '$window', 'DownloadTrackService', function ($rootScope, $state, $scope, $http, $location, $window, DownloadTrackService) {

  /* Normal JS vars and functions not bound to scope */

  var taskObj = {};
  var track = {};
  var trackData = {};
  var playerObj = null;

  /* $scope bindings start */

  $scope.trackData = {
    trackName: 'Mixing and Mastering',
    userName: 'la tropical'
  };
  $scope.toggle = true;
  $scope.togglePlay = function () {
    $scope.toggle = !$scope.toggle;
    if ($scope.toggle) {
      playerObj.pause();
    } else {
      playerObj.play();
    }
  };
  $scope.processing = false;
  $scope.embedTrack = false;
  $scope.downloadURLNotFound = false;
  $scope.errorText = '';
  $scope.followBoxImageUrl = 'assets/images/who-we-are.png';

  /* Default processing on page load */

  $scope.getDownloadTrack = function () {

    $scope.processing = true;
    var trackID = $location.search().trackid;
    DownloadTrackService.getConfig().then(initSC).then(fetchDownloadTrack).then(receiveDownloadTrack).then(receiveTrackData).then(initPlay)['catch'](catchDownloadTrackError);

    function initSC(res) {
      return SC.initialize({
        client_id: res.data.clientID,
        redirect_uri: res.data.callbackURL,
        scope: 'non-expiring'
      });
    }

    function fetchDownloadTrack() {
      return DownloadTrackService.getDownloadTrack(trackID);
    }

    function receiveDownloadTrack(result) {
      track = {
        trackURL: result.data.trackUrl,
        downloadURL: result.data.downloadUrl,
        artworkUrl: result.data.artworkURL,
        email: result.data.email,
        playlistID: result.data.playlistID
      };
      $scope.backgroundStyle = function () {
        return {
          'background-image': 'url(' + track.artworkUrl + ')',
          'background-repeat': 'no-repeat',
          'background-size': 'cover'
        };
      };
      return DownloadTrackService.getTrackData(track);
    }

    function receiveTrackData(result) {
      console.log(result.data);
      trackData = {
        trackID: result.data.id,
        artistID: result.data.user_id,
        title: result.data.title,
        downloadURL: result.data.download_url,
        trackURL: result.data.objectURL
      };
      $scope.followBoxImageUrl = result.data.user.avatar_url;

      $scope.trackData.trackName = result.data.title;
      $scope.trackData.userName = result.data.user.username;

      $scope.embedTrack = true;
      $scope.processing = false;

      return SC.stream('/tracks/' + trackData.trackID);
    }

    function initPlay(player) {
      playerObj = player;
      // playerObj.play();
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
        scope: 'non-expiring'
      });
      $scope.clientIDString = res.data.clientID.toString();
      return SC.connect();
    }).then(performTasks).then(initDownload)['catch'](catchTasksError);

    function performTasks(res) {
      taskObj = {
        token: res.oauth_token,
        trackID: trackData.trackID,
        artistID: trackData.artistID,
        playlistID: track.playlistID
      };
      return DownloadTrackService.performTasks(taskObj);
    }

    function initDownload(res) {
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
    }

    function catchTasksError(err) {
      alert('Error in processing your request');
      $scope.processing = false;
    }
  };
}]);
app.service('DownloadTrackService', ['$http', function ($http) {

  function getDownloadTrack(data) {
    return $http.get('/api/download/track?trackID=' + data);
  }

  function getTrackData(data) {
    return $http.post('/api/soundcloud/resolve', {
      url: data.trackURL
    });
  }

  function performTasks(data) {
    return $http.post('api/download/tasks', data);
  }

  function getConfig() {
    return $http.get('/api/soundcloud/soundcloudConfig');
  }

  return {
    getDownloadTrack: getDownloadTrack,
    getTrackData: getTrackData,
    performTasks: performTasks,
    getConfig: getConfig
  };
}]);
app.config(function ($stateProvider) {
  $stateProvider.state('home', {
    url: '/',
    templateUrl: 'js/home/views/home.html',
    controller: 'HomeController'
  }).state('about', {
    url: '/about',
    templateUrl: 'js/home/views/about.html',
    controller: 'HomeController'
  }).state('services', {
    url: '/services',
    templateUrl: 'js/home/views/services.html',
    controller: 'HomeController'
  }).state('artistTools', {
    url: '/artist-tools',
    templateUrl: 'js/home/views/artist-tools.html',
    controller: 'HomeController'
  }).state('faqs', {
    url: '/faqs',
    templateUrl: 'js/home/views/faqs.html',
    controller: 'HomeController'
  }).state('apply', {
    url: '/apply',
    templateUrl: 'js/home/views/apply.html',
    controller: 'HomeController'
  }).state('contact', {
    url: '/contact',
    templateUrl: 'js/home/views/contact.html',
    controller: 'HomeController'
  });
});

app.controller('HomeController', ['$rootScope', '$state', '$scope', '$http', '$location', '$window', 'HomeService', function ($rootScope, $state, $scope, $http, $location, $window, HomeService) {

  $scope.applicationObj = {};
  $scope.isSent = false;
  $scope.message = {
    application: {
      val: '',
      visible: false
    }
  };
  $scope.toggleApplicationSent = function () {
    $scope.isSent = !$scope.isSent;
  };

  $scope.saveApplication = function () {

    $scope.message.application = {
      val: '',
      visible: false
    };

    if ($scope.applicationObj.password !== $scope.applicationObj.confirmPassword) {
      $scope.message.application = {
        val: 'Password and Confirm password do not match',
        visible: true
      };

      return false;
    }
    HomeService.saveApplication($scope.applicationObj).then(saveApplicationResponse)['catch'](saveApplicationError);

    function saveApplicationResponse(res) {
      if (res.status === 200) {
        $scope.applicationObj = {};
        $scope.isSent = true;
      }
    }

    function saveApplicationError() {
      $scope.message.application = {
        val: 'Error in processing your request',
        visible: true
      };
    }
  };
}]);

app.directive('affixer', function ($window) {
  return {
    restrict: 'EA',
    link: function link($scope, $element) {
      var win = angular.element($window);
      var topOffset = $element[0].offsetTop;

      function affixElement() {

        if ($window.pageYOffset > topOffset) {
          $element.css('position', 'fixed');
          $element.css('top', '3.5%');
        } else {
          $element.css('position', '');
          $element.css('top', '');
        }
      }

      $scope.$on('$routeChangeStart', function () {
        win.unbind('scroll', affixElement);
      });
      win.bind('scroll', affixElement);
    }
  };
});

app.service('HomeService', ['$http', function ($http) {

  function saveApplication(data) {
    return $http.post('/api/home/application', data);
  }

  return {
    saveApplication: saveApplication
  };
}]);

app.config(function ($stateProvider) {
  $stateProvider.state('premier', {
    url: '/premier',
    templateUrl: 'js/premier/views/premier.html',
    controller: 'PremierController'
  });
});

app.controller('PremierController', ['$rootScope', '$state', '$scope', '$http', '$location', '$window', 'PremierService', function ($rootScope, $state, $scope, $http, $location, $window, PremierService) {

  $scope.premierObj = {};

  $scope.message = {
    val: '',
    visible: false
  };
  $scope.savePremier = function () {
    $scope.message.visbile = false;
    var data = new FormData();
    for (var prop in $scope.premierObj) {
      data.append(prop, $scope.premierObj[prop]);
    }
    PremierService.savePremier(data).then(receiveResponse)['catch'](catchError);

    function receiveResponse(res) {
      if (res.status === 200) {
        $scope.message.visible = true;
        $scope.message.val = 'Thank you! Your message has been sent successfully.';
        $scope.premierObj = {};
        angular.element("input[type='file']").val(null);
        return;
      }
      $scope.message.visible = true;
      $scope.message.val = 'Error in processing the request. Please try again.';
    }

    function catchError() {
      $scope.message.visible = true;
      $scope.message.val = 'Error in processing the request. Please try again.';
    }
  };
}]);

app.service('PremierService', ['$http', function ($http) {

  function savePremier(data) {
    return $http({
      method: 'POST',
      url: '/api/premier',
      headers: { 'Content-Type': undefined },
      transformRequest: angular.identity,
      data: data
    });
  }

  return {
    savePremier: savePremier
  };
}]);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImRhdGFiYXNlL2RhdGFiYXNlLmpzIiwiZnNhL2ZzYS1wcmUtYnVpbHQuanMiLCJsb2dpbi9sb2dpbi5qcyIsImxvZ2luL29FbWJlZEZhY3RvcnkuanMiLCJzY2hlZHVsZXIvc2NoZWR1bGVyLmpzIiwic3VibWl0L3N1Ym1pdC5qcyIsImRhdGFiYXNlL2F1dG9FbWFpbHMvYXV0b0VtYWlscy5qcyIsImRhdGFiYXNlL2F1dG9FbWFpbHMvYXV0b0VtYWlsc0xpc3QuanMiLCJkb3dubG9hZFRyYWNrL2NvbnRyb2xsZXJzL2Rvd25sb2FkVHJhY2tDb250cm9sbGVyLmpzIiwiZG93bmxvYWRUcmFjay9zZXJ2aWNlcy9kb3dubG9hZFRyYWNrU2VydmljZS5qcyIsImhvbWUvY29udHJvbGxlcnMvaG9tZUNvbnRyb2xsZXIuanMiLCJob21lL3NlcnZpY2VzL2hvbWVTZXJ2aWNlLmpzIiwicHJlbWllci9jb250cm9sbGVycy9wcmVtaWVyQ29udHJvbGxlci5qcyIsInByZW1pZXIvc2VydmljZXMvcHJlbWllclNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBQSxDQUFBO0FBQ0EsTUFBQSxDQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLHVCQUFBLEVBQUEsQ0FBQSxhQUFBLEVBQUEsV0FBQSxFQUFBLGNBQUEsRUFBQSxXQUFBLENBQUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxrQkFBQSxFQUFBLGlCQUFBLEVBQUEscUJBQUEsRUFBQTs7QUFFQSxtQkFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTs7QUFFQSxvQkFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLHVCQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7OztBQUdBLEdBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQSxhQUFBLEVBQUE7O0FBRUEsTUFBQSw0QkFBQSxHQUFBLFNBQUEsNEJBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLElBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLENBQUE7R0FDQSxDQUFBOzs7O0FBSUEsWUFBQSxDQUFBLEdBQUEsQ0FBQSxtQkFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxRQUFBLEVBQUE7O0FBRUEsUUFBQSxDQUFBLDRCQUFBLENBQUEsT0FBQSxDQUFBLEVBQUE7OztBQUdBLGFBQUE7S0FDQTs7QUFFQSxRQUFBLFdBQUEsQ0FBQSxlQUFBLEVBQUEsRUFBQTs7O0FBR0EsYUFBQTtLQUNBOzs7QUFHQSxTQUFBLENBQUEsY0FBQSxFQUFBLENBQUE7O0FBRUEsZUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTs7OztBQUlBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO09BQ0EsTUFBQTtBQUNBLGNBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7T0FDQTtLQUNBLENBQUEsQ0FBQTtHQUVBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFHQSxHQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsRUFBQSxDQUFBLFlBQUE7QUFDQSxTQUFBO0FBQ0EsU0FBQSxFQUFBO0FBQ0EsY0FBQSxFQUFBLEdBQUE7S0FDQTtBQUNBLFFBQUEsRUFBQSxjQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsVUFBQSxXQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsTUFBQSxDQUFBLFlBQUE7QUFDQSxpQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsZUFBQSxDQUFBLFFBQUEsR0FBQSxXQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQSxDQUFBOztBQ25FQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLGlCQUFBO0FBQ0EsZUFBQSxFQUFBLDJCQUFBO0FBQ0EsY0FBQSxFQUFBLG9CQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxTQUFBLENBQUEsaUJBQUEsRUFBQSxDQUFBLFFBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLFNBQUE7QUFDQSxZQUFBLEVBQUEsSUFBQTtBQUNBLFNBQUEsRUFBQSxJQUFBO0FBQ0EsWUFBQSxFQUFBLDhEQUFBLEdBQ0EsbUhBQUEsR0FDQSxRQUFBO0FBQ0EsUUFBQSxFQUFBLGNBQUEsTUFBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsVUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEVBQUEsQ0FBQSxjQUFBLEVBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxZQUFBLFVBQUEsR0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsR0FBQSxVQUFBLENBQUE7QUFDQSxZQUFBLFVBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQTtTQUNBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxvQkFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7QUFDQSxRQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxLQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFdBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsU0FBQSxHQUFBLENBQUE7QUFDQSxRQUFBLEVBQUEsVUFBQTtBQUNBLFNBQUEsRUFBQSxVQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxPQUFBO0FBQ0EsU0FBQSxFQUFBLE9BQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLE1BQUE7QUFDQSxTQUFBLEVBQUEsTUFBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsS0FBQTtBQUNBLFNBQUEsRUFBQSxPQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxPQUFBO0FBQ0EsU0FBQSxFQUFBLE9BQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLGFBQUE7QUFDQSxTQUFBLEVBQUEsYUFBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsV0FBQTtBQUNBLFNBQUEsRUFBQSxXQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxrQkFBQTtBQUNBLFNBQUEsRUFBQSxXQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxVQUFBO0FBQ0EsU0FBQSxFQUFBLGFBQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLFdBQUE7QUFDQSxTQUFBLEVBQUEsY0FBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsU0FBQTtBQUNBLFNBQUEsRUFBQSxZQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxTQUFBO0FBQ0EsU0FBQSxFQUFBLFlBQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLFVBQUE7QUFDQSxTQUFBLEVBQUEsVUFBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsZ0JBQUE7QUFDQSxTQUFBLEVBQUEsYUFBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsWUFBQTtBQUNBLFNBQUEsRUFBQSxXQUFBO0dBQ0EsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLHFCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLEtBQUEsR0FBQTtBQUNBLFlBQUEsRUFBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLEVBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsR0FBQSxHQUFBO0FBQ0EsUUFBQSxFQUFBLFNBQUE7QUFDQSxTQUFBLEVBQUEsQ0FBQTtBQUNBLFdBQUEsRUFBQSxLQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUE7QUFDQSxpQkFBQSxFQUFBLEVBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUE7S0FDQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSx1QkFBQSxFQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsZ0ZBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsR0FBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUE7S0FDQSxDQUFBLFNBQ0EsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGtCQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLElBQUEsU0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLE1BQUEsR0FBQSxJQUFBLENBQUE7S0FDQSxNQUFBLElBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLElBQUEsYUFBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLE1BQUEsR0FBQSxLQUFBLENBQUE7S0FDQTtBQUNBLFFBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLFNBQUEsR0FBQSxPQUFBLENBQUE7S0FDQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLFNBQUEsR0FBQSxPQUFBLENBQUE7S0FDQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUEsS0FBQSxDQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLFNBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxPQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxlQUFBLEdBQUEsQ0FBQSxLQUFBLEtBQUEsSUFBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGVBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0FBQ0EsUUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLGVBQUEsRUFBQSxLQUFBLENBQUEsZUFBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsZUFBQSxDQUFBO0FBQ0EsUUFBQSxJQUFBLEdBQUE7QUFDQSxXQUFBLEVBQUEsS0FBQTtBQUNBLGNBQUEsRUFBQSxVQUFBLENBQUEsUUFBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsRUFBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEscUJBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsb0JBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxLQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsV0FBQSxDQUFBLFdBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLEdBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsU0FBQSxHQUFBLE9BQUEsQ0FBQTtLQUNBO0FBQ0EsUUFBQSxNQUFBLENBQUEsV0FBQSxDQUFBLFdBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLEdBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsU0FBQSxHQUFBLE9BQUEsQ0FBQTtLQUNBO0FBQ0EsUUFBQSxNQUFBLENBQUEsV0FBQSxDQUFBLEtBQUEsRUFBQSxLQUFBLENBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxJQUFBLEdBQUE7QUFDQSxXQUFBLEVBQUEsS0FBQTtBQUNBLGNBQUEsRUFBQSxVQUFBLENBQUEsUUFBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsNEJBQUEsRUFBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsY0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsMkJBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsUUFBQSxNQUFBLEdBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLEVBQUEsUUFBQTtBQUNBLGNBQUEsRUFBQSxRQUFBO0tBQ0EsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLHFCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLDJCQUFBLEdBQUEsS0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsaUJBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsS0FBQSxFQUFBLEVBQUE7O0FBRUEsWUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsSUFBQSxDQUFBLHlCQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBO09BQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQTtLQUNBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLDJCQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLEdBQUE7QUFDQSxnQkFBQSxFQUFBLEVBQUE7QUFDQSxtQkFBQSxFQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsRUFBQTtPQUNBLENBQUE7QUFDQSxXQUFBLENBQUEsaUNBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSw0QkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLHFCQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSwwQkFBQSxFQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBO0FBQ0EscUJBQUEsRUFBQSxFQUFBO09BQ0EsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxpQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLDRCQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7OztBQUtBLFFBQUEsQ0FBQSxFQUFBLENBQUEsY0FBQSxFQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsUUFBQSxVQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEdBQUEsVUFBQSxDQUFBO0FBQ0EsUUFBQSxVQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLGdCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUMzUUEsQ0FBQSxZQUFBOztBQUVBLGNBQUEsQ0FBQTs7QUFFQSxNQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxNQUFBLElBQUEsS0FBQSxDQUFBLHdCQUFBLENBQUEsQ0FBQTs7QUFFQSxNQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLGFBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTs7QUFFQSxLQUFBLENBQUEsT0FBQSxDQUFBLFlBQUEsRUFBQSxZQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQUEsTUFBQSxJQUFBLEtBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUE7QUFDQSxXQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtHQUNBLENBQUEsQ0FBQTs7QUFFQSxLQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxVQUFBLEVBQUE7QUFDQSxXQUFBO0FBQ0EsUUFBQSxFQUFBLFlBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsRUFBQSxDQUFBLFNBQUEsRUFBQSxZQUFBO0FBQ0EsY0FBQSxJQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0Esb0JBQUEsQ0FBQSxNQUFBLENBQUEsWUFBQTtBQUNBLG9CQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtXQUNBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBO0FBQ0EsVUFBQSxFQUFBLGNBQUEsU0FBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLFlBQUE7QUFDQSxjQUFBLElBQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxvQkFBQSxDQUFBLE1BQUEsQ0FBQSxZQUFBO0FBQ0EsZ0JBQUEsUUFBQSxFQUFBO0FBQ0Esc0JBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO2FBQ0E7V0FDQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7T0FDQTtLQUNBLENBQUE7R0FDQSxDQUFBLENBQUE7Ozs7O0FBS0EsS0FBQSxDQUFBLFFBQUEsQ0FBQSxhQUFBLEVBQUE7QUFDQSxnQkFBQSxFQUFBLG9CQUFBO0FBQ0EsZUFBQSxFQUFBLG1CQUFBO0FBQ0EsaUJBQUEsRUFBQSxxQkFBQTtBQUNBLGtCQUFBLEVBQUEsc0JBQUE7QUFDQSxvQkFBQSxFQUFBLHdCQUFBO0FBQ0EsaUJBQUEsRUFBQSxxQkFBQTtHQUNBLENBQUEsQ0FBQTs7QUFFQSxLQUFBLENBQUEsT0FBQSxDQUFBLGlCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsRUFBQSxFQUFBLFdBQUEsRUFBQTtBQUNBLFFBQUEsVUFBQSxHQUFBO0FBQ0EsU0FBQSxFQUFBLFdBQUEsQ0FBQSxnQkFBQTtBQUNBLFNBQUEsRUFBQSxXQUFBLENBQUEsYUFBQTtBQUNBLFNBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtBQUNBLFNBQUEsRUFBQSxXQUFBLENBQUEsY0FBQTtLQUNBLENBQUE7QUFDQSxXQUFBO0FBQ0EsbUJBQUEsRUFBQSx1QkFBQSxRQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLFVBQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO09BQ0E7S0FDQSxDQUFBO0dBQ0EsQ0FBQSxDQUFBOztBQUVBLEtBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxhQUFBLEVBQUE7QUFDQSxpQkFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxXQUFBLEVBQ0EsVUFBQSxTQUFBLEVBQUE7QUFDQSxhQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBLENBQUE7O0FBRUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsRUFBQSxFQUFBOztBQUVBLGFBQUEsaUJBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxVQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsYUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxFQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsVUFBQSxDQUFBLFdBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQTtLQUNBOzs7O0FBSUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsYUFBQSxDQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxVQUFBLFVBQUEsRUFBQTs7Ozs7Ozs7OztBQVVBLFVBQUEsSUFBQSxDQUFBLGVBQUEsRUFBQSxJQUFBLFVBQUEsS0FBQSxJQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO09BQ0E7Ozs7O0FBS0EsYUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxpQkFBQSxDQUFBLFNBQUEsQ0FBQSxZQUFBO0FBQ0EsZUFBQSxJQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7S0FFQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxLQUFBLEdBQUEsVUFBQSxXQUFBLEVBQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLFdBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxpQkFBQSxDQUFBLFNBQ0EsQ0FBQSxZQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsTUFBQSxDQUFBO0FBQ0EsaUJBQUEsRUFBQSw0QkFBQTtTQUNBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsZUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxVQUFBLENBQUEsV0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTtHQUNBLENBQUEsQ0FBQTs7QUFFQSxLQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUE7O0FBRUEsUUFBQSxJQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLGNBQUEsQ0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLGdCQUFBLEVBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxjQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQSxjQUFBLEVBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxTQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLEVBQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTtLQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLEVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTtLQUNBLENBQUE7R0FFQSxDQUFBLENBQUE7Q0FFQSxDQUFBLEVBQUEsQ0FBQTtBQzNKQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFFBQUE7QUFDQSxlQUFBLEVBQUEscUJBQUE7QUFDQSxjQUFBLEVBQUEsc0JBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBR0EsR0FBQSxDQUFBLFVBQUEsQ0FBQSxzQkFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFdBQUEsRUFBQSxhQUFBLEVBQUE7QUFDQSxRQUFBLENBQUEsT0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFdBQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLEtBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsRUFBQTtBQUNBLGNBQUEsRUFBQSxNQUFBLENBQUEsUUFBQTtLQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLGdCQUFBLENBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsZUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUE7S0FDQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBLGtDQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxRQUFBLENBQUEsVUFBQSxDQUFBO0FBQ0EsaUJBQUEsRUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFFBQUE7QUFDQSxvQkFBQSxFQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQTtBQUNBLGFBQUEsRUFBQSxjQUFBO09BQ0EsQ0FBQSxDQUFBO0FBQ0EsYUFBQSxFQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxXQUFBLEdBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLGFBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSwwQkFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEdBQUEsQ0FBQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxVQUFBLENBQUEsUUFBQTtPQUNBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsYUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLGFBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsRUFBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsRUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEseUJBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQSw2QkFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFdBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsYUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxFQUFBLENBQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsZUFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsWUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFNBQUEsSUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsR0FBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUE7QUFDQSxVQUFBLEdBQUEsR0FBQSxNQUFBLENBQUEsV0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGVBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtLQUNBO0FBQ0EsY0FBQSxDQUFBLFlBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxxQkFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtPQUNBLEVBQUEsRUFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxJQUFBLEVBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUE7QUFDQSxRQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsVUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLEtBQUEsSUFBQSxDQUFBLENBQUEsRUFBQTtBQUNBLFNBQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtLQUNBLE1BQUE7QUFDQSxTQUFBLENBQUEsVUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLElBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFFBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQSxNQUFBLElBQUEsQ0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtLQUNBLE1BQUE7QUFDQSxXQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxHQUFBLENBQUEsdUJBQUEsRUFBQSxLQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsZUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsZUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtPQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLHFCQUFBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsVUFBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLFVBQUEsQ0FBQSwwQkFBQSxHQUFBLFVBQUEsQ0FBQSxHQUFBLEdBQUEsR0FBQSxHQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxVQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsZUFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxlQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLHVCQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE9BQUEsR0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxVQUFBLENBQUEsMkJBQUEsR0FBQSxVQUFBLENBQUEsR0FBQSxHQUFBLEdBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLGVBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsZUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSx3QkFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDbktBLEdBQUEsQ0FBQSxPQUFBLENBQUEsZUFBQSxFQUFBLFlBQUE7QUFDQSxTQUFBO0FBQ0EsYUFBQSxFQUFBLG1CQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxtQ0FBQSxHQUFBLEdBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxHQUFBLFFBQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsS0FBQTtBQUNBLGlCQUFBLEVBQUEsR0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ1ZBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsWUFBQTtBQUNBLGVBQUEsRUFBQSw2QkFBQTtBQUNBLGNBQUEsRUFBQSxxQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFHQSxHQUFBLENBQUEsVUFBQSxDQUFBLHFCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsV0FBQSxFQUFBOztBQUVBLFFBQUEsQ0FBQSxZQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxNQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsYUFBQSxDQUFBO0FBQ0EsTUFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7R0FDQTtBQUNBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsUUFBQSxHQUFBLGNBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsT0FBQSxHQUFBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsSUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO0dBRUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsV0FBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBLGVBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLHFCQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsT0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxFQUFBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsT0FBQSxHQUFBLENBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsVUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsUUFBQSxLQUFBLEdBQUEsSUFBQSxJQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsS0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQUEsR0FBQSxJQUFBLEVBQUEsT0FBQTtBQUNBLFVBQUEsQ0FBQSxXQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxXQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsWUFBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLFNBQUEsSUFBQSxHQUFBLEVBQUE7QUFDQSxVQUFBLE9BQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLGFBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsU0FBQSxHQUFBO0FBQ0EsaUJBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLFNBQUE7QUFDQSxXQUFBLEVBQUEsT0FBQTtBQUNBLFlBQUEsRUFBQSxLQUFBO09BQ0EsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO0tBQ0EsTUFBQTtBQUNBLFlBQUEsQ0FBQSxZQUFBLEdBQUEsb0NBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsb0NBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxRQUFBLENBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsS0FBQTtBQUNBLGlCQUFBLEVBQUEsR0FBQTtPQUNBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxTQUFBLENBQUEsT0FBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxZQUFBLEdBQUEsU0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsRUFBQTtBQUNBLFNBQUEsRUFBQSxNQUFBLENBQUEsWUFBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxTQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFNBQUEsQ0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxZQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLEtBQUE7QUFDQSxpQkFBQSxFQUFBLEdBQUE7T0FDQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxHQUFBLFFBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxXQUFBLFVBQUEsQ0FBQSxjQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLEdBQUEsR0FBQSxHQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLFdBQUEsR0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGlCQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtBQUNBLG1CQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSx3QkFBQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7S0FDQSxNQUFBO0FBQ0EsVUFBQSxXQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxlQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtBQUNBLGlCQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7QUFDQSxVQUFBLE1BQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxtQkFBQSxDQUFBLENBQUE7S0FDQSxNQUFBO0FBQ0EsVUFBQSxNQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFNBQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsYUFBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLEVBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxlQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsV0FBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsbUJBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLENBQUE7V0FDQSxDQUFBLENBQUE7QUFDQSxxQkFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLHNCQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBLE1BQUE7QUFDQSxjQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsRUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGVBQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxXQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxtQkFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsQ0FBQTtXQUNBLENBQUEsQ0FBQTtBQUNBLHFCQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7T0FDQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsU0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxFQUFBLE9BQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFlBQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsY0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQSxpQ0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsUUFBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBO0FBQ0Esb0JBQUEsRUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFdBQUE7QUFDQSxhQUFBLEVBQUEsY0FBQTtPQUNBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxjQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsUUFBQSxFQUFBLENBQUE7QUFDQSxVQUFBLE9BQUEsR0FBQSw2Q0FBQSxHQUFBLE1BQUEsQ0FBQSxZQUFBLEdBQUEsYUFBQSxHQUFBLE1BQUEsQ0FBQSxjQUFBLENBQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBOzs7Ozs7QUFNQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxRQUFBLEtBQUEsSUFBQSxDQUFBLEVBQUEsT0FBQTtBQUNBLFFBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsUUFBQSxLQUFBLElBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsRUFBQSxPQUFBO0FBQ0EsUUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7R0FDQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLGNBQUEsQ0FBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLFdBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxDQUFBLG1DQUFBLEdBQUEsR0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLGlCQUFBLEVBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxHQUFBLFFBQUEsQ0FBQTtBQUNBLG1CQUFBLEVBQUEsS0FBQTtBQUNBLG1CQUFBLEVBQUEsR0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBLEVBQUEsRUFBQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxjQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsWUFBQTtBQUNBLFdBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxDQUFBLG1DQUFBLEdBQUEsTUFBQSxFQUFBO0FBQ0EsaUJBQUEsRUFBQSxRQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsR0FBQSxRQUFBLENBQUE7QUFDQSxtQkFBQSxFQUFBLEtBQUE7QUFDQSxtQkFBQSxFQUFBLEdBQUE7U0FDQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7S0FDQSxFQUFBLEVBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtBQUNBLE1BQUEsTUFBQSxDQUFBLE9BQUEsSUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxjQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtHQUNBO0FBQ0EsUUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLFNBQUEsY0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLE1BQUEsUUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLE1BQUEsS0FBQSxHQUFBLElBQUEsSUFBQSxFQUFBLENBQUE7QUFDQSxPQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBO0FBQ0EsUUFBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLElBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLEVBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxRQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxTQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7S0FDQTtBQUNBLGFBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsR0FBQSxFQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7R0FDQTtBQUNBLFNBQUEsUUFBQSxDQUFBO0NBQ0E7QUN0VEEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLFlBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxTQUFBO0FBQ0EsZUFBQSxFQUFBLDRCQUFBO0FBQ0EsY0FBQSxFQUFBLHNCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsc0JBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQTs7QUFFQSxRQUFBLENBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsRUFBQTtBQUNBLFNBQUEsRUFBQSxNQUFBLENBQUEsR0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxDQUFBLE9BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLFFBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBO0FBQ0EsaUJBQUEsRUFBQSxLQUFBO0FBQ0EsaUJBQUEsRUFBQSxHQUFBO09BQ0EsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEdBQUEsUUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxLQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSwyQkFBQSxDQUFBLENBQUE7S0FDQSxNQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUE7S0FDQSxNQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsSUFBQSxDQUFBLGtCQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxLQUFBO0FBQ0EsZUFBQSxFQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsT0FBQTtBQUNBLFlBQUEsRUFBQSxNQUFBLENBQUEsVUFBQSxDQUFBLElBQUE7QUFDQSxhQUFBLEVBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxLQUFBO0FBQ0EsZ0JBQUEsRUFBQSxNQUFBLENBQUEsVUFBQSxDQUFBLFFBQUE7QUFDQSxrQkFBQSxFQUFBLEVBQUE7QUFDQSxrQkFBQSxFQUFBLEVBQUE7T0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsZUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLHlEQUFBLENBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7T0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSwrQkFBQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNoRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLGVBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxnQ0FBQTtBQUNBLGVBQUEsRUFBQSx3Q0FBQTtBQUNBLGNBQUEsRUFBQSxzQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsZ0JBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSw2Q0FBQTtBQUNBLGVBQUEsRUFBQSx3Q0FBQTtBQUNBLGNBQUEsRUFBQSxzQkFBQTtHQW1CQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxzQkFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFlBQUEsRUFBQSxXQUFBLEVBQUE7QUFDQSxRQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQTs7QUFHQSxRQUFBLENBQUEsYUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLE1BQUEsWUFBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxhQUFBLEdBQUEsSUFBQSxDQUFBO0dBQ0E7OztBQUdBLFFBQUEsQ0FBQSxRQUFBLEdBQUE7QUFDQSxZQUFBLEVBQUEsS0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxZQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsR0FBQSxDQUFBLHNDQUFBLEdBQUEsWUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsUUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxRQUFBLEdBQUEsUUFBQSxDQUFBO1NBQ0EsTUFBQTtBQUNBLGdCQUFBLENBQUEsUUFBQSxHQUFBLEVBQUEsQ0FBQTtTQUNBO09BQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsOEJBQUEsQ0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0EsTUFBQTtBQUNBLGFBQUEsS0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOzs7QUFHQSxRQUFBLENBQUEsSUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsMkJBQUEsRUFBQSxNQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLHVCQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsZ0NBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUE7S0FDQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUMxR0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLGdCQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsNEJBQUE7QUFDQSxlQUFBLEVBQUEsNENBQUE7QUFDQSxjQUFBLEVBQUEsMEJBQUE7QUFDQSxXQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsbUJBQUEsS0FBQSxFQUFBO0FBQ0EsZUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDBCQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsY0FBQSxRQUFBLEVBQUE7QUFDQSxtQkFBQSxRQUFBLENBQUE7V0FDQSxNQUFBO0FBQ0EsbUJBQUE7QUFDQSxxQkFBQSxFQUFBLGdCQUFBO2FBQ0EsQ0FBQTtXQUNBO1NBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxlQUFBLENBQUEsOEJBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0E7S0FDQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLDBCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsV0FBQSxFQUFBLFNBQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFNBQUEsR0FBQSxTQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBdUJBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSwwQkFBQSxFQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsY0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7OztBQWdCQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBO0tBQ0EsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDdkZBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsV0FBQTtBQUNBLGVBQUEsRUFBQSxnREFBQTtBQUNBLGNBQUEsRUFBQSx5QkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLHlCQUFBLEVBQUEsQ0FBQSxZQUFBLEVBQ0EsUUFBQSxFQUNBLFFBQUEsRUFDQSxPQUFBLEVBQ0EsV0FBQSxFQUNBLFNBQUEsRUFDQSxzQkFBQSxFQUNBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsb0JBQUEsRUFBQTs7OztBQUlBLE1BQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLE1BQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLE1BQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLE1BQUEsU0FBQSxHQUFBLElBQUEsQ0FBQTs7OztBQUlBLFFBQUEsQ0FBQSxTQUFBLEdBQUE7QUFDQSxhQUFBLEVBQUEsc0JBQUE7QUFDQSxZQUFBLEVBQUEsYUFBQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsZUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0tBQ0EsTUFBQTtBQUNBLGVBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsbUJBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxpQkFBQSxHQUFBLDhCQUFBLENBQUE7Ozs7QUFJQSxRQUFBLENBQUEsZ0JBQUEsR0FBQSxZQUFBOztBQUVBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsUUFBQSxPQUFBLEdBQUEsU0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQTtBQUNBLHdCQUFBLENBQ0EsU0FBQSxFQUFBLENBQ0EsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxrQkFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLG9CQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxRQUFBLENBQUEsU0FDQSxDQUFBLHVCQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLE1BQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQTtBQUNBLG9CQUFBLEVBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBO0FBQ0EsYUFBQSxFQUFBLGNBQUE7T0FDQSxDQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLGtCQUFBLEdBQUE7QUFDQSxhQUFBLG9CQUFBLENBQUEsZ0JBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsb0JBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxXQUFBLEdBQUE7QUFDQSxnQkFBQSxFQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsUUFBQTtBQUNBLG1CQUFBLEVBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBO0FBQ0Esa0JBQUEsRUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLFVBQUE7QUFDQSxhQUFBLEVBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBO0FBQ0Esa0JBQUEsRUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLFVBQUE7T0FDQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsZUFBQTtBQUNBLDRCQUFBLEVBQUEsTUFBQSxHQUFBLEtBQUEsQ0FBQSxVQUFBLEdBQUEsR0FBQTtBQUNBLDZCQUFBLEVBQUEsV0FBQTtBQUNBLDJCQUFBLEVBQUEsT0FBQTtTQUNBLENBQUE7T0FDQSxDQUFBO0FBQ0EsYUFBQSxvQkFBQSxDQUFBLFlBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsZ0JBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLGVBQUEsR0FBQTtBQUNBLGVBQUEsRUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEVBQUE7QUFDQSxnQkFBQSxFQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQTtBQUNBLGFBQUEsRUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUE7QUFDQSxtQkFBQSxFQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLGdCQUFBLEVBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBO09BQ0EsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxpQkFBQSxHQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQTs7QUFFQSxZQUFBLENBQUEsU0FBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQTs7QUFFQSxZQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBOztBQUVBLGFBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsU0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxRQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsZUFBQSxHQUFBLE1BQUEsQ0FBQTs7S0FFQTs7QUFFQSxhQUFBLHVCQUFBLEdBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOzs7O0FBS0EsUUFBQSxDQUFBLGFBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxHQUFBLENBQUEsaUNBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQTtBQUNBLG9CQUFBLEVBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBO0FBQ0EsYUFBQSxFQUFBLGNBQUE7T0FDQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsY0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0EsYUFBQSxFQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFlBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxZQUFBLENBQUEsU0FDQSxDQUFBLGVBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsWUFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsR0FBQTtBQUNBLGFBQUEsRUFBQSxHQUFBLENBQUEsV0FBQTtBQUNBLGVBQUEsRUFBQSxTQUFBLENBQUEsT0FBQTtBQUNBLGdCQUFBLEVBQUEsU0FBQSxDQUFBLFFBQUE7QUFDQSxrQkFBQSxFQUFBLEtBQUEsQ0FBQSxVQUFBO09BQ0EsQ0FBQTtBQUNBLGFBQUEsb0JBQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLFlBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxVQUFBLEtBQUEsQ0FBQSxXQUFBLElBQUEsS0FBQSxDQUFBLFdBQUEsS0FBQSxFQUFBLEVBQUE7QUFDQSxlQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxLQUFBLENBQUEsV0FBQSxDQUFBO09BQ0EsTUFBQSxJQUFBLFNBQUEsQ0FBQSxXQUFBLElBQUEsT0FBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLGVBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxHQUFBLFNBQUEsQ0FBQSxXQUFBLEdBQUEsYUFBQSxHQUFBLE1BQUEsQ0FBQSxjQUFBLEdBQUEsZUFBQSxHQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxFQUFBLENBQUE7T0FDQSxNQUFBO0FBQ0EsY0FBQSxDQUFBLFNBQUEsR0FBQSxxQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLG1CQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO09BQ0E7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsZUFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxrQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBO0dBRUEsQ0FBQTtDQUNBLENBQ0EsQ0FBQSxDQUFBO0FDM0tBLEdBQUEsQ0FBQSxPQUFBLENBQUEsc0JBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxXQUFBLGdCQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDhCQUFBLEdBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLFlBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsRUFBQTtBQUNBLFNBQUEsRUFBQSxJQUFBLENBQUEsUUFBQTtLQUNBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEsWUFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxvQkFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsV0FBQSxTQUFBLEdBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsa0NBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsU0FBQTtBQUNBLG9CQUFBLEVBQUEsZ0JBQUE7QUFDQSxnQkFBQSxFQUFBLFlBQUE7QUFDQSxnQkFBQSxFQUFBLFlBQUE7QUFDQSxhQUFBLEVBQUEsU0FBQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUEsQ0FBQTtBQzFCQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FDQSxLQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUEseUJBQUE7QUFDQSxjQUFBLEVBQUEsZ0JBQUE7R0FDQSxDQUFBLENBQ0EsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxRQUFBO0FBQ0EsZUFBQSxFQUFBLDBCQUFBO0FBQ0EsY0FBQSxFQUFBLGdCQUFBO0dBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsV0FBQTtBQUNBLGVBQUEsRUFBQSw2QkFBQTtBQUNBLGNBQUEsRUFBQSxnQkFBQTtHQUNBLENBQUEsQ0FDQSxLQUFBLENBQUEsYUFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLGVBQUE7QUFDQSxlQUFBLEVBQUEsaUNBQUE7QUFDQSxjQUFBLEVBQUEsZ0JBQUE7R0FDQSxDQUFBLENBQ0EsS0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxPQUFBO0FBQ0EsZUFBQSxFQUFBLHlCQUFBO0FBQ0EsY0FBQSxFQUFBLGdCQUFBO0dBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsUUFBQTtBQUNBLGVBQUEsRUFBQSwwQkFBQTtBQUNBLGNBQUEsRUFBQSxnQkFBQTtHQUNBLENBQUEsQ0FDQSxLQUFBLENBQUEsU0FBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFVBQUE7QUFDQSxlQUFBLEVBQUEsNEJBQUE7QUFDQSxjQUFBLEVBQUEsZ0JBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxnQkFBQSxFQUFBLENBQUEsWUFBQSxFQUNBLFFBQUEsRUFDQSxRQUFBLEVBQ0EsT0FBQSxFQUNBLFdBQUEsRUFDQSxTQUFBLEVBQ0EsYUFBQSxFQUNBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsV0FBQSxFQUFBOztBQUVBLFFBQUEsQ0FBQSxjQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBO0FBQ0EsU0FBQSxFQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsS0FBQTtLQUNBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxxQkFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBOztBQUVBLFVBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxHQUFBO0FBQ0EsU0FBQSxFQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsS0FBQTtLQUNBLENBQUE7O0FBRUEsUUFBQSxNQUFBLENBQUEsY0FBQSxDQUFBLFFBQUEsS0FBQSxNQUFBLENBQUEsY0FBQSxDQUFBLGVBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxHQUFBO0FBQ0EsV0FBQSxFQUFBLDRDQUFBO0FBQ0EsZUFBQSxFQUFBLElBQUE7T0FDQSxDQUFBOztBQUVBLGFBQUEsS0FBQSxDQUFBO0tBQ0E7QUFDQSxlQUFBLENBQ0EsZUFBQSxDQUFBLE1BQUEsQ0FBQSxjQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsdUJBQUEsQ0FBQSxTQUNBLENBQUEsb0JBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsdUJBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxVQUFBLEdBQUEsQ0FBQSxNQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLGNBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQTtPQUNBO0tBQ0E7O0FBRUEsYUFBQSxvQkFBQSxHQUFBO0FBQ0EsWUFBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEdBQUE7QUFDQSxXQUFBLEVBQUEsa0NBQUE7QUFDQSxlQUFBLEVBQUEsSUFBQTtPQUNBLENBQUE7S0FDQTtHQUNBLENBQUE7Q0FDQSxDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsU0FBQSxDQUFBLFNBQUEsRUFBQSxVQUFBLE9BQUEsRUFBQTtBQUNBLFNBQUE7QUFDQSxZQUFBLEVBQUEsSUFBQTtBQUNBLFFBQUEsRUFBQSxjQUFBLE1BQUEsRUFBQSxRQUFBLEVBQUE7QUFDQSxVQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxTQUFBLEdBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLFNBQUEsQ0FBQTs7QUFFQSxlQUFBLFlBQUEsR0FBQTs7QUFFQSxZQUFBLE9BQUEsQ0FBQSxXQUFBLEdBQUEsU0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxFQUFBLE9BQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxFQUFBLE1BQUEsQ0FBQSxDQUFBO1NBQ0EsTUFBQTtBQUNBLGtCQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTtTQUNBO09BQ0E7O0FBRUEsWUFBQSxDQUFBLEdBQUEsQ0FBQSxtQkFBQSxFQUFBLFlBQUE7QUFDQSxXQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsRUFBQSxZQUFBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLFlBQUEsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQ3ZIQSxHQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxXQUFBLGVBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsdUJBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFNBQUE7QUFDQSxtQkFBQSxFQUFBLGVBQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBLENBQUE7O0FDWEEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxVQUFBO0FBQ0EsZUFBQSxFQUFBLCtCQUFBO0FBQ0EsY0FBQSxFQUFBLG1CQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsbUJBQUEsRUFBQSxDQUFBLFlBQUEsRUFDQSxRQUFBLEVBQ0EsUUFBQSxFQUNBLE9BQUEsRUFDQSxXQUFBLEVBQ0EsU0FBQSxFQUNBLGdCQUFBLEVBQ0EsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsU0FBQSxFQUFBLE9BQUEsRUFBQSxjQUFBLEVBQUE7O0FBRUEsUUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLE9BQUEsRUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEtBQUE7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxJQUFBLEdBQUEsSUFBQSxRQUFBLEVBQUEsQ0FBQTtBQUNBLFNBQUEsSUFBQSxJQUFBLElBQUEsTUFBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtLQUNBO0FBQ0Esa0JBQUEsQ0FDQSxXQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLGVBQUEsQ0FBQSxTQUNBLENBQUEsVUFBQSxDQUFBLENBQUE7O0FBRUEsYUFBQSxlQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxHQUFBLENBQUEsTUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxHQUFBLHFEQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLGVBQUEsQ0FBQSxPQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLGVBQUE7T0FDQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxHQUFBLG9EQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLFVBQUEsR0FBQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxHQUFBLG9EQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUEsQ0FBQTs7QUNqREEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxnQkFBQSxFQUFBLENBQUEsT0FBQSxFQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLFdBQUEsV0FBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxFQUFBLE1BQUE7QUFDQSxTQUFBLEVBQUEsY0FBQTtBQUNBLGFBQUEsRUFBQSxFQUFBLGNBQUEsRUFBQSxTQUFBLEVBQUE7QUFDQSxzQkFBQSxFQUFBLE9BQUEsQ0FBQSxRQUFBO0FBQ0EsVUFBQSxFQUFBLElBQUE7S0FDQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxTQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBLENBQUEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbndpbmRvdy5hcHAgPSBhbmd1bGFyLm1vZHVsZSgnRnVsbHN0YWNrR2VuZXJhdGVkQXBwJywgWydmc2FQcmVCdWlsdCcsICd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJywgJ25nQW5pbWF0ZSddKTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlciwgJHVpVmlld1Njcm9sbFByb3ZpZGVyKSB7XG4gICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcbiAgICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG4gICAgJHVpVmlld1Njcm9sbFByb3ZpZGVyLnVzZUFuY2hvclNjcm9sbCgpO1xufSk7XG5cbi8vIFRoaXMgYXBwLnJ1biBpcyBmb3IgY29udHJvbGxpbmcgYWNjZXNzIHRvIHNwZWNpZmljIHN0YXRlcy5cbmFwcC5ydW4oZnVuY3Rpb24gKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUsICR1aVZpZXdTY3JvbGwpIHtcbiAgICAvLyBUaGUgZ2l2ZW4gc3RhdGUgcmVxdWlyZXMgYW4gYXV0aGVudGljYXRlZCB1c2VyLlxuICAgIHZhciBkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBdXRoID0gZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgIHJldHVybiBzdGF0ZS5kYXRhICYmIHN0YXRlLmRhdGEuYXV0aGVudGljYXRlO1xuICAgIH07XG5cbiAgICAvLyAkc3RhdGVDaGFuZ2VTdGFydCBpcyBhbiBldmVudCBmaXJlZFxuICAgIC8vIHdoZW5ldmVyIHRoZSBwcm9jZXNzIG9mIGNoYW5naW5nIGEgc3RhdGUgYmVnaW5zLlxuICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uIChldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMpIHtcblxuICAgICAgICBpZiAoIWRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGgodG9TdGF0ZSkpIHtcbiAgICAgICAgICAgIC8vIFRoZSBkZXN0aW5hdGlvbiBzdGF0ZSBkb2VzIG5vdCByZXF1aXJlIGF1dGhlbnRpY2F0aW9uXG4gICAgICAgICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgICAgICAvLyBUaGUgdXNlciBpcyBhdXRoZW50aWNhdGVkLlxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhbmNlbCBuYXZpZ2F0aW5nIHRvIG5ldyBzdGF0ZS5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAvLyBJZiBhIHVzZXIgaXMgcmV0cmlldmVkLCB0aGVuIHJlbmF2aWdhdGUgdG8gdGhlIGRlc3RpbmF0aW9uXG4gICAgICAgICAgICAvLyAodGhlIHNlY29uZCB0aW1lLCBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSB3aWxsIHdvcmspXG4gICAgICAgICAgICAvLyBvdGhlcndpc2UsIGlmIG5vIHVzZXIgaXMgbG9nZ2VkIGluLCBnbyB0byBcImxvZ2luXCIgc3RhdGUuXG4gICAgICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbyh0b1N0YXRlLm5hbWUsIHRvUGFyYW1zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdsb2dpbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH0pO1xuXG59KTtcblxuXG5hcHAuZGlyZWN0aXZlKCdmaWxlcmVhZCcsIFtmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIGZpbGVyZWFkOiAnPSdcbiAgICAgICAgfSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICBlbGVtZW50LmJpbmQoJ2NoYW5nZScsIGZ1bmN0aW9uIChjaGFuZ2VFdmVudCkge1xuICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGNoYW5nZUV2ZW50LnRhcmdldC5maWxlc1swXSk7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmZpbGVyZWFkID0gY2hhbmdlRXZlbnQudGFyZ2V0LmZpbGVzWzBdO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkYXRhYmFzZScsIHtcbiAgICB1cmw6ICcvYWRtaW4vZGF0YWJhc2UnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvZGF0YWJhc2UvZGF0YWJhc2UuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0RhdGFiYXNlQ29udHJvbGxlcidcbiAgfSk7XG59KTtcblxuYXBwLmRpcmVjdGl2ZSgnbm90aWZpY2F0aW9uQmFyJywgWydzb2NrZXQnLCBmdW5jdGlvbihzb2NrZXQpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0VBJyxcbiAgICBzY29wZTogdHJ1ZSxcbiAgICB0ZW1wbGF0ZTogJzxkaXYgc3R5bGU9XCJtYXJnaW46IDAgYXV0bzt3aWR0aDo1MCVcIiBuZy1zaG93PVwiYmFyLnZpc2libGVcIj4nICtcbiAgICAgICc8dWliLXByb2dyZXNzPjx1aWItYmFyIHZhbHVlPVwiYmFyLnZhbHVlXCIgdHlwZT1cInt7YmFyLnR5cGV9fVwiPjxzcGFuPnt7YmFyLnZhbHVlfX0lPC9zcGFuPjwvdWliLWJhcj48L3VpYi1wcm9ncmVzcz4nICtcbiAgICAgICc8L2Rpdj4nLFxuICAgIGxpbms6IGZ1bmN0aW9uKCRzY29wZSwgaUVsbSwgaUF0dHJzLCBjb250cm9sbGVyKSB7XG4gICAgICBzb2NrZXQub24oJ25vdGlmaWNhdGlvbicsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHBlcmNlbnRhZ2UgPSBwYXJzZUludChNYXRoLmZsb29yKGRhdGEuY291bnRlciAvIGRhdGEudG90YWwgKiAxMDApLCAxMCk7XG4gICAgICAgICRzY29wZS5iYXIudmFsdWUgPSBwZXJjZW50YWdlO1xuICAgICAgICBpZiAocGVyY2VudGFnZSA9PT0gMTAwKSB7XG4gICAgICAgICAgJHNjb3BlLmJhci52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgJHNjb3BlLmJhci52YWx1ZSA9IDA7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1dKTtcblxuYXBwLmNvbnRyb2xsZXIoJ0RhdGFiYXNlQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgQXV0aFNlcnZpY2UsIHNvY2tldCkge1xuICAkc2NvcGUuYWRkVXNlciA9IHt9O1xuICAkc2NvcGUucXVlcnkgPSB7fTtcbiAgJHNjb3BlLnRyZFVzclF1ZXJ5ID0ge307XG4gICRzY29wZS5xdWVyeUNvbHMgPSBbe1xuICAgIG5hbWU6ICd1c2VybmFtZScsXG4gICAgdmFsdWU6ICd1c2VybmFtZSdcbiAgfSwge1xuICAgIG5hbWU6ICdnZW5yZScsXG4gICAgdmFsdWU6ICdnZW5yZSdcbiAgfSwge1xuICAgIG5hbWU6ICduYW1lJyxcbiAgICB2YWx1ZTogJ25hbWUnXG4gIH0sIHtcbiAgICBuYW1lOiAnVVJMJyxcbiAgICB2YWx1ZTogJ3NjVVJMJ1xuICB9LCB7XG4gICAgbmFtZTogJ2VtYWlsJyxcbiAgICB2YWx1ZTogJ2VtYWlsJ1xuICB9LCB7XG4gICAgbmFtZTogJ2Rlc2NyaXB0aW9uJyxcbiAgICB2YWx1ZTogJ2Rlc2NyaXB0aW9uJ1xuICB9LCB7XG4gICAgbmFtZTogJ2ZvbGxvd2VycycsXG4gICAgdmFsdWU6ICdmb2xsb3dlcnMnXG4gIH0sIHtcbiAgICBuYW1lOiAnbnVtYmVyIG9mIHRyYWNrcycsXG4gICAgdmFsdWU6ICdudW1UcmFja3MnXG4gIH0sIHtcbiAgICBuYW1lOiAnZmFjZWJvb2snLFxuICAgIHZhbHVlOiAnZmFjZWJvb2tVUkwnXG4gIH0sIHtcbiAgICBuYW1lOiAnaW5zdGFncmFtJyxcbiAgICB2YWx1ZTogJ2luc3RhZ3JhbVVSTCdcbiAgfSwge1xuICAgIG5hbWU6ICd0d2l0dGVyJyxcbiAgICB2YWx1ZTogJ3R3aXR0ZXJVUkwnXG4gIH0sIHtcbiAgICBuYW1lOiAneW91dHViZScsXG4gICAgdmFsdWU6ICd5b3V0dWJlVVJMJ1xuICB9LCB7XG4gICAgbmFtZTogJ3dlYnNpdGVzJyxcbiAgICB2YWx1ZTogJ3dlYnNpdGVzJ1xuICB9LCB7XG4gICAgbmFtZTogJ2F1dG8gZW1haWwgZGF5JyxcbiAgICB2YWx1ZTogJ2VtYWlsRGF5TnVtJ1xuICB9LCB7XG4gICAgbmFtZTogJ2FsbCBlbWFpbHMnLFxuICAgIHZhbHVlOiAnYWxsRW1haWxzJ1xuICB9XTtcbiAgJHNjb3BlLmRvd25sb2FkQnV0dG9uVmlzaWJsZSA9IGZhbHNlO1xuICAkc2NvcGUudHJhY2sgPSB7XG4gICAgdHJhY2tVcmw6ICcnLFxuICAgIGRvd25sb2FkVXJsOiAnJyxcbiAgICBlbWFpbDogJydcbiAgfTtcbiAgJHNjb3BlLmJhciA9IHtcbiAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgdmFsdWU6IDAsXG4gICAgdmlzaWJsZTogZmFsc2VcbiAgfTtcbiAgJHNjb3BlLnBhaWRSZXBvc3QgPSB7XG4gICAgc291bmRDbG91ZFVybDogJydcbiAgfTtcblxuICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgJGh0dHAuZ2V0KCcvYXBpL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4nO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIGFsZXJ0KCdXcm9uZyBQYXNzd29yZCcpO1xuICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLnNhdmVBZGRVc2VyID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRzY29wZS5hZGRVc2VyLnBhc3N3b3JkID0gJHJvb3RTY29wZS5wYXNzd29yZDtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL2FkZHVzZXInLCAkc2NvcGUuYWRkVXNlcilcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICBhbGVydChcIlN1Y2Nlc3M6IERhdGFiYXNlIGlzIGJlaW5nIHBvcHVsYXRlZC4gWW91IHdpbGwgYmUgZW1haWxlZCB3aGVuIGl0IGlzIGNvbXBsZXRlLlwiKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgJHNjb3BlLmJhci52aXNpYmxlID0gdHJ1ZTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGFsZXJ0KCdCYWQgc3VibWlzc2lvbicpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUuY3JlYXRlVXNlclF1ZXJ5RG9jID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHF1ZXJ5ID0ge307XG4gICAgaWYgKCRzY29wZS5xdWVyeS5hcnRpc3QgPT0gXCJhcnRpc3RzXCIpIHtcbiAgICAgIHF1ZXJ5LmFydGlzdCA9IHRydWU7XG4gICAgfSBlbHNlIGlmICgkc2NvcGUucXVlcnkuYXJ0aXN0ID09IFwibm9uLWFydGlzdHNcIikge1xuICAgICAgcXVlcnkuYXJ0aXN0ID0gZmFsc2U7XG4gICAgfVxuICAgIHZhciBmbHdyUXJ5ID0ge307XG4gICAgaWYgKCRzY29wZS5xdWVyeS5mb2xsb3dlcnNHVCkge1xuICAgICAgZmx3clFyeS4kZ3QgPSAkc2NvcGUucXVlcnkuZm9sbG93ZXJzR1Q7XG4gICAgICBxdWVyeS5mb2xsb3dlcnMgPSBmbHdyUXJ5O1xuICAgIH1cbiAgICBpZiAoJHNjb3BlLnF1ZXJ5LmZvbGxvd2Vyc0xUKSB7XG4gICAgICBmbHdyUXJ5LiRsdCA9ICRzY29wZS5xdWVyeS5mb2xsb3dlcnNMVDtcbiAgICAgIHF1ZXJ5LmZvbGxvd2VycyA9IGZsd3JRcnk7XG4gICAgfVxuICAgIGlmICgkc2NvcGUucXVlcnkuZ2VucmUpIHF1ZXJ5LmdlbnJlID0gJHNjb3BlLnF1ZXJ5LmdlbnJlO1xuICAgIGlmICgkc2NvcGUucXVlcnlDb2xzKSB7XG4gICAgICBxdWVyeS5jb2x1bW5zID0gJHNjb3BlLnF1ZXJ5Q29scy5maWx0ZXIoZnVuY3Rpb24oZWxtKSB7XG4gICAgICAgIHJldHVybiBlbG0udmFsdWUgIT09IG51bGw7XG4gICAgICB9KS5tYXAoZnVuY3Rpb24oZWxtKSB7XG4gICAgICAgIHJldHVybiBlbG0udmFsdWU7XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKCRzY29wZS5xdWVyeS50cmFja2VkVXNlcnNVUkwpIHF1ZXJ5LnRyYWNrZWRVc2Vyc1VSTCA9ICRzY29wZS5xdWVyeS50cmFja2VkVXNlcnNVUkw7XG4gICAgdmFyIGJvZHkgPSB7XG4gICAgICBxdWVyeTogcXVlcnksXG4gICAgICBwYXNzd29yZDogJHJvb3RTY29wZS5wYXNzd29yZFxuICAgIH07XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvZm9sbG93ZXJzJywgYm9keSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUuZmlsZW5hbWUgPSByZXMuZGF0YTtcbiAgICAgICAgJHNjb3BlLmRvd25sb2FkQnV0dG9uVmlzaWJsZSA9IHRydWU7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGFsZXJ0KFwiRVJST1I6IEJhZCBRdWVyeSBvciBObyBNYXRjaGVzXCIpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUuY3JlYXRlVHJkVXNyUXVlcnlEb2MgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcXVlcnkgPSB7fTtcbiAgICB2YXIgZmx3clFyeSA9IHt9O1xuICAgIGlmICgkc2NvcGUudHJkVXNyUXVlcnkuZm9sbG93ZXJzR1QpIHtcbiAgICAgIGZsd3JRcnkuJGd0ID0gJHNjb3BlLnRyZFVzclF1ZXJ5LmZvbGxvd2Vyc0dUO1xuICAgICAgcXVlcnkuZm9sbG93ZXJzID0gZmx3clFyeTtcbiAgICB9XG4gICAgaWYgKCRzY29wZS50cmRVc3JRdWVyeS5mb2xsb3dlcnNMVCkge1xuICAgICAgZmx3clFyeS4kbHQgPSAkc2NvcGUudHJkVXNyUXVlcnkuZm9sbG93ZXJzTFQ7XG4gICAgICBxdWVyeS5mb2xsb3dlcnMgPSBmbHdyUXJ5O1xuICAgIH1cbiAgICBpZiAoJHNjb3BlLnRyZFVzclF1ZXJ5LmdlbnJlKSBxdWVyeS5nZW5yZSA9ICRzY29wZS50cmRVc3JRdWVyeS5nZW5yZTtcbiAgICB2YXIgYm9keSA9IHtcbiAgICAgIHF1ZXJ5OiBxdWVyeSxcbiAgICAgIHBhc3N3b3JkOiAkcm9vdFNjb3BlLnBhc3N3b3JkXG4gICAgfTtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS90cmFja2VkVXNlcnMnLCBib2R5KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS50cmRVc3JGaWxlbmFtZSA9IHJlcy5kYXRhO1xuICAgICAgICAkc2NvcGUuZG93bmxvYWRUcmRVc3JCdXR0b25WaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgYWxlcnQoXCJFUlJPUjogQmFkIFF1ZXJ5IG9yIE5vIE1hdGNoZXNcIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5kb3dubG9hZCA9IGZ1bmN0aW9uKGZpbGVuYW1lKSB7XG4gICAgdmFyIGFuY2hvciA9IGFuZ3VsYXIuZWxlbWVudCgnPGEvPicpO1xuICAgIGFuY2hvci5hdHRyKHtcbiAgICAgIGhyZWY6IGZpbGVuYW1lLFxuICAgICAgZG93bmxvYWQ6IGZpbGVuYW1lXG4gICAgfSlbMF0uY2xpY2soKTtcbiAgICAkc2NvcGUuZG93bmxvYWRCdXR0b25WaXNpYmxlID0gZmFsc2U7XG4gICAgJHNjb3BlLmRvd25sb2FkVHJkVXNyQnV0dG9uVmlzaWJsZSA9IGZhbHNlO1xuICB9XG5cbiAgJHNjb3BlLmRvd25sb2FkVXJsQ2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCRzY29wZS50cmFjay50cmFja1VybCAhPT0gJycpIHtcblxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgJGh0dHAucG9zdCgnL2FwaS9zb3VuZGNsb3VkL3Jlc29sdmUnLCB7XG4gICAgICAgICAgdXJsOiAkc2NvcGUudHJhY2sudHJhY2tVcmxcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrSUQgPSByZXMuZGF0YS5pZDtcbiAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0SUQgPSByZXMuZGF0YS51c2VyX2lkO1xuICAgICAgICAgICRzY29wZS50cmFjay5hcnR3b3JrVVJMID0gcmVzLmRhdGEuYXJ0d29ya191cmw7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfSkudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tJRCA9IG51bGw7XG4gICAgICAgICAgJHNjb3BlLm5vdEZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAkc2NvcGUuc2F2ZURvd25sb2FkVXJsID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCEkc2NvcGUudHJhY2sudHJhY2tJRCkge1xuICAgICAgYWxlcnQoJ1RyYWNrIE5vdCBGb3VuZCcpO1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS9kb3dubG9hZHVybCcsICRzY29wZS50cmFjaylcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUudHJhY2sgPSB7XG4gICAgICAgICAgdHJhY2tVcmw6ICcnLFxuICAgICAgICAgIGRvd25sb2FkVXJsOiAnJyxcbiAgICAgICAgICBlbWFpbDogJydcbiAgICAgICAgfTtcbiAgICAgICAgYWxlcnQoXCJTVUNDRVNTOiBVcmwgc2F2ZWQgc3VjY2Vzc2Z1bGx5XCIpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBhbGVydChcIkVSUk9SOiBFcnJvciBpbiBzYXZpbmcgdXJsXCIpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUuc2F2ZVBhaWRSZXBvc3RDaGFubmVsID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvcGFpZHJlcG9zdCcsICRzY29wZS5wYWlkUmVwb3N0KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS5wYWlkUmVwb3N0ID0ge1xuICAgICAgICAgIHNvdW5kQ2xvdWRVcmw6ICcnXG4gICAgICAgIH07XG4gICAgICAgIGFsZXJ0KFwiU1VDQ0VTUzogVXJsIHNhdmVkIHN1Y2Nlc3NmdWxseVwiKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgYWxlcnQoXCJFUlJPUjogRXJyb3IgaW4gc2F2aW5nIHVybFwiKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9XG5cblxuICAvKiBMaXN0ZW4gdG8gc29ja2V0IGV2ZW50cyAqL1xuXG4gIHNvY2tldC5vbignbm90aWZpY2F0aW9uJywgZnVuY3Rpb24oZGF0YSkge1xuICAgIHZhciBwZXJjZW50YWdlID0gcGFyc2VJbnQoTWF0aC5mbG9vcihkYXRhLmNvdW50ZXIgLyBkYXRhLnRvdGFsICogMTAwKSwgMTApO1xuICAgICRzY29wZS5iYXIudmFsdWUgPSBwZXJjZW50YWdlO1xuICAgIGlmIChwZXJjZW50YWdlID09PSAxMDApIHtcbiAgICAgICRzY29wZS5zdGF0dXNCYXJWaXNpYmxlID0gZmFsc2U7XG4gICAgICAkc2NvcGUuYmFyLnZhbHVlID0gMDtcbiAgICB9XG4gIH0pO1xufSk7IiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIC8vIEhvcGUgeW91IGRpZG4ndCBmb3JnZXQgQW5ndWxhciEgRHVoLWRveS5cbiAgICBpZiAoIXdpbmRvdy5hbmd1bGFyKSB0aHJvdyBuZXcgRXJyb3IoJ0kgY2FuXFwndCBmaW5kIEFuZ3VsYXIhJyk7XG5cbiAgICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2ZzYVByZUJ1aWx0JywgW10pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ2luaXRTb2NrZXQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF3aW5kb3cuaW8pIHRocm93IG5ldyBFcnJvcignc29ja2V0LmlvIG5vdCBmb3VuZCEnKTtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5pbyh3aW5kb3cubG9jYXRpb24ub3JpZ2luKTtcbiAgICB9KTtcblxuICAgIGFwcC5mYWN0b3J5KCdzb2NrZXQnLCBmdW5jdGlvbigkcm9vdFNjb3BlLCBpbml0U29ja2V0KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBvbjogZnVuY3Rpb24oZXZlbnROYW1lLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGluaXRTb2NrZXQub24oZXZlbnROYW1lLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkoaW5pdFNvY2tldCwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVtaXQ6IGZ1bmN0aW9uKGV2ZW50TmFtZSwgZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBpbml0U29ja2V0LmVtaXQoZXZlbnROYW1lLCBkYXRhLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkoaW5pdFNvY2tldCwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICAvLyBBVVRIX0VWRU5UUyBpcyB1c2VkIHRocm91Z2hvdXQgb3VyIGFwcCB0b1xuICAgIC8vIGJyb2FkY2FzdCBhbmQgbGlzdGVuIGZyb20gYW5kIHRvIHRoZSAkcm9vdFNjb3BlXG4gICAgLy8gZm9yIGltcG9ydGFudCBldmVudHMgYWJvdXQgYXV0aGVudGljYXRpb24gZmxvdy5cbiAgICBhcHAuY29uc3RhbnQoJ0FVVEhfRVZFTlRTJywge1xuICAgICAgICBsb2dpblN1Y2Nlc3M6ICdhdXRoLWxvZ2luLXN1Y2Nlc3MnLFxuICAgICAgICBsb2dpbkZhaWxlZDogJ2F1dGgtbG9naW4tZmFpbGVkJyxcbiAgICAgICAgbG9nb3V0U3VjY2VzczogJ2F1dGgtbG9nb3V0LXN1Y2Nlc3MnLFxuICAgICAgICBzZXNzaW9uVGltZW91dDogJ2F1dGgtc2Vzc2lvbi10aW1lb3V0JyxcbiAgICAgICAgbm90QXV0aGVudGljYXRlZDogJ2F1dGgtbm90LWF1dGhlbnRpY2F0ZWQnLFxuICAgICAgICBub3RBdXRob3JpemVkOiAnYXV0aC1ub3QtYXV0aG9yaXplZCdcbiAgICB9KTtcblxuICAgIGFwcC5mYWN0b3J5KCdBdXRoSW50ZXJjZXB0b3InLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkcSwgQVVUSF9FVkVOVFMpIHtcbiAgICAgICAgdmFyIHN0YXR1c0RpY3QgPSB7XG4gICAgICAgICAgICA0MDE6IEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsXG4gICAgICAgICAgICA0MDM6IEFVVEhfRVZFTlRTLm5vdEF1dGhvcml6ZWQsXG4gICAgICAgICAgICA0MTk6IEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LFxuICAgICAgICAgICAgNDQwOiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dFxuICAgICAgICB9O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzcG9uc2VFcnJvcjogZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3Qoc3RhdHVzRGljdFtyZXNwb25zZS5zdGF0dXNdLCByZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdChyZXNwb25zZSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIGFwcC5jb25maWcoZnVuY3Rpb24oJGh0dHBQcm92aWRlcikge1xuICAgICAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKFtcbiAgICAgICAgICAgICckaW5qZWN0b3InLFxuICAgICAgICAgICAgZnVuY3Rpb24oJGluamVjdG9yKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRpbmplY3Rvci5nZXQoJ0F1dGhJbnRlcmNlcHRvcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICBdKTtcbiAgICB9KTtcblxuICAgIGFwcC5zZXJ2aWNlKCdBdXRoU2VydmljZScsIGZ1bmN0aW9uKCRodHRwLCBTZXNzaW9uLCAkcm9vdFNjb3BlLCBBVVRIX0VWRU5UUywgJHEpIHtcblxuICAgICAgICBmdW5jdGlvbiBvblN1Y2Nlc3NmdWxMb2dpbihyZXNwb25zZSkge1xuICAgICAgICAgICAgdmFyIGRhdGEgPSByZXNwb25zZS5kYXRhO1xuICAgICAgICAgICAgU2Vzc2lvbi5jcmVhdGUoZGF0YS5pZCwgZGF0YS51c2VyKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MpO1xuICAgICAgICAgICAgcmV0dXJuIGRhdGEudXNlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVzZXMgdGhlIHNlc3Npb24gZmFjdG9yeSB0byBzZWUgaWYgYW5cbiAgICAgICAgLy8gYXV0aGVudGljYXRlZCB1c2VyIGlzIGN1cnJlbnRseSByZWdpc3RlcmVkLlxuICAgICAgICB0aGlzLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgcmV0dXJuICEhU2Vzc2lvbi51c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0TG9nZ2VkSW5Vc2VyID0gZnVuY3Rpb24oZnJvbVNlcnZlcikge1xuXG4gICAgICAgICAgICAvLyBJZiBhbiBhdXRoZW50aWNhdGVkIHNlc3Npb24gZXhpc3RzLCB3ZVxuICAgICAgICAgICAgLy8gcmV0dXJuIHRoZSB1c2VyIGF0dGFjaGVkIHRvIHRoYXQgc2Vzc2lvblxuICAgICAgICAgICAgLy8gd2l0aCBhIHByb21pc2UuIFRoaXMgZW5zdXJlcyB0aGF0IHdlIGNhblxuICAgICAgICAgICAgLy8gYWx3YXlzIGludGVyZmFjZSB3aXRoIHRoaXMgbWV0aG9kIGFzeW5jaHJvbm91c2x5LlxuXG4gICAgICAgICAgICAvLyBPcHRpb25hbGx5LCBpZiB0cnVlIGlzIGdpdmVuIGFzIHRoZSBmcm9tU2VydmVyIHBhcmFtZXRlcixcbiAgICAgICAgICAgIC8vIHRoZW4gdGhpcyBjYWNoZWQgdmFsdWUgd2lsbCBub3QgYmUgdXNlZC5cblxuICAgICAgICAgICAgaWYgKHRoaXMuaXNBdXRoZW50aWNhdGVkKCkgJiYgZnJvbVNlcnZlciAhPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAkcS53aGVuKFNlc3Npb24udXNlcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIE1ha2UgcmVxdWVzdCBHRVQgL3Nlc3Npb24uXG4gICAgICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgdXNlciwgY2FsbCBvblN1Y2Nlc3NmdWxMb2dpbiB3aXRoIHRoZSByZXNwb25zZS5cbiAgICAgICAgICAgIC8vIElmIGl0IHJldHVybnMgYSA0MDEgcmVzcG9uc2UsIHdlIGNhdGNoIGl0IGFuZCBpbnN0ZWFkIHJlc29sdmUgdG8gbnVsbC5cbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9zZXNzaW9uJykudGhlbihvblN1Y2Nlc3NmdWxMb2dpbikuY2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9naW4gPSBmdW5jdGlvbihjcmVkZW50aWFscykge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9sb2dpbicsIGNyZWRlbnRpYWxzKVxuICAgICAgICAgICAgICAgIC50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnSW52YWxpZCBsb2dpbiBjcmVkZW50aWFscy4nXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvbG9nb3V0JykudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBTZXNzaW9uLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoQVVUSF9FVkVOVFMubG9nb3V0U3VjY2Vzcyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIGFwcC5zZXJ2aWNlKCdTZXNzaW9uJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMpIHtcblxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubm90QXV0aGVudGljYXRlZCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5kZXN0cm95KCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuaWQgPSBudWxsO1xuICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlID0gZnVuY3Rpb24oc2Vzc2lvbklkLCB1c2VyKSB7XG4gICAgICAgICAgICB0aGlzLmlkID0gc2Vzc2lvbklkO1xuICAgICAgICAgICAgdGhpcy51c2VyID0gdXNlcjtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcbiAgICAgICAgfTtcblxuICAgIH0pO1xuXG59KSgpOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2FkbWluJywge1xuICAgIHVybDogJy9hZG1pbicsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9sb2dpbi9sb2dpbi5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnQWRtaW5Mb2dpbkNvbnRyb2xsZXInXG4gIH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ0FkbWluTG9naW5Db250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCBBdXRoU2VydmljZSwgb0VtYmVkRmFjdG9yeSkge1xuICAkc2NvcGUuY291bnRlciA9IDA7XG4gICRzY29wZS5zaG93aW5nRWxlbWVudHMgPSBbXTtcbiAgJHNjb3BlLnN1Ym1pc3Npb25zID0gW107XG5cbiAgJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLnBvc3QoJy9hcGkvbG9naW4nLCB7XG4gICAgICBwYXNzd29yZDogJHNjb3BlLnBhc3N3b3JkXG4gICAgfSkudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICRyb290U2NvcGUucGFzc3dvcmQgPSAkc2NvcGUucGFzc3dvcmQ7XG4gICAgICAkc2NvcGUuc2hvd1N1Ym1pc3Npb25zID0gdHJ1ZTtcbiAgICAgICRzY29wZS5sb2FkU3VibWlzc2lvbnMoKTtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgYWxlcnQoJ1dyb25nIFBhc3N3b3JkJyk7XG4gICAgfSk7XG4gIH1cblxuICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgJGh0dHAuZ2V0KCcvYXBpL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4nO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIGFsZXJ0KCdXcm9uZyBQYXNzd29yZCcpO1xuICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLm1hbmFnZSA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5nZXQoJy9hcGkvc291bmRjbG91ZC9zb3VuZGNsb3VkQ29uZmlnJylcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICBTQy5pbml0aWFsaXplKHtcbiAgICAgICAgICBjbGllbnRfaWQ6IHJlcy5kYXRhLmNsaWVudElELFxuICAgICAgICAgIHJlZGlyZWN0X3VyaTogcmVzLmRhdGEuY2FsbGJhY2tVUkwsXG4gICAgICAgICAgc2NvcGU6IFwibm9uLWV4cGlyaW5nXCJcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBTQy5jb25uZWN0KCk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRyb290U2NvcGUuYWNjZXNzVG9rZW4gPSByZXMub2F1dGhfdG9rZW47XG4gICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2xvZ2luL2F1dGhlbnRpY2F0ZWQnLCB7XG4gICAgICAgICAgdG9rZW46IHJlcy5vYXV0aF90b2tlbixcbiAgICAgICAgICBwYXNzd29yZDogJHJvb3RTY29wZS5wYXNzd29yZCxcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgJHJvb3RTY29wZS5zY2hlZHVsZXJJbmZvID0gcmVzLmRhdGE7XG4gICAgICAgICRyb290U2NvcGUuc2NoZWR1bGVySW5mby5ldmVudHMuZm9yRWFjaChmdW5jdGlvbihldikge1xuICAgICAgICAgIGV2LmRheSA9IG5ldyBEYXRlKGV2LmRheSk7XG4gICAgICAgIH0pO1xuICAgICAgICAkc3RhdGUuZ28oJ3NjaGVkdWxlcicpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBhbGVydCgnRXJyb3I6IENvdWxkIG5vdCBsb2cgaW4nKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmxvYWRTdWJtaXNzaW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5nZXQoJy9hcGkvc3VibWlzc2lvbnMvdW5hY2NlcHRlZCcpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHNjb3BlLnN1Ym1pc3Npb25zID0gcmVzLmRhdGE7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlcy5kYXRhKTtcbiAgICAgICAgJHNjb3BlLmxvYWRNb3JlKCk7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvY2hhbm5lbHMnKTtcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHNjb3BlLmNoYW5uZWxzID0gcmVzLmRhdGE7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIGFsZXJ0KCdFcnJvcjogQ291bGQgbm90IGdldCBjaGFubmVscy4nKVxuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUubG9hZE1vcmUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbG9hZEVsZW1lbnRzID0gW107XG4gICAgZm9yIChsZXQgaSA9ICRzY29wZS5jb3VudGVyOyBpIDwgJHNjb3BlLmNvdW50ZXIgKyAxNTsgaSsrKSB7XG4gICAgICB2YXIgc3ViID0gJHNjb3BlLnN1Ym1pc3Npb25zW2ldO1xuICAgICAgJHNjb3BlLnNob3dpbmdFbGVtZW50cy5wdXNoKHN1Yik7XG4gICAgICBsb2FkRWxlbWVudHMucHVzaChzdWIpO1xuICAgIH1cbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgY29uc29sZS5sb2cobG9hZEVsZW1lbnRzKTtcbiAgICAgIGxvYWRFbGVtZW50cy5mb3JFYWNoKGZ1bmN0aW9uKHN1Yikge1xuICAgICAgICBvRW1iZWRGYWN0b3J5LmVtYmVkU29uZyhzdWIpO1xuICAgICAgfSwgNTApXG4gICAgfSk7XG4gICAgJHNjb3BlLmNvdW50ZXIgKz0gMTU7XG4gIH1cblxuICAkc2NvcGUuY2hhbmdlQm94ID0gZnVuY3Rpb24oc3ViLCBjaGFuKSB7XG4gICAgdmFyIGluZGV4ID0gc3ViLmNoYW5uZWxJRFMuaW5kZXhPZihjaGFuLmNoYW5uZWxJRCk7XG4gICAgaWYgKGluZGV4ID09IC0xKSB7XG4gICAgICBzdWIuY2hhbm5lbElEUy5wdXNoKGNoYW4uY2hhbm5lbElEKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3ViLmNoYW5uZWxJRFMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gIH1cblxuICAkc2NvcGUuc2F2ZSA9IGZ1bmN0aW9uKHN1Ym1pKSB7XG4gICAgaWYgKHN1Ym1pLmNoYW5uZWxJRFMubGVuZ3RoID09IDApIHtcbiAgICAgICRzY29wZS5kZWNsaW5lKHN1Ym1pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3VibWkucGFzc3dvcmQgPSAkcm9vdFNjb3BlLnBhc3N3b3JkO1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgJGh0dHAucHV0KFwiL2FwaS9zdWJtaXNzaW9ucy9zYXZlXCIsIHN1Ym1pKVxuICAgICAgICAudGhlbihmdW5jdGlvbihzdWIpIHtcbiAgICAgICAgICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLnNwbGljZSgkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLmluZGV4T2Yoc3VibWkpLCAxKTtcbiAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJTYXZlZFwiKTtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgIHdpbmRvdy5hbGVydChcIkVSUk9SOiBkaWQgbm90IFNhdmVcIilcbiAgICAgICAgfSlcbiAgICB9XG4gIH1cblxuICAkc2NvcGUuaWdub3JlID0gZnVuY3Rpb24oc3VibWlzc2lvbikge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5kZWxldGUoJy9hcGkvc3VibWlzc2lvbnMvaWdub3JlLycgKyBzdWJtaXNzaW9uLl9pZCArICcvJyArICRyb290U2NvcGUucGFzc3dvcmQpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gJHNjb3BlLnNob3dpbmdFbGVtZW50cy5pbmRleE9mKHN1Ym1pc3Npb24pO1xuICAgICAgICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHdpbmRvdy5hbGVydChcIklnbm9yZWRcIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIHdpbmRvdy5hbGVydChcIkVSUk9SOiBkaWQgbm90IElnbm9yZVwiKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmRlY2xpbmUgPSBmdW5jdGlvbihzdWJtaXNzaW9uKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLmRlbGV0ZSgnL2FwaS9zdWJtaXNzaW9ucy9kZWNsaW5lLycgKyBzdWJtaXNzaW9uLl9pZCArICcvJyArICRyb290U2NvcGUucGFzc3dvcmQpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gJHNjb3BlLnNob3dpbmdFbGVtZW50cy5pbmRleE9mKHN1Ym1pc3Npb24pO1xuICAgICAgICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHdpbmRvdy5hbGVydChcIkRlY2xpbmVkXCIpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlXG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIHdpbmRvdy5hbGVydChcIkVSUk9SOiBkaWQgbm90IERlY2xpbmVcIik7XG4gICAgICB9KTtcbiAgfVxufSk7IiwiYXBwLmZhY3RvcnkoJ29FbWJlZEZhY3RvcnknLCBmdW5jdGlvbigpe1xuXHRyZXR1cm4ge1xuXHRcdGVtYmVkU29uZzogZnVuY3Rpb24oc3ViKSB7XG5cdCAgICAgICAgcmV0dXJuIFNDLm9FbWJlZChcImh0dHA6Ly9hcGkuc291bmRjbG91ZC5jb20vdHJhY2tzL1wiICsgc3ViLnRyYWNrSUQsIHtcblx0ICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHN1Yi50cmFja0lEICsgXCJwbGF5ZXJcIiksXG5cdCAgICAgICAgICBhdXRvX3BsYXk6IGZhbHNlLFxuXHQgICAgICAgICAgbWF4aGVpZ2h0OiAxNTBcblx0ICAgICAgICB9KTtcblx0XHR9XG5cdH07XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdzY2hlZHVsZXInLCB7XG4gICAgdXJsOiAnL3NjaGVkdWxlcicsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9zY2hlZHVsZXIvc2NoZWR1bGVyLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdTY2hlZHVsZXJDb250cm9sbGVyJ1xuICB9KTtcbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdTY2hlZHVsZXJDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCBBdXRoU2VydmljZSkge1xuXG4gICRzY29wZS5tYWtlRXZlbnRVUkwgPSBcIlwiO1xuICAkc2NvcGUuc2hvd092ZXJsYXkgPSBmYWxzZTtcbiAgdmFyIGluZm8gPSAkcm9vdFNjb3BlLnNjaGVkdWxlckluZm87XG4gIGlmICghaW5mbykge1xuICAgICRzdGF0ZS5nbygnYWRtaW4nKTtcbiAgfVxuICAkc2NvcGUuY2hhbm5lbCA9IGluZm8uY2hhbm5lbDtcbiAgJHNjb3BlLnN1Ym1pc3Npb25zID0gaW5mby5zdWJtaXNzaW9ucztcblxuICAkc2NvcGUuY2FsZW5kYXIgPSBmaWxsRGF0ZUFycmF5cyhpbmZvLmV2ZW50cyk7XG4gICRzY29wZS5kYXlJbmNyID0gMDtcblxuICAkc2NvcGUuYmFjayA9IGZ1bmN0aW9uKCkge1xuICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcblxuICB9XG5cbiAgJHNjb3BlLnNhdmVDaGFubmVsID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRzY29wZS5jaGFubmVsLnBhc3N3b3JkID0gJHJvb3RTY29wZS5wYXNzd29yZDtcbiAgICAkaHR0cC5wdXQoXCIvYXBpL2NoYW5uZWxzXCIsICRzY29wZS5jaGFubmVsKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIHdpbmRvdy5hbGVydChcIlNhdmVkXCIpO1xuICAgICAgICAkc2NvcGUuY2hhbm5lbCA9IHJlcy5kYXRhO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICB3aW5kb3cuYWxlcnQoXCJFcnJvcjogZGlkIG5vdCBzYXZlXCIpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUuaW5jckRheSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc2NvcGUuZGF5SW5jciA8IDE0KSAkc2NvcGUuZGF5SW5jcisrO1xuICB9XG5cbiAgJHNjb3BlLmRlY3JEYXkgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLmRheUluY3IgPiAwKSAkc2NvcGUuZGF5SW5jci0tO1xuICB9XG5cbiAgJHNjb3BlLmNsaWNrZWRTbG90ID0gZnVuY3Rpb24oZGF5LCBob3VyKSB7XG4gICAgdmFyIHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgICBpZiAodG9kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpICYmIHRvZGF5LmdldEhvdXJzKCkgPiBob3VyKSByZXR1cm47XG4gICAgJHNjb3BlLnNob3dPdmVybGF5ID0gdHJ1ZTtcbiAgICB2YXIgY2FsRGF5ID0ge307XG4gICAgdmFyIGNhbGVuZGFyRGF5ID0gJHNjb3BlLmNhbGVuZGFyLmZpbmQoZnVuY3Rpb24oY2FsRCkge1xuICAgICAgcmV0dXJuIGNhbEQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09IGRheS50b0xvY2FsZURhdGVTdHJpbmcoKTtcbiAgICB9KTtcbiAgICAkc2NvcGUubWFrZUV2ZW50VVJMID0gdW5kZWZpbmVkO1xuICAgICRzY29wZS5tYWtlRXZlbnQgPSBjYWxlbmRhckRheS5ldmVudHNbaG91cl07XG4gICAgaWYgKCRzY29wZS5tYWtlRXZlbnQgPT0gXCItXCIpIHtcbiAgICAgIHZhciBtYWtlRGF5ID0gbmV3IERhdGUoZGF5KTtcbiAgICAgIG1ha2VEYXkuc2V0SG91cnMoaG91cik7XG4gICAgICAkc2NvcGUubWFrZUV2ZW50ID0ge1xuICAgICAgICBjaGFubmVsSUQ6ICRzY29wZS5jaGFubmVsLmNoYW5uZWxJRCxcbiAgICAgICAgZGF5OiBtYWtlRGF5LFxuICAgICAgICBwYWlkOiBmYWxzZVxuICAgICAgfTtcbiAgICAgICRzY29wZS5uZXdFdmVudCA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICRzY29wZS5tYWtlRXZlbnRVUkwgPSAnaHR0cHM6Ly9hcGkuc291bmRjbG91ZC5jb20vdHJhY2tzLycgKyAkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQ7XG4gICAgICBTQy5vRW1iZWQoJ2h0dHBzOi8vYXBpLnNvdW5kY2xvdWQuY29tL3RyYWNrcy8nICsgJHNjb3BlLm1ha2VFdmVudC50cmFja0lELCB7XG4gICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLFxuICAgICAgICBhdXRvX3BsYXk6IGZhbHNlLFxuICAgICAgICBtYXhoZWlnaHQ6IDE1MFxuICAgICAgfSk7XG4gICAgICAkc2NvcGUubmV3RXZlbnQgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAkc2NvcGUuY2hhbmdlUGFpZCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCA9IHVuZGVmaW5lZDtcbiAgICAkc2NvcGUubWFrZUV2ZW50VVJMID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgJHNjb3BlLmNoYW5nZVVSTCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIHtcbiAgICAgICAgdXJsOiAkc2NvcGUubWFrZUV2ZW50VVJMXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCA9IHJlcy5kYXRhLmlkO1xuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnRpdGxlID0gcmVzLmRhdGEudGl0bGU7XG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQudHJhY2tVUkwgPSByZXMuZGF0YS50cmFja1VSTDtcbiAgICAgICAgU0Mub0VtYmVkKCRzY29wZS5tYWtlRXZlbnRVUkwsIHtcbiAgICAgICAgICBlbGVtZW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKSxcbiAgICAgICAgICBhdXRvX3BsYXk6IGZhbHNlLFxuICAgICAgICAgIG1heGhlaWdodDogMTUwXG4gICAgICAgIH0pXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcbiAgICAgICAgJHNjb3BlLm5vdEZvdW5kID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KS50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgICAgJHNjb3BlLm5vdEZvdW5kID0gdHJ1ZTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmRlbGV0ZUV2ZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCEkc2NvcGUubmV3RXZlbnQpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICRodHRwLmRlbGV0ZSgnL2FwaS9ldmVudHMvJyArICRzY29wZS5tYWtlRXZlbnQuX2lkICsgJy8nICsgJHJvb3RTY29wZS5wYXNzd29yZClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdmFyIGNhbGVuZGFyRGF5ID0gJHNjb3BlLmNhbGVuZGFyLmZpbmQoZnVuY3Rpb24oY2FsRCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbEQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09ICRzY29wZS5tYWtlRXZlbnQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNhbGVuZGFyRGF5LmV2ZW50c1skc2NvcGUubWFrZUV2ZW50LmRheS5nZXRIb3VycygpXSA9IFwiLVwiO1xuICAgICAgICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgd2luZG93LmFsZXJ0KFwiRGVsZXRlZFwiKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJFUlJPUjogZGlkIG5vdCBEZWxldGUuXCIpXG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgY2FsZW5kYXJEYXkgPSAkc2NvcGUuY2FsZW5kYXIuZmluZChmdW5jdGlvbihjYWxEKSB7XG4gICAgICAgIHJldHVybiBjYWxELmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSAkc2NvcGUubWFrZUV2ZW50LmRheS50b0xvY2FsZURhdGVTdHJpbmcoKTtcbiAgICAgIH0pO1xuICAgICAgY2FsZW5kYXJEYXkuZXZlbnRzWyRzY29wZS5tYWtlRXZlbnQuZ2V0SG91cnMoKV0gPSBcIi1cIjtcbiAgICAgIHZhciBldmVudHNcbiAgICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gICRzY29wZS5zYXZlRXZlbnQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoISRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCAmJiAhJHNjb3BlLm1ha2VFdmVudC5wYWlkKSB7XG4gICAgICB3aW5kb3cuYWxlcnQoXCJFbnRlciBhIHRyYWNrIFVSTFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCRzY29wZS5uZXdFdmVudCkge1xuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnBhc3N3b3JkID0gJHJvb3RTY29wZS5wYXNzd29yZDtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgICAkaHR0cC5wb3N0KCcvYXBpL2V2ZW50cycsICRzY29wZS5tYWtlRXZlbnQpXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB2YXIgZXZlbnQgPSByZXMuZGF0YTtcbiAgICAgICAgICAgIGV2ZW50LmRheSA9IG5ldyBEYXRlKGV2ZW50LmRheSk7XG4gICAgICAgICAgICB2YXIgY2FsZW5kYXJEYXkgPSAkc2NvcGUuY2FsZW5kYXIuZmluZChmdW5jdGlvbihjYWxEKSB7XG4gICAgICAgICAgICAgIHJldHVybiBjYWxELmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSBldmVudC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNhbGVuZGFyRGF5LmV2ZW50c1tldmVudC5kYXkuZ2V0SG91cnMoKV0gPSBldmVudDtcbiAgICAgICAgICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHdpbmRvdy5hbGVydChcIlNhdmVkXCIpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgd2luZG93LmFsZXJ0KFwiRVJST1I6IGRpZCBub3QgU2F2ZS5cIik7XG4gICAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkc2NvcGUubmV3RXZlbnQucGFzc3dvcmQgPSAkcm9vdFNjb3BlLnBhc3N3b3JkO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAgICRodHRwLnB1dCgnL2FwaS9ldmVudHMnLCAkc2NvcGUubWFrZUV2ZW50KVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdmFyIGV2ZW50ID0gcmVzLmRhdGE7XG4gICAgICAgICAgICBldmVudC5kYXkgPSBuZXcgRGF0ZShldmVudC5kYXkpO1xuICAgICAgICAgICAgdmFyIGNhbGVuZGFyRGF5ID0gJHNjb3BlLmNhbGVuZGFyLmZpbmQoZnVuY3Rpb24oY2FsRCkge1xuICAgICAgICAgICAgICByZXR1cm4gY2FsRC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gZXZlbnQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjYWxlbmRhckRheS5ldmVudHNbZXZlbnQuZ2V0SG91cnMoKV0gPSBldmVudDtcbiAgICAgICAgICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHdpbmRvdy5hbGVydChcIlNhdmVkXCIpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgd2luZG93LmFsZXJ0KFwiRVJST1I6IGRpZCBub3QgU2F2ZS5cIik7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLmJhY2tFdmVudCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5tYWtlRXZlbnQgPSBudWxsO1xuICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICB9XG5cbiAgJHNjb3BlLnJlbW92ZVF1ZXVlU29uZyA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgJHNjb3BlLmNoYW5uZWwucXVldWUuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAkc2NvcGUuc2F2ZUNoYW5uZWwoKTtcbiAgfVxuXG4gICRzY29wZS5hZGRTb25nID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCRzY29wZS5jaGFubmVsLnF1ZXVlLmluZGV4T2YoJHNjb3BlLm5ld1F1ZXVlSUQpICE9IC0xKSByZXR1cm47XG4gICAgJHNjb3BlLmNoYW5uZWwucXVldWUucHVzaCgkc2NvcGUubmV3UXVldWVJRCk7XG4gICAgJHNjb3BlLnNhdmVDaGFubmVsKCk7XG4gICAgJHNjb3BlLm5ld1F1ZXVlU29uZyA9IHVuZGVmaW5lZDtcbiAgICAkc2NvcGUuY2hhbmdlUXVldWVTb25nKCk7XG4gICAgJHNjb3BlLmxvYWRRdWV1ZVNvbmdzKFskc2NvcGUubmV3UXVldWVJRF0pO1xuICB9XG5cbiAgJHNjb3BlLmNoYW5nZVF1ZXVlU29uZyA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5nZXQoJ2FwaS9zb3VuZGNsb3VkL3NvdW5kY2xvdWRDb25maWcnKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIFNDLmluaXRpYWxpemUoe1xuICAgICAgICAgIGNsaWVudF9pZDogcmVzLmRhdGEuY2xpZW50SUQsXG4gICAgICAgICAgcmVkaXJlY3RfdXJpOiByZXMuZGF0YS5jYWxsYmFja1VSTCxcbiAgICAgICAgICBzY29wZTogXCJub24tZXhwaXJpbmdcIlxuICAgICAgICB9KTtcbiAgICAgICAgJHNjb3BlLmNsaWVudElEU3RyaW5nID0gcmVzLmRhdGEuY2xpZW50SUQudG9TdHJpbmcoKTtcbiAgICAgICAgdmFyIGdldFBhdGggPSAnaHR0cDovL2FwaS5zb3VuZGNsb3VkLmNvbS9yZXNvbHZlLmpzb24/dXJsPScgKyAkc2NvcGUubmV3UXVldWVTb25nICsgJyZjbGllbnRfaWQ9JyArICRzY29wZS5jbGllbnRJRFN0cmluZztcbiAgICAgICAgcmV0dXJuICRodHRwLmdldChnZXRQYXRoKVxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB2YXIgdHJhY2sgPSByZXMuZGF0YTtcbiAgICAgICAgLy8gU0Mub0VtYmVkKHRyYWNrLnVyaSwge1xuICAgICAgICAvLyAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXdRdWV1ZVBsYXllcicpLFxuICAgICAgICAvLyAgIGF1dG9fcGxheTogZmFsc2UsXG4gICAgICAgIC8vICAgbWF4aGVpZ2h0OiAxNTBcbiAgICAgICAgLy8gfSk7XG4gICAgICAgICRzY29wZS5uZXdRdWV1ZUlEID0gdHJhY2suaWQ7XG4gICAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5tb3ZlVXAgPSBmdW5jdGlvbihpbmRleCkge1xuICAgIGlmIChpbmRleCA9PSAwKSByZXR1cm47XG4gICAgdmFyIHMgPSAkc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleF07XG4gICAgJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXhdID0gJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXggLSAxXTtcbiAgICAkc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleCAtIDFdID0gcztcbiAgICAkc2NvcGUuc2F2ZUNoYW5uZWwoKTtcbiAgICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MoWyRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4XSwgJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXggLSAxXV0pO1xuICB9XG5cbiAgJHNjb3BlLm1vdmVEb3duID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICBpZiAoaW5kZXggPT0gJHNjb3BlLmNoYW5uZWwucXVldWUubGVuZ3RoIC0gMSkgcmV0dXJuO1xuICAgIHZhciBzID0gJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXhdO1xuICAgICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4XSA9ICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4ICsgMV07XG4gICAgJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXggKyAxXSA9IHM7XG4gICAgJHNjb3BlLnNhdmVDaGFubmVsKCk7XG4gICAgJHNjb3BlLmxvYWRRdWV1ZVNvbmdzKFskc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleF0sICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4ICsgMV1dKTtcbiAgfVxuXG4gIC8vICRzY29wZS5jYW5Mb3dlck9wZW5FdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgLy8gICB2YXIgd2FpdGluZ1N1YnMgPSAkc2NvcGUuc3VibWlzc2lvbnMuZmlsdGVyKGZ1bmN0aW9uKHN1Yikge1xuICAvLyAgICAgcmV0dXJuIHN1Yi5pbnZvaWNlSUQ7XG4gIC8vICAgfSk7XG4gIC8vICAgdmFyIG9wZW5TbG90cyA9IFtdO1xuICAvLyAgICRzY29wZS5jYWxlbmRhci5mb3JFYWNoKGZ1bmN0aW9uKGRheSkge1xuICAvLyAgICAgZGF5LmV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2KSB7XG4gIC8vICAgICAgIGlmIChldi5wYWlkICYmICFldi50cmFja0lEKSBvcGVuU2xvdHMucHVzaChldik7XG4gIC8vICAgICB9KTtcbiAgLy8gICB9KTtcbiAgLy8gICB2YXIgb3Blbk51bSA9IG9wZW5TbG90cy5sZW5ndGggLSB3YWl0aW5nU3Vicy5sZW5ndGg7XG4gIC8vICAgcmV0dXJuIG9wZW5OdW0gPiAwO1xuICAvLyB9XG5cbiAgJHNjb3BlLmxvYWRTdWJtaXNzaW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUuc3VibWlzc2lvbnMuZm9yRWFjaChmdW5jdGlvbihzdWIpIHtcbiAgICAgICAgU0Mub0VtYmVkKFwiaHR0cDovL2FwaS5zb3VuZGNsb3VkLmNvbS90cmFja3MvXCIgKyBzdWIudHJhY2tJRCwge1xuICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHN1Yi50cmFja0lEICsgXCJwbGF5ZXJcIiksXG4gICAgICAgICAgYXV0b19wbGF5OiBmYWxzZSxcbiAgICAgICAgICBtYXhoZWlnaHQ6IDE1MFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sIDUwKTtcbiAgfVxuXG4gICRzY29wZS5sb2FkUXVldWVTb25ncyA9IGZ1bmN0aW9uKHF1ZXVlKSB7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHF1ZXVlLmZvckVhY2goZnVuY3Rpb24oc29uZ0lEKSB7XG4gICAgICAgIFNDLm9FbWJlZChcImh0dHA6Ly9hcGkuc291bmRjbG91ZC5jb20vdHJhY2tzL1wiICsgc29uZ0lELCB7XG4gICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc29uZ0lEICsgXCJwbGF5ZXJcIiksXG4gICAgICAgICAgYXV0b19wbGF5OiBmYWxzZSxcbiAgICAgICAgICBtYXhoZWlnaHQ6IDE1MFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sIDUwKTtcbiAgfVxuICBpZiAoJHNjb3BlLmNoYW5uZWwgJiYgJHNjb3BlLmNoYW5uZWwucXVldWUpIHtcbiAgICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MoJHNjb3BlLmNoYW5uZWwucXVldWUpO1xuICB9XG4gICRzY29wZS5sb2FkU3VibWlzc2lvbnMoKTtcblxufSk7XG5cbmZ1bmN0aW9uIGZpbGxEYXRlQXJyYXlzKGV2ZW50cykge1xuICB2YXIgY2FsZW5kYXIgPSBbXTtcbiAgdmFyIHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAyMTsgaSsrKSB7XG4gICAgdmFyIGNhbERheSA9IHt9O1xuICAgIGNhbERheS5kYXkgPSBuZXcgRGF0ZSgpXG4gICAgY2FsRGF5LmRheS5zZXREYXRlKHRvZGF5LmdldERhdGUoKSArIGkpO1xuICAgIHZhciBkYXlFdmVudHMgPSBldmVudHMuZmlsdGVyKGZ1bmN0aW9uKGV2KSB7XG4gICAgICByZXR1cm4gKGV2LmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSBjYWxEYXkuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpKTtcbiAgICB9KTtcbiAgICB2YXIgZXZlbnRBcnJheSA9IFtdO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgMjQ7IGorKykge1xuICAgICAgZXZlbnRBcnJheVtqXSA9IFwiLVwiO1xuICAgIH1cbiAgICBkYXlFdmVudHMuZm9yRWFjaChmdW5jdGlvbihldikge1xuICAgICAgZXZlbnRBcnJheVtldi5kYXkuZ2V0SG91cnMoKV0gPSBldjtcbiAgICB9KTtcbiAgICBjYWxEYXkuZXZlbnRzID0gZXZlbnRBcnJheTtcbiAgICBjYWxlbmRhci5wdXNoKGNhbERheSk7XG4gIH1cbiAgcmV0dXJuIGNhbGVuZGFyO1xufSIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3N1Ym1pdFNvbmcnLCB7XG4gICAgdXJsOiAnL3N1Ym1pdCcsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9zdWJtaXQvc3VibWl0LnZpZXcuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ1N1Ym1pdFNvbmdDb250cm9sbGVyJ1xuICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignU3VibWl0U29uZ0NvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHApIHtcblxuICAkc2NvcGUuc3VibWlzc2lvbiA9IHt9O1xuXG4gICRzY29wZS51cmxDaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAucG9zdCgnL2FwaS9zb3VuZGNsb3VkL3Jlc29sdmUnLCB7XG4gICAgICAgIHVybDogJHNjb3BlLnVybFxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUuc3VibWlzc2lvbi50cmFja0lEID0gcmVzLmRhdGEuaWQ7XG4gICAgICAgICRzY29wZS5zdWJtaXNzaW9uLnRpdGxlID0gcmVzLmRhdGEudGl0bGU7XG4gICAgICAgICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrVVJMID0gcmVzLmRhdGEudHJhY2tVUkw7XG4gICAgICAgIFNDLm9FbWJlZCgkc2NvcGUuc3VibWlzc2lvbi50cmFja1VSTCwge1xuICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLFxuICAgICAgICAgIGF1dG9fcGxheTogZmFsc2UsXG4gICAgICAgICAgbWF4aGVpZ2h0OiAxNTBcbiAgICAgICAgfSlcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUGxheWVyJykuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAkc2NvcGUubm90Rm91bmQgPSBmYWxzZTtcbiAgICAgIH0pLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrSUQgPSBudWxsO1xuICAgICAgICAkc2NvcGUubm90Rm91bmQgPSB0cnVlO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghJHNjb3BlLnN1Ym1pc3Npb24uZW1haWwgfHwgISRzY29wZS5zdWJtaXNzaW9uLm5hbWUpIHtcbiAgICAgIGFsZXJ0KFwiUGxlYXNlIGZpbGwgaW4gYWxsIGZpZWxkc1wiKVxuICAgIH0gZWxzZSBpZiAoISRzY29wZS5zdWJtaXNzaW9uLnRyYWNrSUQpIHtcbiAgICAgIGFsZXJ0KFwiVHJhY2sgTm90IEZvdW5kXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAkaHR0cC5wb3N0KCcvYXBpL3N1Ym1pc3Npb25zJywge1xuICAgICAgICAgIGVtYWlsOiAkc2NvcGUuc3VibWlzc2lvbi5lbWFpbCxcbiAgICAgICAgICB0cmFja0lEOiAkc2NvcGUuc3VibWlzc2lvbi50cmFja0lELFxuICAgICAgICAgIG5hbWU6ICRzY29wZS5zdWJtaXNzaW9uLm5hbWUsXG4gICAgICAgICAgdGl0bGU6ICRzY29wZS5zdWJtaXNzaW9uLnRpdGxlLFxuICAgICAgICAgIHRyYWNrVVJMOiAkc2NvcGUuc3VibWlzc2lvbi50cmFja1VSTCxcbiAgICAgICAgICBjaGFubmVsSURTOiBbXSxcbiAgICAgICAgICBpbnZvaWNlSURTOiBbXVxuICAgICAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhyZXMuZGF0YSk7XG4gICAgICAgICAgd2luZG93LmFsZXJ0KFwiWW91ciBzb25nIGhhcyBiZWVuIHN1Ym1pdHRlZCBhbmQgd2lsbCBiZSByZXZpZXdlZCBzb29uLlwiKTtcbiAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJFcnJvcjogQ291bGQgbm90IHN1Ym1pdCBzb25nLlwiKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhdXRvRW1haWxzTmV3Jywge1xuICAgIHVybDogJy9hZG1pbi9kYXRhYmFzZS9hdXRvRW1haWxzL25ldycsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9kYXRhYmFzZS9hdXRvRW1haWxzL2F1dG9FbWFpbHMuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0F1dG9FbWFpbHNDb250cm9sbGVyJ1xuICB9KTtcbn0pO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhdXRvRW1haWxzRWRpdCcsIHtcbiAgICB1cmw6ICcvYWRtaW4vZGF0YWJhc2UvYXV0b0VtYWlscy9lZGl0Lzp0ZW1wbGF0ZUlkJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2RhdGFiYXNlL2F1dG9FbWFpbHMvYXV0b0VtYWlscy5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnQXV0b0VtYWlsc0NvbnRyb2xsZXInLFxuICAgIC8vIHJlc29sdmU6IHtcbiAgICAvLyAgIHRlbXBsYXRlOiBmdW5jdGlvbigkaHR0cCkge1xuICAgIC8vICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2RhdGFiYXNlL2F1dG9FbWFpbHMvYml3ZWVrbHk/aXNBcnRpc3Q9dHJ1ZScpXG4gICAgLy8gICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgLy8gICAgICAgICB2YXIgdGVtcGxhdGUgPSByZXMuZGF0YTtcbiAgICAvLyAgICAgICAgIGlmICh0ZW1wbGF0ZSkge1xuICAgIC8vICAgICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgLy8gICAgICAgICB9IGVsc2Uge1xuICAgIC8vICAgICAgICAgICByZXR1cm4ge1xuICAgIC8vICAgICAgICAgICAgIHB1cnBvc2U6IFwiQml3ZWVrbHkgRW1haWxcIlxuICAgIC8vICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgICAgfSlcbiAgICAvLyAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAvLyAgICAgICAgIGFsZXJ0KFwiRVJST1I6IFNvbWV0aGluZyB3ZW50IHdyb25nLlwiKTtcbiAgICAvLyAgICAgICB9KVxuICAgIC8vICAgfVxuICAgIC8vIH1cbiAgfSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0F1dG9FbWFpbHNDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCAkc3RhdGVQYXJhbXMsIEF1dGhTZXJ2aWNlKSB7XG4gICRzY29wZS5sb2dnZWRJbiA9IGZhbHNlO1xuXG5cbiAgJHNjb3BlLmlzU3RhdGVQYXJhbXMgPSBmYWxzZTtcbiAgaWYoJHN0YXRlUGFyYW1zLnRlbXBsYXRlSWQpIHtcbiAgICAkc2NvcGUuaXNTdGF0ZVBhcmFtcyA9IHRydWU7XG4gIH1cbiAgLy8gJHNjb3BlLnRlbXBsYXRlID0gdGVtcGxhdGU7XG5cbiAgJHNjb3BlLnRlbXBsYXRlID0ge1xuICAgIGlzQXJ0aXN0OiBmYWxzZVxuICB9O1xuXG4gICRzY29wZS5nZXRUZW1wbGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmKCRzdGF0ZVBhcmFtcy50ZW1wbGF0ZUlkKSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAkaHR0cC5nZXQoJy9hcGkvZGF0YWJhc2UvYXV0b0VtYWlscz90ZW1wbGF0ZUlkPScgKyAkc3RhdGVQYXJhbXMudGVtcGxhdGVJZClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdmFyIHRlbXBsYXRlID0gcmVzLmRhdGE7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICBpZiAodGVtcGxhdGUpIHtcbiAgICAgICAgICAgICRzY29wZS50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkc2NvcGUudGVtcGxhdGUgPSB7fTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgIGFsZXJ0KFwiRVJST1I6IFNvbWV0aGluZyB3ZW50IHdyb25nLlwiKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH07XG5cbiAgLy8gY29uc29sZS5sb2codGVtcGxhdGUpO1xuICAkc2NvcGUuc2F2ZSA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL2F1dG9FbWFpbHMvJywgJHNjb3BlLnRlbXBsYXRlKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIGFsZXJ0KFwiU2F2ZWQgZW1haWwgdGVtcGxhdGUuXCIpXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGFsZXJ0KFwiRVJST1I6IE1lc3NhZ2UgY291bGQgbm90IHNhdmUuXCIpXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8vICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAvLyAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgLy8gICAkaHR0cC5wb3N0KCcvYXBpL2xvZ2luJywge1xuICAvLyAgICAgcGFzc3dvcmQ6ICRzY29wZS5wYXNzd29yZFxuICAvLyAgIH0pLnRoZW4oZnVuY3Rpb24oKSB7XG4gIC8vICAgICAkcm9vdFNjb3BlLnBhc3N3b3JkID0gJHNjb3BlLnBhc3N3b3JkO1xuICAvLyAgICAgJHNjb3BlLmxvZ2dlZEluID0gdHJ1ZTtcbiAgLy8gICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gIC8vICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gIC8vICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAvLyAgICAgYWxlcnQoJ1dyb25nIFBhc3N3b3JkJyk7XG4gIC8vICAgfSk7XG4gIC8vIH1cblxuICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgJGh0dHAuZ2V0KCcvYXBpL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4nO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIGFsZXJ0KCdXcm9uZyBQYXNzd29yZCcpO1xuICAgIH0pO1xuICB9XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2F1dG9FbWFpbHNMaXN0Jywge1xuICAgIHVybDogJy9hZG1pbi9kYXRhYmFzZS9hdXRvRW1haWxzJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2RhdGFiYXNlL2F1dG9FbWFpbHMvYXV0b0VtYWlsc0xpc3QuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0F1dG9FbWFpbHNMaXN0Q29udHJvbGxlcicsXG4gICAgcmVzb2x2ZToge1xuICAgICAgdGVtcGxhdGVzOiBmdW5jdGlvbigkaHR0cCkge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2RhdGFiYXNlL2F1dG9FbWFpbHMnKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykgeyBcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IHJlcy5kYXRhO1xuICAgICAgICAgICAgaWYgKHRlbXBsYXRlKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcHVycG9zZTogXCJCaXdlZWtseSBFbWFpbFwiXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgYWxlcnQoXCJFUlJPUjogU29tZXRoaW5nIHdlbnQgd3JvbmcuXCIpO1xuICAgICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignQXV0b0VtYWlsc0xpc3RDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCBBdXRoU2VydmljZSwgdGVtcGxhdGVzKSB7XG4gICRzY29wZS5sb2dnZWRJbiA9IGZhbHNlO1xuICAkc2NvcGUudGVtcGxhdGVzID0gdGVtcGxhdGVzO1xuXG4gIC8vICRzY29wZS5nZXRUZW1wbGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgLy8gICAkaHR0cC5nZXQoJy9hcGkvZGF0YWJhc2UvYXV0b0VtYWlscy9iaXdlZWtseT9pc0FydGlzdD0nICsgU3RyaW5nKCRzY29wZS50ZW1wbGF0ZS5pc0FydGlzdCkpXG4gIC8vICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgLy8gICAgICAgdmFyIHRlbXBsYXRlID0gcmVzLmRhdGE7XG4gIC8vICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gIC8vICAgICAgIGlmICh0ZW1wbGF0ZSkge1xuICAvLyAgICAgICAgICRzY29wZS50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAvLyAgICAgICB9IGVsc2Uge1xuICAvLyAgICAgICAgICRzY29wZS50ZW1wbGF0ZSA9IHtcbiAgLy8gICAgICAgICAgIHB1cnBvc2U6IFwiQml3ZWVrbHkgRW1haWxcIixcbiAgLy8gICAgICAgICAgIGlzQXJ0aXN0OiBmYWxzZVxuICAvLyAgICAgICAgIH07XG4gIC8vICAgICAgIH1cbiAgLy8gICAgIH0pXG4gIC8vICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgLy8gICAgICAgYWxlcnQoXCJFUlJPUjogU29tZXRoaW5nIHdlbnQgd3JvbmcuXCIpO1xuICAvLyAgICAgfSk7XG4gIC8vIH07XG5cbiAgLy8gY29uc29sZS5sb2codGVtcGxhdGUpO1xuICAkc2NvcGUuc2F2ZSA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL2F1dG9FbWFpbHMnLCAkc2NvcGUudGVtcGxhdGUpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgYWxlcnQoXCJTYXZlZCBlbWFpbC5cIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGFsZXJ0KFwiRVJST1I6IE1lc3NhZ2UgY291bGQgbm90IHNhdmUuXCIpXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8vICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAvLyAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgLy8gICAkaHR0cC5wb3N0KCcvYXBpL2xvZ2luJywge1xuICAvLyAgICAgcGFzc3dvcmQ6ICRzY29wZS5wYXNzd29yZFxuICAvLyAgIH0pLnRoZW4oZnVuY3Rpb24oKSB7XG4gIC8vICAgICAkcm9vdFNjb3BlLnBhc3N3b3JkID0gJHNjb3BlLnBhc3N3b3JkO1xuICAvLyAgICAgJHNjb3BlLmxvZ2dlZEluID0gdHJ1ZTtcbiAgLy8gICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gIC8vICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gIC8vICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAvLyAgICAgYWxlcnQoJ1dyb25nIFBhc3N3b3JkJyk7XG4gIC8vICAgfSk7XG4gIC8vIH1cblxuICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgJGh0dHAuZ2V0KCcvYXBpL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4nO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIGFsZXJ0KCdXcm9uZyBQYXNzd29yZCcpO1xuICAgIH0pO1xuICB9XG5cbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnZG93bmxvYWQnLCB7XG5cdFx0dXJsOiAnL2Rvd25sb2FkJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2Rvd25sb2FkVHJhY2svdmlld3MvZG93bmxvYWRUcmFjay52aWV3Lmh0bWwnLFxuXHRcdGNvbnRyb2xsZXI6ICdEb3dubG9hZFRyYWNrQ29udHJvbGxlcidcblx0fSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0Rvd25sb2FkVHJhY2tDb250cm9sbGVyJywgWyckcm9vdFNjb3BlJyxcblx0JyRzdGF0ZScsXG5cdCckc2NvcGUnLFxuXHQnJGh0dHAnLFxuXHQnJGxvY2F0aW9uJyxcblx0JyR3aW5kb3cnLFxuXHQnRG93bmxvYWRUcmFja1NlcnZpY2UnLFxuXHRmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgJHdpbmRvdywgRG93bmxvYWRUcmFja1NlcnZpY2UpIHtcblxuXHRcdC8qIE5vcm1hbCBKUyB2YXJzIGFuZCBmdW5jdGlvbnMgbm90IGJvdW5kIHRvIHNjb3BlICovXG5cblx0XHR2YXIgdGFza09iaiA9IHt9O1xuXHRcdHZhciB0cmFjayA9IHt9O1xuXHRcdHZhciB0cmFja0RhdGEgPSB7fTtcblx0XHR2YXIgcGxheWVyT2JqID0gbnVsbDtcblxuXHRcdC8qICRzY29wZSBiaW5kaW5ncyBzdGFydCAqL1xuXG5cdFx0JHNjb3BlLnRyYWNrRGF0YSA9IHtcblx0XHRcdHRyYWNrTmFtZTogJ01peGluZyBhbmQgTWFzdGVyaW5nJyxcblx0XHRcdHVzZXJOYW1lOiAnbGEgdHJvcGljYWwnXG5cdFx0fTtcblx0XHQkc2NvcGUudG9nZ2xlID0gdHJ1ZTtcblx0XHQkc2NvcGUudG9nZ2xlUGxheSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0JHNjb3BlLnRvZ2dsZSA9ICEkc2NvcGUudG9nZ2xlO1xuXHRcdFx0aWYgKCRzY29wZS50b2dnbGUpIHtcblx0XHRcdFx0cGxheWVyT2JqLnBhdXNlKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRwbGF5ZXJPYmoucGxheSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuXHRcdCRzY29wZS5lbWJlZFRyYWNrID0gZmFsc2U7XG5cdFx0JHNjb3BlLmRvd25sb2FkVVJMTm90Rm91bmQgPSBmYWxzZTtcblx0XHQkc2NvcGUuZXJyb3JUZXh0ID0gJyc7XG5cdFx0JHNjb3BlLmZvbGxvd0JveEltYWdlVXJsID0gJ2Fzc2V0cy9pbWFnZXMvd2hvLXdlLWFyZS5wbmcnO1xuXG5cdFx0LyogRGVmYXVsdCBwcm9jZXNzaW5nIG9uIHBhZ2UgbG9hZCAqL1xuXG5cdFx0JHNjb3BlLmdldERvd25sb2FkVHJhY2sgPSBmdW5jdGlvbigpIHtcblxuXHRcdFx0JHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuXHRcdFx0dmFyIHRyYWNrSUQgPSAkbG9jYXRpb24uc2VhcmNoKCkudHJhY2tpZDtcblx0XHRcdERvd25sb2FkVHJhY2tTZXJ2aWNlXG5cdFx0XHRcdC5nZXRDb25maWcoKVxuXHRcdFx0XHQudGhlbihpbml0U0MpXG5cdFx0XHRcdC50aGVuKGZldGNoRG93bmxvYWRUcmFjaylcblx0XHRcdFx0LnRoZW4ocmVjZWl2ZURvd25sb2FkVHJhY2spXG5cdFx0XHRcdC50aGVuKHJlY2VpdmVUcmFja0RhdGEpXG5cdFx0XHRcdC50aGVuKGluaXRQbGF5KVxuXHRcdFx0XHQuY2F0Y2goY2F0Y2hEb3dubG9hZFRyYWNrRXJyb3IpO1xuXG5cdFx0XHRmdW5jdGlvbiBpbml0U0MocmVzKSB7XG5cdFx0XHRcdHJldHVybiBTQy5pbml0aWFsaXplKHtcblx0XHRcdFx0XHRjbGllbnRfaWQ6IHJlcy5kYXRhLmNsaWVudElELFxuXHRcdFx0XHRcdHJlZGlyZWN0X3VyaTogcmVzLmRhdGEuY2FsbGJhY2tVUkwsXG5cdFx0XHRcdFx0c2NvcGU6ICdub24tZXhwaXJpbmcnXG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBmZXRjaERvd25sb2FkVHJhY2soKSB7XG5cdFx0XHRcdHJldHVybiBEb3dubG9hZFRyYWNrU2VydmljZS5nZXREb3dubG9hZFRyYWNrKHRyYWNrSUQpO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiByZWNlaXZlRG93bmxvYWRUcmFjayhyZXN1bHQpIHtcblx0XHRcdFx0dHJhY2sgPSB7XG5cdFx0XHRcdFx0dHJhY2tVUkw6IHJlc3VsdC5kYXRhLnRyYWNrVXJsLFxuXHRcdFx0XHRcdGRvd25sb2FkVVJMOiByZXN1bHQuZGF0YS5kb3dubG9hZFVybCxcblx0XHRcdFx0XHRhcnR3b3JrVXJsOiByZXN1bHQuZGF0YS5hcnR3b3JrVVJMLFxuXHRcdFx0XHRcdGVtYWlsOiByZXN1bHQuZGF0YS5lbWFpbCxcblx0XHRcdFx0XHRwbGF5bGlzdElEOiByZXN1bHQuZGF0YS5wbGF5bGlzdElEXG5cdFx0XHRcdH07XG5cdFx0XHRcdCRzY29wZS5iYWNrZ3JvdW5kU3R5bGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0J2JhY2tncm91bmQtaW1hZ2UnOiAndXJsKCcgKyB0cmFjay5hcnR3b3JrVXJsICsgJyknLFxuXHRcdFx0XHRcdFx0J2JhY2tncm91bmQtcmVwZWF0JzogJ25vLXJlcGVhdCcsXG5cdFx0XHRcdFx0XHQnYmFja2dyb3VuZC1zaXplJzogJ2NvdmVyJ1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gRG93bmxvYWRUcmFja1NlcnZpY2UuZ2V0VHJhY2tEYXRhKHRyYWNrKTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gcmVjZWl2ZVRyYWNrRGF0YShyZXN1bHQpIHtcblx0XHRcdFx0Y29uc29sZS5sb2cocmVzdWx0LmRhdGEpO1xuXHRcdFx0XHR0cmFja0RhdGEgPSB7XG5cdFx0XHRcdFx0dHJhY2tJRDogcmVzdWx0LmRhdGEuaWQsXG5cdFx0XHRcdFx0YXJ0aXN0SUQ6IHJlc3VsdC5kYXRhLnVzZXJfaWQsXG5cdFx0XHRcdFx0dGl0bGU6IHJlc3VsdC5kYXRhLnRpdGxlLFxuXHRcdFx0XHRcdGRvd25sb2FkVVJMOiByZXN1bHQuZGF0YS5kb3dubG9hZF91cmwsXG5cdFx0XHRcdFx0dHJhY2tVUkw6IHJlc3VsdC5kYXRhLm9iamVjdFVSTFxuXHRcdFx0XHR9O1xuXHRcdFx0XHQkc2NvcGUuZm9sbG93Qm94SW1hZ2VVcmwgPSByZXN1bHQuZGF0YS51c2VyLmF2YXRhcl91cmw7XG5cblx0XHRcdFx0JHNjb3BlLnRyYWNrRGF0YS50cmFja05hbWUgPSByZXN1bHQuZGF0YS50aXRsZTtcblx0XHRcdFx0JHNjb3BlLnRyYWNrRGF0YS51c2VyTmFtZSA9IHJlc3VsdC5kYXRhLnVzZXIudXNlcm5hbWU7XG5cblx0XHRcdFx0JHNjb3BlLmVtYmVkVHJhY2sgPSB0cnVlO1xuXHRcdFx0XHQkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuXG5cdFx0XHRcdHJldHVybiBTQy5zdHJlYW0oJy90cmFja3MvJyArIHRyYWNrRGF0YS50cmFja0lEKTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gaW5pdFBsYXkocGxheWVyKSB7XG5cdFx0XHRcdHBsYXllck9iaiA9IHBsYXllcjtcblx0XHRcdFx0Ly8gcGxheWVyT2JqLnBsYXkoKTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gY2F0Y2hEb3dubG9hZFRyYWNrRXJyb3IoKSB7XG5cdFx0XHRcdCRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG5cdFx0XHRcdCRzY29wZS5lbWJlZFRyYWNrID0gZmFsc2U7XG5cdFx0XHR9XG5cdFx0fTtcblxuXG5cdFx0LyogT24gY2xpY2sgZG93bmxvYWQgdHJhY2sgYnV0dG9uICovXG5cblx0XHQkc2NvcGUuZG93bmxvYWRUcmFjayA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0JHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuXHRcdFx0JHNjb3BlLmVycm9yVGV4dCA9ICcnO1xuXHRcdFx0JGh0dHAuZ2V0KCdhcGkvc291bmRjbG91ZC9zb3VuZGNsb3VkQ29uZmlnJylcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzKSB7XG5cdFx0XHRcdFx0U0MuaW5pdGlhbGl6ZSh7XG5cdFx0XHRcdFx0XHRjbGllbnRfaWQ6IHJlcy5kYXRhLmNsaWVudElELFxuXHRcdFx0XHRcdFx0cmVkaXJlY3RfdXJpOiByZXMuZGF0YS5jYWxsYmFja1VSTCxcblx0XHRcdFx0XHRcdHNjb3BlOiAnbm9uLWV4cGlyaW5nJ1xuXHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdCRzY29wZS5jbGllbnRJRFN0cmluZyA9IHJlcy5kYXRhLmNsaWVudElELnRvU3RyaW5nKCk7XG5cdFx0XHRcdFx0cmV0dXJuIFNDLmNvbm5lY3QoKTtcblx0XHRcdFx0fSlcblx0XHRcdFx0LnRoZW4ocGVyZm9ybVRhc2tzKVxuXHRcdFx0XHQudGhlbihpbml0RG93bmxvYWQpXG5cdFx0XHRcdC5jYXRjaChjYXRjaFRhc2tzRXJyb3IpXG5cblx0XHRcdGZ1bmN0aW9uIHBlcmZvcm1UYXNrcyhyZXMpIHtcblx0XHRcdFx0dGFza09iaiA9IHtcblx0XHRcdFx0XHR0b2tlbjogcmVzLm9hdXRoX3Rva2VuLFxuXHRcdFx0XHRcdHRyYWNrSUQ6IHRyYWNrRGF0YS50cmFja0lELFxuXHRcdFx0XHRcdGFydGlzdElEOiB0cmFja0RhdGEuYXJ0aXN0SUQsXG5cdFx0XHRcdFx0cGxheWxpc3RJRDogdHJhY2sucGxheWxpc3RJRFxuXHRcdFx0XHR9O1xuXHRcdFx0XHRyZXR1cm4gRG93bmxvYWRUcmFja1NlcnZpY2UucGVyZm9ybVRhc2tzKHRhc2tPYmopO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBpbml0RG93bmxvYWQocmVzKSB7XG5cdFx0XHRcdGlmICh0cmFjay5kb3dubG9hZFVSTCAmJiB0cmFjay5kb3dubG9hZFVSTCAhPT0gJycpIHtcblx0XHRcdFx0XHQkd2luZG93LmxvY2F0aW9uLmhyZWYgPSB0cmFjay5kb3dubG9hZFVSTDtcblx0XHRcdFx0fSBlbHNlIGlmICh0cmFja0RhdGEuZG93bmxvYWRVUkwgJiYgdGFza09iai50b2tlbikge1xuXHRcdFx0XHRcdCR3aW5kb3cubG9jYXRpb24uaHJlZiA9IHRyYWNrRGF0YS5kb3dubG9hZFVSTCArICc/Y2xpZW5kX2lkPScgKyAkc2NvcGUuY2xpZW50SURTdHJpbmcgKyAnJm9hdXRoX3Rva2VuPScgKyB0YXNrT2JqLnRva2VuLnRvU3RyaW5nKCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JHNjb3BlLmVycm9yVGV4dCA9ICdFcnJvciEgQ291bGQgbm90IGZldGNoIGRvd25sb2FkIFVSTCc7XG5cdFx0XHRcdFx0JHNjb3BlLmRvd25sb2FkVVJMTm90Rm91bmQgPSB0cnVlO1xuXHRcdFx0XHRcdCRzY29wZS4kYXBwbHkoKTtcblx0XHRcdFx0fVxuXHRcdFx0XHQkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBjYXRjaFRhc2tzRXJyb3IoZXJyKSB7XG5cdFx0XHRcdGFsZXJ0KCdFcnJvciBpbiBwcm9jZXNzaW5nIHlvdXIgcmVxdWVzdCcpO1xuXHRcdFx0XHQkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuXHRcdFx0fVxuXG5cdFx0fTtcblx0fVxuXSk7IiwiYXBwLnNlcnZpY2UoJ0Rvd25sb2FkVHJhY2tTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKSB7XG5cblx0ZnVuY3Rpb24gZ2V0RG93bmxvYWRUcmFjayhkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS9kb3dubG9hZC90cmFjaz90cmFja0lEPScgKyBkYXRhKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGdldFRyYWNrRGF0YShkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvc291bmRjbG91ZC9yZXNvbHZlJywge1xuXHRcdFx0dXJsOiBkYXRhLnRyYWNrVVJMXG5cdFx0fSk7XG5cdH1cblxuXHRmdW5jdGlvbiBwZXJmb3JtVGFza3MoZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5wb3N0KCdhcGkvZG93bmxvYWQvdGFza3MnLCBkYXRhKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGdldENvbmZpZygpIHtcblx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3NvdW5kY2xvdWQvc291bmRjbG91ZENvbmZpZycpO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRnZXREb3dubG9hZFRyYWNrOiBnZXREb3dubG9hZFRyYWNrLFxuXHRcdGdldFRyYWNrRGF0YTogZ2V0VHJhY2tEYXRhLFxuXHRcdHBlcmZvcm1UYXNrczogcGVyZm9ybVRhc2tzLFxuXHRcdGdldENvbmZpZzogZ2V0Q29uZmlnXG5cdH07XG59XSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgnaG9tZScsIHtcbiAgICAgIHVybDogJy8nLFxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL3ZpZXdzL2hvbWUuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnSG9tZUNvbnRyb2xsZXInXG4gICAgfSlcbiAgICAuc3RhdGUoJ2Fib3V0Jywge1xuICAgICAgdXJsOiAnL2Fib3V0JyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS92aWV3cy9hYm91dC5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcbiAgICB9KVxuICAgIC5zdGF0ZSgnc2VydmljZXMnLCB7XG4gICAgICB1cmw6ICcvc2VydmljZXMnLFxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL3ZpZXdzL3NlcnZpY2VzLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJ1xuICAgIH0pXG4gICAgLnN0YXRlKCdhcnRpc3RUb29scycsIHtcbiAgICAgIHVybDogJy9hcnRpc3QtdG9vbHMnLFxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL3ZpZXdzL2FydGlzdC10b29scy5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcbiAgICB9KVxuICAgIC5zdGF0ZSgnZmFxcycsIHtcbiAgICAgIHVybDogJy9mYXFzJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS92aWV3cy9mYXFzLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJ1xuICAgIH0pXG4gICAgLnN0YXRlKCdhcHBseScsIHtcbiAgICAgIHVybDogJy9hcHBseScsXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvYXBwbHkuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnSG9tZUNvbnRyb2xsZXInXG4gICAgfSlcbiAgICAuc3RhdGUoJ2NvbnRhY3QnLCB7XG4gICAgICB1cmw6ICcvY29udGFjdCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvY29udGFjdC5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcbiAgICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignSG9tZUNvbnRyb2xsZXInLCBbJyRyb290U2NvcGUnLFxuICAnJHN0YXRlJyxcbiAgJyRzY29wZScsXG4gICckaHR0cCcsXG4gICckbG9jYXRpb24nLFxuICAnJHdpbmRvdycsXG4gICdIb21lU2VydmljZScsXG4gIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uLCAkd2luZG93LCBIb21lU2VydmljZSkge1xuXG4gICAgJHNjb3BlLmFwcGxpY2F0aW9uT2JqID0ge307XG4gICAgJHNjb3BlLmlzU2VudCA9IGZhbHNlO1xuICAgICRzY29wZS5tZXNzYWdlID0ge1xuICAgICAgYXBwbGljYXRpb246IHtcbiAgICAgICAgdmFsOiAnJyxcbiAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgIH1cbiAgICB9O1xuICAgICRzY29wZS50b2dnbGVBcHBsaWNhdGlvblNlbnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5pc1NlbnQgPSAhJHNjb3BlLmlzU2VudFxuICAgIH07XG5cbiAgICAkc2NvcGUuc2F2ZUFwcGxpY2F0aW9uID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICRzY29wZS5tZXNzYWdlLmFwcGxpY2F0aW9uID0ge1xuICAgICAgICB2YWw6ICcnLFxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgfTtcblxuICAgICAgaWYgKCRzY29wZS5hcHBsaWNhdGlvbk9iai5wYXNzd29yZCAhPT0gJHNjb3BlLmFwcGxpY2F0aW9uT2JqLmNvbmZpcm1QYXNzd29yZCkge1xuICAgICAgICAkc2NvcGUubWVzc2FnZS5hcHBsaWNhdGlvbiA9IHtcbiAgICAgICAgICB2YWw6ICdQYXNzd29yZCBhbmQgQ29uZmlybSBwYXNzd29yZCBkbyBub3QgbWF0Y2gnLFxuICAgICAgICAgIHZpc2libGU6IHRydWVcbiAgICAgICAgfTtcblxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICBIb21lU2VydmljZVxuICAgICAgICAuc2F2ZUFwcGxpY2F0aW9uKCRzY29wZS5hcHBsaWNhdGlvbk9iailcbiAgICAgICAgLnRoZW4oc2F2ZUFwcGxpY2F0aW9uUmVzcG9uc2UpXG4gICAgICAgIC5jYXRjaChzYXZlQXBwbGljYXRpb25FcnJvcilcblxuICAgICAgZnVuY3Rpb24gc2F2ZUFwcGxpY2F0aW9uUmVzcG9uc2UocmVzKSB7XG4gICAgICAgIGlmIChyZXMuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAkc2NvcGUuYXBwbGljYXRpb25PYmogPSB7fTtcbiAgICAgICAgICAkc2NvcGUuaXNTZW50ID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzYXZlQXBwbGljYXRpb25FcnJvcigpIHtcbiAgICAgICAgJHNjb3BlLm1lc3NhZ2UuYXBwbGljYXRpb24gPSB7XG4gICAgICAgICAgdmFsOiAnRXJyb3IgaW4gcHJvY2Vzc2luZyB5b3VyIHJlcXVlc3QnLFxuICAgICAgICAgIHZpc2libGU6IHRydWVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbl0pO1xuXG5hcHAuZGlyZWN0aXZlKCdhZmZpeGVyJywgZnVuY3Rpb24oJHdpbmRvdykge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgIGxpbms6IGZ1bmN0aW9uKCRzY29wZSwgJGVsZW1lbnQpIHtcbiAgICAgIHZhciB3aW4gPSBhbmd1bGFyLmVsZW1lbnQoJHdpbmRvdyk7XG4gICAgICB2YXIgdG9wT2Zmc2V0ID0gJGVsZW1lbnRbMF0ub2Zmc2V0VG9wO1xuXG4gICAgICBmdW5jdGlvbiBhZmZpeEVsZW1lbnQoKSB7XG5cbiAgICAgICAgaWYgKCR3aW5kb3cucGFnZVlPZmZzZXQgPiB0b3BPZmZzZXQpIHtcbiAgICAgICAgICAkZWxlbWVudC5jc3MoJ3Bvc2l0aW9uJywgJ2ZpeGVkJyk7XG4gICAgICAgICAgJGVsZW1lbnQuY3NzKCd0b3AnLCAnMy41JScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICRlbGVtZW50LmNzcygncG9zaXRpb24nLCAnJyk7XG4gICAgICAgICAgJGVsZW1lbnQuY3NzKCd0b3AnLCAnJyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgJHNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgd2luLnVuYmluZCgnc2Nyb2xsJywgYWZmaXhFbGVtZW50KTtcbiAgICAgIH0pO1xuICAgICAgd2luLmJpbmQoJ3Njcm9sbCcsIGFmZml4RWxlbWVudCk7XG4gICAgfVxuICB9O1xufSkiLCJcblxuYXBwLnNlcnZpY2UoJ0hvbWVTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKXtcblx0XG5cdGZ1bmN0aW9uIHNhdmVBcHBsaWNhdGlvbihkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvaG9tZS9hcHBsaWNhdGlvbicsIGRhdGEpO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRzYXZlQXBwbGljYXRpb246IHNhdmVBcHBsaWNhdGlvblxuXHR9O1xufV0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgncHJlbWllcicsIHtcblx0XHR1cmw6ICcvcHJlbWllcicsXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9wcmVtaWVyL3ZpZXdzL3ByZW1pZXIuaHRtbCcsXG5cdFx0Y29udHJvbGxlcjogJ1ByZW1pZXJDb250cm9sbGVyJ1xuXHR9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignUHJlbWllckNvbnRyb2xsZXInLCBbJyRyb290U2NvcGUnLFxuXHQnJHN0YXRlJyxcblx0JyRzY29wZScsXG5cdCckaHR0cCcsXG5cdCckbG9jYXRpb24nLFxuXHQnJHdpbmRvdycsXG4gICdQcmVtaWVyU2VydmljZScsXG5cdGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uLCAkd2luZG93LCBQcmVtaWVyU2VydmljZSkge1xuXG4gICAgJHNjb3BlLnByZW1pZXJPYmogPSB7fTtcblxuICAgICRzY29wZS5tZXNzYWdlID0ge1xuICAgICAgdmFsOiAnJyxcbiAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgfTtcbiAgICAkc2NvcGUuc2F2ZVByZW1pZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5tZXNzYWdlLnZpc2JpbGUgPSBmYWxzZTtcbiAgICAgIHZhciBkYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgICBmb3IodmFyIHByb3AgaW4gJHNjb3BlLnByZW1pZXJPYmopIHtcbiAgICAgICAgZGF0YS5hcHBlbmQocHJvcCwgJHNjb3BlLnByZW1pZXJPYmpbcHJvcF0pO1xuICAgICAgfVxuICAgICAgUHJlbWllclNlcnZpY2VcbiAgICAgICAgLnNhdmVQcmVtaWVyKGRhdGEpXG4gICAgICAgIC50aGVuKHJlY2VpdmVSZXNwb25zZSlcbiAgICAgICAgLmNhdGNoKGNhdGNoRXJyb3IpO1xuXG4gICAgICBmdW5jdGlvbiByZWNlaXZlUmVzcG9uc2UocmVzKSB7XG4gICAgICAgIGlmKHJlcy5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICRzY29wZS5tZXNzYWdlLnZpc2libGUgPSB0cnVlO1xuICAgICAgICAgICRzY29wZS5tZXNzYWdlLnZhbCA9ICdUaGFuayB5b3UhIFlvdXIgbWVzc2FnZSBoYXMgYmVlbiBzZW50IHN1Y2Nlc3NmdWxseS4nO1xuICAgICAgICAgICRzY29wZS5wcmVtaWVyT2JqID0ge307XG4gICAgICAgICAgYW5ndWxhci5lbGVtZW50KFwiaW5wdXRbdHlwZT0nZmlsZSddXCIpLnZhbChudWxsKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgJHNjb3BlLm1lc3NhZ2UudmlzaWJsZSA9IHRydWU7XG4gICAgICAgICRzY29wZS5tZXNzYWdlLnZhbCA9ICdFcnJvciBpbiBwcm9jZXNzaW5nIHRoZSByZXF1ZXN0LiBQbGVhc2UgdHJ5IGFnYWluLic7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGNhdGNoRXJyb3IoKSB7XG4gICAgICAgICRzY29wZS5tZXNzYWdlLnZpc2libGUgPSB0cnVlO1xuICAgICAgICAkc2NvcGUubWVzc2FnZS52YWwgPSAnRXJyb3IgaW4gcHJvY2Vzc2luZyB0aGUgcmVxdWVzdC4gUGxlYXNlIHRyeSBhZ2Fpbi4nO1xuICAgICAgfVxuICAgIH07XG59XSk7XG5cbiIsIlxuXG5hcHAuc2VydmljZSgnUHJlbWllclNlcnZpY2UnLCBbJyRodHRwJywgZnVuY3Rpb24oJGh0dHApe1xuXHRcblx0ZnVuY3Rpb24gc2F2ZVByZW1pZXIoZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cCh7XG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdHVybDogJy9hcGkvcHJlbWllcicsXG5cdFx0XHRoZWFkZXJzOiB7J0NvbnRlbnQtVHlwZSc6IHVuZGVmaW5lZCB9LFxuXHRcdFx0dHJhbnNmb3JtUmVxdWVzdDogYW5ndWxhci5pZGVudGl0eSxcblx0XHRcdGRhdGE6IGRhdGFcblx0XHR9KTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0c2F2ZVByZW1pZXI6IHNhdmVQcmVtaWVyXG5cdH07XG59XSk7XG4iXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
