app.config(function($stateProvider) {
    $stateProvider
        .state('artistToolsDownloadGatewayEdit', {
            url: '/download-gateway/edit/:gatewayID',
            templateUrl: 'js/artistTools/downloadGateway/downloadGateway.html',
            controller: 'ArtistToolsDownloadGatewayController'
        })
        .state('artistToolsDownloadGatewayNew', {
            url: '/download-gateway/new',
            params: {
                submission: null
            },
            templateUrl: 'js/artistTools/downloadGateway/downloadGateway.html',
            controller: 'ArtistToolsDownloadGatewayController'
        })
});

app.controller('ArtistToolsDownloadGatewayController', function($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, SessionService, ArtistToolsService) {
    /* Init Download Gateway form data */
    $scope.user = JSON.parse(SessionService.getUser());
    $scope.showTitle = [];
    $scope.track = {
        artistUsername: '',
        trackTitle: '',
        trackArtworkURL: '',
        SMLinks: [],
        like: false,
        comment: false,
        repost: false,
        artists: [],
        showDownloadTracks: 'user',
        admin: $scope.user.admin,
        file: {}
    };
    $scope.profile = {};
    /* Init track list and trackListObj*/
    $scope.trackList = [];
    $scope.trackListObj = null;

    /* Method for resetting Download Gateway form */

    $scope.trackListChange = function(index) {

        /* Set booleans */

        $scope.isTrackAvailable = false;
        $scope.processing = true;

        /* Set track data */

        var track = $scope.trackListObj;
        $scope.track.trackURL = track.permalink_url;
        $scope.track.trackTitle = track.title;
        $scope.track.trackID = track.id;
        $scope.track.artistID = track.user.id;
        $scope.track.description = track.description;
        $scope.track.trackArtworkURL = track.artwork_url ? track.artwork_url.replace('large.jpg', 't500x500.jpg') : '';
        $scope.track.artistArtworkURL = track.user.avatar_url ? track.user.avatar_url : '';
        $scope.track.artistURL = track.user.permalink_url;
        $scope.track.artistUsername = track.user.username;
        $scope.track.SMLinks = [];

        SC.get('/users/' + $scope.track.artistID + '/web-profiles')
            .then(handleWebProfiles)
            .catch(handleError);

        function handleWebProfiles(profiles) {
            profiles.forEach(function(prof) {
                if (['twitter', 'youtube', 'facebook', 'spotify', 'soundcloud', 'instagram'].indexOf(prof.service) != -1) {
                    $scope.track.SMLinks.push({
                        key: prof.service,
                        value: prof.url
                    });
                }
            });
            $scope.isTrackAvailable = true;
            $scope.processing = false;
            $scope.$apply();
        }

        function handleError(err) {
            $scope.track.trackID = null;
            $.Zebra_Dialog('Song not found or forbidden');
            $scope.processing = false;
            $scope.$apply();
        }
    };

    $scope.removeSMLink = function(index) {
        $scope.track.SMLinks.splice(index, 1);
    };

    $scope.saveDownloadGate = function() {
        if (!($scope.track.downloadURL || ($scope.track.file && $scope.track.file.name))) {
            $.Zebra_Dialog('Enter a download file');
            return false;
        }

        if (!$scope.track.trackID) {
            $.Zebra_Dialog('Track Not Found');
            return false;
        }
        $scope.processing = true;
        var sendObj = new FormData();
        for (var prop in $scope.track) {
            sendObj.append(prop, $scope.track[prop]);
        }
        var artists = $scope.track.artists.filter(function(item) {
            return item.id !== -1;
        }).map(function(item) {
            delete item['$$hashKey'];
            return item;
        })
        sendObj.append('artists', JSON.stringify(artists));
        var SMLinks = {};
        $scope.track.SMLinks.forEach(function(item) {
            SMLinks[item.key] = item.value;
        });
        sendObj.append('SMLinks', JSON.stringify(SMLinks));
        if ($scope.track.playlists) {
            sendObj.append('playlists', JSON.stringify($scope.track.playlists));
        }

        var options = {
            method: 'POST',
            url: '/api/database/downloadurl',
            headers: {
                'Content-Type': undefined
            },
            transformRequest: angular.identity,
            data: sendObj
        };
        $http(options)
            .then(function(res) {
                $scope.processing = false;
                if ($stateParams.submission) {
                    $state.go('artistToolsDownloadGatewayList', {
                        'submission': $stateParams.submission
                    });
                } else {
                    if ($scope.user.soundcloud.id == $scope.track.artistID) {
                        $.Zebra_Dialog('Download gateway was saved and added to the track.');
                    } else {
                        $.Zebra_Dialog('Download gateway saved.');
                    }
                    $state.go('artistToolsDownloadGatewayList');
                }
            })
            .then(null, function(err) {
                $scope.processing = false;
                $.Zebra_Dialog("ERROR: Error in saving url");
                $scope.processing = false;
            });
    };


    $scope.checkIfEdit = function() {
        if ($stateParams.gatewayID) {
            $scope.getDownloadGateway($stateParams.gatewayID);
        }
    };

    $scope.getTrackListFromSoundcloud = function() {
        var profile = JSON.parse(SessionService.getUser());
        if (profile.soundcloud) {
            $scope.processing = true;
            SC.get('/users/' + profile.soundcloud.id + '/tracks')
                .then(function(tracks) {
                    $scope.trackList = tracks;
                    $scope.processing = false;
                    $scope.$apply();
                })
                .catch(function(response) {
                    $scope.processing = false;
                    $scope.$apply();
                });
        }
    }

    $scope.checkIfSubmission = function() {
        if ($stateParams.submission) {
            if ($state.includes('artistToolsDownloadGatewayNew')) {
                $scope.track.trackURL = $rootScope.submission.trackURL;
                $scope.trackURLChange();
                return;
            }

            $scope.openThankYouModal.thankYou($stateParams.submission._id);
            $rootScope.submission = null;
        }
    }

    $scope.trackURLChange = function() {
        if ($scope.track.trackURL !== '') {
            $scope.isTrackAvailable = false;
            $scope.processing = true;
            ArtistToolsService.resolveData({
                url: $scope.track.trackURL
            }).then(handleTrackDataAndGetProfiles).then(handleWebProfiles).catch(handleError);

            function handleTrackDataAndGetProfiles(res) {
                $scope.track.trackTitle = res.data.title;
                $scope.track.trackID = res.data.id;
                $scope.track.artistID = res.data.user.id;
                $scope.track.description = res.data.description;
                $scope.track.trackArtworkURL = res.data.artwork_url ? res.data.artwork_url.replace('large.jpg', 't500x500.jpg') : '';
                $scope.track.artistArtworkURL = res.data.user.avatar_url ? res.data.user.avatar_url.replace('large.jpg', 't500x500.jpg') : '';
                $scope.track.artistURL = res.data.user.permalink_url;
                $scope.track.artistUsername = res.data.user.username;
                $scope.track.SMLinks = [];
                return SC.get('/users/' + $scope.track.artistID + '/web-profiles');
            }

            function handleWebProfiles(profiles) {
                profiles.forEach(function(prof) {
                    if (['twitter', 'youtube', 'facebook', 'spotify', 'soundcloud', 'instagram'].indexOf(prof.service) != -1) {
                        $scope.track.SMLinks.push({
                            key: prof.service,
                            value: prof.url
                        });
                    }
                });

                $scope.isTrackAvailable = true;
                $scope.processing = false;
            }

            function handleError(err) {
                $scope.track.trackID = null;
                $.Zebra_Dialog('Song not found or forbidden');
                $scope.processing = false;
            }
        }
    }

    $scope.SMLinkChange = function(index) {
        function getLocation(href) {
            var location = document.createElement("a");
            location.href = href;
            if (location.host == "") {
                location.href = location.href;
            }
            return location;
        }

        var location = getLocation($scope.track.SMLinks[index].value);
        var host = location.hostname.split('.')[0];
        var findLink = $scope.track.SMLinks.filter(function(item) {
            return item.key === host;
        });

        if (findLink.length > 0) {
            return false;
        }
        $scope.track.SMLinks[index].key = host;
    }

    $scope.addSMLink = function() {
        $scope.track.SMLinks.push({
            key: '',
            value: ''
        });
    }

    $scope.clearOrFile = function() {
        if ($scope.track.downloadURL) {
            angular.element("input[type='file']").val(null);
        }
    }

    $scope.artistURLChange = function(index) {
        var artist = {};
        $scope.processing = true;
        ArtistToolsService.resolveData({
            url: $scope.track.artists[index].url
        }).then(function(res) {
            $scope.track.artists[index].avatar = res.data.avatar_url ? res.data.avatar_url : '';
            $scope.track.artists[index].username = res.data.username;
            $scope.track.artists[index].id = res.data.id;
            $scope.processing = false;
        }).catch(function(err) {
            $.Zebra_Dialog('Artists not found');
            $scope.processing = false;
        });
    }

    $scope.removeArtist = function(index) {
        $scope.track.artists.splice(index, 1);
    }

    $scope.addArtist = function() {
        $scope.track.artists.push({
            url: '',
            avatar: '',
            username: '',
            id: -1,
            permanentLink: false
        });
    }

    $scope.removePlaylist = function(index) {
        $scope.track.playlists.splice(index, 1);
    }
    $scope.playlistURLChange = function(index) {
        $scope.processing = true;
        AdminDLGateService
            .resolveData({
                url: $scope.track.playlists[index].url
            })
            .then(function(res) {
                $scope.track.playlists[index].avatar = res.data.artwork_url;
                $scope.track.playlists[index].title = res.data.title;
                $scope.track.playlists[index].id = res.data.id;
                $scope.processing = false;
            })
            .then(null, function(err) {
                $.Zebra_Dialog('Playlist not found');
                $scope.processing = false;
            })
    }

    function resetDownloadGateway() {
        $scope.processing = false;
        $scope.isTrackAvailable = false;
        $scope.message = {
            val: '',
            visible: false
        };

        $scope.track = {
            artistUsername: '',
            trackTitle: '',
            trackArtworkURL: '',
            SMLinks: [],
            like: false,
            comment: false,
            repost: false,
            artists: [{
                url: '',
                avatar: '',
                username: '',
                id: -1,
                permanentLink: false
            }],
            showDownloadTracks: 'user'
        };
        angular.element("input[type='file']").val(null);
    }

    /* Method for getting DownloadGateway in case of edit */

    $scope.getDownloadGateway = function(downloadGateWayID) {
        // resetDownloadGateway();
        $scope.processing = true;
        ArtistToolsService
            .getDownloadGateway({
                id: downloadGateWayID
            })
            .then(handleResponse)
            .catch(handleError);

        function handleResponse(res) {

            $scope.isTrackAvailable = true;
            $scope.track = res.data;

            var SMLinks = res.data.SMLinks ? res.data.SMLinks : {};
            var permanentLinks = res.data.permanentLinks ? res.data.permanentLinks : [''];
            var SMLinksArray = [];
            var permanentLinksArray = [];

            for (var link in SMLinks) {
                SMLinksArray.push({
                    key: link,
                    value: SMLinks[link]
                });
            }
            permanentLinks.forEach(function(item) {
                permanentLinksArray.push({
                    url: item
                })
            });
            if (!$scope.track.showDownloadTracks) {
                $scope.track.showDownloadTracks = 'user';
            }
            $scope.track.SMLinks = SMLinksArray;
            $scope.track.permanentLinks = permanentLinksArray;
            $scope.track.playlistIDS = [];
            // $scope.track.showDownloadTracks = ($scope.track.showDownloadTracks === 'user') ? true : false;
            console.log($scope.track);
            $scope.processing = false;
        }

        function handleError(res) {
            $scope.processing = false;
        }
    };

    $scope.clearOrInput = function() {
        $scope.track.downloadURL = "";
    }

    $scope.$watch('track', function(newVal, oldVal) {
        if (newVal.trackTitle)
            window.localStorage.setItem('trackPreviewData', JSON.stringify(newVal));
    }, true);
});