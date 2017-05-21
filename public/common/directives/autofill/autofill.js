app.directive('autofill', function($http) {
  return {
    templateUrl: 'js/common/directives/autofill/autofill.html',
    restrict: 'E',
    scope: false,
    controller: ['$scope', function autofillController($scope) {
      $scope.autoFillTracks = [];

      $scope.removeQueueSong = function(song) {
        var index = $scope.user.queue.indexOf(song.id);
        $scope.user.queue.splice(index, 1);
        $scope.saveUser()
        $scope.loadQueueSongs();
      }

      $scope.removeAll = function() {
        $scope.user.queue = [];
        $scope.saveUser()
        $scope.loadQueueSongs();
      }

      $scope.addSong = function() {
        if ($scope.user.queue.indexOf($scope.newQueueID) != -1) return;
        $scope.user.queue.push($scope.newQueueID);
        $scope.saveUser();
        $scope.loadQueueSongs();
      }

      /*sort start*/
      $scope.sortableOptions = {
        stop: function(e, ui) {
          var logEntry = $scope.autoFillTracks.map(function(i) {
            return i.id;
          });
          $scope.user.queue = logEntry;
          $scope.saveUser();
        }
      };
      /*sort end*/
      $scope.loadQueueSongs = function(queue) {
        if ($scope.disallowQueueLoad) return;
        $scope.disallowQueueLoad = true;
        setTimeout(function() {
          $scope.disallowQueueLoad = false;
        }, 1000);
        var autofillWidget = SC.Widget('autofillPlayer');
        $scope.autoFillTracks = [];
        $scope.user.queue.forEach(function(trackID, index) {
          SC.get('/tracks/' + trackID)
            .then(function(data) {
              $scope.autoFillTracks[index] = data;
              if (!$scope.$$phase) $scope.$apply();
            }).then(null, function(err) {
              if (err.status == 403) {
                function loadTrack(id, ind) {
                  if (!$scope.loadingAFWidget) {
                    $scope.loadingAFWidget = true;
                    $scope.showAutofillPlayer = true;
                    autofillWidget.load("http://api.soundcloud.com/tracks/" + id, {
                      auto_play: false,
                      show_artwork: false,
                      callback: function() {
                        autofillWidget.getCurrentSound(function(track) {
                          $scope.loadingAFWidget = false;
                          $scope.showAutofillPlayer = false;
                          $scope.autoFillTracks[ind] = track;
                          if (!$scope.$$phase) $scope.$apply();
                        });
                      }
                    });
                  } else {
                    setTimeout(function() {
                      loadTrack(id, ind);
                    }, 300)
                  }
                }
                loadTrack(trackID, index);
              } else if (err.status == 404) {
                $scope.user.queue.splice(index, 1);
                $scope.saveUser()
                $scope.loadQueueSongs();
              }
            }).then(null, console.log);
        });
      }
      if ($scope.user && $scope.user.queue && !$scope.alreadyLoaded) {
        $scope.loadQueueSongs();
        $scope.alreadyLoaded == true;
      }
      $scope.choseAutoFillTrack = function(track) {
        $scope.newQueueID = track.id;
        $scope.addSong();
      }

      $scope.choseAutoFillPlaylist = function(playlist) {
        playlist.tracks.forEach(function(track) {
          if ($scope.user.queue.indexOf(track.id) == -1) $scope.user.queue.push(track.id);
        })
        $scope.saveUser();
        $scope.loadQueueSongs();
      }

      $scope.afcount = 0;
      $scope.getAutoFillTracks = function() {
        function waitForAutofill() {
          $scope.processing = true;
          setTimeout(function() {
            if (!$scope.showAutofillPlayer) {
              $scope.processing = false;
              if (!$scope.$$phase) $scope.$apply();
              $scope.getAutoFillTracks();
            } else {
              waitForAutofill();
            }
          }, 500);
        }
        if ($scope.user.queue.length > 0) {
          if ($scope.autoFillTracks.includes(undefined) || $scope.autoFillTracks.length < $scope.user.queue.length) {
            waitForAutofill();
            return;
          }
          var track = JSON.parse(JSON.stringify($scope.autoFillTracks[$scope.afcount]));
          $scope.afcount = ($scope.afcount + 1) % $scope.autoFillTracks.length;
          $scope.makeEvent.trackID = track.id;
          if (window.location.href.includes('scheduler') && $scope.findUnrepostOverlap() && track.user.id != $scope.user.id) {
            if ($scope.afcount == 0) {
              $scope.showPlayer = false;
              $scope.makeEvent.trackID = undefined;
              $.Zebra_Dialog("No more autofill songs can be scheduled here. You are not allowed to repost a track within 24 hours of an unrepost of that track or within 48 hours of a repost of the same track.");
            } else {
              $scope.makeEvent.trackID = undefined;
              $scope.getAutoFillTracks();
            }
            return;
          } else {
            if ($scope.showOverlay) $scope.choseTrack1(track);
            else $scope.choseTrack(track);
          }
        } else {
          $scope.showOverlay = false;
          $.Zebra_Dialog('You do not have any tracks by other artists in your autofill list.', {
            'type': 'question',
            'buttons': [{
              caption: 'Cancel',
              callback: function() {}
            }, {
              caption: 'Autofill',
              callback: function() {
                $scope.tabSelected = true;
                $('.nav-tabs a[href="#managereposts"]').tab('show');
              }
            }]
          });
        }
      }
    }]
  }
});

