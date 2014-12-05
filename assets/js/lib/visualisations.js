IS3.visualisations = {
    types: {
        map: "Map",
        line: "Step Chart",
        bar: "Bar Chart",
        pie: "Pie Chart"
    },
    init: function () {
        $.each(this.types, function (key, value) {
            $('#app-visualisations').append('<option value="' + key + '">' + value + '</option>')
        });
    },

    drawPieChart: function (container) {
        var margin = 40;
        var w = 400;
        var h = 400;
        var r = h / 2;
        var color = d3.scale.category20c();

        var data = IS3.data.getChartData();

        var svg = this.appendSvg(container).append("svg:svg")
            .data([data]).attr("width", w + margin).attr("height", h + margin)
            .append("svg:g").attr("transform", "translate(" + (r + margin) + "," + (r + margin) + ")");
        var pie = d3.layout.pie().value(function (d) {
            return d.x;
        });

        var arc = d3.svg.arc().outerRadius(r);

        var arcs = svg.selectAll("g.slice").data(pie).enter().append("svg:g").attr("class", "slice");
        arcs.append("svg:path")
            .attr("fill", function (d, i) {
                return color(i);
            })
            .attr("gss", function (d) {
                IS3.visualisations.addHover(d3.select(this));
                return d.data.gss;
            })
            .attr("d", function (d) {
                return arc(d);
            });
    },

    appendSvg: function(container) {
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

        return svg = svg.append("g")
            .attr("width", width)
            .attr("height", height)
            .attr("transform", "translate(0,0)");
    },

    drawBarChart: function (container) {
        var barData = IS3.data.getChartData();

        var WIDTH = 1000,
            HEIGHT = 500,
            MARGINS = {
                top: 20,
                right: 20,
                bottom: 20,
                left: 50
            },
            xRange = d3.scale.ordinal().rangeRoundBands([MARGINS.left, WIDTH - MARGINS.right], 0.1).domain(barData.map(function (d) {
                return d.x;
            })),

            yRange = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([0, d3.max(barData, function (d) {
                return d.y;
            })]),

            xAxis = d3.svg.axis()
                .scale(xRange)
                .tickSize(5)
                .tickSubdivide(true),

            yAxis = d3.svg.axis()
                .scale(yRange)
                .tickSize(5)
                .orient("left")
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

        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("x", width + WIDTH / 2 + MARGINS.left)
            .attr("y", height + HEIGHT + MARGINS.top)
            .text("Factor Rating %");

        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", width + MARGINS.left)
            .attr("y", height + MARGINS.top / 2)
            .text("Votes %");

        svg.selectAll('rect')
            .data(barData)
            .enter()
            .append('rect')
            .attr('gss', function (d) {
                IS3.visualisations.addHover(d3.select(this));
                return d.gss;
            })
            .attr('x', function (d) { // sets the x position of the bar
                return xRange(d.x);
            })
            .attr('y', function (d) { // sets the y position of the bar
                return yRange(d.y);
            })
            .attr('width', xRange.rangeBand()) // sets the width of bar
            .attr('height', function (d) {      // sets the height of bar
                return ((HEIGHT - MARGINS.bottom) - yRange(d.y));
            })
            .attr('fill', 'grey');   // fills the bar with grey color

    },
    drawLineChart: function (container) {
        var lineData = IS3.data.getChartData();

        WIDTH = 1000,
            HEIGHT = 500,
            MARGINS = {
                top: 20,
                right: 20,
                bottom: 20,
                left: 50
            },
            xRange = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]).domain([d3.min(lineData, function (d) {
                return d.x;
            }), d3.max(lineData, function (d) {
                return d.x;
            })]),
            yRange = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]).domain([d3.min(lineData, function (d) {
                return d.y - 3;
            }), d3.max(lineData, function (d) {
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

        svg.append("text")
            .attr("class", "y label")
            .attr("text-anchor", "end")
            .attr("x", width + WIDTH / 2 + MARGINS.left)
            .attr("y", height + HEIGHT + MARGINS.top)
            .text("Factor Rating %");

        svg.append("text")
            .attr("class", "x label")
            .attr("text-anchor", "end")
            .attr("x", width + MARGINS.left)
            .attr("y", height + MARGINS.top / 2)
            .text("Votes %");

        var lineFunc = d3.svg.line()
            .x(function (d) {
                return xRange(d.x);
            })
            .y(function (d) {
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
                    .attr("gss", function (area) {
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
            var el = $(this).data('hover-element');
            if (el.length)
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
