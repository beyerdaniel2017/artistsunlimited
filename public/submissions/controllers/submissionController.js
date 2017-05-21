app.config(function($stateProvider) {
  $stateProvider.state('submissions', {
    url: '/admin/submissions',
    templateUrl: 'js/submissions/views/submissions.html',
    controller: 'SubmissionController'
  });
});

app.controller('SubmissionController', function($rootScope, $state, $scope, $http, $window, AuthService, SessionService, AccountSettingServices, $sce) {
  $scope.counter = 0;
  $scope.channelSelect = "all";
  $scope.showingElements = [];
  $scope.marketSubmissions = [];
  $scope.selectedGroups = [];
  $scope.selectedChannelIDS = [];
  $scope.selectedGroupChannelIDS = [];
  $scope.selectedChannelName = [];
  $scope.adminStats = {
    mpEarnings: 0,
    subEarnings: 0,
    earnings: 0,
    ffEarnings: 0,
    refunds: 0,
    refundAmount: 0,
    future: 0
  };

  $scope.genres = [
    'Alternative Rock',
    'Ambient',
    'Creative',
    'Chill',
    'Classical',
    'Country',
    'Dance & EDM',
    'Dancehall',
    'Deep House',
    'Disco',
    'Drum & Bass',
    'Dubstep',
    'Electronic',
    'Festival',
    'Folk',
    'Hip-Hop/RNB',
    'House',
    'Indie/Alternative',
    'Latin',
    'Trap',
    'Vocalists/Singer-Songwriter'
  ];

  $scope.allowance = 0;
  $scope.genre = "all";
  $scope.displayType = 'channel';
  $scope.limit = 10;
  $scope.marketLimit = 10;
  $scope.isLoggedIn = SessionService.getUser() ? true : false;
  if (!SessionService.getUser()) {
    $state.go('admin');
  }
  $scope.user = SessionService.getUser();
  $scope.user.isAdmin = $scope.user.role == 'admin' ? true : false;
  $scope.uniqueGroup = [];
  $scope.paidRepostAccounts = [];
  $scope.dynamicButton = [{
    "name": "SUBMITTER'S NAME",
    "appendText": " {SUBMITTERS_NAME} "
  }, {
    "name": "SUBMITTER'S EMAIL",
    "appendText": " {SUBMITTERS_EMAIL} "
  }, {
    "name": "TRACK TITLE",
    "appendText": " {TRACK_TITLE} "
  }, {
    "name": "TRACK TITLE W/ LINK",
    "appendText": " {TRACK_TITLE_WITH_LINK} "
  }, {
    "name": "TRACK ARTIST",
    "appendText": " {TRACK_ARTIST} "
  }, {
    "name": "TRACK ARTIST W/ LINK",
    "appendText": " {TRACK_ARTIST_WITH_LINK} "
  }, {
    "name": "TODAYS DATE",
    "appendText": " {TODAYSDATE} "
  }, {
    "name": "SUBMITTED TO ACCOUNT NAME",
    "appendText": " {SUBMITTED_TO_ACCOUNT_NAME} "
  }, {
    "name": "SUBMITTED ACCOUNT NAME W/ LINK",
    "appendText": " {SUBMITTED_ACCOUNT_NAME_WITH_LINK} "
  }];
  if (window.location.href.indexOf('admin/submissions#mysubmissions') != -1) {
    $('.nav-tabs a[href="#mysubmissions"]').tab('show');
  } else if (window.location.href.indexOf('admin/submissions#marketplace') != -1) {
    $('.nav-tabs a[href="#marketplace"]').tab('show');
  } else if (window.location.href.indexOf('admin/submissions#managesubmissions') != -1) {
    $('.nav-tabs a[href="#managesubmissions"]').tab('show');
  }

  $scope.sendTestMail = function(index) {
    $scope.emailIndex = index;
    $scope.testEmail("testemail@artistsunlimited.com");
    // $scope.showTestEmailModal = true;
    // $('#emailModal').modal('show');
  }

  $scope.testEmail = function(email) {
    $scope.showTestEmailModal = false;
    $('#emailModal').modal('hide');
    var subject = $scope.customEmailButtons[$scope.emailIndex].subject;
    var body = $scope.customEmailButtons[$scope.emailIndex].emailBody;
    body = formatForTestEmail(body, email);
    subject = formatForTestEmail(subject, email);
    $window.open("mailto:" + email + "?body=" + body + "&subject=" + subject, "_self");
  }

  function formatForTestEmail(item, email) {
    return encodeURIComponent(item.replace(/{SUBMITTERS_EMAIL}/g, email).replace(/{SUBMITTERS_NAME}/g, "Johnny Submitter").replace(/{TRACK_TITLE_WITH_LINK}/g, "Oliver Nelson ft. Kaleem Taylor - Ain't A Thing" + ' (https://soundcloud.com/olivernelson/oliver-nelson-ft-kaleem-taylor-aint-a-thing-3)').replace(/{TRACK_TITLE}/g, "Oliver Nelson ft. Kaleem Taylor - Ain't A Thing").replace(/{TRACK_ARTIST_WITH_LINK}/g, "Oliver Nelson" + ' (https://soundcloud.com/olivernelson)').replace(/{TRACK_ARTIST}/g, "Oliver Nelson").replace(/{SUBMITTED_TO_ACCOUNT_NAME}/g, "La Tropical").replace(/{SUBMITTED_ACCOUNT_NAME_WITH_LINK}/g, 'La Tropical (https://soundcloud.com/latropical)').replace('{TODAYSDATE}', new Date().toLocaleDateString()));
  }

  $scope.togglePoolOn = function() {
    // $scope.user.repostSettings.poolOn = !$scope.user.repostSettings.poolOn;
    SessionService.create($scope.user);
    AccountSettingServices.updateAdminProfile({
      'repostSettings.poolOn': $scope.user.repostSettings.poolOn
    });
  }

  $scope.whatIsPool = function() {
    $.Zebra_Dialog("By enabling the AU Marketplace you agree that every submission that you accept will also be shared to all other AU Admins in the AU Marketplace. By doing so, you will gain access to all submissions from other admins that have enabled the AU MarketPlace. As well, you will make 10% of every sale that is made from a submission that originated to one of your network accounts.");
  }

  $scope.changeChannelSelect = function() {
    $scope.showingElements = [];
    $scope.loadSubmissions();
  }
  
    $scope.changeChannelSelect_repost = function() {
      $scope.marketSubmissions = [];
      $scope.loadMarketSubmissions();
    }

  $scope.loadSubmissions = function() {
    var genre = $scope.genre.replace(/[0-9]/g, '');
    var selectedGenre = genre.replace('(', '').replace(')', '').trim();
    $scope.processing = true;
    $http.get('/api/submissions/unaccepted?genre=' + encodeURIComponent(selectedGenre) + "&skip=" + $scope.showingElements.length + "&limit=" + $scope.limit + "&userID=" + $scope.channelSelect)
      .then(function(res) {
        $scope.processing = false;
        if (res.data.length > 0) {
          angular.forEach(res.data, function(d) {
            d.selectedChannelName = [];
            d.selectedChannelIDS = [];
            d.selectedGroups = [];
            d.playerURL = $sce.trustAsResourceUrl("https://w.soundcloud.com/player/?url=http://api.soundcloud.com/tracks/" + d.trackID + "&auto_play=false&show_artwork=true")
            $scope.showingElements.push(d)
          });
        }
        if (!$scope.$$phase) $scope.$apply();
      })
      .then(null, function(err) {
        $scope.processing = false;
        $.Zebra_Dialog('Error: Could not get channels.')
        console.log(err);
      });
  }

  $scope.loadMore = function() {
    $scope.loadSubmissions();
  }

  $scope.loadMoreMarket = function() {
    $scope.loadMarketSubmissions();
  }

  $scope.loadMarketSubmissions = function() {
    var genre = $scope.genre.replace(/[0-9]/g, '');
    var selectedGenre = genre.replace('(', '').replace(')', '').trim();
    $scope.processing = true;
    $http.get('/api/submissions/getMarketPlaceSubmission?genre=' + encodeURIComponent(selectedGenre) + "&skip=" + $scope.marketSubmissions.length + "&limit=" + $scope.marketLimit)
      .then(function(res) {
        $scope.processing = false;
        if (res.data.length > 0) {
          angular.forEach(res.data, function(d) {
            d.selectedChannelName = [];
            d.selectedChannelIDS = [];
            d.selectedGroups = [];
            d.pooledSendDate = new Date(d.pooledSendDate);
            d.playerURL = $sce.trustAsResourceUrl("https://w.soundcloud.com/player/?url=http://api.soundcloud.com/tracks/" + d.trackID + "&auto_play=false&show_artwork=true")
            $scope.marketSubmissions.push(d)
          });
        }
      })
      .then(null, function(err) {
        $scope.processing = false;
        $.Zebra_Dialog('Error: Could not get channels.')
        console.log(err);
      });
  }

  $scope.checkboxStyle = function(sub, chan) {
    if (sub.approvedChannels.includes(chan.user.id)) return {
      'background-color': '#E5FEE5',
      'border-radius': '5px',
      'padding': '5px 5px'
    }
    else return {}
  }

  $scope.changeBox = function(sub, chan) {
    if (!chan.linkInBio) {
      sub[chan.user.username] = false;
      $.Zebra_Dialog("You need to <span style='font-weight:bold'>put this link in your Soundcloud bio</span> to be able to sell reposts with this account:<br><br><a href='" + chan.submissionUrl + "' target='_blank'>" + chan.submissionUrl + '</a>');
    } else {
      var index = sub.selectedChannelIDS.indexOf(chan.user.id);
      if (index == -1) {
        sub.selectedChannelIDS.push(chan.user.id);
        sub.selectedChannelName.push(chan.user.username);
      } else {
        sub.selectedChannelIDS.splice(index, 1);
        sub.selectedChannelName.splice(index, 1);
      }
    }
  }

  $scope.changeBoxGroup = function(sub, group) {
    var ind = sub.selectedGroups.indexOf(group);
    if (sub[group]) {
      if (ind == -1) {
        sub.selectedGroups.push(group);
      }
    } else {
      sub.selectedGroups.splice(ind, 1);
    }
    $scope.selectedGroupChannelIDS = [];
    sub.selectedGroups.forEach(function(g) {
      $scope.paidRepostAccounts.forEach(function(acc) {
        if (acc.groups.indexOf(g) != -1) {
          if ($scope.selectedGroupChannelIDS.indexOf(acc.user.id) == -1) {
            $scope.selectedGroupChannelIDS.push(acc.user.id);
          }
        }
      });
    });
  }

  $scope.save = function(submi) {
    submi.selectedChannelIDS.forEach(function(cid) {
      if ($scope.selectedGroupChannelIDS.indexOf(cid) == -1) {
        $scope.selectedGroupChannelIDS.push(cid);
      }
    });
    submi.channelIDS = $scope.selectedGroupChannelIDS;
    if (submi.channelIDS.length == 0) {
      $.Zebra_Dialog("You have not selected any channels to accept repost.");
    } else {
      delete submi.selectedGroups;
      delete submi.selectedChannelIDS;
      delete submi.selectedChannelName;
      submi.password = $rootScope.password;
      $scope.processing = true;
      $http.put("/api/submissions/save", submi)
        .then(function(sub) {
          $scope.showingElements.splice($scope.showingElements.indexOf(submi), 1);
          $scope.processing = false;
        })
        .then(null, function(err) {
          $scope.processing = false;
          $.Zebra_Dialog("ERROR: did not Save")
        })
    }
  }

  $scope.ignore = function(submission) {
    $scope.processing = true;
    $http.delete('/api/submissions/ignore/' + submission._id + '/' + $rootScope.password)
      .then(function(res) {
        var index = $scope.showingElements.indexOf(submission);
        $scope.showingElements.splice(index, 1);
        $scope.processing = false;
      })
      .then(null, function(err) {
        $scope.processing = false;
        $.Zebra_Dialog("ERROR: did not Ignore");
      });
  }

  $scope.decline = function(submission) {
    $scope.processing = true;
    $http.delete('/api/submissions/decline/' + submission._id + '/' + $rootScope.password)
      .then(function(res) {
        var index = $scope.showingElements.indexOf(submission);
        $scope.showingElements.splice(index, 1);
        $scope.processing = false;
      })
      .then(null, function(err) {
        $scope.processing = false;
        $.Zebra_Dialog("ERROR: did not Decline");
      });
  }

  $scope.marketSave = function(submi) {
    // if ($scope.allowance <= 0) $.Zebra_Dialog('You are out of Marketplace Credits. For every direct submission you make a sale on, you will be given 10 more Marketplace Credits.')
    // else if ($scope.marketSubmissions.indexOf(submi) != 0) $.Zebra_Dialog('Please respond to the first submission first.');
    // else {
    submi.selectedChannelIDS.forEach(function(cid) {
      if ($scope.selectedGroupChannelIDS.indexOf(cid) == -1) {
        $scope.selectedGroupChannelIDS.push(cid);
      }
    });
    submi.pooledChannelIDS = submi.pooledChannelIDS.concat($scope.selectedGroupChannelIDS);
    delete submi.selectedGroups;
    delete submi.selectedChannelIDS;
    delete submi.selectedChannelName;
    submi.password = $rootScope.password;
    $scope.processing = true;
    $http.put("/api/submissions/save", submi)
      .then(function(sub) {
        $scope.marketSubmissions.splice($scope.marketSubmissions.indexOf(submi), 1);
        $scope.processing = false;
        // $scope.allowance--;
      })
      .then(null, function(err) {
        $scope.processing = false;
        $.Zebra_Dialog("ERROR: did not Save")
      })
      // }
  }

  $scope.marketIgnore = function(submission) {
      // if ($scope.allowance <= 0) $.Zebra_Dialog('You are out of Marketplace Credits. For every direct submission you make a sale on, you will be given 10 more Marketplace Credits.')
      // else if ($scope.marketSubmissions.indexOf(submission) != 0) $.Zebra_Dialog('Please respond to the first submission first.');
      // else {
      $scope.processing = true;
      $http.delete('/api/submissions/ignore/' + submission._id + '/' + $rootScope.password)
        .then(function(res) {
          var index = $scope.marketSubmissions.indexOf(submission);
          $scope.marketSubmissions.splice(index, 1);
          $scope.processing = false;
          // $scope.allowance--;
        })
        .then(null, function(err) {
          $scope.processing = false;
          $.Zebra_Dialog("ERROR: did not Ignore");
        });
    }
    // }

  $scope.openEmailClient = function(sub, item) {
    var toEmail = formatForEmailClient(item.toEmail, sub);
    var subject = (item.subject != undefined ? formatForEmailClient(item.subject, sub) : "");
    var body = (item.emailBody != undefined ? formatForEmailClient(item.emailBody, sub) : "");
    $window.open("mailto:" + encodeURIComponent(toEmail) + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body), "_self");
  }

  function formatForEmailClient(text, sub) {
    return text.replace(/{SUBMITTERS_EMAIL}/g, sub.email).replace(/{SUBMITTERS_NAME}/g, sub.name).replace(/{TRACK_TITLE_WITH_LINK}/g, sub.title + ' (' + sub.trackURL + ')').replace(/{TRACK_TITLE}/g, sub.title).replace(/{TRACK_ARTIST_WITH_LINK}/g, sub.trackArtist + ' (' + sub.trackArtistURL + ')').replace(/{TRACK_ARTIST}/g, sub.trackArtist).replace(/{SUBMITTED_TO_ACCOUNT_NAME}/g, sub.userID.soundcloud.username).replace(/{SUBMITTED_ACCOUNT_NAME_WITH_LINK}/g, sub.userID.soundcloud.username + ' (' + sub.userID.soundcloud.permalinkURL + ')').replace(/{TODAYSDATE}/g, new Date().toLocaleDateString());
  }

  $scope.getSubmissionByGenre = function() {
    $http.get('/api/submissions/getGroupedSubmissions').then(function(res) {
      var unacceptedSubmission = res.data;
      for (var i = 0; i < $scope.genreArray.length; i++) {
        for (var j = 0; j < unacceptedSubmission.length; j++) {
          if ($scope.genreArray[i] == unacceptedSubmission[j]._id) {
            $scope.genreArray[i] = $scope.genreArray[i] + ' (' + unacceptedSubmission[j].total_count + ')';
          }
        }
      }
    });
  }

  $scope.customEmailButtons = $scope.user.submissionsCustomEmailButtons.length > 0 ? $scope.user.submissionsCustomEmailButtons : [];
  if ($scope.customEmailButtons.length == 0) {
    $scope.customEmailButtons.push({
      toEmail: '',
      subject: '',
      emailBody: '',
      buttonText: '',
      buttonBgColor: ''
    });
  }
  $scope.saveSettings = function() {
    var valid = true;
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    angular.forEach($scope.customEmailButtons, function(cb) {
      if (!cb.toEmail.includes("{SUBMITTERS_EMAIL}")) {
        var validEmail = re.test(cb.toEmail);
        if (!validEmail || !cb.buttonText) {
          valid = false;
        }
      }
    });
    if (!valid) {
      $.Zebra_Dialog('Please enter {SUBMITTERS_EMAIL} or a well formatted email address in all To Email fields and a title for each button.');
      return;
    }
    $scope.processing = true;
    $scope.user.submissionsCustomEmailButtons = $scope.customEmailButtons;
    $http.post('/api/database/updateSubmissionsCustomEmailButtons', {
      customEmailButtons: $scope.user.submissionsCustomEmailButtons,
    }).then(function(res) {
      $scope.processing = false;
      SessionService.create(res.data);
      $scope.user = SessionService.getUser();
    });
  }

  $scope.addItem = function() {
    $scope.customEmailButtons.push({
      toEmail: '',
      subject: '',
      emailBody: '',
      buttonText: '',
      buttonBgColor: ''
    });
  }

  $http.get('/api/submissions/counts')
    .then(function(res) {
      $scope.counts = res.data
    })

  $scope.removeItem = function(index) {
    $scope.customEmailButtons.splice(index, 1);
  }

  $scope.addEventClass = function(index, type) {
    $('.selectedBox').removeClass("selectedBox");
    $("." + type + index).addClass("selectedBox");
  }

  $scope.appendBody = function(btn) {
    if ($('.selectedBox').length) {
      var boxIndex = $('.selectedBox').attr("index");
      var cursorPos = $('.selectedBox').prop('selectionStart');
      var v = $('.selectedBox').val();
      var textBefore = v.substring(0, cursorPos);
      var textAfter = v.substring(cursorPos, v.length);
      var newtext = textBefore + btn.appendText + textAfter;
      $('.selectedBox').val(newtext);
      $('.selectedBox').trigger('input')
      $('.selectedBox').removeClass("selectedBox");
    }
  }

  $scope.getPaidRepostAccounts = function() {
    $http.get('/api/submissions/getPaidRepostAccounts').then(function(res) {
      $scope.paidRepostAccounts = res.data;
      for (var i = 0; i < $scope.paidRepostAccounts.length; i++) {
        $scope.paidRepostAccounts[i].groups.forEach(function(acc) {
          if (acc != "" && $scope.uniqueGroup.indexOf(acc) === -1) {
            $scope.uniqueGroup.push(acc);
          }
        });
      }
    });
  }

  /*Sold Reposts*/

  $scope.getSoldReposts = function() {
    $http.post('/api/submissions/getSoldReposts', {
      lowDate: $scope.lowDate,
      highDate: $scope.highDate
    }).then(function(res) {
      $scope.adminStats.mpEarnings = 0;
      $scope.adminStats.subEarnings = 0;
      $scope.adminStats.earnings = 0;
      $scope.adminStats.refunds = 0;
      $scope.adminStats.refundAmount = 0;
      $scope.adminStats.future = 0;
      res.data.forEach(function(el) {
        try {
          if (el.data.payout) {
            if (el.data.payout.batch_header) {
              el.payout = "$" + new Number(el.data.payout.batch_header.amount.value).toFixed(2) + " Earned";
              if (el.marketplace) $scope.adminStats.mpEarnings += new Number(el.data.payout.batch_header.amount.value);
              else $scope.adminStats.subEarnings += new Number(el.data.payout.batch_header.amount.value);
              $scope.adminStats.earnings += new Number(el.data.payout.batch_header.amount.value);
            } else {
              el.payout = "$" + new Number(el.data.payout.amount.total).toFixed(2) + " Refunded";
              $scope.adminStats.refunds += 1;
              $scope.adminStats.refundAmount += new Number(el.data.payout.amount.total);
            }
          } else {
            el.payout = "Incomplete"
            $scope.adminStats.future += 1;
          }
        } catch (e) {
          console.log(e)
        };
        el.shareLink = window.location.origin + "/repostevents/" + el.user.soundcloud.pseudoname + "/" + el.data.pseudoname;
      })
      res.data.sort(function(a, b) {
        return new Date(b.data.day) - new Date(a.data.day);
      })
      $scope.soldReposts = res.data;
      $scope.adminStats.soldReposts = res.data.length;
    });
    $scope.sortType = 'name';
    $scope.sortReverse = false;
    $scope.searchTerm = '';
  }


  $scope.getSubmissionData = function() {
    $http.post('/api/submissions/submissionData', {
      lowDate: $scope.lowDate,
      highDate: $scope.highDate
    }).then(function(res) {
      $scope.adminStats.repSubCount = res.data.directSubs.length;
      $scope.adminStats.premSubCount = res.data.premiereSubs.length;
      var directSubAmounts = {};
      $scope.adminStats.ffEarnings = 0;
      res.data.directSubs.forEach(function(el) {
        if (!!directSubAmounts[el.sub.userID]) directSubAmounts[el.sub.userID] += 1;
        else directSubAmounts[el.sub.userID] = 1;
        $scope.adminStats.ffEarnings += !!el.ffEarnings ? el.ffEarnings : 0;
      })
      var premiereSubAmounts = {};
      res.data.premiereSubs.forEach(function(el) {
        if (!!premiereSubAmounts[el.userID]) premiereSubAmounts[el.userID] += 1;
        else premiereSubAmounts[el.userID] = 1;
      })
      $scope.accounts = res.data.accounts;
      $scope.accounts.forEach(function(acct) {
        acct.repSubCount = !!directSubAmounts[acct.userID._id] ? directSubAmounts[acct.userID._id] : 0;
        acct.premSubCount = !!premiereSubAmounts[acct.userID._id] ? premiereSubAmounts[acct.userID._id] : 0;
        // acct.paidSubs = 0;
        // acct.acceptedSubs = 0;
        // res.data.acceptedSubs.forEach(function(el) {
        //   if (el.channelIDS.includes(acct.userID.soundcloud.id) || el.pooledChannelIDS.includes(acct.userID.soundcloud.id)) {
        //     acct.acceptedSubs++;
        //   }
        //   var found = false;
        //   el.paidPooledChannels.forEach(function(chan) {
        //     if (chan.user.id == acct.userID.soundcloud.id) found = true;
        //   })
        //   el.paidChannels.forEach(function(chan) {
        //     if (chan.user.id == acct.userID.soundcloud.id) found = true;
        //   })
        //   if (found) acct.paidSubs++;
        // })
        // acct.payAcceptRatio = acct.paidSubs / acct.acceptedSubs * 100;

      })

      function getAcctReposts() {
        setTimeout(function() {
          if ($scope.soldReposts) {
            $scope.adminStats.earnings += $scope.adminStats.ffEarnings;
            var reposts = {};
            $scope.soldReposts.forEach(function(el) {
              if (!!reposts[el.data.userID]) reposts[el.data.userID].push(el)
              else reposts[el.data.userID] = [el];
            });
            $scope.accounts.forEach(function(acct) {
              acct.repostCount = !!reposts[acct.userID.soundcloud.id] ? reposts[acct.userID.soundcloud.id].length : 0;
              acct.earnings = 0;
              acct.refunds = 0;
              acct.refundAmount = 0;
              acct.future = 0;
              if (!!reposts[acct.userID.soundcloud.id]) {
                reposts[acct.userID.soundcloud.id].forEach(function(el) {
                  if (el.data.payout) {
                    if (el.data.payout.batch_header) {
                      acct.earnings += new Number(el.data.payout.batch_header.amount.value);
                    } else {
                      acct.refunds += 1;
                      acct.refundAmount += new Number(el.data.payout.amount.total);
                    }
                  } else {
                    acct.future += 1;
                  }
                });
              }
            })
            if (!$scope.$$phase) $scope.$apply();
          } else getAcctReposts();
        }, 500);
      }
      getAcctReposts();
    })
  }

  $scope.recalculate = function() {
    $scope.soldReposts = undefined;
    $scope.accounts = undefined;
    $scope.adminStats = {};
    $scope.getSoldReposts();
    $scope.getSubmissionData();
  }

  $scope.changeScale = function() {
    console.log($scope.scale);
    $scope.highDate = new Date();
    $scope.lowDate = new Date(new Date().getTime() - parseInt($scope.scale) * 24 * 3600000);
    $scope.recalculate();
  }
  $scope.incrementRange = function() {
    $scope.highDate = new Date($scope.highDate.getTime() + parseInt($scope.scale) * 24 * 3600000);
    $scope.lowDate = new Date($scope.lowDate.getTime() + parseInt($scope.scale) * 24 * 3600000);
    $scope.recalculate();
  }
  $scope.decrementRange = function() {
    $scope.highDate = new Date($scope.highDate.getTime() - parseInt($scope.scale) * 24 * 3600000);
    $scope.lowDate = new Date($scope.lowDate.getTime() - parseInt($scope.scale) * 24 * 3600000);
    $scope.recalculate();
  }
  $scope.scale = "7";
  $scope.changeScale();

  $scope.getPaidRepostAccounts();
  $scope.loadSubmissions();
  $scope.loadMarketSubmissions();

  $scope.getDiffTimeText = function(date) {
    var t = Math.floor((new Date(date).getTime() - new Date().getTime()) / 1000);
    var days, hours, minutes, seconds;
    hours = (Math.floor(t / 3600));
    t -= hours * 3600;
    minutes = (Math.floor(t / 60));

    return [
      hours + 'h',
      minutes + 'm'
    ].join(' ');
  }

  // $http.get('/api/submissions/currentAllowance')

  //   .then(function(res) {
  //     $scope.allowance = res.data.allowance;
  //     if (!$scope.$$phase) $scope.$apply();
  //   }).then(null, console.log);
});

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJzdWJtaXNzaW9ucy9jb250cm9sbGVycy9zdWJtaXNzaW9uQ29udHJvbGxlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKSB7XHJcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3N1Ym1pc3Npb25zJywge1xyXG4gICAgdXJsOiAnL2FkbWluL3N1Ym1pc3Npb25zJyxcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvc3VibWlzc2lvbnMvdmlld3Mvc3VibWlzc2lvbnMuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnU3VibWlzc2lvbkNvbnRyb2xsZXInXHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ1N1Ym1pc3Npb25Db250cm9sbGVyJywgZnVuY3Rpb24oJHJvb3RTY29wZSwgJHN0YXRlLCAkc2NvcGUsICRodHRwLCAkd2luZG93LCBBdXRoU2VydmljZSwgU2Vzc2lvblNlcnZpY2UsIEFjY291bnRTZXR0aW5nU2VydmljZXMsICRzY2UpIHtcclxuICAkc2NvcGUuY291bnRlciA9IDA7XHJcbiAgJHNjb3BlLmNoYW5uZWxTZWxlY3QgPSBcImFsbFwiO1xyXG4gICRzY29wZS5zaG93aW5nRWxlbWVudHMgPSBbXTtcclxuICAkc2NvcGUubWFya2V0U3VibWlzc2lvbnMgPSBbXTtcclxuICAkc2NvcGUuc2VsZWN0ZWRHcm91cHMgPSBbXTtcclxuICAkc2NvcGUuc2VsZWN0ZWRDaGFubmVsSURTID0gW107XHJcbiAgJHNjb3BlLnNlbGVjdGVkR3JvdXBDaGFubmVsSURTID0gW107XHJcbiAgJHNjb3BlLnNlbGVjdGVkQ2hhbm5lbE5hbWUgPSBbXTtcclxuICAkc2NvcGUuYWRtaW5TdGF0cyA9IHtcclxuICAgIG1wRWFybmluZ3M6IDAsXHJcbiAgICBzdWJFYXJuaW5nczogMCxcclxuICAgIGVhcm5pbmdzOiAwLFxyXG4gICAgZmZFYXJuaW5nczogMCxcclxuICAgIHJlZnVuZHM6IDAsXHJcbiAgICByZWZ1bmRBbW91bnQ6IDAsXHJcbiAgICBmdXR1cmU6IDBcclxuICB9O1xyXG5cclxuICAkc2NvcGUuZ2VucmVzID0gW1xyXG4gICAgJ0FsdGVybmF0aXZlIFJvY2snLFxyXG4gICAgJ0FtYmllbnQnLFxyXG4gICAgJ0NyZWF0aXZlJyxcclxuICAgICdDaGlsbCcsXHJcbiAgICAnQ2xhc3NpY2FsJyxcclxuICAgICdDb3VudHJ5JyxcclxuICAgICdEYW5jZSAmIEVETScsXHJcbiAgICAnRGFuY2VoYWxsJyxcclxuICAgICdEZWVwIEhvdXNlJyxcclxuICAgICdEaXNjbycsXHJcbiAgICAnRHJ1bSAmIEJhc3MnLFxyXG4gICAgJ0R1YnN0ZXAnLFxyXG4gICAgJ0VsZWN0cm9uaWMnLFxyXG4gICAgJ0Zlc3RpdmFsJyxcclxuICAgICdGb2xrJyxcclxuICAgICdIaXAtSG9wL1JOQicsXHJcbiAgICAnSG91c2UnLFxyXG4gICAgJ0luZGllL0FsdGVybmF0aXZlJyxcclxuICAgICdMYXRpbicsXHJcbiAgICAnVHJhcCcsXHJcbiAgICAnVm9jYWxpc3RzL1Npbmdlci1Tb25nd3JpdGVyJ1xyXG4gIF07XHJcblxyXG4gICRzY29wZS5hbGxvd2FuY2UgPSAwO1xyXG4gICRzY29wZS5nZW5yZSA9IFwiYWxsXCI7XHJcbiAgJHNjb3BlLmRpc3BsYXlUeXBlID0gJ2NoYW5uZWwnO1xyXG4gICRzY29wZS5saW1pdCA9IDEwO1xyXG4gICRzY29wZS5tYXJrZXRMaW1pdCA9IDEwO1xyXG4gICRzY29wZS5pc0xvZ2dlZEluID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpID8gdHJ1ZSA6IGZhbHNlO1xyXG4gIGlmICghU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSB7XHJcbiAgICAkc3RhdGUuZ28oJ2FkbWluJyk7XHJcbiAgfVxyXG4gICRzY29wZS51c2VyID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpO1xyXG4gICRzY29wZS51c2VyLmlzQWRtaW4gPSAkc2NvcGUudXNlci5yb2xlID09ICdhZG1pbicgPyB0cnVlIDogZmFsc2U7XHJcbiAgJHNjb3BlLnVuaXF1ZUdyb3VwID0gW107XHJcbiAgJHNjb3BlLnBhaWRSZXBvc3RBY2NvdW50cyA9IFtdO1xyXG4gICRzY29wZS5keW5hbWljQnV0dG9uID0gW3tcclxuICAgIFwibmFtZVwiOiBcIlNVQk1JVFRFUidTIE5BTUVcIixcclxuICAgIFwiYXBwZW5kVGV4dFwiOiBcIiB7U1VCTUlUVEVSU19OQU1FfSBcIlxyXG4gIH0sIHtcclxuICAgIFwibmFtZVwiOiBcIlNVQk1JVFRFUidTIEVNQUlMXCIsXHJcbiAgICBcImFwcGVuZFRleHRcIjogXCIge1NVQk1JVFRFUlNfRU1BSUx9IFwiXHJcbiAgfSwge1xyXG4gICAgXCJuYW1lXCI6IFwiVFJBQ0sgVElUTEVcIixcclxuICAgIFwiYXBwZW5kVGV4dFwiOiBcIiB7VFJBQ0tfVElUTEV9IFwiXHJcbiAgfSwge1xyXG4gICAgXCJuYW1lXCI6IFwiVFJBQ0sgVElUTEUgVy8gTElOS1wiLFxyXG4gICAgXCJhcHBlbmRUZXh0XCI6IFwiIHtUUkFDS19USVRMRV9XSVRIX0xJTkt9IFwiXHJcbiAgfSwge1xyXG4gICAgXCJuYW1lXCI6IFwiVFJBQ0sgQVJUSVNUXCIsXHJcbiAgICBcImFwcGVuZFRleHRcIjogXCIge1RSQUNLX0FSVElTVH0gXCJcclxuICB9LCB7XHJcbiAgICBcIm5hbWVcIjogXCJUUkFDSyBBUlRJU1QgVy8gTElOS1wiLFxyXG4gICAgXCJhcHBlbmRUZXh0XCI6IFwiIHtUUkFDS19BUlRJU1RfV0lUSF9MSU5LfSBcIlxyXG4gIH0sIHtcclxuICAgIFwibmFtZVwiOiBcIlRPREFZUyBEQVRFXCIsXHJcbiAgICBcImFwcGVuZFRleHRcIjogXCIge1RPREFZU0RBVEV9IFwiXHJcbiAgfSwge1xyXG4gICAgXCJuYW1lXCI6IFwiU1VCTUlUVEVEIFRPIEFDQ09VTlQgTkFNRVwiLFxyXG4gICAgXCJhcHBlbmRUZXh0XCI6IFwiIHtTVUJNSVRURURfVE9fQUNDT1VOVF9OQU1FfSBcIlxyXG4gIH0sIHtcclxuICAgIFwibmFtZVwiOiBcIlNVQk1JVFRFRCBBQ0NPVU5UIE5BTUUgVy8gTElOS1wiLFxyXG4gICAgXCJhcHBlbmRUZXh0XCI6IFwiIHtTVUJNSVRURURfQUNDT1VOVF9OQU1FX1dJVEhfTElOS30gXCJcclxuICB9XTtcclxuICBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignYWRtaW4vc3VibWlzc2lvbnMjbXlzdWJtaXNzaW9ucycpICE9IC0xKSB7XHJcbiAgICAkKCcubmF2LXRhYnMgYVtocmVmPVwiI215c3VibWlzc2lvbnNcIl0nKS50YWIoJ3Nob3cnKTtcclxuICB9IGVsc2UgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ2FkbWluL3N1Ym1pc3Npb25zI21hcmtldHBsYWNlJykgIT0gLTEpIHtcclxuICAgICQoJy5uYXYtdGFicyBhW2hyZWY9XCIjbWFya2V0cGxhY2VcIl0nKS50YWIoJ3Nob3cnKTtcclxuICB9IGVsc2UgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ2FkbWluL3N1Ym1pc3Npb25zI21hbmFnZXN1Ym1pc3Npb25zJykgIT0gLTEpIHtcclxuICAgICQoJy5uYXYtdGFicyBhW2hyZWY9XCIjbWFuYWdlc3VibWlzc2lvbnNcIl0nKS50YWIoJ3Nob3cnKTtcclxuICB9XHJcblxyXG4gICRzY29wZS5zZW5kVGVzdE1haWwgPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgJHNjb3BlLmVtYWlsSW5kZXggPSBpbmRleDtcclxuICAgICRzY29wZS50ZXN0RW1haWwoXCJ0ZXN0ZW1haWxAYXJ0aXN0c3VubGltaXRlZC5jb21cIik7XHJcbiAgICAvLyAkc2NvcGUuc2hvd1Rlc3RFbWFpbE1vZGFsID0gdHJ1ZTtcclxuICAgIC8vICQoJyNlbWFpbE1vZGFsJykubW9kYWwoJ3Nob3cnKTtcclxuICB9XHJcblxyXG4gICRzY29wZS50ZXN0RW1haWwgPSBmdW5jdGlvbihlbWFpbCkge1xyXG4gICAgJHNjb3BlLnNob3dUZXN0RW1haWxNb2RhbCA9IGZhbHNlO1xyXG4gICAgJCgnI2VtYWlsTW9kYWwnKS5tb2RhbCgnaGlkZScpO1xyXG4gICAgdmFyIHN1YmplY3QgPSAkc2NvcGUuY3VzdG9tRW1haWxCdXR0b25zWyRzY29wZS5lbWFpbEluZGV4XS5zdWJqZWN0O1xyXG4gICAgdmFyIGJvZHkgPSAkc2NvcGUuY3VzdG9tRW1haWxCdXR0b25zWyRzY29wZS5lbWFpbEluZGV4XS5lbWFpbEJvZHk7XHJcbiAgICBib2R5ID0gZm9ybWF0Rm9yVGVzdEVtYWlsKGJvZHksIGVtYWlsKTtcclxuICAgIHN1YmplY3QgPSBmb3JtYXRGb3JUZXN0RW1haWwoc3ViamVjdCwgZW1haWwpO1xyXG4gICAgJHdpbmRvdy5vcGVuKFwibWFpbHRvOlwiICsgZW1haWwgKyBcIj9ib2R5PVwiICsgYm9keSArIFwiJnN1YmplY3Q9XCIgKyBzdWJqZWN0LCBcIl9zZWxmXCIpO1xyXG4gIH1cclxuXHJcbiAgZnVuY3Rpb24gZm9ybWF0Rm9yVGVzdEVtYWlsKGl0ZW0sIGVtYWlsKSB7XHJcbiAgICByZXR1cm4gZW5jb2RlVVJJQ29tcG9uZW50KGl0ZW0ucmVwbGFjZSgve1NVQk1JVFRFUlNfRU1BSUx9L2csIGVtYWlsKS5yZXBsYWNlKC97U1VCTUlUVEVSU19OQU1FfS9nLCBcIkpvaG5ueSBTdWJtaXR0ZXJcIikucmVwbGFjZSgve1RSQUNLX1RJVExFX1dJVEhfTElOS30vZywgXCJPbGl2ZXIgTmVsc29uIGZ0LiBLYWxlZW0gVGF5bG9yIC0gQWluJ3QgQSBUaGluZ1wiICsgJyAoaHR0cHM6Ly9zb3VuZGNsb3VkLmNvbS9vbGl2ZXJuZWxzb24vb2xpdmVyLW5lbHNvbi1mdC1rYWxlZW0tdGF5bG9yLWFpbnQtYS10aGluZy0zKScpLnJlcGxhY2UoL3tUUkFDS19USVRMRX0vZywgXCJPbGl2ZXIgTmVsc29uIGZ0LiBLYWxlZW0gVGF5bG9yIC0gQWluJ3QgQSBUaGluZ1wiKS5yZXBsYWNlKC97VFJBQ0tfQVJUSVNUX1dJVEhfTElOS30vZywgXCJPbGl2ZXIgTmVsc29uXCIgKyAnIChodHRwczovL3NvdW5kY2xvdWQuY29tL29saXZlcm5lbHNvbiknKS5yZXBsYWNlKC97VFJBQ0tfQVJUSVNUfS9nLCBcIk9saXZlciBOZWxzb25cIikucmVwbGFjZSgve1NVQk1JVFRFRF9UT19BQ0NPVU5UX05BTUV9L2csIFwiTGEgVHJvcGljYWxcIikucmVwbGFjZSgve1NVQk1JVFRFRF9BQ0NPVU5UX05BTUVfV0lUSF9MSU5LfS9nLCAnTGEgVHJvcGljYWwgKGh0dHBzOi8vc291bmRjbG91ZC5jb20vbGF0cm9waWNhbCknKS5yZXBsYWNlKCd7VE9EQVlTREFURX0nLCBuZXcgRGF0ZSgpLnRvTG9jYWxlRGF0ZVN0cmluZygpKSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUudG9nZ2xlUG9vbE9uID0gZnVuY3Rpb24oKSB7XHJcbiAgICAvLyAkc2NvcGUudXNlci5yZXBvc3RTZXR0aW5ncy5wb29sT24gPSAhJHNjb3BlLnVzZXIucmVwb3N0U2V0dGluZ3MucG9vbE9uO1xyXG4gICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlKCRzY29wZS51c2VyKTtcclxuICAgIEFjY291bnRTZXR0aW5nU2VydmljZXMudXBkYXRlQWRtaW5Qcm9maWxlKHtcclxuICAgICAgJ3JlcG9zdFNldHRpbmdzLnBvb2xPbic6ICRzY29wZS51c2VyLnJlcG9zdFNldHRpbmdzLnBvb2xPblxyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUud2hhdElzUG9vbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJC5aZWJyYV9EaWFsb2coXCJCeSBlbmFibGluZyB0aGUgQVUgTWFya2V0cGxhY2UgeW91IGFncmVlIHRoYXQgZXZlcnkgc3VibWlzc2lvbiB0aGF0IHlvdSBhY2NlcHQgd2lsbCBhbHNvIGJlIHNoYXJlZCB0byBhbGwgb3RoZXIgQVUgQWRtaW5zIGluIHRoZSBBVSBNYXJrZXRwbGFjZS4gQnkgZG9pbmcgc28sIHlvdSB3aWxsIGdhaW4gYWNjZXNzIHRvIGFsbCBzdWJtaXNzaW9ucyBmcm9tIG90aGVyIGFkbWlucyB0aGF0IGhhdmUgZW5hYmxlZCB0aGUgQVUgTWFya2V0UGxhY2UuIEFzIHdlbGwsIHlvdSB3aWxsIG1ha2UgMTAlIG9mIGV2ZXJ5IHNhbGUgdGhhdCBpcyBtYWRlIGZyb20gYSBzdWJtaXNzaW9uIHRoYXQgb3JpZ2luYXRlZCB0byBvbmUgb2YgeW91ciBuZXR3b3JrIGFjY291bnRzLlwiKTtcclxuICB9XHJcblxyXG4gICRzY29wZS5jaGFuZ2VDaGFubmVsU2VsZWN0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzID0gW107XHJcbiAgICAkc2NvcGUubG9hZFN1Ym1pc3Npb25zKCk7XHJcbiAgfVxyXG4gIFxyXG4gICAgJHNjb3BlLmNoYW5nZUNoYW5uZWxTZWxlY3RfcmVwb3N0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgICRzY29wZS5tYXJrZXRTdWJtaXNzaW9ucyA9IFtdO1xyXG4gICAgICAkc2NvcGUubG9hZE1hcmtldFN1Ym1pc3Npb25zKCk7XHJcbiAgICB9XHJcblxyXG4gICRzY29wZS5sb2FkU3VibWlzc2lvbnMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW5yZSA9ICRzY29wZS5nZW5yZS5yZXBsYWNlKC9bMC05XS9nLCAnJyk7XHJcbiAgICB2YXIgc2VsZWN0ZWRHZW5yZSA9IGdlbnJlLnJlcGxhY2UoJygnLCAnJykucmVwbGFjZSgnKScsICcnKS50cmltKCk7XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAkaHR0cC5nZXQoJy9hcGkvc3VibWlzc2lvbnMvdW5hY2NlcHRlZD9nZW5yZT0nICsgZW5jb2RlVVJJQ29tcG9uZW50KHNlbGVjdGVkR2VucmUpICsgXCImc2tpcD1cIiArICRzY29wZS5zaG93aW5nRWxlbWVudHMubGVuZ3RoICsgXCImbGltaXQ9XCIgKyAkc2NvcGUubGltaXQgKyBcIiZ1c2VySUQ9XCIgKyAkc2NvcGUuY2hhbm5lbFNlbGVjdClcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICBpZiAocmVzLmRhdGEubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHJlcy5kYXRhLCBmdW5jdGlvbihkKSB7XHJcbiAgICAgICAgICAgIGQuc2VsZWN0ZWRDaGFubmVsTmFtZSA9IFtdO1xyXG4gICAgICAgICAgICBkLnNlbGVjdGVkQ2hhbm5lbElEUyA9IFtdO1xyXG4gICAgICAgICAgICBkLnNlbGVjdGVkR3JvdXBzID0gW107XHJcbiAgICAgICAgICAgIGQucGxheWVyVVJMID0gJHNjZS50cnVzdEFzUmVzb3VyY2VVcmwoXCJodHRwczovL3cuc291bmRjbG91ZC5jb20vcGxheWVyLz91cmw9aHR0cDovL2FwaS5zb3VuZGNsb3VkLmNvbS90cmFja3MvXCIgKyBkLnRyYWNrSUQgKyBcIiZhdXRvX3BsYXk9ZmFsc2Umc2hvd19hcnR3b3JrPXRydWVcIilcclxuICAgICAgICAgICAgJHNjb3BlLnNob3dpbmdFbGVtZW50cy5wdXNoKGQpXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCEkc2NvcGUuJCRwaGFzZSkgJHNjb3BlLiRhcHBseSgpO1xyXG4gICAgICB9KVxyXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICQuWmVicmFfRGlhbG9nKCdFcnJvcjogQ291bGQgbm90IGdldCBjaGFubmVscy4nKVxyXG4gICAgICAgIGNvbnNvbGUubG9nKGVycik7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmxvYWRNb3JlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUubG9hZFN1Ym1pc3Npb25zKCk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUubG9hZE1vcmVNYXJrZXQgPSBmdW5jdGlvbigpIHtcclxuICAgICRzY29wZS5sb2FkTWFya2V0U3VibWlzc2lvbnMoKTtcclxuICB9XHJcblxyXG4gICRzY29wZS5sb2FkTWFya2V0U3VibWlzc2lvbnMgPSBmdW5jdGlvbigpIHtcclxuICAgIHZhciBnZW5yZSA9ICRzY29wZS5nZW5yZS5yZXBsYWNlKC9bMC05XS9nLCAnJyk7XHJcbiAgICB2YXIgc2VsZWN0ZWRHZW5yZSA9IGdlbnJlLnJlcGxhY2UoJygnLCAnJykucmVwbGFjZSgnKScsICcnKS50cmltKCk7XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAkaHR0cC5nZXQoJy9hcGkvc3VibWlzc2lvbnMvZ2V0TWFya2V0UGxhY2VTdWJtaXNzaW9uP2dlbnJlPScgKyBlbmNvZGVVUklDb21wb25lbnQoc2VsZWN0ZWRHZW5yZSkgKyBcIiZza2lwPVwiICsgJHNjb3BlLm1hcmtldFN1Ym1pc3Npb25zLmxlbmd0aCArIFwiJmxpbWl0PVwiICsgJHNjb3BlLm1hcmtldExpbWl0KVxyXG4gICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIGlmIChyZXMuZGF0YS5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgICBhbmd1bGFyLmZvckVhY2gocmVzLmRhdGEsIGZ1bmN0aW9uKGQpIHtcclxuICAgICAgICAgICAgZC5zZWxlY3RlZENoYW5uZWxOYW1lID0gW107XHJcbiAgICAgICAgICAgIGQuc2VsZWN0ZWRDaGFubmVsSURTID0gW107XHJcbiAgICAgICAgICAgIGQuc2VsZWN0ZWRHcm91cHMgPSBbXTtcclxuICAgICAgICAgICAgZC5wb29sZWRTZW5kRGF0ZSA9IG5ldyBEYXRlKGQucG9vbGVkU2VuZERhdGUpO1xyXG4gICAgICAgICAgICBkLnBsYXllclVSTCA9ICRzY2UudHJ1c3RBc1Jlc291cmNlVXJsKFwiaHR0cHM6Ly93LnNvdW5kY2xvdWQuY29tL3BsYXllci8/dXJsPWh0dHA6Ly9hcGkuc291bmRjbG91ZC5jb20vdHJhY2tzL1wiICsgZC50cmFja0lEICsgXCImYXV0b19wbGF5PWZhbHNlJnNob3dfYXJ0d29yaz10cnVlXCIpXHJcbiAgICAgICAgICAgICRzY29wZS5tYXJrZXRTdWJtaXNzaW9ucy5wdXNoKGQpXHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coJ0Vycm9yOiBDb3VsZCBub3QgZ2V0IGNoYW5uZWxzLicpXHJcbiAgICAgICAgY29uc29sZS5sb2coZXJyKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuY2hlY2tib3hTdHlsZSA9IGZ1bmN0aW9uKHN1YiwgY2hhbikge1xyXG4gICAgaWYgKHN1Yi5hcHByb3ZlZENoYW5uZWxzLmluY2x1ZGVzKGNoYW4udXNlci5pZCkpIHJldHVybiB7XHJcbiAgICAgICdiYWNrZ3JvdW5kLWNvbG9yJzogJyNFNUZFRTUnLFxyXG4gICAgICAnYm9yZGVyLXJhZGl1cyc6ICc1cHgnLFxyXG4gICAgICAncGFkZGluZyc6ICc1cHggNXB4J1xyXG4gICAgfVxyXG4gICAgZWxzZSByZXR1cm4ge31cclxuICB9XHJcblxyXG4gICRzY29wZS5jaGFuZ2VCb3ggPSBmdW5jdGlvbihzdWIsIGNoYW4pIHtcclxuICAgIGlmICghY2hhbi5saW5rSW5CaW8pIHtcclxuICAgICAgc3ViW2NoYW4udXNlci51c2VybmFtZV0gPSBmYWxzZTtcclxuICAgICAgJC5aZWJyYV9EaWFsb2coXCJZb3UgbmVlZCB0byA8c3BhbiBzdHlsZT0nZm9udC13ZWlnaHQ6Ym9sZCc+cHV0IHRoaXMgbGluayBpbiB5b3VyIFNvdW5kY2xvdWQgYmlvPC9zcGFuPiB0byBiZSBhYmxlIHRvIHNlbGwgcmVwb3N0cyB3aXRoIHRoaXMgYWNjb3VudDo8YnI+PGJyPjxhIGhyZWY9J1wiICsgY2hhbi5zdWJtaXNzaW9uVXJsICsgXCInIHRhcmdldD0nX2JsYW5rJz5cIiArIGNoYW4uc3VibWlzc2lvblVybCArICc8L2E+Jyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB2YXIgaW5kZXggPSBzdWIuc2VsZWN0ZWRDaGFubmVsSURTLmluZGV4T2YoY2hhbi51c2VyLmlkKTtcclxuICAgICAgaWYgKGluZGV4ID09IC0xKSB7XHJcbiAgICAgICAgc3ViLnNlbGVjdGVkQ2hhbm5lbElEUy5wdXNoKGNoYW4udXNlci5pZCk7XHJcbiAgICAgICAgc3ViLnNlbGVjdGVkQ2hhbm5lbE5hbWUucHVzaChjaGFuLnVzZXIudXNlcm5hbWUpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHN1Yi5zZWxlY3RlZENoYW5uZWxJRFMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICBzdWIuc2VsZWN0ZWRDaGFubmVsTmFtZS5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuY2hhbmdlQm94R3JvdXAgPSBmdW5jdGlvbihzdWIsIGdyb3VwKSB7XHJcbiAgICB2YXIgaW5kID0gc3ViLnNlbGVjdGVkR3JvdXBzLmluZGV4T2YoZ3JvdXApO1xyXG4gICAgaWYgKHN1Yltncm91cF0pIHtcclxuICAgICAgaWYgKGluZCA9PSAtMSkge1xyXG4gICAgICAgIHN1Yi5zZWxlY3RlZEdyb3Vwcy5wdXNoKGdyb3VwKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgc3ViLnNlbGVjdGVkR3JvdXBzLnNwbGljZShpbmQsIDEpO1xyXG4gICAgfVxyXG4gICAgJHNjb3BlLnNlbGVjdGVkR3JvdXBDaGFubmVsSURTID0gW107XHJcbiAgICBzdWIuc2VsZWN0ZWRHcm91cHMuZm9yRWFjaChmdW5jdGlvbihnKSB7XHJcbiAgICAgICRzY29wZS5wYWlkUmVwb3N0QWNjb3VudHMuZm9yRWFjaChmdW5jdGlvbihhY2MpIHtcclxuICAgICAgICBpZiAoYWNjLmdyb3Vwcy5pbmRleE9mKGcpICE9IC0xKSB7XHJcbiAgICAgICAgICBpZiAoJHNjb3BlLnNlbGVjdGVkR3JvdXBDaGFubmVsSURTLmluZGV4T2YoYWNjLnVzZXIuaWQpID09IC0xKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5zZWxlY3RlZEdyb3VwQ2hhbm5lbElEUy5wdXNoKGFjYy51c2VyLmlkKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0pO1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuc2F2ZSA9IGZ1bmN0aW9uKHN1Ym1pKSB7XHJcbiAgICBzdWJtaS5zZWxlY3RlZENoYW5uZWxJRFMuZm9yRWFjaChmdW5jdGlvbihjaWQpIHtcclxuICAgICAgaWYgKCRzY29wZS5zZWxlY3RlZEdyb3VwQ2hhbm5lbElEUy5pbmRleE9mKGNpZCkgPT0gLTEpIHtcclxuICAgICAgICAkc2NvcGUuc2VsZWN0ZWRHcm91cENoYW5uZWxJRFMucHVzaChjaWQpO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIHN1Ym1pLmNoYW5uZWxJRFMgPSAkc2NvcGUuc2VsZWN0ZWRHcm91cENoYW5uZWxJRFM7XHJcbiAgICBpZiAoc3VibWkuY2hhbm5lbElEUy5sZW5ndGggPT0gMCkge1xyXG4gICAgICAkLlplYnJhX0RpYWxvZyhcIllvdSBoYXZlIG5vdCBzZWxlY3RlZCBhbnkgY2hhbm5lbHMgdG8gYWNjZXB0IHJlcG9zdC5cIik7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkZWxldGUgc3VibWkuc2VsZWN0ZWRHcm91cHM7XHJcbiAgICAgIGRlbGV0ZSBzdWJtaS5zZWxlY3RlZENoYW5uZWxJRFM7XHJcbiAgICAgIGRlbGV0ZSBzdWJtaS5zZWxlY3RlZENoYW5uZWxOYW1lO1xyXG4gICAgICBzdWJtaS5wYXNzd29yZCA9ICRyb290U2NvcGUucGFzc3dvcmQ7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgJGh0dHAucHV0KFwiL2FwaS9zdWJtaXNzaW9ucy9zYXZlXCIsIHN1Ym1pKVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHN1Yikge1xyXG4gICAgICAgICAgJHNjb3BlLnNob3dpbmdFbGVtZW50cy5zcGxpY2UoJHNjb3BlLnNob3dpbmdFbGVtZW50cy5pbmRleE9mKHN1Ym1pKSwgMSk7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJFUlJPUjogZGlkIG5vdCBTYXZlXCIpXHJcbiAgICAgICAgfSlcclxuICAgIH1cclxuICB9XHJcblxyXG4gICRzY29wZS5pZ25vcmUgPSBmdW5jdGlvbihzdWJtaXNzaW9uKSB7XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAkaHR0cC5kZWxldGUoJy9hcGkvc3VibWlzc2lvbnMvaWdub3JlLycgKyBzdWJtaXNzaW9uLl9pZCArICcvJyArICRyb290U2NvcGUucGFzc3dvcmQpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgIHZhciBpbmRleCA9ICRzY29wZS5zaG93aW5nRWxlbWVudHMuaW5kZXhPZihzdWJtaXNzaW9uKTtcclxuICAgICAgICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkVSUk9SOiBkaWQgbm90IElnbm9yZVwiKTtcclxuICAgICAgfSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuZGVjbGluZSA9IGZ1bmN0aW9uKHN1Ym1pc3Npb24pIHtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICRodHRwLmRlbGV0ZSgnL2FwaS9zdWJtaXNzaW9ucy9kZWNsaW5lLycgKyBzdWJtaXNzaW9uLl9pZCArICcvJyArICRyb290U2NvcGUucGFzc3dvcmQpXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgIHZhciBpbmRleCA9ICRzY29wZS5zaG93aW5nRWxlbWVudHMuaW5kZXhPZihzdWJtaXNzaW9uKTtcclxuICAgICAgICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkVSUk9SOiBkaWQgbm90IERlY2xpbmVcIik7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLm1hcmtldFNhdmUgPSBmdW5jdGlvbihzdWJtaSkge1xyXG4gICAgLy8gaWYgKCRzY29wZS5hbGxvd2FuY2UgPD0gMCkgJC5aZWJyYV9EaWFsb2coJ1lvdSBhcmUgb3V0IG9mIE1hcmtldHBsYWNlIENyZWRpdHMuIEZvciBldmVyeSBkaXJlY3Qgc3VibWlzc2lvbiB5b3UgbWFrZSBhIHNhbGUgb24sIHlvdSB3aWxsIGJlIGdpdmVuIDEwIG1vcmUgTWFya2V0cGxhY2UgQ3JlZGl0cy4nKVxyXG4gICAgLy8gZWxzZSBpZiAoJHNjb3BlLm1hcmtldFN1Ym1pc3Npb25zLmluZGV4T2Yoc3VibWkpICE9IDApICQuWmVicmFfRGlhbG9nKCdQbGVhc2UgcmVzcG9uZCB0byB0aGUgZmlyc3Qgc3VibWlzc2lvbiBmaXJzdC4nKTtcclxuICAgIC8vIGVsc2Uge1xyXG4gICAgc3VibWkuc2VsZWN0ZWRDaGFubmVsSURTLmZvckVhY2goZnVuY3Rpb24oY2lkKSB7XHJcbiAgICAgIGlmICgkc2NvcGUuc2VsZWN0ZWRHcm91cENoYW5uZWxJRFMuaW5kZXhPZihjaWQpID09IC0xKSB7XHJcbiAgICAgICAgJHNjb3BlLnNlbGVjdGVkR3JvdXBDaGFubmVsSURTLnB1c2goY2lkKTtcclxuICAgICAgfVxyXG4gICAgfSk7XHJcbiAgICBzdWJtaS5wb29sZWRDaGFubmVsSURTID0gc3VibWkucG9vbGVkQ2hhbm5lbElEUy5jb25jYXQoJHNjb3BlLnNlbGVjdGVkR3JvdXBDaGFubmVsSURTKTtcclxuICAgIGRlbGV0ZSBzdWJtaS5zZWxlY3RlZEdyb3VwcztcclxuICAgIGRlbGV0ZSBzdWJtaS5zZWxlY3RlZENoYW5uZWxJRFM7XHJcbiAgICBkZWxldGUgc3VibWkuc2VsZWN0ZWRDaGFubmVsTmFtZTtcclxuICAgIHN1Ym1pLnBhc3N3b3JkID0gJHJvb3RTY29wZS5wYXNzd29yZDtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICRodHRwLnB1dChcIi9hcGkvc3VibWlzc2lvbnMvc2F2ZVwiLCBzdWJtaSlcclxuICAgICAgLnRoZW4oZnVuY3Rpb24oc3ViKSB7XHJcbiAgICAgICAgJHNjb3BlLm1hcmtldFN1Ym1pc3Npb25zLnNwbGljZSgkc2NvcGUubWFya2V0U3VibWlzc2lvbnMuaW5kZXhPZihzdWJtaSksIDEpO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgLy8gJHNjb3BlLmFsbG93YW5jZS0tO1xyXG4gICAgICB9KVxyXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICQuWmVicmFfRGlhbG9nKFwiRVJST1I6IGRpZCBub3QgU2F2ZVwiKVxyXG4gICAgICB9KVxyXG4gICAgICAvLyB9XHJcbiAgfVxyXG5cclxuICAkc2NvcGUubWFya2V0SWdub3JlID0gZnVuY3Rpb24oc3VibWlzc2lvbikge1xyXG4gICAgICAvLyBpZiAoJHNjb3BlLmFsbG93YW5jZSA8PSAwKSAkLlplYnJhX0RpYWxvZygnWW91IGFyZSBvdXQgb2YgTWFya2V0cGxhY2UgQ3JlZGl0cy4gRm9yIGV2ZXJ5IGRpcmVjdCBzdWJtaXNzaW9uIHlvdSBtYWtlIGEgc2FsZSBvbiwgeW91IHdpbGwgYmUgZ2l2ZW4gMTAgbW9yZSBNYXJrZXRwbGFjZSBDcmVkaXRzLicpXHJcbiAgICAgIC8vIGVsc2UgaWYgKCRzY29wZS5tYXJrZXRTdWJtaXNzaW9ucy5pbmRleE9mKHN1Ym1pc3Npb24pICE9IDApICQuWmVicmFfRGlhbG9nKCdQbGVhc2UgcmVzcG9uZCB0byB0aGUgZmlyc3Qgc3VibWlzc2lvbiBmaXJzdC4nKTtcclxuICAgICAgLy8gZWxzZSB7XHJcbiAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICAgJGh0dHAuZGVsZXRlKCcvYXBpL3N1Ym1pc3Npb25zL2lnbm9yZS8nICsgc3VibWlzc2lvbi5faWQgKyAnLycgKyAkcm9vdFNjb3BlLnBhc3N3b3JkKVxyXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgICAgdmFyIGluZGV4ID0gJHNjb3BlLm1hcmtldFN1Ym1pc3Npb25zLmluZGV4T2Yoc3VibWlzc2lvbik7XHJcbiAgICAgICAgICAkc2NvcGUubWFya2V0U3VibWlzc2lvbnMuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAvLyAkc2NvcGUuYWxsb3dhbmNlLS07XHJcbiAgICAgICAgfSlcclxuICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgICAkLlplYnJhX0RpYWxvZyhcIkVSUk9SOiBkaWQgbm90IElnbm9yZVwiKTtcclxuICAgICAgICB9KTtcclxuICAgIH1cclxuICAgIC8vIH1cclxuXHJcbiAgJHNjb3BlLm9wZW5FbWFpbENsaWVudCA9IGZ1bmN0aW9uKHN1YiwgaXRlbSkge1xyXG4gICAgdmFyIHRvRW1haWwgPSBmb3JtYXRGb3JFbWFpbENsaWVudChpdGVtLnRvRW1haWwsIHN1Yik7XHJcbiAgICB2YXIgc3ViamVjdCA9IChpdGVtLnN1YmplY3QgIT0gdW5kZWZpbmVkID8gZm9ybWF0Rm9yRW1haWxDbGllbnQoaXRlbS5zdWJqZWN0LCBzdWIpIDogXCJcIik7XHJcbiAgICB2YXIgYm9keSA9IChpdGVtLmVtYWlsQm9keSAhPSB1bmRlZmluZWQgPyBmb3JtYXRGb3JFbWFpbENsaWVudChpdGVtLmVtYWlsQm9keSwgc3ViKSA6IFwiXCIpO1xyXG4gICAgJHdpbmRvdy5vcGVuKFwibWFpbHRvOlwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHRvRW1haWwpICsgXCI/c3ViamVjdD1cIiArIGVuY29kZVVSSUNvbXBvbmVudChzdWJqZWN0KSArIFwiJmJvZHk9XCIgKyBlbmNvZGVVUklDb21wb25lbnQoYm9keSksIFwiX3NlbGZcIik7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBmb3JtYXRGb3JFbWFpbENsaWVudCh0ZXh0LCBzdWIpIHtcclxuICAgIHJldHVybiB0ZXh0LnJlcGxhY2UoL3tTVUJNSVRURVJTX0VNQUlMfS9nLCBzdWIuZW1haWwpLnJlcGxhY2UoL3tTVUJNSVRURVJTX05BTUV9L2csIHN1Yi5uYW1lKS5yZXBsYWNlKC97VFJBQ0tfVElUTEVfV0lUSF9MSU5LfS9nLCBzdWIudGl0bGUgKyAnICgnICsgc3ViLnRyYWNrVVJMICsgJyknKS5yZXBsYWNlKC97VFJBQ0tfVElUTEV9L2csIHN1Yi50aXRsZSkucmVwbGFjZSgve1RSQUNLX0FSVElTVF9XSVRIX0xJTkt9L2csIHN1Yi50cmFja0FydGlzdCArICcgKCcgKyBzdWIudHJhY2tBcnRpc3RVUkwgKyAnKScpLnJlcGxhY2UoL3tUUkFDS19BUlRJU1R9L2csIHN1Yi50cmFja0FydGlzdCkucmVwbGFjZSgve1NVQk1JVFRFRF9UT19BQ0NPVU5UX05BTUV9L2csIHN1Yi51c2VySUQuc291bmRjbG91ZC51c2VybmFtZSkucmVwbGFjZSgve1NVQk1JVFRFRF9BQ0NPVU5UX05BTUVfV0lUSF9MSU5LfS9nLCBzdWIudXNlcklELnNvdW5kY2xvdWQudXNlcm5hbWUgKyAnICgnICsgc3ViLnVzZXJJRC5zb3VuZGNsb3VkLnBlcm1hbGlua1VSTCArICcpJykucmVwbGFjZSgve1RPREFZU0RBVEV9L2csIG5ldyBEYXRlKCkudG9Mb2NhbGVEYXRlU3RyaW5nKCkpO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmdldFN1Ym1pc3Npb25CeUdlbnJlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkaHR0cC5nZXQoJy9hcGkvc3VibWlzc2lvbnMvZ2V0R3JvdXBlZFN1Ym1pc3Npb25zJykudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgdmFyIHVuYWNjZXB0ZWRTdWJtaXNzaW9uID0gcmVzLmRhdGE7XHJcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgJHNjb3BlLmdlbnJlQXJyYXkubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHVuYWNjZXB0ZWRTdWJtaXNzaW9uLmxlbmd0aDsgaisrKSB7XHJcbiAgICAgICAgICBpZiAoJHNjb3BlLmdlbnJlQXJyYXlbaV0gPT0gdW5hY2NlcHRlZFN1Ym1pc3Npb25bal0uX2lkKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5nZW5yZUFycmF5W2ldID0gJHNjb3BlLmdlbnJlQXJyYXlbaV0gKyAnICgnICsgdW5hY2NlcHRlZFN1Ym1pc3Npb25bal0udG90YWxfY291bnQgKyAnKSc7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gICRzY29wZS5jdXN0b21FbWFpbEJ1dHRvbnMgPSAkc2NvcGUudXNlci5zdWJtaXNzaW9uc0N1c3RvbUVtYWlsQnV0dG9ucy5sZW5ndGggPiAwID8gJHNjb3BlLnVzZXIuc3VibWlzc2lvbnNDdXN0b21FbWFpbEJ1dHRvbnMgOiBbXTtcclxuICBpZiAoJHNjb3BlLmN1c3RvbUVtYWlsQnV0dG9ucy5sZW5ndGggPT0gMCkge1xyXG4gICAgJHNjb3BlLmN1c3RvbUVtYWlsQnV0dG9ucy5wdXNoKHtcclxuICAgICAgdG9FbWFpbDogJycsXHJcbiAgICAgIHN1YmplY3Q6ICcnLFxyXG4gICAgICBlbWFpbEJvZHk6ICcnLFxyXG4gICAgICBidXR0b25UZXh0OiAnJyxcclxuICAgICAgYnV0dG9uQmdDb2xvcjogJydcclxuICAgIH0pO1xyXG4gIH1cclxuICAkc2NvcGUuc2F2ZVNldHRpbmdzID0gZnVuY3Rpb24oKSB7XHJcbiAgICB2YXIgdmFsaWQgPSB0cnVlO1xyXG4gICAgdmFyIHJlID0gL14oKFtePD4oKVxcW1xcXVxcXFwuLDs6XFxzQFwiXSsoXFwuW148PigpXFxbXFxdXFxcXC4sOzpcXHNAXCJdKykqKXwoXCIuK1wiKSlAKChcXFtbMC05XXsxLDN9XFwuWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XSl8KChbYS16QS1aXFwtMC05XStcXC4pK1thLXpBLVpdezIsfSkpJC87XHJcbiAgICBhbmd1bGFyLmZvckVhY2goJHNjb3BlLmN1c3RvbUVtYWlsQnV0dG9ucywgZnVuY3Rpb24oY2IpIHtcclxuICAgICAgaWYgKCFjYi50b0VtYWlsLmluY2x1ZGVzKFwie1NVQk1JVFRFUlNfRU1BSUx9XCIpKSB7XHJcbiAgICAgICAgdmFyIHZhbGlkRW1haWwgPSByZS50ZXN0KGNiLnRvRW1haWwpO1xyXG4gICAgICAgIGlmICghdmFsaWRFbWFpbCB8fCAhY2IuYnV0dG9uVGV4dCkge1xyXG4gICAgICAgICAgdmFsaWQgPSBmYWxzZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gICAgaWYgKCF2YWxpZCkge1xyXG4gICAgICAkLlplYnJhX0RpYWxvZygnUGxlYXNlIGVudGVyIHtTVUJNSVRURVJTX0VNQUlMfSBvciBhIHdlbGwgZm9ybWF0dGVkIGVtYWlsIGFkZHJlc3MgaW4gYWxsIFRvIEVtYWlsIGZpZWxkcyBhbmQgYSB0aXRsZSBmb3IgZWFjaCBidXR0b24uJyk7XHJcbiAgICAgIHJldHVybjtcclxuICAgIH1cclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICRzY29wZS51c2VyLnN1Ym1pc3Npb25zQ3VzdG9tRW1haWxCdXR0b25zID0gJHNjb3BlLmN1c3RvbUVtYWlsQnV0dG9ucztcclxuICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvdXBkYXRlU3VibWlzc2lvbnNDdXN0b21FbWFpbEJ1dHRvbnMnLCB7XHJcbiAgICAgIGN1c3RvbUVtYWlsQnV0dG9uczogJHNjb3BlLnVzZXIuc3VibWlzc2lvbnNDdXN0b21FbWFpbEJ1dHRvbnMsXHJcbiAgICB9KS50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICBTZXNzaW9uU2VydmljZS5jcmVhdGUocmVzLmRhdGEpO1xyXG4gICAgICAkc2NvcGUudXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmFkZEl0ZW0gPSBmdW5jdGlvbigpIHtcclxuICAgICRzY29wZS5jdXN0b21FbWFpbEJ1dHRvbnMucHVzaCh7XHJcbiAgICAgIHRvRW1haWw6ICcnLFxyXG4gICAgICBzdWJqZWN0OiAnJyxcclxuICAgICAgZW1haWxCb2R5OiAnJyxcclxuICAgICAgYnV0dG9uVGV4dDogJycsXHJcbiAgICAgIGJ1dHRvbkJnQ29sb3I6ICcnXHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gICRodHRwLmdldCgnL2FwaS9zdWJtaXNzaW9ucy9jb3VudHMnKVxyXG4gICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICRzY29wZS5jb3VudHMgPSByZXMuZGF0YVxyXG4gICAgfSlcclxuXHJcbiAgJHNjb3BlLnJlbW92ZUl0ZW0gPSBmdW5jdGlvbihpbmRleCkge1xyXG4gICAgJHNjb3BlLmN1c3RvbUVtYWlsQnV0dG9ucy5zcGxpY2UoaW5kZXgsIDEpO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmFkZEV2ZW50Q2xhc3MgPSBmdW5jdGlvbihpbmRleCwgdHlwZSkge1xyXG4gICAgJCgnLnNlbGVjdGVkQm94JykucmVtb3ZlQ2xhc3MoXCJzZWxlY3RlZEJveFwiKTtcclxuICAgICQoXCIuXCIgKyB0eXBlICsgaW5kZXgpLmFkZENsYXNzKFwic2VsZWN0ZWRCb3hcIik7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuYXBwZW5kQm9keSA9IGZ1bmN0aW9uKGJ0bikge1xyXG4gICAgaWYgKCQoJy5zZWxlY3RlZEJveCcpLmxlbmd0aCkge1xyXG4gICAgICB2YXIgYm94SW5kZXggPSAkKCcuc2VsZWN0ZWRCb3gnKS5hdHRyKFwiaW5kZXhcIik7XHJcbiAgICAgIHZhciBjdXJzb3JQb3MgPSAkKCcuc2VsZWN0ZWRCb3gnKS5wcm9wKCdzZWxlY3Rpb25TdGFydCcpO1xyXG4gICAgICB2YXIgdiA9ICQoJy5zZWxlY3RlZEJveCcpLnZhbCgpO1xyXG4gICAgICB2YXIgdGV4dEJlZm9yZSA9IHYuc3Vic3RyaW5nKDAsIGN1cnNvclBvcyk7XHJcbiAgICAgIHZhciB0ZXh0QWZ0ZXIgPSB2LnN1YnN0cmluZyhjdXJzb3JQb3MsIHYubGVuZ3RoKTtcclxuICAgICAgdmFyIG5ld3RleHQgPSB0ZXh0QmVmb3JlICsgYnRuLmFwcGVuZFRleHQgKyB0ZXh0QWZ0ZXI7XHJcbiAgICAgICQoJy5zZWxlY3RlZEJveCcpLnZhbChuZXd0ZXh0KTtcclxuICAgICAgJCgnLnNlbGVjdGVkQm94JykudHJpZ2dlcignaW5wdXQnKVxyXG4gICAgICAkKCcuc2VsZWN0ZWRCb3gnKS5yZW1vdmVDbGFzcyhcInNlbGVjdGVkQm94XCIpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmdldFBhaWRSZXBvc3RBY2NvdW50cyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJGh0dHAuZ2V0KCcvYXBpL3N1Ym1pc3Npb25zL2dldFBhaWRSZXBvc3RBY2NvdW50cycpLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICRzY29wZS5wYWlkUmVwb3N0QWNjb3VudHMgPSByZXMuZGF0YTtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAkc2NvcGUucGFpZFJlcG9zdEFjY291bnRzLmxlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgJHNjb3BlLnBhaWRSZXBvc3RBY2NvdW50c1tpXS5ncm91cHMuZm9yRWFjaChmdW5jdGlvbihhY2MpIHtcclxuICAgICAgICAgIGlmIChhY2MgIT0gXCJcIiAmJiAkc2NvcGUudW5pcXVlR3JvdXAuaW5kZXhPZihhY2MpID09PSAtMSkge1xyXG4gICAgICAgICAgICAkc2NvcGUudW5pcXVlR3JvdXAucHVzaChhY2MpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gIC8qU29sZCBSZXBvc3RzKi9cclxuXHJcbiAgJHNjb3BlLmdldFNvbGRSZXBvc3RzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkaHR0cC5wb3N0KCcvYXBpL3N1Ym1pc3Npb25zL2dldFNvbGRSZXBvc3RzJywge1xyXG4gICAgICBsb3dEYXRlOiAkc2NvcGUubG93RGF0ZSxcclxuICAgICAgaGlnaERhdGU6ICRzY29wZS5oaWdoRGF0ZVxyXG4gICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgJHNjb3BlLmFkbWluU3RhdHMubXBFYXJuaW5ncyA9IDA7XHJcbiAgICAgICRzY29wZS5hZG1pblN0YXRzLnN1YkVhcm5pbmdzID0gMDtcclxuICAgICAgJHNjb3BlLmFkbWluU3RhdHMuZWFybmluZ3MgPSAwO1xyXG4gICAgICAkc2NvcGUuYWRtaW5TdGF0cy5yZWZ1bmRzID0gMDtcclxuICAgICAgJHNjb3BlLmFkbWluU3RhdHMucmVmdW5kQW1vdW50ID0gMDtcclxuICAgICAgJHNjb3BlLmFkbWluU3RhdHMuZnV0dXJlID0gMDtcclxuICAgICAgcmVzLmRhdGEuZm9yRWFjaChmdW5jdGlvbihlbCkge1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBpZiAoZWwuZGF0YS5wYXlvdXQpIHtcclxuICAgICAgICAgICAgaWYgKGVsLmRhdGEucGF5b3V0LmJhdGNoX2hlYWRlcikge1xyXG4gICAgICAgICAgICAgIGVsLnBheW91dCA9IFwiJFwiICsgbmV3IE51bWJlcihlbC5kYXRhLnBheW91dC5iYXRjaF9oZWFkZXIuYW1vdW50LnZhbHVlKS50b0ZpeGVkKDIpICsgXCIgRWFybmVkXCI7XHJcbiAgICAgICAgICAgICAgaWYgKGVsLm1hcmtldHBsYWNlKSAkc2NvcGUuYWRtaW5TdGF0cy5tcEVhcm5pbmdzICs9IG5ldyBOdW1iZXIoZWwuZGF0YS5wYXlvdXQuYmF0Y2hfaGVhZGVyLmFtb3VudC52YWx1ZSk7XHJcbiAgICAgICAgICAgICAgZWxzZSAkc2NvcGUuYWRtaW5TdGF0cy5zdWJFYXJuaW5ncyArPSBuZXcgTnVtYmVyKGVsLmRhdGEucGF5b3V0LmJhdGNoX2hlYWRlci5hbW91bnQudmFsdWUpO1xyXG4gICAgICAgICAgICAgICRzY29wZS5hZG1pblN0YXRzLmVhcm5pbmdzICs9IG5ldyBOdW1iZXIoZWwuZGF0YS5wYXlvdXQuYmF0Y2hfaGVhZGVyLmFtb3VudC52YWx1ZSk7XHJcbiAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgZWwucGF5b3V0ID0gXCIkXCIgKyBuZXcgTnVtYmVyKGVsLmRhdGEucGF5b3V0LmFtb3VudC50b3RhbCkudG9GaXhlZCgyKSArIFwiIFJlZnVuZGVkXCI7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLmFkbWluU3RhdHMucmVmdW5kcyArPSAxO1xyXG4gICAgICAgICAgICAgICRzY29wZS5hZG1pblN0YXRzLnJlZnVuZEFtb3VudCArPSBuZXcgTnVtYmVyKGVsLmRhdGEucGF5b3V0LmFtb3VudC50b3RhbCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGVsLnBheW91dCA9IFwiSW5jb21wbGV0ZVwiXHJcbiAgICAgICAgICAgICRzY29wZS5hZG1pblN0YXRzLmZ1dHVyZSArPSAxO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgIGNvbnNvbGUubG9nKGUpXHJcbiAgICAgICAgfTtcclxuICAgICAgICBlbC5zaGFyZUxpbmsgPSB3aW5kb3cubG9jYXRpb24ub3JpZ2luICsgXCIvcmVwb3N0ZXZlbnRzL1wiICsgZWwudXNlci5zb3VuZGNsb3VkLnBzZXVkb25hbWUgKyBcIi9cIiArIGVsLmRhdGEucHNldWRvbmFtZTtcclxuICAgICAgfSlcclxuICAgICAgcmVzLmRhdGEuc29ydChmdW5jdGlvbihhLCBiKSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGIuZGF0YS5kYXkpIC0gbmV3IERhdGUoYS5kYXRhLmRheSk7XHJcbiAgICAgIH0pXHJcbiAgICAgICRzY29wZS5zb2xkUmVwb3N0cyA9IHJlcy5kYXRhO1xyXG4gICAgICAkc2NvcGUuYWRtaW5TdGF0cy5zb2xkUmVwb3N0cyA9IHJlcy5kYXRhLmxlbmd0aDtcclxuICAgIH0pO1xyXG4gICAgJHNjb3BlLnNvcnRUeXBlID0gJ25hbWUnO1xyXG4gICAgJHNjb3BlLnNvcnRSZXZlcnNlID0gZmFsc2U7XHJcbiAgICAkc2NvcGUuc2VhcmNoVGVybSA9ICcnO1xyXG4gIH1cclxuXHJcblxyXG4gICRzY29wZS5nZXRTdWJtaXNzaW9uRGF0YSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJGh0dHAucG9zdCgnL2FwaS9zdWJtaXNzaW9ucy9zdWJtaXNzaW9uRGF0YScsIHtcclxuICAgICAgbG93RGF0ZTogJHNjb3BlLmxvd0RhdGUsXHJcbiAgICAgIGhpZ2hEYXRlOiAkc2NvcGUuaGlnaERhdGVcclxuICAgIH0pLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICRzY29wZS5hZG1pblN0YXRzLnJlcFN1YkNvdW50ID0gcmVzLmRhdGEuZGlyZWN0U3Vicy5sZW5ndGg7XHJcbiAgICAgICRzY29wZS5hZG1pblN0YXRzLnByZW1TdWJDb3VudCA9IHJlcy5kYXRhLnByZW1pZXJlU3Vicy5sZW5ndGg7XHJcbiAgICAgIHZhciBkaXJlY3RTdWJBbW91bnRzID0ge307XHJcbiAgICAgICRzY29wZS5hZG1pblN0YXRzLmZmRWFybmluZ3MgPSAwO1xyXG4gICAgICByZXMuZGF0YS5kaXJlY3RTdWJzLmZvckVhY2goZnVuY3Rpb24oZWwpIHtcclxuICAgICAgICBpZiAoISFkaXJlY3RTdWJBbW91bnRzW2VsLnN1Yi51c2VySURdKSBkaXJlY3RTdWJBbW91bnRzW2VsLnN1Yi51c2VySURdICs9IDE7XHJcbiAgICAgICAgZWxzZSBkaXJlY3RTdWJBbW91bnRzW2VsLnN1Yi51c2VySURdID0gMTtcclxuICAgICAgICAkc2NvcGUuYWRtaW5TdGF0cy5mZkVhcm5pbmdzICs9ICEhZWwuZmZFYXJuaW5ncyA/IGVsLmZmRWFybmluZ3MgOiAwO1xyXG4gICAgICB9KVxyXG4gICAgICB2YXIgcHJlbWllcmVTdWJBbW91bnRzID0ge307XHJcbiAgICAgIHJlcy5kYXRhLnByZW1pZXJlU3Vicy5mb3JFYWNoKGZ1bmN0aW9uKGVsKSB7XHJcbiAgICAgICAgaWYgKCEhcHJlbWllcmVTdWJBbW91bnRzW2VsLnVzZXJJRF0pIHByZW1pZXJlU3ViQW1vdW50c1tlbC51c2VySURdICs9IDE7XHJcbiAgICAgICAgZWxzZSBwcmVtaWVyZVN1YkFtb3VudHNbZWwudXNlcklEXSA9IDE7XHJcbiAgICAgIH0pXHJcbiAgICAgICRzY29wZS5hY2NvdW50cyA9IHJlcy5kYXRhLmFjY291bnRzO1xyXG4gICAgICAkc2NvcGUuYWNjb3VudHMuZm9yRWFjaChmdW5jdGlvbihhY2N0KSB7XHJcbiAgICAgICAgYWNjdC5yZXBTdWJDb3VudCA9ICEhZGlyZWN0U3ViQW1vdW50c1thY2N0LnVzZXJJRC5faWRdID8gZGlyZWN0U3ViQW1vdW50c1thY2N0LnVzZXJJRC5faWRdIDogMDtcclxuICAgICAgICBhY2N0LnByZW1TdWJDb3VudCA9ICEhcHJlbWllcmVTdWJBbW91bnRzW2FjY3QudXNlcklELl9pZF0gPyBwcmVtaWVyZVN1YkFtb3VudHNbYWNjdC51c2VySUQuX2lkXSA6IDA7XHJcbiAgICAgICAgLy8gYWNjdC5wYWlkU3VicyA9IDA7XHJcbiAgICAgICAgLy8gYWNjdC5hY2NlcHRlZFN1YnMgPSAwO1xyXG4gICAgICAgIC8vIHJlcy5kYXRhLmFjY2VwdGVkU3Vicy5mb3JFYWNoKGZ1bmN0aW9uKGVsKSB7XHJcbiAgICAgICAgLy8gICBpZiAoZWwuY2hhbm5lbElEUy5pbmNsdWRlcyhhY2N0LnVzZXJJRC5zb3VuZGNsb3VkLmlkKSB8fCBlbC5wb29sZWRDaGFubmVsSURTLmluY2x1ZGVzKGFjY3QudXNlcklELnNvdW5kY2xvdWQuaWQpKSB7XHJcbiAgICAgICAgLy8gICAgIGFjY3QuYWNjZXB0ZWRTdWJzKys7XHJcbiAgICAgICAgLy8gICB9XHJcbiAgICAgICAgLy8gICB2YXIgZm91bmQgPSBmYWxzZTtcclxuICAgICAgICAvLyAgIGVsLnBhaWRQb29sZWRDaGFubmVscy5mb3JFYWNoKGZ1bmN0aW9uKGNoYW4pIHtcclxuICAgICAgICAvLyAgICAgaWYgKGNoYW4udXNlci5pZCA9PSBhY2N0LnVzZXJJRC5zb3VuZGNsb3VkLmlkKSBmb3VuZCA9IHRydWU7XHJcbiAgICAgICAgLy8gICB9KVxyXG4gICAgICAgIC8vICAgZWwucGFpZENoYW5uZWxzLmZvckVhY2goZnVuY3Rpb24oY2hhbikge1xyXG4gICAgICAgIC8vICAgICBpZiAoY2hhbi51c2VyLmlkID09IGFjY3QudXNlcklELnNvdW5kY2xvdWQuaWQpIGZvdW5kID0gdHJ1ZTtcclxuICAgICAgICAvLyAgIH0pXHJcbiAgICAgICAgLy8gICBpZiAoZm91bmQpIGFjY3QucGFpZFN1YnMrKztcclxuICAgICAgICAvLyB9KVxyXG4gICAgICAgIC8vIGFjY3QucGF5QWNjZXB0UmF0aW8gPSBhY2N0LnBhaWRTdWJzIC8gYWNjdC5hY2NlcHRlZFN1YnMgKiAxMDA7XHJcblxyXG4gICAgICB9KVxyXG5cclxuICAgICAgZnVuY3Rpb24gZ2V0QWNjdFJlcG9zdHMoKSB7XHJcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGlmICgkc2NvcGUuc29sZFJlcG9zdHMpIHtcclxuICAgICAgICAgICAgJHNjb3BlLmFkbWluU3RhdHMuZWFybmluZ3MgKz0gJHNjb3BlLmFkbWluU3RhdHMuZmZFYXJuaW5ncztcclxuICAgICAgICAgICAgdmFyIHJlcG9zdHMgPSB7fTtcclxuICAgICAgICAgICAgJHNjb3BlLnNvbGRSZXBvc3RzLmZvckVhY2goZnVuY3Rpb24oZWwpIHtcclxuICAgICAgICAgICAgICBpZiAoISFyZXBvc3RzW2VsLmRhdGEudXNlcklEXSkgcmVwb3N0c1tlbC5kYXRhLnVzZXJJRF0ucHVzaChlbClcclxuICAgICAgICAgICAgICBlbHNlIHJlcG9zdHNbZWwuZGF0YS51c2VySURdID0gW2VsXTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICRzY29wZS5hY2NvdW50cy5mb3JFYWNoKGZ1bmN0aW9uKGFjY3QpIHtcclxuICAgICAgICAgICAgICBhY2N0LnJlcG9zdENvdW50ID0gISFyZXBvc3RzW2FjY3QudXNlcklELnNvdW5kY2xvdWQuaWRdID8gcmVwb3N0c1thY2N0LnVzZXJJRC5zb3VuZGNsb3VkLmlkXS5sZW5ndGggOiAwO1xyXG4gICAgICAgICAgICAgIGFjY3QuZWFybmluZ3MgPSAwO1xyXG4gICAgICAgICAgICAgIGFjY3QucmVmdW5kcyA9IDA7XHJcbiAgICAgICAgICAgICAgYWNjdC5yZWZ1bmRBbW91bnQgPSAwO1xyXG4gICAgICAgICAgICAgIGFjY3QuZnV0dXJlID0gMDtcclxuICAgICAgICAgICAgICBpZiAoISFyZXBvc3RzW2FjY3QudXNlcklELnNvdW5kY2xvdWQuaWRdKSB7XHJcbiAgICAgICAgICAgICAgICByZXBvc3RzW2FjY3QudXNlcklELnNvdW5kY2xvdWQuaWRdLmZvckVhY2goZnVuY3Rpb24oZWwpIHtcclxuICAgICAgICAgICAgICAgICAgaWYgKGVsLmRhdGEucGF5b3V0KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVsLmRhdGEucGF5b3V0LmJhdGNoX2hlYWRlcikge1xyXG4gICAgICAgICAgICAgICAgICAgICAgYWNjdC5lYXJuaW5ncyArPSBuZXcgTnVtYmVyKGVsLmRhdGEucGF5b3V0LmJhdGNoX2hlYWRlci5hbW91bnQudmFsdWUpO1xyXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBhY2N0LnJlZnVuZHMgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgICAgIGFjY3QucmVmdW5kQW1vdW50ICs9IG5ldyBOdW1iZXIoZWwuZGF0YS5wYXlvdXQuYW1vdW50LnRvdGFsKTtcclxuICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgYWNjdC5mdXR1cmUgKz0gMTtcclxuICAgICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICBpZiAoISRzY29wZS4kJHBoYXNlKSAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICB9IGVsc2UgZ2V0QWNjdFJlcG9zdHMoKTtcclxuICAgICAgICB9LCA1MDApO1xyXG4gICAgICB9XHJcbiAgICAgIGdldEFjY3RSZXBvc3RzKCk7XHJcbiAgICB9KVxyXG4gIH1cclxuXHJcbiAgJHNjb3BlLnJlY2FsY3VsYXRlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUuc29sZFJlcG9zdHMgPSB1bmRlZmluZWQ7XHJcbiAgICAkc2NvcGUuYWNjb3VudHMgPSB1bmRlZmluZWQ7XHJcbiAgICAkc2NvcGUuYWRtaW5TdGF0cyA9IHt9O1xyXG4gICAgJHNjb3BlLmdldFNvbGRSZXBvc3RzKCk7XHJcbiAgICAkc2NvcGUuZ2V0U3VibWlzc2lvbkRhdGEoKTtcclxuICB9XHJcblxyXG4gICRzY29wZS5jaGFuZ2VTY2FsZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgY29uc29sZS5sb2coJHNjb3BlLnNjYWxlKTtcclxuICAgICRzY29wZS5oaWdoRGF0ZSA9IG5ldyBEYXRlKCk7XHJcbiAgICAkc2NvcGUubG93RGF0ZSA9IG5ldyBEYXRlKG5ldyBEYXRlKCkuZ2V0VGltZSgpIC0gcGFyc2VJbnQoJHNjb3BlLnNjYWxlKSAqIDI0ICogMzYwMDAwMCk7XHJcbiAgICAkc2NvcGUucmVjYWxjdWxhdGUoKTtcclxuICB9XHJcbiAgJHNjb3BlLmluY3JlbWVudFJhbmdlID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUuaGlnaERhdGUgPSBuZXcgRGF0ZSgkc2NvcGUuaGlnaERhdGUuZ2V0VGltZSgpICsgcGFyc2VJbnQoJHNjb3BlLnNjYWxlKSAqIDI0ICogMzYwMDAwMCk7XHJcbiAgICAkc2NvcGUubG93RGF0ZSA9IG5ldyBEYXRlKCRzY29wZS5sb3dEYXRlLmdldFRpbWUoKSArIHBhcnNlSW50KCRzY29wZS5zY2FsZSkgKiAyNCAqIDM2MDAwMDApO1xyXG4gICAgJHNjb3BlLnJlY2FsY3VsYXRlKCk7XHJcbiAgfVxyXG4gICRzY29wZS5kZWNyZW1lbnRSYW5nZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLmhpZ2hEYXRlID0gbmV3IERhdGUoJHNjb3BlLmhpZ2hEYXRlLmdldFRpbWUoKSAtIHBhcnNlSW50KCRzY29wZS5zY2FsZSkgKiAyNCAqIDM2MDAwMDApO1xyXG4gICAgJHNjb3BlLmxvd0RhdGUgPSBuZXcgRGF0ZSgkc2NvcGUubG93RGF0ZS5nZXRUaW1lKCkgLSBwYXJzZUludCgkc2NvcGUuc2NhbGUpICogMjQgKiAzNjAwMDAwKTtcclxuICAgICRzY29wZS5yZWNhbGN1bGF0ZSgpO1xyXG4gIH1cclxuICAkc2NvcGUuc2NhbGUgPSBcIjdcIjtcclxuICAkc2NvcGUuY2hhbmdlU2NhbGUoKTtcclxuXHJcbiAgJHNjb3BlLmdldFBhaWRSZXBvc3RBY2NvdW50cygpO1xyXG4gICRzY29wZS5sb2FkU3VibWlzc2lvbnMoKTtcclxuICAkc2NvcGUubG9hZE1hcmtldFN1Ym1pc3Npb25zKCk7XHJcblxyXG4gICRzY29wZS5nZXREaWZmVGltZVRleHQgPSBmdW5jdGlvbihkYXRlKSB7XHJcbiAgICB2YXIgdCA9IE1hdGguZmxvb3IoKG5ldyBEYXRlKGRhdGUpLmdldFRpbWUoKSAtIG5ldyBEYXRlKCkuZ2V0VGltZSgpKSAvIDEwMDApO1xyXG4gICAgdmFyIGRheXMsIGhvdXJzLCBtaW51dGVzLCBzZWNvbmRzO1xyXG4gICAgaG91cnMgPSAoTWF0aC5mbG9vcih0IC8gMzYwMCkpO1xyXG4gICAgdCAtPSBob3VycyAqIDM2MDA7XHJcbiAgICBtaW51dGVzID0gKE1hdGguZmxvb3IodCAvIDYwKSk7XHJcblxyXG4gICAgcmV0dXJuIFtcclxuICAgICAgaG91cnMgKyAnaCcsXHJcbiAgICAgIG1pbnV0ZXMgKyAnbSdcclxuICAgIF0uam9pbignICcpO1xyXG4gIH1cclxuXHJcbiAgLy8gJGh0dHAuZ2V0KCcvYXBpL3N1Ym1pc3Npb25zL2N1cnJlbnRBbGxvd2FuY2UnKVxyXG5cclxuICAvLyAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gIC8vICAgICAkc2NvcGUuYWxsb3dhbmNlID0gcmVzLmRhdGEuYWxsb3dhbmNlO1xyXG4gIC8vICAgICBpZiAoISRzY29wZS4kJHBoYXNlKSAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgLy8gICB9KS50aGVuKG51bGwsIGNvbnNvbGUubG9nKTtcclxufSk7XHJcbiJdLCJmaWxlIjoic3VibWlzc2lvbnMvY29udHJvbGxlcnMvc3VibWlzc2lvbkNvbnRyb2xsZXIuanMifQ==
