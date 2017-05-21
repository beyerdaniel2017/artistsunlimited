app.config(function($stateProvider) {
  $stateProvider.state('submitSong', {
    url: '/submit',
    templateUrl: 'js/poolSubmit/submit.view.html',
    controller: 'SubmitSongController'
  });
  $stateProvider.state('customsubmits', {
    url: '/custom/:username/:submitpart',
    templateUrl: 'js/accountSubmit/accountsubmit.view.html',
    controller: 'SubmitSongController',
    resolve: {
      getUserByURL: function($stateParams, $http, $window) {
        var username = $stateParams.username;
        var submitpart = $stateParams.submitpart;
        if (submitpart.indexOf('submit') != -1) {
          $window.location.href = '/' + username + '/submit';
        } else {
          $window.location.href = '/' + username + '/premiere';
        }
        return new Promise(function(fulfill, reject) {});
      }
    }
  });
});

app.controller('SubmitSongController', function(SessionService, $rootScope, $state, $scope, $http, $location) {

  $scope.user = SessionService.getUser();
  $scope.showSignup = true;
  $scope.submission = {};
  $scope.userID = $location.search().id;
  $scope.searchString = "";

  $scope.showPlayer = false;
  
  $scope.choseTrack = function(track) {
    console.log(track.permalink_url);
    if (track.user.permalink_url!="http://soundcloud.com/tropisnetwork") 
    {
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
  }
  $scope.submit = function() {
    if (!$scope.submission.email || !$scope.submission.name || !$scope.submission.trackID) {
      $.Zebra_Dialog("Please fill in all fields")
    } else {
      $scope.processing = true;
      $http.post('/api/submissions/pool', {
          email: $scope.submission.email,
          trackID: $scope.submission.trackID,
          name: $scope.submission.name,
          title: $scope.submission.title,
          trackURL: $scope.submission.trackURL,
          trackArtist: $scope.submission.trackArtist,
          trackArtistURL: $scope.submission.trackArtistURL,
          artworkURL: $scope.submission.artworkURL,
          channelIDS: [],
          genre: ''
        })
        .then(function(res) {
          $.Zebra_Dialog("Your song has been submitted and will be reviewed soon.");
          $scope.processing = false;
          $scope.notFound = false;
          $scope.showPlayer = false;
          $scope.submission = {};
          $scope.searchString = "";
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwb29sU3VibWl0L3N1Ym1pdC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdzdWJtaXRTb25nJywge1xuICAgIHVybDogJy9zdWJtaXQnLFxuICAgIHRlbXBsYXRlVXJsOiAnanMvcG9vbFN1Ym1pdC9zdWJtaXQudmlldy5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnU3VibWl0U29uZ0NvbnRyb2xsZXInXG4gIH0pO1xuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnY3VzdG9tc3VibWl0cycsIHtcbiAgICB1cmw6ICcvY3VzdG9tLzp1c2VybmFtZS86c3VibWl0cGFydCcsXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9hY2NvdW50U3VibWl0L2FjY291bnRzdWJtaXQudmlldy5odG1sJyxcbiAgICBjb250cm9sbGVyOiAnU3VibWl0U29uZ0NvbnRyb2xsZXInLFxuICAgIHJlc29sdmU6IHtcbiAgICAgIGdldFVzZXJCeVVSTDogZnVuY3Rpb24oJHN0YXRlUGFyYW1zLCAkaHR0cCwgJHdpbmRvdykge1xuICAgICAgICB2YXIgdXNlcm5hbWUgPSAkc3RhdGVQYXJhbXMudXNlcm5hbWU7XG4gICAgICAgIHZhciBzdWJtaXRwYXJ0ID0gJHN0YXRlUGFyYW1zLnN1Ym1pdHBhcnQ7XG4gICAgICAgIGlmIChzdWJtaXRwYXJ0LmluZGV4T2YoJ3N1Ym1pdCcpICE9IC0xKSB7XG4gICAgICAgICAgJHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy8nICsgdXNlcm5hbWUgKyAnL3N1Ym1pdCc7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgJHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJy8nICsgdXNlcm5hbWUgKyAnL3ByZW1pZXJlJztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24oZnVsZmlsbCwgcmVqZWN0KSB7fSk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignU3VibWl0U29uZ0NvbnRyb2xsZXInLCBmdW5jdGlvbihTZXNzaW9uU2VydmljZSwgJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCAkbG9jYXRpb24pIHtcblxuICAkc2NvcGUudXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcbiAgJHNjb3BlLnNob3dTaWdudXAgPSB0cnVlO1xuICAkc2NvcGUuc3VibWlzc2lvbiA9IHt9O1xuICAkc2NvcGUudXNlcklEID0gJGxvY2F0aW9uLnNlYXJjaCgpLmlkO1xuICAkc2NvcGUuc2VhcmNoU3RyaW5nID0gXCJcIjtcblxuICAkc2NvcGUuc2hvd1BsYXllciA9IGZhbHNlO1xuICBcbiAgJHNjb3BlLmNob3NlVHJhY2sgPSBmdW5jdGlvbih0cmFjaykge1xuICAgIGNvbnNvbGUubG9nKHRyYWNrLnBlcm1hbGlua191cmwpO1xuICAgIGlmICh0cmFjay51c2VyLnBlcm1hbGlua191cmwhPVwiaHR0cDovL3NvdW5kY2xvdWQuY29tL3Ryb3Bpc25ldHdvcmtcIikgXG4gICAge1xuICAgICAgJHNjb3BlLnNlYXJjaFN0cmluZyA9IHRyYWNrLnRpdGxlO1xuICAgICAgJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tJRCA9IHRyYWNrLmlkO1xuICAgICAgJHNjb3BlLnN1Ym1pc3Npb24udGl0bGUgPSB0cmFjay50aXRsZTtcbiAgICAgICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrVVJMID0gdHJhY2sucGVybWFsaW5rX3VybDtcbiAgICAgIGlmICh0cmFjay51c2VyKSB7XG4gICAgICAgICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrQXJ0aXN0ID0gdHJhY2sudXNlci51c2VybmFtZTtcbiAgICAgICAgJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tBcnRpc3RVUkwgPSB0cmFjay51c2VyLnBlcm1hbGlua191cmw7XG4gICAgICB9XG4gICAgICAkc2NvcGUuc3VibWlzc2lvbi5hcnR3b3JrVVJMID0gdHJhY2suYXJ0d29ya191cmw7XG4gICAgICB2YXIgd2lkZ2V0ID0gU0MuV2lkZ2V0KCdzY1BsYXllckN1c3RvbScpO1xuICAgICAgd2lkZ2V0LmxvYWQoJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tVUkwsIHtcbiAgICAgICAgYXV0b19wbGF5OiBmYWxzZSxcbiAgICAgICAgc2hvd19hcnR3b3JrOiB0cnVlLFxuICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgaWYgKCRzY29wZS5zdWJtaXNzaW9uLnRpdGxlID09IFwiLS11bmtub3duLS1cIikge1xuICAgICAgICAgICAgd2lkZ2V0LmdldEN1cnJlbnRTb3VuZChmdW5jdGlvbih0cmFjaykge1xuICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0cmFjayk7XG4gICAgICAgICAgICAgICRzY29wZS5zZWFyY2hTdHJpbmcgPSB0cmFjay50aXRsZTtcbiAgICAgICAgICAgICAgJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tJRCA9IHRyYWNrLmlkO1xuICAgICAgICAgICAgICAkc2NvcGUuc3VibWlzc2lvbi50aXRsZSA9IHRyYWNrLnRpdGxlO1xuICAgICAgICAgICAgICAkc2NvcGUuc3VibWlzc2lvbi50cmFja1VSTCA9IHRyYWNrLnBlcm1hbGlua191cmw7XG4gICAgICAgICAgICAgICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrQXJ0aXN0ID0gdHJhY2sudXNlci51c2VybmFtZTtcbiAgICAgICAgICAgICAgJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tBcnRpc3RVUkwgPSB0cmFjay51c2VyLnBlcm1hbGlua191cmw7XG4gICAgICAgICAgICAgICRzY29wZS5zdWJtaXNzaW9uLmFydHdvcmtVUkwgPSB0cmFjay5hcnR3b3JrX3VybDtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgICRzY29wZS5zaG93UGxheWVyID0gdHJ1ZTtcbiAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3NjUGxheWVyQ3VzdG9tJykuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuICAgICAgfVxuICB9XG4gICRzY29wZS5zdWJtaXQgPSBmdW5jdGlvbigpIHtcbiAgICBpZiAoISRzY29wZS5zdWJtaXNzaW9uLmVtYWlsIHx8ICEkc2NvcGUuc3VibWlzc2lvbi5uYW1lIHx8ICEkc2NvcGUuc3VibWlzc2lvbi50cmFja0lEKSB7XG4gICAgICAkLlplYnJhX0RpYWxvZyhcIlBsZWFzZSBmaWxsIGluIGFsbCBmaWVsZHNcIilcbiAgICB9IGVsc2Uge1xuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xuICAgICAgJGh0dHAucG9zdCgnL2FwaS9zdWJtaXNzaW9ucy9wb29sJywge1xuICAgICAgICAgIGVtYWlsOiAkc2NvcGUuc3VibWlzc2lvbi5lbWFpbCxcbiAgICAgICAgICB0cmFja0lEOiAkc2NvcGUuc3VibWlzc2lvbi50cmFja0lELFxuICAgICAgICAgIG5hbWU6ICRzY29wZS5zdWJtaXNzaW9uLm5hbWUsXG4gICAgICAgICAgdGl0bGU6ICRzY29wZS5zdWJtaXNzaW9uLnRpdGxlLFxuICAgICAgICAgIHRyYWNrVVJMOiAkc2NvcGUuc3VibWlzc2lvbi50cmFja1VSTCxcbiAgICAgICAgICB0cmFja0FydGlzdDogJHNjb3BlLnN1Ym1pc3Npb24udHJhY2tBcnRpc3QsXG4gICAgICAgICAgdHJhY2tBcnRpc3RVUkw6ICRzY29wZS5zdWJtaXNzaW9uLnRyYWNrQXJ0aXN0VVJMLFxuICAgICAgICAgIGFydHdvcmtVUkw6ICRzY29wZS5zdWJtaXNzaW9uLmFydHdvcmtVUkwsXG4gICAgICAgICAgY2hhbm5lbElEUzogW10sXG4gICAgICAgICAgZ2VucmU6ICcnXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xuICAgICAgICAgICQuWmVicmFfRGlhbG9nKFwiWW91ciBzb25nIGhhcyBiZWVuIHN1Ym1pdHRlZCBhbmQgd2lsbCBiZSByZXZpZXdlZCBzb29uLlwiKTtcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xuICAgICAgICAgICRzY29wZS5ub3RGb3VuZCA9IGZhbHNlO1xuICAgICAgICAgICRzY29wZS5zaG93UGxheWVyID0gZmFsc2U7XG4gICAgICAgICAgJHNjb3BlLnN1Ym1pc3Npb24gPSB7fTtcbiAgICAgICAgICAkc2NvcGUuc2VhcmNoU3RyaW5nID0gXCJcIjtcbiAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2NQbGF5ZXJDdXN0b20nKS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgICAgICAgICAkc2NvcGUudXJsID0gXCJcIjtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZyhlcnIuZGF0YSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgfVxufSk7Il0sImZpbGUiOiJwb29sU3VibWl0L3N1Ym1pdC5qcyJ9
