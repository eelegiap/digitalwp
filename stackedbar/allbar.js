

// set the dimensions and margins of the graph
var margin = { top: 50, right: 200, bottom: 30, left: 50 },
    width = 800 - margin.left - margin.right,
    height = 445 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#allbar")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

// Parse the Data
d3.csv("allhappybar.csv", function (data) {

    // List of subgroups = header of the csv files = soil condition here
    var subgroups = data.columns.slice(1)

    // List of groups = species here = value of the first column called group -> I show them on the X axis
    var groups = d3.map(data, function (d) { return (d.group) }).keys()

    // Add X axis
    var x = d3.scaleBand()
        .domain(groups)
        .range([0, width])
        .padding([0.2])
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x).tickSizeOuter(0));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([0, 60])
        .range([height, 0]);
    svg.append("g")
        .call(d3.axisLeft(y));

    // color palette = one color per subgroup
    var color = d3.scaleOrdinal()
        .domain(subgroups)
        .range(['#ef476f', '#1b9aaa', '#ffc43d'])

    //stack the data? --> stack per subgroup
    var stackedData = d3.stack()
        .keys(subgroups)
        (data)




    // ----------------
    // Create a tooltip
    // ----------------
    var tooltip = d3.select("#allbar")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip")
        .style("background-color", "white")
        .style("border", "solid")
        .style("border-width", "1px")
        .style("border-radius", "5px")
        .style("padding", "10px")

    // Three function that change the tooltip when user hover / move / leave a cell
    var mouseover = function (d, i) {

        var subgroupName = d3.select(this.parentNode).datum().key;
        var subgroupValue = +d.data[subgroupName];
        var part = i + 1
        var engPart = '?'
        partMarkers.forEach(function (p) {
            if (p[0] == part) {
                engPart = p[1]
            }
        })
        var engVol = '?'
        volMarkers.forEach(function (v, i) {
            if (volMarkers[i][0] <= part && volMarkers[i + 1][0] >= part) {
                engVol = volMarkers[i][1]
            }
            if (part == 17) {
                engVol = 'Epilogue'
            }
        })
        var timespan = `${engVol}, ${engPart}`

        tooltip
            .html("<b>Emotion:</b> <span style=color:" + color(subgroupName) + ">" + subgroupName + "</span><br>" + "<b>Count in part:</b> " + subgroupValue + '<br><b>Place</b>: ' + timespan)
            .style("opacity", 1)
    }
    var mousemove = function (d) {
        tooltip
            .style("left", (d3.mouse(this)[0] + 50) + "px") // It is important to put the +90: other wise the tooltip is exactly where the point is an it creates a weird effect
            .style("top", (d3.mouse(this)[1]) + 30 + "px")
    }
    var mouseleave = function (d) {
        tooltip
            .style("opacity", 0)
    }


    // Show the bars
    svg.append("g")
        .selectAll("g")
        // Enter in the stack data = loop key per key = group per group
        .data(stackedData)
        .enter().append("g")
        .attr("fill", function (d) { return color(d.key); })
        .attr('cursor', 'pointer')
        .selectAll("rect")
        // enter a second time = loop subgroup per subgroup to add all rectangles
        .data(function (d) { return d; })
        .enter().append("rect")
        .attr("x", function (d) { return x(d.data.group); })
        .attr("y", function (d) { return y(d[1]); })
        .attr("height", function (d) { return y(d[0]) - y(d[1]); })
        .attr("width", x.bandwidth())
        .attr("stroke", "grey")
        .attr('cursor', 'pointer')
        .on("mouseover", mouseover)
        .on("mousemove", mousemove)
        .on("mouseleave", mouseleave)


    // append volume markers
    var volMarkers = [[1, 'Volume 1'], [4, 'Volume 2'], [9, 'Volume 3'], [12, 'Volume 4'], [16, 'Epilogue'], [362, 'END']]
    var partMarkers = [
        [1, 'Part 1'],
        [2, 'Part 2'],
        [3, 'Part 3'],
        [4, 'Part 1'],
        [5, 'Part 2'],
        [6, 'Part 3'],
        [7, 'Part 4'],
        [8, 'Part 5'],
        [9, 'Part 1'],
        [10, 'Part 2'],
        [11, 'Part 3'],
        [12, 'Part 1'],
        [13, 'Part 2'],
        [14, 'Part 3'],
        [15, 'Part 4'],
        [16, 'Part 1'],
        [17, 'Part 2']
    ]
})