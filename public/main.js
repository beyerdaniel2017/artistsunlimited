'use strict';
window.app = angular.module('FullstackGeneratedApp', ['fsaPreBuilt', 'ui.router', 'ui.bootstrap', 'ngAnimate', 'ngCookies', 'yaru22.angular-timeago']);

app.config(function ($urlRouterProvider, $locationProvider, $uiViewScrollProvider) {
  // This turns off hashbang urls (/#about) and changes it to something normal (/about)
  $locationProvider.html5Mode(true);
  // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
  $urlRouterProvider.otherwise('/');
  // $uiViewScrollProvider.useAnchorScroll();
});

// This app.run is for controlling access to specific states.
app.run(function ($rootScope, AuthService, $state, $uiViewScroll, SessionService, AppConfig) {
  // The given state requires an authenticated user.
  // var destinationStateRequiresAuth = function (state) {
  //     return state.data && state.data.authenticate;
  // };

  AppConfig.fetchConfig().then(function (res) {
    // console.log(res);
    AppConfig.setConfig(res.data);
    // console.log(AppConfig.isConfigParamsvailable);
  });

  // $stateChangeStart is an event fired
  // whenever the process of changing a state begins.
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {
    // if(toState = 'artistTools') {
    //     var user = SessionService.getUser();
    //     console.log(user);
    // }
    // console.log('reached here');
    // if (!destinationStateRequiresAuth(toState)) {
    //     // The destination state does not require authentication
    //     // Short circuit with return.
    //     return;
    // }

    // if (AuthService.isAuthenticated()) {
    //     // The user is authenticated.
    //     // Short circuit with return.
    //     return;
    // }

    // // Cancel navigating to new state.
    // event.preventDefault();

    // AuthService.getLoggedInUser().then(function (user) {
    //     // If a user is retrieved, then renavigate to the destination
    //     // (the second time, AuthService.isAuthenticated() will work)
    //     // otherwise, if no user is logged in, go to "login" state.
    //     if (user) {
    //         $state.go(toState.name, toParams);
    //     } else {
    //         $state.go('login');
    //     }
    // });

  });
});

