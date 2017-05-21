(function() {

    'use strict';
    // Hope you didn't forget Angular! Duh-doy.
    if (!window.angular) throw new Error('I can\'t find Angular!');

    var app = angular.module('fsaPreBuilt', []);

    app.factory('initSocket', function() {
        if (!window.io) throw new Error('socket.io not found!');
        return window.io(window.location.origin);
    });

    app.factory('socket', function($rootScope, initSocket) {
        return {
            on: function(eventName, callback) {
                initSocket.on(eventName, function() {
                    var args = arguments;
                    $rootScope.$apply(function() {
                        callback.apply(initSocket, args);
                    });
                });
            },
            emit: function(eventName, data, callback) {
                initSocket.emit(eventName, data, function() {
                    var args = arguments;
                    $rootScope.$apply(function() {
                        if (callback) {
                            callback.apply(initSocket, args);
                        }
                    });
                })
            }
        };
    });

    app.factory('AppConfig', function($http) {
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
            return 'ok';
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJmc2EvZnNhLXByZS1idWlsdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgJ3VzZSBzdHJpY3QnO1xyXG4gICAgLy8gSG9wZSB5b3UgZGlkbid0IGZvcmdldCBBbmd1bGFyISBEdWgtZG95LlxyXG4gICAgaWYgKCF3aW5kb3cuYW5ndWxhcikgdGhyb3cgbmV3IEVycm9yKCdJIGNhblxcJ3QgZmluZCBBbmd1bGFyIScpO1xyXG5cclxuICAgIHZhciBhcHAgPSBhbmd1bGFyLm1vZHVsZSgnZnNhUHJlQnVpbHQnLCBbXSk7XHJcblxyXG4gICAgYXBwLmZhY3RvcnkoJ2luaXRTb2NrZXQnLCBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoIXdpbmRvdy5pbykgdGhyb3cgbmV3IEVycm9yKCdzb2NrZXQuaW8gbm90IGZvdW5kIScpO1xyXG4gICAgICAgIHJldHVybiB3aW5kb3cuaW8od2luZG93LmxvY2F0aW9uLm9yaWdpbik7XHJcbiAgICB9KTtcclxuXHJcbiAgICBhcHAuZmFjdG9yeSgnc29ja2V0JywgZnVuY3Rpb24oJHJvb3RTY29wZSwgaW5pdFNvY2tldCkge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAgIG9uOiBmdW5jdGlvbihldmVudE5hbWUsIGNhbGxiYWNrKSB7XHJcbiAgICAgICAgICAgICAgICBpbml0U29ja2V0Lm9uKGV2ZW50TmFtZSwgZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XHJcbiAgICAgICAgICAgICAgICAgICAgJHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KGluaXRTb2NrZXQsIGFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIGVtaXQ6IGZ1bmN0aW9uKGV2ZW50TmFtZSwgZGF0YSwgY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgIGluaXRTb2NrZXQuZW1pdChldmVudE5hbWUsIGRhdGEsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xyXG4gICAgICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KGluaXRTb2NrZXQsIGFyZ3MpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuICAgIH0pO1xyXG5cclxuICAgIGFwcC5mYWN0b3J5KCdBcHBDb25maWcnLCBmdW5jdGlvbigkaHR0cCkge1xyXG4gICAgICAgIHZhciBfY29uZmlnUGFyYW1zID0gbnVsbDtcclxuXHJcbiAgICAgICAgZnVuY3Rpb24gZmV0Y2hDb25maWcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvc291bmRjbG91ZC9zb3VuZGNsb3VkQ29uZmlnJyk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBzZXRDb25maWcoZGF0YSkge1xyXG4gICAgICAgICAgICBfY29uZmlnUGFyYW1zID0gZGF0YTtcclxuICAgICAgICAgICAgU0MuaW5pdGlhbGl6ZSh7XHJcbiAgICAgICAgICAgICAgICBjbGllbnRfaWQ6IGRhdGEuY2xpZW50SUQsXHJcbiAgICAgICAgICAgICAgICByZWRpcmVjdF91cmk6IGRhdGEuY2FsbGJhY2tVUkwsXHJcbiAgICAgICAgICAgICAgICBzY29wZTogXCJub24tZXhwaXJpbmdcIlxyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgcmV0dXJuICdvayc7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBmdW5jdGlvbiBnZXRDb25maWcoKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBfY29uZmlnUGFyYW1zO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgZmV0Y2hDb25maWc6IGZldGNoQ29uZmlnLFxyXG4gICAgICAgICAgICBnZXRDb25maWc6IGdldENvbmZpZyxcclxuICAgICAgICAgICAgc2V0Q29uZmlnOiBzZXRDb25maWdcclxuICAgICAgICB9O1xyXG4gICAgfSk7XHJcblxyXG5cclxuICAgIC8vIEFVVEhfRVZFTlRTIGlzIHVzZWQgdGhyb3VnaG91dCBvdXIgYXBwIHRvXHJcbiAgICAvLyBicm9hZGNhc3QgYW5kIGxpc3RlbiBmcm9tIGFuZCB0byB0aGUgJHJvb3RTY29wZVxyXG4gICAgLy8gZm9yIGltcG9ydGFudCBldmVudHMgYWJvdXQgYXV0aGVudGljYXRpb24gZmxvdy5cclxuICAgIC8vIGFwcC5jb25zdGFudCgnQVVUSF9FVkVOVFMnLCB7XHJcbiAgICAvLyAgICAgbG9naW5TdWNjZXNzOiAnYXV0aC1sb2dpbi1zdWNjZXNzJyxcclxuICAgIC8vICAgICBsb2dpbkZhaWxlZDogJ2F1dGgtbG9naW4tZmFpbGVkJyxcclxuICAgIC8vICAgICBsb2dvdXRTdWNjZXNzOiAnYXV0aC1sb2dvdXQtc3VjY2VzcycsXHJcbiAgICAvLyAgICAgc2Vzc2lvblRpbWVvdXQ6ICdhdXRoLXNlc3Npb24tdGltZW91dCcsXHJcbiAgICAvLyAgICAgbm90QXV0aGVudGljYXRlZDogJ2F1dGgtbm90LWF1dGhlbnRpY2F0ZWQnLFxyXG4gICAgLy8gICAgIG5vdEF1dGhvcml6ZWQ6ICdhdXRoLW5vdC1hdXRob3JpemVkJ1xyXG4gICAgLy8gfSk7XHJcblxyXG4gICAgLy8gYXBwLmZhY3RvcnkoJ0F1dGhJbnRlcmNlcHRvcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRxLCBBVVRIX0VWRU5UUykge1xyXG4gICAgLy8gICAgIHZhciBzdGF0dXNEaWN0ID0ge1xyXG4gICAgLy8gICAgICAgICA0MDE6IEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsXHJcbiAgICAvLyAgICAgICAgIDQwMzogQVVUSF9FVkVOVFMubm90QXV0aG9yaXplZCxcclxuICAgIC8vICAgICAgICAgNDE5OiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCxcclxuICAgIC8vICAgICAgICAgNDQwOiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dFxyXG4gICAgLy8gICAgIH07XHJcbiAgICAvLyAgICAgcmV0dXJuIHtcclxuICAgIC8vICAgICAgICAgcmVzcG9uc2VFcnJvcjogZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgIC8vICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChzdGF0dXNEaWN0W3Jlc3BvbnNlLnN0YXR1c10sIHJlc3BvbnNlKTtcclxuICAgIC8vICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QocmVzcG9uc2UpXHJcbiAgICAvLyAgICAgICAgIH1cclxuICAgIC8vICAgICB9O1xyXG4gICAgLy8gfSk7XHJcblxyXG4gICAgLy8gYXBwLmNvbmZpZyhmdW5jdGlvbigkaHR0cFByb3ZpZGVyKSB7XHJcbiAgICAvLyAgICAgJGh0dHBQcm92aWRlci5pbnRlcmNlcHRvcnMucHVzaChbXHJcbiAgICAvLyAgICAgICAgICckaW5qZWN0b3InLFxyXG4gICAgLy8gICAgICAgICBmdW5jdGlvbigkaW5qZWN0b3IpIHtcclxuICAgIC8vICAgICAgICAgICAgIHJldHVybiAkaW5qZWN0b3IuZ2V0KCdBdXRoSW50ZXJjZXB0b3InKTtcclxuICAgIC8vICAgICAgICAgfVxyXG4gICAgLy8gICAgIF0pO1xyXG4gICAgLy8gfSk7XHJcblxyXG4gICAgLy8gYXBwLnNlcnZpY2UoJ0F1dGhTZXJ2aWNlJywgZnVuY3Rpb24oJGh0dHAsIFNlc3Npb24sICRyb290U2NvcGUsIEFVVEhfRVZFTlRTLCAkcSkge1xyXG5cclxuICAgIC8vICAgICBmdW5jdGlvbiBvblN1Y2Nlc3NmdWxMb2dpbihyZXNwb25zZSkge1xyXG4gICAgLy8gICAgICAgICB2YXIgZGF0YSA9IHJlc3BvbnNlLmRhdGE7XHJcbiAgICAvLyAgICAgICAgIFNlc3Npb24uY3JlYXRlKGRhdGEuaWQsIGRhdGEudXNlcik7XHJcbiAgICAvLyAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MpO1xyXG4gICAgLy8gICAgICAgICByZXR1cm4gZGF0YS51c2VyO1xyXG4gICAgLy8gICAgIH1cclxuXHJcbiAgICAvLyAgICAgLy8gVXNlcyB0aGUgc2Vzc2lvbiBmYWN0b3J5IHRvIHNlZSBpZiBhblxyXG4gICAgLy8gICAgIC8vIGF1dGhlbnRpY2F0ZWQgdXNlciBpcyBjdXJyZW50bHkgcmVnaXN0ZXJlZC5cclxuICAgIC8vICAgICB0aGlzLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgLy8gICAgICAgICByZXR1cm4gISFTZXNzaW9uLnVzZXI7XHJcbiAgICAvLyAgICAgfTtcclxuXHJcbiAgICAvLyAgICAgdGhpcy5nZXRMb2dnZWRJblVzZXIgPSBmdW5jdGlvbihmcm9tU2VydmVyKSB7XHJcblxyXG4gICAgLy8gICAgICAgICAvLyBJZiBhbiBhdXRoZW50aWNhdGVkIHNlc3Npb24gZXhpc3RzLCB3ZVxyXG4gICAgLy8gICAgICAgICAvLyByZXR1cm4gdGhlIHVzZXIgYXR0YWNoZWQgdG8gdGhhdCBzZXNzaW9uXHJcbiAgICAvLyAgICAgICAgIC8vIHdpdGggYSBwcm9taXNlLiBUaGlzIGVuc3VyZXMgdGhhdCB3ZSBjYW5cclxuICAgIC8vICAgICAgICAgLy8gYWx3YXlzIGludGVyZmFjZSB3aXRoIHRoaXMgbWV0aG9kIGFzeW5jaHJvbm91c2x5LlxyXG5cclxuICAgIC8vICAgICAgICAgLy8gT3B0aW9uYWxseSwgaWYgdHJ1ZSBpcyBnaXZlbiBhcyB0aGUgZnJvbVNlcnZlciBwYXJhbWV0ZXIsXHJcbiAgICAvLyAgICAgICAgIC8vIHRoZW4gdGhpcyBjYWNoZWQgdmFsdWUgd2lsbCBub3QgYmUgdXNlZC5cclxuXHJcbiAgICAvLyAgICAgICAgIGlmICh0aGlzLmlzQXV0aGVudGljYXRlZCgpICYmIGZyb21TZXJ2ZXIgIT09IHRydWUpIHtcclxuICAgIC8vICAgICAgICAgICAgIHJldHVybiAkcS53aGVuKFNlc3Npb24udXNlcik7XHJcbiAgICAvLyAgICAgICAgIH1cclxuXHJcbiAgICAvLyAgICAgICAgIC8vIE1ha2UgcmVxdWVzdCBHRVQgL3Nlc3Npb24uXHJcbiAgICAvLyAgICAgICAgIC8vIElmIGl0IHJldHVybnMgYSB1c2VyLCBjYWxsIG9uU3VjY2Vzc2Z1bExvZ2luIHdpdGggdGhlIHJlc3BvbnNlLlxyXG4gICAgLy8gICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgNDAxIHJlc3BvbnNlLCB3ZSBjYXRjaCBpdCBhbmQgaW5zdGVhZCByZXNvbHZlIHRvIG51bGwuXHJcbiAgICAvLyAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9zZXNzaW9uJykudGhlbihvblN1Y2Nlc3NmdWxMb2dpbikuY2F0Y2goZnVuY3Rpb24oKSB7XHJcbiAgICAvLyAgICAgICAgICAgICByZXR1cm4gbnVsbDtcclxuICAgIC8vICAgICAgICAgfSk7XHJcblxyXG4gICAgLy8gICAgIH07XHJcblxyXG4gICAgLy8gICAgIHRoaXMubG9naW4gPSBmdW5jdGlvbihjcmVkZW50aWFscykge1xyXG4gICAgLy8gICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2xvZ2luJywgY3JlZGVudGlhbHMpXHJcbiAgICAvLyAgICAgICAgICAgICAudGhlbihvblN1Y2Nlc3NmdWxMb2dpbilcclxuICAgIC8vICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbigpIHtcclxuICAgIC8vICAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHtcclxuICAgIC8vICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ0ludmFsaWQgbG9naW4gY3JlZGVudGlhbHMuJ1xyXG4gICAgLy8gICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgLy8gICAgICAgICAgICAgfSk7XHJcbiAgICAvLyAgICAgfTtcclxuXHJcbiAgICAvLyAgICAgdGhpcy5sb2dvdXQgPSBmdW5jdGlvbigpIHtcclxuICAgIC8vICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAvLyAgICAgICAgICAgICBTZXNzaW9uLmRlc3Ryb3koKTtcclxuICAgIC8vICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzKTtcclxuICAgIC8vICAgICAgICAgfSk7XHJcbiAgICAvLyAgICAgfTtcclxuICAgIC8vIH0pO1xyXG5cclxuICAgIC8vIGFwcC5zZXJ2aWNlKCdTZXNzaW9uJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMpIHtcclxuXHJcbiAgICAvLyAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG5cclxuICAgIC8vICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLCBmdW5jdGlvbigpIHtcclxuICAgIC8vICAgICAgICAgc2VsZi5kZXN0cm95KCk7XHJcbiAgICAvLyAgICAgfSk7XHJcblxyXG4gICAgLy8gICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCBmdW5jdGlvbigpIHtcclxuICAgIC8vICAgICAgICAgc2VsZi5kZXN0cm95KCk7XHJcbiAgICAvLyAgICAgfSk7XHJcblxyXG4gICAgLy8gICAgIHRoaXMuaWQgPSBudWxsO1xyXG4gICAgLy8gICAgIHRoaXMudXNlciA9IG51bGw7XHJcblxyXG4gICAgLy8gICAgIHRoaXMuY3JlYXRlID0gZnVuY3Rpb24oc2Vzc2lvbklkLCB1c2VyKSB7XHJcbiAgICAvLyAgICAgICAgIHRoaXMuaWQgPSBzZXNzaW9uSWQ7XHJcbiAgICAvLyAgICAgICAgIHRoaXMudXNlciA9IHVzZXI7XHJcbiAgICAvLyAgICAgfTtcclxuXHJcbiAgICAvLyAgICAgdGhpcy5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyAgICAgICAgIHRoaXMuaWQgPSBudWxsO1xyXG4gICAgLy8gICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xyXG4gICAgLy8gICAgIH07XHJcblxyXG4gICAgLy8gfSk7XHJcblxyXG59KSgpOyJdLCJmaWxlIjoiZnNhL2ZzYS1wcmUtYnVpbHQuanMifQ==
