'use strict';
window.app = angular.module('FullstackGeneratedApp', ['fsaPreBuilt', 'ui.router', 'ui.bootstrap', 'ngAnimate', 'ngCookies', 'yaru22.angular-timeago', 'satellizer', 'angularMoment', 'luegg.directives', 'ui-rangeSlider', 'ngSanitize', 'colorpicker.module']);
app.config(function($urlRouterProvider, $locationProvider, $uiViewScrollProvider, $httpProvider) { // This turns off hashbang urls (/#about) and changes it to something normal (/about)
	$locationProvider.html5Mode(true); // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
	$urlRouterProvider.otherwise('/'); // $uiViewScrollProvider.useAnchorScroll();
});
app.config(function($authProvider) {
	$authProvider.facebook({
		clientId: 'Facebook App ID'
	}); // Optional: For client-side use (Implicit Grant), set responseType to 'token'
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
	}); // redirectUri: window.location.origin+'/analytics'
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
	}); // No additional setup required for Twitter
	$authProvider.oauth2({
		name: 'foursquare',
		url: '/auth/foursquare',
		clientId: 'Foursquare Client ID',
		redirectUri: window.location.origin,
		authorizationEndpoint: 'https://foursquare.com/oauth2/authenticate'
	});
}); // This app.run is for controlling access to specific states.
app.run(function($rootScope, $window, $http, AuthService, $state, $uiViewScroll, SessionService, AppConfig) { // The given state requires an authenticated user.
	// var destinationStateRequiresAuth = function (state) {
	//     return state.data && state.data.authenticate;
	// };
	AppConfig.fetchConfig().then(function(res) { // console.log(res);
		AppConfig.setConfig(res.data); // console.log(AppConfig.isConfigParamsvailable);
	}); // $stateChangeStart is an event fired
	// whenever the process of changing a state begins.
	$rootScope.$on('$stateChangeStart', function(event, toState, toParams) {
		if (toState.name == 'reForReInteraction') {
			$rootScope.state = false;
		} else {
			$rootScope.state = true;
		} // if(toState = 'artistTools') {
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
app.directive('fbLike', ['$window', '$rootScope', function($window, $rootScope) {
	return {
		restrict: 'A',
		scope: {
			fbLike: '=?'
		},
		link: function link(scope, element, attrs) {
			if (!$window.FB) { // Load Facebook SDK if not already loaded
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
				if (!!attrs.fbLike && !scope.fbLike && !watchAdded) { // wait for data if it hasn't loaded yet
					watchAdded = true;
				var unbindWatch = scope.$watch('fbLike', function(newValue, oldValue) {
					if (newValue) {
							renderLikeButton(); // only need to run once
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
}]);
app.controller('FullstackGeneratedController', function($scope, $state, $http, mainService, SessionService) { /*Load More*/
	$scope.loadList = function() {
		$scope.$broadcast('loadTrades');
	};
	$scope.shownotification = false;
	$scope.logout = function() {
		mainService.logout();
	};
	$scope.adminlogout = function() {
		mainService.adminlogout();
	};
	$scope.checkNotification = function() {
		var user = SessionService.getUser();
		if (user) {
			return $http.get('/api/trades/withUser/' + user._id).then(function(res) {
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
			});
		}
	};
	$scope.linkedUsersChange = function(linkedUsers) {
		$scope.processing = true;
		$http.post('/api/logout').then(function() {
			$http.post("/api/login/thirdPartylogin", {
				username: linkedUsers.username,
				password: linkedUsers.password
			}).then(function(res) {
				if (res.data.user) {
					SessionService.create(res.data.user);
					location.reload();
				} else {
					$scope.processing = false;
					$.Zebra_Dialog("Wrong third party access credentials.", {
						onClose: function onClose() {
							$scope.processing = true;
							location.reload();
						}
					});
				}
			}).then(null, function(err) {
				$.Zebra_Dialog("Error in processing the request. Please try again.");
				$scope.processing = false;
			});
		});
	};
	$scope.checkNotification();
});
app.directive('fbLike', ['$window', '$rootScope', function($window, $rootScope) {
	return {
		restrict: 'A',
		scope: {
			fbLike: '=?'
		},
		link: function link(scope, element, attrs) {
			if (!$window.FB) { // Load Facebook SDK if not already loaded
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
				if (!!attrs.fbLike && !scope.fbLike && !watchAdded) { // wait for data if it hasn't loaded yet
					watchAdded = true;
				var unbindWatch = scope.$watch('fbLike', function(newValue, oldValue) {
					if (newValue) {
							renderLikeButton(); // only need to run once
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
}]);
app.directive('fileread', [function() {
	return {
		scope: {
			fileread: '=',
			message: '='
		},
		link: function link(scope, element, attributes) {
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
	};
}]);
app.service('mainService', function($http, SessionService) { // this.openHelpModal = function() {
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
	};
	this.adminlogout = function() {
		$http.post('/api/logout').then(function() {
			SessionService.deleteUser();
			window.location.href = '/admin';
		});
	};
}); /*Load more*/
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
app.service('accountService', ['$http', function($http) {
	function deleteUserAccount(id) {
		return $http({
			method: 'put',
			url: '/api/database/deleteUserAccount/' + id
		}).then(function(response) {
			return response.data;
		});
	}
	return {
		deleteUserAccount: deleteUserAccount
	};
}]);
app.service('customizeService', ['$http', function($http) {
	function addCustomize(data) {
		return $http.post('/api/customsubmissions/addCustomSubmission', data);
	}

	function uploadFile(data) {
		var fd = new FormData();
		fd.append('file', data);
		return $http({
			method: 'POST',
			url: '/api/aws',
			headers: {
				'Content-Type': undefined
			},
			tranformRequest: angular.identify,
			data: fd
		}).then(function(response) {
			console.log("service res", response);
			return response.data;
		});
	}

	function getCustomPageSettings(userID) {
		return $http({
			method: 'GET',
			url: '/api/customsubmissions/getCustomSubmission/' + userID
		}).then(function(response) {
			return response.data;
		});
	}
	return {
		addCustomize: addCustomize,
		uploadFile: uploadFile,
		getCustomPageSettings: getCustomPageSettings
	};
}]);
app.config(function($stateProvider) {
	$stateProvider.state('database', {
		url: '/admin/database',
		templateUrl: 'js/database/database.html',
		controller: 'DatabaseController'
	});
});
app.directive('notificationBar', ['socket', function(socket) {
	return {
		restrict: 'EA',
		scope: true,
		template: '<div style="margin: 0 auto;width:50%" ng-show="bar.visible">' + '<uib-progress><uib-bar value="bar.value" type="{{bar.type}}"><span>{{bar.value}}%</span></uib-bar></uib-progress>' + '</div>',
		link: function link($scope, iElm, iAttrs, controller) {
			socket.on('notification', function(data) {
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
app.controller('DatabaseController', function($rootScope, $state, $scope, $http, AuthService, SessionService, socket) {
	if (!SessionService.getUser()) {
		$state.go('admin');
	}
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
	$scope.logout = function() {
		$http.get('/api/logout').then(function() {
			SessionService.deleteUser();
			window.location.href = '/admin';
		})['catch'](function(err) {
			$scope.processing = false;
			$.Zebra_Dialog('Wrong Password');
		});
	};
	$scope.saveAddUser = function() {
		$scope.processing = true;
		$scope.addUser.password = $rootScope.password;
		$http.post('/api/database/adduser', $scope.addUser).then(function(res) {
			$.Zebra_Dialog("Success: Database is being populated. You will be emailed when it is complete.");
			$scope.processing = false;
			$scope.bar.visible = true;
		})['catch'](function(err) {
			$.Zebra_Dialog('Bad submission');
			$scope.processing = false;
		});
	};
	$scope.createUserQueryDoc = function() {
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
			query.columns = $scope.queryCols.filter(function(elm) {
				return elm.value !== null;
			}).map(function(elm) {
				return elm.value;
			});
		}
		if ($scope.query.trackedUsersURL) query.trackedUsersURL = $scope.query.trackedUsersURL;
		var body = {
			query: query,
			password: $rootScope.password
		};
		$scope.processing = true;
		$http.post('/api/database/followers', body).then(function(res) {
			$scope.filename = res.data;
			$scope.downloadButtonVisible = true;
			$scope.processing = false;
		}).then(null, function(err) {
			$.Zebra_Dialog("ERROR: Bad Query or No Matches");
			$scope.processing = false;
		});
	};
	$scope.createTrdUsrQueryDoc = function() {
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
		$http.post('/api/database/trackedUsers', body).then(function(res) {
			$scope.trdUsrFilename = res.data;
			$scope.downloadTrdUsrButtonVisible = true;
			$scope.processing = false;
		}).then(null, function(err) {
			$.Zebra_Dialog("ERROR: Bad Query or No Matches");
			$scope.processing = false;
		});
	};
	$scope.download = function(filename) {
		var anchor = angular.element('<a/>');
		anchor.attr({
			href: filename,
			download: filename
		})[0].click();
		$scope.downloadButtonVisible = false;
		$scope.downloadTrdUsrButtonVisible = false;
	};
	$scope.savePaidRepostChannel = function() {
		$scope.processing = true;
		$http.post('/api/database/paidrepost', $scope.paidRepost).then(function(res) {
			$scope.paidRepost = {
				soundCloudUrl: ''
			};
			$.Zebra_Dialog("SUCCESS: Url saved successfully");
			$scope.processing = false;
		}).then(null, function(err) {
			$.Zebra_Dialog("ERROR: Error in saving url");
			$scope.processing = false;
		});
	}; /* Listen to socket events */
	socket.on('notification', function(data) {
		var percentage = parseInt(Math.floor(data.counter / data.total * 100), 10);
		$scope.bar.value = percentage;
		if (percentage === 100) {
			$scope.statusBarVisible = false;
			$scope.bar.value = 0;
		}
	});
});
(function() {
	'use strict'; // Hope you didn't forget Angular! Duh-doy.
	if (!window.angular) throw new Error('I can\'t find Angular!');
	var app = angular.module('fsaPreBuilt', []);
	app.factory('initSocket', function() {
		if (!window.io) throw new Error('socket.io not found!');
		return window.io(window.location.origin);
	});
	app.factory('socket', function($rootScope, initSocket) {
		return {
			on: function on(eventName, callback) {
				initSocket.on(eventName, function() {
					var args = arguments;
					$rootScope.$apply(function() {
						callback.apply(initSocket, args);
					});
				});
			},
			emit: function emit(eventName, data, callback) {
				initSocket.emit(eventName, data, function() {
					var args = arguments;
					$rootScope.$apply(function() {
						if (callback) {
							callback.apply(initSocket, args);
						}
					});
				});
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
		}

		function getConfig() {
			return _configParams;
		}
		return {
			fetchConfig: fetchConfig,
			getConfig: getConfig,
			setConfig: setConfig
		};
	}); // AUTH_EVENTS is used throughout our app to
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
app.config(function($stateProvider) {
	$stateProvider.state('admin', {
		url: '/admin',
		templateUrl: 'js/login/login.html',
		controller: 'AdminLoginController'
	});
});
app.controller('AdminLoginController', function($rootScope, $state, $scope, $http, AuthService, SessionService, $window) {
	$scope.counter = 0;
	$scope.showingElements = [];
	$scope.submissions = [];
	$scope.loginObj = {};
	$scope.isLoggedIn = SessionService.getUser() ? true : false;
	if ($scope.isLoggedIn) {
		$state.go('submissions');
	}
	$scope.login = function() {
		$scope.message = {
			val: '',
			visible: false
		};
		AuthService.login($scope.loginObj).then(handleLoginResponse)['catch'](handleLoginError);

		function handleLoginResponse(res) {
			if (res.status === 200 && res.data.success) {
				SessionService.create(res.data.user);
				$state.go('submissions');
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
	$scope.logout = function() {
		$http.get('/api/logout').then(function() {
			SessionService.deleteUser();
			window.location.href = '/admin';
		})['catch'](function(err) {
			$scope.processing = false;
			$.Zebra_Dialog('Wrong Password');
		});
	}; // $scope.manage = function() {
	//   $scope.processing = true;
	//   SC.connect()
	//     .then(function(res) {
	//       $rootScope.accessToken = res.oauth_token;
	//       return $http.post('/api/login/authenticated', {
	//         token: res.oauth_token,
	//         password: $rootScope.password,
	//       })
	//     })
	//     .then(function(res) {
	//       $scope.processing = false;
	//       $rootScope.schedulerInfo = res.data;
	//       $rootScope.schedulerInfo.events.forEach(function(ev) {
	//         ev.day = new Date(ev.day);
	//       });
	//       $state.go('scheduler');
	//     })
	//     .then(null, function(err) {
	//       $.Zebra_Dialog('Error: Could not log in');
	//       $scope.processing = false;
	//     });
	// }
});
app.config(function($stateProvider) {
	$stateProvider.state('mixingMastering', {
		url: '/mixingMastering',
		templateUrl: 'js/mixingMastering/mixingMastering.html',
		controller: 'mixingMasteringController'
	});
});
app.controller('mixingMasteringController', function($rootScope, $state, $scope, $http, MixingMasteringService) {
	$scope.mixingMastering = {};
	$scope.processing = false;
	$scope.saveMixingMastering = function() {
		if (!$scope.mixingMastering.file || !$scope.mixingMastering.email || !$scope.mixingMastering.name || !$scope.mixingMastering.comment) {
			$.Zebra_Dialog("Please fill in all fields");
		} else {
			var receiveResponse = function receiveResponse(res) {
				$scope.processing = false;
				if (res.status === 200) {
					$scope.mixingMastering = {};
					angular.element("input[type='file']").val(null);
					$.Zebra_Dialog("Thank you! Your request has been submitted successfully.");
					return;
				}
				$.Zebra_Dialog("Error in processing the request. Please try again.");
			};
			var catchError = function catchError(res) {
				$scope.processing = false;
				$.Zebra_Dialog("Error in processing the request. Please try again.");
			};
			$scope.processing = true;
			$scope.message.visible = false;
			var data = new FormData();
			for (var prop in $scope.mixingMastering) {
				data.append(prop, $scope.mixingMastering[prop]);
			}
			MixingMasteringService.saveMixingMastering(data).then(receiveResponse)['catch'](catchError);
		}
	};
});
app.config(function($stateProvider) {
	$stateProvider.state('pay', {
		url: '/pay/:submissionID',
		templateUrl: 'js/pay/pay.html',
		controller: 'PayController',
		resolve: {
			submission: function submission($http, $stateParams) {
				return $http.get('/api/submissions/withID/' + $stateParams.submissionID).then(function(res) {
					console.log(res.data);
					return res.data;
				});
			},
			channels: function channels($http, submission) {
				return submission.channels; // return $http.get('/api/users/getChannels')
				// .then(function(res) {
				//   return res.data;
				// })
			},
			track: function track(submission) {
				return SC.get('/tracks/' + submission.trackID).then(function(track) {
					return track;
				});
			}
		}
	});
});
app.filter('calculateDiscount', function() {
	return function(input) {
		return parseFloat(input * 0.90).toFixed(2);
	};
});
app.controller('PayController', function($scope, $rootScope, $http, channels, submission, track, $state, $uibModal) {
	$rootScope.submission = submission;
	console.log(channels);
	$scope.auDLLink = false;
	if (submission.paid) $state.go('home');
	$scope.track = track;
	SC.oEmbed(submission.trackURL, {
		element: document.getElementById('scPlayer'),
		auto_play: false,
		maxheight: 150
	});
	$scope.total = 0;
	$scope.showTotal = 0;
	$scope.channels = channels; // $scope.channels = channels.filter(function(ch) {
	//   if (ch.soundcloud.followers) ch.price = parseFloat(ch.soundcloud.followers / 3000.0);
	//   return (submission.channelIDS.indexOf(ch.soundcloud.id) != -1)
	// });
	//console.log(submission.channelIDS);
	//console.log($scope.channels);
	$scope.auDLLink = $scope.track.purchase_url ? $scope.track.purchase_url.indexOf("artistsunlimited.co") != -1 : false; //console.log($scope.auDLLink);
	$scope.goToLogin = function() {
		$state.go('login', {
			'submission': $rootScope.submission
		});
	};
	$scope.makePayment = function() { //console.log('ay');
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
	} else {
		$.Zebra_Dialog('Please add a repost to your cart by clicking "Add To Cart".');
	}
};
$scope.continuePay = function(discounted) {
	if ($scope.discountedModal) {
		$scope.discountModalInstance.close();
	}
	$scope.processing = true;
	if (discounted) $scope.showTotal = parseFloat($scope.total * 0.9).toFixed(2);
	else $scope.showTotal = parseFloat($scope.total).toFixed(2);
	var pricingObj = {
		total: $scope.showTotal,
		submission: $rootScope.submission,
		channels: $scope.channels.filter(function(ch) {
			return ch.addtocart;
		})
	};
	$http.post('/api/submissions/getPayment', pricingObj).then(function(res) {
		window.location = res.data;
	});
};
$scope.addToCart = function(channel) {
	if (channel.addtocart) {
		$scope.total = $scope.total - parseFloat(channel.price);
	} else {
		$scope.total += parseFloat(channel.price);
	}
	channel.addtocart = channel.addtocart ? false : true;
	if ($scope.auDLLink) $scope.showTotal = parseFloat($scope.total * 0.9).toFixed(2);
	else $scope.showTotal = parseFloat($scope.total).toFixed(2);
};
});
app.controller('discountModalController', function($scope) {});
app.config(function($stateProvider) {
	$stateProvider.state('complete', {
		url: '/complete',
		templateUrl: 'js/pay/thankyou.html',
		controller: 'ThankyouController'
	});
});
app.controller('ThankyouController', function($http, $scope, $location) {
	$scope.processing = true;
	$scope.notified = false;
	$http.put('/api/submissions/completedPayment', $location.search()).then(function(res) {
		console.log(res.data);
		$scope.processing = false;
		$scope.submission = res.data.submission;
		if (res.data.status == 'notify') {
			$scope.notified = true;
			$scope.events = [];
		} else {
			$scope.events = res.data.events;
			$scope.events.forEach(function(ev) {
				ev.date = new Date(ev.date);
			});
		}
	}).then(null, function(err) {
		$.Zebra_Dialog('There was an error processing your request');
	});
});
app.config(function($stateProvider) {
	$stateProvider.state('prPlans', {
		url: '/prPlans',
		templateUrl: 'js/prPlans/prPlans.html',
		controller: 'prPlansController'
	});
});
app.controller('prPlansController', function($rootScope, $state, $scope, $http, PrPlanService) {
	$scope.prPlans = {};
	$scope.processing = false;
	$scope.openSocialDialog = function(type) {
		var displayText = "";
		if (type == 'Youtube') displayText = "Like SoundCloud, we premiere tracks to genre-specific  audiences. We work closely with an array of well-established YouTube channels for premieres. Approaches to promotion vary across different social media platforms and requires a nuanced understanding of each.";
		if (type == 'Blog Outreach') displayText = "When releasing a song, it is important to keep in mind  the manner in which  blogs can affect one's reach. The blogs we work with curate music with a specific audience in mind, tending to be committed readers. We have cultivated relationships with the faces behind various blogs, and we are fortunate to have their continued support of our content.";
		if (type == 'Spotify') displayText = 'The third and final platform in which we can assist with releasing music is Spotify. Spotify is an online music platform which pays artist per stream. Spotify at the core is also a substantial way for artists to be heard. There are over 100 Million users worldwide  and as one of the major online music platforms, we will do our best to get your track in as many playlists as possible.';
		if (type == 'Soundcloud') displayText = "We facilitate premieres over our network of over six SoundCloud channels, working closely with every artist to ensure that the network genre matches the feel of their track. Though we have had better results premiering content from our various network pages, we are also able to also make the track available on the artist's personal profile and promote the track from there. We remain flexible with many of these aspects and tailor each campaign to the respective goals of the artist.";
		$.Zebra_Dialog(displayText, {
			width: 600
		});
	};
	$scope.savePrPlan = function() {
		if (!$scope.prPlans.file || !$scope.prPlans.email || !$scope.prPlans.name || !$scope.prPlans.budget) {
			$.Zebra_Dialog("Please fill in all fields");
		} else {
			var receiveResponse = function receiveResponse(res) {
				$scope.processing = false;
				if (res.status === 200) {
					$scope.prPlans = {};
					angular.element("input[type='file']").val(null);
					$.Zebra_Dialog("Thank you! Your request has been submitted successfully.");
					return;
				}
				$.Zebra_Dialog("Error in processing the request. Please try again.");
			};
			var catchError = function catchError(res) {
				$scope.processing = false;
				$.Zebra_Dialog("Error in processing the request. Please try again.");
			};
			$scope.processing = true;
			$scope.message.visible = false;
			var data = new FormData();
			for (var prop in $scope.prPlans) {
				data.append(prop, $scope.prPlans[prop]);
			}
			PrPlanService.savePrPlan(data).then(receiveResponse)['catch'](catchError);
		}
	};
});
app.config(function($stateProvider) {
	$stateProvider.state('scheduler', {
		url: '/admin/scheduler',
		templateUrl: 'js/scheduler/scheduler.html',
		controller: 'SchedulerController'
	});
});
app.controller('SchedulerController', function($rootScope, $state, $scope, $http, AuthService, SessionService, $window) {
	if (!SessionService.getUser()) {
		$state.go('admin');
	}
	$scope.makeEventURL = "";
	$scope.showOverlay = false;
	var info = $rootScope.schedulerInfo;
	if (!info) {
		$state.go('admin');
	}
	$scope.channel = info.channel;
	if (!$scope.channel) {
		$state.go('admin');
	}
	$scope.logout = function() {
		$http.get('/api/logout').then(function() {
			SessionService.deleteUser();
			window.location.href = '/admin';
		})['catch'](function(err) {
			$scope.processing = false;
		});
	};
	$scope.submissions = info.submissions;
	$scope.dayIncr = 0;
	$scope.back = function() {
		window.location.reload();
	};
	$scope.saveChannel = function() {
		$scope.processing = true;
		$scope.channel.password = $rootScope.password;
		$http.put("/api/channels", $scope.channel).then(function(res) {
			$.Zebra_Dialog("Saved");
			$scope.channel = res.data;
			$scope.processing = false;
		}).then(null, function(err) {
			$.Zebra_Dialog("Error: did not save");
			$scope.processing = false;
		});
	};
	$scope.incrDay = function() {
		if ($scope.dayIncr < 14) $scope.dayIncr++;
	};
	$scope.decrDay = function() {
		if ($scope.dayIncr > 0) $scope.dayIncr--;
	};
	$scope.clickedSlot = function(day, hour) {
		var today = new Date();
		if (today.toLocaleDateString() == day.toLocaleDateString() && today.getHours() > hour) return;
		$scope.showOverlay = true;
		var calDay = {};
		var calendarDay = $scope.calendar.find(function(calD) {
			return calD.day.toLocaleDateString() == day.toLocaleDateString();
		});
		$scope.makeEventURL = undefined;
		$scope.makeEvent = calendarDay.events[hour];
		console.log($scope.makeEvent);
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
			$scope.makeEventURL = $scope.makeEvent.trackURL;
			SC.oEmbed($scope.makeEventURL, {
				element: document.getElementById('scPlayer'),
				auto_play: false,
				maxheight: 150
			});
			$scope.newEvent = false;
		}
	};
	$scope.changePaid = function() {
		$scope.makeEvent.title = undefined;
		$scope.makeEvent.trackURL = undefined;
		$scope.makeEvent.artistName = undefined;
		$scope.makeEvent.trackID = undefined;
		$scope.makeEventURL = undefined;
	};
	$scope.changeURL = function() {
		if ($scope.makeEventURL != "") {
			$scope.processing = true;
			$http.post('/api/soundcloud/resolve', {
				url: $scope.makeEventURL
			}).then(function(res) {
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
			}).then(null, function(err) {
				$.Zebra_Dialog("We are not allowed to access tracks by this artist with the Soundcloud API. We apologize for the inconvenience, and we are working with Soundcloud to resolve this issue.");
				document.getElementById('scPlayer').style.visibility = "hidden";
				$scope.notFound = true;
				$scope.processing = false;
			});
		}
	};
	$scope.deleteEvent = function() {
		if (!$scope.newEvent) {
			$scope.processing = true;
			$http['delete']('/api/events/' + $scope.makeEvent._id).then(function(res) {
				var calendarDay = $scope.calendar.find(function(calD) {
					return calD.day.toLocaleDateString() == $scope.makeEvent.day.toLocaleDateString();
				});
				calendarDay.events[$scope.makeEvent.day.getHours()] = "-";
				$scope.showOverlay = false;
				$scope.processing = false;
				$.Zebra_Dialog("Deleted");
			}).then(null, function(err) {
				$scope.processing = false;
				$.Zebra_Dialog("ERROR: did not Delete.");
			});
		} else {
			var calendarDay = $scope.calendar.find(function(calD) {
				return calD.day.toLocaleDateString() == $scope.makeEvent.day.toLocaleDateString();
			});
			calendarDay.events[$scope.makeEvent.getHours()] = "-";
			var events;
			$scope.showOverlay = false;
		}
	};
	$scope.saveEvent = function() {
		if (!$scope.makeEvent.trackID && !$scope.makeEvent.paid) {
			$.Zebra_Dialog("Enter a track URL");
		} else {
			if ($scope.newEvent) {
				$scope.makeEvent.password = $rootScope.password;
				$scope.processing = true;
				$http.post('/api/events', $scope.makeEvent).then(function(res) {
					var event = res.data;
					event.day = new Date(event.day);
					var calendarDay = $scope.calendar.find(function(calD) {
						return calD.day.toLocaleDateString() == event.day.toLocaleDateString();
					});
					calendarDay.events[event.day.getHours()] = event;
					$scope.showOverlay = false;
					$scope.processing = false;
					$.Zebra_Dialog("Saved");
				}).then(null, function(err) {
					$scope.processing = false;
					$.Zebra_Dialog("ERROR: did not Save.");
				});
			} else {
				$scope.newEvent.password = $rootScope.password;
				$scope.processing = true;
				$http.put('/api/events', $scope.makeEvent).then(function(res) {
					var event = res.data;
					event.day = new Date(event.day);
					var calendarDay = $scope.calendar.find(function(calD) {
						return calD.day.toLocaleDateString() == event.day.toLocaleDateString();
					});
					calendarDay.events[event.getHours()] = event;
					$scope.showOverlay = false;
					$scope.processing = false;
					$.Zebra_Dialog("Saved");
				}).then(null, function(err) {
					$scope.processing = false;
					$.Zebra_Dialog("ERROR: did not Save.");
				});
			}
		}
	};
	$scope.emailSlot = function() {
		var mailto_link = "mailto:coayscue@gmail.com?subject=Repost of " + $scope.makeEvent.title + '&body=Hey,\n\n I am reposting your song ' + $scope.makeEvent.title + ' on ' + $scope.channel.displayName + ' on ' + $scope.makeEvent.day.toLocaleDateString() + '.\n\n Best, \n' + $scope.channel.displayName;
		location.href = encodeURI(mailto_link);
	}; // $scope.scEmailSlot = function() {
	// }
	$scope.backEvent = function() {
		$scope.makeEvent = null;
		$scope.showOverlay = false;
	};
	$scope.removeQueueSong = function(index) {
		$scope.channel.queue.splice(index, 1);
		$scope.saveChannel();
	};
	$scope.addSong = function() {
		if ($scope.channel.queue.indexOf($scope.newQueueID) != -1) return;
		$scope.channel.queue.push($scope.newQueueID);
		$scope.saveChannel();
		$scope.newQueueSong = undefined;
		$scope.changeQueueSong();
		$scope.loadQueueSongs([$scope.newQueueID]);
	};
	$scope.changeQueueSong = function() {
		if ($scope.newQueueSong != "") {
			$scope.processing = true;
			$http.post('/api/soundcloud/resolve', {
				url: $scope.newQueueSong
			}).then(function(res) {
				$scope.processing = false;
				var track = res.data;
				$scope.newQueueID = track.id;
			}).then(null, function(err) {
				$.Zebra_Dialog("error getting song");
				$scope.processing = false;
			});
		}
	};
	$scope.moveUp = function(index) {
		if (index == 0) return;
		var s = $scope.channel.queue[index];
		$scope.channel.queue[index] = $scope.channel.queue[index - 1];
		$scope.channel.queue[index - 1] = s;
		$scope.saveChannel();
		$scope.loadQueueSongs([$scope.channel.queue[index], $scope.channel.queue[index - 1]]);
	};
	$scope.moveDown = function(index) {
		if (index == $scope.channel.queue.length - 1) return;
		var s = $scope.channel.queue[index];
		$scope.channel.queue[index] = $scope.channel.queue[index + 1];
		$scope.channel.queue[index + 1] = s;
		$scope.saveChannel();
		$scope.loadQueueSongs([$scope.channel.queue[index], $scope.channel.queue[index + 1]]);
	}; // $scope.canLowerOpenEvents = function() {
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
	$scope.loadSubmissions = function() {
		setTimeout(function() {
			$scope.submissions.forEach(function(sub) {
				SC.oEmbed("http://api.soundcloud.com/tracks/" + sub.trackID, {
					element: document.getElementById(sub.trackID + "player"),
					auto_play: false,
					maxheight: 150
				});
			});
		}, 50);
	};
	$scope.loadQueueSongs = function(queue) {
		setTimeout(function() {
			queue.forEach(function(songID) {
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
	$scope.dayOfWeekAsString = function(date) {
		var dayIndex = date.getDay();
		return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex];
	};
	$scope.fillDateArrays = function(events) {
		var calendar = [];
		var today = new Date();
		for (var i = 0; i < 21; i++) {
			var calDay = {};
			calDay.day = new Date();
			calDay.day.setDate(today.getDate() + i);
			var dayEvents = events.filter(function(ev) {
				return ev.day.toLocaleDateString() == calDay.day.toLocaleDateString();
			});
			var eventArray = [];
			for (var j = 0; j < 24; j++) {
				eventArray[j] = "-";
			}
			dayEvents.forEach(function(ev) {
				eventArray[ev.day.getHours()] = ev;
			});
			calDay.events = eventArray;
			calendar.push(calDay);
		}
		return calendar;
	};
	$scope.calendar = $scope.fillDateArrays(info.events);
});
app.config(function($stateProvider) {
	$stateProvider.state('submitSong', {
		url: '/submit',
		templateUrl: 'js/submit/submit.view.html',
		controller: 'SubmitSongController'
	});
});
app.controller('SubmitSongController', function($rootScope, $state, $scope, $http) {
	$scope.submission = {};
	$scope.userID = "";
	$scope.genreArray = ['Alternative Rock', 'Ambient', 'Creative', 'Chill', 'Classical', 'Country', 'Dance & EDM', 'Dancehall', 'Deep House', 'Disco', 'Drum & Bass', 'Dubstep', 'Electronic', 'Festival', 'Folk', 'Hip-Hop/RNB', 'House', 'Indie/Alternative', 'Latin', 'Trap', 'Vocalists/Singer-Songwriter'];
	$scope.urlChange = function() {
		if ($scope.url != "") {
			$scope.processing = true;
			$http.post('/api/soundcloud/resolve', {
				url: $scope.url
			}).then(function(res) {
				if (res.data.kind != "track") throw new Error('');
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
			}).then(null, function(err) {
				if (err.status != 403) {
					$.Zebra_Dialog("We are not allowed to access tracks by this artist with the Soundcloud API. We apologize for the inconvenience, and we are working with Soundcloud to resolve this issue.");
					$scope.notFound = true;
				} else {
					$scope.submission.trackURL = $scope.url;
					SC.oEmbed($scope.submission.trackURL, {
						element: document.getElementById('scPlayer'),
						auto_play: false,
						maxheight: 150
					});
				}
				$scope.submission.trackID = null;
				$scope.processing = false;
				document.getElementById('scPlayer').style.visibility = "hidden";
			});
		}
	};
	$scope.submit = function() {
		if (!$scope.submission.email || !$scope.submission.name) {
			$.Zebra_Dialog("Please fill in all fields");
		} else {
			$scope.processing = true;
			$http.post('/api/submissions', {
				email: $scope.submission.email,
				trackID: $scope.submission.trackID,
				name: $scope.submission.name,
				title: $scope.submission.title,
				trackURL: $scope.submission.trackURL,
				channelIDS: [],
				invoiceIDS: [],
				userID: $scope.userID,
				genre: $scope.submission.genre
			}).then(function(res) {
				$.Zebra_Dialog("Your song has been submitted and will be reviewed soon.");
				$scope.processing = false;
				$scope.notFound = false;
				$scope.submission = {};
				document.getElementById('scPlayer').style.visibility = "hidden";
				$scope.url = "";
			}).then(null, function(err) {
				$scope.processing = false;
				$.Zebra_Dialog("Error: Could not submit song.");
			});
		}
	};
	$scope.getUserID = function() {
		$http.get('/api/users/getUserID').then(function(res) {
			$scope.userID = res.data;
		});
	};
});
app.config(function($stateProvider) {
	$stateProvider.state('accounts', {
		url: '/admin/accounts',
		templateUrl: 'js/accounts/views/accounts.html',
		controller: 'accountsController'
	});
});
app.controller('accountsController', function($rootScope, $state, $scope, $http, AuthService, SessionService, $sce, accountService) {
	if (!SessionService.getUser()) {
		$state.go('admin');
	}
	$scope.user = SessionService.getUser();
	$scope.soundcloudLogin = function() {
		$scope.processing = true;
		SC.connect().then(function(res) {
			$rootScope.accessToken = res.oauth_token;
			return $http.post('/api/login/soundCloudAuthentication', {
				token: res.oauth_token
			});
		}).then(function(res) {
			var scInfo = res.data.user.soundcloud;
			scInfo.group = "";
			scInfo.price = 0;
			$http.post('/api/database/updateUserAccount', {
				soundcloudInfo: scInfo
			}).then(function(user) {
				$scope.processing = false;
				location.reload();
			});
		}).then(null, function(err) {
			$.Zebra_Dialog('Error: Could not log in');
			$scope.processing = false;
		});
	};
	$scope.deletePaidRepost = function(index) {
		$.Zebra_Dialog('Do you really want to delete this account?', {
			'buttons': [{
				caption: 'Yes',
				callback: function callback() {
					var postRepost = $scope.user.paidRepost[index].id;
					accountService.deleteUserAccount(postRepost).then(function(res) {
						$scope.user.paidRepost.splice(index, 1);
					});
				}
			}, {
				caption: 'No',
				callback: function callback() {}
			}]
		});
	};
	$scope.updateGroup = function(account) {
		$scope.processing = true;
		$http.post('/api/database/updateGroup', {
			paidRepost: $scope.user.paidRepost
		}).then(function(res) {
			$scope.processing = false;
			SessionService.create(res.data);
			$scope.user = SessionService.getUser();
		});
	};
});
app.config(function($stateProvider) {
	$stateProvider.state('artistToolsAnalytics', {
		url: '/analytics',
		params: {
			submission: null
		},
		templateUrl: 'js/artistTools/Analytics/analytics.html',
		controller: 'artistToolsAnalytics'
	});
});
app.controller("artistToolsAnalytics", function($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, $auth, SessionService, ArtistToolsService) {
	$scope.user = SessionService.getUser();
	if (!SessionService.getUser()) {
		$state.go('login');
	} else {
		$window.localStorage.removeItem('returnstate');
		$window.localStorage.removeItem('tid');
	}
	$scope.authFacbook = function(id, days) {
		if (id) { //calling for registration !
			alert("registering Channel, please refresh after few moments to load analytics data");
			return $http({
				method: 'POST',
				url: '/api/analytics/facebook',
				data: {
					pageid: id.id
				}
			}).then(function(success) {
				$scope.showFacebookPages = false;
				delete $scope.facebookPages;
				console.log(success);
				$scope.authFacbook();
			}, function(error) {
				console.log(error);
			});
		}
		$scope.enableGraph = false;
		$http({
			method: 'POST',
			url: '/api/analytics/facebook',
			data: {
				day_limit: days
			}
		}).success(function(success_http) {
			$scope.displayError = false;
			$scope.daysCallbackFunction = 'authFacbook';
			$scope.showDayChanger = true;
			$scope.graph_data = success_http;
			$scope.enableGraph = true;
		}).error(function() {
			FB.login(function(response_token, success) {
				if (!response_token.authResponse) return console.log("User did not authorize fully!");
				$http({
					method: 'POST',
					url: '/api/analytics/facebook',
					data: {
						access_token: response_token.authResponse.accessToken
					}
				}).success(function(response) {
					$scope.facebookPages = response.pages;
					$scope.showFacebookPages = true;
				}).error(function(error) {
					alert("Error while registering page :" + error);
				}); //$scope.accessToken = response_token.accessToken;
			}, {
				scope: 'pages_show_list,user_likes'
			});
		});
	};
	$scope.authTwitter = function(acccess_key, days) {
		$scope.showDayChanger = false;
		$scope.enableGraph = false;
		$http({
			method: 'POST',
			url: '/api/analytics/twitter',
			data: {
				day_limit: days
			}
		}).then(function(success) {
			$scope.daysCallbackFunction = 'authTwitter';
			$scope.showDayChanger = true;
			$scope.graph_data = success.data;
			$scope.enableGraph = true;
		}, function(failure) {
			$auth.authenticate('twitter').then(function(success_twitter) {
				$http({
					method: 'POST',
					url: '/api/analytics/twitter',
					data: {
						access_token_key: success_twitter.data.oauth_token,
						access_token_secret: success_twitter.data.oauth_token_secret,
						screen_name: success_twitter.data.screen_name
					}
				}).then(function(success) {
					$scope.showFollowers = false;
					$scope.authTwitter();
				}, function(error) {
					console.log(error);
				});
			});
		});
	};
	$scope.authInstagram = function(channelId, days) {
		$scope.showDayChanger = false;
		$scope.enableGraph = false;
		$http({
			method: 'POST',
			url: '/api/analytics/instagram',
			data: {
				day_limit: days
			}
		}).then(function(success) {
			$scope.daysCallbackFunction = 'authInstagram';
			$scope.showDayChanger = true;
			$scope.graph_data = success.data;
			$scope.enableGraph = true;
		}, function(failure) {
			$auth.authenticate('instagram').then(function(success) {
				$http({
					method: 'POST',
					url: '/api/analytics/instagram',
					data: {
						access_token: success.access_token
					}
				}).then(function(success) {
					$scope.authInstagram();
				}, function(failure) {
					return console.log("<authInstagram>failed when trying to register user" + JSON.stringify(failure));
				});
			}, function(failure) {
				console.log("failure while authentication of instagram" + JSON.stringify(failure));
			});
		});
	};
	$scope.authYoutube = function(channelId, days) {
		$scope.showDayChanger = false;
		if (channelId) { //calling for registration !
			alert("registering Channel, please refresh after few moments to load analytics data");
			return $http({
				method: 'POST',
				url: '/api/analytics/youtube/stats',
				data: {
					register: true,
					channelId: channelId
				}
			}).then(function(success) {
				$scope.showYoutubeChannel = false;
				delete $scope.youtubeChannel;
				console.log(success);
				$scope.authYoutube();
			}, function(error) {
				console.log(error);
			});
		}
		$scope.enableGraph = false;
		$http({
			method: 'POST',
			url: '/api/analytics/youtube/stats',
			data: {
				day_limit: days
			}
		}).success(function(success_http) {
			$scope.displayError = false;
			$scope.daysCallbackFunction = 'authYoutube';
			$scope.showDayChanger = true;
			$scope.graph_data = success_http;
			$scope.enableGraph = true;
		}).error(function() {
			$auth.authenticate('google').then(function(success) {
				$scope.youtubeChannel = success.data;
				$scope.showYoutubeChannel = true;
			}, function(failure) {
				console.log("failed from authorization server>>>>" + JSON.stringify(failure));
			});
		});
	};
	$scope.alert = function(data) {
		alert(data);
	};
});
app.controller('graphControler', function($scope) { // $scope.data = [{
	//     key: "Cumulative Return",
	//     values: value_array
	// }];
	$scope.options = {
		margin: {
			top: 20
		},
		series: [{
			axis: "y",
			dataset: "timed",
			key: "val_0",
			label: "Analytics data",
			color: "hsla(88, 48%, 48%, 1)",
			type: ["line"],
			id: "mySeries0"
		}],
		axes: {
			x: {
				key: "x",
				type: "date"
			}
		}
	};
	$scope.data = {
		timed: []
	};
	for (var local_data in $scope.graph_data) {
		$scope.data.timed.push({
			x: local_data,
			val_0: $scope.graph_data[local_data]
		});
	}
	for (var i in $scope.data.timed) {
		$scope.data.timed[i].x = new Date($scope.data.timed[i].x);
	}
});
app.config(function($stateProvider) {
	$stateProvider.state('artistTools', {
		url: '/artistTools',
		templateUrl: 'js/artistTools/ArtistTools/artistTools.html',
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
		url: '/artistTools/profile',
		templateUrl: 'js/artistTools/ArtistTools/profile.html',
		controller: 'ArtistToolsController'
	}).state('artistToolsDownloadGatewayList', {
		url: '/artistTools/downloadGateway',
		params: {
			submission: null
		},
		templateUrl: 'js/artistTools/ArtistTools/downloadGateway.list.html',
		controller: 'ArtistToolsController'
	});
});
app.controller('ArtistToolsController', function($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, SessionService, ArtistToolsService) {
	$scope.user = SessionService.getUser();
	if (!SessionService.getUser()) {
		var path = window.location.pathname;
		if (path == "/artistTools/profile") {
			$window.localStorage.setItem('returnstate', 'artistToolsProfile');
		} else if (path == "/artistTools/downloadGateway") {
			$window.localStorage.setItem('returnstate', 'artistToolsDownloadGatewayList');
		}
		$state.go('login');
	} else {
		$rootScope.userlinkedAccounts = $scope.user.linkedAccounts ? $scope.user.linkedAccounts : [];
		$window.localStorage.removeItem('returnstate');
	}
	$scope.linkedAccountData = {};
	$scope.thirdPartyInfo = $scope.user.thirdPartyInfo ? $scope.user.thirdPartyInfo : null;
	$scope.hasThirdPartyFields = $scope.user.thirdPartyInfo ? true : false; /* Init boolean variables for show/hide and other functionalities */
	$scope.processing = false;
	$scope.isTrackAvailable = false;
	$scope.message = {
		val: '',
		visible: false
	}; /* Init downloadGateway list */
	$scope.downloadGatewayList = []; /* Init modal instance variables and methods */
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
	}; //overlay autofill track start//
	$scope.linkedAccounts = [];
	$scope.autoFillTracks = [];
	$scope.trackList = [];
	$scope.trackListObj = null;
	$scope.trackListSlotObj = null;
	$scope.newQueueSong = "";
	$scope.tracksQueue = [];
	$scope.trackChange = function(index) {
		$scope.makeEventURL = $scope.trackListSlotObj.permalink_url;
		$scope.changeURL();
	};
	$scope.trackListChange = function(index) {
		$scope.newQueueSong = $scope.trackListObj.permalink_url;
		$scope.processing = true;
		$scope.changeQueueSong();
	};
	$scope.showThridPartyBox = function() {
		$scope.hasThirdPartyFields = true;
	};
	$scope.addSong = function() {
		if ($scope.user.queue.indexOf($scope.newQueueID) != -1) return;
		if ($scope.tracksQueue.length > 0) {
			for (var i = 0; i < $scope.tracksQueue.length; i++) {
				if ($scope.user.queue.indexOf($scope.tracksQueue[i]) == -1) {
					$scope.user.queue.push($scope.tracksQueue[i]);
				}
			}
		} else {
			if ($scope.newQueueID != null) {
				$scope.user.queue.push($scope.newQueueID);
			}
		}
		$scope.saveUser();
		$scope.newQueueSong = undefined;
		$scope.trackListObj = "";
		$scope.newQueue = undefined;
		$scope.tracksQueue = [];
	};
	$scope.changeQueueSong = function() {
		if ($scope.newQueueSong != "") {
			$scope.processing = true;
			$http.post('/api/soundcloud/resolve', {
				url: $scope.newQueueSong
			}).then(function(res) {
				$scope.processing = false;
				var track = res.data;
				if (track.kind == "playlist") {
					var tracksArr = track.tracks;
					angular.forEach(tracksArr, function(t) {
						$scope.newQueueID = t.id;
						$scope.tracksQueue.push($scope.newQueueID);
					});
				} else {
					$scope.newQueue = track;
					$scope.newQueueID = track.id;
				}
				$scope.processing = false;
			}).then(null, function(err) {
				$.Zebra_Dialog("We are not allowed to access tracks by this artist with the Soundcloud API. We apologize for the inconvenience, and we are working with Soundcloud to resolve this issue.");
				$scope.processing = false;
			});
		}
	};
	$scope.saveUser = function() {
		$scope.processing = true;
		$http.put("/api/database/profile", $scope.user).then(function(res) {
			SessionService.create(res.data);
			$scope.user = SessionService.getUser();
			$scope.processing = false;
			$scope.loadQueueSongs(); // $window.location.reload();
		}).then(null, function(err) {
			$.Zebra_Dialog("Error: did not save");
			$scope.processing = false;
		});
		$('#autoFillTrack').modal('hide');
	};
	$scope.getTrackListFromSoundcloud = function() {
		var profile = $scope.user;
		if (profile.soundcloud) {
			$scope.processing = true;
			SC.get('/users/' + profile.soundcloud.id + '/tracks', {
				filter: 'public'
			}).then(function(tracks) {
				$scope.trackList = tracks;
				$scope.processing = false;
				$scope.$apply();
			})['catch'](function(response) {
				$scope.processing = false;
				$scope.$apply();
			});
		}
	};
	$scope.removeQueueSong = function(index) {
		$scope.user.queue.splice(index, 1);
		$scope.saveUser(); //$scope.loadQueueSongs();
	};
	$scope.loadQueueSongs = function(queue) {
		$scope.autoFillTracks = [];
		$scope.user.queue.forEach(function(songID) {
			SC.get('/tracks/' + songID).then(function(track) {
				$scope.autoFillTracks.push(track);
				$scope.$digest();
			}, console.log);
		});
	};
	if ($scope.user && $scope.user.queue) {
		$scope.loadQueueSongs();
	} //overlay autofill track end//
	$scope.closeModal = function() {
		$scope.modalInstance.close();
	};
	$scope.openHelpModal = function() {
		if ($state.current.url == '/artistTools/profile') {
			var displayText = "<h3>Help</h3><span style='font-weight:bold'>Permanent Links:</span> Add artist soundcloud urls here to make the artists followed on every one of your download gates.<br><br><a style='text-align:center; margin:0 auto;' href='mailto:coayscue@artistsunlimited.co?subject=Artists Unlimited Help' target='_top'>Email Tech Support</a>";
		} else if ($state.current.url == '/artistTools/downloadGateway') {
			var displayText = "<h3>Help</h3><span style='font-weight:bold'>List of downloads gateways:</span> This is a list of your download gates. You can create a new one, edit, delete one or view a download gate in the list.<br><br><a style='text-align:center; margin:0 auto;' href='mailto:coayscue@artistsunlimited.co?subject=Artists Unlimited Help' target='_top'>Email Tech Support</a>";
		}
		$.Zebra_Dialog(displayText, {
			width: 600
		});
	};
	$scope.editProfileModalInstance = {};
	$scope.editProfilemodal = {};
	$scope.openEditProfileModal = {
		editProfile: function editProfile(field) {
			$scope.profile.field = field;
			$timeout(function() {
				$scope.editProfileModalInstance = $uibModal.open({
					animation: true,
					templateUrl: 'editProfile.html',
					controller: 'ArtistToolsController',
					scope: $scope
				});
			}, 0);
		}
	};
	$scope.closeEditProfileModal = function() {
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
	$scope.closeThankYouModal = function() {
		$scope.thankYouModalInstance.close();
	}; /* Init profile */
	$scope.profile = {};
	if ($stateParams.submission) {
		$scope.openThankYouModal.thankYou($stateParams.submission._id);
	}
	$scope.showProfileInfo = function() {
		$scope.profile.data = SessionService.getUser();
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
	$scope.saveProfileInfo = function() {
		$scope.message = {
			value: '',
			visible: false
		};
		var permanentLinks = $scope.profile.data.permanentLinks.filter(function(item) {
			return item.id !== -1;
		}).map(function(item) {
			delete item['$$hashKey'];
			return item;
		});
		var sendObj = {
			name: '',
			password: '',
			email: '',
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
		ArtistToolsService.saveProfileInfo(sendObj).then(function(res) {
			$scope.processing = false;
			if (res.data === 'Email Error') {
				$scope.message = {
					value: 'Email already exists!',
					visible: true
				};
				return;
			}
			if (permanentLinks != "") {
				$scope.linkUrl = "";
			}
			SessionService.create(res.data);
			$scope.user = SessionService.getUser();
			$scope.closeEditProfileModal();
		})['catch'](function(res) {
			$scope.processing = false;
			$.Zebra_Dialog('error saving');
		});
	}; // Add third party credentials
	$scope.addThirdPartyDetails = function(userdata) {
		$scope.processing = true;
		$http.put("/api/database/thirdPartyDetails", {
			userid: $scope.user._id,
			data: userdata
		}).then(function(res) {
			if (res.data) {
				SessionService.create(res.data);
				$scope.user = SessionService.getUser();
				$scope.processing = false;
				$.Zebra_Dialog("Changes saved succesfully");
			} else {
				$.Zebra_Dialog("Error in processing the request. Please try again.");
				$scope.processing = false;
			}
		}).then(null, function(err) {
			$.Zebra_Dialog("Error in processing the request. Please try again.");
			$scope.processing = false;
		});
	}; // Remove third party access from user
	$scope.removeThirdPartyAccess = function() {
		$scope.processing = true;
		$http.put("/api/database/deleteThirdPartyAccess", {
			userid: $scope.user._id
		}).then(function(res) {
			SessionService.create(res.data);
			$scope.user = SessionService.getUser();
			$scope.thirdPartyInfo = $scope.user.thirdPartyInfo ? $scope.user.thirdPartyInfo : null;
			$scope.hasThirdPartyFields = $scope.user.thirdPartyInfo ? true : false;
			$scope.processing = false;
			$.Zebra_Dialog("Account removed succesfully");
		}).then(null, function(err) {
			$.Zebra_Dialog("Error in processing the request. Please try again.");
			$scope.processing = false;
		});
	}; // Save linked accounts
	$scope.saveLinkedAccount = function(data) {
		if ($scope.hasThirdPartyFields) {
			$scope.processing = true;
			$http.put("/api/database/saveLinkedAccount", {
				userid: $scope.user._id,
				data: data
			}).then(function(res) {
				if (res.data) {
					SessionService.create(res.data);
					$scope.user = SessionService.getUser();
					$rootScope.userlinkedAccounts = $scope.user.linkedAccounts ? $scope.user.linkedAccounts : [];
					$scope.processing = false;
					$scope.linkedAccountData = {};
					$.Zebra_Dialog("Account linked succesfully");
				} else {
					$scope.processing = false;
					$.Zebra_Dialog("No account found with given username and password.");
				}
			}).then(null, function(err) {
				$.Zebra_Dialog("Error in processing the request. Please try again.");
				$scope.processing = false;
			});
		} else {
			$.Zebra_Dialog("You must add third party access to this account to link another account.");
		}
	}; // remove linked accounts
	$scope.removeLinkedAccount = function(data) {
		$scope.processing = true;
		$http.put("/api/database/deleteLinkedAccount", {
			userid: $scope.user._id,
			data: data
		}).then(function(res) {
			SessionService.create(res.data);
			$scope.user = SessionService.getUser();
			$rootScope.userlinkedAccounts = $scope.user.linkedAccounts ? $scope.user.linkedAccounts : [];
			$scope.processing = false;
			$.Zebra_Dialog("Account removed succesfully");
		}).then(null, function(err) {
			$.Zebra_Dialog("Error in processing the request. Please try again.");
			$scope.processing = false;
		});
	};
	$scope.removePermanentLink = function(index) {
		$scope.profile.data.permanentLinks.splice(index, 1);
		$scope.saveProfileInfo();
	};
	$scope.hidebutton = false;
	$scope.addPermanentLink = function() {
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
	$scope.permanentLinkURLChange = function() {
		var permanentLink = {};
		$scope.processing = true;
		ArtistToolsService.resolveData({
			url: $scope.linkUrl
		}).then(function(res) {
			$scope.profile.data.permanentLinks.push({
				url: res.data.permalink_url,
				avatar: res.data.avatar_url ? res.data.avatar_url : '',
				username: res.data.username,
				id: res.data.id,
				permanentLink: true
			});
			$scope.processing = false;
		})['catch'](function(err) {
			$.Zebra_Dialog('Artists not found');
			$scope.processing = false;
		});
	};
	$scope.saveSoundCloudAccountInfo = function() {
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
	$scope.getDownloadList = function() {
		ArtistToolsService.getDownloadList().then(handleResponse)['catch'](handleError);

		function handleResponse(res) {
			$scope.downloadGatewayList = res.data;
		}

		function handleError(err) {
			console.log(err);
		}
	};
	$scope.deleteDownloadGateway = function(index) {
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
	$scope.verifyBrowser = function() {
		if (navigator.userAgent.search("Chrome") == -1 && navigator.userAgent.search("Safari") != -1) {
			var position = navigator.userAgent.search("Version") + 8;
			var end = navigator.userAgent.search(" Safari");
			var version = navigator.userAgent.substring(position, end);
			if (parseInt(version) < 9) {
				$.Zebra_Dialog('You have old version of safari. Click <a href="https://support.apple.com/downloads/safari">here</a> to download the latest version of safari for better site experience.', {
					'type': 'confirmation',
					'buttons': [{
						caption: 'OK'
					}],
					'onClose': function onClose() {
						$window.location.href = "https://support.apple.com/downloads/safari";
					}
				});
			}
		}
	};
	$scope.verifyBrowser();
}).controller('OpenThankYouModalController', function($scope) {});
app.service('ArtistToolsService', ['$http', function($http) {
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
app.config(function($stateProvider) {
	$stateProvider.state('SCResolve', {
		url: '/artistTools/scresolve',
		templateUrl: 'js/artistTools/SCResolve/SCResolve.html',
		controller: 'SCResolveController'
	});
});
app.controller('SCResolveController', function($scope, $http) {
	$scope.response = {};
	$scope.resolve = function() {
		$http.post('/api/soundcloud/resolve', {
			url: $scope.url
		}).then(function(res) {
			$scope.response = JSON.stringify(res.data, null, "\t");
			console.log($scope.response);
		}).then(null, function(err) {
			$scope.response = JSON.stringify(err, null, "\t");
		});
	};
});
app.config(function($stateProvider) {
	$stateProvider.state('artistToolsDownloadGatewayEdit', {
		url: '/artistTools/downloadGateway/edit/:gatewayID',
		templateUrl: 'js/artistTools/downloadGateway/downloadGateway.html',
		controller: 'ArtistToolsDownloadGatewayController',
		resolve: {
			isLoggedIn: function isLoggedIn($stateParams, $window, SessionService) {
				if (!SessionService.getUser()) {
					$window.localStorage.setItem('returnstate', 'artistToolsDownloadGatewayEdit');
					$window.localStorage.setItem('tid', $stateParams.gatewayID);
					$window.location.href = '/login';
				}
				return true;
			}
		}
	}).state('artistToolsDownloadGatewayNew', {
		url: '/artistTools/downloadGateway/new',
		params: {
			submission: null
		},
		templateUrl: 'js/artistTools/downloadGateway/downloadGateway.html',
		controller: 'ArtistToolsDownloadGatewayController',
		resolve: {
			isLoggedIn: function isLoggedIn($stateParams, $window, SessionService) {
				if (!SessionService.getUser()) {
					$window.localStorage.setItem('returnstate', 'artistToolsDownloadGatewayNew');
					$window.location.href = '/login';
				}
				return true;
			}
		}
	});
});
app.controller('ArtistToolsDownloadGatewayController', function($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, SessionService, ArtistToolsService, AdminDLGateService) { /* Init Download Gateway form data */
	$scope.user = SessionService.getUser();
	if (!SessionService.getUser()) {
		$state.go('login');
	} else {
		$window.localStorage.removeItem('returnstate');
		$window.localStorage.removeItem('tid');
	}
	$scope.showTitle = [];
	$scope.track = {
		artistUsername: '',
		trackTitle: '',
		trackArtworkURL: '',
		SMLinks: [],
		like: false,
		comment: false,
		repost: false,
		artists: [],
		playlists: [],
		showDownloadTracks: 'user',
		admin: $scope.user.admin,
		file: {}
	};
	$scope.profile = {}; /* Init track list and trackListObj*/
	$scope.trackList = [];
	$scope.trackListObj = null; /* Method for resetting Download Gateway form */
	$scope.trackListChange = function(index) { /* Set booleans */
		$scope.isTrackAvailable = false;
		$scope.processing = true; /* Set track data */
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
			profiles.forEach(function(prof) {
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
			$.Zebra_Dialog('Song not found or forbidden');
			$scope.processing = false;
			$scope.$apply();
		}
	};
	$scope.openHelpModal = function() {
		var displayText = "<span style='font-weight:bold'>Song: </span>Choose or enter the url for the song you want to make the download gate for. If you make it for one of your tracks, the download link will be automatically added to your track on soundcloud.<br><br><span style='font-weight:bold'>Social Media Links: </span>The links that you add here will appear on the download gateway page.<br><br><span style='font-weight:bold'>Download File: </span>Either provide a link to a downloadable file or upload an mp3 file. If you upload an mp3, we format the file with the album artwork, title, and artist of your soundcloud track so that it will look good on a music player.<br><br><span style='font-weight:bold'>Artists to Follow and Actions: </span>The artists you add will be followed on this download gate. Under actions, you can make 'Liking', 'Reposting' and 'Commenting' mandatory on the download.<br><br><a style='text-align:center; margin:0 auto;' href='mailto:coayscue@artistsunlimited.co?subject=Artists Unlimited Help' target='_top'>Email Tech Support</a>";
		$.Zebra_Dialog(displayText, {
			width: 600
		});
	};
	$scope.removeSMLink = function(index) {
		$scope.track.SMLinks.splice(index, 1);
	};
	$scope.saveDownloadGate = function() {
		if (!($scope.track.downloadURL || $scope.track.file && $scope.track.file.name)) {
			$.Zebra_Dialog('Enter a download file');
			return false;
		}
		if (!$scope.track.trackID) {
			$.Zebra_Dialog('Track Not Found');
			return false;
		}
		$scope.processing = true;
		var sendObj = new FormData();
		for (var prop in $scope.track) {
			sendObj.append(prop, $scope.track[prop]);
		}
		var artists = $scope.track.artists.filter(function(item) {
			return item.id !== -1;
		}).map(function(item) {
			delete item['$$hashKey'];
			return item;
		});
		var playlists = $scope.track.playlists.filter(function(item) {
			return item.id !== -1;
		}).map(function(item) {
			delete item['$$hashKey'];
			return item;
		});
		sendObj.append('artists', JSON.stringify(artists));
		var SMLinks = {};
		$scope.track.SMLinks.forEach(function(item) {
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
		$http(options).then(function(res) {
			$scope.processing = false;
			if ($stateParams.submission) {
				$state.go('artistToolsDownloadGatewayList', {
					'submission': $stateParams.submission
				});
			} else {
				if ($scope.user.soundcloud.id == $scope.track.artistID) {
					$.Zebra_Dialog('Download gateway was saved and added to the track.');
				} else {
					$.Zebra_Dialog('Download gateway saved.');
				}
				$state.go('artistToolsDownloadGatewayList');
			}
		}).then(null, function(err) {
			$scope.processing = false;
			$.Zebra_Dialog("ERROR: Error in saving url");
			$scope.processing = false;
		});
	};
	$scope.checkIfEdit = function() {
		if ($stateParams.gatewayID) {
			$scope.getDownloadGateway($stateParams.gatewayID);
		}
	};
	$scope.getTrackListFromSoundcloud = function() {
		var profile = SessionService.getUser();
		if (profile.soundcloud) {
			$scope.processing = true;
			SC.get('/users/' + profile.soundcloud.id + '/tracks', {
				filter: 'public'
			}).then(function(tracks) {
				$scope.trackList = tracks;
				$scope.processing = false;
				$scope.$apply();
			})['catch'](function(response) {
				$scope.processing = false;
				$scope.$apply();
			});
		}
	};
	$scope.checkIfSubmission = function() {
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
	$scope.resolveYoutube = function() {
		if (!($scope.track.socialPlatformValue.includes('/channel/') || $scope.track.socialPlatformValue.includes('/user/'))) {
			$.Zebra_Dialog('Enter a valid Youtube channel url.');
			return;
		}
	};
	$scope.trackURLChange = function() {
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
				profiles.forEach(function(prof) {
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
				$.Zebra_Dialog('Song not found or forbidden');
				$scope.processing = false;
			};
			$scope.isTrackAvailable = false;
			$scope.processing = true;
			ArtistToolsService.resolveData({
				url: $scope.track.trackURL
			}).then(handleTrackDataAndGetProfiles).then(handleWebProfiles)['catch'](handleError);
		}
	};
	$scope.SMLinkChange = function(index) {
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
		var findLink = $scope.track.SMLinks.filter(function(item) {
			return item.key === host;
		});
		if (findLink.length > 0) {
			return false;
		}
		$scope.track.SMLinks[index].key = host;
	};
	$scope.addSMLink = function() {
		$scope.track.SMLinks.push({
			key: '',
			value: ''
		});
	};
	$scope.clearOrFile = function() {
		if ($scope.track.downloadURL) {
			angular.element("input[type='file']").val(null);
		}
	};
	$scope.artistURLChange = function(index) {
		var artist = {};
		if ($scope.track.artists[index].url != "") {
			$scope.processing = true;
			ArtistToolsService.resolveData({
				url: $scope.track.artists[index].url
			}).then(function(res) {
				$scope.track.artists[index].avatar = res.data.avatar_url ? res.data.avatar_url : '';
				$scope.track.artists[index].username = res.data.username;
				$scope.track.artists[index].id = res.data.id;
				$scope.processing = false;
			})['catch'](function(err) {
				$.Zebra_Dialog('Artists not found');
				$scope.processing = false;
			});
		}
	};
	$scope.removeArtist = function(index) {
		$scope.track.artists.splice(index, 1);
	};
	$scope.addArtist = function() {
		$scope.track.artists.push({
			url: '',
			avatar: '',
			username: '',
			id: -1,
			permanentLink: false
		});
	};
	$scope.addPlaylist = function() {
		$scope.track.playlists.push({
			url: '',
			avatar: '',
			title: '',
			id: ''
		});
	};
	$scope.removePlaylist = function(index) {
		$scope.track.playlists.splice(index, 1);
	};
	$scope.playlistURLChange = function(index) {
		$scope.processing = true;
		AdminDLGateService.resolveData({
			url: $scope.track.playlists[index].url
		}).then(function(res) {
			$scope.track.playlists[index].avatar = res.data.artwork_url;
			$scope.track.playlists[index].title = res.data.title;
			$scope.track.playlists[index].id = res.data.id;
			$scope.processing = false;
		}).then(null, function(err) {
			$.Zebra_Dialog('Playlist not found');
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
	} /* Method for getting DownloadGateway in case of edit */
	$scope.getDownloadGateway = function(downloadGateWayID) { // resetDownloadGateway();
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
			permanentLinks.forEach(function(item) {
				permanentLinksArray.push({
					url: item
				});
			});
			if (!$scope.track.showDownloadTracks) {
				$scope.track.showDownloadTracks = 'user';
			}
			$scope.track.SMLinks = SMLinksArray;
			$scope.track.permanentLinks = permanentLinksArray;
			$scope.track.playlistIDS = []; // $scope.track.showDownloadTracks = ($scope.track.showDownloadTracks === 'user') ? true : false;
			//console.log($scope.track);
			$scope.processing = false;
		}

		function handleError(res) {
			$scope.processing = false;
		}
	};
	$scope.clearOrInput = function() {
		$scope.track.downloadURL = "";
	};
	$scope.preview = function(track) {
		window.localStorage.setItem('trackPreviewData', JSON.stringify(track));
		var url = $state.href('artistToolsDownloadGatewayPreview');
		$window.open(url, '_blank');
	};
	$scope.verifyBrowser = function() {
		if (navigator.userAgent.search("Chrome") == -1 && navigator.userAgent.search("Safari") != -1) {
			var position = navigator.userAgent.search("Version") + 8;
			var end = navigator.userAgent.search(" Safari");
			var version = navigator.userAgent.substring(position, end);
			if (parseInt(version) < 9) {
				$.Zebra_Dialog('You have old version of safari. Click <a href="https://support.apple.com/downloads/safari">here</a> to download the latest version of safari for better site experience.', {
					'type': 'confirmation',
					'buttons': [{
						caption: 'OK'
					}],
					'onClose': function onClose() {
						$window.location.href = "https://support.apple.com/downloads/safari";
					}
				});
			}
		}
	};
	$scope.verifyBrowser();
});
app.config(function($stateProvider) {
	$stateProvider.state('artistToolsDownloadGatewayPreview', {
		url: '/artistTools/downloadGateway/preview',
		params: {
			submission: null
		},
		templateUrl: 'js/artistTools/downloadGateway/preview.html',
		controller: 'ArtistToolsPreviewController'
	});
});
app.controller("ArtistToolsPreviewController", function($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, SessionService, ArtistToolsService, DownloadTrackService) {
	$scope.user = SessionService.getUser();
	$scope.recentTracks = [];
	var track = JSON.parse(window.localStorage.getItem('trackPreviewData'));
	if (!track.trackTitle) {
		$.Zebra_Dialog('Track Not Found');
		$state.go("artistToolsDownloadGatewayList");
		return false;
	}
	$scope.track = track;
	$scope.player = {};
	SC.stream('/tracks/' + $scope.track.trackID).then(function(p) {
		$scope.player = p;
	});
	$scope.toggle = true;
	$scope.togglePlay = function() {
		$scope.toggle = !$scope.toggle;
		if ($scope.toggle) {
			$scope.player.pause();
		} else {
			$scope.player.play();
		}
	};
	$scope.nodl = function() {
		$.Zebra_Dialog('No download in preview mode.');
	};
	$scope.getRecentTracks = function() {
		if ($scope.track && $scope.track.showDownloadTracks === 'user') {
			DownloadTrackService.getRecentTracks({
				userID: $scope.track.userid,
				trackID: $scope.track._id
			}).then(function(res) {
				if (typeof res === 'object' && res.data) {
					$scope.recentTracks = res.data;
				}
			});
		}
	};
	$scope.getRecentTracks();
});
app.config(function($stateProvider) {
	$stateProvider.state('reForReInteraction', {
		url: '/artistTools/reForReInteraction/:tradeID',
		templateUrl: 'js/artistTools/reForRe/reForReInteraction.html',
		controller: 'ReForReInteractionController',
		resolve: {
			trade: function trade($http, $stateParams, $window, SessionService) {
				if (!SessionService.getUser()) {
					$window.localStorage.setItem('returnstate', 'reForReInteraction');
					$window.localStorage.setItem('tid', $stateParams.tradeID);
					$window.location.href = '/login';
				}
				return $http.get('/api/trades/byID/' + $stateParams.tradeID).then(function(res) {
					return res.data;
				});
			},
			p1Events: function p1Events($http, trade) {
				return $http.get('/api/events/forUser/' + trade.p1.user.soundcloud.id).then(function(res) {
					return res.data;
				}).then(null, function(err) {
					$.Zebra_Dialog("error getting your events");
					return;
				});
			},
			p2Events: function p2Events($http, trade) {
				return $http.get('/api/events/forUser/' + trade.p2.user.soundcloud.id).then(function(res) {
					return res.data;
				}).then(null, function(err) {
					$.Zebra_Dialog("error getting other's events events");
					return;
				});
			},
			currentTrades: function currentTrades($http, SessionService) {
				var tradeType = {
					Requests: true,
					Requested: true,
					TradePartners: true
				};
				var user = SessionService.getUser();
				return $http.get('/api/trades/withUser/' + user._id + '?tradeType=' + JSON.stringify(tradeType)).then(function(res) {
					var trades = res.data;
					trades.forEach(function(trade) {
						trade.other = trade.p1.user._id == user._id ? trade.p2 : trade.p1;
						trade.user = trade.p1.user._id == user._id ? trade.p1 : trade.p2;
					});
					trades.sort(function(a, b) {
						if (a.user.alert == "change") {
							return -1;
						} else if (a.user.alert == "placement") {
							return -1;
						} else {
							return 1;
						}
					});
					console.log(trades);
					return trades;
				});
			}
		},
		onExit: function onExit($http, $stateParams, SessionService, socket) {
			$http.put('/api/trades/offline', {
				tradeID: $stateParams.tradeID
			});
			socket.disconnect();
		}
	});
});
app.controller("ReForReInteractionController", function($rootScope, $state, $scope, $http, AuthService, $window, SessionService, socket, $stateParams, trade, p1Events, p2Events, currentTrades) {
	$scope.user = SessionService.getUser();
	if (!SessionService.getUser()) {
		$state.go('login');
	} else {
		$window.localStorage.removeItem('returnstate');
		$window.localStorage.removeItem('tid');
	}
	$scope.showEmailModal = false;
	$scope.processing = false;
	socket.connect();
	$scope.msgHistory = [];
	$scope.makeEventURL = "";
	$scope.showOverlay = false;
	$scope.processiong = false;
	$scope.hideall = false;
	$scope.trade = trade;
	$scope.p1Events = p1Events;
	$scope.p2Events = p2Events;
	$scope.trackArtistID = 0;
	$scope.trackType = "";
	$scope.currentTrades = currentTrades;
	$scope.selectTrade = currentTrades.find(function(el) {
		return el._id == $scope.trade._id;
	});
	var person = $scope.trade.p1.user._id == $scope.user._id ? $scope.trade.p1 : $scope.trade.p2;
	$scope.user.accepted = person.accepted;
	$scope.p1dayIncr = 0;
	$scope.p2dayIncr = 0;
	$scope.trackList = [];
	$scope.trackListChangeEvent = function(index) {
		$scope.makeEvent.URL = $scope.makeEvent.trackListObj.permalink_url;
		$scope.changeURL();
	};
	$scope.getTrackListFromSoundcloud = function() {
		var profile = $scope.user;
		if (profile.soundcloud) {
			$scope.processing = true;
			SC.get('/users/' + profile.soundcloud.id + '/tracks', {
				filter: 'public'
			}).then(function(tracks) {
				$scope.trackList = tracks;
				$scope.processing = false;
				$scope.$apply();
			})['catch'](function(response) {
				$scope.processing = false;
				$scope.$apply();
			});
		}
	};
	$scope.getSchedulerID = function(uid) {
		return uid == $scope.user._id ? "scheduler-left" : "scheduler-right";
	};
	$scope.user.accepted = $scope.trade.p1.user._id == $scope.user._id ? $scope.trade.p1.accepted : $scope.trade.p2.accepted;
	$scope.curTrade = JSON.stringify($.grep($scope.currentTrades, function(e) {
		return e._id == $scope.trade._id;
	}));
	$scope.refreshCalendar = function() {
		$scope.user = SessionService.getUser();
		$http.get('/api/trades/getTradeData/' + $stateParams.tradeID).then(function(res) {
			$scope.trade = res.data.trade;
			$scope.p2Events = res.data.p2Events;
			$scope.p1Events = res.data.p1Events;
			var trds = res.data.userTrades;
			trds.forEach(function(trade) {
				trade.other = trade.p1.user._id == $scope.user._id ? trade.p2 : trade.p1;
				trade.user = trade.p1.user._id == $scope.user._id ? trade.p1 : trade.p2;
			});
			$scope.currentTrades = trds;
			$scope.user.accepted = $scope.trade.p1.user._id == $scope.user._id ? $scope.trade.p1.accepted : $scope.trade.p2.accepted;
			$scope.tradeIndex = currentTrades.findIndex(function(el) {
				return el._id == $scope.trade._id;
			});
			$scope.fillCalendar();
			$scope.updateAlerts();
			$scope.processing = false;
		}).then(null, function(err) {
			$scope.processing = false;
			$.Zebra_Dialog('Error getting data.');
		});
	};
	$scope.incrp1 = function(inc) {
		if ($scope.p1dayIncr < 21) $scope.p1dayIncr++;
	};
	$scope.decrp1 = function(inc) {
		if ($scope.p1dayIncr > 0) $scope.p1dayIncr--;
	};
	$scope.incrp2 = function(inc) {
		if ($scope.p2dayIncr < 21) $scope.p2dayIncr++;
	};
	$scope.decrp2 = function(inc) {
		if ($scope.p2dayIncr > 0) $scope.p2dayIncr--;
	};
	$scope.changeURL = function() {
		if ($scope.makeEvent.URL != "") {
			$scope.processing = true;
			$http.post('/api/soundcloud/resolve', {
				url: $scope.makeEvent.URL
			}).then(function(res) {
				$scope.trackArtistID = res.data.user.id;
				$scope.trackType = res.data.kind;
				if (res.data.kind != "playlist") {
					$scope.makeEvent.trackID = res.data.id;
					$scope.makeEvent.title = res.data.title;
					$scope.makeEvent.trackURL = res.data.trackURL;
					if (res.data.user) $scope.makeEvent.artistName = res.data.user.username;
					SC.oEmbed($scope.makeEvent.URL, {
						element: document.getElementById('scPlayer'),
						auto_play: false,
						maxheight: 150
					});
					document.getElementById('scPlayer').style.visibility = "visible";
					$scope.notFound = false;
					$scope.processing = false;
				} else {
					$scope.notFound = false;
					$scope.processing = false;
					$.Zebra_Dialog("Sorry! We do not currently allow playlist reposting. Please enter a track url instead.");
				}
			}).then(null, function(err) {
				$.Zebra_Dialog("We are not allowed to access this track from Soundcloud. We apologize for the inconvenience, and we are working with Soundcloud to resolve the issue.");
				document.getElementById('scPlayer').style.visibility = "hidden";
				$scope.notFound = true;
				$scope.processing = false;
			});
		}
	};
	$scope.unrepostOverlap = function() {
		if (!$scope.makeEvent.trackID) return false;
		var events = $scope.makeEvent.person.user._id == $scope.trade.p1.user._id ? $scope.p1Events : $scope.p2Events;
		var slots = $scope.makeEvent.person.slots;
		var blockEvents = events.filter(function(event) {
			event.day = new Date(event.day);
			event.unrepostDate = new Date(event.unrepostDate);
			if (moment($scope.makeEvent.day).format('LLL') == moment(event.day).format('LLL') && $scope.makeEvent.trackID == event.trackID) return false;
			return $scope.makeEvent.trackID == event.trackID && event.unrepostDate.getTime() > $scope.makeEvent.day.getTime() - 24 * 3600000 && event.day.getTime() < $scope.makeEvent.unrepostDate.getTime() + 24 * 3600000;
		});
		var blockEvents2 = slots.filter(function(slot) {
			slot.day = new Date(slot.day);
			slot.unrepostDate = new Date(slot.unrepostDate);
			if (moment($scope.makeEvent.day).format('LLL') == moment(slot.day).format('LLL') && $scope.makeEvent.trackID == slot.trackID) return false;
			return $scope.makeEvent.trackID == slot.trackID && slot.unrepostDate.getTime() > $scope.makeEvent.day.getTime() - 24 * 3600000 && slot.day.getTime() < $scope.makeEvent.unrepostDate.getTime() + 24 * 3600000;
		});
		return blockEvents.length > 0 || blockEvents2.length > 0;
	};
	$scope.changeTrade = function(trade) {
		$state.go('reForReInteraction', {
			tradeID: trade._id
		});
	};
	$scope.backEvent = function() {
		$scope.makeEvent = undefined;
		$scope.trackType = "";
		$scope.trackArtistID = 0;
		$scope.showOverlay = false;
	};
	$scope.deleteEvent = function() {
		$scope.makeEvent.person.slots = $scope.makeEvent.person.slots.filter(function(slot, index) {
			return !(moment(slot.day).format('LLL') == moment($scope.makeEvent.day).format('LLL'));
		});
		$scope.trade.p1.accepted = $scope.trade.p2.accepted = false;
		$scope.processing = true;
		$http.put('/api/trades', $scope.trade).then(function(res) {
			$scope.showOverlay = false;
			$scope.trade = res.data;
			$scope.emitMessage("REMOVED SLOT from " + $scope.makeEvent.person.user.soundcloud.username + " for " + moment($scope.makeEvent.day).format('LLL'), 'alert'); //$scope.processing = false;
		}).then(null, function(err) {
			$scope.showOverlay = false;
			$scope.processing = false;
			$.Zebra_Dialog('Error deleting.');
		});
	};
	$scope.saveEvent = function() {
		if (!$scope.unrepostOverlap()) {
			$scope.processing = true;
			if ($scope.makeEvent.type == 'traded') {
				var req = new Promise(function(resolve, reject) {
					if ($scope.makeEvent._id) $http.put('/api/events/repostEvents', $scope.makeEvent).then(resolve, reject);
					else $http.post('/api/events/repostEvents', $scope.makeEvent).then(resolve, reject);
				});
				req.then(function(res) { //$scope.processing = false;
					$scope.trackType = "";
					$scope.trackArtistID = 0;
					$scope.showOverlay = false;
					$scope.refreshCalendar();
				}).then(null, function(err) {
					$scope.processing = false;
					$.Zebra_Dialog('Error saving.');
				});
			} else if ($scope.makeEvent.type == 'trade') {
				$scope.makeEvent.person.slots = $scope.makeEvent.person.slots.filter(function(slot, index) {
					return !(moment(slot.day).format('LLL') === moment($scope.makeEvent.day).format('LLL'));
				});
				$scope.makeEvent.person.slots.push($scope.makeEvent);
				var alertMessage = "CHANGED SLOT on " + $scope.makeEvent.person.user.soundcloud.username + " on " + moment($scope.makeEvent.day).format('LLL');
				$scope.makeEvent.person = undefined;
				$scope.trade.p1.accepted = $scope.trade.p2.accepted = false;
				$http.put('/api/trades', $scope.trade).then(function(res) { //$scope.processing = false;
					$scope.trackType = "";
					$scope.trackArtistID = 0;
					$scope.showOverlay = false;
					$scope.trade = res.data;
					$scope.emitMessage(alertMessage, 'alert');
				}).then(null, function(err) {
					$scope.processing = false;
					$.Zebra_Dialog('Error with request');
				});
			}
		} else {
			$.Zebra_Dialog('Issue! This repost will cause the to be both unreposted and reposted within a 24 hour time period. If you are unreposting, please allow 48 hours between scheduled reposts.');
		}
	};
	$scope.emailSlot = function() {
		var mailto_link = "mailto:?subject=Repost of " + $scope.makeEvent.title + '&body=Hey,\n\n I am reposting your song ' + $scope.makeEvent.title + ' on ' + $scope.makeEventAccount.username + ' on ' + $scope.makeEvent.day.toLocaleDateString() + '.\n\n Best, \n' + $scope.user.soundcloud.username;
		location.href = encodeURI(mailto_link);
	};
	$scope.setUpAndOpenMakeEvent = function(event, person) {
		$scope.showOverlay = true;
		$scope.makeEvent = JSON.parse(JSON.stringify(event));
		$scope.makeEvent.trackListObj = null;
		$scope.makeEvent.day = new Date($scope.makeEvent.day);
		if ($scope.makeEvent.unrepostDate) $scope.makeEvent.unrepostDate = new Date($scope.makeEvent.unrepostDate);
		if ($scope.makeEvent.unrepostDate > new Date()) {
			$scope.makeEvent.unrepostDate = new Date($scope.makeEvent.unrepostDate);
			$scope.makeEvent.unrepost = true;
		} else {
			$scope.makeEvent.unrepostDate = new Date(0);
			$scope.makeEvent.unrepost = false;
		}
		$scope.makeEvent.person = person;
		$scope.makeEvent.URL = $scope.makeEvent.trackURL;
		SC.oEmbed($scope.makeEvent.trackURL, {
			element: document.getElementById('scPlayer'),
			auto_play: false,
			maxheight: 150
		});
	};
	$scope.changeUnrepost = function() {
		if ($scope.makeEvent.unrepost) {
			$scope.makeEvent.day = new Date($scope.makeEvent.day);
			$scope.makeEvent.unrepostDate = new Date($scope.makeEvent.day.getTime() + 24 * 60 * 60 * 1000);
		} else {
			$scope.makeEvent.unrepostDate = new Date(0);
		}
	};
	$scope.clickedSlot = function(day, dayOffset, hour, calendar, person, event) {
		if ($scope.user.accepted) {
			$.Zebra_Dialog("You can't make changes to this trade because you already accepted it. You will be able to make changes if the other person makes a change.");
			return;
		}
		var makeDay = new Date(day);
		makeDay.setHours(hour, 30, 0, 0);
		if (makeDay < new Date()) {
			$.Zebra_Dialog('Timeslot has passed.');
			return;
		}
		switch (event.type) {
			case 'queue':
			case 'track':
			case 'paid':
			$.Zebra_Dialog('Cannot manage this time slot.');
			return;
			break;
			case 'empty':
			var calEvent = {
				type: "trade",
				day: makeDay,
				userID: person.user.soundcloud.id,
				unrepostDate: new Date(makeDay.getTime() + 24 * 60 * 60 * 1000)
			};
			$scope.setUpAndOpenMakeEvent(calEvent, person);
			break;
			case 'trade':
			$scope.setUpAndOpenMakeEvent(event, person);
			break;
			case 'traded': // if (event.owner == $scope.user._id) {
				$scope.setUpAndOpenMakeEvent(event, person); // } else {
				//   $.Zebra_Dialog('Cannot manage this time slot.');
				//   return;
				// }
				break;
			}
		};
		$scope.email = function() {
			var otherUser = $scope.trade.p1.user._id == $scope.user._id ? $scope.trade.p2.user : $scope.trade.p1.user;
			var mailto_link = "mailto:" + otherUser.email + "?subject=Repost for repost with " + $scope.user.soundcloud.username + '&body=Hey ' + otherUser.soundcloud.username + ',\n\n Repost for repost? I scheduled a trade here! -> ArtistsUnlimited.co/login\n\nBest,\n' + $scope.user.soundcloud.username;
			location.href = encodeURI(mailto_link);
		};
		$scope.accept = function() {
			if ($scope.trade.p1.user._id == $scope.user._id) {
				var accString = $scope.trade.p2.accepted ? "If you accept, the trade will be made. You will have the right to schedule the slots you are trading for, and the other person will have rights to the slots you are trading with." : "If you click accept, you will not be able to make changes to the trade being negotiated. If the other person makes a change, you will then be given the right to make changes and accept those changes again. If the other person also accepts, the trade will be made.";
			} else {
				var accString = $scope.trade.p1.accepted ? "If you accept, the trade will be made. You will have the right to schedule the slots you are trading for, and the other person will have rights to the slots you are trading with." : "If you click accept, you will not be able to make changes to the trade being negotiated. If the other person makes a change, you will then be given the right to make changes and accept those changes again. If the other person also accepts, the trade will be made.";
			}
			$.Zebra_Dialog(accString, {
				'type': 'confirmation',
				'buttons': [{
					caption: 'Accept',
					callback: function callback() {
						if ($scope.user.queue && $scope.user.queue.length == 0) {
							$('#autoFillTrack').modal('show');
						} else {
							$scope.user.accepted = true;
							if ($scope.trade.p1.user._id == $scope.user._id) {
								$scope.trade.p1.accepted = true;
							} else {
								$scope.trade.p2.accepted = true;
							}
							$scope.processing = true;
							$http.put('/api/trades', $scope.trade).then(function(res) {
								$scope.processing = false;
								$scope.trade = res.data;
								if ($scope.trade.p1.accepted && $scope.trade.p2.accepted) $scope.completeTrade();
								else $scope.emitMessage('---- ' + $scope.user.soundcloud.username + " accepted the trade ----", 'alert');
							}).then(null, function(err) {
								$scope.processing = false;
								$.Zebra_Dialog('Error accepting');
							});
						}
					}
				}, {
					caption: 'Cancel',
					callback: function callback() {
						console.log('No was clicked');
					}
				}]
			});
	}; //overlay autofill track start//
	$scope.autoFillTracks = [];
	$scope.trackListObj = null;
	$scope.trackListSlotObj = null;
	$scope.newQueueSong = "";
	$scope.trackChange = function(index) {
		$scope.makeEventURL = $scope.trackListSlotObj.permalink_url;
		$scope.changeURL();
	};
	$scope.trackListChange = function(index) {
		$scope.newQueueSong = $scope.trackListObj.permalink_url;
		$scope.processing = true;
		$scope.changeQueueSong();
	};
	$scope.addSong = function() {
		if ($scope.user.queue.indexOf($scope.newQueueID) != -1) return;
		$scope.user.queue.push($scope.newQueueID);
		$scope.saveUser();
		$scope.newQueueSong = undefined;
		$scope.trackListObj = "";
		$scope.newQueue = undefined;
		$scope.accept();
	};
	$scope.changeQueueSong = function() {
		if ($scope.newQueueSong != "") {
			$scope.processing = true;
			$http.post('/api/soundcloud/resolve', {
				url: $scope.newQueueSong
			}).then(function(res) {
				$scope.processing = false;
				var track = res.data;
				$scope.newQueue = track;
				$scope.newQueueID = track.id;
			}).then(null, function(err) {
				$scope.newQueueSong = "";
				$('#autoFillTrack').modal('hide');
				$.Zebra_Dialog("We are not allowed to access tracks by this artist with the Soundcloud API. We apologize for the inconvenience, and we are working with Soundcloud to resolve this issue.");
				$scope.processing = false;
			});
		}
	};
	$scope.saveUser = function() {
		$scope.processing = true;
		$http.put("/api/database/profile", $scope.user).then(function(res) {
			SessionService.create(res.data);
			$scope.user = SessionService.getUser();
			$scope.processing = false;
		}).then(null, function(err) {
			$.Zebra_Dialog("Error: did not save");
			$scope.processing = false;
		});
		$('#autoFillTrack').modal('hide');
	}; //overlay autofill track end//
	$scope.dayOfWeekAsString = function(date) {
		var dayIndex = date.getDay();
		return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex];
	};
	socket.on('init', function(data) {
		$scope.name = data.name;
		$scope.users = data.users;
	});
	socket.on('send:message', function(message) {
		if (message.tradeID == $stateParams.tradeID) {
			$scope.msgHistory.push(message);
			$scope.message = message.message;
			$scope.trade.messages.push(message);
			if (message.type == "alert") {
				$scope.refreshCalendar();
			}
		}
	});
	socket.on('get:message', function(data) {
		if (data != '') {
			if (data._id == $stateParams.tradeID) {
				$scope.msgHistory = data ? data.messages : [];
			}
		}
	});
	$scope.emitMessage = function(message, type) { // if($scope.trade.p1.user._id == $scope.user._id && $scope.trade.p2.online == false){
		//   $scope.trade.p2.alert = "change";
		// } else if ($scope.trade.p2.user._id == $scope.user._id && $scope.trade.p1.online == false) {
		//   $scope.trade.p1.alert = "change";
		// }  
		socket.emit('send:message', {
			message: message,
			type: type,
			id: $scope.user._id,
			tradeID: $stateParams.tradeID
		});
		$scope.message = '';
	};
	$scope.getMessage = function() {
		socket.emit('get:message', $stateParams.tradeID);
	};
	$scope.fillDateArrays = function(events, slots) {
		var calendar = [];
		var today = new Date();
		for (var i = 0; i < 29; i++) {
			var calDay = {};
			calDay.day = new Date();
			calDay.day.setDate(today.getDate() + i);
			var dayEvents = events.filter(function(ev) {
				return ev.day.toLocaleDateString() == calDay.day.toLocaleDateString();
			});
			slots.forEach(function(slot) {
				if (slot.day.toLocaleDateString() == calDay.day.toLocaleDateString()) dayEvents.push(slot);
			});
			var eventArray = [];
			for (var j = 0; j < 24; j++) {
				eventArray[j] = {
					type: "empty"
				};
			}
			dayEvents.forEach(function(ev) {
				eventArray[ev.day.getHours()] = ev;
			});
			calDay.events = eventArray;
			calendar.push(calDay);
		}
		return calendar;
	};
	$scope.fillCalendar = function() {
		function setEventDays(arr) {
			arr.forEach(function(ev) {
				ev.day = new Date(ev.day);
			});
		}
		setEventDays($scope.p1Events);
		setEventDays($scope.p2Events);
		setEventDays($scope.trade.p1.slots);
		setEventDays($scope.trade.p2.slots);
		var now = new Date();
		now.setHours(now.getHours(), 30, 0, 0);
		var change = false;
		var op1String = JSON.stringify($scope.trade.p1.slots);
		var lastString = op1String;
		do {
			lastString = op1String;
			$scope.trade.p1.slots.forEach(function(slot) {
				if (slot.day < now) {
					slot.day.setHours(now.getHours() + Math.floor(Math.random() * 10) + 14);
					change = true;
				}
			});
			$scope.p1Events.forEach(function(event) {
				$scope.trade.p1.slots.forEach(function(slot) {
					if (slot.day.toLocaleDateString() == event.day.toLocaleDateString() && slot.day.getHours() == event.day.getHours()) {
						slot.day.setHours(slot.day.getHours() + Math.floor(Math.random() * 10) + 1);
						change = true;
					}
				});
			});
			op1String = JSON.stringify($scope.trade.p1.slots);
		} while (op1String != lastString);
		var op2String = JSON.stringify($scope.trade.p2.slots);
		do {
			lastString = op2String;
			$scope.trade.p2.slots.forEach(function(slot) {
				if (slot.day < now) {
					slot.day.setHours(now.getHours() + Math.floor(Math.random() * 10) + 14);
					change = true;
				}
			});
			$scope.p2Events.forEach(function(event) {
				$scope.trade.p2.slots.forEach(function(slot) {
					if (slot.day.toLocaleDateString() == event.day.toLocaleDateString() && slot.day.getHours() == event.day.getHours()) {
						slot.day.setHours(slot.day.getHours() + Math.floor(Math.random() * 10) + 1);
						change = true;
					}
				});
			});
			op2String = JSON.stringify($scope.trade.p2.slots);
		} while (op2String != lastString);
		if (change) {
			$scope.trade.p1.accepted = $scope.trade.p2.accepted = false;
			$scope.processing = true;
			$http.put('/api/trades', $scope.trade).then(function(res) {
				$scope.processing = false;
				$scope.trade = res.data;
				$scope.fillCalendar();
				$scope.emitMessage("MOVED OVERLAPPED SLOTS", 'alert');
			}).then(null, function(err) {
				window.location.reload();
			});
		} else {
			$scope.calendarp1 = $scope.fillDateArrays($scope.p1Events, $scope.trade.p1.slots);
			$scope.calendarp2 = $scope.fillDateArrays($scope.p2Events, $scope.trade.p2.slots);
		}
	};
	$scope.fillCalendar();
	$scope.updateAlerts = function() {
		if ($scope.trade.p1.user._id == $scope.user._id) {
			$scope.trade.p1.alert = "none";
			$scope.trade.p1.online = true;
		}
		if ($scope.trade.p2.user._id == $scope.user._id) {
			$scope.trade.p2.alert = "none";
			$scope.trade.p2.online = true;
		}
		$scope.$parent.shownotification = false;
		$http.put('/api/trades', $scope.trade);
	};
	$scope.completeTrade = function() {
		$scope.processing = true;
		$scope.trade.p1.slots.forEach(function(slot) {
			var event = slot;
			event.type = 'traded';
			event.owner = $scope.trade.p2.user._id;
			$http.post('/api/events/repostEvents', event);
		});
		$scope.trade.p2.slots.forEach(function(slot) {
			var event = slot;
			event.type = 'traded';
			event.owner = $scope.trade.p1.user._id;
			$http.post('/api/events/repostEvents', event);
		});
		$scope.trade.p1.accepted = $scope.trade.p2.accepted = false;
		$scope.trade.p1.slots = $scope.trade.p2.slots = [];
		$http.put('/api/trades', $scope.trade).then(function(res) {
			setTimeout(function() {
				$scope.emitMessage('---- ' + $scope.user.soundcloud.username + " accepted the trade ----", 'alert');
				setTimeout(function() {
					$scope.processing = false;
					$scope.emitMessage("TRADE COMPLETED", 'alert');
				}, 500);
			}, 1500);
		}).then(null, console.log);
	};
	$scope.getStyle = function(event) {
		if (event.type == 'empty') {
			return {};
		} else if (event.type == 'trade') {
			return {
				'background-color': '#ADD8E6'
			};
		} else if (event.type == 'track' || event.type == 'queue' || event.type == 'paid') {
			return {
				'background-color': '#eeeeee',
				'color': 'rgba(0,0,0,0)'
			};
		} else if (event.type == 'traded') {
			if (event.owner == $scope.trade.p1.user._id || event.owner == $scope.trade.p2.user._id) {
				return {
					'background-color': '#FFE1AB'
				};
			} else {
				return {
					'background-color': '#eeeeee',
					'color': 'rgba(0,0,0,0)'
				};
			}
		}
	};
	$scope.dayOfWeekAsString = function(date) {
		var dayIndex = date.getDay();
		return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex];
	};
	$scope.unrepostSymbol = function(event) {
		if (!event.unrepostDate) return;
		event.unrepostDate = new Date(event.unrepostDate);
		return event.unrepostDate > new Date();
	};
	$scope.showBoxInfo = function(event) {
		return event.type == 'trade' || event.type == 'traded';
	};
	$scope.followerShow = function() {
		return screen.width > '436';
	};
	$scope.openHelpModal = function() {
		var displayText = "This interface shows your scheduler and the scheduler for the user you are trading with, labeled on the top of each respective schedule. Your calendar will always be on the left.<br/><br/><img src='assets/images/grey-slot.png'/> Grey slots represents slots that are already taken.<br><br/><img src='assets/images/blue-slot.png'/>  Blue slots represent slots that are being bargained in the trade.<br/><br/><img src='assets/images/arrow-slot.png'/>  An Arrow within a slot means it will be unreposted after 24 hours.<br/><br>The chat window on the bottom allows you to chat with your Repost Partner about your trade.<br/>Email will automatically open a new email on your mailing app, allowing you to message your repost partner via email for your trade.<br/><br/>How to use AU's Repost for Repost System:<br/>1. Start by deciding how you would like to trade with your partner.<br/>2. Mark slots on your calendar and mark slots on your partners calendar.<br/>3. Click accept<br/><br/>When your partner returns to AU, he will be able to accept your trade. If accepted, you will be able to schedule reposts on the slots designated on your partner’s calendar; your partner will be able to schedule reposts on the slots designated on your calendar. If you are away from keyboard at the time of your trade, tracks that are in your 'auto-fill' queue (hyperlink to autofill queu) in the scheduler will automatically be scheduled for repost.<br/><br/>Tips:<br/>1. Make sure you are fair with your trades. If you have half as many followers as your partner, offer 2 reposts on your calendar in exchange for 1 repost on theirs.<br />2. Make sure you check your trades on a regular basis. People are much more likely to constantly trade reposts with you if you are reliable.<br />3. Try communicating with the user on Facebook, Email, SoundCloud messenger or any messaging app to make sure they take action on trades when it is their turn. A friendly 'Hey, let me know when you accept the trade on AU! Thanks again for trading with me :)' is enough to ensure a good flow of communication for your trades!";
		$.Zebra_Dialog(displayText, {
			width: 900
		});
	};
	$scope.updateEmail = function(email) {
		var answer = email;
		var myArray = answer.match(/[a-z\._\-!#$%&'+/=?^_`{}|~]+@[a-z0-9\-]+\.\S{2,3}/igm);
		if (myArray) {
			$scope.user.email = answer;
			return $http.put('/api/database/profile', $scope.user).then(function(res) {
				SessionService.create(res.data);
				$scope.user = SessionService.getUser();
				$scope.hideall = false;
				$('#emailModal').modal('hide');
				$scope.showEmailModal = false;
			}).then(null, function(err) {
				setTimeout(function() {
					$scope.showEmailModal = false;
					$scope.promptForEmail();
				}, 600);
			});
		} else {
			setTimeout(function() {
				$scope.showEmailModal = false;
				$scope.promptForEmail();
			}, 600);
		}
	};
	$scope.promptForEmail = function() {
		if (!$scope.user.email) {
			$scope.showEmailModal = true;
			$('#emailModal').modal('show');
		}
	};
	$scope.verifyBrowser = function() {
		if (navigator.userAgent.search("Chrome") == -1 && navigator.userAgent.search("Safari") != -1) {
			var position = navigator.userAgent.search("Version") + 8;
			var end = navigator.userAgent.search(" Safari");
			var version = navigator.userAgent.substring(position, end);
			if (parseInt(version) < 9) {
				$.Zebra_Dialog('You have old version of safari. Click <a href="https://support.apple.com/downloads/safari">here</a> to download the latest version of safari for better site experience.', {
					'type': 'confirmation',
					'buttons': [{
						caption: 'OK'
					}],
					'onClose': function onClose() {
						$window.location.href = "https://support.apple.com/downloads/safari";
					}
				});
			} else {
				$scope.promptForEmail();
			}
		} else {
			$scope.promptForEmail();
		}
	};
	$scope.updateAlerts();
	$scope.verifyBrowser();
});
app.directive('timeSlot', function(moment) {
	return {
		restrict: 'E',
		scope: {
			startDate: "@",
			eachDate: '@',
			previousDate: '@'
		},
		link: function link(scope, element, attrs) {
			Date.prototype.addHours = function(h) {
				this.setHours(this.getHours() + h);
				return this;
			};
			var dateObj = {
				startDate: new Date(scope.startDate),
				eachDate: new Date(scope.eachDate),
				previousDate: scope.previousDate ? new Date(scope.previousDate) : null
			};
			var prevDate = dateObj.previousDate ? dateObj.previousDate.toLocaleString().split(',')[0] : null;
			var eacDate = dateObj.eachDate ? dateObj.eachDate.toLocaleString().split(',')[0] : null;
			var prvHours = dateObj.previousDate ? dateObj.previousDate.getHours() : 0;
			var echHours = dateObj.eachDate ? dateObj.eachDate.getHours() : 0;
			if (!prevDate) {
				scope.slot = isTodayDate(dateObj.previousDate, dateObj.eachDate) + ' ' + formatAMPM(dateObj.eachDate);
			} else if (prevDate != eacDate && prvHours != echHours) {
				scope.slot = isTodayDate(dateObj.previousDate, dateObj.eachDate) + ' ' + formatAMPM(dateObj.eachDate);
			} else if (prevDate == eacDate && prvHours != echHours) {
				scope.slot = isTodayDate(dateObj.previousDate, dateObj.eachDate) + ' ' + formatAMPM(dateObj.eachDate);
			} else if (prevDate != eacDate && prvHours == echHours) {
				scope.slot = isTodayDate(dateObj.previousDate, dateObj.eachDate) + ' ' + formatAMPM(dateObj.eachDate);
			}
		},
		replace: 'true',
		template: '<p class="time">{{slot}}</p>'
	};

	function isTodayDate(prevDate, eacDate) {
		if (moment().format('MM-DD-YYYY') == moment(prevDate).format('MM-DD-YYYY') || moment().format('MM-DD-YYYY') == moment(eacDate).format('MM-DD-YYYY')) {
			return 'Today, ';
		} else {
			return moment(eacDate).format('MMMM DD YYYY, ');
		}
	}

	function formatAMPM(date) {
		var hours = date.getHours();
		var minutes = date.getMinutes();
		var ampm = hours >= 12 ? 'PM' : 'AM';
		hours = hours % 12;
		hours = hours ? hours : 12;
		minutes = minutes < 10 ? '0' + minutes : minutes;
		var strTime = hours + ':' + minutes + ' ' + ampm;
		return strTime;
	}
});
'use strict';
app.factory('socket', function($rootScope) {
	var socket;
	return {
		on: function on(eventName, callback) {
			socket.on(eventName, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					callback.apply(socket, args);
				});
			});
		},
		emit: function emit(eventName, data, callback) {
			socket.emit(eventName, data, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			});
		},
		getMessage: function getMessage(eventName, data, callback) {
			socket.emit(eventName, data, function() {
				var args = arguments;
				$rootScope.$apply(function() {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			});
		},
		connect: function connect() {
			socket = io.connect();
		},
		disconnect: function disconnect() {
			socket.disconnect();
		}
	};
});
app.config(function($stateProvider) {
	$stateProvider.state('reForReLists', {
		url: '/artistTools/reForReLists',
		templateUrl: 'js/artistTools/reForReLists/reForReLists.html',
		controller: 'ReForReListsController',
		resolve: {
			currentTrades: function currentTrades($http, SessionService) {
				var user = SessionService.getUser();
				if (user) {
					var tradeType = {
						Requests: true,
						Requested: true,
						TradePartners: true
					};
					return $http.get('/api/trades/withUser/' + user._id + '?tradeType=' + JSON.stringify(tradeType)).then(function(res) {
						var trades = res.data;
						trades.forEach(function(trade) {
							trade.other = trade.p1.user._id == user._id ? trade.p2 : trade.p1;
							trade.user = trade.p1.user._id == user._id ? trade.p1 : trade.p2;
						});
						trades.sort(function(a, b) {
							if (a.user.alert == "change") {
								return -1;
							} else if (a.user.alert == "placement") {
								return -1;
							} else {
								return 1;
							}
						});
						return trades;
					});
				} else {
					return [];
				}
			},
			openTrades: function openTrades($http, SessionService) {
				var user = SessionService.getUser();
				if (user) {
					var minFollower = user.soundcloud.followers && user.soundcloud.followers > 0 ? parseInt(user.soundcloud.followers / 2) : 0;
					var maxFollower = user.soundcloud.followers && user.soundcloud.followers > 0 ? parseInt(user.soundcloud.followers * 2) : 1000;
					return $http.post('/api/users/bySCURL/', {
						url: '',
						minFollower: minFollower,
						maxFollower: maxFollower,
						recordRange: {
							skip: 0,
							limit: 12
						}
					}).then(function(res) {
						return res.data;
					});
				} else {
					return [];
				}
			}
		}
	});
});
app.controller("ReForReListsController", function($scope, $rootScope, currentTrades, openTrades, $http, SessionService, $state, $timeout) {
	if (!SessionService.getUser()) {
		$state.go('login');
		return;
	}
	$scope.state = 'reForReInteraction';
	$scope.user = SessionService.getUser();
	$rootScope.userlinkedAccounts = $scope.user.linkedAccounts ? $scope.user.linkedAccounts : [];
	$scope.currentTrades = currentTrades;
	$scope.currentTradesCopy = currentTrades;
	$scope.otherUsers = [];
	$scope.searchUser = openTrades;
	$scope.currentTab = "SearchTrade";
	$scope.searchURL = "";
	$scope.sliderSearchMin = Math.log($scope.user.soundcloud.followers ? parseInt($scope.user.soundcloud.followers / 2) : 0) / Math.log(1.1);
	$scope.sliderSearchMax = Math.log($scope.user.soundcloud.followers ? parseInt($scope.user.soundcloud.followers * 2) : 200000000) / Math.log(1.1);
	$scope.minSearchTradefollowers = Math.pow(1.1, $scope.sliderSearchMin);
	$scope.maxSearchTradefollowers = Math.pow(1.1, $scope.sliderSearchMax);
	$scope.sliderManageMin = 0;
	$scope.sliderManageMax = 200000000;
	$scope.minManageTradefollowers = Math.pow(1.1, $scope.sliderManageMin);
	$scope.maxManageTradefollowers = Math.pow(1.1, $scope.sliderManageMax);
	$scope.$watch(function() {
		return $scope.sliderSearchMin;
	}, function(newVal, oldVal) {
		$scope.minSearchTradefollowers = Math.pow(1.1, newVal);
	});
	$scope.$watch(function() {
		return $scope.sliderSearchMax;
	}, function(newVal, oldVal) {
		$scope.maxSearchTradefollowers = Math.pow(1.1, newVal);
	});
	$scope.$watch(function() {
		return $scope.sliderManageMin;
	}, function(newVal, oldVal) {
		$scope.minManageTradefollowers = Math.pow(1.1, newVal);
	});
	$scope.$watch(function() {
		return $scope.sliderManageMax;
	}, function(newVal, oldVal) {
		$scope.maxManageTradefollowers = Math.pow(1.1, newVal);
	});
	$scope.sortby = "Recent Alert";
	$scope.sort_order = "ascending";
	var searchTradeRange = {
		skip: 0,
		limit: 12
	};
	$scope.searchByFollowers = function() {
		$scope.searchURL = "";
		$scope.sendSearch();
	};
	$scope.sendSearch = function() {
		$scope.processing = true;
		$scope.searchUser = [];
		$http.post('/api/users/bySCURL/', {
			url: $scope.searchURL,
			minFollower: $scope.minSearchTradefollowers,
			maxFollower: $scope.maxSearchTradefollowers,
			recordRange: {
				skip: 0,
				limit: 12
			}
		}).then(function(res) {
			$scope.processing = false;
			$scope.searchUser = res.data;
		}).then(undefined, function(err) {
			$scope.success = false;
			$scope.processing = false;
			$scope.searchUser = [];
			$.Zebra_Dialog("Please enter Artist url.");
		}).then(null, function(err) {
			$scope.success = false;
			$scope.processing = false;
			$scope.searchUser = [];
			$.Zebra_Dialog("Did not find user.");
		});
	};
	$scope.hello = function(obj) {
		$state.go('reForReInteraction', obj);
	};
	$scope.searchCurrentTrade = function() {
		var cTrades = [];
		$scope.currentTrades = [];
		angular.forEach($scope.currentTradesCopy, function(trade) {
			if ($scope.searchURL != "") {
				var url = $scope.searchURL;
				url = url.toString().replace('http://', '').replace('https://', '');
				if (trade.other.user.soundcloud.permalinkURL.indexOf(url) != -1) {
					cTrades.push(trade);
				}
			} else if (parseInt($scope.maxManageTradefollowers) > 0) {
				if (trade.other.user.soundcloud.followers >= $scope.minManageTradefollowers && trade.other.user.soundcloud.followers <= $scope.maxManageTradefollowers) {
					cTrades.push(trade);
				}
			}
		});
		$scope.currentTrades = cTrades;
		$scope.$apply();
	};
	$scope.tradeType = {
		Requests: true,
		Requested: true,
		TradePartners: true
	};
	$scope.filterByTradeType = function() {
		$scope.processing = true;
		var tradeType = $scope.tradeType;
		tradeType = JSON.stringify(tradeType);
		$http.get('/api/trades/withUser/' + $scope.user._id + '?tradeType=' + tradeType).then(function(res) {
			var trades = res.data;
			$scope.currentTrades = [];
			trades.forEach(function(trade) {
				trade.other = trade.p1.user._id == $scope.user._id ? trade.p2 : trade.p1;
				trade.user = trade.p1.user._id == $scope.user._id ? trade.p1 : trade.p2;
			});
			$scope.currentTrades = trades;
			$scope.processing = false;
		});
	};
	$scope.sortResult = function(sortby) {
		$scope.sortby = sortby;
		var sort_order = $scope.sort_order;
		if (sortby == "Followers") {
			if (sort_order == "ascending") {
				$scope.currentTrades.sort(function(a, b) {
					return b.other.user.soundcloud.followers - a.other.user.soundcloud.followers;
				});
				$scope.sort_order = "descending";
			} else {
				$scope.currentTrades.sort(function(a, b) {
					return a.other.user.soundcloud.followers - b.other.user.soundcloud.followers;
				});
				$scope.sort_order = "ascending";
			}
		} else if (sortby == "Unfilled Slots") {
			if (sort_order == "ascending") {
				$scope.currentTrades.sort(function(a, b) {
					return b.unfilledTrackCount - a.unfilledTrackCount;
				});
				$scope.sort_order = "descending";
			} else {
				$scope.currentTrades.sort(function(a, b) {
					return a.unfilledTrackCount - b.unfilledTrackCount;
				});
				$scope.sort_order = "ascending";
			}
		} else {
			if (sort_order == "ascending") {
				$scope.currentTrades.sort(function(a, b) {
					return a.other.alert.toLowerCase() < b.other.alert.toLowerCase();
				});
				$scope.sort_order = "descending";
			} else {
				$scope.currentTrades.sort(function(a, b) {
					return a.other.alert.toLowerCase() > b.other.alert.toLowerCase();
				});
				$scope.sort_order = "ascending";
			}
		}
	};
	$scope.$on('loadTrades', function(e) {
		$scope.loadMore();
	});
	$scope.loadMore = function() {
		searchTradeRange.skip += 12;
		searchTradeRange.limit = 12;
		$http.post('/api/users/bySCURL/', {
			url: $scope.searchURL,
			minFollower: $scope.minSearchTradefollowers,
			maxFollower: $scope.maxSearchTradefollowers,
			recordRange: searchTradeRange
		}).then(function(res) {
			$scope.processing = false;
			if (res.data.length > 0) {
				angular.forEach(res.data, function(d) {
					$scope.searchUser.push(d);
				});
			}
		}).then(undefined, function(err) {
			$scope.success = false;
			$scope.processing = false;
			$scope.searchUser = [];
			$.Zebra_Dialog("Please enter Artist url.");
		}).then(null, function(err) {
			$scope.success = false;
			$scope.processing = false;
			$scope.searchUser = [];
			$.Zebra_Dialog("Did not find user.");
		});
	};
	$scope.openTrade = function(user) {
		var trade = {
			messages: [{
				date: new Date(),
				senderId: SessionService.getUser()._id,
				text: SessionService.getUser().soundcloud.username + ' opened a trade.',
				type: 'alert'
			}],
			tradeType: 'one-time',
			p1: {
				user: SessionService.getUser()._id,
				alert: "none",
				slots: [],
				accepted: false
			},
			p2: {
				user: user._id,
				alert: "change",
				slots: [],
				accepted: false
			}
		};
		$scope.processing = true;
		$http.post('/api/trades/new', trade).then(function(res) {
			$scope.processing = false;
			$state.go('reForReInteraction', {
				tradeID: res.data._id
			});
		}).then(null, function(err) {
			$scope.processing = false;
			$.Zebra_Dialog("Error in creating trade");
		});
	};
	$scope.deleteTrade = function(tradeID, index) {
		$.Zebra_Dialog('Are you sure? You want to delete this trade.', {
			'type': 'confirmation',
			'buttons': [{
				caption: 'Yes',
				callback: function callback() {
					$scope.processing = true;
					$http.post('/api/trades/delete', {
						id: tradeID
					}).then(function(res) {
						$scope.processing = false;
						$scope.currentTrades.splice(index, 1);
					}).then(null, function(err) {
						$scope.processing = false;
						$.Zebra_Dialog('Error accepting');
					});
				}
			}, {
				caption: 'No',
				callback: function callback() {
					console.log('No was clicked');
				}
			}]
		});
	};
	$scope.checkNotification = function() {
		angular.forEach(currentTrades, function(trade) {
			if (trade.p1.user._id == $scope.user._id) {
				if (trade.p1.alert == "change") {
					$scope.$parent.shownotification = true;
				}
			}
			if (trade.p2.user._id == $scope.user._id) {
				if (trade.p2.alert == "change") {
					$scope.$parent.shownotification = true;
				}
			}
		});
	};
	$scope.setCurrentTab = function(currentTab) {
		$scope.currentTab = currentTab;
	};
	$scope.openHelpModal = function() {
		if ($scope.currentTab == 'SearchTrade') {
			var displayText = "<span style='font-weight:bold'>Search Trade:</span> Here you will be able to find people to trade reposts with. By entering a SoundCloud User’s URL into the Search, you will find that user and then be able to initiate a trade with that user.<br/><br/>By clicking open trade, you will be led to our repost for repost interface.<br/><br/><a style='text-align:center; margin:0 auto;' href='mailto:coayscue@artistsunlimited.co?subject=Artists Unlimited Help' target='_top'>Email Tech Support</a>";
		} else if ($scope.currentTab == 'ManageTrade') {
			var displayText = "<span style='font-weight:bold'>Manage Trade:</span> Here you will be able to find the users you have already initiated trades with in the past, or people who have initiated a trade with you. By hovering over user’s icon, you will be able to enter into your trade or delete the trade with that given user.<br/><br/>By clicking manage while hovering over a user’s icon, the repost for repost interface will open.<br/><br/><a style='text-align:center; margin:0 auto;' href='mailto:coayscue@artistsunlimited.co?subject=Artists Unlimited Help' target='_top'>Email Tech Support</a>";
		}
		$.Zebra_Dialog(displayText, {
			width: 600
		});
	};
	$scope.verifyBrowser = function() {
		if (navigator.userAgent.search("Chrome") == -1 && navigator.userAgent.search("Safari") != -1) {
			var position = navigator.userAgent.search("Version") + 8;
			var end = navigator.userAgent.search(" Safari");
			var version = navigator.userAgent.substring(position, end);
			if (parseInt(version) < 9) {
				$.Zebra_Dialog('You have old version of safari. Click <a href="https://support.apple.com/downloads/safari">here</a> to download the latest version of safari for better site experience.', {
					'type': 'confirmation',
					'buttons': [{
						caption: 'OK'
					}],
					'onClose': function onClose() {
						$window.location.href = "https://support.apple.com/downloads/safari";
					}
				});
			}
		}
	};
	$scope.verifyBrowser();
	$scope.checkNotification();
	$scope.sortResult($scope.sortby);
});
app.factory('BroadcastFactory', function($http) {
	return {
		submitFacebookUserPost: function submitFacebookUserPost(postID, data) {
			return $http.post('/api/broadcast/' + postID + '/facebookuser', data);
		},
		submitFacebookPagePost: function submitFacebookPagePost(postID, data) {
			return $http.post('/api/broadcast/' + postID + '/facebookpage', data);
		},
		submitTwitterPost: function submitTwitterPost(postID, data) {
			return $http.post('/api/broadcast/' + postID + '/twitter', data);
		},
		submitYouTubePost: function submitYouTubePost(postID, data) {
			return $http.post('/api/broadcast/' + postID + '/youtube', data);
		},
		submitSoundCloudPost: function submitSoundCloudPost(postID, data) {
			return $http.post('/api/broadcast/' + postID + '/soundcloud', data);
		},
		submitInstagramPost: function submitInstagramPost(postID, data) {
			return $http.post('/api/broadcast/' + postID + '/instagram', data);
		}
	};
});
app.factory('StorageFactory', function($http) {
	return {
		uploadFile: function uploadFile(data) {
			var fd = new FormData();
			fd.append('file', data);
			return $http({
				method: 'POST',
				url: '/api/aws',
				headers: {
					'Content-Type': undefined
				},
				tranformRequest: angular.identify,
				data: fd
			}).then(function(response) {
				return response.data;
			});
		},
		addPost: function addPost(data) {
			return $http({
				method: 'POST',
				url: '/api/posts',
				data: data
			}).then(function(response) {
				return response.data;
			});
		},
		updatePost: function updatePost(post) {
			return $http({
				method: 'PUT',
				url: '/api/posts/' + post._id,
				data: {
					editedPost: post
				}
			}).then(function(response) {
				return response.data;
			});
		},
		updateReleaseStatus: function updateReleaseStatus(post) {
			return $http({
				method: 'PUT',
				url: '/api/posts/' + post._id + '/status'
			}).then(function(response) {
				return response.data;
			});
		},
		fetchAll: function fetchAll() {
			return $http({
				method: 'GET',
				url: '/api/posts'
			}).then(function(response) {
				return response.data;
			});
		},
		getPostForEdit: function getPostForEdit(post) {
			return $http({
				method: 'GET',
				url: '/api/posts/' + post.id
			}).then(function(response) {
				return response.data;
			});
		},
		deletePost: function deletePost(postID) {
			return $http({
				method: 'DELETE',
				url: '/api/posts/' + postID
			}).then(function(response) {
				return response.data;
			});
		},
		deleteSingleFile: function deleteSingleFile(keyName) {
			return $http({
				method: 'DELETE',
				url: '/api/aws/' + keyName
			}).then(function(response) {
				return response.data;
			});
		},
		deleteBothFiles: function deleteBothFiles(postID) {
			return $http({
				method: 'DELETE',
				url: '/api/aws/' + postID + '/both'
			}).then(function(response) {
				return response.data;
			});
		},
		broadcastPost: function broadcastPost(postID) {
			return $http({
				method: 'GET',
				url: '/api/posts/' + postID + '/broadcast'
			}).then(function(response) {
				return response.data;
			});
		},
		validateToken: function validateToken(userID, platform) {
			return $http({
				method: 'GET',
				url: '/api/posts/checkTokenValidity/' + userID + '/' + platform
			}).then(function(response) {
				return response.data;
			});
		}
	};
});
app.config(function($stateProvider) {
	$stateProvider.state('releaser', {
		url: '/artistTools/releaser',
		templateUrl: 'js/artistTools/releaser/releaseList.html',
		controller: 'ReleaserController',
		resolve: {
			posts: function posts() {
				return [];
			}
		}
	}).state('releaserNew', {
		url: '/artistTools/releaser/new',
		templateUrl: 'js/artistTools/releaser/releaser.html',
		controller: 'ReleaserController',
		resolve: {
			posts: function posts() {
				return [];
			}
		}
	}).state('releaserEdit', {
		url: '/artistTools/releaser/edit/:releaseID',
		templateUrl: 'js/artistTools/releaser/releaser.html',
		controller: 'ReleaserController',
		resolve: {
			posts: function posts() {
				return [];
			}
		}
	});
});
app.controller('ReleaserController', function($scope, posts, StorageFactory, BroadcastFactory, $state, SessionService, $stateParams, $window) {
	$scope.user = SessionService.getUser();
	if (!$scope.user) {
		$state.go('login');
		return;
	}
	var date = new Date();
	$scope.currentDate = date.toISOString().slice(0, 10).replace(/-/g, "-");

	function getDayClass(data) {
		var date = data.date,
		mode = data.mode;
		if (mode === 'day') {
			var dayToCheck = new Date(date).setHours(0, 0, 0, 0);
			for (var i = 0; i < $scope.events.length; i++) {
				var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);
				if (dayToCheck === currentDay) {
					return $scope.events[i].status;
				}
			}
		}
		return '';
	}
	$scope.inlineOptions = {
		customClass: getDayClass,
		showWeeks: true
	};
	$scope.dateOptions = {
		startingDay: 1
	};
	$scope.open1 = function() {
		$scope.popup1.opened = true;
	};
	$scope.popup1 = {
		opened: false
	};
	$scope.postData = {};
	$scope.audio = {};
	$scope.video = {};
	$scope.image = {};
	var oldPostData = {};
	$scope.posts = posts;
	var audioSelectionChanged = function audioSelectionChanged() {
		if ($scope.audio.file) {
			return $scope.audio.file.name && oldPostData.awsAudioKeyName !== $scope.audio.file.name;
		}
	};
	var videoSelectionChanged = function videoSelectionChanged() {
		if ($scope.video.file) {
			return $scope.video.file.name && oldPostData.awsVideoKeyName !== $scope.video.file.name;
		}
	};
	var imageSelectionChanged = function imageSelectionChanged() {
		if ($scope.image.file) {
			return $scope.image.file.name && oldPostData.awsImageKeyName !== $scope.image.file.name;
		}
	};
	$scope.savePost = function() {
		if (!$scope.postData._id) {
			return addPost();
		} // audio ,video and image are being changed
		else if (audioSelectionChanged() && videoSelectionChanged() && imageSelectionChanged()) {
			return StorageFactory.deleteBothFiles($scope.postData._id).then(function() {
				return StorageFactory.uploadFile($scope.audio.file);
			}).then(function(res) {
				$scope.postData.awsAudioKeyName = res;
				return StorageFactory.uploadFile($scope.video.file);
			}).then(function(res) {
				$scope.postData.awsVideoKeyName = res;
				return StorageFactory.uploadFile($scope.image.file);
			}).then(function(res) {
				$scope.postData.awsImageKeyName = res;
				return StorageFactory.updatePost($scope.postData);
			}).then(function(post) {
				$state.reload();
			})['catch'](function(error) {
				$.Zebra_Dialog(error, {
					width: 600
				});
			});
		} // only audio is being changed
		else if (audioSelectionChanged()) {
			return StorageFactory.deleteSingleFile(oldPostData.awsAudioKeyName).then(function() {
				return StorageFactory.uploadFile($scope.audio.file);
			}).then(function(res) {
				$scope.postData.awsAudioKeyName = res;
				return StorageFactory.updatePost($scope.postData);
			}).then(function() {
				$state.reload();
			})['catch'](function(error) {
				$.Zebra_Dialog(error, {
					width: 600
				});
			});
		} // only video is being changed
		else if (videoSelectionChanged()) {
			return StorageFactory.deleteSingleFile(oldPostData.awsVideoKeyName).then(function() {
				return StorageFactory.uploadFile($scope.video.file);
			}).then(function(res) {
				$scope.postData.awsVideoKeyName = res;
				return StorageFactory.updatePost($scope.postData);
			}).then(function() {
				$state.reload();
			})['catch'](function(error) {
				$.Zebra_Dialog(error, {
					width: 600
				});
			});
		} // only image is being changed
		else if (imageSelectionChanged()) {
			return StorageFactory.deleteSingleFile(oldPostData.awsImageKeyName).then(function() {
				return StorageFactory.uploadFile($scope.image.file);
			}).then(function(res) {
				$scope.postData.awsImageKeyName = res;
				return StorageFactory.updatePost($scope.postData);
			}).then(function() {
				$state.reload();
			})['catch'](function(error) {
				$.Zebra_Dialog(error, {
					width: 600
				});
			});
		} // neither audio nor video is changing
		else { // var errMsg = validateForm();
			// if(errMsg == ""){
				return StorageFactory.updatePost($scope.postData).then(function(post) {
					$state.go('releaser');
				})['catch'](function(error) {
					$.Zebra_Dialog(error, {
						width: 600
					});
			}); // }
			// else{
			//   $.Zebra_Dialog(errMsg,{
			//     width: 600
			//   });
			// }
		}
	};
	var addPost = function addPost() {
		var errMsg = validateForm();
		if (errMsg == "") {
			$scope.processing = true;
			$scope.postData.userID = $scope.user._id;
			StorageFactory.uploadFile($scope.audio.file).then(function(res) {
				$scope.postData.awsAudioKeyName = res.key;
				return StorageFactory.uploadFile($scope.video.file);
			}).then(function(res) {
				$scope.postData.awsVideoKeyName = res.key;
				return StorageFactory.uploadFile($scope.image.file);
			}).then(function(res) {
				$scope.postData.awsImageKeyName = res.key;
				return StorageFactory.addPost($scope.postData);
			}).then(function() {
				$scope.processing = false;
				$state.go('releaser');
			})['catch'](function(error) {
				$scope.processing = false;
				$.Zebra_Dialog(error, {
					width: 600
				});
			});
		} else {
			$.Zebra_Dialog(errMsg, {
				width: 600
			});
		}
	};
	var validateForm = function validateForm() {
		var isSCPanelOpen = $("#pnlSoundCloud").hasClass("in");
		var isFBPanelOpen = $("#pnlFacebook").hasClass("in");
		var isTWPanelOpen = $("#pnlTwitter").hasClass("in");
		var isYTPanelOpen = $("#pnlYoutube").hasClass("in");
		var message = "";
		if ($scope.postData.postTitle == undefined) {
			message += "Post title is required. <br />";
		}
		if ($scope.postData.postDate == undefined) {
			message += "Post date is required. <br />";
		}
		if (!isSCPanelOpen && !isFBPanelOpen && !isTWPanelOpen && !isYTPanelOpen) {
			message += "Please enter atleast one of the social site posting information. <br />";
		} else {
			if (isSCPanelOpen) {
				if ($scope.postData.awsAudioKeyName == undefined && $scope.audio.file == undefined || $scope.postData.soundCloudTitle == undefined || $scope.postData.soundCloudDescription == undefined) {
					message += "All Soundcloud posting informations are required. <br />";
				}
			}
			if (isFBPanelOpen) {
				if ($scope.postData.facebookPost == undefined || $scope.facebookCommentOn == "page" && $scope.facebookPageUrl == undefined) {
					message += "All Facebook posting informations are required. <br />";
				}
			}
			if (isTWPanelOpen) {
				if ($scope.postData.twitterPost == undefined) {
					message += "All Twitter posting informations are required. <br />";
				}
			}
			if (isYTPanelOpen) {
				if ($scope.postData.awsVideoKeyName == undefined && $scope.video.file == undefined || $scope.postData.youTubeTitle == undefined || $scope.youTubeDescription == undefined) {
					message += "All Youtube posting informations are required. <br />";
				}
			}
		}
		return message;
	};
	$scope.deletePost = function(index) {
		var postId = $scope.posts[index]._id;
		StorageFactory.deletePost(postId).then(function() {
			$state.reload();
		})['catch'](function(error) {
			$.Zebra_Dialog(error, {
				width: 600
			});
		});
	};
	$scope.editPost = function(post) {
		$scope.postData = post;
		oldPostData = post;
	};
	$scope.getPost = function() {
		$scope.posts = [];
		StorageFactory.fetchAll().then(function(res) {
			$scope.posts = res;
		});
	}; /* Method for getting post in case of edit */
	$scope.getPostInfo = function(releaseID) {
		StorageFactory.getPostForEdit({
			id: releaseID
		}).then(handleResponse)['catch'](handleError);

		function handleResponse(res) {
			$scope.postData = res;
		}

		function handleError(res) {}
		$scope.processing = false;
	};
	$scope.checkIfEdit = function() {
		if ($stateParams.releaseID) {
			$scope.getPostInfo($stateParams.releaseID);
		}
	};
	$scope.broadcastPost = function(post) {
		var isValid = true;
		var message = "It seems you did not authenticate to the social sites before releasing the post. We did not found followin missing tokens - <br />";
		if (post.facebookPost != "" && !$scope.user.facebook && !$scope.user.facebook.token) {
			isValid = false;
			message += "Facebook token is missing. <br />";
		}
		if (post.twitterPost != "" && !$scope.user.twitter && !$scope.user.twitter.token) {
			isValid = false;
			message += "Twitter token is missing. <br />";
		}
		if (post.awsVideoKeyName != "" && !$scope.user.google && !$scope.user.google.token) {
			isValid = false;
			message += "Google token is missing. <br />";
		}
		message += "Please use the links to below Add New Post button to get the social site auth tokens.";
		if (isValid) {
			$scope.processing = true;
			BroadcastFactory[post.facebookPageUrl ? 'submitFacebookPagePost' : 'submitFacebookUserPost'](post._id, {
				token: $scope.user.facebook.token,
				facebookUserPost: post.facebookPost
			}).then(function(res) {
				if ($scope.user.twitter.token) {
					BroadcastFactory.submitTwitterPost(post._id, {
						token: $scope.user.twitter.token,
						tokenSecret: $scope.user.twitter.tokenSecret,
						twitterPost: post.twitterPost
					});
				}
				return false;
			}).then(function(res) {
				if ($scope.user.google.token) {
					return BroadcastFactory.submitYouTubePost(post._id, {
						token: $scope.user.google.token,
						awsVideoKeyName: post.awsVideoKeyName
					});
				}
				return false;
			}).then(function(res) {
				return BroadcastFactory.submitSoundCloudPost(post._id, {
					awsAudioKeyName: post.awsAudioKeyName
				});
			}).then(function(res) {
				if (post.awsAudioKeyName) {
					SC.initialize({
						client_id: '8002f0f8326d869668523d8e45a53b90',
						oauth_token: $scope.user.soundcloud.token
					});
					var trackFile = new File(res.data.Body.data, post.awsAudioKeyName, {
						type: 'audio/mp3'
					});
					SC.upload({
						file: trackFile,
						title: post.soundCloudTitle,
						description: post.soundCloudDescription
					}).then(function(res) {
						StorageFactory.updateReleaseStatus(post).then(function(res) {
							$scope.getPost();
							$scope.processing = false;
						});
					})['catch'](function(error) {
						$scope.processing = false;
						console.log('error', error);
					});
				}
				return false;
			}).then(function(res) {
				if (post.awsImageKeyName) {
					return BroadcastFactory.submitInstagramPost(post._id, {
						token: $scope.user.instagram.token,
						instagramPost: post.instagramPost
					});
				} else {
					StorageFactory.updateReleaseStatus(post).then(function(res) {
						$scope.getPost();
						$scope.processing = false;
					});
				}
			});
		} else {
			$.Zebra_Dialog(message, {
				width: 600
			});
		}
	}; // CLOSES $scope.broadcastPost
	$scope.socialLogin = function(url) {
		$window.location = url;
	};
	$scope.checkFBToken = function() {
		if ($scope.user.facebook && $scope.user.facebook.token != "") {
			StorageFactory.validateToken($scope.user._id, 'facebook').then(function(res) {
				if (res) {
					SessionService.create(res.data);
					$scope.user = SessionService.getUser();
				}
			});
		}
	};
	$scope.checkGoogleToken = function() {
		if ($scope.user.google && $scope.user.google.token != "") {
			StorageFactory.validateToken($scope.user._id, 'google').then(function(res) {
				if (res) {
					SessionService.create(res.data);
					$scope.user = SessionService.getUser();
				}
			});
		}
	};
	$scope.checkFBToken();
	$scope.checkGoogleToken();
}); // CLOSES app.controller
app.config(function($stateProvider) {
	$stateProvider.state('artistToolsScheduler', {
		url: '/artistTools/scheduler',
		templateUrl: 'js/artistTools/scheduler/scheduler.html',
		controller: 'ATSchedulerController',
		resolve: {
			events: function events($http, $window, SessionService) {
				if (!SessionService.getUser()) {
					$window.localStorage.setItem('returnstate', 'artistToolsScheduler');
					$window.location.href = '/login';
				}
				return $http.get('/api/events/forUser/' + SessionService.getUser().soundcloud.id).then(function(res) {
					return res.data;
				}).then(null, function(err) {
					$.Zebra_Dialog("error getting your events");
					return;
				});
			}
		}
	});
});
app.controller('ATSchedulerController', function($rootScope, $state, $scope, $http, AuthService, $window, events, SessionService) {
	if (!SessionService.getUser()) {
		$state.go('login');
	} else {
		$window.localStorage.removeItem('returnstate');
	}
	$scope.user = SessionService.getUser();
	$scope.showEmailModal = false;
	$rootScope.userlinkedAccounts = $scope.user.linkedAccounts ? $scope.user.linkedAccounts : [];
	$scope.makeEventURL = "";
	$scope.showOverlay = false;
	$scope.processiong = false;
	events.forEach(function(ev) {
		ev.day = new Date(ev.day);
	});
	$scope.events = events;
	$scope.hideall = false;
	$scope.dayIncr = 0;
	$scope.autoFillTracks = [];
	$scope.trackList = [];
	$scope.trackListObj = null;
	$scope.trackListSlotObj = null;
	$scope.newQueueSong = "";
	$scope.trackArtistID = 0;
	$scope.trackType = "";
	$scope.trackChange = function(index) {
		$scope.makeEventURL = $scope.trackListSlotObj.permalink_url;
		$scope.changeURL();
	};
	$scope.trackListChange = function(index) {
		$scope.newQueueSong = $scope.trackListObj.permalink_url;
		$scope.changeQueueSong();
	};
	$scope.getTrackListFromSoundcloud = function() {
		var profile = $scope.user;
		if (profile.soundcloud) {
			$scope.processing = true;
			SC.get('/users/' + profile.soundcloud.id + '/tracks', {
				filter: 'public'
			}).then(function(tracks) {
				$scope.trackList = tracks;
				$scope.processing = false;
				$scope.$apply();
			})['catch'](function(response) {
				$scope.processing = false;
				$scope.$apply();
			});
		}
	};
	$scope.openHelpModal = function() {
		var displayText = "Schedule your reposts using the assigned slots, and indicate your preference for un-reposting after 24 hours. Keep in mind that the scheduler will not allow you to repost and un-repost within a period of 48 hours.Arrow icons pointing downwards indicate that you have marked the track to be un-reposted after 24 hours.Orange-colored slots are reserved for trades initiated using the repost-for-repost platform.<br><br><a style='text-align:center; margin:0 auto;' href='mailto:coayscue@artistsunlimited.co?subject=Artists Unlimited Help' target='_top'>Email Tech Support</a>";
		$.Zebra_Dialog(displayText, {
			width: 600
		});
	};
	$scope.saveUser = function() {
		$scope.processing = true;
		$http.put("/api/database/profile", $scope.user).then(function(res) {
			SessionService.create(res.data);
			$scope.user = SessionService.getUser();
			$scope.processing = false;
		}).then(null, function(err) {
			$.Zebra_Dialog("Error: did not save");
			$scope.processing = false;
		});
	};
	$scope.dayIncr = 0;
	$scope.incrDay = function() {
		if ($scope.dayIncr < 21) $scope.dayIncr++;
	};
	$scope.decrDay = function() {
		if ($scope.dayIncr > 0) $scope.dayIncr--;
	};
	$scope.clickedSlot = function(day, hour) {
		var today = new Date();
		if (today.toLocaleDateString() == day.toLocaleDateString() && today.getHours() > hour) return;
		$scope.showOverlay = true;
		var calDay = {};
		var calendarDay = $scope.calendar.find(function(calD) {
			return calD.day.toLocaleDateString() == day.toLocaleDateString();
		});
		$scope.makeEventURL = undefined;
		$scope.trackListSlotObj = undefined;
		$scope.makeEvent = JSON.parse(JSON.stringify(calendarDay.events[hour])); // if ($scope.makeEvent.type == 'traded' || $scope.makeEvent.type == 'paid') {
		//   $scope.showOverlay = false;
		//   $scope.makeEvent = undefined;
		//   $.Zebra_Dialog("Cannot manage a traded or paid slot.");
		//   return;
		// }
		if ($scope.makeEvent.type == "empty") {
			var makeDay = new Date(day);
			makeDay.setHours(hour);
			$scope.makeEvent = {
				userID: $scope.user.soundcloud.id,
				day: makeDay,
				type: "track"
			};
			$scope.makeEvent.unrepostDate = new Date($scope.makeEvent.day.getTime() + 24 * 60 * 60 * 1000);
			$scope.makeEvent.unrepost = true;
			$scope.newEvent = true;
		} else {
			$scope.makeEvent.day = new Date($scope.makeEvent.day);
			$scope.makeEvent.unrepostDate = new Date($scope.makeEvent.unrepostDate);
			$scope.makeEvent.unrepost = $scope.makeEvent.unrepostDate > new Date();
			$scope.makeEventURL = $scope.makeEvent.trackURL;
			SC.oEmbed('https://api.soundcloud.com/tracks/' + $scope.makeEvent.trackID, {
				element: document.getElementById('scPlayer'),
				auto_play: false,
				maxheight: 150
			});
			$scope.newEvent = false;
		}
	};
	$scope.changeQueueSlot = function() {
		$scope.makeEvent.title = null;
		$scope.makeEvent.trackURL = null;
		$scope.makeEvent.artistName = null;
		$scope.makeEvent.trackID = null;
		$scope.makeEventURL = null;
	};
	$scope.changeURL = function() {
		if ($scope.makeEventURL) {
			$scope.processing = true;
			$http.post('/api/soundcloud/resolve', {
				url: $scope.makeEventURL
			}).then(function(res) {
				$scope.trackArtistID = res.data.user.id;
				$scope.trackType = res.data.kind;
				if (res.data.kind != "playlist") {
					if (res.data.user.id != $scope.user.soundcloud.id) {
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
					} else {
						$scope.notFound = false;
						$scope.processing = false;
						$.Zebra_Dialog("You cannot repost your own track.");
					}
				} else {
					$scope.notFound = false;
					$scope.processing = false;
					$.Zebra_Dialog("Sorry! We don't allow scheduling playlists here. Please enter a track url instead.");
				}
			}).then(null, function(err) {
				$.Zebra_Dialog("We are not allowed to access tracks by this artist with the Soundcloud API. We apologize for the inconvenience, and we are working with Soundcloud to resolve this issue.");
				document.getElementById('scPlayer').style.visibility = "hidden";
				$scope.notFound = true;
				$scope.processing = false;
			});
		}
	};
	$scope.deleteEvent = function() {
		if (!$scope.newEvent) {
			$scope.processing = true;
			$http['delete']('/api/events/repostEvents/' + $scope.makeEvent._id).then(function(res) {
				return $scope.refreshEvents();
			}).then(function(res) {
				$scope.showOverlay = false;
				$scope.processing = false;
			}).then(null, function(err) {
				$scope.processing = false;
				$.Zebra_Dialog("ERROR: Did not delete.");
			});
		} else {
			var calendarDay = $scope.calendar.find(function(calD) {
				return calD.day.toLocaleDateString() == $scope.makeEvent.day.toLocaleDateString();
			});
			calendarDay.events[$scope.makeEvent.day.getHours()] = {
				type: "empty"
			};
			var events;
			$scope.showOverlay = false;
		}
	};
	$scope.setCalendarEvent = function(event) {
		event.day = new Date(event.day);
		var calendarDay = $scope.calendar.find(function(calD) {
			return calD.day.toLocaleDateString() == event.day.toLocaleDateString();
		});
		calendarDay.events[event.day.getHours()] = event;
	};
	$scope.changeUnrepost = function() {
		if ($scope.makeEvent.unrepost) {
			$scope.makeEvent.day = new Date($scope.makeEvent.day);
			$scope.makeEvent.unrepostDate = new Date($scope.makeEvent.day.getTime() + 24 * 60 * 60 * 1000);
		} else {
			$scope.makeEvent.unrepostDate = new Date(0);
		}
	};
	$scope.findUnrepostOverlap = function() {
		if (!$scope.makeEvent.trackID) return false;
		var blockEvents = $scope.events.filter(function(event) {
			event.day = new Date(event.day);
			event.unrepostDate = new Date(event.unrepostDate);
			if (moment($scope.makeEvent.day).format('LLL') == moment(event.day).format('LLL') && $scope.makeEvent.trackID == event.trackID) return false;
			return $scope.makeEvent.trackID == event.trackID && event.unrepostDate.getTime() > $scope.makeEvent.day.getTime() - 24 * 3600000 && event.day.getTime() < $scope.makeEvent.unrepostDate.getTime() + 24 * 3600000;
		});
		return blockEvents.length > 0;
	};
	$scope.saveEvent = function() {
		if ($scope.trackType == "playlist") {
			$.Zebra_Dialog("Sorry! We don't currently allow playlist reposting. Please enter a track url instead.");
			return;
		} else if ($scope.trackArtistID == $scope.user.soundcloud.id) {
			$.Zebra_Dialog("Sorry! You cannot schedule your own track to be reposted.");
			return;
		} else if ($scope.findUnrepostOverlap()) {
			$.Zebra_Dialog('Issue! This repost will cause this track to be both unreposted and reposted within a 24 hour time period. If you are unreposting, please allow 48 hours between scheduled reposts.');
			return;
		}
		if (!$scope.makeEvent.trackID && $scope.makeEvent.type == "track") {
			$.Zebra_Dialog("Enter a track URL");
		} else {
			$scope.processing = true;
			if ($scope.newEvent) {
				var req = $http.post('/api/events/repostEvents', $scope.makeEvent);
			} else {
				var req = $http.put('/api/events/repostEvents', $scope.makeEvent);
			}
			req.then(function(res) {
				$scope.trackType = "";
				$scope.trackArtistID = 0;
				return $scope.refreshEvents();
			}).then(function(res) {
				$scope.showOverlay = false;
				$scope.processing = false;
				$scope.trackType = "";
				$scope.trackArtistID = 0;
			}).then(null, function(err) {
				$scope.processing = false;
				$.Zebra_Dialog("ERROR: Did not save.");
			});
		}
	};
	$scope.emailSlot = function() {
		var mailto_link = "mailto:?subject=Repost of " + $scope.makeEvent.title + '&body=Hey,\n\n I am reposting your song ' + $scope.makeEvent.title + ' on ' + $scope.user.soundcloud.username + ' on ' + $scope.makeEvent.day.toLocaleDateString() + '.\n\n Best, \n' + $scope.user.soundcloud.username;
		location.href = encodeURI(mailto_link);
	};
	$scope.backEvent = function() {
		$scope.makeEvent = null;
		$scope.trackType = "";
		$scope.trackArtistID = 0;
		$scope.showOverlay = false;
	};
	$scope.removeQueueSong = function(index) {
		$scope.user.queue.splice(index, 1);
		$scope.saveUser();
		$scope.loadQueueSongs();
	};
	$scope.addSong = function() {
		if ($scope.user.queue.indexOf($scope.newQueueID) != -1) return;
		$scope.user.queue.push($scope.newQueueID);
		$scope.saveUser();
		$scope.newQueueSong = undefined;
		$scope.trackListObj = "";
		$scope.newQueue = undefined;
		$scope.loadQueueSongs();
	};
	$scope.changeQueueSong = function() {
		if ($scope.newQueueSong != "") {
			$scope.processing = true;
			$http.post('/api/soundcloud/resolve', {
				url: $scope.newQueueSong
			}).then(function(res) {
				$scope.processing = false;
				var track = res.data;
				$scope.newQueue = track;
				$scope.newQueueID = track.id;
			}).then(null, function(err) {
				$.Zebra_Dialog("We are not allowed to access tracks by this artist with the Soundcloud API. We apologize for the inconvenience, and we are working with Soundcloud to resolve this issue.");
				$scope.processing = false;
			});
		}
	};
	$scope.moveUp = function(index) {
		if (index == 0) return;
		var s = $scope.user.queue[index];
		$scope.user.queue[index] = $scope.user.queue[index - 1];
		$scope.user.queue[index - 1] = s;
		$scope.saveUser();
		$scope.loadQueueSongs();
	};
	$scope.moveDown = function(index) {
		if (index == $scope.user.queue.length - 1) return;
		var s = $scope.user.queue[index];
		$scope.user.queue[index] = $scope.user.queue[index + 1];
		$scope.user.queue[index + 1] = s;
		$scope.saveUser();
		$scope.loadQueueSongs();
	};
	$scope.loadQueueSongs = function(queue) {
		$scope.autoFillTracks = [];
		$scope.user.queue.forEach(function(songID) {
			SC.get('/tracks/' + songID).then(function(track) {
				$scope.autoFillTracks.push(track);
				$scope.$digest();
			}, console.log);
		});
	};
	if ($scope.user && $scope.user.queue) {
		$scope.loadQueueSongs();
	}
	$scope.dayOfWeekAsString = function(date) {
		var dayIndex = date.getDay();
		if (screen.width > '744') {
			return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex];
		}
		return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayIndex];
	};
	$scope.unrepostSymbol = function(event) {
		if (!event.unrepostDate) return;
		event.unrepostDate = new Date(event.unrepostDate);
		return event.unrepostDate > new Date();
	};
	$scope.getStyle = function(event) {
		if (event.type == 'empty') {
			return {};
		} else if (event.type == 'track' || event.type == 'queue') {
			return {
				'background-color': '#67f967'
			};
		} else if (event.type == 'traded') {
			return {
				'background-color': '#FFDA97'
			};
		} else if (event.type == 'paid') {
			return {
				'background-color': '#FFBBDD'
			};
		}
	};
	$scope.refreshEvents = function() {
		return $http.get('/api/events/forUser/' + SessionService.getUser().soundcloud.id).then(function(res) {
			var events = res.data;
			events.forEach(function(ev) {
				ev.day = new Date(ev.day);
			});
			$scope.events = events;
			$scope.calendar = $scope.fillDateArrays(events);
		});
	};
	$scope.fillDateArrays = function(events) {
		var calendar = [];
		var today = new Date();
		for (var i = 0; i < 29; i++) {
			var calDay = {};
			calDay.day = new Date();
			calDay.day.setDate(today.getDate() + i);
			var dayEvents = events.filter(function(ev) {
				return ev.day.toLocaleDateString() == calDay.day.toLocaleDateString();
			});
			var eventArray = [];
			for (var j = 0; j < 24; j++) {
				eventArray[j] = {
					type: "empty"
				};
			}
			dayEvents.forEach(function(ev) {
				eventArray[ev.day.getHours()] = ev;
			});
			calDay.events = eventArray;
			calendar.push(calDay);
		}
		return calendar;
	};
	$scope.calendar = $scope.fillDateArrays(events);
	$scope.updateEmail = function(email) {
		var answer = email;
		var myArray = answer.match(/[a-z\._\-!#$%&'+/=?^_`{}|~]+@[a-z0-9\-]+\.\S{2,3}/igm);
		if (myArray) {
			$scope.user.email = answer;
			return $http.put('/api/database/profile', $scope.user).then(function(res) {
				SessionService.create(res.data);
				$scope.user = SessionService.getUser();
				$scope.hideall = false;
				$('#emailModal').modal('hide');
				$scope.showEmailModal = false;
			}).then(null, function(err) {
				setTimeout(function() {
					$scope.showEmailModal = false;
					$scope.promptForEmail();
				}, 600);
			});
		} else {
			setTimeout(function() {
				$scope.showEmailModal = false;
				$scope.promptForEmail();
			}, 600);
		}
	};
	$scope.promptForEmail = function() {
		if (!$scope.user.email) {
			$scope.showEmailModal = true;
			$('#emailModal').modal('show');
		}
	};
	$scope.verifyBrowser = function() {
		if (navigator.userAgent.search("Chrome") == -1 && navigator.userAgent.search("Safari") != -1) {
			var position = navigator.userAgent.search("Version") + 8;
			var end = navigator.userAgent.search(" Safari");
			var version = navigator.userAgent.substring(position, end);
			if (parseInt(version) < 9) {
				$.Zebra_Dialog('You have old version of safari. Click <a href="https://support.apple.com/downloads/safari">here</a> to download the latest version of safari for better site experience.', {
					'type': 'confirmation',
					'buttons': [{
						caption: 'OK'
					}],
					'onClose': function onClose() {
						$window.location.href = "https://support.apple.com/downloads/safari";
					}
				});
			} else {
				$scope.promptForEmail();
			}
		} else {
			$scope.promptForEmail();
		}
	};
	$scope.verifyBrowser();
});
app.config(function($stateProvider) {
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
app.controller('AuthController', function($rootScope, $state, $stateParams, $scope, $http, $uibModal, $window, AuthService, SessionService, socket) {
	$scope.loginObj = {};
	$scope.message = {
		val: '',
		visible: false
	};
	if (SessionService.getUser()) {
		$state.go('reForReLists');
	}
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
	$scope.login = function() {
		$scope.message = {
			val: '',
			visible: false
		};
		AuthService.login($scope.loginObj).then(handleLoginResponse)['catch'](handleLoginError);

		function handleLoginResponse(res) {
			if (res.status === 200 && res.data.success) {
				SessionService.create(res.data.user);
				$state.go('reForReLists');
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
	$scope.thirdPartyLogin = function(userdata) {
		AuthService.thirdPartylogin(userdata).then(handleLoginResponse)['catch'](handleLoginError);

		function handleLoginResponse(res) {
			if (res.status === 200 && res.data.success) {
				SessionService.create(res.data.user);
				$state.go('reForReLists');
			} else {
				$.Zebra_Dialog("Invalid Username OR Password.");
			}
		}

		function handleLoginError(res) {
			$.Zebra_Dialog("Error in processing your request");
		}
	};
	$scope.checkIfSubmission = function() {
		if ($stateParams.submission) {
			$scope.soundcloudLogin();
		}
	};
	$scope.signup = function() {
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
	$scope.soundcloudLogin = function() {
		$scope.processing = true;
		SC.connect().then(function(res) {
			$rootScope.accessToken = res.oauth_token;
			return $http.post('/api/login/soundCloudLogin', {
				token: res.oauth_token,
				password: 'test'
			});
		}).then(function(res) {
			$scope.processing = false;
			SessionService.create(res.data.user);
			if ($stateParams.submission) {
				$state.go('artistToolsDownloadGatewayNew', {
					'submission': $stateParams.submission
				});
				return;
			}
			$scope.processing = false;
			if ($window.localStorage.getItem('returnstate') != undefined) {
				if ($window.localStorage.getItem('returnstate') == "reForReInteraction") {
					$state.go($window.localStorage.getItem('returnstate'), {
						tradeID: $window.localStorage.getItem('tid')
					});
				} else if ($window.localStorage.getItem('returnstate') == "artistToolsDownloadGatewayEdit") {
					$state.go($window.localStorage.getItem('returnstate'), {
						gatewayID: $window.localStorage.getItem('tid')
					});
				} else {
					$state.go($window.localStorage.getItem('returnstate'));
				}
			} else {
				$state.go('reForReLists');
			}
		}).then(null, function(err) {
			$.Zebra_Dialog('Error: Could not log in');
			$scope.processing = false;
		});
	};
});
app.factory('AuthService', ['$http', function($http) {
	function login(data) {
		return $http.post('/api/login', data);
	}

	function signup(data) {
		return $http.post('/api/signup', data);
	}

	function thirdPartylogin(data) {
		return $http.post('/api/login/thirdPartylogin', data);
	}
	return {
		login: login,
		signup: signup,
		thirdPartylogin: thirdPartylogin
	};
}]);
app.factory('SessionService', function($cookies, $http, $window) {
	function create(data) {
		$window.localStorage.setItem('user', JSON.stringify(data));
	}

	function deleteUser() {
		$window.localStorage.removeItem('user');
	}

	function getUser() {
		try {
			var user = JSON.parse($window.localStorage.getItem('user'));
			if (user) {
				return user;
			}
		} catch (e) {}
	}

	function refreshUser() {
		var curUser = getUser();
		if (curUser) {
			$http.get('/api/users/byId/' + curUser._id).then(function(res) {
				create(res.data);
			});
		}
	}
	return {
		create: create,
		deleteUser: deleteUser,
		getUser: getUser,
		refreshUser: refreshUser
	};
});
app.config(function($stateProvider) {
	$stateProvider.state('/customsubmit', {
		url: '/customsubmit',
		templateUrl: 'js/customSubmit/views/customSubmit.html',
		controller: 'CustomSubmitController'
	});
});
app.controller('CustomSubmitController', function($rootScope, $state, $scope, $http, AuthService, SessionService, $sce, customizeService, $location) {
	var userID = $location.search().userid;
	$scope.submission = {};
	$scope.postData = {};
	$scope.genreArray = ['Alternative Rock', 'Ambient', 'Creative', 'Chill', 'Classical', 'Country', 'Dance & EDM', 'Dancehall', 'Deep House', 'Disco', 'Drum & Bass', 'Dubstep', 'Electronic', 'Festival', 'Folk', 'Hip-Hop/RNB', 'House', 'Indie/Alternative', 'Latin', 'Trap', 'Vocalists/Singer-Songwriter'];
	$scope.urlChange = function() {
		if ($scope.url != "") {
			$scope.processing = true;
			$http.post('/api/soundcloud/resolve', {
				url: $scope.url
			}).then(function(res) {
				if (res.data.kind != "track") throw new Error('');
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
			}).then(null, function(err) {
				if (err.status != 403) {
					$.Zebra_Dialog("We are not allowed to access tracks by this artist with the Soundcloud API. We apologize for the inconvenience, and we are working with Soundcloud to resolve this issue.");
					$scope.notFound = true;
				} else {
					$scope.submission.trackURL = $scope.url;
					SC.oEmbed($scope.submission.trackURL, {
						element: document.getElementById('scPlayer'),
						auto_play: false,
						maxheight: 150
					});
				}
				$scope.submission.trackID = null;
				$scope.processing = false;
				document.getElementById('scPlayer').style.visibility = "hidden";
			});
		}
	};
	$scope.submit = function() {
		if (!$scope.submission.email || !$scope.submission.name) {
			$.Zebra_Dialog("Please fill in all fields");
		} else {
			$scope.processing = true;
			$http.post('/api/submissions', {
				email: $scope.submission.email,
				trackID: $scope.submission.trackID,
				name: $scope.submission.name,
				title: $scope.submission.title,
				trackURL: $scope.submission.trackURL,
				channelIDS: [],
				invoiceIDS: [],
				userID: userID,
				genre: $scope.submission.genre
			}).then(function(res) {
				$.Zebra_Dialog("Your song has been submitted and will be reviewed soon.");
				$scope.processing = false;
				$scope.notFound = false;
				$scope.submission = {};
				document.getElementById('scPlayer').style.visibility = "hidden";
				$scope.url = "";
			}).then(null, function(err) {
				$scope.processing = false;
				$.Zebra_Dialog("Error: Could not submit song.");
			});
		}
	};
	$scope.getCustomizeSettings = function() {
		var uid = $location.search().userid;
		customizeService.getCustomPageSettings(uid).then(function(response) {
			$scope.customizeSettings = response;
		});
	};
});
app.config(function($stateProvider) {
	$stateProvider.state('customizesubmission', {
		url: '/admin/customizesubmission',
		templateUrl: 'js/customizeSubmission/views/customizeSubmission.html',
		controller: 'CustomizeSubmissionController'
	});
});
app.controller('CustomizeSubmissionController', function($rootScope, $state, $scope, $http, AuthService, SessionService, $sce, customizeService) {
	if (!SessionService.getUser()) {
		$state.go('admin');
	}
	$scope.user = SessionService.getUser();
	$scope.submission = {};
	$scope.genreArray = ['Alternative Rock', 'Ambient', 'Creative', 'Chill', 'Classical', 'Country', 'Dance & EDM', 'Dancehall', 'Deep House', 'Disco', 'Drum & Bass', 'Dubstep', 'Electronic', 'Festival', 'Folk', 'Hip-Hop/RNB', 'House', 'Indie/Alternative', 'Latin', 'Trap', 'Vocalists/Singer-Songwriter'];
	$scope.saveSettings = function() {
		$scope.processing = true; //customizeService.uploadFile($scope.backImage.file).then(function(res){
		//var backImage=res.Location;
		//$scope.postData.backgroundimage=backImage;
		$scope.postData.userID = $scope.user._id;
		var subHeadingText = $scope.postData.subHeading.text ? $scope.postData.subHeading.text.replace(/\r?\n/g, '<br />') : '';
		$scope.postData.subHeading.text = subHeadingText;
		customizeService.addCustomize($scope.postData).then(function(response) {
			$scope.processing = false;
			$.Zebra_Dialog("Saved Successfully");
		})['catch'](function(error) {
			console.log("er", error);
		}); //}) 
	};
	$scope.getCustomizeSettings = function() {
		customizeService.getCustomPageSettings($scope.user._id).then(function(response) {
			if (response) {
				$scope.postData = response;
				$scope.customizeSettings = response;
			} else {
				$scope.postData = {
					heading: {
						text: "Submission for Promotion",
						style: {
							fontSize: 21,
							fontColor: '#999',
							fontWeight: 'Bold'
						}
					},
					subHeading: {
						text: "Our mission is to simply bring the best music to the people. We also have a strong commitment to providing feedback and guidance for rising artists. We guarantee that your song will be listened to and critiqued by our dedicated staff if it passes our submission process. Although we cannot guarantee support for your submission on our promotional platforms such as SoundCloud, YouTube, and Facebook, we will make sure to get back to you with a response.",
						style: {
							fontSize: 16,
							fontColor: '#7d5a5a',
							fontWeight: 'Normal'
						}
					},
					inputFields: {
						style: {
							border: 1,
							borderRadius: 4,
							borderColor: '#F5D3B5'
						}
					},
					button: {
						text: 'Enter',
						style: {
							fontSize: 15,
							fontColor: '#fff',
							border: 1,
							borderRadius: 4,
							bgColor: '#F5BBBC'
						}
					}
				};
			}
		});
	};
});
app.config(function($stateProvider) {
	$stateProvider.state('autoEmailsNew', {
		url: '/admin/database/autoEmails/new',
		templateUrl: 'js/database/autoEmails/autoEmails.html',
		controller: 'AutoEmailsController'
	});
});
app.config(function($stateProvider) {
	$stateProvider.state('autoEmailsEdit', {
		url: '/admin/database/autoEmails/edit/:templateId',
		templateUrl: 'js/database/autoEmails/autoEmails.html',
		controller: 'AutoEmailsController'
	});
}); // resolve: {
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
//         $.Zebra_Dialog("ERROR: Something went wrong.");
//       })
//   }
// }
app.controller('AutoEmailsController', function($rootScope, $state, $scope, $http, $stateParams, AuthService) {
	$scope.loggedIn = false;
	$scope.isStateParams = false;
	if ($stateParams.templateId) {
		$scope.isStateParams = true;
	} // $scope.template = template;
	$scope.template = {
		isArtist: false
	};
	$scope.getTemplate = function() {
		if ($stateParams.templateId) {
			$scope.processing = true;
			$http.get('/api/database/autoEmails?templateId=' + $stateParams.templateId).then(function(res) {
				var template = res.data;
				$scope.processing = false;
				if (template) {
					$scope.template = template;
				} else {
					$scope.template = {};
				}
			}).then(null, function(err) {
				$.Zebra_Dialog("ERROR: Something went wrong.");
			});
		} else {
			return false;
		}
	}; // console.log(template);
	$scope.save = function() {
		$scope.processing = true;
		$http.post('/api/database/autoEmails/', $scope.template).then(function(res) {
			$.Zebra_Dialog("Saved email template.");
			$scope.processing = false;
		}).then(null, function(err) {
			$.Zebra_Dialog("ERROR: Message could not save.");
			$scope.processing = false;
		});
	}; // $scope.login = function() {
	//   $scope.processing = true;
	//   $http.post('/api/login', {
	//     password: $scope.password
	//   }).then(function() {
	//     $rootScope.password = $scope.password;
	//     $scope.loggedIn = true;
	//     $scope.processing = false;
	//   }).catch(function(err) {
	//     $scope.processing = false;
	//     $.Zebra_Dialog('Wrong Password');
	//   });
	// }
	$scope.logout = function() {
		$http.get('/api/logout').then(function() {
			window.location.href = '/admin';
		})['catch'](function(err) {
			$scope.processing = false;
			$.Zebra_Dialog('Wrong Password');
		});
	};
});
app.config(function($stateProvider) {
	$stateProvider.state('autoEmailsList', {
		url: '/admin/database/autoEmails',
		templateUrl: 'js/database/autoEmails/autoEmailsList.html',
		controller: 'AutoEmailsListController',
		resolve: {
			templates: function templates($http) {
				return $http.get('/api/database/autoEmails').then(function(res) {
					var template = res.data;
					if (template) {
						return template;
					} else {
						return {
							purpose: "Biweekly Email"
						};
					}
				}).then(null, function(err) {
					$.Zebra_Dialog("ERROR: Something went wrong.");
				});
			}
		}
	});
});
app.controller('AutoEmailsListController', function($rootScope, $state, $scope, $http, AuthService, templates) {
	$scope.loggedIn = false;
	$scope.templates = templates; // $scope.getTemplate = function() {
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
	//       $.Zebra_Dialog("ERROR: Something went wrong.");
	//     });
	// };
	// console.log(template);
	$scope.save = function() {
		$scope.processing = true;
		$http.post('/api/database/autoEmails', $scope.template).then(function(res) {
			$.Zebra_Dialog("Saved email.");
			$scope.processing = false;
		}).then(null, function(err) {
			$.Zebra_Dialog("ERROR: Message could not save.");
			$scope.processing = false;
		});
	}; // $scope.login = function() {
	//   $scope.processing = true;
	//   $http.post('/api/login', {
	//     password: $scope.password
	//   }).then(function() {
	//     $rootScope.password = $scope.password;
	//     $scope.loggedIn = true;
	//     $scope.processing = false;
	//   }).catch(function(err) {
	//     $scope.processing = false;
	//     $.Zebra_Dialog('Wrong Password');
	//   });
	// }
	$scope.logout = function() {
		$http.get('/api/logout').then(function() {
			window.location.href = '/admin';
		})['catch'](function(err) {
			$scope.processing = false;
			$.Zebra_Dialog('Wrong Password');
		});
	};
});
app.config(function($stateProvider) {
	$stateProvider.state('downloadGate', {
		url: '/admin/downloadGate',
		templateUrl: 'js/downloadTrack/views/adminDLGate.html',
		controller: 'AdminDLGateController'
	});
});
app.config(function($stateProvider) {
	$stateProvider.state('downloadGateList', {
		url: '/admin/downloadGate/list',
		templateUrl: 'js/downloadTrack/views/adminDLGate.list.html',
		controller: 'AdminDLGateController'
	});
});
app.config(function($stateProvider) {
	$stateProvider.state('downloadGateEdit', {
		url: '/admin/downloadGate/edit/:gatewayID',
		templateUrl: 'js/downloadTrack/views/adminDLGate.html',
		controller: 'AdminDLGateController'
	});
});
app.controller('AdminDLGateController', ['$rootScope', '$state', '$stateParams', '$scope', '$http', '$location', '$window', '$uibModal', 'SessionService', 'AdminDLGateService', function($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, SessionService, AdminDLGateService) {
	if (!SessionService.getUser()) {
		$state.go('admin');
	} /* Init boolean variables for show/hide and other functionalities */
	$scope.processing = false;
	$scope.isTrackAvailable = false;
	$scope.message = {
		val: '',
		visible: false
	}; /* Init Download Gateway form data */
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
	}; /* Init downloadGateway list */
	$scope.downloadGatewayList = []; /* Init modal instance variables and methods */
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
	$scope.closeModal = function() {
		$scope.modalInstance.close();
	}; /* Init profile */
	$scope.profile = {}; /* Method for resetting Download Gateway form */
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
	} /* Check if stateParams has gatewayID to initiate edit */
	$scope.checkIfEdit = function() {
		if ($stateParams.gatewayID) {
			$scope.getDownloadGateway($stateParams.gatewayID); // if(!$stateParams.downloadGateway) {
			//   $scope.getDownloadGateway($stateParams.gatewayID);
			// } else {
			//   $scope.track = $stateParams.downloadGateway;
			// }
		}
	};
	$scope.trackURLChange = function() {
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
				profiles.forEach(function(prof) {
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
				$.Zebra_Dialog('Song not found or forbidden');
				$scope.processing = false;
			};
			$scope.isTrackAvailable = false;
			$scope.processing = true;
			AdminDLGateService.resolveData({
				url: $scope.track.trackURL
			}).then(handleTrackDataAndGetProfiles).then(handleWebProfiles)['catch'](handleError);
		}
	};
	$scope.artistURLChange = function(index) {
		var artist = {};
		$scope.processing = true;
		AdminDLGateService.resolveData({
			url: $scope.track.artists[index].url
		}).then(function(res) {
			$scope.track.artists[index].avatar = res.data.avatar_url;
			$scope.track.artists[index].username = res.data.username;
			$scope.track.artists[index].id = res.data.id;
			$scope.processing = false;
		})['catch'](function(err) {
			$.Zebra_Dialog('Artists not found');
			$scope.processing = false;
		});
	};
	$scope.addPlaylist = function() {
		$scope.track.playlists.push({
			url: '',
			avatar: '',
			title: '',
			id: ''
		});
	};
	$scope.removePlaylist = function(index) {
		$scope.track.playlists.splice(index, 1);
	};
	$scope.playlistURLChange = function(index) {
		$scope.processing = true;
		AdminDLGateService.resolveData({
			url: $scope.track.playlists[index].url
		}).then(function(res) {
			$scope.track.playlists[index].avatar = res.data.artwork_url;
			$scope.track.playlists[index].title = res.data.title;
			$scope.track.playlists[index].id = res.data.id;
			$scope.processing = false;
		}).then(null, function(err) {
			$.Zebra_Dialog('Playlist not found');
			$scope.processing = false;
		});
	};
	$scope.removeArtist = function(index) {
		$scope.track.artists.splice(index, 1);
	};
	$scope.addArtist = function() {
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
	$scope.addSMLink = function() { // externalSMLinks++;
		// $scope.track.SMLinks['key' + externalSMLinks] = '';
		$scope.track.SMLinks.push({
			key: '',
			value: ''
		});
	};
	$scope.removeSMLink = function(index) {
		$scope.track.SMLinks.splice(index, 1);
	};
	$scope.SMLinkChange = function(index) {
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
		var findLink = $scope.track.SMLinks.filter(function(item) {
			return item.key === host;
		});
		if (findLink.length > 0) {
			return false;
		}
		$scope.track.SMLinks[index].key = host;
	};
	$scope.saveDownloadGate = function() {
		if (!$scope.track.trackID) {
			$.Zebra_Dialog('Track Not Found');
			return false;
		}
		$scope.processing = true;
		var sendObj = new FormData(); /* Append data to sendObj start */ /* Track */
		for (var prop in $scope.track) {
			sendObj.append(prop, $scope.track[prop]);
		} /* artists */
		var artists = $scope.track.artists.filter(function(item) {
			return item.id !== -1;
		}).map(function(item) {
			delete item['$$hashKey'];
			return item;
		});
		sendObj.append('artists', JSON.stringify(artists)); /* playlists */
		var playlists = $scope.track.playlists.filter(function(item) {
			return item.id !== -1;
		}).map(function(item) {
			delete item['$$hashKey'];
			return item;
		});
		sendObj.append('playlists', JSON.stringify(playlists)); /* SMLinks */
		var SMLinks = {};
		$scope.track.SMLinks.forEach(function(item) {
			SMLinks[item.key] = item.value;
		});
		sendObj.append('SMLinks', JSON.stringify(SMLinks)); /* Append data to sendObj end */
		var options = {
			method: 'POST',
			url: '/api/database/downloadurl',
			headers: {
				'Content-Type': undefined
			},
			transformRequest: angular.identity,
			data: sendObj
		};
		$http(options).then(function(res) {
			$scope.processing = false;
			if ($scope.track._id) { // $scope.openModal.downloadURL(res.data.trackURL);
				return;
			}
			resetDownloadGateway();
			$scope.openModal.downloadURL(res.data);
		}).then(null, function(err) {
			$scope.processing = false;
			$.Zebra_Dialog("ERROR: Error in saving url");
			$scope.processing = false;
		});
	};
	$scope.logout = function() {
		$http.post('/api/logout').then(function() {
			SessionService.deleteUser();
			$state.go('admin');
		});
	};
	$scope.showProfileInfo = function() {
		$scope.profile = SessionService.getUser();
	};
	$scope.getDownloadList = function() {
		AdminDLGateService.getDownloadList().then(handleResponse)['catch'](handleError);

		function handleResponse(res) {
			$scope.downloadGatewayList = res.data;
		}

		function handleError(res) {}
	}; /* Method for getting DownloadGateway in case of edit */
	$scope.getDownloadGateway = function(downloadGateWayID) { // resetDownloadGateway();
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
	$scope.deleteDownloadGateway = function(index) {
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
app.config(function($stateProvider, $authProvider, $httpProvider) {
	$stateProvider.state('download', {
		url: '/download',
		templateUrl: 'js/downloadTrack/views/downloadTrack.view.html',
		controller: 'DownloadTrackController'
	});
	$authProvider.instagram({
		clientId: '0b2ab47baa464c31bf6d8e9f301d4469'
	}); // Instagram
	$authProvider.instagram({
		name: 'instagram',
		url: '/api/download/auth/instagram',
		authorizationEndpoint: 'https://api.instagram.com/oauth/authorize',
		redirectUri: 'https://localhost:1443/download',
		requiredUrlParams: ['scope'],
		scope: ['basic', 'relationships', 'public_content', 'follower_list'],
		scopeDelimiter: '+',
		type: '2.0'
	});
	$authProvider.twitter({
		url: '/api/download/twitter/auth',
		authorizationEndpoint: 'https://api.twitter.com/oauth/authenticate',
		redirectUri: 'https://artistsunlimited.co/download', //must match website
		type: '1.0',
		popupOptions: {
			width: 495,
			height: 645
		}
	});
});
app.controller('DownloadTrackController', ['$rootScope', '$state', '$scope', '$http', '$location', '$window', '$q', 'DownloadTrackService', '$sce', '$auth', 'SessionService', function($rootScope, $state, $scope, $http, $location, $window, $q, DownloadTrackService, $sce, $auth, SessionService) {
	$scope.user = SessionService.getUser(); /* Normal JS vars and functions not bound to scope */
	var playerObj = null; /* $scope bindings start */
	$scope.trackData = {
		trackName: 'Mixing and Mastering',
		userName: 'la tropical'
	};
	$scope.toggle = true;
	$scope.togglePlay = function() {
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
	$scope.initiateDownload = function() {
		$scope.processing = false;
		if ($scope.track.downloadURL && $scope.track.downloadURL !== '') {
			$window.location.href = $scope.track.downloadURL;
		} else {
			$scope.errorText = 'Error! Could not fetch download URL';
			$scope.downloadURLNotFound = true;
		}
	}; /* Function for Instagram */
	$scope.authenticateInstagram = function() {
		$auth.authenticate('instagram').then(function(response) {
			var userName = $scope.track.socialPlatformValue;
			$http({
				method: "POST",
				url: '/api/download/instagram/follow_user',
				data: {
					'access_token': response.data,
					'q': userName
				}
			}).then(function(user) {
				if (user.data.succ) {
					$scope.initiateDownload();
				}
			});
		});
	}; /* Function for Twitter */
	$scope.authenticateTwitter = function() {
		$auth.authenticate('twitter').then(function(response) {
			var userName = $scope.track.socialPlatformValue;
			if ($scope.track.socialPlatform == 'twitterFollow') {
				$http({
					method: "POST",
					url: '/api/download/twitter/follow',
					data: {
						screen_name: userName,
						accessToken: response.data
					}
				}).then(function(records) {
					if (records.data && records.statusText === "OK") {
						if (records.data.screen_name === $scope.track.socialPlatformValue) {
							window.location.replace($scope.track.downloadURL);
						}
					} else {
						$.Zebra_Dialog('Error in processing the request. Please try again.');
					}
				});
			} else if ($scope.track.socialPlatform == 'twitterPost') {
				response.data.socialPlatformValue = $scope.track.socialPlatformValue;
				$http({
					method: "POST",
					url: '/api/download/twitter/post',
					data: response.data
				}).then(function(records) {
					if (records.statusText === "OK") {
						window.location.replace($scope.track.downloadURL);
					} else {
						$.Zebra_Dialog('Error in processing the request. Please try again.');
					}
				});
			}
		});
	}; /* Function for Youtube */
	$scope.authenticateYoutube = function(track) {
		$scope.processing = true;
		var totalArray = [$scope.track.socialPlatformValue, "https://www.youtube.com/channel/UCbfKEQZZzHN0egYXinbb7jg", "https://www.youtube.com/channel/UCvQyEDsKwJoJLKXeCvY2OfQ", "https://www.youtube.com/channel/UCcqpdWD_k3xM4AOjvs-FitQ", "https://www.youtube.com/channel/UCbA0xiM4E5Sbf1WMmhTGOOg", "https://www.youtube.com/channel/UC2HG82SETkcx8pOE75bYJ6g"];
		var promiseArr = [];
		totalArray.forEach(function(url) {
			var idPromise = new Promise(function(resolve, reject) {
				if (url.includes('/channel/')) {
					resolve(url.substring(url.indexOf('/channel/') + 9, url.length));
				} else {
					var username = url.substring(url.indexOf('/user/') + 6, url.length);
					var idArray = [];
					$http.get('https://www.googleapis.com/youtube/v3/channels?key=AIzaSyBOuRHx25VQ69MrTEcvn-hIdkZ8NsZwsLw&forUsername=' + username + '&part=id').then(function(res) {
						if (res.data.items[0]) resolve(res.data.items[0].id);
					}).then(null, reject);
				}
			});
			promiseArr.push(idPromise);
		});
		Promise.all(promiseArr).then(function(idArray) {
			console.log(idArray);
			return $http({
				method: "GET",
				url: '/api/download/subscribe',
				params: {
					downloadURL: $scope.track.downloadURL,
					channelIDS: idArray
				}
			});
		}).then(function(response) {
			$scope.processing = false;
			window.open(response.data.url, '_blank');
			window.focus();
		}).then(null, function() {
			$scope.processing = false;
			$.Zebra_Dialog('Youtube channel to subscribe to not found');
		});
	}; /* Default processing on page load */
	$scope.getDownloadTrack = function() {
		$scope.processing = true;
		var trackID = $location.search().trackid;
		DownloadTrackService.getDownloadTrack(trackID).then(receiveDownloadTrack).then(receiveRecentTracks).then(initPlay)['catch'](catchDownloadTrackError);

		function receiveDownloadTrack(result) {
			$scope.track = result.data;
			$scope.backgroundStyle = function() {
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
			$.Zebra_Dialog('Song Not Found');
			$scope.processing = false;
			$scope.embedTrack = false;
		}
	}; /* On click download track button */
	$scope.authenticateSoundcloud = function() {
		if ($scope.track.comment && !$scope.track.commentText) {
			$.Zebra_Dialog('Please write a comment!');
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
			$.Zebra_Dialog('Error in processing your request');
			$scope.processing = false;
			$scope.$apply();
		}
	};
	$scope.downloadTrackFacebookShare = function(shareURL) {
		window.fbAsyncInit = function() {
			FB.init({
				appId: '1576897469267996',
				xfbml: true,
				version: 'v2.6'
			});
			FB.ui({
				method: 'share',
				href: shareURL
			}, function(response) {
				if (response && !response.error_code) {
					if ($scope.track.downloadURL && $scope.track.downloadURL !== '') {
						$window.location.href = $scope.track.downloadURL;
					} else {
						$scope.errorText = 'Error! Could not fetch download URL';
						$scope.downloadURLNotFound = true;
					}
					$scope.$apply();
				} else if (response && response.error_code === 4201) {
					console.log("User cancelled: " + decodeURIComponent(response.error_message));
				} else {
					console.log("Not OK: " + JSON.stringify(response));
					alert("You have cancelled sharing on facebook.");
				}
			});
		};
		(function(d, s, id) {
			var js, fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) {
				return;
			}
			js = d.createElement(s);
			js.id = id;
			js.src = "//connect.facebook.net/en_US/sdk.js";
			fjs.parentNode.insertBefore(js, fjs);
		})(document, 'script', 'facebook-jssdk');
	};
	$scope.downloadTrackFacebookLike = function(fblikeid) {
		window.fbAsyncInit = function() {
			FB.init({
				appId: '1576897469267996',
				xfbml: true,
				version: 'v2.6'
			});
			FB.Event.subscribe('edge.create', function(href, widget) {
				window.location = fblikeid.downloadURL;
			});
		};
		(function(d, s, id) {
			var js, fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) {
				return;
			}
			js = d.createElement(s);
			js.id = id;
			js.src = "//connect.facebook.net/en_US/sdk.js";
			fjs.parentNode.insertBefore(js, fjs);
		})(document, 'script', 'facebook-jssdk');
	};
}]);
window.twttr = (function(d, s, id) {
	var js, fjs = d.getElementsByTagName(s)[0],
	t = window.twttr || {};
	if (d.getElementById(id)) return t;
	js = d.createElement(s);
	js.id = id;
	js.src = "https://platform.twitter.com/widgets.js";
	fjs.parentNode.insertBefore(js, fjs);
	t._e = [];
	t.ready = function(f) {
		t._e.push(f);
	};
	return t;
})(document, "script", "twitter-wjs");
app.service('AdminDLGateService', ['$http', function($http) {
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
app.service('DownloadTrackService', ['$http', function($http) {
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
app.config(function($stateProvider) {
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
app.controller('HomeController', ['$rootScope', '$state', '$scope', '$http', '$location', '$window', 'HomeService', function($rootScope, $state, $scope, $http, $location, $window, HomeService) {
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
	}; /* Apply page start */
	$scope.toggleApplicationSent = function() {
		$scope.message = {
			application: {
				val: '',
				visible: false
			}
		};
		$scope.sent.application = !$scope.sent.application;
	};
	$scope.saveApplication = function() {
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
	}; /* Apply page end */ /* Artist Tools page start */
	$scope.toggleArtistEmail = function() {
		$scope.message = {
			artistEmail: {
				val: '',
				visible: false
			}
		};
		$scope.sent.artistEmail = !$scope.sent.artistEmail;
	};
	$scope.saveArtistEmail = function() {
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
	}; /* Artist Tools page end */
}]);
app.directive('affixer', function($window) {
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
			$scope.$on('$routeChangeStart', function() {
				win.unbind('scroll', affixElement);
			});
			win.bind('scroll', affixElement);
		}
	};
});
app.service('HomeService', ['$http', function($http) {
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
app.service('MixingMasteringService', ['$http', function($http) {
	function saveMixingMastering(data) {
		return $http({
			method: 'POST',
			url: '/api/mixingmastering',
			headers: {
				'Content-Type': undefined
			},
			transformRequest: angular.identity,
			data: data
		});
	}
	return {
		saveMixingMastering: saveMixingMastering
	};
}]);
app.service('PrPlanService', ['$http', function($http) {
	function savePrPlan(data) {
		return $http({
			method: 'POST',
			url: '/api/prplan',
			headers: {
				'Content-Type': undefined
			},
			transformRequest: angular.identity,
			data: data
		});
	}
	return {
		savePrPlan: savePrPlan
	};
}]);
app.config(function($stateProvider) {
	$stateProvider.state('premiersubmissions', {
		url: '/admin/premiersubmissions',
		templateUrl: 'js/premierSubmissions/views/premierSubmissions.html',
		controller: 'PremierSubmissionController'
	});
});
app.controller('PremierSubmissionController', function($rootScope, $state, $scope, $http, AuthService, SessionService, $sce) {
	if (!SessionService.getUser()) {
		$state.go('admin');
	}
	$scope.user = SessionService.getUser();
	$scope.counter = 0;
	$scope.channels = [];
	$scope.showingElements = [];
	$scope.submissions = [];
	$scope.genre = "";
	$scope.skip = 0;
	$scope.limit = 5;
	$scope.genreArray = ['Alternative Rock', 'Ambient', 'Creative', 'Chill', 'Classical', 'Country', 'Dance & EDM', 'Dancehall', 'Deep House', 'Disco', 'Drum & Bass', 'Dubstep', 'Electronic', 'Festival', 'Folk', 'Hip-Hop/RNB', 'House', 'Indie/Alternative', 'Latin', 'Trap', 'Vocalists/Singer-Songwriter'];
	$scope.getSubmissionsByGenre = function() {
		$scope.showingElements = [];
		$scope.skip = 0;
		$scope.loadSubmissions();
	};
	$scope.loadSubmissions = function() {
		$scope.processing = true;
		$http.get('/api/premier/unaccepted?genre=' + $scope.genre + "&skip=" + $scope.skip + "&limit=" + $scope.limit).then(function(res) {
			$scope.processing = false;
			if (res.data.length > 0) {
				angular.forEach(res.data, function(d) {
					d.channel = null;
					d.emailBody = "";
					$scope.showingElements.push(d);
				});
			}
		}).then(null, function(err) {
			$scope.processing = false;
			$.Zebra_Dialog('Error: No premier submissions found.');
			console.log(err);
		});
	};
	$scope.loadMore = function() {
		$scope.skip += 10;
		$scope.loadSubmissions(); //var loadElements = [];
		// for (let i = $scope.counter; i < $scope.counter + 15; i++) {
		//   var sub = $scope.submissions[i];
		//   if (sub) {
		//     sub.channelName = null;
		//     sub.emailBody = "";
		//     $scope.showingElements.push(sub);
		//     loadElements.push(sub);
		//   }
		// }
		// $scope.counter += 15;
	};
	$scope.accept = function(submi) {
		$scope.processing = true;
		submi.status = "accepted";
		$http.put("/api/premier/accept", {
			submi: submi
		}).then(function(sub) {
			$scope.showingElements.splice($scope.showingElements.indexOf(submi), 1);
			$.Zebra_Dialog("Accepted");
			$scope.processing = false;
		}).then(null, function(err) {
			$scope.processing = false;
			$.Zebra_Dialog("ERROR: did not Save");
		});
	};
	$scope.decline = function(submission) {
		$scope.processing = true;
		submission.status = "declined";
		$http.put('/api/premier/decline', {
			submission: submission
		}).then(function(res) {
			var index = $scope.showingElements.indexOf(submission);
			$scope.showingElements.splice(index, 1);
			$.Zebra_Dialog("Declined");
			$scope.processing = false;
		}).then(null, function(err) {
			$scope.processing = false;
			$.Zebra_Dialog("ERROR: did not Decline");
		});
	};
	$scope.channelChange = function(submission) {
		var channel = JSON.parse(submission.channel);
		var emailBody = "";
		switch (channel.displayName) {
			case 'The Plug':
			emailBody = "Hey " + submission.name + ",%0D%0A%0D%0AThank you for submitting your track to us here at Artists Unlimited. We are very interested in your submission and we think that it could really fit one of our SoundCloud channels, " + channel.displayName + ", " + channel.url + " %0D%0A%0D%0AMy name is Luiz Kupfer and I help curate the channel. I just have a couple of questions regarding your submission to help make me understand the record a bit more:%0D%0A%0D%0A1. Is it 100 percent original? Is there any copyright infringement in this track? (vocals that you do not have permission to use, etc)%0D%0A2. Do you own all of the rights to the track? (i.e. are you currently in engaged in a publishing  or master right contract that we would need permission to release your music?)%0D%0A3. Are you interested solely on releasing the track on SoundCloud (for Free Download) or are you interested in having us take care of uploading the track to Spotify, iTunes and promote the track on all platforms, rather than just Sound Cloud.%0D%0A%0D%0AAll best and looking forward to hearing from you soon,%0D%0A%0D%0ALuiz Kupfer%0D%0AAU Network%0D%0Aluiz@peninsulamgmt.com";
			break;
			case 'Royal X':
			emailBody = "Hey " + submission.name + ",%0D%0A%0D%0AThank you for submitting your track to us here at Artists Unlimited. We are very interested in your submission and we think that it could really fit one of our SoundCloud channels, " + channel.displayName + ", " + channel.url + " %0D%0A%0D%0AMy name is Rafael Rocha and I help curate the channel. I just have a couple of questions regarding your submission to help make me understand the record a bit more:%0D%0A%0D%0A1. Is it 100 percent original? Is there any copyright infringement in this track? (vocals that you do not have permission to use, etc)%0D%0A2. Do you own all of the rights to the track? (i.e. are you currently in engaged in a publishing  or master right contract that we would need permission to release your music?)%0D%0A3. Are you interested solely on releasing the track on SoundCloud (for Free Download) or are you interested in having us take care of uploading the track to Spotify, iTunes and promote the track on all platforms, rather than just Sound Cloud.%0D%0A%0D%0AAll best and looking forward to hearing from you soon,%0D%0A%0D%0ARafael Rocha%0D%0AAU Network%0D%0Aroyalxofficial@gmail.com";
			break;
			default:
			emailBody = "Hey " + submission.name + ",%0D%0A%0D%0AThank you for submitting your track to us here at Artists Unlimited. We are very interested in your submission and we think that it could really fit one of our SoundCloud channels, " + channel.displayName + ", " + channel.url + " %0D%0A%0D%0AMy name is Edward Sanchez and I help curate the channel. I just have a couple of questions regarding your submission to help make me understand the record a bit more:%0D%0A%0D%0A1. Is it 100 percent original? Is there any copyright infringement in this track? (vocals that you do not have permission to use, etc)%0D%0A2. Do you own all of the rights to the track? (i.e. are you currently in engaged in a publishing  or master right contract that we would need permission to release your music?)%0D%0A3. Are you interested solely on releasing the track on SoundCloud (for Free Download) or are you interested in having us take care of uploading the track to Spotify, iTunes and promote the track on all platforms, rather than just Sound Cloud.%0D%0A%0D%0AAll best and looking forward to hearing from you soon,%0D%0A%0D%0AEdward Sanchez%0D%0AAU Network%0D%0Aedward@peninsulamgmt.com";
			break;
		}
		submission.emailBody = emailBody;
	};
	$scope['delete'] = function(submission) {
		$.Zebra_Dialog('Are you sure you really want to delete ?', {
			'buttons': [{
				caption: 'Yes',
				callback: function callback() {
					$scope.processing = true;
					$http.post("/api/premier/delete", {
						id: submission._id
					}).then(function(sub) {
						$scope.showingElements.splice($scope.showingElements.indexOf(submission), 1);
						$scope.processing = false;
					}).then(null, function(err) {
						$scope.processing = false;
					});
				}
			}, {
				caption: 'Cancel',
				callback: function callback() {}
			}]
		});
	};
	$scope.getChannels = function() {
		$scope.channels = [{
			displayName: 'La Tropical',
			url: 'https://soundcloud.com/latropical'
		}, {
			displayName: 'La Tropical Mixes',
			url: 'https://soundcloud.com/latropicalmixes'
		}, {
			displayName: 'Red Tag',
			url: 'https://soundcloud.com/red-tag'
		}, {
			displayName: 'Etiquette Noir',
			url: 'https://soundcloud.com/etiquettenoir'
		}, {
			displayName: 'Le Sol',
			url: 'https://soundcloud.com/lesolmusique'
		}, {
			displayName: 'Classy Records',
			url: 'https://soundcloud.com/onlyclassy'
		}, {
			displayName: 'A La Mer',
			url: 'https://soundcloud.com/a-la-mer'
		}, {
			displayName: 'Royal X',
			url: 'https://soundcloud.com/royalxx'
		}, {
			displayName: 'The Plug',
			url: 'https://soundcloud.com/theplugmiami'
		}, {
			displayName: 'Electro Bounce',
			url: 'http://soundcloud.com/electro-bounce'
		}, {
			displayName: 'Panel',
			url: 'https://soundcloud.com/panel'
		}, {
			displayName: 'Air de Paris',
			url: 'https://soundcloud.com/airxparis'
		}, {
			displayName: 'Lux Audio',
			url: 'http://soundcloud.com/luxaudio'
		}];
	};
});
app.filter('trusted', ['$sce', function($sce) {
	return function(url) {
		return $sce.trustAsResourceUrl(url);
	};
}]);
app.config(function($stateProvider) {
	$stateProvider.state('premiere', {
		url: '/premiere',
		templateUrl: 'js/premiere/views/premiere.html',
		controller: 'PremierController'
	});
});
app.controller('PremierController', ['$rootScope', '$state', '$scope', '$http', '$location', '$window', 'PremierService', function($rootScope, $state, $scope, $http, $location, $window, PremierService) {
	$scope.genreArray = ['Alternative Rock', 'Ambient', 'Creative', 'Chill', 'Classical', 'Country', 'Dance & EDM', 'Dancehall', 'Deep House', 'Disco', 'Drum & Bass', 'Dubstep', 'Electronic', 'Festival', 'Folk', 'Hip-Hop/RNB', 'House', 'Indie/Alternative', 'Latin', 'Trap', 'Vocalists/Singer-Songwriter'];
	$scope.premierObj = {};
	$scope.message = {
		val: '',
		visible: false
	};
	$scope.processing = false;
	$scope.savePremier = function() { //$.Zebra_Dialog('This may take a little while.')
	$scope.processing = true;
	$scope.message.visible = false;
	var data = new FormData();
	for (var prop in $scope.premierObj) {
		data.append(prop, $scope.premierObj[prop]);
	}
	PremierService.savePremier(data).then(receiveResponse)['catch'](catchError);

	function receiveResponse(res) {
		$scope.processing = false;
			if (res.status === 200) { //$scope.message.visible = true;
				//$scope.message.val = 'Thank you! Your message has been sent successfully.';
				$scope.premierObj = {};
				angular.element("input[type='file']").val(null);
				$.Zebra_Dialog('Thank you! Your message has been sent successfully.');
			} else { //$scope.message.visible = true;
				//$scope.message.val = 'Error processing. Please try again or send your track to edward@peninsulamgmt.com.';
				$.Zebra_Dialog('Error processing. Please try again or send your track to edward@peninsulamgmt.com.');
			}
		}

		function catchError(res) {
			$scope.processing = false;
			$.Zebra_Dialog('Error processing. Please try again or send your track to edward@peninsulamgmt.com.'); // if (res.status === 400) {
			//   $scope.message = {
			//     visible: true,
			//     val: res.data
			//   };
			//   return;
			// }
			// $scope.message = {
			//   visible: true,
			//   val: 'Error in processing the request. Please try again or send the submissions to edward@peninsulamgmt.com.'
			// };
		}
	};
}]);
app.service('PremierService', ['$http', function($http) {
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
app.config(function($stateProvider) {
	$stateProvider.state('settings', {
		url: '/admin/settings',
		templateUrl: 'js/settings/views/settings.html',
		controller: 'settingsController'
	});
});
app.controller('settingsController', function($rootScope, $state, $scope, $http, SettingService, SessionService) {
	if (!SessionService.getUser()) {
		$state.go('admin');
	}
	$scope.user = SessionService.getUser();
	$scope.profile = SessionService.getUser();
	$scope.updateProfileWithPicture = function(data) {
		$scope.processing = true;
		if (typeof $scope.profilepic === 'undefined') {
			saveToDb(null, $scope.profile.profilePicture);
		} else {
			SettingService.uploadFile($scope.profilepic.file).then(function(res) {
				if (res.success) {
					saveToDb(res, res.data.Location);
				}
			});
		}

		function saveToDb(res, url) {
			SettingService.updateAdminProfile({
				username: data.name,
				pictureUrl: url
			}).then(function(res) {
				SessionService.create(res.data);
				$scope.user = SessionService.getUser();
				$scope.processing = false;
				$.Zebra_Dialog('Profile updated Successfully');
			})['catch'](function() {});
		}
	};
	$scope.updatePassword = function(data) {
		if (data.newPassword != data.confirmPassword) {
			$.Zebra_Dialog('Password doesn\'t match with confirm password');
			return;
		} else {
			$scope.processing = true;
			SettingService.updateAdminProfile({
				password: data.newPassword
			}).then(function(res) {
				$scope.processing = false;
				$.Zebra_Dialog('Password changed successfully.');
			})['catch'](function() {});
		}
	};
});
app.factory('SettingService', ['$http', function($http) {
	function updateAdminProfile(data) {
		return $http.post('/api/users/updateAdminProfile', data);
	}

	function getSaltPassword(data) {
		return $http.get('/api/users/getSaltPassword/pswd=' + data.password);
	}

	function uploadFile(data) {
		var fd = new FormData();
		fd.append('file', data);
		return $http({
			method: 'POST',
			url: '/api/users/profilePicUpdate',
			headers: {
				'Content-Type': undefined
			},
			tranformRequest: angular.identify,
			data: fd
		}).then(function(response) {
			return response.data;
		});
	}
	return {
		getSaltPassword: getSaltPassword,
		updateAdminProfile: updateAdminProfile,
		uploadFile: uploadFile
	};
}]);
app.config(function($stateProvider) {
	$stateProvider.state('submissions', {
		url: '/admin/submissions',
		templateUrl: 'js/submissions/views/submissions.html',
		controller: 'SubmissionController'
	});
});
app.controller('SubmissionController', function($rootScope, $state, $scope, $http, AuthService, SessionService) {
	$scope.counter = 0;
	$scope.showingElements = [];
	$scope.submissions = [];
	$scope.genre = "";
	$scope.skip = 0;
	$scope.limit = 10;
	if (!SessionService.getUser()) {
		$state.go('admin');
	}
	$scope.user = SessionService.getUser();
	$scope.uniqueGroup = [];
	if ($scope.user.paidRepost.length > 0) {
		$scope.user.paidRepost.forEach(function(acc) {
			if (acc.group != "" && $scope.uniqueGroup.indexOf(acc.group) === -1) {
				$scope.uniqueGroup.push(acc.group);
			}
		});
	}
	$scope.genreArray = ['Alternative Rock', 'Ambient', 'Creative', 'Chill', 'Classical', 'Country', 'Dance & EDM', 'Dancehall', 'Deep House', 'Disco', 'Drum & Bass', 'Dubstep', 'Electronic', 'Festival', 'Folk', 'Hip-Hop/RNB', 'House', 'Indie/Alternative', 'Latin', 'Trap', 'Vocalists/Singer-Songwriter'];
	$scope.getSubmissionsByGenre = function() {
		$scope.showingElements = [];
		$scope.skip = 0;
		$scope.loadSubmissions();
	};
	$scope.loadSubmissions = function() {
		$scope.processing = true;
		$http.get('/api/submissions/unaccepted?genre=' + encodeURIComponent($scope.genre) + "&skip=" + $scope.skip + "&limit=" + $scope.limit).then(function(res) {
			$scope.processing = false;
			if (res.data.length > 0) {
				angular.forEach(res.data, function(d) {
					d.displayType = 'channel';
					$scope.showingElements.push(d);
				});
			}
			setTimeout(function() {
				$scope.showingElements.forEach(function(sub) {
					SC.oEmbed(sub.trackURL, {
						element: document.getElementById(sub.trackID + "player"),
						auto_play: false,
						maxheight: 150
					});
				}, 50);
			});
		}).then(null, function(err) {
			$scope.processing = false;
			$.Zebra_Dialog('Error: Could not get channels.');
			console.log(err);
		});
	};
	$scope.loadMore = function() {
		$scope.skip += 10;
		$scope.loadSubmissions(); // var loadElements = [];
		// for (let i = $scope.counter; i < $scope.counter + 15; i++) {
		//   var sub = $scope.submissions[i];
		//   if (sub) {
		//     $scope.showingElements.push(sub);
		//     loadElements.push(sub);
		//   }
		// }
		// setTimeout(function() {
		//   loadElements.forEach(function(sub) {
		//     SC.oEmbed(sub.trackURL, {
		//       element: document.getElementById(sub.trackID + "player"),
		//       auto_play: false,
		//       maxheight: 150
		//     });
		//   }, 50)
		// });
		// $scope.counter += 15;
	};
	$scope.changeBox = function(sub, chan) {
		var index = sub.channelIDS.indexOf(chan.id);
		if (index == -1) {
			sub.channelIDS.push(chan.id);
		} else {
			sub.channelIDS.splice(index, 1);
		}
	};
	$scope.changeBoxGroup = function(sub, group) {
		$scope.user.paidRepost.forEach(function(acc) {
			if (acc.group != "" && acc.group == group) {
				var index = sub.channelIDS.indexOf(acc.id);
				if (index == -1) {
					sub.channelIDS.push(acc.id);
				} else {
					sub.channelIDS.splice(index, 1);
				}
			}
		});
	};
	$scope.save = function(submi) {
		if (submi.channelIDS.length == 0) {
			$scope.decline(submi);
		} else {
			submi.password = $rootScope.password;
			$scope.processing = true;
			$http.put("/api/submissions/save", submi).then(function(sub) {
				$scope.showingElements.splice($scope.showingElements.indexOf(submi), 1);
				$.Zebra_Dialog("Saved");
				$scope.processing = false;
			}).then(null, function(err) {
				$scope.processing = false;
				$.Zebra_Dialog("ERROR: did not Save");
			});
		}
	};
	$scope.ignore = function(submission) {
		$scope.processing = true;
		$http['delete']('/api/submissions/ignore/' + submission._id + '/' + $rootScope.password).then(function(res) {
			var index = $scope.showingElements.indexOf(submission);
			$scope.showingElements.splice(index, 1);
			$.Zebra_Dialog("Ignored");
			$scope.processing = false;
		}).then(null, function(err) {
			$scope.processing = false;
			$.Zebra_Dialog("ERROR: did not Ignore");
		});
	};
	$scope.decline = function(submission) {
		$scope.processing = true;
		$http['delete']('/api/submissions/decline/' + submission._id + '/' + $rootScope.password).then(function(res) {
			var index = $scope.showingElements.indexOf(submission);
			$scope.showingElements.splice(index, 1);
			$.Zebra_Dialog("Declined");
			$scope.processing = false;
		}).then(null, function(err) {
			$scope.processing = false;
			$.Zebra_Dialog("ERROR: did not Decline");
		});
	};
	$scope.youtube = function(submission) {
		$scope.processing = true;
		$http.post('/api/submissions/youtubeInquiry', submission).then(function(res) {
			$scope.processing = false;
			$.Zebra_Dialog('Sent to Zach');
		});
	};
	$scope.sendMore = function(submission) {
		$scope.processing = true;
		$http.post('/api/submissions/sendMoreInquiry', submission).then(function(res) {
			$scope.processing = false;
			$.Zebra_Dialog('Sent Email');
		});
	};
});
app.directive('fileInput', ['$parse', function($parse) {
	return {
		restrict: 'A',
		link: function link(scope, elm, attrs) {
			elm.bind('change', function() {
				$parse(attrs.fileInput) // the attr is where we define 'file' as the model
				.assign(scope, elm[0].files[0]);
				scope.$apply();
			});
		}
	};
}]);
'use strict';
app.directive('oauthButton', function() {
	return {
		scope: {
			providerName: '@'
		},
		restrict: 'E',
		templateUrl: 'js/common/directives/oauth-button/oauth-button.html'
	};
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFjY291bnRzL2FjY291bnRTZXJ2aWNlLmpzIiwiY3VzdG9taXplU3VibWlzc2lvbi9jdXN0b21pemVTZXJ2aWNlLmpzIiwiZGF0YWJhc2UvZGF0YWJhc2UuanMiLCJmc2EvZnNhLXByZS1idWlsdC5qcyIsImxvZ2luL2xvZ2luLmpzIiwibWl4aW5nTWFzdGVyaW5nL21peGluZ01hc3RlcmluZy5qcyIsInBheS9wYXkuanMiLCJwYXkvdGhhbmt5b3UuanMiLCJwclBsYW5zL3ByUGxhbnMuanMiLCJzY2hlZHVsZXIvc2NoZWR1bGVyLmpzIiwic3VibWl0L3N1Ym1pdC5qcyIsImFjY291bnRzL2NvbnRyb2xsZXJzL2FjY291bnRzQ29udHJvbGxlci5qcyIsImFydGlzdFRvb2xzL0FuYWx5dGljcy9hbmFseXRpY3NDb250cm9sbGVyLmpzIiwiYXJ0aXN0VG9vbHMvQXJ0aXN0VG9vbHMvYXJ0aXN0VG9vbHNDb250cm9sbGVyLmpzIiwiYXJ0aXN0VG9vbHMvQXJ0aXN0VG9vbHMvYXJ0aXN0c1Rvb2xzU2VydmljZS5qcyIsImFydGlzdFRvb2xzL1NDUmVzb2x2ZS9TQ1Jlc29sdmUuanMiLCJhcnRpc3RUb29scy9kb3dubG9hZEdhdGV3YXkvZG93bmxvYWRHYXRld2F5LmpzIiwiYXJ0aXN0VG9vbHMvZG93bmxvYWRHYXRld2F5L3ByZXZpZXdDb250cm9sbGVyLmpzIiwiYXJ0aXN0VG9vbHMvcmVGb3JSZS9yZUZvclJlSW50ZXJhY3Rpb24uanMiLCJhcnRpc3RUb29scy9yZUZvclJlL3JlRm9yUmVTZXJ2aWNlLmpzIiwiYXJ0aXN0VG9vbHMvcmVGb3JSZUxpc3RzL3JlRm9yUmVMaXN0cy5qcyIsImFydGlzdFRvb2xzL3JlbGVhc2VyL0Jyb2FkY2FzdEZhY3RvcnkuanMiLCJhcnRpc3RUb29scy9yZWxlYXNlci9TdG9yYWdlRmFjdG9yeS5qcyIsImFydGlzdFRvb2xzL3JlbGVhc2VyL3JlbGVhc2VyLmpzIiwiYXJ0aXN0VG9vbHMvc2NoZWR1bGVyL3NjaGVkdWxlci5qcyIsImF1dGgvY29udHJvbGxlcnMvYXV0aENvbnRyb2xsZXIuanMiLCJhdXRoL3NlcnZpY2VzL2F1dGhTZXJ2aWNlLmpzIiwiYXV0aC9zZXJ2aWNlcy9zZXNzaW9uU2VydmljZS5qcyIsImN1c3RvbVN1Ym1pdC9jb250cm9sbGVycy9jdXN0b21TdWJtaXRDb250cm9sbGVyLmpzIiwiY3VzdG9taXplU3VibWlzc2lvbi9jb250cm9sbGVycy9jdXN0b21pemVTdWJtaXNzaW9uQ29udHJvbGxlci5qcyIsImRhdGFiYXNlL2F1dG9FbWFpbHMvYXV0b0VtYWlscy5qcyIsImRhdGFiYXNlL2F1dG9FbWFpbHMvYXV0b0VtYWlsc0xpc3QuanMiLCJkb3dubG9hZFRyYWNrL2NvbnRyb2xsZXJzL2FkbWluRExHYXRlLmpzIiwiZG93bmxvYWRUcmFjay9jb250cm9sbGVycy9kb3dubG9hZFRyYWNrQ29udHJvbGxlci5qcyIsImRvd25sb2FkVHJhY2svY29udHJvbGxlcnMvZmFjZWJvb2tJbml0LmpzIiwiZG93bmxvYWRUcmFjay9zZXJ2aWNlcy9hZG1pbkRMR2F0ZVNlcnZpY2UuanMiLCJkb3dubG9hZFRyYWNrL3NlcnZpY2VzL2Rvd25sb2FkVHJhY2tTZXJ2aWNlLmpzIiwiaG9tZS9jb250cm9sbGVycy9ob21lQ29udHJvbGxlci5qcyIsImhvbWUvc2VydmljZXMvaG9tZVNlcnZpY2UuanMiLCJtaXhpbmdNYXN0ZXJpbmcvc2VydmljZXMvTWl4aW5nTWFzdGVyaW5nU2VydmljZS5qcyIsInByUGxhbnMvc2VydmljZXMvUHJQbGFuU2VydmljZS5qcyIsInByZW1pZXJTdWJtaXNzaW9ucy9jb250cm9sbGVycy9wcmVtaWVyU3VibWlzc2lvbkNvbnRyb2xsZXIuanMiLCJwcmVtaWVyZS9jb250cm9sbGVycy9wcmVtaWVyZUNvbnRyb2xsZXIuanMiLCJwcmVtaWVyZS9zZXJ2aWNlcy9wcmVtaWVyZVNlcnZpY2UuanMiLCJzZXR0aW5ncy9jb250cm9sbGVyL3NldHRpbmdzQ29udHJvbGxlci5qcyIsInNldHRpbmdzL3NlcnZpY2VzL3NldHRpbmdTZXJ2aWNlLmpzIiwic3VibWlzc2lvbnMvY29udHJvbGxlcnMvc3VibWlzc2lvbkNvbnRyb2xsZXIuanMiLCJjb21tb24vZGlyZWN0aXZlcy9maWxlLWlucHV0L2ZpbGVJbnB1dERpcmVjdGl2ZS5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL29hdXRoLWJ1dHRvbi9vYXV0aC1idXR0b24uZGlyZWN0aXZlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxHQUFBLEdBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSx1QkFBQSxDQUFBLENBQUEsYUFBQSxDQUFBLFdBQUEsQ0FBQSxjQUFBLENBQUEsV0FBQSxDQUFBLFdBQUEsQ0FBQSx3QkFBQSxDQUFBLFlBQUEsQ0FBQSxlQUFBLENBQUEsa0JBQUEsQ0FBQSxnQkFBQSxDQUFBLFlBQUEsQ0FBQSxvQkFBQSxDQUFBLENBQUEsQ0FBQSxBQUVBLEdBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxrQkFBQSxDQUFBLGlCQUFBLENBQUEscUJBQUEsQ0FBQSxhQUFBLENBQUE7QUFHQSxpQkFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtBQUVBLGtCQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUFBLEFBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLGFBQUEsQ0FBQSxDQUNBLGFBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxRQUFBLENBQUEsaUJBQUEsQ0FDQSxDQUFBLENBQUE7QUFHQSxhQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsUUFBQSxDQUFBLGlCQUFBLENBQ0EsWUFBQSxDQUFBLE9BQUEsQ0FDQSxDQUFBLENBQUEsQUFFQSxhQUFBLENBQUEsTUFBQSxDQUFBLENBQ0EsaUJBQUEsQ0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUNBLFVBQUEsQ0FBQSxTQUFBLENBQ0EsR0FBQSxDQUFBLG9CQUFBLENBQ0EsUUFBQSxDQUFBLDBFQUFBLENBQ0EsS0FBQSxDQUFBLENBQUEsOERBQUEsQ0FBQSx5Q0FBQSxDQUFBLENBQ0EsV0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsTUFBQSxHQUFBLFlBQUEsQ0FDQSxDQUFBLENBQUE7O0FBR0EsYUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUNBLFFBQUEsQ0FBQSxrQkFBQSxDQUNBLENBQUEsQ0FBQSxBQUVBLGFBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxRQUFBLENBQUEsb0JBQUEsQ0FDQSxDQUFBLENBQUEsQUFFQSxhQUFBLENBQUEsU0FBQSxDQUFBLENBQ0EsUUFBQSxDQUFBLGtDQUFBLENBQ0EsWUFBQSxDQUFBLE9BQUEsQ0FDQSxDQUFBLENBQUEsQUFFQSxhQUFBLENBQUEsS0FBQSxDQUFBLENBQ0EsUUFBQSxDQUFBLGdDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBRUEsYUFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLFFBQUEsQ0FBQSxxQkFBQSxDQUNBLENBQUEsQ0FBQSxBQUVBLGFBQUEsQ0FBQSxNQUFBLENBQUEsQ0FDQSxRQUFBLENBQUEsb0JBQUEsQ0FDQSxDQUFBLENBQUEsQUFFQSxhQUFBLENBQUEsU0FBQSxDQUFBLENBQ0EsUUFBQSxDQUFBLHFCQUFBLENBQ0EsQ0FBQSxDQUFBO0FBS0EsYUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxZQUFBLENBQ0EsR0FBQSxDQUFBLGtCQUFBLENBQ0EsUUFBQSxDQUFBLHNCQUFBLENBQ0EsV0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsTUFBQSxDQUNBLHFCQUFBLENBQUEsNENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUE7QUFFQSxHQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsVUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxhQUFBLENBQUEsY0FBQSxDQUFBLFNBQUEsQ0FBQTs7OztBQU9BLFNBQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUE7QUFFQSxTQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FBQTs7QUFJQSxVQUFBLENBQUEsR0FBQSxDQUFBLG1CQUFBLENBQUEsU0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLEdBQUEsT0FBQSxDQUFBLElBQUEsSUFBQSxvQkFBQSxDQUFBLENBQ0EsVUFBQSxDQUFBLEtBQUEsR0FBQSxLQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsVUFBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsQ0FDQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBZ0NBLEdBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxRQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQ0EsS0FBQSxDQUFBLEdBQUEsQ0FBQSwrQkFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FFQSxDQUFBLENBQUEsQUFFQSxjQUFBLENBQUEsV0FBQSxFQUFBLENBQUEsQ0FFQSxDQUFBLENBQUEsQUFDQSxHQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLFNBQUEsQ0FBQSxZQUFBLENBQ0EsU0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLENBQ0EsT0FBQSxDQUNBLFFBQUEsQ0FBQSxHQUFBLENBQ0EsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLElBQUEsQ0FDQSxDQUNBLElBQUEsQ0FBQSxjQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBLENBQUE7QUFFQSxDQUFBLENBQUEsU0FBQSxDQUFBLHFDQUFBLENBQUEsVUFBQSxDQUNBLE9BQUEsQ0FBQSxFQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsS0FBQSxDQUFBLFVBQUEsQ0FBQSxhQUFBLENBQ0EsS0FBQSxDQUFBLElBQUEsQ0FDQSxPQUFBLENBQUEsTUFBQSxDQUNBLENBQUEsQ0FBQSxBQUNBLGdCQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FDQSxnQkFBQSxFQUFBLENBQUEsQ0FDQSxBQUVBLElBQUEsVUFBQSxDQUFBLEtBQUEsQ0FBQSxBQUVBLFNBQUEsZ0JBQUEsRUFBQSxDQUNBLEdBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxJQUFBLENBQUEsVUFBQSxDQUFBO0FBRUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLElBQUEsV0FBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLFNBQUEsUUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLEdBQUEsUUFBQSxDQUFBLENBQ0EsZ0JBQUEsRUFBQSxDQUFBO0FBR0EsV0FBQSxFQUFBLENBQUEsQ0FDQSxDQUVBLENBQUEsQ0FBQSxBQUNBLE9BQUEsQ0FDQSxLQUFBLENBQ0EsT0FBQSxDQUFBLElBQUEsQ0FBQSxzQkFBQSxJQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxDQUFBLGNBQUEsR0FBQSxLQUFBLENBQUEsTUFBQSxHQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxnR0FBQSxDQUFBLENBQUEsQUFDQSxPQUFBLENBQUEsRUFBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQ0EsQ0FDQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLENBQUEsQUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLDhCQUFBLENBQUEsU0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLENBQUEsY0FBQSxDQUFBLGVBRUEsTUFBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsZ0JBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsQ0FDQSxXQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFdBQUEsR0FBQSxVQUFBLENBQ0EsV0FBQSxDQUFBLFdBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxpQkFBQSxHQUFBLFVBQUEsQ0FDQSxJQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQUFDQSxHQUFBLElBQUEsQ0FBQSxDQUNBLE9BQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSx1QkFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxJQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLEdBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FDQSxHQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsS0FBQSxJQUFBLFFBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxnQkFBQSxHQUFBLElBQUEsQ0FBQSxDQUNBLENBQ0EsQUFDQSxHQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQ0EsR0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLEtBQUEsSUFBQSxRQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsZ0JBQUEsR0FBQSxJQUFBLENBQUEsQ0FDQSxDQUNBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLGlCQUFBLEdBQUEsU0FBQSxXQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FDQSxLQUFBLENBQUEsSUFBQSxDQUFBLDRCQUFBLENBQUEsQ0FDQSxRQUFBLENBQUEsV0FBQSxDQUFBLFFBQUEsQ0FDQSxRQUFBLENBQUEsV0FBQSxDQUFBLFFBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLGNBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxBQUNBLFFBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsdUNBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxrQkFBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsUUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxvREFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFDQSxNQUFBLENBQUEsaUJBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBRUEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxTQUFBLENBQUEsWUFBQSxDQUNBLFNBQUEsT0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FDQSxRQUFBLENBQUEsR0FBQSxDQUNBLEtBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxJQUFBLENBQ0EsQ0FDQSxJQUFBLENBQUEsY0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxDQUFBO0FBRUEsQ0FBQSxDQUFBLFNBQUEsQ0FBQSxxQ0FBQSxDQUFBLFVBQUEsQ0FDQSxPQUFBLENBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxVQUFBLENBQUEsYUFBQSxDQUNBLEtBQUEsQ0FBQSxJQUFBLENBQ0EsT0FBQSxDQUFBLE1BQUEsQ0FDQSxDQUFBLENBQUEsQUFDQSxnQkFBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsZ0JBQUEsRUFBQSxDQUFBLENBQ0EsQUFFQSxJQUFBLFVBQUEsQ0FBQSxLQUFBLENBQUEsQUFFQSxTQUFBLGdCQUFBLEVBQUEsQ0FDQSxHQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQTtBQUVBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxJQUFBLFdBQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxTQUFBLFFBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxHQUFBLFFBQUEsQ0FBQSxDQUNBLGdCQUFBLEVBQUEsQ0FBQTtBQUdBLFdBQUEsRUFBQSxDQUFBLENBQ0EsQ0FFQSxDQUFBLENBQUEsQUFDQSxPQUFBLENBQ0EsS0FBQSxDQUNBLE9BQUEsQ0FBQSxJQUFBLENBQUEsc0JBQUEsSUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxjQUFBLEdBQUEsS0FBQSxDQUFBLE1BQUEsR0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsZ0dBQUEsQ0FBQSxDQUFBLEFBQ0EsT0FBQSxDQUFBLEVBQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUNBLENBQ0EsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUFBLEFBRUEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxVQUFBLENBQ0EsT0FBQSxDQUNBLEtBQUEsQ0FBQSxDQUNBLFFBQUEsQ0FBQSxHQUFBLENBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FDQSxDQUNBLElBQUEsQ0FBQSxjQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsU0FBQSxXQUFBLENBQUEsQ0FDQSxLQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FDQSxLQUFBLENBQUEsT0FBQSxHQUFBLENBQ0EsT0FBQSxDQUFBLEtBQUEsQ0FDQSxHQUFBLENBQUEsRUFBQSxDQUNBLENBQUEsQUFFQSxHQUFBLFdBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsSUFBQSxZQUFBLElBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxJQUFBLFdBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsQ0FDQSxPQUFBLENBQUEsSUFBQSxDQUNBLEdBQUEsQ0FBQSx1Q0FBQSxDQUNBLENBQUEsQUFDQSxPQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEFBQ0EsT0FBQSxDQUNBLEFBRUEsR0FBQSxXQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLEdBQUEsRUFBQSxHQUFBLElBQUEsR0FBQSxJQUFBLENBQUEsQ0FDQSxLQUFBLENBQUEsT0FBQSxHQUFBLENBQ0EsT0FBQSxDQUFBLElBQUEsQ0FDQSxHQUFBLENBQUEsNENBQUEsQ0FDQSxDQUFBLEFBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxBQUNBLE9BQUEsQ0FDQSxBQUNBLEtBQUEsQ0FBQSxRQUFBLEdBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FBQSxBQUVBLEdBQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxDQUFBLFNBQUEsS0FBQSxDQUFBLGNBQUEsQ0FBQTs7Ozs7O0FBT0EsSUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLENBQ0EsS0FBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUNBLGNBQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxHQUFBLFFBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFDQSxJQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsQ0FDQSxLQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQ0EsY0FBQSxDQUFBLFVBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLENBQUEsQ0FBQSxjQUdBLEdBQUEsQ0FBQSxTQUFBLENBQUEsY0FBQSxDQUFBLFVBQUEsQ0FDQSxPQUFBLFNBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQUFDQSxHQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxVQUFBLENBQ0EsR0FBQSxHQUFBLENBQUEsU0FBQSxHQUFBLEdBQUEsQ0FBQSxZQUFBLElBQUEsR0FBQSxDQUFBLFlBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFDblhBLEdBQUEsQ0FBQSxPQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUVBLFNBQUEsaUJBQUEsQ0FBQSxFQUFBLENBQUEsQ0FDQSxPQUFBLEtBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxLQUFBLENBQ0EsR0FBQSxDQUFBLGtDQUFBLEdBQUEsRUFBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxRQUFBLENBQUEsQ0FDQSxPQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxBQUlBLE9BQUEsQ0FDQSxpQkFBQSxDQUFBLGlCQUFBLENBRUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUFBLEFDbEJBLEdBQUEsQ0FBQSxPQUFBLENBQUEsa0JBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLFNBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLE9BQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSw0Q0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQ0EsQUFDQSxTQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLEVBQUEsQ0FBQSxJQUFBLFFBQUEsRUFBQSxDQUFBLEFBQ0EsRUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQUFDQSxPQUFBLEtBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxNQUFBLENBQ0EsR0FBQSxDQUFBLFVBQUEsQ0FDQSxPQUFBLENBQUEsQ0FBQSxjQUFBLENBQUEsU0FBQSxDQUFBLENBQ0EsZUFBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLENBQ0EsSUFBQSxDQUFBLEVBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsUUFBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQUFDQSxPQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxBQUNBLFNBQUEscUJBQUEsQ0FBQSxNQUFBLENBQUEsQ0FDQSxPQUFBLEtBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxLQUFBLENBQ0EsR0FBQSxDQUFBLDZDQUFBLEdBQUEsTUFBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxRQUFBLENBQUEsQ0FDQSxPQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxBQUVBLE9BQUEsQ0FDQSxZQUFBLENBQUEsWUFBQSxDQUNBLFVBQUEsQ0FBQSxVQUFBLENBQ0EscUJBQUEsQ0FBQSxxQkFBQSxDQUNBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FBQSxBQ2xDQSxHQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsY0FBQSxDQUFBLENBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsaUJBQUEsQ0FDQSxXQUFBLENBQUEsMkJBQUEsQ0FDQSxVQUFBLENBQUEsb0JBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFFQSxHQUFBLENBQUEsU0FBQSxDQUFBLGlCQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsU0FBQSxNQUFBLENBQUEsQ0FDQSxPQUFBLENBQ0EsUUFBQSxDQUFBLElBQUEsQ0FDQSxLQUFBLENBQUEsSUFBQSxDQUNBLFFBQUEsQ0FBQSw4REFBQSxHQUNBLG1IQUFBLEdBQ0EsUUFBQSxDQUNBLElBQUEsQ0FBQSxjQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxFQUFBLENBQUEsY0FBQSxDQUFBLFNBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxVQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEdBQUEsVUFBQSxDQUFBLEFBQ0EsR0FBQSxVQUFBLEtBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FBQSxBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsb0JBQUEsQ0FBQSxTQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQ0EsQUFDQSxNQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFdBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxDQUNBLEtBQUEsQ0FBQSxVQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxPQUFBLENBQ0EsS0FBQSxDQUFBLE9BQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLE1BQUEsQ0FDQSxLQUFBLENBQUEsTUFBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsS0FBQSxDQUNBLEtBQUEsQ0FBQSxPQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxPQUFBLENBQ0EsS0FBQSxDQUFBLE9BQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLGFBQUEsQ0FDQSxLQUFBLENBQUEsYUFBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsV0FBQSxDQUNBLEtBQUEsQ0FBQSxXQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxrQkFBQSxDQUNBLEtBQUEsQ0FBQSxXQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLENBQ0EsS0FBQSxDQUFBLGFBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFdBQUEsQ0FDQSxLQUFBLENBQUEsY0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxDQUNBLEtBQUEsQ0FBQSxZQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLENBQ0EsS0FBQSxDQUFBLFlBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsQ0FDQSxLQUFBLENBQUEsVUFBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsZ0JBQUEsQ0FDQSxLQUFBLENBQUEsYUFBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsWUFBQSxDQUNBLEtBQUEsQ0FBQSxXQUFBLENBQ0EsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLHFCQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLEtBQUEsR0FBQSxDQUNBLFFBQUEsQ0FBQSxFQUFBLENBQ0EsV0FBQSxDQUFBLEVBQUEsQ0FDQSxLQUFBLENBQUEsRUFBQSxDQUNBLENBQUEsQUFDQSxNQUFBLENBQUEsR0FBQSxHQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsQ0FDQSxLQUFBLENBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxLQUFBLENBQ0EsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsQ0FDQSxhQUFBLENBQUEsRUFBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsQ0FDQSxLQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQ0EsY0FBQSxDQUFBLFVBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLENBQ0EsQ0FBQSxTQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxXQUFBLEdBQUEsVUFBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxDQUFBLFFBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxJQUFBLENBQUEsdUJBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxnRkFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxDQUNBLENBQUEsU0FDQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsa0JBQUEsR0FBQSxVQUFBLENBQ0EsSUFBQSxLQUFBLENBQUEsRUFBQSxDQUFBLEFBQ0EsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsSUFBQSxTQUFBLENBQUEsQ0FDQSxLQUFBLENBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxDQUNBLEtBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsSUFBQSxhQUFBLENBQUEsQ0FDQSxLQUFBLENBQUEsTUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLEFBQ0EsSUFBQSxPQUFBLENBQUEsRUFBQSxDQUFBLEFBQ0EsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxHQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLENBQUEsQUFDQSxLQUFBLENBQUEsU0FBQSxHQUFBLE9BQUEsQ0FBQSxDQUNBLEFBQ0EsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxHQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLENBQUEsQUFDQSxLQUFBLENBQUEsU0FBQSxHQUFBLE9BQUEsQ0FBQSxDQUNBLEFBQ0EsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLEFBQ0EsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLENBQ0EsS0FBQSxDQUFBLE9BQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE9BQUEsR0FBQSxDQUFBLEtBQUEsS0FBQSxJQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsT0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQUFDQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsZUFBQSxDQUFBLEtBQUEsQ0FBQSxlQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxlQUFBLENBQUEsQUFDQSxJQUFBLElBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxLQUFBLENBQ0EsUUFBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBLENBQ0EsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsS0FBQSxDQUFBLElBQUEsQ0FBQSx5QkFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxxQkFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxvQkFBQSxHQUFBLFVBQUEsQ0FDQSxJQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsQUFDQSxJQUFBLE9BQUEsQ0FBQSxFQUFBLENBQUEsQUFDQSxHQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUEsV0FBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLEdBQUEsR0FBQSxNQUFBLENBQUEsV0FBQSxDQUFBLFdBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxTQUFBLEdBQUEsT0FBQSxDQUFBLENBQ0EsQUFDQSxHQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUEsV0FBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLEdBQUEsR0FBQSxNQUFBLENBQUEsV0FBQSxDQUFBLFdBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxTQUFBLEdBQUEsT0FBQSxDQUFBLENBQ0EsQUFDQSxHQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxLQUFBLENBQUEsQUFDQSxJQUFBLElBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxLQUFBLENBQ0EsUUFBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBLENBQ0EsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsS0FBQSxDQUFBLElBQUEsQ0FBQSw0QkFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxjQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSwyQkFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsU0FBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxRQUFBLENBQ0EsUUFBQSxDQUFBLFFBQUEsQ0FDQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEscUJBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsMkJBQUEsR0FBQSxLQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLHFCQUFBLEdBQUEsVUFBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsS0FBQSxDQUFBLElBQUEsQ0FBQSwwQkFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLENBQ0EsYUFBQSxDQUFBLEVBQUEsQ0FDQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxpQ0FBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSw0QkFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsOEJBR0EsTUFBQSxDQUFBLEVBQUEsQ0FBQSxjQUFBLENBQUEsU0FBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsR0FBQSxVQUFBLENBQUEsQUFDQSxHQUFBLFVBQUEsS0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsZ0JBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQ25PQSxDQUFBLFVBQUEsQ0FFQSxZQUFBLENBQUE7QUFFQSxHQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLElBQUEsS0FBQSxDQUFBLHdCQUFBLENBQUEsQ0FBQSxBQUVBLElBQUEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsYUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEFBRUEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxZQUFBLENBQUEsVUFBQSxDQUNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsSUFBQSxLQUFBLENBQUEsc0JBQUEsQ0FBQSxDQUFBLEFBQ0EsT0FBQSxNQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFFQSxHQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxTQUFBLFVBQUEsQ0FBQSxVQUFBLENBQUEsQ0FDQSxPQUFBLENBQ0EsRUFBQSxDQUFBLFlBQUEsU0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLFVBQUEsQ0FBQSxFQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsQ0FDQSxJQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQUFDQSxVQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FDQSxRQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQ0EsSUFBQSxDQUFBLGNBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxVQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUNBLElBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxBQUNBLFVBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUNBLEdBQUEsUUFBQSxDQUFBLENBQ0EsUUFBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUVBLEdBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxDQUFBLFNBQUEsS0FBQSxDQUFBLENBQ0EsSUFBQSxhQUFBLENBQUEsSUFBQSxDQUFBLEFBRUEsU0FBQSxXQUFBLEVBQUEsQ0FDQSxPQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsa0NBQUEsQ0FBQSxDQUFBLENBQ0EsQUFFQSxTQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxhQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsRUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUNBLFNBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUNBLFlBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUNBLEtBQUEsQ0FBQSxjQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQUFFQSxTQUFBLFNBQUEsRUFBQSxDQUNBLE9BQUEsYUFBQSxDQUFBLENBQ0EsQUFFQSxPQUFBLENBQ0EsV0FBQSxDQUFBLFdBQUEsQ0FDQSxTQUFBLENBQUEsU0FBQSxDQUNBLFNBQUEsQ0FBQSxTQUFBLENBQ0EsQ0FBQSxDQUNBLENBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQTBIQSxDQUFBLEVBQUEsQ0FBQSxBQ3ZMQSxHQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsY0FBQSxDQUFBLENBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsUUFBQSxDQUNBLFdBQUEsQ0FBQSxxQkFBQSxDQUNBLFVBQUEsQ0FBQSxzQkFBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsc0JBQUEsQ0FBQSxTQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLENBQUEsY0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGVBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsV0FBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxBQUNBLEdBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxFQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsQ0FDQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsVUFBQSxDQUNBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsQ0FDQSxHQUFBLENBQUEsRUFBQSxDQUNBLE9BQUEsQ0FBQSxLQUFBLENBQ0EsQ0FBQSxBQUNBLFdBQUEsQ0FDQSxLQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxtQkFBQSxDQUFBLFNBQ0EsQ0FBQSxnQkFBQSxDQUFBLENBQUEsQUFFQSxTQUFBLG1CQUFBLENBQUEsR0FBQSxDQUFBLENBQ0EsR0FBQSxHQUFBLENBQUEsTUFBQSxLQUFBLEdBQUEsSUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLGNBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxFQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsTUFBQSxDQUFBLE9BQUEsR0FBQSxDQUNBLEdBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FDQSxPQUFBLENBQUEsSUFBQSxDQUNBLENBQUEsQ0FDQSxDQUNBLEFBRUEsU0FBQSxnQkFBQSxDQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsQ0FDQSxHQUFBLENBQUEsa0NBQUEsQ0FDQSxPQUFBLENBQUEsSUFBQSxDQUNBLENBQUEsQ0FDQSxDQUNBLENBQUEsQUFDQSxNQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsQ0FDQSxLQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQ0EsY0FBQSxDQUFBLFVBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLENBQ0EsQ0FBQSxTQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0F3QkEsQ0FBQSxDQUFBLEFDOUVBLEdBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxjQUFBLENBQUEsQ0FDQSxjQUFBLENBQUEsS0FBQSxDQUFBLGlCQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsa0JBQUEsQ0FDQSxXQUFBLENBQUEseUNBQUEsQ0FDQSxVQUFBLENBQUEsMkJBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLDJCQUFBLENBQUEsU0FBQSxVQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsc0JBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxlQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsbUJBQUEsR0FBQSxVQUFBLENBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxlQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLGVBQUEsQ0FBQSxLQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsZUFBQSxDQUFBLElBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxlQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSwyQkFBQSxDQUFBLENBQUEsQ0FDQSxLQUVBLEtBYUEsZUFBQSxDQUFBLFNBQUEsZUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsR0FBQSxHQUFBLENBQUEsTUFBQSxLQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxlQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsT0FBQSxDQUFBLE9BQUEsQ0FBQSxvQkFBQSxDQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSwwREFBQSxDQUFBLENBQUEsQUFDQSxPQUFBLENBQ0EsQUFDQSxDQUFBLENBQUEsWUFBQSxDQUFBLG9EQUFBLENBQUEsQ0FBQSxDQUNBLEtBRUEsVUFBQSxDQUFBLFNBQUEsVUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxvREFBQSxDQUFBLENBQUEsQ0FDQSxDQTFCQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLElBQUEsSUFBQSxDQUFBLElBQUEsUUFBQSxFQUFBLENBQUEsQUFDQSxJQUFBLElBQUEsSUFBQSxJQUFBLE1BQUEsQ0FBQSxlQUFBLEVBQUEsQ0FDQSxJQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsZUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxBQUVBLHNCQUFBLENBQ0EsbUJBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsZUFBQSxDQUFBLFNBQ0EsQ0FBQSxVQUFBLENBQUEsQ0FBQSxDQWlCQSxDQUNBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUM5Q0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLGNBQUEsQ0FBQSxDQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLG9CQUFBLENBQ0EsV0FBQSxDQUFBLGlCQUFBLENBQ0EsVUFBQSxDQUFBLGVBQUEsQ0FDQSxPQUFBLENBQUE7Ozs7Ozs7OztBQVVBLFVBQUEsQ0FBQSxvQkFBQSxLQUFBLENBQUEsWUFBQSxDQUFBO0FBRUEsT0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDBCQUFBLEdBQUEsWUFBQSxDQUFBLFlBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEFBQ0EsT0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxRQUFBLENBQUEsa0JBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUNBLE9BQUEsVUFBQSxDQUFBLFFBQUEsQ0FBQTs7OztDQUtBLENBQ0EsS0FBQSxDQUFBLGVBQUEsVUFBQSxDQUFBLENBQ0EsT0FBQSxFQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsR0FBQSxVQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsS0FBQSxDQUFBLENBQ0EsT0FBQSxLQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxtQkFBQSxDQUFBLFVBQUEsQ0FDQSxPQUFBLFNBQUEsS0FBQSxDQUFBLENBQ0EsT0FBQSxVQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLGVBQUEsQ0FBQSxTQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsQ0FBQSxVQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsQ0FDQSxVQUFBLENBQUEsVUFBQSxHQUFBLFVBQUEsQ0FBQSxBQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLEdBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLEtBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxFQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxPQUFBLENBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUEsQ0FDQSxTQUFBLENBQUEsS0FBQSxDQUNBLFNBQUEsQ0FBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsUUFBQSxDQUFBOzs7Ozs7QUFTQSxNQUFBLENBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxxQkFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsS0FBQSxDQUFBO0FBR0EsTUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsQ0FDQSxZQUFBLENBQUEsVUFBQSxDQUFBLFVBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFdBQUEsR0FBQSxVQUFBO0FBRUEsR0FBQSxNQUFBLENBQUEsS0FBQSxJQUFBLENBQUEsQ0FBQSxDQUNBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxxQkFBQSxHQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxTQUFBLENBQUEsSUFBQSxDQUNBLFdBQUEsQ0FBQSxvQkFBQSxDQUNBLFVBQUEsQ0FBQSx5QkFBQSxDQUNBLEtBQUEsQ0FBQSxNQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLE1BQUEsQ0FBQSxXQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FDQSxDQUNBLEtBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLDZEQUFBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxXQUFBLEdBQUEsU0FBQSxVQUFBLENBQUEsQ0FDQSxHQUFBLE1BQUEsQ0FBQSxlQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEscUJBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUNBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxHQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxLQUNBLE1BQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQUFDQSxJQUFBLFVBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUNBLFVBQUEsQ0FBQSxVQUFBLENBQUEsVUFBQSxDQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLEVBQUEsQ0FBQSxDQUNBLE9BQUEsRUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUNBLENBQUEsQ0FDQSxDQUFBLEFBQ0EsS0FBQSxDQUFBLElBQUEsQ0FBQSw2QkFBQSxDQUFBLFVBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFHQSxNQUFBLENBQUEsU0FBQSxHQUFBLFNBQUEsT0FBQSxDQUFBLENBQ0EsR0FBQSxPQUFBLENBQUEsU0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxHQUFBLFVBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsTUFBQSxDQUFBLEtBQUEsSUFBQSxVQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQ0EsQUFDQSxPQUFBLENBQUEsU0FBQSxHQUFBLE9BQUEsQ0FBQSxTQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxBQUNBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxLQUNBLE1BQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBRUEsQ0FBQSxDQUFBLEFBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSx5QkFBQSxDQUFBLFNBQUEsTUFBQSxDQUFBLEVBRUEsQ0FBQSxDQUFBLEFDbklBLEdBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxjQUFBLENBQUEsQ0FDQSxjQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxXQUFBLENBQ0EsV0FBQSxDQUFBLHNCQUFBLENBQ0EsVUFBQSxDQUFBLG9CQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxvQkFBQSxDQUFBLFNBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsS0FBQSxDQUFBLEdBQUEsQ0FBQSxtQ0FBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEFBQ0EsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsSUFBQSxRQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxNQUFBLEdBQUEsRUFBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLE1BQUEsQ0FBQSxNQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLEVBQUEsQ0FBQSxDQUNBLEVBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsNENBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFDN0JBLEdBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxjQUFBLENBQUEsQ0FDQSxjQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxVQUFBLENBQ0EsV0FBQSxDQUFBLHlCQUFBLENBQ0EsVUFBQSxDQUFBLG1CQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxtQkFBQSxDQUFBLFNBQUEsVUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsZ0JBQUEsR0FBQSxTQUFBLElBQUEsQ0FBQSxDQUNBLElBQUEsV0FBQSxDQUFBLEVBQUEsQ0FBQSxBQUNBLEdBQUEsSUFBQSxJQUFBLFNBQUEsQ0FDQSxXQUFBLEdBQUEsd1FBQUEsQ0FBQSxBQUNBLEdBQUEsSUFBQSxJQUFBLGVBQUEsQ0FDQSxXQUFBLEdBQUEsOFZBQUEsQ0FBQSxBQUNBLEdBQUEsSUFBQSxJQUFBLFNBQUEsQ0FDQSxXQUFBLEdBQUEsbVlBQUEsQ0FBQSxBQUNBLEdBQUEsSUFBQSxJQUFBLFlBQUEsQ0FDQSxXQUFBLEdBQUEsdWVBQUEsQ0FBQSxBQUVBLENBQUEsQ0FBQSxZQUFBLENBQUEsV0FBQSxDQUFBLENBQ0EsS0FBQSxDQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxVQUFBLENBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSwyQkFBQSxDQUFBLENBQUEsQ0FDQSxLQUFBLEtBYUEsZUFBQSxDQUFBLFNBQUEsZUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsR0FBQSxHQUFBLENBQUEsTUFBQSxLQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsT0FBQSxDQUFBLE9BQUEsQ0FBQSxvQkFBQSxDQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSwwREFBQSxDQUFBLENBQUEsQUFDQSxPQUFBLENBQ0EsQUFDQSxDQUFBLENBQUEsWUFBQSxDQUFBLG9EQUFBLENBQUEsQ0FBQSxDQUNBLEtBRUEsVUFBQSxDQUFBLFNBQUEsVUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxvREFBQSxDQUFBLENBQUEsQ0FDQSxDQTFCQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLElBQUEsSUFBQSxDQUFBLElBQUEsUUFBQSxFQUFBLENBQUEsQUFDQSxJQUFBLElBQUEsSUFBQSxJQUFBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FDQSxJQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxBQUVBLGFBQUEsQ0FDQSxVQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLGVBQUEsQ0FBQSxTQUNBLENBQUEsVUFBQSxDQUFBLENBQUEsQ0FpQkEsQ0FDQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFDM0RBLEdBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxjQUFBLENBQUEsQ0FDQSxjQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxrQkFBQSxDQUNBLFdBQUEsQ0FBQSw2QkFBQSxDQUNBLFVBQUEsQ0FBQSxxQkFBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEscUJBQUEsQ0FBQSxTQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLENBQUEsY0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQ0EsQUFDQSxNQUFBLENBQUEsWUFBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsSUFBQSxJQUFBLENBQUEsVUFBQSxDQUFBLGFBQUEsQ0FBQSxBQUNBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQ0EsQUFDQSxNQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsQUFDQSxHQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FDQSxBQUVBLE1BQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxDQUNBLEtBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FDQSxjQUFBLENBQUEsVUFBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsQ0FDQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxXQUFBLEdBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsQ0FBQSxDQUFBLEFBRUEsTUFBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxDQUVBLENBQUEsQUFFQSxNQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUEsQUFDQSxLQUFBLENBQUEsR0FBQSxDQUFBLGVBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLHFCQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsVUFBQSxDQUNBLEdBQUEsTUFBQSxDQUFBLE9BQUEsR0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsVUFBQSxDQUNBLEdBQUEsTUFBQSxDQUFBLE9BQUEsR0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxXQUFBLEdBQUEsU0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxLQUFBLENBQUEsSUFBQSxJQUFBLEVBQUEsQ0FBQSxBQUNBLEdBQUEsS0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLEtBQUEsQ0FBQSxRQUFBLEVBQUEsR0FBQSxJQUFBLENBQUEsT0FBQSxBQUNBLE1BQUEsQ0FBQSxXQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsSUFBQSxNQUFBLENBQUEsRUFBQSxDQUFBLEFBQ0EsSUFBQSxXQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsWUFBQSxHQUFBLFNBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxTQUFBLEdBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxBQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLEFBQ0EsR0FBQSxNQUFBLENBQUEsU0FBQSxJQUFBLEdBQUEsQ0FBQSxDQUNBLElBQUEsT0FBQSxDQUFBLElBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEFBQ0EsT0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxTQUFBLEdBQUEsQ0FDQSxTQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLENBQ0EsR0FBQSxDQUFBLE9BQUEsQ0FDQSxJQUFBLENBQUEsS0FBQSxDQUNBLENBQUEsQUFDQSxNQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FDQSxNQUFBLENBQUEsWUFBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxDQUFBLEFBQ0EsRUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsWUFBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLFFBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBLENBQ0EsU0FBQSxDQUFBLEtBQUEsQ0FDQSxTQUFBLENBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFVBQUEsR0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLEdBQUEsU0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFNBQUEsQ0FBQSxRQUFBLEdBQUEsU0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsU0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLEdBQUEsU0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFlBQUEsR0FBQSxTQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLENBQ0EsR0FBQSxNQUFBLENBQUEsWUFBQSxJQUFBLEVBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsS0FBQSxDQUFBLElBQUEsQ0FBQSx5QkFBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxZQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxTQUFBLENBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxBQUNBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLEFBQ0EsRUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsWUFBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLFFBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBLENBQ0EsU0FBQSxDQUFBLEtBQUEsQ0FDQSxTQUFBLENBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxBQUNBLFFBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsR0FBQSxTQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLDJLQUFBLENBQUEsQ0FBQSxBQUNBLFFBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsR0FBQSxRQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFdBQUEsR0FBQSxVQUFBLENBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLEtBQUEsVUFBQSxDQUFBLGNBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLElBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsSUFBQSxDQUFBLENBQ0EsT0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFDQSxXQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsR0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSx3QkFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsSUFBQSxXQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUNBLFdBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQSxBQUNBLElBQUEsTUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsQ0FDQSxHQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsbUJBQUEsQ0FBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxJQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEFBQ0EsS0FBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQUFDQSxJQUFBLFdBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLElBQUEsQ0FBQSxDQUNBLE9BQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFDQSxXQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsWUFBQSxDQUFBLHNCQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FDQSxNQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxLQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsSUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEFBQ0EsSUFBQSxXQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBQ0EsV0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsWUFBQSxDQUFBLHNCQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLENBQ0EsSUFBQSxXQUFBLENBQUEsOENBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsR0FBQSwwQ0FBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsS0FBQSxHQUFBLE1BQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsR0FBQSxNQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxHQUFBLGdCQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLENBQUEsQUFDQSxRQUFBLENBQUEsSUFBQSxHQUFBLFNBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQSxDQUNBLENBQUE7O0FBTUEsTUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLFNBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsZUFBQSxHQUFBLFNBQUEsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsT0FBQSxHQUFBLFVBQUEsQ0FDQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsT0FBQSxBQUNBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsV0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsWUFBQSxHQUFBLFNBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsZUFBQSxHQUFBLFVBQUEsQ0FDQSxHQUFBLE1BQUEsQ0FBQSxZQUFBLElBQUEsRUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxLQUFBLENBQUEsSUFBQSxDQUFBLHlCQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsTUFBQSxDQUFBLFlBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxJQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLG9CQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLE1BQUEsR0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLEdBQUEsS0FBQSxJQUFBLENBQUEsQ0FBQSxPQUFBLEFBQ0EsSUFBQSxDQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFFBQUEsR0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLEdBQUEsS0FBQSxJQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLENBQUEsT0FBQSxBQUNBLElBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQTs7Ozs7Ozs7Ozs7OztBQWdCQSxNQUFBLENBQUEsZUFBQSxHQUFBLFVBQUEsQ0FDQSxVQUFBLENBQUEsVUFBQSxDQUNBLE1BQUEsQ0FBQSxXQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsRUFBQSxDQUFBLE1BQUEsQ0FBQSxtQ0FBQSxHQUFBLEdBQUEsQ0FBQSxPQUFBLENBQUEsQ0FDQSxPQUFBLENBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxHQUFBLFFBQUEsQ0FBQSxDQUNBLFNBQUEsQ0FBQSxLQUFBLENBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxjQUFBLEdBQUEsU0FBQSxLQUFBLENBQUEsQ0FDQSxVQUFBLENBQUEsVUFBQSxDQUNBLEtBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxNQUFBLENBQUEsQ0FDQSxFQUFBLENBQUEsTUFBQSxDQUFBLG1DQUFBLEdBQUEsTUFBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLFFBQUEsQ0FBQSxjQUFBLENBQUEsTUFBQSxHQUFBLFFBQUEsQ0FBQSxDQUNBLFNBQUEsQ0FBQSxLQUFBLENBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUNBLEdBQUEsTUFBQSxDQUFBLE9BQUEsSUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxjQUFBLENBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUNBLEFBQ0EsTUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLEFBRUEsTUFBQSxDQUFBLGlCQUFBLEdBQUEsU0FBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsQUFDQSxPQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsQ0FBQSxTQUFBLENBQUEsV0FBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLGNBQUEsR0FBQSxTQUFBLE1BQUEsQ0FBQSxDQUNBLElBQUEsUUFBQSxDQUFBLEVBQUEsQ0FBQSxBQUNBLElBQUEsS0FBQSxDQUFBLElBQUEsSUFBQSxFQUFBLENBQUEsQUFDQSxJQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxFQUFBLENBQ0EsSUFBQSxNQUFBLENBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLElBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsRUFBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLEFBQ0EsSUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLEVBQUEsQ0FBQSxDQUNBLE9BQUEsRUFBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFDQSxJQUFBLFVBQUEsQ0FBQSxFQUFBLENBQUEsQUFDQSxJQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxFQUFBLENBQ0EsVUFBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsQ0FBQSxDQUNBLEFBQ0EsU0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLEVBQUEsQ0FBQSxDQUNBLFVBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLENBQUEsQUFDQSxRQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQ0EsQUFDQSxPQUFBLFFBQUEsQ0FBQSxDQUNBLENBQUEsQUFDQSxNQUFBLENBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxjQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFDalZBLEdBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxjQUFBLENBQUEsQ0FDQSxjQUFBLENBQUEsS0FBQSxDQUFBLFlBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxTQUFBLENBQ0EsV0FBQSxDQUFBLDRCQUFBLENBQ0EsVUFBQSxDQUFBLHNCQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxzQkFBQSxDQUFBLFNBQUEsVUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsTUFBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsQ0FDQSxrQkFBQSxDQUNBLFNBQUEsQ0FDQSxVQUFBLENBQ0EsT0FBQSxDQUNBLFdBQUEsQ0FDQSxTQUFBLENBQ0EsYUFBQSxDQUNBLFdBQUEsQ0FDQSxZQUFBLENBQ0EsT0FBQSxDQUNBLGFBQUEsQ0FDQSxTQUFBLENBQ0EsWUFBQSxDQUNBLFVBQUEsQ0FDQSxNQUFBLENBQ0EsYUFBQSxDQUNBLE9BQUEsQ0FDQSxtQkFBQSxDQUNBLE9BQUEsQ0FDQSxNQUFBLENBQ0EsNkJBQUEsQ0FDQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLENBQ0EsR0FBQSxNQUFBLENBQUEsR0FBQSxJQUFBLEVBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsS0FBQSxDQUFBLElBQUEsQ0FBQSx5QkFBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLElBQUEsT0FBQSxDQUFBLE1BQUEsSUFBQSxLQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxDQUFBLE9BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQUFDQSxFQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLFFBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBLENBQ0EsU0FBQSxDQUFBLEtBQUEsQ0FDQSxTQUFBLENBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxBQUNBLFFBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsR0FBQSxTQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxHQUFBLEdBQUEsQ0FBQSxNQUFBLElBQUEsR0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSwyS0FBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxDQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLEFBQ0EsRUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxRQUFBLENBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUNBLFNBQUEsQ0FBQSxLQUFBLENBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsUUFBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxHQUFBLFFBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxDQUNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLEtBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSwyQkFBQSxDQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxLQUFBLENBQUEsSUFBQSxDQUFBLGtCQUFBLENBQUEsQ0FDQSxLQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxLQUFBLENBQ0EsT0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsT0FBQSxDQUNBLElBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsQ0FDQSxLQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxLQUFBLENBQ0EsUUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxDQUNBLFVBQUEsQ0FBQSxFQUFBLENBQ0EsVUFBQSxDQUFBLEVBQUEsQ0FDQSxNQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FDQSxLQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxLQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEseURBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsUUFBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxHQUFBLFFBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxHQUFBLEdBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsK0JBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLENBQ0EsS0FBQSxDQUFBLEdBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLE1BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQzlHQSxHQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsY0FBQSxDQUFBLENBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsaUJBQUEsQ0FDQSxXQUFBLENBQUEsaUNBQUEsQ0FDQSxVQUFBLENBQUEsb0JBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLG9CQUFBLENBQUEsU0FBQSxVQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxDQUFBLGNBQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FDQSxBQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGVBQUEsR0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxFQUFBLENBQUEsT0FBQSxFQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsVUFBQSxDQUFBLFdBQUEsR0FBQSxHQUFBLENBQUEsV0FBQSxDQUFBLEFBQ0EsT0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLHFDQUFBLENBQUEsQ0FDQSxLQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsSUFBQSxNQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLEtBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxJQUFBLENBQUEsaUNBQUEsQ0FBQSxDQUNBLGNBQUEsQ0FBQSxNQUFBLENBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLElBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsUUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLHlCQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxnQkFBQSxHQUFBLFNBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSw0Q0FBQSxDQUFBLENBQ0EsU0FBQSxDQUFBLENBQUEsQ0FDQSxPQUFBLENBQUEsS0FBQSxDQUNBLFFBQUEsQ0FBQSxtQkFBQSxDQUNBLElBQUEsVUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxBQUNBLGNBQUEsQ0FBQSxpQkFBQSxDQUFBLFVBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQ0EsQ0FDQSxPQUFBLENBQUEsSUFBQSxDQUNBLFFBQUEsQ0FBQSxtQkFBQSxFQUFBLENBQ0EsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsV0FBQSxHQUFBLFNBQUEsT0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxLQUFBLENBQUEsSUFBQSxDQUFBLDJCQUFBLENBQUEsQ0FDQSxVQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsY0FBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsSUFBQSxHQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUNwRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLGNBQUEsQ0FBQSxDQUNBLGNBQUEsQ0FDQSxLQUFBLENBQUEsc0JBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxZQUFBLENBQ0EsTUFBQSxDQUFBLENBQ0EsVUFBQSxDQUFBLElBQUEsQ0FDQSxDQUNBLFdBQUEsQ0FBQSx5Q0FBQSxDQUNBLFVBQUEsQ0FBQSxzQkFBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsc0JBQUEsQ0FBQSxTQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLENBQUEsa0JBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLEFBQ0EsR0FBQSxDQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsT0FBQSxDQUFBLFlBQUEsQ0FBQSxVQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsQUFDQSxPQUFBLENBQUEsWUFBQSxDQUFBLFVBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUNBLEFBQ0EsTUFBQSxDQUFBLFdBQUEsR0FBQSxTQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxHQUFBLEVBQUEsQ0FBQTtBQUNBLEtBQUEsQ0FBQSw4RUFBQSxDQUFBLENBQUEsQUFDQSxPQUFBLEtBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxNQUFBLENBQ0EsR0FBQSxDQUFBLHlCQUFBLENBQ0EsSUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLEVBQUEsQ0FBQSxFQUFBLENBQ0EsQ0FDQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsT0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLGlCQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsT0FBQSxNQUFBLENBQUEsYUFBQSxDQUFBLEFBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxXQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsU0FBQSxLQUFBLENBQUEsQ0FDQSxPQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQUFDQSxNQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxNQUFBLENBQ0EsR0FBQSxDQUFBLHlCQUFBLENBQ0EsSUFBQSxDQUFBLENBQ0EsU0FBQSxDQUFBLElBQUEsQ0FDQSxDQUNBLENBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxZQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsWUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxvQkFBQSxHQUFBLGFBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxjQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxZQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsV0FBQSxHQUFBLElBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxDQUNBLEVBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxjQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLGNBQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLCtCQUFBLENBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxNQUFBLENBQ0EsR0FBQSxDQUFBLHlCQUFBLENBQ0EsSUFBQSxDQUFBLENBQ0EsWUFBQSxDQUFBLGNBQUEsQ0FBQSxZQUFBLENBQUEsV0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLFFBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxhQUFBLEdBQUEsUUFBQSxDQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxpQkFBQSxHQUFBLElBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxLQUFBLENBQUEsQ0FDQSxLQUFBLENBQUEsZ0NBQUEsR0FBQSxLQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQTtDQUVBLENBQUEsQ0FDQSxLQUFBLENBQUEsNEJBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFdBQUEsR0FBQSxTQUFBLFdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsY0FBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLE1BQUEsQ0FDQSxHQUFBLENBQUEsd0JBQUEsQ0FDQSxJQUFBLENBQUEsQ0FDQSxTQUFBLENBQUEsSUFBQSxDQUNBLENBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLE9BQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxvQkFBQSxHQUFBLGFBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxjQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFdBQUEsR0FBQSxJQUFBLENBQUEsQ0FDQSxDQUFBLFNBQUEsT0FBQSxDQUFBLENBQ0EsS0FBQSxDQUFBLFlBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxlQUFBLENBQUEsQ0FDQSxLQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsTUFBQSxDQUNBLEdBQUEsQ0FBQSx3QkFBQSxDQUNBLElBQUEsQ0FBQSxDQUNBLGdCQUFBLENBQUEsZUFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLENBQ0EsbUJBQUEsQ0FBQSxlQUFBLENBQUEsSUFBQSxDQUFBLGtCQUFBLENBQ0EsV0FBQSxDQUFBLGVBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLE9BQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxhQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLGFBQUEsR0FBQSxTQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsY0FBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLE1BQUEsQ0FDQSxHQUFBLENBQUEsMEJBQUEsQ0FDQSxJQUFBLENBQUEsQ0FDQSxTQUFBLENBQUEsSUFBQSxDQUNBLENBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLE9BQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxvQkFBQSxHQUFBLGVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxjQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFdBQUEsR0FBQSxJQUFBLENBQUEsQ0FDQSxDQUFBLFNBQUEsT0FBQSxDQUFBLENBQ0EsS0FBQSxDQUFBLFlBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxPQUFBLENBQUEsQ0FDQSxLQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsTUFBQSxDQUNBLEdBQUEsQ0FBQSwwQkFBQSxDQUNBLElBQUEsQ0FBQSxDQUNBLFlBQUEsQ0FBQSxPQUFBLENBQUEsWUFBQSxDQUNBLENBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLE9BQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxhQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsU0FBQSxPQUFBLENBQUEsQ0FDQSxPQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsb0RBQUEsR0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLFNBQUEsT0FBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSwyQ0FBQSxHQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsV0FBQSxHQUFBLFNBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxjQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsR0FBQSxTQUFBLENBQUE7QUFDQSxLQUFBLENBQUEsOEVBQUEsQ0FBQSxDQUFBLEFBQ0EsT0FBQSxLQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsTUFBQSxDQUNBLEdBQUEsQ0FBQSw4QkFBQSxDQUNBLElBQUEsQ0FBQSxDQUNBLFFBQUEsQ0FBQSxJQUFBLENBQ0EsU0FBQSxDQUFBLFNBQUEsQ0FDQSxDQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxPQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsa0JBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxPQUFBLE1BQUEsQ0FBQSxjQUFBLENBQUEsQUFDQSxPQUFBLENBQUEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxBQUNBLE1BQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLE1BQUEsQ0FDQSxHQUFBLENBQUEsOEJBQUEsQ0FDQSxJQUFBLENBQUEsQ0FDQSxTQUFBLENBQUEsSUFBQSxDQUNBLENBQ0EsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLFlBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxZQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLG9CQUFBLEdBQUEsYUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGNBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLFlBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxXQUFBLEdBQUEsSUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLENBQ0EsS0FBQSxDQUFBLFlBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxPQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsY0FBQSxHQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsa0JBQUEsR0FBQSxJQUFBLENBQUEsQ0FDQSxDQUFBLFNBQUEsT0FBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxzQ0FBQSxHQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFDQSxNQUFBLENBQUEsS0FBQSxHQUFBLFNBQUEsSUFBQSxDQUFBLENBQ0EsS0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUNBLEdBQUEsQ0FBQSxVQUFBLENBQUEsZ0JBQUEsQ0FBQSxTQUFBLE1BQUEsQ0FBQTs7OztBQUtBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsQ0FDQSxNQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsRUFBQSxDQUNBLENBQ0EsTUFBQSxDQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsR0FBQSxDQUNBLE9BQUEsQ0FBQSxPQUFBLENBQ0EsR0FBQSxDQUFBLE9BQUEsQ0FDQSxLQUFBLENBQUEsZ0JBQUEsQ0FDQSxLQUFBLENBQUEsdUJBQUEsQ0FDQSxJQUFBLENBQUEsQ0FDQSxNQUFBLENBQ0EsQ0FDQSxFQUFBLENBQUEsV0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsR0FBQSxDQUNBLElBQUEsQ0FBQSxNQUFBLENBQ0EsQ0FDQSxDQUNBLENBQUEsQUFDQSxNQUFBLENBQUEsSUFBQSxHQUFBLENBQ0EsS0FBQSxDQUFBLEVBQUEsQ0FDQSxDQUFBLEFBQ0EsSUFBQSxJQUFBLFVBQUEsSUFBQSxNQUFBLENBQUEsVUFBQSxFQUFBLENBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLFVBQUEsQ0FDQSxLQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxVQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxBQUNBLElBQUEsSUFBQSxDQUFBLElBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQ0FBQSxBQ2pPQSxHQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsY0FBQSxDQUFBLENBQ0EsY0FBQSxDQUNBLEtBQUEsQ0FBQSxhQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsY0FBQSxDQUNBLFdBQUEsQ0FBQSw2Q0FBQSxDQUNBLFVBQUEsQ0FBQSx1QkFBQSxDQUNBLFFBQUEsQ0FBQSxJQUFBLENBQ0EsT0FBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLGlCQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUEsY0FBQSxDQUFBLENBQ0EsSUFBQSxRQUFBLENBQUEsRUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLEFBQ0EsSUFBQSxJQUFBLENBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLEFBQ0EsR0FBQSxJQUFBLENBQUEsQ0FDQSxRQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsUUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLENBQ0EsQUFDQSxPQUFBLFFBQUEsQ0FBQSxPQUFBLENBQUEsQ0FDQSxDQUNBLENBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxvQkFBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLHNCQUFBLENBQ0EsV0FBQSxDQUFBLHlDQUFBLENBQ0EsVUFBQSxDQUFBLHVCQUFBLENBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxnQ0FBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLDhCQUFBLENBQ0EsTUFBQSxDQUFBLENBQ0EsVUFBQSxDQUFBLElBQUEsQ0FDQSxDQUNBLFdBQUEsQ0FBQSxzREFBQSxDQUNBLFVBQUEsQ0FBQSx1QkFBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsdUJBQUEsQ0FBQSxTQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxrQkFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQUFDQSxHQUFBLENBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLENBQ0EsSUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxRQUFBLENBQUEsQUFDQSxHQUFBLElBQUEsSUFBQSxzQkFBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxDQUFBLG9CQUFBLENBQUEsQ0FBQSxDQUNBLEtBQUEsR0FBQSxJQUFBLElBQUEsOEJBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsQ0FBQSxnQ0FBQSxDQUFBLENBQUEsQ0FDQSxBQUNBLE1BQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsVUFBQSxDQUFBLGtCQUFBLEdBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsRUFBQSxDQUFBLEFBQ0EsT0FBQSxDQUFBLFlBQUEsQ0FBQSxVQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsQ0FDQSxBQUNBLE1BQUEsQ0FBQSxpQkFBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxjQUFBLEdBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsSUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLG1CQUFBLEdBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxxRUFFQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsQ0FDQSxHQUFBLENBQUEsRUFBQSxDQUNBLE9BQUEsQ0FBQSxLQUFBLENBQ0EsQ0FBQSxnQ0FJQSxNQUFBLENBQUEsbUJBQUEsR0FBQSxFQUFBLENBQUEsZ0RBSUEsTUFBQSxDQUFBLGFBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxTQUFBLEdBQUEsQ0FDQSxXQUFBLENBQUEscUJBQUEsWUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEdBQUEsWUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGFBQUEsR0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsU0FBQSxDQUFBLElBQUEsQ0FDQSxXQUFBLENBQUEsa0JBQUEsQ0FDQSxVQUFBLENBQUEsdUJBQUEsQ0FDQSxLQUFBLENBQUEsTUFBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQTtBQUVBLE1BQUEsQ0FBQSxjQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGNBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxZQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGdCQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFlBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsV0FBQSxHQUFBLEVBQUEsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxXQUFBLEdBQUEsU0FBQSxLQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsWUFBQSxHQUFBLE1BQUEsQ0FBQSxnQkFBQSxDQUFBLGFBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxTQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsZUFBQSxHQUFBLFNBQUEsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFlBQUEsR0FBQSxNQUFBLENBQUEsWUFBQSxDQUFBLGFBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxpQkFBQSxHQUFBLFVBQUEsQ0FDQSxNQUFBLENBQUEsbUJBQUEsR0FBQSxJQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLE9BQUEsR0FBQSxVQUFBLENBQ0EsR0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQUFDQSxHQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsQ0FBQSxDQUNBLElBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEVBQUEsRUFBQSxDQUNBLEdBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsV0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQ0EsS0FBQSxDQUNBLEdBQUEsTUFBQSxDQUFBLFVBQUEsSUFBQSxJQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxBQUNBLE1BQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxZQUFBLEdBQUEsU0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFlBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsUUFBQSxHQUFBLFNBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxXQUFBLEdBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxDQUNBLEdBQUEsTUFBQSxDQUFBLFlBQUEsSUFBQSxFQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsWUFBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLElBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQUFDQSxHQUFBLEtBQUEsQ0FBQSxJQUFBLElBQUEsVUFBQSxDQUFBLENBQ0EsSUFBQSxTQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxBQUNBLE9BQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFdBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLENBQ0EsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSwyS0FBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsS0FBQSxDQUFBLEdBQUEsQ0FBQSx1QkFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxjQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsY0FBQSxFQUFBLENBQUE7Q0FFQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEscUJBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsMEJBQUEsR0FBQSxVQUFBLENBQ0EsSUFBQSxPQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxBQUNBLEdBQUEsT0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsRUFBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLEdBQUEsT0FBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLEdBQUEsU0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFFBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsTUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsU0FDQSxDQUFBLFNBQUEsUUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsZUFBQSxHQUFBLFNBQUEsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQTtDQUVBLENBQUEsQUFFQSxNQUFBLENBQUEsY0FBQSxHQUFBLFNBQUEsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLGNBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxNQUFBLENBQUEsQ0FDQSxFQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsR0FBQSxNQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxLQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsY0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUNBLEdBQUEsTUFBQSxDQUFBLElBQUEsSUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxjQUFBLEVBQUEsQ0FBQSxDQUNBO0FBRUEsTUFBQSxDQUFBLFVBQUEsR0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLGFBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsYUFBQSxHQUFBLFVBQUEsQ0FDQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxJQUFBLHNCQUFBLENBQUEsQ0FDQSxJQUFBLFdBQUEsQ0FBQSwwVUFBQSxDQUFBLENBQ0EsS0FBQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxJQUFBLDhCQUFBLENBQUEsQ0FDQSxJQUFBLFdBQUEsQ0FBQSwwV0FBQSxDQUFBLENBQ0EsQUFDQSxDQUFBLENBQUEsWUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSx3QkFBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxnQkFBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxvQkFBQSxHQUFBLENBQ0EsV0FBQSxDQUFBLHFCQUFBLEtBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLFFBQUEsQ0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLHdCQUFBLEdBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLFNBQUEsQ0FBQSxJQUFBLENBQ0EsV0FBQSxDQUFBLGtCQUFBLENBQ0EsVUFBQSxDQUFBLHVCQUFBLENBQ0EsS0FBQSxDQUFBLE1BQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLHFCQUFBLEdBQUEsVUFBQSxDQUNBLE1BQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxBQUNBLEdBQUEsTUFBQSxDQUFBLHdCQUFBLENBQUEsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLHdCQUFBLENBQUEsS0FBQSxFQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEscUJBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsYUFBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxpQkFBQSxHQUFBLENBQ0EsUUFBQSxDQUFBLGtCQUFBLFlBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxhQUFBLENBQUEsWUFBQSxHQUFBLFlBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxhQUFBLEdBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLFNBQUEsQ0FBQSxJQUFBLENBQ0EsV0FBQSxDQUFBLGVBQUEsQ0FDQSxVQUFBLENBQUEsNkJBQUEsQ0FDQSxLQUFBLENBQUEsTUFBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxrQkFBQSxHQUFBLFVBQUEsQ0FDQSxNQUFBLENBQUEscUJBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsbUJBRUEsTUFBQSxDQUFBLE9BQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxHQUFBLFlBQUEsQ0FBQSxVQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsaUJBQUEsQ0FBQSxRQUFBLENBQUEsWUFBQSxDQUFBLFVBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUNBLEFBQ0EsTUFBQSxDQUFBLGVBQUEsR0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLEdBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLEFBQ0EsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLElBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLEdBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxFQUFBLENBQ0EsTUFBQSxDQUFBLEVBQUEsQ0FDQSxRQUFBLENBQUEsRUFBQSxDQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxhQUFBLENBQUEsSUFBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFDQSxNQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsQ0FBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsQ0FBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsQ0FBQSxVQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEdBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxDQUNBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsQ0FDQSxLQUFBLENBQUEsRUFBQSxDQUNBLE9BQUEsQ0FBQSxLQUFBLENBQ0EsQ0FBQSxBQUNBLElBQUEsY0FBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLElBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsSUFBQSxDQUFBLENBQ0EsT0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLENBQUEsQUFDQSxPQUFBLElBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUVBLElBQUEsT0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLEVBQUEsQ0FDQSxRQUFBLENBQUEsRUFBQSxDQUNBLEtBQUEsQ0FBQSxFQUFBLENBQ0EsY0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsY0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUNBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsTUFBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLElBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxLQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsVUFBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxLQUFBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLEtBQUEsT0FBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FDQSxBQUVBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0Esa0JBQUEsQ0FDQSxlQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLEtBQUEsYUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLE9BQUEsR0FBQSxDQUNBLEtBQUEsQ0FBQSx1QkFBQSxDQUNBLE9BQUEsQ0FBQSxJQUFBLENBQ0EsQ0FBQSxBQUNBLE9BQUEsQ0FDQSxBQUNBLEdBQUEsY0FBQSxJQUFBLEVBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBLENBQ0EsQUFDQSxjQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLHFCQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsU0FDQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsWUFBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQTtBQUdBLE1BQUEsQ0FBQSxvQkFBQSxHQUFBLFNBQUEsUUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxLQUFBLENBQUEsR0FBQSxDQUFBLGlDQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQ0EsSUFBQSxDQUFBLFFBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsY0FBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsSUFBQSxHQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSwyQkFBQSxDQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxvREFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLG9EQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQTtBQUdBLE1BQUEsQ0FBQSxzQkFBQSxHQUFBLFVBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxHQUFBLENBQUEsc0NBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsY0FBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsSUFBQSxHQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxjQUFBLEdBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsSUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLG1CQUFBLEdBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSw2QkFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsb0RBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBO0FBR0EsTUFBQSxDQUFBLGlCQUFBLEdBQUEsU0FBQSxJQUFBLENBQUEsQ0FDQSxHQUFBLE1BQUEsQ0FBQSxtQkFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxLQUFBLENBQUEsR0FBQSxDQUFBLGlDQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsY0FBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsSUFBQSxHQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxBQUNBLFVBQUEsQ0FBQSxrQkFBQSxHQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGlCQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSw0QkFBQSxDQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsWUFBQSxDQUFBLG9EQUFBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLG9EQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsMEVBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBO0FBR0EsTUFBQSxDQUFBLG1CQUFBLEdBQUEsU0FBQSxJQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxHQUFBLENBQUEsbUNBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxjQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLEFBQ0EsVUFBQSxDQUFBLGtCQUFBLEdBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsWUFBQSxDQUFBLDZCQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxvREFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsbUJBQUEsR0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGdCQUFBLEdBQUEsVUFBQSxDQUVBLEdBQUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLENBQ0EsQUFFQSxHQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FDQSxPQUFBLEtBQUEsQ0FBQSxDQUNBLEFBRUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsY0FBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxFQUFBLENBQ0EsTUFBQSxDQUFBLEVBQUEsQ0FDQSxRQUFBLENBQUEsRUFBQSxDQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxhQUFBLENBQUEsSUFBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsc0JBQUEsR0FBQSxVQUFBLENBQ0EsSUFBQSxhQUFBLENBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxrQkFBQSxDQUNBLFdBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxDQUNBLE1BQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLENBQ0EsUUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUNBLEVBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FDQSxhQUFBLENBQUEsSUFBQSxDQUNBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxTQUNBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLG1CQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSx5QkFBQSxHQUFBLFVBQUEsQ0FDQSxFQUFBLENBQUEsT0FBQSxFQUFBLENBQ0EsSUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxjQUFBLENBQUEsU0FDQSxDQUFBLFdBQUEsQ0FBQSxDQUFBLEFBRUEsU0FBQSxRQUFBLENBQUEsR0FBQSxDQUFBLENBQ0EsT0FBQSxrQkFBQSxDQUFBLHlCQUFBLENBQUEsQ0FDQSxLQUFBLENBQUEsR0FBQSxDQUFBLFdBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxBQUVBLFNBQUEsY0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsR0FBQSxHQUFBLENBQUEsTUFBQSxLQUFBLEdBQUEsSUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsS0FBQSxJQUFBLENBQUEsQ0FDQSxjQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsTUFBQSxDQUFBLE9BQUEsR0FBQSxDQUNBLEtBQUEsQ0FBQSwyREFBQSxDQUNBLE9BQUEsQ0FBQSxJQUFBLENBQ0EsQ0FBQSxDQUNBLEFBQ0EsTUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLENBQ0EsQUFFQSxTQUFBLFdBQUEsQ0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxDQUNBLGtCQUFBLENBQ0EsZUFBQSxFQUFBLENBQ0EsSUFBQSxDQUFBLGNBQUEsQ0FBQSxTQUNBLENBQUEsV0FBQSxDQUFBLENBQUEsQUFFQSxTQUFBLGNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsbUJBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsQUFFQSxTQUFBLFdBQUEsQ0FBQSxHQUFBLENBQUEsQ0FDQSxPQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLHFCQUFBLEdBQUEsU0FBQSxLQUFBLENBQUEsQ0FDQSxHQUFBLE9BQUEsQ0FBQSwwQ0FBQSxDQUFBLENBQUEsS0FVQSxjQUFBLENBQUEsU0FBQSxjQUFBLENBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsbUJBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQ0EsS0FFQSxXQUFBLENBQUEsU0FBQSxXQUFBLENBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQ0FDQSxDQWhCQSxJQUFBLGlCQUFBLENBQUEsTUFBQSxDQUFBLG1CQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxrQkFBQSxDQUNBLHFCQUFBLENBQUEsQ0FDQSxFQUFBLENBQUEsaUJBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLGNBQUEsQ0FBQSxTQUNBLENBQUEsV0FBQSxDQUFBLENBQUEsQ0FVQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsYUFBQSxHQUFBLFVBQUEsQ0FDQSxHQUFBLFNBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxJQUFBLFNBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQ0EsSUFBQSxRQUFBLENBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEFBQ0EsSUFBQSxHQUFBLENBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQUFDQSxJQUFBLE9BQUEsQ0FBQSxTQUFBLENBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxRQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQUFDQSxHQUFBLFFBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLDBLQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsY0FBQSxDQUNBLFNBQUEsQ0FBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLElBQUEsQ0FDQSxDQUFBLENBQ0EsU0FBQSxDQUFBLGtCQUFBLENBQ0EsT0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsNENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUNBLENBQUEsQUFDQSxNQUFBLENBQUEsYUFBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsVUFBQSxDQUFBLDZCQUFBLENBQUEsU0FBQSxNQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQUN4akJBLEdBQUEsQ0FBQSxPQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUVBLFNBQUEsV0FBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLE9BQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSx5QkFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQ0EsQUFFQSxTQUFBLGVBQUEsRUFBQSxDQUNBLE9BQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSwyQkFBQSxDQUFBLENBQUEsQ0FDQSxBQUVBLFNBQUEsa0JBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsNEJBQUEsR0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FDQSxBQUVBLFNBQUEscUJBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsa0NBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUNBLEFBRUEsU0FBQSxlQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsT0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLDRCQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FDQSxBQUVBLFNBQUEseUJBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsa0NBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUNBLEFBRUEsU0FBQSwwQkFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLE9BQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSwyQkFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQ0EsQUFFQSxPQUFBLENBQ0EsV0FBQSxDQUFBLFdBQUEsQ0FDQSxlQUFBLENBQUEsZUFBQSxDQUNBLGtCQUFBLENBQUEsa0JBQUEsQ0FDQSxlQUFBLENBQUEsZUFBQSxDQUNBLHFCQUFBLENBQUEscUJBQUEsQ0FDQSx5QkFBQSxDQUFBLHlCQUFBLENBQ0EsMEJBQUEsQ0FBQSwwQkFBQSxDQUNBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FBQSxBQ3ZDQSxHQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsY0FBQSxDQUFBLENBQ0EsY0FBQSxDQUNBLEtBQUEsQ0FBQSxXQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsd0JBQUEsQ0FDQSxXQUFBLENBQUEseUNBQUEsQ0FDQSxVQUFBLENBQUEscUJBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLHFCQUFBLENBQUEsU0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFFBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsT0FBQSxHQUFBLFVBQUEsQ0FDQSxLQUFBLENBQUEsSUFBQSxDQUFBLHlCQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFFBQUEsR0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEFBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQ3ZCQSxHQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsY0FBQSxDQUFBLENBQ0EsY0FBQSxDQUNBLEtBQUEsQ0FBQSxnQ0FBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLDhDQUFBLENBQ0EsV0FBQSxDQUFBLHFEQUFBLENBQ0EsVUFBQSxDQUFBLHNDQUFBLENBQ0EsT0FBQSxDQUFBLENBQ0EsVUFBQSxDQUFBLG9CQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsY0FBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsQ0FBQSxnQ0FBQSxDQUFBLENBQUEsQUFDQSxPQUFBLENBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsWUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLEFBQ0EsT0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLENBQ0EsQUFDQSxPQUFBLElBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FDQSxDQUFBLENBQ0EsS0FBQSxDQUFBLCtCQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsa0NBQUEsQ0FDQSxNQUFBLENBQUEsQ0FDQSxVQUFBLENBQUEsSUFBQSxDQUNBLENBQ0EsV0FBQSxDQUFBLHFEQUFBLENBQ0EsVUFBQSxDQUFBLHNDQUFBLENBQ0EsT0FBQSxDQUFBLENBQ0EsVUFBQSxDQUFBLG9CQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsY0FBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsQ0FBQSwrQkFBQSxDQUFBLENBQUEsQUFDQSxPQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsQ0FDQSxBQUNBLE9BQUEsSUFBQSxDQUFBLENBQ0EsQ0FDQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsc0NBQUEsQ0FBQSxTQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxrQkFBQSxDQUFBLGtCQUFBLENBQUEsdUNBRUEsTUFBQSxDQUFBLElBQUEsR0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQUFDQSxHQUFBLENBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FDQSxPQUFBLENBQUEsWUFBQSxDQUFBLFVBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxBQUNBLE9BQUEsQ0FBQSxZQUFBLENBQUEsVUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQ0EsQUFDQSxNQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsQ0FDQSxjQUFBLENBQUEsRUFBQSxDQUNBLFVBQUEsQ0FBQSxFQUFBLENBQ0EsZUFBQSxDQUFBLEVBQUEsQ0FDQSxPQUFBLENBQUEsRUFBQSxDQUNBLElBQUEsQ0FBQSxLQUFBLENBQ0EsT0FBQSxDQUFBLEtBQUEsQ0FDQSxNQUFBLENBQUEsS0FBQSxDQUNBLE9BQUEsQ0FBQSxFQUFBLENBQ0EsU0FBQSxDQUFBLEVBQUEsQ0FDQSxrQkFBQSxDQUFBLE1BQUEsQ0FDQSxLQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQ0EsSUFBQSxDQUFBLEVBQUEsQ0FDQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLE9BQUEsR0FBQSxFQUFBLENBQUEsc0NBRUEsTUFBQSxDQUFBLFNBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsWUFBQSxHQUFBLElBQUEsQ0FBQSxpREFJQSxNQUFBLENBQUEsZUFBQSxHQUFBLFNBQUEsS0FBQSxDQUFBLG9CQUlBLE1BQUEsQ0FBQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLHFCQUlBLElBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxZQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUEsYUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxHQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQSxXQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBLGVBQUEsR0FBQSxLQUFBLENBQUEsV0FBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBLGdCQUFBLEdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLEdBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBLGNBQUEsR0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQSxBQUVBLEVBQUEsQ0FBQSxHQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxHQUFBLGVBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxpQkFBQSxDQUFBLFNBQ0EsQ0FBQSxXQUFBLENBQUEsQ0FBQSxBQUVBLFNBQUEsaUJBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxRQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsSUFBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLENBQUEsVUFBQSxDQUFBLFNBQUEsQ0FBQSxZQUFBLENBQUEsV0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUNBLEtBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGdCQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsQ0FDQSxBQUVBLFNBQUEsV0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsNkJBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsYUFBQSxHQUFBLFVBQUEsQ0FDQSxJQUFBLFdBQUEsQ0FBQSxxaENBQUEsQ0FBQSxBQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsV0FBQSxDQUFBLENBQ0EsS0FBQSxDQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFlBQUEsR0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLGdCQUFBLEdBQUEsVUFBQSxDQUNBLEdBQUEsRUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsSUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsSUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsdUJBQUEsQ0FBQSxDQUFBLEFBQ0EsT0FBQSxLQUFBLENBQUEsQ0FDQSxBQUVBLEdBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBLEFBQ0EsT0FBQSxLQUFBLENBQUEsQ0FDQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsSUFBQSxPQUFBLENBQUEsSUFBQSxRQUFBLEVBQUEsQ0FBQSxBQUNBLElBQUEsSUFBQSxJQUFBLElBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUNBLE9BQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUNBLEFBQ0EsSUFBQSxPQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsSUFBQSxDQUFBLENBQ0EsT0FBQSxJQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLElBQUEsQ0FBQSxDQUNBLE9BQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBLEFBQ0EsT0FBQSxJQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFFQSxJQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLElBQUEsQ0FBQSxFQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsSUFBQSxDQUFBLENBQ0EsT0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLENBQUEsQUFDQSxPQUFBLElBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUVBLE9BQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQSxBQUNBLElBQUEsT0FBQSxDQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLElBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUNBLE9BQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FBQSxBQUNBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsQ0FDQSxPQUFBLENBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQSxDQUNBLEFBRUEsSUFBQSxPQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsTUFBQSxDQUNBLEdBQUEsQ0FBQSwyQkFBQSxDQUNBLE9BQUEsQ0FBQSxDQUNBLGNBQUEsQ0FBQSxTQUFBLENBQ0EsQ0FDQSxnQkFBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLENBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FDQSxDQUFBLEFBQ0EsS0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsR0FBQSxZQUFBLENBQUEsVUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLEVBQUEsQ0FBQSxnQ0FBQSxDQUFBLENBQ0EsWUFBQSxDQUFBLFlBQUEsQ0FBQSxVQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLEdBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxJQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxvREFBQSxDQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSx5QkFBQSxDQUFBLENBQUEsQ0FDQSxBQUNBLE1BQUEsQ0FBQSxFQUFBLENBQUEsZ0NBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSw0QkFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsQ0FDQSxHQUFBLFlBQUEsQ0FBQSxTQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsa0JBQUEsQ0FBQSxZQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsMEJBQUEsR0FBQSxVQUFBLENBQ0EsSUFBQSxPQUFBLENBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLEFBQ0EsR0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxFQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsR0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsR0FBQSxTQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsUUFBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxNQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxTQUNBLENBQUEsU0FBQSxRQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxpQkFBQSxHQUFBLFVBQUEsQ0FDQSxHQUFBLFlBQUEsQ0FBQSxVQUFBLENBQUEsQ0FDQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsK0JBQUEsQ0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsY0FBQSxFQUFBLENBQUEsQUFDQSxPQUFBLENBQ0EsQUFFQSxNQUFBLENBQUEsaUJBQUEsQ0FBQSxRQUFBLENBQUEsWUFBQSxDQUFBLFVBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxBQUNBLFVBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLGNBQUEsR0FBQSxVQUFBLENBQ0EsR0FBQSxFQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsbUJBQUEsQ0FBQSxRQUFBLENBQUEsV0FBQSxDQUFBLElBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxtQkFBQSxDQUFBLFFBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxvQ0FBQSxDQUFBLENBQUEsQUFDQSxPQUFBLENBQ0EsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLGNBQUEsR0FBQSxVQUFBLENBQ0EsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsS0FBQSxFQUFBLENBQUEsS0FPQSw2QkFBQSxDQUFBLFNBQUEsNkJBQUEsQ0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBLGVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsZ0JBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLENBQUEsY0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsT0FBQSxFQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsR0FBQSxlQUFBLENBQUEsQ0FBQSxDQUNBLEtBRUEsaUJBQUEsQ0FBQSxTQUFBLGlCQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsUUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLElBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxTQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsQ0FBQSxTQUFBLENBQUEsWUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FDQSxLQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxnQkFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsS0FFQSxXQUFBLENBQUEsU0FBQSxXQUFBLENBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSw2QkFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLENBckNBLE1BQUEsQ0FBQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0Esa0JBQUEsQ0FBQSxXQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLENBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSw2QkFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLGlCQUFBLENBQUEsU0FBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBLENBa0NBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxZQUFBLEdBQUEsU0FBQSxLQUFBLENBQUEsQ0FDQSxTQUFBLFdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLFFBQUEsQ0FBQSxRQUFBLENBQUEsYUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEFBQ0EsUUFBQSxDQUFBLElBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxHQUFBLFFBQUEsQ0FBQSxJQUFBLElBQUEsRUFBQSxDQUFBLENBQ0EsUUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsQUFDQSxPQUFBLFFBQUEsQ0FBQSxDQUNBLEFBRUEsSUFBQSxRQUFBLENBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEFBQ0EsSUFBQSxJQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQUFDQSxJQUFBLFFBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLElBQUEsQ0FBQSxHQUFBLEtBQUEsSUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBRUEsR0FBQSxRQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsQ0FBQSxDQUNBLE9BQUEsS0FBQSxDQUFBLENBQ0EsQUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxDQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxFQUFBLENBQ0EsS0FBQSxDQUFBLEVBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFdBQUEsR0FBQSxVQUFBLENBQ0EsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxPQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxlQUFBLEdBQUEsU0FBQSxLQUFBLENBQUEsQ0FDQSxJQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsQUFDQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEdBQUEsSUFBQSxFQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLGtCQUFBLENBQUEsV0FBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsTUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxTQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLG1CQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFlBQUEsR0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLEVBQUEsQ0FDQSxNQUFBLENBQUEsRUFBQSxDQUNBLFFBQUEsQ0FBQSxFQUFBLENBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxDQUNBLGFBQUEsQ0FBQSxLQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxXQUFBLEdBQUEsVUFBQSxDQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxFQUFBLENBQ0EsTUFBQSxDQUFBLEVBQUEsQ0FDQSxLQUFBLENBQUEsRUFBQSxDQUNBLEVBQUEsQ0FBQSxFQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxjQUFBLEdBQUEsU0FBQSxLQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxpQkFBQSxHQUFBLFNBQUEsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxrQkFBQSxDQUNBLFdBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLE1BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLG9CQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLFNBQUEsb0JBQUEsRUFBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGdCQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLE9BQUEsR0FBQSxDQUNBLEdBQUEsQ0FBQSxFQUFBLENBQ0EsT0FBQSxDQUFBLEtBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLEtBQUEsR0FBQSxDQUNBLGNBQUEsQ0FBQSxFQUFBLENBQ0EsVUFBQSxDQUFBLEVBQUEsQ0FDQSxlQUFBLENBQUEsRUFBQSxDQUNBLE9BQUEsQ0FBQSxFQUFBLENBQ0EsSUFBQSxDQUFBLEtBQUEsQ0FDQSxPQUFBLENBQUEsS0FBQSxDQUNBLE1BQUEsQ0FBQSxLQUFBLENBQ0EsT0FBQSxDQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsRUFBQSxDQUNBLE1BQUEsQ0FBQSxFQUFBLENBQ0EsUUFBQSxDQUFBLEVBQUEsQ0FDQSxFQUFBLENBQUEsQ0FBQSxDQUFBLENBQ0EsYUFBQSxDQUFBLEtBQUEsQ0FDQSxDQUFBLENBQ0Esa0JBQUEsQ0FBQSxNQUFBLENBQ0EsQ0FBQSxBQUNBLE9BQUEsQ0FBQSxPQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUNBLHlEQUlBLE1BQUEsQ0FBQSxrQkFBQSxHQUFBLFNBQUEsaUJBQUEsQ0FBQTtBQUVBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0Esa0JBQUEsQ0FDQSxrQkFBQSxDQUFBLENBQ0EsRUFBQSxDQUFBLGlCQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxjQUFBLENBQUEsU0FDQSxDQUFBLFdBQUEsQ0FBQSxDQUFBLEFBRUEsU0FBQSxjQUFBLENBQUEsR0FBQSxDQUFBLENBRUEsTUFBQSxDQUFBLGdCQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEFBRUEsSUFBQSxPQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsRUFBQSxDQUFBLEFBQ0EsSUFBQSxjQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxBQUNBLElBQUEsWUFBQSxDQUFBLEVBQUEsQ0FBQSxBQUNBLElBQUEsbUJBQUEsQ0FBQSxFQUFBLENBQUEsQUFFQSxJQUFBLElBQUEsSUFBQSxJQUFBLE9BQUEsRUFBQSxDQUNBLFlBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsSUFBQSxDQUNBLEtBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQUFDQSxjQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsSUFBQSxDQUFBLENBQ0EsbUJBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsSUFBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLGtCQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsS0FBQSxDQUFBLGtCQUFBLEdBQUEsTUFBQSxDQUFBLENBQ0EsQUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxZQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBLGNBQUEsR0FBQSxtQkFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEdBQUEsRUFBQSxDQUFBOztBQUdBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQUFFQSxTQUFBLFdBQUEsQ0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxZQUFBLEdBQUEsVUFBQSxDQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxHQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsT0FBQSxHQUFBLFNBQUEsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsa0JBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQUFDQSxJQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLG1DQUFBLENBQUEsQ0FBQSxBQUNBLE9BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxhQUFBLEdBQUEsVUFBQSxDQUNBLEdBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLElBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxJQUFBLFFBQUEsQ0FBQSxTQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQUFDQSxJQUFBLEdBQUEsQ0FBQSxTQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxBQUNBLElBQUEsT0FBQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxBQUNBLEdBQUEsUUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsMEtBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxjQUFBLENBQ0EsU0FBQSxDQUFBLENBQUEsQ0FDQSxPQUFBLENBQUEsSUFBQSxDQUNBLENBQUEsQ0FDQSxTQUFBLENBQUEsa0JBQUEsQ0FDQSxPQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSw0Q0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQ0EsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxhQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQ3JlQSxHQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsY0FBQSxDQUFBLENBQ0EsY0FBQSxDQUNBLEtBQUEsQ0FBQSxtQ0FBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLHNDQUFBLENBQ0EsTUFBQSxDQUFBLENBQ0EsVUFBQSxDQUFBLElBQUEsQ0FDQSxDQUNBLFdBQUEsQ0FBQSw2Q0FBQSxDQUNBLFVBQUEsQ0FBQSw4QkFBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsOEJBQUEsQ0FBQSxTQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxrQkFBQSxDQUFBLG9CQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsSUFBQSxHQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxZQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxrQkFBQSxDQUFBLENBQUEsQ0FBQSxBQUNBLEdBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsRUFBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQSxBQUNBLE9BQUEsS0FBQSxDQUFBLENBQ0EsQUFFQSxNQUFBLENBQUEsS0FBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxNQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsRUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxNQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQUFDQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLE1BQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxFQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQUFDQSxNQUFBLENBQUEsSUFBQSxHQUFBLFVBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLDhCQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsZUFBQSxHQUFBLFVBQUEsQ0FDQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLElBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxrQkFBQSxLQUFBLE1BQUEsQ0FBQSxDQUNBLG9CQUFBLENBQUEsZUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxDQUNBLE9BQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsR0FBQSxPQUFBLEdBQUEsS0FBQSxRQUFBLElBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxZQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFDekRBLEdBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxjQUFBLENBQUEsQ0FDQSxjQUFBLENBQ0EsS0FBQSxDQUFBLG9CQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsMENBQUEsQ0FDQSxXQUFBLENBQUEsZ0RBQUEsQ0FDQSxVQUFBLENBQUEsOEJBQUEsQ0FDQSxPQUFBLENBQUEsQ0FDQSxLQUFBLENBQUEsZUFBQSxLQUFBLENBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxjQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxDQUFBLG9CQUFBLENBQUEsQ0FBQSxBQUNBLE9BQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQUFDQSxPQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsQ0FDQSxBQUNBLE9BQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxtQkFBQSxHQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxPQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUNBLFFBQUEsQ0FBQSxrQkFBQSxLQUFBLENBQUEsS0FBQSxDQUFBLENBQ0EsT0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLHNCQUFBLEdBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE9BQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSwyQkFBQSxDQUFBLENBQUEsQUFDQSxPQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxRQUFBLENBQUEsa0JBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUNBLE9BQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxzQkFBQSxHQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxPQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEscUNBQUEsQ0FBQSxDQUFBLEFBQ0EsT0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQ0EsYUFBQSxDQUFBLHVCQUFBLEtBQUEsQ0FBQSxjQUFBLENBQUEsQ0FDQSxJQUFBLFNBQUEsQ0FBQSxDQUNBLFFBQUEsQ0FBQSxJQUFBLENBQ0EsU0FBQSxDQUFBLElBQUEsQ0FDQSxhQUFBLENBQUEsSUFBQSxDQUNBLENBQUEsQUFDQSxJQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQUFDQSxPQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsdUJBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxHQUFBLGFBQUEsR0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsSUFBQSxNQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxLQUFBLENBQUEsQ0FDQSxLQUFBLENBQUEsS0FBQSxHQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxJQUFBLEdBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxJQUFBLFFBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLElBQUEsV0FBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLENBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FDQSxPQUFBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUFBLEFBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxBQUNBLE9BQUEsTUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUNBLE1BQUEsQ0FBQSxnQkFBQSxLQUFBLENBQUEsWUFBQSxDQUFBLGNBQUEsQ0FBQSxNQUFBLENBQUEsQ0FDQSxLQUFBLENBQUEsR0FBQSxDQUFBLHFCQUFBLENBQUEsQ0FDQSxPQUFBLENBQUEsWUFBQSxDQUFBLE9BQUEsQ0FDQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxFQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsOEJBQUEsQ0FBQSxTQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLENBQUEsT0FBQSxDQUFBLGNBQUEsQ0FBQSxNQUFBLENBQUEsWUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLENBQUEsUUFBQSxDQUFBLGFBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLEFBQ0EsR0FBQSxDQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsT0FBQSxDQUFBLFlBQUEsQ0FBQSxVQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsQUFDQSxPQUFBLENBQUEsWUFBQSxDQUFBLFVBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUNBLEFBQ0EsTUFBQSxDQUFBLGNBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFlBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLE9BQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsS0FBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsUUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFFBQUEsR0FBQSxRQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsYUFBQSxHQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxTQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGFBQUEsR0FBQSxhQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsV0FBQSxHQUFBLGFBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxFQUFBLENBQUEsQ0FDQSxPQUFBLEVBQUEsQ0FBQSxHQUFBLElBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFDQSxJQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxJQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQUEsQUFFQSxNQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxvQkFBQSxHQUFBLFNBQUEsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxZQUFBLENBQUEsYUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFNBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSwwQkFBQSxHQUFBLFVBQUEsQ0FDQSxJQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEFBQ0EsR0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxFQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsR0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsR0FBQSxTQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsUUFBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxNQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxTQUNBLENBQUEsU0FBQSxRQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxjQUFBLEdBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxPQUFBLEdBQUEsSUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxnQkFBQSxDQUFBLGlCQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsSUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsUUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFFBQUEsR0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLGFBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxDQUFBLEdBQUEsSUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUFBLEFBRUEsTUFBQSxDQUFBLGVBQUEsR0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQUFDQSxLQUFBLENBQUEsR0FBQSxDQUFBLDJCQUFBLEdBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxBQUNBLElBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEFBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxJQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxJQUFBLEdBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxJQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUVBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxhQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsSUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsUUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxhQUFBLENBQUEsU0FBQSxDQUFBLFNBQUEsRUFBQSxDQUFBLENBQ0EsT0FBQSxFQUFBLENBQUEsR0FBQSxJQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFlBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFlBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxxQkFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLE1BQUEsR0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLEdBQUEsTUFBQSxDQUFBLFNBQUEsR0FBQSxFQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxNQUFBLEdBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQUFDQSxNQUFBLENBQUEsTUFBQSxHQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsR0FBQSxNQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLE1BQUEsR0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLEdBQUEsTUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxDQUNBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLElBQUEsRUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxLQUFBLENBQUEsSUFBQSxDQUFBLHlCQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxhQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFNBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxBQUNBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLElBQUEsVUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLEFBQ0EsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQUFDQSxFQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLFFBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBLENBQ0EsU0FBQSxDQUFBLEtBQUEsQ0FDQSxTQUFBLENBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxBQUNBLFFBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsR0FBQSxTQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsWUFBQSxDQUFBLHdGQUFBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLHVKQUFBLENBQUEsQ0FBQSxBQUNBLFFBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsR0FBQSxRQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLEFBR0EsTUFBQSxDQUFBLGVBQUEsR0FBQSxVQUFBLENBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsS0FBQSxDQUFBLEFBQ0EsSUFBQSxNQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsSUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxBQUNBLElBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxBQUNBLElBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxLQUFBLENBQUEsQ0FDQSxLQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxZQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBLEFBQ0EsR0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLEtBQUEsQ0FBQSxBQUNBLE9BQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLElBQUEsS0FBQSxDQUFBLE9BQUEsSUFBQSxLQUFBLENBQUEsWUFBQSxDQUFBLE9BQUEsRUFBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxPQUFBLElBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLEVBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsT0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBQ0EsSUFBQSxZQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLElBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEFBQ0EsSUFBQSxDQUFBLFlBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxDQUFBLENBQUEsQUFDQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsSUFBQSxJQUFBLENBQUEsT0FBQSxDQUFBLE9BQUEsS0FBQSxDQUFBLEFBQ0EsT0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsSUFBQSxJQUFBLENBQUEsT0FBQSxJQUFBLElBQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxFQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLE9BQUEsSUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLE9BQUEsRUFBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsWUFBQSxDQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxPQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFFQSxPQUFBLFdBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxJQUFBLFlBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxXQUFBLEdBQUEsU0FBQSxLQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsRUFBQSxDQUFBLG9CQUFBLENBQUEsQ0FDQSxPQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLFNBQUEsR0FBQSxTQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxhQUFBLEdBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFdBQUEsR0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQ0EsT0FBQSxFQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxXQUFBLENBQUEsb0JBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLFFBQUEsR0FBQSxPQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBO0NBRUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLENBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsSUFBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLEdBQUEsQ0FBQSxJQUFBLE9BQUEsQ0FBQSxTQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsQ0FDQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsMEJBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxLQUNBLEtBQUEsQ0FBQSxJQUFBLENBQUEsMEJBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUNBLEdBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUE7QUFFQSxNQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxhQUFBLEdBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsZUFBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxlQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLEtBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsSUFBQSxPQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FDQSxPQUFBLEVBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxBQUNBLElBQUEsWUFBQSxDQUFBLGtCQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBLEdBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxHQUFBLFNBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsS0FBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQTtBQUVBLE1BQUEsQ0FBQSxTQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGFBQUEsR0FBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxXQUFBLENBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxLQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSw2S0FBQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsQ0FDQSxJQUFBLFdBQUEsQ0FBQSw0QkFBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsS0FBQSxHQUFBLDBDQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLEdBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQSxnQkFBQSxDQUFBLFFBQUEsR0FBQSxNQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxHQUFBLGdCQUFBLEdBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLEFBQ0EsUUFBQSxDQUFBLElBQUEsR0FBQSxTQUFBLENBQUEsV0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLHFCQUFBLEdBQUEsU0FBQSxLQUFBLENBQUEsTUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFdBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsU0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFNBQUEsQ0FBQSxZQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxBQUNBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxZQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxZQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQSxBQUNBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxZQUFBLEdBQUEsSUFBQSxJQUFBLEVBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxTQUFBLENBQUEsWUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsWUFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsR0FBQSxJQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsTUFBQSxDQUFBLFNBQUEsQ0FBQSxZQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUEsQ0FDQSxBQUNBLE1BQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxDQUFBLEFBQ0EsRUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxRQUFBLENBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUNBLFNBQUEsQ0FBQSxLQUFBLENBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLGNBQUEsR0FBQSxVQUFBLENBQ0EsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsU0FBQSxDQUFBLFlBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxJQUFBLENBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FDQSxNQUFBLENBQUEsU0FBQSxDQUFBLFlBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxXQUFBLEdBQUEsU0FBQSxHQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUNBLEdBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLDRJQUFBLENBQUEsQ0FBQSxBQUNBLE9BQUEsQ0FDQSxBQUNBLElBQUEsT0FBQSxDQUFBLElBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEFBQ0EsT0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxBQUNBLEdBQUEsT0FBQSxHQUFBLElBQUEsSUFBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLHNCQUFBLENBQUEsQ0FBQSxBQUNBLE9BQUEsQ0FDQSxBQUVBLE9BQUEsS0FBQSxDQUFBLElBQUEsRUFDQSxLQUFBLE9BQUEsQ0FBQSxBQUNBLEtBQUEsT0FBQSxDQUFBLEFBQ0EsS0FBQSxNQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSwrQkFBQSxDQUFBLENBQUEsQUFDQSxPQUFBLEFBQ0EsTUFBQSxBQUVBLEtBQUEsT0FBQSxDQUNBLElBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FDQSxHQUFBLENBQUEsT0FBQSxDQUNBLE1BQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLENBQ0EsWUFBQSxDQUFBLElBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxJQUFBLENBQUEsQ0FDQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLHFCQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxBQUVBLEtBQUEsT0FBQSxDQUNBLE1BQUEsQ0FBQSxxQkFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQUFFQSxLQUFBLFFBQUE7QUFFQSxNQUFBLENBQUEscUJBQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxDQUFBLENBQUE7Ozs7QUFLQSxNQUFBLENBQ0EsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLEtBQUEsR0FBQSxVQUFBLENBQ0EsSUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsSUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsSUFBQSxDQUFBLEFBQ0EsSUFBQSxXQUFBLENBQUEsU0FBQSxHQUFBLFNBQUEsQ0FBQSxLQUFBLEdBQUEsa0NBQUEsR0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBLEdBQUEsWUFBQSxHQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxHQUFBLDRGQUFBLEdBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLEFBQ0EsUUFBQSxDQUFBLElBQUEsR0FBQSxTQUFBLENBQUEsV0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLENBQ0EsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxJQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQ0EsSUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsUUFBQSxDQUFBLG9MQUFBLENBQUEseVFBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FDQSxJQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxRQUFBLENBQUEsb0xBQUEsQ0FBQSx5UUFBQSxDQUFBLENBQ0EsQUFDQSxDQUFBLENBQUEsWUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxjQUFBLENBQ0EsU0FBQSxDQUFBLENBQUEsQ0FDQSxPQUFBLENBQUEsUUFBQSxDQUNBLFFBQUEsQ0FBQSxtQkFBQSxDQUNBLEdBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLElBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxJQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsSUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLFFBQUEsR0FBQSxJQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQSxDQUNBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxLQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQUFDQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLFFBQUEsSUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBLGFBQUEsRUFBQSxDQUFBLEtBQ0EsTUFBQSxDQUFBLFdBQUEsQ0FBQSxPQUFBLEdBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxHQUFBLDBCQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQ0EsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxRQUFBLENBQ0EsUUFBQSxDQUFBLG1CQUFBLENBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBO0FBR0EsTUFBQSxDQUFBLGNBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsWUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxnQkFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxZQUFBLEdBQUEsRUFBQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFdBQUEsR0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxZQUFBLEdBQUEsTUFBQSxDQUFBLGdCQUFBLENBQUEsYUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFNBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxlQUFBLEdBQUEsU0FBQSxLQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsWUFBQSxHQUFBLE1BQUEsQ0FBQSxZQUFBLENBQUEsYUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsZUFBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLE9BQUEsR0FBQSxVQUFBLENBRUEsR0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFlBQUEsR0FBQSxTQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsWUFBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsU0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxDQUNBLEdBQUEsTUFBQSxDQUFBLFlBQUEsSUFBQSxFQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsWUFBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLElBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFlBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxBQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsMktBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxHQUFBLENBQUEsdUJBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsY0FBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsSUFBQSxHQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLHFCQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBO0FBRUEsTUFBQSxDQUFBLGlCQUFBLEdBQUEsU0FBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsQUFDQSxPQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsQ0FBQSxTQUFBLENBQUEsV0FBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxJQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsSUFBQSxHQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsS0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFFQSxNQUFBLENBQUEsRUFBQSxDQUFBLGNBQUEsQ0FBQSxTQUFBLE9BQUEsQ0FBQSxDQUNBLEdBQUEsT0FBQSxDQUFBLE9BQUEsSUFBQSxZQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsT0FBQSxHQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQUFDQSxHQUFBLE9BQUEsQ0FBQSxJQUFBLElBQUEsT0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLENBQ0EsQ0FDQSxDQUNBLENBQUEsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxFQUFBLENBQUEsYUFBQSxDQUFBLFNBQUEsSUFBQSxDQUFBLENBQ0EsR0FBQSxJQUFBLElBQUEsRUFBQSxDQUFBLENBQ0EsR0FBQSxJQUFBLENBQUEsR0FBQSxJQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FDQSxDQUFBLENBQUEsQUFFQSxNQUFBLENBQUEsV0FBQSxHQUFBLFNBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQTs7Ozs7QUFNQSxNQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxPQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsQ0FDQSxFQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQ0EsT0FBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLENBQ0EsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLE9BQUEsR0FBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFVBQUEsR0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxhQUFBLENBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxjQUFBLEdBQUEsU0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQ0EsSUFBQSxRQUFBLENBQUEsRUFBQSxDQUFBLEFBQ0EsSUFBQSxLQUFBLENBQUEsSUFBQSxJQUFBLEVBQUEsQ0FBQSxBQUNBLElBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FDQSxJQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsSUFBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQUFDQSxJQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsRUFBQSxDQUFBLENBQ0EsT0FBQSxFQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxNQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxJQUFBLENBQUEsQ0FDQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFDQSxJQUFBLFVBQUEsQ0FBQSxFQUFBLENBQUEsQUFDQSxJQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsRUFBQSxDQUFBLENBQUEsRUFBQSxFQUFBLENBQ0EsVUFBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLENBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FDQSxDQUFBLENBQ0EsQUFDQSxTQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsRUFBQSxDQUFBLENBQ0EsVUFBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsR0FBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFFQSxNQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsQ0FBQSxBQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FDQSxBQUNBLE9BQUEsUUFBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxZQUFBLEdBQUEsVUFBQSxDQUNBLFNBQUEsWUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxFQUFBLENBQUEsQ0FDQSxFQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLEFBQ0EsWUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxBQUNBLFlBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQUFDQSxZQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQUFDQSxZQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQUFFQSxJQUFBLEdBQUEsQ0FBQSxJQUFBLElBQUEsRUFBQSxDQUFBLEFBQ0EsR0FBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxBQUVBLElBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxBQUNBLElBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQUFDQSxJQUFBLFVBQUEsQ0FBQSxTQUFBLENBQUEsQUFDQSxHQUFBLENBQ0EsVUFBQSxHQUFBLFNBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxJQUFBLENBQUEsQ0FDQSxHQUFBLElBQUEsQ0FBQSxHQUFBLEdBQUEsR0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxHQUFBLElBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFFBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxLQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsSUFBQSxDQUFBLENBQ0EsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsRUFBQSxJQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxHQUFBLElBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBQ0EsU0FBQSxHQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FDQSxNQUFBLFNBQUEsSUFBQSxVQUFBLEVBQUEsQUFFQSxJQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEFBQ0EsR0FBQSxDQUNBLFVBQUEsR0FBQSxTQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsSUFBQSxDQUFBLENBQ0EsR0FBQSxJQUFBLENBQUEsR0FBQSxHQUFBLEdBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLEVBQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsR0FBQSxFQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsR0FBQSxJQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxRQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLElBQUEsQ0FBQSxDQUNBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLEVBQUEsSUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLEVBQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsR0FBQSxJQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUNBLFNBQUEsR0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQ0EsTUFBQSxTQUFBLElBQUEsVUFBQSxFQUFBLEFBRUEsR0FBQSxNQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsS0FBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFlBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFdBQUEsQ0FBQSx3QkFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsTUFBQSxDQUFBLGNBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxNQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQUFDQSxNQUFBLENBQUEsWUFBQSxFQUFBLENBQUEsQUFFQSxNQUFBLENBQUEsWUFBQSxHQUFBLFVBQUEsQ0FDQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLElBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxLQUFBLEdBQUEsTUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxDQUNBLEFBRUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxJQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsQ0FDQSxBQUNBLE1BQUEsQ0FBQSxPQUFBLENBQUEsZ0JBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxLQUFBLENBQUEsR0FBQSxDQUFBLGFBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLGFBQUEsR0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLEFBQ0EsS0FBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsQUFDQSxLQUFBLENBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQUFDQSxLQUFBLENBQUEsSUFBQSxDQUFBLDBCQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxLQUFBLENBQUEsSUFBQSxDQUFBLEFBQ0EsS0FBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsQUFDQSxLQUFBLENBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQUFDQSxLQUFBLENBQUEsSUFBQSxDQUFBLDBCQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLEtBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxLQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsS0FBQSxDQUFBLEdBQUEsQ0FBQSxhQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLFVBQUEsQ0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLFdBQUEsQ0FBQSxPQUFBLEdBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxHQUFBLDBCQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQUFDQSxVQUFBLENBQUEsVUFBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFdBQUEsQ0FBQSxpQkFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FFQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFFBQUEsR0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLEdBQUEsS0FBQSxDQUFBLElBQUEsSUFBQSxPQUFBLENBQUEsQ0FDQSxPQUFBLEVBQUEsQ0FBQSxDQUNBLEtBQUEsR0FBQSxLQUFBLENBQUEsSUFBQSxJQUFBLE9BQUEsQ0FBQSxDQUNBLE9BQUEsQ0FDQSxrQkFBQSxDQUFBLFNBQUEsQ0FDQSxDQUFBLENBQ0EsS0FBQSxHQUFBLEtBQUEsQ0FBQSxJQUFBLElBQUEsT0FBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLElBQUEsT0FBQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLElBQUEsTUFBQSxDQUFBLENBQ0EsT0FBQSxDQUNBLGtCQUFBLENBQUEsU0FBQSxDQUNBLE9BQUEsQ0FBQSxlQUFBLENBQ0EsQ0FBQSxDQUNBLEtBQUEsR0FBQSxLQUFBLENBQUEsSUFBQSxJQUFBLFFBQUEsQ0FBQSxDQUNBLEdBQUEsS0FBQSxDQUFBLEtBQUEsSUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxJQUFBLEtBQUEsQ0FBQSxLQUFBLElBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FDQSxrQkFBQSxDQUFBLFNBQUEsQ0FDQSxDQUFBLENBQ0EsS0FBQSxDQUNBLE9BQUEsQ0FDQSxrQkFBQSxDQUFBLFNBQUEsQ0FDQSxPQUFBLENBQUEsZUFBQSxDQUNBLENBQUEsQ0FDQSxDQUNBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxpQkFBQSxHQUFBLFNBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxRQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLEFBQ0EsT0FBQSxDQUFBLFFBQUEsQ0FBQSxRQUFBLENBQUEsU0FBQSxDQUFBLFdBQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUdBLE1BQUEsQ0FBQSxjQUFBLEdBQUEsU0FBQSxLQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsS0FBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLEFBQ0EsS0FBQSxDQUFBLFlBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsWUFBQSxDQUFBLENBQUEsQUFDQSxPQUFBLEtBQUEsQ0FBQSxZQUFBLEdBQUEsSUFBQSxJQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsV0FBQSxHQUFBLFNBQUEsS0FBQSxDQUFBLENBQ0EsT0FBQSxLQUFBLENBQUEsSUFBQSxJQUFBLE9BQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxJQUFBLFFBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsWUFBQSxHQUFBLFVBQUEsQ0FDQSxPQUFBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUdBLE1BQUEsQ0FBQSxhQUFBLEdBQUEsVUFBQSxDQUNBLElBQUEsV0FBQSxDQUFBLDZpRUFBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxXQUFBLENBQUEsQ0FDQSxLQUFBLENBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsV0FBQSxHQUFBLFNBQUEsS0FBQSxDQUFBLENBQ0EsSUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEFBQ0EsSUFBQSxPQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxzREFBQSxDQUFBLENBQUEsQUFDQSxHQUFBLE9BQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxBQUNBLE9BQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSx1QkFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxjQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLE9BQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGNBQUEsR0FBQSxLQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLFVBQUEsQ0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLGNBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsY0FBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLFVBQUEsQ0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLGNBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsY0FBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLGNBQUEsR0FBQSxVQUFBLENBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLGNBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGFBQUEsR0FBQSxVQUFBLENBQ0EsR0FBQSxTQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsSUFBQSxTQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUNBLElBQUEsUUFBQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxBQUNBLElBQUEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLEFBQ0EsSUFBQSxPQUFBLENBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEFBQ0EsR0FBQSxRQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSwwS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLGNBQUEsQ0FDQSxTQUFBLENBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxJQUFBLENBQ0EsQ0FBQSxDQUNBLFNBQUEsQ0FBQSxrQkFBQSxDQUNBLE9BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxHQUFBLDRDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FDQSxNQUFBLENBQUEsY0FBQSxFQUFBLENBQUEsQ0FDQSxDQUNBLEtBQUEsQ0FDQSxNQUFBLENBQUEsY0FBQSxFQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsWUFBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsYUFBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFHQSxHQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsQ0FBQSxTQUFBLE1BQUEsQ0FBQSxDQUNBLE9BQUEsQ0FDQSxRQUFBLENBQUEsR0FBQSxDQUNBLEtBQUEsQ0FBQSxDQUNBLFNBQUEsQ0FBQSxHQUFBLENBQ0EsUUFBQSxDQUFBLEdBQUEsQ0FDQSxZQUFBLENBQUEsR0FBQSxDQUNBLENBQ0EsSUFBQSxDQUFBLGNBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsR0FBQSxTQUFBLENBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsRUFBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLEFBQ0EsT0FBQSxJQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsSUFBQSxPQUFBLENBQUEsQ0FDQSxTQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUNBLFFBQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsWUFBQSxDQUFBLEtBQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBLElBQUEsQ0FDQSxDQUFBLEFBQ0EsSUFBQSxRQUFBLENBQUEsT0FBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsWUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsQUFDQSxJQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLENBQUEsY0FBQSxFQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxBQUNBLElBQUEsUUFBQSxDQUFBLE9BQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLFlBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQUFDQSxJQUFBLFFBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsQ0FBQSxDQUFBLEFBQ0EsR0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxJQUFBLEdBQUEsV0FBQSxDQUFBLE9BQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLEdBQUEsR0FBQSxVQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQ0EsS0FBQSxHQUFBLFFBQUEsSUFBQSxPQUFBLElBQUEsUUFBQSxJQUFBLFFBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxJQUFBLEdBQUEsV0FBQSxDQUFBLE9BQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLEdBQUEsR0FBQSxVQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQ0EsS0FBQSxHQUFBLFFBQUEsSUFBQSxPQUFBLElBQUEsUUFBQSxJQUFBLFFBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxJQUFBLEdBQUEsV0FBQSxDQUFBLE9BQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLEdBQUEsR0FBQSxVQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQ0EsS0FBQSxHQUFBLFFBQUEsSUFBQSxPQUFBLElBQUEsUUFBQSxJQUFBLFFBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxJQUFBLEdBQUEsV0FBQSxDQUFBLE9BQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLEdBQUEsR0FBQSxVQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUNBLE9BQUEsQ0FBQSxNQUFBLENBQ0EsUUFBQSxDQUFBLDhCQUFBLENBQ0EsQ0FBQSxBQUVBLFNBQUEsV0FBQSxDQUFBLFFBQUEsQ0FBQSxPQUFBLENBQUEsQ0FDQSxHQUFBLE1BQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxNQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsTUFBQSxDQUFBLFlBQUEsQ0FBQSxJQUFBLE1BQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxZQUFBLENBQUEsSUFBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBLENBQ0EsT0FBQSxTQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsT0FBQSxNQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQUFFQSxTQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsQUFDQSxJQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxFQUFBLENBQUEsQUFDQSxJQUFBLElBQUEsQ0FBQSxLQUFBLElBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQUFDQSxLQUFBLEdBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLEtBQUEsR0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxBQUNBLE9BQUEsR0FBQSxPQUFBLEdBQUEsRUFBQSxDQUFBLEdBQUEsR0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLEFBQ0EsSUFBQSxPQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsR0FBQSxPQUFBLEdBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLE9BQUEsT0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLENBQUEsQUMvMkJBLFlBQUEsQ0FBQSxBQUNBLEdBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLFNBQUEsVUFBQSxDQUFBLENBQ0EsSUFBQSxNQUFBLENBQUEsQUFDQSxPQUFBLENBQ0EsRUFBQSxDQUFBLFlBQUEsU0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxFQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsQ0FDQSxJQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQUFDQSxVQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FDQSxRQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQ0EsSUFBQSxDQUFBLGNBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUNBLElBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxBQUNBLFVBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUNBLEdBQUEsUUFBQSxDQUFBLENBQ0EsUUFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQ0EsVUFBQSxDQUFBLG9CQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FDQSxJQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQUFDQSxVQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FDQSxHQUFBLFFBQUEsQ0FBQSxDQUNBLFFBQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUNBLE9BQUEsQ0FBQSxrQkFBQSxDQUNBLE1BQUEsR0FBQSxFQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQ0FDQSxDQUNBLFVBQUEsQ0FBQSxxQkFBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEVBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQ3ZDQSxHQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsY0FBQSxDQUFBLENBQ0EsY0FBQSxDQUNBLEtBQUEsQ0FBQSxjQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsMkJBQUEsQ0FDQSxXQUFBLENBQUEsK0NBQUEsQ0FDQSxVQUFBLENBQUEsd0JBQUEsQ0FDQSxPQUFBLENBQUEsQ0FDQSxhQUFBLENBQUEsdUJBQUEsS0FBQSxDQUFBLGNBQUEsQ0FBQSxDQUNBLElBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxBQUNBLEdBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxTQUFBLENBQUEsQ0FDQSxRQUFBLENBQUEsSUFBQSxDQUNBLFNBQUEsQ0FBQSxJQUFBLENBQ0EsYUFBQSxDQUFBLElBQUEsQ0FDQSxDQUFBLEFBQ0EsT0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLHVCQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsR0FBQSxhQUFBLEdBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLElBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsS0FBQSxDQUFBLENBQ0EsS0FBQSxDQUFBLEtBQUEsR0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLENBQUEsRUFBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsQUFDQSxLQUFBLENBQUEsSUFBQSxHQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsSUFBQSxRQUFBLENBQUEsQ0FDQSxPQUFBLENBQUEsQ0FBQSxDQUFBLENBQ0EsS0FBQSxHQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxJQUFBLFdBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsT0FBQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQ0FBQSxBQUNBLE9BQUEsTUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLE9BQUEsRUFBQSxDQUFBLENBQ0EsQ0FDQSxDQUNBLFVBQUEsQ0FBQSxvQkFBQSxLQUFBLENBQUEsY0FBQSxDQUFBLENBQ0EsSUFBQSxJQUFBLENBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLEFBQ0EsR0FBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLFdBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLFNBQUEsSUFBQSxJQUFBLENBQUEsVUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxBQUNBLElBQUEsV0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsU0FBQSxJQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEFBQ0EsT0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLHFCQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsRUFBQSxDQUNBLFdBQUEsQ0FBQSxXQUFBLENBQ0EsV0FBQSxDQUFBLFdBQUEsQ0FDQSxXQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxFQUFBLENBQ0EsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsT0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLE9BQUEsRUFBQSxDQUFBLENBQ0EsQ0FDQSxDQUNBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSx3QkFBQSxDQUFBLFNBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxhQUFBLENBQUEsVUFBQSxDQUFBLEtBQUEsQ0FBQSxjQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLEFBQ0EsT0FBQSxDQUNBLEFBQ0EsTUFBQSxDQUFBLEtBQUEsR0FBQSxvQkFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQUFDQSxVQUFBLENBQUEsa0JBQUEsR0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLGNBQUEsQ0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsYUFBQSxHQUFBLGFBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxpQkFBQSxHQUFBLGFBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxVQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLGFBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxTQUFBLEdBQUEsRUFBQSxDQUFBLEFBRUEsTUFBQSxDQUFBLGVBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLFNBQUEsQ0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsZUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSx1QkFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxlQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSx1QkFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxlQUFBLENBQUEsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxlQUFBLEdBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGVBQUEsR0FBQSxTQUFBLENBQUEsQUFFQSxNQUFBLENBQUEsdUJBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsZUFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsdUJBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsZUFBQSxDQUFBLENBQUEsQUFFQSxNQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FDQSxPQUFBLE1BQUEsQ0FBQSxlQUFBLENBQUEsQ0FDQSxDQUFBLFNBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSx1QkFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQ0EsT0FBQSxNQUFBLENBQUEsZUFBQSxDQUFBLENBQ0EsQ0FBQSxTQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsdUJBQUEsR0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUNBLE9BQUEsTUFBQSxDQUFBLGVBQUEsQ0FBQSxDQUNBLENBQUEsU0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLHVCQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FDQSxPQUFBLE1BQUEsQ0FBQSxlQUFBLENBQUEsQ0FDQSxDQUFBLFNBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSx1QkFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBRUEsTUFBQSxDQUFBLE1BQUEsR0FBQSxjQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLFdBQUEsQ0FBQSxBQUNBLElBQUEsZ0JBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxDQUFBLENBQ0EsS0FBQSxDQUFBLEVBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLGlCQUFBLEdBQUEsVUFBQSxDQUNBLE1BQUEsQ0FBQSxTQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsVUFBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBLENBQUEsQUFFQSxLQUFBLENBQUEsSUFBQSxDQUFBLHFCQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FDQSxXQUFBLENBQUEsTUFBQSxDQUFBLHVCQUFBLENBQ0EsV0FBQSxDQUFBLE1BQUEsQ0FBQSx1QkFBQSxDQUNBLFdBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxDQUFBLENBQ0EsS0FBQSxDQUFBLEVBQUEsQ0FDQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLE9BQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSwwQkFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsRUFBQSxDQUFBLG9CQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLGtCQUFBLEdBQUEsVUFBQSxDQUNBLElBQUEsT0FBQSxDQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxhQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsT0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsaUJBQUEsQ0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLEdBQUEsTUFBQSxDQUFBLFNBQUEsSUFBQSxFQUFBLENBQUEsQ0FDQSxJQUFBLEdBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEFBQ0EsR0FBQSxHQUFBLEdBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQUFDQSxHQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUNBLENBQ0EsS0FBQSxHQUFBLFFBQUEsQ0FBQSxNQUFBLENBQUEsdUJBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUNBLEdBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLFNBQUEsSUFBQSxNQUFBLENBQUEsdUJBQUEsSUFBQSxLQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsU0FBQSxJQUFBLE1BQUEsQ0FBQSx1QkFBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FDQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsYUFBQSxHQUFBLE9BQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsU0FBQSxHQUFBLENBQ0EsUUFBQSxDQUFBLElBQUEsQ0FDQSxTQUFBLENBQUEsSUFBQSxDQUNBLGFBQUEsQ0FBQSxJQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxpQkFBQSxHQUFBLFVBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLElBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsQUFDQSxTQUFBLEdBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxHQUFBLENBQUEsdUJBQUEsR0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsR0FBQSxhQUFBLEdBQUEsU0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsSUFBQSxNQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxhQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxJQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxJQUFBLEdBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxJQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxhQUFBLEdBQUEsTUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxTQUFBLE1BQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxNQUFBLEdBQUEsTUFBQSxDQUFBLEFBQ0EsSUFBQSxVQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxBQUNBLEdBQUEsTUFBQSxJQUFBLFdBQUEsQ0FBQSxDQUNBLEdBQUEsVUFBQSxJQUFBLFdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxhQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsU0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxZQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsTUFBQSxDQUFBLGFBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxTQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLFdBQUEsQ0FBQSxDQUNBLENBQ0EsS0FBQSxHQUFBLE1BQUEsSUFBQSxnQkFBQSxDQUFBLENBQ0EsR0FBQSxVQUFBLElBQUEsV0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLGFBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLENBQUEsa0JBQUEsR0FBQSxDQUFBLENBQUEsa0JBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsWUFBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLE1BQUEsQ0FBQSxhQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxDQUFBLGtCQUFBLEdBQUEsQ0FBQSxDQUFBLGtCQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLFdBQUEsQ0FBQSxDQUNBLENBQ0EsS0FBQSxDQUNBLEdBQUEsVUFBQSxJQUFBLFdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxhQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxFQUFBLEdBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLFlBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FDQSxNQUFBLENBQUEsYUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxPQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsRUFBQSxHQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxXQUFBLENBQUEsQ0FDQSxDQUNBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxHQUFBLENBQUEsWUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBR0EsTUFBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLENBQ0EsZ0JBQUEsQ0FBQSxJQUFBLElBQUEsRUFBQSxDQUFBLEFBQ0EsZ0JBQUEsQ0FBQSxLQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsS0FBQSxDQUFBLElBQUEsQ0FBQSxxQkFBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQ0EsV0FBQSxDQUFBLE1BQUEsQ0FBQSx1QkFBQSxDQUNBLFdBQUEsQ0FBQSxNQUFBLENBQUEsdUJBQUEsQ0FDQSxXQUFBLENBQUEsZ0JBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsMEJBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsT0FBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsWUFBQSxDQUFBLG9CQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsU0FBQSxHQUFBLFNBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxLQUFBLENBQUEsQ0FDQSxRQUFBLENBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLElBQUEsRUFBQSxDQUNBLFFBQUEsQ0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsR0FBQSxDQUNBLElBQUEsQ0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsVUFBQSxDQUFBLFFBQUEsR0FBQSxrQkFBQSxDQUNBLElBQUEsQ0FBQSxPQUFBLENBQ0EsQ0FBQSxDQUNBLFNBQUEsQ0FBQSxVQUFBLENBQ0EsRUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxHQUFBLENBQ0EsS0FBQSxDQUFBLE1BQUEsQ0FDQSxLQUFBLENBQUEsRUFBQSxDQUNBLFFBQUEsQ0FBQSxLQUFBLENBQ0EsQ0FDQSxFQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FDQSxLQUFBLENBQUEsUUFBQSxDQUNBLEtBQUEsQ0FBQSxFQUFBLENBQ0EsUUFBQSxDQUFBLEtBQUEsQ0FDQSxDQUNBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxJQUFBLENBQUEsaUJBQUEsQ0FBQSxLQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxFQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSx5QkFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFdBQUEsR0FBQSxTQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLDhDQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsY0FBQSxDQUNBLFNBQUEsQ0FBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLEtBQUEsQ0FDQSxRQUFBLENBQUEsbUJBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxJQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUNBLEVBQUEsQ0FBQSxPQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGFBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsaUJBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLENBQ0EsT0FBQSxDQUFBLElBQUEsQ0FDQSxRQUFBLENBQUEsbUJBQUEsQ0FDQSxPQUFBLENBQUEsR0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsaUJBQUEsR0FBQSxVQUFBLENBQ0EsT0FBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLENBQUEsU0FBQSxLQUFBLENBQUEsQ0FDQSxHQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsSUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUNBLEdBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxLQUFBLElBQUEsUUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLE9BQUEsQ0FBQSxnQkFBQSxHQUFBLElBQUEsQ0FBQSxDQUNBLENBQ0EsQUFDQSxHQUFBLEtBQUEsQ0FBQSxFQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsSUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUNBLEdBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxLQUFBLElBQUEsUUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLE9BQUEsQ0FBQSxnQkFBQSxHQUFBLElBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGFBQUEsR0FBQSxTQUFBLFVBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsVUFBQSxDQUFBLENBQ0EsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxhQUFBLEdBQUEsVUFBQSxDQUNBLEdBQUEsTUFBQSxDQUFBLFVBQUEsSUFBQSxhQUFBLENBQUEsQ0FDQSxJQUFBLFdBQUEsQ0FBQSw2ZUFBQSxDQUFBLENBQ0EsS0FBQSxHQUFBLE1BQUEsQ0FBQSxVQUFBLElBQUEsYUFBQSxDQUFBLENBQ0EsSUFBQSxXQUFBLENBQUEsaWtCQUFBLENBQUEsQ0FDQSxBQUVBLENBQUEsQ0FBQSxZQUFBLENBQUEsV0FBQSxDQUFBLENBQ0EsS0FBQSxDQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGFBQUEsR0FBQSxVQUFBLENBQ0EsR0FBQSxTQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsSUFBQSxTQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUNBLElBQUEsUUFBQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxBQUNBLElBQUEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLEFBQ0EsSUFBQSxPQUFBLENBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEFBQ0EsR0FBQSxRQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSwwS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLGNBQUEsQ0FDQSxTQUFBLENBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxJQUFBLENBQ0EsQ0FBQSxDQUNBLFNBQUEsQ0FBQSxrQkFBQSxDQUNBLE9BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxHQUFBLDRDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FDQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGFBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGlCQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFDdFlBLEdBQUEsQ0FBQSxPQUFBLENBQUEsa0JBQUEsQ0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FDQSxzQkFBQSxDQUFBLGdDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsaUJBQUEsR0FBQSxNQUFBLEdBQUEsZUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxzQkFBQSxDQUFBLGdDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsaUJBQUEsR0FBQSxNQUFBLEdBQUEsZUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxpQkFBQSxDQUFBLDJCQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsaUJBQUEsR0FBQSxNQUFBLEdBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxpQkFBQSxDQUFBLDJCQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsaUJBQUEsR0FBQSxNQUFBLEdBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxvQkFBQSxDQUFBLDhCQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsaUJBQUEsR0FBQSxNQUFBLEdBQUEsYUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxtQkFBQSxDQUFBLDZCQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsaUJBQUEsR0FBQSxNQUFBLEdBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFDckJBLEdBQUEsQ0FBQSxPQUFBLENBQUEsZ0JBQUEsQ0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FDQSxVQUFBLENBQUEsb0JBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxFQUFBLENBQUEsSUFBQSxRQUFBLEVBQUEsQ0FBQSxBQUNBLEVBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEFBQ0EsT0FBQSxLQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsTUFBQSxDQUNBLEdBQUEsQ0FBQSxVQUFBLENBQ0EsT0FBQSxDQUFBLENBQUEsY0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUNBLGVBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUNBLElBQUEsQ0FBQSxFQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLFFBQUEsQ0FBQSxDQUNBLE9BQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBRUEsT0FBQSxDQUFBLGlCQUFBLElBQUEsQ0FBQSxDQUNBLE9BQUEsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLE1BQUEsQ0FDQSxHQUFBLENBQUEsWUFBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLFFBQUEsQ0FBQSxDQUNBLE9BQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBRUEsVUFBQSxDQUFBLG9CQUFBLElBQUEsQ0FBQSxDQUNBLE9BQUEsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FDQSxHQUFBLENBQUEsYUFBQSxHQUFBLElBQUEsQ0FBQSxHQUFBLENBQ0EsSUFBQSxDQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxRQUFBLENBQUEsQ0FDQSxPQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUNBLG1CQUFBLENBQUEsNkJBQUEsSUFBQSxDQUFBLENBQ0EsT0FBQSxLQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsS0FBQSxDQUNBLEdBQUEsQ0FBQSxhQUFBLEdBQUEsSUFBQSxDQUFBLEdBQUEsR0FBQSxTQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLFFBQUEsQ0FBQSxDQUNBLE9BQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBRUEsUUFBQSxDQUFBLG1CQUFBLENBQ0EsT0FBQSxLQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsS0FBQSxDQUNBLEdBQUEsQ0FBQSxZQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLFFBQUEsQ0FBQSxDQUNBLE9BQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBRUEsY0FBQSxDQUFBLHdCQUFBLElBQUEsQ0FBQSxDQUNBLE9BQUEsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FDQSxHQUFBLENBQUEsYUFBQSxHQUFBLElBQUEsQ0FBQSxFQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLFFBQUEsQ0FBQSxDQUNBLE9BQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQ0EsVUFBQSxDQUFBLG9CQUFBLE1BQUEsQ0FBQSxDQUNBLE9BQUEsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFFBQUEsQ0FDQSxHQUFBLENBQUEsYUFBQSxHQUFBLE1BQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsUUFBQSxDQUFBLENBQ0EsT0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FFQSxnQkFBQSxDQUFBLDBCQUFBLE9BQUEsQ0FBQSxDQUNBLE9BQUEsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFFBQUEsQ0FDQSxHQUFBLENBQUEsV0FBQSxHQUFBLE9BQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsUUFBQSxDQUFBLENBQ0EsT0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FFQSxlQUFBLENBQUEseUJBQUEsTUFBQSxDQUFBLENBQ0EsT0FBQSxLQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsUUFBQSxDQUNBLEdBQUEsQ0FBQSxXQUFBLEdBQUEsTUFBQSxHQUFBLE9BQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsUUFBQSxDQUFBLENBQ0EsT0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FFQSxhQUFBLENBQUEsdUJBQUEsTUFBQSxDQUFBLENBQ0EsT0FBQSxLQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsS0FBQSxDQUNBLEdBQUEsQ0FBQSxhQUFBLEdBQUEsTUFBQSxHQUFBLFlBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsUUFBQSxDQUFBLENBQ0EsT0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FFQSxhQUFBLENBQUEsdUJBQUEsTUFBQSxDQUFBLFFBQUEsQ0FDQSxDQUNBLE9BQUEsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FDQSxHQUFBLENBQUEsZ0NBQUEsR0FBQSxNQUFBLEdBQUEsR0FBQSxHQUFBLFFBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsUUFBQSxDQUFBLENBQ0EsT0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFDdEhBLEdBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxjQUFBLENBQUEsQ0FDQSxjQUFBLENBQ0EsS0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSx1QkFBQSxDQUNBLFdBQUEsQ0FBQSwwQ0FBQSxDQUNBLFVBQUEsQ0FBQSxvQkFBQSxDQUNBLE9BQUEsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxnQkFBQSxDQUNBLE9BQUEsRUFBQSxDQUFBLENBQ0EsQ0FDQSxDQUNBLENBQUEsQ0FDQSxLQUFBLENBQUEsYUFBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLDJCQUFBLENBQ0EsV0FBQSxDQUFBLHVDQUFBLENBQ0EsVUFBQSxDQUFBLG9CQUFBLENBQ0EsT0FBQSxDQUFBLENBQ0EsS0FBQSxDQUFBLGdCQUFBLENBQ0EsT0FBQSxFQUFBLENBQUEsQ0FDQSxDQUNBLENBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxjQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsdUNBQUEsQ0FDQSxXQUFBLENBQUEsdUNBQUEsQ0FDQSxVQUFBLENBQUEsb0JBQUEsQ0FDQSxPQUFBLENBQUEsQ0FDQSxLQUFBLENBQUEsZ0JBQUEsQ0FDQSxPQUFBLEVBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLG9CQUFBLENBQUEsU0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLGNBQUEsQ0FBQSxnQkFBQSxDQUFBLE1BQUEsQ0FBQSxjQUFBLENBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLEFBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLEFBQ0EsT0FBQSxDQUNBLEFBRUEsSUFBQSxJQUFBLENBQUEsSUFBQSxJQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxXQUFBLEdBQUEsSUFBQSxDQUFBLFdBQUEsRUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxBQUNBLFNBQUEsV0FBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLElBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQUFDQSxHQUFBLElBQUEsS0FBQSxLQUFBLENBQUEsQ0FDQSxJQUFBLFVBQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQUFDQSxJQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxFQUFBLEVBQUEsQ0FDQSxJQUFBLFVBQUEsQ0FBQSxJQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxBQUNBLEdBQUEsVUFBQSxLQUFBLFVBQUEsQ0FBQSxDQUNBLE9BQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsQ0FDQSxDQUNBLENBQ0EsQUFDQSxPQUFBLEVBQUEsQ0FBQSxDQUNBLEFBRUEsTUFBQSxDQUFBLGFBQUEsR0FBQSxDQUNBLFdBQUEsQ0FBQSxXQUFBLENBQ0EsU0FBQSxDQUFBLElBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFdBQUEsR0FBQSxDQUNBLFdBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsVUFBQSxDQUNBLE1BQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxHQUFBLElBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsTUFBQSxHQUFBLENBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFFBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLEtBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxJQUFBLFdBQUEsQ0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsS0FBQSxHQUFBLEtBQUEsQ0FBQSxBQUVBLElBQUEscUJBQUEsQ0FBQSxTQUFBLHFCQUFBLEVBQUEsQ0FDQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsT0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLElBQUEsV0FBQSxDQUFBLGVBQUEsS0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQUFFQSxJQUFBLHFCQUFBLENBQUEsU0FBQSxxQkFBQSxFQUFBLENBQ0EsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLE9BQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxJQUFBLFdBQUEsQ0FBQSxlQUFBLEtBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLEFBRUEsSUFBQSxxQkFBQSxDQUFBLFNBQUEscUJBQUEsRUFBQSxDQUNBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsSUFBQSxXQUFBLENBQUEsZUFBQSxLQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsVUFBQSxDQUNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUNBLE9BQUEsT0FBQSxFQUFBLENBQUEsQ0FDQTtLQUVBLEdBQUEscUJBQUEsRUFBQSxJQUFBLHFCQUFBLEVBQUEsSUFBQSxxQkFBQSxFQUFBLENBQUEsQ0FDQSxPQUFBLGNBQUEsQ0FBQSxlQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxDQUNBLE9BQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxRQUFBLENBQUEsZUFBQSxHQUFBLEdBQUEsQ0FBQSxBQUNBLE9BQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxRQUFBLENBQUEsZUFBQSxHQUFBLEdBQUEsQ0FBQSxBQUNBLE9BQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxRQUFBLENBQUEsZUFBQSxHQUFBLEdBQUEsQ0FBQSxBQUNBLE9BQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsSUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxTQUNBLENBQUEsU0FBQSxLQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0E7S0FFQSxHQUFBLHFCQUFBLEVBQUEsQ0FBQSxDQUNBLE9BQUEsY0FBQSxDQUFBLGdCQUFBLENBQUEsV0FBQSxDQUFBLGVBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLENBQ0EsT0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsR0FBQSxDQUFBLEFBQ0EsT0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxDQUNBLE1BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsU0FDQSxDQUFBLFNBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxLQUFBLENBQUEsQ0FDQSxLQUFBLENBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBO0tBRUEsR0FBQSxxQkFBQSxFQUFBLENBQUEsQ0FDQSxPQUFBLGNBQUEsQ0FBQSxnQkFBQSxDQUFBLFdBQUEsQ0FBQSxlQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsVUFBQSxDQUNBLE9BQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxRQUFBLENBQUEsZUFBQSxHQUFBLEdBQUEsQ0FBQSxBQUNBLE9BQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsQ0FDQSxNQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLFNBQ0EsQ0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsS0FBQSxDQUFBLENBQ0EsS0FBQSxDQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQTtLQUVBLEdBQUEscUJBQUEsRUFBQSxDQUFBLENBQ0EsT0FBQSxjQUFBLENBQUEsZ0JBQUEsQ0FBQSxXQUFBLENBQUEsZUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsQ0FDQSxPQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxHQUFBLENBQUEsQUFDQSxPQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxTQUNBLENBQUEsU0FBQSxLQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0E7S0FFQTs7QUFHQSxPQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLElBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxFQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLFNBQ0EsQ0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsS0FBQSxDQUFBLENBQ0EsS0FBQSxDQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUE7Ozs7OztDQU9BLENBQ0EsQ0FBQSxBQUVBLElBQUEsT0FBQSxDQUFBLFNBQUEsT0FBQSxFQUFBLENBQ0EsSUFBQSxNQUFBLENBQUEsWUFBQSxFQUFBLENBQUEsQUFDQSxHQUFBLE1BQUEsSUFBQSxFQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxRQUFBLENBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEFBQ0EsY0FBQSxDQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxRQUFBLENBQUEsZUFBQSxHQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsQUFDQSxPQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsUUFBQSxDQUFBLGVBQUEsR0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLEFBQ0EsT0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFFBQUEsQ0FBQSxlQUFBLEdBQUEsR0FBQSxDQUFBLEdBQUEsQ0FBQSxBQUNBLE9BQUEsY0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxFQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLFNBQ0EsQ0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxLQUFBLENBQUEsQ0FDQSxLQUFBLENBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLEtBQ0EsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLEFBRUEsSUFBQSxZQUFBLENBQUEsU0FBQSxZQUFBLEVBQUEsQ0FDQSxJQUFBLGFBQUEsQ0FBQSxDQUFBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxBQUNBLElBQUEsYUFBQSxDQUFBLENBQUEsQ0FBQSxjQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQUFDQSxJQUFBLGFBQUEsQ0FBQSxDQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEFBQ0EsSUFBQSxhQUFBLENBQUEsQ0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxBQUNBLElBQUEsT0FBQSxDQUFBLEVBQUEsQ0FBQSxBQUNBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxTQUFBLElBQUEsU0FBQSxDQUFBLENBQ0EsT0FBQSxJQUFBLGdDQUFBLENBQUEsQ0FDQSxBQUNBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxRQUFBLElBQUEsU0FBQSxDQUFBLENBQ0EsT0FBQSxJQUFBLCtCQUFBLENBQUEsQ0FDQSxBQUNBLEdBQUEsQ0FBQSxhQUFBLElBQUEsQ0FBQSxhQUFBLElBQUEsQ0FBQSxhQUFBLElBQUEsQ0FBQSxhQUFBLENBQUEsQ0FDQSxPQUFBLElBQUEseUVBQUEsQ0FBQSxDQUNBLEtBQ0EsQ0FDQSxHQUFBLGFBQUEsQ0FBQSxDQUNBLEdBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxlQUFBLElBQUEsU0FBQSxJQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxJQUFBLFNBQUEsSUFBQSxNQUFBLENBQUEsUUFBQSxDQUFBLGVBQUEsSUFBQSxTQUFBLElBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxxQkFBQSxJQUFBLFNBQUEsQ0FBQSxDQUNBLE9BQUEsSUFBQSwwREFBQSxDQUFBLENBQ0EsQ0FDQSxBQUNBLEdBQUEsYUFBQSxDQUFBLENBQ0EsR0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLFlBQUEsSUFBQSxTQUFBLElBQUEsTUFBQSxDQUFBLGlCQUFBLElBQUEsTUFBQSxJQUFBLE1BQUEsQ0FBQSxlQUFBLElBQUEsU0FBQSxDQUFBLENBQ0EsT0FBQSxJQUFBLHdEQUFBLENBQUEsQ0FDQSxDQUNBLEFBQ0EsR0FBQSxhQUFBLENBQUEsQ0FDQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsV0FBQSxJQUFBLFNBQUEsQ0FBQSxDQUNBLE9BQUEsSUFBQSx1REFBQSxDQUFBLENBQ0EsQ0FDQSxBQUNBLEdBQUEsYUFBQSxDQUFBLENBQ0EsR0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLGVBQUEsSUFBQSxTQUFBLElBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLElBQUEsU0FBQSxJQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsWUFBQSxJQUFBLFNBQUEsSUFBQSxNQUFBLENBQUEsa0JBQUEsSUFBQSxTQUFBLENBQUEsQ0FDQSxPQUFBLElBQUEsdURBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FDQSxBQUNBLE9BQUEsT0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsU0FBQSxLQUFBLENBQUEsQ0FDQSxJQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxBQUNBLGNBQUEsQ0FBQSxVQUFBLENBQUEsTUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFVBQUEsQ0FDQSxNQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLFNBQ0EsQ0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsS0FBQSxDQUFBLENBQ0EsS0FBQSxDQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFFBQUEsR0FBQSxTQUFBLElBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsV0FBQSxHQUFBLElBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsT0FBQSxHQUFBLFVBQUEsQ0FDQSxNQUFBLENBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLGNBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsOENBR0EsTUFBQSxDQUFBLFdBQUEsR0FBQSxTQUFBLFNBQUEsQ0FBQSxDQUNBLGNBQUEsQ0FDQSxjQUFBLENBQUEsQ0FDQSxFQUFBLENBQUEsU0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsY0FBQSxDQUFBLFNBQ0EsQ0FBQSxXQUFBLENBQUEsQ0FBQSxBQUVBLFNBQUEsY0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsR0FBQSxDQUFBLENBQ0EsQUFDQSxTQUFBLFdBQUEsQ0FBQSxHQUFBLENBQUEsRUFFQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxXQUFBLEdBQUEsVUFBQSxDQUNBLEdBQUEsWUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxXQUFBLENBQUEsWUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGFBQUEsR0FBQSxTQUFBLElBQUEsQ0FBQSxDQUNBLElBQUEsT0FBQSxDQUFBLElBQUEsQ0FBQSxBQUNBLElBQUEsT0FBQSxDQUFBLG9JQUFBLENBQUEsQUFDQSxHQUFBLElBQUEsQ0FBQSxZQUFBLElBQUEsRUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxLQUFBLENBQUEsQ0FDQSxPQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsT0FBQSxJQUFBLG1DQUFBLENBQUEsQ0FDQSxBQUVBLEdBQUEsSUFBQSxDQUFBLFdBQUEsSUFBQSxFQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUNBLE9BQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxPQUFBLElBQUEsa0NBQUEsQ0FBQSxDQUNBLEFBRUEsR0FBQSxJQUFBLENBQUEsZUFBQSxJQUFBLEVBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQ0EsT0FBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE9BQUEsSUFBQSxpQ0FBQSxDQUFBLENBQ0EsQUFDQSxPQUFBLElBQUEsdUZBQUEsQ0FBQSxBQUVBLEdBQUEsT0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxnQkFBQSxDQUFBLElBQUEsQ0FBQSxlQUFBLENBQUEsd0JBQUEsQ0FBQSx3QkFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxLQUFBLENBQ0EsZ0JBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxHQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUNBLGdCQUFBLENBQUEsaUJBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQ0EsS0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FDQSxXQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxDQUNBLFdBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLEFBQ0EsT0FBQSxLQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsR0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FDQSxPQUFBLGdCQUFBLENBQUEsaUJBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQ0EsS0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FDQSxlQUFBLENBQUEsSUFBQSxDQUFBLGVBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxBQUNBLE9BQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE9BQUEsZ0JBQUEsQ0FBQSxvQkFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxlQUFBLENBQUEsSUFBQSxDQUFBLGVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsR0FBQSxJQUFBLENBQUEsZUFBQSxDQUFBLENBQ0EsRUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUNBLFNBQUEsQ0FBQSxrQ0FBQSxDQUNBLFdBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxLQUFBLENBQ0EsQ0FBQSxDQUFBLEFBRUEsSUFBQSxTQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxlQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLENBQUEsQ0FBQSxBQUNBLEVBQUEsQ0FBQSxNQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxDQUNBLEtBQUEsQ0FBQSxJQUFBLENBQUEsZUFBQSxDQUNBLFdBQUEsQ0FBQSxJQUFBLENBQUEscUJBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsY0FBQSxDQUFBLG1CQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLFNBQ0EsQ0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxBQUNBLE9BQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLEdBQUEsSUFBQSxDQUFBLGVBQUEsQ0FBQSxDQUNBLE9BQUEsZ0JBQUEsQ0FBQSxtQkFBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsQ0FDQSxLQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsS0FBQSxDQUNBLGFBQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FDQSxjQUFBLENBQUEsbUJBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsS0FBQSxDQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUE7QUFFQSxNQUFBLENBQUEsV0FBQSxHQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFlBQUEsR0FBQSxVQUFBLENBQ0EsR0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsSUFBQSxNQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxLQUFBLElBQUEsRUFBQSxDQUFBLENBQ0EsY0FBQSxDQUFBLGFBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxHQUFBLEdBQUEsQ0FDQSxDQUNBLGNBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxnQkFBQSxHQUFBLFVBQUEsQ0FDQSxHQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxJQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsSUFBQSxFQUFBLENBQUEsQ0FDQSxjQUFBLENBQUEsYUFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLEdBQUEsR0FBQSxDQUNBLENBQ0EsY0FBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsSUFBQSxHQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFlBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGdCQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQTtBQ3pjQSxHQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsY0FBQSxDQUFBLENBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLHdCQUFBLENBQ0EsV0FBQSxDQUFBLHlDQUFBLENBQ0EsVUFBQSxDQUFBLHVCQUFBLENBQ0EsT0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLGdCQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsY0FBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUEsQUFDQSxPQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsQ0FDQSxBQUNBLE9BQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxzQkFBQSxHQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsT0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLDJCQUFBLENBQUEsQ0FBQSxBQUNBLE9BQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSx1QkFBQSxDQUFBLFNBQUEsVUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLGNBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLE9BQUEsQ0FBQSxZQUFBLENBQUEsVUFBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLENBQ0EsQUFDQSxNQUFBLENBQUEsSUFBQSxHQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxjQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsVUFBQSxDQUFBLGtCQUFBLEdBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxjQUFBLENBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFlBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLEVBQUEsQ0FBQSxDQUNBLEVBQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLE1BQUEsR0FBQSxNQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsT0FBQSxHQUFBLEtBQUEsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsQ0FBQSxDQUFBLEFBRUEsTUFBQSxDQUFBLGNBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxZQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGdCQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFlBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsYUFBQSxHQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxTQUFBLEdBQUEsRUFBQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFdBQUEsR0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxZQUFBLEdBQUEsTUFBQSxDQUFBLGdCQUFBLENBQUEsYUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFNBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxlQUFBLEdBQUEsU0FBQSxLQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsWUFBQSxHQUFBLE1BQUEsQ0FBQSxZQUFBLENBQUEsYUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGVBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSwwQkFBQSxHQUFBLFVBQUEsQ0FDQSxJQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEFBQ0EsR0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxFQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsR0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsR0FBQSxTQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsUUFBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxNQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsU0FBQSxHQUFBLE1BQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxTQUNBLENBQUEsU0FBQSxRQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxhQUFBLEdBQUEsVUFBQSxDQUNBLElBQUEsV0FBQSxDQUFBLDhqQkFBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxXQUFBLENBQUEsQ0FDQSxLQUFBLENBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxHQUFBLENBQUEsdUJBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsY0FBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsSUFBQSxHQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLHFCQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsQ0FBQSxDQUFBLEFBRUEsTUFBQSxDQUFBLE9BQUEsR0FBQSxVQUFBLENBQ0EsR0FBQSxNQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLE9BQUEsR0FBQSxVQUFBLENBQ0EsR0FBQSxNQUFBLENBQUEsT0FBQSxHQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFdBQUEsR0FBQSxTQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLElBQUEsRUFBQSxDQUFBLEFBQ0EsR0FBQSxLQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsS0FBQSxDQUFBLFFBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQSxPQUFBLEFBQ0EsTUFBQSxDQUFBLFdBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxJQUFBLE1BQUEsQ0FBQSxFQUFBLENBQUEsQUFDQSxJQUFBLFdBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLElBQUEsQ0FBQSxDQUNBLE9BQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLElBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxZQUFBLEdBQUEsU0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGdCQUFBLEdBQUEsU0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFNBQUEsR0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUE7Ozs7OztBQU9BLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLElBQUEsT0FBQSxDQUFBLENBQ0EsSUFBQSxPQUFBLENBQUEsSUFBQSxJQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQUFDQSxPQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFNBQUEsR0FBQSxDQUNBLE1BQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLENBQ0EsR0FBQSxDQUFBLE9BQUEsQ0FDQSxJQUFBLENBQUEsT0FBQSxDQUNBLENBQUEsQUFDQSxNQUFBLENBQUEsU0FBQSxDQUFBLFlBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxJQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsSUFBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsU0FBQSxDQUFBLFlBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFNBQUEsQ0FBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxZQUFBLEdBQUEsSUFBQSxJQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxZQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxRQUFBLENBQUEsQUFDQSxFQUFBLENBQUEsTUFBQSxDQUFBLG9DQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLENBQUEsQ0FDQSxPQUFBLENBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUEsQ0FDQSxTQUFBLENBQUEsS0FBQSxDQUNBLFNBQUEsQ0FBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFFBQUEsR0FBQSxLQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsZUFBQSxHQUFBLFVBQUEsQ0FDQSxNQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsU0FBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsWUFBQSxHQUFBLElBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsQ0FDQSxHQUFBLE1BQUEsQ0FBQSxZQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsWUFBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsYUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxTQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQUFDQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxJQUFBLFVBQUEsQ0FBQSxDQUNBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxJQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxTQUFBLENBQUEsT0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsU0FBQSxDQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxBQUNBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLEFBQ0EsRUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsWUFBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLFFBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBLENBQ0EsU0FBQSxDQUFBLEtBQUEsQ0FDQSxTQUFBLENBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxBQUNBLFFBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsR0FBQSxTQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsWUFBQSxDQUFBLG1DQUFBLENBQUEsQ0FBQSxDQUNBLENBQ0EsS0FBQSxDQUNBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsWUFBQSxDQUFBLG9GQUFBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLDJLQUFBLENBQUEsQ0FBQSxBQUNBLFFBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsR0FBQSxRQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsUUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFdBQUEsR0FBQSxVQUFBLENBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLEtBQUEsVUFBQSxDQUFBLDJCQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxPQUFBLE1BQUEsQ0FBQSxhQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsV0FBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsd0JBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLElBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsSUFBQSxDQUFBLENBQ0EsT0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFDQSxXQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsQ0FDQSxJQUFBLENBQUEsT0FBQSxDQUNBLENBQUEsQUFDQSxJQUFBLE1BQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxXQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLGdCQUFBLEdBQUEsU0FBQSxLQUFBLENBQUEsQ0FDQSxLQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxBQUNBLElBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsSUFBQSxDQUFBLENBQ0EsT0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsSUFBQSxLQUFBLENBQUEsR0FBQSxDQUFBLGtCQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUNBLFdBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsY0FBQSxHQUFBLFVBQUEsQ0FDQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxTQUFBLENBQUEsWUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLE9BQUEsRUFBQSxHQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLElBQUEsQ0FBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLE1BQUEsQ0FBQSxTQUFBLENBQUEsWUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLG1CQUFBLEdBQUEsVUFBQSxDQUNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLEtBQUEsQ0FBQSxBQUNBLElBQUEsV0FBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsS0FBQSxDQUFBLENBQ0EsS0FBQSxDQUFBLEdBQUEsR0FBQSxJQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQUFDQSxLQUFBLENBQUEsWUFBQSxHQUFBLElBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQSxBQUNBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsT0FBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxLQUFBLENBQUEsQUFDQSxPQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsT0FBQSxJQUFBLEtBQUEsQ0FBQSxPQUFBLElBQUEsS0FBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLEVBQUEsR0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLEdBQUEsQ0FBQSxPQUFBLEVBQUEsR0FBQSxFQUFBLEdBQUEsT0FBQSxJQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxFQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxFQUFBLEdBQUEsRUFBQSxHQUFBLE9BQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUNBLE9BQUEsV0FBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLENBQ0EsR0FBQSxNQUFBLENBQUEsU0FBQSxJQUFBLFVBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsdUZBQUEsQ0FBQSxDQUFBLEFBQ0EsT0FBQSxDQUNBLEtBQUEsR0FBQSxNQUFBLENBQUEsYUFBQSxJQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsMkRBQUEsQ0FBQSxDQUFBLEFBQ0EsT0FBQSxDQUNBLEtBQUEsR0FBQSxNQUFBLENBQUEsbUJBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxvTEFBQSxDQUFBLENBQUEsQUFDQSxPQUFBLENBQ0EsQUFDQSxHQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLElBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLElBQUEsT0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxtQkFBQSxDQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxHQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLEdBQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLDBCQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLElBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsMEJBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FDQSxBQUNBLEdBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxhQUFBLEdBQUEsQ0FBQSxDQUFBLEFBQ0EsT0FBQSxNQUFBLENBQUEsYUFBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxTQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGFBQUEsR0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxzQkFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQUFDQSxNQUFBLENBQUEsU0FBQSxHQUFBLFVBQUEsQ0FDQSxJQUFBLFdBQUEsQ0FBQSw0QkFBQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsS0FBQSxHQUFBLDBDQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLEdBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLFFBQUEsR0FBQSxNQUFBLEdBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxHQUFBLGdCQUFBLEdBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLEFBQ0EsUUFBQSxDQUFBLElBQUEsR0FBQSxTQUFBLENBQUEsV0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFNBQUEsR0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLFNBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsU0FBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxhQUFBLEdBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFdBQUEsR0FBQSxLQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLGVBQUEsR0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsUUFBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsY0FBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLE9BQUEsR0FBQSxVQUFBLENBQ0EsR0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLE9BQUEsQUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFlBQUEsR0FBQSxTQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsWUFBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsU0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxDQUNBLEdBQUEsTUFBQSxDQUFBLFlBQUEsSUFBQSxFQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsWUFBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLElBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSwyS0FBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxNQUFBLEdBQUEsU0FBQSxLQUFBLENBQUEsQ0FDQSxHQUFBLEtBQUEsSUFBQSxDQUFBLENBQUEsT0FBQSxBQUNBLElBQUEsQ0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxRQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxjQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsUUFBQSxHQUFBLFNBQUEsS0FBQSxDQUFBLENBQ0EsR0FBQSxLQUFBLElBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsQ0FBQSxPQUFBLEFBQ0EsSUFBQSxDQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxjQUFBLEdBQUEsU0FBQSxLQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsY0FBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLE1BQUEsQ0FBQSxDQUNBLEVBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxHQUFBLE1BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxjQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBQ0EsR0FBQSxNQUFBLENBQUEsSUFBQSxJQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLGNBQUEsRUFBQSxDQUFBLENBQ0EsQUFFQSxNQUFBLENBQUEsaUJBQUEsR0FBQSxTQUFBLElBQUEsQ0FBQSxDQUNBLElBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxBQUNBLEdBQUEsTUFBQSxDQUFBLEtBQUEsR0FBQSxLQUFBLENBQUEsQ0FDQSxPQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsQ0FBQSxTQUFBLENBQUEsV0FBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsUUFBQSxDQUFBLENBQUEsQ0FDQSxBQUNBLE9BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsY0FBQSxHQUFBLFNBQUEsS0FBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLEtBQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxBQUNBLEtBQUEsQ0FBQSxZQUFBLEdBQUEsSUFBQSxJQUFBLENBQUEsS0FBQSxDQUFBLFlBQUEsQ0FBQSxDQUFBLEFBQ0EsT0FBQSxLQUFBLENBQUEsWUFBQSxHQUFBLElBQUEsSUFBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFFBQUEsR0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLEdBQUEsS0FBQSxDQUFBLElBQUEsSUFBQSxPQUFBLENBQUEsQ0FDQSxPQUFBLEVBQUEsQ0FBQSxDQUNBLEtBQUEsR0FBQSxLQUFBLENBQUEsSUFBQSxJQUFBLE9BQUEsSUFBQSxLQUFBLENBQUEsSUFBQSxJQUFBLE9BQUEsQ0FBQSxDQUNBLE9BQUEsQ0FDQSxrQkFBQSxDQUFBLFNBQUEsQ0FDQSxDQUFBLENBQ0EsS0FBQSxHQUFBLEtBQUEsQ0FBQSxJQUFBLElBQUEsUUFBQSxDQUFBLENBQ0EsT0FBQSxDQUNBLGtCQUFBLENBQUEsU0FBQSxDQUNBLENBQUEsQ0FDQSxLQUFBLEdBQUEsS0FBQSxDQUFBLElBQUEsSUFBQSxNQUFBLENBQUEsQ0FDQSxPQUFBLENBQ0Esa0JBQUEsQ0FBQSxTQUFBLENBQ0EsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxhQUFBLEdBQUEsVUFBQSxDQUNBLE9BQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxzQkFBQSxHQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxVQUFBLENBQUEsRUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsSUFBQSxNQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxFQUFBLENBQUEsQ0FDQSxFQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxNQUFBLEdBQUEsTUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxjQUFBLEdBQUEsU0FBQSxNQUFBLENBQUEsQ0FDQSxJQUFBLFFBQUEsQ0FBQSxFQUFBLENBQUEsQUFDQSxJQUFBLEtBQUEsQ0FBQSxJQUFBLElBQUEsRUFBQSxDQUFBLEFBQ0EsSUFBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsRUFBQSxDQUNBLElBQUEsTUFBQSxDQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxHQUFBLEdBQUEsSUFBQSxJQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEVBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxBQUNBLElBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxFQUFBLENBQUEsQ0FDQSxPQUFBLEVBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxJQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBQ0EsSUFBQSxVQUFBLENBQUEsRUFBQSxDQUFBLEFBQ0EsSUFBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxHQUFBLEVBQUEsQ0FBQSxDQUFBLEVBQUEsRUFBQSxDQUNBLFVBQUEsQ0FBQSxDQUFBLENBQUEsR0FBQSxDQUNBLElBQUEsQ0FBQSxPQUFBLENBQ0EsQ0FBQSxDQUNBLEFBQ0EsU0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLEVBQUEsQ0FBQSxDQUNBLFVBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsRUFBQSxDQUFBLEdBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLENBQUEsQUFDQSxRQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQ0EsQUFDQSxPQUFBLFFBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsUUFBQSxHQUFBLE1BQUEsQ0FBQSxjQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsV0FBQSxHQUFBLFNBQUEsS0FBQSxDQUFBLENBQ0EsSUFBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEFBQ0EsSUFBQSxPQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxzREFBQSxDQUFBLENBQUEsQUFDQSxHQUFBLE9BQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxBQUNBLE9BQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSx1QkFBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxjQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLE9BQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGNBQUEsR0FBQSxLQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLFVBQUEsQ0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLGNBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsY0FBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLFVBQUEsQ0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLGNBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsY0FBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLGNBQUEsR0FBQSxVQUFBLENBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLGNBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGFBQUEsR0FBQSxVQUFBLENBQ0EsR0FBQSxTQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsSUFBQSxTQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUNBLElBQUEsUUFBQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxBQUNBLElBQUEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLEFBQ0EsSUFBQSxPQUFBLENBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEFBQ0EsR0FBQSxRQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSwwS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLGNBQUEsQ0FDQSxTQUFBLENBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxJQUFBLENBQ0EsQ0FBQSxDQUNBLFNBQUEsQ0FBQSxrQkFBQSxDQUNBLE9BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxHQUFBLDRDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FDQSxNQUFBLENBQUEsY0FBQSxFQUFBLENBQUEsQ0FDQSxDQUNBLEtBQUEsQ0FDQSxNQUFBLENBQUEsY0FBQSxFQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQUFDQSxNQUFBLENBQUEsYUFBQSxFQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUN0ZkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLGNBQUEsQ0FBQSxDQUNBLGNBQUEsQ0FDQSxLQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLFFBQUEsQ0FDQSxNQUFBLENBQUEsQ0FDQSxVQUFBLENBQUEsSUFBQSxDQUNBLENBQ0EsV0FBQSxDQUFBLDBCQUFBLENBQ0EsVUFBQSxDQUFBLGdCQUFBLENBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsU0FBQSxDQUNBLFdBQUEsQ0FBQSwyQkFBQSxDQUNBLFVBQUEsQ0FBQSxnQkFBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsZ0JBQUEsQ0FBQSxTQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLENBQUEsY0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLE9BQUEsR0FBQSxDQUNBLEdBQUEsQ0FBQSxFQUFBLENBQ0EsT0FBQSxDQUFBLEtBQUEsQ0FDQSxDQUFBLEFBQ0EsR0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsRUFBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBLENBQ0EsQUFDQSxNQUFBLENBQUEsU0FBQSxHQUFBLENBQ0EsYUFBQSxDQUFBLHdCQUFBLENBQ0EsTUFBQSxDQUFBLGFBQUEsR0FBQSxTQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsU0FBQSxDQUFBLElBQUEsQ0FDQSxXQUFBLENBQUEscUJBQUEsQ0FDQSxVQUFBLENBQUEsZ0JBQUEsQ0FDQSxLQUFBLENBQUEsTUFBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsVUFBQSxDQUNBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsQ0FDQSxHQUFBLENBQUEsRUFBQSxDQUNBLE9BQUEsQ0FBQSxLQUFBLENBQ0EsQ0FBQSxBQUNBLFdBQUEsQ0FDQSxLQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxtQkFBQSxDQUFBLFNBQ0EsQ0FBQSxnQkFBQSxDQUFBLENBQUEsQUFFQSxTQUFBLG1CQUFBLENBQUEsR0FBQSxDQUFBLENBQ0EsR0FBQSxHQUFBLENBQUEsTUFBQSxLQUFBLEdBQUEsSUFBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLGNBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxFQUFBLENBQUEsY0FBQSxDQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsTUFBQSxDQUFBLE9BQUEsR0FBQSxDQUNBLEdBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FDQSxPQUFBLENBQUEsSUFBQSxDQUNBLENBQUEsQ0FDQSxDQUNBLEFBRUEsU0FBQSxnQkFBQSxDQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsQ0FDQSxHQUFBLENBQUEsa0NBQUEsQ0FDQSxPQUFBLENBQUEsSUFBQSxDQUNBLENBQUEsQ0FDQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsZUFBQSxHQUFBLFNBQUEsUUFBQSxDQUFBLENBQ0EsV0FBQSxDQUNBLGVBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsbUJBQUEsQ0FBQSxTQUNBLENBQUEsZ0JBQUEsQ0FBQSxDQUFBLEFBRUEsU0FBQSxtQkFBQSxDQUFBLEdBQUEsQ0FBQSxDQUNBLEdBQUEsR0FBQSxDQUFBLE1BQUEsS0FBQSxHQUFBLElBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsQ0FDQSxjQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsRUFBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsK0JBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxBQUVBLFNBQUEsZ0JBQUEsQ0FBQSxHQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLGtDQUFBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxpQkFBQSxHQUFBLFVBQUEsQ0FDQSxHQUFBLFlBQUEsQ0FBQSxVQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsZUFBQSxFQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQUFDQSxNQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsQ0FDQSxNQUFBLENBQUEsT0FBQSxHQUFBLENBQ0EsR0FBQSxDQUFBLEVBQUEsQ0FDQSxPQUFBLENBQUEsS0FBQSxDQUNBLENBQUEsQUFDQSxHQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsUUFBQSxJQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsZUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLE9BQUEsR0FBQSxDQUNBLEdBQUEsQ0FBQSwrQ0FBQSxDQUNBLE9BQUEsQ0FBQSxJQUFBLENBQ0EsQ0FBQSxBQUNBLE9BQUEsQ0FDQSxBQUNBLFdBQUEsQ0FDQSxNQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxvQkFBQSxDQUFBLFNBQ0EsQ0FBQSxpQkFBQSxDQUFBLENBQUEsQUFFQSxTQUFBLG9CQUFBLENBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUNBLEFBRUEsU0FBQSxpQkFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsRUFBQSxDQUFBLE9BQUEsRUFBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLFVBQUEsQ0FBQSxXQUFBLEdBQUEsR0FBQSxDQUFBLFdBQUEsQ0FBQSxBQUNBLE9BQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSw0QkFBQSxDQUFBLENBQ0EsS0FBQSxDQUFBLEdBQUEsQ0FBQSxXQUFBLENBQ0EsUUFBQSxDQUFBLE1BQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxjQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQUFDQSxHQUFBLFlBQUEsQ0FBQSxVQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsRUFBQSxDQUFBLCtCQUFBLENBQUEsQ0FDQSxZQUFBLENBQUEsWUFBQSxDQUFBLFVBQUEsQ0FDQSxDQUFBLENBQUEsQUFDQSxPQUFBLENBQ0EsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLEdBQUEsT0FBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxDQUFBLElBQUEsU0FBQSxDQUFBLENBQ0EsR0FBQSxPQUFBLENBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLENBQUEsSUFBQSxvQkFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxPQUFBLENBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxLQUFBLEdBQUEsT0FBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxDQUFBLElBQUEsZ0NBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsQ0FDQSxTQUFBLENBQUEsT0FBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLE1BQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsQ0FBQSxDQUNBLENBQ0EsS0FBQSxDQUNBLE1BQUEsQ0FBQSxFQUFBLENBQUEsY0FBQSxDQUFBLENBQUEsQ0FDQSxDQUVBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSx5QkFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUM3SkEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxLQUFBLENBQUEsQ0FFQSxTQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQ0EsQUFFQSxTQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQ0EsQUFFQSxTQUFBLGVBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsNEJBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUNBLEFBRUEsT0FBQSxDQUNBLEtBQUEsQ0FBQSxLQUFBLENBQ0EsTUFBQSxDQUFBLE1BQUEsQ0FDQSxlQUFBLENBQUEsZUFBQSxDQUNBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FBQSxBQ25CQSxHQUFBLENBQUEsT0FBQSxDQUFBLGdCQUFBLENBQUEsU0FBQSxRQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUVBLFNBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxZQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxBQUVBLFNBQUEsVUFBQSxFQUFBLENBQ0EsT0FBQSxDQUFBLFlBQUEsQ0FBQSxVQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FDQSxBQUVBLFNBQUEsT0FBQSxFQUFBLENBQ0EsR0FBQSxDQUNBLElBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLFlBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FBQSxBQUNBLEdBQUEsSUFBQSxDQUFBLENBQ0EsT0FBQSxJQUFBLENBQUEsQ0FDQSxDQUNBLE1BQUEsQ0FBQSxFQUFBLEVBQUEsQ0FDQSxBQUVBLFNBQUEsV0FBQSxFQUFBLENBQ0EsSUFBQSxPQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQUFDQSxHQUFBLE9BQUEsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxHQUFBLENBQUEsa0JBQUEsR0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQUFFQSxPQUFBLENBQ0EsTUFBQSxDQUFBLE1BQUEsQ0FDQSxVQUFBLENBQUEsVUFBQSxDQUNBLE9BQUEsQ0FBQSxPQUFBLENBQ0EsV0FBQSxDQUFBLFdBQUEsQ0FDQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFDbkNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxjQUFBLENBQUEsQ0FDQSxjQUFBLENBQ0EsS0FBQSxDQUFBLGVBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxlQUFBLENBQ0EsV0FBQSxDQUFBLHlDQUFBLENBQ0EsVUFBQSxDQUFBLHdCQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSx3QkFBQSxDQUFBLFNBQUEsVUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsQ0FBQSxjQUFBLENBQUEsSUFBQSxDQUFBLGdCQUFBLENBQUEsU0FBQSxDQUFBLENBQ0EsSUFBQSxNQUFBLENBQUEsU0FBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFFBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLENBQ0Esa0JBQUEsQ0FDQSxTQUFBLENBQ0EsVUFBQSxDQUNBLE9BQUEsQ0FDQSxXQUFBLENBQ0EsU0FBQSxDQUNBLGFBQUEsQ0FDQSxXQUFBLENBQ0EsWUFBQSxDQUNBLE9BQUEsQ0FDQSxhQUFBLENBQ0EsU0FBQSxDQUNBLFlBQUEsQ0FDQSxVQUFBLENBQ0EsTUFBQSxDQUNBLGFBQUEsQ0FDQSxPQUFBLENBQ0EsbUJBQUEsQ0FDQSxPQUFBLENBQ0EsTUFBQSxDQUNBLDZCQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxDQUNBLEdBQUEsTUFBQSxDQUFBLEdBQUEsSUFBQSxFQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxJQUFBLENBQUEseUJBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsR0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxJQUFBLE9BQUEsQ0FBQSxNQUFBLElBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLENBQUEsUUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsUUFBQSxDQUFBLEFBQ0EsRUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxRQUFBLENBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUNBLFNBQUEsQ0FBQSxLQUFBLENBQ0EsU0FBQSxDQUFBLEdBQUEsQ0FDQSxDQUFBLENBQUEsQUFDQSxRQUFBLENBQUEsY0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLEdBQUEsU0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsR0FBQSxHQUFBLENBQUEsTUFBQSxJQUFBLEdBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsMktBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFFBQUEsR0FBQSxJQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxBQUNBLEVBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxPQUFBLENBQUEsUUFBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUEsQ0FDQSxTQUFBLENBQUEsS0FBQSxDQUNBLFNBQUEsQ0FBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQUFDQSxNQUFBLENBQUEsVUFBQSxDQUFBLE9BQUEsR0FBQSxJQUFBLENBQUEsQUFFQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLFFBQUEsQ0FBQSxjQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsR0FBQSxRQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsQ0FDQSxHQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxLQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsMkJBQUEsQ0FBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsS0FBQSxDQUFBLElBQUEsQ0FBQSxrQkFBQSxDQUFBLENBQ0EsS0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsS0FBQSxDQUNBLE9BQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLE9BQUEsQ0FDQSxJQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxJQUFBLENBQ0EsS0FBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLENBQUEsS0FBQSxDQUNBLFFBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLFFBQUEsQ0FDQSxVQUFBLENBQUEsRUFBQSxDQUNBLFVBQUEsQ0FBQSxFQUFBLENBQ0EsTUFBQSxDQUFBLE1BQUEsQ0FDQSxLQUFBLENBQUEsTUFBQSxDQUFBLFVBQUEsQ0FBQSxLQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEseURBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsUUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsUUFBQSxDQUFBLGNBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxHQUFBLFFBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxHQUFBLEdBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsK0JBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLG9CQUFBLEdBQUEsVUFDQSxDQUNBLElBQUEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxNQUFBLENBQUEsQUFDQSxnQkFBQSxDQUFBLHFCQUFBLENBQUEsR0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsUUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLGlCQUFBLEdBQUEsUUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQ25IQSxHQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsY0FBQSxDQUFBLENBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxxQkFBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLDRCQUFBLENBQ0EsV0FBQSxDQUFBLHVEQUFBLENBQ0EsVUFBQSxDQUFBLCtCQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSwrQkFBQSxDQUFBLFNBQUEsVUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsQ0FBQSxjQUFBLENBQUEsSUFBQSxDQUFBLGdCQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUNBLEFBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsQ0FDQSxrQkFBQSxDQUNBLFNBQUEsQ0FDQSxVQUFBLENBQ0EsT0FBQSxDQUNBLFdBQUEsQ0FDQSxTQUFBLENBQ0EsYUFBQSxDQUNBLFdBQUEsQ0FDQSxZQUFBLENBQ0EsT0FBQSxDQUNBLGFBQUEsQ0FDQSxTQUFBLENBQ0EsWUFBQSxDQUNBLFVBQUEsQ0FDQSxNQUFBLENBQ0EsYUFBQSxDQUNBLE9BQUEsQ0FDQSxtQkFBQSxDQUNBLE9BQUEsQ0FDQSxNQUFBLENBQ0EsNkJBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFlBQUEsR0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUE7OztBQUlBLE1BQUEsQ0FBQSxRQUFBLENBQUEsTUFBQSxHQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLEFBQ0EsSUFBQSxjQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxRQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsR0FBQSxjQUFBLENBQUEsQUFDQSxnQkFBQSxDQUFBLFlBQUEsQ0FBQSxNQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsUUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsWUFBQSxDQUFBLG9CQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsU0FBQSxDQUFBLFNBQUEsS0FBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUE7Q0FFQSxDQUFBLEFBRUEsTUFBQSxDQUFBLG9CQUFBLEdBQUEsVUFDQSxDQUNBLGdCQUFBLENBQUEscUJBQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLFFBQUEsQ0FBQSxDQUNBLEdBQUEsUUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFFBQUEsR0FBQSxRQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsaUJBQUEsR0FBQSxRQUFBLENBQUEsQ0FDQSxLQUNBLENBQ0EsTUFBQSxDQUFBLFFBQUEsR0FBQSxDQUNBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSwwQkFBQSxDQUNBLEtBQUEsQ0FBQSxDQUNBLFFBQUEsQ0FBQSxFQUFBLENBQ0EsU0FBQSxDQUFBLE1BQUEsQ0FDQSxVQUFBLENBQUEsTUFBQSxDQUNBLENBQ0EsQ0FDQSxVQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsdWNBQUEsQ0FDQSxLQUFBLENBQUEsQ0FDQSxRQUFBLENBQUEsRUFBQSxDQUNBLFNBQUEsQ0FBQSxTQUFBLENBQ0EsVUFBQSxDQUFBLFFBQUEsQ0FDQSxDQUNBLENBQ0EsV0FBQSxDQUFBLENBQ0EsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLENBQUEsQ0FDQSxZQUFBLENBQUEsQ0FBQSxDQUNBLFdBQUEsQ0FBQSxTQUFBLENBQ0EsQ0FDQSxDQUNBLE1BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxPQUFBLENBQ0EsS0FBQSxDQUFBLENBQ0EsUUFBQSxDQUFBLEVBQUEsQ0FDQSxTQUFBLENBQUEsTUFBQSxDQUNBLE1BQUEsQ0FBQSxDQUFBLENBQ0EsWUFBQSxDQUFBLENBQUEsQ0FDQSxPQUFBLENBQUEsU0FBQSxDQUNBLENBQ0EsQ0FDQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFDdkdBLEdBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxjQUFBLENBQUEsQ0FDQSxjQUFBLENBQUEsS0FBQSxDQUFBLGVBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxnQ0FBQSxDQUNBLFdBQUEsQ0FBQSx3Q0FBQSxDQUNBLFVBQUEsQ0FBQSxzQkFBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUVBLEdBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxjQUFBLENBQUEsQ0FDQSxjQUFBLENBQUEsS0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsNkNBQUEsQ0FDQSxXQUFBLENBQUEsd0NBQUEsQ0FDQSxVQUFBLENBQUEsc0JBQUEsQ0FtQkEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLHNCQUFBLENBQUEsU0FBQSxVQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsWUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLEFBR0EsTUFBQSxDQUFBLGFBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxHQUFBLFlBQUEsQ0FBQSxVQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsYUFBQSxHQUFBLElBQUEsQ0FBQSxDQUNBO0FBR0EsTUFBQSxDQUFBLFFBQUEsR0FBQSxDQUNBLFFBQUEsQ0FBQSxLQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxXQUFBLEdBQUEsVUFBQSxDQUNBLEdBQUEsWUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsS0FBQSxDQUFBLEdBQUEsQ0FBQSxzQ0FBQSxHQUFBLFlBQUEsQ0FBQSxVQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxJQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxHQUFBLFFBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsUUFBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsRUFBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsOEJBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLE9BQUEsS0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBO0FBR0EsTUFBQSxDQUFBLElBQUEsR0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxLQUFBLENBQUEsSUFBQSxDQUFBLDJCQUFBLENBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsdUJBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsZ0NBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBOzs7Ozs7Ozs7Ozs7O0FBZ0JBLE1BQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxDQUNBLEtBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FDQSxNQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsQ0FDQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBRUEsQ0FBQSxDQUFBLEFDMUdBLEdBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxjQUFBLENBQUEsQ0FDQSxjQUFBLENBQUEsS0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsNEJBQUEsQ0FDQSxXQUFBLENBQUEsNENBQUEsQ0FDQSxVQUFBLENBQUEsMEJBQUEsQ0FDQSxPQUFBLENBQUEsQ0FDQSxTQUFBLENBQUEsbUJBQUEsS0FBQSxDQUFBLENBQ0EsT0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDBCQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxJQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEFBQ0EsR0FBQSxRQUFBLENBQUEsQ0FDQSxPQUFBLFFBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FDQSxPQUFBLENBQ0EsT0FBQSxDQUFBLGdCQUFBLENBQ0EsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLDhCQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLDBCQUFBLENBQUEsU0FBQSxVQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFNBQUEsR0FBQSxTQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBdUJBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsVUFBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsS0FBQSxDQUFBLElBQUEsQ0FBQSwwQkFBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsZ0NBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBOzs7Ozs7Ozs7Ozs7O0FBZ0JBLE1BQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxDQUNBLEtBQUEsQ0FBQSxHQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FDQSxNQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsR0FBQSxRQUFBLENBQUEsQ0FDQSxDQUFBLFNBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBRUEsQ0FBQSxDQUFBLEFDdkZBLEdBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxjQUFBLENBQUEsQ0FDQSxjQUFBLENBQUEsS0FBQSxDQUFBLGNBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxxQkFBQSxDQUNBLFdBQUEsQ0FBQSx5Q0FBQSxDQUNBLFVBQUEsQ0FBQSx1QkFBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUVBLEdBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxjQUFBLENBQUEsQ0FDQSxjQUFBLENBQUEsS0FBQSxDQUFBLGtCQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsMEJBQUEsQ0FDQSxXQUFBLENBQUEsOENBQUEsQ0FDQSxVQUFBLENBQUEsdUJBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFFQSxHQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsY0FBQSxDQUFBLENBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxrQkFBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLHFDQUFBLENBQ0EsV0FBQSxDQUFBLHlDQUFBLENBQ0EsVUFBQSxDQUFBLHVCQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBR0EsR0FBQSxDQUFBLFVBQUEsQ0FBQSx1QkFBQSxDQUFBLENBQUEsWUFBQSxDQUNBLFFBQUEsQ0FDQSxjQUFBLENBQ0EsUUFBQSxDQUNBLE9BQUEsQ0FDQSxXQUFBLENBQ0EsU0FBQSxDQUNBLFdBQUEsQ0FDQSxnQkFBQSxDQUNBLG9CQUFBLENBQ0EsU0FBQSxVQUFBLENBQUEsTUFBQSxDQUFBLFlBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxDQUFBLGNBQUEsQ0FBQSxrQkFBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxFQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQ0FDQSxxRUFFQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsQ0FDQSxHQUFBLENBQUEsRUFBQSxDQUNBLE9BQUEsQ0FBQSxLQUFBLENBQ0EsQ0FBQSxzQ0FJQSxNQUFBLENBQUEsS0FBQSxHQUFBLENBQ0EsY0FBQSxDQUFBLGFBQUEsQ0FDQSxVQUFBLENBQUEsbUJBQUEsQ0FDQSxlQUFBLENBQUEsOEJBQUEsQ0FDQSxPQUFBLENBQUEsRUFBQSxDQUNBLElBQUEsQ0FBQSxLQUFBLENBQ0EsT0FBQSxDQUFBLEtBQUEsQ0FDQSxNQUFBLENBQUEsS0FBQSxDQUNBLE9BQUEsQ0FBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLEVBQUEsQ0FDQSxNQUFBLENBQUEsOEJBQUEsQ0FDQSxRQUFBLENBQUEsRUFBQSxDQUNBLEVBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxhQUFBLENBQUEsS0FBQSxDQUNBLENBQUEsQ0FDQSxTQUFBLENBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxFQUFBLENBQ0EsTUFBQSxDQUFBLEVBQUEsQ0FDQSxLQUFBLENBQUEsRUFBQSxDQUNBLEVBQUEsQ0FBQSxFQUFBLENBQ0EsQ0FBQSxDQUNBLENBQUEsZ0NBSUEsTUFBQSxDQUFBLG1CQUFBLEdBQUEsRUFBQSxDQUFBLGdEQUlBLE1BQUEsQ0FBQSxhQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLEtBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsU0FBQSxHQUFBLENBQ0EsV0FBQSxDQUFBLHFCQUFBLGFBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxHQUFBLGFBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxhQUFBLEdBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLFNBQUEsQ0FBQSxJQUFBLENBQ0EsV0FBQSxDQUFBLGtCQUFBLENBQ0EsVUFBQSxDQUFBLHVCQUFBLENBQ0EsS0FBQSxDQUFBLE1BQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLFVBQUEsQ0FDQSxNQUFBLENBQUEsYUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxtQkFHQSxNQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQSxpREFJQSxTQUFBLG9CQUFBLEVBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxnQkFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsQ0FDQSxHQUFBLENBQUEsRUFBQSxDQUNBLE9BQUEsQ0FBQSxLQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsQ0FDQSxjQUFBLENBQUEsYUFBQSxDQUNBLFVBQUEsQ0FBQSxtQkFBQSxDQUNBLGVBQUEsQ0FBQSw4QkFBQSxDQUNBLE9BQUEsQ0FBQSxFQUFBLENBQ0EsSUFBQSxDQUFBLEtBQUEsQ0FDQSxPQUFBLENBQUEsS0FBQSxDQUNBLE1BQUEsQ0FBQSxLQUFBLENBQ0EsT0FBQSxDQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsRUFBQSxDQUNBLE1BQUEsQ0FBQSw4QkFBQSxDQUNBLFFBQUEsQ0FBQSxFQUFBLENBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxDQUNBLGFBQUEsQ0FBQSxLQUFBLENBQ0EsQ0FBQSxDQUNBLFNBQUEsQ0FBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLEVBQUEsQ0FDQSxNQUFBLENBQUEsRUFBQSxDQUNBLEtBQUEsQ0FBQSxFQUFBLENBQ0EsRUFBQSxDQUFBLEVBQUEsQ0FDQSxDQUFBLENBQ0EsQ0FBQSxBQUNBLE9BQUEsQ0FBQSxPQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUNBLDBEQUdBLE1BQUEsQ0FBQSxXQUFBLEdBQUEsVUFBQSxDQUNBLEdBQUEsWUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxrQkFBQSxDQUFBLFlBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQTs7Ozs7Q0FNQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsY0FBQSxHQUFBLFVBQUEsQ0FDQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxLQUFBLEVBQUEsQ0FBQSxLQVdBLDZCQUFBLENBQUEsU0FBQSw2QkFBQSxDQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBLGVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsZ0JBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLGFBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsY0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLE9BQUEsRUFBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxRQUFBLEdBQUEsZUFBQSxDQUFBLENBQUEsQ0FDQSxLQUVBLGlCQUFBLENBQUEsU0FBQSxpQkFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLFFBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxJQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxVQUFBLENBQUEsU0FBQSxDQUFBLFlBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLElBQUEsQ0FBQSxPQUFBLENBQ0EsS0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsZ0JBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLEtBRUEsV0FBQSxDQUFBLFNBQUEsV0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsNkJBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQ0FDQSxDQXZDQSxNQUFBLENBQUEsZ0JBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLGtCQUFBLENBQ0EsV0FBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsUUFBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsNkJBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxpQkFBQSxDQUFBLFNBQ0EsQ0FBQSxXQUFBLENBQUEsQ0FBQSxDQWdDQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsZUFBQSxHQUFBLFNBQUEsS0FBQSxDQUFBLENBQ0EsSUFBQSxNQUFBLENBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxrQkFBQSxDQUNBLFdBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLE1BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLFFBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxTQUNBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLG1CQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxXQUFBLEdBQUEsVUFBQSxDQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxFQUFBLENBQ0EsTUFBQSxDQUFBLEVBQUEsQ0FDQSxLQUFBLENBQUEsRUFBQSxDQUNBLEVBQUEsQ0FBQSxFQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxjQUFBLEdBQUEsU0FBQSxLQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxpQkFBQSxHQUFBLFNBQUEsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxrQkFBQSxDQUNBLFdBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLE1BQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEtBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLG9CQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUdBLE1BQUEsQ0FBQSxZQUFBLEdBQUEsU0FBQSxLQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxTQUFBLEdBQUEsVUFBQSxDQUNBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsQ0FBQSxDQUNBLE9BQUEsS0FBQSxDQUFBLENBQ0EsQUFFQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsRUFBQSxDQUNBLE1BQUEsQ0FBQSw4QkFBQSxDQUNBLFFBQUEsQ0FBQSxFQUFBLENBQ0EsRUFBQSxDQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsU0FBQSxHQUFBLFVBQUE7O0FBR0EsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLEVBQUEsQ0FDQSxLQUFBLENBQUEsRUFBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFDQSxNQUFBLENBQUEsWUFBQSxHQUFBLFNBQUEsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFDQSxNQUFBLENBQUEsWUFBQSxHQUFBLFNBQUEsS0FBQSxDQUFBLENBRUEsU0FBQSxXQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxRQUFBLENBQUEsUUFBQSxDQUFBLGFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxBQUNBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsR0FBQSxRQUFBLENBQUEsSUFBQSxJQUFBLEVBQUEsQ0FBQSxDQUNBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsUUFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLEFBQ0EsT0FBQSxRQUFBLENBQUEsQ0FDQSxBQUVBLElBQUEsUUFBQSxDQUFBLFdBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxBQUNBLElBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxRQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEFBQ0EsSUFBQSxRQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsSUFBQSxDQUFBLENBQ0EsT0FBQSxJQUFBLENBQUEsR0FBQSxLQUFBLElBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUNBLEdBQUEsUUFBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLENBQUEsQ0FDQSxPQUFBLEtBQUEsQ0FBQSxDQUNBLEFBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsR0FBQSxHQUFBLElBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsZ0JBQUEsR0FBQSxVQUFBLENBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxpQkFBQSxDQUFBLENBQUEsQUFDQSxPQUFBLEtBQUEsQ0FBQSxDQUNBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxJQUFBLE9BQUEsQ0FBQSxJQUFBLFFBQUEsRUFBQSxDQUFBLCtDQUtBLElBQUEsSUFBQSxJQUFBLElBQUEsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUNBLE9BQUEsQ0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUNBLGNBSUEsSUFBQSxPQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsSUFBQSxDQUFBLENBQ0EsT0FBQSxJQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLElBQUEsQ0FBQSxDQUNBLE9BQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBLEFBQ0EsT0FBQSxJQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFDQSxPQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsZ0JBSUEsSUFBQSxTQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsSUFBQSxDQUFBLENBQ0EsT0FBQSxJQUFBLENBQUEsRUFBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLElBQUEsQ0FBQSxDQUNBLE9BQUEsSUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBLEFBQ0EsT0FBQSxJQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFDQSxPQUFBLENBQUEsTUFBQSxDQUFBLFdBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUFBLENBQUEsY0FJQSxJQUFBLE9BQUEsQ0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFDQSxPQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQUEsaUNBSUEsSUFBQSxPQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsTUFBQSxDQUNBLEdBQUEsQ0FBQSwyQkFBQSxDQUNBLE9BQUEsQ0FBQSxDQUNBLGNBQUEsQ0FBQSxTQUFBLENBQ0EsQ0FDQSxnQkFBQSxDQUFBLE9BQUEsQ0FBQSxRQUFBLENBQ0EsSUFBQSxDQUFBLE9BQUEsQ0FDQSxDQUFBLEFBQ0EsS0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQTtBQUVBLE9BQUEsQ0FDQSxBQUNBLG9CQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxTQUFBLENBQUEsV0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsWUFBQSxDQUFBLDRCQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxNQUFBLEdBQUEsVUFBQSxDQUNBLEtBQUEsQ0FBQSxJQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FDQSxjQUFBLENBQUEsVUFBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxDQUNBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxDQUNBLGtCQUFBLENBQ0EsZUFBQSxFQUFBLENBQ0EsSUFBQSxDQUFBLGNBQUEsQ0FBQSxTQUNBLENBQUEsV0FBQSxDQUFBLENBQUEsQUFFQSxTQUFBLGNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsbUJBQUEsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsQUFFQSxTQUFBLFdBQUEsQ0FBQSxHQUFBLENBQUEsRUFFQSxDQUNBLENBQUEseURBSUEsTUFBQSxDQUFBLGtCQUFBLEdBQUEsU0FBQSxpQkFBQSxDQUFBO0FBRUEsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxrQkFBQSxDQUNBLGtCQUFBLENBQUEsQ0FDQSxFQUFBLENBQUEsaUJBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLGNBQUEsQ0FBQSxTQUNBLENBQUEsV0FBQSxDQUFBLENBQUEsQUFFQSxTQUFBLGNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FFQSxNQUFBLENBQUEsZ0JBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQUFFQSxJQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBLENBQUEsQUFDQSxJQUFBLFlBQUEsQ0FBQSxFQUFBLENBQUEsQUFFQSxJQUFBLElBQUEsSUFBQSxJQUFBLE9BQUEsRUFBQSxDQUNBLFlBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsSUFBQSxDQUNBLEtBQUEsQ0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQUFDQSxNQUFBLENBQUEsS0FBQSxDQUFBLE9BQUEsR0FBQSxZQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLEFBRUEsU0FBQSxXQUFBLENBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEscUJBQUEsR0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUVBLEdBQUEsT0FBQSxDQUFBLDBDQUFBLENBQUEsQ0FBQSxLQVVBLGNBQUEsQ0FBQSxTQUFBLGNBQUEsQ0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxtQkFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxLQUVBLFdBQUEsQ0FBQSxTQUFBLFdBQUEsQ0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLENBaEJBLElBQUEsaUJBQUEsQ0FBQSxNQUFBLENBQUEsbUJBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLGtCQUFBLENBQ0EscUJBQUEsQ0FBQSxDQUNBLEVBQUEsQ0FBQSxpQkFBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsY0FBQSxDQUFBLFNBQ0EsQ0FBQSxXQUFBLENBQUEsQ0FBQSxDQVVBLEtBQUEsQ0FDQSxPQUFBLEtBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUNBLENBRUEsQ0FBQSxDQUFBLEFDL2JBLEdBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxjQUFBLENBQUEsYUFBQSxDQUFBLGFBQUEsQ0FBQSxDQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLFdBQUEsQ0FDQSxXQUFBLENBQUEsZ0RBQUEsQ0FDQSxVQUFBLENBQUEseUJBQUEsQ0FDQSxDQUFBLENBQUEsQUFFQSxhQUFBLENBQUEsU0FBQSxDQUFBLENBQ0EsUUFBQSxDQUFBLGtDQUFBLENBQ0EsQ0FBQSxDQUFBO0FBR0EsYUFBQSxDQUFBLFNBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxXQUFBLENBQ0EsR0FBQSxDQUFBLDhCQUFBLENBQ0EscUJBQUEsQ0FBQSwyQ0FBQSxDQUNBLFdBQUEsQ0FBQSxpQ0FBQSxDQUNBLGlCQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsQ0FDQSxLQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsZUFBQSxDQUFBLGdCQUFBLENBQUEsZUFBQSxDQUFBLENBQ0EsY0FBQSxDQUFBLEdBQUEsQ0FDQSxJQUFBLENBQUEsS0FBQSxDQUNBLENBQUEsQ0FBQSxBQUVBLGFBQUEsQ0FBQSxPQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsNEJBQUEsQ0FDQSxxQkFBQSxDQUFBLDRDQUFBLENBQ0EsV0FBQSxDQUFBLHNDQUFBO0FBQ0EsSUFBQSxDQUFBLEtBQUEsQ0FDQSxZQUFBLENBQUEsQ0FDQSxLQUFBLENBQUEsR0FBQSxDQUNBLE1BQUEsQ0FBQSxHQUFBLENBQ0EsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFHQSxHQUFBLENBQUEsVUFBQSxDQUFBLHlCQUFBLENBQUEsQ0FBQSxZQUFBLENBQ0EsUUFBQSxDQUNBLFFBQUEsQ0FDQSxPQUFBLENBQ0EsV0FBQSxDQUNBLFNBQUEsQ0FDQSxJQUFBLENBQ0Esc0JBQUEsQ0FDQSxNQUFBLENBQ0EsT0FBQSxDQUNBLGdCQUFBLENBQ0EsU0FBQSxVQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsQ0FBQSxFQUFBLENBQUEsb0JBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLGNBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLHNEQUVBLElBQUEsU0FBQSxDQUFBLElBQUEsQ0FBQSw0QkFHQSxNQUFBLENBQUEsU0FBQSxHQUFBLENBQ0EsU0FBQSxDQUFBLHNCQUFBLENBQ0EsUUFBQSxDQUFBLGFBQUEsQ0FDQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLE1BQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLFVBQUEsQ0FDQSxNQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxBQUNBLEdBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUNBLFNBQUEsQ0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FDQSxTQUFBLENBQUEsSUFBQSxFQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLG1CQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFNBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsaUJBQUEsR0FBQSw4QkFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFlBQUEsR0FBQSxFQUFBLENBQUEsQUFFQSxNQUFBLENBQUEsZ0JBQUEsR0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxJQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLE1BQUEsQ0FBQSxTQUFBLEdBQUEscUNBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxtQkFBQSxHQUFBLElBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSw2QkFHQSxNQUFBLENBQUEscUJBQUEsR0FBQSxVQUFBLENBQ0EsS0FBQSxDQUFBLFlBQUEsQ0FBQSxXQUFBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLFFBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLG1CQUFBLENBQUEsQUFDQSxLQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsTUFBQSxDQUNBLEdBQUEsQ0FBQSxxQ0FBQSxDQUNBLElBQUEsQ0FBQSxDQUNBLGNBQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxDQUNBLEdBQUEsQ0FBQSxRQUFBLENBQ0EsQ0FDQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsSUFBQSxDQUFBLENBQ0EsR0FBQSxJQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxnQkFBQSxFQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsMkJBR0EsTUFBQSxDQUFBLG1CQUFBLEdBQUEsVUFBQSxDQUNBLEtBQUEsQ0FBQSxZQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsUUFBQSxDQUFBLENBQ0EsSUFBQSxRQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxtQkFBQSxDQUFBLEFBQ0EsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLGNBQUEsSUFBQSxlQUFBLENBQUEsQ0FDQSxLQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsTUFBQSxDQUNBLEdBQUEsQ0FBQSw4QkFBQSxDQUNBLElBQUEsQ0FBQSxDQUNBLFdBQUEsQ0FBQSxRQUFBLENBQ0EsV0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQ0EsQ0FDQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsT0FBQSxDQUFBLENBQ0EsR0FBQSxPQUFBLENBQUEsSUFBQSxJQUFBLE9BQUEsQ0FBQSxVQUFBLEtBQUEsSUFBQSxDQUFBLENBQ0EsR0FBQSxPQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsS0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLG1CQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsUUFBQSxDQUFBLE9BQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxLQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxvREFBQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQ0FBQSxDQUNBLEtBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLGNBQUEsSUFBQSxhQUFBLENBQUEsQ0FDQSxRQUFBLENBQUEsSUFBQSxDQUFBLG1CQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxtQkFBQSxDQUFBLEFBQ0EsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLE1BQUEsQ0FDQSxHQUFBLENBQUEsNEJBQUEsQ0FDQSxJQUFBLENBQUEsUUFBQSxDQUFBLElBQUEsQ0FDQSxDQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsT0FBQSxDQUFBLENBQ0EsR0FBQSxPQUFBLENBQUEsVUFBQSxLQUFBLElBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxRQUFBLENBQUEsT0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxDQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxvREFBQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSwyQkFHQSxNQUFBLENBQUEsbUJBQUEsR0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsSUFBQSxVQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLG1CQUFBLENBQUEsMERBQUEsQ0FBQSwwREFBQSxDQUFBLDBEQUFBLENBQUEsMERBQUEsQ0FBQSwwREFBQSxDQUFBLENBQUEsQUFDQSxJQUFBLFVBQUEsQ0FBQSxFQUFBLENBQUEsQUFDQSxVQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsSUFBQSxTQUFBLENBQUEsSUFBQSxPQUFBLENBQUEsU0FBQSxPQUFBLENBQUEsTUFBQSxDQUFBLENBQ0EsR0FBQSxHQUFBLENBQUEsUUFBQSxDQUFBLFdBQUEsQ0FBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxTQUFBLENBQUEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsSUFBQSxRQUFBLENBQUEsR0FBQSxDQUFBLFNBQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQUFDQSxJQUFBLE9BQUEsQ0FBQSxFQUFBLENBQUEsQUFDQSxLQUFBLENBQUEsR0FBQSxDQUFBLHlHQUFBLEdBQUEsUUFBQSxHQUFBLFVBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLEdBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQ0FBQSxBQUNBLFVBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFDQSxPQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLE9BQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQUFDQSxPQUFBLEtBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxLQUFBLENBQ0EsR0FBQSxDQUFBLHlCQUFBLENBQ0EsTUFBQSxDQUFBLENBQ0EsV0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxDQUNBLFVBQUEsQ0FBQSxPQUFBLENBQ0EsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsUUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsR0FBQSxDQUFBLFFBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLEtBQUEsRUFBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSwyQ0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLHNDQUdBLE1BQUEsQ0FBQSxnQkFBQSxHQUFBLFVBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLElBQUEsT0FBQSxDQUFBLFNBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsQUFDQSxvQkFBQSxDQUNBLGdCQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLG9CQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsbUJBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxRQUFBLENBQUEsU0FDQSxDQUFBLHVCQUFBLENBQUEsQ0FBQSxBQUVBLFNBQUEsb0JBQUEsQ0FBQSxNQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsS0FBQSxHQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsZUFBQSxHQUFBLFVBQUEsQ0FDQSxPQUFBLENBQ0Esa0JBQUEsQ0FBQSxNQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxlQUFBLEdBQUEsR0FBQSxDQUNBLG1CQUFBLENBQUEsV0FBQSxDQUNBLGlCQUFBLENBQUEsT0FBQSxDQUNBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUVBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxrQkFBQSxLQUFBLE1BQUEsQ0FBQSxDQUNBLE9BQUEsb0JBQUEsQ0FBQSxlQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLENBQ0EsT0FBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FDQSxPQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FDQSxDQUNBLEFBRUEsU0FBQSxtQkFBQSxDQUFBLEdBQUEsQ0FBQSxDQUNBLEdBQUEsT0FBQSxHQUFBLEtBQUEsUUFBQSxJQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsWUFBQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxBQUNBLE9BQUEsRUFBQSxDQUFBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUNBLEFBRUEsU0FBQSxRQUFBLENBQUEsTUFBQSxDQUFBLENBQ0EsU0FBQSxHQUFBLE1BQUEsQ0FBQSxDQUNBLEFBRUEsU0FBQSx1QkFBQSxFQUFBLENBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLHFDQUdBLE1BQUEsQ0FBQSxzQkFBQSxHQUFBLFVBQUEsQ0FDQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsT0FBQSxJQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLHlCQUFBLENBQUEsQ0FBQSxBQUNBLE9BQUEsS0FBQSxDQUFBLENBQ0EsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxTQUFBLEdBQUEsRUFBQSxDQUFBLEFBRUEsRUFBQSxDQUFBLE9BQUEsRUFBQSxDQUNBLElBQUEsQ0FBQSxZQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsWUFBQSxDQUFBLFNBQ0EsQ0FBQSxlQUFBLENBQUEsQ0FBQSxBQUVBLFNBQUEsWUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxLQUFBLENBQUEsS0FBQSxHQUFBLEdBQUEsQ0FBQSxXQUFBLENBQUEsQUFDQSxPQUFBLG9CQUFBLENBQUEsWUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUNBLEFBRUEsU0FBQSxZQUFBLENBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxJQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxLQUFBLEVBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxRQUFBLENBQUEsSUFBQSxHQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxDQUFBLENBQ0EsS0FBQSxDQUNBLE1BQUEsQ0FBQSxTQUFBLEdBQUEscUNBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxtQkFBQSxHQUFBLElBQUEsQ0FBQSxDQUNBLEFBQ0EsTUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLENBQ0EsQUFFQSxTQUFBLGVBQUEsQ0FBQSxHQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLGtDQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLE1BQUEsRUFBQSxDQUFBLENBQ0EsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLDBCQUFBLEdBQUEsU0FBQSxRQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsQ0FDQSxFQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsS0FBQSxDQUFBLGtCQUFBLENBQ0EsS0FBQSxDQUFBLElBQUEsQ0FDQSxPQUFBLENBQUEsTUFBQSxDQUNBLENBQUEsQ0FBQSxBQUNBLEVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsT0FBQSxDQUNBLElBQUEsQ0FBQSxRQUFBLENBQ0EsQ0FBQSxTQUFBLFFBQUEsQ0FBQSxDQUNBLEdBQUEsUUFBQSxJQUFBLENBQUEsUUFBQSxDQUFBLFVBQUEsQ0FBQSxDQUNBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLElBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLEtBQUEsRUFBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLFFBQUEsQ0FBQSxJQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsTUFBQSxDQUFBLFNBQUEsR0FBQSxxQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLG1CQUFBLEdBQUEsSUFBQSxDQUFBLENBQ0EsQUFDQSxNQUFBLENBQUEsTUFBQSxFQUFBLENBQUEsQ0FDQSxLQUFBLEdBQUEsUUFBQSxJQUFBLFFBQUEsQ0FBQSxVQUFBLEtBQUEsSUFBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxrQkFBQSxHQUFBLGtCQUFBLENBQUEsUUFBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLFNBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLEFBQ0EsS0FBQSxDQUFBLHlDQUFBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUNBLElBQUEsRUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxBQUNBLEdBQUEsQ0FBQSxDQUFBLGNBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FDQSxBQUNBLEVBQUEsR0FBQSxDQUFBLENBQUEsYUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEFBQ0EsRUFBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxFQUFBLENBQUEsR0FBQSxHQUFBLHFDQUFBLENBQUEsQUFDQSxHQUFBLENBQUEsVUFBQSxDQUFBLFlBQUEsQ0FBQSxFQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLHlCQUFBLEdBQUEsU0FBQSxRQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsQ0FDQSxFQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsS0FBQSxDQUFBLGtCQUFBLENBQ0EsS0FBQSxDQUFBLElBQUEsQ0FDQSxPQUFBLENBQUEsTUFBQSxDQUNBLENBQUEsQ0FBQSxBQUNBLEVBQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLGFBQUEsQ0FBQSxTQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsUUFBQSxHQUFBLFFBQUEsQ0FBQSxXQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBQ0EsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsRUFBQSxDQUFBLENBQ0EsSUFBQSxFQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FBQSxvQkFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEFBQ0EsR0FBQSxDQUFBLENBQUEsY0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQ0EsT0FBQSxDQUNBLEFBQ0EsRUFBQSxHQUFBLENBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQUFDQSxFQUFBLENBQUEsRUFBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLEVBQUEsQ0FBQSxHQUFBLEdBQUEscUNBQUEsQ0FBQSxBQUNBLEdBQUEsQ0FBQSxVQUFBLENBQUEsWUFBQSxDQUFBLEVBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxRQUFBLENBQUEsUUFBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FDQSxDQUNBLENBQUEsQ0FBQSxBQ2hWQSxNQUFBLENBQUEsS0FBQSxHQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUNBLElBQUEsRUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsSUFBQSxFQUFBLENBQUEsQUFDQSxHQUFBLENBQUEsQ0FBQSxjQUFBLENBQUEsRUFBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLENBQUEsQUFDQSxFQUFBLEdBQUEsQ0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxBQUNBLEVBQUEsQ0FBQSxFQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsRUFBQSxDQUFBLEdBQUEsR0FBQSx5Q0FBQSxDQUFBLEFBQ0EsR0FBQSxDQUFBLFVBQUEsQ0FBQSxZQUFBLENBQUEsRUFBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLEFBRUEsQ0FBQSxDQUFBLEVBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsS0FBQSxHQUFBLFNBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEVBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsT0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsUUFBQSxDQUFBLFFBQUEsQ0FBQSxhQUFBLENBQUEsQ0FBQSxBQ2ZBLEdBQUEsQ0FBQSxPQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUVBLFNBQUEsV0FBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLE9BQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSx5QkFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQ0EsQUFFQSxTQUFBLGVBQUEsRUFBQSxDQUNBLE9BQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxpQ0FBQSxDQUFBLENBQUEsQ0FDQSxBQUVBLFNBQUEsa0JBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsNEJBQUEsR0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQ0FDQSxBQUVBLFNBQUEscUJBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsa0NBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUNBLEFBRUEsT0FBQSxDQUNBLFdBQUEsQ0FBQSxXQUFBLENBQ0EsZUFBQSxDQUFBLGVBQUEsQ0FDQSxrQkFBQSxDQUFBLGtCQUFBLENBQ0EscUJBQUEsQ0FBQSxxQkFBQSxDQUNBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FBQSxBQ3pCQSxHQUFBLENBQUEsT0FBQSxDQUFBLHNCQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxLQUFBLENBQUEsQ0FFQSxTQUFBLGdCQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsT0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLDhCQUFBLEdBQUEsSUFBQSxDQUFBLENBQUEsQ0FDQSxBQUVBLFNBQUEsWUFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLE9BQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSx5QkFBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQUFFQSxTQUFBLFlBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsb0JBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUNBLEFBRUEsU0FBQSxlQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsT0FBQSxLQUFBLENBQUEsR0FBQSxDQUFBLG9DQUFBLEdBQUEsSUFBQSxDQUFBLE1BQUEsR0FBQSxXQUFBLEdBQUEsSUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQ0EsQUFFQSxPQUFBLENBQ0EsZ0JBQUEsQ0FBQSxnQkFBQSxDQUNBLFlBQUEsQ0FBQSxZQUFBLENBQ0EsWUFBQSxDQUFBLFlBQUEsQ0FDQSxlQUFBLENBQUEsZUFBQSxDQUNBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FBQSxBQzFCQSxHQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsY0FBQSxDQUFBLENBQ0EsY0FBQSxDQUNBLEtBQUEsQ0FBQSxNQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsR0FBQSxDQUNBLFdBQUEsQ0FBQSx5QkFBQSxDQUNBLFVBQUEsQ0FBQSxnQkFBQSxDQUNBLENBQUEsQ0FDQSxLQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLFFBQUEsQ0FDQSxXQUFBLENBQUEsMEJBQUEsQ0FDQSxVQUFBLENBQUEsZ0JBQUEsQ0FDQSxDQUFBLENBQ0EsS0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxXQUFBLENBQ0EsV0FBQSxDQUFBLDZCQUFBLENBQ0EsVUFBQSxDQUFBLGdCQUFBLENBQ0EsQ0FBQSxDQUNBLEtBQUEsQ0FBQSxNQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsT0FBQSxDQUNBLFdBQUEsQ0FBQSx5QkFBQSxDQUNBLFVBQUEsQ0FBQSxnQkFBQSxDQUNBLENBQUEsQ0FDQSxLQUFBLENBQUEsT0FBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLFFBQUEsQ0FDQSxXQUFBLENBQUEsMEJBQUEsQ0FDQSxVQUFBLENBQUEsZ0JBQUEsQ0FDQSxDQUFBLENBQ0EsS0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxVQUFBLENBQ0EsV0FBQSxDQUFBLDRCQUFBLENBQ0EsVUFBQSxDQUFBLGdCQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxnQkFBQSxDQUFBLENBQUEsWUFBQSxDQUNBLFFBQUEsQ0FDQSxRQUFBLENBQ0EsT0FBQSxDQUNBLFdBQUEsQ0FDQSxTQUFBLENBQ0EsYUFBQSxDQUNBLFNBQUEsVUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLFNBQUEsQ0FBQSxPQUFBLENBQUEsV0FBQSxDQUFBLENBRUEsTUFBQSxDQUFBLGNBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsTUFBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsQ0FDQSxXQUFBLENBQUEsS0FBQSxDQUNBLFdBQUEsQ0FBQSxLQUFBLENBQ0EsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsQ0FDQSxXQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsRUFBQSxDQUNBLE9BQUEsQ0FBQSxLQUFBLENBQ0EsQ0FDQSxXQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsRUFBQSxDQUNBLE9BQUEsQ0FBQSxLQUFBLENBQ0EsQ0FDQSxDQUFBLHVCQUlBLE1BQUEsQ0FBQSxxQkFBQSxHQUFBLFVBQUEsQ0FDQSxNQUFBLENBQUEsT0FBQSxHQUFBLENBQ0EsV0FBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLEVBQUEsQ0FDQSxPQUFBLENBQUEsS0FBQSxDQUNBLENBQ0EsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxHQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLGVBQUEsR0FBQSxVQUFBLENBRUEsTUFBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEdBQUEsQ0FDQSxHQUFBLENBQUEsRUFBQSxDQUNBLE9BQUEsQ0FBQSxLQUFBLENBQ0EsQ0FBQSxBQUVBLFdBQUEsQ0FDQSxlQUFBLENBQUEsTUFBQSxDQUFBLGNBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSx1QkFBQSxDQUFBLFNBQ0EsQ0FBQSxvQkFBQSxDQUFBLENBQUEsQUFFQSxTQUFBLHVCQUFBLENBQUEsR0FBQSxDQUFBLENBQ0EsR0FBQSxHQUFBLENBQUEsTUFBQSxLQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxjQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsSUFBQSxDQUFBLENBQ0EsQ0FDQSxBQUVBLFNBQUEsb0JBQUEsQ0FBQSxHQUFBLENBQUEsQ0FDQSxHQUFBLEdBQUEsQ0FBQSxNQUFBLEtBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEdBQUEsQ0FDQSxHQUFBLENBQUEsdUJBQUEsQ0FDQSxPQUFBLENBQUEsSUFBQSxDQUNBLENBQUEsQUFDQSxPQUFBLENBQ0EsQUFDQSxNQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsR0FBQSxDQUNBLEdBQUEsQ0FBQSxrQ0FBQSxDQUNBLE9BQUEsQ0FBQSxJQUFBLENBQ0EsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxtREFNQSxNQUFBLENBQUEsaUJBQUEsR0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLE9BQUEsR0FBQSxDQUNBLFdBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxFQUFBLENBQ0EsT0FBQSxDQUFBLEtBQUEsQ0FDQSxDQUNBLENBQUEsQUFDQSxNQUFBLENBQUEsSUFBQSxDQUFBLFdBQUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxlQUFBLEdBQUEsVUFBQSxDQUNBLFdBQUEsQ0FDQSxlQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxtQkFBQSxDQUFBLFNBQ0EsQ0FBQSxnQkFBQSxDQUFBLENBQUEsQUFFQSxTQUFBLG1CQUFBLENBQUEsR0FBQSxDQUFBLENBQ0EsR0FBQSxHQUFBLENBQUEsTUFBQSxLQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxNQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxXQUFBLEdBQUEsSUFBQSxDQUFBLENBQ0EsQ0FDQSxBQUVBLFNBQUEsZ0JBQUEsQ0FBQSxHQUFBLENBQUEsQ0FDQSxHQUFBLEdBQUEsQ0FBQSxNQUFBLEtBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLE9BQUEsQ0FBQSxXQUFBLEdBQUEsQ0FDQSxHQUFBLENBQUEsdUJBQUEsQ0FDQSxPQUFBLENBQUEsSUFBQSxDQUNBLENBQUEsQUFDQSxPQUFBLENBQ0EsQUFFQSxNQUFBLENBQUEsT0FBQSxDQUFBLFdBQUEsR0FBQSxDQUNBLEdBQUEsQ0FBQSxrQ0FBQSxDQUNBLE9BQUEsQ0FBQSxJQUFBLENBQ0EsQ0FBQSxDQUNBLENBQ0EsQ0FBQSw2QkFHQSxDQUNBLENBQUEsQ0FBQSxBQUVBLEdBQUEsQ0FBQSxTQUFBLENBQUEsU0FBQSxDQUFBLFNBQUEsT0FBQSxDQUFBLENBQ0EsT0FBQSxDQUNBLFFBQUEsQ0FBQSxJQUFBLENBQ0EsSUFBQSxDQUFBLGNBQUEsTUFBQSxDQUFBLFFBQUEsQ0FBQSxDQUNBLElBQUEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQUFDQSxJQUFBLFNBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsU0FBQSxDQUFBLEFBRUEsU0FBQSxZQUFBLEVBQUEsQ0FFQSxHQUFBLE9BQUEsQ0FBQSxXQUFBLEdBQUEsU0FBQSxDQUFBLENBQ0EsUUFBQSxDQUFBLEdBQUEsQ0FBQSxVQUFBLENBQUEsT0FBQSxDQUFBLENBQUEsQUFDQSxRQUFBLENBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FDQSxRQUFBLENBQUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxBQUNBLFFBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLEVBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FDQSxBQUVBLE1BQUEsQ0FBQSxHQUFBLENBQUEsbUJBQUEsQ0FBQSxVQUFBLENBQ0EsR0FBQSxDQUFBLE1BQUEsQ0FBQSxRQUFBLENBQUEsWUFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFDQSxHQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxZQUFBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQy9LQSxHQUFBLENBQUEsT0FBQSxDQUFBLGFBQUEsQ0FBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUVBLFNBQUEsZUFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLE9BQUEsS0FBQSxDQUFBLElBQUEsQ0FBQSx1QkFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQ0EsQUFFQSxTQUFBLGVBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLEtBQUEsQ0FBQSxJQUFBLENBQUEsdUJBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxDQUNBLEFBRUEsT0FBQSxDQUNBLGVBQUEsQ0FBQSxlQUFBLENBQ0EsZUFBQSxDQUFBLGVBQUEsQ0FDQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQUEsQUNoQkEsR0FBQSxDQUFBLE9BQUEsQ0FBQSx3QkFBQSxDQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsS0FBQSxDQUFBLENBQ0EsU0FBQSxtQkFBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLE9BQUEsS0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLE1BQUEsQ0FDQSxHQUFBLENBQUEsc0JBQUEsQ0FDQSxPQUFBLENBQUEsQ0FBQSxjQUFBLENBQUEsU0FBQSxDQUFBLENBQ0EsZ0JBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQUFDQSxPQUFBLENBQ0EsbUJBQUEsQ0FBQSxtQkFBQSxDQUNBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FBQSxBQ2JBLEdBQUEsQ0FBQSxPQUFBLENBQUEsZUFBQSxDQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsS0FBQSxDQUFBLENBRUEsU0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsT0FBQSxLQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsTUFBQSxDQUNBLEdBQUEsQ0FBQSxhQUFBLENBQ0EsT0FBQSxDQUFBLENBQUEsY0FBQSxDQUFBLFNBQUEsQ0FBQSxDQUNBLGdCQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLEFBQ0EsT0FBQSxDQUNBLFVBQUEsQ0FBQSxVQUFBLENBQ0EsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUFBLEFDZEEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLGNBQUEsQ0FBQSxDQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsb0JBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSwyQkFBQSxDQUNBLFdBQUEsQ0FBQSxxREFBQSxDQUNBLFVBQUEsQ0FBQSw2QkFBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsNkJBQUEsQ0FBQSxTQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxXQUFBLENBQUEsY0FBQSxDQUFBLElBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQ0EsQUFDQSxNQUFBLENBQUEsSUFBQSxHQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFFBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsZUFBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxXQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLEtBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxDQUNBLGtCQUFBLENBQ0EsU0FBQSxDQUNBLFVBQUEsQ0FDQSxPQUFBLENBQ0EsV0FBQSxDQUNBLFNBQUEsQ0FDQSxhQUFBLENBQ0EsV0FBQSxDQUNBLFlBQUEsQ0FDQSxPQUFBLENBQ0EsYUFBQSxDQUNBLFNBQUEsQ0FDQSxZQUFBLENBQ0EsVUFBQSxDQUNBLE1BQUEsQ0FDQSxhQUFBLENBQ0EsT0FBQSxDQUNBLG1CQUFBLENBQ0EsT0FBQSxDQUNBLE1BQUEsQ0FDQSw2QkFBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEscUJBQUEsR0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLGVBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsZUFBQSxHQUFBLFVBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxHQUFBLENBQUEsZ0NBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxHQUFBLFFBQUEsR0FBQSxNQUFBLENBQUEsSUFBQSxHQUFBLFNBQUEsR0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxHQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsTUFBQSxHQUFBLENBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxPQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxPQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFNBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsZUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsc0NBQUEsQ0FBQSxDQUFBLEFBQ0EsT0FBQSxDQUFBLEdBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsUUFBQSxHQUFBLFVBQUEsQ0FDQSxNQUFBLENBQUEsSUFBQSxJQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Q0FZQSxDQUFBLEFBRUEsTUFBQSxDQUFBLE1BQUEsR0FBQSxTQUFBLEtBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsSUFBQSxDQUFBLEFBQ0EsS0FBQSxDQUFBLE1BQUEsR0FBQSxVQUFBLENBQUEsQUFDQSxLQUFBLENBQUEsR0FBQSxDQUFBLHFCQUFBLENBQUEsQ0FDQSxLQUFBLENBQUEsS0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsZUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsZUFBQSxDQUFBLE9BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxBQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsWUFBQSxDQUFBLHFCQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsT0FBQSxHQUFBLFNBQUEsVUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxVQUFBLENBQUEsTUFBQSxHQUFBLFVBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxHQUFBLENBQUEsc0JBQUEsQ0FBQSxDQUNBLFVBQUEsQ0FBQSxVQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLElBQUEsS0FBQSxDQUFBLE1BQUEsQ0FBQSxlQUFBLENBQUEsT0FBQSxDQUFBLFVBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGVBQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsd0JBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxhQUFBLEdBQUEsU0FBQSxVQUFBLENBQUEsQ0FDQSxJQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsS0FBQSxDQUFBLFVBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxBQUNBLElBQUEsU0FBQSxDQUFBLEVBQUEsQ0FBQSxBQUNBLE9BQUEsT0FBQSxDQUFBLFdBQUEsRUFDQSxLQUFBLFVBQUEsQ0FDQSxTQUFBLEdBQUEsTUFBQSxHQUFBLFVBQUEsQ0FBQSxJQUFBLEdBQUEsb01BQUEsR0FBQSxPQUFBLENBQUEsV0FBQSxHQUFBLElBQUEsR0FBQSxPQUFBLENBQUEsR0FBQSxHQUFBLHUzQkFBQSxDQUFBLEFBQ0EsTUFBQSxBQUNBLEtBQUEsU0FBQSxDQUNBLFNBQUEsR0FBQSxNQUFBLEdBQUEsVUFBQSxDQUFBLElBQUEsR0FBQSxvTUFBQSxHQUFBLE9BQUEsQ0FBQSxXQUFBLEdBQUEsSUFBQSxHQUFBLE9BQUEsQ0FBQSxHQUFBLEdBQUEsMjNCQUFBLENBQUEsQUFDQSxNQUFBLEFBQ0EsUUFDQSxTQUFBLEdBQUEsTUFBQSxHQUFBLFVBQUEsQ0FBQSxJQUFBLEdBQUEsb01BQUEsR0FBQSxPQUFBLENBQUEsV0FBQSxHQUFBLElBQUEsR0FBQSxPQUFBLENBQUEsR0FBQSxHQUFBLCszQkFBQSxDQUFBLEFBQ0EsTUFBQSxDQUNBLEFBQ0EsVUFBQSxDQUFBLFNBQUEsR0FBQSxTQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxVQUFBLEdBQUEsU0FBQSxVQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLDBDQUFBLENBQUEsQ0FDQSxTQUFBLENBQUEsQ0FBQSxDQUNBLE9BQUEsQ0FBQSxLQUFBLENBQ0EsUUFBQSxDQUFBLG1CQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxLQUFBLENBQUEsSUFBQSxDQUFBLHFCQUFBLENBQUEsQ0FDQSxFQUFBLENBQUEsVUFBQSxDQUFBLEdBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLGVBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLGVBQUEsQ0FBQSxPQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQ0FDQSxPQUFBLENBQUEsUUFBQSxDQUNBLFFBQUEsQ0FBQSxtQkFBQSxFQUFBLENBQ0EsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsV0FBQSxHQUFBLFVBQUEsQ0FDQSxNQUFBLENBQUEsUUFBQSxHQUFBLENBQUEsQ0FDQSxXQUFBLENBQUEsYUFBQSxDQUNBLEdBQUEsQ0FBQSxtQ0FBQSxDQUNBLENBQUEsQ0FDQSxXQUFBLENBQUEsbUJBQUEsQ0FDQSxHQUFBLENBQUEsd0NBQUEsQ0FDQSxDQUFBLENBQ0EsV0FBQSxDQUFBLFNBQUEsQ0FDQSxHQUFBLENBQUEsZ0NBQUEsQ0FDQSxDQUFBLENBQ0EsV0FBQSxDQUFBLGdCQUFBLENBQ0EsR0FBQSxDQUFBLHNDQUFBLENBQ0EsQ0FBQSxDQUNBLFdBQUEsQ0FBQSxRQUFBLENBQ0EsR0FBQSxDQUFBLHFDQUFBLENBQ0EsQ0FBQSxDQUNBLFdBQUEsQ0FBQSxnQkFBQSxDQUNBLEdBQUEsQ0FBQSxtQ0FBQSxDQUNBLENBQUEsQ0FDQSxXQUFBLENBQUEsVUFBQSxDQUNBLEdBQUEsQ0FBQSxpQ0FBQSxDQUNBLENBQUEsQ0FDQSxXQUFBLENBQUEsU0FBQSxDQUNBLEdBQUEsQ0FBQSxnQ0FBQSxDQUNBLENBQUEsQ0FDQSxXQUFBLENBQUEsVUFBQSxDQUNBLEdBQUEsQ0FBQSxxQ0FBQSxDQUNBLENBQUEsQ0FDQSxXQUFBLENBQUEsZ0JBQUEsQ0FDQSxHQUFBLENBQUEsc0NBQUEsQ0FDQSxDQUFBLENBQ0EsV0FBQSxDQUFBLE9BQUEsQ0FDQSxHQUFBLENBQUEsOEJBQUEsQ0FDQSxDQUFBLENBQ0EsV0FBQSxDQUFBLGNBQUEsQ0FDQSxHQUFBLENBQUEsa0NBQUEsQ0FDQSxDQUFBLENBQ0EsV0FBQSxDQUFBLFdBQUEsQ0FDQSxHQUFBLENBQUEsZ0NBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBRUEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLENBQUEsQ0FBQSxNQUFBLENBQUEsU0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsT0FBQSxJQUFBLENBQUEsa0JBQUEsQ0FBQSxHQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FBQSxBQ2xOQSxHQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsY0FBQSxDQUFBLENBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsV0FBQSxDQUNBLFdBQUEsQ0FBQSxpQ0FBQSxDQUNBLFVBQUEsQ0FBQSxtQkFBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQUVBLEdBQUEsQ0FBQSxVQUFBLENBQUEsbUJBQUEsQ0FBQSxDQUFBLFlBQUEsQ0FDQSxRQUFBLENBQ0EsUUFBQSxDQUNBLE9BQUEsQ0FDQSxXQUFBLENBQ0EsU0FBQSxDQUNBLGdCQUFBLENBQ0EsU0FBQSxVQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsU0FBQSxDQUFBLE9BQUEsQ0FBQSxjQUFBLENBQUEsQ0FFQSxNQUFBLENBQUEsVUFBQSxHQUFBLENBQ0Esa0JBQUEsQ0FDQSxTQUFBLENBQ0EsVUFBQSxDQUNBLE9BQUEsQ0FDQSxXQUFBLENBQ0EsU0FBQSxDQUNBLGFBQUEsQ0FDQSxXQUFBLENBQ0EsWUFBQSxDQUNBLE9BQUEsQ0FDQSxhQUFBLENBQ0EsU0FBQSxDQUNBLFlBQUEsQ0FDQSxVQUFBLENBQ0EsTUFBQSxDQUNBLGFBQUEsQ0FDQSxPQUFBLENBQ0EsbUJBQUEsQ0FDQSxPQUFBLENBQ0EsTUFBQSxDQUNBLDZCQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLE9BQUEsR0FBQSxDQUNBLEdBQUEsQ0FBQSxFQUFBLENBQ0EsT0FBQSxDQUFBLEtBQUEsQ0FDQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFFQSxNQUFBLENBQUEsV0FBQSxHQUFBLFVBQUE7QUFFQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxPQUFBLENBQUEsT0FBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLElBQUEsSUFBQSxDQUFBLElBQUEsUUFBQSxFQUFBLENBQUEsQUFDQSxJQUFBLElBQUEsSUFBQSxJQUFBLE1BQUEsQ0FBQSxVQUFBLEVBQUEsQ0FDQSxJQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxBQUNBLGNBQUEsQ0FDQSxXQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLGVBQUEsQ0FBQSxTQUNBLENBQUEsVUFBQSxDQUFBLENBQUEsQUFFQSxTQUFBLGVBQUEsQ0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLEdBQUEsR0FBQSxDQUFBLE1BQUEsS0FBQSxHQUFBLENBQUE7O0FBR0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxPQUFBLENBQUEsT0FBQSxDQUFBLG9CQUFBLENBQUEsQ0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsWUFBQSxDQUFBLHFEQUFBLENBQUEsQ0FBQSxDQUNBLEtBQUE7O0FBR0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxvRkFBQSxDQUFBLENBQUEsQ0FDQSxDQUNBLEFBRUEsU0FBQSxVQUFBLENBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsWUFBQSxDQUFBLG9GQUFBLENBQUEsQ0FBQTs7Ozs7Ozs7Ozs7Q0FZQSxDQUNBLENBQUEsQ0FDQSxDQUNBLENBQUEsQ0FBQSxBQzdGQSxHQUFBLENBQUEsT0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxLQUFBLENBQUEsQ0FFQSxTQUFBLFdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxPQUFBLEtBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxNQUFBLENBQ0EsR0FBQSxDQUFBLGNBQUEsQ0FDQSxPQUFBLENBQUEsQ0FDQSxjQUFBLENBQUEsU0FBQSxDQUNBLENBQ0EsZ0JBQUEsQ0FBQSxPQUFBLENBQUEsUUFBQSxDQUNBLElBQUEsQ0FBQSxJQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQUFFQSxPQUFBLENBQ0EsV0FBQSxDQUFBLFdBQUEsQ0FDQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQUEsQUNqQkEsR0FBQSxDQUFBLE1BQUEsQ0FBQSxTQUFBLGNBQUEsQ0FBQSxDQUNBLGNBQUEsQ0FBQSxLQUFBLENBQUEsVUFBQSxDQUFBLENBQ0EsR0FBQSxDQUFBLGlCQUFBLENBQ0EsV0FBQSxDQUFBLGlDQUFBLENBQ0EsVUFBQSxDQUFBLG9CQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFBRUEsR0FBQSxDQUFBLFVBQUEsQ0FBQSxvQkFBQSxDQUFBLFNBQUEsVUFBQSxDQUFBLE1BQUEsQ0FBQSxNQUFBLENBQUEsS0FBQSxDQUFBLGNBQUEsQ0FBQSxjQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLEVBQUEsQ0FBQSxPQUFBLENBQUEsQ0FBQSxDQUNBLEFBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsT0FBQSxHQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSx3QkFBQSxHQUFBLFNBQUEsSUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxHQUFBLE9BQUEsTUFBQSxDQUFBLFVBQUEsS0FBQSxXQUFBLENBQ0EsQ0FDQSxRQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsQ0FBQSxPQUFBLENBQUEsY0FBQSxDQUFBLENBQUEsQ0FDQSxLQUVBLENBQ0EsY0FBQSxDQUFBLFVBQUEsQ0FBQSxNQUFBLENBQUEsVUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLEdBQUEsR0FBQSxDQUFBLE9BQUEsQ0FBQSxDQUNBLFFBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQUFFQSxTQUFBLFFBQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUNBLENBQ0EsY0FBQSxDQUNBLGtCQUFBLENBQUEsQ0FDQSxRQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FDQSxVQUFBLENBQUEsR0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxjQUFBLENBQUEsTUFBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsY0FBQSxDQUFBLE9BQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsWUFBQSxDQUFBLDhCQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsU0FDQSxDQUFBLFVBQUEsRUFDQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsY0FBQSxHQUFBLFNBQUEsSUFBQSxDQUFBLENBQ0EsR0FBQSxJQUFBLENBQUEsV0FBQSxJQUFBLElBQUEsQ0FBQSxlQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsWUFBQSxDQUFBLCtDQUFBLENBQUEsQ0FBQSxBQUNBLE9BQUEsQ0FDQSxLQUNBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxjQUFBLENBQ0Esa0JBQUEsQ0FBQSxDQUNBLFFBQUEsQ0FBQSxJQUFBLENBQUEsV0FBQSxDQUNBLENBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsZ0NBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxTQUFBLENBQUEsVUFBQSxFQUNBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUNBLENBQUEsQ0FBQSxBQ2hFQSxHQUFBLENBQUEsT0FBQSxDQUFBLGdCQUFBLENBQUEsQ0FBQSxPQUFBLENBQUEsU0FBQSxLQUFBLENBQUEsQ0FFQSxTQUFBLGtCQUFBLENBQUEsSUFBQSxDQUFBLENBRUEsT0FBQSxLQUFBLENBQUEsSUFBQSxDQUFBLCtCQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FDQSxBQUVBLFNBQUEsZUFBQSxDQUFBLElBQUEsQ0FBQSxDQUVBLE9BQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxrQ0FBQSxHQUFBLElBQUEsQ0FBQSxRQUFBLENBQUEsQ0FBQSxDQUVBLEFBRUEsU0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLENBQ0EsSUFBQSxFQUFBLENBQUEsSUFBQSxRQUFBLEVBQUEsQ0FBQSxBQUNBLEVBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLElBQUEsQ0FBQSxDQUFBLEFBQ0EsT0FBQSxLQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsTUFBQSxDQUNBLEdBQUEsQ0FBQSw2QkFBQSxDQUNBLE9BQUEsQ0FBQSxDQUFBLGNBQUEsQ0FBQSxTQUFBLENBQUEsQ0FDQSxlQUFBLENBQUEsT0FBQSxDQUFBLFFBQUEsQ0FDQSxJQUFBLENBQUEsRUFBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxRQUFBLENBQUEsQ0FDQSxPQUFBLFFBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxBQUVBLE9BQUEsQ0FDQSxlQUFBLENBQUEsZUFBQSxDQUNBLGtCQUFBLENBQUEsa0JBQUEsQ0FDQSxVQUFBLENBQUEsVUFBQSxDQUVBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FBQSxBQ2xDQSxHQUFBLENBQUEsTUFBQSxDQUFBLFNBQUEsY0FBQSxDQUFBLENBQ0EsY0FBQSxDQUFBLEtBQUEsQ0FBQSxhQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsb0JBQUEsQ0FDQSxXQUFBLENBQUEsdUNBQUEsQ0FDQSxVQUFBLENBQUEsc0JBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQUFFQSxHQUFBLENBQUEsVUFBQSxDQUFBLHNCQUFBLENBQUEsU0FBQSxVQUFBLENBQUEsTUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsV0FBQSxDQUFBLGNBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxPQUFBLEdBQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLGVBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsV0FBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxLQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLElBQUEsR0FBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsS0FBQSxHQUFBLEVBQUEsQ0FBQSxBQUNBLEdBQUEsQ0FBQSxjQUFBLENBQUEsT0FBQSxFQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsRUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLENBQ0EsQUFDQSxNQUFBLENBQUEsSUFBQSxHQUFBLGNBQUEsQ0FBQSxPQUFBLEVBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxXQUFBLEdBQUEsRUFBQSxDQUFBLEFBQ0EsR0FBQSxNQUFBLENBQUEsSUFBQSxDQUFBLFVBQUEsQ0FBQSxNQUFBLEdBQUEsQ0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLElBQUEsQ0FBQSxVQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsR0FBQSxHQUFBLENBQUEsS0FBQSxJQUFBLEVBQUEsSUFBQSxNQUFBLENBQUEsV0FBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsV0FBQSxDQUFBLElBQUEsQ0FBQSxHQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQ0FBQSxDQUNBLEFBRUEsTUFBQSxDQUFBLFVBQUEsR0FBQSxDQUNBLGtCQUFBLENBQ0EsU0FBQSxDQUNBLFVBQUEsQ0FDQSxPQUFBLENBQ0EsV0FBQSxDQUNBLFNBQUEsQ0FDQSxhQUFBLENBQ0EsV0FBQSxDQUNBLFlBQUEsQ0FDQSxPQUFBLENBQ0EsYUFBQSxDQUNBLFNBQUEsQ0FDQSxZQUFBLENBQ0EsVUFBQSxDQUNBLE1BQUEsQ0FDQSxhQUFBLENBQ0EsT0FBQSxDQUNBLG1CQUFBLENBQ0EsT0FBQSxDQUNBLE1BQUEsQ0FDQSw2QkFBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEscUJBQUEsR0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLGVBQUEsR0FBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsSUFBQSxHQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxlQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsZUFBQSxHQUFBLFVBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxHQUFBLENBQUEsb0NBQUEsR0FBQSxrQkFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsR0FBQSxRQUFBLEdBQUEsTUFBQSxDQUFBLElBQUEsR0FBQSxTQUFBLEdBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUNBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsR0FBQSxHQUFBLENBQUEsSUFBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLENBQUEsQ0FDQSxPQUFBLENBQUEsT0FBQSxDQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsV0FBQSxHQUFBLFNBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxlQUFBLENBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQUFDQSxVQUFBLENBQUEsVUFBQSxDQUNBLE1BQUEsQ0FBQSxlQUFBLENBQUEsT0FBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsRUFBQSxDQUFBLE1BQUEsQ0FBQSxHQUFBLENBQUEsUUFBQSxDQUFBLENBQ0EsT0FBQSxDQUFBLFFBQUEsQ0FBQSxjQUFBLENBQUEsR0FBQSxDQUFBLE9BQUEsR0FBQSxRQUFBLENBQUEsQ0FDQSxTQUFBLENBQUEsS0FBQSxDQUNBLFNBQUEsQ0FBQSxHQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsWUFBQSxDQUFBLGdDQUFBLENBQUEsQ0FBQSxBQUNBLE9BQUEsQ0FBQSxHQUFBLENBQUEsR0FBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLElBQUEsSUFBQSxFQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsZUFBQSxFQUFBLENBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7OztDQW1CQSxDQUFBLEFBRUEsTUFBQSxDQUFBLFNBQUEsR0FBQSxTQUFBLEdBQUEsQ0FBQSxJQUFBLENBQUEsQ0FDQSxJQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxDQUFBLE9BQUEsQ0FBQSxJQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQUFDQSxHQUFBLEtBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLElBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FDQSxHQUFBLENBQUEsVUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsY0FBQSxHQUFBLFNBQUEsR0FBQSxDQUFBLEtBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxJQUFBLENBQUEsVUFBQSxDQUFBLE9BQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLEdBQUEsR0FBQSxDQUFBLEtBQUEsSUFBQSxFQUFBLElBQUEsR0FBQSxDQUFBLEtBQUEsSUFBQSxLQUFBLENBQUEsQ0FDQSxJQUFBLEtBQUEsQ0FBQSxHQUFBLENBQUEsVUFBQSxDQUFBLE9BQUEsQ0FBQSxHQUFBLENBQUEsRUFBQSxDQUFBLENBQUEsQUFDQSxHQUFBLEtBQUEsSUFBQSxDQUFBLENBQUEsQ0FBQSxDQUNBLEdBQUEsQ0FBQSxVQUFBLENBQUEsSUFBQSxDQUFBLEdBQUEsQ0FBQSxFQUFBLENBQUEsQ0FBQSxDQUNBLEtBQUEsQ0FDQSxHQUFBLENBQUEsVUFBQSxDQUFBLE1BQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxJQUFBLEdBQUEsU0FBQSxLQUFBLENBQUEsQ0FDQSxHQUFBLEtBQUEsQ0FBQSxVQUFBLENBQUEsTUFBQSxJQUFBLENBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FDQSxLQUFBLENBQ0EsS0FBQSxDQUFBLFFBQUEsR0FBQSxVQUFBLENBQUEsUUFBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxLQUFBLENBQUEsR0FBQSxDQUFBLHVCQUFBLENBQUEsS0FBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLGVBQUEsQ0FBQSxNQUFBLENBQUEsTUFBQSxDQUFBLGVBQUEsQ0FBQSxPQUFBLENBQUEsS0FBQSxDQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsWUFBQSxDQUFBLE9BQUEsQ0FBQSxDQUFBLEFBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsSUFBQSxDQUFBLElBQUEsQ0FBQSxTQUFBLEdBQUEsQ0FBQSxDQUNBLE1BQUEsQ0FBQSxVQUFBLEdBQUEsS0FBQSxDQUFBLEFBQ0EsQ0FBQSxDQUFBLFlBQUEsQ0FBQSxxQkFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsTUFBQSxHQUFBLFNBQUEsVUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxLQUFBLFVBQUEsQ0FBQSwwQkFBQSxHQUFBLFVBQUEsQ0FBQSxHQUFBLEdBQUEsR0FBQSxHQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxJQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsZUFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxlQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxBQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsU0FBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsWUFBQSxDQUFBLHVCQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsT0FBQSxHQUFBLFNBQUEsVUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxLQUFBLFVBQUEsQ0FBQSwyQkFBQSxHQUFBLFVBQUEsQ0FBQSxHQUFBLEdBQUEsR0FBQSxHQUFBLFVBQUEsQ0FBQSxRQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxJQUFBLEtBQUEsQ0FBQSxNQUFBLENBQUEsZUFBQSxDQUFBLE9BQUEsQ0FBQSxVQUFBLENBQUEsQ0FBQSxBQUNBLE1BQUEsQ0FBQSxlQUFBLENBQUEsTUFBQSxDQUFBLEtBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxBQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsVUFBQSxDQUFBLENBQUEsQUFDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxDQUNBLENBQUEsQ0FDQSxJQUFBLENBQUEsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsWUFBQSxDQUFBLHdCQUFBLENBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQUEsQUFFQSxNQUFBLENBQUEsT0FBQSxHQUFBLFNBQUEsVUFBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxJQUFBLENBQUEsQUFDQSxLQUFBLENBQUEsSUFBQSxDQUFBLGlDQUFBLENBQUEsVUFBQSxDQUFBLENBQ0EsSUFBQSxDQUFBLFNBQUEsR0FBQSxDQUFBLENBQ0EsTUFBQSxDQUFBLFVBQUEsR0FBQSxLQUFBLENBQUEsQUFDQSxDQUFBLENBQUEsWUFBQSxDQUFBLGNBQUEsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLENBQ0EsQ0FBQSxBQUVBLE1BQUEsQ0FBQSxRQUFBLEdBQUEsU0FBQSxVQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLElBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxJQUFBLENBQUEsa0NBQUEsQ0FBQSxVQUFBLENBQUEsQ0FDQSxJQUFBLENBQUEsU0FBQSxHQUFBLENBQUEsQ0FDQSxNQUFBLENBQUEsVUFBQSxHQUFBLEtBQUEsQ0FBQSxBQUNBLENBQUEsQ0FBQSxZQUFBLENBQUEsWUFBQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQUEsQ0FDQSxDQUFBLENBQ0EsQ0FBQSxDQUFBLEFDck1BLEdBQUEsQ0FBQSxTQUFBLENBQUEsV0FBQSxDQUFBLENBQUEsUUFBQSxDQUFBLFNBQUEsTUFBQSxDQUFBLENBQ0EsT0FBQSxDQUNBLFFBQUEsQ0FBQSxHQUFBLENBQ0EsSUFBQSxDQUFBLGNBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxLQUFBLENBQUEsQ0FDQSxHQUFBLENBQUEsSUFBQSxDQUFBLFFBQUEsQ0FBQSxVQUFBLENBQ0EsTUFBQSxDQUFBLEtBQUEsQ0FBQSxTQUFBLENBQUE7Q0FDQSxNQUFBLENBQUEsS0FBQSxDQUFBLEdBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxLQUFBLENBQUEsQ0FBQSxDQUFBLENBQUEsQ0FBQSxBQUNBLEtBQUEsQ0FBQSxNQUFBLEVBQUEsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUNBLENBQ0EsQ0FBQSxDQUNBLENBQUEsQ0FBQSxDQUFBLEFDWEEsWUFBQSxDQUFBLEFBQ0EsR0FBQSxDQUFBLFNBQUEsQ0FBQSxhQUFBLENBQUEsVUFBQSxDQUNBLE9BQUEsQ0FDQSxLQUFBLENBQUEsQ0FDQSxZQUFBLENBQUEsR0FBQSxDQUNBLENBQ0EsUUFBQSxDQUFBLEdBQUEsQ0FDQSxXQUFBLENBQUEscURBQUEsQ0FDQSxDQUFBLENBQ0EsQ0FBQSxDQUFBIiwiZmlsZSI6Im1haW4uanMiLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XG53aW5kb3cuYXBwID0gYW5ndWxhci5tb2R1bGUoJ0Z1bGxzdGFja0dlbmVyYXRlZEFwcCcsIFsnZnNhUHJlQnVpbHQnLCAndWkucm91dGVyJywgJ3VpLmJvb3RzdHJhcCcsICduZ0FuaW1hdGUnLCAnbmdDb29raWVzJywgJ3lhcnUyMi5hbmd1bGFyLXRpbWVhZ28nLCAnc2F0ZWxsaXplcicsJ2FuZ3VsYXJNb21lbnQnLCdsdWVnZy5kaXJlY3RpdmVzJywndWktcmFuZ2VTbGlkZXInLCAnbmdTYW5pdGl6ZScsICdjb2xvcnBpY2tlci5tb2R1bGUnXSk7XG5cbmFwcC5jb25maWcoZnVuY3Rpb24oJHVybFJvdXRlclByb3ZpZGVyLCAkbG9jYXRpb25Qcm92aWRlciwgJHVpVmlld1Njcm9sbFByb3ZpZGVyLCAkaHR0cFByb3ZpZGVyKSB7XG5cbiAgICAvLyBUaGlzIHR1cm5zIG9mZiBoYXNoYmFuZyB1cmxzICgvI2Fib3V0KSBhbmQgY2hhbmdlcyBpdCB0byBzb21ldGhpbmcgbm9ybWFsICgvYWJvdXQpXG4gICAgJGxvY2F0aW9uUHJvdmlkZXIuaHRtbDVNb2RlKHRydWUpO1xuICAgIC8vIElmIHdlIGdvIHRvIGEgVVJMIHRoYXQgdWktcm91dGVyIGRvZXNuJ3QgaGF2ZSByZWdpc3RlcmVkLCBnbyB0byB0aGUgXCIvXCIgdXJsLlxuICAgICR1cmxSb3V0ZXJQcm92aWRlci5vdGhlcndpc2UoJy8nKTtcbiAgICAvLyAkdWlWaWV3U2Nyb2xsUHJvdmlkZXIudXNlQW5jaG9yU2Nyb2xsKCk7XG59KTtcbmFwcC5jb25maWcoZnVuY3Rpb24oJGF1dGhQcm92aWRlcikge1xuICAgICRhdXRoUHJvdmlkZXIuZmFjZWJvb2soe1xuICAgICAgICBjbGllbnRJZDogJ0ZhY2Vib29rIEFwcCBJRCdcbiAgICB9KTtcblxuICAgIC8vIE9wdGlvbmFsOiBGb3IgY2xpZW50LXNpZGUgdXNlIChJbXBsaWNpdCBHcmFudCksIHNldCByZXNwb25zZVR5cGUgdG8gJ3Rva2VuJ1xuICAgICRhdXRoUHJvdmlkZXIuZmFjZWJvb2soe1xuICAgICAgICBjbGllbnRJZDogJ0ZhY2Vib29rIEFwcCBJRCcsXG4gICAgICAgIHJlc3BvbnNlVHlwZTogJ3Rva2VuJ1xuICAgIH0pO1xuXG4gICAgJGF1dGhQcm92aWRlci5nb29nbGUoe1xuICAgICAgICBvcHRpb25hbFVybFBhcmFtczogWydhY2Nlc3NfdHlwZSddLFxuICAgICAgICBhY2Nlc3NUeXBlOiAnb2ZmbGluZScsXG4gICAgICAgIHVybDogJy9hcGkvbG9naW4vZ29vZ2xlLycsXG4gICAgICAgIGNsaWVudElkOiAnOTIzODExOTU4NDY2LWt0aHRhYXRvZG9yNW1xcTBwZjV1YjZrbTltc2lpODJnLmFwcHMuZ29vZ2xldXNlcmNvbnRlbnQuY29tJyxcbiAgICAgICAgc2NvcGU6IFsnaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vYXV0aC95b3V0dWJlcGFydG5lci1jaGFubmVsLWF1ZGl0JywgJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL2F1dGgveW91dHViZSddLFxuICAgICAgICByZWRpcmVjdFVyaTogd2luZG93LmxvY2F0aW9uLm9yaWdpbiArICcvYW5hbHl0aWNzJ1xuICAgIH0pO1xuICAgIC8vIHJlZGlyZWN0VXJpOiB3aW5kb3cubG9jYXRpb24ub3JpZ2luKycvYW5hbHl0aWNzJ1xuICAgIC8vICAgIHJlc3BvbnNlVHlwZTogJ3Rva2VuJ1xuICAgICRhdXRoUHJvdmlkZXIuZ2l0aHViKHtcbiAgICAgICAgY2xpZW50SWQ6ICdHaXRIdWIgQ2xpZW50IElEJ1xuICAgIH0pO1xuXG4gICAgJGF1dGhQcm92aWRlci5saW5rZWRpbih7XG4gICAgICAgIGNsaWVudElkOiAnTGlua2VkSW4gQ2xpZW50IElEJ1xuICAgIH0pO1xuXG4gICAgJGF1dGhQcm92aWRlci5pbnN0YWdyYW0oe1xuICAgICAgICBjbGllbnRJZDogJ2FlODQ5Njg5OTNmYzRhZGY5YjJjZDI0NmI3NjNiZjZiJyxcbiAgICAgICAgcmVzcG9uc2VUeXBlOiAndG9rZW4nXG4gICAgfSk7XG5cbiAgICAkYXV0aFByb3ZpZGVyLnlhaG9vKHtcbiAgICAgICAgY2xpZW50SWQ6ICdZYWhvbyBDbGllbnQgSUQgLyBDb25zdW1lciBLZXknXG4gICAgfSk7XG5cbiAgICAkYXV0aFByb3ZpZGVyLmxpdmUoe1xuICAgICAgICBjbGllbnRJZDogJ01pY3Jvc29mdCBDbGllbnQgSUQnXG4gICAgfSk7XG5cbiAgICAkYXV0aFByb3ZpZGVyLnR3aXRjaCh7XG4gICAgICAgIGNsaWVudElkOiAnNzI3NDE5MDAyNTExNzQ1MDI0J1xuICAgIH0pO1xuXG4gICAgJGF1dGhQcm92aWRlci5iaXRidWNrZXQoe1xuICAgICAgICBjbGllbnRJZDogJ0JpdGJ1Y2tldCBDbGllbnQgSUQnXG4gICAgfSk7XG5cblxuICAgIC8vIE5vIGFkZGl0aW9uYWwgc2V0dXAgcmVxdWlyZWQgZm9yIFR3aXR0ZXJcblxuICAgICRhdXRoUHJvdmlkZXIub2F1dGgyKHtcbiAgICAgICAgbmFtZTogJ2ZvdXJzcXVhcmUnLFxuICAgICAgICB1cmw6ICcvYXV0aC9mb3Vyc3F1YXJlJyxcbiAgICAgICAgY2xpZW50SWQ6ICdGb3Vyc3F1YXJlIENsaWVudCBJRCcsXG4gICAgICAgIHJlZGlyZWN0VXJpOiB3aW5kb3cubG9jYXRpb24ub3JpZ2luLFxuICAgICAgICBhdXRob3JpemF0aW9uRW5kcG9pbnQ6ICdodHRwczovL2ZvdXJzcXVhcmUuY29tL29hdXRoMi9hdXRoZW50aWNhdGUnLFxuICAgIH0pO1xufSk7XG4vLyBUaGlzIGFwcC5ydW4gaXMgZm9yIGNvbnRyb2xsaW5nIGFjY2VzcyB0byBzcGVjaWZpYyBzdGF0ZXMuXG5hcHAucnVuKGZ1bmN0aW9uKCRyb290U2NvcGUsICR3aW5kb3csICRodHRwLCBBdXRoU2VydmljZSwgJHN0YXRlLCAkdWlWaWV3U2Nyb2xsLCBTZXNzaW9uU2VydmljZSwgQXBwQ29uZmlnKSB7XG5cbiAgICAvLyBUaGUgZ2l2ZW4gc3RhdGUgcmVxdWlyZXMgYW4gYXV0aGVudGljYXRlZCB1c2VyLlxuICAgIC8vIHZhciBkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBdXRoID0gZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgLy8gICAgIHJldHVybiBzdGF0ZS5kYXRhICYmIHN0YXRlLmRhdGEuYXV0aGVudGljYXRlO1xuICAgIC8vIH07XG5cbiAgICBBcHBDb25maWcuZmV0Y2hDb25maWcoKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhyZXMpO1xuICAgICAgICBBcHBDb25maWcuc2V0Q29uZmlnKHJlcy5kYXRhKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coQXBwQ29uZmlnLmlzQ29uZmlnUGFyYW1zdmFpbGFibGUpO1xuICAgIH0pXG5cbiAgICAvLyAkc3RhdGVDaGFuZ2VTdGFydCBpcyBhbiBldmVudCBmaXJlZFxuICAgIC8vIHdoZW5ldmVyIHRoZSBwcm9jZXNzIG9mIGNoYW5naW5nIGEgc3RhdGUgYmVnaW5zLlxuICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcykge1xuICAgICAgICBpZiAodG9TdGF0ZS5uYW1lID09ICdyZUZvclJlSW50ZXJhY3Rpb24nKSB7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLnN0YXRlID0gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLnN0YXRlID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICAvLyBpZih0b1N0YXRlID0gJ2FydGlzdFRvb2xzJykge1xuICAgICAgICAvLyAgICAgdmFyIHVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyh1c2VyKTtcbiAgICAgICAgLy8gfVxuICAgICAgICAvLyBjb25zb2xlLmxvZygncmVhY2hlZCBoZXJlJyk7XG4gICAgICAgIC8vIGlmICghZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCh0b1N0YXRlKSkge1xuICAgICAgICAvLyAgICAgLy8gVGhlIGRlc3RpbmF0aW9uIHN0YXRlIGRvZXMgbm90IHJlcXVpcmUgYXV0aGVudGljYXRpb25cbiAgICAgICAgLy8gICAgIC8vIFNob3J0IGNpcmN1aXQgd2l0aCByZXR1cm4uXG4gICAgICAgIC8vICAgICByZXR1cm47XG4gICAgICAgIC8vIH1cblxuICAgICAgICAvLyBpZiAoQXV0aFNlcnZpY2UuaXNBdXRoZW50aWNhdGVkKCkpIHtcbiAgICAgICAgLy8gICAgIC8vIFRoZSB1c2VyIGlzIGF1dGhlbnRpY2F0ZWQuXG4gICAgICAgIC8vICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAvLyAgICAgcmV0dXJuO1xuICAgICAgICAvLyB9XG5cbiAgICAgICAgLy8gLy8gQ2FuY2VsIG5hdmlnYXRpbmcgdG8gbmV3IHN0YXRlLlxuICAgICAgICAvLyBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgIC8vIEF1dGhTZXJ2aWNlLmdldExvZ2dlZEluVXNlcigpLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgLy8gICAgIC8vIElmIGEgdXNlciBpcyByZXRyaWV2ZWQsIHRoZW4gcmVuYXZpZ2F0ZSB0byB0aGUgZGVzdGluYXRpb25cbiAgICAgICAgLy8gICAgIC8vICh0aGUgc2Vjb25kIHRpbWUsIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpIHdpbGwgd29yaylcbiAgICAgICAgLy8gICAgIC8vIG90aGVyd2lzZSwgaWYgbm8gdXNlciBpcyBsb2dnZWQgaW4sIGdvIHRvIFwibG9naW5cIiBzdGF0ZS5cbiAgICAgICAgLy8gICAgIGlmICh1c2VyKSB7XG4gICAgICAgIC8vICAgICAgICAgJHN0YXRlLmdvKHRvU3RhdGUubmFtZSwgdG9QYXJhbXMpO1xuICAgICAgICAvLyAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gICAgICAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vIH0pO1xuXG4gICAgICAgIGlmICgkd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmluZGV4T2YoJ2FydGlzdFRvb2xzJykgIT0gLTEpIHtcbiAgICAgICAgICAgICRodHRwLmdldCgnL2FwaS91c2Vycy9pc1VzZXJBdXRoZW50aWNhdGUnKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgIGlmICghcmVzLmRhdGEpIHtcbiAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9sb2dpbic7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH07XG5cbiAgICB9KTtcblxuICAgIFNlc3Npb25TZXJ2aWNlLnJlZnJlc2hVc2VyKCk7XG5cbn0pO1xuYXBwLmRpcmVjdGl2ZSgnZmJMaWtlJywgW1xuICAgICckd2luZG93JywgJyRyb290U2NvcGUnLFxuICAgIGZ1bmN0aW9uKCR3aW5kb3csICRyb290U2NvcGUpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3RyaWN0OiAnQScsXG4gICAgICAgICAgICBzY29wZToge1xuICAgICAgICAgICAgICAgIGZiTGlrZTogJz0/J1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgICAgICAgICAgIGlmICghJHdpbmRvdy5GQikge1xuICAgICAgICAgICAgICAgICAgICAvLyBMb2FkIEZhY2Vib29rIFNESyBpZiBub3QgYWxyZWFkeSBsb2FkZWRcbiAgICAgICAgICAgICAgICAgICAgJC5nZXRTY3JpcHQoJy8vY29ubmVjdC5mYWNlYm9vay5uZXQvZW5fVVMvc2RrLmpzJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93LkZCLmluaXQoe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFwcElkOiAkcm9vdFNjb3BlLmZhY2Vib29rQXBwSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeGZibWw6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmVyc2lvbjogJ3YyLjAnXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxpa2VCdXR0b24oKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGlrZUJ1dHRvbigpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIHZhciB3YXRjaEFkZGVkID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICBmdW5jdGlvbiByZW5kZXJMaWtlQnV0dG9uKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoISFhdHRycy5mYkxpa2UgJiYgIXNjb3BlLmZiTGlrZSAmJiAhd2F0Y2hBZGRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gd2FpdCBmb3IgZGF0YSBpZiBpdCBoYXNuJ3QgbG9hZGVkIHlldFxuICAgICAgICAgICAgICAgICAgICAgICAgd2F0Y2hBZGRlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgdW5iaW5kV2F0Y2ggPSBzY29wZS4kd2F0Y2goJ2ZiTGlrZScsIGZ1bmN0aW9uKG5ld1ZhbHVlLCBvbGRWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChuZXdWYWx1ZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW5kZXJMaWtlQnV0dG9uKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb25seSBuZWVkIHRvIHJ1biBvbmNlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuYmluZFdhdGNoKCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQuaHRtbCgnPGRpdiBjbGFzcz1cImZiLWxpa2VcIicgKyAoISFzY29wZS5mYkxpa2UgPyAnIGRhdGEtaHJlZj1cIicgKyBzY29wZS5mYkxpa2UgKyAnXCInIDogJycpICsgJyBkYXRhLWxheW91dD1cImJ1dHRvbl9jb3VudFwiIGRhdGEtYWN0aW9uPVwibGlrZVwiIGRhdGEtc2hvdy1mYWNlcz1cInRydWVcIiBkYXRhLXNoYXJlPVwidHJ1ZVwiPjwvZGl2PicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5GQi5YRkJNTC5wYXJzZShlbGVtZW50LnBhcmVudCgpWzBdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5dKVxuXG5hcHAuY29udHJvbGxlcignRnVsbHN0YWNrR2VuZXJhdGVkQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJHN0YXRlLCAkaHR0cCwgbWFpblNlcnZpY2UsIFNlc3Npb25TZXJ2aWNlKSB7XG4gICAgLypMb2FkIE1vcmUqL1xuICAgICRzY29wZS5sb2FkTGlzdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAkc2NvcGUuJGJyb2FkY2FzdCgnbG9hZFRyYWRlcycpO1xuICAgIH1cblxuICAgICRzY29wZS5zaG93bm90aWZpY2F0aW9uID0gZmFsc2U7XG4gICAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICBtYWluU2VydmljZS5sb2dvdXQoKTtcbiAgICB9XG4gICAgJHNjb3BlLmFkbWlubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIG1haW5TZXJ2aWNlLmFkbWlubG9nb3V0KCk7XG4gICAgfVxuXG4gICAgJHNjb3BlLmNoZWNrTm90aWZpY2F0aW9uID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciB1c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xuICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS90cmFkZXMvd2l0aFVzZXIvJyArIHVzZXIuX2lkKVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdHJhZGVzID0gcmVzLmRhdGE7XG4gICAgICAgICAgICAgICAgICAgIHRyYWRlcy5mb3JFYWNoKGZ1bmN0aW9uKHRyYWRlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJhZGUucDEudXNlci5faWQgPT0gdXNlci5faWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAodHJhZGUucDEuYWxlcnQgPT0gXCJjaGFuZ2VcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuc2hvd25vdGlmaWNhdGlvbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRyYWRlLnAyLnVzZXIuX2lkID09IHVzZXIuX2lkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHRyYWRlLnAyLmFsZXJ0ID09IFwiY2hhbmdlXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnNob3dub3RpZmljYXRpb24gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgIH1cblxuICAgICRzY29wZS5saW5rZWRVc2Vyc0NoYW5nZSA9IGZ1bmN0aW9uKGxpbmtlZFVzZXJzKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICAgJGh0dHAucG9zdCgnL2FwaS9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJGh0dHAucG9zdChcIi9hcGkvbG9naW4vdGhpcmRQYXJ0eWxvZ2luXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgdXNlcm5hbWU6IGxpbmtlZFVzZXJzLnVzZXJuYW1lLFxuICAgICAgICAgICAgICAgICAgICBwYXNzd29yZDogbGlua2VkVXNlcnMucGFzc3dvcmRcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzLmRhdGEudXNlcikge1xuICAgICAgICAgICAgICAgICAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlKHJlcy5kYXRhLnVzZXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJXcm9uZyB0aGlyZCBwYXJ0eSBhY2Nlc3MgY3JlZGVudGlhbHMuXCIsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkNsb3NlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBsb2NhdGlvbi5yZWxvYWQoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKFwiRXJyb3IgaW4gcHJvY2Vzc2luZyB0aGUgcmVxdWVzdC4gUGxlYXNlIHRyeSBhZ2Fpbi5cIik7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICAkc2NvcGUuY2hlY2tOb3RpZmljYXRpb24oKTtcbn0pO1xuXG5hcHAuZGlyZWN0aXZlKCdmYkxpa2UnLCBbXG4gICAgJyR3aW5kb3cnLCAnJHJvb3RTY29wZScsXG4gICAgZnVuY3Rpb24oJHdpbmRvdywgJHJvb3RTY29wZSkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcmVzdHJpY3Q6ICdBJyxcbiAgICAgICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICAgICAgZmJMaWtlOiAnPT8nXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGluazogZnVuY3Rpb24oc2NvcGUsIGVsZW1lbnQsIGF0dHJzKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEkd2luZG93LkZCKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIExvYWQgRmFjZWJvb2sgU0RLIGlmIG5vdCBhbHJlYWR5IGxvYWRlZFxuICAgICAgICAgICAgICAgICAgICAkLmdldFNjcmlwdCgnLy9jb25uZWN0LmZhY2Vib29rLm5ldC9lbl9VUy9zZGsuanMnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cuRkIuaW5pdCh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYXBwSWQ6ICRyb290U2NvcGUuZmFjZWJvb2tBcHBJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4ZmJtbDogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uOiAndjIuMCdcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVuZGVyTGlrZUJ1dHRvbigpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZW5kZXJMaWtlQnV0dG9uKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgdmFyIHdhdGNoQWRkZWQgPSBmYWxzZTtcblxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIHJlbmRlckxpa2VCdXR0b24oKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICghIWF0dHJzLmZiTGlrZSAmJiAhc2NvcGUuZmJMaWtlICYmICF3YXRjaEFkZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB3YWl0IGZvciBkYXRhIGlmIGl0IGhhc24ndCBsb2FkZWQgeWV0XG4gICAgICAgICAgICAgICAgICAgICAgICB3YXRjaEFkZGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB1bmJpbmRXYXRjaCA9IHNjb3BlLiR3YXRjaCgnZmJMaWtlJywgZnVuY3Rpb24obmV3VmFsdWUsIG9sZFZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG5ld1ZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlbmRlckxpa2VCdXR0b24oKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBvbmx5IG5lZWQgdG8gcnVuIG9uY2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdW5iaW5kV2F0Y2goKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZWxlbWVudC5odG1sKCc8ZGl2IGNsYXNzPVwiZmItbGlrZVwiJyArICghIXNjb3BlLmZiTGlrZSA/ICcgZGF0YS1ocmVmPVwiJyArIHNjb3BlLmZiTGlrZSArICdcIicgOiAnJykgKyAnIGRhdGEtbGF5b3V0PVwiYnV0dG9uX2NvdW50XCIgZGF0YS1hY3Rpb249XCJsaWtlXCIgZGF0YS1zaG93LWZhY2VzPVwidHJ1ZVwiIGRhdGEtc2hhcmU9XCJ0cnVlXCI+PC9kaXY+Jyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAkd2luZG93LkZCLlhGQk1MLnBhcnNlKGVsZW1lbnQucGFyZW50KClbMF0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbl0pXG5cbmFwcC5kaXJlY3RpdmUoJ2ZpbGVyZWFkJywgW2Z1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHNjb3BlOiB7XG4gICAgICAgICAgICBmaWxlcmVhZDogJz0nLFxuICAgICAgICAgICAgbWVzc2FnZTogJz0nXG4gICAgICAgIH0sXG4gICAgICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRyaWJ1dGVzKSB7XG4gICAgICAgICAgICBlbGVtZW50LmJpbmQoJ2NoYW5nZScsIGZ1bmN0aW9uKGNoYW5nZUV2ZW50KSB7XG4gICAgICAgICAgICAgICAgc2NvcGUuJGFwcGx5KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS5tZXNzYWdlID0ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWw6ICcnXG4gICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoYW5nZUV2ZW50LnRhcmdldC5maWxlc1swXS50eXBlICE9IFwiYXVkaW8vbXBlZ1wiICYmIGNoYW5nZUV2ZW50LnRhcmdldC5maWxlc1swXS50eXBlICE9IFwiYXVkaW8vbXAzXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWw6ICdFcnJvcjogUGxlYXNlIHVwbG9hZCBtcDMgZm9ybWF0IGZpbGUuJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGVsZW1lbnQudmFsKG51bGwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGNoYW5nZUV2ZW50LnRhcmdldC5maWxlc1swXS5zaXplID4gMjAgKiAxMDAwICogMTAwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2aXNpYmxlOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhbDogJ0Vycm9yOiBQbGVhc2UgdXBsb2FkIGZpbGUgdXB0byAyMCBNQiBzaXplLidcbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgICAgICBlbGVtZW50LnZhbChudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzY29wZS5maWxlcmVhZCA9IGNoYW5nZUV2ZW50LnRhcmdldC5maWxlc1swXTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxufV0pO1xuXG5hcHAuc2VydmljZSgnbWFpblNlcnZpY2UnLCBmdW5jdGlvbigkaHR0cCwgU2Vzc2lvblNlcnZpY2UpIHtcbiAgICAvLyB0aGlzLm9wZW5IZWxwTW9kYWwgPSBmdW5jdGlvbigpIHtcbiAgICAvLyAgICAgdmFyIGRpc3BsYXlUZXh0ID0gXCJIZXkhIFRoYW5rcyBmb3IgdXNpbmcgYXJ0aXN0IHRvb2xzISBQbGVhc2Ugc3VibWl0IGFueSBxdWVzdGlvbnMgeW91IGhhdmUgYnkgY2xpY2tpbmcgJ1N1cHBvcnQnIDxicj48YnI+PGEgaHJlZj0nbWFpbHRvOmNvYXlzY3VlQGFydGlzdHN1bmxpbWl0ZWQuY28/c3ViamVjdD1BcnRpc3RzIFVubGltaXRlZCBIZWxwJyB0YXJnZXQ9J190b3AnPlN1cHBvcnQ8L2E+XCI7XG4gICAgLy8gICAgICQuWmVicmFfRGlhbG9nKGRpc3BsYXlUZXh0LCB7XG4gICAgLy8gICAgICAgICB3aWR0aDogNjAwXG4gICAgLy8gICAgIH0pO1xuICAgIC8vIH1cbiAgICB0aGlzLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAkaHR0cC5wb3N0KCcvYXBpL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBTZXNzaW9uU2VydmljZS5kZWxldGVVc2VyKCk7XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvbG9naW4nO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgdGhpcy5hZG1pbmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAkaHR0cC5wb3N0KCcvYXBpL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBTZXNzaW9uU2VydmljZS5kZWxldGVVc2VyKCk7XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4nO1xuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxuLypMb2FkIG1vcmUqL1xuYXBwLmRpcmVjdGl2ZSgnd2hlblNjcm9sbGVkJywgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHNjb3BlLCBlbG0sIGF0dHIpIHtcbiAgICAgICAgdmFyIHJhdyA9IGVsbVswXTtcbiAgICAgICAgZWxtLmJpbmQoJ3Njcm9sbCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgaWYgKHJhdy5zY3JvbGxUb3AgKyByYXcub2Zmc2V0SGVpZ2h0ID49IHJhdy5zY3JvbGxIZWlnaHQpIHtcbiAgICAgICAgICAgICAgICBzY29wZS4kYXBwbHkoYXR0ci53aGVuU2Nyb2xsZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xufSk7IiwiYXBwLnNlcnZpY2UoJ2FjY291bnRTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKSB7XG5cblx0ZnVuY3Rpb24gZGVsZXRlVXNlckFjY291bnQoaWQpIHtcblx0XHRyZXR1cm4gJGh0dHAoe1xuXHRcdFx0XHRtZXRob2Q6ICdwdXQnLFxuXHRcdFx0XHR1cmw6ICcvYXBpL2RhdGFiYXNlL2RlbGV0ZVVzZXJBY2NvdW50LycgKyBpZFxuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSl7XG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0fSk7XG5cdH1cblxuXG5cblx0cmV0dXJuIHtcblx0XHRkZWxldGVVc2VyQWNjb3VudDogZGVsZXRlVXNlckFjY291bnRcblx0XHRcblx0fTtcbn1dKTsiLCJhcHAuc2VydmljZSgnY3VzdG9taXplU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbigkaHR0cCkge1xuXHRmdW5jdGlvbiBhZGRDdXN0b21pemUoZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2N1c3RvbXN1Ym1pc3Npb25zL2FkZEN1c3RvbVN1Ym1pc3Npb24nLCBkYXRhKTtcblx0fVxuICBcdGZ1bmN0aW9uIHVwbG9hZEZpbGUoZGF0YSkge1xuXHRcdHZhciBmZCA9IG5ldyBGb3JtRGF0YSgpO1xuXHRcdGZkLmFwcGVuZCgnZmlsZScsIGRhdGEpO1xuXHRcdHJldHVybiAkaHR0cCh7XG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdHVybDogJy9hcGkvYXdzJyxcblx0XHRcdGhlYWRlcnM6IHsnQ29udGVudC1UeXBlJzogdW5kZWZpbmVkIH0sXG5cdFx0XHR0cmFuZm9ybVJlcXVlc3Q6IGFuZ3VsYXIuaWRlbnRpZnksXG5cdFx0XHRkYXRhOiBmZFxuXHRcdH0pXG5cdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKXtcblx0XHRcdGNvbnNvbGUubG9nKFwic2VydmljZSByZXNcIixyZXNwb25zZSk7XG5cdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHR9KTtcblx0fVxuXHRmdW5jdGlvbiBnZXRDdXN0b21QYWdlU2V0dGluZ3ModXNlcklEKXtcblx0XHRyZXR1cm4gJGh0dHAoe1xuXHRcdFx0bWV0aG9kOiAnR0VUJyxcblx0XHRcdHVybDogJy9hcGkvY3VzdG9tc3VibWlzc2lvbnMvZ2V0Q3VzdG9tU3VibWlzc2lvbi8nK3VzZXJJRFxuXHRcdH0pXG5cdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKXtcblx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdH0pO1xuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRhZGRDdXN0b21pemU6IGFkZEN1c3RvbWl6ZSxcblx0XHR1cGxvYWRGaWxlOnVwbG9hZEZpbGUsXG5cdFx0Z2V0Q3VzdG9tUGFnZVNldHRpbmdzOiBnZXRDdXN0b21QYWdlU2V0dGluZ3Ncblx0fTtcbn1dKTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkYXRhYmFzZScsIHtcbiAgICB1cmw6ICcvYWRtaW4vZGF0YWJhc2UnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvZGF0YWJhc2UvZGF0YWJhc2UuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0RhdGFiYXNlQ29udHJvbGxlcidcbiAgfSk7XG59KTtcblxuYXBwLmRpcmVjdGl2ZSgnbm90aWZpY2F0aW9uQmFyJywgWydzb2NrZXQnLCBmdW5jdGlvbihzb2NrZXQpIHtcbiAgcmV0dXJuIHtcbiAgICByZXN0cmljdDogJ0VBJyxcbiAgICBzY29wZTogdHJ1ZSxcbiAgICB0ZW1wbGF0ZTogJzxkaXYgc3R5bGU9XCJtYXJnaW46IDAgYXV0bzt3aWR0aDo1MCVcIiBuZy1zaG93PVwiYmFyLnZpc2libGVcIj4nICtcbiAgICAgICc8dWliLXByb2dyZXNzPjx1aWItYmFyIHZhbHVlPVwiYmFyLnZhbHVlXCIgdHlwZT1cInt7YmFyLnR5cGV9fVwiPjxzcGFuPnt7YmFyLnZhbHVlfX0lPC9zcGFuPjwvdWliLWJhcj48L3VpYi1wcm9ncmVzcz4nICtcbiAgICAgICc8L2Rpdj4nLFxuICAgIGxpbms6IGZ1bmN0aW9uKCRzY29wZSwgaUVsbSwgaUF0dHJzLCBjb250cm9sbGVyKSB7XG4gICAgICBzb2NrZXQub24oJ25vdGlmaWNhdGlvbicsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICAgdmFyIHBlcmNlbnRhZ2UgPSBwYXJzZUludChNYXRoLmZsb29yKGRhdGEuY291bnRlciAvIGRhdGEudG90YWwgKiAxMDApLCAxMCk7XG4gICAgICAgICRzY29wZS5iYXIudmFsdWUgPSBwZXJjZW50YWdlO1xuICAgICAgICBpZiAocGVyY2VudGFnZSA9PT0gMTAwKSB7XG4gICAgICAgICAgJHNjb3BlLmJhci52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgICAgJHNjb3BlLmJhci52YWx1ZSA9IDA7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbn1dKTtcblxuYXBwLmNvbnRyb2xsZXIoJ0RhdGFiYXNlQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgQXV0aFNlcnZpY2UsIFNlc3Npb25TZXJ2aWNlLCBzb2NrZXQpIHtcbiAgaWYgKCFTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkpIHtcbiAgICAkc3RhdGUuZ28oJ2FkbWluJyk7XG4gIH1cbiAgJHNjb3BlLmFkZFVzZXIgPSB7fTtcbiAgJHNjb3BlLnF1ZXJ5ID0ge307XG4gICRzY29wZS50cmRVc3JRdWVyeSA9IHt9O1xuICAkc2NvcGUucXVlcnlDb2xzID0gW3tcbiAgICBuYW1lOiAndXNlcm5hbWUnLFxuICAgIHZhbHVlOiAndXNlcm5hbWUnXG4gIH0sIHtcbiAgICBuYW1lOiAnZ2VucmUnLFxuICAgIHZhbHVlOiAnZ2VucmUnXG4gIH0sIHtcbiAgICBuYW1lOiAnbmFtZScsXG4gICAgdmFsdWU6ICduYW1lJ1xuICB9LCB7XG4gICAgbmFtZTogJ1VSTCcsXG4gICAgdmFsdWU6ICdzY1VSTCdcbiAgfSwge1xuICAgIG5hbWU6ICdlbWFpbCcsXG4gICAgdmFsdWU6ICdlbWFpbCdcbiAgfSwge1xuICAgIG5hbWU6ICdkZXNjcmlwdGlvbicsXG4gICAgdmFsdWU6ICdkZXNjcmlwdGlvbidcbiAgfSwge1xuICAgIG5hbWU6ICdmb2xsb3dlcnMnLFxuICAgIHZhbHVlOiAnZm9sbG93ZXJzJ1xuICB9LCB7XG4gICAgbmFtZTogJ251bWJlciBvZiB0cmFja3MnLFxuICAgIHZhbHVlOiAnbnVtVHJhY2tzJ1xuICB9LCB7XG4gICAgbmFtZTogJ2ZhY2Vib29rJyxcbiAgICB2YWx1ZTogJ2ZhY2Vib29rVVJMJ1xuICB9LCB7XG4gICAgbmFtZTogJ2luc3RhZ3JhbScsXG4gICAgdmFsdWU6ICdpbnN0YWdyYW1VUkwnXG4gIH0sIHtcbiAgICBuYW1lOiAndHdpdHRlcicsXG4gICAgdmFsdWU6ICd0d2l0dGVyVVJMJ1xuICB9LCB7XG4gICAgbmFtZTogJ3lvdXR1YmUnLFxuICAgIHZhbHVlOiAneW91dHViZVVSTCdcbiAgfSwge1xuICAgIG5hbWU6ICd3ZWJzaXRlcycsXG4gICAgdmFsdWU6ICd3ZWJzaXRlcydcbiAgfSwge1xuICAgIG5hbWU6ICdhdXRvIGVtYWlsIGRheScsXG4gICAgdmFsdWU6ICdlbWFpbERheU51bSdcbiAgfSwge1xuICAgIG5hbWU6ICdhbGwgZW1haWxzJyxcbiAgICB2YWx1ZTogJ2FsbEVtYWlscydcbiAgfV07XG4gICRzY29wZS5kb3dubG9hZEJ1dHRvblZpc2libGUgPSBmYWxzZTtcbiAgJHNjb3BlLnRyYWNrID0ge1xuICAgIHRyYWNrVXJsOiAnJyxcbiAgICBkb3dubG9hZFVybDogJycsXG4gICAgZW1haWw6ICcnXG4gIH07XG4gICRzY29wZS5iYXIgPSB7XG4gICAgdHlwZTogJ3N1Y2Nlc3MnLFxuICAgIHZhbHVlOiAwLFxuICAgIHZpc2libGU6IGZhbHNlXG4gIH07XG4gICRzY29wZS5wYWlkUmVwb3N0ID0ge1xuICAgIHNvdW5kQ2xvdWRVcmw6ICcnXG4gIH07XG5cbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICRodHRwLmdldCgnL2FwaS9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgU2Vzc2lvblNlcnZpY2UuZGVsZXRlVXNlcigpO1xuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2FkbWluJztcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAkLlplYnJhX0RpYWxvZygnV3JvbmcgUGFzc3dvcmQnKTtcbiAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5zYXZlQWRkVXNlciA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkc2NvcGUuYWRkVXNlci5wYXNzd29yZCA9ICRyb290U2NvcGUucGFzc3dvcmQ7XG4gICAgJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS9hZGR1c2VyJywgJHNjb3BlLmFkZFVzZXIpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJTdWNjZXNzOiBEYXRhYmFzZSBpcyBiZWluZyBwb3B1bGF0ZWQuIFlvdSB3aWxsIGJlIGVtYWlsZWQgd2hlbiBpdCBpcyBjb21wbGV0ZS5cIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5iYXIudmlzaWJsZSA9IHRydWU7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgICAkLlplYnJhX0RpYWxvZygnQmFkIHN1Ym1pc3Npb24nKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmNyZWF0ZVVzZXJRdWVyeURvYyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBxdWVyeSA9IHt9O1xuICAgIGlmICgkc2NvcGUucXVlcnkuYXJ0aXN0ID09IFwiYXJ0aXN0c1wiKSB7XG4gICAgICBxdWVyeS5hcnRpc3QgPSB0cnVlO1xuICAgIH0gZWxzZSBpZiAoJHNjb3BlLnF1ZXJ5LmFydGlzdCA9PSBcIm5vbi1hcnRpc3RzXCIpIHtcbiAgICAgIHF1ZXJ5LmFydGlzdCA9IGZhbHNlO1xuICAgIH1cbiAgICB2YXIgZmx3clFyeSA9IHt9O1xuICAgIGlmICgkc2NvcGUucXVlcnkuZm9sbG93ZXJzR1QpIHtcbiAgICAgIGZsd3JRcnkuJGd0ID0gJHNjb3BlLnF1ZXJ5LmZvbGxvd2Vyc0dUO1xuICAgICAgcXVlcnkuZm9sbG93ZXJzID0gZmx3clFyeTtcbiAgICB9XG4gICAgaWYgKCRzY29wZS5xdWVyeS5mb2xsb3dlcnNMVCkge1xuICAgICAgZmx3clFyeS4kbHQgPSAkc2NvcGUucXVlcnkuZm9sbG93ZXJzTFQ7XG4gICAgICBxdWVyeS5mb2xsb3dlcnMgPSBmbHdyUXJ5O1xuICAgIH1cbiAgICBpZiAoJHNjb3BlLnF1ZXJ5LmdlbnJlKSBxdWVyeS5nZW5yZSA9ICRzY29wZS5xdWVyeS5nZW5yZTtcbiAgICBpZiAoJHNjb3BlLnF1ZXJ5Q29scykge1xuICAgICAgcXVlcnkuY29sdW1ucyA9ICRzY29wZS5xdWVyeUNvbHMuZmlsdGVyKGZ1bmN0aW9uKGVsbSkge1xuICAgICAgICByZXR1cm4gZWxtLnZhbHVlICE9PSBudWxsO1xuICAgICAgfSkubWFwKGZ1bmN0aW9uKGVsbSkge1xuICAgICAgICByZXR1cm4gZWxtLnZhbHVlO1xuICAgICAgfSk7XG4gICAgfVxuICAgIGlmICgkc2NvcGUucXVlcnkudHJhY2tlZFVzZXJzVVJMKSBxdWVyeS50cmFja2VkVXNlcnNVUkwgPSAkc2NvcGUucXVlcnkudHJhY2tlZFVzZXJzVVJMO1xuICAgIHZhciBib2R5ID0ge1xuICAgICAgcXVlcnk6IHF1ZXJ5LFxuICAgICAgcGFzc3dvcmQ6ICRyb290U2NvcGUucGFzc3dvcmRcbiAgICB9O1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL2ZvbGxvd2VycycsIGJvZHkpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHNjb3BlLmZpbGVuYW1lID0gcmVzLmRhdGE7XG4gICAgICAgICRzY29wZS5kb3dubG9hZEJ1dHRvblZpc2libGUgPSB0cnVlO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkVSUk9SOiBCYWQgUXVlcnkgb3IgTm8gTWF0Y2hlc1wiKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmNyZWF0ZVRyZFVzclF1ZXJ5RG9jID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHF1ZXJ5ID0ge307XG4gICAgdmFyIGZsd3JRcnkgPSB7fTtcbiAgICBpZiAoJHNjb3BlLnRyZFVzclF1ZXJ5LmZvbGxvd2Vyc0dUKSB7XG4gICAgICBmbHdyUXJ5LiRndCA9ICRzY29wZS50cmRVc3JRdWVyeS5mb2xsb3dlcnNHVDtcbiAgICAgIHF1ZXJ5LmZvbGxvd2VycyA9IGZsd3JRcnk7XG4gICAgfVxuICAgIGlmICgkc2NvcGUudHJkVXNyUXVlcnkuZm9sbG93ZXJzTFQpIHtcbiAgICAgIGZsd3JRcnkuJGx0ID0gJHNjb3BlLnRyZFVzclF1ZXJ5LmZvbGxvd2Vyc0xUO1xuICAgICAgcXVlcnkuZm9sbG93ZXJzID0gZmx3clFyeTtcbiAgICB9XG4gICAgaWYgKCRzY29wZS50cmRVc3JRdWVyeS5nZW5yZSkgcXVlcnkuZ2VucmUgPSAkc2NvcGUudHJkVXNyUXVlcnkuZ2VucmU7XG4gICAgdmFyIGJvZHkgPSB7XG4gICAgICBxdWVyeTogcXVlcnksXG4gICAgICBwYXNzd29yZDogJHJvb3RTY29wZS5wYXNzd29yZFxuICAgIH07XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvdHJhY2tlZFVzZXJzJywgYm9keSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUudHJkVXNyRmlsZW5hbWUgPSByZXMuZGF0YTtcbiAgICAgICAgJHNjb3BlLmRvd25sb2FkVHJkVXNyQnV0dG9uVmlzaWJsZSA9IHRydWU7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICQuWmVicmFfRGlhbG9nKFwiRVJST1I6IEJhZCBRdWVyeSBvciBObyBNYXRjaGVzXCIpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUuZG93bmxvYWQgPSBmdW5jdGlvbihmaWxlbmFtZSkge1xuICAgIHZhciBhbmNob3IgPSBhbmd1bGFyLmVsZW1lbnQoJzxhLz4nKTtcbiAgICBhbmNob3IuYXR0cih7XG4gICAgICBocmVmOiBmaWxlbmFtZSxcbiAgICAgIGRvd25sb2FkOiBmaWxlbmFtZVxuICAgIH0pWzBdLmNsaWNrKCk7XG4gICAgJHNjb3BlLmRvd25sb2FkQnV0dG9uVmlzaWJsZSA9IGZhbHNlO1xuICAgICRzY29wZS5kb3dubG9hZFRyZFVzckJ1dHRvblZpc2libGUgPSBmYWxzZTtcbiAgfVxuXG4gICRzY29wZS5zYXZlUGFpZFJlcG9zdENoYW5uZWwgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS9wYWlkcmVwb3N0JywgJHNjb3BlLnBhaWRSZXBvc3QpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHNjb3BlLnBhaWRSZXBvc3QgPSB7XG4gICAgICAgICAgc291bmRDbG91ZFVybDogJydcbiAgICAgICAgfTtcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJTVUNDRVNTOiBVcmwgc2F2ZWQgc3VjY2Vzc2Z1bGx5XCIpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkVSUk9SOiBFcnJvciBpbiBzYXZpbmcgdXJsXCIpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gIH1cblxuICAvKiBMaXN0ZW4gdG8gc29ja2V0IGV2ZW50cyAqL1xuICBzb2NrZXQub24oJ25vdGlmaWNhdGlvbicsIGZ1bmN0aW9uKGRhdGEpIHtcbiAgICB2YXIgcGVyY2VudGFnZSA9IHBhcnNlSW50KE1hdGguZmxvb3IoZGF0YS5jb3VudGVyIC8gZGF0YS50b3RhbCAqIDEwMCksIDEwKTtcbiAgICAkc2NvcGUuYmFyLnZhbHVlID0gcGVyY2VudGFnZTtcbiAgICBpZiAocGVyY2VudGFnZSA9PT0gMTAwKSB7XG4gICAgICAkc2NvcGUuc3RhdHVzQmFyVmlzaWJsZSA9IGZhbHNlO1xuICAgICAgJHNjb3BlLmJhci52YWx1ZSA9IDA7XG4gICAgfVxuICB9KTtcbn0pOyIsIihmdW5jdGlvbigpIHtcblxuICAgICd1c2Ugc3RyaWN0JztcbiAgICAvLyBIb3BlIHlvdSBkaWRuJ3QgZm9yZ2V0IEFuZ3VsYXIhIER1aC1kb3kuXG4gICAgaWYgKCF3aW5kb3cuYW5ndWxhcikgdGhyb3cgbmV3IEVycm9yKCdJIGNhblxcJ3QgZmluZCBBbmd1bGFyIScpO1xuXG4gICAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdmc2FQcmVCdWlsdCcsIFtdKTtcblxuICAgIGFwcC5mYWN0b3J5KCdpbml0U29ja2V0JywgZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghd2luZG93LmlvKSB0aHJvdyBuZXcgRXJyb3IoJ3NvY2tldC5pbyBub3QgZm91bmQhJyk7XG4gICAgICAgIHJldHVybiB3aW5kb3cuaW8od2luZG93LmxvY2F0aW9uLm9yaWdpbik7XG4gICAgfSk7XG5cbiAgICBhcHAuZmFjdG9yeSgnc29ja2V0JywgZnVuY3Rpb24oJHJvb3RTY29wZSwgaW5pdFNvY2tldCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgb246IGZ1bmN0aW9uKGV2ZW50TmFtZSwgY2FsbGJhY2spIHtcbiAgICAgICAgICAgICAgICBpbml0U29ja2V0Lm9uKGV2ZW50TmFtZSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KGluaXRTb2NrZXQsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBlbWl0OiBmdW5jdGlvbihldmVudE5hbWUsIGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICAgICAgICAgICAgaW5pdFNvY2tldC5lbWl0KGV2ZW50TmFtZSwgZGF0YSwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KGluaXRTb2NrZXQsIGFyZ3MpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXBwLmZhY3RvcnkoJ0FwcENvbmZpZycsIGZ1bmN0aW9uKCRodHRwKSB7XG4gICAgICAgIHZhciBfY29uZmlnUGFyYW1zID0gbnVsbDtcblxuICAgICAgICBmdW5jdGlvbiBmZXRjaENvbmZpZygpIHtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvc291bmRjbG91ZC9zb3VuZGNsb3VkQ29uZmlnJyk7XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBzZXRDb25maWcoZGF0YSkge1xuICAgICAgICAgICAgX2NvbmZpZ1BhcmFtcyA9IGRhdGE7XG4gICAgICAgICAgICBTQy5pbml0aWFsaXplKHtcbiAgICAgICAgICAgICAgICBjbGllbnRfaWQ6IGRhdGEuY2xpZW50SUQsXG4gICAgICAgICAgICAgICAgcmVkaXJlY3RfdXJpOiBkYXRhLmNhbGxiYWNrVVJMLFxuICAgICAgICAgICAgICAgIHNjb3BlOiBcIm5vbi1leHBpcmluZ1wiXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdldENvbmZpZygpIHtcbiAgICAgICAgICAgIHJldHVybiBfY29uZmlnUGFyYW1zO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZldGNoQ29uZmlnOiBmZXRjaENvbmZpZyxcbiAgICAgICAgICAgIGdldENvbmZpZzogZ2V0Q29uZmlnLFxuICAgICAgICAgICAgc2V0Q29uZmlnOiBzZXRDb25maWdcbiAgICAgICAgfTtcbiAgICB9KTtcblxuXG4gICAgLy8gQVVUSF9FVkVOVFMgaXMgdXNlZCB0aHJvdWdob3V0IG91ciBhcHAgdG9cbiAgICAvLyBicm9hZGNhc3QgYW5kIGxpc3RlbiBmcm9tIGFuZCB0byB0aGUgJHJvb3RTY29wZVxuICAgIC8vIGZvciBpbXBvcnRhbnQgZXZlbnRzIGFib3V0IGF1dGhlbnRpY2F0aW9uIGZsb3cuXG4gICAgLy8gYXBwLmNvbnN0YW50KCdBVVRIX0VWRU5UUycsIHtcbiAgICAvLyAgICAgbG9naW5TdWNjZXNzOiAnYXV0aC1sb2dpbi1zdWNjZXNzJyxcbiAgICAvLyAgICAgbG9naW5GYWlsZWQ6ICdhdXRoLWxvZ2luLWZhaWxlZCcsXG4gICAgLy8gICAgIGxvZ291dFN1Y2Nlc3M6ICdhdXRoLWxvZ291dC1zdWNjZXNzJyxcbiAgICAvLyAgICAgc2Vzc2lvblRpbWVvdXQ6ICdhdXRoLXNlc3Npb24tdGltZW91dCcsXG4gICAgLy8gICAgIG5vdEF1dGhlbnRpY2F0ZWQ6ICdhdXRoLW5vdC1hdXRoZW50aWNhdGVkJyxcbiAgICAvLyAgICAgbm90QXV0aG9yaXplZDogJ2F1dGgtbm90LWF1dGhvcml6ZWQnXG4gICAgLy8gfSk7XG5cbiAgICAvLyBhcHAuZmFjdG9yeSgnQXV0aEludGVyY2VwdG9yJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHEsIEFVVEhfRVZFTlRTKSB7XG4gICAgLy8gICAgIHZhciBzdGF0dXNEaWN0ID0ge1xuICAgIC8vICAgICAgICAgNDAxOiBBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLFxuICAgIC8vICAgICAgICAgNDAzOiBBVVRIX0VWRU5UUy5ub3RBdXRob3JpemVkLFxuICAgIC8vICAgICAgICAgNDE5OiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCxcbiAgICAvLyAgICAgICAgIDQ0MDogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXRcbiAgICAvLyAgICAgfTtcbiAgICAvLyAgICAgcmV0dXJuIHtcbiAgICAvLyAgICAgICAgIHJlc3BvbnNlRXJyb3I6IGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgLy8gICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KHN0YXR1c0RpY3RbcmVzcG9uc2Uuc3RhdHVzXSwgcmVzcG9uc2UpO1xuICAgIC8vICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QocmVzcG9uc2UpXG4gICAgLy8gICAgICAgICB9XG4gICAgLy8gICAgIH07XG4gICAgLy8gfSk7XG5cbiAgICAvLyBhcHAuY29uZmlnKGZ1bmN0aW9uKCRodHRwUHJvdmlkZXIpIHtcbiAgICAvLyAgICAgJGh0dHBQcm92aWRlci5pbnRlcmNlcHRvcnMucHVzaChbXG4gICAgLy8gICAgICAgICAnJGluamVjdG9yJyxcbiAgICAvLyAgICAgICAgIGZ1bmN0aW9uKCRpbmplY3Rvcikge1xuICAgIC8vICAgICAgICAgICAgIHJldHVybiAkaW5qZWN0b3IuZ2V0KCdBdXRoSW50ZXJjZXB0b3InKTtcbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgXSk7XG4gICAgLy8gfSk7XG5cbiAgICAvLyBhcHAuc2VydmljZSgnQXV0aFNlcnZpY2UnLCBmdW5jdGlvbigkaHR0cCwgU2Vzc2lvbiwgJHJvb3RTY29wZSwgQVVUSF9FVkVOVFMsICRxKSB7XG5cbiAgICAvLyAgICAgZnVuY3Rpb24gb25TdWNjZXNzZnVsTG9naW4ocmVzcG9uc2UpIHtcbiAgICAvLyAgICAgICAgIHZhciBkYXRhID0gcmVzcG9uc2UuZGF0YTtcbiAgICAvLyAgICAgICAgIFNlc3Npb24uY3JlYXRlKGRhdGEuaWQsIGRhdGEudXNlcik7XG4gICAgLy8gICAgICAgICAkcm9vdFNjb3BlLiRicm9hZGNhc3QoQVVUSF9FVkVOVFMubG9naW5TdWNjZXNzKTtcbiAgICAvLyAgICAgICAgIHJldHVybiBkYXRhLnVzZXI7XG4gICAgLy8gICAgIH1cblxuICAgIC8vICAgICAvLyBVc2VzIHRoZSBzZXNzaW9uIGZhY3RvcnkgdG8gc2VlIGlmIGFuXG4gICAgLy8gICAgIC8vIGF1dGhlbnRpY2F0ZWQgdXNlciBpcyBjdXJyZW50bHkgcmVnaXN0ZXJlZC5cbiAgICAvLyAgICAgdGhpcy5pc0F1dGhlbnRpY2F0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyAgICAgICAgIHJldHVybiAhIVNlc3Npb24udXNlcjtcbiAgICAvLyAgICAgfTtcblxuICAgIC8vICAgICB0aGlzLmdldExvZ2dlZEluVXNlciA9IGZ1bmN0aW9uKGZyb21TZXJ2ZXIpIHtcblxuICAgIC8vICAgICAgICAgLy8gSWYgYW4gYXV0aGVudGljYXRlZCBzZXNzaW9uIGV4aXN0cywgd2VcbiAgICAvLyAgICAgICAgIC8vIHJldHVybiB0aGUgdXNlciBhdHRhY2hlZCB0byB0aGF0IHNlc3Npb25cbiAgICAvLyAgICAgICAgIC8vIHdpdGggYSBwcm9taXNlLiBUaGlzIGVuc3VyZXMgdGhhdCB3ZSBjYW5cbiAgICAvLyAgICAgICAgIC8vIGFsd2F5cyBpbnRlcmZhY2Ugd2l0aCB0aGlzIG1ldGhvZCBhc3luY2hyb25vdXNseS5cblxuICAgIC8vICAgICAgICAgLy8gT3B0aW9uYWxseSwgaWYgdHJ1ZSBpcyBnaXZlbiBhcyB0aGUgZnJvbVNlcnZlciBwYXJhbWV0ZXIsXG4gICAgLy8gICAgICAgICAvLyB0aGVuIHRoaXMgY2FjaGVkIHZhbHVlIHdpbGwgbm90IGJlIHVzZWQuXG5cbiAgICAvLyAgICAgICAgIGlmICh0aGlzLmlzQXV0aGVudGljYXRlZCgpICYmIGZyb21TZXJ2ZXIgIT09IHRydWUpIHtcbiAgICAvLyAgICAgICAgICAgICByZXR1cm4gJHEud2hlbihTZXNzaW9uLnVzZXIpO1xuICAgIC8vICAgICAgICAgfVxuXG4gICAgLy8gICAgICAgICAvLyBNYWtlIHJlcXVlc3QgR0VUIC9zZXNzaW9uLlxuICAgIC8vICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIHVzZXIsIGNhbGwgb25TdWNjZXNzZnVsTG9naW4gd2l0aCB0aGUgcmVzcG9uc2UuXG4gICAgLy8gICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgNDAxIHJlc3BvbnNlLCB3ZSBjYXRjaCBpdCBhbmQgaW5zdGVhZCByZXNvbHZlIHRvIG51bGwuXG4gICAgLy8gICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvc2Vzc2lvbicpLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pLmNhdGNoKGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgIC8vICAgICAgICAgfSk7XG5cbiAgICAvLyAgICAgfTtcblxuICAgIC8vICAgICB0aGlzLmxvZ2luID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcbiAgICAvLyAgICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvbG9naW4nLCBjcmVkZW50aWFscylcbiAgICAvLyAgICAgICAgICAgICAudGhlbihvblN1Y2Nlc3NmdWxMb2dpbilcbiAgICAvLyAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgLy8gICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3Qoe1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogJ0ludmFsaWQgbG9naW4gY3JlZGVudGlhbHMuJ1xuICAgIC8vICAgICAgICAgICAgICAgICB9KTtcbiAgICAvLyAgICAgICAgICAgICB9KTtcbiAgICAvLyAgICAgfTtcblxuICAgIC8vICAgICB0aGlzLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgLy8gICAgICAgICAgICAgU2Vzc2lvbi5kZXN0cm95KCk7XG4gICAgLy8gICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ291dFN1Y2Nlc3MpO1xuICAgIC8vICAgICAgICAgfSk7XG4gICAgLy8gICAgIH07XG4gICAgLy8gfSk7XG5cbiAgICAvLyBhcHAuc2VydmljZSgnU2Vzc2lvbicsIGZ1bmN0aW9uKCRyb290U2NvcGUsIEFVVEhfRVZFTlRTKSB7XG5cbiAgICAvLyAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLm5vdEF1dGhlbnRpY2F0ZWQsIGZ1bmN0aW9uKCkge1xuICAgIC8vICAgICAgICAgc2VsZi5kZXN0cm95KCk7XG4gICAgLy8gICAgIH0pO1xuXG4gICAgLy8gICAgICRyb290U2NvcGUuJG9uKEFVVEhfRVZFTlRTLnNlc3Npb25UaW1lb3V0LCBmdW5jdGlvbigpIHtcbiAgICAvLyAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgIC8vICAgICB9KTtcblxuICAgIC8vICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAvLyAgICAgdGhpcy51c2VyID0gbnVsbDtcblxuICAgIC8vICAgICB0aGlzLmNyZWF0ZSA9IGZ1bmN0aW9uKHNlc3Npb25JZCwgdXNlcikge1xuICAgIC8vICAgICAgICAgdGhpcy5pZCA9IHNlc3Npb25JZDtcbiAgICAvLyAgICAgICAgIHRoaXMudXNlciA9IHVzZXI7XG4gICAgLy8gICAgIH07XG5cbiAgICAvLyAgICAgdGhpcy5kZXN0cm95ID0gZnVuY3Rpb24oKSB7XG4gICAgLy8gICAgICAgICB0aGlzLmlkID0gbnVsbDtcbiAgICAvLyAgICAgICAgIHRoaXMudXNlciA9IG51bGw7XG4gICAgLy8gICAgIH07XG5cbiAgICAvLyB9KTtcblxufSkoKTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhZG1pbicsIHtcbiAgICB1cmw6ICcvYWRtaW4nLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvbG9naW4vbG9naW4uaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0FkbWluTG9naW5Db250cm9sbGVyJ1xuICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignQWRtaW5Mb2dpbkNvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsIEF1dGhTZXJ2aWNlLCBTZXNzaW9uU2VydmljZSwgJHdpbmRvdykge1xuICAkc2NvcGUuY291bnRlciA9IDA7XG4gICRzY29wZS5zaG93aW5nRWxlbWVudHMgPSBbXTtcbiAgJHNjb3BlLnN1Ym1pc3Npb25zID0gW107XG4gICRzY29wZS5sb2dpbk9iaiA9IHt9O1xuICAkc2NvcGUuaXNMb2dnZWRJbiA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKSA/IHRydWUgOiBmYWxzZTtcbiAgaWYoJHNjb3BlLmlzTG9nZ2VkSW4pe1xuICAgICRzdGF0ZS5nbygnc3VibWlzc2lvbnMnKTtcbiAgfVxuICAkc2NvcGUubG9naW4gPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgIHZhbDogJycsXG4gICAgICB2aXNpYmxlOiBmYWxzZVxuICAgIH07XG4gICAgQXV0aFNlcnZpY2VcbiAgICAgIC5sb2dpbigkc2NvcGUubG9naW5PYmopXG4gICAgICAudGhlbihoYW5kbGVMb2dpblJlc3BvbnNlKVxuICAgICAgLmNhdGNoKGhhbmRsZUxvZ2luRXJyb3IpXG5cbiAgICBmdW5jdGlvbiBoYW5kbGVMb2dpblJlc3BvbnNlKHJlcykge1xuICAgICAgaWYgKHJlcy5zdGF0dXMgPT09IDIwMCAmJiByZXMuZGF0YS5zdWNjZXNzKSB7XG4gICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZShyZXMuZGF0YS51c2VyKTtcbiAgICAgICAgJHN0YXRlLmdvKCdzdWJtaXNzaW9ucycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICAgICAgdmFsOiByZXMuZGF0YS5tZXNzYWdlLFxuICAgICAgICAgIHZpc2libGU6IHRydWVcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVMb2dpbkVycm9yKHJlcykge1xuICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICAgIHZhbDogJ0Vycm9yIGluIHByb2Nlc3NpbmcgeW91ciByZXF1ZXN0JyxcbiAgICAgICAgdmlzaWJsZTogdHJ1ZVxuICAgICAgfTtcbiAgICB9XG4gIH07XG4gICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICRodHRwLmdldCgnL2FwaS9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBTZXNzaW9uU2VydmljZS5kZWxldGVVc2VyKCk7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hZG1pbic7XG4gICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coJ1dyb25nIFBhc3N3b3JkJyk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLy8gJHNjb3BlLm1hbmFnZSA9IGZ1bmN0aW9uKCkge1xuICAgIC8vICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgIC8vICAgU0MuY29ubmVjdCgpXG4gICAgLy8gICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgIC8vICAgICAgICRyb290U2NvcGUuYWNjZXNzVG9rZW4gPSByZXMub2F1dGhfdG9rZW47XG4gICAgLy8gICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvbG9naW4vYXV0aGVudGljYXRlZCcsIHtcbiAgICAvLyAgICAgICAgIHRva2VuOiByZXMub2F1dGhfdG9rZW4sXG4gICAgLy8gICAgICAgICBwYXNzd29yZDogJHJvb3RTY29wZS5wYXNzd29yZCxcbiAgICAvLyAgICAgICB9KVxuICAgIC8vICAgICB9KVxuICAgIC8vICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAvLyAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgIC8vICAgICAgICRyb290U2NvcGUuc2NoZWR1bGVySW5mbyA9IHJlcy5kYXRhO1xuICAgIC8vICAgICAgICRyb290U2NvcGUuc2NoZWR1bGVySW5mby5ldmVudHMuZm9yRWFjaChmdW5jdGlvbihldikge1xuICAgIC8vICAgICAgICAgZXYuZGF5ID0gbmV3IERhdGUoZXYuZGF5KTtcbiAgICAvLyAgICAgICB9KTtcbiAgICAvLyAgICAgICAkc3RhdGUuZ28oJ3NjaGVkdWxlcicpO1xuICAgIC8vICAgICB9KVxuICAgIC8vICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAvLyAgICAgICAkLlplYnJhX0RpYWxvZygnRXJyb3I6IENvdWxkIG5vdCBsb2cgaW4nKTtcbiAgICAvLyAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgIC8vICAgICB9KTtcbiAgICAvLyB9XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdtaXhpbmdNYXN0ZXJpbmcnLCB7XG4gICAgdXJsOiAnL21peGluZ01hc3RlcmluZycsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9taXhpbmdNYXN0ZXJpbmcvbWl4aW5nTWFzdGVyaW5nLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdtaXhpbmdNYXN0ZXJpbmdDb250cm9sbGVyJ1xuICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignbWl4aW5nTWFzdGVyaW5nQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgTWl4aW5nTWFzdGVyaW5nU2VydmljZSkge1xuICAkc2NvcGUubWl4aW5nTWFzdGVyaW5nID0ge307XG4gICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICRzY29wZS5zYXZlTWl4aW5nTWFzdGVyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCEkc2NvcGUubWl4aW5nTWFzdGVyaW5nLmZpbGUgfHwgISRzY29wZS5taXhpbmdNYXN0ZXJpbmcuZW1haWwgfHwgISRzY29wZS5taXhpbmdNYXN0ZXJpbmcubmFtZSB8fCAhJHNjb3BlLm1peGluZ01hc3RlcmluZy5jb21tZW50KSB7XG4gICAgICAkLlplYnJhX0RpYWxvZyhcIlBsZWFzZSBmaWxsIGluIGFsbCBmaWVsZHNcIilcbiAgICB9IFxuICAgIGVsc2UgXG4gICAge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgJHNjb3BlLm1lc3NhZ2UudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgdmFyIGRhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAgIGZvciAodmFyIHByb3AgaW4gJHNjb3BlLm1peGluZ01hc3RlcmluZykge1xuICAgICAgICBkYXRhLmFwcGVuZChwcm9wLCAkc2NvcGUubWl4aW5nTWFzdGVyaW5nW3Byb3BdKTtcbiAgICAgIH1cblxuICAgICAgTWl4aW5nTWFzdGVyaW5nU2VydmljZVxuICAgICAgLnNhdmVNaXhpbmdNYXN0ZXJpbmcoZGF0YSlcbiAgICAgIC50aGVuKHJlY2VpdmVSZXNwb25zZSlcbiAgICAgIC5jYXRjaChjYXRjaEVycm9yKTtcblxuICAgICAgZnVuY3Rpb24gcmVjZWl2ZVJlc3BvbnNlKHJlcykge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICBpZiAocmVzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgJHNjb3BlLm1peGluZ01hc3RlcmluZyA9IHt9O1xuICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChcImlucHV0W3R5cGU9J2ZpbGUnXVwiKS52YWwobnVsbCk7XG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJUaGFuayB5b3UhIFlvdXIgcmVxdWVzdCBoYXMgYmVlbiBzdWJtaXR0ZWQgc3VjY2Vzc2Z1bGx5LlwiKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJFcnJvciBpbiBwcm9jZXNzaW5nIHRoZSByZXF1ZXN0LiBQbGVhc2UgdHJ5IGFnYWluLlwiKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gY2F0Y2hFcnJvcihyZXMpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJFcnJvciBpbiBwcm9jZXNzaW5nIHRoZSByZXF1ZXN0LiBQbGVhc2UgdHJ5IGFnYWluLlwiKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3BheScsIHtcbiAgICB1cmw6ICcvcGF5LzpzdWJtaXNzaW9uSUQnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvcGF5L3BheS5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnUGF5Q29udHJvbGxlcicsXG4gICAgcmVzb2x2ZToge1xuICAgICAgLy8gPDw8PDw8PCBIRUFEXG4gICAgICAvLyAgICAgICBjaGFubmVsczogZnVuY3Rpb24oJGh0dHApIHtcbiAgICAgIC8vICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9jaGFubmVscycpXG4gICAgICAvLyAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAvLyAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAvLyAgICAgICAgICAgfSlcbiAgICAgIC8vICAgICAgIH0sXG4gICAgICAvLyAgICAgICBzdWJtaXNzaW9uOiBmdW5jdGlvbigkaHR0cCwgJHN1Ym1pc3Npb250YXRlUGFyYW1zKSB7XG4gICAgICAvLyA9PT09PT09XG4gICAgICBzdWJtaXNzaW9uOiBmdW5jdGlvbigkaHR0cCwgJHN0YXRlUGFyYW1zKSB7XG4gICAgICAgIC8vID4+Pj4+Pj4gbWFzdGVyXG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvc3VibWlzc2lvbnMvd2l0aElELycgKyAkc3RhdGVQYXJhbXMuc3VibWlzc2lvbklEKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgY29uc29sZS5sb2cocmVzLmRhdGEpO1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgIH0pXG4gICAgICB9LFxuICAgICAgY2hhbm5lbHM6IGZ1bmN0aW9uKCRodHRwLCBzdWJtaXNzaW9uKSB7XG4gICAgICAgIHJldHVybiBzdWJtaXNzaW9uLmNoYW5uZWxzO1xuICAgICAgICAvLyByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3VzZXJzL2dldENoYW5uZWxzJylcbiAgICAgICAgLy8gLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIC8vICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAvLyB9KVxuICAgICAgfSxcbiAgICAgIHRyYWNrOiBmdW5jdGlvbihzdWJtaXNzaW9uKSB7XG4gICAgICAgIHJldHVybiBTQy5nZXQoJy90cmFja3MvJyArIHN1Ym1pc3Npb24udHJhY2tJRClcbiAgICAgICAgICAudGhlbihmdW5jdGlvbih0cmFjaykge1xuICAgICAgICAgICAgcmV0dXJuIHRyYWNrO1xuICAgICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG59KTtcblxuYXBwLmZpbHRlcignY2FsY3VsYXRlRGlzY291bnQnLCBmdW5jdGlvbigpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgcmV0dXJuIHBhcnNlRmxvYXQoaW5wdXQgKiAwLjkwKS50b0ZpeGVkKDIpO1xuICB9O1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdQYXlDb250cm9sbGVyJywgZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlLCAkaHR0cCwgY2hhbm5lbHMsIHN1Ym1pc3Npb24sIHRyYWNrLCAkc3RhdGUsICR1aWJNb2RhbCkge1xuICAkcm9vdFNjb3BlLnN1Ym1pc3Npb24gPSBzdWJtaXNzaW9uO1xuICBjb25zb2xlLmxvZyhjaGFubmVscyk7XG4gICRzY29wZS5hdURMTGluayA9IGZhbHNlO1xuICBpZiAoc3VibWlzc2lvbi5wYWlkKSAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgJHNjb3BlLnRyYWNrID0gdHJhY2s7XG4gIFNDLm9FbWJlZChzdWJtaXNzaW9uLnRyYWNrVVJMLCB7XG4gICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUGxheWVyJyksXG4gICAgYXV0b19wbGF5OiBmYWxzZSxcbiAgICBtYXhoZWlnaHQ6IDE1MFxuICB9KTtcbiAgJHNjb3BlLnRvdGFsID0gMDtcbiAgJHNjb3BlLnNob3dUb3RhbCA9IDA7XG4gICRzY29wZS5jaGFubmVscyA9IGNoYW5uZWxzO1xuXG4gIC8vICRzY29wZS5jaGFubmVscyA9IGNoYW5uZWxzLmZpbHRlcihmdW5jdGlvbihjaCkge1xuICAvLyAgIGlmIChjaC5zb3VuZGNsb3VkLmZvbGxvd2VycykgY2gucHJpY2UgPSBwYXJzZUZsb2F0KGNoLnNvdW5kY2xvdWQuZm9sbG93ZXJzIC8gMzAwMC4wKTtcbiAgLy8gICByZXR1cm4gKHN1Ym1pc3Npb24uY2hhbm5lbElEUy5pbmRleE9mKGNoLnNvdW5kY2xvdWQuaWQpICE9IC0xKVxuICAvLyB9KTtcbiAgLy9jb25zb2xlLmxvZyhzdWJtaXNzaW9uLmNoYW5uZWxJRFMpO1xuICAvL2NvbnNvbGUubG9nKCRzY29wZS5jaGFubmVscyk7XG5cbiAgJHNjb3BlLmF1RExMaW5rID0gJHNjb3BlLnRyYWNrLnB1cmNoYXNlX3VybCA/ICgkc2NvcGUudHJhY2sucHVyY2hhc2VfdXJsLmluZGV4T2YoXCJhcnRpc3RzdW5saW1pdGVkLmNvXCIpICE9IC0xKSA6IGZhbHNlO1xuICAvL2NvbnNvbGUubG9nKCRzY29wZS5hdURMTGluayk7XG5cbiAgJHNjb3BlLmdvVG9Mb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgICRzdGF0ZS5nbygnbG9naW4nLCB7XG4gICAgICAnc3VibWlzc2lvbic6ICRyb290U2NvcGUuc3VibWlzc2lvblxuICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLm1ha2VQYXltZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgLy9jb25zb2xlLmxvZygnYXknKTtcbiAgICBpZiAoJHNjb3BlLnRvdGFsICE9IDApIHtcbiAgICAgIGlmICgkc2NvcGUuYXVETExpbmspIHtcbiAgICAgICAgJHNjb3BlLmRpc2NvdW50TW9kYWxJbnN0YW5jZSA9ICR1aWJNb2RhbC5vcGVuKHtcbiAgICAgICAgICBhbmltYXRpb246IHRydWUsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICdkaXNjb3VudE1vZGFsLmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdkaXNjb3VudE1vZGFsQ29udHJvbGxlcicsXG4gICAgICAgICAgc2NvcGU6ICRzY29wZVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRzY29wZS5jb250aW51ZVBheShmYWxzZSk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgICQuWmVicmFfRGlhbG9nKCdQbGVhc2UgYWRkIGEgcmVwb3N0IHRvIHlvdXIgY2FydCBieSBjbGlja2luZyBcIkFkZCBUbyBDYXJ0XCIuJyk7XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5jb250aW51ZVBheSA9IGZ1bmN0aW9uKGRpc2NvdW50ZWQpIHtcbiAgICBpZiAoJHNjb3BlLmRpc2NvdW50ZWRNb2RhbCkge1xuICAgICAgJHNjb3BlLmRpc2NvdW50TW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xuICAgIH1cbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgaWYgKGRpc2NvdW50ZWQpICRzY29wZS5zaG93VG90YWwgPSBwYXJzZUZsb2F0KCRzY29wZS50b3RhbCAqIDAuOSkudG9GaXhlZCgyKTtcbiAgICBlbHNlICRzY29wZS5zaG93VG90YWwgPSBwYXJzZUZsb2F0KCRzY29wZS50b3RhbCkudG9GaXhlZCgyKTtcbiAgICB2YXIgcHJpY2luZ09iaiA9IHtcbiAgICAgIHRvdGFsOiAkc2NvcGUuc2hvd1RvdGFsLFxuICAgICAgc3VibWlzc2lvbjogJHJvb3RTY29wZS5zdWJtaXNzaW9uLFxuICAgICAgY2hhbm5lbHM6ICRzY29wZS5jaGFubmVscy5maWx0ZXIoZnVuY3Rpb24oY2gpIHtcbiAgICAgICAgcmV0dXJuIGNoLmFkZHRvY2FydDtcbiAgICAgIH0pXG4gICAgfTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL3N1Ym1pc3Npb25zL2dldFBheW1lbnQnLCBwcmljaW5nT2JqKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIHdpbmRvdy5sb2NhdGlvbiA9IHJlcy5kYXRhO1xuICAgICAgfSlcbiAgfVxuXG5cbiAgJHNjb3BlLmFkZFRvQ2FydCA9IGZ1bmN0aW9uKGNoYW5uZWwpIHtcbiAgICBpZiAoY2hhbm5lbC5hZGR0b2NhcnQpIHtcbiAgICAgICRzY29wZS50b3RhbCA9ICRzY29wZS50b3RhbCAtIHBhcnNlRmxvYXQoY2hhbm5lbC5wcmljZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICRzY29wZS50b3RhbCArPSBwYXJzZUZsb2F0KGNoYW5uZWwucHJpY2UpO1xuICAgIH1cbiAgICBjaGFubmVsLmFkZHRvY2FydCA9IGNoYW5uZWwuYWRkdG9jYXJ0ID8gZmFsc2UgOiB0cnVlO1xuICAgIGlmICgkc2NvcGUuYXVETExpbmspICRzY29wZS5zaG93VG90YWwgPSBwYXJzZUZsb2F0KCRzY29wZS50b3RhbCAqIDAuOSkudG9GaXhlZCgyKTtcbiAgICBlbHNlICRzY29wZS5zaG93VG90YWwgPSBwYXJzZUZsb2F0KCRzY29wZS50b3RhbCkudG9GaXhlZCgyKTtcbiAgfTtcblxufSk7XG5cbmFwcC5jb250cm9sbGVyKCdkaXNjb3VudE1vZGFsQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSkge1xuXG59KSIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2NvbXBsZXRlJywge1xuICAgIHVybDogJy9jb21wbGV0ZScsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9wYXkvdGhhbmt5b3UuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ1RoYW5reW91Q29udHJvbGxlcidcbiAgfSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ1RoYW5reW91Q29udHJvbGxlcicsIGZ1bmN0aW9uKCRodHRwLCAkc2NvcGUsICRsb2NhdGlvbikge1xuICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICRzY29wZS5ub3RpZmllZCA9IGZhbHNlO1xuICAkaHR0cC5wdXQoJy9hcGkvc3VibWlzc2lvbnMvY29tcGxldGVkUGF5bWVudCcsICRsb2NhdGlvbi5zZWFyY2goKSlcbiAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgIGNvbnNvbGUubG9nKHJlcy5kYXRhKTtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAkc2NvcGUuc3VibWlzc2lvbiA9IHJlcy5kYXRhLnN1Ym1pc3Npb247XG4gICAgICBpZiAocmVzLmRhdGEuc3RhdHVzID09ICdub3RpZnknKSB7XG4gICAgICAgICRzY29wZS5ub3RpZmllZCA9IHRydWU7XG4gICAgICAgICRzY29wZS5ldmVudHMgPSBbXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRzY29wZS5ldmVudHMgPSByZXMuZGF0YS5ldmVudHM7XG4gICAgICAgICRzY29wZS5ldmVudHMuZm9yRWFjaChmdW5jdGlvbihldikge1xuICAgICAgICAgIGV2LmRhdGUgPSBuZXcgRGF0ZShldi5kYXRlKTtcbiAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9KVxuICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgJC5aZWJyYV9EaWFsb2coJ1RoZXJlIHdhcyBhbiBlcnJvciBwcm9jZXNzaW5nIHlvdXIgcmVxdWVzdCcpO1xuICAgIH0pXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdwclBsYW5zJywge1xuICAgIHVybDogJy9wclBsYW5zJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL3ByUGxhbnMvcHJQbGFucy5odG1sJyxcbiAgICBjb250cm9sbGVyOiAncHJQbGFuc0NvbnRyb2xsZXInXG4gIH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdwclBsYW5zQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgUHJQbGFuU2VydmljZSkge1xuICAkc2NvcGUucHJQbGFucyA9IHt9O1xuICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAkc2NvcGUub3BlblNvY2lhbERpYWxvZyA9IGZ1bmN0aW9uKHR5cGUpIHtcbiAgICB2YXIgZGlzcGxheVRleHQgPSBcIlwiO1xuICAgIGlmICh0eXBlID09ICdZb3V0dWJlJylcbiAgICAgIGRpc3BsYXlUZXh0ID0gXCJMaWtlIFNvdW5kQ2xvdWQsIHdlIHByZW1pZXJlIHRyYWNrcyB0byBnZW5yZS1zcGVjaWZpYyAgYXVkaWVuY2VzLiBXZSB3b3JrIGNsb3NlbHkgd2l0aCBhbiBhcnJheSBvZiB3ZWxsLWVzdGFibGlzaGVkIFlvdVR1YmUgY2hhbm5lbHMgZm9yIHByZW1pZXJlcy4gQXBwcm9hY2hlcyB0byBwcm9tb3Rpb24gdmFyeSBhY3Jvc3MgZGlmZmVyZW50IHNvY2lhbCBtZWRpYSBwbGF0Zm9ybXMgYW5kIHJlcXVpcmVzIGEgbnVhbmNlZCB1bmRlcnN0YW5kaW5nIG9mIGVhY2guXCI7XG4gICAgaWYgKHR5cGUgPT0gJ0Jsb2cgT3V0cmVhY2gnKVxuICAgICAgZGlzcGxheVRleHQgPSBcIldoZW4gcmVsZWFzaW5nIGEgc29uZywgaXQgaXMgaW1wb3J0YW50IHRvIGtlZXAgaW4gbWluZCAgdGhlIG1hbm5lciBpbiB3aGljaCAgYmxvZ3MgY2FuIGFmZmVjdCBvbmUncyByZWFjaC4gVGhlIGJsb2dzIHdlIHdvcmsgd2l0aCBjdXJhdGUgbXVzaWMgd2l0aCBhIHNwZWNpZmljIGF1ZGllbmNlIGluIG1pbmQsIHRlbmRpbmcgdG8gYmUgY29tbWl0dGVkIHJlYWRlcnMuIFdlIGhhdmUgY3VsdGl2YXRlZCByZWxhdGlvbnNoaXBzIHdpdGggdGhlIGZhY2VzIGJlaGluZCB2YXJpb3VzIGJsb2dzLCBhbmQgd2UgYXJlIGZvcnR1bmF0ZSB0byBoYXZlIHRoZWlyIGNvbnRpbnVlZCBzdXBwb3J0IG9mIG91ciBjb250ZW50LlwiO1xuICAgIGlmICh0eXBlID09ICdTcG90aWZ5JylcbiAgICAgIGRpc3BsYXlUZXh0ID0gJ1RoZSB0aGlyZCBhbmQgZmluYWwgcGxhdGZvcm0gaW4gd2hpY2ggd2UgY2FuIGFzc2lzdCB3aXRoIHJlbGVhc2luZyBtdXNpYyBpcyBTcG90aWZ5LiBTcG90aWZ5IGlzIGFuIG9ubGluZSBtdXNpYyBwbGF0Zm9ybSB3aGljaCBwYXlzIGFydGlzdCBwZXIgc3RyZWFtLiBTcG90aWZ5IGF0IHRoZSBjb3JlIGlzIGFsc28gYSBzdWJzdGFudGlhbCB3YXkgZm9yIGFydGlzdHMgdG8gYmUgaGVhcmQuIFRoZXJlIGFyZSBvdmVyIDEwMCBNaWxsaW9uIHVzZXJzIHdvcmxkd2lkZSAgYW5kIGFzIG9uZSBvZiB0aGUgbWFqb3Igb25saW5lIG11c2ljIHBsYXRmb3Jtcywgd2Ugd2lsbCBkbyBvdXIgYmVzdCB0byBnZXQgeW91ciB0cmFjayBpbiBhcyBtYW55IHBsYXlsaXN0cyBhcyBwb3NzaWJsZS4nO1xuICAgIGlmICh0eXBlID09ICdTb3VuZGNsb3VkJylcbiAgICAgIGRpc3BsYXlUZXh0ID0gXCJXZSBmYWNpbGl0YXRlIHByZW1pZXJlcyBvdmVyIG91ciBuZXR3b3JrIG9mIG92ZXIgc2l4IFNvdW5kQ2xvdWQgY2hhbm5lbHMsIHdvcmtpbmcgY2xvc2VseSB3aXRoIGV2ZXJ5IGFydGlzdCB0byBlbnN1cmUgdGhhdCB0aGUgbmV0d29yayBnZW5yZSBtYXRjaGVzIHRoZSBmZWVsIG9mIHRoZWlyIHRyYWNrLiBUaG91Z2ggd2UgaGF2ZSBoYWQgYmV0dGVyIHJlc3VsdHMgcHJlbWllcmluZyBjb250ZW50IGZyb20gb3VyIHZhcmlvdXMgbmV0d29yayBwYWdlcywgd2UgYXJlIGFsc28gYWJsZSB0byBhbHNvIG1ha2UgdGhlIHRyYWNrIGF2YWlsYWJsZSBvbiB0aGUgYXJ0aXN0J3MgcGVyc29uYWwgcHJvZmlsZSBhbmQgcHJvbW90ZSB0aGUgdHJhY2sgZnJvbSB0aGVyZS4gV2UgcmVtYWluIGZsZXhpYmxlIHdpdGggbWFueSBvZiB0aGVzZSBhc3BlY3RzIGFuZCB0YWlsb3IgZWFjaCBjYW1wYWlnbiB0byB0aGUgcmVzcGVjdGl2ZSBnb2FscyBvZiB0aGUgYXJ0aXN0LlwiO1xuXG4gICAgJC5aZWJyYV9EaWFsb2coZGlzcGxheVRleHQsIHtcbiAgICAgIHdpZHRoOiA2MDBcbiAgICB9KTtcbiAgfVxuICAkc2NvcGUuc2F2ZVByUGxhbiA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghJHNjb3BlLnByUGxhbnMuZmlsZSB8fCAhJHNjb3BlLnByUGxhbnMuZW1haWwgfHwgISRzY29wZS5wclBsYW5zLm5hbWUgfHwgISRzY29wZS5wclBsYW5zLmJ1ZGdldCkge1xuICAgICAgJC5aZWJyYV9EaWFsb2coXCJQbGVhc2UgZmlsbCBpbiBhbGwgZmllbGRzXCIpXG4gICAgfSBlbHNlIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICRzY29wZS5tZXNzYWdlLnZpc2libGUgPSBmYWxzZTtcbiAgICAgIHZhciBkYXRhID0gbmV3IEZvcm1EYXRhKCk7XG4gICAgICBmb3IgKHZhciBwcm9wIGluICRzY29wZS5wclBsYW5zKSB7XG4gICAgICAgIGRhdGEuYXBwZW5kKHByb3AsICRzY29wZS5wclBsYW5zW3Byb3BdKTtcbiAgICAgIH1cblxuICAgICAgUHJQbGFuU2VydmljZVxuICAgICAgICAuc2F2ZVByUGxhbihkYXRhKVxuICAgICAgICAudGhlbihyZWNlaXZlUmVzcG9uc2UpXG4gICAgICAgIC5jYXRjaChjYXRjaEVycm9yKTtcblxuICAgICAgZnVuY3Rpb24gcmVjZWl2ZVJlc3BvbnNlKHJlcykge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICBpZiAocmVzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgJHNjb3BlLnByUGxhbnMgPSB7fTtcbiAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoXCJpbnB1dFt0eXBlPSdmaWxlJ11cIikudmFsKG51bGwpO1xuICAgICAgICAgICQuWmVicmFfRGlhbG9nKFwiVGhhbmsgeW91ISBZb3VyIHJlcXVlc3QgaGFzIGJlZW4gc3VibWl0dGVkIHN1Y2Nlc3NmdWxseS5cIik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgICQuWmVicmFfRGlhbG9nKFwiRXJyb3IgaW4gcHJvY2Vzc2luZyB0aGUgcmVxdWVzdC4gUGxlYXNlIHRyeSBhZ2Fpbi5cIik7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGNhdGNoRXJyb3IocmVzKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICQuWmVicmFfRGlhbG9nKFwiRXJyb3IgaW4gcHJvY2Vzc2luZyB0aGUgcmVxdWVzdC4gUGxlYXNlIHRyeSBhZ2Fpbi5cIik7XG4gICAgICB9XG4gICAgfVxuICB9XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdzY2hlZHVsZXInLCB7XG4gICAgdXJsOiAnL2FkbWluL3NjaGVkdWxlcicsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9zY2hlZHVsZXIvc2NoZWR1bGVyLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdTY2hlZHVsZXJDb250cm9sbGVyJ1xuICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignU2NoZWR1bGVyQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgQXV0aFNlcnZpY2UsIFNlc3Npb25TZXJ2aWNlLCAkd2luZG93KSB7XG4gIGlmICghU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSB7XG4gICAgJHN0YXRlLmdvKCdhZG1pbicpO1xuICB9XG4gICRzY29wZS5tYWtlRXZlbnRVUkwgPSBcIlwiO1xuICAkc2NvcGUuc2hvd092ZXJsYXkgPSBmYWxzZTtcbiAgdmFyIGluZm8gPSAkcm9vdFNjb3BlLnNjaGVkdWxlckluZm87XG4gIGlmICghaW5mbykge1xuICAgICRzdGF0ZS5nbygnYWRtaW4nKTtcbiAgfVxuICAkc2NvcGUuY2hhbm5lbCA9IGluZm8uY2hhbm5lbDtcbiAgaWYgKCEkc2NvcGUuY2hhbm5lbCkge1xuICAgICRzdGF0ZS5nbygnYWRtaW4nKTtcbiAgfVxuXG4gICRzY29wZS5sb2dvdXQgPSBmdW5jdGlvbigpIHtcbiAgICAkaHR0cC5nZXQoJy9hcGkvbG9nb3V0JykudGhlbihmdW5jdGlvbigpIHtcbiAgICAgIFNlc3Npb25TZXJ2aWNlLmRlbGV0ZVVzZXIoKTtcbiAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9hZG1pbic7XG4gICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgIH0pO1xuICB9XG4gICRzY29wZS5zdWJtaXNzaW9ucyA9IGluZm8uc3VibWlzc2lvbnM7XG5cbiAgJHNjb3BlLmRheUluY3IgPSAwO1xuXG4gICRzY29wZS5iYWNrID0gZnVuY3Rpb24oKSB7XG4gICAgd2luZG93LmxvY2F0aW9uLnJlbG9hZCgpO1xuXG4gIH1cblxuICAkc2NvcGUuc2F2ZUNoYW5uZWwgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJHNjb3BlLmNoYW5uZWwucGFzc3dvcmQgPSAkcm9vdFNjb3BlLnBhc3N3b3JkO1xuICAgICRodHRwLnB1dChcIi9hcGkvY2hhbm5lbHNcIiwgJHNjb3BlLmNoYW5uZWwpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJTYXZlZFwiKTtcbiAgICAgICAgJHNjb3BlLmNoYW5uZWwgPSByZXMuZGF0YTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJFcnJvcjogZGlkIG5vdCBzYXZlXCIpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUuaW5jckRheSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc2NvcGUuZGF5SW5jciA8IDE0KSAkc2NvcGUuZGF5SW5jcisrO1xuICB9XG5cbiAgJHNjb3BlLmRlY3JEYXkgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLmRheUluY3IgPiAwKSAkc2NvcGUuZGF5SW5jci0tO1xuICB9XG5cbiAgJHNjb3BlLmNsaWNrZWRTbG90ID0gZnVuY3Rpb24oZGF5LCBob3VyKSB7XG4gICAgdmFyIHRvZGF5ID0gbmV3IERhdGUoKTtcbiAgICBpZiAodG9kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpICYmIHRvZGF5LmdldEhvdXJzKCkgPiBob3VyKSByZXR1cm47XG4gICAgJHNjb3BlLnNob3dPdmVybGF5ID0gdHJ1ZTtcbiAgICB2YXIgY2FsRGF5ID0ge307XG4gICAgdmFyIGNhbGVuZGFyRGF5ID0gJHNjb3BlLmNhbGVuZGFyLmZpbmQoZnVuY3Rpb24oY2FsRCkge1xuICAgICAgcmV0dXJuIGNhbEQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09IGRheS50b0xvY2FsZURhdGVTdHJpbmcoKTtcbiAgICB9KTtcbiAgICAkc2NvcGUubWFrZUV2ZW50VVJMID0gdW5kZWZpbmVkO1xuICAgICRzY29wZS5tYWtlRXZlbnQgPSBjYWxlbmRhckRheS5ldmVudHNbaG91cl07XG4gICAgY29uc29sZS5sb2coJHNjb3BlLm1ha2VFdmVudCk7XG4gICAgaWYgKCRzY29wZS5tYWtlRXZlbnQgPT0gXCItXCIpIHtcbiAgICAgIHZhciBtYWtlRGF5ID0gbmV3IERhdGUoZGF5KTtcbiAgICAgIG1ha2VEYXkuc2V0SG91cnMoaG91cik7XG4gICAgICAkc2NvcGUubWFrZUV2ZW50ID0ge1xuICAgICAgICBjaGFubmVsSUQ6ICRzY29wZS5jaGFubmVsLmNoYW5uZWxJRCxcbiAgICAgICAgZGF5OiBtYWtlRGF5LFxuICAgICAgICBwYWlkOiBmYWxzZVxuICAgICAgfTtcbiAgICAgICRzY29wZS5uZXdFdmVudCA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICRzY29wZS5tYWtlRXZlbnRVUkwgPSAkc2NvcGUubWFrZUV2ZW50LnRyYWNrVVJMO1xuICAgICAgU0Mub0VtYmVkKCRzY29wZS5tYWtlRXZlbnRVUkwsIHtcbiAgICAgICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUGxheWVyJyksXG4gICAgICAgIGF1dG9fcGxheTogZmFsc2UsXG4gICAgICAgIG1heGhlaWdodDogMTUwXG4gICAgICB9KTtcbiAgICAgICRzY29wZS5uZXdFdmVudCA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gICRzY29wZS5jaGFuZ2VQYWlkID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLm1ha2VFdmVudC50aXRsZSA9IHVuZGVmaW5lZDtcbiAgICAkc2NvcGUubWFrZUV2ZW50LnRyYWNrVVJMID0gdW5kZWZpbmVkO1xuICAgICRzY29wZS5tYWtlRXZlbnQuYXJ0aXN0TmFtZSA9IHVuZGVmaW5lZDtcbiAgICAkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQgPSB1bmRlZmluZWQ7XG4gICAgJHNjb3BlLm1ha2VFdmVudFVSTCA9IHVuZGVmaW5lZDtcbiAgfVxuXG4gICRzY29wZS5jaGFuZ2VVUkwgPSBmdW5jdGlvbigpIHtcbiAgICBpZigkc2NvcGUubWFrZUV2ZW50VVJMICE9IFwiXCIpe1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIHtcbiAgICAgICAgdXJsOiAkc2NvcGUubWFrZUV2ZW50VVJMXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCA9IHJlcy5kYXRhLmlkO1xuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnRpdGxlID0gcmVzLmRhdGEudGl0bGU7XG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQudHJhY2tVUkwgPSByZXMuZGF0YS50cmFja1VSTDtcbiAgICAgICAgaWYgKHJlcy5kYXRhLnVzZXIpICRzY29wZS5tYWtlRXZlbnQuYXJ0aXN0TmFtZSA9IHJlcy5kYXRhLnVzZXIudXNlcm5hbWU7XG4gICAgICAgIFNDLm9FbWJlZCgkc2NvcGUubWFrZUV2ZW50VVJMLCB7XG4gICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUGxheWVyJyksXG4gICAgICAgICAgYXV0b19wbGF5OiBmYWxzZSxcbiAgICAgICAgICBtYXhoZWlnaHQ6IDE1MFxuICAgICAgICB9KVxuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG4gICAgICAgICRzY29wZS5ub3RGb3VuZCA9IGZhbHNlO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSkudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJXZSBhcmUgbm90IGFsbG93ZWQgdG8gYWNjZXNzIHRyYWNrcyBieSB0aGlzIGFydGlzdCB3aXRoIHRoZSBTb3VuZGNsb3VkIEFQSS4gV2UgYXBvbG9naXplIGZvciB0aGUgaW5jb252ZW5pZW5jZSwgYW5kIHdlIGFyZSB3b3JraW5nIHdpdGggU291bmRjbG91ZCB0byByZXNvbHZlIHRoaXMgaXNzdWUuXCIpO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgICAgJHNjb3BlLm5vdEZvdW5kID0gdHJ1ZTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9XG4gIH1cblxuICAkc2NvcGUuZGVsZXRlRXZlbnQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoISRzY29wZS5uZXdFdmVudCkge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgJGh0dHAuZGVsZXRlKCcvYXBpL2V2ZW50cy8nICsgJHNjb3BlLm1ha2VFdmVudC5faWQpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHZhciBjYWxlbmRhckRheSA9ICRzY29wZS5jYWxlbmRhci5maW5kKGZ1bmN0aW9uKGNhbEQpIHtcbiAgICAgICAgICAgIHJldHVybiBjYWxELmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSAkc2NvcGUubWFrZUV2ZW50LmRheS50b0xvY2FsZURhdGVTdHJpbmcoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgICBjYWxlbmRhckRheS5ldmVudHNbJHNjb3BlLm1ha2VFdmVudC5kYXkuZ2V0SG91cnMoKV0gPSBcIi1cIjtcbiAgICAgICAgICAkc2NvcGUuc2hvd092ZXJsYXkgPSBmYWxzZTtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICQuWmVicmFfRGlhbG9nKFwiRGVsZXRlZFwiKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkVSUk9SOiBkaWQgbm90IERlbGV0ZS5cIilcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBjYWxlbmRhckRheSA9ICRzY29wZS5jYWxlbmRhci5maW5kKGZ1bmN0aW9uKGNhbEQpIHtcbiAgICAgICAgcmV0dXJuIGNhbEQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09ICRzY29wZS5tYWtlRXZlbnQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpO1xuICAgICAgfSk7XG4gICAgICBjYWxlbmRhckRheS5ldmVudHNbJHNjb3BlLm1ha2VFdmVudC5nZXRIb3VycygpXSA9IFwiLVwiO1xuICAgICAgdmFyIGV2ZW50c1xuICAgICAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLnNhdmVFdmVudCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghJHNjb3BlLm1ha2VFdmVudC50cmFja0lEICYmICEkc2NvcGUubWFrZUV2ZW50LnBhaWQpIHtcbiAgICAgICQuWmVicmFfRGlhbG9nKFwiRW50ZXIgYSB0cmFjayBVUkxcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICgkc2NvcGUubmV3RXZlbnQpIHtcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC5wYXNzd29yZCA9ICRyb290U2NvcGUucGFzc3dvcmQ7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICAgJGh0dHAucG9zdCgnL2FwaS9ldmVudHMnLCAkc2NvcGUubWFrZUV2ZW50KVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgdmFyIGV2ZW50ID0gcmVzLmRhdGE7XG4gICAgICAgICAgICBldmVudC5kYXkgPSBuZXcgRGF0ZShldmVudC5kYXkpO1xuICAgICAgICAgICAgdmFyIGNhbGVuZGFyRGF5ID0gJHNjb3BlLmNhbGVuZGFyLmZpbmQoZnVuY3Rpb24oY2FsRCkge1xuICAgICAgICAgICAgICByZXR1cm4gY2FsRC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gZXZlbnQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjYWxlbmRhckRheS5ldmVudHNbZXZlbnQuZGF5LmdldEhvdXJzKCldID0gZXZlbnQ7XG4gICAgICAgICAgICAkc2NvcGUuc2hvd092ZXJsYXkgPSBmYWxzZTtcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIlNhdmVkXCIpO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJFUlJPUjogZGlkIG5vdCBTYXZlLlwiKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRzY29wZS5uZXdFdmVudC5wYXNzd29yZCA9ICRyb290U2NvcGUucGFzc3dvcmQ7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICAgJGh0dHAucHV0KCcvYXBpL2V2ZW50cycsICRzY29wZS5tYWtlRXZlbnQpXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICB2YXIgZXZlbnQgPSByZXMuZGF0YTtcbiAgICAgICAgICAgIGV2ZW50LmRheSA9IG5ldyBEYXRlKGV2ZW50LmRheSk7XG4gICAgICAgICAgICB2YXIgY2FsZW5kYXJEYXkgPSAkc2NvcGUuY2FsZW5kYXIuZmluZChmdW5jdGlvbihjYWxEKSB7XG4gICAgICAgICAgICAgIHJldHVybiBjYWxELmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSBldmVudC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGNhbGVuZGFyRGF5LmV2ZW50c1tldmVudC5nZXRIb3VycygpXSA9IGV2ZW50O1xuICAgICAgICAgICAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJTYXZlZFwiKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKFwiRVJST1I6IGRpZCBub3QgU2F2ZS5cIik7XG4gICAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLmVtYWlsU2xvdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBtYWlsdG9fbGluayA9IFwibWFpbHRvOmNvYXlzY3VlQGdtYWlsLmNvbT9zdWJqZWN0PVJlcG9zdCBvZiBcIiArICRzY29wZS5tYWtlRXZlbnQudGl0bGUgKyAnJmJvZHk9SGV5LFxcblxcbiBJIGFtIHJlcG9zdGluZyB5b3VyIHNvbmcgJyArICRzY29wZS5tYWtlRXZlbnQudGl0bGUgKyAnIG9uICcgKyAkc2NvcGUuY2hhbm5lbC5kaXNwbGF5TmFtZSArICcgb24gJyArICRzY29wZS5tYWtlRXZlbnQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpICsgJy5cXG5cXG4gQmVzdCwgXFxuJyArICRzY29wZS5jaGFubmVsLmRpc3BsYXlOYW1lO1xuICAgIGxvY2F0aW9uLmhyZWYgPSBlbmNvZGVVUkkobWFpbHRvX2xpbmspO1xuICB9XG5cbiAgLy8gJHNjb3BlLnNjRW1haWxTbG90ID0gZnVuY3Rpb24oKSB7XG5cbiAgLy8gfVxuXG4gICRzY29wZS5iYWNrRXZlbnQgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUubWFrZUV2ZW50ID0gbnVsbDtcbiAgICAkc2NvcGUuc2hvd092ZXJsYXkgPSBmYWxzZTtcbiAgfVxuXG4gICRzY29wZS5yZW1vdmVRdWV1ZVNvbmcgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICRzY29wZS5jaGFubmVsLnF1ZXVlLnNwbGljZShpbmRleCwgMSk7XG4gICAgJHNjb3BlLnNhdmVDaGFubmVsKCk7XG4gIH1cblxuICAkc2NvcGUuYWRkU29uZyA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc2NvcGUuY2hhbm5lbC5xdWV1ZS5pbmRleE9mKCRzY29wZS5uZXdRdWV1ZUlEKSAhPSAtMSkgcmV0dXJuO1xuICAgICRzY29wZS5jaGFubmVsLnF1ZXVlLnB1c2goJHNjb3BlLm5ld1F1ZXVlSUQpO1xuICAgICRzY29wZS5zYXZlQ2hhbm5lbCgpO1xuICAgICRzY29wZS5uZXdRdWV1ZVNvbmcgPSB1bmRlZmluZWQ7XG4gICAgJHNjb3BlLmNoYW5nZVF1ZXVlU29uZygpO1xuICAgICRzY29wZS5sb2FkUXVldWVTb25ncyhbJHNjb3BlLm5ld1F1ZXVlSURdKTtcbiAgfVxuXG4gICRzY29wZS5jaGFuZ2VRdWV1ZVNvbmcgPSBmdW5jdGlvbigpIHtcbiAgICBpZigkc2NvcGUubmV3UXVldWVTb25nICE9IFwiXCIpe1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIHtcbiAgICAgICAgdXJsOiAkc2NvcGUubmV3UXVldWVTb25nXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIHZhciB0cmFjayA9IHJlcy5kYXRhO1xuICAgICAgICAkc2NvcGUubmV3UXVldWVJRCA9IHRyYWNrLmlkO1xuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAkLlplYnJhX0RpYWxvZyhcImVycm9yIGdldHRpbmcgc29uZ1wiKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pO1xuICB9XG4gIH1cblxuICAkc2NvcGUubW92ZVVwID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICBpZiAoaW5kZXggPT0gMCkgcmV0dXJuO1xuICAgIHZhciBzID0gJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXhdO1xuICAgICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4XSA9ICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4IC0gMV07XG4gICAgJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXggLSAxXSA9IHM7XG4gICAgJHNjb3BlLnNhdmVDaGFubmVsKCk7XG4gICAgJHNjb3BlLmxvYWRRdWV1ZVNvbmdzKFskc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleF0sICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4IC0gMV1dKTtcbiAgfVxuXG4gICRzY29wZS5tb3ZlRG93biA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgaWYgKGluZGV4ID09ICRzY29wZS5jaGFubmVsLnF1ZXVlLmxlbmd0aCAtIDEpIHJldHVybjtcbiAgICB2YXIgcyA9ICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4XTtcbiAgICAkc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleF0gPSAkc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleCArIDFdO1xuICAgICRzY29wZS5jaGFubmVsLnF1ZXVlW2luZGV4ICsgMV0gPSBzO1xuICAgICRzY29wZS5zYXZlQ2hhbm5lbCgpO1xuICAgICRzY29wZS5sb2FkUXVldWVTb25ncyhbJHNjb3BlLmNoYW5uZWwucXVldWVbaW5kZXhdLCAkc2NvcGUuY2hhbm5lbC5xdWV1ZVtpbmRleCArIDFdXSk7XG4gIH1cblxuICAvLyAkc2NvcGUuY2FuTG93ZXJPcGVuRXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gIC8vICAgdmFyIHdhaXRpbmdTdWJzID0gJHNjb3BlLnN1Ym1pc3Npb25zLmZpbHRlcihmdW5jdGlvbihzdWIpIHtcbiAgLy8gICAgIHJldHVybiBzdWIuaW52b2ljZUlEO1xuICAvLyAgIH0pO1xuICAvLyAgIHZhciBvcGVuU2xvdHMgPSBbXTtcbiAgLy8gICAkc2NvcGUuY2FsZW5kYXIuZm9yRWFjaChmdW5jdGlvbihkYXkpIHtcbiAgLy8gICAgIGRheS5ldmVudHMuZm9yRWFjaChmdW5jdGlvbihldikge1xuICAvLyAgICAgICBpZiAoZXYucGFpZCAmJiAhZXYudHJhY2tJRCkgb3BlblNsb3RzLnB1c2goZXYpO1xuICAvLyAgICAgfSk7XG4gIC8vICAgfSk7XG4gIC8vICAgdmFyIG9wZW5OdW0gPSBvcGVuU2xvdHMubGVuZ3RoIC0gd2FpdGluZ1N1YnMubGVuZ3RoO1xuICAvLyAgIHJldHVybiBvcGVuTnVtID4gMDtcbiAgLy8gfVxuXG4gICRzY29wZS5sb2FkU3VibWlzc2lvbnMgPSBmdW5jdGlvbigpIHtcbiAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLnN1Ym1pc3Npb25zLmZvckVhY2goZnVuY3Rpb24oc3ViKSB7XG4gICAgICAgIFNDLm9FbWJlZChcImh0dHA6Ly9hcGkuc291bmRjbG91ZC5jb20vdHJhY2tzL1wiICsgc3ViLnRyYWNrSUQsIHtcbiAgICAgICAgICBlbGVtZW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzdWIudHJhY2tJRCArIFwicGxheWVyXCIpLFxuICAgICAgICAgIGF1dG9fcGxheTogZmFsc2UsXG4gICAgICAgICAgbWF4aGVpZ2h0OiAxNTBcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LCA1MCk7XG4gIH1cblxuICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MgPSBmdW5jdGlvbihxdWV1ZSkge1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICBxdWV1ZS5mb3JFYWNoKGZ1bmN0aW9uKHNvbmdJRCkge1xuICAgICAgICBTQy5vRW1iZWQoXCJodHRwOi8vYXBpLnNvdW5kY2xvdWQuY29tL3RyYWNrcy9cIiArIHNvbmdJRCwge1xuICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHNvbmdJRCArIFwicGxheWVyXCIpLFxuICAgICAgICAgIGF1dG9fcGxheTogZmFsc2UsXG4gICAgICAgICAgbWF4aGVpZ2h0OiAxNTBcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9LCA1MCk7XG4gIH1cbiAgaWYgKCRzY29wZS5jaGFubmVsICYmICRzY29wZS5jaGFubmVsLnF1ZXVlKSB7XG4gICAgJHNjb3BlLmxvYWRRdWV1ZVNvbmdzKCRzY29wZS5jaGFubmVsLnF1ZXVlKTtcbiAgfVxuICAkc2NvcGUubG9hZFN1Ym1pc3Npb25zKCk7XG5cbiAgJHNjb3BlLmRheU9mV2Vla0FzU3RyaW5nID0gZnVuY3Rpb24oZGF0ZSkge1xuICAgIHZhciBkYXlJbmRleCA9IGRhdGUuZ2V0RGF5KCk7XG4gICAgcmV0dXJuIFtcIlN1bmRheVwiLCBcIk1vbmRheVwiLCBcIlR1ZXNkYXlcIiwgXCJXZWRuZXNkYXlcIiwgXCJUaHVyc2RheVwiLCBcIkZyaWRheVwiLCBcIlNhdHVyZGF5XCJdW2RheUluZGV4XTtcbiAgfVxuXG4gICRzY29wZS5maWxsRGF0ZUFycmF5cyA9IGZ1bmN0aW9uKGV2ZW50cykge1xuICAgIHZhciBjYWxlbmRhciA9IFtdO1xuICAgIHZhciB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyMTsgaSsrKSB7XG4gICAgICB2YXIgY2FsRGF5ID0ge307XG4gICAgICBjYWxEYXkuZGF5ID0gbmV3IERhdGUoKVxuICAgICAgY2FsRGF5LmRheS5zZXREYXRlKHRvZGF5LmdldERhdGUoKSArIGkpO1xuICAgICAgdmFyIGRheUV2ZW50cyA9IGV2ZW50cy5maWx0ZXIoZnVuY3Rpb24oZXYpIHtcbiAgICAgICAgcmV0dXJuIChldi5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gY2FsRGF5LmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSk7XG4gICAgICB9KTtcbiAgICAgIHZhciBldmVudEFycmF5ID0gW107XG4gICAgICBmb3IgKHZhciBqID0gMDsgaiA8IDI0OyBqKyspIHtcbiAgICAgICAgZXZlbnRBcnJheVtqXSA9IFwiLVwiO1xuICAgICAgfVxuICAgICAgZGF5RXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXYpIHtcbiAgICAgICAgZXZlbnRBcnJheVtldi5kYXkuZ2V0SG91cnMoKV0gPSBldjtcbiAgICAgIH0pO1xuICAgICAgY2FsRGF5LmV2ZW50cyA9IGV2ZW50QXJyYXk7XG4gICAgICBjYWxlbmRhci5wdXNoKGNhbERheSk7XG4gICAgfVxuICAgIHJldHVybiBjYWxlbmRhcjtcbiAgfVxuICAkc2NvcGUuY2FsZW5kYXIgPSAkc2NvcGUuZmlsbERhdGVBcnJheXMoaW5mby5ldmVudHMpO1xufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnc3VibWl0U29uZycsIHtcbiAgICB1cmw6ICcvc3VibWl0JyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL3N1Ym1pdC9zdWJtaXQudmlldy5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnU3VibWl0U29uZ0NvbnRyb2xsZXInXG4gIH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdTdWJtaXRTb25nQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCkge1xuICAkc2NvcGUuc3VibWlzc2lvbiA9IHt9O1xuICAkc2NvcGUudXNlcklEID0gXCJcIjtcbiAgJHNjb3BlLmdlbnJlQXJyYXkgPSBbXG4gICAgJ0FsdGVybmF0aXZlIFJvY2snLFxuICAgICdBbWJpZW50JyxcbiAgICAnQ3JlYXRpdmUnLFxuICAgICdDaGlsbCcsXG4gICAgJ0NsYXNzaWNhbCcsXG4gICAgJ0NvdW50cnknLFxuICAgICdEYW5jZSAmIEVETScsXG4gICAgJ0RhbmNlaGFsbCcsXG4gICAgJ0RlZXAgSG91c2UnLFxuICAgICdEaXNjbycsXG4gICAgJ0RydW0gJiBCYXNzJyxcbiAgICAnRHVic3RlcCcsXG4gICAgJ0VsZWN0cm9uaWMnLFxuICAgICdGZXN0aXZhbCcsXG4gICAgJ0ZvbGsnLFxuICAgICdIaXAtSG9wL1JOQicsXG4gICAgJ0hvdXNlJyxcbiAgICAnSW5kaWUvQWx0ZXJuYXRpdmUnLFxuICAgICdMYXRpbicsXG4gICAgJ1RyYXAnLFxuICAgICdWb2NhbGlzdHMvU2luZ2VyLVNvbmd3cml0ZXInXG4gIF07XG4gICRzY29wZS51cmxDaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLnVybCAhPSBcIlwiKSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIHtcbiAgICAgICAgICB1cmw6ICRzY29wZS51cmxcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgaWYgKHJlcy5kYXRhLmtpbmQgIT0gXCJ0cmFja1wiKSB0aHJvdyAobmV3IEVycm9yKCcnKSk7XG4gICAgICAgICAgJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tJRCA9IHJlcy5kYXRhLmlkO1xuICAgICAgICAgICRzY29wZS5zdWJtaXNzaW9uLnRpdGxlID0gcmVzLmRhdGEudGl0bGU7XG4gICAgICAgICAgJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tVUkwgPSByZXMuZGF0YS50cmFja1VSTDtcbiAgICAgICAgICBTQy5vRW1iZWQoJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tVUkwsIHtcbiAgICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLFxuICAgICAgICAgICAgYXV0b19wbGF5OiBmYWxzZSxcbiAgICAgICAgICAgIG1heGhlaWdodDogMTUwXG4gICAgICAgICAgfSlcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAkc2NvcGUubm90Rm91bmQgPSBmYWxzZTtcbiAgICAgICAgfSkudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICBpZiAoZXJyLnN0YXR1cyAhPSA0MDMpIHtcbiAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKFwiV2UgYXJlIG5vdCBhbGxvd2VkIHRvIGFjY2VzcyB0cmFja3MgYnkgdGhpcyBhcnRpc3Qgd2l0aCB0aGUgU291bmRjbG91ZCBBUEkuIFdlIGFwb2xvZ2l6ZSBmb3IgdGhlIGluY29udmVuaWVuY2UsIGFuZCB3ZSBhcmUgd29ya2luZyB3aXRoIFNvdW5kY2xvdWQgdG8gcmVzb2x2ZSB0aGlzIGlzc3VlLlwiKTtcbiAgICAgICAgICAgICRzY29wZS5ub3RGb3VuZCA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrVVJMID0gJHNjb3BlLnVybDtcbiAgICAgICAgICAgIFNDLm9FbWJlZCgkc2NvcGUuc3VibWlzc2lvbi50cmFja1VSTCwge1xuICAgICAgICAgICAgICBlbGVtZW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKSxcbiAgICAgICAgICAgICAgYXV0b19wbGF5OiBmYWxzZSxcbiAgICAgICAgICAgICAgbWF4aGVpZ2h0OiAxNTBcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAgICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrSUQgPSBudWxsO1xuXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLnN1Ym1pdCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghJHNjb3BlLnN1Ym1pc3Npb24uZW1haWwgfHwgISRzY29wZS5zdWJtaXNzaW9uLm5hbWUpIHtcbiAgICAgICQuWmVicmFfRGlhbG9nKFwiUGxlYXNlIGZpbGwgaW4gYWxsIGZpZWxkc1wiKVxuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAkaHR0cC5wb3N0KCcvYXBpL3N1Ym1pc3Npb25zJywge1xuICAgICAgICAgIGVtYWlsOiAkc2NvcGUuc3VibWlzc2lvbi5lbWFpbCxcbiAgICAgICAgICB0cmFja0lEOiAkc2NvcGUuc3VibWlzc2lvbi50cmFja0lELFxuICAgICAgICAgIG5hbWU6ICRzY29wZS5zdWJtaXNzaW9uLm5hbWUsXG4gICAgICAgICAgdGl0bGU6ICRzY29wZS5zdWJtaXNzaW9uLnRpdGxlLFxuICAgICAgICAgIHRyYWNrVVJMOiAkc2NvcGUuc3VibWlzc2lvbi50cmFja1VSTCxcbiAgICAgICAgICBjaGFubmVsSURTOiBbXSxcbiAgICAgICAgICBpbnZvaWNlSURTOiBbXSxcbiAgICAgICAgICB1c2VySUQ6ICRzY29wZS51c2VySUQsXG4gICAgICAgICAgZ2VucmU6ICRzY29wZS5zdWJtaXNzaW9uLmdlbnJlXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICQuWmVicmFfRGlhbG9nKFwiWW91ciBzb25nIGhhcyBiZWVuIHN1Ym1pdHRlZCBhbmQgd2lsbCBiZSByZXZpZXdlZCBzb29uLlwiKTtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICRzY29wZS5ub3RGb3VuZCA9IGZhbHNlO1xuICAgICAgICAgICRzY29wZS5zdWJtaXNzaW9uID0ge307XG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUGxheWVyJykuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG4gICAgICAgICAgJHNjb3BlLnVybCA9IFwiXCI7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJFcnJvcjogQ291bGQgbm90IHN1Ym1pdCBzb25nLlwiKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLmdldFVzZXJJRCA9IGZ1bmN0aW9uKCkge1xuICAgICRodHRwLmdldCgnL2FwaS91c2Vycy9nZXRVc2VySUQnKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS51c2VySUQgPSByZXMuZGF0YTtcbiAgICAgIH0pO1xuICB9XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhY2NvdW50cycsIHtcbiAgICB1cmw6ICcvYWRtaW4vYWNjb3VudHMnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvYWNjb3VudHMvdmlld3MvYWNjb3VudHMuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ2FjY291bnRzQ29udHJvbGxlcidcbiAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignYWNjb3VudHNDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCBBdXRoU2VydmljZSwgU2Vzc2lvblNlcnZpY2UsJHNjZSxhY2NvdW50U2VydmljZSkge1xuXHRpZiAoIVNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKSkge1xuICBcdCRzdGF0ZS5nbygnYWRtaW4nKTtcblx0fVxuIFx0JHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XG4gXHQkc2NvcGUuc291bmRjbG91ZExvZ2luID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgIFNDLmNvbm5lY3QoKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgJHJvb3RTY29wZS5hY2Nlc3NUb2tlbiA9IHJlcy5vYXV0aF90b2tlbjtcbiAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2xvZ2luL3NvdW5kQ2xvdWRBdXRoZW50aWNhdGlvbicsIHtcbiAgICAgICAgdG9rZW46IHJlcy5vYXV0aF90b2tlblxuICAgICAgfSk7XG4gICAgfSlcbiAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgIHZhciBzY0luZm8gPSByZXMuZGF0YS51c2VyLnNvdW5kY2xvdWQ7XG4gICAgICBzY0luZm8uZ3JvdXAgPSBcIlwiOyAgICAgXG4gICAgICBzY0luZm8ucHJpY2UgPSAwOyAgICBcbiAgICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvdXBkYXRlVXNlckFjY291bnQnLCB7XG4gICAgICAgIHNvdW5kY2xvdWRJbmZvOiBzY0luZm8sXG4gICAgICB9KS50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICB9KTtcbiAgICB9KVxuICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgJC5aZWJyYV9EaWFsb2coJ0Vycm9yOiBDb3VsZCBub3QgbG9nIGluJyk7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgIH0pO1xuXHR9O1xuXG4gICRzY29wZS5kZWxldGVQYWlkUmVwb3N0ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAkLlplYnJhX0RpYWxvZygnRG8geW91IHJlYWxseSB3YW50IHRvIGRlbGV0ZSB0aGlzIGFjY291bnQ/Jywge1xuICAgICAgJ2J1dHRvbnMnOiBbe1xuICAgICAgICBjYXB0aW9uOiAnWWVzJyxcbiAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciBwb3N0UmVwb3N0ID0gJHNjb3BlLnVzZXIucGFpZFJlcG9zdFtpbmRleF0uaWQ7XG4gICAgICAgICAgYWNjb3VudFNlcnZpY2UuZGVsZXRlVXNlckFjY291bnQocG9zdFJlcG9zdClcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpe1xuICAgICAgICAgICAgJHNjb3BlLnVzZXIucGFpZFJlcG9zdC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgIH0pXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB7IFxuICAgICAgICBjYXB0aW9uOiAnTm8nLCBcbiAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKCkge30gXG4gICAgICB9XVxuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS51cGRhdGVHcm91cCA9IGZ1bmN0aW9uKGFjY291bnQpe1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL3VwZGF0ZUdyb3VwJywge1xuICAgICAgcGFpZFJlcG9zdDogJHNjb3BlLnVzZXIucGFpZFJlcG9zdCxcbiAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZShyZXMuZGF0YSk7XG4gICAgICAkc2NvcGUudXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcbiAgICB9KTtcbiAgfVxufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgnYXJ0aXN0VG9vbHNBbmFseXRpY3MnLCB7XG4gICAgICB1cmw6ICcvYW5hbHl0aWNzJyxcbiAgICAgIHBhcmFtczoge1xuICAgICAgICBzdWJtaXNzaW9uOiBudWxsXG4gICAgICB9LFxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hcnRpc3RUb29scy9BbmFseXRpY3MvYW5hbHl0aWNzLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ2FydGlzdFRvb2xzQW5hbHl0aWNzJ1xuICAgIH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKFwiYXJ0aXN0VG9vbHNBbmFseXRpY3NcIiwgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsICRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgJHdpbmRvdywgJHVpYk1vZGFsLCAkdGltZW91dCwgJGF1dGgsIFNlc3Npb25TZXJ2aWNlLCBBcnRpc3RUb29sc1NlcnZpY2UpIHtcbiAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XG4gIGlmICghU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSB7XG4gICAgJHN0YXRlLmdvKCdsb2dpbicpO1xuICB9IGVsc2Uge1xuICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3JldHVybnN0YXRlJyk7XG4gICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndGlkJyk7XG4gIH1cbiAgJHNjb3BlLmF1dGhGYWNib29rID0gZnVuY3Rpb24oaWQsIGRheXMpIHtcbiAgICBpZiAoaWQpIHsgLy9jYWxsaW5nIGZvciByZWdpc3RyYXRpb24gIVxuICAgICAgYWxlcnQoXCJyZWdpc3RlcmluZyBDaGFubmVsLCBwbGVhc2UgcmVmcmVzaCBhZnRlciBmZXcgbW9tZW50cyB0byBsb2FkIGFuYWx5dGljcyBkYXRhXCIpO1xuICAgICAgcmV0dXJuICRodHRwKHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIHVybDogJy9hcGkvYW5hbHl0aWNzL2ZhY2Vib29rJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgIHBhZ2VpZDogaWQuaWRcbiAgICAgICAgfVxuICAgICAgfSkudGhlbihmdW5jdGlvbihzdWNjZXNzKSB7XG4gICAgICAgICRzY29wZS5zaG93RmFjZWJvb2tQYWdlcyA9IGZhbHNlO1xuICAgICAgICBkZWxldGUgJHNjb3BlLmZhY2Vib29rUGFnZXM7XG4gICAgICAgIGNvbnNvbGUubG9nKHN1Y2Nlc3MpO1xuICAgICAgICAkc2NvcGUuYXV0aEZhY2Jvb2soKTtcbiAgICAgIH0sIGZ1bmN0aW9uKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKGVycm9yKTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAkc2NvcGUuZW5hYmxlR3JhcGggPSBmYWxzZTtcbiAgICAkaHR0cCh7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIHVybDogJy9hcGkvYW5hbHl0aWNzL2ZhY2Vib29rJyxcbiAgICAgIGRhdGE6IHtcbiAgICAgICAgZGF5X2xpbWl0OiBkYXlzXG4gICAgICB9XG4gICAgfSkuc3VjY2VzcyhmdW5jdGlvbihzdWNjZXNzX2h0dHApIHtcbiAgICAgICRzY29wZS5kaXNwbGF5RXJyb3IgPSBmYWxzZTtcbiAgICAgICRzY29wZS5kYXlzQ2FsbGJhY2tGdW5jdGlvbiA9ICdhdXRoRmFjYm9vayc7XG4gICAgICAkc2NvcGUuc2hvd0RheUNoYW5nZXIgPSB0cnVlO1xuICAgICAgJHNjb3BlLmdyYXBoX2RhdGEgPSBzdWNjZXNzX2h0dHA7XG4gICAgICAkc2NvcGUuZW5hYmxlR3JhcGggPSB0cnVlO1xuICAgIH0pLmVycm9yKGZ1bmN0aW9uKCkge1xuICAgICAgRkIubG9naW4oZnVuY3Rpb24ocmVzcG9uc2VfdG9rZW4sIHN1Y2Nlc3MpIHtcbiAgICAgICAgaWYgKCFyZXNwb25zZV90b2tlbi5hdXRoUmVzcG9uc2UpIHJldHVybiBjb25zb2xlLmxvZyhcIlVzZXIgZGlkIG5vdCBhdXRob3JpemUgZnVsbHkhXCIpO1xuICAgICAgICAkaHR0cCh7XG4gICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgdXJsOiAnL2FwaS9hbmFseXRpY3MvZmFjZWJvb2snLFxuICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIGFjY2Vzc190b2tlbjogcmVzcG9uc2VfdG9rZW4uYXV0aFJlc3BvbnNlLmFjY2Vzc1Rva2VuXG4gICAgICAgICAgfVxuICAgICAgICB9KS5zdWNjZXNzKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgJHNjb3BlLmZhY2Vib29rUGFnZXMgPSByZXNwb25zZS5wYWdlcztcbiAgICAgICAgICAkc2NvcGUuc2hvd0ZhY2Vib29rUGFnZXMgPSB0cnVlO1xuICAgICAgICB9KS5lcnJvcihmdW5jdGlvbihlcnJvcikge1xuICAgICAgICAgIGFsZXJ0KFwiRXJyb3Igd2hpbGUgcmVnaXN0ZXJpbmcgcGFnZSA6XCIgKyBlcnJvcik7XG4gICAgICAgIH0pO1xuICAgICAgICAvLyRzY29wZS5hY2Nlc3NUb2tlbiA9IHJlc3BvbnNlX3Rva2VuLmFjY2Vzc1Rva2VuO1xuICAgICAgfSwge1xuICAgICAgICBzY29wZTogJ3BhZ2VzX3Nob3dfbGlzdCx1c2VyX2xpa2VzJ1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLmF1dGhUd2l0dGVyID0gZnVuY3Rpb24oYWNjY2Vzc19rZXksIGRheXMpIHtcbiAgICAkc2NvcGUuc2hvd0RheUNoYW5nZXIgPSBmYWxzZTtcbiAgICAkc2NvcGUuZW5hYmxlR3JhcGggPSBmYWxzZTtcbiAgICAkaHR0cCh7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIHVybDogJy9hcGkvYW5hbHl0aWNzL3R3aXR0ZXInLFxuICAgICAgZGF0YToge1xuICAgICAgICBkYXlfbGltaXQ6IGRheXNcbiAgICAgIH1cbiAgICB9KS50aGVuKGZ1bmN0aW9uKHN1Y2Nlc3MpIHtcbiAgICAgICRzY29wZS5kYXlzQ2FsbGJhY2tGdW5jdGlvbiA9ICdhdXRoVHdpdHRlcic7XG4gICAgICAkc2NvcGUuc2hvd0RheUNoYW5nZXIgPSB0cnVlO1xuICAgICAgJHNjb3BlLmdyYXBoX2RhdGEgPSBzdWNjZXNzLmRhdGE7XG4gICAgICAkc2NvcGUuZW5hYmxlR3JhcGggPSB0cnVlO1xuICAgIH0sIGZ1bmN0aW9uKGZhaWx1cmUpIHtcbiAgICAgICRhdXRoLmF1dGhlbnRpY2F0ZSgndHdpdHRlcicpLnRoZW4oZnVuY3Rpb24oc3VjY2Vzc190d2l0dGVyKSB7XG4gICAgICAgICRodHRwKHtcbiAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICB1cmw6ICcvYXBpL2FuYWx5dGljcy90d2l0dGVyJyxcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBhY2Nlc3NfdG9rZW5fa2V5OiBzdWNjZXNzX3R3aXR0ZXIuZGF0YS5vYXV0aF90b2tlbixcbiAgICAgICAgICAgIGFjY2Vzc190b2tlbl9zZWNyZXQ6IHN1Y2Nlc3NfdHdpdHRlci5kYXRhLm9hdXRoX3Rva2VuX3NlY3JldCxcbiAgICAgICAgICAgIHNjcmVlbl9uYW1lOiBzdWNjZXNzX3R3aXR0ZXIuZGF0YS5zY3JlZW5fbmFtZVxuICAgICAgICAgIH1cbiAgICAgICAgfSkudGhlbihmdW5jdGlvbihzdWNjZXNzKSB7XG4gICAgICAgICAgJHNjb3BlLnNob3dGb2xsb3dlcnMgPSBmYWxzZTtcbiAgICAgICAgICAkc2NvcGUuYXV0aFR3aXR0ZXIoKTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhlcnJvcik7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSk7XG4gIH07XG5cbiAgJHNjb3BlLmF1dGhJbnN0YWdyYW0gPSBmdW5jdGlvbihjaGFubmVsSWQsIGRheXMpIHtcbiAgICAkc2NvcGUuc2hvd0RheUNoYW5nZXIgPSBmYWxzZTtcbiAgICAkc2NvcGUuZW5hYmxlR3JhcGggPSBmYWxzZTtcbiAgICAkaHR0cCh7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIHVybDogJy9hcGkvYW5hbHl0aWNzL2luc3RhZ3JhbScsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGRheV9saW1pdDogZGF5c1xuICAgICAgfVxuICAgIH0pLnRoZW4oZnVuY3Rpb24oc3VjY2Vzcykge1xuICAgICAgJHNjb3BlLmRheXNDYWxsYmFja0Z1bmN0aW9uID0gJ2F1dGhJbnN0YWdyYW0nO1xuICAgICAgJHNjb3BlLnNob3dEYXlDaGFuZ2VyID0gdHJ1ZTtcbiAgICAgICRzY29wZS5ncmFwaF9kYXRhID0gc3VjY2Vzcy5kYXRhO1xuICAgICAgJHNjb3BlLmVuYWJsZUdyYXBoID0gdHJ1ZTtcbiAgICB9LCBmdW5jdGlvbihmYWlsdXJlKSB7XG4gICAgICAkYXV0aC5hdXRoZW50aWNhdGUoJ2luc3RhZ3JhbScpLnRoZW4oZnVuY3Rpb24oc3VjY2Vzcykge1xuICAgICAgICAkaHR0cCh7XG4gICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgdXJsOiAnL2FwaS9hbmFseXRpY3MvaW5zdGFncmFtJyxcbiAgICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBhY2Nlc3NfdG9rZW46IHN1Y2Nlc3MuYWNjZXNzX3Rva2VuXG4gICAgICAgICAgfVxuICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHN1Y2Nlc3MpIHtcbiAgICAgICAgICAkc2NvcGUuYXV0aEluc3RhZ3JhbSgpO1xuICAgICAgICB9LCBmdW5jdGlvbihmYWlsdXJlKSB7XG4gICAgICAgICAgcmV0dXJuIGNvbnNvbGUubG9nKFwiPGF1dGhJbnN0YWdyYW0+ZmFpbGVkIHdoZW4gdHJ5aW5nIHRvIHJlZ2lzdGVyIHVzZXJcIiArIEpTT04uc3RyaW5naWZ5KGZhaWx1cmUpKTtcbiAgICAgICAgfSk7XG4gICAgICB9LCBmdW5jdGlvbihmYWlsdXJlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZmFpbHVyZSB3aGlsZSBhdXRoZW50aWNhdGlvbiBvZiBpbnN0YWdyYW1cIiArIEpTT04uc3RyaW5naWZ5KGZhaWx1cmUpKTtcbiAgICAgIH0pO1xuICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5hdXRoWW91dHViZSA9IGZ1bmN0aW9uKGNoYW5uZWxJZCwgZGF5cykge1xuICAgICRzY29wZS5zaG93RGF5Q2hhbmdlciA9IGZhbHNlO1xuICAgIGlmIChjaGFubmVsSWQpIHsgLy9jYWxsaW5nIGZvciByZWdpc3RyYXRpb24gIVxuICAgICAgYWxlcnQoXCJyZWdpc3RlcmluZyBDaGFubmVsLCBwbGVhc2UgcmVmcmVzaCBhZnRlciBmZXcgbW9tZW50cyB0byBsb2FkIGFuYWx5dGljcyBkYXRhXCIpO1xuICAgICAgcmV0dXJuICRodHRwKHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIHVybDogJy9hcGkvYW5hbHl0aWNzL3lvdXR1YmUvc3RhdHMnLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgcmVnaXN0ZXI6IHRydWUsXG4gICAgICAgICAgY2hhbm5lbElkOiBjaGFubmVsSWRcbiAgICAgICAgfVxuICAgICAgfSkudGhlbihmdW5jdGlvbihzdWNjZXNzKSB7XG4gICAgICAgICRzY29wZS5zaG93WW91dHViZUNoYW5uZWwgPSBmYWxzZTtcbiAgICAgICAgZGVsZXRlICRzY29wZS55b3V0dWJlQ2hhbm5lbDtcbiAgICAgICAgY29uc29sZS5sb2coc3VjY2Vzcyk7XG4gICAgICAgICRzY29wZS5hdXRoWW91dHViZSgpO1xuICAgICAgfSwgZnVuY3Rpb24oZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyb3IpO1xuICAgICAgfSk7XG4gICAgfVxuICAgICRzY29wZS5lbmFibGVHcmFwaCA9IGZhbHNlO1xuICAgICRodHRwKHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgdXJsOiAnL2FwaS9hbmFseXRpY3MveW91dHViZS9zdGF0cycsXG4gICAgICBkYXRhOiB7XG4gICAgICAgIGRheV9saW1pdDogZGF5c1xuICAgICAgfVxuICAgIH0pLnN1Y2Nlc3MoZnVuY3Rpb24oc3VjY2Vzc19odHRwKSB7XG4gICAgICAkc2NvcGUuZGlzcGxheUVycm9yID0gZmFsc2U7XG4gICAgICAkc2NvcGUuZGF5c0NhbGxiYWNrRnVuY3Rpb24gPSAnYXV0aFlvdXR1YmUnO1xuICAgICAgJHNjb3BlLnNob3dEYXlDaGFuZ2VyID0gdHJ1ZTtcbiAgICAgICRzY29wZS5ncmFwaF9kYXRhID0gc3VjY2Vzc19odHRwO1xuICAgICAgJHNjb3BlLmVuYWJsZUdyYXBoID0gdHJ1ZTtcbiAgICB9KS5lcnJvcihmdW5jdGlvbigpIHtcbiAgICAgICRhdXRoLmF1dGhlbnRpY2F0ZSgnZ29vZ2xlJykudGhlbihmdW5jdGlvbihzdWNjZXNzKSB7XG4gICAgICAgICRzY29wZS55b3V0dWJlQ2hhbm5lbCA9IHN1Y2Nlc3MuZGF0YTtcbiAgICAgICAgJHNjb3BlLnNob3dZb3V0dWJlQ2hhbm5lbCA9IHRydWU7XG4gICAgICB9LCBmdW5jdGlvbihmYWlsdXJlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiZmFpbGVkIGZyb20gYXV0aG9yaXphdGlvbiBzZXJ2ZXI+Pj4+XCIgKyBKU09OLnN0cmluZ2lmeShmYWlsdXJlKSk7XG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcbiAgJHNjb3BlLmFsZXJ0ID0gZnVuY3Rpb24oZGF0YSkge1xuICAgIGFsZXJ0KGRhdGEpO1xuICB9O1xufSk7XG5hcHAuY29udHJvbGxlcignZ3JhcGhDb250cm9sZXInLCBmdW5jdGlvbigkc2NvcGUpIHtcbiAgLy8gJHNjb3BlLmRhdGEgPSBbe1xuICAvLyAgICAga2V5OiBcIkN1bXVsYXRpdmUgUmV0dXJuXCIsXG4gIC8vICAgICB2YWx1ZXM6IHZhbHVlX2FycmF5XG4gIC8vIH1dO1xuICAkc2NvcGUub3B0aW9ucyA9IHtcbiAgICBtYXJnaW46IHtcbiAgICAgIHRvcDogMjBcbiAgICB9LFxuICAgIHNlcmllczogW3tcbiAgICAgIGF4aXM6IFwieVwiLFxuICAgICAgZGF0YXNldDogXCJ0aW1lZFwiLFxuICAgICAga2V5OiBcInZhbF8wXCIsXG4gICAgICBsYWJlbDogXCJBbmFseXRpY3MgZGF0YVwiLFxuICAgICAgY29sb3I6IFwiaHNsYSg4OCwgNDglLCA0OCUsIDEpXCIsXG4gICAgICB0eXBlOiBbXG4gICAgICAgIFwibGluZVwiXG4gICAgICBdLFxuICAgICAgaWQ6IFwibXlTZXJpZXMwXCJcbiAgICB9XSxcbiAgICBheGVzOiB7XG4gICAgICB4OiB7XG4gICAgICAgIGtleTogXCJ4XCIsXG4gICAgICAgIHR5cGU6IFwiZGF0ZVwiXG4gICAgICB9XG4gICAgfVxuICB9O1xuICAkc2NvcGUuZGF0YSA9IHtcbiAgICB0aW1lZDogW11cbiAgfTtcbiAgZm9yICh2YXIgbG9jYWxfZGF0YSBpbiAkc2NvcGUuZ3JhcGhfZGF0YSkge1xuICAgICRzY29wZS5kYXRhLnRpbWVkLnB1c2goe1xuICAgICAgeDogbG9jYWxfZGF0YSxcbiAgICAgIHZhbF8wOiAkc2NvcGUuZ3JhcGhfZGF0YVtsb2NhbF9kYXRhXVxuICAgIH0pO1xuICB9XG4gIGZvciAodmFyIGkgaW4gJHNjb3BlLmRhdGEudGltZWQpIHtcbiAgICAkc2NvcGUuZGF0YS50aW1lZFtpXS54ID0gbmV3IERhdGUoJHNjb3BlLmRhdGEudGltZWRbaV0ueCk7XG4gIH1cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2FydGlzdFRvb2xzJywge1xuICAgICAgdXJsOiAnL2FydGlzdFRvb2xzJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvYXJ0aXN0VG9vbHMvQXJ0aXN0VG9vbHMvYXJ0aXN0VG9vbHMuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQXJ0aXN0VG9vbHNDb250cm9sbGVyJyxcbiAgICAgIGFic3RyYWN0OiB0cnVlLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICBhbGxvd2VkOiBmdW5jdGlvbigkcSwgJHN0YXRlLCBTZXNzaW9uU2VydmljZSkge1xuICAgICAgICAgIHZhciBkZWZlcnJlZCA9ICRxLmRlZmVyKCk7XG4gICAgICAgICAgdmFyIHVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XG4gICAgICAgICAgaWYgKHVzZXIpIHtcbiAgICAgICAgICAgIGRlZmVycmVkLnJlc29sdmUoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZGVmZXJyZWQucmVqZWN0KCk7XG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvbG9naW4nO1xuICAgICAgICAgIH1cbiAgICAgICAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pXG4gICAgLnN0YXRlKCdhcnRpc3RUb29sc1Byb2ZpbGUnLCB7XG4gICAgICB1cmw6ICcvYXJ0aXN0VG9vbHMvcHJvZmlsZScsXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2FydGlzdFRvb2xzL0FydGlzdFRvb2xzL3Byb2ZpbGUuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQXJ0aXN0VG9vbHNDb250cm9sbGVyJ1xuICAgIH0pXG4gICAgLnN0YXRlKCdhcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheUxpc3QnLCB7XG4gICAgICB1cmw6ICcvYXJ0aXN0VG9vbHMvZG93bmxvYWRHYXRld2F5JyxcbiAgICAgIHBhcmFtczoge1xuICAgICAgICBzdWJtaXNzaW9uOiBudWxsXG4gICAgICB9LFxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hcnRpc3RUb29scy9BcnRpc3RUb29scy9kb3dubG9hZEdhdGV3YXkubGlzdC5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdBcnRpc3RUb29sc0NvbnRyb2xsZXInXG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignQXJ0aXN0VG9vbHNDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsICRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgJHdpbmRvdywgJHVpYk1vZGFsLCAkdGltZW91dCwgU2Vzc2lvblNlcnZpY2UsIEFydGlzdFRvb2xzU2VydmljZSkge1xuICAgICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xuICAgIGlmICghU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSB7XG4gICAgICB2YXIgcGF0aCA9IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZTtcbiAgICAgIGlmIChwYXRoID09IFwiL2FydGlzdFRvb2xzL3Byb2ZpbGVcIikge1xuICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdyZXR1cm5zdGF0ZScsICdhcnRpc3RUb29sc1Byb2ZpbGUnKTtcbiAgICAgIH0gZWxzZSBpZiAocGF0aCA9PSBcIi9hcnRpc3RUb29scy9kb3dubG9hZEdhdGV3YXlcIikge1xuICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdyZXR1cm5zdGF0ZScsICdhcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheUxpc3QnKTtcbiAgICAgIH1cbiAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJHJvb3RTY29wZS51c2VybGlua2VkQWNjb3VudHMgPSAoJHNjb3BlLnVzZXIubGlua2VkQWNjb3VudHMgPyAkc2NvcGUudXNlci5saW5rZWRBY2NvdW50cyA6IFtdKTtcbiAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3JldHVybnN0YXRlJyk7XG4gICAgfVxuICAgICRzY29wZS5saW5rZWRBY2NvdW50RGF0YSA9IHt9O1xuICAgICRzY29wZS50aGlyZFBhcnR5SW5mbyA9ICgkc2NvcGUudXNlci50aGlyZFBhcnR5SW5mbyA/ICRzY29wZS51c2VyLnRoaXJkUGFydHlJbmZvIDogbnVsbCk7XG4gICAgJHNjb3BlLmhhc1RoaXJkUGFydHlGaWVsZHMgPSAoJHNjb3BlLnVzZXIudGhpcmRQYXJ0eUluZm8gPyB0cnVlIDogZmFsc2UpO1xuICAgIC8qIEluaXQgYm9vbGVhbiB2YXJpYWJsZXMgZm9yIHNob3cvaGlkZSBhbmQgb3RoZXIgZnVuY3Rpb25hbGl0aWVzICovXG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IGZhbHNlO1xuICAgICRzY29wZS5tZXNzYWdlID0ge1xuICAgICAgdmFsOiAnJyxcbiAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgfTtcblxuICAgIC8qIEluaXQgZG93bmxvYWRHYXRld2F5IGxpc3QgKi9cblxuICAgICRzY29wZS5kb3dubG9hZEdhdGV3YXlMaXN0ID0gW107XG5cbiAgICAvKiBJbml0IG1vZGFsIGluc3RhbmNlIHZhcmlhYmxlcyBhbmQgbWV0aG9kcyAqL1xuXG4gICAgJHNjb3BlLm1vZGFsSW5zdGFuY2UgPSB7fTtcbiAgICAkc2NvcGUubW9kYWwgPSB7fTtcblxuICAgICRzY29wZS5vcGVuTW9kYWwgPSB7XG4gICAgICBkb3dubG9hZFVSTDogZnVuY3Rpb24oZG93bmxvYWRVUkwpIHtcbiAgICAgICAgJHNjb3BlLm1vZGFsLmRvd25sb2FkVVJMID0gZG93bmxvYWRVUkw7XG4gICAgICAgICRzY29wZS5tb2RhbEluc3RhbmNlID0gJHVpYk1vZGFsLm9wZW4oe1xuICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2Rvd25sb2FkVVJMLmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdBcnRpc3RUb29sc0NvbnRyb2xsZXInLFxuICAgICAgICAgIHNjb3BlOiAkc2NvcGVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgICAvL292ZXJsYXkgYXV0b2ZpbGwgdHJhY2sgc3RhcnQvL1xuICAgICRzY29wZS5saW5rZWRBY2NvdW50cyA9IFtdO1xuICAgICRzY29wZS5hdXRvRmlsbFRyYWNrcyA9IFtdO1xuICAgICRzY29wZS50cmFja0xpc3QgPSBbXTtcbiAgICAkc2NvcGUudHJhY2tMaXN0T2JqID0gbnVsbDtcbiAgICAkc2NvcGUudHJhY2tMaXN0U2xvdE9iaiA9IG51bGw7XG4gICAgJHNjb3BlLm5ld1F1ZXVlU29uZyA9IFwiXCI7XG4gICAgJHNjb3BlLnRyYWNrc1F1ZXVlID0gW107XG5cbiAgICAkc2NvcGUudHJhY2tDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgJHNjb3BlLm1ha2VFdmVudFVSTCA9ICRzY29wZS50cmFja0xpc3RTbG90T2JqLnBlcm1hbGlua191cmw7XG4gICAgICAkc2NvcGUuY2hhbmdlVVJMKCk7XG4gICAgfTtcblxuICAgICRzY29wZS50cmFja0xpc3RDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgJHNjb3BlLm5ld1F1ZXVlU29uZyA9ICRzY29wZS50cmFja0xpc3RPYmoucGVybWFsaW5rX3VybDtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICRzY29wZS5jaGFuZ2VRdWV1ZVNvbmcoKTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnNob3dUaHJpZFBhcnR5Qm94ID0gZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUuaGFzVGhpcmRQYXJ0eUZpZWxkcyA9IHRydWU7XG4gICAgfVxuXG4gICAgJHNjb3BlLmFkZFNvbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgkc2NvcGUudXNlci5xdWV1ZS5pbmRleE9mKCRzY29wZS5uZXdRdWV1ZUlEKSAhPSAtMSkgcmV0dXJuO1xuICAgICAgaWYgKCRzY29wZS50cmFja3NRdWV1ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJHNjb3BlLnRyYWNrc1F1ZXVlLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKCRzY29wZS51c2VyLnF1ZXVlLmluZGV4T2YoJHNjb3BlLnRyYWNrc1F1ZXVlW2ldKSA9PSAtMSkge1xuICAgICAgICAgICAgJHNjb3BlLnVzZXIucXVldWUucHVzaCgkc2NvcGUudHJhY2tzUXVldWVbaV0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoJHNjb3BlLm5ld1F1ZXVlSUQgIT0gbnVsbCl7XG4gICAgICAgICRzY29wZS51c2VyLnF1ZXVlLnB1c2goJHNjb3BlLm5ld1F1ZXVlSUQpO1xuICAgICAgfVxuICAgICAgfVxuICAgICAgJHNjb3BlLnNhdmVVc2VyKCk7XG4gICAgICAkc2NvcGUubmV3UXVldWVTb25nID0gdW5kZWZpbmVkO1xuICAgICAgJHNjb3BlLnRyYWNrTGlzdE9iaiA9IFwiXCI7XG4gICAgICAkc2NvcGUubmV3UXVldWUgPSB1bmRlZmluZWQ7XG4gICAgICAkc2NvcGUudHJhY2tzUXVldWUgPSBbXTtcbiAgICB9XG5cbiAgICAkc2NvcGUuY2hhbmdlUXVldWVTb25nID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoJHNjb3BlLm5ld1F1ZXVlU29uZyAhPSBcIlwiKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICAgJGh0dHAucG9zdCgnL2FwaS9zb3VuZGNsb3VkL3Jlc29sdmUnLCB7XG4gICAgICAgICAgICB1cmw6ICRzY29wZS5uZXdRdWV1ZVNvbmdcbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIHZhciB0cmFjayA9IHJlcy5kYXRhO1xuICAgICAgICAgICAgaWYgKHRyYWNrLmtpbmQgPT0gXCJwbGF5bGlzdFwiKSB7XG4gICAgICAgICAgICAgIHZhciB0cmFja3NBcnIgPSB0cmFjay50cmFja3M7XG4gICAgICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaCh0cmFja3NBcnIsIGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUubmV3UXVldWVJRCA9IHQuaWQ7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrc1F1ZXVlLnB1c2goJHNjb3BlLm5ld1F1ZXVlSUQpO1xuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICRzY29wZS5uZXdRdWV1ZSA9IHRyYWNrO1xuICAgICAgICAgICAgICAkc2NvcGUubmV3UXVldWVJRCA9IHRyYWNrLmlkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJXZSBhcmUgbm90IGFsbG93ZWQgdG8gYWNjZXNzIHRyYWNrcyBieSB0aGlzIGFydGlzdCB3aXRoIHRoZSBTb3VuZGNsb3VkIEFQSS4gV2UgYXBvbG9naXplIGZvciB0aGUgaW5jb252ZW5pZW5jZSwgYW5kIHdlIGFyZSB3b3JraW5nIHdpdGggU291bmRjbG91ZCB0byByZXNvbHZlIHRoaXMgaXNzdWUuXCIpO1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAkc2NvcGUuc2F2ZVVzZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICRodHRwLnB1dChcIi9hcGkvZGF0YWJhc2UvcHJvZmlsZVwiLCAkc2NvcGUudXNlcilcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlKHJlcy5kYXRhKTtcbiAgICAgICAgICAkc2NvcGUudXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICRzY29wZS5sb2FkUXVldWVTb25ncygpO1xuICAgICAgICAgIC8vICR3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICQuWmVicmFfRGlhbG9nKFwiRXJyb3I6IGRpZCBub3Qgc2F2ZVwiKTtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICQoJyNhdXRvRmlsbFRyYWNrJykubW9kYWwoJ2hpZGUnKTtcbiAgICB9XG5cbiAgICAkc2NvcGUuZ2V0VHJhY2tMaXN0RnJvbVNvdW5kY2xvdWQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwcm9maWxlID0gJHNjb3BlLnVzZXI7XG4gICAgICBpZiAocHJvZmlsZS5zb3VuZGNsb3VkKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICAgU0MuZ2V0KCcvdXNlcnMvJyArIHByb2ZpbGUuc291bmRjbG91ZC5pZCArICcvdHJhY2tzJywge1xuICAgICAgICAgICAgZmlsdGVyOiAncHVibGljJ1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24odHJhY2tzKSB7XG4gICAgICAgICAgICAkc2NvcGUudHJhY2tMaXN0ID0gdHJhY2tzO1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAkc2NvcGUucmVtb3ZlUXVldWVTb25nID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgICRzY29wZS51c2VyLnF1ZXVlLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAkc2NvcGUuc2F2ZVVzZXIoKVxuICAgICAgLy8kc2NvcGUubG9hZFF1ZXVlU29uZ3MoKTtcbiAgICB9XG5cbiAgICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MgPSBmdW5jdGlvbihxdWV1ZSkge1xuICAgICAgJHNjb3BlLmF1dG9GaWxsVHJhY2tzID0gW107XG4gICAgICAkc2NvcGUudXNlci5xdWV1ZS5mb3JFYWNoKGZ1bmN0aW9uKHNvbmdJRCkge1xuICAgICAgICBTQy5nZXQoJy90cmFja3MvJyArIHNvbmdJRClcbiAgICAgICAgICAudGhlbihmdW5jdGlvbih0cmFjaykge1xuICAgICAgICAgICAgJHNjb3BlLmF1dG9GaWxsVHJhY2tzLnB1c2godHJhY2spO1xuICAgICAgICAgICAgJHNjb3BlLiRkaWdlc3QoKTtcbiAgICAgICAgICB9LCBjb25zb2xlLmxvZyk7XG4gICAgICB9KVxuICAgIH1cbiAgICBpZiAoJHNjb3BlLnVzZXIgJiYgJHNjb3BlLnVzZXIucXVldWUpIHtcbiAgICAgICRzY29wZS5sb2FkUXVldWVTb25ncygpO1xuICAgIH1cbiAgICAvL292ZXJsYXkgYXV0b2ZpbGwgdHJhY2sgZW5kLy9cbiAgICAkc2NvcGUuY2xvc2VNb2RhbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLm1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLm9wZW5IZWxwTW9kYWwgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgkc3RhdGUuY3VycmVudC51cmwgPT0gJy9hcnRpc3RUb29scy9wcm9maWxlJykge1xuICAgICAgICB2YXIgZGlzcGxheVRleHQgPSBcIjxoMz5IZWxwPC9oMz48c3BhbiBzdHlsZT0nZm9udC13ZWlnaHQ6Ym9sZCc+UGVybWFuZW50IExpbmtzOjwvc3Bhbj4gQWRkIGFydGlzdCBzb3VuZGNsb3VkIHVybHMgaGVyZSB0byBtYWtlIHRoZSBhcnRpc3RzIGZvbGxvd2VkIG9uIGV2ZXJ5IG9uZSBvZiB5b3VyIGRvd25sb2FkIGdhdGVzLjxicj48YnI+PGEgc3R5bGU9J3RleHQtYWxpZ246Y2VudGVyOyBtYXJnaW46MCBhdXRvOycgaHJlZj0nbWFpbHRvOmNvYXlzY3VlQGFydGlzdHN1bmxpbWl0ZWQuY28/c3ViamVjdD1BcnRpc3RzIFVubGltaXRlZCBIZWxwJyB0YXJnZXQ9J190b3AnPkVtYWlsIFRlY2ggU3VwcG9ydDwvYT5cIjtcbiAgICAgIH0gZWxzZSBpZiAoJHN0YXRlLmN1cnJlbnQudXJsID09ICcvYXJ0aXN0VG9vbHMvZG93bmxvYWRHYXRld2F5Jykge1xuICAgICAgICB2YXIgZGlzcGxheVRleHQgPSBcIjxoMz5IZWxwPC9oMz48c3BhbiBzdHlsZT0nZm9udC13ZWlnaHQ6Ym9sZCc+TGlzdCBvZiBkb3dubG9hZHMgZ2F0ZXdheXM6PC9zcGFuPiBUaGlzIGlzIGEgbGlzdCBvZiB5b3VyIGRvd25sb2FkIGdhdGVzLiBZb3UgY2FuIGNyZWF0ZSBhIG5ldyBvbmUsIGVkaXQsIGRlbGV0ZSBvbmUgb3IgdmlldyBhIGRvd25sb2FkIGdhdGUgaW4gdGhlIGxpc3QuPGJyPjxicj48YSBzdHlsZT0ndGV4dC1hbGlnbjpjZW50ZXI7IG1hcmdpbjowIGF1dG87JyBocmVmPSdtYWlsdG86Y29heXNjdWVAYXJ0aXN0c3VubGltaXRlZC5jbz9zdWJqZWN0PUFydGlzdHMgVW5saW1pdGVkIEhlbHAnIHRhcmdldD0nX3RvcCc+RW1haWwgVGVjaCBTdXBwb3J0PC9hPlwiO1xuICAgICAgfVxuICAgICAgJC5aZWJyYV9EaWFsb2coZGlzcGxheVRleHQsIHtcbiAgICAgICAgd2lkdGg6IDYwMFxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgJHNjb3BlLmVkaXRQcm9maWxlTW9kYWxJbnN0YW5jZSA9IHt9O1xuICAgICRzY29wZS5lZGl0UHJvZmlsZW1vZGFsID0ge307XG4gICAgJHNjb3BlLm9wZW5FZGl0UHJvZmlsZU1vZGFsID0ge1xuICAgICAgZWRpdFByb2ZpbGU6IGZ1bmN0aW9uKGZpZWxkKSB7XG4gICAgICAgICRzY29wZS5wcm9maWxlLmZpZWxkID0gZmllbGQ7XG4gICAgICAgICR0aW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRzY29wZS5lZGl0UHJvZmlsZU1vZGFsSW5zdGFuY2UgPSAkdWliTW9kYWwub3Blbih7XG4gICAgICAgICAgICBhbmltYXRpb246IHRydWUsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2VkaXRQcm9maWxlLmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0FydGlzdFRvb2xzQ29udHJvbGxlcicsXG4gICAgICAgICAgICBzY29wZTogJHNjb3BlXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0sIDApO1xuICAgICAgfVxuICAgIH07XG5cbiAgICAkc2NvcGUuY2xvc2VFZGl0UHJvZmlsZU1vZGFsID0gZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUuc2hvd1Byb2ZpbGVJbmZvKCk7XG4gICAgICBpZiAoJHNjb3BlLmVkaXRQcm9maWxlTW9kYWxJbnN0YW5jZS5jbG9zZSkge1xuICAgICAgICAkc2NvcGUuZWRpdFByb2ZpbGVNb2RhbEluc3RhbmNlLmNsb3NlKCk7XG4gICAgICB9XG4gICAgfTtcblxuICAgICRzY29wZS50aGFua1lvdU1vZGFsSW5zdGFuY2UgPSB7fTtcbiAgICAkc2NvcGUudGhhbmtZb3VNb2RhbCA9IHt9O1xuICAgICRzY29wZS5vcGVuVGhhbmtZb3VNb2RhbCA9IHtcbiAgICAgIHRoYW5rWW91OiBmdW5jdGlvbihzdWJtaXNzaW9uSUQpIHtcbiAgICAgICAgJHNjb3BlLnRoYW5rWW91TW9kYWwuc3VibWlzc2lvbklEID0gc3VibWlzc2lvbklEO1xuICAgICAgICAkc2NvcGUubW9kYWxJbnN0YW5jZSA9ICR1aWJNb2RhbC5vcGVuKHtcbiAgICAgICAgICBhbmltYXRpb246IHRydWUsXG4gICAgICAgICAgdGVtcGxhdGVVcmw6ICd0aGFua1lvdS5odG1sJyxcbiAgICAgICAgICBjb250cm9sbGVyOiAnT3BlblRoYW5rWW91TW9kYWxDb250cm9sbGVyJyxcbiAgICAgICAgICBzY29wZTogJHNjb3BlXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH07XG4gICAgJHNjb3BlLmNsb3NlVGhhbmtZb3VNb2RhbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLnRoYW5rWW91TW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xuICAgIH07XG4gICAgLyogSW5pdCBwcm9maWxlICovXG4gICAgJHNjb3BlLnByb2ZpbGUgPSB7fTtcbiAgICBpZiAoJHN0YXRlUGFyYW1zLnN1Ym1pc3Npb24pIHtcbiAgICAgICRzY29wZS5vcGVuVGhhbmtZb3VNb2RhbC50aGFua1lvdSgkc3RhdGVQYXJhbXMuc3VibWlzc2lvbi5faWQpO1xuICAgIH1cbiAgICAkc2NvcGUuc2hvd1Byb2ZpbGVJbmZvID0gZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUucHJvZmlsZS5kYXRhID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xuICAgICAgaWYgKCgkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzICYmICRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3MubGVuZ3RoID09PSAwKSB8fCAhJHNjb3BlLnByb2ZpbGUuZGF0YS5wZXJtYW5lbnRMaW5rcykge1xuICAgICAgICAkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzID0gW3tcbiAgICAgICAgICB1cmw6ICcnLFxuICAgICAgICAgIGF2YXRhcjogJycsXG4gICAgICAgICAgdXNlcm5hbWU6ICcnLFxuICAgICAgICAgIGlkOiAtMSxcbiAgICAgICAgICBwZXJtYW5lbnRMaW5rOiB0cnVlXG4gICAgICAgIH1dO1xuICAgICAgfTtcbiAgICAgICRzY29wZS5wcm9maWxlLmlzQXZhaWxhYmxlID0ge307XG4gICAgICAkc2NvcGUucHJvZmlsZS5pc0F2YWlsYWJsZS5lbWFpbCA9ICRzY29wZS5wcm9maWxlLmRhdGEuZW1haWwgPyB0cnVlIDogZmFsc2U7XG4gICAgICAkc2NvcGUucHJvZmlsZS5pc0F2YWlsYWJsZS5wYXNzd29yZCA9ICRzY29wZS5wcm9maWxlLmRhdGEucGFzc3dvcmQgPyB0cnVlIDogZmFsc2U7XG4gICAgICAkc2NvcGUucHJvZmlsZS5pc0F2YWlsYWJsZS5zb3VuZGNsb3VkID0gJHNjb3BlLnByb2ZpbGUuZGF0YS5zb3VuZGNsb3VkID8gdHJ1ZSA6IGZhbHNlO1xuICAgICAgJHNjb3BlLnByb2ZpbGUuZGF0YS5wYXNzd29yZCA9ICcnO1xuICAgIH07XG5cbiAgICAkc2NvcGUuc2F2ZVByb2ZpbGVJbmZvID0gZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgICAgdmFsdWU6ICcnLFxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgfTtcbiAgICAgIHZhciBwZXJtYW5lbnRMaW5rcyA9ICRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3MuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGl0ZW0uaWQgIT09IC0xO1xuICAgICAgfSkubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgZGVsZXRlIGl0ZW1bJyQkaGFzaEtleSddO1xuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgIH0pO1xuXG4gICAgICB2YXIgc2VuZE9iaiA9IHtcbiAgICAgICAgbmFtZTogJycsXG4gICAgICAgIHBhc3N3b3JkOiAnJyxcbiAgICAgICAgZW1haWw6ICcnLFxuICAgICAgICBwZXJtYW5lbnRMaW5rczogSlNPTi5zdHJpbmdpZnkocGVybWFuZW50TGlua3MpXG4gICAgICB9XG4gICAgICBpZiAoJHNjb3BlLnByb2ZpbGUuZmllbGQgPT09ICduYW1lJykge1xuICAgICAgICBzZW5kT2JqLm5hbWUgPSAkc2NvcGUucHJvZmlsZS5kYXRhLm5hbWU7XG4gICAgICB9IGVsc2UgaWYgKCRzY29wZS5wcm9maWxlLmZpZWxkID09PSAncGFzc3dvcmQnKSB7XG4gICAgICAgIHNlbmRPYmoucGFzc3dvcmQgPSAkc2NvcGUucHJvZmlsZS5kYXRhLnBhc3N3b3JkO1xuICAgICAgfSBlbHNlIGlmICgkc2NvcGUucHJvZmlsZS5maWVsZCA9PT0gJ2VtYWlsJykge1xuICAgICAgICBzZW5kT2JqLmVtYWlsID0gJHNjb3BlLnByb2ZpbGUuZGF0YS5lbWFpbDtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgQXJ0aXN0VG9vbHNTZXJ2aWNlXG4gICAgICAgIC5zYXZlUHJvZmlsZUluZm8oc2VuZE9iailcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICBpZiAocmVzLmRhdGEgPT09ICdFbWFpbCBFcnJvcicpIHtcbiAgICAgICAgICAgICRzY29wZS5tZXNzYWdlID0ge1xuICAgICAgICAgICAgICB2YWx1ZTogJ0VtYWlsIGFscmVhZHkgZXhpc3RzIScsXG4gICAgICAgICAgICAgIHZpc2libGU6IHRydWVcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmIChwZXJtYW5lbnRMaW5rcyAhPSBcIlwiKSB7XG4gICAgICAgICAgICAkc2NvcGUubGlua1VybCA9IFwiXCI7XG4gICAgICAgICAgfVxuICAgICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZShyZXMuZGF0YSk7XG4gICAgICAgICAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XG4gICAgICAgICAgJHNjb3BlLmNsb3NlRWRpdFByb2ZpbGVNb2RhbCgpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZygnZXJyb3Igc2F2aW5nJyk7XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICAvLyBBZGQgdGhpcmQgcGFydHkgY3JlZGVudGlhbHNcbiAgICAkc2NvcGUuYWRkVGhpcmRQYXJ0eURldGFpbHMgPSBmdW5jdGlvbih1c2VyZGF0YSkge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgJGh0dHAucHV0KFwiL2FwaS9kYXRhYmFzZS90aGlyZFBhcnR5RGV0YWlsc1wiLCB7XG4gICAgICAgICAgdXNlcmlkOiAkc2NvcGUudXNlci5faWQsXG4gICAgICAgICAgZGF0YTogdXNlcmRhdGFcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgaWYgKHJlcy5kYXRhKSB7XG4gICAgICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUocmVzLmRhdGEpO1xuICAgICAgICAgICAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJDaGFuZ2VzIHNhdmVkIHN1Y2Nlc2Z1bGx5XCIpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkVycm9yIGluIHByb2Nlc3NpbmcgdGhlIHJlcXVlc3QuIFBsZWFzZSB0cnkgYWdhaW4uXCIpO1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICQuWmVicmFfRGlhbG9nKFwiRXJyb3IgaW4gcHJvY2Vzc2luZyB0aGUgcmVxdWVzdC4gUGxlYXNlIHRyeSBhZ2Fpbi5cIik7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIHRoaXJkIHBhcnR5IGFjY2VzcyBmcm9tIHVzZXJcbiAgICAkc2NvcGUucmVtb3ZlVGhpcmRQYXJ0eUFjY2VzcyA9IGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgJGh0dHAucHV0KFwiL2FwaS9kYXRhYmFzZS9kZWxldGVUaGlyZFBhcnR5QWNjZXNzXCIsIHtcbiAgICAgICAgICB1c2VyaWQ6ICRzY29wZS51c2VyLl9pZFxuICAgICAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUocmVzLmRhdGEpO1xuICAgICAgICAgICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xuICAgICAgICAgICRzY29wZS50aGlyZFBhcnR5SW5mbyA9ICgkc2NvcGUudXNlci50aGlyZFBhcnR5SW5mbyA/ICRzY29wZS51c2VyLnRoaXJkUGFydHlJbmZvIDogbnVsbCk7XG4gICAgICAgICAgJHNjb3BlLmhhc1RoaXJkUGFydHlGaWVsZHMgPSAoJHNjb3BlLnVzZXIudGhpcmRQYXJ0eUluZm8gPyB0cnVlIDogZmFsc2UpO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJBY2NvdW50IHJlbW92ZWQgc3VjY2VzZnVsbHlcIik7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICQuWmVicmFfRGlhbG9nKFwiRXJyb3IgaW4gcHJvY2Vzc2luZyB0aGUgcmVxdWVzdC4gUGxlYXNlIHRyeSBhZ2Fpbi5cIik7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgLy8gU2F2ZSBsaW5rZWQgYWNjb3VudHNcbiAgICAkc2NvcGUuc2F2ZUxpbmtlZEFjY291bnQgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICBpZiAoJHNjb3BlLmhhc1RoaXJkUGFydHlGaWVsZHMpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgICAkaHR0cC5wdXQoXCIvYXBpL2RhdGFiYXNlL3NhdmVMaW5rZWRBY2NvdW50XCIsIHtcbiAgICAgICAgICAgIHVzZXJpZDogJHNjb3BlLnVzZXIuX2lkLFxuICAgICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICBpZiAocmVzLmRhdGEpIHtcbiAgICAgICAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlKHJlcy5kYXRhKTtcbiAgICAgICAgICAgICAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XG4gICAgICAgICAgICAgICRyb290U2NvcGUudXNlcmxpbmtlZEFjY291bnRzID0gKCRzY29wZS51c2VyLmxpbmtlZEFjY291bnRzID8gJHNjb3BlLnVzZXIubGlua2VkQWNjb3VudHMgOiBbXSk7XG4gICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICRzY29wZS5saW5rZWRBY2NvdW50RGF0YSA9IHt9O1xuICAgICAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkFjY291bnQgbGlua2VkIHN1Y2Nlc2Z1bGx5XCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJObyBhY2NvdW50IGZvdW5kIHdpdGggZ2l2ZW4gdXNlcm5hbWUgYW5kIHBhc3N3b3JkLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJFcnJvciBpbiBwcm9jZXNzaW5nIHRoZSByZXF1ZXN0LiBQbGVhc2UgdHJ5IGFnYWluLlwiKTtcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkLlplYnJhX0RpYWxvZyhcIllvdSBtdXN0IGFkZCB0aGlyZCBwYXJ0eSBhY2Nlc3MgdG8gdGhpcyBhY2NvdW50IHRvIGxpbmsgYW5vdGhlciBhY2NvdW50LlwiKVxuICAgICAgfVxuICAgIH1cblxuICAgIC8vIHJlbW92ZSBsaW5rZWQgYWNjb3VudHNcbiAgICAkc2NvcGUucmVtb3ZlTGlua2VkQWNjb3VudCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICRodHRwLnB1dChcIi9hcGkvZGF0YWJhc2UvZGVsZXRlTGlua2VkQWNjb3VudFwiLCB7XG4gICAgICAgICAgdXNlcmlkOiAkc2NvcGUudXNlci5faWQsXG4gICAgICAgICAgZGF0YTogZGF0YVxuICAgICAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUocmVzLmRhdGEpO1xuICAgICAgICAgICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xuICAgICAgICAgICRyb290U2NvcGUudXNlcmxpbmtlZEFjY291bnRzID0gKCRzY29wZS51c2VyLmxpbmtlZEFjY291bnRzID8gJHNjb3BlLnVzZXIubGlua2VkQWNjb3VudHMgOiBbXSk7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkFjY291bnQgcmVtb3ZlZCBzdWNjZXNmdWxseVwiKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJFcnJvciBpbiBwcm9jZXNzaW5nIHRoZSByZXF1ZXN0LiBQbGVhc2UgdHJ5IGFnYWluLlwiKTtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICAkc2NvcGUucmVtb3ZlUGVybWFuZW50TGluayA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAkc2NvcGUuc2F2ZVByb2ZpbGVJbmZvKCk7XG4gICAgfTtcblxuICAgICRzY29wZS5oaWRlYnV0dG9uID0gZmFsc2U7XG4gICAgJHNjb3BlLmFkZFBlcm1hbmVudExpbmsgPSBmdW5jdGlvbigpIHtcblxuICAgICAgaWYgKCRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3MubGVuZ3RoID49IDIgJiYgISRzY29wZS51c2VyLmFkbWluKSB7XG4gICAgICAgICRzY29wZS5oaWRlYnV0dG9uID0gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgaWYgKCRzY29wZS5wcm9maWxlLmRhdGEucGVybWFuZW50TGlua3MubGVuZ3RoID4gMiAmJiAhJHNjb3BlLnVzZXIuYWRtaW4pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzLnB1c2goe1xuICAgICAgICB1cmw6ICcnLFxuICAgICAgICBhdmF0YXI6ICcnLFxuICAgICAgICB1c2VybmFtZTogJycsXG4gICAgICAgIGlkOiAtMSxcbiAgICAgICAgcGVybWFuZW50TGluazogdHJ1ZVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgICRzY29wZS5wZXJtYW5lbnRMaW5rVVJMQ2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcGVybWFuZW50TGluayA9IHt9O1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgQXJ0aXN0VG9vbHNTZXJ2aWNlXG4gICAgICAgIC5yZXNvbHZlRGF0YSh7XG4gICAgICAgICAgdXJsOiAkc2NvcGUubGlua1VybFxuICAgICAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAkc2NvcGUucHJvZmlsZS5kYXRhLnBlcm1hbmVudExpbmtzLnB1c2goe1xuICAgICAgICAgICAgdXJsOiByZXMuZGF0YS5wZXJtYWxpbmtfdXJsLFxuICAgICAgICAgICAgYXZhdGFyOiByZXMuZGF0YS5hdmF0YXJfdXJsID8gcmVzLmRhdGEuYXZhdGFyX3VybCA6ICcnLFxuICAgICAgICAgICAgdXNlcm5hbWU6IHJlcy5kYXRhLnVzZXJuYW1lLFxuICAgICAgICAgICAgaWQ6IHJlcy5kYXRhLmlkLFxuICAgICAgICAgICAgcGVybWFuZW50TGluazogdHJ1ZVxuICAgICAgICAgIH0pO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZygnQXJ0aXN0cyBub3QgZm91bmQnKTtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnNhdmVTb3VuZENsb3VkQWNjb3VudEluZm8gPSBmdW5jdGlvbigpIHtcbiAgICAgIFNDLmNvbm5lY3QoKVxuICAgICAgICAudGhlbihzYXZlSW5mbylcbiAgICAgICAgLnRoZW4oaGFuZGxlUmVzcG9uc2UpXG4gICAgICAgIC5jYXRjaChoYW5kbGVFcnJvcik7XG5cbiAgICAgIGZ1bmN0aW9uIHNhdmVJbmZvKHJlcykge1xuICAgICAgICByZXR1cm4gQXJ0aXN0VG9vbHNTZXJ2aWNlLnNhdmVTb3VuZENsb3VkQWNjb3VudEluZm8oe1xuICAgICAgICAgIHRva2VuOiByZXMub2F1dGhfdG9rZW5cbiAgICAgICAgfSk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlcykge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICBpZiAocmVzLnN0YXR1cyA9PT0gMjAwICYmIChyZXMuZGF0YS5zdWNjZXNzID09PSB0cnVlKSkge1xuICAgICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZShyZXMuZGF0YS5kYXRhKTtcbiAgICAgICAgICAkc2NvcGUucHJvZmlsZS5kYXRhID0gcmVzLmRhdGEuZGF0YTtcbiAgICAgICAgICAkc2NvcGUucHJvZmlsZS5pc0F2YWlsYWJsZS5zb3VuZGNsb3VkID0gdHJ1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgICAgICAgIHZhbHVlOiAnWW91IGFscmVhZHkgaGF2ZSBhbiBhY2NvdW50IHdpdGggdGhpcyBzb3VuZGNsb3VkIHVzZXJuYW1lJyxcbiAgICAgICAgICAgIHZpc2libGU6IHRydWVcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgICRzY29wZS4kYXBwbHkoKTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gaGFuZGxlRXJyb3IoZXJyKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9XG4gICAgfTtcblxuICAgICRzY29wZS5nZXREb3dubG9hZExpc3QgPSBmdW5jdGlvbigpIHtcbiAgICAgIEFydGlzdFRvb2xzU2VydmljZVxuICAgICAgICAuZ2V0RG93bmxvYWRMaXN0KClcbiAgICAgICAgLnRoZW4oaGFuZGxlUmVzcG9uc2UpXG4gICAgICAgIC5jYXRjaChoYW5kbGVFcnJvcik7XG5cbiAgICAgIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlcykge1xuICAgICAgICAkc2NvcGUuZG93bmxvYWRHYXRld2F5TGlzdCA9IHJlcy5kYXRhO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihlcnIpIHtcbiAgICAgICAgY29uc29sZS5sb2coZXJyKVxuICAgICAgfVxuICAgIH07XG5cbiAgICAkc2NvcGUuZGVsZXRlRG93bmxvYWRHYXRld2F5ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgIGlmIChjb25maXJtKFwiRG8geW91IHJlYWxseSB3YW50IHRvIGRlbGV0ZSB0aGlzIHRyYWNrP1wiKSkge1xuICAgICAgICB2YXIgZG93bmxvYWRHYXRlV2F5SUQgPSAkc2NvcGUuZG93bmxvYWRHYXRld2F5TGlzdFtpbmRleF0uX2lkO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAgIEFydGlzdFRvb2xzU2VydmljZVxuICAgICAgICAgIC5kZWxldGVEb3dubG9hZEdhdGV3YXkoe1xuICAgICAgICAgICAgaWQ6IGRvd25sb2FkR2F0ZVdheUlEXG4gICAgICAgICAgfSlcbiAgICAgICAgICAudGhlbihoYW5kbGVSZXNwb25zZSlcbiAgICAgICAgICAuY2F0Y2goaGFuZGxlRXJyb3IpO1xuXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlcykge1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgJHNjb3BlLmRvd25sb2FkR2F0ZXdheUxpc3Quc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKHJlcykge1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgJHNjb3BlLnZlcmlmeUJyb3dzZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmIChuYXZpZ2F0b3IudXNlckFnZW50LnNlYXJjaChcIkNocm9tZVwiKSA9PSAtMSAmJiBuYXZpZ2F0b3IudXNlckFnZW50LnNlYXJjaChcIlNhZmFyaVwiKSAhPSAtMSkge1xuICAgICAgICB2YXIgcG9zaXRpb24gPSBuYXZpZ2F0b3IudXNlckFnZW50LnNlYXJjaChcIlZlcnNpb25cIikgKyA4O1xuICAgICAgICB2YXIgZW5kID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5zZWFyY2goXCIgU2FmYXJpXCIpO1xuICAgICAgICB2YXIgdmVyc2lvbiA9IG5hdmlnYXRvci51c2VyQWdlbnQuc3Vic3RyaW5nKHBvc2l0aW9uLCBlbmQpO1xuICAgICAgICBpZiAocGFyc2VJbnQodmVyc2lvbikgPCA5KSB7XG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coJ1lvdSBoYXZlIG9sZCB2ZXJzaW9uIG9mIHNhZmFyaS4gQ2xpY2sgPGEgaHJlZj1cImh0dHBzOi8vc3VwcG9ydC5hcHBsZS5jb20vZG93bmxvYWRzL3NhZmFyaVwiPmhlcmU8L2E+IHRvIGRvd25sb2FkIHRoZSBsYXRlc3QgdmVyc2lvbiBvZiBzYWZhcmkgZm9yIGJldHRlciBzaXRlIGV4cGVyaWVuY2UuJywge1xuICAgICAgICAgICAgJ3R5cGUnOiAnY29uZmlybWF0aW9uJyxcbiAgICAgICAgICAgICdidXR0b25zJzogW3tcbiAgICAgICAgICAgICAgY2FwdGlvbjogJ09LJ1xuICAgICAgICAgICAgfV0sXG4gICAgICAgICAgICAnb25DbG9zZSc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAkd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcImh0dHBzOi8vc3VwcG9ydC5hcHBsZS5jb20vZG93bmxvYWRzL3NhZmFyaVwiO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgICRzY29wZS52ZXJpZnlCcm93c2VyKCk7XG4gIH0pXG4gIC5jb250cm9sbGVyKCdPcGVuVGhhbmtZb3VNb2RhbENvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUpIHt9KSIsImFwcC5zZXJ2aWNlKCdBcnRpc3RUb29sc1NlcnZpY2UnLCBbJyRodHRwJywgZnVuY3Rpb24oJGh0dHApIHtcblxuXHRmdW5jdGlvbiByZXNvbHZlRGF0YShkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvc291bmRjbG91ZC9yZXNvbHZlJywgZGF0YSk7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXREb3dubG9hZExpc3QoKSB7XG5cdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS9kYXRhYmFzZS9kb3dubG9hZHVybCcpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0RG93bmxvYWRHYXRld2F5KGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2RhdGFiYXNlL2Rvd25sb2FkdXJsLycgKyBkYXRhLmlkKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGRlbGV0ZURvd25sb2FkR2F0ZXdheShkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvZG93bmxvYWR1cmwvZGVsZXRlJywgZGF0YSk7XG5cdH1cblxuXHRmdW5jdGlvbiBzYXZlUHJvZmlsZUluZm8oZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL3Byb2ZpbGUvZWRpdCcsIGRhdGEpO1xuXHR9XG5cblx0ZnVuY3Rpb24gc2F2ZVNvdW5kQ2xvdWRBY2NvdW50SW5mbyhkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvcHJvZmlsZS9zb3VuZGNsb3VkJywgZGF0YSk7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRUcmFja0xpc3RGcm9tU291bmRjbG91ZChkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvdHJhY2tzL2xpc3QnLCBkYXRhKTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0cmVzb2x2ZURhdGE6IHJlc29sdmVEYXRhLFxuXHRcdGdldERvd25sb2FkTGlzdDogZ2V0RG93bmxvYWRMaXN0LFxuXHRcdGdldERvd25sb2FkR2F0ZXdheTogZ2V0RG93bmxvYWRHYXRld2F5LFxuXHRcdHNhdmVQcm9maWxlSW5mbzogc2F2ZVByb2ZpbGVJbmZvLFxuXHRcdGRlbGV0ZURvd25sb2FkR2F0ZXdheTogZGVsZXRlRG93bmxvYWRHYXRld2F5LFxuXHRcdHNhdmVTb3VuZENsb3VkQWNjb3VudEluZm86IHNhdmVTb3VuZENsb3VkQWNjb3VudEluZm8sXG5cdFx0Z2V0VHJhY2tMaXN0RnJvbVNvdW5kY2xvdWQ6IGdldFRyYWNrTGlzdEZyb21Tb3VuZGNsb3VkXG5cdH07XG59XSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgIC5zdGF0ZSgnU0NSZXNvbHZlJywge1xuICAgICAgICAgICAgdXJsOiAnL2FydGlzdFRvb2xzL3NjcmVzb2x2ZScsXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2FydGlzdFRvb2xzL1NDUmVzb2x2ZS9TQ1Jlc29sdmUuaHRtbCcsXG4gICAgICAgICAgICBjb250cm9sbGVyOiAnU0NSZXNvbHZlQ29udHJvbGxlcidcbiAgICAgICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignU0NSZXNvbHZlQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgJGh0dHApIHtcbiAgICAkc2NvcGUucmVzcG9uc2UgPSB7fTtcbiAgICAkc2NvcGUucmVzb2x2ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIHtcbiAgICAgICAgICAgICAgICB1cmw6ICRzY29wZS51cmxcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUucmVzcG9uc2UgPSBKU09OLnN0cmluZ2lmeShyZXMuZGF0YSwgbnVsbCwgXCJcXHRcIik7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLnJlc3BvbnNlKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUucmVzcG9uc2UgPSBKU09OLnN0cmluZ2lmeShlcnIsIG51bGwsIFwiXFx0XCIpO1xuICAgICAgICAgICAgfSlcbiAgICB9XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdhcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheUVkaXQnLCB7XG4gICAgICB1cmw6ICcvYXJ0aXN0VG9vbHMvZG93bmxvYWRHYXRld2F5L2VkaXQvOmdhdGV3YXlJRCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2FydGlzdFRvb2xzL2Rvd25sb2FkR2F0ZXdheS9kb3dubG9hZEdhdGV3YXkuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlDb250cm9sbGVyJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgaXNMb2dnZWRJbjogZnVuY3Rpb24oJHN0YXRlUGFyYW1zLCAkd2luZG93LCBTZXNzaW9uU2VydmljZSkge1xuICAgICAgICAgIGlmICghU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSB7XG4gICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdyZXR1cm5zdGF0ZScsICdhcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheUVkaXQnKTtcbiAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3RpZCcsICRzdGF0ZVBhcmFtcy5nYXRld2F5SUQpO1xuICAgICAgICAgICAgJHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9sb2dpbic7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbiAgICAuc3RhdGUoJ2FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5TmV3Jywge1xuICAgICAgdXJsOiAnL2FydGlzdFRvb2xzL2Rvd25sb2FkR2F0ZXdheS9uZXcnLFxuICAgICAgcGFyYW1zOiB7XG4gICAgICAgIHN1Ym1pc3Npb246IG51bGxcbiAgICAgIH0sXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2FydGlzdFRvb2xzL2Rvd25sb2FkR2F0ZXdheS9kb3dubG9hZEdhdGV3YXkuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnQXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlDb250cm9sbGVyJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgaXNMb2dnZWRJbjogZnVuY3Rpb24oJHN0YXRlUGFyYW1zLCAkd2luZG93LCBTZXNzaW9uU2VydmljZSkge1xuICAgICAgICAgIGlmICghU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSB7XG4gICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdyZXR1cm5zdGF0ZScsICdhcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheU5ldycpO1xuICAgICAgICAgICAgJHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy9sb2dpbic7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignQXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsICRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgJHdpbmRvdywgJHVpYk1vZGFsLCAkdGltZW91dCwgU2Vzc2lvblNlcnZpY2UsIEFydGlzdFRvb2xzU2VydmljZSwgQWRtaW5ETEdhdGVTZXJ2aWNlKSB7XG4gIC8qIEluaXQgRG93bmxvYWQgR2F0ZXdheSBmb3JtIGRhdGEgKi9cbiAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XG4gIGlmICghU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSB7XG4gICAgJHN0YXRlLmdvKCdsb2dpbicpO1xuICB9IGVsc2Uge1xuICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3JldHVybnN0YXRlJyk7XG4gICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndGlkJyk7XG4gIH1cbiAgJHNjb3BlLnNob3dUaXRsZSA9IFtdO1xuICAkc2NvcGUudHJhY2sgPSB7XG4gICAgYXJ0aXN0VXNlcm5hbWU6ICcnLFxuICAgIHRyYWNrVGl0bGU6ICcnLFxuICAgIHRyYWNrQXJ0d29ya1VSTDogJycsXG4gICAgU01MaW5rczogW10sXG4gICAgbGlrZTogZmFsc2UsXG4gICAgY29tbWVudDogZmFsc2UsXG4gICAgcmVwb3N0OiBmYWxzZSxcbiAgICBhcnRpc3RzOiBbXSxcbiAgICBwbGF5bGlzdHM6IFtdLFxuICAgIHNob3dEb3dubG9hZFRyYWNrczogJ3VzZXInLFxuICAgIGFkbWluOiAkc2NvcGUudXNlci5hZG1pbixcbiAgICBmaWxlOiB7fVxuICB9O1xuICAkc2NvcGUucHJvZmlsZSA9IHt9O1xuICAvKiBJbml0IHRyYWNrIGxpc3QgYW5kIHRyYWNrTGlzdE9iaiovXG4gICRzY29wZS50cmFja0xpc3QgPSBbXTtcbiAgJHNjb3BlLnRyYWNrTGlzdE9iaiA9IG51bGw7XG5cbiAgLyogTWV0aG9kIGZvciByZXNldHRpbmcgRG93bmxvYWQgR2F0ZXdheSBmb3JtICovXG5cbiAgJHNjb3BlLnRyYWNrTGlzdENoYW5nZSA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cbiAgICAvKiBTZXQgYm9vbGVhbnMgKi9cblxuICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gZmFsc2U7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuXG4gICAgLyogU2V0IHRyYWNrIGRhdGEgKi9cblxuICAgIHZhciB0cmFjayA9ICRzY29wZS50cmFja0xpc3RPYmo7XG4gICAgJHNjb3BlLnRyYWNrLnRyYWNrVVJMID0gdHJhY2sucGVybWFsaW5rX3VybDtcbiAgICAkc2NvcGUudHJhY2sudHJhY2tUaXRsZSA9IHRyYWNrLnRpdGxlO1xuICAgICRzY29wZS50cmFjay50cmFja0lEID0gdHJhY2suaWQ7XG4gICAgJHNjb3BlLnRyYWNrLmFydGlzdElEID0gdHJhY2sudXNlci5pZDtcbiAgICAkc2NvcGUudHJhY2suZGVzY3JpcHRpb24gPSB0cmFjay5kZXNjcmlwdGlvbjtcbiAgICAkc2NvcGUudHJhY2sudHJhY2tBcnR3b3JrVVJMID0gdHJhY2suYXJ0d29ya191cmwgPyB0cmFjay5hcnR3b3JrX3VybC5yZXBsYWNlKCdsYXJnZS5qcGcnLCAndDUwMHg1MDAuanBnJykgOiAnJztcbiAgICAkc2NvcGUudHJhY2suYXJ0aXN0QXJ0d29ya1VSTCA9IHRyYWNrLnVzZXIuYXZhdGFyX3VybCA/IHRyYWNrLnVzZXIuYXZhdGFyX3VybCA6ICcnO1xuICAgICRzY29wZS50cmFjay5hcnRpc3RVUkwgPSB0cmFjay51c2VyLnBlcm1hbGlua191cmw7XG4gICAgJHNjb3BlLnRyYWNrLmFydGlzdFVzZXJuYW1lID0gdHJhY2sudXNlci51c2VybmFtZTtcbiAgICAkc2NvcGUudHJhY2suU01MaW5rcyA9IFtdO1xuXG4gICAgU0MuZ2V0KCcvdXNlcnMvJyArICRzY29wZS50cmFjay5hcnRpc3RJRCArICcvd2ViLXByb2ZpbGVzJylcbiAgICAgIC50aGVuKGhhbmRsZVdlYlByb2ZpbGVzKVxuICAgICAgLmNhdGNoKGhhbmRsZUVycm9yKTtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZVdlYlByb2ZpbGVzKHByb2ZpbGVzKSB7XG4gICAgICBwcm9maWxlcy5mb3JFYWNoKGZ1bmN0aW9uKHByb2YpIHtcbiAgICAgICAgaWYgKFsndHdpdHRlcicsICd5b3V0dWJlJywgJ2ZhY2Vib29rJywgJ3Nwb3RpZnknLCAnc291bmRjbG91ZCcsICdpbnN0YWdyYW0nXS5pbmRleE9mKHByb2Yuc2VydmljZSkgIT0gLTEpIHtcbiAgICAgICAgICAkc2NvcGUudHJhY2suU01MaW5rcy5wdXNoKHtcbiAgICAgICAgICAgIGtleTogcHJvZi5zZXJ2aWNlLFxuICAgICAgICAgICAgdmFsdWU6IHByb2YudXJsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSB0cnVlO1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICRzY29wZS4kYXBwbHkoKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihlcnIpIHtcbiAgICAgICRzY29wZS50cmFjay50cmFja0lEID0gbnVsbDtcbiAgICAgICQuWmVicmFfRGlhbG9nKCdTb25nIG5vdCBmb3VuZCBvciBmb3JiaWRkZW4nKTtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAkc2NvcGUuJGFwcGx5KCk7XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5vcGVuSGVscE1vZGFsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGRpc3BsYXlUZXh0ID0gXCI8c3BhbiBzdHlsZT0nZm9udC13ZWlnaHQ6Ym9sZCc+U29uZzogPC9zcGFuPkNob29zZSBvciBlbnRlciB0aGUgdXJsIGZvciB0aGUgc29uZyB5b3Ugd2FudCB0byBtYWtlIHRoZSBkb3dubG9hZCBnYXRlIGZvci4gSWYgeW91IG1ha2UgaXQgZm9yIG9uZSBvZiB5b3VyIHRyYWNrcywgdGhlIGRvd25sb2FkIGxpbmsgd2lsbCBiZSBhdXRvbWF0aWNhbGx5IGFkZGVkIHRvIHlvdXIgdHJhY2sgb24gc291bmRjbG91ZC48YnI+PGJyPjxzcGFuIHN0eWxlPSdmb250LXdlaWdodDpib2xkJz5Tb2NpYWwgTWVkaWEgTGlua3M6IDwvc3Bhbj5UaGUgbGlua3MgdGhhdCB5b3UgYWRkIGhlcmUgd2lsbCBhcHBlYXIgb24gdGhlIGRvd25sb2FkIGdhdGV3YXkgcGFnZS48YnI+PGJyPjxzcGFuIHN0eWxlPSdmb250LXdlaWdodDpib2xkJz5Eb3dubG9hZCBGaWxlOiA8L3NwYW4+RWl0aGVyIHByb3ZpZGUgYSBsaW5rIHRvIGEgZG93bmxvYWRhYmxlIGZpbGUgb3IgdXBsb2FkIGFuIG1wMyBmaWxlLiBJZiB5b3UgdXBsb2FkIGFuIG1wMywgd2UgZm9ybWF0IHRoZSBmaWxlIHdpdGggdGhlIGFsYnVtIGFydHdvcmssIHRpdGxlLCBhbmQgYXJ0aXN0IG9mIHlvdXIgc291bmRjbG91ZCB0cmFjayBzbyB0aGF0IGl0IHdpbGwgbG9vayBnb29kIG9uIGEgbXVzaWMgcGxheWVyLjxicj48YnI+PHNwYW4gc3R5bGU9J2ZvbnQtd2VpZ2h0OmJvbGQnPkFydGlzdHMgdG8gRm9sbG93IGFuZCBBY3Rpb25zOiA8L3NwYW4+VGhlIGFydGlzdHMgeW91IGFkZCB3aWxsIGJlIGZvbGxvd2VkIG9uIHRoaXMgZG93bmxvYWQgZ2F0ZS4gVW5kZXIgYWN0aW9ucywgeW91IGNhbiBtYWtlICdMaWtpbmcnLCAnUmVwb3N0aW5nJyBhbmQgJ0NvbW1lbnRpbmcnIG1hbmRhdG9yeSBvbiB0aGUgZG93bmxvYWQuPGJyPjxicj48YSBzdHlsZT0ndGV4dC1hbGlnbjpjZW50ZXI7IG1hcmdpbjowIGF1dG87JyBocmVmPSdtYWlsdG86Y29heXNjdWVAYXJ0aXN0c3VubGltaXRlZC5jbz9zdWJqZWN0PUFydGlzdHMgVW5saW1pdGVkIEhlbHAnIHRhcmdldD0nX3RvcCc+RW1haWwgVGVjaCBTdXBwb3J0PC9hPlwiO1xuICAgICQuWmVicmFfRGlhbG9nKGRpc3BsYXlUZXh0LCB7XG4gICAgICB3aWR0aDogNjAwXG4gICAgfSk7XG4gIH1cblxuICAkc2NvcGUucmVtb3ZlU01MaW5rID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAkc2NvcGUudHJhY2suU01MaW5rcy5zcGxpY2UoaW5kZXgsIDEpO1xuICB9O1xuXG4gICRzY29wZS5zYXZlRG93bmxvYWRHYXRlID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCEoJHNjb3BlLnRyYWNrLmRvd25sb2FkVVJMIHx8ICgkc2NvcGUudHJhY2suZmlsZSAmJiAkc2NvcGUudHJhY2suZmlsZS5uYW1lKSkpIHtcbiAgICAgICQuWmVicmFfRGlhbG9nKCdFbnRlciBhIGRvd25sb2FkIGZpbGUnKTtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG5cbiAgICBpZiAoISRzY29wZS50cmFjay50cmFja0lEKSB7XG4gICAgICAkLlplYnJhX0RpYWxvZygnVHJhY2sgTm90IEZvdW5kJyk7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICB2YXIgc2VuZE9iaiA9IG5ldyBGb3JtRGF0YSgpO1xuICAgIGZvciAodmFyIHByb3AgaW4gJHNjb3BlLnRyYWNrKSB7XG4gICAgICBzZW5kT2JqLmFwcGVuZChwcm9wLCAkc2NvcGUudHJhY2tbcHJvcF0pO1xuICAgIH1cbiAgICB2YXIgYXJ0aXN0cyA9ICRzY29wZS50cmFjay5hcnRpc3RzLmZpbHRlcihmdW5jdGlvbihpdGVtKSB7XG4gICAgICByZXR1cm4gaXRlbS5pZCAhPT0gLTE7XG4gICAgfSkubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIGRlbGV0ZSBpdGVtWyckJGhhc2hLZXknXTtcbiAgICAgIHJldHVybiBpdGVtO1xuICAgIH0pO1xuXG4gICAgdmFyIHBsYXlsaXN0cyA9ICRzY29wZS50cmFjay5wbGF5bGlzdHMuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgIHJldHVybiBpdGVtLmlkICE9PSAtMTtcbiAgICB9KS5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgZGVsZXRlIGl0ZW1bJyQkaGFzaEtleSddO1xuICAgICAgcmV0dXJuIGl0ZW07XG4gICAgfSk7XG5cbiAgICBzZW5kT2JqLmFwcGVuZCgnYXJ0aXN0cycsIEpTT04uc3RyaW5naWZ5KGFydGlzdHMpKTtcbiAgICB2YXIgU01MaW5rcyA9IHt9O1xuICAgICRzY29wZS50cmFjay5TTUxpbmtzLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgU01MaW5rc1tpdGVtLmtleV0gPSBpdGVtLnZhbHVlO1xuICAgIH0pO1xuICAgIHNlbmRPYmouYXBwZW5kKCdTTUxpbmtzJywgSlNPTi5zdHJpbmdpZnkoU01MaW5rcykpO1xuICAgIGlmICgkc2NvcGUudHJhY2sucGxheWxpc3RzKSB7XG4gICAgICBzZW5kT2JqLmFwcGVuZCgncGxheWxpc3RzJywgSlNPTi5zdHJpbmdpZnkoJHNjb3BlLnRyYWNrLnBsYXlsaXN0cykpO1xuICAgIH1cblxuICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICB1cmw6ICcvYXBpL2RhdGFiYXNlL2Rvd25sb2FkdXJsJyxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6IHVuZGVmaW5lZFxuICAgICAgfSxcbiAgICAgIHRyYW5zZm9ybVJlcXVlc3Q6IGFuZ3VsYXIuaWRlbnRpdHksXG4gICAgICBkYXRhOiBzZW5kT2JqXG4gICAgfTtcbiAgICAkaHR0cChvcHRpb25zKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIGlmICgkc3RhdGVQYXJhbXMuc3VibWlzc2lvbikge1xuICAgICAgICAgICRzdGF0ZS5nbygnYXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlMaXN0Jywge1xuICAgICAgICAgICAgJ3N1Ym1pc3Npb24nOiAkc3RhdGVQYXJhbXMuc3VibWlzc2lvblxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICgkc2NvcGUudXNlci5zb3VuZGNsb3VkLmlkID09ICRzY29wZS50cmFjay5hcnRpc3RJRCkge1xuICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coJ0Rvd25sb2FkIGdhdGV3YXkgd2FzIHNhdmVkIGFuZCBhZGRlZCB0byB0aGUgdHJhY2suJyk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKCdEb3dubG9hZCBnYXRld2F5IHNhdmVkLicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICAkc3RhdGUuZ28oJ2FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5TGlzdCcpO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICQuWmVicmFfRGlhbG9nKFwiRVJST1I6IEVycm9yIGluIHNhdmluZyB1cmxcIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUuY2hlY2tJZkVkaXQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHN0YXRlUGFyYW1zLmdhdGV3YXlJRCkge1xuICAgICAgJHNjb3BlLmdldERvd25sb2FkR2F0ZXdheSgkc3RhdGVQYXJhbXMuZ2F0ZXdheUlEKTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLmdldFRyYWNrTGlzdEZyb21Tb3VuZGNsb3VkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHByb2ZpbGUgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XG4gICAgaWYgKHByb2ZpbGUuc291bmRjbG91ZCkge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgU0MuZ2V0KCcvdXNlcnMvJyArIHByb2ZpbGUuc291bmRjbG91ZC5pZCArICcvdHJhY2tzJywge1xuICAgICAgICAgIGZpbHRlcjogJ3B1YmxpYydcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24odHJhY2tzKSB7XG4gICAgICAgICAgJHNjb3BlLnRyYWNrTGlzdCA9IHRyYWNrcztcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gICRzY29wZS5jaGVja0lmU3VibWlzc2lvbiA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc3RhdGVQYXJhbXMuc3VibWlzc2lvbikge1xuICAgICAgaWYgKCRzdGF0ZS5pbmNsdWRlcygnYXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlOZXcnKSkge1xuICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tVUkwgPSAkcm9vdFNjb3BlLnN1Ym1pc3Npb24udHJhY2tVUkw7XG4gICAgICAgICRzY29wZS50cmFja1VSTENoYW5nZSgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgICRzY29wZS5vcGVuVGhhbmtZb3VNb2RhbC50aGFua1lvdSgkc3RhdGVQYXJhbXMuc3VibWlzc2lvbi5faWQpO1xuICAgICAgJHJvb3RTY29wZS5zdWJtaXNzaW9uID0gbnVsbDtcbiAgICB9XG4gIH1cblxuICAkc2NvcGUucmVzb2x2ZVlvdXR1YmUgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoISgkc2NvcGUudHJhY2suc29jaWFsUGxhdGZvcm1WYWx1ZS5pbmNsdWRlcygnL2NoYW5uZWwvJykgfHwgJHNjb3BlLnRyYWNrLnNvY2lhbFBsYXRmb3JtVmFsdWUuaW5jbHVkZXMoJy91c2VyLycpKSkge1xuICAgICAgJC5aZWJyYV9EaWFsb2coJ0VudGVyIGEgdmFsaWQgWW91dHViZSBjaGFubmVsIHVybC4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gIH1cblxuICAkc2NvcGUudHJhY2tVUkxDaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLnRyYWNrLnRyYWNrVVJMICE9PSAnJykge1xuICAgICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSBmYWxzZTtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgIEFydGlzdFRvb2xzU2VydmljZS5yZXNvbHZlRGF0YSh7XG4gICAgICAgIHVybDogJHNjb3BlLnRyYWNrLnRyYWNrVVJMXG4gICAgICB9KS50aGVuKGhhbmRsZVRyYWNrRGF0YUFuZEdldFByb2ZpbGVzKS50aGVuKGhhbmRsZVdlYlByb2ZpbGVzKS5jYXRjaChoYW5kbGVFcnJvcik7XG5cbiAgICAgIGZ1bmN0aW9uIGhhbmRsZVRyYWNrRGF0YUFuZEdldFByb2ZpbGVzKHJlcykge1xuICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tUaXRsZSA9IHJlcy5kYXRhLnRpdGxlO1xuICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tJRCA9IHJlcy5kYXRhLmlkO1xuICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0SUQgPSByZXMuZGF0YS51c2VyLmlkO1xuICAgICAgICAkc2NvcGUudHJhY2suZGVzY3JpcHRpb24gPSByZXMuZGF0YS5kZXNjcmlwdGlvbjtcbiAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrQXJ0d29ya1VSTCA9IHJlcy5kYXRhLmFydHdvcmtfdXJsID8gcmVzLmRhdGEuYXJ0d29ya191cmwucmVwbGFjZSgnbGFyZ2UuanBnJywgJ3Q1MDB4NTAwLmpwZycpIDogJyc7XG4gICAgICAgICRzY29wZS50cmFjay5hcnRpc3RBcnR3b3JrVVJMID0gcmVzLmRhdGEudXNlci5hdmF0YXJfdXJsID8gcmVzLmRhdGEudXNlci5hdmF0YXJfdXJsLnJlcGxhY2UoJ2xhcmdlLmpwZycsICd0NTAweDUwMC5qcGcnKSA6ICcnO1xuICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0VVJMID0gcmVzLmRhdGEudXNlci5wZXJtYWxpbmtfdXJsO1xuICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0VXNlcm5hbWUgPSByZXMuZGF0YS51c2VyLnVzZXJuYW1lO1xuICAgICAgICAkc2NvcGUudHJhY2suU01MaW5rcyA9IFtdO1xuICAgICAgICByZXR1cm4gU0MuZ2V0KCcvdXNlcnMvJyArICRzY29wZS50cmFjay5hcnRpc3RJRCArICcvd2ViLXByb2ZpbGVzJyk7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGhhbmRsZVdlYlByb2ZpbGVzKHByb2ZpbGVzKSB7XG4gICAgICAgIHByb2ZpbGVzLmZvckVhY2goZnVuY3Rpb24ocHJvZikge1xuICAgICAgICAgIGlmIChbJ3R3aXR0ZXInLCAneW91dHViZScsICdmYWNlYm9vaycsICdzcG90aWZ5JywgJ3NvdW5kY2xvdWQnLCAnaW5zdGFncmFtJ10uaW5kZXhPZihwcm9mLnNlcnZpY2UpICE9IC0xKSB7XG4gICAgICAgICAgICAkc2NvcGUudHJhY2suU01MaW5rcy5wdXNoKHtcbiAgICAgICAgICAgICAga2V5OiBwcm9mLnNlcnZpY2UsXG4gICAgICAgICAgICAgIHZhbHVlOiBwcm9mLnVybFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IHRydWU7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycikge1xuICAgICAgICAkc2NvcGUudHJhY2sudHJhY2tJRCA9IG51bGw7XG4gICAgICAgICQuWmVicmFfRGlhbG9nKCdTb25nIG5vdCBmb3VuZCBvciBmb3JiaWRkZW4nKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAkc2NvcGUuU01MaW5rQ2hhbmdlID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICBmdW5jdGlvbiBnZXRMb2NhdGlvbihocmVmKSB7XG4gICAgICB2YXIgbG9jYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiYVwiKTtcbiAgICAgIGxvY2F0aW9uLmhyZWYgPSBocmVmO1xuICAgICAgaWYgKGxvY2F0aW9uLmhvc3QgPT0gXCJcIikge1xuICAgICAgICBsb2NhdGlvbi5ocmVmID0gbG9jYXRpb24uaHJlZjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsb2NhdGlvbjtcbiAgICB9XG5cbiAgICB2YXIgbG9jYXRpb24gPSBnZXRMb2NhdGlvbigkc2NvcGUudHJhY2suU01MaW5rc1tpbmRleF0udmFsdWUpO1xuICAgIHZhciBob3N0ID0gbG9jYXRpb24uaG9zdG5hbWUuc3BsaXQoJy4nKVswXTtcbiAgICB2YXIgZmluZExpbmsgPSAkc2NvcGUudHJhY2suU01MaW5rcy5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgcmV0dXJuIGl0ZW0ua2V5ID09PSBob3N0O1xuICAgIH0pO1xuXG4gICAgaWYgKGZpbmRMaW5rLmxlbmd0aCA+IDApIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgJHNjb3BlLnRyYWNrLlNNTGlua3NbaW5kZXhdLmtleSA9IGhvc3Q7XG4gIH1cblxuICAkc2NvcGUuYWRkU01MaW5rID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnRyYWNrLlNNTGlua3MucHVzaCh7XG4gICAgICBrZXk6ICcnLFxuICAgICAgdmFsdWU6ICcnXG4gICAgfSk7XG4gIH1cblxuICAkc2NvcGUuY2xlYXJPckZpbGUgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLnRyYWNrLmRvd25sb2FkVVJMKSB7XG4gICAgICBhbmd1bGFyLmVsZW1lbnQoXCJpbnB1dFt0eXBlPSdmaWxlJ11cIikudmFsKG51bGwpO1xuICAgIH1cbiAgfVxuXG4gICRzY29wZS5hcnRpc3RVUkxDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xuICAgIHZhciBhcnRpc3QgPSB7fTtcbiAgICBpZiAoJHNjb3BlLnRyYWNrLmFydGlzdHNbaW5kZXhdLnVybCAhPSBcIlwiKSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICBBcnRpc3RUb29sc1NlcnZpY2UucmVzb2x2ZURhdGEoe1xuICAgICAgICB1cmw6ICRzY29wZS50cmFjay5hcnRpc3RzW2luZGV4XS51cmxcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS50cmFjay5hcnRpc3RzW2luZGV4XS5hdmF0YXIgPSByZXMuZGF0YS5hdmF0YXJfdXJsID8gcmVzLmRhdGEuYXZhdGFyX3VybCA6ICcnO1xuICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0c1tpbmRleF0udXNlcm5hbWUgPSByZXMuZGF0YS51c2VybmFtZTtcbiAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdHNbaW5kZXhdLmlkID0gcmVzLmRhdGEuaWQ7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coJ0FydGlzdHMgbm90IGZvdW5kJyk7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAkc2NvcGUucmVtb3ZlQXJ0aXN0ID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAkc2NvcGUudHJhY2suYXJ0aXN0cy5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG5cbiAgJHNjb3BlLmFkZEFydGlzdCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS50cmFjay5hcnRpc3RzLnB1c2goe1xuICAgICAgdXJsOiAnJyxcbiAgICAgIGF2YXRhcjogJycsXG4gICAgICB1c2VybmFtZTogJycsXG4gICAgICBpZDogLTEsXG4gICAgICBwZXJtYW5lbnRMaW5rOiBmYWxzZVxuICAgIH0pO1xuICB9XG4gICRzY29wZS5hZGRQbGF5bGlzdCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS50cmFjay5wbGF5bGlzdHMucHVzaCh7XG4gICAgICB1cmw6ICcnLFxuICAgICAgYXZhdGFyOiAnJyxcbiAgICAgIHRpdGxlOiAnJyxcbiAgICAgIGlkOiAnJ1xuICAgIH0pO1xuICB9XG4gICRzY29wZS5yZW1vdmVQbGF5bGlzdCA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgJHNjb3BlLnRyYWNrLnBsYXlsaXN0cy5zcGxpY2UoaW5kZXgsIDEpO1xuICB9XG4gICRzY29wZS5wbGF5bGlzdFVSTENoYW5nZSA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgIEFkbWluRExHYXRlU2VydmljZVxuICAgICAgLnJlc29sdmVEYXRhKHtcbiAgICAgICAgdXJsOiAkc2NvcGUudHJhY2sucGxheWxpc3RzW2luZGV4XS51cmxcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHNjb3BlLnRyYWNrLnBsYXlsaXN0c1tpbmRleF0uYXZhdGFyID0gcmVzLmRhdGEuYXJ0d29ya191cmw7XG4gICAgICAgICRzY29wZS50cmFjay5wbGF5bGlzdHNbaW5kZXhdLnRpdGxlID0gcmVzLmRhdGEudGl0bGU7XG4gICAgICAgICRzY29wZS50cmFjay5wbGF5bGlzdHNbaW5kZXhdLmlkID0gcmVzLmRhdGEuaWQ7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICQuWmVicmFfRGlhbG9nKCdQbGF5bGlzdCBub3QgZm91bmQnKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pXG4gIH1cblxuICBmdW5jdGlvbiByZXNldERvd25sb2FkR2F0ZXdheSgpIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gZmFsc2U7XG4gICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICB2YWw6ICcnLFxuICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICB9O1xuXG4gICAgJHNjb3BlLnRyYWNrID0ge1xuICAgICAgYXJ0aXN0VXNlcm5hbWU6ICcnLFxuICAgICAgdHJhY2tUaXRsZTogJycsXG4gICAgICB0cmFja0FydHdvcmtVUkw6ICcnLFxuICAgICAgU01MaW5rczogW10sXG4gICAgICBsaWtlOiBmYWxzZSxcbiAgICAgIGNvbW1lbnQ6IGZhbHNlLFxuICAgICAgcmVwb3N0OiBmYWxzZSxcbiAgICAgIGFydGlzdHM6IFt7XG4gICAgICAgIHVybDogJycsXG4gICAgICAgIGF2YXRhcjogJycsXG4gICAgICAgIHVzZXJuYW1lOiAnJyxcbiAgICAgICAgaWQ6IC0xLFxuICAgICAgICBwZXJtYW5lbnRMaW5rOiBmYWxzZVxuICAgICAgfV0sXG4gICAgICBzaG93RG93bmxvYWRUcmFja3M6ICd1c2VyJ1xuICAgIH07XG4gICAgYW5ndWxhci5lbGVtZW50KFwiaW5wdXRbdHlwZT0nZmlsZSddXCIpLnZhbChudWxsKTtcbiAgfVxuXG4gIC8qIE1ldGhvZCBmb3IgZ2V0dGluZyBEb3dubG9hZEdhdGV3YXkgaW4gY2FzZSBvZiBlZGl0ICovXG5cbiAgJHNjb3BlLmdldERvd25sb2FkR2F0ZXdheSA9IGZ1bmN0aW9uKGRvd25sb2FkR2F0ZVdheUlEKSB7XG4gICAgLy8gcmVzZXREb3dubG9hZEdhdGV3YXkoKTtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgQXJ0aXN0VG9vbHNTZXJ2aWNlXG4gICAgICAuZ2V0RG93bmxvYWRHYXRld2F5KHtcbiAgICAgICAgaWQ6IGRvd25sb2FkR2F0ZVdheUlEXG4gICAgICB9KVxuICAgICAgLnRoZW4oaGFuZGxlUmVzcG9uc2UpXG4gICAgICAuY2F0Y2goaGFuZGxlRXJyb3IpO1xuXG4gICAgZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UocmVzKSB7XG5cbiAgICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gdHJ1ZTtcbiAgICAgICRzY29wZS50cmFjayA9IHJlcy5kYXRhO1xuXG4gICAgICB2YXIgU01MaW5rcyA9IHJlcy5kYXRhLlNNTGlua3MgPyByZXMuZGF0YS5TTUxpbmtzIDoge307XG4gICAgICB2YXIgcGVybWFuZW50TGlua3MgPSByZXMuZGF0YS5wZXJtYW5lbnRMaW5rcyA/IHJlcy5kYXRhLnBlcm1hbmVudExpbmtzIDogWycnXTtcbiAgICAgIHZhciBTTUxpbmtzQXJyYXkgPSBbXTtcbiAgICAgIHZhciBwZXJtYW5lbnRMaW5rc0FycmF5ID0gW107XG5cbiAgICAgIGZvciAodmFyIGxpbmsgaW4gU01MaW5rcykge1xuICAgICAgICBTTUxpbmtzQXJyYXkucHVzaCh7XG4gICAgICAgICAga2V5OiBsaW5rLFxuICAgICAgICAgIHZhbHVlOiBTTUxpbmtzW2xpbmtdXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgICAgcGVybWFuZW50TGlua3MuZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHBlcm1hbmVudExpbmtzQXJyYXkucHVzaCh7XG4gICAgICAgICAgdXJsOiBpdGVtXG4gICAgICAgIH0pXG4gICAgICB9KTtcbiAgICAgIGlmICghJHNjb3BlLnRyYWNrLnNob3dEb3dubG9hZFRyYWNrcykge1xuICAgICAgICAkc2NvcGUudHJhY2suc2hvd0Rvd25sb2FkVHJhY2tzID0gJ3VzZXInO1xuICAgICAgfVxuICAgICAgJHNjb3BlLnRyYWNrLlNNTGlua3MgPSBTTUxpbmtzQXJyYXk7XG4gICAgICAkc2NvcGUudHJhY2sucGVybWFuZW50TGlua3MgPSBwZXJtYW5lbnRMaW5rc0FycmF5O1xuICAgICAgJHNjb3BlLnRyYWNrLnBsYXlsaXN0SURTID0gW107XG4gICAgICAvLyAkc2NvcGUudHJhY2suc2hvd0Rvd25sb2FkVHJhY2tzID0gKCRzY29wZS50cmFjay5zaG93RG93bmxvYWRUcmFja3MgPT09ICd1c2VyJykgPyB0cnVlIDogZmFsc2U7XG4gICAgICAvL2NvbnNvbGUubG9nKCRzY29wZS50cmFjayk7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKHJlcykge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICB9XG4gIH07XG5cbiAgJHNjb3BlLmNsZWFyT3JJbnB1dCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS50cmFjay5kb3dubG9hZFVSTCA9IFwiXCI7XG4gIH1cblxuICAkc2NvcGUucHJldmlldyA9IGZ1bmN0aW9uKHRyYWNrKSB7XG4gICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0cmFja1ByZXZpZXdEYXRhJywgSlNPTi5zdHJpbmdpZnkodHJhY2spKTtcbiAgICB2YXIgdXJsID0gJHN0YXRlLmhyZWYoJ2FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5UHJldmlldycpO1xuICAgICR3aW5kb3cub3Blbih1cmwsICdfYmxhbmsnKTtcbiAgfVxuXG4gICRzY29wZS52ZXJpZnlCcm93c2VyID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKG5hdmlnYXRvci51c2VyQWdlbnQuc2VhcmNoKFwiQ2hyb21lXCIpID09IC0xICYmIG5hdmlnYXRvci51c2VyQWdlbnQuc2VhcmNoKFwiU2FmYXJpXCIpICE9IC0xKSB7XG4gICAgICB2YXIgcG9zaXRpb24gPSBuYXZpZ2F0b3IudXNlckFnZW50LnNlYXJjaChcIlZlcnNpb25cIikgKyA4O1xuICAgICAgdmFyIGVuZCA9IG5hdmlnYXRvci51c2VyQWdlbnQuc2VhcmNoKFwiIFNhZmFyaVwiKTtcbiAgICAgIHZhciB2ZXJzaW9uID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5zdWJzdHJpbmcocG9zaXRpb24sIGVuZCk7XG4gICAgICBpZiAocGFyc2VJbnQodmVyc2lvbikgPCA5KSB7XG4gICAgICAgICQuWmVicmFfRGlhbG9nKCdZb3UgaGF2ZSBvbGQgdmVyc2lvbiBvZiBzYWZhcmkuIENsaWNrIDxhIGhyZWY9XCJodHRwczovL3N1cHBvcnQuYXBwbGUuY29tL2Rvd25sb2Fkcy9zYWZhcmlcIj5oZXJlPC9hPiB0byBkb3dubG9hZCB0aGUgbGF0ZXN0IHZlcnNpb24gb2Ygc2FmYXJpIGZvciBiZXR0ZXIgc2l0ZSBleHBlcmllbmNlLicsIHtcbiAgICAgICAgICAndHlwZSc6ICdjb25maXJtYXRpb24nLFxuICAgICAgICAgICdidXR0b25zJzogW3tcbiAgICAgICAgICAgIGNhcHRpb246ICdPSydcbiAgICAgICAgICB9XSxcbiAgICAgICAgICAnb25DbG9zZSc6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gXCJodHRwczovL3N1cHBvcnQuYXBwbGUuY29tL2Rvd25sb2Fkcy9zYWZhcmlcIjtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cbiAgfVxuICAkc2NvcGUudmVyaWZ5QnJvd3NlcigpO1xufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyXG4gICAgICAgIC5zdGF0ZSgnYXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlQcmV2aWV3Jywge1xuICAgICAgICAgICAgdXJsOiAnL2FydGlzdFRvb2xzL2Rvd25sb2FkR2F0ZXdheS9wcmV2aWV3JyxcbiAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgIHN1Ym1pc3Npb246IG51bGxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2FydGlzdFRvb2xzL2Rvd25sb2FkR2F0ZXdheS9wcmV2aWV3Lmh0bWwnLFxuICAgICAgICAgICAgY29udHJvbGxlcjogJ0FydGlzdFRvb2xzUHJldmlld0NvbnRyb2xsZXInXG4gICAgICAgIH0pXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoXCJBcnRpc3RUb29sc1ByZXZpZXdDb250cm9sbGVyXCIsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCAkc2NvcGUsICRodHRwLCAkbG9jYXRpb24sICR3aW5kb3csICR1aWJNb2RhbCwgJHRpbWVvdXQsIFNlc3Npb25TZXJ2aWNlLCBBcnRpc3RUb29sc1NlcnZpY2UsIERvd25sb2FkVHJhY2tTZXJ2aWNlKSB7XG4gICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xuICAkc2NvcGUucmVjZW50VHJhY2tzID0gW107XG4gICAgdmFyIHRyYWNrID0gSlNPTi5wYXJzZSh3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3RyYWNrUHJldmlld0RhdGEnKSk7XG4gICAgaWYgKCF0cmFjay50cmFja1RpdGxlKSB7XG4gICAgICAgICQuWmVicmFfRGlhbG9nKCdUcmFjayBOb3QgRm91bmQnKTtcbiAgICAgICAgJHN0YXRlLmdvKFwiYXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlMaXN0XCIpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgJHNjb3BlLnRyYWNrID0gdHJhY2s7XG4gICAgJHNjb3BlLnBsYXllciA9IHt9O1xuICAgIFNDLnN0cmVhbSgnL3RyYWNrcy8nICsgJHNjb3BlLnRyYWNrLnRyYWNrSUQpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHApIHtcbiAgICAgICAgICAgICRzY29wZS5wbGF5ZXIgPSBwO1xuICAgICAgICB9KVxuXG4gICAgJHNjb3BlLnRvZ2dsZSA9IHRydWU7XG4gICAgJHNjb3BlLnRvZ2dsZVBsYXkgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgJHNjb3BlLnRvZ2dsZSA9ICEkc2NvcGUudG9nZ2xlO1xuICAgICAgICBpZiAoJHNjb3BlLnRvZ2dsZSkge1xuICAgICAgICAgICAgJHNjb3BlLnBsYXllci5wYXVzZSgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJHNjb3BlLnBsYXllci5wbGF5KCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgJHNjb3BlLm5vZGwgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coJ05vIGRvd25sb2FkIGluIHByZXZpZXcgbW9kZS4nKVxuICAgIH1cblxuICAkc2NvcGUuZ2V0UmVjZW50VHJhY2tzID0gZnVuY3Rpb24oKXtcbiAgICBpZiAoJHNjb3BlLnRyYWNrICYmICRzY29wZS50cmFjay5zaG93RG93bmxvYWRUcmFja3MgPT09ICd1c2VyJykge1xuICAgICAgRG93bmxvYWRUcmFja1NlcnZpY2UuZ2V0UmVjZW50VHJhY2tzKHtcbiAgICAgICAgdXNlcklEOiAkc2NvcGUudHJhY2sudXNlcmlkLFxuICAgICAgICB0cmFja0lEOiAkc2NvcGUudHJhY2suX2lkXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgaWYgKCh0eXBlb2YgcmVzID09PSAnb2JqZWN0JykgJiYgcmVzLmRhdGEpIHtcbiAgICAgICAgICAkc2NvcGUucmVjZW50VHJhY2tzID0gcmVzLmRhdGE7XG4gICAgICAgIH1cbiAgICAgIH0pXG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLmdldFJlY2VudFRyYWNrcygpO1xufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlclxuICAgIC5zdGF0ZSgncmVGb3JSZUludGVyYWN0aW9uJywge1xuICAgICAgdXJsOiAnL2FydGlzdFRvb2xzL3JlRm9yUmVJbnRlcmFjdGlvbi86dHJhZGVJRCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2FydGlzdFRvb2xzL3JlRm9yUmUvcmVGb3JSZUludGVyYWN0aW9uLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ1JlRm9yUmVJbnRlcmFjdGlvbkNvbnRyb2xsZXInLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICB0cmFkZTogZnVuY3Rpb24oJGh0dHAsICRzdGF0ZVBhcmFtcywgJHdpbmRvdywgU2Vzc2lvblNlcnZpY2UpIHtcbiAgICAgICAgICBpZiAoIVNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKSkge1xuICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncmV0dXJuc3RhdGUnLCAncmVGb3JSZUludGVyYWN0aW9uJyk7XG4gICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCd0aWQnLCAkc3RhdGVQYXJhbXMudHJhZGVJRCk7XG4gICAgICAgICAgICAkd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2xvZ2luJztcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS90cmFkZXMvYnlJRC8nICsgJHN0YXRlUGFyYW1zLnRyYWRlSUQpXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcbiAgICAgICAgcDFFdmVudHM6IGZ1bmN0aW9uKCRodHRwLCB0cmFkZSkge1xuICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZXZlbnRzL2ZvclVzZXIvJyArIHRyYWRlLnAxLnVzZXIuc291bmRjbG91ZC5pZClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKFwiZXJyb3IgZ2V0dGluZyB5b3VyIGV2ZW50c1wiKTtcbiAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfSxcbiAgICAgICAgcDJFdmVudHM6IGZ1bmN0aW9uKCRodHRwLCB0cmFkZSkge1xuICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZXZlbnRzL2ZvclVzZXIvJyArIHRyYWRlLnAyLnVzZXIuc291bmRjbG91ZC5pZClcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKFwiZXJyb3IgZ2V0dGluZyBvdGhlcidzIGV2ZW50cyBldmVudHNcIik7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH0sXG4gICAgICAgIGN1cnJlbnRUcmFkZXM6IGZ1bmN0aW9uKCRodHRwLCBTZXNzaW9uU2VydmljZSkge1xuICAgICAgICAgIHZhciB0cmFkZVR5cGUgPSB7XG4gICAgICAgICAgICBSZXF1ZXN0czogdHJ1ZSxcbiAgICAgICAgICAgIFJlcXVlc3RlZDogdHJ1ZSxcbiAgICAgICAgICAgIFRyYWRlUGFydG5lcnM6IHRydWVcbiAgICAgICAgICB9O1xuICAgICAgICAgIHZhciB1c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xuICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvdHJhZGVzL3dpdGhVc2VyLycgKyB1c2VyLl9pZCArICc/dHJhZGVUeXBlPScgKyBKU09OLnN0cmluZ2lmeSh0cmFkZVR5cGUpKVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAgIHZhciB0cmFkZXMgPSByZXMuZGF0YTtcbiAgICAgICAgICAgICAgdHJhZGVzLmZvckVhY2goZnVuY3Rpb24odHJhZGUpIHtcbiAgICAgICAgICAgICAgICB0cmFkZS5vdGhlciA9ICh0cmFkZS5wMS51c2VyLl9pZCA9PSB1c2VyLl9pZCkgPyB0cmFkZS5wMiA6IHRyYWRlLnAxO1xuICAgICAgICAgICAgICAgIHRyYWRlLnVzZXIgPSAodHJhZGUucDEudXNlci5faWQgPT0gdXNlci5faWQpID8gdHJhZGUucDEgOiB0cmFkZS5wMjtcbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgIHRyYWRlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICAgICAgICBpZiAoYS51c2VyLmFsZXJ0ID09IFwiY2hhbmdlXCIpIHtcbiAgICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKGEudXNlci5hbGVydCA9PSBcInBsYWNlbWVudFwiKSB7XG4gICAgICAgICAgICAgICAgICByZXR1cm4gLTFcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0cmFkZXMpO1xuICAgICAgICAgICAgICByZXR1cm4gdHJhZGVzO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIG9uRXhpdDogZnVuY3Rpb24oJGh0dHAsICRzdGF0ZVBhcmFtcywgU2Vzc2lvblNlcnZpY2UsIHNvY2tldCkge1xuICAgICAgICAkaHR0cC5wdXQoJy9hcGkvdHJhZGVzL29mZmxpbmUnLCB7XG4gICAgICAgICAgdHJhZGVJRDogJHN0YXRlUGFyYW1zLnRyYWRlSURcbiAgICAgICAgfSk7XG4gICAgICAgIHNvY2tldC5kaXNjb25uZWN0KCk7XG4gICAgICB9XG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcihcIlJlRm9yUmVJbnRlcmFjdGlvbkNvbnRyb2xsZXJcIiwgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCBBdXRoU2VydmljZSwgJHdpbmRvdywgU2Vzc2lvblNlcnZpY2UsIHNvY2tldCwgJHN0YXRlUGFyYW1zLCB0cmFkZSwgcDFFdmVudHMsIHAyRXZlbnRzLCBjdXJyZW50VHJhZGVzKSB7XG4gICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xuICBpZiAoIVNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKSkge1xuICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgfSBlbHNlIHtcbiAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCdyZXR1cm5zdGF0ZScpO1xuICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3RpZCcpO1xuICB9XG4gICRzY29wZS5zaG93RW1haWxNb2RhbCA9IGZhbHNlO1xuICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICBzb2NrZXQuY29ubmVjdCgpO1xuICAkc2NvcGUubXNnSGlzdG9yeSA9IFtdO1xuICAkc2NvcGUubWFrZUV2ZW50VVJMID0gXCJcIjtcbiAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XG4gICRzY29wZS5wcm9jZXNzaW9uZyA9IGZhbHNlO1xuICAkc2NvcGUuaGlkZWFsbCA9IGZhbHNlO1xuICAkc2NvcGUudHJhZGUgPSB0cmFkZTtcbiAgJHNjb3BlLnAxRXZlbnRzID0gcDFFdmVudHM7XG4gICRzY29wZS5wMkV2ZW50cyA9IHAyRXZlbnRzO1xuICAkc2NvcGUudHJhY2tBcnRpc3RJRCA9IDA7XG4gICRzY29wZS50cmFja1R5cGUgPSBcIlwiO1xuICAkc2NvcGUuY3VycmVudFRyYWRlcyA9IGN1cnJlbnRUcmFkZXM7XG4gICRzY29wZS5zZWxlY3RUcmFkZSA9IGN1cnJlbnRUcmFkZXMuZmluZChmdW5jdGlvbihlbCkge1xuICAgIHJldHVybiBlbC5faWQgPT0gJHNjb3BlLnRyYWRlLl9pZDtcbiAgfSk7XG4gIHZhciBwZXJzb24gPSAkc2NvcGUudHJhZGUucDEudXNlci5faWQgPT0gJHNjb3BlLnVzZXIuX2lkID8gJHNjb3BlLnRyYWRlLnAxIDogJHNjb3BlLnRyYWRlLnAyO1xuICAkc2NvcGUudXNlci5hY2NlcHRlZCA9IHBlcnNvbi5hY2NlcHRlZDtcbiAgJHNjb3BlLnAxZGF5SW5jciA9IDA7XG4gICRzY29wZS5wMmRheUluY3IgPSAwO1xuXG4gICRzY29wZS50cmFja0xpc3QgPSBbXTtcblxuICAkc2NvcGUudHJhY2tMaXN0Q2hhbmdlRXZlbnQgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICRzY29wZS5tYWtlRXZlbnQuVVJMID0gJHNjb3BlLm1ha2VFdmVudC50cmFja0xpc3RPYmoucGVybWFsaW5rX3VybDtcbiAgICAkc2NvcGUuY2hhbmdlVVJMKCk7XG4gIH07XG5cbiAgJHNjb3BlLmdldFRyYWNrTGlzdEZyb21Tb3VuZGNsb3VkID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHByb2ZpbGUgPSAkc2NvcGUudXNlcjtcbiAgICBpZiAocHJvZmlsZS5zb3VuZGNsb3VkKSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICBTQy5nZXQoJy91c2Vycy8nICsgcHJvZmlsZS5zb3VuZGNsb3VkLmlkICsgJy90cmFja3MnLCB7XG4gICAgICAgICAgZmlsdGVyOiAncHVibGljJ1xuICAgICAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbih0cmFja3MpIHtcbiAgICAgICAgICAkc2NvcGUudHJhY2tMaXN0ID0gdHJhY2tzO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLmdldFNjaGVkdWxlcklEID0gZnVuY3Rpb24odWlkKSB7XG4gICAgcmV0dXJuICgodWlkID09ICRzY29wZS51c2VyLl9pZCkgPyBcInNjaGVkdWxlci1sZWZ0XCIgOiBcInNjaGVkdWxlci1yaWdodFwiKTtcbiAgfVxuXG4gICRzY29wZS51c2VyLmFjY2VwdGVkID0gJHNjb3BlLnRyYWRlLnAxLnVzZXIuX2lkID09ICRzY29wZS51c2VyLl9pZCA/ICRzY29wZS50cmFkZS5wMS5hY2NlcHRlZCA6ICRzY29wZS50cmFkZS5wMi5hY2NlcHRlZDtcbiAgJHNjb3BlLmN1clRyYWRlID0gSlNPTi5zdHJpbmdpZnkoJC5ncmVwKCRzY29wZS5jdXJyZW50VHJhZGVzLCBmdW5jdGlvbihlKSB7XG4gICAgcmV0dXJuIGUuX2lkID09ICRzY29wZS50cmFkZS5faWQ7XG4gIH0pKTtcblxuICAkc2NvcGUucmVmcmVzaENhbGVuZGFyID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XG4gICAgJGh0dHAuZ2V0KCcvYXBpL3RyYWRlcy9nZXRUcmFkZURhdGEvJyArICRzdGF0ZVBhcmFtcy50cmFkZUlEKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS50cmFkZSA9IHJlcy5kYXRhLnRyYWRlO1xuICAgICAgICAkc2NvcGUucDJFdmVudHMgPSByZXMuZGF0YS5wMkV2ZW50cztcbiAgICAgICAgJHNjb3BlLnAxRXZlbnRzID0gcmVzLmRhdGEucDFFdmVudHM7XG4gICAgICAgIHZhciB0cmRzID0gcmVzLmRhdGEudXNlclRyYWRlcztcbiAgICAgICAgdHJkcy5mb3JFYWNoKGZ1bmN0aW9uKHRyYWRlKSB7XG4gICAgICAgICAgdHJhZGUub3RoZXIgPSAodHJhZGUucDEudXNlci5faWQgPT0gJHNjb3BlLnVzZXIuX2lkKSA/IHRyYWRlLnAyIDogdHJhZGUucDE7XG4gICAgICAgICAgdHJhZGUudXNlciA9ICh0cmFkZS5wMS51c2VyLl9pZCA9PSAkc2NvcGUudXNlci5faWQpID8gdHJhZGUucDEgOiB0cmFkZS5wMjtcblxuICAgICAgICB9KTtcbiAgICAgICAgJHNjb3BlLmN1cnJlbnRUcmFkZXMgPSB0cmRzO1xuICAgICAgICAkc2NvcGUudXNlci5hY2NlcHRlZCA9ICRzY29wZS50cmFkZS5wMS51c2VyLl9pZCA9PSAkc2NvcGUudXNlci5faWQgPyAkc2NvcGUudHJhZGUucDEuYWNjZXB0ZWQgOiAkc2NvcGUudHJhZGUucDIuYWNjZXB0ZWQ7XG4gICAgICAgICRzY29wZS50cmFkZUluZGV4ID0gY3VycmVudFRyYWRlcy5maW5kSW5kZXgoZnVuY3Rpb24oZWwpIHtcbiAgICAgICAgICByZXR1cm4gZWwuX2lkID09ICRzY29wZS50cmFkZS5faWQ7XG4gICAgICAgIH0pO1xuICAgICAgICAkc2NvcGUuZmlsbENhbGVuZGFyKCk7XG4gICAgICAgICRzY29wZS51cGRhdGVBbGVydHMoKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coJ0Vycm9yIGdldHRpbmcgZGF0YS4nKTtcbiAgICAgIH0pXG4gIH1cblxuICAkc2NvcGUuaW5jcnAxID0gZnVuY3Rpb24oaW5jKSB7XG4gICAgaWYgKCRzY29wZS5wMWRheUluY3IgPCAyMSkgJHNjb3BlLnAxZGF5SW5jcisrO1xuICB9XG4gICRzY29wZS5kZWNycDEgPSBmdW5jdGlvbihpbmMpIHtcbiAgICBpZiAoJHNjb3BlLnAxZGF5SW5jciA+IDApICRzY29wZS5wMWRheUluY3ItLTtcbiAgfVxuICAkc2NvcGUuaW5jcnAyID0gZnVuY3Rpb24oaW5jKSB7XG4gICAgaWYgKCRzY29wZS5wMmRheUluY3IgPCAyMSkgJHNjb3BlLnAyZGF5SW5jcisrO1xuICB9XG4gICRzY29wZS5kZWNycDIgPSBmdW5jdGlvbihpbmMpIHtcbiAgICBpZiAoJHNjb3BlLnAyZGF5SW5jciA+IDApICRzY29wZS5wMmRheUluY3ItLTtcbiAgfVxuXG4gICRzY29wZS5jaGFuZ2VVUkwgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLm1ha2VFdmVudC5VUkwgIT0gXCJcIikge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgJGh0dHAucG9zdCgnL2FwaS9zb3VuZGNsb3VkL3Jlc29sdmUnLCB7XG4gICAgICAgICAgdXJsOiAkc2NvcGUubWFrZUV2ZW50LlVSTFxuICAgICAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAkc2NvcGUudHJhY2tBcnRpc3RJRCA9IHJlcy5kYXRhLnVzZXIuaWQ7XG4gICAgICAgICAgJHNjb3BlLnRyYWNrVHlwZSA9IHJlcy5kYXRhLmtpbmQ7XG4gICAgICAgICAgaWYgKHJlcy5kYXRhLmtpbmQgIT0gXCJwbGF5bGlzdFwiKSB7XG4gICAgICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQgPSByZXMuZGF0YS5pZDtcbiAgICAgICAgICAgICRzY29wZS5tYWtlRXZlbnQudGl0bGUgPSByZXMuZGF0YS50aXRsZTtcbiAgICAgICAgICAgICRzY29wZS5tYWtlRXZlbnQudHJhY2tVUkwgPSByZXMuZGF0YS50cmFja1VSTDtcbiAgICAgICAgICAgIGlmIChyZXMuZGF0YS51c2VyKSAkc2NvcGUubWFrZUV2ZW50LmFydGlzdE5hbWUgPSByZXMuZGF0YS51c2VyLnVzZXJuYW1lO1xuICAgICAgICAgICAgU0Mub0VtYmVkKCRzY29wZS5tYWtlRXZlbnQuVVJMLCB7XG4gICAgICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLFxuICAgICAgICAgICAgICBhdXRvX3BsYXk6IGZhbHNlLFxuICAgICAgICAgICAgICBtYXhoZWlnaHQ6IDE1MFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcbiAgICAgICAgICAgICRzY29wZS5ub3RGb3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJHNjb3BlLm5vdEZvdW5kID0gZmFsc2U7XG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJTb3JyeSEgV2UgZG8gbm90IGN1cnJlbnRseSBhbGxvdyBwbGF5bGlzdCByZXBvc3RpbmcuIFBsZWFzZSBlbnRlciBhIHRyYWNrIHVybCBpbnN0ZWFkLlwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJXZSBhcmUgbm90IGFsbG93ZWQgdG8gYWNjZXNzIHRoaXMgdHJhY2sgZnJvbSBTb3VuZGNsb3VkLiBXZSBhcG9sb2dpemUgZm9yIHRoZSBpbmNvbnZlbmllbmNlLCBhbmQgd2UgYXJlIHdvcmtpbmcgd2l0aCBTb3VuZGNsb3VkIHRvIHJlc29sdmUgdGhlIGlzc3VlLlwiKTtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgICAgICAkc2NvcGUubm90Rm91bmQgPSB0cnVlO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG5cbiAgJHNjb3BlLnVucmVwb3N0T3ZlcmxhcCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghJHNjb3BlLm1ha2VFdmVudC50cmFja0lEKSByZXR1cm4gZmFsc2U7XG4gICAgdmFyIGV2ZW50cyA9ICgkc2NvcGUubWFrZUV2ZW50LnBlcnNvbi51c2VyLl9pZCA9PSAkc2NvcGUudHJhZGUucDEudXNlci5faWQpID8gJHNjb3BlLnAxRXZlbnRzIDogJHNjb3BlLnAyRXZlbnRzO1xuICAgIHZhciBzbG90cyA9ICRzY29wZS5tYWtlRXZlbnQucGVyc29uLnNsb3RzO1xuICAgIHZhciBibG9ja0V2ZW50cyA9IGV2ZW50cy5maWx0ZXIoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGV2ZW50LmRheSA9IG5ldyBEYXRlKGV2ZW50LmRheSk7XG4gICAgICBldmVudC51bnJlcG9zdERhdGUgPSBuZXcgRGF0ZShldmVudC51bnJlcG9zdERhdGUpO1xuICAgICAgaWYgKG1vbWVudCgkc2NvcGUubWFrZUV2ZW50LmRheSkuZm9ybWF0KCdMTEwnKSA9PSBtb21lbnQoZXZlbnQuZGF5KS5mb3JtYXQoJ0xMTCcpICYmICRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCA9PSBldmVudC50cmFja0lEKSByZXR1cm4gZmFsc2U7XG4gICAgICByZXR1cm4gKCRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCA9PSBldmVudC50cmFja0lEICYmIGV2ZW50LnVucmVwb3N0RGF0ZS5nZXRUaW1lKCkgPiAkc2NvcGUubWFrZUV2ZW50LmRheS5nZXRUaW1lKCkgLSAyNCAqIDM2MDAwMDAgJiYgZXZlbnQuZGF5LmdldFRpbWUoKSA8ICRzY29wZS5tYWtlRXZlbnQudW5yZXBvc3REYXRlLmdldFRpbWUoKSArIDI0ICogMzYwMDAwMCk7XG4gICAgfSlcbiAgICB2YXIgYmxvY2tFdmVudHMyID0gc2xvdHMuZmlsdGVyKGZ1bmN0aW9uKHNsb3QpIHtcbiAgICAgIHNsb3QuZGF5ID0gbmV3IERhdGUoc2xvdC5kYXkpO1xuICAgICAgc2xvdC51bnJlcG9zdERhdGUgPSBuZXcgRGF0ZShzbG90LnVucmVwb3N0RGF0ZSk7XG4gICAgICBpZiAobW9tZW50KCRzY29wZS5tYWtlRXZlbnQuZGF5KS5mb3JtYXQoJ0xMTCcpID09IG1vbWVudChzbG90LmRheSkuZm9ybWF0KCdMTEwnKSAmJiAkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQgPT0gc2xvdC50cmFja0lEKSByZXR1cm4gZmFsc2U7XG4gICAgICByZXR1cm4gKCRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCA9PSBzbG90LnRyYWNrSUQgJiYgc2xvdC51bnJlcG9zdERhdGUuZ2V0VGltZSgpID4gJHNjb3BlLm1ha2VFdmVudC5kYXkuZ2V0VGltZSgpIC0gMjQgKiAzNjAwMDAwICYmIHNsb3QuZGF5LmdldFRpbWUoKSA8ICRzY29wZS5tYWtlRXZlbnQudW5yZXBvc3REYXRlLmdldFRpbWUoKSArIDI0ICogMzYwMDAwMCk7XG4gICAgfSlcblxuICAgIHJldHVybiBibG9ja0V2ZW50cy5sZW5ndGggPiAwIHx8IGJsb2NrRXZlbnRzMi5sZW5ndGggPiAwO1xuICB9XG5cbiAgJHNjb3BlLmNoYW5nZVRyYWRlID0gZnVuY3Rpb24odHJhZGUpIHtcbiAgICAkc3RhdGUuZ28oJ3JlRm9yUmVJbnRlcmFjdGlvbicsIHtcbiAgICAgIHRyYWRlSUQ6IHRyYWRlLl9pZFxuICAgIH0pXG4gIH1cblxuICAkc2NvcGUuYmFja0V2ZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLm1ha2VFdmVudCA9IHVuZGVmaW5lZDtcbiAgICAkc2NvcGUudHJhY2tUeXBlID0gXCJcIjtcbiAgICAkc2NvcGUudHJhY2tBcnRpc3RJRCA9IDA7XG4gICAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XG4gIH1cblxuICAkc2NvcGUuZGVsZXRlRXZlbnQgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUubWFrZUV2ZW50LnBlcnNvbi5zbG90cyA9ICRzY29wZS5tYWtlRXZlbnQucGVyc29uLnNsb3RzLmZpbHRlcihmdW5jdGlvbihzbG90LCBpbmRleCkge1xuICAgICAgcmV0dXJuICEobW9tZW50KHNsb3QuZGF5KS5mb3JtYXQoJ0xMTCcpID09IG1vbWVudCgkc2NvcGUubWFrZUV2ZW50LmRheSkuZm9ybWF0KCdMTEwnKSk7XG4gICAgfSk7XG4gICAgJHNjb3BlLnRyYWRlLnAxLmFjY2VwdGVkID0gJHNjb3BlLnRyYWRlLnAyLmFjY2VwdGVkID0gZmFsc2U7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLnB1dCgnL2FwaS90cmFkZXMnLCAkc2NvcGUudHJhZGUpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XG4gICAgICAgICRzY29wZS50cmFkZSA9IHJlcy5kYXRhO1xuICAgICAgICAkc2NvcGUuZW1pdE1lc3NhZ2UoXCJSRU1PVkVEIFNMT1QgZnJvbSBcIiArICRzY29wZS5tYWtlRXZlbnQucGVyc29uLnVzZXIuc291bmRjbG91ZC51c2VybmFtZSArIFwiIGZvciBcIiArIG1vbWVudCgkc2NvcGUubWFrZUV2ZW50LmRheSkuZm9ybWF0KCdMTEwnKSwgJ2FsZXJ0Jyk7XG4gICAgICAgIC8vJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICQuWmVicmFfRGlhbG9nKCdFcnJvciBkZWxldGluZy4nKTtcbiAgICAgIH0pXG4gIH1cblxuICAkc2NvcGUuc2F2ZUV2ZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCEkc2NvcGUudW5yZXBvc3RPdmVybGFwKCkpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgIGlmICgkc2NvcGUubWFrZUV2ZW50LnR5cGUgPT0gJ3RyYWRlZCcpIHtcbiAgICAgICAgdmFyIHJlcSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgIGlmICgkc2NvcGUubWFrZUV2ZW50Ll9pZCkgJGh0dHAucHV0KCcvYXBpL2V2ZW50cy9yZXBvc3RFdmVudHMnLCAkc2NvcGUubWFrZUV2ZW50KS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgICAgZWxzZSAkaHR0cC5wb3N0KCcvYXBpL2V2ZW50cy9yZXBvc3RFdmVudHMnLCAkc2NvcGUubWFrZUV2ZW50KS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICAgIH0pXG4gICAgICAgIHJlcVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgLy8kc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgJHNjb3BlLnRyYWNrVHlwZSA9IFwiXCI7XG4gICAgICAgICAgICAkc2NvcGUudHJhY2tBcnRpc3RJRCA9IDA7XG4gICAgICAgICAgICAkc2NvcGUuc2hvd092ZXJsYXkgPSBmYWxzZTtcbiAgICAgICAgICAgICRzY29wZS5yZWZyZXNoQ2FsZW5kYXIoKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKCdFcnJvciBzYXZpbmcuJyk7XG4gICAgICAgICAgfSlcbiAgICAgIH0gZWxzZSBpZiAoJHNjb3BlLm1ha2VFdmVudC50eXBlID09ICd0cmFkZScpIHtcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC5wZXJzb24uc2xvdHMgPSAkc2NvcGUubWFrZUV2ZW50LnBlcnNvbi5zbG90cy5maWx0ZXIoZnVuY3Rpb24oc2xvdCwgaW5kZXgpIHtcbiAgICAgICAgICByZXR1cm4gIShtb21lbnQoc2xvdC5kYXkpLmZvcm1hdCgnTExMJykgPT09IG1vbWVudCgkc2NvcGUubWFrZUV2ZW50LmRheSkuZm9ybWF0KCdMTEwnKSk7XG4gICAgICAgIH0pO1xuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnBlcnNvbi5zbG90cy5wdXNoKCRzY29wZS5tYWtlRXZlbnQpO1xuICAgICAgICB2YXIgYWxlcnRNZXNzYWdlID0gXCJDSEFOR0VEIFNMT1Qgb24gXCIgKyAkc2NvcGUubWFrZUV2ZW50LnBlcnNvbi51c2VyLnNvdW5kY2xvdWQudXNlcm5hbWUgKyBcIiBvbiBcIiArIG1vbWVudCgkc2NvcGUubWFrZUV2ZW50LmRheSkuZm9ybWF0KCdMTEwnKVxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnBlcnNvbiA9IHVuZGVmaW5lZDtcbiAgICAgICAgJHNjb3BlLnRyYWRlLnAxLmFjY2VwdGVkID0gJHNjb3BlLnRyYWRlLnAyLmFjY2VwdGVkID0gZmFsc2U7XG4gICAgICAgICRodHRwLnB1dCgnL2FwaS90cmFkZXMnLCAkc2NvcGUudHJhZGUpXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgICAvLyRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAkc2NvcGUudHJhY2tUeXBlID0gXCJcIjtcbiAgICAgICAgICAgICRzY29wZS50cmFja0FydGlzdElEID0gMDtcbiAgICAgICAgICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICAgICAgICAgICAgJHNjb3BlLnRyYWRlID0gcmVzLmRhdGE7XG4gICAgICAgICAgICAkc2NvcGUuZW1pdE1lc3NhZ2UoYWxlcnRNZXNzYWdlLCAnYWxlcnQnKTtcbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKCdFcnJvciB3aXRoIHJlcXVlc3QnKTtcbiAgICAgICAgICB9KVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAkLlplYnJhX0RpYWxvZygnSXNzdWUhIFRoaXMgcmVwb3N0IHdpbGwgY2F1c2UgdGhlIHRvIGJlIGJvdGggdW5yZXBvc3RlZCBhbmQgcmVwb3N0ZWQgd2l0aGluIGEgMjQgaG91ciB0aW1lIHBlcmlvZC4gSWYgeW91IGFyZSB1bnJlcG9zdGluZywgcGxlYXNlIGFsbG93IDQ4IGhvdXJzIGJldHdlZW4gc2NoZWR1bGVkIHJlcG9zdHMuJyk7XG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLmVtYWlsU2xvdCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBtYWlsdG9fbGluayA9IFwibWFpbHRvOj9zdWJqZWN0PVJlcG9zdCBvZiBcIiArICRzY29wZS5tYWtlRXZlbnQudGl0bGUgKyAnJmJvZHk9SGV5LFxcblxcbiBJIGFtIHJlcG9zdGluZyB5b3VyIHNvbmcgJyArICRzY29wZS5tYWtlRXZlbnQudGl0bGUgKyAnIG9uICcgKyAkc2NvcGUubWFrZUV2ZW50QWNjb3VudC51c2VybmFtZSArICcgb24gJyArICRzY29wZS5tYWtlRXZlbnQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpICsgJy5cXG5cXG4gQmVzdCwgXFxuJyArICRzY29wZS51c2VyLnNvdW5kY2xvdWQudXNlcm5hbWU7XG4gICAgbG9jYXRpb24uaHJlZiA9IGVuY29kZVVSSShtYWlsdG9fbGluayk7XG4gIH1cblxuICAkc2NvcGUuc2V0VXBBbmRPcGVuTWFrZUV2ZW50ID0gZnVuY3Rpb24oZXZlbnQsIHBlcnNvbikge1xuICAgICRzY29wZS5zaG93T3ZlcmxheSA9IHRydWU7XG4gICAgJHNjb3BlLm1ha2VFdmVudCA9IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkoZXZlbnQpKTtcbiAgICAkc2NvcGUubWFrZUV2ZW50LnRyYWNrTGlzdE9iaiA9IG51bGw7XG4gICAgJHNjb3BlLm1ha2VFdmVudC5kYXkgPSBuZXcgRGF0ZSgkc2NvcGUubWFrZUV2ZW50LmRheSk7XG4gICAgaWYgKCRzY29wZS5tYWtlRXZlbnQudW5yZXBvc3REYXRlKSAkc2NvcGUubWFrZUV2ZW50LnVucmVwb3N0RGF0ZSA9IG5ldyBEYXRlKCRzY29wZS5tYWtlRXZlbnQudW5yZXBvc3REYXRlKTtcbiAgICBpZiAoJHNjb3BlLm1ha2VFdmVudC51bnJlcG9zdERhdGUgPiBuZXcgRGF0ZSgpKSB7XG4gICAgICAkc2NvcGUubWFrZUV2ZW50LnVucmVwb3N0RGF0ZSA9IG5ldyBEYXRlKCRzY29wZS5tYWtlRXZlbnQudW5yZXBvc3REYXRlKTtcbiAgICAgICRzY29wZS5tYWtlRXZlbnQudW5yZXBvc3QgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUubWFrZUV2ZW50LnVucmVwb3N0RGF0ZSA9IG5ldyBEYXRlKDApO1xuICAgICAgJHNjb3BlLm1ha2VFdmVudC51bnJlcG9zdCA9IGZhbHNlO1xuICAgIH1cbiAgICAkc2NvcGUubWFrZUV2ZW50LnBlcnNvbiA9IHBlcnNvbjtcbiAgICAkc2NvcGUubWFrZUV2ZW50LlVSTCA9ICRzY29wZS5tYWtlRXZlbnQudHJhY2tVUkw7XG4gICAgU0Mub0VtYmVkKCRzY29wZS5tYWtlRXZlbnQudHJhY2tVUkwsIHtcbiAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLFxuICAgICAgYXV0b19wbGF5OiBmYWxzZSxcbiAgICAgIG1heGhlaWdodDogMTUwXG4gICAgfSk7XG4gIH1cblxuICAkc2NvcGUuY2hhbmdlVW5yZXBvc3QgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLm1ha2VFdmVudC51bnJlcG9zdCkge1xuICAgICAgJHNjb3BlLm1ha2VFdmVudC5kYXkgPSBuZXcgRGF0ZSgkc2NvcGUubWFrZUV2ZW50LmRheSk7XG4gICAgICAkc2NvcGUubWFrZUV2ZW50LnVucmVwb3N0RGF0ZSA9IG5ldyBEYXRlKCRzY29wZS5tYWtlRXZlbnQuZGF5LmdldFRpbWUoKSArIDI0ICogNjAgKiA2MCAqIDEwMDApO1xuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUubWFrZUV2ZW50LnVucmVwb3N0RGF0ZSA9IG5ldyBEYXRlKDApO1xuICAgIH1cbiAgfVxuXG4gICRzY29wZS5jbGlja2VkU2xvdCA9IGZ1bmN0aW9uKGRheSwgZGF5T2Zmc2V0LCBob3VyLCBjYWxlbmRhciwgcGVyc29uLCBldmVudCkge1xuICAgIGlmICgkc2NvcGUudXNlci5hY2NlcHRlZCkge1xuICAgICAgJC5aZWJyYV9EaWFsb2coXCJZb3UgY2FuJ3QgbWFrZSBjaGFuZ2VzIHRvIHRoaXMgdHJhZGUgYmVjYXVzZSB5b3UgYWxyZWFkeSBhY2NlcHRlZCBpdC4gWW91IHdpbGwgYmUgYWJsZSB0byBtYWtlIGNoYW5nZXMgaWYgdGhlIG90aGVyIHBlcnNvbiBtYWtlcyBhIGNoYW5nZS5cIik7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHZhciBtYWtlRGF5ID0gbmV3IERhdGUoZGF5KTtcbiAgICBtYWtlRGF5LnNldEhvdXJzKGhvdXIsIDMwLCAwLCAwKTtcbiAgICBpZiAobWFrZURheSA8IG5ldyBEYXRlKCkpIHtcbiAgICAgICQuWmVicmFfRGlhbG9nKCdUaW1lc2xvdCBoYXMgcGFzc2VkLicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHN3aXRjaCAoZXZlbnQudHlwZSkge1xuICAgICAgY2FzZSAncXVldWUnOlxuICAgICAgY2FzZSAndHJhY2snOlxuICAgICAgY2FzZSAncGFpZCc6XG4gICAgICAgICQuWmVicmFfRGlhbG9nKCdDYW5ub3QgbWFuYWdlIHRoaXMgdGltZSBzbG90LicpO1xuICAgICAgICByZXR1cm47XG4gICAgICAgIGJyZWFrO1xuXG4gICAgICBjYXNlICdlbXB0eSc6XG4gICAgICAgIHZhciBjYWxFdmVudCA9IHtcbiAgICAgICAgICB0eXBlOiBcInRyYWRlXCIsXG4gICAgICAgICAgZGF5OiBtYWtlRGF5LFxuICAgICAgICAgIHVzZXJJRDogcGVyc29uLnVzZXIuc291bmRjbG91ZC5pZCxcbiAgICAgICAgICB1bnJlcG9zdERhdGU6IG5ldyBEYXRlKG1ha2VEYXkuZ2V0VGltZSgpICsgMjQgKiA2MCAqIDYwICogMTAwMClcbiAgICAgICAgfTtcbiAgICAgICAgJHNjb3BlLnNldFVwQW5kT3Blbk1ha2VFdmVudChjYWxFdmVudCwgcGVyc29uKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3RyYWRlJzpcbiAgICAgICAgJHNjb3BlLnNldFVwQW5kT3Blbk1ha2VFdmVudChldmVudCwgcGVyc29uKTtcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGNhc2UgJ3RyYWRlZCc6XG4gICAgICAgIC8vIGlmIChldmVudC5vd25lciA9PSAkc2NvcGUudXNlci5faWQpIHtcbiAgICAgICAgJHNjb3BlLnNldFVwQW5kT3Blbk1ha2VFdmVudChldmVudCwgcGVyc29uKTtcbiAgICAgICAgLy8gfSBlbHNlIHtcbiAgICAgICAgLy8gICAkLlplYnJhX0RpYWxvZygnQ2Fubm90IG1hbmFnZSB0aGlzIHRpbWUgc2xvdC4nKTtcbiAgICAgICAgLy8gICByZXR1cm47XG4gICAgICAgIC8vIH1cbiAgICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLmVtYWlsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIG90aGVyVXNlciA9ICRzY29wZS50cmFkZS5wMS51c2VyLl9pZCA9PSAkc2NvcGUudXNlci5faWQgPyAkc2NvcGUudHJhZGUucDIudXNlciA6ICRzY29wZS50cmFkZS5wMS51c2VyO1xuICAgIHZhciBtYWlsdG9fbGluayA9IFwibWFpbHRvOlwiICsgb3RoZXJVc2VyLmVtYWlsICsgXCI/c3ViamVjdD1SZXBvc3QgZm9yIHJlcG9zdCB3aXRoIFwiICsgJHNjb3BlLnVzZXIuc291bmRjbG91ZC51c2VybmFtZSArICcmYm9keT1IZXkgJyArIG90aGVyVXNlci5zb3VuZGNsb3VkLnVzZXJuYW1lICsgJyxcXG5cXG4gUmVwb3N0IGZvciByZXBvc3Q/IEkgc2NoZWR1bGVkIGEgdHJhZGUgaGVyZSEgLT4gQXJ0aXN0c1VubGltaXRlZC5jby9sb2dpblxcblxcbkJlc3QsXFxuJyArICRzY29wZS51c2VyLnNvdW5kY2xvdWQudXNlcm5hbWU7XG4gICAgbG9jYXRpb24uaHJlZiA9IGVuY29kZVVSSShtYWlsdG9fbGluayk7XG4gIH1cblxuICAkc2NvcGUuYWNjZXB0ID0gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoJHNjb3BlLnRyYWRlLnAxLnVzZXIuX2lkID09ICRzY29wZS51c2VyLl9pZCkge1xuICAgICAgICB2YXIgYWNjU3RyaW5nID0gJHNjb3BlLnRyYWRlLnAyLmFjY2VwdGVkID8gXCJJZiB5b3UgYWNjZXB0LCB0aGUgdHJhZGUgd2lsbCBiZSBtYWRlLiBZb3Ugd2lsbCBoYXZlIHRoZSByaWdodCB0byBzY2hlZHVsZSB0aGUgc2xvdHMgeW91IGFyZSB0cmFkaW5nIGZvciwgYW5kIHRoZSBvdGhlciBwZXJzb24gd2lsbCBoYXZlIHJpZ2h0cyB0byB0aGUgc2xvdHMgeW91IGFyZSB0cmFkaW5nIHdpdGguXCIgOiBcIklmIHlvdSBjbGljayBhY2NlcHQsIHlvdSB3aWxsIG5vdCBiZSBhYmxlIHRvIG1ha2UgY2hhbmdlcyB0byB0aGUgdHJhZGUgYmVpbmcgbmVnb3RpYXRlZC4gSWYgdGhlIG90aGVyIHBlcnNvbiBtYWtlcyBhIGNoYW5nZSwgeW91IHdpbGwgdGhlbiBiZSBnaXZlbiB0aGUgcmlnaHQgdG8gbWFrZSBjaGFuZ2VzIGFuZCBhY2NlcHQgdGhvc2UgY2hhbmdlcyBhZ2Fpbi4gSWYgdGhlIG90aGVyIHBlcnNvbiBhbHNvIGFjY2VwdHMsIHRoZSB0cmFkZSB3aWxsIGJlIG1hZGUuXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgYWNjU3RyaW5nID0gJHNjb3BlLnRyYWRlLnAxLmFjY2VwdGVkID8gXCJJZiB5b3UgYWNjZXB0LCB0aGUgdHJhZGUgd2lsbCBiZSBtYWRlLiBZb3Ugd2lsbCBoYXZlIHRoZSByaWdodCB0byBzY2hlZHVsZSB0aGUgc2xvdHMgeW91IGFyZSB0cmFkaW5nIGZvciwgYW5kIHRoZSBvdGhlciBwZXJzb24gd2lsbCBoYXZlIHJpZ2h0cyB0byB0aGUgc2xvdHMgeW91IGFyZSB0cmFkaW5nIHdpdGguXCIgOiBcIklmIHlvdSBjbGljayBhY2NlcHQsIHlvdSB3aWxsIG5vdCBiZSBhYmxlIHRvIG1ha2UgY2hhbmdlcyB0byB0aGUgdHJhZGUgYmVpbmcgbmVnb3RpYXRlZC4gSWYgdGhlIG90aGVyIHBlcnNvbiBtYWtlcyBhIGNoYW5nZSwgeW91IHdpbGwgdGhlbiBiZSBnaXZlbiB0aGUgcmlnaHQgdG8gbWFrZSBjaGFuZ2VzIGFuZCBhY2NlcHQgdGhvc2UgY2hhbmdlcyBhZ2Fpbi4gSWYgdGhlIG90aGVyIHBlcnNvbiBhbHNvIGFjY2VwdHMsIHRoZSB0cmFkZSB3aWxsIGJlIG1hZGUuXCI7XG4gICAgICB9XG4gICAgICAkLlplYnJhX0RpYWxvZyhhY2NTdHJpbmcsIHtcbiAgICAgICAgJ3R5cGUnOiAnY29uZmlybWF0aW9uJyxcbiAgICAgICAgJ2J1dHRvbnMnOiBbe1xuICAgICAgICAgIGNhcHRpb246ICdBY2NlcHQnLFxuICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGlmICgkc2NvcGUudXNlci5xdWV1ZSAmJiAkc2NvcGUudXNlci5xdWV1ZS5sZW5ndGggPT0gMCkge1xuICAgICAgICAgICAgICAkKCcjYXV0b0ZpbGxUcmFjaycpLm1vZGFsKCdzaG93Jyk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAkc2NvcGUudXNlci5hY2NlcHRlZCA9IHRydWU7XG4gICAgICAgICAgICAgIGlmICgkc2NvcGUudHJhZGUucDEudXNlci5faWQgPT0gJHNjb3BlLnVzZXIuX2lkKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWRlLnAxLmFjY2VwdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkc2NvcGUudHJhZGUucDIuYWNjZXB0ZWQgPSB0cnVlO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICAgJGh0dHAucHV0KCcvYXBpL3RyYWRlcycsICRzY29wZS50cmFkZSlcbiAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAkc2NvcGUudHJhZGUgPSByZXMuZGF0YTtcbiAgICAgICAgICAgICAgICAgIGlmICgkc2NvcGUudHJhZGUucDEuYWNjZXB0ZWQgJiYgJHNjb3BlLnRyYWRlLnAyLmFjY2VwdGVkKSAkc2NvcGUuY29tcGxldGVUcmFkZSgpO1xuICAgICAgICAgICAgICAgICAgZWxzZSAkc2NvcGUuZW1pdE1lc3NhZ2UoJy0tLS0gJyArICRzY29wZS51c2VyLnNvdW5kY2xvdWQudXNlcm5hbWUgKyBcIiBhY2NlcHRlZCB0aGUgdHJhZGUgLS0tLVwiLCAnYWxlcnQnKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKCdFcnJvciBhY2NlcHRpbmcnKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSwge1xuICAgICAgICAgIGNhcHRpb246ICdDYW5jZWwnLFxuICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdObyB3YXMgY2xpY2tlZCcpO1xuICAgICAgICAgIH1cbiAgICAgICAgfV1cbiAgICAgIH0pO1xuICAgIH1cbiAgICAvL292ZXJsYXkgYXV0b2ZpbGwgdHJhY2sgc3RhcnQvL1xuXG4gICRzY29wZS5hdXRvRmlsbFRyYWNrcyA9IFtdO1xuICAkc2NvcGUudHJhY2tMaXN0T2JqID0gbnVsbDtcbiAgJHNjb3BlLnRyYWNrTGlzdFNsb3RPYmogPSBudWxsO1xuICAkc2NvcGUubmV3UXVldWVTb25nID0gXCJcIjtcblxuICAkc2NvcGUudHJhY2tDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICRzY29wZS5tYWtlRXZlbnRVUkwgPSAkc2NvcGUudHJhY2tMaXN0U2xvdE9iai5wZXJtYWxpbmtfdXJsO1xuICAgICRzY29wZS5jaGFuZ2VVUkwoKTtcbiAgfTtcblxuICAkc2NvcGUudHJhY2tMaXN0Q2hhbmdlID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAkc2NvcGUubmV3UXVldWVTb25nID0gJHNjb3BlLnRyYWNrTGlzdE9iai5wZXJtYWxpbmtfdXJsO1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkc2NvcGUuY2hhbmdlUXVldWVTb25nKCk7XG4gIH07XG5cbiAgJHNjb3BlLmFkZFNvbmcgPSBmdW5jdGlvbigpIHtcblxuICAgIGlmICgkc2NvcGUudXNlci5xdWV1ZS5pbmRleE9mKCRzY29wZS5uZXdRdWV1ZUlEKSAhPSAtMSkgcmV0dXJuO1xuICAgICRzY29wZS51c2VyLnF1ZXVlLnB1c2goJHNjb3BlLm5ld1F1ZXVlSUQpO1xuICAgICRzY29wZS5zYXZlVXNlcigpO1xuICAgICRzY29wZS5uZXdRdWV1ZVNvbmcgPSB1bmRlZmluZWQ7XG4gICAgJHNjb3BlLnRyYWNrTGlzdE9iaiA9IFwiXCI7XG4gICAgJHNjb3BlLm5ld1F1ZXVlID0gdW5kZWZpbmVkO1xuICAgICRzY29wZS5hY2NlcHQoKTtcbiAgfVxuXG4gICRzY29wZS5jaGFuZ2VRdWV1ZVNvbmcgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLm5ld1F1ZXVlU29uZyAhPSBcIlwiKSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIHtcbiAgICAgICAgICB1cmw6ICRzY29wZS5uZXdRdWV1ZVNvbmdcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICB2YXIgdHJhY2sgPSByZXMuZGF0YTtcbiAgICAgICAgICAkc2NvcGUubmV3UXVldWUgPSB0cmFjaztcbiAgICAgICAgICAkc2NvcGUubmV3UXVldWVJRCA9IHRyYWNrLmlkO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAkc2NvcGUubmV3UXVldWVTb25nID0gXCJcIjtcbiAgICAgICAgICAkKCcjYXV0b0ZpbGxUcmFjaycpLm1vZGFsKCdoaWRlJyk7XG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJXZSBhcmUgbm90IGFsbG93ZWQgdG8gYWNjZXNzIHRyYWNrcyBieSB0aGlzIGFydGlzdCB3aXRoIHRoZSBTb3VuZGNsb3VkIEFQSS4gV2UgYXBvbG9naXplIGZvciB0aGUgaW5jb252ZW5pZW5jZSwgYW5kIHdlIGFyZSB3b3JraW5nIHdpdGggU291bmRjbG91ZCB0byByZXNvbHZlIHRoaXMgaXNzdWUuXCIpO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gICRzY29wZS5zYXZlVXNlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgJGh0dHAucHV0KFwiL2FwaS9kYXRhYmFzZS9wcm9maWxlXCIsICRzY29wZS51c2VyKVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUocmVzLmRhdGEpO1xuICAgICAgICAgICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICQuWmVicmFfRGlhbG9nKFwiRXJyb3I6IGRpZCBub3Qgc2F2ZVwiKTtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICAgICQoJyNhdXRvRmlsbFRyYWNrJykubW9kYWwoJ2hpZGUnKTtcbiAgICB9XG4gICAgLy9vdmVybGF5IGF1dG9maWxsIHRyYWNrIGVuZC8vXG4gICRzY29wZS5kYXlPZldlZWtBc1N0cmluZyA9IGZ1bmN0aW9uKGRhdGUpIHtcbiAgICB2YXIgZGF5SW5kZXggPSBkYXRlLmdldERheSgpO1xuICAgIHJldHVybiBbXCJTdW5kYXlcIiwgXCJNb25kYXlcIiwgXCJUdWVzZGF5XCIsIFwiV2VkbmVzZGF5XCIsIFwiVGh1cnNkYXlcIiwgXCJGcmlkYXlcIiwgXCJTYXR1cmRheVwiXVtkYXlJbmRleF07XG4gIH1cblxuICBzb2NrZXQub24oJ2luaXQnLCBmdW5jdGlvbihkYXRhKSB7XG4gICAgJHNjb3BlLm5hbWUgPSBkYXRhLm5hbWU7XG4gICAgJHNjb3BlLnVzZXJzID0gZGF0YS51c2VycztcbiAgfSk7XG5cbiAgc29ja2V0Lm9uKCdzZW5kOm1lc3NhZ2UnLCBmdW5jdGlvbihtZXNzYWdlKSB7XG4gICAgaWYgKG1lc3NhZ2UudHJhZGVJRCA9PSAkc3RhdGVQYXJhbXMudHJhZGVJRCkge1xuICAgICAgJHNjb3BlLm1zZ0hpc3RvcnkucHVzaChtZXNzYWdlKTtcbiAgICAgICRzY29wZS5tZXNzYWdlID0gbWVzc2FnZS5tZXNzYWdlO1xuICAgICAgJHNjb3BlLnRyYWRlLm1lc3NhZ2VzLnB1c2gobWVzc2FnZSk7XG4gICAgICBpZiAobWVzc2FnZS50eXBlID09IFwiYWxlcnRcIikge1xuICAgICAgICAkc2NvcGUucmVmcmVzaENhbGVuZGFyKCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBzb2NrZXQub24oJ2dldDptZXNzYWdlJywgZnVuY3Rpb24oZGF0YSkge1xuICAgIGlmIChkYXRhICE9ICcnKSB7XG4gICAgICBpZiAoZGF0YS5faWQgPT0gJHN0YXRlUGFyYW1zLnRyYWRlSUQpIHtcbiAgICAgICAgJHNjb3BlLm1zZ0hpc3RvcnkgPSBkYXRhID8gZGF0YS5tZXNzYWdlcyA6IFtdO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgJHNjb3BlLmVtaXRNZXNzYWdlID0gZnVuY3Rpb24obWVzc2FnZSwgdHlwZSkge1xuICAgIC8vIGlmKCRzY29wZS50cmFkZS5wMS51c2VyLl9pZCA9PSAkc2NvcGUudXNlci5faWQgJiYgJHNjb3BlLnRyYWRlLnAyLm9ubGluZSA9PSBmYWxzZSl7XG4gICAgLy8gICAkc2NvcGUudHJhZGUucDIuYWxlcnQgPSBcImNoYW5nZVwiO1xuICAgIC8vIH0gZWxzZSBpZiAoJHNjb3BlLnRyYWRlLnAyLnVzZXIuX2lkID09ICRzY29wZS51c2VyLl9pZCAmJiAkc2NvcGUudHJhZGUucDEub25saW5lID09IGZhbHNlKSB7XG4gICAgLy8gICAkc2NvcGUudHJhZGUucDEuYWxlcnQgPSBcImNoYW5nZVwiO1xuICAgIC8vIH0gIFxuICAgIHNvY2tldC5lbWl0KCdzZW5kOm1lc3NhZ2UnLCB7XG4gICAgICBtZXNzYWdlOiBtZXNzYWdlLFxuICAgICAgdHlwZTogdHlwZSxcbiAgICAgIGlkOiAkc2NvcGUudXNlci5faWQsXG4gICAgICB0cmFkZUlEOiAkc3RhdGVQYXJhbXMudHJhZGVJRFxuICAgIH0pO1xuICAgICRzY29wZS5tZXNzYWdlID0gJyc7XG4gIH1cblxuICAkc2NvcGUuZ2V0TWVzc2FnZSA9IGZ1bmN0aW9uKCkge1xuICAgIHNvY2tldC5lbWl0KCdnZXQ6bWVzc2FnZScsICRzdGF0ZVBhcmFtcy50cmFkZUlEKTtcbiAgfVxuXG4gICRzY29wZS5maWxsRGF0ZUFycmF5cyA9IGZ1bmN0aW9uKGV2ZW50cywgc2xvdHMpIHtcbiAgICB2YXIgY2FsZW5kYXIgPSBbXTtcbiAgICB2YXIgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjk7IGkrKykge1xuICAgICAgdmFyIGNhbERheSA9IHt9O1xuICAgICAgY2FsRGF5LmRheSA9IG5ldyBEYXRlKClcbiAgICAgIGNhbERheS5kYXkuc2V0RGF0ZSh0b2RheS5nZXREYXRlKCkgKyBpKTtcbiAgICAgIHZhciBkYXlFdmVudHMgPSBldmVudHMuZmlsdGVyKGZ1bmN0aW9uKGV2KSB7XG4gICAgICAgIHJldHVybiAoZXYuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09IGNhbERheS5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkpO1xuICAgICAgfSk7XG4gICAgICBzbG90cy5mb3JFYWNoKGZ1bmN0aW9uKHNsb3QpIHtcbiAgICAgICAgaWYgKHNsb3QuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09IGNhbERheS5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkpIGRheUV2ZW50cy5wdXNoKHNsb3QpO1xuICAgICAgfSk7XG4gICAgICB2YXIgZXZlbnRBcnJheSA9IFtdO1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCAyNDsgaisrKSB7XG4gICAgICAgIGV2ZW50QXJyYXlbal0gPSB7XG4gICAgICAgICAgdHlwZTogXCJlbXB0eVwiXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBkYXlFdmVudHMuZm9yRWFjaChmdW5jdGlvbihldikge1xuICAgICAgICBldmVudEFycmF5W2V2LmRheS5nZXRIb3VycygpXSA9IGV2O1xuICAgICAgfSk7XG5cbiAgICAgIGNhbERheS5ldmVudHMgPSBldmVudEFycmF5O1xuICAgICAgY2FsZW5kYXIucHVzaChjYWxEYXkpO1xuICAgIH1cbiAgICByZXR1cm4gY2FsZW5kYXI7XG4gIH1cblxuICAkc2NvcGUuZmlsbENhbGVuZGFyID0gZnVuY3Rpb24oKSB7XG4gICAgZnVuY3Rpb24gc2V0RXZlbnREYXlzKGFycikge1xuICAgICAgYXJyLmZvckVhY2goZnVuY3Rpb24oZXYpIHtcbiAgICAgICAgZXYuZGF5ID0gbmV3IERhdGUoZXYuZGF5KTtcbiAgICAgIH0pXG4gICAgfVxuICAgIHNldEV2ZW50RGF5cygkc2NvcGUucDFFdmVudHMpO1xuICAgIHNldEV2ZW50RGF5cygkc2NvcGUucDJFdmVudHMpO1xuICAgIHNldEV2ZW50RGF5cygkc2NvcGUudHJhZGUucDEuc2xvdHMpO1xuICAgIHNldEV2ZW50RGF5cygkc2NvcGUudHJhZGUucDIuc2xvdHMpO1xuXG4gICAgdmFyIG5vdyA9IG5ldyBEYXRlKClcbiAgICBub3cuc2V0SG91cnMobm93LmdldEhvdXJzKCksIDMwLCAwLCAwKTtcblxuICAgIHZhciBjaGFuZ2UgPSBmYWxzZTtcbiAgICB2YXIgb3AxU3RyaW5nID0gSlNPTi5zdHJpbmdpZnkoJHNjb3BlLnRyYWRlLnAxLnNsb3RzKTtcbiAgICB2YXIgbGFzdFN0cmluZyA9IG9wMVN0cmluZztcbiAgICBkbyB7XG4gICAgICBsYXN0U3RyaW5nID0gb3AxU3RyaW5nO1xuICAgICAgJHNjb3BlLnRyYWRlLnAxLnNsb3RzLmZvckVhY2goZnVuY3Rpb24oc2xvdCkge1xuICAgICAgICBpZiAoc2xvdC5kYXkgPCBub3cpIHtcbiAgICAgICAgICBzbG90LmRheS5zZXRIb3Vycyhub3cuZ2V0SG91cnMoKSArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKSArIDE0KTtcbiAgICAgICAgICBjaGFuZ2UgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgICRzY29wZS5wMUV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICRzY29wZS50cmFkZS5wMS5zbG90cy5mb3JFYWNoKGZ1bmN0aW9uKHNsb3QpIHtcbiAgICAgICAgICBpZiAoc2xvdC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gZXZlbnQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpICYmIHNsb3QuZGF5LmdldEhvdXJzKCkgPT0gZXZlbnQuZGF5LmdldEhvdXJzKCkpIHtcbiAgICAgICAgICAgIHNsb3QuZGF5LnNldEhvdXJzKHNsb3QuZGF5LmdldEhvdXJzKCkgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCkgKyAxKTtcbiAgICAgICAgICAgIGNoYW5nZSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICAgIG9wMVN0cmluZyA9IEpTT04uc3RyaW5naWZ5KCRzY29wZS50cmFkZS5wMS5zbG90cyk7XG4gICAgfSB3aGlsZSAob3AxU3RyaW5nICE9IGxhc3RTdHJpbmcpO1xuXG4gICAgdmFyIG9wMlN0cmluZyA9IEpTT04uc3RyaW5naWZ5KCRzY29wZS50cmFkZS5wMi5zbG90cylcbiAgICBkbyB7XG4gICAgICBsYXN0U3RyaW5nID0gb3AyU3RyaW5nO1xuICAgICAgJHNjb3BlLnRyYWRlLnAyLnNsb3RzLmZvckVhY2goZnVuY3Rpb24oc2xvdCkge1xuICAgICAgICBpZiAoc2xvdC5kYXkgPCBub3cpIHtcbiAgICAgICAgICBzbG90LmRheS5zZXRIb3Vycyhub3cuZ2V0SG91cnMoKSArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDEwKSArIDE0KTtcbiAgICAgICAgICBjaGFuZ2UgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgICRzY29wZS5wMkV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICRzY29wZS50cmFkZS5wMi5zbG90cy5mb3JFYWNoKGZ1bmN0aW9uKHNsb3QpIHtcbiAgICAgICAgICBpZiAoc2xvdC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gZXZlbnQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpICYmIHNsb3QuZGF5LmdldEhvdXJzKCkgPT0gZXZlbnQuZGF5LmdldEhvdXJzKCkpIHtcbiAgICAgICAgICAgIHNsb3QuZGF5LnNldEhvdXJzKHNsb3QuZGF5LmdldEhvdXJzKCkgKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxMCkgKyAxKTtcbiAgICAgICAgICAgIGNoYW5nZSA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgfSlcbiAgICAgIG9wMlN0cmluZyA9IEpTT04uc3RyaW5naWZ5KCRzY29wZS50cmFkZS5wMi5zbG90cyk7XG4gICAgfSB3aGlsZSAob3AyU3RyaW5nICE9IGxhc3RTdHJpbmcpO1xuXG4gICAgaWYgKGNoYW5nZSkge1xuICAgICAgJHNjb3BlLnRyYWRlLnAxLmFjY2VwdGVkID0gJHNjb3BlLnRyYWRlLnAyLmFjY2VwdGVkID0gZmFsc2U7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAkaHR0cC5wdXQoJy9hcGkvdHJhZGVzJywgJHNjb3BlLnRyYWRlKVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICRzY29wZS50cmFkZSA9IHJlcy5kYXRhO1xuICAgICAgICAgICRzY29wZS5maWxsQ2FsZW5kYXIoKTtcbiAgICAgICAgICAkc2NvcGUuZW1pdE1lc3NhZ2UoXCJNT1ZFRCBPVkVSTEFQUEVEIFNMT1RTXCIsICdhbGVydCcpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKClcbiAgICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLmNhbGVuZGFycDEgPSAkc2NvcGUuZmlsbERhdGVBcnJheXMoJHNjb3BlLnAxRXZlbnRzLCAkc2NvcGUudHJhZGUucDEuc2xvdHMpO1xuICAgICAgJHNjb3BlLmNhbGVuZGFycDIgPSAkc2NvcGUuZmlsbERhdGVBcnJheXMoJHNjb3BlLnAyRXZlbnRzLCAkc2NvcGUudHJhZGUucDIuc2xvdHMpO1xuICAgIH1cbiAgfVxuICAkc2NvcGUuZmlsbENhbGVuZGFyKCk7XG5cbiAgJHNjb3BlLnVwZGF0ZUFsZXJ0cyA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc2NvcGUudHJhZGUucDEudXNlci5faWQgPT0gJHNjb3BlLnVzZXIuX2lkKSB7XG4gICAgICAkc2NvcGUudHJhZGUucDEuYWxlcnQgPSBcIm5vbmVcIjtcbiAgICAgICRzY29wZS50cmFkZS5wMS5vbmxpbmUgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmICgkc2NvcGUudHJhZGUucDIudXNlci5faWQgPT0gJHNjb3BlLnVzZXIuX2lkKSB7XG4gICAgICAkc2NvcGUudHJhZGUucDIuYWxlcnQgPSBcIm5vbmVcIjtcbiAgICAgICRzY29wZS50cmFkZS5wMi5vbmxpbmUgPSB0cnVlO1xuICAgIH1cbiAgICAkc2NvcGUuJHBhcmVudC5zaG93bm90aWZpY2F0aW9uID0gZmFsc2U7XG4gICAgJGh0dHAucHV0KCcvYXBpL3RyYWRlcycsICRzY29wZS50cmFkZSk7XG4gIH1cblxuICAkc2NvcGUuY29tcGxldGVUcmFkZSA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkc2NvcGUudHJhZGUucDEuc2xvdHMuZm9yRWFjaChmdW5jdGlvbihzbG90KSB7XG4gICAgICB2YXIgZXZlbnQgPSBzbG90O1xuICAgICAgZXZlbnQudHlwZSA9ICd0cmFkZWQnO1xuICAgICAgZXZlbnQub3duZXIgPSAkc2NvcGUudHJhZGUucDIudXNlci5faWRcbiAgICAgICRodHRwLnBvc3QoJy9hcGkvZXZlbnRzL3JlcG9zdEV2ZW50cycsIGV2ZW50KTtcbiAgICB9KVxuICAgICRzY29wZS50cmFkZS5wMi5zbG90cy5mb3JFYWNoKGZ1bmN0aW9uKHNsb3QpIHtcbiAgICAgIHZhciBldmVudCA9IHNsb3Q7XG4gICAgICBldmVudC50eXBlID0gJ3RyYWRlZCc7XG4gICAgICBldmVudC5vd25lciA9ICRzY29wZS50cmFkZS5wMS51c2VyLl9pZFxuICAgICAgJGh0dHAucG9zdCgnL2FwaS9ldmVudHMvcmVwb3N0RXZlbnRzJywgZXZlbnQpO1xuICAgIH0pXG4gICAgJHNjb3BlLnRyYWRlLnAxLmFjY2VwdGVkID0gJHNjb3BlLnRyYWRlLnAyLmFjY2VwdGVkID0gZmFsc2U7XG4gICAgJHNjb3BlLnRyYWRlLnAxLnNsb3RzID0gJHNjb3BlLnRyYWRlLnAyLnNsb3RzID0gW107XG4gICAgJGh0dHAucHV0KCcvYXBpL3RyYWRlcycsICRzY29wZS50cmFkZSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICRzY29wZS5lbWl0TWVzc2FnZSgnLS0tLSAnICsgJHNjb3BlLnVzZXIuc291bmRjbG91ZC51c2VybmFtZSArIFwiIGFjY2VwdGVkIHRoZSB0cmFkZSAtLS0tXCIsICdhbGVydCcpO1xuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgJHNjb3BlLmVtaXRNZXNzYWdlKFwiVFJBREUgQ09NUExFVEVEXCIsICdhbGVydCcpO1xuICAgICAgICAgIH0sIDUwMClcbiAgICAgICAgfSwgMTUwMClcblxuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGNvbnNvbGUubG9nKTtcbiAgfVxuXG4gICRzY29wZS5nZXRTdHlsZSA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgaWYgKGV2ZW50LnR5cGUgPT0gJ2VtcHR5Jykge1xuICAgICAgcmV0dXJuIHt9XG4gICAgfSBlbHNlIGlmIChldmVudC50eXBlID09ICd0cmFkZScpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNBREQ4RTYnXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChldmVudC50eXBlID09ICd0cmFjaycgfHwgZXZlbnQudHlwZSA9PSAncXVldWUnIHx8IGV2ZW50LnR5cGUgPT0gJ3BhaWQnKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6ICcjZWVlZWVlJyxcbiAgICAgICAgJ2NvbG9yJzogJ3JnYmEoMCwwLDAsMCknXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChldmVudC50eXBlID09ICd0cmFkZWQnKSB7XG4gICAgICBpZiAoZXZlbnQub3duZXIgPT0gJHNjb3BlLnRyYWRlLnAxLnVzZXIuX2lkIHx8IGV2ZW50Lm93bmVyID09ICRzY29wZS50cmFkZS5wMi51c2VyLl9pZCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNGRkUxQUInXG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgJ2JhY2tncm91bmQtY29sb3InOiAnI2VlZWVlZScsXG4gICAgICAgICAgJ2NvbG9yJzogJ3JnYmEoMCwwLDAsMCknXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAkc2NvcGUuZGF5T2ZXZWVrQXNTdHJpbmcgPSBmdW5jdGlvbihkYXRlKSB7XG4gICAgdmFyIGRheUluZGV4ID0gZGF0ZS5nZXREYXkoKTtcbiAgICByZXR1cm4gW1wiU3VuZGF5XCIsIFwiTW9uZGF5XCIsIFwiVHVlc2RheVwiLCBcIldlZG5lc2RheVwiLCBcIlRodXJzZGF5XCIsIFwiRnJpZGF5XCIsIFwiU2F0dXJkYXlcIl1bZGF5SW5kZXhdO1xuICB9XG5cblxuICAkc2NvcGUudW5yZXBvc3RTeW1ib2wgPSBmdW5jdGlvbihldmVudCkge1xuICAgIGlmICghZXZlbnQudW5yZXBvc3REYXRlKSByZXR1cm47XG4gICAgZXZlbnQudW5yZXBvc3REYXRlID0gbmV3IERhdGUoZXZlbnQudW5yZXBvc3REYXRlKTtcbiAgICByZXR1cm4gZXZlbnQudW5yZXBvc3REYXRlID4gbmV3IERhdGUoKTtcbiAgfVxuXG4gICRzY29wZS5zaG93Qm94SW5mbyA9IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgcmV0dXJuIChldmVudC50eXBlID09ICd0cmFkZScgfHwgZXZlbnQudHlwZSA9PSAndHJhZGVkJylcbiAgfVxuXG4gICRzY29wZS5mb2xsb3dlclNob3cgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gKHNjcmVlbi53aWR0aCA+ICc0MzYnKTtcbiAgfVxuXG5cbiAgJHNjb3BlLm9wZW5IZWxwTW9kYWwgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGlzcGxheVRleHQgPSBcIlRoaXMgaW50ZXJmYWNlIHNob3dzIHlvdXIgc2NoZWR1bGVyIGFuZCB0aGUgc2NoZWR1bGVyIGZvciB0aGUgdXNlciB5b3UgYXJlIHRyYWRpbmcgd2l0aCwgbGFiZWxlZCBvbiB0aGUgdG9wIG9mIGVhY2ggcmVzcGVjdGl2ZSBzY2hlZHVsZS4gWW91ciBjYWxlbmRhciB3aWxsIGFsd2F5cyBiZSBvbiB0aGUgbGVmdC48YnIvPjxici8+PGltZyBzcmM9J2Fzc2V0cy9pbWFnZXMvZ3JleS1zbG90LnBuZycvPiBHcmV5IHNsb3RzIHJlcHJlc2VudHMgc2xvdHMgdGhhdCBhcmUgYWxyZWFkeSB0YWtlbi48YnI+PGJyLz48aW1nIHNyYz0nYXNzZXRzL2ltYWdlcy9ibHVlLXNsb3QucG5nJy8+ICBCbHVlIHNsb3RzIHJlcHJlc2VudCBzbG90cyB0aGF0IGFyZSBiZWluZyBiYXJnYWluZWQgaW4gdGhlIHRyYWRlLjxici8+PGJyLz48aW1nIHNyYz0nYXNzZXRzL2ltYWdlcy9hcnJvdy1zbG90LnBuZycvPiAgQW4gQXJyb3cgd2l0aGluIGEgc2xvdCBtZWFucyBpdCB3aWxsIGJlIHVucmVwb3N0ZWQgYWZ0ZXIgMjQgaG91cnMuPGJyLz48YnI+VGhlIGNoYXQgd2luZG93IG9uIHRoZSBib3R0b20gYWxsb3dzIHlvdSB0byBjaGF0IHdpdGggeW91ciBSZXBvc3QgUGFydG5lciBhYm91dCB5b3VyIHRyYWRlLjxici8+RW1haWwgd2lsbCBhdXRvbWF0aWNhbGx5IG9wZW4gYSBuZXcgZW1haWwgb24geW91ciBtYWlsaW5nIGFwcCwgYWxsb3dpbmcgeW91IHRvIG1lc3NhZ2UgeW91ciByZXBvc3QgcGFydG5lciB2aWEgZW1haWwgZm9yIHlvdXIgdHJhZGUuPGJyLz48YnIvPkhvdyB0byB1c2UgQVUncyBSZXBvc3QgZm9yIFJlcG9zdCBTeXN0ZW06PGJyLz4xLiBTdGFydCBieSBkZWNpZGluZyBob3cgeW91IHdvdWxkIGxpa2UgdG8gdHJhZGUgd2l0aCB5b3VyIHBhcnRuZXIuPGJyLz4yLiBNYXJrIHNsb3RzIG9uIHlvdXIgY2FsZW5kYXIgYW5kIG1hcmsgc2xvdHMgb24geW91ciBwYXJ0bmVycyBjYWxlbmRhci48YnIvPjMuIENsaWNrIGFjY2VwdDxici8+PGJyLz5XaGVuIHlvdXIgcGFydG5lciByZXR1cm5zIHRvIEFVLCBoZSB3aWxsIGJlIGFibGUgdG8gYWNjZXB0IHlvdXIgdHJhZGUuIElmIGFjY2VwdGVkLCB5b3Ugd2lsbCBiZSBhYmxlIHRvIHNjaGVkdWxlIHJlcG9zdHMgb24gdGhlIHNsb3RzIGRlc2lnbmF0ZWQgb24geW91ciBwYXJ0bmVy4oCZcyBjYWxlbmRhcjsgeW91ciBwYXJ0bmVyIHdpbGwgYmUgYWJsZSB0byBzY2hlZHVsZSByZXBvc3RzIG9uIHRoZSBzbG90cyBkZXNpZ25hdGVkIG9uIHlvdXIgY2FsZW5kYXIuIElmIHlvdSBhcmUgYXdheSBmcm9tIGtleWJvYXJkIGF0IHRoZSB0aW1lIG9mIHlvdXIgdHJhZGUsIHRyYWNrcyB0aGF0IGFyZSBpbiB5b3VyICdhdXRvLWZpbGwnIHF1ZXVlIChoeXBlcmxpbmsgdG8gYXV0b2ZpbGwgcXVldSkgaW4gdGhlIHNjaGVkdWxlciB3aWxsIGF1dG9tYXRpY2FsbHkgYmUgc2NoZWR1bGVkIGZvciByZXBvc3QuPGJyLz48YnIvPlRpcHM6PGJyLz4xLiBNYWtlIHN1cmUgeW91IGFyZSBmYWlyIHdpdGggeW91ciB0cmFkZXMuIElmIHlvdSBoYXZlIGhhbGYgYXMgbWFueSBmb2xsb3dlcnMgYXMgeW91ciBwYXJ0bmVyLCBvZmZlciAyIHJlcG9zdHMgb24geW91ciBjYWxlbmRhciBpbiBleGNoYW5nZSBmb3IgMSByZXBvc3Qgb24gdGhlaXJzLjxiciAvPjIuIE1ha2Ugc3VyZSB5b3UgY2hlY2sgeW91ciB0cmFkZXMgb24gYSByZWd1bGFyIGJhc2lzLiBQZW9wbGUgYXJlIG11Y2ggbW9yZSBsaWtlbHkgdG8gY29uc3RhbnRseSB0cmFkZSByZXBvc3RzIHdpdGggeW91IGlmIHlvdSBhcmUgcmVsaWFibGUuPGJyIC8+My4gVHJ5IGNvbW11bmljYXRpbmcgd2l0aCB0aGUgdXNlciBvbiBGYWNlYm9vaywgRW1haWwsIFNvdW5kQ2xvdWQgbWVzc2VuZ2VyIG9yIGFueSBtZXNzYWdpbmcgYXBwIHRvIG1ha2Ugc3VyZSB0aGV5IHRha2UgYWN0aW9uIG9uIHRyYWRlcyB3aGVuIGl0IGlzIHRoZWlyIHR1cm4uIEEgZnJpZW5kbHkgJ0hleSwgbGV0IG1lIGtub3cgd2hlbiB5b3UgYWNjZXB0IHRoZSB0cmFkZSBvbiBBVSEgVGhhbmtzIGFnYWluIGZvciB0cmFkaW5nIHdpdGggbWUgOiknIGlzIGVub3VnaCB0byBlbnN1cmUgYSBnb29kIGZsb3cgb2YgY29tbXVuaWNhdGlvbiBmb3IgeW91ciB0cmFkZXMhXCI7XG4gICAgJC5aZWJyYV9EaWFsb2coZGlzcGxheVRleHQsIHtcbiAgICAgIHdpZHRoOiA5MDBcbiAgICB9KTtcbiAgfVxuXG4gICRzY29wZS51cGRhdGVFbWFpbCA9IGZ1bmN0aW9uKGVtYWlsKSB7XG4gICAgdmFyIGFuc3dlciA9IGVtYWlsO1xuICAgIHZhciBteUFycmF5ID0gYW5zd2VyLm1hdGNoKC9bYS16XFwuX1xcLSEjJCUmJysvPT9eX2B7fXx+XStAW2EtejAtOVxcLV0rXFwuXFxTezIsM30vaWdtKTtcbiAgICBpZiAobXlBcnJheSkge1xuICAgICAgJHNjb3BlLnVzZXIuZW1haWwgPSBhbnN3ZXI7XG4gICAgICByZXR1cm4gJGh0dHAucHV0KCcvYXBpL2RhdGFiYXNlL3Byb2ZpbGUnLCAkc2NvcGUudXNlcilcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlKHJlcy5kYXRhKTtcbiAgICAgICAgICAkc2NvcGUudXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcbiAgICAgICAgICAkc2NvcGUuaGlkZWFsbCA9IGZhbHNlO1xuICAgICAgICAgICQoJyNlbWFpbE1vZGFsJykubW9kYWwoJ2hpZGUnKTtcbiAgICAgICAgICAkc2NvcGUuc2hvd0VtYWlsTW9kYWwgPSBmYWxzZTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRzY29wZS5zaG93RW1haWxNb2RhbCA9IGZhbHNlO1xuICAgICAgICAgICAgJHNjb3BlLnByb21wdEZvckVtYWlsKCk7XG4gICAgICAgICAgfSwgNjAwKTtcbiAgICAgICAgfSlcbiAgICB9IGVsc2Uge1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgJHNjb3BlLnNob3dFbWFpbE1vZGFsID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5wcm9tcHRGb3JFbWFpbCgpO1xuICAgICAgfSwgNjAwKTtcbiAgICB9XG4gIH1cblxuICAkc2NvcGUucHJvbXB0Rm9yRW1haWwgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoISRzY29wZS51c2VyLmVtYWlsKSB7XG4gICAgICAkc2NvcGUuc2hvd0VtYWlsTW9kYWwgPSB0cnVlO1xuICAgICAgJCgnI2VtYWlsTW9kYWwnKS5tb2RhbCgnc2hvdycpO1xuICAgIH1cbiAgfVxuICAkc2NvcGUudmVyaWZ5QnJvd3NlciA9IGZ1bmN0aW9uKCkge1xuICAgIGlmIChuYXZpZ2F0b3IudXNlckFnZW50LnNlYXJjaChcIkNocm9tZVwiKSA9PSAtMSAmJiBuYXZpZ2F0b3IudXNlckFnZW50LnNlYXJjaChcIlNhZmFyaVwiKSAhPSAtMSkge1xuICAgICAgdmFyIHBvc2l0aW9uID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5zZWFyY2goXCJWZXJzaW9uXCIpICsgODtcbiAgICAgIHZhciBlbmQgPSBuYXZpZ2F0b3IudXNlckFnZW50LnNlYXJjaChcIiBTYWZhcmlcIik7XG4gICAgICB2YXIgdmVyc2lvbiA9IG5hdmlnYXRvci51c2VyQWdlbnQuc3Vic3RyaW5nKHBvc2l0aW9uLCBlbmQpO1xuICAgICAgaWYgKHBhcnNlSW50KHZlcnNpb24pIDwgOSkge1xuICAgICAgICAkLlplYnJhX0RpYWxvZygnWW91IGhhdmUgb2xkIHZlcnNpb24gb2Ygc2FmYXJpLiBDbGljayA8YSBocmVmPVwiaHR0cHM6Ly9zdXBwb3J0LmFwcGxlLmNvbS9kb3dubG9hZHMvc2FmYXJpXCI+aGVyZTwvYT4gdG8gZG93bmxvYWQgdGhlIGxhdGVzdCB2ZXJzaW9uIG9mIHNhZmFyaSBmb3IgYmV0dGVyIHNpdGUgZXhwZXJpZW5jZS4nLCB7XG4gICAgICAgICAgJ3R5cGUnOiAnY29uZmlybWF0aW9uJyxcbiAgICAgICAgICAnYnV0dG9ucyc6IFt7XG4gICAgICAgICAgICBjYXB0aW9uOiAnT0snXG4gICAgICAgICAgfV0sXG4gICAgICAgICAgJ29uQ2xvc2UnOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICR3aW5kb3cubG9jYXRpb24uaHJlZiA9IFwiaHR0cHM6Ly9zdXBwb3J0LmFwcGxlLmNvbS9kb3dubG9hZHMvc2FmYXJpXCI7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRzY29wZS5wcm9tcHRGb3JFbWFpbCgpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUucHJvbXB0Rm9yRW1haWwoKTtcbiAgICB9XG4gIH1cblxuICAkc2NvcGUudXBkYXRlQWxlcnRzKCk7XG4gICRzY29wZS52ZXJpZnlCcm93c2VyKCk7XG59KTtcblxuXG5hcHAuZGlyZWN0aXZlKCd0aW1lU2xvdCcsIGZ1bmN0aW9uKG1vbWVudCkge1xuICByZXR1cm4ge1xuICAgIHJlc3RyaWN0OiAnRScsXG4gICAgc2NvcGU6IHtcbiAgICAgIHN0YXJ0RGF0ZTogXCJAXCIsXG4gICAgICBlYWNoRGF0ZTogJ0AnLFxuICAgICAgcHJldmlvdXNEYXRlOiAnQCdcbiAgICB9LFxuICAgIGxpbms6IGZ1bmN0aW9uKHNjb3BlLCBlbGVtZW50LCBhdHRycykge1xuICAgICAgRGF0ZS5wcm90b3R5cGUuYWRkSG91cnMgPSBmdW5jdGlvbihoKSB7XG4gICAgICAgIHRoaXMuc2V0SG91cnModGhpcy5nZXRIb3VycygpICsgaCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgfTtcblxuICAgICAgdmFyIGRhdGVPYmogPSB7XG4gICAgICAgIHN0YXJ0RGF0ZTogbmV3IERhdGUoc2NvcGUuc3RhcnREYXRlKSxcbiAgICAgICAgZWFjaERhdGU6IG5ldyBEYXRlKHNjb3BlLmVhY2hEYXRlKSxcbiAgICAgICAgcHJldmlvdXNEYXRlOiAoc2NvcGUucHJldmlvdXNEYXRlKSA/IG5ldyBEYXRlKHNjb3BlLnByZXZpb3VzRGF0ZSkgOiBudWxsXG4gICAgICB9O1xuICAgICAgdmFyIHByZXZEYXRlID0gKGRhdGVPYmoucHJldmlvdXNEYXRlKSA/IGRhdGVPYmoucHJldmlvdXNEYXRlLnRvTG9jYWxlU3RyaW5nKCkuc3BsaXQoJywnKVswXSA6IG51bGw7XG4gICAgICB2YXIgZWFjRGF0ZSA9IChkYXRlT2JqLmVhY2hEYXRlKSA/IGRhdGVPYmouZWFjaERhdGUudG9Mb2NhbGVTdHJpbmcoKS5zcGxpdCgnLCcpWzBdIDogbnVsbDtcbiAgICAgIHZhciBwcnZIb3VycyA9IChkYXRlT2JqLnByZXZpb3VzRGF0ZSkgPyBkYXRlT2JqLnByZXZpb3VzRGF0ZS5nZXRIb3VycygpIDogMDtcbiAgICAgIHZhciBlY2hIb3VycyA9IChkYXRlT2JqLmVhY2hEYXRlKSA/IGRhdGVPYmouZWFjaERhdGUuZ2V0SG91cnMoKSA6IDA7XG4gICAgICBpZiAoIXByZXZEYXRlKSB7XG4gICAgICAgIHNjb3BlLnNsb3QgPSBpc1RvZGF5RGF0ZShkYXRlT2JqLnByZXZpb3VzRGF0ZSwgZGF0ZU9iai5lYWNoRGF0ZSkgKyAnICcgKyBmb3JtYXRBTVBNKGRhdGVPYmouZWFjaERhdGUpO1xuICAgICAgfSBlbHNlIGlmICgocHJldkRhdGUgIT0gZWFjRGF0ZSkgJiYgKHBydkhvdXJzICE9IGVjaEhvdXJzKSkge1xuICAgICAgICBzY29wZS5zbG90ID0gaXNUb2RheURhdGUoZGF0ZU9iai5wcmV2aW91c0RhdGUsIGRhdGVPYmouZWFjaERhdGUpICsgJyAnICsgZm9ybWF0QU1QTShkYXRlT2JqLmVhY2hEYXRlKTtcbiAgICAgIH0gZWxzZSBpZiAoKHByZXZEYXRlID09IGVhY0RhdGUpICYmIChwcnZIb3VycyAhPSBlY2hIb3VycykpIHtcbiAgICAgICAgc2NvcGUuc2xvdCA9IGlzVG9kYXlEYXRlKGRhdGVPYmoucHJldmlvdXNEYXRlLCBkYXRlT2JqLmVhY2hEYXRlKSArICcgJyArIGZvcm1hdEFNUE0oZGF0ZU9iai5lYWNoRGF0ZSk7XG4gICAgICB9IGVsc2UgaWYgKChwcmV2RGF0ZSAhPSBlYWNEYXRlKSAmJiAocHJ2SG91cnMgPT0gZWNoSG91cnMpKSB7XG4gICAgICAgIHNjb3BlLnNsb3QgPSBpc1RvZGF5RGF0ZShkYXRlT2JqLnByZXZpb3VzRGF0ZSwgZGF0ZU9iai5lYWNoRGF0ZSkgKyAnICcgKyBmb3JtYXRBTVBNKGRhdGVPYmouZWFjaERhdGUpO1xuICAgICAgfVxuICAgIH0sXG4gICAgcmVwbGFjZTogJ3RydWUnLFxuICAgIHRlbXBsYXRlOiAnPHAgY2xhc3M9XCJ0aW1lXCI+e3tzbG90fX08L3A+J1xuICB9O1xuXG4gIGZ1bmN0aW9uIGlzVG9kYXlEYXRlKHByZXZEYXRlLCBlYWNEYXRlKSB7XG4gICAgaWYgKChtb21lbnQoKS5mb3JtYXQoJ01NLURELVlZWVknKSA9PSBtb21lbnQocHJldkRhdGUpLmZvcm1hdCgnTU0tREQtWVlZWScpKSB8fCAobW9tZW50KCkuZm9ybWF0KCdNTS1ERC1ZWVlZJykgPT0gbW9tZW50KGVhY0RhdGUpLmZvcm1hdCgnTU0tREQtWVlZWScpKSkge1xuICAgICAgcmV0dXJuICdUb2RheSwgJztcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG1vbWVudChlYWNEYXRlKS5mb3JtYXQoJ01NTU0gREQgWVlZWSwgJyk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0QU1QTShkYXRlKSB7XG4gICAgdmFyIGhvdXJzID0gZGF0ZS5nZXRIb3VycygpO1xuICAgIHZhciBtaW51dGVzID0gZGF0ZS5nZXRNaW51dGVzKCk7XG4gICAgdmFyIGFtcG0gPSBob3VycyA+PSAxMiA/ICdQTScgOiAnQU0nO1xuICAgIGhvdXJzID0gaG91cnMgJSAxMjtcbiAgICBob3VycyA9IGhvdXJzID8gaG91cnMgOiAxMjtcbiAgICBtaW51dGVzID0gbWludXRlcyA8IDEwID8gJzAnICsgbWludXRlcyA6IG1pbnV0ZXM7XG4gICAgdmFyIHN0clRpbWUgPSBob3VycyArICc6JyArIG1pbnV0ZXMgKyAnICcgKyBhbXBtO1xuICAgIHJldHVybiBzdHJUaW1lO1xuICB9XG59KTsiLCIndXNlIHN0cmljdCc7XG5hcHAuZmFjdG9yeSgnc29ja2V0JywgZnVuY3Rpb24gKCRyb290U2NvcGUpIHtcbiAgdmFyIHNvY2tldDtcbiAgcmV0dXJuIHtcbiAgICBvbjogZnVuY3Rpb24gKGV2ZW50TmFtZSwgY2FsbGJhY2spIHsgICAgICBcbiAgICAgIHNvY2tldC5vbihldmVudE5hbWUsIGZ1bmN0aW9uICgpIHsgIFxuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgJHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHNvY2tldCwgYXJncyk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfSxcbiAgICBlbWl0OiBmdW5jdGlvbiAoZXZlbnROYW1lLCBkYXRhLCBjYWxsYmFjaykge1xuICAgICAgc29ja2V0LmVtaXQoZXZlbnROYW1lLCBkYXRhLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgICAkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgICAgICBjYWxsYmFjay5hcHBseShzb2NrZXQsIGFyZ3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9KVxuICAgIH0sXG4gICAgZ2V0TWVzc2FnZTogZnVuY3Rpb24gKGV2ZW50TmFtZSwgZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgIHNvY2tldC5lbWl0KGV2ZW50TmFtZSwgZGF0YSwgZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgICAgJHJvb3RTY29wZS4kYXBwbHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgIGlmIChjYWxsYmFjaykge1xuICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkoc29ja2V0LCBhcmdzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICB9LFxuICAgIGNvbm5lY3Q6IGZ1bmN0aW9uKCl7XG4gICAgICBzb2NrZXQgPSBpby5jb25uZWN0KCk7XG4gICAgfSxcbiAgICBkaXNjb25uZWN0OiBmdW5jdGlvbiAoKSB7XG4gICAgICBzb2NrZXQuZGlzY29ubmVjdCgpO1xuICAgIH1cbiAgfTtcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ3JlRm9yUmVMaXN0cycsIHtcbiAgICAgIHVybDogJy9hcnRpc3RUb29scy9yZUZvclJlTGlzdHMnLFxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy9hcnRpc3RUb29scy9yZUZvclJlTGlzdHMvcmVGb3JSZUxpc3RzLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ1JlRm9yUmVMaXN0c0NvbnRyb2xsZXInLFxuICAgICAgcmVzb2x2ZToge1xuICAgICAgICBjdXJyZW50VHJhZGVzOiBmdW5jdGlvbigkaHR0cCwgU2Vzc2lvblNlcnZpY2UpIHtcbiAgICAgICAgICB2YXIgdXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcbiAgICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgdmFyIHRyYWRlVHlwZSA9IHtcbiAgICAgICAgICAgICAgUmVxdWVzdHM6IHRydWUsXG4gICAgICAgICAgICAgIFJlcXVlc3RlZDogdHJ1ZSxcbiAgICAgICAgICAgICAgVHJhZGVQYXJ0bmVyczogdHJ1ZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvdHJhZGVzL3dpdGhVc2VyLycgKyB1c2VyLl9pZCArICc/dHJhZGVUeXBlPScgKyBKU09OLnN0cmluZ2lmeSh0cmFkZVR5cGUpKVxuICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICB2YXIgdHJhZGVzID0gcmVzLmRhdGE7XG4gICAgICAgICAgICAgICAgdHJhZGVzLmZvckVhY2goZnVuY3Rpb24odHJhZGUpIHtcbiAgICAgICAgICAgICAgICAgIHRyYWRlLm90aGVyID0gKHRyYWRlLnAxLnVzZXIuX2lkID09IHVzZXIuX2lkKSA/IHRyYWRlLnAyIDogdHJhZGUucDE7XG4gICAgICAgICAgICAgICAgICB0cmFkZS51c2VyID0gKHRyYWRlLnAxLnVzZXIuX2lkID09IHVzZXIuX2lkKSA/IHRyYWRlLnAxIDogdHJhZGUucDI7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgdHJhZGVzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgICAgICAgICAgaWYgKGEudXNlci5hbGVydCA9PSBcImNoYW5nZVwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAoYS51c2VyLmFsZXJ0ID09IFwicGxhY2VtZW50XCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIC0xXG4gICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gMTtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJhZGVzO1xuICAgICAgICAgICAgICB9KVxuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBvcGVuVHJhZGVzOiBmdW5jdGlvbigkaHR0cCwgU2Vzc2lvblNlcnZpY2UpIHtcbiAgICAgICAgICB2YXIgdXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcbiAgICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgdmFyIG1pbkZvbGxvd2VyID0gKCh1c2VyLnNvdW5kY2xvdWQuZm9sbG93ZXJzICYmIHVzZXIuc291bmRjbG91ZC5mb2xsb3dlcnMgPiAwKSA/IHBhcnNlSW50KHVzZXIuc291bmRjbG91ZC5mb2xsb3dlcnMgLyAyKSA6IDApO1xuICAgICAgICAgICAgdmFyIG1heEZvbGxvd2VyID0gKCh1c2VyLnNvdW5kY2xvdWQuZm9sbG93ZXJzICYmIHVzZXIuc291bmRjbG91ZC5mb2xsb3dlcnMgPiAwKSA/IHBhcnNlSW50KHVzZXIuc291bmRjbG91ZC5mb2xsb3dlcnMgKiAyKSA6IDEwMDApO1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvdXNlcnMvYnlTQ1VSTC8nLCB7XG4gICAgICAgICAgICAgICAgdXJsOiAnJyxcbiAgICAgICAgICAgICAgICBtaW5Gb2xsb3dlcjogbWluRm9sbG93ZXIsXG4gICAgICAgICAgICAgICAgbWF4Rm9sbG93ZXI6IG1heEZvbGxvd2VyLFxuICAgICAgICAgICAgICAgIHJlY29yZFJhbmdlOiB7XG4gICAgICAgICAgICAgICAgICBza2lwOiAwLFxuICAgICAgICAgICAgICAgICAgbGltaXQ6IDEyXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XG4gICAgICAgICAgICAgIH0pXG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KVxufSk7XG5cbmFwcC5jb250cm9sbGVyKFwiUmVGb3JSZUxpc3RzQ29udHJvbGxlclwiLCBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsIGN1cnJlbnRUcmFkZXMsIG9wZW5UcmFkZXMsICRodHRwLCBTZXNzaW9uU2VydmljZSwgJHN0YXRlLCAkdGltZW91dCkge1xuICBpZiAoIVNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKSkge1xuICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICBcdHJldHVybjtcbiAgfVxuICAkc2NvcGUuc3RhdGUgPSAncmVGb3JSZUludGVyYWN0aW9uJztcbiAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XG4gICRyb290U2NvcGUudXNlcmxpbmtlZEFjY291bnRzID0gKCRzY29wZS51c2VyLmxpbmtlZEFjY291bnRzID8gJHNjb3BlLnVzZXIubGlua2VkQWNjb3VudHMgOiBbXSk7XG4gICRzY29wZS5jdXJyZW50VHJhZGVzID0gY3VycmVudFRyYWRlcztcbiAgJHNjb3BlLmN1cnJlbnRUcmFkZXNDb3B5ID0gY3VycmVudFRyYWRlcztcbiAgJHNjb3BlLm90aGVyVXNlcnMgPSBbXTtcbiAgJHNjb3BlLnNlYXJjaFVzZXIgPSBvcGVuVHJhZGVzO1xuICAkc2NvcGUuY3VycmVudFRhYiA9IFwiU2VhcmNoVHJhZGVcIjtcbiAgJHNjb3BlLnNlYXJjaFVSTCA9IFwiXCI7XG5cbiAgJHNjb3BlLnNsaWRlclNlYXJjaE1pbiA9IE1hdGgubG9nKCgoJHNjb3BlLnVzZXIuc291bmRjbG91ZC5mb2xsb3dlcnMpID8gcGFyc2VJbnQoJHNjb3BlLnVzZXIuc291bmRjbG91ZC5mb2xsb3dlcnMgLyAyKSA6IDApKSAvIE1hdGgubG9nKDEuMSk7XG4gICRzY29wZS5zbGlkZXJTZWFyY2hNYXggPSBNYXRoLmxvZygoKCRzY29wZS51c2VyLnNvdW5kY2xvdWQuZm9sbG93ZXJzKSA/IHBhcnNlSW50KCRzY29wZS51c2VyLnNvdW5kY2xvdWQuZm9sbG93ZXJzICogMikgOiAyMDAwMDAwMDApKSAvIE1hdGgubG9nKDEuMSk7XG4gICRzY29wZS5taW5TZWFyY2hUcmFkZWZvbGxvd2VycyA9IE1hdGgucG93KDEuMSwgJHNjb3BlLnNsaWRlclNlYXJjaE1pbik7XG4gICRzY29wZS5tYXhTZWFyY2hUcmFkZWZvbGxvd2VycyA9IE1hdGgucG93KDEuMSwgJHNjb3BlLnNsaWRlclNlYXJjaE1heCk7XG5cbiAgJHNjb3BlLnNsaWRlck1hbmFnZU1pbiA9IDA7XG4gICRzY29wZS5zbGlkZXJNYW5hZ2VNYXggPSAyMDAwMDAwMDA7XG5cbiAgJHNjb3BlLm1pbk1hbmFnZVRyYWRlZm9sbG93ZXJzID0gTWF0aC5wb3coMS4xLCAkc2NvcGUuc2xpZGVyTWFuYWdlTWluKTtcbiAgJHNjb3BlLm1heE1hbmFnZVRyYWRlZm9sbG93ZXJzID0gTWF0aC5wb3coMS4xLCAkc2NvcGUuc2xpZGVyTWFuYWdlTWF4KTtcblxuICAkc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkc2NvcGUuc2xpZGVyU2VhcmNoTWluXG4gIH0sIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKSB7XG4gICAgJHNjb3BlLm1pblNlYXJjaFRyYWRlZm9sbG93ZXJzID0gTWF0aC5wb3coMS4xLCBuZXdWYWwpXG4gIH0pXG4gICRzY29wZS4kd2F0Y2goZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICRzY29wZS5zbGlkZXJTZWFyY2hNYXhcbiAgfSwgZnVuY3Rpb24obmV3VmFsLCBvbGRWYWwpIHtcbiAgICAkc2NvcGUubWF4U2VhcmNoVHJhZGVmb2xsb3dlcnMgPSBNYXRoLnBvdygxLjEsIG5ld1ZhbCk7XG4gIH0pXG5cbiAgJHNjb3BlLiR3YXRjaChmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJHNjb3BlLnNsaWRlck1hbmFnZU1pblxuICB9LCBmdW5jdGlvbihuZXdWYWwsIG9sZFZhbCkge1xuICAgICRzY29wZS5taW5NYW5hZ2VUcmFkZWZvbGxvd2VycyA9IE1hdGgucG93KDEuMSwgbmV3VmFsKVxuICB9KVxuICAkc2NvcGUuJHdhdGNoKGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkc2NvcGUuc2xpZGVyTWFuYWdlTWF4XG4gIH0sIGZ1bmN0aW9uKG5ld1ZhbCwgb2xkVmFsKSB7XG4gICAgJHNjb3BlLm1heE1hbmFnZVRyYWRlZm9sbG93ZXJzID0gTWF0aC5wb3coMS4xLCBuZXdWYWwpO1xuICB9KVxuXG4gICRzY29wZS5zb3J0YnkgPSBcIlJlY2VudCBBbGVydFwiO1xuICAkc2NvcGUuc29ydF9vcmRlciA9IFwiYXNjZW5kaW5nXCI7XG4gIHZhciBzZWFyY2hUcmFkZVJhbmdlID0ge1xuICAgIHNraXA6IDAsXG4gICAgbGltaXQ6IDEyXG4gIH1cblxuICAkc2NvcGUuc2VhcmNoQnlGb2xsb3dlcnMgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc2VhcmNoVVJMID0gXCJcIjtcbiAgICAkc2NvcGUuc2VuZFNlYXJjaCgpO1xuICB9XG5cbiAgJHNjb3BlLnNlbmRTZWFyY2ggPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJHNjb3BlLnNlYXJjaFVzZXIgPSBbXTtcblxuICAgICRodHRwLnBvc3QoJy9hcGkvdXNlcnMvYnlTQ1VSTC8nLCB7XG4gICAgICAgIHVybDogJHNjb3BlLnNlYXJjaFVSTCxcbiAgICAgICAgbWluRm9sbG93ZXI6ICRzY29wZS5taW5TZWFyY2hUcmFkZWZvbGxvd2VycyxcbiAgICAgICAgbWF4Rm9sbG93ZXI6ICRzY29wZS5tYXhTZWFyY2hUcmFkZWZvbGxvd2VycyxcbiAgICAgICAgcmVjb3JkUmFuZ2U6IHtcbiAgICAgICAgICBza2lwOiAwLFxuICAgICAgICAgIGxpbWl0OiAxMlxuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5zZWFyY2hVc2VyID0gcmVzLmRhdGE7XG4gICAgICB9KVxuICAgICAgLnRoZW4odW5kZWZpbmVkLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgJHNjb3BlLnN1Y2Nlc3MgPSBmYWxzZTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgJHNjb3BlLnNlYXJjaFVzZXIgPSBbXTtcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJQbGVhc2UgZW50ZXIgQXJ0aXN0IHVybC5cIik7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICRzY29wZS5zdWNjZXNzID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5zZWFyY2hVc2VyID0gW107XG4gICAgICAgICQuWmVicmFfRGlhbG9nKFwiRGlkIG5vdCBmaW5kIHVzZXIuXCIpO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUuaGVsbG8gPSBmdW5jdGlvbihvYmopIHtcbiAgICAkc3RhdGUuZ28oJ3JlRm9yUmVJbnRlcmFjdGlvbicsIG9iaik7XG4gIH1cblxuICAkc2NvcGUuc2VhcmNoQ3VycmVudFRyYWRlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNUcmFkZXMgPSBbXTtcbiAgICAkc2NvcGUuY3VycmVudFRyYWRlcyA9IFtdO1xuICAgIGFuZ3VsYXIuZm9yRWFjaCgkc2NvcGUuY3VycmVudFRyYWRlc0NvcHksIGZ1bmN0aW9uKHRyYWRlKSB7XG4gICAgICBpZiAoJHNjb3BlLnNlYXJjaFVSTCAhPSBcIlwiKSB7XG4gICAgICAgIHZhciB1cmwgPSAkc2NvcGUuc2VhcmNoVVJMO1xuICAgICAgICB1cmwgPSB1cmwudG9TdHJpbmcoKS5yZXBsYWNlKCdodHRwOi8vJywgJycpLnJlcGxhY2UoJ2h0dHBzOi8vJywgJycpO1xuICAgICAgICBpZiAoKHRyYWRlLm90aGVyLnVzZXIuc291bmRjbG91ZC5wZXJtYWxpbmtVUkwuaW5kZXhPZih1cmwpICE9IC0xKSkge1xuICAgICAgICAgIGNUcmFkZXMucHVzaCh0cmFkZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAocGFyc2VJbnQoJHNjb3BlLm1heE1hbmFnZVRyYWRlZm9sbG93ZXJzKSA+IDApIHtcbiAgICAgICAgaWYgKHRyYWRlLm90aGVyLnVzZXIuc291bmRjbG91ZC5mb2xsb3dlcnMgPj0gJHNjb3BlLm1pbk1hbmFnZVRyYWRlZm9sbG93ZXJzICYmIHRyYWRlLm90aGVyLnVzZXIuc291bmRjbG91ZC5mb2xsb3dlcnMgPD0gJHNjb3BlLm1heE1hbmFnZVRyYWRlZm9sbG93ZXJzKSB7XG4gICAgICAgICAgY1RyYWRlcy5wdXNoKHRyYWRlKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0pO1xuICAgICRzY29wZS5jdXJyZW50VHJhZGVzID0gY1RyYWRlcztcbiAgICAkc2NvcGUuJGFwcGx5KCk7XG4gIH1cblxuICAkc2NvcGUudHJhZGVUeXBlID0ge1xuICAgIFJlcXVlc3RzOiB0cnVlLFxuICAgIFJlcXVlc3RlZDogdHJ1ZSxcbiAgICBUcmFkZVBhcnRuZXJzOiB0cnVlXG4gIH07XG5cbiAgJHNjb3BlLmZpbHRlckJ5VHJhZGVUeXBlID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgIHZhciB0cmFkZVR5cGUgPSAkc2NvcGUudHJhZGVUeXBlO1xuICAgIHRyYWRlVHlwZSA9IEpTT04uc3RyaW5naWZ5KHRyYWRlVHlwZSk7XG4gICAgJGh0dHAuZ2V0KCcvYXBpL3RyYWRlcy93aXRoVXNlci8nICsgJHNjb3BlLnVzZXIuX2lkICsgJz90cmFkZVR5cGU9JyArIHRyYWRlVHlwZSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICB2YXIgdHJhZGVzID0gcmVzLmRhdGE7XG4gICAgICAgICRzY29wZS5jdXJyZW50VHJhZGVzID0gW107XG4gICAgICAgIHRyYWRlcy5mb3JFYWNoKGZ1bmN0aW9uKHRyYWRlKSB7XG4gICAgICAgICAgdHJhZGUub3RoZXIgPSAodHJhZGUucDEudXNlci5faWQgPT0gJHNjb3BlLnVzZXIuX2lkKSA/IHRyYWRlLnAyIDogdHJhZGUucDE7XG4gICAgICAgICAgdHJhZGUudXNlciA9ICh0cmFkZS5wMS51c2VyLl9pZCA9PSAkc2NvcGUudXNlci5faWQpID8gdHJhZGUucDEgOiB0cmFkZS5wMjtcbiAgICAgICAgfSk7XG4gICAgICAgICRzY29wZS5jdXJyZW50VHJhZGVzID0gdHJhZGVzO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSlcbiAgfVxuICAkc2NvcGUuc29ydFJlc3VsdCA9IGZ1bmN0aW9uKHNvcnRieSkge1xuICAgICRzY29wZS5zb3J0YnkgPSBzb3J0Ynk7XG4gICAgdmFyIHNvcnRfb3JkZXIgPSAkc2NvcGUuc29ydF9vcmRlcjtcbiAgICBpZiAoc29ydGJ5ID09IFwiRm9sbG93ZXJzXCIpIHtcbiAgICAgIGlmIChzb3J0X29yZGVyID09IFwiYXNjZW5kaW5nXCIpIHtcbiAgICAgICAgJHNjb3BlLmN1cnJlbnRUcmFkZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgcmV0dXJuIGIub3RoZXIudXNlci5zb3VuZGNsb3VkLmZvbGxvd2VycyAtIGEub3RoZXIudXNlci5zb3VuZGNsb3VkLmZvbGxvd2VycztcbiAgICAgICAgfSlcbiAgICAgICAgJHNjb3BlLnNvcnRfb3JkZXIgPSBcImRlc2NlbmRpbmdcIjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgICRzY29wZS5jdXJyZW50VHJhZGVzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgIHJldHVybiBhLm90aGVyLnVzZXIuc291bmRjbG91ZC5mb2xsb3dlcnMgLSBiLm90aGVyLnVzZXIuc291bmRjbG91ZC5mb2xsb3dlcnM7XG4gICAgICAgIH0pXG4gICAgICAgICRzY29wZS5zb3J0X29yZGVyID0gXCJhc2NlbmRpbmdcIjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHNvcnRieSA9PSBcIlVuZmlsbGVkIFNsb3RzXCIpIHtcbiAgICAgIGlmIChzb3J0X29yZGVyID09IFwiYXNjZW5kaW5nXCIpIHtcbiAgICAgICAgJHNjb3BlLmN1cnJlbnRUcmFkZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgcmV0dXJuIGIudW5maWxsZWRUcmFja0NvdW50IC0gYS51bmZpbGxlZFRyYWNrQ291bnQ7XG4gICAgICAgIH0pXG4gICAgICAgICRzY29wZS5zb3J0X29yZGVyID0gXCJkZXNjZW5kaW5nXCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkc2NvcGUuY3VycmVudFRyYWRlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgICByZXR1cm4gYS51bmZpbGxlZFRyYWNrQ291bnQgLSBiLnVuZmlsbGVkVHJhY2tDb3VudDtcbiAgICAgICAgfSlcbiAgICAgICAgJHNjb3BlLnNvcnRfb3JkZXIgPSBcImFzY2VuZGluZ1wiO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpZiAoc29ydF9vcmRlciA9PSBcImFzY2VuZGluZ1wiKSB7XG4gICAgICAgICRzY29wZS5jdXJyZW50VHJhZGVzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgIHJldHVybiBhLm90aGVyLmFsZXJ0LnRvTG93ZXJDYXNlKCkgPCBiLm90aGVyLmFsZXJ0LnRvTG93ZXJDYXNlKCk7XG4gICAgICAgIH0pO1xuICAgICAgICAkc2NvcGUuc29ydF9vcmRlciA9IFwiZGVzY2VuZGluZ1wiO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJHNjb3BlLmN1cnJlbnRUcmFkZXMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgcmV0dXJuIGEub3RoZXIuYWxlcnQudG9Mb3dlckNhc2UoKSA+IGIub3RoZXIuYWxlcnQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgfSk7XG4gICAgICAgICRzY29wZS5zb3J0X29yZGVyID0gXCJhc2NlbmRpbmdcIjtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAkc2NvcGUuJG9uKCdsb2FkVHJhZGVzJywgZnVuY3Rpb24oZSkge1xuICAgICRzY29wZS5sb2FkTW9yZSgpO1xuICB9KTtcblxuXG4gICRzY29wZS5sb2FkTW9yZSA9IGZ1bmN0aW9uKCkge1xuICAgIHNlYXJjaFRyYWRlUmFuZ2Uuc2tpcCArPSAxMjtcbiAgICBzZWFyY2hUcmFkZVJhbmdlLmxpbWl0ID0gMTI7XG4gICAgJGh0dHAucG9zdCgnL2FwaS91c2Vycy9ieVNDVVJMLycsIHtcbiAgICAgICAgdXJsOiAkc2NvcGUuc2VhcmNoVVJMLFxuICAgICAgICBtaW5Gb2xsb3dlcjogJHNjb3BlLm1pblNlYXJjaFRyYWRlZm9sbG93ZXJzLFxuICAgICAgICBtYXhGb2xsb3dlcjogJHNjb3BlLm1heFNlYXJjaFRyYWRlZm9sbG93ZXJzLFxuICAgICAgICByZWNvcmRSYW5nZTogc2VhcmNoVHJhZGVSYW5nZVxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICBpZiAocmVzLmRhdGEubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGFuZ3VsYXIuZm9yRWFjaChyZXMuZGF0YSwgZnVuY3Rpb24oZCkge1xuICAgICAgICAgICAgJHNjb3BlLnNlYXJjaFVzZXIucHVzaChkKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSlcbiAgICAgIC50aGVuKHVuZGVmaW5lZCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICRzY29wZS5zdWNjZXNzID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5zZWFyY2hVc2VyID0gW107XG4gICAgICAgICQuWmVicmFfRGlhbG9nKFwiUGxlYXNlIGVudGVyIEFydGlzdCB1cmwuXCIpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAkc2NvcGUuc3VjY2VzcyA9IGZhbHNlO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAkc2NvcGUuc2VhcmNoVXNlciA9IFtdO1xuICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkRpZCBub3QgZmluZCB1c2VyLlwiKTtcbiAgICAgIH0pO1xuICB9O1xuXG4gICRzY29wZS5vcGVuVHJhZGUgPSBmdW5jdGlvbih1c2VyKSB7XG4gICAgdmFyIHRyYWRlID0ge1xuICAgICAgbWVzc2FnZXM6IFt7XG4gICAgICAgIGRhdGU6IG5ldyBEYXRlKCksXG4gICAgICAgIHNlbmRlcklkOiBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkuX2lkLFxuICAgICAgICB0ZXh0OiBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkuc291bmRjbG91ZC51c2VybmFtZSArICcgb3BlbmVkIGEgdHJhZGUuJyxcbiAgICAgICAgdHlwZTogJ2FsZXJ0J1xuICAgICAgfV0sXG4gICAgICB0cmFkZVR5cGU6ICdvbmUtdGltZScsXG4gICAgICBwMToge1xuICAgICAgICB1c2VyOiBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkuX2lkLFxuICAgICAgICBhbGVydDogXCJub25lXCIsXG4gICAgICAgIHNsb3RzOiBbXSxcbiAgICAgICAgYWNjZXB0ZWQ6IGZhbHNlXG4gICAgICB9LFxuICAgICAgcDI6IHtcbiAgICAgICAgdXNlcjogdXNlci5faWQsXG4gICAgICAgIGFsZXJ0OiBcImNoYW5nZVwiLFxuICAgICAgICBzbG90czogW10sXG4gICAgICAgIGFjY2VwdGVkOiBmYWxzZVxuICAgICAgfVxuICAgIH1cbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAucG9zdCgnL2FwaS90cmFkZXMvbmV3JywgdHJhZGUpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgJHN0YXRlLmdvKCdyZUZvclJlSW50ZXJhY3Rpb24nLCB7XG4gICAgICAgICAgdHJhZGVJRDogcmVzLmRhdGEuX2lkXG4gICAgICAgIH0pXG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICQuWmVicmFfRGlhbG9nKFwiRXJyb3IgaW4gY3JlYXRpbmcgdHJhZGVcIik7XG4gICAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5kZWxldGVUcmFkZSA9IGZ1bmN0aW9uKHRyYWRlSUQsIGluZGV4KSB7XG4gICAgJC5aZWJyYV9EaWFsb2coJ0FyZSB5b3Ugc3VyZT8gWW91IHdhbnQgdG8gZGVsZXRlIHRoaXMgdHJhZGUuJywge1xuICAgICAgJ3R5cGUnOiAnY29uZmlybWF0aW9uJyxcbiAgICAgICdidXR0b25zJzogW3tcbiAgICAgICAgY2FwdGlvbjogJ1llcycsXG4gICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAgICAgJGh0dHAucG9zdCgnL2FwaS90cmFkZXMvZGVsZXRlJywge1xuICAgICAgICAgICAgICBpZDogdHJhZGVJRFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAkc2NvcGUuY3VycmVudFRyYWRlcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAkLlplYnJhX0RpYWxvZygnRXJyb3IgYWNjZXB0aW5nJyk7XG4gICAgICAgICAgICB9KVxuICAgICAgICB9XG4gICAgICB9LCB7XG4gICAgICAgIGNhcHRpb246ICdObycsXG4gICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZygnTm8gd2FzIGNsaWNrZWQnKTtcbiAgICAgICAgfVxuICAgICAgfV1cbiAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5jaGVja05vdGlmaWNhdGlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIGFuZ3VsYXIuZm9yRWFjaChjdXJyZW50VHJhZGVzLCBmdW5jdGlvbih0cmFkZSkge1xuICAgICAgaWYgKHRyYWRlLnAxLnVzZXIuX2lkID09ICRzY29wZS51c2VyLl9pZCkge1xuICAgICAgICBpZiAodHJhZGUucDEuYWxlcnQgPT0gXCJjaGFuZ2VcIikge1xuICAgICAgICAgICRzY29wZS4kcGFyZW50LnNob3dub3RpZmljYXRpb24gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZiAodHJhZGUucDIudXNlci5faWQgPT0gJHNjb3BlLnVzZXIuX2lkKSB7XG4gICAgICAgIGlmICh0cmFkZS5wMi5hbGVydCA9PSBcImNoYW5nZVwiKSB7XG4gICAgICAgICAgJHNjb3BlLiRwYXJlbnQuc2hvd25vdGlmaWNhdGlvbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuICAkc2NvcGUuc2V0Q3VycmVudFRhYiA9IGZ1bmN0aW9uKGN1cnJlbnRUYWIpIHtcbiAgICAkc2NvcGUuY3VycmVudFRhYiA9IGN1cnJlbnRUYWI7XG4gIH1cbiAgJHNjb3BlLm9wZW5IZWxwTW9kYWwgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLmN1cnJlbnRUYWIgPT0gJ1NlYXJjaFRyYWRlJykge1xuICAgICAgdmFyIGRpc3BsYXlUZXh0ID0gXCI8c3BhbiBzdHlsZT0nZm9udC13ZWlnaHQ6Ym9sZCc+U2VhcmNoIFRyYWRlOjwvc3Bhbj4gSGVyZSB5b3Ugd2lsbCBiZSBhYmxlIHRvIGZpbmQgcGVvcGxlIHRvIHRyYWRlIHJlcG9zdHMgd2l0aC4gQnkgZW50ZXJpbmcgYSBTb3VuZENsb3VkIFVzZXLigJlzIFVSTCBpbnRvIHRoZSBTZWFyY2gsIHlvdSB3aWxsIGZpbmQgdGhhdCB1c2VyIGFuZCB0aGVuIGJlIGFibGUgdG8gaW5pdGlhdGUgYSB0cmFkZSB3aXRoIHRoYXQgdXNlci48YnIvPjxici8+QnkgY2xpY2tpbmcgb3BlbiB0cmFkZSwgeW91IHdpbGwgYmUgbGVkIHRvIG91ciByZXBvc3QgZm9yIHJlcG9zdCBpbnRlcmZhY2UuPGJyLz48YnIvPjxhIHN0eWxlPSd0ZXh0LWFsaWduOmNlbnRlcjsgbWFyZ2luOjAgYXV0bzsnIGhyZWY9J21haWx0bzpjb2F5c2N1ZUBhcnRpc3RzdW5saW1pdGVkLmNvP3N1YmplY3Q9QXJ0aXN0cyBVbmxpbWl0ZWQgSGVscCcgdGFyZ2V0PSdfdG9wJz5FbWFpbCBUZWNoIFN1cHBvcnQ8L2E+XCI7XG4gICAgfSBlbHNlIGlmICgkc2NvcGUuY3VycmVudFRhYiA9PSAnTWFuYWdlVHJhZGUnKSB7XG4gICAgICB2YXIgZGlzcGxheVRleHQgPSBcIjxzcGFuIHN0eWxlPSdmb250LXdlaWdodDpib2xkJz5NYW5hZ2UgVHJhZGU6PC9zcGFuPiBIZXJlIHlvdSB3aWxsIGJlIGFibGUgdG8gZmluZCB0aGUgdXNlcnMgeW91IGhhdmUgYWxyZWFkeSBpbml0aWF0ZWQgdHJhZGVzIHdpdGggaW4gdGhlIHBhc3QsIG9yIHBlb3BsZSB3aG8gaGF2ZSBpbml0aWF0ZWQgYSB0cmFkZSB3aXRoIHlvdS4gQnkgaG92ZXJpbmcgb3ZlciB1c2Vy4oCZcyBpY29uLCB5b3Ugd2lsbCBiZSBhYmxlIHRvIGVudGVyIGludG8geW91ciB0cmFkZSBvciBkZWxldGUgdGhlIHRyYWRlIHdpdGggdGhhdCBnaXZlbiB1c2VyLjxici8+PGJyLz5CeSBjbGlja2luZyBtYW5hZ2Ugd2hpbGUgaG92ZXJpbmcgb3ZlciBhIHVzZXLigJlzIGljb24sIHRoZSByZXBvc3QgZm9yIHJlcG9zdCBpbnRlcmZhY2Ugd2lsbCBvcGVuLjxici8+PGJyLz48YSBzdHlsZT0ndGV4dC1hbGlnbjpjZW50ZXI7IG1hcmdpbjowIGF1dG87JyBocmVmPSdtYWlsdG86Y29heXNjdWVAYXJ0aXN0c3VubGltaXRlZC5jbz9zdWJqZWN0PUFydGlzdHMgVW5saW1pdGVkIEhlbHAnIHRhcmdldD0nX3RvcCc+RW1haWwgVGVjaCBTdXBwb3J0PC9hPlwiO1xuICAgIH1cblxuICAgICQuWmVicmFfRGlhbG9nKGRpc3BsYXlUZXh0LCB7XG4gICAgICB3aWR0aDogNjAwXG4gICAgfSk7XG4gIH1cbiAgJHNjb3BlLnZlcmlmeUJyb3dzZXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAobmF2aWdhdG9yLnVzZXJBZ2VudC5zZWFyY2goXCJDaHJvbWVcIikgPT0gLTEgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudC5zZWFyY2goXCJTYWZhcmlcIikgIT0gLTEpIHtcbiAgICAgIHZhciBwb3NpdGlvbiA9IG5hdmlnYXRvci51c2VyQWdlbnQuc2VhcmNoKFwiVmVyc2lvblwiKSArIDg7XG4gICAgICB2YXIgZW5kID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5zZWFyY2goXCIgU2FmYXJpXCIpO1xuICAgICAgdmFyIHZlcnNpb24gPSBuYXZpZ2F0b3IudXNlckFnZW50LnN1YnN0cmluZyhwb3NpdGlvbiwgZW5kKTtcbiAgICAgIGlmIChwYXJzZUludCh2ZXJzaW9uKSA8IDkpIHtcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coJ1lvdSBoYXZlIG9sZCB2ZXJzaW9uIG9mIHNhZmFyaS4gQ2xpY2sgPGEgaHJlZj1cImh0dHBzOi8vc3VwcG9ydC5hcHBsZS5jb20vZG93bmxvYWRzL3NhZmFyaVwiPmhlcmU8L2E+IHRvIGRvd25sb2FkIHRoZSBsYXRlc3QgdmVyc2lvbiBvZiBzYWZhcmkgZm9yIGJldHRlciBzaXRlIGV4cGVyaWVuY2UuJywge1xuICAgICAgICAgICd0eXBlJzogJ2NvbmZpcm1hdGlvbicsXG4gICAgICAgICAgJ2J1dHRvbnMnOiBbe1xuICAgICAgICAgICAgY2FwdGlvbjogJ09LJ1xuICAgICAgICAgIH1dLFxuICAgICAgICAgICdvbkNsb3NlJzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcImh0dHBzOi8vc3VwcG9ydC5hcHBsZS5jb20vZG93bmxvYWRzL3NhZmFyaVwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfVxuICB9XG4gICRzY29wZS52ZXJpZnlCcm93c2VyKCk7XG4gICRzY29wZS5jaGVja05vdGlmaWNhdGlvbigpO1xuICAkc2NvcGUuc29ydFJlc3VsdCgkc2NvcGUuc29ydGJ5KTtcbn0pOyIsImFwcC5mYWN0b3J5KCdCcm9hZGNhc3RGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHApe1xuXHRyZXR1cm4ge1x0XHRcblx0XHRzdWJtaXRGYWNlYm9va1VzZXJQb3N0OiBmdW5jdGlvbihwb3N0SUQsIGRhdGEpe1xuXHRcdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvYnJvYWRjYXN0LycgKyBwb3N0SUQgKyAnL2ZhY2Vib29rdXNlcicsIGRhdGEpO1xuXHRcdH0sXG5cdFx0c3VibWl0RmFjZWJvb2tQYWdlUG9zdDogZnVuY3Rpb24ocG9zdElELCBkYXRhKXtcblx0XHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2Jyb2FkY2FzdC8nICsgcG9zdElEICsgJy9mYWNlYm9va3BhZ2UnLCBkYXRhKTtcblx0XHR9LFxuXHRcdHN1Ym1pdFR3aXR0ZXJQb3N0OiBmdW5jdGlvbihwb3N0SUQsIGRhdGEpe1xuXHRcdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvYnJvYWRjYXN0LycgKyBwb3N0SUQgKyAnL3R3aXR0ZXInLCBkYXRhKTtcblx0XHR9LFxuXHRcdHN1Ym1pdFlvdVR1YmVQb3N0OiBmdW5jdGlvbihwb3N0SUQsIGRhdGEpe1xuXHRcdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvYnJvYWRjYXN0LycgKyBwb3N0SUQgKyAnL3lvdXR1YmUnLGRhdGEpO1xuXHRcdH0sXG5cdFx0c3VibWl0U291bmRDbG91ZFBvc3Q6IGZ1bmN0aW9uKHBvc3RJRCwgZGF0YSl7XG5cdFx0XHRyZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9icm9hZGNhc3QvJyArIHBvc3RJRCArICcvc291bmRjbG91ZCcsZGF0YSk7XG5cdFx0fSxcblx0XHRzdWJtaXRJbnN0YWdyYW1Qb3N0OiBmdW5jdGlvbihwb3N0SUQsIGRhdGEpe1xuXHRcdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvYnJvYWRjYXN0LycgKyBwb3N0SUQgKyAnL2luc3RhZ3JhbScsZGF0YSk7XG5cdFx0fVxuXHR9O1xufSk7IiwiYXBwLmZhY3RvcnkoJ1N0b3JhZ2VGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHApe1xuXHRyZXR1cm4ge1xuXHRcdHVwbG9hZEZpbGU6IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHRcdHZhciBmZCA9IG5ldyBGb3JtRGF0YSgpO1xuXHRcdFx0ZmQuYXBwZW5kKCdmaWxlJywgZGF0YSk7XG5cdFx0XHRyZXR1cm4gJGh0dHAoe1xuXHRcdFx0XHRtZXRob2Q6ICdQT1NUJyxcblx0XHRcdFx0dXJsOiAnL2FwaS9hd3MnLFxuXHRcdFx0XHRoZWFkZXJzOiB7J0NvbnRlbnQtVHlwZSc6IHVuZGVmaW5lZCB9LFxuXHRcdFx0XHR0cmFuZm9ybVJlcXVlc3Q6IGFuZ3VsYXIuaWRlbnRpZnksXG5cdFx0XHRcdGRhdGE6IGZkXG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKXtcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdFxuXHRcdGFkZFBvc3Q6IGZ1bmN0aW9uKGRhdGEpe1xuXHRcdFx0cmV0dXJuICRodHRwKHtcblx0XHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHRcdHVybDogJy9hcGkvcG9zdHMnLFxuXHRcdFx0XHRkYXRhOiBkYXRhXG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKXtcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHR9KTtcblx0XHR9LFxuXG5cdFx0dXBkYXRlUG9zdDogZnVuY3Rpb24ocG9zdCl7XG5cdFx0XHRyZXR1cm4gJGh0dHAoe1xuXHRcdFx0XHRtZXRob2Q6ICdQVVQnLFxuXHRcdFx0XHR1cmw6ICcvYXBpL3Bvc3RzLycgKyBwb3N0Ll9pZCxcblx0XHRcdFx0ZGF0YToge2VkaXRlZFBvc3Q6IHBvc3R9XG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKXtcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdHVwZGF0ZVJlbGVhc2VTdGF0dXM6IGZ1bmN0aW9uKHBvc3Qpe1xuXHRcdFx0cmV0dXJuICRodHRwKHtcblx0XHRcdFx0bWV0aG9kOiAnUFVUJyxcblx0XHRcdFx0dXJsOiAnL2FwaS9wb3N0cy8nICsgcG9zdC5faWQgKycvc3RhdHVzJ1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSl7XG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdGZldGNoQWxsOiBmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuICRodHRwKHtcblx0XHRcdFx0bWV0aG9kOiAnR0VUJyxcblx0XHRcdFx0dXJsOiAnL2FwaS9wb3N0cydcblx0XHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVzcG9uc2Upe1xuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cbiAgICBcdGdldFBvc3RGb3JFZGl0OiBmdW5jdGlvbihwb3N0KXtcbiBcdFx0XHRyZXR1cm4gJGh0dHAoe1xuXHRcdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdFx0XHR1cmw6ICcvYXBpL3Bvc3RzLycgKyBwb3N0LmlkXG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKXtcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHR9KTtcblx0XHR9LFxuXHRcdGRlbGV0ZVBvc3Q6IGZ1bmN0aW9uKHBvc3RJRCl7XG5cdFx0XHRyZXR1cm4gJGh0dHAoe1xuXHRcdFx0XHRtZXRob2Q6ICdERUxFVEUnLFxuXHRcdFx0XHR1cmw6ICcvYXBpL3Bvc3RzLycgKyBwb3N0SURcblx0XHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVzcG9uc2Upe1xuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdH0pO1xuXHRcdH0sXG5cblx0XHRkZWxldGVTaW5nbGVGaWxlOiBmdW5jdGlvbihrZXlOYW1lKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHAoe1xuXHRcdFx0XHRtZXRob2Q6ICdERUxFVEUnLFxuXHRcdFx0XHR1cmw6ICcvYXBpL2F3cy8nICsga2V5TmFtZVxuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSl7XG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdGRlbGV0ZUJvdGhGaWxlczogZnVuY3Rpb24ocG9zdElEKXtcblx0XHRcdHJldHVybiAkaHR0cCh7XG5cdFx0XHRcdG1ldGhvZDogJ0RFTEVURScsXG5cdFx0XHRcdHVybDogJy9hcGkvYXdzLycgKyBwb3N0SUQgKyAnL2JvdGgnXG5cdFx0XHR9KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKXtcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XG5cdFx0XHR9KTtcblx0XHR9LFxuXG5cdFx0YnJvYWRjYXN0UG9zdDogZnVuY3Rpb24ocG9zdElEKXtcblx0XHRcdHJldHVybiAkaHR0cCh7XG5cdFx0XHRcdG1ldGhvZDogJ0dFVCcsXG5cdFx0XHRcdHVybDogJy9hcGkvcG9zdHMvJyArIHBvc3RJRCArICcvYnJvYWRjYXN0J1xuXHRcdFx0fSlcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSl7XG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xuXHRcdFx0fSk7XG5cdFx0fSxcblxuXHRcdHZhbGlkYXRlVG9rZW46ZnVuY3Rpb24odXNlcklELHBsYXRmb3JtKVxuXHRcdHtcdFx0XG4gICAgICAgICAgICByZXR1cm4gJGh0dHAoe1xuXHRcdFx0XHRtZXRob2Q6ICdHRVQnLFxuXHRcdFx0XHR1cmw6ICcvYXBpL3Bvc3RzL2NoZWNrVG9rZW5WYWxpZGl0eS8nICsgdXNlcklEICsnLycgKyBwbGF0Zm9ybSBcblx0XHRcdH0pXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVzcG9uc2Upe1xuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgLnN0YXRlKCdyZWxlYXNlcicsIHtcbiAgICB1cmw6ICcvYXJ0aXN0VG9vbHMvcmVsZWFzZXInLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvYXJ0aXN0VG9vbHMvcmVsZWFzZXIvcmVsZWFzZUxpc3QuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ1JlbGVhc2VyQ29udHJvbGxlcicsXG4gICAgcmVzb2x2ZToge1xuICAgICAgcG9zdHM6IGZ1bmN0aW9uKCl7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICAgIH1cbiAgICB9XG4gIH0pXG4gIC5zdGF0ZSgncmVsZWFzZXJOZXcnLCB7XG4gICAgdXJsOiAnL2FydGlzdFRvb2xzL3JlbGVhc2VyL25ldycsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9hcnRpc3RUb29scy9yZWxlYXNlci9yZWxlYXNlci5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnUmVsZWFzZXJDb250cm9sbGVyJyxcbiAgICByZXNvbHZlOiB7XG4gICAgICBwb3N0czogZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgfVxuICAgIH1cbiAgfSlcbiAgLnN0YXRlKCdyZWxlYXNlckVkaXQnLCB7XG4gICAgICB1cmw6ICcvYXJ0aXN0VG9vbHMvcmVsZWFzZXIvZWRpdC86cmVsZWFzZUlEJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvYXJ0aXN0VG9vbHMvcmVsZWFzZXIvcmVsZWFzZXIuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnUmVsZWFzZXJDb250cm9sbGVyJyxcbiAgICAgIHJlc29sdmU6IHtcbiAgICAgICAgICBwb3N0czogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICB9XG4gICAgICB9XG4gIH0pXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ1JlbGVhc2VyQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSwgcG9zdHMsIFN0b3JhZ2VGYWN0b3J5LCBCcm9hZGNhc3RGYWN0b3J5LCAkc3RhdGUsIFNlc3Npb25TZXJ2aWNlLCRzdGF0ZVBhcmFtcywkd2luZG93KSB7XG4gICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xuICBpZighJHNjb3BlLnVzZXIpe1xuICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgZGF0ZSA9IG5ldyBEYXRlKCk7XG4gICRzY29wZS5jdXJyZW50RGF0ZSA9IGRhdGUudG9JU09TdHJpbmcoKS5zbGljZSgwLCAxMCkucmVwbGFjZSgvLS9nLCBcIi1cIik7XG4gIGZ1bmN0aW9uIGdldERheUNsYXNzKGRhdGEpIHtcbiAgICB2YXIgZGF0ZSA9IGRhdGEuZGF0ZSxcbiAgICBtb2RlID0gZGF0YS5tb2RlO1xuICAgIGlmIChtb2RlID09PSAnZGF5Jykge1xuICAgICAgdmFyIGRheVRvQ2hlY2sgPSBuZXcgRGF0ZShkYXRlKS5zZXRIb3VycygwLDAsMCwwKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJHNjb3BlLmV2ZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgY3VycmVudERheSA9IG5ldyBEYXRlKCRzY29wZS5ldmVudHNbaV0uZGF0ZSkuc2V0SG91cnMoMCwwLDAsMCk7XG4gICAgICAgIGlmIChkYXlUb0NoZWNrID09PSBjdXJyZW50RGF5KSB7XG4gICAgICAgICAgcmV0dXJuICRzY29wZS5ldmVudHNbaV0uc3RhdHVzO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiAnJztcbiAgfVxuXG4gICRzY29wZS5pbmxpbmVPcHRpb25zID0ge1xuICAgIGN1c3RvbUNsYXNzOiBnZXREYXlDbGFzcyxcbiAgICBzaG93V2Vla3M6IHRydWVcbiAgfTtcblxuICAkc2NvcGUuZGF0ZU9wdGlvbnMgPSB7XG4gICAgc3RhcnRpbmdEYXk6IDFcbiAgfTtcblxuICAkc2NvcGUub3BlbjEgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucG9wdXAxLm9wZW5lZCA9IHRydWU7XG4gIH07XG5cbiAgJHNjb3BlLnBvcHVwMSA9IHtcbiAgICBvcGVuZWQ6IGZhbHNlXG4gIH07XG5cbiAgJHNjb3BlLnBvc3REYXRhID0ge307XG4gICRzY29wZS5hdWRpbyA9IHt9O1xuICAkc2NvcGUudmlkZW8gPSB7fTtcbiAgJHNjb3BlLmltYWdlID0ge307XG4gIHZhciBvbGRQb3N0RGF0YSA9IHt9O1xuICAkc2NvcGUucG9zdHMgPSBwb3N0cztcbiAgXG4gIHZhciBhdWRpb1NlbGVjdGlvbkNoYW5nZWQgPSBmdW5jdGlvbigpe1xuICAgIGlmICgkc2NvcGUuYXVkaW8uZmlsZSkge1xuICAgICAgcmV0dXJuICRzY29wZS5hdWRpby5maWxlLm5hbWUgJiYgKG9sZFBvc3REYXRhLmF3c0F1ZGlvS2V5TmFtZSAhPT0gJHNjb3BlLmF1ZGlvLmZpbGUubmFtZSk7XG4gICAgfVxuICB9O1xuXG4gIHZhciB2aWRlb1NlbGVjdGlvbkNoYW5nZWQgPSBmdW5jdGlvbigpe1xuICAgIGlmICgkc2NvcGUudmlkZW8uZmlsZSkge1xuICAgICAgcmV0dXJuICRzY29wZS52aWRlby5maWxlLm5hbWUgJiYgKG9sZFBvc3REYXRhLmF3c1ZpZGVvS2V5TmFtZSAhPT0gJHNjb3BlLnZpZGVvLmZpbGUubmFtZSk7XG4gICAgfVxuICB9O1xuXG4gIHZhciBpbWFnZVNlbGVjdGlvbkNoYW5nZWQgPSBmdW5jdGlvbigpe1xuICAgIGlmICgkc2NvcGUuaW1hZ2UuZmlsZSkge1xuICAgICAgcmV0dXJuICRzY29wZS5pbWFnZS5maWxlLm5hbWUgJiYgKG9sZFBvc3REYXRhLmF3c0ltYWdlS2V5TmFtZSAhPT0gJHNjb3BlLmltYWdlLmZpbGUubmFtZSk7XG4gICAgfVxuICB9O1xuXG4gICRzY29wZS5zYXZlUG9zdCA9IGZ1bmN0aW9uKCl7XG4gICAgaWYgKCEkc2NvcGUucG9zdERhdGEuX2lkKSB7XG4gICAgICByZXR1cm4gYWRkUG9zdCgpO1xuICAgIH0gXG4gICAgLy8gYXVkaW8gLHZpZGVvIGFuZCBpbWFnZSBhcmUgYmVpbmcgY2hhbmdlZFxuICAgIGVsc2UgaWYgKGF1ZGlvU2VsZWN0aW9uQ2hhbmdlZCgpICYmIHZpZGVvU2VsZWN0aW9uQ2hhbmdlZCgpICYmIGltYWdlU2VsZWN0aW9uQ2hhbmdlZCgpKSB7XG4gICAgICByZXR1cm4gU3RvcmFnZUZhY3RvcnkuZGVsZXRlQm90aEZpbGVzKCRzY29wZS5wb3N0RGF0YS5faWQpXG4gICAgICAudGhlbihmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gU3RvcmFnZUZhY3RvcnkudXBsb2FkRmlsZSgkc2NvcGUuYXVkaW8uZmlsZSk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgJHNjb3BlLnBvc3REYXRhLmF3c0F1ZGlvS2V5TmFtZSA9IHJlcztcbiAgICAgICAgcmV0dXJuIFN0b3JhZ2VGYWN0b3J5LnVwbG9hZEZpbGUoJHNjb3BlLnZpZGVvLmZpbGUpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcyl7XG4gICAgICAgICRzY29wZS5wb3N0RGF0YS5hd3NWaWRlb0tleU5hbWUgPSByZXM7XG4gICAgICAgICByZXR1cm4gU3RvcmFnZUZhY3RvcnkudXBsb2FkRmlsZSgkc2NvcGUuaW1hZ2UuZmlsZSk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgJHNjb3BlLnBvc3REYXRhLmF3c0ltYWdlS2V5TmFtZSA9IHJlcztcbiAgICAgICAgcmV0dXJuIFN0b3JhZ2VGYWN0b3J5LnVwZGF0ZVBvc3QoJHNjb3BlLnBvc3REYXRhKTtcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbiAocG9zdCkge1xuICAgICAgICAkc3RhdGUucmVsb2FkKCk7XG4gICAgICB9KVxuICAgICAgLmNhdGNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgICAkLlplYnJhX0RpYWxvZyhlcnJvcix7XG4gICAgICAgICAgd2lkdGg6IDYwMFxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cbiAgICAvLyBvbmx5IGF1ZGlvIGlzIGJlaW5nIGNoYW5nZWRcbiAgICBlbHNlIGlmIChhdWRpb1NlbGVjdGlvbkNoYW5nZWQoKSkge1xuICAgICAgcmV0dXJuIFN0b3JhZ2VGYWN0b3J5LmRlbGV0ZVNpbmdsZUZpbGUob2xkUG9zdERhdGEuYXdzQXVkaW9LZXlOYW1lKVxuICAgICAgLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgcmV0dXJuIFN0b3JhZ2VGYWN0b3J5LnVwbG9hZEZpbGUoJHNjb3BlLmF1ZGlvLmZpbGUpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcyl7XG4gICAgICAgICRzY29wZS5wb3N0RGF0YS5hd3NBdWRpb0tleU5hbWUgPSByZXM7XG4gICAgICAgIHJldHVybiBTdG9yYWdlRmFjdG9yeS51cGRhdGVQb3N0KCRzY29wZS5wb3N0RGF0YSk7ICAgICAgICBcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICRzdGF0ZS5yZWxvYWQoKTtcbiAgICAgIH0pXG4gICAgICAuY2F0Y2goZnVuY3Rpb24gKGVycm9yKSB7XG4gICAgICAgICQuWmVicmFfRGlhbG9nKGVycm9yLHtcbiAgICAgICAgICB3aWR0aDogNjAwXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuICAgIC8vIG9ubHkgdmlkZW8gaXMgYmVpbmcgY2hhbmdlZFxuICAgIGVsc2UgaWYgKHZpZGVvU2VsZWN0aW9uQ2hhbmdlZCgpKSB7XG4gICAgICByZXR1cm4gU3RvcmFnZUZhY3RvcnkuZGVsZXRlU2luZ2xlRmlsZShvbGRQb3N0RGF0YS5hd3NWaWRlb0tleU5hbWUpXG4gICAgICAudGhlbihmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gU3RvcmFnZUZhY3RvcnkudXBsb2FkRmlsZSgkc2NvcGUudmlkZW8uZmlsZSk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgJHNjb3BlLnBvc3REYXRhLmF3c1ZpZGVvS2V5TmFtZSA9IHJlcztcbiAgICAgICAgcmV0dXJuIFN0b3JhZ2VGYWN0b3J5LnVwZGF0ZVBvc3QoJHNjb3BlLnBvc3REYXRhKTsgICAgICAgIFxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHN0YXRlLnJlbG9hZCgpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coZXJyb3Ise1xuICAgICAgICAgIHdpZHRoOiA2MDBcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgIC8vIG9ubHkgaW1hZ2UgaXMgYmVpbmcgY2hhbmdlZFxuICAgIGVsc2UgaWYgKGltYWdlU2VsZWN0aW9uQ2hhbmdlZCgpKSB7XG4gICAgICByZXR1cm4gU3RvcmFnZUZhY3RvcnkuZGVsZXRlU2luZ2xlRmlsZShvbGRQb3N0RGF0YS5hd3NJbWFnZUtleU5hbWUpXG4gICAgICAudGhlbihmdW5jdGlvbigpe1xuICAgICAgICByZXR1cm4gU3RvcmFnZUZhY3RvcnkudXBsb2FkRmlsZSgkc2NvcGUuaW1hZ2UuZmlsZSk7XG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgJHNjb3BlLnBvc3REYXRhLmF3c0ltYWdlS2V5TmFtZSA9IHJlcztcbiAgICAgICAgcmV0dXJuIFN0b3JhZ2VGYWN0b3J5LnVwZGF0ZVBvc3QoJHNjb3BlLnBvc3REYXRhKTsgICAgICAgIFxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHN0YXRlLnJlbG9hZCgpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coZXJyb3Ise1xuICAgICAgICAgIHdpZHRoOiA2MDBcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgLy8gbmVpdGhlciBhdWRpbyBub3IgdmlkZW8gaXMgY2hhbmdpbmdcbiAgICBlbHNlIHtcbiAgICAgIC8vIHZhciBlcnJNc2cgPSB2YWxpZGF0ZUZvcm0oKTtcbiAgICAgIC8vIGlmKGVyck1zZyA9PSBcIlwiKXtcbiAgICAgICAgcmV0dXJuIFN0b3JhZ2VGYWN0b3J5LnVwZGF0ZVBvc3QoJHNjb3BlLnBvc3REYXRhKSAgICAgICBcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHBvc3QpIHtcbiAgICAgICAgICAkc3RhdGUuZ28oJ3JlbGVhc2VyJyk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZyhlcnJvcix7XG4gICAgICAgICAgICB3aWR0aDogNjAwXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgLy8gfVxuICAgICAgLy8gZWxzZXtcbiAgICAgIC8vICAgJC5aZWJyYV9EaWFsb2coZXJyTXNnLHtcbiAgICAgIC8vICAgICB3aWR0aDogNjAwXG4gICAgICAvLyAgIH0pO1xuICAgICAgLy8gfVxuICAgIH1cbiAgfTtcblxuICB2YXIgYWRkUG9zdCA9IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGVyck1zZyA9IHZhbGlkYXRlRm9ybSgpO1xuICAgIGlmKGVyck1zZyA9PSBcIlwiKXtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICRzY29wZS5wb3N0RGF0YS51c2VySUQgPSAkc2NvcGUudXNlci5faWQ7XG4gICAgICBTdG9yYWdlRmFjdG9yeS51cGxvYWRGaWxlKCRzY29wZS5hdWRpby5maWxlKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKXsgIFxuICAgICAgICAkc2NvcGUucG9zdERhdGEuYXdzQXVkaW9LZXlOYW1lID0gcmVzLmtleTtcbiAgICAgICAgcmV0dXJuIFN0b3JhZ2VGYWN0b3J5LnVwbG9hZEZpbGUoJHNjb3BlLnZpZGVvLmZpbGUpOyAgICBcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpeyAgICAgIFxuICAgICAgICAkc2NvcGUucG9zdERhdGEuYXdzVmlkZW9LZXlOYW1lID0gcmVzLmtleTtcbiAgICAgICAgcmV0dXJuIFN0b3JhZ2VGYWN0b3J5LnVwbG9hZEZpbGUoJHNjb3BlLmltYWdlLmZpbGUpOyAgXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKXsgICAgXG4gICAgICAgICRzY29wZS5wb3N0RGF0YS5hd3NJbWFnZUtleU5hbWUgPSByZXMua2V5O1xuICAgICAgICByZXR1cm4gU3RvcmFnZUZhY3RvcnkuYWRkUG9zdCgkc2NvcGUucG9zdERhdGEpO1xuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgJHN0YXRlLmdvKCdyZWxlYXNlcicpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coZXJyb3Ise1xuICAgICAgICAgIHdpZHRoOiA2MDBcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICB9XG4gICAgZWxzZXtcbiAgICAgICQuWmVicmFfRGlhbG9nKGVyck1zZyx7XG4gICAgICAgIHdpZHRoOiA2MDBcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcblxuICB2YXIgdmFsaWRhdGVGb3JtID0gZnVuY3Rpb24oKXtcbiAgICB2YXIgaXNTQ1BhbmVsT3BlbiA9ICQoXCIjcG5sU291bmRDbG91ZFwiKS5oYXNDbGFzcyhcImluXCIpO1xuICAgIHZhciBpc0ZCUGFuZWxPcGVuID0gJChcIiNwbmxGYWNlYm9va1wiKS5oYXNDbGFzcyhcImluXCIpO1xuICAgIHZhciBpc1RXUGFuZWxPcGVuID0gJChcIiNwbmxUd2l0dGVyXCIpLmhhc0NsYXNzKFwiaW5cIik7XG4gICAgdmFyIGlzWVRQYW5lbE9wZW4gPSAkKFwiI3BubFlvdXR1YmVcIikuaGFzQ2xhc3MoXCJpblwiKTtcbiAgICB2YXIgbWVzc2FnZSA9IFwiXCI7XG4gICAgaWYoJHNjb3BlLnBvc3REYXRhLnBvc3RUaXRsZSA9PSB1bmRlZmluZWQpe1xuICAgICAgbWVzc2FnZSArPSBcIlBvc3QgdGl0bGUgaXMgcmVxdWlyZWQuIDxiciAvPlwiOyAgICAgICAgICBcbiAgICB9XG4gICAgaWYoJHNjb3BlLnBvc3REYXRhLnBvc3REYXRlID09IHVuZGVmaW5lZCl7XG4gICAgICBtZXNzYWdlICs9IFwiUG9zdCBkYXRlIGlzIHJlcXVpcmVkLiA8YnIgLz5cIjsgICAgICAgICAgXG4gICAgfVxuICAgIGlmKCFpc1NDUGFuZWxPcGVuICYmICFpc0ZCUGFuZWxPcGVuICYmICFpc1RXUGFuZWxPcGVuICYmICFpc1lUUGFuZWxPcGVuKXsgICAgICBcbiAgICAgIG1lc3NhZ2UgKz0gXCJQbGVhc2UgZW50ZXIgYXRsZWFzdCBvbmUgb2YgdGhlIHNvY2lhbCBzaXRlIHBvc3RpbmcgaW5mb3JtYXRpb24uIDxiciAvPlwiO1xuICAgIH1cbiAgICBlbHNlIHsgICAgICBcbiAgICAgIGlmKGlzU0NQYW5lbE9wZW4pe1xuICAgICAgICBpZigoJHNjb3BlLnBvc3REYXRhLmF3c0F1ZGlvS2V5TmFtZSA9PSB1bmRlZmluZWQgJiYgJHNjb3BlLmF1ZGlvLmZpbGUgPT0gdW5kZWZpbmVkKSB8fCAkc2NvcGUucG9zdERhdGEuc291bmRDbG91ZFRpdGxlID09IHVuZGVmaW5lZCB8fCAkc2NvcGUucG9zdERhdGEuc291bmRDbG91ZERlc2NyaXB0aW9uID09IHVuZGVmaW5lZCl7XG4gICAgICAgICAgbWVzc2FnZSArPSBcIkFsbCBTb3VuZGNsb3VkIHBvc3RpbmcgaW5mb3JtYXRpb25zIGFyZSByZXF1aXJlZC4gPGJyIC8+XCI7ICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZihpc0ZCUGFuZWxPcGVuKXtcbiAgICAgICAgaWYoJHNjb3BlLnBvc3REYXRhLmZhY2Vib29rUG9zdCA9PSB1bmRlZmluZWQgfHwgKCRzY29wZS5mYWNlYm9va0NvbW1lbnRPbiA9PSBcInBhZ2VcIiAmJiAkc2NvcGUuZmFjZWJvb2tQYWdlVXJsID09IHVuZGVmaW5lZCkpe1xuICAgICAgICAgIG1lc3NhZ2UgKz0gXCJBbGwgRmFjZWJvb2sgcG9zdGluZyBpbmZvcm1hdGlvbnMgYXJlIHJlcXVpcmVkLiA8YnIgLz5cIjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgaWYoaXNUV1BhbmVsT3Blbil7XG4gICAgICAgIGlmKCRzY29wZS5wb3N0RGF0YS50d2l0dGVyUG9zdCA9PSB1bmRlZmluZWQpe1xuICAgICAgICAgIG1lc3NhZ2UgKz0gXCJBbGwgVHdpdHRlciBwb3N0aW5nIGluZm9ybWF0aW9ucyBhcmUgcmVxdWlyZWQuIDxiciAvPlwiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBpZihpc1lUUGFuZWxPcGVuKXtcbiAgICAgICAgaWYoKCRzY29wZS5wb3N0RGF0YS5hd3NWaWRlb0tleU5hbWUgPT0gdW5kZWZpbmVkICYmICRzY29wZS52aWRlby5maWxlID09IHVuZGVmaW5lZCkgfHwgJHNjb3BlLnBvc3REYXRhLnlvdVR1YmVUaXRsZSA9PSB1bmRlZmluZWQgfHwgJHNjb3BlLnlvdVR1YmVEZXNjcmlwdGlvbiA9PSB1bmRlZmluZWQpe1xuICAgICAgICAgIG1lc3NhZ2UgKz0gXCJBbGwgWW91dHViZSBwb3N0aW5nIGluZm9ybWF0aW9ucyBhcmUgcmVxdWlyZWQuIDxiciAvPlwiO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBtZXNzYWdlO1xuICB9XG5cbiAgJHNjb3BlLmRlbGV0ZVBvc3QgPSBmdW5jdGlvbihpbmRleCkge1xuICAgIHZhciBwb3N0SWQgPSAkc2NvcGUucG9zdHNbaW5kZXhdLl9pZDtcbiAgICBTdG9yYWdlRmFjdG9yeS5kZWxldGVQb3N0KHBvc3RJZClcbiAgICAudGhlbihmdW5jdGlvbigpe1xuICAgICAgJHN0YXRlLnJlbG9hZCgpO1xuICAgIH0pXG4gICAgLmNhdGNoKGZ1bmN0aW9uIChlcnJvcikge1xuICAgICAgJC5aZWJyYV9EaWFsb2coZXJyb3Ise1xuICAgICAgICB3aWR0aDogNjAwXG4gICAgICB9KTtcbiAgICB9KTtcbiAgfTtcblxuICAkc2NvcGUuZWRpdFBvc3QgPSBmdW5jdGlvbihwb3N0KXtcbiAgICAkc2NvcGUucG9zdERhdGEgPSBwb3N0O1xuICAgIG9sZFBvc3REYXRhID0gcG9zdDtcbiAgfTtcblxuICAkc2NvcGUuZ2V0UG9zdCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wb3N0cz0gW107XG4gICAgU3RvcmFnZUZhY3RvcnkuZmV0Y2hBbGwoKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgJHNjb3BlLnBvc3RzID0gcmVzO1xuICAgIH0pXG4gIH1cblxuICAvKiBNZXRob2QgZm9yIGdldHRpbmcgcG9zdCBpbiBjYXNlIG9mIGVkaXQgKi9cbiAgJHNjb3BlLmdldFBvc3RJbmZvID0gZnVuY3Rpb24ocmVsZWFzZUlEKSB7XG4gICAgU3RvcmFnZUZhY3RvcnlcbiAgICAuZ2V0UG9zdEZvckVkaXQoe1xuICAgICAgaWQ6IHJlbGVhc2VJRFxuICAgIH0pXG4gICAgLnRoZW4oaGFuZGxlUmVzcG9uc2UpXG4gICAgLmNhdGNoKGhhbmRsZUVycm9yKTtcblxuICAgIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlcykge1xuICAgICAgJHNjb3BlLnBvc3REYXRhID0gcmVzOyAgICAgICAgICAgXG4gICAgfVxuICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKHJlcykge1xuICAgICAgXG4gICAgfVxuICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICB9O1xuICAkc2NvcGUuY2hlY2tJZkVkaXQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHN0YXRlUGFyYW1zLnJlbGVhc2VJRCkge1xuICAgICAgJHNjb3BlLmdldFBvc3RJbmZvKCRzdGF0ZVBhcmFtcy5yZWxlYXNlSUQpO1xuICAgIH1cbiAgfTtcbiAgJHNjb3BlLmJyb2FkY2FzdFBvc3QgPSBmdW5jdGlvbihwb3N0KXtcbiAgICB2YXIgaXNWYWxpZCA9IHRydWU7XG4gICAgdmFyIG1lc3NhZ2UgPSBcIkl0IHNlZW1zIHlvdSBkaWQgbm90IGF1dGhlbnRpY2F0ZSB0byB0aGUgc29jaWFsIHNpdGVzIGJlZm9yZSByZWxlYXNpbmcgdGhlIHBvc3QuIFdlIGRpZCBub3QgZm91bmQgZm9sbG93aW4gbWlzc2luZyB0b2tlbnMgLSA8YnIgLz5cIjtcbiAgICBpZihwb3N0LmZhY2Vib29rUG9zdCAhPSBcIlwiICYmICEkc2NvcGUudXNlci5mYWNlYm9vayAmJiAhJHNjb3BlLnVzZXIuZmFjZWJvb2sudG9rZW4pe1xuICAgICAgaXNWYWxpZCA9IGZhbHNlO1xuICAgICAgbWVzc2FnZSs9IFwiRmFjZWJvb2sgdG9rZW4gaXMgbWlzc2luZy4gPGJyIC8+XCI7XG4gICAgfVxuXG4gICAgaWYocG9zdC50d2l0dGVyUG9zdCAhPSBcIlwiICYmICEkc2NvcGUudXNlci50d2l0dGVyICYmICEkc2NvcGUudXNlci50d2l0dGVyLnRva2VuKXtcbiAgICAgIGlzVmFsaWQgPSBmYWxzZTtcbiAgICAgIG1lc3NhZ2UrPSBcIlR3aXR0ZXIgdG9rZW4gaXMgbWlzc2luZy4gPGJyIC8+XCI7XG4gICAgfVxuXG4gICAgaWYocG9zdC5hd3NWaWRlb0tleU5hbWUgIT0gXCJcIiAmJiAhJHNjb3BlLnVzZXIuZ29vZ2xlICYmICEkc2NvcGUudXNlci5nb29nbGUudG9rZW4pe1xuICAgICAgaXNWYWxpZCA9IGZhbHNlO1xuICAgICAgbWVzc2FnZSs9IFwiR29vZ2xlIHRva2VuIGlzIG1pc3NpbmcuIDxiciAvPlwiO1xuICAgIH1cbiAgICBtZXNzYWdlKz0gXCJQbGVhc2UgdXNlIHRoZSBsaW5rcyB0byBiZWxvdyBBZGQgTmV3IFBvc3QgYnV0dG9uIHRvIGdldCB0aGUgc29jaWFsIHNpdGUgYXV0aCB0b2tlbnMuXCI7XG5cbiAgICBpZihpc1ZhbGlkKXtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgIEJyb2FkY2FzdEZhY3RvcnlbcG9zdC5mYWNlYm9va1BhZ2VVcmwgPyAnc3VibWl0RmFjZWJvb2tQYWdlUG9zdCcgOiAnc3VibWl0RmFjZWJvb2tVc2VyUG9zdCddKHBvc3QuX2lkLCB7XG4gICAgICAgIHRva2VuOiAkc2NvcGUudXNlci5mYWNlYm9vay50b2tlbixcbiAgICAgICAgZmFjZWJvb2tVc2VyUG9zdCA6IHBvc3QuZmFjZWJvb2tQb3N0XG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICBpZiAoJHNjb3BlLnVzZXIudHdpdHRlci50b2tlbil7XG4gICAgICAgICAgQnJvYWRjYXN0RmFjdG9yeS5zdWJtaXRUd2l0dGVyUG9zdChwb3N0Ll9pZCwge1xuICAgICAgICAgIHRva2VuOiAkc2NvcGUudXNlci50d2l0dGVyLnRva2VuLCBcbiAgICAgICAgICB0b2tlblNlY3JldDogJHNjb3BlLnVzZXIudHdpdHRlci50b2tlblNlY3JldCwgXG4gICAgICAgICAgdHdpdHRlclBvc3Q6IHBvc3QudHdpdHRlclBvc3RcbiAgICAgICAgfSk7XG4gICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgIGlmICgkc2NvcGUudXNlci5nb29nbGUudG9rZW4pe1xuICAgICAgICAgIHJldHVybiBCcm9hZGNhc3RGYWN0b3J5LnN1Ym1pdFlvdVR1YmVQb3N0KHBvc3QuX2lkLCB7XG4gICAgICAgICAgICB0b2tlbjogJHNjb3BlLnVzZXIuZ29vZ2xlLnRva2VuLCBcbiAgICAgICAgICAgIGF3c1ZpZGVvS2V5TmFtZTogcG9zdC5hd3NWaWRlb0tleU5hbWVcbiAgICAgICAgICB9KTsgICAgICBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7ICBcbiAgICAgIH0pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpe1xuICAgICAgICByZXR1cm4gQnJvYWRjYXN0RmFjdG9yeS5zdWJtaXRTb3VuZENsb3VkUG9zdChwb3N0Ll9pZCwge2F3c0F1ZGlvS2V5TmFtZTogcG9zdC5hd3NBdWRpb0tleU5hbWV9KVxuICAgICAgfSkgICAgXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpe1xuICAgICAgICBpZiAocG9zdC5hd3NBdWRpb0tleU5hbWUpe1xuICAgICAgICAgIFNDLmluaXRpYWxpemUoe1xuICAgICAgICAgICAgY2xpZW50X2lkOiAnODAwMmYwZjgzMjZkODY5NjY4NTIzZDhlNDVhNTNiOTAnLFxuICAgICAgICAgICAgb2F1dGhfdG9rZW46ICRzY29wZS51c2VyLnNvdW5kY2xvdWQudG9rZW5cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHZhciB0cmFja0ZpbGUgPSBuZXcgRmlsZShyZXMuZGF0YS5Cb2R5LmRhdGEsIHBvc3QuYXdzQXVkaW9LZXlOYW1lLCB7dHlwZTogJ2F1ZGlvL21wMyd9KTtcbiAgICAgICAgICBTQy51cGxvYWQoe1xuICAgICAgICAgICAgZmlsZTogdHJhY2tGaWxlLFxuICAgICAgICAgICAgdGl0bGU6IHBvc3Quc291bmRDbG91ZFRpdGxlLFxuICAgICAgICAgICAgZGVzY3JpcHRpb246IHBvc3Quc291bmRDbG91ZERlc2NyaXB0aW9uXG4gICAgICAgICAgfSlcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpe1xuICAgICAgICAgICAgU3RvcmFnZUZhY3RvcnkudXBkYXRlUmVsZWFzZVN0YXR1cyhwb3N0KVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgICAgICAgICAgJHNjb3BlLmdldFBvc3QoKTtcbiAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLmNhdGNoKGZ1bmN0aW9uKGVycm9yKXtcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZXJyb3InLGVycm9yKTtcbiAgICAgICAgICB9KTsgICBcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9KS5cbiAgICB0aGVuKGZ1bmN0aW9uKHJlcyl7XG4gICAgICAgaWYocG9zdC5hd3NJbWFnZUtleU5hbWUpe1xuICAgICAgICByZXR1cm4gIEJyb2FkY2FzdEZhY3Rvcnkuc3VibWl0SW5zdGFncmFtUG9zdChwb3N0Ll9pZCwge1xuICAgICAgICAgIHRva2VuOiAkc2NvcGUudXNlci5pbnN0YWdyYW0udG9rZW4sICBcbiAgICAgICAgICBpbnN0YWdyYW1Qb3N0OiBwb3N0Lmluc3RhZ3JhbVBvc3RcbiAgICAgICAgfSk7XG4gICAgICAgfWVsc2V7XG4gICAgICAgICAgU3RvcmFnZUZhY3RvcnkudXBkYXRlUmVsZWFzZVN0YXR1cyhwb3N0KVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcyl7XG4gICAgICAgICAgICAkc2NvcGUuZ2V0UG9zdCgpO1xuICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfWVsc2V7XG4gICAgICAkLlplYnJhX0RpYWxvZyhtZXNzYWdlLHtcbiAgICAgICAgd2lkdGg6IDYwMFxuICAgICAgfSk7XG4gICAgfVxuICB9OyAvLyBDTE9TRVMgJHNjb3BlLmJyb2FkY2FzdFBvc3RcblxuICAkc2NvcGUuc29jaWFsTG9naW4gPSBmdW5jdGlvbih1cmwpe1xuICAgICR3aW5kb3cubG9jYXRpb24gPSB1cmw7XG4gIH07XG5cbiAgJHNjb3BlLmNoZWNrRkJUb2tlbiA9IGZ1bmN0aW9uKCl7XG4gICAgaWYoJHNjb3BlLnVzZXIuZmFjZWJvb2sgJiYgJHNjb3BlLnVzZXIuZmFjZWJvb2sudG9rZW4gIT0gXCJcIil7XG4gICAgICBTdG9yYWdlRmFjdG9yeS52YWxpZGF0ZVRva2VuKCRzY29wZS51c2VyLl9pZCwnZmFjZWJvb2snKS50aGVuKGZ1bmN0aW9uKHJlcyl7ICBcbiAgICAgICAgaWYocmVzKVxuICAgICAgICB7XG4gICAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlKHJlcy5kYXRhKTtcbiAgICAgICAgICAkc2NvcGUudXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcbiAgICAgICAgfVxuICAgICAgfSk7IFxuICAgIH1cbiAgfVxuXG4gICRzY29wZS5jaGVja0dvb2dsZVRva2VuID0gZnVuY3Rpb24oKXtcbiAgICBpZigkc2NvcGUudXNlci5nb29nbGUgJiYgJHNjb3BlLnVzZXIuZ29vZ2xlLnRva2VuICE9IFwiXCIpe1xuICAgICAgU3RvcmFnZUZhY3RvcnkudmFsaWRhdGVUb2tlbigkc2NvcGUudXNlci5faWQsJ2dvb2dsZScpLnRoZW4oZnVuY3Rpb24ocmVzKXsgIFxuICAgICAgICBpZihyZXMpXG4gICAgICAgIHtcbiAgICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUocmVzLmRhdGEpO1xuICAgICAgICAgICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xuICAgICAgICB9XG4gICAgICB9KTsgXG4gICAgfVxuICB9XG4gICRzY29wZS5jaGVja0ZCVG9rZW4oKTtcbiAgJHNjb3BlLmNoZWNrR29vZ2xlVG9rZW4oKTtcbn0pOyAvLyBDTE9TRVMgYXBwLmNvbnRyb2xsZXIiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhcnRpc3RUb29sc1NjaGVkdWxlcicsIHtcbiAgICB1cmw6ICcvYXJ0aXN0VG9vbHMvc2NoZWR1bGVyJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2FydGlzdFRvb2xzL3NjaGVkdWxlci9zY2hlZHVsZXIuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0FUU2NoZWR1bGVyQ29udHJvbGxlcicsXG4gICAgcmVzb2x2ZToge1xuICAgICAgZXZlbnRzOiBmdW5jdGlvbigkaHR0cCwgJHdpbmRvdywgU2Vzc2lvblNlcnZpY2UpIHtcbiAgICAgICAgaWYgKCFTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkpIHtcbiAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdyZXR1cm5zdGF0ZScsICdhcnRpc3RUb29sc1NjaGVkdWxlcicpO1xuICAgICAgICAgICR3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvbG9naW4nO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZXZlbnRzL2ZvclVzZXIvJyArIFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKS5zb3VuZGNsb3VkLmlkKVxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xuICAgICAgICAgIH0pXG4gICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcImVycm9yIGdldHRpbmcgeW91ciBldmVudHNcIik7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfSlcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdBVFNjaGVkdWxlckNvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsIEF1dGhTZXJ2aWNlLCAkd2luZG93LCBldmVudHMsIFNlc3Npb25TZXJ2aWNlKSB7XG4gIGlmICghU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSB7XG4gICAgJHN0YXRlLmdvKCdsb2dpbicpO1xuICB9IGVsc2Uge1xuICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3JldHVybnN0YXRlJyk7XG4gIH1cbiAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XG4gICRzY29wZS5zaG93RW1haWxNb2RhbCA9IGZhbHNlO1xuICAkcm9vdFNjb3BlLnVzZXJsaW5rZWRBY2NvdW50cyA9ICgkc2NvcGUudXNlci5saW5rZWRBY2NvdW50cyA/ICRzY29wZS51c2VyLmxpbmtlZEFjY291bnRzIDogW10pO1xuICAkc2NvcGUubWFrZUV2ZW50VVJMID0gXCJcIjtcbiAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XG4gICRzY29wZS5wcm9jZXNzaW9uZyA9IGZhbHNlO1xuICBldmVudHMuZm9yRWFjaChmdW5jdGlvbihldikge1xuICAgIGV2LmRheSA9IG5ldyBEYXRlKGV2LmRheSk7XG4gIH0pO1xuICAkc2NvcGUuZXZlbnRzID0gZXZlbnRzO1xuICAkc2NvcGUuaGlkZWFsbCA9IGZhbHNlO1xuXG4gICRzY29wZS5kYXlJbmNyID0gMDtcblxuICAkc2NvcGUuYXV0b0ZpbGxUcmFja3MgPSBbXTtcbiAgJHNjb3BlLnRyYWNrTGlzdCA9IFtdO1xuICAkc2NvcGUudHJhY2tMaXN0T2JqID0gbnVsbDtcbiAgJHNjb3BlLnRyYWNrTGlzdFNsb3RPYmogPSBudWxsO1xuICAkc2NvcGUubmV3UXVldWVTb25nID0gXCJcIjtcbiAgJHNjb3BlLnRyYWNrQXJ0aXN0SUQgPSAwO1xuICAkc2NvcGUudHJhY2tUeXBlID0gXCJcIjtcblxuICAkc2NvcGUudHJhY2tDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICRzY29wZS5tYWtlRXZlbnRVUkwgPSAkc2NvcGUudHJhY2tMaXN0U2xvdE9iai5wZXJtYWxpbmtfdXJsO1xuICAgICRzY29wZS5jaGFuZ2VVUkwoKTtcbiAgfTtcblxuICAkc2NvcGUudHJhY2tMaXN0Q2hhbmdlID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAkc2NvcGUubmV3UXVldWVTb25nID0gJHNjb3BlLnRyYWNrTGlzdE9iai5wZXJtYWxpbmtfdXJsO1xuICAgICRzY29wZS5jaGFuZ2VRdWV1ZVNvbmcoKTtcbiAgfTtcblxuICAkc2NvcGUuZ2V0VHJhY2tMaXN0RnJvbVNvdW5kY2xvdWQgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcHJvZmlsZSA9ICRzY29wZS51c2VyO1xuICAgIGlmIChwcm9maWxlLnNvdW5kY2xvdWQpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgIFNDLmdldCgnL3VzZXJzLycgKyBwcm9maWxlLnNvdW5kY2xvdWQuaWQgKyAnL3RyYWNrcycsIHtcbiAgICAgICAgICBmaWx0ZXI6ICdwdWJsaWMnXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHRyYWNrcykge1xuICAgICAgICAgICRzY29wZS50cmFja0xpc3QgPSB0cmFja3M7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAkc2NvcGUub3BlbkhlbHBNb2RhbCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBkaXNwbGF5VGV4dCA9IFwiU2NoZWR1bGUgeW91ciByZXBvc3RzIHVzaW5nIHRoZSBhc3NpZ25lZCBzbG90cywgYW5kIGluZGljYXRlIHlvdXIgcHJlZmVyZW5jZSBmb3IgdW4tcmVwb3N0aW5nIGFmdGVyIDI0IGhvdXJzLiBLZWVwIGluIG1pbmQgdGhhdCB0aGUgc2NoZWR1bGVyIHdpbGwgbm90IGFsbG93IHlvdSB0byByZXBvc3QgYW5kIHVuLXJlcG9zdCB3aXRoaW4gYSBwZXJpb2Qgb2YgNDggaG91cnMuQXJyb3cgaWNvbnMgcG9pbnRpbmcgZG93bndhcmRzIGluZGljYXRlIHRoYXQgeW91IGhhdmUgbWFya2VkIHRoZSB0cmFjayB0byBiZSB1bi1yZXBvc3RlZCBhZnRlciAyNCBob3Vycy5PcmFuZ2UtY29sb3JlZCBzbG90cyBhcmUgcmVzZXJ2ZWQgZm9yIHRyYWRlcyBpbml0aWF0ZWQgdXNpbmcgdGhlIHJlcG9zdC1mb3ItcmVwb3N0IHBsYXRmb3JtLjxicj48YnI+PGEgc3R5bGU9J3RleHQtYWxpZ246Y2VudGVyOyBtYXJnaW46MCBhdXRvOycgaHJlZj0nbWFpbHRvOmNvYXlzY3VlQGFydGlzdHN1bmxpbWl0ZWQuY28/c3ViamVjdD1BcnRpc3RzIFVubGltaXRlZCBIZWxwJyB0YXJnZXQ9J190b3AnPkVtYWlsIFRlY2ggU3VwcG9ydDwvYT5cIjtcbiAgICAkLlplYnJhX0RpYWxvZyhkaXNwbGF5VGV4dCwge1xuICAgICAgd2lkdGg6IDYwMFxuICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLnNhdmVVc2VyID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLnB1dChcIi9hcGkvZGF0YWJhc2UvcHJvZmlsZVwiLCAkc2NvcGUudXNlcilcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUocmVzLmRhdGEpO1xuICAgICAgICAkc2NvcGUudXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH0pXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJFcnJvcjogZGlkIG5vdCBzYXZlXCIpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUuZGF5SW5jciA9IDA7XG5cbiAgJHNjb3BlLmluY3JEYXkgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLmRheUluY3IgPCAyMSkgJHNjb3BlLmRheUluY3IrKztcbiAgfVxuXG4gICRzY29wZS5kZWNyRGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCRzY29wZS5kYXlJbmNyID4gMCkgJHNjb3BlLmRheUluY3ItLTtcbiAgfVxuXG4gICRzY29wZS5jbGlja2VkU2xvdCA9IGZ1bmN0aW9uKGRheSwgaG91cikge1xuICAgIHZhciB0b2RheSA9IG5ldyBEYXRlKCk7XG4gICAgaWYgKHRvZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09IGRheS50b0xvY2FsZURhdGVTdHJpbmcoKSAmJiB0b2RheS5nZXRIb3VycygpID4gaG91cikgcmV0dXJuO1xuICAgICRzY29wZS5zaG93T3ZlcmxheSA9IHRydWU7XG4gICAgdmFyIGNhbERheSA9IHt9O1xuICAgIHZhciBjYWxlbmRhckRheSA9ICRzY29wZS5jYWxlbmRhci5maW5kKGZ1bmN0aW9uKGNhbEQpIHtcbiAgICAgIHJldHVybiBjYWxELmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSBkYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XG4gICAgfSk7XG4gICAgJHNjb3BlLm1ha2VFdmVudFVSTCA9IHVuZGVmaW5lZDtcbiAgICAkc2NvcGUudHJhY2tMaXN0U2xvdE9iaiA9IHVuZGVmaW5lZDtcbiAgICAkc2NvcGUubWFrZUV2ZW50ID0gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShjYWxlbmRhckRheS5ldmVudHNbaG91cl0pKTtcbiAgICAvLyBpZiAoJHNjb3BlLm1ha2VFdmVudC50eXBlID09ICd0cmFkZWQnIHx8ICRzY29wZS5tYWtlRXZlbnQudHlwZSA9PSAncGFpZCcpIHtcbiAgICAvLyAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICAgIC8vICAgJHNjb3BlLm1ha2VFdmVudCA9IHVuZGVmaW5lZDtcbiAgICAvLyAgICQuWmVicmFfRGlhbG9nKFwiQ2Fubm90IG1hbmFnZSBhIHRyYWRlZCBvciBwYWlkIHNsb3QuXCIpO1xuICAgIC8vICAgcmV0dXJuO1xuICAgIC8vIH1cbiAgICBpZiAoJHNjb3BlLm1ha2VFdmVudC50eXBlID09IFwiZW1wdHlcIikge1xuICAgICAgdmFyIG1ha2VEYXkgPSBuZXcgRGF0ZShkYXkpO1xuICAgICAgbWFrZURheS5zZXRIb3Vycyhob3VyKTtcbiAgICAgICRzY29wZS5tYWtlRXZlbnQgPSB7XG4gICAgICAgIHVzZXJJRDogJHNjb3BlLnVzZXIuc291bmRjbG91ZC5pZCxcbiAgICAgICAgZGF5OiBtYWtlRGF5LFxuICAgICAgICB0eXBlOiBcInRyYWNrXCJcbiAgICAgIH07XG4gICAgICAkc2NvcGUubWFrZUV2ZW50LnVucmVwb3N0RGF0ZSA9IG5ldyBEYXRlKCRzY29wZS5tYWtlRXZlbnQuZGF5LmdldFRpbWUoKSArIDI0ICogNjAgKiA2MCAqIDEwMDApO1xuICAgICAgJHNjb3BlLm1ha2VFdmVudC51bnJlcG9zdCA9IHRydWU7XG4gICAgICAkc2NvcGUubmV3RXZlbnQgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAkc2NvcGUubWFrZUV2ZW50LmRheSA9IG5ldyBEYXRlKCRzY29wZS5tYWtlRXZlbnQuZGF5KTtcbiAgICAgICRzY29wZS5tYWtlRXZlbnQudW5yZXBvc3REYXRlID0gbmV3IERhdGUoJHNjb3BlLm1ha2VFdmVudC51bnJlcG9zdERhdGUpO1xuICAgICAgJHNjb3BlLm1ha2VFdmVudC51bnJlcG9zdCA9ICgkc2NvcGUubWFrZUV2ZW50LnVucmVwb3N0RGF0ZSA+IG5ldyBEYXRlKCkpO1xuICAgICAgJHNjb3BlLm1ha2VFdmVudFVSTCA9ICRzY29wZS5tYWtlRXZlbnQudHJhY2tVUkw7XG4gICAgICBTQy5vRW1iZWQoJ2h0dHBzOi8vYXBpLnNvdW5kY2xvdWQuY29tL3RyYWNrcy8nICsgJHNjb3BlLm1ha2VFdmVudC50cmFja0lELCB7XG4gICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLFxuICAgICAgICBhdXRvX3BsYXk6IGZhbHNlLFxuICAgICAgICBtYXhoZWlnaHQ6IDE1MFxuICAgICAgfSk7XG4gICAgICAkc2NvcGUubmV3RXZlbnQgPSBmYWxzZTtcbiAgICB9XG4gIH1cblxuICAkc2NvcGUuY2hhbmdlUXVldWVTbG90ID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLm1ha2VFdmVudC50aXRsZSA9IG51bGw7XG4gICAgJHNjb3BlLm1ha2VFdmVudC50cmFja1VSTCA9IG51bGw7XG4gICAgJHNjb3BlLm1ha2VFdmVudC5hcnRpc3ROYW1lID0gbnVsbDtcbiAgICAkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQgPSBudWxsO1xuICAgICRzY29wZS5tYWtlRXZlbnRVUkwgPSBudWxsO1xuICB9XG5cbiAgJHNjb3BlLmNoYW5nZVVSTCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc2NvcGUubWFrZUV2ZW50VVJMKSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIHtcbiAgICAgICAgICB1cmw6ICRzY29wZS5tYWtlRXZlbnRVUkxcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgJHNjb3BlLnRyYWNrQXJ0aXN0SUQgPSByZXMuZGF0YS51c2VyLmlkO1xuICAgICAgICAgICRzY29wZS50cmFja1R5cGUgPSByZXMuZGF0YS5raW5kO1xuICAgICAgICAgIGlmIChyZXMuZGF0YS5raW5kICE9IFwicGxheWxpc3RcIikge1xuICAgICAgICAgICAgaWYgKHJlcy5kYXRhLnVzZXIuaWQgIT0gJHNjb3BlLnVzZXIuc291bmRjbG91ZC5pZCkge1xuICAgICAgICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQgPSByZXMuZGF0YS5pZDtcbiAgICAgICAgICAgICAgJHNjb3BlLm1ha2VFdmVudC50aXRsZSA9IHJlcy5kYXRhLnRpdGxlO1xuICAgICAgICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnRyYWNrVVJMID0gcmVzLmRhdGEudHJhY2tVUkw7XG4gICAgICAgICAgICAgIGlmIChyZXMuZGF0YS51c2VyKSAkc2NvcGUubWFrZUV2ZW50LmFydGlzdE5hbWUgPSByZXMuZGF0YS51c2VyLnVzZXJuYW1lO1xuICAgICAgICAgICAgICBTQy5vRW1iZWQoJHNjb3BlLm1ha2VFdmVudFVSTCwge1xuICAgICAgICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLFxuICAgICAgICAgICAgICAgIGF1dG9fcGxheTogZmFsc2UsXG4gICAgICAgICAgICAgICAgbWF4aGVpZ2h0OiAxNTBcbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUGxheWVyJykuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuICAgICAgICAgICAgICAkc2NvcGUubm90Rm91bmQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICRzY29wZS5ub3RGb3VuZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIllvdSBjYW5ub3QgcmVwb3N0IHlvdXIgb3duIHRyYWNrLlwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJHNjb3BlLm5vdEZvdW5kID0gZmFsc2U7XG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJTb3JyeSEgV2UgZG9uJ3QgYWxsb3cgc2NoZWR1bGluZyBwbGF5bGlzdHMgaGVyZS4gUGxlYXNlIGVudGVyIGEgdHJhY2sgdXJsIGluc3RlYWQuXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSkudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIldlIGFyZSBub3QgYWxsb3dlZCB0byBhY2Nlc3MgdHJhY2tzIGJ5IHRoaXMgYXJ0aXN0IHdpdGggdGhlIFNvdW5kY2xvdWQgQVBJLiBXZSBhcG9sb2dpemUgZm9yIHRoZSBpbmNvbnZlbmllbmNlLCBhbmQgd2UgYXJlIHdvcmtpbmcgd2l0aCBTb3VuZGNsb3VkIHRvIHJlc29sdmUgdGhpcyBpc3N1ZS5cIik7XG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUGxheWVyJykuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG4gICAgICAgICAgJHNjb3BlLm5vdEZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9XG4gIH1cblxuICAkc2NvcGUuZGVsZXRlRXZlbnQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoISRzY29wZS5uZXdFdmVudCkge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgJGh0dHAuZGVsZXRlKCcvYXBpL2V2ZW50cy9yZXBvc3RFdmVudHMvJyArICRzY29wZS5tYWtlRXZlbnQuX2lkKVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICByZXR1cm4gJHNjb3BlLnJlZnJlc2hFdmVudHMoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkVSUk9SOiBEaWQgbm90IGRlbGV0ZS5cIilcbiAgICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBjYWxlbmRhckRheSA9ICRzY29wZS5jYWxlbmRhci5maW5kKGZ1bmN0aW9uKGNhbEQpIHtcbiAgICAgICAgcmV0dXJuIGNhbEQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09ICRzY29wZS5tYWtlRXZlbnQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpO1xuICAgICAgfSk7XG4gICAgICBjYWxlbmRhckRheS5ldmVudHNbJHNjb3BlLm1ha2VFdmVudC5kYXkuZ2V0SG91cnMoKV0gPSB7XG4gICAgICAgIHR5cGU6IFwiZW1wdHlcIlxuICAgICAgfTtcbiAgICAgIHZhciBldmVudHNcbiAgICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICAgIH1cbiAgfVxuXG4gICRzY29wZS5zZXRDYWxlbmRhckV2ZW50ID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBldmVudC5kYXkgPSBuZXcgRGF0ZShldmVudC5kYXkpO1xuICAgIHZhciBjYWxlbmRhckRheSA9ICRzY29wZS5jYWxlbmRhci5maW5kKGZ1bmN0aW9uKGNhbEQpIHtcbiAgICAgIHJldHVybiBjYWxELmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSA9PSBldmVudC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCk7XG4gICAgfSk7XG4gICAgY2FsZW5kYXJEYXkuZXZlbnRzW2V2ZW50LmRheS5nZXRIb3VycygpXSA9IGV2ZW50O1xuICB9XG5cbiAgJHNjb3BlLmNoYW5nZVVucmVwb3N0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCRzY29wZS5tYWtlRXZlbnQudW5yZXBvc3QpIHtcbiAgICAgICRzY29wZS5tYWtlRXZlbnQuZGF5ID0gbmV3IERhdGUoJHNjb3BlLm1ha2VFdmVudC5kYXkpO1xuICAgICAgJHNjb3BlLm1ha2VFdmVudC51bnJlcG9zdERhdGUgPSBuZXcgRGF0ZSgkc2NvcGUubWFrZUV2ZW50LmRheS5nZXRUaW1lKCkgKyAyNCAqIDYwICogNjAgKiAxMDAwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLm1ha2VFdmVudC51bnJlcG9zdERhdGUgPSBuZXcgRGF0ZSgwKTtcbiAgICB9XG4gIH1cblxuICAkc2NvcGUuZmluZFVucmVwb3N0T3ZlcmxhcCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICghJHNjb3BlLm1ha2VFdmVudC50cmFja0lEKSByZXR1cm4gZmFsc2U7XG4gICAgdmFyIGJsb2NrRXZlbnRzID0gJHNjb3BlLmV2ZW50cy5maWx0ZXIoZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgIGV2ZW50LmRheSA9IG5ldyBEYXRlKGV2ZW50LmRheSk7XG4gICAgICBldmVudC51bnJlcG9zdERhdGUgPSBuZXcgRGF0ZShldmVudC51bnJlcG9zdERhdGUpO1xuICAgICAgaWYgKG1vbWVudCgkc2NvcGUubWFrZUV2ZW50LmRheSkuZm9ybWF0KCdMTEwnKSA9PSBtb21lbnQoZXZlbnQuZGF5KS5mb3JtYXQoJ0xMTCcpICYmICRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCA9PSBldmVudC50cmFja0lEKSByZXR1cm4gZmFsc2U7XG4gICAgICByZXR1cm4gKCRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCA9PSBldmVudC50cmFja0lEICYmIGV2ZW50LnVucmVwb3N0RGF0ZS5nZXRUaW1lKCkgPiAkc2NvcGUubWFrZUV2ZW50LmRheS5nZXRUaW1lKCkgLSAyNCAqIDM2MDAwMDAgJiYgZXZlbnQuZGF5LmdldFRpbWUoKSA8ICRzY29wZS5tYWtlRXZlbnQudW5yZXBvc3REYXRlLmdldFRpbWUoKSArIDI0ICogMzYwMDAwMCk7XG4gICAgfSlcbiAgICByZXR1cm4gYmxvY2tFdmVudHMubGVuZ3RoID4gMDtcbiAgfVxuXG4gICRzY29wZS5zYXZlRXZlbnQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLnRyYWNrVHlwZSA9PSBcInBsYXlsaXN0XCIpIHtcbiAgICAgICQuWmVicmFfRGlhbG9nKFwiU29ycnkhIFdlIGRvbid0IGN1cnJlbnRseSBhbGxvdyBwbGF5bGlzdCByZXBvc3RpbmcuIFBsZWFzZSBlbnRlciBhIHRyYWNrIHVybCBpbnN0ZWFkLlwiKTtcbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKCRzY29wZS50cmFja0FydGlzdElEID09ICRzY29wZS51c2VyLnNvdW5kY2xvdWQuaWQpIHtcbiAgICAgICQuWmVicmFfRGlhbG9nKFwiU29ycnkhIFlvdSBjYW5ub3Qgc2NoZWR1bGUgeW91ciBvd24gdHJhY2sgdG8gYmUgcmVwb3N0ZWQuXCIpXG4gICAgICByZXR1cm47XG4gICAgfSBlbHNlIGlmICgkc2NvcGUuZmluZFVucmVwb3N0T3ZlcmxhcCgpKSB7XG4gICAgICAkLlplYnJhX0RpYWxvZygnSXNzdWUhIFRoaXMgcmVwb3N0IHdpbGwgY2F1c2UgdGhpcyB0cmFjayB0byBiZSBib3RoIHVucmVwb3N0ZWQgYW5kIHJlcG9zdGVkIHdpdGhpbiBhIDI0IGhvdXIgdGltZSBwZXJpb2QuIElmIHlvdSBhcmUgdW5yZXBvc3RpbmcsIHBsZWFzZSBhbGxvdyA0OCBob3VycyBiZXR3ZWVuIHNjaGVkdWxlZCByZXBvc3RzLicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAoISRzY29wZS5tYWtlRXZlbnQudHJhY2tJRCAmJiAoJHNjb3BlLm1ha2VFdmVudC50eXBlID09IFwidHJhY2tcIikpIHtcbiAgICAgICQuWmVicmFfRGlhbG9nKFwiRW50ZXIgYSB0cmFjayBVUkxcIik7XG4gICAgfSBlbHNlIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgIGlmICgkc2NvcGUubmV3RXZlbnQpIHtcbiAgICAgICAgdmFyIHJlcSA9ICRodHRwLnBvc3QoJy9hcGkvZXZlbnRzL3JlcG9zdEV2ZW50cycsICRzY29wZS5tYWtlRXZlbnQpXG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgcmVxID0gJGh0dHAucHV0KCcvYXBpL2V2ZW50cy9yZXBvc3RFdmVudHMnLCAkc2NvcGUubWFrZUV2ZW50KVxuICAgICAgfVxuICAgICAgcmVxXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICRzY29wZS50cmFja1R5cGUgPSBcIlwiO1xuICAgICAgICAgICRzY29wZS50cmFja0FydGlzdElEID0gMDtcbiAgICAgICAgICByZXR1cm4gJHNjb3BlLnJlZnJlc2hFdmVudHMoKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAkc2NvcGUudHJhY2tUeXBlID0gXCJcIjtcbiAgICAgICAgICAkc2NvcGUudHJhY2tBcnRpc3RJRCA9IDA7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJFUlJPUjogRGlkIG5vdCBzYXZlLlwiKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG4gICRzY29wZS5lbWFpbFNsb3QgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbWFpbHRvX2xpbmsgPSBcIm1haWx0bzo/c3ViamVjdD1SZXBvc3Qgb2YgXCIgKyAkc2NvcGUubWFrZUV2ZW50LnRpdGxlICsgJyZib2R5PUhleSxcXG5cXG4gSSBhbSByZXBvc3RpbmcgeW91ciBzb25nICcgKyAkc2NvcGUubWFrZUV2ZW50LnRpdGxlICsgJyBvbiAnICsgJHNjb3BlLnVzZXIuc291bmRjbG91ZC51c2VybmFtZSArICcgb24gJyArICRzY29wZS5tYWtlRXZlbnQuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpICsgJy5cXG5cXG4gQmVzdCwgXFxuJyArICRzY29wZS51c2VyLnNvdW5kY2xvdWQudXNlcm5hbWU7XG4gICAgbG9jYXRpb24uaHJlZiA9IGVuY29kZVVSSShtYWlsdG9fbGluayk7XG4gIH1cblxuICAkc2NvcGUuYmFja0V2ZW50ID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLm1ha2VFdmVudCA9IG51bGw7XG4gICAgJHNjb3BlLnRyYWNrVHlwZSA9IFwiXCI7XG4gICAgJHNjb3BlLnRyYWNrQXJ0aXN0SUQgPSAwO1xuICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xuICB9XG5cbiAgJHNjb3BlLnJlbW92ZVF1ZXVlU29uZyA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgJHNjb3BlLnVzZXIucXVldWUuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAkc2NvcGUuc2F2ZVVzZXIoKVxuICAgICRzY29wZS5sb2FkUXVldWVTb25ncygpO1xuICB9XG5cbiAgJHNjb3BlLmFkZFNvbmcgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLnVzZXIucXVldWUuaW5kZXhPZigkc2NvcGUubmV3UXVldWVJRCkgIT0gLTEpIHJldHVybjtcbiAgICAkc2NvcGUudXNlci5xdWV1ZS5wdXNoKCRzY29wZS5uZXdRdWV1ZUlEKTtcbiAgICAkc2NvcGUuc2F2ZVVzZXIoKTtcbiAgICAkc2NvcGUubmV3UXVldWVTb25nID0gdW5kZWZpbmVkO1xuICAgICRzY29wZS50cmFja0xpc3RPYmogPSBcIlwiO1xuICAgICRzY29wZS5uZXdRdWV1ZSA9IHVuZGVmaW5lZDtcbiAgICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MoKTtcbiAgfVxuXG4gICRzY29wZS5jaGFuZ2VRdWV1ZVNvbmcgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHNjb3BlLm5ld1F1ZXVlU29uZyAhPSBcIlwiKSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIHtcbiAgICAgICAgICB1cmw6ICRzY29wZS5uZXdRdWV1ZVNvbmdcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICB2YXIgdHJhY2sgPSByZXMuZGF0YTtcbiAgICAgICAgICAkc2NvcGUubmV3UXVldWUgPSB0cmFjaztcbiAgICAgICAgICAkc2NvcGUubmV3UXVldWVJRCA9IHRyYWNrLmlkO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIldlIGFyZSBub3QgYWxsb3dlZCB0byBhY2Nlc3MgdHJhY2tzIGJ5IHRoaXMgYXJ0aXN0IHdpdGggdGhlIFNvdW5kY2xvdWQgQVBJLiBXZSBhcG9sb2dpemUgZm9yIHRoZSBpbmNvbnZlbmllbmNlLCBhbmQgd2UgYXJlIHdvcmtpbmcgd2l0aCBTb3VuZGNsb3VkIHRvIHJlc29sdmUgdGhpcyBpc3N1ZS5cIik7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLm1vdmVVcCA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgaWYgKGluZGV4ID09IDApIHJldHVybjtcbiAgICB2YXIgcyA9ICRzY29wZS51c2VyLnF1ZXVlW2luZGV4XTtcbiAgICAkc2NvcGUudXNlci5xdWV1ZVtpbmRleF0gPSAkc2NvcGUudXNlci5xdWV1ZVtpbmRleCAtIDFdO1xuICAgICRzY29wZS51c2VyLnF1ZXVlW2luZGV4IC0gMV0gPSBzO1xuICAgICRzY29wZS5zYXZlVXNlcigpO1xuICAgICRzY29wZS5sb2FkUXVldWVTb25ncygpO1xuICB9XG5cbiAgJHNjb3BlLm1vdmVEb3duID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICBpZiAoaW5kZXggPT0gJHNjb3BlLnVzZXIucXVldWUubGVuZ3RoIC0gMSkgcmV0dXJuO1xuICAgIHZhciBzID0gJHNjb3BlLnVzZXIucXVldWVbaW5kZXhdO1xuICAgICRzY29wZS51c2VyLnF1ZXVlW2luZGV4XSA9ICRzY29wZS51c2VyLnF1ZXVlW2luZGV4ICsgMV07XG4gICAgJHNjb3BlLnVzZXIucXVldWVbaW5kZXggKyAxXSA9IHM7XG4gICAgJHNjb3BlLnNhdmVVc2VyKCk7XG4gICAgJHNjb3BlLmxvYWRRdWV1ZVNvbmdzKCk7XG4gIH1cblxuICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MgPSBmdW5jdGlvbihxdWV1ZSkge1xuICAgICRzY29wZS5hdXRvRmlsbFRyYWNrcyA9IFtdO1xuICAgICRzY29wZS51c2VyLnF1ZXVlLmZvckVhY2goZnVuY3Rpb24oc29uZ0lEKSB7XG4gICAgICBTQy5nZXQoJy90cmFja3MvJyArIHNvbmdJRClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24odHJhY2spIHtcbiAgICAgICAgICAkc2NvcGUuYXV0b0ZpbGxUcmFja3MucHVzaCh0cmFjayk7XG4gICAgICAgICAgJHNjb3BlLiRkaWdlc3QoKTtcbiAgICAgICAgfSwgY29uc29sZS5sb2cpO1xuICAgIH0pXG4gIH1cbiAgaWYgKCRzY29wZS51c2VyICYmICRzY29wZS51c2VyLnF1ZXVlKSB7XG4gICAgJHNjb3BlLmxvYWRRdWV1ZVNvbmdzKCk7XG4gIH1cblxuICAkc2NvcGUuZGF5T2ZXZWVrQXNTdHJpbmcgPSBmdW5jdGlvbihkYXRlKSB7XG4gICAgdmFyIGRheUluZGV4ID0gZGF0ZS5nZXREYXkoKTtcbiAgICBpZiAoc2NyZWVuLndpZHRoID4gJzc0NCcpIHtcbiAgICAgIHJldHVybiBbXCJTdW5kYXlcIiwgXCJNb25kYXlcIiwgXCJUdWVzZGF5XCIsIFwiV2VkbmVzZGF5XCIsIFwiVGh1cnNkYXlcIiwgXCJGcmlkYXlcIiwgXCJTYXR1cmRheVwiXVtkYXlJbmRleF07XG4gICAgfVxuICAgIHJldHVybiBbXCJTdW5cIiwgXCJNb25cIiwgXCJUdWVcIiwgXCJXZWRcIiwgXCJUaHVcIiwgXCJGcmlcIiwgXCJTYXRcIl1bZGF5SW5kZXhdO1xuICB9XG5cbiAgJHNjb3BlLnVucmVwb3N0U3ltYm9sID0gZnVuY3Rpb24oZXZlbnQpIHtcbiAgICBpZiAoIWV2ZW50LnVucmVwb3N0RGF0ZSkgcmV0dXJuO1xuICAgIGV2ZW50LnVucmVwb3N0RGF0ZSA9IG5ldyBEYXRlKGV2ZW50LnVucmVwb3N0RGF0ZSk7XG4gICAgcmV0dXJuIGV2ZW50LnVucmVwb3N0RGF0ZSA+IG5ldyBEYXRlKCk7XG4gIH1cblxuICAkc2NvcGUuZ2V0U3R5bGUgPSBmdW5jdGlvbihldmVudCkge1xuICAgIGlmIChldmVudC50eXBlID09ICdlbXB0eScpIHtcbiAgICAgIHJldHVybiB7fVxuICAgIH0gZWxzZSBpZiAoZXZlbnQudHlwZSA9PSAndHJhY2snIHx8IGV2ZW50LnR5cGUgPT0gJ3F1ZXVlJykge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgJ2JhY2tncm91bmQtY29sb3InOiAnIzY3Zjk2NydcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGV2ZW50LnR5cGUgPT0gJ3RyYWRlZCcpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNGRkRBOTcnXG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChldmVudC50eXBlID09ICdwYWlkJykge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgJ2JhY2tncm91bmQtY29sb3InOiAnI0ZGQkJERCdcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAkc2NvcGUucmVmcmVzaEV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZXZlbnRzL2ZvclVzZXIvJyArIFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKS5zb3VuZGNsb3VkLmlkKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIHZhciBldmVudHMgPSByZXMuZGF0YVxuICAgICAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbihldikge1xuICAgICAgICAgIGV2LmRheSA9IG5ldyBEYXRlKGV2LmRheSk7XG4gICAgICAgIH0pO1xuICAgICAgICAkc2NvcGUuZXZlbnRzID0gZXZlbnRzO1xuICAgICAgICAkc2NvcGUuY2FsZW5kYXIgPSAkc2NvcGUuZmlsbERhdGVBcnJheXMoZXZlbnRzKTtcbiAgICAgIH0pXG4gIH1cblxuICAkc2NvcGUuZmlsbERhdGVBcnJheXMgPSBmdW5jdGlvbihldmVudHMpIHtcbiAgICB2YXIgY2FsZW5kYXIgPSBbXTtcbiAgICB2YXIgdG9kYXkgPSBuZXcgRGF0ZSgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgMjk7IGkrKykge1xuICAgICAgdmFyIGNhbERheSA9IHt9O1xuICAgICAgY2FsRGF5LmRheSA9IG5ldyBEYXRlKClcbiAgICAgIGNhbERheS5kYXkuc2V0RGF0ZSh0b2RheS5nZXREYXRlKCkgKyBpKTtcbiAgICAgIHZhciBkYXlFdmVudHMgPSBldmVudHMuZmlsdGVyKGZ1bmN0aW9uKGV2KSB7XG4gICAgICAgIHJldHVybiAoZXYuZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpID09IGNhbERheS5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkpO1xuICAgICAgfSk7XG4gICAgICB2YXIgZXZlbnRBcnJheSA9IFtdO1xuICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCAyNDsgaisrKSB7XG4gICAgICAgIGV2ZW50QXJyYXlbal0gPSB7XG4gICAgICAgICAgdHlwZTogXCJlbXB0eVwiXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgICBkYXlFdmVudHMuZm9yRWFjaChmdW5jdGlvbihldikge1xuICAgICAgICBldmVudEFycmF5W2V2LmRheS5nZXRIb3VycygpXSA9IGV2O1xuICAgICAgfSk7XG4gICAgICBjYWxEYXkuZXZlbnRzID0gZXZlbnRBcnJheTtcbiAgICAgIGNhbGVuZGFyLnB1c2goY2FsRGF5KTtcbiAgICB9XG4gICAgcmV0dXJuIGNhbGVuZGFyO1xuICB9O1xuXG4gICRzY29wZS5jYWxlbmRhciA9ICRzY29wZS5maWxsRGF0ZUFycmF5cyhldmVudHMpO1xuICAkc2NvcGUudXBkYXRlRW1haWwgPSBmdW5jdGlvbihlbWFpbCkge1xuICAgIHZhciBhbnN3ZXIgPSBlbWFpbDtcbiAgICB2YXIgbXlBcnJheSA9IGFuc3dlci5tYXRjaCgvW2EtelxcLl9cXC0hIyQlJicrLz0/Xl9ge318fl0rQFthLXowLTlcXC1dK1xcLlxcU3syLDN9L2lnbSk7XG4gICAgaWYgKG15QXJyYXkpIHtcbiAgICAgICRzY29wZS51c2VyLmVtYWlsID0gYW5zd2VyO1xuICAgICAgcmV0dXJuICRodHRwLnB1dCgnL2FwaS9kYXRhYmFzZS9wcm9maWxlJywgJHNjb3BlLnVzZXIpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZShyZXMuZGF0YSk7XG4gICAgICAgICAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XG4gICAgICAgICAgJHNjb3BlLmhpZGVhbGwgPSBmYWxzZTtcbiAgICAgICAgICAkKCcjZW1haWxNb2RhbCcpLm1vZGFsKCdoaWRlJyk7XG4gICAgICAgICAgJHNjb3BlLnNob3dFbWFpbE1vZGFsID0gZmFsc2U7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkc2NvcGUuc2hvd0VtYWlsTW9kYWwgPSBmYWxzZTtcbiAgICAgICAgICAgICRzY29wZS5wcm9tcHRGb3JFbWFpbCgpO1xuICAgICAgICAgIH0sIDYwMCk7XG4gICAgICAgIH0pXG4gICAgfSBlbHNlIHtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICRzY29wZS5zaG93RW1haWxNb2RhbCA9IGZhbHNlO1xuICAgICAgICAkc2NvcGUucHJvbXB0Rm9yRW1haWwoKTtcbiAgICAgIH0sIDYwMCk7XG4gICAgfVxuICB9XG5cbiAgJHNjb3BlLnByb21wdEZvckVtYWlsID0gZnVuY3Rpb24oKSB7XG4gICAgaWYgKCEkc2NvcGUudXNlci5lbWFpbCkge1xuICAgICAgJHNjb3BlLnNob3dFbWFpbE1vZGFsID0gdHJ1ZTtcbiAgICAgICQoJyNlbWFpbE1vZGFsJykubW9kYWwoJ3Nob3cnKTtcbiAgICB9XG4gIH1cbiAgJHNjb3BlLnZlcmlmeUJyb3dzZXIgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAobmF2aWdhdG9yLnVzZXJBZ2VudC5zZWFyY2goXCJDaHJvbWVcIikgPT0gLTEgJiYgbmF2aWdhdG9yLnVzZXJBZ2VudC5zZWFyY2goXCJTYWZhcmlcIikgIT0gLTEpIHtcbiAgICAgIHZhciBwb3NpdGlvbiA9IG5hdmlnYXRvci51c2VyQWdlbnQuc2VhcmNoKFwiVmVyc2lvblwiKSArIDg7XG4gICAgICB2YXIgZW5kID0gbmF2aWdhdG9yLnVzZXJBZ2VudC5zZWFyY2goXCIgU2FmYXJpXCIpO1xuICAgICAgdmFyIHZlcnNpb24gPSBuYXZpZ2F0b3IudXNlckFnZW50LnN1YnN0cmluZyhwb3NpdGlvbiwgZW5kKTtcbiAgICAgIGlmIChwYXJzZUludCh2ZXJzaW9uKSA8IDkpIHtcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coJ1lvdSBoYXZlIG9sZCB2ZXJzaW9uIG9mIHNhZmFyaS4gQ2xpY2sgPGEgaHJlZj1cImh0dHBzOi8vc3VwcG9ydC5hcHBsZS5jb20vZG93bmxvYWRzL3NhZmFyaVwiPmhlcmU8L2E+IHRvIGRvd25sb2FkIHRoZSBsYXRlc3QgdmVyc2lvbiBvZiBzYWZhcmkgZm9yIGJldHRlciBzaXRlIGV4cGVyaWVuY2UuJywge1xuICAgICAgICAgICd0eXBlJzogJ2NvbmZpcm1hdGlvbicsXG4gICAgICAgICAgJ2J1dHRvbnMnOiBbe1xuICAgICAgICAgICAgY2FwdGlvbjogJ09LJ1xuICAgICAgICAgIH1dLFxuICAgICAgICAgICdvbkNsb3NlJzogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkd2luZG93LmxvY2F0aW9uLmhyZWYgPSBcImh0dHBzOi8vc3VwcG9ydC5hcHBsZS5jb20vZG93bmxvYWRzL3NhZmFyaVwiO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkc2NvcGUucHJvbXB0Rm9yRW1haWwoKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLnByb21wdEZvckVtYWlsKCk7XG4gICAgfVxuICB9XG4gICRzY29wZS52ZXJpZnlCcm93c2VyKCk7XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gICAgLnN0YXRlKCdsb2dpbicsIHtcbiAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICBwYXJhbXM6IHtcbiAgICAgICAgc3VibWlzc2lvbjogbnVsbFxuICAgICAgfSxcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvYXV0aC92aWV3cy9sb2dpbi5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ29udHJvbGxlcidcbiAgICB9KVxuICAgIC5zdGF0ZSgnc2lnbnVwJywge1xuICAgICAgdXJsOiAnL3NpZ251cCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2F1dGgvdmlld3Mvc2lnbnVwLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0F1dGhDb250cm9sbGVyJ1xuICAgIH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdBdXRoQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCAkc2NvcGUsICRodHRwLCAkdWliTW9kYWwsICR3aW5kb3csIEF1dGhTZXJ2aWNlLCBTZXNzaW9uU2VydmljZSwgc29ja2V0KSB7XG4gICRzY29wZS5sb2dpbk9iaiA9IHt9O1xuICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICB2YWw6ICcnLFxuICAgIHZpc2libGU6IGZhbHNlXG4gIH07XG4gIGlmIChTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkpIHtcbiAgICAkc3RhdGUuZ28oJ3JlRm9yUmVMaXN0cycpXG4gIH1cbiAgJHNjb3BlLm9wZW5Nb2RhbCA9IHtcbiAgICBzaWdudXBDb25maXJtOiBmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5tb2RhbEluc3RhbmNlID0gJHVpYk1vZGFsLm9wZW4oe1xuICAgICAgICBhbmltYXRpb246IHRydWUsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnc2lnbnVwQ29tcGxldGUuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdBdXRoQ29udHJvbGxlcicsXG4gICAgICAgIHNjb3BlOiAkc2NvcGVcbiAgICAgIH0pO1xuICAgIH1cbiAgfTtcbiAgJHNjb3BlLmxvZ2luID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICB2YWw6ICcnLFxuICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICB9O1xuICAgIEF1dGhTZXJ2aWNlXG4gICAgICAubG9naW4oJHNjb3BlLmxvZ2luT2JqKVxuICAgICAgLnRoZW4oaGFuZGxlTG9naW5SZXNwb25zZSlcbiAgICAgIC5jYXRjaChoYW5kbGVMb2dpbkVycm9yKVxuXG4gICAgZnVuY3Rpb24gaGFuZGxlTG9naW5SZXNwb25zZShyZXMpIHtcbiAgICAgIGlmIChyZXMuc3RhdHVzID09PSAyMDAgJiYgcmVzLmRhdGEuc3VjY2Vzcykge1xuICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUocmVzLmRhdGEudXNlcik7XG4gICAgICAgICRzdGF0ZS5nbygncmVGb3JSZUxpc3RzJyk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgICAgICB2YWw6IHJlcy5kYXRhLm1lc3NhZ2UsXG4gICAgICAgICAgdmlzaWJsZTogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGhhbmRsZUxvZ2luRXJyb3IocmVzKSB7XG4gICAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgICAgdmFsOiAnRXJyb3IgaW4gcHJvY2Vzc2luZyB5b3VyIHJlcXVlc3QnLFxuICAgICAgICB2aXNpYmxlOiB0cnVlXG4gICAgICB9O1xuICAgIH1cbiAgfTtcblxuICAkc2NvcGUudGhpcmRQYXJ0eUxvZ2luID0gZnVuY3Rpb24odXNlcmRhdGEpIHtcbiAgICBBdXRoU2VydmljZVxuICAgICAgLnRoaXJkUGFydHlsb2dpbih1c2VyZGF0YSlcbiAgICAgIC50aGVuKGhhbmRsZUxvZ2luUmVzcG9uc2UpXG4gICAgICAuY2F0Y2goaGFuZGxlTG9naW5FcnJvcilcblxuICAgIGZ1bmN0aW9uIGhhbmRsZUxvZ2luUmVzcG9uc2UocmVzKSB7XG4gICAgICBpZiAocmVzLnN0YXR1cyA9PT0gMjAwICYmIHJlcy5kYXRhLnN1Y2Nlc3MpIHtcbiAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlKHJlcy5kYXRhLnVzZXIpO1xuICAgICAgICAkc3RhdGUuZ28oJ3JlRm9yUmVMaXN0cycpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJJbnZhbGlkIFVzZXJuYW1lIE9SIFBhc3N3b3JkLlwiKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVMb2dpbkVycm9yKHJlcykge1xuICAgICAgJC5aZWJyYV9EaWFsb2coXCJFcnJvciBpbiBwcm9jZXNzaW5nIHlvdXIgcmVxdWVzdFwiKTtcbiAgICB9XG4gIH1cblxuICAkc2NvcGUuY2hlY2tJZlN1Ym1pc3Npb24gPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoJHN0YXRlUGFyYW1zLnN1Ym1pc3Npb24pIHtcbiAgICAgICRzY29wZS5zb3VuZGNsb3VkTG9naW4oKTtcbiAgICB9XG4gIH1cbiAgJHNjb3BlLnNpZ251cCA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5tZXNzYWdlID0ge1xuICAgICAgdmFsOiAnJyxcbiAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgfTtcbiAgICBpZiAoJHNjb3BlLnNpZ251cE9iai5wYXNzd29yZCAhPSAkc2NvcGUuc2lnbnVwT2JqLmNvbmZpcm1QYXNzd29yZCkge1xuICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICAgIHZhbDogJ1Bhc3N3b3JkIGRvZXNuXFwndCBtYXRjaCB3aXRoIGNvbmZpcm0gcGFzc3dvcmQnLFxuICAgICAgICB2aXNpYmxlOiB0cnVlXG4gICAgICB9O1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBBdXRoU2VydmljZVxuICAgICAgLnNpZ251cCgkc2NvcGUuc2lnbnVwT2JqKVxuICAgICAgLnRoZW4oaGFuZGxlU2lnbnVwUmVzcG9uc2UpXG4gICAgICAuY2F0Y2goaGFuZGxlU2lnbnVwRXJyb3IpXG5cbiAgICBmdW5jdGlvbiBoYW5kbGVTaWdudXBSZXNwb25zZShyZXMpIHtcbiAgICAgICRzdGF0ZS5nbygnbG9naW4nKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBoYW5kbGVTaWdudXBFcnJvcihyZXMpIHt9XG4gIH07XG5cbiAgJHNjb3BlLnNvdW5kY2xvdWRMb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICBTQy5jb25uZWN0KClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkcm9vdFNjb3BlLmFjY2Vzc1Rva2VuID0gcmVzLm9hdXRoX3Rva2VuO1xuICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9sb2dpbi9zb3VuZENsb3VkTG9naW4nLCB7XG4gICAgICAgICAgdG9rZW46IHJlcy5vYXV0aF90b2tlbixcbiAgICAgICAgICBwYXNzd29yZDogJ3Rlc3QnXG4gICAgICAgIH0pO1xuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUocmVzLmRhdGEudXNlcik7XG4gICAgICAgIGlmICgkc3RhdGVQYXJhbXMuc3VibWlzc2lvbikge1xuICAgICAgICAgICRzdGF0ZS5nbygnYXJ0aXN0VG9vbHNEb3dubG9hZEdhdGV3YXlOZXcnLCB7XG4gICAgICAgICAgICAnc3VibWlzc2lvbic6ICRzdGF0ZVBhcmFtcy5zdWJtaXNzaW9uXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdyZXR1cm5zdGF0ZScpICE9IHVuZGVmaW5lZCkge1xuICAgICAgICAgIGlmICgkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdyZXR1cm5zdGF0ZScpID09IFwicmVGb3JSZUludGVyYWN0aW9uXCIpIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdyZXR1cm5zdGF0ZScpLCB7XG4gICAgICAgICAgICAgIHRyYWRlSUQ6ICR3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3RpZCcpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9IGVsc2UgaWYgKCR3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3JldHVybnN0YXRlJykgPT0gXCJhcnRpc3RUb29sc0Rvd25sb2FkR2F0ZXdheUVkaXRcIikge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCR3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ3JldHVybnN0YXRlJyksIHtcbiAgICAgICAgICAgICAgZ2F0ZXdheUlEOiAkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCd0aWQnKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRzdGF0ZS5nbygkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdyZXR1cm5zdGF0ZScpKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHN0YXRlLmdvKCdyZUZvclJlTGlzdHMnKTtcbiAgICAgICAgfVxuXG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICQuWmVicmFfRGlhbG9nKCdFcnJvcjogQ291bGQgbm90IGxvZyBpbicpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gIH07XG59KTsiLCJhcHAuZmFjdG9yeSgnQXV0aFNlcnZpY2UnLCBbJyRodHRwJywgZnVuY3Rpb24oJGh0dHApe1xuXHRcblx0ZnVuY3Rpb24gbG9naW4oZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2xvZ2luJywgZGF0YSk7XG5cdH1cblxuXHRmdW5jdGlvbiBzaWdudXAoZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL3NpZ251cCcsIGRhdGEpO1xuXHR9XG5cblx0ZnVuY3Rpb24gdGhpcmRQYXJ0eWxvZ2luKGRhdGEpIHtcdFx0XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvbG9naW4vdGhpcmRQYXJ0eWxvZ2luJywgZGF0YSk7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdGxvZ2luOiBsb2dpbixcblx0XHRzaWdudXA6IHNpZ251cCxcblx0XHR0aGlyZFBhcnR5bG9naW46dGhpcmRQYXJ0eWxvZ2luXG5cdH07XG59XSk7XG4iLCJhcHAuZmFjdG9yeSgnU2Vzc2lvblNlcnZpY2UnLCBmdW5jdGlvbigkY29va2llcywgJGh0dHAsICR3aW5kb3cpIHtcblxuXHRmdW5jdGlvbiBjcmVhdGUoZGF0YSkge1xuXHRcdCR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3VzZXInLCBKU09OLnN0cmluZ2lmeShkYXRhKSk7XG5cdH1cblxuXHRmdW5jdGlvbiBkZWxldGVVc2VyKCkge1xuXHRcdCR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3VzZXInKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGdldFVzZXIoKSB7XG5cdFx0dHJ5IHtcblx0XHRcdHZhciB1c2VyID0gSlNPTi5wYXJzZSgkd2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCd1c2VyJykpO1xuXHRcdFx0aWYgKHVzZXIpIHtcblx0XHRcdFx0cmV0dXJuIHVzZXI7XG5cdFx0XHR9XG5cdFx0fSBjYXRjaCAoZSkge31cblx0fVxuXG5cdGZ1bmN0aW9uIHJlZnJlc2hVc2VyKCkge1xuXHRcdHZhciBjdXJVc2VyID0gZ2V0VXNlcigpO1xuXHRcdGlmIChjdXJVc2VyKSB7XG5cdFx0XHQkaHR0cC5nZXQoJy9hcGkvdXNlcnMvYnlJZC8nICsgY3VyVXNlci5faWQpXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uKHJlcykge1xuXHRcdFx0XHRcdGNyZWF0ZShyZXMuZGF0YSk7XG5cdFx0XHRcdH0pXG5cdFx0fVxuXHR9XG5cblx0cmV0dXJuIHtcblx0XHRjcmVhdGU6IGNyZWF0ZSxcblx0XHRkZWxldGVVc2VyOiBkZWxldGVVc2VyLFxuXHRcdGdldFVzZXI6IGdldFVzZXIsXG5cdFx0cmVmcmVzaFVzZXI6IHJlZnJlc2hVc2VyXG5cdH07XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyXG4gIC5zdGF0ZSgnL2N1c3RvbXN1Ym1pdCcsIHtcbiAgICB1cmw6ICcvY3VzdG9tc3VibWl0JyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2N1c3RvbVN1Ym1pdC92aWV3cy9jdXN0b21TdWJtaXQuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0N1c3RvbVN1Ym1pdENvbnRyb2xsZXInXG4gIH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdDdXN0b21TdWJtaXRDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCBBdXRoU2VydmljZSwgU2Vzc2lvblNlcnZpY2UsJHNjZSxjdXN0b21pemVTZXJ2aWNlLCAkbG9jYXRpb24pIHtcbiAgdmFyIHVzZXJJRCA9ICRsb2NhdGlvbi5zZWFyY2goKS51c2VyaWQ7XG4gICRzY29wZS5zdWJtaXNzaW9uID0ge307IFxuICAkc2NvcGUucG9zdERhdGEgPSB7fTtcbiAgJHNjb3BlLmdlbnJlQXJyYXkgPSBbXG4gICAgJ0FsdGVybmF0aXZlIFJvY2snLFxuICAgICdBbWJpZW50JyxcbiAgICAnQ3JlYXRpdmUnLFxuICAgICdDaGlsbCcsXG4gICAgJ0NsYXNzaWNhbCcsXG4gICAgJ0NvdW50cnknLFxuICAgICdEYW5jZSAmIEVETScsXG4gICAgJ0RhbmNlaGFsbCcsXG4gICAgJ0RlZXAgSG91c2UnLFxuICAgICdEaXNjbycsXG4gICAgJ0RydW0gJiBCYXNzJyxcbiAgICAnRHVic3RlcCcsXG4gICAgJ0VsZWN0cm9uaWMnLFxuICAgICdGZXN0aXZhbCcsXG4gICAgJ0ZvbGsnLFxuICAgICdIaXAtSG9wL1JOQicsXG4gICAgJ0hvdXNlJyxcbiAgICAnSW5kaWUvQWx0ZXJuYXRpdmUnLFxuICAgICdMYXRpbicsXG4gICAgJ1RyYXAnLFxuICAgICdWb2NhbGlzdHMvU2luZ2VyLVNvbmd3cml0ZXInXG4gIF07XG5cbiAgJHNjb3BlLnVybENoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmKCRzY29wZS51cmwgIT0gXCJcIil7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIHtcbiAgICAgICAgdXJsOiAkc2NvcGUudXJsXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIGlmIChyZXMuZGF0YS5raW5kICE9IFwidHJhY2tcIikgdGhyb3cgKG5ldyBFcnJvcignJykpO1xuICAgICAgICAkc2NvcGUuc3VibWlzc2lvbi50cmFja0lEID0gcmVzLmRhdGEuaWQ7XG4gICAgICAgICRzY29wZS5zdWJtaXNzaW9uLnRpdGxlID0gcmVzLmRhdGEudGl0bGU7XG4gICAgICAgICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrVVJMID0gcmVzLmRhdGEudHJhY2tVUkw7XG4gICAgICAgIFNDLm9FbWJlZCgkc2NvcGUuc3VibWlzc2lvbi50cmFja1VSTCwge1xuICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLFxuICAgICAgICAgIGF1dG9fcGxheTogZmFsc2UsXG4gICAgICAgICAgbWF4aGVpZ2h0OiAxNTBcbiAgICAgICAgfSlcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUGxheWVyJykuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAkc2NvcGUubm90Rm91bmQgPSBmYWxzZTtcbiAgICAgIH0pLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgaWYgKGVyci5zdGF0dXMgIT0gNDAzKSB7XG4gICAgICAgICQuWmVicmFfRGlhbG9nKFwiV2UgYXJlIG5vdCBhbGxvd2VkIHRvIGFjY2VzcyB0cmFja3MgYnkgdGhpcyBhcnRpc3Qgd2l0aCB0aGUgU291bmRjbG91ZCBBUEkuIFdlIGFwb2xvZ2l6ZSBmb3IgdGhlIGluY29udmVuaWVuY2UsIGFuZCB3ZSBhcmUgd29ya2luZyB3aXRoIFNvdW5kY2xvdWQgdG8gcmVzb2x2ZSB0aGlzIGlzc3VlLlwiKTtcbiAgICAgICAgICAgICRzY29wZS5ub3RGb3VuZCA9IHRydWU7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrVVJMID0gJHNjb3BlLnVybDtcbiAgICAgICAgICAgIFNDLm9FbWJlZCgkc2NvcGUuc3VibWlzc2lvbi50cmFja1VSTCwge1xuICAgICAgICAgICAgICBlbGVtZW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKSxcbiAgICAgICAgICAgICAgYXV0b19wbGF5OiBmYWxzZSxcbiAgICAgICAgICAgICAgbWF4aGVpZ2h0OiAxNTBcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAkc2NvcGUuc3VibWlzc2lvbi50cmFja0lEID0gbnVsbDtcblxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXInKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gICRzY29wZS5zdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoISRzY29wZS5zdWJtaXNzaW9uLmVtYWlsIHx8ICEkc2NvcGUuc3VibWlzc2lvbi5uYW1lKSB7XG4gICAgICAkLlplYnJhX0RpYWxvZyhcIlBsZWFzZSBmaWxsIGluIGFsbCBmaWVsZHNcIilcbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgJGh0dHAucG9zdCgnL2FwaS9zdWJtaXNzaW9ucycsIHtcbiAgICAgICAgZW1haWw6ICRzY29wZS5zdWJtaXNzaW9uLmVtYWlsLFxuICAgICAgICB0cmFja0lEOiAkc2NvcGUuc3VibWlzc2lvbi50cmFja0lELFxuICAgICAgICBuYW1lOiAkc2NvcGUuc3VibWlzc2lvbi5uYW1lLFxuICAgICAgICB0aXRsZTogJHNjb3BlLnN1Ym1pc3Npb24udGl0bGUsXG4gICAgICAgIHRyYWNrVVJMOiAkc2NvcGUuc3VibWlzc2lvbi50cmFja1VSTCxcbiAgICAgICAgY2hhbm5lbElEUzogW10sXG4gICAgICAgIGludm9pY2VJRFM6IFtdLFxuICAgICAgICB1c2VySUQ6IHVzZXJJRCxcbiAgICAgICAgZ2VucmU6ICRzY29wZS5zdWJtaXNzaW9uLmdlbnJlXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICQuWmVicmFfRGlhbG9nKFwiWW91ciBzb25nIGhhcyBiZWVuIHN1Ym1pdHRlZCBhbmQgd2lsbCBiZSByZXZpZXdlZCBzb29uLlwiKTtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICRzY29wZS5ub3RGb3VuZCA9IGZhbHNlO1xuICAgICAgICAgICRzY29wZS5zdWJtaXNzaW9uID0ge307XG4gICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUGxheWVyJykuc3R5bGUudmlzaWJpbGl0eSA9IFwiaGlkZGVuXCI7XG4gICAgICAgICAgJHNjb3BlLnVybCA9IFwiXCI7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICQuWmVicmFfRGlhbG9nKFwiRXJyb3I6IENvdWxkIG5vdCBzdWJtaXQgc29uZy5cIik7XG4gICAgICB9KTtcbiAgICB9XG4gIH1cbiAgXG4gICRzY29wZS5nZXRDdXN0b21pemVTZXR0aW5ncz1mdW5jdGlvbigpXG4gIHtcbiAgICB2YXIgdWlkID0gJGxvY2F0aW9uLnNlYXJjaCgpLnVzZXJpZDtcbiAgICBjdXN0b21pemVTZXJ2aWNlLmdldEN1c3RvbVBhZ2VTZXR0aW5ncyh1aWQpXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpeyAgICAgIFxuICAgICAgJHNjb3BlLmN1c3RvbWl6ZVNldHRpbmdzID0gcmVzcG9uc2U7XG4gICAgfSk7ICAgIFxuICB9XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdjdXN0b21pemVzdWJtaXNzaW9uJywge1xuICAgIHVybDogJy9hZG1pbi9jdXN0b21pemVzdWJtaXNzaW9uJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2N1c3RvbWl6ZVN1Ym1pc3Npb24vdmlld3MvY3VzdG9taXplU3VibWlzc2lvbi5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnQ3VzdG9taXplU3VibWlzc2lvbkNvbnRyb2xsZXInXG4gIH0pXG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ0N1c3RvbWl6ZVN1Ym1pc3Npb25Db250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCBBdXRoU2VydmljZSwgU2Vzc2lvblNlcnZpY2UsJHNjZSxjdXN0b21pemVTZXJ2aWNlKSB7XG4gIGlmICghU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSB7XG4gICAgJHN0YXRlLmdvKCdhZG1pbicpO1xuICB9XG4gICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xuICAkc2NvcGUuc3VibWlzc2lvbiA9IHt9OyBcbiAgJHNjb3BlLmdlbnJlQXJyYXkgPSBbXG4gICAgJ0FsdGVybmF0aXZlIFJvY2snLFxuICAgICdBbWJpZW50JyxcbiAgICAnQ3JlYXRpdmUnLFxuICAgICdDaGlsbCcsXG4gICAgJ0NsYXNzaWNhbCcsXG4gICAgJ0NvdW50cnknLFxuICAgICdEYW5jZSAmIEVETScsXG4gICAgJ0RhbmNlaGFsbCcsXG4gICAgJ0RlZXAgSG91c2UnLFxuICAgICdEaXNjbycsXG4gICAgJ0RydW0gJiBCYXNzJyxcbiAgICAnRHVic3RlcCcsXG4gICAgJ0VsZWN0cm9uaWMnLFxuICAgICdGZXN0aXZhbCcsXG4gICAgJ0ZvbGsnLFxuICAgICdIaXAtSG9wL1JOQicsXG4gICAgJ0hvdXNlJyxcbiAgICAnSW5kaWUvQWx0ZXJuYXRpdmUnLFxuICAgICdMYXRpbicsXG4gICAgJ1RyYXAnLFxuICAgICdWb2NhbGlzdHMvU2luZ2VyLVNvbmd3cml0ZXInXG4gIF07XG5cbiAgJHNjb3BlLnNhdmVTZXR0aW5ncz1mdW5jdGlvbigpe1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAvL2N1c3RvbWl6ZVNlcnZpY2UudXBsb2FkRmlsZSgkc2NvcGUuYmFja0ltYWdlLmZpbGUpLnRoZW4oZnVuY3Rpb24ocmVzKXtcbiAgICAgIC8vdmFyIGJhY2tJbWFnZT1yZXMuTG9jYXRpb247XG4gIFx0ICAvLyRzY29wZS5wb3N0RGF0YS5iYWNrZ3JvdW5kaW1hZ2U9YmFja0ltYWdlO1xuICAgICAgJHNjb3BlLnBvc3REYXRhLnVzZXJJRCA9ICRzY29wZS51c2VyLl9pZDtcbiAgICAgIHZhciBzdWJIZWFkaW5nVGV4dCA9ICgkc2NvcGUucG9zdERhdGEuc3ViSGVhZGluZy50ZXh0ID8gJHNjb3BlLnBvc3REYXRhLnN1YkhlYWRpbmcudGV4dC5yZXBsYWNlKC9cXHI/XFxuL2csICc8YnIgLz4nKSA6ICcnKTtcbiAgICAgICRzY29wZS5wb3N0RGF0YS5zdWJIZWFkaW5nLnRleHQgPSBzdWJIZWFkaW5nVGV4dDsgICAgIFxuICAgICAgY3VzdG9taXplU2VydmljZS5hZGRDdXN0b21pemUoJHNjb3BlLnBvc3REYXRhKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpeyAgXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICQuWmVicmFfRGlhbG9nKFwiU2F2ZWQgU3VjY2Vzc2Z1bGx5XCIpOyAgICAgICAgXG4gICAgICB9KS5jYXRjaChmdW5jdGlvbiAoZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJlclwiLGVycm9yKTtcbiAgICAgIH0pO1xuICAgIC8vfSkgXG4gIH1cblxuICAkc2NvcGUuZ2V0Q3VzdG9taXplU2V0dGluZ3M9ZnVuY3Rpb24oKVxuICB7XG4gICAgY3VzdG9taXplU2VydmljZS5nZXRDdXN0b21QYWdlU2V0dGluZ3MoJHNjb3BlLnVzZXIuX2lkKVxuICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKXtcbiAgICAgIGlmKHJlc3BvbnNlKXtcbiAgICAgICRzY29wZS5wb3N0RGF0YSA9IHJlc3BvbnNlO1xuICAgICAgJHNjb3BlLmN1c3RvbWl6ZVNldHRpbmdzID0gcmVzcG9uc2U7XG4gICAgICB9XG4gICAgICBlbHNle1xuICAgICAgICAkc2NvcGUucG9zdERhdGEgPSB7XG4gICAgICAgICAgaGVhZGluZzoge1xuICAgICAgICAgICAgdGV4dDogXCJTdWJtaXNzaW9uIGZvciBQcm9tb3Rpb25cIixcbiAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgIGZvbnRTaXplOiAyMSxcbiAgICAgICAgICAgICAgZm9udENvbG9yOiAnIzk5OScsXG4gICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICdCb2xkJ1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgc3ViSGVhZGluZzoge1xuICAgICAgICAgICAgdGV4dDogXCJPdXIgbWlzc2lvbiBpcyB0byBzaW1wbHkgYnJpbmcgdGhlIGJlc3QgbXVzaWMgdG8gdGhlIHBlb3BsZS4gV2UgYWxzbyBoYXZlIGEgc3Ryb25nIGNvbW1pdG1lbnQgdG8gcHJvdmlkaW5nIGZlZWRiYWNrIGFuZCBndWlkYW5jZSBmb3IgcmlzaW5nIGFydGlzdHMuIFdlIGd1YXJhbnRlZSB0aGF0IHlvdXIgc29uZyB3aWxsIGJlIGxpc3RlbmVkIHRvIGFuZCBjcml0aXF1ZWQgYnkgb3VyIGRlZGljYXRlZCBzdGFmZiBpZiBpdCBwYXNzZXMgb3VyIHN1Ym1pc3Npb24gcHJvY2Vzcy4gQWx0aG91Z2ggd2UgY2Fubm90IGd1YXJhbnRlZSBzdXBwb3J0IGZvciB5b3VyIHN1Ym1pc3Npb24gb24gb3VyIHByb21vdGlvbmFsIHBsYXRmb3JtcyBzdWNoIGFzIFNvdW5kQ2xvdWQsIFlvdVR1YmUsIGFuZCBGYWNlYm9vaywgd2Ugd2lsbCBtYWtlIHN1cmUgdG8gZ2V0IGJhY2sgdG8geW91IHdpdGggYSByZXNwb25zZS5cIixcbiAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgIGZvbnRTaXplOiAxNixcbiAgICAgICAgICAgICAgZm9udENvbG9yOiAnIzdkNWE1YScsXG4gICAgICAgICAgICAgIGZvbnRXZWlnaHQ6J05vcm1hbCdcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIGlucHV0RmllbGRzOiB7XG4gICAgICAgICAgICBzdHlsZTp7XG4gICAgICAgICAgICAgIGJvcmRlcjogMSxcbiAgICAgICAgICAgICAgYm9yZGVyUmFkaXVzOiA0LFxuICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyNGNUQzQjUnLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAgYnV0dG9uOiB7XG4gICAgICAgICAgICB0ZXh0OiAnRW50ZXInLFxuICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgZm9udFNpemU6IDE1LFxuICAgICAgICAgICAgICBmb250Q29sb3I6ICcjZmZmJyxcbiAgICAgICAgICAgICAgYm9yZGVyOiAxLFxuICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IDQsXG4gICAgICAgICAgICAgIGJnQ29sb3I6ICcjRjVCQkJDJ1xuICAgICAgICAgICAgfSAgIFxuICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9KTsgICAgXG4gIH1cbn0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2F1dG9FbWFpbHNOZXcnLCB7XG4gICAgdXJsOiAnL2FkbWluL2RhdGFiYXNlL2F1dG9FbWFpbHMvbmV3JyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2RhdGFiYXNlL2F1dG9FbWFpbHMvYXV0b0VtYWlscy5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnQXV0b0VtYWlsc0NvbnRyb2xsZXInXG4gIH0pO1xufSk7XG5cbmFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2F1dG9FbWFpbHNFZGl0Jywge1xuICAgIHVybDogJy9hZG1pbi9kYXRhYmFzZS9hdXRvRW1haWxzL2VkaXQvOnRlbXBsYXRlSWQnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvZGF0YWJhc2UvYXV0b0VtYWlscy9hdXRvRW1haWxzLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdBdXRvRW1haWxzQ29udHJvbGxlcicsXG4gICAgLy8gcmVzb2x2ZToge1xuICAgIC8vICAgdGVtcGxhdGU6IGZ1bmN0aW9uKCRodHRwKSB7XG4gICAgLy8gICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZGF0YWJhc2UvYXV0b0VtYWlscy9iaXdlZWtseT9pc0FydGlzdD10cnVlJylcbiAgICAvLyAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAvLyAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IHJlcy5kYXRhO1xuICAgIC8vICAgICAgICAgaWYgKHRlbXBsYXRlKSB7XG4gICAgLy8gICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICAvLyAgICAgICAgIH0gZWxzZSB7XG4gICAgLy8gICAgICAgICAgIHJldHVybiB7XG4gICAgLy8gICAgICAgICAgICAgcHVycG9zZTogXCJCaXdlZWtseSBFbWFpbFwiXG4gICAgLy8gICAgICAgICAgIH1cbiAgICAvLyAgICAgICAgIH1cbiAgICAvLyAgICAgICB9KVxuICAgIC8vICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgIC8vICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJFUlJPUjogU29tZXRoaW5nIHdlbnQgd3JvbmcuXCIpO1xuICAgIC8vICAgICAgIH0pXG4gICAgLy8gICB9XG4gICAgLy8gfVxuICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignQXV0b0VtYWlsc0NvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsICRzdGF0ZVBhcmFtcywgQXV0aFNlcnZpY2UpIHtcbiAgJHNjb3BlLmxvZ2dlZEluID0gZmFsc2U7XG5cblxuICAkc2NvcGUuaXNTdGF0ZVBhcmFtcyA9IGZhbHNlO1xuICBpZiAoJHN0YXRlUGFyYW1zLnRlbXBsYXRlSWQpIHtcbiAgICAkc2NvcGUuaXNTdGF0ZVBhcmFtcyA9IHRydWU7XG4gIH1cbiAgLy8gJHNjb3BlLnRlbXBsYXRlID0gdGVtcGxhdGU7XG5cbiAgJHNjb3BlLnRlbXBsYXRlID0ge1xuICAgIGlzQXJ0aXN0OiBmYWxzZVxuICB9O1xuXG4gICRzY29wZS5nZXRUZW1wbGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAgIGlmICgkc3RhdGVQYXJhbXMudGVtcGxhdGVJZCkge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgJGh0dHAuZ2V0KCcvYXBpL2RhdGFiYXNlL2F1dG9FbWFpbHM/dGVtcGxhdGVJZD0nICsgJHN0YXRlUGFyYW1zLnRlbXBsYXRlSWQpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IHJlcy5kYXRhO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgaWYgKHRlbXBsYXRlKSB7XG4gICAgICAgICAgICAkc2NvcGUudGVtcGxhdGUgPSB0ZW1wbGF0ZTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgJHNjb3BlLnRlbXBsYXRlID0ge307XG4gICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkVSUk9SOiBTb21ldGhpbmcgd2VudCB3cm9uZy5cIik7XG4gICAgICAgIH0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICB9O1xuXG4gIC8vIGNvbnNvbGUubG9nKHRlbXBsYXRlKTtcbiAgJHNjb3BlLnNhdmUgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS9hdXRvRW1haWxzLycsICRzY29wZS50ZW1wbGF0ZSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAkLlplYnJhX0RpYWxvZyhcIlNhdmVkIGVtYWlsIHRlbXBsYXRlLlwiKVxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkVSUk9SOiBNZXNzYWdlIGNvdWxkIG5vdCBzYXZlLlwiKVxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSk7XG4gIH1cblxuICAvLyAkc2NvcGUubG9naW4gPSBmdW5jdGlvbigpIHtcbiAgLy8gICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gIC8vICAgJGh0dHAucG9zdCgnL2FwaS9sb2dpbicsIHtcbiAgLy8gICAgIHBhc3N3b3JkOiAkc2NvcGUucGFzc3dvcmRcbiAgLy8gICB9KS50aGVuKGZ1bmN0aW9uKCkge1xuICAvLyAgICAgJHJvb3RTY29wZS5wYXNzd29yZCA9ICRzY29wZS5wYXNzd29yZDtcbiAgLy8gICAgICRzY29wZS5sb2dnZWRJbiA9IHRydWU7XG4gIC8vICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAvLyAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAvLyAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgLy8gICAgICQuWmVicmFfRGlhbG9nKCdXcm9uZyBQYXNzd29yZCcpO1xuICAvLyAgIH0pO1xuICAvLyB9XG5cbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICRodHRwLmdldCgnL2FwaS9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2FkbWluJztcbiAgICB9KS5jYXRjaChmdW5jdGlvbihlcnIpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAkLlplYnJhX0RpYWxvZygnV3JvbmcgUGFzc3dvcmQnKTtcbiAgICB9KTtcbiAgfVxuXG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhdXRvRW1haWxzTGlzdCcsIHtcbiAgICB1cmw6ICcvYWRtaW4vZGF0YWJhc2UvYXV0b0VtYWlscycsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9kYXRhYmFzZS9hdXRvRW1haWxzL2F1dG9FbWFpbHNMaXN0Lmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdBdXRvRW1haWxzTGlzdENvbnRyb2xsZXInLFxuICAgIHJlc29sdmU6IHtcbiAgICAgIHRlbXBsYXRlczogZnVuY3Rpb24oJGh0dHApIHtcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9kYXRhYmFzZS9hdXRvRW1haWxzJylcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAgIHZhciB0ZW1wbGF0ZSA9IHJlcy5kYXRhO1xuICAgICAgICAgICAgaWYgKHRlbXBsYXRlKSB7XG4gICAgICAgICAgICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgcHVycG9zZTogXCJCaXdlZWtseSBFbWFpbFwiXG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KVxuICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJFUlJPUjogU29tZXRoaW5nIHdlbnQgd3JvbmcuXCIpO1xuICAgICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignQXV0b0VtYWlsc0xpc3RDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCBBdXRoU2VydmljZSwgdGVtcGxhdGVzKSB7XG4gICRzY29wZS5sb2dnZWRJbiA9IGZhbHNlO1xuICAkc2NvcGUudGVtcGxhdGVzID0gdGVtcGxhdGVzO1xuXG4gIC8vICRzY29wZS5nZXRUZW1wbGF0ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgLy8gICAkaHR0cC5nZXQoJy9hcGkvZGF0YWJhc2UvYXV0b0VtYWlscy9iaXdlZWtseT9pc0FydGlzdD0nICsgU3RyaW5nKCRzY29wZS50ZW1wbGF0ZS5pc0FydGlzdCkpXG4gIC8vICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgLy8gICAgICAgdmFyIHRlbXBsYXRlID0gcmVzLmRhdGE7XG4gIC8vICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gIC8vICAgICAgIGlmICh0ZW1wbGF0ZSkge1xuICAvLyAgICAgICAgICRzY29wZS50ZW1wbGF0ZSA9IHRlbXBsYXRlO1xuICAvLyAgICAgICB9IGVsc2Uge1xuICAvLyAgICAgICAgICRzY29wZS50ZW1wbGF0ZSA9IHtcbiAgLy8gICAgICAgICAgIHB1cnBvc2U6IFwiQml3ZWVrbHkgRW1haWxcIixcbiAgLy8gICAgICAgICAgIGlzQXJ0aXN0OiBmYWxzZVxuICAvLyAgICAgICAgIH07XG4gIC8vICAgICAgIH1cbiAgLy8gICAgIH0pXG4gIC8vICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgLy8gICAgICAgJC5aZWJyYV9EaWFsb2coXCJFUlJPUjogU29tZXRoaW5nIHdlbnQgd3JvbmcuXCIpO1xuICAvLyAgICAgfSk7XG4gIC8vIH07XG5cbiAgLy8gY29uc29sZS5sb2codGVtcGxhdGUpO1xuICAkc2NvcGUuc2F2ZSA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL2F1dG9FbWFpbHMnLCAkc2NvcGUudGVtcGxhdGUpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJTYXZlZCBlbWFpbC5cIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICQuWmVicmFfRGlhbG9nKFwiRVJST1I6IE1lc3NhZ2UgY291bGQgbm90IHNhdmUuXCIpXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICB9KTtcbiAgfVxuXG4gIC8vICRzY29wZS5sb2dpbiA9IGZ1bmN0aW9uKCkge1xuICAvLyAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgLy8gICAkaHR0cC5wb3N0KCcvYXBpL2xvZ2luJywge1xuICAvLyAgICAgcGFzc3dvcmQ6ICRzY29wZS5wYXNzd29yZFxuICAvLyAgIH0pLnRoZW4oZnVuY3Rpb24oKSB7XG4gIC8vICAgICAkcm9vdFNjb3BlLnBhc3N3b3JkID0gJHNjb3BlLnBhc3N3b3JkO1xuICAvLyAgICAgJHNjb3BlLmxvZ2dlZEluID0gdHJ1ZTtcbiAgLy8gICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gIC8vICAgfSkuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gIC8vICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAvLyAgICAgJC5aZWJyYV9EaWFsb2coJ1dyb25nIFBhc3N3b3JkJyk7XG4gIC8vICAgfSk7XG4gIC8vIH1cblxuICAkc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24oKSB7XG4gICAgJGh0dHAuZ2V0KCcvYXBpL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvYWRtaW4nO1xuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICQuWmVicmFfRGlhbG9nKCdXcm9uZyBQYXNzd29yZCcpO1xuICAgIH0pO1xuICB9XG5cbn0pIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZG93bmxvYWRHYXRlJywge1xuICAgIHVybDogJy9hZG1pbi9kb3dubG9hZEdhdGUnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvZG93bmxvYWRUcmFjay92aWV3cy9hZG1pbkRMR2F0ZS5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnQWRtaW5ETEdhdGVDb250cm9sbGVyJ1xuICB9KTtcbn0pO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkb3dubG9hZEdhdGVMaXN0Jywge1xuICAgIHVybDogJy9hZG1pbi9kb3dubG9hZEdhdGUvbGlzdCcsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9kb3dubG9hZFRyYWNrL3ZpZXdzL2FkbWluRExHYXRlLmxpc3QuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ0FkbWluRExHYXRlQ29udHJvbGxlcidcbiAgfSk7XG59KTtcblxuYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnZG93bmxvYWRHYXRlRWRpdCcsIHtcbiAgICB1cmw6ICcvYWRtaW4vZG93bmxvYWRHYXRlL2VkaXQvOmdhdGV3YXlJRCcsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9kb3dubG9hZFRyYWNrL3ZpZXdzL2FkbWluRExHYXRlLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdBZG1pbkRMR2F0ZUNvbnRyb2xsZXInXG4gIH0pO1xufSk7XG5cblxuYXBwLmNvbnRyb2xsZXIoJ0FkbWluRExHYXRlQ29udHJvbGxlcicsIFsnJHJvb3RTY29wZScsXG4gICckc3RhdGUnLFxuICAnJHN0YXRlUGFyYW1zJyxcbiAgJyRzY29wZScsXG4gICckaHR0cCcsXG4gICckbG9jYXRpb24nLFxuICAnJHdpbmRvdycsXG4gICckdWliTW9kYWwnLFxuICAnU2Vzc2lvblNlcnZpY2UnLFxuICAnQWRtaW5ETEdhdGVTZXJ2aWNlJyxcbiAgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc3RhdGVQYXJhbXMsICRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgJHdpbmRvdywgJHVpYk1vZGFsLCBTZXNzaW9uU2VydmljZSwgQWRtaW5ETEdhdGVTZXJ2aWNlKSB7XG4gICAgaWYgKCFTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkpIHtcbiAgICAgICRzdGF0ZS5nbygnYWRtaW4nKTtcbiAgICB9XG4gICAgLyogSW5pdCBib29sZWFuIHZhcmlhYmxlcyBmb3Igc2hvdy9oaWRlIGFuZCBvdGhlciBmdW5jdGlvbmFsaXRpZXMgKi9cbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gZmFsc2U7XG4gICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICB2YWw6ICcnLFxuICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICB9O1xuXG4gICAgLyogSW5pdCBEb3dubG9hZCBHYXRld2F5IGZvcm0gZGF0YSAqL1xuXG4gICAgJHNjb3BlLnRyYWNrID0ge1xuICAgICAgYXJ0aXN0VXNlcm5hbWU6ICdMYSBUcm9waWPDoWwnLFxuICAgICAgdHJhY2tUaXRsZTogJ1BhbnRlb25lIC8gVHJhdmVsJyxcbiAgICAgIHRyYWNrQXJ0d29ya1VSTDogJ2Fzc2V0cy9pbWFnZXMvd2hvLXdlLWFyZS5wbmcnLFxuICAgICAgU01MaW5rczogW10sXG4gICAgICBsaWtlOiBmYWxzZSxcbiAgICAgIGNvbW1lbnQ6IGZhbHNlLFxuICAgICAgcmVwb3N0OiBmYWxzZSxcbiAgICAgIGFydGlzdHM6IFt7XG4gICAgICAgIHVybDogJycsXG4gICAgICAgIGF2YXRhcjogJ2Fzc2V0cy9pbWFnZXMvd2hvLXdlLWFyZS5wbmcnLFxuICAgICAgICB1c2VybmFtZTogJycsXG4gICAgICAgIGlkOiAtMSxcbiAgICAgICAgcGVybWFuZW50TGluazogZmFsc2VcbiAgICAgIH1dLFxuICAgICAgcGxheWxpc3RzOiBbe1xuICAgICAgICB1cmw6ICcnLFxuICAgICAgICBhdmF0YXI6ICcnLFxuICAgICAgICB0aXRsZTogJycsXG4gICAgICAgIGlkOiAnJ1xuICAgICAgfV1cbiAgICB9O1xuXG4gICAgLyogSW5pdCBkb3dubG9hZEdhdGV3YXkgbGlzdCAqL1xuXG4gICAgJHNjb3BlLmRvd25sb2FkR2F0ZXdheUxpc3QgPSBbXTtcblxuICAgIC8qIEluaXQgbW9kYWwgaW5zdGFuY2UgdmFyaWFibGVzIGFuZCBtZXRob2RzICovXG5cbiAgICAkc2NvcGUubW9kYWxJbnN0YW5jZSA9IHt9O1xuICAgICRzY29wZS5tb2RhbCA9IHt9O1xuICAgICRzY29wZS5vcGVuTW9kYWwgPSB7XG4gICAgICBkb3dubG9hZFVSTDogZnVuY3Rpb24oZG93bmxvYWRVUkwpIHtcbiAgICAgICAgJHNjb3BlLm1vZGFsLmRvd25sb2FkVVJMID0gZG93bmxvYWRVUkw7XG4gICAgICAgICRzY29wZS5tb2RhbEluc3RhbmNlID0gJHVpYk1vZGFsLm9wZW4oe1xuICAgICAgICAgIGFuaW1hdGlvbjogdHJ1ZSxcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2Rvd25sb2FkVVJMLmh0bWwnLFxuICAgICAgICAgIGNvbnRyb2xsZXI6ICdBcnRpc3RUb29sc0NvbnRyb2xsZXInLFxuICAgICAgICAgIHNjb3BlOiAkc2NvcGVcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfTtcbiAgICAkc2NvcGUuY2xvc2VNb2RhbCA9IGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLm1vZGFsSW5zdGFuY2UuY2xvc2UoKTtcbiAgICB9XG5cbiAgICAvKiBJbml0IHByb2ZpbGUgKi9cbiAgICAkc2NvcGUucHJvZmlsZSA9IHt9O1xuXG4gICAgLyogTWV0aG9kIGZvciByZXNldHRpbmcgRG93bmxvYWQgR2F0ZXdheSBmb3JtICovXG5cbiAgICBmdW5jdGlvbiByZXNldERvd25sb2FkR2F0ZXdheSgpIHtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IGZhbHNlO1xuICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICAgIHZhbDogJycsXG4gICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgICB9O1xuXG4gICAgICAkc2NvcGUudHJhY2sgPSB7XG4gICAgICAgIGFydGlzdFVzZXJuYW1lOiAnTGEgVHJvcGljw6FsJyxcbiAgICAgICAgdHJhY2tUaXRsZTogJ1BhbnRlb25lIC8gVHJhdmVsJyxcbiAgICAgICAgdHJhY2tBcnR3b3JrVVJMOiAnYXNzZXRzL2ltYWdlcy93aG8td2UtYXJlLnBuZycsXG4gICAgICAgIFNNTGlua3M6IFtdLFxuICAgICAgICBsaWtlOiBmYWxzZSxcbiAgICAgICAgY29tbWVudDogZmFsc2UsXG4gICAgICAgIHJlcG9zdDogZmFsc2UsXG4gICAgICAgIGFydGlzdHM6IFt7XG4gICAgICAgICAgdXJsOiAnJyxcbiAgICAgICAgICBhdmF0YXI6ICdhc3NldHMvaW1hZ2VzL3doby13ZS1hcmUucG5nJyxcbiAgICAgICAgICB1c2VybmFtZTogJycsXG4gICAgICAgICAgaWQ6IC0xLFxuICAgICAgICAgIHBlcm1hbmVudExpbms6IGZhbHNlXG4gICAgICAgIH1dLFxuICAgICAgICBwbGF5bGlzdHM6IFt7XG4gICAgICAgICAgdXJsOiAnJyxcbiAgICAgICAgICBhdmF0YXI6ICcnLFxuICAgICAgICAgIHRpdGxlOiAnJyxcbiAgICAgICAgICBpZDogJydcbiAgICAgICAgfV1cbiAgICAgIH07XG4gICAgICBhbmd1bGFyLmVsZW1lbnQoXCJpbnB1dFt0eXBlPSdmaWxlJ11cIikudmFsKG51bGwpO1xuICAgIH1cblxuICAgIC8qIENoZWNrIGlmIHN0YXRlUGFyYW1zIGhhcyBnYXRld2F5SUQgdG8gaW5pdGlhdGUgZWRpdCAqL1xuICAgICRzY29wZS5jaGVja0lmRWRpdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCRzdGF0ZVBhcmFtcy5nYXRld2F5SUQpIHtcbiAgICAgICAgJHNjb3BlLmdldERvd25sb2FkR2F0ZXdheSgkc3RhdGVQYXJhbXMuZ2F0ZXdheUlEKTtcbiAgICAgICAgLy8gaWYoISRzdGF0ZVBhcmFtcy5kb3dubG9hZEdhdGV3YXkpIHtcbiAgICAgICAgLy8gICAkc2NvcGUuZ2V0RG93bmxvYWRHYXRld2F5KCRzdGF0ZVBhcmFtcy5nYXRld2F5SUQpO1xuICAgICAgICAvLyB9IGVsc2Uge1xuICAgICAgICAvLyAgICRzY29wZS50cmFjayA9ICRzdGF0ZVBhcmFtcy5kb3dubG9hZEdhdGV3YXk7XG4gICAgICAgIC8vIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICAkc2NvcGUudHJhY2tVUkxDaGFuZ2UgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgkc2NvcGUudHJhY2sudHJhY2tVUkwgIT09ICcnKSB7XG4gICAgICAgICRzY29wZS5pc1RyYWNrQXZhaWxhYmxlID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICAgQWRtaW5ETEdhdGVTZXJ2aWNlXG4gICAgICAgICAgLnJlc29sdmVEYXRhKHtcbiAgICAgICAgICAgIHVybDogJHNjb3BlLnRyYWNrLnRyYWNrVVJMXG4gICAgICAgICAgfSlcbiAgICAgICAgICAudGhlbihoYW5kbGVUcmFja0RhdGFBbmRHZXRQcm9maWxlcylcbiAgICAgICAgICAudGhlbihoYW5kbGVXZWJQcm9maWxlcylcbiAgICAgICAgICAuY2F0Y2goaGFuZGxlRXJyb3IpO1xuXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVRyYWNrRGF0YUFuZEdldFByb2ZpbGVzKHJlcykge1xuICAgICAgICAgICRzY29wZS50cmFjay50cmFja1RpdGxlID0gcmVzLmRhdGEudGl0bGU7XG4gICAgICAgICAgJHNjb3BlLnRyYWNrLnRyYWNrSUQgPSByZXMuZGF0YS5pZDtcbiAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0SUQgPSByZXMuZGF0YS51c2VyLmlkO1xuICAgICAgICAgICRzY29wZS50cmFjay50cmFja0FydHdvcmtVUkwgPSByZXMuZGF0YS5hcnR3b3JrX3VybCA/IHJlcy5kYXRhLmFydHdvcmtfdXJsLnJlcGxhY2UoJ2xhcmdlLmpwZycsICd0NTAweDUwMC5qcGcnKSA6ICcnO1xuICAgICAgICAgICRzY29wZS50cmFjay5hcnRpc3RBcnR3b3JrVVJMID0gcmVzLmRhdGEudXNlci5hdmF0YXJfdXJsID8gcmVzLmRhdGEudXNlci5hdmF0YXJfdXJsIDogJyc7XG4gICAgICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdFVSTCA9IHJlcy5kYXRhLnVzZXIucGVybWFsaW5rX3VybDtcbiAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0VXNlcm5hbWUgPSByZXMuZGF0YS51c2VyLnVzZXJuYW1lO1xuICAgICAgICAgICRzY29wZS50cmFjay5TTUxpbmtzID0gW107XG4gICAgICAgICAgcmV0dXJuIFNDLmdldCgnL3VzZXJzLycgKyAkc2NvcGUudHJhY2suYXJ0aXN0SUQgKyAnL3dlYi1wcm9maWxlcycpO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gaGFuZGxlV2ViUHJvZmlsZXMocHJvZmlsZXMpIHtcbiAgICAgICAgICBwcm9maWxlcy5mb3JFYWNoKGZ1bmN0aW9uKHByb2YpIHtcbiAgICAgICAgICAgIGlmIChbJ3R3aXR0ZXInLCAneW91dHViZScsICdmYWNlYm9vaycsICdzcG90aWZ5JywgJ3NvdW5kY2xvdWQnLCAnaW5zdGFncmFtJ10uaW5kZXhPZihwcm9mLnNlcnZpY2UpICE9IC0xKSB7XG4gICAgICAgICAgICAgICRzY29wZS50cmFjay5TTUxpbmtzLnB1c2goe1xuICAgICAgICAgICAgICAgIGtleTogcHJvZi5zZXJ2aWNlLFxuICAgICAgICAgICAgICAgIHZhbHVlOiBwcm9mLnVybFxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcbiAgICAgICAgICAkc2NvcGUuaXNUcmFja0F2YWlsYWJsZSA9IHRydWU7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKGVycikge1xuICAgICAgICAgICRzY29wZS50cmFjay50cmFja0lEID0gbnVsbDtcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZygnU29uZyBub3QgZm91bmQgb3IgZm9yYmlkZGVuJyk7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICAkc2NvcGUuYXJ0aXN0VVJMQ2hhbmdlID0gZnVuY3Rpb24oaW5kZXgpIHtcbiAgICAgIHZhciBhcnRpc3QgPSB7fTtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgIEFkbWluRExHYXRlU2VydmljZVxuICAgICAgICAucmVzb2x2ZURhdGEoe1xuICAgICAgICAgIHVybDogJHNjb3BlLnRyYWNrLmFydGlzdHNbaW5kZXhdLnVybFxuICAgICAgICB9KVxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0c1tpbmRleF0uYXZhdGFyID0gcmVzLmRhdGEuYXZhdGFyX3VybDtcbiAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0c1tpbmRleF0udXNlcm5hbWUgPSByZXMuZGF0YS51c2VybmFtZTtcbiAgICAgICAgICAkc2NvcGUudHJhY2suYXJ0aXN0c1tpbmRleF0uaWQgPSByZXMuZGF0YS5pZDtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9KVxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coJ0FydGlzdHMgbm90IGZvdW5kJyk7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgICRzY29wZS5hZGRQbGF5bGlzdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLnRyYWNrLnBsYXlsaXN0cy5wdXNoKHtcbiAgICAgICAgdXJsOiAnJyxcbiAgICAgICAgYXZhdGFyOiAnJyxcbiAgICAgICAgdGl0bGU6ICcnLFxuICAgICAgICBpZDogJydcbiAgICAgIH0pO1xuICAgIH1cbiAgICAkc2NvcGUucmVtb3ZlUGxheWxpc3QgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgJHNjb3BlLnRyYWNrLnBsYXlsaXN0cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cbiAgICAkc2NvcGUucGxheWxpc3RVUkxDaGFuZ2UgPSBmdW5jdGlvbihpbmRleCkge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgQWRtaW5ETEdhdGVTZXJ2aWNlXG4gICAgICAgIC5yZXNvbHZlRGF0YSh7XG4gICAgICAgICAgdXJsOiAkc2NvcGUudHJhY2sucGxheWxpc3RzW2luZGV4XS51cmxcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgJHNjb3BlLnRyYWNrLnBsYXlsaXN0c1tpbmRleF0uYXZhdGFyID0gcmVzLmRhdGEuYXJ0d29ya191cmw7XG4gICAgICAgICAgJHNjb3BlLnRyYWNrLnBsYXlsaXN0c1tpbmRleF0udGl0bGUgPSByZXMuZGF0YS50aXRsZTtcbiAgICAgICAgICAkc2NvcGUudHJhY2sucGxheWxpc3RzW2luZGV4XS5pZCA9IHJlcy5kYXRhLmlkO1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICQuWmVicmFfRGlhbG9nKCdQbGF5bGlzdCBub3QgZm91bmQnKTtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9KVxuICAgIH1cblxuXG4gICAgJHNjb3BlLnJlbW92ZUFydGlzdCA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAkc2NvcGUudHJhY2suYXJ0aXN0cy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH1cblxuICAgICRzY29wZS5hZGRBcnRpc3QgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgkc2NvcGUudHJhY2suYXJ0aXN0cy5sZW5ndGggPiAyKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgJHNjb3BlLnRyYWNrLmFydGlzdHMucHVzaCh7XG4gICAgICAgIHVybDogJycsXG4gICAgICAgIGF2YXRhcjogJ2Fzc2V0cy9pbWFnZXMvd2hvLXdlLWFyZS5wbmcnLFxuICAgICAgICB1c2VybmFtZTogJycsXG4gICAgICAgIGlkOiAtMVxuICAgICAgfSk7XG4gICAgfVxuXG4gICAgJHNjb3BlLmFkZFNNTGluayA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8gZXh0ZXJuYWxTTUxpbmtzKys7XG4gICAgICAvLyAkc2NvcGUudHJhY2suU01MaW5rc1sna2V5JyArIGV4dGVybmFsU01MaW5rc10gPSAnJztcbiAgICAgICRzY29wZS50cmFjay5TTUxpbmtzLnB1c2goe1xuICAgICAgICBrZXk6ICcnLFxuICAgICAgICB2YWx1ZTogJydcbiAgICAgIH0pO1xuICAgIH07XG4gICAgJHNjb3BlLnJlbW92ZVNNTGluayA9IGZ1bmN0aW9uKGluZGV4KSB7XG4gICAgICAkc2NvcGUudHJhY2suU01MaW5rcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIH07XG4gICAgJHNjb3BlLlNNTGlua0NoYW5nZSA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cbiAgICAgIGZ1bmN0aW9uIGdldExvY2F0aW9uKGhyZWYpIHtcbiAgICAgICAgdmFyIGxvY2F0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIik7XG4gICAgICAgIGxvY2F0aW9uLmhyZWYgPSBocmVmO1xuICAgICAgICBpZiAobG9jYXRpb24uaG9zdCA9PSBcIlwiKSB7XG4gICAgICAgICAgbG9jYXRpb24uaHJlZiA9IGxvY2F0aW9uLmhyZWY7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGxvY2F0aW9uO1xuICAgICAgfVxuXG4gICAgICB2YXIgbG9jYXRpb24gPSBnZXRMb2NhdGlvbigkc2NvcGUudHJhY2suU01MaW5rc1tpbmRleF0udmFsdWUpO1xuICAgICAgdmFyIGhvc3QgPSBsb2NhdGlvbi5ob3N0bmFtZS5zcGxpdCgnLicpWzBdO1xuICAgICAgdmFyIGZpbmRMaW5rID0gJHNjb3BlLnRyYWNrLlNNTGlua3MuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGl0ZW0ua2V5ID09PSBob3N0O1xuICAgICAgfSk7XG4gICAgICBpZiAoZmluZExpbmsubGVuZ3RoID4gMCkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICAkc2NvcGUudHJhY2suU01MaW5rc1tpbmRleF0ua2V5ID0gaG9zdDtcbiAgICB9O1xuXG4gICAgJHNjb3BlLnNhdmVEb3dubG9hZEdhdGUgPSBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghJHNjb3BlLnRyYWNrLnRyYWNrSUQpIHtcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coJ1RyYWNrIE5vdCBGb3VuZCcpO1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICB2YXIgc2VuZE9iaiA9IG5ldyBGb3JtRGF0YSgpO1xuXG4gICAgICAvKiBBcHBlbmQgZGF0YSB0byBzZW5kT2JqIHN0YXJ0ICovXG5cbiAgICAgIC8qIFRyYWNrICovXG4gICAgICBmb3IgKHZhciBwcm9wIGluICRzY29wZS50cmFjaykge1xuICAgICAgICBzZW5kT2JqLmFwcGVuZChwcm9wLCAkc2NvcGUudHJhY2tbcHJvcF0pO1xuICAgICAgfVxuXG4gICAgICAvKiBhcnRpc3RzICovXG5cbiAgICAgIHZhciBhcnRpc3RzID0gJHNjb3BlLnRyYWNrLmFydGlzdHMuZmlsdGVyKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgcmV0dXJuIGl0ZW0uaWQgIT09IC0xO1xuICAgICAgfSkubWFwKGZ1bmN0aW9uKGl0ZW0pIHtcbiAgICAgICAgZGVsZXRlIGl0ZW1bJyQkaGFzaEtleSddO1xuICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgIH0pO1xuICAgICAgc2VuZE9iai5hcHBlbmQoJ2FydGlzdHMnLCBKU09OLnN0cmluZ2lmeShhcnRpc3RzKSk7XG5cbiAgICAgIC8qIHBsYXlsaXN0cyAqL1xuXG4gICAgICB2YXIgcGxheWxpc3RzID0gJHNjb3BlLnRyYWNrLnBsYXlsaXN0cy5maWx0ZXIoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICByZXR1cm4gaXRlbS5pZCAhPT0gLTE7XG4gICAgICB9KS5tYXAoZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBkZWxldGUgaXRlbVsnJCRoYXNoS2V5J107XG4gICAgICAgIHJldHVybiBpdGVtO1xuICAgICAgfSk7XG4gICAgICBzZW5kT2JqLmFwcGVuZCgncGxheWxpc3RzJywgSlNPTi5zdHJpbmdpZnkocGxheWxpc3RzKSk7XG5cbiAgICAgIC8qIFNNTGlua3MgKi9cblxuICAgICAgdmFyIFNNTGlua3MgPSB7fTtcbiAgICAgICRzY29wZS50cmFjay5TTUxpbmtzLmZvckVhY2goZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICBTTUxpbmtzW2l0ZW0ua2V5XSA9IGl0ZW0udmFsdWU7XG4gICAgICB9KTtcbiAgICAgIHNlbmRPYmouYXBwZW5kKCdTTUxpbmtzJywgSlNPTi5zdHJpbmdpZnkoU01MaW5rcykpO1xuXG4gICAgICAvKiBBcHBlbmQgZGF0YSB0byBzZW5kT2JqIGVuZCAqL1xuXG4gICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgIHVybDogJy9hcGkvZGF0YWJhc2UvZG93bmxvYWR1cmwnLFxuICAgICAgICBoZWFkZXJzOiB7XG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6IHVuZGVmaW5lZFxuICAgICAgICB9LFxuICAgICAgICB0cmFuc2Zvcm1SZXF1ZXN0OiBhbmd1bGFyLmlkZW50aXR5LFxuICAgICAgICBkYXRhOiBzZW5kT2JqXG4gICAgICB9O1xuICAgICAgJGh0dHAob3B0aW9ucylcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICBpZiAoJHNjb3BlLnRyYWNrLl9pZCkge1xuICAgICAgICAgICAgLy8gJHNjb3BlLm9wZW5Nb2RhbC5kb3dubG9hZFVSTChyZXMuZGF0YS50cmFja1VSTCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuICAgICAgICAgIHJlc2V0RG93bmxvYWRHYXRld2F5KCk7XG4gICAgICAgICAgJHNjb3BlLm9wZW5Nb2RhbC5kb3dubG9hZFVSTChyZXMuZGF0YSk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJFUlJPUjogRXJyb3IgaW4gc2F2aW5nIHVybFwiKTtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xuICAgICAgJGh0dHAucG9zdCgnL2FwaS9sb2dvdXQnKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICBTZXNzaW9uU2VydmljZS5kZWxldGVVc2VyKCk7XG4gICAgICAgICRzdGF0ZS5nbygnYWRtaW4nKTtcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICAkc2NvcGUuc2hvd1Byb2ZpbGVJbmZvID0gZnVuY3Rpb24oKSB7XG4gICAgICAkc2NvcGUucHJvZmlsZSA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcbiAgICB9XG5cbiAgICAkc2NvcGUuZ2V0RG93bmxvYWRMaXN0ID0gZnVuY3Rpb24oKSB7XG4gICAgICBBZG1pbkRMR2F0ZVNlcnZpY2VcbiAgICAgICAgLmdldERvd25sb2FkTGlzdCgpXG4gICAgICAgIC50aGVuKGhhbmRsZVJlc3BvbnNlKVxuICAgICAgICAuY2F0Y2goaGFuZGxlRXJyb3IpO1xuXG4gICAgICBmdW5jdGlvbiBoYW5kbGVSZXNwb25zZShyZXMpIHtcbiAgICAgICAgJHNjb3BlLmRvd25sb2FkR2F0ZXdheUxpc3QgPSByZXMuZGF0YTtcbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gaGFuZGxlRXJyb3IocmVzKSB7XG5cbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiBNZXRob2QgZm9yIGdldHRpbmcgRG93bmxvYWRHYXRld2F5IGluIGNhc2Ugb2YgZWRpdCAqL1xuXG4gICAgJHNjb3BlLmdldERvd25sb2FkR2F0ZXdheSA9IGZ1bmN0aW9uKGRvd25sb2FkR2F0ZVdheUlEKSB7XG4gICAgICAvLyByZXNldERvd25sb2FkR2F0ZXdheSgpO1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgQWRtaW5ETEdhdGVTZXJ2aWNlXG4gICAgICAgIC5nZXREb3dubG9hZEdhdGV3YXkoe1xuICAgICAgICAgIGlkOiBkb3dubG9hZEdhdGVXYXlJRFxuICAgICAgICB9KVxuICAgICAgICAudGhlbihoYW5kbGVSZXNwb25zZSlcbiAgICAgICAgLmNhdGNoKGhhbmRsZUVycm9yKTtcblxuICAgICAgZnVuY3Rpb24gaGFuZGxlUmVzcG9uc2UocmVzKSB7XG5cbiAgICAgICAgJHNjb3BlLmlzVHJhY2tBdmFpbGFibGUgPSB0cnVlO1xuICAgICAgICAkc2NvcGUudHJhY2sgPSByZXMuZGF0YTtcblxuICAgICAgICB2YXIgU01MaW5rcyA9IHJlcy5kYXRhLlNNTGlua3MgPyByZXMuZGF0YS5TTUxpbmtzIDoge307XG4gICAgICAgIHZhciBTTUxpbmtzQXJyYXkgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciBsaW5rIGluIFNNTGlua3MpIHtcbiAgICAgICAgICBTTUxpbmtzQXJyYXkucHVzaCh7XG4gICAgICAgICAgICBrZXk6IGxpbmssXG4gICAgICAgICAgICB2YWx1ZTogU01MaW5rc1tsaW5rXVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgICRzY29wZS50cmFjay5TTUxpbmtzID0gU01MaW5rc0FycmF5O1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBoYW5kbGVFcnJvcihyZXMpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgJHNjb3BlLmRlbGV0ZURvd25sb2FkR2F0ZXdheSA9IGZ1bmN0aW9uKGluZGV4KSB7XG5cbiAgICAgIGlmIChjb25maXJtKFwiRG8geW91IHJlYWxseSB3YW50IHRvIGRlbGV0ZSB0aGlzIHRyYWNrP1wiKSkge1xuICAgICAgICB2YXIgZG93bmxvYWRHYXRlV2F5SUQgPSAkc2NvcGUuZG93bmxvYWRHYXRld2F5TGlzdFtpbmRleF0uX2lkO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAgIEFkbWluRExHYXRlU2VydmljZVxuICAgICAgICAgIC5kZWxldGVEb3dubG9hZEdhdGV3YXkoe1xuICAgICAgICAgICAgaWQ6IGRvd25sb2FkR2F0ZVdheUlEXG4gICAgICAgICAgfSlcbiAgICAgICAgICAudGhlbihoYW5kbGVSZXNwb25zZSlcbiAgICAgICAgICAuY2F0Y2goaGFuZGxlRXJyb3IpO1xuXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZVJlc3BvbnNlKHJlcykge1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgJHNjb3BlLmRvd25sb2FkR2F0ZXdheUxpc3Quc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGhhbmRsZUVycm9yKHJlcykge1xuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBmYWxzZVxuICAgICAgfVxuICAgIH07XG4gIH1cblxuXSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlciwgJGF1dGhQcm92aWRlciwgJGh0dHBQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkb3dubG9hZCcsIHtcbiAgICAgICAgdXJsOiAnL2Rvd25sb2FkJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9kb3dubG9hZFRyYWNrL3ZpZXdzL2Rvd25sb2FkVHJhY2sudmlldy5odG1sJyxcbiAgICAgICAgY29udHJvbGxlcjogJ0Rvd25sb2FkVHJhY2tDb250cm9sbGVyJ1xuICAgIH0pO1xuXG4gICAgJGF1dGhQcm92aWRlci5pbnN0YWdyYW0oe1xuICAgICAgICBjbGllbnRJZDogJzBiMmFiNDdiYWE0NjRjMzFiZjZkOGU5ZjMwMWQ0NDY5J1xuICAgIH0pO1xuXG4gICAgLy8gSW5zdGFncmFtXG4gICAgJGF1dGhQcm92aWRlci5pbnN0YWdyYW0oe1xuICAgICAgICBuYW1lOiAnaW5zdGFncmFtJyxcbiAgICAgICAgdXJsOiAnL2FwaS9kb3dubG9hZC9hdXRoL2luc3RhZ3JhbScsXG4gICAgICAgIGF1dGhvcml6YXRpb25FbmRwb2ludDogJ2h0dHBzOi8vYXBpLmluc3RhZ3JhbS5jb20vb2F1dGgvYXV0aG9yaXplJyxcbiAgICAgICAgcmVkaXJlY3RVcmk6ICdodHRwczovL2xvY2FsaG9zdDoxNDQzL2Rvd25sb2FkJyxcbiAgICAgICAgcmVxdWlyZWRVcmxQYXJhbXM6IFsnc2NvcGUnXSxcbiAgICAgICAgc2NvcGU6IFsnYmFzaWMnLCAncmVsYXRpb25zaGlwcycsICdwdWJsaWNfY29udGVudCcsICdmb2xsb3dlcl9saXN0J10sXG4gICAgICAgIHNjb3BlRGVsaW1pdGVyOiAnKycsXG4gICAgICAgIHR5cGU6ICcyLjAnXG4gICAgfSk7XG5cbiAgICAkYXV0aFByb3ZpZGVyLnR3aXR0ZXIoe1xuICAgICAgICB1cmw6ICcvYXBpL2Rvd25sb2FkL3R3aXR0ZXIvYXV0aCcsXG4gICAgICAgIGF1dGhvcml6YXRpb25FbmRwb2ludDogJ2h0dHBzOi8vYXBpLnR3aXR0ZXIuY29tL29hdXRoL2F1dGhlbnRpY2F0ZScsXG4gICAgICAgIHJlZGlyZWN0VXJpOiAnaHR0cHM6Ly9hcnRpc3RzdW5saW1pdGVkLmNvL2Rvd25sb2FkJywgLy9tdXN0IG1hdGNoIHdlYnNpdGVcbiAgICAgICAgdHlwZTogJzEuMCcsXG4gICAgICAgIHBvcHVwT3B0aW9uczoge1xuICAgICAgICAgICAgd2lkdGg6IDQ5NSxcbiAgICAgICAgICAgIGhlaWdodDogNjQ1XG4gICAgICAgIH1cbiAgICB9KTtcbn0pXG5cblxuYXBwLmNvbnRyb2xsZXIoJ0Rvd25sb2FkVHJhY2tDb250cm9sbGVyJywgWyckcm9vdFNjb3BlJyxcbiAgICAnJHN0YXRlJyxcbiAgICAnJHNjb3BlJyxcbiAgICAnJGh0dHAnLFxuICAgICckbG9jYXRpb24nLFxuICAgICckd2luZG93JyxcbiAgICAnJHEnLFxuICAgICdEb3dubG9hZFRyYWNrU2VydmljZScsXG4gICAgJyRzY2UnLFxuICAgICckYXV0aCcsXG4gICAgJ1Nlc3Npb25TZXJ2aWNlJyxcbiAgICBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgJHdpbmRvdywgJHEsIERvd25sb2FkVHJhY2tTZXJ2aWNlLCAkc2NlLCAkYXV0aCwgU2Vzc2lvblNlcnZpY2UpIHtcbiAgICAgICAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XG4gICAgICAgIC8qIE5vcm1hbCBKUyB2YXJzIGFuZCBmdW5jdGlvbnMgbm90IGJvdW5kIHRvIHNjb3BlICovXG4gICAgICAgIHZhciBwbGF5ZXJPYmogPSBudWxsO1xuXG4gICAgICAgIC8qICRzY29wZSBiaW5kaW5ncyBzdGFydCAqL1xuICAgICAgICAkc2NvcGUudHJhY2tEYXRhID0ge1xuICAgICAgICAgICAgdHJhY2tOYW1lOiAnTWl4aW5nIGFuZCBNYXN0ZXJpbmcnLFxuICAgICAgICAgICAgdXNlck5hbWU6ICdsYSB0cm9waWNhbCdcbiAgICAgICAgfTtcbiAgICAgICAgJHNjb3BlLnRvZ2dsZSA9IHRydWU7XG4gICAgICAgICRzY29wZS50b2dnbGVQbGF5ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkc2NvcGUudG9nZ2xlID0gISRzY29wZS50b2dnbGU7XG4gICAgICAgICAgICBpZiAoJHNjb3BlLnRvZ2dsZSkge1xuICAgICAgICAgICAgICAgIHBsYXllck9iai5wYXVzZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBwbGF5ZXJPYmoucGxheSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5lbWJlZFRyYWNrID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5kb3dubG9hZFVSTE5vdEZvdW5kID0gZmFsc2U7XG4gICAgICAgICRzY29wZS5lcnJvclRleHQgPSAnJztcbiAgICAgICAgJHNjb3BlLmZvbGxvd0JveEltYWdlVXJsID0gJ2Fzc2V0cy9pbWFnZXMvd2hvLXdlLWFyZS5wbmcnO1xuICAgICAgICAkc2NvcGUucmVjZW50VHJhY2tzID0gW107XG5cbiAgICAgICAgJHNjb3BlLmluaXRpYXRlRG93bmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAoJHNjb3BlLnRyYWNrLmRvd25sb2FkVVJMICYmICRzY29wZS50cmFjay5kb3dubG9hZFVSTCAhPT0gJycpIHtcbiAgICAgICAgICAgICAgICAkd2luZG93LmxvY2F0aW9uLmhyZWYgPSAkc2NvcGUudHJhY2suZG93bmxvYWRVUkw7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICRzY29wZS5lcnJvclRleHQgPSAnRXJyb3IhIENvdWxkIG5vdCBmZXRjaCBkb3dubG9hZCBVUkwnO1xuICAgICAgICAgICAgICAgICRzY29wZS5kb3dubG9hZFVSTE5vdEZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8qIEZ1bmN0aW9uIGZvciBJbnN0YWdyYW0gKi9cbiAgICAgICAgJHNjb3BlLmF1dGhlbnRpY2F0ZUluc3RhZ3JhbSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJGF1dGguYXV0aGVudGljYXRlKCdpbnN0YWdyYW0nKS50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHVzZXJOYW1lID0gJHNjb3BlLnRyYWNrLnNvY2lhbFBsYXRmb3JtVmFsdWU7XG4gICAgICAgICAgICAgICAgJGh0dHAoe1xuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgICAgICAgICB1cmw6ICcvYXBpL2Rvd25sb2FkL2luc3RhZ3JhbS9mb2xsb3dfdXNlcicsXG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdhY2Nlc3NfdG9rZW4nOiByZXNwb25zZS5kYXRhLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3EnOiB1c2VyTmFtZVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbih1c2VyKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh1c2VyLmRhdGEuc3VjYykge1xuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmluaXRpYXRlRG93bmxvYWQoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvKiBGdW5jdGlvbiBmb3IgVHdpdHRlciAqL1xuICAgICAgICAkc2NvcGUuYXV0aGVudGljYXRlVHdpdHRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgJGF1dGguYXV0aGVudGljYXRlKCd0d2l0dGVyJykudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgIHZhciB1c2VyTmFtZSA9ICRzY29wZS50cmFjay5zb2NpYWxQbGF0Zm9ybVZhbHVlO1xuICAgICAgICAgICAgICAgIGlmICgkc2NvcGUudHJhY2suc29jaWFsUGxhdGZvcm0gPT0gJ3R3aXR0ZXJGb2xsb3cnKSB7XG4gICAgICAgICAgICAgICAgICAgICRodHRwKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6ICcvYXBpL2Rvd25sb2FkL3R3aXR0ZXIvZm9sbG93JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY3JlZW5fbmFtZTogdXNlck5hbWUsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWNjZXNzVG9rZW46IHJlc3BvbnNlLmRhdGFcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSkudGhlbihmdW5jdGlvbihyZWNvcmRzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVjb3Jkcy5kYXRhICYmIHJlY29yZHMuc3RhdHVzVGV4dCA9PT0gXCJPS1wiKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJlY29yZHMuZGF0YS5zY3JlZW5fbmFtZSA9PT0gJHNjb3BlLnRyYWNrLnNvY2lhbFBsYXRmb3JtVmFsdWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLnJlcGxhY2UoJHNjb3BlLnRyYWNrLmRvd25sb2FkVVJMKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKCdFcnJvciBpbiBwcm9jZXNzaW5nIHRoZSByZXF1ZXN0LiBQbGVhc2UgdHJ5IGFnYWluLicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCRzY29wZS50cmFjay5zb2NpYWxQbGF0Zm9ybSA9PSAndHdpdHRlclBvc3QnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3BvbnNlLmRhdGEuc29jaWFsUGxhdGZvcm1WYWx1ZSA9ICRzY29wZS50cmFjay5zb2NpYWxQbGF0Zm9ybVZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAkaHR0cCh7XG4gICAgICAgICAgICAgICAgICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiAnL2FwaS9kb3dubG9hZC90d2l0dGVyL3Bvc3QnLFxuICAgICAgICAgICAgICAgICAgICAgICAgZGF0YTogcmVzcG9uc2UuZGF0YVxuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uKHJlY29yZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyZWNvcmRzLnN0YXR1c1RleHQgPT09IFwiT0tcIikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5yZXBsYWNlKCRzY29wZS50cmFjay5kb3dubG9hZFVSTCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKCdFcnJvciBpbiBwcm9jZXNzaW5nIHRoZSByZXF1ZXN0LiBQbGVhc2UgdHJ5IGFnYWluLicpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8qIEZ1bmN0aW9uIGZvciBZb3V0dWJlICovXG4gICAgICAgICRzY29wZS5hdXRoZW50aWNhdGVZb3V0dWJlID0gZnVuY3Rpb24odHJhY2spIHtcbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciB0b3RhbEFycmF5ID0gWyRzY29wZS50cmFjay5zb2NpYWxQbGF0Zm9ybVZhbHVlLCBcImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2NoYW5uZWwvVUNiZktFUVpaekhOMGVnWVhpbmJiN2pnXCIsIFwiaHR0cHM6Ly93d3cueW91dHViZS5jb20vY2hhbm5lbC9VQ3ZReUVEc0t3Sm9KTEtYZUN2WTJPZlFcIiwgXCJodHRwczovL3d3dy55b3V0dWJlLmNvbS9jaGFubmVsL1VDY3FwZFdEX2szeE00QU9qdnMtRml0UVwiLCBcImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2NoYW5uZWwvVUNiQTB4aU00RTVTYmYxV01taFRHT09nXCIsIFwiaHR0cHM6Ly93d3cueW91dHViZS5jb20vY2hhbm5lbC9VQzJIRzgyU0VUa2N4OHBPRTc1YllKNmdcIl1cbiAgICAgICAgICAgIHZhciBwcm9taXNlQXJyID0gW107XG4gICAgICAgICAgICB0b3RhbEFycmF5LmZvckVhY2goZnVuY3Rpb24odXJsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGlkUHJvbWlzZSA9IG5ldyBQcm9taXNlKGZ1bmN0aW9uKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAodXJsLmluY2x1ZGVzKCcvY2hhbm5lbC8nKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh1cmwuc3Vic3RyaW5nKHVybC5pbmRleE9mKCcvY2hhbm5lbC8nKSArIDksIHVybC5sZW5ndGgpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB1c2VybmFtZSA9IHVybC5zdWJzdHJpbmcodXJsLmluZGV4T2YoJy91c2VyLycpICsgNiwgdXJsLmxlbmd0aClcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpZEFycmF5ID0gW107XG4gICAgICAgICAgICAgICAgICAgICAgICAkaHR0cC5nZXQoJ2h0dHBzOi8vd3d3Lmdvb2dsZWFwaXMuY29tL3lvdXR1YmUvdjMvY2hhbm5lbHM/a2V5PUFJemFTeUJPdVJIeDI1VlE2OU1yVEVjdm4taElka1o4TnNad3NMdyZmb3JVc2VybmFtZT0nICsgdXNlcm5hbWUgKyAnJnBhcnQ9aWQnKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzLmRhdGEuaXRlbXNbMF0pIHJlc29sdmUocmVzLmRhdGEuaXRlbXNbMF0uaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLnRoZW4obnVsbCwgcmVqZWN0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIHByb21pc2VBcnIucHVzaChpZFByb21pc2UpO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIFByb21pc2UuYWxsKHByb21pc2VBcnIpXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oaWRBcnJheSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhpZEFycmF5KTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1ldGhvZDogXCJHRVRcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogJy9hcGkvZG93bmxvYWQvc3Vic2NyaWJlJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHBhcmFtczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRvd25sb2FkVVJMOiAkc2NvcGUudHJhY2suZG93bmxvYWRVUkwsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2hhbm5lbElEUzogaWRBcnJheVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93Lm9wZW4ocmVzcG9uc2UuZGF0YS51cmwsICdfYmxhbmsnKVxuICAgICAgICAgICAgICAgICAgICB3aW5kb3cuZm9jdXMoKVxuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKCdZb3V0dWJlIGNoYW5uZWwgdG8gc3Vic2NyaWJlIHRvIG5vdCBmb3VuZCcpO1xuICAgICAgICAgICAgICAgIH0pXG4gICAgICAgIH1cblxuICAgICAgICAvKiBEZWZhdWx0IHByb2Nlc3Npbmcgb24gcGFnZSBsb2FkICovXG4gICAgICAgICRzY29wZS5nZXREb3dubG9hZFRyYWNrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgICAgICAgICB2YXIgdHJhY2tJRCA9ICRsb2NhdGlvbi5zZWFyY2goKS50cmFja2lkO1xuICAgICAgICAgICAgRG93bmxvYWRUcmFja1NlcnZpY2VcbiAgICAgICAgICAgICAgICAuZ2V0RG93bmxvYWRUcmFjayh0cmFja0lEKVxuICAgICAgICAgICAgICAgIC50aGVuKHJlY2VpdmVEb3dubG9hZFRyYWNrKVxuICAgICAgICAgICAgICAgIC50aGVuKHJlY2VpdmVSZWNlbnRUcmFja3MpXG4gICAgICAgICAgICAgICAgLnRoZW4oaW5pdFBsYXkpXG4gICAgICAgICAgICAgICAgLmNhdGNoKGNhdGNoRG93bmxvYWRUcmFja0Vycm9yKTtcblxuICAgICAgICAgICAgZnVuY3Rpb24gcmVjZWl2ZURvd25sb2FkVHJhY2socmVzdWx0KSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrID0gcmVzdWx0LmRhdGE7XG4gICAgICAgICAgICAgICAgJHNjb3BlLmJhY2tncm91bmRTdHlsZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2JhY2tncm91bmQtaW1hZ2UnOiAndXJsKCcgKyAkc2NvcGUudHJhY2sudHJhY2tBcnR3b3JrVVJMICsgJyknLFxuICAgICAgICAgICAgICAgICAgICAgICAgJ2JhY2tncm91bmQtcmVwZWF0JzogJ25vLXJlcGVhdCcsXG4gICAgICAgICAgICAgICAgICAgICAgICAnYmFja2dyb3VuZC1zaXplJzogJ2NvdmVyJ1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgJHNjb3BlLmVtYmVkVHJhY2sgPSB0cnVlO1xuICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG5cbiAgICAgICAgICAgICAgICBpZiAoJHNjb3BlLnRyYWNrLnNob3dEb3dubG9hZFRyYWNrcyA9PT0gJ3VzZXInKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBEb3dubG9hZFRyYWNrU2VydmljZS5nZXRSZWNlbnRUcmFja3Moe1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlcklEOiAkc2NvcGUudHJhY2sudXNlcmlkLFxuICAgICAgICAgICAgICAgICAgICAgICAgdHJhY2tJRDogJHNjb3BlLnRyYWNrLl9pZFxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVzb2x2ZSgncmVzb2x2ZScpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gcmVjZWl2ZVJlY2VudFRyYWNrcyhyZXMpIHtcbiAgICAgICAgICAgICAgICBpZiAoKHR5cGVvZiByZXMgPT09ICdvYmplY3QnKSAmJiByZXMuZGF0YSkge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUucmVjZW50VHJhY2tzID0gcmVzLmRhdGE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBTQy5zdHJlYW0oJy90cmFja3MvJyArICRzY29wZS50cmFjay50cmFja0lEKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gaW5pdFBsYXkocGxheWVyKSB7XG4gICAgICAgICAgICAgICAgcGxheWVyT2JqID0gcGxheWVyO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBjYXRjaERvd25sb2FkVHJhY2tFcnJvcigpIHtcbiAgICAgICAgICAgICAgICAkLlplYnJhX0RpYWxvZygnU29uZyBOb3QgRm91bmQnKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICRzY29wZS5lbWJlZFRyYWNrID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgLyogT24gY2xpY2sgZG93bmxvYWQgdHJhY2sgYnV0dG9uICovXG4gICAgICAgICRzY29wZS5hdXRoZW50aWNhdGVTb3VuZGNsb3VkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBpZiAoJHNjb3BlLnRyYWNrLmNvbW1lbnQgJiYgISRzY29wZS50cmFjay5jb21tZW50VGV4dCkge1xuICAgICAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKCdQbGVhc2Ugd3JpdGUgYSBjb21tZW50IScpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICAgICAgICRzY29wZS5lcnJvclRleHQgPSAnJztcblxuICAgICAgICAgICAgU0MuY29ubmVjdCgpXG4gICAgICAgICAgICAgICAgLnRoZW4ocGVyZm9ybVRhc2tzKVxuICAgICAgICAgICAgICAgIC50aGVuKGluaXREb3dubG9hZClcbiAgICAgICAgICAgICAgICAuY2F0Y2goY2F0Y2hUYXNrc0Vycm9yKVxuXG4gICAgICAgICAgICBmdW5jdGlvbiBwZXJmb3JtVGFza3MocmVzKSB7XG4gICAgICAgICAgICAgICAgJHNjb3BlLnRyYWNrLnRva2VuID0gcmVzLm9hdXRoX3Rva2VuO1xuICAgICAgICAgICAgICAgIHJldHVybiBEb3dubG9hZFRyYWNrU2VydmljZS5wZXJmb3JtVGFza3MoJHNjb3BlLnRyYWNrKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZnVuY3Rpb24gaW5pdERvd25sb2FkKHJlcykge1xuICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgaWYgKCRzY29wZS50cmFjay5kb3dubG9hZFVSTCAmJiAkc2NvcGUudHJhY2suZG93bmxvYWRVUkwgIT09ICcnKSB7XG4gICAgICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYXRpb24uaHJlZiA9ICRzY29wZS50cmFjay5kb3dubG9hZFVSTDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAkc2NvcGUuZXJyb3JUZXh0ID0gJ0Vycm9yISBDb3VsZCBub3QgZmV0Y2ggZG93bmxvYWQgVVJMJztcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRvd25sb2FkVVJMTm90Rm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAkc2NvcGUuJGFwcGx5KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGZ1bmN0aW9uIGNhdGNoVGFza3NFcnJvcihlcnIpIHtcbiAgICAgICAgICAgICAgICAkLlplYnJhX0RpYWxvZygnRXJyb3IgaW4gcHJvY2Vzc2luZyB5b3VyIHJlcXVlc3QnKTtcbiAgICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICAkc2NvcGUuZG93bmxvYWRUcmFja0ZhY2Vib29rU2hhcmUgPSBmdW5jdGlvbihzaGFyZVVSTCkge1xuICAgICAgICAgICAgd2luZG93LmZiQXN5bmNJbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgRkIuaW5pdCh7XG4gICAgICAgICAgICAgICAgICAgIGFwcElkOiAnMTU3Njg5NzQ2OTI2Nzk5NicsXG4gICAgICAgICAgICAgICAgICAgIHhmYm1sOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICB2ZXJzaW9uOiAndjIuNidcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICBGQi51aSh7XG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ3NoYXJlJyxcbiAgICAgICAgICAgICAgICAgICAgaHJlZjogc2hhcmVVUkxcbiAgICAgICAgICAgICAgICB9LCBmdW5jdGlvbihyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UgJiYgIXJlc3BvbnNlLmVycm9yX2NvZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICgkc2NvcGUudHJhY2suZG93bmxvYWRVUkwgJiYgJHNjb3BlLnRyYWNrLmRvd25sb2FkVVJMICE9PSAnJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYXRpb24uaHJlZiA9ICRzY29wZS50cmFjay5kb3dubG9hZFVSTDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmVycm9yVGV4dCA9ICdFcnJvciEgQ291bGQgbm90IGZldGNoIGRvd25sb2FkIFVSTCc7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmRvd25sb2FkVVJMTm90Rm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLiRhcHBseSgpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHJlc3BvbnNlICYmIHJlc3BvbnNlLmVycm9yX2NvZGUgPT09IDQyMDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiVXNlciBjYW5jZWxsZWQ6IFwiICsgZGVjb2RlVVJJQ29tcG9uZW50KHJlc3BvbnNlLmVycm9yX21lc3NhZ2UpKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiTm90IE9LOiBcIiArIEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbGVydChcIllvdSBoYXZlIGNhbmNlbGxlZCBzaGFyaW5nIG9uIGZhY2Vib29rLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgKGZ1bmN0aW9uKGQsIHMsIGlkKSB7XG4gICAgICAgICAgICAgICAgdmFyIGpzLCBmanMgPSBkLmdldEVsZW1lbnRzQnlUYWdOYW1lKHMpWzBdO1xuICAgICAgICAgICAgICAgIGlmIChkLmdldEVsZW1lbnRCeUlkKGlkKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGpzID0gZC5jcmVhdGVFbGVtZW50KHMpO1xuICAgICAgICAgICAgICAgIGpzLmlkID0gaWQ7XG4gICAgICAgICAgICAgICAganMuc3JjID0gXCIvL2Nvbm5lY3QuZmFjZWJvb2submV0L2VuX1VTL3Nkay5qc1wiO1xuICAgICAgICAgICAgICAgIGZqcy5wYXJlbnROb2RlLmluc2VydEJlZm9yZShqcywgZmpzKTtcbiAgICAgICAgICAgIH0oZG9jdW1lbnQsICdzY3JpcHQnLCAnZmFjZWJvb2stanNzZGsnKSk7XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUuZG93bmxvYWRUcmFja0ZhY2Vib29rTGlrZSA9IGZ1bmN0aW9uKGZibGlrZWlkKSB7XG4gICAgICAgICAgICB3aW5kb3cuZmJBc3luY0luaXQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICBGQi5pbml0KHtcbiAgICAgICAgICAgICAgICAgICAgYXBwSWQ6ICcxNTc2ODk3NDY5MjY3OTk2JyxcbiAgICAgICAgICAgICAgICAgICAgeGZibWw6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgIHZlcnNpb246ICd2Mi42J1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIEZCLkV2ZW50LnN1YnNjcmliZSgnZWRnZS5jcmVhdGUnLCBmdW5jdGlvbihocmVmLCB3aWRnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uID0gZmJsaWtlaWQuZG93bmxvYWRVUkw7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgKGZ1bmN0aW9uKGQsIHMsIGlkKSB7XG4gICAgICAgICAgICAgICAgdmFyIGpzLCBmanMgPSBkLmdldEVsZW1lbnRzQnlUYWdOYW1lKHMpWzBdO1xuICAgICAgICAgICAgICAgIGlmIChkLmdldEVsZW1lbnRCeUlkKGlkKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGpzID0gZC5jcmVhdGVFbGVtZW50KHMpO1xuICAgICAgICAgICAgICAgIGpzLmlkID0gaWQ7XG4gICAgICAgICAgICAgICAganMuc3JjID0gXCIvL2Nvbm5lY3QuZmFjZWJvb2submV0L2VuX1VTL3Nkay5qc1wiO1xuICAgICAgICAgICAgICAgIGZqcy5wYXJlbnROb2RlLmluc2VydEJlZm9yZShqcywgZmpzKTtcbiAgICAgICAgICAgIH0oZG9jdW1lbnQsICdzY3JpcHQnLCAnZmFjZWJvb2stanNzZGsnKSk7XG4gICAgICAgIH07XG4gICAgfVxuXSk7Iiwid2luZG93LnR3dHRyID0gKGZ1bmN0aW9uKGQsIHMsIGlkKSB7XG4gICAgdmFyIGpzLCBmanMgPSBkLmdldEVsZW1lbnRzQnlUYWdOYW1lKHMpWzBdLFxuICAgICAgICB0ID0gd2luZG93LnR3dHRyIHx8IHt9O1xuICAgIGlmIChkLmdldEVsZW1lbnRCeUlkKGlkKSlcbiAgICAgICAgcmV0dXJuIHQ7XG4gICAganMgPSBkLmNyZWF0ZUVsZW1lbnQocyk7XG4gICAganMuaWQgPSBpZDtcbiAgICBqcy5zcmMgPSBcImh0dHBzOi8vcGxhdGZvcm0udHdpdHRlci5jb20vd2lkZ2V0cy5qc1wiO1xuICAgIGZqcy5wYXJlbnROb2RlLmluc2VydEJlZm9yZShqcywgZmpzKTtcblxuICAgIHQuX2UgPSBbXTtcbiAgICB0LnJlYWR5ID0gZnVuY3Rpb24oZikge1xuICAgICAgICB0Ll9lLnB1c2goZik7XG4gICAgfTtcblxuICAgIHJldHVybiB0O1xufShkb2N1bWVudCwgXCJzY3JpcHRcIiwgXCJ0d2l0dGVyLXdqc1wiKSk7IiwiXG5hcHAuc2VydmljZSgnQWRtaW5ETEdhdGVTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKXtcblxuXHRmdW5jdGlvbiByZXNvbHZlRGF0YShkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvc291bmRjbG91ZC9yZXNvbHZlJywgZGF0YSk7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXREb3dubG9hZExpc3QoKSB7XG5cdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS9kYXRhYmFzZS9kb3dubG9hZHVybC9hZG1pbicpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZ2V0RG93bmxvYWRHYXRld2F5KGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2RhdGFiYXNlL2Rvd25sb2FkdXJsLycgKyBkYXRhLmlkKTtcblx0fVxuXG5cdGZ1bmN0aW9uIGRlbGV0ZURvd25sb2FkR2F0ZXdheShkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvZG93bmxvYWR1cmwvZGVsZXRlJywgZGF0YSk7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHJlc29sdmVEYXRhOiByZXNvbHZlRGF0YSxcblx0XHRnZXREb3dubG9hZExpc3Q6IGdldERvd25sb2FkTGlzdCxcblx0XHRnZXREb3dubG9hZEdhdGV3YXk6IGdldERvd25sb2FkR2F0ZXdheSxcblx0XHRkZWxldGVEb3dubG9hZEdhdGV3YXk6IGRlbGV0ZURvd25sb2FkR2F0ZXdheVxuXHR9O1xufV0pO1xuIiwiYXBwLnNlcnZpY2UoJ0Rvd25sb2FkVHJhY2tTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKXtcblx0XG5cdGZ1bmN0aW9uIGdldERvd25sb2FkVHJhY2soZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZG93bmxvYWQvdHJhY2s/dHJhY2tJRD0nICsgZGF0YSk7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRUcmFja0RhdGEoZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIHtcblx0XHRcdHVybDogZGF0YS50cmFja1VSTFxuXHRcdH0pO1xuXHR9XG5cblx0ZnVuY3Rpb24gcGVyZm9ybVRhc2tzKGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnYXBpL2Rvd25sb2FkL3Rhc2tzJywgZGF0YSk7XG5cdH1cblxuXHRmdW5jdGlvbiBnZXRSZWNlbnRUcmFja3MoZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZG93bmxvYWQvdHJhY2svcmVjZW50P3VzZXJJRD0nICsgZGF0YS51c2VySUQgKyAnJnRyYWNrSUQ9JyArIGRhdGEudHJhY2tJRCk7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdGdldERvd25sb2FkVHJhY2s6IGdldERvd25sb2FkVHJhY2ssXG5cdFx0Z2V0VHJhY2tEYXRhOiBnZXRUcmFja0RhdGEsXG5cdFx0cGVyZm9ybVRhc2tzOiBwZXJmb3JtVGFza3MsXG5cdFx0Z2V0UmVjZW50VHJhY2tzOiBnZXRSZWNlbnRUcmFja3Ncblx0fTtcbn1dKTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXJcbiAgICAuc3RhdGUoJ2hvbWUnLCB7XG4gICAgICB1cmw6ICcvJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS92aWV3cy9ob21lLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJ1xuICAgIH0pXG4gICAgLnN0YXRlKCdhYm91dCcsIHtcbiAgICAgIHVybDogJy9hYm91dCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvYWJvdXQuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnSG9tZUNvbnRyb2xsZXInXG4gICAgfSlcbiAgICAuc3RhdGUoJ3NlcnZpY2VzJywge1xuICAgICAgdXJsOiAnL3NlcnZpY2VzJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS92aWV3cy9zZXJ2aWNlcy5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcbiAgICB9KVxuICAgIC5zdGF0ZSgnZmFxcycsIHtcbiAgICAgIHVybDogJy9mYXFzJyxcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS92aWV3cy9mYXFzLmh0bWwnLFxuICAgICAgY29udHJvbGxlcjogJ0hvbWVDb250cm9sbGVyJ1xuICAgIH0pXG4gICAgLnN0YXRlKCdhcHBseScsIHtcbiAgICAgIHVybDogJy9hcHBseScsXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvYXBwbHkuaHRtbCcsXG4gICAgICBjb250cm9sbGVyOiAnSG9tZUNvbnRyb2xsZXInXG4gICAgfSlcbiAgICAuc3RhdGUoJ2NvbnRhY3QnLCB7XG4gICAgICB1cmw6ICcvY29udGFjdCcsXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2hvbWUvdmlld3MvY29udGFjdC5odG1sJyxcbiAgICAgIGNvbnRyb2xsZXI6ICdIb21lQ29udHJvbGxlcidcbiAgICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignSG9tZUNvbnRyb2xsZXInLCBbJyRyb290U2NvcGUnLFxuICAnJHN0YXRlJyxcbiAgJyRzY29wZScsXG4gICckaHR0cCcsXG4gICckbG9jYXRpb24nLFxuICAnJHdpbmRvdycsXG4gICdIb21lU2VydmljZScsXG4gIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgJGxvY2F0aW9uLCAkd2luZG93LCBIb21lU2VydmljZSkge1xuXG4gICAgJHNjb3BlLmFwcGxpY2F0aW9uT2JqID0ge307XG4gICAgJHNjb3BlLmFydGlzdCA9IHt9O1xuICAgICRzY29wZS5zZW50ID0ge1xuICAgICAgYXBwbGljYXRpb246IGZhbHNlLFxuICAgICAgYXJ0aXN0RW1haWw6IGZhbHNlXG4gICAgfTtcbiAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgIGFwcGxpY2F0aW9uOiB7XG4gICAgICAgIHZhbDogJycsXG4gICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgICB9LFxuICAgICAgYXJ0aXN0RW1haWw6IHtcbiAgICAgICAgdmFsOiAnJyxcbiAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgIH1cbiAgICB9O1xuXG4gICAgLyogQXBwbHkgcGFnZSBzdGFydCAqL1xuXG4gICAgJHNjb3BlLnRvZ2dsZUFwcGxpY2F0aW9uU2VudCA9IGZ1bmN0aW9uKCkge1xuICAgICAgJHNjb3BlLm1lc3NhZ2UgPSB7XG4gICAgICAgIGFwcGxpY2F0aW9uOiB7XG4gICAgICAgICAgdmFsOiAnJyxcbiAgICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgJHNjb3BlLnNlbnQuYXBwbGljYXRpb24gPSAhJHNjb3BlLnNlbnQuYXBwbGljYXRpb247XG4gICAgfTtcblxuICAgICRzY29wZS5zYXZlQXBwbGljYXRpb24gPSBmdW5jdGlvbigpIHtcblxuICAgICAgJHNjb3BlLm1lc3NhZ2UuYXBwbGljYXRpb24gPSB7XG4gICAgICAgIHZhbDogJycsXG4gICAgICAgIHZpc2libGU6IGZhbHNlXG4gICAgICB9O1xuXG4gICAgICBIb21lU2VydmljZVxuICAgICAgICAuc2F2ZUFwcGxpY2F0aW9uKCRzY29wZS5hcHBsaWNhdGlvbk9iailcbiAgICAgICAgLnRoZW4oc2F2ZUFwcGxpY2F0aW9uUmVzcG9uc2UpXG4gICAgICAgIC5jYXRjaChzYXZlQXBwbGljYXRpb25FcnJvcilcblxuICAgICAgZnVuY3Rpb24gc2F2ZUFwcGxpY2F0aW9uUmVzcG9uc2UocmVzKSB7XG4gICAgICAgIGlmIChyZXMuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAkc2NvcGUuYXBwbGljYXRpb25PYmogPSB7fTtcbiAgICAgICAgICAkc2NvcGUuc2VudC5hcHBsaWNhdGlvbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgZnVuY3Rpb24gc2F2ZUFwcGxpY2F0aW9uRXJyb3IocmVzKSB7XG4gICAgICAgIGlmKHJlcy5zdGF0dXMgPT09IDQwMCkge1xuICAgICAgICAgICRzY29wZS5tZXNzYWdlLmFwcGxpY2F0aW9uID0ge1xuICAgICAgICAgICAgdmFsOiAnRW1haWwgYWxyZWFkeSBleGlzdHMhJyxcbiAgICAgICAgICAgIHZpc2libGU6IHRydWVcbiAgICAgICAgICB9O1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAkc2NvcGUubWVzc2FnZS5hcHBsaWNhdGlvbiA9IHtcbiAgICAgICAgICB2YWw6ICdFcnJvciBpbiBwcm9jZXNzaW5nIHlvdXIgcmVxdWVzdCcsXG4gICAgICAgICAgdmlzaWJsZTogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvKiBBcHBseSBwYWdlIGVuZCAqL1xuXG4gICAgLyogQXJ0aXN0IFRvb2xzIHBhZ2Ugc3RhcnQgKi9cbiAgICBcbiAgICAkc2NvcGUudG9nZ2xlQXJ0aXN0RW1haWwgPSBmdW5jdGlvbigpIHtcbiAgICAgICRzY29wZS5tZXNzYWdlID0ge1xuICAgICAgICBhcnRpc3RFbWFpbDoge1xuICAgICAgICAgIHZhbDogJycsXG4gICAgICAgICAgdmlzaWJsZTogZmFsc2VcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgICRzY29wZS5zZW50LmFydGlzdEVtYWlsID0gISRzY29wZS5zZW50LmFydGlzdEVtYWlsO1xuICAgIH07XG5cbiAgICAkc2NvcGUuc2F2ZUFydGlzdEVtYWlsID0gZnVuY3Rpb24oKSB7XG4gICAgICBIb21lU2VydmljZVxuICAgICAgICAuc2F2ZUFydGlzdEVtYWlsKCRzY29wZS5hcnRpc3QpXG4gICAgICAgIC50aGVuKGFydGlzdEVtYWlsUmVzcG9uc2UpXG4gICAgICAgIC5jYXRjaChhcnRpc3RFbWFpbEVycm9yKVxuXG4gICAgICBmdW5jdGlvbiBhcnRpc3RFbWFpbFJlc3BvbnNlKHJlcykge1xuICAgICAgICBpZiAocmVzLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgJHNjb3BlLmFydGlzdCA9IHt9O1xuICAgICAgICAgICRzY29wZS5zZW50LmFydGlzdEVtYWlsID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBmdW5jdGlvbiBhcnRpc3RFbWFpbEVycm9yKHJlcykge1xuICAgICAgICBpZihyZXMuc3RhdHVzID09PSA0MDApIHtcbiAgICAgICAgICAkc2NvcGUubWVzc2FnZS5hcnRpc3RFbWFpbCA9IHtcbiAgICAgICAgICAgIHZhbDogJ0VtYWlsIGFscmVhZHkgZXhpc3RzIScsXG4gICAgICAgICAgICB2aXNpYmxlOiB0cnVlXG4gICAgICAgICAgfTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAkc2NvcGUubWVzc2FnZS5hcnRpc3RFbWFpbCA9IHtcbiAgICAgICAgICB2YWw6ICdFcnJvciBpbiBwcm9jZXNzaW5nIHlvdXIgcmVxdWVzdCcsXG4gICAgICAgICAgdmlzaWJsZTogdHJ1ZVxuICAgICAgICB9O1xuICAgICAgfVxuICAgIH07XG5cbiAgICAvKiBBcnRpc3QgVG9vbHMgcGFnZSBlbmQgKi9cbiAgfVxuXSk7XG5cbmFwcC5kaXJlY3RpdmUoJ2FmZml4ZXInLCBmdW5jdGlvbigkd2luZG93KSB7XG4gIHJldHVybiB7XG4gICAgcmVzdHJpY3Q6ICdFQScsXG4gICAgbGluazogZnVuY3Rpb24oJHNjb3BlLCAkZWxlbWVudCkge1xuICAgICAgdmFyIHdpbiA9IGFuZ3VsYXIuZWxlbWVudCgkd2luZG93KTtcbiAgICAgIHZhciB0b3BPZmZzZXQgPSAkZWxlbWVudFswXS5vZmZzZXRUb3A7XG5cbiAgICAgIGZ1bmN0aW9uIGFmZml4RWxlbWVudCgpIHtcblxuICAgICAgICBpZiAoJHdpbmRvdy5wYWdlWU9mZnNldCA+IHRvcE9mZnNldCkge1xuICAgICAgICAgICRlbGVtZW50LmNzcygncG9zaXRpb24nLCAnZml4ZWQnKTtcbiAgICAgICAgICAkZWxlbWVudC5jc3MoJ3RvcCcsICczLjUlJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJGVsZW1lbnQuY3NzKCdwb3NpdGlvbicsICcnKTtcbiAgICAgICAgICAkZWxlbWVudC5jc3MoJ3RvcCcsICcnKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAkc2NvcGUuJG9uKCckcm91dGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICB3aW4udW5iaW5kKCdzY3JvbGwnLCBhZmZpeEVsZW1lbnQpO1xuICAgICAgfSk7XG4gICAgICB3aW4uYmluZCgnc2Nyb2xsJywgYWZmaXhFbGVtZW50KTtcbiAgICB9XG4gIH07XG59KSIsIlxuXG5hcHAuc2VydmljZSgnSG9tZVNlcnZpY2UnLCBbJyRodHRwJywgZnVuY3Rpb24oJGh0dHApe1xuXHRcblx0ZnVuY3Rpb24gc2F2ZUFwcGxpY2F0aW9uKGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9ob21lL2FwcGxpY2F0aW9uJywgZGF0YSk7XG5cdH1cblxuXHRmdW5jdGlvbiBzYXZlQXJ0aXN0RW1haWwoZGF0YSkge1xuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2hvbWUvYXJ0aXN0ZW1haWwnLCBkYXRhKTtcblx0fVxuXG5cdHJldHVybiB7XG5cdFx0c2F2ZUFwcGxpY2F0aW9uOiBzYXZlQXBwbGljYXRpb24sXG5cdFx0c2F2ZUFydGlzdEVtYWlsOiBzYXZlQXJ0aXN0RW1haWxcblx0fTtcbn1dKTtcbiIsImFwcC5zZXJ2aWNlKCdNaXhpbmdNYXN0ZXJpbmdTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKXtcblx0ZnVuY3Rpb24gc2F2ZU1peGluZ01hc3RlcmluZyhkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwKHtcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0dXJsOiAnL2FwaS9taXhpbmdtYXN0ZXJpbmcnLFxuXHRcdFx0aGVhZGVyczogeydDb250ZW50LVR5cGUnOiB1bmRlZmluZWQgfSxcblx0XHRcdHRyYW5zZm9ybVJlcXVlc3Q6IGFuZ3VsYXIuaWRlbnRpdHksXG5cdFx0XHRkYXRhOiBkYXRhXG5cdFx0fSk7XG5cdH1cblx0cmV0dXJuIHtcblx0XHRzYXZlTWl4aW5nTWFzdGVyaW5nOiBzYXZlTWl4aW5nTWFzdGVyaW5nXG5cdH07XG59XSk7XG4iLCJhcHAuc2VydmljZSgnUHJQbGFuU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbigkaHR0cCl7XG5cdFxuXHRmdW5jdGlvbiBzYXZlUHJQbGFuKGRhdGEpIHtcblx0XHRyZXR1cm4gJGh0dHAoe1xuXHRcdFx0bWV0aG9kOiAnUE9TVCcsXG5cdFx0XHR1cmw6ICcvYXBpL3BycGxhbicsXG5cdFx0XHRoZWFkZXJzOiB7J0NvbnRlbnQtVHlwZSc6IHVuZGVmaW5lZCB9LFxuXHRcdFx0dHJhbnNmb3JtUmVxdWVzdDogYW5ndWxhci5pZGVudGl0eSxcblx0XHRcdGRhdGE6IGRhdGFcblx0XHR9KTtcblx0fVxuXHRyZXR1cm4ge1xuXHRcdHNhdmVQclBsYW46IHNhdmVQclBsYW5cblx0fTtcbn1dKTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3ByZW1pZXJzdWJtaXNzaW9ucycsIHtcbiAgICB1cmw6ICcvYWRtaW4vcHJlbWllcnN1Ym1pc3Npb25zJyxcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL3ByZW1pZXJTdWJtaXNzaW9ucy92aWV3cy9wcmVtaWVyU3VibWlzc2lvbnMuaHRtbCcsXG4gICAgY29udHJvbGxlcjogJ1ByZW1pZXJTdWJtaXNzaW9uQ29udHJvbGxlcidcbiAgfSk7XG59KTtcblxuYXBwLmNvbnRyb2xsZXIoJ1ByZW1pZXJTdWJtaXNzaW9uQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgQXV0aFNlcnZpY2UsIFNlc3Npb25TZXJ2aWNlLCAkc2NlKSB7XG4gIGlmICghU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSB7XG4gICAgJHN0YXRlLmdvKCdhZG1pbicpO1xuICB9XG4gICRzY29wZS51c2VyPVNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcbiAgJHNjb3BlLmNvdW50ZXIgPSAwO1xuICAkc2NvcGUuY2hhbm5lbHMgPSBbXTtcbiAgJHNjb3BlLnNob3dpbmdFbGVtZW50cyA9IFtdO1xuICAkc2NvcGUuc3VibWlzc2lvbnMgPSBbXTtcbiAgJHNjb3BlLmdlbnJlID0gXCJcIjtcbiAgJHNjb3BlLnNraXAgPSAwO1xuICAkc2NvcGUubGltaXQgPSA1O1xuICAkc2NvcGUuZ2VucmVBcnJheSA9IFtcbiAgICAnQWx0ZXJuYXRpdmUgUm9jaycsXG4gICAgJ0FtYmllbnQnLFxuICAgICdDcmVhdGl2ZScsXG4gICAgJ0NoaWxsJyxcbiAgICAnQ2xhc3NpY2FsJyxcbiAgICAnQ291bnRyeScsXG4gICAgJ0RhbmNlICYgRURNJyxcbiAgICAnRGFuY2VoYWxsJyxcbiAgICAnRGVlcCBIb3VzZScsXG4gICAgJ0Rpc2NvJyxcbiAgICAnRHJ1bSAmIEJhc3MnLFxuICAgICdEdWJzdGVwJyxcbiAgICAnRWxlY3Ryb25pYycsXG4gICAgJ0Zlc3RpdmFsJyxcbiAgICAnRm9saycsXG4gICAgJ0hpcC1Ib3AvUk5CJyxcbiAgICAnSG91c2UnLFxuICAgICdJbmRpZS9BbHRlcm5hdGl2ZScsXG4gICAgJ0xhdGluJyxcbiAgICAnVHJhcCcsXG4gICAgJ1ZvY2FsaXN0cy9TaW5nZXItU29uZ3dyaXRlcidcbiAgXTtcblxuICAkc2NvcGUuZ2V0U3VibWlzc2lvbnNCeUdlbnJlID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnNob3dpbmdFbGVtZW50cyA9IFtdO1xuICAgICRzY29wZS5za2lwID0gMDtcbiAgICAkc2NvcGUubG9hZFN1Ym1pc3Npb25zKCk7XG4gIH1cblxuICAkc2NvcGUubG9hZFN1Ym1pc3Npb25zID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLmdldCgnL2FwaS9wcmVtaWVyL3VuYWNjZXB0ZWQ/Z2VucmU9JyArICRzY29wZS5nZW5yZSArIFwiJnNraXA9XCIgKyAkc2NvcGUuc2tpcCArIFwiJmxpbWl0PVwiICsgJHNjb3BlLmxpbWl0KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIGlmIChyZXMuZGF0YS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHJlcy5kYXRhLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgICBkLmNoYW5uZWwgPSBudWxsO1xuICAgICAgICAgICAgZC5lbWFpbEJvZHkgPSBcIlwiO1xuICAgICAgICAgICAgJHNjb3BlLnNob3dpbmdFbGVtZW50cy5wdXNoKGQpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9KVxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICQuWmVicmFfRGlhbG9nKCdFcnJvcjogTm8gcHJlbWllciBzdWJtaXNzaW9ucyBmb3VuZC4nKVxuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUubG9hZE1vcmUgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuc2tpcCArPSAxMDtcbiAgICAkc2NvcGUubG9hZFN1Ym1pc3Npb25zKCk7XG4gICAgLy92YXIgbG9hZEVsZW1lbnRzID0gW107XG4gICAgLy8gZm9yIChsZXQgaSA9ICRzY29wZS5jb3VudGVyOyBpIDwgJHNjb3BlLmNvdW50ZXIgKyAxNTsgaSsrKSB7XG4gICAgLy8gICB2YXIgc3ViID0gJHNjb3BlLnN1Ym1pc3Npb25zW2ldO1xuICAgIC8vICAgaWYgKHN1Yikge1xuICAgIC8vICAgICBzdWIuY2hhbm5lbE5hbWUgPSBudWxsO1xuICAgIC8vICAgICBzdWIuZW1haWxCb2R5ID0gXCJcIjtcbiAgICAvLyAgICAgJHNjb3BlLnNob3dpbmdFbGVtZW50cy5wdXNoKHN1Yik7XG4gICAgLy8gICAgIGxvYWRFbGVtZW50cy5wdXNoKHN1Yik7XG4gICAgLy8gICB9XG4gICAgLy8gfVxuICAgIC8vICRzY29wZS5jb3VudGVyICs9IDE1O1xuICB9XG5cbiAgJHNjb3BlLmFjY2VwdCA9IGZ1bmN0aW9uKHN1Ym1pKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgIHN1Ym1pLnN0YXR1cyA9IFwiYWNjZXB0ZWRcIjtcbiAgICAkaHR0cC5wdXQoXCIvYXBpL3ByZW1pZXIvYWNjZXB0XCIsIHtcbiAgICAgICAgc3VibWk6IHN1Ym1pXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24oc3ViKSB7XG4gICAgICAgICRzY29wZS5zaG93aW5nRWxlbWVudHMuc3BsaWNlKCRzY29wZS5zaG93aW5nRWxlbWVudHMuaW5kZXhPZihzdWJtaSksIDEpO1xuICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkFjY2VwdGVkXCIpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkVSUk9SOiBkaWQgbm90IFNhdmVcIilcbiAgICAgIH0pXG4gIH1cblxuICAkc2NvcGUuZGVjbGluZSA9IGZ1bmN0aW9uKHN1Ym1pc3Npb24pIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgc3VibWlzc2lvbi5zdGF0dXMgPSBcImRlY2xpbmVkXCI7XG4gICAgJGh0dHAucHV0KCcvYXBpL3ByZW1pZXIvZGVjbGluZScsIHtcbiAgICAgICAgc3VibWlzc2lvbjogc3VibWlzc2lvblxuICAgICAgfSlcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICB2YXIgaW5kZXggPSAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLmluZGV4T2Yoc3VibWlzc2lvbik7XG4gICAgICAgICRzY29wZS5zaG93aW5nRWxlbWVudHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJEZWNsaW5lZFwiKTtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZVxuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkVSUk9SOiBkaWQgbm90IERlY2xpbmVcIik7XG4gICAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5jaGFubmVsQ2hhbmdlID0gZnVuY3Rpb24oc3VibWlzc2lvbikge1xuICAgIHZhciBjaGFubmVsID0gSlNPTi5wYXJzZShzdWJtaXNzaW9uLmNoYW5uZWwpO1xuICAgIHZhciBlbWFpbEJvZHkgPSBcIlwiO1xuICAgIHN3aXRjaCAoY2hhbm5lbC5kaXNwbGF5TmFtZSkge1xuICAgICAgY2FzZSAnVGhlIFBsdWcnOlxuICAgICAgICBlbWFpbEJvZHkgPSBcIkhleSBcIiArIHN1Ym1pc3Npb24ubmFtZSArIFwiLCUwRCUwQSUwRCUwQVRoYW5rIHlvdSBmb3Igc3VibWl0dGluZyB5b3VyIHRyYWNrIHRvIHVzIGhlcmUgYXQgQXJ0aXN0cyBVbmxpbWl0ZWQuIFdlIGFyZSB2ZXJ5IGludGVyZXN0ZWQgaW4geW91ciBzdWJtaXNzaW9uIGFuZCB3ZSB0aGluayB0aGF0IGl0IGNvdWxkIHJlYWxseSBmaXQgb25lIG9mIG91ciBTb3VuZENsb3VkIGNoYW5uZWxzLCBcIiArIGNoYW5uZWwuZGlzcGxheU5hbWUgKyBcIiwgXCIgKyBjaGFubmVsLnVybCArIFwiICUwRCUwQSUwRCUwQU15IG5hbWUgaXMgTHVpeiBLdXBmZXIgYW5kIEkgaGVscCBjdXJhdGUgdGhlIGNoYW5uZWwuIEkganVzdCBoYXZlIGEgY291cGxlIG9mIHF1ZXN0aW9ucyByZWdhcmRpbmcgeW91ciBzdWJtaXNzaW9uIHRvIGhlbHAgbWFrZSBtZSB1bmRlcnN0YW5kIHRoZSByZWNvcmQgYSBiaXQgbW9yZTolMEQlMEElMEQlMEExLiBJcyBpdCAxMDAgcGVyY2VudCBvcmlnaW5hbD8gSXMgdGhlcmUgYW55IGNvcHlyaWdodCBpbmZyaW5nZW1lbnQgaW4gdGhpcyB0cmFjaz8gKHZvY2FscyB0aGF0IHlvdSBkbyBub3QgaGF2ZSBwZXJtaXNzaW9uIHRvIHVzZSwgZXRjKSUwRCUwQTIuIERvIHlvdSBvd24gYWxsIG9mIHRoZSByaWdodHMgdG8gdGhlIHRyYWNrPyAoaS5lLiBhcmUgeW91IGN1cnJlbnRseSBpbiBlbmdhZ2VkIGluIGEgcHVibGlzaGluZyAgb3IgbWFzdGVyIHJpZ2h0IGNvbnRyYWN0IHRoYXQgd2Ugd291bGQgbmVlZCBwZXJtaXNzaW9uIHRvIHJlbGVhc2UgeW91ciBtdXNpYz8pJTBEJTBBMy4gQXJlIHlvdSBpbnRlcmVzdGVkIHNvbGVseSBvbiByZWxlYXNpbmcgdGhlIHRyYWNrIG9uIFNvdW5kQ2xvdWQgKGZvciBGcmVlIERvd25sb2FkKSBvciBhcmUgeW91IGludGVyZXN0ZWQgaW4gaGF2aW5nIHVzIHRha2UgY2FyZSBvZiB1cGxvYWRpbmcgdGhlIHRyYWNrIHRvIFNwb3RpZnksIGlUdW5lcyBhbmQgcHJvbW90ZSB0aGUgdHJhY2sgb24gYWxsIHBsYXRmb3JtcywgcmF0aGVyIHRoYW4ganVzdCBTb3VuZCBDbG91ZC4lMEQlMEElMEQlMEFBbGwgYmVzdCBhbmQgbG9va2luZyBmb3J3YXJkIHRvIGhlYXJpbmcgZnJvbSB5b3Ugc29vbiwlMEQlMEElMEQlMEFMdWl6IEt1cGZlciUwRCUwQUFVIE5ldHdvcmslMEQlMEFsdWl6QHBlbmluc3VsYW1nbXQuY29tXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnUm95YWwgWCc6XG4gICAgICAgIGVtYWlsQm9keSA9IFwiSGV5IFwiICsgc3VibWlzc2lvbi5uYW1lICsgXCIsJTBEJTBBJTBEJTBBVGhhbmsgeW91IGZvciBzdWJtaXR0aW5nIHlvdXIgdHJhY2sgdG8gdXMgaGVyZSBhdCBBcnRpc3RzIFVubGltaXRlZC4gV2UgYXJlIHZlcnkgaW50ZXJlc3RlZCBpbiB5b3VyIHN1Ym1pc3Npb24gYW5kIHdlIHRoaW5rIHRoYXQgaXQgY291bGQgcmVhbGx5IGZpdCBvbmUgb2Ygb3VyIFNvdW5kQ2xvdWQgY2hhbm5lbHMsIFwiICsgY2hhbm5lbC5kaXNwbGF5TmFtZSArIFwiLCBcIiArIGNoYW5uZWwudXJsICsgXCIgJTBEJTBBJTBEJTBBTXkgbmFtZSBpcyBSYWZhZWwgUm9jaGEgYW5kIEkgaGVscCBjdXJhdGUgdGhlIGNoYW5uZWwuIEkganVzdCBoYXZlIGEgY291cGxlIG9mIHF1ZXN0aW9ucyByZWdhcmRpbmcgeW91ciBzdWJtaXNzaW9uIHRvIGhlbHAgbWFrZSBtZSB1bmRlcnN0YW5kIHRoZSByZWNvcmQgYSBiaXQgbW9yZTolMEQlMEElMEQlMEExLiBJcyBpdCAxMDAgcGVyY2VudCBvcmlnaW5hbD8gSXMgdGhlcmUgYW55IGNvcHlyaWdodCBpbmZyaW5nZW1lbnQgaW4gdGhpcyB0cmFjaz8gKHZvY2FscyB0aGF0IHlvdSBkbyBub3QgaGF2ZSBwZXJtaXNzaW9uIHRvIHVzZSwgZXRjKSUwRCUwQTIuIERvIHlvdSBvd24gYWxsIG9mIHRoZSByaWdodHMgdG8gdGhlIHRyYWNrPyAoaS5lLiBhcmUgeW91IGN1cnJlbnRseSBpbiBlbmdhZ2VkIGluIGEgcHVibGlzaGluZyAgb3IgbWFzdGVyIHJpZ2h0IGNvbnRyYWN0IHRoYXQgd2Ugd291bGQgbmVlZCBwZXJtaXNzaW9uIHRvIHJlbGVhc2UgeW91ciBtdXNpYz8pJTBEJTBBMy4gQXJlIHlvdSBpbnRlcmVzdGVkIHNvbGVseSBvbiByZWxlYXNpbmcgdGhlIHRyYWNrIG9uIFNvdW5kQ2xvdWQgKGZvciBGcmVlIERvd25sb2FkKSBvciBhcmUgeW91IGludGVyZXN0ZWQgaW4gaGF2aW5nIHVzIHRha2UgY2FyZSBvZiB1cGxvYWRpbmcgdGhlIHRyYWNrIHRvIFNwb3RpZnksIGlUdW5lcyBhbmQgcHJvbW90ZSB0aGUgdHJhY2sgb24gYWxsIHBsYXRmb3JtcywgcmF0aGVyIHRoYW4ganVzdCBTb3VuZCBDbG91ZC4lMEQlMEElMEQlMEFBbGwgYmVzdCBhbmQgbG9va2luZyBmb3J3YXJkIHRvIGhlYXJpbmcgZnJvbSB5b3Ugc29vbiwlMEQlMEElMEQlMEFSYWZhZWwgUm9jaGElMEQlMEFBVSBOZXR3b3JrJTBEJTBBcm95YWx4b2ZmaWNpYWxAZ21haWwuY29tXCI7XG4gICAgICAgIGJyZWFrO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgZW1haWxCb2R5ID0gXCJIZXkgXCIgKyBzdWJtaXNzaW9uLm5hbWUgKyBcIiwlMEQlMEElMEQlMEFUaGFuayB5b3UgZm9yIHN1Ym1pdHRpbmcgeW91ciB0cmFjayB0byB1cyBoZXJlIGF0IEFydGlzdHMgVW5saW1pdGVkLiBXZSBhcmUgdmVyeSBpbnRlcmVzdGVkIGluIHlvdXIgc3VibWlzc2lvbiBhbmQgd2UgdGhpbmsgdGhhdCBpdCBjb3VsZCByZWFsbHkgZml0IG9uZSBvZiBvdXIgU291bmRDbG91ZCBjaGFubmVscywgXCIgKyBjaGFubmVsLmRpc3BsYXlOYW1lICsgXCIsIFwiICsgY2hhbm5lbC51cmwgKyBcIiAlMEQlMEElMEQlMEFNeSBuYW1lIGlzIEVkd2FyZCBTYW5jaGV6IGFuZCBJIGhlbHAgY3VyYXRlIHRoZSBjaGFubmVsLiBJIGp1c3QgaGF2ZSBhIGNvdXBsZSBvZiBxdWVzdGlvbnMgcmVnYXJkaW5nIHlvdXIgc3VibWlzc2lvbiB0byBoZWxwIG1ha2UgbWUgdW5kZXJzdGFuZCB0aGUgcmVjb3JkIGEgYml0IG1vcmU6JTBEJTBBJTBEJTBBMS4gSXMgaXQgMTAwIHBlcmNlbnQgb3JpZ2luYWw/IElzIHRoZXJlIGFueSBjb3B5cmlnaHQgaW5mcmluZ2VtZW50IGluIHRoaXMgdHJhY2s/ICh2b2NhbHMgdGhhdCB5b3UgZG8gbm90IGhhdmUgcGVybWlzc2lvbiB0byB1c2UsIGV0YyklMEQlMEEyLiBEbyB5b3Ugb3duIGFsbCBvZiB0aGUgcmlnaHRzIHRvIHRoZSB0cmFjaz8gKGkuZS4gYXJlIHlvdSBjdXJyZW50bHkgaW4gZW5nYWdlZCBpbiBhIHB1Ymxpc2hpbmcgIG9yIG1hc3RlciByaWdodCBjb250cmFjdCB0aGF0IHdlIHdvdWxkIG5lZWQgcGVybWlzc2lvbiB0byByZWxlYXNlIHlvdXIgbXVzaWM/KSUwRCUwQTMuIEFyZSB5b3UgaW50ZXJlc3RlZCBzb2xlbHkgb24gcmVsZWFzaW5nIHRoZSB0cmFjayBvbiBTb3VuZENsb3VkIChmb3IgRnJlZSBEb3dubG9hZCkgb3IgYXJlIHlvdSBpbnRlcmVzdGVkIGluIGhhdmluZyB1cyB0YWtlIGNhcmUgb2YgdXBsb2FkaW5nIHRoZSB0cmFjayB0byBTcG90aWZ5LCBpVHVuZXMgYW5kIHByb21vdGUgdGhlIHRyYWNrIG9uIGFsbCBwbGF0Zm9ybXMsIHJhdGhlciB0aGFuIGp1c3QgU291bmQgQ2xvdWQuJTBEJTBBJTBEJTBBQWxsIGJlc3QgYW5kIGxvb2tpbmcgZm9yd2FyZCB0byBoZWFyaW5nIGZyb20geW91IHNvb24sJTBEJTBBJTBEJTBBRWR3YXJkIFNhbmNoZXolMEQlMEFBVSBOZXR3b3JrJTBEJTBBZWR3YXJkQHBlbmluc3VsYW1nbXQuY29tXCI7XG4gICAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBzdWJtaXNzaW9uLmVtYWlsQm9keSA9IGVtYWlsQm9keTtcbiAgfVxuXG4gICRzY29wZS5kZWxldGUgPSBmdW5jdGlvbihzdWJtaXNzaW9uKSB7XG4gICAgJC5aZWJyYV9EaWFsb2coJ0FyZSB5b3Ugc3VyZSB5b3UgcmVhbGx5IHdhbnQgdG8gZGVsZXRlID8nLCB7XG4gICAgICAnYnV0dG9ucyc6IFt7XG4gICAgICAgIGNhcHRpb246ICdZZXMnLFxuICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgICAgICRodHRwLnBvc3QoXCIvYXBpL3ByZW1pZXIvZGVsZXRlXCIsIHtcbiAgICAgICAgICAgICAgaWQ6IHN1Ym1pc3Npb24uX2lkXG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oc3ViKSB7XG4gICAgICAgICAgICAgICRzY29wZS5zaG93aW5nRWxlbWVudHMuc3BsaWNlKCRzY29wZS5zaG93aW5nRWxlbWVudHMuaW5kZXhPZihzdWJtaXNzaW9uKSwgMSk7XG4gICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSwge1xuICAgICAgICBjYXB0aW9uOiAnQ2FuY2VsJyxcbiAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKCkge31cbiAgICAgIH1dXG4gICAgfSk7XG4gIH1cblxuICAkc2NvcGUuZ2V0Q2hhbm5lbHMgPSBmdW5jdGlvbigpIHtcbiAgICAkc2NvcGUuY2hhbm5lbHMgPSBbe1xuICAgICAgZGlzcGxheU5hbWU6ICdMYSBUcm9waWNhbCcsXG4gICAgICB1cmw6ICdodHRwczovL3NvdW5kY2xvdWQuY29tL2xhdHJvcGljYWwnXG4gICAgfSwge1xuICAgICAgZGlzcGxheU5hbWU6ICdMYSBUcm9waWNhbCBNaXhlcycsXG4gICAgICB1cmw6ICdodHRwczovL3NvdW5kY2xvdWQuY29tL2xhdHJvcGljYWxtaXhlcydcbiAgICB9LCB7XG4gICAgICBkaXNwbGF5TmFtZTogJ1JlZCBUYWcnLFxuICAgICAgdXJsOiAnaHR0cHM6Ly9zb3VuZGNsb3VkLmNvbS9yZWQtdGFnJ1xuICAgIH0sIHtcbiAgICAgIGRpc3BsYXlOYW1lOiAnRXRpcXVldHRlIE5vaXInLFxuICAgICAgdXJsOiAnaHR0cHM6Ly9zb3VuZGNsb3VkLmNvbS9ldGlxdWV0dGVub2lyJ1xuICAgIH0sIHtcbiAgICAgIGRpc3BsYXlOYW1lOiAnTGUgU29sJyxcbiAgICAgIHVybDogJ2h0dHBzOi8vc291bmRjbG91ZC5jb20vbGVzb2xtdXNpcXVlJ1xuICAgIH0sIHtcbiAgICAgIGRpc3BsYXlOYW1lOiAnQ2xhc3N5IFJlY29yZHMnLFxuICAgICAgdXJsOiAnaHR0cHM6Ly9zb3VuZGNsb3VkLmNvbS9vbmx5Y2xhc3N5J1xuICAgIH0sIHtcbiAgICAgIGRpc3BsYXlOYW1lOiAnQSBMYSBNZXInLFxuICAgICAgdXJsOiAnaHR0cHM6Ly9zb3VuZGNsb3VkLmNvbS9hLWxhLW1lcidcbiAgICB9LCB7XG4gICAgICBkaXNwbGF5TmFtZTogJ1JveWFsIFgnLFxuICAgICAgdXJsOiAnaHR0cHM6Ly9zb3VuZGNsb3VkLmNvbS9yb3lhbHh4J1xuICAgIH0sIHtcbiAgICAgIGRpc3BsYXlOYW1lOiAnVGhlIFBsdWcnLFxuICAgICAgdXJsOiAnaHR0cHM6Ly9zb3VuZGNsb3VkLmNvbS90aGVwbHVnbWlhbWknXG4gICAgfSwge1xuICAgICAgZGlzcGxheU5hbWU6ICdFbGVjdHJvIEJvdW5jZScsXG4gICAgICB1cmw6ICdodHRwOi8vc291bmRjbG91ZC5jb20vZWxlY3Ryby1ib3VuY2UnXG4gICAgfSwge1xuICAgICAgZGlzcGxheU5hbWU6ICdQYW5lbCcsXG4gICAgICB1cmw6ICdodHRwczovL3NvdW5kY2xvdWQuY29tL3BhbmVsJ1xuICAgIH0sIHtcbiAgICAgIGRpc3BsYXlOYW1lOiAnQWlyIGRlIFBhcmlzJyxcbiAgICAgIHVybDogJ2h0dHBzOi8vc291bmRjbG91ZC5jb20vYWlyeHBhcmlzJ1xuICAgIH0sIHtcbiAgICAgIGRpc3BsYXlOYW1lOiAnTHV4IEF1ZGlvJyxcbiAgICAgIHVybDogJ2h0dHA6Ly9zb3VuZGNsb3VkLmNvbS9sdXhhdWRpbydcbiAgICB9XVxuICB9XG59KTtcblxuYXBwLmZpbHRlcigndHJ1c3RlZCcsIFsnJHNjZScsIGZ1bmN0aW9uKCRzY2UpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHVybCkge1xuICAgIHJldHVybiAkc2NlLnRydXN0QXNSZXNvdXJjZVVybCh1cmwpO1xuICB9O1xufV0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3ByZW1pZXJlJywge1xuICAgIHVybDogJy9wcmVtaWVyZScsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9wcmVtaWVyZS92aWV3cy9wcmVtaWVyZS5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnUHJlbWllckNvbnRyb2xsZXInXG4gIH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdQcmVtaWVyQ29udHJvbGxlcicsIFsnJHJvb3RTY29wZScsXG4gICckc3RhdGUnLFxuICAnJHNjb3BlJyxcbiAgJyRodHRwJyxcbiAgJyRsb2NhdGlvbicsXG4gICckd2luZG93JyxcbiAgJ1ByZW1pZXJTZXJ2aWNlJyxcbiAgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCAkbG9jYXRpb24sICR3aW5kb3csIFByZW1pZXJTZXJ2aWNlKSB7XG5cbiAgICAkc2NvcGUuZ2VucmVBcnJheSA9IFtcbiAgICAgICdBbHRlcm5hdGl2ZSBSb2NrJyxcbiAgICAgICdBbWJpZW50JyxcbiAgICAgICdDcmVhdGl2ZScsXG4gICAgICAnQ2hpbGwnLFxuICAgICAgJ0NsYXNzaWNhbCcsXG4gICAgICAnQ291bnRyeScsXG4gICAgICAnRGFuY2UgJiBFRE0nLFxuICAgICAgJ0RhbmNlaGFsbCcsXG4gICAgICAnRGVlcCBIb3VzZScsXG4gICAgICAnRGlzY28nLFxuICAgICAgJ0RydW0gJiBCYXNzJyxcbiAgICAgICdEdWJzdGVwJyxcbiAgICAgICdFbGVjdHJvbmljJyxcbiAgICAgICdGZXN0aXZhbCcsXG4gICAgICAnRm9saycsXG4gICAgICAnSGlwLUhvcC9STkInLFxuICAgICAgJ0hvdXNlJyxcbiAgICAgICdJbmRpZS9BbHRlcm5hdGl2ZScsXG4gICAgICAnTGF0aW4nLFxuICAgICAgJ1RyYXAnLFxuICAgICAgJ1ZvY2FsaXN0cy9TaW5nZXItU29uZ3dyaXRlcidcbiAgICBdO1xuXG4gICAgJHNjb3BlLnByZW1pZXJPYmogPSB7fTtcbiAgICAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgIHZhbDogJycsXG4gICAgICB2aXNpYmxlOiBmYWxzZVxuICAgIH07XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcblxuICAgICRzY29wZS5zYXZlUHJlbWllciA9IGZ1bmN0aW9uKCkge1xuICAgICAgLy8kLlplYnJhX0RpYWxvZygnVGhpcyBtYXkgdGFrZSBhIGxpdHRsZSB3aGlsZS4nKVxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgJHNjb3BlLm1lc3NhZ2UudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgdmFyIGRhdGEgPSBuZXcgRm9ybURhdGEoKTtcbiAgICAgIGZvciAodmFyIHByb3AgaW4gJHNjb3BlLnByZW1pZXJPYmopIHtcbiAgICAgICAgZGF0YS5hcHBlbmQocHJvcCwgJHNjb3BlLnByZW1pZXJPYmpbcHJvcF0pO1xuICAgICAgfVxuICAgICAgUHJlbWllclNlcnZpY2VcbiAgICAgICAgLnNhdmVQcmVtaWVyKGRhdGEpXG4gICAgICAgIC50aGVuKHJlY2VpdmVSZXNwb25zZSlcbiAgICAgICAgLmNhdGNoKGNhdGNoRXJyb3IpO1xuXG4gICAgICBmdW5jdGlvbiByZWNlaXZlUmVzcG9uc2UocmVzKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgIGlmIChyZXMuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAvLyRzY29wZS5tZXNzYWdlLnZpc2libGUgPSB0cnVlO1xuICAgICAgICAgIC8vJHNjb3BlLm1lc3NhZ2UudmFsID0gJ1RoYW5rIHlvdSEgWW91ciBtZXNzYWdlIGhhcyBiZWVuIHNlbnQgc3VjY2Vzc2Z1bGx5Lic7XG4gICAgICAgICAgJHNjb3BlLnByZW1pZXJPYmogPSB7fTtcbiAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoXCJpbnB1dFt0eXBlPSdmaWxlJ11cIikudmFsKG51bGwpO1xuICAgICAgICAgICQuWmVicmFfRGlhbG9nKCdUaGFuayB5b3UhIFlvdXIgbWVzc2FnZSBoYXMgYmVlbiBzZW50IHN1Y2Nlc3NmdWxseS4nKVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vJHNjb3BlLm1lc3NhZ2UudmlzaWJsZSA9IHRydWU7XG4gICAgICAgICAgLy8kc2NvcGUubWVzc2FnZS52YWwgPSAnRXJyb3IgcHJvY2Vzc2luZy4gUGxlYXNlIHRyeSBhZ2FpbiBvciBzZW5kIHlvdXIgdHJhY2sgdG8gZWR3YXJkQHBlbmluc3VsYW1nbXQuY29tLic7XG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coJ0Vycm9yIHByb2Nlc3NpbmcuIFBsZWFzZSB0cnkgYWdhaW4gb3Igc2VuZCB5b3VyIHRyYWNrIHRvIGVkd2FyZEBwZW5pbnN1bGFtZ210LmNvbS4nKVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZ1bmN0aW9uIGNhdGNoRXJyb3IocmVzKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICQuWmVicmFfRGlhbG9nKCdFcnJvciBwcm9jZXNzaW5nLiBQbGVhc2UgdHJ5IGFnYWluIG9yIHNlbmQgeW91ciB0cmFjayB0byBlZHdhcmRAcGVuaW5zdWxhbWdtdC5jb20uJylcbiAgICAgICAgLy8gaWYgKHJlcy5zdGF0dXMgPT09IDQwMCkge1xuICAgICAgICAvLyAgICRzY29wZS5tZXNzYWdlID0ge1xuICAgICAgICAvLyAgICAgdmlzaWJsZTogdHJ1ZSxcbiAgICAgICAgLy8gICAgIHZhbDogcmVzLmRhdGFcbiAgICAgICAgLy8gICB9O1xuICAgICAgICAvLyAgIHJldHVybjtcbiAgICAgICAgLy8gfVxuICAgICAgICAvLyAkc2NvcGUubWVzc2FnZSA9IHtcbiAgICAgICAgLy8gICB2aXNpYmxlOiB0cnVlLFxuICAgICAgICAvLyAgIHZhbDogJ0Vycm9yIGluIHByb2Nlc3NpbmcgdGhlIHJlcXVlc3QuIFBsZWFzZSB0cnkgYWdhaW4gb3Igc2VuZCB0aGUgc3VibWlzc2lvbnMgdG8gZWR3YXJkQHBlbmluc3VsYW1nbXQuY29tLidcbiAgICAgICAgLy8gfTtcbiAgICAgIH1cbiAgICB9O1xuICB9XG5dKTsiLCJhcHAuc2VydmljZSgnUHJlbWllclNlcnZpY2UnLCBbJyRodHRwJywgZnVuY3Rpb24oJGh0dHApIHtcblxuXHRmdW5jdGlvbiBzYXZlUHJlbWllcihkYXRhKSB7XG5cdFx0cmV0dXJuICRodHRwKHtcblx0XHRcdG1ldGhvZDogJ1BPU1QnLFxuXHRcdFx0dXJsOiAnL2FwaS9wcmVtaWVyJyxcblx0XHRcdGhlYWRlcnM6IHtcblx0XHRcdFx0J0NvbnRlbnQtVHlwZSc6IHVuZGVmaW5lZFxuXHRcdFx0fSxcblx0XHRcdHRyYW5zZm9ybVJlcXVlc3Q6IGFuZ3VsYXIuaWRlbnRpdHksXG5cdFx0XHRkYXRhOiBkYXRhXG5cdFx0fSk7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdHNhdmVQcmVtaWVyOiBzYXZlUHJlbWllclxuXHR9O1xufV0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnc2V0dGluZ3MnLCB7XG4gICAgICAgIHVybDogJy9hZG1pbi9zZXR0aW5ncycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvc2V0dGluZ3Mvdmlld3Mvc2V0dGluZ3MuaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdzZXR0aW5nc0NvbnRyb2xsZXInXG4gICAgfSlcbn0pO1xuXG5hcHAuY29udHJvbGxlcignc2V0dGluZ3NDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCBTZXR0aW5nU2VydmljZSwgU2Vzc2lvblNlcnZpY2UpIHtcbiAgaWYgKCFTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkpIHtcbiAgICAkc3RhdGUuZ28oJ2FkbWluJyk7XG4gIH1cbiAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XG4gICRzY29wZS5wcm9maWxlID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xuICAkc2NvcGUudXBkYXRlUHJvZmlsZVdpdGhQaWN0dXJlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICBpZih0eXBlb2YgJHNjb3BlLnByb2ZpbGVwaWMgPT09ICd1bmRlZmluZWQnKVxuICAgIHtcbiAgICAgIHNhdmVUb0RiKG51bGwsJHNjb3BlLnByb2ZpbGUucHJvZmlsZVBpY3R1cmUpO1xuICAgIH1cbiAgICBlbHNlXG4gICAge1xuICAgICAgU2V0dGluZ1NlcnZpY2UudXBsb2FkRmlsZSgkc2NvcGUucHJvZmlsZXBpYy5maWxlKS50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICBpZiAocmVzLnN1Y2Nlc3MpIHtcbiAgICAgICAgICBzYXZlVG9EYihyZXMscmVzLmRhdGEuTG9jYXRpb24pO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9ICAgICAgIFxuICBcbiAgICBmdW5jdGlvbiBzYXZlVG9EYihyZXMsdXJsKVxuICAgIHtcbiAgICAgIFNldHRpbmdTZXJ2aWNlXG4gICAgICAudXBkYXRlQWRtaW5Qcm9maWxlKHtcbiAgICAgICAgdXNlcm5hbWU6IGRhdGEubmFtZSxcbiAgICAgICAgcGljdHVyZVVybDogdXJsXG4gICAgICB9KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIFNlc3Npb25TZXJ2aWNlLmNyZWF0ZShyZXMuZGF0YSk7XG4gICAgICAgICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAkLlplYnJhX0RpYWxvZygnUHJvZmlsZSB1cGRhdGVkIFN1Y2Nlc3NmdWxseScpO1xuICAgICAgfSlcbiAgICAgIC5jYXRjaChmdW5jdGlvbigpIHtcbiAgICAgIH0pO1xuICAgIH1cbiAgfVxuXG4gICRzY29wZS51cGRhdGVQYXNzd29yZCA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICBpZiAoZGF0YS5uZXdQYXNzd29yZCAhPSBkYXRhLmNvbmZpcm1QYXNzd29yZCkge1xuICAgICAgJC5aZWJyYV9EaWFsb2coJ1Bhc3N3b3JkIGRvZXNuXFwndCBtYXRjaCB3aXRoIGNvbmZpcm0gcGFzc3dvcmQnKTtcbiAgICAgIHJldHVybjtcbiAgICB9IFxuICAgIGVsc2Uge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgU2V0dGluZ1NlcnZpY2VcbiAgICAgIC51cGRhdGVBZG1pblByb2ZpbGUoe1xuICAgICAgICBwYXNzd29yZDogZGF0YS5uZXdQYXNzd29yZCxcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICQuWmVicmFfRGlhbG9nKCdQYXNzd29yZCBjaGFuZ2VkIHN1Y2Nlc3NmdWxseS4nKTtcbiAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKCkge1xuICAgICAgfSk7XG4gICAgfVxuICB9XG59KTtcbiIsImFwcC5mYWN0b3J5KCdTZXR0aW5nU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbigkaHR0cCkge1xuXG4gICAgZnVuY3Rpb24gdXBkYXRlQWRtaW5Qcm9maWxlKGRhdGEpIHtcblxuICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS91c2Vycy91cGRhdGVBZG1pblByb2ZpbGUnLCBkYXRhKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBnZXRTYWx0UGFzc3dvcmQoZGF0YSkge1xuXG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvdXNlcnMvZ2V0U2FsdFBhc3N3b3JkL3Bzd2Q9JyArIGRhdGEucGFzc3dvcmQpO1xuXG4gICAgfVxuXG4gICAgZnVuY3Rpb24gdXBsb2FkRmlsZShkYXRhKSB7XG4gICAgICAgIHZhciBmZCA9IG5ldyBGb3JtRGF0YSgpO1xuICAgICAgICBmZC5hcHBlbmQoJ2ZpbGUnLCBkYXRhKTtcbiAgICAgICAgcmV0dXJuICRodHRwKHtcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgICAgICAgICB1cmw6ICcvYXBpL3VzZXJzL3Byb2ZpbGVQaWNVcGRhdGUnLFxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6IHVuZGVmaW5lZCB9LFxuICAgICAgICAgICAgICAgIHRyYW5mb3JtUmVxdWVzdDogYW5ndWxhci5pZGVudGlmeSxcbiAgICAgICAgICAgICAgICBkYXRhOiBmZFxuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7ICAgICAgICAgICBcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcbiAgICAgICAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGdldFNhbHRQYXNzd29yZDogZ2V0U2FsdFBhc3N3b3JkLFxuICAgICAgICB1cGRhdGVBZG1pblByb2ZpbGU6IHVwZGF0ZUFkbWluUHJvZmlsZSxcbiAgICAgICAgdXBsb2FkRmlsZTogdXBsb2FkRmlsZVxuXG4gICAgfTtcbn1dKTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3N1Ym1pc3Npb25zJywge1xuICAgIHVybDogJy9hZG1pbi9zdWJtaXNzaW9ucycsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9zdWJtaXNzaW9ucy92aWV3cy9zdWJtaXNzaW9ucy5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnU3VibWlzc2lvbkNvbnRyb2xsZXInXG4gIH0pO1xufSk7XG5cbmFwcC5jb250cm9sbGVyKCdTdWJtaXNzaW9uQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgQXV0aFNlcnZpY2UsIFNlc3Npb25TZXJ2aWNlKSB7XG4gICRzY29wZS5jb3VudGVyID0gMDtcbiAgJHNjb3BlLnNob3dpbmdFbGVtZW50cyA9IFtdO1xuICAkc2NvcGUuc3VibWlzc2lvbnMgPSBbXTtcbiAgJHNjb3BlLmdlbnJlID0gXCJcIjtcbiAgJHNjb3BlLnNraXAgPSAwO1xuICAkc2NvcGUubGltaXQgPSAxMDtcbiAgaWYgKCFTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkpIHtcbiAgICAkc3RhdGUuZ28oJ2FkbWluJyk7XG4gIH1cbiAgJHNjb3BlLnVzZXI9U2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xuICAkc2NvcGUudW5pcXVlR3JvdXAgPSBbXTtcbiAgaWYoJHNjb3BlLnVzZXIucGFpZFJlcG9zdC5sZW5ndGggPiAwKXtcbiAgICAkc2NvcGUudXNlci5wYWlkUmVwb3N0LmZvckVhY2goZnVuY3Rpb24oYWNjKXtcbiAgICAgIGlmKGFjYy5ncm91cCAhPSBcIlwiICYmICRzY29wZS51bmlxdWVHcm91cC5pbmRleE9mKGFjYy5ncm91cCkgPT09IC0xKXtcbiAgICAgICAgJHNjb3BlLnVuaXF1ZUdyb3VwLnB1c2goYWNjLmdyb3VwKTsgICAgICAgIFxuICAgICAgfSBcbiAgICB9KTtcbiAgfVxuXG4gICRzY29wZS5nZW5yZUFycmF5ID0gW1xuICAgICdBbHRlcm5hdGl2ZSBSb2NrJyxcbiAgICAnQW1iaWVudCcsXG4gICAgJ0NyZWF0aXZlJyxcbiAgICAnQ2hpbGwnLFxuICAgICdDbGFzc2ljYWwnLFxuICAgICdDb3VudHJ5JyxcbiAgICAnRGFuY2UgJiBFRE0nLFxuICAgICdEYW5jZWhhbGwnLFxuICAgICdEZWVwIEhvdXNlJyxcbiAgICAnRGlzY28nLFxuICAgICdEcnVtICYgQmFzcycsXG4gICAgJ0R1YnN0ZXAnLFxuICAgICdFbGVjdHJvbmljJyxcbiAgICAnRmVzdGl2YWwnLFxuICAgICdGb2xrJyxcbiAgICAnSGlwLUhvcC9STkInLFxuICAgICdIb3VzZScsXG4gICAgJ0luZGllL0FsdGVybmF0aXZlJyxcbiAgICAnTGF0aW4nLFxuICAgICdUcmFwJyxcbiAgICAnVm9jYWxpc3RzL1Npbmdlci1Tb25nd3JpdGVyJ1xuICBdO1xuXG4gICRzY29wZS5nZXRTdWJtaXNzaW9uc0J5R2VucmUgPSBmdW5jdGlvbigpe1xuICAgICRzY29wZS5zaG93aW5nRWxlbWVudHMgPSBbXTtcbiAgICAkc2NvcGUuc2tpcCA9IDA7XG4gICAgJHNjb3BlLmxvYWRTdWJtaXNzaW9ucygpO1xuICB9XG5cbiAgJHNjb3BlLmxvYWRTdWJtaXNzaW9ucyA9IGZ1bmN0aW9uKCkge1xuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAkaHR0cC5nZXQoJy9hcGkvc3VibWlzc2lvbnMvdW5hY2NlcHRlZD9nZW5yZT0nK2VuY29kZVVSSUNvbXBvbmVudCgkc2NvcGUuZ2VucmUpK1wiJnNraXA9XCIrJHNjb3BlLnNraXArXCImbGltaXQ9XCIrJHNjb3BlLmxpbWl0KVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgaWYgKHJlcy5kYXRhLmxlbmd0aCA+IDApIHtcbiAgICAgICAgYW5ndWxhci5mb3JFYWNoKHJlcy5kYXRhLCBmdW5jdGlvbihkKSB7XG4gICAgICAgICAgZC5kaXNwbGF5VHlwZSA9ICdjaGFubmVsJztcbiAgICAgICAgICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLnB1c2goZCk7XG4gICAgICB9KTtcbiAgfVxuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICRzY29wZS5zaG93aW5nRWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihzdWIpIHtcbiAgICAgICAgU0Mub0VtYmVkKHN1Yi50cmFja1VSTCwge1xuICAgICAgICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKHN1Yi50cmFja0lEICsgXCJwbGF5ZXJcIiksXG4gICAgICAgICAgYXV0b19wbGF5OiBmYWxzZSxcbiAgICAgICAgICBtYXhoZWlnaHQ6IDE1MFxuICAgICAgICB9KTtcbiAgICAgIH0sIDUwKVxuICAgIH0pO1xuICAgIH0pXG4gICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgJC5aZWJyYV9EaWFsb2coJ0Vycm9yOiBDb3VsZCBub3QgZ2V0IGNoYW5uZWxzLicpXG4gICAgICBjb25zb2xlLmxvZyhlcnIpO1xuICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmxvYWRNb3JlID0gZnVuY3Rpb24oKSB7XG4gICAgJHNjb3BlLnNraXAgKz0gMTA7XG4gICAgJHNjb3BlLmxvYWRTdWJtaXNzaW9ucygpO1xuICAgIC8vIHZhciBsb2FkRWxlbWVudHMgPSBbXTtcbiAgICAvLyBmb3IgKGxldCBpID0gJHNjb3BlLmNvdW50ZXI7IGkgPCAkc2NvcGUuY291bnRlciArIDE1OyBpKyspIHtcbiAgICAvLyAgIHZhciBzdWIgPSAkc2NvcGUuc3VibWlzc2lvbnNbaV07XG4gICAgLy8gICBpZiAoc3ViKSB7XG4gICAgLy8gICAgICRzY29wZS5zaG93aW5nRWxlbWVudHMucHVzaChzdWIpO1xuICAgIC8vICAgICBsb2FkRWxlbWVudHMucHVzaChzdWIpO1xuICAgIC8vICAgfVxuICAgIC8vIH1cbiAgICAvLyBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgIC8vICAgbG9hZEVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oc3ViKSB7XG4gICAgLy8gICAgIFNDLm9FbWJlZChzdWIudHJhY2tVUkwsIHtcbiAgICAvLyAgICAgICBlbGVtZW50OiBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzdWIudHJhY2tJRCArIFwicGxheWVyXCIpLFxuICAgIC8vICAgICAgIGF1dG9fcGxheTogZmFsc2UsXG4gICAgLy8gICAgICAgbWF4aGVpZ2h0OiAxNTBcbiAgICAvLyAgICAgfSk7XG4gICAgLy8gICB9LCA1MClcbiAgICAvLyB9KTtcbiAgICAvLyAkc2NvcGUuY291bnRlciArPSAxNTtcbiAgfVxuXG4gICRzY29wZS5jaGFuZ2VCb3ggPSBmdW5jdGlvbihzdWIsIGNoYW4pIHtcbiAgICB2YXIgaW5kZXggPSBzdWIuY2hhbm5lbElEUy5pbmRleE9mKGNoYW4uaWQpO1xuICAgIGlmIChpbmRleCA9PSAtMSkge1xuICAgICAgc3ViLmNoYW5uZWxJRFMucHVzaChjaGFuLmlkKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3ViLmNoYW5uZWxJRFMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICB9XG4gIH1cblxuICAkc2NvcGUuY2hhbmdlQm94R3JvdXAgPSBmdW5jdGlvbihzdWIsIGdyb3VwKSB7XG4gICAgJHNjb3BlLnVzZXIucGFpZFJlcG9zdC5mb3JFYWNoKGZ1bmN0aW9uKGFjYyl7XG4gICAgICBpZihhY2MuZ3JvdXAgIT0gXCJcIiAmJiBhY2MuZ3JvdXAgPT0gZ3JvdXApe1xuICAgICAgICB2YXIgaW5kZXggPSBzdWIuY2hhbm5lbElEUy5pbmRleE9mKGFjYy5pZCk7XG4gICAgICAgIGlmIChpbmRleCA9PSAtMSkge1xuICAgICAgICAgIHN1Yi5jaGFubmVsSURTLnB1c2goYWNjLmlkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzdWIuY2hhbm5lbElEUy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9ICAgICAgXG4gICAgICB9XG4gICAgfSk7ICAgIFxuICB9XG5cbiAgJHNjb3BlLnNhdmUgPSBmdW5jdGlvbihzdWJtaSkge1xuICAgIGlmIChzdWJtaS5jaGFubmVsSURTLmxlbmd0aCA9PSAwKSB7XG4gICAgICAkc2NvcGUuZGVjbGluZShzdWJtaSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHN1Ym1pLnBhc3N3b3JkID0gJHJvb3RTY29wZS5wYXNzd29yZDtcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcbiAgICAgICRodHRwLnB1dChcIi9hcGkvc3VibWlzc2lvbnMvc2F2ZVwiLCBzdWJtaSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oc3ViKSB7XG4gICAgICAgICAgJHNjb3BlLnNob3dpbmdFbGVtZW50cy5zcGxpY2UoJHNjb3BlLnNob3dpbmdFbGVtZW50cy5pbmRleE9mKHN1Ym1pKSwgMSk7XG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJTYXZlZFwiKTtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICQuWmVicmFfRGlhbG9nKFwiRVJST1I6IGRpZCBub3QgU2F2ZVwiKVxuICAgICAgICB9KVxuICAgIH1cbiAgfVxuXG4gICRzY29wZS5pZ25vcmUgPSBmdW5jdGlvbihzdWJtaXNzaW9uKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLmRlbGV0ZSgnL2FwaS9zdWJtaXNzaW9ucy9pZ25vcmUvJyArIHN1Ym1pc3Npb24uX2lkICsgJy8nICsgJHJvb3RTY29wZS5wYXNzd29yZClcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICB2YXIgaW5kZXggPSAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLmluZGV4T2Yoc3VibWlzc2lvbik7XG4gICAgICAgICRzY29wZS5zaG93aW5nRWxlbWVudHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJJZ25vcmVkXCIpO1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgfSlcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkVSUk9SOiBkaWQgbm90IElnbm9yZVwiKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgJHNjb3BlLmRlY2xpbmUgPSBmdW5jdGlvbihzdWJtaXNzaW9uKSB7XG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICRodHRwLmRlbGV0ZSgnL2FwaS9zdWJtaXNzaW9ucy9kZWNsaW5lLycgKyBzdWJtaXNzaW9uLl9pZCArICcvJyArICRyb290U2NvcGUucGFzc3dvcmQpXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgdmFyIGluZGV4ID0gJHNjb3BlLnNob3dpbmdFbGVtZW50cy5pbmRleE9mKHN1Ym1pc3Npb24pO1xuICAgICAgICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICQuWmVicmFfRGlhbG9nKFwiRGVjbGluZWRcIik7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2VcbiAgICAgIH0pXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJFUlJPUjogZGlkIG5vdCBEZWNsaW5lXCIpO1xuICAgICAgfSk7XG4gIH1cblxuICAkc2NvcGUueW91dHViZSA9IGZ1bmN0aW9uKHN1Ym1pc3Npb24pIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAucG9zdCgnL2FwaS9zdWJtaXNzaW9ucy95b3V0dWJlSW5xdWlyeScsIHN1Ym1pc3Npb24pXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coJ1NlbnQgdG8gWmFjaCcpO1xuICAgICAgfSlcbiAgfVxuXG4gICRzY29wZS5zZW5kTW9yZSA9IGZ1bmN0aW9uKHN1Ym1pc3Npb24pIHtcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XG4gICAgJGh0dHAucG9zdCgnL2FwaS9zdWJtaXNzaW9ucy9zZW5kTW9yZUlucXVpcnknLCBzdWJtaXNzaW9uKVxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XG4gICAgICAgICQuWmVicmFfRGlhbG9nKCdTZW50IEVtYWlsJyk7XG4gICAgICB9KVxuICB9XG59KTsiLCJhcHAuZGlyZWN0aXZlKCdmaWxlSW5wdXQnLCBbJyRwYXJzZScsIGZ1bmN0aW9uKCRwYXJzZSl7XG5cdHJldHVybiB7XG5cdFx0cmVzdHJpY3Q6J0EnLFxuXHRcdGxpbms6ZnVuY3Rpb24oc2NvcGUsZWxtLGF0dHJzKXtcblx0XHRcdGVsbS5iaW5kKCdjaGFuZ2UnLCBmdW5jdGlvbigpe1xuXHRcdFx0XHQkcGFyc2UoYXR0cnMuZmlsZUlucHV0KSAvLyB0aGUgYXR0ciBpcyB3aGVyZSB3ZSBkZWZpbmUgJ2ZpbGUnIGFzIHRoZSBtb2RlbFxuXHRcdFx0XHQuYXNzaWduKHNjb3BlLGVsbVswXS5maWxlc1swXSk7XG5cdFx0XHRcdHNjb3BlLiRhcHBseSgpOyBcblx0XHRcdH0pO1xuXHRcdH1cblx0fTtcbn1dKTsiLCIndXNlIHN0cmljdCc7XG5hcHAuZGlyZWN0aXZlKCdvYXV0aEJ1dHRvbicsIGZ1bmN0aW9uICgpIHtcblx0cmV0dXJuIHtcblx0XHRzY29wZToge1xuXHRcdFx0cHJvdmlkZXJOYW1lOiAnQCdcblx0XHR9LFxuXHRcdHJlc3RyaWN0OiAnRScsXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9vYXV0aC1idXR0b24vb2F1dGgtYnV0dG9uLmh0bWwnXG5cdH1cbn0pOyJdLCJzb3VyY2VSb290IjoiL3NvdXJjZS8ifQ==
yBmb3J3YXJkIHRvIGhlYXJpbmcgZnJvbSB5b3Ugc29vbiwlMEQlMEElMEQlMEFFZHdhcmQgU2FuY2hleiUwRCUwQUFVIE5ldHdvcmslMEQlMEFlZHdhcmRAcGVuaW5zdWxhbWdtdC5jb21cIjtcclxuICAgICAgICBicmVhaztcclxuICAgIH1cclxuICAgIHN1Ym1pc3Npb24uZW1haWxCb2R5ID0gZW1haWxCb2R5O1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmRlbGV0ZSA9IGZ1bmN0aW9uKHN1Ym1pc3Npb24pIHtcclxuICAgICQuWmVicmFfRGlhbG9nKCdBcmUgeW91IHN1cmUgeW91IHJlYWxseSB3YW50IHRvIGRlbGV0ZSA / Jywge1xyXG4gICAgICAnYnV0dG9ucyc6IFt7XHJcbiAgICAgICAgY2FwdGlvbjogJ1llcycsXHJcbiAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAgICAgJGh0dHAucG9zdChcIi9hcGkvcHJlbWllci9kZWxldGVcIiwge1xyXG4gICAgICAgICAgICAgIGlkOiBzdWJtaXNzaW9uLl9pZFxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihzdWIpIHtcclxuICAgICAgICAgICAgICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLnNwbGljZSgkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLmluZGV4T2Yoc3VibWlzc2lvbiksIDEpO1xyXG4gICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSwge1xyXG4gICAgICAgIGNhcHRpb246ICdDYW5jZWwnLFxyXG4gICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbigpIHt9XHJcbiAgICAgIH1dXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gICRzY29wZS5nZXRDaGFubmVscyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLmNoYW5uZWxzID0gW3tcclxuICAgICAgZGlzcGxheU5hbWU6ICdMYSBUcm9waWNhbCcsXHJcbiAgICAgIHVybDogJ2h0dHBzOi8vc291bmRjbG91ZC5jb20vbGF0cm9waWNhbCdcclxuICAgIH0sIHtcclxuICAgICAgZGlzcGxheU5hbWU6ICdMYSBUcm9waWNhbCBNaXhlcycsXHJcbiAgICAgIHVybDogJ2h0dHBzOi8vc291bmRjbG91ZC5jb20vbGF0cm9waWNhbG1peGVzJ1xyXG4gICAgfSwge1xyXG4gICAgICBkaXNwbGF5TmFtZTogJ1JlZCBUYWcnLFxyXG4gICAgICB1cmw6ICdodHRwczovL3NvdW5kY2xvdWQuY29tL3JlZC10YWcnXHJcbiAgICB9LCB7XHJcbiAgICAgIGRpc3BsYXlOYW1lOiAnRXRpcXVldHRlIE5vaXInLFxyXG4gICAgICB1cmw6ICdodHRwczovL3NvdW5kY2xvdWQuY29tL2V0aXF1ZXR0ZW5vaXInXHJcbiAgICB9LCB7XHJcbiAgICAgIGRpc3BsYXlOYW1lOiAnTGUgU29sJyxcclxuICAgICAgdXJsOiAnaHR0cHM6Ly9zb3VuZGNsb3VkLmNvbS9sZXNvbG11c2lxdWUnXHJcbiAgICB9LCB7XHJcbiAgICAgIGRpc3BsYXlOYW1lOiAnQ2xhc3N5IFJlY29yZHMnLFxyXG4gICAgICB1cmw6ICdodHRwczovL3NvdW5kY2xvdWQuY29tL29ubHljbGFzc3knXHJcbiAgICB9LCB7XHJcbiAgICAgIGRpc3BsYXlOYW1lOiAnQSBMYSBNZXInLFxyXG4gICAgICB1cmw6ICdodHRwczovL3NvdW5kY2xvdWQuY29tL2EtbGEtbWVyJ1xyXG4gICAgfSwge1xyXG4gICAgICBkaXNwbGF5TmFtZTogJ1JveWFsIFgnLFxyXG4gICAgICB1cmw6ICdodHRwczovL3NvdW5kY2xvdWQuY29tL3JveWFseHgnXHJcbiAgICB9LCB7XHJcbiAgICAgIGRpc3BsYXlOYW1lOiAnVGhlIFBsdWcnLFxyXG4gICAgICB1cmw6ICdodHRwczovL3NvdW5kY2xvdWQuY29tL3RoZXBsdWdtaWFtaSdcclxuICAgIH0sIHtcclxuICAgICAgZGlzcGxheU5hbWU6ICdFbGVjdHJvIEJvdW5jZScsXHJcbiAgICAgIHVybDogJ2h0dHA6Ly9zb3VuZGNsb3VkLmNvbS9lbGVjdHJvLWJvdW5jZSdcclxuICAgIH0sIHtcclxuICAgICAgZGlzcGxheU5hbWU6ICdQYW5lbCcsXHJcbiAgICAgIHVybDogJ2h0dHBzOi8vc291bmRjbG91ZC5jb20vcGFuZWwnXHJcbiAgICB9LCB7XHJcbiAgICAgIGRpc3BsYXlOYW1lOiAnQWlyIGRlIFBhcmlzJyxcclxuICAgICAgdXJsOiAnaHR0cHM6Ly9zb3VuZGNsb3VkLmNvbS9haXJ4cGFyaXMnXHJcbiAgICB9LCB7XHJcbiAgICAgIGRpc3BsYXlOYW1lOiAnTHV4IEF1ZGlvJyxcclxuICAgICAgdXJsOiAnaHR0cDovL3NvdW5kY2xvdWQuY29tL2x1eGF1ZGlvJ1xyXG4gICAgfV1cclxuICB9XHJcbn0pO1xyXG5cclxuYXBwLmZpbHRlcigndHJ1c3RlZCcsIFsnJHNjZScsIGZ1bmN0aW9uKCRzY2UpIHtcclxuICByZXR1cm4gZnVuY3Rpb24odXJsKSB7XHJcbiAgICByZXR1cm4gJHNjZS50cnVzdEFzUmVzb3VyY2VVcmwodXJsKTtcclxuICB9O1xyXG59XSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdwcmVtaWVyZScsIHtcclxuICAgIHVybDogJy9wcmVtaWVyZScsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL3ByZW1pZXJlL3ZpZXdzL3ByZW1pZXJlLmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ1ByZW1pZXJDb250cm9sbGVyJ1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmFwcC5jb250cm9sbGVyKCdQcmVtaWVyQ29udHJvbGxlcicsIFsnJHJvb3RTY29wZScsXHJcbiAgJyRzdGF0ZScsXHJcbiAgJyRzY29wZScsXHJcbiAgJyRodHRwJyxcclxuICAnJGxvY2F0aW9uJyxcclxuICAnJHdpbmRvdycsXHJcbiAgJ1ByZW1pZXJTZXJ2aWNlJyxcclxuICBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsICRsb2NhdGlvbiwgJHdpbmRvdywgUHJlbWllclNlcnZpY2UpIHtcclxuXHJcbiAgICAkc2NvcGUuZ2VucmVBcnJheSA9IFtcclxuICAgICAgJ0FsdGVybmF0aXZlIFJvY2snLFxyXG4gICAgICAnQW1iaWVudCcsXHJcbiAgICAgICdDcmVhdGl2ZScsXHJcbiAgICAgICdDaGlsbCcsXHJcbiAgICAgICdDbGFzc2ljYWwnLFxyXG4gICAgICAnQ291bnRyeScsXHJcbiAgICAgICdEYW5jZSAmIEVETScsXHJcbiAgICAgICdEYW5jZWhhbGwnLFxyXG4gICAgICAnRGVlcCBIb3VzZScsXHJcbiAgICAgICdEaXNjbycsXHJcbiAgICAgICdEcnVtICYgQmFzcycsXHJcbiAgICAgICdEdWJzdGVwJyxcclxuICAgICAgJ0VsZWN0cm9uaWMnLFxyXG4gICAgICAnRmVzdGl2YWwnLFxyXG4gICAgICAnRm9saycsXHJcbiAgICAgICdIaXAtSG9wL1JOQicsXHJcbiAgICAgICdIb3VzZScsXHJcbiAgICAgICdJbmRpZS9BbHRlcm5hdGl2ZScsXHJcbiAgICAgICdMYXRpbicsXHJcbiAgICAgICdUcmFwJyxcclxuICAgICAgJ1ZvY2FsaXN0cy9TaW5nZXItU29uZ3dyaXRlcidcclxuICAgIF07XHJcblxyXG4gICAgJHNjb3BlLnByZW1pZXJPYmogPSB7fTtcclxuICAgICRzY29wZS5tZXNzYWdlID0ge1xyXG4gICAgICB2YWw6ICcnLFxyXG4gICAgICB2aXNpYmxlOiBmYWxzZVxyXG4gICAgfTtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcblxyXG4gICAgJHNjb3BlLnNhdmVQcmVtaWVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIC8vJC5aZWJyYV9EaWFsb2coJ1RoaXMgbWF5IHRha2UgYSBsaXR0bGUgd2hpbGUuJylcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAkc2NvcGUubWVzc2FnZS52aXNpYmxlID0gZmFsc2U7XHJcbiAgICAgIHZhciBkYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICAgIGZvciAodmFyIHByb3AgaW4gJHNjb3BlLnByZW1pZXJPYmopIHtcclxuICAgICAgICBkYXRhLmFwcGVuZChwcm9wLCAkc2NvcGUucHJlbWllck9ialtwcm9wXSk7XHJcbiAgICAgIH1cclxuICAgICAgUHJlbWllclNlcnZpY2VcclxuICAgICAgICAuc2F2ZVByZW1pZXIoZGF0YSlcclxuICAgICAgICAudGhlbihyZWNlaXZlUmVzcG9uc2UpXHJcbiAgICAgICAgLmNhdGNoKGNhdGNoRXJyb3IpO1xyXG5cclxuICAgICAgZnVuY3Rpb24gcmVjZWl2ZVJlc3BvbnNlKHJlcykge1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgaWYgKHJlcy5zdGF0dXMgPT09IDIwMCkge1xyXG4gICAgICAgICAgLy8kc2NvcGUubWVzc2FnZS52aXNpYmxlID0gdHJ1ZTtcclxuICAgICAgICAgIC8vJHNjb3BlLm1lc3NhZ2UudmFsID0gJ1RoYW5rIHlvdSEgWW91ciBtZXNzYWdlIGhhcyBiZWVuIHNlbnQgc3VjY2Vzc2Z1bGx5Lic7XHJcbiAgICAgICAgICAkc2NvcGUucHJlbWllck9iaiA9IHt9O1xyXG4gICAgICAgICAgYW5ndWxhci5lbGVtZW50KFwiaW5wdXRbdHlwZT0nZmlsZSddXCIpLnZhbChudWxsKTtcclxuICAgICAgICAgICQuWmVicmFfRGlhbG9nKCdUaGFuayB5b3UhIFlvdXIgbWVzc2FnZSBoYXMgYmVlbiBzZW50IHN1Y2Nlc3NmdWxseS4nKVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyRzY29wZS5tZXNzYWdlLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICAgICAgLy8kc2NvcGUubWVzc2FnZS52YWwgPSAnRXJyb3IgcHJvY2Vzc2luZy4gUGxlYXNlIHRyeSBhZ2FpbiBvciBzZW5kIHlvdXIgdHJhY2sgdG8gZWR3YXJkQHBlbmluc3VsYW1nbXQuY29tLic7XHJcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZygnRXJyb3IgcHJvY2Vzc2luZy4gUGxlYXNlIHRyeSBhZ2FpbiBvciBzZW5kIHlvdXIgdHJhY2sgdG8gZWR3YXJkQHBlbmluc3VsYW1nbXQuY29tLicpXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBjYXRjaEVycm9yKHJlcykge1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coJ0Vycm9yIHByb2Nlc3NpbmcuIFBsZWFzZSB0cnkgYWdhaW4gb3Igc2VuZCB5b3VyIHRyYWNrIHRvIGVkd2FyZEBwZW5pbnN1bGFtZ210LmNvbS4nKVxyXG4gICAgICAgIC8vIGlmIChyZXMuc3RhdHVzID09PSA0MDApIHtcclxuICAgICAgICAvLyAgICRzY29wZS5tZXNzYWdlID0ge1xyXG4gICAgICAgIC8vICAgICB2aXNpYmxlOiB0cnVlLFxyXG4gICAgICAgIC8vICAgICB2YWw6IHJlcy5kYXRhXHJcbiAgICAgICAgLy8gICB9O1xyXG4gICAgICAgIC8vICAgcmV0dXJuO1xyXG4gICAgICAgIC8vIH1cclxuICAgICAgICAvLyAkc2NvcGUubWVzc2FnZSA9IHtcclxuICAgICAgICAvLyAgIHZpc2libGU6IHRydWUsXHJcbiAgICAgICAgLy8gICB2YWw6ICdFcnJvciBpbiBwcm9jZXNzaW5nIHRoZSByZXF1ZXN0LiBQbGVhc2UgdHJ5IGFnYWluIG9yIHNlbmQgdGhlIHN1Ym1pc3Npb25zIHRvIGVkd2FyZEBwZW5pbnN1bGFtZ210LmNvbS4nXHJcbiAgICAgICAgLy8gfTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICB9XHJcbl0pOyIsImFwcC5zZXJ2aWNlKCdQcmVtaWVyU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbigkaHR0cCkge1xyXG5cclxuXHRmdW5jdGlvbiBzYXZlUHJlbWllcihkYXRhKSB7XHJcblx0XHRyZXR1cm4gJGh0dHAoe1xyXG5cdFx0XHRtZXRob2Q6ICdQT1NUJyxcclxuXHRcdFx0dXJsOiAnL2FwaS9wcmVtaWVyJyxcclxuXHRcdFx0aGVhZGVyczoge1xyXG5cdFx0XHRcdCdDb250ZW50LVR5cGUnOiB1bmRlZmluZWRcclxuXHRcdFx0fSxcclxuXHRcdFx0dHJhbnNmb3JtUmVxdWVzdDogYW5ndWxhci5pZGVudGl0eSxcclxuXHRcdFx0ZGF0YTogZGF0YVxyXG5cdFx0fSk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4ge1xyXG5cdFx0c2F2ZVByZW1pZXI6IHNhdmVQcmVtaWVyXHJcblx0fTtcclxufV0pOyIsImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdzZXR0aW5ncycsIHtcclxuICAgICAgICB1cmw6ICcvYWRtaW4vc2V0dGluZ3MnLFxyXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvc2V0dGluZ3Mvdmlld3Mvc2V0dGluZ3MuaHRtbCcsXHJcbiAgICAgICAgY29udHJvbGxlcjogJ3NldHRpbmdzQ29udHJvbGxlcidcclxuICAgIH0pXHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ3NldHRpbmdzQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgU2V0dGluZ1NlcnZpY2UsIFNlc3Npb25TZXJ2aWNlKSB7XHJcbiAgaWYgKCFTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkpIHtcclxuICAgICRzdGF0ZS5nbygnYWRtaW4nKTtcclxuICB9XHJcbiAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgJHNjb3BlLnByb2ZpbGUgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgJHNjb3BlLnVwZGF0ZVByb2ZpbGVXaXRoUGljdHVyZSA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgIGlmKHR5cGVvZiAkc2NvcGUucHJvZmlsZXBpYyA9PT0gJ3VuZGVmaW5lZCcpXHJcbiAgICB7XHJcbiAgICAgIHNhdmVUb0RiKG51bGwsJHNjb3BlLnByb2ZpbGUucHJvZmlsZVBpY3R1cmUpO1xyXG4gICAgfVxyXG4gICAgZWxzZVxyXG4gICAge1xyXG4gICAgICBTZXR0aW5nU2VydmljZS51cGxvYWRGaWxlKCRzY29wZS5wcm9maWxlcGljLmZpbGUpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgaWYgKHJlcy5zdWNjZXNzKSB7XHJcbiAgICAgICAgICBzYXZlVG9EYihyZXMscmVzLmRhdGEuTG9jYXRpb24pO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9ICAgICAgIFxyXG4gIFxyXG4gICAgZnVuY3Rpb24gc2F2ZVRvRGIocmVzLHVybClcclxuICAgIHtcclxuICAgICAgU2V0dGluZ1NlcnZpY2VcclxuICAgICAgLnVwZGF0ZUFkbWluUHJvZmlsZSh7XHJcbiAgICAgICAgdXNlcm5hbWU6IGRhdGEubmFtZSxcclxuICAgICAgICBwaWN0dXJlVXJsOiB1cmxcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlKHJlcy5kYXRhKTtcclxuICAgICAgICAkc2NvcGUudXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICQuWmVicmFfRGlhbG9nKCdQcm9maWxlIHVwZGF0ZWQgU3VjY2Vzc2Z1bGx5Jyk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5jYXRjaChmdW5jdGlvbigpIHtcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAkc2NvcGUudXBkYXRlUGFzc3dvcmQgPSBmdW5jdGlvbihkYXRhKSB7XHJcbiAgICBpZiAoZGF0YS5uZXdQYXNzd29yZCAhPSBkYXRhLmNvbmZpcm1QYXNzd29yZCkge1xyXG4gICAgICAkLlplYnJhX0RpYWxvZygnUGFzc3dvcmQgZG9lc25cXCd0IG1hdGNoIHdpdGggY29uZmlybSBwYXNzd29yZCcpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9IFxyXG4gICAgZWxzZSB7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgU2V0dGluZ1NlcnZpY2VcclxuICAgICAgLnVwZGF0ZUFkbWluUHJvZmlsZSh7XHJcbiAgICAgICAgcGFzc3dvcmQ6IGRhdGEubmV3UGFzc3dvcmQsXHJcbiAgICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAkLlplYnJhX0RpYWxvZygnUGFzc3dvcmQgY2hhbmdlZCBzdWNjZXNzZnVsbHkuJyk7XHJcbiAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKCkge1xyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcbn0pO1xyXG4iLCJhcHAuZmFjdG9yeSgnU2V0dGluZ1NlcnZpY2UnLCBbJyRodHRwJywgZnVuY3Rpb24oJGh0dHApIHtcclxuXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVBZG1pblByb2ZpbGUoZGF0YSkge1xyXG5cclxuICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS91c2Vycy91cGRhdGVBZG1pblByb2ZpbGUnLCBkYXRhKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiBnZXRTYWx0UGFzc3dvcmQoZGF0YSkge1xyXG5cclxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3VzZXJzL2dldFNhbHRQYXNzd29yZC9wc3dkPScgKyBkYXRhLnBhc3N3b3JkKTtcclxuXHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdXBsb2FkRmlsZShkYXRhKSB7XHJcbiAgICAgICAgdmFyIGZkID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICAgICAgZmQuYXBwZW5kKCdmaWxlJywgZGF0YSk7XHJcbiAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiAnL2FwaS91c2Vycy9wcm9maWxlUGljVXBkYXRlJyxcclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6IHVuZGVmaW5lZCB9LFxyXG4gICAgICAgICAgICAgICAgdHJhbmZvcm1SZXF1ZXN0OiBhbmd1bGFyLmlkZW50aWZ5LFxyXG4gICAgICAgICAgICAgICAgZGF0YTogZmRcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHsgICAgICAgICAgIFxyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiB7XHJcbiAgICAgICAgZ2V0U2FsdFBhc3N3b3JkOiBnZXRTYWx0UGFzc3dvcmQsXHJcbiAgICAgICAgdXBkYXRlQWRtaW5Qcm9maWxlOiB1cGRhdGVBZG1pblByb2ZpbGUsXHJcbiAgICAgICAgdXBsb2FkRmlsZTogdXBsb2FkRmlsZVxyXG5cclxuICAgIH07XHJcbn1dKTtcclxuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdzdWJtaXNzaW9ucycsIHtcclxuICAgIHVybDogJy9hZG1pbi9zdWJtaXNzaW9ucycsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL3N1Ym1pc3Npb25zL3ZpZXdzL3N1Ym1pc3Npb25zLmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ1N1Ym1pc3Npb25Db250cm9sbGVyJ1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmFwcC5jb250cm9sbGVyKCdTdWJtaXNzaW9uQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCAkaHR0cCwgQXV0aFNlcnZpY2UsIFNlc3Npb25TZXJ2aWNlKSB7XHJcbiAgJHNjb3BlLmNvdW50ZXIgPSAwO1xyXG4gICRzY29wZS5zaG93aW5nRWxlbWVudHMgPSBbXTtcclxuICAkc2NvcGUuc3VibWlzc2lvbnMgPSBbXTtcclxuICAkc2NvcGUuZ2VucmUgPSBcIlwiO1xyXG4gICRzY29wZS5za2lwID0gMDtcclxuICAkc2NvcGUubGltaXQgPSAxMDtcclxuICBpZiAoIVNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKSkge1xyXG4gICAgJHN0YXRlLmdvKCdhZG1pbicpO1xyXG4gIH1cclxuICAkc2NvcGUudXNlcj1TZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgJHNjb3BlLnVuaXF1ZUdyb3VwID0gW107XHJcbiAgaWYoJHNjb3BlLnVzZXIucGFpZFJlcG9zdC5sZW5ndGggPiAwKXtcclxuICAgICRzY29wZS51c2VyLnBhaWRSZXBvc3QuZm9yRWFjaChmdW5jdGlvbihhY2Mpe1xyXG4gICAgICBpZihhY2MuZ3JvdXAgIT0gXCJcIiAmJiAkc2NvcGUudW5pcXVlR3JvdXAuaW5kZXhPZihhY2MuZ3JvdXApID09PSAtMSl7XHJcbiAgICAgICAgJHNjb3BlLnVuaXF1ZUdyb3VwLnB1c2goYWNjLmdyb3VwKTsgICAgICAgIFxyXG4gICAgICB9IFxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuZ2VucmVBcnJheSA9IFtcclxuICAgICdBbHRlcm5hdGl2ZSBSb2NrJyxcclxuICAgICdBbWJpZW50JyxcclxuICAgICdDcmVhdGl2ZScsXHJcbiAgICAnQ2hpbGwnLFxyXG4gICAgJ0NsYXNzaWNhbCcsXHJcbiAgICAnQ291bnRyeScsXHJcbiAgICAnRGFuY2UgJiBFRE0nLFxyXG4gICAgJ0RhbmNlaGFsbCcsXHJcbiAgICAnRGVlcCBIb3VzZScsXHJcbiAgICAnRGlzY28nLFxyXG4gICAgJ0RydW0gJiBCYXNzJyxcclxuICAgICdEdWJzdGVwJyxcclxuICAgICdFbGVjdHJvbmljJyxcclxuICAgICdGZXN0aXZhbCcsXHJcbiAgICAnRm9saycsXHJcbiAgICAnSGlwLUhvcC9STkInLFxyXG4gICAgJ0hvdXNlJyxcclxuICAgICdJbmRpZS9BbHRlcm5hdGl2ZScsXHJcbiAgICAnTGF0aW4nLFxyXG4gICAgJ1RyYXAnLFxyXG4gICAgJ1ZvY2FsaXN0cy9TaW5nZXItU29uZ3dyaXRlcidcclxuICBdO1xyXG5cclxuICAkc2NvcGUuZ2V0U3VibWlzc2lvbnNCeUdlbnJlID0gZnVuY3Rpb24oKXtcclxuICAgICRzY29wZS5zaG93aW5nRWxlbWVudHMgPSBbXTtcclxuICAgICRzY29wZS5za2lwID0gMDtcclxuICAgICRzY29wZS5sb2FkU3VibWlzc2lvbnMoKTtcclxuICB9XHJcblxyXG4gICRzY29wZS5sb2FkU3VibWlzc2lvbnMgPSBmdW5jdGlvbigpIHtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICRodHRwLmdldCgnL2FwaS9zdWJtaXNzaW9ucy91bmFjY2VwdGVkP2dlbnJlPScrZW5jb2RlVVJJQ29tcG9uZW50KCRzY29wZS5nZW5yZSkrXCImc2tpcD1cIiskc2NvcGUuc2tpcCtcIiZsaW1pdD1cIiskc2NvcGUubGltaXQpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICBpZiAocmVzLmRhdGEubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIGFuZ3VsYXIuZm9yRWFjaChyZXMuZGF0YSwgZnVuY3Rpb24oZCkge1xyXG4gICAgICAgICAgZC5kaXNwbGF5VHlwZSA9ICdjaGFubmVsJztcclxuICAgICAgICAgICRzY29wZS5zaG93aW5nRWxlbWVudHMucHVzaChkKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oc3ViKSB7XHJcbiAgICAgICAgU0Mub0VtYmVkKHN1Yi50cmFja1VSTCwge1xyXG4gICAgICAgICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc3ViLnRyYWNrSUQgKyBcInBsYXllclwiKSxcclxuICAgICAgICAgIGF1dG9fcGxheTogZmFsc2UsXHJcbiAgICAgICAgICBtYXhoZWlnaHQ6IDE1MFxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9LCA1MClcclxuICAgIH0pO1xyXG4gICAgfSlcclxuICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAkLlplYnJhX0RpYWxvZygnRXJyb3I6IENvdWxkIG5vdCBnZXQgY2hhbm5lbHMuJylcclxuICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmxvYWRNb3JlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUuc2tpcCArPSAxMDtcclxuICAgICRzY29wZS5sb2FkU3VibWlzc2lvbnMoKTtcclxuICAgIC8vIHZhciBsb2FkRWxlbWVudHMgPSBbXTtcclxuICAgIC8vIGZvciAobGV0IGkgPSAkc2NvcGUuY291bnRlcjsgaSA8ICRzY29wZS5jb3VudGVyICsgMTU7IGkrKykge1xyXG4gICAgLy8gICB2YXIgc3ViID0gJHNjb3BlLnN1Ym1pc3Npb25zW2ldO1xyXG4gICAgLy8gICBpZiAoc3ViKSB7XHJcbiAgICAvLyAgICAgJHNjb3BlLnNob3dpbmdFbGVtZW50cy5wdXNoKHN1Yik7XHJcbiAgICAvLyAgICAgbG9hZEVsZW1lbnRzLnB1c2goc3ViKTtcclxuICAgIC8vICAgfVxyXG4gICAgLy8gfVxyXG4gICAgLy8gc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgIC8vICAgbG9hZEVsZW1lbnRzLmZvckVhY2goZnVuY3Rpb24oc3ViKSB7XHJcbiAgICAvLyAgICAgU0Mub0VtYmVkKHN1Yi50cmFja1VSTCwge1xyXG4gICAgLy8gICAgICAgZWxlbWVudDogZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoc3ViLnRyYWNrSUQgKyBcInBsYXllclwiKSxcclxuICAgIC8vICAgICAgIGF1dG9fcGxheTogZmFsc2UsXHJcbiAgICAvLyAgICAgICBtYXhoZWlnaHQ6IDE1MFxyXG4gICAgLy8gICAgIH0pO1xyXG4gICAgLy8gICB9LCA1MClcclxuICAgIC8vIH0pO1xyXG4gICAgLy8gJHNjb3BlLmNvdW50ZXIgKz0gMTU7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuY2hhbmdlQm94ID0gZnVuY3Rpb24oc3ViLCBjaGFuKSB7XHJcbiAgICB2YXIgaW5kZXggPSBzdWIuY2hhbm5lbElEUy5pbmRleE9mKGNoYW4uaWQpO1xyXG4gICAgaWYgKGluZGV4ID09IC0xKSB7XHJcbiAgICAgIHN1Yi5jaGFubmVsSURTLnB1c2goY2hhbi5pZCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBzdWIuY2hhbm5lbElEUy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmNoYW5nZUJveEdyb3VwID0gZnVuY3Rpb24oc3ViLCBncm91cCkge1xyXG4gICAgJHNjb3BlLnVzZXIucGFpZFJlcG9zdC5mb3JFYWNoKGZ1bmN0aW9uKGFjYyl7XHJcbiAgICAgIGlmKGFjYy5ncm91cCAhPSBcIlwiICYmIGFjYy5ncm91cCA9PSBncm91cCl7XHJcbiAgICAgICAgdmFyIGluZGV4ID0gc3ViLmNoYW5uZWxJRFMuaW5kZXhPZihhY2MuaWQpO1xyXG4gICAgICAgIGlmIChpbmRleCA9PSAtMSkge1xyXG4gICAgICAgICAgc3ViLmNoYW5uZWxJRFMucHVzaChhY2MuaWQpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzdWIuY2hhbm5lbElEUy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICAgIH0gICAgICBcclxuICAgICAgfVxyXG4gICAgfSk7ICAgIFxyXG4gIH1cclxuXHJcbiAgJHNjb3BlLnNhdmUgPSBmdW5jdGlvbihzdWJtaSkge1xyXG4gICAgaWYgKHN1Ym1pLmNoYW5uZWxJRFMubGVuZ3RoID09IDApIHtcclxuICAgICAgJHNjb3BlLmRlY2xpbmUoc3VibWkpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc3VibWkucGFzc3dvcmQgPSAkcm9vdFNjb3BlLnBhc3N3b3JkO1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICRodHRwLnB1dChcIi9hcGkvc3VibWlzc2lvbnMvc2F2ZVwiLCBzdWJtaSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbihzdWIpIHtcclxuICAgICAgICAgICRzY29wZS5zaG93aW5nRWxlbWVudHMuc3BsaWNlKCRzY29wZS5zaG93aW5nRWxlbWVudHMuaW5kZXhPZihzdWJtaSksIDEpO1xyXG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJTYXZlZFwiKTtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkVSUk9SOiBkaWQgbm90IFNhdmVcIilcclxuICAgICAgICB9KVxyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmlnbm9yZSA9IGZ1bmN0aW9uKHN1Ym1pc3Npb24pIHtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICRodHRwLmRlbGV0ZSgnL2FwaS9zdWJtaXNzaW9ucy9pZ25vcmUvJyArIHN1Ym1pc3Npb24uX2lkICsgJy8nICsgJHJvb3RTY29wZS5wYXNzd29yZClcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgdmFyIGluZGV4ID0gJHNjb3BlLnNob3dpbmdFbGVtZW50cy5pbmRleE9mKHN1Ym1pc3Npb24pO1xyXG4gICAgICAgICRzY29wZS5zaG93aW5nRWxlbWVudHMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAkLlplYnJhX0RpYWxvZyhcIklnbm9yZWRcIik7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkVSUk9SOiBkaWQgbm90IElnbm9yZVwiKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuZGVjbGluZSA9IGZ1bmN0aW9uKHN1Ym1pc3Npb24pIHtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICRodHRwLmRlbGV0ZSgnL2FwaS9zdWJtaXNzaW9ucy9kZWNsaW5lLycgKyBzdWJtaXNzaW9uLl9pZCArICcvJyArICRyb290U2NvcGUucGFzc3dvcmQpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgIHZhciBpbmRleCA9ICRzY29wZS5zaG93aW5nRWxlbWVudHMuaW5kZXhPZihzdWJtaXNzaW9uKTtcclxuICAgICAgICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJEZWNsaW5lZFwiKTtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlXHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJFUlJPUjogZGlkIG5vdCBEZWNsaW5lXCIpO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gICRzY29wZS55b3V0dWJlID0gZnVuY3Rpb24oc3VibWlzc2lvbikge1xyXG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgJGh0dHAucG9zdCgnL2FwaS9zdWJtaXNzaW9ucy95b3V0dWJlSW5xdWlyeScsIHN1Ym1pc3Npb24pXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coJ1NlbnQgdG8gWmFjaCcpO1xyXG4gICAgICB9KVxyXG4gIH1cclxuXHJcbiAgJHNjb3BlLnNlbmRNb3JlID0gZnVuY3Rpb24oc3VibWlzc2lvbikge1xyXG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgJGh0dHAucG9zdCgnL2FwaS9zdWJtaXNzaW9ucy9zZW5kTW9yZUlucXVpcnknLCBzdWJtaXNzaW9uKVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICQuWmVicmFfRGlhbG9nKCdTZW50IEVtYWlsJyk7XHJcbiAgICAgIH0pXHJcbiAgfVxyXG59KTsiLCJhcHAuZGlyZWN0aXZlKCdmaWxlSW5wdXQnLCBbJyRwYXJzZScsIGZ1bmN0aW9uKCRwYXJzZSl7XHJcblx0cmV0dXJuIHtcclxuXHRcdHJlc3RyaWN0OidBJyxcclxuXHRcdGxpbms6ZnVuY3Rpb24oc2NvcGUsZWxtLGF0dHJzKXtcclxuXHRcdFx0ZWxtLmJpbmQoJ2NoYW5nZScsIGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0JHBhcnNlKGF0dHJzLmZpbGVJbnB1dCkgLy8gdGhlIGF0dHIgaXMgd2hlcmUgd2UgZGVmaW5lICdmaWxlJyBhcyB0aGUgbW9kZWxcclxuXHRcdFx0XHQuYXNzaWduKHNjb3BlLGVsbVswXS5maWxlc1swXSk7XHJcblx0XHRcdFx0c2NvcGUuJGFwcGx5KCk7IFxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9O1xyXG59XSk7IiwiJ3VzZSBzdHJpY3QnO1xyXG5hcHAuZGlyZWN0aXZlKCdvYXV0aEJ1dHRvbicsIGZ1bmN0aW9uICgpIHtcclxuXHRyZXR1cm4ge1xyXG5cdFx0c2NvcGU6IHtcclxuXHRcdFx0cHJvdmlkZXJOYW1lOiAnQCdcclxuXHRcdH0sXHJcblx0XHRyZXN0cmljdDogJ0UnLFxyXG5cdFx0dGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9vYXV0aC1idXR0b24vb2F1dGgtYnV0dG9uLmh0bWwnXHJcblx0fVxyXG59KTsiXSwic291cmNlUm9vdCI6Ii9zb3VyY2UvIn0 =