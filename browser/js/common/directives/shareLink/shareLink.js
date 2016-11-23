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
      event: '=event',
      trade: '=trade',
      eventType: '=eventType'
    },
    transclude: true,
    controller: function($scope, $rootScope) {
      $scope.handler = 'pop';
      $scope.origin = window.location.origin;
      $scope.$watch('eventId', function() {
        if ($scope.eventType == 'share') {
          if ($scope.event) $scope.messengerLink = 'https://artistsunlimited.com' + "/repostevents/" + $scope.event.user.soundcloud.pseudoname + "/" + $scope.event.pseudoname;
        } else {
          if ($scope.trade) {
            $scope.messengerLink = 'https://artistsunlimited.com/artistTools/trade/' + $scope.trade.p1.user.soundcloud.pseudoname + '/' + $scope.trade.p2.user.soundcloud.pseudoname;
          }
        }
        console.log($scope.messengerLink);
        $rootScope.reloadFB();
      });
      $scope.sendMail = function(id) {
        window.open("mailto:example@demo.com?body=" + $scope.messengerLink, "_self");
      };
    },
  };
});