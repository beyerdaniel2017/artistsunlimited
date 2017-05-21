app.config(function($stateProvider) {
  $stateProvider
    .state('thirdpartyRepostTraders', {
      url: '/thirdparty/reposttraders',
      templateUrl: 'js/thirdpartyStep/repostTraders/repostTraders.html',
      controller: 'adminReForReListsController',
      resolve: {
        currentTrades: function($http, SessionService) {
          var user = SessionService.getUser();
          if (user) {
            return $http.get('/api/trades/withUser/' + user._id)
              .then(function(res) {
                var trades = res.data;
                trades = trades.filter(function(trade) {
                  return (!!trade.p1.user && !!trade.p2.user)
                })
                trades.forEach(function(trade) {
                  trade.other = (trade.p1.user._id == user._id) ? trade.p2 : trade.p1;
                  trade.user = (trade.p1.user._id == user._id) ? trade.p1 : trade.p2;
                });
                return trades;
              })
          } else {
            return [];
          }
        },
        favorites: function($http, SessionService) {
          var user = SessionService.getUser();
          if (user) {
            return $http.get('/api/trades/doneWithUser/' + user._id)
              .then(function(res) {
                var trades = res.data;
                trades = trades.filter(function(trade) {
                  return (!!trade.p1.user && !!trade.p2.user)
                })
                var favs = trades.map(function(trade) {
                  return ((trade.p1.user._id == user._id) ? trade.p2.user : trade.p1.user)
                });
                // favs = favs.filter(function(favUser) {
                //     var ok = true;
                //     currentTrades.forEach(function(trade) {
                //       if (trade.p1.user._id == favUser._id || trade.p2.user._id == favUser._id) {
                //         ok = false;
                //       }
                //     })
                //     return ok;
                //   })
                var favsNoDups = [];
                favs.forEach(function(favUser) {
                  var ok = true;
                  favsNoDups.forEach(function(noDupUser) {
                    if (favUser._id == noDupUser._id) ok = false;
                  })
                  if (ok) favsNoDups.push(favUser);
                })
                return favsNoDups;
              }).then(null, console.log);
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
                var users = res.data;
                return users;
              }).then(null, console.log);
          } else {
            return [];
          }
        },
        repostEvents: function($http, SessionService) {
          var user = SessionService.getUser();
          if (user) {
            return $http.get("/api/events/getRepostEvents/" + user._id)
              .then(function(repostEvent) {
                var repostEvent = repostEvent.data;
                return repostEvent;
              });
          } else {
            return [];
          }
        }
      }
    });
});

