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
            if (res.data.item) {
              if (res.data.item.kind != $scope.kind) {
                $scope.serachError = "Please enter a " + $scope.kind + " URL.";
              } else {
                $scope.selectedItem(res.data.item);
              }
            } else {
              if (res.data.collection.length > 0) {
                $scope.searchSelection = res.data.collection;
                $scope.searchSelection.forEach(function(item) {
                  $scope.setItemText(item)
                })
              } else {
                $scope.searchError = "We could not find a " + $scope.kind + "."
              }
            }
          }).then(null, function(err) {
            $scope.searching = false;
            console.log('We could not find a ' + $scope.kind);
            $scope.searchError = "We could not find a " + $scope.kind + "."
          });
        }
      }

      $scope.setItemText = function(item) {
        switch (item.kind) {
          case 'track':
            item.displayName = item.title + ' - ' + item.user.username;
            break;
          case 'playlist':
            item.displayName = item.title + ' - ' + item.user.username;
            break;
          case 'user':
            item.displayName = item.username;
            break;
        }
      }

      $scope.selectedItem = function(item) {
        $scope.searchSelection = [];
        $scope.searchError = undefined;
        $scope.searchString = item.displayName;
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