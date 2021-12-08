updateArea('Andrei')

function updateArea(char) {
    //Read the data
    d3.csv(char + "-emotions.csv", function (data) {
        $('#stackedline').empty()

        // set the dimensions and margins of the graph
        var margin = { top: 10, right: 80, bottom: 100, left: 60 },
            width = $(window).width()-100 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg = d3.select("#stackedline")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        svg.append("text").attr("x", width-15).attr("y", 25).text('Select one:').style("font-size", "15px").attr("alignment-baseline", "middle")

        var characters = ['Andrei', 'Pierre', 'Natasha']
        characters.forEach(function (char, i) {
            svg.append("circle").attr('class', char + ' arealegend').attr("cx", width).attr("cy", 50 + i * 25).attr("r", 7).style("fill", 'white').style('stroke', 'black').style('stroke-width', 1)
            svg.append("text").attr("x", width + 20).attr("y", 50 + i * 25).text(char).style("font-size", "15px").attr("alignment-baseline", "middle")
        })

        d3.selectAll('.arealegend').each(function() {
            var thischar = d3.select(this).attr('class').split(' ')[0]
            if (thischar == char) {
                d3.selectAll('#thischar').text(thischar)
                d3.select(this).style('fill','black').classed('show',true)
            }
        })

        d3.selectAll('.arealegend')
        .on('mouseover', function () {
            d3.select(this).attr('r', 10)
        })
        .on('mouseout', function () {
            d3.select(this).attr('r', 8)
        })
        
        d3.selectAll('.arealegend').on('click',function() {
            var show = d3.select(this).classed('show')
            var thischar = d3.select(this).attr('class').split(' ')[0]
            if (!show) {
                d3.selectAll('#thischar').text(thischar)
                updateArea(thischar)
            }
        })

        // group the data: one array for each value of the X axis.
        var sumstat = d3.nest()
            .key(function (d) { return d.part; })
            .entries(data);

        // Stack the data: each group will be represented on top of each other
        var mygroups = ["счастье", "радость", "восторг"] // list of group names
        var mygroup = [0, 1, 2] // list of group names
        var stackedData = d3.stack()
            .keys(mygroup)
            .value(function (d, key) {
                return d.values[key].n
            })
            (sumstat)

        // Add X axis --> it is a date format
        var x = d3.scaleLinear()
            .domain([1, 17])
            .range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(0));

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, 24])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // color palette
        var color = d3.scaleOrdinal()
            .domain(mygroups)
            .range(['#ef476f', '#1b9aaa', '#ffc43d'])

        // Show the areas
        svg
            .selectAll("mylayers")
            .data(stackedData)
            .enter()
            .append("path")
            .style("fill", function (d) { return color(mygroups[d.key]) })
            .attr("d", d3.area()
                .curve(d3.curveMonotoneX)
                .x(function (d, i) { return x(d.data.key); })
                .y0(function (d) { return y(d[0]); })
                .y1(function (d) { return y(d[1]); })
            )

        // Add the line

        // stackedData.forEach(function(tdata, j) {
        //     var tdata = tdata.filter(function(item) {
        //         return item[0] !== item[1]
        //     })
        //     var eCircle = mygroups[j]

        //     svg.selectAll('dot')
        //        .data(tdata).enter().append('circle')
        //        .attr('class', function(d, i) {
        //            console.log()
        //            return 'dotx'+eCircle+i
        //        })
        //        .attr('cx',function(d) { return x(d.data.key) })
        //        .attr('cy', function(d) { return ((y(d[1]) - y(d[0]))/2 +y(d[0])) })
        //        .style('fill','black')
        //        .style('opacity',.8)
        //        .attr('r',7)
        // })

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

        volMarkers.forEach(function (p) {
            var part = p[0]; var volName = p[1];

            svg
                .append("line")
                .attr("x1", x(part))  //<<== change your code here
                .attr("y1", 0 * height)
                .attr("x2", x(part))  //<<== and here
                .attr("y2", 1.05 * height)
                .style("stroke-width", 2)
                .style("stroke", "black")
                .style('opacity', .1)
                .style("fill", "none")
            svg
                .append('text')
                .attr('text-anchor', 'middle')
                .attr('x', x(part))
                .attr('y', 1.2 * height)
                .text(volName)
        })

        partMarkers.forEach(function (p) {
            var part = p[0]; var name = p[1];

            svg
                .append("line")
                .attr("x1", x(part))  //<<== change your code here
                .attr("y1", 0 * height)
                .attr("x2", x(part))  //<<== and here
                .attr("y2", 1.05 * height)
                .style("stroke-width", 1)
                .style("stroke", "gray")
                .style('opacity', .1)
                .style("fill", "none")
            svg
                .append('text')
                .attr('text-anchor', 'middle')
                .attr('class', 'partMarker')
                .attr('x', x(part))
                .attr('y', 1.1 * height)
                .text(name)
        })
    })
}