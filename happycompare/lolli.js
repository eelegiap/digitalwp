function drawWith(csvfile, where) {

// set the dimensions and margins of the graph
var margin = { top: 10, right: 30, bottom: 40, left: 100 },
    width = 400 - margin.left - margin.right,
    height = 300 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select(where)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv(csvfile, function (data) {

    var maxVal = 0
    data.forEach(function(datum) {
        console.log(typeof(maxVal))
        if (+datum.value > maxVal) {
            maxVal = +datum.value
        }
    })

    var color = d3.scaleOrdinal()
        .domain(["Andrei", "Pierre", "Natasha"])
        .range(["#ef476f", "#1b9aaa", "#ffc43d"])

    // Add X axis
    var x = d3.scaleLinear()
        .domain([0, maxVal + 10])
        .range([0, width]);
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(-45)")
        .style("text-anchor", "end");

    // Y axis
    var y = d3.scaleBand()
        .range([0, height])
        .domain(data.map(function (d) { return d.character; }))
        .padding(1);
    svg.append("g")
        .call(d3.axisLeft(y))


    // Lines
    svg.selectAll("myline")
        .data(data)
        .enter()
        .append("line")
        .attr("x1", function (d) { return x(d.value); })
        .attr("x2", x(0))
        .attr("y1", function (d) { return y(d.character); })
        .attr("y2", function (d) { return y(d.character); })
        .attr("stroke", "grey")

    // Circles
    svg.selectAll("mycircle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(d.value); })
        .attr("cy", function (d) { return y(d.character); })
        .attr("r", "4")
        .style("fill", d => color(d.character))
        .attr("stroke", "black")
})

}