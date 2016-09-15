app.config(function($stateProvider, $authProvider, $httpProvider) {
    $stateProvider.state('download', {
        url: '/download',
        templateUrl: 'js/downloadTrack/views/downloadTrack.view.html',
        controller: 'DownloadTrackController'
    });

    $authProvider.instagram({
        clientId: '0b2ab47baa464c31bf6d8e9f301d4469'
    });

    // Instagram
    $authProvider.instagram({
        name: 'instagram',
        url: '/api/download/auth/instagram',
        authorizationEndpoint: 'https://api.instagram.com/oauth/authorize',
        redirectUri: 'https://localhost:1443/download',
        requiredUrlParams: ['scope'],
        scope: ['basic', 'relationships', 'public_content', 'follower_list'],
        scopeDelimiter: '+',
        type: '2.0'
    });

    $authProvider.twitter({
        url: '/api/download/twitter/auth',
        authorizationEndpoint: 'https://api.twitter.com/oauth/authenticate',
        redirectUri: 'https://artistsunlimited.co/download', //must match website
        type: '1.0',
        popupOptions: {
            width: 495,
            height: 645
        }
    });
})


app.controller('DownloadTrackController', ['$rootScope',
    '$state',
    '$scope',
    '$http',
    '$location',
    '$window',
    '$q',
    'DownloadTrackService',
    '$sce',
    '$auth',
    'SessionService',
    function($rootScope, $state, $scope, $http, $location, $window, $q, DownloadTrackService, $sce, $auth, SessionService) {
        $scope.user = SessionService.getUser();
        /* Normal JS vars and functions not bound to scope */
        var playerObj = null;

        /* $scope bindings start */
        $scope.trackData = {
            trackName: 'Mixing and Mastering',
            userName: 'la tropical'
        };
        $scope.toggle = true;
        $scope.togglePlay = function() {
            $scope.toggle = !$scope.toggle;
            if ($scope.toggle) {
                playerObj.pause();
            } else {
                playerObj.play();
            }
        }
        $scope.processing = false;
        $scope.embedTrack = false;
        $scope.downloadURLNotFound = false;
        $scope.errorText = '';
        $scope.followBoxImageUrl = 'assets/images/who-we-are.png';
        $scope.recentTracks = [];

        $scope.initiateDownload = function() {
            $scope.processing = false;
            if ($scope.track.downloadURL && $scope.track.downloadURL !== '') {
                $window.location.href = $scope.track.downloadURL;
            } else {
                $scope.errorText = 'Error! Could not fetch download URL';
                $scope.downloadURLNotFound = true;
            }
        }

        /* Function for Instagram */
        $scope.authenticateInstagram = function() {
            $auth.authenticate('instagram').then(function(response) {
                var userName = $scope.track.socialPlatformValue;
                $http({
                    method: "POST",
                    url: '/api/download/instagram/follow_user',
                    data: {
                        'access_token': response.data,
                        'q': userName
                    }
                }).then(function(user) {
                    if (user.data.succ) {
                        $scope.initiateDownload();
                    }
                });
            });
        }

        /* Function for Twitter */
        $scope.authenticateTwitter = function() {
            $auth.authenticate('twitter').then(function(response) {
                var userName = $scope.track.socialPlatformValue;
                if ($scope.track.socialPlatform == 'twitterFollow') {
                    $http({
                        method: "POST",
                        url: '/api/download/twitter/follow',
                        data: {
                            screen_name: userName,
                            accessToken: response.data,
                            trackID: $scope.track._id
                        }
                    }).then(function(records) {
                        if (records.data && records.statusText === "OK") {
                            if (records.data.screen_name === $scope.track.socialPlatformValue) {
                                window.location.replace($scope.track.downloadURL);
                            }
                        } else {
                            $.Zebra_Dialog('Error in processing the request. Please try again.');
                        }
                    });
                } else if ($scope.track.socialPlatform == 'twitterPost') {
                    response.data.socialPlatformValue = $scope.track.socialPlatformValue;
                    $http({
                        method: "POST",
                        url: '/api/download/twitter/post',
                        data: {
                            data: response.data,
                            trackID: $scope.track._id
                        }
                    }).then(function(records) {
                        if (records.statusText === "OK") {
                            window.location.replace($scope.track.downloadURL);
                        } else {
                            $.Zebra_Dialog('Error in processing the request. Please try again.');
                        }
                    });
                }
            });
        }

        /* Function for Youtube */
        $scope.authenticateYoutube = function(track) {
            $scope.processing = true;
            var totalArray = [];
            if ($scope.track.socialPlatformValue) {

                $scope.track.youtube = [];
                if ($scope.track.socialPlatformValue.indexOf(',') > -1) {
                    var urls = $scope.track.socialPlatformValue.split(',');
                    for (var i = 0; i < urls.length; i++) {
                        totalArray.push(urls[i]);
                    }
                } else {
                    totalArray.push($scope.track.socialPlatformValue);
                }

                //var totalArray = [$scope.track.socialPlatformValue, "https://www.youtube.com/channel/UCbfKEQZZzHN0egYXinbb7jg", "https://www.youtube.com/channel/UCvQyEDsKwJoJLKXeCvY2OfQ", "https://www.youtube.com/channel/UCcqpdWD_k3xM4AOjvs-FitQ", "https://www.youtube.com/channel/UCbA0xiM4E5Sbf1WMmhTGOOg", "https://www.youtube.com/channel/UC2HG82SETkcx8pOE75bYJ6g"]
                var promiseArr = [];
                totalArray.forEach(function(url) {
                    var idPromise = new Promise(function(resolve, reject) {
                        if (url.includes('/channel/')) {
                            resolve(url.substring(url.indexOf('/channel/') + 9, url.length));
                        } else {
                            var username = url.substring(url.indexOf('/user/') + 6, url.length)
                            var idArray = [];
                            $http.get('https://www.googleapis.com/youtube/v3/channels?key=AIzaSyBOuRHx25VQ69MrTEcvn-hIdkZ8NsZwsLw&forUsername=' + username + '&part=id')
                                .then(function(res) {
                                    if (res.data.items[0]) resolve(res.data.items[0].id);
                                })
                                .then(null, reject);
                        }
                    });
                    promiseArr.push(idPromise);
                })
                Promise.all(promiseArr)
                    // <<<<<<< HEAD
                    .then(function(idArray) {
                        console.log(idArray);
                        console.log($scope.track.downloadURL);
                        return $http({
                            method: "GET",
                            url: '/api/download/subscribe',
                            params: {
                                downloadURL: $scope.track.downloadURL,
                                channelIDS: idArray,
                                trackID: $scope.track._id
                            }
                        })
                    })
                    .then(function(response) {
                        $scope.processing = false;
                        window.open(response.data.url, '_self')
                        window.focus()
                    })
                    .then(null, function() {
                        $scope.processing = false;
                        $.Zebra_Dialog('Youtube channel to subscribe to not found');
                        // =======
                        //             .then(function(idArray) {
                        //                 return $http({
                        //                     method: "GET",
                        //                     url: '/api/download/subscribe',
                        //                     params: {
                        //                         downloadURL: $scope.track.downloadURL,
                        //                         channelIDS: idArray,
                        //                         trackID: $scope.track._id
                        //                     }
                        // >>>>>>> linkites-dev
                    })
            }
        }

        /* Default processing on page load */
        $scope.getDownloadTrack = function() {
            $scope.processing = true;
            var trackID = $location.search().trackid;
            DownloadTrackService
                .getDownloadTrack(trackID)
                .then(receiveDownloadTrack)
                .then(receiveRecentTracks)
                .then(initPlay)
                .catch(catchDownloadTrackError);

            function receiveDownloadTrack(result) {
                $scope.track = result.data;
                $scope.backgroundStyle = function() {
                    return {
                        'background-image': 'url(' + $scope.track.trackArtworkURL + ')',
                        'background-repeat': 'no-repeat',
                        'background-size': 'cover'
                    }
                }

                $scope.embedTrack = true;
                $scope.processing = false;

                if ($scope.track.showDownloadTracks === 'user') {
                    return DownloadTrackService.getRecentTracks({
                        userID: $scope.track.userid,
                        trackID: $scope.track._id
                    });
                } else {
                    return $q.resolve('resolve');
                }
            }

            function receiveRecentTracks(res) {
                if ((typeof res === 'object') && res.data) {
                    $scope.recentTracks = res.data;
                }
                return SC.stream('/tracks/' + $scope.track.trackID);
            }

            function initPlay(player) {
                playerObj = player;
            }

            function catchDownloadTrackError() {
                $.Zebra_Dialog('Song Not Found');
                $scope.processing = false;
                $scope.embedTrack = false;
            }
        };

        /* On click download track button */
        $scope.authenticateSoundcloud = function() {
            if ($scope.track.comment && !$scope.track.commentText) {
                $.Zebra_Dialog('Please write a comment!');
                return false;
            }
            $scope.processing = true;
            $scope.errorText = '';

            SC.connect()
                .then(performTasks)
                .then(initDownload)
                .catch(catchTasksError)

            function performTasks(res) {
                $scope.track.token = res.oauth_token;
                return DownloadTrackService.performTasks($scope.track);
            }

            function initDownload(res) {
                $scope.processing = false;
                if ($scope.track.downloadURL && $scope.track.downloadURL !== '') {
                    $window.location.href = $scope.track.downloadURL;
                } else {
                    $scope.errorText = 'Error! Could not fetch download URL';
                    $scope.downloadURLNotFound = true;
                }
                $scope.$apply();
            }

            function catchTasksError(err) {
                $.Zebra_Dialog('Error in processing your request');
                $scope.processing = false;
                $scope.$apply();
            }
        };

        $scope.downloadTrackFacebookShare = function(shareURL) {
            window.fbAsyncInit = function() {
                FB.init({
                    appId: '1576897469267996',
                    xfbml: true,
                    version: 'v2.6'
                });
                FB.ui({
                    method: 'share',
                    href: shareURL
                }, function(response) {
                    if (response && !response.error_code) {
                        if ($scope.track.downloadURL && $scope.track.downloadURL !== '') {
                            $window.location.href = $scope.track.downloadURL;
                        } else {
                            $scope.errorText = 'Error! Could not fetch download URL';
                            $scope.downloadURLNotFound = true;
                        }
                        $scope.$apply();
                    } else if (response && response.error_code === 4201) {
                        console.log("User cancelled: " + decodeURIComponent(response.error_message));
                    } else {
                        console.log("Not OK: " + JSON.stringify(response));
                        alert("You have cancelled sharing on facebook.");
                    }
                });
            };

            (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) {
                    return;
                }
                js = d.createElement(s);
                js.id = id;
                js.src = "//connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
        }

        $scope.downloadTrackFacebookLike = function(fblikeid) {
            window.fbAsyncInit = function() {
                FB.init({
                    appId: '1576897469267996',
                    xfbml: true,
                    version: 'v2.6'
                });
                FB.Event.subscribe('edge.create', function(href, widget) {
                    window.location = fblikeid.downloadURL;
                });
            };
            (function(d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0];
                if (d.getElementById(id)) {
                    return;
                }
                js = d.createElement(s);
                js.id = id;
                js.src = "//connect.facebook.net/en_US/sdk.js";
                fjs.parentNode.insertBefore(js, fjs);
            }(document, 'script', 'facebook-jssdk'));
        };
    }
]);