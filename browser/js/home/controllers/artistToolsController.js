app.config(function($stateProvider) {
    $stateProvider
        .state('artistTools', {
            url: '/artist-tools',
            templateUrl: 'js/home/views/artistTools/artistTools.html',
            controller: 'ArtistToolsController',
            abstract: true,
            resolve: {
                allowed: function($q, $state, SessionService) {
                    var deferred = $q.defer();
                    var user = SessionService.getUser();
                    if (user) {
                        deferred.resolve();
                    } else {
                        deferred.reject();
                        window.location.href = '/login';
                    }
                    return deferred.promise;
                }
            }
        })
        .state('artistToolsProfile', {
            url: '/profile',
            templateUrl: 'js/home/views/artistTools/profile.html',
            controller: 'ArtistToolsController'
        })
        .state('artistToolsDownloadGatewayList', {
            url: '/download-gateway',
            params: {
                submission: null
            },
            templateUrl: 'js/home/views/artistTools/downloadGateway.list.html',
            controller: 'ArtistToolsController'
        })
        .state('artistToolsDownloadGatewayAnalytics', {
            url: '/analytics',
            params: {
                submission: null
            },
            templateUrl: 'js/home/views/artistTools/analytics.html',
            controller: 'artistToolsDownloadGatewayAnalytics'
        });
});

