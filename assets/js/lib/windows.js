IS3.windows = {
    config: {
        transition_duration: 400,
        window_number: 1
    },
    init: function() {
        // place bring back buttons according to browser size
        $(window).resize(function () {
            $('#app-bring-back-window-buttons').css({
                top: $(this).height() - 40
            })
        }).resize();


        $('body').on('click', '.app-dismiss-window', function () {
            $(this).closest('.window').fadeOut(IS3.windows.config.transition_duration, function () {
                $(this).remove();
                IS3.windows.refresh();
            });
        }).on('click', '.app-minimize-window', function () {
            IS3.windows.minimize($(this).closest('.window'));
        }).on('click', '.app-maximize-window', function() {
            IS3.windows.maximize($(this).closest('.window'));
        }).on('click', '#app-bring-back-window-buttons button', function () {
            // bring window back
            var window_number = $(this).data('window-number'),
                window = $('#app-minimized-windows').find('.window[data-window-number="' + window_number + '"]');

            // reattach window
            IS3.windows.add(window);

            // remove button
            $(this).fadeOut(function() { $(this).remove() });
        });
    },
    create: function () {
        var container = $('#app-window-template').clone()
            .removeAttr('id')
            .attr('data-window-number', IS3.windows.config.window_number);
        var node = $('.content', container).get(0);

        $('input[name="title"]', container).val("#" + IS3.windows.config.window_number + " "
        + $('#app-factors option:selected').html());

        IS3.windows.config.window_number++;

        // update window height
        $(window).resize(function () {
            $(container).css('height', $(window).height());
            //$(container).css('width', $(window).parent().width());
        }).resize();

        switch ($('#app-visualisations').val()) {
            case "map":
                IS3.visualisations.buildMap(node);
                break;
            case "line":
                IS3.visualisations.drawLineGraph(node);
        }

        IS3.windows.add(container);
    },
    add: function(window) {
        var container = $('#app-window-container');

        if ($('.window', container).length >= 2)
            IS3.windows.minimize($('.window:first', container));
        container.append(window);

        this.refresh();
        window.fadeIn();
    },


    refresh: function() {
        var container = $('#app-window-container');

        if ($('.window', container).length >= 2) {
            $('.window', container).css('width', '50%');
        } else {
            $('.window', container).css('width', '100%');
        }
    },

    maximize: function(window) {
        $('#app-window-container .window').each(function () {
            if (this != window.get(0)) {
                IS3.windows.minimize(this);
            }
        });
        this.refresh();
    },
    minimize: function (window) {
        $(window).fadeOut(IS3.windows.config.transition_duration, function () {
            var button = $('<button class="btn btn-default"></button>')
                .html($('.title input', this).val())
                .data('window-number', $(this).data('window-number'));

            $('#app-minimized-windows').append(this);
            $('#app-bring-back-window-buttons').append(button);
            IS3.windows.refresh();
        });
    }
};