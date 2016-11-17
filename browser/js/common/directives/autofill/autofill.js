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

      $scope.addSong = function() {
        if ($scope.user.queue.indexOf($scope.newQueueID) != -1) return;
        $scope.user.queue.push($scope.newQueueID);
        $scope.saveUser();
        $scope.newQueueSong = undefined;
        $scope.trackListObj = "";
        $scope.newQueue = undefined;
        $scope.loadQueueSongs();
      }

      $scope.changeQueueSong = function() {
        if ($scope.newQueueSong != "") {
          $scope.processing = true;
          $http.post('/api/soundcloud/resolve', {
              url: $scope.newQueueSong
            })
            .then(function(res) {
              $scope.processing = false;
              var track = res.data;
              $scope.newQueue = track;
              $scope.newQueueID = track.id;
            })
            .then(null, function(err) {
              $.Zebra_Dialog("We are not allowed to access tracks by this artist with the Soundcloud API. We apologize for the inconvenience, and we are working with Soundcloud to resolve this issue.");
              $scope.processing = false;
            });
        }
      }

      $scope.moveUp = function(index) {
        if (index == 0) return;
        var s = $scope.user.queue[index];
        $scope.user.queue[index] = $scope.user.queue[index - 1];
        $scope.user.queue[index - 1] = s;
        $scope.saveUser();
        $scope.loadQueueSongs();
      }

      $scope.moveDown = function(index) {
        if (index == $scope.user.queue.length - 1) return;
        var s = $scope.user.queue[index];
        $scope.user.queue[index] = $scope.user.queue[index + 1];
        $scope.user.queue[index + 1] = s;
        $scope.saveUser();
        $scope.loadQueueSongs();
      }

      /*sort start*/
      var tmpList = [];
      $scope.sortingLog = [];
      $scope.sortableOptions = {
        update: function(e, ui) {
          //$scope.autoFillTracks = [];
          var logEntry = tmpList.map(function(i) {
            return i.id;
          });
          $scope.user.queue = [];
          $scope.sortingLog.push('Update: ' + logEntry);
          $scope.user.queue = logEntry;
          $scope.saveUser();
        },
        stop: function(e, ui) {
          // this callback has the changed model
          var logEntry = tmpList.map(function(i) {
            return i.id;
          });
          $scope.user.queue = [];
          $scope.sortingLog.push('Stop: ' + logEntry);
          $scope.user.queue = logEntry;
          $scope.saveUser();
        }
      };
      /*sort end*/
      $scope.loadQueueSongs = function(queue) {
        $scope.autoFillTracks = [];
        var ind = 0;
        var autofillWidget = SC.Widget('autofillPlayer');

        function getNext() {
          if (ind < $scope.user.queue.length) {
            $scope.showAutofillPlayer = true;
            autofillWidget.load("http://api.soundcloud.com/tracks/" + $scope.user.queue[ind], {
              auto_play: false,
              show_artwork: false,
              callback: function() {
                autofillWidget.getCurrentSound(function(track) {
                  $scope.autoFillTracks.push(track);
                  tmpList = $scope.autoFillTracks;
                  $scope.list = tmpList;
                  ind++;
                  getNext();
                });
              }
            });
          } else {
            var loaded = $scope.showAutofilPlayer;
            $scope.showAutofillPlayer = false;
            if (loaded) $scope.$apply();
          }
        }
        getNext();
      }

      if ($scope.user && $scope.user.queue) {
        $scope.loadQueueSongs();
      }

      $scope.choseAutoFillTrack = function(track) {
        $scope.searchString = track.title;
        $scope.newQueueID = track.id;
        $scope.addSong();
        $scope.showPlayer = true;
      }

      $scope.afcount = 0;
      $scope.getAutoFillTracks = function() {
        function waitForAutofill() {
          $scope.processing = true;
          setTimeout(function() {
            if ($scope.autoFillTracks.length > 0) {
              $scope.processing = false;
              $scope.getAutoFillTracks();
            } else {
              waitForAutofill();
            }
          }, 500);
        }
        if ($scope.user.queue.length > 0) {
          if ($scope.autoFillTracks.length == 0) {
            waitForAutofill();
            return;
          }
          var track = JSON.parse(JSON.stringify($scope.autoFillTracks[$scope.afcount]));
          if ($scope.showOverlay) $scope.choseTrack1(track);
          else $scope.choseTrack(track);
          $scope.afcount = ($scope.afcount + 1) % $scope.autoFillTracks.length;
        } else {
          $scope.showOverlay = false;
          $.Zebra_Dialog('You do not have any tracks by other artists in your auto fill list', {
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