app.directive('shareLinkModal', function ($http) {
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
      eventId:'=eventId',
      eventType:'=eventType'
    },
    transclude: true,
    controller: function ($scope) {
      $scope.handler = 'pop'; 
      $scope.origin = window.location.origin;
      $scope.sendMail = function(id) {
        if(eventType =='share'){
          $scope.fbMessageLink = $scope.origin + "/repostevents?id=" + id;
        } else {
          $scope.fbMessageLink = $scope.origin + "/artistTools/reForReInteraction/" + id;
        }
        $window.open("mailto:example@demo.com?body=" + $scope.fbMessageLink, "_self");
      };
    },
  };
});

