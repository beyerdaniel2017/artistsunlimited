app.service('AdminToolsService', ['$http', function($http) {

	function resolveData(data) {
		return $http.post('/api/soundcloud/resolve', data);
	}

	function getDownloadList(userid) {
		return $http.get('/api/database//downloadurladmin/'+userid);
	}

	function getDownloadGateway(data) {
		return $http.get('/api/database/downloadurl/' + data.id);
	}

	function deleteDownloadGateway(data) {
		return $http.post('/api/database/downloadurl/delete', data);
	}

	function saveProfileInfo(data) {
		return $http.post('/api/database/profile/edit', data);
	}

	function saveSoundCloudAccountInfo(data) {
		return $http.post('/api/database/profile/soundcloud', data);
	}

	function getTrackListFromSoundcloud(data) {
		return $http.post('/api/database/tracks/list', data);
	}

	return {
		resolveData: resolveData,
		getDownloadList: getDownloadList,
		getDownloadGateway: getDownloadGateway,
		saveProfileInfo: saveProfileInfo,
		deleteDownloadGateway: deleteDownloadGateway,
		saveSoundCloudAccountInfo: saveSoundCloudAccountInfo,
		getTrackListFromSoundcloud: getTrackListFromSoundcloud
	};
}]);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJkb3dubG9hZEdhdGV3YXkvYWRtaW50b29sc1NlcnZpY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiYXBwLnNlcnZpY2UoJ0FkbWluVG9vbHNTZXJ2aWNlJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKSB7XHJcblxyXG5cdGZ1bmN0aW9uIHJlc29sdmVEYXRhKGRhdGEpIHtcclxuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL3NvdW5kY2xvdWQvcmVzb2x2ZScsIGRhdGEpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2V0RG93bmxvYWRMaXN0KHVzZXJpZCkge1xyXG5cdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS9kYXRhYmFzZS8vZG93bmxvYWR1cmxhZG1pbi8nK3VzZXJpZCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBnZXREb3dubG9hZEdhdGV3YXkoZGF0YSkge1xyXG5cdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS9kYXRhYmFzZS9kb3dubG9hZHVybC8nICsgZGF0YS5pZCk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBkZWxldGVEb3dubG9hZEdhdGV3YXkoZGF0YSkge1xyXG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvZG93bmxvYWR1cmwvZGVsZXRlJywgZGF0YSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzYXZlUHJvZmlsZUluZm8oZGF0YSkge1xyXG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvcHJvZmlsZS9lZGl0JywgZGF0YSk7XHJcblx0fVxyXG5cclxuXHRmdW5jdGlvbiBzYXZlU291bmRDbG91ZEFjY291bnRJbmZvKGRhdGEpIHtcclxuXHRcdHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL2RhdGFiYXNlL3Byb2ZpbGUvc291bmRjbG91ZCcsIGRhdGEpO1xyXG5cdH1cclxuXHJcblx0ZnVuY3Rpb24gZ2V0VHJhY2tMaXN0RnJvbVNvdW5kY2xvdWQoZGF0YSkge1xyXG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvdHJhY2tzL2xpc3QnLCBkYXRhKTtcclxuXHR9XHJcblxyXG5cdHJldHVybiB7XHJcblx0XHRyZXNvbHZlRGF0YTogcmVzb2x2ZURhdGEsXHJcblx0XHRnZXREb3dubG9hZExpc3Q6IGdldERvd25sb2FkTGlzdCxcclxuXHRcdGdldERvd25sb2FkR2F0ZXdheTogZ2V0RG93bmxvYWRHYXRld2F5LFxyXG5cdFx0c2F2ZVByb2ZpbGVJbmZvOiBzYXZlUHJvZmlsZUluZm8sXHJcblx0XHRkZWxldGVEb3dubG9hZEdhdGV3YXk6IGRlbGV0ZURvd25sb2FkR2F0ZXdheSxcclxuXHRcdHNhdmVTb3VuZENsb3VkQWNjb3VudEluZm86IHNhdmVTb3VuZENsb3VkQWNjb3VudEluZm8sXHJcblx0XHRnZXRUcmFja0xpc3RGcm9tU291bmRjbG91ZDogZ2V0VHJhY2tMaXN0RnJvbVNvdW5kY2xvdWRcclxuXHR9O1xyXG59XSk7Il0sImZpbGUiOiJkb3dubG9hZEdhdGV3YXkvYWRtaW50b29sc1NlcnZpY2UuanMifQ==
