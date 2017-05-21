app.config(function($stateProvider) {
  $stateProvider.state('pay', {
    url: '/pay/:submissionID',
    templateUrl: 'js/pay/pay.html',
    controller: 'PayController',
    resolve: {
      submission: function($http, $stateParams) {
        return $http.get('/api/submissions/withID/' + $stateParams.submissionID)
          .then(function(res) {
            return res.data;
          })
      },
      channels: function($http, submission) {
        submission.channels.sort(function() {
          return .5 - Math.random();
        });
        return submission.channels;
      }
    }
  });
});

app.filter('calculateDiscount', function() {
  return function(input) {
    return parseFloat(input * 0.90).toFixed(2);
  };
});

app.controller('PayController', function($scope, $rootScope, $http, channels, submission, $state, $uibModal, AppConfig) {
  $rootScope.submission = submission;
  $scope.auDLLink = false;
  $scope.showSignUp = false;
  if ($state.$current.name == "pay") {
    $scope.showSignUp = true;
  }

  $scope.total = 0;
  $scope.showTotal = 0;
  $scope.channels = channels;

  $scope.goToLogin = function() {
    $state.go('login', {
      'submission': $rootScope.submission
    });
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
    } else {
      $.Zebra_Dialog('Please add a repost to your cart by clicking "Add To Cart".');
    }
  };

  $scope.continuePay = function(discounted) {
    if ($scope.discountedModal) {
      $scope.discountModalInstance.close();
    }
    $scope.processing = true;
    if (discounted) $scope.showTotal = parseFloat($scope.total * 0.9).toFixed(2);
    else $scope.showTotal = parseFloat($scope.total).toFixed(2);
    var pricingObj = {
      total: $scope.showTotal,
      submission: $rootScope.submission,
      channels: $scope.channels.filter(function(ch) {
        return ch.addtocart;
      })
    };
    $http.post('/api/submissions/getPayment', pricingObj)
      .then(function(res) {
        window.location = res.data;
      }).then(null, function(err) {
        $scope.processing = false;
        $.Zebra_Dialog(err.message);
      })
  }

  $scope.addToCart = function(channel) {
    if (channel.addtocart) {
      $scope.total = $scope.total - parseFloat(channel.price);
    } else {
      $scope.total += parseFloat(channel.price);
    }
    channel.addtocart = channel.addtocart ? false : true;
    if ($scope.auDLLink) $scope.showTotal = parseFloat($scope.total * 0.9).toFixed(2);
    else $scope.showTotal = parseFloat($scope.total).toFixed(2);
  };
  $scope.getTrack = function() {

    SC.get('/tracks/' + submission.trackID)
      .then(function(track) {
        $scope.track = track;
      });
    setTimeout(function() {
      //$scope.auDLLink = $scope.track.purchase_url ? true: false;
      SC.Widget('scPlayer').load(submission.trackURL, {
        auto_play: false,
        show_artwork: true
      });
      // SC.oEmbed(submission.trackURL, {
      //     element: document.getElementById('scPlayer'),
      //     auto_play: false,
      //     maxheight: 150
      //   });
    }, 3000);
  }
  $scope.getTrack();
});


