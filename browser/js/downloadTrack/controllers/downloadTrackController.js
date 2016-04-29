app.config(function ($stateProvider) {
    $stateProvider.state('download', {
        url: '/download',
        templateUrl: 'js/downloadTrack/views/downloadTrack.view.html',
        controller: 'DownloadTrackController'
    });
});

app.controller('DownloadTrackController', ['$rootScope',
    '$state',
    '$scope',
    '$http',
    '$location',
    '$window',
    '$q',
    'DownloadTrackService',
    function ($rootScope, $state, $scope, $http, $location, $window, $q, DownloadTrackService) {

        /* Normal JS vars and functions not bound to scope */
        var playerObj = null;

        /* $scope bindings start */

        $scope.trackData = {
            trackName: 'Mixing and Mastering',
            userName: 'la tropical'
        };
        $scope.toggle = true;
        $scope.togglePlay = function () {
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

        /* Default processing on page load */

        $scope.getDownloadTrack = function () {

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
                console.log($scope.track);
                $scope.backgroundStyle = function () {
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
                alert('Song Not Found');
                $scope.processing = false;
                $scope.embedTrack = false;
            }
        };


        /* On click download track button */

        $scope.downloadTrack = function () {
            if ($scope.track.comment && !$scope.track.commentText) {
                alert('Please write a comment!');
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
                alert('Error in processing your request');
                $scope.processing = false;
                $scope.$apply();
            }

        };

        $scope.downloadTrackFacebookShare = function (shareURL)
        {
            FB.ui({
                method: 'share',
                href: shareURL
            }, function (response)
            {
                console.log(response);
                if (response && !response.error_code)
                {
                    console.log("OK: " + JSON.stringify(response));

                    if ($scope.track.downloadURL && $scope.track.downloadURL !== '')
                    {
                        $window.location.href = $scope.track.downloadURL;
                    }
                    else
                    {
                        $scope.errorText = 'Error! Could not fetch download URL';
                        $scope.downloadURLNotFound = true;
                    }
                    $scope.$apply();
                }
                else if (response && response.error_code === 4201)
                {
                    console.log("User cancelled: " + decodeURIComponent(response.error_message));
                }
                else
                {
                    console.log("Not OK: " + JSON.stringify(response));
                    alert("You have cancelled sharing on facebook.");
                }
            });
        }

        $scope.downloadTrackFacebookLike = function (likePage)
        {
            /********* Share Facebook API *********/
//            var facebookShare = window.open('http://www.facebook.com/plugins/like.php?href=http://www.facebook.com/'+likePage+"&amp;layout=standard&amp;show_faces=false&amp;width=450&amp;action=like&amp;colorscheme=light&amp;",'facebookShare', 'menubar=no,toolbar=no,resizable=yes,scrollbars=yes,height=300,width=650');
//            
//            window.setTimeout(function() {
//                facebookShare.addEventListener("message", function(e)
//                {
//                    alert("a");
//                    console.log(e);
//                    console.log("received load event");
//                }, false);
//            }, 0);
            alert("asdas");
            twttr.widgets.createShareButton(
                    'https://dev.twitter.com/',
                    angular.element('container'),
                    {
                        text: 'Hello World'
                    }
            );
            window.twttr = (function (d, s, id) {
                var js, fjs = d.getElementsByTagName(s)[0],
                        t = window.twttr || {};
                if (d.getElementById(id))
                    return t;
                js = d.createElement(s);
                js.id = id;
                js.src = "https://platform.twitter.com/widgets.js";
                fjs.parentNode.insertBefore(js, fjs);

                t._e = [];
                t.ready = function (f) {
                    t._e.push(f);
                };

                return t;
            }(document, "script", "twitter-wjs"));


            /********* Like Facebook API *********/

//            (function (d, s, id) {
//                var js, fjs = d.getElementsByTagName(s)[0];
//                if (d.getElementById(id))
//                    return;
//                js = d.createElement(s);
//                js.id = id;
//                js.src = "//connect.facebook.net/en_GB/sdk.js#xfbml=1&version=v2.6&appId=1719978144956959";
//                fjs.parentNode.insertBefore(js, fjs);
//            }(document, 'script', 'facebook-jssdk'));


//            twttr.events.bind('tweet', function (event) {
//                alert('tweet complete');
//                // Do something there
//            });
//
//            twttr.events.bind('click', function (event) {
//                alert('clicked');
//                // Do something there
//            });
//
//            twttr.events.bind(
//                      'follow',
//                      function (event) {
//                            console.log(event);
//                      }
//            );

            return false;
        }

    }
]);