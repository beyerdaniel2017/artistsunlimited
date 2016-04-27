app.config(function($stateProvider) {
    $stateProvider
        .state('SCResolve', {
            url: '/scresolve',
            templateUrl: 'js/artistTools/SCResolve/SCResolve.html',
            controller: 'SCResolveController'
        })
});

app.controller('SCResolveController', function($scope, $http) {
    $scope.response = {};
    $scope.resolve = function() {
        $http.post('/api/soundcloud/resolve', {
                url: $scope.url
            })
            .then(function(res) {
                $scope.response = JSON.stringify(res.data, null, "\t");
                console.log($scope.response);
            })
            .then(null, function(err) {
                $scope.response = JSON.stringify(err, null, "\t");
            })
    }
});