app.config(function($stateProvider) {
  $stateProvider.state('submitSong', {
    url: '/submit',
    templateUrl: 'js/submit/submit.view.html',
    controller: 'SubmitSongController'
  });
});

app.controller('SubmitSongController', function($rootScope, $state, $scope, $http) {
  $scope.submission = {};
  $scope.userID = "";
  $scope.genreArray = [
    'Alternative Rock',
    'Ambient',
    'Creative',
    'Chill',
    'Classical',
    'Country',
    'Dance & EDM',
    'Dancehall',
    'Deep House',
    'Disco',
    'Drum & Bass',
    'Dubstep',
    'Electronic',
    'Festival',
    'Folk',
    'Hip-Hop/RNB',
    'House',
    'Indie/Alternative',
    'Latin',
    'Trap',
    'Vocalists/Singer-Songwriter'
  ];
  $scope.urlChange = function() {
    if ($scope.searchString != "") {

      function search(type) {
        var localSearchString = $scope.searchString.slice(0);
        // $http.get('https://api-v2.soundcloud.com/search/autocomplete?q=d')
        //   .then(function(res) {
        //     console.log(res.body);
        //   })
        return SC.get('/' + type, {
          q: $scope.searchString,
          license: 'cc-by-sa',
          limit: 30
        }).then(function(tracks) {
          console.log(tracks);
          console.log(localSearchString)
          console.log($scope.searchString);
          if (localSearchString == $scope.searchString) {
            $scope.searchResults = tracks;
            $scope.$digest();
          }
        }).then(null, console.log);
      }

      search('tracks');
      // $.getJSON(url, function(tracks) {
      //   $(tracks).forEach(function(track) {
      //     console.log(track.title);
      //   })
      // });

      // $http.post('/api/soundcloud/resolve', {
      //     url: $scope.url
      //   })
      //   .then(function(res) {
      //     if (res.data.kind != "track") throw (new Error(''));
      //     $scope.submission.trackID = res.data.id;
      //     $scope.submission.title = res.data.title;
      //     $scope.submission.trackURL = res.data.trackURL;
      //     SC.oEmbed($scope.submission.trackURL, {
      //       element: document.getElementById('scPlayer'),
      //       auto_play: false,
      //       maxheight: 150
      //     })
      //     document.getElementById('scPlayer').style.visibility = "visible";
      //     $scope.processing = false;
      //     $scope.notFound = false;
      //   }).then(null, function(err) {
      //     if (err.status != 403) {
      //       $.Zebra_Dialog("We are not allowed to access tracks by this artist with the Soundcloud API. We apologize for the inconvenience, and we are working with Soundcloud to resolve this issue.");
      //       $scope.notFound = true;
      //     } else {
      //       $scope.submission.trackURL = $scope.url;
      //       SC.oEmbed($scope.submission.trackURL, {
      //         element: document.getElementById('scPlayer'),
      //         auto_play: false,
      //         maxheight: 150
      //       })
      //     }
      //     $scope.submission.trackID = null;

      //     $scope.processing = false;
      //     document.getElementById('scPlayer').style.visibility = "hidden";
      //   });
    }
  }

  $scope.submit = function() {
    if (!$scope.submission.email || !$scope.submission.name) {
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
          genre: $scope.submission.genre
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
    $http.get('/api/users/getUserID')
      .then(function(res) {
        $scope.userID = res.data;
      });
  }
});