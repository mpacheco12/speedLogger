var http = require('http');

console.log('start request')
var options = {
    host: "requestb.in",
    path: "/1inujgm1",
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: "un body"
};
var req = http.request(options, function(res) {
    var responseString = "";

    res.on("data", function(data) {
        responseString += data;
    });
    res.on("end", function() {
        console.log(responseString);
    });
});

var reqBody = 'key';
console.log(reqBody);
req.write(reqBody);
req.end();
