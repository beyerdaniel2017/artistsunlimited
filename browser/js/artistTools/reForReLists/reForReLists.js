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
            var minFollower = ((user.soundcloud.followers && user.soundcloud.followers > 0) ? parseInt(user.soundcloud.followers / 2) : 0);
            var maxFollower = ((user.soundcloud.followers && user.soundcloud.followers > 0) ? parseInt(user.soundcloud.followers * 2) : 1000);
            return $http.post('/api/users/bySCURL/', {
                url: '',
                minFollower: minFollower,
                maxFollower: maxFollower,
                recordRange: {
                  skip: 0,
                  limit: 12
                }
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

  $scope.sliderSearchMin = Math.log((($scope.user.soundcloud.followers) ? parseInt($scope.user.soundcloud.followers / 2) : 0)) / Math.log(1.1);
  $scope.sliderSearchMax = Math.log((($scope.user.soundcloud.followers) ? parseInt($scope.user.soundcloud.followers * 2) : 200000000)) / Math.log(1.1);
  $scope.minSearchTradefollowers = Math.pow(1.1, $scope.sliderSearchMin);
  $scope.maxSearchTradefollowers = Math.pow(1.1, $scope.sliderSearchMax);

  	$scope.sliderManageMin = 0;
  	$scope.sliderManageMax = 200000000;

  	$scope.minManageTradefollowers = Math.pow(1.1, $scope.sliderManageMin);
  	$scope.maxManageTradefollowers = Math.pow(1.1, $scope.sliderManageMax);

  $scope.$watch(function() {
    return $scope.sliderSearchMin
  }, function(newVal, oldVal) {
    $scope.minSearchTradefollowers = Math.pow(1.1, newVal)
  })
  $scope.$watch(function() {
    return $scope.sliderSearchMax
  }, function(newVal, oldVal) {
    $scope.maxSearchTradefollowers = Math.pow(1.1, newVal);
  })

  	$scope.$watch(function() {
    	return $scope.sliderManageMin
  	}, function(newVal, oldVal) {
    	$scope.minManageTradefollowers = Math.pow(1.1, newVal)
  	})
  	$scope.$watch(function() {
    	return $scope.sliderManageMax
  	}, function(newVal, oldVal) {
    	$scope.maxManageTradefollowers = Math.pow(1.1, newVal);
  	})
	
  $scope.sortby = "Recent Alert";
  $scope.sort_order = "ascending";
  var searchTradeRange = {
    skip: 0,
    limit: 12
  }

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
        recordRange: {
          skip: 0,
          limit: 12
        }
      })
      .then(function(res) {
        $scope.processing = false;
        $scope.searchUser = res.data;
      })
      .then(undefined, function(err) {
        $scope.success = false;
        $scope.processing = false;
        $scope.searchUser = [];
        $.Zebra_Dialog("Please enter Artist url.");
      })
      .then(null, function(err) {
        $scope.success = false;
        $scope.processing = false;
        $scope.searchUser = [];
        $.Zebra_Dialog("Did not find user.");
      });
  }

  $scope.searchCurrentTrade = function() {
    var cTrades = [];
    $scope.currentTrades = [];
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
    $scope.currentTrades = cTrades;
    $scope.$apply();
  }

  $scope.sortResult = function(sortby) {
    $scope.sortby = sortby;
    var sort_order = $scope.sort_order;
    if (sortby == "Followers") {
      if (sort_order == "ascending") {
        $scope.currentTrades.sort(function(a, b) {
          return b.other.user.soundcloud.followers - a.other.user.soundcloud.followers;
        })
        $scope.sort_order = "descending";
      } else {
        $scope.currentTrades.sort(function(a, b) {
          return a.other.user.soundcloud.followers - b.other.user.soundcloud.followers;
        })
        $scope.sort_order = "ascending";
      }
		} 
		else if(sortby == "Unfilled Tracks"){
			if(sort_order == "ascending"){
		        $scope.currentTrades.sort(function(a, b) {
		          return b.unfilledTrackCount - a.unfilledTrackCount;
		        })
				$scope.sort_order = "descending";
    } else {
		        $scope.currentTrades.sort(function(a, b) {
		          return a.unfilledTrackCount - b.unfilledTrackCount;
		        })
				$scope.sort_order = "ascending";
			}
		}
		else {
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
        $scope.success = false;
        $scope.processing = false;
        $scope.searchUser = [];
        $.Zebra_Dialog("Please enter Artist url.");
      })
      .then(null, function(err) {
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
	$scope.checkNotification = function(){
		console.log(currentTrades);
		
		angular.forEach(currentTrades, function(trade) {
			console.log('if1',trade._id, trade.p1.user._id + "==" + $scope.user._id)
			if(trade.p1.user._id == $scope.user._id){
				if(trade.p1.alert == "change"){
					$scope.$parent.shownotification = true;
				}
			}
			console.log('if2',trade._id, trade.p2.user._id + "==" + $scope.user._id)
			if(trade.p2.user._id == $scope.user._id){
				console.log(trade.p2.alert);
				if(trade.p2.alert == "change"){
					console.log('else',trade.p2.alert);
					$scope.$parent.shownotification = true;
				}
			}
		});

		console.log('$scope.$parent.shownotification',$scope.$parent.shownotification);
	}

  $scope.checkNotification();
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