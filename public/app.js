'use strict';
window.app = angular.module('FullstackGeneratedApp', ['fsaPreBuilt', 'ui.router', 'ui.bootstrap', 'ngAnimate', 'ngCookies', 'yaru22.angular-timeago', 'satellizer', 'angularMoment', 'luegg.directives', 'ui-rangeSlider', 'ngSanitize', 'colorpicker.module', 'ngclipboard', 'ui.sortable']);

app.config(function($urlRouterProvider, $locationProvider, $uiViewScrollProvider, $httpProvider) {
  // This turns off hashbang urls (/#about) and changes it to something normal (/about)
  $locationProvider.html5Mode(true);
  // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
  $urlRouterProvider.otherwise('/');
  // $uiViewScrollProvider.useAnchorScroll();

  //intercept all incoming and outgoing requests
  $httpProvider.interceptors.push(function() {
    return {
      'request': function(config) {
        return config;
      },
      'response': function(response) {
        // if (typeof response.data != 'string')
        //     console.log(response.data);
        return response;
      }
    };
  });
});
app.config(function($authProvider) {
  $authProvider.facebook({
    clientId: 'Facebook App ID'
  });

  // Optional: For client-side use (Implicit Grant), set responseType to 'token'
  $authProvider.facebook({
    clientId: 'Facebook App ID',
    responseType: 'token'
  });

  $authProvider.google({
    optionalUrlParams: ['access_type'],
    accessType: 'offline',
    url: '/api/login/google/',
    clientId: '923811958466-kthtaatodor5mqq0pf5ub6km9msii82g.apps.googleusercontent.com',
    scope: ['https://www.googleapis.com/auth/youtubepartner-channel-audit', 'https://www.googleapis.com/auth/youtube'],
    redirectUri: window.location.origin + '/analytics'
  });
  // redirectUri: window.location.origin+'/analytics'
  //    responseType: 'token'
  $authProvider.github({
    clientId: 'GitHub Client ID'
  });

  $authProvider.linkedin({
    clientId: 'LinkedIn Client ID'
  });

  $authProvider.instagram({
    clientId: 'ae84968993fc4adf9b2cd246b763bf6b',
    responseType: 'token'
  });

  $authProvider.yahoo({
    clientId: 'Yahoo Client ID / Consumer Key'
  });

  $authProvider.live({
    clientId: 'Microsoft Client ID'
  });

  $authProvider.twitch({
    clientId: '727419002511745024'
  });

  $authProvider.bitbucket({
    clientId: 'Bitbucket Client ID'
  });


  // No additional setup required for Twitter
  $authProvider.oauth2({
    name: 'foursquare',
    url: '/auth/foursquare',
    clientId: 'Foursquare Client ID',
    redirectUri: window.location.origin,
    authorizationEndpoint: 'https://foursquare.com/oauth2/authenticate',
  });
});
// This app.run is for controlling access to specific states.
app.run(function($rootScope, $window, $http, AuthService, $state, $uiViewScroll, SessionService, AppConfig) {

  // The given state requires an authenticated user.
  // var destinationStateRequiresAuth = function (state) {
  //     return state.data && state.data.authenticate;
  // };

  AppConfig.fetchConfig().then(function(res) {
    // console.log(res);
    AppConfig.setConfig(res.data);
    // console.log(AppConfig.isConfigParamsvailable);
  })

  // $stateChangeStart is an event fired
  // whenever the process of changing a state begins.
  $rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
    if (toState.name == 'reForReInteraction') {
      $rootScope.state = false;
    } else {
      $rootScope.state = true;
    }

    if ($window.location.pathname.indexOf('artistTools') != -1 || $window.location.pathname.indexOf('admin') != -1) {
      var user = SessionService.getUser();
      if (user) {
        var isAdminAuthenticate = ($window.localStorage.getItem('isAdminAuthenticate') ? $window.localStorage.getItem('isAdminAuthenticate') : false);
        var redirectPath = (isAdminAuthenticate ? "/admin" : "/login");
        //console.log(redirectPath + " rascal redirectPath");
        //console.log($window.location.pathname + " $window.location.pathname");
        //console.log(isAdminAuthenticate + " rasca  isAdminAuthenticate");
        if ($window.location.pathname.indexOf('admin') != -1 && !isAdminAuthenticate) {
          //console.log(user + "app.js user");
          $http.post('/api/logout').then(function() {
            SessionService.deleteUser();
            $state.go('admin');
            //window.location.href = '/admin';
          });
        } else if ($window.location.pathname.indexOf('artistTools') != -1 && isAdminAuthenticate) {
          $http.get('/api/users/isUserAuthenticate').then(function(res) {
            if (!res.data) {
              SessionService.deleteUser();
              $window.location.href = redirectPath;
            }
          });
        }
      }
    };

    var user = SessionService.getUser();
    if (!user) {
      if ($window.location.pathname.indexOf('admin/') != -1) {
        $http.post('/api/logout').then(function() {
          SessionService.deleteUser();
          $window.location.href = '/admin';
        });
      } else if ($window.location.pathname.indexOf('artistTools/') != -1) {
        $http.get('/api/users/isUserAuthenticate').then(function(res) {
          if (!res.data) {
            SessionService.deleteUser();
            $window.location.href = '/login';
          }
        });
      }
    }
  });
  SessionService.refreshUser();

  $rootScope.reloadFB = function() {
    setTimeout(function() {
      FB.init({
        appId: "1771378846475599",
        xfbml: true,
        version: "v2.6"
      });
      (function(d, s, id) {
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {
          return;
        }
        js = d.createElement(s);
        js.id = id;
        js.src = "//connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    }, 500);
  }
});

app.directive('fbLike', [
  '$window', '$rootScope',
  function($window, $rootScope) {
    return {
      restrict: 'A',
      scope: {
        fbLike: '=?'
      },
      link: function(scope, element, attrs) {
        if (!$window.FB) {
          // Load Facebook SDK if not already loaded
          $.getScript('//connect.facebook.net/en_US/sdk.js', function() {
            $window.FB.init({
              appId: $rootScope.facebookAppId,
              xfbml: true,
              version: 'v2.0'
            });
            renderLikeButton();
          });
        } else {
          renderLikeButton();
        }

        var watchAdded = false;

        function renderLikeButton() {
          if (!!attrs.fbLike && !scope.fbLike && !watchAdded) {
            // wait for data if it hasn't loaded yet
            watchAdded = true;
            var unbindWatch = scope.$watch('fbLike', function(newValue, oldValue) {
              if (newValue) {
                renderLikeButton();
                // only need to run once
                unbindWatch();
              }
            });
            return;
          } else {
            element.html('<div class="fb-like"' + (!!scope.fbLike ? ' data-href="' + scope.fbLike + '"' : '') + ' data-layout="button_count" data-action="like" data-show-faces="true" data-share="true"></div>');
            $window.FB.XFBML.parse(element.parent()[0]);
          }
        }
      }
    };
  }
])

app.controller('FullstackGeneratedController', function($stateParams, $window, $rootScope, $scope, $state, $http, mainService, SessionService, AuthService) {
  /*Load More*/
  $scope.user = SessionService.getUser();
  $rootScope.enableNavigation = false;
  $scope.embedded = window.location.search.includes("embed");
  $scope.isBlock = function() {
    $scope.todayDate = new Date();
    $scope.blockRelease = new Date($scope.user.blockRelease);
    $scope.isBlock = $scope.todayDate < $scope.blockRelease ? true : false;
    return $scope.isBlock;
  }

  $scope.loadList = function() {
    $scope.$broadcast('loadTrades');
  }

  $scope.submissionsCount = 0;
  $scope.premiereCount = 0;
  $scope.inboxTrades = 0;
  $scope.shownotification = false;
  $scope.logout = function() {
    mainService.logout();
  }
  $scope.adminlogout = function() {
    mainService.adminlogout();
  }

  $scope.getSubmissionCount = function() {
    $http.get('/api/submissions/counts').then(function(res) {
      $scope.submissionsCount = res.data.regularCount + res.data.marketCount;
      console.log($scope.submissionsCount);
    });
    $http.get('/api/premier/count').then(function(res) {
      $scope.premiereCount = res.data.count;
      console.log($scope.premiereCount);
    })
  }
  if (window.location.href.includes('/admin') && $scope.user) $scope.getSubmissionCount();

  $scope.getIncompleteTradesCount = function() {
    if (!!$scope.user) {
      $scope.inboxTrades = 0;
      $http.get('/api/trades/withUser/' + $scope.user._id).then(function(res) {
        var trades = res.data;
        trades = trades.filter(function(trade) {
          return (!!trade.p1.user && !!trade.p2.user)
        })
        if ($scope.user.role == 'admin') {
          var paidRepostIds = [];
          if ($scope.user.paidRepost.length > 0) {
            $scope.user.paidRepost.forEach(function(acc) {
              paidRepostIds.push(acc.userID);
            })
          }
          trades.forEach(function(trade) {
            trade.other = paidRepostIds.includes(trade.p1.user._id) ? trade.p2 : trade.p1;
            if (trade.other.accepted) $scope.inboxTrades++;
          });
        } else {
          trades.forEach(function(trade) {
            trade.other = (trade.p1.user._id == $scope.user._id) ? trade.p2 : trade.p1;
            if (trade.other.accepted) $scope.inboxTrades++;
          });
        }
      }).then(null, console.log)
    }
  }
  $scope.getIncompleteTradesCount();

  $scope.gotoSettings = function() {
    $scope.user = SessionService.getUser();
    SessionService.addActionsfoAccount('Admin', $scope.user._id)
    $state.go("basicstep1");
  }

  $scope.getBehalfUserRecord = function(paid) {
    paid = JSON.parse(paid);
    SessionService.removePaidRepostAccounts();
    setTimeout(function() {
      SessionService.addActionsfoAccount('BehalfUser', paid._id, paid.soundcloud.id);
      SessionService.setUserPaidRepostAccounts(paid);
      if ($state.current.url.indexOf("admin/trade") != -1)
        window.location.href = '/admin/reposttraders';
      else
        window.location.reload($state.current.url);
    }, 500);
  }

  $scope.gotoBehalfSetting = function(actions) {
    if (actions == "SCHEDULER") {
      window.location.href = '/admin/scheduler';
    }
    if (actions == "REPOSTTRADES") {
      window.location.href = '/admin/trade';
    }
    if (actions == "DOWNLOADGATEWAY") {
      window.location.href = '/admin/downloadGateway';
    }
  }

  $scope.openHelpModal = function() {
      $.Zebra_Dialog("Do you have a question? Email us and we'll get back to you promptly.", {
        'type': 'question',
        'buttons': [{
          caption: 'Cancel',
          callback: function() {}
        }, {
          caption: 'Email Tech Support',
          callback: function() {
            window.location.href = "mailto:coayscue@artistsunlimited.com?subject=Support";
          }
        }]
      });
    }
    /*$scope.checkNotification = function() {
        var user = SessionService.getUser();
        if (user) {
            return $http.get('/api/trades/withUser/' + user._id)
                .then(function(res) {
                    var trades = res.data;
                    trades.forEach(function(trade) {
                        if (trade.p1.user._id == user._id) {
                            if (trade.p1.alert == "change") {
                                $scope.shownotification = true;
                            }
                        }
                        if (trade.p2.user._id == user._id) {
                            if (trade.p2.alert == "change") {
                                $scope.shownotification = true;
                            }
                        }
                    });
                })
        }
    }*/

  $scope.setCurUser = function() {
    $scope.curATUser = JSON.stringify(SessionService.getUser());
  }


  $scope.rootSoundcloudLogin = function() {
    $scope.processing = true;
    SC.connect()
      .then(function(res) {
        $rootScope.accessToken = res.oauth_token;
        return $http.post('/api/login/soundCloudLogin', {
          token: res.oauth_token,
          password: 'test'
        });
      })
      .then(function(res) {
        $scope.processing = false;
        var userData = res.data.user;
        userData.isAdmin = false;
        SessionService.create(userData);
        $scope.user = SessionService.getUser();
        if (window.location.href.includes('/admin')) window.location.href = '/admin/scheduler'
        else window.location.reload();
      })
      .then(null, function(err) {
        console.log(err);
        $scope.processing = false;
        $scope.soundcloudLogin();
      });
  };


  $rootScope.changeUserAdmin = $scope.changeUserAdmin = function(param, location, state) {
    if (!param) return;
    $scope.processing = true;
    if (typeof param == 'string' && param.length > 15) param = JSON.parse(param);
    if (param == 'user') {
      var prevATUser = JSON.parse($window.localStorage.getItem('prevATUser'));
      if (SessionService.getUser()._id != prevATUser._id) {
        $scope.processing = true;
        return $http.post('/api/login/soundCloudLogin', {
            token: prevATUser.soundcloud.token,
            password: 'test'
          })
          .then(function(res) {
            $scope.processing = false;
            SessionService.create(res.data.user);
            $scope.curATUser = SessionService.getUser()
              // if (state) $state.go(state);
            if (location) window.location.href = location;
            else window.location.reload();
          })
          .then(null, function(err) {
            $scope.processing = false;
            $scope.rootSoundcloudLogin();
          });
      } else {
        $scope.processing = false;
        //if (state) $state.go(state);
        if (location) window.location.href = location;
        else window.location.reload();
      }
    } else if (param == 'admin') {
      var adminUser = JSON.parse($window.localStorage.getItem('adminUser'));
      if (SessionService.getUser()._id != adminUser._id) {
        $window.localStorage.setItem('prevATUser', JSON.stringify(SessionService.getUser()))
        $scope.processing = true;
        return AuthService
          .login(adminUser.loginInfo)
          .then(handleLoginResponse)
          .catch(console.log);

        function handleLoginResponse(res) {
          if (res.status === 200 && res.data.success) {
            var userData = res.data.user;
            userData.isAdmin = true;
            SessionService.create(userData);
            $scope.processing = false;
            $scope.curATUser = SessionService.getUser()
              // if (state) $state.go(state);
            if (location) window.location.href = location;
            else window.location.reload();
          } else console.log("Invalid Email or Password.");
        }
      } else {
        $scope.processing = false;
        // if (state) $state.go(state);
        if (location) window.location.href = location;
        else window.location.reload();
      }
    } else {
      $scope.processing = true;
      return $http.post('/api/login/soundCloudLogin', {
          token: param.soundcloud.token,
          password: 'test'
        })
        .then(function(res) {
          $scope.processing = false;
          SessionService.create(res.data.user);
          $window.localStorage.setItem('prevATUser', JSON.stringify(SessionService.getUser()))
          $scope.curATUser = SessionService.getUser()
          window.location.reload()
        })
        .then(null, function(err) {
          $scope.processing = false;
          $scope.rootSoundcloudLogin();
        });
    }
  }

  $scope.linkedUsersChange = function(authToken) {
    if (authToken) {
      $scope.processing = true;
      $http.post('/api/login/soundCloudLogin', {
          token: authToken,
          password: 'test'
        })
        .then(function(res) {
          $scope.processing = false;
          if (res.data.user) {
            SessionService.create(res.data.user);
            window.location.reload();
          }
        })
        .then(null, function(err) {
          $scope.processing = false;
          $scope.rootSoundcloudLogin();
        });
    }
  }

  $scope.swithUser = function(isadmin) {
    if (isadmin) {
      mainService.logout();
    } else {
      mainService.adminlogout();
    }
  }

  $rootScope.getUserNetwork = $scope.getUserNetwork = function() {
    if ($window.location.pathname.includes('admin/')) {
      console.log($window.location.pathname + " $window.location.pathname");
      var adminUser = JSON.parse($window.localStorage.getItem('adminUser'));
      return $http.get("/api/database/adminUserNetwork/" + adminUser._id)
        .then(function(res) {
          var troubleUser = res.data.find(function(user) {
            return user.error;
          })
          if (troubleUser) {
            $.Zebra_Dialog("Please log back in with <span style='font-weight:bold'>" + troubleUser.soundcloud.username + "</span> to be able to continue to manage <span style='font-weight:bold'>" + troubleUser.soundcloud.username + "</span>. Otherwise, please remove it from your \"accounts\".", {
              'type': 'question',
              'buttons': [{
                caption: 'Cancel',
                callback: function() {}
              }, {
                caption: 'Log In',
                callback: function() {
                  $scope.rootSoundcloudLogin();
                }
              }]
            })
          }
          $rootScope.userlinkedAccounts = res.data;
        })
    } else {
      return $http.get("/api/database/userNetworks")
        .then(function(res) {
          var troubleUser = res.data.find(function(user) {
            return user.error;
          })
          console.log(res.data);
          if (troubleUser) {
            console.log(troubleUser)
            $.Zebra_Dialog("Please log back in with <span style='font-weight:bold'>" + troubleUser.soundcloud.username + "</span> to be able to continue to manage <span style='font-weight:bold'>" + troubleUser.soundcloud.username + "</span>. Otherwise, please remove it from your \"Linked Accounts\".", {
              'type': 'question',
              'buttons': [{
                caption: 'Cancel',
                callback: function() {}
              }, {
                caption: 'Log In',
                callback: function() {
                  $scope.rootSoundcloudLogin();
                }
              }]
            })
          }
          $rootScope.userlinkedAccounts = res.data;
        })
    }
  }
  if ($scope.user && $scope.user.role == "admin") $rootScope.getUserNetwork();
  //    $scope.checkNotification();
});

app.directive('fbLike', [
  '$window', '$rootScope',
  function($window, $rootScope) {
    return {
      restrict: 'A',
      scope: {
        fbLike: '=?'
      },
      link: function(scope, element, attrs) {
        if (!$window.FB) {
          // Load Facebook SDK if not already loaded
          $.getScript('//connect.facebook.net/en_US/sdk.js', function() {
            $window.FB.init({
              appId: $rootScope.facebookAppId,
              xfbml: true,
              version: 'v2.0'
            });
            renderLikeButton();
          });
        } else {
          renderLikeButton();
        }

        var watchAdded = false;

        function renderLikeButton() {
          if (!!attrs.fbLike && !scope.fbLike && !watchAdded) {
            // wait for data if it hasn't loaded yet
            watchAdded = true;
            var unbindWatch = scope.$watch('fbLike', function(newValue, oldValue) {
              if (newValue) {
                renderLikeButton();
                // only need to run once
                unbindWatch();
              }
            });
            return;
          } else {
            element.html('<div class="fb-like"' + (!!scope.fbLike ? ' data-href="' + scope.fbLike + '"' : '') + ' data-layout="button_count" data-action="like" data-show-faces="true" data-share="true"></div>');
            $window.FB.XFBML.parse(element.parent()[0]);
          }
        }
      }
    };
  }
])

app.directive('fileread', [function() {
  return {
    scope: {
      fileread: '=',
      message: '='
    },
    link: function(scope, element, attributes) {
      element.bind('change', function(changeEvent) {
        scope.$apply(function() {
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
  }
}]);

app.service('mainService', function($http, SessionService) {
  this.logout = function() {
    $http.post('/api/logout').then(function() {
      SessionService.deleteUser();
      window.location.href = '/login';
    });
  }
  this.adminlogout = function() {
    $http.post('/api/logout').then(function() {
      SessionService.deleteUser();
      window.localStorage.removeItem('isAdminAuthenticate');
      window.location.href = '/admin';
    });
  }
});

/*Load more*/
app.directive('whenScrolled', function() {
  return function(scope, elm, attr) {
    var raw = elm[0];
    elm.bind('scroll', function() {
      if (raw.scrollTop + raw.offsetHeight >= raw.scrollHeight) {
        scope.$apply(attr.whenScrolled);
      }
    });
  };
});

function getQueryString(field, url) {
  var href = url ? url : window.location.href;
  var reg = new RegExp('[?&]' + field + '=([^&#]*)', 'i');
  var string = reg.exec(href);
  return string ? string[1] : null;
};

function queryStringify(obj) {
  return '?' + Object.keys(obj).reduce(function(a, k) {
    a.push(k + '=' + encodeURIComponent(obj[k]));
    return a
  }, []).join('&')
}

var daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function createPseudoAvailableSlots(user) {
  var pseudoSlots = {};
  var tzOffset = (-(new Date()).getTimezoneOffset() - user.astzOffset) / 60;
  daysOfWeek.forEach(function(day) {
    if (user.availableSlots[day]) {
      var daySlots = [];
      user.availableSlots[day].forEach(function(hour) {
        daySlots.push((hour + tzOffset + 24) % 24);
      })
      daySlots.sort(function(a, b) {
        if (a < b) return -1;
        else return 1;
      })
      pseudoSlots[day] = daySlots;
    }
  })
  return pseudoSlots;
}

function createAvailableSlots(user, pseudoSlots) {
  var availableSlots = {};
  var tzOffset = (-(new Date()).getTimezoneOffset() - user.astzOffset) / 60;
  daysOfWeek.forEach(function(day) {
    if (pseudoSlots[day]) {
      var daySlots = [];
      pseudoSlots[day].forEach(function(hour) {
        daySlots.push((hour - tzOffset + 24) % 24);
      })
      daySlots.sort(function(a, b) {
        if (a < b) return -1;
        else return 1;
      })
      availableSlots[day] = daySlots;
    }
  })
  return availableSlots;
}

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcHAuanMiXSwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBzdHJpY3QnO1xyXG53aW5kb3cuYXBwID0gYW5ndWxhci5tb2R1bGUoJ0Z1bGxzdGFja0dlbmVyYXRlZEFwcCcsIFsnZnNhUHJlQnVpbHQnLCAndWkucm91dGVyJywgJ3VpLmJvb3RzdHJhcCcsICduZ0FuaW1hdGUnLCAnbmdDb29raWVzJywgJ3lhcnUyMi5hbmd1bGFyLXRpbWVhZ28nLCAnc2F0ZWxsaXplcicsICdhbmd1bGFyTW9tZW50JywgJ2x1ZWdnLmRpcmVjdGl2ZXMnLCAndWktcmFuZ2VTbGlkZXInLCAnbmdTYW5pdGl6ZScsICdjb2xvcnBpY2tlci5tb2R1bGUnLCAnbmdjbGlwYm9hcmQnLCAndWkuc29ydGFibGUnXSk7XHJcblxyXG5hcHAuY29uZmlnKGZ1bmN0aW9uKCR1cmxSb3V0ZXJQcm92aWRlciwgJGxvY2F0aW9uUHJvdmlkZXIsICR1aVZpZXdTY3JvbGxQcm92aWRlciwgJGh0dHBQcm92aWRlcikge1xyXG4gIC8vIFRoaXMgdHVybnMgb2ZmIGhhc2hiYW5nIHVybHMgKC8jYWJvdXQpIGFuZCBjaGFuZ2VzIGl0IHRvIHNvbWV0aGluZyBub3JtYWwgKC9hYm91dClcclxuICAkbG9jYXRpb25Qcm92aWRlci5odG1sNU1vZGUodHJ1ZSk7XHJcbiAgLy8gSWYgd2UgZ28gdG8gYSBVUkwgdGhhdCB1aS1yb3V0ZXIgZG9lc24ndCBoYXZlIHJlZ2lzdGVyZWQsIGdvIHRvIHRoZSBcIi9cIiB1cmwuXHJcbiAgJHVybFJvdXRlclByb3ZpZGVyLm90aGVyd2lzZSgnLycpO1xyXG4gIC8vICR1aVZpZXdTY3JvbGxQcm92aWRlci51c2VBbmNob3JTY3JvbGwoKTtcclxuXHJcbiAgLy9pbnRlcmNlcHQgYWxsIGluY29taW5nIGFuZCBvdXRnb2luZyByZXF1ZXN0c1xyXG4gICRodHRwUHJvdmlkZXIuaW50ZXJjZXB0b3JzLnB1c2goZnVuY3Rpb24oKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAncmVxdWVzdCc6IGZ1bmN0aW9uKGNvbmZpZykge1xyXG4gICAgICAgIHJldHVybiBjb25maWc7XHJcbiAgICAgIH0sXHJcbiAgICAgICdyZXNwb25zZSc6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgLy8gaWYgKHR5cGVvZiByZXNwb25zZS5kYXRhICE9ICdzdHJpbmcnKVxyXG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhyZXNwb25zZS5kYXRhKTtcclxuICAgICAgICByZXR1cm4gcmVzcG9uc2U7XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfSk7XHJcbn0pO1xyXG5hcHAuY29uZmlnKGZ1bmN0aW9uKCRhdXRoUHJvdmlkZXIpIHtcclxuICAkYXV0aFByb3ZpZGVyLmZhY2Vib29rKHtcclxuICAgIGNsaWVudElkOiAnRmFjZWJvb2sgQXBwIElEJ1xyXG4gIH0pO1xyXG5cclxuICAvLyBPcHRpb25hbDogRm9yIGNsaWVudC1zaWRlIHVzZSAoSW1wbGljaXQgR3JhbnQpLCBzZXQgcmVzcG9uc2VUeXBlIHRvICd0b2tlbidcclxuICAkYXV0aFByb3ZpZGVyLmZhY2Vib29rKHtcclxuICAgIGNsaWVudElkOiAnRmFjZWJvb2sgQXBwIElEJyxcclxuICAgIHJlc3BvbnNlVHlwZTogJ3Rva2VuJ1xyXG4gIH0pO1xyXG5cclxuICAkYXV0aFByb3ZpZGVyLmdvb2dsZSh7XHJcbiAgICBvcHRpb25hbFVybFBhcmFtczogWydhY2Nlc3NfdHlwZSddLFxyXG4gICAgYWNjZXNzVHlwZTogJ29mZmxpbmUnLFxyXG4gICAgdXJsOiAnL2FwaS9sb2dpbi9nb29nbGUvJyxcclxuICAgIGNsaWVudElkOiAnOTIzODExOTU4NDY2LWt0aHRhYXRvZG9yNW1xcTBwZjV1YjZrbTltc2lpODJnLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tJyxcclxuICAgIHNjb3BlOiBbJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgveW91dHViZXBhcnRuZXItY2hhbm5lbC1hdWRpdCcsICdodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9hdXRoL3lvdXR1YmUnXSxcclxuICAgIHJlZGlyZWN0VXJpOiB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgJy9hbmFseXRpY3MnXHJcbiAgfSk7XHJcbiAgLy8gcmVkaXJlY3RVcmk6IHdpbmRvdy5sb2NhdGlvbi5vcmlnaW4rJy9hbmFseXRpY3MnXHJcbiAgLy8gICAgcmVzcG9uc2VUeXBlOiAndG9rZW4nXHJcbiAgJGF1dGhQcm92aWRlci5naXRodWIoe1xyXG4gICAgY2xpZW50SWQ6ICdHaXRIdWIgQ2xpZW50IElEJ1xyXG4gIH0pO1xyXG5cclxuICAkYXV0aFByb3ZpZGVyLmxpbmtlZGluKHtcclxuICAgIGNsaWVudElkOiAnTGlua2VkSW4gQ2xpZW50IElEJ1xyXG4gIH0pO1xyXG5cclxuICAkYXV0aFByb3ZpZGVyLmluc3RhZ3JhbSh7XHJcbiAgICBjbGllbnRJZDogJ2FlODQ5Njg5OTNmYzRhZGY5YjJjZDI0NmI3NjNiZjZiJyxcclxuICAgIHJlc3BvbnNlVHlwZTogJ3Rva2VuJ1xyXG4gIH0pO1xyXG5cclxuICAkYXV0aFByb3ZpZGVyLnlhaG9vKHtcclxuICAgIGNsaWVudElkOiAnWWFob28gQ2xpZW50IElEIC8gQ29uc3VtZXIgS2V5J1xyXG4gIH0pO1xyXG5cclxuICAkYXV0aFByb3ZpZGVyLmxpdmUoe1xyXG4gICAgY2xpZW50SWQ6ICdNaWNyb3NvZnQgQ2xpZW50IElEJ1xyXG4gIH0pO1xyXG5cclxuICAkYXV0aFByb3ZpZGVyLnR3aXRjaCh7XHJcbiAgICBjbGllbnRJZDogJzcyNzQxOTAwMjUxMTc0NTAyNCdcclxuICB9KTtcclxuXHJcbiAgJGF1dGhQcm92aWRlci5iaXRidWNrZXQoe1xyXG4gICAgY2xpZW50SWQ6ICdCaXRidWNrZXQgQ2xpZW50IElEJ1xyXG4gIH0pO1xyXG5cclxuXHJcbiAgLy8gTm8gYWRkaXRpb25hbCBzZXR1cCByZXF1aXJlZCBmb3IgVHdpdHRlclxyXG4gICRhdXRoUHJvdmlkZXIub2F1dGgyKHtcclxuICAgIG5hbWU6ICdmb3Vyc3F1YXJlJyxcclxuICAgIHVybDogJy9hdXRoL2ZvdXJzcXVhcmUnLFxyXG4gICAgY2xpZW50SWQ6ICdGb3Vyc3F1YXJlIENsaWVudCBJRCcsXHJcbiAgICByZWRpcmVjdFVyaTogd2luZG93LmxvY2F0aW9uLm9yaWdpbixcclxuICAgIGF1dGhvcml6YXRpb25FbmRwb2ludDogJ2h0dHBzOi8vZm91cnNxdWFyZS5jb20vb2F1dGgyL2F1dGhlbnRpY2F0ZScsXHJcbiAgfSk7XHJcbn0pO1xyXG4vLyBUaGlzIGFwcC5ydW4gaXMgZm9yIGNvbnRyb2xsaW5nIGFjY2VzcyB0byBzcGVjaWZpYyBzdGF0ZXMuXHJcbmFwcC5ydW4oZnVuY3Rpb24oJHJvb3RTY29wZSwgJHdpbmRvdywgJGh0dHAsIEF1dGhTZXJ2aWNlLCAkc3RhdGUsICR1aVZpZXdTY3JvbGwsIFNlc3Npb25TZXJ2aWNlLCBBcHBDb25maWcpIHtcclxuXHJcbiAgLy8gVGhlIGdpdmVuIHN0YXRlIHJlcXVpcmVzIGFuIGF1dGhlbnRpY2F0ZWQgdXNlci5cclxuICAvLyB2YXIgZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCA9IGZ1bmN0aW9uIChzdGF0ZSkge1xyXG4gIC8vICAgICByZXR1cm4gc3RhdGUuZGF0YSAmJiBzdGF0ZS5kYXRhLmF1dGhlbnRpY2F0ZTtcclxuICAvLyB9O1xyXG5cclxuICBBcHBDb25maWcuZmV0Y2hDb25maWcoKS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgLy8gY29uc29sZS5sb2cocmVzKTtcclxuICAgIEFwcENvbmZpZy5zZXRDb25maWcocmVzLmRhdGEpO1xyXG4gICAgLy8gY29uc29sZS5sb2coQXBwQ29uZmlnLmlzQ29uZmlnUGFyYW1zdmFpbGFibGUpO1xyXG4gIH0pXHJcblxyXG4gIC8vICRzdGF0ZUNoYW5nZVN0YXJ0IGlzIGFuIGV2ZW50IGZpcmVkXHJcbiAgLy8gd2hlbmV2ZXIgdGhlIHByb2Nlc3Mgb2YgY2hhbmdpbmcgYSBzdGF0ZSBiZWdpbnMuXHJcbiAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZVN0YXJ0JywgZnVuY3Rpb24oZXZlbnQsIHRvU3RhdGUsIHRvUGFyYW1zKSB7XHJcbiAgICBpZiAodG9TdGF0ZS5uYW1lID09ICdyZUZvclJlSW50ZXJhY3Rpb24nKSB7XHJcbiAgICAgICRyb290U2NvcGUuc3RhdGUgPSBmYWxzZTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICRyb290U2NvcGUuc3RhdGUgPSB0cnVlO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICgkd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmluZGV4T2YoJ2FydGlzdFRvb2xzJykgIT0gLTEgfHwgJHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5pbmRleE9mKCdhZG1pbicpICE9IC0xKSB7XHJcbiAgICAgIHZhciB1c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICAgICBpZiAodXNlcikge1xyXG4gICAgICAgIHZhciBpc0FkbWluQXV0aGVudGljYXRlID0gKCR3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2lzQWRtaW5BdXRoZW50aWNhdGUnKSA/ICR3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2lzQWRtaW5BdXRoZW50aWNhdGUnKSA6IGZhbHNlKTtcclxuICAgICAgICB2YXIgcmVkaXJlY3RQYXRoID0gKGlzQWRtaW5BdXRoZW50aWNhdGUgPyBcIi9hZG1pblwiIDogXCIvbG9naW5cIik7XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhyZWRpcmVjdFBhdGggKyBcIiByYXNjYWwgcmVkaXJlY3RQYXRoXCIpO1xyXG4gICAgICAgIC8vY29uc29sZS5sb2coJHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIFwiICR3aW5kb3cubG9jYXRpb24ucGF0aG5hbWVcIik7XHJcbiAgICAgICAgLy9jb25zb2xlLmxvZyhpc0FkbWluQXV0aGVudGljYXRlICsgXCIgcmFzY2EgIGlzQWRtaW5BdXRoZW50aWNhdGVcIik7XHJcbiAgICAgICAgaWYgKCR3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuaW5kZXhPZignYWRtaW4nKSAhPSAtMSAmJiAhaXNBZG1pbkF1dGhlbnRpY2F0ZSkge1xyXG4gICAgICAgICAgLy9jb25zb2xlLmxvZyh1c2VyICsgXCJhcHAuanMgdXNlclwiKTtcclxuICAgICAgICAgICRodHRwLnBvc3QoJy9hcGkvbG9nb3V0JykudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgU2Vzc2lvblNlcnZpY2UuZGVsZXRlVXNlcigpO1xyXG4gICAgICAgICAgICAkc3RhdGUuZ28oJ2FkbWluJyk7XHJcbiAgICAgICAgICAgIC8vd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2FkbWluJztcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoJHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5pbmRleE9mKCdhcnRpc3RUb29scycpICE9IC0xICYmIGlzQWRtaW5BdXRoZW50aWNhdGUpIHtcclxuICAgICAgICAgICRodHRwLmdldCgnL2FwaS91c2Vycy9pc1VzZXJBdXRoZW50aWNhdGUnKS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICBpZiAoIXJlcy5kYXRhKSB7XHJcbiAgICAgICAgICAgICAgU2Vzc2lvblNlcnZpY2UuZGVsZXRlVXNlcigpO1xyXG4gICAgICAgICAgICAgICR3aW5kb3cubG9jYXRpb24uaHJlZiA9IHJlZGlyZWN0UGF0aDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgIHZhciB1c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICAgaWYgKCF1c2VyKSB7XHJcbiAgICAgIGlmICgkd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmluZGV4T2YoJ2FkbWluLycpICE9IC0xKSB7XHJcbiAgICAgICAgJGh0dHAucG9zdCgnL2FwaS9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgU2Vzc2lvblNlcnZpY2UuZGVsZXRlVXNlcigpO1xyXG4gICAgICAgICAgJHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hZG1pbic7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSBpZiAoJHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5pbmRleE9mKCdhcnRpc3RUb29scy8nKSAhPSAtMSkge1xyXG4gICAgICAgICRodHRwLmdldCgnL2FwaS91c2Vycy9pc1VzZXJBdXRoZW50aWNhdGUnKS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgaWYgKCFyZXMuZGF0YSkge1xyXG4gICAgICAgICAgICBTZXNzaW9uU2VydmljZS5kZWxldGVVc2VyKCk7XHJcbiAgICAgICAgICAgICR3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvbG9naW4nO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgU2Vzc2lvblNlcnZpY2UucmVmcmVzaFVzZXIoKTtcclxuXHJcbiAgJHJvb3RTY29wZS5yZWxvYWRGQiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgRkIuaW5pdCh7XHJcbiAgICAgICAgYXBwSWQ6IFwiMTc3MTM3ODg0NjQ3NTU5OVwiLFxyXG4gICAgICAgIHhmYm1sOiB0cnVlLFxyXG4gICAgICAgIHZlcnNpb246IFwidjIuNlwiXHJcbiAgICAgIH0pO1xyXG4gICAgICAoZnVuY3Rpb24oZCwgcywgaWQpIHtcclxuICAgICAgICB2YXIganMsIGZqcyA9IGQuZ2V0RWxlbWVudHNCeVRhZ05hbWUocylbMF07XHJcbiAgICAgICAgaWYgKGQuZ2V0RWxlbWVudEJ5SWQoaWQpKSB7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGpzID0gZC5jcmVhdGVFbGVtZW50KHMpO1xyXG4gICAgICAgIGpzLmlkID0gaWQ7XHJcbiAgICAgICAganMuc3JjID0gXCIvL2Nvbm5lY3QuZmFjZWJvb2submV0L2VuX1VTL3Nkay5qc1wiO1xyXG4gICAgICAgIGZqcy5wYXJlbnROb2RlLmluc2VydEJlZm9yZShqcywgZmpzKTtcclxuICAgICAgfShkb2N1bWVudCwgJ3NjcmlwdCcsICdmYWNlYm9vay1qc3NkaycpKTtcclxuICAgIH0sIDUwMCk7XHJcbiAgfVxyXG59KTtcclxuXHJcbmFwcC5kaXJlY3RpdmUoJ2ZiTGlrZScsIFtcclxuICAnJHdpbmRvdycsICckcm9vdFNjb3BlJyxcclxuICBmdW5jdGlvbigkd2luZG93LCAkcm9vdFNjb3BlKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICBzY29wZToge1xyXG4gICAgICAgIGZiTGlrZTogJz0/J1xyXG4gICAgICB9LFxyXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgICBpZiAoISR3aW5kb3cuRkIpIHtcclxuICAgICAgICAgIC8vIExvYWQgRmFjZWJvb2sgU0RLIGlmIG5vdCBhbHJlYWR5IGxvYWRlZFxyXG4gICAgICAgICAgJC5nZXRTY3JpcHQoJy8vY29ubmVjdC5mYWNlYm9vay5uZXQvZW5fVVMvc2RrLmpzJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICR3aW5kb3cuRkIuaW5pdCh7XHJcbiAgICAgICAgICAgICAgYXBwSWQ6ICRyb290U2NvcGUuZmFjZWJvb2tBcHBJZCxcclxuICAgICAgICAgICAgICB4ZmJtbDogdHJ1ZSxcclxuICAgICAgICAgICAgICB2ZXJzaW9uOiAndjIuMCdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJlbmRlckxpa2VCdXR0b24oKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZW5kZXJMaWtlQnV0dG9uKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgd2F0Y2hBZGRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiByZW5kZXJMaWtlQnV0dG9uKCkge1xyXG4gICAgICAgICAgaWYgKCEhYXR0cnMuZmJMaWtlICYmICFzY29wZS5mYkxpa2UgJiYgIXdhdGNoQWRkZWQpIHtcclxuICAgICAgICAgICAgLy8gd2FpdCBmb3IgZGF0YSBpZiBpdCBoYXNuJ3QgbG9hZGVkIHlldFxyXG4gICAgICAgICAgICB3YXRjaEFkZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdmFyIHVuYmluZFdhdGNoID0gc2NvcGUuJHdhdGNoKCdmYkxpa2UnLCBmdW5jdGlvbihuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcclxuICAgICAgICAgICAgICBpZiAobmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHJlbmRlckxpa2VCdXR0b24oKTtcclxuICAgICAgICAgICAgICAgIC8vIG9ubHkgbmVlZCB0byBydW4gb25jZVxyXG4gICAgICAgICAgICAgICAgdW5iaW5kV2F0Y2goKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlbGVtZW50Lmh0bWwoJzxkaXYgY2xhc3M9XCJmYi1saWtlXCInICsgKCEhc2NvcGUuZmJMaWtlID8gJyBkYXRhLWhyZWY9XCInICsgc2NvcGUuZmJMaWtlICsgJ1wiJyA6ICcnKSArICcgZGF0YS1sYXlvdXQ9XCJidXR0b25fY291bnRcIiBkYXRhLWFjdGlvbj1cImxpa2VcIiBkYXRhLXNob3ctZmFjZXM9XCJ0cnVlXCIgZGF0YS1zaGFyZT1cInRydWVcIj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgJHdpbmRvdy5GQi5YRkJNTC5wYXJzZShlbGVtZW50LnBhcmVudCgpWzBdKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5dKVxyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ0Z1bGxzdGFja0dlbmVyYXRlZENvbnRyb2xsZXInLCBmdW5jdGlvbigkc3RhdGVQYXJhbXMsICR3aW5kb3csICRyb290U2NvcGUsICRzY29wZSwgJHN0YXRlLCAkaHR0cCwgbWFpblNlcnZpY2UsIFNlc3Npb25TZXJ2aWNlLCBBdXRoU2VydmljZSkge1xyXG4gIC8qTG9hZCBNb3JlKi9cclxuICAkc2NvcGUudXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcclxuICAkcm9vdFNjb3BlLmVuYWJsZU5hdmlnYXRpb24gPSBmYWxzZTtcclxuICAkc2NvcGUuZW1iZWRkZWQgPSB3aW5kb3cubG9jYXRpb24uc2VhcmNoLmluY2x1ZGVzKFwiZW1iZWRcIik7XHJcbiAgJHNjb3BlLmlzQmxvY2sgPSBmdW5jdGlvbigpIHtcclxuICAgICRzY29wZS50b2RheURhdGUgPSBuZXcgRGF0ZSgpO1xyXG4gICAgJHNjb3BlLmJsb2NrUmVsZWFzZSA9IG5ldyBEYXRlKCRzY29wZS51c2VyLmJsb2NrUmVsZWFzZSk7XHJcbiAgICAkc2NvcGUuaXNCbG9jayA9ICRzY29wZS50b2RheURhdGUgPCAkc2NvcGUuYmxvY2tSZWxlYXNlID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICAgcmV0dXJuICRzY29wZS5pc0Jsb2NrO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmxvYWRMaXN0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUuJGJyb2FkY2FzdCgnbG9hZFRyYWRlcycpO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLnN1Ym1pc3Npb25zQ291bnQgPSAwO1xyXG4gICRzY29wZS5wcmVtaWVyZUNvdW50ID0gMDtcclxuICAkc2NvcGUuaW5ib3hUcmFkZXMgPSAwO1xyXG4gICRzY29wZS5zaG93bm90aWZpY2F0aW9uID0gZmFsc2U7XHJcbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgbWFpblNlcnZpY2UubG9nb3V0KCk7XHJcbiAgfVxyXG4gICRzY29wZS5hZG1pbmxvZ291dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgbWFpblNlcnZpY2UuYWRtaW5sb2dvdXQoKTtcclxuICB9XHJcblxyXG4gICRzY29wZS5nZXRTdWJtaXNzaW9uQ291bnQgPSBmdW5jdGlvbigpIHtcclxuICAgICRodHRwLmdldCgnL2FwaS9zdWJtaXNzaW9ucy9jb3VudHMnKS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAkc2NvcGUuc3VibWlzc2lvbnNDb3VudCA9IHJlcy5kYXRhLnJlZ3VsYXJDb3VudCArIHJlcy5kYXRhLm1hcmtldENvdW50O1xyXG4gICAgICBjb25zb2xlLmxvZygkc2NvcGUuc3VibWlzc2lvbnNDb3VudCk7XHJcbiAgICB9KTtcclxuICAgICRodHRwLmdldCgnL2FwaS9wcmVtaWVyL2NvdW50JykudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgJHNjb3BlLnByZW1pZXJlQ291bnQgPSByZXMuZGF0YS5jb3VudDtcclxuICAgICAgY29uc29sZS5sb2coJHNjb3BlLnByZW1pZXJlQ291bnQpO1xyXG4gICAgfSlcclxuICB9XHJcbiAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluY2x1ZGVzKCcvYWRtaW4nKSAmJiAkc2NvcGUudXNlcikgJHNjb3BlLmdldFN1Ym1pc3Npb25Db3VudCgpO1xyXG5cclxuICAkc2NvcGUuZ2V0SW5jb21wbGV0ZVRyYWRlc0NvdW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoISEkc2NvcGUudXNlcikge1xyXG4gICAgICAkc2NvcGUuaW5ib3hUcmFkZXMgPSAwO1xyXG4gICAgICAkaHR0cC5nZXQoJy9hcGkvdHJhZGVzL3dpdGhVc2VyLycgKyAkc2NvcGUudXNlci5faWQpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgdmFyIHRyYWRlcyA9IHJlcy5kYXRhO1xyXG4gICAgICAgIHRyYWRlcyA9IHRyYWRlcy5maWx0ZXIoZnVuY3Rpb24odHJhZGUpIHtcclxuICAgICAgICAgIHJldHVybiAoISF0cmFkZS5wMS51c2VyICYmICEhdHJhZGUucDIudXNlcilcclxuICAgICAgICB9KVxyXG4gICAgICAgIGlmICgkc2NvcGUudXNlci5yb2xlID09ICdhZG1pbicpIHtcclxuICAgICAgICAgIHZhciBwYWlkUmVwb3N0SWRzID0gW107XHJcbiAgICAgICAgICBpZiAoJHNjb3BlLnVzZXIucGFpZFJlcG9zdC5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICRzY29wZS51c2VyLnBhaWRSZXBvc3QuZm9yRWFjaChmdW5jdGlvbihhY2MpIHtcclxuICAgICAgICAgICAgICBwYWlkUmVwb3N0SWRzLnB1c2goYWNjLnVzZXJJRCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0cmFkZXMuZm9yRWFjaChmdW5jdGlvbih0cmFkZSkge1xyXG4gICAgICAgICAgICB0cmFkZS5vdGhlciA9IHBhaWRSZXBvc3RJZHMuaW5jbHVkZXModHJhZGUucDEudXNlci5faWQpID8gdHJhZGUucDIgOiB0cmFkZS5wMTtcclxuICAgICAgICAgICAgaWYgKHRyYWRlLm90aGVyLmFjY2VwdGVkKSAkc2NvcGUuaW5ib3hUcmFkZXMrKztcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB0cmFkZXMuZm9yRWFjaChmdW5jdGlvbih0cmFkZSkge1xyXG4gICAgICAgICAgICB0cmFkZS5vdGhlciA9ICh0cmFkZS5wMS51c2VyLl9pZCA9PSAkc2NvcGUudXNlci5faWQpID8gdHJhZGUucDIgOiB0cmFkZS5wMTtcclxuICAgICAgICAgICAgaWYgKHRyYWRlLm90aGVyLmFjY2VwdGVkKSAkc2NvcGUuaW5ib3hUcmFkZXMrKztcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSkudGhlbihudWxsLCBjb25zb2xlLmxvZylcclxuICAgIH1cclxuICB9XHJcbiAgJHNjb3BlLmdldEluY29tcGxldGVUcmFkZXNDb3VudCgpO1xyXG5cclxuICAkc2NvcGUuZ290b1NldHRpbmdzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUudXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcclxuICAgIFNlc3Npb25TZXJ2aWNlLmFkZEFjdGlvbnNmb0FjY291bnQoJ0FkbWluJywgJHNjb3BlLnVzZXIuX2lkKVxyXG4gICAgJHN0YXRlLmdvKFwiYmFzaWNzdGVwMVwiKTtcclxuICB9XHJcblxyXG4gICRzY29wZS5nZXRCZWhhbGZVc2VyUmVjb3JkID0gZnVuY3Rpb24ocGFpZCkge1xyXG4gICAgcGFpZCA9IEpTT04ucGFyc2UocGFpZCk7XHJcbiAgICBTZXNzaW9uU2VydmljZS5yZW1vdmVQYWlkUmVwb3N0QWNjb3VudHMoKTtcclxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XHJcbiAgICAgIFNlc3Npb25TZXJ2aWNlLmFkZEFjdGlvbnNmb0FjY291bnQoJ0JlaGFsZlVzZXInLCBwYWlkLl9pZCwgcGFpZC5zb3VuZGNsb3VkLmlkKTtcclxuICAgICAgU2Vzc2lvblNlcnZpY2Uuc2V0VXNlclBhaWRSZXBvc3RBY2NvdW50cyhwYWlkKTtcclxuICAgICAgaWYgKCRzdGF0ZS5jdXJyZW50LnVybC5pbmRleE9mKFwiYWRtaW4vdHJhZGVcIikgIT0gLTEpXHJcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2FkbWluL3JlcG9zdHRyYWRlcnMnO1xyXG4gICAgICBlbHNlXHJcbiAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgkc3RhdGUuY3VycmVudC51cmwpO1xyXG4gICAgfSwgNTAwKTtcclxuICB9XHJcblxyXG4gICRzY29wZS5nb3RvQmVoYWxmU2V0dGluZyA9IGZ1bmN0aW9uKGFjdGlvbnMpIHtcclxuICAgIGlmIChhY3Rpb25zID09IFwiU0NIRURVTEVSXCIpIHtcclxuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2FkbWluL3NjaGVkdWxlcic7XHJcbiAgICB9XHJcbiAgICBpZiAoYWN0aW9ucyA9PSBcIlJFUE9TVFRSQURFU1wiKSB7XHJcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hZG1pbi90cmFkZSc7XHJcbiAgICB9XHJcbiAgICBpZiAoYWN0aW9ucyA9PSBcIkRPV05MT0FER0FURVdBWVwiKSB7XHJcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hZG1pbi9kb3dubG9hZEdhdGV3YXknO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgJHNjb3BlLm9wZW5IZWxwTW9kYWwgPSBmdW5jdGlvbigpIHtcclxuICAgICAgJC5aZWJyYV9EaWFsb2coXCJEbyB5b3UgaGF2ZSBhIHF1ZXN0aW9uPyBFbWFpbCB1cyBhbmQgd2UnbGwgZ2V0IGJhY2sgdG8geW91IHByb21wdGx5LlwiLCB7XHJcbiAgICAgICAgJ3R5cGUnOiAncXVlc3Rpb24nLFxyXG4gICAgICAgICdidXR0b25zJzogW3tcclxuICAgICAgICAgIGNhcHRpb246ICdDYW5jZWwnLFxyXG4gICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKCkge31cclxuICAgICAgICB9LCB7XHJcbiAgICAgICAgICBjYXB0aW9uOiAnRW1haWwgVGVjaCBTdXBwb3J0JyxcclxuICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcIm1haWx0bzpjb2F5c2N1ZUBhcnRpc3RzdW5saW1pdGVkLmNvbT9zdWJqZWN0PVN1cHBvcnRcIjtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICAgIC8qJHNjb3BlLmNoZWNrTm90aWZpY2F0aW9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgdmFyIHVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgICAgaWYgKHVzZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS90cmFkZXMvd2l0aFVzZXIvJyArIHVzZXIuX2lkKVxyXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRyYWRlcyA9IHJlcy5kYXRhO1xyXG4gICAgICAgICAgICAgICAgICAgIHRyYWRlcy5mb3JFYWNoKGZ1bmN0aW9uKHRyYWRlKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0cmFkZS5wMS51c2VyLl9pZCA9PSB1c2VyLl9pZCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRyYWRlLnAxLmFsZXJ0ID09IFwiY2hhbmdlXCIpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvd25vdGlmaWNhdGlvbiA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRyYWRlLnAyLnVzZXIuX2lkID09IHVzZXIuX2lkKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJhZGUucDIuYWxlcnQgPT0gXCJjaGFuZ2VcIikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93bm90aWZpY2F0aW9uID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICB9XHJcbiAgICB9Ki9cclxuXHJcbiAgJHNjb3BlLnNldEN1clVzZXIgPSBmdW5jdGlvbigpIHtcclxuICAgICRzY29wZS5jdXJBVFVzZXIgPSBKU09OLnN0cmluZ2lmeShTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkpO1xyXG4gIH1cclxuXHJcblxyXG4gICRzY29wZS5yb290U291bmRjbG91ZExvZ2luID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICBTQy5jb25uZWN0KClcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgJHJvb3RTY29wZS5hY2Nlc3NUb2tlbiA9IHJlcy5vYXV0aF90b2tlbjtcclxuICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9sb2dpbi9zb3VuZENsb3VkTG9naW4nLCB7XHJcbiAgICAgICAgICB0b2tlbjogcmVzLm9hdXRoX3Rva2VuLFxyXG4gICAgICAgICAgcGFzc3dvcmQ6ICd0ZXN0J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIHZhciB1c2VyRGF0YSA9IHJlcy5kYXRhLnVzZXI7XHJcbiAgICAgICAgdXNlckRhdGEuaXNBZG1pbiA9IGZhbHNlO1xyXG4gICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZSh1c2VyRGF0YSk7XHJcbiAgICAgICAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluY2x1ZGVzKCcvYWRtaW4nKSkgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2FkbWluL3NjaGVkdWxlcidcclxuICAgICAgICBlbHNlIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICRzY29wZS5zb3VuZGNsb3VkTG9naW4oKTtcclxuICAgICAgfSk7XHJcbiAgfTtcclxuXHJcblxyXG4gICRyb290U2NvcGUuY2hhbmdlVXNlckFkbWluID0gJHNjb3BlLmNoYW5nZVVzZXJBZG1pbiA9IGZ1bmN0aW9uKHBhcmFtLCBsb2NhdGlvbiwgc3RhdGUpIHtcclxuICAgIGlmICghcGFyYW0pIHJldHVybjtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgIGlmICh0eXBlb2YgcGFyYW0gPT0gJ3N0cmluZycgJiYgcGFyYW0ubGVuZ3RoID4gMTUpIHBhcmFtID0gSlNPTi5wYXJzZShwYXJhbSk7XHJcbiAgICBpZiAocGFyYW0gPT0gJ3VzZXInKSB7XHJcbiAgICAgIHZhciBwcmV2QVRVc2VyID0gSlNPTi5wYXJzZSgkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdwcmV2QVRVc2VyJykpO1xyXG4gICAgICBpZiAoU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpLl9pZCAhPSBwcmV2QVRVc2VyLl9pZCkge1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9sb2dpbi9zb3VuZENsb3VkTG9naW4nLCB7XHJcbiAgICAgICAgICAgIHRva2VuOiBwcmV2QVRVc2VyLnNvdW5kY2xvdWQudG9rZW4sXHJcbiAgICAgICAgICAgIHBhc3N3b3JkOiAndGVzdCdcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlKHJlcy5kYXRhLnVzZXIpO1xyXG4gICAgICAgICAgICAkc2NvcGUuY3VyQVRVc2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpXHJcbiAgICAgICAgICAgICAgLy8gaWYgKHN0YXRlKSAkc3RhdGUuZ28oc3RhdGUpO1xyXG4gICAgICAgICAgICBpZiAobG9jYXRpb24pIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gbG9jYXRpb247XHJcbiAgICAgICAgICAgIGVsc2Ugd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkc2NvcGUucm9vdFNvdW5kY2xvdWRMb2dpbigpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAvL2lmIChzdGF0ZSkgJHN0YXRlLmdvKHN0YXRlKTtcclxuICAgICAgICBpZiAobG9jYXRpb24pIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gbG9jYXRpb247XHJcbiAgICAgICAgZWxzZSB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAocGFyYW0gPT0gJ2FkbWluJykge1xyXG4gICAgICB2YXIgYWRtaW5Vc2VyID0gSlNPTi5wYXJzZSgkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdhZG1pblVzZXInKSk7XHJcbiAgICAgIGlmIChTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkuX2lkICE9IGFkbWluVXNlci5faWQpIHtcclxuICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdwcmV2QVRVc2VyJywgSlNPTi5zdHJpbmdpZnkoU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSlcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgcmV0dXJuIEF1dGhTZXJ2aWNlXHJcbiAgICAgICAgICAubG9naW4oYWRtaW5Vc2VyLmxvZ2luSW5mbylcclxuICAgICAgICAgIC50aGVuKGhhbmRsZUxvZ2luUmVzcG9uc2UpXHJcbiAgICAgICAgICAuY2F0Y2goY29uc29sZS5sb2cpO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiBoYW5kbGVMb2dpblJlc3BvbnNlKHJlcykge1xyXG4gICAgICAgICAgaWYgKHJlcy5zdGF0dXMgPT09IDIwMCAmJiByZXMuZGF0YS5zdWNjZXNzKSB7XHJcbiAgICAgICAgICAgIHZhciB1c2VyRGF0YSA9IHJlcy5kYXRhLnVzZXI7XHJcbiAgICAgICAgICAgIHVzZXJEYXRhLmlzQWRtaW4gPSB0cnVlO1xyXG4gICAgICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUodXNlckRhdGEpO1xyXG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAkc2NvcGUuY3VyQVRVc2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpXHJcbiAgICAgICAgICAgICAgLy8gaWYgKHN0YXRlKSAkc3RhdGUuZ28oc3RhdGUpO1xyXG4gICAgICAgICAgICBpZiAobG9jYXRpb24pIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gbG9jYXRpb247XHJcbiAgICAgICAgICAgIGVsc2Ugd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xyXG4gICAgICAgICAgfSBlbHNlIGNvbnNvbGUubG9nKFwiSW52YWxpZCBFbWFpbCBvciBQYXNzd29yZC5cIik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgLy8gaWYgKHN0YXRlKSAkc3RhdGUuZ28oc3RhdGUpO1xyXG4gICAgICAgIGlmIChsb2NhdGlvbikgd2luZG93LmxvY2F0aW9uLmhyZWYgPSBsb2NhdGlvbjtcclxuICAgICAgICBlbHNlIHdpbmRvdy5sb2NhdGlvbi5yZWxvYWQoKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9sb2dpbi9zb3VuZENsb3VkTG9naW4nLCB7XHJcbiAgICAgICAgICB0b2tlbjogcGFyYW0uc291bmRjbG91ZC50b2tlbixcclxuICAgICAgICAgIHBhc3N3b3JkOiAndGVzdCdcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZShyZXMuZGF0YS51c2VyKTtcclxuICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3ByZXZBVFVzZXInLCBKU09OLnN0cmluZ2lmeShTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkpKVxyXG4gICAgICAgICAgJHNjb3BlLmN1ckFUVXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKVxyXG4gICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpXHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAkc2NvcGUucm9vdFNvdW5kY2xvdWRMb2dpbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmxpbmtlZFVzZXJzQ2hhbmdlID0gZnVuY3Rpb24oYXV0aFRva2VuKSB7XHJcbiAgICBpZiAoYXV0aFRva2VuKSB7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgJGh0dHAucG9zdCgnL2FwaS9sb2dpbi9zb3VuZENsb3VkTG9naW4nLCB7XHJcbiAgICAgICAgICB0b2tlbjogYXV0aFRva2VuLFxyXG4gICAgICAgICAgcGFzc3dvcmQ6ICd0ZXN0J1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgaWYgKHJlcy5kYXRhLnVzZXIpIHtcclxuICAgICAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlKHJlcy5kYXRhLnVzZXIpO1xyXG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAkc2NvcGUucm9vdFNvdW5kY2xvdWRMb2dpbigpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgJHNjb3BlLnN3aXRoVXNlciA9IGZ1bmN0aW9uKGlzYWRtaW4pIHtcclxuICAgIGlmIChpc2FkbWluKSB7XHJcbiAgICAgIG1haW5TZXJ2aWNlLmxvZ291dCgpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbWFpblNlcnZpY2UuYWRtaW5sb2dvdXQoKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gICRyb290U2NvcGUuZ2V0VXNlck5ldHdvcmsgPSAkc2NvcGUuZ2V0VXNlck5ldHdvcmsgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICgkd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmluY2x1ZGVzKCdhZG1pbi8nKSkge1xyXG4gICAgICBjb25zb2xlLmxvZygkd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lICsgXCIgJHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZVwiKTtcclxuICAgICAgdmFyIGFkbWluVXNlciA9IEpTT04ucGFyc2UoJHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgnYWRtaW5Vc2VyJykpO1xyXG4gICAgICByZXR1cm4gJGh0dHAuZ2V0KFwiL2FwaS9kYXRhYmFzZS9hZG1pblVzZXJOZXR3b3JrL1wiICsgYWRtaW5Vc2VyLl9pZClcclxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgIHZhciB0cm91YmxlVXNlciA9IHJlcy5kYXRhLmZpbmQoZnVuY3Rpb24odXNlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gdXNlci5lcnJvcjtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICBpZiAodHJvdWJsZVVzZXIpIHtcclxuICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJQbGVhc2UgbG9nIGJhY2sgaW4gd2l0aCA8c3BhbiBzdHlsZT0nZm9udC13ZWlnaHQ6Ym9sZCc+XCIgKyB0cm91YmxlVXNlci5zb3VuZGNsb3VkLnVzZXJuYW1lICsgXCI8L3NwYW4+IHRvIGJlIGFibGUgdG8gY29udGludWUgdG8gbWFuYWdlIDxzcGFuIHN0eWxlPSdmb250LXdlaWdodDpib2xkJz5cIiArIHRyb3VibGVVc2VyLnNvdW5kY2xvdWQudXNlcm5hbWUgKyBcIjwvc3Bhbj4uIE90aGVyd2lzZSwgcGxlYXNlIHJlbW92ZSBpdCBmcm9tIHlvdXIgXFxcImFjY291bnRzXFxcIi5cIiwge1xyXG4gICAgICAgICAgICAgICd0eXBlJzogJ3F1ZXN0aW9uJyxcclxuICAgICAgICAgICAgICAnYnV0dG9ucyc6IFt7XHJcbiAgICAgICAgICAgICAgICBjYXB0aW9uOiAnQ2FuY2VsJyxcclxuICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbigpIHt9XHJcbiAgICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgICAgY2FwdGlvbjogJ0xvZyBJbicsXHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICRzY29wZS5yb290U291bmRjbG91ZExvZ2luKCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfV1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgIH1cclxuICAgICAgICAgICRyb290U2NvcGUudXNlcmxpbmtlZEFjY291bnRzID0gcmVzLmRhdGE7XHJcbiAgICAgICAgfSlcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiAkaHR0cC5nZXQoXCIvYXBpL2RhdGFiYXNlL3VzZXJOZXR3b3Jrc1wiKVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgdmFyIHRyb3VibGVVc2VyID0gcmVzLmRhdGEuZmluZChmdW5jdGlvbih1c2VyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB1c2VyLmVycm9yO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIGNvbnNvbGUubG9nKHJlcy5kYXRhKTtcclxuICAgICAgICAgIGlmICh0cm91YmxlVXNlcikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0cm91YmxlVXNlcilcclxuICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJQbGVhc2UgbG9nIGJhY2sgaW4gd2l0aCA8c3BhbiBzdHlsZT0nZm9udC13ZWlnaHQ6Ym9sZCc+XCIgKyB0cm91YmxlVXNlci5zb3VuZGNsb3VkLnVzZXJuYW1lICsgXCI8L3NwYW4+IHRvIGJlIGFibGUgdG8gY29udGludWUgdG8gbWFuYWdlIDxzcGFuIHN0eWxlPSdmb250LXdlaWdodDpib2xkJz5cIiArIHRyb3VibGVVc2VyLnNvdW5kY2xvdWQudXNlcm5hbWUgKyBcIjwvc3Bhbj4uIE90aGVyd2lzZSwgcGxlYXNlIHJlbW92ZSBpdCBmcm9tIHlvdXIgXFxcIkxpbmtlZCBBY2NvdW50c1xcXCIuXCIsIHtcclxuICAgICAgICAgICAgICAndHlwZSc6ICdxdWVzdGlvbicsXHJcbiAgICAgICAgICAgICAgJ2J1dHRvbnMnOiBbe1xyXG4gICAgICAgICAgICAgICAgY2FwdGlvbjogJ0NhbmNlbCcsXHJcbiAgICAgICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24oKSB7fVxyXG4gICAgICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgICAgIGNhcHRpb246ICdMb2cgSW4nLFxyXG4gICAgICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAkc2NvcGUucm9vdFNvdW5kY2xvdWRMb2dpbigpO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1dXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICAkcm9vdFNjb3BlLnVzZXJsaW5rZWRBY2NvdW50cyA9IHJlcy5kYXRhO1xyXG4gICAgICAgIH0pXHJcbiAgICB9XHJcbiAgfVxyXG4gIGlmICgkc2NvcGUudXNlciAmJiAkc2NvcGUudXNlci5yb2xlID09IFwiYWRtaW5cIikgJHJvb3RTY29wZS5nZXRVc2VyTmV0d29yaygpO1xyXG4gIC8vICAgICRzY29wZS5jaGVja05vdGlmaWNhdGlvbigpO1xyXG59KTtcclxuXHJcbmFwcC5kaXJlY3RpdmUoJ2ZiTGlrZScsIFtcclxuICAnJHdpbmRvdycsICckcm9vdFNjb3BlJyxcclxuICBmdW5jdGlvbigkd2luZG93LCAkcm9vdFNjb3BlKSB7XHJcbiAgICByZXR1cm4ge1xyXG4gICAgICByZXN0cmljdDogJ0EnLFxyXG4gICAgICBzY29wZToge1xyXG4gICAgICAgIGZiTGlrZTogJz0/J1xyXG4gICAgICB9LFxyXG4gICAgICBsaW5rOiBmdW5jdGlvbihzY29wZSwgZWxlbWVudCwgYXR0cnMpIHtcclxuICAgICAgICBpZiAoISR3aW5kb3cuRkIpIHtcclxuICAgICAgICAgIC8vIExvYWQgRmFjZWJvb2sgU0RLIGlmIG5vdCBhbHJlYWR5IGxvYWRlZFxyXG4gICAgICAgICAgJC5nZXRTY3JpcHQoJy8vY29ubmVjdC5mYWNlYm9vay5uZXQvZW5fVVMvc2RrLmpzJywgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICR3aW5kb3cuRkIuaW5pdCh7XHJcbiAgICAgICAgICAgICAgYXBwSWQ6ICRyb290U2NvcGUuZmFjZWJvb2tBcHBJZCxcclxuICAgICAgICAgICAgICB4ZmJtbDogdHJ1ZSxcclxuICAgICAgICAgICAgICB2ZXJzaW9uOiAndjIuMCdcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIHJlbmRlckxpa2VCdXR0b24oKTtcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZW5kZXJMaWtlQnV0dG9uKCk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICB2YXIgd2F0Y2hBZGRlZCA9IGZhbHNlO1xyXG5cclxuICAgICAgICBmdW5jdGlvbiByZW5kZXJMaWtlQnV0dG9uKCkge1xyXG4gICAgICAgICAgaWYgKCEhYXR0cnMuZmJMaWtlICYmICFzY29wZS5mYkxpa2UgJiYgIXdhdGNoQWRkZWQpIHtcclxuICAgICAgICAgICAgLy8gd2FpdCBmb3IgZGF0YSBpZiBpdCBoYXNuJ3QgbG9hZGVkIHlldFxyXG4gICAgICAgICAgICB3YXRjaEFkZGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgdmFyIHVuYmluZFdhdGNoID0gc2NvcGUuJHdhdGNoKCdmYkxpa2UnLCBmdW5jdGlvbihuZXdWYWx1ZSwgb2xkVmFsdWUpIHtcclxuICAgICAgICAgICAgICBpZiAobmV3VmFsdWUpIHtcclxuICAgICAgICAgICAgICAgIHJlbmRlckxpa2VCdXR0b24oKTtcclxuICAgICAgICAgICAgICAgIC8vIG9ubHkgbmVlZCB0byBydW4gb25jZVxyXG4gICAgICAgICAgICAgICAgdW5iaW5kV2F0Y2goKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICBlbGVtZW50Lmh0bWwoJzxkaXYgY2xhc3M9XCJmYi1saWtlXCInICsgKCEhc2NvcGUuZmJMaWtlID8gJyBkYXRhLWhyZWY9XCInICsgc2NvcGUuZmJMaWtlICsgJ1wiJyA6ICcnKSArICcgZGF0YS1sYXlvdXQ9XCJidXR0b25fY291bnRcIiBkYXRhLWFjdGlvbj1cImxpa2VcIiBkYXRhLXNob3ctZmFjZXM9XCJ0cnVlXCIgZGF0YS1zaGFyZT1cInRydWVcIj48L2Rpdj4nKTtcclxuICAgICAgICAgICAgJHdpbmRvdy5GQi5YRkJNTC5wYXJzZShlbGVtZW50LnBhcmVudCgpWzBdKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH07XHJcbiAgfVxyXG5dKVxyXG5cclxuYXBwLmRpcmVjdGl2ZSgnZmlsZXJlYWQnLCBbZnVuY3Rpb24oKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIGZpbGVyZWFkOiAnPScsXHJcbiAgICAgIG1lc3NhZ2U6ICc9J1xyXG4gICAgfSxcclxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRyaWJ1dGVzKSB7XHJcbiAgICAgIGVsZW1lbnQuYmluZCgnY2hhbmdlJywgZnVuY3Rpb24oY2hhbmdlRXZlbnQpIHtcclxuICAgICAgICBzY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICBzY29wZS5tZXNzYWdlID0ge1xyXG4gICAgICAgICAgICB2aXNpYmxlOiBmYWxzZSxcclxuICAgICAgICAgICAgdmFsOiAnJ1xyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgIGlmIChjaGFuZ2VFdmVudC50YXJnZXQuZmlsZXNbMF0udHlwZSAhPSBcImF1ZGlvL21wZWdcIiAmJiBjaGFuZ2VFdmVudC50YXJnZXQuZmlsZXNbMF0udHlwZSAhPSBcImF1ZGlvL21wM1wiKSB7XHJcbiAgICAgICAgICAgIHNjb3BlLm1lc3NhZ2UgPSB7XHJcbiAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcclxuICAgICAgICAgICAgICB2YWw6ICdFcnJvcjogUGxlYXNlIHVwbG9hZCBtcDMgZm9ybWF0IGZpbGUuJ1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBlbGVtZW50LnZhbChudWxsKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKGNoYW5nZUV2ZW50LnRhcmdldC5maWxlc1swXS5zaXplID4gMjAgKiAxMDAwICogMTAwMCkge1xyXG4gICAgICAgICAgICBzY29wZS5tZXNzYWdlID0ge1xyXG4gICAgICAgICAgICAgIHZpc2libGU6IHRydWUsXHJcbiAgICAgICAgICAgICAgdmFsOiAnRXJyb3I6IFBsZWFzZSB1cGxvYWQgZmlsZSB1cHRvIDIwIE1CIHNpemUuJ1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICBlbGVtZW50LnZhbChudWxsKTtcclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgc2NvcGUuZmlsZXJlYWQgPSBjaGFuZ2VFdmVudC50YXJnZXQuZmlsZXNbMF07XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gIH1cclxufV0pO1xyXG5cclxuYXBwLnNlcnZpY2UoJ21haW5TZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIFNlc3Npb25TZXJ2aWNlKSB7XHJcbiAgdGhpcy5sb2dvdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICRodHRwLnBvc3QoJy9hcGkvbG9nb3V0JykudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgU2Vzc2lvblNlcnZpY2UuZGVsZXRlVXNlcigpO1xyXG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvbG9naW4nO1xyXG4gICAgfSk7XHJcbiAgfVxyXG4gIHRoaXMuYWRtaW5sb2dvdXQgPSBmdW5jdGlvbigpIHtcclxuICAgICRodHRwLnBvc3QoJy9hcGkvbG9nb3V0JykudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgU2Vzc2lvblNlcnZpY2UuZGVsZXRlVXNlcigpO1xyXG4gICAgICB3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ2lzQWRtaW5BdXRoZW50aWNhdGUnKTtcclxuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2FkbWluJztcclxuICAgIH0pO1xyXG4gIH1cclxufSk7XHJcblxyXG4vKkxvYWQgbW9yZSovXHJcbmFwcC5kaXJlY3RpdmUoJ3doZW5TY3JvbGxlZCcsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiBmdW5jdGlvbihzY29wZSwgZWxtLCBhdHRyKSB7XHJcbiAgICB2YXIgcmF3ID0gZWxtWzBdO1xyXG4gICAgZWxtLmJpbmQoJ3Njcm9sbCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICBpZiAocmF3LnNjcm9sbFRvcCArIHJhdy5vZmZzZXRIZWlnaHQgPj0gcmF3LnNjcm9sbEhlaWdodCkge1xyXG4gICAgICAgIHNjb3BlLiRhcHBseShhdHRyLndoZW5TY3JvbGxlZCk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH07XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gZ2V0UXVlcnlTdHJpbmcoZmllbGQsIHVybCkge1xyXG4gIHZhciBocmVmID0gdXJsID8gdXJsIDogd2luZG93LmxvY2F0aW9uLmhyZWY7XHJcbiAgdmFyIHJlZyA9IG5ldyBSZWdFeHAoJ1s/Jl0nICsgZmllbGQgKyAnPShbXiYjXSopJywgJ2knKTtcclxuICB2YXIgc3RyaW5nID0gcmVnLmV4ZWMoaHJlZik7XHJcbiAgcmV0dXJuIHN0cmluZyA/IHN0cmluZ1sxXSA6IG51bGw7XHJcbn07XHJcblxyXG5mdW5jdGlvbiBxdWVyeVN0cmluZ2lmeShvYmopIHtcclxuICByZXR1cm4gJz8nICsgT2JqZWN0LmtleXMob2JqKS5yZWR1Y2UoZnVuY3Rpb24oYSwgaykge1xyXG4gICAgYS5wdXNoKGsgKyAnPScgKyBlbmNvZGVVUklDb21wb25lbnQob2JqW2tdKSk7XHJcbiAgICByZXR1cm4gYVxyXG4gIH0sIFtdKS5qb2luKCcmJylcclxufVxyXG5cclxudmFyIGRheXNPZldlZWsgPSBbXCJzdW5kYXlcIiwgXCJtb25kYXlcIiwgXCJ0dWVzZGF5XCIsIFwid2VkbmVzZGF5XCIsIFwidGh1cnNkYXlcIiwgXCJmcmlkYXlcIiwgXCJzYXR1cmRheVwiXTtcclxuXHJcbmZ1bmN0aW9uIGNyZWF0ZVBzZXVkb0F2YWlsYWJsZVNsb3RzKHVzZXIpIHtcclxuICB2YXIgcHNldWRvU2xvdHMgPSB7fTtcclxuICB2YXIgdHpPZmZzZXQgPSAoLShuZXcgRGF0ZSgpKS5nZXRUaW1lem9uZU9mZnNldCgpIC0gdXNlci5hc3R6T2Zmc2V0KSAvIDYwO1xyXG4gIGRheXNPZldlZWsuZm9yRWFjaChmdW5jdGlvbihkYXkpIHtcclxuICAgIGlmICh1c2VyLmF2YWlsYWJsZVNsb3RzW2RheV0pIHtcclxuICAgICAgdmFyIGRheVNsb3RzID0gW107XHJcbiAgICAgIHVzZXIuYXZhaWxhYmxlU2xvdHNbZGF5XS5mb3JFYWNoKGZ1bmN0aW9uKGhvdXIpIHtcclxuICAgICAgICBkYXlTbG90cy5wdXNoKChob3VyICsgdHpPZmZzZXQgKyAyNCkgJSAyNCk7XHJcbiAgICAgIH0pXHJcbiAgICAgIGRheVNsb3RzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgIGlmIChhIDwgYikgcmV0dXJuIC0xO1xyXG4gICAgICAgIGVsc2UgcmV0dXJuIDE7XHJcbiAgICAgIH0pXHJcbiAgICAgIHBzZXVkb1Nsb3RzW2RheV0gPSBkYXlTbG90cztcclxuICAgIH1cclxuICB9KVxyXG4gIHJldHVybiBwc2V1ZG9TbG90cztcclxufVxyXG5cclxuZnVuY3Rpb24gY3JlYXRlQXZhaWxhYmxlU2xvdHModXNlciwgcHNldWRvU2xvdHMpIHtcclxuICB2YXIgYXZhaWxhYmxlU2xvdHMgPSB7fTtcclxuICB2YXIgdHpPZmZzZXQgPSAoLShuZXcgRGF0ZSgpKS5nZXRUaW1lem9uZU9mZnNldCgpIC0gdXNlci5hc3R6T2Zmc2V0KSAvIDYwO1xyXG4gIGRheXNPZldlZWsuZm9yRWFjaChmdW5jdGlvbihkYXkpIHtcclxuICAgIGlmIChwc2V1ZG9TbG90c1tkYXldKSB7XHJcbiAgICAgIHZhciBkYXlTbG90cyA9IFtdO1xyXG4gICAgICBwc2V1ZG9TbG90c1tkYXldLmZvckVhY2goZnVuY3Rpb24oaG91cikge1xyXG4gICAgICAgIGRheVNsb3RzLnB1c2goKGhvdXIgLSB0ek9mZnNldCArIDI0KSAlIDI0KTtcclxuICAgICAgfSlcclxuICAgICAgZGF5U2xvdHMuc29ydChmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgaWYgKGEgPCBiKSByZXR1cm4gLTE7XHJcbiAgICAgICAgZWxzZSByZXR1cm4gMTtcclxuICAgICAgfSlcclxuICAgICAgYXZhaWxhYmxlU2xvdHNbZGF5XSA9IGRheVNsb3RzO1xyXG4gICAgfVxyXG4gIH0pXHJcbiAgcmV0dXJuIGF2YWlsYWJsZVNsb3RzO1xyXG59XHJcbiJdLCJmaWxlIjoiYXBwLmpzIn0=
