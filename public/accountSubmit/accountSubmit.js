app.config(function($stateProvider) {
  $stateProvider.state('customsubmit', {
    url: '/:username/submit',
    templateUrl: 'js/accountSubmit/accountsubmit.view.html',
    controller: 'AccountSubmitSongController',
    resolve: {
      userID: function($stateParams, $http, $window) {
        var username = $stateParams.username;
        return $http.get('/api/users/getUserByURL/' + username + '/submit')
          .then(function(res) {
            return {
              userid: res.data,
              username: username,
              submitpart: 'submit'
            };
          })
          .then(null, function(err) {
            $.Zebra_Dialog("error getting your events");
            return;
          })
      },
      customizeSettings: function($http, customizeService, userID) {
        if (userID.userid == "nouser") {
          $location.path("/" + userID.username + "/" + userID.submitpart);
        }
        return customizeService.getCustomPageSettings(userID.userid, userID.submitpart)
          .then(function(response) {
            return response;
          })
          .then(null, function(err) {
            $.Zebra_Dialog("error getting your customize settings");
            return;
          })
      }
    }
  });
});

app.controller('AccountSubmitSongController', function($rootScope, $state, $scope, userID, customizeSettings, $http, customizeService, $location) {
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

  $scope.submission = {
    genre: "genre"
  };
  $scope.customizeSettings = customizeSettings;
  $scope.searchString = "";
  $scope.showPlayer = false;
  console.log(window.localStorage.getItem('hasBeenAdmin'));
  $scope.choseTrack = function(track) {
    console.log(track);
    $scope.searchString = track.title;
    $scope.submission.trackID = track.id;
    $scope.submission.title = track.title;
    $scope.submission.trackURL = track.permalink_url;
    if (track.user) {
      $scope.submission.trackArtist = track.user.username;
      $scope.submission.trackArtistURL = track.user.permalink_url;
    }
    $scope.submission.artworkURL = track.artwork_url;
    var widget = SC.Widget('scPlayerCustom');
    widget.load($scope.submission.trackURL, {
      auto_play: false,
      show_artwork: true,
      callback: function() {
        if ($scope.submission.title == "--unknown--") {
          widget.getCurrentSound(function(track) {
            console.log(track);
            $scope.searchString = track.title;
            $scope.submission.trackID = track.id;
            $scope.submission.title = track.title;
            $scope.submission.trackURL = track.permalink_url;
            $scope.submission.trackArtist = track.user.username;
            $scope.submission.trackArtistURL = track.user.permalink_url;
            $scope.submission.artworkURL = track.artwork_url;
          })
        }
      }
    });
    $scope.showPlayer = true;
    document.getElementById('scPlayerCustom').style.visibility = "visible";
  }

  $scope.submit = function() {
    if (!$scope.submission.email || !$scope.submission.name || !$scope.submission.trackID || $scope.submission.genre == "genre") {
      $.Zebra_Dialog("Please fill in all fields")
    } else {
      $scope.processing = true;
      $http.post('/api/submissions', {
          email: $scope.submission.email,
          trackID: $scope.submission.trackID,
          name: $scope.submission.name,
          title: $scope.submission.title,
          trackURL: $scope.submission.trackURL,
          trackArtist: $scope.submission.trackArtist,
          trackArtistURL: $scope.submission.trackArtistURL,
          artworkURL: $scope.submission.artworkURL,
          channelIDS: [],
          invoiceIDS: [],
          userID: userID.userid,
          genre: $scope.submission.genre
        })
        .then(function(res) {
          $.Zebra_Dialog("Your song has been submitted and will be reviewed soon.");
          $scope.processing = false;
          $scope.notFound = false;
          $scope.submission = {
            genre: "genre"
          };
          $scope.searchString = "";
          $scope.showPlayer = false;
          document.getElementById('scPlayerCustom').style.visibility = "hidden";
          $scope.url = "";
        })
        .then(null, function(err) {
          $scope.processing = false;
          $.Zebra_Dialog(err.data);
        });
    }
  }
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhY2NvdW50U3VibWl0L2FjY291bnRTdWJtaXQuanMiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdjdXN0b21zdWJtaXQnLCB7XHJcbiAgICB1cmw6ICcvOnVzZXJuYW1lL3N1Ym1pdCcsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2FjY291bnRTdWJtaXQvYWNjb3VudHN1Ym1pdC52aWV3Lmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ0FjY291bnRTdWJtaXRTb25nQ29udHJvbGxlcicsXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIHVzZXJJRDogZnVuY3Rpb24oJHN0YXRlUGFyYW1zLCAkaHR0cCwgJHdpbmRvdykge1xyXG4gICAgICAgIHZhciB1c2VybmFtZSA9ICRzdGF0ZVBhcmFtcy51c2VybmFtZTtcclxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3VzZXJzL2dldFVzZXJCeVVSTC8nICsgdXNlcm5hbWUgKyAnL3N1Ym1pdCcpXHJcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHtcclxuICAgICAgICAgICAgICB1c2VyaWQ6IHJlcy5kYXRhLFxyXG4gICAgICAgICAgICAgIHVzZXJuYW1lOiB1c2VybmFtZSxcclxuICAgICAgICAgICAgICBzdWJtaXRwYXJ0OiAnc3VibWl0J1xyXG4gICAgICAgICAgICB9O1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcImVycm9yIGdldHRpbmcgeW91ciBldmVudHNcIik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH0pXHJcbiAgICAgIH0sXHJcbiAgICAgIGN1c3RvbWl6ZVNldHRpbmdzOiBmdW5jdGlvbigkaHR0cCwgY3VzdG9taXplU2VydmljZSwgdXNlcklEKSB7XHJcbiAgICAgICAgaWYgKHVzZXJJRC51c2VyaWQgPT0gXCJub3VzZXJcIikge1xyXG4gICAgICAgICAgJGxvY2F0aW9uLnBhdGgoXCIvXCIgKyB1c2VySUQudXNlcm5hbWUgKyBcIi9cIiArIHVzZXJJRC5zdWJtaXRwYXJ0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIGN1c3RvbWl6ZVNlcnZpY2UuZ2V0Q3VzdG9tUGFnZVNldHRpbmdzKHVzZXJJRC51c2VyaWQsIHVzZXJJRC5zdWJtaXRwYXJ0KVxyXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHJlc3BvbnNlO1xyXG4gICAgICAgICAgfSlcclxuICAgICAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcImVycm9yIGdldHRpbmcgeW91ciBjdXN0b21pemUgc2V0dGluZ3NcIik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH0pXHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxufSk7XHJcblxyXG5hcHAuY29udHJvbGxlcignQWNjb3VudFN1Ym1pdFNvbmdDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsIHVzZXJJRCwgY3VzdG9taXplU2V0dGluZ3MsICRodHRwLCBjdXN0b21pemVTZXJ2aWNlLCAkbG9jYXRpb24pIHtcclxuICAkc2NvcGUuZ2VucmVBcnJheSA9IFtcclxuICAgICdBbHRlcm5hdGl2ZSBSb2NrJyxcclxuICAgICdBbWJpZW50JyxcclxuICAgICdDcmVhdGl2ZScsXHJcbiAgICAnQ2hpbGwnLFxyXG4gICAgJ0NsYXNzaWNhbCcsXHJcbiAgICAnQ291bnRyeScsXHJcbiAgICAnRGFuY2UgJiBFRE0nLFxyXG4gICAgJ0RhbmNlaGFsbCcsXHJcbiAgICAnRGVlcCBIb3VzZScsXHJcbiAgICAnRGlzY28nLFxyXG4gICAgJ0RydW0gJiBCYXNzJyxcclxuICAgICdEdWJzdGVwJyxcclxuICAgICdFbGVjdHJvbmljJyxcclxuICAgICdGZXN0aXZhbCcsXHJcbiAgICAnRm9saycsXHJcbiAgICAnSGlwLUhvcC9STkInLFxyXG4gICAgJ0hvdXNlJyxcclxuICAgICdJbmRpZS9BbHRlcm5hdGl2ZScsXHJcbiAgICAnTGF0aW4nLFxyXG4gICAgJ1RyYXAnLFxyXG4gICAgJ1ZvY2FsaXN0cy9TaW5nZXItU29uZ3dyaXRlcidcclxuICBdO1xyXG5cclxuICAkc2NvcGUuc3VibWlzc2lvbiA9IHtcclxuICAgIGdlbnJlOiBcImdlbnJlXCJcclxuICB9O1xyXG4gICRzY29wZS5jdXN0b21pemVTZXR0aW5ncyA9IGN1c3RvbWl6ZVNldHRpbmdzO1xyXG4gICRzY29wZS5zZWFyY2hTdHJpbmcgPSBcIlwiO1xyXG4gICRzY29wZS5zaG93UGxheWVyID0gZmFsc2U7XHJcbiAgY29uc29sZS5sb2cod2luZG93LmxvY2FsU3RvcmFnZS5nZXRJdGVtKCdoYXNCZWVuQWRtaW4nKSk7XHJcbiAgJHNjb3BlLmNob3NlVHJhY2sgPSBmdW5jdGlvbih0cmFjaykge1xyXG4gICAgY29uc29sZS5sb2codHJhY2spO1xyXG4gICAgJHNjb3BlLnNlYXJjaFN0cmluZyA9IHRyYWNrLnRpdGxlO1xyXG4gICAgJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tJRCA9IHRyYWNrLmlkO1xyXG4gICAgJHNjb3BlLnN1Ym1pc3Npb24udGl0bGUgPSB0cmFjay50aXRsZTtcclxuICAgICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrVVJMID0gdHJhY2sucGVybWFsaW5rX3VybDtcclxuICAgIGlmICh0cmFjay51c2VyKSB7XHJcbiAgICAgICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrQXJ0aXN0ID0gdHJhY2sudXNlci51c2VybmFtZTtcclxuICAgICAgJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tBcnRpc3RVUkwgPSB0cmFjay51c2VyLnBlcm1hbGlua191cmw7XHJcbiAgICB9XHJcbiAgICAkc2NvcGUuc3VibWlzc2lvbi5hcnR3b3JrVVJMID0gdHJhY2suYXJ0d29ya191cmw7XHJcbiAgICB2YXIgd2lkZ2V0ID0gU0MuV2lkZ2V0KCdzY1BsYXllckN1c3RvbScpO1xyXG4gICAgd2lkZ2V0LmxvYWQoJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tVUkwsIHtcclxuICAgICAgYXV0b19wbGF5OiBmYWxzZSxcclxuICAgICAgc2hvd19hcnR3b3JrOiB0cnVlLFxyXG4gICAgICBjYWxsYmFjazogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgaWYgKCRzY29wZS5zdWJtaXNzaW9uLnRpdGxlID09IFwiLS11bmtub3duLS1cIikge1xyXG4gICAgICAgICAgd2lkZ2V0LmdldEN1cnJlbnRTb3VuZChmdW5jdGlvbih0cmFjaykge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyh0cmFjayk7XHJcbiAgICAgICAgICAgICRzY29wZS5zZWFyY2hTdHJpbmcgPSB0cmFjay50aXRsZTtcclxuICAgICAgICAgICAgJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tJRCA9IHRyYWNrLmlkO1xyXG4gICAgICAgICAgICAkc2NvcGUuc3VibWlzc2lvbi50aXRsZSA9IHRyYWNrLnRpdGxlO1xyXG4gICAgICAgICAgICAkc2NvcGUuc3VibWlzc2lvbi50cmFja1VSTCA9IHRyYWNrLnBlcm1hbGlua191cmw7XHJcbiAgICAgICAgICAgICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrQXJ0aXN0ID0gdHJhY2sudXNlci51c2VybmFtZTtcclxuICAgICAgICAgICAgJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tBcnRpc3RVUkwgPSB0cmFjay51c2VyLnBlcm1hbGlua191cmw7XHJcbiAgICAgICAgICAgICRzY29wZS5zdWJtaXNzaW9uLmFydHdvcmtVUkwgPSB0cmFjay5hcnR3b3JrX3VybDtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgICRzY29wZS5zaG93UGxheWVyID0gdHJ1ZTtcclxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllckN1c3RvbScpLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcclxuICB9XHJcblxyXG4gICRzY29wZS5zdWJtaXQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICghJHNjb3BlLnN1Ym1pc3Npb24uZW1haWwgfHwgISRzY29wZS5zdWJtaXNzaW9uLm5hbWUgfHwgISRzY29wZS5zdWJtaXNzaW9uLnRyYWNrSUQgfHwgJHNjb3BlLnN1Ym1pc3Npb24uZ2VucmUgPT0gXCJnZW5yZVwiKSB7XHJcbiAgICAgICQuWmVicmFfRGlhbG9nKFwiUGxlYXNlIGZpbGwgaW4gYWxsIGZpZWxkc1wiKVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAkaHR0cC5wb3N0KCcvYXBpL3N1Ym1pc3Npb25zJywge1xyXG4gICAgICAgICAgZW1haWw6ICRzY29wZS5zdWJtaXNzaW9uLmVtYWlsLFxyXG4gICAgICAgICAgdHJhY2tJRDogJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tJRCxcclxuICAgICAgICAgIG5hbWU6ICRzY29wZS5zdWJtaXNzaW9uLm5hbWUsXHJcbiAgICAgICAgICB0aXRsZTogJHNjb3BlLnN1Ym1pc3Npb24udGl0bGUsXHJcbiAgICAgICAgICB0cmFja1VSTDogJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tVUkwsXHJcbiAgICAgICAgICB0cmFja0FydGlzdDogJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tBcnRpc3QsXHJcbiAgICAgICAgICB0cmFja0FydGlzdFVSTDogJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tBcnRpc3RVUkwsXHJcbiAgICAgICAgICBhcnR3b3JrVVJMOiAkc2NvcGUuc3VibWlzc2lvbi5hcnR3b3JrVVJMLFxyXG4gICAgICAgICAgY2hhbm5lbElEUzogW10sXHJcbiAgICAgICAgICBpbnZvaWNlSURTOiBbXSxcclxuICAgICAgICAgIHVzZXJJRDogdXNlcklELnVzZXJpZCxcclxuICAgICAgICAgIGdlbnJlOiAkc2NvcGUuc3VibWlzc2lvbi5nZW5yZVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIllvdXIgc29uZyBoYXMgYmVlbiBzdWJtaXR0ZWQgYW5kIHdpbGwgYmUgcmV2aWV3ZWQgc29vbi5cIik7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgJHNjb3BlLm5vdEZvdW5kID0gZmFsc2U7XHJcbiAgICAgICAgICAkc2NvcGUuc3VibWlzc2lvbiA9IHtcclxuICAgICAgICAgICAgZ2VucmU6IFwiZ2VucmVcIlxyXG4gICAgICAgICAgfTtcclxuICAgICAgICAgICRzY29wZS5zZWFyY2hTdHJpbmcgPSBcIlwiO1xyXG4gICAgICAgICAgJHNjb3BlLnNob3dQbGF5ZXIgPSBmYWxzZTtcclxuICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllckN1c3RvbScpLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xyXG4gICAgICAgICAgJHNjb3BlLnVybCA9IFwiXCI7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZyhlcnIuZGF0YSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfVxyXG59KTtcclxuIl0sImZpbGUiOiJhY2NvdW50U3VibWl0L2FjY291bnRTdWJtaXQuanMifQ==
