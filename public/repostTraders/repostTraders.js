app.config(function($stateProvider) {
  $stateProvider
    .state('adminRepostTraders', {
      url: '/admin/reposttraders',
      templateUrl: 'js/repostTraders/repostTraders.html',
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyZXBvc3RUcmFkZXJzL3JlcG9zdFRyYWRlcnMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyXHJcbiAgICAuc3RhdGUoJ2FkbWluUmVwb3N0VHJhZGVycycsIHtcclxuICAgICAgdXJsOiAnL2FkbWluL3JlcG9zdHRyYWRlcnMnLFxyXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL3JlcG9zdFRyYWRlcnMvcmVwb3N0VHJhZGVycy5odG1sJyxcclxuICAgICAgY29udHJvbGxlcjogJ2FkbWluUmVGb3JSZUxpc3RzQ29udHJvbGxlcicsXHJcbiAgICAgIHJlc29sdmU6IHtcclxuICAgICAgICBjdXJyZW50VHJhZGVzOiBmdW5jdGlvbigkaHR0cCwgU2Vzc2lvblNlcnZpY2UpIHtcclxuICAgICAgICAgIHZhciB1c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICAgICAgICAgaWYgKHVzZXIpIHtcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS90cmFkZXMvd2l0aFVzZXIvJyArIHVzZXIuX2lkKVxyXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRyYWRlcyA9IHJlcy5kYXRhO1xyXG4gICAgICAgICAgICAgICAgdHJhZGVzID0gdHJhZGVzLmZpbHRlcihmdW5jdGlvbih0cmFkZSkge1xyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gKCEhdHJhZGUucDEudXNlciAmJiAhIXRyYWRlLnAyLnVzZXIpXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgdHJhZGVzLmZvckVhY2goZnVuY3Rpb24odHJhZGUpIHtcclxuICAgICAgICAgICAgICAgICAgdHJhZGUub3RoZXIgPSAodHJhZGUucDEudXNlci5faWQgPT0gdXNlci5faWQpID8gdHJhZGUucDIgOiB0cmFkZS5wMTtcclxuICAgICAgICAgICAgICAgICAgdHJhZGUudXNlciA9ICh0cmFkZS5wMS51c2VyLl9pZCA9PSB1c2VyLl9pZCkgPyB0cmFkZS5wMSA6IHRyYWRlLnAyO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJhZGVzO1xyXG4gICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmYXZvcml0ZXM6IGZ1bmN0aW9uKCRodHRwLCBTZXNzaW9uU2VydmljZSkge1xyXG4gICAgICAgICAgdmFyIHVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgICAgICBpZiAodXNlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3RyYWRlcy9kb25lV2l0aFVzZXIvJyArIHVzZXIuX2lkKVxyXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRyYWRlcyA9IHJlcy5kYXRhO1xyXG4gICAgICAgICAgICAgICAgdHJhZGVzID0gdHJhZGVzLmZpbHRlcihmdW5jdGlvbih0cmFkZSkge1xyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gKCEhdHJhZGUucDEudXNlciAmJiAhIXRyYWRlLnAyLnVzZXIpXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgdmFyIGZhdnMgPSB0cmFkZXMubWFwKGZ1bmN0aW9uKHRyYWRlKSB7XHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiAoKHRyYWRlLnAxLnVzZXIuX2lkID09IHVzZXIuX2lkKSA/IHRyYWRlLnAyLnVzZXIgOiB0cmFkZS5wMS51c2VyKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAvLyBmYXZzID0gZmF2cy5maWx0ZXIoZnVuY3Rpb24oZmF2VXNlcikge1xyXG4gICAgICAgICAgICAgICAgLy8gICAgIHZhciBvayA9IHRydWU7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgY3VycmVudFRyYWRlcy5mb3JFYWNoKGZ1bmN0aW9uKHRyYWRlKSB7XHJcbiAgICAgICAgICAgICAgICAvLyAgICAgICBpZiAodHJhZGUucDEudXNlci5faWQgPT0gZmF2VXNlci5faWQgfHwgdHJhZGUucDIudXNlci5faWQgPT0gZmF2VXNlci5faWQpIHtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgICAgb2sgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgIC8vICAgICAgIH1cclxuICAgICAgICAgICAgICAgIC8vICAgICB9KVxyXG4gICAgICAgICAgICAgICAgLy8gICAgIHJldHVybiBvaztcclxuICAgICAgICAgICAgICAgIC8vICAgfSlcclxuICAgICAgICAgICAgICAgIHZhciBmYXZzTm9EdXBzID0gW107XHJcbiAgICAgICAgICAgICAgICBmYXZzLmZvckVhY2goZnVuY3Rpb24oZmF2VXNlcikge1xyXG4gICAgICAgICAgICAgICAgICB2YXIgb2sgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICBmYXZzTm9EdXBzLmZvckVhY2goZnVuY3Rpb24obm9EdXBVc2VyKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZhdlVzZXIuX2lkID09IG5vRHVwVXNlci5faWQpIG9rID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICAgIGlmIChvaykgZmF2c05vRHVwcy5wdXNoKGZhdlVzZXIpO1xyXG4gICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgIHJldHVybiBmYXZzTm9EdXBzO1xyXG4gICAgICAgICAgICAgIH0pLnRoZW4obnVsbCwgY29uc29sZS5sb2cpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgb3BlblRyYWRlczogZnVuY3Rpb24oJGh0dHAsIFNlc3Npb25TZXJ2aWNlKSB7XHJcbiAgICAgICAgICB2YXIgdXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcclxuICAgICAgICAgIGlmICh1c2VyKSB7XHJcbiAgICAgICAgICAgIHZhciBtaW5Gb2xsb3dlciA9ICgodXNlci5zb3VuZGNsb3VkLmZvbGxvd2VycyAmJiB1c2VyLnNvdW5kY2xvdWQuZm9sbG93ZXJzID4gMCkgPyBwYXJzZUludCh1c2VyLnNvdW5kY2xvdWQuZm9sbG93ZXJzIC8gMikgOiAwKTtcclxuICAgICAgICAgICAgdmFyIG1heEZvbGxvd2VyID0gKCh1c2VyLnNvdW5kY2xvdWQuZm9sbG93ZXJzICYmIHVzZXIuc291bmRjbG91ZC5mb2xsb3dlcnMgPiAwKSA/IHBhcnNlSW50KHVzZXIuc291bmRjbG91ZC5mb2xsb3dlcnMgKiAyKSA6IDEwMDApO1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS91c2Vycy9ieVNDVVJMLycsIHtcclxuICAgICAgICAgICAgICAgIHVybDogJycsXHJcbiAgICAgICAgICAgICAgICBtaW5Gb2xsb3dlcjogbWluRm9sbG93ZXIsXHJcbiAgICAgICAgICAgICAgICBtYXhGb2xsb3dlcjogbWF4Rm9sbG93ZXIsXHJcbiAgICAgICAgICAgICAgICByZWNvcmRSYW5nZToge1xyXG4gICAgICAgICAgICAgICAgICBza2lwOiAwLFxyXG4gICAgICAgICAgICAgICAgICBsaW1pdDogMTJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHVzZXJzID0gcmVzLmRhdGE7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdXNlcnM7XHJcbiAgICAgICAgICAgICAgfSkudGhlbihudWxsLCBjb25zb2xlLmxvZyk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXBvc3RFdmVudHM6IGZ1bmN0aW9uKCRodHRwLCBTZXNzaW9uU2VydmljZSkge1xyXG4gICAgICAgICAgdmFyIHVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgICAgICBpZiAodXNlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KFwiL2FwaS9ldmVudHMvZ2V0UmVwb3N0RXZlbnRzL1wiICsgdXNlci5faWQpXHJcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVwb3N0RXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIHZhciByZXBvc3RFdmVudCA9IHJlcG9zdEV2ZW50LmRhdGE7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVwb3N0RXZlbnQ7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxufSk7XHJcblxyXG5hcHAuY29udHJvbGxlcihcImFkbWluUmVGb3JSZUxpc3RzQ29udHJvbGxlclwiLCBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsIGN1cnJlbnRUcmFkZXMsIGZhdm9yaXRlcywgb3BlblRyYWRlcywgcmVwb3N0RXZlbnRzLCAkaHR0cCwgU2Vzc2lvblNlcnZpY2UsICRzdGF0ZSwgJHRpbWVvdXQsICR3aW5kb3cpIHtcclxuICBpZiAoIVNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKSkge1xyXG4gICAgJHN0YXRlLmdvKCdsb2dpbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICAkc2NvcGUuY3VyQVRVc2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICRzY29wZS5pc0xvZ2dlZEluID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICRzY29wZS5saXN0ZXZlbnRzID0gcmVwb3N0RXZlbnRzO1xyXG4gICRzY29wZS5jdXJyZW50VHJhZGVzID0gY3VycmVudFRyYWRlcztcclxuICAkc2NvcGUuY3VycmVudFRyYWRlc0NvcHkgPSBjdXJyZW50VHJhZGVzO1xyXG4gICRzY29wZS5mYXZvcml0ZXMgPSBmYXZvcml0ZXM7XHJcbiAgJHNjb3BlLnNlYXJjaFVzZXIgPSBvcGVuVHJhZGVzO1xyXG4gIHJlcG9zdEV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2KSB7XHJcbiAgICBldi5kYXkgPSBuZXcgRGF0ZShldi5kYXkpO1xyXG4gIH0pO1xyXG4gICRzY29wZS5ldmVudHMgPSByZXBvc3RFdmVudHM7XHJcbn0pOyJdLCJmaWxlIjoicmVwb3N0VHJhZGVycy9yZXBvc3RUcmFkZXJzLmpzIn0=
