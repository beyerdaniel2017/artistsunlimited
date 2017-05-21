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
      $scope.makeChange = function() {

      }
      $scope.$watch('eventId', function() {
        $scope.makeChange();
        if (!!$scope.event || !!$scope.trade) {
          if ($scope.eventType == 'share') {
            $scope.shareLink = 'artistsunlimited.com/repostevents/' + $scope.event.user.soundcloud.pseudoname + "/" + $scope.event.pseudoname;
            if ($scope.event) $scope.messengerLink = 'https://' + $scope.shareLink;
            $scope.scurl = "https://soundcloud.com";
          } else {
            if ($scope.trade) {
              $scope.shareLink = 'artistsunlimited.com/artistTools/trade/' + $scope.trade.p1.user.soundcloud.pseudoname + '/' + $scope.trade.p2.user.soundcloud.pseudoname;
              $scope.messengerLink = 'https://' + $scope.shareLink;
              $scope.scurl = $scope.trade.other.user.soundcloud.permalinkURL;
            }
          }
        }
        $rootScope.reloadFB();
      });
      $scope.sendMail = function(id) {
        window.open("mailto:example@demo.com?body=" + $scope.shareLink, "_self");
      };
    },
  };
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24vZGlyZWN0aXZlcy9zaGFyZUxpbmsvc2hhcmVMaW5rLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5kaXJlY3RpdmUoJ3NsbW9kYWwnLCBmdW5jdGlvbigkaHR0cCkge1xyXG4gIHJldHVybiB7XHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2NvbW1vbi9kaXJlY3RpdmVzL3NoYXJlTGluay9zaGFyZUxpbmsuaHRtbCcsXHJcbiAgICByZXN0cmljdDogJ0VBJyxcclxuICAgIHNjb3BlOiB7XHJcbiAgICAgIHRpdGxlOiAnPW1vZGFsVGl0bGUnLFxyXG4gICAgICBoZWFkZXI6ICc9bW9kYWxIZWFkZXInLFxyXG4gICAgICBib2R5OiAnPW1vZGFsQm9keScsXHJcbiAgICAgIGZvb3RlcjogJz1tb2RhbEZvb3RlcicsXHJcbiAgICAgIGNhbGxiYWNrYnV0dG9ubGVmdDogJyZuZ0NsaWNrTGVmdEJ1dHRvbicsXHJcbiAgICAgIGNhbGxiYWNrYnV0dG9ucmlnaHQ6ICcmbmdDbGlja1JpZ2h0QnV0dG9uJyxcclxuICAgICAgaGFuZGxlcjogJz1sb2xvJyxcclxuICAgICAgZXZlbnRJZDogJz1ldmVudElkJyxcclxuICAgICAgZXZlbnQ6ICc9ZXZlbnQnLFxyXG4gICAgICB0cmFkZTogJz10cmFkZScsXHJcbiAgICAgIGV2ZW50VHlwZTogJz1ldmVudFR5cGUnXHJcbiAgICB9LFxyXG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCRzY29wZSwgJHJvb3RTY29wZSkge1xyXG4gICAgICAkc2NvcGUuaGFuZGxlciA9ICdwb3AnO1xyXG4gICAgICAkc2NvcGUub3JpZ2luID0gd2luZG93LmxvY2F0aW9uLm9yaWdpbjtcclxuICAgICAgJHNjb3BlLm1ha2VDaGFuZ2UgPSBmdW5jdGlvbigpIHtcclxuXHJcbiAgICAgIH1cclxuICAgICAgJHNjb3BlLiR3YXRjaCgnZXZlbnRJZCcsIGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS5tYWtlQ2hhbmdlKCk7XHJcbiAgICAgICAgaWYgKCEhJHNjb3BlLmV2ZW50IHx8ICEhJHNjb3BlLnRyYWRlKSB7XHJcbiAgICAgICAgICBpZiAoJHNjb3BlLmV2ZW50VHlwZSA9PSAnc2hhcmUnKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5zaGFyZUxpbmsgPSAnYXJ0aXN0c3VubGltaXRlZC5jb20vcmVwb3N0ZXZlbnRzLycgKyAkc2NvcGUuZXZlbnQudXNlci5zb3VuZGNsb3VkLnBzZXVkb25hbWUgKyBcIi9cIiArICRzY29wZS5ldmVudC5wc2V1ZG9uYW1lO1xyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLmV2ZW50KSAkc2NvcGUubWVzc2VuZ2VyTGluayA9ICdodHRwczovLycgKyAkc2NvcGUuc2hhcmVMaW5rO1xyXG4gICAgICAgICAgICAkc2NvcGUuc2N1cmwgPSBcImh0dHBzOi8vc291bmRjbG91ZC5jb21cIjtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGlmICgkc2NvcGUudHJhZGUpIHtcclxuICAgICAgICAgICAgICAkc2NvcGUuc2hhcmVMaW5rID0gJ2FydGlzdHN1bmxpbWl0ZWQuY29tL2FydGlzdFRvb2xzL3RyYWRlLycgKyAkc2NvcGUudHJhZGUucDEudXNlci5zb3VuZGNsb3VkLnBzZXVkb25hbWUgKyAnLycgKyAkc2NvcGUudHJhZGUucDIudXNlci5zb3VuZGNsb3VkLnBzZXVkb25hbWU7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLm1lc3NlbmdlckxpbmsgPSAnaHR0cHM6Ly8nICsgJHNjb3BlLnNoYXJlTGluaztcclxuICAgICAgICAgICAgICAkc2NvcGUuc2N1cmwgPSAkc2NvcGUudHJhZGUub3RoZXIudXNlci5zb3VuZGNsb3VkLnBlcm1hbGlua1VSTDtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICAkcm9vdFNjb3BlLnJlbG9hZEZCKCk7XHJcbiAgICAgIH0pO1xyXG4gICAgICAkc2NvcGUuc2VuZE1haWwgPSBmdW5jdGlvbihpZCkge1xyXG4gICAgICAgIHdpbmRvdy5vcGVuKFwibWFpbHRvOmV4YW1wbGVAZGVtby5jb20/Ym9keT1cIiArICRzY29wZS5zaGFyZUxpbmssIFwiX3NlbGZcIik7XHJcbiAgICAgIH07XHJcbiAgICB9LFxyXG4gIH07XHJcbn0pOyJdLCJmaWxlIjoiY29tbW9uL2RpcmVjdGl2ZXMvc2hhcmVMaW5rL3NoYXJlTGluay5qcyJ9
