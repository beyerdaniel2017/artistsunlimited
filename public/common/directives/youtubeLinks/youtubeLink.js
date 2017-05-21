app.directive('youtubeModal', function ($http) {
  return {
    templateUrl: 'js/common/directives/youtubeLinks/youtubeLink.html',
    restrict: 'EA',
    scope: {
      title: '=modalTitle',
      header: '=modalHeader',
      body: '=modalBody',
      footer: '=modalFooter',
      handler: '=youTube'
    },
    transclude: true,
    controller: function ($scope) {
      $scope.handler = 'ytube';
      $scope.origin = window.location.origin;
      if(window.location.pathname.indexOf('scheduler') >-1)
      { 
        $scope.youtubeUrl = "https://www.youtube.com/embed/vUCM_0evdQY";
      }
      else if(window.location.pathname.indexOf('reposttraders') >-1 || window.location.pathname.indexOf('reForReLists') >-1)
      {
        $scope.youtubeUrl = "https://www.youtube.com/embed/LA_HEUM_xqc";
      }
      else if(window.location.pathname.indexOf('admin/submission') >-1)
      {
        $scope.youtubeUrl = "https://www.youtube.com/embed/vUCM_0evdQY";
      }
      else if(window.location.pathname.indexOf('downloadGateway') >-1)
      {
        $scope.youtubeUrl = "https://www.youtube.com/embed/vUCM_0evdQY";
      }
      else if(window.location.pathname.indexOf('reForReInteraction') >-1)
      {
        $scope.youtubeUrl = "https://www.youtube.com/embed/vUCM_0evdQY";
      }
      else if(window.location.pathname.indexOf('admin/premiersubmissions') >-1)
      {
        $scope.youtubeUrl = "https://www.youtube.com/embed/vUCM_0evdQY";
      }       
    },
  };
});
app.filter('trusted', ['$sce', function($sce) {
  return function(url) {
    return $sce.trustAsResourceUrl(url);
  };
}]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24vZGlyZWN0aXZlcy95b3V0dWJlTGlua3MveW91dHViZUxpbmsuanMiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwLmRpcmVjdGl2ZSgneW91dHViZU1vZGFsJywgZnVuY3Rpb24gKCRodHRwKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMveW91dHViZUxpbmtzL3lvdXR1YmVMaW5rLmh0bWwnLFxyXG4gICAgcmVzdHJpY3Q6ICdFQScsXHJcbiAgICBzY29wZToge1xyXG4gICAgICB0aXRsZTogJz1tb2RhbFRpdGxlJyxcclxuICAgICAgaGVhZGVyOiAnPW1vZGFsSGVhZGVyJyxcclxuICAgICAgYm9keTogJz1tb2RhbEJvZHknLFxyXG4gICAgICBmb290ZXI6ICc9bW9kYWxGb290ZXInLFxyXG4gICAgICBoYW5kbGVyOiAnPXlvdVR1YmUnXHJcbiAgICB9LFxyXG4gICAgdHJhbnNjbHVkZTogdHJ1ZSxcclxuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgkc2NvcGUpIHtcclxuICAgICAgJHNjb3BlLmhhbmRsZXIgPSAneXR1YmUnO1xyXG4gICAgICAkc2NvcGUub3JpZ2luID0gd2luZG93LmxvY2F0aW9uLm9yaWdpbjtcclxuICAgICAgaWYod2luZG93LmxvY2F0aW9uLnBhdGhuYW1lLmluZGV4T2YoJ3NjaGVkdWxlcicpID4tMSlcclxuICAgICAgeyBcclxuICAgICAgICAkc2NvcGUueW91dHViZVVybCA9IFwiaHR0cHM6Ly93d3cueW91dHViZS5jb20vZW1iZWQvdlVDTV8wZXZkUVlcIjtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5pbmRleE9mKCdyZXBvc3R0cmFkZXJzJykgPi0xIHx8IHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5pbmRleE9mKCdyZUZvclJlTGlzdHMnKSA+LTEpXHJcbiAgICAgIHtcclxuICAgICAgICAkc2NvcGUueW91dHViZVVybCA9IFwiaHR0cHM6Ly93d3cueW91dHViZS5jb20vZW1iZWQvTEFfSEVVTV94cWNcIjtcclxuICAgICAgfVxyXG4gICAgICBlbHNlIGlmKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZS5pbmRleE9mKCdhZG1pbi9zdWJtaXNzaW9uJykgPi0xKVxyXG4gICAgICB7XHJcbiAgICAgICAgJHNjb3BlLnlvdXR1YmVVcmwgPSBcImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2VtYmVkL3ZVQ01fMGV2ZFFZXCI7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZih3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuaW5kZXhPZignZG93bmxvYWRHYXRld2F5JykgPi0xKVxyXG4gICAgICB7XHJcbiAgICAgICAgJHNjb3BlLnlvdXR1YmVVcmwgPSBcImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2VtYmVkL3ZVQ01fMGV2ZFFZXCI7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZih3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuaW5kZXhPZigncmVGb3JSZUludGVyYWN0aW9uJykgPi0xKVxyXG4gICAgICB7XHJcbiAgICAgICAgJHNjb3BlLnlvdXR1YmVVcmwgPSBcImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2VtYmVkL3ZVQ01fMGV2ZFFZXCI7XHJcbiAgICAgIH1cclxuICAgICAgZWxzZSBpZih3aW5kb3cubG9jYXRpb24ucGF0aG5hbWUuaW5kZXhPZignYWRtaW4vcHJlbWllcnN1Ym1pc3Npb25zJykgPi0xKVxyXG4gICAgICB7XHJcbiAgICAgICAgJHNjb3BlLnlvdXR1YmVVcmwgPSBcImh0dHBzOi8vd3d3LnlvdXR1YmUuY29tL2VtYmVkL3ZVQ01fMGV2ZFFZXCI7XHJcbiAgICAgIH0gICAgICAgXHJcbiAgICB9LFxyXG4gIH07XHJcbn0pO1xyXG5hcHAuZmlsdGVyKCd0cnVzdGVkJywgWyckc2NlJywgZnVuY3Rpb24oJHNjZSkge1xyXG4gIHJldHVybiBmdW5jdGlvbih1cmwpIHtcclxuICAgIHJldHVybiAkc2NlLnRydXN0QXNSZXNvdXJjZVVybCh1cmwpO1xyXG4gIH07XHJcbn1dKTtcclxuIl0sImZpbGUiOiJjb21tb24vZGlyZWN0aXZlcy95b3V0dWJlTGlua3MveW91dHViZUxpbmsuanMifQ==
