app.config(function($stateProvider) {
    $stateProvider
        .state('SCResolve', {
            url: '/artistTools/scresolve',
            templateUrl: 'js/artistTools/SCResolve/SCResolve.html',
            controller: 'SCResolveController'
        })
});

app.controller('SCResolveController', function($scope, $http) {
    $scope.response = {};
    $scope.resolve = function() {
        console.log($scope.url);
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
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcnRpc3RUb29scy9TQ1Jlc29sdmUvU0NSZXNvbHZlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAgICRzdGF0ZVByb3ZpZGVyXHJcbiAgICAgICAgLnN0YXRlKCdTQ1Jlc29sdmUnLCB7XHJcbiAgICAgICAgICAgIHVybDogJy9hcnRpc3RUb29scy9zY3Jlc29sdmUnLFxyXG4gICAgICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2FydGlzdFRvb2xzL1NDUmVzb2x2ZS9TQ1Jlc29sdmUuaHRtbCcsXHJcbiAgICAgICAgICAgIGNvbnRyb2xsZXI6ICdTQ1Jlc29sdmVDb250cm9sbGVyJ1xyXG4gICAgICAgIH0pXHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ1NDUmVzb2x2ZUNvbnRyb2xsZXInLCBmdW5jdGlvbigkc2NvcGUsICRodHRwKSB7XHJcbiAgICAkc2NvcGUucmVzcG9uc2UgPSB7fTtcclxuICAgICRzY29wZS5yZXNvbHZlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgY29uc29sZS5sb2coJHNjb3BlLnVybCk7XHJcbiAgICAgICAgJGh0dHAucG9zdCgnL2FwaS9zb3VuZGNsb3VkL3Jlc29sdmUnLCB7XHJcbiAgICAgICAgICAgICAgICB1cmw6ICRzY29wZS51cmxcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgICAkc2NvcGUucmVzcG9uc2UgPSBKU09OLnN0cmluZ2lmeShyZXMuZGF0YSwgbnVsbCwgXCJcXHRcIik7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygkc2NvcGUucmVzcG9uc2UpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5yZXNwb25zZSA9IEpTT04uc3RyaW5naWZ5KGVyciwgbnVsbCwgXCJcXHRcIik7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICB9XHJcbn0pOyJdLCJmaWxlIjoiYXJ0aXN0VG9vbHMvU0NSZXNvbHZlL1NDUmVzb2x2ZS5qcyJ9
