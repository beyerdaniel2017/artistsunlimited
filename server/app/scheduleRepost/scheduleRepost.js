var mongoose = require('mongoose');
var RepostEvent = mongoose.model('RepostEvent');
var User = mongoose.model('User');
var denyUnrepostOverlap = require("./denyUnrepostOverlap.js")
var daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];


module.exports = function(eventDetails, minDate) {
  minDate = new Date(minDate);
  if (minDate < new Date()) minDate = new Date();
  return new Promise(function(fulfill, reject) {
    RepostEvent.find({
        userID: eventDetails.userID,
        day: {
          $gt: new Date()
        }
      })
      .then(function(allEvents) {
        console.log(eventDetails);
        allEvents.forEach(function(event) {
          event.day = new Date(event.day);
        });
        User.findOne({
            'soundcloud.id': eventDetails.userID
          })
          .then(function(user) {
            user.blockRelease = new Date(user.blockRelease);
            var startDate = user.blockRelease > minDate ? user.blockRelease : minDate;
            var dayInd = 1;
            var hourInd = 0;

            function findNext() {
              console.log('findNext');
              var day = daysOfWeek[(startDate.getDay() + dayInd) % 7];
              if (user.availableSlots[day].length == 0) {
                dayInd++;
                hourInd = 0;
                findNext();
                return;
              }
              var hour = user.availableSlots[day][hourInd];
              var desiredDay = new Date(startDate);
              desiredDay.setTime(desiredDay.getTime() + dayInd * 24 * 60 * 60 * 1000);
              desiredDay.setHours(hour);
              var event = allEvents.find(function(eve) {
                return eve.day.getHours() == desiredDay.getHours() && desiredDay.toLocaleDateString() == eve.day.toLocaleDateString();
              });
              if (!event) {
                eventDetails.day = desiredDay;
                console.log('creating event')
                console.log(eventDetails);
                if ((new Date(eventDetails.unrepostDate)).getTime() > 1000000000) eventDetails.unrepostDate = new Date(eventDetails.day.getTime() + 24 * 3600000)
                else eventDetails.unrepostDate = new Date(0);
                denyUnrepostOverlap(eventDetails)
                  .then(function(ok) {
                    console.log('ok');
                    console.log(eventDetails);
                    var newEvent = new RepostEvent(eventDetails);
                    return newEvent.save()
                  })
                  .then(function(newEvent) {
                    newEvent.day = new Date(newEvent.day);
                    fulfill(newEvent);
                  }).then(null, function(err) {
                    if (err.message == 'overlap') {
                      hourInd = (hourInd + 1) % user.availableSlots[day].length;
                      if (hourInd == 0) dayInd++;
                      findNext();
                    } else {
                      reject(err);
                    }
                  })
              } else {
                hourInd = (hourInd + 1) % user.availableSlots[day].length;
                if (hourInd == 0) dayInd++;
                findNext();
              }
            }
            findNext();
          }).then(null, reject);
      }).then(null, reject);
  })
}