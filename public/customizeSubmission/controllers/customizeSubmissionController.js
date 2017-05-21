app.config(function($stateProvider) {
  $stateProvider.state('customizesubmission', {
    url: '/admin/customizesubmission',
    templateUrl: 'js/customizeSubmission/views/customizeSubmission.html',
    controller: 'CustomizeSubmissionController'
  })
});

app.controller('CustomizeSubmissionController', function($rootScope, $state, $scope, $http, AuthService, SessionService, $sce, customizeService) {
  if (!SessionService.getUser()) {
    $state.go('admin');
  }
  $scope.user = SessionService.getUser();
  $scope.submission = {};
  $scope.genreArray = [
    'Alternative Rock',
    'Ambient',
    'Creative',
    'Chill',
    'Classical',
    'Country',
    'Dance & EDM',
    'Dancehall',
    'Deep House',
    'Disco',
    'Drum & Bass',
    'Dubstep',
    'Electronic',
    'Festival',
    'Folk',
    'Hip-Hop/RNB',
    'House',
    'Indie/Alternative',
    'Latin',
    'Trap',
    'Vocalists/Singer-Songwriter'
  ];

  $scope.saveSettings = function() {
    $scope.processing = true;
    //customizeService.uploadFile($scope.backImage.file).then(function(res){
    //var backImage=res.Location;
    //$scope.postData.backgroundimage=backImage;
    $scope.postData.userID = $scope.user._id;
    var subHeadingText = ($scope.postData.subHeading.text ? $scope.postData.subHeading.text.replace(/\r?\n/g, '<br />') : '');
    $scope.postData.subHeading.text = subHeadingText;
    customizeService.addCustomize($scope.postData)
      .then(function(response) {
        $scope.processing = false;
      }).catch(function(error) {
        console.log("er", error);
      });
    //}) 
  }

  $scope.getCustomizeSettings = function() {
    customizeService.getCustomPageSettings($scope.user._id)
      .then(function(response) {
        if (response) {
          $scope.postData = response;
          $scope.customizeSettings = response;
        } else {
          $scope.postData = {
            heading: {
              text: "Submission for Promotion",
              style: {
                fontSize: 21,
                fontColor: '#999',
                fontWeight: 'Bold'
              }
            },
            subHeading: {
              text: "Our mission is to simply bring the best music to the people. We also have a strong commitment to providing feedback and guidance for rising artists. We guarantee that your song will be listened to and critiqued by our dedicated staff if it passes our submission process. Although we cannot guarantee support for your submission on our promotional platforms such as SoundCloud, YouTube, and Facebook, we will make sure to get back to you with a response.",
              style: {
                fontSize: 16,
                fontColor: '#7d5a5a',
                fontWeight: 'Normal'
              }
            },
            inputFields: {
              style: {
                border: 1,
                borderRadius: 4,
                borderColor: '#F5D3B5',
              }
            },
            button: {
              text: 'Enter',
              style: {
                fontSize: 15,
                fontColor: '#fff',
                border: 1,
                borderRadius: 4,
                bgColor: '#F5BBBC'
              }
            }
          };
        }
      });
  }
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjdXN0b21pemVTdWJtaXNzaW9uL2NvbnRyb2xsZXJzL2N1c3RvbWl6ZVN1Ym1pc3Npb25Db250cm9sbGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnY3VzdG9taXplc3VibWlzc2lvbicsIHtcclxuICAgIHVybDogJy9hZG1pbi9jdXN0b21pemVzdWJtaXNzaW9uJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvY3VzdG9taXplU3VibWlzc2lvbi92aWV3cy9jdXN0b21pemVTdWJtaXNzaW9uLmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ0N1c3RvbWl6ZVN1Ym1pc3Npb25Db250cm9sbGVyJ1xyXG4gIH0pXHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ0N1c3RvbWl6ZVN1Ym1pc3Npb25Db250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCBBdXRoU2VydmljZSwgU2Vzc2lvblNlcnZpY2UsICRzY2UsIGN1c3RvbWl6ZVNlcnZpY2UpIHtcclxuICBpZiAoIVNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKSkge1xyXG4gICAgJHN0YXRlLmdvKCdhZG1pbicpO1xyXG4gIH1cclxuICAkc2NvcGUudXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcclxuICAkc2NvcGUuc3VibWlzc2lvbiA9IHt9O1xyXG4gICRzY29wZS5nZW5yZUFycmF5ID0gW1xyXG4gICAgJ0FsdGVybmF0aXZlIFJvY2snLFxyXG4gICAgJ0FtYmllbnQnLFxyXG4gICAgJ0NyZWF0aXZlJyxcclxuICAgICdDaGlsbCcsXHJcbiAgICAnQ2xhc3NpY2FsJyxcclxuICAgICdDb3VudHJ5JyxcclxuICAgICdEYW5jZSAmIEVETScsXHJcbiAgICAnRGFuY2VoYWxsJyxcclxuICAgICdEZWVwIEhvdXNlJyxcclxuICAgICdEaXNjbycsXHJcbiAgICAnRHJ1bSAmIEJhc3MnLFxyXG4gICAgJ0R1YnN0ZXAnLFxyXG4gICAgJ0VsZWN0cm9uaWMnLFxyXG4gICAgJ0Zlc3RpdmFsJyxcclxuICAgICdGb2xrJyxcclxuICAgICdIaXAtSG9wL1JOQicsXHJcbiAgICAnSG91c2UnLFxyXG4gICAgJ0luZGllL0FsdGVybmF0aXZlJyxcclxuICAgICdMYXRpbicsXHJcbiAgICAnVHJhcCcsXHJcbiAgICAnVm9jYWxpc3RzL1Npbmdlci1Tb25nd3JpdGVyJ1xyXG4gIF07XHJcblxyXG4gICRzY29wZS5zYXZlU2V0dGluZ3MgPSBmdW5jdGlvbigpIHtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgIC8vY3VzdG9taXplU2VydmljZS51cGxvYWRGaWxlKCRzY29wZS5iYWNrSW1hZ2UuZmlsZSkudGhlbihmdW5jdGlvbihyZXMpe1xyXG4gICAgLy92YXIgYmFja0ltYWdlPXJlcy5Mb2NhdGlvbjtcclxuICAgIC8vJHNjb3BlLnBvc3REYXRhLmJhY2tncm91bmRpbWFnZT1iYWNrSW1hZ2U7XHJcbiAgICAkc2NvcGUucG9zdERhdGEudXNlcklEID0gJHNjb3BlLnVzZXIuX2lkO1xyXG4gICAgdmFyIHN1YkhlYWRpbmdUZXh0ID0gKCRzY29wZS5wb3N0RGF0YS5zdWJIZWFkaW5nLnRleHQgPyAkc2NvcGUucG9zdERhdGEuc3ViSGVhZGluZy50ZXh0LnJlcGxhY2UoL1xccj9cXG4vZywgJzxiciAvPicpIDogJycpO1xyXG4gICAgJHNjb3BlLnBvc3REYXRhLnN1YkhlYWRpbmcudGV4dCA9IHN1YkhlYWRpbmdUZXh0O1xyXG4gICAgY3VzdG9taXplU2VydmljZS5hZGRDdXN0b21pemUoJHNjb3BlLnBvc3REYXRhKVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uKGVycm9yKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coXCJlclwiLCBlcnJvcik7XHJcbiAgICAgIH0pO1xyXG4gICAgLy99KSBcclxuICB9XHJcblxyXG4gICRzY29wZS5nZXRDdXN0b21pemVTZXR0aW5ncyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgY3VzdG9taXplU2VydmljZS5nZXRDdXN0b21QYWdlU2V0dGluZ3MoJHNjb3BlLnVzZXIuX2lkKVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXNwb25zZSkge1xyXG4gICAgICAgIGlmIChyZXNwb25zZSkge1xyXG4gICAgICAgICAgJHNjb3BlLnBvc3REYXRhID0gcmVzcG9uc2U7XHJcbiAgICAgICAgICAkc2NvcGUuY3VzdG9taXplU2V0dGluZ3MgPSByZXNwb25zZTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgJHNjb3BlLnBvc3REYXRhID0ge1xyXG4gICAgICAgICAgICBoZWFkaW5nOiB7XHJcbiAgICAgICAgICAgICAgdGV4dDogXCJTdWJtaXNzaW9uIGZvciBQcm9tb3Rpb25cIixcclxuICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgZm9udFNpemU6IDIxLFxyXG4gICAgICAgICAgICAgICAgZm9udENvbG9yOiAnIzk5OScsXHJcbiAgICAgICAgICAgICAgICBmb250V2VpZ2h0OiAnQm9sZCdcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0sXHJcbiAgICAgICAgICAgIHN1YkhlYWRpbmc6IHtcclxuICAgICAgICAgICAgICB0ZXh0OiBcIk91ciBtaXNzaW9uIGlzIHRvIHNpbXBseSBicmluZyB0aGUgYmVzdCBtdXNpYyB0byB0aGUgcGVvcGxlLiBXZSBhbHNvIGhhdmUgYSBzdHJvbmcgY29tbWl0bWVudCB0byBwcm92aWRpbmcgZmVlZGJhY2sgYW5kIGd1aWRhbmNlIGZvciByaXNpbmcgYXJ0aXN0cy4gV2UgZ3VhcmFudGVlIHRoYXQgeW91ciBzb25nIHdpbGwgYmUgbGlzdGVuZWQgdG8gYW5kIGNyaXRpcXVlZCBieSBvdXIgZGVkaWNhdGVkIHN0YWZmIGlmIGl0IHBhc3NlcyBvdXIgc3VibWlzc2lvbiBwcm9jZXNzLiBBbHRob3VnaCB3ZSBjYW5ub3QgZ3VhcmFudGVlIHN1cHBvcnQgZm9yIHlvdXIgc3VibWlzc2lvbiBvbiBvdXIgcHJvbW90aW9uYWwgcGxhdGZvcm1zIHN1Y2ggYXMgU291bmRDbG91ZCwgWW91VHViZSwgYW5kIEZhY2Vib29rLCB3ZSB3aWxsIG1ha2Ugc3VyZSB0byBnZXQgYmFjayB0byB5b3Ugd2l0aCBhIHJlc3BvbnNlLlwiLFxyXG4gICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBmb250U2l6ZTogMTYsXHJcbiAgICAgICAgICAgICAgICBmb250Q29sb3I6ICcjN2Q1YTVhJyxcclxuICAgICAgICAgICAgICAgIGZvbnRXZWlnaHQ6ICdOb3JtYWwnXHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICBpbnB1dEZpZWxkczoge1xyXG4gICAgICAgICAgICAgIHN0eWxlOiB7XHJcbiAgICAgICAgICAgICAgICBib3JkZXI6IDEsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IDQsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJDb2xvcjogJyNGNUQzQjUnLFxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgYnV0dG9uOiB7XHJcbiAgICAgICAgICAgICAgdGV4dDogJ0VudGVyJyxcclxuICAgICAgICAgICAgICBzdHlsZToge1xyXG4gICAgICAgICAgICAgICAgZm9udFNpemU6IDE1LFxyXG4gICAgICAgICAgICAgICAgZm9udENvbG9yOiAnI2ZmZicsXHJcbiAgICAgICAgICAgICAgICBib3JkZXI6IDEsXHJcbiAgICAgICAgICAgICAgICBib3JkZXJSYWRpdXM6IDQsXHJcbiAgICAgICAgICAgICAgICBiZ0NvbG9yOiAnI0Y1QkJCQydcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH07XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICB9XHJcbn0pO1xyXG4iXSwiZmlsZSI6ImN1c3RvbWl6ZVN1Ym1pc3Npb24vY29udHJvbGxlcnMvY3VzdG9taXplU3VibWlzc2lvbkNvbnRyb2xsZXIuanMifQ==
