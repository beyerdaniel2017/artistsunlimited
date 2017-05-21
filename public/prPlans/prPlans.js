app.config(function($stateProvider) {
  $stateProvider.state('prPlans', {
    url: '/prPlans',
    templateUrl: 'js/prPlans/prPlans.html',
    controller: 'prPlansController'
  });
});

app.controller('prPlansController', function($rootScope, $state, $scope, $http, PrPlanService) {
  $scope.prPlans = {};
  $scope.processing = false;
  $scope.openSocialDialog = function(type) {
    var displayText = "";
    if (type == 'Youtube')
      displayText = "Like SoundCloud, we premiere tracks to genre-specific  audiences. We work closely with an array of well-established YouTube channels for premieres. Approaches to promotion vary across different social media platforms and requires a nuanced understanding of each.";
    if (type == 'Blog Outreach')
      displayText = "When releasing a song, it is important to keep in mind  the manner in which  blogs can affect one's reach. The blogs we work with curate music with a specific audience in mind, tending to be committed readers. We have cultivated relationships with the faces behind various blogs, and we are fortunate to have their continued support of our content.";
    if (type == 'Spotify')
      displayText = 'The third and final platform in which we can assist with releasing music is Spotify. Spotify is an online music platform which pays artist per stream. Spotify at the core is also a substantial way for artists to be heard. There are over 100 Million users worldwide  and as one of the major online music platforms, we will do our best to get your track in as many playlists as possible.';
    if (type == 'Soundcloud')
      displayText = "We facilitate premieres over our network of over six SoundCloud channels, working closely with every artist to ensure that the network genre matches the feel of their track. Though we have had better results premiering content from our various network pages, we are also able to also make the track available on the artist's personal profile and promote the track from there. We remain flexible with many of these aspects and tailor each campaign to the respective goals of the artist.";

    $.Zebra_Dialog(displayText, {
      width: 600
    });
  }
  $scope.savePrPlan = function() {
    if (!$scope.prPlans.file || !$scope.prPlans.email || !$scope.prPlans.name || !$scope.prPlans.budget) {
      $.Zebra_Dialog("Please fill in all fields")
    } else {
      $scope.processing = true;
      $scope.message.visible = false;
      var data = new FormData();
      for (var prop in $scope.prPlans) {
        data.append(prop, $scope.prPlans[prop]);
      }

      PrPlanService
        .savePrPlan(data)
        .then(receiveResponse)
        .catch(catchError);

      function receiveResponse(res) {
        $scope.processing = false;
        if (res.status === 200) {
          $scope.prPlans = {};
          angular.element("input[type='file']").val(null);
          $.Zebra_Dialog("Thank you! Your request has been submitted successfully.");
          return;
        }
        $.Zebra_Dialog("Error in processing the request. Please try again.");
      }

      function catchError(res) {
        $scope.processing = false;
        $.Zebra_Dialog("Error in processing the request. Please try again.");
      }
    }
  }
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwclBsYW5zL3ByUGxhbnMuanMiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdwclBsYW5zJywge1xyXG4gICAgdXJsOiAnL3ByUGxhbnMnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9wclBsYW5zL3ByUGxhbnMuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAncHJQbGFuc0NvbnRyb2xsZXInXHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ3ByUGxhbnNDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCBQclBsYW5TZXJ2aWNlKSB7XHJcbiAgJHNjb3BlLnByUGxhbnMgPSB7fTtcclxuICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICRzY29wZS5vcGVuU29jaWFsRGlhbG9nID0gZnVuY3Rpb24odHlwZSkge1xyXG4gICAgdmFyIGRpc3BsYXlUZXh0ID0gXCJcIjtcclxuICAgIGlmICh0eXBlID09ICdZb3V0dWJlJylcclxuICAgICAgZGlzcGxheVRleHQgPSBcIkxpa2UgU291bmRDbG91ZCwgd2UgcHJlbWllcmUgdHJhY2tzIHRvIGdlbnJlLXNwZWNpZmljICBhdWRpZW5jZXMuIFdlIHdvcmsgY2xvc2VseSB3aXRoIGFuIGFycmF5IG9mIHdlbGwtZXN0YWJsaXNoZWQgWW91VHViZSBjaGFubmVscyBmb3IgcHJlbWllcmVzLiBBcHByb2FjaGVzIHRvIHByb21vdGlvbiB2YXJ5IGFjcm9zcyBkaWZmZXJlbnQgc29jaWFsIG1lZGlhIHBsYXRmb3JtcyBhbmQgcmVxdWlyZXMgYSBudWFuY2VkIHVuZGVyc3RhbmRpbmcgb2YgZWFjaC5cIjtcclxuICAgIGlmICh0eXBlID09ICdCbG9nIE91dHJlYWNoJylcclxuICAgICAgZGlzcGxheVRleHQgPSBcIldoZW4gcmVsZWFzaW5nIGEgc29uZywgaXQgaXMgaW1wb3J0YW50IHRvIGtlZXAgaW4gbWluZCAgdGhlIG1hbm5lciBpbiB3aGljaCAgYmxvZ3MgY2FuIGFmZmVjdCBvbmUncyByZWFjaC4gVGhlIGJsb2dzIHdlIHdvcmsgd2l0aCBjdXJhdGUgbXVzaWMgd2l0aCBhIHNwZWNpZmljIGF1ZGllbmNlIGluIG1pbmQsIHRlbmRpbmcgdG8gYmUgY29tbWl0dGVkIHJlYWRlcnMuIFdlIGhhdmUgY3VsdGl2YXRlZCByZWxhdGlvbnNoaXBzIHdpdGggdGhlIGZhY2VzIGJlaGluZCB2YXJpb3VzIGJsb2dzLCBhbmQgd2UgYXJlIGZvcnR1bmF0ZSB0byBoYXZlIHRoZWlyIGNvbnRpbnVlZCBzdXBwb3J0IG9mIG91ciBjb250ZW50LlwiO1xyXG4gICAgaWYgKHR5cGUgPT0gJ1Nwb3RpZnknKVxyXG4gICAgICBkaXNwbGF5VGV4dCA9ICdUaGUgdGhpcmQgYW5kIGZpbmFsIHBsYXRmb3JtIGluIHdoaWNoIHdlIGNhbiBhc3Npc3Qgd2l0aCByZWxlYXNpbmcgbXVzaWMgaXMgU3BvdGlmeS4gU3BvdGlmeSBpcyBhbiBvbmxpbmUgbXVzaWMgcGxhdGZvcm0gd2hpY2ggcGF5cyBhcnRpc3QgcGVyIHN0cmVhbS4gU3BvdGlmeSBhdCB0aGUgY29yZSBpcyBhbHNvIGEgc3Vic3RhbnRpYWwgd2F5IGZvciBhcnRpc3RzIHRvIGJlIGhlYXJkLiBUaGVyZSBhcmUgb3ZlciAxMDAgTWlsbGlvbiB1c2VycyB3b3JsZHdpZGUgIGFuZCBhcyBvbmUgb2YgdGhlIG1ham9yIG9ubGluZSBtdXNpYyBwbGF0Zm9ybXMsIHdlIHdpbGwgZG8gb3VyIGJlc3QgdG8gZ2V0IHlvdXIgdHJhY2sgaW4gYXMgbWFueSBwbGF5bGlzdHMgYXMgcG9zc2libGUuJztcclxuICAgIGlmICh0eXBlID09ICdTb3VuZGNsb3VkJylcclxuICAgICAgZGlzcGxheVRleHQgPSBcIldlIGZhY2lsaXRhdGUgcHJlbWllcmVzIG92ZXIgb3VyIG5ldHdvcmsgb2Ygb3ZlciBzaXggU291bmRDbG91ZCBjaGFubmVscywgd29ya2luZyBjbG9zZWx5IHdpdGggZXZlcnkgYXJ0aXN0IHRvIGVuc3VyZSB0aGF0IHRoZSBuZXR3b3JrIGdlbnJlIG1hdGNoZXMgdGhlIGZlZWwgb2YgdGhlaXIgdHJhY2suIFRob3VnaCB3ZSBoYXZlIGhhZCBiZXR0ZXIgcmVzdWx0cyBwcmVtaWVyaW5nIGNvbnRlbnQgZnJvbSBvdXIgdmFyaW91cyBuZXR3b3JrIHBhZ2VzLCB3ZSBhcmUgYWxzbyBhYmxlIHRvIGFsc28gbWFrZSB0aGUgdHJhY2sgYXZhaWxhYmxlIG9uIHRoZSBhcnRpc3QncyBwZXJzb25hbCBwcm9maWxlIGFuZCBwcm9tb3RlIHRoZSB0cmFjayBmcm9tIHRoZXJlLiBXZSByZW1haW4gZmxleGlibGUgd2l0aCBtYW55IG9mIHRoZXNlIGFzcGVjdHMgYW5kIHRhaWxvciBlYWNoIGNhbXBhaWduIHRvIHRoZSByZXNwZWN0aXZlIGdvYWxzIG9mIHRoZSBhcnRpc3QuXCI7XHJcblxyXG4gICAgJC5aZWJyYV9EaWFsb2coZGlzcGxheVRleHQsIHtcclxuICAgICAgd2lkdGg6IDYwMFxyXG4gICAgfSk7XHJcbiAgfVxyXG4gICRzY29wZS5zYXZlUHJQbGFuID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoISRzY29wZS5wclBsYW5zLmZpbGUgfHwgISRzY29wZS5wclBsYW5zLmVtYWlsIHx8ICEkc2NvcGUucHJQbGFucy5uYW1lIHx8ICEkc2NvcGUucHJQbGFucy5idWRnZXQpIHtcclxuICAgICAgJC5aZWJyYV9EaWFsb2coXCJQbGVhc2UgZmlsbCBpbiBhbGwgZmllbGRzXCIpXHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICRzY29wZS5tZXNzYWdlLnZpc2libGUgPSBmYWxzZTtcclxuICAgICAgdmFyIGRhdGEgPSBuZXcgRm9ybURhdGEoKTtcclxuICAgICAgZm9yICh2YXIgcHJvcCBpbiAkc2NvcGUucHJQbGFucykge1xyXG4gICAgICAgIGRhdGEuYXBwZW5kKHByb3AsICRzY29wZS5wclBsYW5zW3Byb3BdKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgUHJQbGFuU2VydmljZVxyXG4gICAgICAgIC5zYXZlUHJQbGFuKGRhdGEpXHJcbiAgICAgICAgLnRoZW4ocmVjZWl2ZVJlc3BvbnNlKVxyXG4gICAgICAgIC5jYXRjaChjYXRjaEVycm9yKTtcclxuXHJcbiAgICAgIGZ1bmN0aW9uIHJlY2VpdmVSZXNwb25zZShyZXMpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIGlmIChyZXMuc3RhdHVzID09PSAyMDApIHtcclxuICAgICAgICAgICRzY29wZS5wclBsYW5zID0ge307XHJcbiAgICAgICAgICBhbmd1bGFyLmVsZW1lbnQoXCJpbnB1dFt0eXBlPSdmaWxlJ11cIikudmFsKG51bGwpO1xyXG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJUaGFuayB5b3UhIFlvdXIgcmVxdWVzdCBoYXMgYmVlbiBzdWJtaXR0ZWQgc3VjY2Vzc2Z1bGx5LlwiKTtcclxuICAgICAgICAgIHJldHVybjtcclxuICAgICAgICB9XHJcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJFcnJvciBpbiBwcm9jZXNzaW5nIHRoZSByZXF1ZXN0LiBQbGVhc2UgdHJ5IGFnYWluLlwiKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gY2F0Y2hFcnJvcihyZXMpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICQuWmVicmFfRGlhbG9nKFwiRXJyb3IgaW4gcHJvY2Vzc2luZyB0aGUgcmVxdWVzdC4gUGxlYXNlIHRyeSBhZ2Fpbi5cIik7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0pOyJdLCJmaWxlIjoicHJQbGFucy9wclBsYW5zLmpzIn0=
