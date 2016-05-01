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

app.filter('calculateDiscount', function () {
  return function (input) {
    return parseFloat(input * 0.90).toFixed(2);
  };
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

  $scope.addToCart = function (channel) {
    console.log($scope.selectedChannels);
    if (channel.addtocart) {
      $scope.total = $scope.total - channel.price;
    } else {
      $scope.total += channel.price;
    }

    $scope.selectedChannels[channel.displayName] = $scope.selectedChannels[channel.displayName] == true ? false : true;

    channel.addtocart = channel.addtocart ? false : true;
    console.log($scope.total);
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
  }).then(null, function (err) {
    alert('There was an error processing your request');
  });
});
app.config(function ($stateProvider) {
  $stateProvider.state('scheduler', {
    url: '/scheduler',
    templateUrl: 'js/scheduler/scheduler.html',
    controller: 'SchedulerController'
  });
});

app.controller('SchedulerController', function ($rootScope, $state, $scope, $http, AuthService, $window) {

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
      if (res.data.user) $scope.makeEvent.artistName = res.data.user.username;
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

  $scope.emailSlot = function () {
    var mailto_link = "mailto:coayscue@gmail.com?subject=Repost of " + $scope.makeEvent.title + '&body=Hey ' + $scope.makeEvent.artistName + ',\n\n I am reposting your song ' + $scope.makeEvent.title + ' on ' + $scope.channel.displayName + ' on ' + $scope.makeEvent.day.toLocaleDateString() + '.\n\n Best, \n' + $scope.channel.displayName;
    location.href = encodeURI(mailto_link);
  };

  // $scope.scEmailSlot = function() {

  // }

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
    $http.post('/api/soundcloud/resolve', {
      url: $scope.newQueueSong
    }).then(function (res) {
      $scope.processing = false;
      var track = res.data;
      $scope.newQueueID = track.id;
    }).then(null, function (err) {
      alert("error getting song");
      $scope.processing = false;
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
  $stateProvider.state('SCResolve', {
    url: '/scresolve',
    templateUrl: 'js/artistTools/SCResolve/SCResolve.html',
    controller: 'SCResolveController'
  });
});

app.controller('SCResolveController', function ($scope, $http) {
  $scope.response = {};
  $scope.resolve = function () {
    $http.post('/api/soundcloud/resolve', {
      url: $scope.url
    }).then(function (res) {
      $scope.response = JSON.stringify(res.data, null, "\t");
      console.log($scope.response);
    }).then(null, function (err) {
      $scope.response = JSON.stringify(err, null, "\t");
    });
  };
});
app.config(function ($stateProvider) {
  $stateProvider.state('reForReInteraction', {
    url: '/artistTools/reForReInteraction',
    params: {
      submission: null
    },
    templateUrl: 'js/artistTools/reForRe/reForReInteraction.html',
    controller: 'ReForReInteractionController'
  });
});

app.controller("ReForReInteractionController", function () {});
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
        $state.go('artistToolsDownloadGatewayList');
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
        $state.go('artistToolsDownloadGatewayNew', {
          'submission': $stateParams.submission
        });
        return;
      }
      $state.go('artistToolsDownloadGatewayList');
    }).then(null, function (err) {
      console.log(err);
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
    DownloadTrackService.getDownloadTrack(trackID).then(receiveDownloadTrack).then(receiveRecentTracks).then(initPlay)['catch'](catchDownloadTrackError);

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
  }).state('artistToolsProfile', {
    url: '/profile',
    templateUrl: 'js/home/views/artistTools/profile.html',
    controller: 'ArtistToolsController'
  }).state('artistToolsDownloadGatewayList', {
    url: '/download-gateway',
    params: {
      submission: null
    },
    templateUrl: 'js/home/views/artistTools/downloadGateway.list.html',
    controller: 'ArtistToolsController'
  });
});

