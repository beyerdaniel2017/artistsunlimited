app.config(function($stateProvider) {
  $stateProvider.state('repostevents', {
    url: '/repostevents/:username/:trackTitle',
    templateUrl: 'js/repostEvents/views/repostEvents.html',
    controller: 'RepostEventsController',
    resolve: {
      repostEvent: function($http, $location, $stateParams) {
        var paid = $location.search().paid;
        var url = '/api/events/repostEvent/' + $stateParams.username + '/' + $stateParams.trackTitle + '/' + paid;
        return $http.get(url)
          .then(function(res) {
            var events = res.data.sort(function(a, b) {
              return new Date(a.trackInfo.day).getTime() - new Date(b.trackInfo.day).getTime();
            });
            console.log(events);
            return events;
          })
          .then(null, function(err) {
            $.Zebra_Dialog("This repost event does not exist.");
            return;
          })
      },
    }
  });
});

app.controller('RepostEventsController', function($rootScope, $state, $scope, repostEvent, $http, $location, $window, $q, $sce, $auth, SessionService) {
  if (!!repostEvent) {
    $scope.user = SessionService.getUser();
    $scope.itemview = "calender";
    $scope.setView = function(view) {
      $scope.itemview = view;
    };
    var daysArray = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

    if (!!repostEvent) {
      $scope.listevents = repostEvent;
      $scope.trackImage = repostEvent[0].trackInfo.trackArtUrl;
      if (!repostEvent[0].trackInfo.trackArtUrl) {
        SC.get('/tracks/' + repostEvent[0].trackInfo.trackID)
          .then(function(track) {
            $scope.trackImage = track.artwork_url;
            $scope.listevents[0].trackInfo.artistName = track.user.username;
          })
      }
    };

    $scope.dayIncr = 7;
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
        return {
          'border-radius': '4px'
        }
      } else if (repostEvent.type == 'multiple') {
        return {
          'background-color': '#7A549B',
          'height': '20px',
          'border-radius': '4px'
        }
      } else if (repostEvent.trackInfo.type == 'track' || repostEvent.trackInfo.type == 'queue') {
        return {
          'background-color': '#FF7676',
          'border-radius': '4px'
        }
      } else if (repostEvent.trackInfo.type == 'traded') {
        return {
          'background-color': '#FFD450',
          'border-radius': '4px'
        }
      } else if (repostEvent.trackInfo.type == 'paid') {
        return {
          'background-color': '#FFBBDD',
          'border-radius': '4px'
        }
      }
    }
    $scope.followCounts = 0;
    repostEvent.forEach(function(ev) {
      ev.day = new Date(ev.trackInfo.day);
      if (ev.day > new Date()) $scope.followCounts += ev.userInfo.followers;
    });
    $scope.events = repostEvent;
    $scope.fillDateArrays = function(repostEvent) {
      var calendar = [];
      var today = new Date();
      today.setDate(today.getDate() - 7);
      for (var i = 0; i < 29; i++) {
        var calDay = {};
        calDay.day = new Date(today);
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
          if (eventArray[new Date(ev.trackInfo.day).getHours()].type == 'empty') {
            ev.type = 'track';
            eventArray[new Date(ev.trackInfo.day).getHours()] = ev;
          } else if (eventArray[new Date(ev.trackInfo.day).getHours()].type == 'track') {
            var event = {
              type: 'multiple',
              events: []
            }
            event.events.push(eventArray[new Date(ev.trackInfo.day).getHours()])
            event.events.push(ev);
            eventArray[new Date(ev.trackInfo.day).getHours()] = event;
          } else if (eventArray[new Date(ev.trackInfo.day).getHours()].type == 'multiple') {
            eventArray[new Date(ev.trackInfo.day).getHours()].events.push(ev);
          }
        });
        calDay.events = eventArray;
        calendar.push(calDay);
      }
      return calendar;
    };

    $scope.getEventText = function(repostEvent) {
      if (repostEvent.type == 'track') return repostEvent.userInfo.username
      else if (repostEvent.type == 'multiple') return 'Multiple Reposts'
    }

    $scope.backEvent = function() {
      $scope.makeEvent = null;
      $scope.trackType = "";
      $scope.trackArtistID = 0;
      $scope.showOverlay = false;
    }

    $scope.calendar = $scope.fillDateArrays(repostEvent);
    $scope.clickedSlot = function(day, hour, data) {
      if (data.type == 'multiple') {
        var buttons = [];
        data.events.forEach(function(ev) {
          var button = {
            caption: ev.userInfo.username,
            callback: function() {
              $scope.openPopup(day, hour, ev);
              if (!$scope.$$phase) $scope.$apply();
            }
          }
          buttons.push(button);
        })
        $.Zebra_Dialog('Which slot do you want to view?', {
          'type': 'question',
          'buttons': buttons
        });
      } else {
        $scope.openPopup(day, hour, data);
      }
    }

    $scope.openPopup = function(day, hour, data) {
      if (data.trackInfo) {
        $scope.makeEvent = {};
        $scope.popup = true;
        var makeDay = new Date(day);
        makeDay.setHours(hour);
        $scope.makeEvent.day = new Date(makeDay);
        $scope.makeEvent.url = data.trackInfo.trackURL;
        $scope.makeEvent.trackID = data.trackInfo.trackID;
        $scope.makeEvent.comment = data.trackInfo.comment;
        var diff = (new Date(data.trackInfo.unrepostDate).getTime() - new Date(data.trackInfo.day).getTime()) / 3600000;
        if (diff > 0) $scope.makeEvent.unrepostHours = diff;
        $scope.unrepostEnable = diff > 0;
        $scope.makeEvent.timeGap = data.trackInfo.timeGap;
        $scope.makeEvent.username = data.userInfo.username;
        $scope.makeEvent.followers = data.userInfo.followers;
        if (data.trackInfo.like) $scope.likeSrc = 'assets/images/likeTrue.svg';
        else $scope.likeSrc = 'assets/images/like.svg';
        if (data.trackInfo.comment) $scope.commentSrc = 'assets/images/comment.svg';
        else $scope.commentSrc = 'assets/images/noComment.svg';
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
        })
        $scope.playerURL = $sce.trustAsResourceUrl("https://w.soundcloud.com/player/?url=http://api.soundcloud.com/tracks/" + $scope.makeEvent.trackID + "&auto_play=false&show_artwork=false")
        document.getElementById('scPopupPlayer').style.visibility = "visible";
      }
    }
    $scope.detailView = function(data) {
      $scope.itemview = "detailListView";
      $scope.makeEvent = {};
      var day = new Date(data.trackInfo.day);
      $scope.makeEvent._id = data.trackInfo._id;
      $scope.makeEvent.day = new Date(data.trackInfo.day);
      $scope.makeEvent.url = data.trackInfo.trackURL;
      $scope.makeEvent.trackID = data.trackInfo.trackID;
      $scope.makeEvent.comment = data.trackInfo.comment;
      $scope.makeEvent.followers = data.userInfo.followers;
      $scope.makeEvent.username = data.userInfo.username;
      if (data.trackInfo.like) $scope.likeSrc = 'assets/images/likeTrue.svg';
      else $scope.likeSrc = 'assets/images/like.svg';
      if (data.trackInfo.comment) $scope.commentSrc = 'assets/images/comment.svg';
      else $scope.commentSrc = 'assets/images/noComment.svg';
      $scope.makeEvent.artist = data.userInfo;
      var repostDate = new Date(data.trackInfo.day);
      $scope.makeEvent.unrepostHours = data.trackInfo.unrepostHours;
      $scope.playerURL = $sce.trustAsResourceUrl("https://w.soundcloud.com/player/?url=http://api.soundcloud.com/tracks/" + $scope.makeEvent.trackID + "&auto_play=false&show_artwork=false")
      document.getElementById('scPlayer').style.visibility = "visible";
    }
    $scope.backToListEvent = function() {
      $scope.itemview = "list";
    }
  }
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyZXBvc3RFdmVudHMvY29udHJvbGxlcnMvcmVwb3N0RXZlbnRDb250cm9sbGVyLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImFwcC5jb25maWcoZnVuY3Rpb24oJHN0YXRlUHJvdmlkZXIpIHtcclxuICAkc3RhdGVQcm92aWRlci5zdGF0ZSgncmVwb3N0ZXZlbnRzJywge1xyXG4gICAgdXJsOiAnL3JlcG9zdGV2ZW50cy86dXNlcm5hbWUvOnRyYWNrVGl0bGUnLFxyXG4gICAgdGVtcGxhdGVVcmw6ICdqcy9yZXBvc3RFdmVudHMvdmlld3MvcmVwb3N0RXZlbnRzLmh0bWwnLFxyXG4gICAgY29udHJvbGxlcjogJ1JlcG9zdEV2ZW50c0NvbnRyb2xsZXInLFxyXG4gICAgcmVzb2x2ZToge1xyXG4gICAgICByZXBvc3RFdmVudDogZnVuY3Rpb24oJGh0dHAsICRsb2NhdGlvbiwgJHN0YXRlUGFyYW1zKSB7XHJcbiAgICAgICAgdmFyIHBhaWQgPSAkbG9jYXRpb24uc2VhcmNoKCkucGFpZDtcclxuICAgICAgICB2YXIgdXJsID0gJy9hcGkvZXZlbnRzL3JlcG9zdEV2ZW50LycgKyAkc3RhdGVQYXJhbXMudXNlcm5hbWUgKyAnLycgKyAkc3RhdGVQYXJhbXMudHJhY2tUaXRsZSArICcvJyArIHBhaWQ7XHJcbiAgICAgICAgcmV0dXJuICRodHRwLmdldCh1cmwpXHJcbiAgICAgICAgICAudGhlbihmdW5jdGlvbihyZXMpIHtcclxuICAgICAgICAgICAgdmFyIGV2ZW50cyA9IHJlcy5kYXRhLnNvcnQoZnVuY3Rpb24oYSwgYikge1xyXG4gICAgICAgICAgICAgIHJldHVybiBuZXcgRGF0ZShhLnRyYWNrSW5mby5kYXkpLmdldFRpbWUoKSAtIG5ldyBEYXRlKGIudHJhY2tJbmZvLmRheSkuZ2V0VGltZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgICAgICAgICAgY29uc29sZS5sb2coZXZlbnRzKTtcclxuICAgICAgICAgICAgcmV0dXJuIGV2ZW50cztcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgJC5aZWJyYV9EaWFsb2coXCJUaGlzIHJlcG9zdCBldmVudCBkb2VzIG5vdCBleGlzdC5cIik7XHJcbiAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgIH0pXHJcbiAgICAgIH0sXHJcbiAgICB9XHJcbiAgfSk7XHJcbn0pO1xyXG5cclxuYXBwLmNvbnRyb2xsZXIoJ1JlcG9zdEV2ZW50c0NvbnRyb2xsZXInLCBmdW5jdGlvbigkcm9vdFNjb3BlLCAkc3RhdGUsICRzY29wZSwgcmVwb3N0RXZlbnQsICRodHRwLCAkbG9jYXRpb24sICR3aW5kb3csICRxLCAkc2NlLCAkYXV0aCwgU2Vzc2lvblNlcnZpY2UpIHtcclxuICBpZiAoISFyZXBvc3RFdmVudCkge1xyXG4gICAgJHNjb3BlLnVzZXIgPSBTZXNzaW9uU2VydmljZS5nZXRVc2VyKCk7XHJcbiAgICAkc2NvcGUuaXRlbXZpZXcgPSBcImNhbGVuZGVyXCI7XHJcbiAgICAkc2NvcGUuc2V0VmlldyA9IGZ1bmN0aW9uKHZpZXcpIHtcclxuICAgICAgJHNjb3BlLml0ZW12aWV3ID0gdmlldztcclxuICAgIH07XHJcbiAgICB2YXIgZGF5c0FycmF5ID0gWydzdW5kYXknLCAnbW9uZGF5JywgJ3R1ZXNkYXknLCAnd2VkbmVzZGF5JywgJ3RodXJzZGF5JywgJ2ZyaWRheScsICdzYXR1cmRheSddO1xyXG5cclxuICAgIGlmICghIXJlcG9zdEV2ZW50KSB7XHJcbiAgICAgICRzY29wZS5saXN0ZXZlbnRzID0gcmVwb3N0RXZlbnQ7XHJcbiAgICAgICRzY29wZS50cmFja0ltYWdlID0gcmVwb3N0RXZlbnRbMF0udHJhY2tJbmZvLnRyYWNrQXJ0VXJsO1xyXG4gICAgICBpZiAoIXJlcG9zdEV2ZW50WzBdLnRyYWNrSW5mby50cmFja0FydFVybCkge1xyXG4gICAgICAgIFNDLmdldCgnL3RyYWNrcy8nICsgcmVwb3N0RXZlbnRbMF0udHJhY2tJbmZvLnRyYWNrSUQpXHJcbiAgICAgICAgICAudGhlbihmdW5jdGlvbih0cmFjaykge1xyXG4gICAgICAgICAgICAkc2NvcGUudHJhY2tJbWFnZSA9IHRyYWNrLmFydHdvcmtfdXJsO1xyXG4gICAgICAgICAgICAkc2NvcGUubGlzdGV2ZW50c1swXS50cmFja0luZm8uYXJ0aXN0TmFtZSA9IHRyYWNrLnVzZXIudXNlcm5hbWU7XHJcbiAgICAgICAgICB9KVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuICAgICRzY29wZS5kYXlJbmNyID0gNztcclxuICAgICRzY29wZS5pbmNyRGF5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIGlmICgkc2NvcGUuZGF5SW5jciA8IDIxKSAkc2NvcGUuZGF5SW5jcisrO1xyXG4gICAgfVxyXG5cclxuICAgICRzY29wZS5kZWNyRGF5ID0gZnVuY3Rpb24oKSB7XHJcbiAgICAgIGlmICgkc2NvcGUuZGF5SW5jciA+IDApICRzY29wZS5kYXlJbmNyLS07XHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLmRheU9mV2Vla0FzU3RyaW5nID0gZnVuY3Rpb24oZGF0ZSkge1xyXG4gICAgICB2YXIgZGF5SW5kZXggPSBkYXRlLmdldERheSgpO1xyXG4gICAgICBpZiAoc2NyZWVuLndpZHRoID4gJzc0NCcpIHtcclxuICAgICAgICByZXR1cm4gW1wiU3VuZGF5XCIsIFwiTW9uZGF5XCIsIFwiVHVlc2RheVwiLCBcIldlZG5lc2RheVwiLCBcIlRodXJzZGF5XCIsIFwiRnJpZGF5XCIsIFwiU2F0dXJkYXlcIl1bZGF5SW5kZXhdO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBbXCJTdW5cIiwgXCJNb25cIiwgXCJUdWVcIiwgXCJXZWRcIiwgXCJUaHVcIiwgXCJGcmlcIiwgXCJTYXRcIl1bZGF5SW5kZXhdO1xyXG4gICAgfVxyXG5cclxuICAgICRzY29wZS5nZXRFdmVudFN0eWxlID0gZnVuY3Rpb24ocmVwb3N0RXZlbnQpIHtcclxuICAgICAgaWYgKHJlcG9zdEV2ZW50LnR5cGUgPT0gJ2VtcHR5Jykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAnYm9yZGVyLXJhZGl1cyc6ICc0cHgnXHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKHJlcG9zdEV2ZW50LnR5cGUgPT0gJ211bHRpcGxlJykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6ICcjN0E1NDlCJyxcclxuICAgICAgICAgICdoZWlnaHQnOiAnMjBweCcsXHJcbiAgICAgICAgICAnYm9yZGVyLXJhZGl1cyc6ICc0cHgnXHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKHJlcG9zdEV2ZW50LnRyYWNrSW5mby50eXBlID09ICd0cmFjaycgfHwgcmVwb3N0RXZlbnQudHJhY2tJbmZvLnR5cGUgPT0gJ3F1ZXVlJykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6ICcjRkY3Njc2JyxcclxuICAgICAgICAgICdib3JkZXItcmFkaXVzJzogJzRweCdcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSBpZiAocmVwb3N0RXZlbnQudHJhY2tJbmZvLnR5cGUgPT0gJ3RyYWRlZCcpIHtcclxuICAgICAgICByZXR1cm4ge1xyXG4gICAgICAgICAgJ2JhY2tncm91bmQtY29sb3InOiAnI0ZGRDQ1MCcsXHJcbiAgICAgICAgICAnYm9yZGVyLXJhZGl1cyc6ICc0cHgnXHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2UgaWYgKHJlcG9zdEV2ZW50LnRyYWNrSW5mby50eXBlID09ICdwYWlkJykge1xyXG4gICAgICAgIHJldHVybiB7XHJcbiAgICAgICAgICAnYmFja2dyb3VuZC1jb2xvcic6ICcjRkZCQkREJyxcclxuICAgICAgICAgICdib3JkZXItcmFkaXVzJzogJzRweCdcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgICRzY29wZS5mb2xsb3dDb3VudHMgPSAwO1xyXG4gICAgcmVwb3N0RXZlbnQuZm9yRWFjaChmdW5jdGlvbihldikge1xyXG4gICAgICBldi5kYXkgPSBuZXcgRGF0ZShldi50cmFja0luZm8uZGF5KTtcclxuICAgICAgaWYgKGV2LmRheSA+IG5ldyBEYXRlKCkpICRzY29wZS5mb2xsb3dDb3VudHMgKz0gZXYudXNlckluZm8uZm9sbG93ZXJzO1xyXG4gICAgfSk7XHJcbiAgICAkc2NvcGUuZXZlbnRzID0gcmVwb3N0RXZlbnQ7XHJcbiAgICAkc2NvcGUuZmlsbERhdGVBcnJheXMgPSBmdW5jdGlvbihyZXBvc3RFdmVudCkge1xyXG4gICAgICB2YXIgY2FsZW5kYXIgPSBbXTtcclxuICAgICAgdmFyIHRvZGF5ID0gbmV3IERhdGUoKTtcclxuICAgICAgdG9kYXkuc2V0RGF0ZSh0b2RheS5nZXREYXRlKCkgLSA3KTtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCAyOTsgaSsrKSB7XHJcbiAgICAgICAgdmFyIGNhbERheSA9IHt9O1xyXG4gICAgICAgIGNhbERheS5kYXkgPSBuZXcgRGF0ZSh0b2RheSk7XHJcbiAgICAgICAgY2FsRGF5LmRheS5zZXREYXRlKHRvZGF5LmdldERhdGUoKSArIGkpO1xyXG4gICAgICAgIHZhciBkYXlFdmVudHMgPSByZXBvc3RFdmVudC5maWx0ZXIoZnVuY3Rpb24oZXYpIHtcclxuICAgICAgICAgIHJldHVybiAobmV3IERhdGUoZXYudHJhY2tJbmZvLmRheSkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gY2FsRGF5LmRheS50b0xvY2FsZURhdGVTdHJpbmcoKSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgICAgdmFyIGV2ZW50QXJyYXkgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IDI0OyBqKyspIHtcclxuICAgICAgICAgIGV2ZW50QXJyYXlbal0gPSB7XHJcbiAgICAgICAgICAgIHR5cGU6IFwiZW1wdHlcIlxyXG4gICAgICAgICAgfTtcclxuICAgICAgICB9XHJcbiAgICAgICAgZGF5RXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXYpIHtcclxuICAgICAgICAgIGlmIChldmVudEFycmF5W25ldyBEYXRlKGV2LnRyYWNrSW5mby5kYXkpLmdldEhvdXJzKCldLnR5cGUgPT0gJ2VtcHR5Jykge1xyXG4gICAgICAgICAgICBldi50eXBlID0gJ3RyYWNrJztcclxuICAgICAgICAgICAgZXZlbnRBcnJheVtuZXcgRGF0ZShldi50cmFja0luZm8uZGF5KS5nZXRIb3VycygpXSA9IGV2O1xyXG4gICAgICAgICAgfSBlbHNlIGlmIChldmVudEFycmF5W25ldyBEYXRlKGV2LnRyYWNrSW5mby5kYXkpLmdldEhvdXJzKCldLnR5cGUgPT0gJ3RyYWNrJykge1xyXG4gICAgICAgICAgICB2YXIgZXZlbnQgPSB7XHJcbiAgICAgICAgICAgICAgdHlwZTogJ211bHRpcGxlJyxcclxuICAgICAgICAgICAgICBldmVudHM6IFtdXHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZXZlbnQuZXZlbnRzLnB1c2goZXZlbnRBcnJheVtuZXcgRGF0ZShldi50cmFja0luZm8uZGF5KS5nZXRIb3VycygpXSlcclxuICAgICAgICAgICAgZXZlbnQuZXZlbnRzLnB1c2goZXYpO1xyXG4gICAgICAgICAgICBldmVudEFycmF5W25ldyBEYXRlKGV2LnRyYWNrSW5mby5kYXkpLmdldEhvdXJzKCldID0gZXZlbnQ7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGV2ZW50QXJyYXlbbmV3IERhdGUoZXYudHJhY2tJbmZvLmRheSkuZ2V0SG91cnMoKV0udHlwZSA9PSAnbXVsdGlwbGUnKSB7XHJcbiAgICAgICAgICAgIGV2ZW50QXJyYXlbbmV3IERhdGUoZXYudHJhY2tJbmZvLmRheSkuZ2V0SG91cnMoKV0uZXZlbnRzLnB1c2goZXYpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGNhbERheS5ldmVudHMgPSBldmVudEFycmF5O1xyXG4gICAgICAgIGNhbGVuZGFyLnB1c2goY2FsRGF5KTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gY2FsZW5kYXI7XHJcbiAgICB9O1xyXG5cclxuICAgICRzY29wZS5nZXRFdmVudFRleHQgPSBmdW5jdGlvbihyZXBvc3RFdmVudCkge1xyXG4gICAgICBpZiAocmVwb3N0RXZlbnQudHlwZSA9PSAndHJhY2snKSByZXR1cm4gcmVwb3N0RXZlbnQudXNlckluZm8udXNlcm5hbWVcclxuICAgICAgZWxzZSBpZiAocmVwb3N0RXZlbnQudHlwZSA9PSAnbXVsdGlwbGUnKSByZXR1cm4gJ011bHRpcGxlIFJlcG9zdHMnXHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLmJhY2tFdmVudCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAkc2NvcGUubWFrZUV2ZW50ID0gbnVsbDtcclxuICAgICAgJHNjb3BlLnRyYWNrVHlwZSA9IFwiXCI7XHJcbiAgICAgICRzY29wZS50cmFja0FydGlzdElEID0gMDtcclxuICAgICAgJHNjb3BlLnNob3dPdmVybGF5ID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgJHNjb3BlLmNhbGVuZGFyID0gJHNjb3BlLmZpbGxEYXRlQXJyYXlzKHJlcG9zdEV2ZW50KTtcclxuICAgICRzY29wZS5jbGlja2VkU2xvdCA9IGZ1bmN0aW9uKGRheSwgaG91ciwgZGF0YSkge1xyXG4gICAgICBpZiAoZGF0YS50eXBlID09ICdtdWx0aXBsZScpIHtcclxuICAgICAgICB2YXIgYnV0dG9ucyA9IFtdO1xyXG4gICAgICAgIGRhdGEuZXZlbnRzLmZvckVhY2goZnVuY3Rpb24oZXYpIHtcclxuICAgICAgICAgIHZhciBidXR0b24gPSB7XHJcbiAgICAgICAgICAgIGNhcHRpb246IGV2LnVzZXJJbmZvLnVzZXJuYW1lLFxyXG4gICAgICAgICAgICBjYWxsYmFjazogZnVuY3Rpb24oKSB7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLm9wZW5Qb3B1cChkYXksIGhvdXIsIGV2KTtcclxuICAgICAgICAgICAgICBpZiAoISRzY29wZS4kJHBoYXNlKSAkc2NvcGUuJGFwcGx5KCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGJ1dHRvbnMucHVzaChidXR0b24pO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgJC5aZWJyYV9EaWFsb2coJ1doaWNoIHNsb3QgZG8geW91IHdhbnQgdG8gdmlldz8nLCB7XHJcbiAgICAgICAgICAndHlwZSc6ICdxdWVzdGlvbicsXHJcbiAgICAgICAgICAnYnV0dG9ucyc6IGJ1dHRvbnNcclxuICAgICAgICB9KTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAkc2NvcGUub3BlblBvcHVwKGRheSwgaG91ciwgZGF0YSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICAkc2NvcGUub3BlblBvcHVwID0gZnVuY3Rpb24oZGF5LCBob3VyLCBkYXRhKSB7XHJcbiAgICAgIGlmIChkYXRhLnRyYWNrSW5mbykge1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQgPSB7fTtcclxuICAgICAgICAkc2NvcGUucG9wdXAgPSB0cnVlO1xyXG4gICAgICAgIHZhciBtYWtlRGF5ID0gbmV3IERhdGUoZGF5KTtcclxuICAgICAgICBtYWtlRGF5LnNldEhvdXJzKGhvdXIpO1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQuZGF5ID0gbmV3IERhdGUobWFrZURheSk7XHJcbiAgICAgICAgJHNjb3BlLm1ha2VFdmVudC51cmwgPSBkYXRhLnRyYWNrSW5mby50cmFja1VSTDtcclxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQgPSBkYXRhLnRyYWNrSW5mby50cmFja0lEO1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQuY29tbWVudCA9IGRhdGEudHJhY2tJbmZvLmNvbW1lbnQ7XHJcbiAgICAgICAgdmFyIGRpZmYgPSAobmV3IERhdGUoZGF0YS50cmFja0luZm8udW5yZXBvc3REYXRlKS5nZXRUaW1lKCkgLSBuZXcgRGF0ZShkYXRhLnRyYWNrSW5mby5kYXkpLmdldFRpbWUoKSkgLyAzNjAwMDAwO1xyXG4gICAgICAgIGlmIChkaWZmID4gMCkgJHNjb3BlLm1ha2VFdmVudC51bnJlcG9zdEhvdXJzID0gZGlmZjtcclxuICAgICAgICAkc2NvcGUudW5yZXBvc3RFbmFibGUgPSBkaWZmID4gMDtcclxuICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnRpbWVHYXAgPSBkYXRhLnRyYWNrSW5mby50aW1lR2FwO1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQudXNlcm5hbWUgPSBkYXRhLnVzZXJJbmZvLnVzZXJuYW1lO1xyXG4gICAgICAgICRzY29wZS5tYWtlRXZlbnQuZm9sbG93ZXJzID0gZGF0YS51c2VySW5mby5mb2xsb3dlcnM7XHJcbiAgICAgICAgaWYgKGRhdGEudHJhY2tJbmZvLmxpa2UpICRzY29wZS5saWtlU3JjID0gJ2Fzc2V0cy9pbWFnZXMvbGlrZVRydWUuc3ZnJztcclxuICAgICAgICBlbHNlICRzY29wZS5saWtlU3JjID0gJ2Fzc2V0cy9pbWFnZXMvbGlrZS5zdmcnO1xyXG4gICAgICAgIGlmIChkYXRhLnRyYWNrSW5mby5jb21tZW50KSAkc2NvcGUuY29tbWVudFNyYyA9ICdhc3NldHMvaW1hZ2VzL2NvbW1lbnQuc3ZnJztcclxuICAgICAgICBlbHNlICRzY29wZS5jb21tZW50U3JjID0gJ2Fzc2V0cy9pbWFnZXMvbm9Db21tZW50LnN2Zyc7XHJcbiAgICAgICAgdmFyIGQgPSBuZXcgRGF0ZShkYXkpLmdldERheSgpO1xyXG4gICAgICAgIHZhciBjaGFubmVscyA9IGRhdGEudHJhY2tJbmZvLm90aGVyQ2hhbm5lbHM7XHJcbiAgICAgICAgJHNjb3BlLmRpc3BsYXlDaGFubmVscyA9IFtdO1xyXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcmVwb3N0RXZlbnQubGVuZ3RoOyBpKyspIHtcclxuICAgICAgICAgIGlmIChjaGFubmVscy5pbmRleE9mKHJlcG9zdEV2ZW50W2ldLnVzZXJJbmZvLmlkKSA+IC0xKSB7XHJcbiAgICAgICAgICAgICRzY29wZS5kaXNwbGF5Q2hhbm5lbHMucHVzaChyZXBvc3RFdmVudFtpXS51c2VySW5mby51c2VybmFtZSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICAkc2NvcGUuc2hvd092ZXJsYXkgPSB0cnVlO1xyXG4gICAgICAgIHZhciBjYWxEYXkgPSB7fTtcclxuICAgICAgICB2YXIgY2FsZW5kYXJEYXkgPSAkc2NvcGUuY2FsZW5kYXIuZmluZChmdW5jdGlvbihjYWxEKSB7XHJcbiAgICAgICAgICByZXR1cm4gY2FsRC5kYXkudG9Mb2NhbGVEYXRlU3RyaW5nKCkgPT0gZGF5LnRvTG9jYWxlRGF0ZVN0cmluZygpO1xyXG4gICAgICAgIH0pXHJcbiAgICAgICAgJHNjb3BlLnBsYXllclVSTCA9ICRzY2UudHJ1c3RBc1Jlc291cmNlVXJsKFwiaHR0cHM6Ly93LnNvdW5kY2xvdWQuY29tL3BsYXllci8/dXJsPWh0dHA6Ly9hcGkuc291bmRjbG91ZC5jb20vdHJhY2tzL1wiICsgJHNjb3BlLm1ha2VFdmVudC50cmFja0lEICsgXCImYXV0b19wbGF5PWZhbHNlJnNob3dfYXJ0d29yaz1mYWxzZVwiKVxyXG4gICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BvcHVwUGxheWVyJykuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICAkc2NvcGUuZGV0YWlsVmlldyA9IGZ1bmN0aW9uKGRhdGEpIHtcclxuICAgICAgJHNjb3BlLml0ZW12aWV3ID0gXCJkZXRhaWxMaXN0Vmlld1wiO1xyXG4gICAgICAkc2NvcGUubWFrZUV2ZW50ID0ge307XHJcbiAgICAgIHZhciBkYXkgPSBuZXcgRGF0ZShkYXRhLnRyYWNrSW5mby5kYXkpO1xyXG4gICAgICAkc2NvcGUubWFrZUV2ZW50Ll9pZCA9IGRhdGEudHJhY2tJbmZvLl9pZDtcclxuICAgICAgJHNjb3BlLm1ha2VFdmVudC5kYXkgPSBuZXcgRGF0ZShkYXRhLnRyYWNrSW5mby5kYXkpO1xyXG4gICAgICAkc2NvcGUubWFrZUV2ZW50LnVybCA9IGRhdGEudHJhY2tJbmZvLnRyYWNrVVJMO1xyXG4gICAgICAkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQgPSBkYXRhLnRyYWNrSW5mby50cmFja0lEO1xyXG4gICAgICAkc2NvcGUubWFrZUV2ZW50LmNvbW1lbnQgPSBkYXRhLnRyYWNrSW5mby5jb21tZW50O1xyXG4gICAgICAkc2NvcGUubWFrZUV2ZW50LmZvbGxvd2VycyA9IGRhdGEudXNlckluZm8uZm9sbG93ZXJzO1xyXG4gICAgICAkc2NvcGUubWFrZUV2ZW50LnVzZXJuYW1lID0gZGF0YS51c2VySW5mby51c2VybmFtZTtcclxuICAgICAgaWYgKGRhdGEudHJhY2tJbmZvLmxpa2UpICRzY29wZS5saWtlU3JjID0gJ2Fzc2V0cy9pbWFnZXMvbGlrZVRydWUuc3ZnJztcclxuICAgICAgZWxzZSAkc2NvcGUubGlrZVNyYyA9ICdhc3NldHMvaW1hZ2VzL2xpa2Uuc3ZnJztcclxuICAgICAgaWYgKGRhdGEudHJhY2tJbmZvLmNvbW1lbnQpICRzY29wZS5jb21tZW50U3JjID0gJ2Fzc2V0cy9pbWFnZXMvY29tbWVudC5zdmcnO1xyXG4gICAgICBlbHNlICRzY29wZS5jb21tZW50U3JjID0gJ2Fzc2V0cy9pbWFnZXMvbm9Db21tZW50LnN2Zyc7XHJcbiAgICAgICRzY29wZS5tYWtlRXZlbnQuYXJ0aXN0ID0gZGF0YS51c2VySW5mbztcclxuICAgICAgdmFyIHJlcG9zdERhdGUgPSBuZXcgRGF0ZShkYXRhLnRyYWNrSW5mby5kYXkpO1xyXG4gICAgICAkc2NvcGUubWFrZUV2ZW50LnVucmVwb3N0SG91cnMgPSBkYXRhLnRyYWNrSW5mby51bnJlcG9zdEhvdXJzO1xyXG4gICAgICAkc2NvcGUucGxheWVyVVJMID0gJHNjZS50cnVzdEFzUmVzb3VyY2VVcmwoXCJodHRwczovL3cuc291bmRjbG91ZC5jb20vcGxheWVyLz91cmw9aHR0cDovL2FwaS5zb3VuZGNsb3VkLmNvbS90cmFja3MvXCIgKyAkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQgKyBcIiZhdXRvX3BsYXk9ZmFsc2Umc2hvd19hcnR3b3JrPWZhbHNlXCIpXHJcbiAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdzY1BsYXllcicpLnN0eWxlLnZpc2liaWxpdHkgPSBcInZpc2libGVcIjtcclxuICAgIH1cclxuICAgICRzY29wZS5iYWNrVG9MaXN0RXZlbnQgPSBmdW5jdGlvbigpIHtcclxuICAgICAgJHNjb3BlLml0ZW12aWV3ID0gXCJsaXN0XCI7XHJcbiAgICB9XHJcbiAgfVxyXG59KTsiXSwiZmlsZSI6InJlcG9zdEV2ZW50cy9jb250cm9sbGVycy9yZXBvc3RFdmVudENvbnRyb2xsZXIuanMifQ==
