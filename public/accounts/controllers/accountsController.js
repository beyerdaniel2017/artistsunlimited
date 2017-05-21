app.config(function($stateProvider) {
  $stateProvider.state('accounts', {
    url: '/admin/accounts',
    templateUrl: 'js/accounts/views/accounts.html',
    controller: 'accountsController'
  })
});

app.controller('accountsController', function($rootScope, $state, $scope, $http, AuthService, SessionService, $sce, accountService) {
  $scope.isLoggedIn = SessionService.getUser() ? true : false;
  if (!SessionService.getUser()) {
    $state.go('admin');
  }
  SessionService.removeAccountusers();
  $scope.user = SessionService.getUser();
  $scope.user.paidRepost.groups = $scope.user.paidRepost.groups ? $scope.user.paidRepost.groups : [];
  $scope.soundcloudLogin = function() {
    $scope.processing = true;
    SC.connect()
      .then(function(res) {
        $rootScope.accessToken = res.oauth_token;
        return $http.post('/api/login/soundCloudAuthentication', {
          token: res.oauth_token,
          password: 'test'
        });
      })
      .then(function(res) {
        var scInfo = res.data.user.soundcloud;
        scInfo.groups = [];
        scInfo.description = "";
        scInfo.price = 1;
        $http.post('/api/database/updateUserAccount', {
          soundcloudInfo: scInfo,
        }).then(function(user) {
          $scope.processing = false;
          location.reload();
        });
      })
      .then(null, function(err) {
        console.log(4)
        console.log(err);
        $.Zebra_Dialog('Error: Could not log in');
        $scope.processing = false;
      });
  };

  $scope.addAccounts = function(actions, index) {
    SessionService.addActionsfoAccount(actions, index);
    $state.go("channelstep1");
  }

  $scope.deletePaidRepost = function(index) {
    $.Zebra_Dialog('Do you really want to delete this account?', {
      'buttons': [{
        caption: 'Yes',
        callback: function() {
          var postRepost = $scope.user.paidRepost[index].userID;
          accountService.deleteUserAccount(postRepost)
            .then(function(res) {
              $scope.user.paidRepost.splice(index, 1);
            })
        }
      }, {
        caption: 'No',
        callback: function() {}
      }]
    });
  };

  $scope.updateGroup = function(account) {
    var priceFlag = true;
    for (var i = $scope.user.paidRepost.length - 1; i >= 0; i--) {
      if ($scope.user.paidRepost[i].price) {
        priceFlag = true;
      } else {
        priceFlag = false;
        break;
      }
    }
    if (!priceFlag) {
      return $.Zebra_Dialog('Price can not be empty.');
    }
    $scope.processing = true;
    $http.post('/api/database/updateGroup', {
      paidRepost: $scope.user.paidRepost,
    }).then(function(res) {
      $scope.processing = false;
      SessionService.create(res.data);
      $scope.user = SessionService.getUser();
    });
  }

  $scope.addItems = function(rowid, index) {
    $("#" + rowid).toggleClass();
  }

  $scope.addGroup = function(index, item) {
    $scope.user.paidRepost[index].groups.push('');
  }
  $scope.removeItem = function(parentIndex, index, item) {
    $scope.user.paidRepost[parentIndex].groups.splice(index, 1)
  }
  $scope.updatePaidRepostGroup = function(item, group) {
    for (var i = 0; i < $scope.user.paidRepost.length; i++) {
      if ($scope.user.paidRepost[i].id == item.id) {
        $scope.user.paidRepost[i].groups.push(group);
      }
    }
  }
  $scope.clicked = false;
  $scope.whiteSlot = [1, 2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15, 17, 18, 19, 21, 22, 23];
  $scope.clickedSlot = function(index) {
    $scope.clicked = true;
    if ($scope.whiteSlot.indexOf(index) > -1) {
      var value = $scope.whiteSlot.indexOf(index);
      $scope.whiteSlot.splice(value, 1)
    } else {
      $scope.whiteSlot.push(index);
    }
  }

  $scope.getPaidRepostAccounts = function() {
    $http.get('/api/submissions/getPaidRepostAccounts').then(function(res) {
      res.data = res.data.sort(function(a, b) {
        return a.user.id - b.user.id;
      });
      $scope.user.paidRepost = res.data;
    });
  }

  $scope.editprice = function(index, userdata) {
    if (userdata.price < 6 || userdata.price == undefined) {
      userdata.price = 6;
      $.Zebra_Dialog('Please enter a price (minimum $6).');
      return;
    }
    $scope.processing = true;
    $scope.user.paidRepost[index].price = userdata.price;
    $http.post('/api/database/updateGroup', {
      paidRepost: $scope.user.paidRepost,
    }).then(function(res) {
      $scope.processing = false;
      SessionService.create(res.data);
      $scope.user = SessionService.getUser();
      $scope.getPaidRepostAccounts();
    });
  }

  $scope.getPaidRepostAccounts();
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhY2NvdW50cy9jb250cm9sbGVycy9hY2NvdW50c0NvbnRyb2xsZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhY2NvdW50cycsIHtcclxuICAgIHVybDogJy9hZG1pbi9hY2NvdW50cycsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2FjY291bnRzL3ZpZXdzL2FjY291bnRzLmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ2FjY291bnRzQ29udHJvbGxlcidcclxuICB9KVxyXG59KTtcclxuXHJcbmFwcC5jb250cm9sbGVyKCdhY2NvdW50c0NvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsIEF1dGhTZXJ2aWNlLCBTZXNzaW9uU2VydmljZSwgJHNjZSwgYWNjb3VudFNlcnZpY2UpIHtcclxuICAkc2NvcGUuaXNMb2dnZWRJbiA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKSA/IHRydWUgOiBmYWxzZTtcclxuICBpZiAoIVNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKSkge1xyXG4gICAgJHN0YXRlLmdvKCdhZG1pbicpO1xyXG4gIH1cclxuICBTZXNzaW9uU2VydmljZS5yZW1vdmVBY2NvdW50dXNlcnMoKTtcclxuICAkc2NvcGUudXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcclxuICAkc2NvcGUudXNlci5wYWlkUmVwb3N0Lmdyb3VwcyA9ICRzY29wZS51c2VyLnBhaWRSZXBvc3QuZ3JvdXBzID8gJHNjb3BlLnVzZXIucGFpZFJlcG9zdC5ncm91cHMgOiBbXTtcclxuICAkc2NvcGUuc291bmRjbG91ZExvZ2luID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICBTQy5jb25uZWN0KClcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgJHJvb3RTY29wZS5hY2Nlc3NUb2tlbiA9IHJlcy5vYXV0aF90b2tlbjtcclxuICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9sb2dpbi9zb3VuZENsb3VkQXV0aGVudGljYXRpb24nLCB7XHJcbiAgICAgICAgICB0b2tlbjogcmVzLm9hdXRoX3Rva2VuLFxyXG4gICAgICAgICAgcGFzc3dvcmQ6ICd0ZXN0J1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICB2YXIgc2NJbmZvID0gcmVzLmRhdGEudXNlci5zb3VuZGNsb3VkO1xyXG4gICAgICAgIHNjSW5mby5ncm91cHMgPSBbXTtcclxuICAgICAgICBzY0luZm8uZGVzY3JpcHRpb24gPSBcIlwiO1xyXG4gICAgICAgIHNjSW5mby5wcmljZSA9IDE7XHJcbiAgICAgICAgJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS91cGRhdGVVc2VyQWNjb3VudCcsIHtcclxuICAgICAgICAgIHNvdW5kY2xvdWRJbmZvOiBzY0luZm8sXHJcbiAgICAgICAgfSkudGhlbihmdW5jdGlvbih1c2VyKSB7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgbG9jYXRpb24ucmVsb2FkKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgIGNvbnNvbGUubG9nKDQpXHJcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgICAkLlplYnJhX0RpYWxvZygnRXJyb3I6IENvdWxkIG5vdCBsb2cgaW4nKTtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICB9KTtcclxuICB9O1xyXG5cclxuICAkc2NvcGUuYWRkQWNjb3VudHMgPSBmdW5jdGlvbihhY3Rpb25zLCBpbmRleCkge1xyXG4gICAgU2Vzc2lvblNlcnZpY2UuYWRkQWN0aW9uc2ZvQWNjb3VudChhY3Rpb25zLCBpbmRleCk7XHJcbiAgICAkc3RhdGUuZ28oXCJjaGFubmVsc3RlcDFcIik7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuZGVsZXRlUGFpZFJlcG9zdCA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAkLlplYnJhX0RpYWxvZygnRG8geW91IHJlYWxseSB3YW50IHRvIGRlbGV0ZSB0aGlzIGFjY291bnQ/Jywge1xyXG4gICAgICAnYnV0dG9ucyc6IFt7XHJcbiAgICAgICAgY2FwdGlvbjogJ1llcycsXHJcbiAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgdmFyIHBvc3RSZXBvc3QgPSAkc2NvcGUudXNlci5wYWlkUmVwb3N0W2luZGV4XS51c2VySUQ7XHJcbiAgICAgICAgICBhY2NvdW50U2VydmljZS5kZWxldGVVc2VyQWNjb3VudChwb3N0UmVwb3N0KVxyXG4gICAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgICAkc2NvcGUudXNlci5wYWlkUmVwb3N0LnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICB9LCB7XHJcbiAgICAgICAgY2FwdGlvbjogJ05vJyxcclxuICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24oKSB7fVxyXG4gICAgICB9XVxyXG4gICAgfSk7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLnVwZGF0ZUdyb3VwID0gZnVuY3Rpb24oYWNjb3VudCkge1xyXG4gICAgdmFyIHByaWNlRmxhZyA9IHRydWU7XHJcbiAgICBmb3IgKHZhciBpID0gJHNjb3BlLnVzZXIucGFpZFJlcG9zdC5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xyXG4gICAgICBpZiAoJHNjb3BlLnVzZXIucGFpZFJlcG9zdFtpXS5wcmljZSkge1xyXG4gICAgICAgIHByaWNlRmxhZyA9IHRydWU7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgcHJpY2VGbGFnID0gZmFsc2U7XHJcbiAgICAgICAgYnJlYWs7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICghcHJpY2VGbGFnKSB7XHJcbiAgICAgIHJldHVybiAkLlplYnJhX0RpYWxvZygnUHJpY2UgY2FuIG5vdCBiZSBlbXB0eS4nKTtcclxuICAgIH1cclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvdXBkYXRlR3JvdXAnLCB7XHJcbiAgICAgIHBhaWRSZXBvc3Q6ICRzY29wZS51c2VyLnBhaWRSZXBvc3QsXHJcbiAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUocmVzLmRhdGEpO1xyXG4gICAgICAkc2NvcGUudXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmFkZEl0ZW1zID0gZnVuY3Rpb24ocm93aWQsIGluZGV4KSB7XHJcbiAgICAkKFwiI1wiICsgcm93aWQpLnRvZ2dsZUNsYXNzKCk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuYWRkR3JvdXAgPSBmdW5jdGlvbihpbmRleCwgaXRlbSkge1xyXG4gICAgJHNjb3BlLnVzZXIucGFpZFJlcG9zdFtpbmRleF0uZ3JvdXBzLnB1c2goJycpO1xyXG4gIH1cclxuICAkc2NvcGUucmVtb3ZlSXRlbSA9IGZ1bmN0aW9uKHBhcmVudEluZGV4LCBpbmRleCwgaXRlbSkge1xyXG4gICAgJHNjb3BlLnVzZXIucGFpZFJlcG9zdFtwYXJlbnRJbmRleF0uZ3JvdXBzLnNwbGljZShpbmRleCwgMSlcclxuICB9XHJcbiAgJHNjb3BlLnVwZGF0ZVBhaWRSZXBvc3RHcm91cCA9IGZ1bmN0aW9uKGl0ZW0sIGdyb3VwKSB7XHJcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8ICRzY29wZS51c2VyLnBhaWRSZXBvc3QubGVuZ3RoOyBpKyspIHtcclxuICAgICAgaWYgKCRzY29wZS51c2VyLnBhaWRSZXBvc3RbaV0uaWQgPT0gaXRlbS5pZCkge1xyXG4gICAgICAgICRzY29wZS51c2VyLnBhaWRSZXBvc3RbaV0uZ3JvdXBzLnB1c2goZ3JvdXApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG4gICRzY29wZS5jbGlja2VkID0gZmFsc2U7XHJcbiAgJHNjb3BlLndoaXRlU2xvdCA9IFsxLCAyLCAzLCA1LCA2LCA3LCA5LCAxMCwgMTEsIDEzLCAxNCwgMTUsIDE3LCAxOCwgMTksIDIxLCAyMiwgMjNdO1xyXG4gICRzY29wZS5jbGlja2VkU2xvdCA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAkc2NvcGUuY2xpY2tlZCA9IHRydWU7XHJcbiAgICBpZiAoJHNjb3BlLndoaXRlU2xvdC5pbmRleE9mKGluZGV4KSA+IC0xKSB7XHJcbiAgICAgIHZhciB2YWx1ZSA9ICRzY29wZS53aGl0ZVNsb3QuaW5kZXhPZihpbmRleCk7XHJcbiAgICAgICRzY29wZS53aGl0ZVNsb3Quc3BsaWNlKHZhbHVlLCAxKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJHNjb3BlLndoaXRlU2xvdC5wdXNoKGluZGV4KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gICRzY29wZS5nZXRQYWlkUmVwb3N0QWNjb3VudHMgPSBmdW5jdGlvbigpIHtcclxuICAgICRodHRwLmdldCgnL2FwaS9zdWJtaXNzaW9ucy9nZXRQYWlkUmVwb3N0QWNjb3VudHMnKS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICByZXMuZGF0YSA9IHJlcy5kYXRhLnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgIHJldHVybiBhLnVzZXIuaWQgLSBiLnVzZXIuaWQ7XHJcbiAgICAgIH0pO1xyXG4gICAgICAkc2NvcGUudXNlci5wYWlkUmVwb3N0ID0gcmVzLmRhdGE7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gICRzY29wZS5lZGl0cHJpY2UgPSBmdW5jdGlvbihpbmRleCwgdXNlcmRhdGEpIHtcclxuICAgIGlmICh1c2VyZGF0YS5wcmljZSA8IDYgfHwgdXNlcmRhdGEucHJpY2UgPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHVzZXJkYXRhLnByaWNlID0gNjtcclxuICAgICAgJC5aZWJyYV9EaWFsb2coJ1BsZWFzZSBlbnRlciBhIHByaWNlIChtaW5pbXVtICQ2KS4nKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgJHNjb3BlLnVzZXIucGFpZFJlcG9zdFtpbmRleF0ucHJpY2UgPSB1c2VyZGF0YS5wcmljZTtcclxuICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvdXBkYXRlR3JvdXAnLCB7XHJcbiAgICAgIHBhaWRSZXBvc3Q6ICRzY29wZS51c2VyLnBhaWRSZXBvc3QsXHJcbiAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUocmVzLmRhdGEpO1xyXG4gICAgICAkc2NvcGUudXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcclxuICAgICAgJHNjb3BlLmdldFBhaWRSZXBvc3RBY2NvdW50cygpO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuZ2V0UGFpZFJlcG9zdEFjY291bnRzKCk7XHJcbn0pO1xyXG4iXSwiZmlsZSI6ImFjY291bnRzL2NvbnRyb2xsZXJzL2FjY291bnRzQ29udHJvbGxlci5qcyJ9