app.directive('fileread', [function () {
  return {
    scope: {
      fileread: '=',
      message: '='
    },
    link: function link(scope, element, attributes) {
      element.bind('change', function (changeEvent) {
        scope.$apply(function () {
          scope.message = {
            visible: false,
            val: ''
          };

          if (changeEvent.target.files[0].type != "audio/mpeg" && changeEvent.target.files[0].type != "audio/mp3") {
            scope.message = {
              visible: true,
              val: 'Error: Please upload mp3 format file.'
            };
            element.val(null);
            return;
          }

          if (changeEvent.target.files[0].size > 20 * 1000 * 1000) {
            scope.message = {
              visible: true,
              val: 'Error: Please upload file upto 20 MB size.'
            };
            element.val(null);
            return;
          }
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

  app.factory('AppConfig', function ($http) {
    var _configParams = null;
    function fetchConfig() {
      return $http.get('/api/soundcloud/soundcloudConfig');
    }

    function setConfig(data) {
      _configParams = data;
      SC.initialize({
        client_id: data.clientID,
        redirect_uri: data.callbackURL,
        scope: "non-expiring"
      });
    }

    function getConfig() {
      return _configParams;
    }

    return {
      fetchConfig: fetchConfig,
      getConfig: getConfig,
      setConfig: setConfig
    };
  });

  // AUTH_EVENTS is used throughout our app to
  // broadcast and listen from and to the $rootScope
  // for important events about authentication flow.
  // app.constant('AUTH_EVENTS', {
  //     loginSuccess: 'auth-login-success',
  //     loginFailed: 'auth-login-failed',
  //     logoutSuccess: 'auth-logout-success',
  //     sessionTimeout: 'auth-session-timeout',
  //     notAuthenticated: 'auth-not-authenticated',
  //     notAuthorized: 'auth-not-authorized'
  // });

  // app.factory('AuthInterceptor', function($rootScope, $q, AUTH_EVENTS) {
  //     var statusDict = {
  //         401: AUTH_EVENTS.notAuthenticated,
  //         403: AUTH_EVENTS.notAuthorized,
  //         419: AUTH_EVENTS.sessionTimeout,
  //         440: AUTH_EVENTS.sessionTimeout
  //     };
  //     return {
  //         responseError: function(response) {
  //             $rootScope.$broadcast(statusDict[response.status], response);
  //             return $q.reject(response)
  //         }
  //     };
  // });

  // app.config(function($httpProvider) {
  //     $httpProvider.interceptors.push([
  //         '$injector',
  //         function($injector) {
  //             return $injector.get('AuthInterceptor');
  //         }
  //     ]);
  // });

  // app.service('AuthService', function($http, Session, $rootScope, AUTH_EVENTS, $q) {

  //     function onSuccessfulLogin(response) {
  //         var data = response.data;
  //         Session.create(data.id, data.user);
  //         $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
  //         return data.user;
  //     }

  //     // Uses the session factory to see if an
  //     // authenticated user is currently registered.
  //     this.isAuthenticated = function() {
  //         return !!Session.user;
  //     };

  //     this.getLoggedInUser = function(fromServer) {

  //         // If an authenticated session exists, we
  //         // return the user attached to that session
  //         // with a promise. This ensures that we can
  //         // always interface with this method asynchronously.

  //         // Optionally, if true is given as the fromServer parameter,
  //         // then this cached value will not be used.

  //         if (this.isAuthenticated() && fromServer !== true) {
  //             return $q.when(Session.user);
  //         }

  //         // Make request GET /session.
  //         // If it returns a user, call onSuccessfulLogin with the response.
  //         // If it returns a 401 response, we catch it and instead resolve to null.
  //         return $http.get('/session').then(onSuccessfulLogin).catch(function() {
  //             return null;
  //         });

  //     };

  //     this.login = function(credentials) {
  //         return $http.post('/login', credentials)
  //             .then(onSuccessfulLogin)
  //             .catch(function() {
  //                 return $q.reject({
  //                     message: 'Invalid login credentials.'
  //                 });
  //             });
  //     };

  //     this.logout = function() {
  //         return $http.get('/logout').then(function() {
  //             Session.destroy();
  //             $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
  //         });
  //     };
  // });

  // app.service('Session', function($rootScope, AUTH_EVENTS) {

  //     var self = this;

  //     $rootScope.$on(AUTH_EVENTS.notAuthenticated, function() {
  //         self.destroy();
  //     });

  //     $rootScope.$on(AUTH_EVENTS.sessionTimeout, function() {
  //         self.destroy();
  //     });

  //     this.id = null;
  //     this.user = null;

  //     this.create = function(sessionId, user) {
  //         this.id = sessionId;
  //         this.user = user;
  //     };

  //     this.destroy = function() {
  //         this.id = null;
  //         this.user = null;
  //     };

  // });
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

    SC.connect().then(function (res) {
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
  $stateProvider.state('pay', {
    url: '/pay/:submissionID',
    templateUrl: 'js/pay/pay.html',
    controller: 'PayController',
    resolve: {
      channels: function channels($http) {
        return $http.get('/api/channels').then(function (res) {
          return res.data;
        });
      },
      submission: function submission($http, $stateParams) {
        return $http.get('/api/submissions/withID/' + $stateParams.submissionID).then(function (res) {
          return res.data;
        });
      },
      track: function track(submission) {
        return SC.get('/tracks/' + submission.trackID).then(function (track) {
          return track;
        });
      }
    }
  });
});

app.controller('PayController', function ($scope, $rootScope, $http, channels, submission, track, $state, $uibModal) {
  $rootScope.submission = submission;
  $scope.auDLLink = false;
  if (submission.paid) $state.go('home');
  $scope.track = track;
  SC.oEmbed(track.uri, {
    element: document.getElementById('scPlayer'),
    auto_play: false,
    maxheight: 150
  });
  $scope.total = 0;
  $scope.channels = channels.filter(function (ch) {
    return submission.channelIDS.indexOf(ch.channelID) != -1;
  });

  $scope.auDLLink = $scope.track.purchase_url ? $scope.track.purchase_url.indexOf("artistsunlimited.co") != -1 : false;

  $scope.selectedChannels = {};
  $scope.channels.forEach(function (ch) {
    $scope.selectedChannels[ch.displayName] = false;
  });

  $scope.goToLogin = function () {
    $state.go('login', {
      'submission': $rootScope.submission
    });
  };

  $scope.recalculate = function () {
    $scope.total = 0;
    $scope.totalPayment = 0;
    for (var key in $scope.selectedChannels) {
      if ($scope.selectedChannels[key]) {
        var chan = $scope.channels.find(function (ch) {
          return ch.displayName == key;
        });
        $scope.total += chan.price;
      }
    }
    if ($scope.auDLLink) $scope.total = Math.floor(0.9 * $scope.total);
  };

  $scope.makePayment = function () {
    if ($scope.total != 0) {
      if ($scope.auDLLink) {
        $scope.discountModalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'discountModal.html',
          controller: 'discountModalController',
          scope: $scope
        });
      } else {
        $scope.continuePay(false);
      }
    }
  };

  $scope.continuePay = function (discounted) {
    if ($scope.discountedModal) {
      $scope.discountModalInstance.close();
    }
    $scope.processing = true;
    var pricingObj = {
      channels: [],
      discounted: discounted,
      submission: $rootScope.submission
    };
    for (var key in $scope.selectedChannels) {
      if ($scope.selectedChannels[key]) {
        var chan = $scope.channels.find(function (ch) {
          return ch.displayName == key;
        });
        pricingObj.channels.push(chan.channelID);
      }
    }
    $http.post('/api/submissions/getPayment', pricingObj).then(function (res) {
      window.location = res.data;
    });
  };
});

app.controller('discountModalController', function ($scope) {});
app.config(function ($stateProvider) {
  $stateProvider.state('complete', {
    url: '/complete',
    templateUrl: 'js/pay/thankyou.html',
    controller: 'ThankyouController'
  });
});

app.controller('ThankyouController', function ($http, $scope, $location) {
  $scope.processing = true;
  $http.put('/api/submissions/completedPayment', $location.search()).then(function (res) {
    $scope.processing = false;
    $scope.submission = res.data.submission;
    $scope.events = res.data.events;
    $scope.events.forEach(function (ev) {
      ev.date = new Date(ev.date);
    });
  });
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
  $stateProvider.state('login', {
    url: '/login',
    params: {
      submission: null
    },
    templateUrl: 'js/auth/views/login.html',
    controller: 'AuthController'
  }).state('signup', {
    url: '/signup',
    templateUrl: 'js/auth/views/signup.html',
    controller: 'AuthController'
  });
});

app.controller('AuthController', function ($rootScope, $state, $stateParams, $scope, $http, $uibModal, $window, AuthService, SessionService, socket) {
  $scope.loginObj = {};
  $scope.message = {
    val: '',
    visible: false
  };
  $scope.openModal = {
    signupConfirm: function signupConfirm() {
      $scope.modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'signupComplete.html',
        controller: 'AuthController',
        scope: $scope
      });
    }
  };
  $scope.login = function () {
    $scope.message = {
      val: '',
      visible: false
    };
    AuthService.login($scope.loginObj).then(handleLoginResponse)['catch'](handleLoginError);

    function handleLoginResponse(res) {
      if (res.status === 200 && res.data.success) {
        SessionService.create(res.data.user);
        $state.go('artistTools.downloadGateway.list');
      } else {
        $scope.message = {
          val: res.data.message,
          visible: true
        };
      }
    }

    function handleLoginError(res) {
      $scope.message = {
        val: 'Error in processing your request',
        visible: true
      };
    }
  };

  $scope.checkIfSubmission = function () {
    if ($stateParams.submission) {
      $scope.soundcloudLogin();
    }
  };

  $scope.signup = function () {
    $scope.message = {
      val: '',
      visible: false
    };
    if ($scope.signupObj.password != $scope.signupObj.confirmPassword) {
      $scope.message = {
        val: 'Password doesn\'t match with confirm password',
        visible: true
      };
      return;
    }
    AuthService.signup($scope.signupObj).then(handleSignupResponse)['catch'](handleSignupError);

    function handleSignupResponse(res) {
      $state.go('login');
    }

    function handleSignupError(res) {}
  };

  $scope.soundcloudLogin = function () {
    SC.connect().then(function (res) {
      $rootScope.accessToken = res.oauth_token;
      return $http.post('/api/login/soundCloudLogin', {
        token: res.oauth_token,
        password: 'test'
      });
    }).then(function (res) {
      $scope.processing = false;
      SessionService.create(res.data.user);
      if ($stateParams.submission) {
        $state.go('artistTools.downloadGateway.new', { 'submission': $stateParams.submission });
        return;
      }
      $state.go('artistTools.downloadGateway.list');
    }).then(null, function (err) {
      alert('Error: Could not log in');
      $scope.processing = false;
    });
  };
});
app.factory('AuthService', ['$http', function ($http) {

  function login(data) {
    return $http.post('/api/login', data);
  }

  function signup(data) {
    return $http.post('/api/signup', data);
  }

  return {
    login: login,
    signup: signup
  };
}]);

app.factory('SessionService', ['$cookies', function ($cookies) {

  function create(data) {
    $cookies.putObject('user', data);
  }

  function deleteUser() {
    $cookies.remove('user');
  }

  function getUser() {
    return $cookies.get('user');
  }

  return {
    create: create,
    deleteUser: deleteUser,
    getUser: getUser
  };
}]);

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
  $stateProvider.state('downloadGate', {
    url: '/admin/downloadGate',
    templateUrl: 'js/downloadTrack/views/adminDLGate.html',
    controller: 'AdminDLGateController'
  });
});

app.config(function ($stateProvider) {
  $stateProvider.state('downloadGateList', {
    url: '/admin/downloadGate/list',
    templateUrl: 'js/downloadTrack/views/adminDLGate.list.html',
    controller: 'AdminDLGateController'
  });
});

app.config(function ($stateProvider) {
  $stateProvider.state('downloadGateEdit', {
    url: '/admin/downloadGate/edit/:gatewayID',
    templateUrl: 'js/downloadTrack/views/adminDLGate.html',
    controller: 'AdminDLGateController'
  });
});

app.controller('AdminDLGateController', ['$rootScope', '$state', '$stateParams', '$scope', '$http', '$location', '$window', '$uibModal', 'SessionService', 'AdminDLGateService', function ($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, SessionService, AdminDLGateService) {
  /* Init boolean variables for show/hide and other functionalities */
  $scope.processing = false;
  $scope.isTrackAvailable = false;
  $scope.message = {
    val: '',
    visible: false
  };

  /* Init Download Gateway form data */

  $scope.track = {
    artistUsername: 'La Tropicál',
    trackTitle: 'Panteone / Travel',
    trackArtworkURL: 'assets/images/who-we-are.png',
    SMLinks: [],
    like: false,
    comment: false,
    repost: false,
    artists: [{
      url: '',
      avatar: 'assets/images/who-we-are.png',
      username: '',
      id: -1,
      permanentLink: false
    }],
    playlists: [{
      url: '',
      avatar: '',
      title: '',
      id: ''
    }]
  };

  /* Init downloadGateway list */

  $scope.downloadGatewayList = [];

  /* Init modal instance variables and methods */

  $scope.modalInstance = {};
  $scope.modal = {};
  $scope.openModal = {
    downloadURL: function downloadURL(_downloadURL) {
      $scope.modal.downloadURL = _downloadURL;
      $scope.modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'downloadURL.html',
        controller: 'ArtistToolsController',
        scope: $scope
      });
    }
  };
  $scope.closeModal = function () {
    $scope.modalInstance.close();
  };

  /* Init profile */
  $scope.profile = {};

  /* Method for resetting Download Gateway form */

  function resetDownloadGateway() {
    $scope.processing = false;
    $scope.isTrackAvailable = false;
    $scope.message = {
      val: '',
      visible: false
    };

    $scope.track = {
      artistUsername: 'La Tropicál',
      trackTitle: 'Panteone / Travel',
      trackArtworkURL: 'assets/images/who-we-are.png',
      SMLinks: [],
      like: false,
      comment: false,
      repost: false,
      artists: [{
        url: '',
        avatar: 'assets/images/who-we-are.png',
        username: '',
        id: -1,
        permanentLink: false
      }],
      playlists: [{
        url: '',
        avatar: '',
        title: '',
        id: ''
      }]
    };
    angular.element("input[type='file']").val(null);
  }

  /* Check if stateParams has gatewayID to initiate edit */
  $scope.checkIfEdit = function () {
    if ($stateParams.gatewayID) {
      $scope.getDownloadGateway($stateParams.gatewayID);
      // if(!$stateParams.downloadGateway) {
      //   $scope.getDownloadGateway($stateParams.gatewayID);
      // } else {
      //   $scope.track = $stateParams.downloadGateway;
      // }
    }
  };

  $scope.trackURLChange = function () {
    if ($scope.track.trackURL !== '') {
      var handleTrackDataAndGetProfiles = function handleTrackDataAndGetProfiles(res) {
        $scope.track.trackTitle = res.data.title;
        $scope.track.trackID = res.data.id;
        $scope.track.artistID = res.data.user.id;
        $scope.track.trackArtworkURL = res.data.artwork_url ? res.data.artwork_url.replace('large.jpg', 't500x500.jpg') : '';
        $scope.track.artistArtworkURL = res.data.user.avatar_url ? res.data.user.avatar_url : '';
        $scope.track.artistURL = res.data.user.permalink_url;
        $scope.track.artistUsername = res.data.user.username;
        $scope.track.SMLinks = [];
        return SC.get('/users/' + $scope.track.artistID + '/web-profiles');
      };

      var handleWebProfiles = function handleWebProfiles(profiles) {
        profiles.forEach(function (prof) {
          if (['twitter', 'youtube', 'facebook', 'spotify', 'soundcloud', 'instagram'].indexOf(prof.service) != -1) {
            $scope.track.SMLinks.push({
              key: prof.service,
              value: prof.url
            });
          }
        });
        $scope.isTrackAvailable = true;
        $scope.processing = false;
      };

      var handleError = function handleError(err) {
        $scope.track.trackID = null;
        alert('Song not found or forbidden');
        $scope.processing = false;
      };

      $scope.isTrackAvailable = false;
      $scope.processing = true;
      AdminDLGateService.resolveData({
        url: $scope.track.trackURL
      }).then(handleTrackDataAndGetProfiles).then(handleWebProfiles)['catch'](handleError);
    }
  };

  $scope.artistURLChange = function (index) {
    var artist = {};
    $scope.processing = true;
    AdminDLGateService.resolveData({
      url: $scope.track.artists[index].url
    }).then(function (res) {
      $scope.track.artists[index].avatar = res.data.avatar_url;
      $scope.track.artists[index].username = res.data.username;
      $scope.track.artists[index].id = res.data.id;
      $scope.processing = false;
    })['catch'](function (err) {
      alert('Artists not found');
      $scope.processing = false;
    });
  };

  $scope.addPlaylist = function () {
    $scope.track.playlists.push({
      url: '',
      avatar: '',
      title: '',
      id: ''
    });
  };
  $scope.removePlaylist = function (index) {
    $scope.track.playlists.splice(index, 1);
  };
  $scope.playlistURLChange = function (index) {
    $scope.processing = true;
    AdminDLGateService.resolveData({
      url: $scope.track.playlists[index].url
    }).then(function (res) {
      $scope.track.playlists[index].avatar = res.data.artwork_url;
      $scope.track.playlists[index].title = res.data.title;
      $scope.track.playlists[index].id = res.data.id;
      $scope.processing = false;
    }).then(null, function (err) {
      alert('Playlist not found');
      $scope.processing = false;
    });
  };

  $scope.removeArtist = function (index) {
    $scope.track.artists.splice(index, 1);
  };

  $scope.addArtist = function () {
    if ($scope.track.artists.length > 2) {
      return false;
    }

    $scope.track.artists.push({
      url: '',
      avatar: 'assets/images/who-we-are.png',
      username: '',
      id: -1
    });
  };

  $scope.addSMLink = function () {
    // externalSMLinks++;
    // $scope.track.SMLinks['key' + externalSMLinks] = '';
    $scope.track.SMLinks.push({
      key: '',
      value: ''
    });
  };
  $scope.removeSMLink = function (index) {
    $scope.track.SMLinks.splice(index, 1);
  };
  $scope.SMLinkChange = function (index) {

    function getLocation(href) {
      var location = document.createElement("a");
      location.href = href;
      if (location.host == "") {
        location.href = location.href;
      }
      return location;
    }

    var location = getLocation($scope.track.SMLinks[index].value);
    var host = location.hostname.split('.')[0];
    var findLink = $scope.track.SMLinks.filter(function (item) {
      return item.key === host;
    });
    if (findLink.length > 0) {
      return false;
    }
    $scope.track.SMLinks[index].key = host;
  };

  $scope.saveDownloadGate = function () {
    if (!$scope.track.trackID) {
      alert('Track Not Found');
      return false;
    }
    $scope.processing = true;
    var sendObj = new FormData();

    /* Append data to sendObj start */

    /* Track */
    for (var prop in $scope.track) {
      sendObj.append(prop, $scope.track[prop]);
    }

    /* artists */

    var artists = $scope.track.artists.filter(function (item) {
      return item.id !== -1;
    }).map(function (item) {
      delete item['$$hashKey'];
      return item;
    });
    sendObj.append('artists', JSON.stringify(artists));

    /* playlists */

    var playlists = $scope.track.playlists.filter(function (item) {
      return item.id !== -1;
    }).map(function (item) {
      delete item['$$hashKey'];
      return item;
    });
    sendObj.append('playlists', JSON.stringify(playlists));

    /* SMLinks */

    var SMLinks = {};
    $scope.track.SMLinks.forEach(function (item) {
      SMLinks[item.key] = item.value;
    });
    sendObj.append('SMLinks', JSON.stringify(SMLinks));

    /* Append data to sendObj end */

    var options = {
      method: 'POST',
      url: '/api/database/downloadurl',
      headers: {
        'Content-Type': undefined
      },
      transformRequest: angular.identity,
      data: sendObj
    };
    $http(options).then(function (res) {
      $scope.processing = false;
      if ($scope.track._id) {
        // $scope.openModal.downloadURL(res.data.trackURL);
        return;
      }
      resetDownloadGateway();
      $scope.openModal.downloadURL(res.data);
    }).then(null, function (err) {
      $scope.processing = false;
      alert("ERROR: Error in saving url");
      $scope.processing = false;
    });
  };

  $scope.logout = function () {
    $http.post('/api/logout').then(function () {
      SessionService.deleteUser();
      $state.go('home');
    });
  };

  $scope.showProfileInfo = function () {
    $scope.profile = JSON.parse(SessionService.getUser());
  };

  $scope.getDownloadList = function () {
    AdminDLGateService.getDownloadList().then(handleResponse)['catch'](handleError);

    function handleResponse(res) {
      $scope.downloadGatewayList = res.data;
    }

    function handleError(res) {}
  };

  /* Method for getting DownloadGateway in case of edit */

  $scope.getDownloadGateway = function (downloadGateWayID) {
    // resetDownloadGateway();
    $scope.processing = true;
    AdminDLGateService.getDownloadGateway({
      id: downloadGateWayID
    }).then(handleResponse)['catch'](handleError);

    function handleResponse(res) {

      $scope.isTrackAvailable = true;
      $scope.track = res.data;

      var SMLinks = res.data.SMLinks ? res.data.SMLinks : {};
      var SMLinksArray = [];

      for (var link in SMLinks) {
        SMLinksArray.push({
          key: link,
          value: SMLinks[link]
        });
      }
      $scope.track.SMLinks = SMLinksArray;
      $scope.processing = false;
    }

    function handleError(res) {
      $scope.processing = false;
    }
  };

  $scope.deleteDownloadGateway = function (index) {

    if (confirm("Do you really want to delete this track?")) {
      var handleResponse = function handleResponse(res) {
        $scope.processing = false;
        $scope.downloadGatewayList.splice(index, 1);
      };

      var handleError = function handleError(res) {
        $scope.processing = false;
      };

      var downloadGateWayID = $scope.downloadGatewayList[index]._id;
      $scope.processing = true;
      AdminDLGateService.deleteDownloadGateway({
        id: downloadGateWayID
      }).then(handleResponse)['catch'](handleError);
    } else {
      return false;
    }
  };
}]);
app.config(function ($stateProvider) {
  $stateProvider.state('download', {
    url: '/download',
    templateUrl: 'js/downloadTrack/views/downloadTrack.view.html',
    controller: 'DownloadTrackController'
  });
});

app.controller('DownloadTrackController', ['$rootScope', '$state', '$scope', '$http', '$location', '$window', '$q', 'DownloadTrackService', function ($rootScope, $state, $scope, $http, $location, $window, $q, DownloadTrackService) {

  /* Normal JS vars and functions not bound to scope */
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
  $scope.recentTracks = [];

  /* Default processing on page load */

  $scope.getDownloadTrack = function () {

    $scope.processing = true;
    var trackID = $location.search().trackid;
    DownloadTrackService
    // .getDownloadTrack(trackID)
    .then(receiveDownloadTrack).then(receiveRecentTracks).then(initPlay)['catch'](catchDownloadTrackError);

    function receiveDownloadTrack(result) {
      $scope.track = result.data;
      console.log($scope.track);
      $scope.backgroundStyle = function () {
        return {
          'background-image': 'url(' + $scope.track.trackArtworkURL + ')',
          'background-repeat': 'no-repeat',
          'background-size': 'cover'
        };
      };

      $scope.embedTrack = true;
      $scope.processing = false;

      if ($scope.track.showDownloadTracks === 'user') {
        return DownloadTrackService.getRecentTracks({
          userID: $scope.track.userid,
          trackID: $scope.track._id
        });
      } else {
        return $q.resolve('resolve');
      }
    }

    function receiveRecentTracks(res) {
      if (typeof res === 'object' && res.data) {
        $scope.recentTracks = res.data;
      }
      return SC.stream('/tracks/' + $scope.track.trackID);
    }

    function initPlay(player) {
      playerObj = player;
    }

    function catchDownloadTrackError() {
      alert('Song Not Found');
      $scope.processing = false;
      $scope.embedTrack = false;
    }
  };

  /* On click download track button */

  $scope.downloadTrack = function () {
    if ($scope.track.comment && !$scope.track.commentText) {
      alert('Please write a comment!');
      return false;
    }
    $scope.processing = true;
    $scope.errorText = '';

    SC.connect().then(performTasks).then(initDownload)['catch'](catchTasksError);

    function performTasks(res) {
      $scope.track.token = res.oauth_token;
      return DownloadTrackService.performTasks($scope.track);
    }

    function initDownload(res) {
      $scope.processing = false;
      if ($scope.track.downloadURL && $scope.track.downloadURL !== '') {
        $window.location.href = $scope.track.downloadURL;
      } else {
        $scope.errorText = 'Error! Could not fetch download URL';
        $scope.downloadURLNotFound = true;
      }
      $scope.$apply();
    }

    function catchTasksError(err) {
      alert('Error in processing your request');
      $scope.processing = false;
      $scope.$apply();
    }
  };
}]);

app.service('AdminDLGateService', ['$http', function ($http) {

  function resolveData(data) {
    return $http.post('/api/soundcloud/resolve', data);
  }

  function getDownloadList() {
    return $http.get('/api/database/downloadurl/admin');
  }

  function getDownloadGateway(data) {
    return $http.get('/api/database/downloadurl/' + data.id);
  }

  function deleteDownloadGateway(data) {
    return $http.post('/api/database/downloadurl/delete', data);
  }

  return {
    resolveData: resolveData,
    getDownloadList: getDownloadList,
    getDownloadGateway: getDownloadGateway,
    deleteDownloadGateway: deleteDownloadGateway
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

  function getRecentTracks(data) {
    return $http.get('/api/download/track/recent?userID=' + data.userID + '&trackID=' + data.trackID);
  }

  return {
    getDownloadTrack: getDownloadTrack,
    getTrackData: getTrackData,
    performTasks: performTasks,
    getRecentTracks: getRecentTracks
  };
}]);

app.config(function ($stateProvider) {
  $stateProvider.state('artistTools', {
    url: '/artist-tools',
    templateUrl: 'js/home/views/artistTools/artistTools.html',
    controller: 'ArtistToolsController',
    abstract: true,
    resolve: {
      allowed: function allowed($q, $state, SessionService) {
        var deferred = $q.defer();
        var user = SessionService.getUser();
        if (user) {
          deferred.resolve();
        } else {
          deferred.reject();
          window.location.href = '/login';
        }

        return deferred.promise;
      }
    }
  }).state('artistTools.profile', {
    url: '/profile',
    templateUrl: 'js/home/views/artistTools/profile.html',
    controller: 'ArtistToolsController'
  }).state('artistTools.downloadGateway', {
    abstract: true,
    url: '',
    template: '<div ui-view="gateway"></div>',
    controller: 'ArtistToolsController'
  }).state('artistTools.downloadGateway.list', {
    url: '/download-gateway',
    params: {
      submission: null
    },
    views: {
      'gateway': {
        templateUrl: 'js/home/views/artistTools/downloadGateway.list.html',
        controller: 'ArtistToolsController'
      }
    }
  }).state('artistTools.downloadGateway.edit', {
    url: '/download-gateway/edit/:gatewayID',
    views: {
      'gateway': {
        templateUrl: 'js/home/views/artistTools/downloadGateway.html',
        controller: 'ArtistToolsController'
      }
    }
  }).state('artistTools.downloadGateway.new', {
    url: '/download-gateway/new',
    params: {
      submission: null
    },
    views: {
      'gateway': {
        templateUrl: 'js/home/views/artistTools/downloadGateway.html',
        controller: 'ArtistToolsController'
      }
    }
  });
});

app.controller('ArtistToolsController', ['$rootScope', '$state', '$stateParams', '$scope', '$http', '$location', '$window', '$uibModal', '$timeout', 'SessionService', 'ArtistToolsService', function ($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, SessionService, ArtistToolsService) {

  /* Init boolean variables for show/hide and other functionalities */

  $scope.processing = false;
  $scope.isTrackAvailable = false;
  $scope.message = {
    val: '',
    visible: false
  };

  /* Init Download Gateway form data */

  $scope.track = {
    artistUsername: '',
    trackTitle: '',
    trackArtworkURL: '',
    SMLinks: [],
    like: false,
    comment: false,
    repost: false,
    artists: [{
      url: '',
      avatar: '',
      username: '',
      id: -1,
      permanentLink: false
    }],
    showDownloadTracks: 'user'
  };
  $scope.profile = {};

  /* Init downloadGateway list */

  $scope.downloadGatewayList = [];

  /* Init track list and trackListObj*/

  $scope.trackList = [];
  $scope.trackListObj = null;

  /* Init modal instance variables and methods */

  $scope.modalInstance = {};
  $scope.modal = {};
  $scope.openModal = {
    downloadURL: function downloadURL(_downloadURL2) {
      $scope.modal.downloadURL = _downloadURL2;
      $scope.modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'downloadURL.html',
        controller: 'ArtistToolsController',
        scope: $scope
      });
    }
  };
  $scope.closeModal = function () {
    $scope.modalInstance.close();
  };

  $scope.editProfileModalInstance = {};
  $scope.editProfilemodal = {};
  $scope.openEditProfileModal = {
    editProfile: function editProfile(field) {
      $scope.profile.field = field;
      $timeout(function () {
        $scope.editProfileModalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'editProfile.html',
          controller: 'ArtistToolsController',
          scope: $scope
        });
      }, 0);
    }
  };
  $scope.closeEditProfileModal = function () {
    $scope.showProfileInfo();
    if ($scope.editProfileModalInstance.close) {
      $scope.editProfileModalInstance.close();
    }
  };

  $scope.thankYouModalInstance = {};
  $scope.thankYouModal = {};
  $scope.openThankYouModal = {
    thankYou: function thankYou(submissionID) {
      $scope.thankYouModal.submissionID = submissionID;
      $scope.modalInstance = $uibModal.open({
        animation: true,
        templateUrl: 'thankYou.html',
        controller: 'ArtistToolsController',
        scope: $scope
      });
    }
  };
  $scope.closeThankYouModal = function () {
    $scope.thankYouModalInstance.close();
  };

  /* Init profile */
  $scope.profile = {};

  /* Method for resetting Download Gateway form */

  function resetDownloadGateway() {
    $scope.processing = false;
    $scope.isTrackAvailable = false;
    $scope.message = {
      val: '',
      visible: false
    };

    $scope.track = {
      artistUsername: '',
      trackTitle: '',
      trackArtworkURL: '',
      SMLinks: [],
      like: false,
      comment: false,
      repost: false,
      artists: [{
        url: '',
        avatar: '',
        username: '',
        id: -1,
        permanentLink: false
      }],
      showDownloadTracks: 'user'
    };
    angular.element("input[type='file']").val(null);
  }

  /* Check if stateParams has gatewayID to initiate edit */
  $scope.checkIfEdit = function () {
    if ($stateParams.gatewayID) {
      $scope.getDownloadGateway($stateParams.gatewayID);
    }
  };

  $scope.checkIfSubmission = function () {
    if ($stateParams.submission) {
      if ($state.includes('artistTools.downloadGateway.new')) {
        $scope.track.trackURL = $rootScope.submission.trackURL;
        $scope.trackURLChange();
        return;
      }
      $scope.openThankYouModal.thankYou($stateParams.submission._id);
      $rootScope.submission = null;
    }
  };

  $scope.trackURLChange = function () {
    if ($scope.track.trackURL !== '') {
      var handleTrackDataAndGetProfiles = function handleTrackDataAndGetProfiles(res) {
        $scope.track.trackTitle = res.data.title;
        $scope.track.trackID = res.data.id;
        $scope.track.artistID = res.data.user.id;
        $scope.track.description = res.data.description;
        $scope.track.trackArtworkURL = res.data.artwork_url ? res.data.artwork_url.replace('large.jpg', 't500x500.jpg') : '';
        $scope.track.artistArtworkURL = res.data.user.avatar_url ? res.data.user.avatar_url : '';
        $scope.track.artistURL = res.data.user.permalink_url;
        $scope.track.artistUsername = res.data.user.username;
        $scope.track.SMLinks = [];
        return SC.get('/users/' + $scope.track.artistID + '/web-profiles');
      };

      var handleWebProfiles = function handleWebProfiles(profiles) {
        profiles.forEach(function (prof) {
          if (['twitter', 'youtube', 'facebook', 'spotify', 'soundcloud', 'instagram'].indexOf(prof.service) != -1) {
            $scope.track.SMLinks.push({
              key: prof.service,
              value: prof.url
            });
          }
        });
        $scope.isTrackAvailable = true;
        $scope.processing = false;
      };

      var handleError = function handleError(err) {
        $scope.track.trackID = null;
        alert('Song not found or forbidden');
        $scope.processing = false;
      };

      $scope.isTrackAvailable = false;
      $scope.processing = true;
      ArtistToolsService.resolveData({
        url: $scope.track.trackURL
      }).then(handleTrackDataAndGetProfiles).then(handleWebProfiles)['catch'](handleError);
    }
  };

  $scope.trackListChange = function (index) {

    /* Set booleans */

    $scope.isTrackAvailable = false;
    $scope.processing = true;

    /* Set track data */

    var track = $scope.trackListObj;
    $scope.track.trackURL = track.permalink_url;
    $scope.track.trackTitle = track.title;
    $scope.track.trackID = track.id;
    $scope.track.artistID = track.user.id;
    $scope.track.description = track.description;
    $scope.track.trackArtworkURL = track.artwork_url ? track.artwork_url.replace('large.jpg', 't500x500.jpg') : '';
    $scope.track.artistArtworkURL = track.user.avatar_url ? track.user.avatar_url : '';
    $scope.track.artistURL = track.user.permalink_url;
    $scope.track.artistUsername = track.user.username;
    $scope.track.SMLinks = [];

    SC.get('/users/' + $scope.track.artistID + '/web-profiles').then(handleWebProfiles)['catch'](handleError);

    function handleWebProfiles(profiles) {
      profiles.forEach(function (prof) {
        if (['twitter', 'youtube', 'facebook', 'spotify', 'soundcloud', 'instagram'].indexOf(prof.service) != -1) {
          $scope.track.SMLinks.push({
            key: prof.service,
            value: prof.url
          });
        }
      });
      $scope.isTrackAvailable = true;
      $scope.processing = false;
      $scope.$apply();
    }

    function handleError(err) {
      $scope.track.trackID = null;
      alert('Song not found or forbidden');
      $scope.processing = false;
      $scope.$apply();
    }
  };

  $scope.artistURLChange = function (index) {
    var artist = {};
    $scope.processing = true;
    ArtistToolsService.resolveData({
      url: $scope.track.artists[index].url
    }).then(function (res) {
      $scope.track.artists[index].avatar = res.data.avatar_url ? res.data.avatar_url : '';
      $scope.track.artists[index].username = res.data.username;
      $scope.track.artists[index].id = res.data.id;
      $scope.processing = false;
    })['catch'](function (err) {
      alert('Artists not found');
      $scope.processing = false;
    });
  };

  $scope.removeArtist = function (index) {
    $scope.track.artists.splice(index, 1);
  };

  $scope.addArtist = function () {
    if ($scope.track.artists.length > 2) {
      return false;
    }

    $scope.track.artists.push({
      url: '',
      avatar: '',
      username: '',
      id: -1,
      permanentLink: false
    });
  };

  $scope.addSMLink = function () {
    $scope.track.SMLinks.push({
      key: '',
      value: ''
    });
  };
  $scope.removeSMLink = function (index) {
    $scope.track.SMLinks.splice(index, 1);
  };
  $scope.SMLinkChange = function (index) {

    function getLocation(href) {
      var location = document.createElement("a");
      location.href = href;
      if (location.host == "") {
        location.href = location.href;
      }
      return location;
    }

    var location = getLocation($scope.track.SMLinks[index].value);
    var host = location.hostname.split('.')[0];
    var findLink = $scope.track.SMLinks.filter(function (item) {
      return item.key === host;
    });
    if (findLink.length > 0) {
      return false;
    }
    $scope.track.SMLinks[index].key = host;
  };

  $scope.saveDownloadGate = function () {
    if (!$scope.track.trackID) {
      alert('Track Not Found');
      return false;
    }
    // $scope.track.showDownloadTracks = ($scope.track.showDownloadTracks === true) ? 'user' : 'none';

    $scope.processing = true;
    var sendObj = new FormData();

    /* Append data to sendObj start */

    /* Track */
    for (var prop in $scope.track) {
      sendObj.append(prop, $scope.track[prop]);
    }

    /* artistIDs */

    var artists = $scope.track.artists.filter(function (item) {
      return item.id !== -1;
    }).map(function (item) {
      delete item['$$hashKey'];
      return item;
    });
    sendObj.append('artists', JSON.stringify(artists));

    /* permanentLinks */

    // var permanentLinks = $scope.track.permanentLinks.filter(function(item) {
    //   return item.url !== '';
    // }).map(function(item){
    //   return item.url;
    // });
    // sendObj.append('permanentLinks', JSON.stringify(permanentLinks));

    /* SMLinks */

    var SMLinks = {};
    $scope.track.SMLinks.forEach(function (item) {
      SMLinks[item.key] = item.value;
    });
    sendObj.append('SMLinks', JSON.stringify(SMLinks));

    /* Check for playlists in case of edit */

    if ($scope.track.playlists) {
      sendObj.append('playlists', JSON.stringify($scope.track.playlists));
    }

    /* Append data to sendObj end */

    var options = {
      method: 'POST',
      url: '/api/database/downloadurl',
      headers: { 'Content-Type': undefined },
      transformRequest: angular.identity,
      data: sendObj
    };
    $http(options).then(function (res) {
      // $scope.track.showDownloadTracks = ($scope.track.showDownloadTracks === 'user') ? true : false;
      // $scope.trackListObj = null;
      $scope.processing = false;
      if ($stateParams.submission) {
        $state.go('artistTools.downloadGateway.list', { 'submission': $stateParams.submission });
        return;
      }
      $state.go('artistTools.downloadGateway.list');
      // if($scope.track._id) {
      //   return;
      // }
      // resetDownloadGateway();
      // $scope.openModal.downloadURL(res.data);
    }).then(null, function (err) {
      $scope.processing = false;
      alert("ERROR: Error in saving url");
      $scope.processing = false;
    });
  };

  $scope.logout = function () {
    $http.post('/api/logout').then(function () {
      SessionService.deleteUser();
      $state.go('login');
    });
  };

  $scope.showProfileInfo = function () {
    $scope.profile.data = JSON.parse(SessionService.getUser());
    if ($scope.profile.data.permanentLinks && $scope.profile.data.permanentLinks.length === 0 || !$scope.profile.data.permanentLinks) {
      $scope.profile.data.permanentLinks = [{
        url: '',
        avatar: '',
        username: '',
        id: -1,
        permanentLink: true
      }];
    };
    $scope.profile.isAvailable = {};
    $scope.profile.isAvailable.email = $scope.profile.data.email ? true : false;
    $scope.profile.isAvailable.password = $scope.profile.data.password ? true : false;
    $scope.profile.isAvailable.soundcloud = $scope.profile.data.soundcloud ? true : false;
    $scope.profile.data.password = '';
  };

  $scope.saveProfileInfo = function () {

    $scope.message = {
      value: '',
      visible: false
    };

    var permanentLinks = $scope.profile.data.permanentLinks.filter(function (item) {
      return item.id !== -1;
    }).map(function (item) {
      delete item['$$hashKey'];
      return item;
    });

    var sendObj = {
      name: '',
      password: '',
      permanentLinks: JSON.stringify(permanentLinks)
    };
    if ($scope.profile.field === 'name') {
      sendObj.name = $scope.profile.data.name;
    } else if ($scope.profile.field === 'password') {
      sendObj.password = $scope.profile.data.password;
    } else if ($scope.profile.field === 'email') {
      sendObj.email = $scope.profile.data.email;
    }

    ArtistToolsService.saveProfileInfo(sendObj).then(function (res) {
      if (res.data === 'Email Error') {
        $scope.message = {
          value: 'Email already exists!',
          visible: true
        };
        return;
      }
      SessionService.create(res.data);
      $scope.closeEditProfileModal();
    })['catch'](function (res) {});
  };

  $scope.removePermanentLink = function (index) {
    $scope.profile.data.permanentLinks.splice(index, 1);
  };

  $scope.addPermanentLink = function () {
    if ($scope.profile.data.permanentLinks.length > 2) {
      return false;
    }

    $scope.profile.data.permanentLinks.push({
      url: '',
      avatar: '',
      username: '',
      id: -1,
      permanentLink: true
    });
  };

  $scope.permanentLinkURLChange = function (index) {
    var permanentLink = {};
    $scope.processing = true;
    ArtistToolsService.resolveData({
      url: $scope.profile.data.permanentLinks[index].url
    }).then(function (res) {
      $scope.profile.data.permanentLinks[index].avatar = res.data.avatar_url ? res.data.avatar_url : '';
      $scope.profile.data.permanentLinks[index].username = res.data.permalink;
      $scope.profile.data.permanentLinks[index].id = res.data.id;
      $scope.processing = false;
    })['catch'](function (err) {
      alert('Artists not found');
      $scope.processing = false;
    });
  };

  $scope.saveSoundCloudAccountInfo = function () {
    SC.connect().then(saveInfo).then(handleResponse)['catch'](handleError);

    function saveInfo(res) {
      return ArtistToolsService.saveSoundCloudAccountInfo({
        token: res.oauth_token
      });
    }

    function handleResponse(res) {
      $scope.processing = false;
      if (res.status === 200 && res.data.success === true) {
        SessionService.create(res.data.data);
        $scope.profile.data = res.data.data;
        $scope.profile.isAvailable.soundcloud = true;
      } else {
        $scope.message = {
          value: 'You already have an account with this soundcloud username',
          visible: true
        };
      }
      $scope.$apply();
    }

    function handleError(err) {
      $scope.processing = false;
    }
  };

  $scope.getDownloadList = function () {
    ArtistToolsService.getDownloadList().then(handleResponse)['catch'](handleError);

    function handleResponse(res) {
      $scope.downloadGatewayList = res.data;
    }

    function handleError(res) {}
  };

  /* Method for getting DownloadGateway in case of edit */

  $scope.getDownloadGateway = function (downloadGateWayID) {
    // resetDownloadGateway();
    $scope.processing = true;
    ArtistToolsService.getDownloadGateway({
      id: downloadGateWayID
    }).then(handleResponse)['catch'](handleError);

    function handleResponse(res) {

      $scope.isTrackAvailable = true;
      $scope.track = res.data;

      var SMLinks = res.data.SMLinks ? res.data.SMLinks : {};
      var permanentLinks = res.data.permanentLinks ? res.data.permanentLinks : [''];
      var SMLinksArray = [];
      var permanentLinksArray = [];

      for (var link in SMLinks) {
        SMLinksArray.push({
          key: link,
          value: SMLinks[link]
        });
      }
      permanentLinks.forEach(function (item) {
        permanentLinksArray.push({
          url: item
        });
      });
      if (!$scope.track.showDownloadTracks) {
        $scope.track.showDownloadTracks = 'user';
      }
      $scope.track.SMLinks = SMLinksArray;
      $scope.track.permanentLinks = permanentLinksArray;
      $scope.track.playlistIDS = [];
      // $scope.track.showDownloadTracks = ($scope.track.showDownloadTracks === 'user') ? true : false;

      $scope.processing = false;
    }

    function handleError(res) {
      $scope.processing = false;
    }
  };

  $scope.deleteDownloadGateway = function (index) {
    if (confirm("Do you really want to delete this track?")) {
      var handleResponse = function handleResponse(res) {
        $scope.processing = false;
        $scope.downloadGatewayList.splice(index, 1);
      };

      var handleError = function handleError(res) {
        $scope.processing = false;
      };

      var downloadGateWayID = $scope.downloadGatewayList[index]._id;
      $scope.processing = true;
      ArtistToolsService.deleteDownloadGateway({
        id: downloadGateWayID
      }).then(handleResponse)['catch'](handleError);
    }
  };

  $scope.getTrackListFromSoundcloud = function () {
    var profile = JSON.parse(SessionService.getUser());
    if (profile.soundcloud) {
      $scope.processing = true;
      SC.get('/users/' + profile.soundcloud.id + '/tracks').then(function (tracks) {
        $scope.trackList = tracks;
        $scope.processing = false;
        $scope.$apply();
      })['catch'](function (response) {
        $scope.processing = false;
        $scope.$apply();
      });
    }
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

app.service('ArtistToolsService', ['$http', function ($http) {

  function resolveData(data) {
    return $http.post('/api/soundcloud/resolve', data);
  }

  function getDownloadList() {
    return $http.get('/api/database/downloadurl');
  }

  function getDownloadGateway(data) {
    return $http.get('/api/database/downloadurl/' + data.id);
  }

  function deleteDownloadGateway(data) {
    return $http.post('/api/database/downloadurl/delete', data);
  }

  function saveProfileInfo(data) {
    return $http.post('/api/database/profile/edit', data);
  }

  function saveSoundCloudAccountInfo(data) {
    return $http.post('/api/database/profile/soundcloud', data);
  }

  function getTrackListFromSoundcloud(data) {
    return $http.post('/api/database/tracks/list', data);
  }

  return {
    resolveData: resolveData,
    getDownloadList: getDownloadList,
    getDownloadGateway: getDownloadGateway,
    saveProfileInfo: saveProfileInfo,
    deleteDownloadGateway: deleteDownloadGateway,
    saveSoundCloudAccountInfo: saveSoundCloudAccountInfo,
    getTrackListFromSoundcloud: getTrackListFromSoundcloud
  };
}]);

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

  $scope.genreArray = ['Alternative Rock', 'Ambient', 'Creative', 'Chill', 'Classical', 'Country', 'Dance & EDM', 'Dancehall', 'Deep House', 'Disco', 'Drum & Bass', 'Dubstep', 'Electronic', 'Festival', 'Folk', 'Hip-Hop/RNB', 'House', 'Indie/Alternative', 'Latin', 'Trap', 'Vocalists/Singer-Songwriter'];

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
app.config(function ($stateProvider) {
  $stateProvider.state('submissions', {
    url: '/submissions',
    templateUrl: 'js/submissions/views/submissions.html',
    controller: 'SubmissionController'
  });
});

app.controller('SubmissionController', function ($rootScope, $state, $scope, $http, AuthService, oEmbedFactory) {
  $scope.counter = 0;
  $scope.showingElements = [];
  $scope.submissions = [];
  $scope.logout = function () {
    $http.get('/api/logout').then(function () {
      window.location.href = '/admin';
    })['catch'](function (err) {
      $scope.processing = false;
      alert('Wrong Password');
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
      if (sub) {
        $scope.showingElements.push(sub);
        loadElements.push(sub);
      }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImRhdGFiYXNlL2RhdGFiYXNlLmpzIiwiZnNhL2ZzYS1wcmUtYnVpbHQuanMiLCJsb2dpbi9sb2dpbi5qcyIsImxvZ2luL29FbWJlZEZhY3RvcnkuanMiLCJwYXkvcGF5LmpzIiwicGF5L3RoYW5reW91LmpzIiwic2NoZWR1bGVyL3NjaGVkdWxlci5qcyIsInN1Ym1pdC9zdWJtaXQuanMiLCJhdXRoL2NvbnRyb2xsZXJzL2F1dGhDb250cm9sbGVyLmpzIiwiYXV0aC9zZXJ2aWNlcy9hdXRoU2VydmljZS5qcyIsImF1dGgvc2VydmljZXMvc2Vzc2lvblNlcnZpY2UuanMiLCJkYXRhYmFzZS9hdXRvRW1haWxzL2F1dG9FbWFpbHMuanMiLCJkYXRhYmFzZS9hdXRvRW1haWxzL2F1dG9FbWFpbHNMaXN0LmpzIiwiZG93bmxvYWRUcmFjay9jb250cm9sbGVycy9hZG1pbkRMR2F0ZS5qcyIsImRvd25sb2FkVHJhY2svY29udHJvbGxlcnMvZG93bmxvYWRUcmFja0NvbnRyb2xsZXIuanMiLCJkb3dubG9hZFRyYWNrL3NlcnZpY2VzL2FkbWluRExHYXRlU2VydmljZS5qcyIsImRvd25sb2FkVHJhY2svc2VydmljZXMvZG93bmxvYWRUcmFja1NlcnZpY2UuanMiLCJob21lL2NvbnRyb2xsZXJzL2FydGlzdFRvb2xzQ29udHJvbGxlci5qcyIsImhvbWUvY29udHJvbGxlcnMvaG9tZUNvbnRyb2xsZXIuanMiLCJob21lL3NlcnZpY2VzL2FydGlzdHNUb29sc1NlcnZpY2UuanMiLCJob21lL3NlcnZpY2VzL2hvbWVTZXJ2aWNlLmpzIiwicHJlbWllci9jb250cm9sbGVycy9wcmVtaWVyQ29udHJvbGxlci5qcyIsInN1Ym1pc3Npb25zL2NvbnRyb2xsZXJzL3N1Ym1pc3Npb25Db250cm9sbGVyLmpzIiwicHJlbWllci9zZXJ2aWNlcy9wcmVtaWVyU2VydmljZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFBLENBQUE7QUFDQSxNQUFBLENBQUEsR0FBQSxHQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsdUJBQUEsRUFBQSxDQUFBLGFBQUEsRUFBQSxXQUFBLEVBQUEsY0FBQSxFQUFBLFdBQUEsRUFBQSxXQUFBLEVBQUEsd0JBQUEsQ0FBQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGtCQUFBLEVBQUEsaUJBQUEsRUFBQSxxQkFBQSxFQUFBOztBQUVBLG1CQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBOztBQUVBLG9CQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBOztDQUVBLENBQUEsQ0FBQTs7O0FBR0EsR0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLFVBQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBLGFBQUEsRUFBQSxjQUFBLEVBQUEsU0FBQSxFQUFBOzs7Ozs7QUFNQSxXQUFBLENBQUEsV0FBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBOztBQUVBLGFBQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBOztHQUVBLENBQUEsQ0FBQTs7OztBQUlBLFlBQUEsQ0FBQSxHQUFBLENBQUEsbUJBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsUUFBQSxFQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQWdDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBR0EsR0FBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQSxZQUFBO0FBQ0EsU0FBQTtBQUNBLFNBQUEsRUFBQTtBQUNBLGNBQUEsRUFBQSxHQUFBO0FBQ0EsYUFBQSxFQUFBLEdBQUE7S0FDQTtBQUNBLFFBQUEsRUFBQSxjQUFBLEtBQUEsRUFBQSxPQUFBLEVBQUEsVUFBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsVUFBQSxXQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsTUFBQSxDQUFBLFlBQUE7QUFDQSxlQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsbUJBQUEsRUFBQSxLQUFBO0FBQ0EsZUFBQSxFQUFBLEVBQUE7V0FDQSxDQUFBOztBQUVBLGNBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxJQUFBLFlBQUEsSUFBQSxXQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLElBQUEsV0FBQSxFQUFBO0FBQ0EsaUJBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxxQkFBQSxFQUFBLElBQUE7QUFDQSxpQkFBQSxFQUFBLHVDQUFBO2FBQ0EsQ0FBQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsbUJBQUE7V0FDQTs7QUFFQSxjQUFBLFdBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsR0FBQSxFQUFBLEdBQUEsSUFBQSxHQUFBLElBQUEsRUFBQTtBQUNBLGlCQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EscUJBQUEsRUFBQSxJQUFBO0FBQ0EsaUJBQUEsRUFBQSw0Q0FBQTthQUNBLENBQUE7QUFDQSxtQkFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLG1CQUFBO1dBQ0E7QUFDQSxlQUFBLENBQUEsUUFBQSxHQUFBLFdBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBLENBQUE7O0FDbkdBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsaUJBQUE7QUFDQSxlQUFBLEVBQUEsMkJBQUE7QUFDQSxjQUFBLEVBQUEsb0JBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxpQkFBQSxFQUFBLENBQUEsUUFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0EsU0FBQTtBQUNBLFlBQUEsRUFBQSxJQUFBO0FBQ0EsU0FBQSxFQUFBLElBQUE7QUFDQSxZQUFBLEVBQUEsOERBQUEsR0FDQSxtSEFBQSxHQUNBLFFBQUE7QUFDQSxRQUFBLEVBQUEsY0FBQSxNQUFBLEVBQUEsSUFBQSxFQUFBLE1BQUEsRUFBQSxVQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsRUFBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLElBQUEsRUFBQTtBQUNBLFlBQUEsVUFBQSxHQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxHQUFBLFVBQUEsQ0FBQTtBQUNBLFlBQUEsVUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsR0FBQSxDQUFBLE9BQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBO1NBQ0E7T0FDQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLG9CQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLEtBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsV0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQTtBQUNBLFFBQUEsRUFBQSxVQUFBO0FBQ0EsU0FBQSxFQUFBLFVBQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLE9BQUE7QUFDQSxTQUFBLEVBQUEsT0FBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsTUFBQTtBQUNBLFNBQUEsRUFBQSxNQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxLQUFBO0FBQ0EsU0FBQSxFQUFBLE9BQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLE9BQUE7QUFDQSxTQUFBLEVBQUEsT0FBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsYUFBQTtBQUNBLFNBQUEsRUFBQSxhQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxXQUFBO0FBQ0EsU0FBQSxFQUFBLFdBQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLGtCQUFBO0FBQ0EsU0FBQSxFQUFBLFdBQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLFVBQUE7QUFDQSxTQUFBLEVBQUEsYUFBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsV0FBQTtBQUNBLFNBQUEsRUFBQSxjQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxTQUFBO0FBQ0EsU0FBQSxFQUFBLFlBQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLFNBQUE7QUFDQSxTQUFBLEVBQUEsWUFBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsVUFBQTtBQUNBLFNBQUEsRUFBQSxVQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxnQkFBQTtBQUNBLFNBQUEsRUFBQSxhQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxZQUFBO0FBQ0EsU0FBQSxFQUFBLFdBQUE7R0FDQSxDQUFBLENBQUE7QUFDQSxRQUFBLENBQUEscUJBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsS0FBQSxHQUFBO0FBQ0EsWUFBQSxFQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsRUFBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxHQUFBLEdBQUE7QUFDQSxRQUFBLEVBQUEsU0FBQTtBQUNBLFNBQUEsRUFBQSxDQUFBO0FBQ0EsV0FBQSxFQUFBLEtBQUE7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFVBQUEsR0FBQTtBQUNBLGlCQUFBLEVBQUEsRUFBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxHQUFBLFFBQUEsQ0FBQTtLQUNBLENBQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsV0FBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLHVCQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxnRkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQTtLQUNBLENBQUEsU0FDQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsa0JBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxLQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsSUFBQSxTQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQTtLQUNBLE1BQUEsSUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsSUFBQSxhQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsTUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBO0FBQ0EsUUFBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsU0FBQSxHQUFBLE9BQUEsQ0FBQTtLQUNBO0FBQ0EsUUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsU0FBQSxHQUFBLE9BQUEsQ0FBQTtLQUNBO0FBQ0EsUUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsRUFBQSxLQUFBLENBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsU0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLE9BQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGVBQUEsR0FBQSxDQUFBLEtBQUEsS0FBQSxJQUFBLENBQUE7T0FDQSxDQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsZUFBQSxHQUFBLENBQUEsS0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7QUFDQSxRQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsZUFBQSxFQUFBLEtBQUEsQ0FBQSxlQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxlQUFBLENBQUE7QUFDQSxRQUFBLElBQUEsR0FBQTtBQUNBLFdBQUEsRUFBQSxLQUFBO0FBQ0EsY0FBQSxFQUFBLFVBQUEsQ0FBQSxRQUFBO0tBQ0EsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSx5QkFBQSxFQUFBLElBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxxQkFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsZ0NBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxvQkFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLEtBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLE9BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUEsV0FBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLEdBQUEsR0FBQSxNQUFBLENBQUEsV0FBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxTQUFBLEdBQUEsT0FBQSxDQUFBO0tBQ0E7QUFDQSxRQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUEsV0FBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLEdBQUEsR0FBQSxNQUFBLENBQUEsV0FBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxTQUFBLEdBQUEsT0FBQSxDQUFBO0tBQ0E7QUFDQSxRQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUEsS0FBQSxFQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLElBQUEsR0FBQTtBQUNBLFdBQUEsRUFBQSxLQUFBO0FBQ0EsY0FBQSxFQUFBLFVBQUEsQ0FBQSxRQUFBO0tBQ0EsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSw0QkFBQSxFQUFBLElBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxjQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSwyQkFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsZ0NBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxRQUFBLE1BQUEsR0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFVBQUEsRUFBQSxRQUFBO0FBQ0EsY0FBQSxFQUFBLFFBQUE7S0FDQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEscUJBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsMkJBQUEsR0FBQSxLQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxxQkFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsMEJBQUEsRUFBQSxNQUFBLENBQUEsVUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQTtBQUNBLHFCQUFBLEVBQUEsRUFBQTtPQUNBLENBQUE7QUFDQSxXQUFBLENBQUEsaUNBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSw0QkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7OztBQUdBLFFBQUEsQ0FBQSxFQUFBLENBQUEsY0FBQSxFQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsUUFBQSxVQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEdBQUEsVUFBQSxDQUFBO0FBQ0EsUUFBQSxVQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLGdCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUMvTkEsQ0FBQSxZQUFBOztBQUVBLGNBQUEsQ0FBQTs7QUFFQSxNQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxNQUFBLElBQUEsS0FBQSxDQUFBLHdCQUFBLENBQUEsQ0FBQTs7QUFFQSxNQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLGFBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTs7QUFFQSxLQUFBLENBQUEsT0FBQSxDQUFBLFlBQUEsRUFBQSxZQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsQ0FBQSxFQUFBLEVBQUEsTUFBQSxJQUFBLEtBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUE7QUFDQSxXQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtHQUNBLENBQUEsQ0FBQTs7QUFFQSxLQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxVQUFBLEVBQUE7QUFDQSxXQUFBO0FBQ0EsUUFBQSxFQUFBLFlBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsRUFBQSxDQUFBLFNBQUEsRUFBQSxZQUFBO0FBQ0EsY0FBQSxJQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0Esb0JBQUEsQ0FBQSxNQUFBLENBQUEsWUFBQTtBQUNBLG9CQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtXQUNBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBO0FBQ0EsVUFBQSxFQUFBLGNBQUEsU0FBQSxFQUFBLElBQUEsRUFBQSxRQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLFlBQUE7QUFDQSxjQUFBLElBQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxvQkFBQSxDQUFBLE1BQUEsQ0FBQSxZQUFBO0FBQ0EsZ0JBQUEsUUFBQSxFQUFBO0FBQ0Esc0JBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO2FBQ0E7V0FDQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7T0FDQTtLQUNBLENBQUE7R0FDQSxDQUFBLENBQUE7O0FBRUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxRQUFBLGFBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxhQUFBLFdBQUEsR0FBQTtBQUNBLGFBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxrQ0FBQSxDQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxtQkFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUEsQ0FBQSxRQUFBO0FBQ0Esb0JBQUEsRUFBQSxJQUFBLENBQUEsV0FBQTtBQUNBLGFBQUEsRUFBQSxjQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxTQUFBLEdBQUE7QUFDQSxhQUFBLGFBQUEsQ0FBQTtLQUNBOztBQUVBLFdBQUE7QUFDQSxpQkFBQSxFQUFBLFdBQUE7QUFDQSxlQUFBLEVBQUEsU0FBQTtBQUNBLGVBQUEsRUFBQSxTQUFBO0tBQ0EsQ0FBQTtHQUNBLENBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBeUhBLENBQUEsRUFBQSxDQUFBO0FDckxBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsUUFBQTtBQUNBLGVBQUEsRUFBQSxxQkFBQTtBQUNBLGNBQUEsRUFBQSxzQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFHQSxHQUFBLENBQUEsVUFBQSxDQUFBLHNCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsV0FBQSxFQUFBLGFBQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLGVBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsV0FBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsS0FBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxFQUFBO0FBQ0EsY0FBQSxFQUFBLE1BQUEsQ0FBQSxRQUFBO0tBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxlQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxHQUFBLFFBQUEsQ0FBQTtLQUNBLENBQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxXQUFBLEdBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLGFBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSwwQkFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEdBQUEsQ0FBQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxVQUFBLENBQUEsUUFBQTtPQUNBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsYUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLGFBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsRUFBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsRUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEseUJBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDOURBLEdBQUEsQ0FBQSxPQUFBLENBQUEsZUFBQSxFQUFBLFlBQUE7QUFDQSxTQUFBO0FBQ0EsYUFBQSxFQUFBLG1CQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxtQ0FBQSxHQUFBLEdBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxHQUFBLFFBQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsS0FBQTtBQUNBLGlCQUFBLEVBQUEsR0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ1ZBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsb0JBQUE7QUFDQSxlQUFBLEVBQUEsaUJBQUE7QUFDQSxjQUFBLEVBQUEsZUFBQTtBQUNBLFdBQUEsRUFBQTtBQUNBLGNBQUEsRUFBQSxrQkFBQSxLQUFBLEVBQUE7QUFDQSxlQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsZUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBO0FBQ0EsZ0JBQUEsRUFBQSxvQkFBQSxLQUFBLEVBQUEsWUFBQSxFQUFBO0FBQ0EsZUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDBCQUFBLEdBQUEsWUFBQSxDQUFBLFlBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGlCQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7T0FDQTtBQUNBLFdBQUEsRUFBQSxlQUFBLFVBQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLEdBQUEsVUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLGlCQUFBLEtBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBO0tBQ0E7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxlQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsVUFBQSxFQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsVUFBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxVQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLE1BQUEsVUFBQSxDQUFBLElBQUEsRUFBQSxNQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLEtBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxJQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQSxhQUFBLEVBQUEsS0FBQTtBQUNBLGFBQUEsRUFBQSxHQUFBO0dBQ0EsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsUUFBQSxHQUFBLFFBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxXQUFBLFVBQUEsQ0FBQSxVQUFBLENBQUEsT0FBQSxDQUFBLEVBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtHQUNBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsWUFBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxxQkFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxnQkFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxRQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsRUFBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLGdCQUFBLENBQUEsRUFBQSxDQUFBLFdBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQTtHQUNBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLGtCQUFBLEVBQUEsVUFBQSxDQUFBLFVBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFlBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxTQUFBLElBQUEsR0FBQSxJQUFBLE1BQUEsQ0FBQSxnQkFBQSxFQUFBO0FBQ0EsVUFBQSxNQUFBLENBQUEsZ0JBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQTtBQUNBLFlBQUEsSUFBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsRUFBQSxFQUFBO0FBQ0EsaUJBQUEsRUFBQSxDQUFBLFdBQUEsSUFBQSxHQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxJQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7T0FDQTtLQUNBO0FBQ0EsUUFBQSxNQUFBLENBQUEsUUFBQSxFQUFBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsV0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxLQUFBLElBQUEsQ0FBQSxFQUFBO0FBQ0EsVUFBQSxNQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLHFCQUFBLEdBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLG1CQUFBLEVBQUEsSUFBQTtBQUNBLHFCQUFBLEVBQUEsb0JBQUE7QUFDQSxvQkFBQSxFQUFBLHlCQUFBO0FBQ0EsZUFBQSxFQUFBLE1BQUE7U0FDQSxDQUFBLENBQUE7T0FDQSxNQUFBO0FBQ0EsY0FBQSxDQUFBLFdBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtPQUNBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxlQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEscUJBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtLQUNBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxRQUFBLFVBQUEsR0FBQTtBQUNBLGNBQUEsRUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxVQUFBO0FBQ0EsZ0JBQUEsRUFBQSxVQUFBLENBQUEsVUFBQTtLQUNBLENBQUE7QUFDQSxTQUFBLElBQUEsR0FBQSxJQUFBLE1BQUEsQ0FBQSxnQkFBQSxFQUFBO0FBQ0EsVUFBQSxNQUFBLENBQUEsZ0JBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQTtBQUNBLFlBQUEsSUFBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsRUFBQSxFQUFBO0FBQ0EsaUJBQUEsRUFBQSxDQUFBLFdBQUEsSUFBQSxHQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO09BQ0E7S0FDQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsNkJBQUEsRUFBQSxVQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEseUJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxFQUVBLENBQUEsQ0FBQTtBQ2hIQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFdBQUE7QUFDQSxlQUFBLEVBQUEsc0JBQUE7QUFDQSxjQUFBLEVBQUEsb0JBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxvQkFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxTQUFBLEVBQUE7QUFDQSxRQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsbUNBQUEsRUFBQSxTQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxRQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ25CQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFlBQUE7QUFDQSxlQUFBLEVBQUEsNkJBQUE7QUFDQSxjQUFBLEVBQUEscUJBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBR0EsR0FBQSxDQUFBLFVBQUEsQ0FBQSxxQkFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFdBQUEsRUFBQTs7QUFFQSxRQUFBLENBQUEsWUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsTUFBQSxJQUFBLEdBQUEsVUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLE1BQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0dBQ0E7QUFDQSxRQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsV0FBQSxHQUFBLElBQUEsQ0FBQSxXQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFFBQUEsR0FBQSxjQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQSxDQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLElBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtHQUVBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQSxlQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxxQkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLE9BQUEsR0FBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQTtBQUNBLFFBQUEsS0FBQSxHQUFBLElBQUEsSUFBQSxFQUFBLENBQUE7QUFDQSxRQUFBLEtBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxLQUFBLENBQUEsUUFBQSxFQUFBLEdBQUEsSUFBQSxFQUFBLE9BQUE7QUFDQSxVQUFBLENBQUEsV0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsV0FBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFlBQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsU0FBQSxHQUFBLFdBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxTQUFBLElBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxPQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxhQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFNBQUEsR0FBQTtBQUNBLGlCQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBO0FBQ0EsV0FBQSxFQUFBLE9BQUE7QUFDQSxZQUFBLEVBQUEsS0FBQTtPQUNBLENBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtLQUNBLE1BQUE7QUFDQSxZQUFBLENBQUEsWUFBQSxHQUFBLG9DQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLG9DQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLEtBQUE7QUFDQSxpQkFBQSxFQUFBLEdBQUE7T0FDQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsWUFBQSxHQUFBLFNBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFNBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLHlCQUFBLEVBQUE7QUFDQSxTQUFBLEVBQUEsTUFBQSxDQUFBLFlBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsWUFBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLFFBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBO0FBQ0EsaUJBQUEsRUFBQSxLQUFBO0FBQ0EsaUJBQUEsRUFBQSxHQUFBO09BQ0EsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsR0FBQSxRQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsV0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsV0FBQSxVQUFBLENBQUEsY0FBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxHQUFBLEdBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxXQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxpQkFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7QUFDQSxtQkFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsd0JBQUEsQ0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0EsTUFBQTtBQUNBLFVBQUEsV0FBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsZUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7QUFDQSxpQkFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EsVUFBQSxNQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsbUJBQUEsQ0FBQSxDQUFBO0tBQ0EsTUFBQTtBQUNBLFVBQUEsTUFBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLGFBQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxFQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsZUFBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxjQUFBLFdBQUEsR0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLG1CQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxDQUFBO1dBQ0EsQ0FBQSxDQUFBO0FBQ0EscUJBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7T0FDQSxNQUFBO0FBQ0EsY0FBQSxDQUFBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsYUFBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLEVBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxlQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsV0FBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsbUJBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLENBQUE7V0FDQSxDQUFBLENBQUE7QUFDQSxxQkFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsc0JBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0E7S0FDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFNBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFNBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsRUFBQSxPQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxZQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxHQUFBLENBQUEsaUNBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQTtBQUNBLG9CQUFBLEVBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBO0FBQ0EsYUFBQSxFQUFBLGNBQUE7T0FDQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsY0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxPQUFBLEdBQUEsNkNBQUEsR0FBQSxNQUFBLENBQUEsWUFBQSxHQUFBLGFBQUEsR0FBQSxNQUFBLENBQUEsY0FBQSxDQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTs7Ozs7O0FBTUEsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsUUFBQSxLQUFBLElBQUEsQ0FBQSxFQUFBLE9BQUE7QUFDQSxRQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsY0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFFBQUEsS0FBQSxJQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLEVBQUEsT0FBQTtBQUNBLFFBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7OztBQWdCQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxjQUFBLENBQUEsWUFBQTtBQUNBLFlBQUEsQ0FBQSxXQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLE1BQUEsQ0FBQSxtQ0FBQSxHQUFBLEdBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxpQkFBQSxFQUFBLFFBQUEsQ0FBQSxjQUFBLENBQUEsR0FBQSxDQUFBLE9BQUEsR0FBQSxRQUFBLENBQUE7QUFDQSxtQkFBQSxFQUFBLEtBQUE7QUFDQSxtQkFBQSxFQUFBLEdBQUE7U0FDQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7S0FDQSxFQUFBLEVBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsY0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFlBQUE7QUFDQSxXQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsTUFBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLE1BQUEsQ0FBQSxtQ0FBQSxHQUFBLE1BQUEsRUFBQTtBQUNBLGlCQUFBLEVBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxNQUFBLEdBQUEsUUFBQSxDQUFBO0FBQ0EsbUJBQUEsRUFBQSxLQUFBO0FBQ0EsbUJBQUEsRUFBQSxHQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0EsRUFBQSxFQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7QUFDQSxNQUFBLE1BQUEsQ0FBQSxPQUFBLElBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7R0FDQTtBQUNBLFFBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxTQUFBLGNBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxNQUFBLFFBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxNQUFBLEtBQUEsR0FBQSxJQUFBLElBQUEsRUFBQSxDQUFBO0FBQ0EsT0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxJQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxVQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsU0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0tBQ0E7QUFDQSxhQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsRUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0dBQ0E7QUFDQSxTQUFBLFFBQUEsQ0FBQTtDQUNBO0FDdFRBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxZQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsU0FBQTtBQUNBLGVBQUEsRUFBQSw0QkFBQTtBQUNBLGNBQUEsRUFBQSxzQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLHNCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUE7O0FBRUEsUUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFNBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLHlCQUFBLEVBQUE7QUFDQSxTQUFBLEVBQUEsTUFBQSxDQUFBLEdBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxRQUFBLENBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsS0FBQTtBQUNBLGlCQUFBLEVBQUEsR0FBQTtPQUNBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxHQUFBLFFBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsS0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsMkJBQUEsQ0FBQSxDQUFBO0tBQ0EsTUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBO0tBQ0EsTUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLElBQUEsQ0FBQSxrQkFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsS0FBQTtBQUNBLGVBQUEsRUFBQSxNQUFBLENBQUEsVUFBQSxDQUFBLE9BQUE7QUFDQSxZQUFBLEVBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBO0FBQ0EsYUFBQSxFQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsS0FBQTtBQUNBLGdCQUFBLEVBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBO0FBQ0Esa0JBQUEsRUFBQSxFQUFBO0FBQ0Esa0JBQUEsRUFBQSxFQUFBO09BQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGVBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSx5REFBQSxDQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO09BQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsK0JBQUEsQ0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDaEVBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUNBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsUUFBQTtBQUNBLFVBQUEsRUFBQTtBQUNBLGdCQUFBLEVBQUEsSUFBQTtLQUNBO0FBQ0EsZUFBQSxFQUFBLDBCQUFBO0FBQ0EsY0FBQSxFQUFBLGdCQUFBO0dBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsU0FBQTtBQUNBLGVBQUEsRUFBQSwyQkFBQTtBQUNBLGNBQUEsRUFBQSxnQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGdCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsV0FBQSxFQUFBLGNBQUEsRUFBQSxNQUFBLEVBQUE7QUFDQSxRQUFBLENBQUEsUUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxPQUFBLEVBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxLQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxTQUFBLEdBQUE7QUFDQSxpQkFBQSxFQUFBLHlCQUFBO0FBQ0EsWUFBQSxDQUFBLGFBQUEsR0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsaUJBQUEsRUFBQSxJQUFBO0FBQ0EsbUJBQUEsRUFBQSxxQkFBQTtBQUNBLGtCQUFBLEVBQUEsZ0JBQUE7QUFDQSxhQUFBLEVBQUEsTUFBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxLQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxLQUFBO0tBQ0EsQ0FBQTtBQUNBLGVBQUEsQ0FDQSxLQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxtQkFBQSxDQUFBLFNBQ0EsQ0FBQSxnQkFBQSxDQUFBLENBQUE7O0FBRUEsYUFBQSxtQkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFVBQUEsR0FBQSxDQUFBLE1BQUEsS0FBQSxHQUFBLElBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxzQkFBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEVBQUEsQ0FBQSxrQ0FBQSxDQUFBLENBQUE7T0FDQSxNQUFBO0FBQ0EsY0FBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLGFBQUEsRUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE9BQUE7QUFDQSxpQkFBQSxFQUFBLElBQUE7U0FDQSxDQUFBO09BQ0E7S0FDQTs7QUFFQSxhQUFBLGdCQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLFdBQUEsRUFBQSxrQ0FBQTtBQUNBLGVBQUEsRUFBQSxJQUFBO09BQ0EsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsaUJBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxZQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUdBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxLQUFBO0tBQ0EsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxRQUFBLElBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxlQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsV0FBQSxFQUFBLCtDQUFBO0FBQ0EsZUFBQSxFQUFBLElBQUE7T0FDQSxDQUFBO0FBQ0EsYUFBQTtLQUNBO0FBQ0EsZUFBQSxDQUNBLE1BQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLG9CQUFBLENBQUEsU0FDQSxDQUFBLGlCQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLG9CQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsaUJBQUEsQ0FBQSxHQUFBLEVBQUEsRUFDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsV0FBQSxHQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsNEJBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxHQUFBLENBQUEsV0FBQTtBQUNBLGdCQUFBLEVBQUEsTUFBQTtPQUNBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLG9CQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxVQUFBLFlBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsRUFBQSxDQUFBLGlDQUFBLEVBQUEsRUFBQSxZQUFBLEVBQUEsWUFBQSxDQUFBLFVBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxlQUFBO09BQ0E7QUFDQSxZQUFBLENBQUEsRUFBQSxDQUFBLGtDQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLHlCQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ3RIQSxHQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsV0FBQSxNQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFNBQUE7QUFDQSxTQUFBLEVBQUEsS0FBQTtBQUNBLFVBQUEsRUFBQSxNQUFBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQSxDQUFBOztBQ1pBLEdBQUEsQ0FBQSxPQUFBLENBQUEsZ0JBQUEsRUFBQSxDQUFBLFVBQUEsRUFBQSxVQUFBLFFBQUEsRUFBQTs7QUFFQSxXQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEsVUFBQSxHQUFBO0FBQ0EsWUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEsT0FBQSxHQUFBO0FBQ0EsV0FBQSxRQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsU0FBQTtBQUNBLFVBQUEsRUFBQSxNQUFBO0FBQ0EsY0FBQSxFQUFBLFVBQUE7QUFDQSxXQUFBLEVBQUEsT0FBQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUEsQ0FBQTs7QUNyQkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLGVBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxnQ0FBQTtBQUNBLGVBQUEsRUFBQSx3Q0FBQTtBQUNBLGNBQUEsRUFBQSxzQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsZ0JBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSw2Q0FBQTtBQUNBLGVBQUEsRUFBQSx3Q0FBQTtBQUNBLGNBQUEsRUFBQSxzQkFBQTtHQW1CQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxzQkFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFlBQUEsRUFBQSxXQUFBLEVBQUE7QUFDQSxRQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQTs7QUFHQSxRQUFBLENBQUEsYUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLE1BQUEsWUFBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxhQUFBLEdBQUEsSUFBQSxDQUFBO0dBQ0E7OztBQUdBLFFBQUEsQ0FBQSxRQUFBLEdBQUE7QUFDQSxZQUFBLEVBQUEsS0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxZQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsR0FBQSxDQUFBLHNDQUFBLEdBQUEsWUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsUUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxRQUFBLEdBQUEsUUFBQSxDQUFBO1NBQ0EsTUFBQTtBQUNBLGdCQUFBLENBQUEsUUFBQSxHQUFBLEVBQUEsQ0FBQTtTQUNBO09BQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsOEJBQUEsQ0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0EsTUFBQTtBQUNBLGFBQUEsS0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOzs7QUFHQSxRQUFBLENBQUEsSUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsMkJBQUEsRUFBQSxNQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLHVCQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsZ0NBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUE7S0FDQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUMxR0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLGdCQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsNEJBQUE7QUFDQSxlQUFBLEVBQUEsNENBQUE7QUFDQSxjQUFBLEVBQUEsMEJBQUE7QUFDQSxXQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsbUJBQUEsS0FBQSxFQUFBO0FBQ0EsZUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDBCQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsY0FBQSxRQUFBLEVBQUE7QUFDQSxtQkFBQSxRQUFBLENBQUE7V0FDQSxNQUFBO0FBQ0EsbUJBQUE7QUFDQSxxQkFBQSxFQUFBLGdCQUFBO2FBQ0EsQ0FBQTtXQUNBO1NBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxlQUFBLENBQUEsOEJBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0E7S0FDQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLDBCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsV0FBQSxFQUFBLFNBQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFNBQUEsR0FBQSxTQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBdUJBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSwwQkFBQSxFQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsY0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7OztBQWdCQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBO0tBQ0EsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDdkZBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEscUJBQUE7QUFDQSxlQUFBLEVBQUEseUNBQUE7QUFDQSxjQUFBLEVBQUEsdUJBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLGtCQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsMEJBQUE7QUFDQSxlQUFBLEVBQUEsOENBQUE7QUFDQSxjQUFBLEVBQUEsdUJBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLGtCQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEscUNBQUE7QUFDQSxlQUFBLEVBQUEseUNBQUE7QUFDQSxjQUFBLEVBQUEsdUJBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBR0EsR0FBQSxDQUFBLFVBQUEsQ0FBQSx1QkFBQSxFQUFBLENBQUEsWUFBQSxFQUNBLFFBQUEsRUFDQSxjQUFBLEVBQ0EsUUFBQSxFQUNBLE9BQUEsRUFDQSxXQUFBLEVBQ0EsU0FBQSxFQUNBLFdBQUEsRUFDQSxnQkFBQSxFQUNBLG9CQUFBLEVBQ0EsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsU0FBQSxFQUFBLGNBQUEsRUFBQSxrQkFBQSxFQUFBOztBQUVBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLGdCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLE9BQUEsRUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEtBQUE7R0FDQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLEtBQUEsR0FBQTtBQUNBLGtCQUFBLEVBQUEsYUFBQTtBQUNBLGNBQUEsRUFBQSxtQkFBQTtBQUNBLG1CQUFBLEVBQUEsOEJBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLFFBQUEsRUFBQSxLQUFBO0FBQ0EsV0FBQSxFQUFBLEtBQUE7QUFDQSxVQUFBLEVBQUEsS0FBQTtBQUNBLFdBQUEsRUFBQSxDQUFBO0FBQ0EsU0FBQSxFQUFBLEVBQUE7QUFDQSxZQUFBLEVBQUEsOEJBQUE7QUFDQSxjQUFBLEVBQUEsRUFBQTtBQUNBLFFBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxtQkFBQSxFQUFBLEtBQUE7S0FDQSxDQUFBO0FBQ0EsYUFBQSxFQUFBLENBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLFlBQUEsRUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEVBQUE7QUFDQSxRQUFBLEVBQUEsRUFBQTtLQUNBLENBQUE7R0FDQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLG1CQUFBLEdBQUEsRUFBQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLGFBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxTQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUEscUJBQUEsWUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGFBQUEsR0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsaUJBQUEsRUFBQSxJQUFBO0FBQ0EsbUJBQUEsRUFBQSxrQkFBQTtBQUNBLGtCQUFBLEVBQUEsdUJBQUE7QUFDQSxhQUFBLEVBQUEsTUFBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxhQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7R0FDQSxDQUFBOzs7QUFHQSxRQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTs7OztBQUlBLFdBQUEsb0JBQUEsR0FBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGdCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEtBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxLQUFBLEdBQUE7QUFDQSxvQkFBQSxFQUFBLGFBQUE7QUFDQSxnQkFBQSxFQUFBLG1CQUFBO0FBQ0EscUJBQUEsRUFBQSw4QkFBQTtBQUNBLGFBQUEsRUFBQSxFQUFBO0FBQ0EsVUFBQSxFQUFBLEtBQUE7QUFDQSxhQUFBLEVBQUEsS0FBQTtBQUNBLFlBQUEsRUFBQSxLQUFBO0FBQ0EsYUFBQSxFQUFBLENBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLGNBQUEsRUFBQSw4QkFBQTtBQUNBLGdCQUFBLEVBQUEsRUFBQTtBQUNBLFVBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxxQkFBQSxFQUFBLEtBQUE7T0FDQSxDQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLGNBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEVBQUE7QUFDQSxVQUFBLEVBQUEsRUFBQTtPQUNBLENBQUE7S0FDQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLE9BQUEsQ0FBQSxvQkFBQSxDQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7OztBQUdBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsWUFBQSxDQUFBLFNBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxrQkFBQSxDQUFBLFlBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTs7Ozs7O0tBTUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxjQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEtBQUEsRUFBQSxFQUFBO1VBV0EsNkJBQUEsR0FBQSxTQUFBLDZCQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsZUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEVBQUEsY0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxnQkFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsR0FBQSxlQUFBLENBQUEsQ0FBQTtPQUNBOztVQUVBLGlCQUFBLEdBQUEsU0FBQSxpQkFBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFNBQUEsRUFBQSxTQUFBLEVBQUEsVUFBQSxFQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsV0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUEsQ0FBQSxPQUFBO0FBQ0EsbUJBQUEsRUFBQSxJQUFBLENBQUEsR0FBQTthQUNBLENBQUEsQ0FBQTtXQUNBO1NBQ0EsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLGdCQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7T0FDQTs7VUFFQSxXQUFBLEdBQUEsU0FBQSxXQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsYUFBQSxDQUFBLDZCQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO09BQ0E7O0FBdkNBLFlBQUEsQ0FBQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esd0JBQUEsQ0FDQSxXQUFBLENBQUE7QUFDQSxXQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBO09BQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSw2QkFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLGlCQUFBLENBQUEsU0FDQSxDQUFBLFdBQUEsQ0FBQSxDQUFBO0tBZ0NBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsUUFBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxzQkFBQSxDQUNBLFdBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLE1BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxTQUNBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsbUJBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsWUFBQSxFQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLFFBQUEsRUFBQSxFQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxjQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxpQkFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxzQkFBQSxDQUNBLFdBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLE1BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUdBLFFBQUEsQ0FBQSxZQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLEVBQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQTtLQUNBOztBQUVBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsWUFBQSxFQUFBLDhCQUFBO0FBQ0EsY0FBQSxFQUFBLEVBQUE7QUFDQSxRQUFBLEVBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFlBQUE7OztBQUdBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEVBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFlBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFlBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxhQUFBLFdBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxVQUFBLFFBQUEsR0FBQSxRQUFBLENBQUEsYUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLFFBQUEsQ0FBQSxJQUFBLElBQUEsRUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtPQUNBO0FBQ0EsYUFBQSxRQUFBLENBQUE7S0FDQTs7QUFFQSxRQUFBLFFBQUEsR0FBQSxXQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsUUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLEdBQUEsS0FBQSxJQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxRQUFBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUE7S0FDQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxnQkFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUE7S0FDQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsUUFBQSxPQUFBLEdBQUEsSUFBQSxRQUFBLEVBQUEsQ0FBQTs7Ozs7QUFLQSxTQUFBLElBQUEsSUFBQSxJQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsRUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7S0FDQTs7OztBQUlBLFFBQUEsT0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQTtBQUNBLGFBQUEsSUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLEVBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBOzs7O0FBSUEsUUFBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsTUFBQSxDQUFBLFdBQUEsRUFBQSxJQUFBLENBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7Ozs7QUFJQSxRQUFBLE9BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsRUFBQSxJQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7Ozs7QUFJQSxRQUFBLE9BQUEsR0FBQTtBQUNBLFlBQUEsRUFBQSxNQUFBO0FBQ0EsU0FBQSxFQUFBLDJCQUFBO0FBQ0EsYUFBQSxFQUFBO0FBQ0Esc0JBQUEsRUFBQSxTQUFBO09BQ0E7QUFDQSxzQkFBQSxFQUFBLE9BQUEsQ0FBQSxRQUFBO0FBQ0EsVUFBQSxFQUFBLE9BQUE7S0FDQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQTs7QUFFQSxlQUFBO09BQ0E7QUFDQSwwQkFBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsU0FBQSxDQUFBLFdBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLDRCQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0Esb0JBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0Esc0JBQUEsQ0FDQSxlQUFBLEVBQUEsQ0FDQSxJQUFBLENBQUEsY0FBQSxDQUFBLFNBQ0EsQ0FBQSxXQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLGNBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsbUJBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxXQUFBLENBQUEsR0FBQSxFQUFBLEVBRUE7R0FDQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLGtCQUFBLEdBQUEsVUFBQSxpQkFBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FDQSxrQkFBQSxDQUFBO0FBQ0EsUUFBQSxFQUFBLGlCQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxjQUFBLENBQUEsU0FDQSxDQUFBLFdBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsY0FBQSxDQUFBLEdBQUEsRUFBQTs7QUFFQSxZQUFBLENBQUEsZ0JBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7O0FBRUEsVUFBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxZQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLFdBQUEsSUFBQSxJQUFBLElBQUEsT0FBQSxFQUFBO0FBQ0Esb0JBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxhQUFBLEVBQUEsSUFBQTtBQUNBLGVBQUEsRUFBQSxPQUFBLENBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0E7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxZQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsV0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxxQkFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLFFBQUEsT0FBQSxDQUFBLDBDQUFBLENBQUEsRUFBQTtVQVVBLGNBQUEsR0FBQSxTQUFBLGNBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxtQkFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7T0FDQTs7VUFFQSxXQUFBLEdBQUEsU0FBQSxXQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7T0FDQTs7QUFoQkEsVUFBQSxpQkFBQSxHQUFBLE1BQUEsQ0FBQSxtQkFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esd0JBQUEsQ0FDQSxxQkFBQSxDQUFBO0FBQ0EsVUFBQSxFQUFBLGlCQUFBO09BQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxjQUFBLENBQUEsU0FDQSxDQUFBLFdBQUEsQ0FBQSxDQUFBO0tBVUEsTUFBQTtBQUNBLGFBQUEsS0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0NBQ0EsQ0FFQSxDQUFBLENBQUE7QUM1YkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxXQUFBO0FBQ0EsZUFBQSxFQUFBLGdEQUFBO0FBQ0EsY0FBQSxFQUFBLHlCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEseUJBQUEsRUFBQSxDQUFBLFlBQUEsRUFDQSxRQUFBLEVBQ0EsUUFBQSxFQUNBLE9BQUEsRUFDQSxXQUFBLEVBQ0EsU0FBQSxFQUNBLElBQUEsRUFDQSxzQkFBQSxFQUNBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsRUFBQSxFQUFBLG9CQUFBLEVBQUE7OztBQUdBLE1BQUEsU0FBQSxHQUFBLElBQUEsQ0FBQTs7OztBQUlBLFFBQUEsQ0FBQSxTQUFBLEdBQUE7QUFDQSxhQUFBLEVBQUEsc0JBQUE7QUFDQSxZQUFBLEVBQUEsYUFBQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsZUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0tBQ0EsTUFBQTtBQUNBLGVBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsbUJBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxpQkFBQSxHQUFBLDhCQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsWUFBQSxHQUFBLEVBQUEsQ0FBQTs7OztBQUlBLFFBQUEsQ0FBQSxnQkFBQSxHQUFBLFlBQUE7O0FBRUEsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxRQUFBLE9BQUEsR0FBQSxTQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsT0FBQSxDQUFBO0FBQ0Esd0JBQUE7O0tBRUEsSUFBQSxDQUFBLG9CQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsbUJBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxRQUFBLENBQUEsU0FDQSxDQUFBLHVCQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLG9CQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsYUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxlQUFBO0FBQ0EsNEJBQUEsRUFBQSxNQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxlQUFBLEdBQUEsR0FBQTtBQUNBLDZCQUFBLEVBQUEsV0FBQTtBQUNBLDJCQUFBLEVBQUEsT0FBQTtTQUNBLENBQUE7T0FDQSxDQUFBOztBQUVBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7O0FBRUEsVUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLGtCQUFBLEtBQUEsTUFBQSxFQUFBO0FBQ0EsZUFBQSxvQkFBQSxDQUFBLGVBQUEsQ0FBQTtBQUNBLGdCQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBO0FBQ0EsaUJBQUEsRUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEdBQUE7U0FDQSxDQUFBLENBQUE7T0FDQSxNQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO09BQ0E7S0FDQTs7QUFFQSxhQUFBLG1CQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxPQUFBLEdBQUEsS0FBQSxRQUFBLElBQUEsR0FBQSxDQUFBLElBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxZQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtPQUNBO0FBQ0EsYUFBQSxFQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxRQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsZUFBQSxHQUFBLE1BQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsdUJBQUEsR0FBQTtBQUNBLFdBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOzs7O0FBS0EsUUFBQSxDQUFBLGFBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLHlCQUFBLENBQUEsQ0FBQTtBQUNBLGFBQUEsS0FBQSxDQUFBO0tBQ0E7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FDQSxJQUFBLENBQUEsWUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFlBQUEsQ0FBQSxTQUNBLENBQUEsZUFBQSxDQUFBLENBQUE7O0FBRUEsYUFBQSxZQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLGFBQUEsb0JBQUEsQ0FBQSxZQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxZQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxJQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxLQUFBLEVBQUEsRUFBQTtBQUNBLGVBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxDQUFBO09BQ0EsTUFBQTtBQUNBLGNBQUEsQ0FBQSxTQUFBLEdBQUEscUNBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxtQkFBQSxHQUFBLElBQUEsQ0FBQTtPQUNBO0FBQ0EsWUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxlQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGtDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO0tBQ0E7R0FFQSxDQUFBO0NBQ0EsQ0FDQSxDQUFBLENBQUE7O0FDeklBLEdBQUEsQ0FBQSxPQUFBLENBQUEsb0JBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxXQUFBLFdBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEsZUFBQSxHQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGlDQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEsa0JBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsNEJBQUEsR0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLHFCQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLGtDQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxTQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUE7QUFDQSxtQkFBQSxFQUFBLGVBQUE7QUFDQSxzQkFBQSxFQUFBLGtCQUFBO0FBQ0EseUJBQUEsRUFBQSxxQkFBQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUEsQ0FBQTs7QUN6QkEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxzQkFBQSxFQUFBLENBQUEsT0FBQSxFQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLFdBQUEsZ0JBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsOEJBQUEsR0FBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEsWUFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSx5QkFBQSxFQUFBO0FBQ0EsU0FBQSxFQUFBLElBQUEsQ0FBQSxRQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsV0FBQSxZQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLG9CQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLGVBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsb0NBQUEsR0FBQSxJQUFBLENBQUEsTUFBQSxHQUFBLFdBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxTQUFBO0FBQ0Esb0JBQUEsRUFBQSxnQkFBQTtBQUNBLGdCQUFBLEVBQUEsWUFBQTtBQUNBLGdCQUFBLEVBQUEsWUFBQTtBQUNBLG1CQUFBLEVBQUEsZUFBQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUEsQ0FBQTs7QUMxQkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQ0EsS0FBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxlQUFBO0FBQ0EsZUFBQSxFQUFBLDRDQUFBO0FBQ0EsY0FBQSxFQUFBLHVCQUFBO0FBQ0EsWUFBQSxFQUFBLElBQUE7QUFDQSxXQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsaUJBQUEsRUFBQSxFQUFBLE1BQUEsRUFBQSxjQUFBLEVBQUE7QUFDQSxZQUFBLFFBQUEsR0FBQSxFQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7QUFDQSxZQUFBLElBQUEsR0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7QUFDQSxZQUFBLElBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7U0FDQSxNQUFBO0FBQ0Esa0JBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUE7U0FDQTs7QUFFQSxlQUFBLFFBQUEsQ0FBQSxPQUFBLENBQUE7T0FDQTtLQUNBO0dBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxxQkFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFVBQUE7QUFDQSxlQUFBLEVBQUEsd0NBQUE7QUFDQSxjQUFBLEVBQUEsdUJBQUE7R0FDQSxDQUFBLENBQ0EsS0FBQSxDQUFBLDZCQUFBLEVBQUE7QUFDQSxZQUFBLEVBQUEsSUFBQTtBQUNBLE9BQUEsRUFBQSxFQUFBO0FBQ0EsWUFBQSxFQUFBLCtCQUFBO0FBQ0EsY0FBQSxFQUFBLHVCQUFBO0dBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxrQ0FBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLG1CQUFBO0FBQ0EsVUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxJQUFBO0tBQ0E7QUFDQSxTQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUE7QUFDQSxtQkFBQSxFQUFBLHFEQUFBO0FBQ0Esa0JBQUEsRUFBQSx1QkFBQTtPQUNBO0tBQ0E7R0FDQSxDQUFBLENBQ0EsS0FBQSxDQUFBLGtDQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsbUNBQUE7QUFDQSxTQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUE7QUFDQSxtQkFBQSxFQUFBLGdEQUFBO0FBQ0Esa0JBQUEsRUFBQSx1QkFBQTtPQUNBO0tBQ0E7R0FDQSxDQUFBLENBQ0EsS0FBQSxDQUFBLGlDQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsdUJBQUE7QUFDQSxVQUFBLEVBQUE7QUFDQSxnQkFBQSxFQUFBLElBQUE7S0FDQTtBQUNBLFNBQUEsRUFBQTtBQUNBLGVBQUEsRUFBQTtBQUNBLG1CQUFBLEVBQUEsZ0RBQUE7QUFDQSxrQkFBQSxFQUFBLHVCQUFBO09BQ0E7S0FDQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLHVCQUFBLEVBQUEsQ0FBQSxZQUFBLEVBQ0EsUUFBQSxFQUNBLGNBQUEsRUFDQSxRQUFBLEVBQ0EsT0FBQSxFQUNBLFdBQUEsRUFDQSxTQUFBLEVBQ0EsV0FBQSxFQUNBLFVBQUEsRUFDQSxnQkFBQSxFQUNBLG9CQUFBLEVBQ0EsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQSxjQUFBLEVBQUEsa0JBQUEsRUFBQTs7OztBQUlBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLGdCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLE9BQUEsRUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEtBQUE7R0FDQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLEtBQUEsR0FBQTtBQUNBLGtCQUFBLEVBQUEsRUFBQTtBQUNBLGNBQUEsRUFBQSxFQUFBO0FBQ0EsbUJBQUEsRUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEVBQUE7QUFDQSxRQUFBLEVBQUEsS0FBQTtBQUNBLFdBQUEsRUFBQSxLQUFBO0FBQ0EsVUFBQSxFQUFBLEtBQUE7QUFDQSxXQUFBLEVBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsWUFBQSxFQUFBLEVBQUE7QUFDQSxjQUFBLEVBQUEsRUFBQTtBQUNBLFFBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxtQkFBQSxFQUFBLEtBQUE7S0FDQSxDQUFBO0FBQ0Esc0JBQUEsRUFBQSxNQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLG1CQUFBLEdBQUEsRUFBQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLFNBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsWUFBQSxHQUFBLElBQUEsQ0FBQTs7OztBQUlBLFFBQUEsQ0FBQSxhQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLEtBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsU0FBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLHFCQUFBLGFBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxHQUFBLGFBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxhQUFBLEdBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsSUFBQTtBQUNBLG1CQUFBLEVBQUEsa0JBQUE7QUFDQSxrQkFBQSxFQUFBLHVCQUFBO0FBQ0EsYUFBQSxFQUFBLE1BQUE7T0FDQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsYUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsd0JBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsZ0JBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsb0JBQUEsR0FBQTtBQUNBLGVBQUEsRUFBQSxxQkFBQSxLQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsWUFBQTtBQUNBLGNBQUEsQ0FBQSx3QkFBQSxHQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxtQkFBQSxFQUFBLElBQUE7QUFDQSxxQkFBQSxFQUFBLGtCQUFBO0FBQ0Esb0JBQUEsRUFBQSx1QkFBQTtBQUNBLGVBQUEsRUFBQSxNQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxxQkFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSx3QkFBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSx3QkFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxxQkFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxhQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLGlCQUFBLEdBQUE7QUFDQSxZQUFBLEVBQUEsa0JBQUEsWUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLGFBQUEsQ0FBQSxZQUFBLEdBQUEsWUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGFBQUEsR0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsaUJBQUEsRUFBQSxJQUFBO0FBQ0EsbUJBQUEsRUFBQSxlQUFBO0FBQ0Esa0JBQUEsRUFBQSx1QkFBQTtBQUNBLGFBQUEsRUFBQSxNQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLGtCQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxxQkFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0dBQ0EsQ0FBQTs7O0FBR0EsUUFBQSxDQUFBLE9BQUEsR0FBQSxFQUFBLENBQUE7Ozs7QUFJQSxXQUFBLG9CQUFBLEdBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxLQUFBO0tBQ0EsQ0FBQTs7QUFFQSxVQUFBLENBQUEsS0FBQSxHQUFBO0FBQ0Esb0JBQUEsRUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxFQUFBO0FBQ0EscUJBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEVBQUE7QUFDQSxVQUFBLEVBQUEsS0FBQTtBQUNBLGFBQUEsRUFBQSxLQUFBO0FBQ0EsWUFBQSxFQUFBLEtBQUE7QUFDQSxhQUFBLEVBQUEsQ0FBQTtBQUNBLFdBQUEsRUFBQSxFQUFBO0FBQ0EsY0FBQSxFQUFBLEVBQUE7QUFDQSxnQkFBQSxFQUFBLEVBQUE7QUFDQSxVQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0EscUJBQUEsRUFBQSxLQUFBO09BQ0EsQ0FBQTtBQUNBLHdCQUFBLEVBQUEsTUFBQTtLQUNBLENBQUE7QUFDQSxXQUFBLENBQUEsT0FBQSxDQUFBLG9CQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7O0FBR0EsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxZQUFBLENBQUEsU0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLGtCQUFBLENBQUEsWUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxpQkFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLFlBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxVQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsaUNBQUEsQ0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsY0FBQSxFQUFBLENBQUE7QUFDQSxlQUFBO09BQ0E7QUFDQSxZQUFBLENBQUEsaUJBQUEsQ0FBQSxRQUFBLENBQUEsWUFBQSxDQUFBLFVBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsY0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxLQUFBLEVBQUEsRUFBQTtVQVdBLDZCQUFBLEdBQUEsU0FBQSw2QkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsZUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEVBQUEsY0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxnQkFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsR0FBQSxlQUFBLENBQUEsQ0FBQTtPQUNBOztVQUVBLGlCQUFBLEdBQUEsU0FBQSxpQkFBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFNBQUEsRUFBQSxTQUFBLEVBQUEsVUFBQSxFQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsV0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUEsQ0FBQSxPQUFBO0FBQ0EsbUJBQUEsRUFBQSxJQUFBLENBQUEsR0FBQTthQUNBLENBQUEsQ0FBQTtXQUNBO1NBQ0EsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLGdCQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7T0FDQTs7VUFFQSxXQUFBLEdBQUEsU0FBQSxXQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsYUFBQSxDQUFBLDZCQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO09BQ0E7O0FBeENBLFlBQUEsQ0FBQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esd0JBQUEsQ0FDQSxXQUFBLENBQUE7QUFDQSxXQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBO09BQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSw2QkFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLGlCQUFBLENBQUEsU0FDQSxDQUFBLFdBQUEsQ0FBQSxDQUFBO0tBaUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBOzs7O0FBSUEsVUFBQSxDQUFBLGdCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7Ozs7QUFJQSxRQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsWUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxlQUFBLEdBQUEsS0FBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUEsV0FBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEVBQUEsY0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxHQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLEdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEdBQUEsZUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLGlCQUFBLENBQUEsU0FDQSxDQUFBLFdBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsaUJBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFNBQUEsRUFBQSxTQUFBLEVBQUEsVUFBQSxFQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsV0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxlQUFBLEVBQUEsSUFBQSxDQUFBLE9BQUE7QUFDQSxpQkFBQSxFQUFBLElBQUEsQ0FBQSxHQUFBO1dBQ0EsQ0FBQSxDQUFBO1NBQ0E7T0FDQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsZ0JBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsV0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSw2QkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsUUFBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxzQkFBQSxDQUNBLFdBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLE1BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsU0FDQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLG1CQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsWUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFNBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUE7S0FDQTs7QUFFQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLFlBQUEsRUFBQSxFQUFBO0FBQ0EsY0FBQSxFQUFBLEVBQUE7QUFDQSxRQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsRUFBQSxLQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxFQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxZQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxZQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsYUFBQSxXQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsVUFBQSxRQUFBLEdBQUEsUUFBQSxDQUFBLGFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsVUFBQSxRQUFBLENBQUEsSUFBQSxJQUFBLEVBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsSUFBQSxHQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7T0FDQTtBQUNBLGFBQUEsUUFBQSxDQUFBO0tBQ0E7O0FBRUEsUUFBQSxRQUFBLEdBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLFFBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxHQUFBLEtBQUEsSUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxRQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsRUFBQTtBQUNBLGFBQUEsS0FBQSxDQUFBO0tBQ0E7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZ0JBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGlCQUFBLENBQUEsQ0FBQTtBQUNBLGFBQUEsS0FBQSxDQUFBO0tBQ0E7OztBQUdBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsUUFBQSxPQUFBLEdBQUEsSUFBQSxRQUFBLEVBQUEsQ0FBQTs7Ozs7QUFLQSxTQUFBLElBQUEsSUFBQSxJQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsRUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7S0FDQTs7OztBQUlBLFFBQUEsT0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQTtBQUNBLGFBQUEsSUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLEVBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBOzs7Ozs7Ozs7Ozs7O0FBYUEsUUFBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLEVBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBOzs7O0FBSUEsUUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxNQUFBLENBQUEsV0FBQSxFQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0E7Ozs7QUFJQSxRQUFBLE9BQUEsR0FBQTtBQUNBLFlBQUEsRUFBQSxNQUFBO0FBQ0EsU0FBQSxFQUFBLDJCQUFBO0FBQ0EsYUFBQSxFQUFBLEVBQUEsY0FBQSxFQUFBLFNBQUEsRUFBQTtBQUNBLHNCQUFBLEVBQUEsT0FBQSxDQUFBLFFBQUE7QUFDQSxVQUFBLEVBQUEsT0FBQTtLQUNBLENBQUE7QUFDQSxTQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBOzs7QUFHQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsWUFBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxFQUFBLENBQUEsa0NBQUEsRUFBQSxFQUFBLFlBQUEsRUFBQSxZQUFBLENBQUEsVUFBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLGVBQUE7T0FDQTtBQUNBLFlBQUEsQ0FBQSxFQUFBLENBQUEsa0NBQUEsQ0FBQSxDQUFBOzs7Ozs7S0FNQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLDRCQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0Esb0JBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsSUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsTUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsR0FBQSxDQUFBO0FBQ0EsV0FBQSxFQUFBLEVBQUE7QUFDQSxjQUFBLEVBQUEsRUFBQTtBQUNBLGdCQUFBLEVBQUEsRUFBQTtBQUNBLFVBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxxQkFBQSxFQUFBLElBQUE7T0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLENBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLENBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsR0FBQSxJQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLENBQUEsVUFBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxHQUFBLEVBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBOztBQUVBLFVBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxLQUFBO0tBQ0EsQ0FBQTs7QUFFQSxRQUFBLGNBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7O0FBRUEsUUFBQSxPQUFBLEdBQUE7QUFDQSxVQUFBLEVBQUEsRUFBQTtBQUNBLGNBQUEsRUFBQSxFQUFBO0FBQ0Esb0JBQUEsRUFBQSxJQUFBLENBQUEsU0FBQSxDQUFBLGNBQUEsQ0FBQTtLQUNBLENBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxLQUFBLE1BQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxJQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBO0tBQ0EsTUFBQSxJQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxLQUFBLFVBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBO0tBQ0EsTUFBQSxJQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxLQUFBLE9BQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBO0tBQ0E7O0FBRUEsc0JBQUEsQ0FDQSxlQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxHQUFBLENBQUEsSUFBQSxLQUFBLGFBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUEsdUJBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUE7U0FDQSxDQUFBO0FBQ0EsZUFBQTtPQUNBO0FBQ0Esb0JBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLHFCQUFBLEVBQUEsQ0FBQTtLQUNBLENBQUEsU0FDQSxDQUFBLFVBQUEsR0FBQSxFQUFBLEVBRUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsbUJBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZ0JBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsRUFBQTtBQUNBLGFBQUEsS0FBQSxDQUFBO0tBQ0E7O0FBRUEsVUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsWUFBQSxFQUFBLEVBQUE7QUFDQSxjQUFBLEVBQUEsRUFBQTtBQUNBLFFBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxtQkFBQSxFQUFBLElBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxzQkFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsUUFBQSxhQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxzQkFBQSxDQUNBLFdBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsR0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsTUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLFNBQ0EsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxtQkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLHlCQUFBLEdBQUEsWUFBQTtBQUNBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FDQSxJQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLGNBQUEsQ0FBQSxTQUNBLENBQUEsV0FBQSxDQUFBLENBQUE7O0FBRUEsYUFBQSxRQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxrQkFBQSxDQUFBLHlCQUFBLENBQUE7QUFDQSxhQUFBLEVBQUEsR0FBQSxDQUFBLFdBQUE7T0FDQSxDQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLGNBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsR0FBQSxDQUFBLE1BQUEsS0FBQSxHQUFBLElBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEtBQUEsSUFBQSxFQUFBO0FBQ0Esc0JBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtPQUNBLE1BQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLDJEQUFBO0FBQ0EsaUJBQUEsRUFBQSxJQUFBO1NBQ0EsQ0FBQTtPQUNBO0FBQ0EsWUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxXQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0Esc0JBQUEsQ0FDQSxlQUFBLEVBQUEsQ0FDQSxJQUFBLENBQUEsY0FBQSxDQUFBLFNBQ0EsQ0FBQSxXQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLGNBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsbUJBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxXQUFBLENBQUEsR0FBQSxFQUFBLEVBRUE7R0FDQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLGtCQUFBLEdBQUEsVUFBQSxpQkFBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FDQSxrQkFBQSxDQUFBO0FBQ0EsUUFBQSxFQUFBLGlCQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxjQUFBLENBQUEsU0FDQSxDQUFBLFdBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsY0FBQSxDQUFBLEdBQUEsRUFBQTs7QUFFQSxZQUFBLENBQUEsZ0JBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7O0FBRUEsVUFBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxjQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsWUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsbUJBQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsV0FBQSxJQUFBLElBQUEsSUFBQSxPQUFBLEVBQUE7QUFDQSxvQkFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGFBQUEsRUFBQSxJQUFBO0FBQ0EsZUFBQSxFQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7T0FDQTtBQUNBLG9CQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsMkJBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxhQUFBLEVBQUEsSUFBQTtTQUNBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLGtCQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLGtCQUFBLEdBQUEsTUFBQSxDQUFBO09BQ0E7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxZQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLGNBQUEsR0FBQSxtQkFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEdBQUEsRUFBQSxDQUFBOzs7QUFHQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsV0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxxQkFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsUUFBQSxPQUFBLENBQUEsMENBQUEsQ0FBQSxFQUFBO1VBVUEsY0FBQSxHQUFBLFNBQUEsY0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLG1CQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtPQUNBOztVQUVBLFdBQUEsR0FBQSxTQUFBLFdBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtPQUNBOztBQWhCQSxVQUFBLGlCQUFBLEdBQUEsTUFBQSxDQUFBLG1CQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSx3QkFBQSxDQUNBLHFCQUFBLENBQUE7QUFDQSxVQUFBLEVBQUEsaUJBQUE7T0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLGNBQUEsQ0FBQSxTQUNBLENBQUEsV0FBQSxDQUFBLENBQUE7S0FVQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLDBCQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLE9BQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxHQUFBLENBQUEsU0FBQSxHQUFBLE9BQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxHQUFBLFNBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7T0FDQSxDQUFBLFNBQ0EsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0NBQ0EsQ0FDQSxDQUFBLENBQUE7QUMzc0JBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUNBLEtBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsR0FBQTtBQUNBLGVBQUEsRUFBQSx5QkFBQTtBQUNBLGNBQUEsRUFBQSxnQkFBQTtHQUNBLENBQUEsQ0FDQSxLQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFFBQUE7QUFDQSxlQUFBLEVBQUEsMEJBQUE7QUFDQSxjQUFBLEVBQUEsZ0JBQUE7R0FDQSxDQUFBLENBQ0EsS0FBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxXQUFBO0FBQ0EsZUFBQSxFQUFBLDZCQUFBO0FBQ0EsY0FBQSxFQUFBLGdCQUFBO0dBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsT0FBQTtBQUNBLGVBQUEsRUFBQSx5QkFBQTtBQUNBLGNBQUEsRUFBQSxnQkFBQTtHQUNBLENBQUEsQ0FDQSxLQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFFBQUE7QUFDQSxlQUFBLEVBQUEsMEJBQUE7QUFDQSxjQUFBLEVBQUEsZ0JBQUE7R0FDQSxDQUFBLENBQ0EsS0FBQSxDQUFBLFNBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxVQUFBO0FBQ0EsZUFBQSxFQUFBLDRCQUFBO0FBQ0EsY0FBQSxFQUFBLGdCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsZ0JBQUEsRUFBQSxDQUFBLFlBQUEsRUFDQSxRQUFBLEVBQ0EsUUFBQSxFQUNBLE9BQUEsRUFDQSxXQUFBLEVBQ0EsU0FBQSxFQUNBLGFBQUEsRUFDQSxVQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxTQUFBLEVBQUEsT0FBQSxFQUFBLFdBQUEsRUFBQTs7QUFFQSxRQUFBLENBQUEsY0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLElBQUEsR0FBQTtBQUNBLGVBQUEsRUFBQSxLQUFBO0FBQ0EsZUFBQSxFQUFBLEtBQUE7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLGVBQUEsRUFBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEtBQUE7S0FDQTtBQUNBLGVBQUEsRUFBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEtBQUE7S0FDQTtHQUNBLENBQUE7Ozs7QUFJQSxRQUFBLENBQUEscUJBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLGlCQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxLQUFBO09BQ0E7S0FDQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBOztBQUVBLFVBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxHQUFBO0FBQ0EsU0FBQSxFQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsS0FBQTtLQUNBLENBQUE7O0FBRUEsZUFBQSxDQUNBLGVBQUEsQ0FBQSxNQUFBLENBQUEsY0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLHVCQUFBLENBQUEsU0FDQSxDQUFBLG9CQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLHVCQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxHQUFBLENBQUEsTUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxjQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsSUFBQSxDQUFBO09BQ0E7S0FDQTs7QUFFQSxhQUFBLG9CQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxHQUFBLENBQUEsTUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxHQUFBO0FBQ0EsYUFBQSxFQUFBLHVCQUFBO0FBQ0EsaUJBQUEsRUFBQSxJQUFBO1NBQ0EsQ0FBQTtBQUNBLGVBQUE7T0FDQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxHQUFBO0FBQ0EsV0FBQSxFQUFBLGtDQUFBO0FBQ0EsZUFBQSxFQUFBLElBQUE7T0FDQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOzs7Ozs7QUFNQSxRQUFBLENBQUEsaUJBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLGlCQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxLQUFBO09BQ0E7S0FDQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsZUFBQSxDQUNBLGVBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLG1CQUFBLENBQUEsU0FDQSxDQUFBLGdCQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLG1CQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxHQUFBLENBQUEsTUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsSUFBQSxDQUFBO09BQ0E7S0FDQTs7QUFFQSxhQUFBLGdCQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxHQUFBLENBQUEsTUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxHQUFBO0FBQ0EsYUFBQSxFQUFBLHVCQUFBO0FBQ0EsaUJBQUEsRUFBQSxJQUFBO1NBQ0EsQ0FBQTtBQUNBLGVBQUE7T0FDQTs7QUFFQSxZQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsR0FBQTtBQUNBLFdBQUEsRUFBQSxrQ0FBQTtBQUNBLGVBQUEsRUFBQSxJQUFBO09BQ0EsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7O0NBR0EsQ0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLEVBQUEsVUFBQSxPQUFBLEVBQUE7QUFDQSxTQUFBO0FBQ0EsWUFBQSxFQUFBLElBQUE7QUFDQSxRQUFBLEVBQUEsY0FBQSxNQUFBLEVBQUEsUUFBQSxFQUFBO0FBQ0EsVUFBQSxHQUFBLEdBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsU0FBQSxHQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxTQUFBLENBQUE7O0FBRUEsZUFBQSxZQUFBLEdBQUE7O0FBRUEsWUFBQSxPQUFBLENBQUEsV0FBQSxHQUFBLFNBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsRUFBQSxPQUFBLENBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsRUFBQSxNQUFBLENBQUEsQ0FBQTtTQUNBLE1BQUE7QUFDQSxrQkFBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLEVBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsRUFBQSxDQUFBLENBQUE7U0FDQTtPQUNBOztBQUVBLFlBQUEsQ0FBQSxHQUFBLENBQUEsbUJBQUEsRUFBQSxZQUFBO0FBQ0EsV0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLEVBQUEsWUFBQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxZQUFBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUMvS0EsR0FBQSxDQUFBLE9BQUEsQ0FBQSxvQkFBQSxFQUFBLENBQUEsT0FBQSxFQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLFdBQUEsV0FBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSx5QkFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsV0FBQSxlQUFBLEdBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsMkJBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsV0FBQSxrQkFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSw0QkFBQSxHQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEscUJBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsa0NBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEsZUFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSw0QkFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsV0FBQSx5QkFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxrQ0FBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsV0FBQSwwQkFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSwyQkFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsU0FBQTtBQUNBLGVBQUEsRUFBQSxXQUFBO0FBQ0EsbUJBQUEsRUFBQSxlQUFBO0FBQ0Esc0JBQUEsRUFBQSxrQkFBQTtBQUNBLG1CQUFBLEVBQUEsZUFBQTtBQUNBLHlCQUFBLEVBQUEscUJBQUE7QUFDQSw2QkFBQSxFQUFBLHlCQUFBO0FBQ0EsOEJBQUEsRUFBQSwwQkFBQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUEsQ0FBQTs7QUN2Q0EsR0FBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsV0FBQSxlQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLHVCQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLGVBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsdUJBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFNBQUE7QUFDQSxtQkFBQSxFQUFBLGVBQUE7QUFDQSxtQkFBQSxFQUFBLGVBQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBLENBQUE7O0FDaEJBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsVUFBQTtBQUNBLGVBQUEsRUFBQSwrQkFBQTtBQUNBLGNBQUEsRUFBQSxtQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLG1CQUFBLEVBQUEsQ0FBQSxZQUFBLEVBQ0EsUUFBQSxFQUNBLFFBQUEsRUFDQSxPQUFBLEVBQ0EsV0FBQSxFQUNBLFNBQUEsRUFDQSxnQkFBQSxFQUNBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsY0FBQSxFQUFBOztBQUVBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsQ0FDQSxrQkFBQSxFQUNBLFNBQUEsRUFDQSxVQUFBLEVBQ0EsT0FBQSxFQUNBLFdBQUEsRUFDQSxTQUFBLEVBQ0EsYUFBQSxFQUNBLFdBQUEsRUFDQSxZQUFBLEVBQ0EsT0FBQSxFQUNBLGFBQUEsRUFDQSxTQUFBLEVBQ0EsWUFBQSxFQUNBLFVBQUEsRUFDQSxNQUFBLEVBQ0EsYUFBQSxFQUNBLE9BQUEsRUFDQSxtQkFBQSxFQUNBLE9BQUEsRUFDQSxNQUFBLEVBQ0EsNkJBQUEsQ0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLE9BQUEsRUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEtBQUE7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLElBQUEsR0FBQSxJQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0EsU0FBQSxJQUFBLElBQUEsSUFBQSxNQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0E7QUFDQSxrQkFBQSxDQUNBLFdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsZUFBQSxDQUFBLFNBQ0EsQ0FBQSxVQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLGVBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsR0FBQSxDQUFBLE1BQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsR0FBQSxxREFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxlQUFBLENBQUEsT0FBQSxDQUFBLG9CQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxlQUFBO09BQ0E7QUFDQSxZQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsR0FBQSxvREFBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxVQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLEdBQUEsQ0FBQSxNQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLGlCQUFBLEVBQUEsSUFBQTtBQUNBLGFBQUEsRUFBQSxHQUFBLENBQUEsSUFBQTtTQUNBLENBQUE7QUFDQSxlQUFBO09BQ0E7QUFDQSxZQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLElBQUE7QUFDQSxXQUFBLEVBQUEsb0RBQUE7T0FDQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0NBQ0EsQ0FDQSxDQUFBLENBQUE7QUN6RkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxjQUFBO0FBQ0EsZUFBQSxFQUFBLHVDQUFBO0FBQ0EsY0FBQSxFQUFBLHNCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUdBLEdBQUEsQ0FBQSxVQUFBLENBQUEsc0JBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxXQUFBLEVBQUEsYUFBQSxFQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsZUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxHQUFBLFFBQUEsQ0FBQTtLQUNBLENBQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxHQUFBLENBQUEsNkJBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxXQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGVBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxnQ0FBQSxDQUFBLENBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsUUFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLFlBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxTQUFBLElBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBO0FBQ0EsVUFBQSxHQUFBLEdBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLGVBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxvQkFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtPQUNBO0tBQ0E7QUFDQSxjQUFBLENBQUEsWUFBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLENBQUEsWUFBQSxDQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLHFCQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO09BQ0EsRUFBQSxFQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLElBQUEsRUFBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQTtBQUNBLFFBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxVQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsS0FBQSxJQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0EsU0FBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO0tBQ0EsTUFBQTtBQUNBLFNBQUEsQ0FBQSxVQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsUUFBQSxLQUFBLENBQUEsVUFBQSxDQUFBLE1BQUEsSUFBQSxDQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0tBQ0EsTUFBQTtBQUNBLFdBQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLEdBQUEsQ0FBQSx1QkFBQSxFQUFBLEtBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxlQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxlQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEscUJBQUEsQ0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsVUFBQSxDQUFBLDBCQUFBLEdBQUEsVUFBQSxDQUFBLEdBQUEsR0FBQSxHQUFBLEdBQUEsVUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFVBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxlQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGVBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsdUJBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsT0FBQSxHQUFBLFVBQUEsVUFBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLFVBQUEsQ0FBQSwyQkFBQSxHQUFBLFVBQUEsQ0FBQSxHQUFBLEdBQUEsR0FBQSxHQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxVQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsZUFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxlQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLHdCQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FDbkhBLEdBQUEsQ0FBQSxPQUFBLENBQUEsZ0JBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxXQUFBLFdBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsRUFBQSxNQUFBO0FBQ0EsU0FBQSxFQUFBLGNBQUE7QUFDQSxhQUFBLEVBQUEsRUFBQSxjQUFBLEVBQUEsU0FBQSxFQUFBO0FBQ0Esc0JBQUEsRUFBQSxPQUFBLENBQUEsUUFBQTtBQUNBLFVBQUEsRUFBQSxJQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsU0FBQTtBQUNBLGVBQUEsRUFBQSxXQUFBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQSxDQUFBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG53aW5kb3cuYXBwID0gYW5ndWxhci5tb2R1bGUoJ0Z1bGxzdGFja0dlbmVyYXRlZEFwcCcsIFsnZnNhUHJlQnVpbHQnLCAndWkucm91dGVyJywgJ3VpLmJvb3RzdHJhcCcsICduZ0FuaW1hdGUnLCAnbmdDb29raWVzJywgJ3lhcnUyMi5hbmd1bGFyLXRpbWVhZ28nXSk7XG5cbmFwcC5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIsICR1aVZpZXdTY3JvbGxQcm92aWRlcikge1xuICAgIC8vIFRoaXMgdHVybnMgb2ZmIGhhc2hiYW5nIHVybHMgKC8jYWJvdXQpIGFuZCBjaGFuZ2VzIGl0IHRvIHNvbWV0aGluZyBub3JtYWwgKC9hYm91dClcbiAgICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XG4gICAgLy8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xuICAgIC8vICR1aVZpZXdTY3JvbGxQcm92aWRlci51c2VBbmNob3JTY3JvbGwoKTtcbn0pO1xuXG4vLyBUaGlzIGFwcC5ydW4gaXMgZm9yIGNvbnRyb2xsaW5nIGFjY2VzcyB0byBzcGVjaWZpYyBzdGF0ZXMuXG5hcHAucnVuKGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgJHN0YXRlLCAkdWlWaWV3U2Nyb2xsLCBTZXNzaW9uU2VydmljZSwgQXBwQ29uZmlnKSB7XG4gICAgLy8gVGhlIGdpdmVuIHN0YXRlIHJlcXVpcmVzIGFuIGF1dGhlbnRpY2F0ZWQgdXNlci5cbiAgICAvLyB2YXIgZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCA9IGZ1bmN0aW9uIChzdGF0ZSkge1xuICAgIC8vICAgICByZXR1cm4gc3RhdGUuZGF0YSAmJiBzdGF0ZS5kYXRhLmF1dGhlbnRpY2F0ZTtcbiAgICAvLyB9O1xuXG4gICAgQXBwQ29uZmlnLmZldGNoQ29uZmlnKCkudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2cocmVzKTtcbiAgICAgICAgQXBwQ29uZmlnLnNldENvbmZpZyhyZXMuZGF0YSk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKEFwcENvbmZpZy5pc0NvbmZpZ1BhcmFtc3ZhaWxhYmxlKTtcbiAgICB9KVxuXG4gICAgLy8gJHN0YXRlQ2hhbmdlU3RhcnQgaXMgYW4gZXZlbnQgZmlyZWRcbiAgICAvLyB3aGVuZXZlciB0aGUgcHJvY2VzcyBvZiBjaGFuZ2luZyBhIHN0YXRlIGJlZ2lucy5cbiAgICAkcm9vdFNjb3BlLiRvbignJHN0YXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbiAoZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zKSB7XG4gICAgICAgIC8vIGlmKHRvU3RhdGUgPSAnYXJ0aXN0VG9vbHMnKSB7XG4gICAgICAgIC8vICAgICB2YXIgdXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcbiAgICAgICAgLy8gICAgIGNvbnNvbGUubG9nKHVzZXIpO1xuICAgICAgICAvLyB9XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdyZWFjaGVkIGhlcmUnKTtcbiAgICAgICAgLy8gaWYgKCFkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBdXRoKHRvU3RhdGUpKSB7XG4gICAgICAgIC8vICAgICAvLyBUaGUgZGVzdGluYXRpb24gc3RhdGUgZG9lcyBub3QgcmVxdWlyZSBhdXRoZW50aWNhdGlvblxuICAgICAgICAvLyAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbiAgICAgICAgLy8gICAgIHJldHVybjtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIC8vIGlmIChBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSkge1xuICAgICAgICAvLyAgICAgLy8gVGhlIHVzZXIgaXMgYXV0aGVudGljYXRlZC5cbiAgICAgICAgLy8gICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4gICAgICAgIC8vICAgICByZXR1cm47XG4gICAgICAgIC8vIH1cblxuICAgICAgICAvLyAvLyBDYW5jZWwgbmF2aWdhdGluZyB0byBuZXcgc3RhdGUuXG4gICAgICAgIC8vIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgLy8gQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAvLyAgICAgLy8gSWYgYSB1c2VyIGlzIHJldHJpZXZlZCwgdGhlbiByZW5hdmlnYXRlIHRvIHRoZSBkZXN0aW5hdGlvblxuICAgICAgICAvLyAgICAgLy8gKHRoZSBzZWNvbmQgdGltZSwgQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkgd2lsbCB3b3JrKVxuICAgICAgICAvLyAgICAgLy8gb3RoZXJ3aXNlLCBpZiBubyB1c2VyIGlzIGxvZ2dlZCBpbiwgZ28gdG8gXCJsb2dpblwiIHN0YXRlLlxuICAgICAgICAvLyAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgLy8gICAgICAgICAkc3RhdGUuZ28odG9TdGF0ZS5uYW1lLCB0b1BhcmFtcyk7XG4gICAgICAgIC8vICAgICB9IGVsc2Uge1xuICAgICAgICAvLyAgICAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gfSk7XG5cbiAgICB9KTtcblxufSk7XG5cblxuYXBwLmRpcmVjdGl2ZSgnZmlsZXJlYWQnLCBbZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBmaWxlcmVhZDogJz0nLFxuICAgICAgICAgICAgbWVzc2FnZTogJz0nXG4gICAgICAgIH0sXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cmlidXRlcykge1xuICAgICAgICAgICAgZWxlbWVudC5iaW5kKCdjaGFuZ2UnLCBmdW5jdGlvbiAoY2hhbmdlRXZlbnQpIHtcbiAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5tZXNzYWdlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWw6ICcnXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZihjaGFuZ2VFdmVudC50YXJnZXQuZmlsZXNbMF0udHlwZSAhPSBcImF1ZGlvL21wZWdcIiAmJiBjaGFuZ2VFdmVudC50YXJnZXQuZmlsZXNbMF0udHlwZSAhPSBcImF1ZGlvL21wM1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5tZXNzYWdlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsOiAnRXJyb3I6IFBsZWFzZSB1cGxvYWQgbXAzIGZvcm1hdCBmaWxlLidcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnZhbChudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYoY2hhbmdlRXZlbnQudGFyZ2V0LmZpbGVzWzBdLnNpemUgPiAyMCoxMDAwKjEwMDApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWw6ICdFcnJvcjogUGxlYXNlIHVwbG9hZCBmaWxlIHVwdG8gMjAgTUIgc2l6ZS4nXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC52YWwobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuZmlsZXJlYWQgPSBjaGFuZ2VFdmVudC50YXJnZXQuZmlsZXNbMF07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cbn1dKTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2RhdGFiYXNlJywge1xuICAgIHVybDogJy9hZG1pbi9kYXRhYmFzZScsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9kYXRhYmFzZS9kYXRhYmFzZS5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnRGF0YWJhc2VDb250cm9sbGVyJ1xuICB9KTtcbn0pO1xuXG5hcHAuZGlyZWN0aXZlKCdub3RpZmljYXRpb25CYXInLCBbJ3NvY2tldCcsIGZ1bmN0aW9uKHNvY2tldCkge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgIHNjb3BlOiB0cnVlLFxuICAgIHRlbXBsYXRlOiAnPGRpdiBzdHlsZT1cIm1hcmdpbjogMCBhdXRvO3dpZHRoOjUwJVwiIG5nLXNob3c9XCJiYXIudmlzaWJsZVwiPicgK1xuICAgICAgJzx1aWItcHJvZ3Jlc3M+PHVpYi1iYXIgdmFsdWU9XCJiYXIudmFsdWVcIiB0eXBlPVwie3tiYXIudHlwZX19XCI+PHNwYW4+e3tiYXIudmFsdWV9fSU8L3NwYW4+PC91aWItYmFyPjwvdWliLXByb2dyZXNzPicgK1xuICAgICAgJzwvZGl2PicsXG4gICAgbGluazogZnVuY3Rpb24oJHNjb3BlLCBpRWxtLCBpQXR0cnMsIGNvbnRyb2xsZXIpIHtcbiAgICAgIHNvY2tldC5vbignbm90aWZpY2F0aW9uJywgZnVuY3Rpb24oZGF0YSkge1xuICAgICAgICB2YXIgcGVyY2VudGFnZSA9IHBhcnNlSW50KE1hdGguZmxvb3IoZGF0YS5jb3VudGVyIC8gZGF0YS50b3RhbCAqIDEwMCksIDEwKTtcbiAgICAgICAgJHNjb3BlLmJhci52YWx1ZSA9IHBlcmNlbnRhZ2U7XG4gICAgICAgIGlmIChwZXJjZW50YWdlID09PSAxMDApIHtcbiAgICAgICAgICAkc2NvcGUuYmFyLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgICAkc2NvcGUuYmFyLnZhbHVlID0gMDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICB9O1xufV0pO1xuXG5hcHAuY29udHJvbGxlcignRGF0YWJhc2VDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCBBdXRoU2VydmljZSwgc29ja2V0KSB7XG4gICRzY29wZS5hZGRVc2VyID0ge307XG4gICRzY29wZS5xdWVyeSA9IHt9O1xuICAkc2NvcGUudHJkVXNyUXVlcnkgPSB7fTtcbiAgJHNjb3BlLnF1ZXJ5Q29scyA9IFt7XG4gICAgbmFtZTogJ3VzZXJuYW1lJyxcbiAgICB2YWx1ZTogJ3VzZXJuYW1lJ1xuICB9LCB7XG4gICAgbmFtZTogJ2dlbnJlJyxcbiAgICB2YWx1ZTogJ2dlbnJlJ1xuICB9LCB7XG4gICAgbmFtZTogJ25hbWUnLFxuICAgIHZhbHVlOiAnbmFtZSdcbiAgfSwge1xuICAgIG5hbWU6ICdVUkwnLFxuICAgIHZhbHVlOiAnc2NVUkwnXG4gIH0sIHtcbiAgICBuYW1lOiAnZW1haWwnLFxuICAgIHZhbHVlOiAnZW1haWwnXG4gIH0sIHtcbiAgICBuYW1lOiAnZGVzY3JpcHRpb24nLFxuICAgIHZhbHVlOiAnZGVzY3JpcHRpb24nXG4gIH0sIHtcbiAgICBuYW1lOiAnZm9sbG93ZXJzJyxcbiAgICB2YWx1ZTogJ2ZvbGxvd2VycydcbiAgfSwge1xuICAgIG5hbWU6ICdudW1iZXIgb2YgdHJhY2tzJyxcbiAgICB2YWx1ZTogJ251bVRyYWNrcydcbiAgfSwge1xuICAgIG5hbWU6ICdmYWNlYm9vaycsXG4gICAgdmFsdWU6ICdmYWNlYm9va1VSTCdcbiAgfSwge1xuICAgIG5hbWU6ICdpbnN0YWdyYW0nLFxuICAgIHZhbHVlOiAnaW5zdGFncmFtVVJMJ1xuICB9LCB7XG4gICAgbmFtZTogJ3R3aXR0ZXInLFxuICAgIHZhbHVlOiAndHdpdHRlclVSTCdcbiAgfSwge1xuICAgIG5hbWU6ICd5b3V0dWJlJyxcbiAgICB2YWx1ZTogJ3lvdXR1YmVVUkwnXG4gIH0sIHtcbiAgICBuYW1lOiAnd2Vic2l0ZXMnLFxuICAgIHZhbHVlOiAnd2Vic2l0ZXMnXG4gIH0sIHtcbiAgICBuYW1lOiAnYXV0byBlbWFpbCBkYXknLFxuICAgIHZhbHVlOiAnZW1haWxEYXlOdW0nXG4gIH0sIHtcbiAgICBuYW1lOiAnYWxsIGVtYWlscycsXG4gICAgdmFsdWU6ICdhbGxFbWFpbHMnXG4gIH1dO1xuICAkc2NvcGUuZG93bmxvYWRCdXR0b25WaXNpYmxlID0gZmFsc2U7XG4gICRzY29wZS50cmFjayA9IHtcbiAgICB0cmFja1VybDogJycsXG4gICAgZG93bmxvYWRVcmw6ICcnLFxuICAgIGVtYWlsOiAnJ1xuICB9O1xuICAkc2NvcGUuYmFyID0ge1xuICAgIHR5cGU6ICdzdWNjZXNzJyxcbiAgICB2YWx1ZTogMCxcbiAgICB2aXNpYmxlOiBmYWxzZVxuICB9O1xuICAkc2NvcGUucGFpZFJlcG9zdCA9IHtcbiAgICBzb3VuZENsb3VkVXJsOiAnJ1xuICB9O1xuXG4gICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAkaHR0cC5nZXQoJy9hcGkvbG9nb3V0JykudGhlbihmdW5jdGlvbigpIHtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hZG1pbic7XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgYWxlcnQoJ1dyb25nIFBhc3N3b3JkJyk7XG4gICAgfSk7XG4gIH1cblxuICAkc2NvcGUuc2F2ZUFkZFVzZXIgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJHNjb3BlLmFkZFVzZXIucGFzc3dvcmQgPSAkcm9vdFNjb3BlLnBhc3N3b3JkO1xuICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvYWRkdXNlcicsICRzY29wZS5hZGRVc2VyKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIGFsZXJ0KFwiU3VjY2VzczogRGF0YWJhc2UgaXMgYmVpbmcgcG9wdWxhdGVkLiBZb3Ugd2lsbCBiZSBlbWFpbGVkIHdoZW4gaXQgaXMgY29tcGxldGUuXCIpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAkc2NvcGUuYmFyLnZpc2libGUgPSB0cnVlO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgYWxlcnQoJ0JhZCBzdWJtaXNzaW9uJyk7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5jcmVhdGVVc2VyUXVlcnlEb2MgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcXVlcnkgPSB7fTtcbiAgICBpZiAoJHNjb3BlLnF1ZXJ5LmFydGlzdCA9PSBcImFydGlzdHNcIikge1xuICAgICAgcXVlcnkuYXJ0aXN0ID0gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKCRzY29wZS5xdWVyeS5hcnRpc3QgPT0gXCJub24tYXJ0aXN0c1wiKSB7XG4gICAgICBxdWVyeS5hcnRpc3QgPSBmYWxzZTtcbiAgICB9XG4gICAgdmFyIGZsd3JRcnkgPSB7fTtcbiAgICBpZiAoJHNjb3BlLnF1ZXJ5LmZvbGxvd2Vyc0dUKSB7XG4gICAgICBmbHdyUXJ5LiRndCA9ICRzY29wZS5xdWVyeS5mb2xsb3dlcnNHVDtcbiAgICAgIHF1ZXJ5LmZvbGxvd2VycyA9IGZsd3JRcnk7XG4gICAgfVxuICAgIGlmICgkc2NvcGUucXVlcnkuZm9sbG93ZXJzTFQpIHtcbiAgICAgIGZsd3JRcnkuJGx0ID0gJHNjb3BlLnF1ZXJ5LmZvbGxvd2Vyc0xUO1xuICAgICAgcXVlcnkuZm9sbG93ZXJzID0gZmx3clFyeTtcbiAgICB9XG4gICAgaWYgKCRzY29wZS5xdWVyeS5nZW5yZSkgcXVlcnkuZ2VucmUgPSAkc2NvcGUucXVlcnkuZ2VucmU7XG4gICAgaWYgKCRzY29wZS5xdWVyeUNvbHMpIHtcbiAgICAgIHF1ZXJ5LmNvbHVtbnMgPSAkc2NvcGUucXVlcnlDb2xzLmZpbHRlcihmdW5jdGlvbihlbG0pIHtcbiAgICAgICAgcmV0dXJuIGVsbS52YWx1ZSAhPT0gbnVsbDtcbiAgICAgIH0pLm1hcChmdW5jdGlvbihlbG0pIHtcbiAgICAgICAgcmV0dXJuIGVsbS52YWx1ZTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoJHNjb3BlLnF1ZXJ5LnRyYWNrZWRVc2Vyc1VSTCkgcXVlcnkudHJhY2tlZFVzZXJzVVJMID0gJHNjb3BlLnF1ZXJ5LnRyYWNrZWRVc2Vyc1VSTDtcbiAgICB2YXIgYm9keSA9IHtcbiAgICAgIHF1ZXJ5OiBxdWVyeSxcbiAgICAgIHBhc3N3b3JkOiAkcm9vdFNjb3BlLnBhc3N3b3JkXG4gICAgfTtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS9mb2xsb3dlcnMnLCBib2R5KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS5maWxlbmFtZSA9IHJlcy5kYXRhO1xuICAgICAgICAkc2NvcGUuZG93bmxvYWRCdXR0b25WaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgYWxlcnQoXCJFUlJPUjogQmFkIFF1ZXJ5IG9yIE5vIE1hdGNoZXNcIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5jcmVhdGVUcmRVc3JRdWVyeURvYyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBxdWVyeSA9IHt9O1xuICAgIHZhciBmbHdyUXJ5ID0ge307XG4gICAgaWYgKCRzY29wZS50cmRVc3JRdWVyeS5mb2xsb3dlcnNHVCkge1xuICAgICAgZmx3clFyeS4kZ3QgPSAkc2NvcGUudHJkVXNyUXVlcnkuZm9sbG93ZXJzR1Q7XG4gICAgICBxdWVyeS5mb2xsb3dlcnMgPSBmbHdyUXJ5O1xuICAgIH1cbiAgICBpZiAoJHNjb3BlLnRyZFVzclF1ZXJ5LmZvbGxvd2Vyc0xUKSB7XG4gICAgICBmbHdyUXJ5LiRsdCA9ICRzY29wZS50cmRVc3JRdWVyeS5mb2xsb3dlcnNMVDtcbiAgICAgIHF1ZXJ5LmZvbGxvd2VycyA9IGZsd3JRcnk7XG4gICAgfVxuICAgIGlmICgkc2NvcGUudHJkVXNyUXVlcnkuZ2VucmUpIHF1ZXJ5LmdlbnJlID0gJHNjb3BlLnRyZFVzclF1ZXJ5LmdlbnJlO1xuICAgIHZhciBib2R5ID0ge1xuICAgICAgcXVlcnk6IHF1ZXJ5LFxuICAgICAgcGFzc3dvcmQ6ICRyb290U2NvcGUucGFzc3dvcmRcbiAgICB9O1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL3RyYWNrZWRVc2VycycsIGJvZHkpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHNjb3BlLnRyZFVzckZpbGVuYW1lID0gcmVzLmRhdGE7XG4gICAgICAgICRzY29wZS5kb3dubG9hZFRyZFVzckJ1dHRvblZpc2libGUgPSB0cnVlO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBhbGVydChcIkVSUk9SOiBCYWQgUXVlcnkgb3IgTm8gTWF0Y2hlc1wiKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmRvd25sb2FkID0gZnVuY3Rpb24oZmlsZW5hbWUpIHtcbiAgICB2YXIgYW5jaG9yID0gYW5ndWxhci5lbGVtZW50KCc8YS8+Jyk7XG4gICAgYW5jaG9yLmF0dHIoe1xuICAgICAgaHJlZjogZmlsZW5hbWUsXG4gICAgICBkb3dubG9hZDogZmlsZW5hbWVcbiAgICB9KVswXS5jbGljaygpO1xuICAgICRzY29wZS5kb3dubG9hZEJ1dHRvblZpc2libGUgPSBmYWxzZTtcbiAgICAkc2NvcGUuZG93bmxvYWRUcmRVc3JCdXR0b25WaXNpYmxlID0gZmFsc2U7XG4gIH1cblxuICAkc2NvcGUuc2F2ZVBhaWRSZXBvc3RDaGFubmVsID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvcGFpZHJlcG9zdCcsICRzY29wZS5wYWlkUmVwb3N0KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS5wYWlkUmVwb3N0ID0ge1xuICAgICAgICAgIHNvdW5kQ2xvdWRVcmw6ICcnXG4gICAgICAgIH07XG4gICAgICAgIGFsZXJ0KFwiU1VDQ0VTUzogVXJsIHNhdmVkIHN1Y2Nlc3NmdWxseVwiKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgYWxlcnQoXCJFUlJPUjogRXJyb3IgaW4gc2F2aW5nIHVybFwiKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9XG5cbiAgLyogTGlzdGVuIHRvIHNvY2tldCBldmVudHMgKi9cbiAgc29ja2V0Lm9uKCdub3RpZmljYXRpb24nLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgdmFyIHBlcmNlbnRhZ2UgPSBwYXJzZUludChNYXRoLmZsb29yKGRhdGEuY291bnRlciAvIGRhdGEudG90YWwgKiAxMDApLCAxMCk7XG4gICAgJHNjb3BlLmJhci52YWx1ZSA9IHBlcmNlbnRhZ2U7XG4gICAgaWYgKHBlcmNlbnRhZ2UgPT09IDEwMCkge1xuICAgICAgJHNjb3BlLnN0YXR1c0JhclZpc2libGUgPSBmYWxzZTtcbiAgICAgICRzY29wZS5iYXIudmFsdWUgPSAwO1xuICAgIH1cbiAgfSk7XG59KTsiLCIoZnVuY3Rpb24oKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG4gICAgLy8gSG9wZSB5b3UgZGlkbid0IGZvcmdldCBBbmd1bGFyISBEdWgtZG95LlxuICAgIGlmICghd2luZG93LmFuZ3VsYXIpIHRocm93IG5ldyBFcnJvcignSSBjYW5cXCd0IGZpbmQgQW5ndWxhciEnKTtcblxuICAgIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnZnNhUHJlQnVpbHQnLCBbXSk7XG5cbiAgICBhcHAuZmFjdG9yeSgnaW5pdFNvY2tldCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXdpbmRvdy5pbykgdGhyb3cgbmV3IEVycm9yKCdzb2NrZXQuaW8gbm90IGZvdW5kIScpO1xuICAgICAgICByZXR1cm4gd2luZG93LmlvKHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pO1xuICAgIH0pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ3NvY2tldCcsIGZ1bmN0aW9uKCRyb290U2NvcGUsIGluaXRTb2NrZXQpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG9uOiBmdW5jdGlvbihldmVudE5hbWUsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgaW5pdFNvY2tldC5vbihldmVudE5hbWUsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShpbml0U29ja2V0LCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZW1pdDogZnVuY3Rpb24oZXZlbnROYW1lLCBkYXRhLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGluaXRTb2NrZXQuZW1pdChldmVudE5hbWUsIGRhdGEsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShpbml0U29ja2V0LCBhcmdzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIGFwcC5mYWN0b3J5KCdBcHBDb25maWcnLCBmdW5jdGlvbigkaHR0cCkge1xuICAgICAgICB2YXIgX2NvbmZpZ1BhcmFtcyA9IG51bGw7XG4gICAgICAgIGZ1bmN0aW9uIGZldGNoQ29uZmlnKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9zb3VuZGNsb3VkL3NvdW5kY2xvdWRDb25maWcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHNldENvbmZpZyhkYXRhKSB7XG4gICAgICAgICAgICBfY29uZmlnUGFyYW1zID0gZGF0YTtcbiAgICAgICAgICAgIFNDLmluaXRpYWxpemUoe1xuICAgICAgICAgICAgICBjbGllbnRfaWQ6IGRhdGEuY2xpZW50SUQsXG4gICAgICAgICAgICAgIHJlZGlyZWN0X3VyaTogZGF0YS5jYWxsYmFja1VSTCxcbiAgICAgICAgICAgICAgc2NvcGU6IFwibm9uLWV4cGlyaW5nXCJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0Q29uZmlnKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9jb25maWdQYXJhbXM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmV0Y2hDb25maWc6IGZldGNoQ29uZmlnLFxuICAgICAgICAgICAgZ2V0Q29uZmlnOiBnZXRDb25maWcsXG4gICAgICAgICAgICBzZXRDb25maWc6IHNldENvbmZpZ1xuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgLy8gQVVUSF9FVkVOVFMgaXMgdXNlZCB0aHJvdWdob3V0IG91ciBhcHAgdG9cbiAgICAvLyBicm9hZGNhc3QgYW5kIGxpc3RlbiBmcm9tIGFuZCB0byB0aGUgJHJvb3RTY29wZVxuICAgIC8vIGZvciBpbXBvcnRhbnQgZXZlbnRzIGFib3V0IGF1dGhlbnRpY2F0aW9uIGZsb3cuXG4gICAgLy8gYXBwLmNvbnN0YW50KCdBVVRIX0VWRU5UUycsIHtcbiAgICAvLyAgICAgbG9naW5TdWNjZXNzOiAnYXV0aC1sb2dpbi1zdWNjZXNzJyxcbiAgICAvLyAgICAgbG9naW5GYWlsZWQ6ICdhdXRoLWxvZ2luLWZhaWxlZCcsXG4gICAgLy8gICAgIGxvZ291dFN1Y2Nlc3M6ICdhdXRoLWxvZ291dC1zdWNjZXNzJyxcbiAgICAvLyAgICAgc2Vzc2lvblRpbWVvdXQ6ICdhdXRoLXNlc3Npb24tdGltZW91dCcsXG4gICAgLy8gICAgIG5vdEF1dGhlbnRpY2F0ZWQ6ICdhdXRoLW5vdC1hdXRoZW50aWNhdGVkJyxcbiAgICAvLyAgICAgbm90QXV0aG9yaXplZDogJ2F1dGgtbm90LWF1dGhvcml6ZWQnXG4gICAgLy8gfSk7XG5cbiAgICAvLyBhcHAuZmFjdG9yeSgnQXV0aEludGVyY2VwdG9yJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHEsIEFVVEhfRVZFTlRTKSB7XG4gICAgLy8gICAgIHZhciBzdGF0dXNEaWN0ID0ge1xuICAgIC8vICAgICAgICAgNDAxOiBBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLFxuICAgIC8vICAgICAgICAgNDAzOiBBVVRIX0VWRU5UUy5ub3RBdXRob3JpemVkLFxuICAgIC8vICAgICAgICAgNDE5OiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCxcbiAgICAvLyAgICAgICAgIDQ0MDogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXRcbiAgICAvLyAgICAgfTtcbiAgICAvLyAgICAgcmV0dXJuIHtcbiAgICAvLyAgICAgICAgIHJlc3BvbnNlRXJyb3I6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgLy8gICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KHN0YXR1c0RpY3RbcmVzcG9uc2Uuc3RhdHVzXSwgcmVzcG9uc2UpO1xuICAgIC8vICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QocmVzcG9uc2UpXG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgIH07XG4gICAgLy8gfSk7XG5cbiAgICAvLyBhcHAuY29uZmlnKGZ1bmN0aW9uKCRodHRwUHJvdmlkZXIpIHtcbiAgICAvLyAgICAgJGh0dHBQcm92aWRlci5pbnRlcmNlcHRvcnMucHVzaChbXG4gICAgLy8gICAgICAgICAnJGluamVjdG9yJyxcbiAgICAvLyAgICAgICAgIGZ1bmN0aW9uKCRpbmplY3Rvcikge1xuICAgIC8vICAgICAgICAgICAgIHJldHVybiAkaW5qZWN0b3IuZ2V0KCdBdXRoSW50ZXJjZXB0b3InKTtcbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgXSk7XG4gICAgLy8gfSk7XG5cbiAgICAvLyBhcHAuc2VydmljZSgnQXV0aFNlcnZpY2UnLCBmdW5jdGlvbigkaHR0cCwgU2Vzc2lvbiwgJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMsICRxKSB7XG5cbiAgICAvLyAgICAgZnVuY3Rpb24gb25TdWNjZXNzZnVsTG9naW4ocmVzcG9uc2UpIHtcbiAgICAvLyAgICAgICAgIHZhciBkYXRhID0gcmVzcG9uc2UuZGF0YTtcbiAgICAvLyAgICAgICAgIFNlc3Npb24uY3JlYXRlKGRhdGEuaWQsIGRhdGEudXNlcik7XG4gICAgLy8gICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzKTtcbiAgICAvLyAgICAgICAgIHJldHVybiBkYXRhLnVzZXI7XG4gICAgLy8gICAgIH1cblxuICAgIC8vICAgICAvLyBVc2VzIHRoZSBzZXNzaW9uIGZhY3RvcnkgdG8gc2VlIGlmIGFuXG4gICAgLy8gICAgIC8vIGF1dGhlbnRpY2F0ZWQgdXNlciBpcyBjdXJyZW50bHkgcmVnaXN0ZXJlZC5cbiAgICAvLyAgICAgdGhpcy5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyAgICAgICAgIHJldHVybiAhIVNlc3Npb24udXNlcjtcbiAgICAvLyAgICAgfTtcblxuICAgIC8vICAgICB0aGlzLmdldExvZ2dlZEluVXNlciA9IGZ1bmN0aW9uKGZyb21TZXJ2ZXIpIHtcblxuICAgIC8vICAgICAgICAgLy8gSWYgYW4gYXV0aGVudGljYXRlZCBzZXNzaW9uIGV4aXN0cywgd2VcbiAgICAvLyAgICAgICAgIC8vIHJldHVybiB0aGUgdXNlciBhdHRhY2hlZCB0byB0aGF0IHNlc3Npb25cbiAgICAvLyAgICAgICAgIC8vIHdpdGggYSBwcm9taXNlLiBUaGlzIGVuc3VyZXMgdGhhdCB3ZSBjYW5cbiAgICAvLyAgICAgICAgIC8vIGFsd2F5cyBpbnRlcmZhY2Ugd2l0aCB0aGlzIG1ldGhvZCBhc3luY2hyb25vdXNseS5cblxuICAgIC8vICAgICAgICAgLy8gT3B0aW9uYWxseSwgaWYgdHJ1ZSBpcyBnaXZlbiBhcyB0aGUgZnJvbVNlcnZlciBwYXJhbWV0ZXIsXG4gICAgLy8gICAgICAgICAvLyB0aGVuIHRoaXMgY2FjaGVkIHZhbHVlIHdpbGwgbm90IGJlIHVzZWQuXG5cbiAgICAvLyAgICAgICAgIGlmICh0aGlzLmlzQXV0aGVudGljYXRlZCgpICYmIGZyb21TZXJ2ZXIgIT09IHRydWUpIHtcbiAgICAvLyAgICAgICAgICAgICByZXR1cm4gJHEud2hlbihTZXNzaW9uLnVzZXIpO1xuICAgIC8vICAgICAgICAgfVxuXG4gICAgLy8gICAgICAgICAvLyBNYWtlIHJlcXVlc3QgR0VUIC9zZXNzaW9uLlxuICAgIC8vICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIHVzZXIsIGNhbGwgb25TdWNjZXNzZnVsTG9naW4gd2l0aCB0aGUgcmVzcG9uc2UuXG4gICAgLy8gICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgNDAxIHJlc3BvbnNlLCB3ZSBjYXRjaCBpdCBhbmQgaW5zdGVhZCByZXNvbHZlIHRvIG51bGwuXG4gICAgLy8gICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvc2Vzc2lvbicpLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pLmNhdGNoKGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgIC8vICAgICAgICAgfSk7XG5cbiAgICAvLyAgICAgfTtcblxuICAgIC8vICAgICB0aGlzLmxvZ2luID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcbiAgICAvLyAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvbG9naW4nLCBjcmVkZW50aWFscylcbiAgICAvLyAgICAgICAgICAgICAudGhlbihvblN1Y2Nlc3NmdWxMb2dpbilcbiAgICAvLyAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgLy8gICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ0ludmFsaWQgbG9naW4gY3JlZGVudGlhbHMuJ1xuICAgIC8vICAgICAgICAgICAgICAgICB9KTtcbiAgICAvLyAgICAgICAgICAgICB9KTtcbiAgICAvLyAgICAgfTtcblxuICAgIC8vICAgICB0aGlzLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgLy8gICAgICAgICAgICAgU2Vzc2lvbi5kZXN0cm95KCk7XG4gICAgLy8gICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MpO1xuICAgIC8vICAgICAgICAgfSk7XG4gICAgLy8gICAgIH07XG4gICAgLy8gfSk7XG5cbiAgICAvLyBhcHAuc2VydmljZSgnU2Vzc2lvbicsIGZ1bmN0aW9uKCRyb290U2NvcGUsIEFVVEhfRVZFTlRTKSB7XG5cbiAgICAvLyAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsIGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICAgICAgc2VsZi5kZXN0cm95KCk7XG4gICAgLy8gICAgIH0pO1xuXG4gICAgLy8gICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCBmdW5jdGlvbigpIHtcbiAgICAvLyAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgIC8vICAgICB9KTtcblxuICAgIC8vICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAvLyAgICAgdGhpcy51c2VyID0gbnVsbDtcblxuICAgIC8vICAgICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uKHNlc3Npb25JZCwgdXNlcikge1xuICAgIC8vICAgICAgICAgdGhpcy5pZCA9IHNlc3Npb25JZDtcbiAgICAvLyAgICAgICAgIHRoaXMudXNlciA9IHVzZXI7XG4gICAgLy8gICAgIH07XG5cbiAgICAvLyAgICAgdGhpcy5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gICAgICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAvLyAgICAgICAgIHRoaXMudXNlciA9IG51bGw7XG4gICAgLy8gICAgIH07XG5cbiAgICAvLyB9KTtcblxufSkoKTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhZG1pbicsIHtcbiAgICB1cmw6ICcvYWRtaW4nLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvbG9naW4vbG9naW4uaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0FkbWluTG9naW5Db250cm9sbGVyJ1xuICB9KTtcbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdBZG1pbkxvZ2luQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgQXV0aFNlcnZpY2UsIG9FbWJlZEZhY3RvcnkpIHtcbiAgJHNjb3BlLmNvdW50ZXIgPSAwO1xuICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzID0gW107XG4gICRzY29wZS5zdWJtaXNzaW9ucyA9IFtdO1xuXG4gICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2xvZ2luJywge1xuICAgICAgcGFzc3dvcmQ6ICRzY29wZS5wYXNzd29yZFxuICAgIH0pLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAkcm9vdFNjb3BlLnBhc3N3b3JkID0gJHNjb3BlLnBhc3N3b3JkO1xuICAgICAgJHNjb3BlLnNob3dTdWJtaXNzaW9ucyA9IHRydWU7XG4gICAgICAkc2NvcGUubG9hZFN1Ym1pc3Npb25zKCk7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIGFsZXJ0KCdXcm9uZyBQYXNzd29yZCcpO1xuICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICRodHRwLmdldCgnL2FwaS9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2FkbWluJztcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICBhbGVydCgnV3JvbmcgUGFzc3dvcmQnKTtcbiAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5tYW5hZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgXG4gICAgU0MuY29ubmVjdCgpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHJvb3RTY29wZS5hY2Nlc3NUb2tlbiA9IHJlcy5vYXV0aF90b2tlbjtcbiAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvbG9naW4vYXV0aGVudGljYXRlZCcsIHtcbiAgICAgICAgICB0b2tlbjogcmVzLm9hdXRoX3Rva2VuLFxuICAgICAgICAgIHBhc3N3b3JkOiAkcm9vdFNjb3BlLnBhc3N3b3JkLFxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAkcm9vdFNjb3BlLnNjaGVkdWxlckluZm8gPSByZXMuZGF0YTtcbiAgICAgICAgJHJvb3RTY29wZS5zY2hlZHVsZXJJbmZvLmV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2KSB7XG4gICAgICAgICAgZXYuZGF5ID0gbmV3IERhdGUoZXYuZGF5KTtcbiAgICAgICAgfSk7XG4gICAgICAgICRzdGF0ZS5nbygnc2NoZWR1bGVyJyk7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGFsZXJ0KCdFcnJvcjogQ291bGQgbm90IGxvZyBpbicpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gIH1cbn0pOyIsImFwcC5mYWN0b3J5KCdvRW1iZWRGYWN0b3J5JywgZnVuY3Rpb24oKXtcblx0cmV0dXJuIHtcblx0XHRlbWJlZFNvbmc6IGZ1bmN0aW9uKHN1Yikge1xuXHQgICAgICAgIHJldHVybiBTQy5vRW1iZWQoXCJodHRwOi8vYXBpLnNvdW5kY2xvdWQuY29tL3RyYWNrcy9cIiArIHN1Yi50cmFja0lELCB7XG5cdCAgICAgICAgICBlbGVtZW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzdWIudHJhY2tJRCArIFwicGxheWVyXCIpLFxuXHQgICAgICAgICAgYXV0b19wbGF5OiBmYWxzZSxcblx0ICAgICAgICAgIG1heGhlaWdodDogMTUwXG5cdCAgICAgICAgfSk7XG5cdFx0fVxuXHR9O1xufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncGF5Jywge1xuICAgIHVybDogJy9wYXkvOnN1Ym1pc3Npb25JRCcsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9wYXkvcGF5Lmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdQYXlDb250cm9sbGVyJyxcbiAgICByZXNvbHZlOiB7XG4gICAgICBjaGFubmVsczogZnVuY3Rpb24oJGh0dHApIHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9jaGFubmVscycpXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICBzdWJtaXNzaW9uOiBmdW5jdGlvbigkaHR0cCwgJHN0YXRlUGFyYW1zKSB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvc3VibWlzc2lvbnMvd2l0aElELycgKyAkc3RhdGVQYXJhbXMuc3VibWlzc2lvbklEKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgIH0pXG4gICAgICB9LFxuICAgICAgdHJhY2s6IGZ1bmN0aW9uKHN1Ym1pc3Npb24pIHtcbiAgICAgICAgcmV0dXJuIFNDLmdldCgnL3RyYWNrcy8nICsgc3VibWlzc2lvbi50cmFja0lEKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHRyYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJhY2s7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignUGF5Q29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHJvb3RTY29wZSwgJGh0dHAsIGNoYW5uZWxzLCBzdWJtaXNzaW9uLCB0cmFjaywgJHN0YXRlLCAkdWliTW9kYWwpIHtcbiAgJHJvb3RTY29wZS5zdWJtaXNzaW9uID0gc3VibWlzc2lvbjtcbiAgJHNjb3BlLmF1RExMaW5rID0gZmFsc2U7XG4gIGlmIChzdWJtaXNzaW9uLnBhaWQpICRzdGF0ZS5nbygnaG9tZScpO1xuICAkc2NvcGUudHJhY2sgPSB0cmFjaztcbiAgU0Mub0VtYmVkKHRyYWNrLnVyaSwge1xuICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLFxuICAgIGF1dG9fcGxheTogZmFsc2UsXG4gICAgbWF4aGVpZ2h0OiAxNTBcbiAgfSk7XG4gICRzY29wZS50b3RhbCA9IDA7XG4gICRzY29wZS5jaGFubmVscyA9IGNoYW5uZWxzLmZpbHRlcihmdW5jdGlvbihjaCkge1xuICAgIHJldHVybiAoc3VibWlzc2lvbi5jaGFubmVsSURTLmluZGV4T2YoY2guY2hhbm5lbElEKSAhPSAtMSlcbiAgfSk7XG5cbiAgJHNjb3BlLmF1RExMaW5rID0gJHNjb3BlLnRyYWNrLnB1cmNoYXNlX3VybCA/ICgkc2NvcGUudHJhY2sucHVyY2hhc2VfdXJsLmluZGV4T2YoXCJhcnRpc3RzdW5saW1pdGVkLmNvXCIpICE9IC0xKSA6IGZhbHNlO1xuXG4gICRzY29wZS5zZWxlY3RlZENoYW5uZWxzID0ge307XG4gICRzY29wZS5jaGFubmVscy5mb3JFYWNoKGZ1bmN0aW9uKGNoKSB7XG4gICAgJHNjb3BlLnNlbGVjdGVkQ2hhbm5lbHNbY2guZGlzcGxheU5hbWVdID0gZmFsc2U7XG4gIH0pO1xuXG4gICRzY29wZS5nb1RvTG9naW4gPSBmdW5jdGlvbigpIHtcbiAgICAkc3RhdGUuZ28oJ2xvZ2luJywge1xuICAgICAgJ3N1Ym1pc3Npb24nOiAkcm9vdFNjb3BlLnN1Ym1pc3Npb25cbiAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5yZWNhbGN1bGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS50b3RhbCA9IDA7XG4gICAgJHNjb3BlLnRvdGFsUGF5bWVudCA9IDA7XG4gICAgZm9yICh2YXIga2V5IGluICRzY29wZS5zZWxlY3RlZENoYW5uZWxzKSB7XG4gICAgICBpZiAoJHNjb3BlLnNlbGVjdGVkQ2hhbm5lbHNba2V5XSkge1xuICAgICAgICB2YXIgY2hhbiA9ICRzY29wZS5jaGFubmVscy5maW5kKGZ1bmN0aW9uKGNoKSB7XG4gICAgICAgICAgcmV0dXJuIGNoLmRpc3BsYXlOYW1lID09IGtleTtcbiAgICAgICAgfSlcbiAgICAgICAgJHNjb3BlLnRvdGFsICs9IGNoYW4ucHJpY2U7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICgkc2NvcGUuYXVETExpbmspICRzY29wZS50b3RhbCA9IE1hdGguZmxvb3IoMC45ICogJHNjb3BlLnRvdGFsKTtcbiAgfVxuXG4gICRzY29wZS5tYWtlUGF5bWVudCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc2NvcGUudG90YWwgIT0gMCkge1xuICAgICAgaWYgKCRzY29wZS5hdURMTGluaykge1xuICAgICAgICAkc2NvcGUuZGlzY291bnRNb2RhbEluc3RhbmNlID0gJHVpYk1vZGFsLm9wZW4oe1xuICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2Rpc2NvdW50TW9kYWwuaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ2Rpc2NvdW50TW9kYWxDb250cm9sbGVyJyxcbiAgICAgICAgICBzY29wZTogJHNjb3BlXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJHNjb3BlLmNvbnRpbnVlUGF5KGZhbHNlKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLmNvbnRpbnVlUGF5ID0gZnVuY3Rpb24oZGlzY291bnRlZCkge1xuICAgIGlmICgkc2NvcGUuZGlzY291bnRlZE1vZGFsKSB7XG4gICAgICAkc2NvcGUuZGlzY291bnRNb2RhbEluc3RhbmNlLmNsb3NlKCk7XG4gICAgfVxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICB2YXIgcHJpY2luZ09iaiA9IHtcbiAgICAgIGNoYW5uZWxzOiBbXSxcbiAgICAgIGRpc2NvdW50ZWQ6IGRpc2NvdW50ZWQsXG4gICAgICBzdWJtaXNzaW9uOiAkcm9vdFNjb3BlLnN1Ym1pc3Npb25cbiAgICB9O1xuICAgIGZvciAodmFyIGtleSBpbiAkc2NvcGUuc2VsZWN0ZWRDaGFubmVscykge1xuICAgICAgaWYgKCRzY29wZS5zZWxlY3RlZENoYW5uZWxzW2tleV0pIHtcbiAgICAgICAgdmFyIGNoYW4gPSAkc2NvcGUuY2hhbm5lbHMuZmluZChmdW5jdGlvbihjaCkge1xuICAgICAgICAgIHJldHVybiBjaC5kaXNwbGF5TmFtZSA9PSBrZXk7XG4gICAgICAgIH0pXG4gICAgICAgIHByaWNpbmdPYmouY2hhbm5lbHMucHVzaChjaGFuLmNoYW5uZWxJRCk7XG4gICAgICB9XG4gICAgfVxuICAgICRodHRwLnBvc3QoJy9hcGkvc3VibWlzc2lvbnMvZ2V0UGF5bWVudCcsIHByaWNpbmdPYmopXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uID0gcmVzLmRhdGE7XG4gICAgICB9KVxuICB9XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ2Rpc2NvdW50TW9kYWxDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlKSB7XG5cbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnY29tcGxldGUnLCB7XG4gICAgdXJsOiAnL2NvbXBsZXRlJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL3BheS90aGFua3lvdS5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnVGhhbmt5b3VDb250cm9sbGVyJ1xuICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignVGhhbmt5b3VDb250cm9sbGVyJywgZnVuY3Rpb24oJGh0dHAsICRzY29wZSwgJGxvY2F0aW9uKSB7XG4gICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgJGh0dHAucHV0KCcvYXBpL3N1Ym1pc3Npb25zL2NvbXBsZXRlZFBheW1lbnQnLCAkbG9jYXRpb24uc2VhcmNoKCkpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgJHNjb3BlLnN1Ym1pc3Npb24gPSByZXMuZGF0YS5zdWJtaXNzaW9uO1xuICAgICAgJHNjb3BlLmV2ZW50cyA9IHJlcy5kYXRhLmV2ZW50cztcbiAgICAgICRzY29wZS5ldmVudHMuZm9yRWFjaChmdW5jdGlvbihldikge1xuICAgICAgICBldi5kYXRlID0gbmV3IERhdGUoZXYuZGF0ZSk7XG4gICAgICB9KVxuICAgIH0pXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdzY2hlZHVsZXInLCB7XG4gICAgdXJsOiAnL3NjaGVkdWxlcicsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9zY2hlZHVsZXIvc2NoZWR1bGVyLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdTY2hlZHVsZXJDb250cm9sbGVyJ1xuICB9KTtcbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdTY2hlZHVsZXJDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCBBdXRoU2VydmljZSkge1xuXG4gICRzY29wZS5tYWtlRXZlbnRVUkwgPSBcIlwiO1xuICAkc2NvcGUuc2hvd092ZXJsYXkgPSBmYWxzZTtcbiAgdmFyIGluZm8gPSAkcm9vdFNjb3BlLnNjaGVkdWxlckluZm87XG4gIGlmICghaW5mbykge1xuICAgICRzdGF0ZS5nbygnYWRtaW4nKTtcbiAgfVxuICAkc2NvcGUuY2hhbm5lbCA9IGluZm8uY2hhbm5lbDtcbiAgJHNjb3BlLnN1Ym1pc3Npb25zID0gaW5mby5zdWJtaXNzaW9ucztcblxuICAkc2NvcGUuY2FsZW5kYXIgPSBmaWxsRGF0ZUFycmF5cyhpbmZvLmV2ZW50cyk7XG4gICRzY29wZS5kYXlJbmNyID0gMDtcblxuICAkc2NvcGUuYmFjayA9IGZ1bmN0aW9uKCkge1xuICAgIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcblxuICB9XG5cbiAgJHNjb3BlLnNhdmVDaGFubmVsID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRzY29wZS5jaGFubmVsLnBhc3N3b3JkID0gJHJvb3RTY29wZS5wYXNzd29yZDtcbiAgICAkaHR0cC5wdXQoXCIvYXBpL2NoYW5uZWxzXCIsICRzY29wZS5jaGFubmVsKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIHdpbmRvdy5hbGVydChcIlNhdmVkXCIpO1xuICAgICAgICAkc2NvcGUuY2hhbm5lbCA9IHJlcy5kYXRhO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICB3aW5kb3cuYWxlcnQoXCJFcnJvcjogZGlkIG5vdCBzYXZlXCIpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUuaW5jckRheSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc2NvcGUuZGF5SW5jciA8IDE0KSAkc2NvcGUuZGF5SW5jcisrO1xuICB9XG5cbiAgJHNjb3BlLmRlY3JEYXkgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLmRheUluY3IgPiAwKSAkc2NvcGUuZGF5SW5jci0tO1xuICB9XG5cbiAgJHNjb3BlLmNsaWNrZWRTbG90ID0gZnVuY3Rpb24oZGF5LCBob3VyKSB7XG4gICAgdmFyIHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgICBpZiAodG9kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpICYmIHRvZGF5LmdldEhvdXJzKCkgPiBob3VyKSByZXR1cm47XG4gICAgJHNjb3BlLnNob3dPdmVybGF5ID0gdHJ1ZTtcbiAgICB2YXIgY2FsRGF5ID0ge307XG4gICAgdmFyIGNhbGVuZGFyRGF5ID0gJHNjb3BlLmNhbGVuZGFyLmZpbmQoZnVuY3Rpb24oY2FsRCkge1xuICAgICAgcmV0dXJuIGNhbEQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09IGRheS50b0xvY2FsZURhdGVTdHJpbmcoKTtcbiAgICB9KTtcbiAgICAkc2NvcGUubWFrZUV2ZW50VVJMID0gdW5kZWZpbmVkO1xuICAgICRzY29wZS5tYWtlRXZlbnQgPSBjYWxlbmRhckRheS5ldmVudHNbaG91cl07XG4gICAgaWYgKCRzY29wZS5tYWtlRXZlbnQgPT0gXCItXCIpIHtcbiAgICAgIHZhciBtYWtlRGF5ID0gbmV3IERhdGUoZGF5KTtcbiAgICAgIG1ha2VEYXkuc2V0SG91cnMoaG91cik7XG4gICAgICAkc2NvcGUubWFrZUV2ZW50ID0ge1xuICAgICAgICBjaGFubmVsSUQ6ICRzY29wZS5jaGFubmVsLmNoYW5uZWxJRCxcbiAgICAgICAgZGF5OiBtYWtlRGF5LFxuICAgICAgICBwYWlkOiBmYWxzZVxuICAgICAgfTtcbiAgICAgICRzY29wZS5uZXdFdmVudCA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICRzY29wZS5tYWtlRXZlbnRVUkwgPSAnaHR0cHM6Ly9hcGkuc291bmRjbG91ZC5jb20vdHJhY2tzLycgKyAkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQ7XG4gICAgICBTQy5vRW1iZWQoJ2h0dHBzOi8vYXBpLnNvdW5kY2xvdWQuY29tL3RyYWNrcy8nICsgJHNjb3BlLm1ha2VFdmVudC50cmFja0lELCB7XG4gICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLFxuICAgICAgICBhdXRvX3BsYXk6IGZhbHNlLFxuICAgICAgICBtYXhoZWlnaHQ6IDE1MFxuICAgICAgfSk7XG4gICAgICAkc2NvcGUubmV3RXZlbnQgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAkc2NvcGUuY2hhbmdlUGFpZCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCA9IHVuZGVmaW5lZDtcbiAgICAkc2NvcGUubWFrZUV2ZW50VVJMID0gdW5kZWZpbmVkO1xuICB9XG5cbiAgJHNjb3BlLmNoYW5nZVVSTCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIHtcbiAgICAgICAgdXJsOiAkc2NvcGUubWFrZUV2ZW50VVJMXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCA9IHJlcy5kYXRhLmlkO1xuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnRpdGxlID0gcmVzLmRhdGEudGl0bGU7XG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQudHJhY2tVUkwgPSByZXMuZGF0YS50cmFja1VSTDtcbiAgICAgICAgU0Mub0VtYmVkKCRzY29wZS5tYWtlRXZlbnRVUkwsIHtcbiAgICAgICAgICBlbGVtZW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKSxcbiAgICAgICAgICBhdXRvX3BsYXk6IGZhbHNlLFxuICAgICAgICAgIG1heGhlaWdodDogMTUwXG4gICAgICAgIH0pXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcbiAgICAgICAgJHNjb3BlLm5vdEZvdW5kID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KS50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgICAgJHNjb3BlLm5vdEZvdW5kID0gdHJ1ZTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmRlbGV0ZUV2ZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCEkc2NvcGUubmV3RXZlbnQpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICRodHRwLmRlbGV0ZSgnL2FwaS9ldmVudHMvJyArICRzY29wZS5tYWtlRXZlbnQuX2lkICsgJy8nICsgJHJvb3RTY29wZS5wYXNzd29yZClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdmFyIGNhbGVuZGFyRGF5ID0gJHNjb3BlLmNhbGVuZGFyLmZpbmQoZnVuY3Rpb24oY2FsRCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbEQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09ICRzY29wZS5tYWtlRXZlbnQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNhbGVuZGFyRGF5LmV2ZW50c1skc2NvcGUubWFrZUV2ZW50LmRheS5nZXRIb3VycygpXSA9IFwiLVwiO1xuICAgICAgICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgd2luZG93LmFsZXJ0KFwiRGVsZXRlZFwiKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJFUlJPUjogZGlkIG5vdCBEZWxldGUuXCIpXG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgY2FsZW5kYXJEYXkgPSAkc2NvcGUuY2FsZW5kYXIuZmluZChmdW5jdGlvbihjYWxEKSB7XG4gICAgICAgIHJldHVybiBjYWxELmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSAkc2NvcGUubWFrZUV2ZW50LmRheS50b0xvY2FsZURhdGVTdHJpbmcoKTtcbiAgICAgIH0pO1xuICAgICAgY2FsZW5kYXJEYXkuZXZlbnRzWyRzY29wZS5tYWtlRXZlbnQuZ2V0SG91cnMoKV0gPSBcIi1cIjtcbiAgICAgIHZhciBldmVudHNcbiAgICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gICRzY29wZS5zYXZlRXZlbnQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoISRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCAmJiAhJHNjb3BlLm1ha2VFdmVudC5wYWlkKSB7XG4gICAgICB3aW5kb3cuYWxlcnQoXCJFbnRlciBhIHRyYWNrIFVSTFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCRzY29wZS5uZXdFdmVudCkge1xuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnBhc3N3b3JkID0gJHJvb3RTY29wZS5wYXNzd29yZDtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgICAkaHR0cC5wb3N0KCcvYXBpL2V2ZW50cycsICRzY29wZS5tYWtlRXZlbnQpXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB2YXIgZXZlbnQgPSByZXMuZGF0YTtcbiAgICAgICAgICAgIGV2ZW50LmRheSA9IG5ldyBEYXRlKGV2ZW50LmRheSk7XG4gICAgICAgICAgICB2YXIgY2FsZW5kYXJEYXkgPSAkc2NvcGUuY2FsZW5kYXIuZmluZChmdW5jdGlvbihjYWxEKSB7XG4gICAgICAgICAgICAgIHJldHVybiBjYWxELmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSBldmVudC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNhbGVuZGFyRGF5LmV2ZW50c1tldmVudC5kYXkuZ2V0SG91cnMoKV0gPSBldmVudDtcbiAgICAgICAgICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHdpbmRvdy5hbGVydChcIlNhdmVkXCIpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgd2luZG93LmFsZXJ0KFwiRVJST1I6IGRpZCBub3QgU2F2ZS5cIik7XG4gICAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkc2NvcGUubmV3RXZlbnQucGFzc3dvcmQgPSAkcm9vdFNjb3BlLnBhc3N3b3JkO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAgICRodHRwLnB1dCgnL2FwaS9ldmVudHMnLCAkc2NvcGUubWFrZUV2ZW50KVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdmFyIGV2ZW50ID0gcmVzLmRhdGE7XG4gICAgICAgICAgICBldmVudC5kYXkgPSBuZXcgRGF0ZShldmVudC5kYXkpO1xuICAgICAgICAgICAgdmFyIGNhbGVuZGFyRGF5ID0gJHNjb3BlLmNhbGVuZGFyLmZpbmQoZnVuY3Rpb24oY2FsRCkge1xuICAgICAgICAgICAgICByZXR1cm4gY2FsRC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gZXZlbnQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjYWxlbmRhckRheS5ldmVudHNbZXZlbnQuZ2V0SG91cnMoKV0gPSBldmVudDtcbiAgICAgICAgICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHdpbmRvdy5hbGVydChcIlNhdmVkXCIpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgd2luZG93LmFsZXJ0KFwiRVJST1I6IGRpZCBub3QgU2F2ZS5cIik7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLmJhY2tFdmVudCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5tYWtlRXZlbnQgPSBudWxsO1xuICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICB9XG5cbiAgJHNjb3BlLnJlbW92ZVF1ZXVlU29uZyA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgJHNjb3BlLmNoYW5uZWwucXVldWUuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAkc2NvcGUuc2F2ZUNoYW5uZWwoKTtcbiAgfVxuXG4gICRzY29wZS5hZGRTb25nID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCRzY29wZS5jaGFubmVsLnF1ZXVlLmluZGV4T2YoJHNjb3BlLm5ld1F1ZXVlSUQpICE9IC0xKSByZXR1cm47XG4gICAgJHNjb3BlLmNoYW5uZWwucXVldWUucHVzaCgkc2NvcGUubmV3UXVldWVJRCk7XG4gICAgJHNjb3BlLnNhdmVDaGFubmVsKCk7XG4gICAgJHNjb3BlLm5ld1F1ZXVlU29uZyA9IHVuZGVmaW5lZDtcbiAgICAkc2NvcGUuY2hhbmdlUXVldWVTb25nKCk7XG4gICAgJHNjb3BlLmxvYWRRdWV1ZVNvbmdzKFskc2NvcGUubmV3UXVldWVJRF0pO1xuICB9XG5cbiAgJHNjb3BlLmNoYW5nZVF1ZXVlU29uZyA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5nZXQoJ2FwaS9zb3VuZGNsb3VkL3NvdW5kY2xvdWRDb25maWcnKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIFNDLmluaXRpYWxpemUoe1xuICAgICAgICAgIGNsaWVudF9pZDogcmVzLmRhdGEuY2xpZW50SUQsXG4gICAgICAgICAgcmVkaXJlY3RfdXJpOiByZXMuZGF0YS5jYWxsYmFja1VSTCxcbiAgICAgICAgICBzY29wZTogXCJub24tZXhwaXJpbmdcIlxuICAgICAgICB9KTtcbiAgICAgICAgJHNjb3BlLmNsaWVudElEU3RyaW5nID0gcmVzLmRhdGEuY2xpZW50SUQudG9TdHJpbmcoKTtcbiAgICAgICAgdmFyIGdldFBhdGggPSAnaHR0cDovL2FwaS5zb3VuZGNsb3VkLmNvbS9yZXNvbHZlLmpzb24/dXJsPScgKyAkc2NvcGUubmV3UXVldWVTb25nICsgJyZjbGllbnRfaWQ9JyArICRzY29wZS5jbGllbnRJRFN0cmluZztcbiAgICAgICAgcmV0dXJuICRodHRwLmdldChnZXRQYXRoKVxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB2YXIgdHJhY2sgPSByZXMuZGF0YTtcbiAgICAgICAgLy8gU0Mub0VtYmVkKHRyYWNrLnVyaSwge1xuICAgICAgICAvLyAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCduZXdRdWV1ZVBsYXllcicpLFxuICAgICAgICAvLyAgIGF1dG9fcGxheTogZmFsc2UsXG4gICAgICAgIC8vICAgbWF4aGVpZ2h0OiAxNTBcbiAgICAgICAgLy8gfSk7XG4gICAgICAgICRzY29wZS5uZXdRdWV1ZUlEID0gdHJhY2suaWQ7XG4gICAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5tb3ZlVXAgPSBmdW5jdGlvbihpbmRleCkge1xuICAgIGlmIChpbmRleCA9PSAwKSByZXR1cm47XG4gICAgdmFyIHMgPSAkc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleF07XG4gICAgJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXhdID0gJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXggLSAxXTtcbiAgICAkc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleCAtIDFdID0gcztcbiAgICAkc2NvcGUuc2F2ZUNoYW5uZWwoKTtcbiAgICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MoWyRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4XSwgJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXggLSAxXV0pO1xuICB9XG5cbiAgJHNjb3BlLm1vdmVEb3duID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICBpZiAoaW5kZXggPT0gJHNjb3BlLmNoYW5uZWwucXVldWUubGVuZ3RoIC0gMSkgcmV0dXJuO1xuICAgIHZhciBzID0gJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXhdO1xuICAgICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4XSA9ICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4ICsgMV07XG4gICAgJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXggKyAxXSA9IHM7XG4gICAgJHNjb3BlLnNhdmVDaGFubmVsKCk7XG4gICAgJHNjb3BlLmxvYWRRdWV1ZVNvbmdzKFskc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleF0sICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4ICsgMV1dKTtcbiAgfVxuXG4gIC8vICRzY29wZS5jYW5Mb3dlck9wZW5FdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgLy8gICB2YXIgd2FpdGluZ1N1YnMgPSAkc2NvcGUuc3VibWlzc2lvbnMuZmlsdGVyKGZ1bmN0aW9uKHN1Yikge1xuICAvLyAgICAgcmV0dXJuIHN1Yi5pbnZvaWNlSUQ7XG4gIC8vICAgfSk7XG4gIC8vICAgdmFyIG9wZW5TbG90cyA9IFtdO1xuICAvLyAgICRzY29wZS5jYWxlbmRhci5mb3JFYWNoKGZ1bmN0aW9uKGRheSkge1xuICAvLyAgICAgZGF5LmV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2KSB7XG4gIC8vICAgICAgIGlmIChldi5wYWlkICYmICFldi50cmFja0lEKSBvcGVuU2xvdHMucHVzaChldik7XG4gIC8vICAgICB9KTtcbiAgLy8gICB9KTtcbiAgLy8gICB2YXIgb3Blbk51bSA9IG9wZW5TbG90cy5sZW5ndGggLSB3YWl0aW5nU3Vicy5sZW5ndGg7XG4gIC8vICAgcmV0dXJuIG9wZW5OdW0gPiAwO1xuICAvLyB9XG5cbiAgJHNjb3BlLmxvYWRTdWJtaXNzaW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUuc3VibWlzc2lvbnMuZm9yRWFjaChmdW5jdGlvbihzdWIpIHtcbiAgICAgICAgU0Mub0VtYmVkKFwiaHR0cDovL2FwaS5zb3VuZGNsb3VkLmNvbS90cmFja3MvXCIgKyBzdWIudHJhY2tJRCwge1xuICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHN1Yi50cmFja0lEICsgXCJwbGF5ZXJcIiksXG4gICAgICAgICAgYXV0b19wbGF5OiBmYWxzZSxcbiAgICAgICAgICBtYXhoZWlnaHQ6IDE1MFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sIDUwKTtcbiAgfVxuXG4gICRzY29wZS5sb2FkUXVldWVTb25ncyA9IGZ1bmN0aW9uKHF1ZXVlKSB7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHF1ZXVlLmZvckVhY2goZnVuY3Rpb24oc29uZ0lEKSB7XG4gICAgICAgIFNDLm9FbWJlZChcImh0dHA6Ly9hcGkuc291bmRjbG91ZC5jb20vdHJhY2tzL1wiICsgc29uZ0lELCB7XG4gICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc29uZ0lEICsgXCJwbGF5ZXJcIiksXG4gICAgICAgICAgYXV0b19wbGF5OiBmYWxzZSxcbiAgICAgICAgICBtYXhoZWlnaHQ6IDE1MFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sIDUwKTtcbiAgfVxuICBpZiAoJHNjb3BlLmNoYW5uZWwgJiYgJHNjb3BlLmNoYW5uZWwucXVldWUpIHtcbiAgICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MoJHNjb3BlLmNoYW5uZWwucXVldWUpO1xuICB9XG4gICRzY29wZS5sb2FkU3VibWlzc2lvbnMoKTtcblxufSk7XG5cbmZ1bmN0aW9uIGZpbGxEYXRlQXJyYXlzKGV2ZW50cykge1xuICB2YXIgY2FsZW5kYXIgPSBbXTtcbiAgdmFyIHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAyMTsgaSsrKSB7XG4gICAgdmFyIGNhbERheSA9IHt9O1xuICAgIGNhbERheS5kYXkgPSBuZXcgRGF0ZSgpXG4gICAgY2FsRGF5LmRheS5zZXREYXRlKHRvZGF5LmdldERhdGUoKSArIGkpO1xuICAgIHZhciBkYXlFdmVudHMgPSBldmVudHMuZmlsdGVyKGZ1bmN0aW9uKGV2KSB7XG4gICAgICByZXR1cm4gKGV2LmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSBjYWxEYXkuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpKTtcbiAgICB9KTtcbiAgICB2YXIgZXZlbnRBcnJheSA9IFtdO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgMjQ7IGorKykge1xuICAgICAgZXZlbnRBcnJheVtqXSA9IFwiLVwiO1xuICAgIH1cbiAgICBkYXlFdmVudHMuZm9yRWFjaChmdW5jdGlvbihldikge1xuICAgICAgZXZlbnRBcnJheVtldi5kYXkuZ2V0SG91cnMoKV0gPSBldjtcbiAgICB9KTtcbiAgICBjYWxEYXkuZXZlbnRzID0gZXZlbnRBcnJheTtcbiAgICBjYWxlbmRhci5wdXNoKGNhbERheSk7XG4gIH1cbiAgcmV0dXJuIGNhbGVuZGFyO1xufSIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3N1Ym1pdFNvbmcnLCB7XG4gICAgdXJsOiAnL3N1Ym1pdCcsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9zdWJtaXQvc3VibWl0LnZpZXcuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ1N1Ym1pdFNvbmdDb250cm9sbGVyJ1xuICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignU3VibWl0U29uZ0NvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHApIHtcblxuICAkc2NvcGUuc3VibWlzc2lvbiA9IHt9O1xuXG4gICRzY29wZS51cmxDaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAucG9zdCgnL2FwaS9zb3VuZGNsb3VkL3Jlc29sdmUnLCB7XG4gICAgICAgIHVybDogJHNjb3BlLnVybFxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUuc3VibWlzc2lvbi50cmFja0lEID0gcmVzLmRhdGEuaWQ7XG4gICAgICAgICRzY29wZS5zdWJtaXNzaW9uLnRpdGxlID0gcmVzLmRhdGEudGl0bGU7XG4gICAgICAgICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrVVJMID0gcmVzLmRhdGEudHJhY2tVUkw7XG4gICAgICAgIFNDLm9FbWJlZCgkc2NvcGUuc3VibWlzc2lvbi50cmFja1VSTCwge1xuICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLFxuICAgICAgICAgIGF1dG9fcGxheTogZmFsc2UsXG4gICAgICAgICAgbWF4aGVpZ2h0OiAxNTBcbiAgICAgICAgfSlcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUGxheWVyJykuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAkc2NvcGUubm90Rm91bmQgPSBmYWxzZTtcbiAgICAgIH0pLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrSUQgPSBudWxsO1xuICAgICAgICAkc2NvcGUubm90Rm91bmQgPSB0cnVlO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghJHNjb3BlLnN1Ym1pc3Npb24uZW1haWwgfHwgISRzY29wZS5zdWJtaXNzaW9uLm5hbWUpIHtcbiAgICAgIGFsZXJ0KFwiUGxlYXNlIGZpbGwgaW4gYWxsIGZpZWxkc1wiKVxuICAgIH0gZWxzZSBpZiAoISRzY29wZS5zdWJtaXNzaW9uLnRyYWNrSUQpIHtcbiAgICAgIGFsZXJ0KFwiVHJhY2sgTm90IEZvdW5kXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAkaHR0cC5wb3N0KCcvYXBpL3N1Ym1pc3Npb25zJywge1xuICAgICAgICAgIGVtYWlsOiAkc2NvcGUuc3VibWlzc2lvbi5lbWFpbCxcbiAgICAgICAgICB0cmFja0lEOiAkc2NvcGUuc3VibWlzc2lvbi50cmFja0lELFxuICAgICAgICAgIG5hbWU6ICRzY29wZS5zdWJtaXNzaW9uLm5hbWUsXG4gICAgICAgICAgdGl0bGU6ICRzY29wZS5zdWJtaXNzaW9uLnRpdGxlLFxuICAgICAgICAgIHRyYWNrVVJMOiAkc2NvcGUuc3VibWlzc2lvbi50cmFja1VSTCxcbiAgICAgICAgICBjaGFubmVsSURTOiBbXSxcbiAgICAgICAgICBpbnZvaWNlSURTOiBbXVxuICAgICAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhyZXMuZGF0YSk7XG4gICAgICAgICAgd2luZG93LmFsZXJ0KFwiWW91ciBzb25nIGhhcyBiZWVuIHN1Ym1pdHRlZCBhbmQgd2lsbCBiZSByZXZpZXdlZCBzb29uLlwiKTtcbiAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJFcnJvcjogQ291bGQgbm90IHN1Ym1pdCBzb25nLlwiKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdsb2dpbicsIHtcbiAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICBwYXJhbXM6IHsgXG4gICAgICAgIHN1Ym1pc3Npb246IG51bGxcbiAgICAgIH0sXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2F1dGgvdmlld3MvbG9naW4uaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQXV0aENvbnRyb2xsZXInXG4gICAgfSlcbiAgICAuc3RhdGUoJ3NpZ251cCcsIHtcbiAgICAgIHVybDogJy9zaWdudXAnLFxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hdXRoL3ZpZXdzL3NpZ251cC5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ29udHJvbGxlcidcbiAgICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignQXV0aENvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgJHNjb3BlLCAkaHR0cCwgJHVpYk1vZGFsLCAkd2luZG93LCBBdXRoU2VydmljZSwgU2Vzc2lvblNlcnZpY2UsIHNvY2tldCkge1xuICAkc2NvcGUubG9naW5PYmogPSB7fTtcbiAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgdmFsOiAnJyxcbiAgICB2aXNpYmxlOiBmYWxzZVxuICB9O1xuICAkc2NvcGUub3Blbk1vZGFsID0ge1xuICAgICAgc2lnbnVwQ29uZmlybTogZnVuY3Rpb24oKSB7ICAgICAgICBcbiAgICAgICAgJHNjb3BlLm1vZGFsSW5zdGFuY2UgPSAkdWliTW9kYWwub3Blbih7XG4gICAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiAnc2lnbnVwQ29tcGxldGUuaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0F1dGhDb250cm9sbGVyJyxcbiAgICAgICAgICBzY29wZTogJHNjb3BlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5tZXNzYWdlID0ge1xuICAgICAgdmFsOiAnJyxcbiAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgfTtcbiAgICBBdXRoU2VydmljZVxuICAgICAgLmxvZ2luKCRzY29wZS5sb2dpbk9iailcbiAgICAgIC50aGVuKGhhbmRsZUxvZ2luUmVzcG9uc2UpXG4gICAgICAuY2F0Y2goaGFuZGxlTG9naW5FcnJvcilcbiAgICBcbiAgICBmdW5jdGlvbiBoYW5kbGVMb2dpblJlc3BvbnNlKHJlcykge1xuICAgICAgaWYocmVzLnN0YXR1cyA9PT0gMjAwICYmIHJlcy5kYXRhLnN1Y2Nlc3MpIHtcbiAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlKHJlcy5kYXRhLnVzZXIpO1xuICAgICAgICAkc3RhdGUuZ28oJ2FydGlzdFRvb2xzLmRvd25sb2FkR2F0ZXdheS5saXN0Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgICAgICB2YWw6IHJlcy5kYXRhLm1lc3NhZ2UsXG4gICAgICAgICAgdmlzaWJsZTogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZUxvZ2luRXJyb3IocmVzKSB7XG4gICAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgICAgdmFsOiAnRXJyb3IgaW4gcHJvY2Vzc2luZyB5b3VyIHJlcXVlc3QnLFxuICAgICAgICB2aXNpYmxlOiB0cnVlXG4gICAgICB9O1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuY2hlY2tJZlN1Ym1pc3Npb24gPSBmdW5jdGlvbigpIHtcbiAgICBpZigkc3RhdGVQYXJhbXMuc3VibWlzc2lvbikge1xuICAgICAgJHNjb3BlLnNvdW5kY2xvdWRMb2dpbigpO1xuICAgIH1cbiAgfVxuXG5cbiAgJHNjb3BlLnNpZ251cCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5tZXNzYWdlID0ge1xuICAgICAgdmFsOiAnJyxcbiAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgfTtcbiAgICBpZigkc2NvcGUuc2lnbnVwT2JqLnBhc3N3b3JkICE9ICRzY29wZS5zaWdudXBPYmouY29uZmlybVBhc3N3b3JkKSB7XG4gICAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgICAgdmFsOiAnUGFzc3dvcmQgZG9lc25cXCd0IG1hdGNoIHdpdGggY29uZmlybSBwYXNzd29yZCcsXG4gICAgICAgIHZpc2libGU6IHRydWVcbiAgICAgIH07XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIEF1dGhTZXJ2aWNlXG4gICAgICAuc2lnbnVwKCRzY29wZS5zaWdudXBPYmopXG4gICAgICAudGhlbihoYW5kbGVTaWdudXBSZXNwb25zZSlcbiAgICAgIC5jYXRjaChoYW5kbGVTaWdudXBFcnJvcilcbiAgICBcbiAgICBmdW5jdGlvbiBoYW5kbGVTaWdudXBSZXNwb25zZShyZXMpIHtcbiAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVTaWdudXBFcnJvcihyZXMpIHtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLnNvdW5kY2xvdWRMb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgIFNDLmNvbm5lY3QoKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAkcm9vdFNjb3BlLmFjY2Vzc1Rva2VuID0gcmVzLm9hdXRoX3Rva2VuO1xuICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9sb2dpbi9zb3VuZENsb3VkTG9naW4nLCB7XG4gICAgICAgICAgdG9rZW46IHJlcy5vYXV0aF90b2tlbixcbiAgICAgICAgICBwYXNzd29yZDogJ3Rlc3QnXG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uIChyZXMpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlKHJlcy5kYXRhLnVzZXIpO1xuICAgICAgICBpZigkc3RhdGVQYXJhbXMuc3VibWlzc2lvbikge1xuICAgICAgICAgICRzdGF0ZS5nbygnYXJ0aXN0VG9vbHMuZG93bmxvYWRHYXRld2F5Lm5ldycsIHsgJ3N1Ym1pc3Npb24nIDogJHN0YXRlUGFyYW1zLnN1Ym1pc3Npb259KTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgJHN0YXRlLmdvKCdhcnRpc3RUb29scy5kb3dubG9hZEdhdGV3YXkubGlzdCcpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgYWxlcnQoJ0Vycm9yOiBDb3VsZCBub3QgbG9nIGluJyk7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfTtcbn0pOyIsImFwcC5mYWN0b3J5KCdBdXRoU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbigkaHR0cCl7XG5cdFxuXHRmdW5jdGlvbiBsb2dpbihkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvbG9naW4nLCBkYXRhKTtcblx0fVxuXG5cdGZ1bmN0aW9uIHNpZ251cChkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvc2lnbnVwJywgZGF0YSk7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdGxvZ2luOiBsb2dpbixcblx0XHRzaWdudXA6IHNpZ251cFxuXHR9O1xufV0pO1xuIiwiXG5cbmFwcC5mYWN0b3J5KCdTZXNzaW9uU2VydmljZScsIFsnJGNvb2tpZXMnLCBmdW5jdGlvbigkY29va2llcykge1xuXHRcblx0ZnVuY3Rpb24gY3JlYXRlKGRhdGEpIHtcblx0XHQkY29va2llcy5wdXRPYmplY3QoJ3VzZXInLCBkYXRhKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGRlbGV0ZVVzZXIoKSB7XG5cdFx0JGNvb2tpZXMucmVtb3ZlKCd1c2VyJyk7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRVc2VyKCkge1xuXHRcdHJldHVybiAkY29va2llcy5nZXQoJ3VzZXInKTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0Y3JlYXRlOiBjcmVhdGUsXG5cdFx0ZGVsZXRlVXNlcjogZGVsZXRlVXNlcixcblx0XHRnZXRVc2VyOiBnZXRVc2VyXG5cdH07XG59XSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhdXRvRW1haWxzTmV3Jywge1xuICAgIHVybDogJy9hZG1pbi9kYXRhYmFzZS9hdXRvRW1haWxzL25ldycsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9kYXRhYmFzZS9hdXRvRW1haWxzL2F1dG9FbWFpbHMuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0F1dG9FbWFpbHNDb250cm9sbGVyJ1xuICB9KTtcbn0pO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhdXRvRW1haWxzRWRpdCcsIHtcbiAgICB1cmw6ICcvYWRtaW4vZGF0YWJhc2UvYXV0b0VtYWlscy9lZGl0Lzp0ZW1wbGF0ZUlkJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2RhdGFiYXNlL2F1dG9FbWFpbHMvYXV0b0VtYWlscy5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnQXV0b0VtYWlsc0NvbnRyb2xsZXInLFxuICAgIC8vIHJlc29sdmU6IHtcbiAgICAvLyAgIHRlbXBsYXRlOiBmdW5jdGlvbigkaHR0cCkge1xuICAgIC8vICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2RhdGFiYXNlL2F1dG9FbWFpbHMvYml3ZWVrbHk/aXNBcnRpc3Q9dHJ1ZScpXG4gICAgLy8gICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgLy8gICAgICAgICB2YXIgdGVtcGxhdGUgPSByZXMuZGF0YTtcbiAgICAvLyAgICAgICAgIGlmICh0ZW1wbGF0ZSkge1xuICAgIC8vICAgICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgLy8gICAgICAgICB9IGVsc2Uge1xuICAgIC8vICAgICAgICAgICByZXR1cm4ge1xuICAgIC8vICAgICAgICAgICAgIHB1cnBvc2U6IFwiQml3ZWVrbHkgRW1haWxcIlxuICAgIC8vICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgICAgfSlcbiAgICAvLyAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAvLyAgICAgICAgIGFsZXJ0KFwiRVJST1I6IFNvbWV0aGluZyB3ZW50IHdyb25nLlwiKTtcbiAgICAvLyAgICAgICB9KVxuICAgIC8vICAgfVxuICAgIC8vIH1cbiAgfSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0F1dG9FbWFpbHNDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCAkc3RhdGVQYXJhbXMsIEF1dGhTZXJ2aWNlKSB7XG4gICRzY29wZS5sb2dnZWRJbiA9IGZhbHNlO1xuXG5cbiAgJHNjb3BlLmlzU3RhdGVQYXJhbXMgPSBmYWxzZTtcbiAgaWYoJHN0YXRlUGFyYW1zLnRlbXBsYXRlSWQpIHtcbiAgICAkc2NvcGUuaXNTdGF0ZVBhcmFtcyA9IHRydWU7XG4gIH1cbiAgLy8gJHNjb3BlLnRlbXBsYXRlID0gdGVtcGxhdGU7XG5cbiAgJHNjb3BlLnRlbXBsYXRlID0ge1xuICAgIGlzQXJ0aXN0OiBmYWxzZVxuICB9O1xuXG4gICRzY29wZS5nZXRUZW1wbGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmKCRzdGF0ZVBhcmFtcy50ZW1wbGF0ZUlkKSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAkaHR0cC5nZXQoJy9hcGkvZGF0YWJhc2UvYXV0b0VtYWlscz90ZW1wbGF0ZUlkPScgKyAkc3RhdGVQYXJhbXMudGVtcGxhdGVJZClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdmFyIHRlbXBsYXRlID0gcmVzLmRhdGE7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICBpZiAodGVtcGxhdGUpIHtcbiAgICAgICAgICAgICRzY29wZS50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkc2NvcGUudGVtcGxhdGUgPSB7fTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgIGFsZXJ0KFwiRVJST1I6IFNvbWV0aGluZyB3ZW50IHdyb25nLlwiKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH07XG5cbiAgLy8gY29uc29sZS5sb2codGVtcGxhdGUpO1xuICAkc2NvcGUuc2F2ZSA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL2F1dG9FbWFpbHMvJywgJHNjb3BlLnRlbXBsYXRlKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIGFsZXJ0KFwiU2F2ZWQgZW1haWwgdGVtcGxhdGUuXCIpXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGFsZXJ0KFwiRVJST1I6IE1lc3NhZ2UgY291bGQgbm90IHNhdmUuXCIpXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8vICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAvLyAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgLy8gICAkaHR0cC5wb3N0KCcvYXBpL2xvZ2luJywge1xuICAvLyAgICAgcGFzc3dvcmQ6ICRzY29wZS5wYXNzd29yZFxuICAvLyAgIH0pLnRoZW4oZnVuY3Rpb24oKSB7XG4gIC8vICAgICAkcm9vdFNjb3BlLnBhc3N3b3JkID0gJHNjb3BlLnBhc3N3b3JkO1xuICAvLyAgICAgJHNjb3BlLmxvZ2dlZEluID0gdHJ1ZTtcbiAgLy8gICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gIC8vICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gIC8vICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAvLyAgICAgYWxlcnQoJ1dyb25nIFBhc3N3b3JkJyk7XG4gIC8vICAgfSk7XG4gIC8vIH1cblxuICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgJGh0dHAuZ2V0KCcvYXBpL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4nO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIGFsZXJ0KCdXcm9uZyBQYXNzd29yZCcpO1xuICAgIH0pO1xuICB9XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2F1dG9FbWFpbHNMaXN0Jywge1xuICAgIHVybDogJy9hZG1pbi9kYXRhYmFzZS9hdXRvRW1haWxzJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2RhdGFiYXNlL2F1dG9FbWFpbHMvYXV0b0VtYWlsc0xpc3QuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0F1dG9FbWFpbHNMaXN0Q29udHJvbGxlcicsXG4gICAgcmVzb2x2ZToge1xuICAgICAgdGVtcGxhdGVzOiBmdW5jdGlvbigkaHR0cCkge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2RhdGFiYXNlL2F1dG9FbWFpbHMnKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykgeyBcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IHJlcy5kYXRhO1xuICAgICAgICAgICAgaWYgKHRlbXBsYXRlKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcHVycG9zZTogXCJCaXdlZWtseSBFbWFpbFwiXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgYWxlcnQoXCJFUlJPUjogU29tZXRoaW5nIHdlbnQgd3JvbmcuXCIpO1xuICAgICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignQXV0b0VtYWlsc0xpc3RDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCBBdXRoU2VydmljZSwgdGVtcGxhdGVzKSB7XG4gICRzY29wZS5sb2dnZWRJbiA9IGZhbHNlO1xuICAkc2NvcGUudGVtcGxhdGVzID0gdGVtcGxhdGVzO1xuXG4gIC8vICRzY29wZS5nZXRUZW1wbGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgLy8gICAkaHR0cC5nZXQoJy9hcGkvZGF0YWJhc2UvYXV0b0VtYWlscy9iaXdlZWtseT9pc0FydGlzdD0nICsgU3RyaW5nKCRzY29wZS50ZW1wbGF0ZS5pc0FydGlzdCkpXG4gIC8vICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgLy8gICAgICAgdmFyIHRlbXBsYXRlID0gcmVzLmRhdGE7XG4gIC8vICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gIC8vICAgICAgIGlmICh0ZW1wbGF0ZSkge1xuICAvLyAgICAgICAgICRzY29wZS50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAvLyAgICAgICB9IGVsc2Uge1xuICAvLyAgICAgICAgICRzY29wZS50ZW1wbGF0ZSA9IHtcbiAgLy8gICAgICAgICAgIHB1cnBvc2U6IFwiQml3ZWVrbHkgRW1haWxcIixcbiAgLy8gICAgICAgICAgIGlzQXJ0aXN0OiBmYWxzZVxuICAvLyAgICAgICAgIH07XG4gIC8vICAgICAgIH1cbiAgLy8gICAgIH0pXG4gIC8vICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgLy8gICAgICAgYWxlcnQoXCJFUlJPUjogU29tZXRoaW5nIHdlbnQgd3JvbmcuXCIpO1xuICAvLyAgICAgfSk7XG4gIC8vIH07XG5cbiAgLy8gY29uc29sZS5sb2codGVtcGxhdGUpO1xuICAkc2NvcGUuc2F2ZSA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL2F1dG9FbWFpbHMnLCAkc2NvcGUudGVtcGxhdGUpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgYWxlcnQoXCJTYXZlZCBlbWFpbC5cIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGFsZXJ0KFwiRVJST1I6IE1lc3NhZ2UgY291bGQgbm90IHNhdmUuXCIpXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8vICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAvLyAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgLy8gICAkaHR0cC5wb3N0KCcvYXBpL2xvZ2luJywge1xuICAvLyAgICAgcGFzc3dvcmQ6ICRzY29wZS5wYXNzd29yZFxuICAvLyAgIH0pLnRoZW4oZnVuY3Rpb24oKSB7XG4gIC8vICAgICAkcm9vdFNjb3BlLnBhc3N3b3JkID0gJHNjb3BlLnBhc3N3b3JkO1xuICAvLyAgICAgJHNjb3BlLmxvZ2dlZEluID0gdHJ1ZTtcbiAgLy8gICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gIC8vICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gIC8vICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAvLyAgICAgYWxlcnQoJ1dyb25nIFBhc3N3b3JkJyk7XG4gIC8vICAgfSk7XG4gIC8vIH1cblxuICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgJGh0dHAuZ2V0KCcvYXBpL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4nO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIGFsZXJ0KCdXcm9uZyBQYXNzd29yZCcpO1xuICAgIH0pO1xuICB9XG5cbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZG93bmxvYWRHYXRlJywge1xuICAgIHVybDogJy9hZG1pbi9kb3dubG9hZEdhdGUnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvZG93bmxvYWRUcmFjay92aWV3cy9hZG1pbkRMR2F0ZS5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnQWRtaW5ETEdhdGVDb250cm9sbGVyJ1xuICB9KTtcbn0pO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkb3dubG9hZEdhdGVMaXN0Jywge1xuICAgIHVybDogJy9hZG1pbi9kb3dubG9hZEdhdGUvbGlzdCcsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9kb3dubG9hZFRyYWNrL3ZpZXdzL2FkbWluRExHYXRlLmxpc3QuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0FkbWluRExHYXRlQ29udHJvbGxlcidcbiAgfSk7XG59KTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZG93bmxvYWRHYXRlRWRpdCcsIHtcbiAgICB1cmw6ICcvYWRtaW4vZG93bmxvYWRHYXRlL2VkaXQvOmdhdGV3YXlJRCcsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9kb3dubG9hZFRyYWNrL3ZpZXdzL2FkbWluRExHYXRlLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdBZG1pbkRMR2F0ZUNvbnRyb2xsZXInXG4gIH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ0FkbWluRExHYXRlQ29udHJvbGxlcicsIFsnJHJvb3RTY29wZScsXG4gICckc3RhdGUnLFxuICAnJHN0YXRlUGFyYW1zJyxcbiAgJyRzY29wZScsXG4gICckaHR0cCcsXG4gICckbG9jYXRpb24nLFxuICAnJHdpbmRvdycsXG4gICckdWliTW9kYWwnLFxuICAnU2Vzc2lvblNlcnZpY2UnLFxuICAnQWRtaW5ETEdhdGVTZXJ2aWNlJyxcbiAgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsICRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgJHdpbmRvdywgJHVpYk1vZGFsLCBTZXNzaW9uU2VydmljZSwgQWRtaW5ETEdhdGVTZXJ2aWNlKSB7XG4gICAgLyogSW5pdCBib29sZWFuIHZhcmlhYmxlcyBmb3Igc2hvdy9oaWRlIGFuZCBvdGhlciBmdW5jdGlvbmFsaXRpZXMgKi9cbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gZmFsc2U7XG4gICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICB2YWw6ICcnLFxuICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICB9O1xuXG4gICAgLyogSW5pdCBEb3dubG9hZCBHYXRld2F5IGZvcm0gZGF0YSAqL1xuXG4gICAgJHNjb3BlLnRyYWNrID0ge1xuICAgICAgYXJ0aXN0VXNlcm5hbWU6ICdMYSBUcm9waWPDoWwnLFxuICAgICAgdHJhY2tUaXRsZTogJ1BhbnRlb25lIC8gVHJhdmVsJyxcbiAgICAgIHRyYWNrQXJ0d29ya1VSTDogJ2Fzc2V0cy9pbWFnZXMvd2hvLXdlLWFyZS5wbmcnLFxuICAgICAgU01MaW5rczogW10sXG4gICAgICBsaWtlOiBmYWxzZSxcbiAgICAgIGNvbW1lbnQ6IGZhbHNlLFxuICAgICAgcmVwb3N0OiBmYWxzZSxcbiAgICAgIGFydGlzdHM6IFt7XG4gICAgICAgIHVybDogJycsXG4gICAgICAgIGF2YXRhcjogJ2Fzc2V0cy9pbWFnZXMvd2hvLXdlLWFyZS5wbmcnLFxuICAgICAgICB1c2VybmFtZTogJycsXG4gICAgICAgIGlkOiAtMSxcbiAgICAgICAgcGVybWFuZW50TGluazogZmFsc2VcbiAgICAgIH1dLFxuICAgICAgcGxheWxpc3RzOiBbe1xuICAgICAgICB1cmw6ICcnLFxuICAgICAgICBhdmF0YXI6ICcnLFxuICAgICAgICB0aXRsZTogJycsXG4gICAgICAgIGlkOiAnJ1xuICAgICAgfV1cbiAgICB9O1xuXG4gICAgLyogSW5pdCBkb3dubG9hZEdhdGV3YXkgbGlzdCAqL1xuXG4gICAgJHNjb3BlLmRvd25sb2FkR2F0ZXdheUxpc3QgPSBbXTtcblxuICAgIC8qIEluaXQgbW9kYWwgaW5zdGFuY2UgdmFyaWFibGVzIGFuZCBtZXRob2RzICovXG5cbiAgICAkc2NvcGUubW9kYWxJbnN0YW5jZSA9IHt9O1xuICAgICRzY29wZS5tb2RhbCA9IHt9O1xuICAgICRzY29wZS5vcGVuTW9kYWwgPSB7XG4gICAgICBkb3dubG9hZFVSTDogZnVuY3Rpb24oZG93bmxvYWRVUkwpIHtcbiAgICAgICAgJHNjb3BlLm1vZGFsLmRvd25sb2FkVVJMID0gZG93bmxvYWRVUkw7XG4gICAgICAgICRzY29wZS5tb2RhbEluc3RhbmNlID0gJHVpYk1vZGFsLm9wZW4oe1xuICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2Rvd25sb2FkVVJMLmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdBcnRpc3RUb29sc0NvbnRyb2xsZXInLFxuICAgICAgICAgIHNjb3BlOiAkc2NvcGVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgICAkc2NvcGUuY2xvc2VNb2RhbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLm1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcbiAgICB9XG5cbiAgICAvKiBJbml0IHByb2ZpbGUgKi9cbiAgICAkc2NvcGUucHJvZmlsZSA9IHt9O1xuXG4gICAgLyogTWV0aG9kIGZvciByZXNldHRpbmcgRG93bmxvYWQgR2F0ZXdheSBmb3JtICovXG5cbiAgICBmdW5jdGlvbiByZXNldERvd25sb2FkR2F0ZXdheSgpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IGZhbHNlO1xuICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICAgIHZhbDogJycsXG4gICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUudHJhY2sgPSB7XG4gICAgICAgIGFydGlzdFVzZXJuYW1lOiAnTGEgVHJvcGljw6FsJyxcbiAgICAgICAgdHJhY2tUaXRsZTogJ1BhbnRlb25lIC8gVHJhdmVsJyxcbiAgICAgICAgdHJhY2tBcnR3b3JrVVJMOiAnYXNzZXRzL2ltYWdlcy93aG8td2UtYXJlLnBuZycsXG4gICAgICAgIFNNTGlua3M6IFtdLFxuICAgICAgICBsaWtlOiBmYWxzZSxcbiAgICAgICAgY29tbWVudDogZmFsc2UsXG4gICAgICAgIHJlcG9zdDogZmFsc2UsXG4gICAgICAgIGFydGlzdHM6IFt7XG4gICAgICAgICAgdXJsOiAnJyxcbiAgICAgICAgICBhdmF0YXI6ICdhc3NldHMvaW1hZ2VzL3doby13ZS1hcmUucG5nJyxcbiAgICAgICAgICB1c2VybmFtZTogJycsXG4gICAgICAgICAgaWQ6IC0xLFxuICAgICAgICAgIHBlcm1hbmVudExpbms6IGZhbHNlXG4gICAgICAgIH1dLFxuICAgICAgICBwbGF5bGlzdHM6IFt7XG4gICAgICAgICAgdXJsOiAnJyxcbiAgICAgICAgICBhdmF0YXI6ICcnLFxuICAgICAgICAgIHRpdGxlOiAnJyxcbiAgICAgICAgICBpZDogJydcbiAgICAgICAgfV1cbiAgICAgIH07XG4gICAgICBhbmd1bGFyLmVsZW1lbnQoXCJpbnB1dFt0eXBlPSdmaWxlJ11cIikudmFsKG51bGwpO1xuICAgIH1cblxuICAgIC8qIENoZWNrIGlmIHN0YXRlUGFyYW1zIGhhcyBnYXRld2F5SUQgdG8gaW5pdGlhdGUgZWRpdCAqL1xuICAgICRzY29wZS5jaGVja0lmRWRpdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCRzdGF0ZVBhcmFtcy5nYXRld2F5SUQpIHtcbiAgICAgICAgJHNjb3BlLmdldERvd25sb2FkR2F0ZXdheSgkc3RhdGVQYXJhbXMuZ2F0ZXdheUlEKTtcbiAgICAgICAgLy8gaWYoISRzdGF0ZVBhcmFtcy5kb3dubG9hZEdhdGV3YXkpIHtcbiAgICAgICAgLy8gICAkc2NvcGUuZ2V0RG93bmxvYWRHYXRld2F5KCRzdGF0ZVBhcmFtcy5nYXRld2F5SUQpO1xuICAgICAgICAvLyB9IGVsc2Uge1xuICAgICAgICAvLyAgICRzY29wZS50cmFjayA9ICRzdGF0ZVBhcmFtcy5kb3dubG9hZEdhdGV3YXk7XG4gICAgICAgIC8vIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAkc2NvcGUudHJhY2tVUkxDaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgkc2NvcGUudHJhY2sudHJhY2tVUkwgIT09ICcnKSB7XG4gICAgICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICAgQWRtaW5ETEdhdGVTZXJ2aWNlXG4gICAgICAgICAgLnJlc29sdmVEYXRhKHtcbiAgICAgICAgICAgIHVybDogJHNjb3BlLnRyYWNrLnRyYWNrVVJMXG4gICAgICAgICAgfSlcbiAgICAgICAgICAudGhlbihoYW5kbGVUcmFja0RhdGFBbmRHZXRQcm9maWxlcylcbiAgICAgICAgICAudGhlbihoYW5kbGVXZWJQcm9maWxlcylcbiAgICAgICAgICAuY2F0Y2goaGFuZGxlRXJyb3IpO1xuXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVRyYWNrRGF0YUFuZEdldFByb2ZpbGVzKHJlcykge1xuICAgICAgICAgICRzY29wZS50cmFjay50cmFja1RpdGxlID0gcmVzLmRhdGEudGl0bGU7XG4gICAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrSUQgPSByZXMuZGF0YS5pZDtcbiAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0SUQgPSByZXMuZGF0YS51c2VyLmlkO1xuICAgICAgICAgICRzY29wZS50cmFjay50cmFja0FydHdvcmtVUkwgPSByZXMuZGF0YS5hcnR3b3JrX3VybCA/IHJlcy5kYXRhLmFydHdvcmtfdXJsLnJlcGxhY2UoJ2xhcmdlLmpwZycsICd0NTAweDUwMC5qcGcnKSA6ICcnO1xuICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RBcnR3b3JrVVJMID0gcmVzLmRhdGEudXNlci5hdmF0YXJfdXJsID8gcmVzLmRhdGEudXNlci5hdmF0YXJfdXJsIDogJyc7XG4gICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdFVSTCA9IHJlcy5kYXRhLnVzZXIucGVybWFsaW5rX3VybDtcbiAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0VXNlcm5hbWUgPSByZXMuZGF0YS51c2VyLnVzZXJuYW1lO1xuICAgICAgICAgICRzY29wZS50cmFjay5TTUxpbmtzID0gW107XG4gICAgICAgICAgcmV0dXJuIFNDLmdldCgnL3VzZXJzLycgKyAkc2NvcGUudHJhY2suYXJ0aXN0SUQgKyAnL3dlYi1wcm9maWxlcycpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlV2ViUHJvZmlsZXMocHJvZmlsZXMpIHtcbiAgICAgICAgICBwcm9maWxlcy5mb3JFYWNoKGZ1bmN0aW9uKHByb2YpIHtcbiAgICAgICAgICAgIGlmIChbJ3R3aXR0ZXInLCAneW91dHViZScsICdmYWNlYm9vaycsICdzcG90aWZ5JywgJ3NvdW5kY2xvdWQnLCAnaW5zdGFncmFtJ10uaW5kZXhPZihwcm9mLnNlcnZpY2UpICE9IC0xKSB7XG4gICAgICAgICAgICAgICRzY29wZS50cmFjay5TTUxpbmtzLnB1c2goe1xuICAgICAgICAgICAgICAgIGtleTogcHJvZi5zZXJ2aWNlLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBwcm9mLnVybFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IHRydWU7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycikge1xuICAgICAgICAgICRzY29wZS50cmFjay50cmFja0lEID0gbnVsbDtcbiAgICAgICAgICBhbGVydCgnU29uZyBub3QgZm91bmQgb3IgZm9yYmlkZGVuJyk7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICAkc2NvcGUuYXJ0aXN0VVJMQ2hhbmdlID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgIHZhciBhcnRpc3QgPSB7fTtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgIEFkbWluRExHYXRlU2VydmljZVxuICAgICAgICAucmVzb2x2ZURhdGEoe1xuICAgICAgICAgIHVybDogJHNjb3BlLnRyYWNrLmFydGlzdHNbaW5kZXhdLnVybFxuICAgICAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0c1tpbmRleF0uYXZhdGFyID0gcmVzLmRhdGEuYXZhdGFyX3VybDtcbiAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0c1tpbmRleF0udXNlcm5hbWUgPSByZXMuZGF0YS51c2VybmFtZTtcbiAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0c1tpbmRleF0uaWQgPSByZXMuZGF0YS5pZDtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgYWxlcnQoJ0FydGlzdHMgbm90IGZvdW5kJyk7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgICRzY29wZS5hZGRQbGF5bGlzdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLnRyYWNrLnBsYXlsaXN0cy5wdXNoKHtcbiAgICAgICAgdXJsOiAnJyxcbiAgICAgICAgYXZhdGFyOiAnJyxcbiAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICBpZDogJydcbiAgICAgIH0pO1xuICAgIH1cbiAgICAkc2NvcGUucmVtb3ZlUGxheWxpc3QgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgJHNjb3BlLnRyYWNrLnBsYXlsaXN0cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICAkc2NvcGUucGxheWxpc3RVUkxDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgQWRtaW5ETEdhdGVTZXJ2aWNlXG4gICAgICAgIC5yZXNvbHZlRGF0YSh7XG4gICAgICAgICAgdXJsOiAkc2NvcGUudHJhY2sucGxheWxpc3RzW2luZGV4XS51cmxcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgJHNjb3BlLnRyYWNrLnBsYXlsaXN0c1tpbmRleF0uYXZhdGFyID0gcmVzLmRhdGEuYXJ0d29ya191cmw7XG4gICAgICAgICAgJHNjb3BlLnRyYWNrLnBsYXlsaXN0c1tpbmRleF0udGl0bGUgPSByZXMuZGF0YS50aXRsZTtcbiAgICAgICAgICAkc2NvcGUudHJhY2sucGxheWxpc3RzW2luZGV4XS5pZCA9IHJlcy5kYXRhLmlkO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgIGFsZXJ0KCdQbGF5bGlzdCBub3QgZm91bmQnKTtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9KVxuICAgIH1cblxuXG4gICAgJHNjb3BlLnJlbW92ZUFydGlzdCA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAkc2NvcGUudHJhY2suYXJ0aXN0cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cblxuICAgICRzY29wZS5hZGRBcnRpc3QgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgkc2NvcGUudHJhY2suYXJ0aXN0cy5sZW5ndGggPiAyKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdHMucHVzaCh7XG4gICAgICAgIHVybDogJycsXG4gICAgICAgIGF2YXRhcjogJ2Fzc2V0cy9pbWFnZXMvd2hvLXdlLWFyZS5wbmcnLFxuICAgICAgICB1c2VybmFtZTogJycsXG4gICAgICAgIGlkOiAtMVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgJHNjb3BlLmFkZFNNTGluayA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gZXh0ZXJuYWxTTUxpbmtzKys7XG4gICAgICAvLyAkc2NvcGUudHJhY2suU01MaW5rc1sna2V5JyArIGV4dGVybmFsU01MaW5rc10gPSAnJztcbiAgICAgICRzY29wZS50cmFjay5TTUxpbmtzLnB1c2goe1xuICAgICAgICBrZXk6ICcnLFxuICAgICAgICB2YWx1ZTogJydcbiAgICAgIH0pO1xuICAgIH07XG4gICAgJHNjb3BlLnJlbW92ZVNNTGluayA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAkc2NvcGUudHJhY2suU01MaW5rcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH07XG4gICAgJHNjb3BlLlNNTGlua0NoYW5nZSA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cbiAgICAgIGZ1bmN0aW9uIGdldExvY2F0aW9uKGhyZWYpIHtcbiAgICAgICAgdmFyIGxvY2F0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgICAgIGxvY2F0aW9uLmhyZWYgPSBocmVmO1xuICAgICAgICBpZiAobG9jYXRpb24uaG9zdCA9PSBcIlwiKSB7XG4gICAgICAgICAgbG9jYXRpb24uaHJlZiA9IGxvY2F0aW9uLmhyZWY7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxvY2F0aW9uO1xuICAgICAgfVxuXG4gICAgICB2YXIgbG9jYXRpb24gPSBnZXRMb2NhdGlvbigkc2NvcGUudHJhY2suU01MaW5rc1tpbmRleF0udmFsdWUpO1xuICAgICAgdmFyIGhvc3QgPSBsb2NhdGlvbi5ob3N0bmFtZS5zcGxpdCgnLicpWzBdO1xuICAgICAgdmFyIGZpbmRMaW5rID0gJHNjb3BlLnRyYWNrLlNNTGlua3MuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGl0ZW0ua2V5ID09PSBob3N0O1xuICAgICAgfSk7XG4gICAgICBpZiAoZmluZExpbmsubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICAkc2NvcGUudHJhY2suU01MaW5rc1tpbmRleF0ua2V5ID0gaG9zdDtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnNhdmVEb3dubG9hZEdhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghJHNjb3BlLnRyYWNrLnRyYWNrSUQpIHtcbiAgICAgICAgYWxlcnQoJ1RyYWNrIE5vdCBGb3VuZCcpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICB2YXIgc2VuZE9iaiA9IG5ldyBGb3JtRGF0YSgpO1xuXG4gICAgICAvKiBBcHBlbmQgZGF0YSB0byBzZW5kT2JqIHN0YXJ0ICovXG5cbiAgICAgIC8qIFRyYWNrICovXG4gICAgICBmb3IgKHZhciBwcm9wIGluICRzY29wZS50cmFjaykge1xuICAgICAgICBzZW5kT2JqLmFwcGVuZChwcm9wLCAkc2NvcGUudHJhY2tbcHJvcF0pO1xuICAgICAgfVxuXG4gICAgICAvKiBhcnRpc3RzICovXG5cbiAgICAgIHZhciBhcnRpc3RzID0gJHNjb3BlLnRyYWNrLmFydGlzdHMuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGl0ZW0uaWQgIT09IC0xO1xuICAgICAgfSkubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgZGVsZXRlIGl0ZW1bJyQkaGFzaEtleSddO1xuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgIH0pO1xuICAgICAgc2VuZE9iai5hcHBlbmQoJ2FydGlzdHMnLCBKU09OLnN0cmluZ2lmeShhcnRpc3RzKSk7XG5cbiAgICAgIC8qIHBsYXlsaXN0cyAqL1xuXG4gICAgICB2YXIgcGxheWxpc3RzID0gJHNjb3BlLnRyYWNrLnBsYXlsaXN0cy5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICByZXR1cm4gaXRlbS5pZCAhPT0gLTE7XG4gICAgICB9KS5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBkZWxldGUgaXRlbVsnJCRoYXNoS2V5J107XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgfSk7XG4gICAgICBzZW5kT2JqLmFwcGVuZCgncGxheWxpc3RzJywgSlNPTi5zdHJpbmdpZnkocGxheWxpc3RzKSk7XG5cbiAgICAgIC8qIFNNTGlua3MgKi9cblxuICAgICAgdmFyIFNNTGlua3MgPSB7fTtcbiAgICAgICRzY29wZS50cmFjay5TTUxpbmtzLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBTTUxpbmtzW2l0ZW0ua2V5XSA9IGl0ZW0udmFsdWU7XG4gICAgICB9KTtcbiAgICAgIHNlbmRPYmouYXBwZW5kKCdTTUxpbmtzJywgSlNPTi5zdHJpbmdpZnkoU01MaW5rcykpO1xuXG4gICAgICAvKiBBcHBlbmQgZGF0YSB0byBzZW5kT2JqIGVuZCAqL1xuXG4gICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIHVybDogJy9hcGkvZGF0YWJhc2UvZG93bmxvYWR1cmwnLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6IHVuZGVmaW5lZFxuICAgICAgICB9LFxuICAgICAgICB0cmFuc2Zvcm1SZXF1ZXN0OiBhbmd1bGFyLmlkZW50aXR5LFxuICAgICAgICBkYXRhOiBzZW5kT2JqXG4gICAgICB9O1xuICAgICAgJGh0dHAob3B0aW9ucylcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICBpZiAoJHNjb3BlLnRyYWNrLl9pZCkge1xuICAgICAgICAgICAgLy8gJHNjb3BlLm9wZW5Nb2RhbC5kb3dubG9hZFVSTChyZXMuZGF0YS50cmFja1VSTCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc2V0RG93bmxvYWRHYXRld2F5KCk7XG4gICAgICAgICAgJHNjb3BlLm9wZW5Nb2RhbC5kb3dubG9hZFVSTChyZXMuZGF0YSk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgYWxlcnQoXCJFUlJPUjogRXJyb3IgaW4gc2F2aW5nIHVybFwiKTtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgJGh0dHAucG9zdCgnL2FwaS9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBTZXNzaW9uU2VydmljZS5kZWxldGVVc2VyKCk7XG4gICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgICRzY29wZS5zaG93UHJvZmlsZUluZm8gPSBmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5wcm9maWxlID0gSlNPTi5wYXJzZShTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkpO1xuICAgIH1cblxuICAgICRzY29wZS5nZXREb3dubG9hZExpc3QgPSBmdW5jdGlvbigpIHtcbiAgICAgIEFkbWluRExHYXRlU2VydmljZVxuICAgICAgICAuZ2V0RG93bmxvYWRMaXN0KClcbiAgICAgICAgLnRoZW4oaGFuZGxlUmVzcG9uc2UpXG4gICAgICAgIC5jYXRjaChoYW5kbGVFcnJvcik7XG5cbiAgICAgIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlcykge1xuICAgICAgICAkc2NvcGUuZG93bmxvYWRHYXRld2F5TGlzdCA9IHJlcy5kYXRhO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihyZXMpIHtcblxuICAgICAgfVxuICAgIH1cblxuICAgIC8qIE1ldGhvZCBmb3IgZ2V0dGluZyBEb3dubG9hZEdhdGV3YXkgaW4gY2FzZSBvZiBlZGl0ICovXG5cbiAgICAkc2NvcGUuZ2V0RG93bmxvYWRHYXRld2F5ID0gZnVuY3Rpb24oZG93bmxvYWRHYXRlV2F5SUQpIHtcbiAgICAgIC8vIHJlc2V0RG93bmxvYWRHYXRld2F5KCk7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICBBZG1pbkRMR2F0ZVNlcnZpY2VcbiAgICAgICAgLmdldERvd25sb2FkR2F0ZXdheSh7XG4gICAgICAgICAgaWQ6IGRvd25sb2FkR2F0ZVdheUlEXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKGhhbmRsZVJlc3BvbnNlKVxuICAgICAgICAuY2F0Y2goaGFuZGxlRXJyb3IpO1xuXG4gICAgICBmdW5jdGlvbiBoYW5kbGVSZXNwb25zZShyZXMpIHtcblxuICAgICAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IHRydWU7XG4gICAgICAgICRzY29wZS50cmFjayA9IHJlcy5kYXRhO1xuXG4gICAgICAgIHZhciBTTUxpbmtzID0gcmVzLmRhdGEuU01MaW5rcyA/IHJlcy5kYXRhLlNNTGlua3MgOiB7fTtcbiAgICAgICAgdmFyIFNNTGlua3NBcnJheSA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIGxpbmsgaW4gU01MaW5rcykge1xuICAgICAgICAgIFNNTGlua3NBcnJheS5wdXNoKHtcbiAgICAgICAgICAgIGtleTogbGluayxcbiAgICAgICAgICAgIHZhbHVlOiBTTUxpbmtzW2xpbmtdXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MgPSBTTUxpbmtzQXJyYXk7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKHJlcykge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAkc2NvcGUuZGVsZXRlRG93bmxvYWRHYXRld2F5ID0gZnVuY3Rpb24oaW5kZXgpIHtcblxuICAgICAgaWYgKGNvbmZpcm0oXCJEbyB5b3UgcmVhbGx5IHdhbnQgdG8gZGVsZXRlIHRoaXMgdHJhY2s/XCIpKSB7XG4gICAgICB2YXIgZG93bmxvYWRHYXRlV2F5SUQgPSAkc2NvcGUuZG93bmxvYWRHYXRld2F5TGlzdFtpbmRleF0uX2lkO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAgIEFkbWluRExHYXRlU2VydmljZVxuICAgICAgICAgIC5kZWxldGVEb3dubG9hZEdhdGV3YXkoe1xuICAgICAgICAgICAgaWQ6IGRvd25sb2FkR2F0ZVdheUlEXG4gICAgICAgICAgfSlcbiAgICAgICAgICAudGhlbihoYW5kbGVSZXNwb25zZSlcbiAgICAgICAgICAuY2F0Y2goaGFuZGxlRXJyb3IpO1xuXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlcykge1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgJHNjb3BlLmRvd25sb2FkR2F0ZXdheUxpc3Quc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKHJlcykge1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuXSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnZG93bmxvYWQnLCB7XG5cdFx0dXJsOiAnL2Rvd25sb2FkJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2Rvd25sb2FkVHJhY2svdmlld3MvZG93bmxvYWRUcmFjay52aWV3Lmh0bWwnLFxuXHRcdGNvbnRyb2xsZXI6ICdEb3dubG9hZFRyYWNrQ29udHJvbGxlcidcblx0fSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0Rvd25sb2FkVHJhY2tDb250cm9sbGVyJywgWyckcm9vdFNjb3BlJyxcblx0JyRzdGF0ZScsXG5cdCckc2NvcGUnLFxuXHQnJGh0dHAnLFxuXHQnJGxvY2F0aW9uJyxcblx0JyR3aW5kb3cnLFxuXHQnJHEnLFxuXHQnRG93bmxvYWRUcmFja1NlcnZpY2UnLFxuXHRmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgJHdpbmRvdywgJHEsIERvd25sb2FkVHJhY2tTZXJ2aWNlKSB7XG5cblx0XHQvKiBOb3JtYWwgSlMgdmFycyBhbmQgZnVuY3Rpb25zIG5vdCBib3VuZCB0byBzY29wZSAqL1xuXHRcdHZhciBwbGF5ZXJPYmogPSBudWxsO1xuXG5cdFx0LyogJHNjb3BlIGJpbmRpbmdzIHN0YXJ0ICovXG5cblx0XHQkc2NvcGUudHJhY2tEYXRhID0ge1xuXHRcdFx0dHJhY2tOYW1lOiAnTWl4aW5nIGFuZCBNYXN0ZXJpbmcnLFxuXHRcdFx0dXNlck5hbWU6ICdsYSB0cm9waWNhbCdcblx0XHR9O1xuXHRcdCRzY29wZS50b2dnbGUgPSB0cnVlO1xuXHRcdCRzY29wZS50b2dnbGVQbGF5ID0gZnVuY3Rpb24oKSB7XG5cdFx0XHQkc2NvcGUudG9nZ2xlID0gISRzY29wZS50b2dnbGU7XG5cdFx0XHRpZiAoJHNjb3BlLnRvZ2dsZSkge1xuXHRcdFx0XHRwbGF5ZXJPYmoucGF1c2UoKTtcblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdHBsYXllck9iai5wbGF5KCk7XG5cdFx0XHR9XG5cdFx0fVxuXHRcdCRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG5cdFx0JHNjb3BlLmVtYmVkVHJhY2sgPSBmYWxzZTtcblx0XHQkc2NvcGUuZG93bmxvYWRVUkxOb3RGb3VuZCA9IGZhbHNlO1xuXHRcdCRzY29wZS5lcnJvclRleHQgPSAnJztcblx0XHQkc2NvcGUuZm9sbG93Qm94SW1hZ2VVcmwgPSAnYXNzZXRzL2ltYWdlcy93aG8td2UtYXJlLnBuZyc7XG5cdFx0JHNjb3BlLnJlY2VudFRyYWNrcyA9IFtdO1xuXG5cdFx0LyogRGVmYXVsdCBwcm9jZXNzaW5nIG9uIHBhZ2UgbG9hZCAqL1xuXG5cdFx0JHNjb3BlLmdldERvd25sb2FkVHJhY2sgPSBmdW5jdGlvbigpIHtcblxuXHRcdFx0JHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuXHRcdFx0dmFyIHRyYWNrSUQgPSAkbG9jYXRpb24uc2VhcmNoKCkudHJhY2tpZDtcblx0XHRcdERvd25sb2FkVHJhY2tTZXJ2aWNlXG5cdFx0XHQvLyAuZ2V0RG93bmxvYWRUcmFjayh0cmFja0lEKVxuXHRcdFx0XHQudGhlbihyZWNlaXZlRG93bmxvYWRUcmFjaylcblx0XHRcdFx0LnRoZW4ocmVjZWl2ZVJlY2VudFRyYWNrcylcblx0XHRcdFx0LnRoZW4oaW5pdFBsYXkpXG5cdFx0XHRcdC5jYXRjaChjYXRjaERvd25sb2FkVHJhY2tFcnJvcik7XG5cblx0XHRcdGZ1bmN0aW9uIHJlY2VpdmVEb3dubG9hZFRyYWNrKHJlc3VsdCkge1xuXHRcdFx0XHQkc2NvcGUudHJhY2sgPSByZXN1bHQuZGF0YTtcblx0XHRcdFx0Y29uc29sZS5sb2coJHNjb3BlLnRyYWNrKTtcblx0XHRcdFx0JHNjb3BlLmJhY2tncm91bmRTdHlsZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHQnYmFja2dyb3VuZC1pbWFnZSc6ICd1cmwoJyArICRzY29wZS50cmFjay50cmFja0FydHdvcmtVUkwgKyAnKScsXG5cdFx0XHRcdFx0XHQnYmFja2dyb3VuZC1yZXBlYXQnOiAnbm8tcmVwZWF0Jyxcblx0XHRcdFx0XHRcdCdiYWNrZ3JvdW5kLXNpemUnOiAnY292ZXInXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0JHNjb3BlLmVtYmVkVHJhY2sgPSB0cnVlO1xuXHRcdFx0XHQkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuXG5cdFx0XHRcdGlmICgkc2NvcGUudHJhY2suc2hvd0Rvd25sb2FkVHJhY2tzID09PSAndXNlcicpIHtcblx0XHRcdFx0XHRyZXR1cm4gRG93bmxvYWRUcmFja1NlcnZpY2UuZ2V0UmVjZW50VHJhY2tzKHtcblx0XHRcdFx0XHRcdHVzZXJJRDogJHNjb3BlLnRyYWNrLnVzZXJpZCxcblx0XHRcdFx0XHRcdHRyYWNrSUQ6ICRzY29wZS50cmFjay5faWRcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gJHEucmVzb2x2ZSgncmVzb2x2ZScpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIHJlY2VpdmVSZWNlbnRUcmFja3MocmVzKSB7XG5cdFx0XHRcdGlmICgodHlwZW9mIHJlcyA9PT0gJ29iamVjdCcpICYmIHJlcy5kYXRhKSB7XG5cdFx0XHRcdFx0JHNjb3BlLnJlY2VudFRyYWNrcyA9IHJlcy5kYXRhO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBTQy5zdHJlYW0oJy90cmFja3MvJyArICRzY29wZS50cmFjay50cmFja0lEKTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gaW5pdFBsYXkocGxheWVyKSB7XG5cdFx0XHRcdHBsYXllck9iaiA9IHBsYXllcjtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gY2F0Y2hEb3dubG9hZFRyYWNrRXJyb3IoKSB7XG5cdFx0XHRcdGFsZXJ0KCdTb25nIE5vdCBGb3VuZCcpO1xuXHRcdFx0XHQkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuXHRcdFx0XHQkc2NvcGUuZW1iZWRUcmFjayA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH07XG5cblxuXHRcdC8qIE9uIGNsaWNrIGRvd25sb2FkIHRyYWNrIGJ1dHRvbiAqL1xuXG5cdFx0JHNjb3BlLmRvd25sb2FkVHJhY2sgPSBmdW5jdGlvbigpIHtcblx0XHRcdGlmICgkc2NvcGUudHJhY2suY29tbWVudCAmJiAhJHNjb3BlLnRyYWNrLmNvbW1lbnRUZXh0KSB7XG5cdFx0XHRcdGFsZXJ0KCdQbGVhc2Ugd3JpdGUgYSBjb21tZW50IScpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHQkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG5cdFx0XHQkc2NvcGUuZXJyb3JUZXh0ID0gJyc7XG5cblx0XHRcdFNDLmNvbm5lY3QoKVxuXHRcdFx0XHQudGhlbihwZXJmb3JtVGFza3MpXG5cdFx0XHRcdC50aGVuKGluaXREb3dubG9hZClcblx0XHRcdFx0LmNhdGNoKGNhdGNoVGFza3NFcnJvcilcblxuXHRcdFx0ZnVuY3Rpb24gcGVyZm9ybVRhc2tzKHJlcykge1xuXHRcdFx0XHQkc2NvcGUudHJhY2sudG9rZW4gPSByZXMub2F1dGhfdG9rZW47XG5cdFx0XHRcdHJldHVybiBEb3dubG9hZFRyYWNrU2VydmljZS5wZXJmb3JtVGFza3MoJHNjb3BlLnRyYWNrKTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gaW5pdERvd25sb2FkKHJlcykge1xuXHRcdFx0XHQkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuXHRcdFx0XHRpZiAoJHNjb3BlLnRyYWNrLmRvd25sb2FkVVJMICYmICRzY29wZS50cmFjay5kb3dubG9hZFVSTCAhPT0gJycpIHtcblx0XHRcdFx0XHQkd2luZG93LmxvY2F0aW9uLmhyZWYgPSAkc2NvcGUudHJhY2suZG93bmxvYWRVUkw7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JHNjb3BlLmVycm9yVGV4dCA9ICdFcnJvciEgQ291bGQgbm90IGZldGNoIGRvd25sb2FkIFVSTCc7XG5cdFx0XHRcdFx0JHNjb3BlLmRvd25sb2FkVVJMTm90Rm91bmQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdCRzY29wZS4kYXBwbHkoKTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gY2F0Y2hUYXNrc0Vycm9yKGVycikge1xuXHRcdFx0XHRhbGVydCgnRXJyb3IgaW4gcHJvY2Vzc2luZyB5b3VyIHJlcXVlc3QnKTtcblx0XHRcdFx0JHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcblx0XHRcdFx0JHNjb3BlLiRhcHBseSgpO1xuXHRcdFx0fVxuXG5cdFx0fTtcblx0fVxuXSk7IiwiXG5hcHAuc2VydmljZSgnQWRtaW5ETEdhdGVTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKXtcblxuXHRmdW5jdGlvbiByZXNvbHZlRGF0YShkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvc291bmRjbG91ZC9yZXNvbHZlJywgZGF0YSk7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXREb3dubG9hZExpc3QoKSB7XG5cdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS9kYXRhYmFzZS9kb3dubG9hZHVybC9hZG1pbicpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0RG93bmxvYWRHYXRld2F5KGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2RhdGFiYXNlL2Rvd25sb2FkdXJsLycgKyBkYXRhLmlkKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGRlbGV0ZURvd25sb2FkR2F0ZXdheShkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvZG93bmxvYWR1cmwvZGVsZXRlJywgZGF0YSk7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHJlc29sdmVEYXRhOiByZXNvbHZlRGF0YSxcblx0XHRnZXREb3dubG9hZExpc3Q6IGdldERvd25sb2FkTGlzdCxcblx0XHRnZXREb3dubG9hZEdhdGV3YXk6IGdldERvd25sb2FkR2F0ZXdheSxcblx0XHRkZWxldGVEb3dubG9hZEdhdGV3YXk6IGRlbGV0ZURvd25sb2FkR2F0ZXdheVxuXHR9O1xufV0pO1xuIiwiYXBwLnNlcnZpY2UoJ0Rvd25sb2FkVHJhY2tTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKXtcblx0XG5cdGZ1bmN0aW9uIGdldERvd25sb2FkVHJhY2soZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZG93bmxvYWQvdHJhY2s/dHJhY2tJRD0nICsgZGF0YSk7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRUcmFja0RhdGEoZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIHtcblx0XHRcdHVybDogZGF0YS50cmFja1VSTFxuXHRcdH0pO1xuXHR9XG5cblx0ZnVuY3Rpb24gcGVyZm9ybVRhc2tzKGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnYXBpL2Rvd25sb2FkL3Rhc2tzJywgZGF0YSk7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRSZWNlbnRUcmFja3MoZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZG93bmxvYWQvdHJhY2svcmVjZW50P3VzZXJJRD0nICsgZGF0YS51c2VySUQgKyAnJnRyYWNrSUQ9JyArIGRhdGEudHJhY2tJRCk7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdGdldERvd25sb2FkVHJhY2s6IGdldERvd25sb2FkVHJhY2ssXG5cdFx0Z2V0VHJhY2tEYXRhOiBnZXRUcmFja0RhdGEsXG5cdFx0cGVyZm9ybVRhc2tzOiBwZXJmb3JtVGFza3MsXG5cdFx0Z2V0UmVjZW50VHJhY2tzOiBnZXRSZWNlbnRUcmFja3Ncblx0fTtcbn1dKTtcbiIsIiBhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gICAuc3RhdGUoJ2FydGlzdFRvb2xzJywge1xuICAgICAgdXJsOiAnL2FydGlzdC10b29scycsXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvYXJ0aXN0VG9vbHMvYXJ0aXN0VG9vbHMuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQXJ0aXN0VG9vbHNDb250cm9sbGVyJyxcbiAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgcmVzb2x2ZSA6IHtcbiAgICAgICAgYWxsb3dlZCA6IGZ1bmN0aW9uKCRxLCAkc3RhdGUsIFNlc3Npb25TZXJ2aWNlKSB7XG4gICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICB2YXIgdXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcbiAgICAgICAgICBpZih1c2VyKSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2xvZ2luJztcbiAgICAgICAgICB9XG4gICAgICAgICAgXG4gICAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXJ0aXN0VG9vbHMucHJvZmlsZScsIHtcbiAgICAgIHVybDogJy9wcm9maWxlJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS92aWV3cy9hcnRpc3RUb29scy9wcm9maWxlLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0FydGlzdFRvb2xzQ29udHJvbGxlcidcbiAgICB9KVxuICAgIC5zdGF0ZSgnYXJ0aXN0VG9vbHMuZG93bmxvYWRHYXRld2F5Jywge1xuICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICB1cmw6ICcnLFxuICAgICAgdGVtcGxhdGU6ICc8ZGl2IHVpLXZpZXc9XCJnYXRld2F5XCI+PC9kaXY+JyxcbiAgICAgIGNvbnRyb2xsZXI6ICdBcnRpc3RUb29sc0NvbnRyb2xsZXInXG4gICAgfSlcbiAgICAuc3RhdGUoJ2FydGlzdFRvb2xzLmRvd25sb2FkR2F0ZXdheS5saXN0Jywge1xuICAgICAgdXJsOiAnL2Rvd25sb2FkLWdhdGV3YXknLFxuICAgICAgcGFyYW1zOiB7IFxuICAgICAgICBzdWJtaXNzaW9uOiBudWxsXG4gICAgICB9LFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ2dhdGV3YXknOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL3ZpZXdzL2FydGlzdFRvb2xzL2Rvd25sb2FkR2F0ZXdheS5saXN0Lmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdBcnRpc3RUb29sc0NvbnRyb2xsZXInXG4gICAgICAgIH0gXG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FydGlzdFRvb2xzLmRvd25sb2FkR2F0ZXdheS5lZGl0Jywge1xuICAgICAgdXJsOiAnL2Rvd25sb2FkLWdhdGV3YXkvZWRpdC86Z2F0ZXdheUlEJyxcbiAgICAgIHZpZXdzOiB7XG4gICAgICAgICdnYXRld2F5Jzoge1xuICAgICAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS92aWV3cy9hcnRpc3RUb29scy9kb3dubG9hZEdhdGV3YXkuaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0FydGlzdFRvb2xzQ29udHJvbGxlcidcbiAgICAgICAgfSBcbiAgICAgIH1cbiAgICB9KVxuICAgIC5zdGF0ZSgnYXJ0aXN0VG9vbHMuZG93bmxvYWRHYXRld2F5Lm5ldycsIHtcbiAgICAgIHVybDogJy9kb3dubG9hZC1nYXRld2F5L25ldycsXG4gICAgICBwYXJhbXM6IHsgXG4gICAgICAgIHN1Ym1pc3Npb246IG51bGwgXG4gICAgICB9LFxuICAgICAgdmlld3M6IHtcbiAgICAgICAgJ2dhdGV3YXknOiB7XG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL3ZpZXdzL2FydGlzdFRvb2xzL2Rvd25sb2FkR2F0ZXdheS5odG1sJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnQXJ0aXN0VG9vbHNDb250cm9sbGVyJ1xuICAgICAgICB9IFxuICAgICAgfVxuICAgIH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdBcnRpc3RUb29sc0NvbnRyb2xsZXInLCBbJyRyb290U2NvcGUnLFxuICAnJHN0YXRlJyxcbiAgJyRzdGF0ZVBhcmFtcycsXG4gICckc2NvcGUnLFxuICAnJGh0dHAnLFxuICAnJGxvY2F0aW9uJyxcbiAgJyR3aW5kb3cnLFxuICAnJHVpYk1vZGFsJyxcbiAgJyR0aW1lb3V0JyxcbiAgJ1Nlc3Npb25TZXJ2aWNlJyxcbiAgJ0FydGlzdFRvb2xzU2VydmljZScsXG4gIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCAkc2NvcGUsICRodHRwLCAkbG9jYXRpb24sICR3aW5kb3csICR1aWJNb2RhbCwgJHRpbWVvdXQsIFNlc3Npb25TZXJ2aWNlLCBBcnRpc3RUb29sc1NlcnZpY2UpIHtcbiAgXG4gICAgLyogSW5pdCBib29sZWFuIHZhcmlhYmxlcyBmb3Igc2hvdy9oaWRlIGFuZCBvdGhlciBmdW5jdGlvbmFsaXRpZXMgKi9cblxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSBmYWxzZTtcbiAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgIHZhbDogJycsXG4gICAgICB2aXNpYmxlOiBmYWxzZVxuICAgIH07XG5cbiAgICAvKiBJbml0IERvd25sb2FkIEdhdGV3YXkgZm9ybSBkYXRhICovXG5cbiAgICAkc2NvcGUudHJhY2sgPSB7XG4gICAgICBhcnRpc3RVc2VybmFtZTogJycsXG4gICAgICB0cmFja1RpdGxlOiAnJyxcbiAgICAgIHRyYWNrQXJ0d29ya1VSTDogJycsXG4gICAgICBTTUxpbmtzOiBbXSxcbiAgICAgIGxpa2U6IGZhbHNlLFxuICAgICAgY29tbWVudDogZmFsc2UsXG4gICAgICByZXBvc3Q6IGZhbHNlLFxuICAgICAgYXJ0aXN0czogW3tcbiAgICAgICAgdXJsOiAnJyxcbiAgICAgICAgYXZhdGFyOiAnJyxcbiAgICAgICAgdXNlcm5hbWU6ICcnLFxuICAgICAgICBpZDogLTEsXG4gICAgICAgIHBlcm1hbmVudExpbms6IGZhbHNlXG4gICAgICB9XSxcbiAgICAgIHNob3dEb3dubG9hZFRyYWNrczogJ3VzZXInXG4gICAgfTtcbiAgICAkc2NvcGUucHJvZmlsZSA9IHt9O1xuICAgIFxuICAgIC8qIEluaXQgZG93bmxvYWRHYXRld2F5IGxpc3QgKi9cblxuICAgICRzY29wZS5kb3dubG9hZEdhdGV3YXlMaXN0ID0gW107XG5cbiAgICAvKiBJbml0IHRyYWNrIGxpc3QgYW5kIHRyYWNrTGlzdE9iaiovXG5cbiAgICAkc2NvcGUudHJhY2tMaXN0ID0gW107XG4gICAgJHNjb3BlLnRyYWNrTGlzdE9iaiA9IG51bGw7XG5cbiAgICAvKiBJbml0IG1vZGFsIGluc3RhbmNlIHZhcmlhYmxlcyBhbmQgbWV0aG9kcyAqL1xuXG4gICAgJHNjb3BlLm1vZGFsSW5zdGFuY2UgPSB7fTtcbiAgICAkc2NvcGUubW9kYWwgPSB7fTtcbiAgICAkc2NvcGUub3Blbk1vZGFsID0ge1xuICAgICAgZG93bmxvYWRVUkw6IGZ1bmN0aW9uKGRvd25sb2FkVVJMKSB7XG4gICAgICAgICRzY29wZS5tb2RhbC5kb3dubG9hZFVSTCA9IGRvd25sb2FkVVJMO1xuICAgICAgICAkc2NvcGUubW9kYWxJbnN0YW5jZSA9ICR1aWJNb2RhbC5vcGVuKHtcbiAgICAgICAgICBhbmltYXRpb246IHRydWUsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICdkb3dubG9hZFVSTC5odG1sJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnQXJ0aXN0VG9vbHNDb250cm9sbGVyJyxcbiAgICAgICAgICBzY29wZTogJHNjb3BlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gICAgJHNjb3BlLmNsb3NlTW9kYWwgPSBmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5tb2RhbEluc3RhbmNlLmNsb3NlKCk7XG4gICAgfTtcblxuICAgICRzY29wZS5lZGl0UHJvZmlsZU1vZGFsSW5zdGFuY2UgPSB7fTtcbiAgICAkc2NvcGUuZWRpdFByb2ZpbGVtb2RhbCA9IHt9O1xuICAgICRzY29wZS5vcGVuRWRpdFByb2ZpbGVNb2RhbCA9IHtcbiAgICAgIGVkaXRQcm9maWxlOiBmdW5jdGlvbihmaWVsZCkge1xuICAgICAgICAkc2NvcGUucHJvZmlsZS5maWVsZCA9IGZpZWxkO1xuICAgICAgICAkdGltZW91dChmdW5jdGlvbigpIHsgIFxuICAgICAgICAgICRzY29wZS5lZGl0UHJvZmlsZU1vZGFsSW5zdGFuY2UgPSAkdWliTW9kYWwub3Blbih7XG4gICAgICAgICAgICBhbmltYXRpb246IHRydWUsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2VkaXRQcm9maWxlLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0FydGlzdFRvb2xzQ29udHJvbGxlcicsXG4gICAgICAgICAgICBzY29wZTogJHNjb3BlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIDApO1xuICAgICAgfVxuICAgIH07XG4gICAgJHNjb3BlLmNsb3NlRWRpdFByb2ZpbGVNb2RhbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLnNob3dQcm9maWxlSW5mbygpO1xuICAgICAgaWYoJHNjb3BlLmVkaXRQcm9maWxlTW9kYWxJbnN0YW5jZS5jbG9zZSkge1xuICAgICAgICAkc2NvcGUuZWRpdFByb2ZpbGVNb2RhbEluc3RhbmNlLmNsb3NlKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgICRzY29wZS50aGFua1lvdU1vZGFsSW5zdGFuY2UgPSB7fTtcbiAgICAkc2NvcGUudGhhbmtZb3VNb2RhbCA9IHt9O1xuICAgICRzY29wZS5vcGVuVGhhbmtZb3VNb2RhbCA9IHtcbiAgICAgIHRoYW5rWW91OiBmdW5jdGlvbihzdWJtaXNzaW9uSUQpIHtcbiAgICAgICAgJHNjb3BlLnRoYW5rWW91TW9kYWwuc3VibWlzc2lvbklEID0gc3VibWlzc2lvbklEO1xuICAgICAgICAkc2NvcGUubW9kYWxJbnN0YW5jZSA9ICR1aWJNb2RhbC5vcGVuKHtcbiAgICAgICAgICBhbmltYXRpb246IHRydWUsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0aGFua1lvdS5odG1sJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnQXJ0aXN0VG9vbHNDb250cm9sbGVyJyxcbiAgICAgICAgICBzY29wZTogJHNjb3BlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gICAgJHNjb3BlLmNsb3NlVGhhbmtZb3VNb2RhbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLnRoYW5rWW91TW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xuICAgIH07XG5cbiAgICAvKiBJbml0IHByb2ZpbGUgKi9cbiAgICAkc2NvcGUucHJvZmlsZSA9IHt9O1xuXG4gICAgLyogTWV0aG9kIGZvciByZXNldHRpbmcgRG93bmxvYWQgR2F0ZXdheSBmb3JtICovXG5cbiAgICBmdW5jdGlvbiByZXNldERvd25sb2FkR2F0ZXdheSgpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IGZhbHNlO1xuICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICAgIHZhbDogJycsXG4gICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUudHJhY2sgPSB7XG4gICAgICAgIGFydGlzdFVzZXJuYW1lOiAnJyxcbiAgICAgICAgdHJhY2tUaXRsZTogJycsXG4gICAgICAgIHRyYWNrQXJ0d29ya1VSTDogJycsXG4gICAgICAgIFNNTGlua3M6IFtdLFxuICAgICAgICBsaWtlOiBmYWxzZSxcbiAgICAgICAgY29tbWVudDogZmFsc2UsXG4gICAgICAgIHJlcG9zdDogZmFsc2UsXG4gICAgICAgIGFydGlzdHM6IFt7XG4gICAgICAgICAgdXJsOiAnJyxcbiAgICAgICAgICBhdmF0YXI6ICcnLFxuICAgICAgICAgIHVzZXJuYW1lOiAnJyxcbiAgICAgICAgICBpZDogLTEsXG4gICAgICAgICAgcGVybWFuZW50TGluazogZmFsc2VcbiAgICAgICAgfV0sXG4gICAgICAgIHNob3dEb3dubG9hZFRyYWNrczogJ3VzZXInXG4gICAgICB9O1xuICAgICAgYW5ndWxhci5lbGVtZW50KFwiaW5wdXRbdHlwZT0nZmlsZSddXCIpLnZhbChudWxsKTtcbiAgICB9XG5cbiAgICAvKiBDaGVjayBpZiBzdGF0ZVBhcmFtcyBoYXMgZ2F0ZXdheUlEIHRvIGluaXRpYXRlIGVkaXQgKi9cbiAgICAkc2NvcGUuY2hlY2tJZkVkaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmKCRzdGF0ZVBhcmFtcy5nYXRld2F5SUQpIHtcbiAgICAgICAgJHNjb3BlLmdldERvd25sb2FkR2F0ZXdheSgkc3RhdGVQYXJhbXMuZ2F0ZXdheUlEKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgJHNjb3BlLmNoZWNrSWZTdWJtaXNzaW9uID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZigkc3RhdGVQYXJhbXMuc3VibWlzc2lvbikge1xuICAgICAgICBpZigkc3RhdGUuaW5jbHVkZXMoJ2FydGlzdFRvb2xzLmRvd25sb2FkR2F0ZXdheS5uZXcnKSkge1xuICAgICAgICAgICRzY29wZS50cmFjay50cmFja1VSTCA9ICRyb290U2NvcGUuc3VibWlzc2lvbi50cmFja1VSTDtcbiAgICAgICAgICAkc2NvcGUudHJhY2tVUkxDaGFuZ2UoKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgJHNjb3BlLm9wZW5UaGFua1lvdU1vZGFsLnRoYW5rWW91KCRzdGF0ZVBhcmFtcy5zdWJtaXNzaW9uLl9pZCk7XG4gICAgICAgICRyb290U2NvcGUuc3VibWlzc2lvbiA9IG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgJHNjb3BlLnRyYWNrVVJMQ2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoJHNjb3BlLnRyYWNrLnRyYWNrVVJMICE9PSAnJykge1xuICAgICAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IGZhbHNlO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAgIEFydGlzdFRvb2xzU2VydmljZVxuICAgICAgICAgIC5yZXNvbHZlRGF0YSh7XG4gICAgICAgICAgICB1cmw6ICRzY29wZS50cmFjay50cmFja1VSTFxuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4oaGFuZGxlVHJhY2tEYXRhQW5kR2V0UHJvZmlsZXMpXG4gICAgICAgICAgLnRoZW4oaGFuZGxlV2ViUHJvZmlsZXMpXG4gICAgICAgICAgLmNhdGNoKGhhbmRsZUVycm9yKTtcblxuICAgICAgICAgIGZ1bmN0aW9uIGhhbmRsZVRyYWNrRGF0YUFuZEdldFByb2ZpbGVzKHJlcykge1xuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrVGl0bGUgPSByZXMuZGF0YS50aXRsZTtcbiAgICAgICAgICAgICRzY29wZS50cmFjay50cmFja0lEID0gcmVzLmRhdGEuaWQ7XG4gICAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0SUQgPSByZXMuZGF0YS51c2VyLmlkO1xuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLmRlc2NyaXB0aW9uID0gcmVzLmRhdGEuZGVzY3JpcHRpb247XG4gICAgICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tBcnR3b3JrVVJMID0gcmVzLmRhdGEuYXJ0d29ya191cmwgPyByZXMuZGF0YS5hcnR3b3JrX3VybC5yZXBsYWNlKCdsYXJnZS5qcGcnLCAndDUwMHg1MDAuanBnJykgOiAnJztcbiAgICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RBcnR3b3JrVVJMID0gcmVzLmRhdGEudXNlci5hdmF0YXJfdXJsID8gcmVzLmRhdGEudXNlci5hdmF0YXJfdXJsIDogJyc7XG4gICAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0VVJMID0gcmVzLmRhdGEudXNlci5wZXJtYWxpbmtfdXJsO1xuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdFVzZXJuYW1lID0gcmVzLmRhdGEudXNlci51c2VybmFtZTtcbiAgICAgICAgICAgICRzY29wZS50cmFjay5TTUxpbmtzID0gW107XG4gICAgICAgICAgICByZXR1cm4gU0MuZ2V0KCcvdXNlcnMvJyArICRzY29wZS50cmFjay5hcnRpc3RJRCArICcvd2ViLXByb2ZpbGVzJyk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgZnVuY3Rpb24gaGFuZGxlV2ViUHJvZmlsZXMocHJvZmlsZXMpIHtcbiAgICAgICAgICAgIHByb2ZpbGVzLmZvckVhY2goZnVuY3Rpb24ocHJvZikge1xuICAgICAgICAgICAgICBpZiAoWyd0d2l0dGVyJywgJ3lvdXR1YmUnLCAnZmFjZWJvb2snLCAnc3BvdGlmeScsICdzb3VuZGNsb3VkJywgJ2luc3RhZ3JhbSddLmluZGV4T2YocHJvZi5zZXJ2aWNlKSAhPSAtMSkge1xuICAgICAgICAgICAgICAgICRzY29wZS50cmFjay5TTUxpbmtzLnB1c2goe1xuICAgICAgICAgICAgICAgICAga2V5OiBwcm9mLnNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICB2YWx1ZTogcHJvZi51cmxcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IHRydWU7XG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycikge1xuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrSUQgPSBudWxsO1xuICAgICAgICAgICAgYWxlcnQoJ1Nvbmcgbm90IGZvdW5kIG9yIGZvcmJpZGRlbicpO1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgICRzY29wZS50cmFja0xpc3RDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xuXG4gICAgICAvKiBTZXQgYm9vbGVhbnMgKi9cblxuICAgICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSBmYWxzZTtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcblxuICAgICAgLyogU2V0IHRyYWNrIGRhdGEgKi9cblxuICAgICAgdmFyIHRyYWNrID0gJHNjb3BlLnRyYWNrTGlzdE9iajtcbiAgICAgICRzY29wZS50cmFjay50cmFja1VSTCA9IHRyYWNrLnBlcm1hbGlua191cmw7XG4gICAgICAkc2NvcGUudHJhY2sudHJhY2tUaXRsZSA9IHRyYWNrLnRpdGxlO1xuICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrSUQgPSB0cmFjay5pZDtcbiAgICAgICRzY29wZS50cmFjay5hcnRpc3RJRCA9IHRyYWNrLnVzZXIuaWQ7XG4gICAgICAkc2NvcGUudHJhY2suZGVzY3JpcHRpb24gPSB0cmFjay5kZXNjcmlwdGlvbjtcbiAgICAgICRzY29wZS50cmFjay50cmFja0FydHdvcmtVUkwgPSB0cmFjay5hcnR3b3JrX3VybCA/IHRyYWNrLmFydHdvcmtfdXJsLnJlcGxhY2UoJ2xhcmdlLmpwZycsICd0NTAweDUwMC5qcGcnKSA6ICcnO1xuICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdEFydHdvcmtVUkwgPSB0cmFjay51c2VyLmF2YXRhcl91cmwgPyB0cmFjay51c2VyLmF2YXRhcl91cmwgOiAnJztcbiAgICAgICRzY29wZS50cmFjay5hcnRpc3RVUkwgPSB0cmFjay51c2VyLnBlcm1hbGlua191cmw7XG4gICAgICAkc2NvcGUudHJhY2suYXJ0aXN0VXNlcm5hbWUgPSB0cmFjay51c2VyLnVzZXJuYW1lO1xuICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MgPSBbXTtcblxuICAgICAgU0MuZ2V0KCcvdXNlcnMvJyArICRzY29wZS50cmFjay5hcnRpc3RJRCArICcvd2ViLXByb2ZpbGVzJylcbiAgICAgICAgLnRoZW4oaGFuZGxlV2ViUHJvZmlsZXMpXG4gICAgICAgIC5jYXRjaChoYW5kbGVFcnJvcik7XG5cbiAgICAgIGZ1bmN0aW9uIGhhbmRsZVdlYlByb2ZpbGVzKHByb2ZpbGVzKSB7XG4gICAgICAgIHByb2ZpbGVzLmZvckVhY2goZnVuY3Rpb24ocHJvZikge1xuICAgICAgICAgIGlmIChbJ3R3aXR0ZXInLCAneW91dHViZScsICdmYWNlYm9vaycsICdzcG90aWZ5JywgJ3NvdW5kY2xvdWQnLCAnaW5zdGFncmFtJ10uaW5kZXhPZihwcm9mLnNlcnZpY2UpICE9IC0xKSB7XG4gICAgICAgICAgICAkc2NvcGUudHJhY2suU01MaW5rcy5wdXNoKHtcbiAgICAgICAgICAgICAga2V5OiBwcm9mLnNlcnZpY2UsXG4gICAgICAgICAgICAgIHZhbHVlOiBwcm9mLnVybFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSB0cnVlO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycikge1xuICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tJRCA9IG51bGw7XG4gICAgICAgIGFsZXJ0KCdTb25nIG5vdCBmb3VuZCBvciBmb3JiaWRkZW4nKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAkc2NvcGUuYXJ0aXN0VVJMQ2hhbmdlID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgIHZhciBhcnRpc3QgPSB7fTtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgIEFydGlzdFRvb2xzU2VydmljZVxuICAgICAgICAucmVzb2x2ZURhdGEoe1xuICAgICAgICAgIHVybDogJHNjb3BlLnRyYWNrLmFydGlzdHNbaW5kZXhdLnVybFxuICAgICAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0c1tpbmRleF0uYXZhdGFyID0gcmVzLmRhdGEuYXZhdGFyX3VybCA/IHJlcy5kYXRhLmF2YXRhcl91cmwgOiAnJztcbiAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0c1tpbmRleF0udXNlcm5hbWUgPSByZXMuZGF0YS51c2VybmFtZTtcbiAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0c1tpbmRleF0uaWQgPSByZXMuZGF0YS5pZDtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgYWxlcnQoJ0FydGlzdHMgbm90IGZvdW5kJyk7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgICRzY29wZS5yZW1vdmVBcnRpc3QgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmFkZEFydGlzdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYoJHNjb3BlLnRyYWNrLmFydGlzdHMubGVuZ3RoID4gMikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS50cmFjay5hcnRpc3RzLnB1c2goe1xuICAgICAgICB1cmw6ICcnLFxuICAgICAgICBhdmF0YXI6ICcnLFxuICAgICAgICB1c2VybmFtZTogJycsXG4gICAgICAgIGlkOiAtMSxcbiAgICAgICAgcGVybWFuZW50TGluazogZmFsc2VcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAkc2NvcGUuYWRkU01MaW5rID0gZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUudHJhY2suU01MaW5rcy5wdXNoKHtcbiAgICAgICAga2V5OiAnJyxcbiAgICAgICAgdmFsdWU6ICcnXG4gICAgICB9KTtcbiAgICB9O1xuICAgICRzY29wZS5yZW1vdmVTTUxpbmsgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9O1xuICAgICRzY29wZS5TTUxpbmtDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xuXG4gICAgICBmdW5jdGlvbiBnZXRMb2NhdGlvbihocmVmKSB7XG4gICAgICAgIHZhciBsb2NhdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgICAgICBsb2NhdGlvbi5ocmVmID0gaHJlZjtcbiAgICAgICAgaWYgKGxvY2F0aW9uLmhvc3QgPT0gXCJcIikge1xuICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSBsb2NhdGlvbi5ocmVmO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsb2NhdGlvbjtcbiAgICAgIH1cblxuICAgICAgdmFyIGxvY2F0aW9uID0gZ2V0TG9jYXRpb24oJHNjb3BlLnRyYWNrLlNNTGlua3NbaW5kZXhdLnZhbHVlKTtcbiAgICAgIHZhciBob3N0ID0gbG9jYXRpb24uaG9zdG5hbWUuc3BsaXQoJy4nKVswXTtcbiAgICAgIHZhciBmaW5kTGluayA9ICRzY29wZS50cmFjay5TTUxpbmtzLmZpbHRlcihmdW5jdGlvbihpdGVtKXtcbiAgICAgICAgcmV0dXJuIGl0ZW0ua2V5ID09PSBob3N0O1xuICAgICAgfSk7XG4gICAgICBpZihmaW5kTGluay5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgICRzY29wZS50cmFjay5TTUxpbmtzW2luZGV4XS5rZXkgPSBob3N0O1xuICAgIH07XG5cbiAgICAkc2NvcGUuc2F2ZURvd25sb2FkR2F0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCEkc2NvcGUudHJhY2sudHJhY2tJRCkge1xuICAgICAgICBhbGVydCgnVHJhY2sgTm90IEZvdW5kJyk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIC8vICRzY29wZS50cmFjay5zaG93RG93bmxvYWRUcmFja3MgPSAoJHNjb3BlLnRyYWNrLnNob3dEb3dubG9hZFRyYWNrcyA9PT0gdHJ1ZSkgPyAndXNlcicgOiAnbm9uZSc7XG5cbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgIHZhciBzZW5kT2JqID0gbmV3IEZvcm1EYXRhKCk7XG5cbiAgICAgIC8qIEFwcGVuZCBkYXRhIHRvIHNlbmRPYmogc3RhcnQgKi9cblxuICAgICAgLyogVHJhY2sgKi9cbiAgICAgIGZvciAodmFyIHByb3AgaW4gJHNjb3BlLnRyYWNrKSB7XG4gICAgICAgIHNlbmRPYmouYXBwZW5kKHByb3AsICRzY29wZS50cmFja1twcm9wXSk7XG4gICAgICB9XG5cbiAgICAgIC8qIGFydGlzdElEcyAqL1xuXG4gICAgICB2YXIgYXJ0aXN0cyA9ICRzY29wZS50cmFjay5hcnRpc3RzLmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHJldHVybiBpdGVtLmlkICE9PSAtMTtcbiAgICAgIH0pLm1hcChmdW5jdGlvbihpdGVtKXtcbiAgICAgICAgZGVsZXRlIGl0ZW1bJyQkaGFzaEtleSddO1xuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgIH0pXG4gICAgICBzZW5kT2JqLmFwcGVuZCgnYXJ0aXN0cycsIEpTT04uc3RyaW5naWZ5KGFydGlzdHMpKTtcbiAgICAgIFxuICAgICAgLyogcGVybWFuZW50TGlua3MgKi9cblxuICAgICAgLy8gdmFyIHBlcm1hbmVudExpbmtzID0gJHNjb3BlLnRyYWNrLnBlcm1hbmVudExpbmtzLmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAvLyAgIHJldHVybiBpdGVtLnVybCAhPT0gJyc7XG4gICAgICAvLyB9KS5tYXAoZnVuY3Rpb24oaXRlbSl7XG4gICAgICAvLyAgIHJldHVybiBpdGVtLnVybDtcbiAgICAgIC8vIH0pO1xuICAgICAgLy8gc2VuZE9iai5hcHBlbmQoJ3Blcm1hbmVudExpbmtzJywgSlNPTi5zdHJpbmdpZnkocGVybWFuZW50TGlua3MpKTtcblxuICAgICAgLyogU01MaW5rcyAqL1xuXG4gICAgICB2YXIgU01MaW5rcyA9IHt9O1xuICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIFNNTGlua3NbaXRlbS5rZXldID0gaXRlbS52YWx1ZTtcbiAgICAgIH0pO1xuICAgICAgc2VuZE9iai5hcHBlbmQoJ1NNTGlua3MnLCBKU09OLnN0cmluZ2lmeShTTUxpbmtzKSk7XG5cbiAgICAgICAvKiBDaGVjayBmb3IgcGxheWxpc3RzIGluIGNhc2Ugb2YgZWRpdCAqL1xuXG4gICAgICBpZigkc2NvcGUudHJhY2sucGxheWxpc3RzKSB7XG4gICAgICAgIHNlbmRPYmouYXBwZW5kKCdwbGF5bGlzdHMnLCBKU09OLnN0cmluZ2lmeSgkc2NvcGUudHJhY2sucGxheWxpc3RzKSk7XG4gICAgICB9XG5cbiAgICAgIC8qIEFwcGVuZCBkYXRhIHRvIHNlbmRPYmogZW5kICovXG5cbiAgICAgIHZhciBvcHRpb25zID0geyBcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIHVybDogJy9hcGkvZGF0YWJhc2UvZG93bmxvYWR1cmwnLFxuICAgICAgICBoZWFkZXJzOiB7J0NvbnRlbnQtVHlwZSc6IHVuZGVmaW5lZCB9LFxuICAgICAgICB0cmFuc2Zvcm1SZXF1ZXN0OiBhbmd1bGFyLmlkZW50aXR5LFxuICAgICAgICBkYXRhOiBzZW5kT2JqXG4gICAgICB9O1xuICAgICAgJGh0dHAob3B0aW9ucylcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgLy8gJHNjb3BlLnRyYWNrLnNob3dEb3dubG9hZFRyYWNrcyA9ICgkc2NvcGUudHJhY2suc2hvd0Rvd25sb2FkVHJhY2tzID09PSAndXNlcicpID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgICAgIC8vICRzY29wZS50cmFja0xpc3RPYmogPSBudWxsO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgaWYoJHN0YXRlUGFyYW1zLnN1Ym1pc3Npb24pIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygnYXJ0aXN0VG9vbHMuZG93bmxvYWRHYXRld2F5Lmxpc3QnLCB7ICdzdWJtaXNzaW9uJyA6ICRzdGF0ZVBhcmFtcy5zdWJtaXNzaW9uIH0pO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICAkc3RhdGUuZ28oJ2FydGlzdFRvb2xzLmRvd25sb2FkR2F0ZXdheS5saXN0Jyk7XG4gICAgICAgICAgLy8gaWYoJHNjb3BlLnRyYWNrLl9pZCkge1xuICAgICAgICAgIC8vICAgcmV0dXJuO1xuICAgICAgICAgIC8vIH1cbiAgICAgICAgICAvLyByZXNldERvd25sb2FkR2F0ZXdheSgpO1xuICAgICAgICAgIC8vICRzY29wZS5vcGVuTW9kYWwuZG93bmxvYWRVUkwocmVzLmRhdGEpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgIGFsZXJ0KFwiRVJST1I6IEVycm9yIGluIHNhdmluZyB1cmxcIik7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICRodHRwLnBvc3QoJy9hcGkvbG9nb3V0JykudGhlbihmdW5jdGlvbigpe1xuICAgICAgICBTZXNzaW9uU2VydmljZS5kZWxldGVVc2VyKCk7XG4gICAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAkc2NvcGUuc2hvd1Byb2ZpbGVJbmZvID0gZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUucHJvZmlsZS5kYXRhID0gSlNPTi5wYXJzZShTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkpO1xuICAgICAgaWYoKCRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3MgJiYgJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcy5sZW5ndGggPT09IDApIHx8ICEkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzKSB7XG4gICAgICAgICRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3MgPSBbe1xuICAgICAgICAgIHVybDogJycsXG4gICAgICAgICAgYXZhdGFyOiAnJyxcbiAgICAgICAgICB1c2VybmFtZTogJycsXG4gICAgICAgICAgaWQ6IC0xLFxuICAgICAgICAgIHBlcm1hbmVudExpbms6IHRydWVcbiAgICAgICAgfV07XG4gICAgICB9O1xuICAgICAgJHNjb3BlLnByb2ZpbGUuaXNBdmFpbGFibGUgPSB7fTtcbiAgICAgICRzY29wZS5wcm9maWxlLmlzQXZhaWxhYmxlLmVtYWlsID0gJHNjb3BlLnByb2ZpbGUuZGF0YS5lbWFpbCA/IHRydWUgOiBmYWxzZTtcbiAgICAgICRzY29wZS5wcm9maWxlLmlzQXZhaWxhYmxlLnBhc3N3b3JkID0gJHNjb3BlLnByb2ZpbGUuZGF0YS5wYXNzd29yZCA/IHRydWUgOiBmYWxzZTtcbiAgICAgICRzY29wZS5wcm9maWxlLmlzQXZhaWxhYmxlLnNvdW5kY2xvdWQgPSAkc2NvcGUucHJvZmlsZS5kYXRhLnNvdW5kY2xvdWQgPyB0cnVlIDogZmFsc2U7XG4gICAgICAkc2NvcGUucHJvZmlsZS5kYXRhLnBhc3N3b3JkID0gJyc7XG4gICAgfTtcblxuICAgICRzY29wZS5zYXZlUHJvZmlsZUluZm8gPSBmdW5jdGlvbigpIHtcblxuICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgIH07XG5cbiAgICAgIHZhciBwZXJtYW5lbnRMaW5rcyA9ICRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3MuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGl0ZW0uaWQgIT09IC0xO1xuICAgICAgfSkubWFwKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICBkZWxldGUgaXRlbVsnJCRoYXNoS2V5J107XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgfSk7XG5cbiAgICAgIHZhciBzZW5kT2JqID0ge1xuICAgICAgICBuYW1lOiAnJyxcbiAgICAgICAgcGFzc3dvcmQ6ICcnLFxuICAgICAgICBwZXJtYW5lbnRMaW5rczogSlNPTi5zdHJpbmdpZnkocGVybWFuZW50TGlua3MpXG4gICAgICB9XG4gICAgICBpZiAoJHNjb3BlLnByb2ZpbGUuZmllbGQgPT09ICduYW1lJykge1xuICAgICAgICBzZW5kT2JqLm5hbWUgPSAkc2NvcGUucHJvZmlsZS5kYXRhLm5hbWU7XG4gICAgICB9IGVsc2UgaWYgKCRzY29wZS5wcm9maWxlLmZpZWxkID09PSAncGFzc3dvcmQnKSB7XG4gICAgICAgIHNlbmRPYmoucGFzc3dvcmQgPSAkc2NvcGUucHJvZmlsZS5kYXRhLnBhc3N3b3JkO1xuICAgICAgfSBlbHNlIGlmICgkc2NvcGUucHJvZmlsZS5maWVsZCA9PT0gJ2VtYWlsJykge1xuICAgICAgICBzZW5kT2JqLmVtYWlsID0gJHNjb3BlLnByb2ZpbGUuZGF0YS5lbWFpbDtcbiAgICAgIH1cblxuICAgICAgQXJ0aXN0VG9vbHNTZXJ2aWNlXG4gICAgICAgIC5zYXZlUHJvZmlsZUluZm8oc2VuZE9iailcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgICBpZihyZXMuZGF0YSA9PT0gJ0VtYWlsIEVycm9yJykge1xuICAgICAgICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICAgICAgICAgIHZhbHVlOiAnRW1haWwgYWxyZWFkeSBleGlzdHMhJyxcbiAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlKHJlcy5kYXRhKTtcbiAgICAgICAgICAkc2NvcGUuY2xvc2VFZGl0UHJvZmlsZU1vZGFsKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcblxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnJlbW92ZVBlcm1hbmVudExpbmsgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH07XG5cbiAgICAkc2NvcGUuYWRkUGVybWFuZW50TGluayA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYoJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcy5sZW5ndGggPiAyKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcy5wdXNoKHtcbiAgICAgICAgdXJsOiAnJyxcbiAgICAgICAgYXZhdGFyOiAnJyxcbiAgICAgICAgdXNlcm5hbWU6ICcnLFxuICAgICAgICBpZDogLTEsXG4gICAgICAgIHBlcm1hbmVudExpbms6IHRydWVcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAkc2NvcGUucGVybWFuZW50TGlua1VSTENoYW5nZSA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICB2YXIgcGVybWFuZW50TGluayA9IHt9O1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgQXJ0aXN0VG9vbHNTZXJ2aWNlXG4gICAgICAgIC5yZXNvbHZlRGF0YSh7XG4gICAgICAgICAgdXJsOiAkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzW2luZGV4XS51cmxcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rc1tpbmRleF0uYXZhdGFyID0gcmVzLmRhdGEuYXZhdGFyX3VybCA/IHJlcy5kYXRhLmF2YXRhcl91cmwgOiAnJztcbiAgICAgICAgICAkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzW2luZGV4XS51c2VybmFtZSA9IHJlcy5kYXRhLnBlcm1hbGluaztcbiAgICAgICAgICAkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzW2luZGV4XS5pZCA9IHJlcy5kYXRhLmlkO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICBhbGVydCgnQXJ0aXN0cyBub3QgZm91bmQnKTtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnNhdmVTb3VuZENsb3VkQWNjb3VudEluZm8gPSBmdW5jdGlvbigpIHtcbiAgICAgIFNDLmNvbm5lY3QoKVxuICAgICAgICAudGhlbihzYXZlSW5mbylcbiAgICAgICAgLnRoZW4oaGFuZGxlUmVzcG9uc2UpXG4gICAgICAgIC5jYXRjaChoYW5kbGVFcnJvcik7XG5cbiAgICAgICAgZnVuY3Rpb24gc2F2ZUluZm8ocmVzKSB7XG4gICAgICAgICAgcmV0dXJuIEFydGlzdFRvb2xzU2VydmljZS5zYXZlU291bmRDbG91ZEFjY291bnRJbmZvKHtcbiAgICAgICAgICAgIHRva2VuOiByZXMub2F1dGhfdG9rZW5cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlcykge1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgaWYocmVzLnN0YXR1cyA9PT0gMjAwICYmIChyZXMuZGF0YS5zdWNjZXNzID09PSB0cnVlKSkge1xuICAgICAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlKHJlcy5kYXRhLmRhdGEpO1xuICAgICAgICAgICAgJHNjb3BlLnByb2ZpbGUuZGF0YSA9IHJlcy5kYXRhLmRhdGE7XG4gICAgICAgICAgICAkc2NvcGUucHJvZmlsZS5pc0F2YWlsYWJsZS5zb3VuZGNsb3VkID0gdHJ1ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICAgICAgICAgIHZhbHVlOiAnWW91IGFscmVhZHkgaGF2ZSBhbiBhY2NvdW50IHdpdGggdGhpcyBzb3VuZGNsb3VkIHVzZXJuYW1lJyxcbiAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyKSB7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAkc2NvcGUuZ2V0RG93bmxvYWRMaXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICBBcnRpc3RUb29sc1NlcnZpY2VcbiAgICAgICAgLmdldERvd25sb2FkTGlzdCgpXG4gICAgICAgIC50aGVuKGhhbmRsZVJlc3BvbnNlKVxuICAgICAgICAuY2F0Y2goaGFuZGxlRXJyb3IpO1xuXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlcykge1xuICAgICAgICAgICRzY29wZS5kb3dubG9hZEdhdGV3YXlMaXN0ID0gcmVzLmRhdGE7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihyZXMpIHtcblxuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8qIE1ldGhvZCBmb3IgZ2V0dGluZyBEb3dubG9hZEdhdGV3YXkgaW4gY2FzZSBvZiBlZGl0ICovXG5cbiAgICAkc2NvcGUuZ2V0RG93bmxvYWRHYXRld2F5ID0gZnVuY3Rpb24oZG93bmxvYWRHYXRlV2F5SUQpIHtcbiAgICAgIC8vIHJlc2V0RG93bmxvYWRHYXRld2F5KCk7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICBBcnRpc3RUb29sc1NlcnZpY2VcbiAgICAgICAgLmdldERvd25sb2FkR2F0ZXdheSh7XG4gICAgICAgICAgaWQ6IGRvd25sb2FkR2F0ZVdheUlEXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKGhhbmRsZVJlc3BvbnNlKVxuICAgICAgICAuY2F0Y2goaGFuZGxlRXJyb3IpO1xuXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlcykge1xuICAgICAgICAgIFxuICAgICAgICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gdHJ1ZTtcbiAgICAgICAgICAkc2NvcGUudHJhY2sgPSByZXMuZGF0YTtcblxuICAgICAgICAgIHZhciBTTUxpbmtzID0gcmVzLmRhdGEuU01MaW5rcyA/IHJlcy5kYXRhLlNNTGlua3MgOiB7fTtcbiAgICAgICAgICB2YXIgcGVybWFuZW50TGlua3MgPSByZXMuZGF0YS5wZXJtYW5lbnRMaW5rcyA/IHJlcy5kYXRhLnBlcm1hbmVudExpbmtzIDogWycnXTtcbiAgICAgICAgICB2YXIgU01MaW5rc0FycmF5ID0gW107XG4gICAgICAgICAgdmFyIHBlcm1hbmVudExpbmtzQXJyYXkgPSBbXTtcblxuICAgICAgICAgIGZvcih2YXIgbGluayBpbiBTTUxpbmtzKSB7XG4gICAgICAgICAgICBTTUxpbmtzQXJyYXkucHVzaCh7XG4gICAgICAgICAgICAgIGtleTogbGluayxcbiAgICAgICAgICAgICAgdmFsdWU6IFNNTGlua3NbbGlua11cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwZXJtYW5lbnRMaW5rcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pe1xuICAgICAgICAgICAgcGVybWFuZW50TGlua3NBcnJheS5wdXNoKHtcbiAgICAgICAgICAgICAgdXJsOiBpdGVtXG4gICAgICAgICAgICB9KVxuICAgICAgICAgIH0pO1xuICAgICAgICAgIGlmKCEkc2NvcGUudHJhY2suc2hvd0Rvd25sb2FkVHJhY2tzKSB7XG4gICAgICAgICAgICAkc2NvcGUudHJhY2suc2hvd0Rvd25sb2FkVHJhY2tzID0gJ3VzZXInO1xuICAgICAgICAgIH1cbiAgICAgICAgICAkc2NvcGUudHJhY2suU01MaW5rcyA9IFNNTGlua3NBcnJheTtcbiAgICAgICAgICAkc2NvcGUudHJhY2sucGVybWFuZW50TGlua3MgPSBwZXJtYW5lbnRMaW5rc0FycmF5O1xuICAgICAgICAgICRzY29wZS50cmFjay5wbGF5bGlzdElEUyA9IFtdOyBcbiAgICAgICAgICAvLyAkc2NvcGUudHJhY2suc2hvd0Rvd25sb2FkVHJhY2tzID0gKCRzY29wZS50cmFjay5zaG93RG93bmxvYWRUcmFja3MgPT09ICd1c2VyJykgPyB0cnVlIDogZmFsc2U7XG5cbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlRXJyb3IocmVzKSB7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAkc2NvcGUuZGVsZXRlRG93bmxvYWRHYXRld2F5ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgIGlmKGNvbmZpcm0oXCJEbyB5b3UgcmVhbGx5IHdhbnQgdG8gZGVsZXRlIHRoaXMgdHJhY2s/XCIpKSB7XG4gICAgICAgIHZhciBkb3dubG9hZEdhdGVXYXlJRCA9ICRzY29wZS5kb3dubG9hZEdhdGV3YXlMaXN0W2luZGV4XS5faWQ7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICAgQXJ0aXN0VG9vbHNTZXJ2aWNlXG4gICAgICAgICAgLmRlbGV0ZURvd25sb2FkR2F0ZXdheSh7XG4gICAgICAgICAgICBpZDogZG93bmxvYWRHYXRlV2F5SURcbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKGhhbmRsZVJlc3BvbnNlKVxuICAgICAgICAgIC5jYXRjaChoYW5kbGVFcnJvcik7XG5cbiAgICAgICAgICBmdW5jdGlvbiBoYW5kbGVSZXNwb25zZShyZXMpIHtcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAkc2NvcGUuZG93bmxvYWRHYXRld2F5TGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKHJlcykge1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgICRzY29wZS5nZXRUcmFja0xpc3RGcm9tU291bmRjbG91ZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHByb2ZpbGUgPSBKU09OLnBhcnNlKFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKSk7XG4gICAgICBpZihwcm9maWxlLnNvdW5kY2xvdWQpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgICBTQy5nZXQoJy91c2Vycy8nICsgcHJvZmlsZS5zb3VuZGNsb3VkLmlkICsgJy90cmFja3MnKVxuICAgICAgICAudGhlbihmdW5jdGlvbih0cmFja3MpIHtcbiAgICAgICAgICAkc2NvcGUudHJhY2tMaXN0ID0gdHJhY2tzO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5dKTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdob21lJywge1xuICAgICAgdXJsOiAnLycsXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvaG9tZS5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcbiAgICB9KVxuICAgIC5zdGF0ZSgnYWJvdXQnLCB7XG4gICAgICB1cmw6ICcvYWJvdXQnLFxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL3ZpZXdzL2Fib3V0Lmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJ1xuICAgIH0pXG4gICAgLnN0YXRlKCdzZXJ2aWNlcycsIHtcbiAgICAgIHVybDogJy9zZXJ2aWNlcycsXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3Mvc2VydmljZXMuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnSG9tZUNvbnRyb2xsZXInXG4gICAgfSlcbiAgICAuc3RhdGUoJ2ZhcXMnLCB7XG4gICAgICB1cmw6ICcvZmFxcycsXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvZmFxcy5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcbiAgICB9KVxuICAgIC5zdGF0ZSgnYXBwbHknLCB7XG4gICAgICB1cmw6ICcvYXBwbHknLFxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL3ZpZXdzL2FwcGx5Lmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJ1xuICAgIH0pXG4gICAgLnN0YXRlKCdjb250YWN0Jywge1xuICAgICAgdXJsOiAnL2NvbnRhY3QnLFxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL3ZpZXdzL2NvbnRhY3QuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnSG9tZUNvbnRyb2xsZXInXG4gICAgfSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0hvbWVDb250cm9sbGVyJywgWyckcm9vdFNjb3BlJyxcbiAgJyRzdGF0ZScsXG4gICckc2NvcGUnLFxuICAnJGh0dHAnLFxuICAnJGxvY2F0aW9uJyxcbiAgJyR3aW5kb3cnLFxuICAnSG9tZVNlcnZpY2UnLFxuICBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgJHdpbmRvdywgSG9tZVNlcnZpY2UpIHtcblxuICAgICRzY29wZS5hcHBsaWNhdGlvbk9iaiA9IHt9O1xuICAgICRzY29wZS5hcnRpc3QgPSB7fTtcbiAgICAkc2NvcGUuc2VudCA9IHtcbiAgICAgIGFwcGxpY2F0aW9uOiBmYWxzZSxcbiAgICAgIGFydGlzdEVtYWlsOiBmYWxzZVxuICAgIH07XG4gICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICBhcHBsaWNhdGlvbjoge1xuICAgICAgICB2YWw6ICcnLFxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgfSxcbiAgICAgIGFydGlzdEVtYWlsOiB7XG4gICAgICAgIHZhbDogJycsXG4gICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qIEFwcGx5IHBhZ2Ugc3RhcnQgKi9cblxuICAgICRzY29wZS50b2dnbGVBcHBsaWNhdGlvblNlbnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5tZXNzYWdlID0ge1xuICAgICAgICBhcHBsaWNhdGlvbjoge1xuICAgICAgICAgIHZhbDogJycsXG4gICAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5zZW50LmFwcGxpY2F0aW9uID0gISRzY29wZS5zZW50LmFwcGxpY2F0aW9uO1xuICAgIH07XG5cbiAgICAkc2NvcGUuc2F2ZUFwcGxpY2F0aW9uID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICRzY29wZS5tZXNzYWdlLmFwcGxpY2F0aW9uID0ge1xuICAgICAgICB2YWw6ICcnLFxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgfTtcblxuICAgICAgSG9tZVNlcnZpY2VcbiAgICAgICAgLnNhdmVBcHBsaWNhdGlvbigkc2NvcGUuYXBwbGljYXRpb25PYmopXG4gICAgICAgIC50aGVuKHNhdmVBcHBsaWNhdGlvblJlc3BvbnNlKVxuICAgICAgICAuY2F0Y2goc2F2ZUFwcGxpY2F0aW9uRXJyb3IpXG5cbiAgICAgIGZ1bmN0aW9uIHNhdmVBcHBsaWNhdGlvblJlc3BvbnNlKHJlcykge1xuICAgICAgICBpZiAocmVzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgJHNjb3BlLmFwcGxpY2F0aW9uT2JqID0ge307XG4gICAgICAgICAgJHNjb3BlLnNlbnQuYXBwbGljYXRpb24gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIHNhdmVBcHBsaWNhdGlvbkVycm9yKHJlcykge1xuICAgICAgICBpZihyZXMuc3RhdHVzID09PSA0MDApIHtcbiAgICAgICAgICAkc2NvcGUubWVzc2FnZS5hcHBsaWNhdGlvbiA9IHtcbiAgICAgICAgICAgIHZhbDogJ0VtYWlsIGFscmVhZHkgZXhpc3RzIScsXG4gICAgICAgICAgICB2aXNpYmxlOiB0cnVlXG4gICAgICAgICAgfTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgJHNjb3BlLm1lc3NhZ2UuYXBwbGljYXRpb24gPSB7XG4gICAgICAgICAgdmFsOiAnRXJyb3IgaW4gcHJvY2Vzc2luZyB5b3VyIHJlcXVlc3QnLFxuICAgICAgICAgIHZpc2libGU6IHRydWVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyogQXBwbHkgcGFnZSBlbmQgKi9cblxuICAgIC8qIEFydGlzdCBUb29scyBwYWdlIHN0YXJ0ICovXG4gICAgXG4gICAgJHNjb3BlLnRvZ2dsZUFydGlzdEVtYWlsID0gZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgICAgYXJ0aXN0RW1haWw6IHtcbiAgICAgICAgICB2YWw6ICcnLFxuICAgICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUuc2VudC5hcnRpc3RFbWFpbCA9ICEkc2NvcGUuc2VudC5hcnRpc3RFbWFpbDtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnNhdmVBcnRpc3RFbWFpbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgSG9tZVNlcnZpY2VcbiAgICAgICAgLnNhdmVBcnRpc3RFbWFpbCgkc2NvcGUuYXJ0aXN0KVxuICAgICAgICAudGhlbihhcnRpc3RFbWFpbFJlc3BvbnNlKVxuICAgICAgICAuY2F0Y2goYXJ0aXN0RW1haWxFcnJvcilcblxuICAgICAgZnVuY3Rpb24gYXJ0aXN0RW1haWxSZXNwb25zZShyZXMpIHtcbiAgICAgICAgaWYgKHJlcy5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICRzY29wZS5hcnRpc3QgPSB7fTtcbiAgICAgICAgICAkc2NvcGUuc2VudC5hcnRpc3RFbWFpbCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gYXJ0aXN0RW1haWxFcnJvcihyZXMpIHtcbiAgICAgICAgaWYocmVzLnN0YXR1cyA9PT0gNDAwKSB7XG4gICAgICAgICAgJHNjb3BlLm1lc3NhZ2UuYXJ0aXN0RW1haWwgPSB7XG4gICAgICAgICAgICB2YWw6ICdFbWFpbCBhbHJlYWR5IGV4aXN0cyEnLFxuICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZVxuICAgICAgICAgIH07XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgJHNjb3BlLm1lc3NhZ2UuYXJ0aXN0RW1haWwgPSB7XG4gICAgICAgICAgdmFsOiAnRXJyb3IgaW4gcHJvY2Vzc2luZyB5b3VyIHJlcXVlc3QnLFxuICAgICAgICAgIHZpc2libGU6IHRydWVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyogQXJ0aXN0IFRvb2xzIHBhZ2UgZW5kICovXG4gIH1cbl0pO1xuXG5hcHAuZGlyZWN0aXZlKCdhZmZpeGVyJywgZnVuY3Rpb24oJHdpbmRvdykge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnRUEnLFxuICAgIGxpbms6IGZ1bmN0aW9uKCRzY29wZSwgJGVsZW1lbnQpIHtcbiAgICAgIHZhciB3aW4gPSBhbmd1bGFyLmVsZW1lbnQoJHdpbmRvdyk7XG4gICAgICB2YXIgdG9wT2Zmc2V0ID0gJGVsZW1lbnRbMF0ub2Zmc2V0VG9wO1xuXG4gICAgICBmdW5jdGlvbiBhZmZpeEVsZW1lbnQoKSB7XG5cbiAgICAgICAgaWYgKCR3aW5kb3cucGFnZVlPZmZzZXQgPiB0b3BPZmZzZXQpIHtcbiAgICAgICAgICAkZWxlbWVudC5jc3MoJ3Bvc2l0aW9uJywgJ2ZpeGVkJyk7XG4gICAgICAgICAgJGVsZW1lbnQuY3NzKCd0b3AnLCAnMy41JScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICRlbGVtZW50LmNzcygncG9zaXRpb24nLCAnJyk7XG4gICAgICAgICAgJGVsZW1lbnQuY3NzKCd0b3AnLCAnJyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgJHNjb3BlLiRvbignJHJvdXRlQ2hhbmdlU3RhcnQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgd2luLnVuYmluZCgnc2Nyb2xsJywgYWZmaXhFbGVtZW50KTtcbiAgICAgIH0pO1xuICAgICAgd2luLmJpbmQoJ3Njcm9sbCcsIGFmZml4RWxlbWVudCk7XG4gICAgfVxuICB9O1xufSkiLCJcblxuYXBwLnNlcnZpY2UoJ0FydGlzdFRvb2xzU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbigkaHR0cCl7XG5cblx0ZnVuY3Rpb24gcmVzb2x2ZURhdGEoZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIGRhdGEpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0RG93bmxvYWRMaXN0KCkge1xuXHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZGF0YWJhc2UvZG93bmxvYWR1cmwnKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGdldERvd25sb2FkR2F0ZXdheShkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS9kYXRhYmFzZS9kb3dubG9hZHVybC8nICsgZGF0YS5pZCk7XG5cdH1cblxuXHRmdW5jdGlvbiBkZWxldGVEb3dubG9hZEdhdGV3YXkoZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL2Rvd25sb2FkdXJsL2RlbGV0ZScsIGRhdGEpO1xuXHR9XG5cblx0ZnVuY3Rpb24gc2F2ZVByb2ZpbGVJbmZvKGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS9wcm9maWxlL2VkaXQnLCBkYXRhKTtcblx0fVxuXG5cdGZ1bmN0aW9uIHNhdmVTb3VuZENsb3VkQWNjb3VudEluZm8oZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL3Byb2ZpbGUvc291bmRjbG91ZCcsIGRhdGEpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0VHJhY2tMaXN0RnJvbVNvdW5kY2xvdWQoZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL3RyYWNrcy9saXN0JywgZGF0YSk7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHJlc29sdmVEYXRhOiByZXNvbHZlRGF0YSxcblx0XHRnZXREb3dubG9hZExpc3Q6IGdldERvd25sb2FkTGlzdCxcblx0XHRnZXREb3dubG9hZEdhdGV3YXk6IGdldERvd25sb2FkR2F0ZXdheSxcblx0XHRzYXZlUHJvZmlsZUluZm86IHNhdmVQcm9maWxlSW5mbyxcblx0XHRkZWxldGVEb3dubG9hZEdhdGV3YXk6IGRlbGV0ZURvd25sb2FkR2F0ZXdheSxcblx0XHRzYXZlU291bmRDbG91ZEFjY291bnRJbmZvOiBzYXZlU291bmRDbG91ZEFjY291bnRJbmZvLFxuXHRcdGdldFRyYWNrTGlzdEZyb21Tb3VuZGNsb3VkOiBnZXRUcmFja0xpc3RGcm9tU291bmRjbG91ZFxuXHR9O1xufV0pO1xuIiwiXG5cbmFwcC5zZXJ2aWNlKCdIb21lU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbigkaHR0cCl7XG5cdFxuXHRmdW5jdGlvbiBzYXZlQXBwbGljYXRpb24oZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2hvbWUvYXBwbGljYXRpb24nLCBkYXRhKTtcblx0fVxuXG5cdGZ1bmN0aW9uIHNhdmVBcnRpc3RFbWFpbChkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvaG9tZS9hcnRpc3RlbWFpbCcsIGRhdGEpO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRzYXZlQXBwbGljYXRpb246IHNhdmVBcHBsaWNhdGlvbixcblx0XHRzYXZlQXJ0aXN0RW1haWw6IHNhdmVBcnRpc3RFbWFpbFxuXHR9O1xufV0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncHJlbWllcicsIHtcbiAgICB1cmw6ICcvcHJlbWllcicsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9wcmVtaWVyL3ZpZXdzL3ByZW1pZXIuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ1ByZW1pZXJDb250cm9sbGVyJ1xuICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignUHJlbWllckNvbnRyb2xsZXInLCBbJyRyb290U2NvcGUnLFxuICAnJHN0YXRlJyxcbiAgJyRzY29wZScsXG4gICckaHR0cCcsXG4gICckbG9jYXRpb24nLFxuICAnJHdpbmRvdycsXG4gICdQcmVtaWVyU2VydmljZScsXG4gIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uLCAkd2luZG93LCBQcmVtaWVyU2VydmljZSkge1xuXG4gICAgJHNjb3BlLmdlbnJlQXJyYXkgPSBbXG4gICAgICAnQWx0ZXJuYXRpdmUgUm9jaycsXG4gICAgICAnQW1iaWVudCcsXG4gICAgICAnQ3JlYXRpdmUnLFxuICAgICAgJ0NoaWxsJyxcbiAgICAgICdDbGFzc2ljYWwnLFxuICAgICAgJ0NvdW50cnknLFxuICAgICAgJ0RhbmNlICYgRURNJyxcbiAgICAgICdEYW5jZWhhbGwnLFxuICAgICAgJ0RlZXAgSG91c2UnLFxuICAgICAgJ0Rpc2NvJyxcbiAgICAgICdEcnVtICYgQmFzcycsXG4gICAgICAnRHVic3RlcCcsXG4gICAgICAnRWxlY3Ryb25pYycsXG4gICAgICAnRmVzdGl2YWwnLFxuICAgICAgJ0ZvbGsnLFxuICAgICAgJ0hpcC1Ib3AvUk5CJyxcbiAgICAgICdIb3VzZScsXG4gICAgICAnSW5kaWUvQWx0ZXJuYXRpdmUnLFxuICAgICAgJ0xhdGluJyxcbiAgICAgICdUcmFwJyxcbiAgICAgICdWb2NhbGlzdHMvU2luZ2VyLVNvbmd3cml0ZXInXG4gICAgXTtcblxuICAgICRzY29wZS5wcmVtaWVyT2JqID0ge307XG4gICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICB2YWw6ICcnLFxuICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICB9O1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG5cbiAgICAkc2NvcGUuc2F2ZVByZW1pZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICRzY29wZS5tZXNzYWdlLnZpc2libGUgPSBmYWxzZTtcbiAgICAgIHZhciBkYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgICBmb3IgKHZhciBwcm9wIGluICRzY29wZS5wcmVtaWVyT2JqKSB7XG4gICAgICAgIGRhdGEuYXBwZW5kKHByb3AsICRzY29wZS5wcmVtaWVyT2JqW3Byb3BdKTtcbiAgICAgIH1cbiAgICAgIFByZW1pZXJTZXJ2aWNlXG4gICAgICAgIC5zYXZlUHJlbWllcihkYXRhKVxuICAgICAgICAudGhlbihyZWNlaXZlUmVzcG9uc2UpXG4gICAgICAgIC5jYXRjaChjYXRjaEVycm9yKTtcblxuICAgICAgZnVuY3Rpb24gcmVjZWl2ZVJlc3BvbnNlKHJlcykge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICBpZiAocmVzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgJHNjb3BlLm1lc3NhZ2UudmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgJHNjb3BlLm1lc3NhZ2UudmFsID0gJ1RoYW5rIHlvdSEgWW91ciBtZXNzYWdlIGhhcyBiZWVuIHNlbnQgc3VjY2Vzc2Z1bGx5Lic7XG4gICAgICAgICAgJHNjb3BlLnByZW1pZXJPYmogPSB7fTtcbiAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoXCJpbnB1dFt0eXBlPSdmaWxlJ11cIikudmFsKG51bGwpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAkc2NvcGUubWVzc2FnZS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgJHNjb3BlLm1lc3NhZ2UudmFsID0gJ0Vycm9yIGluIHByb2Nlc3NpbmcgdGhlIHJlcXVlc3QuIFBsZWFzZSB0cnkgYWdhaW4uJztcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY2F0Y2hFcnJvcihyZXMpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgaWYgKHJlcy5zdGF0dXMgPT09IDQwMCkge1xuICAgICAgICAgICRzY29wZS5tZXNzYWdlID0ge1xuICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbDogcmVzLmRhdGFcbiAgICAgICAgICB9O1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgICAgICB2aXNpYmxlOiB0cnVlLFxuICAgICAgICAgIHZhbDogJ0Vycm9yIGluIHByb2Nlc3NpbmcgdGhlIHJlcXVlc3QuIFBsZWFzZSB0cnkgYWdhaW4uJ1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH07XG4gIH1cbl0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3N1Ym1pc3Npb25zJywge1xuICAgIHVybDogJy9zdWJtaXNzaW9ucycsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9zdWJtaXNzaW9ucy92aWV3cy9zdWJtaXNzaW9ucy5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnU3VibWlzc2lvbkNvbnRyb2xsZXInXG4gIH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ1N1Ym1pc3Npb25Db250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCBBdXRoU2VydmljZSwgb0VtYmVkRmFjdG9yeSkge1xuICAgJHNjb3BlLmNvdW50ZXIgPSAwO1xuICAgJHNjb3BlLnNob3dpbmdFbGVtZW50cyA9IFtdO1xuICAgJHNjb3BlLnN1Ym1pc3Npb25zID0gW107XG4gICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgJGh0dHAuZ2V0KCcvYXBpL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4nO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIGFsZXJ0KCdXcm9uZyBQYXNzd29yZCcpO1xuICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmxvYWRTdWJtaXNzaW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5nZXQoJy9hcGkvc3VibWlzc2lvbnMvdW5hY2NlcHRlZCcpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHNjb3BlLnN1Ym1pc3Npb25zID0gcmVzLmRhdGE7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlcy5kYXRhKTtcbiAgICAgICAgJHNjb3BlLmxvYWRNb3JlKCk7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvY2hhbm5lbHMnKTtcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHNjb3BlLmNoYW5uZWxzID0gcmVzLmRhdGE7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIGFsZXJ0KCdFcnJvcjogQ291bGQgbm90IGdldCBjaGFubmVscy4nKVxuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUubG9hZE1vcmUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbG9hZEVsZW1lbnRzID0gW107XG4gICAgZm9yIChsZXQgaSA9ICRzY29wZS5jb3VudGVyOyBpIDwgJHNjb3BlLmNvdW50ZXIgKyAxNTsgaSsrKSB7XG4gICAgICB2YXIgc3ViID0gJHNjb3BlLnN1Ym1pc3Npb25zW2ldO1xuICAgICAgaWYoc3ViKXtcbiAgICAgICRzY29wZS5zaG93aW5nRWxlbWVudHMucHVzaChzdWIpO1xuICAgICAgbG9hZEVsZW1lbnRzLnB1c2goc3ViKTtcbiAgICB9XG4gICAgfVxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBjb25zb2xlLmxvZyhsb2FkRWxlbWVudHMpO1xuICAgICAgbG9hZEVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oc3ViKSB7XG4gICAgICAgIG9FbWJlZEZhY3RvcnkuZW1iZWRTb25nKHN1Yik7XG4gICAgICB9LCA1MClcbiAgICB9KTtcbiAgICAkc2NvcGUuY291bnRlciArPSAxNTtcbiAgfVxuXG4gICRzY29wZS5jaGFuZ2VCb3ggPSBmdW5jdGlvbihzdWIsIGNoYW4pIHtcbiAgICB2YXIgaW5kZXggPSBzdWIuY2hhbm5lbElEUy5pbmRleE9mKGNoYW4uY2hhbm5lbElEKTtcbiAgICBpZiAoaW5kZXggPT0gLTEpIHtcbiAgICAgIHN1Yi5jaGFubmVsSURTLnB1c2goY2hhbi5jaGFubmVsSUQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdWIuY2hhbm5lbElEUy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuXG4gICRzY29wZS5zYXZlID0gZnVuY3Rpb24oc3VibWkpIHtcbiAgICBpZiAoc3VibWkuY2hhbm5lbElEUy5sZW5ndGggPT0gMCkge1xuICAgICAgJHNjb3BlLmRlY2xpbmUoc3VibWkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdWJtaS5wYXNzd29yZCA9ICRyb290U2NvcGUucGFzc3dvcmQ7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAkaHR0cC5wdXQoXCIvYXBpL3N1Ym1pc3Npb25zL3NhdmVcIiwgc3VibWkpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHN1Yikge1xuICAgICAgICAgICRzY29wZS5zaG93aW5nRWxlbWVudHMuc3BsaWNlKCRzY29wZS5zaG93aW5nRWxlbWVudHMuaW5kZXhPZihzdWJtaSksIDEpO1xuICAgICAgICAgIHdpbmRvdy5hbGVydChcIlNhdmVkXCIpO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgd2luZG93LmFsZXJ0KFwiRVJST1I6IGRpZCBub3QgU2F2ZVwiKVxuICAgICAgICB9KVxuICAgIH1cbiAgfVxuXG4gICRzY29wZS5pZ25vcmUgPSBmdW5jdGlvbihzdWJtaXNzaW9uKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLmRlbGV0ZSgnL2FwaS9zdWJtaXNzaW9ucy9pZ25vcmUvJyArIHN1Ym1pc3Npb24uX2lkICsgJy8nICsgJHJvb3RTY29wZS5wYXNzd29yZClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICB2YXIgaW5kZXggPSAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLmluZGV4T2Yoc3VibWlzc2lvbik7XG4gICAgICAgICRzY29wZS5zaG93aW5nRWxlbWVudHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgd2luZG93LmFsZXJ0KFwiSWdub3JlZFwiKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgd2luZG93LmFsZXJ0KFwiRVJST1I6IGRpZCBub3QgSWdub3JlXCIpO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUuZGVjbGluZSA9IGZ1bmN0aW9uKHN1Ym1pc3Npb24pIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAuZGVsZXRlKCcvYXBpL3N1Ym1pc3Npb25zL2RlY2xpbmUvJyArIHN1Ym1pc3Npb24uX2lkICsgJy8nICsgJHJvb3RTY29wZS5wYXNzd29yZClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICB2YXIgaW5kZXggPSAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLmluZGV4T2Yoc3VibWlzc2lvbik7XG4gICAgICAgICRzY29wZS5zaG93aW5nRWxlbWVudHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgd2luZG93LmFsZXJ0KFwiRGVjbGluZWRcIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2VcbiAgICAgIH0pXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgd2luZG93LmFsZXJ0KFwiRVJST1I6IGRpZCBub3QgRGVjbGluZVwiKTtcbiAgICAgIH0pO1xuICB9XG59KTsiLCJcblxuYXBwLnNlcnZpY2UoJ1ByZW1pZXJTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKXtcblx0XG5cdGZ1bmN0aW9uIHNhdmVQcmVtaWVyKGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAoe1xuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHR1cmw6ICcvYXBpL3ByZW1pZXInLFxuXHRcdFx0aGVhZGVyczogeydDb250ZW50LVR5cGUnOiB1bmRlZmluZWQgfSxcblx0XHRcdHRyYW5zZm9ybVJlcXVlc3Q6IGFuZ3VsYXIuaWRlbnRpdHksXG5cdFx0XHRkYXRhOiBkYXRhXG5cdFx0fSk7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHNhdmVQcmVtaWVyOiBzYXZlUHJlbWllclxuXHR9O1xufV0pO1xuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
