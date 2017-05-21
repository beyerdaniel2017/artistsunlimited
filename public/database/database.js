app.config(function($stateProvider) {
  $stateProvider.state('database', {
    url: '/admin/database',
    templateUrl: 'js/database/database.html',
    controller: 'DatabaseController'
  });
});

app.directive('notificationBar', ['socket', function(socket) {
  return {
    restrict: 'EA',
    scope: true,
    template: '<div style="margin: 0 auto;width:50%" ng-show="bar.visible">' +
      '<uib-progress><uib-bar value="bar.value" type="{{bar.type}}"><span>{{bar.value}}%</span></uib-bar></uib-progress>' +
      '</div>',
    link: function($scope, iElm, iAttrs, controller) {
      socket.on('notification', function(data) {
        var percentage = parseInt(Math.floor(data.counter / data.total * 100), 10);
        $scope.bar.value = percentage;
        if (percentage === 100) {
          $scope.bar.visible = false;
          $scope.bar.value = 0;
        }
      });
    }
  };
}]);

app.controller('DatabaseController', function($rootScope, $state, $scope, $http, AuthService, SessionService, socket) {
  if (!SessionService.getUser()) {
    $state.go('admin');
  }
  $scope.addUser = {};
  $scope.query = {};
  $scope.trdUsrQuery = {};
  $scope.queryCols = [{
    name: 'username',
    value: 'username'
  }, {
    name: 'genre',
    value: 'genre'
  }, {
    name: 'name',
    value: 'name'
  }, {
    name: 'URL',
    value: 'scURL'
  }, {
    name: 'email',
    value: 'email'
  }, {
    name: 'description',
    value: 'description'
  }, {
    name: 'followers',
    value: 'followers'
  }, {
    name: 'number of tracks',
    value: 'numTracks'
  }, {
    name: 'facebook',
    value: 'facebookURL'
  }, {
    name: 'instagram',
    value: 'instagramURL'
  }, {
    name: 'twitter',
    value: 'twitterURL'
  }, {
    name: 'youtube',
    value: 'youtubeURL'
  }, {
    name: 'websites',
    value: 'websites'
  }, {
    name: 'auto email day',
    value: 'emailDayNum'
  }, {
    name: 'all emails',
    value: 'allEmails'
  }];
  $scope.downloadButtonVisible = false;
  $scope.track = {
    trackUrl: '',
    downloadUrl: '',
    email: ''
  };
  $scope.bar = {
    type: 'success',
    value: 0,
    visible: false
  };
  $scope.paidRepost = {
    soundCloudUrl: ''
  };

  $scope.logout = function() {
    $http.get('/api/logout').then(function() {
      SessionService.deleteUser();
      window.location.href = '/admin';
    }).catch(function(err) {
      $scope.processing = false;
      $.Zebra_Dialog('Wrong Password');
    });
  }

  $scope.saveAddUser = function() {
    $scope.processing = true;
    $scope.addUser.password = $rootScope.password;
    $http.post('/api/database/adduser', $scope.addUser)
      .then(function(res) {
        $.Zebra_Dialog("Success: Database is being populated. You will be emailed when it is complete.");
        $scope.processing = false;
        $scope.bar.visible = true;
      })
      .catch(function(err) {
        $.Zebra_Dialog('Bad submission');
        $scope.processing = false;
      });
  }

  $scope.createUserQueryDoc = function() {
    var query = {};
    if ($scope.query.artist == "artists") {
      query.artist = true;
    } else if ($scope.query.artist == "non-artists") {
      query.artist = false;
    }
    var flwrQry = {};
    if ($scope.query.followersGT) {
      flwrQry.$gt = $scope.query.followersGT;
      query.followers = flwrQry;
    }
    if ($scope.query.followersLT) {
      flwrQry.$lt = $scope.query.followersLT;
      query.followers = flwrQry;
    }
    if ($scope.query.genre) query.genre = $scope.query.genre;
    if ($scope.queryCols) {
      query.columns = $scope.queryCols.filter(function(elm) {
        return elm.value !== null;
      }).map(function(elm) {
        return elm.value;
      });
    }
    if ($scope.query.trackedUsersURL) query.trackedUsersURL = $scope.query.trackedUsersURL;
    var body = {
      query: query,
      password: $rootScope.password
    };
    $scope.processing = true;
    $http.post('/api/database/followers', body)
      .then(function(res) {
        $scope.filename = res.data;
        $scope.downloadButtonVisible = true;
        $scope.processing = false;
      })
      .then(null, function(err) {
        $.Zebra_Dialog("ERROR: Bad Query or No Matches");
        $scope.processing = false;
      });
  }

  $scope.createTrdUsrQueryDoc = function() {
    var query = {};
    var flwrQry = {};
    if ($scope.trdUsrQuery.followersGT) {
      flwrQry.$gt = $scope.trdUsrQuery.followersGT;
      query.followers = flwrQry;
    }
    if ($scope.trdUsrQuery.followersLT) {
      flwrQry.$lt = $scope.trdUsrQuery.followersLT;
      query.followers = flwrQry;
    }
    if ($scope.trdUsrQuery.genre) query.genre = $scope.trdUsrQuery.genre;
    var body = {
      query: query,
      password: $rootScope.password
    };
    $scope.processing = true;
    $http.post('/api/database/trackedUsers', body)
      .then(function(res) {
        $scope.trdUsrFilename = res.data;
        $scope.downloadTrdUsrButtonVisible = true;
        $scope.processing = false;
      })
      .then(null, function(err) {
        $.Zebra_Dialog("ERROR: Bad Query or No Matches");
        $scope.processing = false;
      });
  }

  $scope.download = function(filename) {
    var anchor = angular.element('<a/>');
    anchor.attr({
      href: filename,
      download: filename
    })[0].click();
    $scope.downloadButtonVisible = false;
    $scope.downloadTrdUsrButtonVisible = false;
  }

  $scope.savePaidRepostChannel = function() {
    $scope.processing = true;
    $http.post('/api/database/paidrepost', $scope.paidRepost)
      .then(function(res) {
        $scope.paidRepost = {
          soundCloudUrl: ''
        };
        $.Zebra_Dialog("SUCCESS: Url saved successfully");
        $scope.processing = false;
      })
      .then(null, function(err) {
        $.Zebra_Dialog("ERROR: Error in saving url");
        $scope.processing = false;
      });
  }

  /* Listen to socket events */
  socket.on('notification', function(data) {
    var percentage = parseInt(Math.floor(data.counter / data.total * 100), 10);
    $scope.bar.value = percentage;
    if (percentage === 100) {
      $scope.statusBarVisible = false;
      $scope.bar.value = 0;
    }
  });
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkYXRhYmFzZS9kYXRhYmFzZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XHJcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2RhdGFiYXNlJywge1xyXG4gICAgdXJsOiAnL2FkbWluL2RhdGFiYXNlJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvZGF0YWJhc2UvZGF0YWJhc2UuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnRGF0YWJhc2VDb250cm9sbGVyJ1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmFwcC5kaXJlY3RpdmUoJ25vdGlmaWNhdGlvbkJhcicsIFsnc29ja2V0JywgZnVuY3Rpb24oc29ja2V0KSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHJlc3RyaWN0OiAnRUEnLFxyXG4gICAgc2NvcGU6IHRydWUsXHJcbiAgICB0ZW1wbGF0ZTogJzxkaXYgc3R5bGU9XCJtYXJnaW46IDAgYXV0bzt3aWR0aDo1MCVcIiBuZy1zaG93PVwiYmFyLnZpc2libGVcIj4nICtcclxuICAgICAgJzx1aWItcHJvZ3Jlc3M+PHVpYi1iYXIgdmFsdWU9XCJiYXIudmFsdWVcIiB0eXBlPVwie3tiYXIudHlwZX19XCI+PHNwYW4+e3tiYXIudmFsdWV9fSU8L3NwYW4+PC91aWItYmFyPjwvdWliLXByb2dyZXNzPicgK1xyXG4gICAgICAnPC9kaXY+JyxcclxuICAgIGxpbms6IGZ1bmN0aW9uKCRzY29wZSwgaUVsbSwgaUF0dHJzLCBjb250cm9sbGVyKSB7XHJcbiAgICAgIHNvY2tldC5vbignbm90aWZpY2F0aW9uJywgZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgIHZhciBwZXJjZW50YWdlID0gcGFyc2VJbnQoTWF0aC5mbG9vcihkYXRhLmNvdW50ZXIgLyBkYXRhLnRvdGFsICogMTAwKSwgMTApO1xyXG4gICAgICAgICRzY29wZS5iYXIudmFsdWUgPSBwZXJjZW50YWdlO1xyXG4gICAgICAgIGlmIChwZXJjZW50YWdlID09PSAxMDApIHtcclxuICAgICAgICAgICRzY29wZS5iYXIudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgICAgJHNjb3BlLmJhci52YWx1ZSA9IDA7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9O1xyXG59XSk7XHJcblxyXG5hcHAuY29udHJvbGxlcignRGF0YWJhc2VDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCBBdXRoU2VydmljZSwgU2Vzc2lvblNlcnZpY2UsIHNvY2tldCkge1xyXG4gIGlmICghU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSB7XHJcbiAgICAkc3RhdGUuZ28oJ2FkbWluJyk7XHJcbiAgfVxyXG4gICRzY29wZS5hZGRVc2VyID0ge307XHJcbiAgJHNjb3BlLnF1ZXJ5ID0ge307XHJcbiAgJHNjb3BlLnRyZFVzclF1ZXJ5ID0ge307XHJcbiAgJHNjb3BlLnF1ZXJ5Q29scyA9IFt7XHJcbiAgICBuYW1lOiAndXNlcm5hbWUnLFxyXG4gICAgdmFsdWU6ICd1c2VybmFtZSdcclxuICB9LCB7XHJcbiAgICBuYW1lOiAnZ2VucmUnLFxyXG4gICAgdmFsdWU6ICdnZW5yZSdcclxuICB9LCB7XHJcbiAgICBuYW1lOiAnbmFtZScsXHJcbiAgICB2YWx1ZTogJ25hbWUnXHJcbiAgfSwge1xyXG4gICAgbmFtZTogJ1VSTCcsXHJcbiAgICB2YWx1ZTogJ3NjVVJMJ1xyXG4gIH0sIHtcclxuICAgIG5hbWU6ICdlbWFpbCcsXHJcbiAgICB2YWx1ZTogJ2VtYWlsJ1xyXG4gIH0sIHtcclxuICAgIG5hbWU6ICdkZXNjcmlwdGlvbicsXHJcbiAgICB2YWx1ZTogJ2Rlc2NyaXB0aW9uJ1xyXG4gIH0sIHtcclxuICAgIG5hbWU6ICdmb2xsb3dlcnMnLFxyXG4gICAgdmFsdWU6ICdmb2xsb3dlcnMnXHJcbiAgfSwge1xyXG4gICAgbmFtZTogJ251bWJlciBvZiB0cmFja3MnLFxyXG4gICAgdmFsdWU6ICdudW1UcmFja3MnXHJcbiAgfSwge1xyXG4gICAgbmFtZTogJ2ZhY2Vib29rJyxcclxuICAgIHZhbHVlOiAnZmFjZWJvb2tVUkwnXHJcbiAgfSwge1xyXG4gICAgbmFtZTogJ2luc3RhZ3JhbScsXHJcbiAgICB2YWx1ZTogJ2luc3RhZ3JhbVVSTCdcclxuICB9LCB7XHJcbiAgICBuYW1lOiAndHdpdHRlcicsXHJcbiAgICB2YWx1ZTogJ3R3aXR0ZXJVUkwnXHJcbiAgfSwge1xyXG4gICAgbmFtZTogJ3lvdXR1YmUnLFxyXG4gICAgdmFsdWU6ICd5b3V0dWJlVVJMJ1xyXG4gIH0sIHtcclxuICAgIG5hbWU6ICd3ZWJzaXRlcycsXHJcbiAgICB2YWx1ZTogJ3dlYnNpdGVzJ1xyXG4gIH0sIHtcclxuICAgIG5hbWU6ICdhdXRvIGVtYWlsIGRheScsXHJcbiAgICB2YWx1ZTogJ2VtYWlsRGF5TnVtJ1xyXG4gIH0sIHtcclxuICAgIG5hbWU6ICdhbGwgZW1haWxzJyxcclxuICAgIHZhbHVlOiAnYWxsRW1haWxzJ1xyXG4gIH1dO1xyXG4gICRzY29wZS5kb3dubG9hZEJ1dHRvblZpc2libGUgPSBmYWxzZTtcclxuICAkc2NvcGUudHJhY2sgPSB7XHJcbiAgICB0cmFja1VybDogJycsXHJcbiAgICBkb3dubG9hZFVybDogJycsXHJcbiAgICBlbWFpbDogJydcclxuICB9O1xyXG4gICRzY29wZS5iYXIgPSB7XHJcbiAgICB0eXBlOiAnc3VjY2VzcycsXHJcbiAgICB2YWx1ZTogMCxcclxuICAgIHZpc2libGU6IGZhbHNlXHJcbiAgfTtcclxuICAkc2NvcGUucGFpZFJlcG9zdCA9IHtcclxuICAgIHNvdW5kQ2xvdWRVcmw6ICcnXHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmxvZ291dCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJGh0dHAuZ2V0KCcvYXBpL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24oKSB7XHJcbiAgICAgIFNlc3Npb25TZXJ2aWNlLmRlbGV0ZVVzZXIoKTtcclxuICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAnL2FkbWluJztcclxuICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAkLlplYnJhX0RpYWxvZygnV3JvbmcgUGFzc3dvcmQnKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLnNhdmVBZGRVc2VyID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAkc2NvcGUuYWRkVXNlci5wYXNzd29yZCA9ICRyb290U2NvcGUucGFzc3dvcmQ7XHJcbiAgICAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL2FkZHVzZXInLCAkc2NvcGUuYWRkVXNlcilcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJTdWNjZXNzOiBEYXRhYmFzZSBpcyBiZWluZyBwb3B1bGF0ZWQuIFlvdSB3aWxsIGJlIGVtYWlsZWQgd2hlbiBpdCBpcyBjb21wbGV0ZS5cIik7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAkc2NvcGUuYmFyLnZpc2libGUgPSB0cnVlO1xyXG4gICAgICB9KVxyXG4gICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coJ0JhZCBzdWJtaXNzaW9uJyk7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuY3JlYXRlVXNlclF1ZXJ5RG9jID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgcXVlcnkgPSB7fTtcclxuICAgIGlmICgkc2NvcGUucXVlcnkuYXJ0aXN0ID09IFwiYXJ0aXN0c1wiKSB7XHJcbiAgICAgIHF1ZXJ5LmFydGlzdCA9IHRydWU7XHJcbiAgICB9IGVsc2UgaWYgKCRzY29wZS5xdWVyeS5hcnRpc3QgPT0gXCJub24tYXJ0aXN0c1wiKSB7XHJcbiAgICAgIHF1ZXJ5LmFydGlzdCA9IGZhbHNlO1xyXG4gICAgfVxyXG4gICAgdmFyIGZsd3JRcnkgPSB7fTtcclxuICAgIGlmICgkc2NvcGUucXVlcnkuZm9sbG93ZXJzR1QpIHtcclxuICAgICAgZmx3clFyeS4kZ3QgPSAkc2NvcGUucXVlcnkuZm9sbG93ZXJzR1Q7XHJcbiAgICAgIHF1ZXJ5LmZvbGxvd2VycyA9IGZsd3JRcnk7XHJcbiAgICB9XHJcbiAgICBpZiAoJHNjb3BlLnF1ZXJ5LmZvbGxvd2Vyc0xUKSB7XHJcbiAgICAgIGZsd3JRcnkuJGx0ID0gJHNjb3BlLnF1ZXJ5LmZvbGxvd2Vyc0xUO1xyXG4gICAgICBxdWVyeS5mb2xsb3dlcnMgPSBmbHdyUXJ5O1xyXG4gICAgfVxyXG4gICAgaWYgKCRzY29wZS5xdWVyeS5nZW5yZSkgcXVlcnkuZ2VucmUgPSAkc2NvcGUucXVlcnkuZ2VucmU7XHJcbiAgICBpZiAoJHNjb3BlLnF1ZXJ5Q29scykge1xyXG4gICAgICBxdWVyeS5jb2x1bW5zID0gJHNjb3BlLnF1ZXJ5Q29scy5maWx0ZXIoZnVuY3Rpb24oZWxtKSB7XHJcbiAgICAgICAgcmV0dXJuIGVsbS52YWx1ZSAhPT0gbnVsbDtcclxuICAgICAgfSkubWFwKGZ1bmN0aW9uKGVsbSkge1xyXG4gICAgICAgIHJldHVybiBlbG0udmFsdWU7XHJcbiAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgaWYgKCRzY29wZS5xdWVyeS50cmFja2VkVXNlcnNVUkwpIHF1ZXJ5LnRyYWNrZWRVc2Vyc1VSTCA9ICRzY29wZS5xdWVyeS50cmFja2VkVXNlcnNVUkw7XHJcbiAgICB2YXIgYm9keSA9IHtcclxuICAgICAgcXVlcnk6IHF1ZXJ5LFxyXG4gICAgICBwYXNzd29yZDogJHJvb3RTY29wZS5wYXNzd29yZFxyXG4gICAgfTtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvZm9sbG93ZXJzJywgYm9keSlcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgJHNjb3BlLmZpbGVuYW1lID0gcmVzLmRhdGE7XHJcbiAgICAgICAgJHNjb3BlLmRvd25sb2FkQnV0dG9uVmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJFUlJPUjogQmFkIFF1ZXJ5IG9yIE5vIE1hdGNoZXNcIik7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuY3JlYXRlVHJkVXNyUXVlcnlEb2MgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBxdWVyeSA9IHt9O1xyXG4gICAgdmFyIGZsd3JRcnkgPSB7fTtcclxuICAgIGlmICgkc2NvcGUudHJkVXNyUXVlcnkuZm9sbG93ZXJzR1QpIHtcclxuICAgICAgZmx3clFyeS4kZ3QgPSAkc2NvcGUudHJkVXNyUXVlcnkuZm9sbG93ZXJzR1Q7XHJcbiAgICAgIHF1ZXJ5LmZvbGxvd2VycyA9IGZsd3JRcnk7XHJcbiAgICB9XHJcbiAgICBpZiAoJHNjb3BlLnRyZFVzclF1ZXJ5LmZvbGxvd2Vyc0xUKSB7XHJcbiAgICAgIGZsd3JRcnkuJGx0ID0gJHNjb3BlLnRyZFVzclF1ZXJ5LmZvbGxvd2Vyc0xUO1xyXG4gICAgICBxdWVyeS5mb2xsb3dlcnMgPSBmbHdyUXJ5O1xyXG4gICAgfVxyXG4gICAgaWYgKCRzY29wZS50cmRVc3JRdWVyeS5nZW5yZSkgcXVlcnkuZ2VucmUgPSAkc2NvcGUudHJkVXNyUXVlcnkuZ2VucmU7XHJcbiAgICB2YXIgYm9keSA9IHtcclxuICAgICAgcXVlcnk6IHF1ZXJ5LFxyXG4gICAgICBwYXNzd29yZDogJHJvb3RTY29wZS5wYXNzd29yZFxyXG4gICAgfTtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvdHJhY2tlZFVzZXJzJywgYm9keSlcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgJHNjb3BlLnRyZFVzckZpbGVuYW1lID0gcmVzLmRhdGE7XHJcbiAgICAgICAgJHNjb3BlLmRvd25sb2FkVHJkVXNyQnV0dG9uVmlzaWJsZSA9IHRydWU7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJFUlJPUjogQmFkIFF1ZXJ5IG9yIE5vIE1hdGNoZXNcIik7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuZG93bmxvYWQgPSBmdW5jdGlvbihmaWxlbmFtZSkge1xyXG4gICAgdmFyIGFuY2hvciA9IGFuZ3VsYXIuZWxlbWVudCgnPGEvPicpO1xyXG4gICAgYW5jaG9yLmF0dHIoe1xyXG4gICAgICBocmVmOiBmaWxlbmFtZSxcclxuICAgICAgZG93bmxvYWQ6IGZpbGVuYW1lXHJcbiAgICB9KVswXS5jbGljaygpO1xyXG4gICAgJHNjb3BlLmRvd25sb2FkQnV0dG9uVmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgJHNjb3BlLmRvd25sb2FkVHJkVXNyQnV0dG9uVmlzaWJsZSA9IGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLnNhdmVQYWlkUmVwb3N0Q2hhbm5lbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgJGh0dHAucG9zdCgnL2FwaS9kYXRhYmFzZS9wYWlkcmVwb3N0JywgJHNjb3BlLnBhaWRSZXBvc3QpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICRzY29wZS5wYWlkUmVwb3N0ID0ge1xyXG4gICAgICAgICAgc291bmRDbG91ZFVybDogJydcclxuICAgICAgICB9O1xyXG4gICAgICAgICQuWmVicmFfRGlhbG9nKFwiU1VDQ0VTUzogVXJsIHNhdmVkIHN1Y2Nlc3NmdWxseVwiKTtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICB9KVxyXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkVSUk9SOiBFcnJvciBpbiBzYXZpbmcgdXJsXCIpO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgLyogTGlzdGVuIHRvIHNvY2tldCBldmVudHMgKi9cclxuICBzb2NrZXQub24oJ25vdGlmaWNhdGlvbicsIGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgIHZhciBwZXJjZW50YWdlID0gcGFyc2VJbnQoTWF0aC5mbG9vcihkYXRhLmNvdW50ZXIgLyBkYXRhLnRvdGFsICogMTAwKSwgMTApO1xyXG4gICAgJHNjb3BlLmJhci52YWx1ZSA9IHBlcmNlbnRhZ2U7XHJcbiAgICBpZiAocGVyY2VudGFnZSA9PT0gMTAwKSB7XHJcbiAgICAgICRzY29wZS5zdGF0dXNCYXJWaXNpYmxlID0gZmFsc2U7XHJcbiAgICAgICRzY29wZS5iYXIudmFsdWUgPSAwO1xyXG4gICAgfVxyXG4gIH0pO1xyXG59KTsiXSwiZmlsZSI6ImRhdGFiYXNlL2RhdGFiYXNlLmpzIn0=