app.controller("adminReForReListsController", function($scope, $rootScope, currentTrades, favorites, openTrades, repostEvents, $http, SessionService, $state, $timeout, $window) {
  if (!SessionService.getUser()) {
    $state.go('login');
    return;
  }
  $scope.curATUser = SessionService.getUser();
  $scope.isLoggedIn = SessionService.getUser() ? true : false;
  $scope.listevents = repostEvents;
  $scope.currentTrades = currentTrades;
  $scope.currentTradesCopy = currentTrades;
  $scope.favorites = favorites;
  $scope.searchUser = openTrades;
  repostEvents.forEach(function(ev) {
    ev.day = new Date(ev.day);
  });
  $scope.events = repostEvents;
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJ0aGlyZHBhcnR5U3RlcC9yZXBvc3RUcmFkZXJzL3JlcG9zdFRyYWRlcnMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyXHJcbiAgICAuc3RhdGUoJ3RoaXJkcGFydHlSZXBvc3RUcmFkZXJzJywge1xyXG4gICAgICB1cmw6ICcvdGhpcmRwYXJ0eS9yZXBvc3R0cmFkZXJzJyxcclxuICAgICAgdGVtcGxhdGVVcmw6ICdqcy90aGlyZHBhcnR5U3RlcC9yZXBvc3RUcmFkZXJzL3JlcG9zdFRyYWRlcnMuaHRtbCcsXHJcbiAgICAgIGNvbnRyb2xsZXI6ICdhZG1pblJlRm9yUmVMaXN0c0NvbnRyb2xsZXInLFxyXG4gICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgY3VycmVudFRyYWRlczogZnVuY3Rpb24oJGh0dHAsIFNlc3Npb25TZXJ2aWNlKSB7XHJcbiAgICAgICAgICB2YXIgdXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcclxuICAgICAgICAgIGlmICh1c2VyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvdHJhZGVzL3dpdGhVc2VyLycgKyB1c2VyLl9pZClcclxuICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0cmFkZXMgPSByZXMuZGF0YTtcclxuICAgICAgICAgICAgICAgIHRyYWRlcyA9IHRyYWRlcy5maWx0ZXIoZnVuY3Rpb24odHJhZGUpIHtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuICghIXRyYWRlLnAxLnVzZXIgJiYgISF0cmFkZS5wMi51c2VyKVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIHRyYWRlcy5mb3JFYWNoKGZ1bmN0aW9uKHRyYWRlKSB7XHJcbiAgICAgICAgICAgICAgICAgIHRyYWRlLm90aGVyID0gKHRyYWRlLnAxLnVzZXIuX2lkID09IHVzZXIuX2lkKSA/IHRyYWRlLnAyIDogdHJhZGUucDE7XHJcbiAgICAgICAgICAgICAgICAgIHRyYWRlLnVzZXIgPSAodHJhZGUucDEudXNlci5faWQgPT0gdXNlci5faWQpID8gdHJhZGUucDEgOiB0cmFkZS5wMjtcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyYWRlcztcclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgZmF2b3JpdGVzOiBmdW5jdGlvbigkaHR0cCwgU2Vzc2lvblNlcnZpY2UpIHtcclxuICAgICAgICAgIHZhciB1c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICAgICAgICAgaWYgKHVzZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS90cmFkZXMvZG9uZVdpdGhVc2VyLycgKyB1c2VyLl9pZClcclxuICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgICAgIHZhciB0cmFkZXMgPSByZXMuZGF0YTtcclxuICAgICAgICAgICAgICAgIHRyYWRlcyA9IHRyYWRlcy5maWx0ZXIoZnVuY3Rpb24odHJhZGUpIHtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuICghIXRyYWRlLnAxLnVzZXIgJiYgISF0cmFkZS5wMi51c2VyKVxyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIHZhciBmYXZzID0gdHJhZGVzLm1hcChmdW5jdGlvbih0cmFkZSkge1xyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gKCh0cmFkZS5wMS51c2VyLl9pZCA9PSB1c2VyLl9pZCkgPyB0cmFkZS5wMi51c2VyIDogdHJhZGUucDEudXNlcilcclxuICAgICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgICAgICAgLy8gZmF2cyA9IGZhdnMuZmlsdGVyKGZ1bmN0aW9uKGZhdlVzZXIpIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICB2YXIgb2sgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIGN1cnJlbnRUcmFkZXMuZm9yRWFjaChmdW5jdGlvbih0cmFkZSkge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgICAgaWYgKHRyYWRlLnAxLnVzZXIuX2lkID09IGZhdlVzZXIuX2lkIHx8IHRyYWRlLnAyLnVzZXIuX2lkID09IGZhdlVzZXIuX2lkKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICAgIG9rID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgfSlcclxuICAgICAgICAgICAgICAgIC8vICAgICByZXR1cm4gb2s7XHJcbiAgICAgICAgICAgICAgICAvLyAgIH0pXHJcbiAgICAgICAgICAgICAgICB2YXIgZmF2c05vRHVwcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZmF2cy5mb3JFYWNoKGZ1bmN0aW9uKGZhdlVzZXIpIHtcclxuICAgICAgICAgICAgICAgICAgdmFyIG9rID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgZmF2c05vRHVwcy5mb3JFYWNoKGZ1bmN0aW9uKG5vRHVwVXNlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmYXZVc2VyLl9pZCA9PSBub0R1cFVzZXIuX2lkKSBvayA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICBpZiAob2spIGZhdnNOb0R1cHMucHVzaChmYXZVc2VyKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmF2c05vRHVwcztcclxuICAgICAgICAgICAgICB9KS50aGVuKG51bGwsIGNvbnNvbGUubG9nKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9wZW5UcmFkZXM6IGZ1bmN0aW9uKCRodHRwLCBTZXNzaW9uU2VydmljZSkge1xyXG4gICAgICAgICAgdmFyIHVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgICAgICBpZiAodXNlcikge1xyXG4gICAgICAgICAgICB2YXIgbWluRm9sbG93ZXIgPSAoKHVzZXIuc291bmRjbG91ZC5mb2xsb3dlcnMgJiYgdXNlci5zb3VuZGNsb3VkLmZvbGxvd2VycyA+IDApID8gcGFyc2VJbnQodXNlci5zb3VuZGNsb3VkLmZvbGxvd2VycyAvIDIpIDogMCk7XHJcbiAgICAgICAgICAgIHZhciBtYXhGb2xsb3dlciA9ICgodXNlci5zb3VuZGNsb3VkLmZvbGxvd2VycyAmJiB1c2VyLnNvdW5kY2xvdWQuZm9sbG93ZXJzID4gMCkgPyBwYXJzZUludCh1c2VyLnNvdW5kY2xvdWQuZm9sbG93ZXJzICogMikgOiAxMDAwKTtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvdXNlcnMvYnlTQ1VSTC8nLCB7XHJcbiAgICAgICAgICAgICAgICB1cmw6ICcnLFxyXG4gICAgICAgICAgICAgICAgbWluRm9sbG93ZXI6IG1pbkZvbGxvd2VyLFxyXG4gICAgICAgICAgICAgICAgbWF4Rm9sbG93ZXI6IG1heEZvbGxvd2VyLFxyXG4gICAgICAgICAgICAgICAgcmVjb3JkUmFuZ2U6IHtcclxuICAgICAgICAgICAgICAgICAgc2tpcDogMCxcclxuICAgICAgICAgICAgICAgICAgbGltaXQ6IDEyXHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgICAgIHZhciB1c2VycyA9IHJlcy5kYXRhO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHVzZXJzO1xyXG4gICAgICAgICAgICAgIH0pLnRoZW4obnVsbCwgY29uc29sZS5sb2cpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcmVwb3N0RXZlbnRzOiBmdW5jdGlvbigkaHR0cCwgU2Vzc2lvblNlcnZpY2UpIHtcclxuICAgICAgICAgIHZhciB1c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICAgICAgICAgaWYgKHVzZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldChcIi9hcGkvZXZlbnRzL2dldFJlcG9zdEV2ZW50cy9cIiArIHVzZXIuX2lkKVxyXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcG9zdEV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgcmVwb3N0RXZlbnQgPSByZXBvc3RFdmVudC5kYXRhO1xyXG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlcG9zdEV2ZW50O1xyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSk7XHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoXCJhZG1pblJlRm9yUmVMaXN0c0NvbnRyb2xsZXJcIiwgZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlLCBjdXJyZW50VHJhZGVzLCBmYXZvcml0ZXMsIG9wZW5UcmFkZXMsIHJlcG9zdEV2ZW50cywgJGh0dHAsIFNlc3Npb25TZXJ2aWNlLCAkc3RhdGUsICR0aW1lb3V0LCAkd2luZG93KSB7XHJcbiAgaWYgKCFTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkpIHtcclxuICAgICRzdGF0ZS5nbygnbG9naW4nKTtcclxuICAgIHJldHVybjtcclxuICB9XHJcbiAgJHNjb3BlLmN1ckFUVXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcclxuICAkc2NvcGUuaXNMb2dnZWRJbiA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKSA/IHRydWUgOiBmYWxzZTtcclxuICAkc2NvcGUubGlzdGV2ZW50cyA9IHJlcG9zdEV2ZW50cztcclxuICAkc2NvcGUuY3VycmVudFRyYWRlcyA9IGN1cnJlbnRUcmFkZXM7XHJcbiAgJHNjb3BlLmN1cnJlbnRUcmFkZXNDb3B5ID0gY3VycmVudFRyYWRlcztcclxuICAkc2NvcGUuZmF2b3JpdGVzID0gZmF2b3JpdGVzO1xyXG4gICRzY29wZS5zZWFyY2hVc2VyID0gb3BlblRyYWRlcztcclxuICByZXBvc3RFdmVudHMuZm9yRWFjaChmdW5jdGlvbihldikge1xyXG4gICAgZXYuZGF5ID0gbmV3IERhdGUoZXYuZGF5KTtcclxuICB9KTtcclxuICAkc2NvcGUuZXZlbnRzID0gcmVwb3N0RXZlbnRzO1xyXG59KTsiXSwiZmlsZSI6InRoaXJkcGFydHlTdGVwL3JlcG9zdFRyYWRlcnMvcmVwb3N0VHJhZGVycy5qcyJ9
