function getRandomColor() {
    var letters = '0123456789ABCDEF'.split('');
    var color = '#';
    for (var i = 0; i < 6; i++ ) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}

$(document).ready(function ($) {
    // init select picket
    $('.app-selectpicker').selectpicker();

    // sidebar toggle
    $("#menu-toggle").click(function(e) {
        e.preventDefault();
        $("#wrapper").toggleClass("toggled");
    });

    // draw map
    var container = '#map';
    $(container).css('height', $(document).height());

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
        svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
    }

    var minZoomRatio = 0.5,
        maxZoomRatio = 2,
        zoomListener = d3.behavior.zoom().scaleExtent([minZoomRatio, maxZoomRatio]).on("zoom", zoom);

    var svg = d3.select(container).append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoomListener)
        .append("g")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(0,0)");

    d3.json("data/all_councils_topo.json", function (error, data) {
        var councils = topojson.feature(data, data.objects["layer1"]);

        $.each(councils.features, function() {
            var council = {
                type: 'FeatureCollection',
                features: [this]
            };

            svg.append("path")
                .datum(council)
                .attr("id", "council_area")
                .style('fill', getRandomColor())
                .attr("d", path);
        });
    });
});
