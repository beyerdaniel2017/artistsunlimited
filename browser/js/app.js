'use strict';
window.app = angular.module('FullstackGeneratedApp', ['fsaPreBuilt', 'ui.router', 'ui.bootstrap', 'ngAnimate', 'ngCookies', 'yaru22.angular-timeago', 'satellizer','angularMoment','luegg.directives','ui-rangeSlider', 'ngSanitize', 'colorpicker.module']);

app.config(function($urlRouterProvider, $locationProvider, $uiViewScrollProvider, $httpProvider) {
    // This turns off hashbang urls (/#about) and changes it to something normal (/about)
    $locationProvider.html5Mode(true);
    // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
    $urlRouterProvider.otherwise('/');
    // $uiViewScrollProvider.useAnchorScroll();
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

        if ($window.location.pathname.indexOf('artistTools') != -1) {
            $http.get('/api/users/isUserAuthenticate').then(function(res) {
                if (!res.data) {
                    $window.location.href = '/login';
                }
            });
        };

    });

    SessionService.refreshUser();

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

app.controller('FullstackGeneratedController', function($scope, $state, $http, mainService, SessionService) {
    /*Load More*/
    $scope.loadList = function() {
        $scope.$broadcast('loadTrades');
    }

    $scope.shownotification = false;


    $scope.logout = function() {
        mainService.logout();
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

    $scope.linkedUsersChange = function(linkedUsers) {
        $scope.processing = true;
        $http.post('/api/logout').then(function() {
            $http.post("/api/login/thirdPartylogin", {
                    username: linkedUsers.username,
                    password: linkedUsers.password
                })
                .then(function(res) {
                    if (res.data.user) {
                        SessionService.create(res.data.user);
                        location.reload();
                    } else {
                        $scope.processing = false;
                        $.Zebra_Dialog("Wrong third party access credentials.", {
                            onClose: function() {
                                $scope.processing = true;
                                location.reload();
                            }
                        });
                    }
                })
                .then(null, function(err) {
                    $.Zebra_Dialog("Error in processing the request. Please try again.");
                    $scope.processing = false;
                });
        });
    }
    $scope.checkNotification();
});

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
    // this.openHelpModal = function() {
    //     var displayText = "Hey! Thanks for using artist tools! Please submit any questions you have by clicking 'Support' <br><br><a href='mailto:coayscue@artistsunlimited.co?subject=Artists Unlimited Help' target='_top'>Support</a>";
    //     $.Zebra_Dialog(displayText, {
    //         width: 600
    //     });
    // }
    this.logout = function() {
        $http.post('/api/logout').then(function() {
            SessionService.deleteUser();
            window.location.href = '/login';
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