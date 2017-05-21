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
  $scope.channelSelect = "all";
  $scope.user = SessionService.getUser();
  $scope.user.isAdmin = $scope.user.role == 'admin' ? true : false;
  $scope.viewStatus = 'new';
  $scope.counter = 0;
  $scope.channels = [];
  $scope.selectedGroups = [];
  $scope.showingElements = [];
  $scope.submissions = [];
  $scope.selectedChannelIDS = [];
  $scope.selectedGroupChannelIDS = [];
  $scope.selectedChannelName = [];
  $scope.paidRepostAccounts = [];
  $scope.genre = "";
  $scope.limit = 20;
  $scope.dynamicButton = [{
    "name": "FILE",
    "appendText": " {TRACK_FILE} "
  }, {
    "name": "TRACK LINK",
    "appendText": " {TRACK_LINK} "
  }, {
    "name": "SUBMITTERS EMAIL",
    "appendText": " {SUBMITTERS_EMAIL} "
  }, {
    "name": "SUBMITTERS NAME",
    "appendText": " {SUBMITTERS_NAME} "
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

  if (window.location.href.indexOf('admin/premiersubmissions#mysubmissions') != -1) {
    $('.nav-tabs a[href="#mysubmissions"]').tab('show');
  } else if (window.location.href.indexOf('admin/premiersubmissions#managesubmissions') != -1) {
    $('.nav-tabs a[href="#managesubmissions"]').tab('show');
  }

  $scope.changeChannelSelect = function() {
    $scope.showingElements = [];
    $scope.loadSubmissions();
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
  $scope.getPaidRepostAccounts();

  $scope.loadSubmissions = function() {
    $scope.processing = true;
    $http.get('/api/premier/unaccepted?genre=' + $scope.genre + "&skip=" + $scope.showingElements.length + "&limit=" + $scope.limit + "&userID=" + $scope.channelSelect + "&status=" + $scope.viewStatus)
      .then(function(res) {
        $scope.processing = false;
        if (res.data.length > 0) {
          angular.forEach(res.data, function(d) {
            d.channel = null;
            d.emailBody = "";
            $scope.showingElements.push(d);
          });
        }
      })
      .then(null, function(err) {
        $scope.processing = false;
        $.Zebra_Dialog('Error: No premiere submissions found.')
        console.log(err);
      });
  }

  $scope.loadMore = function() {
    $scope.loadSubmissions();
  }

  $scope.accept = function(submi) {
    $scope.processing = true;
    submi.status = "saved";
    $http.put("/api/premier/accept", {
        submi: submi
      })
      .then(function(sub) {
        $scope.processing = false;
      })
      .then(null, function(err) {
        $scope.processing = false;
        $.Zebra_Dialog(err.data);
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

  $scope.delete = function(submission) {
    $scope.processing = true;
    $http.post("/api/premier/delete", {
        id: submission._id
      })
      .then(function(sub) {
        $scope.showingElements.splice($scope.showingElements.indexOf(submission), 1);
        $scope.processing = false;
      })
      .then(null, function(err) {
        $.Zebra_Dialog(err.data);
        $scope.processing = false;
      });
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

  $scope.sendTestMail = function(index) {
    $scope.emailIndex = index;
    $scope.testEmail("testemail@artistsunlimited.com");
    // $scope.showTestEmailModal = true;

    // $('#emailModal').modal('show');
  }

  $scope.testEmail = function(email) {
    // $scope.showTestEmailModal = false;
    // $('#emailModal').modal('hide');
    var subject = $scope.customEmailButtons[$scope.emailIndex].subject;
    var body = $scope.customEmailButtons[$scope.emailIndex].emailBody;
    body = formatForTestEmail(body, email);
    subject = formatForTestEmail(subject, email);
    $window.open("mailto:" + email + "?body=" + body + "&subject=" + subject, "_self");
  }

  function formatForTestEmail(item, email) {
    return encodeURIComponent(item.replace(/{SUBMITTERS_EMAIL}/g, email).replace(/{SUBMITTERS_NAME}/g, "Johnny Submitter").replace(/{TRACK_LINK}/g, "https://soundcloud.com/david-austin-music/like-me-slightly-max-milner").replace(/{TRACK_FILE}/g, "https://premiersubmissions.s3.amazonaws.com/40%20When%20You%20Leave%20%28Numa%20Numa%29%20%28Basshunter%20Remix%29_1461703460790.mp3").replace(/{SUBMITTED_TO_ACCOUNT_NAME}/g, "La Tropical").replace(/{SUBMITTED_ACCOUNT_NAME_WITH_LINK}/g, 'La Tropical (https://soundcloud.com/latropical)').replace('{TODAYSDATE}', new Date().toLocaleDateString()));
  }

  $scope.openEmailClient = function(sub, item) {
    var toEmail = formatForEmailClient(item.toEmail, sub);
    var subject = (item.subject != undefined ? formatForEmailClient(item.subject, sub) : "");
    var body = (item.emailBody != undefined ? formatForEmailClient(item.emailBody, sub) : "");
    $window.open("mailto:" + encodeURIComponent(toEmail) + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body), "_self");
  }

  function formatForEmailClient(text, sub) {
    return (text.replace(/{SUBMITTERS_EMAIL}/g, sub.email).replace(/{SUBMITTERS_NAME}/g, sub.name).replace(/{TRACK_LINK}/g, sub.trackLink).replace(/{TRACK_FILE}/g, sub.s3URL).replace(/{SUBMITTED_TO_ACCOUNT_NAME}/g, sub.userID.soundcloud.username).replace(/{SUBMITTED_ACCOUNT_NAME_WITH_LINK}/g, sub.userID.soundcloud.username + ' (' + sub.userID.soundcloud.permalinkURL + ')').replace('{TODAYSDATE}', new Date().toLocaleDateString()));
  }

  $scope.loadSubmissions();
});

app.filter('trusted', ['$sce', function($sce) {
  return function(url) {
    return $sce.trustAsResourceUrl(url);
  };
}]);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJwcmVtaWVyU3VibWlzc2lvbnMvY29udHJvbGxlcnMvcHJlbWllclN1Ym1pc3Npb25Db250cm9sbGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncHJlbWllcnN1Ym1pc3Npb25zJywge1xyXG4gICAgdXJsOiAnL2FkbWluL3ByZW1pZXJzdWJtaXNzaW9ucycsXHJcbiAgICB0ZW1wbGF0ZVVybDogJ2pzL3ByZW1pZXJTdWJtaXNzaW9ucy92aWV3cy9wcmVtaWVyU3VibWlzc2lvbnMuaHRtbCcsXHJcbiAgICBjb250cm9sbGVyOiAnUHJlbWllclN1Ym1pc3Npb25Db250cm9sbGVyJ1xyXG4gIH0pO1xyXG59KTtcclxuXHJcbmFwcC5jb250cm9sbGVyKCdQcmVtaWVyU3VibWlzc2lvbkNvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgJGh0dHAsIEF1dGhTZXJ2aWNlLCBTZXNzaW9uU2VydmljZSwgJHNjZSwgJHdpbmRvdykge1xyXG4gICRzY29wZS5pc0xvZ2dlZEluID0gU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpID8gdHJ1ZSA6IGZhbHNlO1xyXG4gIGlmICghU2Vzc2lvblNlcnZpY2UuZ2V0VXNlcigpKSB7XHJcbiAgICAkc3RhdGUuZ28oJ2FkbWluJyk7XHJcbiAgfVxyXG4gICRzY29wZS5jaGFubmVsU2VsZWN0ID0gXCJhbGxcIjtcclxuICAkc2NvcGUudXNlciA9IFNlc3Npb25TZXJ2aWNlLmdldFVzZXIoKTtcclxuICAkc2NvcGUudXNlci5pc0FkbWluID0gJHNjb3BlLnVzZXIucm9sZSA9PSAnYWRtaW4nID8gdHJ1ZSA6IGZhbHNlO1xyXG4gICRzY29wZS52aWV3U3RhdHVzID0gJ25ldyc7XHJcbiAgJHNjb3BlLmNvdW50ZXIgPSAwO1xyXG4gICRzY29wZS5jaGFubmVscyA9IFtdO1xyXG4gICRzY29wZS5zZWxlY3RlZEdyb3VwcyA9IFtdO1xyXG4gICRzY29wZS5zaG93aW5nRWxlbWVudHMgPSBbXTtcclxuICAkc2NvcGUuc3VibWlzc2lvbnMgPSBbXTtcclxuICAkc2NvcGUuc2VsZWN0ZWRDaGFubmVsSURTID0gW107XHJcbiAgJHNjb3BlLnNlbGVjdGVkR3JvdXBDaGFubmVsSURTID0gW107XHJcbiAgJHNjb3BlLnNlbGVjdGVkQ2hhbm5lbE5hbWUgPSBbXTtcclxuICAkc2NvcGUucGFpZFJlcG9zdEFjY291bnRzID0gW107XHJcbiAgJHNjb3BlLmdlbnJlID0gXCJcIjtcclxuICAkc2NvcGUubGltaXQgPSAyMDtcclxuICAkc2NvcGUuZHluYW1pY0J1dHRvbiA9IFt7XHJcbiAgICBcIm5hbWVcIjogXCJGSUxFXCIsXHJcbiAgICBcImFwcGVuZFRleHRcIjogXCIge1RSQUNLX0ZJTEV9IFwiXHJcbiAgfSwge1xyXG4gICAgXCJuYW1lXCI6IFwiVFJBQ0sgTElOS1wiLFxyXG4gICAgXCJhcHBlbmRUZXh0XCI6IFwiIHtUUkFDS19MSU5LfSBcIlxyXG4gIH0sIHtcclxuICAgIFwibmFtZVwiOiBcIlNVQk1JVFRFUlMgRU1BSUxcIixcclxuICAgIFwiYXBwZW5kVGV4dFwiOiBcIiB7U1VCTUlUVEVSU19FTUFJTH0gXCJcclxuICB9LCB7XHJcbiAgICBcIm5hbWVcIjogXCJTVUJNSVRURVJTIE5BTUVcIixcclxuICAgIFwiYXBwZW5kVGV4dFwiOiBcIiB7U1VCTUlUVEVSU19OQU1FfSBcIlxyXG4gIH0sIHtcclxuICAgIFwibmFtZVwiOiBcIlRPREFZUyBEQVRFXCIsXHJcbiAgICBcImFwcGVuZFRleHRcIjogXCIge1RPREFZU0RBVEV9IFwiXHJcbiAgfSwge1xyXG4gICAgXCJuYW1lXCI6IFwiU1VCTUlUVEVEIFRPIEFDQ09VTlQgTkFNRVwiLFxyXG4gICAgXCJhcHBlbmRUZXh0XCI6IFwiIHtTVUJNSVRURURfVE9fQUNDT1VOVF9OQU1FfSBcIlxyXG4gIH0sIHtcclxuICAgIFwibmFtZVwiOiBcIlNVQk1JVFRFRCBBQ0NPVU5UIE5BTUUgVy8gTElOS1wiLFxyXG4gICAgXCJhcHBlbmRUZXh0XCI6IFwiIHtTVUJNSVRURURfQUNDT1VOVF9OQU1FX1dJVEhfTElOS30gXCJcclxuICB9XTtcclxuXHJcbiAgaWYgKHdpbmRvdy5sb2NhdGlvbi5ocmVmLmluZGV4T2YoJ2FkbWluL3ByZW1pZXJzdWJtaXNzaW9ucyNteXN1Ym1pc3Npb25zJykgIT0gLTEpIHtcclxuICAgICQoJy5uYXYtdGFicyBhW2hyZWY9XCIjbXlzdWJtaXNzaW9uc1wiXScpLnRhYignc2hvdycpO1xyXG4gIH0gZWxzZSBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5kZXhPZignYWRtaW4vcHJlbWllcnN1Ym1pc3Npb25zI21hbmFnZXN1Ym1pc3Npb25zJykgIT0gLTEpIHtcclxuICAgICQoJy5uYXYtdGFicyBhW2hyZWY9XCIjbWFuYWdlc3VibWlzc2lvbnNcIl0nKS50YWIoJ3Nob3cnKTtcclxuICB9XHJcblxyXG4gICRzY29wZS5jaGFuZ2VDaGFubmVsU2VsZWN0ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzID0gW107XHJcbiAgICAkc2NvcGUubG9hZFN1Ym1pc3Npb25zKCk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuZ2V0UGFpZFJlcG9zdEFjY291bnRzID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkaHR0cC5nZXQoJy9hcGkvc3VibWlzc2lvbnMvZ2V0UGFpZFJlcG9zdEFjY291bnRzJykudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgJHNjb3BlLnBhaWRSZXBvc3RBY2NvdW50cyA9IHJlcy5kYXRhO1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8ICRzY29wZS5wYWlkUmVwb3N0QWNjb3VudHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAkc2NvcGUucGFpZFJlcG9zdEFjY291bnRzW2ldLmdyb3Vwcy5mb3JFYWNoKGZ1bmN0aW9uKGFjYykge1xyXG4gICAgICAgICAgaWYgKGFjYyAhPSBcIlwiICYmICRzY29wZS51bmlxdWVHcm91cC5pbmRleE9mKGFjYykgPT09IC0xKSB7XHJcbiAgICAgICAgICAgICRzY29wZS51bmlxdWVHcm91cC5wdXNoKGFjYyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH1cclxuICAgIH0pO1xyXG4gIH1cclxuICAkc2NvcGUuZ2V0UGFpZFJlcG9zdEFjY291bnRzKCk7XHJcblxyXG4gICRzY29wZS5sb2FkU3VibWlzc2lvbnMgPSBmdW5jdGlvbigpIHtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgICRodHRwLmdldCgnL2FwaS9wcmVtaWVyL3VuYWNjZXB0ZWQ/Z2VucmU9JyArICRzY29wZS5nZW5yZSArIFwiJnNraXA9XCIgKyAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLmxlbmd0aCArIFwiJmxpbWl0PVwiICsgJHNjb3BlLmxpbWl0ICsgXCImdXNlcklEPVwiICsgJHNjb3BlLmNoYW5uZWxTZWxlY3QgKyBcIiZzdGF0dXM9XCIgKyAkc2NvcGUudmlld1N0YXR1cylcclxuICAgICAgLnRoZW4oZnVuY3Rpb24ocmVzKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICBpZiAocmVzLmRhdGEubGVuZ3RoID4gMCkge1xyXG4gICAgICAgICAgYW5ndWxhci5mb3JFYWNoKHJlcy5kYXRhLCBmdW5jdGlvbihkKSB7XHJcbiAgICAgICAgICAgIGQuY2hhbm5lbCA9IG51bGw7XHJcbiAgICAgICAgICAgIGQuZW1haWxCb2R5ID0gXCJcIjtcclxuICAgICAgICAgICAgJHNjb3BlLnNob3dpbmdFbGVtZW50cy5wdXNoKGQpO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KVxyXG4gICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICQuWmVicmFfRGlhbG9nKCdFcnJvcjogTm8gcHJlbWllcmUgc3VibWlzc2lvbnMgZm91bmQuJylcclxuICAgICAgICBjb25zb2xlLmxvZyhlcnIpO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gICRzY29wZS5sb2FkTW9yZSA9IGZ1bmN0aW9uKCkge1xyXG4gICAgJHNjb3BlLmxvYWRTdWJtaXNzaW9ucygpO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmFjY2VwdCA9IGZ1bmN0aW9uKHN1Ym1pKSB7XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICBzdWJtaS5zdGF0dXMgPSBcInNhdmVkXCI7XHJcbiAgICAkaHR0cC5wdXQoXCIvYXBpL3ByZW1pZXIvYWNjZXB0XCIsIHtcclxuICAgICAgICBzdWJtaTogc3VibWlcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4oZnVuY3Rpb24oc3ViKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgICAkLlplYnJhX0RpYWxvZyhlcnIuZGF0YSk7XHJcbiAgICAgIH0pXHJcbiAgfVxyXG5cclxuICAkc2NvcGUuZGVjbGluZSA9IGZ1bmN0aW9uKHN1Ym1pc3Npb24pIHtcclxuICAgICRzY29wZS5wcm9jZXNzaW5nID0gdHJ1ZTtcclxuICAgIHN1Ym1pc3Npb24uc3RhdHVzID0gXCJkZWNsaW5lZFwiO1xyXG4gICAgJGh0dHAucHV0KCcvYXBpL3ByZW1pZXIvZGVjbGluZScsIHtcclxuICAgICAgICBzdWJtaXNzaW9uOiBzdWJtaXNzaW9uXHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHJlcykge1xyXG4gICAgICAgIHZhciBpbmRleCA9ICRzY29wZS5zaG93aW5nRWxlbWVudHMuaW5kZXhPZihzdWJtaXNzaW9uKTtcclxuICAgICAgICAkc2NvcGUuc2hvd2luZ0VsZW1lbnRzLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJEZWNsaW5lZFwiKTtcclxuICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlXHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKG51bGwsIGZ1bmN0aW9uKGVycikge1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJFUlJPUjogZGlkIG5vdCBEZWNsaW5lXCIpO1xyXG4gICAgICB9KTtcclxuICB9XHJcblxyXG4gICRzY29wZS5kZWxldGUgPSBmdW5jdGlvbihzdWJtaXNzaW9uKSB7XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAkaHR0cC5wb3N0KFwiL2FwaS9wcmVtaWVyL2RlbGV0ZVwiLCB7XHJcbiAgICAgICAgaWQ6IHN1Ym1pc3Npb24uX2lkXHJcbiAgICAgIH0pXHJcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHN1Yikge1xyXG4gICAgICAgICRzY29wZS5zaG93aW5nRWxlbWVudHMuc3BsaWNlKCRzY29wZS5zaG93aW5nRWxlbWVudHMuaW5kZXhPZihzdWJtaXNzaW9uKSwgMSk7XHJcbiAgICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgfSlcclxuICAgICAgLnRoZW4obnVsbCwgZnVuY3Rpb24oZXJyKSB7XHJcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coZXJyLmRhdGEpO1xyXG4gICAgICAgICRzY29wZS5wcm9jZXNzaW5nID0gZmFsc2U7XHJcbiAgICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLmN1c3RvbUVtYWlsQnV0dG9ucyA9ICRzY29wZS51c2VyLnByZW1pZXJDdXN0b21FbWFpbEJ1dHRvbnMubGVuZ3RoID4gMCA/ICRzY29wZS51c2VyLnByZW1pZXJDdXN0b21FbWFpbEJ1dHRvbnMgOiBbXTtcclxuICBpZiAoJHNjb3BlLmN1c3RvbUVtYWlsQnV0dG9ucy5sZW5ndGggPT0gMCkge1xyXG4gICAgJHNjb3BlLmN1c3RvbUVtYWlsQnV0dG9ucy5wdXNoKHtcclxuICAgICAgdG9FbWFpbDogJycsXHJcbiAgICAgIHN1YmplY3Q6ICcnLFxyXG4gICAgICBlbWFpbEJvZHk6ICcnLFxyXG4gICAgICBidXR0b25UZXh0OiAnJyxcclxuICAgICAgYnV0dG9uQmdDb2xvcjogJydcclxuICAgIH0pO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLnNhdmVTZXR0aW5ncyA9IGZ1bmN0aW9uKCkge1xyXG4gICAgdmFyIHZhbGlkID0gdHJ1ZTtcclxuICAgIHZhciByZSA9IC9eKChbXjw+KClcXFtcXF1cXFxcLiw7Olxcc0BcIl0rKFxcLltePD4oKVxcW1xcXVxcXFwuLDs6XFxzQFwiXSspKil8KFwiLitcIikpQCgoXFxbWzAtOV17MSwzfVxcLlswLTldezEsM31cXC5bMC05XXsxLDN9XFwuWzAtOV17MSwzfV0pfCgoW2EtekEtWlxcLTAtOV0rXFwuKStbYS16QS1aXXsyLH0pKSQvO1xyXG4gICAgYW5ndWxhci5mb3JFYWNoKCRzY29wZS5jdXN0b21FbWFpbEJ1dHRvbnMsIGZ1bmN0aW9uKGNiKSB7XHJcbiAgICAgIGlmICghY2IudG9FbWFpbC5pbmNsdWRlcyhcIntTVUJNSVRURVJTX0VNQUlMfVwiKSkge1xyXG4gICAgICAgIHZhciB2YWxpZEVtYWlsID0gcmUudGVzdChjYi50b0VtYWlsKTtcclxuICAgICAgICBpZiAoIXZhbGlkRW1haWwgfHwgIWNiLmJ1dHRvblRleHQpIHtcclxuICAgICAgICAgIHZhbGlkID0gZmFsc2U7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9KTtcclxuICAgIGlmICghdmFsaWQpIHtcclxuICAgICAgJC5aZWJyYV9EaWFsb2coJ1BsZWFzZSBlbnRlciB7U1VCTUlUVEVSU19FTUFJTH0gb3IgYSB3ZWxsIGZvcm1hdHRlZCBlbWFpbCBhZGRyZXNzIGluIGFsbCBUbyBFbWFpbCBmaWVsZHMgYW5kIGEgdGl0bGUgZm9yIGVhY2ggYnV0dG9uLicpO1xyXG4gICAgICByZXR1cm47XHJcbiAgICB9XHJcbiAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAkc2NvcGUudXNlci5wcmVtaWVyQ3VzdG9tRW1haWxCdXR0b25zID0gJHNjb3BlLmN1c3RvbUVtYWlsQnV0dG9ucztcclxuICAgICRodHRwLnBvc3QoJy9hcGkvZGF0YWJhc2UvdXBkYXRlUHJlbWllckN1c3RvbUVtYWlsQnV0dG9ucycsIHtcclxuICAgICAgY3VzdG9tRW1haWxCdXR0b25zOiAkc2NvcGUudXNlci5wcmVtaWVyQ3VzdG9tRW1haWxCdXR0b25zLFxyXG4gICAgfSkudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgJHNjb3BlLnByb2Nlc3NpbmcgPSBmYWxzZTtcclxuICAgICAgU2Vzc2lvblNlcnZpY2UuY3JlYXRlKHJlcy5kYXRhKTtcclxuICAgICAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICB9KTtcclxuICB9XHJcblxyXG4gICRzY29wZS5hZGRJdGVtID0gZnVuY3Rpb24oKSB7XHJcbiAgICAkc2NvcGUuY3VzdG9tRW1haWxCdXR0b25zLnB1c2goe1xyXG4gICAgICB0b0VtYWlsOiAnJyxcclxuICAgICAgc3ViamVjdDogJycsXHJcbiAgICAgIGVtYWlsQm9keTogJycsXHJcbiAgICAgIGJ1dHRvblRleHQ6ICcnLFxyXG4gICAgICBidXR0b25CZ0NvbG9yOiAnJ1xyXG4gICAgfSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUucmVtb3ZlSXRlbSA9IGZ1bmN0aW9uKGluZGV4KSB7XHJcbiAgICAkc2NvcGUuY3VzdG9tRW1haWxCdXR0b25zLnNwbGljZShpbmRleCwgMSk7XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuYWRkRXZlbnRDbGFzcyA9IGZ1bmN0aW9uKGluZGV4LCB0eXBlKSB7XHJcbiAgICAkKCcuc2VsZWN0ZWRCb3gnKS5yZW1vdmVDbGFzcyhcInNlbGVjdGVkQm94XCIpO1xyXG4gICAgJChcIi5cIiArIHR5cGUgKyBpbmRleCkuYWRkQ2xhc3MoXCJzZWxlY3RlZEJveFwiKTtcclxuICB9XHJcblxyXG4gICRzY29wZS5hcHBlbmRCb2R5ID0gZnVuY3Rpb24oYnRuKSB7XHJcbiAgICBpZiAoJCgnLnNlbGVjdGVkQm94JykubGVuZ3RoKSB7XHJcbiAgICAgIHZhciBib3hJbmRleCA9ICQoJy5zZWxlY3RlZEJveCcpLmF0dHIoXCJpbmRleFwiKTtcclxuICAgICAgdmFyIGN1cnNvclBvcyA9ICQoJy5zZWxlY3RlZEJveCcpLnByb3AoJ3NlbGVjdGlvblN0YXJ0Jyk7XHJcbiAgICAgIHZhciB2ID0gJCgnLnNlbGVjdGVkQm94JykudmFsKCk7XHJcbiAgICAgIHZhciB0ZXh0QmVmb3JlID0gdi5zdWJzdHJpbmcoMCwgY3Vyc29yUG9zKTtcclxuICAgICAgdmFyIHRleHRBZnRlciA9IHYuc3Vic3RyaW5nKGN1cnNvclBvcywgdi5sZW5ndGgpO1xyXG4gICAgICB2YXIgbmV3dGV4dCA9IHRleHRCZWZvcmUgKyBidG4uYXBwZW5kVGV4dCArIHRleHRBZnRlcjtcclxuICAgICAgJCgnLnNlbGVjdGVkQm94JykudmFsKG5ld3RleHQpO1xyXG4gICAgICAkKCcuc2VsZWN0ZWRCb3gnKS50cmlnZ2VyKCdpbnB1dCcpXHJcbiAgICAgICQoJy5zZWxlY3RlZEJveCcpLnJlbW92ZUNsYXNzKFwic2VsZWN0ZWRCb3hcIik7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAkc2NvcGUuc2VuZFRlc3RNYWlsID0gZnVuY3Rpb24oaW5kZXgpIHtcclxuICAgICRzY29wZS5lbWFpbEluZGV4ID0gaW5kZXg7XHJcbiAgICAkc2NvcGUudGVzdEVtYWlsKFwidGVzdGVtYWlsQGFydGlzdHN1bmxpbWl0ZWQuY29tXCIpO1xyXG4gICAgLy8gJHNjb3BlLnNob3dUZXN0RW1haWxNb2RhbCA9IHRydWU7XHJcblxyXG4gICAgLy8gJCgnI2VtYWlsTW9kYWwnKS5tb2RhbCgnc2hvdycpO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLnRlc3RFbWFpbCA9IGZ1bmN0aW9uKGVtYWlsKSB7XHJcbiAgICAvLyAkc2NvcGUuc2hvd1Rlc3RFbWFpbE1vZGFsID0gZmFsc2U7XHJcbiAgICAvLyAkKCcjZW1haWxNb2RhbCcpLm1vZGFsKCdoaWRlJyk7XHJcbiAgICB2YXIgc3ViamVjdCA9ICRzY29wZS5jdXN0b21FbWFpbEJ1dHRvbnNbJHNjb3BlLmVtYWlsSW5kZXhdLnN1YmplY3Q7XHJcbiAgICB2YXIgYm9keSA9ICRzY29wZS5jdXN0b21FbWFpbEJ1dHRvbnNbJHNjb3BlLmVtYWlsSW5kZXhdLmVtYWlsQm9keTtcclxuICAgIGJvZHkgPSBmb3JtYXRGb3JUZXN0RW1haWwoYm9keSwgZW1haWwpO1xyXG4gICAgc3ViamVjdCA9IGZvcm1hdEZvclRlc3RFbWFpbChzdWJqZWN0LCBlbWFpbCk7XHJcbiAgICAkd2luZG93Lm9wZW4oXCJtYWlsdG86XCIgKyBlbWFpbCArIFwiP2JvZHk9XCIgKyBib2R5ICsgXCImc3ViamVjdD1cIiArIHN1YmplY3QsIFwiX3NlbGZcIik7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBmb3JtYXRGb3JUZXN0RW1haWwoaXRlbSwgZW1haWwpIHtcclxuICAgIHJldHVybiBlbmNvZGVVUklDb21wb25lbnQoaXRlbS5yZXBsYWNlKC97U1VCTUlUVEVSU19FTUFJTH0vZywgZW1haWwpLnJlcGxhY2UoL3tTVUJNSVRURVJTX05BTUV9L2csIFwiSm9obm55IFN1Ym1pdHRlclwiKS5yZXBsYWNlKC97VFJBQ0tfTElOS30vZywgXCJodHRwczovL3NvdW5kY2xvdWQuY29tL2RhdmlkLWF1c3Rpbi1tdXNpYy9saWtlLW1lLXNsaWdodGx5LW1heC1taWxuZXJcIikucmVwbGFjZSgve1RSQUNLX0ZJTEV9L2csIFwiaHR0cHM6Ly9wcmVtaWVyc3VibWlzc2lvbnMuczMuYW1hem9uYXdzLmNvbS80MCUyMFdoZW4lMjBZb3UlMjBMZWF2ZSUyMCUyOE51bWElMjBOdW1hJTI5JTIwJTI4QmFzc2h1bnRlciUyMFJlbWl4JTI5XzE0NjE3MDM0NjA3OTAubXAzXCIpLnJlcGxhY2UoL3tTVUJNSVRURURfVE9fQUNDT1VOVF9OQU1FfS9nLCBcIkxhIFRyb3BpY2FsXCIpLnJlcGxhY2UoL3tTVUJNSVRURURfQUNDT1VOVF9OQU1FX1dJVEhfTElOS30vZywgJ0xhIFRyb3BpY2FsIChodHRwczovL3NvdW5kY2xvdWQuY29tL2xhdHJvcGljYWwpJykucmVwbGFjZSgne1RPREFZU0RBVEV9JywgbmV3IERhdGUoKS50b0xvY2FsZURhdGVTdHJpbmcoKSkpO1xyXG4gIH1cclxuXHJcbiAgJHNjb3BlLm9wZW5FbWFpbENsaWVudCA9IGZ1bmN0aW9uKHN1YiwgaXRlbSkge1xyXG4gICAgdmFyIHRvRW1haWwgPSBmb3JtYXRGb3JFbWFpbENsaWVudChpdGVtLnRvRW1haWwsIHN1Yik7XHJcbiAgICB2YXIgc3ViamVjdCA9IChpdGVtLnN1YmplY3QgIT0gdW5kZWZpbmVkID8gZm9ybWF0Rm9yRW1haWxDbGllbnQoaXRlbS5zdWJqZWN0LCBzdWIpIDogXCJcIik7XHJcbiAgICB2YXIgYm9keSA9IChpdGVtLmVtYWlsQm9keSAhPSB1bmRlZmluZWQgPyBmb3JtYXRGb3JFbWFpbENsaWVudChpdGVtLmVtYWlsQm9keSwgc3ViKSA6IFwiXCIpO1xyXG4gICAgJHdpbmRvdy5vcGVuKFwibWFpbHRvOlwiICsgZW5jb2RlVVJJQ29tcG9uZW50KHRvRW1haWwpICsgXCI/c3ViamVjdD1cIiArIGVuY29kZVVSSUNvbXBvbmVudChzdWJqZWN0KSArIFwiJmJvZHk9XCIgKyBlbmNvZGVVUklDb21wb25lbnQoYm9keSksIFwiX3NlbGZcIik7XHJcbiAgfVxyXG5cclxuICBmdW5jdGlvbiBmb3JtYXRGb3JFbWFpbENsaWVudCh0ZXh0LCBzdWIpIHtcclxuICAgIHJldHVybiAodGV4dC5yZXBsYWNlKC97U1VCTUlUVEVSU19FTUFJTH0vZywgc3ViLmVtYWlsKS5yZXBsYWNlKC97U1VCTUlUVEVSU19OQU1FfS9nLCBzdWIubmFtZSkucmVwbGFjZSgve1RSQUNLX0xJTkt9L2csIHN1Yi50cmFja0xpbmspLnJlcGxhY2UoL3tUUkFDS19GSUxFfS9nLCBzdWIuczNVUkwpLnJlcGxhY2UoL3tTVUJNSVRURURfVE9fQUNDT1VOVF9OQU1FfS9nLCBzdWIudXNlcklELnNvdW5kY2xvdWQudXNlcm5hbWUpLnJlcGxhY2UoL3tTVUJNSVRURURfQUNDT1VOVF9OQU1FX1dJVEhfTElOS30vZywgc3ViLnVzZXJJRC5zb3VuZGNsb3VkLnVzZXJuYW1lICsgJyAoJyArIHN1Yi51c2VySUQuc291bmRjbG91ZC5wZXJtYWxpbmtVUkwgKyAnKScpLnJlcGxhY2UoJ3tUT0RBWVNEQVRFfScsIG5ldyBEYXRlKCkudG9Mb2NhbGVEYXRlU3RyaW5nKCkpKTtcclxuICB9XHJcblxyXG4gICRzY29wZS5sb2FkU3VibWlzc2lvbnMoKTtcclxufSk7XHJcblxyXG5hcHAuZmlsdGVyKCd0cnVzdGVkJywgWyckc2NlJywgZnVuY3Rpb24oJHNjZSkge1xyXG4gIHJldHVybiBmdW5jdGlvbih1cmwpIHtcclxuICAgIHJldHVybiAkc2NlLnRydXN0QXNSZXNvdXJjZVVybCh1cmwpO1xyXG4gIH07XHJcbn1dKTtcclxuIl0sImZpbGUiOiJwcmVtaWVyU3VibWlzc2lvbnMvY29udHJvbGxlcnMvcHJlbWllclN1Ym1pc3Npb25Db250cm9sbGVyLmpzIn0=
