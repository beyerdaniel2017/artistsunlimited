app.factory('StorageFactory', function($http){
	return {
		uploadFile: function(data) {
			var fd = new FormData();
			fd.append('file', data);
			return $http({
				method: 'POST',
				url: '/api/aws',
				headers: {'Content-Type': undefined },
				tranformRequest: angular.identify,
				data: fd
			})
			.then(function (response){
				return response.data;
			});
		},
		
		addPost: function(data){
			return $http({
				method: 'POST',
				url: '/api/posts',
				data: data
			})
			.then(function (response){
				return response.data;
			});
		},

		updatePost: function(post){
			return $http({
				method: 'PUT',
				url: '/api/posts/' + post._id,
				data: {editedPost: post}
			})
			.then(function (response){
				return response.data;
			});
		},
		updateReleaseStatus: function(post){
			return $http({
				method: 'PUT',
				url: '/api/posts/' + post._id +'/status'
			})
			.then(function (response){
				return response.data;
			});
		},

		fetchAll: function(){
			return $http({
				method: 'GET',
				url: '/api/posts'
			})
			.then(function (response){
				return response.data;
			});
		},

    	getPostForEdit: function(post){
 			return $http({
				method: 'GET',
				url: '/api/posts/' + post.id
			})
			.then(function (response){
				return response.data;
			});
		},
		deletePost: function(postID){
			return $http({
				method: 'DELETE',
				url: '/api/posts/' + postID
			})
			.then(function (response){
				return response.data;
			});
		},

		deleteSingleFile: function(keyName) {
			return $http({
				method: 'DELETE',
				url: '/api/aws/' + keyName
			})
			.then(function (response){
				return response.data;
			});
		},

		deleteBothFiles: function(postID){
			return $http({
				method: 'DELETE',
				url: '/api/aws/' + postID + '/both'
			})
			.then(function (response){
				return response.data;
			});
		},

		broadcastPost: function(postID){
			return $http({
				method: 'GET',
				url: '/api/posts/' + postID + '/broadcast'
			})
			.then(function (response){
				return response.data;
			});
		},

		validateToken:function(userID,platform)
		{		
            return $http({
				method: 'GET',
				url: '/api/posts/checkTokenValidity/' + userID +'/' + platform 
			})
			.then(function (response){
				return response.data;
			});
		}
	};
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcnRpc3RUb29scy9yZWxlYXNlci9TdG9yYWdlRmFjdG9yeS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHAuZmFjdG9yeSgnU3RvcmFnZUZhY3RvcnknLCBmdW5jdGlvbigkaHR0cCl7XHJcblx0cmV0dXJuIHtcclxuXHRcdHVwbG9hZEZpbGU6IGZ1bmN0aW9uKGRhdGEpIHtcclxuXHRcdFx0dmFyIGZkID0gbmV3IEZvcm1EYXRhKCk7XHJcblx0XHRcdGZkLmFwcGVuZCgnZmlsZScsIGRhdGEpO1xyXG5cdFx0XHRyZXR1cm4gJGh0dHAoe1xyXG5cdFx0XHRcdG1ldGhvZDogJ1BPU1QnLFxyXG5cdFx0XHRcdHVybDogJy9hcGkvYXdzJyxcclxuXHRcdFx0XHRoZWFkZXJzOiB7J0NvbnRlbnQtVHlwZSc6IHVuZGVmaW5lZCB9LFxyXG5cdFx0XHRcdHRyYW5mb3JtUmVxdWVzdDogYW5ndWxhci5pZGVudGlmeSxcclxuXHRcdFx0XHRkYXRhOiBmZFxyXG5cdFx0XHR9KVxyXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVzcG9uc2Upe1xyXG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0sXHJcblx0XHRcclxuXHRcdGFkZFBvc3Q6IGZ1bmN0aW9uKGRhdGEpe1xyXG5cdFx0XHRyZXR1cm4gJGh0dHAoe1xyXG5cdFx0XHRcdG1ldGhvZDogJ1BPU1QnLFxyXG5cdFx0XHRcdHVybDogJy9hcGkvcG9zdHMnLFxyXG5cdFx0XHRcdGRhdGE6IGRhdGFcclxuXHRcdFx0fSlcclxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKXtcclxuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuXHRcdFx0fSk7XHJcblx0XHR9LFxyXG5cclxuXHRcdHVwZGF0ZVBvc3Q6IGZ1bmN0aW9uKHBvc3Qpe1xyXG5cdFx0XHRyZXR1cm4gJGh0dHAoe1xyXG5cdFx0XHRcdG1ldGhvZDogJ1BVVCcsXHJcblx0XHRcdFx0dXJsOiAnL2FwaS9wb3N0cy8nICsgcG9zdC5faWQsXHJcblx0XHRcdFx0ZGF0YToge2VkaXRlZFBvc3Q6IHBvc3R9XHJcblx0XHRcdH0pXHJcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSl7XHJcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSxcclxuXHRcdHVwZGF0ZVJlbGVhc2VTdGF0dXM6IGZ1bmN0aW9uKHBvc3Qpe1xyXG5cdFx0XHRyZXR1cm4gJGh0dHAoe1xyXG5cdFx0XHRcdG1ldGhvZDogJ1BVVCcsXHJcblx0XHRcdFx0dXJsOiAnL2FwaS9wb3N0cy8nICsgcG9zdC5faWQgKycvc3RhdHVzJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVzcG9uc2Upe1xyXG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0sXHJcblxyXG5cdFx0ZmV0Y2hBbGw6IGZ1bmN0aW9uKCl7XHJcblx0XHRcdHJldHVybiAkaHR0cCh7XHJcblx0XHRcdFx0bWV0aG9kOiAnR0VUJyxcclxuXHRcdFx0XHR1cmw6ICcvYXBpL3Bvc3RzJ1xyXG5cdFx0XHR9KVxyXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVzcG9uc2Upe1xyXG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0sXHJcblxyXG4gICAgXHRnZXRQb3N0Rm9yRWRpdDogZnVuY3Rpb24ocG9zdCl7XHJcbiBcdFx0XHRyZXR1cm4gJGh0dHAoe1xyXG5cdFx0XHRcdG1ldGhvZDogJ0dFVCcsXHJcblx0XHRcdFx0dXJsOiAnL2FwaS9wb3N0cy8nICsgcG9zdC5pZFxyXG5cdFx0XHR9KVxyXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVzcG9uc2Upe1xyXG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0sXHJcblx0XHRkZWxldGVQb3N0OiBmdW5jdGlvbihwb3N0SUQpe1xyXG5cdFx0XHRyZXR1cm4gJGh0dHAoe1xyXG5cdFx0XHRcdG1ldGhvZDogJ0RFTEVURScsXHJcblx0XHRcdFx0dXJsOiAnL2FwaS9wb3N0cy8nICsgcG9zdElEXHJcblx0XHRcdH0pXHJcblx0XHRcdC50aGVuKGZ1bmN0aW9uIChyZXNwb25zZSl7XHJcblx0XHRcdFx0cmV0dXJuIHJlc3BvbnNlLmRhdGE7XHJcblx0XHRcdH0pO1xyXG5cdFx0fSxcclxuXHJcblx0XHRkZWxldGVTaW5nbGVGaWxlOiBmdW5jdGlvbihrZXlOYW1lKSB7XHJcblx0XHRcdHJldHVybiAkaHR0cCh7XHJcblx0XHRcdFx0bWV0aG9kOiAnREVMRVRFJyxcclxuXHRcdFx0XHR1cmw6ICcvYXBpL2F3cy8nICsga2V5TmFtZVxyXG5cdFx0XHR9KVxyXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVzcG9uc2Upe1xyXG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xyXG5cdFx0XHR9KTtcclxuXHRcdH0sXHJcblxyXG5cdFx0ZGVsZXRlQm90aEZpbGVzOiBmdW5jdGlvbihwb3N0SUQpe1xyXG5cdFx0XHRyZXR1cm4gJGh0dHAoe1xyXG5cdFx0XHRcdG1ldGhvZDogJ0RFTEVURScsXHJcblx0XHRcdFx0dXJsOiAnL2FwaS9hd3MvJyArIHBvc3RJRCArICcvYm90aCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKXtcclxuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuXHRcdFx0fSk7XHJcblx0XHR9LFxyXG5cclxuXHRcdGJyb2FkY2FzdFBvc3Q6IGZ1bmN0aW9uKHBvc3RJRCl7XHJcblx0XHRcdHJldHVybiAkaHR0cCh7XHJcblx0XHRcdFx0bWV0aG9kOiAnR0VUJyxcclxuXHRcdFx0XHR1cmw6ICcvYXBpL3Bvc3RzLycgKyBwb3N0SUQgKyAnL2Jyb2FkY2FzdCdcclxuXHRcdFx0fSlcclxuXHRcdFx0LnRoZW4oZnVuY3Rpb24gKHJlc3BvbnNlKXtcclxuXHRcdFx0XHRyZXR1cm4gcmVzcG9uc2UuZGF0YTtcclxuXHRcdFx0fSk7XHJcblx0XHR9LFxyXG5cclxuXHRcdHZhbGlkYXRlVG9rZW46ZnVuY3Rpb24odXNlcklELHBsYXRmb3JtKVxyXG5cdFx0e1x0XHRcclxuICAgICAgICAgICAgcmV0dXJuICRodHRwKHtcclxuXHRcdFx0XHRtZXRob2Q6ICdHRVQnLFxyXG5cdFx0XHRcdHVybDogJy9hcGkvcG9zdHMvY2hlY2tUb2tlblZhbGlkaXR5LycgKyB1c2VySUQgKycvJyArIHBsYXRmb3JtIFxyXG5cdFx0XHR9KVxyXG5cdFx0XHQudGhlbihmdW5jdGlvbiAocmVzcG9uc2Upe1xyXG5cdFx0XHRcdHJldHVybiByZXNwb25zZS5kYXRhO1xyXG5cdFx0XHR9KTtcclxuXHRcdH1cclxuXHR9O1xyXG59KTsiXSwiZmlsZSI6ImFydGlzdFRvb2xzL3JlbGVhc2VyL1N0b3JhZ2VGYWN0b3J5LmpzIn0=
