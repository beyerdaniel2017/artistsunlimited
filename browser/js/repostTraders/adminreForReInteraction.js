app.config(function($stateProvider) {
  $stateProvider
    .state('adminreForReInteraction', {
      url: '/admin/reForReInteraction/:tradeID',
      templateUrl: 'js/repostTraders/_reForReInteraction.html',
      controller: 'AdminReForReInteractionController',
      resolve: {
        trade: function($http, $stateParams, $window, SessionService) {
          if (!SessionService.getUser()) {
            $window.localStorage.setItem('returnstate', 'reForReInteraction');
            $window.localStorage.setItem('tid', $stateParams.tradeID);
            $window.location.href = '/login';
          }
          return $http.get('/api/trades/byID/' + $stateParams.tradeID)
            .then(function(res) {
              var user = SessionService.getUser('subAdmin');
              var trade = res.data;
              trade.other = (trade.p1.user._id == user._id) ? trade.p2 : trade.p1;
              trade.user = (trade.p1.user._id == user._id) ? trade.p1 : trade.p2;
              return trade;
            }).then(null, console.log)
        },
        events: function($http, $window, SessionService) {
          if (!SessionService.getUser()) {
            $window.localStorage.setItem('returnstate', 'artistToolsScheduler');
            $window.location.href = '/login';
          }
          return $http.get('/api/events/forUser/' + SessionService.getUser().soundcloud.id)
            .then(function(res) {
              return res.data;
            })
            .then(null, function(err) {
              $.Zebra_Dialog("error getting your events");
              return;
            })
        },
        p1Events: function($http, trade) {
          return $http.get('/api/events/forUser/' + trade.p1.user.soundcloud.id)
            .then(function(res) {
              return res.data;
            })
            .then(null, function(err) {
              $.Zebra_Dialog("error getting your events");
              return;
            })
        },
        p2Events: function($http, trade) {
          return $http.get('/api/events/forUser/' + trade.p2.user.soundcloud.id)
            .then(function(res) {
              return res.data;
            })
            .then(null, function(err) {
              $.Zebra_Dialog("error getting other's events events");
              return;
            })
        },
        currentTrades: function($http, SessionService) {
          var tradeType = {
            Requests: true,
            Requested: true,
            TradePartners: true
          };
          var user = SessionService.getUser();
          return $http.get('/api/trades/withUser/' + user._id + '?tradeType=' + JSON.stringify(tradeType))
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
                // console.log(trades);
              return trades;
            })
        }
      },
      // onExit: function($http, $stateParams, SessionService, socket) {
      //   $http.put('/api/trades/offline', {
      //     tradeID: $stateParams.tradeID
      //   });
      //   socket.disconnect();
      // }
    })
});

app.controller("AdminReForReInteractionController", function($rootScope, $state, $scope, $http, AuthService, $window, SessionService, socket, $stateParams, trade, p1Events, p2Events, currentTrades) {
  $scope.user = SessionService.getUser();
  if (!SessionService.getUser()) {
    $state.go('login');
  } else {
    $window.localStorage.removeItem('returnstate');
    $window.localStorage.removeItem('tid');
  }
  $scope.trade = trade;
  $scope.msgHistory = trade.messages;
  $scope.currentTrades = currentTrades;
  $scope.p1Events = p1Events;
  $scope.p2Events = p2Events;
  $scope.stateParams = $stateParams;
});