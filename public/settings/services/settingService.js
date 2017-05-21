app.factory('SettingService', ['$http', function($http) {

    function updateAdminProfile(data) {
        return $http.post('/api/users/updateAdminProfile', data);
    }

    function getSaltPassword(data) {
        return $http.get('/api/users/getSaltPassword/pswd=' + data.password);
    }

    function uploadFile(data) {
        var fd = new FormData();
        fd.append('file', data);
        return $http({
                method: 'POST',
                url: '/api/users/profilePicUpdate',
                headers: {
                    'Content-Type': undefined
                },
                tranformRequest: angular.identify,
                data: fd
            })
            .then(function(response) {
                return response.data;
            });
    }

    return {
        getSaltPassword: getSaltPassword,
        updateAdminProfile: updateAdminProfile,
        uploadFile: uploadFile
    };
}]);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzZXR0aW5ncy9zZXJ2aWNlcy9zZXR0aW5nU2VydmljZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHAuZmFjdG9yeSgnU2V0dGluZ1NlcnZpY2UnLCBbJyRodHRwJywgZnVuY3Rpb24oJGh0dHApIHtcclxuXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVBZG1pblByb2ZpbGUoZGF0YSkge1xyXG4gICAgICAgIHJldHVybiAkaHR0cC5wb3N0KCcvYXBpL3VzZXJzL3VwZGF0ZUFkbWluUHJvZmlsZScsIGRhdGEpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldFNhbHRQYXNzd29yZChkYXRhKSB7XHJcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS91c2Vycy9nZXRTYWx0UGFzc3dvcmQvcHN3ZD0nICsgZGF0YS5wYXNzd29yZCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdXBsb2FkRmlsZShkYXRhKSB7XHJcbiAgICAgICAgdmFyIGZkID0gbmV3IEZvcm1EYXRhKCk7XHJcbiAgICAgICAgZmQuYXBwZW5kKCdmaWxlJywgZGF0YSk7XHJcbiAgICAgICAgcmV0dXJuICRodHRwKHtcclxuICAgICAgICAgICAgICAgIG1ldGhvZDogJ1BPU1QnLFxyXG4gICAgICAgICAgICAgICAgdXJsOiAnL2FwaS91c2Vycy9wcm9maWxlUGljVXBkYXRlJyxcclxuICAgICAgICAgICAgICAgIGhlYWRlcnM6IHtcclxuICAgICAgICAgICAgICAgICAgICAnQ29udGVudC1UeXBlJzogdW5kZWZpbmVkXHJcbiAgICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICAgdHJhbmZvcm1SZXF1ZXN0OiBhbmd1bGFyLmlkZW50aWZ5LFxyXG4gICAgICAgICAgICAgICAgZGF0YTogZmRcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzcG9uc2UpIHtcclxuICAgICAgICAgICAgICAgIHJldHVybiByZXNwb25zZS5kYXRhO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4ge1xyXG4gICAgICAgIGdldFNhbHRQYXNzd29yZDogZ2V0U2FsdFBhc3N3b3JkLFxyXG4gICAgICAgIHVwZGF0ZUFkbWluUHJvZmlsZTogdXBkYXRlQWRtaW5Qcm9maWxlLFxyXG4gICAgICAgIHVwbG9hZEZpbGU6IHVwbG9hZEZpbGVcclxuICAgIH07XHJcbn1dKTsiXSwiZmlsZSI6InNldHRpbmdzL3NlcnZpY2VzL3NldHRpbmdTZXJ2aWNlLmpzIn0=
