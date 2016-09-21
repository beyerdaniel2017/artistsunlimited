app.config(function($stateProvider) {
  $stateProvider
    .state('reForReLists', {
      url: '/artistTools/reForReLists',
      templateUrl: 'js/artistTools/reForReLists/reForReLists.html',
      controller: 'ReForReListsController',
      resolve: {
        currentTrades: function($http, SessionService) {
          var user = SessionService.getUser();
          if (user) {
            return $http.get('/api/trades/withUser/' + user._id)
              .then(function(res) {
                var trades = res.data;
                trades.forEach(function(trade) {
                  trade.other = (trade.p1.user._id == user._id) ? trade.p2 : trade.p1;
                  trade.user = (trade.p1.user._id == user._id) ? trade.p1 : trade.p2;
                });
                return trades;
              })
          } else {
            return [];
          }
        },
        favorites: function($http, SessionService) {
          var user = SessionService.getUser();
          if (user) {
            return $http.get('/api/trades/doneWithUser/' + user._id)
              .then(function(res) {
                var trades = res.data;
                var favs = trades.map(function(trade) {
                  return ((trade.p1.user._id == user._id) ? trade.p2.user : trade.p1.user)
                });
                // favs = favs.filter(function(favUser) {
                //     var ok = true;
                //     currentTrades.forEach(function(trade) {
                //       if (trade.p1.user._id == favUser._id || trade.p2.user._id == favUser._id) {
                //         ok = false;
                //       }
                //     })
                //     return ok;
                //   })
                var favsNoDups = [];
                favs.forEach(function(favUser) {
                  var ok = true;
                  favsNoDups.forEach(function(noDupUser) {
                    if (favUser._id == noDupUser._id) ok = false;
                  })
                  if (ok) favsNoDups.push(favUser);
                })
                return favsNoDups;
              }).then(null, console.log);
          } else {
            return [];
          }
        },
        openTrades: function($http, SessionService) {
          var user = SessionService.getUser();
          if (user) {
            var minFollower = ((user.soundcloud.followers && user.soundcloud.followers > 0) ? parseInt(user.soundcloud.followers / 2) : 0);
            var maxFollower = ((user.soundcloud.followers && user.soundcloud.followers > 0) ? parseInt(user.soundcloud.followers * 2) : 1000);
            return $http.post('/api/users/bySCURL/', {
                url: '',
                minFollower: minFollower,
                maxFollower: maxFollower,
                recordRange: {
                  skip: 0,
                  limit: 12
                }
              })
              .then(function(res) {
                var users = res.data;
                // users = users.filter(function(openUser) {
                //   var ok = true;
                //   currentTrades.forEach(function(trade) {
                //     if (trade.p1.user._id == openUser._id || trade.p2.user._id == openUser._id) {
                //       ok = false;
                //     }
                //   })
                //   favorites.forEach(function(favUser) {
                //     if (favUser._id == user._id) {
                //       ok = false;
                //     }
                //   })
                //   return ok;
                // })
                return users;
              }).then(null, console.log);
          } else {
            return [];
          }
        },
        repostEvent: function($http, SessionService) {
          var user = SessionService.getUser();
          if (user) {
            return $http.get("/api/events/getRepostEvents/" + user._id)
              .then(function(repostEvent) {
                var repostEvent = repostEvent.data;
                return repostEvent;
              });
          } else {
            return [];
          }
        }
      }
    });
});

