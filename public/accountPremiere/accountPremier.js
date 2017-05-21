app.config(function($stateProvider) {
  $stateProvider.state('custompremier', {
    url: '/:username/premiere',
    templateUrl: 'js/accountPremiere/accountPremier.view.html',
    controller: 'AccountPremierController',
    resolve: {
      userID: function($stateParams, $http, $window) {
        var username = $stateParams.username;
        return $http.get('/api/users/getUserByURL/' + username + '/premiere')
          .then(function(res) {
            return {
              userid: res.data,
              username: username,
              submitpart: 'premiere'
            };
          })
          .then(null, function(err) {
            $.Zebra_Dialog("error getting your events");
            return;
          })
      },
      customizeSettings: function($http, customizeService, userID) {
        if (userID.userid == "nouser") {
          $location.path("/" + userID.username + "/" + userID.submitpart);
        }
        return customizeService.getCustomPageSettings(userID.userid, userID.submitpart)
          .then(function(response) {
            return response;
          })
          .then(null, function(err) {
            $.Zebra_Dialog("error getting your customize settings");
            return;
          })
      }
    }
  });
});

app.controller('AccountPremierController', function($rootScope, $state, $scope, userID, customizeSettings, $http, customizeService, $location, PremierService) {
  $scope.premierObj = {};
  $scope.customizeSettings = customizeSettings;
  $scope.message = {
    val: '',
    visible: false
  };
  $scope.processing = false;
  $scope.savePremier = function() {
    if (!$scope.premierObj.trackLink && !$scope.premierObj.file) {
      $.Zebra_Dialog("Please upload an mp3 file of provide a link.");
    } else {
      $http.post('/api/soundcloud/resolve', {
        url: $scope.premierObj.trackLink
      }).then(function(res) {
        $.Zebra_Dialog('We can not premiere this track because you have already released it. Please submit the track for repost instead!', {
          'buttons': [{
            caption: 'Close',
            callback: function() {}
          }, {
            caption: 'Submit for Repost',
            callback: function() {
              window.location.href = window.location.origin + "/" + userID.username + "/submit";
            }
          }]
        })
      }).then(null, function(err) {
        $scope.processing = true;
        $scope.message.visible = false;
        var data = new FormData();
        for (var prop in $scope.premierObj) {
          data.append(prop, $scope.premierObj[prop]);
        }
        data.append("userID", userID.userid);
        PremierService
          .savePremier(data)
          .then(receiveResponse)
          .catch(catchError);

        function receiveResponse(res) {
          $scope.processing = false;
          if (res.status === 200) {
            $scope.premierObj = {};
            angular.element("input[type='file']").val(null);
            $.Zebra_Dialog('Thank you! Your message has been sent successfully.')
          } else {
            $.Zebra_Dialog('Error processing. Please try again.')
          }
        }

        function catchError(res) {
          $scope.processing = false;
          $.Zebra_Dialog('Error processing. Please try again.')
        }
      })
    };
  };
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhY2NvdW50UHJlbWllcmUvYWNjb3VudFByZW1pZXIuanMiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcikge1xyXG4gICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdjdXN0b21wcmVtaWVyJywge1xyXG4gICAgdXJsOiAnLzp1c2VybmFtZS9wcmVtaWVyZScsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL2FjY291bnRQcmVtaWVyZS9hY2NvdW50UHJlbWllci52aWV3Lmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ0FjY291bnRQcmVtaWVyQ29udHJvbGxlcicsXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIHVzZXJJRDogZnVuY3Rpb24oJHN0YXRlUGFyYW1zLCAkaHR0cCwgJHdpbmRvdykge1xyXG4gICAgICAgIHZhciB1c2VybmFtZSA9ICRzdGF0ZVBhcmFtcy51c2VybmFtZTtcclxuICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL3VzZXJzL2dldFVzZXJCeVVSTC8nICsgdXNlcm5hbWUgKyAnL3ByZW1pZXJlJylcclxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgICAgIHVzZXJpZDogcmVzLmRhdGEsXHJcbiAgICAgICAgICAgICAgdXNlcm5hbWU6IHVzZXJuYW1lLFxyXG4gICAgICAgICAgICAgIHN1Ym1pdHBhcnQ6ICdwcmVtaWVyZSdcclxuICAgICAgICAgICAgfTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJlcnJvciBnZXR0aW5nIHlvdXIgZXZlbnRzXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9KVxyXG4gICAgICB9LFxyXG4gICAgICBjdXN0b21pemVTZXR0aW5nczogZnVuY3Rpb24oJGh0dHAsIGN1c3RvbWl6ZVNlcnZpY2UsIHVzZXJJRCkge1xyXG4gICAgICAgIGlmICh1c2VySUQudXNlcmlkID09IFwibm91c2VyXCIpIHtcclxuICAgICAgICAgICRsb2NhdGlvbi5wYXRoKFwiL1wiICsgdXNlcklELnVzZXJuYW1lICsgXCIvXCIgKyB1c2VySUQuc3VibWl0cGFydCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBjdXN0b21pemVTZXJ2aWNlLmdldEN1c3RvbVBhZ2VTZXR0aW5ncyh1c2VySUQudXNlcmlkLCB1c2VySUQuc3VibWl0cGFydClcclxuICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiByZXNwb25zZTtcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJlcnJvciBnZXR0aW5nIHlvdXIgY3VzdG9taXplIHNldHRpbmdzXCIpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ0FjY291bnRQcmVtaWVyQ29udHJvbGxlcicsIGZ1bmN0aW9uKCRyb290U2NvcGUsICRzdGF0ZSwgJHNjb3BlLCB1c2VySUQsIGN1c3RvbWl6ZVNldHRpbmdzLCAkaHR0cCwgY3VzdG9taXplU2VydmljZSwgJGxvY2F0aW9uLCBQcmVtaWVyU2VydmljZSkge1xyXG4gICRzY29wZS5wcmVtaWVyT2JqID0ge307XHJcbiAgJHNjb3BlLmN1c3RvbWl6ZVNldHRpbmdzID0gY3VzdG9taXplU2V0dGluZ3M7XHJcbiAgJHNjb3BlLm1lc3NhZ2UgPSB7XHJcbiAgICB2YWw6ICcnLFxyXG4gICAgdmlzaWJsZTogZmFsc2VcclxuICB9O1xyXG4gICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgJHNjb3BlLnNhdmVQcmVtaWVyID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoISRzY29wZS5wcmVtaWVyT2JqLnRyYWNrTGluayAmJiAhJHNjb3BlLnByZW1pZXJPYmouZmlsZSkge1xyXG4gICAgICAkLlplYnJhX0RpYWxvZyhcIlBsZWFzZSB1cGxvYWQgYW4gbXAzIGZpbGUgb2YgcHJvdmlkZSBhIGxpbmsuXCIpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJGh0dHAucG9zdCgnL2FwaS9zb3VuZGNsb3VkL3Jlc29sdmUnLCB7XHJcbiAgICAgICAgdXJsOiAkc2NvcGUucHJlbWllck9iai50cmFja0xpbmtcclxuICAgICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAkLlplYnJhX0RpYWxvZygnV2UgY2FuIG5vdCBwcmVtaWVyZSB0aGlzIHRyYWNrIGJlY2F1c2UgeW91IGhhdmUgYWxyZWFkeSByZWxlYXNlZCBpdC4gUGxlYXNlIHN1Ym1pdCB0aGUgdHJhY2sgZm9yIHJlcG9zdCBpbnN0ZWFkIScsIHtcclxuICAgICAgICAgICdidXR0b25zJzogW3tcclxuICAgICAgICAgICAgY2FwdGlvbjogJ0Nsb3NlJyxcclxuICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKCkge31cclxuICAgICAgICAgIH0sIHtcclxuICAgICAgICAgICAgY2FwdGlvbjogJ1N1Ym1pdCBmb3IgUmVwb3N0JyxcclxuICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gd2luZG93LmxvY2F0aW9uLm9yaWdpbiArIFwiL1wiICsgdXNlcklELnVzZXJuYW1lICsgXCIvc3VibWl0XCI7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1dXHJcbiAgICAgICAgfSlcclxuICAgICAgfSkudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgJHNjb3BlLm1lc3NhZ2UudmlzaWJsZSA9IGZhbHNlO1xyXG4gICAgICAgIHZhciBkYXRhID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICAgICAgZm9yICh2YXIgcHJvcCBpbiAkc2NvcGUucHJlbWllck9iaikge1xyXG4gICAgICAgICAgZGF0YS5hcHBlbmQocHJvcCwgJHNjb3BlLnByZW1pZXJPYmpbcHJvcF0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkYXRhLmFwcGVuZChcInVzZXJJRFwiLCB1c2VySUQudXNlcmlkKTtcclxuICAgICAgICBQcmVtaWVyU2VydmljZVxyXG4gICAgICAgICAgLnNhdmVQcmVtaWVyKGRhdGEpXHJcbiAgICAgICAgICAudGhlbihyZWNlaXZlUmVzcG9uc2UpXHJcbiAgICAgICAgICAuY2F0Y2goY2F0Y2hFcnJvcik7XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIHJlY2VpdmVSZXNwb25zZShyZXMpIHtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICBpZiAocmVzLnN0YXR1cyA9PT0gMjAwKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5wcmVtaWVyT2JqID0ge307XHJcbiAgICAgICAgICAgIGFuZ3VsYXIuZWxlbWVudChcImlucHV0W3R5cGU9J2ZpbGUnXVwiKS52YWwobnVsbCk7XHJcbiAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKCdUaGFuayB5b3UhIFlvdXIgbWVzc2FnZSBoYXMgYmVlbiBzZW50IHN1Y2Nlc3NmdWxseS4nKVxyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coJ0Vycm9yIHByb2Nlc3NpbmcuIFBsZWFzZSB0cnkgYWdhaW4uJylcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGZ1bmN0aW9uIGNhdGNoRXJyb3IocmVzKSB7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coJ0Vycm9yIHByb2Nlc3NpbmcuIFBsZWFzZSB0cnkgYWdhaW4uJylcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICB9O1xyXG4gIH07XHJcbn0pOyJdLCJmaWxlIjoiYWNjb3VudFByZW1pZXJlL2FjY291bnRQcmVtaWVyLmpzIn0=