function stackTrace() {
  var err = new Error();
  return err.stack;
}
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJjb21tb24vZGlyZWN0aXZlcy9hdXRvZmlsbC9hdXRvZmlsbC5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyJhcHAuZGlyZWN0aXZlKCdhdXRvZmlsbCcsIGZ1bmN0aW9uKCRodHRwKSB7XHJcbiAgcmV0dXJuIHtcclxuICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvYXV0b2ZpbGwvYXV0b2ZpbGwuaHRtbCcsXHJcbiAgICByZXN0cmljdDogJ0UnLFxyXG4gICAgc2NvcGU6IGZhbHNlLFxyXG4gICAgY29udHJvbGxlcjogWyckc2NvcGUnLCBmdW5jdGlvbiBhdXRvZmlsbENvbnRyb2xsZXIoJHNjb3BlKSB7XHJcbiAgICAgICRzY29wZS5hdXRvRmlsbFRyYWNrcyA9IFtdO1xyXG5cclxuICAgICAgJHNjb3BlLnJlbW92ZVF1ZXVlU29uZyA9IGZ1bmN0aW9uKHNvbmcpIHtcclxuICAgICAgICB2YXIgaW5kZXggPSAkc2NvcGUudXNlci5xdWV1ZS5pbmRleE9mKHNvbmcuaWQpO1xyXG4gICAgICAgICRzY29wZS51c2VyLnF1ZXVlLnNwbGljZShpbmRleCwgMSk7XHJcbiAgICAgICAgJHNjb3BlLnNhdmVVc2VyKClcclxuICAgICAgICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLnJlbW92ZUFsbCA9IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICRzY29wZS51c2VyLnF1ZXVlID0gW107XHJcbiAgICAgICAgJHNjb3BlLnNhdmVVc2VyKClcclxuICAgICAgICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmFkZFNvbmcgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBpZiAoJHNjb3BlLnVzZXIucXVldWUuaW5kZXhPZigkc2NvcGUubmV3UXVldWVJRCkgIT0gLTEpIHJldHVybjtcclxuICAgICAgICAkc2NvcGUudXNlci5xdWV1ZS5wdXNoKCRzY29wZS5uZXdRdWV1ZUlEKTtcclxuICAgICAgICAkc2NvcGUuc2F2ZVVzZXIoKTtcclxuICAgICAgICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgLypzb3J0IHN0YXJ0Ki9cclxuICAgICAgJHNjb3BlLnNvcnRhYmxlT3B0aW9ucyA9IHtcclxuICAgICAgICBzdG9wOiBmdW5jdGlvbihlLCB1aSkge1xyXG4gICAgICAgICAgdmFyIGxvZ0VudHJ5ID0gJHNjb3BlLmF1dG9GaWxsVHJhY2tzLm1hcChmdW5jdGlvbihpKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBpLmlkO1xyXG4gICAgICAgICAgfSk7XHJcbiAgICAgICAgICAkc2NvcGUudXNlci5xdWV1ZSA9IGxvZ0VudHJ5O1xyXG4gICAgICAgICAgJHNjb3BlLnNhdmVVc2VyKCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9O1xyXG4gICAgICAvKnNvcnQgZW5kKi9cclxuICAgICAgJHNjb3BlLmxvYWRRdWV1ZVNvbmdzID0gZnVuY3Rpb24ocXVldWUpIHtcclxuICAgICAgICBpZiAoJHNjb3BlLmRpc2FsbG93UXVldWVMb2FkKSByZXR1cm47XHJcbiAgICAgICAgJHNjb3BlLmRpc2FsbG93UXVldWVMb2FkID0gdHJ1ZTtcclxuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgJHNjb3BlLmRpc2FsbG93UXVldWVMb2FkID0gZmFsc2U7XHJcbiAgICAgICAgfSwgMTAwMCk7XHJcbiAgICAgICAgdmFyIGF1dG9maWxsV2lkZ2V0ID0gU0MuV2lkZ2V0KCdhdXRvZmlsbFBsYXllcicpO1xyXG4gICAgICAgICRzY29wZS5hdXRvRmlsbFRyYWNrcyA9IFtdO1xyXG4gICAgICAgICRzY29wZS51c2VyLnF1ZXVlLmZvckVhY2goZnVuY3Rpb24odHJhY2tJRCwgaW5kZXgpIHtcclxuICAgICAgICAgIFNDLmdldCgnL3RyYWNrcy8nICsgdHJhY2tJRClcclxuICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24oZGF0YSkge1xyXG4gICAgICAgICAgICAgICRzY29wZS5hdXRvRmlsbFRyYWNrc1tpbmRleF0gPSBkYXRhO1xyXG4gICAgICAgICAgICAgIGlmICghJHNjb3BlLiQkcGhhc2UpICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgfSkudGhlbihudWxsLCBmdW5jdGlvbihlcnIpIHtcclxuICAgICAgICAgICAgICBpZiAoZXJyLnN0YXR1cyA9PSA0MDMpIHtcclxuICAgICAgICAgICAgICAgIGZ1bmN0aW9uIGxvYWRUcmFjayhpZCwgaW5kKSB7XHJcbiAgICAgICAgICAgICAgICAgIGlmICghJHNjb3BlLmxvYWRpbmdBRldpZGdldCkge1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5sb2FkaW5nQUZXaWRnZXQgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93QXV0b2ZpbGxQbGF5ZXIgPSB0cnVlO1xyXG4gICAgICAgICAgICAgICAgICAgIGF1dG9maWxsV2lkZ2V0LmxvYWQoXCJodHRwOi8vYXBpLnNvdW5kY2xvdWQuY29tL3RyYWNrcy9cIiArIGlkLCB7XHJcbiAgICAgICAgICAgICAgICAgICAgICBhdXRvX3BsYXk6IGZhbHNlLFxyXG4gICAgICAgICAgICAgICAgICAgICAgc2hvd19hcnR3b3JrOiBmYWxzZSxcclxuICAgICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrOiBmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYXV0b2ZpbGxXaWRnZXQuZ2V0Q3VycmVudFNvdW5kKGZ1bmN0aW9uKHRyYWNrKSB7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJHNjb3BlLmxvYWRpbmdBRldpZGdldCA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICRzY29wZS5zaG93QXV0b2ZpbGxQbGF5ZXIgPSBmYWxzZTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAkc2NvcGUuYXV0b0ZpbGxUcmFja3NbaW5kXSA9IHRyYWNrO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghJHNjb3BlLiQkcGhhc2UpICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcclxuICAgICAgICAgICAgICAgICAgICAgIGxvYWRUcmFjayhpZCwgaW5kKTtcclxuICAgICAgICAgICAgICAgICAgICB9LCAzMDApXHJcbiAgICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICAgIGxvYWRUcmFjayh0cmFja0lELCBpbmRleCk7XHJcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChlcnIuc3RhdHVzID09IDQwNCkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnVzZXIucXVldWUuc3BsaWNlKGluZGV4LCAxKTtcclxuICAgICAgICAgICAgICAgICRzY29wZS5zYXZlVXNlcigpXHJcbiAgICAgICAgICAgICAgICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MoKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIH0pLnRoZW4obnVsbCwgY29uc29sZS5sb2cpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9XHJcbiAgICAgIGlmICgkc2NvcGUudXNlciAmJiAkc2NvcGUudXNlci5xdWV1ZSAmJiAhJHNjb3BlLmFscmVhZHlMb2FkZWQpIHtcclxuICAgICAgICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MoKTtcclxuICAgICAgICAkc2NvcGUuYWxyZWFkeUxvYWRlZCA9PSB0cnVlO1xyXG4gICAgICB9XHJcbiAgICAgICRzY29wZS5jaG9zZUF1dG9GaWxsVHJhY2sgPSBmdW5jdGlvbih0cmFjaykge1xyXG4gICAgICAgICRzY29wZS5uZXdRdWV1ZUlEID0gdHJhY2suaWQ7XHJcbiAgICAgICAgJHNjb3BlLmFkZFNvbmcoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmNob3NlQXV0b0ZpbGxQbGF5bGlzdCA9IGZ1bmN0aW9uKHBsYXlsaXN0KSB7XHJcbiAgICAgICAgcGxheWxpc3QudHJhY2tzLmZvckVhY2goZnVuY3Rpb24odHJhY2spIHtcclxuICAgICAgICAgIGlmICgkc2NvcGUudXNlci5xdWV1ZS5pbmRleE9mKHRyYWNrLmlkKSA9PSAtMSkgJHNjb3BlLnVzZXIucXVldWUucHVzaCh0cmFjay5pZCk7XHJcbiAgICAgICAgfSlcclxuICAgICAgICAkc2NvcGUuc2F2ZVVzZXIoKTtcclxuICAgICAgICAkc2NvcGUubG9hZFF1ZXVlU29uZ3MoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgJHNjb3BlLmFmY291bnQgPSAwO1xyXG4gICAgICAkc2NvcGUuZ2V0QXV0b0ZpbGxUcmFja3MgPSBmdW5jdGlvbigpIHtcclxuICAgICAgICBmdW5jdGlvbiB3YWl0Rm9yQXV0b2ZpbGwoKSB7XHJcbiAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IHRydWU7XHJcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICBpZiAoISRzY29wZS5zaG93QXV0b2ZpbGxQbGF5ZXIpIHtcclxuICAgICAgICAgICAgICAkc2NvcGUucHJvY2Vzc2luZyA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIGlmICghJHNjb3BlLiQkcGhhc2UpICRzY29wZS4kYXBwbHkoKTtcclxuICAgICAgICAgICAgICAkc2NvcGUuZ2V0QXV0b0ZpbGxUcmFja3MoKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICB3YWl0Rm9yQXV0b2ZpbGwoKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSwgNTAwKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCRzY29wZS51c2VyLnF1ZXVlLmxlbmd0aCA+IDApIHtcclxuICAgICAgICAgIGlmICgkc2NvcGUuYXV0b0ZpbGxUcmFja3MuaW5jbHVkZXModW5kZWZpbmVkKSB8fCAkc2NvcGUuYXV0b0ZpbGxUcmFja3MubGVuZ3RoIDwgJHNjb3BlLnVzZXIucXVldWUubGVuZ3RoKSB7XHJcbiAgICAgICAgICAgIHdhaXRGb3JBdXRvZmlsbCgpO1xyXG4gICAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB2YXIgdHJhY2sgPSBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KCRzY29wZS5hdXRvRmlsbFRyYWNrc1skc2NvcGUuYWZjb3VudF0pKTtcclxuICAgICAgICAgICRzY29wZS5hZmNvdW50ID0gKCRzY29wZS5hZmNvdW50ICsgMSkgJSAkc2NvcGUuYXV0b0ZpbGxUcmFja3MubGVuZ3RoO1xyXG4gICAgICAgICAgJHNjb3BlLm1ha2VFdmVudC50cmFja0lEID0gdHJhY2suaWQ7XHJcbiAgICAgICAgICBpZiAod2luZG93LmxvY2F0aW9uLmhyZWYuaW5jbHVkZXMoJ3NjaGVkdWxlcicpICYmICRzY29wZS5maW5kVW5yZXBvc3RPdmVybGFwKCkgJiYgdHJhY2sudXNlci5pZCAhPSAkc2NvcGUudXNlci5pZCkge1xyXG4gICAgICAgICAgICBpZiAoJHNjb3BlLmFmY291bnQgPT0gMCkge1xyXG4gICAgICAgICAgICAgICRzY29wZS5zaG93UGxheWVyID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLm1ha2VFdmVudC50cmFja0lEID0gdW5kZWZpbmVkO1xyXG4gICAgICAgICAgICAgICQuWmVicmFfRGlhbG9nKFwiTm8gbW9yZSBhdXRvZmlsbCBzb25ncyBjYW4gYmUgc2NoZWR1bGVkIGhlcmUuIFlvdSBhcmUgbm90IGFsbG93ZWQgdG8gcmVwb3N0IGEgdHJhY2sgd2l0aGluIDI0IGhvdXJzIG9mIGFuIHVucmVwb3N0IG9mIHRoYXQgdHJhY2sgb3Igd2l0aGluIDQ4IGhvdXJzIG9mIGEgcmVwb3N0IG9mIHRoZSBzYW1lIHRyYWNrLlwiKTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAkc2NvcGUubWFrZUV2ZW50LnRyYWNrSUQgPSB1bmRlZmluZWQ7XHJcbiAgICAgICAgICAgICAgJHNjb3BlLmdldEF1dG9GaWxsVHJhY2tzKCk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgaWYgKCRzY29wZS5zaG93T3ZlcmxheSkgJHNjb3BlLmNob3NlVHJhY2sxKHRyYWNrKTtcclxuICAgICAgICAgICAgZWxzZSAkc2NvcGUuY2hvc2VUcmFjayh0cmFjayk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICRzY29wZS5zaG93T3ZlcmxheSA9IGZhbHNlO1xyXG4gICAgICAgICAgJC5aZWJyYV9EaWFsb2coJ1lvdSBkbyBub3QgaGF2ZSBhbnkgdHJhY2tzIGJ5IG90aGVyIGFydGlzdHMgaW4geW91ciBhdXRvZmlsbCBsaXN0LicsIHtcclxuICAgICAgICAgICAgJ3R5cGUnOiAncXVlc3Rpb24nLFxyXG4gICAgICAgICAgICAnYnV0dG9ucyc6IFt7XHJcbiAgICAgICAgICAgICAgY2FwdGlvbjogJ0NhbmNlbCcsXHJcbiAgICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKCkge31cclxuICAgICAgICAgICAgfSwge1xyXG4gICAgICAgICAgICAgIGNhcHRpb246ICdBdXRvZmlsbCcsXHJcbiAgICAgICAgICAgICAgY2FsbGJhY2s6IGZ1bmN0aW9uKCkge1xyXG4gICAgICAgICAgICAgICAgJHNjb3BlLnRhYlNlbGVjdGVkID0gdHJ1ZTtcclxuICAgICAgICAgICAgICAgICQoJy5uYXYtdGFicyBhW2hyZWY9XCIjbWFuYWdlcmVwb3N0c1wiXScpLnRhYignc2hvdycpO1xyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfV1cclxuICAgICAgICAgIH0pO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfV1cclxuICB9XHJcbn0pO1xyXG5cclxuZnVuY3Rpb24gc3RhY2tUcmFjZSgpIHtcclxuICB2YXIgZXJyID0gbmV3IEVycm9yKCk7XHJcbiAgcmV0dXJuIGVyci5zdGFjaztcclxufSJdLCJmaWxlIjoiY29tbW9uL2RpcmVjdGl2ZXMvYXV0b2ZpbGwvYXV0b2ZpbGwuanMifQ==
