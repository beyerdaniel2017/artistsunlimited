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
								})
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
						maxFollower: maxFollower
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
	$scope.currentTrades = currentTrades;
	$scope.currentTradesCopy = currentTrades;
	$scope.otherUsers = [];
	$scope.searchUser = openTrades;
	$scope.searchURL = "";
	$scope.minfollowers = 0;
	$scope.maxfollowers = 100000000;
	$scope.search = {
		// followers: {
		// 	$lt: SessionService.getUser().soundcloud.followers * 2,
		// 	$gt: SessionService.getUser().soundcloud.followers / 2
		// }
	}

	$scope.sendSearch = function() {
		$scope.processing = true;
		$scope.searchUser = null;
		$http.post('/api/users/bySCURL/', {
				url: $scope.searchURL,
				minFollower: $scope.minfollowers,
				maxFollower: $scope.maxfollowers
			})
			.then(function(res) {
				$scope.processing = false;
				$scope.searchUser = res.data;
			})
			.then(null, function(err) {
				$scope.processing = false;
				$scope.searchUser = [];
				$.Zebra_Dialog("Did not find user.");
			});

		var cTrades = [];
		angular.forEach($scope.currentTradesCopy, function(trade) {
			if ($scope.searchURL != "" && parseInt($scope.maxfollowers) > 0) {
				var url = $scope.searchURL;
				url = url.toString().replace('http://', '').replace('https://', '');
				if ((trade.other.user.soundcloud.permalinkURL.indexOf(url) != -1)) {
					if (trade.other.user.soundcloud.followers > $scope.minfollowers && trade.other.user.soundcloud.followers <= $scope.maxfollowers) {
						cTrades.push(trade);
					}
				}
			} else if (parseInt($scope.maxfollowers) > 0) {
				if (trade.other.user.soundcloud.followers > $scope.minfollowers && trade.other.user.soundcloud.followers <= $scope.maxfollowers) {
					cTrades.push(trade);
				}
			}
		});
		$scope.currentTrades = cTrades;
		$timeout(function() {
			$(".open").slick('unslick'); 
			$(".current").slick('unslick'); 
			$(".current").slick({
        dots: false,
        infinite: true,
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: true,
        variableWidth: false
      });
			$(".open").slick({
        dots: false,
        infinite: true,
        slidesToShow: 4,
        slidesToScroll: 1,
        arrows: true,
        variableWidth: false
      });
	    },500);
	}

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
});