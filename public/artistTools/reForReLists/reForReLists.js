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
                trades = trades.filter(function(trade) {
                  return (!!trade.p1.user && !!trade.p2.user)
                })
                console.log(trades);
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
            var maxFollower = ((user.soundcloud.followers && user.soundcloud.followers > 0) ? parseInt(user.soundcloud.followers * 1.2) : 1000);
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

app.controller("ReForReListsController", function($scope, $rootScope, currentTrades, favorites, openTrades, repostEvents, $http, SessionService, $state, $timeout, $window) {
  if (!SessionService.getUser()) {
    $window.localStorage.setItem('returnstate', 'reForReLists');
    $state.go('login');
    return;
  }
  $scope.listevents = [];
  $scope.user = SessionService.getUser();
  $scope.currentTrades = currentTrades;
  $scope.currentTradesCopy = currentTrades;
  $scope.favorites = favorites;
  $scope.searchUser = openTrades;
  repostEvents.forEach(function(ev) {
    ev.day = new Date(ev.trackInfo.day);
  });
  $scope.events = repostEvents;
  angular.forEach(repostEvents, function(e) {
    if (getshortdate(new Date(e.trackInfo.day)) >= getshortdate(new Date())) {
      $scope.listevents.push(e);
    }
  });
  $scope.manageSlots = false;
  for (var i = 0; i < $scope.listevents.length; i++) {
    if ($scope.listevents[i].trackInfo.trackURL == undefined) {
      $scope.manageSlots = true;
      return;
    }
  }

  function getshortdate(d) {
    var YYYY = d.getFullYear();
    var M = d.getMonth() + 1;
    var D = d.getDate();
    var MM = (M < 10) ? ('0' + M) : M;
    var DD = (D < 10) ? ('0' + D) : D;
    var result = MM + "/" + DD + "/" + YYYY;
    return result;
  }
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcnRpc3RUb29scy9yZUZvclJlTGlzdHMvcmVGb3JSZUxpc3RzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlclxyXG4gICAgLnN0YXRlKCdyZUZvclJlTGlzdHMnLCB7XHJcbiAgICAgIHVybDogJy9hcnRpc3RUb29scy9yZUZvclJlTGlzdHMnLFxyXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2FydGlzdFRvb2xzL3JlRm9yUmVMaXN0cy9yZUZvclJlTGlzdHMuaHRtbCcsXHJcbiAgICAgIGNvbnRyb2xsZXI6ICdSZUZvclJlTGlzdHNDb250cm9sbGVyJyxcclxuICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgIGN1cnJlbnRUcmFkZXM6IGZ1bmN0aW9uKCRodHRwLCBTZXNzaW9uU2VydmljZSkge1xyXG4gICAgICAgICAgdmFyIHVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgICAgICBpZiAodXNlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3RyYWRlcy93aXRoVXNlci8nICsgdXNlci5faWQpXHJcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgICB2YXIgdHJhZGVzID0gcmVzLmRhdGE7XHJcbiAgICAgICAgICAgICAgICB0cmFkZXMgPSB0cmFkZXMuZmlsdGVyKGZ1bmN0aW9uKHRyYWRlKSB7XHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiAoISF0cmFkZS5wMS51c2VyICYmICEhdHJhZGUucDIudXNlcilcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0cmFkZXMpO1xyXG4gICAgICAgICAgICAgICAgdHJhZGVzLmZvckVhY2goZnVuY3Rpb24odHJhZGUpIHtcclxuICAgICAgICAgICAgICAgICAgdHJhZGUub3RoZXIgPSAodHJhZGUucDEudXNlci5faWQgPT0gdXNlci5faWQpID8gdHJhZGUucDIgOiB0cmFkZS5wMTtcclxuICAgICAgICAgICAgICAgICAgdHJhZGUudXNlciA9ICh0cmFkZS5wMS51c2VyLl9pZCA9PSB1c2VyLl9pZCkgPyB0cmFkZS5wMSA6IHRyYWRlLnAyO1xyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJhZGVzO1xyXG4gICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICBmYXZvcml0ZXM6IGZ1bmN0aW9uKCRodHRwLCBTZXNzaW9uU2VydmljZSkge1xyXG4gICAgICAgICAgdmFyIHVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgICAgICBpZiAodXNlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3RyYWRlcy9kb25lV2l0aFVzZXIvJyArIHVzZXIuX2lkKVxyXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHRyYWRlcyA9IHJlcy5kYXRhO1xyXG4gICAgICAgICAgICAgICAgdHJhZGVzID0gdHJhZGVzLmZpbHRlcihmdW5jdGlvbih0cmFkZSkge1xyXG4gICAgICAgICAgICAgICAgICByZXR1cm4gKCEhdHJhZGUucDEudXNlciAmJiAhIXRyYWRlLnAyLnVzZXIpXHJcbiAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgdmFyIGZhdnMgPSB0cmFkZXMubWFwKGZ1bmN0aW9uKHRyYWRlKSB7XHJcbiAgICAgICAgICAgICAgICAgIHJldHVybiAoKHRyYWRlLnAxLnVzZXIuX2lkID09IHVzZXIuX2lkKSA/IHRyYWRlLnAyLnVzZXIgOiB0cmFkZS5wMS51c2VyKVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICB2YXIgZmF2c05vRHVwcyA9IFtdO1xyXG4gICAgICAgICAgICAgICAgZmF2cy5mb3JFYWNoKGZ1bmN0aW9uKGZhdlVzZXIpIHtcclxuICAgICAgICAgICAgICAgICAgdmFyIG9rID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICAgZmF2c05vRHVwcy5mb3JFYWNoKGZ1bmN0aW9uKG5vRHVwVXNlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIGlmIChmYXZVc2VyLl9pZCA9PSBub0R1cFVzZXIuX2lkKSBvayA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICBpZiAob2spIGZhdnNOb0R1cHMucHVzaChmYXZVc2VyKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgICByZXR1cm4gZmF2c05vRHVwcztcclxuICAgICAgICAgICAgICB9KS50aGVuKG51bGwsIGNvbnNvbGUubG9nKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9LFxyXG4gICAgICAgIG9wZW5UcmFkZXM6IGZ1bmN0aW9uKCRodHRwLCBTZXNzaW9uU2VydmljZSkge1xyXG4gICAgICAgICAgdmFyIHVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgICAgICBpZiAodXNlcikge1xyXG4gICAgICAgICAgICB2YXIgbWluRm9sbG93ZXIgPSAoKHVzZXIuc291bmRjbG91ZC5mb2xsb3dlcnMgJiYgdXNlci5zb3VuZGNsb3VkLmZvbGxvd2VycyA+IDApID8gcGFyc2VJbnQodXNlci5zb3VuZGNsb3VkLmZvbGxvd2VycyAvIDIpIDogMCk7XHJcbiAgICAgICAgICAgIHZhciBtYXhGb2xsb3dlciA9ICgodXNlci5zb3VuZGNsb3VkLmZvbGxvd2VycyAmJiB1c2VyLnNvdW5kY2xvdWQuZm9sbG93ZXJzID4gMCkgPyBwYXJzZUludCh1c2VyLnNvdW5kY2xvdWQuZm9sbG93ZXJzICogMS4yKSA6IDEwMDApO1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS91c2Vycy9ieVNDVVJMLycsIHtcclxuICAgICAgICAgICAgICAgIHVybDogJycsXHJcbiAgICAgICAgICAgICAgICBtaW5Gb2xsb3dlcjogbWluRm9sbG93ZXIsXHJcbiAgICAgICAgICAgICAgICBtYXhGb2xsb3dlcjogbWF4Rm9sbG93ZXIsXHJcbiAgICAgICAgICAgICAgICByZWNvcmRSYW5nZToge1xyXG4gICAgICAgICAgICAgICAgICBza2lwOiAwLFxyXG4gICAgICAgICAgICAgICAgICBsaW1pdDogMTJcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgdmFyIHVzZXJzID0gcmVzLmRhdGE7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gdXNlcnM7XHJcbiAgICAgICAgICAgICAgfSkudGhlbihudWxsLCBjb25zb2xlLmxvZyk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSxcclxuICAgICAgICByZXBvc3RFdmVudHM6IGZ1bmN0aW9uKCRodHRwLCBTZXNzaW9uU2VydmljZSkge1xyXG4gICAgICAgICAgdmFyIHVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgICAgICBpZiAodXNlcikge1xyXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KFwiL2FwaS9ldmVudHMvZ2V0UmVwb3N0RXZlbnRzL1wiICsgdXNlci5faWQpXHJcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVwb3N0RXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIHZhciByZXBvc3RFdmVudCA9IHJlcG9zdEV2ZW50LmRhdGE7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVwb3N0RXZlbnQ7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgICByZXR1cm4gW107XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxufSk7XHJcblxyXG5hcHAuY29udHJvbGxlcihcIlJlRm9yUmVMaXN0c0NvbnRyb2xsZXJcIiwgZnVuY3Rpb24oJHNjb3BlLCAkcm9vdFNjb3BlLCBjdXJyZW50VHJhZGVzLCBmYXZvcml0ZXMsIG9wZW5UcmFkZXMsIHJlcG9zdEV2ZW50cywgJGh0dHAsIFNlc3Npb25TZXJ2aWNlLCAkc3RhdGUsICR0aW1lb3V0LCAkd2luZG93KSB7XHJcbiAgaWYgKCFTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkpIHtcclxuICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3JldHVybnN0YXRlJywgJ3JlRm9yUmVMaXN0cycpO1xyXG4gICAgJHN0YXRlLmdvKCdsb2dpbicpO1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICAkc2NvcGUubGlzdGV2ZW50cyA9IFtdO1xyXG4gICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICRzY29wZS5jdXJyZW50VHJhZGVzID0gY3VycmVudFRyYWRlcztcclxuICAkc2NvcGUuY3VycmVudFRyYWRlc0NvcHkgPSBjdXJyZW50VHJhZGVzO1xyXG4gICRzY29wZS5mYXZvcml0ZXMgPSBmYXZvcml0ZXM7XHJcbiAgJHNjb3BlLnNlYXJjaFVzZXIgPSBvcGVuVHJhZGVzO1xyXG4gIHJlcG9zdEV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGV2KSB7XHJcbiAgICBldi5kYXkgPSBuZXcgRGF0ZShldi50cmFja0luZm8uZGF5KTtcclxuICB9KTtcclxuICAkc2NvcGUuZXZlbnRzID0gcmVwb3N0RXZlbnRzO1xyXG4gIGFuZ3VsYXIuZm9yRWFjaChyZXBvc3RFdmVudHMsIGZ1bmN0aW9uKGUpIHtcclxuICAgIGlmIChnZXRzaG9ydGRhdGUobmV3IERhdGUoZS50cmFja0luZm8uZGF5KSkgPj0gZ2V0c2hvcnRkYXRlKG5ldyBEYXRlKCkpKSB7XHJcbiAgICAgICRzY29wZS5saXN0ZXZlbnRzLnB1c2goZSk7XHJcbiAgICB9XHJcbiAgfSk7XHJcbiAgJHNjb3BlLm1hbmFnZVNsb3RzID0gZmFsc2U7XHJcbiAgZm9yICh2YXIgaSA9IDA7IGkgPCAkc2NvcGUubGlzdGV2ZW50cy5sZW5ndGg7IGkrKykge1xyXG4gICAgaWYgKCRzY29wZS5saXN0ZXZlbnRzW2ldLnRyYWNrSW5mby50cmFja1VSTCA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgJHNjb3BlLm1hbmFnZVNsb3RzID0gdHJ1ZTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZ2V0c2hvcnRkYXRlKGQpIHtcclxuICAgIHZhciBZWVlZID0gZC5nZXRGdWxsWWVhcigpO1xyXG4gICAgdmFyIE0gPSBkLmdldE1vbnRoKCkgKyAxO1xyXG4gICAgdmFyIEQgPSBkLmdldERhdGUoKTtcclxuICAgIHZhciBNTSA9IChNIDwgMTApID8gKCcwJyArIE0pIDogTTtcclxuICAgIHZhciBERCA9IChEIDwgMTApID8gKCcwJyArIEQpIDogRDtcclxuICAgIHZhciByZXN1bHQgPSBNTSArIFwiL1wiICsgREQgKyBcIi9cIiArIFlZWVk7XHJcbiAgICByZXR1cm4gcmVzdWx0O1xyXG4gIH1cclxufSk7Il0sImZpbGUiOiJhcnRpc3RUb29scy9yZUZvclJlTGlzdHMvcmVGb3JSZUxpc3RzLmpzIn0=
