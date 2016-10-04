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
      if(window.location.pathname.indexOf('admin/scheduler') >-1)
      { 
        $scope.youtubeUrl = "https://www.youtube.com/watch?v=vUCM_0evdQY";
      }
      else if(window.location.pathname.indexOf('admin/reposttraders') >-1)
      {
        $scope.youtubeUrl = "https://www.youtube.com/embed/XGSy3_Czz8k";
      }
      else if(window.location.pathname.indexOf('admin/submission') >-1)
      {
        $scope.youtubeUrl = "https://www.youtube.com/embed/XGSy3_Czz8k";
      }
      else if(window.location.pathname.indexOf('admin/downloadGateway') >-1)
      {
        $scope.youtubeUrl = "https://www.youtube.com/embed/XGSy3_Czz8k";
      }
      else if(window.location.pathname.indexOf('admin/reForReInteraction') >-1)
      {
        $scope.youtubeUrl = "https://www.youtube.com/embed/XGSy3_Czz8k";
      }
      else if(window.location.pathname.indexOf('admin/premiersubmissions') >-1)
      {
        $scope.youtubeUrl = "https://www.youtube.com/embed/XGSy3_Czz8k";
      }       
    },
  };
});
app.filter('trusted', ['$sce', function($sce) {
  return function(url) {
    return $sce.trustAsResourceUrl(url);
  };
}]);
