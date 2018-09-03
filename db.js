var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
var url = 'mongodb://localhost/speedLogger';
mongoose.connect(url);
var db = mongoose.connection;
var SettingsSchema = mongoose.Schema({
    interval: {
        type: Number,
        min: 5
    },
    status: String
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

exports.db = db;
exports.Settings = Settings;
exports.Logs = Logs;
