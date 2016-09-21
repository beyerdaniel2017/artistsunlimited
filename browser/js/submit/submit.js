app.config(function($stateProvider) {
  $stateProvider.state('submitSong', {
    url: '/submit',
    templateUrl: 'js/submit/submit.view.html',
    controller: 'SubmitSongController'
  });
  $stateProvider.state('customsubmit', {
    url: '/custom/:username/:submitpart',
    templateUrl: 'js/submit/submit.view.html',
    controller: 'SubmitSongController',
    resolve: {
      getUserByURL: function($stateParams, $http, $window) {
        var username = $stateParams.username;
        var submitpart = $stateParams.submitpart;
        return $http.get('/api/users/getUserByURL/' + username + '/' + submitpart)
          .then(function(res) {
            if (res && res.data) {
              if (submitpart.indexOf('submit') != -1) {
                $window.location.href = '/submit?id=' + res.data;
              } else {
                $window.location.href = '/premiere?id=' + res.data;
              }
            } else {
              if (submitpart.indexOf('submit') != -1) {
                $window.location.href = '/submit';
              } else {
                $window.location.href = '/premiere';
              }
            }
          })
          .then(null, function(err) {
            $.Zebra_Dialog("error getting your events");
            return;
          })
      }
    }
  });
});

app.controller('SubmitSongController', function($rootScope, $state, $scope, $http, customizeService, $location) {
  $scope.submission = {};
  $scope.customizeSettings = null;
  $scope.userID = $location.search().id;
  // $scope.genreArray = [
  //   'Alternative Rock',
  //   'Ambient',
  //   'Creative',
  //   'Chill',
  //   'Classical',
  //   'Country',
  //   'Dance & EDM',
  //   'Dancehall',
  //   'Deep House',
  //   'Disco',
  //   'Drum & Bass',
  //   'Dubstep',
  //   'Electronic',
  //   'Festival',
  //   'Folk',
  //   'Hip-Hop/RNB',
  //   'House',
  //   'Indie/Alternative',
  //   'Latin',
  //   'Trap',
  //   'Vocalists/Singer-Songwriter'
  // ];

  //search//
  $scope.searchSelection = [];
  $scope.changedSearch = function(kind) {
    $scope.searchSelection = [];
    $scope.searchError = undefined;
    $scope.searching = true;
    if ($scope.searchString != "") {
      $http.post('/api/search', {
        q: $scope.searchString,
        kind: kind
      }).then(function(res) {
        $scope.searching = false;
        if (res.data.item) {
          if (res.data.item.kind != kind) {
            $scope.serachError = "Please enter a " + kind + " URL.";
          } else {
            $scope.selectedItem(res.data.item);
          }
        } else {
          if (res.data.collection.length > 0) {
            $scope.searchSelection = res.data.collection;
            $scope.searchSelection.forEach(function(item) {
              $scope.setItemText(item)
            })
          } else {
            $scope.searchError = "We could not find a " + kind + "."
          }
        }
      }).then(null, function(err) {
        $scope.searching = false;
        console.log('We could not find a ' + kind);
        $scope.searchError = "We could not find a " + kind + "."
      });
    }
  }

  $scope.setItemText = function(item) {
    switch (item.kind) {
      case 'track':
        item.displayName = item.title + ' - ' + item.user.username;
        break;
      case 'playlist':
        item.displayName = item.title + ' - ' + item.user.username;
        break;
      case 'user':
        item.displayName = user.username;
        break;
    }
  }

  $scope.choseTrack = function(track) {
    console.log(track);
    $scope.searchString = track.title;
    $scope.submission.trackID = track.id;
    $scope.submission.title = track.title;
    $scope.submission.trackURL = track.permalink_url
    SC.oEmbed($scope.submission.trackURL, {
      element: document.getElementById('scPlayer'),
      auto_play: false,
      maxheight: 150
    })
    document.getElementById('scPlayer').style.visibility = "visible";
    $scope.processing = false;
  }

  // $scope.urlChange = function() {
  //   $http.post('/api/soundcloud/resolve', {
  //       url: $scope.url
  //     })
  //     .then(function(res) {
  //       if (res.data.kind != "track") throw (new Error(''));
  //       $scope.submission.trackID = res.data.id;
  //       $scope.submission.title = res.data.title;
  //       $scope.submission.trackURL = res.data.trackURL;
  //       SC.oEmbed($scope.submission.trackURL, {
  //         element: document.getElementById('scPlayer'),
  //         auto_play: false,
  //         maxheight: 150
  //       })
  //       document.getElementById('scPlayer').style.visibility = "visible";
  //       $scope.processing = false;
  //       $scope.notFound = false;
  //     }).then(null, function(err) {
  //       if (err.status != 403) {
  //         $.Zebra_Dialog("We are not allowed to access tracks by this artist with the Soundcloud API. We apologize for the inconvenience, and we are working with Soundcloud to resolve this issue.");
  //         $scope.notFound = true;
  //       } else {
  //         $scope.submission.trackURL = $scope.url;
  //         SC.oEmbed($scope.submission.trackURL, {
  //           element: document.getElementById('scPlayer'),
  //           auto_play: false,
  //           maxheight: 150
  //         })
  //       }
  //       $scope.submission.trackID = null;

  //       $scope.processing = false;
  //       document.getElementById('scPlayer').style.visibility = "hidden";
  //     });
  // }

  $scope.submit = function() {
    if (!$scope.submission.email || !$scope.submission.name || !$scope.submission.trackID) {
      $.Zebra_Dialog("Please fill in all fields")
    } else {
      $scope.processing = true;
      $http.post('/api/submissions', {
          email: $scope.submission.email,
          trackID: $scope.submission.trackID,
          name: $scope.submission.name,
          title: $scope.submission.title,
          trackURL: $scope.submission.trackURL,
          channelIDS: [],
          invoiceIDS: [],
          userID: $scope.userID,
          genre: ''
        })
        .then(function(res) {
          $.Zebra_Dialog("Your song has been submitted and will be reviewed soon.");
          $scope.processing = false;
          $scope.notFound = false;
          $scope.submission = {};
          document.getElementById('scPlayer').style.visibility = "hidden";
          $scope.url = "";
        })
        .then(null, function(err) {
          $scope.processing = false;
          $.Zebra_Dialog("Error: Could not submit song.");
        });
    }
  }

  $scope.getUserID = function() {
    if ($scope.userID == undefined) {
      $http.get('/api/users/getUserID')
        .then(function(res) {
          $scope.userID = res.data;
        });
    }
  }

  $scope.getCustomizeSettings = function() {
    var uid = $location.search().id;
    if (uid != undefined) {
      customizeService.getCustomPageSettings(uid, 'submit')
        .then(function(response) {
          $scope.customizeSettings = response;
        });
    }
  }
  $scope.getUserID();
  $scope.getCustomizeSettings();
});