app.controller("artistToolsDownloadGatewayAnalytics", function($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, $auth, SessionService, ArtistToolsService) {
    $scope.authFacbook = function(id) {
        $scope.enableGraph = false;
        FB.getLoginStatus(function(response_token) {
            if (response_token.status === 'connected') {
                //req.body.pid && req.body.userid && req.body.pageid
                var http_post_data = {
                    token: response_token.authResponse.accessToken
                };
                if (id) {
                    console.log(id);
                    http_post_data.pid = id.name;
                    http_post_data.pageid = id.id;
                    delete $scope.facebookPages;
                }
                $http({
                    method: 'POST',
                    url: '/api/analytics/facebook',
                    data: http_post_data
                }).then(function successCallback(response) {
                    console.log(JSON.stringify(response));
                    $scope.graph_data = response.data;
                    $scope.enableGraph = true;
                }, function errorCallback(response) {
                    console.log("Error while posting to server"); //register user!
                    function getStats(response_token) {
                        $http({
                            method: 'POST',
                            url: '/api/analytics/facebook/owned',
                            data: {
                                token: response_token.authResponse.accessToken
                            }
                        }).then(function successCallback(response) {
                            $scope.facebookPages = response.data.pages;
                        }, function errorCallback(response) {
                            console.log("Error while posting to server");
                        });
                    }
                    getStats(response_token);
                });
            } else {
                FB.login(function(response_token) {
                    if (response_token.status === 'connected') {

                        //req.body.pid && req.body.userid && req.body.pageid
                        var http_post_data = {
                            token: response_token.authResponse.accessToken
                        };
                        if (id) {
                            console.log(id);
                            http_post_data.pid = id.name;
                            http_post_data.pageid = id.id;
                            delete $scope.facebookPages;
                        }
                        $http({
                            method: 'POST',
                            url: '/api/analytics/facebook',
                            data: http_post_data
                        }).then(function successCallback(response) {
                            console.log(JSON.stringify(response));
                            $scope.graph_data = response.data;
                            $scope.enableGraph = true;
                        }, function errorCallback(response) {
                            console.log("Error while posting to server"); //register user!
                            function getStats(response_token) {
                                $http({
                                    method: 'POST',
                                    url: '/api/analytics/facebook/owned',
                                    data: {
                                        token: response_token.authResponse.accessToken
                                    }
                                }).then(function successCallback(response) {
                                    $scope.facebookPages = response.data.pages;
                                }, function errorCallback(response) {
                                    console.log("Error while posting to server");
                                });
                            }
                            getStats(response_token);
                        });
                    } else {
                        alert("Facebook login failed");
                    }
                },{scope: 'email,manage_pages'});
            }
        });
    };
    $scope.showFacebookPageState = function(id) {
        delete $scope.facebookPages;
        $scope.enableGraph = false;
        FB.getLoginStatus(function(response) {
            if (response.status === 'connected') {
                //req.body.pid && req.body.userid && req.body.pageid
                console.log("id is :" + JSON.stringify(id));
                $http({
                    method: 'POST',
                    url: '/api/analytics/facebook',
                    data: {
                        token: response.authResponse.accessToken,
                        userid: 'dhavalp',
                        pid: id.name,
                        pageid: id.id,
                    }
                }).then(function successCallback(response) {
                    console.log(JSON.stringify(response));
                    $scope.graph_data = response.data;
                    $scope.enableGraph = true;
                }, function errorCallback(response) {
                    console.log("Error while posting to server");
                });
            } else {
                alert("Please login into facebook first");
            }
        });
    };
    $scope.authTwitter = function() {
        //req.body.access_token_key && req.body.access_token_secret && req.body.uid
        $scope.enableGraph = false;
        $auth.authenticate('twitter').then(function(success_twitter) {
            $http({
                method: 'POST',
                url: '/api/analytics/twitter',
                data: {
                    access_token_key: success_twitter.data.oauth_token,
                    access_token_secret: success_twitter.data.oauth_token_secret,
                }
            }).then(function(success) {
                $scope.graph_data = {};
                for (var i = 0; i < success.data.length; i++) {
                    var date_formatted = success.data[i].date;
                    $scope.graph_data[date_formatted] = success.data[i].follows;
                }
                $scope.enableGraph = true;
            }, function(failure) {
                //if code=404, register twitter first!!
                //req.body.screen_name && req.body.userid
                $http({
                    method: 'POST',
                    url: '/api/analytics/twitter/create',
                    data: {
                        access_token_key: success_twitter.data.oauth_token,
                        access_token_secret: success_twitter.data.oauth_token_secret,
                        screen_name: success_twitter.data.screen_name
                    }
                }).then(function(success) {
                    $http({
                        method: 'POST',
                        url: '/api/analytics/twitter',
                        data: {
                            access_token_key: success_twitter.data.oauth_token,
                            access_token_secret: success_twitter.data.oauth_token_secret,
                        }
                    }).then(function(success) {
                        console.log(success);
                        $scope.graph_data = {};
                        for (var i = 0; i < success.data.length; i++) {
                            var date_formatted = success.data[i].date;
                            $scope.graph_data[date_formatted] = success.data[i].follows;
                        }
                        $scope.enableGraph = true;
                    }, function(error) {
                        console.log("Error ::" + JSON.stringify(error));
                    });
                }, function(failure) {
                    alert("New account creation failed :" + JSON.stringify(failure));
                });
            });
        }, function(failure) {
            console.log(failure);
            return;
        });
    };
    $scope.authInstagram = function() {
        $scope.enableGraph = false;
        $auth.authenticate('instagram').then(function(success) {
            console.log(success);
            $http({
                method: 'POST',
                url: '/api/analytics/instagram',
                data: {
                    access_token: success.data
                }
            }).then(function(success) {
                $scope.graph_data = success.data;
                $scope.enableGraph = true;
            }, function(failure) {
                console.log("failed at /api/analytics/instagram " + JSON.stringify(failure));
            });
        }, function(failure) {
            console.log(failure);
        });
    };
    $scope.authYoutube = function() {
        $scope.enableGraph = false;
        $http({
            method: 'POST',
            url: '/api/analytics/youtube/stats',
            data:{
              channelId :$scope.youtube_channelId
            }
        }).success(function(success_http) {
            $scope.displayError = false;
            $scope.graph_data = success_http;
            $scope.enableGraph = true;
        }).error(function() {
            // $scope.displayError = true;
            if ($auth.isAuthenticated()) {
                var token = $auth.getToken();
                getChannel(token);
            } else {
                $auth.authenticate('google').then(function(success) {
                    getChannel(success.access_token);
                }, function(failure) {
                    console.log("failed >>>>" + JSON.stringify(failure));
                });
            }

            function getChannel(token) {
                $http({
                    method: 'GET',
                    url: "https://www.googleapis.com/youtube/v3/channels?part=contentOwnerDetails&mine=true&access_token=" + token
                }).then(function(success) {
                    $scope.youtube_channelId = success.data.items[0].id;
                    $scope.authYoutube();
                }, function(error) {
                    console.log("error from google api :" + error);
                });
            }

        });
    };
});
app.controller('graphControler', function($scope) {
    $scope.options = {
        chart: {
            type: 'discreteBarChart',
            height: 500,
            margin: {
                top: 30,
                right: 20,
                bottom: 20,
                left: 100
            },
            x: function(d) {
                return d.label;
            },
            y: function(d) {
                return d.value;
            },
            showValues: true,
            duration: 100,
            xAxis: {
                axisLabel: 'Dates'
            },
            yAxis: {
                axisLabel: 'Followers/Likes',
                tickFormat: function(d) {
                    return d3.format(',f')(d);
                },
                axisLabelDistance: 12
            }
        }
    };
    var value_array = [];
    for (var lo_value in $scope.graph_data) {
        value_array.push({
            label: lo_value,
            value: $scope.graph_data[lo_value]
        });
    }

    $scope.data = [{
        key: "Cumulative Return",
        values: value_array
    }];
});
app.controller('ArtistToolsController', function($rootScope, $state, $stateParams, $scope, $http, $location, $window, $uibModal, $timeout, SessionService, ArtistToolsService) {
        $scope.user = JSON.parse(SessionService.getUser());

        /* Init boolean variables for show/hide and other functionalities */

        $scope.processing = false;
        $scope.isTrackAvailable = false;
        $scope.message = {
            val: '',
            visible: false
        };

        /* Init downloadGateway list */

        $scope.downloadGatewayList = [];

        /* Init modal instance variables and methods */

        $scope.modalInstance = {};
        $scope.modal = {};
        $scope.openModal = {
            downloadURL: function(downloadURL) {
                $scope.modal.downloadURL = downloadURL;
                $scope.modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'downloadURL.html',
                    controller: 'ArtistToolsController',
                    scope: $scope
                });
            }
        };
        $scope.closeModal = function() {
            $scope.modalInstance.close();
        };

        $scope.editProfileModalInstance = {};
        $scope.editProfilemodal = {};
        $scope.openEditProfileModal = {
            editProfile: function(field) {
                $scope.profile.field = field;
                $timeout(function() {
                    $scope.editProfileModalInstance = $uibModal.open({
                        animation: true,
                        templateUrl: 'editProfile.html',
                        controller: 'ArtistToolsController',
                        scope: $scope
                    });
                }, 0);
            }
        };

        $scope.closeEditProfileModal = function() {
            $scope.showProfileInfo();
            if ($scope.editProfileModalInstance.close) {
                $scope.editProfileModalInstance.close();
            }
        };

        $scope.thankYouModalInstance = {};
        $scope.thankYouModal = {};
        $scope.openThankYouModal = {
            thankYou: function(submissionID) {
                $scope.thankYouModal.submissionID = submissionID;
                $scope.modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'thankYou.html',
                    controller: 'OpenThankYouModalController',
                    scope: $scope
                });
            }
        };
        $scope.closeThankYouModal = function() {
            $scope.thankYouModalInstance.close();
        };
        /* Init profile */
        $scope.profile = {};

        $scope.logout = function() {
            $http.post('/api/logout').then(function() {
                SessionService.deleteUser();
                $state.go('login');
                window.location.href = '/login';
            });
        };

        console.log($stateParams.submission);
        if ($stateParams.submission) {
            $scope.openThankYouModal.thankYou($stateParams.submission._id);
        }


        $scope.showProfileInfo = function() {
            $scope.profile.data = JSON.parse(SessionService.getUser());
            if (($scope.profile.data.permanentLinks && $scope.profile.data.permanentLinks.length === 0) || !$scope.profile.data.permanentLinks) {
                $scope.profile.data.permanentLinks = [{
                    url: '',
                    avatar: '',
                    username: '',
                    id: -1,
                    permanentLink: true
                }];
            };
            $scope.profile.isAvailable = {};
            $scope.profile.isAvailable.email = $scope.profile.data.email ? true : false;
            $scope.profile.isAvailable.password = $scope.profile.data.password ? true : false;
            $scope.profile.isAvailable.soundcloud = $scope.profile.data.soundcloud ? true : false;
            $scope.profile.data.password = '';
        };

        $scope.saveProfileInfo = function() {

            $scope.message = {
                value: '',
                visible: false
            };

            var permanentLinks = $scope.profile.data.permanentLinks.filter(function(item) {
                return item.id !== -1;
            }).map(function(item) {
                delete item['$$hashKey'];
                return item;
            });

            var sendObj = {
                name: '',
                password: '',
                permanentLinks: JSON.stringify(permanentLinks)
            }
            if ($scope.profile.field === 'name') {
                sendObj.name = $scope.profile.data.name;
            } else if ($scope.profile.field === 'password') {
                sendObj.password = $scope.profile.data.password;
            } else if ($scope.profile.field === 'email') {
                sendObj.email = $scope.profile.data.email;
            }

            ArtistToolsService
                .saveProfileInfo(sendObj)
                .then(function(res) {
                    if (res.data === 'Email Error') {
                        $scope.message = {
                            value: 'Email already exists!',
                            visible: true
                        };
                        return;
                    }
                    SessionService.create(res.data);
                    $scope.closeEditProfileModal();
                })
                .catch(function(res) {

                });
        };

        $scope.removePermanentLink = function(index) {
            $scope.profile.data.permanentLinks.splice(index, 1);
        };
        $scope.hidebutton = false;
        $scope.addPermanentLink = function() {

            if ($scope.profile.data.permanentLinks.length >= 2 && !$scope.user.admin) {
                $scope.hidebutton = true;
            }

            if ($scope.profile.data.permanentLinks.length > 2 && !$scope.user.admin) {
                return false;
            }

            $scope.profile.data.permanentLinks.push({
                url: '',
                avatar: '',
                username: '',
                id: -1,
                permanentLink: true
            });
        };

        $scope.permanentLinkURLChange = function(index) {
            var permanentLink = {};
            $scope.processing = true;
            ArtistToolsService
                .resolveData({
                    url: $scope.profile.data.permanentLinks[index].url
                })
                .then(function(res) {
                    $scope.profile.data.permanentLinks[index].avatar = res.data.avatar_url ? res.data.avatar_url : '';
                    $scope.profile.data.permanentLinks[index].username = res.data.permalink;
                    $scope.profile.data.permanentLinks[index].id = res.data.id;
                    $scope.processing = false;
                })
                .catch(function(err) {
                    alert('Artists not found');
                    $scope.processing = false;
                });
        };

        $scope.saveSoundCloudAccountInfo = function() {
            SC.connect()
                .then(saveInfo)
                .then(handleResponse)
                .catch(handleError);

            function saveInfo(res) {
                return ArtistToolsService.saveSoundCloudAccountInfo({
                    token: res.oauth_token
                });
            }

            function handleResponse(res) {
                $scope.processing = false;
                if (res.status === 200 && (res.data.success === true)) {
                    SessionService.create(res.data.data);
                    $scope.profile.data = res.data.data;
                    $scope.profile.isAvailable.soundcloud = true;
                } else {
                    $scope.message = {
                        value: 'You already have an account with this soundcloud username',
                        visible: true
                    };
                }
                $scope.$apply();
            }

            function handleError(err) {
                $scope.processing = false;
            }
        };

        $scope.getDownloadList = function() {
            ArtistToolsService
                .getDownloadList()
                .then(handleResponse)
                .catch(handleError);

            function handleResponse(res) {
                $scope.downloadGatewayList = res.data;
            }

            function handleError(err) {
                console.log(err)
            }
        };

        $scope.deleteDownloadGateway = function(index) {
            if (confirm("Do you really want to delete this track?")) {
                var downloadGateWayID = $scope.downloadGatewayList[index]._id;
                $scope.processing = true;
                ArtistToolsService
                    .deleteDownloadGateway({
                        id: downloadGateWayID
                    })
                    .then(handleResponse)
                    .catch(handleError);

                function handleResponse(res) {
                    $scope.processing = false;
                    $scope.downloadGatewayList.splice(index, 1);
                }

                function handleError(res) {
                    $scope.processing = false;
                }
            }
        };
    })
    .controller('OpenThankYouModalController', function($scope) {})
