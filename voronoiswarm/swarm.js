var svg = d3.select("svg"),
    margin = { top: 40, right: 40, bottom: 40, left: 40 },
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom;

var formatValue = d3.format(",d");

var x = d3.scaleLinear()
    .rangeRound([0, width]);

var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("mondaydata.csv", type, function (error, data) {
    if (error) throw error;

    x.domain(d3.extent(data, function (d) { return d.value; }));

    var simulation = d3.forceSimulation(data)
        .force("x", d3.forceX(function (d) { return x(d.value); }).strength(5))
        .force("y", d3.forceY(height / 2))
        .force("collide", d3.forceCollide(7))
        .stop();

    for (var i = 0; i < 120; ++i) simulation.tick();

    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).ticks(20, ".0s"));

    var cell = g.append("g")
        .attr("class", "cells")
        .selectAll("g").data(d3.voronoi()
            .extent([[-margin.left, -margin.top], [width + margin.right, height + margin.top]])
            .x(function (d) { return d.x; })
            .y(function (d) { return d.y; })
            .polygons(data)).enter().append("g")
            .on('mouseover', function(d) {
                console.log('hello world,', d)
                d3.select(this).select('circle').transition().style('fill','red')
            })

    cell.append("circle")
        .attr("r", 6)
        .attr("cx", function (d) { return d.data.x; })
        .attr("cy", function (d) { return d.data.y; })

    cell.append("path")
        .attr("d", function (d) { return "M" + d.join("L") + "Z"; });

    cell.append("title")
        .text(function (d) { return d.data.id + "\n" + formatValue(d.data.value); });

    // cell.on('mouseover', function(d) {
    //     console.log(d.data.id)
    // })

});

function type(d) {
    if (!d.value) return;
    d.value = +d.value;
    return d;
}