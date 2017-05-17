$(function() {
    var interval = $('.interval').val();
    $('#intervalSelect').val(interval);
    $('.save').on('click', function(e) {
        var btn = $(e.currentTarget);
        btn.button('loading');
        var interval = parseInt($('#intervalSelect').val(), 10);
        var data = {
            "interval": interval
        };
        $.ajax({
            type: 'POST',
            url: '/ajax/saveSettings',
            data: JSON.stringify(data),
            contentType: 'application/json',
            success: function(data) {
                if (!data.error) {
                    btn.button('reset');
                    $('#success').fadeIn();
                    setTimeout(function() {
                        $('#success').fadeOut();
                    }, 1500);
                }
            }
        });
    });
});