app.controller('ArtistToolsController', function ($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, SessionService, ArtistToolsService) {
  $scope.user = JSON.parse(SessionService.getUser());

  /* Init boolean variables for show/hide and other functionalities */

  $scope.processing = false;
  $scope.isTrackAvailable = false;
  $scope.message = {
    val: '',
    visible: false
  };

  /* Init downloadGateway list */

  $scope.downloadGatewayList = [];

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
        controller: 'OpenThankYouModalController',
        scope: $scope
      });
    }
  };
  $scope.closeThankYouModal = function () {
    $scope.thankYouModalInstance.close();
  };
  /* Init profile */
  $scope.profile = {};

  $scope.logout = function () {
    $http.post('/api/logout').then(function () {
      SessionService.deleteUser();
      $state.go('login');
      window.location.href = '/login';
    });
  };

  console.log($stateParams.submission);
  if ($stateParams.submission) {
    $scope.openThankYouModal.thankYou($stateParams.submission._id);
  }

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

    $scope.processing = true;
    ArtistToolsService.saveProfileInfo(sendObj).then(function (res) {
      $scope.processing = false;
      if (res.data === 'Email Error') {
        $scope.message = {
          value: 'Email already exists!',
          visible: true
        };
        return;
      }
      SessionService.create(res.data);
      $scope.closeEditProfileModal();
    })['catch'](function (res) {
      $scope.processing = false;
      alert('error saving');
    });
  };

  $scope.removePermanentLink = function (index) {
    $scope.profile.data.permanentLinks.splice(index, 1);
  };
  $scope.hidebutton = false;
  $scope.addPermanentLink = function () {

    if ($scope.profile.data.permanentLinks.length >= 2 && !$scope.user.admin) {
      $scope.hidebutton = true;
    }

    if ($scope.profile.data.permanentLinks.length > 2 && !$scope.user.admin) {
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

    function handleError(err) {
      console.log(err);
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
}).controller('OpenThankYouModalController', function ($scope) {});
app.config(function ($stateProvider) {
  $stateProvider.state('artistToolsDownloadGatewayEdit', {
    url: '/download-gateway/edit/:gatewayID',
    templateUrl: 'js/home/views/artistTools/downloadGateway.html',
    controller: 'ArtistToolsDownloadGatewayController'
  }).state('artistToolsDownloadGatewayNew', {
    url: '/download-gateway/new',
    params: {
      submission: null
    },
    templateUrl: 'js/home/views/artistTools/downloadGateway.html',
    controller: 'ArtistToolsDownloadGatewayController'
  });
});

app.controller('ArtistToolsDownloadGatewayController', function ($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, SessionService, ArtistToolsService) {
  /* Init Download Gateway form data */
  $scope.user = JSON.parse(SessionService.getUser());

  $scope.track = {
    artistUsername: '',
    trackTitle: '',
    trackArtworkURL: '',
    SMLinks: [],
    like: false,
    comment: false,
    repost: false,
    artists: [],
    showDownloadTracks: 'user',
    admin: $scope.user.admin,
    file: {}
  };
  $scope.profile = {};
  /* Init track list and trackListObj*/
  $scope.trackList = [];
  $scope.trackListObj = null;

  /* Method for resetting Download Gateway form */

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

  $scope.removeSMLink = function (index) {
    $scope.track.SMLinks.splice(index, 1);
  };

  $scope.saveDownloadGate = function () {
    if (!($scope.track.downloadURL || $scope.track.file.name)) {
      alert('Enter a download file');
      return false;
    }

    if (!$scope.track.trackID) {
      alert('Track Not Found');
      return false;
    }
    $scope.processing = true;
    var sendObj = new FormData();
    for (var prop in $scope.track) {
      sendObj.append(prop, $scope.track[prop]);
    }
    var artists = $scope.track.artists.filter(function (item) {
      return item.id !== -1;
    }).map(function (item) {
      delete item['$$hashKey'];
      return item;
    });
    sendObj.append('artists', JSON.stringify(artists));
    var SMLinks = {};
    $scope.track.SMLinks.forEach(function (item) {
      SMLinks[item.key] = item.value;
    });
    sendObj.append('SMLinks', JSON.stringify(SMLinks));
    if ($scope.track.playlists) {
      sendObj.append('playlists', JSON.stringify($scope.track.playlists));
    }

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
      if ($stateParams.submission) {
        $state.go('artistToolsDownloadGatewayList', {
          'submission': $stateParams.submission
        });
      } else {
        $state.go('artistToolsDownloadGatewayList');
      }
    }).then(null, function (err) {
      $scope.processing = false;
      alert("ERROR: Error in saving url");
      $scope.processing = false;
    });
  };

  $scope.checkIfEdit = function () {
    if ($stateParams.gatewayID) {
      $scope.getDownloadGateway($stateParams.gatewayID);
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

  $scope.checkIfSubmission = function () {
    if ($stateParams.submission) {
      if ($state.includes('artistToolsDownloadGatewayNew')) {
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
        $scope.track.artistArtworkURL = res.data.user.avatar_url ? res.data.user.avatar_url.replace('large.jpg', 't500x500.jpg') : '';
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

  $scope.addSMLink = function () {
    $scope.track.SMLinks.push({
      key: '',
      value: ''
    });
  };

  $scope.clearOrFile = function () {
    if ($scope.track.downloadURL) {
      angular.element("input[type='file']").val(null);
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
    $scope.track.artists.push({
      url: '',
      avatar: '',
      username: '',
      id: -1,
      permanentLink: false
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
      console.log($scope.track);
      $scope.processing = false;
    }

    function handleError(res) {
      $scope.processing = false;
    }
  };

  $scope.clearOrInput = function () {
    $scope.track.downloadURL = "";
  };

  $scope.$watch('track', function (newVal, oldVal) {
    if (newVal.trackTitle) window.localStorage.setItem('trackPreviewData', JSON.stringify(newVal));
  }, true);
});
app.config(function ($stateProvider) {
  $stateProvider.state('artistToolsDownloadGatewayPreview', {
    url: '/download-gateway/preview',
    params: {
      submission: null
    },
    templateUrl: 'js/home/views/artistTools/preview.html',
    controller: 'ArtistToolsPreviewController'
  });
});

app.controller("ArtistToolsPreviewController", function ($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, SessionService, ArtistToolsService) {
  var track = JSON.parse(window.localStorage.getItem('trackPreviewData'));
  console.log(track);
  if (!track.trackTitle) {
    alert('Track Not Found');
    $state.go("artistToolsDownloadGatewayList");
    return false;
  }

  $scope.track = track;
  $scope.player = {};
  SC.stream('/tracks/' + $scope.track.trackID).then(function (p) {
    $scope.player = p;
  });

  $scope.toggle = true;
  $scope.togglePlay = function () {
    $scope.toggle = !$scope.toggle;
    if ($scope.toggle) {
      $scope.player.pause();
    } else {
      $scope.player.play();
    }
  };
  $scope.nodl = function () {
    alert('No download in preview mode.');
  };
});
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
  $stateProvider.state('premiere', {
    url: '/premiere',
    templateUrl: 'js/premiere/views/premiere.html',
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
app.service('PremierService', ['$http', function ($http) {

  function savePremier(data) {
    return $http({
      method: 'POST',
      url: '/api/premier',
      headers: {
        'Content-Type': undefined
      },
      transformRequest: angular.identity,
      data: data
    });
  }

  return {
    savePremier: savePremier
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

  $scope.youtube = function (submission) {
    $scope.processing = true;
    $http.post('/api/submissions/youtubeInquiry', submission).then(function (res) {
      $scope.processing = false;
      window.alert('Sent to Zach');
    });
  };

  $scope.sendMore = function (submission) {
    $scope.processing = true;
    $http.post('/api/submissions/sendMoreInquiry', submission).then(function (res) {
      $scope.processing = false;
      window.alert('Sent Email');
    });
  };
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImRhdGFiYXNlL2RhdGFiYXNlLmpzIiwiZnNhL2ZzYS1wcmUtYnVpbHQuanMiLCJsb2dpbi9sb2dpbi5qcyIsImxvZ2luL29FbWJlZEZhY3RvcnkuanMiLCJwYXkvcGF5LmpzIiwicGF5L3RoYW5reW91LmpzIiwic2NoZWR1bGVyL3NjaGVkdWxlci5qcyIsInN1Ym1pdC9zdWJtaXQuanMiLCJhcnRpc3RUb29scy9TQ1Jlc29sdmUvU0NSZXNvbHZlLmpzIiwiYXJ0aXN0VG9vbHMvcmVGb3JSZS9yZUZvclJlSW50ZXJhY3Rpb24uanMiLCJhdXRoL2NvbnRyb2xsZXJzL2F1dGhDb250cm9sbGVyLmpzIiwiYXV0aC9zZXJ2aWNlcy9hdXRoU2VydmljZS5qcyIsImF1dGgvc2VydmljZXMvc2Vzc2lvblNlcnZpY2UuanMiLCJkYXRhYmFzZS9hdXRvRW1haWxzL2F1dG9FbWFpbHMuanMiLCJkYXRhYmFzZS9hdXRvRW1haWxzL2F1dG9FbWFpbHNMaXN0LmpzIiwiZG93bmxvYWRUcmFjay9jb250cm9sbGVycy9hZG1pbkRMR2F0ZS5qcyIsImRvd25sb2FkVHJhY2svY29udHJvbGxlcnMvZG93bmxvYWRUcmFja0NvbnRyb2xsZXIuanMiLCJkb3dubG9hZFRyYWNrL3NlcnZpY2VzL2FkbWluRExHYXRlU2VydmljZS5qcyIsImRvd25sb2FkVHJhY2svc2VydmljZXMvZG93bmxvYWRUcmFja1NlcnZpY2UuanMiLCJob21lL2NvbnRyb2xsZXJzL2FydGlzdFRvb2xzQ29udHJvbGxlci5qcyIsImhvbWUvY29udHJvbGxlcnMvYXJ0aXN0VG9vbHNEb3dubG9hZEdhdHdheS5qcyIsImhvbWUvY29udHJvbGxlcnMvYXJ0aXN0VG9vbHNQcmV2aWV3Q29udHJvbGxlci5qcyIsImhvbWUvY29udHJvbGxlcnMvaG9tZUNvbnRyb2xsZXIuanMiLCJob21lL3NlcnZpY2VzL2FydGlzdHNUb29sc1NlcnZpY2UuanMiLCJob21lL3NlcnZpY2VzL2hvbWVTZXJ2aWNlLmpzIiwicHJlbWllcmUvY29udHJvbGxlcnMvcHJlbWllcmVDb250cm9sbGVyLmpzIiwicHJlbWllcmUvc2VydmljZXMvcHJlbWllcmVTZXJ2aWNlLmpzIiwic3VibWlzc2lvbnMvY29udHJvbGxlcnMvc3VibWlzc2lvbkNvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBQSxDQUFBO0FBQ0EsTUFBQSxDQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLHVCQUFBLEVBQUEsQ0FBQSxhQUFBLEVBQUEsV0FBQSxFQUFBLGNBQUEsRUFBQSxXQUFBLEVBQUEsV0FBQSxFQUFBLHdCQUFBLENBQUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxrQkFBQSxFQUFBLGlCQUFBLEVBQUEscUJBQUEsRUFBQTs7QUFFQSxtQkFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTs7QUFFQSxvQkFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTs7Q0FFQSxDQUFBLENBQUE7OztBQUdBLEdBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQSxhQUFBLEVBQUEsY0FBQSxFQUFBLFNBQUEsRUFBQTs7Ozs7O0FBTUEsV0FBQSxDQUFBLFdBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTs7QUFFQSxhQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTs7R0FFQSxDQUFBLENBQUE7Ozs7QUFJQSxZQUFBLENBQUEsR0FBQSxDQUFBLG1CQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLFFBQUEsRUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUdBLEdBQUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxFQUFBLENBQUEsWUFBQTtBQUNBLFNBQUE7QUFDQSxTQUFBLEVBQUE7QUFDQSxjQUFBLEVBQUEsR0FBQTtBQUNBLGFBQUEsRUFBQSxHQUFBO0tBQ0E7QUFDQSxRQUFBLEVBQUEsY0FBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLFVBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLFVBQUEsV0FBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLE1BQUEsQ0FBQSxZQUFBO0FBQ0EsZUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLG1CQUFBLEVBQUEsS0FBQTtBQUNBLGVBQUEsRUFBQSxFQUFBO1dBQ0EsQ0FBQTs7QUFFQSxjQUFBLFdBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxZQUFBLElBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxJQUFBLFdBQUEsRUFBQTtBQUNBLGlCQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EscUJBQUEsRUFBQSxJQUFBO0FBQ0EsaUJBQUEsRUFBQSx1Q0FBQTthQUNBLENBQUE7QUFDQSxtQkFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLG1CQUFBO1dBQ0E7O0FBRUEsY0FBQSxXQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLEdBQUEsRUFBQSxHQUFBLElBQUEsR0FBQSxJQUFBLEVBQUE7QUFDQSxpQkFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLHFCQUFBLEVBQUEsSUFBQTtBQUNBLGlCQUFBLEVBQUEsNENBQUE7YUFDQSxDQUFBO0FBQ0EsbUJBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxtQkFBQTtXQUNBO0FBQ0EsZUFBQSxDQUFBLFFBQUEsR0FBQSxXQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQSxDQUFBOztBQ25HQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLGlCQUFBO0FBQ0EsZUFBQSxFQUFBLDJCQUFBO0FBQ0EsY0FBQSxFQUFBLG9CQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxTQUFBLENBQUEsaUJBQUEsRUFBQSxDQUFBLFFBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLFNBQUE7QUFDQSxZQUFBLEVBQUEsSUFBQTtBQUNBLFNBQUEsRUFBQSxJQUFBO0FBQ0EsWUFBQSxFQUFBLDhEQUFBLEdBQ0EsbUhBQUEsR0FDQSxRQUFBO0FBQ0EsUUFBQSxFQUFBLGNBQUEsTUFBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsVUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEVBQUEsQ0FBQSxjQUFBLEVBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxZQUFBLFVBQUEsR0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsR0FBQSxVQUFBLENBQUE7QUFDQSxZQUFBLFVBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQTtTQUNBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxvQkFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7QUFDQSxRQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxLQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFdBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsU0FBQSxHQUFBLENBQUE7QUFDQSxRQUFBLEVBQUEsVUFBQTtBQUNBLFNBQUEsRUFBQSxVQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxPQUFBO0FBQ0EsU0FBQSxFQUFBLE9BQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLE1BQUE7QUFDQSxTQUFBLEVBQUEsTUFBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsS0FBQTtBQUNBLFNBQUEsRUFBQSxPQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxPQUFBO0FBQ0EsU0FBQSxFQUFBLE9BQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLGFBQUE7QUFDQSxTQUFBLEVBQUEsYUFBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsV0FBQTtBQUNBLFNBQUEsRUFBQSxXQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxrQkFBQTtBQUNBLFNBQUEsRUFBQSxXQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxVQUFBO0FBQ0EsU0FBQSxFQUFBLGFBQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLFdBQUE7QUFDQSxTQUFBLEVBQUEsY0FBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsU0FBQTtBQUNBLFNBQUEsRUFBQSxZQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxTQUFBO0FBQ0EsU0FBQSxFQUFBLFlBQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLFVBQUE7QUFDQSxTQUFBLEVBQUEsVUFBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsZ0JBQUE7QUFDQSxTQUFBLEVBQUEsYUFBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsWUFBQTtBQUNBLFNBQUEsRUFBQSxXQUFBO0dBQ0EsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLHFCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLEtBQUEsR0FBQTtBQUNBLFlBQUEsRUFBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLEVBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsR0FBQSxHQUFBO0FBQ0EsUUFBQSxFQUFBLFNBQUE7QUFDQSxTQUFBLEVBQUEsQ0FBQTtBQUNBLFdBQUEsRUFBQSxLQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUE7QUFDQSxpQkFBQSxFQUFBLEVBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUE7S0FDQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSx1QkFBQSxFQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsZ0ZBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsR0FBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUE7S0FDQSxDQUFBLFNBQ0EsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGtCQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLElBQUEsU0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLE1BQUEsR0FBQSxJQUFBLENBQUE7S0FDQSxNQUFBLElBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLElBQUEsYUFBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLE1BQUEsR0FBQSxLQUFBLENBQUE7S0FDQTtBQUNBLFFBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLFNBQUEsR0FBQSxPQUFBLENBQUE7S0FDQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLFNBQUEsR0FBQSxPQUFBLENBQUE7S0FDQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUEsS0FBQSxDQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLFNBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxPQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxlQUFBLEdBQUEsQ0FBQSxLQUFBLEtBQUEsSUFBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGVBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0FBQ0EsUUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLGVBQUEsRUFBQSxLQUFBLENBQUEsZUFBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsZUFBQSxDQUFBO0FBQ0EsUUFBQSxJQUFBLEdBQUE7QUFDQSxXQUFBLEVBQUEsS0FBQTtBQUNBLGNBQUEsRUFBQSxVQUFBLENBQUEsUUFBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsRUFBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEscUJBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsb0JBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxLQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsV0FBQSxDQUFBLFdBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLEdBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsU0FBQSxHQUFBLE9BQUEsQ0FBQTtLQUNBO0FBQ0EsUUFBQSxNQUFBLENBQUEsV0FBQSxDQUFBLFdBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLEdBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsU0FBQSxHQUFBLE9BQUEsQ0FBQTtLQUNBO0FBQ0EsUUFBQSxNQUFBLENBQUEsV0FBQSxDQUFBLEtBQUEsRUFBQSxLQUFBLENBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxJQUFBLEdBQUE7QUFDQSxXQUFBLEVBQUEsS0FBQTtBQUNBLGNBQUEsRUFBQSxVQUFBLENBQUEsUUFBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsNEJBQUEsRUFBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsY0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsMkJBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsUUFBQSxNQUFBLEdBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLEVBQUEsUUFBQTtBQUNBLGNBQUEsRUFBQSxRQUFBO0tBQ0EsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLHFCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLDJCQUFBLEdBQUEsS0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEscUJBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLDBCQUFBLEVBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUE7QUFDQSxxQkFBQSxFQUFBLEVBQUE7T0FDQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLGlDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsNEJBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOzs7QUFHQSxRQUFBLENBQUEsRUFBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLElBQUEsRUFBQTtBQUNBLFFBQUEsVUFBQSxHQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxHQUFBLFVBQUEsQ0FBQTtBQUNBLFFBQUEsVUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDL05BLENBQUEsWUFBQTs7QUFFQSxjQUFBLENBQUE7O0FBRUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsTUFBQSxJQUFBLEtBQUEsQ0FBQSx3QkFBQSxDQUFBLENBQUE7O0FBRUEsTUFBQSxHQUFBLEdBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxhQUFBLEVBQUEsRUFBQSxDQUFBLENBQUE7O0FBRUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxZQUFBLEVBQUEsWUFBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxFQUFBLE1BQUEsSUFBQSxLQUFBLENBQUEsc0JBQUEsQ0FBQSxDQUFBO0FBQ0EsV0FBQSxNQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7R0FDQSxDQUFBLENBQUE7O0FBRUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsVUFBQSxFQUFBO0FBQ0EsV0FBQTtBQUNBLFFBQUEsRUFBQSxZQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEVBQUEsQ0FBQSxTQUFBLEVBQUEsWUFBQTtBQUNBLGNBQUEsSUFBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLG9CQUFBLENBQUEsTUFBQSxDQUFBLFlBQUE7QUFDQSxvQkFBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7V0FDQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7T0FDQTtBQUNBLFVBQUEsRUFBQSxjQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxFQUFBLElBQUEsRUFBQSxZQUFBO0FBQ0EsY0FBQSxJQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0Esb0JBQUEsQ0FBQSxNQUFBLENBQUEsWUFBQTtBQUNBLGdCQUFBLFFBQUEsRUFBQTtBQUNBLHNCQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTthQUNBO1dBQ0EsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0E7S0FDQSxDQUFBO0dBQ0EsQ0FBQSxDQUFBOztBQUVBLEtBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxFQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsUUFBQSxhQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLGFBQUEsV0FBQSxHQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGtDQUFBLENBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsU0FBQSxDQUFBLElBQUEsRUFBQTtBQUNBLG1CQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsSUFBQSxDQUFBLFFBQUE7QUFDQSxvQkFBQSxFQUFBLElBQUEsQ0FBQSxXQUFBO0FBQ0EsYUFBQSxFQUFBLGNBQUE7T0FDQSxDQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLFNBQUEsR0FBQTtBQUNBLGFBQUEsYUFBQSxDQUFBO0tBQ0E7O0FBRUEsV0FBQTtBQUNBLGlCQUFBLEVBQUEsV0FBQTtBQUNBLGVBQUEsRUFBQSxTQUFBO0FBQ0EsZUFBQSxFQUFBLFNBQUE7S0FDQSxDQUFBO0dBQ0EsQ0FBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F5SEEsQ0FBQSxFQUFBLENBQUE7QUN0TEEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxRQUFBO0FBQ0EsZUFBQSxFQUFBLHFCQUFBO0FBQ0EsY0FBQSxFQUFBLHNCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUdBLEdBQUEsQ0FBQSxVQUFBLENBQUEsc0JBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxXQUFBLEVBQUEsYUFBQSxFQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsZUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxLQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLEVBQUE7QUFDQSxjQUFBLEVBQUEsTUFBQSxDQUFBLFFBQUE7S0FDQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxnQkFBQSxDQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBO0tBQ0EsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLFdBQUEsR0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLDBCQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsR0FBQSxDQUFBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLFVBQUEsQ0FBQSxRQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxhQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsYUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxFQUFBLENBQUEsV0FBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSx5QkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUM5REEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxlQUFBLEVBQUEsWUFBQTtBQUNBLFNBQUE7QUFDQSxhQUFBLEVBQUEsbUJBQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLENBQUEsTUFBQSxDQUFBLG1DQUFBLEdBQUEsR0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxRQUFBLENBQUEsY0FBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLEdBQUEsUUFBQSxDQUFBO0FBQ0EsaUJBQUEsRUFBQSxLQUFBO0FBQ0EsaUJBQUEsRUFBQSxHQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDVkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxvQkFBQTtBQUNBLGVBQUEsRUFBQSxpQkFBQTtBQUNBLGNBQUEsRUFBQSxlQUFBO0FBQ0EsV0FBQSxFQUFBO0FBQ0EsY0FBQSxFQUFBLGtCQUFBLEtBQUEsRUFBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxlQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxpQkFBQSxHQUFBLENBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0E7QUFDQSxnQkFBQSxFQUFBLG9CQUFBLEtBQUEsRUFBQSxZQUFBLEVBQUE7QUFDQSxlQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsMEJBQUEsR0FBQSxZQUFBLENBQUEsWUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBO0FBQ0EsV0FBQSxFQUFBLGVBQUEsVUFBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsR0FBQSxVQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0E7S0FDQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsTUFBQSxDQUFBLG1CQUFBLEVBQUEsWUFDQTtBQUNBLFNBQUEsVUFBQSxLQUFBLEVBQ0E7QUFDQSxXQUFBLFVBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGVBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxVQUFBLEVBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxVQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxTQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLFVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsTUFBQSxVQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsS0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLElBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxRQUFBLENBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBLGFBQUEsRUFBQSxLQUFBO0FBQ0EsYUFBQSxFQUFBLEdBQUE7R0FDQSxDQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLEVBQUEsRUFBQTtBQUNBLFdBQUEsVUFBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxZQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLHFCQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsR0FBQSxLQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGdCQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFFBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsZ0JBQUEsQ0FBQSxFQUFBLENBQUEsV0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBO0dBQ0EsQ0FBQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0Esa0JBQUEsRUFBQSxVQUFBLENBQUEsVUFBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsWUFBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLFNBQUEsSUFBQSxHQUFBLElBQUEsTUFBQSxDQUFBLGdCQUFBLEVBQUE7QUFDQSxVQUFBLE1BQUEsQ0FBQSxnQkFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsWUFBQSxJQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxpQkFBQSxFQUFBLENBQUEsV0FBQSxJQUFBLEdBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtPQUNBO0tBQ0E7QUFDQSxRQUFBLE1BQUEsQ0FBQSxRQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsSUFBQSxDQUFBLEVBQUE7QUFDQSxVQUFBLE1BQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEscUJBQUEsR0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsbUJBQUEsRUFBQSxJQUFBO0FBQ0EscUJBQUEsRUFBQSxvQkFBQTtBQUNBLG9CQUFBLEVBQUEseUJBQUE7QUFDQSxlQUFBLEVBQUEsTUFBQTtTQUNBLENBQUEsQ0FBQTtPQUNBLE1BQUE7QUFDQSxjQUFBLENBQUEsV0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO09BQ0E7S0FDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFdBQUEsR0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLGVBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxxQkFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0tBQ0E7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUEsVUFBQSxHQUFBO0FBQ0EsY0FBQSxFQUFBLEVBQUE7QUFDQSxnQkFBQSxFQUFBLFVBQUE7QUFDQSxnQkFBQSxFQUFBLFVBQUEsQ0FBQSxVQUFBO0tBQ0EsQ0FBQTtBQUNBLFNBQUEsSUFBQSxHQUFBLElBQUEsTUFBQSxDQUFBLGdCQUFBLEVBQUE7QUFDQSxVQUFBLE1BQUEsQ0FBQSxnQkFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsWUFBQSxJQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxpQkFBQSxFQUFBLENBQUEsV0FBQSxJQUFBLEdBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7T0FDQTtLQUNBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSw2QkFBQSxFQUFBLFVBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBR0EsUUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLE9BQUEsRUFDQTtBQUNBLFdBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsT0FBQSxDQUFBLFNBQUEsRUFDQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsR0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBO0tBQ0EsTUFFQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLElBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQTtLQUNBOztBQUVBLFVBQUEsQ0FBQSxnQkFBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsZ0JBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxDQUFBLElBQUEsSUFBQSxHQUFBLEtBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsV0FBQSxDQUFBLFNBQUEsR0FBQSxPQUFBLENBQUEsU0FBQSxHQUFBLEtBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSx5QkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLEVBRUEsQ0FBQSxDQUFBO0FDNUlBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsV0FBQTtBQUNBLGVBQUEsRUFBQSxzQkFBQTtBQUNBLGNBQUEsRUFBQSxvQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLG9CQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLFNBQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxtQ0FBQSxFQUFBLFNBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLEVBQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxTQUFBLENBQUEsNENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDdEJBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsWUFBQTtBQUNBLGVBQUEsRUFBQSw2QkFBQTtBQUNBLGNBQUEsRUFBQSxxQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFHQSxHQUFBLENBQUEsVUFBQSxDQUFBLHFCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsV0FBQSxFQUFBLE9BQUEsRUFBQTs7QUFFQSxRQUFBLENBQUEsWUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsTUFBQSxJQUFBLEdBQUEsVUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLE1BQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0dBQ0E7QUFDQSxRQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsV0FBQSxHQUFBLElBQUEsQ0FBQSxXQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFFBQUEsR0FBQSxjQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQSxDQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLElBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtHQUVBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQSxlQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxxQkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLE9BQUEsR0FBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQTtBQUNBLFFBQUEsS0FBQSxHQUFBLElBQUEsSUFBQSxFQUFBLENBQUE7QUFDQSxRQUFBLEtBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxLQUFBLENBQUEsUUFBQSxFQUFBLEdBQUEsSUFBQSxFQUFBLE9BQUE7QUFDQSxVQUFBLENBQUEsV0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsV0FBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFlBQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsU0FBQSxHQUFBLFdBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxTQUFBLElBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxPQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxhQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFNBQUEsR0FBQTtBQUNBLGlCQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBO0FBQ0EsV0FBQSxFQUFBLE9BQUE7QUFDQSxZQUFBLEVBQUEsS0FBQTtPQUNBLENBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtLQUNBLE1BQUE7QUFDQSxZQUFBLENBQUEsWUFBQSxHQUFBLG9DQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLG9DQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLEtBQUE7QUFDQSxpQkFBQSxFQUFBLEdBQUE7T0FDQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsWUFBQSxHQUFBLFNBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFNBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLHlCQUFBLEVBQUE7QUFDQSxTQUFBLEVBQUEsTUFBQSxDQUFBLFlBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsVUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxZQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLEtBQUE7QUFDQSxpQkFBQSxFQUFBLEdBQUE7T0FDQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxHQUFBLFFBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxXQUFBLFVBQUEsQ0FBQSxjQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLEdBQUEsR0FBQSxHQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLFdBQUEsR0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGlCQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtBQUNBLG1CQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSx3QkFBQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7S0FDQSxNQUFBO0FBQ0EsVUFBQSxXQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxlQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtBQUNBLGlCQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7QUFDQSxVQUFBLE1BQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxtQkFBQSxDQUFBLENBQUE7S0FDQSxNQUFBO0FBQ0EsVUFBQSxNQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFNBQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsYUFBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLEVBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxlQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsV0FBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsbUJBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLENBQUE7V0FDQSxDQUFBLENBQUE7QUFDQSxxQkFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLHNCQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBLE1BQUE7QUFDQSxjQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsRUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGVBQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxXQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxtQkFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsQ0FBQTtXQUNBLENBQUEsQ0FBQTtBQUNBLHFCQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7T0FDQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLFdBQUEsR0FBQSw4Q0FBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsS0FBQSxHQUFBLFlBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxpQ0FBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsS0FBQSxHQUFBLE1BQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsR0FBQSxNQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxHQUFBLGdCQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsSUFBQSxHQUFBLFNBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7Ozs7OztBQU1BLFFBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsT0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsWUFBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLHlCQUFBLEVBQUE7QUFDQSxTQUFBLEVBQUEsTUFBQSxDQUFBLFlBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxRQUFBLEtBQUEsSUFBQSxDQUFBLEVBQUEsT0FBQTtBQUNBLFFBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsUUFBQSxLQUFBLElBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsRUFBQSxPQUFBO0FBQ0EsUUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7R0FDQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLGNBQUEsQ0FBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLFdBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxDQUFBLG1DQUFBLEdBQUEsR0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLGlCQUFBLEVBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxHQUFBLFFBQUEsQ0FBQTtBQUNBLG1CQUFBLEVBQUEsS0FBQTtBQUNBLG1CQUFBLEVBQUEsR0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBLEVBQUEsRUFBQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxjQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsWUFBQTtBQUNBLFdBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxDQUFBLG1DQUFBLEdBQUEsTUFBQSxFQUFBO0FBQ0EsaUJBQUEsRUFBQSxRQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsR0FBQSxRQUFBLENBQUE7QUFDQSxtQkFBQSxFQUFBLEtBQUE7QUFDQSxtQkFBQSxFQUFBLEdBQUE7U0FDQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7S0FDQSxFQUFBLEVBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtBQUNBLE1BQUEsTUFBQSxDQUFBLE9BQUEsSUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxjQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtHQUNBO0FBQ0EsUUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLFNBQUEsY0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLE1BQUEsUUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLE1BQUEsS0FBQSxHQUFBLElBQUEsSUFBQSxFQUFBLENBQUE7QUFDQSxPQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBO0FBQ0EsUUFBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLElBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLEVBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxRQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxTQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7S0FDQTtBQUNBLGFBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsR0FBQSxFQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7R0FDQTtBQUNBLFNBQUEsUUFBQSxDQUFBO0NBQ0E7QUN2VEEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLFlBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxTQUFBO0FBQ0EsZUFBQSxFQUFBLDRCQUFBO0FBQ0EsY0FBQSxFQUFBLHNCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsc0JBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQTs7QUFFQSxRQUFBLENBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsRUFBQTtBQUNBLFNBQUEsRUFBQSxNQUFBLENBQUEsR0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxDQUFBLE9BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLFFBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBO0FBQ0EsaUJBQUEsRUFBQSxLQUFBO0FBQ0EsaUJBQUEsRUFBQSxHQUFBO09BQ0EsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEdBQUEsUUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxLQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSwyQkFBQSxDQUFBLENBQUE7S0FDQSxNQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUE7S0FDQSxNQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsSUFBQSxDQUFBLGtCQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxLQUFBO0FBQ0EsZUFBQSxFQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsT0FBQTtBQUNBLFlBQUEsRUFBQSxNQUFBLENBQUEsVUFBQSxDQUFBLElBQUE7QUFDQSxhQUFBLEVBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxLQUFBO0FBQ0EsZ0JBQUEsRUFBQSxNQUFBLENBQUEsVUFBQSxDQUFBLFFBQUE7QUFDQSxrQkFBQSxFQUFBLEVBQUE7QUFDQSxrQkFBQSxFQUFBLEVBQUE7T0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsZUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLHlEQUFBLENBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7T0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSwrQkFBQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNoRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQ0EsS0FBQSxDQUFBLFdBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxZQUFBO0FBQ0EsZUFBQSxFQUFBLHlDQUFBO0FBQ0EsY0FBQSxFQUFBLHFCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEscUJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUE7QUFDQSxRQUFBLENBQUEsUUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsRUFBQTtBQUNBLFNBQUEsRUFBQSxNQUFBLENBQUEsR0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsR0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDdkJBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUNBLEtBQUEsQ0FBQSxvQkFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLGlDQUFBO0FBQ0EsVUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxJQUFBO0tBQ0E7QUFDQSxlQUFBLEVBQUEsZ0RBQUE7QUFDQSxjQUFBLEVBQUEsOEJBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBR0EsR0FBQSxDQUFBLFVBQUEsQ0FBQSw4QkFBQSxFQUFBLFlBQUEsRUFFQSxDQUFBLENBQUE7QUNmQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FDQSxLQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFFBQUE7QUFDQSxVQUFBLEVBQUE7QUFDQSxnQkFBQSxFQUFBLElBQUE7S0FDQTtBQUNBLGVBQUEsRUFBQSwwQkFBQTtBQUNBLGNBQUEsRUFBQSxnQkFBQTtHQUNBLENBQUEsQ0FDQSxLQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFNBQUE7QUFDQSxlQUFBLEVBQUEsMkJBQUE7QUFDQSxjQUFBLEVBQUEsZ0JBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxnQkFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxZQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxTQUFBLEVBQUEsT0FBQSxFQUFBLFdBQUEsRUFBQSxjQUFBLEVBQUEsTUFBQSxFQUFBO0FBQ0EsUUFBQSxDQUFBLFFBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsT0FBQSxFQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsS0FBQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsU0FBQSxHQUFBO0FBQ0EsaUJBQUEsRUFBQSx5QkFBQTtBQUNBLFlBQUEsQ0FBQSxhQUFBLEdBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsSUFBQTtBQUNBLG1CQUFBLEVBQUEscUJBQUE7QUFDQSxrQkFBQSxFQUFBLGdCQUFBO0FBQ0EsYUFBQSxFQUFBLE1BQUE7T0FDQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsS0FBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsU0FBQSxFQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsS0FBQTtLQUNBLENBQUE7QUFDQSxlQUFBLENBQ0EsS0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsbUJBQUEsQ0FBQSxTQUNBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsbUJBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxVQUFBLEdBQUEsQ0FBQSxNQUFBLEtBQUEsR0FBQSxJQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0Esc0JBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxFQUFBLENBQUEsZ0NBQUEsQ0FBQSxDQUFBO09BQ0EsTUFBQTtBQUNBLGNBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxhQUFBLEVBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBO0FBQ0EsaUJBQUEsRUFBQSxJQUFBO1NBQ0EsQ0FBQTtPQUNBO0tBQ0E7O0FBRUEsYUFBQSxnQkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxXQUFBLEVBQUEsa0NBQUE7QUFDQSxlQUFBLEVBQUEsSUFBQTtPQUNBLENBQUE7S0FDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGlCQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsWUFBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFHQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsU0FBQSxFQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsS0FBQTtLQUNBLENBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxJQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsZUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLFdBQUEsRUFBQSwrQ0FBQTtBQUNBLGVBQUEsRUFBQSxJQUFBO09BQ0EsQ0FBQTtBQUNBLGFBQUE7S0FDQTtBQUNBLGVBQUEsQ0FDQSxNQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxvQkFBQSxDQUFBLFNBQ0EsQ0FBQSxpQkFBQSxDQUFBLENBQUE7O0FBRUEsYUFBQSxvQkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLGlCQUFBLENBQUEsR0FBQSxFQUFBLEVBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLFdBQUEsR0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLDRCQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsR0FBQSxDQUFBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLE1BQUE7T0FDQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxvQkFBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxZQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLEVBQUEsQ0FBQSwrQkFBQSxFQUFBO0FBQ0Esc0JBQUEsRUFBQSxZQUFBLENBQUEsVUFBQTtTQUNBLENBQUEsQ0FBQTtBQUNBLGVBQUE7T0FDQTtBQUNBLFlBQUEsQ0FBQSxFQUFBLENBQUEsZ0NBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLHlCQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ3hIQSxHQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsV0FBQSxNQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFNBQUE7QUFDQSxTQUFBLEVBQUEsS0FBQTtBQUNBLFVBQUEsRUFBQSxNQUFBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQSxDQUFBOztBQ1pBLEdBQUEsQ0FBQSxPQUFBLENBQUEsZ0JBQUEsRUFBQSxDQUFBLFVBQUEsRUFBQSxVQUFBLFFBQUEsRUFBQTs7QUFFQSxXQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEsVUFBQSxHQUFBO0FBQ0EsWUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEsT0FBQSxHQUFBO0FBQ0EsV0FBQSxRQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsU0FBQTtBQUNBLFVBQUEsRUFBQSxNQUFBO0FBQ0EsY0FBQSxFQUFBLFVBQUE7QUFDQSxXQUFBLEVBQUEsT0FBQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUEsQ0FBQTs7QUNyQkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLGVBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxnQ0FBQTtBQUNBLGVBQUEsRUFBQSx3Q0FBQTtBQUNBLGNBQUEsRUFBQSxzQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsZ0JBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSw2Q0FBQTtBQUNBLGVBQUEsRUFBQSx3Q0FBQTtBQUNBLGNBQUEsRUFBQSxzQkFBQTtHQW1CQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxzQkFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFlBQUEsRUFBQSxXQUFBLEVBQUE7QUFDQSxRQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQTs7QUFHQSxRQUFBLENBQUEsYUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLE1BQUEsWUFBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxhQUFBLEdBQUEsSUFBQSxDQUFBO0dBQ0E7OztBQUdBLFFBQUEsQ0FBQSxRQUFBLEdBQUE7QUFDQSxZQUFBLEVBQUEsS0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxZQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsR0FBQSxDQUFBLHNDQUFBLEdBQUEsWUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsUUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxRQUFBLEdBQUEsUUFBQSxDQUFBO1NBQ0EsTUFBQTtBQUNBLGdCQUFBLENBQUEsUUFBQSxHQUFBLEVBQUEsQ0FBQTtTQUNBO09BQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsOEJBQUEsQ0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0EsTUFBQTtBQUNBLGFBQUEsS0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOzs7QUFHQSxRQUFBLENBQUEsSUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsMkJBQUEsRUFBQSxNQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLHVCQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsZ0NBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUE7S0FDQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUMxR0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLGdCQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsNEJBQUE7QUFDQSxlQUFBLEVBQUEsNENBQUE7QUFDQSxjQUFBLEVBQUEsMEJBQUE7QUFDQSxXQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsbUJBQUEsS0FBQSxFQUFBO0FBQ0EsZUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDBCQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsY0FBQSxRQUFBLEVBQUE7QUFDQSxtQkFBQSxRQUFBLENBQUE7V0FDQSxNQUFBO0FBQ0EsbUJBQUE7QUFDQSxxQkFBQSxFQUFBLGdCQUFBO2FBQ0EsQ0FBQTtXQUNBO1NBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxlQUFBLENBQUEsOEJBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0E7S0FDQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLDBCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsV0FBQSxFQUFBLFNBQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFNBQUEsR0FBQSxTQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBdUJBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSwwQkFBQSxFQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsY0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7OztBQWdCQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBO0tBQ0EsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDdkZBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEscUJBQUE7QUFDQSxlQUFBLEVBQUEseUNBQUE7QUFDQSxjQUFBLEVBQUEsdUJBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLGtCQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsMEJBQUE7QUFDQSxlQUFBLEVBQUEsOENBQUE7QUFDQSxjQUFBLEVBQUEsdUJBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLGtCQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEscUNBQUE7QUFDQSxlQUFBLEVBQUEseUNBQUE7QUFDQSxjQUFBLEVBQUEsdUJBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBR0EsR0FBQSxDQUFBLFVBQUEsQ0FBQSx1QkFBQSxFQUFBLENBQUEsWUFBQSxFQUNBLFFBQUEsRUFDQSxjQUFBLEVBQ0EsUUFBQSxFQUNBLE9BQUEsRUFDQSxXQUFBLEVBQ0EsU0FBQSxFQUNBLFdBQUEsRUFDQSxnQkFBQSxFQUNBLG9CQUFBLEVBQ0EsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsU0FBQSxFQUFBLGNBQUEsRUFBQSxrQkFBQSxFQUFBOztBQUVBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLGdCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLE9BQUEsRUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEtBQUE7R0FDQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLEtBQUEsR0FBQTtBQUNBLGtCQUFBLEVBQUEsYUFBQTtBQUNBLGNBQUEsRUFBQSxtQkFBQTtBQUNBLG1CQUFBLEVBQUEsOEJBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLFFBQUEsRUFBQSxLQUFBO0FBQ0EsV0FBQSxFQUFBLEtBQUE7QUFDQSxVQUFBLEVBQUEsS0FBQTtBQUNBLFdBQUEsRUFBQSxDQUFBO0FBQ0EsU0FBQSxFQUFBLEVBQUE7QUFDQSxZQUFBLEVBQUEsOEJBQUE7QUFDQSxjQUFBLEVBQUEsRUFBQTtBQUNBLFFBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxtQkFBQSxFQUFBLEtBQUE7S0FDQSxDQUFBO0FBQ0EsYUFBQSxFQUFBLENBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLFlBQUEsRUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEVBQUE7QUFDQSxRQUFBLEVBQUEsRUFBQTtLQUNBLENBQUE7R0FDQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLG1CQUFBLEdBQUEsRUFBQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLGFBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxTQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUEscUJBQUEsWUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGFBQUEsR0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsaUJBQUEsRUFBQSxJQUFBO0FBQ0EsbUJBQUEsRUFBQSxrQkFBQTtBQUNBLGtCQUFBLEVBQUEsdUJBQUE7QUFDQSxhQUFBLEVBQUEsTUFBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxhQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7R0FDQSxDQUFBOzs7QUFHQSxRQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTs7OztBQUlBLFdBQUEsb0JBQUEsR0FBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGdCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEtBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxLQUFBLEdBQUE7QUFDQSxvQkFBQSxFQUFBLGFBQUE7QUFDQSxnQkFBQSxFQUFBLG1CQUFBO0FBQ0EscUJBQUEsRUFBQSw4QkFBQTtBQUNBLGFBQUEsRUFBQSxFQUFBO0FBQ0EsVUFBQSxFQUFBLEtBQUE7QUFDQSxhQUFBLEVBQUEsS0FBQTtBQUNBLFlBQUEsRUFBQSxLQUFBO0FBQ0EsYUFBQSxFQUFBLENBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLGNBQUEsRUFBQSw4QkFBQTtBQUNBLGdCQUFBLEVBQUEsRUFBQTtBQUNBLFVBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxxQkFBQSxFQUFBLEtBQUE7T0FDQSxDQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLGNBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEVBQUE7QUFDQSxVQUFBLEVBQUEsRUFBQTtPQUNBLENBQUE7S0FDQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLE9BQUEsQ0FBQSxvQkFBQSxDQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7OztBQUdBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsWUFBQSxDQUFBLFNBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxrQkFBQSxDQUFBLFlBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTs7Ozs7O0tBTUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxjQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEtBQUEsRUFBQSxFQUFBO1VBV0EsNkJBQUEsR0FBQSxTQUFBLDZCQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsZUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEVBQUEsY0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxnQkFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsR0FBQSxlQUFBLENBQUEsQ0FBQTtPQUNBOztVQUVBLGlCQUFBLEdBQUEsU0FBQSxpQkFBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFNBQUEsRUFBQSxTQUFBLEVBQUEsVUFBQSxFQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsV0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUEsQ0FBQSxPQUFBO0FBQ0EsbUJBQUEsRUFBQSxJQUFBLENBQUEsR0FBQTthQUNBLENBQUEsQ0FBQTtXQUNBO1NBQ0EsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLGdCQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7T0FDQTs7VUFFQSxXQUFBLEdBQUEsU0FBQSxXQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsYUFBQSxDQUFBLDZCQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO09BQ0E7O0FBdkNBLFlBQUEsQ0FBQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esd0JBQUEsQ0FDQSxXQUFBLENBQUE7QUFDQSxXQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBO09BQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSw2QkFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLGlCQUFBLENBQUEsU0FDQSxDQUFBLFdBQUEsQ0FBQSxDQUFBO0tBZ0NBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsUUFBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxzQkFBQSxDQUNBLFdBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLE1BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxTQUNBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsbUJBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsWUFBQSxFQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLFFBQUEsRUFBQSxFQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxjQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxpQkFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxzQkFBQSxDQUNBLFdBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLE1BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUdBLFFBQUEsQ0FBQSxZQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLEVBQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQTtLQUNBOztBQUVBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsWUFBQSxFQUFBLDhCQUFBO0FBQ0EsY0FBQSxFQUFBLEVBQUE7QUFDQSxRQUFBLEVBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFlBQUE7OztBQUdBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEVBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFlBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFlBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxhQUFBLFdBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxVQUFBLFFBQUEsR0FBQSxRQUFBLENBQUEsYUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLFFBQUEsQ0FBQSxJQUFBLElBQUEsRUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtPQUNBO0FBQ0EsYUFBQSxRQUFBLENBQUE7S0FDQTs7QUFFQSxRQUFBLFFBQUEsR0FBQSxXQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsUUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLEdBQUEsS0FBQSxJQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxRQUFBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUE7S0FDQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxnQkFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUE7S0FDQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsUUFBQSxPQUFBLEdBQUEsSUFBQSxRQUFBLEVBQUEsQ0FBQTs7Ozs7QUFLQSxTQUFBLElBQUEsSUFBQSxJQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsRUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7S0FDQTs7OztBQUlBLFFBQUEsT0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQTtBQUNBLGFBQUEsSUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLEVBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBOzs7O0FBSUEsUUFBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsTUFBQSxDQUFBLFdBQUEsRUFBQSxJQUFBLENBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7Ozs7QUFJQSxRQUFBLE9BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsRUFBQSxJQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7Ozs7QUFJQSxRQUFBLE9BQUEsR0FBQTtBQUNBLFlBQUEsRUFBQSxNQUFBO0FBQ0EsU0FBQSxFQUFBLDJCQUFBO0FBQ0EsYUFBQSxFQUFBO0FBQ0Esc0JBQUEsRUFBQSxTQUFBO09BQ0E7QUFDQSxzQkFBQSxFQUFBLE9BQUEsQ0FBQSxRQUFBO0FBQ0EsVUFBQSxFQUFBLE9BQUE7S0FDQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQTs7QUFFQSxlQUFBO09BQ0E7QUFDQSwwQkFBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsU0FBQSxDQUFBLFdBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLDRCQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0Esb0JBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0Esc0JBQUEsQ0FDQSxlQUFBLEVBQUEsQ0FDQSxJQUFBLENBQUEsY0FBQSxDQUFBLFNBQ0EsQ0FBQSxXQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLGNBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsbUJBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxXQUFBLENBQUEsR0FBQSxFQUFBLEVBRUE7R0FDQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLGtCQUFBLEdBQUEsVUFBQSxpQkFBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FDQSxrQkFBQSxDQUFBO0FBQ0EsUUFBQSxFQUFBLGlCQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxjQUFBLENBQUEsU0FDQSxDQUFBLFdBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsY0FBQSxDQUFBLEdBQUEsRUFBQTs7QUFFQSxZQUFBLENBQUEsZ0JBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7O0FBRUEsVUFBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxZQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLFdBQUEsSUFBQSxJQUFBLElBQUEsT0FBQSxFQUFBO0FBQ0Esb0JBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxhQUFBLEVBQUEsSUFBQTtBQUNBLGVBQUEsRUFBQSxPQUFBLENBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0E7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxZQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsV0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxxQkFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLFFBQUEsT0FBQSxDQUFBLDBDQUFBLENBQUEsRUFBQTtVQVVBLGNBQUEsR0FBQSxTQUFBLGNBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxtQkFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7T0FDQTs7VUFFQSxXQUFBLEdBQUEsU0FBQSxXQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7T0FDQTs7QUFoQkEsVUFBQSxpQkFBQSxHQUFBLE1BQUEsQ0FBQSxtQkFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esd0JBQUEsQ0FDQSxxQkFBQSxDQUFBO0FBQ0EsVUFBQSxFQUFBLGlCQUFBO09BQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxjQUFBLENBQUEsU0FDQSxDQUFBLFdBQUEsQ0FBQSxDQUFBO0tBVUEsTUFBQTtBQUNBLGFBQUEsS0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0NBQ0EsQ0FFQSxDQUFBLENBQUE7QUM1YkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxXQUFBO0FBQ0EsZUFBQSxFQUFBLGdEQUFBO0FBQ0EsY0FBQSxFQUFBLHlCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEseUJBQUEsRUFBQSxDQUFBLFlBQUEsRUFDQSxRQUFBLEVBQ0EsUUFBQSxFQUNBLE9BQUEsRUFDQSxXQUFBLEVBQ0EsU0FBQSxFQUNBLElBQUEsRUFDQSxzQkFBQSxFQUNBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsRUFBQSxFQUFBLG9CQUFBLEVBQUE7OztBQUdBLE1BQUEsU0FBQSxHQUFBLElBQUEsQ0FBQTs7OztBQUlBLFFBQUEsQ0FBQSxTQUFBLEdBQUE7QUFDQSxhQUFBLEVBQUEsc0JBQUE7QUFDQSxZQUFBLEVBQUEsYUFBQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsZUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0tBQ0EsTUFBQTtBQUNBLGVBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsbUJBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxpQkFBQSxHQUFBLDhCQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsWUFBQSxHQUFBLEVBQUEsQ0FBQTs7OztBQUlBLFFBQUEsQ0FBQSxnQkFBQSxHQUFBLFlBQUE7O0FBRUEsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxRQUFBLE9BQUEsR0FBQSxTQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsT0FBQSxDQUFBO0FBQ0Esd0JBQUEsQ0FDQSxnQkFBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxvQkFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLG1CQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsUUFBQSxDQUFBLFNBQ0EsQ0FBQSx1QkFBQSxDQUFBLENBQUE7O0FBRUEsYUFBQSxvQkFBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsZUFBQTtBQUNBLDRCQUFBLEVBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsZUFBQSxHQUFBLEdBQUE7QUFDQSw2QkFBQSxFQUFBLFdBQUE7QUFDQSwyQkFBQSxFQUFBLE9BQUE7U0FDQSxDQUFBO09BQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBOztBQUVBLFVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxrQkFBQSxLQUFBLE1BQUEsRUFBQTtBQUNBLGVBQUEsb0JBQUEsQ0FBQSxlQUFBLENBQUE7QUFDQSxnQkFBQSxFQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsTUFBQTtBQUNBLGlCQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0EsTUFBQTtBQUNBLGVBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtPQUNBO0tBQ0E7O0FBRUEsYUFBQSxtQkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFVBQUEsT0FBQSxHQUFBLEtBQUEsUUFBQSxJQUFBLEdBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsWUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7T0FDQTtBQUNBLGFBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsUUFBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLGVBQUEsR0FBQSxNQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLHVCQUFBLEdBQUE7QUFDQSxXQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7OztBQUtBLFFBQUEsQ0FBQSxhQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSx5QkFBQSxDQUFBLENBQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQTtLQUNBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQ0EsSUFBQSxDQUFBLFlBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxZQUFBLENBQUEsU0FDQSxDQUFBLGVBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsWUFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxhQUFBLG9CQUFBLENBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsWUFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsSUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsS0FBQSxFQUFBLEVBQUE7QUFDQSxlQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsQ0FBQTtPQUNBLE1BQUE7QUFDQSxjQUFBLENBQUEsU0FBQSxHQUFBLHFDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsbUJBQUEsR0FBQSxJQUFBLENBQUE7T0FDQTtBQUNBLFlBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsZUFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxrQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtLQUNBO0dBRUEsQ0FBQTtDQUNBLENBQ0EsQ0FBQSxDQUFBOztBQ3pJQSxHQUFBLENBQUEsT0FBQSxDQUFBLG9CQUFBLEVBQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsV0FBQSxXQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLHlCQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLGVBQUEsR0FBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxpQ0FBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLGtCQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDRCQUFBLEdBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsV0FBQSxxQkFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxrQ0FBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsU0FBQTtBQUNBLGVBQUEsRUFBQSxXQUFBO0FBQ0EsbUJBQUEsRUFBQSxlQUFBO0FBQ0Esc0JBQUEsRUFBQSxrQkFBQTtBQUNBLHlCQUFBLEVBQUEscUJBQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBLENBQUE7O0FDekJBLEdBQUEsQ0FBQSxPQUFBLENBQUEsc0JBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxXQUFBLGdCQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDhCQUFBLEdBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLFlBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsRUFBQTtBQUNBLFNBQUEsRUFBQSxJQUFBLENBQUEsUUFBQTtLQUNBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEsWUFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxvQkFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsV0FBQSxlQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLG9DQUFBLEdBQUEsSUFBQSxDQUFBLE1BQUEsR0FBQSxXQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsU0FBQTtBQUNBLG9CQUFBLEVBQUEsZ0JBQUE7QUFDQSxnQkFBQSxFQUFBLFlBQUE7QUFDQSxnQkFBQSxFQUFBLFlBQUE7QUFDQSxtQkFBQSxFQUFBLGVBQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBLENBQUE7O0FDMUJBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUNBLEtBQUEsQ0FBQSxhQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsZUFBQTtBQUNBLGVBQUEsRUFBQSw0Q0FBQTtBQUNBLGNBQUEsRUFBQSx1QkFBQTtBQUNBLFlBQUEsRUFBQSxJQUFBO0FBQ0EsV0FBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLGlCQUFBLEVBQUEsRUFBQSxNQUFBLEVBQUEsY0FBQSxFQUFBO0FBQ0EsWUFBQSxRQUFBLEdBQUEsRUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLEdBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1NBQ0EsTUFBQTtBQUNBLGtCQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBO1NBQ0E7QUFDQSxlQUFBLFFBQUEsQ0FBQSxPQUFBLENBQUE7T0FDQTtLQUNBO0dBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxvQkFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFVBQUE7QUFDQSxlQUFBLEVBQUEsd0NBQUE7QUFDQSxjQUFBLEVBQUEsdUJBQUE7R0FDQSxDQUFBLENBQ0EsS0FBQSxDQUFBLGdDQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsbUJBQUE7QUFDQSxVQUFBLEVBQUE7QUFDQSxnQkFBQSxFQUFBLElBQUE7S0FDQTtBQUNBLGVBQUEsRUFBQSxxREFBQTtBQUNBLGNBQUEsRUFBQSx1QkFBQTtHQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLHVCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQSxjQUFBLEVBQUEsa0JBQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQTs7OztBQUlBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLGdCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLE9BQUEsRUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEtBQUE7R0FDQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLG1CQUFBLEdBQUEsRUFBQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLGFBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxTQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUEscUJBQUEsYUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEdBQUEsYUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGFBQUEsR0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsaUJBQUEsRUFBQSxJQUFBO0FBQ0EsbUJBQUEsRUFBQSxrQkFBQTtBQUNBLGtCQUFBLEVBQUEsdUJBQUE7QUFDQSxhQUFBLEVBQUEsTUFBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxhQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSx3QkFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxnQkFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxvQkFBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLHFCQUFBLEtBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxZQUFBO0FBQ0EsY0FBQSxDQUFBLHdCQUFBLEdBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLG1CQUFBLEVBQUEsSUFBQTtBQUNBLHFCQUFBLEVBQUEsa0JBQUE7QUFDQSxvQkFBQSxFQUFBLHVCQUFBO0FBQ0EsZUFBQSxFQUFBLE1BQUE7U0FDQSxDQUFBLENBQUE7T0FDQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxxQkFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSx3QkFBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSx3QkFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxxQkFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxhQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLGlCQUFBLEdBQUE7QUFDQSxZQUFBLEVBQUEsa0JBQUEsWUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLGFBQUEsQ0FBQSxZQUFBLEdBQUEsWUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGFBQUEsR0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsaUJBQUEsRUFBQSxJQUFBO0FBQ0EsbUJBQUEsRUFBQSxlQUFBO0FBQ0Esa0JBQUEsRUFBQSw2QkFBQTtBQUNBLGFBQUEsRUFBQSxNQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLGtCQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxxQkFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0Esb0JBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFNBQUEsQ0FBQSxHQUFBLENBQUEsWUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBO0FBQ0EsTUFBQSxZQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLGlCQUFBLENBQUEsUUFBQSxDQUFBLFlBQUEsQ0FBQSxVQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7R0FDQTs7QUFHQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLElBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEdBQUEsQ0FBQTtBQUNBLFdBQUEsRUFBQSxFQUFBO0FBQ0EsY0FBQSxFQUFBLEVBQUE7QUFDQSxnQkFBQSxFQUFBLEVBQUE7QUFDQSxVQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0EscUJBQUEsRUFBQSxJQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxDQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxDQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEdBQUEsSUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxDQUFBLFVBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsR0FBQSxFQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTs7QUFFQSxVQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsV0FBQSxFQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsS0FBQTtLQUNBLENBQUE7O0FBRUEsUUFBQSxjQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQTtBQUNBLGFBQUEsSUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOztBQUVBLFFBQUEsT0FBQSxHQUFBO0FBQ0EsVUFBQSxFQUFBLEVBQUE7QUFDQSxjQUFBLEVBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxjQUFBLENBQUE7S0FDQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsS0FBQSxNQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsSUFBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQTtLQUNBLE1BQUEsSUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsS0FBQSxVQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQTtLQUNBLE1BQUEsSUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsS0FBQSxPQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtLQUNBOztBQUVBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FDQSxlQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLEdBQUEsQ0FBQSxJQUFBLEtBQUEsYUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLGVBQUEsRUFBQSx1QkFBQTtBQUNBLGlCQUFBLEVBQUEsSUFBQTtTQUNBLENBQUE7QUFDQSxlQUFBO09BQ0E7QUFDQSxvQkFBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEscUJBQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQSxTQUNBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLG1CQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxnQkFBQSxHQUFBLFlBQUE7O0FBRUEsUUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsTUFBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7S0FDQTs7QUFFQSxRQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQTtLQUNBOztBQUVBLFVBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLFlBQUEsRUFBQSxFQUFBO0FBQ0EsY0FBQSxFQUFBLEVBQUE7QUFDQSxRQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsRUFBQSxJQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsc0JBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFFBQUEsYUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FDQSxXQUFBLENBQUE7QUFDQSxTQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEdBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLE1BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxTQUNBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsbUJBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSx5QkFBQSxHQUFBLFlBQUE7QUFDQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQ0EsSUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxjQUFBLENBQUEsU0FDQSxDQUFBLFdBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsUUFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsa0JBQUEsQ0FBQSx5QkFBQSxDQUFBO0FBQ0EsYUFBQSxFQUFBLEdBQUEsQ0FBQSxXQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxjQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLEdBQUEsQ0FBQSxNQUFBLEtBQUEsR0FBQSxJQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxLQUFBLElBQUEsRUFBQTtBQUNBLHNCQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7T0FDQSxNQUFBO0FBQ0EsY0FBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLGVBQUEsRUFBQSwyREFBQTtBQUNBLGlCQUFBLEVBQUEsSUFBQTtTQUNBLENBQUE7T0FDQTtBQUNBLFlBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsV0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLHNCQUFBLENBQ0EsZUFBQSxFQUFBLENBQ0EsSUFBQSxDQUFBLGNBQUEsQ0FBQSxTQUNBLENBQUEsV0FBQSxDQUFBLENBQUE7O0FBRUEsYUFBQSxjQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLG1CQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsV0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLHFCQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxRQUFBLE9BQUEsQ0FBQSwwQ0FBQSxDQUFBLEVBQUE7VUFVQSxjQUFBLEdBQUEsU0FBQSxjQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsbUJBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO09BQ0E7O1VBRUEsV0FBQSxHQUFBLFNBQUEsV0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO09BQ0E7O0FBaEJBLFVBQUEsaUJBQUEsR0FBQSxNQUFBLENBQUEsbUJBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLHdCQUFBLENBQ0EscUJBQUEsQ0FBQTtBQUNBLFVBQUEsRUFBQSxpQkFBQTtPQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsY0FBQSxDQUFBLFNBQ0EsQ0FBQSxXQUFBLENBQUEsQ0FBQTtLQVVBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FDQSxVQUFBLENBQUEsNkJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTtBQ2pUQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FDQSxLQUFBLENBQUEsZ0NBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxtQ0FBQTtBQUNBLGVBQUEsRUFBQSxnREFBQTtBQUNBLGNBQUEsRUFBQSxzQ0FBQTtHQUNBLENBQUEsQ0FDQSxLQUFBLENBQUEsK0JBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSx1QkFBQTtBQUNBLFVBQUEsRUFBQTtBQUNBLGdCQUFBLEVBQUEsSUFBQTtLQUNBO0FBQ0EsZUFBQSxFQUFBLGdEQUFBO0FBQ0EsY0FBQSxFQUFBLHNDQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsc0NBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsWUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsU0FBQSxFQUFBLE9BQUEsRUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLGNBQUEsRUFBQSxrQkFBQSxFQUFBOztBQUVBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsS0FBQSxHQUFBO0FBQ0Esa0JBQUEsRUFBQSxFQUFBO0FBQ0EsY0FBQSxFQUFBLEVBQUE7QUFDQSxtQkFBQSxFQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLFFBQUEsRUFBQSxLQUFBO0FBQ0EsV0FBQSxFQUFBLEtBQUE7QUFDQSxVQUFBLEVBQUEsS0FBQTtBQUNBLFdBQUEsRUFBQSxFQUFBO0FBQ0Esc0JBQUEsRUFBQSxNQUFBO0FBQ0EsU0FBQSxFQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQTtBQUNBLFFBQUEsRUFBQSxFQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFlBQUEsR0FBQSxJQUFBLENBQUE7Ozs7QUFJQSxRQUFBLENBQUEsZUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBOzs7O0FBSUEsVUFBQSxDQUFBLGdCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7Ozs7QUFJQSxRQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsWUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxlQUFBLEdBQUEsS0FBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUEsV0FBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEVBQUEsY0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxHQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLEdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEdBQUEsZUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLGlCQUFBLENBQUEsU0FDQSxDQUFBLFdBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsaUJBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFNBQUEsRUFBQSxTQUFBLEVBQUEsVUFBQSxFQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsV0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxlQUFBLEVBQUEsSUFBQSxDQUFBLE9BQUE7QUFDQSxpQkFBQSxFQUFBLElBQUEsQ0FBQSxHQUFBO1dBQ0EsQ0FBQSxDQUFBO1NBQ0E7T0FDQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsZ0JBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsV0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSw2QkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFHQSxRQUFBLENBQUEsWUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGdCQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsRUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsSUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSx1QkFBQSxDQUFBLENBQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQTtLQUNBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQTtLQUNBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxRQUFBLE9BQUEsR0FBQSxJQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0EsU0FBQSxJQUFBLElBQUEsSUFBQSxNQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0E7QUFDQSxRQUFBLE9BQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsV0FBQSxDQUFBLENBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxFQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxFQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsTUFBQSxDQUFBLFdBQUEsRUFBQSxJQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtLQUNBOztBQUVBLFFBQUEsT0FBQSxHQUFBO0FBQ0EsWUFBQSxFQUFBLE1BQUE7QUFDQSxTQUFBLEVBQUEsMkJBQUE7QUFDQSxhQUFBLEVBQUE7QUFDQSxzQkFBQSxFQUFBLFNBQUE7T0FDQTtBQUNBLHNCQUFBLEVBQUEsT0FBQSxDQUFBLFFBQUE7QUFDQSxVQUFBLEVBQUEsT0FBQTtLQUNBLENBQUE7QUFDQSxTQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLFlBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsRUFBQSxDQUFBLGdDQUFBLEVBQUE7QUFDQSxzQkFBQSxFQUFBLFlBQUEsQ0FBQSxVQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0EsTUFBQTtBQUNBLGNBQUEsQ0FBQSxFQUFBLENBQUEsZ0NBQUEsQ0FBQSxDQUFBO09BQ0E7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLDRCQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFHQSxRQUFBLENBQUEsV0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLFlBQUEsQ0FBQSxTQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsa0JBQUEsQ0FBQSxZQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLDBCQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLE9BQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxHQUFBLENBQUEsU0FBQSxHQUFBLE9BQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxHQUFBLFNBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7T0FDQSxDQUFBLFNBQ0EsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxpQkFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLFlBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxVQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsK0JBQUEsQ0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsY0FBQSxFQUFBLENBQUE7QUFDQSxlQUFBO09BQ0E7O0FBRUEsWUFBQSxDQUFBLGlCQUFBLENBQUEsUUFBQSxDQUFBLFlBQUEsQ0FBQSxVQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGNBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsS0FBQSxFQUFBLEVBQUE7VUFPQSw2QkFBQSxHQUFBLFNBQUEsNkJBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLGVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxFQUFBLGNBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsZ0JBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEVBQUEsY0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsR0FBQSxlQUFBLENBQUEsQ0FBQTtPQUNBOztVQUVBLGlCQUFBLEdBQUEsU0FBQSxpQkFBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFNBQUEsRUFBQSxTQUFBLEVBQUEsVUFBQSxFQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsV0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUEsQ0FBQSxPQUFBO0FBQ0EsbUJBQUEsRUFBQSxJQUFBLENBQUEsR0FBQTthQUNBLENBQUEsQ0FBQTtXQUNBO1NBQ0EsQ0FBQSxDQUFBOztBQUVBLGNBQUEsQ0FBQSxnQkFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO09BQ0E7O1VBRUEsV0FBQSxHQUFBLFNBQUEsV0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLGFBQUEsQ0FBQSw2QkFBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtPQUNBOztBQXJDQSxZQUFBLENBQUEsZ0JBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLHdCQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsV0FBQSxFQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsUUFBQTtPQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsNkJBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxpQkFBQSxDQUFBLFNBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQTtLQWtDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFlBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLGFBQUEsV0FBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFVBQUEsUUFBQSxHQUFBLFFBQUEsQ0FBQSxhQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFVBQUEsUUFBQSxDQUFBLElBQUEsSUFBQSxFQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBO09BQ0E7QUFDQSxhQUFBLFFBQUEsQ0FBQTtLQUNBOztBQUVBLFFBQUEsUUFBQSxHQUFBLFdBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsSUFBQSxHQUFBLFFBQUEsQ0FBQSxRQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsR0FBQSxLQUFBLElBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUE7S0FDQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEVBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsT0FBQSxDQUFBLG9CQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxTQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsR0FBQTtLQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxNQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxtQkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFlBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsWUFBQSxFQUFBLEVBQUE7QUFDQSxjQUFBLEVBQUEsRUFBQTtBQUNBLFFBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxtQkFBQSxFQUFBLEtBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxjQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxpQkFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxzQkFBQSxDQUNBLFdBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLE1BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFdBQUEsb0JBQUEsR0FBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGdCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEtBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxLQUFBLEdBQUE7QUFDQSxvQkFBQSxFQUFBLEVBQUE7QUFDQSxnQkFBQSxFQUFBLEVBQUE7QUFDQSxxQkFBQSxFQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsRUFBQTtBQUNBLFVBQUEsRUFBQSxLQUFBO0FBQ0EsYUFBQSxFQUFBLEtBQUE7QUFDQSxZQUFBLEVBQUEsS0FBQTtBQUNBLGFBQUEsRUFBQSxDQUFBO0FBQ0EsV0FBQSxFQUFBLEVBQUE7QUFDQSxjQUFBLEVBQUEsRUFBQTtBQUNBLGdCQUFBLEVBQUEsRUFBQTtBQUNBLFVBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxxQkFBQSxFQUFBLEtBQUE7T0FDQSxDQUFBO0FBQ0Esd0JBQUEsRUFBQSxNQUFBO0tBQ0EsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxPQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOzs7O0FBSUEsUUFBQSxDQUFBLGtCQUFBLEdBQUEsVUFBQSxpQkFBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FDQSxrQkFBQSxDQUFBO0FBQ0EsUUFBQSxFQUFBLGlCQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxjQUFBLENBQUEsU0FDQSxDQUFBLFdBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsY0FBQSxDQUFBLEdBQUEsRUFBQTs7QUFFQSxZQUFBLENBQUEsZ0JBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7O0FBRUEsVUFBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxjQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsWUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsbUJBQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsV0FBQSxJQUFBLElBQUEsSUFBQSxPQUFBLEVBQUE7QUFDQSxvQkFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGFBQUEsRUFBQSxJQUFBO0FBQ0EsZUFBQSxFQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7T0FDQTtBQUNBLG9CQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsMkJBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxhQUFBLEVBQUEsSUFBQTtTQUNBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLGtCQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLGtCQUFBLEdBQUEsTUFBQSxDQUFBO09BQ0E7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxZQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLGNBQUEsR0FBQSxtQkFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLGFBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLFdBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsWUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsR0FBQSxFQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLFVBQUEsRUFDQSxNQUFBLENBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtHQUNBLEVBQUEsSUFBQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNsWkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQ0EsS0FBQSxDQUFBLG1DQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsMkJBQUE7QUFDQSxVQUFBLEVBQUE7QUFDQSxnQkFBQSxFQUFBLElBQUE7S0FDQTtBQUNBLGVBQUEsRUFBQSx3Q0FBQTtBQUNBLGNBQUEsRUFBQSw4QkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFHQSxHQUFBLENBQUEsVUFBQSxDQUFBLDhCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQSxjQUFBLEVBQUEsa0JBQUEsRUFBQTtBQUNBLE1BQUEsS0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsa0JBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxTQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEVBQUEsQ0FBQSxnQ0FBQSxDQUFBLENBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQTtHQUNBOztBQUVBLFFBQUEsQ0FBQSxLQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxJQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFVBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0tBQ0EsTUFBQTtBQUNBLFlBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsSUFBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLENBQUEsOEJBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ3pDQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FDQSxLQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUEseUJBQUE7QUFDQSxjQUFBLEVBQUEsZ0JBQUE7R0FDQSxDQUFBLENBQ0EsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxRQUFBO0FBQ0EsZUFBQSxFQUFBLDBCQUFBO0FBQ0EsY0FBQSxFQUFBLGdCQUFBO0dBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsV0FBQTtBQUNBLGVBQUEsRUFBQSw2QkFBQTtBQUNBLGNBQUEsRUFBQSxnQkFBQTtHQUNBLENBQUEsQ0FDQSxLQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLE9BQUE7QUFDQSxlQUFBLEVBQUEseUJBQUE7QUFDQSxjQUFBLEVBQUEsZ0JBQUE7R0FDQSxDQUFBLENBQ0EsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxRQUFBO0FBQ0EsZUFBQSxFQUFBLDBCQUFBO0FBQ0EsY0FBQSxFQUFBLGdCQUFBO0dBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxTQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsVUFBQTtBQUNBLGVBQUEsRUFBQSw0QkFBQTtBQUNBLGNBQUEsRUFBQSxnQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGdCQUFBLEVBQUEsQ0FBQSxZQUFBLEVBQ0EsUUFBQSxFQUNBLFFBQUEsRUFDQSxPQUFBLEVBQ0EsV0FBQSxFQUNBLFNBQUEsRUFDQSxhQUFBLEVBQ0EsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsU0FBQSxFQUFBLE9BQUEsRUFBQSxXQUFBLEVBQUE7O0FBRUEsUUFBQSxDQUFBLGNBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxJQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUEsS0FBQTtBQUNBLGVBQUEsRUFBQSxLQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxLQUFBO0tBQ0E7QUFDQSxlQUFBLEVBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxLQUFBO0tBQ0E7R0FDQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLHFCQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxpQkFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsS0FBQTtPQUNBO0tBQ0EsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTs7QUFFQSxVQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsR0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEtBQUE7S0FDQSxDQUFBOztBQUVBLGVBQUEsQ0FDQSxlQUFBLENBQUEsTUFBQSxDQUFBLGNBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSx1QkFBQSxDQUFBLFNBQ0EsQ0FBQSxvQkFBQSxDQUFBLENBQUE7O0FBRUEsYUFBQSx1QkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFVBQUEsR0FBQSxDQUFBLE1BQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsY0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxHQUFBLElBQUEsQ0FBQTtPQUNBO0tBQ0E7O0FBRUEsYUFBQSxvQkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFVBQUEsR0FBQSxDQUFBLE1BQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsR0FBQTtBQUNBLGFBQUEsRUFBQSx1QkFBQTtBQUNBLGlCQUFBLEVBQUEsSUFBQTtTQUNBLENBQUE7QUFDQSxlQUFBO09BQ0E7QUFDQSxZQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsR0FBQTtBQUNBLFdBQUEsRUFBQSxrQ0FBQTtBQUNBLGVBQUEsRUFBQSxJQUFBO09BQ0EsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7Ozs7O0FBTUEsUUFBQSxDQUFBLGlCQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxpQkFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsS0FBQTtPQUNBO0tBQ0EsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLGVBQUEsQ0FDQSxlQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxtQkFBQSxDQUFBLFNBQ0EsQ0FBQSxnQkFBQSxDQUFBLENBQUE7O0FBRUEsYUFBQSxtQkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFVBQUEsR0FBQSxDQUFBLE1BQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsTUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxHQUFBLElBQUEsQ0FBQTtPQUNBO0tBQ0E7O0FBRUEsYUFBQSxnQkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFVBQUEsR0FBQSxDQUFBLE1BQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsR0FBQTtBQUNBLGFBQUEsRUFBQSx1QkFBQTtBQUNBLGlCQUFBLEVBQUEsSUFBQTtTQUNBLENBQUE7QUFDQSxlQUFBO09BQ0E7O0FBRUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEdBQUE7QUFDQSxXQUFBLEVBQUEsa0NBQUE7QUFDQSxlQUFBLEVBQUEsSUFBQTtPQUNBLENBQUE7S0FDQTtHQUNBLENBQUE7OztDQUdBLENBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxTQUFBLENBQUEsU0FBQSxFQUFBLFVBQUEsT0FBQSxFQUFBO0FBQ0EsU0FBQTtBQUNBLFlBQUEsRUFBQSxJQUFBO0FBQ0EsUUFBQSxFQUFBLGNBQUEsTUFBQSxFQUFBLFFBQUEsRUFBQTtBQUNBLFVBQUEsR0FBQSxHQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLFNBQUEsR0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsU0FBQSxDQUFBOztBQUVBLGVBQUEsWUFBQSxHQUFBOztBQUVBLFlBQUEsT0FBQSxDQUFBLFdBQUEsR0FBQSxTQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLEVBQUEsT0FBQSxDQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsTUFBQSxDQUFBLENBQUE7U0FDQSxNQUFBO0FBQ0Esa0JBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBO1NBQ0E7T0FDQTs7QUFFQSxZQUFBLENBQUEsR0FBQSxDQUFBLG1CQUFBLEVBQUEsWUFBQTtBQUNBLFdBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxFQUFBLFlBQUEsQ0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsWUFBQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FDL0tBLEdBQUEsQ0FBQSxPQUFBLENBQUEsb0JBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxXQUFBLFdBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEsZUFBQSxHQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDJCQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEsa0JBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsNEJBQUEsR0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLHFCQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLGtDQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLGVBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsNEJBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEseUJBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsa0NBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEsMEJBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsMkJBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFNBQUE7QUFDQSxlQUFBLEVBQUEsV0FBQTtBQUNBLG1CQUFBLEVBQUEsZUFBQTtBQUNBLHNCQUFBLEVBQUEsa0JBQUE7QUFDQSxtQkFBQSxFQUFBLGVBQUE7QUFDQSx5QkFBQSxFQUFBLHFCQUFBO0FBQ0EsNkJBQUEsRUFBQSx5QkFBQTtBQUNBLDhCQUFBLEVBQUEsMEJBQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBLENBQUE7O0FDdkNBLEdBQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxFQUFBLENBQUEsT0FBQSxFQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLFdBQUEsZUFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSx1QkFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsV0FBQSxlQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLHVCQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxTQUFBO0FBQ0EsbUJBQUEsRUFBQSxlQUFBO0FBQ0EsbUJBQUEsRUFBQSxlQUFBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQSxDQUFBOztBQ2hCQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFdBQUE7QUFDQSxlQUFBLEVBQUEsaUNBQUE7QUFDQSxjQUFBLEVBQUEsbUJBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxtQkFBQSxFQUFBLENBQUEsWUFBQSxFQUNBLFFBQUEsRUFDQSxRQUFBLEVBQ0EsT0FBQSxFQUNBLFdBQUEsRUFDQSxTQUFBLEVBQ0EsZ0JBQUEsRUFDQSxVQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxTQUFBLEVBQUEsT0FBQSxFQUFBLGNBQUEsRUFBQTs7QUFFQSxRQUFBLENBQUEsVUFBQSxHQUFBLENBQ0Esa0JBQUEsRUFDQSxTQUFBLEVBQ0EsVUFBQSxFQUNBLE9BQUEsRUFDQSxXQUFBLEVBQ0EsU0FBQSxFQUNBLGFBQUEsRUFDQSxXQUFBLEVBQ0EsWUFBQSxFQUNBLE9BQUEsRUFDQSxhQUFBLEVBQ0EsU0FBQSxFQUNBLFlBQUEsRUFDQSxVQUFBLEVBQ0EsTUFBQSxFQUNBLGFBQUEsRUFDQSxPQUFBLEVBQ0EsbUJBQUEsRUFDQSxPQUFBLEVBQ0EsTUFBQSxFQUNBLDZCQUFBLENBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxPQUFBLEVBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxLQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxJQUFBLEdBQUEsSUFBQSxRQUFBLEVBQUEsQ0FBQTtBQUNBLFNBQUEsSUFBQSxJQUFBLElBQUEsTUFBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtLQUNBO0FBQ0Esa0JBQUEsQ0FDQSxXQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLGVBQUEsQ0FBQSxTQUNBLENBQUEsVUFBQSxDQUFBLENBQUE7O0FBRUEsYUFBQSxlQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLEdBQUEsQ0FBQSxNQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLEdBQUEscURBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsZUFBQSxDQUFBLE9BQUEsQ0FBQSxvQkFBQSxDQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsZUFBQTtPQUNBO0FBQ0EsWUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLEdBQUEsb0RBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsVUFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxHQUFBLENBQUEsTUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUE7QUFDQSxhQUFBLEVBQUEsR0FBQSxDQUFBLElBQUE7U0FDQSxDQUFBO0FBQ0EsZUFBQTtPQUNBO0FBQ0EsWUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLGVBQUEsRUFBQSxJQUFBO0FBQ0EsV0FBQSxFQUFBLG9EQUFBO09BQ0EsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtDQUNBLENBQ0EsQ0FBQSxDQUFBO0FDekZBLEdBQUEsQ0FBQSxPQUFBLENBQUEsZ0JBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxXQUFBLFdBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsRUFBQSxNQUFBO0FBQ0EsU0FBQSxFQUFBLGNBQUE7QUFDQSxhQUFBLEVBQUE7QUFDQSxzQkFBQSxFQUFBLFNBQUE7T0FDQTtBQUNBLHNCQUFBLEVBQUEsT0FBQSxDQUFBLFFBQUE7QUFDQSxVQUFBLEVBQUEsSUFBQTtLQUNBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFNBQUE7QUFDQSxlQUFBLEVBQUEsV0FBQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUEsQ0FBQTtBQ2pCQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsYUFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLGNBQUE7QUFDQSxlQUFBLEVBQUEsdUNBQUE7QUFDQSxjQUFBLEVBQUEsc0JBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBR0EsR0FBQSxDQUFBLFVBQUEsQ0FBQSxzQkFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFdBQUEsRUFBQSxhQUFBLEVBQUE7QUFDQSxRQUFBLENBQUEsT0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFdBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBO0tBQ0EsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQSw2QkFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFdBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsYUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxFQUFBLENBQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsZUFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsWUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFNBQUEsSUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsR0FBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUE7QUFDQSxVQUFBLEdBQUEsR0FBQSxNQUFBLENBQUEsV0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsZUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLG9CQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO09BQ0E7S0FDQTtBQUNBLGNBQUEsQ0FBQSxZQUFBO0FBQ0EsYUFBQSxDQUFBLEdBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EscUJBQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7T0FDQSxFQUFBLEVBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsSUFBQSxFQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsUUFBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxLQUFBLElBQUEsQ0FBQSxDQUFBLEVBQUE7QUFDQSxTQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7S0FDQSxNQUFBO0FBQ0EsU0FBQSxDQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxRQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUEsTUFBQSxJQUFBLENBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7S0FDQSxNQUFBO0FBQ0EsV0FBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsR0FBQSxDQUFBLHVCQUFBLEVBQUEsS0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLGVBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLGVBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7T0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxxQkFBQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxVQUFBLENBQUEsMEJBQUEsR0FBQSxVQUFBLENBQUEsR0FBQSxHQUFBLEdBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLGVBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsZUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSx1QkFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsVUFBQSxDQUFBLDJCQUFBLEdBQUEsVUFBQSxDQUFBLEdBQUEsR0FBQSxHQUFBLEdBQUEsVUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFVBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxlQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGVBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsd0JBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsT0FBQSxHQUFBLFVBQUEsVUFBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLGlDQUFBLEVBQUEsVUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsVUFBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLGtDQUFBLEVBQUEsVUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG53aW5kb3cuYXBwID0gYW5ndWxhci5tb2R1bGUoJ0Z1bGxzdGFja0dlbmVyYXRlZEFwcCcsIFsnZnNhUHJlQnVpbHQnLCAndWkucm91dGVyJywgJ3VpLmJvb3RzdHJhcCcsICduZ0FuaW1hdGUnLCAnbmdDb29raWVzJywgJ3lhcnUyMi5hbmd1bGFyLXRpbWVhZ28nXSk7XHJcblxyXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyLCAkdWlWaWV3U2Nyb2xsUHJvdmlkZXIpIHtcclxuICAgIC8vIFRoaXMgdHVybnMgb2ZmIGhhc2hiYW5nIHVybHMgKC8jYWJvdXQpIGFuZCBjaGFuZ2VzIGl0IHRvIHNvbWV0aGluZyBub3JtYWwgKC9hYm91dClcclxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcclxuICAgIC8vIElmIHdlIGdvIHRvIGEgVVJMIHRoYXQgdWktcm91dGVyIGRvZXNuJ3QgaGF2ZSByZWdpc3RlcmVkLCBnbyB0byB0aGUgXCIvXCIgdXJsLlxyXG4gICAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xyXG4gICAgLy8gJHVpVmlld1Njcm9sbFByb3ZpZGVyLnVzZUFuY2hvclNjcm9sbCgpO1xyXG59KTtcclxuXHJcbi8vIFRoaXMgYXBwLnJ1biBpcyBmb3IgY29udHJvbGxpbmcgYWNjZXNzIHRvIHNwZWNpZmljIHN0YXRlcy5cclxuYXBwLnJ1bihmdW5jdGlvbiAoJHJvb3RTY29wZSwgQXV0aFNlcnZpY2UsICRzdGF0ZSwgJHVpVmlld1Njcm9sbCwgU2Vzc2lvblNlcnZpY2UsIEFwcENvbmZpZykge1xyXG4gICAgLy8gVGhlIGdpdmVuIHN0YXRlIHJlcXVpcmVzIGFuIGF1dGhlbnRpY2F0ZWQgdXNlci5cclxuICAgIC8vIHZhciBkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBdXRoID0gZnVuY3Rpb24gKHN0YXRlKSB7XHJcbiAgICAvLyAgICAgcmV0dXJuIHN0YXRlLmRhdGEgJiYgc3RhdGUuZGF0YS5hdXRoZW50aWNhdGU7XHJcbiAgICAvLyB9O1xyXG5cclxuICAgIEFwcENvbmZpZy5mZXRjaENvbmZpZygpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2cocmVzKTtcclxuICAgICAgICBBcHBDb25maWcuc2V0Q29uZmlnKHJlcy5kYXRhKTtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhBcHBDb25maWcuaXNDb25maWdQYXJhbXN2YWlsYWJsZSk7XHJcbiAgICB9KVxyXG5cclxuICAgIC8vICRzdGF0ZUNoYW5nZVN0YXJ0IGlzIGFuIGV2ZW50IGZpcmVkXHJcbiAgICAvLyB3aGVuZXZlciB0aGUgcHJvY2VzcyBvZiBjaGFuZ2luZyBhIHN0YXRlIGJlZ2lucy5cclxuICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uIChldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMpIHtcclxuICAgICAgICAvLyBpZih0b1N0YXRlID0gJ2FydGlzdFRvb2xzJykge1xyXG4gICAgICAgIC8vICAgICB2YXIgdXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcclxuICAgICAgICAvLyAgICAgY29uc29sZS5sb2codXNlcik7XHJcbiAgICAgICAgLy8gfVxyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdyZWFjaGVkIGhlcmUnKTtcclxuICAgICAgICAvLyBpZiAoIWRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGgodG9TdGF0ZSkpIHtcclxuICAgICAgICAvLyAgICAgLy8gVGhlIGRlc3RpbmF0aW9uIHN0YXRlIGRvZXMgbm90IHJlcXVpcmUgYXV0aGVudGljYXRpb25cclxuICAgICAgICAvLyAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cclxuICAgICAgICAvLyAgICAgcmV0dXJuO1xyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgLy8gaWYgKEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpKSB7XHJcbiAgICAgICAgLy8gICAgIC8vIFRoZSB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQuXHJcbiAgICAgICAgLy8gICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXHJcbiAgICAgICAgLy8gICAgIHJldHVybjtcclxuICAgICAgICAvLyB9XHJcblxyXG4gICAgICAgIC8vIC8vIENhbmNlbCBuYXZpZ2F0aW5nIHRvIG5ldyBzdGF0ZS5cclxuICAgICAgICAvLyBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG5cclxuICAgICAgICAvLyBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XHJcbiAgICAgICAgLy8gICAgIC8vIElmIGEgdXNlciBpcyByZXRyaWV2ZWQsIHRoZW4gcmVuYXZpZ2F0ZSB0byB0aGUgZGVzdGluYXRpb25cclxuICAgICAgICAvLyAgICAgLy8gKHRoZSBzZWNvbmQgdGltZSwgQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkgd2lsbCB3b3JrKVxyXG4gICAgICAgIC8vICAgICAvLyBvdGhlcndpc2UsIGlmIG5vIHVzZXIgaXMgbG9nZ2VkIGluLCBnbyB0byBcImxvZ2luXCIgc3RhdGUuXHJcbiAgICAgICAgLy8gICAgIGlmICh1c2VyKSB7XHJcbiAgICAgICAgLy8gICAgICAgICAkc3RhdGUuZ28odG9TdGF0ZS5uYW1lLCB0b1BhcmFtcyk7XHJcbiAgICAgICAgLy8gICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gICAgICAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XHJcbiAgICAgICAgLy8gICAgIH1cclxuICAgICAgICAvLyB9KTtcclxuXHJcbiAgICB9KTtcclxuXHJcbn0pO1xyXG5cclxuXHJcbmFwcC5kaXJlY3RpdmUoJ2ZpbGVyZWFkJywgW2Z1bmN0aW9uICgpIHtcclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgc2NvcGU6IHtcclxuICAgICAgICAgICAgZmlsZXJlYWQ6ICc9JyxcclxuICAgICAgICAgICAgbWVzc2FnZTogJz0nXHJcbiAgICAgICAgfSxcclxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJpYnV0ZXMpIHtcclxuICAgICAgICAgICAgZWxlbWVudC5iaW5kKCdjaGFuZ2UnLCBmdW5jdGlvbiAoY2hhbmdlRXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUubWVzc2FnZSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbDogJydcclxuICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGlmKGNoYW5nZUV2ZW50LnRhcmdldC5maWxlc1swXS50eXBlICE9IFwiYXVkaW8vbXBlZ1wiICYmIGNoYW5nZUV2ZW50LnRhcmdldC5maWxlc1swXS50eXBlICE9IFwiYXVkaW8vbXAzXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUubWVzc2FnZSA9IHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWw6ICdFcnJvcjogUGxlYXNlIHVwbG9hZCBtcDMgZm9ybWF0IGZpbGUuJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnZhbChudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBcclxuICAgICAgICAgICAgICAgICAgICBpZihjaGFuZ2VFdmVudC50YXJnZXQuZmlsZXNbMF0uc2l6ZSA+IDIwKjEwMDAqMTAwMCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5tZXNzYWdlID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbDogJ0Vycm9yOiBQbGVhc2UgdXBsb2FkIGZpbGUgdXB0byAyMCBNQiBzaXplLidcclxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC52YWwobnVsbCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUuZmlsZXJlYWQgPSBjaGFuZ2VFdmVudC50YXJnZXQuZmlsZXNbMF07XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG59XSk7XHJcbiIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZGF0YWJhc2UnLCB7XHJcbiAgICB1cmw6ICcvYWRtaW4vZGF0YWJhc2UnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9kYXRhYmFzZS9kYXRhYmFzZS5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdEYXRhYmFzZUNvbnRyb2xsZXInXHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuYXBwLmRpcmVjdGl2ZSgnbm90aWZpY2F0aW9uQmFyJywgWydzb2NrZXQnLCBmdW5jdGlvbihzb2NrZXQpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICBzY29wZTogdHJ1ZSxcclxuICAgIHRlbXBsYXRlOiAnPGRpdiBzdHlsZT1cIm1hcmdpbjogMCBhdXRvO3dpZHRoOjUwJVwiIG5nLXNob3c9XCJiYXIudmlzaWJsZVwiPicgK1xyXG4gICAgICAnPHVpYi1wcm9ncmVzcz48dWliLWJhciB2YWx1ZT1cImJhci52YWx1ZVwiIHR5cGU9XCJ7e2Jhci50eXBlfX1cIj48c3Bhbj57e2Jhci52YWx1ZX19JTwvc3Bhbj48L3VpYi1iYXI+PC91aWItcHJvZ3Jlc3M+JyArXHJcbiAgICAgICc8L2Rpdj4nLFxyXG4gICAgbGluazogZnVuY3Rpb24oJHNjb3BlLCBpRWxtLCBpQXR0cnMsIGNvbnRyb2xsZXIpIHtcclxuICAgICAgc29ja2V0Lm9uKCdub3RpZmljYXRpb24nLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICAgICAgdmFyIHBlcmNlbnRhZ2UgPSBwYXJzZUludChNYXRoLmZsb29yKGRhdGEuY291bnRlciAvIGRhdGEudG90YWwgKiAxMDApLCAxMCk7XHJcbiAgICAgICAgJHNjb3BlLmJhci52YWx1ZSA9IHBlcmNlbnRhZ2U7XHJcbiAgICAgICAgaWYgKHBlcmNlbnRhZ2UgPT09IDEwMCkge1xyXG4gICAgICAgICAgJHNjb3BlLmJhci52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAkc2NvcGUuYmFyLnZhbHVlID0gMDtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcbn1dKTtcclxuXHJcbmFwcC5jb250cm9sbGVyKCdEYXRhYmFzZUNvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsIEF1dGhTZXJ2aWNlLCBzb2NrZXQpIHtcclxuICAkc2NvcGUuYWRkVXNlciA9IHt9O1xyXG4gICRzY29wZS5xdWVyeSA9IHt9O1xyXG4gICRzY29wZS50cmRVc3JRdWVyeSA9IHt9O1xyXG4gICRzY29wZS5xdWVyeUNvbHMgPSBbe1xyXG4gICAgbmFtZTogJ3VzZXJuYW1lJyxcclxuICAgIHZhbHVlOiAndXNlcm5hbWUnXHJcbiAgfSwge1xyXG4gICAgbmFtZTogJ2dlbnJlJyxcclxuICAgIHZhbHVlOiAnZ2VucmUnXHJcbiAgfSwge1xyXG4gICAgbmFtZTogJ25hbWUnLFxyXG4gICAgdmFsdWU6ICduYW1lJ1xyXG4gIH0sIHtcclxuICAgIG5hbWU6ICdVUkwnLFxyXG4gICAgdmFsdWU6ICdzY1VSTCdcclxuICB9LCB7XHJcbiAgICBuYW1lOiAnZW1haWwnLFxyXG4gICAgdmFsdWU6ICdlbWFpbCdcclxuICB9LCB7XHJcbiAgICBuYW1lOiAnZGVzY3JpcHRpb24nLFxyXG4gICAgdmFsdWU6ICdkZXNjcmlwdGlvbidcclxuICB9LCB7XHJcbiAgICBuYW1lOiAnZm9sbG93ZXJzJyxcclxuICAgIHZhbHVlOiAnZm9sbG93ZXJzJ1xyXG4gIH0sIHtcclxuICAgIG5hbWU6ICdudW1iZXIgb2YgdHJhY2tzJyxcclxuICAgIHZhbHVlOiAnbnVtVHJhY2tzJ1xyXG4gIH0sIHtcclxuICAgIG5hbWU6ICdmYWNlYm9vaycsXHJcbiAgICB2YWx1ZTogJ2ZhY2Vib29rVVJMJ1xyXG4gIH0sIHtcclxuICAgIG5hbWU6ICdpbnN0YWdyYW0nLFxyXG4gICAgdmFsdWU6ICdpbnN0YWdyYW1VUkwnXHJcbiAgfSwge1xyXG4gICAgbmFtZTogJ3R3aXR0ZXInLFxyXG4gICAgdmFsdWU6ICd0d2l0dGVyVVJMJ1xyXG4gIH0sIHtcclxuICAgIG5hbWU6ICd5b3V0dWJlJyxcclxuICAgIHZhbHVlOiAneW91dHViZVVSTCdcclxuICB9LCB7XHJcbiAgICBuYW1lOiAnd2Vic2l0ZXMnLFxyXG4gICAgdmFsdWU6ICd3ZWJzaXRlcydcclxuICB9LCB7XHJcbiAgICBuYW1lOiAnYXV0byBlbWFpbCBkYXknLFxyXG4gICAgdmFsdWU6ICdlbWFpbERheU51bSdcclxuICB9LCB7XHJcbiAgICBuYW1lOiAnYWxsIGVtYWlscycsXHJcbiAgICB2YWx1ZTogJ2FsbEVtYWlscydcclxuICB9XTtcclxuICAkc2NvcGUuZG93bmxvYWRCdXR0b25WaXNpYmxlID0gZmFsc2U7XHJcbiAgJHNjb3BlLnRyYWNrID0ge1xyXG4gICAgdHJhY2tVcmw6ICcnLFxyXG4gICAgZG93bmxvYWRVcmw6ICcnLFxyXG4gICAgZW1haWw6ICcnXHJcbiAgfTtcclxuICAkc2NvcGUuYmFyID0ge1xyXG4gICAgdHlwZTogJ3N1Y2Nlc3MnLFxyXG4gICAgdmFsdWU6IDAsXHJcbiAgICB2aXNpYmxlOiBmYWxzZVxyXG4gIH07XHJcbiAgJHNjb3BlLnBhaWRSZXBvc3QgPSB7XHJcbiAgICBzb3VuZENsb3VkVXJsOiAnJ1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICRodHRwLmdldCgnL2FwaS9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4nO1xyXG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIGFsZXJ0KCdXcm9uZyBQYXNzd29yZCcpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuc2F2ZUFkZFVzZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICRzY29wZS5hZGRVc2VyLnBhc3N3b3JkID0gJHJvb3RTY29wZS5wYXNzd29yZDtcclxuICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvYWRkdXNlcicsICRzY29wZS5hZGRVc2VyKVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICBhbGVydChcIlN1Y2Nlc3M6IERhdGFiYXNlIGlzIGJlaW5nIHBvcHVsYXRlZC4gWW91IHdpbGwgYmUgZW1haWxlZCB3aGVuIGl0IGlzIGNvbXBsZXRlLlwiKTtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICRzY29wZS5iYXIudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICBhbGVydCgnQmFkIHN1Ym1pc3Npb24nKTtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gICRzY29wZS5jcmVhdGVVc2VyUXVlcnlEb2MgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBxdWVyeSA9IHt9O1xyXG4gICAgaWYgKCRzY29wZS5xdWVyeS5hcnRpc3QgPT0gXCJhcnRpc3RzXCIpIHtcclxuICAgICAgcXVlcnkuYXJ0aXN0ID0gdHJ1ZTtcclxuICAgIH0gZWxzZSBpZiAoJHNjb3BlLnF1ZXJ5LmFydGlzdCA9PSBcIm5vbi1hcnRpc3RzXCIpIHtcclxuICAgICAgcXVlcnkuYXJ0aXN0ID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgICB2YXIgZmx3clFyeSA9IHt9O1xyXG4gICAgaWYgKCRzY29wZS5xdWVyeS5mb2xsb3dlcnNHVCkge1xyXG4gICAgICBmbHdyUXJ5LiRndCA9ICRzY29wZS5xdWVyeS5mb2xsb3dlcnNHVDtcclxuICAgICAgcXVlcnkuZm9sbG93ZXJzID0gZmx3clFyeTtcclxuICAgIH1cclxuICAgIGlmICgkc2NvcGUucXVlcnkuZm9sbG93ZXJzTFQpIHtcclxuICAgICAgZmx3clFyeS4kbHQgPSAkc2NvcGUucXVlcnkuZm9sbG93ZXJzTFQ7XHJcbiAgICAgIHF1ZXJ5LmZvbGxvd2VycyA9IGZsd3JRcnk7XHJcbiAgICB9XHJcbiAgICBpZiAoJHNjb3BlLnF1ZXJ5LmdlbnJlKSBxdWVyeS5nZW5yZSA9ICRzY29wZS5xdWVyeS5nZW5yZTtcclxuICAgIGlmICgkc2NvcGUucXVlcnlDb2xzKSB7XHJcbiAgICAgIHF1ZXJ5LmNvbHVtbnMgPSAkc2NvcGUucXVlcnlDb2xzLmZpbHRlcihmdW5jdGlvbihlbG0pIHtcclxuICAgICAgICByZXR1cm4gZWxtLnZhbHVlICE9PSBudWxsO1xyXG4gICAgICB9KS5tYXAoZnVuY3Rpb24oZWxtKSB7XHJcbiAgICAgICAgcmV0dXJuIGVsbS52YWx1ZTtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBpZiAoJHNjb3BlLnF1ZXJ5LnRyYWNrZWRVc2Vyc1VSTCkgcXVlcnkudHJhY2tlZFVzZXJzVVJMID0gJHNjb3BlLnF1ZXJ5LnRyYWNrZWRVc2Vyc1VSTDtcclxuICAgIHZhciBib2R5ID0ge1xyXG4gICAgICBxdWVyeTogcXVlcnksXHJcbiAgICAgIHBhc3N3b3JkOiAkcm9vdFNjb3BlLnBhc3N3b3JkXHJcbiAgICB9O1xyXG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS9mb2xsb3dlcnMnLCBib2R5KVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAkc2NvcGUuZmlsZW5hbWUgPSByZXMuZGF0YTtcclxuICAgICAgICAkc2NvcGUuZG93bmxvYWRCdXR0b25WaXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICB9KVxyXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICBhbGVydChcIkVSUk9SOiBCYWQgUXVlcnkgb3IgTm8gTWF0Y2hlc1wiKTtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gICRzY29wZS5jcmVhdGVUcmRVc3JRdWVyeURvYyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHF1ZXJ5ID0ge307XHJcbiAgICB2YXIgZmx3clFyeSA9IHt9O1xyXG4gICAgaWYgKCRzY29wZS50cmRVc3JRdWVyeS5mb2xsb3dlcnNHVCkge1xyXG4gICAgICBmbHdyUXJ5LiRndCA9ICRzY29wZS50cmRVc3JRdWVyeS5mb2xsb3dlcnNHVDtcclxuICAgICAgcXVlcnkuZm9sbG93ZXJzID0gZmx3clFyeTtcclxuICAgIH1cclxuICAgIGlmICgkc2NvcGUudHJkVXNyUXVlcnkuZm9sbG93ZXJzTFQpIHtcclxuICAgICAgZmx3clFyeS4kbHQgPSAkc2NvcGUudHJkVXNyUXVlcnkuZm9sbG93ZXJzTFQ7XHJcbiAgICAgIHF1ZXJ5LmZvbGxvd2VycyA9IGZsd3JRcnk7XHJcbiAgICB9XHJcbiAgICBpZiAoJHNjb3BlLnRyZFVzclF1ZXJ5LmdlbnJlKSBxdWVyeS5nZW5yZSA9ICRzY29wZS50cmRVc3JRdWVyeS5nZW5yZTtcclxuICAgIHZhciBib2R5ID0ge1xyXG4gICAgICBxdWVyeTogcXVlcnksXHJcbiAgICAgIHBhc3N3b3JkOiAkcm9vdFNjb3BlLnBhc3N3b3JkXHJcbiAgICB9O1xyXG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS90cmFja2VkVXNlcnMnLCBib2R5KVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAkc2NvcGUudHJkVXNyRmlsZW5hbWUgPSByZXMuZGF0YTtcclxuICAgICAgICAkc2NvcGUuZG93bmxvYWRUcmRVc3JCdXR0b25WaXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICB9KVxyXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICBhbGVydChcIkVSUk9SOiBCYWQgUXVlcnkgb3IgTm8gTWF0Y2hlc1wiKTtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gICRzY29wZS5kb3dubG9hZCA9IGZ1bmN0aW9uKGZpbGVuYW1lKSB7XHJcbiAgICB2YXIgYW5jaG9yID0gYW5ndWxhci5lbGVtZW50KCc8YS8+Jyk7XHJcbiAgICBhbmNob3IuYXR0cih7XHJcbiAgICAgIGhyZWY6IGZpbGVuYW1lLFxyXG4gICAgICBkb3dubG9hZDogZmlsZW5hbWVcclxuICAgIH0pWzBdLmNsaWNrKCk7XHJcbiAgICAkc2NvcGUuZG93bmxvYWRCdXR0b25WaXNpYmxlID0gZmFsc2U7XHJcbiAgICAkc2NvcGUuZG93bmxvYWRUcmRVc3JCdXR0b25WaXNpYmxlID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuc2F2ZVBhaWRSZXBvc3RDaGFubmVsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL3BhaWRyZXBvc3QnLCAkc2NvcGUucGFpZFJlcG9zdClcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgJHNjb3BlLnBhaWRSZXBvc3QgPSB7XHJcbiAgICAgICAgICBzb3VuZENsb3VkVXJsOiAnJ1xyXG4gICAgICAgIH07XHJcbiAgICAgICAgYWxlcnQoXCJTVUNDRVNTOiBVcmwgc2F2ZWQgc3VjY2Vzc2Z1bGx5XCIpO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgIGFsZXJ0KFwiRVJST1I6IEVycm9yIGluIHNhdmluZyB1cmxcIik7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICAvKiBMaXN0ZW4gdG8gc29ja2V0IGV2ZW50cyAqL1xyXG4gIHNvY2tldC5vbignbm90aWZpY2F0aW9uJywgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgdmFyIHBlcmNlbnRhZ2UgPSBwYXJzZUludChNYXRoLmZsb29yKGRhdGEuY291bnRlciAvIGRhdGEudG90YWwgKiAxMDApLCAxMCk7XHJcbiAgICAkc2NvcGUuYmFyLnZhbHVlID0gcGVyY2VudGFnZTtcclxuICAgIGlmIChwZXJjZW50YWdlID09PSAxMDApIHtcclxuICAgICAgJHNjb3BlLnN0YXR1c0JhclZpc2libGUgPSBmYWxzZTtcclxuICAgICAgJHNjb3BlLmJhci52YWx1ZSA9IDA7XHJcbiAgICB9XHJcbiAgfSk7XHJcbn0pOyIsIihmdW5jdGlvbigpIHtcclxuXHJcbiAgICAndXNlIHN0cmljdCc7XHJcbiAgICAvLyBIb3BlIHlvdSBkaWRuJ3QgZm9yZ2V0IEFuZ3VsYXIhIER1aC1kb3kuXHJcbiAgICBpZiAoIXdpbmRvdy5hbmd1bGFyKSB0aHJvdyBuZXcgRXJyb3IoJ0kgY2FuXFwndCBmaW5kIEFuZ3VsYXIhJyk7XHJcblxyXG4gICAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdmc2FQcmVCdWlsdCcsIFtdKTtcclxuXHJcbiAgICBhcHAuZmFjdG9yeSgnaW5pdFNvY2tldCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICghd2luZG93LmlvKSB0aHJvdyBuZXcgRXJyb3IoJ3NvY2tldC5pbyBub3QgZm91bmQhJyk7XHJcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5pbyh3aW5kb3cubG9jYXRpb24ub3JpZ2luKTtcclxuICAgIH0pO1xyXG5cclxuICAgIGFwcC5mYWN0b3J5KCdzb2NrZXQnLCBmdW5jdGlvbigkcm9vdFNjb3BlLCBpbml0U29ja2V0KSB7XHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgb246IGZ1bmN0aW9uKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgIGluaXRTb2NrZXQub24oZXZlbnROYW1lLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcclxuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkoaW5pdFNvY2tldCwgYXJncyk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgZW1pdDogZnVuY3Rpb24oZXZlbnROYW1lLCBkYXRhLCBjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgaW5pdFNvY2tldC5lbWl0KGV2ZW50TmFtZSwgZGF0YSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XHJcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkoaW5pdFNvY2tldCwgYXJncyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9O1xyXG4gICAgfSk7XHJcblxyXG4gICAgYXBwLmZhY3RvcnkoJ0FwcENvbmZpZycsIGZ1bmN0aW9uKCRodHRwKSB7XHJcbiAgICAgICAgdmFyIF9jb25maWdQYXJhbXMgPSBudWxsO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBmZXRjaENvbmZpZygpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9zb3VuZGNsb3VkL3NvdW5kY2xvdWRDb25maWcnKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHNldENvbmZpZyhkYXRhKSB7XHJcbiAgICAgICAgICAgIF9jb25maWdQYXJhbXMgPSBkYXRhO1xyXG4gICAgICAgICAgICBTQy5pbml0aWFsaXplKHtcclxuICAgICAgICAgICAgICAgIGNsaWVudF9pZDogZGF0YS5jbGllbnRJRCxcclxuICAgICAgICAgICAgICAgIHJlZGlyZWN0X3VyaTogZGF0YS5jYWxsYmFja1VSTCxcclxuICAgICAgICAgICAgICAgIHNjb3BlOiBcIm5vbi1leHBpcmluZ1wiXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0Q29uZmlnKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gX2NvbmZpZ1BhcmFtcztcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIGZldGNoQ29uZmlnOiBmZXRjaENvbmZpZyxcclxuICAgICAgICAgICAgZ2V0Q29uZmlnOiBnZXRDb25maWcsXHJcbiAgICAgICAgICAgIHNldENvbmZpZzogc2V0Q29uZmlnXHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG5cclxuICAgIC8vIEFVVEhfRVZFTlRTIGlzIHVzZWQgdGhyb3VnaG91dCBvdXIgYXBwIHRvXHJcbiAgICAvLyBicm9hZGNhc3QgYW5kIGxpc3RlbiBmcm9tIGFuZCB0byB0aGUgJHJvb3RTY29wZVxyXG4gICAgLy8gZm9yIGltcG9ydGFudCBldmVudHMgYWJvdXQgYXV0aGVudGljYXRpb24gZmxvdy5cclxuICAgIC8vIGFwcC5jb25zdGFudCgnQVVUSF9FVkVOVFMnLCB7XHJcbiAgICAvLyAgICAgbG9naW5TdWNjZXNzOiAnYXV0aC1sb2dpbi1zdWNjZXNzJyxcclxuICAgIC8vICAgICBsb2dpbkZhaWxlZDogJ2F1dGgtbG9naW4tZmFpbGVkJyxcclxuICAgIC8vICAgICBsb2dvdXRTdWNjZXNzOiAnYXV0aC1sb2dvdXQtc3VjY2VzcycsXHJcbiAgICAvLyAgICAgc2Vzc2lvblRpbWVvdXQ6ICdhdXRoLXNlc3Npb24tdGltZW91dCcsXHJcbiAgICAvLyAgICAgbm90QXV0aGVudGljYXRlZDogJ2F1dGgtbm90LWF1dGhlbnRpY2F0ZWQnLFxyXG4gICAgLy8gICAgIG5vdEF1dGhvcml6ZWQ6ICdhdXRoLW5vdC1hdXRob3JpemVkJ1xyXG4gICAgLy8gfSk7XHJcblxyXG4gICAgLy8gYXBwLmZhY3RvcnkoJ0F1dGhJbnRlcmNlcHRvcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRxLCBBVVRIX0VWRU5UUykge1xyXG4gICAgLy8gICAgIHZhciBzdGF0dXNEaWN0ID0ge1xyXG4gICAgLy8gICAgICAgICA0MDE6IEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsXHJcbiAgICAvLyAgICAgICAgIDQwMzogQVVUSF9FVkVOVFMubm90QXV0aG9yaXplZCxcclxuICAgIC8vICAgICAgICAgNDE5OiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCxcclxuICAgIC8vICAgICAgICAgNDQwOiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dFxyXG4gICAgLy8gICAgIH07XHJcbiAgICAvLyAgICAgcmV0dXJuIHtcclxuICAgIC8vICAgICAgICAgcmVzcG9uc2VFcnJvcjogZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgIC8vICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChzdGF0dXNEaWN0W3Jlc3BvbnNlLnN0YXR1c10sIHJlc3BvbnNlKTtcclxuICAgIC8vICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QocmVzcG9uc2UpXHJcbiAgICAvLyAgICAgICAgIH1cclxuICAgIC8vICAgICB9O1xyXG4gICAgLy8gfSk7XHJcblxyXG4gICAgLy8gYXBwLmNvbmZpZyhmdW5jdGlvbigkaHR0cFByb3ZpZGVyKSB7XHJcbiAgICAvLyAgICAgJGh0dHBQcm92aWRlci5pbnRlcmNlcHRvcnMucHVzaChbXHJcbiAgICAvLyAgICAgICAgICckaW5qZWN0b3InLFxyXG4gICAgLy8gICAgICAgICBmdW5jdGlvbigkaW5qZWN0b3IpIHtcclxuICAgIC8vICAgICAgICAgICAgIHJldHVybiAkaW5qZWN0b3IuZ2V0KCdBdXRoSW50ZXJjZXB0b3InKTtcclxuICAgIC8vICAgICAgICAgfVxyXG4gICAgLy8gICAgIF0pO1xyXG4gICAgLy8gfSk7XHJcblxyXG4gICAgLy8gYXBwLnNlcnZpY2UoJ0F1dGhTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIFNlc3Npb24sICRyb290U2NvcGUsIEFVVEhfRVZFTlRTLCAkcSkge1xyXG5cclxuICAgIC8vICAgICBmdW5jdGlvbiBvblN1Y2Nlc3NmdWxMb2dpbihyZXNwb25zZSkge1xyXG4gICAgLy8gICAgICAgICB2YXIgZGF0YSA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAvLyAgICAgICAgIFNlc3Npb24uY3JlYXRlKGRhdGEuaWQsIGRhdGEudXNlcik7XHJcbiAgICAvLyAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MpO1xyXG4gICAgLy8gICAgICAgICByZXR1cm4gZGF0YS51c2VyO1xyXG4gICAgLy8gICAgIH1cclxuXHJcbiAgICAvLyAgICAgLy8gVXNlcyB0aGUgc2Vzc2lvbiBmYWN0b3J5IHRvIHNlZSBpZiBhblxyXG4gICAgLy8gICAgIC8vIGF1dGhlbnRpY2F0ZWQgdXNlciBpcyBjdXJyZW50bHkgcmVnaXN0ZXJlZC5cclxuICAgIC8vICAgICB0aGlzLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gICAgICAgICByZXR1cm4gISFTZXNzaW9uLnVzZXI7XHJcbiAgICAvLyAgICAgfTtcclxuXHJcbiAgICAvLyAgICAgdGhpcy5nZXRMb2dnZWRJblVzZXIgPSBmdW5jdGlvbihmcm9tU2VydmVyKSB7XHJcblxyXG4gICAgLy8gICAgICAgICAvLyBJZiBhbiBhdXRoZW50aWNhdGVkIHNlc3Npb24gZXhpc3RzLCB3ZVxyXG4gICAgLy8gICAgICAgICAvLyByZXR1cm4gdGhlIHVzZXIgYXR0YWNoZWQgdG8gdGhhdCBzZXNzaW9uXHJcbiAgICAvLyAgICAgICAgIC8vIHdpdGggYSBwcm9taXNlLiBUaGlzIGVuc3VyZXMgdGhhdCB3ZSBjYW5cclxuICAgIC8vICAgICAgICAgLy8gYWx3YXlzIGludGVyZmFjZSB3aXRoIHRoaXMgbWV0aG9kIGFzeW5jaHJvbm91c2x5LlxyXG5cclxuICAgIC8vICAgICAgICAgLy8gT3B0aW9uYWxseSwgaWYgdHJ1ZSBpcyBnaXZlbiBhcyB0aGUgZnJvbVNlcnZlciBwYXJhbWV0ZXIsXHJcbiAgICAvLyAgICAgICAgIC8vIHRoZW4gdGhpcyBjYWNoZWQgdmFsdWUgd2lsbCBub3QgYmUgdXNlZC5cclxuXHJcbiAgICAvLyAgICAgICAgIGlmICh0aGlzLmlzQXV0aGVudGljYXRlZCgpICYmIGZyb21TZXJ2ZXIgIT09IHRydWUpIHtcclxuICAgIC8vICAgICAgICAgICAgIHJldHVybiAkcS53aGVuKFNlc3Npb24udXNlcik7XHJcbiAgICAvLyAgICAgICAgIH1cclxuXHJcbiAgICAvLyAgICAgICAgIC8vIE1ha2UgcmVxdWVzdCBHRVQgL3Nlc3Npb24uXHJcbiAgICAvLyAgICAgICAgIC8vIElmIGl0IHJldHVybnMgYSB1c2VyLCBjYWxsIG9uU3VjY2Vzc2Z1bExvZ2luIHdpdGggdGhlIHJlc3BvbnNlLlxyXG4gICAgLy8gICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgNDAxIHJlc3BvbnNlLCB3ZSBjYXRjaCBpdCBhbmQgaW5zdGVhZCByZXNvbHZlIHRvIG51bGwuXHJcbiAgICAvLyAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9zZXNzaW9uJykudGhlbihvblN1Y2Nlc3NmdWxMb2dpbikuY2F0Y2goZnVuY3Rpb24oKSB7XHJcbiAgICAvLyAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIC8vICAgICAgICAgfSk7XHJcblxyXG4gICAgLy8gICAgIH07XHJcblxyXG4gICAgLy8gICAgIHRoaXMubG9naW4gPSBmdW5jdGlvbihjcmVkZW50aWFscykge1xyXG4gICAgLy8gICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2xvZ2luJywgY3JlZGVudGlhbHMpXHJcbiAgICAvLyAgICAgICAgICAgICAudGhlbihvblN1Y2Nlc3NmdWxMb2dpbilcclxuICAgIC8vICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbigpIHtcclxuICAgIC8vICAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ0ludmFsaWQgbG9naW4gY3JlZGVudGlhbHMuJ1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgLy8gICAgICAgICAgICAgfSk7XHJcbiAgICAvLyAgICAgfTtcclxuXHJcbiAgICAvLyAgICAgdGhpcy5sb2dvdXQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAvLyAgICAgICAgICAgICBTZXNzaW9uLmRlc3Ryb3koKTtcclxuICAgIC8vICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzKTtcclxuICAgIC8vICAgICAgICAgfSk7XHJcbiAgICAvLyAgICAgfTtcclxuICAgIC8vIH0pO1xyXG5cclxuICAgIC8vIGFwcC5zZXJ2aWNlKCdTZXNzaW9uJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMpIHtcclxuXHJcbiAgICAvLyAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG5cclxuICAgIC8vICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLCBmdW5jdGlvbigpIHtcclxuICAgIC8vICAgICAgICAgc2VsZi5kZXN0cm95KCk7XHJcbiAgICAvLyAgICAgfSk7XHJcblxyXG4gICAgLy8gICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCBmdW5jdGlvbigpIHtcclxuICAgIC8vICAgICAgICAgc2VsZi5kZXN0cm95KCk7XHJcbiAgICAvLyAgICAgfSk7XHJcblxyXG4gICAgLy8gICAgIHRoaXMuaWQgPSBudWxsO1xyXG4gICAgLy8gICAgIHRoaXMudXNlciA9IG51bGw7XHJcblxyXG4gICAgLy8gICAgIHRoaXMuY3JlYXRlID0gZnVuY3Rpb24oc2Vzc2lvbklkLCB1c2VyKSB7XHJcbiAgICAvLyAgICAgICAgIHRoaXMuaWQgPSBzZXNzaW9uSWQ7XHJcbiAgICAvLyAgICAgICAgIHRoaXMudXNlciA9IHVzZXI7XHJcbiAgICAvLyAgICAgfTtcclxuXHJcbiAgICAvLyAgICAgdGhpcy5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyAgICAgICAgIHRoaXMuaWQgPSBudWxsO1xyXG4gICAgLy8gICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xyXG4gICAgLy8gICAgIH07XHJcblxyXG4gICAgLy8gfSk7XHJcblxyXG59KSgpOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYWRtaW4nLCB7XHJcbiAgICB1cmw6ICcvYWRtaW4nLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9sb2dpbi9sb2dpbi5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdBZG1pbkxvZ2luQ29udHJvbGxlcidcclxuICB9KTtcclxufSk7XHJcblxyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ0FkbWluTG9naW5Db250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCBBdXRoU2VydmljZSwgb0VtYmVkRmFjdG9yeSkge1xyXG4gICRzY29wZS5jb3VudGVyID0gMDtcclxuICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzID0gW107XHJcbiAgJHNjb3BlLnN1Ym1pc3Npb25zID0gW107XHJcblxyXG4gICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgJGh0dHAucG9zdCgnL2FwaS9sb2dpbicsIHtcclxuICAgICAgcGFzc3dvcmQ6ICRzY29wZS5wYXNzd29yZFxyXG4gICAgfSkudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgJHJvb3RTY29wZS5wYXNzd29yZCA9ICRzY29wZS5wYXNzd29yZDtcclxuICAgICAgJHNjb3BlLnNob3dTdWJtaXNzaW9ucyA9IHRydWU7XHJcbiAgICAgICRzY29wZS5sb2FkU3VibWlzc2lvbnMoKTtcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICBhbGVydCgnV3JvbmcgUGFzc3dvcmQnKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJGh0dHAuZ2V0KCcvYXBpL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hZG1pbic7XHJcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgYWxlcnQoJ1dyb25nIFBhc3N3b3JkJyk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gICRzY29wZS5tYW5hZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgIFxyXG4gICAgU0MuY29ubmVjdCgpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICRyb290U2NvcGUuYWNjZXNzVG9rZW4gPSByZXMub2F1dGhfdG9rZW47XHJcbiAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvbG9naW4vYXV0aGVudGljYXRlZCcsIHtcclxuICAgICAgICAgIHRva2VuOiByZXMub2F1dGhfdG9rZW4sXHJcbiAgICAgICAgICBwYXNzd29yZDogJHJvb3RTY29wZS5wYXNzd29yZCxcclxuICAgICAgICB9KVxyXG4gICAgICB9KVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICRyb290U2NvcGUuc2NoZWR1bGVySW5mbyA9IHJlcy5kYXRhO1xyXG4gICAgICAgICRyb290U2NvcGUuc2NoZWR1bGVySW5mby5ldmVudHMuZm9yRWFjaChmdW5jdGlvbihldikge1xyXG4gICAgICAgICAgZXYuZGF5ID0gbmV3IERhdGUoZXYuZGF5KTtcclxuICAgICAgICB9KTtcclxuICAgICAgICAkc3RhdGUuZ28oJ3NjaGVkdWxlcicpO1xyXG4gICAgICB9KVxyXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICBhbGVydCgnRXJyb3I6IENvdWxkIG5vdCBsb2cgaW4nKTtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICB9KTtcclxuICB9XHJcbn0pOyIsImFwcC5mYWN0b3J5KCdvRW1iZWRGYWN0b3J5JywgZnVuY3Rpb24oKXtcclxuXHRyZXR1cm4ge1xyXG5cdFx0ZW1iZWRTb25nOiBmdW5jdGlvbihzdWIpIHtcclxuXHQgICAgICAgIHJldHVybiBTQy5vRW1iZWQoXCJodHRwOi8vYXBpLnNvdW5kY2xvdWQuY29tL3RyYWNrcy9cIiArIHN1Yi50cmFja0lELCB7XHJcblx0ICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHN1Yi50cmFja0lEICsgXCJwbGF5ZXJcIiksXHJcblx0ICAgICAgICAgIGF1dG9fcGxheTogZmFsc2UsXHJcblx0ICAgICAgICAgIG1heGhlaWdodDogMTUwXHJcblx0ICAgICAgICB9KTtcclxuXHRcdH1cclxuXHR9O1xyXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XHJcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3BheScsIHtcclxuICAgIHVybDogJy9wYXkvOnN1Ym1pc3Npb25JRCcsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL3BheS9wYXkuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnUGF5Q29udHJvbGxlcicsXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIGNoYW5uZWxzOiBmdW5jdGlvbigkaHR0cCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvY2hhbm5lbHMnKVxyXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgIH0sXHJcbiAgICAgIHN1Ym1pc3Npb246IGZ1bmN0aW9uKCRodHRwLCAkc3RhdGVQYXJhbXMpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3N1Ym1pc3Npb25zL3dpdGhJRC8nICsgJHN0YXRlUGFyYW1zLnN1Ym1pc3Npb25JRClcclxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICB9LFxyXG4gICAgICB0cmFjazogZnVuY3Rpb24oc3VibWlzc2lvbikge1xyXG4gICAgICAgIHJldHVybiBTQy5nZXQoJy90cmFja3MvJyArIHN1Ym1pc3Npb24udHJhY2tJRClcclxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHRyYWNrKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0cmFjaztcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuYXBwLmZpbHRlcignY2FsY3VsYXRlRGlzY291bnQnLCBmdW5jdGlvbiAoKVxyXG57XHJcbiAgICByZXR1cm4gZnVuY3Rpb24gKGlucHV0KVxyXG4gICAge1xyXG4gICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGlucHV0ICogMC45MCkudG9GaXhlZCgyKTtcclxuICAgIH07XHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ1BheUNvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsICRodHRwLCBjaGFubmVscywgc3VibWlzc2lvbiwgdHJhY2ssICRzdGF0ZSwgJHVpYk1vZGFsKSB7XHJcbiAgJHJvb3RTY29wZS5zdWJtaXNzaW9uID0gc3VibWlzc2lvbjtcclxuICAkc2NvcGUuYXVETExpbmsgPSBmYWxzZTtcclxuICBpZiAoc3VibWlzc2lvbi5wYWlkKSAkc3RhdGUuZ28oJ2hvbWUnKTtcclxuICAkc2NvcGUudHJhY2sgPSB0cmFjaztcclxuICBTQy5vRW1iZWQodHJhY2sudXJpLCB7XHJcbiAgICBlbGVtZW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKSxcclxuICAgIGF1dG9fcGxheTogZmFsc2UsXHJcbiAgICBtYXhoZWlnaHQ6IDE1MFxyXG4gIH0pO1xyXG4gICRzY29wZS50b3RhbCA9IDA7XHJcbiAgJHNjb3BlLmNoYW5uZWxzID0gY2hhbm5lbHMuZmlsdGVyKGZ1bmN0aW9uKGNoKSB7XHJcbiAgICByZXR1cm4gKHN1Ym1pc3Npb24uY2hhbm5lbElEUy5pbmRleE9mKGNoLmNoYW5uZWxJRCkgIT0gLTEpXHJcbiAgfSk7XHJcblxyXG4gICRzY29wZS5hdURMTGluayA9ICRzY29wZS50cmFjay5wdXJjaGFzZV91cmwgPyAoJHNjb3BlLnRyYWNrLnB1cmNoYXNlX3VybC5pbmRleE9mKFwiYXJ0aXN0c3VubGltaXRlZC5jb1wiKSAhPSAtMSkgOiBmYWxzZTtcclxuXHJcbiAgJHNjb3BlLnNlbGVjdGVkQ2hhbm5lbHMgPSB7fTtcclxuICAkc2NvcGUuY2hhbm5lbHMuZm9yRWFjaChmdW5jdGlvbihjaCkge1xyXG4gICAgJHNjb3BlLnNlbGVjdGVkQ2hhbm5lbHNbY2guZGlzcGxheU5hbWVdID0gZmFsc2U7XHJcbiAgfSk7XHJcblxyXG4gICRzY29wZS5nb1RvTG9naW4gPSBmdW5jdGlvbigpIHtcclxuICAgICRzdGF0ZS5nbygnbG9naW4nLCB7XHJcbiAgICAgICdzdWJtaXNzaW9uJzogJHJvb3RTY29wZS5zdWJtaXNzaW9uXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gICRzY29wZS5yZWNhbGN1bGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLnRvdGFsID0gMDtcclxuICAgICRzY29wZS50b3RhbFBheW1lbnQgPSAwO1xyXG4gICAgZm9yICh2YXIga2V5IGluICRzY29wZS5zZWxlY3RlZENoYW5uZWxzKSB7XHJcbiAgICAgIGlmICgkc2NvcGUuc2VsZWN0ZWRDaGFubmVsc1trZXldKSB7XHJcbiAgICAgICAgdmFyIGNoYW4gPSAkc2NvcGUuY2hhbm5lbHMuZmluZChmdW5jdGlvbihjaCkge1xyXG4gICAgICAgICAgcmV0dXJuIGNoLmRpc3BsYXlOYW1lID09IGtleTtcclxuICAgICAgICB9KVxyXG4gICAgICAgICRzY29wZS50b3RhbCArPSBjaGFuLnByaWNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBpZiAoJHNjb3BlLmF1RExMaW5rKSAkc2NvcGUudG90YWwgPSBNYXRoLmZsb29yKDAuOSAqICRzY29wZS50b3RhbCk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUubWFrZVBheW1lbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICgkc2NvcGUudG90YWwgIT0gMCkge1xyXG4gICAgICBpZiAoJHNjb3BlLmF1RExMaW5rKSB7XHJcbiAgICAgICAgJHNjb3BlLmRpc2NvdW50TW9kYWxJbnN0YW5jZSA9ICR1aWJNb2RhbC5vcGVuKHtcclxuICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcclxuICAgICAgICAgIHRlbXBsYXRlVXJsOiAnZGlzY291bnRNb2RhbC5odG1sJyxcclxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdkaXNjb3VudE1vZGFsQ29udHJvbGxlcicsXHJcbiAgICAgICAgICBzY29wZTogJHNjb3BlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgJHNjb3BlLmNvbnRpbnVlUGF5KGZhbHNlKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gICRzY29wZS5jb250aW51ZVBheSA9IGZ1bmN0aW9uKGRpc2NvdW50ZWQpIHtcclxuICAgIGlmICgkc2NvcGUuZGlzY291bnRlZE1vZGFsKSB7XHJcbiAgICAgICRzY29wZS5kaXNjb3VudE1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcclxuICAgIH1cclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgIHZhciBwcmljaW5nT2JqID0ge1xyXG4gICAgICBjaGFubmVsczogW10sXHJcbiAgICAgIGRpc2NvdW50ZWQ6IGRpc2NvdW50ZWQsXHJcbiAgICAgIHN1Ym1pc3Npb246ICRyb290U2NvcGUuc3VibWlzc2lvblxyXG4gICAgfTtcclxuICAgIGZvciAodmFyIGtleSBpbiAkc2NvcGUuc2VsZWN0ZWRDaGFubmVscykge1xyXG4gICAgICBpZiAoJHNjb3BlLnNlbGVjdGVkQ2hhbm5lbHNba2V5XSkge1xyXG4gICAgICAgIHZhciBjaGFuID0gJHNjb3BlLmNoYW5uZWxzLmZpbmQoZnVuY3Rpb24oY2gpIHtcclxuICAgICAgICAgIHJldHVybiBjaC5kaXNwbGF5TmFtZSA9PSBrZXk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICBwcmljaW5nT2JqLmNoYW5uZWxzLnB1c2goY2hhbi5jaGFubmVsSUQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAkaHR0cC5wb3N0KCcvYXBpL3N1Ym1pc3Npb25zL2dldFBheW1lbnQnLCBwcmljaW5nT2JqKVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICB3aW5kb3cubG9jYXRpb24gPSByZXMuZGF0YTtcclxuICAgICAgfSlcclxuICB9XHJcbiAgXHJcbiAgXHJcbiAgICAkc2NvcGUuYWRkVG9DYXJ0ID0gZnVuY3Rpb24gKGNoYW5uZWwpXHJcbiAgICB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLnNlbGVjdGVkQ2hhbm5lbHMpO1xyXG4gICAgICAgIGlmIChjaGFubmVsLmFkZHRvY2FydClcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgICRzY29wZS50b3RhbCA9ICRzY29wZS50b3RhbCAtIGNoYW5uZWwucHJpY2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICB7XHJcbiAgICAgICAgICAgICRzY29wZS50b3RhbCArPSBjaGFubmVsLnByaWNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLnNlbGVjdGVkQ2hhbm5lbHNbY2hhbm5lbC5kaXNwbGF5TmFtZV0gPSAkc2NvcGUuc2VsZWN0ZWRDaGFubmVsc1tjaGFubmVsLmRpc3BsYXlOYW1lXSA9PSB0cnVlID8gZmFsc2UgOiB0cnVlO1xyXG5cclxuICAgICAgICBjaGFubmVsLmFkZHRvY2FydCA9IGNoYW5uZWwuYWRkdG9jYXJ0ID8gZmFsc2UgOiB0cnVlO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS50b3RhbCk7XHJcbiAgICB9O1xyXG4gIFxyXG59KTtcclxuXHJcbmFwcC5jb250cm9sbGVyKCdkaXNjb3VudE1vZGFsQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSkge1xyXG5cclxufSkiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XHJcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2NvbXBsZXRlJywge1xyXG4gICAgdXJsOiAnL2NvbXBsZXRlJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvcGF5L3RoYW5reW91Lmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ1RoYW5reW91Q29udHJvbGxlcidcclxuICB9KTtcclxufSk7XHJcblxyXG5hcHAuY29udHJvbGxlcignVGhhbmt5b3VDb250cm9sbGVyJywgZnVuY3Rpb24oJGh0dHAsICRzY29wZSwgJGxvY2F0aW9uKSB7XHJcbiAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICRodHRwLnB1dCgnL2FwaS9zdWJtaXNzaW9ucy9jb21wbGV0ZWRQYXltZW50JywgJGxvY2F0aW9uLnNlYXJjaCgpKVxyXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICRzY29wZS5zdWJtaXNzaW9uID0gcmVzLmRhdGEuc3VibWlzc2lvbjtcclxuICAgICAgJHNjb3BlLmV2ZW50cyA9IHJlcy5kYXRhLmV2ZW50cztcclxuICAgICAgJHNjb3BlLmV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2KSB7XHJcbiAgICAgICAgZXYuZGF0ZSA9IG5ldyBEYXRlKGV2LmRhdGUpO1xyXG4gICAgICB9KVxyXG4gICAgfSlcclxuICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycil7XHJcbiAgICAgIGFsZXJ0KCdUaGVyZSB3YXMgYW4gZXJyb3IgcHJvY2Vzc2luZyB5b3VyIHJlcXVlc3QnKTtcclxuICAgIH0pXHJcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnc2NoZWR1bGVyJywge1xyXG4gICAgdXJsOiAnL3NjaGVkdWxlcicsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL3NjaGVkdWxlci9zY2hlZHVsZXIuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnU2NoZWR1bGVyQ29udHJvbGxlcidcclxuICB9KTtcclxufSk7XHJcblxyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ1NjaGVkdWxlckNvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsIEF1dGhTZXJ2aWNlLCAkd2luZG93KSB7XHJcblxyXG4gICRzY29wZS5tYWtlRXZlbnRVUkwgPSBcIlwiO1xyXG4gICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xyXG4gIHZhciBpbmZvID0gJHJvb3RTY29wZS5zY2hlZHVsZXJJbmZvO1xyXG4gIGlmICghaW5mbykge1xyXG4gICAgJHN0YXRlLmdvKCdhZG1pbicpO1xyXG4gIH1cclxuICAkc2NvcGUuY2hhbm5lbCA9IGluZm8uY2hhbm5lbDtcclxuICAkc2NvcGUuc3VibWlzc2lvbnMgPSBpbmZvLnN1Ym1pc3Npb25zO1xyXG5cclxuICAkc2NvcGUuY2FsZW5kYXIgPSBmaWxsRGF0ZUFycmF5cyhpbmZvLmV2ZW50cyk7XHJcbiAgJHNjb3BlLmRheUluY3IgPSAwO1xyXG5cclxuICAkc2NvcGUuYmFjayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xyXG5cclxuICB9XHJcblxyXG4gICRzY29wZS5zYXZlQ2hhbm5lbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgJHNjb3BlLmNoYW5uZWwucGFzc3dvcmQgPSAkcm9vdFNjb3BlLnBhc3N3b3JkO1xyXG4gICAgJGh0dHAucHV0KFwiL2FwaS9jaGFubmVsc1wiLCAkc2NvcGUuY2hhbm5lbClcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgd2luZG93LmFsZXJ0KFwiU2F2ZWRcIik7XHJcbiAgICAgICAgJHNjb3BlLmNoYW5uZWwgPSByZXMuZGF0YTtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICB9KVxyXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICB3aW5kb3cuYWxlcnQoXCJFcnJvcjogZGlkIG5vdCBzYXZlXCIpO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmluY3JEYXkgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICgkc2NvcGUuZGF5SW5jciA8IDE0KSAkc2NvcGUuZGF5SW5jcisrO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmRlY3JEYXkgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICgkc2NvcGUuZGF5SW5jciA+IDApICRzY29wZS5kYXlJbmNyLS07XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuY2xpY2tlZFNsb3QgPSBmdW5jdGlvbihkYXksIGhvdXIpIHtcclxuICAgIHZhciB0b2RheSA9IG5ldyBEYXRlKCk7XHJcbiAgICBpZiAodG9kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpICYmIHRvZGF5LmdldEhvdXJzKCkgPiBob3VyKSByZXR1cm47XHJcbiAgICAkc2NvcGUuc2hvd092ZXJsYXkgPSB0cnVlO1xyXG4gICAgdmFyIGNhbERheSA9IHt9O1xyXG4gICAgdmFyIGNhbGVuZGFyRGF5ID0gJHNjb3BlLmNhbGVuZGFyLmZpbmQoZnVuY3Rpb24oY2FsRCkge1xyXG4gICAgICByZXR1cm4gY2FsRC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpO1xyXG4gICAgfSk7XHJcbiAgICAkc2NvcGUubWFrZUV2ZW50VVJMID0gdW5kZWZpbmVkO1xyXG4gICAgJHNjb3BlLm1ha2VFdmVudCA9IGNhbGVuZGFyRGF5LmV2ZW50c1tob3VyXTtcclxuICAgIGlmICgkc2NvcGUubWFrZUV2ZW50ID09IFwiLVwiKSB7XHJcbiAgICAgIHZhciBtYWtlRGF5ID0gbmV3IERhdGUoZGF5KTtcclxuICAgICAgbWFrZURheS5zZXRIb3Vycyhob3VyKTtcclxuICAgICAgJHNjb3BlLm1ha2VFdmVudCA9IHtcclxuICAgICAgICBjaGFubmVsSUQ6ICRzY29wZS5jaGFubmVsLmNoYW5uZWxJRCxcclxuICAgICAgICBkYXk6IG1ha2VEYXksXHJcbiAgICAgICAgcGFpZDogZmFsc2VcclxuICAgICAgfTtcclxuICAgICAgJHNjb3BlLm5ld0V2ZW50ID0gdHJ1ZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICRzY29wZS5tYWtlRXZlbnRVUkwgPSAnaHR0cHM6Ly9hcGkuc291bmRjbG91ZC5jb20vdHJhY2tzLycgKyAkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQ7XHJcbiAgICAgIFNDLm9FbWJlZCgnaHR0cHM6Ly9hcGkuc291bmRjbG91ZC5jb20vdHJhY2tzLycgKyAkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQsIHtcclxuICAgICAgICBlbGVtZW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKSxcclxuICAgICAgICBhdXRvX3BsYXk6IGZhbHNlLFxyXG4gICAgICAgIG1heGhlaWdodDogMTUwXHJcbiAgICAgIH0pO1xyXG4gICAgICAkc2NvcGUubmV3RXZlbnQgPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gICRzY29wZS5jaGFuZ2VQYWlkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQgPSB1bmRlZmluZWQ7XHJcbiAgICAkc2NvcGUubWFrZUV2ZW50VVJMID0gdW5kZWZpbmVkO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmNoYW5nZVVSTCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgJGh0dHAucG9zdCgnL2FwaS9zb3VuZGNsb3VkL3Jlc29sdmUnLCB7XHJcbiAgICAgICAgdXJsOiAkc2NvcGUubWFrZUV2ZW50VVJMXHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCA9IHJlcy5kYXRhLmlkO1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQudGl0bGUgPSByZXMuZGF0YS50aXRsZTtcclxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnRyYWNrVVJMID0gcmVzLmRhdGEudHJhY2tVUkw7XHJcbiAgICAgICAgaWYgKHJlcy5kYXRhLnVzZXIpICRzY29wZS5tYWtlRXZlbnQuYXJ0aXN0TmFtZSA9IHJlcy5kYXRhLnVzZXIudXNlcm5hbWU7XHJcbiAgICAgICAgU0Mub0VtYmVkKCRzY29wZS5tYWtlRXZlbnRVUkwsIHtcclxuICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLFxyXG4gICAgICAgICAgYXV0b19wbGF5OiBmYWxzZSxcclxuICAgICAgICAgIG1heGhlaWdodDogMTUwXHJcbiAgICAgICAgfSlcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XHJcbiAgICAgICAgJHNjb3BlLm5vdEZvdW5kID0gZmFsc2U7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgfSkudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcclxuICAgICAgICAkc2NvcGUubm90Rm91bmQgPSB0cnVlO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmRlbGV0ZUV2ZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoISRzY29wZS5uZXdFdmVudCkge1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICRodHRwLmRlbGV0ZSgnL2FwaS9ldmVudHMvJyArICRzY29wZS5tYWtlRXZlbnQuX2lkICsgJy8nICsgJHJvb3RTY29wZS5wYXNzd29yZClcclxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgIHZhciBjYWxlbmRhckRheSA9ICRzY29wZS5jYWxlbmRhci5maW5kKGZ1bmN0aW9uKGNhbEQpIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNhbEQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09ICRzY29wZS5tYWtlRXZlbnQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICBjYWxlbmRhckRheS5ldmVudHNbJHNjb3BlLm1ha2VFdmVudC5kYXkuZ2V0SG91cnMoKV0gPSBcIi1cIjtcclxuICAgICAgICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIHdpbmRvdy5hbGVydChcIkRlbGV0ZWRcIik7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJFUlJPUjogZGlkIG5vdCBEZWxldGUuXCIpXHJcbiAgICAgICAgfSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB2YXIgY2FsZW5kYXJEYXkgPSAkc2NvcGUuY2FsZW5kYXIuZmluZChmdW5jdGlvbihjYWxEKSB7XHJcbiAgICAgICAgcmV0dXJuIGNhbEQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09ICRzY29wZS5tYWtlRXZlbnQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpO1xyXG4gICAgICB9KTtcclxuICAgICAgY2FsZW5kYXJEYXkuZXZlbnRzWyRzY29wZS5tYWtlRXZlbnQuZ2V0SG91cnMoKV0gPSBcIi1cIjtcclxuICAgICAgdmFyIGV2ZW50c1xyXG4gICAgICAkc2NvcGUuc2hvd092ZXJsYXkgPSBmYWxzZTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gICRzY29wZS5zYXZlRXZlbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICghJHNjb3BlLm1ha2VFdmVudC50cmFja0lEICYmICEkc2NvcGUubWFrZUV2ZW50LnBhaWQpIHtcclxuICAgICAgd2luZG93LmFsZXJ0KFwiRW50ZXIgYSB0cmFjayBVUkxcIik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoJHNjb3BlLm5ld0V2ZW50KSB7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC5wYXNzd29yZCA9ICRyb290U2NvcGUucGFzc3dvcmQ7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAgICRodHRwLnBvc3QoJy9hcGkvZXZlbnRzJywgJHNjb3BlLm1ha2VFdmVudClcclxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICB2YXIgZXZlbnQgPSByZXMuZGF0YTtcclxuICAgICAgICAgICAgZXZlbnQuZGF5ID0gbmV3IERhdGUoZXZlbnQuZGF5KTtcclxuICAgICAgICAgICAgdmFyIGNhbGVuZGFyRGF5ID0gJHNjb3BlLmNhbGVuZGFyLmZpbmQoZnVuY3Rpb24oY2FsRCkge1xyXG4gICAgICAgICAgICAgIHJldHVybiBjYWxELmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSBldmVudC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjYWxlbmRhckRheS5ldmVudHNbZXZlbnQuZGF5LmdldEhvdXJzKCldID0gZXZlbnQ7XHJcbiAgICAgICAgICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJTYXZlZFwiKTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgd2luZG93LmFsZXJ0KFwiRVJST1I6IGRpZCBub3QgU2F2ZS5cIik7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkc2NvcGUubmV3RXZlbnQucGFzc3dvcmQgPSAkcm9vdFNjb3BlLnBhc3N3b3JkO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgICAkaHR0cC5wdXQoJy9hcGkvZXZlbnRzJywgJHNjb3BlLm1ha2VFdmVudClcclxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICB2YXIgZXZlbnQgPSByZXMuZGF0YTtcclxuICAgICAgICAgICAgZXZlbnQuZGF5ID0gbmV3IERhdGUoZXZlbnQuZGF5KTtcclxuICAgICAgICAgICAgdmFyIGNhbGVuZGFyRGF5ID0gJHNjb3BlLmNhbGVuZGFyLmZpbmQoZnVuY3Rpb24oY2FsRCkge1xyXG4gICAgICAgICAgICAgIHJldHVybiBjYWxELmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSBldmVudC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBjYWxlbmRhckRheS5ldmVudHNbZXZlbnQuZ2V0SG91cnMoKV0gPSBldmVudDtcclxuICAgICAgICAgICAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHdpbmRvdy5hbGVydChcIlNhdmVkXCIpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJFUlJPUjogZGlkIG5vdCBTYXZlLlwiKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuZW1haWxTbG90ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgbWFpbHRvX2xpbmsgPSBcIm1haWx0bzpjb2F5c2N1ZUBnbWFpbC5jb20/c3ViamVjdD1SZXBvc3Qgb2YgXCIgKyAkc2NvcGUubWFrZUV2ZW50LnRpdGxlICsgJyZib2R5PUhleSAnICsgJHNjb3BlLm1ha2VFdmVudC5hcnRpc3ROYW1lICsgJyxcXG5cXG4gSSBhbSByZXBvc3RpbmcgeW91ciBzb25nICcgKyAkc2NvcGUubWFrZUV2ZW50LnRpdGxlICsgJyBvbiAnICsgJHNjb3BlLmNoYW5uZWwuZGlzcGxheU5hbWUgKyAnIG9uICcgKyAkc2NvcGUubWFrZUV2ZW50LmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSArICcuXFxuXFxuIEJlc3QsIFxcbicgKyAkc2NvcGUuY2hhbm5lbC5kaXNwbGF5TmFtZTtcclxuICAgIGxvY2F0aW9uLmhyZWYgPSBlbmNvZGVVUkkobWFpbHRvX2xpbmspO1xyXG4gIH1cclxuXHJcbiAgLy8gJHNjb3BlLnNjRW1haWxTbG90ID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gIC8vIH1cclxuXHJcbiAgJHNjb3BlLmJhY2tFdmVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLm1ha2VFdmVudCA9IG51bGw7XHJcbiAgICAkc2NvcGUuc2hvd092ZXJsYXkgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gICRzY29wZS5yZW1vdmVRdWV1ZVNvbmcgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgJHNjb3BlLmNoYW5uZWwucXVldWUuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICRzY29wZS5zYXZlQ2hhbm5lbCgpO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmFkZFNvbmcgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICgkc2NvcGUuY2hhbm5lbC5xdWV1ZS5pbmRleE9mKCRzY29wZS5uZXdRdWV1ZUlEKSAhPSAtMSkgcmV0dXJuO1xyXG4gICAgJHNjb3BlLmNoYW5uZWwucXVldWUucHVzaCgkc2NvcGUubmV3UXVldWVJRCk7XHJcbiAgICAkc2NvcGUuc2F2ZUNoYW5uZWwoKTtcclxuICAgICRzY29wZS5uZXdRdWV1ZVNvbmcgPSB1bmRlZmluZWQ7XHJcbiAgICAkc2NvcGUuY2hhbmdlUXVldWVTb25nKCk7XHJcbiAgICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MoWyRzY29wZS5uZXdRdWV1ZUlEXSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuY2hhbmdlUXVldWVTb25nID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIHtcclxuICAgICAgICB1cmw6ICRzY29wZS5uZXdRdWV1ZVNvbmdcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICB2YXIgdHJhY2sgPSByZXMuZGF0YTtcclxuICAgICAgICAkc2NvcGUubmV3UXVldWVJRCA9IHRyYWNrLmlkO1xyXG4gICAgICB9KVxyXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICBhbGVydChcImVycm9yIGdldHRpbmcgc29uZ1wiKTtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gICRzY29wZS5tb3ZlVXAgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgaWYgKGluZGV4ID09IDApIHJldHVybjtcclxuICAgIHZhciBzID0gJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXhdO1xyXG4gICAgJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXhdID0gJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXggLSAxXTtcclxuICAgICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4IC0gMV0gPSBzO1xyXG4gICAgJHNjb3BlLnNhdmVDaGFubmVsKCk7XHJcbiAgICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MoWyRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4XSwgJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXggLSAxXV0pO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLm1vdmVEb3duID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgIGlmIChpbmRleCA9PSAkc2NvcGUuY2hhbm5lbC5xdWV1ZS5sZW5ndGggLSAxKSByZXR1cm47XHJcbiAgICB2YXIgcyA9ICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4XTtcclxuICAgICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4XSA9ICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4ICsgMV07XHJcbiAgICAkc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleCArIDFdID0gcztcclxuICAgICRzY29wZS5zYXZlQ2hhbm5lbCgpO1xyXG4gICAgJHNjb3BlLmxvYWRRdWV1ZVNvbmdzKFskc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleF0sICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4ICsgMV1dKTtcclxuICB9XHJcblxyXG4gIC8vICRzY29wZS5jYW5Mb3dlck9wZW5FdmVudHMgPSBmdW5jdGlvbigpIHtcclxuICAvLyAgIHZhciB3YWl0aW5nU3VicyA9ICRzY29wZS5zdWJtaXNzaW9ucy5maWx0ZXIoZnVuY3Rpb24oc3ViKSB7XHJcbiAgLy8gICAgIHJldHVybiBzdWIuaW52b2ljZUlEO1xyXG4gIC8vICAgfSk7XHJcbiAgLy8gICB2YXIgb3BlblNsb3RzID0gW107XHJcbiAgLy8gICAkc2NvcGUuY2FsZW5kYXIuZm9yRWFjaChmdW5jdGlvbihkYXkpIHtcclxuICAvLyAgICAgZGF5LmV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2KSB7XHJcbiAgLy8gICAgICAgaWYgKGV2LnBhaWQgJiYgIWV2LnRyYWNrSUQpIG9wZW5TbG90cy5wdXNoKGV2KTtcclxuICAvLyAgICAgfSk7XHJcbiAgLy8gICB9KTtcclxuICAvLyAgIHZhciBvcGVuTnVtID0gb3BlblNsb3RzLmxlbmd0aCAtIHdhaXRpbmdTdWJzLmxlbmd0aDtcclxuICAvLyAgIHJldHVybiBvcGVuTnVtID4gMDtcclxuICAvLyB9XHJcblxyXG4gICRzY29wZS5sb2FkU3VibWlzc2lvbnMgPSBmdW5jdGlvbigpIHtcclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICRzY29wZS5zdWJtaXNzaW9ucy5mb3JFYWNoKGZ1bmN0aW9uKHN1Yikge1xyXG4gICAgICAgIFNDLm9FbWJlZChcImh0dHA6Ly9hcGkuc291bmRjbG91ZC5jb20vdHJhY2tzL1wiICsgc3ViLnRyYWNrSUQsIHtcclxuICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHN1Yi50cmFja0lEICsgXCJwbGF5ZXJcIiksXHJcbiAgICAgICAgICBhdXRvX3BsYXk6IGZhbHNlLFxyXG4gICAgICAgICAgbWF4aGVpZ2h0OiAxNTBcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9LCA1MCk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MgPSBmdW5jdGlvbihxdWV1ZSkge1xyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgcXVldWUuZm9yRWFjaChmdW5jdGlvbihzb25nSUQpIHtcclxuICAgICAgICBTQy5vRW1iZWQoXCJodHRwOi8vYXBpLnNvdW5kY2xvdWQuY29tL3RyYWNrcy9cIiArIHNvbmdJRCwge1xyXG4gICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc29uZ0lEICsgXCJwbGF5ZXJcIiksXHJcbiAgICAgICAgICBhdXRvX3BsYXk6IGZhbHNlLFxyXG4gICAgICAgICAgbWF4aGVpZ2h0OiAxNTBcclxuICAgICAgICB9KTtcclxuICAgICAgfSk7XHJcbiAgICB9LCA1MCk7XHJcbiAgfVxyXG4gIGlmICgkc2NvcGUuY2hhbm5lbCAmJiAkc2NvcGUuY2hhbm5lbC5xdWV1ZSkge1xyXG4gICAgJHNjb3BlLmxvYWRRdWV1ZVNvbmdzKCRzY29wZS5jaGFubmVsLnF1ZXVlKTtcclxuICB9XHJcbiAgJHNjb3BlLmxvYWRTdWJtaXNzaW9ucygpO1xyXG5cclxufSk7XHJcblxyXG5mdW5jdGlvbiBmaWxsRGF0ZUFycmF5cyhldmVudHMpIHtcclxuICB2YXIgY2FsZW5kYXIgPSBbXTtcclxuICB2YXIgdG9kYXkgPSBuZXcgRGF0ZSgpO1xyXG4gIGZvciAodmFyIGkgPSAwOyBpIDwgMjE7IGkrKykge1xyXG4gICAgdmFyIGNhbERheSA9IHt9O1xyXG4gICAgY2FsRGF5LmRheSA9IG5ldyBEYXRlKClcclxuICAgIGNhbERheS5kYXkuc2V0RGF0ZSh0b2RheS5nZXREYXRlKCkgKyBpKTtcclxuICAgIHZhciBkYXlFdmVudHMgPSBldmVudHMuZmlsdGVyKGZ1bmN0aW9uKGV2KSB7XHJcbiAgICAgIHJldHVybiAoZXYuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09IGNhbERheS5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkpO1xyXG4gICAgfSk7XHJcbiAgICB2YXIgZXZlbnRBcnJheSA9IFtdO1xyXG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCAyNDsgaisrKSB7XHJcbiAgICAgIGV2ZW50QXJyYXlbal0gPSBcIi1cIjtcclxuICAgIH1cclxuICAgIGRheUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2KSB7XHJcbiAgICAgIGV2ZW50QXJyYXlbZXYuZGF5LmdldEhvdXJzKCldID0gZXY7XHJcbiAgICB9KTtcclxuICAgIGNhbERheS5ldmVudHMgPSBldmVudEFycmF5O1xyXG4gICAgY2FsZW5kYXIucHVzaChjYWxEYXkpO1xyXG4gIH1cclxuICByZXR1cm4gY2FsZW5kYXI7XHJcbn0iLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XHJcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3N1Ym1pdFNvbmcnLCB7XHJcbiAgICB1cmw6ICcvc3VibWl0JyxcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvc3VibWl0L3N1Ym1pdC52aWV3Lmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ1N1Ym1pdFNvbmdDb250cm9sbGVyJ1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmFwcC5jb250cm9sbGVyKCdTdWJtaXRTb25nQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCkge1xyXG5cclxuICAkc2NvcGUuc3VibWlzc2lvbiA9IHt9O1xyXG5cclxuICAkc2NvcGUudXJsQ2hhbmdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIHtcclxuICAgICAgICB1cmw6ICRzY29wZS51cmxcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tJRCA9IHJlcy5kYXRhLmlkO1xyXG4gICAgICAgICRzY29wZS5zdWJtaXNzaW9uLnRpdGxlID0gcmVzLmRhdGEudGl0bGU7XHJcbiAgICAgICAgJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tVUkwgPSByZXMuZGF0YS50cmFja1VSTDtcclxuICAgICAgICBTQy5vRW1iZWQoJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tVUkwsIHtcclxuICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLFxyXG4gICAgICAgICAgYXV0b19wbGF5OiBmYWxzZSxcclxuICAgICAgICAgIG1heGhlaWdodDogMTUwXHJcbiAgICAgICAgfSlcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAkc2NvcGUubm90Rm91bmQgPSBmYWxzZTtcclxuICAgICAgfSkudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAkc2NvcGUuc3VibWlzc2lvbi50cmFja0lEID0gbnVsbDtcclxuICAgICAgICAkc2NvcGUubm90Rm91bmQgPSB0cnVlO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUGxheWVyJykuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCEkc2NvcGUuc3VibWlzc2lvbi5lbWFpbCB8fCAhJHNjb3BlLnN1Ym1pc3Npb24ubmFtZSkge1xyXG4gICAgICBhbGVydChcIlBsZWFzZSBmaWxsIGluIGFsbCBmaWVsZHNcIilcclxuICAgIH0gZWxzZSBpZiAoISRzY29wZS5zdWJtaXNzaW9uLnRyYWNrSUQpIHtcclxuICAgICAgYWxlcnQoXCJUcmFjayBOb3QgRm91bmRcIik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICRodHRwLnBvc3QoJy9hcGkvc3VibWlzc2lvbnMnLCB7XHJcbiAgICAgICAgICBlbWFpbDogJHNjb3BlLnN1Ym1pc3Npb24uZW1haWwsXHJcbiAgICAgICAgICB0cmFja0lEOiAkc2NvcGUuc3VibWlzc2lvbi50cmFja0lELFxyXG4gICAgICAgICAgbmFtZTogJHNjb3BlLnN1Ym1pc3Npb24ubmFtZSxcclxuICAgICAgICAgIHRpdGxlOiAkc2NvcGUuc3VibWlzc2lvbi50aXRsZSxcclxuICAgICAgICAgIHRyYWNrVVJMOiAkc2NvcGUuc3VibWlzc2lvbi50cmFja1VSTCxcclxuICAgICAgICAgIGNoYW5uZWxJRFM6IFtdLFxyXG4gICAgICAgICAgaW52b2ljZUlEUzogW11cclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgY29uc29sZS5sb2cocmVzLmRhdGEpO1xyXG4gICAgICAgICAgd2luZG93LmFsZXJ0KFwiWW91ciBzb25nIGhhcyBiZWVuIHN1Ym1pdHRlZCBhbmQgd2lsbCBiZSByZXZpZXdlZCBzb29uLlwiKTtcclxuICAgICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgd2luZG93LmFsZXJ0KFwiRXJyb3I6IENvdWxkIG5vdCBzdWJtaXQgc29uZy5cIik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XHJcbiAgICAkc3RhdGVQcm92aWRlclxyXG4gICAgICAgIC5zdGF0ZSgnU0NSZXNvbHZlJywge1xyXG4gICAgICAgICAgICB1cmw6ICcvc2NyZXNvbHZlJyxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hcnRpc3RUb29scy9TQ1Jlc29sdmUvU0NSZXNvbHZlLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnU0NSZXNvbHZlQ29udHJvbGxlcidcclxuICAgICAgICB9KVxyXG59KTtcclxuXHJcbmFwcC5jb250cm9sbGVyKCdTQ1Jlc29sdmVDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCkge1xyXG4gICAgJHNjb3BlLnJlc3BvbnNlID0ge307XHJcbiAgICAkc2NvcGUucmVzb2x2ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRodHRwLnBvc3QoJy9hcGkvc291bmRjbG91ZC9yZXNvbHZlJywge1xyXG4gICAgICAgICAgICAgICAgdXJsOiAkc2NvcGUudXJsXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnJlc3BvbnNlID0gSlNPTi5zdHJpbmdpZnkocmVzLmRhdGEsIG51bGwsIFwiXFx0XCIpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLnJlc3BvbnNlKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUucmVzcG9uc2UgPSBKU09OLnN0cmluZ2lmeShlcnIsIG51bGwsIFwiXFx0XCIpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgfVxyXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XHJcblx0JHN0YXRlUHJvdmlkZXJcclxuXHQuc3RhdGUoJ3JlRm9yUmVJbnRlcmFjdGlvbicsIHtcclxuXHRcdHVybDogJy9hcnRpc3RUb29scy9yZUZvclJlSW50ZXJhY3Rpb24nLFxyXG5cdFx0cGFyYW1zOiB7XHJcblx0XHRcdHN1Ym1pc3Npb246IG51bGxcclxuXHRcdH0sXHJcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2FydGlzdFRvb2xzL3JlRm9yUmUvcmVGb3JSZUludGVyYWN0aW9uLmh0bWwnLFxyXG5cdFx0Y29udHJvbGxlcjogJ1JlRm9yUmVJbnRlcmFjdGlvbkNvbnRyb2xsZXInXHJcblx0fSlcclxufSk7XHJcblxyXG5cclxuYXBwLmNvbnRyb2xsZXIoXCJSZUZvclJlSW50ZXJhY3Rpb25Db250cm9sbGVyXCIsIGZ1bmN0aW9uKCkge1xyXG5cclxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyXHJcbiAgICAuc3RhdGUoJ2xvZ2luJywge1xyXG4gICAgICB1cmw6ICcvbG9naW4nLFxyXG4gICAgICBwYXJhbXM6IHtcclxuICAgICAgICBzdWJtaXNzaW9uOiBudWxsXHJcbiAgICAgIH0sXHJcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvYXV0aC92aWV3cy9sb2dpbi5odG1sJyxcclxuICAgICAgY29udHJvbGxlcjogJ0F1dGhDb250cm9sbGVyJ1xyXG4gICAgfSlcclxuICAgIC5zdGF0ZSgnc2lnbnVwJywge1xyXG4gICAgICB1cmw6ICcvc2lnbnVwJyxcclxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hdXRoL3ZpZXdzL3NpZ251cC5odG1sJyxcclxuICAgICAgY29udHJvbGxlcjogJ0F1dGhDb250cm9sbGVyJ1xyXG4gICAgfSk7XHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ0F1dGhDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsICRzY29wZSwgJGh0dHAsICR1aWJNb2RhbCwgJHdpbmRvdywgQXV0aFNlcnZpY2UsIFNlc3Npb25TZXJ2aWNlLCBzb2NrZXQpIHtcclxuICAkc2NvcGUubG9naW5PYmogPSB7fTtcclxuICAkc2NvcGUubWVzc2FnZSA9IHtcclxuICAgIHZhbDogJycsXHJcbiAgICB2aXNpYmxlOiBmYWxzZVxyXG4gIH07XHJcbiAgJHNjb3BlLm9wZW5Nb2RhbCA9IHtcclxuICAgIHNpZ251cENvbmZpcm06IGZ1bmN0aW9uKCkge1xyXG4gICAgICAkc2NvcGUubW9kYWxJbnN0YW5jZSA9ICR1aWJNb2RhbC5vcGVuKHtcclxuICAgICAgICBhbmltYXRpb246IHRydWUsXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdzaWdudXBDb21wbGV0ZS5odG1sJyxcclxuICAgICAgICBjb250cm9sbGVyOiAnQXV0aENvbnRyb2xsZXInLFxyXG4gICAgICAgIHNjb3BlOiAkc2NvcGVcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxuICAkc2NvcGUubG9naW4gPSBmdW5jdGlvbigpIHtcclxuICAgICRzY29wZS5tZXNzYWdlID0ge1xyXG4gICAgICB2YWw6ICcnLFxyXG4gICAgICB2aXNpYmxlOiBmYWxzZVxyXG4gICAgfTtcclxuICAgIEF1dGhTZXJ2aWNlXHJcbiAgICAgIC5sb2dpbigkc2NvcGUubG9naW5PYmopXHJcbiAgICAgIC50aGVuKGhhbmRsZUxvZ2luUmVzcG9uc2UpXHJcbiAgICAgIC5jYXRjaChoYW5kbGVMb2dpbkVycm9yKVxyXG5cclxuICAgIGZ1bmN0aW9uIGhhbmRsZUxvZ2luUmVzcG9uc2UocmVzKSB7XHJcbiAgICAgIGlmIChyZXMuc3RhdHVzID09PSAyMDAgJiYgcmVzLmRhdGEuc3VjY2Vzcykge1xyXG4gICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZShyZXMuZGF0YS51c2VyKTtcclxuICAgICAgICAkc3RhdGUuZ28oJ2FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5TGlzdCcpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICRzY29wZS5tZXNzYWdlID0ge1xyXG4gICAgICAgICAgdmFsOiByZXMuZGF0YS5tZXNzYWdlLFxyXG4gICAgICAgICAgdmlzaWJsZTogdHJ1ZVxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBoYW5kbGVMb2dpbkVycm9yKHJlcykge1xyXG4gICAgICAkc2NvcGUubWVzc2FnZSA9IHtcclxuICAgICAgICB2YWw6ICdFcnJvciBpbiBwcm9jZXNzaW5nIHlvdXIgcmVxdWVzdCcsXHJcbiAgICAgICAgdmlzaWJsZTogdHJ1ZVxyXG4gICAgICB9O1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gICRzY29wZS5jaGVja0lmU3VibWlzc2lvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCRzdGF0ZVBhcmFtcy5zdWJtaXNzaW9uKSB7XHJcbiAgICAgICRzY29wZS5zb3VuZGNsb3VkTG9naW4oKTtcclxuICAgIH1cclxuICB9XHJcblxyXG5cclxuICAkc2NvcGUuc2lnbnVwID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUubWVzc2FnZSA9IHtcclxuICAgICAgdmFsOiAnJyxcclxuICAgICAgdmlzaWJsZTogZmFsc2VcclxuICAgIH07XHJcbiAgICBpZiAoJHNjb3BlLnNpZ251cE9iai5wYXNzd29yZCAhPSAkc2NvcGUuc2lnbnVwT2JqLmNvbmZpcm1QYXNzd29yZCkge1xyXG4gICAgICAkc2NvcGUubWVzc2FnZSA9IHtcclxuICAgICAgICB2YWw6ICdQYXNzd29yZCBkb2VzblxcJ3QgbWF0Y2ggd2l0aCBjb25maXJtIHBhc3N3b3JkJyxcclxuICAgICAgICB2aXNpYmxlOiB0cnVlXHJcbiAgICAgIH07XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgIEF1dGhTZXJ2aWNlXHJcbiAgICAgIC5zaWdudXAoJHNjb3BlLnNpZ251cE9iailcclxuICAgICAgLnRoZW4oaGFuZGxlU2lnbnVwUmVzcG9uc2UpXHJcbiAgICAgIC5jYXRjaChoYW5kbGVTaWdudXBFcnJvcilcclxuXHJcbiAgICBmdW5jdGlvbiBoYW5kbGVTaWdudXBSZXNwb25zZShyZXMpIHtcclxuICAgICAgJHN0YXRlLmdvKCdsb2dpbicpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhhbmRsZVNpZ251cEVycm9yKHJlcykge31cclxuICB9O1xyXG5cclxuICAkc2NvcGUuc291bmRjbG91ZExvZ2luID0gZnVuY3Rpb24oKSB7XHJcbiAgICBTQy5jb25uZWN0KClcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgJHJvb3RTY29wZS5hY2Nlc3NUb2tlbiA9IHJlcy5vYXV0aF90b2tlbjtcclxuICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9sb2dpbi9zb3VuZENsb3VkTG9naW4nLCB7XHJcbiAgICAgICAgICB0b2tlbjogcmVzLm9hdXRoX3Rva2VuLFxyXG4gICAgICAgICAgcGFzc3dvcmQ6ICd0ZXN0J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZShyZXMuZGF0YS51c2VyKTtcclxuICAgICAgICBpZiAoJHN0YXRlUGFyYW1zLnN1Ym1pc3Npb24pIHtcclxuICAgICAgICAgICRzdGF0ZS5nbygnYXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlOZXcnLCB7XHJcbiAgICAgICAgICAgICdzdWJtaXNzaW9uJzogJHN0YXRlUGFyYW1zLnN1Ym1pc3Npb25cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkc3RhdGUuZ28oJ2FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5TGlzdCcpO1xyXG4gICAgICB9KVxyXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgIGFsZXJ0KCdFcnJvcjogQ291bGQgbm90IGxvZyBpbicpO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIH0pO1xyXG4gIH07XHJcbn0pOyIsImFwcC5mYWN0b3J5KCdBdXRoU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbigkaHR0cCl7XHJcblx0XHJcblx0ZnVuY3Rpb24gbG9naW4oZGF0YSkge1xyXG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvbG9naW4nLCBkYXRhKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNpZ251cChkYXRhKSB7XHJcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9zaWdudXAnLCBkYXRhKTtcclxuXHR9XHJcblxyXG5cdHJldHVybiB7XHJcblx0XHRsb2dpbjogbG9naW4sXHJcblx0XHRzaWdudXA6IHNpZ251cFxyXG5cdH07XHJcbn1dKTtcclxuIiwiXHJcblxyXG5hcHAuZmFjdG9yeSgnU2Vzc2lvblNlcnZpY2UnLCBbJyRjb29raWVzJywgZnVuY3Rpb24oJGNvb2tpZXMpIHtcclxuXHRcclxuXHRmdW5jdGlvbiBjcmVhdGUoZGF0YSkge1xyXG5cdFx0JGNvb2tpZXMucHV0T2JqZWN0KCd1c2VyJywgZGF0YSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkZWxldGVVc2VyKCkge1xyXG5cdFx0JGNvb2tpZXMucmVtb3ZlKCd1c2VyJyk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZXRVc2VyKCkge1xyXG5cdFx0cmV0dXJuICRjb29raWVzLmdldCgndXNlcicpO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdGNyZWF0ZTogY3JlYXRlLFxyXG5cdFx0ZGVsZXRlVXNlcjogZGVsZXRlVXNlcixcclxuXHRcdGdldFVzZXI6IGdldFVzZXJcclxuXHR9O1xyXG59XSk7XHJcbiIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYXV0b0VtYWlsc05ldycsIHtcclxuICAgIHVybDogJy9hZG1pbi9kYXRhYmFzZS9hdXRvRW1haWxzL25ldycsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2RhdGFiYXNlL2F1dG9FbWFpbHMvYXV0b0VtYWlscy5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdBdXRvRW1haWxzQ29udHJvbGxlcidcclxuICB9KTtcclxufSk7XHJcblxyXG5hcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XHJcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2F1dG9FbWFpbHNFZGl0Jywge1xyXG4gICAgdXJsOiAnL2FkbWluL2RhdGFiYXNlL2F1dG9FbWFpbHMvZWRpdC86dGVtcGxhdGVJZCcsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2RhdGFiYXNlL2F1dG9FbWFpbHMvYXV0b0VtYWlscy5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdBdXRvRW1haWxzQ29udHJvbGxlcicsXHJcbiAgICAvLyByZXNvbHZlOiB7XHJcbiAgICAvLyAgIHRlbXBsYXRlOiBmdW5jdGlvbigkaHR0cCkge1xyXG4gICAgLy8gICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZGF0YWJhc2UvYXV0b0VtYWlscy9iaXdlZWtseT9pc0FydGlzdD10cnVlJylcclxuICAgIC8vICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgLy8gICAgICAgICB2YXIgdGVtcGxhdGUgPSByZXMuZGF0YTtcclxuICAgIC8vICAgICAgICAgaWYgKHRlbXBsYXRlKSB7XHJcbiAgICAvLyAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xyXG4gICAgLy8gICAgICAgICB9IGVsc2Uge1xyXG4gICAgLy8gICAgICAgICAgIHJldHVybiB7XHJcbiAgICAvLyAgICAgICAgICAgICBwdXJwb3NlOiBcIkJpd2Vla2x5IEVtYWlsXCJcclxuICAgIC8vICAgICAgICAgICB9XHJcbiAgICAvLyAgICAgICAgIH1cclxuICAgIC8vICAgICAgIH0pXHJcbiAgICAvLyAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgIC8vICAgICAgICAgYWxlcnQoXCJFUlJPUjogU29tZXRoaW5nIHdlbnQgd3JvbmcuXCIpO1xyXG4gICAgLy8gICAgICAgfSlcclxuICAgIC8vICAgfVxyXG4gICAgLy8gfVxyXG4gIH0pO1xyXG59KTtcclxuXHJcbmFwcC5jb250cm9sbGVyKCdBdXRvRW1haWxzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgJHN0YXRlUGFyYW1zLCBBdXRoU2VydmljZSkge1xyXG4gICRzY29wZS5sb2dnZWRJbiA9IGZhbHNlO1xyXG5cclxuXHJcbiAgJHNjb3BlLmlzU3RhdGVQYXJhbXMgPSBmYWxzZTtcclxuICBpZigkc3RhdGVQYXJhbXMudGVtcGxhdGVJZCkge1xyXG4gICAgJHNjb3BlLmlzU3RhdGVQYXJhbXMgPSB0cnVlO1xyXG4gIH1cclxuICAvLyAkc2NvcGUudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcclxuXHJcbiAgJHNjb3BlLnRlbXBsYXRlID0ge1xyXG4gICAgaXNBcnRpc3Q6IGZhbHNlXHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmdldFRlbXBsYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZigkc3RhdGVQYXJhbXMudGVtcGxhdGVJZCkge1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICRodHRwLmdldCgnL2FwaS9kYXRhYmFzZS9hdXRvRW1haWxzP3RlbXBsYXRlSWQ9JyArICRzdGF0ZVBhcmFtcy50ZW1wbGF0ZUlkKVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgdmFyIHRlbXBsYXRlID0gcmVzLmRhdGE7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgaWYgKHRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgICRzY29wZS50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJHNjb3BlLnRlbXBsYXRlID0ge307XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgIGFsZXJ0KFwiRVJST1I6IFNvbWV0aGluZyB3ZW50IHdyb25nLlwiKTtcclxuICAgICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAvLyBjb25zb2xlLmxvZyh0ZW1wbGF0ZSk7XHJcbiAgJHNjb3BlLnNhdmUgPSBmdW5jdGlvbigpIHtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvYXV0b0VtYWlscy8nLCAkc2NvcGUudGVtcGxhdGUpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgIGFsZXJ0KFwiU2F2ZWQgZW1haWwgdGVtcGxhdGUuXCIpXHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgYWxlcnQoXCJFUlJPUjogTWVzc2FnZSBjb3VsZCBub3Qgc2F2ZS5cIilcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xyXG4gIC8vICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gIC8vICAgJGh0dHAucG9zdCgnL2FwaS9sb2dpbicsIHtcclxuICAvLyAgICAgcGFzc3dvcmQ6ICRzY29wZS5wYXNzd29yZFxyXG4gIC8vICAgfSkudGhlbihmdW5jdGlvbigpIHtcclxuICAvLyAgICAgJHJvb3RTY29wZS5wYXNzd29yZCA9ICRzY29wZS5wYXNzd29yZDtcclxuICAvLyAgICAgJHNjb3BlLmxvZ2dlZEluID0gdHJ1ZTtcclxuICAvLyAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAvLyAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xyXG4gIC8vICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gIC8vICAgICBhbGVydCgnV3JvbmcgUGFzc3dvcmQnKTtcclxuICAvLyAgIH0pO1xyXG4gIC8vIH1cclxuXHJcbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJGh0dHAuZ2V0KCcvYXBpL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hZG1pbic7XHJcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgYWxlcnQoJ1dyb25nIFBhc3N3b3JkJyk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XHJcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2F1dG9FbWFpbHNMaXN0Jywge1xyXG4gICAgdXJsOiAnL2FkbWluL2RhdGFiYXNlL2F1dG9FbWFpbHMnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9kYXRhYmFzZS9hdXRvRW1haWxzL2F1dG9FbWFpbHNMaXN0Lmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ0F1dG9FbWFpbHNMaXN0Q29udHJvbGxlcicsXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIHRlbXBsYXRlczogZnVuY3Rpb24oJGh0dHApIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2RhdGFiYXNlL2F1dG9FbWFpbHMnKVxyXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7IFxyXG4gICAgICAgICAgICB2YXIgdGVtcGxhdGUgPSByZXMuZGF0YTtcclxuICAgICAgICAgICAgaWYgKHRlbXBsYXRlKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xyXG4gICAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgICAgICBwdXJwb3NlOiBcIkJpd2Vla2x5IEVtYWlsXCJcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgYWxlcnQoXCJFUlJPUjogU29tZXRoaW5nIHdlbnQgd3JvbmcuXCIpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pO1xyXG59KTtcclxuXHJcbmFwcC5jb250cm9sbGVyKCdBdXRvRW1haWxzTGlzdENvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsIEF1dGhTZXJ2aWNlLCB0ZW1wbGF0ZXMpIHtcclxuICAkc2NvcGUubG9nZ2VkSW4gPSBmYWxzZTtcclxuICAkc2NvcGUudGVtcGxhdGVzID0gdGVtcGxhdGVzO1xyXG5cclxuICAvLyAkc2NvcGUuZ2V0VGVtcGxhdGUgPSBmdW5jdGlvbigpIHtcclxuICAvLyAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAvLyAgICRodHRwLmdldCgnL2FwaS9kYXRhYmFzZS9hdXRvRW1haWxzL2Jpd2Vla2x5P2lzQXJ0aXN0PScgKyBTdHJpbmcoJHNjb3BlLnRlbXBsYXRlLmlzQXJ0aXN0KSlcclxuICAvLyAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgLy8gICAgICAgdmFyIHRlbXBsYXRlID0gcmVzLmRhdGE7XHJcbiAgLy8gICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAvLyAgICAgICBpZiAodGVtcGxhdGUpIHtcclxuICAvLyAgICAgICAgICRzY29wZS50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xyXG4gIC8vICAgICAgIH0gZWxzZSB7XHJcbiAgLy8gICAgICAgICAkc2NvcGUudGVtcGxhdGUgPSB7XHJcbiAgLy8gICAgICAgICAgIHB1cnBvc2U6IFwiQml3ZWVrbHkgRW1haWxcIixcclxuICAvLyAgICAgICAgICAgaXNBcnRpc3Q6IGZhbHNlXHJcbiAgLy8gICAgICAgICB9O1xyXG4gIC8vICAgICAgIH1cclxuICAvLyAgICAgfSlcclxuICAvLyAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgLy8gICAgICAgYWxlcnQoXCJFUlJPUjogU29tZXRoaW5nIHdlbnQgd3JvbmcuXCIpO1xyXG4gIC8vICAgICB9KTtcclxuICAvLyB9O1xyXG5cclxuICAvLyBjb25zb2xlLmxvZyh0ZW1wbGF0ZSk7XHJcbiAgJHNjb3BlLnNhdmUgPSBmdW5jdGlvbigpIHtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvYXV0b0VtYWlscycsICRzY29wZS50ZW1wbGF0ZSlcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgYWxlcnQoXCJTYXZlZCBlbWFpbC5cIik7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgYWxlcnQoXCJFUlJPUjogTWVzc2FnZSBjb3VsZCBub3Qgc2F2ZS5cIilcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIC8vICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xyXG4gIC8vICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gIC8vICAgJGh0dHAucG9zdCgnL2FwaS9sb2dpbicsIHtcclxuICAvLyAgICAgcGFzc3dvcmQ6ICRzY29wZS5wYXNzd29yZFxyXG4gIC8vICAgfSkudGhlbihmdW5jdGlvbigpIHtcclxuICAvLyAgICAgJHJvb3RTY29wZS5wYXNzd29yZCA9ICRzY29wZS5wYXNzd29yZDtcclxuICAvLyAgICAgJHNjb3BlLmxvZ2dlZEluID0gdHJ1ZTtcclxuICAvLyAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAvLyAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xyXG4gIC8vICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gIC8vICAgICBhbGVydCgnV3JvbmcgUGFzc3dvcmQnKTtcclxuICAvLyAgIH0pO1xyXG4gIC8vIH1cclxuXHJcbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJGh0dHAuZ2V0KCcvYXBpL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hZG1pbic7XHJcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgYWxlcnQoJ1dyb25nIFBhc3N3b3JkJyk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG59KSIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZG93bmxvYWRHYXRlJywge1xyXG4gICAgdXJsOiAnL2FkbWluL2Rvd25sb2FkR2F0ZScsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2Rvd25sb2FkVHJhY2svdmlld3MvYWRtaW5ETEdhdGUuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnQWRtaW5ETEdhdGVDb250cm9sbGVyJ1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZG93bmxvYWRHYXRlTGlzdCcsIHtcclxuICAgIHVybDogJy9hZG1pbi9kb3dubG9hZEdhdGUvbGlzdCcsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2Rvd25sb2FkVHJhY2svdmlld3MvYWRtaW5ETEdhdGUubGlzdC5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdBZG1pbkRMR2F0ZUNvbnRyb2xsZXInXHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkb3dubG9hZEdhdGVFZGl0Jywge1xyXG4gICAgdXJsOiAnL2FkbWluL2Rvd25sb2FkR2F0ZS9lZGl0LzpnYXRld2F5SUQnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9kb3dubG9hZFRyYWNrL3ZpZXdzL2FkbWluRExHYXRlLmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ0FkbWluRExHYXRlQ29udHJvbGxlcidcclxuICB9KTtcclxufSk7XHJcblxyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ0FkbWluRExHYXRlQ29udHJvbGxlcicsIFsnJHJvb3RTY29wZScsXHJcbiAgJyRzdGF0ZScsXHJcbiAgJyRzdGF0ZVBhcmFtcycsXHJcbiAgJyRzY29wZScsXHJcbiAgJyRodHRwJyxcclxuICAnJGxvY2F0aW9uJyxcclxuICAnJHdpbmRvdycsXHJcbiAgJyR1aWJNb2RhbCcsXHJcbiAgJ1Nlc3Npb25TZXJ2aWNlJyxcclxuICAnQWRtaW5ETEdhdGVTZXJ2aWNlJyxcclxuICBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uLCAkd2luZG93LCAkdWliTW9kYWwsIFNlc3Npb25TZXJ2aWNlLCBBZG1pbkRMR2F0ZVNlcnZpY2UpIHtcclxuICAgIC8qIEluaXQgYm9vbGVhbiB2YXJpYWJsZXMgZm9yIHNob3cvaGlkZSBhbmQgb3RoZXIgZnVuY3Rpb25hbGl0aWVzICovXHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSBmYWxzZTtcclxuICAgICRzY29wZS5tZXNzYWdlID0ge1xyXG4gICAgICB2YWw6ICcnLFxyXG4gICAgICB2aXNpYmxlOiBmYWxzZVxyXG4gICAgfTtcclxuXHJcbiAgICAvKiBJbml0IERvd25sb2FkIEdhdGV3YXkgZm9ybSBkYXRhICovXHJcblxyXG4gICAgJHNjb3BlLnRyYWNrID0ge1xyXG4gICAgICBhcnRpc3RVc2VybmFtZTogJ0xhIFRyb3BpY8OhbCcsXHJcbiAgICAgIHRyYWNrVGl0bGU6ICdQYW50ZW9uZSAvIFRyYXZlbCcsXHJcbiAgICAgIHRyYWNrQXJ0d29ya1VSTDogJ2Fzc2V0cy9pbWFnZXMvd2hvLXdlLWFyZS5wbmcnLFxyXG4gICAgICBTTUxpbmtzOiBbXSxcclxuICAgICAgbGlrZTogZmFsc2UsXHJcbiAgICAgIGNvbW1lbnQ6IGZhbHNlLFxyXG4gICAgICByZXBvc3Q6IGZhbHNlLFxyXG4gICAgICBhcnRpc3RzOiBbe1xyXG4gICAgICAgIHVybDogJycsXHJcbiAgICAgICAgYXZhdGFyOiAnYXNzZXRzL2ltYWdlcy93aG8td2UtYXJlLnBuZycsXHJcbiAgICAgICAgdXNlcm5hbWU6ICcnLFxyXG4gICAgICAgIGlkOiAtMSxcclxuICAgICAgICBwZXJtYW5lbnRMaW5rOiBmYWxzZVxyXG4gICAgICB9XSxcclxuICAgICAgcGxheWxpc3RzOiBbe1xyXG4gICAgICAgIHVybDogJycsXHJcbiAgICAgICAgYXZhdGFyOiAnJyxcclxuICAgICAgICB0aXRsZTogJycsXHJcbiAgICAgICAgaWQ6ICcnXHJcbiAgICAgIH1dXHJcbiAgICB9O1xyXG5cclxuICAgIC8qIEluaXQgZG93bmxvYWRHYXRld2F5IGxpc3QgKi9cclxuXHJcbiAgICAkc2NvcGUuZG93bmxvYWRHYXRld2F5TGlzdCA9IFtdO1xyXG5cclxuICAgIC8qIEluaXQgbW9kYWwgaW5zdGFuY2UgdmFyaWFibGVzIGFuZCBtZXRob2RzICovXHJcblxyXG4gICAgJHNjb3BlLm1vZGFsSW5zdGFuY2UgPSB7fTtcclxuICAgICRzY29wZS5tb2RhbCA9IHt9O1xyXG4gICAgJHNjb3BlLm9wZW5Nb2RhbCA9IHtcclxuICAgICAgZG93bmxvYWRVUkw6IGZ1bmN0aW9uKGRvd25sb2FkVVJMKSB7XHJcbiAgICAgICAgJHNjb3BlLm1vZGFsLmRvd25sb2FkVVJMID0gZG93bmxvYWRVUkw7XHJcbiAgICAgICAgJHNjb3BlLm1vZGFsSW5zdGFuY2UgPSAkdWliTW9kYWwub3Blbih7XHJcbiAgICAgICAgICBhbmltYXRpb246IHRydWUsXHJcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2Rvd25sb2FkVVJMLmh0bWwnLFxyXG4gICAgICAgICAgY29udHJvbGxlcjogJ0FydGlzdFRvb2xzQ29udHJvbGxlcicsXHJcbiAgICAgICAgICBzY29wZTogJHNjb3BlXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgICAkc2NvcGUuY2xvc2VNb2RhbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAkc2NvcGUubW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qIEluaXQgcHJvZmlsZSAqL1xyXG4gICAgJHNjb3BlLnByb2ZpbGUgPSB7fTtcclxuXHJcbiAgICAvKiBNZXRob2QgZm9yIHJlc2V0dGluZyBEb3dubG9hZCBHYXRld2F5IGZvcm0gKi9cclxuXHJcbiAgICBmdW5jdGlvbiByZXNldERvd25sb2FkR2F0ZXdheSgpIHtcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSBmYWxzZTtcclxuICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XHJcbiAgICAgICAgdmFsOiAnJyxcclxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgJHNjb3BlLnRyYWNrID0ge1xyXG4gICAgICAgIGFydGlzdFVzZXJuYW1lOiAnTGEgVHJvcGljw6FsJyxcclxuICAgICAgICB0cmFja1RpdGxlOiAnUGFudGVvbmUgLyBUcmF2ZWwnLFxyXG4gICAgICAgIHRyYWNrQXJ0d29ya1VSTDogJ2Fzc2V0cy9pbWFnZXMvd2hvLXdlLWFyZS5wbmcnLFxyXG4gICAgICAgIFNNTGlua3M6IFtdLFxyXG4gICAgICAgIGxpa2U6IGZhbHNlLFxyXG4gICAgICAgIGNvbW1lbnQ6IGZhbHNlLFxyXG4gICAgICAgIHJlcG9zdDogZmFsc2UsXHJcbiAgICAgICAgYXJ0aXN0czogW3tcclxuICAgICAgICAgIHVybDogJycsXHJcbiAgICAgICAgICBhdmF0YXI6ICdhc3NldHMvaW1hZ2VzL3doby13ZS1hcmUucG5nJyxcclxuICAgICAgICAgIHVzZXJuYW1lOiAnJyxcclxuICAgICAgICAgIGlkOiAtMSxcclxuICAgICAgICAgIHBlcm1hbmVudExpbms6IGZhbHNlXHJcbiAgICAgICAgfV0sXHJcbiAgICAgICAgcGxheWxpc3RzOiBbe1xyXG4gICAgICAgICAgdXJsOiAnJyxcclxuICAgICAgICAgIGF2YXRhcjogJycsXHJcbiAgICAgICAgICB0aXRsZTogJycsXHJcbiAgICAgICAgICBpZDogJydcclxuICAgICAgICB9XVxyXG4gICAgICB9O1xyXG4gICAgICBhbmd1bGFyLmVsZW1lbnQoXCJpbnB1dFt0eXBlPSdmaWxlJ11cIikudmFsKG51bGwpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qIENoZWNrIGlmIHN0YXRlUGFyYW1zIGhhcyBnYXRld2F5SUQgdG8gaW5pdGlhdGUgZWRpdCAqL1xyXG4gICAgJHNjb3BlLmNoZWNrSWZFZGl0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIGlmICgkc3RhdGVQYXJhbXMuZ2F0ZXdheUlEKSB7XHJcbiAgICAgICAgJHNjb3BlLmdldERvd25sb2FkR2F0ZXdheSgkc3RhdGVQYXJhbXMuZ2F0ZXdheUlEKTtcclxuICAgICAgICAvLyBpZighJHN0YXRlUGFyYW1zLmRvd25sb2FkR2F0ZXdheSkge1xyXG4gICAgICAgIC8vICAgJHNjb3BlLmdldERvd25sb2FkR2F0ZXdheSgkc3RhdGVQYXJhbXMuZ2F0ZXdheUlEKTtcclxuICAgICAgICAvLyB9IGVsc2Uge1xyXG4gICAgICAgIC8vICAgJHNjb3BlLnRyYWNrID0gJHN0YXRlUGFyYW1zLmRvd25sb2FkR2F0ZXdheTtcclxuICAgICAgICAvLyB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAkc2NvcGUudHJhY2tVUkxDaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKCRzY29wZS50cmFjay50cmFja1VSTCAhPT0gJycpIHtcclxuICAgICAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgICBBZG1pbkRMR2F0ZVNlcnZpY2VcclxuICAgICAgICAgIC5yZXNvbHZlRGF0YSh7XHJcbiAgICAgICAgICAgIHVybDogJHNjb3BlLnRyYWNrLnRyYWNrVVJMXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLnRoZW4oaGFuZGxlVHJhY2tEYXRhQW5kR2V0UHJvZmlsZXMpXHJcbiAgICAgICAgICAudGhlbihoYW5kbGVXZWJQcm9maWxlcylcclxuICAgICAgICAgIC5jYXRjaChoYW5kbGVFcnJvcik7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVRyYWNrRGF0YUFuZEdldFByb2ZpbGVzKHJlcykge1xyXG4gICAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrVGl0bGUgPSByZXMuZGF0YS50aXRsZTtcclxuICAgICAgICAgICRzY29wZS50cmFjay50cmFja0lEID0gcmVzLmRhdGEuaWQ7XHJcbiAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0SUQgPSByZXMuZGF0YS51c2VyLmlkO1xyXG4gICAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrQXJ0d29ya1VSTCA9IHJlcy5kYXRhLmFydHdvcmtfdXJsID8gcmVzLmRhdGEuYXJ0d29ya191cmwucmVwbGFjZSgnbGFyZ2UuanBnJywgJ3Q1MDB4NTAwLmpwZycpIDogJyc7XHJcbiAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0QXJ0d29ya1VSTCA9IHJlcy5kYXRhLnVzZXIuYXZhdGFyX3VybCA/IHJlcy5kYXRhLnVzZXIuYXZhdGFyX3VybCA6ICcnO1xyXG4gICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdFVSTCA9IHJlcy5kYXRhLnVzZXIucGVybWFsaW5rX3VybDtcclxuICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RVc2VybmFtZSA9IHJlcy5kYXRhLnVzZXIudXNlcm5hbWU7XHJcbiAgICAgICAgICAkc2NvcGUudHJhY2suU01MaW5rcyA9IFtdO1xyXG4gICAgICAgICAgcmV0dXJuIFNDLmdldCgnL3VzZXJzLycgKyAkc2NvcGUudHJhY2suYXJ0aXN0SUQgKyAnL3dlYi1wcm9maWxlcycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlV2ViUHJvZmlsZXMocHJvZmlsZXMpIHtcclxuICAgICAgICAgIHByb2ZpbGVzLmZvckVhY2goZnVuY3Rpb24ocHJvZikge1xyXG4gICAgICAgICAgICBpZiAoWyd0d2l0dGVyJywgJ3lvdXR1YmUnLCAnZmFjZWJvb2snLCAnc3BvdGlmeScsICdzb3VuZGNsb3VkJywgJ2luc3RhZ3JhbSddLmluZGV4T2YocHJvZi5zZXJ2aWNlKSAhPSAtMSkge1xyXG4gICAgICAgICAgICAgICRzY29wZS50cmFjay5TTUxpbmtzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAga2V5OiBwcm9mLnNlcnZpY2UsXHJcbiAgICAgICAgICAgICAgICB2YWx1ZTogcHJvZi51cmxcclxuICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyKSB7XHJcbiAgICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tJRCA9IG51bGw7XHJcbiAgICAgICAgICBhbGVydCgnU29uZyBub3QgZm91bmQgb3IgZm9yYmlkZGVuJyk7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAkc2NvcGUuYXJ0aXN0VVJMQ2hhbmdlID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgdmFyIGFydGlzdCA9IHt9O1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgIEFkbWluRExHYXRlU2VydmljZVxyXG4gICAgICAgIC5yZXNvbHZlRGF0YSh7XHJcbiAgICAgICAgICB1cmw6ICRzY29wZS50cmFjay5hcnRpc3RzW2luZGV4XS51cmxcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdHNbaW5kZXhdLmF2YXRhciA9IHJlcy5kYXRhLmF2YXRhcl91cmw7XHJcbiAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0c1tpbmRleF0udXNlcm5hbWUgPSByZXMuZGF0YS51c2VybmFtZTtcclxuICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RzW2luZGV4XS5pZCA9IHJlcy5kYXRhLmlkO1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgIGFsZXJ0KCdBcnRpc3RzIG5vdCBmb3VuZCcpO1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgJHNjb3BlLmFkZFBsYXlsaXN0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICRzY29wZS50cmFjay5wbGF5bGlzdHMucHVzaCh7XHJcbiAgICAgICAgdXJsOiAnJyxcclxuICAgICAgICBhdmF0YXI6ICcnLFxyXG4gICAgICAgIHRpdGxlOiAnJyxcclxuICAgICAgICBpZDogJydcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAkc2NvcGUucmVtb3ZlUGxheWxpc3QgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAkc2NvcGUudHJhY2sucGxheWxpc3RzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9XHJcbiAgICAkc2NvcGUucGxheWxpc3RVUkxDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgIEFkbWluRExHYXRlU2VydmljZVxyXG4gICAgICAgIC5yZXNvbHZlRGF0YSh7XHJcbiAgICAgICAgICB1cmw6ICRzY29wZS50cmFjay5wbGF5bGlzdHNbaW5kZXhdLnVybFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAkc2NvcGUudHJhY2sucGxheWxpc3RzW2luZGV4XS5hdmF0YXIgPSByZXMuZGF0YS5hcnR3b3JrX3VybDtcclxuICAgICAgICAgICRzY29wZS50cmFjay5wbGF5bGlzdHNbaW5kZXhdLnRpdGxlID0gcmVzLmRhdGEudGl0bGU7XHJcbiAgICAgICAgICAkc2NvcGUudHJhY2sucGxheWxpc3RzW2luZGV4XS5pZCA9IHJlcy5kYXRhLmlkO1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgYWxlcnQoJ1BsYXlsaXN0IG5vdCBmb3VuZCcpO1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG5cclxuXHJcbiAgICAkc2NvcGUucmVtb3ZlQXJ0aXN0ID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdHMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH1cclxuXHJcbiAgICAkc2NvcGUuYWRkQXJ0aXN0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIGlmICgkc2NvcGUudHJhY2suYXJ0aXN0cy5sZW5ndGggPiAyKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUudHJhY2suYXJ0aXN0cy5wdXNoKHtcclxuICAgICAgICB1cmw6ICcnLFxyXG4gICAgICAgIGF2YXRhcjogJ2Fzc2V0cy9pbWFnZXMvd2hvLXdlLWFyZS5wbmcnLFxyXG4gICAgICAgIHVzZXJuYW1lOiAnJyxcclxuICAgICAgICBpZDogLTFcclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLmFkZFNNTGluayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAvLyBleHRlcm5hbFNNTGlua3MrKztcclxuICAgICAgLy8gJHNjb3BlLnRyYWNrLlNNTGlua3NbJ2tleScgKyBleHRlcm5hbFNNTGlua3NdID0gJyc7XHJcbiAgICAgICRzY29wZS50cmFjay5TTUxpbmtzLnB1c2goe1xyXG4gICAgICAgIGtleTogJycsXHJcbiAgICAgICAgdmFsdWU6ICcnXHJcbiAgICAgIH0pO1xyXG4gICAgfTtcclxuICAgICRzY29wZS5yZW1vdmVTTUxpbmsgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAkc2NvcGUudHJhY2suU01MaW5rcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgfTtcclxuICAgICRzY29wZS5TTUxpbmtDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xyXG5cclxuICAgICAgZnVuY3Rpb24gZ2V0TG9jYXRpb24oaHJlZikge1xyXG4gICAgICAgIHZhciBsb2NhdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xyXG4gICAgICAgIGxvY2F0aW9uLmhyZWYgPSBocmVmO1xyXG4gICAgICAgIGlmIChsb2NhdGlvbi5ob3N0ID09IFwiXCIpIHtcclxuICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSBsb2NhdGlvbi5ocmVmO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gbG9jYXRpb247XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHZhciBsb2NhdGlvbiA9IGdldExvY2F0aW9uKCRzY29wZS50cmFjay5TTUxpbmtzW2luZGV4XS52YWx1ZSk7XHJcbiAgICAgIHZhciBob3N0ID0gbG9jYXRpb24uaG9zdG5hbWUuc3BsaXQoJy4nKVswXTtcclxuICAgICAgdmFyIGZpbmRMaW5rID0gJHNjb3BlLnRyYWNrLlNNTGlua3MuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICByZXR1cm4gaXRlbS5rZXkgPT09IGhvc3Q7XHJcbiAgICAgIH0pO1xyXG4gICAgICBpZiAoZmluZExpbmsubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICAkc2NvcGUudHJhY2suU01MaW5rc1tpbmRleF0ua2V5ID0gaG9zdDtcclxuICAgIH07XHJcblxyXG4gICAgJHNjb3BlLnNhdmVEb3dubG9hZEdhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKCEkc2NvcGUudHJhY2sudHJhY2tJRCkge1xyXG4gICAgICAgIGFsZXJ0KCdUcmFjayBOb3QgRm91bmQnKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICB2YXIgc2VuZE9iaiA9IG5ldyBGb3JtRGF0YSgpO1xyXG5cclxuICAgICAgLyogQXBwZW5kIGRhdGEgdG8gc2VuZE9iaiBzdGFydCAqL1xyXG5cclxuICAgICAgLyogVHJhY2sgKi9cclxuICAgICAgZm9yICh2YXIgcHJvcCBpbiAkc2NvcGUudHJhY2spIHtcclxuICAgICAgICBzZW5kT2JqLmFwcGVuZChwcm9wLCAkc2NvcGUudHJhY2tbcHJvcF0pO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvKiBhcnRpc3RzICovXHJcblxyXG4gICAgICB2YXIgYXJ0aXN0cyA9ICRzY29wZS50cmFjay5hcnRpc3RzLmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgcmV0dXJuIGl0ZW0uaWQgIT09IC0xO1xyXG4gICAgICB9KS5tYXAoZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgIGRlbGV0ZSBpdGVtWyckJGhhc2hLZXknXTtcclxuICAgICAgICByZXR1cm4gaXRlbTtcclxuICAgICAgfSk7XHJcbiAgICAgIHNlbmRPYmouYXBwZW5kKCdhcnRpc3RzJywgSlNPTi5zdHJpbmdpZnkoYXJ0aXN0cykpO1xyXG5cclxuICAgICAgLyogcGxheWxpc3RzICovXHJcblxyXG4gICAgICB2YXIgcGxheWxpc3RzID0gJHNjb3BlLnRyYWNrLnBsYXlsaXN0cy5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgIHJldHVybiBpdGVtLmlkICE9PSAtMTtcclxuICAgICAgfSkubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICBkZWxldGUgaXRlbVsnJCRoYXNoS2V5J107XHJcbiAgICAgICAgcmV0dXJuIGl0ZW07XHJcbiAgICAgIH0pO1xyXG4gICAgICBzZW5kT2JqLmFwcGVuZCgncGxheWxpc3RzJywgSlNPTi5zdHJpbmdpZnkocGxheWxpc3RzKSk7XHJcblxyXG4gICAgICAvKiBTTUxpbmtzICovXHJcblxyXG4gICAgICB2YXIgU01MaW5rcyA9IHt9O1xyXG4gICAgICAkc2NvcGUudHJhY2suU01MaW5rcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICBTTUxpbmtzW2l0ZW0ua2V5XSA9IGl0ZW0udmFsdWU7XHJcbiAgICAgIH0pO1xyXG4gICAgICBzZW5kT2JqLmFwcGVuZCgnU01MaW5rcycsIEpTT04uc3RyaW5naWZ5KFNNTGlua3MpKTtcclxuXHJcbiAgICAgIC8qIEFwcGVuZCBkYXRhIHRvIHNlbmRPYmogZW5kICovXHJcblxyXG4gICAgICB2YXIgb3B0aW9ucyA9IHtcclxuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICB1cmw6ICcvYXBpL2RhdGFiYXNlL2Rvd25sb2FkdXJsJyxcclxuICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogdW5kZWZpbmVkXHJcbiAgICAgICAgfSxcclxuICAgICAgICB0cmFuc2Zvcm1SZXF1ZXN0OiBhbmd1bGFyLmlkZW50aXR5LFxyXG4gICAgICAgIGRhdGE6IHNlbmRPYmpcclxuICAgICAgfTtcclxuICAgICAgJGh0dHAob3B0aW9ucylcclxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICBpZiAoJHNjb3BlLnRyYWNrLl9pZCkge1xyXG4gICAgICAgICAgICAvLyAkc2NvcGUub3Blbk1vZGFsLmRvd25sb2FkVVJMKHJlcy5kYXRhLnRyYWNrVVJMKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmVzZXREb3dubG9hZEdhdGV3YXkoKTtcclxuICAgICAgICAgICRzY29wZS5vcGVuTW9kYWwuZG93bmxvYWRVUkwocmVzLmRhdGEpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgYWxlcnQoXCJFUlJPUjogRXJyb3IgaW4gc2F2aW5nIHVybFwiKTtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgJGh0dHAucG9zdCgnL2FwaS9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIFNlc3Npb25TZXJ2aWNlLmRlbGV0ZVVzZXIoKTtcclxuICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKTtcclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuICAgICRzY29wZS5zaG93UHJvZmlsZUluZm8gPSBmdW5jdGlvbigpIHtcclxuICAgICAgJHNjb3BlLnByb2ZpbGUgPSBKU09OLnBhcnNlKFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKSk7XHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLmdldERvd25sb2FkTGlzdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBBZG1pbkRMR2F0ZVNlcnZpY2VcclxuICAgICAgICAuZ2V0RG93bmxvYWRMaXN0KClcclxuICAgICAgICAudGhlbihoYW5kbGVSZXNwb25zZSlcclxuICAgICAgICAuY2F0Y2goaGFuZGxlRXJyb3IpO1xyXG5cclxuICAgICAgZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UocmVzKSB7XHJcbiAgICAgICAgJHNjb3BlLmRvd25sb2FkR2F0ZXdheUxpc3QgPSByZXMuZGF0YTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gaGFuZGxlRXJyb3IocmVzKSB7XHJcblxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyogTWV0aG9kIGZvciBnZXR0aW5nIERvd25sb2FkR2F0ZXdheSBpbiBjYXNlIG9mIGVkaXQgKi9cclxuXHJcbiAgICAkc2NvcGUuZ2V0RG93bmxvYWRHYXRld2F5ID0gZnVuY3Rpb24oZG93bmxvYWRHYXRlV2F5SUQpIHtcclxuICAgICAgLy8gcmVzZXREb3dubG9hZEdhdGV3YXkoKTtcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICBBZG1pbkRMR2F0ZVNlcnZpY2VcclxuICAgICAgICAuZ2V0RG93bmxvYWRHYXRld2F5KHtcclxuICAgICAgICAgIGlkOiBkb3dubG9hZEdhdGVXYXlJRFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oaGFuZGxlUmVzcG9uc2UpXHJcbiAgICAgICAgLmNhdGNoKGhhbmRsZUVycm9yKTtcclxuXHJcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlcykge1xyXG5cclxuICAgICAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IHRydWU7XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrID0gcmVzLmRhdGE7XHJcblxyXG4gICAgICAgIHZhciBTTUxpbmtzID0gcmVzLmRhdGEuU01MaW5rcyA/IHJlcy5kYXRhLlNNTGlua3MgOiB7fTtcclxuICAgICAgICB2YXIgU01MaW5rc0FycmF5ID0gW107XHJcblxyXG4gICAgICAgIGZvciAodmFyIGxpbmsgaW4gU01MaW5rcykge1xyXG4gICAgICAgICAgU01MaW5rc0FycmF5LnB1c2goe1xyXG4gICAgICAgICAgICBrZXk6IGxpbmssXHJcbiAgICAgICAgICAgIHZhbHVlOiBTTUxpbmtzW2xpbmtdXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MgPSBTTUxpbmtzQXJyYXk7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gaGFuZGxlRXJyb3IocmVzKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAkc2NvcGUuZGVsZXRlRG93bmxvYWRHYXRld2F5ID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuXHJcbiAgICAgIGlmIChjb25maXJtKFwiRG8geW91IHJlYWxseSB3YW50IHRvIGRlbGV0ZSB0aGlzIHRyYWNrP1wiKSkge1xyXG4gICAgICB2YXIgZG93bmxvYWRHYXRlV2F5SUQgPSAkc2NvcGUuZG93bmxvYWRHYXRld2F5TGlzdFtpbmRleF0uX2lkO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgICBBZG1pbkRMR2F0ZVNlcnZpY2VcclxuICAgICAgICAgIC5kZWxldGVEb3dubG9hZEdhdGV3YXkoe1xyXG4gICAgICAgICAgICBpZDogZG93bmxvYWRHYXRlV2F5SURcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAudGhlbihoYW5kbGVSZXNwb25zZSlcclxuICAgICAgICAgIC5jYXRjaChoYW5kbGVFcnJvcik7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlcykge1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICRzY29wZS5kb3dubG9hZEdhdGV3YXlMaXN0LnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihyZXMpIHtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHJldHVybiBmYWxzZVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gIH1cclxuXHJcbl0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuXHQkc3RhdGVQcm92aWRlci5zdGF0ZSgnZG93bmxvYWQnLCB7XHJcblx0XHR1cmw6ICcvZG93bmxvYWQnLFxyXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9kb3dubG9hZFRyYWNrL3ZpZXdzL2Rvd25sb2FkVHJhY2sudmlldy5odG1sJyxcclxuXHRcdGNvbnRyb2xsZXI6ICdEb3dubG9hZFRyYWNrQ29udHJvbGxlcidcclxuXHR9KTtcclxufSk7XHJcblxyXG5hcHAuY29udHJvbGxlcignRG93bmxvYWRUcmFja0NvbnRyb2xsZXInLCBbJyRyb290U2NvcGUnLFxyXG5cdCckc3RhdGUnLFxyXG5cdCckc2NvcGUnLFxyXG5cdCckaHR0cCcsXHJcblx0JyRsb2NhdGlvbicsXHJcblx0JyR3aW5kb3cnLFxyXG5cdCckcScsXHJcblx0J0Rvd25sb2FkVHJhY2tTZXJ2aWNlJyxcclxuXHRmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgJHdpbmRvdywgJHEsIERvd25sb2FkVHJhY2tTZXJ2aWNlKSB7XHJcblxyXG5cdFx0LyogTm9ybWFsIEpTIHZhcnMgYW5kIGZ1bmN0aW9ucyBub3QgYm91bmQgdG8gc2NvcGUgKi9cclxuXHRcdHZhciBwbGF5ZXJPYmogPSBudWxsO1xyXG5cclxuXHRcdC8qICRzY29wZSBiaW5kaW5ncyBzdGFydCAqL1xyXG5cclxuXHRcdCRzY29wZS50cmFja0RhdGEgPSB7XHJcblx0XHRcdHRyYWNrTmFtZTogJ01peGluZyBhbmQgTWFzdGVyaW5nJyxcclxuXHRcdFx0dXNlck5hbWU6ICdsYSB0cm9waWNhbCdcclxuXHRcdH07XHJcblx0XHQkc2NvcGUudG9nZ2xlID0gdHJ1ZTtcclxuXHRcdCRzY29wZS50b2dnbGVQbGF5ID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdCRzY29wZS50b2dnbGUgPSAhJHNjb3BlLnRvZ2dsZTtcclxuXHRcdFx0aWYgKCRzY29wZS50b2dnbGUpIHtcclxuXHRcdFx0XHRwbGF5ZXJPYmoucGF1c2UoKTtcclxuXHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRwbGF5ZXJPYmoucGxheSgpO1xyXG5cdFx0XHR9XHJcblx0XHR9XHJcblx0XHQkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG5cdFx0JHNjb3BlLmVtYmVkVHJhY2sgPSBmYWxzZTtcclxuXHRcdCRzY29wZS5kb3dubG9hZFVSTE5vdEZvdW5kID0gZmFsc2U7XHJcblx0XHQkc2NvcGUuZXJyb3JUZXh0ID0gJyc7XHJcblx0XHQkc2NvcGUuZm9sbG93Qm94SW1hZ2VVcmwgPSAnYXNzZXRzL2ltYWdlcy93aG8td2UtYXJlLnBuZyc7XHJcblx0XHQkc2NvcGUucmVjZW50VHJhY2tzID0gW107XHJcblxyXG5cdFx0LyogRGVmYXVsdCBwcm9jZXNzaW5nIG9uIHBhZ2UgbG9hZCAqL1xyXG5cclxuXHRcdCRzY29wZS5nZXREb3dubG9hZFRyYWNrID0gZnVuY3Rpb24oKSB7XHJcblxyXG5cdFx0XHQkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcblx0XHRcdHZhciB0cmFja0lEID0gJGxvY2F0aW9uLnNlYXJjaCgpLnRyYWNraWQ7XHJcblx0XHRcdERvd25sb2FkVHJhY2tTZXJ2aWNlXHJcblx0XHRcdFx0LmdldERvd25sb2FkVHJhY2sodHJhY2tJRClcclxuXHRcdFx0XHQudGhlbihyZWNlaXZlRG93bmxvYWRUcmFjaylcclxuXHRcdFx0XHQudGhlbihyZWNlaXZlUmVjZW50VHJhY2tzKVxyXG5cdFx0XHRcdC50aGVuKGluaXRQbGF5KVxyXG5cdFx0XHRcdC5jYXRjaChjYXRjaERvd25sb2FkVHJhY2tFcnJvcik7XHJcblxyXG5cdFx0XHRmdW5jdGlvbiByZWNlaXZlRG93bmxvYWRUcmFjayhyZXN1bHQpIHtcclxuXHRcdFx0XHQkc2NvcGUudHJhY2sgPSByZXN1bHQuZGF0YTtcclxuXHRcdFx0XHRjb25zb2xlLmxvZygkc2NvcGUudHJhY2spO1xyXG5cdFx0XHRcdCRzY29wZS5iYWNrZ3JvdW5kU3R5bGUgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0XHRcdHJldHVybiB7XHJcblx0XHRcdFx0XHRcdCdiYWNrZ3JvdW5kLWltYWdlJzogJ3VybCgnICsgJHNjb3BlLnRyYWNrLnRyYWNrQXJ0d29ya1VSTCArICcpJyxcclxuXHRcdFx0XHRcdFx0J2JhY2tncm91bmQtcmVwZWF0JzogJ25vLXJlcGVhdCcsXHJcblx0XHRcdFx0XHRcdCdiYWNrZ3JvdW5kLXNpemUnOiAnY292ZXInXHJcblx0XHRcdFx0XHR9XHJcblx0XHRcdFx0fVxyXG5cclxuXHRcdFx0XHQkc2NvcGUuZW1iZWRUcmFjayA9IHRydWU7XHJcblx0XHRcdFx0JHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuXHJcblx0XHRcdFx0aWYgKCRzY29wZS50cmFjay5zaG93RG93bmxvYWRUcmFja3MgPT09ICd1c2VyJykge1xyXG5cdFx0XHRcdFx0cmV0dXJuIERvd25sb2FkVHJhY2tTZXJ2aWNlLmdldFJlY2VudFRyYWNrcyh7XHJcblx0XHRcdFx0XHRcdHVzZXJJRDogJHNjb3BlLnRyYWNrLnVzZXJpZCxcclxuXHRcdFx0XHRcdFx0dHJhY2tJRDogJHNjb3BlLnRyYWNrLl9pZFxyXG5cdFx0XHRcdFx0fSk7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdHJldHVybiAkcS5yZXNvbHZlKCdyZXNvbHZlJyk7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiByZWNlaXZlUmVjZW50VHJhY2tzKHJlcykge1xyXG5cdFx0XHRcdGlmICgodHlwZW9mIHJlcyA9PT0gJ29iamVjdCcpICYmIHJlcy5kYXRhKSB7XHJcblx0XHRcdFx0XHQkc2NvcGUucmVjZW50VHJhY2tzID0gcmVzLmRhdGE7XHJcblx0XHRcdFx0fVxyXG5cdFx0XHRcdHJldHVybiBTQy5zdHJlYW0oJy90cmFja3MvJyArICRzY29wZS50cmFjay50cmFja0lEKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gaW5pdFBsYXkocGxheWVyKSB7XHJcblx0XHRcdFx0cGxheWVyT2JqID0gcGxheWVyO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBjYXRjaERvd25sb2FkVHJhY2tFcnJvcigpIHtcclxuXHRcdFx0XHRhbGVydCgnU29uZyBOb3QgRm91bmQnKTtcclxuXHRcdFx0XHQkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG5cdFx0XHRcdCRzY29wZS5lbWJlZFRyYWNrID0gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdH07XHJcblxyXG5cclxuXHRcdC8qIE9uIGNsaWNrIGRvd25sb2FkIHRyYWNrIGJ1dHRvbiAqL1xyXG5cclxuXHRcdCRzY29wZS5kb3dubG9hZFRyYWNrID0gZnVuY3Rpb24oKSB7XHJcblx0XHRcdGlmICgkc2NvcGUudHJhY2suY29tbWVudCAmJiAhJHNjb3BlLnRyYWNrLmNvbW1lbnRUZXh0KSB7XHJcblx0XHRcdFx0YWxlcnQoJ1BsZWFzZSB3cml0ZSBhIGNvbW1lbnQhJyk7XHJcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xyXG5cdFx0XHR9XHJcblx0XHRcdCRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuXHRcdFx0JHNjb3BlLmVycm9yVGV4dCA9ICcnO1xyXG5cclxuXHRcdFx0U0MuY29ubmVjdCgpXHJcblx0XHRcdFx0LnRoZW4ocGVyZm9ybVRhc2tzKVxyXG5cdFx0XHRcdC50aGVuKGluaXREb3dubG9hZClcclxuXHRcdFx0XHQuY2F0Y2goY2F0Y2hUYXNrc0Vycm9yKVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gcGVyZm9ybVRhc2tzKHJlcykge1xyXG5cdFx0XHRcdCRzY29wZS50cmFjay50b2tlbiA9IHJlcy5vYXV0aF90b2tlbjtcclxuXHRcdFx0XHRyZXR1cm4gRG93bmxvYWRUcmFja1NlcnZpY2UucGVyZm9ybVRhc2tzKCRzY29wZS50cmFjayk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIGluaXREb3dubG9hZChyZXMpIHtcclxuXHRcdFx0XHQkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG5cdFx0XHRcdGlmICgkc2NvcGUudHJhY2suZG93bmxvYWRVUkwgJiYgJHNjb3BlLnRyYWNrLmRvd25sb2FkVVJMICE9PSAnJykge1xyXG5cdFx0XHRcdFx0JHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJHNjb3BlLnRyYWNrLmRvd25sb2FkVVJMO1xyXG5cdFx0XHRcdH0gZWxzZSB7XHJcblx0XHRcdFx0XHQkc2NvcGUuZXJyb3JUZXh0ID0gJ0Vycm9yISBDb3VsZCBub3QgZmV0Y2ggZG93bmxvYWQgVVJMJztcclxuXHRcdFx0XHRcdCRzY29wZS5kb3dubG9hZFVSTE5vdEZvdW5kID0gdHJ1ZTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0JHNjb3BlLiRhcHBseSgpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBjYXRjaFRhc2tzRXJyb3IoZXJyKSB7XHJcblx0XHRcdFx0YWxlcnQoJ0Vycm9yIGluIHByb2Nlc3NpbmcgeW91ciByZXF1ZXN0Jyk7XHJcblx0XHRcdFx0JHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuXHRcdFx0XHQkc2NvcGUuJGFwcGx5KCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHR9O1xyXG5cdH1cclxuXSk7IiwiXHJcbmFwcC5zZXJ2aWNlKCdBZG1pbkRMR2F0ZVNlcnZpY2UnLCBbJyRodHRwJywgZnVuY3Rpb24oJGh0dHApe1xyXG5cclxuXHRmdW5jdGlvbiByZXNvbHZlRGF0YShkYXRhKSB7XHJcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9zb3VuZGNsb3VkL3Jlc29sdmUnLCBkYXRhKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldERvd25sb2FkTGlzdCgpIHtcclxuXHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZGF0YWJhc2UvZG93bmxvYWR1cmwvYWRtaW4nKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldERvd25sb2FkR2F0ZXdheShkYXRhKSB7XHJcblx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2RhdGFiYXNlL2Rvd25sb2FkdXJsLycgKyBkYXRhLmlkKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGRlbGV0ZURvd25sb2FkR2F0ZXdheShkYXRhKSB7XHJcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS9kb3dubG9hZHVybC9kZWxldGUnLCBkYXRhKTtcclxuXHR9XHJcblxyXG5cdHJldHVybiB7XHJcblx0XHRyZXNvbHZlRGF0YTogcmVzb2x2ZURhdGEsXHJcblx0XHRnZXREb3dubG9hZExpc3Q6IGdldERvd25sb2FkTGlzdCxcclxuXHRcdGdldERvd25sb2FkR2F0ZXdheTogZ2V0RG93bmxvYWRHYXRld2F5LFxyXG5cdFx0ZGVsZXRlRG93bmxvYWRHYXRld2F5OiBkZWxldGVEb3dubG9hZEdhdGV3YXlcclxuXHR9O1xyXG59XSk7XHJcbiIsImFwcC5zZXJ2aWNlKCdEb3dubG9hZFRyYWNrU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbigkaHR0cCl7XHJcblx0XHJcblx0ZnVuY3Rpb24gZ2V0RG93bmxvYWRUcmFjayhkYXRhKSB7XHJcblx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2Rvd25sb2FkL3RyYWNrP3RyYWNrSUQ9JyArIGRhdGEpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2V0VHJhY2tEYXRhKGRhdGEpIHtcclxuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIHtcclxuXHRcdFx0dXJsOiBkYXRhLnRyYWNrVVJMXHJcblx0XHR9KTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHBlcmZvcm1UYXNrcyhkYXRhKSB7XHJcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnYXBpL2Rvd25sb2FkL3Rhc2tzJywgZGF0YSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZXRSZWNlbnRUcmFja3MoZGF0YSkge1xyXG5cdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS9kb3dubG9hZC90cmFjay9yZWNlbnQ/dXNlcklEPScgKyBkYXRhLnVzZXJJRCArICcmdHJhY2tJRD0nICsgZGF0YS50cmFja0lEKTtcclxuXHR9XHJcblxyXG5cdHJldHVybiB7XHJcblx0XHRnZXREb3dubG9hZFRyYWNrOiBnZXREb3dubG9hZFRyYWNrLFxyXG5cdFx0Z2V0VHJhY2tEYXRhOiBnZXRUcmFja0RhdGEsXHJcblx0XHRwZXJmb3JtVGFza3M6IHBlcmZvcm1UYXNrcyxcclxuXHRcdGdldFJlY2VudFRyYWNrczogZ2V0UmVjZW50VHJhY2tzXHJcblx0fTtcclxufV0pO1xyXG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XHJcbiAgJHN0YXRlUHJvdmlkZXJcclxuICAuc3RhdGUoJ2FydGlzdFRvb2xzJywge1xyXG4gICAgdXJsOiAnL2FydGlzdC10b29scycsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvYXJ0aXN0VG9vbHMvYXJ0aXN0VG9vbHMuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnQXJ0aXN0VG9vbHNDb250cm9sbGVyJyxcclxuICAgIGFic3RyYWN0OiB0cnVlLFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICBhbGxvd2VkOiBmdW5jdGlvbigkcSwgJHN0YXRlLCBTZXNzaW9uU2VydmljZSkge1xyXG4gICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XHJcbiAgICAgICAgdmFyIHVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgICAgaWYgKHVzZXIpIHtcclxuICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XHJcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvbG9naW4nO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0pXHJcbiAgLnN0YXRlKCdhcnRpc3RUb29sc1Byb2ZpbGUnLCB7XHJcbiAgICB1cmw6ICcvcHJvZmlsZScsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvYXJ0aXN0VG9vbHMvcHJvZmlsZS5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdBcnRpc3RUb29sc0NvbnRyb2xsZXInXHJcbiAgfSlcclxuICAuc3RhdGUoJ2FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5TGlzdCcsIHtcclxuICAgIHVybDogJy9kb3dubG9hZC1nYXRld2F5JyxcclxuICAgIHBhcmFtczoge1xyXG4gICAgICBzdWJtaXNzaW9uOiBudWxsXHJcbiAgICB9LFxyXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL3ZpZXdzL2FydGlzdFRvb2xzL2Rvd25sb2FkR2F0ZXdheS5saXN0Lmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ0FydGlzdFRvb2xzQ29udHJvbGxlcidcclxuICB9KVxyXG5cclxufSk7XHJcblxyXG5hcHAuY29udHJvbGxlcignQXJ0aXN0VG9vbHNDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsICRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgJHdpbmRvdywgJHVpYk1vZGFsLCAkdGltZW91dCwgU2Vzc2lvblNlcnZpY2UsIEFydGlzdFRvb2xzU2VydmljZSkge1xyXG4gICRzY29wZS51c2VyID0gSlNPTi5wYXJzZShTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkpO1xyXG5cclxuICAvKiBJbml0IGJvb2xlYW4gdmFyaWFibGVzIGZvciBzaG93L2hpZGUgYW5kIG90aGVyIGZ1bmN0aW9uYWxpdGllcyAqL1xyXG5cclxuICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gZmFsc2U7XHJcbiAgJHNjb3BlLm1lc3NhZ2UgPSB7XHJcbiAgICB2YWw6ICcnLFxyXG4gICAgdmlzaWJsZTogZmFsc2VcclxuICB9O1xyXG5cclxuICAvKiBJbml0IGRvd25sb2FkR2F0ZXdheSBsaXN0ICovXHJcblxyXG4gICRzY29wZS5kb3dubG9hZEdhdGV3YXlMaXN0ID0gW107XHJcblxyXG4gIC8qIEluaXQgbW9kYWwgaW5zdGFuY2UgdmFyaWFibGVzIGFuZCBtZXRob2RzICovXHJcblxyXG4gICRzY29wZS5tb2RhbEluc3RhbmNlID0ge307XHJcbiAgJHNjb3BlLm1vZGFsID0ge307XHJcbiAgJHNjb3BlLm9wZW5Nb2RhbCA9IHtcclxuICAgIGRvd25sb2FkVVJMOiBmdW5jdGlvbihkb3dubG9hZFVSTCkge1xyXG4gICAgICAkc2NvcGUubW9kYWwuZG93bmxvYWRVUkwgPSBkb3dubG9hZFVSTDtcclxuICAgICAgJHNjb3BlLm1vZGFsSW5zdGFuY2UgPSAkdWliTW9kYWwub3Blbih7XHJcbiAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnZG93bmxvYWRVUkwuaHRtbCcsXHJcbiAgICAgICAgY29udHJvbGxlcjogJ0FydGlzdFRvb2xzQ29udHJvbGxlcicsXHJcbiAgICAgICAgc2NvcGU6ICRzY29wZVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG4gICRzY29wZS5jbG9zZU1vZGFsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUubW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5lZGl0UHJvZmlsZU1vZGFsSW5zdGFuY2UgPSB7fTtcclxuICAkc2NvcGUuZWRpdFByb2ZpbGVtb2RhbCA9IHt9O1xyXG4gICRzY29wZS5vcGVuRWRpdFByb2ZpbGVNb2RhbCA9IHtcclxuICAgIGVkaXRQcm9maWxlOiBmdW5jdGlvbihmaWVsZCkge1xyXG4gICAgICAkc2NvcGUucHJvZmlsZS5maWVsZCA9IGZpZWxkO1xyXG4gICAgICAkdGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUuZWRpdFByb2ZpbGVNb2RhbEluc3RhbmNlID0gJHVpYk1vZGFsLm9wZW4oe1xyXG4gICAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxyXG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICdlZGl0UHJvZmlsZS5odG1sJyxcclxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdBcnRpc3RUb29sc0NvbnRyb2xsZXInLFxyXG4gICAgICAgICAgc2NvcGU6ICRzY29wZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9LCAwKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAkc2NvcGUuY2xvc2VFZGl0UHJvZmlsZU1vZGFsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUuc2hvd1Byb2ZpbGVJbmZvKCk7XHJcbiAgICBpZiAoJHNjb3BlLmVkaXRQcm9maWxlTW9kYWxJbnN0YW5jZS5jbG9zZSkge1xyXG4gICAgICAkc2NvcGUuZWRpdFByb2ZpbGVNb2RhbEluc3RhbmNlLmNsb3NlKCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLnRoYW5rWW91TW9kYWxJbnN0YW5jZSA9IHt9O1xyXG4gICRzY29wZS50aGFua1lvdU1vZGFsID0ge307XHJcbiAgJHNjb3BlLm9wZW5UaGFua1lvdU1vZGFsID0ge1xyXG4gICAgdGhhbmtZb3U6IGZ1bmN0aW9uKHN1Ym1pc3Npb25JRCkge1xyXG4gICAgICAkc2NvcGUudGhhbmtZb3VNb2RhbC5zdWJtaXNzaW9uSUQgPSBzdWJtaXNzaW9uSUQ7XHJcbiAgICAgICRzY29wZS5tb2RhbEluc3RhbmNlID0gJHVpYk1vZGFsLm9wZW4oe1xyXG4gICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ3RoYW5rWW91Lmh0bWwnLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6ICdPcGVuVGhhbmtZb3VNb2RhbENvbnRyb2xsZXInLFxyXG4gICAgICAgIHNjb3BlOiAkc2NvcGVcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxuICAkc2NvcGUuY2xvc2VUaGFua1lvdU1vZGFsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUudGhhbmtZb3VNb2RhbEluc3RhbmNlLmNsb3NlKCk7XHJcbiAgfTtcclxuICAvKiBJbml0IHByb2ZpbGUgKi9cclxuICAkc2NvcGUucHJvZmlsZSA9IHt9O1xyXG5cclxuICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgIFNlc3Npb25TZXJ2aWNlLmRlbGV0ZVVzZXIoKTtcclxuICAgICAgJHN0YXRlLmdvKCdsb2dpbicpO1xyXG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvbG9naW4nO1xyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgY29uc29sZS5sb2coJHN0YXRlUGFyYW1zLnN1Ym1pc3Npb24pO1xyXG4gIGlmICgkc3RhdGVQYXJhbXMuc3VibWlzc2lvbikge1xyXG4gICAgJHNjb3BlLm9wZW5UaGFua1lvdU1vZGFsLnRoYW5rWW91KCRzdGF0ZVBhcmFtcy5zdWJtaXNzaW9uLl9pZCk7XHJcbiAgfVxyXG5cclxuXHJcbiAgJHNjb3BlLnNob3dQcm9maWxlSW5mbyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLnByb2ZpbGUuZGF0YSA9IEpTT04ucGFyc2UoU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKTtcclxuICAgIGlmICgoJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcyAmJiAkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzLmxlbmd0aCA9PT0gMCkgfHwgISRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3MpIHtcclxuICAgICAgJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcyA9IFt7XHJcbiAgICAgICAgdXJsOiAnJyxcclxuICAgICAgICBhdmF0YXI6ICcnLFxyXG4gICAgICAgIHVzZXJuYW1lOiAnJyxcclxuICAgICAgICBpZDogLTEsXHJcbiAgICAgICAgcGVybWFuZW50TGluazogdHJ1ZVxyXG4gICAgICB9XTtcclxuICAgIH07XHJcbiAgICAkc2NvcGUucHJvZmlsZS5pc0F2YWlsYWJsZSA9IHt9O1xyXG4gICAgJHNjb3BlLnByb2ZpbGUuaXNBdmFpbGFibGUuZW1haWwgPSAkc2NvcGUucHJvZmlsZS5kYXRhLmVtYWlsID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgJHNjb3BlLnByb2ZpbGUuaXNBdmFpbGFibGUucGFzc3dvcmQgPSAkc2NvcGUucHJvZmlsZS5kYXRhLnBhc3N3b3JkID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgJHNjb3BlLnByb2ZpbGUuaXNBdmFpbGFibGUuc291bmRjbG91ZCA9ICRzY29wZS5wcm9maWxlLmRhdGEuc291bmRjbG91ZCA/IHRydWUgOiBmYWxzZTtcclxuICAgICRzY29wZS5wcm9maWxlLmRhdGEucGFzc3dvcmQgPSAnJztcclxuICB9O1xyXG5cclxuICAkc2NvcGUuc2F2ZVByb2ZpbGVJbmZvID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgJHNjb3BlLm1lc3NhZ2UgPSB7XHJcbiAgICAgIHZhbHVlOiAnJyxcclxuICAgICAgdmlzaWJsZTogZmFsc2VcclxuICAgIH07XHJcblxyXG4gICAgdmFyIHBlcm1hbmVudExpbmtzID0gJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcy5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICByZXR1cm4gaXRlbS5pZCAhPT0gLTE7XHJcbiAgICB9KS5tYXAoZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICBkZWxldGUgaXRlbVsnJCRoYXNoS2V5J107XHJcbiAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgfSk7XHJcblxyXG4gICAgdmFyIHNlbmRPYmogPSB7XHJcbiAgICAgIG5hbWU6ICcnLFxyXG4gICAgICBwYXNzd29yZDogJycsXHJcbiAgICAgIHBlcm1hbmVudExpbmtzOiBKU09OLnN0cmluZ2lmeShwZXJtYW5lbnRMaW5rcylcclxuICAgIH1cclxuICAgIGlmICgkc2NvcGUucHJvZmlsZS5maWVsZCA9PT0gJ25hbWUnKSB7XHJcbiAgICAgIHNlbmRPYmoubmFtZSA9ICRzY29wZS5wcm9maWxlLmRhdGEubmFtZTtcclxuICAgIH0gZWxzZSBpZiAoJHNjb3BlLnByb2ZpbGUuZmllbGQgPT09ICdwYXNzd29yZCcpIHtcclxuICAgICAgc2VuZE9iai5wYXNzd29yZCA9ICRzY29wZS5wcm9maWxlLmRhdGEucGFzc3dvcmQ7XHJcbiAgICB9IGVsc2UgaWYgKCRzY29wZS5wcm9maWxlLmZpZWxkID09PSAnZW1haWwnKSB7XHJcbiAgICAgIHNlbmRPYmouZW1haWwgPSAkc2NvcGUucHJvZmlsZS5kYXRhLmVtYWlsO1xyXG4gICAgfVxyXG5cclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgIEFydGlzdFRvb2xzU2VydmljZVxyXG4gICAgLnNhdmVQcm9maWxlSW5mbyhzZW5kT2JqKVxyXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIGlmIChyZXMuZGF0YSA9PT0gJ0VtYWlsIEVycm9yJykge1xyXG4gICAgICAgICRzY29wZS5tZXNzYWdlID0ge1xyXG4gICAgICAgICAgdmFsdWU6ICdFbWFpbCBhbHJlYWR5IGV4aXN0cyEnLFxyXG4gICAgICAgICAgdmlzaWJsZTogdHJ1ZVxyXG4gICAgICAgIH07XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZShyZXMuZGF0YSk7XHJcbiAgICAgICRzY29wZS5jbG9zZUVkaXRQcm9maWxlTW9kYWwoKTtcclxuICAgIH0pXHJcbiAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIGFsZXJ0KCdlcnJvciBzYXZpbmcnKTtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5yZW1vdmVQZXJtYW5lbnRMaW5rID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3Muc3BsaWNlKGluZGV4LCAxKTtcclxuICB9O1xyXG4gICRzY29wZS5oaWRlYnV0dG9uID0gZmFsc2U7XHJcbiAgJHNjb3BlLmFkZFBlcm1hbmVudExpbmsgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICBpZiAoJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcy5sZW5ndGggPj0gMiAmJiAhJHNjb3BlLnVzZXIuYWRtaW4pIHtcclxuICAgICAgJHNjb3BlLmhpZGVidXR0b24gPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICgkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzLmxlbmd0aCA+IDIgJiYgISRzY29wZS51c2VyLmFkbWluKSB7XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuXHJcbiAgICAkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzLnB1c2goe1xyXG4gICAgICB1cmw6ICcnLFxyXG4gICAgICBhdmF0YXI6ICcnLFxyXG4gICAgICB1c2VybmFtZTogJycsXHJcbiAgICAgIGlkOiAtMSxcclxuICAgICAgcGVybWFuZW50TGluazogdHJ1ZVxyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLnBlcm1hbmVudExpbmtVUkxDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgdmFyIHBlcm1hbmVudExpbmsgPSB7fTtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgIEFydGlzdFRvb2xzU2VydmljZVxyXG4gICAgLnJlc29sdmVEYXRhKHtcclxuICAgICAgdXJsOiAkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzW2luZGV4XS51cmxcclxuICAgIH0pXHJcbiAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rc1tpbmRleF0uYXZhdGFyID0gcmVzLmRhdGEuYXZhdGFyX3VybCA/IHJlcy5kYXRhLmF2YXRhcl91cmwgOiAnJztcclxuICAgICAgJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rc1tpbmRleF0udXNlcm5hbWUgPSByZXMuZGF0YS5wZXJtYWxpbms7XHJcbiAgICAgICRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3NbaW5kZXhdLmlkID0gcmVzLmRhdGEuaWQ7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICB9KVxyXG4gICAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xyXG4gICAgICBhbGVydCgnQXJ0aXN0cyBub3QgZm91bmQnKTtcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5zYXZlU291bmRDbG91ZEFjY291bnRJbmZvID0gZnVuY3Rpb24oKSB7XHJcbiAgICBTQy5jb25uZWN0KClcclxuICAgIC50aGVuKHNhdmVJbmZvKVxyXG4gICAgLnRoZW4oaGFuZGxlUmVzcG9uc2UpXHJcbiAgICAuY2F0Y2goaGFuZGxlRXJyb3IpO1xyXG5cclxuICAgIGZ1bmN0aW9uIHNhdmVJbmZvKHJlcykge1xyXG4gICAgICByZXR1cm4gQXJ0aXN0VG9vbHNTZXJ2aWNlLnNhdmVTb3VuZENsb3VkQWNjb3VudEluZm8oe1xyXG4gICAgICAgIHRva2VuOiByZXMub2F1dGhfdG9rZW5cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UocmVzKSB7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIGlmIChyZXMuc3RhdHVzID09PSAyMDAgJiYgKHJlcy5kYXRhLnN1Y2Nlc3MgPT09IHRydWUpKSB7XHJcbiAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlKHJlcy5kYXRhLmRhdGEpO1xyXG4gICAgICAgICRzY29wZS5wcm9maWxlLmRhdGEgPSByZXMuZGF0YS5kYXRhO1xyXG4gICAgICAgICRzY29wZS5wcm9maWxlLmlzQXZhaWxhYmxlLnNvdW5kY2xvdWQgPSB0cnVlO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICRzY29wZS5tZXNzYWdlID0ge1xyXG4gICAgICAgICAgdmFsdWU6ICdZb3UgYWxyZWFkeSBoYXZlIGFuIGFjY291bnQgd2l0aCB0aGlzIHNvdW5kY2xvdWQgdXNlcm5hbWUnLFxyXG4gICAgICAgICAgdmlzaWJsZTogdHJ1ZVxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycikge1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gICRzY29wZS5nZXREb3dubG9hZExpc3QgPSBmdW5jdGlvbigpIHtcclxuICAgIEFydGlzdFRvb2xzU2VydmljZVxyXG4gICAgLmdldERvd25sb2FkTGlzdCgpXHJcbiAgICAudGhlbihoYW5kbGVSZXNwb25zZSlcclxuICAgIC5jYXRjaChoYW5kbGVFcnJvcik7XHJcblxyXG4gICAgZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UocmVzKSB7XHJcbiAgICAgICRzY29wZS5kb3dubG9hZEdhdGV3YXlMaXN0ID0gcmVzLmRhdGE7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyKSB7XHJcbiAgICAgIGNvbnNvbGUubG9nKGVycilcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAkc2NvcGUuZGVsZXRlRG93bmxvYWRHYXRld2F5ID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgIGlmIChjb25maXJtKFwiRG8geW91IHJlYWxseSB3YW50IHRvIGRlbGV0ZSB0aGlzIHRyYWNrP1wiKSkge1xyXG4gICAgICB2YXIgZG93bmxvYWRHYXRlV2F5SUQgPSAkc2NvcGUuZG93bmxvYWRHYXRld2F5TGlzdFtpbmRleF0uX2lkO1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgIEFydGlzdFRvb2xzU2VydmljZVxyXG4gICAgICAuZGVsZXRlRG93bmxvYWRHYXRld2F5KHtcclxuICAgICAgICBpZDogZG93bmxvYWRHYXRlV2F5SURcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4oaGFuZGxlUmVzcG9uc2UpXHJcbiAgICAgIC5jYXRjaChoYW5kbGVFcnJvcik7XHJcblxyXG4gICAgICBmdW5jdGlvbiBoYW5kbGVSZXNwb25zZShyZXMpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICRzY29wZS5kb3dubG9hZEdhdGV3YXlMaXN0LnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKHJlcykge1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9O1xyXG59KVxyXG4uY29udHJvbGxlcignT3BlblRoYW5rWW91TW9kYWxDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlKSB7fSkiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XHJcbiAgICAkc3RhdGVQcm92aWRlclxyXG4gICAgICAgIC5zdGF0ZSgnYXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlFZGl0Jywge1xyXG4gICAgICAgICAgICB1cmw6ICcvZG93bmxvYWQtZ2F0ZXdheS9lZGl0LzpnYXRld2F5SUQnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvYXJ0aXN0VG9vbHMvZG93bmxvYWRHYXRld2F5Lmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlDb250cm9sbGVyJ1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnN0YXRlKCdhcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheU5ldycsIHtcclxuICAgICAgICAgICAgdXJsOiAnL2Rvd25sb2FkLWdhdGV3YXkvbmV3JyxcclxuICAgICAgICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgICAgICAgICBzdWJtaXNzaW9uOiBudWxsXHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS92aWV3cy9hcnRpc3RUb29scy9kb3dubG9hZEdhdGV3YXkuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheUNvbnRyb2xsZXInXHJcbiAgICAgICAgfSlcclxufSk7XHJcblxyXG5hcHAuY29udHJvbGxlcignQXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsICRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgJHdpbmRvdywgJHVpYk1vZGFsLCAkdGltZW91dCwgU2Vzc2lvblNlcnZpY2UsIEFydGlzdFRvb2xzU2VydmljZSkge1xyXG4gICAgLyogSW5pdCBEb3dubG9hZCBHYXRld2F5IGZvcm0gZGF0YSAqL1xyXG4gICAgJHNjb3BlLnVzZXIgPSBKU09OLnBhcnNlKFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKSk7XHJcblxyXG4gICAgJHNjb3BlLnRyYWNrID0ge1xyXG4gICAgICAgIGFydGlzdFVzZXJuYW1lOiAnJyxcclxuICAgICAgICB0cmFja1RpdGxlOiAnJyxcclxuICAgICAgICB0cmFja0FydHdvcmtVUkw6ICcnLFxyXG4gICAgICAgIFNNTGlua3M6IFtdLFxyXG4gICAgICAgIGxpa2U6IGZhbHNlLFxyXG4gICAgICAgIGNvbW1lbnQ6IGZhbHNlLFxyXG4gICAgICAgIHJlcG9zdDogZmFsc2UsXHJcbiAgICAgICAgYXJ0aXN0czogW10sXHJcbiAgICAgICAgc2hvd0Rvd25sb2FkVHJhY2tzOiAndXNlcicsXHJcbiAgICAgICAgYWRtaW46ICRzY29wZS51c2VyLmFkbWluLFxyXG4gICAgICAgIGZpbGU6IHt9XHJcbiAgICB9O1xyXG4gICAgJHNjb3BlLnByb2ZpbGUgPSB7fTtcclxuICAgIC8qIEluaXQgdHJhY2sgbGlzdCBhbmQgdHJhY2tMaXN0T2JqKi9cclxuICAgICRzY29wZS50cmFja0xpc3QgPSBbXTtcclxuICAgICRzY29wZS50cmFja0xpc3RPYmogPSBudWxsO1xyXG5cclxuICAgIC8qIE1ldGhvZCBmb3IgcmVzZXR0aW5nIERvd25sb2FkIEdhdGV3YXkgZm9ybSAqL1xyXG5cclxuICAgICRzY29wZS50cmFja0xpc3RDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xyXG5cclxuICAgICAgICAvKiBTZXQgYm9vbGVhbnMgKi9cclxuXHJcbiAgICAgICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSBmYWxzZTtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcblxyXG4gICAgICAgIC8qIFNldCB0cmFjayBkYXRhICovXHJcblxyXG4gICAgICAgIHZhciB0cmFjayA9ICRzY29wZS50cmFja0xpc3RPYmo7XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrVVJMID0gdHJhY2sucGVybWFsaW5rX3VybDtcclxuICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tUaXRsZSA9IHRyYWNrLnRpdGxlO1xyXG4gICAgICAgICRzY29wZS50cmFjay50cmFja0lEID0gdHJhY2suaWQ7XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdElEID0gdHJhY2sudXNlci5pZDtcclxuICAgICAgICAkc2NvcGUudHJhY2suZGVzY3JpcHRpb24gPSB0cmFjay5kZXNjcmlwdGlvbjtcclxuICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tBcnR3b3JrVVJMID0gdHJhY2suYXJ0d29ya191cmwgPyB0cmFjay5hcnR3b3JrX3VybC5yZXBsYWNlKCdsYXJnZS5qcGcnLCAndDUwMHg1MDAuanBnJykgOiAnJztcclxuICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0QXJ0d29ya1VSTCA9IHRyYWNrLnVzZXIuYXZhdGFyX3VybCA/IHRyYWNrLnVzZXIuYXZhdGFyX3VybCA6ICcnO1xyXG4gICAgICAgICRzY29wZS50cmFjay5hcnRpc3RVUkwgPSB0cmFjay51c2VyLnBlcm1hbGlua191cmw7XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdFVzZXJuYW1lID0gdHJhY2sudXNlci51c2VybmFtZTtcclxuICAgICAgICAkc2NvcGUudHJhY2suU01MaW5rcyA9IFtdO1xyXG5cclxuICAgICAgICBTQy5nZXQoJy91c2Vycy8nICsgJHNjb3BlLnRyYWNrLmFydGlzdElEICsgJy93ZWItcHJvZmlsZXMnKVxyXG4gICAgICAgICAgICAudGhlbihoYW5kbGVXZWJQcm9maWxlcylcclxuICAgICAgICAgICAgLmNhdGNoKGhhbmRsZUVycm9yKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlV2ViUHJvZmlsZXMocHJvZmlsZXMpIHtcclxuICAgICAgICAgICAgcHJvZmlsZXMuZm9yRWFjaChmdW5jdGlvbihwcm9mKSB7XHJcbiAgICAgICAgICAgICAgICBpZiAoWyd0d2l0dGVyJywgJ3lvdXR1YmUnLCAnZmFjZWJvb2snLCAnc3BvdGlmeScsICdzb3VuZGNsb3VkJywgJ2luc3RhZ3JhbSddLmluZGV4T2YocHJvZi5zZXJ2aWNlKSAhPSAtMSkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS50cmFjay5TTUxpbmtzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk6IHByb2Yuc2VydmljZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHByb2YudXJsXHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycikge1xyXG4gICAgICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tJRCA9IG51bGw7XHJcbiAgICAgICAgICAgIGFsZXJ0KCdTb25nIG5vdCBmb3VuZCBvciBmb3JiaWRkZW4nKTtcclxuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG5cclxuICAgICRzY29wZS5yZW1vdmVTTUxpbmsgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICRzY29wZS50cmFjay5TTUxpbmtzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9O1xyXG5cclxuICAgICRzY29wZS5zYXZlRG93bmxvYWRHYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKCEoJHNjb3BlLnRyYWNrLmRvd25sb2FkVVJMIHx8ICRzY29wZS50cmFjay5maWxlLm5hbWUpKSB7XHJcbiAgICAgICAgICAgIGFsZXJ0KCdFbnRlciBhIGRvd25sb2FkIGZpbGUnKTtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKCEkc2NvcGUudHJhY2sudHJhY2tJRCkge1xyXG4gICAgICAgICAgICBhbGVydCgnVHJhY2sgTm90IEZvdW5kJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAgIHZhciBzZW5kT2JqID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiAkc2NvcGUudHJhY2spIHtcclxuICAgICAgICAgICAgc2VuZE9iai5hcHBlbmQocHJvcCwgJHNjb3BlLnRyYWNrW3Byb3BdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIGFydGlzdHMgPSAkc2NvcGUudHJhY2suYXJ0aXN0cy5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlbS5pZCAhPT0gLTE7XHJcbiAgICAgICAgfSkubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgZGVsZXRlIGl0ZW1bJyQkaGFzaEtleSddO1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlbTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIHNlbmRPYmouYXBwZW5kKCdhcnRpc3RzJywgSlNPTi5zdHJpbmdpZnkoYXJ0aXN0cykpO1xyXG4gICAgICAgIHZhciBTTUxpbmtzID0ge307XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgIFNNTGlua3NbaXRlbS5rZXldID0gaXRlbS52YWx1ZTtcclxuICAgICAgICB9KTtcclxuICAgICAgICBzZW5kT2JqLmFwcGVuZCgnU01MaW5rcycsIEpTT04uc3RyaW5naWZ5KFNNTGlua3MpKTtcclxuICAgICAgICBpZiAoJHNjb3BlLnRyYWNrLnBsYXlsaXN0cykge1xyXG4gICAgICAgICAgICBzZW5kT2JqLmFwcGVuZCgncGxheWxpc3RzJywgSlNPTi5zdHJpbmdpZnkoJHNjb3BlLnRyYWNrLnBsYXlsaXN0cykpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XHJcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICB1cmw6ICcvYXBpL2RhdGFiYXNlL2Rvd25sb2FkdXJsJyxcclxuICAgICAgICAgICAgaGVhZGVyczoge1xyXG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6IHVuZGVmaW5lZFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0cmFuc2Zvcm1SZXF1ZXN0OiBhbmd1bGFyLmlkZW50aXR5LFxyXG4gICAgICAgICAgICBkYXRhOiBzZW5kT2JqXHJcbiAgICAgICAgfTtcclxuICAgICAgICAkaHR0cChvcHRpb25zKVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBpZiAoJHN0YXRlUGFyYW1zLnN1Ym1pc3Npb24pIHtcclxuICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5TGlzdCcsIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJ3N1Ym1pc3Npb24nOiAkc3RhdGVQYXJhbXMuc3VibWlzc2lvblxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5TGlzdCcpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBhbGVydChcIkVSUk9SOiBFcnJvciBpbiBzYXZpbmcgdXJsXCIpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAkc2NvcGUuY2hlY2tJZkVkaXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoJHN0YXRlUGFyYW1zLmdhdGV3YXlJRCkge1xyXG4gICAgICAgICAgICAkc2NvcGUuZ2V0RG93bmxvYWRHYXRld2F5KCRzdGF0ZVBhcmFtcy5nYXRld2F5SUQpO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgJHNjb3BlLmdldFRyYWNrTGlzdEZyb21Tb3VuZGNsb3VkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHByb2ZpbGUgPSBKU09OLnBhcnNlKFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKSk7XHJcbiAgICAgICAgaWYgKHByb2ZpbGUuc291bmRjbG91ZCkge1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgICAgIFNDLmdldCgnL3VzZXJzLycgKyBwcm9maWxlLnNvdW5kY2xvdWQuaWQgKyAnL3RyYWNrcycpXHJcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbih0cmFja3MpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2tMaXN0ID0gdHJhY2tzO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgICRzY29wZS5jaGVja0lmU3VibWlzc2lvbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICgkc3RhdGVQYXJhbXMuc3VibWlzc2lvbikge1xyXG4gICAgICAgICAgICBpZiAoJHN0YXRlLmluY2x1ZGVzKCdhcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheU5ldycpKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tVUkwgPSAkcm9vdFNjb3BlLnN1Ym1pc3Npb24udHJhY2tVUkw7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2tVUkxDaGFuZ2UoKTtcclxuICAgICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgJHNjb3BlLm9wZW5UaGFua1lvdU1vZGFsLnRoYW5rWW91KCRzdGF0ZVBhcmFtcy5zdWJtaXNzaW9uLl9pZCk7XHJcbiAgICAgICAgICAgICRyb290U2NvcGUuc3VibWlzc2lvbiA9IG51bGw7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgICRzY29wZS50cmFja1VSTENoYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICgkc2NvcGUudHJhY2sudHJhY2tVUkwgIT09ICcnKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gZmFsc2U7XHJcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgICAgICAgQXJ0aXN0VG9vbHNTZXJ2aWNlLnJlc29sdmVEYXRhKHtcclxuICAgICAgICAgICAgICAgIHVybDogJHNjb3BlLnRyYWNrLnRyYWNrVVJMXHJcbiAgICAgICAgICAgIH0pLnRoZW4oaGFuZGxlVHJhY2tEYXRhQW5kR2V0UHJvZmlsZXMpLnRoZW4oaGFuZGxlV2ViUHJvZmlsZXMpLmNhdGNoKGhhbmRsZUVycm9yKTtcclxuXHJcbiAgICAgICAgICAgIGZ1bmN0aW9uIGhhbmRsZVRyYWNrRGF0YUFuZEdldFByb2ZpbGVzKHJlcykge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrVGl0bGUgPSByZXMuZGF0YS50aXRsZTtcclxuICAgICAgICAgICAgICAgICRzY29wZS50cmFjay50cmFja0lEID0gcmVzLmRhdGEuaWQ7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0SUQgPSByZXMuZGF0YS51c2VyLmlkO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLmRlc2NyaXB0aW9uID0gcmVzLmRhdGEuZGVzY3JpcHRpb247XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tBcnR3b3JrVVJMID0gcmVzLmRhdGEuYXJ0d29ya191cmwgPyByZXMuZGF0YS5hcnR3b3JrX3VybC5yZXBsYWNlKCdsYXJnZS5qcGcnLCAndDUwMHg1MDAuanBnJykgOiAnJztcclxuICAgICAgICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RBcnR3b3JrVVJMID0gcmVzLmRhdGEudXNlci5hdmF0YXJfdXJsID8gcmVzLmRhdGEudXNlci5hdmF0YXJfdXJsLnJlcGxhY2UoJ2xhcmdlLmpwZycsICd0NTAweDUwMC5qcGcnKSA6ICcnO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdFVSTCA9IHJlcy5kYXRhLnVzZXIucGVybWFsaW5rX3VybDtcclxuICAgICAgICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RVc2VybmFtZSA9IHJlcy5kYXRhLnVzZXIudXNlcm5hbWU7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2suU01MaW5rcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIFNDLmdldCgnL3VzZXJzLycgKyAkc2NvcGUudHJhY2suYXJ0aXN0SUQgKyAnL3dlYi1wcm9maWxlcycpO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBoYW5kbGVXZWJQcm9maWxlcyhwcm9maWxlcykge1xyXG4gICAgICAgICAgICAgICAgcHJvZmlsZXMuZm9yRWFjaChmdW5jdGlvbihwcm9mKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKFsndHdpdHRlcicsICd5b3V0dWJlJywgJ2ZhY2Vib29rJywgJ3Nwb3RpZnknLCAnc291bmRjbG91ZCcsICdpbnN0YWdyYW0nXS5pbmRleE9mKHByb2Yuc2VydmljZSkgIT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MucHVzaCh7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBrZXk6IHByb2Yuc2VydmljZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBwcm9mLnVybFxyXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihlcnIpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS50cmFjay50cmFja0lEID0gbnVsbDtcclxuICAgICAgICAgICAgICAgIGFsZXJ0KCdTb25nIG5vdCBmb3VuZCBvciBmb3JiaWRkZW4nKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLlNNTGlua0NoYW5nZSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgZnVuY3Rpb24gZ2V0TG9jYXRpb24oaHJlZikge1xyXG4gICAgICAgICAgICB2YXIgbG9jYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcclxuICAgICAgICAgICAgbG9jYXRpb24uaHJlZiA9IGhyZWY7XHJcbiAgICAgICAgICAgIGlmIChsb2NhdGlvbi5ob3N0ID09IFwiXCIpIHtcclxuICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSBsb2NhdGlvbi5ocmVmO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHJldHVybiBsb2NhdGlvbjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBsb2NhdGlvbiA9IGdldExvY2F0aW9uKCRzY29wZS50cmFjay5TTUxpbmtzW2luZGV4XS52YWx1ZSk7XHJcbiAgICAgICAgdmFyIGhvc3QgPSBsb2NhdGlvbi5ob3N0bmFtZS5zcGxpdCgnLicpWzBdO1xyXG4gICAgICAgIHZhciBmaW5kTGluayA9ICRzY29wZS50cmFjay5TTUxpbmtzLmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpdGVtLmtleSA9PT0gaG9zdDtcclxuICAgICAgICB9KTtcclxuXHJcbiAgICAgICAgaWYgKGZpbmRMaW5rLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkc2NvcGUudHJhY2suU01MaW5rc1tpbmRleF0ua2V5ID0gaG9zdDtcclxuICAgIH1cclxuXHJcbiAgICAkc2NvcGUuYWRkU01MaW5rID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MucHVzaCh7XHJcbiAgICAgICAgICAgIGtleTogJycsXHJcbiAgICAgICAgICAgIHZhbHVlOiAnJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgICRzY29wZS5jbGVhck9yRmlsZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICgkc2NvcGUudHJhY2suZG93bmxvYWRVUkwpIHtcclxuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KFwiaW5wdXRbdHlwZT0nZmlsZSddXCIpLnZhbChudWxsKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLmFydGlzdFVSTENoYW5nZSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgdmFyIGFydGlzdCA9IHt9O1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgICBBcnRpc3RUb29sc1NlcnZpY2UucmVzb2x2ZURhdGEoe1xyXG4gICAgICAgICAgICB1cmw6ICRzY29wZS50cmFjay5hcnRpc3RzW2luZGV4XS51cmxcclxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0c1tpbmRleF0uYXZhdGFyID0gcmVzLmRhdGEuYXZhdGFyX3VybCA/IHJlcy5kYXRhLmF2YXRhcl91cmwgOiAnJztcclxuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdHNbaW5kZXhdLnVzZXJuYW1lID0gcmVzLmRhdGEudXNlcm5hbWU7XHJcbiAgICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RzW2luZGV4XS5pZCA9IHJlcy5kYXRhLmlkO1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgICBhbGVydCgnQXJ0aXN0cyBub3QgZm91bmQnKTtcclxuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAkc2NvcGUucmVtb3ZlQXJ0aXN0ID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0cy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgfVxyXG5cclxuICAgICRzY29wZS5hZGRBcnRpc3QgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0cy5wdXNoKHtcclxuICAgICAgICAgICAgdXJsOiAnJyxcclxuICAgICAgICAgICAgYXZhdGFyOiAnJyxcclxuICAgICAgICAgICAgdXNlcm5hbWU6ICcnLFxyXG4gICAgICAgICAgICBpZDogLTEsXHJcbiAgICAgICAgICAgIHBlcm1hbmVudExpbms6IGZhbHNlXHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLnJlbW92ZVBsYXlsaXN0ID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAkc2NvcGUudHJhY2sucGxheWxpc3RzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9XHJcbiAgICAkc2NvcGUucGxheWxpc3RVUkxDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgICBBZG1pbkRMR2F0ZVNlcnZpY2VcclxuICAgICAgICAgICAgLnJlc29sdmVEYXRhKHtcclxuICAgICAgICAgICAgICAgIHVybDogJHNjb3BlLnRyYWNrLnBsYXlsaXN0c1tpbmRleF0udXJsXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnBsYXlsaXN0c1tpbmRleF0uYXZhdGFyID0gcmVzLmRhdGEuYXJ0d29ya191cmw7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2sucGxheWxpc3RzW2luZGV4XS50aXRsZSA9IHJlcy5kYXRhLnRpdGxlO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnBsYXlsaXN0c1tpbmRleF0uaWQgPSByZXMuZGF0YS5pZDtcclxuICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgICAgICAgYWxlcnQoJ1BsYXlsaXN0IG5vdCBmb3VuZCcpO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfSlcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiByZXNldERvd25sb2FkR2F0ZXdheSgpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gZmFsc2U7XHJcbiAgICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XHJcbiAgICAgICAgICAgIHZhbDogJycsXHJcbiAgICAgICAgICAgIHZpc2libGU6IGZhbHNlXHJcbiAgICAgICAgfTtcclxuXHJcbiAgICAgICAgJHNjb3BlLnRyYWNrID0ge1xyXG4gICAgICAgICAgICBhcnRpc3RVc2VybmFtZTogJycsXHJcbiAgICAgICAgICAgIHRyYWNrVGl0bGU6ICcnLFxyXG4gICAgICAgICAgICB0cmFja0FydHdvcmtVUkw6ICcnLFxyXG4gICAgICAgICAgICBTTUxpbmtzOiBbXSxcclxuICAgICAgICAgICAgbGlrZTogZmFsc2UsXHJcbiAgICAgICAgICAgIGNvbW1lbnQ6IGZhbHNlLFxyXG4gICAgICAgICAgICByZXBvc3Q6IGZhbHNlLFxyXG4gICAgICAgICAgICBhcnRpc3RzOiBbe1xyXG4gICAgICAgICAgICAgICAgdXJsOiAnJyxcclxuICAgICAgICAgICAgICAgIGF2YXRhcjogJycsXHJcbiAgICAgICAgICAgICAgICB1c2VybmFtZTogJycsXHJcbiAgICAgICAgICAgICAgICBpZDogLTEsXHJcbiAgICAgICAgICAgICAgICBwZXJtYW5lbnRMaW5rOiBmYWxzZVxyXG4gICAgICAgICAgICB9XSxcclxuICAgICAgICAgICAgc2hvd0Rvd25sb2FkVHJhY2tzOiAndXNlcidcclxuICAgICAgICB9O1xyXG4gICAgICAgIGFuZ3VsYXIuZWxlbWVudChcImlucHV0W3R5cGU9J2ZpbGUnXVwiKS52YWwobnVsbCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyogTWV0aG9kIGZvciBnZXR0aW5nIERvd25sb2FkR2F0ZXdheSBpbiBjYXNlIG9mIGVkaXQgKi9cclxuXHJcbiAgICAkc2NvcGUuZ2V0RG93bmxvYWRHYXRld2F5ID0gZnVuY3Rpb24oZG93bmxvYWRHYXRlV2F5SUQpIHtcclxuICAgICAgICAvLyByZXNldERvd25sb2FkR2F0ZXdheSgpO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgICBBcnRpc3RUb29sc1NlcnZpY2VcclxuICAgICAgICAgICAgLmdldERvd25sb2FkR2F0ZXdheSh7XHJcbiAgICAgICAgICAgICAgICBpZDogZG93bmxvYWRHYXRlV2F5SURcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oaGFuZGxlUmVzcG9uc2UpXHJcbiAgICAgICAgICAgIC5jYXRjaChoYW5kbGVFcnJvcik7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlcykge1xyXG5cclxuICAgICAgICAgICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAkc2NvcGUudHJhY2sgPSByZXMuZGF0YTtcclxuXHJcbiAgICAgICAgICAgIHZhciBTTUxpbmtzID0gcmVzLmRhdGEuU01MaW5rcyA/IHJlcy5kYXRhLlNNTGlua3MgOiB7fTtcclxuICAgICAgICAgICAgdmFyIHBlcm1hbmVudExpbmtzID0gcmVzLmRhdGEucGVybWFuZW50TGlua3MgPyByZXMuZGF0YS5wZXJtYW5lbnRMaW5rcyA6IFsnJ107XHJcbiAgICAgICAgICAgIHZhciBTTUxpbmtzQXJyYXkgPSBbXTtcclxuICAgICAgICAgICAgdmFyIHBlcm1hbmVudExpbmtzQXJyYXkgPSBbXTtcclxuXHJcbiAgICAgICAgICAgIGZvciAodmFyIGxpbmsgaW4gU01MaW5rcykge1xyXG4gICAgICAgICAgICAgICAgU01MaW5rc0FycmF5LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIGtleTogbGluayxcclxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogU01MaW5rc1tsaW5rXVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcGVybWFuZW50TGlua3MuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICBwZXJtYW5lbnRMaW5rc0FycmF5LnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgIHVybDogaXRlbVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGlmICghJHNjb3BlLnRyYWNrLnNob3dEb3dubG9hZFRyYWNrcykge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnNob3dEb3dubG9hZFRyYWNrcyA9ICd1c2VyJztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAkc2NvcGUudHJhY2suU01MaW5rcyA9IFNNTGlua3NBcnJheTtcclxuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnBlcm1hbmVudExpbmtzID0gcGVybWFuZW50TGlua3NBcnJheTtcclxuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnBsYXlsaXN0SURTID0gW107XHJcbiAgICAgICAgICAgIC8vICRzY29wZS50cmFjay5zaG93RG93bmxvYWRUcmFja3MgPSAoJHNjb3BlLnRyYWNrLnNob3dEb3dubG9hZFRyYWNrcyA9PT0gJ3VzZXInKSA/IHRydWUgOiBmYWxzZTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLnRyYWNrKTtcclxuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKHJlcykge1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgJHNjb3BlLmNsZWFyT3JJbnB1dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS50cmFjay5kb3dubG9hZFVSTCA9IFwiXCI7XHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLiR3YXRjaCgndHJhY2snLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCkge1xyXG4gICAgICAgIGlmIChuZXdWYWwudHJhY2tUaXRsZSlcclxuICAgICAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0cmFja1ByZXZpZXdEYXRhJywgSlNPTi5zdHJpbmdpZnkobmV3VmFsKSk7XHJcbiAgICB9LCB0cnVlKTtcclxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICAgJHN0YXRlUHJvdmlkZXJcclxuICAgICAgICAuc3RhdGUoJ2FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5UHJldmlldycsIHtcclxuICAgICAgICAgICAgdXJsOiAnL2Rvd25sb2FkLWdhdGV3YXkvcHJldmlldycsXHJcbiAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgc3VibWlzc2lvbjogbnVsbFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvYXJ0aXN0VG9vbHMvcHJldmlldy5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0FydGlzdFRvb2xzUHJldmlld0NvbnRyb2xsZXInXHJcbiAgICAgICAgfSlcclxufSk7XHJcblxyXG5cclxuYXBwLmNvbnRyb2xsZXIoXCJBcnRpc3RUb29sc1ByZXZpZXdDb250cm9sbGVyXCIsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCAkc2NvcGUsICRodHRwLCAkbG9jYXRpb24sICR3aW5kb3csICR1aWJNb2RhbCwgJHRpbWVvdXQsIFNlc3Npb25TZXJ2aWNlLCBBcnRpc3RUb29sc1NlcnZpY2UpIHtcclxuICAgIHZhciB0cmFjayA9IEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0cmFja1ByZXZpZXdEYXRhJykpO1xyXG4gICAgY29uc29sZS5sb2codHJhY2spO1xyXG4gICAgaWYgKCF0cmFjay50cmFja1RpdGxlKSB7XHJcbiAgICAgICAgYWxlcnQoJ1RyYWNrIE5vdCBGb3VuZCcpO1xyXG4gICAgICAgICRzdGF0ZS5nbyhcImFydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5TGlzdFwiKTtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLnRyYWNrID0gdHJhY2s7XHJcbiAgICAkc2NvcGUucGxheWVyID0ge307XHJcbiAgICBTQy5zdHJlYW0oJy90cmFja3MvJyArICRzY29wZS50cmFjay50cmFja0lEKVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHApIHtcclxuICAgICAgICAgICAgJHNjb3BlLnBsYXllciA9IHA7XHJcbiAgICAgICAgfSlcclxuXHJcbiAgICAkc2NvcGUudG9nZ2xlID0gdHJ1ZTtcclxuICAgICRzY29wZS50b2dnbGVQbGF5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLnRvZ2dsZSA9ICEkc2NvcGUudG9nZ2xlO1xyXG4gICAgICAgIGlmICgkc2NvcGUudG9nZ2xlKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5wbGF5ZXIucGF1c2UoKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkc2NvcGUucGxheWVyLnBsYXkoKTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbiAgICAkc2NvcGUubm9kbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGFsZXJ0KCdObyBkb3dubG9hZCBpbiBwcmV2aWV3IG1vZGUuJylcclxuICAgIH1cclxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyXHJcbiAgICAuc3RhdGUoJ2hvbWUnLCB7XHJcbiAgICAgIHVybDogJy8nLFxyXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvaG9tZS5odG1sJyxcclxuICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJ1xyXG4gICAgfSlcclxuICAgIC5zdGF0ZSgnYWJvdXQnLCB7XHJcbiAgICAgIHVybDogJy9hYm91dCcsXHJcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS92aWV3cy9hYm91dC5odG1sJyxcclxuICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJ1xyXG4gICAgfSlcclxuICAgIC5zdGF0ZSgnc2VydmljZXMnLCB7XHJcbiAgICAgIHVybDogJy9zZXJ2aWNlcycsXHJcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS92aWV3cy9zZXJ2aWNlcy5odG1sJyxcclxuICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJ1xyXG4gICAgfSlcclxuICAgIC5zdGF0ZSgnZmFxcycsIHtcclxuICAgICAgdXJsOiAnL2ZhcXMnLFxyXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvZmFxcy5odG1sJyxcclxuICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJ1xyXG4gICAgfSlcclxuICAgIC5zdGF0ZSgnYXBwbHknLCB7XHJcbiAgICAgIHVybDogJy9hcHBseScsXHJcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS92aWV3cy9hcHBseS5odG1sJyxcclxuICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJ1xyXG4gICAgfSlcclxuICAgIC5zdGF0ZSgnY29udGFjdCcsIHtcclxuICAgICAgdXJsOiAnL2NvbnRhY3QnLFxyXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvY29udGFjdC5odG1sJyxcclxuICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJ1xyXG4gICAgfSk7XHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ0hvbWVDb250cm9sbGVyJywgWyckcm9vdFNjb3BlJyxcclxuICAnJHN0YXRlJyxcclxuICAnJHNjb3BlJyxcclxuICAnJGh0dHAnLFxyXG4gICckbG9jYXRpb24nLFxyXG4gICckd2luZG93JyxcclxuICAnSG9tZVNlcnZpY2UnLFxyXG4gIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uLCAkd2luZG93LCBIb21lU2VydmljZSkge1xyXG5cclxuICAgICRzY29wZS5hcHBsaWNhdGlvbk9iaiA9IHt9O1xyXG4gICAgJHNjb3BlLmFydGlzdCA9IHt9O1xyXG4gICAgJHNjb3BlLnNlbnQgPSB7XHJcbiAgICAgIGFwcGxpY2F0aW9uOiBmYWxzZSxcclxuICAgICAgYXJ0aXN0RW1haWw6IGZhbHNlXHJcbiAgICB9O1xyXG4gICAgJHNjb3BlLm1lc3NhZ2UgPSB7XHJcbiAgICAgIGFwcGxpY2F0aW9uOiB7XHJcbiAgICAgICAgdmFsOiAnJyxcclxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxyXG4gICAgICB9LFxyXG4gICAgICBhcnRpc3RFbWFpbDoge1xyXG4gICAgICAgIHZhbDogJycsXHJcbiAgICAgICAgdmlzaWJsZTogZmFsc2VcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKiBBcHBseSBwYWdlIHN0YXJ0ICovXHJcblxyXG4gICAgJHNjb3BlLnRvZ2dsZUFwcGxpY2F0aW9uU2VudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAkc2NvcGUubWVzc2FnZSA9IHtcclxuICAgICAgICBhcHBsaWNhdGlvbjoge1xyXG4gICAgICAgICAgdmFsOiAnJyxcclxuICAgICAgICAgIHZpc2libGU6IGZhbHNlXHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICAkc2NvcGUuc2VudC5hcHBsaWNhdGlvbiA9ICEkc2NvcGUuc2VudC5hcHBsaWNhdGlvbjtcclxuICAgIH07XHJcblxyXG4gICAgJHNjb3BlLnNhdmVBcHBsaWNhdGlvbiA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICAgJHNjb3BlLm1lc3NhZ2UuYXBwbGljYXRpb24gPSB7XHJcbiAgICAgICAgdmFsOiAnJyxcclxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxyXG4gICAgICB9O1xyXG5cclxuICAgICAgSG9tZVNlcnZpY2VcclxuICAgICAgICAuc2F2ZUFwcGxpY2F0aW9uKCRzY29wZS5hcHBsaWNhdGlvbk9iailcclxuICAgICAgICAudGhlbihzYXZlQXBwbGljYXRpb25SZXNwb25zZSlcclxuICAgICAgICAuY2F0Y2goc2F2ZUFwcGxpY2F0aW9uRXJyb3IpXHJcblxyXG4gICAgICBmdW5jdGlvbiBzYXZlQXBwbGljYXRpb25SZXNwb25zZShyZXMpIHtcclxuICAgICAgICBpZiAocmVzLnN0YXR1cyA9PT0gMjAwKSB7XHJcbiAgICAgICAgICAkc2NvcGUuYXBwbGljYXRpb25PYmogPSB7fTtcclxuICAgICAgICAgICRzY29wZS5zZW50LmFwcGxpY2F0aW9uID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIHNhdmVBcHBsaWNhdGlvbkVycm9yKHJlcykge1xyXG4gICAgICAgIGlmKHJlcy5zdGF0dXMgPT09IDQwMCkge1xyXG4gICAgICAgICAgJHNjb3BlLm1lc3NhZ2UuYXBwbGljYXRpb24gPSB7XHJcbiAgICAgICAgICAgIHZhbDogJ0VtYWlsIGFscmVhZHkgZXhpc3RzIScsXHJcbiAgICAgICAgICAgIHZpc2libGU6IHRydWVcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgICRzY29wZS5tZXNzYWdlLmFwcGxpY2F0aW9uID0ge1xyXG4gICAgICAgICAgdmFsOiAnRXJyb3IgaW4gcHJvY2Vzc2luZyB5b3VyIHJlcXVlc3QnLFxyXG4gICAgICAgICAgdmlzaWJsZTogdHJ1ZVxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLyogQXBwbHkgcGFnZSBlbmQgKi9cclxuXHJcbiAgICAvKiBBcnRpc3QgVG9vbHMgcGFnZSBzdGFydCAqL1xyXG4gICAgXHJcbiAgICAkc2NvcGUudG9nZ2xlQXJ0aXN0RW1haWwgPSBmdW5jdGlvbigpIHtcclxuICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XHJcbiAgICAgICAgYXJ0aXN0RW1haWw6IHtcclxuICAgICAgICAgIHZhbDogJycsXHJcbiAgICAgICAgICB2aXNpYmxlOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgJHNjb3BlLnNlbnQuYXJ0aXN0RW1haWwgPSAhJHNjb3BlLnNlbnQuYXJ0aXN0RW1haWw7XHJcbiAgICB9O1xyXG5cclxuICAgICRzY29wZS5zYXZlQXJ0aXN0RW1haWwgPSBmdW5jdGlvbigpIHtcclxuICAgICAgSG9tZVNlcnZpY2VcclxuICAgICAgICAuc2F2ZUFydGlzdEVtYWlsKCRzY29wZS5hcnRpc3QpXHJcbiAgICAgICAgLnRoZW4oYXJ0aXN0RW1haWxSZXNwb25zZSlcclxuICAgICAgICAuY2F0Y2goYXJ0aXN0RW1haWxFcnJvcilcclxuXHJcbiAgICAgIGZ1bmN0aW9uIGFydGlzdEVtYWlsUmVzcG9uc2UocmVzKSB7XHJcbiAgICAgICAgaWYgKHJlcy5zdGF0dXMgPT09IDIwMCkge1xyXG4gICAgICAgICAgJHNjb3BlLmFydGlzdCA9IHt9O1xyXG4gICAgICAgICAgJHNjb3BlLnNlbnQuYXJ0aXN0RW1haWwgPSB0cnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gYXJ0aXN0RW1haWxFcnJvcihyZXMpIHtcclxuICAgICAgICBpZihyZXMuc3RhdHVzID09PSA0MDApIHtcclxuICAgICAgICAgICRzY29wZS5tZXNzYWdlLmFydGlzdEVtYWlsID0ge1xyXG4gICAgICAgICAgICB2YWw6ICdFbWFpbCBhbHJlYWR5IGV4aXN0cyEnLFxyXG4gICAgICAgICAgICB2aXNpYmxlOiB0cnVlXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgJHNjb3BlLm1lc3NhZ2UuYXJ0aXN0RW1haWwgPSB7XHJcbiAgICAgICAgICB2YWw6ICdFcnJvciBpbiBwcm9jZXNzaW5nIHlvdXIgcmVxdWVzdCcsXHJcbiAgICAgICAgICB2aXNpYmxlOiB0cnVlXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICAvKiBBcnRpc3QgVG9vbHMgcGFnZSBlbmQgKi9cclxuICB9XHJcbl0pO1xyXG5cclxuYXBwLmRpcmVjdGl2ZSgnYWZmaXhlcicsIGZ1bmN0aW9uKCR3aW5kb3cpIHtcclxuICByZXR1cm4ge1xyXG4gICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICBsaW5rOiBmdW5jdGlvbigkc2NvcGUsICRlbGVtZW50KSB7XHJcbiAgICAgIHZhciB3aW4gPSBhbmd1bGFyLmVsZW1lbnQoJHdpbmRvdyk7XHJcbiAgICAgIHZhciB0b3BPZmZzZXQgPSAkZWxlbWVudFswXS5vZmZzZXRUb3A7XHJcblxyXG4gICAgICBmdW5jdGlvbiBhZmZpeEVsZW1lbnQoKSB7XHJcblxyXG4gICAgICAgIGlmICgkd2luZG93LnBhZ2VZT2Zmc2V0ID4gdG9wT2Zmc2V0KSB7XHJcbiAgICAgICAgICAkZWxlbWVudC5jc3MoJ3Bvc2l0aW9uJywgJ2ZpeGVkJyk7XHJcbiAgICAgICAgICAkZWxlbWVudC5jc3MoJ3RvcCcsICczLjUlJyk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICRlbGVtZW50LmNzcygncG9zaXRpb24nLCAnJyk7XHJcbiAgICAgICAgICAkZWxlbWVudC5jc3MoJ3RvcCcsICcnKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgd2luLnVuYmluZCgnc2Nyb2xsJywgYWZmaXhFbGVtZW50KTtcclxuICAgICAgfSk7XHJcbiAgICAgIHdpbi5iaW5kKCdzY3JvbGwnLCBhZmZpeEVsZW1lbnQpO1xyXG4gICAgfVxyXG4gIH07XHJcbn0pIiwiXHJcblxyXG5hcHAuc2VydmljZSgnQXJ0aXN0VG9vbHNTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKXtcclxuXHJcblx0ZnVuY3Rpb24gcmVzb2x2ZURhdGEoZGF0YSkge1xyXG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvc291bmRjbG91ZC9yZXNvbHZlJywgZGF0YSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZXREb3dubG9hZExpc3QoKSB7XHJcblx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2RhdGFiYXNlL2Rvd25sb2FkdXJsJyk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZXREb3dubG9hZEdhdGV3YXkoZGF0YSkge1xyXG5cdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS9kYXRhYmFzZS9kb3dubG9hZHVybC8nICsgZGF0YS5pZCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkZWxldGVEb3dubG9hZEdhdGV3YXkoZGF0YSkge1xyXG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvZG93bmxvYWR1cmwvZGVsZXRlJywgZGF0YSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzYXZlUHJvZmlsZUluZm8oZGF0YSkge1xyXG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvcHJvZmlsZS9lZGl0JywgZGF0YSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzYXZlU291bmRDbG91ZEFjY291bnRJbmZvKGRhdGEpIHtcclxuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL3Byb2ZpbGUvc291bmRjbG91ZCcsIGRhdGEpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2V0VHJhY2tMaXN0RnJvbVNvdW5kY2xvdWQoZGF0YSkge1xyXG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvdHJhY2tzL2xpc3QnLCBkYXRhKTtcclxuXHR9XHJcblxyXG5cdHJldHVybiB7XHJcblx0XHRyZXNvbHZlRGF0YTogcmVzb2x2ZURhdGEsXHJcblx0XHRnZXREb3dubG9hZExpc3Q6IGdldERvd25sb2FkTGlzdCxcclxuXHRcdGdldERvd25sb2FkR2F0ZXdheTogZ2V0RG93bmxvYWRHYXRld2F5LFxyXG5cdFx0c2F2ZVByb2ZpbGVJbmZvOiBzYXZlUHJvZmlsZUluZm8sXHJcblx0XHRkZWxldGVEb3dubG9hZEdhdGV3YXk6IGRlbGV0ZURvd25sb2FkR2F0ZXdheSxcclxuXHRcdHNhdmVTb3VuZENsb3VkQWNjb3VudEluZm86IHNhdmVTb3VuZENsb3VkQWNjb3VudEluZm8sXHJcblx0XHRnZXRUcmFja0xpc3RGcm9tU291bmRjbG91ZDogZ2V0VHJhY2tMaXN0RnJvbVNvdW5kY2xvdWRcclxuXHR9O1xyXG59XSk7XHJcbiIsIlxyXG5cclxuYXBwLnNlcnZpY2UoJ0hvbWVTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKXtcclxuXHRcclxuXHRmdW5jdGlvbiBzYXZlQXBwbGljYXRpb24oZGF0YSkge1xyXG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvaG9tZS9hcHBsaWNhdGlvbicsIGRhdGEpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2F2ZUFydGlzdEVtYWlsKGRhdGEpIHtcclxuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2hvbWUvYXJ0aXN0ZW1haWwnLCBkYXRhKTtcclxuXHR9XHJcblxyXG5cdHJldHVybiB7XHJcblx0XHRzYXZlQXBwbGljYXRpb246IHNhdmVBcHBsaWNhdGlvbixcclxuXHRcdHNhdmVBcnRpc3RFbWFpbDogc2F2ZUFydGlzdEVtYWlsXHJcblx0fTtcclxufV0pO1xyXG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XHJcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3ByZW1pZXJlJywge1xyXG4gICAgdXJsOiAnL3ByZW1pZXJlJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvcHJlbWllcmUvdmlld3MvcHJlbWllcmUuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnUHJlbWllckNvbnRyb2xsZXInXHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ1ByZW1pZXJDb250cm9sbGVyJywgWyckcm9vdFNjb3BlJyxcclxuICAnJHN0YXRlJyxcclxuICAnJHNjb3BlJyxcclxuICAnJGh0dHAnLFxyXG4gICckbG9jYXRpb24nLFxyXG4gICckd2luZG93JyxcclxuICAnUHJlbWllclNlcnZpY2UnLFxyXG4gIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uLCAkd2luZG93LCBQcmVtaWVyU2VydmljZSkge1xyXG5cclxuICAgICRzY29wZS5nZW5yZUFycmF5ID0gW1xyXG4gICAgICAnQWx0ZXJuYXRpdmUgUm9jaycsXHJcbiAgICAgICdBbWJpZW50JyxcclxuICAgICAgJ0NyZWF0aXZlJyxcclxuICAgICAgJ0NoaWxsJyxcclxuICAgICAgJ0NsYXNzaWNhbCcsXHJcbiAgICAgICdDb3VudHJ5JyxcclxuICAgICAgJ0RhbmNlICYgRURNJyxcclxuICAgICAgJ0RhbmNlaGFsbCcsXHJcbiAgICAgICdEZWVwIEhvdXNlJyxcclxuICAgICAgJ0Rpc2NvJyxcclxuICAgICAgJ0RydW0gJiBCYXNzJyxcclxuICAgICAgJ0R1YnN0ZXAnLFxyXG4gICAgICAnRWxlY3Ryb25pYycsXHJcbiAgICAgICdGZXN0aXZhbCcsXHJcbiAgICAgICdGb2xrJyxcclxuICAgICAgJ0hpcC1Ib3AvUk5CJyxcclxuICAgICAgJ0hvdXNlJyxcclxuICAgICAgJ0luZGllL0FsdGVybmF0aXZlJyxcclxuICAgICAgJ0xhdGluJyxcclxuICAgICAgJ1RyYXAnLFxyXG4gICAgICAnVm9jYWxpc3RzL1Npbmdlci1Tb25nd3JpdGVyJ1xyXG4gICAgXTtcclxuXHJcbiAgICAkc2NvcGUucHJlbWllck9iaiA9IHt9O1xyXG4gICAgJHNjb3BlLm1lc3NhZ2UgPSB7XHJcbiAgICAgIHZhbDogJycsXHJcbiAgICAgIHZpc2libGU6IGZhbHNlXHJcbiAgICB9O1xyXG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuXHJcbiAgICAkc2NvcGUuc2F2ZVByZW1pZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAkc2NvcGUubWVzc2FnZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIHZhciBkYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICAgIGZvciAodmFyIHByb3AgaW4gJHNjb3BlLnByZW1pZXJPYmopIHtcclxuICAgICAgICBkYXRhLmFwcGVuZChwcm9wLCAkc2NvcGUucHJlbWllck9ialtwcm9wXSk7XHJcbiAgICAgIH1cclxuICAgICAgUHJlbWllclNlcnZpY2VcclxuICAgICAgICAuc2F2ZVByZW1pZXIoZGF0YSlcclxuICAgICAgICAudGhlbihyZWNlaXZlUmVzcG9uc2UpXHJcbiAgICAgICAgLmNhdGNoKGNhdGNoRXJyb3IpO1xyXG5cclxuICAgICAgZnVuY3Rpb24gcmVjZWl2ZVJlc3BvbnNlKHJlcykge1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKHJlcy5zdGF0dXMgPT09IDIwMCkge1xyXG4gICAgICAgICAgJHNjb3BlLm1lc3NhZ2UudmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgICAkc2NvcGUubWVzc2FnZS52YWwgPSAnVGhhbmsgeW91ISBZb3VyIG1lc3NhZ2UgaGFzIGJlZW4gc2VudCBzdWNjZXNzZnVsbHkuJztcclxuICAgICAgICAgICRzY29wZS5wcmVtaWVyT2JqID0ge307XHJcbiAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoXCJpbnB1dFt0eXBlPSdmaWxlJ11cIikudmFsKG51bGwpO1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkc2NvcGUubWVzc2FnZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAkc2NvcGUubWVzc2FnZS52YWwgPSAnRXJyb3IgaW4gcHJvY2Vzc2luZyB0aGUgcmVxdWVzdC4gUGxlYXNlIHRyeSBhZ2Fpbi4nO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBjYXRjaEVycm9yKHJlcykge1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKHJlcy5zdGF0dXMgPT09IDQwMCkge1xyXG4gICAgICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XHJcbiAgICAgICAgICAgIHZpc2libGU6IHRydWUsXHJcbiAgICAgICAgICAgIHZhbDogcmVzLmRhdGFcclxuICAgICAgICAgIH07XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgICRzY29wZS5tZXNzYWdlID0ge1xyXG4gICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcclxuICAgICAgICAgIHZhbDogJ0Vycm9yIGluIHByb2Nlc3NpbmcgdGhlIHJlcXVlc3QuIFBsZWFzZSB0cnkgYWdhaW4uJ1xyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5dKTsiLCJhcHAuc2VydmljZSgnUHJlbWllclNlcnZpY2UnLCBbJyRodHRwJywgZnVuY3Rpb24oJGh0dHApIHtcclxuXHJcblx0ZnVuY3Rpb24gc2F2ZVByZW1pZXIoZGF0YSkge1xyXG5cdFx0cmV0dXJuICRodHRwKHtcclxuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXHJcblx0XHRcdHVybDogJy9hcGkvcHJlbWllcicsXHJcblx0XHRcdGhlYWRlcnM6IHtcclxuXHRcdFx0XHQnQ29udGVudC1UeXBlJzogdW5kZWZpbmVkXHJcblx0XHRcdH0sXHJcblx0XHRcdHRyYW5zZm9ybVJlcXVlc3Q6IGFuZ3VsYXIuaWRlbnRpdHksXHJcblx0XHRcdGRhdGE6IGRhdGFcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdHNhdmVQcmVtaWVyOiBzYXZlUHJlbWllclxyXG5cdH07XHJcbn1dKTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XHJcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3N1Ym1pc3Npb25zJywge1xyXG4gICAgdXJsOiAnL3N1Ym1pc3Npb25zJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvc3VibWlzc2lvbnMvdmlld3Mvc3VibWlzc2lvbnMuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnU3VibWlzc2lvbkNvbnRyb2xsZXInXHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuXHJcbmFwcC5jb250cm9sbGVyKCdTdWJtaXNzaW9uQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgQXV0aFNlcnZpY2UsIG9FbWJlZEZhY3RvcnkpIHtcclxuICAkc2NvcGUuY291bnRlciA9IDA7XHJcbiAgJHNjb3BlLnNob3dpbmdFbGVtZW50cyA9IFtdO1xyXG4gICRzY29wZS5zdWJtaXNzaW9ucyA9IFtdO1xyXG4gICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICRodHRwLmdldCgnL2FwaS9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4nO1xyXG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIGFsZXJ0KCdXcm9uZyBQYXNzd29yZCcpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUubG9hZFN1Ym1pc3Npb25zID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAkaHR0cC5nZXQoJy9hcGkvc3VibWlzc2lvbnMvdW5hY2NlcHRlZCcpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICRzY29wZS5zdWJtaXNzaW9ucyA9IHJlcy5kYXRhO1xyXG4gICAgICAgIGNvbnNvbGUubG9nKHJlcy5kYXRhKTtcclxuICAgICAgICAkc2NvcGUubG9hZE1vcmUoKTtcclxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2NoYW5uZWxzJyk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICRzY29wZS5jaGFubmVscyA9IHJlcy5kYXRhO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgYWxlcnQoJ0Vycm9yOiBDb3VsZCBub3QgZ2V0IGNoYW5uZWxzLicpXHJcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUubG9hZE1vcmUgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBsb2FkRWxlbWVudHMgPSBbXTtcclxuICAgIGZvciAobGV0IGkgPSAkc2NvcGUuY291bnRlcjsgaSA8ICRzY29wZS5jb3VudGVyICsgMTU7IGkrKykge1xyXG4gICAgICB2YXIgc3ViID0gJHNjb3BlLnN1Ym1pc3Npb25zW2ldO1xyXG4gICAgICBpZiAoc3ViKSB7XHJcbiAgICAgICAgJHNjb3BlLnNob3dpbmdFbGVtZW50cy5wdXNoKHN1Yik7XHJcbiAgICAgICAgbG9hZEVsZW1lbnRzLnB1c2goc3ViKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgY29uc29sZS5sb2cobG9hZEVsZW1lbnRzKTtcclxuICAgICAgbG9hZEVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oc3ViKSB7XHJcbiAgICAgICAgb0VtYmVkRmFjdG9yeS5lbWJlZFNvbmcoc3ViKTtcclxuICAgICAgfSwgNTApXHJcbiAgICB9KTtcclxuICAgICRzY29wZS5jb3VudGVyICs9IDE1O1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmNoYW5nZUJveCA9IGZ1bmN0aW9uKHN1YiwgY2hhbikge1xyXG4gICAgdmFyIGluZGV4ID0gc3ViLmNoYW5uZWxJRFMuaW5kZXhPZihjaGFuLmNoYW5uZWxJRCk7XHJcbiAgICBpZiAoaW5kZXggPT0gLTEpIHtcclxuICAgICAgc3ViLmNoYW5uZWxJRFMucHVzaChjaGFuLmNoYW5uZWxJRCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzdWIuY2hhbm5lbElEUy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgJHNjb3BlLnNhdmUgPSBmdW5jdGlvbihzdWJtaSkge1xyXG4gICAgaWYgKHN1Ym1pLmNoYW5uZWxJRFMubGVuZ3RoID09IDApIHtcclxuICAgICAgJHNjb3BlLmRlY2xpbmUoc3VibWkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc3VibWkucGFzc3dvcmQgPSAkcm9vdFNjb3BlLnBhc3N3b3JkO1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICRodHRwLnB1dChcIi9hcGkvc3VibWlzc2lvbnMvc2F2ZVwiLCBzdWJtaSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbihzdWIpIHtcclxuICAgICAgICAgICRzY29wZS5zaG93aW5nRWxlbWVudHMuc3BsaWNlKCRzY29wZS5zaG93aW5nRWxlbWVudHMuaW5kZXhPZihzdWJtaSksIDEpO1xyXG4gICAgICAgICAgd2luZG93LmFsZXJ0KFwiU2F2ZWRcIik7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgd2luZG93LmFsZXJ0KFwiRVJST1I6IGRpZCBub3QgU2F2ZVwiKVxyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuaWdub3JlID0gZnVuY3Rpb24oc3VibWlzc2lvbikge1xyXG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgJGh0dHAuZGVsZXRlKCcvYXBpL3N1Ym1pc3Npb25zL2lnbm9yZS8nICsgc3VibWlzc2lvbi5faWQgKyAnLycgKyAkcm9vdFNjb3BlLnBhc3N3b3JkKVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICB2YXIgaW5kZXggPSAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLmluZGV4T2Yoc3VibWlzc2lvbik7XHJcbiAgICAgICAgJHNjb3BlLnNob3dpbmdFbGVtZW50cy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIHdpbmRvdy5hbGVydChcIklnbm9yZWRcIik7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICB3aW5kb3cuYWxlcnQoXCJFUlJPUjogZGlkIG5vdCBJZ25vcmVcIik7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmRlY2xpbmUgPSBmdW5jdGlvbihzdWJtaXNzaW9uKSB7XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAkaHR0cC5kZWxldGUoJy9hcGkvc3VibWlzc2lvbnMvZGVjbGluZS8nICsgc3VibWlzc2lvbi5faWQgKyAnLycgKyAkcm9vdFNjb3BlLnBhc3N3b3JkKVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICB2YXIgaW5kZXggPSAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLmluZGV4T2Yoc3VibWlzc2lvbik7XHJcbiAgICAgICAgJHNjb3BlLnNob3dpbmdFbGVtZW50cy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIHdpbmRvdy5hbGVydChcIkRlY2xpbmVkXCIpO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2VcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICB3aW5kb3cuYWxlcnQoXCJFUlJPUjogZGlkIG5vdCBEZWNsaW5lXCIpO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gICRzY29wZS55b3V0dWJlID0gZnVuY3Rpb24oc3VibWlzc2lvbikge1xyXG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgJGh0dHAucG9zdCgnL2FwaS9zdWJtaXNzaW9ucy95b3V0dWJlSW5xdWlyeScsIHN1Ym1pc3Npb24pXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgd2luZG93LmFsZXJ0KCdTZW50IHRvIFphY2gnKTtcclxuICAgICAgfSlcclxuICB9XHJcblxyXG4gICRzY29wZS5zZW5kTW9yZSA9IGZ1bmN0aW9uKHN1Ym1pc3Npb24pIHtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICRodHRwLnBvc3QoJy9hcGkvc3VibWlzc2lvbnMvc2VuZE1vcmVJbnF1aXJ5Jywgc3VibWlzc2lvbilcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICB3aW5kb3cuYWxlcnQoJ1NlbnQgRW1haWwnKTtcclxuICAgICAgfSlcclxuICB9XHJcbn0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
