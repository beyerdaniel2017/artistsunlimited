app.config(function($stateProvider) {
  $stateProvider.state('premiersubmissions', {
    url: '/admin/premiersubmissions',
    templateUrl: 'js/premierSubmissions/views/premierSubmissions.html',
    controller: 'PremierSubmissionController'
  });
});

app.controller('PremierSubmissionController', function($rootScope, $state, $scope, $http, AuthService, SessionService, $sce, $window) {
  $scope.isLoggedIn = SessionService.getUser() ? true : false;
  if (!SessionService.getUser()) {
    $state.go('admin');
  }
  $scope.user = SessionService.getUser();
  $scope.user.isAdmin = $scope.user.role == 'admin' ? true : false;
  $scope.uniqueGroup = [];
  for (var i = 0; i < $scope.user.paidRepost.length; i++) {
    $scope.user.paidRepost[i].groups.forEach(function(acc) {
      if (acc != "" && $scope.uniqueGroup.indexOf(acc) === -1) {
        $scope.uniqueGroup.push(acc);
      }
    });
  }
  $scope.counter = 0;
  $scope.channels = [];
  $scope.selectedGroups = [];
  $scope.showingElements = [];
  $scope.submissions = [];
  $scope.selectedChannelIDS = [];
  $scope.selectedGroupChannelIDS = [];
  $scope.selectedChannelName = [];
  $scope.genre = "";
  $scope.skip = 0;
  $scope.limit = 5;
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
    "name": "SUBMITTERS EMAIL",
    "appendText": " {SUBMITTERS_EMAIL} "
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

  if (window.location.href.indexOf('admin/premiersubmissions#mysubmissions') != -1) {
    $('.nav-tabs a[href="#mysubmissions"]').tab('show');
  } else if (window.location.href.indexOf('admin/premiersubmissions#managesubmissions') != -1) {
    $('.nav-tabs a[href="#managesubmissions"]').tab('show');
  }

  $scope.getSubmissionsByGenre = function() {
    $scope.showingElements = [];
    $scope.skip = 0;
    $scope.loadSubmissions();
  }

  $scope.loadSubmissions = function() {
    $scope.processing = true;
    $http.get('/api/premier/unaccepted?genre=' + $scope.genre + "&skip=" + $scope.skip + "&limit=" + $scope.limit)
      .then(function(res) {
        $scope.processing = false;
        if (res.data.length > 0) {
          angular.forEach(res.data, function(d) {
            d.channel = null;
            d.emailBody = "";
            $scope.showingElements.push(d);
          });
          console.log($scope.showingElements);
        }
      })
      .then(null, function(err) {
        $scope.processing = false;
        $.Zebra_Dialog('Error: No premiere submissions found.')
        console.log(err);
      });
  }

  $scope.loadMore = function() {
    $scope.skip += 10;
    $scope.loadSubmissions();
    //var loadElements = [];
    // for (let i = $scope.counter; i < $scope.counter + 15; i++) {
    //   var sub = $scope.submissions[i];
    //   if (sub) {
    //     sub.channelName = null;
    //     sub.emailBody = "";
    //     $scope.showingElements.push(sub);
    //     loadElements.push(sub);
    //   }
    // }
    // $scope.counter += 15;
  }

  $scope.changeBox = function(sub, chan) {
    var index = $scope.selectedChannelIDS.indexOf(chan.id);
    if (index == -1) {
      $scope.selectedChannelIDS.push(chan.id);
      $scope.selectedChannelName.push(chan.username);
    } else {
      $scope.selectedChannelIDS.splice(index, 1);
      $scope.selectedChannelName.splice(index, 1);
    }
  }

  $scope.changeBoxGroup = function(sub, group) {
    var ind = $scope.selectedGroups.indexOf(group);
    if (sub[group]) {
      if (ind == -1) {
        $scope.selectedGroups.push(group);
      }
    } else {
      $scope.selectedGroups.splice(ind, 1);
    }
    $scope.selectedGroupChannelIDS = [];
    $scope.selectedGroups.forEach(function(g) {
      $scope.user.paidRepost.forEach(function(acc) {
        if (acc.groups.indexOf(g) != -1) {
          if ($scope.selectedGroupChannelIDS.indexOf(acc.id) == -1) {
            $scope.selectedGroupChannelIDS.push(acc.id);
          }
        }
      });
    });
  }
  $scope.accept = function(submi) {
    $scope.processing = true;
    submi.status = "accepted";
    $http.put("/api/premier/accept", {
        submi: submi
      })
      .then(function(sub) {
        $scope.showingElements.splice($scope.showingElements.indexOf(submi), 1);
        $.Zebra_Dialog("Accepted");
        $scope.processing = false;
      })
      .then(null, function(err) {
        $scope.processing = false;
        $.Zebra_Dialog("ERROR: did not Save")
      })
  }

  $scope.decline = function(submission) {
    $scope.processing = true;
    submission.status = "declined";
    $http.put('/api/premier/decline', {
        submission: submission
      })
      .then(function(res) {
        var index = $scope.showingElements.indexOf(submission);
        $scope.showingElements.splice(index, 1);
        $.Zebra_Dialog("Declined");
        $scope.processing = false
      })
      .then(null, function(err) {
        $scope.processing = false;
        $.Zebra_Dialog("ERROR: did not Decline");
      });
  }

  $scope.channelChange = function(submission) {
    var channel = JSON.parse(submission.channel);
    var emailBody = "";
    switch (channel.displayName) {
      case 'The Plug':
        emailBody = "Hey " + submission.name + ",%0D%0A%0D%0AThank you for submitting your track to us here at Artists Unlimited. We are very interested in your submission and we think that it could really fit one of our SoundCloud channels, " + channel.displayName + ", " + channel.url + " %0D%0A%0D%0AMy name is Luiz Kupfer and I help curate the channel. I just have a couple of questions regarding your submission to help make me understand the record a bit more:%0D%0A%0D%0A1. Is it 100 percent original? Is there any copyright infringement in this track? (vocals that you do not have permission to use, etc)%0D%0A2. Do you own all of the rights to the track? (i.e. are you currently in engaged in a publishing  or master right contract that we would need permission to release your music?)%0D%0A3. Are you interested solely on releasing the track on SoundCloud (for Free Download) or are you interested in having us take care of uploading the track to Spotify, iTunes and promote the track on all platforms, rather than just Sound Cloud.%0D%0A%0D%0AAll best and looking forward to hearing from you soon,%0D%0A%0D%0ALuiz Kupfer%0D%0AAU Network%0D%0Aluiz@peninsulamgmt.com";
        break;
      case 'Royal X':
        emailBody = "Hey " + submission.name + ",%0D%0A%0D%0AThank you for submitting your track to us here at Artists Unlimited. We are very interested in your submission and we think that it could really fit one of our SoundCloud channels, " + channel.displayName + ", " + channel.url + " %0D%0A%0D%0AMy name is Rafael Rocha and I help curate the channel. I just have a couple of questions regarding your submission to help make me understand the record a bit more:%0D%0A%0D%0A1. Is it 100 percent original? Is there any copyright infringement in this track? (vocals that you do not have permission to use, etc)%0D%0A2. Do you own all of the rights to the track? (i.e. are you currently in engaged in a publishing  or master right contract that we would need permission to release your music?)%0D%0A3. Are you interested solely on releasing the track on SoundCloud (for Free Download) or are you interested in having us take care of uploading the track to Spotify, iTunes and promote the track on all platforms, rather than just Sound Cloud.%0D%0A%0D%0AAll best and looking forward to hearing from you soon,%0D%0A%0D%0ARafael Rocha%0D%0AAU Network%0D%0Aroyalxofficial@gmail.com";
        break;
      default:
        emailBody = "Hey " + submission.name + ",%0D%0A%0D%0AThank you for submitting your track to us here at Artists Unlimited. We are very interested in your submission and we think that it could really fit one of our SoundCloud channels, " + channel.displayName + ", " + channel.url + " %0D%0A%0D%0AMy name is Edward Sanchez and I help curate the channel. I just have a couple of questions regarding your submission to help make me understand the record a bit more:%0D%0A%0D%0A1. Is it 100 percent original? Is there any copyright infringement in this track? (vocals that you do not have permission to use, etc)%0D%0A2. Do you own all of the rights to the track? (i.e. are you currently in engaged in a publishing  or master right contract that we would need permission to release your music?)%0D%0A3. Are you interested solely on releasing the track on SoundCloud (for Free Download) or are you interested in having us take care of uploading the track to Spotify, iTunes and promote the track on all platforms, rather than just Sound Cloud.%0D%0A%0D%0AAll best and looking forward to hearing from you soon,%0D%0A%0D%0AEdward Sanchez%0D%0AAU Network%0D%0Aedward@peninsulamgmt.com";
        break;
    }
    submission.emailBody = emailBody;
  }

  $scope.delete = function(submission) {
    $.Zebra_Dialog('Are you sure you really want to delete ?', {
      'buttons': [{
        caption: 'Yes',
        callback: function() {
          $scope.processing = true;
          $http.post("/api/premier/delete", {
              id: submission._id
            })
            .then(function(sub) {
              $scope.showingElements.splice($scope.showingElements.indexOf(submission), 1);
              $scope.processing = false;
            })
            .then(null, function(err) {
              $scope.processing = false;
            });
        }
      }, {
        caption: 'Cancel',
        callback: function() {}
      }]
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
      body = body.replace('{NAME}', sub.name);
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
    }
    var link = "mailto:" + toEmail + "?subject=" + escape(subject) + "&body=" + escape(body);
    $window.location.href = link;
  }

  $scope.getChannels = function() {
    $scope.channels = [{
      displayName: 'La Tropical',
      url: 'https://soundcloud.com/latropical'
    }, {
      displayName: 'La Tropical Mixes',
      url: 'https://soundcloud.com/latropicalmixes'
    }, {
      displayName: 'Red Tag',
      url: 'https://soundcloud.com/red-tag'
    }, {
      displayName: 'Etiquette Noir',
      url: 'https://soundcloud.com/etiquettenoir'
    }, {
      displayName: 'Le Sol',
      url: 'https://soundcloud.com/lesolmusique'
    }, {
      displayName: 'Classy Records',
      url: 'https://soundcloud.com/onlyclassy'
    }, {
      displayName: 'A La Mer',
      url: 'https://soundcloud.com/a-la-mer'
    }, {
      displayName: 'Royal X',
      url: 'https://soundcloud.com/royalxx'
    }, {
      displayName: 'The Plug',
      url: 'https://soundcloud.com/theplugmiami'
    }, {
      displayName: 'Electro Bounce',
      url: 'http://soundcloud.com/electro-bounce'
    }, {
      displayName: 'Panel',
      url: 'https://soundcloud.com/panel'
    }, {
      displayName: 'Air de Paris',
      url: 'https://soundcloud.com/airxparis'
    }, {
      displayName: 'Lux Audio',
      url: 'http://soundcloud.com/luxaudio'
    }]
  }

  $scope.customEmailButtons = $scope.user.premierCustomEmailButtons.length > 0 ? $scope.user.premierCustomEmailButtons : [];
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
    $scope.user.premierCustomEmailButtons = $scope.customEmailButtons;
    $http.post('/api/database/updatePremierCustomEmailButtons', {
      customEmailButtons: $scope.user.premierCustomEmailButtons,
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
      console.log('boxIndex', boxIndex);
      var textBefore = v.substring(0, cursorPos);
      var textAfter = v.substring(cursorPos, v.length);
      var newtext = textBefore + btn.appendText + textAfter;
      $scope.customEmailButtons[boxIndex].emailBody = newtext;
      $('textarea').removeClass("selectedBox");
    }
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
  $scope.loadSubmissions();
});

app.filter('trusted', ['$sce', function($sce) {
  return function(url) {
    return $sce.trustAsResourceUrl(url);
  };
}]);