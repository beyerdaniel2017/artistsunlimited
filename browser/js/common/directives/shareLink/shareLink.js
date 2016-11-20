app.directive('slmodal', function($http) {
  return {
    templateUrl: 'js/common/directives/shareLink/shareLink.html',
    restrict: 'EA',
    scope: {
      title: '=modalTitle',
      header: '=modalHeader',
      body: '=modalBody',
      footer: '=modalFooter',
      callbackbuttonleft: '&ngClickLeftButton',
      callbackbuttonright: '&ngClickRightButton',
      handler: '=lolo',
      eventId: '=eventId',
      trade: '=trade',
      eventType: '=eventType'
    },
    transclude: true,
    controller: function($scope, $rootScope) {
      console.log($scope.eventId);
      $scope.handler = 'pop';
      $scope.origin = window.location.origin;
      $scope.$watch('eventId', function() {
        if ($scope.eventType == 'share') {
          $scope.messengerLink = 'https://artistsunlimited.com' + "/repostevents?id=" + $scope.eventId;
        } else {
          if ($scope.trade) {
            $scope.messengerLink = 'https://artistsunlimited.com/artistTools/trade/' + $scope.trade.p1.user.soundcloud.username.replace(" ", "_") + '/' + $scope.trade.p2.user.soundcloud.username.replace(" ", "_");
          }
        }
        console.log($scope.messengerLink);
        $rootScope.reloadFB();
      })
      $scope.sendMail = function(id) {
        if ($scope.eventType == 'share') {
          var shareLink = $scope.origin + "/repostevents?id=" + id;
        } else {
          var shareLink = $scope.origin + "/artistTools/trade/" + $scope.trade.p1.user.soundcloud.username + '/' + $scope.trade.p2.user.soundcloud.username;
          shareLink = shareLink.replace(" ", "_");
        }
        window.open("mailto:example@demo.com?body=" + shareLink, "_self");
      };
    },
  };
});