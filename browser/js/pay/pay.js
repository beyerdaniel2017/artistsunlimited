app.config(function($stateProvider) {
  $stateProvider.state('pay', {
    url: '/pay/:submissionID',
    templateUrl: 'js/pay/pay.html',
    controller: 'PayController',
    resolve: {
      channels: function($http) {
        return $http.get('/api/channels')
          .then(function(res) {
            return res.data;
          })
      },
      submission: function($http, $stateParams) {
        return $http.get('/api/submissions/withID/' + $stateParams.submissionID)
          .then(function(res) {
            return res.data;
          })
      },
      track: function(submission) {
        return SC.get('/tracks/' + submission.trackID)
          .then(function(track) {
            return track;
          });
      }
    }
  });
});

app.controller('PayController', function($scope, $rootScope, $http, channels, submission, track) {
  $scope.submission = submission;
  $scope.track = track;
  SC.oEmbed(track.uri, {
    element: document.getElementById('scPlayer'),
    auto_play: false,
    maxheight: 150
  });
  $scope.total = 0;
  console.log(track);
  $scope.channels = channels;
  // $scope.channels = channels.filter(function(ch) {
  //   return (submission.channelIDS.indexOf(ch.channelID) != -1)
  // });
  $scope.auDLLink = ($scope.track.purchase_url.includes("artistsunlimited.co"));
  console.log($scope.auDLLink);

  $scope.selectedChannels = {};
  $scope.channels.forEach(function(ch) {
    $scope.selectedChannels[ch.displayName] = false;
  });

  $scope.recalculate = function() {
    $scope.total = 0;
    $scope.totalPayment = 0;
    for (var key in $scope.selectedChannels) {
      if ($scope.selectedChannels[key]) {
        var chan = $scope.channels.find(function(ch) {
          return ch.displayName == key;
        })
        $scope.total += chan.price;
      }
    }
    if ($scope.auDLLink) $scope.total = Math.floor(0.8 * $scope.total);
  }

  $scope.makePayment = function() {

  }

});