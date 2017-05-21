app.directive('scsearch', function($http) {
  return {
    templateUrl: 'js/common/directives/scsearch/scsearch.html',
    restrict: 'E',
    scope: {
      kind: '@',
      returnitem: '&',
      customstyle: '@'
    },
    controller: ['$scope', function scSearchController($scope) {
      $scope.searchSelection = [];
      $scope.searchString = "";
      $scope.sendSearch = function() {
        $scope.searchSelection = [];
        $scope.searchError = undefined;
        $scope.searching = true;
        if ($scope.searchString != "") {
          $http.post('/api/search', {
            q: $scope.searchString,
            kind: $scope.kind
          }).then(function(res) {
            $scope.searching = false;
            var item = res.data.item;
            if (item) {
              if (item.title == '--unknown--') {
                $scope.showSearchPlayer = true;
                var searchWidget = SC.Widget('searchPlayer');
                searchWidget.load($scope.searchString, {
                  auto_play: false,
                  show_artwork: false,
                  callback: function() {
                    searchWidget.getCurrentSound(function(item) {
                      $scope.showSearchPlayer = false;
                      if (!item || item.kind != $scope.kind) {
                        $scope.searchError = "Please enter a " + $scope.kind + " Url.";
                      } else {
                        $scope.setItemText(item);
                        $scope.selectedItem(item);
                      }
                      $scope.$digest();
                    })
                  }
                });
              } else {
                if (item.kind != $scope.kind) {
                  $scope.searchError = "Please enter a " + $scope.kind + " Url.";
                } else {
                  $scope.setItemText(item);
                  $scope.selectedItem(item);
                }
              }
            } else {
              if (res.data.collection.length > 0) {
                $scope.searchSelection = res.data.collection;
                $scope.searchSelection.forEach(function(item) {
                  $scope.setItemText(item);
                })
              } else {
                $scope.searchError = "We could not find a " + $scope.kind + "."
              }
            }
            if ($scope.searching || $scope.searchError != "" || $scope.searchSelection.length > 0) {
              window.onclick = function(event) {
                $scope.searching = false;
                $scope.searchError = "";
                $scope.searchSelection = [];
                $scope.$apply();
              };
            }
          }).then(null, function(err) {
            console.log(err);
            $scope.searching = false;
            console.log('We could not find a ' + $scope.kind);
            $scope.searchError = "We could not find a " + $scope.kind + "."
            if ($scope.searching || $scope.searchError != "" || $scope.searchSelection.length > 0) {
              window.onclick = function(event) {
                $scope.searching = false;
                $scope.searchError = "";
                $scope.searchSelection = [];
                $scope.$apply();
              };
            }
          });
        }
      }

      $scope.directSearch = function() {
        if ($scope.searchString.indexOf('soundcloud.com') > -1) {
          $scope.sendSearch();
        }
      }

      $scope.setItemText = function(item) {
        switch (item.kind) {
          case 'track':
            item.displayName = item.title + ' - ' + item.user.username;
            item.header = item.title;
            item.subheader = item.user.username;
            break;
          case 'playlist':
            item.displayName = item.title + ' - ' + item.user.username;
            item.header = item.title;
            item.subheader = item.user.username;
            break;
          case 'user':
            item.displayName = item.username + ' - ' + item.followers_count + " followers";
            item.header = item.username;
            item.subheader = item.followers_count + " followers";
            break;
        }
      }

      $scope.selectedItem = function(item) {
        $scope.searchSelection = [];
        $scope.searchError = undefined;
        $scope.searchString = item.displayName;
        $scope.searching = false;
        $scope.returnitem({
          item: item
        });
      }

      $scope.keypress = function(keyEvent) {
        if (keyEvent.which === 13) {
          $scope.sendSearch();
          keyEvent.stopPropagation();
          keyEvent.preventDefault();
        }
      }

    }]
  }
}).filter('capitalize', function() {
  return function(input) {
    return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
  }
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24vZGlyZWN0aXZlcy9zY3NlYXJjaC9zY3NlYXJjaC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHAuZGlyZWN0aXZlKCdzY3NlYXJjaCcsIGZ1bmN0aW9uKCRodHRwKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvc2NzZWFyY2gvc2NzZWFyY2guaHRtbCcsXHJcbiAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgc2NvcGU6IHtcclxuICAgICAga2luZDogJ0AnLFxyXG4gICAgICByZXR1cm5pdGVtOiAnJicsXHJcbiAgICAgIGN1c3RvbXN0eWxlOiAnQCdcclxuICAgIH0sXHJcbiAgICBjb250cm9sbGVyOiBbJyRzY29wZScsIGZ1bmN0aW9uIHNjU2VhcmNoQ29udHJvbGxlcigkc2NvcGUpIHtcclxuICAgICAgJHNjb3BlLnNlYXJjaFNlbGVjdGlvbiA9IFtdO1xyXG4gICAgICAkc2NvcGUuc2VhcmNoU3RyaW5nID0gXCJcIjtcclxuICAgICAgJHNjb3BlLnNlbmRTZWFyY2ggPSBmdW5jdGlvbigpIHtcclxuICAgICAgICAkc2NvcGUuc2VhcmNoU2VsZWN0aW9uID0gW107XHJcbiAgICAgICAgJHNjb3BlLnNlYXJjaEVycm9yID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICRzY29wZS5zZWFyY2hpbmcgPSB0cnVlO1xyXG4gICAgICAgIGlmICgkc2NvcGUuc2VhcmNoU3RyaW5nICE9IFwiXCIpIHtcclxuICAgICAgICAgICRodHRwLnBvc3QoJy9hcGkvc2VhcmNoJywge1xyXG4gICAgICAgICAgICBxOiAkc2NvcGUuc2VhcmNoU3RyaW5nLFxyXG4gICAgICAgICAgICBraW5kOiAkc2NvcGUua2luZFxyXG4gICAgICAgICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgJHNjb3BlLnNlYXJjaGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB2YXIgaXRlbSA9IHJlcy5kYXRhLml0ZW07XHJcbiAgICAgICAgICAgIGlmIChpdGVtKSB7XHJcbiAgICAgICAgICAgICAgaWYgKGl0ZW0udGl0bGUgPT0gJy0tdW5rbm93bi0tJykge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnNob3dTZWFyY2hQbGF5ZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgdmFyIHNlYXJjaFdpZGdldCA9IFNDLldpZGdldCgnc2VhcmNoUGxheWVyJyk7XHJcbiAgICAgICAgICAgICAgICBzZWFyY2hXaWRnZXQubG9hZCgkc2NvcGUuc2VhcmNoU3RyaW5nLCB7XHJcbiAgICAgICAgICAgICAgICAgIGF1dG9fcGxheTogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgIHNob3dfYXJ0d29yazogZmFsc2UsXHJcbiAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICBzZWFyY2hXaWRnZXQuZ2V0Q3VycmVudFNvdW5kKGZ1bmN0aW9uKGl0ZW0pIHtcclxuICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93U2VhcmNoUGxheWVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICAgICAgICBpZiAoIWl0ZW0gfHwgaXRlbS5raW5kICE9ICRzY29wZS5raW5kKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zZWFyY2hFcnJvciA9IFwiUGxlYXNlIGVudGVyIGEgXCIgKyAkc2NvcGUua2luZCArIFwiIFVybC5cIjtcclxuICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zZXRJdGVtVGV4dChpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnNlbGVjdGVkSXRlbShpdGVtKTtcclxuICAgICAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgICAgICAgICRzY29wZS4kZGlnZXN0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgIGlmIChpdGVtLmtpbmQgIT0gJHNjb3BlLmtpbmQpIHtcclxuICAgICAgICAgICAgICAgICAgJHNjb3BlLnNlYXJjaEVycm9yID0gXCJQbGVhc2UgZW50ZXIgYSBcIiArICRzY29wZS5raW5kICsgXCIgVXJsLlwiO1xyXG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICAgJHNjb3BlLnNldEl0ZW1UZXh0KGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgICAkc2NvcGUuc2VsZWN0ZWRJdGVtKGl0ZW0pO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICBpZiAocmVzLmRhdGEuY29sbGVjdGlvbi5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUuc2VhcmNoU2VsZWN0aW9uID0gcmVzLmRhdGEuY29sbGVjdGlvbjtcclxuICAgICAgICAgICAgICAgICRzY29wZS5zZWFyY2hTZWxlY3Rpb24uZm9yRWFjaChmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgICAgICAgICAgICRzY29wZS5zZXRJdGVtVGV4dChpdGVtKTtcclxuICAgICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5zZWFyY2hFcnJvciA9IFwiV2UgY291bGQgbm90IGZpbmQgYSBcIiArICRzY29wZS5raW5kICsgXCIuXCJcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgaWYgKCRzY29wZS5zZWFyY2hpbmcgfHwgJHNjb3BlLnNlYXJjaEVycm9yICE9IFwiXCIgfHwgJHNjb3BlLnNlYXJjaFNlbGVjdGlvbi5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgd2luZG93Lm9uY2xpY2sgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnNlYXJjaGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnNlYXJjaEVycm9yID0gXCJcIjtcclxuICAgICAgICAgICAgICAgICRzY29wZS5zZWFyY2hTZWxlY3Rpb24gPSBbXTtcclxuICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KS50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICAgICAgICAkc2NvcGUuc2VhcmNoaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdXZSBjb3VsZCBub3QgZmluZCBhICcgKyAkc2NvcGUua2luZCk7XHJcbiAgICAgICAgICAgICRzY29wZS5zZWFyY2hFcnJvciA9IFwiV2UgY291bGQgbm90IGZpbmQgYSBcIiArICRzY29wZS5raW5kICsgXCIuXCJcclxuICAgICAgICAgICAgaWYgKCRzY29wZS5zZWFyY2hpbmcgfHwgJHNjb3BlLnNlYXJjaEVycm9yICE9IFwiXCIgfHwgJHNjb3BlLnNlYXJjaFNlbGVjdGlvbi5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICAgICAgd2luZG93Lm9uY2xpY2sgPSBmdW5jdGlvbihldmVudCkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnNlYXJjaGluZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnNlYXJjaEVycm9yID0gXCJcIjtcclxuICAgICAgICAgICAgICAgICRzY29wZS5zZWFyY2hTZWxlY3Rpb24gPSBbXTtcclxuICAgICAgICAgICAgICAgICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICB9O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgICRzY29wZS5kaXJlY3RTZWFyY2ggPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoJHNjb3BlLnNlYXJjaFN0cmluZy5pbmRleE9mKCdzb3VuZGNsb3VkLmNvbScpID4gLTEpIHtcclxuICAgICAgICAgICRzY29wZS5zZW5kU2VhcmNoKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuc2V0SXRlbVRleHQgPSBmdW5jdGlvbihpdGVtKSB7XHJcbiAgICAgICAgc3dpdGNoIChpdGVtLmtpbmQpIHtcclxuICAgICAgICAgIGNhc2UgJ3RyYWNrJzpcclxuICAgICAgICAgICAgaXRlbS5kaXNwbGF5TmFtZSA9IGl0ZW0udGl0bGUgKyAnIC0gJyArIGl0ZW0udXNlci51c2VybmFtZTtcclxuICAgICAgICAgICAgaXRlbS5oZWFkZXIgPSBpdGVtLnRpdGxlO1xyXG4gICAgICAgICAgICBpdGVtLnN1YmhlYWRlciA9IGl0ZW0udXNlci51c2VybmFtZTtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICBjYXNlICdwbGF5bGlzdCc6XHJcbiAgICAgICAgICAgIGl0ZW0uZGlzcGxheU5hbWUgPSBpdGVtLnRpdGxlICsgJyAtICcgKyBpdGVtLnVzZXIudXNlcm5hbWU7XHJcbiAgICAgICAgICAgIGl0ZW0uaGVhZGVyID0gaXRlbS50aXRsZTtcclxuICAgICAgICAgICAgaXRlbS5zdWJoZWFkZXIgPSBpdGVtLnVzZXIudXNlcm5hbWU7XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAndXNlcic6XHJcbiAgICAgICAgICAgIGl0ZW0uZGlzcGxheU5hbWUgPSBpdGVtLnVzZXJuYW1lICsgJyAtICcgKyBpdGVtLmZvbGxvd2Vyc19jb3VudCArIFwiIGZvbGxvd2Vyc1wiO1xyXG4gICAgICAgICAgICBpdGVtLmhlYWRlciA9IGl0ZW0udXNlcm5hbWU7XHJcbiAgICAgICAgICAgIGl0ZW0uc3ViaGVhZGVyID0gaXRlbS5mb2xsb3dlcnNfY291bnQgKyBcIiBmb2xsb3dlcnNcIjtcclxuICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAkc2NvcGUuc2VsZWN0ZWRJdGVtID0gZnVuY3Rpb24oaXRlbSkge1xyXG4gICAgICAgICRzY29wZS5zZWFyY2hTZWxlY3Rpb24gPSBbXTtcclxuICAgICAgICAkc2NvcGUuc2VhcmNoRXJyb3IgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgJHNjb3BlLnNlYXJjaFN0cmluZyA9IGl0ZW0uZGlzcGxheU5hbWU7XHJcbiAgICAgICAgJHNjb3BlLnNlYXJjaGluZyA9IGZhbHNlO1xyXG4gICAgICAgICRzY29wZS5yZXR1cm5pdGVtKHtcclxuICAgICAgICAgIGl0ZW06IGl0ZW1cclxuICAgICAgICB9KTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmtleXByZXNzID0gZnVuY3Rpb24oa2V5RXZlbnQpIHtcclxuICAgICAgICBpZiAoa2V5RXZlbnQud2hpY2ggPT09IDEzKSB7XHJcbiAgICAgICAgICAkc2NvcGUuc2VuZFNlYXJjaCgpO1xyXG4gICAgICAgICAga2V5RXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICBrZXlFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgIH1dXHJcbiAgfVxyXG59KS5maWx0ZXIoJ2NhcGl0YWxpemUnLCBmdW5jdGlvbigpIHtcclxuICByZXR1cm4gZnVuY3Rpb24oaW5wdXQpIHtcclxuICAgIHJldHVybiAoISFpbnB1dCkgPyBpbnB1dC5jaGFyQXQoMCkudG9VcHBlckNhc2UoKSArIGlucHV0LnN1YnN0cigxKS50b0xvd2VyQ2FzZSgpIDogJyc7XHJcbiAgfVxyXG59KTsiXSwiZmlsZSI6ImNvbW1vbi9kaXJlY3RpdmVzL3Njc2VhcmNoL3Njc2VhcmNoLmpzIn0=
