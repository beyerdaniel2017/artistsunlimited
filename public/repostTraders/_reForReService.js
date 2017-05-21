'use strict';
app.factory('socket', function ($rootScope) {
  var socket;
  return {
    on: function (eventName, callback) {      
      socket.on(eventName, function () {  
        var args = arguments;
        $rootScope.$apply(function () {
          callback.apply(socket, args);
        });
      });
    },
    emit: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    },
    getMessage: function (eventName, data, callback) {
      socket.emit(eventName, data, function () {
        var args = arguments;
        $rootScope.$apply(function () {
          if (callback) {
            callback.apply(socket, args);
          }
        });
      })
    },
    connect: function(){
      socket = io.connect();
    },
    disconnect: function () {
      socket.disconnect();
    }
  };
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIiwic291cmNlcyI6WyJyZXBvc3RUcmFkZXJzL19yZUZvclJlU2VydmljZS5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIndXNlIHN0cmljdCc7XHJcbmFwcC5mYWN0b3J5KCdzb2NrZXQnLCBmdW5jdGlvbiAoJHJvb3RTY29wZSkge1xyXG4gIHZhciBzb2NrZXQ7XHJcbiAgcmV0dXJuIHtcclxuICAgIG9uOiBmdW5jdGlvbiAoZXZlbnROYW1lLCBjYWxsYmFjaykgeyAgICAgIFxyXG4gICAgICBzb2NrZXQub24oZXZlbnROYW1lLCBmdW5jdGlvbiAoKSB7ICBcclxuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcclxuICAgICAgICAkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBjYWxsYmFjay5hcHBseShzb2NrZXQsIGFyZ3MpO1xyXG4gICAgICAgIH0pO1xyXG4gICAgICB9KTtcclxuICAgIH0sXHJcbiAgICBlbWl0OiBmdW5jdGlvbiAoZXZlbnROYW1lLCBkYXRhLCBjYWxsYmFjaykge1xyXG4gICAgICBzb2NrZXQuZW1pdChldmVudE5hbWUsIGRhdGEsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcclxuICAgICAgICAkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkoc29ja2V0LCBhcmdzKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBnZXRNZXNzYWdlOiBmdW5jdGlvbiAoZXZlbnROYW1lLCBkYXRhLCBjYWxsYmFjaykge1xyXG4gICAgICBzb2NrZXQuZW1pdChldmVudE5hbWUsIGRhdGEsIGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcclxuICAgICAgICAkcm9vdFNjb3BlLiRhcHBseShmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgICBpZiAoY2FsbGJhY2spIHtcclxuICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkoc29ja2V0LCBhcmdzKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9KTtcclxuICAgICAgfSlcclxuICAgIH0sXHJcbiAgICBjb25uZWN0OiBmdW5jdGlvbigpe1xyXG4gICAgICBzb2NrZXQgPSBpby5jb25uZWN0KCk7XHJcbiAgICB9LFxyXG4gICAgZGlzY29ubmVjdDogZnVuY3Rpb24gKCkge1xyXG4gICAgICBzb2NrZXQuZGlzY29ubmVjdCgpO1xyXG4gICAgfVxyXG4gIH07XHJcbn0pOyJdLCJmaWxlIjoicmVwb3N0VHJhZGVycy9fcmVGb3JSZVNlcnZpY2UuanMifQ==
