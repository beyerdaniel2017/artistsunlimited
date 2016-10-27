'use strict';
window.app = angular.module('FullstackGeneratedApp', ['fsaPreBuilt', 'ui.router', 'ui.bootstrap', 'ngAnimate', 'ngCookies', 'yaru22.angular-timeago', 'satellizer', 'angularMoment', 'luegg.directives', 'ui-rangeSlider', 'ngSanitize', 'colorpicker.module', 'ngclipboard']);

app.config(function($urlRouterProvider, $locationProvider, $uiViewScrollProvider, $httpProvider) {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    $locationProvider.html5Mode(true);
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');
    // $uiViewScrollProvider.useAnchorScroll();
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
                if ($window.location.pathname.indexOf('admin') != -1 && !isAdminAuthenticate) {
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
    $scope.isBlock = function() {
        $scope.user = SessionService.getUser();
        $scope.todayDate = new Date();
        $scope.blockRelease = new Date($scope.user.blockRelease);
        $scope.isBlock = $scope.todayDate < $scope.blockRelease ? true : false;
        return $scope.isBlock;
    }
    var admin = JSON.parse($window.localStorage.getItem('adminUser'));
    $rootScope.enableNavigation = admin.paidRepost.length > 0 ? false : true;

    $scope.loadList = function() {
        $scope.$broadcast('loadTrades');
    }
    $scope.submissionsCount = 0;
    $scope.shownotification = false;
    $scope.logout = function() {
        mainService.logout();
    }
    $scope.adminlogout = function() {
        mainService.adminlogout();
    }
    $scope.getSubmissionCount = function() {
        $http.get('/api/submissions/getUnacceptedSubmissions').then(function(res) {
            $scope.submissionsCount = res.data;
        });
    }

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
            if ($state.current.url.indexOf("admin/reForReInteraction") != -1)
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
            window.location.href = '/admin/reposttraders';
        }
        if (actions == "DOWNLOADGATEWAY") {
            window.location.href = '/admin/downloadGateway';
        }
    }


    $scope.checkNotification = function() {
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
    }

    $scope.setCurUser = function() {
        $scope.curATUser = JSON.stringify(SessionService.getUser());
    }

    $scope.changeUserAdmin = function(param, location) {
        if (typeof param == 'string' && param.length > 15) param = JSON.parse(param);
        if (param == 'user') {
            var prevATUser = JSON.parse($window.localStorage.getItem('prevATUser'));
            if (SessionService.getUser()._id != prevATUser._id) {
                $scope.processing = true;
                $http.post('/api/login/soundCloudLogin', {
                        token: prevATUser.soundcloud.token,
                        password: 'test'
                    })
                    .then(function(res) {
                        $scope.processing = false;
                        SessionService.create(res.data.user);
                        $scope.curATUser = SessionService.getUser()
                        if (location) window.location.href = location;
                        else $state.reload();
                    })
                    .then(null, function(err) {
                        $.Zebra_Dialog('Error: Could not log in');
                        $scope.processing = false;
                    });
            } else {
                if (location) window.location.href = location;
                else $state.reload();
            }
        } else if (param == 'admin') {
            var adminUser = JSON.parse($window.localStorage.getItem('adminUser'));
            console.log(adminUser);
            if (SessionService.getUser()._id != adminUser._id) {
                $window.localStorage.setItem('prevATUser', JSON.stringify(SessionService.getUser()))
                $scope.processing = true;
                AuthService
                    .login(adminUser.loginInfo)
                    .then(handleLoginResponse)
                    .catch(console.log);

                function handleLoginResponse(res) {
                    console.log('res.data');
                    if (res.status === 200 && res.data.success) {
                        var userData = res.data.user;
                        userData.isAdmin = true;
                        SessionService.create(userData);
                        $scope.processing = false;
                        $scope.curATUser = SessionService.getUser()
                        if (location) window.location.href = location;
                        else $state.reload();
                    } else console.log("Invalid Email or Password.");
                }
            } else {
                if (location) window.location.href = location;
                else $state.reload();
            }
        } else {
            $scope.processing = true;
            $http.post('/api/login/soundCloudLogin', {
                    token: param.soundcloud.token,
                    password: 'test'
                })
                .then(function(res) {
                    $scope.processing = false;
                    SessionService.create(res.data.user);
                    $window.localStorage.setItem('prevATUser', JSON.stringify(SessionService.getUser()))
                    $scope.curATUser = SessionService.getUser()
                    $state.reload();
                })
                .then(null, function(err) {
                    $.Zebra_Dialog('Error: Could not log in');
                    $scope.processing = false;
                });
        }
    }

    $scope.linkedUsersChange = function(authToken) {
        $scope.processing = true;
        $http.post('/api/login/soundCloudLogin', {
                token: authToken,
                password: 'test'
            })
            .then(function(res) {
                $scope.processing = false;
                SessionService.create(res.data.user);
                $state.reload();
            })
            .then(null, function(err) {
                $.Zebra_Dialog('Error: Could not log in');
                $scope.processing = false;
            });
    }

    $scope.swithUser = function(isadmin) {
        if (isadmin) {
            mainService.logout();
        } else {
            mainService.adminlogout();
        }
    }

    $scope.getUserNetwork = function() {
        if ($window.location.pathname.includes('admin/')) {
            var adminUser = JSON.parse($window.localStorage.getItem('adminUser'));
            return $http.get("/api/database/adminUserNetwork/" + adminUser._id)
                .then(function(res) {
                    $rootScope.userlinkedAccounts = res.data;
                })
        } else {
            return $http.get("/api/database/userNetworks")
                .then(function(networks) {
                    $rootScope.userlinkedAccounts = networks.data;
                })
        }
    }

    $scope.checkNotification();
    $scope.getSubmissionCount();
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