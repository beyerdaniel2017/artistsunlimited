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
      		openTrades:function($http, SessionService) {
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
	$scope.minSearchTradefollowers = (($scope.user.soundcloud.followers && $scope.user.soundcloud.followers > 0) ? parseInt($scope.user.soundcloud.followers/2) : 0);
	$scope.maxSearchTradefollowers = (($scope.user.soundcloud.followers && $scope.user.soundcloud.followers > 0) ? parseInt($scope.user.soundcloud.followers * 2) : 100000000);
	
	$scope.sortby = "Recent Alert";
	$scope.sort_order = "ascending";
	var searchTradeRange = {
    skip: 0,
    limit: 12
	}
	$scope.minManageTradefollowers = 0;
	$scope.maxManageTradefollowers = 100000000;
	
	$scope.helpModal = function() {
    var displayText = "";
    displayText = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum. <a href='mailto:someone@example.com' target='_top'>Send Mail</a>";
    $.Zebra_Dialog(displayText, {
      width: 600
    });
  };

	$scope.searchByFollowers = function() {
		$scope.searchURL = "";
		$scope.sendSearch();
	}

	$scope.sendSearch = function() {
		$scope.processing = true;
		$scope.searchUser = [];
		
		$http.post('/api/users/bySCURL/', {
			url: $scope.searchURL,
			minFollower: $scope.minSearchTradefollowers,
      maxFollower: $scope.maxSearchTradefollowers,
			recordRange: { skip: 0, limit: 12 }
		})
		.then(function(res) {
			$scope.processing = false;
			$scope.searchUser = res.data;
		})
    .then(undefined, function(err) {
     	$scope.success=false;
     	$scope.processing = false;
     	$scope.searchUser = [];
     	$.Zebra_Dialog("Please enter Artist url.");
     })
		.then(null, function(err) {
      $scope.success=false;
			$scope.processing = false;
			$scope.searchUser = [];
			$.Zebra_Dialog("Did not find user.");
		});
	}

	$scope.searchCurrentTrade = function() {
  	var cTrades = [];
  	$scope.currentTrades = [];
  	console.log($scope.minManageTradefollowers, $scope.maxManageTradefollowers);
  	angular.forEach($scope.currentTradesCopy, function(trade) {
  		if ($scope.searchURL != "") {
    		var url = $scope.searchURL;
    		url = url.toString().replace('http://', '').replace('https://', '');
        if ((trade.other.user.soundcloud.permalinkURL.indexOf(url) != -1)) {
          cTrades.push(trade);
        }
  		} else if (parseInt($scope.maxManageTradefollowers) > 0) {
        if (trade.other.user.soundcloud.followers >= $scope.minManageTradefollowers && trade.other.user.soundcloud.followers <= $scope.maxManageTradefollowers) {
          cTrades.push(trade);
        }	
  		}
  	});
  	console.log('cTrades',cTrades);
  	$scope.currentTrades = cTrades;
	}

	$scope.sortResult = function(sortby) {
		$scope.sortby = sortby;
		var sort_order = $scope.sort_order;
		if(sortby == "Followers"){
			if(sort_order == "ascending"){
				$scope.currentTrades.sort(function(a, b) { return b.other.user.soundcloud.followers - a.other.user.soundcloud.followers; })
				$scope.sort_order = "descending";
			}
			else{
				$scope.currentTrades.sort(function(a, b) { return a.other.user.soundcloud.followers - b.other.user.soundcloud.followers; })
				$scope.sort_order = "ascending";
			}
		}
		else{
			if(sort_order == "ascending"){
				$scope.currentTrades.sort(function(a, b) { var A = a.other.alert.toLowerCase();
		     	var B = b.other.alert.toLowerCase();
		     	return A < B;
	    	});
	    	$scope.sort_order = "descending";
	    }
	    else{
	    	$scope.currentTrades.sort(function(a, b) { var A = a.other.alert.toLowerCase();
		     	var B = b.other.alert.toLowerCase();
			     return A > B;
	    	});
	    	$scope.sort_order = "ascending";
	    }
		}
	}

  $scope.loadMore = function() {
    searchTradeRange.skip += 12;
    searchTradeRange.limit = 12;
    $http.post('/api/users/bySCURL/', {
			url: $scope.searchURL,
			minFollower: $scope.minSearchTradefollowers,
      maxFollower: $scope.maxSearchTradefollowers,
			recordRange: searchTradeRange
		})
		.then(function(res) {
			$scope.processing = false;
    	if (res.data.length > 0) {
      	angular.forEach(res.data, function(d) {
      		$scope.searchUser.push(d);
      	});
    	}
		})
    .then(undefined, function(err) {
     	$scope.success=false;
     	$scope.processing = false;
     	$scope.searchUser = [];
     	$.Zebra_Dialog("Please enter Artist url.");
     })
		.then(null, function(err) {
      $scope.success=false;
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

  $scope.sortResult($scope.sortby);
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