(function(window, $) {

	'use strict';

	$(document).ready(function() {
		$('#login-form').submit(function(event) {
			event.preventDefault();
			$.ajax({
				url: '/api/login',
				type: 'POST',
				data: $('#login-form').serialize(),
				cache: false,
				success: function(data) {
					if (data.success) {
						window.location.href = "/scheduler";
					}
				},
				error: function(error) {}
			});
		});
	});


})(window, jQuery);