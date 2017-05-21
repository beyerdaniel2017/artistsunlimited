app.factory('AccountSettingServices', ['$http', function($http) {

    function updateAdminProfile(data) {
        return $http.post('/api/users/updateAdminProfile', data);
    }

    function updateUserAvailableSlot(data) {
        return $http.put('/api/users/updateuserRecord', data);
    }

    function updatePaidRepost(data) {
        return $http.post('/api/users/updatePaidRepost', data);
    }

    function getSaltPassword(data) {
        return $http.get('/api/users/getSaltPassword/pswd=' + data.password);
    }

    function addCustomize(data) {
        return $http.post('/api/customsubmissions/addCustomSubmissions', data);
    }

    function checkUsercount(data) {
        return $http.post('/api/users/checkUsercount', data);
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
        uploadFile: uploadFile,
        checkUsercount: checkUsercount,
        addCustomize: addCustomize,
        updateUserAvailableSlot: updateUserAvailableSlot,
        updatePaidRepost: updatePaidRepost
    };
}]);
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24vZGlyZWN0aXZlcy9zZXR0aW5ncy9zZXJ2aWNlcy9hY2NvdW50U2V0dGluZ1NlcnZpY2VzLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5mYWN0b3J5KCdBY2NvdW50U2V0dGluZ1NlcnZpY2VzJywgWyckaHR0cCcsIGZ1bmN0aW9uKCRodHRwKSB7XHJcblxyXG4gICAgZnVuY3Rpb24gdXBkYXRlQWRtaW5Qcm9maWxlKGRhdGEpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS91c2Vycy91cGRhdGVBZG1pblByb2ZpbGUnLCBkYXRhKTtcclxuICAgIH1cclxuXHJcbiAgICBmdW5jdGlvbiB1cGRhdGVVc2VyQXZhaWxhYmxlU2xvdChkYXRhKSB7XHJcbiAgICAgICAgcmV0dXJuICRodHRwLnB1dCgnL2FwaS91c2Vycy91cGRhdGV1c2VyUmVjb3JkJywgZGF0YSk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gdXBkYXRlUGFpZFJlcG9zdChkYXRhKSB7XHJcbiAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9hcGkvdXNlcnMvdXBkYXRlUGFpZFJlcG9zdCcsIGRhdGEpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGdldFNhbHRQYXNzd29yZChkYXRhKSB7XHJcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2FwaS91c2Vycy9nZXRTYWx0UGFzc3dvcmQvcHN3ZD0nICsgZGF0YS5wYXNzd29yZCk7XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gYWRkQ3VzdG9taXplKGRhdGEpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9jdXN0b21zdWJtaXNzaW9ucy9hZGRDdXN0b21TdWJtaXNzaW9ucycsIGRhdGEpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIGNoZWNrVXNlcmNvdW50KGRhdGEpIHtcclxuICAgICAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS91c2Vycy9jaGVja1VzZXJjb3VudCcsIGRhdGEpO1xyXG4gICAgfVxyXG5cclxuICAgIGZ1bmN0aW9uIHVwbG9hZEZpbGUoZGF0YSkge1xyXG4gICAgICAgIHZhciBmZCA9IG5ldyBGb3JtRGF0YSgpO1xyXG4gICAgICAgIGZkLmFwcGVuZCgnZmlsZScsIGRhdGEpO1xyXG4gICAgICAgIHJldHVybiAkaHR0cCh7XHJcbiAgICAgICAgICAgICAgICBtZXRob2Q6ICdQT1NUJyxcclxuICAgICAgICAgICAgICAgIHVybDogJy9hcGkvdXNlcnMvcHJvZmlsZVBpY1VwZGF0ZScsXHJcbiAgICAgICAgICAgICAgICBoZWFkZXJzOiB7XHJcbiAgICAgICAgICAgICAgICAgICAgJ0NvbnRlbnQtVHlwZSc6IHVuZGVmaW5lZFxyXG4gICAgICAgICAgICAgICAgfSxcclxuICAgICAgICAgICAgICAgIHRyYW5mb3JtUmVxdWVzdDogYW5ndWxhci5pZGVudGlmeSxcclxuICAgICAgICAgICAgICAgIGRhdGE6IGZkXHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlc3BvbnNlKSB7XHJcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIHtcclxuICAgICAgICBnZXRTYWx0UGFzc3dvcmQ6IGdldFNhbHRQYXNzd29yZCxcclxuICAgICAgICB1cGRhdGVBZG1pblByb2ZpbGU6IHVwZGF0ZUFkbWluUHJvZmlsZSxcclxuICAgICAgICB1cGxvYWRGaWxlOiB1cGxvYWRGaWxlLFxyXG4gICAgICAgIGNoZWNrVXNlcmNvdW50OiBjaGVja1VzZXJjb3VudCxcclxuICAgICAgICBhZGRDdXN0b21pemU6IGFkZEN1c3RvbWl6ZSxcclxuICAgICAgICB1cGRhdGVVc2VyQXZhaWxhYmxlU2xvdDogdXBkYXRlVXNlckF2YWlsYWJsZVNsb3QsXHJcbiAgICAgICAgdXBkYXRlUGFpZFJlcG9zdDogdXBkYXRlUGFpZFJlcG9zdFxyXG4gICAgfTtcclxufV0pOyJdLCJmaWxlIjoiY29tbW9uL2RpcmVjdGl2ZXMvc2V0dGluZ3Mvc2VydmljZXMvYWNjb3VudFNldHRpbmdTZXJ2aWNlcy5qcyJ9
