
function update(emotion) {
    // Parse the Data
    d3.csv('data.csv', function (data) {
        $('#graph').empty()

        // set the dimensions and margins of the graph
        var margin = { top: 10, right: 100, bottom: 30, left: 50 },
            width = 500 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;

        // append the svg object to the body of the page
        var svg = d3.select("#graph")
            .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform",
                "translate(" + margin.left + "," + margin.top + ")");

        if (emotion != '') {
            data.forEach(function (d) {
                for (const key of Object.keys(d)) {
                    if (!['group', emotion].includes(key)) {
                        d[key] = +0
                    }
                }
            })
        }
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

        // get max val for Y axis?
        var maxVal = 0
        data.forEach(function (d) {
            var total = +d.s + +d.r + +d.v
            if (total > maxVal) {
                maxVal = total
            }
        })

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, maxVal + 20])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // color palette = one color per subgroup
        var color = d3.scaleOrdinal()
            .domain(subgroups)
            .range(['#ef476f', '#1b9aaa', '#ffc43d'])

        // draw legend
        var lookup = {
            's' : 'счастье',
            'r' : 'радость',
            'v' : 'восторг'
        }

        subgroups.forEach(function(e, i) {
            svg.append("circle").attr('class', e).attr("cx", width).attr("cy", 50 + i*25).attr("r", 8).style("fill", color(e))
        svg.append("text").attr('class', e).attr("x", width + 20).attr("y", 50 + i*25).text(lookup[e]).style("font-size", "15px").attr("alignment-baseline", "middle")
        })

        if (emotion != '') {
            d3.selectAll('.'+emotion).attr('font-weight','bold')
            document.getElementById("reset").disabled = false
            d3.select('#reset').style('color','black')
        } else {
            document.getElementById("reset").disabled = true
            d3.select('#reset').style('color','gray')
        }

        d3.selectAll('circle')
            .on('mouseover', function () {
                d3.select(this).attr('r', 10)
            })
            .on('mouseout', function () {
                d3.select(this).attr('r', 8)
            })
            .on('click', function () {
                var emotion = d3.select(this).attr('class')
                update(emotion)
            })
        
        d3.select('#reset').on('click',function() { update('') })

        //stack the data? --> stack per subgroup
        var stackedData = d3.stack()
            .keys(subgroups)
            (data)

        // Show the bars
        var bars = svg.append("g")
            .selectAll("g")
            // Enter in the stack data = loop key per key = group per group
            .data(stackedData)
            .enter()
            .append("g")
            .attr("fill", function (d) { return color(d.key); })
            .selectAll("rect")
            // enter a second time = loop subgroup per subgroup to add all rectangles
            .data(function (d) { return d; })
            .enter().append("rect")
            .attr("x", function (d) { return x(d.data.group); })
            .attr("y", function (d) { return y(d[1]); })
            .attr("height", function (d) { return y(d[0]) - y(d[1]); })
            .attr("width", x.bandwidth())
    })
}

update('')