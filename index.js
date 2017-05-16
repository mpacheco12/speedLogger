var express = require('express');
var app = express(); //use express js module
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var speedTest = require("speedtest-net");
var moment = require("moment");
//add handlebars view engine
var handlebars = require('express3-handlebars')
    .create({
        defaultLayout: 'main'
    }); //default handlebars layout page

app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({
    extended: true
}));
var url = 'mongodb://localhost/speedLogger';
mongoose.connect(url);
var db = mongoose.connection;
var SettingsSchema = mongoose.Schema({
    interval: {
        type: Number,
        min: 5
    }
});
var Settings = mongoose.model('Settings', SettingsSchema);
var LogsSchema = mongoose.Schema({
    date: {
        type: Date,
        default: Date.now
    },
    ping: Number,
    download: Number,
    upload: Number,
});
var Logs = mongoose.model('Logs', LogsSchema);
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {

    Settings.count({}, function(err, count) {
        if (count == 0) {
            var defSettings = new Settings({
                interval: 5
            });
            defSettings.save(function(err) {
                if (err) return handleError(err);
                console.log('Default settings created.');
            });
        }
    });
    getSpeed();
});

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars'); //sets express view engine to handlebars
app.use(express.static(__dirname + '/public'));

app.set('port', process.env.PORT || 3000); //sets port 3000

app.get('/', function(req, res) {
    Logs.find({}).limit(20).sort({
        date: -1
    }).exec(function(err, docs) {
        res.render('home', {
            logs: docs,
            helpers: {
                prettyDate: function(date) {
                    date = moment(date).format("DD/MM/YY hh:mm:ss a");
                    return date;
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
            clearTimeout(timeout);
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
    console.log('Express Server Started on http://localhost:3000');
});


var timeout = null;

function getSpeed() {
    Settings.findOne({}, function(err, doc) {
        var intervalTime = doc.interval * 1000 * 60;
        console.log('setting interval every ' + intervalTime + ' seconds.');
        speed = speedTest({
            maxTime: 20000
        });
        speed.on('data', function(data) {
            var log = new Logs({
                ping: data.server.ping,
                download: data.speeds.download,
                upload: data.speeds.upload
            });
            log.save(function(err) {
                if (err) return handleError(err);
                console.log('Log saved.');
            });
        });
        speed.on('error', function(err) {
            console.log(err);
        });
        timeout = setTimeout(getSpeed, intervalTime);
    });
}
