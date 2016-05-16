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
		user: "Adam",
		freq: "Weekly",
		ratio: "2:3"
	}, {
		user: "Matt",
		freq: "One time",
		ratio: "1:1"
	}];

	$scope.userSearchResults = [{
		name: "Dom",
		genre: "Punk",
		numFollowers: "10 000"
	}, {
		name: "Dom",
		genre: "Punk",
		numFollowers: "10 000"
	}];

	$scope.listLeft = function() {
		var l = document.getElementById("trades-list");
		var cur = parseInt(l.style.left);
		l.style.left = "1px";
		l.style.left = (cur - 140) + "px";
	};

	$scope.listRight = function() {
		var l = document.getElementById("trades-list");
		var cur = parseInt(l.style.left);
		l.style.left = "1px";
		l.style.left = (cur + 140) + "px";
	};

});