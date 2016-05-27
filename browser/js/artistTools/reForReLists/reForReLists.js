app.config(function($stateProvider) {
	$stateProvider
		.state('reForReLists', {
			url: '/artistTools/reForReLists',
			templateUrl: 'js/artistTools/reForReLists/reForReLists.html',
			controller: 'ReForReListsController',
			resolve: {
				currentTrades: function($http, SessionService) {
					var user = SessionService.getUser();
					if (user) {
						return $http.get('/api/trades/withUser/' + user._id)
							.then(function(res) {
								var trades = res.data;
								trades.forEach(function(trade) {
									trade.other = (trade.p1.user._id == user._id) ? trade.p2 : trade.p1;
									trade.user = (trade.p1.user._id == user._id) ? trade.p1 : trade.p2;
								});
								trades.sort(function(a, b) {
									if (a.user.alert == "change") {
										return -1;
									} else if (a.user.alert == "placement") {
										return -1
									} else {
										return 1;
									}
						});
								return trades;
							})
					} else {
						return [];
					}
			},
			openTrades: function($http, SessionService) {
				var user = SessionService.getUser();
				if (user) {
					var minFollower = ((user.soundcloud.followers && user.soundcloud.followers > 0) ? parseInt(user.soundcloud.followers/2) : 0);
					var maxFollower = ((user.soundcloud.followers && user.soundcloud.followers > 0) ? parseInt(user.soundcloud.followers * 2) : 1000);
					return $http.post('/api/users/bySCURL/', {
						url: '',
						minFollower: minFollower,
            maxFollower: maxFollower,
            recordRange: { skip: 0, limit: 12 }
					})
					.then(function(res) {
						return res.data;
					})
				} else {
					return [];
				}
			}
		}
	})
});

app.controller("ReForReListsController", function($scope, currentTrades, openTrades, $http, SessionService, $state, $timeout) {
	if (!SessionService.getUser()) {
      $state.go('login');
    }
	$scope.user = SessionService.getUser();
	$scope.currentTrades = currentTrades;
	$scope.currentTradesCopy = currentTrades;
	$scope.otherUsers = [];
	$scope.searchUser = openTrades;
	$scope.searchURL = "";
	$scope.minfollowers = 0;
	$scope.maxfollowers = 100000000;
	$scope.sortby = "";
  var searchTradeRange = {
    skip: 0,
    limit: 12
  }
	$scope.search = {
		// followers: {
		// 	$lt: SessionService.getUser().soundcloud.followers * 2,
		// 	$gt: SessionService.getUser().soundcloud.followers / 2
		// }
	}

	$scope.sendSearch = function() {
		$scope.processing = true;
		//$scope.searchUser = null;
		
		$http.post('/api/users/bySCURL/', {
				url: $scope.searchURL,
				minFollower: $scope.minfollowers,
      maxFollower: $scope.maxfollowers,
			recordRange: searchTradeRange
			})
			.then(function(res) {
				$scope.processing = false;
      if (res.data.length > 0) {
        angular.forEach(res.data, function(d) {
          $scope.searchUser.push(d);
        });
      }
			//$scope.searchUser = res.data;
			})
			.then(null, function(err) {
				$scope.processing = false;
				$scope.searchUser = [];
				$.Zebra_Dialog("Did not find user.");
			});
	}

	$scope.searchCurrentTrade = function() {
		var cTrades = [];
		angular.forEach($scope.currentTradesCopy, function(trade) {
      if ($scope.searchURL != "") {
				var url = $scope.searchURL;
				url = url.toString().replace('http://', '').replace('https://', '');
				if ((trade.other.user.soundcloud.permalinkURL.indexOf(url) != -1)) {
						cTrades.push(trade);
					}
			} else if (parseInt($scope.maxfollowers) > 0) {
        if (trade.other.user.soundcloud.followers >= $scope.minfollowers && trade.other.user.soundcloud.followers <= $scope.maxfollowers) {
					cTrades.push(trade);
				}
			}
		});
		$scope.currentTrades = cTrades;
	}

	$scope.sortResult = function() {
		var sortby = $scope.sortby;
		if(sortby == "followers"){
			$scope.currentTrades.sort(function(a, b) { return b.other.user.soundcloud.followers - a.other.user.soundcloud.followers; })
		}
		else{
			$scope.currentTrades.sort(function(a, b) { var A = a.other.alert.toLowerCase();
     	var B = b.other.alert.toLowerCase();
	     if (A < B){
        return -1;
	     }else if (A > B){
	       return  1;
	     }else{
	       return 0;
	     }
      });
	}
	}

  $scope.loadMore = function() {
    searchTradeRange.skip += 12;
    searchTradeRange.limit += 12;
    $scope.sendSearch();
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
		}
		$scope.processing = true;
		$http.post('/api/trades/new', trade)
			.then(function(res) {
				$scope.processing = false;
				$state.go('reForReInteraction', {
					tradeID: res.data._id
				})
			})
			.then(null, function(err) {
				$scope.processing = false;
				$.Zebra_Dialog("Error in creating trade");
			});
	}

	$scope.logout = function() {
    $http.post('/api/logout').then(function() {
      SessionService.deleteUser();
      $state.go('login');
    });
  };
});

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