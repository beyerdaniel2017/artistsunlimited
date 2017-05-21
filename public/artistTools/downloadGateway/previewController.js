app.config(function($stateProvider) {
  $stateProvider
    .state('artistToolsDownloadGatewayPreview', {
      url: '/artistTools/downloadGateway/preview',
      params: {
        submission: null
      },
      templateUrl: 'js/artistTools/downloadGateway/preview.html',
      controller: 'ArtistToolsPreviewController'
    })
});

app.controller("ArtistToolsPreviewController", function($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, SessionService, ArtistToolsService, DownloadTrackService) {});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcnRpc3RUb29scy9kb3dubG9hZEdhdGV3YXkvcHJldmlld0NvbnRyb2xsZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyXHJcbiAgICAuc3RhdGUoJ2FydGlzdFRvb2xzRG93bmxvYWRHYXRld2F5UHJldmlldycsIHtcclxuICAgICAgdXJsOiAnL2FydGlzdFRvb2xzL2Rvd25sb2FkR2F0ZXdheS9wcmV2aWV3JyxcclxuICAgICAgcGFyYW1zOiB7XHJcbiAgICAgICAgc3VibWlzc2lvbjogbnVsbFxyXG4gICAgICB9LFxyXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2FydGlzdFRvb2xzL2Rvd25sb2FkR2F0ZXdheS9wcmV2aWV3Lmh0bWwnLFxyXG4gICAgICBjb250cm9sbGVyOiAnQXJ0aXN0VG9vbHNQcmV2aWV3Q29udHJvbGxlcidcclxuICAgIH0pXHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoXCJBcnRpc3RUb29sc1ByZXZpZXdDb250cm9sbGVyXCIsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHN0YXRlUGFyYW1zLCAkc2NvcGUsICRodHRwLCAkbG9jYXRpb24sICR3aW5kb3csICR1aWJNb2RhbCwgJHRpbWVvdXQsIFNlc3Npb25TZXJ2aWNlLCBBcnRpc3RUb29sc1NlcnZpY2UsIERvd25sb2FkVHJhY2tTZXJ2aWNlKSB7fSk7Il0sImZpbGUiOiJhcnRpc3RUb29scy9kb3dubG9hZEdhdGV3YXkvcHJldmlld0NvbnRyb2xsZXIuanMifQ==
