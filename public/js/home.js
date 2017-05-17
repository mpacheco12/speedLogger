$(function() {


    google.charts.load('current', {
        'packages': ['corechart']
    });
    google.charts.setOnLoadCallback(drawChart);



});

function drawChart() {
    var data = {};
    if ($('.data').val()) {
        data = JSON.parse($('.data').val());
    }
    data.reverse();
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
        animation: {
            ease: 'in',
            startup: true,
            duration: 500
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
