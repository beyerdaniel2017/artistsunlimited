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
    if ($scope.track.trackURL !== '') {
      $scope.processing = true;
      $http.post('/api/soundcloud/resolve', {
        url: $scope.track.trackURL
      }).then(function (res) {
        $scope.track.trackID = res.data.id;
        $scope.track.artistID = res.data.user_id;
        $scope.track.artworkURL = res.data.artwork_url.replace('large.jpg', 't500x500.jpg');
        $scope.processing = false;
      }).then(null, function (err) {
        $scope.track.trackID = null;
        $scope.notFound = true;
        $scope.processing = false;
      });
    }
  };

  $scope.saveDownloadUrl = function () {
    if (!$scope.track.playlistID || !$scope.track.email || !$scope.track.downloadURL) {
      alert('Please fill in all fields');
      return false;
    }
    if (!$scope.track.trackID) {
      alert('Track Not Found');
      return false;
    }
    $scope.processing = true;
    $http.post('/api/database/downloadurl', $scope.track).then(function (res) {
      $scope.track = {
        trackURL: '',
        downloadURL: '',
        email: '',
        playlistID: ''
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
        trackURL: result.data.trackURL,
        downloadURL: result.data.downloadURL,
        artworkURL: result.data.artworkURL,
        email: result.data.email,
        playlistID: result.data.playlistID
      };
      $scope.backgroundStyle = function () {
        return {
          'background-image': 'url(' + track.artworkURL + ')',
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
        trackURL: result.data.trackURL
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
  $scope.artist = {};
  $scope.sent = {
    application: false,
    artistEmail: false
  };
  $scope.message = {
    application: {
      val: '',
      visible: false
    },
    artistEmail: {
      val: '',
      visible: false
    }
  };

  /* Apply page start */

  $scope.toggleApplicationSent = function () {
    $scope.message = {
      application: {
        val: '',
        visible: false
      }
    };
    $scope.sent.application = !$scope.sent.application;
  };

  $scope.saveApplication = function () {

    $scope.message.application = {
      val: '',
      visible: false
    };

    HomeService.saveApplication($scope.applicationObj).then(saveApplicationResponse)['catch'](saveApplicationError);

    function saveApplicationResponse(res) {
      if (res.status === 200) {
        $scope.applicationObj = {};
        $scope.sent.application = true;
      }
    }

    function saveApplicationError(res) {
      if (res.status === 400) {
        $scope.message.application = {
          val: 'Email already exists!',
          visible: true
        };
        return;
      }
      $scope.message.application = {
        val: 'Error in processing your request',
        visible: true
      };
    }
  };

  /* Apply page end */

  /* Artist Tools page start */

  $scope.toggleArtistEmail = function () {
    $scope.message = {
      artistEmail: {
        val: '',
        visible: false
      }
    };
    $scope.sent.artistEmail = !$scope.sent.artistEmail;
  };

  $scope.saveArtistEmail = function () {
    HomeService.saveArtistEmail($scope.artist).then(artistEmailResponse)['catch'](artistEmailError);

    function artistEmailResponse(res) {
      if (res.status === 200) {
        $scope.artist = {};
        $scope.sent.artistEmail = true;
      }
    }

    function artistEmailError(res) {
      if (res.status === 400) {
        $scope.message.artistEmail = {
          val: 'Email already exists!',
          visible: true
        };
        return;
      }

      $scope.message.artistEmail = {
        val: 'Error in processing your request',
        visible: true
      };
    }
  };

  /* Artist Tools page end */
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

  function saveArtistEmail(data) {
    return $http.post('/api/home/artistemail', data);
  }

  return {
    saveApplication: saveApplication,
    saveArtistEmail: saveArtistEmail
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
  $scope.processing = false;
  $scope.savePremier = function () {
    $scope.processing = true;
    $scope.message.visible = false;
    var data = new FormData();
    for (var prop in $scope.premierObj) {
      data.append(prop, $scope.premierObj[prop]);
    }
    PremierService.savePremier(data).then(receiveResponse)['catch'](catchError);

    function receiveResponse(res) {
      $scope.processing = false;
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

    function catchError(res) {
      $scope.processing = false;
      if (res.status === 400) {
        $scope.message = {
          visible: true,
          val: res.data
        };
        return;
      }
      $scope.message = {
        visible: true,
        val: 'Error in processing the request. Please try again.'
      };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImRhdGFiYXNlL2RhdGFiYXNlLmpzIiwiZnNhL2ZzYS1wcmUtYnVpbHQuanMiLCJsb2dpbi9sb2dpbi5qcyIsImxvZ2luL29FbWJlZEZhY3RvcnkuanMiLCJzY2hlZHVsZXIvc2NoZWR1bGVyLmpzIiwic3VibWl0L3N1Ym1pdC5qcyIsImRhdGFiYXNlL2F1dG9FbWFpbHMvYXV0b0VtYWlscy5qcyIsImRhdGFiYXNlL2F1dG9FbWFpbHMvYXV0b0VtYWlsc0xpc3QuanMiLCJkb3dubG9hZFRyYWNrL2NvbnRyb2xsZXJzL2Rvd25sb2FkVHJhY2tDb250cm9sbGVyLmpzIiwiZG93bmxvYWRUcmFjay9zZXJ2aWNlcy9kb3dubG9hZFRyYWNrU2VydmljZS5qcyIsImhvbWUvY29udHJvbGxlcnMvaG9tZUNvbnRyb2xsZXIuanMiLCJob21lL3NlcnZpY2VzL2hvbWVTZXJ2aWNlLmpzIiwicHJlbWllci9jb250cm9sbGVycy9wcmVtaWVyQ29udHJvbGxlci5qcyIsInByZW1pZXIvc2VydmljZXMvcHJlbWllclNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBQSxDQUFBO0FBQ0EsTUFBQSxDQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLHVCQUFBLEVBQUEsQ0FBQSxhQUFBLEVBQUEsV0FBQSxFQUFBLGNBQUEsRUFBQSxXQUFBLENBQUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxrQkFBQSxFQUFBLGlCQUFBLEVBQUEscUJBQUEsRUFBQTs7QUFFQSxtQkFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTs7QUFFQSxvQkFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLHVCQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7OztBQUdBLEdBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQSxhQUFBLEVBQUE7O0FBRUEsTUFBQSw0QkFBQSxHQUFBLFNBQUEsNEJBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLElBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLENBQUE7R0FDQSxDQUFBOzs7O0FBSUEsWUFBQSxDQUFBLEdBQUEsQ0FBQSxtQkFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxRQUFBLEVBQUE7O0FBRUEsUUFBQSxDQUFBLDRCQUFBLENBQUEsT0FBQSxDQUFBLEVBQUE7OztBQUdBLGFBQUE7S0FDQTs7QUFFQSxRQUFBLFdBQUEsQ0FBQSxlQUFBLEVBQUEsRUFBQTs7O0FBR0EsYUFBQTtLQUNBOzs7QUFHQSxTQUFBLENBQUEsY0FBQSxFQUFBLENBQUE7O0FBRUEsZUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTs7OztBQUlBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxFQUFBLFFBQUEsQ0FBQSxDQUFBO09BQ0EsTUFBQTtBQUNBLGNBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7T0FDQTtLQUNBLENBQUEsQ0FBQTtHQUVBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFHQSxHQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsRUFBQSxDQUFBLFlBQUE7QUFDQSxTQUFBO0FBQ0EsU0FBQSxFQUFBO0FBQ0EsY0FBQSxFQUFBLEdBQUE7S0FDQTtBQUNBLFFBQUEsRUFBQSxjQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsVUFBQSxXQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsTUFBQSxDQUFBLFlBQUE7QUFDQSxpQkFBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsZUFBQSxDQUFBLFFBQUEsR0FBQSxXQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQSxDQUFBOztBQ25FQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLGlCQUFBO0FBQ0EsZUFBQSxFQUFBLDJCQUFBO0FBQ0EsY0FBQSxFQUFBLG9CQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxTQUFBLENBQUEsaUJBQUEsRUFBQSxDQUFBLFFBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLFNBQUE7QUFDQSxZQUFBLEVBQUEsSUFBQTtBQUNBLFNBQUEsRUFBQSxJQUFBO0FBQ0EsWUFBQSxFQUFBLDhEQUFBLEdBQ0EsbUhBQUEsR0FDQSxRQUFBO0FBQ0EsUUFBQSxFQUFBLGNBQUEsTUFBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsVUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEVBQUEsQ0FBQSxjQUFBLEVBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxZQUFBLFVBQUEsR0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsR0FBQSxVQUFBLENBQUE7QUFDQSxZQUFBLFVBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQTtTQUNBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxvQkFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7QUFDQSxRQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxLQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFdBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsU0FBQSxHQUFBLENBQUE7QUFDQSxRQUFBLEVBQUEsVUFBQTtBQUNBLFNBQUEsRUFBQSxVQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxPQUFBO0FBQ0EsU0FBQSxFQUFBLE9BQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLE1BQUE7QUFDQSxTQUFBLEVBQUEsTUFBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsS0FBQTtBQUNBLFNBQUEsRUFBQSxPQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxPQUFBO0FBQ0EsU0FBQSxFQUFBLE9BQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLGFBQUE7QUFDQSxTQUFBLEVBQUEsYUFBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsV0FBQTtBQUNBLFNBQUEsRUFBQSxXQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxrQkFBQTtBQUNBLFNBQUEsRUFBQSxXQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxVQUFBO0FBQ0EsU0FBQSxFQUFBLGFBQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLFdBQUE7QUFDQSxTQUFBLEVBQUEsY0FBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsU0FBQTtBQUNBLFNBQUEsRUFBQSxZQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxTQUFBO0FBQ0EsU0FBQSxFQUFBLFlBQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLFVBQUE7QUFDQSxTQUFBLEVBQUEsVUFBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsZ0JBQUE7QUFDQSxTQUFBLEVBQUEsYUFBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsWUFBQTtBQUNBLFNBQUEsRUFBQSxXQUFBO0dBQ0EsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLHFCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLEtBQUEsR0FBQTtBQUNBLFlBQUEsRUFBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLEVBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsR0FBQSxHQUFBO0FBQ0EsUUFBQSxFQUFBLFNBQUE7QUFDQSxTQUFBLEVBQUEsQ0FBQTtBQUNBLFdBQUEsRUFBQSxLQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUE7QUFDQSxpQkFBQSxFQUFBLEVBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUE7S0FDQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSx1QkFBQSxFQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsZ0ZBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsR0FBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUE7S0FDQSxDQUFBLFNBQ0EsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGtCQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLElBQUEsU0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLE1BQUEsR0FBQSxJQUFBLENBQUE7S0FDQSxNQUFBLElBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLElBQUEsYUFBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLE1BQUEsR0FBQSxLQUFBLENBQUE7S0FDQTtBQUNBLFFBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLFNBQUEsR0FBQSxPQUFBLENBQUE7S0FDQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLFNBQUEsR0FBQSxPQUFBLENBQUE7S0FDQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUEsS0FBQSxDQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLFNBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxPQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxlQUFBLEdBQUEsQ0FBQSxLQUFBLEtBQUEsSUFBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGVBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0FBQ0EsUUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLGVBQUEsRUFBQSxLQUFBLENBQUEsZUFBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsZUFBQSxDQUFBO0FBQ0EsUUFBQSxJQUFBLEdBQUE7QUFDQSxXQUFBLEVBQUEsS0FBQTtBQUNBLGNBQUEsRUFBQSxVQUFBLENBQUEsUUFBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsRUFBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEscUJBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsb0JBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxLQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsV0FBQSxDQUFBLFdBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLEdBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsU0FBQSxHQUFBLE9BQUEsQ0FBQTtLQUNBO0FBQ0EsUUFBQSxNQUFBLENBQUEsV0FBQSxDQUFBLFdBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLEdBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsU0FBQSxHQUFBLE9BQUEsQ0FBQTtLQUNBO0FBQ0EsUUFBQSxNQUFBLENBQUEsV0FBQSxDQUFBLEtBQUEsRUFBQSxLQUFBLENBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxJQUFBLEdBQUE7QUFDQSxXQUFBLEVBQUEsS0FBQTtBQUNBLGNBQUEsRUFBQSxVQUFBLENBQUEsUUFBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsNEJBQUEsRUFBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsY0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsMkJBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsUUFBQSxNQUFBLEdBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLEVBQUEsUUFBQTtBQUNBLGNBQUEsRUFBQSxRQUFBO0tBQ0EsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLHFCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLDJCQUFBLEdBQUEsS0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsaUJBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsS0FBQSxFQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFFBQUE7T0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEVBQUEsY0FBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLDJCQUFBLENBQUEsQ0FBQTtBQUNBLGFBQUEsS0FBQSxDQUFBO0tBQ0E7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUE7S0FDQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSwyQkFBQSxFQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxHQUFBO0FBQ0EsZ0JBQUEsRUFBQSxFQUFBO0FBQ0EsbUJBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEVBQUE7QUFDQSxrQkFBQSxFQUFBLEVBQUE7T0FDQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLGlDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsNEJBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxxQkFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsMEJBQUEsRUFBQSxNQUFBLENBQUEsVUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQTtBQUNBLHFCQUFBLEVBQUEsRUFBQTtPQUNBLENBQUE7QUFDQSxXQUFBLENBQUEsaUNBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSw0QkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7Ozs7QUFJQSxRQUFBLENBQUEsRUFBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLElBQUEsRUFBQTtBQUNBLFFBQUEsVUFBQSxHQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxHQUFBLFVBQUEsQ0FBQTtBQUNBLFFBQUEsVUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDOVFBLENBQUEsWUFBQTs7QUFFQSxjQUFBLENBQUE7O0FBRUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsTUFBQSxJQUFBLEtBQUEsQ0FBQSx3QkFBQSxDQUFBLENBQUE7O0FBRUEsTUFBQSxHQUFBLEdBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxhQUFBLEVBQUEsRUFBQSxDQUFBLENBQUE7O0FBRUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxZQUFBLEVBQUEsWUFBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxFQUFBLE1BQUEsSUFBQSxLQUFBLENBQUEsc0JBQUEsQ0FBQSxDQUFBO0FBQ0EsV0FBQSxNQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7R0FDQSxDQUFBLENBQUE7O0FBRUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsVUFBQSxFQUFBO0FBQ0EsV0FBQTtBQUNBLFFBQUEsRUFBQSxZQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEVBQUEsQ0FBQSxTQUFBLEVBQUEsWUFBQTtBQUNBLGNBQUEsSUFBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLG9CQUFBLENBQUEsTUFBQSxDQUFBLFlBQUE7QUFDQSxvQkFBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7V0FDQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7T0FDQTtBQUNBLFVBQUEsRUFBQSxjQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxFQUFBLElBQUEsRUFBQSxZQUFBO0FBQ0EsY0FBQSxJQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0Esb0JBQUEsQ0FBQSxNQUFBLENBQUEsWUFBQTtBQUNBLGdCQUFBLFFBQUEsRUFBQTtBQUNBLHNCQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTthQUNBO1dBQ0EsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0E7S0FDQSxDQUFBO0dBQ0EsQ0FBQSxDQUFBOzs7OztBQUtBLEtBQUEsQ0FBQSxRQUFBLENBQUEsYUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxvQkFBQTtBQUNBLGVBQUEsRUFBQSxtQkFBQTtBQUNBLGlCQUFBLEVBQUEscUJBQUE7QUFDQSxrQkFBQSxFQUFBLHNCQUFBO0FBQ0Esb0JBQUEsRUFBQSx3QkFBQTtBQUNBLGlCQUFBLEVBQUEscUJBQUE7R0FDQSxDQUFBLENBQUE7O0FBRUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxpQkFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLEVBQUEsRUFBQSxXQUFBLEVBQUE7QUFDQSxRQUFBLFVBQUEsR0FBQTtBQUNBLFNBQUEsRUFBQSxXQUFBLENBQUEsZ0JBQUE7QUFDQSxTQUFBLEVBQUEsV0FBQSxDQUFBLGFBQUE7QUFDQSxTQUFBLEVBQUEsV0FBQSxDQUFBLGNBQUE7QUFDQSxTQUFBLEVBQUEsV0FBQSxDQUFBLGNBQUE7S0FDQSxDQUFBO0FBQ0EsV0FBQTtBQUNBLG1CQUFBLEVBQUEsdUJBQUEsUUFBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxVQUFBLENBQUEsVUFBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxRQUFBLENBQUEsQ0FBQTtBQUNBLGVBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtPQUNBO0tBQ0EsQ0FBQTtHQUNBLENBQUEsQ0FBQTs7QUFFQSxLQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsYUFBQSxFQUFBO0FBQ0EsaUJBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsV0FBQSxFQUNBLFVBQUEsU0FBQSxFQUFBO0FBQ0EsYUFBQSxTQUFBLENBQUEsR0FBQSxDQUFBLGlCQUFBLENBQUEsQ0FBQTtLQUNBLENBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQSxDQUFBOztBQUVBLEtBQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLEVBQUEsRUFBQTs7QUFFQSxhQUFBLGlCQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsVUFBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGFBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsRUFBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLFVBQUEsQ0FBQSxXQUFBLENBQUEsWUFBQSxDQUFBLENBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxJQUFBLENBQUE7S0FDQTs7OztBQUlBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLGFBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUE7Ozs7Ozs7Ozs7QUFVQSxVQUFBLElBQUEsQ0FBQSxlQUFBLEVBQUEsSUFBQSxVQUFBLEtBQUEsSUFBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtPQUNBOzs7OztBQUtBLGFBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsaUJBQUEsQ0FBQSxTQUFBLENBQUEsWUFBQTtBQUNBLGVBQUEsSUFBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0tBRUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsS0FBQSxHQUFBLFVBQUEsV0FBQSxFQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxXQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsaUJBQUEsQ0FBQSxTQUNBLENBQUEsWUFBQTtBQUNBLGVBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsNEJBQUE7U0FDQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLGFBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLGVBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsVUFBQSxDQUFBLFdBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7R0FDQSxDQUFBLENBQUE7O0FBRUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBOztBQUVBLFFBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxjQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQSxnQkFBQSxFQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7O0FBRUEsY0FBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsY0FBQSxFQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLEVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsU0FBQSxFQUFBLElBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxFQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7S0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxFQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7S0FDQSxDQUFBO0dBRUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxFQUFBLENBQUE7QUMzSkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxRQUFBO0FBQ0EsZUFBQSxFQUFBLHFCQUFBO0FBQ0EsY0FBQSxFQUFBLHNCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUdBLEdBQUEsQ0FBQSxVQUFBLENBQUEsc0JBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxXQUFBLEVBQUEsYUFBQSxFQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsZUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxLQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLEVBQUE7QUFDQSxjQUFBLEVBQUEsTUFBQSxDQUFBLFFBQUE7S0FDQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxnQkFBQSxDQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBO0tBQ0EsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQSxrQ0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsUUFBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBO0FBQ0Esb0JBQUEsRUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFdBQUE7QUFDQSxhQUFBLEVBQUEsY0FBQTtPQUNBLENBQUEsQ0FBQTtBQUNBLGFBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsV0FBQSxHQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsMEJBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxHQUFBLENBQUEsV0FBQTtBQUNBLGdCQUFBLEVBQUEsVUFBQSxDQUFBLFFBQUE7T0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLGFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxhQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLEVBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEVBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLHlCQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxHQUFBLENBQUEsNkJBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxXQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGVBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxnQ0FBQSxDQUFBLENBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsUUFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLFlBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxTQUFBLElBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBO0FBQ0EsVUFBQSxHQUFBLEdBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxlQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7S0FDQTtBQUNBLGNBQUEsQ0FBQSxZQUFBO0FBQ0EsYUFBQSxDQUFBLEdBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7T0FDQSxFQUFBLEVBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsSUFBQSxFQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsUUFBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxLQUFBLElBQUEsQ0FBQSxDQUFBLEVBQUE7QUFDQSxTQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7S0FDQSxNQUFBO0FBQ0EsU0FBQSxDQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxRQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUEsTUFBQSxJQUFBLENBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7S0FDQSxNQUFBO0FBQ0EsV0FBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsR0FBQSxDQUFBLHVCQUFBLEVBQUEsS0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLGVBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLGVBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7T0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxxQkFBQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxVQUFBLENBQUEsMEJBQUEsR0FBQSxVQUFBLENBQUEsR0FBQSxHQUFBLEdBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLGVBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsZUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSx1QkFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsVUFBQSxDQUFBLDJCQUFBLEdBQUEsVUFBQSxDQUFBLEdBQUEsR0FBQSxHQUFBLEdBQUEsVUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFVBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxlQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGVBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsd0JBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ25LQSxHQUFBLENBQUEsT0FBQSxDQUFBLGVBQUEsRUFBQSxZQUFBO0FBQ0EsU0FBQTtBQUNBLGFBQUEsRUFBQSxtQkFBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUEsbUNBQUEsR0FBQSxHQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLFFBQUEsQ0FBQSxjQUFBLENBQUEsR0FBQSxDQUFBLE9BQUEsR0FBQSxRQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLEtBQUE7QUFDQSxpQkFBQSxFQUFBLEdBQUE7T0FDQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNWQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFlBQUE7QUFDQSxlQUFBLEVBQUEsNkJBQUE7QUFDQSxjQUFBLEVBQUEscUJBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBR0EsR0FBQSxDQUFBLFVBQUEsQ0FBQSxxQkFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFdBQUEsRUFBQTs7QUFFQSxRQUFBLENBQUEsWUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsTUFBQSxJQUFBLEdBQUEsVUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLE1BQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0dBQ0E7QUFDQSxRQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsV0FBQSxHQUFBLElBQUEsQ0FBQSxXQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFFBQUEsR0FBQSxjQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQSxDQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLElBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtHQUVBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQSxlQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxxQkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLE9BQUEsR0FBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQTtBQUNBLFFBQUEsS0FBQSxHQUFBLElBQUEsSUFBQSxFQUFBLENBQUE7QUFDQSxRQUFBLEtBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxLQUFBLENBQUEsUUFBQSxFQUFBLEdBQUEsSUFBQSxFQUFBLE9BQUE7QUFDQSxVQUFBLENBQUEsV0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsV0FBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFlBQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsU0FBQSxHQUFBLFdBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxTQUFBLElBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxPQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxhQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFNBQUEsR0FBQTtBQUNBLGlCQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBO0FBQ0EsV0FBQSxFQUFBLE9BQUE7QUFDQSxZQUFBLEVBQUEsS0FBQTtPQUNBLENBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtLQUNBLE1BQUE7QUFDQSxZQUFBLENBQUEsWUFBQSxHQUFBLG9DQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLG9DQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLEtBQUE7QUFDQSxpQkFBQSxFQUFBLEdBQUE7T0FDQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsWUFBQSxHQUFBLFNBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFNBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLHlCQUFBLEVBQUE7QUFDQSxTQUFBLEVBQUEsTUFBQSxDQUFBLFlBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsWUFBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLFFBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBO0FBQ0EsaUJBQUEsRUFBQSxLQUFBO0FBQ0EsaUJBQUEsRUFBQSxHQUFBO09BQ0EsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsR0FBQSxRQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsV0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsV0FBQSxVQUFBLENBQUEsY0FBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxHQUFBLEdBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxXQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxpQkFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7QUFDQSxtQkFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsd0JBQUEsQ0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0EsTUFBQTtBQUNBLFVBQUEsV0FBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7QUFDQSxpQkFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EsVUFBQSxNQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsbUJBQUEsQ0FBQSxDQUFBO0tBQ0EsTUFBQTtBQUNBLFVBQUEsTUFBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLGFBQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxFQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsZUFBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxjQUFBLFdBQUEsR0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLG1CQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxDQUFBO1dBQ0EsQ0FBQSxDQUFBO0FBQ0EscUJBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7T0FDQSxNQUFBO0FBQ0EsY0FBQSxDQUFBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsYUFBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLEVBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxlQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsV0FBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsbUJBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLENBQUE7V0FDQSxDQUFBLENBQUE7QUFDQSxxQkFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsc0JBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0E7S0FDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFNBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFNBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsRUFBQSxPQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxZQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxHQUFBLENBQUEsaUNBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQTtBQUNBLG9CQUFBLEVBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBO0FBQ0EsYUFBQSxFQUFBLGNBQUE7T0FDQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsY0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxPQUFBLEdBQUEsNkNBQUEsR0FBQSxNQUFBLENBQUEsWUFBQSxHQUFBLGFBQUEsR0FBQSxNQUFBLENBQUEsY0FBQSxDQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTs7Ozs7O0FBTUEsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsUUFBQSxLQUFBLElBQUEsQ0FBQSxFQUFBLE9BQUE7QUFDQSxRQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsY0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFFBQUEsS0FBQSxJQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLEVBQUEsT0FBQTtBQUNBLFFBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7OztBQWdCQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxjQUFBLENBQUEsWUFBQTtBQUNBLFlBQUEsQ0FBQSxXQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLE1BQUEsQ0FBQSxtQ0FBQSxHQUFBLEdBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxpQkFBQSxFQUFBLFFBQUEsQ0FBQSxjQUFBLENBQUEsR0FBQSxDQUFBLE9BQUEsR0FBQSxRQUFBLENBQUE7QUFDQSxtQkFBQSxFQUFBLEtBQUE7QUFDQSxtQkFBQSxFQUFBLEdBQUE7U0FDQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7S0FDQSxFQUFBLEVBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsY0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFlBQUE7QUFDQSxXQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLE1BQUEsQ0FBQSxtQ0FBQSxHQUFBLE1BQUEsRUFBQTtBQUNBLGlCQUFBLEVBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxNQUFBLEdBQUEsUUFBQSxDQUFBO0FBQ0EsbUJBQUEsRUFBQSxLQUFBO0FBQ0EsbUJBQUEsRUFBQSxHQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0EsRUFBQSxFQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7QUFDQSxNQUFBLE1BQUEsQ0FBQSxPQUFBLElBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7R0FDQTtBQUNBLFFBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxTQUFBLGNBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxNQUFBLFFBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxNQUFBLEtBQUEsR0FBQSxJQUFBLElBQUEsRUFBQSxDQUFBO0FBQ0EsT0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxJQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxVQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsU0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0tBQ0E7QUFDQSxhQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsRUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0dBQ0E7QUFDQSxTQUFBLFFBQUEsQ0FBQTtDQUNBO0FDdFRBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxZQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsU0FBQTtBQUNBLGVBQUEsRUFBQSw0QkFBQTtBQUNBLGNBQUEsRUFBQSxzQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLHNCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUE7O0FBRUEsUUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFNBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLHlCQUFBLEVBQUE7QUFDQSxTQUFBLEVBQUEsTUFBQSxDQUFBLEdBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxRQUFBLENBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsS0FBQTtBQUNBLGlCQUFBLEVBQUEsR0FBQTtPQUNBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxHQUFBLFFBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsS0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsMkJBQUEsQ0FBQSxDQUFBO0tBQ0EsTUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBO0tBQ0EsTUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLElBQUEsQ0FBQSxrQkFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsS0FBQTtBQUNBLGVBQUEsRUFBQSxNQUFBLENBQUEsVUFBQSxDQUFBLE9BQUE7QUFDQSxZQUFBLEVBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBO0FBQ0EsYUFBQSxFQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsS0FBQTtBQUNBLGdCQUFBLEVBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBO0FBQ0Esa0JBQUEsRUFBQSxFQUFBO0FBQ0Esa0JBQUEsRUFBQSxFQUFBO09BQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGVBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSx5REFBQSxDQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO09BQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsK0JBQUEsQ0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDaEVBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxlQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsZ0NBQUE7QUFDQSxlQUFBLEVBQUEsd0NBQUE7QUFDQSxjQUFBLEVBQUEsc0JBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLGdCQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsNkNBQUE7QUFDQSxlQUFBLEVBQUEsd0NBQUE7QUFDQSxjQUFBLEVBQUEsc0JBQUE7R0FtQkEsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsc0JBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxZQUFBLEVBQUEsV0FBQSxFQUFBO0FBQ0EsUUFBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUE7O0FBR0EsUUFBQSxDQUFBLGFBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxNQUFBLFlBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsYUFBQSxHQUFBLElBQUEsQ0FBQTtHQUNBOzs7QUFHQSxRQUFBLENBQUEsUUFBQSxHQUFBO0FBQ0EsWUFBQSxFQUFBLEtBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsWUFBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLEdBQUEsQ0FBQSxzQ0FBQSxHQUFBLFlBQUEsQ0FBQSxVQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLFFBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsUUFBQSxHQUFBLFFBQUEsQ0FBQTtTQUNBLE1BQUE7QUFDQSxnQkFBQSxDQUFBLFFBQUEsR0FBQSxFQUFBLENBQUE7U0FDQTtPQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLDhCQUFBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBLE1BQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7O0FBR0EsUUFBQSxDQUFBLElBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLDJCQUFBLEVBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSx1QkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7OztBQWdCQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBO0tBQ0EsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDMUdBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxnQkFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLDRCQUFBO0FBQ0EsZUFBQSxFQUFBLDRDQUFBO0FBQ0EsY0FBQSxFQUFBLDBCQUFBO0FBQ0EsV0FBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLG1CQUFBLEtBQUEsRUFBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSwwQkFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGNBQUEsUUFBQSxFQUFBO0FBQ0EsbUJBQUEsUUFBQSxDQUFBO1dBQ0EsTUFBQTtBQUNBLG1CQUFBO0FBQ0EscUJBQUEsRUFBQSxnQkFBQTthQUNBLENBQUE7V0FDQTtTQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsZUFBQSxDQUFBLDhCQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBO0tBQ0E7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSwwQkFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFdBQUEsRUFBQSxTQUFBLEVBQUE7QUFDQSxRQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsU0FBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXVCQSxRQUFBLENBQUEsSUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsMEJBQUEsRUFBQSxNQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxnQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQkEsUUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxHQUFBLFFBQUEsQ0FBQTtLQUNBLENBQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ3ZGQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFdBQUE7QUFDQSxlQUFBLEVBQUEsZ0RBQUE7QUFDQSxjQUFBLEVBQUEseUJBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSx5QkFBQSxFQUFBLENBQUEsWUFBQSxFQUNBLFFBQUEsRUFDQSxRQUFBLEVBQ0EsT0FBQSxFQUNBLFdBQUEsRUFDQSxTQUFBLEVBQ0Esc0JBQUEsRUFDQSxVQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxTQUFBLEVBQUEsT0FBQSxFQUFBLG9CQUFBLEVBQUE7Ozs7QUFJQSxNQUFBLE9BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxNQUFBLEtBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxNQUFBLFNBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxNQUFBLFNBQUEsR0FBQSxJQUFBLENBQUE7Ozs7QUFJQSxRQUFBLENBQUEsU0FBQSxHQUFBO0FBQ0EsYUFBQSxFQUFBLHNCQUFBO0FBQ0EsWUFBQSxFQUFBLGFBQUE7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLGVBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtLQUNBLE1BQUE7QUFDQSxlQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLG1CQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFNBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsaUJBQUEsR0FBQSw4QkFBQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLGdCQUFBLEdBQUEsWUFBQTs7QUFFQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUEsT0FBQSxHQUFBLFNBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUE7QUFDQSx3QkFBQSxDQUNBLFNBQUEsRUFBQSxDQUNBLElBQUEsQ0FBQSxNQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsa0JBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxvQkFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLGdCQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsUUFBQSxDQUFBLFNBQ0EsQ0FBQSx1QkFBQSxDQUFBLENBQUE7O0FBRUEsYUFBQSxNQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLENBQUEsVUFBQSxDQUFBO0FBQ0EsaUJBQUEsRUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFFBQUE7QUFDQSxvQkFBQSxFQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQTtBQUNBLGFBQUEsRUFBQSxjQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxrQkFBQSxHQUFBO0FBQ0EsYUFBQSxvQkFBQSxDQUFBLGdCQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLG9CQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsV0FBQSxHQUFBO0FBQ0EsZ0JBQUEsRUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLFFBQUE7QUFDQSxtQkFBQSxFQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsV0FBQTtBQUNBLGtCQUFBLEVBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBO0FBQ0EsYUFBQSxFQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQTtBQUNBLGtCQUFBLEVBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBO09BQ0EsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLGVBQUE7QUFDQSw0QkFBQSxFQUFBLE1BQUEsR0FBQSxLQUFBLENBQUEsVUFBQSxHQUFBLEdBQUE7QUFDQSw2QkFBQSxFQUFBLFdBQUE7QUFDQSwyQkFBQSxFQUFBLE9BQUE7U0FDQSxDQUFBO09BQ0EsQ0FBQTtBQUNBLGFBQUEsb0JBQUEsQ0FBQSxZQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLGdCQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxlQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLE9BQUE7QUFDQSxhQUFBLEVBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBO0FBQ0EsbUJBQUEsRUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxnQkFBQSxFQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsUUFBQTtPQUNBLENBQUE7QUFDQSxZQUFBLENBQUEsaUJBQUEsR0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUE7O0FBRUEsWUFBQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUE7O0FBRUEsWUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTs7QUFFQSxhQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxHQUFBLFNBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsUUFBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLGVBQUEsR0FBQSxNQUFBLENBQUE7O0tBRUE7O0FBRUEsYUFBQSx1QkFBQSxHQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7OztBQUtBLFFBQUEsQ0FBQSxhQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFNBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBLGlDQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxRQUFBLENBQUEsVUFBQSxDQUFBO0FBQ0EsaUJBQUEsRUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFFBQUE7QUFDQSxvQkFBQSxFQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQTtBQUNBLGFBQUEsRUFBQSxjQUFBO09BQ0EsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGNBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtBQUNBLGFBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxZQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsWUFBQSxDQUFBLFNBQ0EsQ0FBQSxlQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLFlBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLEdBQUE7QUFDQSxhQUFBLEVBQUEsR0FBQSxDQUFBLFdBQUE7QUFDQSxlQUFBLEVBQUEsU0FBQSxDQUFBLE9BQUE7QUFDQSxnQkFBQSxFQUFBLFNBQUEsQ0FBQSxRQUFBO0FBQ0Esa0JBQUEsRUFBQSxLQUFBLENBQUEsVUFBQTtPQUNBLENBQUE7QUFDQSxhQUFBLG9CQUFBLENBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxZQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxLQUFBLENBQUEsV0FBQSxJQUFBLEtBQUEsQ0FBQSxXQUFBLEtBQUEsRUFBQSxFQUFBO0FBQ0EsZUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsS0FBQSxDQUFBLFdBQUEsQ0FBQTtPQUNBLE1BQUEsSUFBQSxTQUFBLENBQUEsV0FBQSxJQUFBLE9BQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxlQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxTQUFBLENBQUEsV0FBQSxHQUFBLGFBQUEsR0FBQSxNQUFBLENBQUEsY0FBQSxHQUFBLGVBQUEsR0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO09BQ0EsTUFBQTtBQUNBLGNBQUEsQ0FBQSxTQUFBLEdBQUEscUNBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxtQkFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtPQUNBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLGVBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsa0NBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQTtHQUVBLENBQUE7Q0FDQSxDQUNBLENBQUEsQ0FBQTtBQzNLQSxHQUFBLENBQUEsT0FBQSxDQUFBLHNCQUFBLEVBQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsV0FBQSxnQkFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSw4QkFBQSxHQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsV0FBQSxZQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLHlCQUFBLEVBQUE7QUFDQSxTQUFBLEVBQUEsSUFBQSxDQUFBLFFBQUE7S0FDQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLFlBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsb0JBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEsU0FBQSxHQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGtDQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFNBQUE7QUFDQSxvQkFBQSxFQUFBLGdCQUFBO0FBQ0EsZ0JBQUEsRUFBQSxZQUFBO0FBQ0EsZ0JBQUEsRUFBQSxZQUFBO0FBQ0EsYUFBQSxFQUFBLFNBQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBLENBQUE7QUMxQkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQ0EsS0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLHlCQUFBO0FBQ0EsY0FBQSxFQUFBLGdCQUFBO0dBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsUUFBQTtBQUNBLGVBQUEsRUFBQSwwQkFBQTtBQUNBLGNBQUEsRUFBQSxnQkFBQTtHQUNBLENBQUEsQ0FDQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFdBQUE7QUFDQSxlQUFBLEVBQUEsNkJBQUE7QUFDQSxjQUFBLEVBQUEsZ0JBQUE7R0FDQSxDQUFBLENBQ0EsS0FBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxlQUFBO0FBQ0EsZUFBQSxFQUFBLGlDQUFBO0FBQ0EsY0FBQSxFQUFBLGdCQUFBO0dBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsT0FBQTtBQUNBLGVBQUEsRUFBQSx5QkFBQTtBQUNBLGNBQUEsRUFBQSxnQkFBQTtHQUNBLENBQUEsQ0FDQSxLQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFFBQUE7QUFDQSxlQUFBLEVBQUEsMEJBQUE7QUFDQSxjQUFBLEVBQUEsZ0JBQUE7R0FDQSxDQUFBLENBQ0EsS0FBQSxDQUFBLFNBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxVQUFBO0FBQ0EsZUFBQSxFQUFBLDRCQUFBO0FBQ0EsY0FBQSxFQUFBLGdCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsZ0JBQUEsRUFBQSxDQUFBLFlBQUEsRUFDQSxRQUFBLEVBQ0EsUUFBQSxFQUNBLE9BQUEsRUFDQSxXQUFBLEVBQ0EsU0FBQSxFQUNBLGFBQUEsRUFDQSxVQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxTQUFBLEVBQUEsT0FBQSxFQUFBLFdBQUEsRUFBQTs7QUFFQSxRQUFBLENBQUEsY0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLElBQUEsR0FBQTtBQUNBLGVBQUEsRUFBQSxLQUFBO0FBQ0EsZUFBQSxFQUFBLEtBQUE7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLGVBQUEsRUFBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEtBQUE7S0FDQTtBQUNBLGVBQUEsRUFBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEtBQUE7S0FDQTtHQUNBLENBQUE7Ozs7QUFJQSxRQUFBLENBQUEscUJBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLGlCQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxLQUFBO09BQ0E7S0FDQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBOztBQUVBLFVBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxHQUFBO0FBQ0EsU0FBQSxFQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsS0FBQTtLQUNBLENBQUE7O0FBRUEsZUFBQSxDQUNBLGVBQUEsQ0FBQSxNQUFBLENBQUEsY0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLHVCQUFBLENBQUEsU0FDQSxDQUFBLG9CQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLHVCQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxHQUFBLENBQUEsTUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxjQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsSUFBQSxDQUFBO09BQ0E7S0FDQTs7QUFFQSxhQUFBLG9CQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxHQUFBLENBQUEsTUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxHQUFBO0FBQ0EsYUFBQSxFQUFBLHVCQUFBO0FBQ0EsaUJBQUEsRUFBQSxJQUFBO1NBQ0EsQ0FBQTtBQUNBLGVBQUE7T0FDQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxHQUFBO0FBQ0EsV0FBQSxFQUFBLGtDQUFBO0FBQ0EsZUFBQSxFQUFBLElBQUE7T0FDQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOzs7Ozs7QUFNQSxRQUFBLENBQUEsaUJBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLGlCQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxLQUFBO09BQ0E7S0FDQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsZUFBQSxDQUNBLGVBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLG1CQUFBLENBQUEsU0FDQSxDQUFBLGdCQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLG1CQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxHQUFBLENBQUEsTUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsSUFBQSxDQUFBO09BQ0E7S0FDQTs7QUFFQSxhQUFBLGdCQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxHQUFBLENBQUEsTUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxHQUFBO0FBQ0EsYUFBQSxFQUFBLHVCQUFBO0FBQ0EsaUJBQUEsRUFBQSxJQUFBO1NBQ0EsQ0FBQTtBQUNBLGVBQUE7T0FDQTs7QUFFQSxZQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsR0FBQTtBQUNBLFdBQUEsRUFBQSxrQ0FBQTtBQUNBLGVBQUEsRUFBQSxJQUFBO09BQ0EsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7O0NBR0EsQ0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLEVBQUEsVUFBQSxPQUFBLEVBQUE7QUFDQSxTQUFBO0FBQ0EsWUFBQSxFQUFBLElBQUE7QUFDQSxRQUFBLEVBQUEsY0FBQSxNQUFBLEVBQUEsUUFBQSxFQUFBO0FBQ0EsVUFBQSxHQUFBLEdBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsU0FBQSxHQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxTQUFBLENBQUE7O0FBRUEsZUFBQSxZQUFBLEdBQUE7O0FBRUEsWUFBQSxPQUFBLENBQUEsV0FBQSxHQUFBLFNBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsRUFBQSxPQUFBLENBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsRUFBQSxNQUFBLENBQUEsQ0FBQTtTQUNBLE1BQUE7QUFDQSxrQkFBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLEVBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUFBLENBQUE7U0FDQTtPQUNBOztBQUVBLFlBQUEsQ0FBQSxHQUFBLENBQUEsbUJBQUEsRUFBQSxZQUFBO0FBQ0EsV0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLEVBQUEsWUFBQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxZQUFBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUNwTEEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsV0FBQSxlQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLHVCQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLGVBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsdUJBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFNBQUE7QUFDQSxtQkFBQSxFQUFBLGVBQUE7QUFDQSxtQkFBQSxFQUFBLGVBQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBLENBQUE7O0FDaEJBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsVUFBQTtBQUNBLGVBQUEsRUFBQSwrQkFBQTtBQUNBLGNBQUEsRUFBQSxtQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLG1CQUFBLEVBQUEsQ0FBQSxZQUFBLEVBQ0EsUUFBQSxFQUNBLFFBQUEsRUFDQSxPQUFBLEVBQ0EsV0FBQSxFQUNBLFNBQUEsRUFDQSxnQkFBQSxFQUNBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsY0FBQSxFQUFBOztBQUVBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxPQUFBLEVBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxLQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLElBQUEsR0FBQSxJQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0EsU0FBQSxJQUFBLElBQUEsSUFBQSxNQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0E7QUFDQSxrQkFBQSxDQUNBLFdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsZUFBQSxDQUFBLFNBQ0EsQ0FBQSxVQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLGVBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsR0FBQSxDQUFBLE1BQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsR0FBQSxxREFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxlQUFBLENBQUEsT0FBQSxDQUFBLG9CQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxlQUFBO09BQ0E7QUFDQSxZQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsR0FBQSxvREFBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxVQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLEdBQUEsQ0FBQSxNQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLGlCQUFBLEVBQUEsSUFBQTtBQUNBLGFBQUEsRUFBQSxHQUFBLENBQUEsSUFBQTtTQUNBLENBQUE7QUFDQSxlQUFBO09BQ0E7QUFDQSxZQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLElBQUE7QUFDQSxXQUFBLEVBQUEsb0RBQUE7T0FDQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBLENBQUE7O0FDOURBLEdBQUEsQ0FBQSxPQUFBLENBQUEsZ0JBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxXQUFBLFdBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsRUFBQSxNQUFBO0FBQ0EsU0FBQSxFQUFBLGNBQUE7QUFDQSxhQUFBLEVBQUEsRUFBQSxjQUFBLEVBQUEsU0FBQSxFQUFBO0FBQ0Esc0JBQUEsRUFBQSxPQUFBLENBQUEsUUFBQTtBQUNBLFVBQUEsRUFBQSxJQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsU0FBQTtBQUNBLGVBQUEsRUFBQSxXQUFBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQSxDQUFBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG53aW5kb3cuYXBwID0gYW5ndWxhci5tb2R1bGUoJ0Z1bGxzdGFja0dlbmVyYXRlZEFwcCcsIFsnZnNhUHJlQnVpbHQnLCAndWkucm91dGVyJywgJ3VpLmJvb3RzdHJhcCcsICduZ0FuaW1hdGUnXSk7XG5cbmFwcC5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIsICR1aVZpZXdTY3JvbGxQcm92aWRlcikge1xuICAgIC8vIFRoaXMgdHVybnMgb2ZmIGhhc2hiYW5nIHVybHMgKC8jYWJvdXQpIGFuZCBjaGFuZ2VzIGl0IHRvIHNvbWV0aGluZyBub3JtYWwgKC9hYm91dClcbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG4gICAgLy8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuICAgICR1aVZpZXdTY3JvbGxQcm92aWRlci51c2VBbmNob3JTY3JvbGwoKTtcbn0pO1xuXG4vLyBUaGlzIGFwcC5ydW4gaXMgZm9yIGNvbnRyb2xsaW5nIGFjY2VzcyB0byBzcGVjaWZpYyBzdGF0ZXMuXG5hcHAucnVuKGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgJHN0YXRlLCAkdWlWaWV3U2Nyb2xsKSB7XG4gICAgLy8gVGhlIGdpdmVuIHN0YXRlIHJlcXVpcmVzIGFuIGF1dGhlbnRpY2F0ZWQgdXNlci5cbiAgICB2YXIgZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgICAgICByZXR1cm4gc3RhdGUuZGF0YSAmJiBzdGF0ZS5kYXRhLmF1dGhlbnRpY2F0ZTtcbiAgICB9O1xuXG4gICAgLy8gJHN0YXRlQ2hhbmdlU3RhcnQgaXMgYW4gZXZlbnQgZmlyZWRcbiAgICAvLyB3aGVuZXZlciB0aGUgcHJvY2VzcyBvZiBjaGFuZ2luZyBhIHN0YXRlIGJlZ2lucy5cbiAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbiAoZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zKSB7XG5cbiAgICAgICAgaWYgKCFkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBdXRoKHRvU3RhdGUpKSB7XG4gICAgICAgICAgICAvLyBUaGUgZGVzdGluYXRpb24gc3RhdGUgZG9lcyBub3QgcmVxdWlyZSBhdXRoZW50aWNhdGlvblxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuICAgICAgICAgICAgLy8gVGhlIHVzZXIgaXMgYXV0aGVudGljYXRlZC5cbiAgICAgICAgICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDYW5jZWwgbmF2aWdhdGluZyB0byBuZXcgc3RhdGUuXG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgLy8gSWYgYSB1c2VyIGlzIHJldHJpZXZlZCwgdGhlbiByZW5hdmlnYXRlIHRvIHRoZSBkZXN0aW5hdGlvblxuICAgICAgICAgICAgLy8gKHRoZSBzZWNvbmQgdGltZSwgQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkgd2lsbCB3b3JrKVxuICAgICAgICAgICAgLy8gb3RoZXJ3aXNlLCBpZiBubyB1c2VyIGlzIGxvZ2dlZCBpbiwgZ28gdG8gXCJsb2dpblwiIHN0YXRlLlxuICAgICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgICAgICAkc3RhdGUuZ28odG9TdGF0ZS5uYW1lLCB0b1BhcmFtcyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICB9KTtcblxufSk7XG5cblxuYXBwLmRpcmVjdGl2ZSgnZmlsZXJlYWQnLCBbZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBmaWxlcmVhZDogJz0nXG4gICAgICAgIH0sXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cmlidXRlcykge1xuICAgICAgICAgICAgZWxlbWVudC5iaW5kKCdjaGFuZ2UnLCBmdW5jdGlvbiAoY2hhbmdlRXZlbnQpIHtcbiAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjaGFuZ2VFdmVudC50YXJnZXQuZmlsZXNbMF0pO1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5maWxlcmVhZCA9IGNoYW5nZUV2ZW50LnRhcmdldC5maWxlc1swXTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufV0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZGF0YWJhc2UnLCB7XG4gICAgdXJsOiAnL2FkbWluL2RhdGFiYXNlJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2RhdGFiYXNlL2RhdGFiYXNlLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdEYXRhYmFzZUNvbnRyb2xsZXInXG4gIH0pO1xufSk7XG5cbmFwcC5kaXJlY3RpdmUoJ25vdGlmaWNhdGlvbkJhcicsIFsnc29ja2V0JywgZnVuY3Rpb24oc29ja2V0KSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgc2NvcGU6IHRydWUsXG4gICAgdGVtcGxhdGU6ICc8ZGl2IHN0eWxlPVwibWFyZ2luOiAwIGF1dG87d2lkdGg6NTAlXCIgbmctc2hvdz1cImJhci52aXNpYmxlXCI+JyArXG4gICAgICAnPHVpYi1wcm9ncmVzcz48dWliLWJhciB2YWx1ZT1cImJhci52YWx1ZVwiIHR5cGU9XCJ7e2Jhci50eXBlfX1cIj48c3Bhbj57e2Jhci52YWx1ZX19JTwvc3Bhbj48L3VpYi1iYXI+PC91aWItcHJvZ3Jlc3M+JyArXG4gICAgICAnPC9kaXY+JyxcbiAgICBsaW5rOiBmdW5jdGlvbigkc2NvcGUsIGlFbG0sIGlBdHRycywgY29udHJvbGxlcikge1xuICAgICAgc29ja2V0Lm9uKCdub3RpZmljYXRpb24nLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBwZXJjZW50YWdlID0gcGFyc2VJbnQoTWF0aC5mbG9vcihkYXRhLmNvdW50ZXIgLyBkYXRhLnRvdGFsICogMTAwKSwgMTApO1xuICAgICAgICAkc2NvcGUuYmFyLnZhbHVlID0gcGVyY2VudGFnZTtcbiAgICAgICAgaWYgKHBlcmNlbnRhZ2UgPT09IDEwMCkge1xuICAgICAgICAgICRzY29wZS5iYXIudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICRzY29wZS5iYXIudmFsdWUgPSAwO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XSk7XG5cbmFwcC5jb250cm9sbGVyKCdEYXRhYmFzZUNvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsIEF1dGhTZXJ2aWNlLCBzb2NrZXQpIHtcbiAgJHNjb3BlLmFkZFVzZXIgPSB7fTtcbiAgJHNjb3BlLnF1ZXJ5ID0ge307XG4gICRzY29wZS50cmRVc3JRdWVyeSA9IHt9O1xuICAkc2NvcGUucXVlcnlDb2xzID0gW3tcbiAgICBuYW1lOiAndXNlcm5hbWUnLFxuICAgIHZhbHVlOiAndXNlcm5hbWUnXG4gIH0sIHtcbiAgICBuYW1lOiAnZ2VucmUnLFxuICAgIHZhbHVlOiAnZ2VucmUnXG4gIH0sIHtcbiAgICBuYW1lOiAnbmFtZScsXG4gICAgdmFsdWU6ICduYW1lJ1xuICB9LCB7XG4gICAgbmFtZTogJ1VSTCcsXG4gICAgdmFsdWU6ICdzY1VSTCdcbiAgfSwge1xuICAgIG5hbWU6ICdlbWFpbCcsXG4gICAgdmFsdWU6ICdlbWFpbCdcbiAgfSwge1xuICAgIG5hbWU6ICdkZXNjcmlwdGlvbicsXG4gICAgdmFsdWU6ICdkZXNjcmlwdGlvbidcbiAgfSwge1xuICAgIG5hbWU6ICdmb2xsb3dlcnMnLFxuICAgIHZhbHVlOiAnZm9sbG93ZXJzJ1xuICB9LCB7XG4gICAgbmFtZTogJ251bWJlciBvZiB0cmFja3MnLFxuICAgIHZhbHVlOiAnbnVtVHJhY2tzJ1xuICB9LCB7XG4gICAgbmFtZTogJ2ZhY2Vib29rJyxcbiAgICB2YWx1ZTogJ2ZhY2Vib29rVVJMJ1xuICB9LCB7XG4gICAgbmFtZTogJ2luc3RhZ3JhbScsXG4gICAgdmFsdWU6ICdpbnN0YWdyYW1VUkwnXG4gIH0sIHtcbiAgICBuYW1lOiAndHdpdHRlcicsXG4gICAgdmFsdWU6ICd0d2l0dGVyVVJMJ1xuICB9LCB7XG4gICAgbmFtZTogJ3lvdXR1YmUnLFxuICAgIHZhbHVlOiAneW91dHViZVVSTCdcbiAgfSwge1xuICAgIG5hbWU6ICd3ZWJzaXRlcycsXG4gICAgdmFsdWU6ICd3ZWJzaXRlcydcbiAgfSwge1xuICAgIG5hbWU6ICdhdXRvIGVtYWlsIGRheScsXG4gICAgdmFsdWU6ICdlbWFpbERheU51bSdcbiAgfSwge1xuICAgIG5hbWU6ICdhbGwgZW1haWxzJyxcbiAgICB2YWx1ZTogJ2FsbEVtYWlscydcbiAgfV07XG4gICRzY29wZS5kb3dubG9hZEJ1dHRvblZpc2libGUgPSBmYWxzZTtcbiAgJHNjb3BlLnRyYWNrID0ge1xuICAgIHRyYWNrVXJsOiAnJyxcbiAgICBkb3dubG9hZFVybDogJycsXG4gICAgZW1haWw6ICcnXG4gIH07XG4gICRzY29wZS5iYXIgPSB7XG4gICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgIHZhbHVlOiAwLFxuICAgIHZpc2libGU6IGZhbHNlXG4gIH07XG4gICRzY29wZS5wYWlkUmVwb3N0ID0ge1xuICAgIHNvdW5kQ2xvdWRVcmw6ICcnXG4gIH07XG5cbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICRodHRwLmdldCgnL2FwaS9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2FkbWluJztcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICBhbGVydCgnV3JvbmcgUGFzc3dvcmQnKTtcbiAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5zYXZlQWRkVXNlciA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkc2NvcGUuYWRkVXNlci5wYXNzd29yZCA9ICRyb290U2NvcGUucGFzc3dvcmQ7XG4gICAgJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS9hZGR1c2VyJywgJHNjb3BlLmFkZFVzZXIpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgYWxlcnQoXCJTdWNjZXNzOiBEYXRhYmFzZSBpcyBiZWluZyBwb3B1bGF0ZWQuIFlvdSB3aWxsIGJlIGVtYWlsZWQgd2hlbiBpdCBpcyBjb21wbGV0ZS5cIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5iYXIudmlzaWJsZSA9IHRydWU7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgICBhbGVydCgnQmFkIHN1Ym1pc3Npb24nKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmNyZWF0ZVVzZXJRdWVyeURvYyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBxdWVyeSA9IHt9O1xuICAgIGlmICgkc2NvcGUucXVlcnkuYXJ0aXN0ID09IFwiYXJ0aXN0c1wiKSB7XG4gICAgICBxdWVyeS5hcnRpc3QgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoJHNjb3BlLnF1ZXJ5LmFydGlzdCA9PSBcIm5vbi1hcnRpc3RzXCIpIHtcbiAgICAgIHF1ZXJ5LmFydGlzdCA9IGZhbHNlO1xuICAgIH1cbiAgICB2YXIgZmx3clFyeSA9IHt9O1xuICAgIGlmICgkc2NvcGUucXVlcnkuZm9sbG93ZXJzR1QpIHtcbiAgICAgIGZsd3JRcnkuJGd0ID0gJHNjb3BlLnF1ZXJ5LmZvbGxvd2Vyc0dUO1xuICAgICAgcXVlcnkuZm9sbG93ZXJzID0gZmx3clFyeTtcbiAgICB9XG4gICAgaWYgKCRzY29wZS5xdWVyeS5mb2xsb3dlcnNMVCkge1xuICAgICAgZmx3clFyeS4kbHQgPSAkc2NvcGUucXVlcnkuZm9sbG93ZXJzTFQ7XG4gICAgICBxdWVyeS5mb2xsb3dlcnMgPSBmbHdyUXJ5O1xuICAgIH1cbiAgICBpZiAoJHNjb3BlLnF1ZXJ5LmdlbnJlKSBxdWVyeS5nZW5yZSA9ICRzY29wZS5xdWVyeS5nZW5yZTtcbiAgICBpZiAoJHNjb3BlLnF1ZXJ5Q29scykge1xuICAgICAgcXVlcnkuY29sdW1ucyA9ICRzY29wZS5xdWVyeUNvbHMuZmlsdGVyKGZ1bmN0aW9uKGVsbSkge1xuICAgICAgICByZXR1cm4gZWxtLnZhbHVlICE9PSBudWxsO1xuICAgICAgfSkubWFwKGZ1bmN0aW9uKGVsbSkge1xuICAgICAgICByZXR1cm4gZWxtLnZhbHVlO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGlmICgkc2NvcGUucXVlcnkudHJhY2tlZFVzZXJzVVJMKSBxdWVyeS50cmFja2VkVXNlcnNVUkwgPSAkc2NvcGUucXVlcnkudHJhY2tlZFVzZXJzVVJMO1xuICAgIHZhciBib2R5ID0ge1xuICAgICAgcXVlcnk6IHF1ZXJ5LFxuICAgICAgcGFzc3dvcmQ6ICRyb290U2NvcGUucGFzc3dvcmRcbiAgICB9O1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL2ZvbGxvd2VycycsIGJvZHkpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHNjb3BlLmZpbGVuYW1lID0gcmVzLmRhdGE7XG4gICAgICAgICRzY29wZS5kb3dubG9hZEJ1dHRvblZpc2libGUgPSB0cnVlO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBhbGVydChcIkVSUk9SOiBCYWQgUXVlcnkgb3IgTm8gTWF0Y2hlc1wiKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmNyZWF0ZVRyZFVzclF1ZXJ5RG9jID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHF1ZXJ5ID0ge307XG4gICAgdmFyIGZsd3JRcnkgPSB7fTtcbiAgICBpZiAoJHNjb3BlLnRyZFVzclF1ZXJ5LmZvbGxvd2Vyc0dUKSB7XG4gICAgICBmbHdyUXJ5LiRndCA9ICRzY29wZS50cmRVc3JRdWVyeS5mb2xsb3dlcnNHVDtcbiAgICAgIHF1ZXJ5LmZvbGxvd2VycyA9IGZsd3JRcnk7XG4gICAgfVxuICAgIGlmICgkc2NvcGUudHJkVXNyUXVlcnkuZm9sbG93ZXJzTFQpIHtcbiAgICAgIGZsd3JRcnkuJGx0ID0gJHNjb3BlLnRyZFVzclF1ZXJ5LmZvbGxvd2Vyc0xUO1xuICAgICAgcXVlcnkuZm9sbG93ZXJzID0gZmx3clFyeTtcbiAgICB9XG4gICAgaWYgKCRzY29wZS50cmRVc3JRdWVyeS5nZW5yZSkgcXVlcnkuZ2VucmUgPSAkc2NvcGUudHJkVXNyUXVlcnkuZ2VucmU7XG4gICAgdmFyIGJvZHkgPSB7XG4gICAgICBxdWVyeTogcXVlcnksXG4gICAgICBwYXNzd29yZDogJHJvb3RTY29wZS5wYXNzd29yZFxuICAgIH07XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvdHJhY2tlZFVzZXJzJywgYm9keSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUudHJkVXNyRmlsZW5hbWUgPSByZXMuZGF0YTtcbiAgICAgICAgJHNjb3BlLmRvd25sb2FkVHJkVXNyQnV0dG9uVmlzaWJsZSA9IHRydWU7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGFsZXJ0KFwiRVJST1I6IEJhZCBRdWVyeSBvciBObyBNYXRjaGVzXCIpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUuZG93bmxvYWQgPSBmdW5jdGlvbihmaWxlbmFtZSkge1xuICAgIHZhciBhbmNob3IgPSBhbmd1bGFyLmVsZW1lbnQoJzxhLz4nKTtcbiAgICBhbmNob3IuYXR0cih7XG4gICAgICBocmVmOiBmaWxlbmFtZSxcbiAgICAgIGRvd25sb2FkOiBmaWxlbmFtZVxuICAgIH0pWzBdLmNsaWNrKCk7XG4gICAgJHNjb3BlLmRvd25sb2FkQnV0dG9uVmlzaWJsZSA9IGZhbHNlO1xuICAgICRzY29wZS5kb3dubG9hZFRyZFVzckJ1dHRvblZpc2libGUgPSBmYWxzZTtcbiAgfVxuXG4gICRzY29wZS5kb3dubG9hZFVybENoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc2NvcGUudHJhY2sudHJhY2tVUkwgIT09ICcnKSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIHtcbiAgICAgICAgICB1cmw6ICRzY29wZS50cmFjay50cmFja1VSTFxuICAgICAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tJRCA9IHJlcy5kYXRhLmlkO1xuICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RJRCA9IHJlcy5kYXRhLnVzZXJfaWQ7XG4gICAgICAgICAgJHNjb3BlLnRyYWNrLmFydHdvcmtVUkwgPSByZXMuZGF0YS5hcnR3b3JrX3VybC5yZXBsYWNlKCdsYXJnZS5qcGcnLCAndDUwMHg1MDAuanBnJyk7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfSkudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tJRCA9IG51bGw7XG4gICAgICAgICAgJHNjb3BlLm5vdEZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAkc2NvcGUuc2F2ZURvd25sb2FkVXJsID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCEkc2NvcGUudHJhY2sucGxheWxpc3RJRCB8fCAhJHNjb3BlLnRyYWNrLmVtYWlsIHx8ICEkc2NvcGUudHJhY2suZG93bmxvYWRVUkwpIHtcbiAgICAgIGFsZXJ0KCdQbGVhc2UgZmlsbCBpbiBhbGwgZmllbGRzJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIGlmICghJHNjb3BlLnRyYWNrLnRyYWNrSUQpIHtcbiAgICAgIGFsZXJ0KCdUcmFjayBOb3QgRm91bmQnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvZG93bmxvYWR1cmwnLCAkc2NvcGUudHJhY2spXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHNjb3BlLnRyYWNrID0ge1xuICAgICAgICAgIHRyYWNrVVJMOiAnJyxcbiAgICAgICAgICBkb3dubG9hZFVSTDogJycsXG4gICAgICAgICAgZW1haWw6ICcnLFxuICAgICAgICAgIHBsYXlsaXN0SUQ6ICcnXG4gICAgICAgIH07XG4gICAgICAgIGFsZXJ0KFwiU1VDQ0VTUzogVXJsIHNhdmVkIHN1Y2Nlc3NmdWxseVwiKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgYWxlcnQoXCJFUlJPUjogRXJyb3IgaW4gc2F2aW5nIHVybFwiKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLnNhdmVQYWlkUmVwb3N0Q2hhbm5lbCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL3BhaWRyZXBvc3QnLCAkc2NvcGUucGFpZFJlcG9zdClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUucGFpZFJlcG9zdCA9IHtcbiAgICAgICAgICBzb3VuZENsb3VkVXJsOiAnJ1xuICAgICAgICB9O1xuICAgICAgICBhbGVydChcIlNVQ0NFU1M6IFVybCBzYXZlZCBzdWNjZXNzZnVsbHlcIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGFsZXJ0KFwiRVJST1I6IEVycm9yIGluIHNhdmluZyB1cmxcIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qIExpc3RlbiB0byBzb2NrZXQgZXZlbnRzICovXG5cbiAgc29ja2V0Lm9uKCdub3RpZmljYXRpb24nLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyIHBlcmNlbnRhZ2UgPSBwYXJzZUludChNYXRoLmZsb29yKGRhdGEuY291bnRlciAvIGRhdGEudG90YWwgKiAxMDApLCAxMCk7XG4gICAgJHNjb3BlLmJhci52YWx1ZSA9IHBlcmNlbnRhZ2U7XG4gICAgaWYgKHBlcmNlbnRhZ2UgPT09IDEwMCkge1xuICAgICAgJHNjb3BlLnN0YXR1c0JhclZpc2libGUgPSBmYWxzZTtcbiAgICAgICRzY29wZS5iYXIudmFsdWUgPSAwO1xuICAgIH1cbiAgfSk7XG59KTsiLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG4gICAgLy8gSG9wZSB5b3UgZGlkbid0IGZvcmdldCBBbmd1bGFyISBEdWgtZG95LlxuICAgIGlmICghd2luZG93LmFuZ3VsYXIpIHRocm93IG5ldyBFcnJvcignSSBjYW5cXCd0IGZpbmQgQW5ndWxhciEnKTtcblxuICAgIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnZnNhUHJlQnVpbHQnLCBbXSk7XG5cbiAgICBhcHAuZmFjdG9yeSgnaW5pdFNvY2tldCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXdpbmRvdy5pbykgdGhyb3cgbmV3IEVycm9yKCdzb2NrZXQuaW8gbm90IGZvdW5kIScpO1xuICAgICAgICByZXR1cm4gd2luZG93LmlvKHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pO1xuICAgIH0pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ3NvY2tldCcsIGZ1bmN0aW9uKCRyb290U2NvcGUsIGluaXRTb2NrZXQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG9uOiBmdW5jdGlvbihldmVudE5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgaW5pdFNvY2tldC5vbihldmVudE5hbWUsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShpbml0U29ja2V0LCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW1pdDogZnVuY3Rpb24oZXZlbnROYW1lLCBkYXRhLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGluaXRTb2NrZXQuZW1pdChldmVudE5hbWUsIGRhdGEsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShpbml0U29ja2V0LCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIC8vIEFVVEhfRVZFTlRTIGlzIHVzZWQgdGhyb3VnaG91dCBvdXIgYXBwIHRvXG4gICAgLy8gYnJvYWRjYXN0IGFuZCBsaXN0ZW4gZnJvbSBhbmQgdG8gdGhlICRyb290U2NvcGVcbiAgICAvLyBmb3IgaW1wb3J0YW50IGV2ZW50cyBhYm91dCBhdXRoZW50aWNhdGlvbiBmbG93LlxuICAgIGFwcC5jb25zdGFudCgnQVVUSF9FVkVOVFMnLCB7XG4gICAgICAgIGxvZ2luU3VjY2VzczogJ2F1dGgtbG9naW4tc3VjY2VzcycsXG4gICAgICAgIGxvZ2luRmFpbGVkOiAnYXV0aC1sb2dpbi1mYWlsZWQnLFxuICAgICAgICBsb2dvdXRTdWNjZXNzOiAnYXV0aC1sb2dvdXQtc3VjY2VzcycsXG4gICAgICAgIHNlc3Npb25UaW1lb3V0OiAnYXV0aC1zZXNzaW9uLXRpbWVvdXQnLFxuICAgICAgICBub3RBdXRoZW50aWNhdGVkOiAnYXV0aC1ub3QtYXV0aGVudGljYXRlZCcsXG4gICAgICAgIG5vdEF1dGhvcml6ZWQ6ICdhdXRoLW5vdC1hdXRob3JpemVkJ1xuICAgIH0pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ0F1dGhJbnRlcmNlcHRvcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRxLCBBVVRIX0VWRU5UUykge1xuICAgICAgICB2YXIgc3RhdHVzRGljdCA9IHtcbiAgICAgICAgICAgIDQwMTogQVVUSF9FVkVOVFMubm90QXV0aGVudGljYXRlZCxcbiAgICAgICAgICAgIDQwMzogQVVUSF9FVkVOVFMubm90QXV0aG9yaXplZCxcbiAgICAgICAgICAgIDQxOTogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsXG4gICAgICAgICAgICA0NDA6IEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0XG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICByZXNwb25zZUVycm9yOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChzdGF0dXNEaWN0W3Jlc3BvbnNlLnN0YXR1c10sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlc3BvbnNlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXBwLmNvbmZpZyhmdW5jdGlvbigkaHR0cFByb3ZpZGVyKSB7XG4gICAgICAgICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goW1xuICAgICAgICAgICAgJyRpbmplY3RvcicsXG4gICAgICAgICAgICBmdW5jdGlvbigkaW5qZWN0b3IpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJGluamVjdG9yLmdldCgnQXV0aEludGVyY2VwdG9yJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIF0pO1xuICAgIH0pO1xuXG4gICAgYXBwLnNlcnZpY2UoJ0F1dGhTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIFNlc3Npb24sICRyb290U2NvcGUsIEFVVEhfRVZFTlRTLCAkcSkge1xuXG4gICAgICAgIGZ1bmN0aW9uIG9uU3VjY2Vzc2Z1bExvZ2luKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB2YXIgZGF0YSA9IHJlc3BvbnNlLmRhdGE7XG4gICAgICAgICAgICBTZXNzaW9uLmNyZWF0ZShkYXRhLmlkLCBkYXRhLnVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcyk7XG4gICAgICAgICAgICByZXR1cm4gZGF0YS51c2VyO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXNlcyB0aGUgc2Vzc2lvbiBmYWN0b3J5IHRvIHNlZSBpZiBhblxuICAgICAgICAvLyBhdXRoZW50aWNhdGVkIHVzZXIgaXMgY3VycmVudGx5IHJlZ2lzdGVyZWQuXG4gICAgICAgIHRoaXMuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICByZXR1cm4gISFTZXNzaW9uLnVzZXI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5nZXRMb2dnZWRJblVzZXIgPSBmdW5jdGlvbihmcm9tU2VydmVyKSB7XG5cbiAgICAgICAgICAgIC8vIElmIGFuIGF1dGhlbnRpY2F0ZWQgc2Vzc2lvbiBleGlzdHMsIHdlXG4gICAgICAgICAgICAvLyByZXR1cm4gdGhlIHVzZXIgYXR0YWNoZWQgdG8gdGhhdCBzZXNzaW9uXG4gICAgICAgICAgICAvLyB3aXRoIGEgcHJvbWlzZS4gVGhpcyBlbnN1cmVzIHRoYXQgd2UgY2FuXG4gICAgICAgICAgICAvLyBhbHdheXMgaW50ZXJmYWNlIHdpdGggdGhpcyBtZXRob2QgYXN5bmNocm9ub3VzbHkuXG5cbiAgICAgICAgICAgIC8vIE9wdGlvbmFsbHksIGlmIHRydWUgaXMgZ2l2ZW4gYXMgdGhlIGZyb21TZXJ2ZXIgcGFyYW1ldGVyLFxuICAgICAgICAgICAgLy8gdGhlbiB0aGlzIGNhY2hlZCB2YWx1ZSB3aWxsIG5vdCBiZSB1c2VkLlxuXG4gICAgICAgICAgICBpZiAodGhpcy5pc0F1dGhlbnRpY2F0ZWQoKSAmJiBmcm9tU2VydmVyICE9PSB0cnVlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuICRxLndoZW4oU2Vzc2lvbi51c2VyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTWFrZSByZXF1ZXN0IEdFVCAvc2Vzc2lvbi5cbiAgICAgICAgICAgIC8vIElmIGl0IHJldHVybnMgYSB1c2VyLCBjYWxsIG9uU3VjY2Vzc2Z1bExvZ2luIHdpdGggdGhlIHJlc3BvbnNlLlxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIDQwMSByZXNwb25zZSwgd2UgY2F0Y2ggaXQgYW5kIGluc3RlYWQgcmVzb2x2ZSB0byBudWxsLlxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL3Nlc3Npb24nKS50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKS5jYXRjaChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dpbiA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2xvZ2luJywgY3JlZGVudGlhbHMpXG4gICAgICAgICAgICAgICAgLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIGxvZ2luIGNyZWRlbnRpYWxzLidcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIFNlc3Npb24uZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXBwLnNlcnZpY2UoJ1Nlc3Npb24nLCBmdW5jdGlvbigkcm9vdFNjb3BlLCBBVVRIX0VWRU5UUykge1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5pZCA9IG51bGw7XG4gICAgICAgIHRoaXMudXNlciA9IG51bGw7XG5cbiAgICAgICAgdGhpcy5jcmVhdGUgPSBmdW5jdGlvbihzZXNzaW9uSWQsIHVzZXIpIHtcbiAgICAgICAgICAgIHRoaXMuaWQgPSBzZXNzaW9uSWQ7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSB1c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5pZCA9IG51bGw7XG4gICAgICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG5cbn0pKCk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYWRtaW4nLCB7XG4gICAgdXJsOiAnL2FkbWluJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2xvZ2luL2xvZ2luLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdBZG1pbkxvZ2luQ29udHJvbGxlcidcbiAgfSk7XG59KTtcblxuXG5hcHAuY29udHJvbGxlcignQWRtaW5Mb2dpbkNvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsIEF1dGhTZXJ2aWNlLCBvRW1iZWRGYWN0b3J5KSB7XG4gICRzY29wZS5jb3VudGVyID0gMDtcbiAgJHNjb3BlLnNob3dpbmdFbGVtZW50cyA9IFtdO1xuICAkc2NvcGUuc3VibWlzc2lvbnMgPSBbXTtcblxuICAkc2NvcGUubG9naW4gPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAucG9zdCgnL2FwaS9sb2dpbicsIHtcbiAgICAgIHBhc3N3b3JkOiAkc2NvcGUucGFzc3dvcmRcbiAgICB9KS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgJHJvb3RTY29wZS5wYXNzd29yZCA9ICRzY29wZS5wYXNzd29yZDtcbiAgICAgICRzY29wZS5zaG93U3VibWlzc2lvbnMgPSB0cnVlO1xuICAgICAgJHNjb3BlLmxvYWRTdWJtaXNzaW9ucygpO1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICBhbGVydCgnV3JvbmcgUGFzc3dvcmQnKTtcbiAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAkaHR0cC5nZXQoJy9hcGkvbG9nb3V0JykudGhlbihmdW5jdGlvbigpIHtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hZG1pbic7XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgYWxlcnQoJ1dyb25nIFBhc3N3b3JkJyk7XG4gICAgfSk7XG4gIH1cblxuICAkc2NvcGUubWFuYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLmdldCgnL2FwaS9zb3VuZGNsb3VkL3NvdW5kY2xvdWRDb25maWcnKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIFNDLmluaXRpYWxpemUoe1xuICAgICAgICAgIGNsaWVudF9pZDogcmVzLmRhdGEuY2xpZW50SUQsXG4gICAgICAgICAgcmVkaXJlY3RfdXJpOiByZXMuZGF0YS5jYWxsYmFja1VSTCxcbiAgICAgICAgICBzY29wZTogXCJub24tZXhwaXJpbmdcIlxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIFNDLmNvbm5lY3QoKTtcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHJvb3RTY29wZS5hY2Nlc3NUb2tlbiA9IHJlcy5vYXV0aF90b2tlbjtcbiAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvbG9naW4vYXV0aGVudGljYXRlZCcsIHtcbiAgICAgICAgICB0b2tlbjogcmVzLm9hdXRoX3Rva2VuLFxuICAgICAgICAgIHBhc3N3b3JkOiAkcm9vdFNjb3BlLnBhc3N3b3JkLFxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAkcm9vdFNjb3BlLnNjaGVkdWxlckluZm8gPSByZXMuZGF0YTtcbiAgICAgICAgJHJvb3RTY29wZS5zY2hlZHVsZXJJbmZvLmV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2KSB7XG4gICAgICAgICAgZXYuZGF5ID0gbmV3IERhdGUoZXYuZGF5KTtcbiAgICAgICAgfSk7XG4gICAgICAgICRzdGF0ZS5nbygnc2NoZWR1bGVyJyk7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGFsZXJ0KCdFcnJvcjogQ291bGQgbm90IGxvZyBpbicpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUubG9hZFN1Ym1pc3Npb25zID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLmdldCgnL2FwaS9zdWJtaXNzaW9ucy91bmFjY2VwdGVkJylcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUuc3VibWlzc2lvbnMgPSByZXMuZGF0YTtcbiAgICAgICAgY29uc29sZS5sb2cocmVzLmRhdGEpO1xuICAgICAgICAkc2NvcGUubG9hZE1vcmUoKTtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9jaGFubmVscycpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUuY2hhbm5lbHMgPSByZXMuZGF0YTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgYWxlcnQoJ0Vycm9yOiBDb3VsZCBub3QgZ2V0IGNoYW5uZWxzLicpXG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5sb2FkTW9yZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBsb2FkRWxlbWVudHMgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gJHNjb3BlLmNvdW50ZXI7IGkgPCAkc2NvcGUuY291bnRlciArIDE1OyBpKyspIHtcbiAgICAgIHZhciBzdWIgPSAkc2NvcGUuc3VibWlzc2lvbnNbaV07XG4gICAgICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLnB1c2goc3ViKTtcbiAgICAgIGxvYWRFbGVtZW50cy5wdXNoKHN1Yik7XG4gICAgfVxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBjb25zb2xlLmxvZyhsb2FkRWxlbWVudHMpO1xuICAgICAgbG9hZEVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oc3ViKSB7XG4gICAgICAgIG9FbWJlZEZhY3RvcnkuZW1iZWRTb25nKHN1Yik7XG4gICAgICB9LCA1MClcbiAgICB9KTtcbiAgICAkc2NvcGUuY291bnRlciArPSAxNTtcbiAgfVxuXG4gICRzY29wZS5jaGFuZ2VCb3ggPSBmdW5jdGlvbihzdWIsIGNoYW4pIHtcbiAgICB2YXIgaW5kZXggPSBzdWIuY2hhbm5lbElEUy5pbmRleE9mKGNoYW4uY2hhbm5lbElEKTtcbiAgICBpZiAoaW5kZXggPT0gLTEpIHtcbiAgICAgIHN1Yi5jaGFubmVsSURTLnB1c2goY2hhbi5jaGFubmVsSUQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdWIuY2hhbm5lbElEUy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuXG4gICRzY29wZS5zYXZlID0gZnVuY3Rpb24oc3VibWkpIHtcbiAgICBpZiAoc3VibWkuY2hhbm5lbElEUy5sZW5ndGggPT0gMCkge1xuICAgICAgJHNjb3BlLmRlY2xpbmUoc3VibWkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdWJtaS5wYXNzd29yZCA9ICRyb290U2NvcGUucGFzc3dvcmQ7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAkaHR0cC5wdXQoXCIvYXBpL3N1Ym1pc3Npb25zL3NhdmVcIiwgc3VibWkpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHN1Yikge1xuICAgICAgICAgICRzY29wZS5zaG93aW5nRWxlbWVudHMuc3BsaWNlKCRzY29wZS5zaG93aW5nRWxlbWVudHMuaW5kZXhPZihzdWJtaSksIDEpO1xuICAgICAgICAgIHdpbmRvdy5hbGVydChcIlNhdmVkXCIpO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgd2luZG93LmFsZXJ0KFwiRVJST1I6IGRpZCBub3QgU2F2ZVwiKVxuICAgICAgICB9KVxuICAgIH1cbiAgfVxuXG4gICRzY29wZS5pZ25vcmUgPSBmdW5jdGlvbihzdWJtaXNzaW9uKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLmRlbGV0ZSgnL2FwaS9zdWJtaXNzaW9ucy9pZ25vcmUvJyArIHN1Ym1pc3Npb24uX2lkICsgJy8nICsgJHJvb3RTY29wZS5wYXNzd29yZClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICB2YXIgaW5kZXggPSAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLmluZGV4T2Yoc3VibWlzc2lvbik7XG4gICAgICAgICRzY29wZS5zaG93aW5nRWxlbWVudHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgd2luZG93LmFsZXJ0KFwiSWdub3JlZFwiKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgd2luZG93LmFsZXJ0KFwiRVJST1I6IGRpZCBub3QgSWdub3JlXCIpO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUuZGVjbGluZSA9IGZ1bmN0aW9uKHN1Ym1pc3Npb24pIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAuZGVsZXRlKCcvYXBpL3N1Ym1pc3Npb25zL2RlY2xpbmUvJyArIHN1Ym1pc3Npb24uX2lkICsgJy8nICsgJHJvb3RTY29wZS5wYXNzd29yZClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICB2YXIgaW5kZXggPSAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLmluZGV4T2Yoc3VibWlzc2lvbik7XG4gICAgICAgICRzY29wZS5zaG93aW5nRWxlbWVudHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgd2luZG93LmFsZXJ0KFwiRGVjbGluZWRcIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2VcbiAgICAgIH0pXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgd2luZG93LmFsZXJ0KFwiRVJST1I6IGRpZCBub3QgRGVjbGluZVwiKTtcbiAgICAgIH0pO1xuICB9XG59KTsiLCJhcHAuZmFjdG9yeSgnb0VtYmVkRmFjdG9yeScsIGZ1bmN0aW9uKCl7XG5cdHJldHVybiB7XG5cdFx0ZW1iZWRTb25nOiBmdW5jdGlvbihzdWIpIHtcblx0ICAgICAgICByZXR1cm4gU0Mub0VtYmVkKFwiaHR0cDovL2FwaS5zb3VuZGNsb3VkLmNvbS90cmFja3MvXCIgKyBzdWIudHJhY2tJRCwge1xuXHQgICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc3ViLnRyYWNrSUQgKyBcInBsYXllclwiKSxcblx0ICAgICAgICAgIGF1dG9fcGxheTogZmFsc2UsXG5cdCAgICAgICAgICBtYXhoZWlnaHQ6IDE1MFxuXHQgICAgICAgIH0pO1xuXHRcdH1cblx0fTtcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3NjaGVkdWxlcicsIHtcbiAgICB1cmw6ICcvc2NoZWR1bGVyJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL3NjaGVkdWxlci9zY2hlZHVsZXIuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ1NjaGVkdWxlckNvbnRyb2xsZXInXG4gIH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ1NjaGVkdWxlckNvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsIEF1dGhTZXJ2aWNlKSB7XG5cbiAgJHNjb3BlLm1ha2VFdmVudFVSTCA9IFwiXCI7XG4gICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICB2YXIgaW5mbyA9ICRyb290U2NvcGUuc2NoZWR1bGVySW5mbztcbiAgaWYgKCFpbmZvKSB7XG4gICAgJHN0YXRlLmdvKCdhZG1pbicpO1xuICB9XG4gICRzY29wZS5jaGFubmVsID0gaW5mby5jaGFubmVsO1xuICAkc2NvcGUuc3VibWlzc2lvbnMgPSBpbmZvLnN1Ym1pc3Npb25zO1xuXG4gICRzY29wZS5jYWxlbmRhciA9IGZpbGxEYXRlQXJyYXlzKGluZm8uZXZlbnRzKTtcbiAgJHNjb3BlLmRheUluY3IgPSAwO1xuXG4gICRzY29wZS5iYWNrID0gZnVuY3Rpb24oKSB7XG4gICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuXG4gIH1cblxuICAkc2NvcGUuc2F2ZUNoYW5uZWwgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJHNjb3BlLmNoYW5uZWwucGFzc3dvcmQgPSAkcm9vdFNjb3BlLnBhc3N3b3JkO1xuICAgICRodHRwLnB1dChcIi9hcGkvY2hhbm5lbHNcIiwgJHNjb3BlLmNoYW5uZWwpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgd2luZG93LmFsZXJ0KFwiU2F2ZWRcIik7XG4gICAgICAgICRzY29wZS5jaGFubmVsID0gcmVzLmRhdGE7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIHdpbmRvdy5hbGVydChcIkVycm9yOiBkaWQgbm90IHNhdmVcIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5pbmNyRGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCRzY29wZS5kYXlJbmNyIDwgMTQpICRzY29wZS5kYXlJbmNyKys7XG4gIH1cblxuICAkc2NvcGUuZGVjckRheSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc2NvcGUuZGF5SW5jciA+IDApICRzY29wZS5kYXlJbmNyLS07XG4gIH1cblxuICAkc2NvcGUuY2xpY2tlZFNsb3QgPSBmdW5jdGlvbihkYXksIGhvdXIpIHtcbiAgICB2YXIgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgIGlmICh0b2RheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSBkYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgJiYgdG9kYXkuZ2V0SG91cnMoKSA+IGhvdXIpIHJldHVybjtcbiAgICAkc2NvcGUuc2hvd092ZXJsYXkgPSB0cnVlO1xuICAgIHZhciBjYWxEYXkgPSB7fTtcbiAgICB2YXIgY2FsZW5kYXJEYXkgPSAkc2NvcGUuY2FsZW5kYXIuZmluZChmdW5jdGlvbihjYWxEKSB7XG4gICAgICByZXR1cm4gY2FsRC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpO1xuICAgIH0pO1xuICAgICRzY29wZS5tYWtlRXZlbnRVUkwgPSB1bmRlZmluZWQ7XG4gICAgJHNjb3BlLm1ha2VFdmVudCA9IGNhbGVuZGFyRGF5LmV2ZW50c1tob3VyXTtcbiAgICBpZiAoJHNjb3BlLm1ha2VFdmVudCA9PSBcIi1cIikge1xuICAgICAgdmFyIG1ha2VEYXkgPSBuZXcgRGF0ZShkYXkpO1xuICAgICAgbWFrZURheS5zZXRIb3Vycyhob3VyKTtcbiAgICAgICRzY29wZS5tYWtlRXZlbnQgPSB7XG4gICAgICAgIGNoYW5uZWxJRDogJHNjb3BlLmNoYW5uZWwuY2hhbm5lbElELFxuICAgICAgICBkYXk6IG1ha2VEYXksXG4gICAgICAgIHBhaWQ6IGZhbHNlXG4gICAgICB9O1xuICAgICAgJHNjb3BlLm5ld0V2ZW50ID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLm1ha2VFdmVudFVSTCA9ICdodHRwczovL2FwaS5zb3VuZGNsb3VkLmNvbS90cmFja3MvJyArICRzY29wZS5tYWtlRXZlbnQudHJhY2tJRDtcbiAgICAgIFNDLm9FbWJlZCgnaHR0cHM6Ly9hcGkuc291bmRjbG91ZC5jb20vdHJhY2tzLycgKyAkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQsIHtcbiAgICAgICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUGxheWVyJyksXG4gICAgICAgIGF1dG9fcGxheTogZmFsc2UsXG4gICAgICAgIG1heGhlaWdodDogMTUwXG4gICAgICB9KTtcbiAgICAgICRzY29wZS5uZXdFdmVudCA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gICRzY29wZS5jaGFuZ2VQYWlkID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLm1ha2VFdmVudC50cmFja0lEID0gdW5kZWZpbmVkO1xuICAgICRzY29wZS5tYWtlRXZlbnRVUkwgPSB1bmRlZmluZWQ7XG4gIH1cblxuICAkc2NvcGUuY2hhbmdlVVJMID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLnBvc3QoJy9hcGkvc291bmRjbG91ZC9yZXNvbHZlJywge1xuICAgICAgICB1cmw6ICRzY29wZS5tYWtlRXZlbnRVUkxcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC50cmFja0lEID0gcmVzLmRhdGEuaWQ7XG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQudGl0bGUgPSByZXMuZGF0YS50aXRsZTtcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC50cmFja1VSTCA9IHJlcy5kYXRhLnRyYWNrVVJMO1xuICAgICAgICBTQy5vRW1iZWQoJHNjb3BlLm1ha2VFdmVudFVSTCwge1xuICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLFxuICAgICAgICAgIGF1dG9fcGxheTogZmFsc2UsXG4gICAgICAgICAgbWF4aGVpZ2h0OiAxNTBcbiAgICAgICAgfSlcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUGxheWVyJykuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuICAgICAgICAkc2NvcGUubm90Rm91bmQgPSBmYWxzZTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuICAgICAgICAkc2NvcGUubm90Rm91bmQgPSB0cnVlO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUuZGVsZXRlRXZlbnQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoISRzY29wZS5uZXdFdmVudCkge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgJGh0dHAuZGVsZXRlKCcvYXBpL2V2ZW50cy8nICsgJHNjb3BlLm1ha2VFdmVudC5faWQgKyAnLycgKyAkcm9vdFNjb3BlLnBhc3N3b3JkKVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICB2YXIgY2FsZW5kYXJEYXkgPSAkc2NvcGUuY2FsZW5kYXIuZmluZChmdW5jdGlvbihjYWxEKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsRC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gJHNjb3BlLm1ha2VFdmVudC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgY2FsZW5kYXJEYXkuZXZlbnRzWyRzY29wZS5tYWtlRXZlbnQuZGF5LmdldEhvdXJzKCldID0gXCItXCI7XG4gICAgICAgICAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJEZWxldGVkXCIpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgIHdpbmRvdy5hbGVydChcIkVSUk9SOiBkaWQgbm90IERlbGV0ZS5cIilcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBjYWxlbmRhckRheSA9ICRzY29wZS5jYWxlbmRhci5maW5kKGZ1bmN0aW9uKGNhbEQpIHtcbiAgICAgICAgcmV0dXJuIGNhbEQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09ICRzY29wZS5tYWtlRXZlbnQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpO1xuICAgICAgfSk7XG4gICAgICBjYWxlbmRhckRheS5ldmVudHNbJHNjb3BlLm1ha2VFdmVudC5nZXRIb3VycygpXSA9IFwiLVwiO1xuICAgICAgdmFyIGV2ZW50c1xuICAgICAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLnNhdmVFdmVudCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghJHNjb3BlLm1ha2VFdmVudC50cmFja0lEICYmICEkc2NvcGUubWFrZUV2ZW50LnBhaWQpIHtcbiAgICAgIHdpbmRvdy5hbGVydChcIkVudGVyIGEgdHJhY2sgVVJMXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoJHNjb3BlLm5ld0V2ZW50KSB7XG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQucGFzc3dvcmQgPSAkcm9vdFNjb3BlLnBhc3N3b3JkO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAgICRodHRwLnBvc3QoJy9hcGkvZXZlbnRzJywgJHNjb3BlLm1ha2VFdmVudClcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHZhciBldmVudCA9IHJlcy5kYXRhO1xuICAgICAgICAgICAgZXZlbnQuZGF5ID0gbmV3IERhdGUoZXZlbnQuZGF5KTtcbiAgICAgICAgICAgIHZhciBjYWxlbmRhckRheSA9ICRzY29wZS5jYWxlbmRhci5maW5kKGZ1bmN0aW9uKGNhbEQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGNhbEQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09IGV2ZW50LmRheS50b0xvY2FsZURhdGVTdHJpbmcoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2FsZW5kYXJEYXkuZXZlbnRzW2V2ZW50LmRheS5nZXRIb3VycygpXSA9IGV2ZW50O1xuICAgICAgICAgICAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgd2luZG93LmFsZXJ0KFwiU2F2ZWRcIik7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJFUlJPUjogZGlkIG5vdCBTYXZlLlwiKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRzY29wZS5uZXdFdmVudC5wYXNzd29yZCA9ICRyb290U2NvcGUucGFzc3dvcmQ7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICAgJGh0dHAucHV0KCcvYXBpL2V2ZW50cycsICRzY29wZS5tYWtlRXZlbnQpXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB2YXIgZXZlbnQgPSByZXMuZGF0YTtcbiAgICAgICAgICAgIGV2ZW50LmRheSA9IG5ldyBEYXRlKGV2ZW50LmRheSk7XG4gICAgICAgICAgICB2YXIgY2FsZW5kYXJEYXkgPSAkc2NvcGUuY2FsZW5kYXIuZmluZChmdW5jdGlvbihjYWxEKSB7XG4gICAgICAgICAgICAgIHJldHVybiBjYWxELmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSBldmVudC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNhbGVuZGFyRGF5LmV2ZW50c1tldmVudC5nZXRIb3VycygpXSA9IGV2ZW50O1xuICAgICAgICAgICAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgd2luZG93LmFsZXJ0KFwiU2F2ZWRcIik7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJFUlJPUjogZGlkIG5vdCBTYXZlLlwiKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAkc2NvcGUuYmFja0V2ZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLm1ha2VFdmVudCA9IG51bGw7XG4gICAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XG4gIH1cblxuICAkc2NvcGUucmVtb3ZlUXVldWVTb25nID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAkc2NvcGUuY2hhbm5lbC5xdWV1ZS5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICRzY29wZS5zYXZlQ2hhbm5lbCgpO1xuICB9XG5cbiAgJHNjb3BlLmFkZFNvbmcgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLmNoYW5uZWwucXVldWUuaW5kZXhPZigkc2NvcGUubmV3UXVldWVJRCkgIT0gLTEpIHJldHVybjtcbiAgICAkc2NvcGUuY2hhbm5lbC5xdWV1ZS5wdXNoKCRzY29wZS5uZXdRdWV1ZUlEKTtcbiAgICAkc2NvcGUuc2F2ZUNoYW5uZWwoKTtcbiAgICAkc2NvcGUubmV3UXVldWVTb25nID0gdW5kZWZpbmVkO1xuICAgICRzY29wZS5jaGFuZ2VRdWV1ZVNvbmcoKTtcbiAgICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MoWyRzY29wZS5uZXdRdWV1ZUlEXSk7XG4gIH1cblxuICAkc2NvcGUuY2hhbmdlUXVldWVTb25nID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLmdldCgnYXBpL3NvdW5kY2xvdWQvc291bmRjbG91ZENvbmZpZycpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgU0MuaW5pdGlhbGl6ZSh7XG4gICAgICAgICAgY2xpZW50X2lkOiByZXMuZGF0YS5jbGllbnRJRCxcbiAgICAgICAgICByZWRpcmVjdF91cmk6IHJlcy5kYXRhLmNhbGxiYWNrVVJMLFxuICAgICAgICAgIHNjb3BlOiBcIm5vbi1leHBpcmluZ1wiXG4gICAgICAgIH0pO1xuICAgICAgICAkc2NvcGUuY2xpZW50SURTdHJpbmcgPSByZXMuZGF0YS5jbGllbnRJRC50b1N0cmluZygpO1xuICAgICAgICB2YXIgZ2V0UGF0aCA9ICdodHRwOi8vYXBpLnNvdW5kY2xvdWQuY29tL3Jlc29sdmUuanNvbj91cmw9JyArICRzY29wZS5uZXdRdWV1ZVNvbmcgKyAnJmNsaWVudF9pZD0nICsgJHNjb3BlLmNsaWVudElEU3RyaW5nO1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KGdldFBhdGgpXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIHZhciB0cmFjayA9IHJlcy5kYXRhO1xuICAgICAgICAvLyBTQy5vRW1iZWQodHJhY2sudXJpLCB7XG4gICAgICAgIC8vICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ25ld1F1ZXVlUGxheWVyJyksXG4gICAgICAgIC8vICAgYXV0b19wbGF5OiBmYWxzZSxcbiAgICAgICAgLy8gICBtYXhoZWlnaHQ6IDE1MFxuICAgICAgICAvLyB9KTtcbiAgICAgICAgJHNjb3BlLm5ld1F1ZXVlSUQgPSB0cmFjay5pZDtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLm1vdmVVcCA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgaWYgKGluZGV4ID09IDApIHJldHVybjtcbiAgICB2YXIgcyA9ICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4XTtcbiAgICAkc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleF0gPSAkc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleCAtIDFdO1xuICAgICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4IC0gMV0gPSBzO1xuICAgICRzY29wZS5zYXZlQ2hhbm5lbCgpO1xuICAgICRzY29wZS5sb2FkUXVldWVTb25ncyhbJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXhdLCAkc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleCAtIDFdXSk7XG4gIH1cblxuICAkc2NvcGUubW92ZURvd24gPSBmdW5jdGlvbihpbmRleCkge1xuICAgIGlmIChpbmRleCA9PSAkc2NvcGUuY2hhbm5lbC5xdWV1ZS5sZW5ndGggLSAxKSByZXR1cm47XG4gICAgdmFyIHMgPSAkc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleF07XG4gICAgJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXhdID0gJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXggKyAxXTtcbiAgICAkc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleCArIDFdID0gcztcbiAgICAkc2NvcGUuc2F2ZUNoYW5uZWwoKTtcbiAgICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MoWyRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4XSwgJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXggKyAxXV0pO1xuICB9XG5cbiAgLy8gJHNjb3BlLmNhbkxvd2VyT3BlbkV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAvLyAgIHZhciB3YWl0aW5nU3VicyA9ICRzY29wZS5zdWJtaXNzaW9ucy5maWx0ZXIoZnVuY3Rpb24oc3ViKSB7XG4gIC8vICAgICByZXR1cm4gc3ViLmludm9pY2VJRDtcbiAgLy8gICB9KTtcbiAgLy8gICB2YXIgb3BlblNsb3RzID0gW107XG4gIC8vICAgJHNjb3BlLmNhbGVuZGFyLmZvckVhY2goZnVuY3Rpb24oZGF5KSB7XG4gIC8vICAgICBkYXkuZXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXYpIHtcbiAgLy8gICAgICAgaWYgKGV2LnBhaWQgJiYgIWV2LnRyYWNrSUQpIG9wZW5TbG90cy5wdXNoKGV2KTtcbiAgLy8gICAgIH0pO1xuICAvLyAgIH0pO1xuICAvLyAgIHZhciBvcGVuTnVtID0gb3BlblNsb3RzLmxlbmd0aCAtIHdhaXRpbmdTdWJzLmxlbmd0aDtcbiAgLy8gICByZXR1cm4gb3Blbk51bSA+IDA7XG4gIC8vIH1cblxuICAkc2NvcGUubG9hZFN1Ym1pc3Npb25zID0gZnVuY3Rpb24oKSB7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5zdWJtaXNzaW9ucy5mb3JFYWNoKGZ1bmN0aW9uKHN1Yikge1xuICAgICAgICBTQy5vRW1iZWQoXCJodHRwOi8vYXBpLnNvdW5kY2xvdWQuY29tL3RyYWNrcy9cIiArIHN1Yi50cmFja0lELCB7XG4gICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc3ViLnRyYWNrSUQgKyBcInBsYXllclwiKSxcbiAgICAgICAgICBhdXRvX3BsYXk6IGZhbHNlLFxuICAgICAgICAgIG1heGhlaWdodDogMTUwXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSwgNTApO1xuICB9XG5cbiAgJHNjb3BlLmxvYWRRdWV1ZVNvbmdzID0gZnVuY3Rpb24ocXVldWUpIHtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgcXVldWUuZm9yRWFjaChmdW5jdGlvbihzb25nSUQpIHtcbiAgICAgICAgU0Mub0VtYmVkKFwiaHR0cDovL2FwaS5zb3VuZGNsb3VkLmNvbS90cmFja3MvXCIgKyBzb25nSUQsIHtcbiAgICAgICAgICBlbGVtZW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzb25nSUQgKyBcInBsYXllclwiKSxcbiAgICAgICAgICBhdXRvX3BsYXk6IGZhbHNlLFxuICAgICAgICAgIG1heGhlaWdodDogMTUwXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSwgNTApO1xuICB9XG4gIGlmICgkc2NvcGUuY2hhbm5lbCAmJiAkc2NvcGUuY2hhbm5lbC5xdWV1ZSkge1xuICAgICRzY29wZS5sb2FkUXVldWVTb25ncygkc2NvcGUuY2hhbm5lbC5xdWV1ZSk7XG4gIH1cbiAgJHNjb3BlLmxvYWRTdWJtaXNzaW9ucygpO1xuXG59KTtcblxuZnVuY3Rpb24gZmlsbERhdGVBcnJheXMoZXZlbnRzKSB7XG4gIHZhciBjYWxlbmRhciA9IFtdO1xuICB2YXIgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IDIxOyBpKyspIHtcbiAgICB2YXIgY2FsRGF5ID0ge307XG4gICAgY2FsRGF5LmRheSA9IG5ldyBEYXRlKClcbiAgICBjYWxEYXkuZGF5LnNldERhdGUodG9kYXkuZ2V0RGF0ZSgpICsgaSk7XG4gICAgdmFyIGRheUV2ZW50cyA9IGV2ZW50cy5maWx0ZXIoZnVuY3Rpb24oZXYpIHtcbiAgICAgIHJldHVybiAoZXYuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09IGNhbERheS5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkpO1xuICAgIH0pO1xuICAgIHZhciBldmVudEFycmF5ID0gW107XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCAyNDsgaisrKSB7XG4gICAgICBldmVudEFycmF5W2pdID0gXCItXCI7XG4gICAgfVxuICAgIGRheUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2KSB7XG4gICAgICBldmVudEFycmF5W2V2LmRheS5nZXRIb3VycygpXSA9IGV2O1xuICAgIH0pO1xuICAgIGNhbERheS5ldmVudHMgPSBldmVudEFycmF5O1xuICAgIGNhbGVuZGFyLnB1c2goY2FsRGF5KTtcbiAgfVxuICByZXR1cm4gY2FsZW5kYXI7XG59IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnc3VibWl0U29uZycsIHtcbiAgICB1cmw6ICcvc3VibWl0JyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL3N1Ym1pdC9zdWJtaXQudmlldy5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnU3VibWl0U29uZ0NvbnRyb2xsZXInXG4gIH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdTdWJtaXRTb25nQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCkge1xuXG4gICRzY29wZS5zdWJtaXNzaW9uID0ge307XG5cbiAgJHNjb3BlLnVybENoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIHtcbiAgICAgICAgdXJsOiAkc2NvcGUudXJsXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrSUQgPSByZXMuZGF0YS5pZDtcbiAgICAgICAgJHNjb3BlLnN1Ym1pc3Npb24udGl0bGUgPSByZXMuZGF0YS50aXRsZTtcbiAgICAgICAgJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tVUkwgPSByZXMuZGF0YS50cmFja1VSTDtcbiAgICAgICAgU0Mub0VtYmVkKCRzY29wZS5zdWJtaXNzaW9uLnRyYWNrVVJMLCB7XG4gICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUGxheWVyJyksXG4gICAgICAgICAgYXV0b19wbGF5OiBmYWxzZSxcbiAgICAgICAgICBtYXhoZWlnaHQ6IDE1MFxuICAgICAgICB9KVxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5ub3RGb3VuZCA9IGZhbHNlO1xuICAgICAgfSkudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tJRCA9IG51bGw7XG4gICAgICAgICRzY29wZS5ub3RGb3VuZCA9IHRydWU7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUuc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCEkc2NvcGUuc3VibWlzc2lvbi5lbWFpbCB8fCAhJHNjb3BlLnN1Ym1pc3Npb24ubmFtZSkge1xuICAgICAgYWxlcnQoXCJQbGVhc2UgZmlsbCBpbiBhbGwgZmllbGRzXCIpXG4gICAgfSBlbHNlIGlmICghJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tJRCkge1xuICAgICAgYWxlcnQoXCJUcmFjayBOb3QgRm91bmRcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICRodHRwLnBvc3QoJy9hcGkvc3VibWlzc2lvbnMnLCB7XG4gICAgICAgICAgZW1haWw6ICRzY29wZS5zdWJtaXNzaW9uLmVtYWlsLFxuICAgICAgICAgIHRyYWNrSUQ6ICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrSUQsXG4gICAgICAgICAgbmFtZTogJHNjb3BlLnN1Ym1pc3Npb24ubmFtZSxcbiAgICAgICAgICB0aXRsZTogJHNjb3BlLnN1Ym1pc3Npb24udGl0bGUsXG4gICAgICAgICAgdHJhY2tVUkw6ICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrVVJMLFxuICAgICAgICAgIGNoYW5uZWxJRFM6IFtdLFxuICAgICAgICAgIGludm9pY2VJRFM6IFtdXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKHJlcy5kYXRhKTtcbiAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJZb3VyIHNvbmcgaGFzIGJlZW4gc3VibWl0dGVkIGFuZCB3aWxsIGJlIHJldmlld2VkIHNvb24uXCIpO1xuICAgICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgIHdpbmRvdy5hbGVydChcIkVycm9yOiBDb3VsZCBub3Qgc3VibWl0IHNvbmcuXCIpO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH1cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2F1dG9FbWFpbHNOZXcnLCB7XG4gICAgdXJsOiAnL2FkbWluL2RhdGFiYXNlL2F1dG9FbWFpbHMvbmV3JyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2RhdGFiYXNlL2F1dG9FbWFpbHMvYXV0b0VtYWlscy5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnQXV0b0VtYWlsc0NvbnRyb2xsZXInXG4gIH0pO1xufSk7XG5cbmFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2F1dG9FbWFpbHNFZGl0Jywge1xuICAgIHVybDogJy9hZG1pbi9kYXRhYmFzZS9hdXRvRW1haWxzL2VkaXQvOnRlbXBsYXRlSWQnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvZGF0YWJhc2UvYXV0b0VtYWlscy9hdXRvRW1haWxzLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdBdXRvRW1haWxzQ29udHJvbGxlcicsXG4gICAgLy8gcmVzb2x2ZToge1xuICAgIC8vICAgdGVtcGxhdGU6IGZ1bmN0aW9uKCRodHRwKSB7XG4gICAgLy8gICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZGF0YWJhc2UvYXV0b0VtYWlscy9iaXdlZWtseT9pc0FydGlzdD10cnVlJylcbiAgICAvLyAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAvLyAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IHJlcy5kYXRhO1xuICAgIC8vICAgICAgICAgaWYgKHRlbXBsYXRlKSB7XG4gICAgLy8gICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICAvLyAgICAgICAgIH0gZWxzZSB7XG4gICAgLy8gICAgICAgICAgIHJldHVybiB7XG4gICAgLy8gICAgICAgICAgICAgcHVycG9zZTogXCJCaXdlZWtseSBFbWFpbFwiXG4gICAgLy8gICAgICAgICAgIH1cbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgICB9KVxuICAgIC8vICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgIC8vICAgICAgICAgYWxlcnQoXCJFUlJPUjogU29tZXRoaW5nIHdlbnQgd3JvbmcuXCIpO1xuICAgIC8vICAgICAgIH0pXG4gICAgLy8gICB9XG4gICAgLy8gfVxuICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignQXV0b0VtYWlsc0NvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsICRzdGF0ZVBhcmFtcywgQXV0aFNlcnZpY2UpIHtcbiAgJHNjb3BlLmxvZ2dlZEluID0gZmFsc2U7XG5cblxuICAkc2NvcGUuaXNTdGF0ZVBhcmFtcyA9IGZhbHNlO1xuICBpZigkc3RhdGVQYXJhbXMudGVtcGxhdGVJZCkge1xuICAgICRzY29wZS5pc1N0YXRlUGFyYW1zID0gdHJ1ZTtcbiAgfVxuICAvLyAkc2NvcGUudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcblxuICAkc2NvcGUudGVtcGxhdGUgPSB7XG4gICAgaXNBcnRpc3Q6IGZhbHNlXG4gIH07XG5cbiAgJHNjb3BlLmdldFRlbXBsYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYoJHN0YXRlUGFyYW1zLnRlbXBsYXRlSWQpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICRodHRwLmdldCgnL2FwaS9kYXRhYmFzZS9hdXRvRW1haWxzP3RlbXBsYXRlSWQ9JyArICRzdGF0ZVBhcmFtcy50ZW1wbGF0ZUlkKVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICB2YXIgdGVtcGxhdGUgPSByZXMuZGF0YTtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgIGlmICh0ZW1wbGF0ZSkge1xuICAgICAgICAgICAgJHNjb3BlLnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRzY29wZS50ZW1wbGF0ZSA9IHt9O1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgYWxlcnQoXCJFUlJPUjogU29tZXRoaW5nIHdlbnQgd3JvbmcuXCIpO1xuICAgICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfTtcblxuICAvLyBjb25zb2xlLmxvZyh0ZW1wbGF0ZSk7XG4gICRzY29wZS5zYXZlID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvYXV0b0VtYWlscy8nLCAkc2NvcGUudGVtcGxhdGUpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgYWxlcnQoXCJTYXZlZCBlbWFpbCB0ZW1wbGF0ZS5cIilcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgYWxlcnQoXCJFUlJPUjogTWVzc2FnZSBjb3VsZCBub3Qgc2F2ZS5cIilcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLy8gJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24oKSB7XG4gIC8vICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAvLyAgICRodHRwLnBvc3QoJy9hcGkvbG9naW4nLCB7XG4gIC8vICAgICBwYXNzd29yZDogJHNjb3BlLnBhc3N3b3JkXG4gIC8vICAgfSkudGhlbihmdW5jdGlvbigpIHtcbiAgLy8gICAgICRyb290U2NvcGUucGFzc3dvcmQgPSAkc2NvcGUucGFzc3dvcmQ7XG4gIC8vICAgICAkc2NvcGUubG9nZ2VkSW4gPSB0cnVlO1xuICAvLyAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgLy8gICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgLy8gICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gIC8vICAgICBhbGVydCgnV3JvbmcgUGFzc3dvcmQnKTtcbiAgLy8gICB9KTtcbiAgLy8gfVxuXG4gICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAkaHR0cC5nZXQoJy9hcGkvbG9nb3V0JykudGhlbihmdW5jdGlvbigpIHtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hZG1pbic7XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgYWxlcnQoJ1dyb25nIFBhc3N3b3JkJyk7XG4gICAgfSk7XG4gIH1cblxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYXV0b0VtYWlsc0xpc3QnLCB7XG4gICAgdXJsOiAnL2FkbWluL2RhdGFiYXNlL2F1dG9FbWFpbHMnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvZGF0YWJhc2UvYXV0b0VtYWlscy9hdXRvRW1haWxzTGlzdC5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnQXV0b0VtYWlsc0xpc3RDb250cm9sbGVyJyxcbiAgICByZXNvbHZlOiB7XG4gICAgICB0ZW1wbGF0ZXM6IGZ1bmN0aW9uKCRodHRwKSB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZGF0YWJhc2UvYXV0b0VtYWlscycpXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7IFxuICAgICAgICAgICAgdmFyIHRlbXBsYXRlID0gcmVzLmRhdGE7XG4gICAgICAgICAgICBpZiAodGVtcGxhdGUpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBwdXJwb3NlOiBcIkJpd2Vla2x5IEVtYWlsXCJcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICBhbGVydChcIkVSUk9SOiBTb21ldGhpbmcgd2VudCB3cm9uZy5cIik7XG4gICAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdBdXRvRW1haWxzTGlzdENvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsIEF1dGhTZXJ2aWNlLCB0ZW1wbGF0ZXMpIHtcbiAgJHNjb3BlLmxvZ2dlZEluID0gZmFsc2U7XG4gICRzY29wZS50ZW1wbGF0ZXMgPSB0ZW1wbGF0ZXM7XG5cbiAgLy8gJHNjb3BlLmdldFRlbXBsYXRlID0gZnVuY3Rpb24oKSB7XG4gIC8vICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAvLyAgICRodHRwLmdldCgnL2FwaS9kYXRhYmFzZS9hdXRvRW1haWxzL2Jpd2Vla2x5P2lzQXJ0aXN0PScgKyBTdHJpbmcoJHNjb3BlLnRlbXBsYXRlLmlzQXJ0aXN0KSlcbiAgLy8gICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAvLyAgICAgICB2YXIgdGVtcGxhdGUgPSByZXMuZGF0YTtcbiAgLy8gICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgLy8gICAgICAgaWYgKHRlbXBsYXRlKSB7XG4gIC8vICAgICAgICAgJHNjb3BlLnRlbXBsYXRlID0gdGVtcGxhdGU7XG4gIC8vICAgICAgIH0gZWxzZSB7XG4gIC8vICAgICAgICAgJHNjb3BlLnRlbXBsYXRlID0ge1xuICAvLyAgICAgICAgICAgcHVycG9zZTogXCJCaXdlZWtseSBFbWFpbFwiLFxuICAvLyAgICAgICAgICAgaXNBcnRpc3Q6IGZhbHNlXG4gIC8vICAgICAgICAgfTtcbiAgLy8gICAgICAgfVxuICAvLyAgICAgfSlcbiAgLy8gICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAvLyAgICAgICBhbGVydChcIkVSUk9SOiBTb21ldGhpbmcgd2VudCB3cm9uZy5cIik7XG4gIC8vICAgICB9KTtcbiAgLy8gfTtcblxuICAvLyBjb25zb2xlLmxvZyh0ZW1wbGF0ZSk7XG4gICRzY29wZS5zYXZlID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvYXV0b0VtYWlscycsICRzY29wZS50ZW1wbGF0ZSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICBhbGVydChcIlNhdmVkIGVtYWlsLlwiKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgYWxlcnQoXCJFUlJPUjogTWVzc2FnZSBjb3VsZCBub3Qgc2F2ZS5cIilcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLy8gJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24oKSB7XG4gIC8vICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAvLyAgICRodHRwLnBvc3QoJy9hcGkvbG9naW4nLCB7XG4gIC8vICAgICBwYXNzd29yZDogJHNjb3BlLnBhc3N3b3JkXG4gIC8vICAgfSkudGhlbihmdW5jdGlvbigpIHtcbiAgLy8gICAgICRyb290U2NvcGUucGFzc3dvcmQgPSAkc2NvcGUucGFzc3dvcmQ7XG4gIC8vICAgICAkc2NvcGUubG9nZ2VkSW4gPSB0cnVlO1xuICAvLyAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgLy8gICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgLy8gICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gIC8vICAgICBhbGVydCgnV3JvbmcgUGFzc3dvcmQnKTtcbiAgLy8gICB9KTtcbiAgLy8gfVxuXG4gICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAkaHR0cC5nZXQoJy9hcGkvbG9nb3V0JykudGhlbihmdW5jdGlvbigpIHtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hZG1pbic7XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgYWxlcnQoJ1dyb25nIFBhc3N3b3JkJyk7XG4gICAgfSk7XG4gIH1cblxufSkiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkb3dubG9hZCcsIHtcblx0XHR1cmw6ICcvZG93bmxvYWQnLFxuXHRcdHRlbXBsYXRlVXJsOiAnanMvZG93bmxvYWRUcmFjay92aWV3cy9kb3dubG9hZFRyYWNrLnZpZXcuaHRtbCcsXG5cdFx0Y29udHJvbGxlcjogJ0Rvd25sb2FkVHJhY2tDb250cm9sbGVyJ1xuXHR9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignRG93bmxvYWRUcmFja0NvbnRyb2xsZXInLCBbJyRyb290U2NvcGUnLFxuXHQnJHN0YXRlJyxcblx0JyRzY29wZScsXG5cdCckaHR0cCcsXG5cdCckbG9jYXRpb24nLFxuXHQnJHdpbmRvdycsXG5cdCdEb3dubG9hZFRyYWNrU2VydmljZScsXG5cdGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uLCAkd2luZG93LCBEb3dubG9hZFRyYWNrU2VydmljZSkge1xuXG5cdFx0LyogTm9ybWFsIEpTIHZhcnMgYW5kIGZ1bmN0aW9ucyBub3QgYm91bmQgdG8gc2NvcGUgKi9cblxuXHRcdHZhciB0YXNrT2JqID0ge307XG5cdFx0dmFyIHRyYWNrID0ge307XG5cdFx0dmFyIHRyYWNrRGF0YSA9IHt9O1xuXHRcdHZhciBwbGF5ZXJPYmogPSBudWxsO1xuXG5cdFx0LyogJHNjb3BlIGJpbmRpbmdzIHN0YXJ0ICovXG5cblx0XHQkc2NvcGUudHJhY2tEYXRhID0ge1xuXHRcdFx0dHJhY2tOYW1lOiAnTWl4aW5nIGFuZCBNYXN0ZXJpbmcnLFxuXHRcdFx0dXNlck5hbWU6ICdsYSB0cm9waWNhbCdcblx0XHR9O1xuXHRcdCRzY29wZS50b2dnbGUgPSB0cnVlO1xuXHRcdCRzY29wZS50b2dnbGVQbGF5ID0gZnVuY3Rpb24oKSB7XG5cdFx0XHQkc2NvcGUudG9nZ2xlID0gISRzY29wZS50b2dnbGU7XG5cdFx0XHRpZiAoJHNjb3BlLnRvZ2dsZSkge1xuXHRcdFx0XHRwbGF5ZXJPYmoucGF1c2UoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHBsYXllck9iai5wbGF5KCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdCRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG5cdFx0JHNjb3BlLmVtYmVkVHJhY2sgPSBmYWxzZTtcblx0XHQkc2NvcGUuZG93bmxvYWRVUkxOb3RGb3VuZCA9IGZhbHNlO1xuXHRcdCRzY29wZS5lcnJvclRleHQgPSAnJztcblx0XHQkc2NvcGUuZm9sbG93Qm94SW1hZ2VVcmwgPSAnYXNzZXRzL2ltYWdlcy93aG8td2UtYXJlLnBuZyc7XG5cblx0XHQvKiBEZWZhdWx0IHByb2Nlc3Npbmcgb24gcGFnZSBsb2FkICovXG5cblx0XHQkc2NvcGUuZ2V0RG93bmxvYWRUcmFjayA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHQkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG5cdFx0XHR2YXIgdHJhY2tJRCA9ICRsb2NhdGlvbi5zZWFyY2goKS50cmFja2lkO1xuXHRcdFx0RG93bmxvYWRUcmFja1NlcnZpY2Vcblx0XHRcdFx0LmdldENvbmZpZygpXG5cdFx0XHRcdC50aGVuKGluaXRTQylcblx0XHRcdFx0LnRoZW4oZmV0Y2hEb3dubG9hZFRyYWNrKVxuXHRcdFx0XHQudGhlbihyZWNlaXZlRG93bmxvYWRUcmFjaylcblx0XHRcdFx0LnRoZW4ocmVjZWl2ZVRyYWNrRGF0YSlcblx0XHRcdFx0LnRoZW4oaW5pdFBsYXkpXG5cdFx0XHRcdC5jYXRjaChjYXRjaERvd25sb2FkVHJhY2tFcnJvcik7XG5cblx0XHRcdGZ1bmN0aW9uIGluaXRTQyhyZXMpIHtcblx0XHRcdFx0cmV0dXJuIFNDLmluaXRpYWxpemUoe1xuXHRcdFx0XHRcdGNsaWVudF9pZDogcmVzLmRhdGEuY2xpZW50SUQsXG5cdFx0XHRcdFx0cmVkaXJlY3RfdXJpOiByZXMuZGF0YS5jYWxsYmFja1VSTCxcblx0XHRcdFx0XHRzY29wZTogJ25vbi1leHBpcmluZydcblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIGZldGNoRG93bmxvYWRUcmFjaygpIHtcblx0XHRcdFx0cmV0dXJuIERvd25sb2FkVHJhY2tTZXJ2aWNlLmdldERvd25sb2FkVHJhY2sodHJhY2tJRCk7XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIHJlY2VpdmVEb3dubG9hZFRyYWNrKHJlc3VsdCkge1xuXHRcdFx0XHR0cmFjayA9IHtcblx0XHRcdFx0XHR0cmFja1VSTDogcmVzdWx0LmRhdGEudHJhY2tVUkwsXG5cdFx0XHRcdFx0ZG93bmxvYWRVUkw6IHJlc3VsdC5kYXRhLmRvd25sb2FkVVJMLFxuXHRcdFx0XHRcdGFydHdvcmtVUkw6IHJlc3VsdC5kYXRhLmFydHdvcmtVUkwsXG5cdFx0XHRcdFx0ZW1haWw6IHJlc3VsdC5kYXRhLmVtYWlsLFxuXHRcdFx0XHRcdHBsYXlsaXN0SUQ6IHJlc3VsdC5kYXRhLnBsYXlsaXN0SURcblx0XHRcdFx0fTtcblx0XHRcdFx0JHNjb3BlLmJhY2tncm91bmRTdHlsZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHQnYmFja2dyb3VuZC1pbWFnZSc6ICd1cmwoJyArIHRyYWNrLmFydHdvcmtVUkwgKyAnKScsXG5cdFx0XHRcdFx0XHQnYmFja2dyb3VuZC1yZXBlYXQnOiAnbm8tcmVwZWF0Jyxcblx0XHRcdFx0XHRcdCdiYWNrZ3JvdW5kLXNpemUnOiAnY292ZXInXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBEb3dubG9hZFRyYWNrU2VydmljZS5nZXRUcmFja0RhdGEodHJhY2spO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiByZWNlaXZlVHJhY2tEYXRhKHJlc3VsdCkge1xuXHRcdFx0XHRjb25zb2xlLmxvZyhyZXN1bHQuZGF0YSk7XG5cdFx0XHRcdHRyYWNrRGF0YSA9IHtcblx0XHRcdFx0XHR0cmFja0lEOiByZXN1bHQuZGF0YS5pZCxcblx0XHRcdFx0XHRhcnRpc3RJRDogcmVzdWx0LmRhdGEudXNlcl9pZCxcblx0XHRcdFx0XHR0aXRsZTogcmVzdWx0LmRhdGEudGl0bGUsXG5cdFx0XHRcdFx0ZG93bmxvYWRVUkw6IHJlc3VsdC5kYXRhLmRvd25sb2FkX3VybCxcblx0XHRcdFx0XHR0cmFja1VSTDogcmVzdWx0LmRhdGEudHJhY2tVUkxcblx0XHRcdFx0fTtcblx0XHRcdFx0JHNjb3BlLmZvbGxvd0JveEltYWdlVXJsID0gcmVzdWx0LmRhdGEudXNlci5hdmF0YXJfdXJsO1xuXG5cdFx0XHRcdCRzY29wZS50cmFja0RhdGEudHJhY2tOYW1lID0gcmVzdWx0LmRhdGEudGl0bGU7XG5cdFx0XHRcdCRzY29wZS50cmFja0RhdGEudXNlck5hbWUgPSByZXN1bHQuZGF0YS51c2VyLnVzZXJuYW1lO1xuXG5cdFx0XHRcdCRzY29wZS5lbWJlZFRyYWNrID0gdHJ1ZTtcblx0XHRcdFx0JHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcblxuXHRcdFx0XHRyZXR1cm4gU0Muc3RyZWFtKCcvdHJhY2tzLycgKyB0cmFja0RhdGEudHJhY2tJRCk7XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIGluaXRQbGF5KHBsYXllcikge1xuXHRcdFx0XHRwbGF5ZXJPYmogPSBwbGF5ZXI7XG5cdFx0XHRcdC8vIHBsYXllck9iai5wbGF5KCk7XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIGNhdGNoRG93bmxvYWRUcmFja0Vycm9yKCkge1xuXHRcdFx0XHQkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuXHRcdFx0XHQkc2NvcGUuZW1iZWRUcmFjayA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH07XG5cblxuXHRcdC8qIE9uIGNsaWNrIGRvd25sb2FkIHRyYWNrIGJ1dHRvbiAqL1xuXG5cdFx0JHNjb3BlLmRvd25sb2FkVHJhY2sgPSBmdW5jdGlvbigpIHtcblx0XHRcdCRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcblx0XHRcdCRzY29wZS5lcnJvclRleHQgPSAnJztcblx0XHRcdCRodHRwLmdldCgnYXBpL3NvdW5kY2xvdWQvc291bmRjbG91ZENvbmZpZycpXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0XHRcdFNDLmluaXRpYWxpemUoe1xuXHRcdFx0XHRcdFx0Y2xpZW50X2lkOiByZXMuZGF0YS5jbGllbnRJRCxcblx0XHRcdFx0XHRcdHJlZGlyZWN0X3VyaTogcmVzLmRhdGEuY2FsbGJhY2tVUkwsXG5cdFx0XHRcdFx0XHRzY29wZTogJ25vbi1leHBpcmluZydcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHQkc2NvcGUuY2xpZW50SURTdHJpbmcgPSByZXMuZGF0YS5jbGllbnRJRC50b1N0cmluZygpO1xuXHRcdFx0XHRcdHJldHVybiBTQy5jb25uZWN0KCk7XG5cdFx0XHRcdH0pXG5cdFx0XHRcdC50aGVuKHBlcmZvcm1UYXNrcylcblx0XHRcdFx0LnRoZW4oaW5pdERvd25sb2FkKVxuXHRcdFx0XHQuY2F0Y2goY2F0Y2hUYXNrc0Vycm9yKVxuXG5cdFx0XHRmdW5jdGlvbiBwZXJmb3JtVGFza3MocmVzKSB7XG5cdFx0XHRcdHRhc2tPYmogPSB7XG5cdFx0XHRcdFx0dG9rZW46IHJlcy5vYXV0aF90b2tlbixcblx0XHRcdFx0XHR0cmFja0lEOiB0cmFja0RhdGEudHJhY2tJRCxcblx0XHRcdFx0XHRhcnRpc3RJRDogdHJhY2tEYXRhLmFydGlzdElELFxuXHRcdFx0XHRcdHBsYXlsaXN0SUQ6IHRyYWNrLnBsYXlsaXN0SURcblx0XHRcdFx0fTtcblx0XHRcdFx0cmV0dXJuIERvd25sb2FkVHJhY2tTZXJ2aWNlLnBlcmZvcm1UYXNrcyh0YXNrT2JqKTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gaW5pdERvd25sb2FkKHJlcykge1xuXHRcdFx0XHRpZiAodHJhY2suZG93bmxvYWRVUkwgJiYgdHJhY2suZG93bmxvYWRVUkwgIT09ICcnKSB7XG5cdFx0XHRcdFx0JHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gdHJhY2suZG93bmxvYWRVUkw7XG5cdFx0XHRcdH0gZWxzZSBpZiAodHJhY2tEYXRhLmRvd25sb2FkVVJMICYmIHRhc2tPYmoudG9rZW4pIHtcblx0XHRcdFx0XHQkd2luZG93LmxvY2F0aW9uLmhyZWYgPSB0cmFja0RhdGEuZG93bmxvYWRVUkwgKyAnP2NsaWVuZF9pZD0nICsgJHNjb3BlLmNsaWVudElEU3RyaW5nICsgJyZvYXV0aF90b2tlbj0nICsgdGFza09iai50b2tlbi50b1N0cmluZygpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCRzY29wZS5lcnJvclRleHQgPSAnRXJyb3IhIENvdWxkIG5vdCBmZXRjaCBkb3dubG9hZCBVUkwnO1xuXHRcdFx0XHRcdCRzY29wZS5kb3dubG9hZFVSTE5vdEZvdW5kID0gdHJ1ZTtcblx0XHRcdFx0XHQkc2NvcGUuJGFwcGx5KCk7XG5cdFx0XHRcdH1cblx0XHRcdFx0JHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gY2F0Y2hUYXNrc0Vycm9yKGVycikge1xuXHRcdFx0XHRhbGVydCgnRXJyb3IgaW4gcHJvY2Vzc2luZyB5b3VyIHJlcXVlc3QnKTtcblx0XHRcdFx0JHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcblx0XHRcdH1cblxuXHRcdH07XG5cdH1cbl0pOyIsImFwcC5zZXJ2aWNlKCdEb3dubG9hZFRyYWNrU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbigkaHR0cCkge1xuXG5cdGZ1bmN0aW9uIGdldERvd25sb2FkVHJhY2soZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZG93bmxvYWQvdHJhY2s/dHJhY2tJRD0nICsgZGF0YSk7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRUcmFja0RhdGEoZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIHtcblx0XHRcdHVybDogZGF0YS50cmFja1VSTFxuXHRcdH0pO1xuXHR9XG5cblx0ZnVuY3Rpb24gcGVyZm9ybVRhc2tzKGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnYXBpL2Rvd25sb2FkL3Rhc2tzJywgZGF0YSk7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRDb25maWcoKSB7XG5cdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS9zb3VuZGNsb3VkL3NvdW5kY2xvdWRDb25maWcnKTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0Z2V0RG93bmxvYWRUcmFjazogZ2V0RG93bmxvYWRUcmFjayxcblx0XHRnZXRUcmFja0RhdGE6IGdldFRyYWNrRGF0YSxcblx0XHRwZXJmb3JtVGFza3M6IHBlcmZvcm1UYXNrcyxcblx0XHRnZXRDb25maWc6IGdldENvbmZpZ1xuXHR9O1xufV0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2hvbWUnLCB7XG4gICAgICB1cmw6ICcvJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS92aWV3cy9ob21lLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJ1xuICAgIH0pXG4gICAgLnN0YXRlKCdhYm91dCcsIHtcbiAgICAgIHVybDogJy9hYm91dCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvYWJvdXQuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnSG9tZUNvbnRyb2xsZXInXG4gICAgfSlcbiAgICAuc3RhdGUoJ3NlcnZpY2VzJywge1xuICAgICAgdXJsOiAnL3NlcnZpY2VzJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS92aWV3cy9zZXJ2aWNlcy5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcbiAgICB9KVxuICAgIC5zdGF0ZSgnYXJ0aXN0VG9vbHMnLCB7XG4gICAgICB1cmw6ICcvYXJ0aXN0LXRvb2xzJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS92aWV3cy9hcnRpc3QtdG9vbHMuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnSG9tZUNvbnRyb2xsZXInXG4gICAgfSlcbiAgICAuc3RhdGUoJ2ZhcXMnLCB7XG4gICAgICB1cmw6ICcvZmFxcycsXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvZmFxcy5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwbHknLCB7XG4gICAgICB1cmw6ICcvYXBwbHknLFxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL3ZpZXdzL2FwcGx5Lmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJ1xuICAgIH0pXG4gICAgLnN0YXRlKCdjb250YWN0Jywge1xuICAgICAgdXJsOiAnL2NvbnRhY3QnLFxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL3ZpZXdzL2NvbnRhY3QuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnSG9tZUNvbnRyb2xsZXInXG4gICAgfSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0hvbWVDb250cm9sbGVyJywgWyckcm9vdFNjb3BlJyxcbiAgJyRzdGF0ZScsXG4gICckc2NvcGUnLFxuICAnJGh0dHAnLFxuICAnJGxvY2F0aW9uJyxcbiAgJyR3aW5kb3cnLFxuICAnSG9tZVNlcnZpY2UnLFxuICBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgJHdpbmRvdywgSG9tZVNlcnZpY2UpIHtcblxuICAgICRzY29wZS5hcHBsaWNhdGlvbk9iaiA9IHt9O1xuICAgICRzY29wZS5hcnRpc3QgPSB7fTtcbiAgICAkc2NvcGUuc2VudCA9IHtcbiAgICAgIGFwcGxpY2F0aW9uOiBmYWxzZSxcbiAgICAgIGFydGlzdEVtYWlsOiBmYWxzZVxuICAgIH07XG4gICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICBhcHBsaWNhdGlvbjoge1xuICAgICAgICB2YWw6ICcnLFxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgfSxcbiAgICAgIGFydGlzdEVtYWlsOiB7XG4gICAgICAgIHZhbDogJycsXG4gICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qIEFwcGx5IHBhZ2Ugc3RhcnQgKi9cblxuICAgICRzY29wZS50b2dnbGVBcHBsaWNhdGlvblNlbnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5tZXNzYWdlID0ge1xuICAgICAgICBhcHBsaWNhdGlvbjoge1xuICAgICAgICAgIHZhbDogJycsXG4gICAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5zZW50LmFwcGxpY2F0aW9uID0gISRzY29wZS5zZW50LmFwcGxpY2F0aW9uO1xuICAgIH07XG5cbiAgICAkc2NvcGUuc2F2ZUFwcGxpY2F0aW9uID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICRzY29wZS5tZXNzYWdlLmFwcGxpY2F0aW9uID0ge1xuICAgICAgICB2YWw6ICcnLFxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgfTtcblxuICAgICAgSG9tZVNlcnZpY2VcbiAgICAgICAgLnNhdmVBcHBsaWNhdGlvbigkc2NvcGUuYXBwbGljYXRpb25PYmopXG4gICAgICAgIC50aGVuKHNhdmVBcHBsaWNhdGlvblJlc3BvbnNlKVxuICAgICAgICAuY2F0Y2goc2F2ZUFwcGxpY2F0aW9uRXJyb3IpXG5cbiAgICAgIGZ1bmN0aW9uIHNhdmVBcHBsaWNhdGlvblJlc3BvbnNlKHJlcykge1xuICAgICAgICBpZiAocmVzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgJHNjb3BlLmFwcGxpY2F0aW9uT2JqID0ge307XG4gICAgICAgICAgJHNjb3BlLnNlbnQuYXBwbGljYXRpb24gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNhdmVBcHBsaWNhdGlvbkVycm9yKHJlcykge1xuICAgICAgICBpZihyZXMuc3RhdHVzID09PSA0MDApIHtcbiAgICAgICAgICAkc2NvcGUubWVzc2FnZS5hcHBsaWNhdGlvbiA9IHtcbiAgICAgICAgICAgIHZhbDogJ0VtYWlsIGFscmVhZHkgZXhpc3RzIScsXG4gICAgICAgICAgICB2aXNpYmxlOiB0cnVlXG4gICAgICAgICAgfTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgJHNjb3BlLm1lc3NhZ2UuYXBwbGljYXRpb24gPSB7XG4gICAgICAgICAgdmFsOiAnRXJyb3IgaW4gcHJvY2Vzc2luZyB5b3VyIHJlcXVlc3QnLFxuICAgICAgICAgIHZpc2libGU6IHRydWVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyogQXBwbHkgcGFnZSBlbmQgKi9cblxuICAgIC8qIEFydGlzdCBUb29scyBwYWdlIHN0YXJ0ICovXG4gICAgXG4gICAgJHNjb3BlLnRvZ2dsZUFydGlzdEVtYWlsID0gZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgICAgYXJ0aXN0RW1haWw6IHtcbiAgICAgICAgICB2YWw6ICcnLFxuICAgICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUuc2VudC5hcnRpc3RFbWFpbCA9ICEkc2NvcGUuc2VudC5hcnRpc3RFbWFpbDtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnNhdmVBcnRpc3RFbWFpbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgSG9tZVNlcnZpY2VcbiAgICAgICAgLnNhdmVBcnRpc3RFbWFpbCgkc2NvcGUuYXJ0aXN0KVxuICAgICAgICAudGhlbihhcnRpc3RFbWFpbFJlc3BvbnNlKVxuICAgICAgICAuY2F0Y2goYXJ0aXN0RW1haWxFcnJvcilcblxuICAgICAgZnVuY3Rpb24gYXJ0aXN0RW1haWxSZXNwb25zZShyZXMpIHtcbiAgICAgICAgaWYgKHJlcy5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICRzY29wZS5hcnRpc3QgPSB7fTtcbiAgICAgICAgICAkc2NvcGUuc2VudC5hcnRpc3RFbWFpbCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gYXJ0aXN0RW1haWxFcnJvcihyZXMpIHtcbiAgICAgICAgaWYocmVzLnN0YXR1cyA9PT0gNDAwKSB7XG4gICAgICAgICAgJHNjb3BlLm1lc3NhZ2UuYXJ0aXN0RW1haWwgPSB7XG4gICAgICAgICAgICB2YWw6ICdFbWFpbCBhbHJlYWR5IGV4aXN0cyEnLFxuICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZVxuICAgICAgICAgIH07XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLm1lc3NhZ2UuYXJ0aXN0RW1haWwgPSB7XG4gICAgICAgICAgdmFsOiAnRXJyb3IgaW4gcHJvY2Vzc2luZyB5b3VyIHJlcXVlc3QnLFxuICAgICAgICAgIHZpc2libGU6IHRydWVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyogQXJ0aXN0IFRvb2xzIHBhZ2UgZW5kICovXG4gIH1cbl0pO1xuXG5hcHAuZGlyZWN0aXZlKCdhZmZpeGVyJywgZnVuY3Rpb24oJHdpbmRvdykge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgIGxpbms6IGZ1bmN0aW9uKCRzY29wZSwgJGVsZW1lbnQpIHtcbiAgICAgIHZhciB3aW4gPSBhbmd1bGFyLmVsZW1lbnQoJHdpbmRvdyk7XG4gICAgICB2YXIgdG9wT2Zmc2V0ID0gJGVsZW1lbnRbMF0ub2Zmc2V0VG9wO1xuXG4gICAgICBmdW5jdGlvbiBhZmZpeEVsZW1lbnQoKSB7XG5cbiAgICAgICAgaWYgKCR3aW5kb3cucGFnZVlPZmZzZXQgPiB0b3BPZmZzZXQpIHtcbiAgICAgICAgICAkZWxlbWVudC5jc3MoJ3Bvc2l0aW9uJywgJ2ZpeGVkJyk7XG4gICAgICAgICAgJGVsZW1lbnQuY3NzKCd0b3AnLCAnMy41JScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICRlbGVtZW50LmNzcygncG9zaXRpb24nLCAnJyk7XG4gICAgICAgICAgJGVsZW1lbnQuY3NzKCd0b3AnLCAnJyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgJHNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgd2luLnVuYmluZCgnc2Nyb2xsJywgYWZmaXhFbGVtZW50KTtcbiAgICAgIH0pO1xuICAgICAgd2luLmJpbmQoJ3Njcm9sbCcsIGFmZml4RWxlbWVudCk7XG4gICAgfVxuICB9O1xufSkiLCJcblxuYXBwLnNlcnZpY2UoJ0hvbWVTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKXtcblx0XG5cdGZ1bmN0aW9uIHNhdmVBcHBsaWNhdGlvbihkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvaG9tZS9hcHBsaWNhdGlvbicsIGRhdGEpO1xuXHR9XG5cblx0ZnVuY3Rpb24gc2F2ZUFydGlzdEVtYWlsKGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9ob21lL2FydGlzdGVtYWlsJywgZGF0YSk7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHNhdmVBcHBsaWNhdGlvbjogc2F2ZUFwcGxpY2F0aW9uLFxuXHRcdHNhdmVBcnRpc3RFbWFpbDogc2F2ZUFydGlzdEVtYWlsXG5cdH07XG59XSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdwcmVtaWVyJywge1xuXHRcdHVybDogJy9wcmVtaWVyJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL3ByZW1pZXIvdmlld3MvcHJlbWllci5odG1sJyxcblx0XHRjb250cm9sbGVyOiAnUHJlbWllckNvbnRyb2xsZXInXG5cdH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdQcmVtaWVyQ29udHJvbGxlcicsIFsnJHJvb3RTY29wZScsXG5cdCckc3RhdGUnLFxuXHQnJHNjb3BlJyxcblx0JyRodHRwJyxcblx0JyRsb2NhdGlvbicsXG5cdCckd2luZG93JyxcbiAgJ1ByZW1pZXJTZXJ2aWNlJyxcblx0ZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCAkbG9jYXRpb24sICR3aW5kb3csIFByZW1pZXJTZXJ2aWNlKSB7XG5cbiAgICAkc2NvcGUucHJlbWllck9iaiA9IHt9O1xuXG4gICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICB2YWw6ICcnLFxuICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICB9O1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgJHNjb3BlLnNhdmVQcmVtaWVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAkc2NvcGUubWVzc2FnZS52aXNpYmxlID0gZmFsc2U7XG4gICAgICB2YXIgZGF0YSA9IG5ldyBGb3JtRGF0YSgpO1xuICAgICAgZm9yKHZhciBwcm9wIGluICRzY29wZS5wcmVtaWVyT2JqKSB7XG4gICAgICAgIGRhdGEuYXBwZW5kKHByb3AsICRzY29wZS5wcmVtaWVyT2JqW3Byb3BdKTtcbiAgICAgIH1cbiAgICAgIFByZW1pZXJTZXJ2aWNlXG4gICAgICAgIC5zYXZlUHJlbWllcihkYXRhKVxuICAgICAgICAudGhlbihyZWNlaXZlUmVzcG9uc2UpXG4gICAgICAgIC5jYXRjaChjYXRjaEVycm9yKTtcblxuICAgICAgZnVuY3Rpb24gcmVjZWl2ZVJlc3BvbnNlKHJlcykge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICBpZihyZXMuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAkc2NvcGUubWVzc2FnZS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAkc2NvcGUubWVzc2FnZS52YWwgPSAnVGhhbmsgeW91ISBZb3VyIG1lc3NhZ2UgaGFzIGJlZW4gc2VudCBzdWNjZXNzZnVsbHkuJztcbiAgICAgICAgICAkc2NvcGUucHJlbWllck9iaiA9IHt9O1xuICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChcImlucHV0W3R5cGU9J2ZpbGUnXVwiKS52YWwobnVsbCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgICRzY29wZS5tZXNzYWdlLnZpc2libGUgPSB0cnVlO1xuICAgICAgICAkc2NvcGUubWVzc2FnZS52YWwgPSAnRXJyb3IgaW4gcHJvY2Vzc2luZyB0aGUgcmVxdWVzdC4gUGxlYXNlIHRyeSBhZ2Fpbi4nO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBjYXRjaEVycm9yKHJlcykge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICBpZihyZXMuc3RhdHVzID09PSA0MDApIHtcbiAgICAgICAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgICAgICB2YWw6IHJlcy5kYXRhXG4gICAgICAgICAgfTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgICB2YWw6ICdFcnJvciBpbiBwcm9jZXNzaW5nIHRoZSByZXF1ZXN0LiBQbGVhc2UgdHJ5IGFnYWluLidcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xufV0pO1xuXG4iLCJcblxuYXBwLnNlcnZpY2UoJ1ByZW1pZXJTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKXtcblx0XG5cdGZ1bmN0aW9uIHNhdmVQcmVtaWVyKGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAoe1xuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHR1cmw6ICcvYXBpL3ByZW1pZXInLFxuXHRcdFx0aGVhZGVyczogeydDb250ZW50LVR5cGUnOiB1bmRlZmluZWQgfSxcblx0XHRcdHRyYW5zZm9ybVJlcXVlc3Q6IGFuZ3VsYXIuaWRlbnRpdHksXG5cdFx0XHRkYXRhOiBkYXRhXG5cdFx0fSk7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHNhdmVQcmVtaWVyOiBzYXZlUHJlbWllclxuXHR9O1xufV0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
