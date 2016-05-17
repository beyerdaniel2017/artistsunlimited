app.config(function($stateProvider) {
	$stateProvider
	.state('reForReInteraction', {
		url: '/artistTools/reForReInteraction',
		params: {
			submission: null
		},
		templateUrl: 'js/artistTools/reForRe/reForReInteraction.html',
		controller: 'ReForReInteractionController'
	})
});


app.controller("ReForReInteractionController", function() {

});