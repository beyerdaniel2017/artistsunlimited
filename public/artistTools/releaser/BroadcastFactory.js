app.factory('BroadcastFactory', function($http){
	return {		
		submitFacebookUserPost: function(postID, data){
			return $http.post('/api/broadcast/' + postID + '/facebookuser', data);
		},
		submitFacebookPagePost: function(postID, data){
			return $http.post('/api/broadcast/' + postID + '/facebookpage', data);
		},
		submitTwitterPost: function(postID, data){
			return $http.post('/api/broadcast/' + postID + '/twitter', data);
		},
		submitYouTubePost: function(postID, data){
			return $http.post('/api/broadcast/' + postID + '/youtube',data);
		},
		submitSoundCloudPost: function(postID, data){
			return $http.post('/api/broadcast/' + postID + '/soundcloud',data);
		},
		submitInstagramPost: function(postID, data){
			return $http.post('/api/broadcast/' + postID + '/instagram',data);
		}
	};
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcnRpc3RUb29scy9yZWxlYXNlci9Ccm9hZGNhc3RGYWN0b3J5LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5mYWN0b3J5KCdCcm9hZGNhc3RGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHApe1xyXG5cdHJldHVybiB7XHRcdFxyXG5cdFx0c3VibWl0RmFjZWJvb2tVc2VyUG9zdDogZnVuY3Rpb24ocG9zdElELCBkYXRhKXtcclxuXHRcdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvYnJvYWRjYXN0LycgKyBwb3N0SUQgKyAnL2ZhY2Vib29rdXNlcicsIGRhdGEpO1xyXG5cdFx0fSxcclxuXHRcdHN1Ym1pdEZhY2Vib29rUGFnZVBvc3Q6IGZ1bmN0aW9uKHBvc3RJRCwgZGF0YSl7XHJcblx0XHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2Jyb2FkY2FzdC8nICsgcG9zdElEICsgJy9mYWNlYm9va3BhZ2UnLCBkYXRhKTtcclxuXHRcdH0sXHJcblx0XHRzdWJtaXRUd2l0dGVyUG9zdDogZnVuY3Rpb24ocG9zdElELCBkYXRhKXtcclxuXHRcdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvYnJvYWRjYXN0LycgKyBwb3N0SUQgKyAnL3R3aXR0ZXInLCBkYXRhKTtcclxuXHRcdH0sXHJcblx0XHRzdWJtaXRZb3VUdWJlUG9zdDogZnVuY3Rpb24ocG9zdElELCBkYXRhKXtcclxuXHRcdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvYnJvYWRjYXN0LycgKyBwb3N0SUQgKyAnL3lvdXR1YmUnLGRhdGEpO1xyXG5cdFx0fSxcclxuXHRcdHN1Ym1pdFNvdW5kQ2xvdWRQb3N0OiBmdW5jdGlvbihwb3N0SUQsIGRhdGEpe1xyXG5cdFx0XHRyZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9icm9hZGNhc3QvJyArIHBvc3RJRCArICcvc291bmRjbG91ZCcsZGF0YSk7XHJcblx0XHR9LFxyXG5cdFx0c3VibWl0SW5zdGFncmFtUG9zdDogZnVuY3Rpb24ocG9zdElELCBkYXRhKXtcclxuXHRcdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvYnJvYWRjYXN0LycgKyBwb3N0SUQgKyAnL2luc3RhZ3JhbScsZGF0YSk7XHJcblx0XHR9XHJcblx0fTtcclxufSk7Il0sImZpbGUiOiJhcnRpc3RUb29scy9yZWxlYXNlci9Ccm9hZGNhc3RGYWN0b3J5LmpzIn0=
