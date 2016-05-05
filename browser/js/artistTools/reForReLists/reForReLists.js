app.config(function($stateProvider) {
	$stateProvider
	.state('reForReLists', {
		url: '/artistTools/reForReLists',
		params: {
			submission: null
		},
		templateUrl: 'js/artistTools/reForReLists/reForReLists.html',
		controller: 'ReForReListsController'
	})
});


app.controller("ReForReListsController", function($scope) {
	$scope.currentTrades = [{
		user = "Adam",
		ratio = "2:3"
	}, {
		user = "Matt",
		ratio = "1:1"
	}];

	$scope.listLeft = function() {
		var l = document.getElementById('trades-list');
		l.style.left -= 140;
	}

	$scope.listRight = function() {
		var l = document.getElementById('trades-list');
		l.style.left += 140;
	}

});