app.controller('discountModalController', function($scope) {

})

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwYXkvcGF5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncGF5Jywge1xyXG4gICAgdXJsOiAnL3BheS86c3VibWlzc2lvbklEJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvcGF5L3BheS5odG1sJyxcclxuICAgIGNvbnRyb2xsZXI6ICdQYXlDb250cm9sbGVyJyxcclxuICAgIHJlc29sdmU6IHtcclxuICAgICAgc3VibWlzc2lvbjogZnVuY3Rpb24oJGh0dHAsICRzdGF0ZVBhcmFtcykge1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5nZXQoJy9hcGkvc3VibWlzc2lvbnMvd2l0aElELycgKyAkc3RhdGVQYXJhbXMuc3VibWlzc2lvbklEKVxyXG4gICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXMuZGF0YTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgIH0sXHJcbiAgICAgIGNoYW5uZWxzOiBmdW5jdGlvbigkaHR0cCwgc3VibWlzc2lvbikge1xyXG4gICAgICAgIHN1Ym1pc3Npb24uY2hhbm5lbHMuc29ydChmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHJldHVybiAuNSAtIE1hdGgucmFuZG9tKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgcmV0dXJuIHN1Ym1pc3Npb24uY2hhbm5lbHM7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9KTtcclxufSk7XHJcblxyXG5hcHAuZmlsdGVyKCdjYWxjdWxhdGVEaXNjb3VudCcsIGZ1bmN0aW9uKCkge1xyXG4gIHJldHVybiBmdW5jdGlvbihpbnB1dCkge1xyXG4gICAgcmV0dXJuIHBhcnNlRmxvYXQoaW5wdXQgKiAwLjkwKS50b0ZpeGVkKDIpO1xyXG4gIH07XHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ1BheUNvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRyb290U2NvcGUsICRodHRwLCBjaGFubmVscywgc3VibWlzc2lvbiwgJHN0YXRlLCAkdWliTW9kYWwsIEFwcENvbmZpZykge1xyXG4gICRyb290U2NvcGUuc3VibWlzc2lvbiA9IHN1Ym1pc3Npb247XHJcbiAgJHNjb3BlLmF1RExMaW5rID0gZmFsc2U7XHJcbiAgJHNjb3BlLnNob3dTaWduVXAgPSBmYWxzZTtcclxuICBpZiAoJHN0YXRlLiRjdXJyZW50Lm5hbWUgPT0gXCJwYXlcIikge1xyXG4gICAgJHNjb3BlLnNob3dTaWduVXAgPSB0cnVlO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLnRvdGFsID0gMDtcclxuICAkc2NvcGUuc2hvd1RvdGFsID0gMDtcclxuICAkc2NvcGUuY2hhbm5lbHMgPSBjaGFubmVscztcclxuXHJcbiAgJHNjb3BlLmdvVG9Mb2dpbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHN0YXRlLmdvKCdsb2dpbicsIHtcclxuICAgICAgJ3N1Ym1pc3Npb24nOiAkcm9vdFNjb3BlLnN1Ym1pc3Npb25cclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLm1ha2VQYXltZW50ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoJHNjb3BlLnRvdGFsICE9IDApIHtcclxuICAgICAgaWYgKCRzY29wZS5hdURMTGluaykge1xyXG4gICAgICAgICRzY29wZS5kaXNjb3VudE1vZGFsSW5zdGFuY2UgPSAkdWliTW9kYWwub3Blbih7XHJcbiAgICAgICAgICBhbmltYXRpb246IHRydWUsXHJcbiAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2Rpc2NvdW50TW9kYWwuaHRtbCcsXHJcbiAgICAgICAgICBjb250cm9sbGVyOiAnZGlzY291bnRNb2RhbENvbnRyb2xsZXInLFxyXG4gICAgICAgICAgc2NvcGU6ICRzY29wZVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICRzY29wZS5jb250aW51ZVBheShmYWxzZSk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICQuWmVicmFfRGlhbG9nKCdQbGVhc2UgYWRkIGEgcmVwb3N0IHRvIHlvdXIgY2FydCBieSBjbGlja2luZyBcIkFkZCBUbyBDYXJ0XCIuJyk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmNvbnRpbnVlUGF5ID0gZnVuY3Rpb24oZGlzY291bnRlZCkge1xyXG4gICAgaWYgKCRzY29wZS5kaXNjb3VudGVkTW9kYWwpIHtcclxuICAgICAgJHNjb3BlLmRpc2NvdW50TW9kYWxJbnN0YW5jZS5jbG9zZSgpO1xyXG4gICAgfVxyXG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgaWYgKGRpc2NvdW50ZWQpICRzY29wZS5zaG93VG90YWwgPSBwYXJzZUZsb2F0KCRzY29wZS50b3RhbCAqIDAuOSkudG9GaXhlZCgyKTtcclxuICAgIGVsc2UgJHNjb3BlLnNob3dUb3RhbCA9IHBhcnNlRmxvYXQoJHNjb3BlLnRvdGFsKS50b0ZpeGVkKDIpO1xyXG4gICAgdmFyIHByaWNpbmdPYmogPSB7XHJcbiAgICAgIHRvdGFsOiAkc2NvcGUuc2hvd1RvdGFsLFxyXG4gICAgICBzdWJtaXNzaW9uOiAkcm9vdFNjb3BlLnN1Ym1pc3Npb24sXHJcbiAgICAgIGNoYW5uZWxzOiAkc2NvcGUuY2hhbm5lbHMuZmlsdGVyKGZ1bmN0aW9uKGNoKSB7XHJcbiAgICAgICAgcmV0dXJuIGNoLmFkZHRvY2FydDtcclxuICAgICAgfSlcclxuICAgIH07XHJcbiAgICAkaHR0cC5wb3N0KCcvYXBpL3N1Ym1pc3Npb25zL2dldFBheW1lbnQnLCBwcmljaW5nT2JqKVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICB3aW5kb3cubG9jYXRpb24gPSByZXMuZGF0YTtcclxuICAgICAgfSkudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICQuWmVicmFfRGlhbG9nKGVyci5tZXNzYWdlKTtcclxuICAgICAgfSlcclxuICB9XHJcblxyXG4gICRzY29wZS5hZGRUb0NhcnQgPSBmdW5jdGlvbihjaGFubmVsKSB7XHJcbiAgICBpZiAoY2hhbm5lbC5hZGR0b2NhcnQpIHtcclxuICAgICAgJHNjb3BlLnRvdGFsID0gJHNjb3BlLnRvdGFsIC0gcGFyc2VGbG9hdChjaGFubmVsLnByaWNlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICRzY29wZS50b3RhbCArPSBwYXJzZUZsb2F0KGNoYW5uZWwucHJpY2UpO1xyXG4gICAgfVxyXG4gICAgY2hhbm5lbC5hZGR0b2NhcnQgPSBjaGFubmVsLmFkZHRvY2FydCA/IGZhbHNlIDogdHJ1ZTtcclxuICAgIGlmICgkc2NvcGUuYXVETExpbmspICRzY29wZS5zaG93VG90YWwgPSBwYXJzZUZsb2F0KCRzY29wZS50b3RhbCAqIDAuOSkudG9GaXhlZCgyKTtcclxuICAgIGVsc2UgJHNjb3BlLnNob3dUb3RhbCA9IHBhcnNlRmxvYXQoJHNjb3BlLnRvdGFsKS50b0ZpeGVkKDIpO1xyXG4gIH07XHJcbiAgJHNjb3BlLmdldFRyYWNrID0gZnVuY3Rpb24oKSB7XHJcblxyXG4gICAgU0MuZ2V0KCcvdHJhY2tzLycgKyBzdWJtaXNzaW9uLnRyYWNrSUQpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHRyYWNrKSB7XHJcbiAgICAgICAgJHNjb3BlLnRyYWNrID0gdHJhY2s7XHJcbiAgICAgIH0pO1xyXG4gICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgLy8kc2NvcGUuYXVETExpbmsgPSAkc2NvcGUudHJhY2sucHVyY2hhc2VfdXJsID8gdHJ1ZTogZmFsc2U7XHJcbiAgICAgIFNDLldpZGdldCgnc2NQbGF5ZXInKS5sb2FkKHN1Ym1pc3Npb24udHJhY2tVUkwsIHtcclxuICAgICAgICBhdXRvX3BsYXk6IGZhbHNlLFxyXG4gICAgICAgIHNob3dfYXJ0d29yazogdHJ1ZVxyXG4gICAgICB9KTtcclxuICAgICAgLy8gU0Mub0VtYmVkKHN1Ym1pc3Npb24udHJhY2tVUkwsIHtcclxuICAgICAgLy8gICAgIGVsZW1lbnQ6IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLFxyXG4gICAgICAvLyAgICAgYXV0b19wbGF5OiBmYWxzZSxcclxuICAgICAgLy8gICAgIG1heGhlaWdodDogMTUwXHJcbiAgICAgIC8vICAgfSk7XHJcbiAgICB9LCAzMDAwKTtcclxuICB9XHJcbiAgJHNjb3BlLmdldFRyYWNrKCk7XHJcbn0pO1xyXG5cclxuXHJcbmFwcC5jb250cm9sbGVyKCdkaXNjb3VudE1vZGFsQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRzY29wZSkge1xyXG5cclxufSlcclxuIl0sImZpbGUiOiJwYXkvcGF5LmpzIn0=
