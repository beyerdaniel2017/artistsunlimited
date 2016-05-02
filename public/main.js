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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImRhdGFiYXNlL2RhdGFiYXNlLmpzIiwiZnNhL2ZzYS1wcmUtYnVpbHQuanMiLCJsb2dpbi9sb2dpbi5qcyIsImxvZ2luL29FbWJlZEZhY3RvcnkuanMiLCJwYXkvcGF5LmpzIiwicGF5L3RoYW5reW91LmpzIiwic2NoZWR1bGVyL3NjaGVkdWxlci5qcyIsInN1Ym1pdC9zdWJtaXQuanMiLCJhdXRoL2NvbnRyb2xsZXJzL2F1dGhDb250cm9sbGVyLmpzIiwiYXV0aC9zZXJ2aWNlcy9hdXRoU2VydmljZS5qcyIsImF1dGgvc2VydmljZXMvc2Vzc2lvblNlcnZpY2UuanMiLCJhcnRpc3RUb29scy9TQ1Jlc29sdmUvU0NSZXNvbHZlLmpzIiwiYXJ0aXN0VG9vbHMvcmVGb3JSZS9yZUZvclJlSW50ZXJhY3Rpb24uanMiLCJkYXRhYmFzZS9hdXRvRW1haWxzL2F1dG9FbWFpbHMuanMiLCJkYXRhYmFzZS9hdXRvRW1haWxzL2F1dG9FbWFpbHNMaXN0LmpzIiwiZG93bmxvYWRUcmFjay9jb250cm9sbGVycy9hZG1pbkRMR2F0ZS5qcyIsImRvd25sb2FkVHJhY2svY29udHJvbGxlcnMvZG93bmxvYWRUcmFja0NvbnRyb2xsZXIuanMiLCJkb3dubG9hZFRyYWNrL3NlcnZpY2VzL2FkbWluRExHYXRlU2VydmljZS5qcyIsImRvd25sb2FkVHJhY2svc2VydmljZXMvZG93bmxvYWRUcmFja1NlcnZpY2UuanMiLCJwcmVtaWVyZS9jb250cm9sbGVycy9wcmVtaWVyZUNvbnRyb2xsZXIuanMiLCJwcmVtaWVyZS9zZXJ2aWNlcy9wcmVtaWVyZVNlcnZpY2UuanMiLCJzdWJtaXNzaW9ucy9jb250cm9sbGVycy9zdWJtaXNzaW9uQ29udHJvbGxlci5qcyIsImhvbWUvY29udHJvbGxlcnMvYXJ0aXN0VG9vbHNDb250cm9sbGVyLmpzIiwiaG9tZS9jb250cm9sbGVycy9hcnRpc3RUb29sc0Rvd25sb2FkR2F0d2F5LmpzIiwiaG9tZS9jb250cm9sbGVycy9hcnRpc3RUb29sc1ByZXZpZXdDb250cm9sbGVyLmpzIiwiaG9tZS9jb250cm9sbGVycy9ob21lQ29udHJvbGxlci5qcyIsImhvbWUvc2VydmljZXMvYXJ0aXN0c1Rvb2xzU2VydmljZS5qcyIsImhvbWUvc2VydmljZXMvaG9tZVNlcnZpY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBQSxDQUFBO0FBQ0EsTUFBQSxDQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLHVCQUFBLEVBQUEsQ0FBQSxhQUFBLEVBQUEsV0FBQSxFQUFBLGNBQUEsRUFBQSxXQUFBLEVBQUEsV0FBQSxFQUFBLHdCQUFBLENBQUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxrQkFBQSxFQUFBLGlCQUFBLEVBQUEscUJBQUEsRUFBQTs7QUFFQSxtQkFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTs7QUFFQSxvQkFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTs7Q0FFQSxDQUFBLENBQUE7OztBQUdBLEdBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxVQUFBLEVBQUEsV0FBQSxFQUFBLE1BQUEsRUFBQSxhQUFBLEVBQUEsY0FBQSxFQUFBLFNBQUEsRUFBQTs7Ozs7O0FBTUEsV0FBQSxDQUFBLFdBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTs7QUFFQSxhQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTs7R0FFQSxDQUFBLENBQUE7Ozs7QUFJQSxZQUFBLENBQUEsR0FBQSxDQUFBLG1CQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLFFBQUEsRUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7R0FnQ0EsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUdBLEdBQUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxFQUFBLENBQUEsWUFBQTtBQUNBLFNBQUE7QUFDQSxTQUFBLEVBQUE7QUFDQSxjQUFBLEVBQUEsR0FBQTtBQUNBLGFBQUEsRUFBQSxHQUFBO0tBQ0E7QUFDQSxRQUFBLEVBQUEsY0FBQSxLQUFBLEVBQUEsT0FBQSxFQUFBLFVBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLFVBQUEsV0FBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLE1BQUEsQ0FBQSxZQUFBO0FBQ0EsZUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLG1CQUFBLEVBQUEsS0FBQTtBQUNBLGVBQUEsRUFBQSxFQUFBO1dBQ0EsQ0FBQTs7QUFFQSxjQUFBLFdBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxZQUFBLElBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxJQUFBLFdBQUEsRUFBQTtBQUNBLGlCQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EscUJBQUEsRUFBQSxJQUFBO0FBQ0EsaUJBQUEsRUFBQSx1Q0FBQTthQUNBLENBQUE7QUFDQSxtQkFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLG1CQUFBO1dBQ0E7O0FBRUEsY0FBQSxXQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLEdBQUEsRUFBQSxHQUFBLElBQUEsR0FBQSxJQUFBLEVBQUE7QUFDQSxpQkFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLHFCQUFBLEVBQUEsSUFBQTtBQUNBLGlCQUFBLEVBQUEsNENBQUE7YUFDQSxDQUFBO0FBQ0EsbUJBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxtQkFBQTtXQUNBO0FBQ0EsZUFBQSxDQUFBLFFBQUEsR0FBQSxXQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQSxDQUFBOztBQ25HQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLGlCQUFBO0FBQ0EsZUFBQSxFQUFBLDJCQUFBO0FBQ0EsY0FBQSxFQUFBLG9CQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxTQUFBLENBQUEsaUJBQUEsRUFBQSxDQUFBLFFBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLFNBQUE7QUFDQSxZQUFBLEVBQUEsSUFBQTtBQUNBLFNBQUEsRUFBQSxJQUFBO0FBQ0EsWUFBQSxFQUFBLDhEQUFBLEdBQ0EsbUhBQUEsR0FDQSxRQUFBO0FBQ0EsUUFBQSxFQUFBLGNBQUEsTUFBQSxFQUFBLElBQUEsRUFBQSxNQUFBLEVBQUEsVUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEVBQUEsQ0FBQSxjQUFBLEVBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxZQUFBLFVBQUEsR0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsR0FBQSxVQUFBLENBQUE7QUFDQSxZQUFBLFVBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQTtTQUNBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxvQkFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUE7QUFDQSxRQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxLQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFdBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsU0FBQSxHQUFBLENBQUE7QUFDQSxRQUFBLEVBQUEsVUFBQTtBQUNBLFNBQUEsRUFBQSxVQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxPQUFBO0FBQ0EsU0FBQSxFQUFBLE9BQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLE1BQUE7QUFDQSxTQUFBLEVBQUEsTUFBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsS0FBQTtBQUNBLFNBQUEsRUFBQSxPQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxPQUFBO0FBQ0EsU0FBQSxFQUFBLE9BQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLGFBQUE7QUFDQSxTQUFBLEVBQUEsYUFBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsV0FBQTtBQUNBLFNBQUEsRUFBQSxXQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxrQkFBQTtBQUNBLFNBQUEsRUFBQSxXQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxVQUFBO0FBQ0EsU0FBQSxFQUFBLGFBQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLFdBQUE7QUFDQSxTQUFBLEVBQUEsY0FBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsU0FBQTtBQUNBLFNBQUEsRUFBQSxZQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxTQUFBO0FBQ0EsU0FBQSxFQUFBLFlBQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLFVBQUE7QUFDQSxTQUFBLEVBQUEsVUFBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsZ0JBQUE7QUFDQSxTQUFBLEVBQUEsYUFBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsWUFBQTtBQUNBLFNBQUEsRUFBQSxXQUFBO0dBQ0EsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLHFCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLEtBQUEsR0FBQTtBQUNBLFlBQUEsRUFBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLEVBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsR0FBQSxHQUFBO0FBQ0EsUUFBQSxFQUFBLFNBQUE7QUFDQSxTQUFBLEVBQUEsQ0FBQTtBQUNBLFdBQUEsRUFBQSxLQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUE7QUFDQSxpQkFBQSxFQUFBLEVBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUE7S0FDQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSx1QkFBQSxFQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsZ0ZBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsR0FBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUE7S0FDQSxDQUFBLFNBQ0EsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGtCQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLElBQUEsU0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLE1BQUEsR0FBQSxJQUFBLENBQUE7S0FDQSxNQUFBLElBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLElBQUEsYUFBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLE1BQUEsR0FBQSxLQUFBLENBQUE7S0FDQTtBQUNBLFFBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLFNBQUEsR0FBQSxPQUFBLENBQUE7S0FDQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLFNBQUEsR0FBQSxPQUFBLENBQUE7S0FDQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUEsS0FBQSxDQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLFNBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxPQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxlQUFBLEdBQUEsQ0FBQSxLQUFBLEtBQUEsSUFBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGVBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0FBQ0EsUUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLGVBQUEsRUFBQSxLQUFBLENBQUEsZUFBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsZUFBQSxDQUFBO0FBQ0EsUUFBQSxJQUFBLEdBQUE7QUFDQSxXQUFBLEVBQUEsS0FBQTtBQUNBLGNBQUEsRUFBQSxVQUFBLENBQUEsUUFBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsRUFBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEscUJBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsb0JBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxLQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsV0FBQSxDQUFBLFdBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLEdBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsU0FBQSxHQUFBLE9BQUEsQ0FBQTtLQUNBO0FBQ0EsUUFBQSxNQUFBLENBQUEsV0FBQSxDQUFBLFdBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLEdBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsU0FBQSxHQUFBLE9BQUEsQ0FBQTtLQUNBO0FBQ0EsUUFBQSxNQUFBLENBQUEsV0FBQSxDQUFBLEtBQUEsRUFBQSxLQUFBLENBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxJQUFBLEdBQUE7QUFDQSxXQUFBLEVBQUEsS0FBQTtBQUNBLGNBQUEsRUFBQSxVQUFBLENBQUEsUUFBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsNEJBQUEsRUFBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsY0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsMkJBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsUUFBQSxFQUFBO0FBQ0EsUUFBQSxNQUFBLEdBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLEVBQUEsUUFBQTtBQUNBLGNBQUEsRUFBQSxRQUFBO0tBQ0EsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLHFCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLDJCQUFBLEdBQUEsS0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEscUJBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLDBCQUFBLEVBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUE7QUFDQSxxQkFBQSxFQUFBLEVBQUE7T0FDQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLGlDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsNEJBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOzs7QUFHQSxRQUFBLENBQUEsRUFBQSxDQUFBLGNBQUEsRUFBQSxVQUFBLElBQUEsRUFBQTtBQUNBLFFBQUEsVUFBQSxHQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxHQUFBLFVBQUEsQ0FBQTtBQUNBLFFBQUEsVUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDL05BLENBQUEsWUFBQTs7QUFFQSxjQUFBLENBQUE7O0FBRUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsTUFBQSxJQUFBLEtBQUEsQ0FBQSx3QkFBQSxDQUFBLENBQUE7O0FBRUEsTUFBQSxHQUFBLEdBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxhQUFBLEVBQUEsRUFBQSxDQUFBLENBQUE7O0FBRUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxZQUFBLEVBQUEsWUFBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxFQUFBLE1BQUEsSUFBQSxLQUFBLENBQUEsc0JBQUEsQ0FBQSxDQUFBO0FBQ0EsV0FBQSxNQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7R0FDQSxDQUFBLENBQUE7O0FBRUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsVUFBQSxFQUFBO0FBQ0EsV0FBQTtBQUNBLFFBQUEsRUFBQSxZQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEVBQUEsQ0FBQSxTQUFBLEVBQUEsWUFBQTtBQUNBLGNBQUEsSUFBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLG9CQUFBLENBQUEsTUFBQSxDQUFBLFlBQUE7QUFDQSxvQkFBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7V0FDQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7T0FDQTtBQUNBLFVBQUEsRUFBQSxjQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUEsUUFBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxFQUFBLElBQUEsRUFBQSxZQUFBO0FBQ0EsY0FBQSxJQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0Esb0JBQUEsQ0FBQSxNQUFBLENBQUEsWUFBQTtBQUNBLGdCQUFBLFFBQUEsRUFBQTtBQUNBLHNCQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTthQUNBO1dBQ0EsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0E7S0FDQSxDQUFBO0dBQ0EsQ0FBQSxDQUFBOztBQUVBLEtBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxFQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsUUFBQSxhQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLGFBQUEsV0FBQSxHQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGtDQUFBLENBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsU0FBQSxDQUFBLElBQUEsRUFBQTtBQUNBLG1CQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsSUFBQSxDQUFBLFFBQUE7QUFDQSxvQkFBQSxFQUFBLElBQUEsQ0FBQSxXQUFBO0FBQ0EsYUFBQSxFQUFBLGNBQUE7T0FDQSxDQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLFNBQUEsR0FBQTtBQUNBLGFBQUEsYUFBQSxDQUFBO0tBQ0E7O0FBRUEsV0FBQTtBQUNBLGlCQUFBLEVBQUEsV0FBQTtBQUNBLGVBQUEsRUFBQSxTQUFBO0FBQ0EsZUFBQSxFQUFBLFNBQUE7S0FDQSxDQUFBO0dBQ0EsQ0FBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F5SEEsQ0FBQSxFQUFBLENBQUE7QUN0TEEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxRQUFBO0FBQ0EsZUFBQSxFQUFBLHFCQUFBO0FBQ0EsY0FBQSxFQUFBLHNCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUdBLEdBQUEsQ0FBQSxVQUFBLENBQUEsc0JBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxXQUFBLEVBQUEsYUFBQSxFQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsZUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxLQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBLEVBQUE7QUFDQSxjQUFBLEVBQUEsTUFBQSxDQUFBLFFBQUE7S0FDQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxnQkFBQSxDQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBO0tBQ0EsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLFdBQUEsR0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLDBCQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsR0FBQSxDQUFBLFdBQUE7QUFDQSxnQkFBQSxFQUFBLFVBQUEsQ0FBQSxRQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxhQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsYUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxFQUFBLENBQUEsV0FBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSx5QkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUM5REEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxlQUFBLEVBQUEsWUFBQTtBQUNBLFNBQUE7QUFDQSxhQUFBLEVBQUEsbUJBQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLENBQUEsTUFBQSxDQUFBLG1DQUFBLEdBQUEsR0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxRQUFBLENBQUEsY0FBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLEdBQUEsUUFBQSxDQUFBO0FBQ0EsaUJBQUEsRUFBQSxLQUFBO0FBQ0EsaUJBQUEsRUFBQSxHQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDVkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxvQkFBQTtBQUNBLGVBQUEsRUFBQSxpQkFBQTtBQUNBLGNBQUEsRUFBQSxlQUFBO0FBQ0EsV0FBQSxFQUFBO0FBQ0EsY0FBQSxFQUFBLGtCQUFBLEtBQUEsRUFBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxlQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxpQkFBQSxHQUFBLENBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0E7QUFDQSxnQkFBQSxFQUFBLG9CQUFBLEtBQUEsRUFBQSxZQUFBLEVBQUE7QUFDQSxlQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsMEJBQUEsR0FBQSxZQUFBLENBQUEsWUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBO0FBQ0EsV0FBQSxFQUFBLGVBQUEsVUFBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsR0FBQSxVQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsaUJBQUEsS0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0E7S0FDQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsTUFBQSxDQUFBLG1CQUFBLEVBQUEsWUFDQTtBQUNBLFNBQUEsVUFBQSxLQUFBLEVBQ0E7QUFDQSxXQUFBLFVBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGVBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxVQUFBLEVBQUEsS0FBQSxFQUFBLFFBQUEsRUFBQSxVQUFBLEVBQUEsS0FBQSxFQUFBLE1BQUEsRUFBQSxTQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLFVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsTUFBQSxVQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsS0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLElBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxRQUFBLENBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBLGFBQUEsRUFBQSxLQUFBO0FBQ0EsYUFBQSxFQUFBLEdBQUE7R0FDQSxDQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLEVBQUEsRUFBQTtBQUNBLFdBQUEsVUFBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxZQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLHFCQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsR0FBQSxLQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGdCQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFFBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsZ0JBQUEsQ0FBQSxFQUFBLENBQUEsV0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBO0dBQ0EsQ0FBQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0Esa0JBQUEsRUFBQSxVQUFBLENBQUEsVUFBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsWUFBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLFNBQUEsSUFBQSxHQUFBLElBQUEsTUFBQSxDQUFBLGdCQUFBLEVBQUE7QUFDQSxVQUFBLE1BQUEsQ0FBQSxnQkFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsWUFBQSxJQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxpQkFBQSxFQUFBLENBQUEsV0FBQSxJQUFBLEdBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtPQUNBO0tBQ0E7QUFDQSxRQUFBLE1BQUEsQ0FBQSxRQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsSUFBQSxDQUFBLEVBQUE7QUFDQSxVQUFBLE1BQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEscUJBQUEsR0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsbUJBQUEsRUFBQSxJQUFBO0FBQ0EscUJBQUEsRUFBQSxvQkFBQTtBQUNBLG9CQUFBLEVBQUEseUJBQUE7QUFDQSxlQUFBLEVBQUEsTUFBQTtTQUNBLENBQUEsQ0FBQTtPQUNBLE1BQUE7QUFDQSxjQUFBLENBQUEsV0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO09BQ0E7S0FDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFdBQUEsR0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLGVBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxxQkFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0tBQ0E7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUEsVUFBQSxHQUFBO0FBQ0EsY0FBQSxFQUFBLEVBQUE7QUFDQSxnQkFBQSxFQUFBLFVBQUE7QUFDQSxnQkFBQSxFQUFBLFVBQUEsQ0FBQSxVQUFBO0tBQ0EsQ0FBQTtBQUNBLFNBQUEsSUFBQSxHQUFBLElBQUEsTUFBQSxDQUFBLGdCQUFBLEVBQUE7QUFDQSxVQUFBLE1BQUEsQ0FBQSxnQkFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsWUFBQSxJQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxpQkFBQSxFQUFBLENBQUEsV0FBQSxJQUFBLEdBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7T0FDQTtLQUNBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSw2QkFBQSxFQUFBLFVBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBR0EsUUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLE9BQUEsRUFDQTtBQUNBLFdBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsT0FBQSxDQUFBLFNBQUEsRUFDQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsR0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBO0tBQ0EsTUFFQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLElBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQTtLQUNBOztBQUVBLFVBQUEsQ0FBQSxnQkFBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsZ0JBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxDQUFBLElBQUEsSUFBQSxHQUFBLEtBQUEsR0FBQSxJQUFBLENBQUE7O0FBRUEsV0FBQSxDQUFBLFNBQUEsR0FBQSxPQUFBLENBQUEsU0FBQSxHQUFBLEtBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSx5QkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLEVBRUEsQ0FBQSxDQUFBO0FDNUlBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsV0FBQTtBQUNBLGVBQUEsRUFBQSxzQkFBQTtBQUNBLGNBQUEsRUFBQSxvQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLG9CQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUEsTUFBQSxFQUFBLFNBQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxtQ0FBQSxFQUFBLFNBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLEVBQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxTQUFBLENBQUEsNENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDdEJBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsWUFBQTtBQUNBLGVBQUEsRUFBQSw2QkFBQTtBQUNBLGNBQUEsRUFBQSxxQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFHQSxHQUFBLENBQUEsVUFBQSxDQUFBLHFCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsV0FBQSxFQUFBLE9BQUEsRUFBQTs7QUFFQSxRQUFBLENBQUEsWUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsTUFBQSxJQUFBLEdBQUEsVUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLE1BQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0dBQ0E7QUFDQSxRQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsV0FBQSxHQUFBLElBQUEsQ0FBQSxXQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFFBQUEsR0FBQSxjQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQSxDQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLElBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtHQUVBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQSxlQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxxQkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLE9BQUEsR0FBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQTtBQUNBLFFBQUEsS0FBQSxHQUFBLElBQUEsSUFBQSxFQUFBLENBQUE7QUFDQSxRQUFBLEtBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxLQUFBLENBQUEsUUFBQSxFQUFBLEdBQUEsSUFBQSxFQUFBLE9BQUE7QUFDQSxVQUFBLENBQUEsV0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsV0FBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFlBQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsU0FBQSxHQUFBLFdBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxTQUFBLElBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxPQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxhQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFNBQUEsR0FBQTtBQUNBLGlCQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBO0FBQ0EsV0FBQSxFQUFBLE9BQUE7QUFDQSxZQUFBLEVBQUEsS0FBQTtPQUNBLENBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQTtLQUNBLE1BQUE7QUFDQSxZQUFBLENBQUEsWUFBQSxHQUFBLG9DQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLG9DQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLEtBQUE7QUFDQSxpQkFBQSxFQUFBLEdBQUE7T0FDQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsWUFBQSxHQUFBLFNBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFNBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLHlCQUFBLEVBQUE7QUFDQSxTQUFBLEVBQUEsTUFBQSxDQUFBLFlBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsVUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxZQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLEtBQUE7QUFDQSxpQkFBQSxFQUFBLEdBQUE7T0FDQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxHQUFBLFFBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxXQUFBLFVBQUEsQ0FBQSxjQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLEdBQUEsR0FBQSxHQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLFdBQUEsR0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGlCQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtBQUNBLG1CQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsR0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSx3QkFBQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7S0FDQSxNQUFBO0FBQ0EsVUFBQSxXQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxlQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtBQUNBLGlCQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7QUFDQSxVQUFBLE1BQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxtQkFBQSxDQUFBLENBQUE7S0FDQSxNQUFBO0FBQ0EsVUFBQSxNQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFNBQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsYUFBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLEVBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxlQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsV0FBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsbUJBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLENBQUE7V0FDQSxDQUFBLENBQUE7QUFDQSxxQkFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLHNCQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBLE1BQUE7QUFDQSxjQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsRUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGVBQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxXQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxtQkFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsQ0FBQTtXQUNBLENBQUEsQ0FBQTtBQUNBLHFCQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7T0FDQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLFdBQUEsR0FBQSw4Q0FBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsS0FBQSxHQUFBLFlBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxpQ0FBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsS0FBQSxHQUFBLE1BQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsR0FBQSxNQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxHQUFBLGdCQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsSUFBQSxHQUFBLFNBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7Ozs7OztBQU1BLFFBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsT0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEVBQUEsT0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsWUFBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLHlCQUFBLEVBQUE7QUFDQSxTQUFBLEVBQUEsTUFBQSxDQUFBLFlBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxRQUFBLEtBQUEsSUFBQSxDQUFBLEVBQUEsT0FBQTtBQUNBLFFBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsUUFBQSxLQUFBLElBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsRUFBQSxPQUFBO0FBQ0EsUUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7R0FDQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLGNBQUEsQ0FBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLFdBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxDQUFBLG1DQUFBLEdBQUEsR0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLGlCQUFBLEVBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxHQUFBLFFBQUEsQ0FBQTtBQUNBLG1CQUFBLEVBQUEsS0FBQTtBQUNBLG1CQUFBLEVBQUEsR0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBLEVBQUEsRUFBQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxjQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsWUFBQTtBQUNBLFdBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxDQUFBLG1DQUFBLEdBQUEsTUFBQSxFQUFBO0FBQ0EsaUJBQUEsRUFBQSxRQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsR0FBQSxRQUFBLENBQUE7QUFDQSxtQkFBQSxFQUFBLEtBQUE7QUFDQSxtQkFBQSxFQUFBLEdBQUE7U0FDQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7S0FDQSxFQUFBLEVBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtBQUNBLE1BQUEsTUFBQSxDQUFBLE9BQUEsSUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxjQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtHQUNBO0FBQ0EsUUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBOztBQUVBLFNBQUEsY0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLE1BQUEsUUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLE1BQUEsS0FBQSxHQUFBLElBQUEsSUFBQSxFQUFBLENBQUE7QUFDQSxPQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBO0FBQ0EsUUFBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLElBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxHQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLEVBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxRQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxTQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7S0FDQTtBQUNBLGFBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsR0FBQSxFQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7R0FDQTtBQUNBLFNBQUEsUUFBQSxDQUFBO0NBQ0E7QUN2VEEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLFlBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxTQUFBO0FBQ0EsZUFBQSxFQUFBLDRCQUFBO0FBQ0EsY0FBQSxFQUFBLHNCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsc0JBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQTs7QUFFQSxRQUFBLENBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsRUFBQTtBQUNBLFNBQUEsRUFBQSxNQUFBLENBQUEsR0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxDQUFBLE9BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLFFBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBO0FBQ0EsaUJBQUEsRUFBQSxLQUFBO0FBQ0EsaUJBQUEsRUFBQSxHQUFBO09BQ0EsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEdBQUEsUUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxLQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSwyQkFBQSxDQUFBLENBQUE7S0FDQSxNQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUE7S0FDQSxNQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsSUFBQSxDQUFBLGtCQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxLQUFBO0FBQ0EsZUFBQSxFQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsT0FBQTtBQUNBLFlBQUEsRUFBQSxNQUFBLENBQUEsVUFBQSxDQUFBLElBQUE7QUFDQSxhQUFBLEVBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxLQUFBO0FBQ0EsZ0JBQUEsRUFBQSxNQUFBLENBQUEsVUFBQSxDQUFBLFFBQUE7QUFDQSxrQkFBQSxFQUFBLEVBQUE7QUFDQSxrQkFBQSxFQUFBLEVBQUE7T0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsZUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLHlEQUFBLENBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7T0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSwrQkFBQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNoRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQ0EsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxRQUFBO0FBQ0EsVUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxJQUFBO0tBQ0E7QUFDQSxlQUFBLEVBQUEsMEJBQUE7QUFDQSxjQUFBLEVBQUEsZ0JBQUE7R0FDQSxDQUFBLENBQ0EsS0FBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxTQUFBO0FBQ0EsZUFBQSxFQUFBLDJCQUFBO0FBQ0EsY0FBQSxFQUFBLGdCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsZ0JBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsWUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsU0FBQSxFQUFBLE9BQUEsRUFBQSxXQUFBLEVBQUEsY0FBQSxFQUFBLE1BQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLE9BQUEsRUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEtBQUE7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFNBQUEsR0FBQTtBQUNBLGlCQUFBLEVBQUEseUJBQUE7QUFDQSxZQUFBLENBQUEsYUFBQSxHQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUE7QUFDQSxtQkFBQSxFQUFBLHFCQUFBO0FBQ0Esa0JBQUEsRUFBQSxnQkFBQTtBQUNBLGFBQUEsRUFBQSxNQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLEtBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEtBQUE7S0FDQSxDQUFBO0FBQ0EsZUFBQSxDQUNBLEtBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLG1CQUFBLENBQUEsU0FDQSxDQUFBLGdCQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLG1CQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxHQUFBLENBQUEsTUFBQSxLQUFBLEdBQUEsSUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLHNCQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsRUFBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQTtPQUNBLE1BQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsYUFBQSxFQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQTtBQUNBLGlCQUFBLEVBQUEsSUFBQTtTQUNBLENBQUE7T0FDQTtLQUNBOztBQUVBLGFBQUEsZ0JBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsV0FBQSxFQUFBLGtDQUFBO0FBQ0EsZUFBQSxFQUFBLElBQUE7T0FDQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxpQkFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLFlBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7O0FBR0EsUUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEtBQUE7S0FDQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsSUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLGVBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxXQUFBLEVBQUEsK0NBQUE7QUFDQSxlQUFBLEVBQUEsSUFBQTtPQUNBLENBQUE7QUFDQSxhQUFBO0tBQ0E7QUFDQSxlQUFBLENBQ0EsTUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsb0JBQUEsQ0FBQSxTQUNBLENBQUEsaUJBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsb0JBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxpQkFBQSxDQUFBLEdBQUEsRUFBQSxFQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxXQUFBLEdBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLGFBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSw0QkFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEdBQUEsQ0FBQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxNQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0Esb0JBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsWUFBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxFQUFBLENBQUEsK0JBQUEsRUFBQTtBQUNBLHNCQUFBLEVBQUEsWUFBQSxDQUFBLFVBQUE7U0FDQSxDQUFBLENBQUE7QUFDQSxlQUFBO09BQ0E7QUFDQSxZQUFBLENBQUEsRUFBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSx5QkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUN4SEEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsV0FBQSxLQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEsTUFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxTQUFBO0FBQ0EsU0FBQSxFQUFBLEtBQUE7QUFDQSxVQUFBLEVBQUEsTUFBQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUEsQ0FBQTs7QUNaQSxHQUFBLENBQUEsT0FBQSxDQUFBLGdCQUFBLEVBQUEsQ0FBQSxVQUFBLEVBQUEsVUFBQSxRQUFBLEVBQUE7O0FBRUEsV0FBQSxNQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLFVBQUEsR0FBQTtBQUNBLFlBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLE9BQUEsR0FBQTtBQUNBLFdBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFNBQUE7QUFDQSxVQUFBLEVBQUEsTUFBQTtBQUNBLGNBQUEsRUFBQSxVQUFBO0FBQ0EsV0FBQSxFQUFBLE9BQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBLENBQUE7O0FDckJBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUNBLEtBQUEsQ0FBQSxXQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsWUFBQTtBQUNBLGVBQUEsRUFBQSx5Q0FBQTtBQUNBLGNBQUEsRUFBQSxxQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLHFCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBO0FBQ0EsUUFBQSxDQUFBLFFBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsT0FBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLHlCQUFBLEVBQUE7QUFDQSxTQUFBLEVBQUEsTUFBQSxDQUFBLEdBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsR0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsYUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLEVBQUEsSUFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ3ZCQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FDQSxLQUFBLENBQUEsb0JBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxpQ0FBQTtBQUNBLFVBQUEsRUFBQTtBQUNBLGdCQUFBLEVBQUEsSUFBQTtLQUNBO0FBQ0EsZUFBQSxFQUFBLGdEQUFBO0FBQ0EsY0FBQSxFQUFBLDhCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUdBLEdBQUEsQ0FBQSxVQUFBLENBQUEsOEJBQUEsRUFBQSxZQUFBLEVBRUEsQ0FBQSxDQUFBO0FDZkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLGVBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxnQ0FBQTtBQUNBLGVBQUEsRUFBQSx3Q0FBQTtBQUNBLGNBQUEsRUFBQSxzQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsZ0JBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSw2Q0FBQTtBQUNBLGVBQUEsRUFBQSx3Q0FBQTtBQUNBLGNBQUEsRUFBQSxzQkFBQTtHQW1CQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxzQkFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFlBQUEsRUFBQSxXQUFBLEVBQUE7QUFDQSxRQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQTs7QUFHQSxRQUFBLENBQUEsYUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLE1BQUEsWUFBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxhQUFBLEdBQUEsSUFBQSxDQUFBO0dBQ0E7OztBQUdBLFFBQUEsQ0FBQSxRQUFBLEdBQUE7QUFDQSxZQUFBLEVBQUEsS0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxZQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsR0FBQSxDQUFBLHNDQUFBLEdBQUEsWUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsUUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxRQUFBLEdBQUEsUUFBQSxDQUFBO1NBQ0EsTUFBQTtBQUNBLGdCQUFBLENBQUEsUUFBQSxHQUFBLEVBQUEsQ0FBQTtTQUNBO09BQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsOEJBQUEsQ0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0EsTUFBQTtBQUNBLGFBQUEsS0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOzs7QUFHQSxRQUFBLENBQUEsSUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsMkJBQUEsRUFBQSxNQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLHVCQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsZ0NBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7O0FBZ0JBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUE7S0FDQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7Q0FFQSxDQUFBLENBQUE7QUMxR0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLGdCQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsNEJBQUE7QUFDQSxlQUFBLEVBQUEsNENBQUE7QUFDQSxjQUFBLEVBQUEsMEJBQUE7QUFDQSxXQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsbUJBQUEsS0FBQSxFQUFBO0FBQ0EsZUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDBCQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsY0FBQSxRQUFBLEVBQUE7QUFDQSxtQkFBQSxRQUFBLENBQUE7V0FDQSxNQUFBO0FBQ0EsbUJBQUE7QUFDQSxxQkFBQSxFQUFBLGdCQUFBO2FBQ0EsQ0FBQTtXQUNBO1NBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxlQUFBLENBQUEsOEJBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0E7S0FDQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLDBCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsV0FBQSxFQUFBLFNBQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFNBQUEsR0FBQSxTQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBdUJBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSwwQkFBQSxFQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsY0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7OztBQWdCQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBO0tBQ0EsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDdkZBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEscUJBQUE7QUFDQSxlQUFBLEVBQUEseUNBQUE7QUFDQSxjQUFBLEVBQUEsdUJBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLGtCQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsMEJBQUE7QUFDQSxlQUFBLEVBQUEsOENBQUE7QUFDQSxjQUFBLEVBQUEsdUJBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLGtCQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEscUNBQUE7QUFDQSxlQUFBLEVBQUEseUNBQUE7QUFDQSxjQUFBLEVBQUEsdUJBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBR0EsR0FBQSxDQUFBLFVBQUEsQ0FBQSx1QkFBQSxFQUFBLENBQUEsWUFBQSxFQUNBLFFBQUEsRUFDQSxjQUFBLEVBQ0EsUUFBQSxFQUNBLE9BQUEsRUFDQSxXQUFBLEVBQ0EsU0FBQSxFQUNBLFdBQUEsRUFDQSxnQkFBQSxFQUNBLG9CQUFBLEVBQ0EsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsU0FBQSxFQUFBLGNBQUEsRUFBQSxrQkFBQSxFQUFBOztBQUVBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLGdCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLE9BQUEsRUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEtBQUE7R0FDQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLEtBQUEsR0FBQTtBQUNBLGtCQUFBLEVBQUEsYUFBQTtBQUNBLGNBQUEsRUFBQSxtQkFBQTtBQUNBLG1CQUFBLEVBQUEsOEJBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLFFBQUEsRUFBQSxLQUFBO0FBQ0EsV0FBQSxFQUFBLEtBQUE7QUFDQSxVQUFBLEVBQUEsS0FBQTtBQUNBLFdBQUEsRUFBQSxDQUFBO0FBQ0EsU0FBQSxFQUFBLEVBQUE7QUFDQSxZQUFBLEVBQUEsOEJBQUE7QUFDQSxjQUFBLEVBQUEsRUFBQTtBQUNBLFFBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxtQkFBQSxFQUFBLEtBQUE7S0FDQSxDQUFBO0FBQ0EsYUFBQSxFQUFBLENBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLFlBQUEsRUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEVBQUE7QUFDQSxRQUFBLEVBQUEsRUFBQTtLQUNBLENBQUE7R0FDQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLG1CQUFBLEdBQUEsRUFBQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLGFBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxTQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUEscUJBQUEsWUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGFBQUEsR0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsaUJBQUEsRUFBQSxJQUFBO0FBQ0EsbUJBQUEsRUFBQSxrQkFBQTtBQUNBLGtCQUFBLEVBQUEsdUJBQUE7QUFDQSxhQUFBLEVBQUEsTUFBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxhQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7R0FDQSxDQUFBOzs7QUFHQSxRQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTs7OztBQUlBLFdBQUEsb0JBQUEsR0FBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGdCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEtBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxLQUFBLEdBQUE7QUFDQSxvQkFBQSxFQUFBLGFBQUE7QUFDQSxnQkFBQSxFQUFBLG1CQUFBO0FBQ0EscUJBQUEsRUFBQSw4QkFBQTtBQUNBLGFBQUEsRUFBQSxFQUFBO0FBQ0EsVUFBQSxFQUFBLEtBQUE7QUFDQSxhQUFBLEVBQUEsS0FBQTtBQUNBLFlBQUEsRUFBQSxLQUFBO0FBQ0EsYUFBQSxFQUFBLENBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLGNBQUEsRUFBQSw4QkFBQTtBQUNBLGdCQUFBLEVBQUEsRUFBQTtBQUNBLFVBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxxQkFBQSxFQUFBLEtBQUE7T0FDQSxDQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLGNBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEVBQUE7QUFDQSxVQUFBLEVBQUEsRUFBQTtPQUNBLENBQUE7S0FDQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLE9BQUEsQ0FBQSxvQkFBQSxDQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7OztBQUdBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsWUFBQSxDQUFBLFNBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxrQkFBQSxDQUFBLFlBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTs7Ozs7O0tBTUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxjQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEtBQUEsRUFBQSxFQUFBO1VBV0EsNkJBQUEsR0FBQSxTQUFBLDZCQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsZUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEVBQUEsY0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxnQkFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsR0FBQSxlQUFBLENBQUEsQ0FBQTtPQUNBOztVQUVBLGlCQUFBLEdBQUEsU0FBQSxpQkFBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFNBQUEsRUFBQSxTQUFBLEVBQUEsVUFBQSxFQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsV0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUEsQ0FBQSxPQUFBO0FBQ0EsbUJBQUEsRUFBQSxJQUFBLENBQUEsR0FBQTthQUNBLENBQUEsQ0FBQTtXQUNBO1NBQ0EsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLGdCQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7T0FDQTs7VUFFQSxXQUFBLEdBQUEsU0FBQSxXQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsYUFBQSxDQUFBLDZCQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO09BQ0E7O0FBdkNBLFlBQUEsQ0FBQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esd0JBQUEsQ0FDQSxXQUFBLENBQUE7QUFDQSxXQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBO09BQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSw2QkFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLGlCQUFBLENBQUEsU0FDQSxDQUFBLFdBQUEsQ0FBQSxDQUFBO0tBZ0NBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsUUFBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxzQkFBQSxDQUNBLFdBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLE1BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxTQUNBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsbUJBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsWUFBQSxFQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLFFBQUEsRUFBQSxFQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxjQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxpQkFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxzQkFBQSxDQUNBLFdBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLE1BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUdBLFFBQUEsQ0FBQSxZQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLEVBQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQTtLQUNBOztBQUVBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsWUFBQSxFQUFBLDhCQUFBO0FBQ0EsY0FBQSxFQUFBLEVBQUE7QUFDQSxRQUFBLEVBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFlBQUE7OztBQUdBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEVBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFlBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFlBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxhQUFBLFdBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxVQUFBLFFBQUEsR0FBQSxRQUFBLENBQUEsYUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLFFBQUEsQ0FBQSxJQUFBLElBQUEsRUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtPQUNBO0FBQ0EsYUFBQSxRQUFBLENBQUE7S0FDQTs7QUFFQSxRQUFBLFFBQUEsR0FBQSxXQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsUUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLEdBQUEsS0FBQSxJQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxRQUFBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUE7S0FDQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxnQkFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUE7S0FDQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsUUFBQSxPQUFBLEdBQUEsSUFBQSxRQUFBLEVBQUEsQ0FBQTs7Ozs7QUFLQSxTQUFBLElBQUEsSUFBQSxJQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsRUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7S0FDQTs7OztBQUlBLFFBQUEsT0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQTtBQUNBLGFBQUEsSUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLEVBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBOzs7O0FBSUEsUUFBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsTUFBQSxDQUFBLFdBQUEsRUFBQSxJQUFBLENBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7Ozs7QUFJQSxRQUFBLE9BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsRUFBQSxJQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7Ozs7QUFJQSxRQUFBLE9BQUEsR0FBQTtBQUNBLFlBQUEsRUFBQSxNQUFBO0FBQ0EsU0FBQSxFQUFBLDJCQUFBO0FBQ0EsYUFBQSxFQUFBO0FBQ0Esc0JBQUEsRUFBQSxTQUFBO09BQ0E7QUFDQSxzQkFBQSxFQUFBLE9BQUEsQ0FBQSxRQUFBO0FBQ0EsVUFBQSxFQUFBLE9BQUE7S0FDQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQTs7QUFFQSxlQUFBO09BQ0E7QUFDQSwwQkFBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsU0FBQSxDQUFBLFdBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLDRCQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0Esb0JBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0Esc0JBQUEsQ0FDQSxlQUFBLEVBQUEsQ0FDQSxJQUFBLENBQUEsY0FBQSxDQUFBLFNBQ0EsQ0FBQSxXQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLGNBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsbUJBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxXQUFBLENBQUEsR0FBQSxFQUFBLEVBRUE7R0FDQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLGtCQUFBLEdBQUEsVUFBQSxpQkFBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FDQSxrQkFBQSxDQUFBO0FBQ0EsUUFBQSxFQUFBLGlCQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxjQUFBLENBQUEsU0FDQSxDQUFBLFdBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsY0FBQSxDQUFBLEdBQUEsRUFBQTs7QUFFQSxZQUFBLENBQUEsZ0JBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7O0FBRUEsVUFBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxZQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLFdBQUEsSUFBQSxJQUFBLElBQUEsT0FBQSxFQUFBO0FBQ0Esb0JBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxhQUFBLEVBQUEsSUFBQTtBQUNBLGVBQUEsRUFBQSxPQUFBLENBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0E7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxZQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsV0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxxQkFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLFFBQUEsT0FBQSxDQUFBLDBDQUFBLENBQUEsRUFBQTtVQVVBLGNBQUEsR0FBQSxTQUFBLGNBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxtQkFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7T0FDQTs7VUFFQSxXQUFBLEdBQUEsU0FBQSxXQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7T0FDQTs7QUFoQkEsVUFBQSxpQkFBQSxHQUFBLE1BQUEsQ0FBQSxtQkFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esd0JBQUEsQ0FDQSxxQkFBQSxDQUFBO0FBQ0EsVUFBQSxFQUFBLGlCQUFBO09BQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxjQUFBLENBQUEsU0FDQSxDQUFBLFdBQUEsQ0FBQSxDQUFBO0tBVUEsTUFBQTtBQUNBLGFBQUEsS0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0NBQ0EsQ0FFQSxDQUFBLENBQUE7QUM1YkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxXQUFBO0FBQ0EsZUFBQSxFQUFBLGdEQUFBO0FBQ0EsY0FBQSxFQUFBLHlCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEseUJBQUEsRUFBQSxDQUFBLFlBQUEsRUFDQSxRQUFBLEVBQ0EsUUFBQSxFQUNBLE9BQUEsRUFDQSxXQUFBLEVBQ0EsU0FBQSxFQUNBLElBQUEsRUFDQSxzQkFBQSxFQUNBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsRUFBQSxFQUFBLG9CQUFBLEVBQUE7OztBQUdBLE1BQUEsU0FBQSxHQUFBLElBQUEsQ0FBQTs7OztBQUlBLFFBQUEsQ0FBQSxTQUFBLEdBQUE7QUFDQSxhQUFBLEVBQUEsc0JBQUE7QUFDQSxZQUFBLEVBQUEsYUFBQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsZUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0tBQ0EsTUFBQTtBQUNBLGVBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsbUJBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxpQkFBQSxHQUFBLDhCQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsWUFBQSxHQUFBLEVBQUEsQ0FBQTs7OztBQUlBLFFBQUEsQ0FBQSxnQkFBQSxHQUFBLFlBQUE7O0FBRUEsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxRQUFBLE9BQUEsR0FBQSxTQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsT0FBQSxDQUFBO0FBQ0Esd0JBQUEsQ0FDQSxnQkFBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxvQkFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLG1CQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsUUFBQSxDQUFBLFNBQ0EsQ0FBQSx1QkFBQSxDQUFBLENBQUE7O0FBRUEsYUFBQSxvQkFBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsZUFBQTtBQUNBLDRCQUFBLEVBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsZUFBQSxHQUFBLEdBQUE7QUFDQSw2QkFBQSxFQUFBLFdBQUE7QUFDQSwyQkFBQSxFQUFBLE9BQUE7U0FDQSxDQUFBO09BQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBOztBQUVBLFVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxrQkFBQSxLQUFBLE1BQUEsRUFBQTtBQUNBLGVBQUEsb0JBQUEsQ0FBQSxlQUFBLENBQUE7QUFDQSxnQkFBQSxFQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsTUFBQTtBQUNBLGlCQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0EsTUFBQTtBQUNBLGVBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtPQUNBO0tBQ0E7O0FBRUEsYUFBQSxtQkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFVBQUEsT0FBQSxHQUFBLEtBQUEsUUFBQSxJQUFBLEdBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsWUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7T0FDQTtBQUNBLGFBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsUUFBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLGVBQUEsR0FBQSxNQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLHVCQUFBLEdBQUE7QUFDQSxXQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7OztBQUtBLFFBQUEsQ0FBQSxhQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSx5QkFBQSxDQUFBLENBQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQTtLQUNBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQ0EsSUFBQSxDQUFBLFlBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxZQUFBLENBQUEsU0FDQSxDQUFBLGVBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsWUFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxhQUFBLG9CQUFBLENBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsWUFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsSUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsS0FBQSxFQUFBLEVBQUE7QUFDQSxlQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsQ0FBQTtPQUNBLE1BQUE7QUFDQSxjQUFBLENBQUEsU0FBQSxHQUFBLHFDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsbUJBQUEsR0FBQSxJQUFBLENBQUE7T0FDQTtBQUNBLFlBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsZUFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxrQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtLQUNBO0dBRUEsQ0FBQTtDQUNBLENBQ0EsQ0FBQSxDQUFBOztBQ3pJQSxHQUFBLENBQUEsT0FBQSxDQUFBLG9CQUFBLEVBQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsV0FBQSxXQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLHlCQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLGVBQUEsR0FBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxpQ0FBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLGtCQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDRCQUFBLEdBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsV0FBQSxxQkFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxrQ0FBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsU0FBQTtBQUNBLGVBQUEsRUFBQSxXQUFBO0FBQ0EsbUJBQUEsRUFBQSxlQUFBO0FBQ0Esc0JBQUEsRUFBQSxrQkFBQTtBQUNBLHlCQUFBLEVBQUEscUJBQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBLENBQUE7O0FDekJBLEdBQUEsQ0FBQSxPQUFBLENBQUEsc0JBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxXQUFBLGdCQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDhCQUFBLEdBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLFlBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsRUFBQTtBQUNBLFNBQUEsRUFBQSxJQUFBLENBQUEsUUFBQTtLQUNBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEsWUFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxvQkFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsV0FBQSxlQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLG9DQUFBLEdBQUEsSUFBQSxDQUFBLE1BQUEsR0FBQSxXQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsU0FBQTtBQUNBLG9CQUFBLEVBQUEsZ0JBQUE7QUFDQSxnQkFBQSxFQUFBLFlBQUE7QUFDQSxnQkFBQSxFQUFBLFlBQUE7QUFDQSxtQkFBQSxFQUFBLGVBQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBLENBQUE7O0FDMUJBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsV0FBQTtBQUNBLGVBQUEsRUFBQSxpQ0FBQTtBQUNBLGNBQUEsRUFBQSxtQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLG1CQUFBLEVBQUEsQ0FBQSxZQUFBLEVBQ0EsUUFBQSxFQUNBLFFBQUEsRUFDQSxPQUFBLEVBQ0EsV0FBQSxFQUNBLFNBQUEsRUFDQSxnQkFBQSxFQUNBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsY0FBQSxFQUFBOztBQUVBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsQ0FDQSxrQkFBQSxFQUNBLFNBQUEsRUFDQSxVQUFBLEVBQ0EsT0FBQSxFQUNBLFdBQUEsRUFDQSxTQUFBLEVBQ0EsYUFBQSxFQUNBLFdBQUEsRUFDQSxZQUFBLEVBQ0EsT0FBQSxFQUNBLGFBQUEsRUFDQSxTQUFBLEVBQ0EsWUFBQSxFQUNBLFVBQUEsRUFDQSxNQUFBLEVBQ0EsYUFBQSxFQUNBLE9BQUEsRUFDQSxtQkFBQSxFQUNBLE9BQUEsRUFDQSxNQUFBLEVBQ0EsNkJBQUEsQ0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLE9BQUEsRUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEtBQUE7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLElBQUEsR0FBQSxJQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0EsU0FBQSxJQUFBLElBQUEsSUFBQSxNQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0E7QUFDQSxrQkFBQSxDQUNBLFdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsZUFBQSxDQUFBLFNBQ0EsQ0FBQSxVQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLGVBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsR0FBQSxDQUFBLE1BQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsR0FBQSxxREFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxlQUFBLENBQUEsT0FBQSxDQUFBLG9CQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxlQUFBO09BQ0E7QUFDQSxZQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsR0FBQSxvREFBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxVQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLEdBQUEsQ0FBQSxNQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLGlCQUFBLEVBQUEsSUFBQTtBQUNBLGFBQUEsRUFBQSxHQUFBLENBQUEsSUFBQTtTQUNBLENBQUE7QUFDQSxlQUFBO09BQ0E7QUFDQSxZQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLElBQUE7QUFDQSxXQUFBLEVBQUEsb0RBQUE7T0FDQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0NBQ0EsQ0FDQSxDQUFBLENBQUE7QUN6RkEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxnQkFBQSxFQUFBLENBQUEsT0FBQSxFQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLFdBQUEsV0FBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxFQUFBLE1BQUE7QUFDQSxTQUFBLEVBQUEsY0FBQTtBQUNBLGFBQUEsRUFBQTtBQUNBLHNCQUFBLEVBQUEsU0FBQTtPQUNBO0FBQ0Esc0JBQUEsRUFBQSxPQUFBLENBQUEsUUFBQTtBQUNBLFVBQUEsRUFBQSxJQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsU0FBQTtBQUNBLGVBQUEsRUFBQSxXQUFBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQSxDQUFBO0FDakJBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxhQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsY0FBQTtBQUNBLGVBQUEsRUFBQSx1Q0FBQTtBQUNBLGNBQUEsRUFBQSxzQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFHQSxHQUFBLENBQUEsVUFBQSxDQUFBLHNCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsV0FBQSxFQUFBLGFBQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLGVBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsV0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLFNBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFlBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUE7S0FDQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBLDZCQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsV0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtBQUNBLGFBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxlQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsZ0NBQUEsQ0FBQSxDQUFBO0FBQ0EsYUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFFBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxZQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsU0FBQSxJQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsRUFBQSxDQUFBLEVBQUEsRUFBQTtBQUNBLFVBQUEsR0FBQSxHQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxlQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0Esb0JBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7T0FDQTtLQUNBO0FBQ0EsY0FBQSxDQUFBLFlBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxxQkFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtPQUNBLEVBQUEsRUFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxJQUFBLEVBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLEdBQUEsRUFBQSxJQUFBLEVBQUE7QUFDQSxRQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsVUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLEtBQUEsSUFBQSxDQUFBLENBQUEsRUFBQTtBQUNBLFNBQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtLQUNBLE1BQUE7QUFDQSxTQUFBLENBQUEsVUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLElBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFFBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQSxNQUFBLElBQUEsQ0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtLQUNBLE1BQUE7QUFDQSxXQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxHQUFBLENBQUEsdUJBQUEsRUFBQSxLQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsZUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsZUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtPQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLHFCQUFBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsVUFBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLFVBQUEsQ0FBQSwwQkFBQSxHQUFBLFVBQUEsQ0FBQSxHQUFBLEdBQUEsR0FBQSxHQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxVQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsZUFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxlQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLHVCQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE9BQUEsR0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxVQUFBLENBQUEsMkJBQUEsR0FBQSxVQUFBLENBQUEsR0FBQSxHQUFBLEdBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLGVBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsZUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSx3QkFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsaUNBQUEsRUFBQSxVQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsY0FBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsa0NBQUEsRUFBQSxVQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsWUFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDdklBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUNBLEtBQUEsQ0FBQSxhQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsZUFBQTtBQUNBLGVBQUEsRUFBQSw0Q0FBQTtBQUNBLGNBQUEsRUFBQSx1QkFBQTtBQUNBLFlBQUEsRUFBQSxJQUFBO0FBQ0EsV0FBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLGlCQUFBLEVBQUEsRUFBQSxNQUFBLEVBQUEsY0FBQSxFQUFBO0FBQ0EsWUFBQSxRQUFBLEdBQUEsRUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLEdBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxJQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBO1NBQ0EsTUFBQTtBQUNBLGtCQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBO1NBQ0E7QUFDQSxlQUFBLFFBQUEsQ0FBQSxPQUFBLENBQUE7T0FDQTtLQUNBO0dBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxvQkFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFVBQUE7QUFDQSxlQUFBLEVBQUEsd0NBQUE7QUFDQSxjQUFBLEVBQUEsdUJBQUE7R0FDQSxDQUFBLENBQ0EsS0FBQSxDQUFBLGdDQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsbUJBQUE7QUFDQSxVQUFBLEVBQUE7QUFDQSxnQkFBQSxFQUFBLElBQUE7S0FDQTtBQUNBLGVBQUEsRUFBQSxxREFBQTtBQUNBLGNBQUEsRUFBQSx1QkFBQTtHQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLHVCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQSxjQUFBLEVBQUEsa0JBQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQTs7OztBQUlBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLGdCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLE9BQUEsRUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEtBQUE7R0FDQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLG1CQUFBLEdBQUEsRUFBQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLGFBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxTQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUEscUJBQUEsYUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEdBQUEsYUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGFBQUEsR0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsaUJBQUEsRUFBQSxJQUFBO0FBQ0EsbUJBQUEsRUFBQSxrQkFBQTtBQUNBLGtCQUFBLEVBQUEsdUJBQUE7QUFDQSxhQUFBLEVBQUEsTUFBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxhQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSx3QkFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxnQkFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxvQkFBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLHFCQUFBLEtBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxZQUFBO0FBQ0EsY0FBQSxDQUFBLHdCQUFBLEdBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLG1CQUFBLEVBQUEsSUFBQTtBQUNBLHFCQUFBLEVBQUEsa0JBQUE7QUFDQSxvQkFBQSxFQUFBLHVCQUFBO0FBQ0EsZUFBQSxFQUFBLE1BQUE7U0FDQSxDQUFBLENBQUE7T0FDQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxxQkFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSx3QkFBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSx3QkFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxxQkFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxhQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLGlCQUFBLEdBQUE7QUFDQSxZQUFBLEVBQUEsa0JBQUEsWUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLGFBQUEsQ0FBQSxZQUFBLEdBQUEsWUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGFBQUEsR0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsaUJBQUEsRUFBQSxJQUFBO0FBQ0EsbUJBQUEsRUFBQSxlQUFBO0FBQ0Esa0JBQUEsRUFBQSw2QkFBQTtBQUNBLGFBQUEsRUFBQSxNQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLGtCQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxxQkFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0Esb0JBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFNBQUEsQ0FBQSxHQUFBLENBQUEsWUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBO0FBQ0EsTUFBQSxZQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLGlCQUFBLENBQUEsUUFBQSxDQUFBLFlBQUEsQ0FBQSxVQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7R0FDQTs7QUFHQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLElBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEdBQUEsQ0FBQTtBQUNBLFdBQUEsRUFBQSxFQUFBO0FBQ0EsY0FBQSxFQUFBLEVBQUE7QUFDQSxnQkFBQSxFQUFBLEVBQUE7QUFDQSxVQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0EscUJBQUEsRUFBQSxJQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxDQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEdBQUEsSUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxDQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEdBQUEsSUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxDQUFBLFVBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsR0FBQSxFQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTs7QUFFQSxVQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsV0FBQSxFQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsS0FBQTtLQUNBLENBQUE7O0FBRUEsUUFBQSxjQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQTtBQUNBLGFBQUEsSUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBOztBQUVBLFFBQUEsT0FBQSxHQUFBO0FBQ0EsVUFBQSxFQUFBLEVBQUE7QUFDQSxjQUFBLEVBQUEsRUFBQTtBQUNBLG9CQUFBLEVBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxjQUFBLENBQUE7S0FDQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsS0FBQSxNQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsSUFBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQTtLQUNBLE1BQUEsSUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsS0FBQSxVQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQTtLQUNBLE1BQUEsSUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsS0FBQSxPQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtLQUNBOztBQUVBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FDQSxlQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLEdBQUEsQ0FBQSxJQUFBLEtBQUEsYUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLGVBQUEsRUFBQSx1QkFBQTtBQUNBLGlCQUFBLEVBQUEsSUFBQTtTQUNBLENBQUE7QUFDQSxlQUFBO09BQ0E7QUFDQSxvQkFBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEscUJBQUEsRUFBQSxDQUFBO0tBQ0EsQ0FBQSxTQUNBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLG1CQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxnQkFBQSxHQUFBLFlBQUE7O0FBRUEsUUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsTUFBQSxJQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7S0FDQTs7QUFFQSxRQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQTtLQUNBOztBQUVBLFVBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLFlBQUEsRUFBQSxFQUFBO0FBQ0EsY0FBQSxFQUFBLEVBQUE7QUFDQSxRQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsRUFBQSxJQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsc0JBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFFBQUEsYUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FDQSxXQUFBLENBQUE7QUFDQSxTQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEdBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLE1BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxTQUNBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsbUJBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSx5QkFBQSxHQUFBLFlBQUE7QUFDQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQ0EsSUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxjQUFBLENBQUEsU0FDQSxDQUFBLFdBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsUUFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsa0JBQUEsQ0FBQSx5QkFBQSxDQUFBO0FBQ0EsYUFBQSxFQUFBLEdBQUEsQ0FBQSxXQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxjQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLEdBQUEsQ0FBQSxNQUFBLEtBQUEsR0FBQSxJQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxLQUFBLElBQUEsRUFBQTtBQUNBLHNCQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7T0FDQSxNQUFBO0FBQ0EsY0FBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLGVBQUEsRUFBQSwyREFBQTtBQUNBLGlCQUFBLEVBQUEsSUFBQTtTQUNBLENBQUE7T0FDQTtBQUNBLFlBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsV0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLHNCQUFBLENBQ0EsZUFBQSxFQUFBLENBQ0EsSUFBQSxDQUFBLGNBQUEsQ0FBQSxTQUNBLENBQUEsV0FBQSxDQUFBLENBQUE7O0FBRUEsYUFBQSxjQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLG1CQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsV0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLHFCQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxRQUFBLE9BQUEsQ0FBQSwwQ0FBQSxDQUFBLEVBQUE7VUFVQSxjQUFBLEdBQUEsU0FBQSxjQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsbUJBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO09BQ0E7O1VBRUEsV0FBQSxHQUFBLFNBQUEsV0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO09BQ0E7O0FBaEJBLFVBQUEsaUJBQUEsR0FBQSxNQUFBLENBQUEsbUJBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLHdCQUFBLENBQ0EscUJBQUEsQ0FBQTtBQUNBLFVBQUEsRUFBQSxpQkFBQTtPQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsY0FBQSxDQUFBLFNBQ0EsQ0FBQSxXQUFBLENBQUEsQ0FBQTtLQVVBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FDQSxVQUFBLENBQUEsNkJBQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTtBQ2pUQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FDQSxLQUFBLENBQUEsZ0NBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxtQ0FBQTtBQUNBLGVBQUEsRUFBQSxnREFBQTtBQUNBLGNBQUEsRUFBQSxzQ0FBQTtHQUNBLENBQUEsQ0FDQSxLQUFBLENBQUEsK0JBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSx1QkFBQTtBQUNBLFVBQUEsRUFBQTtBQUNBLGdCQUFBLEVBQUEsSUFBQTtLQUNBO0FBQ0EsZUFBQSxFQUFBLGdEQUFBO0FBQ0EsY0FBQSxFQUFBLHNDQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsc0NBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsWUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsU0FBQSxFQUFBLE9BQUEsRUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBLGNBQUEsRUFBQSxrQkFBQSxFQUFBOztBQUVBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsS0FBQSxHQUFBO0FBQ0Esa0JBQUEsRUFBQSxFQUFBO0FBQ0EsY0FBQSxFQUFBLEVBQUE7QUFDQSxtQkFBQSxFQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLFFBQUEsRUFBQSxLQUFBO0FBQ0EsV0FBQSxFQUFBLEtBQUE7QUFDQSxVQUFBLEVBQUEsS0FBQTtBQUNBLFdBQUEsRUFBQSxFQUFBO0FBQ0Esc0JBQUEsRUFBQSxNQUFBO0FBQ0EsU0FBQSxFQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQTtBQUNBLFFBQUEsRUFBQSxFQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFlBQUEsR0FBQSxJQUFBLENBQUE7Ozs7QUFJQSxRQUFBLENBQUEsZUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBOzs7O0FBSUEsVUFBQSxDQUFBLGdCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7Ozs7QUFJQSxRQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsWUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxlQUFBLEdBQUEsS0FBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUEsV0FBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEVBQUEsY0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxHQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLEdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEdBQUEsZUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLGlCQUFBLENBQUEsU0FDQSxDQUFBLFdBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsaUJBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFNBQUEsRUFBQSxTQUFBLEVBQUEsVUFBQSxFQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsV0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxlQUFBLEVBQUEsSUFBQSxDQUFBLE9BQUE7QUFDQSxpQkFBQSxFQUFBLElBQUEsQ0FBQSxHQUFBO1dBQ0EsQ0FBQSxDQUFBO1NBQ0E7T0FDQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsZ0JBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsV0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSw2QkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFHQSxRQUFBLENBQUEsWUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGdCQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsRUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsSUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSx1QkFBQSxDQUFBLENBQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQTtLQUNBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQTtLQUNBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxRQUFBLE9BQUEsR0FBQSxJQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0EsU0FBQSxJQUFBLElBQUEsSUFBQSxNQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0E7QUFDQSxRQUFBLE9BQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsV0FBQSxDQUFBLENBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxFQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxFQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsTUFBQSxDQUFBLFdBQUEsRUFBQSxJQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQTtLQUNBOztBQUVBLFFBQUEsT0FBQSxHQUFBO0FBQ0EsWUFBQSxFQUFBLE1BQUE7QUFDQSxTQUFBLEVBQUEsMkJBQUE7QUFDQSxhQUFBLEVBQUE7QUFDQSxzQkFBQSxFQUFBLFNBQUE7T0FDQTtBQUNBLHNCQUFBLEVBQUEsT0FBQSxDQUFBLFFBQUE7QUFDQSxVQUFBLEVBQUEsT0FBQTtLQUNBLENBQUE7QUFDQSxTQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLFlBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsRUFBQSxDQUFBLGdDQUFBLEVBQUE7QUFDQSxzQkFBQSxFQUFBLFlBQUEsQ0FBQSxVQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0EsTUFBQTtBQUNBLGNBQUEsQ0FBQSxFQUFBLENBQUEsZ0NBQUEsQ0FBQSxDQUFBO09BQ0E7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLDRCQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFHQSxRQUFBLENBQUEsV0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLFlBQUEsQ0FBQSxTQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsa0JBQUEsQ0FBQSxZQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLDBCQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLE9BQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxHQUFBLENBQUEsU0FBQSxHQUFBLE9BQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxHQUFBLFNBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7T0FDQSxDQUFBLFNBQ0EsQ0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxpQkFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLFlBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxVQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsK0JBQUEsQ0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsY0FBQSxFQUFBLENBQUE7QUFDQSxlQUFBO09BQ0E7O0FBRUEsWUFBQSxDQUFBLGlCQUFBLENBQUEsUUFBQSxDQUFBLFlBQUEsQ0FBQSxVQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGNBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsS0FBQSxFQUFBLEVBQUE7VUFPQSw2QkFBQSxHQUFBLFNBQUEsNkJBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLGVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxFQUFBLGNBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsZ0JBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEVBQUEsY0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsR0FBQSxlQUFBLENBQUEsQ0FBQTtPQUNBOztVQUVBLGlCQUFBLEdBQUEsU0FBQSxpQkFBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFNBQUEsRUFBQSxTQUFBLEVBQUEsVUFBQSxFQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsV0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUEsQ0FBQSxPQUFBO0FBQ0EsbUJBQUEsRUFBQSxJQUFBLENBQUEsR0FBQTthQUNBLENBQUEsQ0FBQTtXQUNBO1NBQ0EsQ0FBQSxDQUFBOztBQUVBLGNBQUEsQ0FBQSxnQkFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO09BQ0E7O1VBRUEsV0FBQSxHQUFBLFNBQUEsV0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLGFBQUEsQ0FBQSw2QkFBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtPQUNBOztBQXJDQSxZQUFBLENBQUEsZ0JBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLHdCQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsV0FBQSxFQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsUUFBQTtPQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsNkJBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxpQkFBQSxDQUFBLFNBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQTtLQWtDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFlBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLGFBQUEsV0FBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFVBQUEsUUFBQSxHQUFBLFFBQUEsQ0FBQSxhQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFVBQUEsUUFBQSxDQUFBLElBQUEsSUFBQSxFQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBO09BQ0E7QUFDQSxhQUFBLFFBQUEsQ0FBQTtLQUNBOztBQUVBLFFBQUEsUUFBQSxHQUFBLFdBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsSUFBQSxHQUFBLFFBQUEsQ0FBQSxRQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsR0FBQSxLQUFBLElBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUE7S0FDQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEVBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsT0FBQSxDQUFBLG9CQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxTQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsR0FBQTtLQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxNQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsRUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxtQkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFlBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsWUFBQSxFQUFBLEVBQUE7QUFDQSxjQUFBLEVBQUEsRUFBQTtBQUNBLFFBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxtQkFBQSxFQUFBLEtBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxjQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxpQkFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxzQkFBQSxDQUNBLFdBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLE1BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFdBQUEsb0JBQUEsR0FBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGdCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEtBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxLQUFBLEdBQUE7QUFDQSxvQkFBQSxFQUFBLEVBQUE7QUFDQSxnQkFBQSxFQUFBLEVBQUE7QUFDQSxxQkFBQSxFQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsRUFBQTtBQUNBLFVBQUEsRUFBQSxLQUFBO0FBQ0EsYUFBQSxFQUFBLEtBQUE7QUFDQSxZQUFBLEVBQUEsS0FBQTtBQUNBLGFBQUEsRUFBQSxDQUFBO0FBQ0EsV0FBQSxFQUFBLEVBQUE7QUFDQSxjQUFBLEVBQUEsRUFBQTtBQUNBLGdCQUFBLEVBQUEsRUFBQTtBQUNBLFVBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxxQkFBQSxFQUFBLEtBQUE7T0FDQSxDQUFBO0FBQ0Esd0JBQUEsRUFBQSxNQUFBO0tBQ0EsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxPQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOzs7O0FBSUEsUUFBQSxDQUFBLGtCQUFBLEdBQUEsVUFBQSxpQkFBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FDQSxrQkFBQSxDQUFBO0FBQ0EsUUFBQSxFQUFBLGlCQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxjQUFBLENBQUEsU0FDQSxDQUFBLFdBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsY0FBQSxDQUFBLEdBQUEsRUFBQTs7QUFFQSxZQUFBLENBQUEsZ0JBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7O0FBRUEsVUFBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxjQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsWUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsbUJBQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsV0FBQSxJQUFBLElBQUEsSUFBQSxPQUFBLEVBQUE7QUFDQSxvQkFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGFBQUEsRUFBQSxJQUFBO0FBQ0EsZUFBQSxFQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7T0FDQTtBQUNBLG9CQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsMkJBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxhQUFBLEVBQUEsSUFBQTtTQUNBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLGtCQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLGtCQUFBLEdBQUEsTUFBQSxDQUFBO09BQ0E7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxZQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLGNBQUEsR0FBQSxtQkFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLGFBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLFdBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsWUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsR0FBQSxFQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLFVBQUEsRUFDQSxNQUFBLENBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQTtHQUNBLEVBQUEsSUFBQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUNsWkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQ0EsS0FBQSxDQUFBLG1DQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsMkJBQUE7QUFDQSxVQUFBLEVBQUE7QUFDQSxnQkFBQSxFQUFBLElBQUE7S0FDQTtBQUNBLGVBQUEsRUFBQSx3Q0FBQTtBQUNBLGNBQUEsRUFBQSw4QkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFHQSxHQUFBLENBQUEsVUFBQSxDQUFBLDhCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQSxjQUFBLEVBQUEsa0JBQUEsRUFBQTtBQUNBLE1BQUEsS0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsa0JBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxTQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEVBQUEsQ0FBQSxnQ0FBQSxDQUFBLENBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQTtHQUNBOztBQUVBLFFBQUEsQ0FBQSxLQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxJQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFVBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0tBQ0EsTUFBQTtBQUNBLFlBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsSUFBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLENBQUEsOEJBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ3pDQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FDQSxLQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUEseUJBQUE7QUFDQSxjQUFBLEVBQUEsZ0JBQUE7R0FDQSxDQUFBLENBQ0EsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxRQUFBO0FBQ0EsZUFBQSxFQUFBLDBCQUFBO0FBQ0EsY0FBQSxFQUFBLGdCQUFBO0dBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsV0FBQTtBQUNBLGVBQUEsRUFBQSw2QkFBQTtBQUNBLGNBQUEsRUFBQSxnQkFBQTtHQUNBLENBQUEsQ0FDQSxLQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLE9BQUE7QUFDQSxlQUFBLEVBQUEseUJBQUE7QUFDQSxjQUFBLEVBQUEsZ0JBQUE7R0FDQSxDQUFBLENBQ0EsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxRQUFBO0FBQ0EsZUFBQSxFQUFBLDBCQUFBO0FBQ0EsY0FBQSxFQUFBLGdCQUFBO0dBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxTQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsVUFBQTtBQUNBLGVBQUEsRUFBQSw0QkFBQTtBQUNBLGNBQUEsRUFBQSxnQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGdCQUFBLEVBQUEsQ0FBQSxZQUFBLEVBQ0EsUUFBQSxFQUNBLFFBQUEsRUFDQSxPQUFBLEVBQ0EsV0FBQSxFQUNBLFNBQUEsRUFDQSxhQUFBLEVBQ0EsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsU0FBQSxFQUFBLE9BQUEsRUFBQSxXQUFBLEVBQUE7O0FBRUEsUUFBQSxDQUFBLGNBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxJQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUEsS0FBQTtBQUNBLGVBQUEsRUFBQSxLQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxLQUFBO0tBQ0E7QUFDQSxlQUFBLEVBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxLQUFBO0tBQ0E7R0FDQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLHFCQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxpQkFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsS0FBQTtPQUNBO0tBQ0EsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTs7QUFFQSxVQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsR0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEtBQUE7S0FDQSxDQUFBOztBQUVBLGVBQUEsQ0FDQSxlQUFBLENBQUEsTUFBQSxDQUFBLGNBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSx1QkFBQSxDQUFBLFNBQ0EsQ0FBQSxvQkFBQSxDQUFBLENBQUE7O0FBRUEsYUFBQSx1QkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFVBQUEsR0FBQSxDQUFBLE1BQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsY0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxHQUFBLElBQUEsQ0FBQTtPQUNBO0tBQ0E7O0FBRUEsYUFBQSxvQkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFVBQUEsR0FBQSxDQUFBLE1BQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsR0FBQTtBQUNBLGFBQUEsRUFBQSx1QkFBQTtBQUNBLGlCQUFBLEVBQUEsSUFBQTtTQUNBLENBQUE7QUFDQSxlQUFBO09BQ0E7QUFDQSxZQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsR0FBQTtBQUNBLFdBQUEsRUFBQSxrQ0FBQTtBQUNBLGVBQUEsRUFBQSxJQUFBO09BQ0EsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7Ozs7O0FBTUEsUUFBQSxDQUFBLGlCQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxpQkFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsS0FBQTtPQUNBO0tBQ0EsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLGVBQUEsQ0FDQSxlQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxtQkFBQSxDQUFBLFNBQ0EsQ0FBQSxnQkFBQSxDQUFBLENBQUE7O0FBRUEsYUFBQSxtQkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFVBQUEsR0FBQSxDQUFBLE1BQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsTUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxHQUFBLElBQUEsQ0FBQTtPQUNBO0tBQ0E7O0FBRUEsYUFBQSxnQkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFVBQUEsR0FBQSxDQUFBLE1BQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsR0FBQTtBQUNBLGFBQUEsRUFBQSx1QkFBQTtBQUNBLGlCQUFBLEVBQUEsSUFBQTtTQUNBLENBQUE7QUFDQSxlQUFBO09BQ0E7O0FBRUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEdBQUE7QUFDQSxXQUFBLEVBQUEsa0NBQUE7QUFDQSxlQUFBLEVBQUEsSUFBQTtPQUNBLENBQUE7S0FDQTtHQUNBLENBQUE7OztDQUdBLENBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxTQUFBLENBQUEsU0FBQSxFQUFBLFVBQUEsT0FBQSxFQUFBO0FBQ0EsU0FBQTtBQUNBLFlBQUEsRUFBQSxJQUFBO0FBQ0EsUUFBQSxFQUFBLGNBQUEsTUFBQSxFQUFBLFFBQUEsRUFBQTtBQUNBLFVBQUEsR0FBQSxHQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLFNBQUEsR0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsU0FBQSxDQUFBOztBQUVBLGVBQUEsWUFBQSxHQUFBOztBQUVBLFlBQUEsT0FBQSxDQUFBLFdBQUEsR0FBQSxTQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLEVBQUEsT0FBQSxDQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEVBQUEsTUFBQSxDQUFBLENBQUE7U0FDQSxNQUFBO0FBQ0Esa0JBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBO1NBQ0E7T0FDQTs7QUFFQSxZQUFBLENBQUEsR0FBQSxDQUFBLG1CQUFBLEVBQUEsWUFBQTtBQUNBLFdBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxFQUFBLFlBQUEsQ0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEVBQUEsWUFBQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FDL0tBLEdBQUEsQ0FBQSxPQUFBLENBQUEsb0JBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxXQUFBLFdBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEsZUFBQSxHQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDJCQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEsa0JBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsNEJBQUEsR0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLHFCQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLGtDQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLGVBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsNEJBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEseUJBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsa0NBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEsMEJBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsMkJBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFNBQUE7QUFDQSxlQUFBLEVBQUEsV0FBQTtBQUNBLG1CQUFBLEVBQUEsZUFBQTtBQUNBLHNCQUFBLEVBQUEsa0JBQUE7QUFDQSxtQkFBQSxFQUFBLGVBQUE7QUFDQSx5QkFBQSxFQUFBLHFCQUFBO0FBQ0EsNkJBQUEsRUFBQSx5QkFBQTtBQUNBLDhCQUFBLEVBQUEsMEJBQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBLENBQUE7O0FDdkNBLEdBQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxFQUFBLENBQUEsT0FBQSxFQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLFdBQUEsZUFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSx1QkFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsV0FBQSxlQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLHVCQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxTQUFBO0FBQ0EsbUJBQUEsRUFBQSxlQUFBO0FBQ0EsbUJBQUEsRUFBQSxlQUFBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQSxDQUFBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcbndpbmRvdy5hcHAgPSBhbmd1bGFyLm1vZHVsZSgnRnVsbHN0YWNrR2VuZXJhdGVkQXBwJywgWydmc2FQcmVCdWlsdCcsICd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJywgJ25nQW5pbWF0ZScsICduZ0Nvb2tpZXMnLCAneWFydTIyLmFuZ3VsYXItdGltZWFnbyddKTtcclxuXHJcbmFwcC5jb25maWcoZnVuY3Rpb24gKCR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIsICR1aVZpZXdTY3JvbGxQcm92aWRlcikge1xyXG4gICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxyXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xyXG4gICAgLy8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXHJcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XHJcbiAgICAvLyAkdWlWaWV3U2Nyb2xsUHJvdmlkZXIudXNlQW5jaG9yU2Nyb2xsKCk7XHJcbn0pO1xyXG5cclxuLy8gVGhpcyBhcHAucnVuIGlzIGZvciBjb250cm9sbGluZyBhY2Nlc3MgdG8gc3BlY2lmaWMgc3RhdGVzLlxyXG5hcHAucnVuKGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgJHN0YXRlLCAkdWlWaWV3U2Nyb2xsLCBTZXNzaW9uU2VydmljZSwgQXBwQ29uZmlnKSB7XHJcbiAgICAvLyBUaGUgZ2l2ZW4gc3RhdGUgcmVxdWlyZXMgYW4gYXV0aGVudGljYXRlZCB1c2VyLlxyXG4gICAgLy8gdmFyIGRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGggPSBmdW5jdGlvbiAoc3RhdGUpIHtcclxuICAgIC8vICAgICByZXR1cm4gc3RhdGUuZGF0YSAmJiBzdGF0ZS5kYXRhLmF1dGhlbnRpY2F0ZTtcclxuICAgIC8vIH07XHJcblxyXG4gICAgQXBwQ29uZmlnLmZldGNoQ29uZmlnKCkudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmxvZyhyZXMpO1xyXG4gICAgICAgIEFwcENvbmZpZy5zZXRDb25maWcocmVzLmRhdGEpO1xyXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKEFwcENvbmZpZy5pc0NvbmZpZ1BhcmFtc3ZhaWxhYmxlKTtcclxuICAgIH0pXHJcblxyXG4gICAgLy8gJHN0YXRlQ2hhbmdlU3RhcnQgaXMgYW4gZXZlbnQgZmlyZWRcclxuICAgIC8vIHdoZW5ldmVyIHRoZSBwcm9jZXNzIG9mIGNoYW5naW5nIGEgc3RhdGUgYmVnaW5zLlxyXG4gICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcykge1xyXG4gICAgICAgIC8vIGlmKHRvU3RhdGUgPSAnYXJ0aXN0VG9vbHMnKSB7XHJcbiAgICAgICAgLy8gICAgIHZhciB1c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyh1c2VyKTtcclxuICAgICAgICAvLyB9XHJcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3JlYWNoZWQgaGVyZScpO1xyXG4gICAgICAgIC8vIGlmICghZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCh0b1N0YXRlKSkge1xyXG4gICAgICAgIC8vICAgICAvLyBUaGUgZGVzdGluYXRpb24gc3RhdGUgZG9lcyBub3QgcmVxdWlyZSBhdXRoZW50aWNhdGlvblxyXG4gICAgICAgIC8vICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxyXG4gICAgICAgIC8vICAgICByZXR1cm47XHJcbiAgICAgICAgLy8gfVxyXG5cclxuICAgICAgICAvLyBpZiAoQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkpIHtcclxuICAgICAgICAvLyAgICAgLy8gVGhlIHVzZXIgaXMgYXV0aGVudGljYXRlZC5cclxuICAgICAgICAvLyAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cclxuICAgICAgICAvLyAgICAgcmV0dXJuO1xyXG4gICAgICAgIC8vIH1cclxuXHJcbiAgICAgICAgLy8gLy8gQ2FuY2VsIG5hdmlnYXRpbmcgdG8gbmV3IHN0YXRlLlxyXG4gICAgICAgIC8vIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XHJcblxyXG4gICAgICAgIC8vIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcclxuICAgICAgICAvLyAgICAgLy8gSWYgYSB1c2VyIGlzIHJldHJpZXZlZCwgdGhlbiByZW5hdmlnYXRlIHRvIHRoZSBkZXN0aW5hdGlvblxyXG4gICAgICAgIC8vICAgICAvLyAodGhlIHNlY29uZCB0aW1lLCBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSB3aWxsIHdvcmspXHJcbiAgICAgICAgLy8gICAgIC8vIG90aGVyd2lzZSwgaWYgbm8gdXNlciBpcyBsb2dnZWQgaW4sIGdvIHRvIFwibG9naW5cIiBzdGF0ZS5cclxuICAgICAgICAvLyAgICAgaWYgKHVzZXIpIHtcclxuICAgICAgICAvLyAgICAgICAgICRzdGF0ZS5nbyh0b1N0YXRlLm5hbWUsIHRvUGFyYW1zKTtcclxuICAgICAgICAvLyAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyAgICAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcclxuICAgICAgICAvLyAgICAgfVxyXG4gICAgICAgIC8vIH0pO1xyXG5cclxuICAgIH0pO1xyXG5cclxufSk7XHJcblxyXG5cclxuYXBwLmRpcmVjdGl2ZSgnZmlsZXJlYWQnLCBbZnVuY3Rpb24gKCkge1xyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBzY29wZToge1xyXG4gICAgICAgICAgICBmaWxlcmVhZDogJz0nLFxyXG4gICAgICAgICAgICBtZXNzYWdlOiAnPSdcclxuICAgICAgICB9LFxyXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uIChzY29wZSwgZWxlbWVudCwgYXR0cmlidXRlcykge1xyXG4gICAgICAgICAgICBlbGVtZW50LmJpbmQoJ2NoYW5nZScsIGZ1bmN0aW9uIChjaGFuZ2VFdmVudCkge1xyXG4gICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgICAgICAgICBzY29wZS5tZXNzYWdlID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsOiAnJ1xyXG4gICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgXHJcbiAgICAgICAgICAgICAgICAgICAgaWYoY2hhbmdlRXZlbnQudGFyZ2V0LmZpbGVzWzBdLnR5cGUgIT0gXCJhdWRpby9tcGVnXCIgJiYgY2hhbmdlRXZlbnQudGFyZ2V0LmZpbGVzWzBdLnR5cGUgIT0gXCJhdWRpby9tcDNcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5tZXNzYWdlID0ge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbDogJ0Vycm9yOiBQbGVhc2UgdXBsb2FkIG1wMyBmb3JtYXQgZmlsZS4nXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudmFsKG51bGwpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgICAgIGlmKGNoYW5nZUV2ZW50LnRhcmdldC5maWxlc1swXS5zaXplID4gMjAqMTAwMCoxMDAwKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLm1lc3NhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiB0cnVlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsOiAnRXJyb3I6IFBsZWFzZSB1cGxvYWQgZmlsZSB1cHRvIDIwIE1CIHNpemUuJ1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnZhbChudWxsKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICBzY29wZS5maWxlcmVhZCA9IGNoYW5nZUV2ZW50LnRhcmdldC5maWxlc1swXTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICB9XHJcbn1dKTtcclxuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkYXRhYmFzZScsIHtcclxuICAgIHVybDogJy9hZG1pbi9kYXRhYmFzZScsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2RhdGFiYXNlL2RhdGFiYXNlLmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ0RhdGFiYXNlQ29udHJvbGxlcidcclxuICB9KTtcclxufSk7XHJcblxyXG5hcHAuZGlyZWN0aXZlKCdub3RpZmljYXRpb25CYXInLCBbJ3NvY2tldCcsIGZ1bmN0aW9uKHNvY2tldCkge1xyXG4gIHJldHVybiB7XHJcbiAgICByZXN0cmljdDogJ0VBJyxcclxuICAgIHNjb3BlOiB0cnVlLFxyXG4gICAgdGVtcGxhdGU6ICc8ZGl2IHN0eWxlPVwibWFyZ2luOiAwIGF1dG87d2lkdGg6NTAlXCIgbmctc2hvdz1cImJhci52aXNpYmxlXCI+JyArXHJcbiAgICAgICc8dWliLXByb2dyZXNzPjx1aWItYmFyIHZhbHVlPVwiYmFyLnZhbHVlXCIgdHlwZT1cInt7YmFyLnR5cGV9fVwiPjxzcGFuPnt7YmFyLnZhbHVlfX0lPC9zcGFuPjwvdWliLWJhcj48L3VpYi1wcm9ncmVzcz4nICtcclxuICAgICAgJzwvZGl2PicsXHJcbiAgICBsaW5rOiBmdW5jdGlvbigkc2NvcGUsIGlFbG0sIGlBdHRycywgY29udHJvbGxlcikge1xyXG4gICAgICBzb2NrZXQub24oJ25vdGlmaWNhdGlvbicsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgICB2YXIgcGVyY2VudGFnZSA9IHBhcnNlSW50KE1hdGguZmxvb3IoZGF0YS5jb3VudGVyIC8gZGF0YS50b3RhbCAqIDEwMCksIDEwKTtcclxuICAgICAgICAkc2NvcGUuYmFyLnZhbHVlID0gcGVyY2VudGFnZTtcclxuICAgICAgICBpZiAocGVyY2VudGFnZSA9PT0gMTAwKSB7XHJcbiAgICAgICAgICAkc2NvcGUuYmFyLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgICAgICRzY29wZS5iYXIudmFsdWUgPSAwO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxufV0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ0RhdGFiYXNlQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgQXV0aFNlcnZpY2UsIHNvY2tldCkge1xyXG4gICRzY29wZS5hZGRVc2VyID0ge307XHJcbiAgJHNjb3BlLnF1ZXJ5ID0ge307XHJcbiAgJHNjb3BlLnRyZFVzclF1ZXJ5ID0ge307XHJcbiAgJHNjb3BlLnF1ZXJ5Q29scyA9IFt7XHJcbiAgICBuYW1lOiAndXNlcm5hbWUnLFxyXG4gICAgdmFsdWU6ICd1c2VybmFtZSdcclxuICB9LCB7XHJcbiAgICBuYW1lOiAnZ2VucmUnLFxyXG4gICAgdmFsdWU6ICdnZW5yZSdcclxuICB9LCB7XHJcbiAgICBuYW1lOiAnbmFtZScsXHJcbiAgICB2YWx1ZTogJ25hbWUnXHJcbiAgfSwge1xyXG4gICAgbmFtZTogJ1VSTCcsXHJcbiAgICB2YWx1ZTogJ3NjVVJMJ1xyXG4gIH0sIHtcclxuICAgIG5hbWU6ICdlbWFpbCcsXHJcbiAgICB2YWx1ZTogJ2VtYWlsJ1xyXG4gIH0sIHtcclxuICAgIG5hbWU6ICdkZXNjcmlwdGlvbicsXHJcbiAgICB2YWx1ZTogJ2Rlc2NyaXB0aW9uJ1xyXG4gIH0sIHtcclxuICAgIG5hbWU6ICdmb2xsb3dlcnMnLFxyXG4gICAgdmFsdWU6ICdmb2xsb3dlcnMnXHJcbiAgfSwge1xyXG4gICAgbmFtZTogJ251bWJlciBvZiB0cmFja3MnLFxyXG4gICAgdmFsdWU6ICdudW1UcmFja3MnXHJcbiAgfSwge1xyXG4gICAgbmFtZTogJ2ZhY2Vib29rJyxcclxuICAgIHZhbHVlOiAnZmFjZWJvb2tVUkwnXHJcbiAgfSwge1xyXG4gICAgbmFtZTogJ2luc3RhZ3JhbScsXHJcbiAgICB2YWx1ZTogJ2luc3RhZ3JhbVVSTCdcclxuICB9LCB7XHJcbiAgICBuYW1lOiAndHdpdHRlcicsXHJcbiAgICB2YWx1ZTogJ3R3aXR0ZXJVUkwnXHJcbiAgfSwge1xyXG4gICAgbmFtZTogJ3lvdXR1YmUnLFxyXG4gICAgdmFsdWU6ICd5b3V0dWJlVVJMJ1xyXG4gIH0sIHtcclxuICAgIG5hbWU6ICd3ZWJzaXRlcycsXHJcbiAgICB2YWx1ZTogJ3dlYnNpdGVzJ1xyXG4gIH0sIHtcclxuICAgIG5hbWU6ICdhdXRvIGVtYWlsIGRheScsXHJcbiAgICB2YWx1ZTogJ2VtYWlsRGF5TnVtJ1xyXG4gIH0sIHtcclxuICAgIG5hbWU6ICdhbGwgZW1haWxzJyxcclxuICAgIHZhbHVlOiAnYWxsRW1haWxzJ1xyXG4gIH1dO1xyXG4gICRzY29wZS5kb3dubG9hZEJ1dHRvblZpc2libGUgPSBmYWxzZTtcclxuICAkc2NvcGUudHJhY2sgPSB7XHJcbiAgICB0cmFja1VybDogJycsXHJcbiAgICBkb3dubG9hZFVybDogJycsXHJcbiAgICBlbWFpbDogJydcclxuICB9O1xyXG4gICRzY29wZS5iYXIgPSB7XHJcbiAgICB0eXBlOiAnc3VjY2VzcycsXHJcbiAgICB2YWx1ZTogMCxcclxuICAgIHZpc2libGU6IGZhbHNlXHJcbiAgfTtcclxuICAkc2NvcGUucGFpZFJlcG9zdCA9IHtcclxuICAgIHNvdW5kQ2xvdWRVcmw6ICcnXHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJGh0dHAuZ2V0KCcvYXBpL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hZG1pbic7XHJcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgYWxlcnQoJ1dyb25nIFBhc3N3b3JkJyk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gICRzY29wZS5zYXZlQWRkVXNlciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgJHNjb3BlLmFkZFVzZXIucGFzc3dvcmQgPSAkcm9vdFNjb3BlLnBhc3N3b3JkO1xyXG4gICAgJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS9hZGR1c2VyJywgJHNjb3BlLmFkZFVzZXIpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgIGFsZXJ0KFwiU3VjY2VzczogRGF0YWJhc2UgaXMgYmVpbmcgcG9wdWxhdGVkLiBZb3Ugd2lsbCBiZSBlbWFpbGVkIHdoZW4gaXQgaXMgY29tcGxldGUuXCIpO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgJHNjb3BlLmJhci52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgfSlcclxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgIGFsZXJ0KCdCYWQgc3VibWlzc2lvbicpO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmNyZWF0ZVVzZXJRdWVyeURvYyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHF1ZXJ5ID0ge307XHJcbiAgICBpZiAoJHNjb3BlLnF1ZXJ5LmFydGlzdCA9PSBcImFydGlzdHNcIikge1xyXG4gICAgICBxdWVyeS5hcnRpc3QgPSB0cnVlO1xyXG4gICAgfSBlbHNlIGlmICgkc2NvcGUucXVlcnkuYXJ0aXN0ID09IFwibm9uLWFydGlzdHNcIikge1xyXG4gICAgICBxdWVyeS5hcnRpc3QgPSBmYWxzZTtcclxuICAgIH1cclxuICAgIHZhciBmbHdyUXJ5ID0ge307XHJcbiAgICBpZiAoJHNjb3BlLnF1ZXJ5LmZvbGxvd2Vyc0dUKSB7XHJcbiAgICAgIGZsd3JRcnkuJGd0ID0gJHNjb3BlLnF1ZXJ5LmZvbGxvd2Vyc0dUO1xyXG4gICAgICBxdWVyeS5mb2xsb3dlcnMgPSBmbHdyUXJ5O1xyXG4gICAgfVxyXG4gICAgaWYgKCRzY29wZS5xdWVyeS5mb2xsb3dlcnNMVCkge1xyXG4gICAgICBmbHdyUXJ5LiRsdCA9ICRzY29wZS5xdWVyeS5mb2xsb3dlcnNMVDtcclxuICAgICAgcXVlcnkuZm9sbG93ZXJzID0gZmx3clFyeTtcclxuICAgIH1cclxuICAgIGlmICgkc2NvcGUucXVlcnkuZ2VucmUpIHF1ZXJ5LmdlbnJlID0gJHNjb3BlLnF1ZXJ5LmdlbnJlO1xyXG4gICAgaWYgKCRzY29wZS5xdWVyeUNvbHMpIHtcclxuICAgICAgcXVlcnkuY29sdW1ucyA9ICRzY29wZS5xdWVyeUNvbHMuZmlsdGVyKGZ1bmN0aW9uKGVsbSkge1xyXG4gICAgICAgIHJldHVybiBlbG0udmFsdWUgIT09IG51bGw7XHJcbiAgICAgIH0pLm1hcChmdW5jdGlvbihlbG0pIHtcclxuICAgICAgICByZXR1cm4gZWxtLnZhbHVlO1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIGlmICgkc2NvcGUucXVlcnkudHJhY2tlZFVzZXJzVVJMKSBxdWVyeS50cmFja2VkVXNlcnNVUkwgPSAkc2NvcGUucXVlcnkudHJhY2tlZFVzZXJzVVJMO1xyXG4gICAgdmFyIGJvZHkgPSB7XHJcbiAgICAgIHF1ZXJ5OiBxdWVyeSxcclxuICAgICAgcGFzc3dvcmQ6ICRyb290U2NvcGUucGFzc3dvcmRcclxuICAgIH07XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL2ZvbGxvd2VycycsIGJvZHkpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICRzY29wZS5maWxlbmFtZSA9IHJlcy5kYXRhO1xyXG4gICAgICAgICRzY29wZS5kb3dubG9hZEJ1dHRvblZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgIGFsZXJ0KFwiRVJST1I6IEJhZCBRdWVyeSBvciBObyBNYXRjaGVzXCIpO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmNyZWF0ZVRyZFVzclF1ZXJ5RG9jID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcXVlcnkgPSB7fTtcclxuICAgIHZhciBmbHdyUXJ5ID0ge307XHJcbiAgICBpZiAoJHNjb3BlLnRyZFVzclF1ZXJ5LmZvbGxvd2Vyc0dUKSB7XHJcbiAgICAgIGZsd3JRcnkuJGd0ID0gJHNjb3BlLnRyZFVzclF1ZXJ5LmZvbGxvd2Vyc0dUO1xyXG4gICAgICBxdWVyeS5mb2xsb3dlcnMgPSBmbHdyUXJ5O1xyXG4gICAgfVxyXG4gICAgaWYgKCRzY29wZS50cmRVc3JRdWVyeS5mb2xsb3dlcnNMVCkge1xyXG4gICAgICBmbHdyUXJ5LiRsdCA9ICRzY29wZS50cmRVc3JRdWVyeS5mb2xsb3dlcnNMVDtcclxuICAgICAgcXVlcnkuZm9sbG93ZXJzID0gZmx3clFyeTtcclxuICAgIH1cclxuICAgIGlmICgkc2NvcGUudHJkVXNyUXVlcnkuZ2VucmUpIHF1ZXJ5LmdlbnJlID0gJHNjb3BlLnRyZFVzclF1ZXJ5LmdlbnJlO1xyXG4gICAgdmFyIGJvZHkgPSB7XHJcbiAgICAgIHF1ZXJ5OiBxdWVyeSxcclxuICAgICAgcGFzc3dvcmQ6ICRyb290U2NvcGUucGFzc3dvcmRcclxuICAgIH07XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL3RyYWNrZWRVc2VycycsIGJvZHkpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICRzY29wZS50cmRVc3JGaWxlbmFtZSA9IHJlcy5kYXRhO1xyXG4gICAgICAgICRzY29wZS5kb3dubG9hZFRyZFVzckJ1dHRvblZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgIGFsZXJ0KFwiRVJST1I6IEJhZCBRdWVyeSBvciBObyBNYXRjaGVzXCIpO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmRvd25sb2FkID0gZnVuY3Rpb24oZmlsZW5hbWUpIHtcclxuICAgIHZhciBhbmNob3IgPSBhbmd1bGFyLmVsZW1lbnQoJzxhLz4nKTtcclxuICAgIGFuY2hvci5hdHRyKHtcclxuICAgICAgaHJlZjogZmlsZW5hbWUsXHJcbiAgICAgIGRvd25sb2FkOiBmaWxlbmFtZVxyXG4gICAgfSlbMF0uY2xpY2soKTtcclxuICAgICRzY29wZS5kb3dubG9hZEJ1dHRvblZpc2libGUgPSBmYWxzZTtcclxuICAgICRzY29wZS5kb3dubG9hZFRyZFVzckJ1dHRvblZpc2libGUgPSBmYWxzZTtcclxuICB9XHJcblxyXG4gICRzY29wZS5zYXZlUGFpZFJlcG9zdENoYW5uZWwgPSBmdW5jdGlvbigpIHtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvcGFpZHJlcG9zdCcsICRzY29wZS5wYWlkUmVwb3N0KVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAkc2NvcGUucGFpZFJlcG9zdCA9IHtcclxuICAgICAgICAgIHNvdW5kQ2xvdWRVcmw6ICcnXHJcbiAgICAgICAgfTtcclxuICAgICAgICBhbGVydChcIlNVQ0NFU1M6IFVybCBzYXZlZCBzdWNjZXNzZnVsbHlcIik7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgYWxlcnQoXCJFUlJPUjogRXJyb3IgaW4gc2F2aW5nIHVybFwiKTtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qIExpc3RlbiB0byBzb2NrZXQgZXZlbnRzICovXHJcbiAgc29ja2V0Lm9uKCdub3RpZmljYXRpb24nLCBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICB2YXIgcGVyY2VudGFnZSA9IHBhcnNlSW50KE1hdGguZmxvb3IoZGF0YS5jb3VudGVyIC8gZGF0YS50b3RhbCAqIDEwMCksIDEwKTtcclxuICAgICRzY29wZS5iYXIudmFsdWUgPSBwZXJjZW50YWdlO1xyXG4gICAgaWYgKHBlcmNlbnRhZ2UgPT09IDEwMCkge1xyXG4gICAgICAkc2NvcGUuc3RhdHVzQmFyVmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAkc2NvcGUuYmFyLnZhbHVlID0gMDtcclxuICAgIH1cclxuICB9KTtcclxufSk7IiwiKGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICd1c2Ugc3RyaWN0JztcclxuICAgIC8vIEhvcGUgeW91IGRpZG4ndCBmb3JnZXQgQW5ndWxhciEgRHVoLWRveS5cclxuICAgIGlmICghd2luZG93LmFuZ3VsYXIpIHRocm93IG5ldyBFcnJvcignSSBjYW5cXCd0IGZpbmQgQW5ndWxhciEnKTtcclxuXHJcbiAgICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2ZzYVByZUJ1aWx0JywgW10pO1xyXG5cclxuICAgIGFwcC5mYWN0b3J5KCdpbml0U29ja2V0JywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKCF3aW5kb3cuaW8pIHRocm93IG5ldyBFcnJvcignc29ja2V0LmlvIG5vdCBmb3VuZCEnKTtcclxuICAgICAgICByZXR1cm4gd2luZG93LmlvKHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4pO1xyXG4gICAgfSk7XHJcblxyXG4gICAgYXBwLmZhY3RvcnkoJ3NvY2tldCcsIGZ1bmN0aW9uKCRyb290U2NvcGUsIGluaXRTb2NrZXQpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICBvbjogZnVuY3Rpb24oZXZlbnROYW1lLCBjYWxsYmFjaykge1xyXG4gICAgICAgICAgICAgICAgaW5pdFNvY2tldC5vbihldmVudE5hbWUsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xyXG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShpbml0U29ja2V0LCBhcmdzKTtcclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBlbWl0OiBmdW5jdGlvbihldmVudE5hbWUsIGRhdGEsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICBpbml0U29ja2V0LmVtaXQoZXZlbnROYW1lLCBkYXRhLCBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcclxuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjYWxsYmFjay5hcHBseShpbml0U29ja2V0LCBhcmdzKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgIH07XHJcbiAgICB9KTtcclxuXHJcbiAgICBhcHAuZmFjdG9yeSgnQXBwQ29uZmlnJywgZnVuY3Rpb24oJGh0dHApIHtcclxuICAgICAgICB2YXIgX2NvbmZpZ1BhcmFtcyA9IG51bGw7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGZldGNoQ29uZmlnKCkge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3NvdW5kY2xvdWQvc291bmRjbG91ZENvbmZpZycpO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgZnVuY3Rpb24gc2V0Q29uZmlnKGRhdGEpIHtcclxuICAgICAgICAgICAgX2NvbmZpZ1BhcmFtcyA9IGRhdGE7XHJcbiAgICAgICAgICAgIFNDLmluaXRpYWxpemUoe1xyXG4gICAgICAgICAgICAgICAgY2xpZW50X2lkOiBkYXRhLmNsaWVudElELFxyXG4gICAgICAgICAgICAgICAgcmVkaXJlY3RfdXJpOiBkYXRhLmNhbGxiYWNrVVJMLFxyXG4gICAgICAgICAgICAgICAgc2NvcGU6IFwibm9uLWV4cGlyaW5nXCJcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRDb25maWcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBfY29uZmlnUGFyYW1zO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZmV0Y2hDb25maWc6IGZldGNoQ29uZmlnLFxyXG4gICAgICAgICAgICBnZXRDb25maWc6IGdldENvbmZpZyxcclxuICAgICAgICAgICAgc2V0Q29uZmlnOiBzZXRDb25maWdcclxuICAgICAgICB9O1xyXG4gICAgfSk7XHJcblxyXG4gICAgLy8gQVVUSF9FVkVOVFMgaXMgdXNlZCB0aHJvdWdob3V0IG91ciBhcHAgdG9cclxuICAgIC8vIGJyb2FkY2FzdCBhbmQgbGlzdGVuIGZyb20gYW5kIHRvIHRoZSAkcm9vdFNjb3BlXHJcbiAgICAvLyBmb3IgaW1wb3J0YW50IGV2ZW50cyBhYm91dCBhdXRoZW50aWNhdGlvbiBmbG93LlxyXG4gICAgLy8gYXBwLmNvbnN0YW50KCdBVVRIX0VWRU5UUycsIHtcclxuICAgIC8vICAgICBsb2dpblN1Y2Nlc3M6ICdhdXRoLWxvZ2luLXN1Y2Nlc3MnLFxyXG4gICAgLy8gICAgIGxvZ2luRmFpbGVkOiAnYXV0aC1sb2dpbi1mYWlsZWQnLFxyXG4gICAgLy8gICAgIGxvZ291dFN1Y2Nlc3M6ICdhdXRoLWxvZ291dC1zdWNjZXNzJyxcclxuICAgIC8vICAgICBzZXNzaW9uVGltZW91dDogJ2F1dGgtc2Vzc2lvbi10aW1lb3V0JyxcclxuICAgIC8vICAgICBub3RBdXRoZW50aWNhdGVkOiAnYXV0aC1ub3QtYXV0aGVudGljYXRlZCcsXHJcbiAgICAvLyAgICAgbm90QXV0aG9yaXplZDogJ2F1dGgtbm90LWF1dGhvcml6ZWQnXHJcbiAgICAvLyB9KTtcclxuXHJcbiAgICAvLyBhcHAuZmFjdG9yeSgnQXV0aEludGVyY2VwdG9yJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHEsIEFVVEhfRVZFTlRTKSB7XHJcbiAgICAvLyAgICAgdmFyIHN0YXR1c0RpY3QgPSB7XHJcbiAgICAvLyAgICAgICAgIDQwMTogQVVUSF9FVkVOVFMubm90QXV0aGVudGljYXRlZCxcclxuICAgIC8vICAgICAgICAgNDAzOiBBVVRIX0VWRU5UUy5ub3RBdXRob3JpemVkLFxyXG4gICAgLy8gICAgICAgICA0MTk6IEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LFxyXG4gICAgLy8gICAgICAgICA0NDA6IEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0XHJcbiAgICAvLyAgICAgfTtcclxuICAgIC8vICAgICByZXR1cm4ge1xyXG4gICAgLy8gICAgICAgICByZXNwb25zZUVycm9yOiBmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgLy8gICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KHN0YXR1c0RpY3RbcmVzcG9uc2Uuc3RhdHVzXSwgcmVzcG9uc2UpO1xyXG4gICAgLy8gICAgICAgICAgICAgcmV0dXJuICRxLnJlamVjdChyZXNwb25zZSlcclxuICAgIC8vICAgICAgICAgfVxyXG4gICAgLy8gICAgIH07XHJcbiAgICAvLyB9KTtcclxuXHJcbiAgICAvLyBhcHAuY29uZmlnKGZ1bmN0aW9uKCRodHRwUHJvdmlkZXIpIHtcclxuICAgIC8vICAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKFtcclxuICAgIC8vICAgICAgICAgJyRpbmplY3RvcicsXHJcbiAgICAvLyAgICAgICAgIGZ1bmN0aW9uKCRpbmplY3Rvcikge1xyXG4gICAgLy8gICAgICAgICAgICAgcmV0dXJuICRpbmplY3Rvci5nZXQoJ0F1dGhJbnRlcmNlcHRvcicpO1xyXG4gICAgLy8gICAgICAgICB9XHJcbiAgICAvLyAgICAgXSk7XHJcbiAgICAvLyB9KTtcclxuXHJcbiAgICAvLyBhcHAuc2VydmljZSgnQXV0aFNlcnZpY2UnLCBmdW5jdGlvbigkaHR0cCwgU2Vzc2lvbiwgJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMsICRxKSB7XHJcblxyXG4gICAgLy8gICAgIGZ1bmN0aW9uIG9uU3VjY2Vzc2Z1bExvZ2luKHJlc3BvbnNlKSB7XHJcbiAgICAvLyAgICAgICAgIHZhciBkYXRhID0gcmVzcG9uc2UuZGF0YTtcclxuICAgIC8vICAgICAgICAgU2Vzc2lvbi5jcmVhdGUoZGF0YS5pZCwgZGF0YS51c2VyKTtcclxuICAgIC8vICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcyk7XHJcbiAgICAvLyAgICAgICAgIHJldHVybiBkYXRhLnVzZXI7XHJcbiAgICAvLyAgICAgfVxyXG5cclxuICAgIC8vICAgICAvLyBVc2VzIHRoZSBzZXNzaW9uIGZhY3RvcnkgdG8gc2VlIGlmIGFuXHJcbiAgICAvLyAgICAgLy8gYXV0aGVudGljYXRlZCB1c2VyIGlzIGN1cnJlbnRseSByZWdpc3RlcmVkLlxyXG4gICAgLy8gICAgIHRoaXMuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyAgICAgICAgIHJldHVybiAhIVNlc3Npb24udXNlcjtcclxuICAgIC8vICAgICB9O1xyXG5cclxuICAgIC8vICAgICB0aGlzLmdldExvZ2dlZEluVXNlciA9IGZ1bmN0aW9uKGZyb21TZXJ2ZXIpIHtcclxuXHJcbiAgICAvLyAgICAgICAgIC8vIElmIGFuIGF1dGhlbnRpY2F0ZWQgc2Vzc2lvbiBleGlzdHMsIHdlXHJcbiAgICAvLyAgICAgICAgIC8vIHJldHVybiB0aGUgdXNlciBhdHRhY2hlZCB0byB0aGF0IHNlc3Npb25cclxuICAgIC8vICAgICAgICAgLy8gd2l0aCBhIHByb21pc2UuIFRoaXMgZW5zdXJlcyB0aGF0IHdlIGNhblxyXG4gICAgLy8gICAgICAgICAvLyBhbHdheXMgaW50ZXJmYWNlIHdpdGggdGhpcyBtZXRob2QgYXN5bmNocm9ub3VzbHkuXHJcblxyXG4gICAgLy8gICAgICAgICAvLyBPcHRpb25hbGx5LCBpZiB0cnVlIGlzIGdpdmVuIGFzIHRoZSBmcm9tU2VydmVyIHBhcmFtZXRlcixcclxuICAgIC8vICAgICAgICAgLy8gdGhlbiB0aGlzIGNhY2hlZCB2YWx1ZSB3aWxsIG5vdCBiZSB1c2VkLlxyXG5cclxuICAgIC8vICAgICAgICAgaWYgKHRoaXMuaXNBdXRoZW50aWNhdGVkKCkgJiYgZnJvbVNlcnZlciAhPT0gdHJ1ZSkge1xyXG4gICAgLy8gICAgICAgICAgICAgcmV0dXJuICRxLndoZW4oU2Vzc2lvbi51c2VyKTtcclxuICAgIC8vICAgICAgICAgfVxyXG5cclxuICAgIC8vICAgICAgICAgLy8gTWFrZSByZXF1ZXN0IEdFVCAvc2Vzc2lvbi5cclxuICAgIC8vICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIHVzZXIsIGNhbGwgb25TdWNjZXNzZnVsTG9naW4gd2l0aCB0aGUgcmVzcG9uc2UuXHJcbiAgICAvLyAgICAgICAgIC8vIElmIGl0IHJldHVybnMgYSA0MDEgcmVzcG9uc2UsIHdlIGNhdGNoIGl0IGFuZCBpbnN0ZWFkIHJlc29sdmUgdG8gbnVsbC5cclxuICAgIC8vICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL3Nlc3Npb24nKS50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKS5jYXRjaChmdW5jdGlvbigpIHtcclxuICAgIC8vICAgICAgICAgICAgIHJldHVybiBudWxsO1xyXG4gICAgLy8gICAgICAgICB9KTtcclxuXHJcbiAgICAvLyAgICAgfTtcclxuXHJcbiAgICAvLyAgICAgdGhpcy5sb2dpbiA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XHJcbiAgICAvLyAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvbG9naW4nLCBjcmVkZW50aWFscylcclxuICAgIC8vICAgICAgICAgICAgIC50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKVxyXG4gICAgLy8gICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xyXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICBtZXNzYWdlOiAnSW52YWxpZCBsb2dpbiBjcmVkZW50aWFscy4nXHJcbiAgICAvLyAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAvLyAgICAgICAgICAgICB9KTtcclxuICAgIC8vICAgICB9O1xyXG5cclxuICAgIC8vICAgICB0aGlzLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvbG9nb3V0JykudGhlbihmdW5jdGlvbigpIHtcclxuICAgIC8vICAgICAgICAgICAgIFNlc3Npb24uZGVzdHJveSgpO1xyXG4gICAgLy8gICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MpO1xyXG4gICAgLy8gICAgICAgICB9KTtcclxuICAgIC8vICAgICB9O1xyXG4gICAgLy8gfSk7XHJcblxyXG4gICAgLy8gYXBwLnNlcnZpY2UoJ1Nlc3Npb24nLCBmdW5jdGlvbigkcm9vdFNjb3BlLCBBVVRIX0VWRU5UUykge1xyXG5cclxuICAgIC8vICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcblxyXG4gICAgLy8gICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsIGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gICAgICAgICBzZWxmLmRlc3Ryb3koKTtcclxuICAgIC8vICAgICB9KTtcclxuXHJcbiAgICAvLyAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gICAgICAgICBzZWxmLmRlc3Ryb3koKTtcclxuICAgIC8vICAgICB9KTtcclxuXHJcbiAgICAvLyAgICAgdGhpcy5pZCA9IG51bGw7XHJcbiAgICAvLyAgICAgdGhpcy51c2VyID0gbnVsbDtcclxuXHJcbiAgICAvLyAgICAgdGhpcy5jcmVhdGUgPSBmdW5jdGlvbihzZXNzaW9uSWQsIHVzZXIpIHtcclxuICAgIC8vICAgICAgICAgdGhpcy5pZCA9IHNlc3Npb25JZDtcclxuICAgIC8vICAgICAgICAgdGhpcy51c2VyID0gdXNlcjtcclxuICAgIC8vICAgICB9O1xyXG5cclxuICAgIC8vICAgICB0aGlzLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vICAgICAgICAgdGhpcy5pZCA9IG51bGw7XHJcbiAgICAvLyAgICAgICAgIHRoaXMudXNlciA9IG51bGw7XHJcbiAgICAvLyAgICAgfTtcclxuXHJcbiAgICAvLyB9KTtcclxuXHJcbn0pKCk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhZG1pbicsIHtcclxuICAgIHVybDogJy9hZG1pbicsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2xvZ2luL2xvZ2luLmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ0FkbWluTG9naW5Db250cm9sbGVyJ1xyXG4gIH0pO1xyXG59KTtcclxuXHJcblxyXG5hcHAuY29udHJvbGxlcignQWRtaW5Mb2dpbkNvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsIEF1dGhTZXJ2aWNlLCBvRW1iZWRGYWN0b3J5KSB7XHJcbiAgJHNjb3BlLmNvdW50ZXIgPSAwO1xyXG4gICRzY29wZS5zaG93aW5nRWxlbWVudHMgPSBbXTtcclxuICAkc2NvcGUuc3VibWlzc2lvbnMgPSBbXTtcclxuXHJcbiAgJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2xvZ2luJywge1xyXG4gICAgICBwYXNzd29yZDogJHNjb3BlLnBhc3N3b3JkXHJcbiAgICB9KS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAkcm9vdFNjb3BlLnBhc3N3b3JkID0gJHNjb3BlLnBhc3N3b3JkO1xyXG4gICAgICAkc2NvcGUuc2hvd1N1Ym1pc3Npb25zID0gdHJ1ZTtcclxuICAgICAgJHNjb3BlLmxvYWRTdWJtaXNzaW9ucygpO1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIGFsZXJ0KCdXcm9uZyBQYXNzd29yZCcpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkaHR0cC5nZXQoJy9hcGkvbG9nb3V0JykudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2FkbWluJztcclxuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICBhbGVydCgnV3JvbmcgUGFzc3dvcmQnKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLm1hbmFnZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgXHJcbiAgICBTQy5jb25uZWN0KClcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgJHJvb3RTY29wZS5hY2Nlc3NUb2tlbiA9IHJlcy5vYXV0aF90b2tlbjtcclxuICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9sb2dpbi9hdXRoZW50aWNhdGVkJywge1xyXG4gICAgICAgICAgdG9rZW46IHJlcy5vYXV0aF90b2tlbixcclxuICAgICAgICAgIHBhc3N3b3JkOiAkcm9vdFNjb3BlLnBhc3N3b3JkLFxyXG4gICAgICAgIH0pXHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgJHJvb3RTY29wZS5zY2hlZHVsZXJJbmZvID0gcmVzLmRhdGE7XHJcbiAgICAgICAgJHJvb3RTY29wZS5zY2hlZHVsZXJJbmZvLmV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2KSB7XHJcbiAgICAgICAgICBldi5kYXkgPSBuZXcgRGF0ZShldi5kYXkpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgICRzdGF0ZS5nbygnc2NoZWR1bGVyJyk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgIGFsZXJ0KCdFcnJvcjogQ291bGQgbm90IGxvZyBpbicpO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxufSk7IiwiYXBwLmZhY3RvcnkoJ29FbWJlZEZhY3RvcnknLCBmdW5jdGlvbigpe1xyXG5cdHJldHVybiB7XHJcblx0XHRlbWJlZFNvbmc6IGZ1bmN0aW9uKHN1Yikge1xyXG5cdCAgICAgICAgcmV0dXJuIFNDLm9FbWJlZChcImh0dHA6Ly9hcGkuc291bmRjbG91ZC5jb20vdHJhY2tzL1wiICsgc3ViLnRyYWNrSUQsIHtcclxuXHQgICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc3ViLnRyYWNrSUQgKyBcInBsYXllclwiKSxcclxuXHQgICAgICAgICAgYXV0b19wbGF5OiBmYWxzZSxcclxuXHQgICAgICAgICAgbWF4aGVpZ2h0OiAxNTBcclxuXHQgICAgICAgIH0pO1xyXG5cdFx0fVxyXG5cdH07XHJcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncGF5Jywge1xyXG4gICAgdXJsOiAnL3BheS86c3VibWlzc2lvbklEJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvcGF5L3BheS5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdQYXlDb250cm9sbGVyJyxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgY2hhbm5lbHM6IGZ1bmN0aW9uKCRodHRwKSB7XHJcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9jaGFubmVscycpXHJcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgfSxcclxuICAgICAgc3VibWlzc2lvbjogZnVuY3Rpb24oJGh0dHAsICRzdGF0ZVBhcmFtcykge1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvc3VibWlzc2lvbnMvd2l0aElELycgKyAkc3RhdGVQYXJhbXMuc3VibWlzc2lvbklEKVxyXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgIH0sXHJcbiAgICAgIHRyYWNrOiBmdW5jdGlvbihzdWJtaXNzaW9uKSB7XHJcbiAgICAgICAgcmV0dXJuIFNDLmdldCgnL3RyYWNrcy8nICsgc3VibWlzc2lvbi50cmFja0lEKVxyXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24odHJhY2spIHtcclxuICAgICAgICAgICAgcmV0dXJuIHRyYWNrO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxufSk7XHJcblxyXG5hcHAuZmlsdGVyKCdjYWxjdWxhdGVEaXNjb3VudCcsIGZ1bmN0aW9uICgpXHJcbntcclxuICAgIHJldHVybiBmdW5jdGlvbiAoaW5wdXQpXHJcbiAgICB7XHJcbiAgICAgICAgcmV0dXJuIHBhcnNlRmxvYXQoaW5wdXQgKiAwLjkwKS50b0ZpeGVkKDIpO1xyXG4gICAgfTtcclxufSk7XHJcblxyXG5hcHAuY29udHJvbGxlcignUGF5Q29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHJvb3RTY29wZSwgJGh0dHAsIGNoYW5uZWxzLCBzdWJtaXNzaW9uLCB0cmFjaywgJHN0YXRlLCAkdWliTW9kYWwpIHtcclxuICAkcm9vdFNjb3BlLnN1Ym1pc3Npb24gPSBzdWJtaXNzaW9uO1xyXG4gICRzY29wZS5hdURMTGluayA9IGZhbHNlO1xyXG4gIGlmIChzdWJtaXNzaW9uLnBhaWQpICRzdGF0ZS5nbygnaG9tZScpO1xyXG4gICRzY29wZS50cmFjayA9IHRyYWNrO1xyXG4gIFNDLm9FbWJlZCh0cmFjay51cmksIHtcclxuICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLFxyXG4gICAgYXV0b19wbGF5OiBmYWxzZSxcclxuICAgIG1heGhlaWdodDogMTUwXHJcbiAgfSk7XHJcbiAgJHNjb3BlLnRvdGFsID0gMDtcclxuICAkc2NvcGUuY2hhbm5lbHMgPSBjaGFubmVscy5maWx0ZXIoZnVuY3Rpb24oY2gpIHtcclxuICAgIHJldHVybiAoc3VibWlzc2lvbi5jaGFubmVsSURTLmluZGV4T2YoY2guY2hhbm5lbElEKSAhPSAtMSlcclxuICB9KTtcclxuXHJcbiAgJHNjb3BlLmF1RExMaW5rID0gJHNjb3BlLnRyYWNrLnB1cmNoYXNlX3VybCA/ICgkc2NvcGUudHJhY2sucHVyY2hhc2VfdXJsLmluZGV4T2YoXCJhcnRpc3RzdW5saW1pdGVkLmNvXCIpICE9IC0xKSA6IGZhbHNlO1xyXG5cclxuICAkc2NvcGUuc2VsZWN0ZWRDaGFubmVscyA9IHt9O1xyXG4gICRzY29wZS5jaGFubmVscy5mb3JFYWNoKGZ1bmN0aW9uKGNoKSB7XHJcbiAgICAkc2NvcGUuc2VsZWN0ZWRDaGFubmVsc1tjaC5kaXNwbGF5TmFtZV0gPSBmYWxzZTtcclxuICB9KTtcclxuXHJcbiAgJHNjb3BlLmdvVG9Mb2dpbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHN0YXRlLmdvKCdsb2dpbicsIHtcclxuICAgICAgJ3N1Ym1pc3Npb24nOiAkcm9vdFNjb3BlLnN1Ym1pc3Npb25cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLnJlY2FsY3VsYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUudG90YWwgPSAwO1xyXG4gICAgJHNjb3BlLnRvdGFsUGF5bWVudCA9IDA7XHJcbiAgICBmb3IgKHZhciBrZXkgaW4gJHNjb3BlLnNlbGVjdGVkQ2hhbm5lbHMpIHtcclxuICAgICAgaWYgKCRzY29wZS5zZWxlY3RlZENoYW5uZWxzW2tleV0pIHtcclxuICAgICAgICB2YXIgY2hhbiA9ICRzY29wZS5jaGFubmVscy5maW5kKGZ1bmN0aW9uKGNoKSB7XHJcbiAgICAgICAgICByZXR1cm4gY2guZGlzcGxheU5hbWUgPT0ga2V5O1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgJHNjb3BlLnRvdGFsICs9IGNoYW4ucHJpY2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICgkc2NvcGUuYXVETExpbmspICRzY29wZS50b3RhbCA9IE1hdGguZmxvb3IoMC45ICogJHNjb3BlLnRvdGFsKTtcclxuICB9XHJcblxyXG4gICRzY29wZS5tYWtlUGF5bWVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCRzY29wZS50b3RhbCAhPSAwKSB7XHJcbiAgICAgIGlmICgkc2NvcGUuYXVETExpbmspIHtcclxuICAgICAgICAkc2NvcGUuZGlzY291bnRNb2RhbEluc3RhbmNlID0gJHVpYk1vZGFsLm9wZW4oe1xyXG4gICAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxyXG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICdkaXNjb3VudE1vZGFsLmh0bWwnLFxyXG4gICAgICAgICAgY29udHJvbGxlcjogJ2Rpc2NvdW50TW9kYWxDb250cm9sbGVyJyxcclxuICAgICAgICAgIHNjb3BlOiAkc2NvcGVcclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkc2NvcGUuY29udGludWVQYXkoZmFsc2UpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmNvbnRpbnVlUGF5ID0gZnVuY3Rpb24oZGlzY291bnRlZCkge1xyXG4gICAgaWYgKCRzY29wZS5kaXNjb3VudGVkTW9kYWwpIHtcclxuICAgICAgJHNjb3BlLmRpc2NvdW50TW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xyXG4gICAgfVxyXG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgdmFyIHByaWNpbmdPYmogPSB7XHJcbiAgICAgIGNoYW5uZWxzOiBbXSxcclxuICAgICAgZGlzY291bnRlZDogZGlzY291bnRlZCxcclxuICAgICAgc3VibWlzc2lvbjogJHJvb3RTY29wZS5zdWJtaXNzaW9uXHJcbiAgICB9O1xyXG4gICAgZm9yICh2YXIga2V5IGluICRzY29wZS5zZWxlY3RlZENoYW5uZWxzKSB7XHJcbiAgICAgIGlmICgkc2NvcGUuc2VsZWN0ZWRDaGFubmVsc1trZXldKSB7XHJcbiAgICAgICAgdmFyIGNoYW4gPSAkc2NvcGUuY2hhbm5lbHMuZmluZChmdW5jdGlvbihjaCkge1xyXG4gICAgICAgICAgcmV0dXJuIGNoLmRpc3BsYXlOYW1lID09IGtleTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIHByaWNpbmdPYmouY2hhbm5lbHMucHVzaChjaGFuLmNoYW5uZWxJRCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgICRodHRwLnBvc3QoJy9hcGkvc3VibWlzc2lvbnMvZ2V0UGF5bWVudCcsIHByaWNpbmdPYmopXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IHJlcy5kYXRhO1xyXG4gICAgICB9KVxyXG4gIH1cclxuICBcclxuICBcclxuICAgICRzY29wZS5hZGRUb0NhcnQgPSBmdW5jdGlvbiAoY2hhbm5lbClcclxuICAgIHtcclxuICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUuc2VsZWN0ZWRDaGFubmVscyk7XHJcbiAgICAgICAgaWYgKGNoYW5uZWwuYWRkdG9jYXJ0KVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgJHNjb3BlLnRvdGFsID0gJHNjb3BlLnRvdGFsIC0gY2hhbm5lbC5wcmljZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZWxzZVxyXG4gICAgICAgIHtcclxuICAgICAgICAgICAgJHNjb3BlLnRvdGFsICs9IGNoYW5uZWwucHJpY2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUuc2VsZWN0ZWRDaGFubmVsc1tjaGFubmVsLmRpc3BsYXlOYW1lXSA9ICRzY29wZS5zZWxlY3RlZENoYW5uZWxzW2NoYW5uZWwuZGlzcGxheU5hbWVdID09IHRydWUgPyBmYWxzZSA6IHRydWU7XHJcblxyXG4gICAgICAgIGNoYW5uZWwuYWRkdG9jYXJ0ID0gY2hhbm5lbC5hZGR0b2NhcnQgPyBmYWxzZSA6IHRydWU7XHJcbiAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLnRvdGFsKTtcclxuICAgIH07XHJcbiAgXHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ2Rpc2NvdW50TW9kYWxDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlKSB7XHJcblxyXG59KSIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnY29tcGxldGUnLCB7XHJcbiAgICB1cmw6ICcvY29tcGxldGUnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9wYXkvdGhhbmt5b3UuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnVGhhbmt5b3VDb250cm9sbGVyJ1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmFwcC5jb250cm9sbGVyKCdUaGFua3lvdUNvbnRyb2xsZXInLCBmdW5jdGlvbigkaHR0cCwgJHNjb3BlLCAkbG9jYXRpb24pIHtcclxuICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgJGh0dHAucHV0KCcvYXBpL3N1Ym1pc3Npb25zL2NvbXBsZXRlZFBheW1lbnQnLCAkbG9jYXRpb24uc2VhcmNoKCkpXHJcbiAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgJHNjb3BlLnN1Ym1pc3Npb24gPSByZXMuZGF0YS5zdWJtaXNzaW9uO1xyXG4gICAgICAkc2NvcGUuZXZlbnRzID0gcmVzLmRhdGEuZXZlbnRzO1xyXG4gICAgICAkc2NvcGUuZXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXYpIHtcclxuICAgICAgICBldi5kYXRlID0gbmV3IERhdGUoZXYuZGF0ZSk7XHJcbiAgICAgIH0pXHJcbiAgICB9KVxyXG4gICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKXtcclxuICAgICAgYWxlcnQoJ1RoZXJlIHdhcyBhbiBlcnJvciBwcm9jZXNzaW5nIHlvdXIgcmVxdWVzdCcpO1xyXG4gICAgfSlcclxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdzY2hlZHVsZXInLCB7XHJcbiAgICB1cmw6ICcvc2NoZWR1bGVyJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvc2NoZWR1bGVyL3NjaGVkdWxlci5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdTY2hlZHVsZXJDb250cm9sbGVyJ1xyXG4gIH0pO1xyXG59KTtcclxuXHJcblxyXG5hcHAuY29udHJvbGxlcignU2NoZWR1bGVyQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgQXV0aFNlcnZpY2UsICR3aW5kb3cpIHtcclxuXHJcbiAgJHNjb3BlLm1ha2VFdmVudFVSTCA9IFwiXCI7XHJcbiAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XHJcbiAgdmFyIGluZm8gPSAkcm9vdFNjb3BlLnNjaGVkdWxlckluZm87XHJcbiAgaWYgKCFpbmZvKSB7XHJcbiAgICAkc3RhdGUuZ28oJ2FkbWluJyk7XHJcbiAgfVxyXG4gICRzY29wZS5jaGFubmVsID0gaW5mby5jaGFubmVsO1xyXG4gICRzY29wZS5zdWJtaXNzaW9ucyA9IGluZm8uc3VibWlzc2lvbnM7XHJcblxyXG4gICRzY29wZS5jYWxlbmRhciA9IGZpbGxEYXRlQXJyYXlzKGluZm8uZXZlbnRzKTtcclxuICAkc2NvcGUuZGF5SW5jciA9IDA7XHJcblxyXG4gICRzY29wZS5iYWNrID0gZnVuY3Rpb24oKSB7XHJcbiAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XHJcblxyXG4gIH1cclxuXHJcbiAgJHNjb3BlLnNhdmVDaGFubmVsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAkc2NvcGUuY2hhbm5lbC5wYXNzd29yZCA9ICRyb290U2NvcGUucGFzc3dvcmQ7XHJcbiAgICAkaHR0cC5wdXQoXCIvYXBpL2NoYW5uZWxzXCIsICRzY29wZS5jaGFubmVsKVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICB3aW5kb3cuYWxlcnQoXCJTYXZlZFwiKTtcclxuICAgICAgICAkc2NvcGUuY2hhbm5lbCA9IHJlcy5kYXRhO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgIHdpbmRvdy5hbGVydChcIkVycm9yOiBkaWQgbm90IHNhdmVcIik7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuaW5jckRheSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCRzY29wZS5kYXlJbmNyIDwgMTQpICRzY29wZS5kYXlJbmNyKys7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuZGVjckRheSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCRzY29wZS5kYXlJbmNyID4gMCkgJHNjb3BlLmRheUluY3ItLTtcclxuICB9XHJcblxyXG4gICRzY29wZS5jbGlja2VkU2xvdCA9IGZ1bmN0aW9uKGRheSwgaG91cikge1xyXG4gICAgdmFyIHRvZGF5ID0gbmV3IERhdGUoKTtcclxuICAgIGlmICh0b2RheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSBkYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgJiYgdG9kYXkuZ2V0SG91cnMoKSA+IGhvdXIpIHJldHVybjtcclxuICAgICRzY29wZS5zaG93T3ZlcmxheSA9IHRydWU7XHJcbiAgICB2YXIgY2FsRGF5ID0ge307XHJcbiAgICB2YXIgY2FsZW5kYXJEYXkgPSAkc2NvcGUuY2FsZW5kYXIuZmluZChmdW5jdGlvbihjYWxEKSB7XHJcbiAgICAgIHJldHVybiBjYWxELmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSBkYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XHJcbiAgICB9KTtcclxuICAgICRzY29wZS5tYWtlRXZlbnRVUkwgPSB1bmRlZmluZWQ7XHJcbiAgICAkc2NvcGUubWFrZUV2ZW50ID0gY2FsZW5kYXJEYXkuZXZlbnRzW2hvdXJdO1xyXG4gICAgaWYgKCRzY29wZS5tYWtlRXZlbnQgPT0gXCItXCIpIHtcclxuICAgICAgdmFyIG1ha2VEYXkgPSBuZXcgRGF0ZShkYXkpO1xyXG4gICAgICBtYWtlRGF5LnNldEhvdXJzKGhvdXIpO1xyXG4gICAgICAkc2NvcGUubWFrZUV2ZW50ID0ge1xyXG4gICAgICAgIGNoYW5uZWxJRDogJHNjb3BlLmNoYW5uZWwuY2hhbm5lbElELFxyXG4gICAgICAgIGRheTogbWFrZURheSxcclxuICAgICAgICBwYWlkOiBmYWxzZVxyXG4gICAgICB9O1xyXG4gICAgICAkc2NvcGUubmV3RXZlbnQgPSB0cnVlO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJHNjb3BlLm1ha2VFdmVudFVSTCA9ICdodHRwczovL2FwaS5zb3VuZGNsb3VkLmNvbS90cmFja3MvJyArICRzY29wZS5tYWtlRXZlbnQudHJhY2tJRDtcclxuICAgICAgU0Mub0VtYmVkKCdodHRwczovL2FwaS5zb3VuZGNsb3VkLmNvbS90cmFja3MvJyArICRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCwge1xyXG4gICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLFxyXG4gICAgICAgIGF1dG9fcGxheTogZmFsc2UsXHJcbiAgICAgICAgbWF4aGVpZ2h0OiAxNTBcclxuICAgICAgfSk7XHJcbiAgICAgICRzY29wZS5uZXdFdmVudCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmNoYW5nZVBhaWQgPSBmdW5jdGlvbigpIHtcclxuICAgICRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCA9IHVuZGVmaW5lZDtcclxuICAgICRzY29wZS5tYWtlRXZlbnRVUkwgPSB1bmRlZmluZWQ7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuY2hhbmdlVVJMID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIHtcclxuICAgICAgICB1cmw6ICRzY29wZS5tYWtlRXZlbnRVUkxcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC50cmFja0lEID0gcmVzLmRhdGEuaWQ7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC50aXRsZSA9IHJlcy5kYXRhLnRpdGxlO1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQudHJhY2tVUkwgPSByZXMuZGF0YS50cmFja1VSTDtcclxuICAgICAgICBpZiAocmVzLmRhdGEudXNlcikgJHNjb3BlLm1ha2VFdmVudC5hcnRpc3ROYW1lID0gcmVzLmRhdGEudXNlci51c2VybmFtZTtcclxuICAgICAgICBTQy5vRW1iZWQoJHNjb3BlLm1ha2VFdmVudFVSTCwge1xyXG4gICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUGxheWVyJyksXHJcbiAgICAgICAgICBhdXRvX3BsYXk6IGZhbHNlLFxyXG4gICAgICAgICAgbWF4aGVpZ2h0OiAxNTBcclxuICAgICAgICB9KVxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcclxuICAgICAgICAkc2NvcGUubm90Rm91bmQgPSBmYWxzZTtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICB9KS50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xyXG4gICAgICAgICRzY29wZS5ub3RGb3VuZCA9IHRydWU7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuZGVsZXRlRXZlbnQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICghJHNjb3BlLm5ld0V2ZW50KSB7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgJGh0dHAuZGVsZXRlKCcvYXBpL2V2ZW50cy8nICsgJHNjb3BlLm1ha2VFdmVudC5faWQgKyAnLycgKyAkcm9vdFNjb3BlLnBhc3N3b3JkKVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgdmFyIGNhbGVuZGFyRGF5ID0gJHNjb3BlLmNhbGVuZGFyLmZpbmQoZnVuY3Rpb24oY2FsRCkge1xyXG4gICAgICAgICAgICByZXR1cm4gY2FsRC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gJHNjb3BlLm1ha2VFdmVudC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIGNhbGVuZGFyRGF5LmV2ZW50c1skc2NvcGUubWFrZUV2ZW50LmRheS5nZXRIb3VycygpXSA9IFwiLVwiO1xyXG4gICAgICAgICAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgd2luZG93LmFsZXJ0KFwiRGVsZXRlZFwiKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIHdpbmRvdy5hbGVydChcIkVSUk9SOiBkaWQgbm90IERlbGV0ZS5cIilcclxuICAgICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHZhciBjYWxlbmRhckRheSA9ICRzY29wZS5jYWxlbmRhci5maW5kKGZ1bmN0aW9uKGNhbEQpIHtcclxuICAgICAgICByZXR1cm4gY2FsRC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gJHNjb3BlLm1ha2VFdmVudC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICBjYWxlbmRhckRheS5ldmVudHNbJHNjb3BlLm1ha2VFdmVudC5nZXRIb3VycygpXSA9IFwiLVwiO1xyXG4gICAgICB2YXIgZXZlbnRzXHJcbiAgICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgJHNjb3BlLnNhdmVFdmVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCEkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQgJiYgISRzY29wZS5tYWtlRXZlbnQucGFpZCkge1xyXG4gICAgICB3aW5kb3cuYWxlcnQoXCJFbnRlciBhIHRyYWNrIFVSTFwiKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICgkc2NvcGUubmV3RXZlbnQpIHtcclxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnBhc3N3b3JkID0gJHJvb3RTY29wZS5wYXNzd29yZDtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgJGh0dHAucG9zdCgnL2FwaS9ldmVudHMnLCAkc2NvcGUubWFrZUV2ZW50KVxyXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgIHZhciBldmVudCA9IHJlcy5kYXRhO1xyXG4gICAgICAgICAgICBldmVudC5kYXkgPSBuZXcgRGF0ZShldmVudC5kYXkpO1xyXG4gICAgICAgICAgICB2YXIgY2FsZW5kYXJEYXkgPSAkc2NvcGUuY2FsZW5kYXIuZmluZChmdW5jdGlvbihjYWxEKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGNhbEQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09IGV2ZW50LmRheS50b0xvY2FsZURhdGVTdHJpbmcoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNhbGVuZGFyRGF5LmV2ZW50c1tldmVudC5kYXkuZ2V0SG91cnMoKV0gPSBldmVudDtcclxuICAgICAgICAgICAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHdpbmRvdy5hbGVydChcIlNhdmVkXCIpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJFUlJPUjogZGlkIG5vdCBTYXZlLlwiKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICRzY29wZS5uZXdFdmVudC5wYXNzd29yZCA9ICRyb290U2NvcGUucGFzc3dvcmQ7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAgICRodHRwLnB1dCgnL2FwaS9ldmVudHMnLCAkc2NvcGUubWFrZUV2ZW50KVxyXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgIHZhciBldmVudCA9IHJlcy5kYXRhO1xyXG4gICAgICAgICAgICBldmVudC5kYXkgPSBuZXcgRGF0ZShldmVudC5kYXkpO1xyXG4gICAgICAgICAgICB2YXIgY2FsZW5kYXJEYXkgPSAkc2NvcGUuY2FsZW5kYXIuZmluZChmdW5jdGlvbihjYWxEKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIGNhbEQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09IGV2ZW50LmRheS50b0xvY2FsZURhdGVTdHJpbmcoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIGNhbGVuZGFyRGF5LmV2ZW50c1tldmVudC5nZXRIb3VycygpXSA9IGV2ZW50O1xyXG4gICAgICAgICAgICAkc2NvcGUuc2hvd092ZXJsYXkgPSBmYWxzZTtcclxuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgd2luZG93LmFsZXJ0KFwiU2F2ZWRcIik7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIHdpbmRvdy5hbGVydChcIkVSUk9SOiBkaWQgbm90IFNhdmUuXCIpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcblxyXG4gICRzY29wZS5lbWFpbFNsb3QgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBtYWlsdG9fbGluayA9IFwibWFpbHRvOmNvYXlzY3VlQGdtYWlsLmNvbT9zdWJqZWN0PVJlcG9zdCBvZiBcIiArICRzY29wZS5tYWtlRXZlbnQudGl0bGUgKyAnJmJvZHk9SGV5ICcgKyAkc2NvcGUubWFrZUV2ZW50LmFydGlzdE5hbWUgKyAnLFxcblxcbiBJIGFtIHJlcG9zdGluZyB5b3VyIHNvbmcgJyArICRzY29wZS5tYWtlRXZlbnQudGl0bGUgKyAnIG9uICcgKyAkc2NvcGUuY2hhbm5lbC5kaXNwbGF5TmFtZSArICcgb24gJyArICRzY29wZS5tYWtlRXZlbnQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpICsgJy5cXG5cXG4gQmVzdCwgXFxuJyArICRzY29wZS5jaGFubmVsLmRpc3BsYXlOYW1lO1xyXG4gICAgbG9jYXRpb24uaHJlZiA9IGVuY29kZVVSSShtYWlsdG9fbGluayk7XHJcbiAgfVxyXG5cclxuICAvLyAkc2NvcGUuc2NFbWFpbFNsb3QgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgLy8gfVxyXG5cclxuICAkc2NvcGUuYmFja0V2ZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUubWFrZUV2ZW50ID0gbnVsbDtcclxuICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLnJlbW92ZVF1ZXVlU29uZyA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAkc2NvcGUuY2hhbm5lbC5xdWV1ZS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgJHNjb3BlLnNhdmVDaGFubmVsKCk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuYWRkU29uZyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCRzY29wZS5jaGFubmVsLnF1ZXVlLmluZGV4T2YoJHNjb3BlLm5ld1F1ZXVlSUQpICE9IC0xKSByZXR1cm47XHJcbiAgICAkc2NvcGUuY2hhbm5lbC5xdWV1ZS5wdXNoKCRzY29wZS5uZXdRdWV1ZUlEKTtcclxuICAgICRzY29wZS5zYXZlQ2hhbm5lbCgpO1xyXG4gICAgJHNjb3BlLm5ld1F1ZXVlU29uZyA9IHVuZGVmaW5lZDtcclxuICAgICRzY29wZS5jaGFuZ2VRdWV1ZVNvbmcoKTtcclxuICAgICRzY29wZS5sb2FkUXVldWVTb25ncyhbJHNjb3BlLm5ld1F1ZXVlSURdKTtcclxuICB9XHJcblxyXG4gICRzY29wZS5jaGFuZ2VRdWV1ZVNvbmcgPSBmdW5jdGlvbigpIHtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICRodHRwLnBvc3QoJy9hcGkvc291bmRjbG91ZC9yZXNvbHZlJywge1xyXG4gICAgICAgIHVybDogJHNjb3BlLm5ld1F1ZXVlU29uZ1xyXG4gICAgICB9KVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIHZhciB0cmFjayA9IHJlcy5kYXRhO1xyXG4gICAgICAgICRzY29wZS5uZXdRdWV1ZUlEID0gdHJhY2suaWQ7XHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgIGFsZXJ0KFwiZXJyb3IgZ2V0dGluZyBzb25nXCIpO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLm1vdmVVcCA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICBpZiAoaW5kZXggPT0gMCkgcmV0dXJuO1xyXG4gICAgdmFyIHMgPSAkc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleF07XHJcbiAgICAkc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleF0gPSAkc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleCAtIDFdO1xyXG4gICAgJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXggLSAxXSA9IHM7XHJcbiAgICAkc2NvcGUuc2F2ZUNoYW5uZWwoKTtcclxuICAgICRzY29wZS5sb2FkUXVldWVTb25ncyhbJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXhdLCAkc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleCAtIDFdXSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUubW92ZURvd24gPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgaWYgKGluZGV4ID09ICRzY29wZS5jaGFubmVsLnF1ZXVlLmxlbmd0aCAtIDEpIHJldHVybjtcclxuICAgIHZhciBzID0gJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXhdO1xyXG4gICAgJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXhdID0gJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXggKyAxXTtcclxuICAgICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4ICsgMV0gPSBzO1xyXG4gICAgJHNjb3BlLnNhdmVDaGFubmVsKCk7XHJcbiAgICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MoWyRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4XSwgJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXggKyAxXV0pO1xyXG4gIH1cclxuXHJcbiAgLy8gJHNjb3BlLmNhbkxvd2VyT3BlbkV2ZW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gIC8vICAgdmFyIHdhaXRpbmdTdWJzID0gJHNjb3BlLnN1Ym1pc3Npb25zLmZpbHRlcihmdW5jdGlvbihzdWIpIHtcclxuICAvLyAgICAgcmV0dXJuIHN1Yi5pbnZvaWNlSUQ7XHJcbiAgLy8gICB9KTtcclxuICAvLyAgIHZhciBvcGVuU2xvdHMgPSBbXTtcclxuICAvLyAgICRzY29wZS5jYWxlbmRhci5mb3JFYWNoKGZ1bmN0aW9uKGRheSkge1xyXG4gIC8vICAgICBkYXkuZXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXYpIHtcclxuICAvLyAgICAgICBpZiAoZXYucGFpZCAmJiAhZXYudHJhY2tJRCkgb3BlblNsb3RzLnB1c2goZXYpO1xyXG4gIC8vICAgICB9KTtcclxuICAvLyAgIH0pO1xyXG4gIC8vICAgdmFyIG9wZW5OdW0gPSBvcGVuU2xvdHMubGVuZ3RoIC0gd2FpdGluZ1N1YnMubGVuZ3RoO1xyXG4gIC8vICAgcmV0dXJuIG9wZW5OdW0gPiAwO1xyXG4gIC8vIH1cclxuXHJcbiAgJHNjb3BlLmxvYWRTdWJtaXNzaW9ucyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgJHNjb3BlLnN1Ym1pc3Npb25zLmZvckVhY2goZnVuY3Rpb24oc3ViKSB7XHJcbiAgICAgICAgU0Mub0VtYmVkKFwiaHR0cDovL2FwaS5zb3VuZGNsb3VkLmNvbS90cmFja3MvXCIgKyBzdWIudHJhY2tJRCwge1xyXG4gICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc3ViLnRyYWNrSUQgKyBcInBsYXllclwiKSxcclxuICAgICAgICAgIGF1dG9fcGxheTogZmFsc2UsXHJcbiAgICAgICAgICBtYXhoZWlnaHQ6IDE1MFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH0sIDUwKTtcclxuICB9XHJcblxyXG4gICRzY29wZS5sb2FkUXVldWVTb25ncyA9IGZ1bmN0aW9uKHF1ZXVlKSB7XHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICBxdWV1ZS5mb3JFYWNoKGZ1bmN0aW9uKHNvbmdJRCkge1xyXG4gICAgICAgIFNDLm9FbWJlZChcImh0dHA6Ly9hcGkuc291bmRjbG91ZC5jb20vdHJhY2tzL1wiICsgc29uZ0lELCB7XHJcbiAgICAgICAgICBlbGVtZW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzb25nSUQgKyBcInBsYXllclwiKSxcclxuICAgICAgICAgIGF1dG9fcGxheTogZmFsc2UsXHJcbiAgICAgICAgICBtYXhoZWlnaHQ6IDE1MFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH0sIDUwKTtcclxuICB9XHJcbiAgaWYgKCRzY29wZS5jaGFubmVsICYmICRzY29wZS5jaGFubmVsLnF1ZXVlKSB7XHJcbiAgICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MoJHNjb3BlLmNoYW5uZWwucXVldWUpO1xyXG4gIH1cclxuICAkc2NvcGUubG9hZFN1Ym1pc3Npb25zKCk7XHJcblxyXG59KTtcclxuXHJcbmZ1bmN0aW9uIGZpbGxEYXRlQXJyYXlzKGV2ZW50cykge1xyXG4gIHZhciBjYWxlbmRhciA9IFtdO1xyXG4gIHZhciB0b2RheSA9IG5ldyBEYXRlKCk7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAyMTsgaSsrKSB7XHJcbiAgICB2YXIgY2FsRGF5ID0ge307XHJcbiAgICBjYWxEYXkuZGF5ID0gbmV3IERhdGUoKVxyXG4gICAgY2FsRGF5LmRheS5zZXREYXRlKHRvZGF5LmdldERhdGUoKSArIGkpO1xyXG4gICAgdmFyIGRheUV2ZW50cyA9IGV2ZW50cy5maWx0ZXIoZnVuY3Rpb24oZXYpIHtcclxuICAgICAgcmV0dXJuIChldi5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gY2FsRGF5LmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSk7XHJcbiAgICB9KTtcclxuICAgIHZhciBldmVudEFycmF5ID0gW107XHJcbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IDI0OyBqKyspIHtcclxuICAgICAgZXZlbnRBcnJheVtqXSA9IFwiLVwiO1xyXG4gICAgfVxyXG4gICAgZGF5RXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXYpIHtcclxuICAgICAgZXZlbnRBcnJheVtldi5kYXkuZ2V0SG91cnMoKV0gPSBldjtcclxuICAgIH0pO1xyXG4gICAgY2FsRGF5LmV2ZW50cyA9IGV2ZW50QXJyYXk7XHJcbiAgICBjYWxlbmRhci5wdXNoKGNhbERheSk7XHJcbiAgfVxyXG4gIHJldHVybiBjYWxlbmRhcjtcclxufSIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnc3VibWl0U29uZycsIHtcclxuICAgIHVybDogJy9zdWJtaXQnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9zdWJtaXQvc3VibWl0LnZpZXcuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnU3VibWl0U29uZ0NvbnRyb2xsZXInXHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ1N1Ym1pdFNvbmdDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwKSB7XHJcblxyXG4gICRzY29wZS5zdWJtaXNzaW9uID0ge307XHJcblxyXG4gICRzY29wZS51cmxDaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICRodHRwLnBvc3QoJy9hcGkvc291bmRjbG91ZC9yZXNvbHZlJywge1xyXG4gICAgICAgIHVybDogJHNjb3BlLnVybFxyXG4gICAgICB9KVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAkc2NvcGUuc3VibWlzc2lvbi50cmFja0lEID0gcmVzLmRhdGEuaWQ7XHJcbiAgICAgICAgJHNjb3BlLnN1Ym1pc3Npb24udGl0bGUgPSByZXMuZGF0YS50aXRsZTtcclxuICAgICAgICAkc2NvcGUuc3VibWlzc2lvbi50cmFja1VSTCA9IHJlcy5kYXRhLnRyYWNrVVJMO1xyXG4gICAgICAgIFNDLm9FbWJlZCgkc2NvcGUuc3VibWlzc2lvbi50cmFja1VSTCwge1xyXG4gICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUGxheWVyJyksXHJcbiAgICAgICAgICBhdXRvX3BsYXk6IGZhbHNlLFxyXG4gICAgICAgICAgbWF4aGVpZ2h0OiAxNTBcclxuICAgICAgICB9KVxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICRzY29wZS5ub3RGb3VuZCA9IGZhbHNlO1xyXG4gICAgICB9KS50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrSUQgPSBudWxsO1xyXG4gICAgICAgICRzY29wZS5ub3RGb3VuZCA9IHRydWU7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuc3VibWl0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoISRzY29wZS5zdWJtaXNzaW9uLmVtYWlsIHx8ICEkc2NvcGUuc3VibWlzc2lvbi5uYW1lKSB7XHJcbiAgICAgIGFsZXJ0KFwiUGxlYXNlIGZpbGwgaW4gYWxsIGZpZWxkc1wiKVxyXG4gICAgfSBlbHNlIGlmICghJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tJRCkge1xyXG4gICAgICBhbGVydChcIlRyYWNrIE5vdCBGb3VuZFwiKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgJGh0dHAucG9zdCgnL2FwaS9zdWJtaXNzaW9ucycsIHtcclxuICAgICAgICAgIGVtYWlsOiAkc2NvcGUuc3VibWlzc2lvbi5lbWFpbCxcclxuICAgICAgICAgIHRyYWNrSUQ6ICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrSUQsXHJcbiAgICAgICAgICBuYW1lOiAkc2NvcGUuc3VibWlzc2lvbi5uYW1lLFxyXG4gICAgICAgICAgdGl0bGU6ICRzY29wZS5zdWJtaXNzaW9uLnRpdGxlLFxyXG4gICAgICAgICAgdHJhY2tVUkw6ICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrVVJMLFxyXG4gICAgICAgICAgY2hhbm5lbElEUzogW10sXHJcbiAgICAgICAgICBpbnZvaWNlSURTOiBbXVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICBjb25zb2xlLmxvZyhyZXMuZGF0YSk7XHJcbiAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJZb3VyIHNvbmcgaGFzIGJlZW4gc3VibWl0dGVkIGFuZCB3aWxsIGJlIHJldmlld2VkIHNvb24uXCIpO1xyXG4gICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJFcnJvcjogQ291bGQgbm90IHN1Ym1pdCBzb25nLlwiKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlclxyXG4gICAgLnN0YXRlKCdsb2dpbicsIHtcclxuICAgICAgdXJsOiAnL2xvZ2luJyxcclxuICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgc3VibWlzc2lvbjogbnVsbFxyXG4gICAgICB9LFxyXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2F1dGgvdmlld3MvbG9naW4uaHRtbCcsXHJcbiAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ29udHJvbGxlcidcclxuICAgIH0pXHJcbiAgICAuc3RhdGUoJ3NpZ251cCcsIHtcclxuICAgICAgdXJsOiAnL3NpZ251cCcsXHJcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvYXV0aC92aWV3cy9zaWdudXAuaHRtbCcsXHJcbiAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ29udHJvbGxlcidcclxuICAgIH0pO1xyXG59KTtcclxuXHJcbmFwcC5jb250cm9sbGVyKCdBdXRoQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCAkc2NvcGUsICRodHRwLCAkdWliTW9kYWwsICR3aW5kb3csIEF1dGhTZXJ2aWNlLCBTZXNzaW9uU2VydmljZSwgc29ja2V0KSB7XHJcbiAgJHNjb3BlLmxvZ2luT2JqID0ge307XHJcbiAgJHNjb3BlLm1lc3NhZ2UgPSB7XHJcbiAgICB2YWw6ICcnLFxyXG4gICAgdmlzaWJsZTogZmFsc2VcclxuICB9O1xyXG4gICRzY29wZS5vcGVuTW9kYWwgPSB7XHJcbiAgICBzaWdudXBDb25maXJtOiBmdW5jdGlvbigpIHtcclxuICAgICAgJHNjb3BlLm1vZGFsSW5zdGFuY2UgPSAkdWliTW9kYWwub3Blbih7XHJcbiAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnc2lnbnVwQ29tcGxldGUuaHRtbCcsXHJcbiAgICAgICAgY29udHJvbGxlcjogJ0F1dGhDb250cm9sbGVyJyxcclxuICAgICAgICBzY29wZTogJHNjb3BlXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUubWVzc2FnZSA9IHtcclxuICAgICAgdmFsOiAnJyxcclxuICAgICAgdmlzaWJsZTogZmFsc2VcclxuICAgIH07XHJcbiAgICBBdXRoU2VydmljZVxyXG4gICAgICAubG9naW4oJHNjb3BlLmxvZ2luT2JqKVxyXG4gICAgICAudGhlbihoYW5kbGVMb2dpblJlc3BvbnNlKVxyXG4gICAgICAuY2F0Y2goaGFuZGxlTG9naW5FcnJvcilcclxuXHJcbiAgICBmdW5jdGlvbiBoYW5kbGVMb2dpblJlc3BvbnNlKHJlcykge1xyXG4gICAgICBpZiAocmVzLnN0YXR1cyA9PT0gMjAwICYmIHJlcy5kYXRhLnN1Y2Nlc3MpIHtcclxuICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUocmVzLmRhdGEudXNlcik7XHJcbiAgICAgICAgJHN0YXRlLmdvKCdhcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheUxpc3QnKTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkc2NvcGUubWVzc2FnZSA9IHtcclxuICAgICAgICAgIHZhbDogcmVzLmRhdGEubWVzc2FnZSxcclxuICAgICAgICAgIHZpc2libGU6IHRydWVcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaGFuZGxlTG9naW5FcnJvcihyZXMpIHtcclxuICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XHJcbiAgICAgICAgdmFsOiAnRXJyb3IgaW4gcHJvY2Vzc2luZyB5b3VyIHJlcXVlc3QnLFxyXG4gICAgICAgIHZpc2libGU6IHRydWVcclxuICAgICAgfTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAkc2NvcGUuY2hlY2tJZlN1Ym1pc3Npb24gPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICgkc3RhdGVQYXJhbXMuc3VibWlzc2lvbikge1xyXG4gICAgICAkc2NvcGUuc291bmRjbG91ZExvZ2luKCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuXHJcbiAgJHNjb3BlLnNpZ251cCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLm1lc3NhZ2UgPSB7XHJcbiAgICAgIHZhbDogJycsXHJcbiAgICAgIHZpc2libGU6IGZhbHNlXHJcbiAgICB9O1xyXG4gICAgaWYgKCRzY29wZS5zaWdudXBPYmoucGFzc3dvcmQgIT0gJHNjb3BlLnNpZ251cE9iai5jb25maXJtUGFzc3dvcmQpIHtcclxuICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XHJcbiAgICAgICAgdmFsOiAnUGFzc3dvcmQgZG9lc25cXCd0IG1hdGNoIHdpdGggY29uZmlybSBwYXNzd29yZCcsXHJcbiAgICAgICAgdmlzaWJsZTogdHJ1ZVxyXG4gICAgICB9O1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICBBdXRoU2VydmljZVxyXG4gICAgICAuc2lnbnVwKCRzY29wZS5zaWdudXBPYmopXHJcbiAgICAgIC50aGVuKGhhbmRsZVNpZ251cFJlc3BvbnNlKVxyXG4gICAgICAuY2F0Y2goaGFuZGxlU2lnbnVwRXJyb3IpXHJcblxyXG4gICAgZnVuY3Rpb24gaGFuZGxlU2lnbnVwUmVzcG9uc2UocmVzKSB7XHJcbiAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBoYW5kbGVTaWdudXBFcnJvcihyZXMpIHt9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLnNvdW5kY2xvdWRMb2dpbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgU0MuY29ubmVjdCgpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICRyb290U2NvcGUuYWNjZXNzVG9rZW4gPSByZXMub2F1dGhfdG9rZW47XHJcbiAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvbG9naW4vc291bmRDbG91ZExvZ2luJywge1xyXG4gICAgICAgICAgdG9rZW46IHJlcy5vYXV0aF90b2tlbixcclxuICAgICAgICAgIHBhc3N3b3JkOiAndGVzdCdcclxuICAgICAgICB9KTtcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUocmVzLmRhdGEudXNlcik7XHJcbiAgICAgICAgaWYgKCRzdGF0ZVBhcmFtcy5zdWJtaXNzaW9uKSB7XHJcbiAgICAgICAgICAkc3RhdGUuZ28oJ2FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5TmV3Jywge1xyXG4gICAgICAgICAgICAnc3VibWlzc2lvbic6ICRzdGF0ZVBhcmFtcy5zdWJtaXNzaW9uXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgJHN0YXRlLmdvKCdhcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheUxpc3QnKTtcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgICBhbGVydCgnRXJyb3I6IENvdWxkIG5vdCBsb2cgaW4nKTtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICB9KTtcclxuICB9O1xyXG59KTsiLCJhcHAuZmFjdG9yeSgnQXV0aFNlcnZpY2UnLCBbJyRodHRwJywgZnVuY3Rpb24oJGh0dHApe1xyXG5cdFxyXG5cdGZ1bmN0aW9uIGxvZ2luKGRhdGEpIHtcclxuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2xvZ2luJywgZGF0YSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzaWdudXAoZGF0YSkge1xyXG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvc2lnbnVwJywgZGF0YSk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4ge1xyXG5cdFx0bG9naW46IGxvZ2luLFxyXG5cdFx0c2lnbnVwOiBzaWdudXBcclxuXHR9O1xyXG59XSk7XHJcbiIsIlxyXG5cclxuYXBwLmZhY3RvcnkoJ1Nlc3Npb25TZXJ2aWNlJywgWyckY29va2llcycsIGZ1bmN0aW9uKCRjb29raWVzKSB7XHJcblx0XHJcblx0ZnVuY3Rpb24gY3JlYXRlKGRhdGEpIHtcclxuXHRcdCRjb29raWVzLnB1dE9iamVjdCgndXNlcicsIGRhdGEpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZGVsZXRlVXNlcigpIHtcclxuXHRcdCRjb29raWVzLnJlbW92ZSgndXNlcicpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2V0VXNlcigpIHtcclxuXHRcdHJldHVybiAkY29va2llcy5nZXQoJ3VzZXInKTtcclxuXHR9XHJcblxyXG5cdHJldHVybiB7XHJcblx0XHRjcmVhdGU6IGNyZWF0ZSxcclxuXHRcdGRlbGV0ZVVzZXI6IGRlbGV0ZVVzZXIsXHJcblx0XHRnZXRVc2VyOiBnZXRVc2VyXHJcblx0fTtcclxufV0pO1xyXG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XHJcbiAgICAkc3RhdGVQcm92aWRlclxyXG4gICAgICAgIC5zdGF0ZSgnU0NSZXNvbHZlJywge1xyXG4gICAgICAgICAgICB1cmw6ICcvc2NyZXNvbHZlJyxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hcnRpc3RUb29scy9TQ1Jlc29sdmUvU0NSZXNvbHZlLmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnU0NSZXNvbHZlQ29udHJvbGxlcidcclxuICAgICAgICB9KVxyXG59KTtcclxuXHJcbmFwcC5jb250cm9sbGVyKCdTQ1Jlc29sdmVDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCkge1xyXG4gICAgJHNjb3BlLnJlc3BvbnNlID0ge307XHJcbiAgICAkc2NvcGUucmVzb2x2ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRodHRwLnBvc3QoJy9hcGkvc291bmRjbG91ZC9yZXNvbHZlJywge1xyXG4gICAgICAgICAgICAgICAgdXJsOiAkc2NvcGUudXJsXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnJlc3BvbnNlID0gSlNPTi5zdHJpbmdpZnkocmVzLmRhdGEsIG51bGwsIFwiXFx0XCIpO1xyXG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLnJlc3BvbnNlKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUucmVzcG9uc2UgPSBKU09OLnN0cmluZ2lmeShlcnIsIG51bGwsIFwiXFx0XCIpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgfVxyXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XHJcblx0JHN0YXRlUHJvdmlkZXJcclxuXHQuc3RhdGUoJ3JlRm9yUmVJbnRlcmFjdGlvbicsIHtcclxuXHRcdHVybDogJy9hcnRpc3RUb29scy9yZUZvclJlSW50ZXJhY3Rpb24nLFxyXG5cdFx0cGFyYW1zOiB7XHJcblx0XHRcdHN1Ym1pc3Npb246IG51bGxcclxuXHRcdH0sXHJcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2FydGlzdFRvb2xzL3JlRm9yUmUvcmVGb3JSZUludGVyYWN0aW9uLmh0bWwnLFxyXG5cdFx0Y29udHJvbGxlcjogJ1JlRm9yUmVJbnRlcmFjdGlvbkNvbnRyb2xsZXInXHJcblx0fSlcclxufSk7XHJcblxyXG5cclxuYXBwLmNvbnRyb2xsZXIoXCJSZUZvclJlSW50ZXJhY3Rpb25Db250cm9sbGVyXCIsIGZ1bmN0aW9uKCkge1xyXG5cclxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhdXRvRW1haWxzTmV3Jywge1xyXG4gICAgdXJsOiAnL2FkbWluL2RhdGFiYXNlL2F1dG9FbWFpbHMvbmV3JyxcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvZGF0YWJhc2UvYXV0b0VtYWlscy9hdXRvRW1haWxzLmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ0F1dG9FbWFpbHNDb250cm9sbGVyJ1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYXV0b0VtYWlsc0VkaXQnLCB7XHJcbiAgICB1cmw6ICcvYWRtaW4vZGF0YWJhc2UvYXV0b0VtYWlscy9lZGl0Lzp0ZW1wbGF0ZUlkJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvZGF0YWJhc2UvYXV0b0VtYWlscy9hdXRvRW1haWxzLmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ0F1dG9FbWFpbHNDb250cm9sbGVyJyxcclxuICAgIC8vIHJlc29sdmU6IHtcclxuICAgIC8vICAgdGVtcGxhdGU6IGZ1bmN0aW9uKCRodHRwKSB7XHJcbiAgICAvLyAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9kYXRhYmFzZS9hdXRvRW1haWxzL2Jpd2Vla2x5P2lzQXJ0aXN0PXRydWUnKVxyXG4gICAgLy8gICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAvLyAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IHJlcy5kYXRhO1xyXG4gICAgLy8gICAgICAgICBpZiAodGVtcGxhdGUpIHtcclxuICAgIC8vICAgICAgICAgICByZXR1cm4gdGVtcGxhdGU7XHJcbiAgICAvLyAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAvLyAgICAgICAgICAgcmV0dXJuIHtcclxuICAgIC8vICAgICAgICAgICAgIHB1cnBvc2U6IFwiQml3ZWVrbHkgRW1haWxcIlxyXG4gICAgLy8gICAgICAgICAgIH1cclxuICAgIC8vICAgICAgICAgfVxyXG4gICAgLy8gICAgICAgfSlcclxuICAgIC8vICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgLy8gICAgICAgICBhbGVydChcIkVSUk9SOiBTb21ldGhpbmcgd2VudCB3cm9uZy5cIik7XHJcbiAgICAvLyAgICAgICB9KVxyXG4gICAgLy8gICB9XHJcbiAgICAvLyB9XHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ0F1dG9FbWFpbHNDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCAkc3RhdGVQYXJhbXMsIEF1dGhTZXJ2aWNlKSB7XHJcbiAgJHNjb3BlLmxvZ2dlZEluID0gZmFsc2U7XHJcblxyXG5cclxuICAkc2NvcGUuaXNTdGF0ZVBhcmFtcyA9IGZhbHNlO1xyXG4gIGlmKCRzdGF0ZVBhcmFtcy50ZW1wbGF0ZUlkKSB7XHJcbiAgICAkc2NvcGUuaXNTdGF0ZVBhcmFtcyA9IHRydWU7XHJcbiAgfVxyXG4gIC8vICRzY29wZS50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xyXG5cclxuICAkc2NvcGUudGVtcGxhdGUgPSB7XHJcbiAgICBpc0FydGlzdDogZmFsc2VcclxuICB9O1xyXG5cclxuICAkc2NvcGUuZ2V0VGVtcGxhdGUgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmKCRzdGF0ZVBhcmFtcy50ZW1wbGF0ZUlkKSB7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgJGh0dHAuZ2V0KCcvYXBpL2RhdGFiYXNlL2F1dG9FbWFpbHM/dGVtcGxhdGVJZD0nICsgJHN0YXRlUGFyYW1zLnRlbXBsYXRlSWQpXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICB2YXIgdGVtcGxhdGUgPSByZXMuZGF0YTtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICBpZiAodGVtcGxhdGUpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnRlbXBsYXRlID0gdGVtcGxhdGU7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICAkc2NvcGUudGVtcGxhdGUgPSB7fTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgYWxlcnQoXCJFUlJPUjogU29tZXRoaW5nIHdlbnQgd3JvbmcuXCIpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIC8vIGNvbnNvbGUubG9nKHRlbXBsYXRlKTtcclxuICAkc2NvcGUuc2F2ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS9hdXRvRW1haWxzLycsICRzY29wZS50ZW1wbGF0ZSlcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgYWxlcnQoXCJTYXZlZCBlbWFpbCB0ZW1wbGF0ZS5cIilcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICB9KVxyXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICBhbGVydChcIkVSUk9SOiBNZXNzYWdlIGNvdWxkIG5vdCBzYXZlLlwiKVxyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24oKSB7XHJcbiAgLy8gICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgLy8gICAkaHR0cC5wb3N0KCcvYXBpL2xvZ2luJywge1xyXG4gIC8vICAgICBwYXNzd29yZDogJHNjb3BlLnBhc3N3b3JkXHJcbiAgLy8gICB9KS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gIC8vICAgICAkcm9vdFNjb3BlLnBhc3N3b3JkID0gJHNjb3BlLnBhc3N3b3JkO1xyXG4gIC8vICAgICAkc2NvcGUubG9nZ2VkSW4gPSB0cnVlO1xyXG4gIC8vICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gIC8vICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XHJcbiAgLy8gICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgLy8gICAgIGFsZXJ0KCdXcm9uZyBQYXNzd29yZCcpO1xyXG4gIC8vICAgfSk7XHJcbiAgLy8gfVxyXG5cclxuICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkaHR0cC5nZXQoJy9hcGkvbG9nb3V0JykudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2FkbWluJztcclxuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICBhbGVydCgnV3JvbmcgUGFzc3dvcmQnKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYXV0b0VtYWlsc0xpc3QnLCB7XHJcbiAgICB1cmw6ICcvYWRtaW4vZGF0YWJhc2UvYXV0b0VtYWlscycsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2RhdGFiYXNlL2F1dG9FbWFpbHMvYXV0b0VtYWlsc0xpc3QuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnQXV0b0VtYWlsc0xpc3RDb250cm9sbGVyJyxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgdGVtcGxhdGVzOiBmdW5jdGlvbigkaHR0cCkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZGF0YWJhc2UvYXV0b0VtYWlscycpXHJcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHsgXHJcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IHJlcy5kYXRhO1xyXG4gICAgICAgICAgICBpZiAodGVtcGxhdGUpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gdGVtcGxhdGU7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICAgIHB1cnBvc2U6IFwiQml3ZWVrbHkgRW1haWxcIlxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgICBhbGVydChcIkVSUk9SOiBTb21ldGhpbmcgd2VudCB3cm9uZy5cIik7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ0F1dG9FbWFpbHNMaXN0Q29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgQXV0aFNlcnZpY2UsIHRlbXBsYXRlcykge1xyXG4gICRzY29wZS5sb2dnZWRJbiA9IGZhbHNlO1xyXG4gICRzY29wZS50ZW1wbGF0ZXMgPSB0ZW1wbGF0ZXM7XHJcblxyXG4gIC8vICRzY29wZS5nZXRUZW1wbGF0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gIC8vICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gIC8vICAgJGh0dHAuZ2V0KCcvYXBpL2RhdGFiYXNlL2F1dG9FbWFpbHMvYml3ZWVrbHk/aXNBcnRpc3Q9JyArIFN0cmluZygkc2NvcGUudGVtcGxhdGUuaXNBcnRpc3QpKVxyXG4gIC8vICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAvLyAgICAgICB2YXIgdGVtcGxhdGUgPSByZXMuZGF0YTtcclxuICAvLyAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gIC8vICAgICAgIGlmICh0ZW1wbGF0ZSkge1xyXG4gIC8vICAgICAgICAgJHNjb3BlLnRlbXBsYXRlID0gdGVtcGxhdGU7XHJcbiAgLy8gICAgICAgfSBlbHNlIHtcclxuICAvLyAgICAgICAgICRzY29wZS50ZW1wbGF0ZSA9IHtcclxuICAvLyAgICAgICAgICAgcHVycG9zZTogXCJCaXdlZWtseSBFbWFpbFwiLFxyXG4gIC8vICAgICAgICAgICBpc0FydGlzdDogZmFsc2VcclxuICAvLyAgICAgICAgIH07XHJcbiAgLy8gICAgICAgfVxyXG4gIC8vICAgICB9KVxyXG4gIC8vICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAvLyAgICAgICBhbGVydChcIkVSUk9SOiBTb21ldGhpbmcgd2VudCB3cm9uZy5cIik7XHJcbiAgLy8gICAgIH0pO1xyXG4gIC8vIH07XHJcblxyXG4gIC8vIGNvbnNvbGUubG9nKHRlbXBsYXRlKTtcclxuICAkc2NvcGUuc2F2ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS9hdXRvRW1haWxzJywgJHNjb3BlLnRlbXBsYXRlKVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICBhbGVydChcIlNhdmVkIGVtYWlsLlwiKTtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICB9KVxyXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICBhbGVydChcIkVSUk9SOiBNZXNzYWdlIGNvdWxkIG5vdCBzYXZlLlwiKVxyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLy8gJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24oKSB7XHJcbiAgLy8gICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgLy8gICAkaHR0cC5wb3N0KCcvYXBpL2xvZ2luJywge1xyXG4gIC8vICAgICBwYXNzd29yZDogJHNjb3BlLnBhc3N3b3JkXHJcbiAgLy8gICB9KS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gIC8vICAgICAkcm9vdFNjb3BlLnBhc3N3b3JkID0gJHNjb3BlLnBhc3N3b3JkO1xyXG4gIC8vICAgICAkc2NvcGUubG9nZ2VkSW4gPSB0cnVlO1xyXG4gIC8vICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gIC8vICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XHJcbiAgLy8gICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgLy8gICAgIGFsZXJ0KCdXcm9uZyBQYXNzd29yZCcpO1xyXG4gIC8vICAgfSk7XHJcbiAgLy8gfVxyXG5cclxuICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkaHR0cC5nZXQoJy9hcGkvbG9nb3V0JykudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2FkbWluJztcclxuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICBhbGVydCgnV3JvbmcgUGFzc3dvcmQnKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkb3dubG9hZEdhdGUnLCB7XHJcbiAgICB1cmw6ICcvYWRtaW4vZG93bmxvYWRHYXRlJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvZG93bmxvYWRUcmFjay92aWV3cy9hZG1pbkRMR2F0ZS5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdBZG1pbkRMR2F0ZUNvbnRyb2xsZXInXHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkb3dubG9hZEdhdGVMaXN0Jywge1xyXG4gICAgdXJsOiAnL2FkbWluL2Rvd25sb2FkR2F0ZS9saXN0JyxcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvZG93bmxvYWRUcmFjay92aWV3cy9hZG1pbkRMR2F0ZS5saXN0Lmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ0FkbWluRExHYXRlQ29udHJvbGxlcidcclxuICB9KTtcclxufSk7XHJcblxyXG5hcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XHJcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2Rvd25sb2FkR2F0ZUVkaXQnLCB7XHJcbiAgICB1cmw6ICcvYWRtaW4vZG93bmxvYWRHYXRlL2VkaXQvOmdhdGV3YXlJRCcsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2Rvd25sb2FkVHJhY2svdmlld3MvYWRtaW5ETEdhdGUuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnQWRtaW5ETEdhdGVDb250cm9sbGVyJ1xyXG4gIH0pO1xyXG59KTtcclxuXHJcblxyXG5hcHAuY29udHJvbGxlcignQWRtaW5ETEdhdGVDb250cm9sbGVyJywgWyckcm9vdFNjb3BlJyxcclxuICAnJHN0YXRlJyxcclxuICAnJHN0YXRlUGFyYW1zJyxcclxuICAnJHNjb3BlJyxcclxuICAnJGh0dHAnLFxyXG4gICckbG9jYXRpb24nLFxyXG4gICckd2luZG93JyxcclxuICAnJHVpYk1vZGFsJyxcclxuICAnU2Vzc2lvblNlcnZpY2UnLFxyXG4gICdBZG1pbkRMR2F0ZVNlcnZpY2UnLFxyXG4gIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCAkc2NvcGUsICRodHRwLCAkbG9jYXRpb24sICR3aW5kb3csICR1aWJNb2RhbCwgU2Vzc2lvblNlcnZpY2UsIEFkbWluRExHYXRlU2VydmljZSkge1xyXG4gICAgLyogSW5pdCBib29sZWFuIHZhcmlhYmxlcyBmb3Igc2hvdy9oaWRlIGFuZCBvdGhlciBmdW5jdGlvbmFsaXRpZXMgKi9cclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IGZhbHNlO1xyXG4gICAgJHNjb3BlLm1lc3NhZ2UgPSB7XHJcbiAgICAgIHZhbDogJycsXHJcbiAgICAgIHZpc2libGU6IGZhbHNlXHJcbiAgICB9O1xyXG5cclxuICAgIC8qIEluaXQgRG93bmxvYWQgR2F0ZXdheSBmb3JtIGRhdGEgKi9cclxuXHJcbiAgICAkc2NvcGUudHJhY2sgPSB7XHJcbiAgICAgIGFydGlzdFVzZXJuYW1lOiAnTGEgVHJvcGljw6FsJyxcclxuICAgICAgdHJhY2tUaXRsZTogJ1BhbnRlb25lIC8gVHJhdmVsJyxcclxuICAgICAgdHJhY2tBcnR3b3JrVVJMOiAnYXNzZXRzL2ltYWdlcy93aG8td2UtYXJlLnBuZycsXHJcbiAgICAgIFNNTGlua3M6IFtdLFxyXG4gICAgICBsaWtlOiBmYWxzZSxcclxuICAgICAgY29tbWVudDogZmFsc2UsXHJcbiAgICAgIHJlcG9zdDogZmFsc2UsXHJcbiAgICAgIGFydGlzdHM6IFt7XHJcbiAgICAgICAgdXJsOiAnJyxcclxuICAgICAgICBhdmF0YXI6ICdhc3NldHMvaW1hZ2VzL3doby13ZS1hcmUucG5nJyxcclxuICAgICAgICB1c2VybmFtZTogJycsXHJcbiAgICAgICAgaWQ6IC0xLFxyXG4gICAgICAgIHBlcm1hbmVudExpbms6IGZhbHNlXHJcbiAgICAgIH1dLFxyXG4gICAgICBwbGF5bGlzdHM6IFt7XHJcbiAgICAgICAgdXJsOiAnJyxcclxuICAgICAgICBhdmF0YXI6ICcnLFxyXG4gICAgICAgIHRpdGxlOiAnJyxcclxuICAgICAgICBpZDogJydcclxuICAgICAgfV1cclxuICAgIH07XHJcblxyXG4gICAgLyogSW5pdCBkb3dubG9hZEdhdGV3YXkgbGlzdCAqL1xyXG5cclxuICAgICRzY29wZS5kb3dubG9hZEdhdGV3YXlMaXN0ID0gW107XHJcblxyXG4gICAgLyogSW5pdCBtb2RhbCBpbnN0YW5jZSB2YXJpYWJsZXMgYW5kIG1ldGhvZHMgKi9cclxuXHJcbiAgICAkc2NvcGUubW9kYWxJbnN0YW5jZSA9IHt9O1xyXG4gICAgJHNjb3BlLm1vZGFsID0ge307XHJcbiAgICAkc2NvcGUub3Blbk1vZGFsID0ge1xyXG4gICAgICBkb3dubG9hZFVSTDogZnVuY3Rpb24oZG93bmxvYWRVUkwpIHtcclxuICAgICAgICAkc2NvcGUubW9kYWwuZG93bmxvYWRVUkwgPSBkb3dubG9hZFVSTDtcclxuICAgICAgICAkc2NvcGUubW9kYWxJbnN0YW5jZSA9ICR1aWJNb2RhbC5vcGVuKHtcclxuICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcclxuICAgICAgICAgIHRlbXBsYXRlVXJsOiAnZG93bmxvYWRVUkwuaHRtbCcsXHJcbiAgICAgICAgICBjb250cm9sbGVyOiAnQXJ0aXN0VG9vbHNDb250cm9sbGVyJyxcclxuICAgICAgICAgIHNjb3BlOiAkc2NvcGVcclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgICRzY29wZS5jbG9zZU1vZGFsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICRzY29wZS5tb2RhbEluc3RhbmNlLmNsb3NlKCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyogSW5pdCBwcm9maWxlICovXHJcbiAgICAkc2NvcGUucHJvZmlsZSA9IHt9O1xyXG5cclxuICAgIC8qIE1ldGhvZCBmb3IgcmVzZXR0aW5nIERvd25sb2FkIEdhdGV3YXkgZm9ybSAqL1xyXG5cclxuICAgIGZ1bmN0aW9uIHJlc2V0RG93bmxvYWRHYXRld2F5KCkge1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IGZhbHNlO1xyXG4gICAgICAkc2NvcGUubWVzc2FnZSA9IHtcclxuICAgICAgICB2YWw6ICcnLFxyXG4gICAgICAgIHZpc2libGU6IGZhbHNlXHJcbiAgICAgIH07XHJcblxyXG4gICAgICAkc2NvcGUudHJhY2sgPSB7XHJcbiAgICAgICAgYXJ0aXN0VXNlcm5hbWU6ICdMYSBUcm9waWPDoWwnLFxyXG4gICAgICAgIHRyYWNrVGl0bGU6ICdQYW50ZW9uZSAvIFRyYXZlbCcsXHJcbiAgICAgICAgdHJhY2tBcnR3b3JrVVJMOiAnYXNzZXRzL2ltYWdlcy93aG8td2UtYXJlLnBuZycsXHJcbiAgICAgICAgU01MaW5rczogW10sXHJcbiAgICAgICAgbGlrZTogZmFsc2UsXHJcbiAgICAgICAgY29tbWVudDogZmFsc2UsXHJcbiAgICAgICAgcmVwb3N0OiBmYWxzZSxcclxuICAgICAgICBhcnRpc3RzOiBbe1xyXG4gICAgICAgICAgdXJsOiAnJyxcclxuICAgICAgICAgIGF2YXRhcjogJ2Fzc2V0cy9pbWFnZXMvd2hvLXdlLWFyZS5wbmcnLFxyXG4gICAgICAgICAgdXNlcm5hbWU6ICcnLFxyXG4gICAgICAgICAgaWQ6IC0xLFxyXG4gICAgICAgICAgcGVybWFuZW50TGluazogZmFsc2VcclxuICAgICAgICB9XSxcclxuICAgICAgICBwbGF5bGlzdHM6IFt7XHJcbiAgICAgICAgICB1cmw6ICcnLFxyXG4gICAgICAgICAgYXZhdGFyOiAnJyxcclxuICAgICAgICAgIHRpdGxlOiAnJyxcclxuICAgICAgICAgIGlkOiAnJ1xyXG4gICAgICAgIH1dXHJcbiAgICAgIH07XHJcbiAgICAgIGFuZ3VsYXIuZWxlbWVudChcImlucHV0W3R5cGU9J2ZpbGUnXVwiKS52YWwobnVsbCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyogQ2hlY2sgaWYgc3RhdGVQYXJhbXMgaGFzIGdhdGV3YXlJRCB0byBpbml0aWF0ZSBlZGl0ICovXHJcbiAgICAkc2NvcGUuY2hlY2tJZkVkaXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKCRzdGF0ZVBhcmFtcy5nYXRld2F5SUQpIHtcclxuICAgICAgICAkc2NvcGUuZ2V0RG93bmxvYWRHYXRld2F5KCRzdGF0ZVBhcmFtcy5nYXRld2F5SUQpO1xyXG4gICAgICAgIC8vIGlmKCEkc3RhdGVQYXJhbXMuZG93bmxvYWRHYXRld2F5KSB7XHJcbiAgICAgICAgLy8gICAkc2NvcGUuZ2V0RG93bmxvYWRHYXRld2F5KCRzdGF0ZVBhcmFtcy5nYXRld2F5SUQpO1xyXG4gICAgICAgIC8vIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gICAkc2NvcGUudHJhY2sgPSAkc3RhdGVQYXJhbXMuZG93bmxvYWRHYXRld2F5O1xyXG4gICAgICAgIC8vIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgICRzY29wZS50cmFja1VSTENoYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAoJHNjb3BlLnRyYWNrLnRyYWNrVVJMICE9PSAnJykge1xyXG4gICAgICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gZmFsc2U7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAgIEFkbWluRExHYXRlU2VydmljZVxyXG4gICAgICAgICAgLnJlc29sdmVEYXRhKHtcclxuICAgICAgICAgICAgdXJsOiAkc2NvcGUudHJhY2sudHJhY2tVUkxcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAudGhlbihoYW5kbGVUcmFja0RhdGFBbmRHZXRQcm9maWxlcylcclxuICAgICAgICAgIC50aGVuKGhhbmRsZVdlYlByb2ZpbGVzKVxyXG4gICAgICAgICAgLmNhdGNoKGhhbmRsZUVycm9yKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlVHJhY2tEYXRhQW5kR2V0UHJvZmlsZXMocmVzKSB7XHJcbiAgICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tUaXRsZSA9IHJlcy5kYXRhLnRpdGxlO1xyXG4gICAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrSUQgPSByZXMuZGF0YS5pZDtcclxuICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RJRCA9IHJlcy5kYXRhLnVzZXIuaWQ7XHJcbiAgICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tBcnR3b3JrVVJMID0gcmVzLmRhdGEuYXJ0d29ya191cmwgPyByZXMuZGF0YS5hcnR3b3JrX3VybC5yZXBsYWNlKCdsYXJnZS5qcGcnLCAndDUwMHg1MDAuanBnJykgOiAnJztcclxuICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RBcnR3b3JrVVJMID0gcmVzLmRhdGEudXNlci5hdmF0YXJfdXJsID8gcmVzLmRhdGEudXNlci5hdmF0YXJfdXJsIDogJyc7XHJcbiAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0VVJMID0gcmVzLmRhdGEudXNlci5wZXJtYWxpbmtfdXJsO1xyXG4gICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdFVzZXJuYW1lID0gcmVzLmRhdGEudXNlci51c2VybmFtZTtcclxuICAgICAgICAgICRzY29wZS50cmFjay5TTUxpbmtzID0gW107XHJcbiAgICAgICAgICByZXR1cm4gU0MuZ2V0KCcvdXNlcnMvJyArICRzY29wZS50cmFjay5hcnRpc3RJRCArICcvd2ViLXByb2ZpbGVzJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVXZWJQcm9maWxlcyhwcm9maWxlcykge1xyXG4gICAgICAgICAgcHJvZmlsZXMuZm9yRWFjaChmdW5jdGlvbihwcm9mKSB7XHJcbiAgICAgICAgICAgIGlmIChbJ3R3aXR0ZXInLCAneW91dHViZScsICdmYWNlYm9vaycsICdzcG90aWZ5JywgJ3NvdW5kY2xvdWQnLCAnaW5zdGFncmFtJ10uaW5kZXhPZihwcm9mLnNlcnZpY2UpICE9IC0xKSB7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MucHVzaCh7XHJcbiAgICAgICAgICAgICAgICBrZXk6IHByb2Yuc2VydmljZSxcclxuICAgICAgICAgICAgICAgIHZhbHVlOiBwcm9mLnVybFxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihlcnIpIHtcclxuICAgICAgICAgICRzY29wZS50cmFjay50cmFja0lEID0gbnVsbDtcclxuICAgICAgICAgIGFsZXJ0KCdTb25nIG5vdCBmb3VuZCBvciBmb3JiaWRkZW4nKTtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgICRzY29wZS5hcnRpc3RVUkxDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICB2YXIgYXJ0aXN0ID0ge307XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgQWRtaW5ETEdhdGVTZXJ2aWNlXHJcbiAgICAgICAgLnJlc29sdmVEYXRhKHtcclxuICAgICAgICAgIHVybDogJHNjb3BlLnRyYWNrLmFydGlzdHNbaW5kZXhdLnVybFxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0c1tpbmRleF0uYXZhdGFyID0gcmVzLmRhdGEuYXZhdGFyX3VybDtcclxuICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RzW2luZGV4XS51c2VybmFtZSA9IHJlcy5kYXRhLnVzZXJuYW1lO1xyXG4gICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdHNbaW5kZXhdLmlkID0gcmVzLmRhdGEuaWQ7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgYWxlcnQoJ0FydGlzdHMgbm90IGZvdW5kJyk7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcbiAgICAkc2NvcGUuYWRkUGxheWxpc3QgPSBmdW5jdGlvbigpIHtcclxuICAgICAgJHNjb3BlLnRyYWNrLnBsYXlsaXN0cy5wdXNoKHtcclxuICAgICAgICB1cmw6ICcnLFxyXG4gICAgICAgIGF2YXRhcjogJycsXHJcbiAgICAgICAgdGl0bGU6ICcnLFxyXG4gICAgICAgIGlkOiAnJ1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgICRzY29wZS5yZW1vdmVQbGF5bGlzdCA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICRzY29wZS50cmFjay5wbGF5bGlzdHMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH1cclxuICAgICRzY29wZS5wbGF5bGlzdFVSTENoYW5nZSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgQWRtaW5ETEdhdGVTZXJ2aWNlXHJcbiAgICAgICAgLnJlc29sdmVEYXRhKHtcclxuICAgICAgICAgIHVybDogJHNjb3BlLnRyYWNrLnBsYXlsaXN0c1tpbmRleF0udXJsXHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICRzY29wZS50cmFjay5wbGF5bGlzdHNbaW5kZXhdLmF2YXRhciA9IHJlcy5kYXRhLmFydHdvcmtfdXJsO1xyXG4gICAgICAgICAgJHNjb3BlLnRyYWNrLnBsYXlsaXN0c1tpbmRleF0udGl0bGUgPSByZXMuZGF0YS50aXRsZTtcclxuICAgICAgICAgICRzY29wZS50cmFjay5wbGF5bGlzdHNbaW5kZXhdLmlkID0gcmVzLmRhdGEuaWQ7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgICBhbGVydCgnUGxheWxpc3Qgbm90IGZvdW5kJyk7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG5cclxuICAgICRzY29wZS5yZW1vdmVBcnRpc3QgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAkc2NvcGUudHJhY2suYXJ0aXN0cy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgfVxyXG5cclxuICAgICRzY29wZS5hZGRBcnRpc3QgPSBmdW5jdGlvbigpIHtcclxuICAgICAgaWYgKCRzY29wZS50cmFjay5hcnRpc3RzLmxlbmd0aCA+IDIpIHtcclxuICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS50cmFjay5hcnRpc3RzLnB1c2goe1xyXG4gICAgICAgIHVybDogJycsXHJcbiAgICAgICAgYXZhdGFyOiAnYXNzZXRzL2ltYWdlcy93aG8td2UtYXJlLnBuZycsXHJcbiAgICAgICAgdXNlcm5hbWU6ICcnLFxyXG4gICAgICAgIGlkOiAtMVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAkc2NvcGUuYWRkU01MaW5rID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIC8vIGV4dGVybmFsU01MaW5rcysrO1xyXG4gICAgICAvLyAkc2NvcGUudHJhY2suU01MaW5rc1sna2V5JyArIGV4dGVybmFsU01MaW5rc10gPSAnJztcclxuICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MucHVzaCh7XHJcbiAgICAgICAga2V5OiAnJyxcclxuICAgICAgICB2YWx1ZTogJydcclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG4gICAgJHNjb3BlLnJlbW92ZVNNTGluayA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICRzY29wZS50cmFjay5TTUxpbmtzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9O1xyXG4gICAgJHNjb3BlLlNNTGlua0NoYW5nZSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcblxyXG4gICAgICBmdW5jdGlvbiBnZXRMb2NhdGlvbihocmVmKSB7XHJcbiAgICAgICAgdmFyIGxvY2F0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XHJcbiAgICAgICAgbG9jYXRpb24uaHJlZiA9IGhyZWY7XHJcbiAgICAgICAgaWYgKGxvY2F0aW9uLmhvc3QgPT0gXCJcIikge1xyXG4gICAgICAgICAgbG9jYXRpb24uaHJlZiA9IGxvY2F0aW9uLmhyZWY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBsb2NhdGlvbjtcclxuICAgICAgfVxyXG5cclxuICAgICAgdmFyIGxvY2F0aW9uID0gZ2V0TG9jYXRpb24oJHNjb3BlLnRyYWNrLlNNTGlua3NbaW5kZXhdLnZhbHVlKTtcclxuICAgICAgdmFyIGhvc3QgPSBsb2NhdGlvbi5ob3N0bmFtZS5zcGxpdCgnLicpWzBdO1xyXG4gICAgICB2YXIgZmluZExpbmsgPSAkc2NvcGUudHJhY2suU01MaW5rcy5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgIHJldHVybiBpdGVtLmtleSA9PT0gaG9zdDtcclxuICAgICAgfSk7XHJcbiAgICAgIGlmIChmaW5kTGluay5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgICRzY29wZS50cmFjay5TTUxpbmtzW2luZGV4XS5rZXkgPSBob3N0O1xyXG4gICAgfTtcclxuXHJcbiAgICAkc2NvcGUuc2F2ZURvd25sb2FkR2F0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAoISRzY29wZS50cmFjay50cmFja0lEKSB7XHJcbiAgICAgICAgYWxlcnQoJ1RyYWNrIE5vdCBGb3VuZCcpO1xyXG4gICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgfVxyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgIHZhciBzZW5kT2JqID0gbmV3IEZvcm1EYXRhKCk7XHJcblxyXG4gICAgICAvKiBBcHBlbmQgZGF0YSB0byBzZW5kT2JqIHN0YXJ0ICovXHJcblxyXG4gICAgICAvKiBUcmFjayAqL1xyXG4gICAgICBmb3IgKHZhciBwcm9wIGluICRzY29wZS50cmFjaykge1xyXG4gICAgICAgIHNlbmRPYmouYXBwZW5kKHByb3AsICRzY29wZS50cmFja1twcm9wXSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8qIGFydGlzdHMgKi9cclxuXHJcbiAgICAgIHZhciBhcnRpc3RzID0gJHNjb3BlLnRyYWNrLmFydGlzdHMuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICByZXR1cm4gaXRlbS5pZCAhPT0gLTE7XHJcbiAgICAgIH0pLm1hcChmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgZGVsZXRlIGl0ZW1bJyQkaGFzaEtleSddO1xyXG4gICAgICAgIHJldHVybiBpdGVtO1xyXG4gICAgICB9KTtcclxuICAgICAgc2VuZE9iai5hcHBlbmQoJ2FydGlzdHMnLCBKU09OLnN0cmluZ2lmeShhcnRpc3RzKSk7XHJcblxyXG4gICAgICAvKiBwbGF5bGlzdHMgKi9cclxuXHJcbiAgICAgIHZhciBwbGF5bGlzdHMgPSAkc2NvcGUudHJhY2sucGxheWxpc3RzLmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgcmV0dXJuIGl0ZW0uaWQgIT09IC0xO1xyXG4gICAgICB9KS5tYXAoZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgIGRlbGV0ZSBpdGVtWyckJGhhc2hLZXknXTtcclxuICAgICAgICByZXR1cm4gaXRlbTtcclxuICAgICAgfSk7XHJcbiAgICAgIHNlbmRPYmouYXBwZW5kKCdwbGF5bGlzdHMnLCBKU09OLnN0cmluZ2lmeShwbGF5bGlzdHMpKTtcclxuXHJcbiAgICAgIC8qIFNNTGlua3MgKi9cclxuXHJcbiAgICAgIHZhciBTTUxpbmtzID0ge307XHJcbiAgICAgICRzY29wZS50cmFjay5TTUxpbmtzLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgIFNNTGlua3NbaXRlbS5rZXldID0gaXRlbS52YWx1ZTtcclxuICAgICAgfSk7XHJcbiAgICAgIHNlbmRPYmouYXBwZW5kKCdTTUxpbmtzJywgSlNPTi5zdHJpbmdpZnkoU01MaW5rcykpO1xyXG5cclxuICAgICAgLyogQXBwZW5kIGRhdGEgdG8gc2VuZE9iaiBlbmQgKi9cclxuXHJcbiAgICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgIHVybDogJy9hcGkvZGF0YWJhc2UvZG93bmxvYWR1cmwnLFxyXG4gICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICdDb250ZW50LVR5cGUnOiB1bmRlZmluZWRcclxuICAgICAgICB9LFxyXG4gICAgICAgIHRyYW5zZm9ybVJlcXVlc3Q6IGFuZ3VsYXIuaWRlbnRpdHksXHJcbiAgICAgICAgZGF0YTogc2VuZE9ialxyXG4gICAgICB9O1xyXG4gICAgICAkaHR0cChvcHRpb25zKVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIGlmICgkc2NvcGUudHJhY2suX2lkKSB7XHJcbiAgICAgICAgICAgIC8vICRzY29wZS5vcGVuTW9kYWwuZG93bmxvYWRVUkwocmVzLmRhdGEudHJhY2tVUkwpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXNldERvd25sb2FkR2F0ZXdheSgpO1xyXG4gICAgICAgICAgJHNjb3BlLm9wZW5Nb2RhbC5kb3dubG9hZFVSTChyZXMuZGF0YSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICBhbGVydChcIkVSUk9SOiBFcnJvciBpbiBzYXZpbmcgdXJsXCIpO1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAkaHR0cC5wb3N0KCcvYXBpL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgU2Vzc2lvblNlcnZpY2UuZGVsZXRlVXNlcigpO1xyXG4gICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xyXG4gICAgICB9KTtcclxuICAgIH07XHJcblxyXG4gICAgJHNjb3BlLnNob3dQcm9maWxlSW5mbyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAkc2NvcGUucHJvZmlsZSA9IEpTT04ucGFyc2UoU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKTtcclxuICAgIH1cclxuXHJcbiAgICAkc2NvcGUuZ2V0RG93bmxvYWRMaXN0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIEFkbWluRExHYXRlU2VydmljZVxyXG4gICAgICAgIC5nZXREb3dubG9hZExpc3QoKVxyXG4gICAgICAgIC50aGVuKGhhbmRsZVJlc3BvbnNlKVxyXG4gICAgICAgIC5jYXRjaChoYW5kbGVFcnJvcik7XHJcblxyXG4gICAgICBmdW5jdGlvbiBoYW5kbGVSZXNwb25zZShyZXMpIHtcclxuICAgICAgICAkc2NvcGUuZG93bmxvYWRHYXRld2F5TGlzdCA9IHJlcy5kYXRhO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihyZXMpIHtcclxuXHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAvKiBNZXRob2QgZm9yIGdldHRpbmcgRG93bmxvYWRHYXRld2F5IGluIGNhc2Ugb2YgZWRpdCAqL1xyXG5cclxuICAgICRzY29wZS5nZXREb3dubG9hZEdhdGV3YXkgPSBmdW5jdGlvbihkb3dubG9hZEdhdGVXYXlJRCkge1xyXG4gICAgICAvLyByZXNldERvd25sb2FkR2F0ZXdheSgpO1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgIEFkbWluRExHYXRlU2VydmljZVxyXG4gICAgICAgIC5nZXREb3dubG9hZEdhdGV3YXkoe1xyXG4gICAgICAgICAgaWQ6IGRvd25sb2FkR2F0ZVdheUlEXHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihoYW5kbGVSZXNwb25zZSlcclxuICAgICAgICAuY2F0Y2goaGFuZGxlRXJyb3IpO1xyXG5cclxuICAgICAgZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UocmVzKSB7XHJcblxyXG4gICAgICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gdHJ1ZTtcclxuICAgICAgICAkc2NvcGUudHJhY2sgPSByZXMuZGF0YTtcclxuXHJcbiAgICAgICAgdmFyIFNNTGlua3MgPSByZXMuZGF0YS5TTUxpbmtzID8gcmVzLmRhdGEuU01MaW5rcyA6IHt9O1xyXG4gICAgICAgIHZhciBTTUxpbmtzQXJyYXkgPSBbXTtcclxuXHJcbiAgICAgICAgZm9yICh2YXIgbGluayBpbiBTTUxpbmtzKSB7XHJcbiAgICAgICAgICBTTUxpbmtzQXJyYXkucHVzaCh7XHJcbiAgICAgICAgICAgIGtleTogbGluayxcclxuICAgICAgICAgICAgdmFsdWU6IFNNTGlua3NbbGlua11cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkc2NvcGUudHJhY2suU01MaW5rcyA9IFNNTGlua3NBcnJheTtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihyZXMpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgICRzY29wZS5kZWxldGVEb3dubG9hZEdhdGV3YXkgPSBmdW5jdGlvbihpbmRleCkge1xyXG5cclxuICAgICAgaWYgKGNvbmZpcm0oXCJEbyB5b3UgcmVhbGx5IHdhbnQgdG8gZGVsZXRlIHRoaXMgdHJhY2s/XCIpKSB7XHJcbiAgICAgIHZhciBkb3dubG9hZEdhdGVXYXlJRCA9ICRzY29wZS5kb3dubG9hZEdhdGV3YXlMaXN0W2luZGV4XS5faWQ7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAgIEFkbWluRExHYXRlU2VydmljZVxyXG4gICAgICAgICAgLmRlbGV0ZURvd25sb2FkR2F0ZXdheSh7XHJcbiAgICAgICAgICAgIGlkOiBkb3dubG9hZEdhdGVXYXlJRFxyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC50aGVuKGhhbmRsZVJlc3BvbnNlKVxyXG4gICAgICAgICAgLmNhdGNoKGhhbmRsZUVycm9yKTtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UocmVzKSB7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgJHNjb3BlLmRvd25sb2FkR2F0ZXdheUxpc3Quc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKHJlcykge1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlXHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5cclxuXSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkb3dubG9hZCcsIHtcclxuXHRcdHVybDogJy9kb3dubG9hZCcsXHJcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL2Rvd25sb2FkVHJhY2svdmlld3MvZG93bmxvYWRUcmFjay52aWV3Lmh0bWwnLFxyXG5cdFx0Y29udHJvbGxlcjogJ0Rvd25sb2FkVHJhY2tDb250cm9sbGVyJ1xyXG5cdH0pO1xyXG59KTtcclxuXHJcbmFwcC5jb250cm9sbGVyKCdEb3dubG9hZFRyYWNrQ29udHJvbGxlcicsIFsnJHJvb3RTY29wZScsXHJcblx0JyRzdGF0ZScsXHJcblx0JyRzY29wZScsXHJcblx0JyRodHRwJyxcclxuXHQnJGxvY2F0aW9uJyxcclxuXHQnJHdpbmRvdycsXHJcblx0JyRxJyxcclxuXHQnRG93bmxvYWRUcmFja1NlcnZpY2UnLFxyXG5cdGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uLCAkd2luZG93LCAkcSwgRG93bmxvYWRUcmFja1NlcnZpY2UpIHtcclxuXHJcblx0XHQvKiBOb3JtYWwgSlMgdmFycyBhbmQgZnVuY3Rpb25zIG5vdCBib3VuZCB0byBzY29wZSAqL1xyXG5cdFx0dmFyIHBsYXllck9iaiA9IG51bGw7XHJcblxyXG5cdFx0LyogJHNjb3BlIGJpbmRpbmdzIHN0YXJ0ICovXHJcblxyXG5cdFx0JHNjb3BlLnRyYWNrRGF0YSA9IHtcclxuXHRcdFx0dHJhY2tOYW1lOiAnTWl4aW5nIGFuZCBNYXN0ZXJpbmcnLFxyXG5cdFx0XHR1c2VyTmFtZTogJ2xhIHRyb3BpY2FsJ1xyXG5cdFx0fTtcclxuXHRcdCRzY29wZS50b2dnbGUgPSB0cnVlO1xyXG5cdFx0JHNjb3BlLnRvZ2dsZVBsYXkgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0JHNjb3BlLnRvZ2dsZSA9ICEkc2NvcGUudG9nZ2xlO1xyXG5cdFx0XHRpZiAoJHNjb3BlLnRvZ2dsZSkge1xyXG5cdFx0XHRcdHBsYXllck9iai5wYXVzZSgpO1xyXG5cdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdHBsYXllck9iai5wbGF5KCk7XHJcblx0XHRcdH1cclxuXHRcdH1cclxuXHRcdCRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcblx0XHQkc2NvcGUuZW1iZWRUcmFjayA9IGZhbHNlO1xyXG5cdFx0JHNjb3BlLmRvd25sb2FkVVJMTm90Rm91bmQgPSBmYWxzZTtcclxuXHRcdCRzY29wZS5lcnJvclRleHQgPSAnJztcclxuXHRcdCRzY29wZS5mb2xsb3dCb3hJbWFnZVVybCA9ICdhc3NldHMvaW1hZ2VzL3doby13ZS1hcmUucG5nJztcclxuXHRcdCRzY29wZS5yZWNlbnRUcmFja3MgPSBbXTtcclxuXHJcblx0XHQvKiBEZWZhdWx0IHByb2Nlc3Npbmcgb24gcGFnZSBsb2FkICovXHJcblxyXG5cdFx0JHNjb3BlLmdldERvd25sb2FkVHJhY2sgPSBmdW5jdGlvbigpIHtcclxuXHJcblx0XHRcdCRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuXHRcdFx0dmFyIHRyYWNrSUQgPSAkbG9jYXRpb24uc2VhcmNoKCkudHJhY2tpZDtcclxuXHRcdFx0RG93bmxvYWRUcmFja1NlcnZpY2VcclxuXHRcdFx0XHQuZ2V0RG93bmxvYWRUcmFjayh0cmFja0lEKVxyXG5cdFx0XHRcdC50aGVuKHJlY2VpdmVEb3dubG9hZFRyYWNrKVxyXG5cdFx0XHRcdC50aGVuKHJlY2VpdmVSZWNlbnRUcmFja3MpXHJcblx0XHRcdFx0LnRoZW4oaW5pdFBsYXkpXHJcblx0XHRcdFx0LmNhdGNoKGNhdGNoRG93bmxvYWRUcmFja0Vycm9yKTtcclxuXHJcblx0XHRcdGZ1bmN0aW9uIHJlY2VpdmVEb3dubG9hZFRyYWNrKHJlc3VsdCkge1xyXG5cdFx0XHRcdCRzY29wZS50cmFjayA9IHJlc3VsdC5kYXRhO1xyXG5cdFx0XHRcdGNvbnNvbGUubG9nKCRzY29wZS50cmFjayk7XHJcblx0XHRcdFx0JHNjb3BlLmJhY2tncm91bmRTdHlsZSA9IGZ1bmN0aW9uKCkge1xyXG5cdFx0XHRcdFx0cmV0dXJuIHtcclxuXHRcdFx0XHRcdFx0J2JhY2tncm91bmQtaW1hZ2UnOiAndXJsKCcgKyAkc2NvcGUudHJhY2sudHJhY2tBcnR3b3JrVVJMICsgJyknLFxyXG5cdFx0XHRcdFx0XHQnYmFja2dyb3VuZC1yZXBlYXQnOiAnbm8tcmVwZWF0JyxcclxuXHRcdFx0XHRcdFx0J2JhY2tncm91bmQtc2l6ZSc6ICdjb3ZlcidcclxuXHRcdFx0XHRcdH1cclxuXHRcdFx0XHR9XHJcblxyXG5cdFx0XHRcdCRzY29wZS5lbWJlZFRyYWNrID0gdHJ1ZTtcclxuXHRcdFx0XHQkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG5cclxuXHRcdFx0XHRpZiAoJHNjb3BlLnRyYWNrLnNob3dEb3dubG9hZFRyYWNrcyA9PT0gJ3VzZXInKSB7XHJcblx0XHRcdFx0XHRyZXR1cm4gRG93bmxvYWRUcmFja1NlcnZpY2UuZ2V0UmVjZW50VHJhY2tzKHtcclxuXHRcdFx0XHRcdFx0dXNlcklEOiAkc2NvcGUudHJhY2sudXNlcmlkLFxyXG5cdFx0XHRcdFx0XHR0cmFja0lEOiAkc2NvcGUudHJhY2suX2lkXHJcblx0XHRcdFx0XHR9KTtcclxuXHRcdFx0XHR9IGVsc2Uge1xyXG5cdFx0XHRcdFx0cmV0dXJuICRxLnJlc29sdmUoJ3Jlc29sdmUnKTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIHJlY2VpdmVSZWNlbnRUcmFja3MocmVzKSB7XHJcblx0XHRcdFx0aWYgKCh0eXBlb2YgcmVzID09PSAnb2JqZWN0JykgJiYgcmVzLmRhdGEpIHtcclxuXHRcdFx0XHRcdCRzY29wZS5yZWNlbnRUcmFja3MgPSByZXMuZGF0YTtcclxuXHRcdFx0XHR9XHJcblx0XHRcdFx0cmV0dXJuIFNDLnN0cmVhbSgnL3RyYWNrcy8nICsgJHNjb3BlLnRyYWNrLnRyYWNrSUQpO1xyXG5cdFx0XHR9XHJcblxyXG5cdFx0XHRmdW5jdGlvbiBpbml0UGxheShwbGF5ZXIpIHtcclxuXHRcdFx0XHRwbGF5ZXJPYmogPSBwbGF5ZXI7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIGNhdGNoRG93bmxvYWRUcmFja0Vycm9yKCkge1xyXG5cdFx0XHRcdGFsZXJ0KCdTb25nIE5vdCBGb3VuZCcpO1xyXG5cdFx0XHRcdCRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcblx0XHRcdFx0JHNjb3BlLmVtYmVkVHJhY2sgPSBmYWxzZTtcclxuXHRcdFx0fVxyXG5cdFx0fTtcclxuXHJcblxyXG5cdFx0LyogT24gY2xpY2sgZG93bmxvYWQgdHJhY2sgYnV0dG9uICovXHJcblxyXG5cdFx0JHNjb3BlLmRvd25sb2FkVHJhY2sgPSBmdW5jdGlvbigpIHtcclxuXHRcdFx0aWYgKCRzY29wZS50cmFjay5jb21tZW50ICYmICEkc2NvcGUudHJhY2suY29tbWVudFRleHQpIHtcclxuXHRcdFx0XHRhbGVydCgnUGxlYXNlIHdyaXRlIGEgY29tbWVudCEnKTtcclxuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XHJcblx0XHRcdH1cclxuXHRcdFx0JHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG5cdFx0XHQkc2NvcGUuZXJyb3JUZXh0ID0gJyc7XHJcblxyXG5cdFx0XHRTQy5jb25uZWN0KClcclxuXHRcdFx0XHQudGhlbihwZXJmb3JtVGFza3MpXHJcblx0XHRcdFx0LnRoZW4oaW5pdERvd25sb2FkKVxyXG5cdFx0XHRcdC5jYXRjaChjYXRjaFRhc2tzRXJyb3IpXHJcblxyXG5cdFx0XHRmdW5jdGlvbiBwZXJmb3JtVGFza3MocmVzKSB7XHJcblx0XHRcdFx0JHNjb3BlLnRyYWNrLnRva2VuID0gcmVzLm9hdXRoX3Rva2VuO1xyXG5cdFx0XHRcdHJldHVybiBEb3dubG9hZFRyYWNrU2VydmljZS5wZXJmb3JtVGFza3MoJHNjb3BlLnRyYWNrKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdFx0ZnVuY3Rpb24gaW5pdERvd25sb2FkKHJlcykge1xyXG5cdFx0XHRcdCRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcblx0XHRcdFx0aWYgKCRzY29wZS50cmFjay5kb3dubG9hZFVSTCAmJiAkc2NvcGUudHJhY2suZG93bmxvYWRVUkwgIT09ICcnKSB7XHJcblx0XHRcdFx0XHQkd2luZG93LmxvY2F0aW9uLmhyZWYgPSAkc2NvcGUudHJhY2suZG93bmxvYWRVUkw7XHJcblx0XHRcdFx0fSBlbHNlIHtcclxuXHRcdFx0XHRcdCRzY29wZS5lcnJvclRleHQgPSAnRXJyb3IhIENvdWxkIG5vdCBmZXRjaCBkb3dubG9hZCBVUkwnO1xyXG5cdFx0XHRcdFx0JHNjb3BlLmRvd25sb2FkVVJMTm90Rm91bmQgPSB0cnVlO1xyXG5cdFx0XHRcdH1cclxuXHRcdFx0XHQkc2NvcGUuJGFwcGx5KCk7XHJcblx0XHRcdH1cclxuXHJcblx0XHRcdGZ1bmN0aW9uIGNhdGNoVGFza3NFcnJvcihlcnIpIHtcclxuXHRcdFx0XHRhbGVydCgnRXJyb3IgaW4gcHJvY2Vzc2luZyB5b3VyIHJlcXVlc3QnKTtcclxuXHRcdFx0XHQkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG5cdFx0XHRcdCRzY29wZS4kYXBwbHkoKTtcclxuXHRcdFx0fVxyXG5cclxuXHRcdH07XHJcblx0fVxyXG5dKTsiLCJcclxuYXBwLnNlcnZpY2UoJ0FkbWluRExHYXRlU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbigkaHR0cCl7XHJcblxyXG5cdGZ1bmN0aW9uIHJlc29sdmVEYXRhKGRhdGEpIHtcclxuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIGRhdGEpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2V0RG93bmxvYWRMaXN0KCkge1xyXG5cdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS9kYXRhYmFzZS9kb3dubG9hZHVybC9hZG1pbicpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2V0RG93bmxvYWRHYXRld2F5KGRhdGEpIHtcclxuXHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZGF0YWJhc2UvZG93bmxvYWR1cmwvJyArIGRhdGEuaWQpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZGVsZXRlRG93bmxvYWRHYXRld2F5KGRhdGEpIHtcclxuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL2Rvd25sb2FkdXJsL2RlbGV0ZScsIGRhdGEpO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdHJlc29sdmVEYXRhOiByZXNvbHZlRGF0YSxcclxuXHRcdGdldERvd25sb2FkTGlzdDogZ2V0RG93bmxvYWRMaXN0LFxyXG5cdFx0Z2V0RG93bmxvYWRHYXRld2F5OiBnZXREb3dubG9hZEdhdGV3YXksXHJcblx0XHRkZWxldGVEb3dubG9hZEdhdGV3YXk6IGRlbGV0ZURvd25sb2FkR2F0ZXdheVxyXG5cdH07XHJcbn1dKTtcclxuIiwiYXBwLnNlcnZpY2UoJ0Rvd25sb2FkVHJhY2tTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKXtcclxuXHRcclxuXHRmdW5jdGlvbiBnZXREb3dubG9hZFRyYWNrKGRhdGEpIHtcclxuXHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZG93bmxvYWQvdHJhY2s/dHJhY2tJRD0nICsgZGF0YSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZXRUcmFja0RhdGEoZGF0YSkge1xyXG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvc291bmRjbG91ZC9yZXNvbHZlJywge1xyXG5cdFx0XHR1cmw6IGRhdGEudHJhY2tVUkxcclxuXHRcdH0pO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gcGVyZm9ybVRhc2tzKGRhdGEpIHtcclxuXHRcdHJldHVybiAkaHR0cC5wb3N0KCdhcGkvZG93bmxvYWQvdGFza3MnLCBkYXRhKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldFJlY2VudFRyYWNrcyhkYXRhKSB7XHJcblx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2Rvd25sb2FkL3RyYWNrL3JlY2VudD91c2VySUQ9JyArIGRhdGEudXNlcklEICsgJyZ0cmFja0lEPScgKyBkYXRhLnRyYWNrSUQpO1xyXG5cdH1cclxuXHJcblx0cmV0dXJuIHtcclxuXHRcdGdldERvd25sb2FkVHJhY2s6IGdldERvd25sb2FkVHJhY2ssXHJcblx0XHRnZXRUcmFja0RhdGE6IGdldFRyYWNrRGF0YSxcclxuXHRcdHBlcmZvcm1UYXNrczogcGVyZm9ybVRhc2tzLFxyXG5cdFx0Z2V0UmVjZW50VHJhY2tzOiBnZXRSZWNlbnRUcmFja3NcclxuXHR9O1xyXG59XSk7XHJcbiIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncHJlbWllcmUnLCB7XHJcbiAgICB1cmw6ICcvcHJlbWllcmUnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9wcmVtaWVyZS92aWV3cy9wcmVtaWVyZS5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdQcmVtaWVyQ29udHJvbGxlcidcclxuICB9KTtcclxufSk7XHJcblxyXG5hcHAuY29udHJvbGxlcignUHJlbWllckNvbnRyb2xsZXInLCBbJyRyb290U2NvcGUnLFxyXG4gICckc3RhdGUnLFxyXG4gICckc2NvcGUnLFxyXG4gICckaHR0cCcsXHJcbiAgJyRsb2NhdGlvbicsXHJcbiAgJyR3aW5kb3cnLFxyXG4gICdQcmVtaWVyU2VydmljZScsXHJcbiAgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCAkbG9jYXRpb24sICR3aW5kb3csIFByZW1pZXJTZXJ2aWNlKSB7XHJcblxyXG4gICAgJHNjb3BlLmdlbnJlQXJyYXkgPSBbXHJcbiAgICAgICdBbHRlcm5hdGl2ZSBSb2NrJyxcclxuICAgICAgJ0FtYmllbnQnLFxyXG4gICAgICAnQ3JlYXRpdmUnLFxyXG4gICAgICAnQ2hpbGwnLFxyXG4gICAgICAnQ2xhc3NpY2FsJyxcclxuICAgICAgJ0NvdW50cnknLFxyXG4gICAgICAnRGFuY2UgJiBFRE0nLFxyXG4gICAgICAnRGFuY2VoYWxsJyxcclxuICAgICAgJ0RlZXAgSG91c2UnLFxyXG4gICAgICAnRGlzY28nLFxyXG4gICAgICAnRHJ1bSAmIEJhc3MnLFxyXG4gICAgICAnRHVic3RlcCcsXHJcbiAgICAgICdFbGVjdHJvbmljJyxcclxuICAgICAgJ0Zlc3RpdmFsJyxcclxuICAgICAgJ0ZvbGsnLFxyXG4gICAgICAnSGlwLUhvcC9STkInLFxyXG4gICAgICAnSG91c2UnLFxyXG4gICAgICAnSW5kaWUvQWx0ZXJuYXRpdmUnLFxyXG4gICAgICAnTGF0aW4nLFxyXG4gICAgICAnVHJhcCcsXHJcbiAgICAgICdWb2NhbGlzdHMvU2luZ2VyLVNvbmd3cml0ZXInXHJcbiAgICBdO1xyXG5cclxuICAgICRzY29wZS5wcmVtaWVyT2JqID0ge307XHJcbiAgICAkc2NvcGUubWVzc2FnZSA9IHtcclxuICAgICAgdmFsOiAnJyxcclxuICAgICAgdmlzaWJsZTogZmFsc2VcclxuICAgIH07XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG5cclxuICAgICRzY29wZS5zYXZlUHJlbWllciA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICRzY29wZS5tZXNzYWdlLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgdmFyIGRhdGEgPSBuZXcgRm9ybURhdGEoKTtcclxuICAgICAgZm9yICh2YXIgcHJvcCBpbiAkc2NvcGUucHJlbWllck9iaikge1xyXG4gICAgICAgIGRhdGEuYXBwZW5kKHByb3AsICRzY29wZS5wcmVtaWVyT2JqW3Byb3BdKTtcclxuICAgICAgfVxyXG4gICAgICBQcmVtaWVyU2VydmljZVxyXG4gICAgICAgIC5zYXZlUHJlbWllcihkYXRhKVxyXG4gICAgICAgIC50aGVuKHJlY2VpdmVSZXNwb25zZSlcclxuICAgICAgICAuY2F0Y2goY2F0Y2hFcnJvcik7XHJcblxyXG4gICAgICBmdW5jdGlvbiByZWNlaXZlUmVzcG9uc2UocmVzKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICBpZiAocmVzLnN0YXR1cyA9PT0gMjAwKSB7XHJcbiAgICAgICAgICAkc2NvcGUubWVzc2FnZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICRzY29wZS5tZXNzYWdlLnZhbCA9ICdUaGFuayB5b3UhIFlvdXIgbWVzc2FnZSBoYXMgYmVlbiBzZW50IHN1Y2Nlc3NmdWxseS4nO1xyXG4gICAgICAgICAgJHNjb3BlLnByZW1pZXJPYmogPSB7fTtcclxuICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChcImlucHV0W3R5cGU9J2ZpbGUnXVwiKS52YWwobnVsbCk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgICRzY29wZS5tZXNzYWdlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICRzY29wZS5tZXNzYWdlLnZhbCA9ICdFcnJvciBpbiBwcm9jZXNzaW5nIHRoZSByZXF1ZXN0LiBQbGVhc2UgdHJ5IGFnYWluLic7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGNhdGNoRXJyb3IocmVzKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICBpZiAocmVzLnN0YXR1cyA9PT0gNDAwKSB7XHJcbiAgICAgICAgICAkc2NvcGUubWVzc2FnZSA9IHtcclxuICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgdmFsOiByZXMuZGF0YVxyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XHJcbiAgICAgICAgICB2aXNpYmxlOiB0cnVlLFxyXG4gICAgICAgICAgdmFsOiAnRXJyb3IgaW4gcHJvY2Vzc2luZyB0aGUgcmVxdWVzdC4gUGxlYXNlIHRyeSBhZ2Fpbi4nXHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcbl0pOyIsImFwcC5zZXJ2aWNlKCdQcmVtaWVyU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbigkaHR0cCkge1xyXG5cclxuXHRmdW5jdGlvbiBzYXZlUHJlbWllcihkYXRhKSB7XHJcblx0XHRyZXR1cm4gJGh0dHAoe1xyXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcclxuXHRcdFx0dXJsOiAnL2FwaS9wcmVtaWVyJyxcclxuXHRcdFx0aGVhZGVyczoge1xyXG5cdFx0XHRcdCdDb250ZW50LVR5cGUnOiB1bmRlZmluZWRcclxuXHRcdFx0fSxcclxuXHRcdFx0dHJhbnNmb3JtUmVxdWVzdDogYW5ndWxhci5pZGVudGl0eSxcclxuXHRcdFx0ZGF0YTogZGF0YVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4ge1xyXG5cdFx0c2F2ZVByZW1pZXI6IHNhdmVQcmVtaWVyXHJcblx0fTtcclxufV0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnc3VibWlzc2lvbnMnLCB7XHJcbiAgICB1cmw6ICcvc3VibWlzc2lvbnMnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9zdWJtaXNzaW9ucy92aWV3cy9zdWJtaXNzaW9ucy5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdTdWJtaXNzaW9uQ29udHJvbGxlcidcclxuICB9KTtcclxufSk7XHJcblxyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ1N1Ym1pc3Npb25Db250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCBBdXRoU2VydmljZSwgb0VtYmVkRmFjdG9yeSkge1xyXG4gICRzY29wZS5jb3VudGVyID0gMDtcclxuICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzID0gW107XHJcbiAgJHNjb3BlLnN1Ym1pc3Npb25zID0gW107XHJcbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJGh0dHAuZ2V0KCcvYXBpL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hZG1pbic7XHJcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgYWxlcnQoJ1dyb25nIFBhc3N3b3JkJyk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gICRzY29wZS5sb2FkU3VibWlzc2lvbnMgPSBmdW5jdGlvbigpIHtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICRodHRwLmdldCgnL2FwaS9zdWJtaXNzaW9ucy91bmFjY2VwdGVkJylcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgJHNjb3BlLnN1Ym1pc3Npb25zID0gcmVzLmRhdGE7XHJcbiAgICAgICAgY29uc29sZS5sb2cocmVzLmRhdGEpO1xyXG4gICAgICAgICRzY29wZS5sb2FkTW9yZSgpO1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvY2hhbm5lbHMnKTtcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgJHNjb3BlLmNoYW5uZWxzID0gcmVzLmRhdGE7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICBhbGVydCgnRXJyb3I6IENvdWxkIG5vdCBnZXQgY2hhbm5lbHMuJylcclxuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gICRzY29wZS5sb2FkTW9yZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGxvYWRFbGVtZW50cyA9IFtdO1xyXG4gICAgZm9yIChsZXQgaSA9ICRzY29wZS5jb3VudGVyOyBpIDwgJHNjb3BlLmNvdW50ZXIgKyAxNTsgaSsrKSB7XHJcbiAgICAgIHZhciBzdWIgPSAkc2NvcGUuc3VibWlzc2lvbnNbaV07XHJcbiAgICAgIGlmIChzdWIpIHtcclxuICAgICAgICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLnB1c2goc3ViKTtcclxuICAgICAgICBsb2FkRWxlbWVudHMucHVzaChzdWIpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICBjb25zb2xlLmxvZyhsb2FkRWxlbWVudHMpO1xyXG4gICAgICBsb2FkRWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihzdWIpIHtcclxuICAgICAgICBvRW1iZWRGYWN0b3J5LmVtYmVkU29uZyhzdWIpO1xyXG4gICAgICB9LCA1MClcclxuICAgIH0pO1xyXG4gICAgJHNjb3BlLmNvdW50ZXIgKz0gMTU7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuY2hhbmdlQm94ID0gZnVuY3Rpb24oc3ViLCBjaGFuKSB7XHJcbiAgICB2YXIgaW5kZXggPSBzdWIuY2hhbm5lbElEUy5pbmRleE9mKGNoYW4uY2hhbm5lbElEKTtcclxuICAgIGlmIChpbmRleCA9PSAtMSkge1xyXG4gICAgICBzdWIuY2hhbm5lbElEUy5wdXNoKGNoYW4uY2hhbm5lbElEKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHN1Yi5jaGFubmVsSURTLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuc2F2ZSA9IGZ1bmN0aW9uKHN1Ym1pKSB7XHJcbiAgICBpZiAoc3VibWkuY2hhbm5lbElEUy5sZW5ndGggPT0gMCkge1xyXG4gICAgICAkc2NvcGUuZGVjbGluZShzdWJtaSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzdWJtaS5wYXNzd29yZCA9ICRyb290U2NvcGUucGFzc3dvcmQ7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgJGh0dHAucHV0KFwiL2FwaS9zdWJtaXNzaW9ucy9zYXZlXCIsIHN1Ym1pKVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHN1Yikge1xyXG4gICAgICAgICAgJHNjb3BlLnNob3dpbmdFbGVtZW50cy5zcGxpY2UoJHNjb3BlLnNob3dpbmdFbGVtZW50cy5pbmRleE9mKHN1Ym1pKSwgMSk7XHJcbiAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJTYXZlZFwiKTtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJFUlJPUjogZGlkIG5vdCBTYXZlXCIpXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gICRzY29wZS5pZ25vcmUgPSBmdW5jdGlvbihzdWJtaXNzaW9uKSB7XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAkaHR0cC5kZWxldGUoJy9hcGkvc3VibWlzc2lvbnMvaWdub3JlLycgKyBzdWJtaXNzaW9uLl9pZCArICcvJyArICRyb290U2NvcGUucGFzc3dvcmQpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgIHZhciBpbmRleCA9ICRzY29wZS5zaG93aW5nRWxlbWVudHMuaW5kZXhPZihzdWJtaXNzaW9uKTtcclxuICAgICAgICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgd2luZG93LmFsZXJ0KFwiSWdub3JlZFwiKTtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICB9KVxyXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIHdpbmRvdy5hbGVydChcIkVSUk9SOiBkaWQgbm90IElnbm9yZVwiKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuZGVjbGluZSA9IGZ1bmN0aW9uKHN1Ym1pc3Npb24pIHtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICRodHRwLmRlbGV0ZSgnL2FwaS9zdWJtaXNzaW9ucy9kZWNsaW5lLycgKyBzdWJtaXNzaW9uLl9pZCArICcvJyArICRyb290U2NvcGUucGFzc3dvcmQpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgIHZhciBpbmRleCA9ICRzY29wZS5zaG93aW5nRWxlbWVudHMuaW5kZXhPZihzdWJtaXNzaW9uKTtcclxuICAgICAgICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgd2luZG93LmFsZXJ0KFwiRGVjbGluZWRcIik7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZVxyXG4gICAgICB9KVxyXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIHdpbmRvdy5hbGVydChcIkVSUk9SOiBkaWQgbm90IERlY2xpbmVcIik7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLnlvdXR1YmUgPSBmdW5jdGlvbihzdWJtaXNzaW9uKSB7XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAkaHR0cC5wb3N0KCcvYXBpL3N1Ym1pc3Npb25zL3lvdXR1YmVJbnF1aXJ5Jywgc3VibWlzc2lvbilcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICB3aW5kb3cuYWxlcnQoJ1NlbnQgdG8gWmFjaCcpO1xyXG4gICAgICB9KVxyXG4gIH1cclxuXHJcbiAgJHNjb3BlLnNlbmRNb3JlID0gZnVuY3Rpb24oc3VibWlzc2lvbikge1xyXG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgJGh0dHAucG9zdCgnL2FwaS9zdWJtaXNzaW9ucy9zZW5kTW9yZUlucXVpcnknLCBzdWJtaXNzaW9uKVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIHdpbmRvdy5hbGVydCgnU2VudCBFbWFpbCcpO1xyXG4gICAgICB9KVxyXG4gIH1cclxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyXHJcbiAgLnN0YXRlKCdhcnRpc3RUb29scycsIHtcclxuICAgIHVybDogJy9hcnRpc3QtdG9vbHMnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL3ZpZXdzL2FydGlzdFRvb2xzL2FydGlzdFRvb2xzLmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ0FydGlzdFRvb2xzQ29udHJvbGxlcicsXHJcbiAgICBhYnN0cmFjdDogdHJ1ZSxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgYWxsb3dlZDogZnVuY3Rpb24oJHEsICRzdGF0ZSwgU2Vzc2lvblNlcnZpY2UpIHtcclxuICAgICAgICB2YXIgZGVmZXJyZWQgPSAkcS5kZWZlcigpO1xyXG4gICAgICAgIHZhciB1c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICAgICAgIGlmICh1c2VyKSB7XHJcbiAgICAgICAgICBkZWZlcnJlZC5yZXNvbHZlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGRlZmVycmVkLnJlamVjdCgpO1xyXG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2xvZ2luJztcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGRlZmVycmVkLnByb21pc2U7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KVxyXG4gIC5zdGF0ZSgnYXJ0aXN0VG9vbHNQcm9maWxlJywge1xyXG4gICAgdXJsOiAnL3Byb2ZpbGUnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL3ZpZXdzL2FydGlzdFRvb2xzL3Byb2ZpbGUuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnQXJ0aXN0VG9vbHNDb250cm9sbGVyJ1xyXG4gIH0pXHJcbiAgLnN0YXRlKCdhcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheUxpc3QnLCB7XHJcbiAgICB1cmw6ICcvZG93bmxvYWQtZ2F0ZXdheScsXHJcbiAgICBwYXJhbXM6IHtcclxuICAgICAgc3VibWlzc2lvbjogbnVsbFxyXG4gICAgfSxcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS92aWV3cy9hcnRpc3RUb29scy9kb3dubG9hZEdhdGV3YXkubGlzdC5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdBcnRpc3RUb29sc0NvbnRyb2xsZXInXHJcbiAgfSlcclxuXHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ0FydGlzdFRvb2xzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCAkc2NvcGUsICRodHRwLCAkbG9jYXRpb24sICR3aW5kb3csICR1aWJNb2RhbCwgJHRpbWVvdXQsIFNlc3Npb25TZXJ2aWNlLCBBcnRpc3RUb29sc1NlcnZpY2UpIHtcclxuICAkc2NvcGUudXNlciA9IEpTT04ucGFyc2UoU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKTtcclxuXHJcbiAgLyogSW5pdCBib29sZWFuIHZhcmlhYmxlcyBmb3Igc2hvdy9oaWRlIGFuZCBvdGhlciBmdW5jdGlvbmFsaXRpZXMgKi9cclxuXHJcbiAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IGZhbHNlO1xyXG4gICRzY29wZS5tZXNzYWdlID0ge1xyXG4gICAgdmFsOiAnJyxcclxuICAgIHZpc2libGU6IGZhbHNlXHJcbiAgfTtcclxuXHJcbiAgLyogSW5pdCBkb3dubG9hZEdhdGV3YXkgbGlzdCAqL1xyXG5cclxuICAkc2NvcGUuZG93bmxvYWRHYXRld2F5TGlzdCA9IFtdO1xyXG5cclxuICAvKiBJbml0IG1vZGFsIGluc3RhbmNlIHZhcmlhYmxlcyBhbmQgbWV0aG9kcyAqL1xyXG5cclxuICAkc2NvcGUubW9kYWxJbnN0YW5jZSA9IHt9O1xyXG4gICRzY29wZS5tb2RhbCA9IHt9O1xyXG4gICRzY29wZS5vcGVuTW9kYWwgPSB7XHJcbiAgICBkb3dubG9hZFVSTDogZnVuY3Rpb24oZG93bmxvYWRVUkwpIHtcclxuICAgICAgJHNjb3BlLm1vZGFsLmRvd25sb2FkVVJMID0gZG93bmxvYWRVUkw7XHJcbiAgICAgICRzY29wZS5tb2RhbEluc3RhbmNlID0gJHVpYk1vZGFsLm9wZW4oe1xyXG4gICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcclxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2Rvd25sb2FkVVJMLmh0bWwnLFxyXG4gICAgICAgIGNvbnRyb2xsZXI6ICdBcnRpc3RUb29sc0NvbnRyb2xsZXInLFxyXG4gICAgICAgIHNjb3BlOiAkc2NvcGVcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxuICAkc2NvcGUuY2xvc2VNb2RhbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLm1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUuZWRpdFByb2ZpbGVNb2RhbEluc3RhbmNlID0ge307XHJcbiAgJHNjb3BlLmVkaXRQcm9maWxlbW9kYWwgPSB7fTtcclxuICAkc2NvcGUub3BlbkVkaXRQcm9maWxlTW9kYWwgPSB7XHJcbiAgICBlZGl0UHJvZmlsZTogZnVuY3Rpb24oZmllbGQpIHtcclxuICAgICAgJHNjb3BlLnByb2ZpbGUuZmllbGQgPSBmaWVsZDtcclxuICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLmVkaXRQcm9maWxlTW9kYWxJbnN0YW5jZSA9ICR1aWJNb2RhbC5vcGVuKHtcclxuICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcclxuICAgICAgICAgIHRlbXBsYXRlVXJsOiAnZWRpdFByb2ZpbGUuaHRtbCcsXHJcbiAgICAgICAgICBjb250cm9sbGVyOiAnQXJ0aXN0VG9vbHNDb250cm9sbGVyJyxcclxuICAgICAgICAgIHNjb3BlOiAkc2NvcGVcclxuICAgICAgICB9KTtcclxuICAgICAgfSwgMCk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmNsb3NlRWRpdFByb2ZpbGVNb2RhbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLnNob3dQcm9maWxlSW5mbygpO1xyXG4gICAgaWYgKCRzY29wZS5lZGl0UHJvZmlsZU1vZGFsSW5zdGFuY2UuY2xvc2UpIHtcclxuICAgICAgJHNjb3BlLmVkaXRQcm9maWxlTW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gICRzY29wZS50aGFua1lvdU1vZGFsSW5zdGFuY2UgPSB7fTtcclxuICAkc2NvcGUudGhhbmtZb3VNb2RhbCA9IHt9O1xyXG4gICRzY29wZS5vcGVuVGhhbmtZb3VNb2RhbCA9IHtcclxuICAgIHRoYW5rWW91OiBmdW5jdGlvbihzdWJtaXNzaW9uSUQpIHtcclxuICAgICAgJHNjb3BlLnRoYW5rWW91TW9kYWwuc3VibWlzc2lvbklEID0gc3VibWlzc2lvbklEO1xyXG4gICAgICAkc2NvcGUubW9kYWxJbnN0YW5jZSA9ICR1aWJNb2RhbC5vcGVuKHtcclxuICAgICAgICBhbmltYXRpb246IHRydWUsXHJcbiAgICAgICAgdGVtcGxhdGVVcmw6ICd0aGFua1lvdS5odG1sJyxcclxuICAgICAgICBjb250cm9sbGVyOiAnT3BlblRoYW5rWW91TW9kYWxDb250cm9sbGVyJyxcclxuICAgICAgICBzY29wZTogJHNjb3BlXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgJHNjb3BlLmNsb3NlVGhhbmtZb3VNb2RhbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLnRoYW5rWW91TW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xyXG4gIH07XHJcbiAgLyogSW5pdCBwcm9maWxlICovXHJcbiAgJHNjb3BlLnByb2ZpbGUgPSB7fTtcclxuXHJcbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJGh0dHAucG9zdCgnL2FwaS9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICBTZXNzaW9uU2VydmljZS5kZWxldGVVc2VyKCk7XHJcbiAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcclxuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2xvZ2luJztcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gIGNvbnNvbGUubG9nKCRzdGF0ZVBhcmFtcy5zdWJtaXNzaW9uKTtcclxuICBpZiAoJHN0YXRlUGFyYW1zLnN1Ym1pc3Npb24pIHtcclxuICAgICRzY29wZS5vcGVuVGhhbmtZb3VNb2RhbC50aGFua1lvdSgkc3RhdGVQYXJhbXMuc3VibWlzc2lvbi5faWQpO1xyXG4gIH1cclxuXHJcblxyXG4gICRzY29wZS5zaG93UHJvZmlsZUluZm8gPSBmdW5jdGlvbigpIHtcclxuICAgICRzY29wZS5wcm9maWxlLmRhdGEgPSBKU09OLnBhcnNlKFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKSk7XHJcbiAgICBpZiAoKCRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3MgJiYgJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcy5sZW5ndGggPT09IDApIHx8ICEkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzKSB7XHJcbiAgICAgICRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3MgPSBbe1xyXG4gICAgICAgIHVybDogJycsXHJcbiAgICAgICAgYXZhdGFyOiAnJyxcclxuICAgICAgICB1c2VybmFtZTogJycsXHJcbiAgICAgICAgaWQ6IC0xLFxyXG4gICAgICAgIHBlcm1hbmVudExpbms6IHRydWVcclxuICAgICAgfV07XHJcbiAgICB9O1xyXG4gICAgJHNjb3BlLnByb2ZpbGUuaXNBdmFpbGFibGUgPSB7fTtcclxuICAgICRzY29wZS5wcm9maWxlLmlzQXZhaWxhYmxlLmVtYWlsID0gJHNjb3BlLnByb2ZpbGUuZGF0YS5lbWFpbCA/IHRydWUgOiBmYWxzZTtcclxuICAgICRzY29wZS5wcm9maWxlLmlzQXZhaWxhYmxlLnBhc3N3b3JkID0gJHNjb3BlLnByb2ZpbGUuZGF0YS5wYXNzd29yZCA/IHRydWUgOiBmYWxzZTtcclxuICAgICRzY29wZS5wcm9maWxlLmlzQXZhaWxhYmxlLnNvdW5kY2xvdWQgPSAkc2NvcGUucHJvZmlsZS5kYXRhLnNvdW5kY2xvdWQgPyB0cnVlIDogZmFsc2U7XHJcbiAgICAkc2NvcGUucHJvZmlsZS5kYXRhLnBhc3N3b3JkID0gJyc7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLnNhdmVQcm9maWxlSW5mbyA9IGZ1bmN0aW9uKCkge1xyXG5cclxuICAgICRzY29wZS5tZXNzYWdlID0ge1xyXG4gICAgICB2YWx1ZTogJycsXHJcbiAgICAgIHZpc2libGU6IGZhbHNlXHJcbiAgICB9O1xyXG5cclxuICAgIHZhciBwZXJtYW5lbnRMaW5rcyA9ICRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3MuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgcmV0dXJuIGl0ZW0uaWQgIT09IC0xO1xyXG4gICAgfSkubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgZGVsZXRlIGl0ZW1bJyQkaGFzaEtleSddO1xyXG4gICAgICByZXR1cm4gaXRlbTtcclxuICAgIH0pO1xyXG5cclxuICAgIHZhciBzZW5kT2JqID0ge1xyXG4gICAgICBuYW1lOiAnJyxcclxuICAgICAgcGFzc3dvcmQ6ICcnLFxyXG4gICAgICBwZXJtYW5lbnRMaW5rczogSlNPTi5zdHJpbmdpZnkocGVybWFuZW50TGlua3MpXHJcbiAgICB9XHJcbiAgICBpZiAoJHNjb3BlLnByb2ZpbGUuZmllbGQgPT09ICduYW1lJykge1xyXG4gICAgICBzZW5kT2JqLm5hbWUgPSAkc2NvcGUucHJvZmlsZS5kYXRhLm5hbWU7XHJcbiAgICB9IGVsc2UgaWYgKCRzY29wZS5wcm9maWxlLmZpZWxkID09PSAncGFzc3dvcmQnKSB7XHJcbiAgICAgIHNlbmRPYmoucGFzc3dvcmQgPSAkc2NvcGUucHJvZmlsZS5kYXRhLnBhc3N3b3JkO1xyXG4gICAgfSBlbHNlIGlmICgkc2NvcGUucHJvZmlsZS5maWVsZCA9PT0gJ2VtYWlsJykge1xyXG4gICAgICBzZW5kT2JqLmVtYWlsID0gJHNjb3BlLnByb2ZpbGUuZGF0YS5lbWFpbDtcclxuICAgIH1cclxuXHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICBBcnRpc3RUb29sc1NlcnZpY2VcclxuICAgIC5zYXZlUHJvZmlsZUluZm8oc2VuZE9iailcclxuICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICBpZiAocmVzLmRhdGEgPT09ICdFbWFpbCBFcnJvcicpIHtcclxuICAgICAgICAkc2NvcGUubWVzc2FnZSA9IHtcclxuICAgICAgICAgIHZhbHVlOiAnRW1haWwgYWxyZWFkeSBleGlzdHMhJyxcclxuICAgICAgICAgIHZpc2libGU6IHRydWVcclxuICAgICAgICB9O1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUocmVzLmRhdGEpO1xyXG4gICAgICAkc2NvcGUuY2xvc2VFZGl0UHJvZmlsZU1vZGFsKCk7XHJcbiAgICB9KVxyXG4gICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICBhbGVydCgnZXJyb3Igc2F2aW5nJyk7XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUucmVtb3ZlUGVybWFuZW50TGluayA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgfTtcclxuICAkc2NvcGUuaGlkZWJ1dHRvbiA9IGZhbHNlO1xyXG4gICRzY29wZS5hZGRQZXJtYW5lbnRMaW5rID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgaWYgKCRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3MubGVuZ3RoID49IDIgJiYgISRzY29wZS51c2VyLmFkbWluKSB7XHJcbiAgICAgICRzY29wZS5oaWRlYnV0dG9uID0gdHJ1ZTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcy5sZW5ndGggPiAyICYmICEkc2NvcGUudXNlci5hZG1pbikge1xyXG4gICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcy5wdXNoKHtcclxuICAgICAgdXJsOiAnJyxcclxuICAgICAgYXZhdGFyOiAnJyxcclxuICAgICAgdXNlcm5hbWU6ICcnLFxyXG4gICAgICBpZDogLTEsXHJcbiAgICAgIHBlcm1hbmVudExpbms6IHRydWVcclxuICAgIH0pO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5wZXJtYW5lbnRMaW5rVVJMQ2hhbmdlID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgIHZhciBwZXJtYW5lbnRMaW5rID0ge307XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICBBcnRpc3RUb29sc1NlcnZpY2VcclxuICAgIC5yZXNvbHZlRGF0YSh7XHJcbiAgICAgIHVybDogJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rc1tpbmRleF0udXJsXHJcbiAgICB9KVxyXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3NbaW5kZXhdLmF2YXRhciA9IHJlcy5kYXRhLmF2YXRhcl91cmwgPyByZXMuZGF0YS5hdmF0YXJfdXJsIDogJyc7XHJcbiAgICAgICRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3NbaW5kZXhdLnVzZXJuYW1lID0gcmVzLmRhdGEucGVybWFsaW5rO1xyXG4gICAgICAkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzW2luZGV4XS5pZCA9IHJlcy5kYXRhLmlkO1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgfSlcclxuICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHtcclxuICAgICAgYWxlcnQoJ0FydGlzdHMgbm90IGZvdW5kJyk7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICB9KTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUuc2F2ZVNvdW5kQ2xvdWRBY2NvdW50SW5mbyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgU0MuY29ubmVjdCgpXHJcbiAgICAudGhlbihzYXZlSW5mbylcclxuICAgIC50aGVuKGhhbmRsZVJlc3BvbnNlKVxyXG4gICAgLmNhdGNoKGhhbmRsZUVycm9yKTtcclxuXHJcbiAgICBmdW5jdGlvbiBzYXZlSW5mbyhyZXMpIHtcclxuICAgICAgcmV0dXJuIEFydGlzdFRvb2xzU2VydmljZS5zYXZlU291bmRDbG91ZEFjY291bnRJbmZvKHtcclxuICAgICAgICB0b2tlbjogcmVzLm9hdXRoX3Rva2VuXHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlcykge1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICBpZiAocmVzLnN0YXR1cyA9PT0gMjAwICYmIChyZXMuZGF0YS5zdWNjZXNzID09PSB0cnVlKSkge1xyXG4gICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZShyZXMuZGF0YS5kYXRhKTtcclxuICAgICAgICAkc2NvcGUucHJvZmlsZS5kYXRhID0gcmVzLmRhdGEuZGF0YTtcclxuICAgICAgICAkc2NvcGUucHJvZmlsZS5pc0F2YWlsYWJsZS5zb3VuZGNsb3VkID0gdHJ1ZTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkc2NvcGUubWVzc2FnZSA9IHtcclxuICAgICAgICAgIHZhbHVlOiAnWW91IGFscmVhZHkgaGF2ZSBhbiBhY2NvdW50IHdpdGggdGhpcyBzb3VuZGNsb3VkIHVzZXJuYW1lJyxcclxuICAgICAgICAgIHZpc2libGU6IHRydWVcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihlcnIpIHtcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICAkc2NvcGUuZ2V0RG93bmxvYWRMaXN0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBBcnRpc3RUb29sc1NlcnZpY2VcclxuICAgIC5nZXREb3dubG9hZExpc3QoKVxyXG4gICAgLnRoZW4oaGFuZGxlUmVzcG9uc2UpXHJcbiAgICAuY2F0Y2goaGFuZGxlRXJyb3IpO1xyXG5cclxuICAgIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlcykge1xyXG4gICAgICAkc2NvcGUuZG93bmxvYWRHYXRld2F5TGlzdCA9IHJlcy5kYXRhO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycikge1xyXG4gICAgICBjb25zb2xlLmxvZyhlcnIpXHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmRlbGV0ZURvd25sb2FkR2F0ZXdheSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICBpZiAoY29uZmlybShcIkRvIHlvdSByZWFsbHkgd2FudCB0byBkZWxldGUgdGhpcyB0cmFjaz9cIikpIHtcclxuICAgICAgdmFyIGRvd25sb2FkR2F0ZVdheUlEID0gJHNjb3BlLmRvd25sb2FkR2F0ZXdheUxpc3RbaW5kZXhdLl9pZDtcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICBBcnRpc3RUb29sc1NlcnZpY2VcclxuICAgICAgLmRlbGV0ZURvd25sb2FkR2F0ZXdheSh7XHJcbiAgICAgICAgaWQ6IGRvd25sb2FkR2F0ZVdheUlEXHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKGhhbmRsZVJlc3BvbnNlKVxyXG4gICAgICAuY2F0Y2goaGFuZGxlRXJyb3IpO1xyXG5cclxuICAgICAgZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UocmVzKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAkc2NvcGUuZG93bmxvYWRHYXRld2F5TGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihyZXMpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfTtcclxufSlcclxuLmNvbnRyb2xsZXIoJ09wZW5UaGFua1lvdU1vZGFsQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSkge30pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICAgJHN0YXRlUHJvdmlkZXJcclxuICAgICAgICAuc3RhdGUoJ2FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5RWRpdCcsIHtcclxuICAgICAgICAgICAgdXJsOiAnL2Rvd25sb2FkLWdhdGV3YXkvZWRpdC86Z2F0ZXdheUlEJyxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL3ZpZXdzL2FydGlzdFRvb2xzL2Rvd25sb2FkR2F0ZXdheS5odG1sJyxcclxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5Q29udHJvbGxlcidcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5zdGF0ZSgnYXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlOZXcnLCB7XHJcbiAgICAgICAgICAgIHVybDogJy9kb3dubG9hZC1nYXRld2F5L25ldycsXHJcbiAgICAgICAgICAgIHBhcmFtczoge1xyXG4gICAgICAgICAgICAgICAgc3VibWlzc2lvbjogbnVsbFxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvYXJ0aXN0VG9vbHMvZG93bmxvYWRHYXRld2F5Lmh0bWwnLFxyXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlDb250cm9sbGVyJ1xyXG4gICAgICAgIH0pXHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ0FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5Q29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCAkc2NvcGUsICRodHRwLCAkbG9jYXRpb24sICR3aW5kb3csICR1aWJNb2RhbCwgJHRpbWVvdXQsIFNlc3Npb25TZXJ2aWNlLCBBcnRpc3RUb29sc1NlcnZpY2UpIHtcclxuICAgIC8qIEluaXQgRG93bmxvYWQgR2F0ZXdheSBmb3JtIGRhdGEgKi9cclxuICAgICRzY29wZS51c2VyID0gSlNPTi5wYXJzZShTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkpO1xyXG5cclxuICAgICRzY29wZS50cmFjayA9IHtcclxuICAgICAgICBhcnRpc3RVc2VybmFtZTogJycsXHJcbiAgICAgICAgdHJhY2tUaXRsZTogJycsXHJcbiAgICAgICAgdHJhY2tBcnR3b3JrVVJMOiAnJyxcclxuICAgICAgICBTTUxpbmtzOiBbXSxcclxuICAgICAgICBsaWtlOiBmYWxzZSxcclxuICAgICAgICBjb21tZW50OiBmYWxzZSxcclxuICAgICAgICByZXBvc3Q6IGZhbHNlLFxyXG4gICAgICAgIGFydGlzdHM6IFtdLFxyXG4gICAgICAgIHNob3dEb3dubG9hZFRyYWNrczogJ3VzZXInLFxyXG4gICAgICAgIGFkbWluOiAkc2NvcGUudXNlci5hZG1pbixcclxuICAgICAgICBmaWxlOiB7fVxyXG4gICAgfTtcclxuICAgICRzY29wZS5wcm9maWxlID0ge307XHJcbiAgICAvKiBJbml0IHRyYWNrIGxpc3QgYW5kIHRyYWNrTGlzdE9iaiovXHJcbiAgICAkc2NvcGUudHJhY2tMaXN0ID0gW107XHJcbiAgICAkc2NvcGUudHJhY2tMaXN0T2JqID0gbnVsbDtcclxuXHJcbiAgICAvKiBNZXRob2QgZm9yIHJlc2V0dGluZyBEb3dubG9hZCBHYXRld2F5IGZvcm0gKi9cclxuXHJcbiAgICAkc2NvcGUudHJhY2tMaXN0Q2hhbmdlID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuXHJcbiAgICAgICAgLyogU2V0IGJvb2xlYW5zICovXHJcblxyXG4gICAgICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gZmFsc2U7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG5cclxuICAgICAgICAvKiBTZXQgdHJhY2sgZGF0YSAqL1xyXG5cclxuICAgICAgICB2YXIgdHJhY2sgPSAkc2NvcGUudHJhY2tMaXN0T2JqO1xyXG4gICAgICAgICRzY29wZS50cmFjay50cmFja1VSTCA9IHRyYWNrLnBlcm1hbGlua191cmw7XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrVGl0bGUgPSB0cmFjay50aXRsZTtcclxuICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tJRCA9IHRyYWNrLmlkO1xyXG4gICAgICAgICRzY29wZS50cmFjay5hcnRpc3RJRCA9IHRyYWNrLnVzZXIuaWQ7XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLmRlc2NyaXB0aW9uID0gdHJhY2suZGVzY3JpcHRpb247XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrQXJ0d29ya1VSTCA9IHRyYWNrLmFydHdvcmtfdXJsID8gdHJhY2suYXJ0d29ya191cmwucmVwbGFjZSgnbGFyZ2UuanBnJywgJ3Q1MDB4NTAwLmpwZycpIDogJyc7XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdEFydHdvcmtVUkwgPSB0cmFjay51c2VyLmF2YXRhcl91cmwgPyB0cmFjay51c2VyLmF2YXRhcl91cmwgOiAnJztcclxuICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0VVJMID0gdHJhY2sudXNlci5wZXJtYWxpbmtfdXJsO1xyXG4gICAgICAgICRzY29wZS50cmFjay5hcnRpc3RVc2VybmFtZSA9IHRyYWNrLnVzZXIudXNlcm5hbWU7XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MgPSBbXTtcclxuXHJcbiAgICAgICAgU0MuZ2V0KCcvdXNlcnMvJyArICRzY29wZS50cmFjay5hcnRpc3RJRCArICcvd2ViLXByb2ZpbGVzJylcclxuICAgICAgICAgICAgLnRoZW4oaGFuZGxlV2ViUHJvZmlsZXMpXHJcbiAgICAgICAgICAgIC5jYXRjaChoYW5kbGVFcnJvcik7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVdlYlByb2ZpbGVzKHByb2ZpbGVzKSB7XHJcbiAgICAgICAgICAgIHByb2ZpbGVzLmZvckVhY2goZnVuY3Rpb24ocHJvZikge1xyXG4gICAgICAgICAgICAgICAgaWYgKFsndHdpdHRlcicsICd5b3V0dWJlJywgJ2ZhY2Vib29rJywgJ3Nwb3RpZnknLCAnc291bmRjbG91ZCcsICdpbnN0YWdyYW0nXS5pbmRleE9mKHByb2Yuc2VydmljZSkgIT0gLTEpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2suU01MaW5rcy5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBwcm9mLnNlcnZpY2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBwcm9mLnVybFxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihlcnIpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrSUQgPSBudWxsO1xyXG4gICAgICAgICAgICBhbGVydCgnU29uZyBub3QgZm91bmQgb3IgZm9yYmlkZGVuJyk7XHJcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuXHJcbiAgICAkc2NvcGUucmVtb3ZlU01MaW5rID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAkc2NvcGUudHJhY2suU01MaW5rcy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgfTtcclxuXHJcbiAgICAkc2NvcGUuc2F2ZURvd25sb2FkR2F0ZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIGlmICghKCRzY29wZS50cmFjay5kb3dubG9hZFVSTCB8fCAkc2NvcGUudHJhY2suZmlsZS5uYW1lKSkge1xyXG4gICAgICAgICAgICBhbGVydCgnRW50ZXIgYSBkb3dubG9hZCBmaWxlJyk7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmICghJHNjb3BlLnRyYWNrLnRyYWNrSUQpIHtcclxuICAgICAgICAgICAgYWxlcnQoJ1RyYWNrIE5vdCBGb3VuZCcpO1xyXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgICB2YXIgc2VuZE9iaiA9IG5ldyBGb3JtRGF0YSgpO1xyXG4gICAgICAgIGZvciAodmFyIHByb3AgaW4gJHNjb3BlLnRyYWNrKSB7XHJcbiAgICAgICAgICAgIHNlbmRPYmouYXBwZW5kKHByb3AsICRzY29wZS50cmFja1twcm9wXSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBhcnRpc3RzID0gJHNjb3BlLnRyYWNrLmFydGlzdHMuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgcmV0dXJuIGl0ZW0uaWQgIT09IC0xO1xyXG4gICAgICAgIH0pLm1hcChmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgIGRlbGV0ZSBpdGVtWyckJGhhc2hLZXknXTtcclxuICAgICAgICAgICAgcmV0dXJuIGl0ZW07XHJcbiAgICAgICAgfSlcclxuICAgICAgICBzZW5kT2JqLmFwcGVuZCgnYXJ0aXN0cycsIEpTT04uc3RyaW5naWZ5KGFydGlzdHMpKTtcclxuICAgICAgICB2YXIgU01MaW5rcyA9IHt9O1xyXG4gICAgICAgICRzY29wZS50cmFjay5TTUxpbmtzLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICBTTUxpbmtzW2l0ZW0ua2V5XSA9IGl0ZW0udmFsdWU7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgc2VuZE9iai5hcHBlbmQoJ1NNTGlua3MnLCBKU09OLnN0cmluZ2lmeShTTUxpbmtzKSk7XHJcbiAgICAgICAgaWYgKCRzY29wZS50cmFjay5wbGF5bGlzdHMpIHtcclxuICAgICAgICAgICAgc2VuZE9iai5hcHBlbmQoJ3BsYXlsaXN0cycsIEpTT04uc3RyaW5naWZ5KCRzY29wZS50cmFjay5wbGF5bGlzdHMpKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHZhciBvcHRpb25zID0ge1xyXG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgdXJsOiAnL2FwaS9kYXRhYmFzZS9kb3dubG9hZHVybCcsXHJcbiAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiB1bmRlZmluZWRcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdHJhbnNmb3JtUmVxdWVzdDogYW5ndWxhci5pZGVudGl0eSxcclxuICAgICAgICAgICAgZGF0YTogc2VuZE9ialxyXG4gICAgICAgIH07XHJcbiAgICAgICAgJGh0dHAob3B0aW9ucylcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgaWYgKCRzdGF0ZVBhcmFtcy5zdWJtaXNzaW9uKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheUxpc3QnLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICdzdWJtaXNzaW9uJzogJHN0YXRlUGFyYW1zLnN1Ym1pc3Npb25cclxuICAgICAgICAgICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheUxpc3QnKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgYWxlcnQoXCJFUlJPUjogRXJyb3IgaW4gc2F2aW5nIHVybFwiKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfTtcclxuXHJcblxyXG4gICAgJHNjb3BlLmNoZWNrSWZFZGl0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKCRzdGF0ZVBhcmFtcy5nYXRld2F5SUQpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmdldERvd25sb2FkR2F0ZXdheSgkc3RhdGVQYXJhbXMuZ2F0ZXdheUlEKTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgICRzY29wZS5nZXRUcmFja0xpc3RGcm9tU291bmRjbG91ZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHZhciBwcm9maWxlID0gSlNPTi5wYXJzZShTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkpO1xyXG4gICAgICAgIGlmIChwcm9maWxlLnNvdW5kY2xvdWQpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgICBTQy5nZXQoJy91c2Vycy8nICsgcHJvZmlsZS5zb3VuZGNsb3VkLmlkICsgJy90cmFja3MnKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24odHJhY2tzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrTGlzdCA9IHRyYWNrcztcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAkc2NvcGUuY2hlY2tJZlN1Ym1pc3Npb24gPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoJHN0YXRlUGFyYW1zLnN1Ym1pc3Npb24pIHtcclxuICAgICAgICAgICAgaWYgKCRzdGF0ZS5pbmNsdWRlcygnYXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlOZXcnKSkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrVVJMID0gJHJvb3RTY29wZS5zdWJtaXNzaW9uLnRyYWNrVVJMO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrVVJMQ2hhbmdlKCk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICAgICRzY29wZS5vcGVuVGhhbmtZb3VNb2RhbC50aGFua1lvdSgkc3RhdGVQYXJhbXMuc3VibWlzc2lvbi5faWQpO1xyXG4gICAgICAgICAgICAkcm9vdFNjb3BlLnN1Ym1pc3Npb24gPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAkc2NvcGUudHJhY2tVUkxDaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoJHNjb3BlLnRyYWNrLnRyYWNrVVJMICE9PSAnJykge1xyXG4gICAgICAgICAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgICAgIEFydGlzdFRvb2xzU2VydmljZS5yZXNvbHZlRGF0YSh7XHJcbiAgICAgICAgICAgICAgICB1cmw6ICRzY29wZS50cmFjay50cmFja1VSTFxyXG4gICAgICAgICAgICB9KS50aGVuKGhhbmRsZVRyYWNrRGF0YUFuZEdldFByb2ZpbGVzKS50aGVuKGhhbmRsZVdlYlByb2ZpbGVzKS5jYXRjaChoYW5kbGVFcnJvcik7XHJcblxyXG4gICAgICAgICAgICBmdW5jdGlvbiBoYW5kbGVUcmFja0RhdGFBbmRHZXRQcm9maWxlcyhyZXMpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS50cmFjay50cmFja1RpdGxlID0gcmVzLmRhdGEudGl0bGU7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tJRCA9IHJlcy5kYXRhLmlkO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdElEID0gcmVzLmRhdGEudXNlci5pZDtcclxuICAgICAgICAgICAgICAgICRzY29wZS50cmFjay5kZXNjcmlwdGlvbiA9IHJlcy5kYXRhLmRlc2NyaXB0aW9uO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrQXJ0d29ya1VSTCA9IHJlcy5kYXRhLmFydHdvcmtfdXJsID8gcmVzLmRhdGEuYXJ0d29ya191cmwucmVwbGFjZSgnbGFyZ2UuanBnJywgJ3Q1MDB4NTAwLmpwZycpIDogJyc7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0QXJ0d29ya1VSTCA9IHJlcy5kYXRhLnVzZXIuYXZhdGFyX3VybCA/IHJlcy5kYXRhLnVzZXIuYXZhdGFyX3VybC5yZXBsYWNlKCdsYXJnZS5qcGcnLCAndDUwMHg1MDAuanBnJykgOiAnJztcclxuICAgICAgICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RVUkwgPSByZXMuZGF0YS51c2VyLnBlcm1hbGlua191cmw7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0VXNlcm5hbWUgPSByZXMuZGF0YS51c2VyLnVzZXJuYW1lO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MgPSBbXTtcclxuICAgICAgICAgICAgICAgIHJldHVybiBTQy5nZXQoJy91c2Vycy8nICsgJHNjb3BlLnRyYWNrLmFydGlzdElEICsgJy93ZWItcHJvZmlsZXMnKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gaGFuZGxlV2ViUHJvZmlsZXMocHJvZmlsZXMpIHtcclxuICAgICAgICAgICAgICAgIHByb2ZpbGVzLmZvckVhY2goZnVuY3Rpb24ocHJvZikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChbJ3R3aXR0ZXInLCAneW91dHViZScsICdmYWNlYm9vaycsICdzcG90aWZ5JywgJ3NvdW5kY2xvdWQnLCAnaW5zdGFncmFtJ10uaW5kZXhPZihwcm9mLnNlcnZpY2UpICE9IC0xKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS50cmFjay5TTUxpbmtzLnB1c2goe1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBwcm9mLnNlcnZpY2UsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZTogcHJvZi51cmxcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcblxyXG4gICAgICAgICAgICAgICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tJRCA9IG51bGw7XHJcbiAgICAgICAgICAgICAgICBhbGVydCgnU29uZyBub3QgZm91bmQgb3IgZm9yYmlkZGVuJyk7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgICRzY29wZS5TTUxpbmtDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgIGZ1bmN0aW9uIGdldExvY2F0aW9uKGhyZWYpIHtcclxuICAgICAgICAgICAgdmFyIGxvY2F0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XHJcbiAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSBocmVmO1xyXG4gICAgICAgICAgICBpZiAobG9jYXRpb24uaG9zdCA9PSBcIlwiKSB7XHJcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gbG9jYXRpb24uaHJlZjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICByZXR1cm4gbG9jYXRpb247XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgbG9jYXRpb24gPSBnZXRMb2NhdGlvbigkc2NvcGUudHJhY2suU01MaW5rc1tpbmRleF0udmFsdWUpO1xyXG4gICAgICAgIHZhciBob3N0ID0gbG9jYXRpb24uaG9zdG5hbWUuc3BsaXQoJy4nKVswXTtcclxuICAgICAgICB2YXIgZmluZExpbmsgPSAkc2NvcGUudHJhY2suU01MaW5rcy5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICByZXR1cm4gaXRlbS5rZXkgPT09IGhvc3Q7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgICAgIGlmIChmaW5kTGluay5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3NbaW5kZXhdLmtleSA9IGhvc3Q7XHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLmFkZFNNTGluayA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS50cmFjay5TTUxpbmtzLnB1c2goe1xyXG4gICAgICAgICAgICBrZXk6ICcnLFxyXG4gICAgICAgICAgICB2YWx1ZTogJydcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICAkc2NvcGUuY2xlYXJPckZpbGUgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoJHNjb3BlLnRyYWNrLmRvd25sb2FkVVJMKSB7XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChcImlucHV0W3R5cGU9J2ZpbGUnXVwiKS52YWwobnVsbCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgICRzY29wZS5hcnRpc3RVUkxDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgICAgIHZhciBhcnRpc3QgPSB7fTtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgQXJ0aXN0VG9vbHNTZXJ2aWNlLnJlc29sdmVEYXRhKHtcclxuICAgICAgICAgICAgdXJsOiAkc2NvcGUudHJhY2suYXJ0aXN0c1tpbmRleF0udXJsXHJcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdHNbaW5kZXhdLmF2YXRhciA9IHJlcy5kYXRhLmF2YXRhcl91cmwgPyByZXMuZGF0YS5hdmF0YXJfdXJsIDogJyc7XHJcbiAgICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RzW2luZGV4XS51c2VybmFtZSA9IHJlcy5kYXRhLnVzZXJuYW1lO1xyXG4gICAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0c1tpbmRleF0uaWQgPSByZXMuZGF0YS5pZDtcclxuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgYWxlcnQoJ0FydGlzdHMgbm90IGZvdW5kJyk7XHJcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLnJlbW92ZUFydGlzdCA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdHMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgIH1cclxuXHJcbiAgICAkc2NvcGUuYWRkQXJ0aXN0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdHMucHVzaCh7XHJcbiAgICAgICAgICAgIHVybDogJycsXHJcbiAgICAgICAgICAgIGF2YXRhcjogJycsXHJcbiAgICAgICAgICAgIHVzZXJuYW1lOiAnJyxcclxuICAgICAgICAgICAgaWQ6IC0xLFxyXG4gICAgICAgICAgICBwZXJtYW5lbnRMaW5rOiBmYWxzZVxyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgICRzY29wZS5yZW1vdmVQbGF5bGlzdCA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrLnBsYXlsaXN0cy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgfVxyXG4gICAgJHNjb3BlLnBsYXlsaXN0VVJMQ2hhbmdlID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgQWRtaW5ETEdhdGVTZXJ2aWNlXHJcbiAgICAgICAgICAgIC5yZXNvbHZlRGF0YSh7XHJcbiAgICAgICAgICAgICAgICB1cmw6ICRzY29wZS50cmFjay5wbGF5bGlzdHNbaW5kZXhdLnVybFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS50cmFjay5wbGF5bGlzdHNbaW5kZXhdLmF2YXRhciA9IHJlcy5kYXRhLmFydHdvcmtfdXJsO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnBsYXlsaXN0c1tpbmRleF0udGl0bGUgPSByZXMuZGF0YS50aXRsZTtcclxuICAgICAgICAgICAgICAgICRzY29wZS50cmFjay5wbGF5bGlzdHNbaW5kZXhdLmlkID0gcmVzLmRhdGEuaWQ7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgICAgIGFsZXJ0KCdQbGF5bGlzdCBub3QgZm91bmQnKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gcmVzZXREb3dubG9hZEdhdGV3YXkoKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICRzY29wZS5tZXNzYWdlID0ge1xyXG4gICAgICAgICAgICB2YWw6ICcnLFxyXG4gICAgICAgICAgICB2aXNpYmxlOiBmYWxzZVxyXG4gICAgICAgIH07XHJcblxyXG4gICAgICAgICRzY29wZS50cmFjayA9IHtcclxuICAgICAgICAgICAgYXJ0aXN0VXNlcm5hbWU6ICcnLFxyXG4gICAgICAgICAgICB0cmFja1RpdGxlOiAnJyxcclxuICAgICAgICAgICAgdHJhY2tBcnR3b3JrVVJMOiAnJyxcclxuICAgICAgICAgICAgU01MaW5rczogW10sXHJcbiAgICAgICAgICAgIGxpa2U6IGZhbHNlLFxyXG4gICAgICAgICAgICBjb21tZW50OiBmYWxzZSxcclxuICAgICAgICAgICAgcmVwb3N0OiBmYWxzZSxcclxuICAgICAgICAgICAgYXJ0aXN0czogW3tcclxuICAgICAgICAgICAgICAgIHVybDogJycsXHJcbiAgICAgICAgICAgICAgICBhdmF0YXI6ICcnLFxyXG4gICAgICAgICAgICAgICAgdXNlcm5hbWU6ICcnLFxyXG4gICAgICAgICAgICAgICAgaWQ6IC0xLFxyXG4gICAgICAgICAgICAgICAgcGVybWFuZW50TGluazogZmFsc2VcclxuICAgICAgICAgICAgfV0sXHJcbiAgICAgICAgICAgIHNob3dEb3dubG9hZFRyYWNrczogJ3VzZXInXHJcbiAgICAgICAgfTtcclxuICAgICAgICBhbmd1bGFyLmVsZW1lbnQoXCJpbnB1dFt0eXBlPSdmaWxlJ11cIikudmFsKG51bGwpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qIE1ldGhvZCBmb3IgZ2V0dGluZyBEb3dubG9hZEdhdGV3YXkgaW4gY2FzZSBvZiBlZGl0ICovXHJcblxyXG4gICAgJHNjb3BlLmdldERvd25sb2FkR2F0ZXdheSA9IGZ1bmN0aW9uKGRvd25sb2FkR2F0ZVdheUlEKSB7XHJcbiAgICAgICAgLy8gcmVzZXREb3dubG9hZEdhdGV3YXkoKTtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgQXJ0aXN0VG9vbHNTZXJ2aWNlXHJcbiAgICAgICAgICAgIC5nZXREb3dubG9hZEdhdGV3YXkoe1xyXG4gICAgICAgICAgICAgICAgaWQ6IGRvd25sb2FkR2F0ZVdheUlEXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKGhhbmRsZVJlc3BvbnNlKVxyXG4gICAgICAgICAgICAuY2F0Y2goaGFuZGxlRXJyb3IpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVSZXNwb25zZShyZXMpIHtcclxuXHJcbiAgICAgICAgICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gdHJ1ZTtcclxuICAgICAgICAgICAgJHNjb3BlLnRyYWNrID0gcmVzLmRhdGE7XHJcblxyXG4gICAgICAgICAgICB2YXIgU01MaW5rcyA9IHJlcy5kYXRhLlNNTGlua3MgPyByZXMuZGF0YS5TTUxpbmtzIDoge307XHJcbiAgICAgICAgICAgIHZhciBwZXJtYW5lbnRMaW5rcyA9IHJlcy5kYXRhLnBlcm1hbmVudExpbmtzID8gcmVzLmRhdGEucGVybWFuZW50TGlua3MgOiBbJyddO1xyXG4gICAgICAgICAgICB2YXIgU01MaW5rc0FycmF5ID0gW107XHJcbiAgICAgICAgICAgIHZhciBwZXJtYW5lbnRMaW5rc0FycmF5ID0gW107XHJcblxyXG4gICAgICAgICAgICBmb3IgKHZhciBsaW5rIGluIFNNTGlua3MpIHtcclxuICAgICAgICAgICAgICAgIFNNTGlua3NBcnJheS5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICBrZXk6IGxpbmssXHJcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6IFNNTGlua3NbbGlua11cclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIHBlcm1hbmVudExpbmtzLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICAgICAgICAgcGVybWFuZW50TGlua3NBcnJheS5wdXNoKHtcclxuICAgICAgICAgICAgICAgICAgICB1cmw6IGl0ZW1cclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICBpZiAoISRzY29wZS50cmFjay5zaG93RG93bmxvYWRUcmFja3MpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS50cmFjay5zaG93RG93bmxvYWRUcmFja3MgPSAndXNlcic7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MgPSBTTUxpbmtzQXJyYXk7XHJcbiAgICAgICAgICAgICRzY29wZS50cmFjay5wZXJtYW5lbnRMaW5rcyA9IHBlcm1hbmVudExpbmtzQXJyYXk7XHJcbiAgICAgICAgICAgICRzY29wZS50cmFjay5wbGF5bGlzdElEUyA9IFtdO1xyXG4gICAgICAgICAgICAvLyAkc2NvcGUudHJhY2suc2hvd0Rvd25sb2FkVHJhY2tzID0gKCRzY29wZS50cmFjay5zaG93RG93bmxvYWRUcmFja3MgPT09ICd1c2VyJykgPyB0cnVlIDogZmFsc2U7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS50cmFjayk7XHJcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihyZXMpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgICRzY29wZS5jbGVhck9ySW5wdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUudHJhY2suZG93bmxvYWRVUkwgPSBcIlwiO1xyXG4gICAgfVxyXG5cclxuICAgICRzY29wZS4kd2F0Y2goJ3RyYWNrJywgZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpIHtcclxuICAgICAgICBpZiAobmV3VmFsLnRyYWNrVGl0bGUpXHJcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndHJhY2tQcmV2aWV3RGF0YScsIEpTT04uc3RyaW5naWZ5KG5ld1ZhbCkpO1xyXG4gICAgfSwgdHJ1ZSk7XHJcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAgICRzdGF0ZVByb3ZpZGVyXHJcbiAgICAgICAgLnN0YXRlKCdhcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheVByZXZpZXcnLCB7XHJcbiAgICAgICAgICAgIHVybDogJy9kb3dubG9hZC1nYXRld2F5L3ByZXZpZXcnLFxyXG4gICAgICAgICAgICBwYXJhbXM6IHtcclxuICAgICAgICAgICAgICAgIHN1Ym1pc3Npb246IG51bGxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL3ZpZXdzL2FydGlzdFRvb2xzL3ByZXZpZXcuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBcnRpc3RUb29sc1ByZXZpZXdDb250cm9sbGVyJ1xyXG4gICAgICAgIH0pXHJcbn0pO1xyXG5cclxuXHJcbmFwcC5jb250cm9sbGVyKFwiQXJ0aXN0VG9vbHNQcmV2aWV3Q29udHJvbGxlclwiLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uLCAkd2luZG93LCAkdWliTW9kYWwsICR0aW1lb3V0LCBTZXNzaW9uU2VydmljZSwgQXJ0aXN0VG9vbHNTZXJ2aWNlKSB7XHJcbiAgICB2YXIgdHJhY2sgPSBKU09OLnBhcnNlKHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndHJhY2tQcmV2aWV3RGF0YScpKTtcclxuICAgIGNvbnNvbGUubG9nKHRyYWNrKTtcclxuICAgIGlmICghdHJhY2sudHJhY2tUaXRsZSkge1xyXG4gICAgICAgIGFsZXJ0KCdUcmFjayBOb3QgRm91bmQnKTtcclxuICAgICAgICAkc3RhdGUuZ28oXCJhcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheUxpc3RcIik7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgfVxyXG5cclxuICAgICRzY29wZS50cmFjayA9IHRyYWNrO1xyXG4gICAgJHNjb3BlLnBsYXllciA9IHt9O1xyXG4gICAgU0Muc3RyZWFtKCcvdHJhY2tzLycgKyAkc2NvcGUudHJhY2sudHJhY2tJRClcclxuICAgICAgICAudGhlbihmdW5jdGlvbihwKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5wbGF5ZXIgPSBwO1xyXG4gICAgICAgIH0pXHJcblxyXG4gICAgJHNjb3BlLnRvZ2dsZSA9IHRydWU7XHJcbiAgICAkc2NvcGUudG9nZ2xlUGxheSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS50b2dnbGUgPSAhJHNjb3BlLnRvZ2dsZTtcclxuICAgICAgICBpZiAoJHNjb3BlLnRvZ2dsZSkge1xyXG4gICAgICAgICAgICAkc2NvcGUucGxheWVyLnBhdXNlKCk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJHNjb3BlLnBsYXllci5wbGF5KCk7XHJcbiAgICAgICAgfVxyXG4gICAgfVxyXG4gICAgJHNjb3BlLm5vZGwgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBhbGVydCgnTm8gZG93bmxvYWQgaW4gcHJldmlldyBtb2RlLicpXHJcbiAgICB9XHJcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlclxyXG4gICAgLnN0YXRlKCdob21lJywge1xyXG4gICAgICB1cmw6ICcvJyxcclxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL3ZpZXdzL2hvbWUuaHRtbCcsXHJcbiAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcclxuICAgIH0pXHJcbiAgICAuc3RhdGUoJ2Fib3V0Jywge1xyXG4gICAgICB1cmw6ICcvYWJvdXQnLFxyXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvYWJvdXQuaHRtbCcsXHJcbiAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcclxuICAgIH0pXHJcbiAgICAuc3RhdGUoJ3NlcnZpY2VzJywge1xyXG4gICAgICB1cmw6ICcvc2VydmljZXMnLFxyXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3Mvc2VydmljZXMuaHRtbCcsXHJcbiAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcclxuICAgIH0pXHJcbiAgICAuc3RhdGUoJ2ZhcXMnLCB7XHJcbiAgICAgIHVybDogJy9mYXFzJyxcclxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL3ZpZXdzL2ZhcXMuaHRtbCcsXHJcbiAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcclxuICAgIH0pXHJcbiAgICAuc3RhdGUoJ2FwcGx5Jywge1xyXG4gICAgICB1cmw6ICcvYXBwbHknLFxyXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvYXBwbHkuaHRtbCcsXHJcbiAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcclxuICAgIH0pXHJcbiAgICAuc3RhdGUoJ2NvbnRhY3QnLCB7XHJcbiAgICAgIHVybDogJy9jb250YWN0JyxcclxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL3ZpZXdzL2NvbnRhY3QuaHRtbCcsXHJcbiAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcclxuICAgIH0pO1xyXG59KTtcclxuXHJcbmFwcC5jb250cm9sbGVyKCdIb21lQ29udHJvbGxlcicsIFsnJHJvb3RTY29wZScsXHJcbiAgJyRzdGF0ZScsXHJcbiAgJyRzY29wZScsXHJcbiAgJyRodHRwJyxcclxuICAnJGxvY2F0aW9uJyxcclxuICAnJHdpbmRvdycsXHJcbiAgJ0hvbWVTZXJ2aWNlJyxcclxuICBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgJHdpbmRvdywgSG9tZVNlcnZpY2UpIHtcclxuXHJcbiAgICAkc2NvcGUuYXBwbGljYXRpb25PYmogPSB7fTtcclxuICAgICRzY29wZS5hcnRpc3QgPSB7fTtcclxuICAgICRzY29wZS5zZW50ID0ge1xyXG4gICAgICBhcHBsaWNhdGlvbjogZmFsc2UsXHJcbiAgICAgIGFydGlzdEVtYWlsOiBmYWxzZVxyXG4gICAgfTtcclxuICAgICRzY29wZS5tZXNzYWdlID0ge1xyXG4gICAgICBhcHBsaWNhdGlvbjoge1xyXG4gICAgICAgIHZhbDogJycsXHJcbiAgICAgICAgdmlzaWJsZTogZmFsc2VcclxuICAgICAgfSxcclxuICAgICAgYXJ0aXN0RW1haWw6IHtcclxuICAgICAgICB2YWw6ICcnLFxyXG4gICAgICAgIHZpc2libGU6IGZhbHNlXHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLyogQXBwbHkgcGFnZSBzdGFydCAqL1xyXG5cclxuICAgICRzY29wZS50b2dnbGVBcHBsaWNhdGlvblNlbnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XHJcbiAgICAgICAgYXBwbGljYXRpb246IHtcclxuICAgICAgICAgIHZhbDogJycsXHJcbiAgICAgICAgICB2aXNpYmxlOiBmYWxzZVxyXG4gICAgICAgIH1cclxuICAgICAgfTtcclxuICAgICAgJHNjb3BlLnNlbnQuYXBwbGljYXRpb24gPSAhJHNjb3BlLnNlbnQuYXBwbGljYXRpb247XHJcbiAgICB9O1xyXG5cclxuICAgICRzY29wZS5zYXZlQXBwbGljYXRpb24gPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgICRzY29wZS5tZXNzYWdlLmFwcGxpY2F0aW9uID0ge1xyXG4gICAgICAgIHZhbDogJycsXHJcbiAgICAgICAgdmlzaWJsZTogZmFsc2VcclxuICAgICAgfTtcclxuXHJcbiAgICAgIEhvbWVTZXJ2aWNlXHJcbiAgICAgICAgLnNhdmVBcHBsaWNhdGlvbigkc2NvcGUuYXBwbGljYXRpb25PYmopXHJcbiAgICAgICAgLnRoZW4oc2F2ZUFwcGxpY2F0aW9uUmVzcG9uc2UpXHJcbiAgICAgICAgLmNhdGNoKHNhdmVBcHBsaWNhdGlvbkVycm9yKVxyXG5cclxuICAgICAgZnVuY3Rpb24gc2F2ZUFwcGxpY2F0aW9uUmVzcG9uc2UocmVzKSB7XHJcbiAgICAgICAgaWYgKHJlcy5zdGF0dXMgPT09IDIwMCkge1xyXG4gICAgICAgICAgJHNjb3BlLmFwcGxpY2F0aW9uT2JqID0ge307XHJcbiAgICAgICAgICAkc2NvcGUuc2VudC5hcHBsaWNhdGlvbiA9IHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBzYXZlQXBwbGljYXRpb25FcnJvcihyZXMpIHtcclxuICAgICAgICBpZihyZXMuc3RhdHVzID09PSA0MDApIHtcclxuICAgICAgICAgICRzY29wZS5tZXNzYWdlLmFwcGxpY2F0aW9uID0ge1xyXG4gICAgICAgICAgICB2YWw6ICdFbWFpbCBhbHJlYWR5IGV4aXN0cyEnLFxyXG4gICAgICAgICAgICB2aXNpYmxlOiB0cnVlXHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgIH1cclxuICAgICAgICAkc2NvcGUubWVzc2FnZS5hcHBsaWNhdGlvbiA9IHtcclxuICAgICAgICAgIHZhbDogJ0Vycm9yIGluIHByb2Nlc3NpbmcgeW91ciByZXF1ZXN0JyxcclxuICAgICAgICAgIHZpc2libGU6IHRydWVcclxuICAgICAgICB9O1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIC8qIEFwcGx5IHBhZ2UgZW5kICovXHJcblxyXG4gICAgLyogQXJ0aXN0IFRvb2xzIHBhZ2Ugc3RhcnQgKi9cclxuICAgIFxyXG4gICAgJHNjb3BlLnRvZ2dsZUFydGlzdEVtYWlsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICRzY29wZS5tZXNzYWdlID0ge1xyXG4gICAgICAgIGFydGlzdEVtYWlsOiB7XHJcbiAgICAgICAgICB2YWw6ICcnLFxyXG4gICAgICAgICAgdmlzaWJsZTogZmFsc2VcclxuICAgICAgICB9XHJcbiAgICAgIH07XHJcbiAgICAgICRzY29wZS5zZW50LmFydGlzdEVtYWlsID0gISRzY29wZS5zZW50LmFydGlzdEVtYWlsO1xyXG4gICAgfTtcclxuXHJcbiAgICAkc2NvcGUuc2F2ZUFydGlzdEVtYWlsID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIEhvbWVTZXJ2aWNlXHJcbiAgICAgICAgLnNhdmVBcnRpc3RFbWFpbCgkc2NvcGUuYXJ0aXN0KVxyXG4gICAgICAgIC50aGVuKGFydGlzdEVtYWlsUmVzcG9uc2UpXHJcbiAgICAgICAgLmNhdGNoKGFydGlzdEVtYWlsRXJyb3IpXHJcblxyXG4gICAgICBmdW5jdGlvbiBhcnRpc3RFbWFpbFJlc3BvbnNlKHJlcykge1xyXG4gICAgICAgIGlmIChyZXMuc3RhdHVzID09PSAyMDApIHtcclxuICAgICAgICAgICRzY29wZS5hcnRpc3QgPSB7fTtcclxuICAgICAgICAgICRzY29wZS5zZW50LmFydGlzdEVtYWlsID0gdHJ1ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGZ1bmN0aW9uIGFydGlzdEVtYWlsRXJyb3IocmVzKSB7XHJcbiAgICAgICAgaWYocmVzLnN0YXR1cyA9PT0gNDAwKSB7XHJcbiAgICAgICAgICAkc2NvcGUubWVzc2FnZS5hcnRpc3RFbWFpbCA9IHtcclxuICAgICAgICAgICAgdmFsOiAnRW1haWwgYWxyZWFkeSBleGlzdHMhJyxcclxuICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZVxyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgICRzY29wZS5tZXNzYWdlLmFydGlzdEVtYWlsID0ge1xyXG4gICAgICAgICAgdmFsOiAnRXJyb3IgaW4gcHJvY2Vzc2luZyB5b3VyIHJlcXVlc3QnLFxyXG4gICAgICAgICAgdmlzaWJsZTogdHJ1ZVxyXG4gICAgICAgIH07XHJcbiAgICAgIH1cclxuICAgIH07XHJcblxyXG4gICAgLyogQXJ0aXN0IFRvb2xzIHBhZ2UgZW5kICovXHJcbiAgfVxyXG5dKTtcclxuXHJcbmFwcC5kaXJlY3RpdmUoJ2FmZml4ZXInLCBmdW5jdGlvbigkd2luZG93KSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgbGluazogZnVuY3Rpb24oJHNjb3BlLCAkZWxlbWVudCkge1xyXG4gICAgICB2YXIgd2luID0gYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpO1xyXG4gICAgICB2YXIgdG9wT2Zmc2V0ID0gJGVsZW1lbnRbMF0ub2Zmc2V0VG9wO1xyXG5cclxuICAgICAgZnVuY3Rpb24gYWZmaXhFbGVtZW50KCkge1xyXG5cclxuICAgICAgICBpZiAoJHdpbmRvdy5wYWdlWU9mZnNldCA+IHRvcE9mZnNldCkge1xyXG4gICAgICAgICAgJGVsZW1lbnQuY3NzKCdwb3NpdGlvbicsICdmaXhlZCcpO1xyXG4gICAgICAgICAgJGVsZW1lbnQuY3NzKCd0b3AnLCAnMy41JScpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAkZWxlbWVudC5jc3MoJ3Bvc2l0aW9uJywgJycpO1xyXG4gICAgICAgICAgJGVsZW1lbnQuY3NzKCd0b3AnLCAnJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgIHdpbi51bmJpbmQoJ3Njcm9sbCcsIGFmZml4RWxlbWVudCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICB3aW4uYmluZCgnc2Nyb2xsJywgYWZmaXhFbGVtZW50KTtcclxuICAgIH1cclxuICB9O1xyXG59KSIsIlxyXG5cclxuYXBwLnNlcnZpY2UoJ0FydGlzdFRvb2xzU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbigkaHR0cCl7XHJcblxyXG5cdGZ1bmN0aW9uIHJlc29sdmVEYXRhKGRhdGEpIHtcclxuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIGRhdGEpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2V0RG93bmxvYWRMaXN0KCkge1xyXG5cdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS9kYXRhYmFzZS9kb3dubG9hZHVybCcpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2V0RG93bmxvYWRHYXRld2F5KGRhdGEpIHtcclxuXHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZGF0YWJhc2UvZG93bmxvYWR1cmwvJyArIGRhdGEuaWQpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZGVsZXRlRG93bmxvYWRHYXRld2F5KGRhdGEpIHtcclxuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL2Rvd25sb2FkdXJsL2RlbGV0ZScsIGRhdGEpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2F2ZVByb2ZpbGVJbmZvKGRhdGEpIHtcclxuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL3Byb2ZpbGUvZWRpdCcsIGRhdGEpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gc2F2ZVNvdW5kQ2xvdWRBY2NvdW50SW5mbyhkYXRhKSB7XHJcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS9wcm9maWxlL3NvdW5kY2xvdWQnLCBkYXRhKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIGdldFRyYWNrTGlzdEZyb21Tb3VuZGNsb3VkKGRhdGEpIHtcclxuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL3RyYWNrcy9saXN0JywgZGF0YSk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4ge1xyXG5cdFx0cmVzb2x2ZURhdGE6IHJlc29sdmVEYXRhLFxyXG5cdFx0Z2V0RG93bmxvYWRMaXN0OiBnZXREb3dubG9hZExpc3QsXHJcblx0XHRnZXREb3dubG9hZEdhdGV3YXk6IGdldERvd25sb2FkR2F0ZXdheSxcclxuXHRcdHNhdmVQcm9maWxlSW5mbzogc2F2ZVByb2ZpbGVJbmZvLFxyXG5cdFx0ZGVsZXRlRG93bmxvYWRHYXRld2F5OiBkZWxldGVEb3dubG9hZEdhdGV3YXksXHJcblx0XHRzYXZlU291bmRDbG91ZEFjY291bnRJbmZvOiBzYXZlU291bmRDbG91ZEFjY291bnRJbmZvLFxyXG5cdFx0Z2V0VHJhY2tMaXN0RnJvbVNvdW5kY2xvdWQ6IGdldFRyYWNrTGlzdEZyb21Tb3VuZGNsb3VkXHJcblx0fTtcclxufV0pO1xyXG4iLCJcclxuXHJcbmFwcC5zZXJ2aWNlKCdIb21lU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbigkaHR0cCl7XHJcblx0XHJcblx0ZnVuY3Rpb24gc2F2ZUFwcGxpY2F0aW9uKGRhdGEpIHtcclxuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2hvbWUvYXBwbGljYXRpb24nLCBkYXRhKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHNhdmVBcnRpc3RFbWFpbChkYXRhKSB7XHJcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9ob21lL2FydGlzdGVtYWlsJywgZGF0YSk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4ge1xyXG5cdFx0c2F2ZUFwcGxpY2F0aW9uOiBzYXZlQXBwbGljYXRpb24sXHJcblx0XHRzYXZlQXJ0aXN0RW1haWw6IHNhdmVBcnRpc3RFbWFpbFxyXG5cdH07XHJcbn1dKTtcclxuIl0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
