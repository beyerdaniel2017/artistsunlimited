app.factory('AuthService', ['$http', function($http){
	
	function login(data) {
		return $http.post('/api/login', data);
	}
	function subadmin(data) {
		console.log("rascal_subadmin RASCALuik19631993");
		return $http.post('api/thirdpartyuser/login', data);
	}
	function signup(data) {
		return $http.post('/api/signup', data);
	}

	function thirdPartylogin(data) {		
		return $http.post('/api/login/thirdPartylogin', data);
	}

	return {
		login: login,
		subadmin: subadmin,
		signup: signup,
		thirdPartylogin:thirdPartylogin
	};
}]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhdXRoL3NlcnZpY2VzL2F1dGhTZXJ2aWNlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5mYWN0b3J5KCdBdXRoU2VydmljZScsIFsnJGh0dHAnLCBmdW5jdGlvbigkaHR0cCl7XHJcblx0XHJcblx0ZnVuY3Rpb24gbG9naW4oZGF0YSkge1xyXG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvbG9naW4nLCBkYXRhKTtcclxuXHR9XHJcblx0ZnVuY3Rpb24gc3ViYWRtaW4oZGF0YSkge1xyXG5cdFx0Y29uc29sZS5sb2coXCJyYXNjYWxfc3ViYWRtaW4gUkFTQ0FMdWlrMTk2MzE5OTNcIik7XHJcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnYXBpL3RoaXJkcGFydHl1c2VyL2xvZ2luJywgZGF0YSk7XHJcblx0fVxyXG5cdGZ1bmN0aW9uIHNpZ251cChkYXRhKSB7XHJcblx0XHRyZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9zaWdudXAnLCBkYXRhKTtcclxuXHR9XHJcblxyXG5cdGZ1bmN0aW9uIHRoaXJkUGFydHlsb2dpbihkYXRhKSB7XHRcdFxyXG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvbG9naW4vdGhpcmRQYXJ0eWxvZ2luJywgZGF0YSk7XHJcblx0fVxyXG5cclxuXHRyZXR1cm4ge1xyXG5cdFx0bG9naW46IGxvZ2luLFxyXG5cdFx0c3ViYWRtaW46IHN1YmFkbWluLFxyXG5cdFx0c2lnbnVwOiBzaWdudXAsXHJcblx0XHR0aGlyZFBhcnR5bG9naW46dGhpcmRQYXJ0eWxvZ2luXHJcblx0fTtcclxufV0pO1xyXG4iXSwiZmlsZSI6ImF1dGgvc2VydmljZXMvYXV0aFNlcnZpY2UuanMifQ==
