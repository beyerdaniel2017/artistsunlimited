app.controller('ArtistToolsDownloadGatewayController', ['$rootScope',
    '$state',
    '$stateParams',
    '$scope',
    '$http',
    '$location',
    '$window',
    '$uibModal',
    '$timeout',
    'SessionService',
    'ArtistToolsService',
    function ($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, SessionService, ArtistToolsService)
    {
        
        $scope.checkIfEdit = function ()
        {
            if ($stateParams.gatewayID)
            {
                $scope.getDownloadGateway($stateParams.gatewayID);
            }
        };

        $scope.getTrackListFromSoundcloud = function ()
        {
            var profile = JSON.parse(SessionService.getUser());
            if (profile.soundcloud)
            {
                $scope.processing = true;
                SC.get('/users/' + profile.soundcloud.id + '/tracks')
                .then(function (tracks) {
                    $scope.trackList = tracks;
                    $scope.processing = false;
                    $scope.$apply();
                })
                .catch(function (response) {
                    $scope.processing = false;
                    $scope.$apply();
                });
            }
        }

        $scope.checkIfSubmission = function ()
        {
            if ($stateParams.submission)
            {
                if ($state.includes('artistTools.downloadGateway.new'))
                {
                    $scope.track.trackURL = $rootScope.submission.trackURL;
                    $scope.trackURLChange();
                    return;
                }

                $scope.openThankYouModal.thankYou($stateParams.submission._id);
                $rootScope.submission = null;
            }
        }
        
        $scope.trackURLChange = function()
        {
            if ($scope.track.trackURL !== '')
            {
                $scope.isTrackAvailable = false;
                $scope.processing = true;
                ArtistToolsService.resolveData({
                    url: $scope.track.trackURL
                }).then(handleTrackDataAndGetProfiles).then(handleWebProfiles).catch(handleError);

                function handleTrackDataAndGetProfiles(res)
                {
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

                function handleWebProfiles(profiles)
                {
                    profiles.forEach(function(prof)
                    {
                        if (['twitter', 'youtube', 'facebook', 'spotify', 'soundcloud', 'instagram'].indexOf(prof.service) != -1)
                        {
                            $scope.track.SMLinks.push({
                                key: prof.service,
                                value: prof.url
                            });
                        }
                    });
                    
                    $scope.isTrackAvailable = true;
                    $scope.processing = false;
                }

                function handleError(err)
                {
                    $scope.track.trackID = null;
                    alert('Song not found or forbidden');
                    $scope.processing = false;
                }
            }
        }
        
        $scope.SMLinkChange = function(index)
        {
            function getLocation(href)
            {
                var location = document.createElement("a");
                location.href = href;
                if (location.host == "")
                {
                    location.href = location.href;
                }
                return location;
            }

            var location = getLocation($scope.track.SMLinks[index].value);
            var host = location.hostname.split('.')[0];
            var findLink = $scope.track.SMLinks.filter(function(item)
            {
                return item.key === host;
            });

            if (findLink.length > 0)
            {
                return false;
            }
            $scope.track.SMLinks[index].key = host;
        }
        
        $scope.addSMLink = function()
        {
            $scope.track.SMLinks.push({
              key: '',
              value: ''
            });
        }
        
        $scope.clearOrFile = function()
        {
            if ($scope.track.downloadURL)
            {
                angular.element("input[type='file']").val(null);
            }
        }
        
        $scope.artistURLChange = function(index)
        {
            var artist = {};
            $scope.processing = true;
            ArtistToolsService.resolveData({
                url: $scope.track.artists[index].url
            }).then(function(res)
            {
                $scope.track.artists[index].avatar = res.data.avatar_url ? res.data.avatar_url : '';
                $scope.track.artists[index].username = res.data.username;
                $scope.track.artists[index].id = res.data.id;
                $scope.processing = false;
            }).catch(function(err)
            {
                alert('Artists not found');
                $scope.processing = false;
            });
        }
        
        $scope.removeArtist = function(index)
        {
            $scope.track.artists.splice(index, 1);
        }
        
        $scope.addArtist = function()
        {
            $scope.track.artists.push({
                url: '',
                avatar: '',
                username: '',
                id: -1,
                permanentLink: false
            });
        }
    }
]);