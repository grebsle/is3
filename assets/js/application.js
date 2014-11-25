$(document).ready(function () {
    var container = document,
        width = $(container).width(),
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

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .call(zoomListener)
        .append("g")
        .attr("width", width)
        .attr("height", height)
        .attr("transform", "translate(0,0)");

    d3.json("data/all_councils_topo.json", function (error, councilArea) {
        svg.append("path")
            .datum(topojson.feature(councilArea, councilArea.objects["layer1"]))
            .attr("id", "council_area")
            .attr("d", path);
    });
});
