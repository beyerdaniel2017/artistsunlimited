var request = require("request");
for (var i = 2; i < process.argv.length; i++) {
  var id = process.argv[i];
  console.log(id);
  request.post("http://localhost:1337/api/submissions/rescheduleRepost", {
      body: {
        id: id
      }
    },
    function(err, res, body) {
      console.log(res);
    });
}