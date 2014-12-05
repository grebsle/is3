IS3.visualisations = {
    config: {
        transition_duration: 400,
        window_number: 1
    },
    types: {
        map: "Map",
        line: "Line Graph"

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
            IS3.visualisations.minimize($(this).closest('.window'));
        }).on('click', '#app-bring-back-window-buttons button', function () {
            // bring window back
            var window_number = $(this).data('window-number'),
                window = $('#app-minimized-windows').find('.window[data-window-number="' + window_number + '"]');

            // reattach window
            IS3.visualisations.addWindow(window);

            // remove button
            $(this).fadeOut(function() { $(this).remove() });
        }).on('click', '.app-maximize-window', function() {
            IS3.visualisations.maximize($(this).closest('.window'));
        });

        // place bring back buttons according to browser size
        $(window).resize(function () {
            $('#app-bring-back-window-buttons').css({
                top: $(this).height() - 40
            })
        }).resize();
    },
    maximize: function(window) {
        $('#app-window-container .window').each(function () {
            if (this != window.get(0)) {
                IS3.visualisations.minimize(this);
            }
        });
        IS3.visualisations.refreshWindows();
    },
    minimize: function (window) {
        $(window).fadeOut(IS3.visualisations.config.transition_duration, function () {
            var button = $('<button class="btn btn-default"></button>')
                .html($('.title input', this).val())
                .data('window-number', $(this).data('window-number'));

            $('#app-minimized-windows').append(this);
            $('#app-bring-back-window-buttons').append(button);
            IS3.visualisations.refreshWindows();
        });
    },
    addWindow: function(window) {
        var container = $('#app-window-container');

        if ($('.window', container).length >= 2)
            IS3.visualisations.minimize($('.window:first', container));
            container.append(window);

        this.refreshWindows();
        window.fadeIn();
    },

    refreshWindows: function() {
        var container = $('#app-window-container');

        if ($('.window', container).length >= 2) {
            $('.window', container).css('width', '50%');
        } else {
            $('.window', container).css('width', '100%');
        }
    },

    add: function () {
        var container = $('#app-window-template').clone()
            .removeAttr('id')
            .attr('data-window-number', IS3.visualisations.config.window_number);
        var node = $('.content', container).get(0);
        $('input[name="title"]', container).val("Window #" + IS3.visualisations.config.window_number);

        IS3.visualisations.config.window_number++;

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

        IS3.visualisations.addWindow(container);
    },

    drawLineGraph: function (container) {
        var councils = IS3.data.getSelectedCouncils(),
            lineData = [],
            data_type = $('#app-factors').val();

        $.each(councils, function() {
            lineData.push({
                gss: this,
                x: parseInt(IS3.data.getDeprivationPercentage(data_type, this) * 100),
                y: parseInt(IS3.data.getReferrendumPercentage(this))
            });
        });

        lineData.sort(function(a, b) {
            return a.x - b.x;
        });

        WIDTH = 1000,
            HEIGHT = 500,
            MARGINS = {
                top: 20,
                right: 20,
                bottom: 20,
                left: 50
            },
            xRange = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([d3.min(lineData, function(d) {
                return d.x;
            }), d3.max(lineData, function(d) {
                return d.x;
            })]),
            yRange = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([d3.min(lineData, function(d) {
                return d.y;
            }), d3.max(lineData, function(d) {
                return d.y;
            })]),
            xAxis = d3.svg.axis()
                .scale(xRange)
                .tickSize(3)
                .tickSubdivide(true),
            yAxis = d3.svg.axis()
                .scale(yRange)
                .tickSize(3)
                .orient('left')
                .tickSubdivide(true);


        function zoom() {
            svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
        }

        var minZoomRatio = 0.5,
            maxZoomRatio = 2,
            zoomListener = d3.behavior.zoom().scaleExtent([minZoomRatio, maxZoomRatio]).on("zoom", zoom);

        var width = $(container).width(),
            height = $(container).height();

        var svg = d3.select(container).append("svg")
            .attr("width", width)
            .attr("height", height)
            .call(zoomListener);

        $(window).resize(function () {
            d3.select(container).select('svg').attr('height', $(window).height());
            svg.attr('height', $(window).height());
        }).resize();

        var svg = svg.append("g")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(0,0)");

        svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate(0,' + (HEIGHT - MARGINS.bottom) + ')')
            .call(xAxis);

        svg.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate(' + (MARGINS.left) + ',0)')
            .call(yAxis);

        var lineFunc = d3.svg.line()
            .x(function(d) {
                return xRange(d.x);
            })
            .y(function(d) {
                return yRange(d.y);
            })
            .interpolate('step');

        for (var i = 0; i < lineData.length - 1; i++) {
            var intermediate = {
                x: lineData[i + 1].x,
                y: lineData[i].y
            };

            var el = svg.append('path')
                .attr('class', 'line')
                .attr('gss', lineData[i].gss)
                .attr('d', lineFunc([lineData[i], intermediate]))
                .attr('stroke-width', 2)
                .attr('fill', 'none');

            IS3.visualisations.addHover(el);

            el = svg.append('path')
                .attr('class', 'line')
                .attr('gss', lineData[i].gss)
                .attr('d', lineFunc([intermediate, lineData[i + 1]]))
                .attr('stroke-width', 2)
                .attr('fill', 'none');

            IS3.visualisations.addHover(el);
        }
    },

    buildMap: function (container) {
        var data_type = $('#app-factors').val(),
            data_scale = d3.scale.linear()
                .domain([IS3.data.getDeprivationMin(data_type), IS3.data.getDeprivationMax(data_type)])
                .range([0, 1]);

        var width = $(container).width(),
            height = $(container).height();

        var projection = d3.geo.albers()
            .center([-6, 59])
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

                var el = g.append("path")
                    .datum(council)
                    .attr("class", "app-council-area")
                    .attr("gss", function(area) {
                        return area.features[0].properties.gss;
                    })
                    .style("fill", function (area) {
                        var code = $(this).attr('gss');

                        return IS3.visualisations.colors.getColorForPercentage(data_scale(IS3.data.getDeprivationPercentage(data_type, code)));
                    }).attr("d", path);

                IS3.visualisations.addHover(el);
            });
        });
    },
    addHover: function (el) {
        el.on("mouseover", function () {
            $(this).addClass('hover');

            var gss = $(this).attr('gss');
            var percentage = IS3.data.getReferrendumPercentage(gss),
                council_name = IS3.data.getCouncilName(gss),
                el = $('<button class="btn btn-primary">' + council_name + ' <span class="badge">' + percentage + '% Yes</span></button>');

            $('body').append(el);
            $(this).data('hover-element', el);

            $(document).mousemove(function (event) {
                el.css({
                    position: 'absolute',
                    top: event.pageY + 10,
                    left: event.pageX - $(el).width() / 2
                });
            });
        }).on("mouseout", function () {
            $(this).data('hover-element').fadeOut();
            $(this).removeClass('hover');
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
