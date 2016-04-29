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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImRhdGFiYXNlL2RhdGFiYXNlLmpzIiwiZnNhL2ZzYS1wcmUtYnVpbHQuanMiLCJsb2dpbi9sb2dpbi5qcyIsImxvZ2luL29FbWJlZEZhY3RvcnkuanMiLCJwYXkvcGF5LmpzIiwicGF5L3RoYW5reW91LmpzIiwic2NoZWR1bGVyL3NjaGVkdWxlci5qcyIsInN1Ym1pdC9zdWJtaXQuanMiLCJhcnRpc3RUb29scy9TQ1Jlc29sdmUvU0NSZXNvbHZlLmpzIiwiYXV0aC9jb250cm9sbGVycy9hdXRoQ29udHJvbGxlci5qcyIsImF1dGgvc2VydmljZXMvYXV0aFNlcnZpY2UuanMiLCJhdXRoL3NlcnZpY2VzL3Nlc3Npb25TZXJ2aWNlLmpzIiwiZGF0YWJhc2UvYXV0b0VtYWlscy9hdXRvRW1haWxzLmpzIiwiZGF0YWJhc2UvYXV0b0VtYWlscy9hdXRvRW1haWxzTGlzdC5qcyIsImRvd25sb2FkVHJhY2svY29udHJvbGxlcnMvYWRtaW5ETEdhdGUuanMiLCJkb3dubG9hZFRyYWNrL2NvbnRyb2xsZXJzL2Rvd25sb2FkVHJhY2tDb250cm9sbGVyLmpzIiwiZG93bmxvYWRUcmFjay9zZXJ2aWNlcy9hZG1pbkRMR2F0ZVNlcnZpY2UuanMiLCJkb3dubG9hZFRyYWNrL3NlcnZpY2VzL2Rvd25sb2FkVHJhY2tTZXJ2aWNlLmpzIiwiaG9tZS9jb250cm9sbGVycy9hcnRpc3RUb29sc0NvbnRyb2xsZXIuanMiLCJob21lL2NvbnRyb2xsZXJzL2FydGlzdFRvb2xzRG93bmxvYWRHYXR3YXkuanMiLCJob21lL2NvbnRyb2xsZXJzL2FydGlzdFRvb2xzUHJldmlld0NvbnRyb2xsZXIuanMiLCJob21lL2NvbnRyb2xsZXJzL2hvbWVDb250cm9sbGVyLmpzIiwiaG9tZS9zZXJ2aWNlcy9hcnRpc3RzVG9vbHNTZXJ2aWNlLmpzIiwiaG9tZS9zZXJ2aWNlcy9ob21lU2VydmljZS5qcyIsInByZW1pZXJlL2NvbnRyb2xsZXJzL3ByZW1pZXJlQ29udHJvbGxlci5qcyIsInByZW1pZXJlL3NlcnZpY2VzL3ByZW1pZXJlU2VydmljZS5qcyIsInN1Ym1pc3Npb25zL2NvbnRyb2xsZXJzL3N1Ym1pc3Npb25Db250cm9sbGVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQUEsQ0FBQTtBQUNBLE1BQUEsQ0FBQSxHQUFBLEdBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSx1QkFBQSxFQUFBLENBQUEsYUFBQSxFQUFBLFdBQUEsRUFBQSxjQUFBLEVBQUEsV0FBQSxFQUFBLFdBQUEsRUFBQSx3QkFBQSxDQUFBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsa0JBQUEsRUFBQSxpQkFBQSxFQUFBLHFCQUFBLEVBQUE7O0FBRUEsbUJBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7O0FBRUEsb0JBQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7O0NBRUEsQ0FBQSxDQUFBOzs7QUFHQSxHQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsVUFBQSxFQUFBLFdBQUEsRUFBQSxNQUFBLEVBQUEsYUFBQSxFQUFBLGNBQUEsRUFBQSxTQUFBLEVBQUE7Ozs7OztBQU1BLFdBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7O0FBRUEsYUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7O0dBRUEsQ0FBQSxDQUFBOzs7O0FBSUEsWUFBQSxDQUFBLEdBQUEsQ0FBQSxtQkFBQSxFQUFBLFVBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxRQUFBLEVBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBZ0NBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFHQSxHQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsRUFBQSxDQUFBLFlBQUE7QUFDQSxTQUFBO0FBQ0EsU0FBQSxFQUFBO0FBQ0EsY0FBQSxFQUFBLEdBQUE7QUFDQSxhQUFBLEVBQUEsR0FBQTtLQUNBO0FBQ0EsUUFBQSxFQUFBLGNBQUEsS0FBQSxFQUFBLE9BQUEsRUFBQSxVQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxVQUFBLFdBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxNQUFBLENBQUEsWUFBQTtBQUNBLGVBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxtQkFBQSxFQUFBLEtBQUE7QUFDQSxlQUFBLEVBQUEsRUFBQTtXQUNBLENBQUE7O0FBRUEsY0FBQSxXQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLElBQUEsWUFBQSxJQUFBLFdBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxXQUFBLEVBQUE7QUFDQSxpQkFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLHFCQUFBLEVBQUEsSUFBQTtBQUNBLGlCQUFBLEVBQUEsdUNBQUE7YUFDQSxDQUFBO0FBQ0EsbUJBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxtQkFBQTtXQUNBOztBQUVBLGNBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxHQUFBLEVBQUEsR0FBQSxJQUFBLEdBQUEsSUFBQSxFQUFBO0FBQ0EsaUJBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxxQkFBQSxFQUFBLElBQUE7QUFDQSxpQkFBQSxFQUFBLDRDQUFBO2FBQ0EsQ0FBQTtBQUNBLG1CQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsbUJBQUE7V0FDQTtBQUNBLGVBQUEsQ0FBQSxRQUFBLEdBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUEsQ0FBQTs7QUNuR0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxpQkFBQTtBQUNBLGVBQUEsRUFBQSwyQkFBQTtBQUNBLGNBQUEsRUFBQSxvQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsU0FBQSxDQUFBLGlCQUFBLEVBQUEsQ0FBQSxRQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxTQUFBO0FBQ0EsWUFBQSxFQUFBLElBQUE7QUFDQSxTQUFBLEVBQUEsSUFBQTtBQUNBLFlBQUEsRUFBQSw4REFBQSxHQUNBLG1IQUFBLEdBQ0EsUUFBQTtBQUNBLFFBQUEsRUFBQSxjQUFBLE1BQUEsRUFBQSxJQUFBLEVBQUEsTUFBQSxFQUFBLFVBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxFQUFBLENBQUEsY0FBQSxFQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsWUFBQSxVQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEdBQUEsVUFBQSxDQUFBO0FBQ0EsWUFBQSxVQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUE7U0FDQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsb0JBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxXQUFBLEVBQUEsTUFBQSxFQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBO0FBQ0EsUUFBQSxFQUFBLFVBQUE7QUFDQSxTQUFBLEVBQUEsVUFBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsT0FBQTtBQUNBLFNBQUEsRUFBQSxPQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxNQUFBO0FBQ0EsU0FBQSxFQUFBLE1BQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLEtBQUE7QUFDQSxTQUFBLEVBQUEsT0FBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsT0FBQTtBQUNBLFNBQUEsRUFBQSxPQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxhQUFBO0FBQ0EsU0FBQSxFQUFBLGFBQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLFdBQUE7QUFDQSxTQUFBLEVBQUEsV0FBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsa0JBQUE7QUFDQSxTQUFBLEVBQUEsV0FBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsVUFBQTtBQUNBLFNBQUEsRUFBQSxhQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxXQUFBO0FBQ0EsU0FBQSxFQUFBLGNBQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLFNBQUE7QUFDQSxTQUFBLEVBQUEsWUFBQTtHQUNBLEVBQUE7QUFDQSxRQUFBLEVBQUEsU0FBQTtBQUNBLFNBQUEsRUFBQSxZQUFBO0dBQ0EsRUFBQTtBQUNBLFFBQUEsRUFBQSxVQUFBO0FBQ0EsU0FBQSxFQUFBLFVBQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLGdCQUFBO0FBQ0EsU0FBQSxFQUFBLGFBQUE7R0FDQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLFlBQUE7QUFDQSxTQUFBLEVBQUEsV0FBQTtHQUNBLENBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxxQkFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxLQUFBLEdBQUE7QUFDQSxZQUFBLEVBQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxFQUFBO0FBQ0EsU0FBQSxFQUFBLEVBQUE7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLEdBQUEsR0FBQTtBQUNBLFFBQUEsRUFBQSxTQUFBO0FBQ0EsU0FBQSxFQUFBLENBQUE7QUFDQSxXQUFBLEVBQUEsS0FBQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsVUFBQSxHQUFBO0FBQ0EsaUJBQUEsRUFBQSxFQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBO0tBQ0EsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsdUJBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGdGQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBO0tBQ0EsQ0FBQSxTQUNBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxrQkFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLEtBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxJQUFBLFNBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxNQUFBLEdBQUEsSUFBQSxDQUFBO0tBQ0EsTUFBQSxJQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxJQUFBLGFBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxNQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0E7QUFDQSxRQUFBLE9BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLEdBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxTQUFBLEdBQUEsT0FBQSxDQUFBO0tBQ0E7QUFDQSxRQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLEdBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxTQUFBLEdBQUEsT0FBQSxDQUFBO0tBQ0E7QUFDQSxRQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxFQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxTQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsT0FBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsZUFBQSxHQUFBLENBQUEsS0FBQSxLQUFBLElBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxlQUFBLEdBQUEsQ0FBQSxLQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7S0FDQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxlQUFBLEVBQUEsS0FBQSxDQUFBLGVBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLGVBQUEsQ0FBQTtBQUNBLFFBQUEsSUFBQSxHQUFBO0FBQ0EsV0FBQSxFQUFBLEtBQUE7QUFDQSxjQUFBLEVBQUEsVUFBQSxDQUFBLFFBQUE7S0FDQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLHlCQUFBLEVBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLHFCQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxnQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLG9CQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxXQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxHQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLFNBQUEsR0FBQSxPQUFBLENBQUE7S0FDQTtBQUNBLFFBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxXQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxHQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLFNBQUEsR0FBQSxPQUFBLENBQUE7S0FDQTtBQUNBLFFBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxLQUFBLEVBQUEsS0FBQSxDQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsV0FBQSxDQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsSUFBQSxHQUFBO0FBQ0EsV0FBQSxFQUFBLEtBQUE7QUFDQSxjQUFBLEVBQUEsVUFBQSxDQUFBLFFBQUE7S0FDQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLDRCQUFBLEVBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLGNBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLDJCQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxnQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLFFBQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxHQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsVUFBQSxFQUFBLFFBQUE7QUFDQSxjQUFBLEVBQUEsUUFBQTtLQUNBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxxQkFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSwyQkFBQSxHQUFBLEtBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLHFCQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSwwQkFBQSxFQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBO0FBQ0EscUJBQUEsRUFBQSxFQUFBO09BQ0EsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxpQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLDRCQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7O0FBR0EsUUFBQSxDQUFBLEVBQUEsQ0FBQSxjQUFBLEVBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxRQUFBLFVBQUEsR0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLEVBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsR0FBQSxVQUFBLENBQUE7QUFDQSxRQUFBLFVBQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsZ0JBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQy9OQSxDQUFBLFlBQUE7O0FBRUEsY0FBQSxDQUFBOztBQUVBLE1BQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxFQUFBLE1BQUEsSUFBQSxLQUFBLENBQUEsd0JBQUEsQ0FBQSxDQUFBOztBQUVBLE1BQUEsR0FBQSxHQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsYUFBQSxFQUFBLEVBQUEsQ0FBQSxDQUFBOztBQUVBLEtBQUEsQ0FBQSxPQUFBLENBQUEsWUFBQSxFQUFBLFlBQUE7QUFDQSxRQUFBLENBQUEsTUFBQSxDQUFBLEVBQUEsRUFBQSxNQUFBLElBQUEsS0FBQSxDQUFBLHNCQUFBLENBQUEsQ0FBQTtBQUNBLFdBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQSxDQUFBOztBQUVBLEtBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLFVBQUEsRUFBQTtBQUNBLFdBQUE7QUFDQSxRQUFBLEVBQUEsWUFBQSxTQUFBLEVBQUEsUUFBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxFQUFBLENBQUEsU0FBQSxFQUFBLFlBQUE7QUFDQSxjQUFBLElBQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxvQkFBQSxDQUFBLE1BQUEsQ0FBQSxZQUFBO0FBQ0Esb0JBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO1dBQ0EsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0E7QUFDQSxVQUFBLEVBQUEsY0FBQSxTQUFBLEVBQUEsSUFBQSxFQUFBLFFBQUEsRUFBQTtBQUNBLGtCQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsRUFBQSxJQUFBLEVBQUEsWUFBQTtBQUNBLGNBQUEsSUFBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLG9CQUFBLENBQUEsTUFBQSxDQUFBLFlBQUE7QUFDQSxnQkFBQSxRQUFBLEVBQUE7QUFDQSxzQkFBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7YUFDQTtXQUNBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBO0tBQ0EsQ0FBQTtHQUNBLENBQUEsQ0FBQTs7QUFFQSxLQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFFBQUEsYUFBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxhQUFBLFdBQUEsR0FBQTtBQUNBLGFBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxrQ0FBQSxDQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxtQkFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUEsQ0FBQSxRQUFBO0FBQ0Esb0JBQUEsRUFBQSxJQUFBLENBQUEsV0FBQTtBQUNBLGFBQUEsRUFBQSxjQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxTQUFBLEdBQUE7QUFDQSxhQUFBLGFBQUEsQ0FBQTtLQUNBOztBQUVBLFdBQUE7QUFDQSxpQkFBQSxFQUFBLFdBQUE7QUFDQSxlQUFBLEVBQUEsU0FBQTtBQUNBLGVBQUEsRUFBQSxTQUFBO0tBQ0EsQ0FBQTtHQUNBLENBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBeUhBLENBQUEsRUFBQSxDQUFBO0FDdExBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsUUFBQTtBQUNBLGVBQUEsRUFBQSxxQkFBQTtBQUNBLGNBQUEsRUFBQSxzQkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFHQSxHQUFBLENBQUEsVUFBQSxDQUFBLHNCQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsV0FBQSxFQUFBLGFBQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLGVBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsV0FBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsS0FBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxFQUFBO0FBQ0EsY0FBQSxFQUFBLE1BQUEsQ0FBQSxRQUFBO0tBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxlQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxHQUFBLFFBQUEsQ0FBQTtLQUNBLENBQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTs7QUFFQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxXQUFBLEdBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLGFBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSwwQkFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEdBQUEsQ0FBQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxVQUFBLENBQUEsUUFBQTtPQUNBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsYUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLGFBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsRUFBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsRUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEseUJBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDOURBLEdBQUEsQ0FBQSxPQUFBLENBQUEsZUFBQSxFQUFBLFlBQUE7QUFDQSxTQUFBO0FBQ0EsYUFBQSxFQUFBLG1CQUFBLEdBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxtQ0FBQSxHQUFBLEdBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxHQUFBLFFBQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsS0FBQTtBQUNBLGlCQUFBLEVBQUEsR0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ1ZBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsb0JBQUE7QUFDQSxlQUFBLEVBQUEsaUJBQUE7QUFDQSxjQUFBLEVBQUEsZUFBQTtBQUNBLFdBQUEsRUFBQTtBQUNBLGNBQUEsRUFBQSxrQkFBQSxLQUFBLEVBQUE7QUFDQSxlQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsZUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsaUJBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBO0FBQ0EsZ0JBQUEsRUFBQSxvQkFBQSxLQUFBLEVBQUEsWUFBQSxFQUFBO0FBQ0EsZUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDBCQUFBLEdBQUEsWUFBQSxDQUFBLFlBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGlCQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7T0FDQTtBQUNBLFdBQUEsRUFBQSxlQUFBLFVBQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLEdBQUEsVUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLGlCQUFBLEtBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBO0tBQ0E7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxtQkFBQSxFQUFBLFlBQUE7QUFDQSxTQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsV0FBQSxVQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxlQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsVUFBQSxFQUFBLEtBQUEsRUFBQSxRQUFBLEVBQUEsVUFBQSxFQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxVQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLE1BQUEsVUFBQSxDQUFBLElBQUEsRUFBQSxNQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLEtBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxJQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQSxhQUFBLEVBQUEsS0FBQTtBQUNBLGFBQUEsRUFBQSxHQUFBO0dBQ0EsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLEVBQUEsRUFBQTtBQUNBLFdBQUEsVUFBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxZQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLHFCQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsR0FBQSxLQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGdCQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFFBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsZ0JBQUEsQ0FBQSxFQUFBLENBQUEsV0FBQSxDQUFBLEdBQUEsS0FBQSxDQUFBO0dBQ0EsQ0FBQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0Esa0JBQUEsRUFBQSxVQUFBLENBQUEsVUFBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsWUFBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLFNBQUEsSUFBQSxHQUFBLElBQUEsTUFBQSxDQUFBLGdCQUFBLEVBQUE7QUFDQSxVQUFBLE1BQUEsQ0FBQSxnQkFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsWUFBQSxJQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxFQUFBLEVBQUE7QUFDQSxpQkFBQSxFQUFBLENBQUEsV0FBQSxJQUFBLEdBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQTtPQUNBO0tBQ0E7QUFDQSxRQUFBLE1BQUEsQ0FBQSxRQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTtBQUNBLFdBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxLQUFBLElBQUEsQ0FBQSxFQUFBO0FBQ0EsVUFBQSxNQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLHFCQUFBLEdBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLG1CQUFBLEVBQUEsSUFBQTtBQUNBLHFCQUFBLEVBQUEsb0JBQUE7QUFDQSxvQkFBQSxFQUFBLHlCQUFBO0FBQ0EsZUFBQSxFQUFBLE1BQUE7U0FDQSxDQUFBLENBQUE7T0FDQSxNQUFBO0FBQ0EsY0FBQSxDQUFBLFdBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtPQUNBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxlQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEscUJBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtLQUNBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxRQUFBLFVBQUEsR0FBQTtBQUNBLGNBQUEsRUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxVQUFBO0FBQ0EsZ0JBQUEsRUFBQSxVQUFBLENBQUEsVUFBQTtLQUNBLENBQUE7QUFDQSxTQUFBLElBQUEsR0FBQSxJQUFBLE1BQUEsQ0FBQSxnQkFBQSxFQUFBO0FBQ0EsVUFBQSxNQUFBLENBQUEsZ0JBQUEsQ0FBQSxHQUFBLENBQUEsRUFBQTtBQUNBLFlBQUEsSUFBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsRUFBQSxFQUFBO0FBQ0EsaUJBQUEsRUFBQSxDQUFBLFdBQUEsSUFBQSxHQUFBLENBQUE7U0FDQSxDQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO09BQ0E7S0FDQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsNkJBQUEsRUFBQSxVQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUdBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLE9BQUEsQ0FBQSxTQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQTtLQUNBLE1BQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxJQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUE7S0FDQTtBQUNBLFFBQUEsTUFBQSxDQUFBLFFBQUEsRUFBQSxNQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxLQUNBLE1BQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQTs7QUFFQSxVQUFBLENBQUEsZ0JBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLGdCQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsQ0FBQSxJQUFBLElBQUEsR0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBOztBQUVBLFdBQUEsQ0FBQSxTQUFBLEdBQUEsT0FBQSxDQUFBLFNBQUEsR0FBQSxLQUFBLEdBQUEsSUFBQSxDQUFBO0dBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLHlCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsRUFFQSxDQUFBLENBQUE7QUN6SUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxXQUFBO0FBQ0EsZUFBQSxFQUFBLHNCQUFBO0FBQ0EsY0FBQSxFQUFBLG9CQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsb0JBQUEsRUFBQSxVQUFBLEtBQUEsRUFBQSxNQUFBLEVBQUEsU0FBQSxFQUFBO0FBQ0EsUUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxPQUFBLENBQUEsR0FBQSxDQUFBLG1DQUFBLEVBQUEsU0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLE1BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsRUFBQSxFQUFBO0FBQ0EsUUFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFNBQUEsQ0FBQSw0Q0FBQSxDQUFBLENBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUN0QkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxZQUFBO0FBQ0EsZUFBQSxFQUFBLDZCQUFBO0FBQ0EsY0FBQSxFQUFBLHFCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUdBLEdBQUEsQ0FBQSxVQUFBLENBQUEscUJBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxXQUFBLEVBQUEsT0FBQSxFQUFBOztBQUVBLFFBQUEsQ0FBQSxZQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxNQUFBLElBQUEsR0FBQSxVQUFBLENBQUEsYUFBQSxDQUFBO0FBQ0EsTUFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7R0FDQTtBQUNBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsUUFBQSxHQUFBLGNBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsT0FBQSxHQUFBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsSUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO0dBRUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsV0FBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBLGVBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLHFCQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsT0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxFQUFBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsT0FBQSxHQUFBLENBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsVUFBQSxHQUFBLEVBQUEsSUFBQSxFQUFBO0FBQ0EsUUFBQSxLQUFBLEdBQUEsSUFBQSxJQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsS0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQUEsR0FBQSxJQUFBLEVBQUEsT0FBQTtBQUNBLFVBQUEsQ0FBQSxXQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxXQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsWUFBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLFNBQUEsSUFBQSxHQUFBLEVBQUE7QUFDQSxVQUFBLE9BQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLGFBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsU0FBQSxHQUFBO0FBQ0EsaUJBQUEsRUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLFNBQUE7QUFDQSxXQUFBLEVBQUEsT0FBQTtBQUNBLFlBQUEsRUFBQSxLQUFBO09BQ0EsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsSUFBQSxDQUFBO0tBQ0EsTUFBQTtBQUNBLFlBQUEsQ0FBQSxZQUFBLEdBQUEsb0NBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsb0NBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxRQUFBLENBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsS0FBQTtBQUNBLGlCQUFBLEVBQUEsR0FBQTtPQUNBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxTQUFBLENBQUEsT0FBQSxHQUFBLFNBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxZQUFBLEdBQUEsU0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsRUFBQTtBQUNBLFNBQUEsRUFBQSxNQUFBLENBQUEsWUFBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxTQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFNBQUEsQ0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxVQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLFlBQUEsRUFBQTtBQUNBLGVBQUEsRUFBQSxRQUFBLENBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsS0FBQTtBQUNBLGlCQUFBLEVBQUEsR0FBQTtPQUNBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsR0FBQSxTQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEdBQUEsUUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFdBQUEsVUFBQSxDQUFBLGNBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsR0FBQSxHQUFBLEdBQUEsVUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsV0FBQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsaUJBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsR0FBQSxHQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLHdCQUFBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBLE1BQUE7QUFDQSxVQUFBLFdBQUEsR0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGVBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0FBQ0EsaUJBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtBQUNBLFVBQUEsTUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFNBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLG1CQUFBLENBQUEsQ0FBQTtLQUNBLE1BQUE7QUFDQSxVQUFBLE1BQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxhQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsRUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGVBQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxXQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxtQkFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsQ0FBQTtXQUNBLENBQUEsQ0FBQTtBQUNBLHFCQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsc0JBQUEsQ0FBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0EsTUFBQTtBQUNBLGNBQUEsQ0FBQSxRQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxFQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsZUFBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxjQUFBLFdBQUEsR0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLG1CQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxDQUFBO1dBQ0EsQ0FBQSxDQUFBO0FBQ0EscUJBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7U0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLHNCQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsV0FBQSxHQUFBLDhDQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLEdBQUEsWUFBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLGlDQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLEdBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxHQUFBLE1BQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLEdBQUEsZ0JBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxJQUFBLEdBQUEsU0FBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7Ozs7O0FBTUEsUUFBQSxDQUFBLFNBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFNBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsRUFBQSxPQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxZQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsRUFBQTtBQUNBLFNBQUEsRUFBQSxNQUFBLENBQUEsWUFBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxvQkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFFBQUEsS0FBQSxJQUFBLENBQUEsRUFBQSxPQUFBO0FBQ0EsUUFBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxRQUFBLEtBQUEsSUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBLE9BQUE7QUFDQSxRQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsV0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsY0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQkEsUUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsY0FBQSxDQUFBLFlBQUE7QUFDQSxZQUFBLENBQUEsV0FBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLENBQUEsbUNBQUEsR0FBQSxHQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsaUJBQUEsRUFBQSxRQUFBLENBQUEsY0FBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLEdBQUEsUUFBQSxDQUFBO0FBQ0EsbUJBQUEsRUFBQSxLQUFBO0FBQ0EsbUJBQUEsRUFBQSxHQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0EsRUFBQSxFQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGNBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxZQUFBO0FBQ0EsV0FBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLE1BQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLENBQUEsbUNBQUEsR0FBQSxNQUFBLEVBQUE7QUFDQSxpQkFBQSxFQUFBLFFBQUEsQ0FBQSxjQUFBLENBQUEsTUFBQSxHQUFBLFFBQUEsQ0FBQTtBQUNBLG1CQUFBLEVBQUEsS0FBQTtBQUNBLG1CQUFBLEVBQUEsR0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBLEVBQUEsRUFBQSxDQUFBLENBQUE7R0FDQSxDQUFBO0FBQ0EsTUFBQSxNQUFBLENBQUEsT0FBQSxJQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLGNBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0dBQ0E7QUFDQSxRQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsU0FBQSxjQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsTUFBQSxRQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsTUFBQSxLQUFBLEdBQUEsSUFBQSxJQUFBLEVBQUEsQ0FBQTtBQUNBLE9BQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUE7QUFDQSxRQUFBLE1BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsSUFBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxNQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtBQUNBLFFBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFNBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxFQUFBLEVBQUEsQ0FBQSxFQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQTtLQUNBO0FBQ0EsYUFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLEVBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtHQUNBO0FBQ0EsU0FBQSxRQUFBLENBQUE7Q0FDQTtBQ3ZUQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsWUFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFNBQUE7QUFDQSxlQUFBLEVBQUEsNEJBQUE7QUFDQSxjQUFBLEVBQUEsc0JBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxzQkFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBOztBQUVBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSx5QkFBQSxFQUFBO0FBQ0EsU0FBQSxFQUFBLE1BQUEsQ0FBQSxHQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLENBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsQ0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxDQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxlQUFBLEVBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLEtBQUE7QUFDQSxpQkFBQSxFQUFBLEdBQUE7T0FDQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEdBQUEsU0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsR0FBQSxRQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLEtBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLDJCQUFBLENBQUEsQ0FBQTtLQUNBLE1BQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGlCQUFBLENBQUEsQ0FBQTtLQUNBLE1BQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxJQUFBLENBQUEsa0JBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxNQUFBLENBQUEsVUFBQSxDQUFBLEtBQUE7QUFDQSxlQUFBLEVBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBO0FBQ0EsWUFBQSxFQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsSUFBQTtBQUNBLGFBQUEsRUFBQSxNQUFBLENBQUEsVUFBQSxDQUFBLEtBQUE7QUFDQSxnQkFBQSxFQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsUUFBQTtBQUNBLGtCQUFBLEVBQUEsRUFBQTtBQUNBLGtCQUFBLEVBQUEsRUFBQTtPQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxlQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEseURBQUEsQ0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtPQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLCtCQUFBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQTtBQ2hFQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FDQSxLQUFBLENBQUEsV0FBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFlBQUE7QUFDQSxlQUFBLEVBQUEseUNBQUE7QUFDQSxjQUFBLEVBQUEscUJBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxxQkFBQSxFQUFBLFVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQSxZQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSx5QkFBQSxFQUFBO0FBQ0EsU0FBQSxFQUFBLE1BQUEsQ0FBQSxHQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxFQUFBLElBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUN2QkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQ0EsS0FBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxRQUFBO0FBQ0EsVUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxJQUFBO0tBQ0E7QUFDQSxlQUFBLEVBQUEsMEJBQUE7QUFDQSxjQUFBLEVBQUEsZ0JBQUE7R0FDQSxDQUFBLENBQ0EsS0FBQSxDQUFBLFFBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxTQUFBO0FBQ0EsZUFBQSxFQUFBLDJCQUFBO0FBQ0EsY0FBQSxFQUFBLGdCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsZ0JBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsWUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsU0FBQSxFQUFBLE9BQUEsRUFBQSxXQUFBLEVBQUEsY0FBQSxFQUFBLE1BQUEsRUFBQTtBQUNBLFFBQUEsQ0FBQSxRQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLE9BQUEsRUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEtBQUE7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFNBQUEsR0FBQTtBQUNBLGlCQUFBLEVBQUEseUJBQUE7QUFDQSxZQUFBLENBQUEsYUFBQSxHQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUE7QUFDQSxtQkFBQSxFQUFBLHFCQUFBO0FBQ0Esa0JBQUEsRUFBQSxnQkFBQTtBQUNBLGFBQUEsRUFBQSxNQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLEtBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEtBQUE7S0FDQSxDQUFBO0FBQ0EsZUFBQSxDQUNBLEtBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLG1CQUFBLENBQUEsU0FDQSxDQUFBLGdCQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLG1CQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsVUFBQSxHQUFBLENBQUEsTUFBQSxLQUFBLEdBQUEsSUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsRUFBQTtBQUNBLHNCQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsRUFBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQTtPQUNBLE1BQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsYUFBQSxFQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQTtBQUNBLGlCQUFBLEVBQUEsSUFBQTtTQUNBLENBQUE7T0FDQTtLQUNBOztBQUVBLGFBQUEsZ0JBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsV0FBQSxFQUFBLGtDQUFBO0FBQ0EsZUFBQSxFQUFBLElBQUE7T0FDQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxpQkFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLFlBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7O0FBR0EsUUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEtBQUE7S0FDQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsSUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLGVBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxXQUFBLEVBQUEsK0NBQUE7QUFDQSxlQUFBLEVBQUEsSUFBQTtPQUNBLENBQUE7QUFDQSxhQUFBO0tBQ0E7QUFDQSxlQUFBLENBQ0EsTUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsb0JBQUEsQ0FBQSxTQUNBLENBQUEsaUJBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsb0JBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxpQkFBQSxDQUFBLEdBQUEsRUFBQSxFQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxXQUFBLEdBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLGFBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSw0QkFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEdBQUEsQ0FBQSxXQUFBO0FBQ0EsZ0JBQUEsRUFBQSxNQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0Esb0JBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsWUFBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxFQUFBLENBQUEsK0JBQUEsRUFBQTtBQUNBLHNCQUFBLEVBQUEsWUFBQSxDQUFBLFVBQUE7U0FDQSxDQUFBLENBQUE7QUFDQSxlQUFBO09BQ0E7QUFDQSxZQUFBLENBQUEsRUFBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSx5QkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUN4SEEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLEVBQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsV0FBQSxLQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEsTUFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxTQUFBO0FBQ0EsU0FBQSxFQUFBLEtBQUE7QUFDQSxVQUFBLEVBQUEsTUFBQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUEsQ0FBQTs7QUNaQSxHQUFBLENBQUEsT0FBQSxDQUFBLGdCQUFBLEVBQUEsQ0FBQSxVQUFBLEVBQUEsVUFBQSxRQUFBLEVBQUE7O0FBRUEsV0FBQSxNQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLFVBQUEsR0FBQTtBQUNBLFlBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLE9BQUEsR0FBQTtBQUNBLFdBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFNBQUE7QUFDQSxVQUFBLEVBQUEsTUFBQTtBQUNBLGNBQUEsRUFBQSxVQUFBO0FBQ0EsV0FBQSxFQUFBLE9BQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBLENBQUE7O0FDckJBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxlQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsZ0NBQUE7QUFDQSxlQUFBLEVBQUEsd0NBQUE7QUFDQSxjQUFBLEVBQUEsc0JBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLGdCQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsNkNBQUE7QUFDQSxlQUFBLEVBQUEsd0NBQUE7QUFDQSxjQUFBLEVBQUEsc0JBQUE7R0FtQkEsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsc0JBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxZQUFBLEVBQUEsV0FBQSxFQUFBO0FBQ0EsUUFBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUE7O0FBR0EsUUFBQSxDQUFBLGFBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxNQUFBLFlBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsYUFBQSxHQUFBLElBQUEsQ0FBQTtHQUNBOzs7QUFHQSxRQUFBLENBQUEsUUFBQSxHQUFBO0FBQ0EsWUFBQSxFQUFBLEtBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsWUFBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLEdBQUEsQ0FBQSxzQ0FBQSxHQUFBLFlBQUEsQ0FBQSxVQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLFFBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsUUFBQSxHQUFBLFFBQUEsQ0FBQTtTQUNBLE1BQUE7QUFDQSxnQkFBQSxDQUFBLFFBQUEsR0FBQSxFQUFBLENBQUE7U0FDQTtPQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLDhCQUFBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBLE1BQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7O0FBR0EsUUFBQSxDQUFBLElBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLENBQUEsSUFBQSxDQUFBLDJCQUFBLEVBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSx1QkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7OztBQWdCQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUE7QUFDQSxTQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxZQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBO0tBQ0EsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBO0NBRUEsQ0FBQSxDQUFBO0FDMUdBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxnQkFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLDRCQUFBO0FBQ0EsZUFBQSxFQUFBLDRDQUFBO0FBQ0EsY0FBQSxFQUFBLDBCQUFBO0FBQ0EsV0FBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLG1CQUFBLEtBQUEsRUFBQTtBQUNBLGVBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSwwQkFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGNBQUEsUUFBQSxFQUFBO0FBQ0EsbUJBQUEsUUFBQSxDQUFBO1dBQ0EsTUFBQTtBQUNBLG1CQUFBO0FBQ0EscUJBQUEsRUFBQSxnQkFBQTthQUNBLENBQUE7V0FDQTtTQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsZUFBQSxDQUFBLDhCQUFBLENBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBO0tBQ0E7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSwwQkFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFdBQUEsRUFBQSxTQUFBLEVBQUE7QUFDQSxRQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxTQUFBLEdBQUEsU0FBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXVCQSxRQUFBLENBQUEsSUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsMEJBQUEsRUFBQSxNQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsRUFBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFdBQUEsQ0FBQSxnQ0FBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7QUFnQkEsUUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxHQUFBLFFBQUEsQ0FBQTtLQUNBLENBQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtDQUVBLENBQUEsQ0FBQTtBQ3ZGQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxLQUFBLENBQUEsY0FBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLHFCQUFBO0FBQ0EsZUFBQSxFQUFBLHlDQUFBO0FBQ0EsY0FBQSxFQUFBLHVCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxrQkFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLDBCQUFBO0FBQ0EsZUFBQSxFQUFBLDhDQUFBO0FBQ0EsY0FBQSxFQUFBLHVCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxrQkFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLHFDQUFBO0FBQ0EsZUFBQSxFQUFBLHlDQUFBO0FBQ0EsY0FBQSxFQUFBLHVCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUdBLEdBQUEsQ0FBQSxVQUFBLENBQUEsdUJBQUEsRUFBQSxDQUFBLFlBQUEsRUFDQSxRQUFBLEVBQ0EsY0FBQSxFQUNBLFFBQUEsRUFDQSxPQUFBLEVBQ0EsV0FBQSxFQUNBLFNBQUEsRUFDQSxXQUFBLEVBQ0EsZ0JBQUEsRUFDQSxvQkFBQSxFQUNBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxZQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxTQUFBLEVBQUEsT0FBQSxFQUFBLFNBQUEsRUFBQSxjQUFBLEVBQUEsa0JBQUEsRUFBQTs7QUFFQSxRQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxPQUFBLEVBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxLQUFBO0dBQ0EsQ0FBQTs7OztBQUlBLFFBQUEsQ0FBQSxLQUFBLEdBQUE7QUFDQSxrQkFBQSxFQUFBLGFBQUE7QUFDQSxjQUFBLEVBQUEsbUJBQUE7QUFDQSxtQkFBQSxFQUFBLDhCQUFBO0FBQ0EsV0FBQSxFQUFBLEVBQUE7QUFDQSxRQUFBLEVBQUEsS0FBQTtBQUNBLFdBQUEsRUFBQSxLQUFBO0FBQ0EsVUFBQSxFQUFBLEtBQUE7QUFDQSxXQUFBLEVBQUEsQ0FBQTtBQUNBLFNBQUEsRUFBQSxFQUFBO0FBQ0EsWUFBQSxFQUFBLDhCQUFBO0FBQ0EsY0FBQSxFQUFBLEVBQUE7QUFDQSxRQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsRUFBQSxLQUFBO0tBQ0EsQ0FBQTtBQUNBLGFBQUEsRUFBQSxDQUFBO0FBQ0EsU0FBQSxFQUFBLEVBQUE7QUFDQSxZQUFBLEVBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLEVBQUE7S0FDQSxDQUFBO0dBQ0EsQ0FBQTs7OztBQUlBLFFBQUEsQ0FBQSxtQkFBQSxHQUFBLEVBQUEsQ0FBQTs7OztBQUlBLFFBQUEsQ0FBQSxhQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLEtBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsU0FBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLHFCQUFBLFlBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxHQUFBLFlBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxhQUFBLEdBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsSUFBQTtBQUNBLG1CQUFBLEVBQUEsa0JBQUE7QUFDQSxrQkFBQSxFQUFBLHVCQUFBO0FBQ0EsYUFBQSxFQUFBLE1BQUE7T0FDQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsYUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0dBQ0EsQ0FBQTs7O0FBR0EsUUFBQSxDQUFBLE9BQUEsR0FBQSxFQUFBLENBQUE7Ozs7QUFJQSxXQUFBLG9CQUFBLEdBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxLQUFBO0tBQ0EsQ0FBQTs7QUFFQSxVQUFBLENBQUEsS0FBQSxHQUFBO0FBQ0Esb0JBQUEsRUFBQSxhQUFBO0FBQ0EsZ0JBQUEsRUFBQSxtQkFBQTtBQUNBLHFCQUFBLEVBQUEsOEJBQUE7QUFDQSxhQUFBLEVBQUEsRUFBQTtBQUNBLFVBQUEsRUFBQSxLQUFBO0FBQ0EsYUFBQSxFQUFBLEtBQUE7QUFDQSxZQUFBLEVBQUEsS0FBQTtBQUNBLGFBQUEsRUFBQSxDQUFBO0FBQ0EsV0FBQSxFQUFBLEVBQUE7QUFDQSxjQUFBLEVBQUEsOEJBQUE7QUFDQSxnQkFBQSxFQUFBLEVBQUE7QUFDQSxVQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0EscUJBQUEsRUFBQSxLQUFBO09BQ0EsQ0FBQTtBQUNBLGVBQUEsRUFBQSxDQUFBO0FBQ0EsV0FBQSxFQUFBLEVBQUE7QUFDQSxjQUFBLEVBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxFQUFBO0FBQ0EsVUFBQSxFQUFBLEVBQUE7T0FDQSxDQUFBO0tBQ0EsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxPQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOzs7QUFHQSxRQUFBLENBQUEsV0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLFlBQUEsQ0FBQSxTQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsa0JBQUEsQ0FBQSxZQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7Ozs7OztLQU1BO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsY0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxLQUFBLEVBQUEsRUFBQTtVQVdBLDZCQUFBLEdBQUEsU0FBQSw2QkFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLGVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxFQUFBLGNBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsZ0JBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsY0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLGVBQUEsRUFBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEdBQUEsZUFBQSxDQUFBLENBQUE7T0FDQTs7VUFFQSxpQkFBQSxHQUFBLFNBQUEsaUJBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxTQUFBLEVBQUEsU0FBQSxFQUFBLFVBQUEsRUFBQSxTQUFBLEVBQUEsWUFBQSxFQUFBLFdBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsaUJBQUEsRUFBQSxJQUFBLENBQUEsT0FBQTtBQUNBLG1CQUFBLEVBQUEsSUFBQSxDQUFBLEdBQUE7YUFDQSxDQUFBLENBQUE7V0FDQTtTQUNBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxnQkFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO09BQ0E7O1VBRUEsV0FBQSxHQUFBLFNBQUEsV0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLGFBQUEsQ0FBQSw2QkFBQSxDQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtPQUNBOztBQXZDQSxZQUFBLENBQUEsZ0JBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLHdCQUFBLENBQ0EsV0FBQSxDQUFBO0FBQ0EsV0FBQSxFQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsUUFBQTtPQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsNkJBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxpQkFBQSxDQUFBLFNBQ0EsQ0FBQSxXQUFBLENBQUEsQ0FBQTtLQWdDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFFBQUEsTUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FDQSxXQUFBLENBQUE7QUFDQSxTQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsR0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxNQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsU0FDQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLG1CQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsV0FBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLFlBQUEsRUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEVBQUE7QUFDQSxRQUFBLEVBQUEsRUFBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsY0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsaUJBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FDQSxXQUFBLENBQUE7QUFDQSxTQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsR0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxNQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLG9CQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFHQSxRQUFBLENBQUEsWUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFNBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxFQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUE7S0FDQTs7QUFFQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLFlBQUEsRUFBQSw4QkFBQTtBQUNBLGNBQUEsRUFBQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFNBQUEsR0FBQSxZQUFBOzs7QUFHQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxFQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxZQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxZQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsYUFBQSxXQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsVUFBQSxRQUFBLEdBQUEsUUFBQSxDQUFBLGFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsVUFBQSxRQUFBLENBQUEsSUFBQSxJQUFBLEVBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsSUFBQSxHQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUE7T0FDQTtBQUNBLGFBQUEsUUFBQSxDQUFBO0tBQ0E7O0FBRUEsUUFBQSxRQUFBLEdBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLFFBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxHQUFBLEtBQUEsSUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxRQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsRUFBQTtBQUNBLGFBQUEsS0FBQSxDQUFBO0tBQ0E7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZ0JBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLGlCQUFBLENBQUEsQ0FBQTtBQUNBLGFBQUEsS0FBQSxDQUFBO0tBQ0E7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUEsT0FBQSxHQUFBLElBQUEsUUFBQSxFQUFBLENBQUE7Ozs7O0FBS0EsU0FBQSxJQUFBLElBQUEsSUFBQSxNQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0E7Ozs7QUFJQSxRQUFBLE9BQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsV0FBQSxDQUFBLENBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxFQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQTs7OztBQUlBLFFBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLEVBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQTtBQUNBLGFBQUEsSUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLE1BQUEsQ0FBQSxXQUFBLEVBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBOzs7O0FBSUEsUUFBQSxPQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLEVBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBOzs7O0FBSUEsUUFBQSxPQUFBLEdBQUE7QUFDQSxZQUFBLEVBQUEsTUFBQTtBQUNBLFNBQUEsRUFBQSwyQkFBQTtBQUNBLGFBQUEsRUFBQTtBQUNBLHNCQUFBLEVBQUEsU0FBQTtPQUNBO0FBQ0Esc0JBQUEsRUFBQSxPQUFBLENBQUEsUUFBQTtBQUNBLFVBQUEsRUFBQSxPQUFBO0tBQ0EsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxPQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLEVBQUE7O0FBRUEsZUFBQTtPQUNBO0FBQ0EsMEJBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFNBQUEsQ0FBQSxXQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSw0QkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLG9CQUFBLENBQUEsVUFBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLHNCQUFBLENBQ0EsZUFBQSxFQUFBLENBQ0EsSUFBQSxDQUFBLGNBQUEsQ0FBQSxTQUNBLENBQUEsV0FBQSxDQUFBLENBQUE7O0FBRUEsYUFBQSxjQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLG1CQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsV0FBQSxDQUFBLEdBQUEsRUFBQSxFQUVBO0dBQ0EsQ0FBQTs7OztBQUlBLFFBQUEsQ0FBQSxrQkFBQSxHQUFBLFVBQUEsaUJBQUEsRUFBQTs7QUFFQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLHNCQUFBLENBQ0Esa0JBQUEsQ0FBQTtBQUNBLFFBQUEsRUFBQSxpQkFBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsY0FBQSxDQUFBLFNBQ0EsQ0FBQSxXQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLGNBQUEsQ0FBQSxHQUFBLEVBQUE7O0FBRUEsWUFBQSxDQUFBLGdCQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBOztBQUVBLFVBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsWUFBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxXQUFBLElBQUEsSUFBQSxJQUFBLE9BQUEsRUFBQTtBQUNBLG9CQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsYUFBQSxFQUFBLElBQUE7QUFDQSxlQUFBLEVBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLFdBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEscUJBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxRQUFBLE9BQUEsQ0FBQSwwQ0FBQSxDQUFBLEVBQUE7VUFVQSxjQUFBLEdBQUEsU0FBQSxjQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsbUJBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO09BQ0E7O1VBRUEsV0FBQSxHQUFBLFNBQUEsV0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO09BQ0E7O0FBaEJBLFVBQUEsaUJBQUEsR0FBQSxNQUFBLENBQUEsbUJBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLHdCQUFBLENBQ0EscUJBQUEsQ0FBQTtBQUNBLFVBQUEsRUFBQSxpQkFBQTtPQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsY0FBQSxDQUFBLFNBQ0EsQ0FBQSxXQUFBLENBQUEsQ0FBQTtLQVVBLE1BQUE7QUFDQSxhQUFBLEtBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtDQUNBLENBRUEsQ0FBQSxDQUFBO0FDNWJBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsV0FBQTtBQUNBLGVBQUEsRUFBQSxnREFBQTtBQUNBLGNBQUEsRUFBQSx5QkFBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLHlCQUFBLEVBQUEsQ0FBQSxZQUFBLEVBQ0EsUUFBQSxFQUNBLFFBQUEsRUFDQSxPQUFBLEVBQ0EsV0FBQSxFQUNBLFNBQUEsRUFDQSxJQUFBLEVBQ0Esc0JBQUEsRUFDQSxVQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxTQUFBLEVBQUEsT0FBQSxFQUFBLEVBQUEsRUFBQSxvQkFBQSxFQUFBOzs7QUFHQSxNQUFBLFNBQUEsR0FBQSxJQUFBLENBQUE7Ozs7QUFJQSxRQUFBLENBQUEsU0FBQSxHQUFBO0FBQ0EsYUFBQSxFQUFBLHNCQUFBO0FBQ0EsWUFBQSxFQUFBLGFBQUE7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLGVBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtLQUNBLE1BQUE7QUFDQSxlQUFBLENBQUEsSUFBQSxFQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLG1CQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFNBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsaUJBQUEsR0FBQSw4QkFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFlBQUEsR0FBQSxFQUFBLENBQUE7Ozs7QUFJQSxRQUFBLENBQUEsZ0JBQUEsR0FBQSxZQUFBOztBQUVBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsUUFBQSxPQUFBLEdBQUEsU0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQTtBQUNBLHdCQUFBLENBQ0EsZ0JBQUEsQ0FBQSxPQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxtQkFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFFBQUEsQ0FBQSxTQUNBLENBQUEsdUJBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsb0JBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxlQUFBLEdBQUEsWUFBQTtBQUNBLGVBQUE7QUFDQSw0QkFBQSxFQUFBLE1BQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLGVBQUEsR0FBQSxHQUFBO0FBQ0EsNkJBQUEsRUFBQSxXQUFBO0FBQ0EsMkJBQUEsRUFBQSxPQUFBO1NBQ0EsQ0FBQTtPQUNBLENBQUE7O0FBRUEsWUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTs7QUFFQSxVQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsa0JBQUEsS0FBQSxNQUFBLEVBQUE7QUFDQSxlQUFBLG9CQUFBLENBQUEsZUFBQSxDQUFBO0FBQ0EsZ0JBQUEsRUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE1BQUE7QUFDQSxpQkFBQSxFQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsR0FBQTtTQUNBLENBQUEsQ0FBQTtPQUNBLE1BQUE7QUFDQSxlQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxDQUFBLENBQUE7T0FDQTtLQUNBOztBQUVBLGFBQUEsbUJBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxVQUFBLE9BQUEsR0FBQSxLQUFBLFFBQUEsSUFBQSxHQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLFlBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBO09BQ0E7QUFDQSxhQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLFFBQUEsQ0FBQSxNQUFBLEVBQUE7QUFDQSxlQUFBLEdBQUEsTUFBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSx1QkFBQSxHQUFBO0FBQ0EsV0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7Ozs7QUFLQSxRQUFBLENBQUEsYUFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEseUJBQUEsQ0FBQSxDQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUE7S0FDQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLFNBQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUNBLElBQUEsQ0FBQSxZQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsWUFBQSxDQUFBLFNBQ0EsQ0FBQSxlQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLFlBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsYUFBQSxvQkFBQSxDQUFBLFlBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLFlBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLElBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEtBQUEsRUFBQSxFQUFBO0FBQ0EsZUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLENBQUE7T0FDQSxNQUFBO0FBQ0EsY0FBQSxDQUFBLFNBQUEsR0FBQSxxQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLG1CQUFBLEdBQUEsSUFBQSxDQUFBO09BQ0E7QUFDQSxZQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLGVBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsa0NBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7S0FDQTtHQUVBLENBQUE7Q0FDQSxDQUNBLENBQUEsQ0FBQTs7QUN6SUEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxvQkFBQSxFQUFBLENBQUEsT0FBQSxFQUFBLFVBQUEsS0FBQSxFQUFBOztBQUVBLFdBQUEsV0FBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSx5QkFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsV0FBQSxlQUFBLEdBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsaUNBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsV0FBQSxrQkFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSw0QkFBQSxHQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEscUJBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsa0NBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFNBQUE7QUFDQSxlQUFBLEVBQUEsV0FBQTtBQUNBLG1CQUFBLEVBQUEsZUFBQTtBQUNBLHNCQUFBLEVBQUEsa0JBQUE7QUFDQSx5QkFBQSxFQUFBLHFCQUFBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQSxDQUFBOztBQ3pCQSxHQUFBLENBQUEsT0FBQSxDQUFBLHNCQUFBLEVBQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsV0FBQSxnQkFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSw4QkFBQSxHQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsV0FBQSxZQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLHlCQUFBLEVBQUE7QUFDQSxTQUFBLEVBQUEsSUFBQSxDQUFBLFFBQUE7S0FDQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLFlBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsb0JBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEsZUFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxvQ0FBQSxHQUFBLElBQUEsQ0FBQSxNQUFBLEdBQUEsV0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFNBQUE7QUFDQSxvQkFBQSxFQUFBLGdCQUFBO0FBQ0EsZ0JBQUEsRUFBQSxZQUFBO0FBQ0EsZ0JBQUEsRUFBQSxZQUFBO0FBQ0EsbUJBQUEsRUFBQSxlQUFBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQSxDQUFBOztBQzFCQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsY0FBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FDQSxLQUFBLENBQUEsYUFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLGVBQUE7QUFDQSxlQUFBLEVBQUEsNENBQUE7QUFDQSxjQUFBLEVBQUEsdUJBQUE7QUFDQSxZQUFBLEVBQUEsSUFBQTtBQUNBLFdBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxpQkFBQSxFQUFBLEVBQUEsTUFBQSxFQUFBLGNBQUEsRUFBQTtBQUNBLFlBQUEsUUFBQSxHQUFBLEVBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsSUFBQSxHQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsSUFBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQTtTQUNBLE1BQUE7QUFDQSxrQkFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxHQUFBLFFBQUEsQ0FBQTtTQUNBO0FBQ0EsZUFBQSxRQUFBLENBQUEsT0FBQSxDQUFBO09BQ0E7S0FDQTtHQUNBLENBQUEsQ0FDQSxLQUFBLENBQUEsb0JBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxVQUFBO0FBQ0EsZUFBQSxFQUFBLHdDQUFBO0FBQ0EsY0FBQSxFQUFBLHVCQUFBO0dBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxnQ0FBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLG1CQUFBO0FBQ0EsVUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxJQUFBO0tBQ0E7QUFDQSxlQUFBLEVBQUEscURBQUE7QUFDQSxjQUFBLEVBQUEsdUJBQUE7R0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSx1QkFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxZQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxTQUFBLEVBQUEsT0FBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsY0FBQSxFQUFBLGtCQUFBLEVBQUE7QUFDQSxRQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLENBQUE7Ozs7QUFJQSxRQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxPQUFBLEVBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxLQUFBO0dBQ0EsQ0FBQTs7OztBQUlBLFFBQUEsQ0FBQSxtQkFBQSxHQUFBLEVBQUEsQ0FBQTs7OztBQUlBLFFBQUEsQ0FBQSxhQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLEtBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsU0FBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLHFCQUFBLGFBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxHQUFBLGFBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxhQUFBLEdBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsSUFBQTtBQUNBLG1CQUFBLEVBQUEsa0JBQUE7QUFDQSxrQkFBQSxFQUFBLHVCQUFBO0FBQ0EsYUFBQSxFQUFBLE1BQUE7T0FDQSxDQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsVUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsYUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsd0JBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsZ0JBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsb0JBQUEsR0FBQTtBQUNBLGVBQUEsRUFBQSxxQkFBQSxLQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsWUFBQTtBQUNBLGNBQUEsQ0FBQSx3QkFBQSxHQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxtQkFBQSxFQUFBLElBQUE7QUFDQSxxQkFBQSxFQUFBLGtCQUFBO0FBQ0Esb0JBQUEsRUFBQSx1QkFBQTtBQUNBLGVBQUEsRUFBQSxNQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEscUJBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsd0JBQUEsQ0FBQSxLQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsd0JBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEscUJBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsYUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxpQkFBQSxHQUFBO0FBQ0EsWUFBQSxFQUFBLGtCQUFBLFlBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxhQUFBLENBQUEsWUFBQSxHQUFBLFlBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxhQUFBLEdBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGlCQUFBLEVBQUEsSUFBQTtBQUNBLG1CQUFBLEVBQUEsZUFBQTtBQUNBLGtCQUFBLEVBQUEsNkJBQUE7QUFDQSxhQUFBLEVBQUEsTUFBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxrQkFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEscUJBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE9BQUEsR0FBQSxFQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLG9CQUFBLENBQUEsVUFBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxTQUFBLENBQUEsR0FBQSxDQUFBLFlBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQTtBQUNBLE1BQUEsWUFBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxpQkFBQSxDQUFBLFFBQUEsQ0FBQSxZQUFBLENBQUEsVUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBR0EsUUFBQSxDQUFBLGVBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxJQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxNQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxHQUFBLENBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLGNBQUEsRUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxFQUFBO0FBQ0EsVUFBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLHFCQUFBLEVBQUEsSUFBQTtPQUNBLENBQUEsQ0FBQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsQ0FBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsQ0FBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsQ0FBQSxVQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEdBQUEsRUFBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7O0FBRUEsVUFBQSxDQUFBLE9BQUEsR0FBQTtBQUNBLFdBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEtBQUE7S0FDQSxDQUFBOztBQUVBLFFBQUEsY0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsV0FBQSxDQUFBLENBQUE7QUFDQSxhQUFBLElBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLE9BQUEsR0FBQTtBQUNBLFVBQUEsRUFBQSxFQUFBO0FBQ0EsY0FBQSxFQUFBLEVBQUE7QUFDQSxvQkFBQSxFQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsY0FBQSxDQUFBO0tBQ0EsQ0FBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsTUFBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLElBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUE7S0FDQSxNQUFBLElBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsVUFBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUE7S0FDQSxNQUFBLElBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsT0FBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7S0FDQTs7QUFFQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLHNCQUFBLENBQ0EsZUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxHQUFBLENBQUEsSUFBQSxLQUFBLGFBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUEsdUJBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUE7U0FDQSxDQUFBO0FBQ0EsZUFBQTtPQUNBO0FBQ0Esb0JBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLHFCQUFBLEVBQUEsQ0FBQTtLQUNBLENBQUEsU0FDQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsY0FBQSxDQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxtQkFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsZ0JBQUEsR0FBQSxZQUFBOztBQUVBLFFBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0tBQ0E7O0FBRUEsUUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxFQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUE7S0FDQTs7QUFFQSxVQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxFQUFBLEVBQUE7QUFDQSxZQUFBLEVBQUEsRUFBQTtBQUNBLGNBQUEsRUFBQSxFQUFBO0FBQ0EsUUFBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLG1CQUFBLEVBQUEsSUFBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLHNCQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxRQUFBLGFBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLHNCQUFBLENBQ0EsV0FBQSxDQUFBO0FBQ0EsU0FBQSxFQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxNQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsU0FDQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLG1CQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEseUJBQUEsR0FBQSxZQUFBO0FBQ0EsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUNBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsY0FBQSxDQUFBLFNBQ0EsQ0FBQSxXQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLFFBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLGtCQUFBLENBQUEseUJBQUEsQ0FBQTtBQUNBLGFBQUEsRUFBQSxHQUFBLENBQUEsV0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBOztBQUVBLGFBQUEsY0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxHQUFBLENBQUEsTUFBQSxLQUFBLEdBQUEsSUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsS0FBQSxJQUFBLEVBQUE7QUFDQSxzQkFBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO09BQ0EsTUFBQTtBQUNBLGNBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUEsMkRBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUE7U0FDQSxDQUFBO09BQ0E7QUFDQSxZQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLFdBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxzQkFBQSxDQUNBLGVBQUEsRUFBQSxDQUNBLElBQUEsQ0FBQSxjQUFBLENBQUEsU0FDQSxDQUFBLFdBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsY0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxtQkFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLFdBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxxQkFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsUUFBQSxPQUFBLENBQUEsMENBQUEsQ0FBQSxFQUFBO1VBVUEsY0FBQSxHQUFBLFNBQUEsY0FBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLG1CQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtPQUNBOztVQUVBLFdBQUEsR0FBQSxTQUFBLFdBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtPQUNBOztBQWhCQSxVQUFBLGlCQUFBLEdBQUEsTUFBQSxDQUFBLG1CQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSx3QkFBQSxDQUNBLHFCQUFBLENBQUE7QUFDQSxVQUFBLEVBQUEsaUJBQUE7T0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLGNBQUEsQ0FBQSxTQUNBLENBQUEsV0FBQSxDQUFBLENBQUE7S0FVQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQ0EsVUFBQSxDQUFBLDZCQUFBLEVBQUEsVUFBQSxNQUFBLEVBQUEsRUFBQSxDQUFBLENBQUE7QUNqVEEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQ0EsS0FBQSxDQUFBLGdDQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsbUNBQUE7QUFDQSxlQUFBLEVBQUEsZ0RBQUE7QUFDQSxjQUFBLEVBQUEsc0NBQUE7R0FDQSxDQUFBLENBQ0EsS0FBQSxDQUFBLCtCQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsdUJBQUE7QUFDQSxVQUFBLEVBQUE7QUFDQSxnQkFBQSxFQUFBLElBQUE7S0FDQTtBQUNBLGVBQUEsRUFBQSxnREFBQTtBQUNBLGNBQUEsRUFBQSxzQ0FBQTtHQUNBLENBQUEsQ0FBQTtDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLHNDQUFBLEVBQUEsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLFlBQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsU0FBQSxFQUFBLFFBQUEsRUFBQSxjQUFBLEVBQUEsa0JBQUEsRUFBQTs7QUFFQSxRQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLENBQUE7O0FBRUEsUUFBQSxDQUFBLEtBQUEsR0FBQTtBQUNBLGtCQUFBLEVBQUEsRUFBQTtBQUNBLGNBQUEsRUFBQSxFQUFBO0FBQ0EsbUJBQUEsRUFBQSxFQUFBO0FBQ0EsV0FBQSxFQUFBLEVBQUE7QUFDQSxRQUFBLEVBQUEsS0FBQTtBQUNBLFdBQUEsRUFBQSxLQUFBO0FBQ0EsVUFBQSxFQUFBLEtBQUE7QUFDQSxXQUFBLEVBQUEsRUFBQTtBQUNBLHNCQUFBLEVBQUEsTUFBQTtBQUNBLFNBQUEsRUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUE7QUFDQSxRQUFBLEVBQUEsRUFBQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxZQUFBLEdBQUEsSUFBQSxDQUFBOzs7O0FBSUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTs7OztBQUlBLFVBQUEsQ0FBQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBOzs7O0FBSUEsUUFBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLFlBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxhQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsZUFBQSxHQUFBLEtBQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBLFdBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxFQUFBLGNBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsZ0JBQUEsR0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsR0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsY0FBQSxHQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLE1BQUEsQ0FBQSxHQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxHQUFBLGVBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxpQkFBQSxDQUFBLFNBQ0EsQ0FBQSxXQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLGlCQUFBLENBQUEsUUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxTQUFBLEVBQUEsU0FBQSxFQUFBLFVBQUEsRUFBQSxTQUFBLEVBQUEsWUFBQSxFQUFBLFdBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsZUFBQSxFQUFBLElBQUEsQ0FBQSxPQUFBO0FBQ0EsaUJBQUEsRUFBQSxJQUFBLENBQUEsR0FBQTtXQUNBLENBQUEsQ0FBQTtTQUNBO09BQ0EsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGdCQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLFdBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsNkJBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsTUFBQSxFQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7O0FBR0EsUUFBQSxDQUFBLFlBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxnQkFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLElBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsdUJBQUEsQ0FBQSxDQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUE7S0FDQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUE7S0FDQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsUUFBQSxPQUFBLEdBQUEsSUFBQSxRQUFBLEVBQUEsQ0FBQTtBQUNBLFNBQUEsSUFBQSxJQUFBLElBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQTtBQUNBLGFBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxFQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQTtLQUNBO0FBQ0EsUUFBQSxPQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsSUFBQSxFQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBO0FBQ0EsYUFBQSxJQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsRUFBQSxJQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLE9BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxJQUFBLEVBQUE7QUFDQSxhQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsRUFBQSxJQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLE1BQUEsQ0FBQSxXQUFBLEVBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUE7S0FDQTs7QUFFQSxRQUFBLE9BQUEsR0FBQTtBQUNBLFlBQUEsRUFBQSxNQUFBO0FBQ0EsU0FBQSxFQUFBLDJCQUFBO0FBQ0EsYUFBQSxFQUFBO0FBQ0Esc0JBQUEsRUFBQSxTQUFBO09BQ0E7QUFDQSxzQkFBQSxFQUFBLE9BQUEsQ0FBQSxRQUFBO0FBQ0EsVUFBQSxFQUFBLE9BQUE7S0FDQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxZQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLEVBQUEsQ0FBQSxnQ0FBQSxFQUFBO0FBQ0Esc0JBQUEsRUFBQSxZQUFBLENBQUEsVUFBQTtTQUNBLENBQUEsQ0FBQTtPQUNBLE1BQUE7QUFDQSxjQUFBLENBQUEsRUFBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQTtPQUNBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSw0QkFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBR0EsUUFBQSxDQUFBLFdBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxZQUFBLENBQUEsU0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLGtCQUFBLENBQUEsWUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSwwQkFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0EsUUFBQSxPQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsR0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsR0FBQSxTQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxNQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBO09BQ0EsQ0FBQSxTQUNBLENBQUEsVUFBQSxRQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsaUJBQUEsR0FBQSxZQUFBO0FBQ0EsUUFBQSxZQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsVUFBQSxNQUFBLENBQUEsUUFBQSxDQUFBLCtCQUFBLENBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLGNBQUEsRUFBQSxDQUFBO0FBQ0EsZUFBQTtPQUNBOztBQUVBLFlBQUEsQ0FBQSxpQkFBQSxDQUFBLFFBQUEsQ0FBQSxZQUFBLENBQUEsVUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxjQUFBLEdBQUEsWUFBQTtBQUNBLFFBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEtBQUEsRUFBQSxFQUFBO1VBT0EsNkJBQUEsR0FBQSxTQUFBLDZCQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxlQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsRUFBQSxjQUFBLENBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLGdCQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxFQUFBLGNBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsY0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLGVBQUEsRUFBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEdBQUEsZUFBQSxDQUFBLENBQUE7T0FDQTs7VUFFQSxpQkFBQSxHQUFBLFNBQUEsaUJBQUEsQ0FBQSxRQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxTQUFBLEVBQUEsU0FBQSxFQUFBLFVBQUEsRUFBQSxTQUFBLEVBQUEsWUFBQSxFQUFBLFdBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEVBQUE7QUFDQSxrQkFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsaUJBQUEsRUFBQSxJQUFBLENBQUEsT0FBQTtBQUNBLG1CQUFBLEVBQUEsSUFBQSxDQUFBLEdBQUE7YUFDQSxDQUFBLENBQUE7V0FDQTtTQUNBLENBQUEsQ0FBQTs7QUFFQSxjQUFBLENBQUEsZ0JBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtPQUNBOztVQUVBLFdBQUEsR0FBQSxTQUFBLFdBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxhQUFBLENBQUEsNkJBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7T0FDQTs7QUFyQ0EsWUFBQSxDQUFBLGdCQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSx3QkFBQSxDQUFBLFdBQUEsQ0FBQTtBQUNBLFdBQUEsRUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFFBQUE7T0FDQSxDQUFBLENBQUEsSUFBQSxDQUFBLDZCQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsaUJBQUEsQ0FBQSxTQUFBLENBQUEsV0FBQSxDQUFBLENBQUE7S0FrQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxZQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxhQUFBLFdBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxVQUFBLFFBQUEsR0FBQSxRQUFBLENBQUEsYUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxVQUFBLFFBQUEsQ0FBQSxJQUFBLElBQUEsRUFBQSxFQUFBO0FBQ0EsZ0JBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQTtPQUNBO0FBQ0EsYUFBQSxRQUFBLENBQUE7S0FDQTs7QUFFQSxRQUFBLFFBQUEsR0FBQSxXQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsS0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsUUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLGFBQUEsSUFBQSxDQUFBLEdBQUEsS0FBQSxJQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7O0FBRUEsUUFBQSxRQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsRUFBQTtBQUNBLGFBQUEsS0FBQSxDQUFBO0tBQ0E7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxFQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsV0FBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxFQUFBO0FBQ0EsYUFBQSxDQUFBLE9BQUEsQ0FBQSxvQkFBQSxDQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxRQUFBLE1BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLHNCQUFBLENBQUEsV0FBQSxDQUFBO0FBQ0EsU0FBQSxFQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEdBQUE7S0FDQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsTUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxTQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxXQUFBLENBQUEsbUJBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQSxDQUFBLENBQUE7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxZQUFBLEdBQUEsVUFBQSxLQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLFlBQUEsRUFBQSxFQUFBO0FBQ0EsY0FBQSxFQUFBLEVBQUE7QUFDQSxRQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0EsbUJBQUEsRUFBQSxLQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsY0FBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsaUJBQUEsR0FBQSxVQUFBLEtBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0Esc0JBQUEsQ0FDQSxXQUFBLENBQUE7QUFDQSxTQUFBLEVBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsR0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxNQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxFQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsV0FBQSxDQUFBLG9CQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxXQUFBLG9CQUFBLEdBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxLQUFBO0tBQ0EsQ0FBQTs7QUFFQSxVQUFBLENBQUEsS0FBQSxHQUFBO0FBQ0Esb0JBQUEsRUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxFQUFBO0FBQ0EscUJBQUEsRUFBQSxFQUFBO0FBQ0EsYUFBQSxFQUFBLEVBQUE7QUFDQSxVQUFBLEVBQUEsS0FBQTtBQUNBLGFBQUEsRUFBQSxLQUFBO0FBQ0EsWUFBQSxFQUFBLEtBQUE7QUFDQSxhQUFBLEVBQUEsQ0FBQTtBQUNBLFdBQUEsRUFBQSxFQUFBO0FBQ0EsY0FBQSxFQUFBLEVBQUE7QUFDQSxnQkFBQSxFQUFBLEVBQUE7QUFDQSxVQUFBLEVBQUEsQ0FBQSxDQUFBO0FBQ0EscUJBQUEsRUFBQSxLQUFBO09BQ0EsQ0FBQTtBQUNBLHdCQUFBLEVBQUEsTUFBQTtLQUNBLENBQUE7QUFDQSxXQUFBLENBQUEsT0FBQSxDQUFBLG9CQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7OztBQUlBLFFBQUEsQ0FBQSxrQkFBQSxHQUFBLFVBQUEsaUJBQUEsRUFBQTs7QUFFQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLHNCQUFBLENBQ0Esa0JBQUEsQ0FBQTtBQUNBLFFBQUEsRUFBQSxpQkFBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsY0FBQSxDQUFBLFNBQ0EsQ0FBQSxXQUFBLENBQUEsQ0FBQTs7QUFFQSxhQUFBLGNBQUEsQ0FBQSxHQUFBLEVBQUE7O0FBRUEsWUFBQSxDQUFBLGdCQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBOztBQUVBLFVBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFVBQUEsY0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLENBQUE7QUFDQSxVQUFBLFlBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxVQUFBLG1CQUFBLEdBQUEsRUFBQSxDQUFBOztBQUVBLFdBQUEsSUFBQSxJQUFBLElBQUEsT0FBQSxFQUFBO0FBQ0Esb0JBQUEsQ0FBQSxJQUFBLENBQUE7QUFDQSxhQUFBLEVBQUEsSUFBQTtBQUNBLGVBQUEsRUFBQSxPQUFBLENBQUEsSUFBQSxDQUFBO1NBQ0EsQ0FBQSxDQUFBO09BQ0E7QUFDQSxvQkFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLElBQUEsRUFBQTtBQUNBLDJCQUFBLENBQUEsSUFBQSxDQUFBO0FBQ0EsYUFBQSxFQUFBLElBQUE7U0FDQSxDQUFBLENBQUE7T0FDQSxDQUFBLENBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxrQkFBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxrQkFBQSxHQUFBLE1BQUEsQ0FBQTtPQUNBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsWUFBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLEdBQUEsbUJBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxHQUFBLEVBQUEsQ0FBQTs7QUFFQSxhQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0E7O0FBRUEsYUFBQSxXQUFBLENBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7S0FDQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFlBQUEsR0FBQSxZQUFBO0FBQ0EsVUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEdBQUEsRUFBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxVQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUE7QUFDQSxRQUFBLE1BQUEsQ0FBQSxVQUFBLEVBQ0EsTUFBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUE7R0FDQSxFQUFBLElBQUEsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBO0FDbFpBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxjQUFBLEVBQUE7QUFDQSxnQkFBQSxDQUNBLEtBQUEsQ0FBQSxtQ0FBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLDJCQUFBO0FBQ0EsVUFBQSxFQUFBO0FBQ0EsZ0JBQUEsRUFBQSxJQUFBO0tBQ0E7QUFDQSxlQUFBLEVBQUEsd0NBQUE7QUFDQSxjQUFBLEVBQUEsOEJBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBR0EsR0FBQSxDQUFBLFVBQUEsQ0FBQSw4QkFBQSxFQUFBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxZQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxTQUFBLEVBQUEsT0FBQSxFQUFBLFNBQUEsRUFBQSxRQUFBLEVBQUEsY0FBQSxFQUFBLGtCQUFBLEVBQUE7QUFDQSxNQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLGtCQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQTtBQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsU0FBQSxDQUFBLGlCQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxFQUFBLENBQUEsZ0NBQUEsQ0FBQSxDQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUE7R0FDQTs7QUFFQSxRQUFBLENBQUEsS0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsSUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxDQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsQ0FBQTtHQUNBLENBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQTtBQUNBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBO0FBQ0EsUUFBQSxNQUFBLENBQUEsTUFBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQTtLQUNBLE1BQUE7QUFDQSxZQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsRUFBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLElBQUEsR0FBQSxZQUFBO0FBQ0EsU0FBQSxDQUFBLDhCQUFBLENBQUEsQ0FBQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUE7QUN6Q0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQ0EsS0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLHlCQUFBO0FBQ0EsY0FBQSxFQUFBLGdCQUFBO0dBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsUUFBQTtBQUNBLGVBQUEsRUFBQSwwQkFBQTtBQUNBLGNBQUEsRUFBQSxnQkFBQTtHQUNBLENBQUEsQ0FDQSxLQUFBLENBQUEsVUFBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFdBQUE7QUFDQSxlQUFBLEVBQUEsNkJBQUE7QUFDQSxjQUFBLEVBQUEsZ0JBQUE7R0FDQSxDQUFBLENBQ0EsS0FBQSxDQUFBLE1BQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxPQUFBO0FBQ0EsZUFBQSxFQUFBLHlCQUFBO0FBQ0EsY0FBQSxFQUFBLGdCQUFBO0dBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxPQUFBLEVBQUE7QUFDQSxPQUFBLEVBQUEsUUFBQTtBQUNBLGVBQUEsRUFBQSwwQkFBQTtBQUNBLGNBQUEsRUFBQSxnQkFBQTtHQUNBLENBQUEsQ0FDQSxLQUFBLENBQUEsU0FBQSxFQUFBO0FBQ0EsT0FBQSxFQUFBLFVBQUE7QUFDQSxlQUFBLEVBQUEsNEJBQUE7QUFDQSxjQUFBLEVBQUEsZ0JBQUE7R0FDQSxDQUFBLENBQUE7Q0FDQSxDQUFBLENBQUE7O0FBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxnQkFBQSxFQUFBLENBQUEsWUFBQSxFQUNBLFFBQUEsRUFDQSxRQUFBLEVBQ0EsT0FBQSxFQUNBLFdBQUEsRUFDQSxTQUFBLEVBQ0EsYUFBQSxFQUNBLFVBQUEsVUFBQSxFQUFBLE1BQUEsRUFBQSxNQUFBLEVBQUEsS0FBQSxFQUFBLFNBQUEsRUFBQSxPQUFBLEVBQUEsV0FBQSxFQUFBOztBQUVBLFFBQUEsQ0FBQSxjQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsSUFBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBLEtBQUE7QUFDQSxlQUFBLEVBQUEsS0FBQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsZUFBQSxFQUFBO0FBQ0EsU0FBQSxFQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsS0FBQTtLQUNBO0FBQ0EsZUFBQSxFQUFBO0FBQ0EsU0FBQSxFQUFBLEVBQUE7QUFDQSxhQUFBLEVBQUEsS0FBQTtLQUNBO0dBQ0EsQ0FBQTs7OztBQUlBLFFBQUEsQ0FBQSxxQkFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsaUJBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLEtBQUE7T0FDQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7O0FBRUEsVUFBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEdBQUE7QUFDQSxTQUFBLEVBQUEsRUFBQTtBQUNBLGFBQUEsRUFBQSxLQUFBO0tBQ0EsQ0FBQTs7QUFFQSxlQUFBLENBQ0EsZUFBQSxDQUFBLE1BQUEsQ0FBQSxjQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsdUJBQUEsQ0FBQSxTQUNBLENBQUEsb0JBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsdUJBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxVQUFBLEdBQUEsQ0FBQSxNQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLGNBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsR0FBQSxJQUFBLENBQUE7T0FDQTtLQUNBOztBQUVBLGFBQUEsb0JBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxVQUFBLEdBQUEsQ0FBQSxNQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEdBQUE7QUFDQSxhQUFBLEVBQUEsdUJBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUE7U0FDQSxDQUFBO0FBQ0EsZUFBQTtPQUNBO0FBQ0EsWUFBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEdBQUE7QUFDQSxXQUFBLEVBQUEsa0NBQUE7QUFDQSxlQUFBLEVBQUEsSUFBQTtPQUNBLENBQUE7S0FDQTtHQUNBLENBQUE7Ozs7OztBQU1BLFFBQUEsQ0FBQSxpQkFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsaUJBQUEsRUFBQTtBQUNBLFdBQUEsRUFBQSxFQUFBO0FBQ0EsZUFBQSxFQUFBLEtBQUE7T0FDQTtLQUNBLENBQUE7QUFDQSxVQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxlQUFBLENBQ0EsZUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsbUJBQUEsQ0FBQSxTQUNBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsbUJBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxVQUFBLEdBQUEsQ0FBQSxNQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLE1BQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsR0FBQSxJQUFBLENBQUE7T0FDQTtLQUNBOztBQUVBLGFBQUEsZ0JBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxVQUFBLEdBQUEsQ0FBQSxNQUFBLEtBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEdBQUE7QUFDQSxhQUFBLEVBQUEsdUJBQUE7QUFDQSxpQkFBQSxFQUFBLElBQUE7U0FDQSxDQUFBO0FBQ0EsZUFBQTtPQUNBOztBQUVBLFlBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxHQUFBO0FBQ0EsV0FBQSxFQUFBLGtDQUFBO0FBQ0EsZUFBQSxFQUFBLElBQUE7T0FDQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOzs7Q0FHQSxDQUNBLENBQUEsQ0FBQTs7QUFFQSxHQUFBLENBQUEsU0FBQSxDQUFBLFNBQUEsRUFBQSxVQUFBLE9BQUEsRUFBQTtBQUNBLFNBQUE7QUFDQSxZQUFBLEVBQUEsSUFBQTtBQUNBLFFBQUEsRUFBQSxjQUFBLE1BQUEsRUFBQSxRQUFBLEVBQUE7QUFDQSxVQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0FBQ0EsVUFBQSxTQUFBLEdBQUEsUUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLFNBQUEsQ0FBQTs7QUFFQSxlQUFBLFlBQUEsR0FBQTs7QUFFQSxZQUFBLE9BQUEsQ0FBQSxXQUFBLEdBQUEsU0FBQSxFQUFBO0FBQ0Esa0JBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxFQUFBLE9BQUEsQ0FBQSxDQUFBO0FBQ0Esa0JBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxFQUFBLE1BQUEsQ0FBQSxDQUFBO1NBQ0EsTUFBQTtBQUNBLGtCQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTtBQUNBLGtCQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsRUFBQSxFQUFBLENBQUEsQ0FBQTtTQUNBO09BQ0E7O0FBRUEsWUFBQSxDQUFBLEdBQUEsQ0FBQSxtQkFBQSxFQUFBLFlBQUE7QUFDQSxXQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsRUFBQSxZQUFBLENBQUEsQ0FBQTtPQUNBLENBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLFlBQUEsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQy9LQSxHQUFBLENBQUEsT0FBQSxDQUFBLG9CQUFBLEVBQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsV0FBQSxXQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLHlCQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLGVBQUEsR0FBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSwyQkFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLGtCQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDRCQUFBLEdBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsV0FBQSxxQkFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxrQ0FBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsV0FBQSxlQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLDRCQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLHlCQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLGtDQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxXQUFBLDBCQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLDJCQUFBLEVBQUEsSUFBQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxTQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUE7QUFDQSxtQkFBQSxFQUFBLGVBQUE7QUFDQSxzQkFBQSxFQUFBLGtCQUFBO0FBQ0EsbUJBQUEsRUFBQSxlQUFBO0FBQ0EseUJBQUEsRUFBQSxxQkFBQTtBQUNBLDZCQUFBLEVBQUEseUJBQUE7QUFDQSw4QkFBQSxFQUFBLDBCQUFBO0dBQ0EsQ0FBQTtDQUNBLENBQUEsQ0FBQSxDQUFBOztBQ3ZDQSxHQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxVQUFBLEtBQUEsRUFBQTs7QUFFQSxXQUFBLGVBQUEsQ0FBQSxJQUFBLEVBQUE7QUFDQSxXQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsdUJBQUEsRUFBQSxJQUFBLENBQUEsQ0FBQTtHQUNBOztBQUVBLFdBQUEsZUFBQSxDQUFBLElBQUEsRUFBQTtBQUNBLFdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSx1QkFBQSxFQUFBLElBQUEsQ0FBQSxDQUFBO0dBQ0E7O0FBRUEsU0FBQTtBQUNBLG1CQUFBLEVBQUEsZUFBQTtBQUNBLG1CQUFBLEVBQUEsZUFBQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUEsQ0FBQTs7QUNoQkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxXQUFBO0FBQ0EsZUFBQSxFQUFBLGlDQUFBO0FBQ0EsY0FBQSxFQUFBLG1CQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsbUJBQUEsRUFBQSxDQUFBLFlBQUEsRUFDQSxRQUFBLEVBQ0EsUUFBQSxFQUNBLE9BQUEsRUFDQSxXQUFBLEVBQ0EsU0FBQSxFQUNBLGdCQUFBLEVBQ0EsVUFBQSxVQUFBLEVBQUEsTUFBQSxFQUFBLE1BQUEsRUFBQSxLQUFBLEVBQUEsU0FBQSxFQUFBLE9BQUEsRUFBQSxjQUFBLEVBQUE7O0FBRUEsUUFBQSxDQUFBLFVBQUEsR0FBQSxDQUNBLGtCQUFBLEVBQ0EsU0FBQSxFQUNBLFVBQUEsRUFDQSxPQUFBLEVBQ0EsV0FBQSxFQUNBLFNBQUEsRUFDQSxhQUFBLEVBQ0EsV0FBQSxFQUNBLFlBQUEsRUFDQSxPQUFBLEVBQ0EsYUFBQSxFQUNBLFNBQUEsRUFDQSxZQUFBLEVBQ0EsVUFBQSxFQUNBLE1BQUEsRUFDQSxhQUFBLEVBQ0EsT0FBQSxFQUNBLG1CQUFBLEVBQ0EsT0FBQSxFQUNBLE1BQUEsRUFDQSw2QkFBQSxDQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsT0FBQSxFQUFBLEVBQUE7QUFDQSxXQUFBLEVBQUEsS0FBQTtHQUNBLENBQUE7QUFDQSxRQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTs7QUFFQSxRQUFBLENBQUEsV0FBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFFBQUEsSUFBQSxHQUFBLElBQUEsUUFBQSxFQUFBLENBQUE7QUFDQSxTQUFBLElBQUEsSUFBQSxJQUFBLE1BQUEsQ0FBQSxVQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsRUFBQSxNQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUE7S0FDQTtBQUNBLGtCQUFBLENBQ0EsV0FBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxlQUFBLENBQUEsU0FDQSxDQUFBLFVBQUEsQ0FBQSxDQUFBOztBQUVBLGFBQUEsZUFBQSxDQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsVUFBQSxHQUFBLENBQUEsTUFBQSxLQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxHQUFBLHFEQUFBLENBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLGVBQUEsQ0FBQSxPQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUNBLGVBQUE7T0FDQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxHQUFBLG9EQUFBLENBQUE7S0FDQTs7QUFFQSxhQUFBLFVBQUEsQ0FBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFVBQUEsR0FBQSxDQUFBLE1BQUEsS0FBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsT0FBQSxHQUFBO0FBQ0EsaUJBQUEsRUFBQSxJQUFBO0FBQ0EsYUFBQSxFQUFBLEdBQUEsQ0FBQSxJQUFBO1NBQ0EsQ0FBQTtBQUNBLGVBQUE7T0FDQTtBQUNBLFlBQUEsQ0FBQSxPQUFBLEdBQUE7QUFDQSxlQUFBLEVBQUEsSUFBQTtBQUNBLFdBQUEsRUFBQSxvREFBQTtPQUNBLENBQUE7S0FDQTtHQUNBLENBQUE7Q0FDQSxDQUNBLENBQUEsQ0FBQTtBQ3pGQSxHQUFBLENBQUEsT0FBQSxDQUFBLGdCQUFBLEVBQUEsQ0FBQSxPQUFBLEVBQUEsVUFBQSxLQUFBLEVBQUE7O0FBRUEsV0FBQSxXQUFBLENBQUEsSUFBQSxFQUFBO0FBQ0EsV0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLEVBQUEsTUFBQTtBQUNBLFNBQUEsRUFBQSxjQUFBO0FBQ0EsYUFBQSxFQUFBO0FBQ0Esc0JBQUEsRUFBQSxTQUFBO09BQ0E7QUFDQSxzQkFBQSxFQUFBLE9BQUEsQ0FBQSxRQUFBO0FBQ0EsVUFBQSxFQUFBLElBQUE7S0FDQSxDQUFBLENBQUE7R0FDQTs7QUFFQSxTQUFBO0FBQ0EsZUFBQSxFQUFBLFdBQUE7R0FDQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBLENBQUE7QUNqQkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLGNBQUEsRUFBQTtBQUNBLGdCQUFBLENBQUEsS0FBQSxDQUFBLGFBQUEsRUFBQTtBQUNBLE9BQUEsRUFBQSxjQUFBO0FBQ0EsZUFBQSxFQUFBLHVDQUFBO0FBQ0EsY0FBQSxFQUFBLHNCQUFBO0dBQ0EsQ0FBQSxDQUFBO0NBQ0EsQ0FBQSxDQUFBOztBQUdBLEdBQUEsQ0FBQSxVQUFBLENBQUEsc0JBQUEsRUFBQSxVQUFBLFVBQUEsRUFBQSxNQUFBLEVBQUEsTUFBQSxFQUFBLEtBQUEsRUFBQSxXQUFBLEVBQUEsYUFBQSxFQUFBO0FBQ0EsUUFBQSxDQUFBLE9BQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxRQUFBLENBQUEsZUFBQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLFFBQUEsQ0FBQSxXQUFBLEdBQUEsRUFBQSxDQUFBO0FBQ0EsUUFBQSxDQUFBLE1BQUEsR0FBQSxZQUFBO0FBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxHQUFBLFFBQUEsQ0FBQTtLQUNBLENBQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxXQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsZUFBQSxHQUFBLFlBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsQ0FBQSxHQUFBLENBQUEsNkJBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxXQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBO0FBQ0EsYUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGVBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFdBQUEsQ0FBQSxnQ0FBQSxDQUFBLENBQUE7QUFDQSxhQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsUUFBQSxHQUFBLFlBQUE7QUFDQSxRQUFBLFlBQUEsR0FBQSxFQUFBLENBQUE7QUFDQSxTQUFBLElBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxFQUFBLENBQUEsRUFBQSxFQUFBO0FBQ0EsVUFBQSxHQUFBLEdBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsY0FBQSxDQUFBLGVBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUE7QUFDQSxvQkFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQTtPQUNBO0tBQ0E7QUFDQSxjQUFBLENBQUEsWUFBQTtBQUNBLGFBQUEsQ0FBQSxHQUFBLENBQUEsWUFBQSxDQUFBLENBQUE7QUFDQSxrQkFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLHFCQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO09BQ0EsRUFBQSxFQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtBQUNBLFVBQUEsQ0FBQSxPQUFBLElBQUEsRUFBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsR0FBQSxFQUFBLElBQUEsRUFBQTtBQUNBLFFBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxVQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtBQUNBLFFBQUEsS0FBQSxJQUFBLENBQUEsQ0FBQSxFQUFBO0FBQ0EsU0FBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBO0tBQ0EsTUFBQTtBQUNBLFNBQUEsQ0FBQSxVQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtLQUNBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsS0FBQSxFQUFBO0FBQ0EsUUFBQSxLQUFBLENBQUEsVUFBQSxDQUFBLE1BQUEsSUFBQSxDQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBO0tBQ0EsTUFBQTtBQUNBLFdBQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxDQUFBLFFBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsV0FBQSxDQUFBLEdBQUEsQ0FBQSx1QkFBQSxFQUFBLEtBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLGNBQUEsQ0FBQSxlQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxlQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxjQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEscUJBQUEsQ0FBQSxDQUFBO09BQ0EsQ0FBQSxDQUFBO0tBQ0E7R0FDQSxDQUFBOztBQUVBLFFBQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxVQUFBLEVBQUE7QUFDQSxVQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQTtBQUNBLFNBQUEsVUFBQSxDQUFBLDBCQUFBLEdBQUEsVUFBQSxDQUFBLEdBQUEsR0FBQSxHQUFBLEdBQUEsVUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFVBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxlQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLGVBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLEVBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsdUJBQUEsQ0FBQSxDQUFBO0tBQ0EsQ0FBQSxDQUFBO0dBQ0EsQ0FBQTs7QUFFQSxRQUFBLENBQUEsT0FBQSxHQUFBLFVBQUEsVUFBQSxFQUFBO0FBQ0EsVUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7QUFDQSxTQUFBLFVBQUEsQ0FBQSwyQkFBQSxHQUFBLFVBQUEsQ0FBQSxHQUFBLEdBQUEsR0FBQSxHQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxHQUFBLEVBQUE7QUFDQSxVQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsZUFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxlQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQTtBQUNBLFlBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxDQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQTtLQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxFQUFBLFVBQUEsR0FBQSxFQUFBO0FBQ0EsWUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUE7QUFDQSxZQUFBLENBQUEsS0FBQSxDQUFBLHdCQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLE9BQUEsR0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSxpQ0FBQSxFQUFBLFVBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7O0FBRUEsUUFBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLFVBQUEsRUFBQTtBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBO0FBQ0EsU0FBQSxDQUFBLElBQUEsQ0FBQSxrQ0FBQSxFQUFBLFVBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQTtBQUNBLFlBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBO0FBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQTtLQUNBLENBQUEsQ0FBQTtHQUNBLENBQUE7Q0FDQSxDQUFBLENBQUEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbndpbmRvdy5hcHAgPSBhbmd1bGFyLm1vZHVsZSgnRnVsbHN0YWNrR2VuZXJhdGVkQXBwJywgWydmc2FQcmVCdWlsdCcsICd1aS5yb3V0ZXInLCAndWkuYm9vdHN0cmFwJywgJ25nQW5pbWF0ZScsICduZ0Nvb2tpZXMnLCAneWFydTIyLmFuZ3VsYXItdGltZWFnbyddKTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlciwgJHVpVmlld1Njcm9sbFByb3ZpZGVyKSB7XG4gICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcbiAgICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG4gICAgLy8gJHVpVmlld1Njcm9sbFByb3ZpZGVyLnVzZUFuY2hvclNjcm9sbCgpO1xufSk7XG5cbi8vIFRoaXMgYXBwLnJ1biBpcyBmb3IgY29udHJvbGxpbmcgYWNjZXNzIHRvIHNwZWNpZmljIHN0YXRlcy5cbmFwcC5ydW4oZnVuY3Rpb24gKCRyb290U2NvcGUsIEF1dGhTZXJ2aWNlLCAkc3RhdGUsICR1aVZpZXdTY3JvbGwsIFNlc3Npb25TZXJ2aWNlLCBBcHBDb25maWcpIHtcbiAgICAvLyBUaGUgZ2l2ZW4gc3RhdGUgcmVxdWlyZXMgYW4gYXV0aGVudGljYXRlZCB1c2VyLlxuICAgIC8vIHZhciBkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBdXRoID0gZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgLy8gICAgIHJldHVybiBzdGF0ZS5kYXRhICYmIHN0YXRlLmRhdGEuYXV0aGVudGljYXRlO1xuICAgIC8vIH07XG5cbiAgICBBcHBDb25maWcuZmV0Y2hDb25maWcoKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhyZXMpO1xuICAgICAgICBBcHBDb25maWcuc2V0Q29uZmlnKHJlcy5kYXRhKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coQXBwQ29uZmlnLmlzQ29uZmlnUGFyYW1zdmFpbGFibGUpO1xuICAgIH0pXG5cbiAgICAvLyAkc3RhdGVDaGFuZ2VTdGFydCBpcyBhbiBldmVudCBmaXJlZFxuICAgIC8vIHdoZW5ldmVyIHRoZSBwcm9jZXNzIG9mIGNoYW5naW5nIGEgc3RhdGUgYmVnaW5zLlxuICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uIChldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMpIHtcbiAgICAgICAgLy8gaWYodG9TdGF0ZSA9ICdhcnRpc3RUb29scycpIHtcbiAgICAgICAgLy8gICAgIHZhciB1c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xuICAgICAgICAvLyAgICAgY29uc29sZS5sb2codXNlcik7XG4gICAgICAgIC8vIH1cbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3JlYWNoZWQgaGVyZScpO1xuICAgICAgICAvLyBpZiAoIWRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGgodG9TdGF0ZSkpIHtcbiAgICAgICAgLy8gICAgIC8vIFRoZSBkZXN0aW5hdGlvbiBzdGF0ZSBkb2VzIG5vdCByZXF1aXJlIGF1dGhlbnRpY2F0aW9uXG4gICAgICAgIC8vICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAvLyAgICAgcmV0dXJuO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgLy8gaWYgKEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgIC8vICAgICAvLyBUaGUgdXNlciBpcyBhdXRoZW50aWNhdGVkLlxuICAgICAgICAvLyAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbiAgICAgICAgLy8gICAgIHJldHVybjtcbiAgICAgICAgLy8gfVxuXG4gICAgICAgIC8vIC8vIENhbmNlbCBuYXZpZ2F0aW5nIHRvIG5ldyBzdGF0ZS5cbiAgICAgICAgLy8gZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAvLyBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgIC8vICAgICAvLyBJZiBhIHVzZXIgaXMgcmV0cmlldmVkLCB0aGVuIHJlbmF2aWdhdGUgdG8gdGhlIGRlc3RpbmF0aW9uXG4gICAgICAgIC8vICAgICAvLyAodGhlIHNlY29uZCB0aW1lLCBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSB3aWxsIHdvcmspXG4gICAgICAgIC8vICAgICAvLyBvdGhlcndpc2UsIGlmIG5vIHVzZXIgaXMgbG9nZ2VkIGluLCBnbyB0byBcImxvZ2luXCIgc3RhdGUuXG4gICAgICAgIC8vICAgICBpZiAodXNlcikge1xuICAgICAgICAvLyAgICAgICAgICRzdGF0ZS5nbyh0b1N0YXRlLm5hbWUsIHRvUGFyYW1zKTtcbiAgICAgICAgLy8gICAgIH0gZWxzZSB7XG4gICAgICAgIC8vICAgICAgICAgJHN0YXRlLmdvKCdsb2dpbicpO1xuICAgICAgICAvLyAgICAgfVxuICAgICAgICAvLyB9KTtcblxuICAgIH0pO1xuXG59KTtcblxuXG5hcHAuZGlyZWN0aXZlKCdmaWxlcmVhZCcsIFtmdW5jdGlvbiAoKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgc2NvcGU6IHtcbiAgICAgICAgICAgIGZpbGVyZWFkOiAnPScsXG4gICAgICAgICAgICBtZXNzYWdlOiAnPSdcbiAgICAgICAgfSxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlLCBlbGVtZW50LCBhdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICBlbGVtZW50LmJpbmQoJ2NoYW5nZScsIGZ1bmN0aW9uIChjaGFuZ2VFdmVudCkge1xuICAgICAgICAgICAgICAgIHNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbDogJydcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmKGNoYW5nZUV2ZW50LnRhcmdldC5maWxlc1swXS50eXBlICE9IFwiYXVkaW8vbXBlZ1wiICYmIGNoYW5nZUV2ZW50LnRhcmdldC5maWxlc1swXS50eXBlICE9IFwiYXVkaW8vbXAzXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWw6ICdFcnJvcjogUGxlYXNlIHVwbG9hZCBtcDMgZm9ybWF0IGZpbGUuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudmFsKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZihjaGFuZ2VFdmVudC50YXJnZXQuZmlsZXNbMF0uc2l6ZSA+IDIwKjEwMDAqMTAwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbDogJ0Vycm9yOiBQbGVhc2UgdXBsb2FkIGZpbGUgdXB0byAyMCBNQiBzaXplLidcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnZhbChudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzY29wZS5maWxlcmVhZCA9IGNoYW5nZUV2ZW50LnRhcmdldC5maWxlc1swXTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufV0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZGF0YWJhc2UnLCB7XG4gICAgdXJsOiAnL2FkbWluL2RhdGFiYXNlJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2RhdGFiYXNlL2RhdGFiYXNlLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdEYXRhYmFzZUNvbnRyb2xsZXInXG4gIH0pO1xufSk7XG5cbmFwcC5kaXJlY3RpdmUoJ25vdGlmaWNhdGlvbkJhcicsIFsnc29ja2V0JywgZnVuY3Rpb24oc29ja2V0KSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgc2NvcGU6IHRydWUsXG4gICAgdGVtcGxhdGU6ICc8ZGl2IHN0eWxlPVwibWFyZ2luOiAwIGF1dG87d2lkdGg6NTAlXCIgbmctc2hvdz1cImJhci52aXNpYmxlXCI+JyArXG4gICAgICAnPHVpYi1wcm9ncmVzcz48dWliLWJhciB2YWx1ZT1cImJhci52YWx1ZVwiIHR5cGU9XCJ7e2Jhci50eXBlfX1cIj48c3Bhbj57e2Jhci52YWx1ZX19JTwvc3Bhbj48L3VpYi1iYXI+PC91aWItcHJvZ3Jlc3M+JyArXG4gICAgICAnPC9kaXY+JyxcbiAgICBsaW5rOiBmdW5jdGlvbigkc2NvcGUsIGlFbG0sIGlBdHRycywgY29udHJvbGxlcikge1xuICAgICAgc29ja2V0Lm9uKCdub3RpZmljYXRpb24nLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgICAgIHZhciBwZXJjZW50YWdlID0gcGFyc2VJbnQoTWF0aC5mbG9vcihkYXRhLmNvdW50ZXIgLyBkYXRhLnRvdGFsICogMTAwKSwgMTApO1xuICAgICAgICAkc2NvcGUuYmFyLnZhbHVlID0gcGVyY2VudGFnZTtcbiAgICAgICAgaWYgKHBlcmNlbnRhZ2UgPT09IDEwMCkge1xuICAgICAgICAgICRzY29wZS5iYXIudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAgICRzY29wZS5iYXIudmFsdWUgPSAwO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG59XSk7XG5cbmFwcC5jb250cm9sbGVyKCdEYXRhYmFzZUNvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsIEF1dGhTZXJ2aWNlLCBzb2NrZXQpIHtcbiAgJHNjb3BlLmFkZFVzZXIgPSB7fTtcbiAgJHNjb3BlLnF1ZXJ5ID0ge307XG4gICRzY29wZS50cmRVc3JRdWVyeSA9IHt9O1xuICAkc2NvcGUucXVlcnlDb2xzID0gW3tcbiAgICBuYW1lOiAndXNlcm5hbWUnLFxuICAgIHZhbHVlOiAndXNlcm5hbWUnXG4gIH0sIHtcbiAgICBuYW1lOiAnZ2VucmUnLFxuICAgIHZhbHVlOiAnZ2VucmUnXG4gIH0sIHtcbiAgICBuYW1lOiAnbmFtZScsXG4gICAgdmFsdWU6ICduYW1lJ1xuICB9LCB7XG4gICAgbmFtZTogJ1VSTCcsXG4gICAgdmFsdWU6ICdzY1VSTCdcbiAgfSwge1xuICAgIG5hbWU6ICdlbWFpbCcsXG4gICAgdmFsdWU6ICdlbWFpbCdcbiAgfSwge1xuICAgIG5hbWU6ICdkZXNjcmlwdGlvbicsXG4gICAgdmFsdWU6ICdkZXNjcmlwdGlvbidcbiAgfSwge1xuICAgIG5hbWU6ICdmb2xsb3dlcnMnLFxuICAgIHZhbHVlOiAnZm9sbG93ZXJzJ1xuICB9LCB7XG4gICAgbmFtZTogJ251bWJlciBvZiB0cmFja3MnLFxuICAgIHZhbHVlOiAnbnVtVHJhY2tzJ1xuICB9LCB7XG4gICAgbmFtZTogJ2ZhY2Vib29rJyxcbiAgICB2YWx1ZTogJ2ZhY2Vib29rVVJMJ1xuICB9LCB7XG4gICAgbmFtZTogJ2luc3RhZ3JhbScsXG4gICAgdmFsdWU6ICdpbnN0YWdyYW1VUkwnXG4gIH0sIHtcbiAgICBuYW1lOiAndHdpdHRlcicsXG4gICAgdmFsdWU6ICd0d2l0dGVyVVJMJ1xuICB9LCB7XG4gICAgbmFtZTogJ3lvdXR1YmUnLFxuICAgIHZhbHVlOiAneW91dHViZVVSTCdcbiAgfSwge1xuICAgIG5hbWU6ICd3ZWJzaXRlcycsXG4gICAgdmFsdWU6ICd3ZWJzaXRlcydcbiAgfSwge1xuICAgIG5hbWU6ICdhdXRvIGVtYWlsIGRheScsXG4gICAgdmFsdWU6ICdlbWFpbERheU51bSdcbiAgfSwge1xuICAgIG5hbWU6ICdhbGwgZW1haWxzJyxcbiAgICB2YWx1ZTogJ2FsbEVtYWlscydcbiAgfV07XG4gICRzY29wZS5kb3dubG9hZEJ1dHRvblZpc2libGUgPSBmYWxzZTtcbiAgJHNjb3BlLnRyYWNrID0ge1xuICAgIHRyYWNrVXJsOiAnJyxcbiAgICBkb3dubG9hZFVybDogJycsXG4gICAgZW1haWw6ICcnXG4gIH07XG4gICRzY29wZS5iYXIgPSB7XG4gICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgIHZhbHVlOiAwLFxuICAgIHZpc2libGU6IGZhbHNlXG4gIH07XG4gICRzY29wZS5wYWlkUmVwb3N0ID0ge1xuICAgIHNvdW5kQ2xvdWRVcmw6ICcnXG4gIH07XG5cbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICRodHRwLmdldCgnL2FwaS9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2FkbWluJztcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICBhbGVydCgnV3JvbmcgUGFzc3dvcmQnKTtcbiAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5zYXZlQWRkVXNlciA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkc2NvcGUuYWRkVXNlci5wYXNzd29yZCA9ICRyb290U2NvcGUucGFzc3dvcmQ7XG4gICAgJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS9hZGR1c2VyJywgJHNjb3BlLmFkZFVzZXIpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgYWxlcnQoXCJTdWNjZXNzOiBEYXRhYmFzZSBpcyBiZWluZyBwb3B1bGF0ZWQuIFlvdSB3aWxsIGJlIGVtYWlsZWQgd2hlbiBpdCBpcyBjb21wbGV0ZS5cIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5iYXIudmlzaWJsZSA9IHRydWU7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgICBhbGVydCgnQmFkIHN1Ym1pc3Npb24nKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmNyZWF0ZVVzZXJRdWVyeURvYyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBxdWVyeSA9IHt9O1xuICAgIGlmICgkc2NvcGUucXVlcnkuYXJ0aXN0ID09IFwiYXJ0aXN0c1wiKSB7XG4gICAgICBxdWVyeS5hcnRpc3QgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoJHNjb3BlLnF1ZXJ5LmFydGlzdCA9PSBcIm5vbi1hcnRpc3RzXCIpIHtcbiAgICAgIHF1ZXJ5LmFydGlzdCA9IGZhbHNlO1xuICAgIH1cbiAgICB2YXIgZmx3clFyeSA9IHt9O1xuICAgIGlmICgkc2NvcGUucXVlcnkuZm9sbG93ZXJzR1QpIHtcbiAgICAgIGZsd3JRcnkuJGd0ID0gJHNjb3BlLnF1ZXJ5LmZvbGxvd2Vyc0dUO1xuICAgICAgcXVlcnkuZm9sbG93ZXJzID0gZmx3clFyeTtcbiAgICB9XG4gICAgaWYgKCRzY29wZS5xdWVyeS5mb2xsb3dlcnNMVCkge1xuICAgICAgZmx3clFyeS4kbHQgPSAkc2NvcGUucXVlcnkuZm9sbG93ZXJzTFQ7XG4gICAgICBxdWVyeS5mb2xsb3dlcnMgPSBmbHdyUXJ5O1xuICAgIH1cbiAgICBpZiAoJHNjb3BlLnF1ZXJ5LmdlbnJlKSBxdWVyeS5nZW5yZSA9ICRzY29wZS5xdWVyeS5nZW5yZTtcbiAgICBpZiAoJHNjb3BlLnF1ZXJ5Q29scykge1xuICAgICAgcXVlcnkuY29sdW1ucyA9ICRzY29wZS5xdWVyeUNvbHMuZmlsdGVyKGZ1bmN0aW9uKGVsbSkge1xuICAgICAgICByZXR1cm4gZWxtLnZhbHVlICE9PSBudWxsO1xuICAgICAgfSkubWFwKGZ1bmN0aW9uKGVsbSkge1xuICAgICAgICByZXR1cm4gZWxtLnZhbHVlO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGlmICgkc2NvcGUucXVlcnkudHJhY2tlZFVzZXJzVVJMKSBxdWVyeS50cmFja2VkVXNlcnNVUkwgPSAkc2NvcGUucXVlcnkudHJhY2tlZFVzZXJzVVJMO1xuICAgIHZhciBib2R5ID0ge1xuICAgICAgcXVlcnk6IHF1ZXJ5LFxuICAgICAgcGFzc3dvcmQ6ICRyb290U2NvcGUucGFzc3dvcmRcbiAgICB9O1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL2ZvbGxvd2VycycsIGJvZHkpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHNjb3BlLmZpbGVuYW1lID0gcmVzLmRhdGE7XG4gICAgICAgICRzY29wZS5kb3dubG9hZEJ1dHRvblZpc2libGUgPSB0cnVlO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBhbGVydChcIkVSUk9SOiBCYWQgUXVlcnkgb3IgTm8gTWF0Y2hlc1wiKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmNyZWF0ZVRyZFVzclF1ZXJ5RG9jID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHF1ZXJ5ID0ge307XG4gICAgdmFyIGZsd3JRcnkgPSB7fTtcbiAgICBpZiAoJHNjb3BlLnRyZFVzclF1ZXJ5LmZvbGxvd2Vyc0dUKSB7XG4gICAgICBmbHdyUXJ5LiRndCA9ICRzY29wZS50cmRVc3JRdWVyeS5mb2xsb3dlcnNHVDtcbiAgICAgIHF1ZXJ5LmZvbGxvd2VycyA9IGZsd3JRcnk7XG4gICAgfVxuICAgIGlmICgkc2NvcGUudHJkVXNyUXVlcnkuZm9sbG93ZXJzTFQpIHtcbiAgICAgIGZsd3JRcnkuJGx0ID0gJHNjb3BlLnRyZFVzclF1ZXJ5LmZvbGxvd2Vyc0xUO1xuICAgICAgcXVlcnkuZm9sbG93ZXJzID0gZmx3clFyeTtcbiAgICB9XG4gICAgaWYgKCRzY29wZS50cmRVc3JRdWVyeS5nZW5yZSkgcXVlcnkuZ2VucmUgPSAkc2NvcGUudHJkVXNyUXVlcnkuZ2VucmU7XG4gICAgdmFyIGJvZHkgPSB7XG4gICAgICBxdWVyeTogcXVlcnksXG4gICAgICBwYXNzd29yZDogJHJvb3RTY29wZS5wYXNzd29yZFxuICAgIH07XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvdHJhY2tlZFVzZXJzJywgYm9keSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUudHJkVXNyRmlsZW5hbWUgPSByZXMuZGF0YTtcbiAgICAgICAgJHNjb3BlLmRvd25sb2FkVHJkVXNyQnV0dG9uVmlzaWJsZSA9IHRydWU7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGFsZXJ0KFwiRVJST1I6IEJhZCBRdWVyeSBvciBObyBNYXRjaGVzXCIpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUuZG93bmxvYWQgPSBmdW5jdGlvbihmaWxlbmFtZSkge1xuICAgIHZhciBhbmNob3IgPSBhbmd1bGFyLmVsZW1lbnQoJzxhLz4nKTtcbiAgICBhbmNob3IuYXR0cih7XG4gICAgICBocmVmOiBmaWxlbmFtZSxcbiAgICAgIGRvd25sb2FkOiBmaWxlbmFtZVxuICAgIH0pWzBdLmNsaWNrKCk7XG4gICAgJHNjb3BlLmRvd25sb2FkQnV0dG9uVmlzaWJsZSA9IGZhbHNlO1xuICAgICRzY29wZS5kb3dubG9hZFRyZFVzckJ1dHRvblZpc2libGUgPSBmYWxzZTtcbiAgfVxuXG4gICRzY29wZS5zYXZlUGFpZFJlcG9zdENoYW5uZWwgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS9wYWlkcmVwb3N0JywgJHNjb3BlLnBhaWRSZXBvc3QpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHNjb3BlLnBhaWRSZXBvc3QgPSB7XG4gICAgICAgICAgc291bmRDbG91ZFVybDogJydcbiAgICAgICAgfTtcbiAgICAgICAgYWxlcnQoXCJTVUNDRVNTOiBVcmwgc2F2ZWQgc3VjY2Vzc2Z1bGx5XCIpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBhbGVydChcIkVSUk9SOiBFcnJvciBpbiBzYXZpbmcgdXJsXCIpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gIH1cblxuICAvKiBMaXN0ZW4gdG8gc29ja2V0IGV2ZW50cyAqL1xuICBzb2NrZXQub24oJ25vdGlmaWNhdGlvbicsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB2YXIgcGVyY2VudGFnZSA9IHBhcnNlSW50KE1hdGguZmxvb3IoZGF0YS5jb3VudGVyIC8gZGF0YS50b3RhbCAqIDEwMCksIDEwKTtcbiAgICAkc2NvcGUuYmFyLnZhbHVlID0gcGVyY2VudGFnZTtcbiAgICBpZiAocGVyY2VudGFnZSA9PT0gMTAwKSB7XG4gICAgICAkc2NvcGUuc3RhdHVzQmFyVmlzaWJsZSA9IGZhbHNlO1xuICAgICAgJHNjb3BlLmJhci52YWx1ZSA9IDA7XG4gICAgfVxuICB9KTtcbn0pOyIsIihmdW5jdGlvbigpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcbiAgICAvLyBIb3BlIHlvdSBkaWRuJ3QgZm9yZ2V0IEFuZ3VsYXIhIER1aC1kb3kuXG4gICAgaWYgKCF3aW5kb3cuYW5ndWxhcikgdGhyb3cgbmV3IEVycm9yKCdJIGNhblxcJ3QgZmluZCBBbmd1bGFyIScpO1xuXG4gICAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdmc2FQcmVCdWlsdCcsIFtdKTtcblxuICAgIGFwcC5mYWN0b3J5KCdpbml0U29ja2V0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghd2luZG93LmlvKSB0aHJvdyBuZXcgRXJyb3IoJ3NvY2tldC5pbyBub3QgZm91bmQhJyk7XG4gICAgICAgIHJldHVybiB3aW5kb3cuaW8od2luZG93LmxvY2F0aW9uLm9yaWdpbik7XG4gICAgfSk7XG5cbiAgICBhcHAuZmFjdG9yeSgnc29ja2V0JywgZnVuY3Rpb24oJHJvb3RTY29wZSwgaW5pdFNvY2tldCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgb246IGZ1bmN0aW9uKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBpbml0U29ja2V0Lm9uKGV2ZW50TmFtZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KGluaXRTb2NrZXQsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbWl0OiBmdW5jdGlvbihldmVudE5hbWUsIGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgaW5pdFNvY2tldC5lbWl0KGV2ZW50TmFtZSwgZGF0YSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KGluaXRTb2NrZXQsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ0FwcENvbmZpZycsIGZ1bmN0aW9uKCRodHRwKSB7XG4gICAgICAgIHZhciBfY29uZmlnUGFyYW1zID0gbnVsbDtcblxuICAgICAgICBmdW5jdGlvbiBmZXRjaENvbmZpZygpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvc291bmRjbG91ZC9zb3VuZGNsb3VkQ29uZmlnJyk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBzZXRDb25maWcoZGF0YSkge1xuICAgICAgICAgICAgX2NvbmZpZ1BhcmFtcyA9IGRhdGE7XG4gICAgICAgICAgICBTQy5pbml0aWFsaXplKHtcbiAgICAgICAgICAgICAgICBjbGllbnRfaWQ6IGRhdGEuY2xpZW50SUQsXG4gICAgICAgICAgICAgICAgcmVkaXJlY3RfdXJpOiBkYXRhLmNhbGxiYWNrVVJMLFxuICAgICAgICAgICAgICAgIHNjb3BlOiBcIm5vbi1leHBpcmluZ1wiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdldENvbmZpZygpIHtcbiAgICAgICAgICAgIHJldHVybiBfY29uZmlnUGFyYW1zO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZldGNoQ29uZmlnOiBmZXRjaENvbmZpZyxcbiAgICAgICAgICAgIGdldENvbmZpZzogZ2V0Q29uZmlnLFxuICAgICAgICAgICAgc2V0Q29uZmlnOiBzZXRDb25maWdcbiAgICAgICAgfTtcbiAgICB9KTtcblxuICAgIC8vIEFVVEhfRVZFTlRTIGlzIHVzZWQgdGhyb3VnaG91dCBvdXIgYXBwIHRvXG4gICAgLy8gYnJvYWRjYXN0IGFuZCBsaXN0ZW4gZnJvbSBhbmQgdG8gdGhlICRyb290U2NvcGVcbiAgICAvLyBmb3IgaW1wb3J0YW50IGV2ZW50cyBhYm91dCBhdXRoZW50aWNhdGlvbiBmbG93LlxuICAgIC8vIGFwcC5jb25zdGFudCgnQVVUSF9FVkVOVFMnLCB7XG4gICAgLy8gICAgIGxvZ2luU3VjY2VzczogJ2F1dGgtbG9naW4tc3VjY2VzcycsXG4gICAgLy8gICAgIGxvZ2luRmFpbGVkOiAnYXV0aC1sb2dpbi1mYWlsZWQnLFxuICAgIC8vICAgICBsb2dvdXRTdWNjZXNzOiAnYXV0aC1sb2dvdXQtc3VjY2VzcycsXG4gICAgLy8gICAgIHNlc3Npb25UaW1lb3V0OiAnYXV0aC1zZXNzaW9uLXRpbWVvdXQnLFxuICAgIC8vICAgICBub3RBdXRoZW50aWNhdGVkOiAnYXV0aC1ub3QtYXV0aGVudGljYXRlZCcsXG4gICAgLy8gICAgIG5vdEF1dGhvcml6ZWQ6ICdhdXRoLW5vdC1hdXRob3JpemVkJ1xuICAgIC8vIH0pO1xuXG4gICAgLy8gYXBwLmZhY3RvcnkoJ0F1dGhJbnRlcmNlcHRvcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRxLCBBVVRIX0VWRU5UUykge1xuICAgIC8vICAgICB2YXIgc3RhdHVzRGljdCA9IHtcbiAgICAvLyAgICAgICAgIDQwMTogQVVUSF9FVkVOVFMubm90QXV0aGVudGljYXRlZCxcbiAgICAvLyAgICAgICAgIDQwMzogQVVUSF9FVkVOVFMubm90QXV0aG9yaXplZCxcbiAgICAvLyAgICAgICAgIDQxOTogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsXG4gICAgLy8gICAgICAgICA0NDA6IEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0XG4gICAgLy8gICAgIH07XG4gICAgLy8gICAgIHJldHVybiB7XG4gICAgLy8gICAgICAgICByZXNwb25zZUVycm9yOiBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgIC8vICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChzdGF0dXNEaWN0W3Jlc3BvbnNlLnN0YXR1c10sIHJlc3BvbnNlKTtcbiAgICAvLyAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlc3BvbnNlKVxuICAgIC8vICAgICAgICAgfVxuICAgIC8vICAgICB9O1xuICAgIC8vIH0pO1xuXG4gICAgLy8gYXBwLmNvbmZpZyhmdW5jdGlvbigkaHR0cFByb3ZpZGVyKSB7XG4gICAgLy8gICAgICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goW1xuICAgIC8vICAgICAgICAgJyRpbmplY3RvcicsXG4gICAgLy8gICAgICAgICBmdW5jdGlvbigkaW5qZWN0b3IpIHtcbiAgICAvLyAgICAgICAgICAgICByZXR1cm4gJGluamVjdG9yLmdldCgnQXV0aEludGVyY2VwdG9yJyk7XG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgIF0pO1xuICAgIC8vIH0pO1xuXG4gICAgLy8gYXBwLnNlcnZpY2UoJ0F1dGhTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIFNlc3Npb24sICRyb290U2NvcGUsIEFVVEhfRVZFTlRTLCAkcSkge1xuXG4gICAgLy8gICAgIGZ1bmN0aW9uIG9uU3VjY2Vzc2Z1bExvZ2luKHJlc3BvbnNlKSB7XG4gICAgLy8gICAgICAgICB2YXIgZGF0YSA9IHJlc3BvbnNlLmRhdGE7XG4gICAgLy8gICAgICAgICBTZXNzaW9uLmNyZWF0ZShkYXRhLmlkLCBkYXRhLnVzZXIpO1xuICAgIC8vICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcyk7XG4gICAgLy8gICAgICAgICByZXR1cm4gZGF0YS51c2VyO1xuICAgIC8vICAgICB9XG5cbiAgICAvLyAgICAgLy8gVXNlcyB0aGUgc2Vzc2lvbiBmYWN0b3J5IHRvIHNlZSBpZiBhblxuICAgIC8vICAgICAvLyBhdXRoZW50aWNhdGVkIHVzZXIgaXMgY3VycmVudGx5IHJlZ2lzdGVyZWQuXG4gICAgLy8gICAgIHRoaXMuaXNBdXRoZW50aWNhdGVkID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gICAgICAgICByZXR1cm4gISFTZXNzaW9uLnVzZXI7XG4gICAgLy8gICAgIH07XG5cbiAgICAvLyAgICAgdGhpcy5nZXRMb2dnZWRJblVzZXIgPSBmdW5jdGlvbihmcm9tU2VydmVyKSB7XG5cbiAgICAvLyAgICAgICAgIC8vIElmIGFuIGF1dGhlbnRpY2F0ZWQgc2Vzc2lvbiBleGlzdHMsIHdlXG4gICAgLy8gICAgICAgICAvLyByZXR1cm4gdGhlIHVzZXIgYXR0YWNoZWQgdG8gdGhhdCBzZXNzaW9uXG4gICAgLy8gICAgICAgICAvLyB3aXRoIGEgcHJvbWlzZS4gVGhpcyBlbnN1cmVzIHRoYXQgd2UgY2FuXG4gICAgLy8gICAgICAgICAvLyBhbHdheXMgaW50ZXJmYWNlIHdpdGggdGhpcyBtZXRob2QgYXN5bmNocm9ub3VzbHkuXG5cbiAgICAvLyAgICAgICAgIC8vIE9wdGlvbmFsbHksIGlmIHRydWUgaXMgZ2l2ZW4gYXMgdGhlIGZyb21TZXJ2ZXIgcGFyYW1ldGVyLFxuICAgIC8vICAgICAgICAgLy8gdGhlbiB0aGlzIGNhY2hlZCB2YWx1ZSB3aWxsIG5vdCBiZSB1c2VkLlxuXG4gICAgLy8gICAgICAgICBpZiAodGhpcy5pc0F1dGhlbnRpY2F0ZWQoKSAmJiBmcm9tU2VydmVyICE9PSB0cnVlKSB7XG4gICAgLy8gICAgICAgICAgICAgcmV0dXJuICRxLndoZW4oU2Vzc2lvbi51c2VyKTtcbiAgICAvLyAgICAgICAgIH1cblxuICAgIC8vICAgICAgICAgLy8gTWFrZSByZXF1ZXN0IEdFVCAvc2Vzc2lvbi5cbiAgICAvLyAgICAgICAgIC8vIElmIGl0IHJldHVybnMgYSB1c2VyLCBjYWxsIG9uU3VjY2Vzc2Z1bExvZ2luIHdpdGggdGhlIHJlc3BvbnNlLlxuICAgIC8vICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIDQwMSByZXNwb25zZSwgd2UgY2F0Y2ggaXQgYW5kIGluc3RlYWQgcmVzb2x2ZSB0byBudWxsLlxuICAgIC8vICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL3Nlc3Npb24nKS50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKS5jYXRjaChmdW5jdGlvbigpIHtcbiAgICAvLyAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAvLyAgICAgICAgIH0pO1xuXG4gICAgLy8gICAgIH07XG5cbiAgICAvLyAgICAgdGhpcy5sb2dpbiA9IGZ1bmN0aW9uKGNyZWRlbnRpYWxzKSB7XG4gICAgLy8gICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2xvZ2luJywgY3JlZGVudGlhbHMpXG4gICAgLy8gICAgICAgICAgICAgLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pXG4gICAgLy8gICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcbiAgICAvLyAgICAgICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICdJbnZhbGlkIGxvZ2luIGNyZWRlbnRpYWxzLidcbiAgICAvLyAgICAgICAgICAgICAgICAgfSk7XG4gICAgLy8gICAgICAgICAgICAgfSk7XG4gICAgLy8gICAgIH07XG5cbiAgICAvLyAgICAgdGhpcy5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICAgICAgICAgIFNlc3Npb24uZGVzdHJveSgpO1xuICAgIC8vICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzKTtcbiAgICAvLyAgICAgICAgIH0pO1xuICAgIC8vICAgICB9O1xuICAgIC8vIH0pO1xuXG4gICAgLy8gYXBwLnNlcnZpY2UoJ1Nlc3Npb24nLCBmdW5jdGlvbigkcm9vdFNjb3BlLCBBVVRIX0VWRU5UUykge1xuXG4gICAgLy8gICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIC8vICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLCBmdW5jdGlvbigpIHtcbiAgICAvLyAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgIC8vICAgICB9KTtcblxuICAgIC8vICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgZnVuY3Rpb24oKSB7XG4gICAgLy8gICAgICAgICBzZWxmLmRlc3Ryb3koKTtcbiAgICAvLyAgICAgfSk7XG5cbiAgICAvLyAgICAgdGhpcy5pZCA9IG51bGw7XG4gICAgLy8gICAgIHRoaXMudXNlciA9IG51bGw7XG5cbiAgICAvLyAgICAgdGhpcy5jcmVhdGUgPSBmdW5jdGlvbihzZXNzaW9uSWQsIHVzZXIpIHtcbiAgICAvLyAgICAgICAgIHRoaXMuaWQgPSBzZXNzaW9uSWQ7XG4gICAgLy8gICAgICAgICB0aGlzLnVzZXIgPSB1c2VyO1xuICAgIC8vICAgICB9O1xuXG4gICAgLy8gICAgIHRoaXMuZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICAgICAgdGhpcy5pZCA9IG51bGw7XG4gICAgLy8gICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuICAgIC8vICAgICB9O1xuXG4gICAgLy8gfSk7XG5cbn0pKCk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYWRtaW4nLCB7XG4gICAgdXJsOiAnL2FkbWluJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2xvZ2luL2xvZ2luLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdBZG1pbkxvZ2luQ29udHJvbGxlcidcbiAgfSk7XG59KTtcblxuXG5hcHAuY29udHJvbGxlcignQWRtaW5Mb2dpbkNvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsIEF1dGhTZXJ2aWNlLCBvRW1iZWRGYWN0b3J5KSB7XG4gICRzY29wZS5jb3VudGVyID0gMDtcbiAgJHNjb3BlLnNob3dpbmdFbGVtZW50cyA9IFtdO1xuICAkc2NvcGUuc3VibWlzc2lvbnMgPSBbXTtcblxuICAkc2NvcGUubG9naW4gPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAucG9zdCgnL2FwaS9sb2dpbicsIHtcbiAgICAgIHBhc3N3b3JkOiAkc2NvcGUucGFzc3dvcmRcbiAgICB9KS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgJHJvb3RTY29wZS5wYXNzd29yZCA9ICRzY29wZS5wYXNzd29yZDtcbiAgICAgICRzY29wZS5zaG93U3VibWlzc2lvbnMgPSB0cnVlO1xuICAgICAgJHNjb3BlLmxvYWRTdWJtaXNzaW9ucygpO1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICBhbGVydCgnV3JvbmcgUGFzc3dvcmQnKTtcbiAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAkaHR0cC5nZXQoJy9hcGkvbG9nb3V0JykudGhlbihmdW5jdGlvbigpIHtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hZG1pbic7XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgYWxlcnQoJ1dyb25nIFBhc3N3b3JkJyk7XG4gICAgfSk7XG4gIH1cblxuICAkc2NvcGUubWFuYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgIFxuICAgIFNDLmNvbm5lY3QoKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRyb290U2NvcGUuYWNjZXNzVG9rZW4gPSByZXMub2F1dGhfdG9rZW47XG4gICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2xvZ2luL2F1dGhlbnRpY2F0ZWQnLCB7XG4gICAgICAgICAgdG9rZW46IHJlcy5vYXV0aF90b2tlbixcbiAgICAgICAgICBwYXNzd29yZDogJHJvb3RTY29wZS5wYXNzd29yZCxcbiAgICAgICAgfSlcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgJHJvb3RTY29wZS5zY2hlZHVsZXJJbmZvID0gcmVzLmRhdGE7XG4gICAgICAgICRyb290U2NvcGUuc2NoZWR1bGVySW5mby5ldmVudHMuZm9yRWFjaChmdW5jdGlvbihldikge1xuICAgICAgICAgIGV2LmRheSA9IG5ldyBEYXRlKGV2LmRheSk7XG4gICAgICAgIH0pO1xuICAgICAgICAkc3RhdGUuZ28oJ3NjaGVkdWxlcicpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBhbGVydCgnRXJyb3I6IENvdWxkIG5vdCBsb2cgaW4nKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9XG59KTsiLCJhcHAuZmFjdG9yeSgnb0VtYmVkRmFjdG9yeScsIGZ1bmN0aW9uKCl7XG5cdHJldHVybiB7XG5cdFx0ZW1iZWRTb25nOiBmdW5jdGlvbihzdWIpIHtcblx0ICAgICAgICByZXR1cm4gU0Mub0VtYmVkKFwiaHR0cDovL2FwaS5zb3VuZGNsb3VkLmNvbS90cmFja3MvXCIgKyBzdWIudHJhY2tJRCwge1xuXHQgICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc3ViLnRyYWNrSUQgKyBcInBsYXllclwiKSxcblx0ICAgICAgICAgIGF1dG9fcGxheTogZmFsc2UsXG5cdCAgICAgICAgICBtYXhoZWlnaHQ6IDE1MFxuXHQgICAgICAgIH0pO1xuXHRcdH1cblx0fTtcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3BheScsIHtcbiAgICB1cmw6ICcvcGF5LzpzdWJtaXNzaW9uSUQnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvcGF5L3BheS5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnUGF5Q29udHJvbGxlcicsXG4gICAgcmVzb2x2ZToge1xuICAgICAgY2hhbm5lbHM6IGZ1bmN0aW9uKCRodHRwKSB7XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvY2hhbm5lbHMnKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgIH0pXG4gICAgICB9LFxuICAgICAgc3VibWlzc2lvbjogZnVuY3Rpb24oJGh0dHAsICRzdGF0ZVBhcmFtcykge1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3N1Ym1pc3Npb25zL3dpdGhJRC8nICsgJHN0YXRlUGFyYW1zLnN1Ym1pc3Npb25JRClcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcbiAgICAgICAgICB9KVxuICAgICAgfSxcbiAgICAgIHRyYWNrOiBmdW5jdGlvbihzdWJtaXNzaW9uKSB7XG4gICAgICAgIHJldHVybiBTQy5nZXQoJy90cmFja3MvJyArIHN1Ym1pc3Npb24udHJhY2tJRClcbiAgICAgICAgICAudGhlbihmdW5jdGlvbih0cmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIHRyYWNrO1xuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59KTtcblxuYXBwLmZpbHRlcignY2FsY3VsYXRlRGlzY291bnQnLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgcmV0dXJuIHBhcnNlRmxvYXQoaW5wdXQgKiAwLjkwKS50b0ZpeGVkKDIpO1xuICB9O1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdQYXlDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlLCAkaHR0cCwgY2hhbm5lbHMsIHN1Ym1pc3Npb24sIHRyYWNrLCAkc3RhdGUsICR1aWJNb2RhbCkge1xuICAkcm9vdFNjb3BlLnN1Ym1pc3Npb24gPSBzdWJtaXNzaW9uO1xuICAkc2NvcGUuYXVETExpbmsgPSBmYWxzZTtcbiAgaWYgKHN1Ym1pc3Npb24ucGFpZCkgJHN0YXRlLmdvKCdob21lJyk7XG4gICRzY29wZS50cmFjayA9IHRyYWNrO1xuICBTQy5vRW1iZWQodHJhY2sudXJpLCB7XG4gICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUGxheWVyJyksXG4gICAgYXV0b19wbGF5OiBmYWxzZSxcbiAgICBtYXhoZWlnaHQ6IDE1MFxuICB9KTtcbiAgJHNjb3BlLnRvdGFsID0gMDtcbiAgJHNjb3BlLnNob3dUb3RhbCA9IDA7XG4gICRzY29wZS5jaGFubmVscyA9IGNoYW5uZWxzLmZpbHRlcihmdW5jdGlvbihjaCkge1xuICAgIHJldHVybiAoc3VibWlzc2lvbi5jaGFubmVsSURTLmluZGV4T2YoY2guY2hhbm5lbElEKSAhPSAtMSlcbiAgfSk7XG5cbiAgJHNjb3BlLmF1RExMaW5rID0gJHNjb3BlLnRyYWNrLnB1cmNoYXNlX3VybCA/ICgkc2NvcGUudHJhY2sucHVyY2hhc2VfdXJsLmluZGV4T2YoXCJhcnRpc3RzdW5saW1pdGVkLmNvXCIpICE9IC0xKSA6IGZhbHNlO1xuXG4gICRzY29wZS5zZWxlY3RlZENoYW5uZWxzID0ge307XG4gICRzY29wZS5jaGFubmVscy5mb3JFYWNoKGZ1bmN0aW9uKGNoKSB7XG4gICAgJHNjb3BlLnNlbGVjdGVkQ2hhbm5lbHNbY2guZGlzcGxheU5hbWVdID0gZmFsc2U7XG4gIH0pO1xuXG4gICRzY29wZS5nb1RvTG9naW4gPSBmdW5jdGlvbigpIHtcbiAgICAkc3RhdGUuZ28oJ2xvZ2luJywge1xuICAgICAgJ3N1Ym1pc3Npb24nOiAkcm9vdFNjb3BlLnN1Ym1pc3Npb25cbiAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5yZWNhbGN1bGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS50b3RhbCA9IDA7XG4gICAgJHNjb3BlLnRvdGFsUGF5bWVudCA9IDA7XG4gICAgZm9yICh2YXIga2V5IGluICRzY29wZS5zZWxlY3RlZENoYW5uZWxzKSB7XG4gICAgICBpZiAoJHNjb3BlLnNlbGVjdGVkQ2hhbm5lbHNba2V5XSkge1xuICAgICAgICB2YXIgY2hhbiA9ICRzY29wZS5jaGFubmVscy5maW5kKGZ1bmN0aW9uKGNoKSB7XG4gICAgICAgICAgcmV0dXJuIGNoLmRpc3BsYXlOYW1lID09IGtleTtcbiAgICAgICAgfSlcbiAgICAgICAgJHNjb3BlLnRvdGFsICs9IGNoYW4ucHJpY2U7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICgkc2NvcGUuYXVETExpbmspICRzY29wZS50b3RhbCA9IE1hdGguZmxvb3IoMC45ICogJHNjb3BlLnRvdGFsKTtcbiAgfVxuXG4gICRzY29wZS5tYWtlUGF5bWVudCA9IGZ1bmN0aW9uKCkge1xuICAgIGNvbnNvbGUubG9nKCdheScpO1xuICAgIGlmICgkc2NvcGUudG90YWwgIT0gMCkge1xuICAgICAgaWYgKCRzY29wZS5hdURMTGluaykge1xuICAgICAgICAkc2NvcGUuZGlzY291bnRNb2RhbEluc3RhbmNlID0gJHVpYk1vZGFsLm9wZW4oe1xuICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2Rpc2NvdW50TW9kYWwuaHRtbCcsXG4gICAgICAgICAgY29udHJvbGxlcjogJ2Rpc2NvdW50TW9kYWxDb250cm9sbGVyJyxcbiAgICAgICAgICBzY29wZTogJHNjb3BlXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJHNjb3BlLmNvbnRpbnVlUGF5KGZhbHNlKTtcbiAgICAgIH1cbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLmNvbnRpbnVlUGF5ID0gZnVuY3Rpb24oZGlzY291bnRlZCkge1xuICAgIGlmICgkc2NvcGUuZGlzY291bnRlZE1vZGFsKSB7XG4gICAgICAkc2NvcGUuZGlzY291bnRNb2RhbEluc3RhbmNlLmNsb3NlKCk7XG4gICAgfVxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICB2YXIgcHJpY2luZ09iaiA9IHtcbiAgICAgIGNoYW5uZWxzOiBbXSxcbiAgICAgIGRpc2NvdW50ZWQ6IGRpc2NvdW50ZWQsXG4gICAgICBzdWJtaXNzaW9uOiAkcm9vdFNjb3BlLnN1Ym1pc3Npb25cbiAgICB9O1xuICAgIGZvciAodmFyIGtleSBpbiAkc2NvcGUuc2VsZWN0ZWRDaGFubmVscykge1xuICAgICAgaWYgKCRzY29wZS5zZWxlY3RlZENoYW5uZWxzW2tleV0pIHtcbiAgICAgICAgdmFyIGNoYW4gPSAkc2NvcGUuY2hhbm5lbHMuZmluZChmdW5jdGlvbihjaCkge1xuICAgICAgICAgIHJldHVybiBjaC5kaXNwbGF5TmFtZSA9PSBrZXk7XG4gICAgICAgIH0pXG4gICAgICAgIHByaWNpbmdPYmouY2hhbm5lbHMucHVzaChjaGFuLmNoYW5uZWxJRCk7XG4gICAgICB9XG4gICAgfVxuICAgICRodHRwLnBvc3QoJy9hcGkvc3VibWlzc2lvbnMvZ2V0UGF5bWVudCcsIHByaWNpbmdPYmopXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgd2luZG93LmxvY2F0aW9uID0gcmVzLmRhdGE7XG4gICAgICB9KVxuICB9XG5cblxuICAkc2NvcGUuYWRkVG9DYXJ0ID0gZnVuY3Rpb24oY2hhbm5lbCkge1xuICAgIGNvbnNvbGUubG9nKCRzY29wZS5zZWxlY3RlZENoYW5uZWxzKTtcbiAgICBpZiAoY2hhbm5lbC5hZGR0b2NhcnQpIHtcbiAgICAgICRzY29wZS50b3RhbCA9ICRzY29wZS50b3RhbCAtIGNoYW5uZWwucHJpY2U7XG4gICAgfSBlbHNlIHtcbiAgICAgICRzY29wZS50b3RhbCArPSBjaGFubmVsLnByaWNlO1xuICAgIH1cbiAgICBpZiAoJHNjb3BlLmF1RExMaW5rKSAkc2NvcGUuc2hvd1RvdGFsID0gcGFyc2VGbG9hdCgkc2NvcGUudG90YWwgKiAwLjkpLnRvRml4ZWQoMik7XG4gICAgZWxzZSAkc2NvcGUuc2hvd1RvdGFsID0gJHNjb3BlLnRvdGFsO1xuXG4gICAgJHNjb3BlLnNlbGVjdGVkQ2hhbm5lbHNbY2hhbm5lbC5kaXNwbGF5TmFtZV0gPSAkc2NvcGUuc2VsZWN0ZWRDaGFubmVsc1tjaGFubmVsLmRpc3BsYXlOYW1lXSA9PSB0cnVlID8gZmFsc2UgOiB0cnVlO1xuXG4gICAgY2hhbm5lbC5hZGR0b2NhcnQgPSBjaGFubmVsLmFkZHRvY2FydCA/IGZhbHNlIDogdHJ1ZTtcbiAgfTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdkaXNjb3VudE1vZGFsQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSkge1xuXG59KSIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2NvbXBsZXRlJywge1xuICAgIHVybDogJy9jb21wbGV0ZScsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9wYXkvdGhhbmt5b3UuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ1RoYW5reW91Q29udHJvbGxlcidcbiAgfSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ1RoYW5reW91Q29udHJvbGxlcicsIGZ1bmN0aW9uKCRodHRwLCAkc2NvcGUsICRsb2NhdGlvbikge1xuICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICRodHRwLnB1dCgnL2FwaS9zdWJtaXNzaW9ucy9jb21wbGV0ZWRQYXltZW50JywgJGxvY2F0aW9uLnNlYXJjaCgpKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICRzY29wZS5zdWJtaXNzaW9uID0gcmVzLmRhdGEuc3VibWlzc2lvbjtcbiAgICAgICRzY29wZS5ldmVudHMgPSByZXMuZGF0YS5ldmVudHM7XG4gICAgICAkc2NvcGUuZXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXYpIHtcbiAgICAgICAgZXYuZGF0ZSA9IG5ldyBEYXRlKGV2LmRhdGUpO1xuICAgICAgfSlcbiAgICB9KVxuICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycil7XG4gICAgICBhbGVydCgnVGhlcmUgd2FzIGFuIGVycm9yIHByb2Nlc3NpbmcgeW91ciByZXF1ZXN0Jyk7XG4gICAgfSlcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3NjaGVkdWxlcicsIHtcbiAgICB1cmw6ICcvc2NoZWR1bGVyJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL3NjaGVkdWxlci9zY2hlZHVsZXIuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ1NjaGVkdWxlckNvbnRyb2xsZXInXG4gIH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ1NjaGVkdWxlckNvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsIEF1dGhTZXJ2aWNlLCAkd2luZG93KSB7XG5cbiAgJHNjb3BlLm1ha2VFdmVudFVSTCA9IFwiXCI7XG4gICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICB2YXIgaW5mbyA9ICRyb290U2NvcGUuc2NoZWR1bGVySW5mbztcbiAgaWYgKCFpbmZvKSB7XG4gICAgJHN0YXRlLmdvKCdhZG1pbicpO1xuICB9XG4gICRzY29wZS5jaGFubmVsID0gaW5mby5jaGFubmVsO1xuICAkc2NvcGUuc3VibWlzc2lvbnMgPSBpbmZvLnN1Ym1pc3Npb25zO1xuXG4gICRzY29wZS5jYWxlbmRhciA9IGZpbGxEYXRlQXJyYXlzKGluZm8uZXZlbnRzKTtcbiAgJHNjb3BlLmRheUluY3IgPSAwO1xuXG4gICRzY29wZS5iYWNrID0gZnVuY3Rpb24oKSB7XG4gICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuXG4gIH1cblxuICAkc2NvcGUuc2F2ZUNoYW5uZWwgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJHNjb3BlLmNoYW5uZWwucGFzc3dvcmQgPSAkcm9vdFNjb3BlLnBhc3N3b3JkO1xuICAgICRodHRwLnB1dChcIi9hcGkvY2hhbm5lbHNcIiwgJHNjb3BlLmNoYW5uZWwpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgd2luZG93LmFsZXJ0KFwiU2F2ZWRcIik7XG4gICAgICAgICRzY29wZS5jaGFubmVsID0gcmVzLmRhdGE7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIHdpbmRvdy5hbGVydChcIkVycm9yOiBkaWQgbm90IHNhdmVcIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5pbmNyRGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCRzY29wZS5kYXlJbmNyIDwgMTQpICRzY29wZS5kYXlJbmNyKys7XG4gIH1cblxuICAkc2NvcGUuZGVjckRheSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc2NvcGUuZGF5SW5jciA+IDApICRzY29wZS5kYXlJbmNyLS07XG4gIH1cblxuICAkc2NvcGUuY2xpY2tlZFNsb3QgPSBmdW5jdGlvbihkYXksIGhvdXIpIHtcbiAgICB2YXIgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgIGlmICh0b2RheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSBkYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgJiYgdG9kYXkuZ2V0SG91cnMoKSA+IGhvdXIpIHJldHVybjtcbiAgICAkc2NvcGUuc2hvd092ZXJsYXkgPSB0cnVlO1xuICAgIHZhciBjYWxEYXkgPSB7fTtcbiAgICB2YXIgY2FsZW5kYXJEYXkgPSAkc2NvcGUuY2FsZW5kYXIuZmluZChmdW5jdGlvbihjYWxEKSB7XG4gICAgICByZXR1cm4gY2FsRC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpO1xuICAgIH0pO1xuICAgICRzY29wZS5tYWtlRXZlbnRVUkwgPSB1bmRlZmluZWQ7XG4gICAgJHNjb3BlLm1ha2VFdmVudCA9IGNhbGVuZGFyRGF5LmV2ZW50c1tob3VyXTtcbiAgICBpZiAoJHNjb3BlLm1ha2VFdmVudCA9PSBcIi1cIikge1xuICAgICAgdmFyIG1ha2VEYXkgPSBuZXcgRGF0ZShkYXkpO1xuICAgICAgbWFrZURheS5zZXRIb3Vycyhob3VyKTtcbiAgICAgICRzY29wZS5tYWtlRXZlbnQgPSB7XG4gICAgICAgIGNoYW5uZWxJRDogJHNjb3BlLmNoYW5uZWwuY2hhbm5lbElELFxuICAgICAgICBkYXk6IG1ha2VEYXksXG4gICAgICAgIHBhaWQ6IGZhbHNlXG4gICAgICB9O1xuICAgICAgJHNjb3BlLm5ld0V2ZW50ID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLm1ha2VFdmVudFVSTCA9ICdodHRwczovL2FwaS5zb3VuZGNsb3VkLmNvbS90cmFja3MvJyArICRzY29wZS5tYWtlRXZlbnQudHJhY2tJRDtcbiAgICAgIFNDLm9FbWJlZCgnaHR0cHM6Ly9hcGkuc291bmRjbG91ZC5jb20vdHJhY2tzLycgKyAkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQsIHtcbiAgICAgICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUGxheWVyJyksXG4gICAgICAgIGF1dG9fcGxheTogZmFsc2UsXG4gICAgICAgIG1heGhlaWdodDogMTUwXG4gICAgICB9KTtcbiAgICAgICRzY29wZS5uZXdFdmVudCA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gICRzY29wZS5jaGFuZ2VQYWlkID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLm1ha2VFdmVudC50cmFja0lEID0gdW5kZWZpbmVkO1xuICAgICRzY29wZS5tYWtlRXZlbnRVUkwgPSB1bmRlZmluZWQ7XG4gIH1cblxuICAkc2NvcGUuY2hhbmdlVVJMID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLnBvc3QoJy9hcGkvc291bmRjbG91ZC9yZXNvbHZlJywge1xuICAgICAgICB1cmw6ICRzY29wZS5tYWtlRXZlbnRVUkxcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC50cmFja0lEID0gcmVzLmRhdGEuaWQ7XG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQudGl0bGUgPSByZXMuZGF0YS50aXRsZTtcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC50cmFja1VSTCA9IHJlcy5kYXRhLnRyYWNrVVJMO1xuICAgICAgICBpZiAocmVzLmRhdGEudXNlcikgJHNjb3BlLm1ha2VFdmVudC5hcnRpc3ROYW1lID0gcmVzLmRhdGEudXNlci51c2VybmFtZTtcbiAgICAgICAgU0Mub0VtYmVkKCRzY29wZS5tYWtlRXZlbnRVUkwsIHtcbiAgICAgICAgICBlbGVtZW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKSxcbiAgICAgICAgICBhdXRvX3BsYXk6IGZhbHNlLFxuICAgICAgICAgIG1heGhlaWdodDogMTUwXG4gICAgICAgIH0pXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcbiAgICAgICAgJHNjb3BlLm5vdEZvdW5kID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KS50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgICAgJHNjb3BlLm5vdEZvdW5kID0gdHJ1ZTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmRlbGV0ZUV2ZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCEkc2NvcGUubmV3RXZlbnQpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICRodHRwLmRlbGV0ZSgnL2FwaS9ldmVudHMvJyArICRzY29wZS5tYWtlRXZlbnQuX2lkICsgJy8nICsgJHJvb3RTY29wZS5wYXNzd29yZClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgdmFyIGNhbGVuZGFyRGF5ID0gJHNjb3BlLmNhbGVuZGFyLmZpbmQoZnVuY3Rpb24oY2FsRCkge1xuICAgICAgICAgICAgcmV0dXJuIGNhbEQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09ICRzY29wZS5tYWtlRXZlbnQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpO1xuICAgICAgICAgIH0pO1xuICAgICAgICAgIGNhbGVuZGFyRGF5LmV2ZW50c1skc2NvcGUubWFrZUV2ZW50LmRheS5nZXRIb3VycygpXSA9IFwiLVwiO1xuICAgICAgICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgd2luZG93LmFsZXJ0KFwiRGVsZXRlZFwiKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJFUlJPUjogZGlkIG5vdCBEZWxldGUuXCIpXG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgY2FsZW5kYXJEYXkgPSAkc2NvcGUuY2FsZW5kYXIuZmluZChmdW5jdGlvbihjYWxEKSB7XG4gICAgICAgIHJldHVybiBjYWxELmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSAkc2NvcGUubWFrZUV2ZW50LmRheS50b0xvY2FsZURhdGVTdHJpbmcoKTtcbiAgICAgIH0pO1xuICAgICAgY2FsZW5kYXJEYXkuZXZlbnRzWyRzY29wZS5tYWtlRXZlbnQuZ2V0SG91cnMoKV0gPSBcIi1cIjtcbiAgICAgIHZhciBldmVudHNcbiAgICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gICRzY29wZS5zYXZlRXZlbnQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoISRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCAmJiAhJHNjb3BlLm1ha2VFdmVudC5wYWlkKSB7XG4gICAgICB3aW5kb3cuYWxlcnQoXCJFbnRlciBhIHRyYWNrIFVSTFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCRzY29wZS5uZXdFdmVudCkge1xuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnBhc3N3b3JkID0gJHJvb3RTY29wZS5wYXNzd29yZDtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgICAkaHR0cC5wb3N0KCcvYXBpL2V2ZW50cycsICRzY29wZS5tYWtlRXZlbnQpXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB2YXIgZXZlbnQgPSByZXMuZGF0YTtcbiAgICAgICAgICAgIGV2ZW50LmRheSA9IG5ldyBEYXRlKGV2ZW50LmRheSk7XG4gICAgICAgICAgICB2YXIgY2FsZW5kYXJEYXkgPSAkc2NvcGUuY2FsZW5kYXIuZmluZChmdW5jdGlvbihjYWxEKSB7XG4gICAgICAgICAgICAgIHJldHVybiBjYWxELmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSBldmVudC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNhbGVuZGFyRGF5LmV2ZW50c1tldmVudC5kYXkuZ2V0SG91cnMoKV0gPSBldmVudDtcbiAgICAgICAgICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHdpbmRvdy5hbGVydChcIlNhdmVkXCIpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgd2luZG93LmFsZXJ0KFwiRVJST1I6IGRpZCBub3QgU2F2ZS5cIik7XG4gICAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkc2NvcGUubmV3RXZlbnQucGFzc3dvcmQgPSAkcm9vdFNjb3BlLnBhc3N3b3JkO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAgICRodHRwLnB1dCgnL2FwaS9ldmVudHMnLCAkc2NvcGUubWFrZUV2ZW50KVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdmFyIGV2ZW50ID0gcmVzLmRhdGE7XG4gICAgICAgICAgICBldmVudC5kYXkgPSBuZXcgRGF0ZShldmVudC5kYXkpO1xuICAgICAgICAgICAgdmFyIGNhbGVuZGFyRGF5ID0gJHNjb3BlLmNhbGVuZGFyLmZpbmQoZnVuY3Rpb24oY2FsRCkge1xuICAgICAgICAgICAgICByZXR1cm4gY2FsRC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gZXZlbnQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjYWxlbmRhckRheS5ldmVudHNbZXZlbnQuZ2V0SG91cnMoKV0gPSBldmVudDtcbiAgICAgICAgICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHdpbmRvdy5hbGVydChcIlNhdmVkXCIpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgd2luZG93LmFsZXJ0KFwiRVJST1I6IGRpZCBub3QgU2F2ZS5cIik7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLmVtYWlsU2xvdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBtYWlsdG9fbGluayA9IFwibWFpbHRvOmNvYXlzY3VlQGdtYWlsLmNvbT9zdWJqZWN0PVJlcG9zdCBvZiBcIiArICRzY29wZS5tYWtlRXZlbnQudGl0bGUgKyAnJmJvZHk9SGV5ICcgKyAkc2NvcGUubWFrZUV2ZW50LmFydGlzdE5hbWUgKyAnLFxcblxcbiBJIGFtIHJlcG9zdGluZyB5b3VyIHNvbmcgJyArICRzY29wZS5tYWtlRXZlbnQudGl0bGUgKyAnIG9uICcgKyAkc2NvcGUuY2hhbm5lbC5kaXNwbGF5TmFtZSArICcgb24gJyArICRzY29wZS5tYWtlRXZlbnQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpICsgJy5cXG5cXG4gQmVzdCwgXFxuJyArICRzY29wZS5jaGFubmVsLmRpc3BsYXlOYW1lO1xuICAgIGxvY2F0aW9uLmhyZWYgPSBlbmNvZGVVUkkobWFpbHRvX2xpbmspO1xuICB9XG5cbiAgLy8gJHNjb3BlLnNjRW1haWxTbG90ID0gZnVuY3Rpb24oKSB7XG5cbiAgLy8gfVxuXG4gICRzY29wZS5iYWNrRXZlbnQgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUubWFrZUV2ZW50ID0gbnVsbDtcbiAgICAkc2NvcGUuc2hvd092ZXJsYXkgPSBmYWxzZTtcbiAgfVxuXG4gICRzY29wZS5yZW1vdmVRdWV1ZVNvbmcgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICRzY29wZS5jaGFubmVsLnF1ZXVlLnNwbGljZShpbmRleCwgMSk7XG4gICAgJHNjb3BlLnNhdmVDaGFubmVsKCk7XG4gIH1cblxuICAkc2NvcGUuYWRkU29uZyA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc2NvcGUuY2hhbm5lbC5xdWV1ZS5pbmRleE9mKCRzY29wZS5uZXdRdWV1ZUlEKSAhPSAtMSkgcmV0dXJuO1xuICAgICRzY29wZS5jaGFubmVsLnF1ZXVlLnB1c2goJHNjb3BlLm5ld1F1ZXVlSUQpO1xuICAgICRzY29wZS5zYXZlQ2hhbm5lbCgpO1xuICAgICRzY29wZS5uZXdRdWV1ZVNvbmcgPSB1bmRlZmluZWQ7XG4gICAgJHNjb3BlLmNoYW5nZVF1ZXVlU29uZygpO1xuICAgICRzY29wZS5sb2FkUXVldWVTb25ncyhbJHNjb3BlLm5ld1F1ZXVlSURdKTtcbiAgfVxuXG4gICRzY29wZS5jaGFuZ2VRdWV1ZVNvbmcgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAucG9zdCgnL2FwaS9zb3VuZGNsb3VkL3Jlc29sdmUnLCB7XG4gICAgICAgIHVybDogJHNjb3BlLm5ld1F1ZXVlU29uZ1xuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB2YXIgdHJhY2sgPSByZXMuZGF0YTtcbiAgICAgICAgJHNjb3BlLm5ld1F1ZXVlSUQgPSB0cmFjay5pZDtcbiAgICAgIH0pXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgYWxlcnQoXCJlcnJvciBnZXR0aW5nIHNvbmdcIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5tb3ZlVXAgPSBmdW5jdGlvbihpbmRleCkge1xuICAgIGlmIChpbmRleCA9PSAwKSByZXR1cm47XG4gICAgdmFyIHMgPSAkc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleF07XG4gICAgJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXhdID0gJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXggLSAxXTtcbiAgICAkc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleCAtIDFdID0gcztcbiAgICAkc2NvcGUuc2F2ZUNoYW5uZWwoKTtcbiAgICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MoWyRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4XSwgJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXggLSAxXV0pO1xuICB9XG5cbiAgJHNjb3BlLm1vdmVEb3duID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICBpZiAoaW5kZXggPT0gJHNjb3BlLmNoYW5uZWwucXVldWUubGVuZ3RoIC0gMSkgcmV0dXJuO1xuICAgIHZhciBzID0gJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXhdO1xuICAgICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4XSA9ICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4ICsgMV07XG4gICAgJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXggKyAxXSA9IHM7XG4gICAgJHNjb3BlLnNhdmVDaGFubmVsKCk7XG4gICAgJHNjb3BlLmxvYWRRdWV1ZVNvbmdzKFskc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleF0sICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4ICsgMV1dKTtcbiAgfVxuXG4gIC8vICRzY29wZS5jYW5Mb3dlck9wZW5FdmVudHMgPSBmdW5jdGlvbigpIHtcbiAgLy8gICB2YXIgd2FpdGluZ1N1YnMgPSAkc2NvcGUuc3VibWlzc2lvbnMuZmlsdGVyKGZ1bmN0aW9uKHN1Yikge1xuICAvLyAgICAgcmV0dXJuIHN1Yi5pbnZvaWNlSUQ7XG4gIC8vICAgfSk7XG4gIC8vICAgdmFyIG9wZW5TbG90cyA9IFtdO1xuICAvLyAgICRzY29wZS5jYWxlbmRhci5mb3JFYWNoKGZ1bmN0aW9uKGRheSkge1xuICAvLyAgICAgZGF5LmV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2KSB7XG4gIC8vICAgICAgIGlmIChldi5wYWlkICYmICFldi50cmFja0lEKSBvcGVuU2xvdHMucHVzaChldik7XG4gIC8vICAgICB9KTtcbiAgLy8gICB9KTtcbiAgLy8gICB2YXIgb3Blbk51bSA9IG9wZW5TbG90cy5sZW5ndGggLSB3YWl0aW5nU3Vicy5sZW5ndGg7XG4gIC8vICAgcmV0dXJuIG9wZW5OdW0gPiAwO1xuICAvLyB9XG5cbiAgJHNjb3BlLmxvYWRTdWJtaXNzaW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUuc3VibWlzc2lvbnMuZm9yRWFjaChmdW5jdGlvbihzdWIpIHtcbiAgICAgICAgU0Mub0VtYmVkKFwiaHR0cDovL2FwaS5zb3VuZGNsb3VkLmNvbS90cmFja3MvXCIgKyBzdWIudHJhY2tJRCwge1xuICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHN1Yi50cmFja0lEICsgXCJwbGF5ZXJcIiksXG4gICAgICAgICAgYXV0b19wbGF5OiBmYWxzZSxcbiAgICAgICAgICBtYXhoZWlnaHQ6IDE1MFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sIDUwKTtcbiAgfVxuXG4gICRzY29wZS5sb2FkUXVldWVTb25ncyA9IGZ1bmN0aW9uKHF1ZXVlKSB7XG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgIHF1ZXVlLmZvckVhY2goZnVuY3Rpb24oc29uZ0lEKSB7XG4gICAgICAgIFNDLm9FbWJlZChcImh0dHA6Ly9hcGkuc291bmRjbG91ZC5jb20vdHJhY2tzL1wiICsgc29uZ0lELCB7XG4gICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc29uZ0lEICsgXCJwbGF5ZXJcIiksXG4gICAgICAgICAgYXV0b19wbGF5OiBmYWxzZSxcbiAgICAgICAgICBtYXhoZWlnaHQ6IDE1MFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH0sIDUwKTtcbiAgfVxuICBpZiAoJHNjb3BlLmNoYW5uZWwgJiYgJHNjb3BlLmNoYW5uZWwucXVldWUpIHtcbiAgICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MoJHNjb3BlLmNoYW5uZWwucXVldWUpO1xuICB9XG4gICRzY29wZS5sb2FkU3VibWlzc2lvbnMoKTtcblxufSk7XG5cbmZ1bmN0aW9uIGZpbGxEYXRlQXJyYXlzKGV2ZW50cykge1xuICB2YXIgY2FsZW5kYXIgPSBbXTtcbiAgdmFyIHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAyMTsgaSsrKSB7XG4gICAgdmFyIGNhbERheSA9IHt9O1xuICAgIGNhbERheS5kYXkgPSBuZXcgRGF0ZSgpXG4gICAgY2FsRGF5LmRheS5zZXREYXRlKHRvZGF5LmdldERhdGUoKSArIGkpO1xuICAgIHZhciBkYXlFdmVudHMgPSBldmVudHMuZmlsdGVyKGZ1bmN0aW9uKGV2KSB7XG4gICAgICByZXR1cm4gKGV2LmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSBjYWxEYXkuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpKTtcbiAgICB9KTtcbiAgICB2YXIgZXZlbnRBcnJheSA9IFtdO1xuICAgIGZvciAodmFyIGogPSAwOyBqIDwgMjQ7IGorKykge1xuICAgICAgZXZlbnRBcnJheVtqXSA9IFwiLVwiO1xuICAgIH1cbiAgICBkYXlFdmVudHMuZm9yRWFjaChmdW5jdGlvbihldikge1xuICAgICAgZXZlbnRBcnJheVtldi5kYXkuZ2V0SG91cnMoKV0gPSBldjtcbiAgICB9KTtcbiAgICBjYWxEYXkuZXZlbnRzID0gZXZlbnRBcnJheTtcbiAgICBjYWxlbmRhci5wdXNoKGNhbERheSk7XG4gIH1cbiAgcmV0dXJuIGNhbGVuZGFyO1xufSIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3N1Ym1pdFNvbmcnLCB7XG4gICAgdXJsOiAnL3N1Ym1pdCcsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9zdWJtaXQvc3VibWl0LnZpZXcuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ1N1Ym1pdFNvbmdDb250cm9sbGVyJ1xuICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignU3VibWl0U29uZ0NvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHApIHtcblxuICAkc2NvcGUuc3VibWlzc2lvbiA9IHt9O1xuXG4gICRzY29wZS51cmxDaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAucG9zdCgnL2FwaS9zb3VuZGNsb3VkL3Jlc29sdmUnLCB7XG4gICAgICAgIHVybDogJHNjb3BlLnVybFxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUuc3VibWlzc2lvbi50cmFja0lEID0gcmVzLmRhdGEuaWQ7XG4gICAgICAgICRzY29wZS5zdWJtaXNzaW9uLnRpdGxlID0gcmVzLmRhdGEudGl0bGU7XG4gICAgICAgICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrVVJMID0gcmVzLmRhdGEudHJhY2tVUkw7XG4gICAgICAgIFNDLm9FbWJlZCgkc2NvcGUuc3VibWlzc2lvbi50cmFja1VSTCwge1xuICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLFxuICAgICAgICAgIGF1dG9fcGxheTogZmFsc2UsXG4gICAgICAgICAgbWF4aGVpZ2h0OiAxNTBcbiAgICAgICAgfSlcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUGxheWVyJykuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAkc2NvcGUubm90Rm91bmQgPSBmYWxzZTtcbiAgICAgIH0pLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrSUQgPSBudWxsO1xuICAgICAgICAkc2NvcGUubm90Rm91bmQgPSB0cnVlO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghJHNjb3BlLnN1Ym1pc3Npb24uZW1haWwgfHwgISRzY29wZS5zdWJtaXNzaW9uLm5hbWUpIHtcbiAgICAgIGFsZXJ0KFwiUGxlYXNlIGZpbGwgaW4gYWxsIGZpZWxkc1wiKVxuICAgIH0gZWxzZSBpZiAoISRzY29wZS5zdWJtaXNzaW9uLnRyYWNrSUQpIHtcbiAgICAgIGFsZXJ0KFwiVHJhY2sgTm90IEZvdW5kXCIpO1xuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAkaHR0cC5wb3N0KCcvYXBpL3N1Ym1pc3Npb25zJywge1xuICAgICAgICAgIGVtYWlsOiAkc2NvcGUuc3VibWlzc2lvbi5lbWFpbCxcbiAgICAgICAgICB0cmFja0lEOiAkc2NvcGUuc3VibWlzc2lvbi50cmFja0lELFxuICAgICAgICAgIG5hbWU6ICRzY29wZS5zdWJtaXNzaW9uLm5hbWUsXG4gICAgICAgICAgdGl0bGU6ICRzY29wZS5zdWJtaXNzaW9uLnRpdGxlLFxuICAgICAgICAgIHRyYWNrVVJMOiAkc2NvcGUuc3VibWlzc2lvbi50cmFja1VSTCxcbiAgICAgICAgICBjaGFubmVsSURTOiBbXSxcbiAgICAgICAgICBpbnZvaWNlSURTOiBbXVxuICAgICAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhyZXMuZGF0YSk7XG4gICAgICAgICAgd2luZG93LmFsZXJ0KFwiWW91ciBzb25nIGhhcyBiZWVuIHN1Ym1pdHRlZCBhbmQgd2lsbCBiZSByZXZpZXdlZCBzb29uLlwiKTtcbiAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICB3aW5kb3cuYWxlcnQoXCJFcnJvcjogQ291bGQgbm90IHN1Ym1pdCBzb25nLlwiKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgLnN0YXRlKCdTQ1Jlc29sdmUnLCB7XG4gICAgICAgICAgICB1cmw6ICcvc2NyZXNvbHZlJyxcbiAgICAgICAgICAgIHRlbXBsYXRlVXJsOiAnanMvYXJ0aXN0VG9vbHMvU0NSZXNvbHZlL1NDUmVzb2x2ZS5odG1sJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdTQ1Jlc29sdmVDb250cm9sbGVyJ1xuICAgICAgICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdTQ1Jlc29sdmVDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkaHR0cCkge1xuICAgICRzY29wZS5yZXNwb25zZSA9IHt9O1xuICAgICRzY29wZS5yZXNvbHZlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICRodHRwLnBvc3QoJy9hcGkvc291bmRjbG91ZC9yZXNvbHZlJywge1xuICAgICAgICAgICAgICAgIHVybDogJHNjb3BlLnVybFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICRzY29wZS5yZXNwb25zZSA9IEpTT04uc3RyaW5naWZ5KHJlcy5kYXRhLCBudWxsLCBcIlxcdFwiKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUucmVzcG9uc2UpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICRzY29wZS5yZXNwb25zZSA9IEpTT04uc3RyaW5naWZ5KGVyciwgbnVsbCwgXCJcXHRcIik7XG4gICAgICAgICAgICB9KVxuICAgIH1cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2xvZ2luJywge1xuICAgICAgdXJsOiAnL2xvZ2luJyxcbiAgICAgIHBhcmFtczoge1xuICAgICAgICBzdWJtaXNzaW9uOiBudWxsXG4gICAgICB9LFxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hdXRoL3ZpZXdzL2xvZ2luLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0F1dGhDb250cm9sbGVyJ1xuICAgIH0pXG4gICAgLnN0YXRlKCdzaWdudXAnLCB7XG4gICAgICB1cmw6ICcvc2lnbnVwJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvYXV0aC92aWV3cy9zaWdudXAuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQXV0aENvbnRyb2xsZXInXG4gICAgfSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0F1dGhDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsICRzY29wZSwgJGh0dHAsICR1aWJNb2RhbCwgJHdpbmRvdywgQXV0aFNlcnZpY2UsIFNlc3Npb25TZXJ2aWNlLCBzb2NrZXQpIHtcbiAgJHNjb3BlLmxvZ2luT2JqID0ge307XG4gICRzY29wZS5tZXNzYWdlID0ge1xuICAgIHZhbDogJycsXG4gICAgdmlzaWJsZTogZmFsc2VcbiAgfTtcbiAgJHNjb3BlLm9wZW5Nb2RhbCA9IHtcbiAgICBzaWdudXBDb25maXJtOiBmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5tb2RhbEluc3RhbmNlID0gJHVpYk1vZGFsLm9wZW4oe1xuICAgICAgICBhbmltYXRpb246IHRydWUsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnc2lnbnVwQ29tcGxldGUuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ29udHJvbGxlcicsXG4gICAgICAgIHNjb3BlOiAkc2NvcGVcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbiAgJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICB2YWw6ICcnLFxuICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICB9O1xuICAgIEF1dGhTZXJ2aWNlXG4gICAgICAubG9naW4oJHNjb3BlLmxvZ2luT2JqKVxuICAgICAgLnRoZW4oaGFuZGxlTG9naW5SZXNwb25zZSlcbiAgICAgIC5jYXRjaChoYW5kbGVMb2dpbkVycm9yKVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlTG9naW5SZXNwb25zZShyZXMpIHtcbiAgICAgIGlmIChyZXMuc3RhdHVzID09PSAyMDAgJiYgcmVzLmRhdGEuc3VjY2Vzcykge1xuICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUocmVzLmRhdGEudXNlcik7XG4gICAgICAgICRzdGF0ZS5nbygnYXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlMaXN0Jyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgICAgICB2YWw6IHJlcy5kYXRhLm1lc3NhZ2UsXG4gICAgICAgICAgdmlzaWJsZTogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZUxvZ2luRXJyb3IocmVzKSB7XG4gICAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgICAgdmFsOiAnRXJyb3IgaW4gcHJvY2Vzc2luZyB5b3VyIHJlcXVlc3QnLFxuICAgICAgICB2aXNpYmxlOiB0cnVlXG4gICAgICB9O1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUuY2hlY2tJZlN1Ym1pc3Npb24gPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHN0YXRlUGFyYW1zLnN1Ym1pc3Npb24pIHtcbiAgICAgICRzY29wZS5zb3VuZGNsb3VkTG9naW4oKTtcbiAgICB9XG4gIH1cblxuXG4gICRzY29wZS5zaWdudXAgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgIHZhbDogJycsXG4gICAgICB2aXNpYmxlOiBmYWxzZVxuICAgIH07XG4gICAgaWYgKCRzY29wZS5zaWdudXBPYmoucGFzc3dvcmQgIT0gJHNjb3BlLnNpZ251cE9iai5jb25maXJtUGFzc3dvcmQpIHtcbiAgICAgICRzY29wZS5tZXNzYWdlID0ge1xuICAgICAgICB2YWw6ICdQYXNzd29yZCBkb2VzblxcJ3QgbWF0Y2ggd2l0aCBjb25maXJtIHBhc3N3b3JkJyxcbiAgICAgICAgdmlzaWJsZTogdHJ1ZVxuICAgICAgfTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgQXV0aFNlcnZpY2VcbiAgICAgIC5zaWdudXAoJHNjb3BlLnNpZ251cE9iailcbiAgICAgIC50aGVuKGhhbmRsZVNpZ251cFJlc3BvbnNlKVxuICAgICAgLmNhdGNoKGhhbmRsZVNpZ251cEVycm9yKVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlU2lnbnVwUmVzcG9uc2UocmVzKSB7XG4gICAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlU2lnbnVwRXJyb3IocmVzKSB7fVxuICB9O1xuXG4gICRzY29wZS5zb3VuZGNsb3VkTG9naW4gPSBmdW5jdGlvbigpIHtcbiAgICBTQy5jb25uZWN0KClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkcm9vdFNjb3BlLmFjY2Vzc1Rva2VuID0gcmVzLm9hdXRoX3Rva2VuO1xuICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9sb2dpbi9zb3VuZENsb3VkTG9naW4nLCB7XG4gICAgICAgICAgdG9rZW46IHJlcy5vYXV0aF90b2tlbixcbiAgICAgICAgICBwYXNzd29yZDogJ3Rlc3QnXG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUocmVzLmRhdGEudXNlcik7XG4gICAgICAgIGlmICgkc3RhdGVQYXJhbXMuc3VibWlzc2lvbikge1xuICAgICAgICAgICRzdGF0ZS5nbygnYXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlOZXcnLCB7XG4gICAgICAgICAgICAnc3VibWlzc2lvbic6ICRzdGF0ZVBhcmFtcy5zdWJtaXNzaW9uXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgICRzdGF0ZS5nbygnYXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlMaXN0Jyk7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XG4gICAgICAgIGFsZXJ0KCdFcnJvcjogQ291bGQgbm90IGxvZyBpbicpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gIH07XG59KTsiLCJhcHAuZmFjdG9yeSgnQXV0aFNlcnZpY2UnLCBbJyRodHRwJywgZnVuY3Rpb24oJGh0dHApe1xuXHRcblx0ZnVuY3Rpb24gbG9naW4oZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2xvZ2luJywgZGF0YSk7XG5cdH1cblxuXHRmdW5jdGlvbiBzaWdudXAoZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL3NpZ251cCcsIGRhdGEpO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRsb2dpbjogbG9naW4sXG5cdFx0c2lnbnVwOiBzaWdudXBcblx0fTtcbn1dKTtcbiIsIlxuXG5hcHAuZmFjdG9yeSgnU2Vzc2lvblNlcnZpY2UnLCBbJyRjb29raWVzJywgZnVuY3Rpb24oJGNvb2tpZXMpIHtcblx0XG5cdGZ1bmN0aW9uIGNyZWF0ZShkYXRhKSB7XG5cdFx0JGNvb2tpZXMucHV0T2JqZWN0KCd1c2VyJywgZGF0YSk7XG5cdH1cblxuXHRmdW5jdGlvbiBkZWxldGVVc2VyKCkge1xuXHRcdCRjb29raWVzLnJlbW92ZSgndXNlcicpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0VXNlcigpIHtcblx0XHRyZXR1cm4gJGNvb2tpZXMuZ2V0KCd1c2VyJyk7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdGNyZWF0ZTogY3JlYXRlLFxuXHRcdGRlbGV0ZVVzZXI6IGRlbGV0ZVVzZXIsXG5cdFx0Z2V0VXNlcjogZ2V0VXNlclxuXHR9O1xufV0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYXV0b0VtYWlsc05ldycsIHtcbiAgICB1cmw6ICcvYWRtaW4vZGF0YWJhc2UvYXV0b0VtYWlscy9uZXcnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvZGF0YWJhc2UvYXV0b0VtYWlscy9hdXRvRW1haWxzLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdBdXRvRW1haWxzQ29udHJvbGxlcidcbiAgfSk7XG59KTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYXV0b0VtYWlsc0VkaXQnLCB7XG4gICAgdXJsOiAnL2FkbWluL2RhdGFiYXNlL2F1dG9FbWFpbHMvZWRpdC86dGVtcGxhdGVJZCcsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9kYXRhYmFzZS9hdXRvRW1haWxzL2F1dG9FbWFpbHMuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0F1dG9FbWFpbHNDb250cm9sbGVyJyxcbiAgICAvLyByZXNvbHZlOiB7XG4gICAgLy8gICB0ZW1wbGF0ZTogZnVuY3Rpb24oJGh0dHApIHtcbiAgICAvLyAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9kYXRhYmFzZS9hdXRvRW1haWxzL2Jpd2Vla2x5P2lzQXJ0aXN0PXRydWUnKVxuICAgIC8vICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgIC8vICAgICAgICAgdmFyIHRlbXBsYXRlID0gcmVzLmRhdGE7XG4gICAgLy8gICAgICAgICBpZiAodGVtcGxhdGUpIHtcbiAgICAvLyAgICAgICAgICAgcmV0dXJuIHRlbXBsYXRlO1xuICAgIC8vICAgICAgICAgfSBlbHNlIHtcbiAgICAvLyAgICAgICAgICAgcmV0dXJuIHtcbiAgICAvLyAgICAgICAgICAgICBwdXJwb3NlOiBcIkJpd2Vla2x5IEVtYWlsXCJcbiAgICAvLyAgICAgICAgICAgfVxuICAgIC8vICAgICAgICAgfVxuICAgIC8vICAgICAgIH0pXG4gICAgLy8gICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgLy8gICAgICAgICBhbGVydChcIkVSUk9SOiBTb21ldGhpbmcgd2VudCB3cm9uZy5cIik7XG4gICAgLy8gICAgICAgfSlcbiAgICAvLyAgIH1cbiAgICAvLyB9XG4gIH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdBdXRvRW1haWxzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgJHN0YXRlUGFyYW1zLCBBdXRoU2VydmljZSkge1xuICAkc2NvcGUubG9nZ2VkSW4gPSBmYWxzZTtcblxuXG4gICRzY29wZS5pc1N0YXRlUGFyYW1zID0gZmFsc2U7XG4gIGlmKCRzdGF0ZVBhcmFtcy50ZW1wbGF0ZUlkKSB7XG4gICAgJHNjb3BlLmlzU3RhdGVQYXJhbXMgPSB0cnVlO1xuICB9XG4gIC8vICRzY29wZS50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuXG4gICRzY29wZS50ZW1wbGF0ZSA9IHtcbiAgICBpc0FydGlzdDogZmFsc2VcbiAgfTtcblxuICAkc2NvcGUuZ2V0VGVtcGxhdGUgPSBmdW5jdGlvbigpIHtcbiAgICBpZigkc3RhdGVQYXJhbXMudGVtcGxhdGVJZCkge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgJGh0dHAuZ2V0KCcvYXBpL2RhdGFiYXNlL2F1dG9FbWFpbHM/dGVtcGxhdGVJZD0nICsgJHN0YXRlUGFyYW1zLnRlbXBsYXRlSWQpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IHJlcy5kYXRhO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgaWYgKHRlbXBsYXRlKSB7XG4gICAgICAgICAgICAkc2NvcGUudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJHNjb3BlLnRlbXBsYXRlID0ge307XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICBhbGVydChcIkVSUk9SOiBTb21ldGhpbmcgd2VudCB3cm9uZy5cIik7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9O1xuXG4gIC8vIGNvbnNvbGUubG9nKHRlbXBsYXRlKTtcbiAgJHNjb3BlLnNhdmUgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS9hdXRvRW1haWxzLycsICRzY29wZS50ZW1wbGF0ZSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICBhbGVydChcIlNhdmVkIGVtYWlsIHRlbXBsYXRlLlwiKVxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBhbGVydChcIkVSUk9SOiBNZXNzYWdlIGNvdWxkIG5vdCBzYXZlLlwiKVxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gIH1cblxuICAvLyAkc2NvcGUubG9naW4gPSBmdW5jdGlvbigpIHtcbiAgLy8gICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gIC8vICAgJGh0dHAucG9zdCgnL2FwaS9sb2dpbicsIHtcbiAgLy8gICAgIHBhc3N3b3JkOiAkc2NvcGUucGFzc3dvcmRcbiAgLy8gICB9KS50aGVuKGZ1bmN0aW9uKCkge1xuICAvLyAgICAgJHJvb3RTY29wZS5wYXNzd29yZCA9ICRzY29wZS5wYXNzd29yZDtcbiAgLy8gICAgICRzY29wZS5sb2dnZWRJbiA9IHRydWU7XG4gIC8vICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAvLyAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAvLyAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgLy8gICAgIGFsZXJ0KCdXcm9uZyBQYXNzd29yZCcpO1xuICAvLyAgIH0pO1xuICAvLyB9XG5cbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICRodHRwLmdldCgnL2FwaS9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2FkbWluJztcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICBhbGVydCgnV3JvbmcgUGFzc3dvcmQnKTtcbiAgICB9KTtcbiAgfVxuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhdXRvRW1haWxzTGlzdCcsIHtcbiAgICB1cmw6ICcvYWRtaW4vZGF0YWJhc2UvYXV0b0VtYWlscycsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9kYXRhYmFzZS9hdXRvRW1haWxzL2F1dG9FbWFpbHNMaXN0Lmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdBdXRvRW1haWxzTGlzdENvbnRyb2xsZXInLFxuICAgIHJlc29sdmU6IHtcbiAgICAgIHRlbXBsYXRlczogZnVuY3Rpb24oJGh0dHApIHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9kYXRhYmFzZS9hdXRvRW1haWxzJylcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHsgXG4gICAgICAgICAgICB2YXIgdGVtcGxhdGUgPSByZXMuZGF0YTtcbiAgICAgICAgICAgIGlmICh0ZW1wbGF0ZSkge1xuICAgICAgICAgICAgICByZXR1cm4gdGVtcGxhdGU7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHB1cnBvc2U6IFwiQml3ZWVrbHkgRW1haWxcIlxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgIGFsZXJ0KFwiRVJST1I6IFNvbWV0aGluZyB3ZW50IHdyb25nLlwiKTtcbiAgICAgICAgICB9KVxuICAgICAgfVxuICAgIH1cbiAgfSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0F1dG9FbWFpbHNMaXN0Q29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgQXV0aFNlcnZpY2UsIHRlbXBsYXRlcykge1xuICAkc2NvcGUubG9nZ2VkSW4gPSBmYWxzZTtcbiAgJHNjb3BlLnRlbXBsYXRlcyA9IHRlbXBsYXRlcztcblxuICAvLyAkc2NvcGUuZ2V0VGVtcGxhdGUgPSBmdW5jdGlvbigpIHtcbiAgLy8gICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gIC8vICAgJGh0dHAuZ2V0KCcvYXBpL2RhdGFiYXNlL2F1dG9FbWFpbHMvYml3ZWVrbHk/aXNBcnRpc3Q9JyArIFN0cmluZygkc2NvcGUudGVtcGxhdGUuaXNBcnRpc3QpKVxuICAvLyAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gIC8vICAgICAgIHZhciB0ZW1wbGF0ZSA9IHJlcy5kYXRhO1xuICAvLyAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAvLyAgICAgICBpZiAodGVtcGxhdGUpIHtcbiAgLy8gICAgICAgICAkc2NvcGUudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgLy8gICAgICAgfSBlbHNlIHtcbiAgLy8gICAgICAgICAkc2NvcGUudGVtcGxhdGUgPSB7XG4gIC8vICAgICAgICAgICBwdXJwb3NlOiBcIkJpd2Vla2x5IEVtYWlsXCIsXG4gIC8vICAgICAgICAgICBpc0FydGlzdDogZmFsc2VcbiAgLy8gICAgICAgICB9O1xuICAvLyAgICAgICB9XG4gIC8vICAgICB9KVxuICAvLyAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gIC8vICAgICAgIGFsZXJ0KFwiRVJST1I6IFNvbWV0aGluZyB3ZW50IHdyb25nLlwiKTtcbiAgLy8gICAgIH0pO1xuICAvLyB9O1xuXG4gIC8vIGNvbnNvbGUubG9nKHRlbXBsYXRlKTtcbiAgJHNjb3BlLnNhdmUgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS9hdXRvRW1haWxzJywgJHNjb3BlLnRlbXBsYXRlKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIGFsZXJ0KFwiU2F2ZWQgZW1haWwuXCIpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICBhbGVydChcIkVSUk9SOiBNZXNzYWdlIGNvdWxkIG5vdCBzYXZlLlwiKVxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gIH1cblxuICAvLyAkc2NvcGUubG9naW4gPSBmdW5jdGlvbigpIHtcbiAgLy8gICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gIC8vICAgJGh0dHAucG9zdCgnL2FwaS9sb2dpbicsIHtcbiAgLy8gICAgIHBhc3N3b3JkOiAkc2NvcGUucGFzc3dvcmRcbiAgLy8gICB9KS50aGVuKGZ1bmN0aW9uKCkge1xuICAvLyAgICAgJHJvb3RTY29wZS5wYXNzd29yZCA9ICRzY29wZS5wYXNzd29yZDtcbiAgLy8gICAgICRzY29wZS5sb2dnZWRJbiA9IHRydWU7XG4gIC8vICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAvLyAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAvLyAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgLy8gICAgIGFsZXJ0KCdXcm9uZyBQYXNzd29yZCcpO1xuICAvLyAgIH0pO1xuICAvLyB9XG5cbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICRodHRwLmdldCgnL2FwaS9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2FkbWluJztcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICBhbGVydCgnV3JvbmcgUGFzc3dvcmQnKTtcbiAgICB9KTtcbiAgfVxuXG59KSIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2Rvd25sb2FkR2F0ZScsIHtcbiAgICB1cmw6ICcvYWRtaW4vZG93bmxvYWRHYXRlJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2Rvd25sb2FkVHJhY2svdmlld3MvYWRtaW5ETEdhdGUuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0FkbWluRExHYXRlQ29udHJvbGxlcidcbiAgfSk7XG59KTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZG93bmxvYWRHYXRlTGlzdCcsIHtcbiAgICB1cmw6ICcvYWRtaW4vZG93bmxvYWRHYXRlL2xpc3QnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvZG93bmxvYWRUcmFjay92aWV3cy9hZG1pbkRMR2F0ZS5saXN0Lmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdBZG1pbkRMR2F0ZUNvbnRyb2xsZXInXG4gIH0pO1xufSk7XG5cbmFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2Rvd25sb2FkR2F0ZUVkaXQnLCB7XG4gICAgdXJsOiAnL2FkbWluL2Rvd25sb2FkR2F0ZS9lZGl0LzpnYXRld2F5SUQnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvZG93bmxvYWRUcmFjay92aWV3cy9hZG1pbkRMR2F0ZS5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnQWRtaW5ETEdhdGVDb250cm9sbGVyJ1xuICB9KTtcbn0pO1xuXG5cbmFwcC5jb250cm9sbGVyKCdBZG1pbkRMR2F0ZUNvbnRyb2xsZXInLCBbJyRyb290U2NvcGUnLFxuICAnJHN0YXRlJyxcbiAgJyRzdGF0ZVBhcmFtcycsXG4gICckc2NvcGUnLFxuICAnJGh0dHAnLFxuICAnJGxvY2F0aW9uJyxcbiAgJyR3aW5kb3cnLFxuICAnJHVpYk1vZGFsJyxcbiAgJ1Nlc3Npb25TZXJ2aWNlJyxcbiAgJ0FkbWluRExHYXRlU2VydmljZScsXG4gIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCAkc2NvcGUsICRodHRwLCAkbG9jYXRpb24sICR3aW5kb3csICR1aWJNb2RhbCwgU2Vzc2lvblNlcnZpY2UsIEFkbWluRExHYXRlU2VydmljZSkge1xuICAgIC8qIEluaXQgYm9vbGVhbiB2YXJpYWJsZXMgZm9yIHNob3cvaGlkZSBhbmQgb3RoZXIgZnVuY3Rpb25hbGl0aWVzICovXG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IGZhbHNlO1xuICAgICRzY29wZS5tZXNzYWdlID0ge1xuICAgICAgdmFsOiAnJyxcbiAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgfTtcblxuICAgIC8qIEluaXQgRG93bmxvYWQgR2F0ZXdheSBmb3JtIGRhdGEgKi9cblxuICAgICRzY29wZS50cmFjayA9IHtcbiAgICAgIGFydGlzdFVzZXJuYW1lOiAnTGEgVHJvcGljw6FsJyxcbiAgICAgIHRyYWNrVGl0bGU6ICdQYW50ZW9uZSAvIFRyYXZlbCcsXG4gICAgICB0cmFja0FydHdvcmtVUkw6ICdhc3NldHMvaW1hZ2VzL3doby13ZS1hcmUucG5nJyxcbiAgICAgIFNNTGlua3M6IFtdLFxuICAgICAgbGlrZTogZmFsc2UsXG4gICAgICBjb21tZW50OiBmYWxzZSxcbiAgICAgIHJlcG9zdDogZmFsc2UsXG4gICAgICBhcnRpc3RzOiBbe1xuICAgICAgICB1cmw6ICcnLFxuICAgICAgICBhdmF0YXI6ICdhc3NldHMvaW1hZ2VzL3doby13ZS1hcmUucG5nJyxcbiAgICAgICAgdXNlcm5hbWU6ICcnLFxuICAgICAgICBpZDogLTEsXG4gICAgICAgIHBlcm1hbmVudExpbms6IGZhbHNlXG4gICAgICB9XSxcbiAgICAgIHBsYXlsaXN0czogW3tcbiAgICAgICAgdXJsOiAnJyxcbiAgICAgICAgYXZhdGFyOiAnJyxcbiAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICBpZDogJydcbiAgICAgIH1dXG4gICAgfTtcblxuICAgIC8qIEluaXQgZG93bmxvYWRHYXRld2F5IGxpc3QgKi9cblxuICAgICRzY29wZS5kb3dubG9hZEdhdGV3YXlMaXN0ID0gW107XG5cbiAgICAvKiBJbml0IG1vZGFsIGluc3RhbmNlIHZhcmlhYmxlcyBhbmQgbWV0aG9kcyAqL1xuXG4gICAgJHNjb3BlLm1vZGFsSW5zdGFuY2UgPSB7fTtcbiAgICAkc2NvcGUubW9kYWwgPSB7fTtcbiAgICAkc2NvcGUub3Blbk1vZGFsID0ge1xuICAgICAgZG93bmxvYWRVUkw6IGZ1bmN0aW9uKGRvd25sb2FkVVJMKSB7XG4gICAgICAgICRzY29wZS5tb2RhbC5kb3dubG9hZFVSTCA9IGRvd25sb2FkVVJMO1xuICAgICAgICAkc2NvcGUubW9kYWxJbnN0YW5jZSA9ICR1aWJNb2RhbC5vcGVuKHtcbiAgICAgICAgICBhbmltYXRpb246IHRydWUsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICdkb3dubG9hZFVSTC5odG1sJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnQXJ0aXN0VG9vbHNDb250cm9sbGVyJyxcbiAgICAgICAgICBzY29wZTogJHNjb3BlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gICAgJHNjb3BlLmNsb3NlTW9kYWwgPSBmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5tb2RhbEluc3RhbmNlLmNsb3NlKCk7XG4gICAgfVxuXG4gICAgLyogSW5pdCBwcm9maWxlICovXG4gICAgJHNjb3BlLnByb2ZpbGUgPSB7fTtcblxuICAgIC8qIE1ldGhvZCBmb3IgcmVzZXR0aW5nIERvd25sb2FkIEdhdGV3YXkgZm9ybSAqL1xuXG4gICAgZnVuY3Rpb24gcmVzZXREb3dubG9hZEdhdGV3YXkoKSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSBmYWxzZTtcbiAgICAgICRzY29wZS5tZXNzYWdlID0ge1xuICAgICAgICB2YWw6ICcnLFxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgfTtcblxuICAgICAgJHNjb3BlLnRyYWNrID0ge1xuICAgICAgICBhcnRpc3RVc2VybmFtZTogJ0xhIFRyb3BpY8OhbCcsXG4gICAgICAgIHRyYWNrVGl0bGU6ICdQYW50ZW9uZSAvIFRyYXZlbCcsXG4gICAgICAgIHRyYWNrQXJ0d29ya1VSTDogJ2Fzc2V0cy9pbWFnZXMvd2hvLXdlLWFyZS5wbmcnLFxuICAgICAgICBTTUxpbmtzOiBbXSxcbiAgICAgICAgbGlrZTogZmFsc2UsXG4gICAgICAgIGNvbW1lbnQ6IGZhbHNlLFxuICAgICAgICByZXBvc3Q6IGZhbHNlLFxuICAgICAgICBhcnRpc3RzOiBbe1xuICAgICAgICAgIHVybDogJycsXG4gICAgICAgICAgYXZhdGFyOiAnYXNzZXRzL2ltYWdlcy93aG8td2UtYXJlLnBuZycsXG4gICAgICAgICAgdXNlcm5hbWU6ICcnLFxuICAgICAgICAgIGlkOiAtMSxcbiAgICAgICAgICBwZXJtYW5lbnRMaW5rOiBmYWxzZVxuICAgICAgICB9XSxcbiAgICAgICAgcGxheWxpc3RzOiBbe1xuICAgICAgICAgIHVybDogJycsXG4gICAgICAgICAgYXZhdGFyOiAnJyxcbiAgICAgICAgICB0aXRsZTogJycsXG4gICAgICAgICAgaWQ6ICcnXG4gICAgICAgIH1dXG4gICAgICB9O1xuICAgICAgYW5ndWxhci5lbGVtZW50KFwiaW5wdXRbdHlwZT0nZmlsZSddXCIpLnZhbChudWxsKTtcbiAgICB9XG5cbiAgICAvKiBDaGVjayBpZiBzdGF0ZVBhcmFtcyBoYXMgZ2F0ZXdheUlEIHRvIGluaXRpYXRlIGVkaXQgKi9cbiAgICAkc2NvcGUuY2hlY2tJZkVkaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgkc3RhdGVQYXJhbXMuZ2F0ZXdheUlEKSB7XG4gICAgICAgICRzY29wZS5nZXREb3dubG9hZEdhdGV3YXkoJHN0YXRlUGFyYW1zLmdhdGV3YXlJRCk7XG4gICAgICAgIC8vIGlmKCEkc3RhdGVQYXJhbXMuZG93bmxvYWRHYXRld2F5KSB7XG4gICAgICAgIC8vICAgJHNjb3BlLmdldERvd25sb2FkR2F0ZXdheSgkc3RhdGVQYXJhbXMuZ2F0ZXdheUlEKTtcbiAgICAgICAgLy8gfSBlbHNlIHtcbiAgICAgICAgLy8gICAkc2NvcGUudHJhY2sgPSAkc3RhdGVQYXJhbXMuZG93bmxvYWRHYXRld2F5O1xuICAgICAgICAvLyB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgJHNjb3BlLnRyYWNrVVJMQ2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoJHNjb3BlLnRyYWNrLnRyYWNrVVJMICE9PSAnJykge1xuICAgICAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IGZhbHNlO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAgIEFkbWluRExHYXRlU2VydmljZVxuICAgICAgICAgIC5yZXNvbHZlRGF0YSh7XG4gICAgICAgICAgICB1cmw6ICRzY29wZS50cmFjay50cmFja1VSTFxuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4oaGFuZGxlVHJhY2tEYXRhQW5kR2V0UHJvZmlsZXMpXG4gICAgICAgICAgLnRoZW4oaGFuZGxlV2ViUHJvZmlsZXMpXG4gICAgICAgICAgLmNhdGNoKGhhbmRsZUVycm9yKTtcblxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVUcmFja0RhdGFBbmRHZXRQcm9maWxlcyhyZXMpIHtcbiAgICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tUaXRsZSA9IHJlcy5kYXRhLnRpdGxlO1xuICAgICAgICAgICRzY29wZS50cmFjay50cmFja0lEID0gcmVzLmRhdGEuaWQ7XG4gICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdElEID0gcmVzLmRhdGEudXNlci5pZDtcbiAgICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tBcnR3b3JrVVJMID0gcmVzLmRhdGEuYXJ0d29ya191cmwgPyByZXMuZGF0YS5hcnR3b3JrX3VybC5yZXBsYWNlKCdsYXJnZS5qcGcnLCAndDUwMHg1MDAuanBnJykgOiAnJztcbiAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0QXJ0d29ya1VSTCA9IHJlcy5kYXRhLnVzZXIuYXZhdGFyX3VybCA/IHJlcy5kYXRhLnVzZXIuYXZhdGFyX3VybCA6ICcnO1xuICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RVUkwgPSByZXMuZGF0YS51c2VyLnBlcm1hbGlua191cmw7XG4gICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdFVzZXJuYW1lID0gcmVzLmRhdGEudXNlci51c2VybmFtZTtcbiAgICAgICAgICAkc2NvcGUudHJhY2suU01MaW5rcyA9IFtdO1xuICAgICAgICAgIHJldHVybiBTQy5nZXQoJy91c2Vycy8nICsgJHNjb3BlLnRyYWNrLmFydGlzdElEICsgJy93ZWItcHJvZmlsZXMnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVdlYlByb2ZpbGVzKHByb2ZpbGVzKSB7XG4gICAgICAgICAgcHJvZmlsZXMuZm9yRWFjaChmdW5jdGlvbihwcm9mKSB7XG4gICAgICAgICAgICBpZiAoWyd0d2l0dGVyJywgJ3lvdXR1YmUnLCAnZmFjZWJvb2snLCAnc3BvdGlmeScsICdzb3VuZGNsb3VkJywgJ2luc3RhZ3JhbSddLmluZGV4T2YocHJvZi5zZXJ2aWNlKSAhPSAtMSkge1xuICAgICAgICAgICAgICAkc2NvcGUudHJhY2suU01MaW5rcy5wdXNoKHtcbiAgICAgICAgICAgICAgICBrZXk6IHByb2Yuc2VydmljZSxcbiAgICAgICAgICAgICAgICB2YWx1ZTogcHJvZi51cmxcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSB0cnVlO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihlcnIpIHtcbiAgICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tJRCA9IG51bGw7XG4gICAgICAgICAgYWxlcnQoJ1Nvbmcgbm90IGZvdW5kIG9yIGZvcmJpZGRlbicpO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgJHNjb3BlLmFydGlzdFVSTENoYW5nZSA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICB2YXIgYXJ0aXN0ID0ge307XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICBBZG1pbkRMR2F0ZVNlcnZpY2VcbiAgICAgICAgLnJlc29sdmVEYXRhKHtcbiAgICAgICAgICB1cmw6ICRzY29wZS50cmFjay5hcnRpc3RzW2luZGV4XS51cmxcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdHNbaW5kZXhdLmF2YXRhciA9IHJlcy5kYXRhLmF2YXRhcl91cmw7XG4gICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdHNbaW5kZXhdLnVzZXJuYW1lID0gcmVzLmRhdGEudXNlcm5hbWU7XG4gICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdHNbaW5kZXhdLmlkID0gcmVzLmRhdGEuaWQ7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgIGFsZXJ0KCdBcnRpc3RzIG5vdCBmb3VuZCcpO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAkc2NvcGUuYWRkUGxheWxpc3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS50cmFjay5wbGF5bGlzdHMucHVzaCh7XG4gICAgICAgIHVybDogJycsXG4gICAgICAgIGF2YXRhcjogJycsXG4gICAgICAgIHRpdGxlOiAnJyxcbiAgICAgICAgaWQ6ICcnXG4gICAgICB9KTtcbiAgICB9XG4gICAgJHNjb3BlLnJlbW92ZVBsYXlsaXN0ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICRzY29wZS50cmFjay5wbGF5bGlzdHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gICAgJHNjb3BlLnBsYXlsaXN0VVJMQ2hhbmdlID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgIEFkbWluRExHYXRlU2VydmljZVxuICAgICAgICAucmVzb2x2ZURhdGEoe1xuICAgICAgICAgIHVybDogJHNjb3BlLnRyYWNrLnBsYXlsaXN0c1tpbmRleF0udXJsXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICRzY29wZS50cmFjay5wbGF5bGlzdHNbaW5kZXhdLmF2YXRhciA9IHJlcy5kYXRhLmFydHdvcmtfdXJsO1xuICAgICAgICAgICRzY29wZS50cmFjay5wbGF5bGlzdHNbaW5kZXhdLnRpdGxlID0gcmVzLmRhdGEudGl0bGU7XG4gICAgICAgICAgJHNjb3BlLnRyYWNrLnBsYXlsaXN0c1tpbmRleF0uaWQgPSByZXMuZGF0YS5pZDtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICBhbGVydCgnUGxheWxpc3Qgbm90IGZvdW5kJyk7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfSlcbiAgICB9XG5cblxuICAgICRzY29wZS5yZW1vdmVBcnRpc3QgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG5cbiAgICAkc2NvcGUuYWRkQXJ0aXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoJHNjb3BlLnRyYWNrLmFydGlzdHMubGVuZ3RoID4gMikge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgICRzY29wZS50cmFjay5hcnRpc3RzLnB1c2goe1xuICAgICAgICB1cmw6ICcnLFxuICAgICAgICBhdmF0YXI6ICdhc3NldHMvaW1hZ2VzL3doby13ZS1hcmUucG5nJyxcbiAgICAgICAgdXNlcm5hbWU6ICcnLFxuICAgICAgICBpZDogLTFcbiAgICAgIH0pO1xuICAgIH1cblxuICAgICRzY29wZS5hZGRTTUxpbmsgPSBmdW5jdGlvbigpIHtcbiAgICAgIC8vIGV4dGVybmFsU01MaW5rcysrO1xuICAgICAgLy8gJHNjb3BlLnRyYWNrLlNNTGlua3NbJ2tleScgKyBleHRlcm5hbFNNTGlua3NdID0gJyc7XG4gICAgICAkc2NvcGUudHJhY2suU01MaW5rcy5wdXNoKHtcbiAgICAgICAga2V5OiAnJyxcbiAgICAgICAgdmFsdWU6ICcnXG4gICAgICB9KTtcbiAgICB9O1xuICAgICRzY29wZS5yZW1vdmVTTUxpbmsgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9O1xuICAgICRzY29wZS5TTUxpbmtDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xuXG4gICAgICBmdW5jdGlvbiBnZXRMb2NhdGlvbihocmVmKSB7XG4gICAgICAgIHZhciBsb2NhdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpO1xuICAgICAgICBsb2NhdGlvbi5ocmVmID0gaHJlZjtcbiAgICAgICAgaWYgKGxvY2F0aW9uLmhvc3QgPT0gXCJcIikge1xuICAgICAgICAgIGxvY2F0aW9uLmhyZWYgPSBsb2NhdGlvbi5ocmVmO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBsb2NhdGlvbjtcbiAgICAgIH1cblxuICAgICAgdmFyIGxvY2F0aW9uID0gZ2V0TG9jYXRpb24oJHNjb3BlLnRyYWNrLlNNTGlua3NbaW5kZXhdLnZhbHVlKTtcbiAgICAgIHZhciBob3N0ID0gbG9jYXRpb24uaG9zdG5hbWUuc3BsaXQoJy4nKVswXTtcbiAgICAgIHZhciBmaW5kTGluayA9ICRzY29wZS50cmFjay5TTUxpbmtzLmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHJldHVybiBpdGVtLmtleSA9PT0gaG9zdDtcbiAgICAgIH0pO1xuICAgICAgaWYgKGZpbmRMaW5rLmxlbmd0aCA+IDApIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3NbaW5kZXhdLmtleSA9IGhvc3Q7XG4gICAgfTtcblxuICAgICRzY29wZS5zYXZlRG93bmxvYWRHYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoISRzY29wZS50cmFjay50cmFja0lEKSB7XG4gICAgICAgIGFsZXJ0KCdUcmFjayBOb3QgRm91bmQnKTtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgdmFyIHNlbmRPYmogPSBuZXcgRm9ybURhdGEoKTtcblxuICAgICAgLyogQXBwZW5kIGRhdGEgdG8gc2VuZE9iaiBzdGFydCAqL1xuXG4gICAgICAvKiBUcmFjayAqL1xuICAgICAgZm9yICh2YXIgcHJvcCBpbiAkc2NvcGUudHJhY2spIHtcbiAgICAgICAgc2VuZE9iai5hcHBlbmQocHJvcCwgJHNjb3BlLnRyYWNrW3Byb3BdKTtcbiAgICAgIH1cblxuICAgICAgLyogYXJ0aXN0cyAqL1xuXG4gICAgICB2YXIgYXJ0aXN0cyA9ICRzY29wZS50cmFjay5hcnRpc3RzLmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHJldHVybiBpdGVtLmlkICE9PSAtMTtcbiAgICAgIH0pLm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIGRlbGV0ZSBpdGVtWyckJGhhc2hLZXknXTtcbiAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICB9KTtcbiAgICAgIHNlbmRPYmouYXBwZW5kKCdhcnRpc3RzJywgSlNPTi5zdHJpbmdpZnkoYXJ0aXN0cykpO1xuXG4gICAgICAvKiBwbGF5bGlzdHMgKi9cblxuICAgICAgdmFyIHBsYXlsaXN0cyA9ICRzY29wZS50cmFjay5wbGF5bGlzdHMuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGl0ZW0uaWQgIT09IC0xO1xuICAgICAgfSkubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgZGVsZXRlIGl0ZW1bJyQkaGFzaEtleSddO1xuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgIH0pO1xuICAgICAgc2VuZE9iai5hcHBlbmQoJ3BsYXlsaXN0cycsIEpTT04uc3RyaW5naWZ5KHBsYXlsaXN0cykpO1xuXG4gICAgICAvKiBTTUxpbmtzICovXG5cbiAgICAgIHZhciBTTUxpbmtzID0ge307XG4gICAgICAkc2NvcGUudHJhY2suU01MaW5rcy5mb3JFYWNoKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgU01MaW5rc1tpdGVtLmtleV0gPSBpdGVtLnZhbHVlO1xuICAgICAgfSk7XG4gICAgICBzZW5kT2JqLmFwcGVuZCgnU01MaW5rcycsIEpTT04uc3RyaW5naWZ5KFNNTGlua3MpKTtcblxuICAgICAgLyogQXBwZW5kIGRhdGEgdG8gc2VuZE9iaiBlbmQgKi9cblxuICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICB1cmw6ICcvYXBpL2RhdGFiYXNlL2Rvd25sb2FkdXJsJyxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdDb250ZW50LVR5cGUnOiB1bmRlZmluZWRcbiAgICAgICAgfSxcbiAgICAgICAgdHJhbnNmb3JtUmVxdWVzdDogYW5ndWxhci5pZGVudGl0eSxcbiAgICAgICAgZGF0YTogc2VuZE9ialxuICAgICAgfTtcbiAgICAgICRodHRwKG9wdGlvbnMpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgaWYgKCRzY29wZS50cmFjay5faWQpIHtcbiAgICAgICAgICAgIC8vICRzY29wZS5vcGVuTW9kYWwuZG93bmxvYWRVUkwocmVzLmRhdGEudHJhY2tVUkwpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXNldERvd25sb2FkR2F0ZXdheSgpO1xuICAgICAgICAgICRzY29wZS5vcGVuTW9kYWwuZG93bmxvYWRVUkwocmVzLmRhdGEpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgIGFsZXJ0KFwiRVJST1I6IEVycm9yIGluIHNhdmluZyB1cmxcIik7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICRodHRwLnBvc3QoJy9hcGkvbG9nb3V0JykudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgU2Vzc2lvblNlcnZpY2UuZGVsZXRlVXNlcigpO1xuICAgICAgICAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAkc2NvcGUuc2hvd1Byb2ZpbGVJbmZvID0gZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUucHJvZmlsZSA9IEpTT04ucGFyc2UoU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKTtcbiAgICB9XG5cbiAgICAkc2NvcGUuZ2V0RG93bmxvYWRMaXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICBBZG1pbkRMR2F0ZVNlcnZpY2VcbiAgICAgICAgLmdldERvd25sb2FkTGlzdCgpXG4gICAgICAgIC50aGVuKGhhbmRsZVJlc3BvbnNlKVxuICAgICAgICAuY2F0Y2goaGFuZGxlRXJyb3IpO1xuXG4gICAgICBmdW5jdGlvbiBoYW5kbGVSZXNwb25zZShyZXMpIHtcbiAgICAgICAgJHNjb3BlLmRvd25sb2FkR2F0ZXdheUxpc3QgPSByZXMuZGF0YTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gaGFuZGxlRXJyb3IocmVzKSB7XG5cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBNZXRob2QgZm9yIGdldHRpbmcgRG93bmxvYWRHYXRld2F5IGluIGNhc2Ugb2YgZWRpdCAqL1xuXG4gICAgJHNjb3BlLmdldERvd25sb2FkR2F0ZXdheSA9IGZ1bmN0aW9uKGRvd25sb2FkR2F0ZVdheUlEKSB7XG4gICAgICAvLyByZXNldERvd25sb2FkR2F0ZXdheSgpO1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgQWRtaW5ETEdhdGVTZXJ2aWNlXG4gICAgICAgIC5nZXREb3dubG9hZEdhdGV3YXkoe1xuICAgICAgICAgIGlkOiBkb3dubG9hZEdhdGVXYXlJRFxuICAgICAgICB9KVxuICAgICAgICAudGhlbihoYW5kbGVSZXNwb25zZSlcbiAgICAgICAgLmNhdGNoKGhhbmRsZUVycm9yKTtcblxuICAgICAgZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UocmVzKSB7XG5cbiAgICAgICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSB0cnVlO1xuICAgICAgICAkc2NvcGUudHJhY2sgPSByZXMuZGF0YTtcblxuICAgICAgICB2YXIgU01MaW5rcyA9IHJlcy5kYXRhLlNNTGlua3MgPyByZXMuZGF0YS5TTUxpbmtzIDoge307XG4gICAgICAgIHZhciBTTUxpbmtzQXJyYXkgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciBsaW5rIGluIFNNTGlua3MpIHtcbiAgICAgICAgICBTTUxpbmtzQXJyYXkucHVzaCh7XG4gICAgICAgICAgICBrZXk6IGxpbmssXG4gICAgICAgICAgICB2YWx1ZTogU01MaW5rc1tsaW5rXVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgICRzY29wZS50cmFjay5TTUxpbmtzID0gU01MaW5rc0FycmF5O1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihyZXMpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgJHNjb3BlLmRlbGV0ZURvd25sb2FkR2F0ZXdheSA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cbiAgICAgIGlmIChjb25maXJtKFwiRG8geW91IHJlYWxseSB3YW50IHRvIGRlbGV0ZSB0aGlzIHRyYWNrP1wiKSkge1xuICAgICAgdmFyIGRvd25sb2FkR2F0ZVdheUlEID0gJHNjb3BlLmRvd25sb2FkR2F0ZXdheUxpc3RbaW5kZXhdLl9pZDtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgICBBZG1pbkRMR2F0ZVNlcnZpY2VcbiAgICAgICAgICAuZGVsZXRlRG93bmxvYWRHYXRld2F5KHtcbiAgICAgICAgICAgIGlkOiBkb3dubG9hZEdhdGVXYXlJRFxuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4oaGFuZGxlUmVzcG9uc2UpXG4gICAgICAgICAgLmNhdGNoKGhhbmRsZUVycm9yKTtcblxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVSZXNwb25zZShyZXMpIHtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICRzY29wZS5kb3dubG9hZEdhdGV3YXlMaXN0LnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihyZXMpIHtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gZmFsc2VcbiAgICAgIH1cbiAgICB9O1xuICB9XG5cbl0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcblx0JHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2Rvd25sb2FkJywge1xuXHRcdHVybDogJy9kb3dubG9hZCcsXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9kb3dubG9hZFRyYWNrL3ZpZXdzL2Rvd25sb2FkVHJhY2sudmlldy5odG1sJyxcblx0XHRjb250cm9sbGVyOiAnRG93bmxvYWRUcmFja0NvbnRyb2xsZXInXG5cdH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdEb3dubG9hZFRyYWNrQ29udHJvbGxlcicsIFsnJHJvb3RTY29wZScsXG5cdCckc3RhdGUnLFxuXHQnJHNjb3BlJyxcblx0JyRodHRwJyxcblx0JyRsb2NhdGlvbicsXG5cdCckd2luZG93Jyxcblx0JyRxJyxcblx0J0Rvd25sb2FkVHJhY2tTZXJ2aWNlJyxcblx0ZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCAkbG9jYXRpb24sICR3aW5kb3csICRxLCBEb3dubG9hZFRyYWNrU2VydmljZSkge1xuXG5cdFx0LyogTm9ybWFsIEpTIHZhcnMgYW5kIGZ1bmN0aW9ucyBub3QgYm91bmQgdG8gc2NvcGUgKi9cblx0XHR2YXIgcGxheWVyT2JqID0gbnVsbDtcblxuXHRcdC8qICRzY29wZSBiaW5kaW5ncyBzdGFydCAqL1xuXG5cdFx0JHNjb3BlLnRyYWNrRGF0YSA9IHtcblx0XHRcdHRyYWNrTmFtZTogJ01peGluZyBhbmQgTWFzdGVyaW5nJyxcblx0XHRcdHVzZXJOYW1lOiAnbGEgdHJvcGljYWwnXG5cdFx0fTtcblx0XHQkc2NvcGUudG9nZ2xlID0gdHJ1ZTtcblx0XHQkc2NvcGUudG9nZ2xlUGxheSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0JHNjb3BlLnRvZ2dsZSA9ICEkc2NvcGUudG9nZ2xlO1xuXHRcdFx0aWYgKCRzY29wZS50b2dnbGUpIHtcblx0XHRcdFx0cGxheWVyT2JqLnBhdXNlKCk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRwbGF5ZXJPYmoucGxheSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0XHQkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuXHRcdCRzY29wZS5lbWJlZFRyYWNrID0gZmFsc2U7XG5cdFx0JHNjb3BlLmRvd25sb2FkVVJMTm90Rm91bmQgPSBmYWxzZTtcblx0XHQkc2NvcGUuZXJyb3JUZXh0ID0gJyc7XG5cdFx0JHNjb3BlLmZvbGxvd0JveEltYWdlVXJsID0gJ2Fzc2V0cy9pbWFnZXMvd2hvLXdlLWFyZS5wbmcnO1xuXHRcdCRzY29wZS5yZWNlbnRUcmFja3MgPSBbXTtcblxuXHRcdC8qIERlZmF1bHQgcHJvY2Vzc2luZyBvbiBwYWdlIGxvYWQgKi9cblxuXHRcdCRzY29wZS5nZXREb3dubG9hZFRyYWNrID0gZnVuY3Rpb24oKSB7XG5cblx0XHRcdCRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcblx0XHRcdHZhciB0cmFja0lEID0gJGxvY2F0aW9uLnNlYXJjaCgpLnRyYWNraWQ7XG5cdFx0XHREb3dubG9hZFRyYWNrU2VydmljZVxuXHRcdFx0XHQuZ2V0RG93bmxvYWRUcmFjayh0cmFja0lEKVxuXHRcdFx0XHQudGhlbihyZWNlaXZlRG93bmxvYWRUcmFjaylcblx0XHRcdFx0LnRoZW4ocmVjZWl2ZVJlY2VudFRyYWNrcylcblx0XHRcdFx0LnRoZW4oaW5pdFBsYXkpXG5cdFx0XHRcdC5jYXRjaChjYXRjaERvd25sb2FkVHJhY2tFcnJvcik7XG5cblx0XHRcdGZ1bmN0aW9uIHJlY2VpdmVEb3dubG9hZFRyYWNrKHJlc3VsdCkge1xuXHRcdFx0XHQkc2NvcGUudHJhY2sgPSByZXN1bHQuZGF0YTtcblx0XHRcdFx0Y29uc29sZS5sb2coJHNjb3BlLnRyYWNrKTtcblx0XHRcdFx0JHNjb3BlLmJhY2tncm91bmRTdHlsZSA9IGZ1bmN0aW9uKCkge1xuXHRcdFx0XHRcdHJldHVybiB7XG5cdFx0XHRcdFx0XHQnYmFja2dyb3VuZC1pbWFnZSc6ICd1cmwoJyArICRzY29wZS50cmFjay50cmFja0FydHdvcmtVUkwgKyAnKScsXG5cdFx0XHRcdFx0XHQnYmFja2dyb3VuZC1yZXBlYXQnOiAnbm8tcmVwZWF0Jyxcblx0XHRcdFx0XHRcdCdiYWNrZ3JvdW5kLXNpemUnOiAnY292ZXInXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0JHNjb3BlLmVtYmVkVHJhY2sgPSB0cnVlO1xuXHRcdFx0XHQkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuXG5cdFx0XHRcdGlmICgkc2NvcGUudHJhY2suc2hvd0Rvd25sb2FkVHJhY2tzID09PSAndXNlcicpIHtcblx0XHRcdFx0XHRyZXR1cm4gRG93bmxvYWRUcmFja1NlcnZpY2UuZ2V0UmVjZW50VHJhY2tzKHtcblx0XHRcdFx0XHRcdHVzZXJJRDogJHNjb3BlLnRyYWNrLnVzZXJpZCxcblx0XHRcdFx0XHRcdHRyYWNrSUQ6ICRzY29wZS50cmFjay5faWRcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRyZXR1cm4gJHEucmVzb2x2ZSgncmVzb2x2ZScpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIHJlY2VpdmVSZWNlbnRUcmFja3MocmVzKSB7XG5cdFx0XHRcdGlmICgodHlwZW9mIHJlcyA9PT0gJ29iamVjdCcpICYmIHJlcy5kYXRhKSB7XG5cdFx0XHRcdFx0JHNjb3BlLnJlY2VudFRyYWNrcyA9IHJlcy5kYXRhO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBTQy5zdHJlYW0oJy90cmFja3MvJyArICRzY29wZS50cmFjay50cmFja0lEKTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gaW5pdFBsYXkocGxheWVyKSB7XG5cdFx0XHRcdHBsYXllck9iaiA9IHBsYXllcjtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gY2F0Y2hEb3dubG9hZFRyYWNrRXJyb3IoKSB7XG5cdFx0XHRcdGFsZXJ0KCdTb25nIE5vdCBGb3VuZCcpO1xuXHRcdFx0XHQkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuXHRcdFx0XHQkc2NvcGUuZW1iZWRUcmFjayA9IGZhbHNlO1xuXHRcdFx0fVxuXHRcdH07XG5cblxuXHRcdC8qIE9uIGNsaWNrIGRvd25sb2FkIHRyYWNrIGJ1dHRvbiAqL1xuXG5cdFx0JHNjb3BlLmRvd25sb2FkVHJhY2sgPSBmdW5jdGlvbigpIHtcblx0XHRcdGlmICgkc2NvcGUudHJhY2suY29tbWVudCAmJiAhJHNjb3BlLnRyYWNrLmNvbW1lbnRUZXh0KSB7XG5cdFx0XHRcdGFsZXJ0KCdQbGVhc2Ugd3JpdGUgYSBjb21tZW50IScpO1xuXHRcdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0XHR9XG5cdFx0XHQkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG5cdFx0XHQkc2NvcGUuZXJyb3JUZXh0ID0gJyc7XG5cblx0XHRcdFNDLmNvbm5lY3QoKVxuXHRcdFx0XHQudGhlbihwZXJmb3JtVGFza3MpXG5cdFx0XHRcdC50aGVuKGluaXREb3dubG9hZClcblx0XHRcdFx0LmNhdGNoKGNhdGNoVGFza3NFcnJvcilcblxuXHRcdFx0ZnVuY3Rpb24gcGVyZm9ybVRhc2tzKHJlcykge1xuXHRcdFx0XHQkc2NvcGUudHJhY2sudG9rZW4gPSByZXMub2F1dGhfdG9rZW47XG5cdFx0XHRcdHJldHVybiBEb3dubG9hZFRyYWNrU2VydmljZS5wZXJmb3JtVGFza3MoJHNjb3BlLnRyYWNrKTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gaW5pdERvd25sb2FkKHJlcykge1xuXHRcdFx0XHQkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuXHRcdFx0XHRpZiAoJHNjb3BlLnRyYWNrLmRvd25sb2FkVVJMICYmICRzY29wZS50cmFjay5kb3dubG9hZFVSTCAhPT0gJycpIHtcblx0XHRcdFx0XHQkd2luZG93LmxvY2F0aW9uLmhyZWYgPSAkc2NvcGUudHJhY2suZG93bmxvYWRVUkw7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0JHNjb3BlLmVycm9yVGV4dCA9ICdFcnJvciEgQ291bGQgbm90IGZldGNoIGRvd25sb2FkIFVSTCc7XG5cdFx0XHRcdFx0JHNjb3BlLmRvd25sb2FkVVJMTm90Rm91bmQgPSB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHRcdCRzY29wZS4kYXBwbHkoKTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gY2F0Y2hUYXNrc0Vycm9yKGVycikge1xuXHRcdFx0XHRhbGVydCgnRXJyb3IgaW4gcHJvY2Vzc2luZyB5b3VyIHJlcXVlc3QnKTtcblx0XHRcdFx0JHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcblx0XHRcdFx0JHNjb3BlLiRhcHBseSgpO1xuXHRcdFx0fVxuXG5cdFx0fTtcblx0fVxuXSk7IiwiXG5hcHAuc2VydmljZSgnQWRtaW5ETEdhdGVTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKXtcblxuXHRmdW5jdGlvbiByZXNvbHZlRGF0YShkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvc291bmRjbG91ZC9yZXNvbHZlJywgZGF0YSk7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXREb3dubG9hZExpc3QoKSB7XG5cdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS9kYXRhYmFzZS9kb3dubG9hZHVybC9hZG1pbicpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0RG93bmxvYWRHYXRld2F5KGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2RhdGFiYXNlL2Rvd25sb2FkdXJsLycgKyBkYXRhLmlkKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGRlbGV0ZURvd25sb2FkR2F0ZXdheShkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvZG93bmxvYWR1cmwvZGVsZXRlJywgZGF0YSk7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHJlc29sdmVEYXRhOiByZXNvbHZlRGF0YSxcblx0XHRnZXREb3dubG9hZExpc3Q6IGdldERvd25sb2FkTGlzdCxcblx0XHRnZXREb3dubG9hZEdhdGV3YXk6IGdldERvd25sb2FkR2F0ZXdheSxcblx0XHRkZWxldGVEb3dubG9hZEdhdGV3YXk6IGRlbGV0ZURvd25sb2FkR2F0ZXdheVxuXHR9O1xufV0pO1xuIiwiYXBwLnNlcnZpY2UoJ0Rvd25sb2FkVHJhY2tTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKXtcblx0XG5cdGZ1bmN0aW9uIGdldERvd25sb2FkVHJhY2soZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZG93bmxvYWQvdHJhY2s/dHJhY2tJRD0nICsgZGF0YSk7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRUcmFja0RhdGEoZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIHtcblx0XHRcdHVybDogZGF0YS50cmFja1VSTFxuXHRcdH0pO1xuXHR9XG5cblx0ZnVuY3Rpb24gcGVyZm9ybVRhc2tzKGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnYXBpL2Rvd25sb2FkL3Rhc2tzJywgZGF0YSk7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRSZWNlbnRUcmFja3MoZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZG93bmxvYWQvdHJhY2svcmVjZW50P3VzZXJJRD0nICsgZGF0YS51c2VySUQgKyAnJnRyYWNrSUQ9JyArIGRhdGEudHJhY2tJRCk7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdGdldERvd25sb2FkVHJhY2s6IGdldERvd25sb2FkVHJhY2ssXG5cdFx0Z2V0VHJhY2tEYXRhOiBnZXRUcmFja0RhdGEsXG5cdFx0cGVyZm9ybVRhc2tzOiBwZXJmb3JtVGFza3MsXG5cdFx0Z2V0UmVjZW50VHJhY2tzOiBnZXRSZWNlbnRUcmFja3Ncblx0fTtcbn1dKTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2FydGlzdFRvb2xzJywge1xuICAgICAgdXJsOiAnL2FydGlzdC10b29scycsXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvYXJ0aXN0VG9vbHMvYXJ0aXN0VG9vbHMuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQXJ0aXN0VG9vbHNDb250cm9sbGVyJyxcbiAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICBhbGxvd2VkOiBmdW5jdGlvbigkcSwgJHN0YXRlLCBTZXNzaW9uU2VydmljZSkge1xuICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgdmFyIHVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XG4gICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvbG9naW4nO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcnRpc3RUb29sc1Byb2ZpbGUnLCB7XG4gICAgICB1cmw6ICcvcHJvZmlsZScsXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvYXJ0aXN0VG9vbHMvcHJvZmlsZS5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdBcnRpc3RUb29sc0NvbnRyb2xsZXInXG4gICAgfSlcbiAgICAuc3RhdGUoJ2FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5TGlzdCcsIHtcbiAgICAgIHVybDogJy9kb3dubG9hZC1nYXRld2F5JyxcbiAgICAgIHBhcmFtczoge1xuICAgICAgICBzdWJtaXNzaW9uOiBudWxsXG4gICAgICB9LFxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL3ZpZXdzL2FydGlzdFRvb2xzL2Rvd25sb2FkR2F0ZXdheS5saXN0Lmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0FydGlzdFRvb2xzQ29udHJvbGxlcidcbiAgICB9KVxuXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0FydGlzdFRvb2xzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCAkc2NvcGUsICRodHRwLCAkbG9jYXRpb24sICR3aW5kb3csICR1aWJNb2RhbCwgJHRpbWVvdXQsIFNlc3Npb25TZXJ2aWNlLCBBcnRpc3RUb29sc1NlcnZpY2UpIHtcbiAgICAkc2NvcGUudXNlciA9IEpTT04ucGFyc2UoU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKTtcblxuICAgIC8qIEluaXQgYm9vbGVhbiB2YXJpYWJsZXMgZm9yIHNob3cvaGlkZSBhbmQgb3RoZXIgZnVuY3Rpb25hbGl0aWVzICovXG5cbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gZmFsc2U7XG4gICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICB2YWw6ICcnLFxuICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICB9O1xuXG4gICAgLyogSW5pdCBkb3dubG9hZEdhdGV3YXkgbGlzdCAqL1xuXG4gICAgJHNjb3BlLmRvd25sb2FkR2F0ZXdheUxpc3QgPSBbXTtcblxuICAgIC8qIEluaXQgbW9kYWwgaW5zdGFuY2UgdmFyaWFibGVzIGFuZCBtZXRob2RzICovXG5cbiAgICAkc2NvcGUubW9kYWxJbnN0YW5jZSA9IHt9O1xuICAgICRzY29wZS5tb2RhbCA9IHt9O1xuICAgICRzY29wZS5vcGVuTW9kYWwgPSB7XG4gICAgICBkb3dubG9hZFVSTDogZnVuY3Rpb24oZG93bmxvYWRVUkwpIHtcbiAgICAgICAgJHNjb3BlLm1vZGFsLmRvd25sb2FkVVJMID0gZG93bmxvYWRVUkw7XG4gICAgICAgICRzY29wZS5tb2RhbEluc3RhbmNlID0gJHVpYk1vZGFsLm9wZW4oe1xuICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2Rvd25sb2FkVVJMLmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdBcnRpc3RUb29sc0NvbnRyb2xsZXInLFxuICAgICAgICAgIHNjb3BlOiAkc2NvcGVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgICAkc2NvcGUuY2xvc2VNb2RhbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLm1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmVkaXRQcm9maWxlTW9kYWxJbnN0YW5jZSA9IHt9O1xuICAgICRzY29wZS5lZGl0UHJvZmlsZW1vZGFsID0ge307XG4gICAgJHNjb3BlLm9wZW5FZGl0UHJvZmlsZU1vZGFsID0ge1xuICAgICAgZWRpdFByb2ZpbGU6IGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgICAgICRzY29wZS5wcm9maWxlLmZpZWxkID0gZmllbGQ7XG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRzY29wZS5lZGl0UHJvZmlsZU1vZGFsSW5zdGFuY2UgPSAkdWliTW9kYWwub3Blbih7XG4gICAgICAgICAgICBhbmltYXRpb246IHRydWUsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2VkaXRQcm9maWxlLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0FydGlzdFRvb2xzQ29udHJvbGxlcicsXG4gICAgICAgICAgICBzY29wZTogJHNjb3BlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIDApO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAkc2NvcGUuY2xvc2VFZGl0UHJvZmlsZU1vZGFsID0gZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUuc2hvd1Byb2ZpbGVJbmZvKCk7XG4gICAgICBpZiAoJHNjb3BlLmVkaXRQcm9maWxlTW9kYWxJbnN0YW5jZS5jbG9zZSkge1xuICAgICAgICAkc2NvcGUuZWRpdFByb2ZpbGVNb2RhbEluc3RhbmNlLmNsb3NlKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgICRzY29wZS50aGFua1lvdU1vZGFsSW5zdGFuY2UgPSB7fTtcbiAgICAkc2NvcGUudGhhbmtZb3VNb2RhbCA9IHt9O1xuICAgICRzY29wZS5vcGVuVGhhbmtZb3VNb2RhbCA9IHtcbiAgICAgIHRoYW5rWW91OiBmdW5jdGlvbihzdWJtaXNzaW9uSUQpIHtcbiAgICAgICAgJHNjb3BlLnRoYW5rWW91TW9kYWwuc3VibWlzc2lvbklEID0gc3VibWlzc2lvbklEO1xuICAgICAgICAkc2NvcGUubW9kYWxJbnN0YW5jZSA9ICR1aWJNb2RhbC5vcGVuKHtcbiAgICAgICAgICBhbmltYXRpb246IHRydWUsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0aGFua1lvdS5odG1sJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnT3BlblRoYW5rWW91TW9kYWxDb250cm9sbGVyJyxcbiAgICAgICAgICBzY29wZTogJHNjb3BlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gICAgJHNjb3BlLmNsb3NlVGhhbmtZb3VNb2RhbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLnRoYW5rWW91TW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xuICAgIH07XG4gICAgLyogSW5pdCBwcm9maWxlICovXG4gICAgJHNjb3BlLnByb2ZpbGUgPSB7fTtcblxuICAgICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICRodHRwLnBvc3QoJy9hcGkvbG9nb3V0JykudGhlbihmdW5jdGlvbigpIHtcbiAgICAgICAgU2Vzc2lvblNlcnZpY2UuZGVsZXRlVXNlcigpO1xuICAgICAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9sb2dpbic7XG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgY29uc29sZS5sb2coJHN0YXRlUGFyYW1zLnN1Ym1pc3Npb24pO1xuICAgIGlmICgkc3RhdGVQYXJhbXMuc3VibWlzc2lvbikge1xuICAgICAgJHNjb3BlLm9wZW5UaGFua1lvdU1vZGFsLnRoYW5rWW91KCRzdGF0ZVBhcmFtcy5zdWJtaXNzaW9uLl9pZCk7XG4gICAgfVxuXG5cbiAgICAkc2NvcGUuc2hvd1Byb2ZpbGVJbmZvID0gZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUucHJvZmlsZS5kYXRhID0gSlNPTi5wYXJzZShTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkpO1xuICAgICAgaWYgKCgkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzICYmICRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3MubGVuZ3RoID09PSAwKSB8fCAhJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcykge1xuICAgICAgICAkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzID0gW3tcbiAgICAgICAgICB1cmw6ICcnLFxuICAgICAgICAgIGF2YXRhcjogJycsXG4gICAgICAgICAgdXNlcm5hbWU6ICcnLFxuICAgICAgICAgIGlkOiAtMSxcbiAgICAgICAgICBwZXJtYW5lbnRMaW5rOiB0cnVlXG4gICAgICAgIH1dO1xuICAgICAgfTtcbiAgICAgICRzY29wZS5wcm9maWxlLmlzQXZhaWxhYmxlID0ge307XG4gICAgICAkc2NvcGUucHJvZmlsZS5pc0F2YWlsYWJsZS5lbWFpbCA9ICRzY29wZS5wcm9maWxlLmRhdGEuZW1haWwgPyB0cnVlIDogZmFsc2U7XG4gICAgICAkc2NvcGUucHJvZmlsZS5pc0F2YWlsYWJsZS5wYXNzd29yZCA9ICRzY29wZS5wcm9maWxlLmRhdGEucGFzc3dvcmQgPyB0cnVlIDogZmFsc2U7XG4gICAgICAkc2NvcGUucHJvZmlsZS5pc0F2YWlsYWJsZS5zb3VuZGNsb3VkID0gJHNjb3BlLnByb2ZpbGUuZGF0YS5zb3VuZGNsb3VkID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgJHNjb3BlLnByb2ZpbGUuZGF0YS5wYXNzd29yZCA9ICcnO1xuICAgIH07XG5cbiAgICAkc2NvcGUuc2F2ZVByb2ZpbGVJbmZvID0gZnVuY3Rpb24oKSB7XG5cbiAgICAgICRzY29wZS5tZXNzYWdlID0ge1xuICAgICAgICB2YWx1ZTogJycsXG4gICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgICB9O1xuXG4gICAgICB2YXIgcGVybWFuZW50TGlua3MgPSAkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzLmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHJldHVybiBpdGVtLmlkICE9PSAtMTtcbiAgICAgIH0pLm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIGRlbGV0ZSBpdGVtWyckJGhhc2hLZXknXTtcbiAgICAgICAgcmV0dXJuIGl0ZW07XG4gICAgICB9KTtcblxuICAgICAgdmFyIHNlbmRPYmogPSB7XG4gICAgICAgIG5hbWU6ICcnLFxuICAgICAgICBwYXNzd29yZDogJycsXG4gICAgICAgIHBlcm1hbmVudExpbmtzOiBKU09OLnN0cmluZ2lmeShwZXJtYW5lbnRMaW5rcylcbiAgICAgIH1cbiAgICAgIGlmICgkc2NvcGUucHJvZmlsZS5maWVsZCA9PT0gJ25hbWUnKSB7XG4gICAgICAgIHNlbmRPYmoubmFtZSA9ICRzY29wZS5wcm9maWxlLmRhdGEubmFtZTtcbiAgICAgIH0gZWxzZSBpZiAoJHNjb3BlLnByb2ZpbGUuZmllbGQgPT09ICdwYXNzd29yZCcpIHtcbiAgICAgICAgc2VuZE9iai5wYXNzd29yZCA9ICRzY29wZS5wcm9maWxlLmRhdGEucGFzc3dvcmQ7XG4gICAgICB9IGVsc2UgaWYgKCRzY29wZS5wcm9maWxlLmZpZWxkID09PSAnZW1haWwnKSB7XG4gICAgICAgIHNlbmRPYmouZW1haWwgPSAkc2NvcGUucHJvZmlsZS5kYXRhLmVtYWlsO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICBBcnRpc3RUb29sc1NlcnZpY2VcbiAgICAgICAgLnNhdmVQcm9maWxlSW5mbyhzZW5kT2JqKVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgIGlmIChyZXMuZGF0YSA9PT0gJ0VtYWlsIEVycm9yJykge1xuICAgICAgICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICAgICAgICAgIHZhbHVlOiAnRW1haWwgYWxyZWFkeSBleGlzdHMhJyxcbiAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlKHJlcy5kYXRhKTtcbiAgICAgICAgICAkc2NvcGUuY2xvc2VFZGl0UHJvZmlsZU1vZGFsKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgIGFsZXJ0KCdlcnJvciBzYXZpbmcnKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgICRzY29wZS5yZW1vdmVQZXJtYW5lbnRMaW5rID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9O1xuICAgICRzY29wZS5oaWRlYnV0dG9uID0gZmFsc2U7XG4gICAgJHNjb3BlLmFkZFBlcm1hbmVudExpbmsgPSBmdW5jdGlvbigpIHtcblxuICAgICAgaWYgKCRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3MubGVuZ3RoID49IDIgJiYgISRzY29wZS51c2VyLmFkbWluKSB7XG4gICAgICAgICRzY29wZS5oaWRlYnV0dG9uID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3MubGVuZ3RoID4gMiAmJiAhJHNjb3BlLnVzZXIuYWRtaW4pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzLnB1c2goe1xuICAgICAgICB1cmw6ICcnLFxuICAgICAgICBhdmF0YXI6ICcnLFxuICAgICAgICB1c2VybmFtZTogJycsXG4gICAgICAgIGlkOiAtMSxcbiAgICAgICAgcGVybWFuZW50TGluazogdHJ1ZVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgICRzY29wZS5wZXJtYW5lbnRMaW5rVVJMQ2hhbmdlID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgIHZhciBwZXJtYW5lbnRMaW5rID0ge307XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICBBcnRpc3RUb29sc1NlcnZpY2VcbiAgICAgICAgLnJlc29sdmVEYXRhKHtcbiAgICAgICAgICB1cmw6ICRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3NbaW5kZXhdLnVybFxuICAgICAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzW2luZGV4XS5hdmF0YXIgPSByZXMuZGF0YS5hdmF0YXJfdXJsID8gcmVzLmRhdGEuYXZhdGFyX3VybCA6ICcnO1xuICAgICAgICAgICRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3NbaW5kZXhdLnVzZXJuYW1lID0gcmVzLmRhdGEucGVybWFsaW5rO1xuICAgICAgICAgICRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3NbaW5kZXhdLmlkID0gcmVzLmRhdGEuaWQ7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgIGFsZXJ0KCdBcnRpc3RzIG5vdCBmb3VuZCcpO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAkc2NvcGUuc2F2ZVNvdW5kQ2xvdWRBY2NvdW50SW5mbyA9IGZ1bmN0aW9uKCkge1xuICAgICAgU0MuY29ubmVjdCgpXG4gICAgICAgIC50aGVuKHNhdmVJbmZvKVxuICAgICAgICAudGhlbihoYW5kbGVSZXNwb25zZSlcbiAgICAgICAgLmNhdGNoKGhhbmRsZUVycm9yKTtcblxuICAgICAgZnVuY3Rpb24gc2F2ZUluZm8ocmVzKSB7XG4gICAgICAgIHJldHVybiBBcnRpc3RUb29sc1NlcnZpY2Uuc2F2ZVNvdW5kQ2xvdWRBY2NvdW50SW5mbyh7XG4gICAgICAgICAgdG9rZW46IHJlcy5vYXV0aF90b2tlblxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UocmVzKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIGlmIChyZXMuc3RhdHVzID09PSAyMDAgJiYgKHJlcy5kYXRhLnN1Y2Nlc3MgPT09IHRydWUpKSB7XG4gICAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlKHJlcy5kYXRhLmRhdGEpO1xuICAgICAgICAgICRzY29wZS5wcm9maWxlLmRhdGEgPSByZXMuZGF0YS5kYXRhO1xuICAgICAgICAgICRzY29wZS5wcm9maWxlLmlzQXZhaWxhYmxlLnNvdW5kY2xvdWQgPSB0cnVlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICRzY29wZS5tZXNzYWdlID0ge1xuICAgICAgICAgICAgdmFsdWU6ICdZb3UgYWxyZWFkeSBoYXZlIGFuIGFjY291bnQgd2l0aCB0aGlzIHNvdW5kY2xvdWQgdXNlcm5hbWUnLFxuICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZVxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihlcnIpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgJHNjb3BlLmdldERvd25sb2FkTGlzdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgQXJ0aXN0VG9vbHNTZXJ2aWNlXG4gICAgICAgIC5nZXREb3dubG9hZExpc3QoKVxuICAgICAgICAudGhlbihoYW5kbGVSZXNwb25zZSlcbiAgICAgICAgLmNhdGNoKGhhbmRsZUVycm9yKTtcblxuICAgICAgZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UocmVzKSB7XG4gICAgICAgICRzY29wZS5kb3dubG9hZEdhdGV3YXlMaXN0ID0gcmVzLmRhdGE7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycikge1xuICAgICAgICBjb25zb2xlLmxvZyhlcnIpXG4gICAgICB9XG4gICAgfTtcblxuICAgICRzY29wZS5kZWxldGVEb3dubG9hZEdhdGV3YXkgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgaWYgKGNvbmZpcm0oXCJEbyB5b3UgcmVhbGx5IHdhbnQgdG8gZGVsZXRlIHRoaXMgdHJhY2s/XCIpKSB7XG4gICAgICAgIHZhciBkb3dubG9hZEdhdGVXYXlJRCA9ICRzY29wZS5kb3dubG9hZEdhdGV3YXlMaXN0W2luZGV4XS5faWQ7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICAgQXJ0aXN0VG9vbHNTZXJ2aWNlXG4gICAgICAgICAgLmRlbGV0ZURvd25sb2FkR2F0ZXdheSh7XG4gICAgICAgICAgICBpZDogZG93bmxvYWRHYXRlV2F5SURcbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKGhhbmRsZVJlc3BvbnNlKVxuICAgICAgICAgIC5jYXRjaChoYW5kbGVFcnJvcik7XG5cbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UocmVzKSB7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAkc2NvcGUuZG93bmxvYWRHYXRld2F5TGlzdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlRXJyb3IocmVzKSB7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG4gIH0pXG4gIC5jb250cm9sbGVyKCdPcGVuVGhhbmtZb3VNb2RhbENvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUpIHt9KSIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlclxuICAgICAgICAuc3RhdGUoJ2FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5RWRpdCcsIHtcbiAgICAgICAgICAgIHVybDogJy9kb3dubG9hZC1nYXRld2F5L2VkaXQvOmdhdGV3YXlJRCcsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvYXJ0aXN0VG9vbHMvZG93bmxvYWRHYXRld2F5Lmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5Q29udHJvbGxlcidcbiAgICAgICAgfSlcbiAgICAgICAgLnN0YXRlKCdhcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheU5ldycsIHtcbiAgICAgICAgICAgIHVybDogJy9kb3dubG9hZC1nYXRld2F5L25ldycsXG4gICAgICAgICAgICBwYXJhbXM6IHtcbiAgICAgICAgICAgICAgICBzdWJtaXNzaW9uOiBudWxsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9ob21lL3ZpZXdzL2FydGlzdFRvb2xzL2Rvd25sb2FkR2F0ZXdheS5odG1sJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheUNvbnRyb2xsZXInXG4gICAgICAgIH0pXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5Q29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCAkc2NvcGUsICRodHRwLCAkbG9jYXRpb24sICR3aW5kb3csICR1aWJNb2RhbCwgJHRpbWVvdXQsIFNlc3Npb25TZXJ2aWNlLCBBcnRpc3RUb29sc1NlcnZpY2UpIHtcbiAgICAvKiBJbml0IERvd25sb2FkIEdhdGV3YXkgZm9ybSBkYXRhICovXG4gICAgJHNjb3BlLnVzZXIgPSBKU09OLnBhcnNlKFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKSk7XG5cbiAgICAkc2NvcGUudHJhY2sgPSB7XG4gICAgICAgIGFydGlzdFVzZXJuYW1lOiAnJyxcbiAgICAgICAgdHJhY2tUaXRsZTogJycsXG4gICAgICAgIHRyYWNrQXJ0d29ya1VSTDogJycsXG4gICAgICAgIFNNTGlua3M6IFtdLFxuICAgICAgICBsaWtlOiBmYWxzZSxcbiAgICAgICAgY29tbWVudDogZmFsc2UsXG4gICAgICAgIHJlcG9zdDogZmFsc2UsXG4gICAgICAgIGFydGlzdHM6IFtdLFxuICAgICAgICBzaG93RG93bmxvYWRUcmFja3M6ICd1c2VyJyxcbiAgICAgICAgYWRtaW46ICRzY29wZS51c2VyLmFkbWluLFxuICAgICAgICBmaWxlOiB7fVxuICAgIH07XG4gICAgJHNjb3BlLnByb2ZpbGUgPSB7fTtcbiAgICAvKiBJbml0IHRyYWNrIGxpc3QgYW5kIHRyYWNrTGlzdE9iaiovXG4gICAgJHNjb3BlLnRyYWNrTGlzdCA9IFtdO1xuICAgICRzY29wZS50cmFja0xpc3RPYmogPSBudWxsO1xuXG4gICAgLyogTWV0aG9kIGZvciByZXNldHRpbmcgRG93bmxvYWQgR2F0ZXdheSBmb3JtICovXG5cbiAgICAkc2NvcGUudHJhY2tMaXN0Q2hhbmdlID0gZnVuY3Rpb24oaW5kZXgpIHtcblxuICAgICAgICAvKiBTZXQgYm9vbGVhbnMgKi9cblxuICAgICAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IGZhbHNlO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG5cbiAgICAgICAgLyogU2V0IHRyYWNrIGRhdGEgKi9cblxuICAgICAgICB2YXIgdHJhY2sgPSAkc2NvcGUudHJhY2tMaXN0T2JqO1xuICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tVUkwgPSB0cmFjay5wZXJtYWxpbmtfdXJsO1xuICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tUaXRsZSA9IHRyYWNrLnRpdGxlO1xuICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tJRCA9IHRyYWNrLmlkO1xuICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0SUQgPSB0cmFjay51c2VyLmlkO1xuICAgICAgICAkc2NvcGUudHJhY2suZGVzY3JpcHRpb24gPSB0cmFjay5kZXNjcmlwdGlvbjtcbiAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrQXJ0d29ya1VSTCA9IHRyYWNrLmFydHdvcmtfdXJsID8gdHJhY2suYXJ0d29ya191cmwucmVwbGFjZSgnbGFyZ2UuanBnJywgJ3Q1MDB4NTAwLmpwZycpIDogJyc7XG4gICAgICAgICRzY29wZS50cmFjay5hcnRpc3RBcnR3b3JrVVJMID0gdHJhY2sudXNlci5hdmF0YXJfdXJsID8gdHJhY2sudXNlci5hdmF0YXJfdXJsIDogJyc7XG4gICAgICAgICRzY29wZS50cmFjay5hcnRpc3RVUkwgPSB0cmFjay51c2VyLnBlcm1hbGlua191cmw7XG4gICAgICAgICRzY29wZS50cmFjay5hcnRpc3RVc2VybmFtZSA9IHRyYWNrLnVzZXIudXNlcm5hbWU7XG4gICAgICAgICRzY29wZS50cmFjay5TTUxpbmtzID0gW107XG5cbiAgICAgICAgU0MuZ2V0KCcvdXNlcnMvJyArICRzY29wZS50cmFjay5hcnRpc3RJRCArICcvd2ViLXByb2ZpbGVzJylcbiAgICAgICAgICAgIC50aGVuKGhhbmRsZVdlYlByb2ZpbGVzKVxuICAgICAgICAgICAgLmNhdGNoKGhhbmRsZUVycm9yKTtcblxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVXZWJQcm9maWxlcyhwcm9maWxlcykge1xuICAgICAgICAgICAgcHJvZmlsZXMuZm9yRWFjaChmdW5jdGlvbihwcm9mKSB7XG4gICAgICAgICAgICAgICAgaWYgKFsndHdpdHRlcicsICd5b3V0dWJlJywgJ2ZhY2Vib29rJywgJ3Nwb3RpZnknLCAnc291bmRjbG91ZCcsICdpbnN0YWdyYW0nXS5pbmRleE9mKHByb2Yuc2VydmljZSkgIT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBrZXk6IHByb2Yuc2VydmljZSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBwcm9mLnVybFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihlcnIpIHtcbiAgICAgICAgICAgICRzY29wZS50cmFjay50cmFja0lEID0gbnVsbDtcbiAgICAgICAgICAgIGFsZXJ0KCdTb25nIG5vdCBmb3VuZCBvciBmb3JiaWRkZW4nKTtcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICAkc2NvcGUucmVtb3ZlU01MaW5rID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3Muc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnNhdmVEb3dubG9hZEdhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCEoJHNjb3BlLnRyYWNrLmRvd25sb2FkVVJMIHx8ICRzY29wZS50cmFjay5maWxlLm5hbWUpKSB7XG4gICAgICAgICAgICBhbGVydCgnRW50ZXIgYSBkb3dubG9hZCBmaWxlJyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoISRzY29wZS50cmFjay50cmFja0lEKSB7XG4gICAgICAgICAgICBhbGVydCgnVHJhY2sgTm90IEZvdW5kJyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgICB2YXIgc2VuZE9iaiA9IG5ldyBGb3JtRGF0YSgpO1xuICAgICAgICBmb3IgKHZhciBwcm9wIGluICRzY29wZS50cmFjaykge1xuICAgICAgICAgICAgc2VuZE9iai5hcHBlbmQocHJvcCwgJHNjb3BlLnRyYWNrW3Byb3BdKTtcbiAgICAgICAgfVxuICAgICAgICB2YXIgYXJ0aXN0cyA9ICRzY29wZS50cmFjay5hcnRpc3RzLmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICByZXR1cm4gaXRlbS5pZCAhPT0gLTE7XG4gICAgICAgIH0pLm1hcChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICBkZWxldGUgaXRlbVsnJCRoYXNoS2V5J107XG4gICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgfSlcbiAgICAgICAgc2VuZE9iai5hcHBlbmQoJ2FydGlzdHMnLCBKU09OLnN0cmluZ2lmeShhcnRpc3RzKSk7XG4gICAgICAgIHZhciBTTUxpbmtzID0ge307XG4gICAgICAgICRzY29wZS50cmFjay5TTUxpbmtzLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICAgICAgU01MaW5rc1tpdGVtLmtleV0gPSBpdGVtLnZhbHVlO1xuICAgICAgICB9KTtcbiAgICAgICAgc2VuZE9iai5hcHBlbmQoJ1NNTGlua3MnLCBKU09OLnN0cmluZ2lmeShTTUxpbmtzKSk7XG4gICAgICAgIGlmICgkc2NvcGUudHJhY2sucGxheWxpc3RzKSB7XG4gICAgICAgICAgICBzZW5kT2JqLmFwcGVuZCgncGxheWxpc3RzJywgSlNPTi5zdHJpbmdpZnkoJHNjb3BlLnRyYWNrLnBsYXlsaXN0cykpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG9wdGlvbnMgPSB7XG4gICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgIHVybDogJy9hcGkvZGF0YWJhc2UvZG93bmxvYWR1cmwnLFxuICAgICAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICAgICAgICdDb250ZW50LVR5cGUnOiB1bmRlZmluZWRcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0cmFuc2Zvcm1SZXF1ZXN0OiBhbmd1bGFyLmlkZW50aXR5LFxuICAgICAgICAgICAgZGF0YTogc2VuZE9ialxuICAgICAgICB9O1xuICAgICAgICAkaHR0cChvcHRpb25zKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAoJHN0YXRlUGFyYW1zLnN1Ym1pc3Npb24pIHtcbiAgICAgICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdhcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheUxpc3QnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnc3VibWlzc2lvbic6ICRzdGF0ZVBhcmFtcy5zdWJtaXNzaW9uXG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnYXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlMaXN0Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgYWxlcnQoXCJFUlJPUjogRXJyb3IgaW4gc2F2aW5nIHVybFwiKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgfSk7XG4gICAgfTtcblxuXG4gICAgJHNjb3BlLmNoZWNrSWZFZGl0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICgkc3RhdGVQYXJhbXMuZ2F0ZXdheUlEKSB7XG4gICAgICAgICAgICAkc2NvcGUuZ2V0RG93bmxvYWRHYXRld2F5KCRzdGF0ZVBhcmFtcy5nYXRld2F5SUQpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgICRzY29wZS5nZXRUcmFja0xpc3RGcm9tU291bmRjbG91ZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgcHJvZmlsZSA9IEpTT04ucGFyc2UoU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKTtcbiAgICAgICAgaWYgKHByb2ZpbGUuc291bmRjbG91ZCkge1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgICAgICAgU0MuZ2V0KCcvdXNlcnMvJyArIHByb2ZpbGUuc291bmRjbG91ZC5pZCArICcvdHJhY2tzJylcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbih0cmFja3MpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrTGlzdCA9IHRyYWNrcztcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgICRzY29wZS5jaGVja0lmU3VibWlzc2lvbiA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoJHN0YXRlUGFyYW1zLnN1Ym1pc3Npb24pIHtcbiAgICAgICAgICAgIGlmICgkc3RhdGUuaW5jbHVkZXMoJ2FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5TmV3JykpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tVUkwgPSAkcm9vdFNjb3BlLnN1Ym1pc3Npb24udHJhY2tVUkw7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrVVJMQ2hhbmdlKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkc2NvcGUub3BlblRoYW5rWW91TW9kYWwudGhhbmtZb3UoJHN0YXRlUGFyYW1zLnN1Ym1pc3Npb24uX2lkKTtcbiAgICAgICAgICAgICRyb290U2NvcGUuc3VibWlzc2lvbiA9IG51bGw7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAkc2NvcGUudHJhY2tVUkxDaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCRzY29wZS50cmFjay50cmFja1VSTCAhPT0gJycpIHtcbiAgICAgICAgICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gZmFsc2U7XG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAgICAgICBBcnRpc3RUb29sc1NlcnZpY2UucmVzb2x2ZURhdGEoe1xuICAgICAgICAgICAgICAgIHVybDogJHNjb3BlLnRyYWNrLnRyYWNrVVJMXG4gICAgICAgICAgICB9KS50aGVuKGhhbmRsZVRyYWNrRGF0YUFuZEdldFByb2ZpbGVzKS50aGVuKGhhbmRsZVdlYlByb2ZpbGVzKS5jYXRjaChoYW5kbGVFcnJvcik7XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGhhbmRsZVRyYWNrRGF0YUFuZEdldFByb2ZpbGVzKHJlcykge1xuICAgICAgICAgICAgICAgICRzY29wZS50cmFjay50cmFja1RpdGxlID0gcmVzLmRhdGEudGl0bGU7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrSUQgPSByZXMuZGF0YS5pZDtcbiAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0SUQgPSByZXMuZGF0YS51c2VyLmlkO1xuICAgICAgICAgICAgICAgICRzY29wZS50cmFjay5kZXNjcmlwdGlvbiA9IHJlcy5kYXRhLmRlc2NyaXB0aW9uO1xuICAgICAgICAgICAgICAgICRzY29wZS50cmFjay50cmFja0FydHdvcmtVUkwgPSByZXMuZGF0YS5hcnR3b3JrX3VybCA/IHJlcy5kYXRhLmFydHdvcmtfdXJsLnJlcGxhY2UoJ2xhcmdlLmpwZycsICd0NTAweDUwMC5qcGcnKSA6ICcnO1xuICAgICAgICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RBcnR3b3JrVVJMID0gcmVzLmRhdGEudXNlci5hdmF0YXJfdXJsID8gcmVzLmRhdGEudXNlci5hdmF0YXJfdXJsLnJlcGxhY2UoJ2xhcmdlLmpwZycsICd0NTAweDUwMC5qcGcnKSA6ICcnO1xuICAgICAgICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RVUkwgPSByZXMuZGF0YS51c2VyLnBlcm1hbGlua191cmw7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdFVzZXJuYW1lID0gcmVzLmRhdGEudXNlci51c2VybmFtZTtcbiAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2suU01MaW5rcyA9IFtdO1xuICAgICAgICAgICAgICAgIHJldHVybiBTQy5nZXQoJy91c2Vycy8nICsgJHNjb3BlLnRyYWNrLmFydGlzdElEICsgJy93ZWItcHJvZmlsZXMnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gaGFuZGxlV2ViUHJvZmlsZXMocHJvZmlsZXMpIHtcbiAgICAgICAgICAgICAgICBwcm9maWxlcy5mb3JFYWNoKGZ1bmN0aW9uKHByb2YpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKFsndHdpdHRlcicsICd5b3V0dWJlJywgJ2ZhY2Vib29rJywgJ3Nwb3RpZnknLCAnc291bmRjbG91ZCcsICdpbnN0YWdyYW0nXS5pbmRleE9mKHByb2Yuc2VydmljZSkgIT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS50cmFjay5TTUxpbmtzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGtleTogcHJvZi5zZXJ2aWNlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlOiBwcm9mLnVybFxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihlcnIpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tJRCA9IG51bGw7XG4gICAgICAgICAgICAgICAgYWxlcnQoJ1Nvbmcgbm90IGZvdW5kIG9yIGZvcmJpZGRlbicpO1xuICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAkc2NvcGUuU01MaW5rQ2hhbmdlID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgZnVuY3Rpb24gZ2V0TG9jYXRpb24oaHJlZikge1xuICAgICAgICAgICAgdmFyIGxvY2F0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gaHJlZjtcbiAgICAgICAgICAgIGlmIChsb2NhdGlvbi5ob3N0ID09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICBsb2NhdGlvbi5ocmVmID0gbG9jYXRpb24uaHJlZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBsb2NhdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBsb2NhdGlvbiA9IGdldExvY2F0aW9uKCRzY29wZS50cmFjay5TTUxpbmtzW2luZGV4XS52YWx1ZSk7XG4gICAgICAgIHZhciBob3N0ID0gbG9jYXRpb24uaG9zdG5hbWUuc3BsaXQoJy4nKVswXTtcbiAgICAgICAgdmFyIGZpbmRMaW5rID0gJHNjb3BlLnRyYWNrLlNNTGlua3MuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgICAgIHJldHVybiBpdGVtLmtleSA9PT0gaG9zdDtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGZpbmRMaW5rLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICAkc2NvcGUudHJhY2suU01MaW5rc1tpbmRleF0ua2V5ID0gaG9zdDtcbiAgICB9XG5cbiAgICAkc2NvcGUuYWRkU01MaW5rID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICRzY29wZS50cmFjay5TTUxpbmtzLnB1c2goe1xuICAgICAgICAgICAga2V5OiAnJyxcbiAgICAgICAgICAgIHZhbHVlOiAnJ1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAkc2NvcGUuY2xlYXJPckZpbGUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCRzY29wZS50cmFjay5kb3dubG9hZFVSTCkge1xuICAgICAgICAgICAgYW5ndWxhci5lbGVtZW50KFwiaW5wdXRbdHlwZT0nZmlsZSddXCIpLnZhbChudWxsKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgICRzY29wZS5hcnRpc3RVUkxDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICB2YXIgYXJ0aXN0ID0ge307XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICAgQXJ0aXN0VG9vbHNTZXJ2aWNlLnJlc29sdmVEYXRhKHtcbiAgICAgICAgICAgIHVybDogJHNjb3BlLnRyYWNrLmFydGlzdHNbaW5kZXhdLnVybFxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdHNbaW5kZXhdLmF2YXRhciA9IHJlcy5kYXRhLmF2YXRhcl91cmwgPyByZXMuZGF0YS5hdmF0YXJfdXJsIDogJyc7XG4gICAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0c1tpbmRleF0udXNlcm5hbWUgPSByZXMuZGF0YS51c2VybmFtZTtcbiAgICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RzW2luZGV4XS5pZCA9IHJlcy5kYXRhLmlkO1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICBhbGVydCgnQXJ0aXN0cyBub3QgZm91bmQnKTtcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgICRzY29wZS5yZW1vdmVBcnRpc3QgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cblxuICAgICRzY29wZS5hZGRBcnRpc3QgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdHMucHVzaCh7XG4gICAgICAgICAgICB1cmw6ICcnLFxuICAgICAgICAgICAgYXZhdGFyOiAnJyxcbiAgICAgICAgICAgIHVzZXJuYW1lOiAnJyxcbiAgICAgICAgICAgIGlkOiAtMSxcbiAgICAgICAgICAgIHBlcm1hbmVudExpbms6IGZhbHNlXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgICRzY29wZS5yZW1vdmVQbGF5bGlzdCA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAgICRzY29wZS50cmFjay5wbGF5bGlzdHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gICAgJHNjb3BlLnBsYXlsaXN0VVJMQ2hhbmdlID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgICBBZG1pbkRMR2F0ZVNlcnZpY2VcbiAgICAgICAgICAgIC5yZXNvbHZlRGF0YSh7XG4gICAgICAgICAgICAgICAgdXJsOiAkc2NvcGUudHJhY2sucGxheWxpc3RzW2luZGV4XS51cmxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2sucGxheWxpc3RzW2luZGV4XS5hdmF0YXIgPSByZXMuZGF0YS5hcnR3b3JrX3VybDtcbiAgICAgICAgICAgICAgICAkc2NvcGUudHJhY2sucGxheWxpc3RzW2luZGV4XS50aXRsZSA9IHJlcy5kYXRhLnRpdGxlO1xuICAgICAgICAgICAgICAgICRzY29wZS50cmFjay5wbGF5bGlzdHNbaW5kZXhdLmlkID0gcmVzLmRhdGEuaWQ7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICBhbGVydCgnUGxheWxpc3Qgbm90IGZvdW5kJyk7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gcmVzZXREb3dubG9hZEdhdGV3YXkoKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5tZXNzYWdlID0ge1xuICAgICAgICAgICAgdmFsOiAnJyxcbiAgICAgICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgICAgIH07XG5cbiAgICAgICAgJHNjb3BlLnRyYWNrID0ge1xuICAgICAgICAgICAgYXJ0aXN0VXNlcm5hbWU6ICcnLFxuICAgICAgICAgICAgdHJhY2tUaXRsZTogJycsXG4gICAgICAgICAgICB0cmFja0FydHdvcmtVUkw6ICcnLFxuICAgICAgICAgICAgU01MaW5rczogW10sXG4gICAgICAgICAgICBsaWtlOiBmYWxzZSxcbiAgICAgICAgICAgIGNvbW1lbnQ6IGZhbHNlLFxuICAgICAgICAgICAgcmVwb3N0OiBmYWxzZSxcbiAgICAgICAgICAgIGFydGlzdHM6IFt7XG4gICAgICAgICAgICAgICAgdXJsOiAnJyxcbiAgICAgICAgICAgICAgICBhdmF0YXI6ICcnLFxuICAgICAgICAgICAgICAgIHVzZXJuYW1lOiAnJyxcbiAgICAgICAgICAgICAgICBpZDogLTEsXG4gICAgICAgICAgICAgICAgcGVybWFuZW50TGluazogZmFsc2VcbiAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgc2hvd0Rvd25sb2FkVHJhY2tzOiAndXNlcidcbiAgICAgICAgfTtcbiAgICAgICAgYW5ndWxhci5lbGVtZW50KFwiaW5wdXRbdHlwZT0nZmlsZSddXCIpLnZhbChudWxsKTtcbiAgICB9XG5cbiAgICAvKiBNZXRob2QgZm9yIGdldHRpbmcgRG93bmxvYWRHYXRld2F5IGluIGNhc2Ugb2YgZWRpdCAqL1xuXG4gICAgJHNjb3BlLmdldERvd25sb2FkR2F0ZXdheSA9IGZ1bmN0aW9uKGRvd25sb2FkR2F0ZVdheUlEKSB7XG4gICAgICAgIC8vIHJlc2V0RG93bmxvYWRHYXRld2F5KCk7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICAgQXJ0aXN0VG9vbHNTZXJ2aWNlXG4gICAgICAgICAgICAuZ2V0RG93bmxvYWRHYXRld2F5KHtcbiAgICAgICAgICAgICAgICBpZDogZG93bmxvYWRHYXRlV2F5SURcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbihoYW5kbGVSZXNwb25zZSlcbiAgICAgICAgICAgIC5jYXRjaChoYW5kbGVFcnJvcik7XG5cbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UocmVzKSB7XG5cbiAgICAgICAgICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgICRzY29wZS50cmFjayA9IHJlcy5kYXRhO1xuXG4gICAgICAgICAgICB2YXIgU01MaW5rcyA9IHJlcy5kYXRhLlNNTGlua3MgPyByZXMuZGF0YS5TTUxpbmtzIDoge307XG4gICAgICAgICAgICB2YXIgcGVybWFuZW50TGlua3MgPSByZXMuZGF0YS5wZXJtYW5lbnRMaW5rcyA/IHJlcy5kYXRhLnBlcm1hbmVudExpbmtzIDogWycnXTtcbiAgICAgICAgICAgIHZhciBTTUxpbmtzQXJyYXkgPSBbXTtcbiAgICAgICAgICAgIHZhciBwZXJtYW5lbnRMaW5rc0FycmF5ID0gW107XG5cbiAgICAgICAgICAgIGZvciAodmFyIGxpbmsgaW4gU01MaW5rcykge1xuICAgICAgICAgICAgICAgIFNNTGlua3NBcnJheS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAga2V5OiBsaW5rLFxuICAgICAgICAgICAgICAgICAgICB2YWx1ZTogU01MaW5rc1tsaW5rXVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGVybWFuZW50TGlua3MuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgICAgICAgcGVybWFuZW50TGlua3NBcnJheS5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBpdGVtXG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKCEkc2NvcGUudHJhY2suc2hvd0Rvd25sb2FkVHJhY2tzKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnNob3dEb3dubG9hZFRyYWNrcyA9ICd1c2VyJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRzY29wZS50cmFjay5TTUxpbmtzID0gU01MaW5rc0FycmF5O1xuICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnBlcm1hbmVudExpbmtzID0gcGVybWFuZW50TGlua3NBcnJheTtcbiAgICAgICAgICAgICRzY29wZS50cmFjay5wbGF5bGlzdElEUyA9IFtdO1xuICAgICAgICAgICAgLy8gJHNjb3BlLnRyYWNrLnNob3dEb3dubG9hZFRyYWNrcyA9ICgkc2NvcGUudHJhY2suc2hvd0Rvd25sb2FkVHJhY2tzID09PSAndXNlcicpID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLnRyYWNrKTtcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihyZXMpIHtcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgJHNjb3BlLmNsZWFyT3JJbnB1dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAkc2NvcGUudHJhY2suZG93bmxvYWRVUkwgPSBcIlwiO1xuICAgIH1cblxuICAgICRzY29wZS4kd2F0Y2goJ3RyYWNrJywgZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpIHtcbiAgICAgICAgaWYgKG5ld1ZhbC50cmFja1RpdGxlKVxuICAgICAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0cmFja1ByZXZpZXdEYXRhJywgSlNPTi5zdHJpbmdpZnkobmV3VmFsKSk7XG4gICAgfSwgdHJ1ZSk7XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXJcbiAgICAgICAgLnN0YXRlKCdhcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheVByZXZpZXcnLCB7XG4gICAgICAgICAgICB1cmw6ICcvZG93bmxvYWQtZ2F0ZXdheS9wcmV2aWV3JyxcbiAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgIHN1Ym1pc3Npb246IG51bGxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvYXJ0aXN0VG9vbHMvcHJldmlldy5odG1sJyxcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdBcnRpc3RUb29sc1ByZXZpZXdDb250cm9sbGVyJ1xuICAgICAgICB9KVxufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoXCJBcnRpc3RUb29sc1ByZXZpZXdDb250cm9sbGVyXCIsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCAkc2NvcGUsICRodHRwLCAkbG9jYXRpb24sICR3aW5kb3csICR1aWJNb2RhbCwgJHRpbWVvdXQsIFNlc3Npb25TZXJ2aWNlLCBBcnRpc3RUb29sc1NlcnZpY2UpIHtcbiAgICB2YXIgdHJhY2sgPSBKU09OLnBhcnNlKHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgndHJhY2tQcmV2aWV3RGF0YScpKTtcbiAgICBjb25zb2xlLmxvZyh0cmFjayk7XG4gICAgaWYgKCF0cmFjay50cmFja1RpdGxlKSB7XG4gICAgICAgIGFsZXJ0KCdUcmFjayBOb3QgRm91bmQnKTtcbiAgICAgICAgJHN0YXRlLmdvKFwiYXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlMaXN0XCIpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgJHNjb3BlLnRyYWNrID0gdHJhY2s7XG4gICAgJHNjb3BlLnBsYXllciA9IHt9O1xuICAgIFNDLnN0cmVhbSgnL3RyYWNrcy8nICsgJHNjb3BlLnRyYWNrLnRyYWNrSUQpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHApIHtcbiAgICAgICAgICAgICRzY29wZS5wbGF5ZXIgPSBwO1xuICAgICAgICB9KVxuXG4gICAgJHNjb3BlLnRvZ2dsZSA9IHRydWU7XG4gICAgJHNjb3BlLnRvZ2dsZVBsYXkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgJHNjb3BlLnRvZ2dsZSA9ICEkc2NvcGUudG9nZ2xlO1xuICAgICAgICBpZiAoJHNjb3BlLnRvZ2dsZSkge1xuICAgICAgICAgICAgJHNjb3BlLnBsYXllci5wYXVzZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJHNjb3BlLnBsYXllci5wbGF5KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgJHNjb3BlLm5vZGwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgYWxlcnQoJ05vIGRvd25sb2FkIGluIHByZXZpZXcgbW9kZS4nKVxuICAgIH1cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2hvbWUnLCB7XG4gICAgICB1cmw6ICcvJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS92aWV3cy9ob21lLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJ1xuICAgIH0pXG4gICAgLnN0YXRlKCdhYm91dCcsIHtcbiAgICAgIHVybDogJy9hYm91dCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvYWJvdXQuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnSG9tZUNvbnRyb2xsZXInXG4gICAgfSlcbiAgICAuc3RhdGUoJ3NlcnZpY2VzJywge1xuICAgICAgdXJsOiAnL3NlcnZpY2VzJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS92aWV3cy9zZXJ2aWNlcy5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcbiAgICB9KVxuICAgIC5zdGF0ZSgnZmFxcycsIHtcbiAgICAgIHVybDogJy9mYXFzJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS92aWV3cy9mYXFzLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJ1xuICAgIH0pXG4gICAgLnN0YXRlKCdhcHBseScsIHtcbiAgICAgIHVybDogJy9hcHBseScsXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvYXBwbHkuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnSG9tZUNvbnRyb2xsZXInXG4gICAgfSlcbiAgICAuc3RhdGUoJ2NvbnRhY3QnLCB7XG4gICAgICB1cmw6ICcvY29udGFjdCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvY29udGFjdC5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcbiAgICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignSG9tZUNvbnRyb2xsZXInLCBbJyRyb290U2NvcGUnLFxuICAnJHN0YXRlJyxcbiAgJyRzY29wZScsXG4gICckaHR0cCcsXG4gICckbG9jYXRpb24nLFxuICAnJHdpbmRvdycsXG4gICdIb21lU2VydmljZScsXG4gIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uLCAkd2luZG93LCBIb21lU2VydmljZSkge1xuXG4gICAgJHNjb3BlLmFwcGxpY2F0aW9uT2JqID0ge307XG4gICAgJHNjb3BlLmFydGlzdCA9IHt9O1xuICAgICRzY29wZS5zZW50ID0ge1xuICAgICAgYXBwbGljYXRpb246IGZhbHNlLFxuICAgICAgYXJ0aXN0RW1haWw6IGZhbHNlXG4gICAgfTtcbiAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgIGFwcGxpY2F0aW9uOiB7XG4gICAgICAgIHZhbDogJycsXG4gICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgICB9LFxuICAgICAgYXJ0aXN0RW1haWw6IHtcbiAgICAgICAgdmFsOiAnJyxcbiAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyogQXBwbHkgcGFnZSBzdGFydCAqL1xuXG4gICAgJHNjb3BlLnRvZ2dsZUFwcGxpY2F0aW9uU2VudCA9IGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICAgIGFwcGxpY2F0aW9uOiB7XG4gICAgICAgICAgdmFsOiAnJyxcbiAgICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgJHNjb3BlLnNlbnQuYXBwbGljYXRpb24gPSAhJHNjb3BlLnNlbnQuYXBwbGljYXRpb247XG4gICAgfTtcblxuICAgICRzY29wZS5zYXZlQXBwbGljYXRpb24gPSBmdW5jdGlvbigpIHtcblxuICAgICAgJHNjb3BlLm1lc3NhZ2UuYXBwbGljYXRpb24gPSB7XG4gICAgICAgIHZhbDogJycsXG4gICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgICB9O1xuXG4gICAgICBIb21lU2VydmljZVxuICAgICAgICAuc2F2ZUFwcGxpY2F0aW9uKCRzY29wZS5hcHBsaWNhdGlvbk9iailcbiAgICAgICAgLnRoZW4oc2F2ZUFwcGxpY2F0aW9uUmVzcG9uc2UpXG4gICAgICAgIC5jYXRjaChzYXZlQXBwbGljYXRpb25FcnJvcilcblxuICAgICAgZnVuY3Rpb24gc2F2ZUFwcGxpY2F0aW9uUmVzcG9uc2UocmVzKSB7XG4gICAgICAgIGlmIChyZXMuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAkc2NvcGUuYXBwbGljYXRpb25PYmogPSB7fTtcbiAgICAgICAgICAkc2NvcGUuc2VudC5hcHBsaWNhdGlvbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2F2ZUFwcGxpY2F0aW9uRXJyb3IocmVzKSB7XG4gICAgICAgIGlmKHJlcy5zdGF0dXMgPT09IDQwMCkge1xuICAgICAgICAgICRzY29wZS5tZXNzYWdlLmFwcGxpY2F0aW9uID0ge1xuICAgICAgICAgICAgdmFsOiAnRW1haWwgYWxyZWFkeSBleGlzdHMhJyxcbiAgICAgICAgICAgIHZpc2libGU6IHRydWVcbiAgICAgICAgICB9O1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAkc2NvcGUubWVzc2FnZS5hcHBsaWNhdGlvbiA9IHtcbiAgICAgICAgICB2YWw6ICdFcnJvciBpbiBwcm9jZXNzaW5nIHlvdXIgcmVxdWVzdCcsXG4gICAgICAgICAgdmlzaWJsZTogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvKiBBcHBseSBwYWdlIGVuZCAqL1xuXG4gICAgLyogQXJ0aXN0IFRvb2xzIHBhZ2Ugc3RhcnQgKi9cbiAgICBcbiAgICAkc2NvcGUudG9nZ2xlQXJ0aXN0RW1haWwgPSBmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5tZXNzYWdlID0ge1xuICAgICAgICBhcnRpc3RFbWFpbDoge1xuICAgICAgICAgIHZhbDogJycsXG4gICAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5zZW50LmFydGlzdEVtYWlsID0gISRzY29wZS5zZW50LmFydGlzdEVtYWlsO1xuICAgIH07XG5cbiAgICAkc2NvcGUuc2F2ZUFydGlzdEVtYWlsID0gZnVuY3Rpb24oKSB7XG4gICAgICBIb21lU2VydmljZVxuICAgICAgICAuc2F2ZUFydGlzdEVtYWlsKCRzY29wZS5hcnRpc3QpXG4gICAgICAgIC50aGVuKGFydGlzdEVtYWlsUmVzcG9uc2UpXG4gICAgICAgIC5jYXRjaChhcnRpc3RFbWFpbEVycm9yKVxuXG4gICAgICBmdW5jdGlvbiBhcnRpc3RFbWFpbFJlc3BvbnNlKHJlcykge1xuICAgICAgICBpZiAocmVzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgJHNjb3BlLmFydGlzdCA9IHt9O1xuICAgICAgICAgICRzY29wZS5zZW50LmFydGlzdEVtYWlsID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBhcnRpc3RFbWFpbEVycm9yKHJlcykge1xuICAgICAgICBpZihyZXMuc3RhdHVzID09PSA0MDApIHtcbiAgICAgICAgICAkc2NvcGUubWVzc2FnZS5hcnRpc3RFbWFpbCA9IHtcbiAgICAgICAgICAgIHZhbDogJ0VtYWlsIGFscmVhZHkgZXhpc3RzIScsXG4gICAgICAgICAgICB2aXNpYmxlOiB0cnVlXG4gICAgICAgICAgfTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUubWVzc2FnZS5hcnRpc3RFbWFpbCA9IHtcbiAgICAgICAgICB2YWw6ICdFcnJvciBpbiBwcm9jZXNzaW5nIHlvdXIgcmVxdWVzdCcsXG4gICAgICAgICAgdmlzaWJsZTogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvKiBBcnRpc3QgVG9vbHMgcGFnZSBlbmQgKi9cbiAgfVxuXSk7XG5cbmFwcC5kaXJlY3RpdmUoJ2FmZml4ZXInLCBmdW5jdGlvbigkd2luZG93KSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgbGluazogZnVuY3Rpb24oJHNjb3BlLCAkZWxlbWVudCkge1xuICAgICAgdmFyIHdpbiA9IGFuZ3VsYXIuZWxlbWVudCgkd2luZG93KTtcbiAgICAgIHZhciB0b3BPZmZzZXQgPSAkZWxlbWVudFswXS5vZmZzZXRUb3A7XG5cbiAgICAgIGZ1bmN0aW9uIGFmZml4RWxlbWVudCgpIHtcblxuICAgICAgICBpZiAoJHdpbmRvdy5wYWdlWU9mZnNldCA+IHRvcE9mZnNldCkge1xuICAgICAgICAgICRlbGVtZW50LmNzcygncG9zaXRpb24nLCAnZml4ZWQnKTtcbiAgICAgICAgICAkZWxlbWVudC5jc3MoJ3RvcCcsICczLjUlJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJGVsZW1lbnQuY3NzKCdwb3NpdGlvbicsICcnKTtcbiAgICAgICAgICAkZWxlbWVudC5jc3MoJ3RvcCcsICcnKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAkc2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICB3aW4udW5iaW5kKCdzY3JvbGwnLCBhZmZpeEVsZW1lbnQpO1xuICAgICAgfSk7XG4gICAgICB3aW4uYmluZCgnc2Nyb2xsJywgYWZmaXhFbGVtZW50KTtcbiAgICB9XG4gIH07XG59KSIsIlxuXG5hcHAuc2VydmljZSgnQXJ0aXN0VG9vbHNTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKXtcblxuXHRmdW5jdGlvbiByZXNvbHZlRGF0YShkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvc291bmRjbG91ZC9yZXNvbHZlJywgZGF0YSk7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXREb3dubG9hZExpc3QoKSB7XG5cdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS9kYXRhYmFzZS9kb3dubG9hZHVybCcpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0RG93bmxvYWRHYXRld2F5KGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2RhdGFiYXNlL2Rvd25sb2FkdXJsLycgKyBkYXRhLmlkKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGRlbGV0ZURvd25sb2FkR2F0ZXdheShkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvZG93bmxvYWR1cmwvZGVsZXRlJywgZGF0YSk7XG5cdH1cblxuXHRmdW5jdGlvbiBzYXZlUHJvZmlsZUluZm8oZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL3Byb2ZpbGUvZWRpdCcsIGRhdGEpO1xuXHR9XG5cblx0ZnVuY3Rpb24gc2F2ZVNvdW5kQ2xvdWRBY2NvdW50SW5mbyhkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvcHJvZmlsZS9zb3VuZGNsb3VkJywgZGF0YSk7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRUcmFja0xpc3RGcm9tU291bmRjbG91ZChkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvdHJhY2tzL2xpc3QnLCBkYXRhKTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0cmVzb2x2ZURhdGE6IHJlc29sdmVEYXRhLFxuXHRcdGdldERvd25sb2FkTGlzdDogZ2V0RG93bmxvYWRMaXN0LFxuXHRcdGdldERvd25sb2FkR2F0ZXdheTogZ2V0RG93bmxvYWRHYXRld2F5LFxuXHRcdHNhdmVQcm9maWxlSW5mbzogc2F2ZVByb2ZpbGVJbmZvLFxuXHRcdGRlbGV0ZURvd25sb2FkR2F0ZXdheTogZGVsZXRlRG93bmxvYWRHYXRld2F5LFxuXHRcdHNhdmVTb3VuZENsb3VkQWNjb3VudEluZm86IHNhdmVTb3VuZENsb3VkQWNjb3VudEluZm8sXG5cdFx0Z2V0VHJhY2tMaXN0RnJvbVNvdW5kY2xvdWQ6IGdldFRyYWNrTGlzdEZyb21Tb3VuZGNsb3VkXG5cdH07XG59XSk7XG4iLCJcblxuYXBwLnNlcnZpY2UoJ0hvbWVTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKXtcblx0XG5cdGZ1bmN0aW9uIHNhdmVBcHBsaWNhdGlvbihkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvaG9tZS9hcHBsaWNhdGlvbicsIGRhdGEpO1xuXHR9XG5cblx0ZnVuY3Rpb24gc2F2ZUFydGlzdEVtYWlsKGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9ob21lL2FydGlzdGVtYWlsJywgZGF0YSk7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHNhdmVBcHBsaWNhdGlvbjogc2F2ZUFwcGxpY2F0aW9uLFxuXHRcdHNhdmVBcnRpc3RFbWFpbDogc2F2ZUFydGlzdEVtYWlsXG5cdH07XG59XSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdwcmVtaWVyZScsIHtcbiAgICB1cmw6ICcvcHJlbWllcmUnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvcHJlbWllcmUvdmlld3MvcHJlbWllcmUuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ1ByZW1pZXJDb250cm9sbGVyJ1xuICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignUHJlbWllckNvbnRyb2xsZXInLCBbJyRyb290U2NvcGUnLFxuICAnJHN0YXRlJyxcbiAgJyRzY29wZScsXG4gICckaHR0cCcsXG4gICckbG9jYXRpb24nLFxuICAnJHdpbmRvdycsXG4gICdQcmVtaWVyU2VydmljZScsXG4gIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uLCAkd2luZG93LCBQcmVtaWVyU2VydmljZSkge1xuXG4gICAgJHNjb3BlLmdlbnJlQXJyYXkgPSBbXG4gICAgICAnQWx0ZXJuYXRpdmUgUm9jaycsXG4gICAgICAnQW1iaWVudCcsXG4gICAgICAnQ3JlYXRpdmUnLFxuICAgICAgJ0NoaWxsJyxcbiAgICAgICdDbGFzc2ljYWwnLFxuICAgICAgJ0NvdW50cnknLFxuICAgICAgJ0RhbmNlICYgRURNJyxcbiAgICAgICdEYW5jZWhhbGwnLFxuICAgICAgJ0RlZXAgSG91c2UnLFxuICAgICAgJ0Rpc2NvJyxcbiAgICAgICdEcnVtICYgQmFzcycsXG4gICAgICAnRHVic3RlcCcsXG4gICAgICAnRWxlY3Ryb25pYycsXG4gICAgICAnRmVzdGl2YWwnLFxuICAgICAgJ0ZvbGsnLFxuICAgICAgJ0hpcC1Ib3AvUk5CJyxcbiAgICAgICdIb3VzZScsXG4gICAgICAnSW5kaWUvQWx0ZXJuYXRpdmUnLFxuICAgICAgJ0xhdGluJyxcbiAgICAgICdUcmFwJyxcbiAgICAgICdWb2NhbGlzdHMvU2luZ2VyLVNvbmd3cml0ZXInXG4gICAgXTtcblxuICAgICRzY29wZS5wcmVtaWVyT2JqID0ge307XG4gICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICB2YWw6ICcnLFxuICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICB9O1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG5cbiAgICAkc2NvcGUuc2F2ZVByZW1pZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICRzY29wZS5tZXNzYWdlLnZpc2libGUgPSBmYWxzZTtcbiAgICAgIHZhciBkYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgICBmb3IgKHZhciBwcm9wIGluICRzY29wZS5wcmVtaWVyT2JqKSB7XG4gICAgICAgIGRhdGEuYXBwZW5kKHByb3AsICRzY29wZS5wcmVtaWVyT2JqW3Byb3BdKTtcbiAgICAgIH1cbiAgICAgIFByZW1pZXJTZXJ2aWNlXG4gICAgICAgIC5zYXZlUHJlbWllcihkYXRhKVxuICAgICAgICAudGhlbihyZWNlaXZlUmVzcG9uc2UpXG4gICAgICAgIC5jYXRjaChjYXRjaEVycm9yKTtcblxuICAgICAgZnVuY3Rpb24gcmVjZWl2ZVJlc3BvbnNlKHJlcykge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICBpZiAocmVzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgJHNjb3BlLm1lc3NhZ2UudmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgJHNjb3BlLm1lc3NhZ2UudmFsID0gJ1RoYW5rIHlvdSEgWW91ciBtZXNzYWdlIGhhcyBiZWVuIHNlbnQgc3VjY2Vzc2Z1bGx5Lic7XG4gICAgICAgICAgJHNjb3BlLnByZW1pZXJPYmogPSB7fTtcbiAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoXCJpbnB1dFt0eXBlPSdmaWxlJ11cIikudmFsKG51bGwpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAkc2NvcGUubWVzc2FnZS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgJHNjb3BlLm1lc3NhZ2UudmFsID0gJ0Vycm9yIGluIHByb2Nlc3NpbmcgdGhlIHJlcXVlc3QuIFBsZWFzZSB0cnkgYWdhaW4uJztcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY2F0Y2hFcnJvcihyZXMpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgaWYgKHJlcy5zdGF0dXMgPT09IDQwMCkge1xuICAgICAgICAgICRzY29wZS5tZXNzYWdlID0ge1xuICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgICAgIHZhbDogcmVzLmRhdGFcbiAgICAgICAgICB9O1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgICAgICB2aXNpYmxlOiB0cnVlLFxuICAgICAgICAgIHZhbDogJ0Vycm9yIGluIHByb2Nlc3NpbmcgdGhlIHJlcXVlc3QuIFBsZWFzZSB0cnkgYWdhaW4uJ1xuICAgICAgICB9O1xuICAgICAgfVxuICAgIH07XG4gIH1cbl0pOyIsImFwcC5zZXJ2aWNlKCdQcmVtaWVyU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbigkaHR0cCkge1xuXG5cdGZ1bmN0aW9uIHNhdmVQcmVtaWVyKGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAoe1xuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHR1cmw6ICcvYXBpL3ByZW1pZXInLFxuXHRcdFx0aGVhZGVyczoge1xuXHRcdFx0XHQnQ29udGVudC1UeXBlJzogdW5kZWZpbmVkXG5cdFx0XHR9LFxuXHRcdFx0dHJhbnNmb3JtUmVxdWVzdDogYW5ndWxhci5pZGVudGl0eSxcblx0XHRcdGRhdGE6IGRhdGFcblx0XHR9KTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0c2F2ZVByZW1pZXI6IHNhdmVQcmVtaWVyXG5cdH07XG59XSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnc3VibWlzc2lvbnMnLCB7XG4gICAgdXJsOiAnL3N1Ym1pc3Npb25zJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL3N1Ym1pc3Npb25zL3ZpZXdzL3N1Ym1pc3Npb25zLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdTdWJtaXNzaW9uQ29udHJvbGxlcidcbiAgfSk7XG59KTtcblxuXG5hcHAuY29udHJvbGxlcignU3VibWlzc2lvbkNvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsIEF1dGhTZXJ2aWNlLCBvRW1iZWRGYWN0b3J5KSB7XG4gICRzY29wZS5jb3VudGVyID0gMDtcbiAgJHNjb3BlLnNob3dpbmdFbGVtZW50cyA9IFtdO1xuICAkc2NvcGUuc3VibWlzc2lvbnMgPSBbXTtcbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICRodHRwLmdldCgnL2FwaS9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2FkbWluJztcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICBhbGVydCgnV3JvbmcgUGFzc3dvcmQnKTtcbiAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5sb2FkU3VibWlzc2lvbnMgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAuZ2V0KCcvYXBpL3N1Ym1pc3Npb25zL3VuYWNjZXB0ZWQnKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS5zdWJtaXNzaW9ucyA9IHJlcy5kYXRhO1xuICAgICAgICBjb25zb2xlLmxvZyhyZXMuZGF0YSk7XG4gICAgICAgICRzY29wZS5sb2FkTW9yZSgpO1xuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2NoYW5uZWxzJyk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS5jaGFubmVscyA9IHJlcy5kYXRhO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICBhbGVydCgnRXJyb3I6IENvdWxkIG5vdCBnZXQgY2hhbm5lbHMuJylcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmxvYWRNb3JlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxvYWRFbGVtZW50cyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAkc2NvcGUuY291bnRlcjsgaSA8ICRzY29wZS5jb3VudGVyICsgMTU7IGkrKykge1xuICAgICAgdmFyIHN1YiA9ICRzY29wZS5zdWJtaXNzaW9uc1tpXTtcbiAgICAgIGlmIChzdWIpIHtcbiAgICAgICAgJHNjb3BlLnNob3dpbmdFbGVtZW50cy5wdXNoKHN1Yik7XG4gICAgICAgIGxvYWRFbGVtZW50cy5wdXNoKHN1Yik7XG4gICAgICB9XG4gICAgfVxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBjb25zb2xlLmxvZyhsb2FkRWxlbWVudHMpO1xuICAgICAgbG9hZEVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oc3ViKSB7XG4gICAgICAgIG9FbWJlZEZhY3RvcnkuZW1iZWRTb25nKHN1Yik7XG4gICAgICB9LCA1MClcbiAgICB9KTtcbiAgICAkc2NvcGUuY291bnRlciArPSAxNTtcbiAgfVxuXG4gICRzY29wZS5jaGFuZ2VCb3ggPSBmdW5jdGlvbihzdWIsIGNoYW4pIHtcbiAgICB2YXIgaW5kZXggPSBzdWIuY2hhbm5lbElEUy5pbmRleE9mKGNoYW4uY2hhbm5lbElEKTtcbiAgICBpZiAoaW5kZXggPT0gLTEpIHtcbiAgICAgIHN1Yi5jaGFubmVsSURTLnB1c2goY2hhbi5jaGFubmVsSUQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdWIuY2hhbm5lbElEUy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgfVxuXG4gICRzY29wZS5zYXZlID0gZnVuY3Rpb24oc3VibWkpIHtcbiAgICBpZiAoc3VibWkuY2hhbm5lbElEUy5sZW5ndGggPT0gMCkge1xuICAgICAgJHNjb3BlLmRlY2xpbmUoc3VibWkpO1xuICAgIH0gZWxzZSB7XG4gICAgICBzdWJtaS5wYXNzd29yZCA9ICRyb290U2NvcGUucGFzc3dvcmQ7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAkaHR0cC5wdXQoXCIvYXBpL3N1Ym1pc3Npb25zL3NhdmVcIiwgc3VibWkpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHN1Yikge1xuICAgICAgICAgICRzY29wZS5zaG93aW5nRWxlbWVudHMuc3BsaWNlKCRzY29wZS5zaG93aW5nRWxlbWVudHMuaW5kZXhPZihzdWJtaSksIDEpO1xuICAgICAgICAgIHdpbmRvdy5hbGVydChcIlNhdmVkXCIpO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgd2luZG93LmFsZXJ0KFwiRVJST1I6IGRpZCBub3QgU2F2ZVwiKVxuICAgICAgICB9KVxuICAgIH1cbiAgfVxuXG4gICRzY29wZS5pZ25vcmUgPSBmdW5jdGlvbihzdWJtaXNzaW9uKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLmRlbGV0ZSgnL2FwaS9zdWJtaXNzaW9ucy9pZ25vcmUvJyArIHN1Ym1pc3Npb24uX2lkICsgJy8nICsgJHJvb3RTY29wZS5wYXNzd29yZClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICB2YXIgaW5kZXggPSAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLmluZGV4T2Yoc3VibWlzc2lvbik7XG4gICAgICAgICRzY29wZS5zaG93aW5nRWxlbWVudHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgd2luZG93LmFsZXJ0KFwiSWdub3JlZFwiKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgd2luZG93LmFsZXJ0KFwiRVJST1I6IGRpZCBub3QgSWdub3JlXCIpO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUuZGVjbGluZSA9IGZ1bmN0aW9uKHN1Ym1pc3Npb24pIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAuZGVsZXRlKCcvYXBpL3N1Ym1pc3Npb25zL2RlY2xpbmUvJyArIHN1Ym1pc3Npb24uX2lkICsgJy8nICsgJHJvb3RTY29wZS5wYXNzd29yZClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICB2YXIgaW5kZXggPSAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLmluZGV4T2Yoc3VibWlzc2lvbik7XG4gICAgICAgICRzY29wZS5zaG93aW5nRWxlbWVudHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgd2luZG93LmFsZXJ0KFwiRGVjbGluZWRcIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2VcbiAgICAgIH0pXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgd2luZG93LmFsZXJ0KFwiRVJST1I6IGRpZCBub3QgRGVjbGluZVwiKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLnlvdXR1YmUgPSBmdW5jdGlvbihzdWJtaXNzaW9uKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLnBvc3QoJy9hcGkvc3VibWlzc2lvbnMveW91dHViZUlucXVpcnknLCBzdWJtaXNzaW9uKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIHdpbmRvdy5hbGVydCgnU2VudCB0byBaYWNoJyk7XG4gICAgICB9KVxuICB9XG5cbiAgJHNjb3BlLnNlbmRNb3JlID0gZnVuY3Rpb24oc3VibWlzc2lvbikge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL3N1Ym1pc3Npb25zL3NlbmRNb3JlSW5xdWlyeScsIHN1Ym1pc3Npb24pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgd2luZG93LmFsZXJ0KCdTZW50IEVtYWlsJyk7XG4gICAgICB9KVxuICB9XG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0=
