var express = require('express');
var app = express(); //use express js module
var bodyParser = require('body-parser');
var speedTest = require("speedtest-net");
var moment = require("moment");
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var database = require("./db.js");
var Settings = database.Settings;
var Logs = database.Logs;
var db = database.db;
//add handlebars view engine
var handlebars = require('express3-handlebars')
    .create({
        defaultLayout: 'main'
    }); //default handlebars layout page

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
}));

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

    Settings.count({}, function(err, count) {
        if (count == 0) {
            var defSettings = new Settings({
                interval: 60
            });
            defSettings.save(function(err) {
                if (err) return handleError(err);
                getSpeed();
            });
        } else {
            getSpeed();
        }
    });

});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars'); //sets express view engine to handlebars
app.use(express.static(__dirname + '/public'));

app.set('port', process.env.PORT || 3000); //sets port 3000

app.get('/', function(req, res) {
    Logs.find({}).limit(40).sort({
        date: -1
    }).exec(function(err, docs) {
        res.render('home', {
            logs: docs,
            helpers: {
                prettyDate: function(date) {
                    date = moment(date).format("DD/MM/YY hh:mm:ss a");
                    return date;
                },
                json: function() {
                    return JSON.stringify(docs);
                }
            }
        });
    });
});
app.get('/settings', function(req, res) {
    Settings.findOne({}, function(err, doc) {
        res.render('settings', doc);
    });
});

app.get('/ajax/getSettings',function(req,res){
    Settings.findOne({}, function(err, doc) {
        res.send(doc);
    });
});
app.get('/ajax/testSpeed',function(req,res){
    Settings.findOne({}, function(err, doc) {
        if(doc.status!="waiting"){
            res.send('already testing');
            return;
        }
        getSpeed();
        res.send('ok');
        return;
    });
});


app.post('/ajax/saveSettings', function(req, res) {
    data = req.body;
    Settings.findOne({}, function(err, doc) {
        if (err) {
            console.log(err);
            res.send({
                error: true
            });
            return handleError(err);
        }

        doc.interval = data.interval;
        doc.save(function(err, updatedDoc) {
            if (err) {
                console.log(err);
                res.send({
                    error: true
                });
                return handleError(err);
            }
            if (timeout) {
                clearTimeout(timeout);
            }
            getSpeed();
            res.send(updatedDoc);
        });
    });
});


app.use(function(req, res) { //express catch middleware if page doesn't exist
    res.status(404); //respond with status code
    res.render('404'); //respond with 404 page
});

app.listen(app.get('port'), function() { //start express server
    console.log('Express Server Started on http://localhost:'+app.get('port'));
});

server.listen(4200);
var clients = {}
io.on('connection', function(client) {
    clients[client.id] = client;
    client.on('disconnect', function() {
        delete clients[client.id];
    });
});

function changeGlobalStatus(status){
    Settings.findOne({}, function(err, doc) {
        if (err) {
            console.log(err);
            return err;
        }
        doc.status = status;
        doc.save(function(err, updatedDoc) {
            if (err) {
                console.log(err);
                return err;
            }
            broadCast('status',status);
            return;
        });
    });
}
function broadCast(event,logData) {
    for (i in clients) {
        clients[i].emit(event, logData);
    }
}
var timeout = null;

function getSpeed() {
    changeGlobalStatus('measuring');
    return new Promise(resolve => {
        Settings.findOne({}, function(err, doc) {
            var intervalTime = doc.interval * 1000 * 60;
            speed = speedTest({
                maxTime: 20000
            });
            speed.on('data', function(data) {
                var logData = {
                    ping: data.server.ping,
                    download: data.speeds.download,
                    upload: data.speeds.upload
                };
                var log = new Logs(logData);
                logData.date = new Date();
                broadCast('newMeasurre',logData);
                log.save(function(err) {
                    if (err) return handleError(err);
                });
                changeGlobalStatus('waiting');         
            });
            speed.on('error', function(err) {
                console.log(err);
            });
            timeout = setTimeout(getSpeed, intervalTime);
            resolve('ok');
        });
     });
}
