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

app.controller('PayController', function($scope, $rootScope, $http, channels, submission, track, $state, $uibModal) {
  $rootScope.submission = submission;
  $scope.auDLLink = false;
  if (submission.paid) $state.go('home');
  $scope.track = track;
  SC.oEmbed(track.uri, {
    element: document.getElementById('scPlayer'),
    auto_play: false,
    maxheight: 150
  });
  $scope.total = 0;
  $scope.channels = channels.filter(function(ch) {
    return (submission.channelIDS.indexOf(ch.channelID) != -1)
  });

  $scope.auDLLink = $scope.track.purchase_url ? ($scope.track.purchase_url.indexOf("artistsunlimited.co") != -1) : false;

  $scope.selectedChannels = {};
  $scope.channels.forEach(function(ch) {
    $scope.selectedChannels[ch.displayName] = false;
  });

  $scope.goToLogin = function() {
    $state.go('login', {
      'submission': $rootScope.submission
    });
  }

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
    if ($scope.auDLLink) $scope.total = Math.floor(0.9 * $scope.total);
  }

  $scope.makePayment = function() {
    if ($scope.total != 0) {
      if ($scope.auDLLink) {
        $scope.discountModalInstance = $uibModal.open({
          animation: true,
          templateUrl: 'discountModal.html',
          controller: 'discountModalController',
          scope: $scope
        });
      } else {
        $scope.continuePay(false);
      }
    }
  };

  $scope.continuePay = function(discounted) {
    if ($scope.discountedModal) {
      $scope.discountModalInstance.close();
    }
    $scope.processing = true;
    var pricingObj = {
      channels: [],
      discounted: discounted,
      submission: $rootScope.submission
    };
    for (var key in $scope.selectedChannels) {
      if ($scope.selectedChannels[key]) {
        var chan = $scope.channels.find(function(ch) {
          return ch.displayName == key;
        })
        pricingObj.channels.push(chan.channelID);
      }
    }
    $http.post('/api/submissions/getPayment', pricingObj)
      .then(function(res) {
        window.location = res.data;
      })
  }
});

app.controller('discountModalController', function($scope) {

})