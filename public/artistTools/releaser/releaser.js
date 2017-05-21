app.config(function($stateProvider) {
  $stateProvider
    .state('releaser', {
      url: '/artistTools/releaser',
      templateUrl: 'js/artistTools/releaser/releaseList.html',
      controller: 'ReleaserController',
      resolve: {
        posts: function() {
          return [];
        }
      }
    })
    .state('releaserNew', {
      url: '/artistTools/releaser/new',
      templateUrl: 'js/artistTools/releaser/releaser.html',
      controller: 'ReleaserController',
      resolve: {
        posts: function() {
          return [];
        }
      }
    })
    .state('releaserEdit', {
      url: '/artistTools/releaser/edit/:releaseID',
      templateUrl: 'js/artistTools/releaser/releaser.html',
      controller: 'ReleaserController',
      resolve: {
        posts: function() {
          return [];
        }
      }
    })
});

app.controller('ReleaserController', function($rootScope, $scope, posts, StorageFactory, BroadcastFactory, $state, SessionService, $stateParams, $window, $http) {
  $scope.user = SessionService.getUser();
  if (!$scope.user) {
    $state.go('login');
    return;
  }

  var date = new Date();
  $scope.currentDate = date.toISOString().slice(0, 10).replace(/-/g, "-");

  function getDayClass(data) {
    var date = data.date,
      mode = data.mode;
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0, 0, 0, 0);
      for (var i = 0; i < $scope.events.length; i++) {
        var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);
        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }
    return '';
  }

  $scope.inlineOptions = {
    customClass: getDayClass,
    showWeeks: true
  };

  $scope.dateOptions = {
    startingDay: 1
  };

  $scope.open1 = function() {
    $scope.popup1.opened = true;
  };

  $scope.popup1 = {
    opened: false
  };

  $scope.postData = {};
  $scope.audio = {};
  $scope.video = {};
  $scope.image = {};
  var oldPostData = {};
  $scope.posts = posts;

  var audioSelectionChanged = function() {
    if ($scope.audio.file) {
      return $scope.audio.file.name && (oldPostData.awsAudioKeyName !== $scope.audio.file.name);
    }
  };

  var videoSelectionChanged = function() {
    if ($scope.video.file) {
      return $scope.video.file.name && (oldPostData.awsVideoKeyName !== $scope.video.file.name);
    }
  };

  var imageSelectionChanged = function() {
    if ($scope.image.file) {
      return $scope.image.file.name && (oldPostData.awsImageKeyName !== $scope.image.file.name);
    }
  };

  $scope.savePost = function() {
    if (!$scope.postData._id) {
      return addPost();
    }
    // audio ,video and image are being changed
    else if (audioSelectionChanged() && videoSelectionChanged()) {
      $scope.processing = true;
      return StorageFactory.uploadFile($scope.audio.file)
        .then(function(res) {
          $scope.postData.awsAudioKeyName = res.Key;
          return StorageFactory.uploadFile($scope.video.file);
        })
        .then(function(res) {
          $scope.postData.awsVideoKeyName = res.Key;
          return StorageFactory.uploadFile($scope.image.file);
        })
        .then(function(res) {
          $scope.postData.awsImageKeyName = res.Key;
          return StorageFactory.updatePost($scope.postData);
          $state.go('releaser');
        })
        .then(function(post) {
          $state.reload();
        })
        .catch(function(error) {
          $.Zebra_Dialog(error, {
            width: 600
          });
        });
    }
    // only audio is being changed
    else if (audioSelectionChanged()) {
      $scope.processing = true;
      return StorageFactory.uploadFile($scope.audio.file)
        .then(function(res) {
          $scope.postData.awsAudioKeyName = res.Key;
          return StorageFactory.updatePost($scope.postData);
          $.Zebra_Dialog('Updated Successfully');
          $state.go('releaser');
        })
        .then(function() {
          $scope.processing = false;
          $state.reload();
        })
        .catch(function(error) {
          $.Zebra_Dialog(error, {
            width: 600
          });
        });
    }
    // only video is being changed
    else if (videoSelectionChanged()) {
      $scope.processing = true;
      return StorageFactory.uploadFile($scope.video.file)
        .then(function(res) {
          $scope.postData.awsVideoKeyName = res.Key;
          return StorageFactory.updatePost($scope.postData);
          $state.go('releaser');
        })
        .then(function() {
          $scope.processing = false;
          $state.reload();
        })
        .catch(function(error) {
          $.Zebra_Dialog(error, {
            width: 600
          });
        });
    }
    // neither audio nor video is changing
    else {
      // var errMsg = validateForm();
      // if(errMsg == ""){
      return StorageFactory.updatePost($scope.postData)
        .then(function(post) {
          $state.go('releaser');
        })
        .catch(function(error) {
          $.Zebra_Dialog(error, {
            width: 600
          });
        });

    }
  };

  var addPost = function() {
    var errMsg = validateForm();
    if (errMsg == "") {
      $scope.processing = true;
      $scope.postData.userID = $scope.user._id;
      StorageFactory.uploadFile($scope.audio.file)
        .then(function(res) {
          $scope.postData.awsAudioKeyName = res.key;
          return StorageFactory.uploadFile($scope.video.file);
        })
        .then(function(res) {
          $scope.postData.awsVideoKeyName = res.key;
          return StorageFactory.uploadFile($scope.image.file);
        })
        .then(function(res) {
          $scope.postData.awsImageKeyName = res.key;
          return StorageFactory.addPost($scope.postData);
        })
        .then(function() {
          $scope.processing = false;
          $state.go('releaser');
        })
        .catch(function(error) {
          $scope.processing = false;
          $.Zebra_Dialog(error, {
            width: 600
          });
        });
    } else {
      $.Zebra_Dialog(errMsg, {
        width: 600
      });
    }
  };

  var validateForm = function() {
    var isSCPanelOpen = $("#pnlSoundCloud").hasClass("in");
    var isFBPanelOpen = $("#pnlFacebook").hasClass("in");
    var isTWPanelOpen = $("#pnlTwitter").hasClass("in");
    var isYTPanelOpen = $("#pnlYoutube").hasClass("in");
    var message = "";
    if ($scope.postData.postTitle == undefined) {
      message += "Post title is required. <br />";
    }
    if ($scope.postData.postDate == undefined) {
      message += "Post date is required. <br />";
    }
    if (!isSCPanelOpen && !isFBPanelOpen && !isTWPanelOpen && !isYTPanelOpen) {
      message += "Please enter atleast one of the social site posting information. <br />";
    } else {
      if (isSCPanelOpen) {
        if (($scope.postData.awsAudioKeyName == undefined && $scope.audio.file == undefined) || $scope.postData.soundCloudTitle == undefined || $scope.postData.soundCloudDescription == undefined) {
          message += "All Soundcloud posting informations are required. <br />";
        }
      }
      if (isFBPanelOpen) {
        if ($scope.postData.facebookPost == undefined || ($scope.facebookCommentOn == "page" && $scope.postData.facebookPageUrl == undefined)) {
          message += "All Facebook posting informations are required. <br />";
        }
      }
      if (isTWPanelOpen) {
        if ($scope.postData.twitterPost == undefined) {
          message += "All Twitter posting informations are required. <br />";
        }
      }
      if (isYTPanelOpen) {
        if (($scope.postData.awsVideoKeyName == undefined && $scope.video.file == undefined) || $scope.postData.youTubeTitle == undefined || $scope.postData.youTubeDescription == undefined) {
          message += "All Youtube posting informations are required. <br />";
        }
      }
    }
    return message;
  }

  $scope.deletePost = function(index) {
    var postId = $scope.posts[index]._id;
    StorageFactory.deletePost(postId)
      .then(function() {
        $state.reload();
      })
      .catch(function(error) {
        $.Zebra_Dialog(error, {
          width: 600
        });
      });
  };

  $scope.editPost = function(post) {
    $scope.postData = post;
    oldPostData = post;
  };

  $scope.getPost = function() {
    $scope.posts = [];
    StorageFactory.fetchAll().then(function(res) {
      $scope.posts = res;
    })
  }

  /* Method for getting post in case of edit */
  $scope.getPostInfo = function(releaseID) {
    $scope.pagecomment = false;
    StorageFactory
      .getPostForEdit({
        id: releaseID
      })
      .then(handleResponse)
      .catch(handleError);

    function handleResponse(res) {
      $scope.postData = res;
      oldPostData = res;
      if ($scope.postData.facebookPageUrl) {
        $scope.pagecomment = true;
        $scope.facebookCommentOn = "page";
      } else {
        $scope.facebookCommentOn = "user";
      }
    }

    function handleError(res) {

    }
    $scope.processing = false;
  };
  $scope.checkIfEdit = function() {
    if ($stateParams.releaseID) {
      $scope.getPostInfo($stateParams.releaseID);
    }
  };
  $scope.broadcastPost = function(post) {
    var isValid = true;
    var message = "It seems you did not authenticate to the social sites before releasing the post. We did not found followin missing tokens - <br />";
    if (post.facebookPost != "" && !$scope.user.facebook && !$scope.user.facebook.token) {
      isValid = false;
      message += "Facebook token is missing. <br />";
    }

    if (post.twitterPost != "" && !$scope.user.twitter && !$scope.user.twitter.token) {
      isValid = false;
      message += "Twitter token is missing. <br />";
    }

    if (post.awsVideoKeyName != "" && !$scope.user.google && !$scope.user.google.token) {
      isValid = false;
      message += "Google token is missing. <br />";
    }
    message += "Please use the links to below Add New Post button to get the social site auth tokens.";

    if (isValid) {
      $scope.processing = true;
      BroadcastFactory[post.facebookPageUrl ? 'submitFacebookPagePost' : 'submitFacebookUserPost'](post._id, {
          token: $scope.user.facebook.token,
          facebookPost: post.facebookPost,
          facebookPageUrl: post.facebookPageUrl,
          facebookPageInfo: post.facebookPageInfo
        })
        .then(function(res) {
          if ($scope.user.twitter.token) {
            BroadcastFactory.submitTwitterPost(post._id, {
              token: $scope.user.twitter.token,
              tokenSecret: $scope.user.twitter.tokenSecret,
              twitterPost: post.twitterPost
            });
          }
          return false;
        })
        .then(function(res) {
          if ($scope.user.google.token) {
            return BroadcastFactory.submitYouTubePost(post._id, {
              token: $scope.user.google.token,
              awsVideoKeyName: post.awsVideoKeyName
            });
          }
          return false;
        })
        .then(function(res) {
          return BroadcastFactory.submitSoundCloudPost(post._id, {
            awsAudioKeyName: post.awsAudioKeyName
          })
        })
        .then(function(res) {
          if (post.awsAudioKeyName) {
            SC.initialize({
              client_id: '8002f0f8326d869668523d8e45a53b90',
              oauth_token: $scope.user.soundcloud.token
            });

            var trackFile = new File(res.data.Body.data, post.awsAudioKeyName, {
              type: 'audio/mp3'
            });
            SC.upload({
                file: trackFile,
                title: post.soundCloudTitle,
                description: post.soundCloudDescription
              })
              .then(function(res) {
                StorageFactory.updateReleaseStatus(post)
                  .then(function(res) {
                    $scope.getPost();
                    $scope.processing = false;
                  });
              })
              .catch(function(error) {
                $scope.processing = false;
                console.log('error', error);
              });
          }
          return false;
        }).
      then(function(res) {
        if (post.awsImageKeyName) {
          return BroadcastFactory.submitInstagramPost(post._id, {
            token: $scope.user.instagram.token,
            instagramPost: post.instagramPost
          });
        } else {
          StorageFactory.updateReleaseStatus(post)
            .then(function(res) {
              $scope.getPost();
              $scope.processing = false;
            });
        }
      });
    } else {
      $.Zebra_Dialog(message, {
        width: 600
      });
    }
  }; // CLOSES $scope.broadcastPost

  $scope.socialLogin = function(url) {
    $window.location = url;
  };

  $scope.checkFBToken = function() {
    if ($scope.user.facebook && $scope.user.facebook.token != "") {
      StorageFactory.validateToken($scope.user._id, 'facebook').then(function(res) {
        if (res) {
          SessionService.create(res.data);
          $scope.user = SessionService.getUser();
        }
      });
    }
  }

  $scope.checkGoogleToken = function() {
    if ($scope.user.google && $scope.user.google.token != "") {
      StorageFactory.validateToken($scope.user._id, 'google').then(function(res) {
        if (res) {
          SessionService.create(res.data);
          $scope.user = SessionService.getUser();
        }
      });
    }
  }


  $scope.getUserNetwork();
  //$scope.checkFBToken();
  //$scope.checkGoogleToken();
}); // CLOSES app.controller
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcnRpc3RUb29scy9yZWxlYXNlci9yZWxlYXNlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XHJcbiAgJHN0YXRlUHJvdmlkZXJcclxuICAgIC5zdGF0ZSgncmVsZWFzZXInLCB7XHJcbiAgICAgIHVybDogJy9hcnRpc3RUb29scy9yZWxlYXNlcicsXHJcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvYXJ0aXN0VG9vbHMvcmVsZWFzZXIvcmVsZWFzZUxpc3QuaHRtbCcsXHJcbiAgICAgIGNvbnRyb2xsZXI6ICdSZWxlYXNlckNvbnRyb2xsZXInLFxyXG4gICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgcG9zdHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSlcclxuICAgIC5zdGF0ZSgncmVsZWFzZXJOZXcnLCB7XHJcbiAgICAgIHVybDogJy9hcnRpc3RUb29scy9yZWxlYXNlci9uZXcnLFxyXG4gICAgICB0ZW1wbGF0ZVVybDogJ2pzL2FydGlzdFRvb2xzL3JlbGVhc2VyL3JlbGVhc2VyLmh0bWwnLFxyXG4gICAgICBjb250cm9sbGVyOiAnUmVsZWFzZXJDb250cm9sbGVyJyxcclxuICAgICAgcmVzb2x2ZToge1xyXG4gICAgICAgIHBvc3RzOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgIHJldHVybiBbXTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pXHJcbiAgICAuc3RhdGUoJ3JlbGVhc2VyRWRpdCcsIHtcclxuICAgICAgdXJsOiAnL2FydGlzdFRvb2xzL3JlbGVhc2VyL2VkaXQvOnJlbGVhc2VJRCcsXHJcbiAgICAgIHRlbXBsYXRlVXJsOiAnanMvYXJ0aXN0VG9vbHMvcmVsZWFzZXIvcmVsZWFzZXIuaHRtbCcsXHJcbiAgICAgIGNvbnRyb2xsZXI6ICdSZWxlYXNlckNvbnRyb2xsZXInLFxyXG4gICAgICByZXNvbHZlOiB7XHJcbiAgICAgICAgcG9zdHM6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgcmV0dXJuIFtdO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSlcclxufSk7XHJcblxyXG5hcHAuY29udHJvbGxlcignUmVsZWFzZXJDb250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHNjb3BlLCBwb3N0cywgU3RvcmFnZUZhY3RvcnksIEJyb2FkY2FzdEZhY3RvcnksICRzdGF0ZSwgU2Vzc2lvblNlcnZpY2UsICRzdGF0ZVBhcmFtcywgJHdpbmRvdywgJGh0dHApIHtcclxuICAkc2NvcGUudXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcclxuICBpZiAoISRzY29wZS51c2VyKSB7XHJcbiAgICAkc3RhdGUuZ28oJ2xvZ2luJyk7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG5cclxuICB2YXIgZGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgJHNjb3BlLmN1cnJlbnREYXRlID0gZGF0ZS50b0lTT1N0cmluZygpLnNsaWNlKDAsIDEwKS5yZXBsYWNlKC8tL2csIFwiLVwiKTtcclxuXHJcbiAgZnVuY3Rpb24gZ2V0RGF5Q2xhc3MoZGF0YSkge1xyXG4gICAgdmFyIGRhdGUgPSBkYXRhLmRhdGUsXHJcbiAgICAgIG1vZGUgPSBkYXRhLm1vZGU7XHJcbiAgICBpZiAobW9kZSA9PT0gJ2RheScpIHtcclxuICAgICAgdmFyIGRheVRvQ2hlY2sgPSBuZXcgRGF0ZShkYXRlKS5zZXRIb3VycygwLCAwLCAwLCAwKTtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkc2NvcGUuZXZlbnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGN1cnJlbnREYXkgPSBuZXcgRGF0ZSgkc2NvcGUuZXZlbnRzW2ldLmRhdGUpLnNldEhvdXJzKDAsIDAsIDAsIDApO1xyXG4gICAgICAgIGlmIChkYXlUb0NoZWNrID09PSBjdXJyZW50RGF5KSB7XHJcbiAgICAgICAgICByZXR1cm4gJHNjb3BlLmV2ZW50c1tpXS5zdGF0dXM7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gJyc7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuaW5saW5lT3B0aW9ucyA9IHtcclxuICAgIGN1c3RvbUNsYXNzOiBnZXREYXlDbGFzcyxcclxuICAgIHNob3dXZWVrczogdHJ1ZVxyXG4gIH07XHJcblxyXG4gICRzY29wZS5kYXRlT3B0aW9ucyA9IHtcclxuICAgIHN0YXJ0aW5nRGF5OiAxXHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLm9wZW4xID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUucG9wdXAxLm9wZW5lZCA9IHRydWU7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLnBvcHVwMSA9IHtcclxuICAgIG9wZW5lZDogZmFsc2VcclxuICB9O1xyXG5cclxuICAkc2NvcGUucG9zdERhdGEgPSB7fTtcclxuICAkc2NvcGUuYXVkaW8gPSB7fTtcclxuICAkc2NvcGUudmlkZW8gPSB7fTtcclxuICAkc2NvcGUuaW1hZ2UgPSB7fTtcclxuICB2YXIgb2xkUG9zdERhdGEgPSB7fTtcclxuICAkc2NvcGUucG9zdHMgPSBwb3N0cztcclxuXHJcbiAgdmFyIGF1ZGlvU2VsZWN0aW9uQ2hhbmdlZCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCRzY29wZS5hdWRpby5maWxlKSB7XHJcbiAgICAgIHJldHVybiAkc2NvcGUuYXVkaW8uZmlsZS5uYW1lICYmIChvbGRQb3N0RGF0YS5hd3NBdWRpb0tleU5hbWUgIT09ICRzY29wZS5hdWRpby5maWxlLm5hbWUpO1xyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHZhciB2aWRlb1NlbGVjdGlvbkNoYW5nZWQgPSBmdW5jdGlvbigpIHtcclxuICAgIGlmICgkc2NvcGUudmlkZW8uZmlsZSkge1xyXG4gICAgICByZXR1cm4gJHNjb3BlLnZpZGVvLmZpbGUubmFtZSAmJiAob2xkUG9zdERhdGEuYXdzVmlkZW9LZXlOYW1lICE9PSAkc2NvcGUudmlkZW8uZmlsZS5uYW1lKTtcclxuICAgIH1cclxuICB9O1xyXG5cclxuICB2YXIgaW1hZ2VTZWxlY3Rpb25DaGFuZ2VkID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoJHNjb3BlLmltYWdlLmZpbGUpIHtcclxuICAgICAgcmV0dXJuICRzY29wZS5pbWFnZS5maWxlLm5hbWUgJiYgKG9sZFBvc3REYXRhLmF3c0ltYWdlS2V5TmFtZSAhPT0gJHNjb3BlLmltYWdlLmZpbGUubmFtZSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLnNhdmVQb3N0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoISRzY29wZS5wb3N0RGF0YS5faWQpIHtcclxuICAgICAgcmV0dXJuIGFkZFBvc3QoKTtcclxuICAgIH1cclxuICAgIC8vIGF1ZGlvICx2aWRlbyBhbmQgaW1hZ2UgYXJlIGJlaW5nIGNoYW5nZWRcclxuICAgIGVsc2UgaWYgKGF1ZGlvU2VsZWN0aW9uQ2hhbmdlZCgpICYmIHZpZGVvU2VsZWN0aW9uQ2hhbmdlZCgpKSB7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgcmV0dXJuIFN0b3JhZ2VGYWN0b3J5LnVwbG9hZEZpbGUoJHNjb3BlLmF1ZGlvLmZpbGUpXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAkc2NvcGUucG9zdERhdGEuYXdzQXVkaW9LZXlOYW1lID0gcmVzLktleTtcclxuICAgICAgICAgIHJldHVybiBTdG9yYWdlRmFjdG9yeS51cGxvYWRGaWxlKCRzY29wZS52aWRlby5maWxlKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgJHNjb3BlLnBvc3REYXRhLmF3c1ZpZGVvS2V5TmFtZSA9IHJlcy5LZXk7XHJcbiAgICAgICAgICByZXR1cm4gU3RvcmFnZUZhY3RvcnkudXBsb2FkRmlsZSgkc2NvcGUuaW1hZ2UuZmlsZSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICRzY29wZS5wb3N0RGF0YS5hd3NJbWFnZUtleU5hbWUgPSByZXMuS2V5O1xyXG4gICAgICAgICAgcmV0dXJuIFN0b3JhZ2VGYWN0b3J5LnVwZGF0ZVBvc3QoJHNjb3BlLnBvc3REYXRhKTtcclxuICAgICAgICAgICRzdGF0ZS5nbygncmVsZWFzZXInKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHBvc3QpIHtcclxuICAgICAgICAgICRzdGF0ZS5yZWxvYWQoKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcikge1xyXG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coZXJyb3IsIHtcclxuICAgICAgICAgICAgd2lkdGg6IDYwMFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvLyBvbmx5IGF1ZGlvIGlzIGJlaW5nIGNoYW5nZWRcclxuICAgIGVsc2UgaWYgKGF1ZGlvU2VsZWN0aW9uQ2hhbmdlZCgpKSB7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgcmV0dXJuIFN0b3JhZ2VGYWN0b3J5LnVwbG9hZEZpbGUoJHNjb3BlLmF1ZGlvLmZpbGUpXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAkc2NvcGUucG9zdERhdGEuYXdzQXVkaW9LZXlOYW1lID0gcmVzLktleTtcclxuICAgICAgICAgIHJldHVybiBTdG9yYWdlRmFjdG9yeS51cGRhdGVQb3N0KCRzY29wZS5wb3N0RGF0YSk7XHJcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZygnVXBkYXRlZCBTdWNjZXNzZnVsbHknKTtcclxuICAgICAgICAgICRzdGF0ZS5nbygncmVsZWFzZXInKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICRzdGF0ZS5yZWxvYWQoKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcikge1xyXG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coZXJyb3IsIHtcclxuICAgICAgICAgICAgd2lkdGg6IDYwMFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICAvLyBvbmx5IHZpZGVvIGlzIGJlaW5nIGNoYW5nZWRcclxuICAgIGVsc2UgaWYgKHZpZGVvU2VsZWN0aW9uQ2hhbmdlZCgpKSB7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgcmV0dXJuIFN0b3JhZ2VGYWN0b3J5LnVwbG9hZEZpbGUoJHNjb3BlLnZpZGVvLmZpbGUpXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAkc2NvcGUucG9zdERhdGEuYXdzVmlkZW9LZXlOYW1lID0gcmVzLktleTtcclxuICAgICAgICAgIHJldHVybiBTdG9yYWdlRmFjdG9yeS51cGRhdGVQb3N0KCRzY29wZS5wb3N0RGF0YSk7XHJcbiAgICAgICAgICAkc3RhdGUuZ28oJ3JlbGVhc2VyJyk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAkc3RhdGUucmVsb2FkKCk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICAgICQuWmVicmFfRGlhbG9nKGVycm9yLCB7XHJcbiAgICAgICAgICAgIHdpZHRoOiA2MDBcclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH0pO1xyXG4gICAgfVxyXG4gICAgLy8gbmVpdGhlciBhdWRpbyBub3IgdmlkZW8gaXMgY2hhbmdpbmdcclxuICAgIGVsc2Uge1xyXG4gICAgICAvLyB2YXIgZXJyTXNnID0gdmFsaWRhdGVGb3JtKCk7XHJcbiAgICAgIC8vIGlmKGVyck1zZyA9PSBcIlwiKXtcclxuICAgICAgcmV0dXJuIFN0b3JhZ2VGYWN0b3J5LnVwZGF0ZVBvc3QoJHNjb3BlLnBvc3REYXRhKVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHBvc3QpIHtcclxuICAgICAgICAgICRzdGF0ZS5nbygncmVsZWFzZXInKTtcclxuICAgICAgICB9KVxyXG4gICAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcikge1xyXG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coZXJyb3IsIHtcclxuICAgICAgICAgICAgd2lkdGg6IDYwMFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSk7XHJcblxyXG4gICAgfVxyXG4gIH07XHJcblxyXG4gIHZhciBhZGRQb3N0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgZXJyTXNnID0gdmFsaWRhdGVGb3JtKCk7XHJcbiAgICBpZiAoZXJyTXNnID09IFwiXCIpIHtcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICAkc2NvcGUucG9zdERhdGEudXNlcklEID0gJHNjb3BlLnVzZXIuX2lkO1xyXG4gICAgICBTdG9yYWdlRmFjdG9yeS51cGxvYWRGaWxlKCRzY29wZS5hdWRpby5maWxlKVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgJHNjb3BlLnBvc3REYXRhLmF3c0F1ZGlvS2V5TmFtZSA9IHJlcy5rZXk7XHJcbiAgICAgICAgICByZXR1cm4gU3RvcmFnZUZhY3RvcnkudXBsb2FkRmlsZSgkc2NvcGUudmlkZW8uZmlsZSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICRzY29wZS5wb3N0RGF0YS5hd3NWaWRlb0tleU5hbWUgPSByZXMua2V5O1xyXG4gICAgICAgICAgcmV0dXJuIFN0b3JhZ2VGYWN0b3J5LnVwbG9hZEZpbGUoJHNjb3BlLmltYWdlLmZpbGUpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAkc2NvcGUucG9zdERhdGEuYXdzSW1hZ2VLZXlOYW1lID0gcmVzLmtleTtcclxuICAgICAgICAgIHJldHVybiBTdG9yYWdlRmFjdG9yeS5hZGRQb3N0KCRzY29wZS5wb3N0RGF0YSk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAkc3RhdGUuZ28oJ3JlbGVhc2VyJyk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZyhlcnJvciwge1xyXG4gICAgICAgICAgICB3aWR0aDogNjAwXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9KTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgICQuWmVicmFfRGlhbG9nKGVyck1zZywge1xyXG4gICAgICAgIHdpZHRoOiA2MDBcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTtcclxuXHJcbiAgdmFyIHZhbGlkYXRlRm9ybSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIGlzU0NQYW5lbE9wZW4gPSAkKFwiI3BubFNvdW5kQ2xvdWRcIikuaGFzQ2xhc3MoXCJpblwiKTtcclxuICAgIHZhciBpc0ZCUGFuZWxPcGVuID0gJChcIiNwbmxGYWNlYm9va1wiKS5oYXNDbGFzcyhcImluXCIpO1xyXG4gICAgdmFyIGlzVFdQYW5lbE9wZW4gPSAkKFwiI3BubFR3aXR0ZXJcIikuaGFzQ2xhc3MoXCJpblwiKTtcclxuICAgIHZhciBpc1lUUGFuZWxPcGVuID0gJChcIiNwbmxZb3V0dWJlXCIpLmhhc0NsYXNzKFwiaW5cIik7XHJcbiAgICB2YXIgbWVzc2FnZSA9IFwiXCI7XHJcbiAgICBpZiAoJHNjb3BlLnBvc3REYXRhLnBvc3RUaXRsZSA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgbWVzc2FnZSArPSBcIlBvc3QgdGl0bGUgaXMgcmVxdWlyZWQuIDxiciAvPlwiO1xyXG4gICAgfVxyXG4gICAgaWYgKCRzY29wZS5wb3N0RGF0YS5wb3N0RGF0ZSA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgbWVzc2FnZSArPSBcIlBvc3QgZGF0ZSBpcyByZXF1aXJlZC4gPGJyIC8+XCI7XHJcbiAgICB9XHJcbiAgICBpZiAoIWlzU0NQYW5lbE9wZW4gJiYgIWlzRkJQYW5lbE9wZW4gJiYgIWlzVFdQYW5lbE9wZW4gJiYgIWlzWVRQYW5lbE9wZW4pIHtcclxuICAgICAgbWVzc2FnZSArPSBcIlBsZWFzZSBlbnRlciBhdGxlYXN0IG9uZSBvZiB0aGUgc29jaWFsIHNpdGUgcG9zdGluZyBpbmZvcm1hdGlvbi4gPGJyIC8+XCI7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAoaXNTQ1BhbmVsT3Blbikge1xyXG4gICAgICAgIGlmICgoJHNjb3BlLnBvc3REYXRhLmF3c0F1ZGlvS2V5TmFtZSA9PSB1bmRlZmluZWQgJiYgJHNjb3BlLmF1ZGlvLmZpbGUgPT0gdW5kZWZpbmVkKSB8fCAkc2NvcGUucG9zdERhdGEuc291bmRDbG91ZFRpdGxlID09IHVuZGVmaW5lZCB8fCAkc2NvcGUucG9zdERhdGEuc291bmRDbG91ZERlc2NyaXB0aW9uID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgbWVzc2FnZSArPSBcIkFsbCBTb3VuZGNsb3VkIHBvc3RpbmcgaW5mb3JtYXRpb25zIGFyZSByZXF1aXJlZC4gPGJyIC8+XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc0ZCUGFuZWxPcGVuKSB7XHJcbiAgICAgICAgaWYgKCRzY29wZS5wb3N0RGF0YS5mYWNlYm9va1Bvc3QgPT0gdW5kZWZpbmVkIHx8ICgkc2NvcGUuZmFjZWJvb2tDb21tZW50T24gPT0gXCJwYWdlXCIgJiYgJHNjb3BlLnBvc3REYXRhLmZhY2Vib29rUGFnZVVybCA9PSB1bmRlZmluZWQpKSB7XHJcbiAgICAgICAgICBtZXNzYWdlICs9IFwiQWxsIEZhY2Vib29rIHBvc3RpbmcgaW5mb3JtYXRpb25zIGFyZSByZXF1aXJlZC4gPGJyIC8+XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGlmIChpc1RXUGFuZWxPcGVuKSB7XHJcbiAgICAgICAgaWYgKCRzY29wZS5wb3N0RGF0YS50d2l0dGVyUG9zdCA9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgIG1lc3NhZ2UgKz0gXCJBbGwgVHdpdHRlciBwb3N0aW5nIGluZm9ybWF0aW9ucyBhcmUgcmVxdWlyZWQuIDxiciAvPlwiO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpZiAoaXNZVFBhbmVsT3Blbikge1xyXG4gICAgICAgIGlmICgoJHNjb3BlLnBvc3REYXRhLmF3c1ZpZGVvS2V5TmFtZSA9PSB1bmRlZmluZWQgJiYgJHNjb3BlLnZpZGVvLmZpbGUgPT0gdW5kZWZpbmVkKSB8fCAkc2NvcGUucG9zdERhdGEueW91VHViZVRpdGxlID09IHVuZGVmaW5lZCB8fCAkc2NvcGUucG9zdERhdGEueW91VHViZURlc2NyaXB0aW9uID09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgbWVzc2FnZSArPSBcIkFsbCBZb3V0dWJlIHBvc3RpbmcgaW5mb3JtYXRpb25zIGFyZSByZXF1aXJlZC4gPGJyIC8+XCI7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICByZXR1cm4gbWVzc2FnZTtcclxuICB9XHJcblxyXG4gICRzY29wZS5kZWxldGVQb3N0ID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgIHZhciBwb3N0SWQgPSAkc2NvcGUucG9zdHNbaW5kZXhdLl9pZDtcclxuICAgIFN0b3JhZ2VGYWN0b3J5LmRlbGV0ZVBvc3QocG9zdElkKVxyXG4gICAgICAudGhlbihmdW5jdGlvbigpIHtcclxuICAgICAgICAkc3RhdGUucmVsb2FkKCk7XHJcbiAgICAgIH0pXHJcbiAgICAgIC5jYXRjaChmdW5jdGlvbihlcnJvcikge1xyXG4gICAgICAgICQuWmVicmFfRGlhbG9nKGVycm9yLCB7XHJcbiAgICAgICAgICB3aWR0aDogNjAwXHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gIH07XHJcblxyXG4gICRzY29wZS5lZGl0UG9zdCA9IGZ1bmN0aW9uKHBvc3QpIHtcclxuICAgICRzY29wZS5wb3N0RGF0YSA9IHBvc3Q7XHJcbiAgICBvbGRQb3N0RGF0YSA9IHBvc3Q7XHJcbiAgfTtcclxuXHJcbiAgJHNjb3BlLmdldFBvc3QgPSBmdW5jdGlvbigpIHtcclxuICAgICRzY29wZS5wb3N0cyA9IFtdO1xyXG4gICAgU3RvcmFnZUZhY3RvcnkuZmV0Y2hBbGwoKS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAkc2NvcGUucG9zdHMgPSByZXM7XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgLyogTWV0aG9kIGZvciBnZXR0aW5nIHBvc3QgaW4gY2FzZSBvZiBlZGl0ICovXHJcbiAgJHNjb3BlLmdldFBvc3RJbmZvID0gZnVuY3Rpb24ocmVsZWFzZUlEKSB7XHJcbiAgICAkc2NvcGUucGFnZWNvbW1lbnQgPSBmYWxzZTtcclxuICAgIFN0b3JhZ2VGYWN0b3J5XHJcbiAgICAgIC5nZXRQb3N0Rm9yRWRpdCh7XHJcbiAgICAgICAgaWQ6IHJlbGVhc2VJRFxyXG4gICAgICB9KVxyXG4gICAgICAudGhlbihoYW5kbGVSZXNwb25zZSlcclxuICAgICAgLmNhdGNoKGhhbmRsZUVycm9yKTtcclxuXHJcbiAgICBmdW5jdGlvbiBoYW5kbGVSZXNwb25zZShyZXMpIHtcclxuICAgICAgJHNjb3BlLnBvc3REYXRhID0gcmVzO1xyXG4gICAgICBvbGRQb3N0RGF0YSA9IHJlcztcclxuICAgICAgaWYgKCRzY29wZS5wb3N0RGF0YS5mYWNlYm9va1BhZ2VVcmwpIHtcclxuICAgICAgICAkc2NvcGUucGFnZWNvbW1lbnQgPSB0cnVlO1xyXG4gICAgICAgICRzY29wZS5mYWNlYm9va0NvbW1lbnRPbiA9IFwicGFnZVwiO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgICRzY29wZS5mYWNlYm9va0NvbW1lbnRPbiA9IFwidXNlclwiO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgZnVuY3Rpb24gaGFuZGxlRXJyb3IocmVzKSB7XHJcblxyXG4gICAgfVxyXG4gICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICB9O1xyXG4gICRzY29wZS5jaGVja0lmRWRpdCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgaWYgKCRzdGF0ZVBhcmFtcy5yZWxlYXNlSUQpIHtcclxuICAgICAgJHNjb3BlLmdldFBvc3RJbmZvKCRzdGF0ZVBhcmFtcy5yZWxlYXNlSUQpO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgJHNjb3BlLmJyb2FkY2FzdFBvc3QgPSBmdW5jdGlvbihwb3N0KSB7XHJcbiAgICB2YXIgaXNWYWxpZCA9IHRydWU7XHJcbiAgICB2YXIgbWVzc2FnZSA9IFwiSXQgc2VlbXMgeW91IGRpZCBub3QgYXV0aGVudGljYXRlIHRvIHRoZSBzb2NpYWwgc2l0ZXMgYmVmb3JlIHJlbGVhc2luZyB0aGUgcG9zdC4gV2UgZGlkIG5vdCBmb3VuZCBmb2xsb3dpbiBtaXNzaW5nIHRva2VucyAtIDxiciAvPlwiO1xyXG4gICAgaWYgKHBvc3QuZmFjZWJvb2tQb3N0ICE9IFwiXCIgJiYgISRzY29wZS51c2VyLmZhY2Vib29rICYmICEkc2NvcGUudXNlci5mYWNlYm9vay50b2tlbikge1xyXG4gICAgICBpc1ZhbGlkID0gZmFsc2U7XHJcbiAgICAgIG1lc3NhZ2UgKz0gXCJGYWNlYm9vayB0b2tlbiBpcyBtaXNzaW5nLiA8YnIgLz5cIjtcclxuICAgIH1cclxuXHJcbiAgICBpZiAocG9zdC50d2l0dGVyUG9zdCAhPSBcIlwiICYmICEkc2NvcGUudXNlci50d2l0dGVyICYmICEkc2NvcGUudXNlci50d2l0dGVyLnRva2VuKSB7XHJcbiAgICAgIGlzVmFsaWQgPSBmYWxzZTtcclxuICAgICAgbWVzc2FnZSArPSBcIlR3aXR0ZXIgdG9rZW4gaXMgbWlzc2luZy4gPGJyIC8+XCI7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHBvc3QuYXdzVmlkZW9LZXlOYW1lICE9IFwiXCIgJiYgISRzY29wZS51c2VyLmdvb2dsZSAmJiAhJHNjb3BlLnVzZXIuZ29vZ2xlLnRva2VuKSB7XHJcbiAgICAgIGlzVmFsaWQgPSBmYWxzZTtcclxuICAgICAgbWVzc2FnZSArPSBcIkdvb2dsZSB0b2tlbiBpcyBtaXNzaW5nLiA8YnIgLz5cIjtcclxuICAgIH1cclxuICAgIG1lc3NhZ2UgKz0gXCJQbGVhc2UgdXNlIHRoZSBsaW5rcyB0byBiZWxvdyBBZGQgTmV3IFBvc3QgYnV0dG9uIHRvIGdldCB0aGUgc29jaWFsIHNpdGUgYXV0aCB0b2tlbnMuXCI7XHJcblxyXG4gICAgaWYgKGlzVmFsaWQpIHtcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSB0cnVlO1xyXG4gICAgICBCcm9hZGNhc3RGYWN0b3J5W3Bvc3QuZmFjZWJvb2tQYWdlVXJsID8gJ3N1Ym1pdEZhY2Vib29rUGFnZVBvc3QnIDogJ3N1Ym1pdEZhY2Vib29rVXNlclBvc3QnXShwb3N0Ll9pZCwge1xyXG4gICAgICAgICAgdG9rZW46ICRzY29wZS51c2VyLmZhY2Vib29rLnRva2VuLFxyXG4gICAgICAgICAgZmFjZWJvb2tQb3N0OiBwb3N0LmZhY2Vib29rUG9zdCxcclxuICAgICAgICAgIGZhY2Vib29rUGFnZVVybDogcG9zdC5mYWNlYm9va1BhZ2VVcmwsXHJcbiAgICAgICAgICBmYWNlYm9va1BhZ2VJbmZvOiBwb3N0LmZhY2Vib29rUGFnZUluZm9cclxuICAgICAgICB9KVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgaWYgKCRzY29wZS51c2VyLnR3aXR0ZXIudG9rZW4pIHtcclxuICAgICAgICAgICAgQnJvYWRjYXN0RmFjdG9yeS5zdWJtaXRUd2l0dGVyUG9zdChwb3N0Ll9pZCwge1xyXG4gICAgICAgICAgICAgIHRva2VuOiAkc2NvcGUudXNlci50d2l0dGVyLnRva2VuLFxyXG4gICAgICAgICAgICAgIHRva2VuU2VjcmV0OiAkc2NvcGUudXNlci50d2l0dGVyLnRva2VuU2VjcmV0LFxyXG4gICAgICAgICAgICAgIHR3aXR0ZXJQb3N0OiBwb3N0LnR3aXR0ZXJQb3N0XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICBpZiAoJHNjb3BlLnVzZXIuZ29vZ2xlLnRva2VuKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBCcm9hZGNhc3RGYWN0b3J5LnN1Ym1pdFlvdVR1YmVQb3N0KHBvc3QuX2lkLCB7XHJcbiAgICAgICAgICAgICAgdG9rZW46ICRzY29wZS51c2VyLmdvb2dsZS50b2tlbixcclxuICAgICAgICAgICAgICBhd3NWaWRlb0tleU5hbWU6IHBvc3QuYXdzVmlkZW9LZXlOYW1lXHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICByZXR1cm4gQnJvYWRjYXN0RmFjdG9yeS5zdWJtaXRTb3VuZENsb3VkUG9zdChwb3N0Ll9pZCwge1xyXG4gICAgICAgICAgICBhd3NBdWRpb0tleU5hbWU6IHBvc3QuYXdzQXVkaW9LZXlOYW1lXHJcbiAgICAgICAgICB9KVxyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICBpZiAocG9zdC5hd3NBdWRpb0tleU5hbWUpIHtcclxuICAgICAgICAgICAgU0MuaW5pdGlhbGl6ZSh7XHJcbiAgICAgICAgICAgICAgY2xpZW50X2lkOiAnODAwMmYwZjgzMjZkODY5NjY4NTIzZDhlNDVhNTNiOTAnLFxyXG4gICAgICAgICAgICAgIG9hdXRoX3Rva2VuOiAkc2NvcGUudXNlci5zb3VuZGNsb3VkLnRva2VuXHJcbiAgICAgICAgICAgIH0pO1xyXG5cclxuICAgICAgICAgICAgdmFyIHRyYWNrRmlsZSA9IG5ldyBGaWxlKHJlcy5kYXRhLkJvZHkuZGF0YSwgcG9zdC5hd3NBdWRpb0tleU5hbWUsIHtcclxuICAgICAgICAgICAgICB0eXBlOiAnYXVkaW8vbXAzJ1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgU0MudXBsb2FkKHtcclxuICAgICAgICAgICAgICAgIGZpbGU6IHRyYWNrRmlsZSxcclxuICAgICAgICAgICAgICAgIHRpdGxlOiBwb3N0LnNvdW5kQ2xvdWRUaXRsZSxcclxuICAgICAgICAgICAgICAgIGRlc2NyaXB0aW9uOiBwb3N0LnNvdW5kQ2xvdWREZXNjcmlwdGlvblxyXG4gICAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgICBTdG9yYWdlRmFjdG9yeS51cGRhdGVSZWxlYXNlU3RhdHVzKHBvc3QpXHJcbiAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5nZXRQb3N0KCk7XHJcbiAgICAgICAgICAgICAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgICAuY2F0Y2goZnVuY3Rpb24oZXJyb3IpIHtcclxuICAgICAgICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnZXJyb3InLCBlcnJvcik7XHJcbiAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XHJcbiAgICAgICAgfSkuXHJcbiAgICAgIHRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgaWYgKHBvc3QuYXdzSW1hZ2VLZXlOYW1lKSB7XHJcbiAgICAgICAgICByZXR1cm4gQnJvYWRjYXN0RmFjdG9yeS5zdWJtaXRJbnN0YWdyYW1Qb3N0KHBvc3QuX2lkLCB7XHJcbiAgICAgICAgICAgIHRva2VuOiAkc2NvcGUudXNlci5pbnN0YWdyYW0udG9rZW4sXHJcbiAgICAgICAgICAgIGluc3RhZ3JhbVBvc3Q6IHBvc3QuaW5zdGFncmFtUG9zdFxyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIFN0b3JhZ2VGYWN0b3J5LnVwZGF0ZVJlbGVhc2VTdGF0dXMocG9zdClcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLmdldFBvc3QoKTtcclxuICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgJC5aZWJyYV9EaWFsb2cobWVzc2FnZSwge1xyXG4gICAgICAgIHdpZHRoOiA2MDBcclxuICAgICAgfSk7XHJcbiAgICB9XHJcbiAgfTsgLy8gQ0xPU0VTICRzY29wZS5icm9hZGNhc3RQb3N0XHJcblxyXG4gICRzY29wZS5zb2NpYWxMb2dpbiA9IGZ1bmN0aW9uKHVybCkge1xyXG4gICAgJHdpbmRvdy5sb2NhdGlvbiA9IHVybDtcclxuICB9O1xyXG5cclxuICAkc2NvcGUuY2hlY2tGQlRva2VuID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoJHNjb3BlLnVzZXIuZmFjZWJvb2sgJiYgJHNjb3BlLnVzZXIuZmFjZWJvb2sudG9rZW4gIT0gXCJcIikge1xyXG4gICAgICBTdG9yYWdlRmFjdG9yeS52YWxpZGF0ZVRva2VuKCRzY29wZS51c2VyLl9pZCwgJ2ZhY2Vib29rJykudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICBpZiAocmVzKSB7XHJcbiAgICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUocmVzLmRhdGEpO1xyXG4gICAgICAgICAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gICRzY29wZS5jaGVja0dvb2dsZVRva2VuID0gZnVuY3Rpb24oKSB7XHJcbiAgICBpZiAoJHNjb3BlLnVzZXIuZ29vZ2xlICYmICRzY29wZS51c2VyLmdvb2dsZS50b2tlbiAhPSBcIlwiKSB7XHJcbiAgICAgIFN0b3JhZ2VGYWN0b3J5LnZhbGlkYXRlVG9rZW4oJHNjb3BlLnVzZXIuX2lkLCAnZ29vZ2xlJykudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICBpZiAocmVzKSB7XHJcbiAgICAgICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUocmVzLmRhdGEpO1xyXG4gICAgICAgICAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuICB9XHJcblxyXG5cclxuICAkc2NvcGUuZ2V0VXNlck5ldHdvcmsoKTtcclxuICAvLyRzY29wZS5jaGVja0ZCVG9rZW4oKTtcclxuICAvLyRzY29wZS5jaGVja0dvb2dsZVRva2VuKCk7XHJcbn0pOyAvLyBDTE9TRVMgYXBwLmNvbnRyb2xsZXIiXSwiZmlsZSI6ImFydGlzdFRvb2xzL3JlbGVhc2VyL3JlbGVhc2VyLmpzIn0=
