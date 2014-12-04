IS3.visualisations = {
    config: {
        transition_duration: 400,
        window_number: 1
    },
    types: {
        map: "Map"
    },
    init: function () {
        $.each(this.types, function (key, value) {
            $('#app-visualisations').append('<option value="' + key + '">' + value + '</option>')
        });

        $('body').on('click', '.app-dismiss-window', function () {
            // window dismiss event
            $(this).closest('.window').fadeOut(IS3.visualisations.config.transition_duration, function () {
                $(this).remove();
            });
        }).on('click', '.app-minimize-window', function () {
            // window minimize event
            $(this).closest('.window').fadeOut(IS3.visualisations.config.transition_duration, function () {
                var button = $('<button class="btn btn-default"></button>')
                    .html($('.title input', this).val())
                    .data('window-number', $(this).data('window-number'));

                $('#app-minimized-windows').append(this);
                $('#app-bring-back-window-buttons').append(button);
            });
        }).on('click', '#app-bring-back-window-buttons button', function () {
            // bring window back
            var window_number = $(this).data('window-number'),
                window = $('#app-minimized-windows').find('.window[data-window-number="' + window_number + '"]');

            // reattach window
            IS3.visualisations.addWindow(window);

            // remove button
            $(this).fadeOut(function() { $(this).remove() });
        });

        // place bring back buttons according to browser size
        $(window).resize(function () {
            $('#app-bring-back-window-buttons').css({
                top: $(this).height() - 40
            })
        }).resize();
    },
    addWindow: function(window) {
        $('#app-window-container').append(window);
        window.fadeIn();
    },
    add: function () {
        var container = $('#app-window-template').clone()
            .removeAttr('id')
            .attr('data-window-number', IS3.visualisations.config.window_number);
        $('input[name="title"]', container).val("Window #" + IS3.visualisations.config.window_number);

        IS3.visualisations.config.window_number++;

        switch ($('#app-visualisations').val()) {
            case "map":
                IS3.visualisations.buildMap($('.content', container).get(0));
                break;
        }

        IS3.visualisations.addWindow(container);
    },
    buildMap: function (container) {
        var data_type = $('#app-factors').val(),
            data_scale = d3.scale.linear()
                .domain([IS3.data.getDeprivationMin(data_type), IS3.data.getDeprivationMax(data_type)]);

        var width = $(container).width(),
            height = $(container).height();

        var projection = d3.geo.albers()
            .center([0.795, 57])
            .rotate([4.4, 0])
            .parallels([50, 60])
            .scale(8000)
            .translate([width / 2, height / 2]);

        var path = d3.geo.path()
            .projection(projection);

        function zoom() {
            g.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }

        var minZoomRatio = 0.5,
            maxZoomRatio = 2,
            zoomListener = d3.behavior.zoom().scaleExtent([minZoomRatio, maxZoomRatio]).on("zoom", zoom);

        var svg = d3.select(container).append("svg")
            .attr("width", width)
            .attr("height", height)
            .call(zoomListener);

        var g = svg.append("g")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(0,0)");

        $(window).resize(function () {
            var width = $("#app-window-container").width(),
                height = $(window).height();

            $(container).css('height', height);

            svg.attr("width", width)
                .attr("height", height);
        }).resize();

        d3.json("assets/data/all_councils_topo.json", function (error, data) {
            var councils = topojson.feature(data, data.objects["layer1"]);

            $.each(councils.features, function () {
                var council = {
                    type: 'FeatureCollection',
                    features: [this]
                };

                g.append("path")
                    .datum(council)
                    .attr("class", "app-council-area")
                    .style("fill", function (area) {
                        var code = area.features[0].properties.gss;

                        return IS3.visualisations.colors.getColorForPercentage(data_scale(IS3.data.getDeprivationPercentage(data_type, code)));
                    }).attr("d", path);


            });
        });
    },
    colors: {
        percentColors: [
            {pct: 0.0, color: {r: 46, g: 109, b: 164}},
            {pct: 1.0, color: {r: 255, g: 255, b: 255}}
        ],

        getColorForPercentage: function (pct) {
            for (var i = 1; i < this.percentColors.length - 1; i++) {
                if (pct < this.percentColors[i].pct) {
                    break;
                }
            }
            var lower = this.percentColors[i - 1];
            var upper = this.percentColors[i];
            var range = upper.pct - lower.pct;
            var rangePct = (pct - lower.pct) / range;
            var pctLower = 1 - rangePct;
            var pctUpper = rangePct;
            var color = {
                r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
                g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
                b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
            };
            return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
        }
    }
};
