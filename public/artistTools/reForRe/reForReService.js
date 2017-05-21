'use strict';
app.factory('socket', function($rootScope) {
  var socket;
  return {
    on: function(eventName, callback) {
      socket.on(eventName, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          callback.apply(socket, args);
        });
      });
    },
    emit: function(eventName, data, callback) {
      socket.emit(eventName, data, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    },
    getMessage: function(eventName, data, callback) {
      socket.emit(eventName, data, function() {
        var args = arguments;
        $rootScope.$apply(function() {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    },
    connect: function() {
      socket = io.connect();
    },
    disconnect: function() {
      socket.disconnect();
    }
  };
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJhcnRpc3RUb29scy9yZUZvclJlL3JlRm9yUmVTZXJ2aWNlLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcclxuYXBwLmZhY3RvcnkoJ3NvY2tldCcsIGZ1bmN0aW9uKCRyb290U2NvcGUpIHtcclxuICB2YXIgc29ja2V0O1xyXG4gIHJldHVybiB7XHJcbiAgICBvbjogZnVuY3Rpb24oZXZlbnROYW1lLCBjYWxsYmFjaykge1xyXG4gICAgICBzb2NrZXQub24oZXZlbnROYW1lLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcclxuICAgICAgICAkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGNhbGxiYWNrLmFwcGx5KHNvY2tldCwgYXJncyk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH0pO1xyXG4gICAgfSxcclxuICAgIGVtaXQ6IGZ1bmN0aW9uKGV2ZW50TmFtZSwgZGF0YSwgY2FsbGJhY2spIHtcclxuICAgICAgc29ja2V0LmVtaXQoZXZlbnROYW1lLCBkYXRhLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcclxuICAgICAgICAkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBjYWxsYmFjay5hcHBseShzb2NrZXQsIGFyZ3MpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIGdldE1lc3NhZ2U6IGZ1bmN0aW9uKGV2ZW50TmFtZSwgZGF0YSwgY2FsbGJhY2spIHtcclxuICAgICAgc29ja2V0LmVtaXQoZXZlbnROYW1lLCBkYXRhLCBmdW5jdGlvbigpIHtcclxuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcclxuICAgICAgICAkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbigpIHtcclxuICAgICAgICAgIGlmIChjYWxsYmFjaykge1xyXG4gICAgICAgICAgICBjYWxsYmFjay5hcHBseShzb2NrZXQsIGFyZ3MpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KVxyXG4gICAgfSxcclxuICAgIGNvbm5lY3Q6IGZ1bmN0aW9uKCkge1xyXG4gICAgICBzb2NrZXQgPSBpby5jb25uZWN0KCk7XHJcbiAgICB9LFxyXG4gICAgZGlzY29ubmVjdDogZnVuY3Rpb24oKSB7XHJcbiAgICAgIHNvY2tldC5kaXNjb25uZWN0KCk7XHJcbiAgICB9XHJcbiAgfTtcclxufSk7Il0sImZpbGUiOiJhcnRpc3RUb29scy9yZUZvclJlL3JlRm9yUmVTZXJ2aWNlLmpzIn0=
