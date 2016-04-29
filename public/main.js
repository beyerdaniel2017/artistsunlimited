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
  $scope.showTotal = 0;
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
    console.log('ay');
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
    if ($scope.auDLLink) $scope.showTotal = parseFloat($scope.total * 0.9).toFixed(2);else $scope.showTotal = $scope.total;

    $scope.selectedChannels[channel.displayName] = $scope.selectedChannels[channel.displayName] == true ? false : true;

    channel.addtocart = channel.addtocart ? false : true;
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
    sub[chan.displayName] = !sub[chan.displayName];
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImRhdGFiYXNlL2RhdGFiYXNlLmpzIiwiZnNhL2ZzYS1wcmUtYnVpbHQuanMiLCJsb2dpbi9sb2dpbi5qcyIsImxvZ2luL29FbWJlZEZhY3RvcnkuanMiLCJwYXkvcGF5LmpzIiwicGF5L3RoYW5reW91LmpzIiwic2NoZWR1bGVyL3NjaGVkdWxlci5qcyIsInN1Ym1pdC9zdWJtaXQuanMiLCJhcnRpc3RUb29scy9TQ1Jlc29sdmUvU0NSZXNvbHZlLmpzIiwiYXV0aC9zZXJ2aWNlcy9hdXRoU2VydmljZS5qcyIsImF1dGgvc2VydmljZXMvc2Vzc2lvblNlcnZpY2UuanMiLCJhdXRoL2NvbnRyb2xsZXJzL2F1dGhDb250cm9sbGVyLmpzIiwiZG93bmxvYWRUcmFjay9jb250cm9sbGVycy9hZG1pbkRMR2F0ZS5qcyIsImRvd25sb2FkVHJhY2svY29udHJvbGxlcnMvZG93bmxvYWRUcmFja0NvbnRyb2xsZXIuanMiLCJkb3dubG9hZFRyYWNrL3NlcnZpY2VzL2FkbWluRExHYXRlU2VydmljZS5qcyIsImRvd25sb2FkVHJhY2svc2VydmljZXMvZG93bmxvYWRUcmFja1NlcnZpY2UuanMiLCJkYXRhYmFzZS9hdXRvRW1haWxzL2F1dG9FbWFpbHMuanMiLCJkYXRhYmFzZS9hdXRvRW1haWxzL2F1dG9FbWFpbHNMaXN0LmpzIiwiaG9tZS9jb250cm9sbGVycy9hcnRpc3RUb29sc0NvbnRyb2xsZXIuanMiLCJob21lL2NvbnRyb2xsZXJzL2FydGlzdFRvb2xzRG93bmxvYWRHYXR3YXkuanMiLCJob21lL2NvbnRyb2xsZXJzL2FydGlzdFRvb2xzUHJldmlld0NvbnRyb2xsZXIuanMiLCJob21lL2NvbnRyb2xsZXJzL2hvbWVDb250cm9sbGVyLmpzIiwiaG9tZS9zZXJ2aWNlcy9hcnRpc3RzVG9vbHNTZXJ2aWNlLmpzIiwiaG9tZS9zZXJ2aWNlcy9ob21lU2VydmljZS5qcyIsInByZW1pZXJlL2NvbnRyb2xsZXJzL3ByZW1pZXJlQ29udHJvbGxlci5qcyIsInByZW1pZXJlL3NlcnZpY2VzL3ByZW1pZXJlU2VydmljZS5qcyIsInN1Ym1pc3Npb25zL2NvbnRyb2xsZXJzL3N1Ym1pc3Npb25Db250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQUEsQ0FBQTtBQUNBLE1BQUEsQ0FBQSxHQUFBLEdBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSx1QkFBQSxFQUFBLENBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQSxjQUFBLEVBQUEsV0FBQSxFQUFBLFdBQUEsRUFBQSx3QkFBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQSxpQkFBQSxFQUFBLHFCQUFBLEVBQUE7O0FBRUEsbUJBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7O0FBRUEsb0JBQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7O0NBRUEsQ0FBQSxDQUFBOzs7QUFHQSxHQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUEsYUFBQSxFQUFBLGNBQUEsRUFBQSxTQUFBLEVBQUE7Ozs7OztBQU1BLFdBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7O0FBRUEsYUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7O0dBRUEsQ0FBQSxDQUFBOzs7O0FBSUEsWUFBQSxDQUFBLEdBQUEsQ0FBQSxtQkFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxRQUFBLEVBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBZ0NBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFHQSxHQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsRUFBQSxDQUFBLFlBQUE7QUFDQSxTQUFBO0FBQ0EsU0FBQSxFQUFBO0FBQ0EsY0FBQSxFQUFBLEdBQUE7QUFDQSxhQUFBLEVBQUEsR0FBQTtLQUNBO0FBQ0EsUUFBQSxFQUFBLGNBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxVQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxVQUFBLFdBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxNQUFBLENBQUEsWUFBQTtBQUNBLGVBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxtQkFBQSxFQUFBLEtBQUE7QUFDQSxlQUFBLEVBQUEsRUFBQTtXQUNBLENBQUE7O0FBRUEsY0FBQSxXQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLElBQUEsWUFBQSxJQUFBLFdBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxXQUFBLEVBQUE7QUFDQSxpQkFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLHFCQUFBLEVBQUEsSUFBQTtBQUNBLGlCQUFBLEVBQUEsdUNBQUE7YUFDQSxDQUFBO0FBQ0EsbUJBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxtQkFBQTtXQUNBOztBQUVBLGNBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxHQUFBLEVBQUEsR0FBQSxJQUFBLEdBQUEsSUFBQSxFQUFBO0FBQ0EsaUJBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxxQkFBQSxFQUFBLElBQUE7QUFDQSxpQkFBQSxFQUFBLDRDQUFBO2FBQ0EsQ0FBQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsbUJBQUE7V0FDQTtBQUNBLGVBQUEsQ0FBQSxRQUFBLEdBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUEsQ0FBQTs7QUNuR0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxpQkFBQTtBQUNBLGVBQUEsRUFBQSwyQkFBQTtBQUNBLGNBQUEsRUFBQSxvQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsU0FBQSxDQUFBLGlCQUFBLEVBQUEsQ0FBQSxRQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxTQUFBO0FBQ0EsWUFBQSxFQUFBLElBQUE7QUFDQSxTQUFBLEVBQUEsSUFBQTtBQUNBLFlBQUEsRUFBQSw4REFBQSxHQUNBLG1IQUFBLEdBQ0EsUUFBQTtBQUNBLFFBQUEsRUFBQSxjQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLFVBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxFQUFBLENBQUEsY0FBQSxFQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsWUFBQSxVQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEdBQUEsVUFBQSxDQUFBO0FBQ0EsWUFBQSxVQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUE7U0FDQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsb0JBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBO0FBQ0EsUUFBQSxFQUFBLFVBQUE7QUFDQSxTQUFBLEVBQUEsVUFBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsT0FBQTtBQUNBLFNBQUEsRUFBQSxPQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxNQUFBO0FBQ0EsU0FBQSxFQUFBLE1BQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLEtBQUE7QUFDQSxTQUFBLEVBQUEsT0FBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsT0FBQTtBQUNBLFNBQUEsRUFBQSxPQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxhQUFBO0FBQ0EsU0FBQSxFQUFBLGFBQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLFdBQUE7QUFDQSxTQUFBLEVBQUEsV0FBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsa0JBQUE7QUFDQSxTQUFBLEVBQUEsV0FBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsVUFBQTtBQUNBLFNBQUEsRUFBQSxhQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxXQUFBO0FBQ0EsU0FBQSxFQUFBLGNBQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLFNBQUE7QUFDQSxTQUFBLEVBQUEsWUFBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsU0FBQTtBQUNBLFNBQUEsRUFBQSxZQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxVQUFBO0FBQ0EsU0FBQSxFQUFBLFVBQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLGdCQUFBO0FBQ0EsU0FBQSxFQUFBLGFBQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLFlBQUE7QUFDQSxTQUFBLEVBQUEsV0FBQTtHQUNBLENBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxxQkFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxLQUFBLEdBQUE7QUFDQSxZQUFBLEVBQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxFQUFBO0FBQ0EsU0FBQSxFQUFBLEVBQUE7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLEdBQUEsR0FBQTtBQUNBLFFBQUEsRUFBQSxTQUFBO0FBQ0EsU0FBQSxFQUFBLENBQUE7QUFDQSxXQUFBLEVBQUEsS0FBQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsVUFBQSxHQUFBO0FBQ0EsaUJBQUEsRUFBQSxFQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBO0tBQ0EsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsdUJBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGdGQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBO0tBQ0EsQ0FBQSxTQUNBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxrQkFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLEtBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxJQUFBLFNBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxNQUFBLEdBQUEsSUFBQSxDQUFBO0tBQ0EsTUFBQSxJQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxJQUFBLGFBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxNQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0E7QUFDQSxRQUFBLE9BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLEdBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxTQUFBLEdBQUEsT0FBQSxDQUFBO0tBQ0E7QUFDQSxRQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLEdBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxTQUFBLEdBQUEsT0FBQSxDQUFBO0tBQ0E7QUFDQSxRQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxFQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxTQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsT0FBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsZUFBQSxHQUFBLENBQUEsS0FBQSxLQUFBLElBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxlQUFBLEdBQUEsQ0FBQSxLQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7S0FDQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxlQUFBLEVBQUEsS0FBQSxDQUFBLGVBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLGVBQUEsQ0FBQTtBQUNBLFFBQUEsSUFBQSxHQUFBO0FBQ0EsV0FBQSxFQUFBLEtBQUE7QUFDQSxjQUFBLEVBQUEsVUFBQSxDQUFBLFFBQUE7S0FDQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLHlCQUFBLEVBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLHFCQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxnQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLG9CQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxXQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxHQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLFNBQUEsR0FBQSxPQUFBLENBQUE7S0FDQTtBQUNBLFFBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxXQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxHQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLFNBQUEsR0FBQSxPQUFBLENBQUE7S0FDQTtBQUNBLFFBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxLQUFBLEVBQUEsS0FBQSxDQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsV0FBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsSUFBQSxHQUFBO0FBQ0EsV0FBQSxFQUFBLEtBQUE7QUFDQSxjQUFBLEVBQUEsVUFBQSxDQUFBLFFBQUE7S0FDQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLDRCQUFBLEVBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLGNBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLDJCQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxnQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxHQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsVUFBQSxFQUFBLFFBQUE7QUFDQSxjQUFBLEVBQUEsUUFBQTtLQUNBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxxQkFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSwyQkFBQSxHQUFBLEtBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLHFCQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSwwQkFBQSxFQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBO0FBQ0EscUJBQUEsRUFBQSxFQUFBO09BQ0EsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxpQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLDRCQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7O0FBR0EsUUFBQSxDQUFBLEVBQUEsQ0FBQSxjQUFBLEVBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxRQUFBLFVBQUEsR0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsR0FBQSxVQUFBLENBQUE7QUFDQSxRQUFBLFVBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsZ0JBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQy9OQSxDQUFBLFlBQUE7O0FBRUEsY0FBQSxDQUFBOztBQUVBLE1BQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxFQUFBLE1BQUEsSUFBQSxLQUFBLENBQUEsd0JBQUEsQ0FBQSxDQUFBOztBQUVBLE1BQUEsR0FBQSxHQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsYUFBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBOztBQUVBLEtBQUEsQ0FBQSxPQUFBLENBQUEsWUFBQSxFQUFBLFlBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsRUFBQSxNQUFBLElBQUEsS0FBQSxDQUFBLHNCQUFBLENBQUEsQ0FBQTtBQUNBLFdBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQSxDQUFBOztBQUVBLEtBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLFVBQUEsRUFBQTtBQUNBLFdBQUE7QUFDQSxRQUFBLEVBQUEsWUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxFQUFBLENBQUEsU0FBQSxFQUFBLFlBQUE7QUFDQSxjQUFBLElBQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxvQkFBQSxDQUFBLE1BQUEsQ0FBQSxZQUFBO0FBQ0Esb0JBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO1dBQ0EsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0E7QUFDQSxVQUFBLEVBQUEsY0FBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLFFBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUEsWUFBQTtBQUNBLGNBQUEsSUFBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLG9CQUFBLENBQUEsTUFBQSxDQUFBLFlBQUE7QUFDQSxnQkFBQSxRQUFBLEVBQUE7QUFDQSxzQkFBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7YUFDQTtXQUNBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBO0tBQ0EsQ0FBQTtHQUNBLENBQUEsQ0FBQTs7QUFFQSxLQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFFBQUEsYUFBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxhQUFBLFdBQUEsR0FBQTtBQUNBLGFBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxrQ0FBQSxDQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxtQkFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUEsQ0FBQSxRQUFBO0FBQ0Esb0JBQUEsRUFBQSxJQUFBLENBQUEsV0FBQTtBQUNBLGFBQUEsRUFBQSxjQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxTQUFBLEdBQUE7QUFDQSxhQUFBLGFBQUEsQ0FBQTtLQUNBOztBQUVBLFdBQUE7QUFDQSxpQkFBQSxFQUFBLFdBQUE7QUFDQSxlQUFBLEVBQUEsU0FBQTtBQUNBLGVBQUEsRUFBQSxTQUFBO0tBQ0EsQ0FBQTtHQUNBLENBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBeUhBLENBQUEsRUFBQSxDQUFBO0FDdExBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsUUFBQTtBQUNBLGVBQUEsRUFBQSxxQkFBQTtBQUNBLGNBQUEsRUFBQSxzQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFHQSxHQUFBLENBQUEsVUFBQSxDQUFBLHNCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsV0FBQSxFQUFBLGFBQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLGVBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsV0FBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsS0FBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxFQUFBO0FBQ0EsY0FBQSxFQUFBLE1BQUEsQ0FBQSxRQUFBO0tBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxlQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxHQUFBLFFBQUEsQ0FBQTtLQUNBLENBQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxXQUFBLEdBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLGFBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSwwQkFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEdBQUEsQ0FBQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxVQUFBLENBQUEsUUFBQTtPQUNBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsYUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLGFBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsRUFBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsRUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEseUJBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDOURBLEdBQUEsQ0FBQSxPQUFBLENBQUEsZUFBQSxFQUFBLFlBQUE7QUFDQSxTQUFBO0FBQ0EsYUFBQSxFQUFBLG1CQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxtQ0FBQSxHQUFBLEdBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxHQUFBLFFBQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsS0FBQTtBQUNBLGlCQUFBLEVBQUEsR0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ1ZBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsb0JBQUE7QUFDQSxlQUFBLEVBQUEsaUJBQUE7QUFDQSxjQUFBLEVBQUEsZUFBQTtBQUNBLFdBQUEsRUFBQTtBQUNBLGNBQUEsRUFBQSxrQkFBQSxLQUFBLEVBQUE7QUFDQSxlQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsZUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBO0FBQ0EsZ0JBQUEsRUFBQSxvQkFBQSxLQUFBLEVBQUEsWUFBQSxFQUFBO0FBQ0EsZUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDBCQUFBLEdBQUEsWUFBQSxDQUFBLFlBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGlCQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7T0FDQTtBQUNBLFdBQUEsRUFBQSxlQUFBLFVBQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLEdBQUEsVUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLGlCQUFBLEtBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBO0tBQ0E7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxtQkFBQSxFQUFBLFlBQUE7QUFDQSxTQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsV0FBQSxVQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxlQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsVUFBQSxFQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsVUFBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxVQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLE1BQUEsVUFBQSxDQUFBLElBQUEsRUFBQSxNQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLEtBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxJQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQSxhQUFBLEVBQUEsS0FBQTtBQUNBLGFBQUEsRUFBQSxHQUFBO0dBQ0EsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLEVBQUEsRUFBQTtBQUNBLFdBQUEsVUFBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxZQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLHFCQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsR0FBQSxLQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGdCQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFFBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsZ0JBQUEsQ0FBQSxFQUFBLENBQUEsV0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBO0dBQ0EsQ0FBQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0Esa0JBQUEsRUFBQSxVQUFBLENBQUEsVUFBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsWUFBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLFNBQUEsSUFBQSxHQUFBLElBQUEsTUFBQSxDQUFBLGdCQUFBLEVBQUE7QUFDQSxVQUFBLE1BQUEsQ0FBQSxnQkFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsWUFBQSxJQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxpQkFBQSxFQUFBLENBQUEsV0FBQSxJQUFBLEdBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtPQUNBO0tBQ0E7QUFDQSxRQUFBLE1BQUEsQ0FBQSxRQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTtBQUNBLFdBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxLQUFBLElBQUEsQ0FBQSxFQUFBO0FBQ0EsVUFBQSxNQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLHFCQUFBLEdBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLG1CQUFBLEVBQUEsSUFBQTtBQUNBLHFCQUFBLEVBQUEsb0JBQUE7QUFDQSxvQkFBQSxFQUFBLHlCQUFBO0FBQ0EsZUFBQSxFQUFBLE1BQUE7U0FDQSxDQUFBLENBQUE7T0FDQSxNQUFBO0FBQ0EsY0FBQSxDQUFBLFdBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtPQUNBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxlQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEscUJBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtLQUNBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxRQUFBLFVBQUEsR0FBQTtBQUNBLGNBQUEsRUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxVQUFBO0FBQ0EsZ0JBQUEsRUFBQSxVQUFBLENBQUEsVUFBQTtLQUNBLENBQUE7QUFDQSxTQUFBLElBQUEsR0FBQSxJQUFBLE1BQUEsQ0FBQSxnQkFBQSxFQUFBO0FBQ0EsVUFBQSxNQUFBLENBQUEsZ0JBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQTtBQUNBLFlBQUEsSUFBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsRUFBQSxFQUFBO0FBQ0EsaUJBQUEsRUFBQSxDQUFBLFdBQUEsSUFBQSxHQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO09BQ0E7S0FDQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsNkJBQUEsRUFBQSxVQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUdBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLE9BQUEsQ0FBQSxTQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQTtLQUNBLE1BQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxJQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUE7S0FDQTtBQUNBLFFBQUEsTUFBQSxDQUFBLFFBQUEsRUFBQSxNQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxLQUNBLE1BQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsZ0JBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLGdCQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsQ0FBQSxJQUFBLElBQUEsR0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLFdBQUEsQ0FBQSxTQUFBLEdBQUEsT0FBQSxDQUFBLFNBQUEsR0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBO0dBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLHlCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsRUFFQSxDQUFBLENBQUE7QUN6SUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxXQUFBO0FBQ0EsZUFBQSxFQUFBLHNCQUFBO0FBQ0EsY0FBQSxFQUFBLG9CQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsb0JBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBO0FBQ0EsUUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxPQUFBLENBQUEsR0FBQSxDQUFBLG1DQUFBLEVBQUEsU0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE1BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsRUFBQSxFQUFBO0FBQ0EsUUFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFNBQUEsQ0FBQSw0Q0FBQSxDQUFBLENBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUN0QkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxZQUFBO0FBQ0EsZUFBQSxFQUFBLDZCQUFBO0FBQ0EsY0FBQSxFQUFBLHFCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUdBLEdBQUEsQ0FBQSxVQUFBLENBQUEscUJBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxXQUFBLEVBQUEsT0FBQSxFQUFBOztBQUVBLFFBQUEsQ0FBQSxZQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxNQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsYUFBQSxDQUFBO0FBQ0EsTUFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7R0FDQTtBQUNBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsUUFBQSxHQUFBLGNBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsT0FBQSxHQUFBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsSUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO0dBRUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsV0FBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBLGVBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLHFCQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsT0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxFQUFBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsT0FBQSxHQUFBLENBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsVUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsUUFBQSxLQUFBLEdBQUEsSUFBQSxJQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsS0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQUEsR0FBQSxJQUFBLEVBQUEsT0FBQTtBQUNBLFVBQUEsQ0FBQSxXQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxXQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsWUFBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLFNBQUEsSUFBQSxHQUFBLEVBQUE7QUFDQSxVQUFBLE9BQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLGFBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsU0FBQSxHQUFBO0FBQ0EsaUJBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLFNBQUE7QUFDQSxXQUFBLEVBQUEsT0FBQTtBQUNBLFlBQUEsRUFBQSxLQUFBO09BQ0EsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO0tBQ0EsTUFBQTtBQUNBLFlBQUEsQ0FBQSxZQUFBLEdBQUEsb0NBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsb0NBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxRQUFBLENBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsS0FBQTtBQUNBLGlCQUFBLEVBQUEsR0FBQTtPQUNBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxTQUFBLENBQUEsT0FBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxZQUFBLEdBQUEsU0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsRUFBQTtBQUNBLFNBQUEsRUFBQSxNQUFBLENBQUEsWUFBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxTQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFNBQUEsQ0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxVQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLFlBQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxRQUFBLENBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsS0FBQTtBQUNBLGlCQUFBLEVBQUEsR0FBQTtPQUNBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEdBQUEsUUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFdBQUEsVUFBQSxDQUFBLGNBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsR0FBQSxHQUFBLEdBQUEsVUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsV0FBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsaUJBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLHdCQUFBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBLE1BQUE7QUFDQSxVQUFBLFdBQUEsR0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGVBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0FBQ0EsaUJBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLFVBQUEsTUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFNBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLG1CQUFBLENBQUEsQ0FBQTtLQUNBLE1BQUE7QUFDQSxVQUFBLE1BQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxhQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsRUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGVBQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxXQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxtQkFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsQ0FBQTtXQUNBLENBQUEsQ0FBQTtBQUNBLHFCQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsc0JBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0EsTUFBQTtBQUNBLGNBQUEsQ0FBQSxRQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxFQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsZUFBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxjQUFBLFdBQUEsR0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLG1CQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxDQUFBO1dBQ0EsQ0FBQSxDQUFBO0FBQ0EscUJBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLHNCQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsV0FBQSxHQUFBLDhDQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLEdBQUEsWUFBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLGlDQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLEdBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxHQUFBLE1BQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLEdBQUEsZ0JBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxJQUFBLEdBQUEsU0FBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7Ozs7O0FBTUEsUUFBQSxDQUFBLFNBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFNBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsRUFBQSxPQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxZQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsRUFBQTtBQUNBLFNBQUEsRUFBQSxNQUFBLENBQUEsWUFBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxvQkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFFBQUEsS0FBQSxJQUFBLENBQUEsRUFBQSxPQUFBO0FBQ0EsUUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxRQUFBLEtBQUEsSUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBLE9BQUE7QUFDQSxRQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsY0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQkEsUUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsY0FBQSxDQUFBLFlBQUE7QUFDQSxZQUFBLENBQUEsV0FBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLENBQUEsbUNBQUEsR0FBQSxHQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsaUJBQUEsRUFBQSxRQUFBLENBQUEsY0FBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLEdBQUEsUUFBQSxDQUFBO0FBQ0EsbUJBQUEsRUFBQSxLQUFBO0FBQ0EsbUJBQUEsRUFBQSxHQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0EsRUFBQSxFQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGNBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxZQUFBO0FBQ0EsV0FBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLENBQUEsbUNBQUEsR0FBQSxNQUFBLEVBQUE7QUFDQSxpQkFBQSxFQUFBLFFBQUEsQ0FBQSxjQUFBLENBQUEsTUFBQSxHQUFBLFFBQUEsQ0FBQTtBQUNBLG1CQUFBLEVBQUEsS0FBQTtBQUNBLG1CQUFBLEVBQUEsR0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBLEVBQUEsRUFBQSxDQUFBLENBQUE7R0FDQSxDQUFBO0FBQ0EsTUFBQSxNQUFBLENBQUEsT0FBQSxJQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLGNBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0dBQ0E7QUFDQSxRQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsU0FBQSxjQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsTUFBQSxRQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsTUFBQSxLQUFBLEdBQUEsSUFBQSxJQUFBLEVBQUEsQ0FBQTtBQUNBLE9BQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUE7QUFDQSxRQUFBLE1BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsSUFBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxNQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtBQUNBLFFBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFNBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtLQUNBO0FBQ0EsYUFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLEVBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtHQUNBO0FBQ0EsU0FBQSxRQUFBLENBQUE7Q0FDQTtBQ3ZUQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsWUFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFNBQUE7QUFDQSxlQUFBLEVBQUEsNEJBQUE7QUFDQSxjQUFBLEVBQUEsc0JBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxzQkFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBOztBQUVBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSx5QkFBQSxFQUFBO0FBQ0EsU0FBQSxFQUFBLE1BQUEsQ0FBQSxHQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLENBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsQ0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxDQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLEtBQUE7QUFDQSxpQkFBQSxFQUFBLEdBQUE7T0FDQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsR0FBQSxRQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLEtBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLDJCQUFBLENBQUEsQ0FBQTtLQUNBLE1BQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGlCQUFBLENBQUEsQ0FBQTtLQUNBLE1BQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxJQUFBLENBQUEsa0JBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxNQUFBLENBQUEsVUFBQSxDQUFBLEtBQUE7QUFDQSxlQUFBLEVBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBO0FBQ0EsWUFBQSxFQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsSUFBQTtBQUNBLGFBQUEsRUFBQSxNQUFBLENBQUEsVUFBQSxDQUFBLEtBQUE7QUFDQSxnQkFBQSxFQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsUUFBQTtBQUNBLGtCQUFBLEVBQUEsRUFBQTtBQUNBLGtCQUFBLEVBQUEsRUFBQTtPQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxlQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEseURBQUEsQ0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtPQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLCtCQUFBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ2hFQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FDQSxLQUFBLENBQUEsV0FBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFlBQUE7QUFDQSxlQUFBLEVBQUEseUNBQUE7QUFDQSxjQUFBLEVBQUEscUJBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxxQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSx5QkFBQSxFQUFBO0FBQ0EsU0FBQSxFQUFBLE1BQUEsQ0FBQSxHQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUN2QkEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsV0FBQSxLQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEsTUFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxTQUFBO0FBQ0EsU0FBQSxFQUFBLEtBQUE7QUFDQSxVQUFBLEVBQUEsTUFBQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUEsQ0FBQTs7QUNaQSxHQUFBLENBQUEsT0FBQSxDQUFBLGdCQUFBLEVBQUEsQ0FBQSxVQUFBLEVBQUEsVUFBQSxRQUFBLEVBQUE7O0FBRUEsV0FBQSxNQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLFVBQUEsR0FBQTtBQUNBLFlBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLE9BQUEsR0FBQTtBQUNBLFdBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFNBQUE7QUFDQSxVQUFBLEVBQUEsTUFBQTtBQUNBLGNBQUEsRUFBQSxVQUFBO0FBQ0EsV0FBQSxFQUFBLE9BQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBLENBQUE7O0FDckJBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUNBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsUUFBQTtBQUNBLFVBQUEsRUFBQTtBQUNBLGdCQUFBLEVBQUEsSUFBQTtLQUNBO0FBQ0EsZUFBQSxFQUFBLDBCQUFBO0FBQ0EsY0FBQSxFQUFBLGdCQUFBO0dBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsU0FBQTtBQUNBLGVBQUEsRUFBQSwyQkFBQTtBQUNBLGNBQUEsRUFBQSxnQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGdCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsV0FBQSxFQUFBLGNBQUEsRUFBQSxNQUFBLEVBQUE7QUFDQSxRQUFBLENBQUEsUUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxPQUFBLEVBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxLQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxTQUFBLEdBQUE7QUFDQSxpQkFBQSxFQUFBLHlCQUFBO0FBQ0EsWUFBQSxDQUFBLGFBQUEsR0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsaUJBQUEsRUFBQSxJQUFBO0FBQ0EsbUJBQUEsRUFBQSxxQkFBQTtBQUNBLGtCQUFBLEVBQUEsZ0JBQUE7QUFDQSxhQUFBLEVBQUEsTUFBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxLQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxLQUFBO0tBQ0EsQ0FBQTtBQUNBLGVBQUEsQ0FDQSxLQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxtQkFBQSxDQUFBLFNBQ0EsQ0FBQSxnQkFBQSxDQUFBLENBQUE7O0FBRUEsYUFBQSxtQkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFVBQUEsR0FBQSxDQUFBLE1BQUEsS0FBQSxHQUFBLElBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxzQkFBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEVBQUEsQ0FBQSxnQ0FBQSxDQUFBLENBQUE7T0FDQSxNQUFBO0FBQ0EsY0FBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLGFBQUEsRUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE9BQUE7QUFDQSxpQkFBQSxFQUFBLElBQUE7U0FDQSxDQUFBO09BQ0E7S0FDQTs7QUFFQSxhQUFBLGdCQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLFdBQUEsRUFBQSxrQ0FBQTtBQUNBLGVBQUEsRUFBQSxJQUFBO09BQ0EsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsaUJBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxZQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUdBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxLQUFBO0tBQ0EsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxRQUFBLElBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxlQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsV0FBQSxFQUFBLCtDQUFBO0FBQ0EsZUFBQSxFQUFBLElBQUE7T0FDQSxDQUFBO0FBQ0EsYUFBQTtLQUNBO0FBQ0EsZUFBQSxDQUNBLE1BQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLG9CQUFBLENBQUEsU0FDQSxDQUFBLGlCQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLG9CQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsaUJBQUEsQ0FBQSxHQUFBLEVBQUEsRUFBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsV0FBQSxHQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsNEJBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxHQUFBLENBQUEsV0FBQTtBQUNBLGdCQUFBLEVBQUEsTUFBQTtPQUNBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLG9CQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxVQUFBLFlBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsRUFBQSxDQUFBLCtCQUFBLEVBQUE7QUFDQSxzQkFBQSxFQUFBLFlBQUEsQ0FBQSxVQUFBO1NBQ0EsQ0FBQSxDQUFBO0FBQ0EsZUFBQTtPQUNBO0FBQ0EsWUFBQSxDQUFBLEVBQUEsQ0FBQSxnQ0FBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxXQUFBLENBQUEseUJBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDeEhBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEscUJBQUE7QUFDQSxlQUFBLEVBQUEseUNBQUE7QUFDQSxjQUFBLEVBQUEsdUJBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLGtCQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsMEJBQUE7QUFDQSxlQUFBLEVBQUEsOENBQUE7QUFDQSxjQUFBLEVBQUEsdUJBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLGtCQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEscUNBQUE7QUFDQSxlQUFBLEVBQUEseUNBQUE7QUFDQSxjQUFBLEVBQUEsdUJBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBR0EsR0FBQSxDQUFBLFVBQUEsQ0FBQSx1QkFBQSxFQUFBLENBQUEsWUFBQSxFQUNBLFFBQUEsRUFDQSxjQUFBLEVBQ0EsUUFBQSxFQUNBLE9BQUEsRUFDQSxXQUFBLEVBQ0EsU0FBQSxFQUNBLFdBQUEsRUFDQSxnQkFBQSxFQUNBLG9CQUFBLEVBQ0EsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsU0FBQSxFQUFBLGNBQUEsRUFBQSxrQkFBQSxFQUFBOztBQUVBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLGdCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLE9BQUEsRUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEtBQUE7R0FDQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLEtBQUEsR0FBQTtBQUNBLGtCQUFBLEVBQUEsYUFBQTtBQUNBLGNBQUEsRUFBQSxtQkFBQTtBQUNBLG1CQUFBLEVBQUEsOEJBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLFFBQUEsRUFBQSxLQUFBO0FBQ0EsV0FBQSxFQUFBLEtBQUE7QUFDQSxVQUFBLEVBQUEsS0FBQTtBQUNBLFdBQUEsRUFBQSxDQUFBO0FBQ0EsU0FBQSxFQUFBLEVBQUE7QUFDQSxZQUFBLEVBQUEsOEJBQUE7QUFDQSxjQUFBLEVBQUEsRUFBQTtBQUNBLFFBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxtQkFBQSxFQUFBLEtBQUE7S0FDQSxDQUFBO0FBQ0EsYUFBQSxFQUFBLENBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLFlBQUEsRUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEVBQUE7QUFDQSxRQUFBLEVBQUEsRUFBQTtLQUNBLENBQUE7R0FDQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLG1CQUFBLEdBQUEsRUFBQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLGFBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxTQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUEscUJBQUEsWUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGFBQUEsR0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsaUJBQUEsRUFBQSxJQUFBO0FBQ0EsbUJBQUEsRUFBQSxrQkFBQTtBQUNBLGtCQUFBLEVBQUEsdUJBQUE7QUFDQSxhQUFBLEVBQUEsTUFBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxhQUFBLENBQUEsS0FBQSxFQUFBLENBQUE7R0FDQSxDQUFBOzs7QUFHQSxRQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTs7OztBQUlBLFdBQUEsb0JBQUEsR0FBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGdCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEtBQUE7S0FDQSxDQUFBOztBQUVBLFVBQUEsQ0FBQSxLQUFBLEdBQUE7QUFDQSxvQkFBQSxFQUFBLGFBQUE7QUFDQSxnQkFBQSxFQUFBLG1CQUFBO0FBQ0EscUJBQUEsRUFBQSw4QkFBQTtBQUNBLGFBQUEsRUFBQSxFQUFBO0FBQ0EsVUFBQSxFQUFBLEtBQUE7QUFDQSxhQUFBLEVBQUEsS0FBQTtBQUNBLFlBQUEsRUFBQSxLQUFBO0FBQ0EsYUFBQSxFQUFBLENBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLGNBQUEsRUFBQSw4QkFBQTtBQUNBLGdCQUFBLEVBQUEsRUFBQTtBQUNBLFVBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxxQkFBQSxFQUFBLEtBQUE7T0FDQSxDQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLGNBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEVBQUE7QUFDQSxVQUFBLEVBQUEsRUFBQTtPQUNBLENBQUE7S0FDQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLE9BQUEsQ0FBQSxvQkFBQSxDQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7OztBQUdBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsWUFBQSxDQUFBLFNBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxrQkFBQSxDQUFBLFlBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTs7Ozs7O0tBTUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxjQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEtBQUEsRUFBQSxFQUFBO1VBV0EsNkJBQUEsR0FBQSxTQUFBLDZCQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsZUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEVBQUEsY0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxnQkFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsZUFBQSxFQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsR0FBQSxlQUFBLENBQUEsQ0FBQTtPQUNBOztVQUVBLGlCQUFBLEdBQUEsU0FBQSxpQkFBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFNBQUEsRUFBQSxTQUFBLEVBQUEsVUFBQSxFQUFBLFNBQUEsRUFBQSxZQUFBLEVBQUEsV0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUEsQ0FBQSxPQUFBO0FBQ0EsbUJBQUEsRUFBQSxJQUFBLENBQUEsR0FBQTthQUNBLENBQUEsQ0FBQTtXQUNBO1NBQ0EsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLGdCQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7T0FDQTs7VUFFQSxXQUFBLEdBQUEsU0FBQSxXQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsYUFBQSxDQUFBLDZCQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO09BQ0E7O0FBdkNBLFlBQUEsQ0FBQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esd0JBQUEsQ0FDQSxXQUFBLENBQUE7QUFDQSxXQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBO09BQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSw2QkFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLGlCQUFBLENBQUEsU0FDQSxDQUFBLFdBQUEsQ0FBQSxDQUFBO0tBZ0NBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsUUFBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxzQkFBQSxDQUNBLFdBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLE1BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxTQUNBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsbUJBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsWUFBQSxFQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLFFBQUEsRUFBQSxFQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxjQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxpQkFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxzQkFBQSxDQUNBLFdBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLE1BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUdBLFFBQUEsQ0FBQSxZQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLEVBQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQTtLQUNBOztBQUVBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsWUFBQSxFQUFBLDhCQUFBO0FBQ0EsY0FBQSxFQUFBLEVBQUE7QUFDQSxRQUFBLEVBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFlBQUE7OztBQUdBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEVBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFlBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFlBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxhQUFBLFdBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxVQUFBLFFBQUEsR0FBQSxRQUFBLENBQUEsYUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLFFBQUEsQ0FBQSxJQUFBLElBQUEsRUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtPQUNBO0FBQ0EsYUFBQSxRQUFBLENBQUE7S0FDQTs7QUFFQSxRQUFBLFFBQUEsR0FBQSxXQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsUUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLEdBQUEsS0FBQSxJQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxRQUFBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUE7S0FDQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxnQkFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUE7S0FDQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsUUFBQSxPQUFBLEdBQUEsSUFBQSxRQUFBLEVBQUEsQ0FBQTs7Ozs7QUFLQSxTQUFBLElBQUEsSUFBQSxJQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsRUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7S0FDQTs7OztBQUlBLFFBQUEsT0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQTtBQUNBLGFBQUEsSUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLEVBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBOzs7O0FBSUEsUUFBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsTUFBQSxDQUFBLFdBQUEsRUFBQSxJQUFBLENBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7Ozs7QUFJQSxRQUFBLE9BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsRUFBQSxJQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7Ozs7QUFJQSxRQUFBLE9BQUEsR0FBQTtBQUNBLFlBQUEsRUFBQSxNQUFBO0FBQ0EsU0FBQSxFQUFBLDJCQUFBO0FBQ0EsYUFBQSxFQUFBO0FBQ0Esc0JBQUEsRUFBQSxTQUFBO09BQ0E7QUFDQSxzQkFBQSxFQUFBLE9BQUEsQ0FBQSxRQUFBO0FBQ0EsVUFBQSxFQUFBLE9BQUE7S0FDQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsRUFBQTs7QUFFQSxlQUFBO09BQ0E7QUFDQSwwQkFBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsU0FBQSxDQUFBLFdBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLDRCQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0Esb0JBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0Esc0JBQUEsQ0FDQSxlQUFBLEVBQUEsQ0FDQSxJQUFBLENBQUEsY0FBQSxDQUFBLFNBQ0EsQ0FBQSxXQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLGNBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsbUJBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxXQUFBLENBQUEsR0FBQSxFQUFBLEVBRUE7R0FDQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLGtCQUFBLEdBQUEsVUFBQSxpQkFBQSxFQUFBOztBQUVBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FDQSxrQkFBQSxDQUFBO0FBQ0EsUUFBQSxFQUFBLGlCQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxjQUFBLENBQUEsU0FDQSxDQUFBLFdBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsY0FBQSxDQUFBLEdBQUEsRUFBQTs7QUFFQSxZQUFBLENBQUEsZ0JBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7O0FBRUEsVUFBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxZQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLFdBQUEsSUFBQSxJQUFBLElBQUEsT0FBQSxFQUFBO0FBQ0Esb0JBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxhQUFBLEVBQUEsSUFBQTtBQUNBLGVBQUEsRUFBQSxPQUFBLENBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0E7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxZQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsV0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxxQkFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLFFBQUEsT0FBQSxDQUFBLDBDQUFBLENBQUEsRUFBQTtVQVVBLGNBQUEsR0FBQSxTQUFBLGNBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxtQkFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7T0FDQTs7VUFFQSxXQUFBLEdBQUEsU0FBQSxXQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7T0FDQTs7QUFoQkEsVUFBQSxpQkFBQSxHQUFBLE1BQUEsQ0FBQSxtQkFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esd0JBQUEsQ0FDQSxxQkFBQSxDQUFBO0FBQ0EsVUFBQSxFQUFBLGlCQUFBO09BQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxjQUFBLENBQUEsU0FDQSxDQUFBLFdBQUEsQ0FBQSxDQUFBO0tBVUEsTUFBQTtBQUNBLGFBQUEsS0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0NBQ0EsQ0FFQSxDQUFBLENBQUE7QUM1YkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxXQUFBO0FBQ0EsZUFBQSxFQUFBLGdEQUFBO0FBQ0EsY0FBQSxFQUFBLHlCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEseUJBQUEsRUFBQSxDQUFBLFlBQUEsRUFDQSxRQUFBLEVBQ0EsUUFBQSxFQUNBLE9BQUEsRUFDQSxXQUFBLEVBQ0EsU0FBQSxFQUNBLElBQUEsRUFDQSxzQkFBQSxFQUNBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsRUFBQSxFQUFBLG9CQUFBLEVBQUE7OztBQUdBLE1BQUEsU0FBQSxHQUFBLElBQUEsQ0FBQTs7OztBQUlBLFFBQUEsQ0FBQSxTQUFBLEdBQUE7QUFDQSxhQUFBLEVBQUEsc0JBQUE7QUFDQSxZQUFBLEVBQUEsYUFBQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsZUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0tBQ0EsTUFBQTtBQUNBLGVBQUEsQ0FBQSxJQUFBLEVBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsbUJBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxpQkFBQSxHQUFBLDhCQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsWUFBQSxHQUFBLEVBQUEsQ0FBQTs7OztBQUlBLFFBQUEsQ0FBQSxnQkFBQSxHQUFBLFlBQUE7O0FBRUEsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxRQUFBLE9BQUEsR0FBQSxTQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsT0FBQSxDQUFBO0FBQ0Esd0JBQUEsQ0FDQSxnQkFBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxvQkFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLG1CQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsUUFBQSxDQUFBLFNBQ0EsQ0FBQSx1QkFBQSxDQUFBLENBQUE7O0FBRUEsYUFBQSxvQkFBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsZUFBQTtBQUNBLDRCQUFBLEVBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsZUFBQSxHQUFBLEdBQUE7QUFDQSw2QkFBQSxFQUFBLFdBQUE7QUFDQSwyQkFBQSxFQUFBLE9BQUE7U0FDQSxDQUFBO09BQ0EsQ0FBQTs7QUFFQSxZQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBOztBQUVBLFVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxrQkFBQSxLQUFBLE1BQUEsRUFBQTtBQUNBLGVBQUEsb0JBQUEsQ0FBQSxlQUFBLENBQUE7QUFDQSxnQkFBQSxFQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsTUFBQTtBQUNBLGlCQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0EsTUFBQTtBQUNBLGVBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtPQUNBO0tBQ0E7O0FBRUEsYUFBQSxtQkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFVBQUEsT0FBQSxHQUFBLEtBQUEsUUFBQSxJQUFBLEdBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsWUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7T0FDQTtBQUNBLGFBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsUUFBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLGVBQUEsR0FBQSxNQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLHVCQUFBLEdBQUE7QUFDQSxXQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7OztBQUtBLFFBQUEsQ0FBQSxhQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSx5QkFBQSxDQUFBLENBQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQTtLQUNBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQ0EsSUFBQSxDQUFBLFlBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxZQUFBLENBQUEsU0FDQSxDQUFBLGVBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsWUFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxhQUFBLG9CQUFBLENBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsWUFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsSUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsS0FBQSxFQUFBLEVBQUE7QUFDQSxlQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsQ0FBQTtPQUNBLE1BQUE7QUFDQSxjQUFBLENBQUEsU0FBQSxHQUFBLHFDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsbUJBQUEsR0FBQSxJQUFBLENBQUE7T0FDQTtBQUNBLFlBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsZUFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxrQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtLQUNBO0dBRUEsQ0FBQTtDQUNBLENBQ0EsQ0FBQSxDQUFBOztBQ3pJQSxHQUFBLENBQUEsT0FBQSxDQUFBLG9CQUFBLEVBQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsV0FBQSxXQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLHlCQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLGVBQUEsR0FBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxpQ0FBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLGtCQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDRCQUFBLEdBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsV0FBQSxxQkFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxrQ0FBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsU0FBQTtBQUNBLGVBQUEsRUFBQSxXQUFBO0FBQ0EsbUJBQUEsRUFBQSxlQUFBO0FBQ0Esc0JBQUEsRUFBQSxrQkFBQTtBQUNBLHlCQUFBLEVBQUEscUJBQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBLENBQUE7O0FDekJBLEdBQUEsQ0FBQSxPQUFBLENBQUEsc0JBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxXQUFBLGdCQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDhCQUFBLEdBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLFlBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsRUFBQTtBQUNBLFNBQUEsRUFBQSxJQUFBLENBQUEsUUFBQTtLQUNBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEsWUFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxvQkFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsV0FBQSxlQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLG9DQUFBLEdBQUEsSUFBQSxDQUFBLE1BQUEsR0FBQSxXQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsU0FBQTtBQUNBLG9CQUFBLEVBQUEsZ0JBQUE7QUFDQSxnQkFBQSxFQUFBLFlBQUE7QUFDQSxnQkFBQSxFQUFBLFlBQUE7QUFDQSxtQkFBQSxFQUFBLGVBQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBLENBQUE7O0FDMUJBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxlQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsZ0NBQUE7QUFDQSxlQUFBLEVBQUEsd0NBQUE7QUFDQSxjQUFBLEVBQUEsc0JBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLGdCQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsNkNBQUE7QUFDQSxlQUFBLEVBQUEsd0NBQUE7QUFDQSxjQUFBLEVBQUEsc0JBQUE7R0FtQkEsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsc0JBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxZQUFBLEVBQUEsV0FBQSxFQUFBO0FBQ0EsUUFBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUE7O0FBR0EsUUFBQSxDQUFBLGFBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxNQUFBLFlBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsYUFBQSxHQUFBLElBQUEsQ0FBQTtHQUNBOzs7QUFHQSxRQUFBLENBQUEsUUFBQSxHQUFBO0FBQ0EsWUFBQSxFQUFBLEtBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsWUFBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLEdBQUEsQ0FBQSxzQ0FBQSxHQUFBLFlBQUEsQ0FBQSxVQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLFFBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsUUFBQSxHQUFBLFFBQUEsQ0FBQTtTQUNBLE1BQUE7QUFDQSxnQkFBQSxDQUFBLFFBQUEsR0FBQSxFQUFBLENBQUE7U0FDQTtPQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLDhCQUFBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBLE1BQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7O0FBR0EsUUFBQSxDQUFBLElBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLDJCQUFBLEVBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSx1QkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7OztBQWdCQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBO0tBQ0EsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDMUdBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxnQkFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLDRCQUFBO0FBQ0EsZUFBQSxFQUFBLDRDQUFBO0FBQ0EsY0FBQSxFQUFBLDBCQUFBO0FBQ0EsV0FBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLG1CQUFBLEtBQUEsRUFBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSwwQkFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGNBQUEsUUFBQSxFQUFBO0FBQ0EsbUJBQUEsUUFBQSxDQUFBO1dBQ0EsTUFBQTtBQUNBLG1CQUFBO0FBQ0EscUJBQUEsRUFBQSxnQkFBQTthQUNBLENBQUE7V0FDQTtTQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsZUFBQSxDQUFBLDhCQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBO0tBQ0E7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSwwQkFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFdBQUEsRUFBQSxTQUFBLEVBQUE7QUFDQSxRQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsU0FBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXVCQSxRQUFBLENBQUEsSUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsMEJBQUEsRUFBQSxNQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxnQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQkEsUUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxHQUFBLFFBQUEsQ0FBQTtLQUNBLENBQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ3ZGQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FDQSxLQUFBLENBQUEsYUFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLGVBQUE7QUFDQSxlQUFBLEVBQUEsNENBQUE7QUFDQSxjQUFBLEVBQUEsdUJBQUE7QUFDQSxZQUFBLEVBQUEsSUFBQTtBQUNBLFdBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxpQkFBQSxFQUFBLEVBQUEsTUFBQSxFQUFBLGNBQUEsRUFBQTtBQUNBLFlBQUEsUUFBQSxHQUFBLEVBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsSUFBQSxHQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsSUFBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtTQUNBLE1BQUE7QUFDQSxrQkFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxHQUFBLFFBQUEsQ0FBQTtTQUNBO0FBQ0EsZUFBQSxRQUFBLENBQUEsT0FBQSxDQUFBO09BQ0E7S0FDQTtHQUNBLENBQUEsQ0FDQSxLQUFBLENBQUEsb0JBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxVQUFBO0FBQ0EsZUFBQSxFQUFBLHdDQUFBO0FBQ0EsY0FBQSxFQUFBLHVCQUFBO0dBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxnQ0FBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLG1CQUFBO0FBQ0EsVUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxJQUFBO0tBQ0E7QUFDQSxlQUFBLEVBQUEscURBQUE7QUFDQSxjQUFBLEVBQUEsdUJBQUE7R0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSx1QkFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxZQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxTQUFBLEVBQUEsT0FBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsY0FBQSxFQUFBLGtCQUFBLEVBQUE7QUFDQSxRQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLENBQUE7Ozs7QUFJQSxRQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxPQUFBLEVBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxLQUFBO0dBQ0EsQ0FBQTs7OztBQUlBLFFBQUEsQ0FBQSxtQkFBQSxHQUFBLEVBQUEsQ0FBQTs7OztBQUlBLFFBQUEsQ0FBQSxhQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLEtBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsU0FBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLHFCQUFBLGFBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxHQUFBLGFBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxhQUFBLEdBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsSUFBQTtBQUNBLG1CQUFBLEVBQUEsa0JBQUE7QUFDQSxrQkFBQSxFQUFBLHVCQUFBO0FBQ0EsYUFBQSxFQUFBLE1BQUE7T0FDQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsYUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsd0JBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsZ0JBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsb0JBQUEsR0FBQTtBQUNBLGVBQUEsRUFBQSxxQkFBQSxLQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsWUFBQTtBQUNBLGNBQUEsQ0FBQSx3QkFBQSxHQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxtQkFBQSxFQUFBLElBQUE7QUFDQSxxQkFBQSxFQUFBLGtCQUFBO0FBQ0Esb0JBQUEsRUFBQSx1QkFBQTtBQUNBLGVBQUEsRUFBQSxNQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEscUJBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsd0JBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsd0JBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEscUJBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsYUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxpQkFBQSxHQUFBO0FBQ0EsWUFBQSxFQUFBLGtCQUFBLFlBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxhQUFBLENBQUEsWUFBQSxHQUFBLFlBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxhQUFBLEdBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsSUFBQTtBQUNBLG1CQUFBLEVBQUEsZUFBQTtBQUNBLGtCQUFBLEVBQUEsNkJBQUE7QUFDQSxhQUFBLEVBQUEsTUFBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxrQkFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEscUJBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE9BQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLG9CQUFBLENBQUEsVUFBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxTQUFBLENBQUEsR0FBQSxDQUFBLFlBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQTtBQUNBLE1BQUEsWUFBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxpQkFBQSxDQUFBLFFBQUEsQ0FBQSxZQUFBLENBQUEsVUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBR0EsUUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxJQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxNQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxHQUFBLENBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLGNBQUEsRUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxFQUFBO0FBQ0EsVUFBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLHFCQUFBLEVBQUEsSUFBQTtPQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsQ0FBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsQ0FBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsQ0FBQSxVQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEdBQUEsRUFBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7O0FBRUEsVUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLFdBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEtBQUE7S0FDQSxDQUFBOztBQUVBLFFBQUEsY0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsV0FBQSxDQUFBLENBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLE9BQUEsR0FBQTtBQUNBLFVBQUEsRUFBQSxFQUFBO0FBQ0EsY0FBQSxFQUFBLEVBQUE7QUFDQSxvQkFBQSxFQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsY0FBQSxDQUFBO0tBQ0EsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsTUFBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLElBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUE7S0FDQSxNQUFBLElBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsVUFBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUE7S0FDQSxNQUFBLElBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsT0FBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7S0FDQTs7QUFFQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLHNCQUFBLENBQ0EsZUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxHQUFBLENBQUEsSUFBQSxLQUFBLGFBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUEsdUJBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUE7U0FDQSxDQUFBO0FBQ0EsZUFBQTtPQUNBO0FBQ0Esb0JBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLHFCQUFBLEVBQUEsQ0FBQTtLQUNBLENBQUEsU0FDQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsY0FBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxtQkFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsZ0JBQUEsR0FBQSxZQUFBOztBQUVBLFFBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0tBQ0E7O0FBRUEsUUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUE7S0FDQTs7QUFFQSxVQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxFQUFBLEVBQUE7QUFDQSxZQUFBLEVBQUEsRUFBQTtBQUNBLGNBQUEsRUFBQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLG1CQUFBLEVBQUEsSUFBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLHNCQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxRQUFBLGFBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLHNCQUFBLENBQ0EsV0FBQSxDQUFBO0FBQ0EsU0FBQSxFQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxNQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsU0FDQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLG1CQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEseUJBQUEsR0FBQSxZQUFBO0FBQ0EsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUNBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsY0FBQSxDQUFBLFNBQ0EsQ0FBQSxXQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLFFBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLGtCQUFBLENBQUEseUJBQUEsQ0FBQTtBQUNBLGFBQUEsRUFBQSxHQUFBLENBQUEsV0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsY0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxHQUFBLENBQUEsTUFBQSxLQUFBLEdBQUEsSUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsS0FBQSxJQUFBLEVBQUE7QUFDQSxzQkFBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO09BQ0EsTUFBQTtBQUNBLGNBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUEsMkRBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUE7U0FDQSxDQUFBO09BQ0E7QUFDQSxZQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLFdBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxzQkFBQSxDQUNBLGVBQUEsRUFBQSxDQUNBLElBQUEsQ0FBQSxjQUFBLENBQUEsU0FDQSxDQUFBLFdBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsY0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxtQkFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLFdBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxxQkFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsUUFBQSxPQUFBLENBQUEsMENBQUEsQ0FBQSxFQUFBO1VBVUEsY0FBQSxHQUFBLFNBQUEsY0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLG1CQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtPQUNBOztVQUVBLFdBQUEsR0FBQSxTQUFBLFdBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtPQUNBOztBQWhCQSxVQUFBLGlCQUFBLEdBQUEsTUFBQSxDQUFBLG1CQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSx3QkFBQSxDQUNBLHFCQUFBLENBQUE7QUFDQSxVQUFBLEVBQUEsaUJBQUE7T0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLGNBQUEsQ0FBQSxTQUNBLENBQUEsV0FBQSxDQUFBLENBQUE7S0FVQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQ0EsVUFBQSxDQUFBLDZCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsRUFBQSxDQUFBLENBQUE7QUNqVEEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQ0EsS0FBQSxDQUFBLGdDQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsbUNBQUE7QUFDQSxlQUFBLEVBQUEsZ0RBQUE7QUFDQSxjQUFBLEVBQUEsc0NBQUE7R0FDQSxDQUFBLENBQ0EsS0FBQSxDQUFBLCtCQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsdUJBQUE7QUFDQSxVQUFBLEVBQUE7QUFDQSxnQkFBQSxFQUFBLElBQUE7S0FDQTtBQUNBLGVBQUEsRUFBQSxnREFBQTtBQUNBLGNBQUEsRUFBQSxzQ0FBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLHNDQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQSxjQUFBLEVBQUEsa0JBQUEsRUFBQTs7QUFFQSxRQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLEtBQUEsR0FBQTtBQUNBLGtCQUFBLEVBQUEsRUFBQTtBQUNBLGNBQUEsRUFBQSxFQUFBO0FBQ0EsbUJBQUEsRUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEVBQUE7QUFDQSxRQUFBLEVBQUEsS0FBQTtBQUNBLFdBQUEsRUFBQSxLQUFBO0FBQ0EsVUFBQSxFQUFBLEtBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLHNCQUFBLEVBQUEsTUFBQTtBQUNBLFNBQUEsRUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUE7QUFDQSxRQUFBLEVBQUEsRUFBQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxZQUFBLEdBQUEsSUFBQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTs7OztBQUlBLFVBQUEsQ0FBQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBOzs7O0FBSUEsUUFBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLFlBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxhQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsZUFBQSxHQUFBLEtBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBLFdBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxFQUFBLGNBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsZ0JBQUEsR0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsR0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsY0FBQSxHQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLE1BQUEsQ0FBQSxHQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxHQUFBLGVBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxpQkFBQSxDQUFBLFNBQ0EsQ0FBQSxXQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLGlCQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxTQUFBLEVBQUEsU0FBQSxFQUFBLFVBQUEsRUFBQSxTQUFBLEVBQUEsWUFBQSxFQUFBLFdBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsZUFBQSxFQUFBLElBQUEsQ0FBQSxPQUFBO0FBQ0EsaUJBQUEsRUFBQSxJQUFBLENBQUEsR0FBQTtXQUNBLENBQUEsQ0FBQTtTQUNBO09BQ0EsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGdCQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLFdBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsNkJBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7O0FBR0EsUUFBQSxDQUFBLFlBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxnQkFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLElBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsdUJBQUEsQ0FBQSxDQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUE7S0FDQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUE7S0FDQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsUUFBQSxPQUFBLEdBQUEsSUFBQSxRQUFBLEVBQUEsQ0FBQTtBQUNBLFNBQUEsSUFBQSxJQUFBLElBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtLQUNBO0FBQ0EsUUFBQSxPQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsRUFBQSxJQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLE9BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsRUFBQSxJQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLE1BQUEsQ0FBQSxXQUFBLEVBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7S0FDQTs7QUFFQSxRQUFBLE9BQUEsR0FBQTtBQUNBLFlBQUEsRUFBQSxNQUFBO0FBQ0EsU0FBQSxFQUFBLDJCQUFBO0FBQ0EsYUFBQSxFQUFBO0FBQ0Esc0JBQUEsRUFBQSxTQUFBO09BQ0E7QUFDQSxzQkFBQSxFQUFBLE9BQUEsQ0FBQSxRQUFBO0FBQ0EsVUFBQSxFQUFBLE9BQUE7S0FDQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxZQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLEVBQUEsQ0FBQSxnQ0FBQSxFQUFBO0FBQ0Esc0JBQUEsRUFBQSxZQUFBLENBQUEsVUFBQTtTQUNBLENBQUEsQ0FBQTtPQUNBLE1BQUE7QUFDQSxjQUFBLENBQUEsRUFBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQTtPQUNBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSw0QkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBR0EsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxZQUFBLENBQUEsU0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLGtCQUFBLENBQUEsWUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSwwQkFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxPQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsR0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsR0FBQSxTQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO09BQ0EsQ0FBQSxTQUNBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsaUJBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxZQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsVUFBQSxNQUFBLENBQUEsUUFBQSxDQUFBLCtCQUFBLENBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLGNBQUEsRUFBQSxDQUFBO0FBQ0EsZUFBQTtPQUNBOztBQUVBLFlBQUEsQ0FBQSxpQkFBQSxDQUFBLFFBQUEsQ0FBQSxZQUFBLENBQUEsVUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxjQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEtBQUEsRUFBQSxFQUFBO1VBT0EsNkJBQUEsR0FBQSxTQUFBLDZCQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxlQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsRUFBQSxjQUFBLENBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLGdCQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxFQUFBLGNBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsY0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLGVBQUEsRUFBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEdBQUEsZUFBQSxDQUFBLENBQUE7T0FDQTs7VUFFQSxpQkFBQSxHQUFBLFNBQUEsaUJBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxTQUFBLEVBQUEsU0FBQSxFQUFBLFVBQUEsRUFBQSxTQUFBLEVBQUEsWUFBQSxFQUFBLFdBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsaUJBQUEsRUFBQSxJQUFBLENBQUEsT0FBQTtBQUNBLG1CQUFBLEVBQUEsSUFBQSxDQUFBLEdBQUE7YUFDQSxDQUFBLENBQUE7V0FDQTtTQUNBLENBQUEsQ0FBQTs7QUFFQSxjQUFBLENBQUEsZ0JBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtPQUNBOztVQUVBLFdBQUEsR0FBQSxTQUFBLFdBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxhQUFBLENBQUEsNkJBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7T0FDQTs7QUFyQ0EsWUFBQSxDQUFBLGdCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSx3QkFBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLFdBQUEsRUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFFBQUE7T0FDQSxDQUFBLENBQUEsSUFBQSxDQUFBLDZCQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsaUJBQUEsQ0FBQSxTQUFBLENBQUEsV0FBQSxDQUFBLENBQUE7S0FrQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxZQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxhQUFBLFdBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxVQUFBLFFBQUEsR0FBQSxRQUFBLENBQUEsYUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLFFBQUEsQ0FBQSxJQUFBLElBQUEsRUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtPQUNBO0FBQ0EsYUFBQSxRQUFBLENBQUE7S0FDQTs7QUFFQSxRQUFBLFFBQUEsR0FBQSxXQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsUUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLEdBQUEsS0FBQSxJQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7O0FBRUEsUUFBQSxRQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsRUFBQTtBQUNBLGFBQUEsS0FBQSxDQUFBO0tBQ0E7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxFQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsV0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLE9BQUEsQ0FBQSxvQkFBQSxDQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxRQUFBLE1BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLHNCQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsU0FBQSxFQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEdBQUE7S0FDQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsTUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsbUJBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxZQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLFlBQUEsRUFBQSxFQUFBO0FBQ0EsY0FBQSxFQUFBLEVBQUE7QUFDQSxRQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsRUFBQSxLQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsY0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsaUJBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FDQSxXQUFBLENBQUE7QUFDQSxTQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsR0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxNQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLG9CQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxXQUFBLG9CQUFBLEdBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxLQUFBO0tBQ0EsQ0FBQTs7QUFFQSxVQUFBLENBQUEsS0FBQSxHQUFBO0FBQ0Esb0JBQUEsRUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxFQUFBO0FBQ0EscUJBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEVBQUE7QUFDQSxVQUFBLEVBQUEsS0FBQTtBQUNBLGFBQUEsRUFBQSxLQUFBO0FBQ0EsWUFBQSxFQUFBLEtBQUE7QUFDQSxhQUFBLEVBQUEsQ0FBQTtBQUNBLFdBQUEsRUFBQSxFQUFBO0FBQ0EsY0FBQSxFQUFBLEVBQUE7QUFDQSxnQkFBQSxFQUFBLEVBQUE7QUFDQSxVQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0EscUJBQUEsRUFBQSxLQUFBO09BQ0EsQ0FBQTtBQUNBLHdCQUFBLEVBQUEsTUFBQTtLQUNBLENBQUE7QUFDQSxXQUFBLENBQUEsT0FBQSxDQUFBLG9CQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7OztBQUlBLFFBQUEsQ0FBQSxrQkFBQSxHQUFBLFVBQUEsaUJBQUEsRUFBQTs7QUFFQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLHNCQUFBLENBQ0Esa0JBQUEsQ0FBQTtBQUNBLFFBQUEsRUFBQSxpQkFBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsY0FBQSxDQUFBLFNBQ0EsQ0FBQSxXQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLGNBQUEsQ0FBQSxHQUFBLEVBQUE7O0FBRUEsWUFBQSxDQUFBLGdCQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBOztBQUVBLFVBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsY0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxVQUFBLFlBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLG1CQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLFdBQUEsSUFBQSxJQUFBLElBQUEsT0FBQSxFQUFBO0FBQ0Esb0JBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxhQUFBLEVBQUEsSUFBQTtBQUNBLGVBQUEsRUFBQSxPQUFBLENBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0E7QUFDQSxvQkFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLDJCQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsYUFBQSxFQUFBLElBQUE7U0FDQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxrQkFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxrQkFBQSxHQUFBLE1BQUEsQ0FBQTtPQUNBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLEdBQUEsbUJBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxhQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxXQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFlBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEdBQUEsRUFBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxVQUFBLEVBQ0EsTUFBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7R0FDQSxFQUFBLElBQUEsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDbFpBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUNBLEtBQUEsQ0FBQSxtQ0FBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLDJCQUFBO0FBQ0EsVUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxJQUFBO0tBQ0E7QUFDQSxlQUFBLEVBQUEsd0NBQUE7QUFDQSxjQUFBLEVBQUEsOEJBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBR0EsR0FBQSxDQUFBLFVBQUEsQ0FBQSw4QkFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxZQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxTQUFBLEVBQUEsT0FBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsY0FBQSxFQUFBLGtCQUFBLEVBQUE7QUFDQSxNQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLGtCQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsU0FBQSxDQUFBLGlCQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxFQUFBLENBQUEsZ0NBQUEsQ0FBQSxDQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUE7R0FDQTs7QUFFQSxRQUFBLENBQUEsS0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsSUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxDQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsQ0FBQTtHQUNBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtLQUNBLE1BQUE7QUFDQSxZQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLElBQUEsR0FBQSxZQUFBO0FBQ0EsU0FBQSxDQUFBLDhCQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUN6Q0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQ0EsS0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLHlCQUFBO0FBQ0EsY0FBQSxFQUFBLGdCQUFBO0dBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsUUFBQTtBQUNBLGVBQUEsRUFBQSwwQkFBQTtBQUNBLGNBQUEsRUFBQSxnQkFBQTtHQUNBLENBQUEsQ0FDQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFdBQUE7QUFDQSxlQUFBLEVBQUEsNkJBQUE7QUFDQSxjQUFBLEVBQUEsZ0JBQUE7R0FDQSxDQUFBLENBQ0EsS0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxPQUFBO0FBQ0EsZUFBQSxFQUFBLHlCQUFBO0FBQ0EsY0FBQSxFQUFBLGdCQUFBO0dBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsUUFBQTtBQUNBLGVBQUEsRUFBQSwwQkFBQTtBQUNBLGNBQUEsRUFBQSxnQkFBQTtHQUNBLENBQUEsQ0FDQSxLQUFBLENBQUEsU0FBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFVBQUE7QUFDQSxlQUFBLEVBQUEsNEJBQUE7QUFDQSxjQUFBLEVBQUEsZ0JBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxnQkFBQSxFQUFBLENBQUEsWUFBQSxFQUNBLFFBQUEsRUFDQSxRQUFBLEVBQ0EsT0FBQSxFQUNBLFdBQUEsRUFDQSxTQUFBLEVBQ0EsYUFBQSxFQUNBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsV0FBQSxFQUFBOztBQUVBLFFBQUEsQ0FBQSxjQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsSUFBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLEtBQUE7QUFDQSxlQUFBLEVBQUEsS0FBQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBO0FBQ0EsU0FBQSxFQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsS0FBQTtLQUNBO0FBQ0EsZUFBQSxFQUFBO0FBQ0EsU0FBQSxFQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsS0FBQTtLQUNBO0dBQ0EsQ0FBQTs7OztBQUlBLFFBQUEsQ0FBQSxxQkFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsaUJBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLEtBQUE7T0FDQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7O0FBRUEsVUFBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEdBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxLQUFBO0tBQ0EsQ0FBQTs7QUFFQSxlQUFBLENBQ0EsZUFBQSxDQUFBLE1BQUEsQ0FBQSxjQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsdUJBQUEsQ0FBQSxTQUNBLENBQUEsb0JBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsdUJBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxVQUFBLEdBQUEsQ0FBQSxNQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLGNBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsR0FBQSxJQUFBLENBQUE7T0FDQTtLQUNBOztBQUVBLGFBQUEsb0JBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxVQUFBLEdBQUEsQ0FBQSxNQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEdBQUE7QUFDQSxhQUFBLEVBQUEsdUJBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUE7U0FDQSxDQUFBO0FBQ0EsZUFBQTtPQUNBO0FBQ0EsWUFBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEdBQUE7QUFDQSxXQUFBLEVBQUEsa0NBQUE7QUFDQSxlQUFBLEVBQUEsSUFBQTtPQUNBLENBQUE7S0FDQTtHQUNBLENBQUE7Ozs7OztBQU1BLFFBQUEsQ0FBQSxpQkFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsaUJBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLEtBQUE7T0FDQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxlQUFBLENBQ0EsZUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsbUJBQUEsQ0FBQSxTQUNBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsbUJBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxVQUFBLEdBQUEsQ0FBQSxNQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLE1BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsR0FBQSxJQUFBLENBQUE7T0FDQTtLQUNBOztBQUVBLGFBQUEsZ0JBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxVQUFBLEdBQUEsQ0FBQSxNQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEdBQUE7QUFDQSxhQUFBLEVBQUEsdUJBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUE7U0FDQSxDQUFBO0FBQ0EsZUFBQTtPQUNBOztBQUVBLFlBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxHQUFBO0FBQ0EsV0FBQSxFQUFBLGtDQUFBO0FBQ0EsZUFBQSxFQUFBLElBQUE7T0FDQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOzs7Q0FHQSxDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsU0FBQSxDQUFBLFNBQUEsRUFBQSxVQUFBLE9BQUEsRUFBQTtBQUNBLFNBQUE7QUFDQSxZQUFBLEVBQUEsSUFBQTtBQUNBLFFBQUEsRUFBQSxjQUFBLE1BQUEsRUFBQSxRQUFBLEVBQUE7QUFDQSxVQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxTQUFBLEdBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLFNBQUEsQ0FBQTs7QUFFQSxlQUFBLFlBQUEsR0FBQTs7QUFFQSxZQUFBLE9BQUEsQ0FBQSxXQUFBLEdBQUEsU0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxFQUFBLE9BQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxFQUFBLE1BQUEsQ0FBQSxDQUFBO1NBQ0EsTUFBQTtBQUNBLGtCQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTtTQUNBO09BQ0E7O0FBRUEsWUFBQSxDQUFBLEdBQUEsQ0FBQSxtQkFBQSxFQUFBLFlBQUE7QUFDQSxXQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsRUFBQSxZQUFBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLFlBQUEsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQy9LQSxHQUFBLENBQUEsT0FBQSxDQUFBLG9CQUFBLEVBQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsV0FBQSxXQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLHlCQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLGVBQUEsR0FBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSwyQkFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLGtCQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDRCQUFBLEdBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsV0FBQSxxQkFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxrQ0FBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsV0FBQSxlQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLDRCQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLHlCQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLGtDQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLDBCQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLDJCQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxTQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUE7QUFDQSxtQkFBQSxFQUFBLGVBQUE7QUFDQSxzQkFBQSxFQUFBLGtCQUFBO0FBQ0EsbUJBQUEsRUFBQSxlQUFBO0FBQ0EseUJBQUEsRUFBQSxxQkFBQTtBQUNBLDZCQUFBLEVBQUEseUJBQUE7QUFDQSw4QkFBQSxFQUFBLDBCQUFBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQSxDQUFBOztBQ3ZDQSxHQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxXQUFBLGVBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsdUJBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEsZUFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSx1QkFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsU0FBQTtBQUNBLG1CQUFBLEVBQUEsZUFBQTtBQUNBLG1CQUFBLEVBQUEsZUFBQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUEsQ0FBQTs7QUNoQkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxXQUFBO0FBQ0EsZUFBQSxFQUFBLGlDQUFBO0FBQ0EsY0FBQSxFQUFBLG1CQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsbUJBQUEsRUFBQSxDQUFBLFlBQUEsRUFDQSxRQUFBLEVBQ0EsUUFBQSxFQUNBLE9BQUEsRUFDQSxXQUFBLEVBQ0EsU0FBQSxFQUNBLGdCQUFBLEVBQ0EsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsU0FBQSxFQUFBLE9BQUEsRUFBQSxjQUFBLEVBQUE7O0FBRUEsUUFBQSxDQUFBLFVBQUEsR0FBQSxDQUNBLGtCQUFBLEVBQ0EsU0FBQSxFQUNBLFVBQUEsRUFDQSxPQUFBLEVBQ0EsV0FBQSxFQUNBLFNBQUEsRUFDQSxhQUFBLEVBQ0EsV0FBQSxFQUNBLFlBQUEsRUFDQSxPQUFBLEVBQ0EsYUFBQSxFQUNBLFNBQUEsRUFDQSxZQUFBLEVBQ0EsVUFBQSxFQUNBLE1BQUEsRUFDQSxhQUFBLEVBQ0EsT0FBQSxFQUNBLG1CQUFBLEVBQ0EsT0FBQSxFQUNBLE1BQUEsRUFDQSw2QkFBQSxDQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsT0FBQSxFQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsS0FBQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsV0FBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsSUFBQSxHQUFBLElBQUEsUUFBQSxFQUFBLENBQUE7QUFDQSxTQUFBLElBQUEsSUFBQSxJQUFBLE1BQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsRUFBQSxNQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7S0FDQTtBQUNBLGtCQUFBLENBQ0EsV0FBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxlQUFBLENBQUEsU0FDQSxDQUFBLFVBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsZUFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxHQUFBLENBQUEsTUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxHQUFBLHFEQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLGVBQUEsQ0FBQSxPQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLGVBQUE7T0FDQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxHQUFBLG9EQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLFVBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsR0FBQSxDQUFBLE1BQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsaUJBQUEsRUFBQSxJQUFBO0FBQ0EsYUFBQSxFQUFBLEdBQUEsQ0FBQSxJQUFBO1NBQ0EsQ0FBQTtBQUNBLGVBQUE7T0FDQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUEsSUFBQTtBQUNBLFdBQUEsRUFBQSxvREFBQTtPQUNBLENBQUE7S0FDQTtHQUNBLENBQUE7Q0FDQSxDQUNBLENBQUEsQ0FBQTtBQ3pGQSxHQUFBLENBQUEsT0FBQSxDQUFBLGdCQUFBLEVBQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsV0FBQSxXQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLEVBQUEsTUFBQTtBQUNBLFNBQUEsRUFBQSxjQUFBO0FBQ0EsYUFBQSxFQUFBO0FBQ0Esc0JBQUEsRUFBQSxTQUFBO09BQ0E7QUFDQSxzQkFBQSxFQUFBLE9BQUEsQ0FBQSxRQUFBO0FBQ0EsVUFBQSxFQUFBLElBQUE7S0FDQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxTQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBLENBQUE7QUNqQkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxjQUFBO0FBQ0EsZUFBQSxFQUFBLHVDQUFBO0FBQ0EsY0FBQSxFQUFBLHNCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUdBLEdBQUEsQ0FBQSxVQUFBLENBQUEsc0JBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxXQUFBLEVBQUEsYUFBQSxFQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsZUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxHQUFBLFFBQUEsQ0FBQTtLQUNBLENBQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxHQUFBLENBQUEsNkJBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxXQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGVBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxnQ0FBQSxDQUFBLENBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsUUFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLFlBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxTQUFBLElBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBO0FBQ0EsVUFBQSxHQUFBLEdBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLGVBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxvQkFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtPQUNBO0tBQ0E7QUFDQSxjQUFBLENBQUEsWUFBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLENBQUEsWUFBQSxDQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLHFCQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO09BQ0EsRUFBQSxFQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLElBQUEsRUFBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQTtBQUNBLE9BQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxLQUFBLElBQUEsQ0FBQSxDQUFBLEVBQUE7QUFDQSxTQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7S0FDQSxNQUFBO0FBQ0EsU0FBQSxDQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxRQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUEsTUFBQSxJQUFBLENBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7S0FDQSxNQUFBO0FBQ0EsV0FBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsR0FBQSxDQUFBLHVCQUFBLEVBQUEsS0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLGVBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLGVBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7T0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxxQkFBQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxVQUFBLENBQUEsMEJBQUEsR0FBQSxVQUFBLENBQUEsR0FBQSxHQUFBLEdBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLGVBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsZUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSx1QkFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsVUFBQSxDQUFBLDJCQUFBLEdBQUEsVUFBQSxDQUFBLEdBQUEsR0FBQSxHQUFBLEdBQUEsVUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFVBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxlQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGVBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsd0JBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsT0FBQSxHQUFBLFVBQUEsVUFBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLGlDQUFBLEVBQUEsVUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsVUFBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLGtDQUFBLEVBQUEsVUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQSIsImZpbGUiOiJtYWluLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xud2luZG93LmFwcCA9IGFuZ3VsYXIubW9kdWxlKCdGdWxsc3RhY2tHZW5lcmF0ZWRBcHAnLCBbJ2ZzYVByZUJ1aWx0JywgJ3VpLnJvdXRlcicsICd1aS5ib290c3RyYXAnLCAnbmdBbmltYXRlJywgJ25nQ29va2llcycsICd5YXJ1MjIuYW5ndWxhci10aW1lYWdvJ10pO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyLCAkdWlWaWV3U2Nyb2xsUHJvdmlkZXIpIHtcbiAgICAvLyBUaGlzIHR1cm5zIG9mZiBoYXNoYmFuZyB1cmxzICgvI2Fib3V0KSBhbmQgY2hhbmdlcyBpdCB0byBzb21ldGhpbmcgbm9ybWFsICgvYWJvdXQpXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuICAgIC8vIElmIHdlIGdvIHRvIGEgVVJMIHRoYXQgdWktcm91dGVyIGRvZXNuJ3QgaGF2ZSByZWdpc3RlcmVkLCBnbyB0byB0aGUgXCIvXCIgdXJsLlxuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbiAgICAvLyAkdWlWaWV3U2Nyb2xsUHJvdmlkZXIudXNlQW5jaG9yU2Nyb2xsKCk7XG59KTtcblxuLy8gVGhpcyBhcHAucnVuIGlzIGZvciBjb250cm9sbGluZyBhY2Nlc3MgdG8gc3BlY2lmaWMgc3RhdGVzLlxuYXBwLnJ1bihmdW5jdGlvbiAoJHJvb3RTY29wZSwgQXV0aFNlcnZpY2UsICRzdGF0ZSwgJHVpVmlld1Njcm9sbCwgU2Vzc2lvblNlcnZpY2UsIEFwcENvbmZpZykge1xuICAgIC8vIFRoZSBnaXZlbiBzdGF0ZSByZXF1aXJlcyBhbiBhdXRoZW50aWNhdGVkIHVzZXIuXG4gICAgLy8gdmFyIGRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGggPSBmdW5jdGlvbiAoc3RhdGUpIHtcbiAgICAvLyAgICAgcmV0dXJuIHN0YXRlLmRhdGEgJiYgc3RhdGUuZGF0YS5hdXRoZW50aWNhdGU7XG4gICAgLy8gfTtcblxuICAgIEFwcENvbmZpZy5mZXRjaENvbmZpZygpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHJlcyk7XG4gICAgICAgIEFwcENvbmZpZy5zZXRDb25maWcocmVzLmRhdGEpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhBcHBDb25maWcuaXNDb25maWdQYXJhbXN2YWlsYWJsZSk7XG4gICAgfSlcblxuICAgIC8vICRzdGF0ZUNoYW5nZVN0YXJ0IGlzIGFuIGV2ZW50IGZpcmVkXG4gICAgLy8gd2hlbmV2ZXIgdGhlIHByb2Nlc3Mgb2YgY2hhbmdpbmcgYSBzdGF0ZSBiZWdpbnMuXG4gICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24gKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcykge1xuICAgICAgICAvLyBpZih0b1N0YXRlID0gJ2FydGlzdFRvb2xzJykge1xuICAgICAgICAvLyAgICAgdmFyIHVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyh1c2VyKTtcbiAgICAgICAgLy8gfVxuICAgICAgICAvLyBjb25zb2xlLmxvZygncmVhY2hlZCBoZXJlJyk7XG4gICAgICAgIC8vIGlmICghZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCh0b1N0YXRlKSkge1xuICAgICAgICAvLyAgICAgLy8gVGhlIGRlc3RpbmF0aW9uIHN0YXRlIGRvZXMgbm90IHJlcXVpcmUgYXV0aGVudGljYXRpb25cbiAgICAgICAgLy8gICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4gICAgICAgIC8vICAgICByZXR1cm47XG4gICAgICAgIC8vIH1cblxuICAgICAgICAvLyBpZiAoQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgLy8gICAgIC8vIFRoZSB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQuXG4gICAgICAgIC8vICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAvLyAgICAgcmV0dXJuO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgLy8gLy8gQ2FuY2VsIG5hdmlnYXRpbmcgdG8gbmV3IHN0YXRlLlxuICAgICAgICAvLyBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIC8vIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgLy8gICAgIC8vIElmIGEgdXNlciBpcyByZXRyaWV2ZWQsIHRoZW4gcmVuYXZpZ2F0ZSB0byB0aGUgZGVzdGluYXRpb25cbiAgICAgICAgLy8gICAgIC8vICh0aGUgc2Vjb25kIHRpbWUsIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpIHdpbGwgd29yaylcbiAgICAgICAgLy8gICAgIC8vIG90aGVyd2lzZSwgaWYgbm8gdXNlciBpcyBsb2dnZWQgaW4sIGdvIHRvIFwibG9naW5cIiBzdGF0ZS5cbiAgICAgICAgLy8gICAgIGlmICh1c2VyKSB7XG4gICAgICAgIC8vICAgICAgICAgJHN0YXRlLmdvKHRvU3RhdGUubmFtZSwgdG9QYXJhbXMpO1xuICAgICAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gICAgICAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vIH0pO1xuXG4gICAgfSk7XG5cbn0pO1xuXG5cbmFwcC5kaXJlY3RpdmUoJ2ZpbGVyZWFkJywgW2Z1bmN0aW9uICgpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgZmlsZXJlYWQ6ICc9JyxcbiAgICAgICAgICAgIG1lc3NhZ2U6ICc9J1xuICAgICAgICB9LFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUsIGVsZW1lbnQsIGF0dHJpYnV0ZXMpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuYmluZCgnY2hhbmdlJywgZnVuY3Rpb24gKGNoYW5nZUV2ZW50KSB7XG4gICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsOiAnJ1xuICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYoY2hhbmdlRXZlbnQudGFyZ2V0LmZpbGVzWzBdLnR5cGUgIT0gXCJhdWRpby9tcGVnXCIgJiYgY2hhbmdlRXZlbnQudGFyZ2V0LmZpbGVzWzBdLnR5cGUgIT0gXCJhdWRpby9tcDNcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbDogJ0Vycm9yOiBQbGVhc2UgdXBsb2FkIG1wMyBmb3JtYXQgZmlsZS4nXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC52YWwobnVsbCk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmKGNoYW5nZUV2ZW50LnRhcmdldC5maWxlc1swXS5zaXplID4gMjAqMTAwMCoxMDAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzY29wZS5tZXNzYWdlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsOiAnRXJyb3I6IFBsZWFzZSB1cGxvYWQgZmlsZSB1cHRvIDIwIE1CIHNpemUuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudmFsKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLmZpbGVyZWFkID0gY2hhbmdlRXZlbnQudGFyZ2V0LmZpbGVzWzBdO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG59XSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkYXRhYmFzZScsIHtcbiAgICB1cmw6ICcvYWRtaW4vZGF0YWJhc2UnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvZGF0YWJhc2UvZGF0YWJhc2UuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0RhdGFiYXNlQ29udHJvbGxlcidcbiAgfSk7XG59KTtcblxuYXBwLmRpcmVjdGl2ZSgnbm90aWZpY2F0aW9uQmFyJywgWydzb2NrZXQnLCBmdW5jdGlvbihzb2NrZXQpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0VBJyxcbiAgICBzY29wZTogdHJ1ZSxcbiAgICB0ZW1wbGF0ZTogJzxkaXYgc3R5bGU9XCJtYXJnaW46IDAgYXV0bzt3aWR0aDo1MCVcIiBuZy1zaG93PVwiYmFyLnZpc2libGVcIj4nICtcbiAgICAgICc8dWliLXByb2dyZXNzPjx1aWItYmFyIHZhbHVlPVwiYmFyLnZhbHVlXCIgdHlwZT1cInt7YmFyLnR5cGV9fVwiPjxzcGFuPnt7YmFyLnZhbHVlfX0lPC9zcGFuPjwvdWliLWJhcj48L3VpYi1wcm9ncmVzcz4nICtcbiAgICAgICc8L2Rpdj4nLFxuICAgIGxpbms6IGZ1bmN0aW9uKCRzY29wZSwgaUVsbSwgaUF0dHJzLCBjb250cm9sbGVyKSB7XG4gICAgICBzb2NrZXQub24oJ25vdGlmaWNhdGlvbicsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHBlcmNlbnRhZ2UgPSBwYXJzZUludChNYXRoLmZsb29yKGRhdGEuY291bnRlciAvIGRhdGEudG90YWwgKiAxMDApLCAxMCk7XG4gICAgICAgICRzY29wZS5iYXIudmFsdWUgPSBwZXJjZW50YWdlO1xuICAgICAgICBpZiAocGVyY2VudGFnZSA9PT0gMTAwKSB7XG4gICAgICAgICAgJHNjb3BlLmJhci52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgJHNjb3BlLmJhci52YWx1ZSA9IDA7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1dKTtcblxuYXBwLmNvbnRyb2xsZXIoJ0RhdGFiYXNlQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgQXV0aFNlcnZpY2UsIHNvY2tldCkge1xuICAkc2NvcGUuYWRkVXNlciA9IHt9O1xuICAkc2NvcGUucXVlcnkgPSB7fTtcbiAgJHNjb3BlLnRyZFVzclF1ZXJ5ID0ge307XG4gICRzY29wZS5xdWVyeUNvbHMgPSBbe1xuICAgIG5hbWU6ICd1c2VybmFtZScsXG4gICAgdmFsdWU6ICd1c2VybmFtZSdcbiAgfSwge1xuICAgIG5hbWU6ICdnZW5yZScsXG4gICAgdmFsdWU6ICdnZW5yZSdcbiAgfSwge1xuICAgIG5hbWU6ICduYW1lJyxcbiAgICB2YWx1ZTogJ25hbWUnXG4gIH0sIHtcbiAgICBuYW1lOiAnVVJMJyxcbiAgICB2YWx1ZTogJ3NjVVJMJ1xuICB9LCB7XG4gICAgbmFtZTogJ2VtYWlsJyxcbiAgICB2YWx1ZTogJ2VtYWlsJ1xuICB9LCB7XG4gICAgbmFtZTogJ2Rlc2NyaXB0aW9uJyxcbiAgICB2YWx1ZTogJ2Rlc2NyaXB0aW9uJ1xuICB9LCB7XG4gICAgbmFtZTogJ2ZvbGxvd2VycycsXG4gICAgdmFsdWU6ICdmb2xsb3dlcnMnXG4gIH0sIHtcbiAgICBuYW1lOiAnbnVtYmVyIG9mIHRyYWNrcycsXG4gICAgdmFsdWU6ICdudW1UcmFja3MnXG4gIH0sIHtcbiAgICBuYW1lOiAnZmFjZWJvb2snLFxuICAgIHZhbHVlOiAnZmFjZWJvb2tVUkwnXG4gIH0sIHtcbiAgICBuYW1lOiAnaW5zdGFncmFtJyxcbiAgICB2YWx1ZTogJ2luc3RhZ3JhbVVSTCdcbiAgfSwge1xuICAgIG5hbWU6ICd0d2l0dGVyJyxcbiAgICB2YWx1ZTogJ3R3aXR0ZXJVUkwnXG4gIH0sIHtcbiAgICBuYW1lOiAneW91dHViZScsXG4gICAgdmFsdWU6ICd5b3V0dWJlVVJMJ1xuICB9LCB7XG4gICAgbmFtZTogJ3dlYnNpdGVzJyxcbiAgICB2YWx1ZTogJ3dlYnNpdGVzJ1xuICB9LCB7XG4gICAgbmFtZTogJ2F1dG8gZW1haWwgZGF5JyxcbiAgICB2YWx1ZTogJ2VtYWlsRGF5TnVtJ1xuICB9LCB7XG4gICAgbmFtZTogJ2FsbCBlbWFpbHMnLFxuICAgIHZhbHVlOiAnYWxsRW1haWxzJ1xuICB9XTtcbiAgJHNjb3BlLmRvd25sb2FkQnV0dG9uVmlzaWJsZSA9IGZhbHNlO1xuICAkc2NvcGUudHJhY2sgPSB7XG4gICAgdHJhY2tVcmw6ICcnLFxuICAgIGRvd25sb2FkVXJsOiAnJyxcbiAgICBlbWFpbDogJydcbiAgfTtcbiAgJHNjb3BlLmJhciA9IHtcbiAgICB0eXBlOiAnc3VjY2VzcycsXG4gICAgdmFsdWU6IDAsXG4gICAgdmlzaWJsZTogZmFsc2VcbiAgfTtcbiAgJHNjb3BlLnBhaWRSZXBvc3QgPSB7XG4gICAgc291bmRDbG91ZFVybDogJydcbiAgfTtcblxuICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgJGh0dHAuZ2V0KCcvYXBpL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4nO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIGFsZXJ0KCdXcm9uZyBQYXNzd29yZCcpO1xuICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLnNhdmVBZGRVc2VyID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRzY29wZS5hZGRVc2VyLnBhc3N3b3JkID0gJHJvb3RTY29wZS5wYXNzd29yZDtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL2FkZHVzZXInLCAkc2NvcGUuYWRkVXNlcilcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICBhbGVydChcIlN1Y2Nlc3M6IERhdGFiYXNlIGlzIGJlaW5nIHBvcHVsYXRlZC4gWW91IHdpbGwgYmUgZW1haWxlZCB3aGVuIGl0IGlzIGNvbXBsZXRlLlwiKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgJHNjb3BlLmJhci52aXNpYmxlID0gdHJ1ZTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGFsZXJ0KCdCYWQgc3VibWlzc2lvbicpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUuY3JlYXRlVXNlclF1ZXJ5RG9jID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHF1ZXJ5ID0ge307XG4gICAgaWYgKCRzY29wZS5xdWVyeS5hcnRpc3QgPT0gXCJhcnRpc3RzXCIpIHtcbiAgICAgIHF1ZXJ5LmFydGlzdCA9IHRydWU7XG4gICAgfSBlbHNlIGlmICgkc2NvcGUucXVlcnkuYXJ0aXN0ID09IFwibm9uLWFydGlzdHNcIikge1xuICAgICAgcXVlcnkuYXJ0aXN0ID0gZmFsc2U7XG4gICAgfVxuICAgIHZhciBmbHdyUXJ5ID0ge307XG4gICAgaWYgKCRzY29wZS5xdWVyeS5mb2xsb3dlcnNHVCkge1xuICAgICAgZmx3clFyeS4kZ3QgPSAkc2NvcGUucXVlcnkuZm9sbG93ZXJzR1Q7XG4gICAgICBxdWVyeS5mb2xsb3dlcnMgPSBmbHdyUXJ5O1xuICAgIH1cbiAgICBpZiAoJHNjb3BlLnF1ZXJ5LmZvbGxvd2Vyc0xUKSB7XG4gICAgICBmbHdyUXJ5LiRsdCA9ICRzY29wZS5xdWVyeS5mb2xsb3dlcnNMVDtcbiAgICAgIHF1ZXJ5LmZvbGxvd2VycyA9IGZsd3JRcnk7XG4gICAgfVxuICAgIGlmICgkc2NvcGUucXVlcnkuZ2VucmUpIHF1ZXJ5LmdlbnJlID0gJHNjb3BlLnF1ZXJ5LmdlbnJlO1xuICAgIGlmICgkc2NvcGUucXVlcnlDb2xzKSB7XG4gICAgICBxdWVyeS5jb2x1bW5zID0gJHNjb3BlLnF1ZXJ5Q29scy5maWx0ZXIoZnVuY3Rpb24oZWxtKSB7XG4gICAgICAgIHJldHVybiBlbG0udmFsdWUgIT09IG51bGw7XG4gICAgICB9KS5tYXAoZnVuY3Rpb24oZWxtKSB7XG4gICAgICAgIHJldHVybiBlbG0udmFsdWU7XG4gICAgICB9KTtcbiAgICB9XG4gICAgaWYgKCRzY29wZS5xdWVyeS50cmFja2VkVXNlcnNVUkwpIHF1ZXJ5LnRyYWNrZWRVc2Vyc1VSTCA9ICRzY29wZS5xdWVyeS50cmFja2VkVXNlcnNVUkw7XG4gICAgdmFyIGJvZHkgPSB7XG4gICAgICBxdWVyeTogcXVlcnksXG4gICAgICBwYXNzd29yZDogJHJvb3RTY29wZS5wYXNzd29yZFxuICAgIH07XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvZm9sbG93ZXJzJywgYm9keSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUuZmlsZW5hbWUgPSByZXMuZGF0YTtcbiAgICAgICAgJHNjb3BlLmRvd25sb2FkQnV0dG9uVmlzaWJsZSA9IHRydWU7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGFsZXJ0KFwiRVJST1I6IEJhZCBRdWVyeSBvciBObyBNYXRjaGVzXCIpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUuY3JlYXRlVHJkVXNyUXVlcnlEb2MgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcXVlcnkgPSB7fTtcbiAgICB2YXIgZmx3clFyeSA9IHt9O1xuICAgIGlmICgkc2NvcGUudHJkVXNyUXVlcnkuZm9sbG93ZXJzR1QpIHtcbiAgICAgIGZsd3JRcnkuJGd0ID0gJHNjb3BlLnRyZFVzclF1ZXJ5LmZvbGxvd2Vyc0dUO1xuICAgICAgcXVlcnkuZm9sbG93ZXJzID0gZmx3clFyeTtcbiAgICB9XG4gICAgaWYgKCRzY29wZS50cmRVc3JRdWVyeS5mb2xsb3dlcnNMVCkge1xuICAgICAgZmx3clFyeS4kbHQgPSAkc2NvcGUudHJkVXNyUXVlcnkuZm9sbG93ZXJzTFQ7XG4gICAgICBxdWVyeS5mb2xsb3dlcnMgPSBmbHdyUXJ5O1xuICAgIH1cbiAgICBpZiAoJHNjb3BlLnRyZFVzclF1ZXJ5LmdlbnJlKSBxdWVyeS5nZW5yZSA9ICRzY29wZS50cmRVc3JRdWVyeS5nZW5yZTtcbiAgICB2YXIgYm9keSA9IHtcbiAgICAgIHF1ZXJ5OiBxdWVyeSxcbiAgICAgIHBhc3N3b3JkOiAkcm9vdFNjb3BlLnBhc3N3b3JkXG4gICAgfTtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS90cmFja2VkVXNlcnMnLCBib2R5KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS50cmRVc3JGaWxlbmFtZSA9IHJlcy5kYXRhO1xuICAgICAgICAkc2NvcGUuZG93bmxvYWRUcmRVc3JCdXR0b25WaXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgYWxlcnQoXCJFUlJPUjogQmFkIFF1ZXJ5IG9yIE5vIE1hdGNoZXNcIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5kb3dubG9hZCA9IGZ1bmN0aW9uKGZpbGVuYW1lKSB7XG4gICAgdmFyIGFuY2hvciA9IGFuZ3VsYXIuZWxlbWVudCgnPGEvPicpO1xuICAgIGFuY2hvci5hdHRyKHtcbiAgICAgIGhyZWY6IGZpbGVuYW1lLFxuICAgICAgZG93bmxvYWQ6IGZpbGVuYW1lXG4gICAgfSlbMF0uY2xpY2soKTtcbiAgICAkc2NvcGUuZG93bmxvYWRCdXR0b25WaXNpYmxlID0gZmFsc2U7XG4gICAgJHNjb3BlLmRvd25sb2FkVHJkVXNyQnV0dG9uVmlzaWJsZSA9IGZhbHNlO1xuICB9XG5cbiAgJHNjb3BlLnNhdmVQYWlkUmVwb3N0Q2hhbm5lbCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL3BhaWRyZXBvc3QnLCAkc2NvcGUucGFpZFJlcG9zdClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUucGFpZFJlcG9zdCA9IHtcbiAgICAgICAgICBzb3VuZENsb3VkVXJsOiAnJ1xuICAgICAgICB9O1xuICAgICAgICBhbGVydChcIlNVQ0NFU1M6IFVybCBzYXZlZCBzdWNjZXNzZnVsbHlcIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGFsZXJ0KFwiRVJST1I6IEVycm9yIGluIHNhdmluZyB1cmxcIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8qIExpc3RlbiB0byBzb2NrZXQgZXZlbnRzICovXG4gIHNvY2tldC5vbignbm90aWZpY2F0aW9uJywgZnVuY3Rpb24oZGF0YSkge1xuICAgIHZhciBwZXJjZW50YWdlID0gcGFyc2VJbnQoTWF0aC5mbG9vcihkYXRhLmNvdW50ZXIgLyBkYXRhLnRvdGFsICogMTAwKSwgMTApO1xuICAgICRzY29wZS5iYXIudmFsdWUgPSBwZXJjZW50YWdlO1xuICAgIGlmIChwZXJjZW50YWdlID09PSAxMDApIHtcbiAgICAgICRzY29wZS5zdGF0dXNCYXJWaXNpYmxlID0gZmFsc2U7XG4gICAgICAkc2NvcGUuYmFyLnZhbHVlID0gMDtcbiAgICB9XG4gIH0pO1xufSk7IiwiKGZ1bmN0aW9uKCkge1xuXG4gICAgJ3VzZSBzdHJpY3QnO1xuICAgIC8vIEhvcGUgeW91IGRpZG4ndCBmb3JnZXQgQW5ndWxhciEgRHVoLWRveS5cbiAgICBpZiAoIXdpbmRvdy5hbmd1bGFyKSB0aHJvdyBuZXcgRXJyb3IoJ0kgY2FuXFwndCBmaW5kIEFuZ3VsYXIhJyk7XG5cbiAgICB2YXIgYXBwID0gYW5ndWxhci5tb2R1bGUoJ2ZzYVByZUJ1aWx0JywgW10pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ2luaXRTb2NrZXQnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCF3aW5kb3cuaW8pIHRocm93IG5ldyBFcnJvcignc29ja2V0LmlvIG5vdCBmb3VuZCEnKTtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5pbyh3aW5kb3cubG9jYXRpb24ub3JpZ2luKTtcbiAgICB9KTtcblxuICAgIGFwcC5mYWN0b3J5KCdzb2NrZXQnLCBmdW5jdGlvbigkcm9vdFNjb3BlLCBpbml0U29ja2V0KSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBvbjogZnVuY3Rpb24oZXZlbnROYW1lLCBjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgIGluaXRTb2NrZXQub24oZXZlbnROYW1lLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkoaW5pdFNvY2tldCwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGVtaXQ6IGZ1bmN0aW9uKGV2ZW50TmFtZSwgZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBpbml0U29ja2V0LmVtaXQoZXZlbnROYW1lLCBkYXRhLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkoaW5pdFNvY2tldCwgYXJncyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgfSk7XG5cbiAgICBhcHAuZmFjdG9yeSgnQXBwQ29uZmlnJywgZnVuY3Rpb24oJGh0dHApIHtcbiAgICAgICAgdmFyIF9jb25maWdQYXJhbXMgPSBudWxsO1xuXG4gICAgICAgIGZ1bmN0aW9uIGZldGNoQ29uZmlnKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9zb3VuZGNsb3VkL3NvdW5kY2xvdWRDb25maWcnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIHNldENvbmZpZyhkYXRhKSB7XG4gICAgICAgICAgICBfY29uZmlnUGFyYW1zID0gZGF0YTtcbiAgICAgICAgICAgIFNDLmluaXRpYWxpemUoe1xuICAgICAgICAgICAgICAgIGNsaWVudF9pZDogZGF0YS5jbGllbnRJRCxcbiAgICAgICAgICAgICAgICByZWRpcmVjdF91cmk6IGRhdGEuY2FsbGJhY2tVUkwsXG4gICAgICAgICAgICAgICAgc2NvcGU6IFwibm9uLWV4cGlyaW5nXCJcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0Q29uZmlnKCkge1xuICAgICAgICAgICAgcmV0dXJuIF9jb25maWdQYXJhbXM7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgZmV0Y2hDb25maWc6IGZldGNoQ29uZmlnLFxuICAgICAgICAgICAgZ2V0Q29uZmlnOiBnZXRDb25maWcsXG4gICAgICAgICAgICBzZXRDb25maWc6IHNldENvbmZpZ1xuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgLy8gQVVUSF9FVkVOVFMgaXMgdXNlZCB0aHJvdWdob3V0IG91ciBhcHAgdG9cbiAgICAvLyBicm9hZGNhc3QgYW5kIGxpc3RlbiBmcm9tIGFuZCB0byB0aGUgJHJvb3RTY29wZVxuICAgIC8vIGZvciBpbXBvcnRhbnQgZXZlbnRzIGFib3V0IGF1dGhlbnRpY2F0aW9uIGZsb3cuXG4gICAgLy8gYXBwLmNvbnN0YW50KCdBVVRIX0VWRU5UUycsIHtcbiAgICAvLyAgICAgbG9naW5TdWNjZXNzOiAnYXV0aC1sb2dpbi1zdWNjZXNzJyxcbiAgICAvLyAgICAgbG9naW5GYWlsZWQ6ICdhdXRoLWxvZ2luLWZhaWxlZCcsXG4gICAgLy8gICAgIGxvZ291dFN1Y2Nlc3M6ICdhdXRoLWxvZ291dC1zdWNjZXNzJyxcbiAgICAvLyAgICAgc2Vzc2lvblRpbWVvdXQ6ICdhdXRoLXNlc3Npb24tdGltZW91dCcsXG4gICAgLy8gICAgIG5vdEF1dGhlbnRpY2F0ZWQ6ICdhdXRoLW5vdC1hdXRoZW50aWNhdGVkJyxcbiAgICAvLyAgICAgbm90QXV0aG9yaXplZDogJ2F1dGgtbm90LWF1dGhvcml6ZWQnXG4gICAgLy8gfSk7XG5cbiAgICAvLyBhcHAuZmFjdG9yeSgnQXV0aEludGVyY2VwdG9yJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHEsIEFVVEhfRVZFTlRTKSB7XG4gICAgLy8gICAgIHZhciBzdGF0dXNEaWN0ID0ge1xuICAgIC8vICAgICAgICAgNDAxOiBBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLFxuICAgIC8vICAgICAgICAgNDAzOiBBVVRIX0VWRU5UUy5ub3RBdXRob3JpemVkLFxuICAgIC8vICAgICAgICAgNDE5OiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCxcbiAgICAvLyAgICAgICAgIDQ0MDogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXRcbiAgICAvLyAgICAgfTtcbiAgICAvLyAgICAgcmV0dXJuIHtcbiAgICAvLyAgICAgICAgIHJlc3BvbnNlRXJyb3I6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgLy8gICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KHN0YXR1c0RpY3RbcmVzcG9uc2Uuc3RhdHVzXSwgcmVzcG9uc2UpO1xuICAgIC8vICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QocmVzcG9uc2UpXG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgIH07XG4gICAgLy8gfSk7XG5cbiAgICAvLyBhcHAuY29uZmlnKGZ1bmN0aW9uKCRodHRwUHJvdmlkZXIpIHtcbiAgICAvLyAgICAgJGh0dHBQcm92aWRlci5pbnRlcmNlcHRvcnMucHVzaChbXG4gICAgLy8gICAgICAgICAnJGluamVjdG9yJyxcbiAgICAvLyAgICAgICAgIGZ1bmN0aW9uKCRpbmplY3Rvcikge1xuICAgIC8vICAgICAgICAgICAgIHJldHVybiAkaW5qZWN0b3IuZ2V0KCdBdXRoSW50ZXJjZXB0b3InKTtcbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgXSk7XG4gICAgLy8gfSk7XG5cbiAgICAvLyBhcHAuc2VydmljZSgnQXV0aFNlcnZpY2UnLCBmdW5jdGlvbigkaHR0cCwgU2Vzc2lvbiwgJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMsICRxKSB7XG5cbiAgICAvLyAgICAgZnVuY3Rpb24gb25TdWNjZXNzZnVsTG9naW4ocmVzcG9uc2UpIHtcbiAgICAvLyAgICAgICAgIHZhciBkYXRhID0gcmVzcG9uc2UuZGF0YTtcbiAgICAvLyAgICAgICAgIFNlc3Npb24uY3JlYXRlKGRhdGEuaWQsIGRhdGEudXNlcik7XG4gICAgLy8gICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzKTtcbiAgICAvLyAgICAgICAgIHJldHVybiBkYXRhLnVzZXI7XG4gICAgLy8gICAgIH1cblxuICAgIC8vICAgICAvLyBVc2VzIHRoZSBzZXNzaW9uIGZhY3RvcnkgdG8gc2VlIGlmIGFuXG4gICAgLy8gICAgIC8vIGF1dGhlbnRpY2F0ZWQgdXNlciBpcyBjdXJyZW50bHkgcmVnaXN0ZXJlZC5cbiAgICAvLyAgICAgdGhpcy5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyAgICAgICAgIHJldHVybiAhIVNlc3Npb24udXNlcjtcbiAgICAvLyAgICAgfTtcblxuICAgIC8vICAgICB0aGlzLmdldExvZ2dlZEluVXNlciA9IGZ1bmN0aW9uKGZyb21TZXJ2ZXIpIHtcblxuICAgIC8vICAgICAgICAgLy8gSWYgYW4gYXV0aGVudGljYXRlZCBzZXNzaW9uIGV4aXN0cywgd2VcbiAgICAvLyAgICAgICAgIC8vIHJldHVybiB0aGUgdXNlciBhdHRhY2hlZCB0byB0aGF0IHNlc3Npb25cbiAgICAvLyAgICAgICAgIC8vIHdpdGggYSBwcm9taXNlLiBUaGlzIGVuc3VyZXMgdGhhdCB3ZSBjYW5cbiAgICAvLyAgICAgICAgIC8vIGFsd2F5cyBpbnRlcmZhY2Ugd2l0aCB0aGlzIG1ldGhvZCBhc3luY2hyb25vdXNseS5cblxuICAgIC8vICAgICAgICAgLy8gT3B0aW9uYWxseSwgaWYgdHJ1ZSBpcyBnaXZlbiBhcyB0aGUgZnJvbVNlcnZlciBwYXJhbWV0ZXIsXG4gICAgLy8gICAgICAgICAvLyB0aGVuIHRoaXMgY2FjaGVkIHZhbHVlIHdpbGwgbm90IGJlIHVzZWQuXG5cbiAgICAvLyAgICAgICAgIGlmICh0aGlzLmlzQXV0aGVudGljYXRlZCgpICYmIGZyb21TZXJ2ZXIgIT09IHRydWUpIHtcbiAgICAvLyAgICAgICAgICAgICByZXR1cm4gJHEud2hlbihTZXNzaW9uLnVzZXIpO1xuICAgIC8vICAgICAgICAgfVxuXG4gICAgLy8gICAgICAgICAvLyBNYWtlIHJlcXVlc3QgR0VUIC9zZXNzaW9uLlxuICAgIC8vICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIHVzZXIsIGNhbGwgb25TdWNjZXNzZnVsTG9naW4gd2l0aCB0aGUgcmVzcG9uc2UuXG4gICAgLy8gICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgNDAxIHJlc3BvbnNlLCB3ZSBjYXRjaCBpdCBhbmQgaW5zdGVhZCByZXNvbHZlIHRvIG51bGwuXG4gICAgLy8gICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvc2Vzc2lvbicpLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pLmNhdGNoKGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgIC8vICAgICAgICAgfSk7XG5cbiAgICAvLyAgICAgfTtcblxuICAgIC8vICAgICB0aGlzLmxvZ2luID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcbiAgICAvLyAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvbG9naW4nLCBjcmVkZW50aWFscylcbiAgICAvLyAgICAgICAgICAgICAudGhlbihvblN1Y2Nlc3NmdWxMb2dpbilcbiAgICAvLyAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgLy8gICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ0ludmFsaWQgbG9naW4gY3JlZGVudGlhbHMuJ1xuICAgIC8vICAgICAgICAgICAgICAgICB9KTtcbiAgICAvLyAgICAgICAgICAgICB9KTtcbiAgICAvLyAgICAgfTtcblxuICAgIC8vICAgICB0aGlzLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgLy8gICAgICAgICAgICAgU2Vzc2lvbi5kZXN0cm95KCk7XG4gICAgLy8gICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MpO1xuICAgIC8vICAgICAgICAgfSk7XG4gICAgLy8gICAgIH07XG4gICAgLy8gfSk7XG5cbiAgICAvLyBhcHAuc2VydmljZSgnU2Vzc2lvbicsIGZ1bmN0aW9uKCRyb290U2NvcGUsIEFVVEhfRVZFTlRTKSB7XG5cbiAgICAvLyAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsIGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICAgICAgc2VsZi5kZXN0cm95KCk7XG4gICAgLy8gICAgIH0pO1xuXG4gICAgLy8gICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCBmdW5jdGlvbigpIHtcbiAgICAvLyAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgIC8vICAgICB9KTtcblxuICAgIC8vICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAvLyAgICAgdGhpcy51c2VyID0gbnVsbDtcblxuICAgIC8vICAgICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uKHNlc3Npb25JZCwgdXNlcikge1xuICAgIC8vICAgICAgICAgdGhpcy5pZCA9IHNlc3Npb25JZDtcbiAgICAvLyAgICAgICAgIHRoaXMudXNlciA9IHVzZXI7XG4gICAgLy8gICAgIH07XG5cbiAgICAvLyAgICAgdGhpcy5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gICAgICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAvLyAgICAgICAgIHRoaXMudXNlciA9IG51bGw7XG4gICAgLy8gICAgIH07XG5cbiAgICAvLyB9KTtcblxufSkoKTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhZG1pbicsIHtcbiAgICB1cmw6ICcvYWRtaW4nLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvbG9naW4vbG9naW4uaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0FkbWluTG9naW5Db250cm9sbGVyJ1xuICB9KTtcbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdBZG1pbkxvZ2luQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgQXV0aFNlcnZpY2UsIG9FbWJlZEZhY3RvcnkpIHtcbiAgJHNjb3BlLmNvdW50ZXIgPSAwO1xuICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzID0gW107XG4gICRzY29wZS5zdWJtaXNzaW9ucyA9IFtdO1xuXG4gICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2xvZ2luJywge1xuICAgICAgcGFzc3dvcmQ6ICRzY29wZS5wYXNzd29yZFxuICAgIH0pLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAkcm9vdFNjb3BlLnBhc3N3b3JkID0gJHNjb3BlLnBhc3N3b3JkO1xuICAgICAgJHNjb3BlLnNob3dTdWJtaXNzaW9ucyA9IHRydWU7XG4gICAgICAkc2NvcGUubG9hZFN1Ym1pc3Npb25zKCk7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIGFsZXJ0KCdXcm9uZyBQYXNzd29yZCcpO1xuICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICRodHRwLmdldCgnL2FwaS9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2FkbWluJztcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICBhbGVydCgnV3JvbmcgUGFzc3dvcmQnKTtcbiAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5tYW5hZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgXG4gICAgU0MuY29ubmVjdCgpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHJvb3RTY29wZS5hY2Nlc3NUb2tlbiA9IHJlcy5vYXV0aF90b2tlbjtcbiAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvbG9naW4vYXV0aGVudGljYXRlZCcsIHtcbiAgICAgICAgICB0b2tlbjogcmVzLm9hdXRoX3Rva2VuLFxuICAgICAgICAgIHBhc3N3b3JkOiAkcm9vdFNjb3BlLnBhc3N3b3JkLFxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAkcm9vdFNjb3BlLnNjaGVkdWxlckluZm8gPSByZXMuZGF0YTtcbiAgICAgICAgJHJvb3RTY29wZS5zY2hlZHVsZXJJbmZvLmV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2KSB7XG4gICAgICAgICAgZXYuZGF5ID0gbmV3IERhdGUoZXYuZGF5KTtcbiAgICAgICAgfSk7XG4gICAgICAgICRzdGF0ZS5nbygnc2NoZWR1bGVyJyk7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGFsZXJ0KCdFcnJvcjogQ291bGQgbm90IGxvZyBpbicpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gIH1cbn0pOyIsImFwcC5mYWN0b3J5KCdvRW1iZWRGYWN0b3J5JywgZnVuY3Rpb24oKXtcblx0cmV0dXJuIHtcblx0XHRlbWJlZFNvbmc6IGZ1bmN0aW9uKHN1Yikge1xuXHQgICAgICAgIHJldHVybiBTQy5vRW1iZWQoXCJodHRwOi8vYXBpLnNvdW5kY2xvdWQuY29tL3RyYWNrcy9cIiArIHN1Yi50cmFja0lELCB7XG5cdCAgICAgICAgICBlbGVtZW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzdWIudHJhY2tJRCArIFwicGxheWVyXCIpLFxuXHQgICAgICAgICAgYXV0b19wbGF5OiBmYWxzZSxcblx0ICAgICAgICAgIG1heGhlaWdodDogMTUwXG5cdCAgICAgICAgfSk7XG5cdFx0fVxuXHR9O1xufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncGF5Jywge1xuICAgIHVybDogJy9wYXkvOnN1Ym1pc3Npb25JRCcsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9wYXkvcGF5Lmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdQYXlDb250cm9sbGVyJyxcbiAgICByZXNvbHZlOiB7XG4gICAgICBjaGFubmVsczogZnVuY3Rpb24oJGh0dHApIHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9jaGFubmVscycpXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICBzdWJtaXNzaW9uOiBmdW5jdGlvbigkaHR0cCwgJHN0YXRlUGFyYW1zKSB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvc3VibWlzc2lvbnMvd2l0aElELycgKyAkc3RhdGVQYXJhbXMuc3VibWlzc2lvbklEKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgIH0pXG4gICAgICB9LFxuICAgICAgdHJhY2s6IGZ1bmN0aW9uKHN1Ym1pc3Npb24pIHtcbiAgICAgICAgcmV0dXJuIFNDLmdldCgnL3RyYWNrcy8nICsgc3VibWlzc2lvbi50cmFja0lEKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHRyYWNrKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJhY2s7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn0pO1xuXG5hcHAuZmlsdGVyKCdjYWxjdWxhdGVEaXNjb3VudCcsIGZ1bmN0aW9uKCkge1xuICByZXR1cm4gZnVuY3Rpb24oaW5wdXQpIHtcbiAgICByZXR1cm4gcGFyc2VGbG9hdChpbnB1dCAqIDAuOTApLnRvRml4ZWQoMik7XG4gIH07XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ1BheUNvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsICRodHRwLCBjaGFubmVscywgc3VibWlzc2lvbiwgdHJhY2ssICRzdGF0ZSwgJHVpYk1vZGFsKSB7XG4gICRyb290U2NvcGUuc3VibWlzc2lvbiA9IHN1Ym1pc3Npb247XG4gICRzY29wZS5hdURMTGluayA9IGZhbHNlO1xuICBpZiAoc3VibWlzc2lvbi5wYWlkKSAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgJHNjb3BlLnRyYWNrID0gdHJhY2s7XG4gIFNDLm9FbWJlZCh0cmFjay51cmksIHtcbiAgICBlbGVtZW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKSxcbiAgICBhdXRvX3BsYXk6IGZhbHNlLFxuICAgIG1heGhlaWdodDogMTUwXG4gIH0pO1xuICAkc2NvcGUudG90YWwgPSAwO1xuICAkc2NvcGUuc2hvd1RvdGFsID0gMDtcbiAgJHNjb3BlLmNoYW5uZWxzID0gY2hhbm5lbHMuZmlsdGVyKGZ1bmN0aW9uKGNoKSB7XG4gICAgcmV0dXJuIChzdWJtaXNzaW9uLmNoYW5uZWxJRFMuaW5kZXhPZihjaC5jaGFubmVsSUQpICE9IC0xKVxuICB9KTtcblxuICAkc2NvcGUuYXVETExpbmsgPSAkc2NvcGUudHJhY2sucHVyY2hhc2VfdXJsID8gKCRzY29wZS50cmFjay5wdXJjaGFzZV91cmwuaW5kZXhPZihcImFydGlzdHN1bmxpbWl0ZWQuY29cIikgIT0gLTEpIDogZmFsc2U7XG5cbiAgJHNjb3BlLnNlbGVjdGVkQ2hhbm5lbHMgPSB7fTtcbiAgJHNjb3BlLmNoYW5uZWxzLmZvckVhY2goZnVuY3Rpb24oY2gpIHtcbiAgICAkc2NvcGUuc2VsZWN0ZWRDaGFubmVsc1tjaC5kaXNwbGF5TmFtZV0gPSBmYWxzZTtcbiAgfSk7XG5cbiAgJHNjb3BlLmdvVG9Mb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgICRzdGF0ZS5nbygnbG9naW4nLCB7XG4gICAgICAnc3VibWlzc2lvbic6ICRyb290U2NvcGUuc3VibWlzc2lvblxuICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLnJlY2FsY3VsYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnRvdGFsID0gMDtcbiAgICAkc2NvcGUudG90YWxQYXltZW50ID0gMDtcbiAgICBmb3IgKHZhciBrZXkgaW4gJHNjb3BlLnNlbGVjdGVkQ2hhbm5lbHMpIHtcbiAgICAgIGlmICgkc2NvcGUuc2VsZWN0ZWRDaGFubmVsc1trZXldKSB7XG4gICAgICAgIHZhciBjaGFuID0gJHNjb3BlLmNoYW5uZWxzLmZpbmQoZnVuY3Rpb24oY2gpIHtcbiAgICAgICAgICByZXR1cm4gY2guZGlzcGxheU5hbWUgPT0ga2V5O1xuICAgICAgICB9KVxuICAgICAgICAkc2NvcGUudG90YWwgKz0gY2hhbi5wcmljZTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCRzY29wZS5hdURMTGluaykgJHNjb3BlLnRvdGFsID0gTWF0aC5mbG9vcigwLjkgKiAkc2NvcGUudG90YWwpO1xuICB9XG5cbiAgJHNjb3BlLm1ha2VQYXltZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ2F5Jyk7XG4gICAgaWYgKCRzY29wZS50b3RhbCAhPSAwKSB7XG4gICAgICBpZiAoJHNjb3BlLmF1RExMaW5rKSB7XG4gICAgICAgICRzY29wZS5kaXNjb3VudE1vZGFsSW5zdGFuY2UgPSAkdWliTW9kYWwub3Blbih7XG4gICAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiAnZGlzY291bnRNb2RhbC5odG1sJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnZGlzY291bnRNb2RhbENvbnRyb2xsZXInLFxuICAgICAgICAgIHNjb3BlOiAkc2NvcGVcbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkc2NvcGUuY29udGludWVQYXkoZmFsc2UpO1xuICAgICAgfVxuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuY29udGludWVQYXkgPSBmdW5jdGlvbihkaXNjb3VudGVkKSB7XG4gICAgaWYgKCRzY29wZS5kaXNjb3VudGVkTW9kYWwpIHtcbiAgICAgICRzY29wZS5kaXNjb3VudE1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcbiAgICB9XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgIHZhciBwcmljaW5nT2JqID0ge1xuICAgICAgY2hhbm5lbHM6IFtdLFxuICAgICAgZGlzY291bnRlZDogZGlzY291bnRlZCxcbiAgICAgIHN1Ym1pc3Npb246ICRyb290U2NvcGUuc3VibWlzc2lvblxuICAgIH07XG4gICAgZm9yICh2YXIga2V5IGluICRzY29wZS5zZWxlY3RlZENoYW5uZWxzKSB7XG4gICAgICBpZiAoJHNjb3BlLnNlbGVjdGVkQ2hhbm5lbHNba2V5XSkge1xuICAgICAgICB2YXIgY2hhbiA9ICRzY29wZS5jaGFubmVscy5maW5kKGZ1bmN0aW9uKGNoKSB7XG4gICAgICAgICAgcmV0dXJuIGNoLmRpc3BsYXlOYW1lID09IGtleTtcbiAgICAgICAgfSlcbiAgICAgICAgcHJpY2luZ09iai5jaGFubmVscy5wdXNoKGNoYW4uY2hhbm5lbElEKTtcbiAgICAgIH1cbiAgICB9XG4gICAgJGh0dHAucG9zdCgnL2FwaS9zdWJtaXNzaW9ucy9nZXRQYXltZW50JywgcHJpY2luZ09iailcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24gPSByZXMuZGF0YTtcbiAgICAgIH0pXG4gIH1cblxuXG4gICRzY29wZS5hZGRUb0NhcnQgPSBmdW5jdGlvbihjaGFubmVsKSB7XG4gICAgY29uc29sZS5sb2coJHNjb3BlLnNlbGVjdGVkQ2hhbm5lbHMpO1xuICAgIGlmIChjaGFubmVsLmFkZHRvY2FydCkge1xuICAgICAgJHNjb3BlLnRvdGFsID0gJHNjb3BlLnRvdGFsIC0gY2hhbm5lbC5wcmljZTtcbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLnRvdGFsICs9IGNoYW5uZWwucHJpY2U7XG4gICAgfVxuICAgIGlmICgkc2NvcGUuYXVETExpbmspICRzY29wZS5zaG93VG90YWwgPSBwYXJzZUZsb2F0KCRzY29wZS50b3RhbCAqIDAuOSkudG9GaXhlZCgyKTtcbiAgICBlbHNlICRzY29wZS5zaG93VG90YWwgPSAkc2NvcGUudG90YWw7XG5cbiAgICAkc2NvcGUuc2VsZWN0ZWRDaGFubmVsc1tjaGFubmVsLmRpc3BsYXlOYW1lXSA9ICRzY29wZS5zZWxlY3RlZENoYW5uZWxzW2NoYW5uZWwuZGlzcGxheU5hbWVdID09IHRydWUgPyBmYWxzZSA6IHRydWU7XG5cbiAgICBjaGFubmVsLmFkZHRvY2FydCA9IGNoYW5uZWwuYWRkdG9jYXJ0ID8gZmFsc2UgOiB0cnVlO1xuICB9O1xuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ2Rpc2NvdW50TW9kYWxDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlKSB7XG5cbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnY29tcGxldGUnLCB7XG4gICAgdXJsOiAnL2NvbXBsZXRlJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL3BheS90aGFua3lvdS5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnVGhhbmt5b3VDb250cm9sbGVyJ1xuICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignVGhhbmt5b3VDb250cm9sbGVyJywgZnVuY3Rpb24oJGh0dHAsICRzY29wZSwgJGxvY2F0aW9uKSB7XG4gICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgJGh0dHAucHV0KCcvYXBpL3N1Ym1pc3Npb25zL2NvbXBsZXRlZFBheW1lbnQnLCAkbG9jYXRpb24uc2VhcmNoKCkpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgJHNjb3BlLnN1Ym1pc3Npb24gPSByZXMuZGF0YS5zdWJtaXNzaW9uO1xuICAgICAgJHNjb3BlLmV2ZW50cyA9IHJlcy5kYXRhLmV2ZW50cztcbiAgICAgICRzY29wZS5ldmVudHMuZm9yRWFjaChmdW5jdGlvbihldikge1xuICAgICAgICBldi5kYXRlID0gbmV3IERhdGUoZXYuZGF0ZSk7XG4gICAgICB9KVxuICAgIH0pXG4gICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKXtcbiAgICAgIGFsZXJ0KCdUaGVyZSB3YXMgYW4gZXJyb3IgcHJvY2Vzc2luZyB5b3VyIHJlcXVlc3QnKTtcbiAgICB9KVxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnc2NoZWR1bGVyJywge1xuICAgIHVybDogJy9zY2hlZHVsZXInLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvc2NoZWR1bGVyL3NjaGVkdWxlci5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnU2NoZWR1bGVyQ29udHJvbGxlcidcbiAgfSk7XG59KTtcblxuXG5hcHAuY29udHJvbGxlcignU2NoZWR1bGVyQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgQXV0aFNlcnZpY2UsICR3aW5kb3cpIHtcblxuICAkc2NvcGUubWFrZUV2ZW50VVJMID0gXCJcIjtcbiAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XG4gIHZhciBpbmZvID0gJHJvb3RTY29wZS5zY2hlZHVsZXJJbmZvO1xuICBpZiAoIWluZm8pIHtcbiAgICAkc3RhdGUuZ28oJ2FkbWluJyk7XG4gIH1cbiAgJHNjb3BlLmNoYW5uZWwgPSBpbmZvLmNoYW5uZWw7XG4gICRzY29wZS5zdWJtaXNzaW9ucyA9IGluZm8uc3VibWlzc2lvbnM7XG5cbiAgJHNjb3BlLmNhbGVuZGFyID0gZmlsbERhdGVBcnJheXMoaW5mby5ldmVudHMpO1xuICAkc2NvcGUuZGF5SW5jciA9IDA7XG5cbiAgJHNjb3BlLmJhY2sgPSBmdW5jdGlvbigpIHtcbiAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG5cbiAgfVxuXG4gICRzY29wZS5zYXZlQ2hhbm5lbCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkc2NvcGUuY2hhbm5lbC5wYXNzd29yZCA9ICRyb290U2NvcGUucGFzc3dvcmQ7XG4gICAgJGh0dHAucHV0KFwiL2FwaS9jaGFubmVsc1wiLCAkc2NvcGUuY2hhbm5lbClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICB3aW5kb3cuYWxlcnQoXCJTYXZlZFwiKTtcbiAgICAgICAgJHNjb3BlLmNoYW5uZWwgPSByZXMuZGF0YTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgd2luZG93LmFsZXJ0KFwiRXJyb3I6IGRpZCBub3Qgc2F2ZVwiKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmluY3JEYXkgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLmRheUluY3IgPCAxNCkgJHNjb3BlLmRheUluY3IrKztcbiAgfVxuXG4gICRzY29wZS5kZWNyRGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCRzY29wZS5kYXlJbmNyID4gMCkgJHNjb3BlLmRheUluY3ItLTtcbiAgfVxuXG4gICRzY29wZS5jbGlja2VkU2xvdCA9IGZ1bmN0aW9uKGRheSwgaG91cikge1xuICAgIHZhciB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgaWYgKHRvZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09IGRheS50b0xvY2FsZURhdGVTdHJpbmcoKSAmJiB0b2RheS5nZXRIb3VycygpID4gaG91cikgcmV0dXJuO1xuICAgICRzY29wZS5zaG93T3ZlcmxheSA9IHRydWU7XG4gICAgdmFyIGNhbERheSA9IHt9O1xuICAgIHZhciBjYWxlbmRhckRheSA9ICRzY29wZS5jYWxlbmRhci5maW5kKGZ1bmN0aW9uKGNhbEQpIHtcbiAgICAgIHJldHVybiBjYWxELmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSBkYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XG4gICAgfSk7XG4gICAgJHNjb3BlLm1ha2VFdmVudFVSTCA9IHVuZGVmaW5lZDtcbiAgICAkc2NvcGUubWFrZUV2ZW50ID0gY2FsZW5kYXJEYXkuZXZlbnRzW2hvdXJdO1xuICAgIGlmICgkc2NvcGUubWFrZUV2ZW50ID09IFwiLVwiKSB7XG4gICAgICB2YXIgbWFrZURheSA9IG5ldyBEYXRlKGRheSk7XG4gICAgICBtYWtlRGF5LnNldEhvdXJzKGhvdXIpO1xuICAgICAgJHNjb3BlLm1ha2VFdmVudCA9IHtcbiAgICAgICAgY2hhbm5lbElEOiAkc2NvcGUuY2hhbm5lbC5jaGFubmVsSUQsXG4gICAgICAgIGRheTogbWFrZURheSxcbiAgICAgICAgcGFpZDogZmFsc2VcbiAgICAgIH07XG4gICAgICAkc2NvcGUubmV3RXZlbnQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUubWFrZUV2ZW50VVJMID0gJ2h0dHBzOi8vYXBpLnNvdW5kY2xvdWQuY29tL3RyYWNrcy8nICsgJHNjb3BlLm1ha2VFdmVudC50cmFja0lEO1xuICAgICAgU0Mub0VtYmVkKCdodHRwczovL2FwaS5zb3VuZGNsb3VkLmNvbS90cmFja3MvJyArICRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCwge1xuICAgICAgICBlbGVtZW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKSxcbiAgICAgICAgYXV0b19wbGF5OiBmYWxzZSxcbiAgICAgICAgbWF4aGVpZ2h0OiAxNTBcbiAgICAgIH0pO1xuICAgICAgJHNjb3BlLm5ld0V2ZW50ID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLmNoYW5nZVBhaWQgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQgPSB1bmRlZmluZWQ7XG4gICAgJHNjb3BlLm1ha2VFdmVudFVSTCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gICRzY29wZS5jaGFuZ2VVUkwgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAucG9zdCgnL2FwaS9zb3VuZGNsb3VkL3Jlc29sdmUnLCB7XG4gICAgICAgIHVybDogJHNjb3BlLm1ha2VFdmVudFVSTFxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQgPSByZXMuZGF0YS5pZDtcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC50aXRsZSA9IHJlcy5kYXRhLnRpdGxlO1xuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnRyYWNrVVJMID0gcmVzLmRhdGEudHJhY2tVUkw7XG4gICAgICAgIGlmIChyZXMuZGF0YS51c2VyKSAkc2NvcGUubWFrZUV2ZW50LmFydGlzdE5hbWUgPSByZXMuZGF0YS51c2VyLnVzZXJuYW1lO1xuICAgICAgICBTQy5vRW1iZWQoJHNjb3BlLm1ha2VFdmVudFVSTCwge1xuICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLFxuICAgICAgICAgIGF1dG9fcGxheTogZmFsc2UsXG4gICAgICAgICAgbWF4aGVpZ2h0OiAxNTBcbiAgICAgICAgfSlcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUGxheWVyJykuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuICAgICAgICAkc2NvcGUubm90Rm91bmQgPSBmYWxzZTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuICAgICAgICAkc2NvcGUubm90Rm91bmQgPSB0cnVlO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUuZGVsZXRlRXZlbnQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoISRzY29wZS5uZXdFdmVudCkge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgJGh0dHAuZGVsZXRlKCcvYXBpL2V2ZW50cy8nICsgJHNjb3BlLm1ha2VFdmVudC5faWQgKyAnLycgKyAkcm9vdFNjb3BlLnBhc3N3b3JkKVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICB2YXIgY2FsZW5kYXJEYXkgPSAkc2NvcGUuY2FsZW5kYXIuZmluZChmdW5jdGlvbihjYWxEKSB7XG4gICAgICAgICAgICByZXR1cm4gY2FsRC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gJHNjb3BlLm1ha2VFdmVudC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgY2FsZW5kYXJEYXkuZXZlbnRzWyRzY29wZS5tYWtlRXZlbnQuZGF5LmdldEhvdXJzKCldID0gXCItXCI7XG4gICAgICAgICAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJEZWxldGVkXCIpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgIHdpbmRvdy5hbGVydChcIkVSUk9SOiBkaWQgbm90IERlbGV0ZS5cIilcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBjYWxlbmRhckRheSA9ICRzY29wZS5jYWxlbmRhci5maW5kKGZ1bmN0aW9uKGNhbEQpIHtcbiAgICAgICAgcmV0dXJuIGNhbEQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09ICRzY29wZS5tYWtlRXZlbnQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpO1xuICAgICAgfSk7XG4gICAgICBjYWxlbmRhckRheS5ldmVudHNbJHNjb3BlLm1ha2VFdmVudC5nZXRIb3VycygpXSA9IFwiLVwiO1xuICAgICAgdmFyIGV2ZW50c1xuICAgICAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLnNhdmVFdmVudCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghJHNjb3BlLm1ha2VFdmVudC50cmFja0lEICYmICEkc2NvcGUubWFrZUV2ZW50LnBhaWQpIHtcbiAgICAgIHdpbmRvdy5hbGVydChcIkVudGVyIGEgdHJhY2sgVVJMXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoJHNjb3BlLm5ld0V2ZW50KSB7XG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQucGFzc3dvcmQgPSAkcm9vdFNjb3BlLnBhc3N3b3JkO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAgICRodHRwLnBvc3QoJy9hcGkvZXZlbnRzJywgJHNjb3BlLm1ha2VFdmVudClcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHZhciBldmVudCA9IHJlcy5kYXRhO1xuICAgICAgICAgICAgZXZlbnQuZGF5ID0gbmV3IERhdGUoZXZlbnQuZGF5KTtcbiAgICAgICAgICAgIHZhciBjYWxlbmRhckRheSA9ICRzY29wZS5jYWxlbmRhci5maW5kKGZ1bmN0aW9uKGNhbEQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIGNhbEQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09IGV2ZW50LmRheS50b0xvY2FsZURhdGVTdHJpbmcoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY2FsZW5kYXJEYXkuZXZlbnRzW2V2ZW50LmRheS5nZXRIb3VycygpXSA9IGV2ZW50O1xuICAgICAgICAgICAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgd2luZG93LmFsZXJ0KFwiU2F2ZWRcIik7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJFUlJPUjogZGlkIG5vdCBTYXZlLlwiKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRzY29wZS5uZXdFdmVudC5wYXNzd29yZCA9ICRyb290U2NvcGUucGFzc3dvcmQ7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICAgJGh0dHAucHV0KCcvYXBpL2V2ZW50cycsICRzY29wZS5tYWtlRXZlbnQpXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB2YXIgZXZlbnQgPSByZXMuZGF0YTtcbiAgICAgICAgICAgIGV2ZW50LmRheSA9IG5ldyBEYXRlKGV2ZW50LmRheSk7XG4gICAgICAgICAgICB2YXIgY2FsZW5kYXJEYXkgPSAkc2NvcGUuY2FsZW5kYXIuZmluZChmdW5jdGlvbihjYWxEKSB7XG4gICAgICAgICAgICAgIHJldHVybiBjYWxELmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSBldmVudC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNhbGVuZGFyRGF5LmV2ZW50c1tldmVudC5nZXRIb3VycygpXSA9IGV2ZW50O1xuICAgICAgICAgICAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgd2luZG93LmFsZXJ0KFwiU2F2ZWRcIik7XG4gICAgICAgICAgfSlcbiAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJFUlJPUjogZGlkIG5vdCBTYXZlLlwiKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAkc2NvcGUuZW1haWxTbG90ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG1haWx0b19saW5rID0gXCJtYWlsdG86Y29heXNjdWVAZ21haWwuY29tP3N1YmplY3Q9UmVwb3N0IG9mIFwiICsgJHNjb3BlLm1ha2VFdmVudC50aXRsZSArICcmYm9keT1IZXkgJyArICRzY29wZS5tYWtlRXZlbnQuYXJ0aXN0TmFtZSArICcsXFxuXFxuIEkgYW0gcmVwb3N0aW5nIHlvdXIgc29uZyAnICsgJHNjb3BlLm1ha2VFdmVudC50aXRsZSArICcgb24gJyArICRzY29wZS5jaGFubmVsLmRpc3BsYXlOYW1lICsgJyBvbiAnICsgJHNjb3BlLm1ha2VFdmVudC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgKyAnLlxcblxcbiBCZXN0LCBcXG4nICsgJHNjb3BlLmNoYW5uZWwuZGlzcGxheU5hbWU7XG4gICAgbG9jYXRpb24uaHJlZiA9IGVuY29kZVVSSShtYWlsdG9fbGluayk7XG4gIH1cblxuICAvLyAkc2NvcGUuc2NFbWFpbFNsb3QgPSBmdW5jdGlvbigpIHtcblxuICAvLyB9XG5cbiAgJHNjb3BlLmJhY2tFdmVudCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5tYWtlRXZlbnQgPSBudWxsO1xuICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICB9XG5cbiAgJHNjb3BlLnJlbW92ZVF1ZXVlU29uZyA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgJHNjb3BlLmNoYW5uZWwucXVldWUuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAkc2NvcGUuc2F2ZUNoYW5uZWwoKTtcbiAgfVxuXG4gICRzY29wZS5hZGRTb25nID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCRzY29wZS5jaGFubmVsLnF1ZXVlLmluZGV4T2YoJHNjb3BlLm5ld1F1ZXVlSUQpICE9IC0xKSByZXR1cm47XG4gICAgJHNjb3BlLmNoYW5uZWwucXVldWUucHVzaCgkc2NvcGUubmV3UXVldWVJRCk7XG4gICAgJHNjb3BlLnNhdmVDaGFubmVsKCk7XG4gICAgJHNjb3BlLm5ld1F1ZXVlU29uZyA9IHVuZGVmaW5lZDtcbiAgICAkc2NvcGUuY2hhbmdlUXVldWVTb25nKCk7XG4gICAgJHNjb3BlLmxvYWRRdWV1ZVNvbmdzKFskc2NvcGUubmV3UXVldWVJRF0pO1xuICB9XG5cbiAgJHNjb3BlLmNoYW5nZVF1ZXVlU29uZyA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIHtcbiAgICAgICAgdXJsOiAkc2NvcGUubmV3UXVldWVTb25nXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIHZhciB0cmFjayA9IHJlcy5kYXRhO1xuICAgICAgICAkc2NvcGUubmV3UXVldWVJRCA9IHRyYWNrLmlkO1xuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBhbGVydChcImVycm9yIGdldHRpbmcgc29uZ1wiKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLm1vdmVVcCA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgaWYgKGluZGV4ID09IDApIHJldHVybjtcbiAgICB2YXIgcyA9ICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4XTtcbiAgICAkc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleF0gPSAkc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleCAtIDFdO1xuICAgICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4IC0gMV0gPSBzO1xuICAgICRzY29wZS5zYXZlQ2hhbm5lbCgpO1xuICAgICRzY29wZS5sb2FkUXVldWVTb25ncyhbJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXhdLCAkc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleCAtIDFdXSk7XG4gIH1cblxuICAkc2NvcGUubW92ZURvd24gPSBmdW5jdGlvbihpbmRleCkge1xuICAgIGlmIChpbmRleCA9PSAkc2NvcGUuY2hhbm5lbC5xdWV1ZS5sZW5ndGggLSAxKSByZXR1cm47XG4gICAgdmFyIHMgPSAkc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleF07XG4gICAgJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXhdID0gJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXggKyAxXTtcbiAgICAkc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleCArIDFdID0gcztcbiAgICAkc2NvcGUuc2F2ZUNoYW5uZWwoKTtcbiAgICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MoWyRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4XSwgJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXggKyAxXV0pO1xuICB9XG5cbiAgLy8gJHNjb3BlLmNhbkxvd2VyT3BlbkV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAvLyAgIHZhciB3YWl0aW5nU3VicyA9ICRzY29wZS5zdWJtaXNzaW9ucy5maWx0ZXIoZnVuY3Rpb24oc3ViKSB7XG4gIC8vICAgICByZXR1cm4gc3ViLmludm9pY2VJRDtcbiAgLy8gICB9KTtcbiAgLy8gICB2YXIgb3BlblNsb3RzID0gW107XG4gIC8vICAgJHNjb3BlLmNhbGVuZGFyLmZvckVhY2goZnVuY3Rpb24oZGF5KSB7XG4gIC8vICAgICBkYXkuZXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXYpIHtcbiAgLy8gICAgICAgaWYgKGV2LnBhaWQgJiYgIWV2LnRyYWNrSUQpIG9wZW5TbG90cy5wdXNoKGV2KTtcbiAgLy8gICAgIH0pO1xuICAvLyAgIH0pO1xuICAvLyAgIHZhciBvcGVuTnVtID0gb3BlblNsb3RzLmxlbmd0aCAtIHdhaXRpbmdTdWJzLmxlbmd0aDtcbiAgLy8gICByZXR1cm4gb3Blbk51bSA+IDA7XG4gIC8vIH1cblxuICAkc2NvcGUubG9hZFN1Ym1pc3Npb25zID0gZnVuY3Rpb24oKSB7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5zdWJtaXNzaW9ucy5mb3JFYWNoKGZ1bmN0aW9uKHN1Yikge1xuICAgICAgICBTQy5vRW1iZWQoXCJodHRwOi8vYXBpLnNvdW5kY2xvdWQuY29tL3RyYWNrcy9cIiArIHN1Yi50cmFja0lELCB7XG4gICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc3ViLnRyYWNrSUQgKyBcInBsYXllclwiKSxcbiAgICAgICAgICBhdXRvX3BsYXk6IGZhbHNlLFxuICAgICAgICAgIG1heGhlaWdodDogMTUwXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSwgNTApO1xuICB9XG5cbiAgJHNjb3BlLmxvYWRRdWV1ZVNvbmdzID0gZnVuY3Rpb24ocXVldWUpIHtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgcXVldWUuZm9yRWFjaChmdW5jdGlvbihzb25nSUQpIHtcbiAgICAgICAgU0Mub0VtYmVkKFwiaHR0cDovL2FwaS5zb3VuZGNsb3VkLmNvbS90cmFja3MvXCIgKyBzb25nSUQsIHtcbiAgICAgICAgICBlbGVtZW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzb25nSUQgKyBcInBsYXllclwiKSxcbiAgICAgICAgICBhdXRvX3BsYXk6IGZhbHNlLFxuICAgICAgICAgIG1heGhlaWdodDogMTUwXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSwgNTApO1xuICB9XG4gIGlmICgkc2NvcGUuY2hhbm5lbCAmJiAkc2NvcGUuY2hhbm5lbC5xdWV1ZSkge1xuICAgICRzY29wZS5sb2FkUXVldWVTb25ncygkc2NvcGUuY2hhbm5lbC5xdWV1ZSk7XG4gIH1cbiAgJHNjb3BlLmxvYWRTdWJtaXNzaW9ucygpO1xuXG59KTtcblxuZnVuY3Rpb24gZmlsbERhdGVBcnJheXMoZXZlbnRzKSB7XG4gIHZhciBjYWxlbmRhciA9IFtdO1xuICB2YXIgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICBmb3IgKHZhciBpID0gMDsgaSA8IDIxOyBpKyspIHtcbiAgICB2YXIgY2FsRGF5ID0ge307XG4gICAgY2FsRGF5LmRheSA9IG5ldyBEYXRlKClcbiAgICBjYWxEYXkuZGF5LnNldERhdGUodG9kYXkuZ2V0RGF0ZSgpICsgaSk7XG4gICAgdmFyIGRheUV2ZW50cyA9IGV2ZW50cy5maWx0ZXIoZnVuY3Rpb24oZXYpIHtcbiAgICAgIHJldHVybiAoZXYuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09IGNhbERheS5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkpO1xuICAgIH0pO1xuICAgIHZhciBldmVudEFycmF5ID0gW107XG4gICAgZm9yICh2YXIgaiA9IDA7IGogPCAyNDsgaisrKSB7XG4gICAgICBldmVudEFycmF5W2pdID0gXCItXCI7XG4gICAgfVxuICAgIGRheUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2KSB7XG4gICAgICBldmVudEFycmF5W2V2LmRheS5nZXRIb3VycygpXSA9IGV2O1xuICAgIH0pO1xuICAgIGNhbERheS5ldmVudHMgPSBldmVudEFycmF5O1xuICAgIGNhbGVuZGFyLnB1c2goY2FsRGF5KTtcbiAgfVxuICByZXR1cm4gY2FsZW5kYXI7XG59IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnc3VibWl0U29uZycsIHtcbiAgICB1cmw6ICcvc3VibWl0JyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL3N1Ym1pdC9zdWJtaXQudmlldy5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnU3VibWl0U29uZ0NvbnRyb2xsZXInXG4gIH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdTdWJtaXRTb25nQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCkge1xuXG4gICRzY29wZS5zdWJtaXNzaW9uID0ge307XG5cbiAgJHNjb3BlLnVybENoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIHtcbiAgICAgICAgdXJsOiAkc2NvcGUudXJsXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrSUQgPSByZXMuZGF0YS5pZDtcbiAgICAgICAgJHNjb3BlLnN1Ym1pc3Npb24udGl0bGUgPSByZXMuZGF0YS50aXRsZTtcbiAgICAgICAgJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tVUkwgPSByZXMuZGF0YS50cmFja1VSTDtcbiAgICAgICAgU0Mub0VtYmVkKCRzY29wZS5zdWJtaXNzaW9uLnRyYWNrVVJMLCB7XG4gICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUGxheWVyJyksXG4gICAgICAgICAgYXV0b19wbGF5OiBmYWxzZSxcbiAgICAgICAgICBtYXhoZWlnaHQ6IDE1MFxuICAgICAgICB9KVxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5ub3RGb3VuZCA9IGZhbHNlO1xuICAgICAgfSkudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tJRCA9IG51bGw7XG4gICAgICAgICRzY29wZS5ub3RGb3VuZCA9IHRydWU7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUuc3VibWl0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCEkc2NvcGUuc3VibWlzc2lvbi5lbWFpbCB8fCAhJHNjb3BlLnN1Ym1pc3Npb24ubmFtZSkge1xuICAgICAgYWxlcnQoXCJQbGVhc2UgZmlsbCBpbiBhbGwgZmllbGRzXCIpXG4gICAgfSBlbHNlIGlmICghJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tJRCkge1xuICAgICAgYWxlcnQoXCJUcmFjayBOb3QgRm91bmRcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICRodHRwLnBvc3QoJy9hcGkvc3VibWlzc2lvbnMnLCB7XG4gICAgICAgICAgZW1haWw6ICRzY29wZS5zdWJtaXNzaW9uLmVtYWlsLFxuICAgICAgICAgIHRyYWNrSUQ6ICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrSUQsXG4gICAgICAgICAgbmFtZTogJHNjb3BlLnN1Ym1pc3Npb24ubmFtZSxcbiAgICAgICAgICB0aXRsZTogJHNjb3BlLnN1Ym1pc3Npb24udGl0bGUsXG4gICAgICAgICAgdHJhY2tVUkw6ICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrVVJMLFxuICAgICAgICAgIGNoYW5uZWxJRFM6IFtdLFxuICAgICAgICAgIGludm9pY2VJRFM6IFtdXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIGNvbnNvbGUubG9nKHJlcy5kYXRhKTtcbiAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJZb3VyIHNvbmcgaGFzIGJlZW4gc3VibWl0dGVkIGFuZCB3aWxsIGJlIHJldmlld2VkIHNvb24uXCIpO1xuICAgICAgICAgIGxvY2F0aW9uLnJlbG9hZCgpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgIHdpbmRvdy5hbGVydChcIkVycm9yOiBDb3VsZCBub3Qgc3VibWl0IHNvbmcuXCIpO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH1cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAuc3RhdGUoJ1NDUmVzb2x2ZScsIHtcbiAgICAgICAgICAgIHVybDogJy9zY3Jlc29sdmUnLFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hcnRpc3RUb29scy9TQ1Jlc29sdmUvU0NSZXNvbHZlLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ1NDUmVzb2x2ZUNvbnRyb2xsZXInXG4gICAgICAgIH0pXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ1NDUmVzb2x2ZUNvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRodHRwKSB7XG4gICAgJHNjb3BlLnJlc3BvbnNlID0ge307XG4gICAgJHNjb3BlLnJlc29sdmUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgJGh0dHAucG9zdCgnL2FwaS9zb3VuZGNsb3VkL3Jlc29sdmUnLCB7XG4gICAgICAgICAgICAgICAgdXJsOiAkc2NvcGUudXJsXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnJlc3BvbnNlID0gSlNPTi5zdHJpbmdpZnkocmVzLmRhdGEsIG51bGwsIFwiXFx0XCIpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCRzY29wZS5yZXNwb25zZSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnJlc3BvbnNlID0gSlNPTi5zdHJpbmdpZnkoZXJyLCBudWxsLCBcIlxcdFwiKTtcbiAgICAgICAgICAgIH0pXG4gICAgfVxufSk7IiwiYXBwLmZhY3RvcnkoJ0F1dGhTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKXtcblx0XG5cdGZ1bmN0aW9uIGxvZ2luKGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9sb2dpbicsIGRhdGEpO1xuXHR9XG5cblx0ZnVuY3Rpb24gc2lnbnVwKGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9zaWdudXAnLCBkYXRhKTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0bG9naW46IGxvZ2luLFxuXHRcdHNpZ251cDogc2lnbnVwXG5cdH07XG59XSk7XG4iLCJcblxuYXBwLmZhY3RvcnkoJ1Nlc3Npb25TZXJ2aWNlJywgWyckY29va2llcycsIGZ1bmN0aW9uKCRjb29raWVzKSB7XG5cdFxuXHRmdW5jdGlvbiBjcmVhdGUoZGF0YSkge1xuXHRcdCRjb29raWVzLnB1dE9iamVjdCgndXNlcicsIGRhdGEpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZGVsZXRlVXNlcigpIHtcblx0XHQkY29va2llcy5yZW1vdmUoJ3VzZXInKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGdldFVzZXIoKSB7XG5cdFx0cmV0dXJuICRjb29raWVzLmdldCgndXNlcicpO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRjcmVhdGU6IGNyZWF0ZSxcblx0XHRkZWxldGVVc2VyOiBkZWxldGVVc2VyLFxuXHRcdGdldFVzZXI6IGdldFVzZXJcblx0fTtcbn1dKTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgIHBhcmFtczoge1xuICAgICAgICBzdWJtaXNzaW9uOiBudWxsXG4gICAgICB9LFxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hdXRoL3ZpZXdzL2xvZ2luLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0F1dGhDb250cm9sbGVyJ1xuICAgIH0pXG4gICAgLnN0YXRlKCdzaWdudXAnLCB7XG4gICAgICB1cmw6ICcvc2lnbnVwJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvYXV0aC92aWV3cy9zaWdudXAuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQXV0aENvbnRyb2xsZXInXG4gICAgfSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0F1dGhDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsICRzY29wZSwgJGh0dHAsICR1aWJNb2RhbCwgJHdpbmRvdywgQXV0aFNlcnZpY2UsIFNlc3Npb25TZXJ2aWNlLCBzb2NrZXQpIHtcbiAgJHNjb3BlLmxvZ2luT2JqID0ge307XG4gICRzY29wZS5tZXNzYWdlID0ge1xuICAgIHZhbDogJycsXG4gICAgdmlzaWJsZTogZmFsc2VcbiAgfTtcbiAgJHNjb3BlLm9wZW5Nb2RhbCA9IHtcbiAgICBzaWdudXBDb25maXJtOiBmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5tb2RhbEluc3RhbmNlID0gJHVpYk1vZGFsLm9wZW4oe1xuICAgICAgICBhbmltYXRpb246IHRydWUsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnc2lnbnVwQ29tcGxldGUuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ29udHJvbGxlcicsXG4gICAgICAgIHNjb3BlOiAkc2NvcGVcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbiAgJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICB2YWw6ICcnLFxuICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICB9O1xuICAgIEF1dGhTZXJ2aWNlXG4gICAgICAubG9naW4oJHNjb3BlLmxvZ2luT2JqKVxuICAgICAgLnRoZW4oaGFuZGxlTG9naW5SZXNwb25zZSlcbiAgICAgIC5jYXRjaChoYW5kbGVMb2dpbkVycm9yKVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlTG9naW5SZXNwb25zZShyZXMpIHtcbiAgICAgIGlmIChyZXMuc3RhdHVzID09PSAyMDAgJiYgcmVzLmRhdGEuc3VjY2Vzcykge1xuICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUocmVzLmRhdGEudXNlcik7XG4gICAgICAgICRzdGF0ZS5nbygnYXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlMaXN0Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgICAgICB2YWw6IHJlcy5kYXRhLm1lc3NhZ2UsXG4gICAgICAgICAgdmlzaWJsZTogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZUxvZ2luRXJyb3IocmVzKSB7XG4gICAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgICAgdmFsOiAnRXJyb3IgaW4gcHJvY2Vzc2luZyB5b3VyIHJlcXVlc3QnLFxuICAgICAgICB2aXNpYmxlOiB0cnVlXG4gICAgICB9O1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuY2hlY2tJZlN1Ym1pc3Npb24gPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHN0YXRlUGFyYW1zLnN1Ym1pc3Npb24pIHtcbiAgICAgICRzY29wZS5zb3VuZGNsb3VkTG9naW4oKTtcbiAgICB9XG4gIH1cblxuXG4gICRzY29wZS5zaWdudXAgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgIHZhbDogJycsXG4gICAgICB2aXNpYmxlOiBmYWxzZVxuICAgIH07XG4gICAgaWYgKCRzY29wZS5zaWdudXBPYmoucGFzc3dvcmQgIT0gJHNjb3BlLnNpZ251cE9iai5jb25maXJtUGFzc3dvcmQpIHtcbiAgICAgICRzY29wZS5tZXNzYWdlID0ge1xuICAgICAgICB2YWw6ICdQYXNzd29yZCBkb2VzblxcJ3QgbWF0Y2ggd2l0aCBjb25maXJtIHBhc3N3b3JkJyxcbiAgICAgICAgdmlzaWJsZTogdHJ1ZVxuICAgICAgfTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgQXV0aFNlcnZpY2VcbiAgICAgIC5zaWdudXAoJHNjb3BlLnNpZ251cE9iailcbiAgICAgIC50aGVuKGhhbmRsZVNpZ251cFJlc3BvbnNlKVxuICAgICAgLmNhdGNoKGhhbmRsZVNpZ251cEVycm9yKVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlU2lnbnVwUmVzcG9uc2UocmVzKSB7XG4gICAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlU2lnbnVwRXJyb3IocmVzKSB7fVxuICB9O1xuXG4gICRzY29wZS5zb3VuZGNsb3VkTG9naW4gPSBmdW5jdGlvbigpIHtcbiAgICBTQy5jb25uZWN0KClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkcm9vdFNjb3BlLmFjY2Vzc1Rva2VuID0gcmVzLm9hdXRoX3Rva2VuO1xuICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9sb2dpbi9zb3VuZENsb3VkTG9naW4nLCB7XG4gICAgICAgICAgdG9rZW46IHJlcy5vYXV0aF90b2tlbixcbiAgICAgICAgICBwYXNzd29yZDogJ3Rlc3QnXG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUocmVzLmRhdGEudXNlcik7XG4gICAgICAgIGlmICgkc3RhdGVQYXJhbXMuc3VibWlzc2lvbikge1xuICAgICAgICAgICRzdGF0ZS5nbygnYXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlOZXcnLCB7XG4gICAgICAgICAgICAnc3VibWlzc2lvbic6ICRzdGF0ZVBhcmFtcy5zdWJtaXNzaW9uXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgICRzdGF0ZS5nbygnYXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlMaXN0Jyk7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIGFsZXJ0KCdFcnJvcjogQ291bGQgbm90IGxvZyBpbicpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gIH07XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkb3dubG9hZEdhdGUnLCB7XG4gICAgdXJsOiAnL2FkbWluL2Rvd25sb2FkR2F0ZScsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9kb3dubG9hZFRyYWNrL3ZpZXdzL2FkbWluRExHYXRlLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdBZG1pbkRMR2F0ZUNvbnRyb2xsZXInXG4gIH0pO1xufSk7XG5cbmFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2Rvd25sb2FkR2F0ZUxpc3QnLCB7XG4gICAgdXJsOiAnL2FkbWluL2Rvd25sb2FkR2F0ZS9saXN0JyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2Rvd25sb2FkVHJhY2svdmlld3MvYWRtaW5ETEdhdGUubGlzdC5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnQWRtaW5ETEdhdGVDb250cm9sbGVyJ1xuICB9KTtcbn0pO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkb3dubG9hZEdhdGVFZGl0Jywge1xuICAgIHVybDogJy9hZG1pbi9kb3dubG9hZEdhdGUvZWRpdC86Z2F0ZXdheUlEJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2Rvd25sb2FkVHJhY2svdmlld3MvYWRtaW5ETEdhdGUuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0FkbWluRExHYXRlQ29udHJvbGxlcidcbiAgfSk7XG59KTtcblxuXG5hcHAuY29udHJvbGxlcignQWRtaW5ETEdhdGVDb250cm9sbGVyJywgWyckcm9vdFNjb3BlJyxcbiAgJyRzdGF0ZScsXG4gICckc3RhdGVQYXJhbXMnLFxuICAnJHNjb3BlJyxcbiAgJyRodHRwJyxcbiAgJyRsb2NhdGlvbicsXG4gICckd2luZG93JyxcbiAgJyR1aWJNb2RhbCcsXG4gICdTZXNzaW9uU2VydmljZScsXG4gICdBZG1pbkRMR2F0ZVNlcnZpY2UnLFxuICBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzdGF0ZVBhcmFtcywgJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uLCAkd2luZG93LCAkdWliTW9kYWwsIFNlc3Npb25TZXJ2aWNlLCBBZG1pbkRMR2F0ZVNlcnZpY2UpIHtcbiAgICAvKiBJbml0IGJvb2xlYW4gdmFyaWFibGVzIGZvciBzaG93L2hpZGUgYW5kIG90aGVyIGZ1bmN0aW9uYWxpdGllcyAqL1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSBmYWxzZTtcbiAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgIHZhbDogJycsXG4gICAgICB2aXNpYmxlOiBmYWxzZVxuICAgIH07XG5cbiAgICAvKiBJbml0IERvd25sb2FkIEdhdGV3YXkgZm9ybSBkYXRhICovXG5cbiAgICAkc2NvcGUudHJhY2sgPSB7XG4gICAgICBhcnRpc3RVc2VybmFtZTogJ0xhIFRyb3BpY8OhbCcsXG4gICAgICB0cmFja1RpdGxlOiAnUGFudGVvbmUgLyBUcmF2ZWwnLFxuICAgICAgdHJhY2tBcnR3b3JrVVJMOiAnYXNzZXRzL2ltYWdlcy93aG8td2UtYXJlLnBuZycsXG4gICAgICBTTUxpbmtzOiBbXSxcbiAgICAgIGxpa2U6IGZhbHNlLFxuICAgICAgY29tbWVudDogZmFsc2UsXG4gICAgICByZXBvc3Q6IGZhbHNlLFxuICAgICAgYXJ0aXN0czogW3tcbiAgICAgICAgdXJsOiAnJyxcbiAgICAgICAgYXZhdGFyOiAnYXNzZXRzL2ltYWdlcy93aG8td2UtYXJlLnBuZycsXG4gICAgICAgIHVzZXJuYW1lOiAnJyxcbiAgICAgICAgaWQ6IC0xLFxuICAgICAgICBwZXJtYW5lbnRMaW5rOiBmYWxzZVxuICAgICAgfV0sXG4gICAgICBwbGF5bGlzdHM6IFt7XG4gICAgICAgIHVybDogJycsXG4gICAgICAgIGF2YXRhcjogJycsXG4gICAgICAgIHRpdGxlOiAnJyxcbiAgICAgICAgaWQ6ICcnXG4gICAgICB9XVxuICAgIH07XG5cbiAgICAvKiBJbml0IGRvd25sb2FkR2F0ZXdheSBsaXN0ICovXG5cbiAgICAkc2NvcGUuZG93bmxvYWRHYXRld2F5TGlzdCA9IFtdO1xuXG4gICAgLyogSW5pdCBtb2RhbCBpbnN0YW5jZSB2YXJpYWJsZXMgYW5kIG1ldGhvZHMgKi9cblxuICAgICRzY29wZS5tb2RhbEluc3RhbmNlID0ge307XG4gICAgJHNjb3BlLm1vZGFsID0ge307XG4gICAgJHNjb3BlLm9wZW5Nb2RhbCA9IHtcbiAgICAgIGRvd25sb2FkVVJMOiBmdW5jdGlvbihkb3dubG9hZFVSTCkge1xuICAgICAgICAkc2NvcGUubW9kYWwuZG93bmxvYWRVUkwgPSBkb3dubG9hZFVSTDtcbiAgICAgICAgJHNjb3BlLm1vZGFsSW5zdGFuY2UgPSAkdWliTW9kYWwub3Blbih7XG4gICAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiAnZG93bmxvYWRVUkwuaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0FydGlzdFRvb2xzQ29udHJvbGxlcicsXG4gICAgICAgICAgc2NvcGU6ICRzY29wZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICAgICRzY29wZS5jbG9zZU1vZGFsID0gZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUubW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xuICAgIH1cblxuICAgIC8qIEluaXQgcHJvZmlsZSAqL1xuICAgICRzY29wZS5wcm9maWxlID0ge307XG5cbiAgICAvKiBNZXRob2QgZm9yIHJlc2V0dGluZyBEb3dubG9hZCBHYXRld2F5IGZvcm0gKi9cblxuICAgIGZ1bmN0aW9uIHJlc2V0RG93bmxvYWRHYXRld2F5KCkge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gZmFsc2U7XG4gICAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgICAgdmFsOiAnJyxcbiAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgIH07XG5cbiAgICAgICRzY29wZS50cmFjayA9IHtcbiAgICAgICAgYXJ0aXN0VXNlcm5hbWU6ICdMYSBUcm9waWPDoWwnLFxuICAgICAgICB0cmFja1RpdGxlOiAnUGFudGVvbmUgLyBUcmF2ZWwnLFxuICAgICAgICB0cmFja0FydHdvcmtVUkw6ICdhc3NldHMvaW1hZ2VzL3doby13ZS1hcmUucG5nJyxcbiAgICAgICAgU01MaW5rczogW10sXG4gICAgICAgIGxpa2U6IGZhbHNlLFxuICAgICAgICBjb21tZW50OiBmYWxzZSxcbiAgICAgICAgcmVwb3N0OiBmYWxzZSxcbiAgICAgICAgYXJ0aXN0czogW3tcbiAgICAgICAgICB1cmw6ICcnLFxuICAgICAgICAgIGF2YXRhcjogJ2Fzc2V0cy9pbWFnZXMvd2hvLXdlLWFyZS5wbmcnLFxuICAgICAgICAgIHVzZXJuYW1lOiAnJyxcbiAgICAgICAgICBpZDogLTEsXG4gICAgICAgICAgcGVybWFuZW50TGluazogZmFsc2VcbiAgICAgICAgfV0sXG4gICAgICAgIHBsYXlsaXN0czogW3tcbiAgICAgICAgICB1cmw6ICcnLFxuICAgICAgICAgIGF2YXRhcjogJycsXG4gICAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICAgIGlkOiAnJ1xuICAgICAgICB9XVxuICAgICAgfTtcbiAgICAgIGFuZ3VsYXIuZWxlbWVudChcImlucHV0W3R5cGU9J2ZpbGUnXVwiKS52YWwobnVsbCk7XG4gICAgfVxuXG4gICAgLyogQ2hlY2sgaWYgc3RhdGVQYXJhbXMgaGFzIGdhdGV3YXlJRCB0byBpbml0aWF0ZSBlZGl0ICovXG4gICAgJHNjb3BlLmNoZWNrSWZFZGl0ID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoJHN0YXRlUGFyYW1zLmdhdGV3YXlJRCkge1xuICAgICAgICAkc2NvcGUuZ2V0RG93bmxvYWRHYXRld2F5KCRzdGF0ZVBhcmFtcy5nYXRld2F5SUQpO1xuICAgICAgICAvLyBpZighJHN0YXRlUGFyYW1zLmRvd25sb2FkR2F0ZXdheSkge1xuICAgICAgICAvLyAgICRzY29wZS5nZXREb3dubG9hZEdhdGV3YXkoJHN0YXRlUGFyYW1zLmdhdGV3YXlJRCk7XG4gICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgIC8vICAgJHNjb3BlLnRyYWNrID0gJHN0YXRlUGFyYW1zLmRvd25sb2FkR2F0ZXdheTtcbiAgICAgICAgLy8gfVxuICAgICAgfVxuICAgIH1cblxuICAgICRzY29wZS50cmFja1VSTENoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCRzY29wZS50cmFjay50cmFja1VSTCAhPT0gJycpIHtcbiAgICAgICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSBmYWxzZTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgICBBZG1pbkRMR2F0ZVNlcnZpY2VcbiAgICAgICAgICAucmVzb2x2ZURhdGEoe1xuICAgICAgICAgICAgdXJsOiAkc2NvcGUudHJhY2sudHJhY2tVUkxcbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKGhhbmRsZVRyYWNrRGF0YUFuZEdldFByb2ZpbGVzKVxuICAgICAgICAgIC50aGVuKGhhbmRsZVdlYlByb2ZpbGVzKVxuICAgICAgICAgIC5jYXRjaChoYW5kbGVFcnJvcik7XG5cbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlVHJhY2tEYXRhQW5kR2V0UHJvZmlsZXMocmVzKSB7XG4gICAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrVGl0bGUgPSByZXMuZGF0YS50aXRsZTtcbiAgICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tJRCA9IHJlcy5kYXRhLmlkO1xuICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RJRCA9IHJlcy5kYXRhLnVzZXIuaWQ7XG4gICAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrQXJ0d29ya1VSTCA9IHJlcy5kYXRhLmFydHdvcmtfdXJsID8gcmVzLmRhdGEuYXJ0d29ya191cmwucmVwbGFjZSgnbGFyZ2UuanBnJywgJ3Q1MDB4NTAwLmpwZycpIDogJyc7XG4gICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdEFydHdvcmtVUkwgPSByZXMuZGF0YS51c2VyLmF2YXRhcl91cmwgPyByZXMuZGF0YS51c2VyLmF2YXRhcl91cmwgOiAnJztcbiAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0VVJMID0gcmVzLmRhdGEudXNlci5wZXJtYWxpbmtfdXJsO1xuICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RVc2VybmFtZSA9IHJlcy5kYXRhLnVzZXIudXNlcm5hbWU7XG4gICAgICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MgPSBbXTtcbiAgICAgICAgICByZXR1cm4gU0MuZ2V0KCcvdXNlcnMvJyArICRzY29wZS50cmFjay5hcnRpc3RJRCArICcvd2ViLXByb2ZpbGVzJyk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVXZWJQcm9maWxlcyhwcm9maWxlcykge1xuICAgICAgICAgIHByb2ZpbGVzLmZvckVhY2goZnVuY3Rpb24ocHJvZikge1xuICAgICAgICAgICAgaWYgKFsndHdpdHRlcicsICd5b3V0dWJlJywgJ2ZhY2Vib29rJywgJ3Nwb3RpZnknLCAnc291bmRjbG91ZCcsICdpbnN0YWdyYW0nXS5pbmRleE9mKHByb2Yuc2VydmljZSkgIT0gLTEpIHtcbiAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MucHVzaCh7XG4gICAgICAgICAgICAgICAga2V5OiBwcm9mLnNlcnZpY2UsXG4gICAgICAgICAgICAgICAgdmFsdWU6IHByb2YudXJsXG4gICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gdHJ1ZTtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyKSB7XG4gICAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrSUQgPSBudWxsO1xuICAgICAgICAgIGFsZXJ0KCdTb25nIG5vdCBmb3VuZCBvciBmb3JiaWRkZW4nKTtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgICRzY29wZS5hcnRpc3RVUkxDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgdmFyIGFydGlzdCA9IHt9O1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgQWRtaW5ETEdhdGVTZXJ2aWNlXG4gICAgICAgIC5yZXNvbHZlRGF0YSh7XG4gICAgICAgICAgdXJsOiAkc2NvcGUudHJhY2suYXJ0aXN0c1tpbmRleF0udXJsXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RzW2luZGV4XS5hdmF0YXIgPSByZXMuZGF0YS5hdmF0YXJfdXJsO1xuICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RzW2luZGV4XS51c2VybmFtZSA9IHJlcy5kYXRhLnVzZXJuYW1lO1xuICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RzW2luZGV4XS5pZCA9IHJlcy5kYXRhLmlkO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICBhbGVydCgnQXJ0aXN0cyBub3QgZm91bmQnKTtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmFkZFBsYXlsaXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUudHJhY2sucGxheWxpc3RzLnB1c2goe1xuICAgICAgICB1cmw6ICcnLFxuICAgICAgICBhdmF0YXI6ICcnLFxuICAgICAgICB0aXRsZTogJycsXG4gICAgICAgIGlkOiAnJ1xuICAgICAgfSk7XG4gICAgfVxuICAgICRzY29wZS5yZW1vdmVQbGF5bGlzdCA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAkc2NvcGUudHJhY2sucGxheWxpc3RzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuICAgICRzY29wZS5wbGF5bGlzdFVSTENoYW5nZSA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICBBZG1pbkRMR2F0ZVNlcnZpY2VcbiAgICAgICAgLnJlc29sdmVEYXRhKHtcbiAgICAgICAgICB1cmw6ICRzY29wZS50cmFjay5wbGF5bGlzdHNbaW5kZXhdLnVybFxuICAgICAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAkc2NvcGUudHJhY2sucGxheWxpc3RzW2luZGV4XS5hdmF0YXIgPSByZXMuZGF0YS5hcnR3b3JrX3VybDtcbiAgICAgICAgICAkc2NvcGUudHJhY2sucGxheWxpc3RzW2luZGV4XS50aXRsZSA9IHJlcy5kYXRhLnRpdGxlO1xuICAgICAgICAgICRzY29wZS50cmFjay5wbGF5bGlzdHNbaW5kZXhdLmlkID0gcmVzLmRhdGEuaWQ7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgYWxlcnQoJ1BsYXlsaXN0IG5vdCBmb3VuZCcpO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH0pXG4gICAgfVxuXG5cbiAgICAkc2NvcGUucmVtb3ZlQXJ0aXN0ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICRzY29wZS50cmFjay5hcnRpc3RzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuXG4gICAgJHNjb3BlLmFkZEFydGlzdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCRzY29wZS50cmFjay5hcnRpc3RzLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUudHJhY2suYXJ0aXN0cy5wdXNoKHtcbiAgICAgICAgdXJsOiAnJyxcbiAgICAgICAgYXZhdGFyOiAnYXNzZXRzL2ltYWdlcy93aG8td2UtYXJlLnBuZycsXG4gICAgICAgIHVzZXJuYW1lOiAnJyxcbiAgICAgICAgaWQ6IC0xXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAkc2NvcGUuYWRkU01MaW5rID0gZnVuY3Rpb24oKSB7XG4gICAgICAvLyBleHRlcm5hbFNNTGlua3MrKztcbiAgICAgIC8vICRzY29wZS50cmFjay5TTUxpbmtzWydrZXknICsgZXh0ZXJuYWxTTUxpbmtzXSA9ICcnO1xuICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MucHVzaCh7XG4gICAgICAgIGtleTogJycsXG4gICAgICAgIHZhbHVlOiAnJ1xuICAgICAgfSk7XG4gICAgfTtcbiAgICAkc2NvcGUucmVtb3ZlU01MaW5rID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICRzY29wZS50cmFjay5TTUxpbmtzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfTtcbiAgICAkc2NvcGUuU01MaW5rQ2hhbmdlID0gZnVuY3Rpb24oaW5kZXgpIHtcblxuICAgICAgZnVuY3Rpb24gZ2V0TG9jYXRpb24oaHJlZikge1xuICAgICAgICB2YXIgbG9jYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICAgICAgbG9jYXRpb24uaHJlZiA9IGhyZWY7XG4gICAgICAgIGlmIChsb2NhdGlvbi5ob3N0ID09IFwiXCIpIHtcbiAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gbG9jYXRpb24uaHJlZjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbG9jYXRpb247XG4gICAgICB9XG5cbiAgICAgIHZhciBsb2NhdGlvbiA9IGdldExvY2F0aW9uKCRzY29wZS50cmFjay5TTUxpbmtzW2luZGV4XS52YWx1ZSk7XG4gICAgICB2YXIgaG9zdCA9IGxvY2F0aW9uLmhvc3RuYW1lLnNwbGl0KCcuJylbMF07XG4gICAgICB2YXIgZmluZExpbmsgPSAkc2NvcGUudHJhY2suU01MaW5rcy5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICByZXR1cm4gaXRlbS5rZXkgPT09IGhvc3Q7XG4gICAgICB9KTtcbiAgICAgIGlmIChmaW5kTGluay5sZW5ndGggPiAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgICRzY29wZS50cmFjay5TTUxpbmtzW2luZGV4XS5rZXkgPSBob3N0O1xuICAgIH07XG5cbiAgICAkc2NvcGUuc2F2ZURvd25sb2FkR2F0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCEkc2NvcGUudHJhY2sudHJhY2tJRCkge1xuICAgICAgICBhbGVydCgnVHJhY2sgTm90IEZvdW5kJyk7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgIHZhciBzZW5kT2JqID0gbmV3IEZvcm1EYXRhKCk7XG5cbiAgICAgIC8qIEFwcGVuZCBkYXRhIHRvIHNlbmRPYmogc3RhcnQgKi9cblxuICAgICAgLyogVHJhY2sgKi9cbiAgICAgIGZvciAodmFyIHByb3AgaW4gJHNjb3BlLnRyYWNrKSB7XG4gICAgICAgIHNlbmRPYmouYXBwZW5kKHByb3AsICRzY29wZS50cmFja1twcm9wXSk7XG4gICAgICB9XG5cbiAgICAgIC8qIGFydGlzdHMgKi9cblxuICAgICAgdmFyIGFydGlzdHMgPSAkc2NvcGUudHJhY2suYXJ0aXN0cy5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICByZXR1cm4gaXRlbS5pZCAhPT0gLTE7XG4gICAgICB9KS5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBkZWxldGUgaXRlbVsnJCRoYXNoS2V5J107XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgfSk7XG4gICAgICBzZW5kT2JqLmFwcGVuZCgnYXJ0aXN0cycsIEpTT04uc3RyaW5naWZ5KGFydGlzdHMpKTtcblxuICAgICAgLyogcGxheWxpc3RzICovXG5cbiAgICAgIHZhciBwbGF5bGlzdHMgPSAkc2NvcGUudHJhY2sucGxheWxpc3RzLmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHJldHVybiBpdGVtLmlkICE9PSAtMTtcbiAgICAgIH0pLm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIGRlbGV0ZSBpdGVtWyckJGhhc2hLZXknXTtcbiAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICB9KTtcbiAgICAgIHNlbmRPYmouYXBwZW5kKCdwbGF5bGlzdHMnLCBKU09OLnN0cmluZ2lmeShwbGF5bGlzdHMpKTtcblxuICAgICAgLyogU01MaW5rcyAqL1xuXG4gICAgICB2YXIgU01MaW5rcyA9IHt9O1xuICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIFNNTGlua3NbaXRlbS5rZXldID0gaXRlbS52YWx1ZTtcbiAgICAgIH0pO1xuICAgICAgc2VuZE9iai5hcHBlbmQoJ1NNTGlua3MnLCBKU09OLnN0cmluZ2lmeShTTUxpbmtzKSk7XG5cbiAgICAgIC8qIEFwcGVuZCBkYXRhIHRvIHNlbmRPYmogZW5kICovXG5cbiAgICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgdXJsOiAnL2FwaS9kYXRhYmFzZS9kb3dubG9hZHVybCcsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogdW5kZWZpbmVkXG4gICAgICAgIH0sXG4gICAgICAgIHRyYW5zZm9ybVJlcXVlc3Q6IGFuZ3VsYXIuaWRlbnRpdHksXG4gICAgICAgIGRhdGE6IHNlbmRPYmpcbiAgICAgIH07XG4gICAgICAkaHR0cChvcHRpb25zKVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgIGlmICgkc2NvcGUudHJhY2suX2lkKSB7XG4gICAgICAgICAgICAvLyAkc2NvcGUub3Blbk1vZGFsLmRvd25sb2FkVVJMKHJlcy5kYXRhLnRyYWNrVVJMKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmVzZXREb3dubG9hZEdhdGV3YXkoKTtcbiAgICAgICAgICAkc2NvcGUub3Blbk1vZGFsLmRvd25sb2FkVVJMKHJlcy5kYXRhKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICBhbGVydChcIkVSUk9SOiBFcnJvciBpbiBzYXZpbmcgdXJsXCIpO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAkaHR0cC5wb3N0KCcvYXBpL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgIFNlc3Npb25TZXJ2aWNlLmRlbGV0ZVVzZXIoKTtcbiAgICAgICAgJHN0YXRlLmdvKCdob21lJyk7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnNob3dQcm9maWxlSW5mbyA9IGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLnByb2ZpbGUgPSBKU09OLnBhcnNlKFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKSk7XG4gICAgfVxuXG4gICAgJHNjb3BlLmdldERvd25sb2FkTGlzdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgQWRtaW5ETEdhdGVTZXJ2aWNlXG4gICAgICAgIC5nZXREb3dubG9hZExpc3QoKVxuICAgICAgICAudGhlbihoYW5kbGVSZXNwb25zZSlcbiAgICAgICAgLmNhdGNoKGhhbmRsZUVycm9yKTtcblxuICAgICAgZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UocmVzKSB7XG4gICAgICAgICRzY29wZS5kb3dubG9hZEdhdGV3YXlMaXN0ID0gcmVzLmRhdGE7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKHJlcykge1xuXG4gICAgICB9XG4gICAgfVxuXG4gICAgLyogTWV0aG9kIGZvciBnZXR0aW5nIERvd25sb2FkR2F0ZXdheSBpbiBjYXNlIG9mIGVkaXQgKi9cblxuICAgICRzY29wZS5nZXREb3dubG9hZEdhdGV3YXkgPSBmdW5jdGlvbihkb3dubG9hZEdhdGVXYXlJRCkge1xuICAgICAgLy8gcmVzZXREb3dubG9hZEdhdGV3YXkoKTtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgIEFkbWluRExHYXRlU2VydmljZVxuICAgICAgICAuZ2V0RG93bmxvYWRHYXRld2F5KHtcbiAgICAgICAgICBpZDogZG93bmxvYWRHYXRlV2F5SURcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oaGFuZGxlUmVzcG9uc2UpXG4gICAgICAgIC5jYXRjaChoYW5kbGVFcnJvcik7XG5cbiAgICAgIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlcykge1xuXG4gICAgICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gdHJ1ZTtcbiAgICAgICAgJHNjb3BlLnRyYWNrID0gcmVzLmRhdGE7XG5cbiAgICAgICAgdmFyIFNNTGlua3MgPSByZXMuZGF0YS5TTUxpbmtzID8gcmVzLmRhdGEuU01MaW5rcyA6IHt9O1xuICAgICAgICB2YXIgU01MaW5rc0FycmF5ID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgbGluayBpbiBTTUxpbmtzKSB7XG4gICAgICAgICAgU01MaW5rc0FycmF5LnB1c2goe1xuICAgICAgICAgICAga2V5OiBsaW5rLFxuICAgICAgICAgICAgdmFsdWU6IFNNTGlua3NbbGlua11cbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICAkc2NvcGUudHJhY2suU01MaW5rcyA9IFNNTGlua3NBcnJheTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gaGFuZGxlRXJyb3IocmVzKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9XG4gICAgfTtcblxuICAgICRzY29wZS5kZWxldGVEb3dubG9hZEdhdGV3YXkgPSBmdW5jdGlvbihpbmRleCkge1xuXG4gICAgICBpZiAoY29uZmlybShcIkRvIHlvdSByZWFsbHkgd2FudCB0byBkZWxldGUgdGhpcyB0cmFjaz9cIikpIHtcbiAgICAgIHZhciBkb3dubG9hZEdhdGVXYXlJRCA9ICRzY29wZS5kb3dubG9hZEdhdGV3YXlMaXN0W2luZGV4XS5faWQ7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICAgQWRtaW5ETEdhdGVTZXJ2aWNlXG4gICAgICAgICAgLmRlbGV0ZURvd25sb2FkR2F0ZXdheSh7XG4gICAgICAgICAgICBpZDogZG93bmxvYWRHYXRlV2F5SURcbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKGhhbmRsZVJlc3BvbnNlKVxuICAgICAgICAgIC5jYXRjaChoYW5kbGVFcnJvcik7XG5cbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UocmVzKSB7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAkc2NvcGUuZG93bmxvYWRHYXRld2F5TGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlRXJyb3IocmVzKSB7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlXG4gICAgICB9XG4gICAgfTtcbiAgfVxuXG5dKTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG5cdCRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkb3dubG9hZCcsIHtcblx0XHR1cmw6ICcvZG93bmxvYWQnLFxuXHRcdHRlbXBsYXRlVXJsOiAnanMvZG93bmxvYWRUcmFjay92aWV3cy9kb3dubG9hZFRyYWNrLnZpZXcuaHRtbCcsXG5cdFx0Y29udHJvbGxlcjogJ0Rvd25sb2FkVHJhY2tDb250cm9sbGVyJ1xuXHR9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignRG93bmxvYWRUcmFja0NvbnRyb2xsZXInLCBbJyRyb290U2NvcGUnLFxuXHQnJHN0YXRlJyxcblx0JyRzY29wZScsXG5cdCckaHR0cCcsXG5cdCckbG9jYXRpb24nLFxuXHQnJHdpbmRvdycsXG5cdCckcScsXG5cdCdEb3dubG9hZFRyYWNrU2VydmljZScsXG5cdGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uLCAkd2luZG93LCAkcSwgRG93bmxvYWRUcmFja1NlcnZpY2UpIHtcblxuXHRcdC8qIE5vcm1hbCBKUyB2YXJzIGFuZCBmdW5jdGlvbnMgbm90IGJvdW5kIHRvIHNjb3BlICovXG5cdFx0dmFyIHBsYXllck9iaiA9IG51bGw7XG5cblx0XHQvKiAkc2NvcGUgYmluZGluZ3Mgc3RhcnQgKi9cblxuXHRcdCRzY29wZS50cmFja0RhdGEgPSB7XG5cdFx0XHR0cmFja05hbWU6ICdNaXhpbmcgYW5kIE1hc3RlcmluZycsXG5cdFx0XHR1c2VyTmFtZTogJ2xhIHRyb3BpY2FsJ1xuXHRcdH07XG5cdFx0JHNjb3BlLnRvZ2dsZSA9IHRydWU7XG5cdFx0JHNjb3BlLnRvZ2dsZVBsYXkgPSBmdW5jdGlvbigpIHtcblx0XHRcdCRzY29wZS50b2dnbGUgPSAhJHNjb3BlLnRvZ2dsZTtcblx0XHRcdGlmICgkc2NvcGUudG9nZ2xlKSB7XG5cdFx0XHRcdHBsYXllck9iai5wYXVzZSgpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cGxheWVyT2JqLnBsYXkoKTtcblx0XHRcdH1cblx0XHR9XG5cdFx0JHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcblx0XHQkc2NvcGUuZW1iZWRUcmFjayA9IGZhbHNlO1xuXHRcdCRzY29wZS5kb3dubG9hZFVSTE5vdEZvdW5kID0gZmFsc2U7XG5cdFx0JHNjb3BlLmVycm9yVGV4dCA9ICcnO1xuXHRcdCRzY29wZS5mb2xsb3dCb3hJbWFnZVVybCA9ICdhc3NldHMvaW1hZ2VzL3doby13ZS1hcmUucG5nJztcblx0XHQkc2NvcGUucmVjZW50VHJhY2tzID0gW107XG5cblx0XHQvKiBEZWZhdWx0IHByb2Nlc3Npbmcgb24gcGFnZSBsb2FkICovXG5cblx0XHQkc2NvcGUuZ2V0RG93bmxvYWRUcmFjayA9IGZ1bmN0aW9uKCkge1xuXG5cdFx0XHQkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG5cdFx0XHR2YXIgdHJhY2tJRCA9ICRsb2NhdGlvbi5zZWFyY2goKS50cmFja2lkO1xuXHRcdFx0RG93bmxvYWRUcmFja1NlcnZpY2Vcblx0XHRcdFx0LmdldERvd25sb2FkVHJhY2sodHJhY2tJRClcblx0XHRcdFx0LnRoZW4ocmVjZWl2ZURvd25sb2FkVHJhY2spXG5cdFx0XHRcdC50aGVuKHJlY2VpdmVSZWNlbnRUcmFja3MpXG5cdFx0XHRcdC50aGVuKGluaXRQbGF5KVxuXHRcdFx0XHQuY2F0Y2goY2F0Y2hEb3dubG9hZFRyYWNrRXJyb3IpO1xuXG5cdFx0XHRmdW5jdGlvbiByZWNlaXZlRG93bmxvYWRUcmFjayhyZXN1bHQpIHtcblx0XHRcdFx0JHNjb3BlLnRyYWNrID0gcmVzdWx0LmRhdGE7XG5cdFx0XHRcdGNvbnNvbGUubG9nKCRzY29wZS50cmFjayk7XG5cdFx0XHRcdCRzY29wZS5iYWNrZ3JvdW5kU3R5bGUgPSBmdW5jdGlvbigpIHtcblx0XHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdFx0J2JhY2tncm91bmQtaW1hZ2UnOiAndXJsKCcgKyAkc2NvcGUudHJhY2sudHJhY2tBcnR3b3JrVVJMICsgJyknLFxuXHRcdFx0XHRcdFx0J2JhY2tncm91bmQtcmVwZWF0JzogJ25vLXJlcGVhdCcsXG5cdFx0XHRcdFx0XHQnYmFja2dyb3VuZC1zaXplJzogJ2NvdmVyJ1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdCRzY29wZS5lbWJlZFRyYWNrID0gdHJ1ZTtcblx0XHRcdFx0JHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcblxuXHRcdFx0XHRpZiAoJHNjb3BlLnRyYWNrLnNob3dEb3dubG9hZFRyYWNrcyA9PT0gJ3VzZXInKSB7XG5cdFx0XHRcdFx0cmV0dXJuIERvd25sb2FkVHJhY2tTZXJ2aWNlLmdldFJlY2VudFRyYWNrcyh7XG5cdFx0XHRcdFx0XHR1c2VySUQ6ICRzY29wZS50cmFjay51c2VyaWQsXG5cdFx0XHRcdFx0XHR0cmFja0lEOiAkc2NvcGUudHJhY2suX2lkXG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0cmV0dXJuICRxLnJlc29sdmUoJ3Jlc29sdmUnKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiByZWNlaXZlUmVjZW50VHJhY2tzKHJlcykge1xuXHRcdFx0XHRpZiAoKHR5cGVvZiByZXMgPT09ICdvYmplY3QnKSAmJiByZXMuZGF0YSkge1xuXHRcdFx0XHRcdCRzY29wZS5yZWNlbnRUcmFja3MgPSByZXMuZGF0YTtcblx0XHRcdFx0fVxuXHRcdFx0XHRyZXR1cm4gU0Muc3RyZWFtKCcvdHJhY2tzLycgKyAkc2NvcGUudHJhY2sudHJhY2tJRCk7XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIGluaXRQbGF5KHBsYXllcikge1xuXHRcdFx0XHRwbGF5ZXJPYmogPSBwbGF5ZXI7XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIGNhdGNoRG93bmxvYWRUcmFja0Vycm9yKCkge1xuXHRcdFx0XHRhbGVydCgnU29uZyBOb3QgRm91bmQnKTtcblx0XHRcdFx0JHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcblx0XHRcdFx0JHNjb3BlLmVtYmVkVHJhY2sgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9O1xuXG5cblx0XHQvKiBPbiBjbGljayBkb3dubG9hZCB0cmFjayBidXR0b24gKi9cblxuXHRcdCRzY29wZS5kb3dubG9hZFRyYWNrID0gZnVuY3Rpb24oKSB7XG5cdFx0XHRpZiAoJHNjb3BlLnRyYWNrLmNvbW1lbnQgJiYgISRzY29wZS50cmFjay5jb21tZW50VGV4dCkge1xuXHRcdFx0XHRhbGVydCgnUGxlYXNlIHdyaXRlIGEgY29tbWVudCEnKTtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdFx0JHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuXHRcdFx0JHNjb3BlLmVycm9yVGV4dCA9ICcnO1xuXG5cdFx0XHRTQy5jb25uZWN0KClcblx0XHRcdFx0LnRoZW4ocGVyZm9ybVRhc2tzKVxuXHRcdFx0XHQudGhlbihpbml0RG93bmxvYWQpXG5cdFx0XHRcdC5jYXRjaChjYXRjaFRhc2tzRXJyb3IpXG5cblx0XHRcdGZ1bmN0aW9uIHBlcmZvcm1UYXNrcyhyZXMpIHtcblx0XHRcdFx0JHNjb3BlLnRyYWNrLnRva2VuID0gcmVzLm9hdXRoX3Rva2VuO1xuXHRcdFx0XHRyZXR1cm4gRG93bmxvYWRUcmFja1NlcnZpY2UucGVyZm9ybVRhc2tzKCRzY29wZS50cmFjayk7XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIGluaXREb3dubG9hZChyZXMpIHtcblx0XHRcdFx0JHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcblx0XHRcdFx0aWYgKCRzY29wZS50cmFjay5kb3dubG9hZFVSTCAmJiAkc2NvcGUudHJhY2suZG93bmxvYWRVUkwgIT09ICcnKSB7XG5cdFx0XHRcdFx0JHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJHNjb3BlLnRyYWNrLmRvd25sb2FkVVJMO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdCRzY29wZS5lcnJvclRleHQgPSAnRXJyb3IhIENvdWxkIG5vdCBmZXRjaCBkb3dubG9hZCBVUkwnO1xuXHRcdFx0XHRcdCRzY29wZS5kb3dubG9hZFVSTE5vdEZvdW5kID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0XHQkc2NvcGUuJGFwcGx5KCk7XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIGNhdGNoVGFza3NFcnJvcihlcnIpIHtcblx0XHRcdFx0YWxlcnQoJ0Vycm9yIGluIHByb2Nlc3NpbmcgeW91ciByZXF1ZXN0Jyk7XG5cdFx0XHRcdCRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG5cdFx0XHRcdCRzY29wZS4kYXBwbHkoKTtcblx0XHRcdH1cblxuXHRcdH07XG5cdH1cbl0pOyIsIlxuYXBwLnNlcnZpY2UoJ0FkbWluRExHYXRlU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbigkaHR0cCl7XG5cblx0ZnVuY3Rpb24gcmVzb2x2ZURhdGEoZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIGRhdGEpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0RG93bmxvYWRMaXN0KCkge1xuXHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZGF0YWJhc2UvZG93bmxvYWR1cmwvYWRtaW4nKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGdldERvd25sb2FkR2F0ZXdheShkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS9kYXRhYmFzZS9kb3dubG9hZHVybC8nICsgZGF0YS5pZCk7XG5cdH1cblxuXHRmdW5jdGlvbiBkZWxldGVEb3dubG9hZEdhdGV3YXkoZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL2Rvd25sb2FkdXJsL2RlbGV0ZScsIGRhdGEpO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRyZXNvbHZlRGF0YTogcmVzb2x2ZURhdGEsXG5cdFx0Z2V0RG93bmxvYWRMaXN0OiBnZXREb3dubG9hZExpc3QsXG5cdFx0Z2V0RG93bmxvYWRHYXRld2F5OiBnZXREb3dubG9hZEdhdGV3YXksXG5cdFx0ZGVsZXRlRG93bmxvYWRHYXRld2F5OiBkZWxldGVEb3dubG9hZEdhdGV3YXlcblx0fTtcbn1dKTtcbiIsImFwcC5zZXJ2aWNlKCdEb3dubG9hZFRyYWNrU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbigkaHR0cCl7XG5cdFxuXHRmdW5jdGlvbiBnZXREb3dubG9hZFRyYWNrKGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2Rvd25sb2FkL3RyYWNrP3RyYWNrSUQ9JyArIGRhdGEpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0VHJhY2tEYXRhKGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9zb3VuZGNsb3VkL3Jlc29sdmUnLCB7XG5cdFx0XHR1cmw6IGRhdGEudHJhY2tVUkxcblx0XHR9KTtcblx0fVxuXG5cdGZ1bmN0aW9uIHBlcmZvcm1UYXNrcyhkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJ2FwaS9kb3dubG9hZC90YXNrcycsIGRhdGEpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0UmVjZW50VHJhY2tzKGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2Rvd25sb2FkL3RyYWNrL3JlY2VudD91c2VySUQ9JyArIGRhdGEudXNlcklEICsgJyZ0cmFja0lEPScgKyBkYXRhLnRyYWNrSUQpO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRnZXREb3dubG9hZFRyYWNrOiBnZXREb3dubG9hZFRyYWNrLFxuXHRcdGdldFRyYWNrRGF0YTogZ2V0VHJhY2tEYXRhLFxuXHRcdHBlcmZvcm1UYXNrczogcGVyZm9ybVRhc2tzLFxuXHRcdGdldFJlY2VudFRyYWNrczogZ2V0UmVjZW50VHJhY2tzXG5cdH07XG59XSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhdXRvRW1haWxzTmV3Jywge1xuICAgIHVybDogJy9hZG1pbi9kYXRhYmFzZS9hdXRvRW1haWxzL25ldycsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9kYXRhYmFzZS9hdXRvRW1haWxzL2F1dG9FbWFpbHMuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0F1dG9FbWFpbHNDb250cm9sbGVyJ1xuICB9KTtcbn0pO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhdXRvRW1haWxzRWRpdCcsIHtcbiAgICB1cmw6ICcvYWRtaW4vZGF0YWJhc2UvYXV0b0VtYWlscy9lZGl0Lzp0ZW1wbGF0ZUlkJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2RhdGFiYXNlL2F1dG9FbWFpbHMvYXV0b0VtYWlscy5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnQXV0b0VtYWlsc0NvbnRyb2xsZXInLFxuICAgIC8vIHJlc29sdmU6IHtcbiAgICAvLyAgIHRlbXBsYXRlOiBmdW5jdGlvbigkaHR0cCkge1xuICAgIC8vICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2RhdGFiYXNlL2F1dG9FbWFpbHMvYml3ZWVrbHk/aXNBcnRpc3Q9dHJ1ZScpXG4gICAgLy8gICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgLy8gICAgICAgICB2YXIgdGVtcGxhdGUgPSByZXMuZGF0YTtcbiAgICAvLyAgICAgICAgIGlmICh0ZW1wbGF0ZSkge1xuICAgIC8vICAgICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgLy8gICAgICAgICB9IGVsc2Uge1xuICAgIC8vICAgICAgICAgICByZXR1cm4ge1xuICAgIC8vICAgICAgICAgICAgIHB1cnBvc2U6IFwiQml3ZWVrbHkgRW1haWxcIlxuICAgIC8vICAgICAgICAgICB9XG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgICAgfSlcbiAgICAvLyAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAvLyAgICAgICAgIGFsZXJ0KFwiRVJST1I6IFNvbWV0aGluZyB3ZW50IHdyb25nLlwiKTtcbiAgICAvLyAgICAgICB9KVxuICAgIC8vICAgfVxuICAgIC8vIH1cbiAgfSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0F1dG9FbWFpbHNDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCAkc3RhdGVQYXJhbXMsIEF1dGhTZXJ2aWNlKSB7XG4gICRzY29wZS5sb2dnZWRJbiA9IGZhbHNlO1xuXG5cbiAgJHNjb3BlLmlzU3RhdGVQYXJhbXMgPSBmYWxzZTtcbiAgaWYoJHN0YXRlUGFyYW1zLnRlbXBsYXRlSWQpIHtcbiAgICAkc2NvcGUuaXNTdGF0ZVBhcmFtcyA9IHRydWU7XG4gIH1cbiAgLy8gJHNjb3BlLnRlbXBsYXRlID0gdGVtcGxhdGU7XG5cbiAgJHNjb3BlLnRlbXBsYXRlID0ge1xuICAgIGlzQXJ0aXN0OiBmYWxzZVxuICB9O1xuXG4gICRzY29wZS5nZXRUZW1wbGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmKCRzdGF0ZVBhcmFtcy50ZW1wbGF0ZUlkKSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAkaHR0cC5nZXQoJy9hcGkvZGF0YWJhc2UvYXV0b0VtYWlscz90ZW1wbGF0ZUlkPScgKyAkc3RhdGVQYXJhbXMudGVtcGxhdGVJZClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdmFyIHRlbXBsYXRlID0gcmVzLmRhdGE7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICBpZiAodGVtcGxhdGUpIHtcbiAgICAgICAgICAgICRzY29wZS50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkc2NvcGUudGVtcGxhdGUgPSB7fTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgIGFsZXJ0KFwiRVJST1I6IFNvbWV0aGluZyB3ZW50IHdyb25nLlwiKTtcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH07XG5cbiAgLy8gY29uc29sZS5sb2codGVtcGxhdGUpO1xuICAkc2NvcGUuc2F2ZSA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL2F1dG9FbWFpbHMvJywgJHNjb3BlLnRlbXBsYXRlKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIGFsZXJ0KFwiU2F2ZWQgZW1haWwgdGVtcGxhdGUuXCIpXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGFsZXJ0KFwiRVJST1I6IE1lc3NhZ2UgY291bGQgbm90IHNhdmUuXCIpXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8vICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAvLyAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgLy8gICAkaHR0cC5wb3N0KCcvYXBpL2xvZ2luJywge1xuICAvLyAgICAgcGFzc3dvcmQ6ICRzY29wZS5wYXNzd29yZFxuICAvLyAgIH0pLnRoZW4oZnVuY3Rpb24oKSB7XG4gIC8vICAgICAkcm9vdFNjb3BlLnBhc3N3b3JkID0gJHNjb3BlLnBhc3N3b3JkO1xuICAvLyAgICAgJHNjb3BlLmxvZ2dlZEluID0gdHJ1ZTtcbiAgLy8gICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gIC8vICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gIC8vICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAvLyAgICAgYWxlcnQoJ1dyb25nIFBhc3N3b3JkJyk7XG4gIC8vICAgfSk7XG4gIC8vIH1cblxuICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgJGh0dHAuZ2V0KCcvYXBpL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4nO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIGFsZXJ0KCdXcm9uZyBQYXNzd29yZCcpO1xuICAgIH0pO1xuICB9XG5cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2F1dG9FbWFpbHNMaXN0Jywge1xuICAgIHVybDogJy9hZG1pbi9kYXRhYmFzZS9hdXRvRW1haWxzJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2RhdGFiYXNlL2F1dG9FbWFpbHMvYXV0b0VtYWlsc0xpc3QuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0F1dG9FbWFpbHNMaXN0Q29udHJvbGxlcicsXG4gICAgcmVzb2x2ZToge1xuICAgICAgdGVtcGxhdGVzOiBmdW5jdGlvbigkaHR0cCkge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2RhdGFiYXNlL2F1dG9FbWFpbHMnKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykgeyBcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IHJlcy5kYXRhO1xuICAgICAgICAgICAgaWYgKHRlbXBsYXRlKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcHVycG9zZTogXCJCaXdlZWtseSBFbWFpbFwiXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgYWxlcnQoXCJFUlJPUjogU29tZXRoaW5nIHdlbnQgd3JvbmcuXCIpO1xuICAgICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignQXV0b0VtYWlsc0xpc3RDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCBBdXRoU2VydmljZSwgdGVtcGxhdGVzKSB7XG4gICRzY29wZS5sb2dnZWRJbiA9IGZhbHNlO1xuICAkc2NvcGUudGVtcGxhdGVzID0gdGVtcGxhdGVzO1xuXG4gIC8vICRzY29wZS5nZXRUZW1wbGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgLy8gICAkaHR0cC5nZXQoJy9hcGkvZGF0YWJhc2UvYXV0b0VtYWlscy9iaXdlZWtseT9pc0FydGlzdD0nICsgU3RyaW5nKCRzY29wZS50ZW1wbGF0ZS5pc0FydGlzdCkpXG4gIC8vICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgLy8gICAgICAgdmFyIHRlbXBsYXRlID0gcmVzLmRhdGE7XG4gIC8vICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gIC8vICAgICAgIGlmICh0ZW1wbGF0ZSkge1xuICAvLyAgICAgICAgICRzY29wZS50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAvLyAgICAgICB9IGVsc2Uge1xuICAvLyAgICAgICAgICRzY29wZS50ZW1wbGF0ZSA9IHtcbiAgLy8gICAgICAgICAgIHB1cnBvc2U6IFwiQml3ZWVrbHkgRW1haWxcIixcbiAgLy8gICAgICAgICAgIGlzQXJ0aXN0OiBmYWxzZVxuICAvLyAgICAgICAgIH07XG4gIC8vICAgICAgIH1cbiAgLy8gICAgIH0pXG4gIC8vICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgLy8gICAgICAgYWxlcnQoXCJFUlJPUjogU29tZXRoaW5nIHdlbnQgd3JvbmcuXCIpO1xuICAvLyAgICAgfSk7XG4gIC8vIH07XG5cbiAgLy8gY29uc29sZS5sb2codGVtcGxhdGUpO1xuICAkc2NvcGUuc2F2ZSA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL2F1dG9FbWFpbHMnLCAkc2NvcGUudGVtcGxhdGUpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgYWxlcnQoXCJTYXZlZCBlbWFpbC5cIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGFsZXJ0KFwiRVJST1I6IE1lc3NhZ2UgY291bGQgbm90IHNhdmUuXCIpXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8vICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAvLyAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgLy8gICAkaHR0cC5wb3N0KCcvYXBpL2xvZ2luJywge1xuICAvLyAgICAgcGFzc3dvcmQ6ICRzY29wZS5wYXNzd29yZFxuICAvLyAgIH0pLnRoZW4oZnVuY3Rpb24oKSB7XG4gIC8vICAgICAkcm9vdFNjb3BlLnBhc3N3b3JkID0gJHNjb3BlLnBhc3N3b3JkO1xuICAvLyAgICAgJHNjb3BlLmxvZ2dlZEluID0gdHJ1ZTtcbiAgLy8gICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gIC8vICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gIC8vICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAvLyAgICAgYWxlcnQoJ1dyb25nIFBhc3N3b3JkJyk7XG4gIC8vICAgfSk7XG4gIC8vIH1cblxuICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgJGh0dHAuZ2V0KCcvYXBpL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4nO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIGFsZXJ0KCdXcm9uZyBQYXNzd29yZCcpO1xuICAgIH0pO1xuICB9XG5cbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgnYXJ0aXN0VG9vbHMnLCB7XG4gICAgICB1cmw6ICcvYXJ0aXN0LXRvb2xzJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS92aWV3cy9hcnRpc3RUb29scy9hcnRpc3RUb29scy5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdBcnRpc3RUb29sc0NvbnRyb2xsZXInLFxuICAgICAgYWJzdHJhY3Q6IHRydWUsXG4gICAgICByZXNvbHZlOiB7XG4gICAgICAgIGFsbG93ZWQ6IGZ1bmN0aW9uKCRxLCAkc3RhdGUsIFNlc3Npb25TZXJ2aWNlKSB7XG4gICAgICAgICAgdmFyIGRlZmVycmVkID0gJHEuZGVmZXIoKTtcbiAgICAgICAgICB2YXIgdXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcbiAgICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVzb2x2ZSgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkZWZlcnJlZC5yZWplY3QoKTtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9sb2dpbic7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FydGlzdFRvb2xzUHJvZmlsZScsIHtcbiAgICAgIHVybDogJy9wcm9maWxlJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS92aWV3cy9hcnRpc3RUb29scy9wcm9maWxlLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0FydGlzdFRvb2xzQ29udHJvbGxlcidcbiAgICB9KVxuICAgIC5zdGF0ZSgnYXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlMaXN0Jywge1xuICAgICAgdXJsOiAnL2Rvd25sb2FkLWdhdGV3YXknLFxuICAgICAgcGFyYW1zOiB7XG4gICAgICAgIHN1Ym1pc3Npb246IG51bGxcbiAgICAgIH0sXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvYXJ0aXN0VG9vbHMvZG93bmxvYWRHYXRld2F5Lmxpc3QuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQXJ0aXN0VG9vbHNDb250cm9sbGVyJ1xuICAgIH0pXG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignQXJ0aXN0VG9vbHNDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsICRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgJHdpbmRvdywgJHVpYk1vZGFsLCAkdGltZW91dCwgU2Vzc2lvblNlcnZpY2UsIEFydGlzdFRvb2xzU2VydmljZSkge1xuICAgICRzY29wZS51c2VyID0gSlNPTi5wYXJzZShTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkpO1xuXG4gICAgLyogSW5pdCBib29sZWFuIHZhcmlhYmxlcyBmb3Igc2hvdy9oaWRlIGFuZCBvdGhlciBmdW5jdGlvbmFsaXRpZXMgKi9cblxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSBmYWxzZTtcbiAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgIHZhbDogJycsXG4gICAgICB2aXNpYmxlOiBmYWxzZVxuICAgIH07XG5cbiAgICAvKiBJbml0IGRvd25sb2FkR2F0ZXdheSBsaXN0ICovXG5cbiAgICAkc2NvcGUuZG93bmxvYWRHYXRld2F5TGlzdCA9IFtdO1xuXG4gICAgLyogSW5pdCBtb2RhbCBpbnN0YW5jZSB2YXJpYWJsZXMgYW5kIG1ldGhvZHMgKi9cblxuICAgICRzY29wZS5tb2RhbEluc3RhbmNlID0ge307XG4gICAgJHNjb3BlLm1vZGFsID0ge307XG4gICAgJHNjb3BlLm9wZW5Nb2RhbCA9IHtcbiAgICAgIGRvd25sb2FkVVJMOiBmdW5jdGlvbihkb3dubG9hZFVSTCkge1xuICAgICAgICAkc2NvcGUubW9kYWwuZG93bmxvYWRVUkwgPSBkb3dubG9hZFVSTDtcbiAgICAgICAgJHNjb3BlLm1vZGFsSW5zdGFuY2UgPSAkdWliTW9kYWwub3Blbih7XG4gICAgICAgICAgYW5pbWF0aW9uOiB0cnVlLFxuICAgICAgICAgIHRlbXBsYXRlVXJsOiAnZG93bmxvYWRVUkwuaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ0FydGlzdFRvb2xzQ29udHJvbGxlcicsXG4gICAgICAgICAgc2NvcGU6ICRzY29wZVxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9O1xuICAgICRzY29wZS5jbG9zZU1vZGFsID0gZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUubW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xuICAgIH07XG5cbiAgICAkc2NvcGUuZWRpdFByb2ZpbGVNb2RhbEluc3RhbmNlID0ge307XG4gICAgJHNjb3BlLmVkaXRQcm9maWxlbW9kYWwgPSB7fTtcbiAgICAkc2NvcGUub3BlbkVkaXRQcm9maWxlTW9kYWwgPSB7XG4gICAgICBlZGl0UHJvZmlsZTogZnVuY3Rpb24oZmllbGQpIHtcbiAgICAgICAgJHNjb3BlLnByb2ZpbGUuZmllbGQgPSBmaWVsZDtcbiAgICAgICAgJHRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJHNjb3BlLmVkaXRQcm9maWxlTW9kYWxJbnN0YW5jZSA9ICR1aWJNb2RhbC5vcGVuKHtcbiAgICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnZWRpdFByb2ZpbGUuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQXJ0aXN0VG9vbHNDb250cm9sbGVyJyxcbiAgICAgICAgICAgIHNjb3BlOiAkc2NvcGVcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSwgMCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgICRzY29wZS5jbG9zZUVkaXRQcm9maWxlTW9kYWwgPSBmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5zaG93UHJvZmlsZUluZm8oKTtcbiAgICAgIGlmICgkc2NvcGUuZWRpdFByb2ZpbGVNb2RhbEluc3RhbmNlLmNsb3NlKSB7XG4gICAgICAgICRzY29wZS5lZGl0UHJvZmlsZU1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgJHNjb3BlLnRoYW5rWW91TW9kYWxJbnN0YW5jZSA9IHt9O1xuICAgICRzY29wZS50aGFua1lvdU1vZGFsID0ge307XG4gICAgJHNjb3BlLm9wZW5UaGFua1lvdU1vZGFsID0ge1xuICAgICAgdGhhbmtZb3U6IGZ1bmN0aW9uKHN1Ym1pc3Npb25JRCkge1xuICAgICAgICAkc2NvcGUudGhhbmtZb3VNb2RhbC5zdWJtaXNzaW9uSUQgPSBzdWJtaXNzaW9uSUQ7XG4gICAgICAgICRzY29wZS5tb2RhbEluc3RhbmNlID0gJHVpYk1vZGFsLm9wZW4oe1xuICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ3RoYW5rWW91Lmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdPcGVuVGhhbmtZb3VNb2RhbENvbnRyb2xsZXInLFxuICAgICAgICAgIHNjb3BlOiAkc2NvcGVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgICAkc2NvcGUuY2xvc2VUaGFua1lvdU1vZGFsID0gZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUudGhhbmtZb3VNb2RhbEluc3RhbmNlLmNsb3NlKCk7XG4gICAgfTtcbiAgICAvKiBJbml0IHByb2ZpbGUgKi9cbiAgICAkc2NvcGUucHJvZmlsZSA9IHt9O1xuXG4gICAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgJGh0dHAucG9zdCgnL2FwaS9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBTZXNzaW9uU2VydmljZS5kZWxldGVVc2VyKCk7XG4gICAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2xvZ2luJztcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICBjb25zb2xlLmxvZygkc3RhdGVQYXJhbXMuc3VibWlzc2lvbik7XG4gICAgaWYgKCRzdGF0ZVBhcmFtcy5zdWJtaXNzaW9uKSB7XG4gICAgICAkc2NvcGUub3BlblRoYW5rWW91TW9kYWwudGhhbmtZb3UoJHN0YXRlUGFyYW1zLnN1Ym1pc3Npb24uX2lkKTtcbiAgICB9XG5cblxuICAgICRzY29wZS5zaG93UHJvZmlsZUluZm8gPSBmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5wcm9maWxlLmRhdGEgPSBKU09OLnBhcnNlKFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKSk7XG4gICAgICBpZiAoKCRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3MgJiYgJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcy5sZW5ndGggPT09IDApIHx8ICEkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzKSB7XG4gICAgICAgICRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3MgPSBbe1xuICAgICAgICAgIHVybDogJycsXG4gICAgICAgICAgYXZhdGFyOiAnJyxcbiAgICAgICAgICB1c2VybmFtZTogJycsXG4gICAgICAgICAgaWQ6IC0xLFxuICAgICAgICAgIHBlcm1hbmVudExpbms6IHRydWVcbiAgICAgICAgfV07XG4gICAgICB9O1xuICAgICAgJHNjb3BlLnByb2ZpbGUuaXNBdmFpbGFibGUgPSB7fTtcbiAgICAgICRzY29wZS5wcm9maWxlLmlzQXZhaWxhYmxlLmVtYWlsID0gJHNjb3BlLnByb2ZpbGUuZGF0YS5lbWFpbCA/IHRydWUgOiBmYWxzZTtcbiAgICAgICRzY29wZS5wcm9maWxlLmlzQXZhaWxhYmxlLnBhc3N3b3JkID0gJHNjb3BlLnByb2ZpbGUuZGF0YS5wYXNzd29yZCA/IHRydWUgOiBmYWxzZTtcbiAgICAgICRzY29wZS5wcm9maWxlLmlzQXZhaWxhYmxlLnNvdW5kY2xvdWQgPSAkc2NvcGUucHJvZmlsZS5kYXRhLnNvdW5kY2xvdWQgPyB0cnVlIDogZmFsc2U7XG4gICAgICAkc2NvcGUucHJvZmlsZS5kYXRhLnBhc3N3b3JkID0gJyc7XG4gICAgfTtcblxuICAgICRzY29wZS5zYXZlUHJvZmlsZUluZm8gPSBmdW5jdGlvbigpIHtcblxuICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICAgIHZhbHVlOiAnJyxcbiAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgIH07XG5cbiAgICAgIHZhciBwZXJtYW5lbnRMaW5rcyA9ICRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3MuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGl0ZW0uaWQgIT09IC0xO1xuICAgICAgfSkubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgZGVsZXRlIGl0ZW1bJyQkaGFzaEtleSddO1xuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgc2VuZE9iaiA9IHtcbiAgICAgICAgbmFtZTogJycsXG4gICAgICAgIHBhc3N3b3JkOiAnJyxcbiAgICAgICAgcGVybWFuZW50TGlua3M6IEpTT04uc3RyaW5naWZ5KHBlcm1hbmVudExpbmtzKVxuICAgICAgfVxuICAgICAgaWYgKCRzY29wZS5wcm9maWxlLmZpZWxkID09PSAnbmFtZScpIHtcbiAgICAgICAgc2VuZE9iai5uYW1lID0gJHNjb3BlLnByb2ZpbGUuZGF0YS5uYW1lO1xuICAgICAgfSBlbHNlIGlmICgkc2NvcGUucHJvZmlsZS5maWVsZCA9PT0gJ3Bhc3N3b3JkJykge1xuICAgICAgICBzZW5kT2JqLnBhc3N3b3JkID0gJHNjb3BlLnByb2ZpbGUuZGF0YS5wYXNzd29yZDtcbiAgICAgIH0gZWxzZSBpZiAoJHNjb3BlLnByb2ZpbGUuZmllbGQgPT09ICdlbWFpbCcpIHtcbiAgICAgICAgc2VuZE9iai5lbWFpbCA9ICRzY29wZS5wcm9maWxlLmRhdGEuZW1haWw7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgIEFydGlzdFRvb2xzU2VydmljZVxuICAgICAgICAuc2F2ZVByb2ZpbGVJbmZvKHNlbmRPYmopXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgaWYgKHJlcy5kYXRhID09PSAnRW1haWwgRXJyb3InKSB7XG4gICAgICAgICAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgICAgICAgICAgdmFsdWU6ICdFbWFpbCBhbHJlYWR5IGV4aXN0cyEnLFxuICAgICAgICAgICAgICB2aXNpYmxlOiB0cnVlXG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUocmVzLmRhdGEpO1xuICAgICAgICAgICRzY29wZS5jbG9zZUVkaXRQcm9maWxlTW9kYWwoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgYWxlcnQoJ2Vycm9yIHNhdmluZycpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnJlbW92ZVBlcm1hbmVudExpbmsgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH07XG4gICAgJHNjb3BlLmhpZGVidXR0b24gPSBmYWxzZTtcbiAgICAkc2NvcGUuYWRkUGVybWFuZW50TGluayA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICBpZiAoJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcy5sZW5ndGggPj0gMiAmJiAhJHNjb3BlLnVzZXIuYWRtaW4pIHtcbiAgICAgICAgJHNjb3BlLmhpZGVidXR0b24gPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICBpZiAoJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcy5sZW5ndGggPiAyICYmICEkc2NvcGUudXNlci5hZG1pbikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3MucHVzaCh7XG4gICAgICAgIHVybDogJycsXG4gICAgICAgIGF2YXRhcjogJycsXG4gICAgICAgIHVzZXJuYW1lOiAnJyxcbiAgICAgICAgaWQ6IC0xLFxuICAgICAgICBwZXJtYW5lbnRMaW5rOiB0cnVlXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnBlcm1hbmVudExpbmtVUkxDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgdmFyIHBlcm1hbmVudExpbmsgPSB7fTtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgIEFydGlzdFRvb2xzU2VydmljZVxuICAgICAgICAucmVzb2x2ZURhdGEoe1xuICAgICAgICAgIHVybDogJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rc1tpbmRleF0udXJsXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3NbaW5kZXhdLmF2YXRhciA9IHJlcy5kYXRhLmF2YXRhcl91cmwgPyByZXMuZGF0YS5hdmF0YXJfdXJsIDogJyc7XG4gICAgICAgICAgJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rc1tpbmRleF0udXNlcm5hbWUgPSByZXMuZGF0YS5wZXJtYWxpbms7XG4gICAgICAgICAgJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rc1tpbmRleF0uaWQgPSByZXMuZGF0YS5pZDtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgYWxlcnQoJ0FydGlzdHMgbm90IGZvdW5kJyk7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgICRzY29wZS5zYXZlU291bmRDbG91ZEFjY291bnRJbmZvID0gZnVuY3Rpb24oKSB7XG4gICAgICBTQy5jb25uZWN0KClcbiAgICAgICAgLnRoZW4oc2F2ZUluZm8pXG4gICAgICAgIC50aGVuKGhhbmRsZVJlc3BvbnNlKVxuICAgICAgICAuY2F0Y2goaGFuZGxlRXJyb3IpO1xuXG4gICAgICBmdW5jdGlvbiBzYXZlSW5mbyhyZXMpIHtcbiAgICAgICAgcmV0dXJuIEFydGlzdFRvb2xzU2VydmljZS5zYXZlU291bmRDbG91ZEFjY291bnRJbmZvKHtcbiAgICAgICAgICB0b2tlbjogcmVzLm9hdXRoX3Rva2VuXG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBoYW5kbGVSZXNwb25zZShyZXMpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgaWYgKHJlcy5zdGF0dXMgPT09IDIwMCAmJiAocmVzLmRhdGEuc3VjY2VzcyA9PT0gdHJ1ZSkpIHtcbiAgICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUocmVzLmRhdGEuZGF0YSk7XG4gICAgICAgICAgJHNjb3BlLnByb2ZpbGUuZGF0YSA9IHJlcy5kYXRhLmRhdGE7XG4gICAgICAgICAgJHNjb3BlLnByb2ZpbGUuaXNBdmFpbGFibGUuc291bmRjbG91ZCA9IHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICAgICAgICB2YWx1ZTogJ1lvdSBhbHJlYWR5IGhhdmUgYW4gYWNjb3VudCB3aXRoIHRoaXMgc291bmRjbG91ZCB1c2VybmFtZScsXG4gICAgICAgICAgICB2aXNpYmxlOiB0cnVlXG4gICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycikge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAkc2NvcGUuZ2V0RG93bmxvYWRMaXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICBBcnRpc3RUb29sc1NlcnZpY2VcbiAgICAgICAgLmdldERvd25sb2FkTGlzdCgpXG4gICAgICAgIC50aGVuKGhhbmRsZVJlc3BvbnNlKVxuICAgICAgICAuY2F0Y2goaGFuZGxlRXJyb3IpO1xuXG4gICAgICBmdW5jdGlvbiBoYW5kbGVSZXNwb25zZShyZXMpIHtcbiAgICAgICAgJHNjb3BlLmRvd25sb2FkR2F0ZXdheUxpc3QgPSByZXMuZGF0YTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycilcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgJHNjb3BlLmRlbGV0ZURvd25sb2FkR2F0ZXdheSA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICBpZiAoY29uZmlybShcIkRvIHlvdSByZWFsbHkgd2FudCB0byBkZWxldGUgdGhpcyB0cmFjaz9cIikpIHtcbiAgICAgICAgdmFyIGRvd25sb2FkR2F0ZVdheUlEID0gJHNjb3BlLmRvd25sb2FkR2F0ZXdheUxpc3RbaW5kZXhdLl9pZDtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgICBBcnRpc3RUb29sc1NlcnZpY2VcbiAgICAgICAgICAuZGVsZXRlRG93bmxvYWRHYXRld2F5KHtcbiAgICAgICAgICAgIGlkOiBkb3dubG9hZEdhdGVXYXlJRFxuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4oaGFuZGxlUmVzcG9uc2UpXG4gICAgICAgICAgLmNhdGNoKGhhbmRsZUVycm9yKTtcblxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVSZXNwb25zZShyZXMpIHtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICRzY29wZS5kb3dubG9hZEdhdGV3YXlMaXN0LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihyZXMpIHtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcbiAgfSlcbiAgLmNvbnRyb2xsZXIoJ09wZW5UaGFua1lvdU1vZGFsQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSkge30pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgIC5zdGF0ZSgnYXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlFZGl0Jywge1xuICAgICAgICAgICAgdXJsOiAnL2Rvd25sb2FkLWdhdGV3YXkvZWRpdC86Z2F0ZXdheUlEJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS92aWV3cy9hcnRpc3RUb29scy9kb3dubG9hZEdhdGV3YXkuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnQXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlDb250cm9sbGVyJ1xuICAgICAgICB9KVxuICAgICAgICAuc3RhdGUoJ2FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5TmV3Jywge1xuICAgICAgICAgICAgdXJsOiAnL2Rvd25sb2FkLWdhdGV3YXkvbmV3JyxcbiAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgIHN1Ym1pc3Npb246IG51bGxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvYXJ0aXN0VG9vbHMvZG93bmxvYWRHYXRld2F5Lmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5Q29udHJvbGxlcidcbiAgICAgICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignQXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsICRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgJHdpbmRvdywgJHVpYk1vZGFsLCAkdGltZW91dCwgU2Vzc2lvblNlcnZpY2UsIEFydGlzdFRvb2xzU2VydmljZSkge1xuICAgIC8qIEluaXQgRG93bmxvYWQgR2F0ZXdheSBmb3JtIGRhdGEgKi9cbiAgICAkc2NvcGUudXNlciA9IEpTT04ucGFyc2UoU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKTtcblxuICAgICRzY29wZS50cmFjayA9IHtcbiAgICAgICAgYXJ0aXN0VXNlcm5hbWU6ICcnLFxuICAgICAgICB0cmFja1RpdGxlOiAnJyxcbiAgICAgICAgdHJhY2tBcnR3b3JrVVJMOiAnJyxcbiAgICAgICAgU01MaW5rczogW10sXG4gICAgICAgIGxpa2U6IGZhbHNlLFxuICAgICAgICBjb21tZW50OiBmYWxzZSxcbiAgICAgICAgcmVwb3N0OiBmYWxzZSxcbiAgICAgICAgYXJ0aXN0czogW10sXG4gICAgICAgIHNob3dEb3dubG9hZFRyYWNrczogJ3VzZXInLFxuICAgICAgICBhZG1pbjogJHNjb3BlLnVzZXIuYWRtaW4sXG4gICAgICAgIGZpbGU6IHt9XG4gICAgfTtcbiAgICAkc2NvcGUucHJvZmlsZSA9IHt9O1xuICAgIC8qIEluaXQgdHJhY2sgbGlzdCBhbmQgdHJhY2tMaXN0T2JqKi9cbiAgICAkc2NvcGUudHJhY2tMaXN0ID0gW107XG4gICAgJHNjb3BlLnRyYWNrTGlzdE9iaiA9IG51bGw7XG5cbiAgICAvKiBNZXRob2QgZm9yIHJlc2V0dGluZyBEb3dubG9hZCBHYXRld2F5IGZvcm0gKi9cblxuICAgICRzY29wZS50cmFja0xpc3RDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xuXG4gICAgICAgIC8qIFNldCBib29sZWFucyAqL1xuXG4gICAgICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcblxuICAgICAgICAvKiBTZXQgdHJhY2sgZGF0YSAqL1xuXG4gICAgICAgIHZhciB0cmFjayA9ICRzY29wZS50cmFja0xpc3RPYmo7XG4gICAgICAgICRzY29wZS50cmFjay50cmFja1VSTCA9IHRyYWNrLnBlcm1hbGlua191cmw7XG4gICAgICAgICRzY29wZS50cmFjay50cmFja1RpdGxlID0gdHJhY2sudGl0bGU7XG4gICAgICAgICRzY29wZS50cmFjay50cmFja0lEID0gdHJhY2suaWQ7XG4gICAgICAgICRzY29wZS50cmFjay5hcnRpc3RJRCA9IHRyYWNrLnVzZXIuaWQ7XG4gICAgICAgICRzY29wZS50cmFjay5kZXNjcmlwdGlvbiA9IHRyYWNrLmRlc2NyaXB0aW9uO1xuICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tBcnR3b3JrVVJMID0gdHJhY2suYXJ0d29ya191cmwgPyB0cmFjay5hcnR3b3JrX3VybC5yZXBsYWNlKCdsYXJnZS5qcGcnLCAndDUwMHg1MDAuanBnJykgOiAnJztcbiAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdEFydHdvcmtVUkwgPSB0cmFjay51c2VyLmF2YXRhcl91cmwgPyB0cmFjay51c2VyLmF2YXRhcl91cmwgOiAnJztcbiAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdFVSTCA9IHRyYWNrLnVzZXIucGVybWFsaW5rX3VybDtcbiAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdFVzZXJuYW1lID0gdHJhY2sudXNlci51c2VybmFtZTtcbiAgICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MgPSBbXTtcblxuICAgICAgICBTQy5nZXQoJy91c2Vycy8nICsgJHNjb3BlLnRyYWNrLmFydGlzdElEICsgJy93ZWItcHJvZmlsZXMnKVxuICAgICAgICAgICAgLnRoZW4oaGFuZGxlV2ViUHJvZmlsZXMpXG4gICAgICAgICAgICAuY2F0Y2goaGFuZGxlRXJyb3IpO1xuXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVdlYlByb2ZpbGVzKHByb2ZpbGVzKSB7XG4gICAgICAgICAgICBwcm9maWxlcy5mb3JFYWNoKGZ1bmN0aW9uKHByb2YpIHtcbiAgICAgICAgICAgICAgICBpZiAoWyd0d2l0dGVyJywgJ3lvdXR1YmUnLCAnZmFjZWJvb2snLCAnc3BvdGlmeScsICdzb3VuZGNsb3VkJywgJ2luc3RhZ3JhbSddLmluZGV4T2YocHJvZi5zZXJ2aWNlKSAhPSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2suU01MaW5rcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGtleTogcHJvZi5zZXJ2aWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHByb2YudXJsXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSB0cnVlO1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycikge1xuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrSUQgPSBudWxsO1xuICAgICAgICAgICAgYWxlcnQoJ1Nvbmcgbm90IGZvdW5kIG9yIGZvcmJpZGRlbicpO1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgfVxuICAgIH07XG5cblxuICAgICRzY29wZS5yZW1vdmVTTUxpbmsgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAkc2NvcGUudHJhY2suU01MaW5rcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH07XG5cbiAgICAkc2NvcGUuc2F2ZURvd25sb2FkR2F0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoISgkc2NvcGUudHJhY2suZG93bmxvYWRVUkwgfHwgJHNjb3BlLnRyYWNrLmZpbGUubmFtZSkpIHtcbiAgICAgICAgICAgIGFsZXJ0KCdFbnRlciBhIGRvd25sb2FkIGZpbGUnKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghJHNjb3BlLnRyYWNrLnRyYWNrSUQpIHtcbiAgICAgICAgICAgIGFsZXJ0KCdUcmFjayBOb3QgRm91bmQnKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAgIHZhciBzZW5kT2JqID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgICAgIGZvciAodmFyIHByb3AgaW4gJHNjb3BlLnRyYWNrKSB7XG4gICAgICAgICAgICBzZW5kT2JqLmFwcGVuZChwcm9wLCAkc2NvcGUudHJhY2tbcHJvcF0pO1xuICAgICAgICB9XG4gICAgICAgIHZhciBhcnRpc3RzID0gJHNjb3BlLnRyYWNrLmFydGlzdHMuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLmlkICE9PSAtMTtcbiAgICAgICAgfSkubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIGRlbGV0ZSBpdGVtWyckJGhhc2hLZXknXTtcbiAgICAgICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgICB9KVxuICAgICAgICBzZW5kT2JqLmFwcGVuZCgnYXJ0aXN0cycsIEpTT04uc3RyaW5naWZ5KGFydGlzdHMpKTtcbiAgICAgICAgdmFyIFNNTGlua3MgPSB7fTtcbiAgICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICBTTUxpbmtzW2l0ZW0ua2V5XSA9IGl0ZW0udmFsdWU7XG4gICAgICAgIH0pO1xuICAgICAgICBzZW5kT2JqLmFwcGVuZCgnU01MaW5rcycsIEpTT04uc3RyaW5naWZ5KFNNTGlua3MpKTtcbiAgICAgICAgaWYgKCRzY29wZS50cmFjay5wbGF5bGlzdHMpIHtcbiAgICAgICAgICAgIHNlbmRPYmouYXBwZW5kKCdwbGF5bGlzdHMnLCBKU09OLnN0cmluZ2lmeSgkc2NvcGUudHJhY2sucGxheWxpc3RzKSk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICAgICAgdXJsOiAnL2FwaS9kYXRhYmFzZS9kb3dubG9hZHVybCcsXG4gICAgICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6IHVuZGVmaW5lZFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRyYW5zZm9ybVJlcXVlc3Q6IGFuZ3VsYXIuaWRlbnRpdHksXG4gICAgICAgICAgICBkYXRhOiBzZW5kT2JqXG4gICAgICAgIH07XG4gICAgICAgICRodHRwKG9wdGlvbnMpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIGlmICgkc3RhdGVQYXJhbXMuc3VibWlzc2lvbikge1xuICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ2FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5TGlzdCcsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdzdWJtaXNzaW9uJzogJHN0YXRlUGFyYW1zLnN1Ym1pc3Npb25cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheUxpc3QnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBhbGVydChcIkVSUk9SOiBFcnJvciBpbiBzYXZpbmcgdXJsXCIpO1xuICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICB9O1xuXG5cbiAgICAkc2NvcGUuY2hlY2tJZkVkaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCRzdGF0ZVBhcmFtcy5nYXRld2F5SUQpIHtcbiAgICAgICAgICAgICRzY29wZS5nZXREb3dubG9hZEdhdGV3YXkoJHN0YXRlUGFyYW1zLmdhdGV3YXlJRCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgJHNjb3BlLmdldFRyYWNrTGlzdEZyb21Tb3VuZGNsb3VkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBwcm9maWxlID0gSlNPTi5wYXJzZShTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkpO1xuICAgICAgICBpZiAocHJvZmlsZS5zb3VuZGNsb3VkKSB7XG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAgICAgICBTQy5nZXQoJy91c2Vycy8nICsgcHJvZmlsZS5zb3VuZGNsb3VkLmlkICsgJy90cmFja3MnKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHRyYWNrcykge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2tMaXN0ID0gdHJhY2tzO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgJHNjb3BlLmNoZWNrSWZTdWJtaXNzaW9uID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICgkc3RhdGVQYXJhbXMuc3VibWlzc2lvbikge1xuICAgICAgICAgICAgaWYgKCRzdGF0ZS5pbmNsdWRlcygnYXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlOZXcnKSkge1xuICAgICAgICAgICAgICAgICRzY29wZS50cmFjay50cmFja1VSTCA9ICRyb290U2NvcGUuc3VibWlzc2lvbi50cmFja1VSTDtcbiAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2tVUkxDaGFuZ2UoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICRzY29wZS5vcGVuVGhhbmtZb3VNb2RhbC50aGFua1lvdSgkc3RhdGVQYXJhbXMuc3VibWlzc2lvbi5faWQpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS5zdWJtaXNzaW9uID0gbnVsbDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgICRzY29wZS50cmFja1VSTENoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoJHNjb3BlLnRyYWNrLnRyYWNrVVJMICE9PSAnJykge1xuICAgICAgICAgICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSBmYWxzZTtcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIEFydGlzdFRvb2xzU2VydmljZS5yZXNvbHZlRGF0YSh7XG4gICAgICAgICAgICAgICAgdXJsOiAkc2NvcGUudHJhY2sudHJhY2tVUkxcbiAgICAgICAgICAgIH0pLnRoZW4oaGFuZGxlVHJhY2tEYXRhQW5kR2V0UHJvZmlsZXMpLnRoZW4oaGFuZGxlV2ViUHJvZmlsZXMpLmNhdGNoKGhhbmRsZUVycm9yKTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gaGFuZGxlVHJhY2tEYXRhQW5kR2V0UHJvZmlsZXMocmVzKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrVGl0bGUgPSByZXMuZGF0YS50aXRsZTtcbiAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tJRCA9IHJlcy5kYXRhLmlkO1xuICAgICAgICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RJRCA9IHJlcy5kYXRhLnVzZXIuaWQ7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLmRlc2NyaXB0aW9uID0gcmVzLmRhdGEuZGVzY3JpcHRpb247XG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrQXJ0d29ya1VSTCA9IHJlcy5kYXRhLmFydHdvcmtfdXJsID8gcmVzLmRhdGEuYXJ0d29ya191cmwucmVwbGFjZSgnbGFyZ2UuanBnJywgJ3Q1MDB4NTAwLmpwZycpIDogJyc7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdEFydHdvcmtVUkwgPSByZXMuZGF0YS51c2VyLmF2YXRhcl91cmwgPyByZXMuZGF0YS51c2VyLmF2YXRhcl91cmwucmVwbGFjZSgnbGFyZ2UuanBnJywgJ3Q1MDB4NTAwLmpwZycpIDogJyc7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdFVSTCA9IHJlcy5kYXRhLnVzZXIucGVybWFsaW5rX3VybDtcbiAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0VXNlcm5hbWUgPSByZXMuZGF0YS51c2VyLnVzZXJuYW1lO1xuICAgICAgICAgICAgICAgICRzY29wZS50cmFjay5TTUxpbmtzID0gW107XG4gICAgICAgICAgICAgICAgcmV0dXJuIFNDLmdldCgnL3VzZXJzLycgKyAkc2NvcGUudHJhY2suYXJ0aXN0SUQgKyAnL3dlYi1wcm9maWxlcycpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBoYW5kbGVXZWJQcm9maWxlcyhwcm9maWxlcykge1xuICAgICAgICAgICAgICAgIHByb2ZpbGVzLmZvckVhY2goZnVuY3Rpb24ocHJvZikge1xuICAgICAgICAgICAgICAgICAgICBpZiAoWyd0d2l0dGVyJywgJ3lvdXR1YmUnLCAnZmFjZWJvb2snLCAnc3BvdGlmeScsICdzb3VuZGNsb3VkJywgJ2luc3RhZ3JhbSddLmluZGV4T2YocHJvZi5zZXJ2aWNlKSAhPSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAga2V5OiBwcm9mLnNlcnZpY2UsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWU6IHByb2YudXJsXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycikge1xuICAgICAgICAgICAgICAgICRzY29wZS50cmFjay50cmFja0lEID0gbnVsbDtcbiAgICAgICAgICAgICAgICBhbGVydCgnU29uZyBub3QgZm91bmQgb3IgZm9yYmlkZGVuJyk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgICRzY29wZS5TTUxpbmtDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICBmdW5jdGlvbiBnZXRMb2NhdGlvbihocmVmKSB7XG4gICAgICAgICAgICB2YXIgbG9jYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSBocmVmO1xuICAgICAgICAgICAgaWYgKGxvY2F0aW9uLmhvc3QgPT0gXCJcIikge1xuICAgICAgICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSBsb2NhdGlvbi5ocmVmO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGxvY2F0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGxvY2F0aW9uID0gZ2V0TG9jYXRpb24oJHNjb3BlLnRyYWNrLlNNTGlua3NbaW5kZXhdLnZhbHVlKTtcbiAgICAgICAgdmFyIGhvc3QgPSBsb2NhdGlvbi5ob3N0bmFtZS5zcGxpdCgnLicpWzBdO1xuICAgICAgICB2YXIgZmluZExpbmsgPSAkc2NvcGUudHJhY2suU01MaW5rcy5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgcmV0dXJuIGl0ZW0ua2V5ID09PSBob3N0O1xuICAgICAgICB9KTtcblxuICAgICAgICBpZiAoZmluZExpbmsubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgICRzY29wZS50cmFjay5TTUxpbmtzW2luZGV4XS5rZXkgPSBob3N0O1xuICAgIH1cblxuICAgICRzY29wZS5hZGRTTUxpbmsgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MucHVzaCh7XG4gICAgICAgICAgICBrZXk6ICcnLFxuICAgICAgICAgICAgdmFsdWU6ICcnXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgICRzY29wZS5jbGVhck9yRmlsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoJHNjb3BlLnRyYWNrLmRvd25sb2FkVVJMKSB7XG4gICAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoXCJpbnB1dFt0eXBlPSdmaWxlJ11cIikudmFsKG51bGwpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgJHNjb3BlLmFydGlzdFVSTENoYW5nZSA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgIHZhciBhcnRpc3QgPSB7fTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgICBBcnRpc3RUb29sc1NlcnZpY2UucmVzb2x2ZURhdGEoe1xuICAgICAgICAgICAgdXJsOiAkc2NvcGUudHJhY2suYXJ0aXN0c1tpbmRleF0udXJsXG4gICAgICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0c1tpbmRleF0uYXZhdGFyID0gcmVzLmRhdGEuYXZhdGFyX3VybCA/IHJlcy5kYXRhLmF2YXRhcl91cmwgOiAnJztcbiAgICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RzW2luZGV4XS51c2VybmFtZSA9IHJlcy5kYXRhLnVzZXJuYW1lO1xuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdHNbaW5kZXhdLmlkID0gcmVzLmRhdGEuaWQ7XG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGFsZXJ0KCdBcnRpc3RzIG5vdCBmb3VuZCcpO1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgJHNjb3BlLnJlbW92ZUFydGlzdCA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICRzY29wZS50cmFjay5hcnRpc3RzLnNwbGljZShpbmRleCwgMSk7XG4gICAgfVxuXG4gICAgJHNjb3BlLmFkZEFydGlzdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0cy5wdXNoKHtcbiAgICAgICAgICAgIHVybDogJycsXG4gICAgICAgICAgICBhdmF0YXI6ICcnLFxuICAgICAgICAgICAgdXNlcm5hbWU6ICcnLFxuICAgICAgICAgICAgaWQ6IC0xLFxuICAgICAgICAgICAgcGVybWFuZW50TGluazogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgJHNjb3BlLnJlbW92ZVBsYXlsaXN0ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgJHNjb3BlLnRyYWNrLnBsYXlsaXN0cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICAkc2NvcGUucGxheWxpc3RVUkxDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAgIEFkbWluRExHYXRlU2VydmljZVxuICAgICAgICAgICAgLnJlc29sdmVEYXRhKHtcbiAgICAgICAgICAgICAgICB1cmw6ICRzY29wZS50cmFjay5wbGF5bGlzdHNbaW5kZXhdLnVybFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICRzY29wZS50cmFjay5wbGF5bGlzdHNbaW5kZXhdLmF2YXRhciA9IHJlcy5kYXRhLmFydHdvcmtfdXJsO1xuICAgICAgICAgICAgICAgICRzY29wZS50cmFjay5wbGF5bGlzdHNbaW5kZXhdLnRpdGxlID0gcmVzLmRhdGEudGl0bGU7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnBsYXlsaXN0c1tpbmRleF0uaWQgPSByZXMuZGF0YS5pZDtcbiAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgIGFsZXJ0KCdQbGF5bGlzdCBub3QgZm91bmQnKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgfSlcbiAgICB9XG5cbiAgICBmdW5jdGlvbiByZXNldERvd25sb2FkR2F0ZXdheSgpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSBmYWxzZTtcbiAgICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICAgICAgICB2YWw6ICcnLFxuICAgICAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUudHJhY2sgPSB7XG4gICAgICAgICAgICBhcnRpc3RVc2VybmFtZTogJycsXG4gICAgICAgICAgICB0cmFja1RpdGxlOiAnJyxcbiAgICAgICAgICAgIHRyYWNrQXJ0d29ya1VSTDogJycsXG4gICAgICAgICAgICBTTUxpbmtzOiBbXSxcbiAgICAgICAgICAgIGxpa2U6IGZhbHNlLFxuICAgICAgICAgICAgY29tbWVudDogZmFsc2UsXG4gICAgICAgICAgICByZXBvc3Q6IGZhbHNlLFxuICAgICAgICAgICAgYXJ0aXN0czogW3tcbiAgICAgICAgICAgICAgICB1cmw6ICcnLFxuICAgICAgICAgICAgICAgIGF2YXRhcjogJycsXG4gICAgICAgICAgICAgICAgdXNlcm5hbWU6ICcnLFxuICAgICAgICAgICAgICAgIGlkOiAtMSxcbiAgICAgICAgICAgICAgICBwZXJtYW5lbnRMaW5rOiBmYWxzZVxuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICBzaG93RG93bmxvYWRUcmFja3M6ICd1c2VyJ1xuICAgICAgICB9O1xuICAgICAgICBhbmd1bGFyLmVsZW1lbnQoXCJpbnB1dFt0eXBlPSdmaWxlJ11cIikudmFsKG51bGwpO1xuICAgIH1cblxuICAgIC8qIE1ldGhvZCBmb3IgZ2V0dGluZyBEb3dubG9hZEdhdGV3YXkgaW4gY2FzZSBvZiBlZGl0ICovXG5cbiAgICAkc2NvcGUuZ2V0RG93bmxvYWRHYXRld2F5ID0gZnVuY3Rpb24oZG93bmxvYWRHYXRlV2F5SUQpIHtcbiAgICAgICAgLy8gcmVzZXREb3dubG9hZEdhdGV3YXkoKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgICBBcnRpc3RUb29sc1NlcnZpY2VcbiAgICAgICAgICAgIC5nZXREb3dubG9hZEdhdGV3YXkoe1xuICAgICAgICAgICAgICAgIGlkOiBkb3dubG9hZEdhdGVXYXlJRFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKGhhbmRsZVJlc3BvbnNlKVxuICAgICAgICAgICAgLmNhdGNoKGhhbmRsZUVycm9yKTtcblxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVSZXNwb25zZShyZXMpIHtcblxuICAgICAgICAgICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSB0cnVlO1xuICAgICAgICAgICAgJHNjb3BlLnRyYWNrID0gcmVzLmRhdGE7XG5cbiAgICAgICAgICAgIHZhciBTTUxpbmtzID0gcmVzLmRhdGEuU01MaW5rcyA/IHJlcy5kYXRhLlNNTGlua3MgOiB7fTtcbiAgICAgICAgICAgIHZhciBwZXJtYW5lbnRMaW5rcyA9IHJlcy5kYXRhLnBlcm1hbmVudExpbmtzID8gcmVzLmRhdGEucGVybWFuZW50TGlua3MgOiBbJyddO1xuICAgICAgICAgICAgdmFyIFNNTGlua3NBcnJheSA9IFtdO1xuICAgICAgICAgICAgdmFyIHBlcm1hbmVudExpbmtzQXJyYXkgPSBbXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgbGluayBpbiBTTUxpbmtzKSB7XG4gICAgICAgICAgICAgICAgU01MaW5rc0FycmF5LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICBrZXk6IGxpbmssXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlOiBTTUxpbmtzW2xpbmtdXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBwZXJtYW5lbnRMaW5rcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICBwZXJtYW5lbnRMaW5rc0FycmF5LnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB1cmw6IGl0ZW1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAoISRzY29wZS50cmFjay5zaG93RG93bmxvYWRUcmFja3MpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2suc2hvd0Rvd25sb2FkVHJhY2tzID0gJ3VzZXInO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MgPSBTTUxpbmtzQXJyYXk7XG4gICAgICAgICAgICAkc2NvcGUudHJhY2sucGVybWFuZW50TGlua3MgPSBwZXJtYW5lbnRMaW5rc0FycmF5O1xuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnBsYXlsaXN0SURTID0gW107XG4gICAgICAgICAgICAvLyAkc2NvcGUudHJhY2suc2hvd0Rvd25sb2FkVHJhY2tzID0gKCRzY29wZS50cmFjay5zaG93RG93bmxvYWRUcmFja3MgPT09ICd1c2VyJykgPyB0cnVlIDogZmFsc2U7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUudHJhY2spO1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKHJlcykge1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAkc2NvcGUuY2xlYXJPcklucHV0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICRzY29wZS50cmFjay5kb3dubG9hZFVSTCA9IFwiXCI7XG4gICAgfVxuXG4gICAgJHNjb3BlLiR3YXRjaCgndHJhY2snLCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCkge1xuICAgICAgICBpZiAobmV3VmFsLnRyYWNrVGl0bGUpXG4gICAgICAgICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3RyYWNrUHJldmlld0RhdGEnLCBKU09OLnN0cmluZ2lmeShuZXdWYWwpKTtcbiAgICB9LCB0cnVlKTtcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAuc3RhdGUoJ2FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5UHJldmlldycsIHtcbiAgICAgICAgICAgIHVybDogJy9kb3dubG9hZC1nYXRld2F5L3ByZXZpZXcnLFxuICAgICAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgICAgICAgc3VibWlzc2lvbjogbnVsbFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS92aWV3cy9hcnRpc3RUb29scy9wcmV2aWV3Lmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0FydGlzdFRvb2xzUHJldmlld0NvbnRyb2xsZXInXG4gICAgICAgIH0pXG59KTtcblxuXG5hcHAuY29udHJvbGxlcihcIkFydGlzdFRvb2xzUHJldmlld0NvbnRyb2xsZXJcIiwgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsICRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgJHdpbmRvdywgJHVpYk1vZGFsLCAkdGltZW91dCwgU2Vzc2lvblNlcnZpY2UsIEFydGlzdFRvb2xzU2VydmljZSkge1xuICAgIHZhciB0cmFjayA9IEpTT04ucGFyc2Uod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0cmFja1ByZXZpZXdEYXRhJykpO1xuICAgIGNvbnNvbGUubG9nKHRyYWNrKTtcbiAgICBpZiAoIXRyYWNrLnRyYWNrVGl0bGUpIHtcbiAgICAgICAgYWxlcnQoJ1RyYWNrIE5vdCBGb3VuZCcpO1xuICAgICAgICAkc3RhdGUuZ28oXCJhcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheUxpc3RcIik7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICAkc2NvcGUudHJhY2sgPSB0cmFjaztcbiAgICAkc2NvcGUucGxheWVyID0ge307XG4gICAgU0Muc3RyZWFtKCcvdHJhY2tzLycgKyAkc2NvcGUudHJhY2sudHJhY2tJRClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocCkge1xuICAgICAgICAgICAgJHNjb3BlLnBsYXllciA9IHA7XG4gICAgICAgIH0pXG5cbiAgICAkc2NvcGUudG9nZ2xlID0gdHJ1ZTtcbiAgICAkc2NvcGUudG9nZ2xlUGxheSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAkc2NvcGUudG9nZ2xlID0gISRzY29wZS50b2dnbGU7XG4gICAgICAgIGlmICgkc2NvcGUudG9nZ2xlKSB7XG4gICAgICAgICAgICAkc2NvcGUucGxheWVyLnBhdXNlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkc2NvcGUucGxheWVyLnBsYXkoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICAkc2NvcGUubm9kbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBhbGVydCgnTm8gZG93bmxvYWQgaW4gcHJldmlldyBtb2RlLicpXG4gICAgfVxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgnaG9tZScsIHtcbiAgICAgIHVybDogJy8nLFxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL3ZpZXdzL2hvbWUuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnSG9tZUNvbnRyb2xsZXInXG4gICAgfSlcbiAgICAuc3RhdGUoJ2Fib3V0Jywge1xuICAgICAgdXJsOiAnL2Fib3V0JyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS92aWV3cy9hYm91dC5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcbiAgICB9KVxuICAgIC5zdGF0ZSgnc2VydmljZXMnLCB7XG4gICAgICB1cmw6ICcvc2VydmljZXMnLFxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL3ZpZXdzL3NlcnZpY2VzLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJ1xuICAgIH0pXG4gICAgLnN0YXRlKCdmYXFzJywge1xuICAgICAgdXJsOiAnL2ZhcXMnLFxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL3ZpZXdzL2ZhcXMuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnSG9tZUNvbnRyb2xsZXInXG4gICAgfSlcbiAgICAuc3RhdGUoJ2FwcGx5Jywge1xuICAgICAgdXJsOiAnL2FwcGx5JyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS92aWV3cy9hcHBseS5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcbiAgICB9KVxuICAgIC5zdGF0ZSgnY29udGFjdCcsIHtcbiAgICAgIHVybDogJy9jb250YWN0JyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS92aWV3cy9jb250YWN0Lmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJ1xuICAgIH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdIb21lQ29udHJvbGxlcicsIFsnJHJvb3RTY29wZScsXG4gICckc3RhdGUnLFxuICAnJHNjb3BlJyxcbiAgJyRodHRwJyxcbiAgJyRsb2NhdGlvbicsXG4gICckd2luZG93JyxcbiAgJ0hvbWVTZXJ2aWNlJyxcbiAgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCAkbG9jYXRpb24sICR3aW5kb3csIEhvbWVTZXJ2aWNlKSB7XG5cbiAgICAkc2NvcGUuYXBwbGljYXRpb25PYmogPSB7fTtcbiAgICAkc2NvcGUuYXJ0aXN0ID0ge307XG4gICAgJHNjb3BlLnNlbnQgPSB7XG4gICAgICBhcHBsaWNhdGlvbjogZmFsc2UsXG4gICAgICBhcnRpc3RFbWFpbDogZmFsc2VcbiAgICB9O1xuICAgICRzY29wZS5tZXNzYWdlID0ge1xuICAgICAgYXBwbGljYXRpb246IHtcbiAgICAgICAgdmFsOiAnJyxcbiAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgIH0sXG4gICAgICBhcnRpc3RFbWFpbDoge1xuICAgICAgICB2YWw6ICcnLFxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgfVxuICAgIH07XG5cbiAgICAvKiBBcHBseSBwYWdlIHN0YXJ0ICovXG5cbiAgICAkc2NvcGUudG9nZ2xlQXBwbGljYXRpb25TZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgICAgYXBwbGljYXRpb246IHtcbiAgICAgICAgICB2YWw6ICcnLFxuICAgICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgICAkc2NvcGUuc2VudC5hcHBsaWNhdGlvbiA9ICEkc2NvcGUuc2VudC5hcHBsaWNhdGlvbjtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnNhdmVBcHBsaWNhdGlvbiA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAkc2NvcGUubWVzc2FnZS5hcHBsaWNhdGlvbiA9IHtcbiAgICAgICAgdmFsOiAnJyxcbiAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgIH07XG5cbiAgICAgIEhvbWVTZXJ2aWNlXG4gICAgICAgIC5zYXZlQXBwbGljYXRpb24oJHNjb3BlLmFwcGxpY2F0aW9uT2JqKVxuICAgICAgICAudGhlbihzYXZlQXBwbGljYXRpb25SZXNwb25zZSlcbiAgICAgICAgLmNhdGNoKHNhdmVBcHBsaWNhdGlvbkVycm9yKVxuXG4gICAgICBmdW5jdGlvbiBzYXZlQXBwbGljYXRpb25SZXNwb25zZShyZXMpIHtcbiAgICAgICAgaWYgKHJlcy5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICRzY29wZS5hcHBsaWNhdGlvbk9iaiA9IHt9O1xuICAgICAgICAgICRzY29wZS5zZW50LmFwcGxpY2F0aW9uID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBzYXZlQXBwbGljYXRpb25FcnJvcihyZXMpIHtcbiAgICAgICAgaWYocmVzLnN0YXR1cyA9PT0gNDAwKSB7XG4gICAgICAgICAgJHNjb3BlLm1lc3NhZ2UuYXBwbGljYXRpb24gPSB7XG4gICAgICAgICAgICB2YWw6ICdFbWFpbCBhbHJlYWR5IGV4aXN0cyEnLFxuICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZVxuICAgICAgICAgIH07XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgICRzY29wZS5tZXNzYWdlLmFwcGxpY2F0aW9uID0ge1xuICAgICAgICAgIHZhbDogJ0Vycm9yIGluIHByb2Nlc3NpbmcgeW91ciByZXF1ZXN0JyxcbiAgICAgICAgICB2aXNpYmxlOiB0cnVlXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qIEFwcGx5IHBhZ2UgZW5kICovXG5cbiAgICAvKiBBcnRpc3QgVG9vbHMgcGFnZSBzdGFydCAqL1xuICAgIFxuICAgICRzY29wZS50b2dnbGVBcnRpc3RFbWFpbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICAgIGFydGlzdEVtYWlsOiB7XG4gICAgICAgICAgdmFsOiAnJyxcbiAgICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgJHNjb3BlLnNlbnQuYXJ0aXN0RW1haWwgPSAhJHNjb3BlLnNlbnQuYXJ0aXN0RW1haWw7XG4gICAgfTtcblxuICAgICRzY29wZS5zYXZlQXJ0aXN0RW1haWwgPSBmdW5jdGlvbigpIHtcbiAgICAgIEhvbWVTZXJ2aWNlXG4gICAgICAgIC5zYXZlQXJ0aXN0RW1haWwoJHNjb3BlLmFydGlzdClcbiAgICAgICAgLnRoZW4oYXJ0aXN0RW1haWxSZXNwb25zZSlcbiAgICAgICAgLmNhdGNoKGFydGlzdEVtYWlsRXJyb3IpXG5cbiAgICAgIGZ1bmN0aW9uIGFydGlzdEVtYWlsUmVzcG9uc2UocmVzKSB7XG4gICAgICAgIGlmIChyZXMuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAkc2NvcGUuYXJ0aXN0ID0ge307XG4gICAgICAgICAgJHNjb3BlLnNlbnQuYXJ0aXN0RW1haWwgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGFydGlzdEVtYWlsRXJyb3IocmVzKSB7XG4gICAgICAgIGlmKHJlcy5zdGF0dXMgPT09IDQwMCkge1xuICAgICAgICAgICRzY29wZS5tZXNzYWdlLmFydGlzdEVtYWlsID0ge1xuICAgICAgICAgICAgdmFsOiAnRW1haWwgYWxyZWFkeSBleGlzdHMhJyxcbiAgICAgICAgICAgIHZpc2libGU6IHRydWVcbiAgICAgICAgICB9O1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgICRzY29wZS5tZXNzYWdlLmFydGlzdEVtYWlsID0ge1xuICAgICAgICAgIHZhbDogJ0Vycm9yIGluIHByb2Nlc3NpbmcgeW91ciByZXF1ZXN0JyxcbiAgICAgICAgICB2aXNpYmxlOiB0cnVlXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcblxuICAgIC8qIEFydGlzdCBUb29scyBwYWdlIGVuZCAqL1xuICB9XG5dKTtcblxuYXBwLmRpcmVjdGl2ZSgnYWZmaXhlcicsIGZ1bmN0aW9uKCR3aW5kb3cpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0VBJyxcbiAgICBsaW5rOiBmdW5jdGlvbigkc2NvcGUsICRlbGVtZW50KSB7XG4gICAgICB2YXIgd2luID0gYW5ndWxhci5lbGVtZW50KCR3aW5kb3cpO1xuICAgICAgdmFyIHRvcE9mZnNldCA9ICRlbGVtZW50WzBdLm9mZnNldFRvcDtcblxuICAgICAgZnVuY3Rpb24gYWZmaXhFbGVtZW50KCkge1xuXG4gICAgICAgIGlmICgkd2luZG93LnBhZ2VZT2Zmc2V0ID4gdG9wT2Zmc2V0KSB7XG4gICAgICAgICAgJGVsZW1lbnQuY3NzKCdwb3NpdGlvbicsICdmaXhlZCcpO1xuICAgICAgICAgICRlbGVtZW50LmNzcygndG9wJywgJzMuNSUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkZWxlbWVudC5jc3MoJ3Bvc2l0aW9uJywgJycpO1xuICAgICAgICAgICRlbGVtZW50LmNzcygndG9wJywgJycpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgICRzY29wZS4kb24oJyRyb3V0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIHdpbi51bmJpbmQoJ3Njcm9sbCcsIGFmZml4RWxlbWVudCk7XG4gICAgICB9KTtcbiAgICAgIHdpbi5iaW5kKCdzY3JvbGwnLCBhZmZpeEVsZW1lbnQpO1xuICAgIH1cbiAgfTtcbn0pIiwiXG5cbmFwcC5zZXJ2aWNlKCdBcnRpc3RUb29sc1NlcnZpY2UnLCBbJyRodHRwJywgZnVuY3Rpb24oJGh0dHApe1xuXG5cdGZ1bmN0aW9uIHJlc29sdmVEYXRhKGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9zb3VuZGNsb3VkL3Jlc29sdmUnLCBkYXRhKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGdldERvd25sb2FkTGlzdCgpIHtcblx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2RhdGFiYXNlL2Rvd25sb2FkdXJsJyk7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXREb3dubG9hZEdhdGV3YXkoZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZGF0YWJhc2UvZG93bmxvYWR1cmwvJyArIGRhdGEuaWQpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZGVsZXRlRG93bmxvYWRHYXRld2F5KGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS9kb3dubG9hZHVybC9kZWxldGUnLCBkYXRhKTtcblx0fVxuXG5cdGZ1bmN0aW9uIHNhdmVQcm9maWxlSW5mbyhkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvcHJvZmlsZS9lZGl0JywgZGF0YSk7XG5cdH1cblxuXHRmdW5jdGlvbiBzYXZlU291bmRDbG91ZEFjY291bnRJbmZvKGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS9wcm9maWxlL3NvdW5kY2xvdWQnLCBkYXRhKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGdldFRyYWNrTGlzdEZyb21Tb3VuZGNsb3VkKGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS90cmFja3MvbGlzdCcsIGRhdGEpO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRyZXNvbHZlRGF0YTogcmVzb2x2ZURhdGEsXG5cdFx0Z2V0RG93bmxvYWRMaXN0OiBnZXREb3dubG9hZExpc3QsXG5cdFx0Z2V0RG93bmxvYWRHYXRld2F5OiBnZXREb3dubG9hZEdhdGV3YXksXG5cdFx0c2F2ZVByb2ZpbGVJbmZvOiBzYXZlUHJvZmlsZUluZm8sXG5cdFx0ZGVsZXRlRG93bmxvYWRHYXRld2F5OiBkZWxldGVEb3dubG9hZEdhdGV3YXksXG5cdFx0c2F2ZVNvdW5kQ2xvdWRBY2NvdW50SW5mbzogc2F2ZVNvdW5kQ2xvdWRBY2NvdW50SW5mbyxcblx0XHRnZXRUcmFja0xpc3RGcm9tU291bmRjbG91ZDogZ2V0VHJhY2tMaXN0RnJvbVNvdW5kY2xvdWRcblx0fTtcbn1dKTtcbiIsIlxuXG5hcHAuc2VydmljZSgnSG9tZVNlcnZpY2UnLCBbJyRodHRwJywgZnVuY3Rpb24oJGh0dHApe1xuXHRcblx0ZnVuY3Rpb24gc2F2ZUFwcGxpY2F0aW9uKGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9ob21lL2FwcGxpY2F0aW9uJywgZGF0YSk7XG5cdH1cblxuXHRmdW5jdGlvbiBzYXZlQXJ0aXN0RW1haWwoZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2hvbWUvYXJ0aXN0ZW1haWwnLCBkYXRhKTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0c2F2ZUFwcGxpY2F0aW9uOiBzYXZlQXBwbGljYXRpb24sXG5cdFx0c2F2ZUFydGlzdEVtYWlsOiBzYXZlQXJ0aXN0RW1haWxcblx0fTtcbn1dKTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3ByZW1pZXJlJywge1xuICAgIHVybDogJy9wcmVtaWVyZScsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9wcmVtaWVyZS92aWV3cy9wcmVtaWVyZS5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnUHJlbWllckNvbnRyb2xsZXInXG4gIH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdQcmVtaWVyQ29udHJvbGxlcicsIFsnJHJvb3RTY29wZScsXG4gICckc3RhdGUnLFxuICAnJHNjb3BlJyxcbiAgJyRodHRwJyxcbiAgJyRsb2NhdGlvbicsXG4gICckd2luZG93JyxcbiAgJ1ByZW1pZXJTZXJ2aWNlJyxcbiAgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCAkbG9jYXRpb24sICR3aW5kb3csIFByZW1pZXJTZXJ2aWNlKSB7XG5cbiAgICAkc2NvcGUuZ2VucmVBcnJheSA9IFtcbiAgICAgICdBbHRlcm5hdGl2ZSBSb2NrJyxcbiAgICAgICdBbWJpZW50JyxcbiAgICAgICdDcmVhdGl2ZScsXG4gICAgICAnQ2hpbGwnLFxuICAgICAgJ0NsYXNzaWNhbCcsXG4gICAgICAnQ291bnRyeScsXG4gICAgICAnRGFuY2UgJiBFRE0nLFxuICAgICAgJ0RhbmNlaGFsbCcsXG4gICAgICAnRGVlcCBIb3VzZScsXG4gICAgICAnRGlzY28nLFxuICAgICAgJ0RydW0gJiBCYXNzJyxcbiAgICAgICdEdWJzdGVwJyxcbiAgICAgICdFbGVjdHJvbmljJyxcbiAgICAgICdGZXN0aXZhbCcsXG4gICAgICAnRm9saycsXG4gICAgICAnSGlwLUhvcC9STkInLFxuICAgICAgJ0hvdXNlJyxcbiAgICAgICdJbmRpZS9BbHRlcm5hdGl2ZScsXG4gICAgICAnTGF0aW4nLFxuICAgICAgJ1RyYXAnLFxuICAgICAgJ1ZvY2FsaXN0cy9TaW5nZXItU29uZ3dyaXRlcidcbiAgICBdO1xuXG4gICAgJHNjb3BlLnByZW1pZXJPYmogPSB7fTtcbiAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgIHZhbDogJycsXG4gICAgICB2aXNpYmxlOiBmYWxzZVxuICAgIH07XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcblxuICAgICRzY29wZS5zYXZlUHJlbWllciA9IGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgJHNjb3BlLm1lc3NhZ2UudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgdmFyIGRhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAgIGZvciAodmFyIHByb3AgaW4gJHNjb3BlLnByZW1pZXJPYmopIHtcbiAgICAgICAgZGF0YS5hcHBlbmQocHJvcCwgJHNjb3BlLnByZW1pZXJPYmpbcHJvcF0pO1xuICAgICAgfVxuICAgICAgUHJlbWllclNlcnZpY2VcbiAgICAgICAgLnNhdmVQcmVtaWVyKGRhdGEpXG4gICAgICAgIC50aGVuKHJlY2VpdmVSZXNwb25zZSlcbiAgICAgICAgLmNhdGNoKGNhdGNoRXJyb3IpO1xuXG4gICAgICBmdW5jdGlvbiByZWNlaXZlUmVzcG9uc2UocmVzKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIGlmIChyZXMuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAkc2NvcGUubWVzc2FnZS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAkc2NvcGUubWVzc2FnZS52YWwgPSAnVGhhbmsgeW91ISBZb3VyIG1lc3NhZ2UgaGFzIGJlZW4gc2VudCBzdWNjZXNzZnVsbHkuJztcbiAgICAgICAgICAkc2NvcGUucHJlbWllck9iaiA9IHt9O1xuICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChcImlucHV0W3R5cGU9J2ZpbGUnXVwiKS52YWwobnVsbCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgICRzY29wZS5tZXNzYWdlLnZpc2libGUgPSB0cnVlO1xuICAgICAgICAkc2NvcGUubWVzc2FnZS52YWwgPSAnRXJyb3IgaW4gcHJvY2Vzc2luZyB0aGUgcmVxdWVzdC4gUGxlYXNlIHRyeSBhZ2Fpbi4nO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBjYXRjaEVycm9yKHJlcykge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICBpZiAocmVzLnN0YXR1cyA9PT0gNDAwKSB7XG4gICAgICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICAgICAgICB2aXNpYmxlOiB0cnVlLFxuICAgICAgICAgICAgdmFsOiByZXMuZGF0YVxuICAgICAgICAgIH07XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgICRzY29wZS5tZXNzYWdlID0ge1xuICAgICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgICAgdmFsOiAnRXJyb3IgaW4gcHJvY2Vzc2luZyB0aGUgcmVxdWVzdC4gUGxlYXNlIHRyeSBhZ2Fpbi4nXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfTtcbiAgfVxuXSk7IiwiYXBwLnNlcnZpY2UoJ1ByZW1pZXJTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKSB7XG5cblx0ZnVuY3Rpb24gc2F2ZVByZW1pZXIoZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cCh7XG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdHVybDogJy9hcGkvcHJlbWllcicsXG5cdFx0XHRoZWFkZXJzOiB7XG5cdFx0XHRcdCdDb250ZW50LVR5cGUnOiB1bmRlZmluZWRcblx0XHRcdH0sXG5cdFx0XHR0cmFuc2Zvcm1SZXF1ZXN0OiBhbmd1bGFyLmlkZW50aXR5LFxuXHRcdFx0ZGF0YTogZGF0YVxuXHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRzYXZlUHJlbWllcjogc2F2ZVByZW1pZXJcblx0fTtcbn1dKTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdzdWJtaXNzaW9ucycsIHtcbiAgICB1cmw6ICcvc3VibWlzc2lvbnMnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvc3VibWlzc2lvbnMvdmlld3Mvc3VibWlzc2lvbnMuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ1N1Ym1pc3Npb25Db250cm9sbGVyJ1xuICB9KTtcbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdTdWJtaXNzaW9uQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgQXV0aFNlcnZpY2UsIG9FbWJlZEZhY3RvcnkpIHtcbiAgJHNjb3BlLmNvdW50ZXIgPSAwO1xuICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzID0gW107XG4gICRzY29wZS5zdWJtaXNzaW9ucyA9IFtdO1xuICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgJGh0dHAuZ2V0KCcvYXBpL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4nO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIGFsZXJ0KCdXcm9uZyBQYXNzd29yZCcpO1xuICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmxvYWRTdWJtaXNzaW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5nZXQoJy9hcGkvc3VibWlzc2lvbnMvdW5hY2NlcHRlZCcpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHNjb3BlLnN1Ym1pc3Npb25zID0gcmVzLmRhdGE7XG4gICAgICAgIGNvbnNvbGUubG9nKHJlcy5kYXRhKTtcbiAgICAgICAgJHNjb3BlLmxvYWRNb3JlKCk7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvY2hhbm5lbHMnKTtcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHNjb3BlLmNoYW5uZWxzID0gcmVzLmRhdGE7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIGFsZXJ0KCdFcnJvcjogQ291bGQgbm90IGdldCBjaGFubmVscy4nKVxuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUubG9hZE1vcmUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbG9hZEVsZW1lbnRzID0gW107XG4gICAgZm9yIChsZXQgaSA9ICRzY29wZS5jb3VudGVyOyBpIDwgJHNjb3BlLmNvdW50ZXIgKyAxNTsgaSsrKSB7XG4gICAgICB2YXIgc3ViID0gJHNjb3BlLnN1Ym1pc3Npb25zW2ldO1xuICAgICAgaWYgKHN1Yikge1xuICAgICAgICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLnB1c2goc3ViKTtcbiAgICAgICAgbG9hZEVsZW1lbnRzLnB1c2goc3ViKTtcbiAgICAgIH1cbiAgICB9XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIGNvbnNvbGUubG9nKGxvYWRFbGVtZW50cyk7XG4gICAgICBsb2FkRWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihzdWIpIHtcbiAgICAgICAgb0VtYmVkRmFjdG9yeS5lbWJlZFNvbmcoc3ViKTtcbiAgICAgIH0sIDUwKVxuICAgIH0pO1xuICAgICRzY29wZS5jb3VudGVyICs9IDE1O1xuICB9XG5cbiAgJHNjb3BlLmNoYW5nZUJveCA9IGZ1bmN0aW9uKHN1YiwgY2hhbikge1xuICAgIHN1YltjaGFuLmRpc3BsYXlOYW1lXSA9ICFzdWJbY2hhbi5kaXNwbGF5TmFtZV07XG4gICAgdmFyIGluZGV4ID0gc3ViLmNoYW5uZWxJRFMuaW5kZXhPZihjaGFuLmNoYW5uZWxJRCk7XG4gICAgaWYgKGluZGV4ID09IC0xKSB7XG4gICAgICBzdWIuY2hhbm5lbElEUy5wdXNoKGNoYW4uY2hhbm5lbElEKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3ViLmNoYW5uZWxJRFMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gIH1cblxuICAkc2NvcGUuc2F2ZSA9IGZ1bmN0aW9uKHN1Ym1pKSB7XG4gICAgaWYgKHN1Ym1pLmNoYW5uZWxJRFMubGVuZ3RoID09IDApIHtcbiAgICAgICRzY29wZS5kZWNsaW5lKHN1Ym1pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3VibWkucGFzc3dvcmQgPSAkcm9vdFNjb3BlLnBhc3N3b3JkO1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgJGh0dHAucHV0KFwiL2FwaS9zdWJtaXNzaW9ucy9zYXZlXCIsIHN1Ym1pKVxuICAgICAgICAudGhlbihmdW5jdGlvbihzdWIpIHtcbiAgICAgICAgICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLnNwbGljZSgkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLmluZGV4T2Yoc3VibWkpLCAxKTtcbiAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJTYXZlZFwiKTtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgIHdpbmRvdy5hbGVydChcIkVSUk9SOiBkaWQgbm90IFNhdmVcIilcbiAgICAgICAgfSlcbiAgICB9XG4gIH1cblxuICAkc2NvcGUuaWdub3JlID0gZnVuY3Rpb24oc3VibWlzc2lvbikge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5kZWxldGUoJy9hcGkvc3VibWlzc2lvbnMvaWdub3JlLycgKyBzdWJtaXNzaW9uLl9pZCArICcvJyArICRyb290U2NvcGUucGFzc3dvcmQpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gJHNjb3BlLnNob3dpbmdFbGVtZW50cy5pbmRleE9mKHN1Ym1pc3Npb24pO1xuICAgICAgICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHdpbmRvdy5hbGVydChcIklnbm9yZWRcIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIHdpbmRvdy5hbGVydChcIkVSUk9SOiBkaWQgbm90IElnbm9yZVwiKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmRlY2xpbmUgPSBmdW5jdGlvbihzdWJtaXNzaW9uKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLmRlbGV0ZSgnL2FwaS9zdWJtaXNzaW9ucy9kZWNsaW5lLycgKyBzdWJtaXNzaW9uLl9pZCArICcvJyArICRyb290U2NvcGUucGFzc3dvcmQpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gJHNjb3BlLnNob3dpbmdFbGVtZW50cy5pbmRleE9mKHN1Ym1pc3Npb24pO1xuICAgICAgICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIHdpbmRvdy5hbGVydChcIkRlY2xpbmVkXCIpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlXG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIHdpbmRvdy5hbGVydChcIkVSUk9SOiBkaWQgbm90IERlY2xpbmVcIik7XG4gICAgICB9KTtcbiAgfVxuXG4gICRzY29wZS55b3V0dWJlID0gZnVuY3Rpb24oc3VibWlzc2lvbikge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL3N1Ym1pc3Npb25zL3lvdXR1YmVJbnF1aXJ5Jywgc3VibWlzc2lvbilcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB3aW5kb3cuYWxlcnQoJ1NlbnQgdG8gWmFjaCcpO1xuICAgICAgfSlcbiAgfVxuXG4gICRzY29wZS5zZW5kTW9yZSA9IGZ1bmN0aW9uKHN1Ym1pc3Npb24pIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAucG9zdCgnL2FwaS9zdWJtaXNzaW9ucy9zZW5kTW9yZUlucXVpcnknLCBzdWJtaXNzaW9uKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIHdpbmRvdy5hbGVydCgnU2VudCBFbWFpbCcpO1xuICAgICAgfSlcbiAgfVxufSk7Il0sInNvdXJjZVJvb3QiOiIvc291cmNlLyJ9
