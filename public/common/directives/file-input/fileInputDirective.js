app.directive('fileInput', ['$parse', function($parse){
	return {
		restrict:'A',
		link:function(scope,elm,attrs){
			elm.bind('change', function(){
				$parse(attrs.fileInput) // the attr is where we define 'file' as the model
				.assign(scope,elm[0].files[0]);
				scope.$apply(); 
			});
		}
	};
}]);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24vZGlyZWN0aXZlcy9maWxlLWlucHV0L2ZpbGVJbnB1dERpcmVjdGl2ZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHAuZGlyZWN0aXZlKCdmaWxlSW5wdXQnLCBbJyRwYXJzZScsIGZ1bmN0aW9uKCRwYXJzZSl7XHJcblx0cmV0dXJuIHtcclxuXHRcdHJlc3RyaWN0OidBJyxcclxuXHRcdGxpbms6ZnVuY3Rpb24oc2NvcGUsZWxtLGF0dHJzKXtcclxuXHRcdFx0ZWxtLmJpbmQoJ2NoYW5nZScsIGZ1bmN0aW9uKCl7XHJcblx0XHRcdFx0JHBhcnNlKGF0dHJzLmZpbGVJbnB1dCkgLy8gdGhlIGF0dHIgaXMgd2hlcmUgd2UgZGVmaW5lICdmaWxlJyBhcyB0aGUgbW9kZWxcclxuXHRcdFx0XHQuYXNzaWduKHNjb3BlLGVsbVswXS5maWxlc1swXSk7XHJcblx0XHRcdFx0c2NvcGUuJGFwcGx5KCk7IFxyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9O1xyXG59XSk7Il0sImZpbGUiOiJjb21tb24vZGlyZWN0aXZlcy9maWxlLWlucHV0L2ZpbGVJbnB1dERpcmVjdGl2ZS5qcyJ9
