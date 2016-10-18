var mongoose = require('mongoose');
var RepostEvent = mongoose.model('RepostEvent');
var User = mongoose.model('User');

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
        allEvents.forEach(function(event) {
          event.day = new Date(event.day);
        });
        User.findOne({
            'soundcloud.id': eventDetails.userID
          })
          .then(function(user) {
            user.blockRelease = new Date(user.blockRelease);
            var startDate = user.blockRelease > minDate ? user.blockRelease : minDate;
            var continueSearch = true;
            var daysOfWeek = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
            var ind = 1;
            while (continueSearch) {
              var day = daysOfWeek[(startDate.getDay() + ind) % 7];
              user.availableSlots[day].forEach(function(hour) {
                var desiredDay = new Date(startDate);
                desiredDay.setTime(desiredDay.getTime() + ind * 24 * 60 * 60 * 1000);
                desiredDay.setHours(hour);
                if (continueSearch) {
                  var event = allEvents.find(function(eve) {
                    return eve.day.getHours() == desiredDay.getHours() && desiredDay.toLocaleDateString() == eve.day.toLocaleDateString();
                  });
                  if (!event) {
                    continueSearch = false;
                    eventDetails.day = desiredDay;
                    if ((new Date(eventDetails.unrepostDate)).getTime() > 1000000000) eventDetails.unrepostDate = new Date(eventDetails.day.getTime() + 24 * 3600000)
                    else eventDetails.unrepostDate = new Date(0);
                    var newEvent = new RepostEvent(eventDetails);
                    newEvent.save()
                      .then(function(newEvent) {
                        newEvent.day = new Date(newEvent.day);
                        fulfill(newEvent);
                      })
                      .then(null, reject);
                  }
                }
              });
              ind++;
            }
          }).then(null, reject);
      }).then(null, reject);
  })
}