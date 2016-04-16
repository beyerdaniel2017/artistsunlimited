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

    AppConfig.fetchConfig().then(function(res) {
        // console.log(res);
        AppConfig.setConfig(res.data);
        // console.log(AppConfig.isConfigParamsvailable);
    })

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
        link: function (scope, element, attributes) {
            element.bind('change', function (changeEvent) {
                scope.$apply(function () {
                    scope.message = {
                        visible: false,
                        val: ''
                    };
                    
                    if(changeEvent.target.files[0].type != "audio/mpeg" && changeEvent.target.files[0].type != "audio/mp3") {
                        scope.message = {
                            visible: true,
                            val: 'Error: Please upload mp3 format file.'
                        };
                        element.val(null);
                        return;
                    }
                    
                    if(changeEvent.target.files[0].size > 20*1000*1000) {
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
