var data = {};
$(function() {


    google.charts.load('current', {
        'packages': ['corechart']
    });
    google.charts.setOnLoadCallback(function() {
        if ($('.data').val()) {
            data = JSON.parse($('.data').val());
        }
        data.reverse();
        drawChart(data);
    });
    var url = document.location.hostname;
    var socket = io.connect('http://' + url + ':4200');
    socket.on('connect', function(data) {});
    socket.on('newMeasurre', function(newData) {
        data.push(newData);
        if (data.length > 40) {
            data.shift();
            $('#speedResult > tbody >tr').last().remove()
        }
        drawChart(data);
        var newRow = createRow(newData);
        $(newRow).prependTo("#speedResult > tbody");

    });

});

function createRow(newData) {
    ret = "<tr><td>" + newData['ping'] + "</td><td>" + newData['download'] +
        "</td><td>" + newData['upload'] + "</td><td>" +
        moment(newData['date']).format("DD/MM/YY hh:mm:ss a") + "</td></tr>";
    return ret;
}

function drawChart(data) {

    var plotData = [
        ['Time', 'Download Speed', 'Upload Speed', 'Av. Download Speed']
    ];

    var sum = 0;
    for (var i in data) {
        sum += parseFloat(data[i]['download']);
    }
    var avDownload = sum / data.length;
    for (var i in data) {
        var time = moment(data[i]['date']).format('DD/MM hh:mm a');
        plotData.push([time, parseFloat(data[i]['download']), parseFloat(data[i]['upload']), avDownload]);
    }
    var plotData = google.visualization.arrayToDataTable(plotData);

    var options = {
        title: '',
        curveType: 'function',
        legend: {
            position: 'top'
        },
        chartArea: {
            'width': '90%',
            'height': '70%'
        },
        series: {
            0: {
                pointSize: 3,
            },
            1: {
                pointSize: 3,
            },
            2: {
                lineWidth: 1,
                pointSize: 0,
            }
        }


    };

    var chart = new google.visualization.LineChart(document.getElementById('lineChart'));

    chart.draw(plotData, options);
}
