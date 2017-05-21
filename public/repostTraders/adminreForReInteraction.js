app.config(function($stateProvider) {
  $stateProvider
    .state('adminreForReInteraction', {
      url: '/admin/trade/:user1Name/:user2Name',
      templateUrl: 'js/repostTraders/_reForReInteraction.html',
      controller: 'AdminReForReInteractionController',
      resolve: {
        login: function($rootScope, $http, $stateParams, $window, SessionService, $state) {
          if (SessionService.getUser()) {
            return $rootScope.getUserNetwork()
              .then(function() {
                var repName = !!SessionService.getUser().soundcloud ? SessionService.getUser().soundcloud.pseudoname : "";
                if (repName == $stateParams.user1Name || repName == $stateParams.user2Name) {
                  return 'ok'
                } else {
                  var found = $rootScope.userlinkedAccounts.find(function(user) {
                    var repName = user.soundcloud.pseudoname;
                    return (repName == $stateParams.user1Name || repName == $stateParams.user2Name)
                  })
                  if (found) {
                    $rootScope.changeUserAdmin(found)
                  } else {
                    if ($window.localStorage.getItem('returnstate') == 'reForReInteraction') {
                      $window.localStorage.removeItem('returnstate');
                      $window.localStorage.removeItem('user1Name');
                      $window.localStorage.removeItem('user2Name');
                      $state.go('scheduler');
                    } else {
                      $window.localStorage.setItem('returnstate', 'reForReInteraction');
                      $window.localStorage.setItem('user1Name', $stateParams.user1Name);
                      $window.localStorage.setItem('user2Name', $stateParams.user2Name);
                      SessionService.deleteUser();
                      window.location.href = '/login';
                    }
                  }
                }
              });
          } else {
            $window.localStorage.setItem('returnstate', 'reForReInteraction');
            $window.localStorage.setItem('user1Name', $stateParams.user1Name);
            $window.localStorage.setItem('user2Name', $stateParams.user2Name);
            SessionService.deleteUser();
            window.location.href = '/login';
          }
        },
        trade: function($rootScope, $http, $stateParams, $window, SessionService) {
          return $http.get('/api/trades/withUsers/' + $stateParams.user1Name + '/' + $stateParams.user2Name)
            .then(function(res) {
              var user = SessionService.getUser('subAdmin');
              var trade = res.data;
              trade.p1.user.pseudoAvailableSlots = createPseudoAvailableSlots(trade.p1.user);
              trade.p2.user.pseudoAvailableSlots = createPseudoAvailableSlots(trade.p2.user);
              trade.other = (trade.p1.user._id == user._id) ? trade.p2 : trade.p1;
              trade.user = (trade.p1.user._id == user._id) ? trade.p1 : trade.p2;
              return trade;
            }).then(null, console.log)
        },
        events: function($http, $window, SessionService) {
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
        // currentTrades: function($http, SessionService) {
        //   var tradeType = {
        //     Requests: true,
        //     Requested: true,
        //     TradePartners: true
        //   };
        //   var user = SessionService.getUser();
        //   return $http.get('/api/trades/withUser/' + user._id + '?tradeType=' + JSON.stringify(tradeType))
        //     .then(function(res) {
        //       var trades = res.data;
        //       trades.forEach(function(trade) {
        //         trade.p1.user.pseudoAvailableSlots = createPseudoAvailableSlots(trade.p1.user);
        //         trade.p2.user.pseudoAvailableSlots = createPseudoAvailableSlots(trade.p2.user);
        //         trade.other = (trade.p1.user._id == user._id) ? trade.p2 : trade.p1;
        //         trade.user = (trade.p1.user._id == user._id) ? trade.p1 : trade.p2;
        //       });
        //       trades.sort(function(a, b) {
        //         if (a.user.alert == "change") {
        //           return -1;
        //         } else if (a.user.alert == "placement") {
        //           return -1
        //         } else {
        //           return 1;
        //         }
        //       })
        //       return trades;
        //     })
        // }
      }
    })
});

app.controller("AdminReForReInteractionController", function($rootScope, $state, $scope, $http, AuthService, $window, SessionService, socket, $stateParams, trade, p1Events, p2Events) {
  console.log("adminreForReInteraction");
  $scope.user = SessionService.getUser();
  if (!SessionService.getUser()) {
    $state.go('login');
  } else {
    $window.localStorage.removeItem('returnstate');
    $window.localStorage.removeItem('user1ID');
    $window.localStorage.removeItem('user2ID');
  }
  $scope.isLoggedIn = SessionService.getUser() ? true : false;
  $scope.trade = trade;
  $scope.msgHistory = trade.messages;
  // $scope.currentTrades = currentTrades;
  $scope.p1Events = p1Events;
  $scope.p2Events = p2Events;
  $scope.stateParams = $stateParams;
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyZXBvc3RUcmFkZXJzL2FkbWlucmVGb3JSZUludGVyYWN0aW9uLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlclxyXG4gICAgLnN0YXRlKCdhZG1pbnJlRm9yUmVJbnRlcmFjdGlvbicsIHtcclxuICAgICAgdXJsOiAnL2FkbWluL3RyYWRlLzp1c2VyMU5hbWUvOnVzZXIyTmFtZScsXHJcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvcmVwb3N0VHJhZGVycy9fcmVGb3JSZUludGVyYWN0aW9uLmh0bWwnLFxyXG4gICAgICBjb250cm9sbGVyOiAnQWRtaW5SZUZvclJlSW50ZXJhY3Rpb25Db250cm9sbGVyJyxcclxuICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgIGxvZ2luOiBmdW5jdGlvbigkcm9vdFNjb3BlLCAkaHR0cCwgJHN0YXRlUGFyYW1zLCAkd2luZG93LCBTZXNzaW9uU2VydmljZSwgJHN0YXRlKSB7XHJcbiAgICAgICAgICBpZiAoU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiAkcm9vdFNjb3BlLmdldFVzZXJOZXR3b3JrKClcclxuICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgIHZhciByZXBOYW1lID0gISFTZXNzaW9uU2VydmljZS5nZXRVc2VyKCkuc291bmRjbG91ZCA/IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKS5zb3VuZGNsb3VkLnBzZXVkb25hbWUgOiBcIlwiO1xyXG4gICAgICAgICAgICAgICAgaWYgKHJlcE5hbWUgPT0gJHN0YXRlUGFyYW1zLnVzZXIxTmFtZSB8fCByZXBOYW1lID09ICRzdGF0ZVBhcmFtcy51c2VyMk5hbWUpIHtcclxuICAgICAgICAgICAgICAgICAgcmV0dXJuICdvaydcclxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgIHZhciBmb3VuZCA9ICRyb290U2NvcGUudXNlcmxpbmtlZEFjY291bnRzLmZpbmQoZnVuY3Rpb24odXNlcikge1xyXG4gICAgICAgICAgICAgICAgICAgIHZhciByZXBOYW1lID0gdXNlci5zb3VuZGNsb3VkLnBzZXVkb25hbWU7XHJcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChyZXBOYW1lID09ICRzdGF0ZVBhcmFtcy51c2VyMU5hbWUgfHwgcmVwTmFtZSA9PSAkc3RhdGVQYXJhbXMudXNlcjJOYW1lKVxyXG4gICAgICAgICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAgICAgICBpZiAoZm91bmQpIHtcclxuICAgICAgICAgICAgICAgICAgICAkcm9vdFNjb3BlLmNoYW5nZVVzZXJBZG1pbihmb3VuZClcclxuICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgICBpZiAoJHdpbmRvdy5sb2NhbFN0b3JhZ2UuZ2V0SXRlbSgncmV0dXJuc3RhdGUnKSA9PSAncmVGb3JSZUludGVyYWN0aW9uJykge1xyXG4gICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgncmV0dXJuc3RhdGUnKTtcclxuICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3VzZXIxTmFtZScpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2UucmVtb3ZlSXRlbSgndXNlcjJOYW1lJyk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAkc3RhdGUuZ28oJ3NjaGVkdWxlcicpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdyZXR1cm5zdGF0ZScsICdyZUZvclJlSW50ZXJhY3Rpb24nKTtcclxuICAgICAgICAgICAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3VzZXIxTmFtZScsICRzdGF0ZVBhcmFtcy51c2VyMU5hbWUpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgndXNlcjJOYW1lJywgJHN0YXRlUGFyYW1zLnVzZXIyTmFtZSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICBTZXNzaW9uU2VydmljZS5kZWxldGVVc2VyKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvbG9naW4nO1xyXG4gICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJHdpbmRvdy5sb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncmV0dXJuc3RhdGUnLCAncmVGb3JSZUludGVyYWN0aW9uJyk7XHJcbiAgICAgICAgICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnNldEl0ZW0oJ3VzZXIxTmFtZScsICRzdGF0ZVBhcmFtcy51c2VyMU5hbWUpO1xyXG4gICAgICAgICAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCd1c2VyMk5hbWUnLCAkc3RhdGVQYXJhbXMudXNlcjJOYW1lKTtcclxuICAgICAgICAgICAgU2Vzc2lvblNlcnZpY2UuZGVsZXRlVXNlcigpO1xyXG4gICAgICAgICAgICB3aW5kb3cubG9jYXRpb24uaHJlZiA9ICcvbG9naW4nO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgdHJhZGU6IGZ1bmN0aW9uKCRyb290U2NvcGUsICRodHRwLCAkc3RhdGVQYXJhbXMsICR3aW5kb3csIFNlc3Npb25TZXJ2aWNlKSB7XHJcbiAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3RyYWRlcy93aXRoVXNlcnMvJyArICRzdGF0ZVBhcmFtcy51c2VyMU5hbWUgKyAnLycgKyAkc3RhdGVQYXJhbXMudXNlcjJOYW1lKVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgICB2YXIgdXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoJ3N1YkFkbWluJyk7XHJcbiAgICAgICAgICAgICAgdmFyIHRyYWRlID0gcmVzLmRhdGE7XHJcbiAgICAgICAgICAgICAgdHJhZGUucDEudXNlci5wc2V1ZG9BdmFpbGFibGVTbG90cyA9IGNyZWF0ZVBzZXVkb0F2YWlsYWJsZVNsb3RzKHRyYWRlLnAxLnVzZXIpO1xyXG4gICAgICAgICAgICAgIHRyYWRlLnAyLnVzZXIucHNldWRvQXZhaWxhYmxlU2xvdHMgPSBjcmVhdGVQc2V1ZG9BdmFpbGFibGVTbG90cyh0cmFkZS5wMi51c2VyKTtcclxuICAgICAgICAgICAgICB0cmFkZS5vdGhlciA9ICh0cmFkZS5wMS51c2VyLl9pZCA9PSB1c2VyLl9pZCkgPyB0cmFkZS5wMiA6IHRyYWRlLnAxO1xyXG4gICAgICAgICAgICAgIHRyYWRlLnVzZXIgPSAodHJhZGUucDEudXNlci5faWQgPT0gdXNlci5faWQpID8gdHJhZGUucDEgOiB0cmFkZS5wMjtcclxuICAgICAgICAgICAgICByZXR1cm4gdHJhZGU7XHJcbiAgICAgICAgICAgIH0pLnRoZW4obnVsbCwgY29uc29sZS5sb2cpXHJcbiAgICAgICAgfSxcclxuICAgICAgICBldmVudHM6IGZ1bmN0aW9uKCRodHRwLCAkd2luZG93LCBTZXNzaW9uU2VydmljZSkge1xyXG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9ldmVudHMvZm9yVXNlci8nICsgU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpLnNvdW5kY2xvdWQuaWQpXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJlcnJvciBnZXR0aW5nIHlvdXIgZXZlbnRzXCIpO1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICB9LFxyXG4gICAgICAgIHAxRXZlbnRzOiBmdW5jdGlvbigkaHR0cCwgdHJhZGUpIHtcclxuICAgICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvZXZlbnRzL2ZvclVzZXIvJyArIHRyYWRlLnAxLnVzZXIuc291bmRjbG91ZC5pZClcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHJlcy5kYXRhO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcImVycm9yIGdldHRpbmcgeW91ciBldmVudHNcIik7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgcDJFdmVudHM6IGZ1bmN0aW9uKCRodHRwLCB0cmFkZSkge1xyXG4gICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS9ldmVudHMvZm9yVXNlci8nICsgdHJhZGUucDIudXNlci5zb3VuZGNsb3VkLmlkKVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gcmVzLmRhdGE7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKFwiZXJyb3IgZ2V0dGluZyBvdGhlcidzIGV2ZW50cyBldmVudHNcIik7XHJcbiAgICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gY3VycmVudFRyYWRlczogZnVuY3Rpb24oJGh0dHAsIFNlc3Npb25TZXJ2aWNlKSB7XHJcbiAgICAgICAgLy8gICB2YXIgdHJhZGVUeXBlID0ge1xyXG4gICAgICAgIC8vICAgICBSZXF1ZXN0czogdHJ1ZSxcclxuICAgICAgICAvLyAgICAgUmVxdWVzdGVkOiB0cnVlLFxyXG4gICAgICAgIC8vICAgICBUcmFkZVBhcnRuZXJzOiB0cnVlXHJcbiAgICAgICAgLy8gICB9O1xyXG4gICAgICAgIC8vICAgdmFyIHVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgICAgLy8gICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3RyYWRlcy93aXRoVXNlci8nICsgdXNlci5faWQgKyAnP3RyYWRlVHlwZT0nICsgSlNPTi5zdHJpbmdpZnkodHJhZGVUeXBlKSlcclxuICAgICAgICAvLyAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgLy8gICAgICAgdmFyIHRyYWRlcyA9IHJlcy5kYXRhO1xyXG4gICAgICAgIC8vICAgICAgIHRyYWRlcy5mb3JFYWNoKGZ1bmN0aW9uKHRyYWRlKSB7XHJcbiAgICAgICAgLy8gICAgICAgICB0cmFkZS5wMS51c2VyLnBzZXVkb0F2YWlsYWJsZVNsb3RzID0gY3JlYXRlUHNldWRvQXZhaWxhYmxlU2xvdHModHJhZGUucDEudXNlcik7XHJcbiAgICAgICAgLy8gICAgICAgICB0cmFkZS5wMi51c2VyLnBzZXVkb0F2YWlsYWJsZVNsb3RzID0gY3JlYXRlUHNldWRvQXZhaWxhYmxlU2xvdHModHJhZGUucDIudXNlcik7XHJcbiAgICAgICAgLy8gICAgICAgICB0cmFkZS5vdGhlciA9ICh0cmFkZS5wMS51c2VyLl9pZCA9PSB1c2VyLl9pZCkgPyB0cmFkZS5wMiA6IHRyYWRlLnAxO1xyXG4gICAgICAgIC8vICAgICAgICAgdHJhZGUudXNlciA9ICh0cmFkZS5wMS51c2VyLl9pZCA9PSB1c2VyLl9pZCkgPyB0cmFkZS5wMSA6IHRyYWRlLnAyO1xyXG4gICAgICAgIC8vICAgICAgIH0pO1xyXG4gICAgICAgIC8vICAgICAgIHRyYWRlcy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcclxuICAgICAgICAvLyAgICAgICAgIGlmIChhLnVzZXIuYWxlcnQgPT0gXCJjaGFuZ2VcIikge1xyXG4gICAgICAgIC8vICAgICAgICAgICByZXR1cm4gLTE7XHJcbiAgICAgICAgLy8gICAgICAgICB9IGVsc2UgaWYgKGEudXNlci5hbGVydCA9PSBcInBsYWNlbWVudFwiKSB7XHJcbiAgICAgICAgLy8gICAgICAgICAgIHJldHVybiAtMVxyXG4gICAgICAgIC8vICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyAgICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgLy8gICAgICAgICB9XHJcbiAgICAgICAgLy8gICAgICAgfSlcclxuICAgICAgICAvLyAgICAgICByZXR1cm4gdHJhZGVzO1xyXG4gICAgICAgIC8vICAgICB9KVxyXG4gICAgICAgIC8vIH1cclxuICAgICAgfVxyXG4gICAgfSlcclxufSk7XHJcblxyXG5hcHAuY29udHJvbGxlcihcIkFkbWluUmVGb3JSZUludGVyYWN0aW9uQ29udHJvbGxlclwiLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsIEF1dGhTZXJ2aWNlLCAkd2luZG93LCBTZXNzaW9uU2VydmljZSwgc29ja2V0LCAkc3RhdGVQYXJhbXMsIHRyYWRlLCBwMUV2ZW50cywgcDJFdmVudHMpIHtcclxuICBjb25zb2xlLmxvZyhcImFkbWlucmVGb3JSZUludGVyYWN0aW9uXCIpO1xyXG4gICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gIGlmICghU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSB7XHJcbiAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XHJcbiAgfSBlbHNlIHtcclxuICAgICR3aW5kb3cubG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oJ3JldHVybnN0YXRlJyk7XHJcbiAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd1c2VyMUlEJyk7XHJcbiAgICAkd2luZG93LmxvY2FsU3RvcmFnZS5yZW1vdmVJdGVtKCd1c2VyMklEJyk7XHJcbiAgfVxyXG4gICRzY29wZS5pc0xvZ2dlZEluID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICRzY29wZS50cmFkZSA9IHRyYWRlO1xyXG4gICRzY29wZS5tc2dIaXN0b3J5ID0gdHJhZGUubWVzc2FnZXM7XHJcbiAgLy8gJHNjb3BlLmN1cnJlbnRUcmFkZXMgPSBjdXJyZW50VHJhZGVzO1xyXG4gICRzY29wZS5wMUV2ZW50cyA9IHAxRXZlbnRzO1xyXG4gICRzY29wZS5wMkV2ZW50cyA9IHAyRXZlbnRzO1xyXG4gICRzY29wZS5zdGF0ZVBhcmFtcyA9ICRzdGF0ZVBhcmFtcztcclxufSk7Il0sImZpbGUiOiJyZXBvc3RUcmFkZXJzL2FkbWlucmVGb3JSZUludGVyYWN0aW9uLmpzIn0=
