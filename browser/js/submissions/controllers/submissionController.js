app.config(function($stateProvider) {
  $stateProvider.state('submissions', {
    url: '/admin/submissions',
    templateUrl: 'js/submissions/views/submissions.html',
    controller: 'SubmissionController'
  });
});

app.controller('SubmissionController', function($rootScope, $state, $scope, $http, $window, AuthService, SessionService, AccountSettingServices) {
  $scope.counter = 0;
  $scope.showingElements = [];
  $scope.marketSubmissions = [];
  $scope.selectedGroups = [];
  $scope.selectedChannelIDS = [];
  $scope.selectedGroupChannelIDS = [];
  $scope.selectedChannelName = [];
  $scope.genre = "";
  $scope.displayType = 'channel';
  $scope.skip = 0;
  $scope.limit = 10;
  $scope.marketSkip = 0;
  $scope.marketLimit = 10;
  $scope.isLoggedIn = SessionService.getUser() ? true : false;
  if (!SessionService.getUser()) {
    $state.go('admin');
  }
  $scope.user = SessionService.getUser();
  console.log($scope.user);
  $scope.user.isAdmin = $scope.user.role == 'admin' ? true : false;
  $scope.uniqueGroup = [];
  $scope.paidRepostAccounts = [];
  $scope.dynamicButton = [{
    "name": "TRACK TITLE",
    "appendText": " {TRACK_TITLE} "
  }, {
    "name": "TRACK TITLE W/ LINK",
    "appendText": " {TRACK_TITLE_WITH_LINK} "
  }, {
    "name": "TODAYS DATE",
    "appendText": " {TODAYSDATE} "
  }, {
    "name": "TRACK ARTIST",
    "appendText": " {TRACK_ARTIST} "
  }, {
    "name": "TRACK ARTIST W/ LINK",
    "appendText": " {TRACK_ARTIST_WITH_LINK} "
  }, {
    "name": "TRACK ARTWORK",
    "appendText": " {TRACK_ARTWORK} "
  }, {
    "name": "SUBMITTERS EMAIL",
    "appendText": " {SUBMITTERS_EMAIL} "
  }, {
    "name": "ACCEPTED CHANNEL LIST",
    "appendText": " {ACCEPTED_CHANNEL_LIST} "
  }, {
    "name": "ACCEPTED CHANNEL LIST W/ LINK",
    "appendText": " {ACCEPTED_CHANNEL_LIST_WITH_LINK} "
  }, {
    "name": "SUBMITTED TO ACCOUNT NAME",
    "appendText": " {SUBMITTED_TO_ACCOUNT_NAME} "
  }, {
    "name": "SUBMITTED ACCOUNT NAME W/ LINK",
    "appendText": " {SUBMITTED_ACCOUNT_NAME_WITH_LINK} "
  }];

  $scope.genreArray = [
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
  if (window.location.href.indexOf('admin/submissions#mysubmissions') != -1) {
    $('.nav-tabs a[href="#mysubmissions"]').tab('show');
  } else if (window.location.href.indexOf('admin/submissions#marketplace') != -1) {
    $('.nav-tabs a[href="#marketplace"]').tab('show');
  } else if (window.location.href.indexOf('admin/submissions#managesubmissions') != -1) {
    $('.nav-tabs a[href="#managesubmissions"]').tab('show');
  }

  $scope.sendTestMail = function(index) {
    $scope.showTestEmailModal = true;
    $scope.emailIndex = index;
    $('#emailModal').modal('show');
  }

  $scope.testEmail = function(email) {
    $scope.showTestEmailModal = false;
    $('#emailModal').modal('hide');
    var subject = $scope.customEmailButtons[$scope.emailIndex].subject;
    var body = $scope.customEmailButtons[$scope.emailIndex].emailBody;
    body = body.replace('{SUBMITTERS_EMAIL}', email);
    body = body.replace('{TRACK_TITLE_WITH_LINK}', "Oliver Nelson ft. Kaleem Taylor - Ain't A Thing" + ' (https://soundcloud.com/olivernelson/oliver-nelson-ft-kaleem-taylor-aint-a-thing-3)');
    body = body.replace('{TRACK_TITLE}', "Oliver Nelson ft. Kaleem Taylor - Ain't A Thing");
    body = body.replace('{TRACK_ARTIST_WITH_LINK}', "Oliver Nelson" + ' (https://soundcloud.com/olivernelson)');
    body = body.replace('{TRACK_ARTIST}', "Jhonny Submitter");
    body = body.replace('{SUBMITTED_TO_ACCOUNT_NAME}', "La Tropical");
    body = body.replace('{SUBMITTED_ACCOUNT_NAME_WITH_LINK}', "La Tropical" + ' (https://soundcloud.com/latropical)');
    body = body.replace('{ACCEPTED_CHANNEL_LIST}', "La Tropical, Etiquette Noir and Le Sol");
    body = body.replace('{ACCEPTED_CHANNEL_LIST_WITH_LINK}', "La Tropical(https://soundcloud.com/latropical),Etiquette Noir(https://soundcloud.com/etiquettenoir),Le Sol(https://soundcloud.com/lesolmusique)");
    body = body.replace('{TODAYSDATE}', new Date().toLocaleDateString());
    $window.open("mailto:" + email + "?body=" + body + "&subject=" + subject, "_self");

  }
  $scope.getSubmissionsByGenre = function() {
    $scope.showingElements = [];
    $scope.skip = 0;
    $scope.loadSubmissions();
  }

  $scope.togglePoolOn = function() {
    // $scope.user.repostSettings.poolOn = !$scope.user.repostSettings.poolOn;
    console.log($scope.user.repostSettings.poolOn);
    SessionService.create($scope.user);
    AccountSettingServices.updateAdminProfile({
      'repostSettings.poolOn': $scope.user.repostSettings.poolOn
    });
  }

  $scope.whatIsPool = function() {
    $.Zebra_Dialog("By enabling the AU Marketplace you agree that every submission that you accept will also be shared to all other AU Admins in the AU Marketplace. By doing so, you will gain access to all submissions from other admins that have enabled the AU MarketPlace. As well, you will make 10% of every sale that is made from a submission that originated to one of your network accounts.");
  }

  $scope.loadSubmissions = function() {
    var genre = $scope.genre.replace(/[0-9]/g, '');
    var selectedGenre = genre.replace('(', '').replace(')', '').trim();
    $scope.processing = true;
    $http.get('/api/submissions/unaccepted?genre=' + encodeURIComponent(selectedGenre) + "&skip=" + $scope.skip + "&limit=" + $scope.limit)
      .then(function(res) {
        $scope.processing = false;
        if (res.data.length > 0) {
          angular.forEach(res.data, function(d) {
            d.selectedChannelName = [];
            d.selectedChannelIDS = [];
            d.selectedGroups = [];
            $scope.showingElements.push(d)
          });
        }
        if (!$scope.$$phase) $scope.$apply();
        setTimeout(function() {
          $scope.showingElements.forEach(function(sub) {
            SC.Widget(sub.trackID + "player").load(sub.trackURL, {
              auto_play: false,
              show_artwork: true
            });
          }, 50)
        });
      })
      .then(null, function(err) {
        $scope.processing = false;
        $.Zebra_Dialog('Error: Could not get channels.')
        console.log(err);
      });
  }

  $scope.loadMore = function() {
    $scope.skip += 10;
    $scope.loadSubmissions();
  }

  $scope.loadMarketSubmissions = function() {
    var genre = $scope.genre.replace(/[0-9]/g, '');
    var selectedGenre = genre.replace('(', '').replace(')', '').trim();
    $scope.processing = true;
    $http.get('/api/submissions/getMarketPlaceSubmission?genre=' + encodeURIComponent(selectedGenre) + "&skip=" + $scope.marketSkip + "&limit=" + $scope.marketLimit)
      .then(function(res) {
        console.log(res.data);
        $scope.processing = false;
        if (res.data.length > 0) {
          angular.forEach(res.data, function(d) {
            d.selectedChannelName = [];
            d.selectedChannelIDS = [];
            d.selectedGroups = [];
            d.pooledSendDate = new Date(d.pooledSendDate);
            $scope.marketSubmissions.push(d)
          });
        }
        setTimeout(function() {
          $scope.marketSubmissions.forEach(function(sub) {
            SC.Widget(sub.trackID + "_player").load(sub.trackURL, {
              auto_play: false,
              show_artwork: true
            });
            if (!$scope.$$phase) $scope.$apply();
          }, 50)
        });
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
    var index = sub.selectedChannelIDS.indexOf(chan.user.id);
    if (index == -1) {
      sub.selectedChannelIDS.push(chan.user.id);
      sub.selectedChannelName.push(chan.user.username);
    } else {
      sub.selectedChannelIDS.splice(index, 1);
      sub.selectedChannelName.splice(index, 1);
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
      $scope.user.paidRepost.forEach(function(acc) {
        if (acc.groups.indexOf(g) != -1) {
          if ($scope.selectedGroupChannelIDS.indexOf(acc.id) == -1) {
            $scope.selectedGroupChannelIDS.push(acc.id);
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
      $scope.decline(submi);
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
        $scope.processing = false
      })
      .then(null, function(err) {
        $scope.processing = false;
        $.Zebra_Dialog("ERROR: did not Decline");
      });
  }

  $scope.marketSave = function(submi) {
    submi.selectedChannelIDS.forEach(function(cid) {
      if ($scope.selectedGroupChannelIDS.indexOf(cid) == -1) {
        $scope.selectedGroupChannelIDS.push(cid);
      }
    });
    submi.pooledChannelIDS = $scope.selectedGroupChannelIDS;
    delete submi.selectedGroups;
    delete submi.selectedChannelIDS;
    delete submi.selectedChannelName;
    submi.password = $rootScope.password;
    $scope.processing = true;
    $http.put("/api/submissions/save", submi)
      .then(function(sub) {
        $scope.marketSubmissions.splice($scope.marketSubmissions.indexOf(submi), 1);
        $scope.processing = false;
      })
      .then(null, function(err) {
        $scope.processing = false;
        $.Zebra_Dialog("ERROR: did not Save")
      })
  }

  $scope.marketIgnore = function(submission) {
    $scope.processing = true;
    $http.delete('/api/submissions/ignore/' + submission._id + '/' + $rootScope.password)
      .then(function(res) {
        var index = $scope.marketSubmissions.indexOf(submission);
        $scope.marketSubmissions.splice(index, 1);
        $scope.processing = false;
      })
      .then(null, function(err) {
        $scope.processing = false;
        $.Zebra_Dialog("ERROR: did not Ignore");
      });
  }

  $scope.marketDecline = function(submission) {
    $scope.processing = true;
    $http.delete('/api/submissions/decline/' + submission._id + '/' + $rootScope.password)
      .then(function(res) {
        var index = $scope.marketSubmissions.indexOf(submission);
        $scope.marketSubmissions.splice(index, 1);
        $scope.processing = false
      })
      .then(null, function(err) {
        $scope.processing = false;
        $.Zebra_Dialog("ERROR: did not Decline");
      });
  }

  $scope.openEmailClient = function(sub, item) {
    var toEmail = (item.toEmail == '{email}' ? sub.email : item.toEmail);
    var subject = (item.subject != undefined ? item.subject : "");
    if (subject != "") {
      subject = subject.replace('{title}', sub.title);
      subject = subject.replace('{name}', sub.name);
      subject = subject.replace('{url}', sub.trackURL);
    }
    var body = (item.emailBody != undefined ? item.emailBody : "");
    if (body != "") {
      body = body.replace('{SUBMITTERS_EMAIL}', toEmail);
      body = body.replace('{TRACK_TITLE_WITH_LINK}', sub.title + ' (' + sub.trackURL + ')');
      body = body.replace('{TRACK_TITLE}', sub.title);
      body = body.replace('{TRACK_ARTIST_WITH_LINK}', sub.name + ' (' + sub.trackURL + ')');
      body = body.replace('{TRACK_ARTIST}', sub.name);
      body = body.replace('{SUBMITTED_TO_ACCOUNT_NAME}', sub.userID.soundcloud.username);
      body = body.replace('{SUBMITTED_ACCOUNT_NAME_WITH_LINK}', sub.userID.soundcloud.username + ' (' + sub.userID.soundcloud.permalinkURL + ')');
      body = body.replace('{ACCEPTED_CHANNEL_LIST}', "");
      body = body.replace('{ACCEPTED_CHANNEL_LIST_WITH_LINK}', "");
      body = body.replace('{TODAYSDATE}', new Date().toLocaleDateString());
      //body = body.replace(/\n/g, "<br />");
    }
    var link = "mailto:" + toEmail + "?subject=" + escape(subject) + "&body=" + escape(body);
    $window.location.href = link;
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
      if (cb.toEmail != "{email}") {
        var validEmail = re.test(cb.toEmail);
        if (!validEmail) {
          valid = false;
        }
      }
    });
    if (!valid) {
      $.Zebra_Dialog('Please enter {email} or a well formatted email id in To Email field.');
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

  $scope.removeItem = function(index) {
    $scope.customEmailButtons.splice(index, 1);
  }

  $scope.addEventClass = function(index, type) {
    $('textarea').removeClass("selectedBox");
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
      $scope.customEmailButtons[boxIndex].emailBody = newtext;
      $('textarea').removeClass("selectedBox");
    }
  }

  $scope.getPaidRepostAccounts = function() {
    $http.get('/api/submissions/getPaidRepostAccounts').then(function(res) {
      $scope.paidRepostAccounts = res.data;
      console.log(res.data);
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
    $http.get('/api/submissions/getSoldReposts').then(function(res) {
      $scope.soldReposts = res.data;
    });
    $scope.sortType = 'name';
    $scope.sortReverse = false;
    $scope.searchTerm = '';
  }

  /*Account Earnings*/
  $scope.getEarnings = function() {
    $http.get('/api/submissions/getEarnings').then(function(res) {
      $scope.earnings = res.data;
    });
    $scope.sortReverse1 = false;
    $scope.sortType1 = 'username';
    $scope.searchTerm1 = '';
  }

  $scope.getEarnings();
  $scope.getSoldReposts();
  $scope.getPaidRepostAccounts();
  $scope.loadSubmissions();
  $scope.loadMarketSubmissions();
});

app.directive('countdown', [
  'Util',
  '$interval',
  function(Util, $interval) {
    return {
      restrict: 'A',
      scope: {
        date: '@'
      },
      link: function(scope, element) {
        var future;
        future = new Date(scope.date);
        $interval(function() {
          var diff;
          diff = Math.floor((future.getTime() - new Date().getTime()) / 1000);
          return element.text(Util.dhms(diff));
        }, 1000);
      }
    };
  }
]).factory('Util', [function() {
  return {
    dhms: function(t) {
      var days, hours, minutes, seconds;
      //days = Math.floor(t / 86400);
      //t = days * 86400;
      hours = (Math.floor(t / 3600));
      t -= hours * 3600;
      minutes = (Math.floor(t / 60));
      //t -= minutes * 60;
      //seconds = t % 60;
      return [
        hours + 'h',
        minutes + 'm'
      ].join(' ');
    }
  };
}]);