app.controller("ReForReListsController", function($scope, $rootScope, currentTrades, favorites, openTrades, repostEvent, $http, SessionService, $state, $timeout, $window) {
  if (!SessionService.getUser()) {
    $state.go('login');
    return;
  }
  $scope.listevents = repostEvent;
  $scope.favorites = favorites;
  $scope.state = 'reForReInteraction';
  $scope.user = SessionService.getUser();
  $rootScope.userlinkedAccounts = ($scope.user.linkedAccounts ? $scope.user.linkedAccounts : []);
  $scope.currentTrades = currentTrades;
  $scope.currentTradesCopy = currentTrades;
  $scope.otherUsers = [];
  $scope.searchUser = openTrades;
  $scope.currentTab = "SearchTrade";
  $scope.searchURL = "";
  $scope.sliderSearchMin = Math.log((($scope.user.soundcloud.followers) ? parseInt($scope.user.soundcloud.followers / 2) : 0)) / Math.log(1.1);
  $scope.sliderSearchMax = Math.log((($scope.user.soundcloud.followers) ? parseInt($scope.user.soundcloud.followers * 2) : 200000000)) / Math.log(1.1);
  $scope.minSearchTradefollowers = Math.pow(1.1, $scope.sliderSearchMin);
  $scope.maxSearchTradefollowers = Math.pow(1.1, $scope.sliderSearchMax);
  $scope.sliderManageMin = 0;
  $scope.sliderManageMax = 200000000;

  $scope.minManageTradefollowers = Math.pow(1.1, $scope.sliderManageMin);
  $scope.maxManageTradefollowers = Math.pow(1.1, $scope.sliderManageMax);
  $scope.$watch(function() {
    return $scope.sliderSearchMin
  }, function(newVal, oldVal) {
    $scope.minSearchTradefollowers = Math.pow(1.1, newVal)
  })
  $scope.$watch(function() {
    return $scope.sliderSearchMax
  }, function(newVal, oldVal) {
    $scope.maxSearchTradefollowers = Math.pow(1.1, newVal);
  })

  $scope.$watch(function() {
    return $scope.sliderManageMin
  }, function(newVal, oldVal) {
    $scope.minManageTradefollowers = Math.pow(1.1, newVal)
  })
  $scope.$watch(function() {
    return $scope.sliderManageMax
  }, function(newVal, oldVal) {
    $scope.maxManageTradefollowers = Math.pow(1.1, newVal);
  })

  $scope.sortby = "Recent Alert";
  $scope.sort_order = "ascending";
  var searchTradeRange = {
    skip: 0,
    limit: 12
  }

  $scope.dayIncr = 0;
  $scope.incrDay = function() {
    if ($scope.dayIncr < 21) $scope.dayIncr++;
  }
  $scope.decrDay = function() {
    if ($scope.dayIncr > 0) $scope.dayIncr--;
  }
  $scope.currentDate = new Date();
  var daysArray = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  $scope.itemview = "calender";
  // $scope.setView = function(view) {
  //   $scope.itemview = view;
  // };
  $scope.manageView = "calender";
  $scope.searchByFollowers = function() {
    $scope.searchURL = "";
    $scope.sendSearch();
  }

  $scope.viewSoundcloud = function(user) {
    console.log(user);
    window.location.href = user.soundcloud.permalinkURL;
  }

  $scope.sendSearch = function() {
    $scope.processing = true;
    $scope.searchUser = [];

    $http.post('/api/users/bySCURL/', {
        url: $scope.searchURL,
        minFollower: $scope.minSearchTradefollowers,
        maxFollower: $scope.maxSearchTradefollowers,
        recordRange: {
          skip: 0,
          limit: 12
        }
      })
      .then(function(res) {
        $scope.processing = false;
        $scope.searchUser = res.data;
      })
      .then(undefined, function(err) {
        $scope.success = false;
        $scope.processing = false;
        $scope.searchUser = [];
        $.Zebra_Dialog("Please enter Artist url.");
      })
      .then(null, function(err) {
        $scope.success = false;
        $scope.processing = false;
        $scope.searchUser = [];
        $.Zebra_Dialog("Did not find user.");
      });
  }

  $scope.hello = function(obj) {
    $state.go('reForReInteraction', obj);
  }

  $scope.searchCurrentTrade = function() {
    var cTrades = [];
    $scope.currentTrades = [];
    angular.forEach($scope.currentTradesCopy, function(trade) {
      if ($scope.searchURL != "") {
        var url = $scope.searchURL;
        url = url.toString().replace('http://', '').replace('https://', '');
        if ((trade.other.user.soundcloud.permalinkURL.indexOf(url) != -1)) {
          cTrades.push(trade);
        }
      } else if (parseInt($scope.maxManageTradefollowers) > 0) {
        if (trade.other.user.soundcloud.followers >= $scope.minManageTradefollowers && trade.other.user.soundcloud.followers <= $scope.maxManageTradefollowers) {
          cTrades.push(trade);
        }
      }
    });
    $scope.currentTrades = cTrades;
    $scope.$apply();
  }

  $scope.tradeType = {
    Requests: true,
    Requested: true,
    TradePartners: true
  };

  $scope.filterByTradeType = function() {
    $scope.processing = true;
    var tradeType = $scope.tradeType;
    tradeType = JSON.stringify(tradeType);
    $http.get('/api/trades/withUser/' + $scope.user._id + '?tradeType=' + tradeType)
      .then(function(res) {
        var trades = res.data;
        $scope.currentTrades = [];
        trades.forEach(function(trade) {
          trade.other = (trade.p1.user._id == $scope.user._id) ? trade.p2 : trade.p1;
          trade.user = (trade.p1.user._id == $scope.user._id) ? trade.p1 : trade.p2;
        });
        $scope.currentTrades = trades;
        $scope.processing = false;
      })
  }
  $scope.sortResult = function(sortby) {
    $scope.sortby = sortby;
    var sort_order = $scope.sort_order;
    if (sortby == "Followers") {
      if (sort_order == "ascending") {
        $scope.currentTrades.sort(function(a, b) {
          return b.other.user.soundcloud.followers - a.other.user.soundcloud.followers;
        })
        $scope.sort_order = "descending";
      } else {
        $scope.currentTrades.sort(function(a, b) {
          return a.other.user.soundcloud.followers - b.other.user.soundcloud.followers;
        })
        $scope.sort_order = "ascending";
      }
    } else if (sortby == "Unfilled Slots") {
      if (sort_order == "ascending") {
        $scope.currentTrades.sort(function(a, b) {
          return b.unfilledTrackCount - a.unfilledTrackCount;
        })
        $scope.sort_order = "descending";
      } else {
        $scope.currentTrades.sort(function(a, b) {
          return a.unfilledTrackCount - b.unfilledTrackCount;
        })
        $scope.sort_order = "ascending";
      }
    } else {
      if (sort_order == "ascending") {
        $scope.currentTrades.sort(function(a, b) {
          return a.other.alert.toLowerCase() < b.other.alert.toLowerCase();
        });
        $scope.sort_order = "descending";
      } else {
        $scope.currentTrades.sort(function(a, b) {
          return a.other.alert.toLowerCase() > b.other.alert.toLowerCase();
        });
        $scope.sort_order = "ascending";
      }
    }
  }

  $scope.$on('loadTrades', function(e) {
    $scope.loadMore();
  });

  $scope.setView = function(type) {
    $scope.itemView = type;
    $scope.shownTrades = $scope.currentTrades.filter(function(trade) {
      if (type == 'inbox') return trade.other.accepted;
      else return trade.user.accepted;
    }).sort(function(trade) {
      if (['change', 'message'].includes(trade.user.alert)) return -1;
      else return 1
    })
  }

  $scope.setManageView = function(type) {
    $scope.manageView = type;
  };

  $scope.loadMore = function() {
    searchTradeRange.skip += 12;
    searchTradeRange.limit = 12;
    $http.post('/api/users/bySCURL/', {
        url: $scope.searchURL,
        minFollower: $scope.minSearchTradefollowers,
        maxFollower: $scope.maxSearchTradefollowers,
        recordRange: searchTradeRange
      })
      .then(function(res) {
        $scope.processing = false;
        if (res.data.length > 0) {
          angular.forEach(res.data, function(d) {
            $scope.searchUser.push(d);
          });
        }
      })
      .then(undefined, function(err) {
        $scope.success = false;
        $scope.processing = false;
        $scope.searchUser = [];
        $.Zebra_Dialog("Please enter Artist url.");
      })
      .then(null, function(err) {
        $scope.success = false;
        $scope.processing = false;
        $scope.searchUser = [];
        $.Zebra_Dialog("Did not find user.");
      });
  };

  $scope.openTrade = function(user) {
    var trade = {
      messages: [{
        date: new Date(),
        senderId: SessionService.getUser()._id,
        text: SessionService.getUser().soundcloud.username + ' opened a trade.',
        type: 'alert'
      }],
      repeatFor: 0,
      p1: {
        user: SessionService.getUser()._id,
        alert: "none",
        slots: [],
        accepted: true
      },
      p2: {
        user: user._id,
        alert: "change",
        slots: [],
        accepted: false
      }
    }
    $scope.processing = true;
    $http.post('/api/trades/new', trade)
      .then(function(res) {
        $scope.processing = false;
        $state.go('reForReInteraction', {
          tradeID: res.data._id
        })
      })
      .then(null, function(err) {
        $scope.processing = false;
        $.Zebra_Dialog("Error in creating trade");
      });
  }

  $scope.manage = function(trade) {
    $state.go('reForReInteraction', {
      tradeID: trade._id
    })
  }

  $scope.remindTrade = function(tradeID, index) {
    $scope.sharelink = "https://localhost:1443/artistTools/reForReInteraction/" + tradeID;
  }

  $scope.sendMail = function(sharelink) {
    $scope.fbMessageLink = sharelink;
    $window.open("mailto:example@demo.com?body=" + sharelink, "_self");
  };

  $scope.deleteTrade = function(tradeID, index) {
    $.Zebra_Dialog('Are you sure you want to delete this trade?', {
      'type': 'confirmation',
      'buttons': [{
        caption: 'Yes',
        callback: function() {
          $scope.processing = true;
          $http.post('/api/trades/delete', {
              id: tradeID
            })
            .then(function(res) {
              $scope.processing = false;
              $scope.shownTrades.splice(index, 1);
            })
            .then(null, function(err) {
              $scope.processing = false;
              $.Zebra_Dialog('Error accepting');
            })
        }
      }, {
        caption: 'No',
        callback: function() {
          console.log('No was clicked');
        }
      }]
    });
  }

  $scope.checkNotification = function() {
    angular.forEach(currentTrades, function(trade) {
      if (trade.p1.user._id == $scope.user._id) {
        if (trade.p1.alert == "change") {
          $scope.$parent.shownotification = true;
        }
      }
      if (trade.p2.user._id == $scope.user._id) {
        if (trade.p2.alert == "change") {
          $scope.$parent.shownotification = true;
        }
      }
    });
  }
  $scope.setCurrentTab = function(currentTab) {
    $scope.currentTab = currentTab;
  }
  $scope.openHelpModal = function() {
    if ($scope.currentTab == 'SearchTrade') {
      var displayText = "<span style='font-weight:bold'>Search Trade:</span> Here you will be able to find people to trade reposts with. By entering a SoundCloud User’s URL into the Search, you will find that user and then be able to initiate a trade with that user.<br/><br/>By clicking open trade, you will be led to our repost for repost interface.<br/><br/><a style='text-align:center; margin:0 auto;' href='mailto:coayscue@artistsunlimited.co?subject=Artists Unlimited Help' target='_top'>Email Tech Support</a>";
    } else if ($scope.currentTab == 'ManageTrade') {
      var displayText = "<span style='font-weight:bold'>Manage Trade:</span> Here you will be able to find the users you have already initiated trades with in the past, or people who have initiated a trade with you. By hovering over user’s icon, you will be able to enter into your trade or delete the trade with that given user.<br/><br/>By clicking manage while hovering over a user’s icon, the repost for repost interface will open.<br/><br/><a style='text-align:center; margin:0 auto;' href='mailto:coayscue@artistsunlimited.co?subject=Artists Unlimited Help' target='_top'>Email Tech Support</a>";
    }

    $.Zebra_Dialog(displayText, {
      width: 600
    });
  }
  $scope.verifyBrowser = function() {
    if (navigator.userAgent.search("Chrome") == -1 && navigator.userAgent.search("Safari") != -1) {
      var position = navigator.userAgent.search("Version") + 8;
      var end = navigator.userAgent.search(" Safari");
      var version = navigator.userAgent.substring(position, end);
      if (parseInt(version) < 9) {
        $.Zebra_Dialog('You have old version of safari. Click <a href="https://support.apple.com/downloads/safari">here</a> to download the latest version of safari for better site experience.', {
          'type': 'confirmation',
          'buttons': [{
            caption: 'OK'
          }],
          'onClose': function() {
            $window.location.href = "https://support.apple.com/downloads/safari";
          }
        });
      }
    }
  }
  $scope.getUserNetwork = function() {
    $http.get("/api/database/userNetworks")
      .then(function(networks) {
        $rootScope.userlinkedAccounts = networks.data;
      })
  }

  $scope.dayIncr = 0;
  $scope.incrDay = function() {
    if ($scope.dayIncr < 21) $scope.dayIncr++;
  }

  $scope.decrDay = function() {
    if ($scope.dayIncr > 0) $scope.dayIncr--;
  }

  $scope.dayOfWeekAsString = function(date) {
    var dayIndex = date.getDay();
    if (screen.width > '744') {
      return ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex];
    }
    return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayIndex];
  }

  $scope.getEventStyle = function(repostEvent) {
    if (repostEvent.type == 'empty') {
      return {}
    } else if (repostEvent.trackInfo.type == 'traded' && repostEvent.trackInfo.trackID) {
      return {
        'background-color': '#B22222'
      }
    } else if (repostEvent.trackInfo.type == 'traded' && !repostEvent.trackInfo.trackID) {
      return {
        'background-color': '#2b9fda'
      }
    }
  }

  repostEvent.forEach(function(ev) {
    ev.day = new Date(ev.day);
  });
  $scope.events = repostEvent;
  $scope.fillDateArrays = function(repostEvent) {
    var calendar = [];
    var today = new Date();
    for (var i = 0; i < 29; i++) {
      var calDay = {};
      calDay.day = new Date()
      calDay.day.setDate(today.getDate() + i);
      var dayEvents = repostEvent.filter(function(ev) {
        return (new Date(ev.trackInfo.day).toLocaleDateString() == calDay.day.toLocaleDateString());
      });

      var eventArray = [];
      for (var j = 0; j < 24; j++) {
        eventArray[j] = {
          type: "empty"
        };
      }
      dayEvents.forEach(function(ev) {
        eventArray[new Date(ev.trackInfo.day).getHours()] = ev;
      });

      calDay.events = eventArray;
      calendar.push(calDay);
    }
    return calendar;
  };

  $scope.calendar = $scope.fillDateArrays(repostEvent);

  $scope.clickedSlot = function(day, hour, data) {
    if (data.trackInfo) {
      document.getElementById('scPopupPlayer').style.visibility = "hidden";
      document.getElementById('scPopupPlayer').innerHTML = "";
      $scope.makeEvent = {};
      var makeDay = new Date(day);
      makeDay.setHours(hour);
      $scope.makeEvent._id = data.trackInfo._id;
      $scope.makeEvent.day = new Date(data.trackInfo.day);
      $scope.makeEvent.url = data.trackInfo.trackURL;
      $scope.makeEvent.comment = data.trackInfo.comment;
      $scope.makeEvent.timeGap = data.trackInfo.timeGap;
      $scope.makeEvent.artist = data.userInfo;
      var repostDate = new Date(data.trackInfo.day);
      var unrepostDate = new Date(data.trackInfo.unrepostDate);
      var diff = Math.abs(new Date(unrepostDate).getTime() - new Date(repostDate).getTime()) / 3600000;
      $scope.makeEvent.unrepostHours = diff;
      var d = new Date(day).getDay();
      var channels = data.trackInfo.otherChannels;
      $scope.displayChannels = [];
      for (var i = 0; i < repostEvent.length; i++) {
        if (channels.indexOf(repostEvent[i].userInfo.id) > -1) {
          $scope.displayChannels.push(repostEvent[i].userInfo.username);
        }
      }
      $scope.showOverlay = true;
      var calDay = {};
      var calendarDay = $scope.calendar.find(function(calD) {
        return calD.day.toLocaleDateString() == day.toLocaleDateString();
      });
      SC.oEmbed($scope.makeEvent.url, {
        element: document.getElementById('scPopupPlayer'),
        auto_play: false,
        maxheight: 120
      })
      document.getElementById('scPopupPlayer').style.visibility = "visible";
    }
  }

  $scope.closeModal = function() {
    $scope.showOverlay = false;
  }

  $scope.saveEvent = function() {
    var req = $http.put('/api/events/repostEvents', $scope.makeEvent)
      .then(function(res) {
        console.log(res);
        $scope.makeEventURL = "";
        $scope.makeEvent = null;
        $scope.eventComment = "";
        document.getElementById('scPlayer').style.visibility = "hidden";
        document.getElementById('scPopupPlayer').style.visibility = "hidden";
        $scope.unrepostHours = 1;
        $scope.tabSelected = true;
        $scope.trackType = "";
        $scope.trackArtistID = 0;
        $.Zebra_Dialog("Event created successfully.");
        if ($scope.manageView == "newsong") {
          $scope.manageView = "list";
        }
        $http.get("/api/events/getRepostEvents/" + $scope.user._id)
          .then(function(res) {
            $scope.calendar = $scope.fillDateArrays(res.data);
          });
        $scope.showOverlay = false;
      })
      .then(null, function(err) {
        $scope.processing = false;
        $.Zebra_Dialog("ERROR: Did not save.");
      });
  }

  $scope.choseArtist = function(user) {
    console.log('user')
    // $scope.searchString = track.title;
    // $scope.makeEvent.trackID = track.id;
    // $scope.makeEvent.title = track.title;
    // $scope.makeEvent.trackURL = track.permalink_url;
    // $scope.makeEvent.trackArtUrl = track.artwork_url;
    // SC.oEmbed( $scope.makeEvent.trackURL, {
    //   element: document.getElementById('scPopupPlayer'),
    //   auto_play: false,
    //   maxheight: 150
    // })
    // document.getElementById('scPopupPlayer').style.visibility = "visible";
  }

  $scope.choseTrack = function(track) {
    $scope.searchString = track.title;
    $scope.makeEvent.trackID = track.id;
    $scope.makeEvent.title = track.title;
    $scope.makeEvent.trackURL = track.permalink_url;
    $scope.makeEvent.trackArtUrl = track.artwork_url;
    SC.oEmbed( $scope.makeEvent.trackURL, {
      element: document.getElementById('scPopupPlayer'),
      auto_play: false,
      maxheight: 150
    })
    document.getElementById('scPopupPlayer').style.visibility = "visible";
  }

  $scope.choseTrack1 = function(track) {
    $scope.searchString = track.title;
    $scope.makeEvent.trackID = track.id;
    $scope.makeEvent.title = track.title;
    $scope.makeEvent.trackURL = track.permalink_url;
    $scope.makeEvent.trackArtUrl = track.artwork_url;
    SC.oEmbed( $scope.makeEvent.trackURL, {
      element: document.getElementById('scPlayer'),
      auto_play: false,
      maxheight: 150
            })
    document.getElementById('scPlayer').style.visibility = "visible";
  }


  $scope.editRepostEvent = function(data) {
    if (data.trackInfo) {
      $scope.manageView = "newsong";
      document.getElementById('scPlayer').style.visibility = "hidden";
      document.getElementById('scPlayer').innerHTML = "";
      var day = new Date(data.trackInfo.day);
      $scope.makeEvent = {};
      $scope.makeEvent._id = data.trackInfo._id;
      $scope.makeEvent.day = new Date(data.trackInfo.day);
      $scope.makeEvent.url = data.trackInfo.trackURL;
      $scope.makeEvent.comment = data.trackInfo.comment;
      $scope.makeEvent.timeGap = data.trackInfo.timeGap;
      $scope.makeEvent.artist = data.userInfo;
      var repostDate = new Date(data.trackInfo.day);
      var unrepostDate = new Date(data.trackInfo.unrepostDate);
      var diff = Math.abs(new Date(unrepostDate).getTime() - new Date(repostDate).getTime()) / 3600000;
      $scope.makeEvent.unrepostHours = diff;
      var d = new Date(day).getDay();
      var channels = data.trackInfo.otherChannels;
      $scope.displayChannels = [];
      for (var i = 0; i < repostEvent.length; i++) {
        if (channels.indexOf(repostEvent[i].userInfo.id) > -1) {
          $scope.displayChannels.push(repostEvent[i].userInfo.username);
        }
      }
      var calDay = {};
      var calendarDay = $scope.calendar.find(function(calD) {
        return calD.day.toLocaleDateString() == day.toLocaleDateString();
      });
      SC.oEmbed($scope.makeEvent.url, {
        element: document.getElementById('scPlayer'),
        auto_play: false,
        maxheight: 120
      })
      document.getElementById('scPlayer').style.visibility = "visible";
    }
  }

  $scope.addNewSongCancel = function() {
    $scope.manageView = "list";
  }

  $scope.fillDateArrays(repostEvent);
  /*Manage Trades end*/
  $scope.getUserNetwork();
  $scope.verifyBrowser();
  $scope.checkNotification();
  $scope.sortResult($scope.sortby);
  $scope.loadMore();
  $scope.setView("inbox");

});