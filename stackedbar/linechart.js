function drawLineChart(csvFile, elt) {

    // set the dimensions and margins of the graph
    var margin = { top: 10, right: 80, bottom: 100, left: 60 },
        width = $(window).width()-100 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var svg = d3.select("#" + elt)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    //Read the data
    d3.csv(csvFile, function (data) {

        // group the data: I want to draw one line per group
        var sumstat = d3.nest() // nest function allows to group the calculation per level of a factor
            .key(function (d) { return d.char; })
            .entries(data);

        // Add X axis --> it is a date format
        var x = d3.scaleLinear()
            .domain([1, 17])
            .range([0, width]);
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(0));

        // Add Y axis
        var y = d3.scaleLinear()
            .domain([0, d3.max(data, function (d) { return +d.n; })])
            .range([height, 0]);
        svg.append("g")
            .call(d3.axisLeft(y));

        // text label for the y axis
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x", 0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("Association between happiness & character (count)")

        // color palette
        var res = sumstat.map(function (d) { return d.key }) // list of group names

        var color = d3.scaleOrdinal()
            .domain(res)
            .range(['#3d405b', '#81b29a', '#e07a5f'])

        svg.append("text").attr("x", width-15).attr("y", 25).text('Select one:').style("font-size", "15px").attr("alignment-baseline", "middle")
        
        res.forEach(function (char, i) {
            svg.append("circle").attr('class', char + ' legend').attr("cx", width).attr("cy", 50 + i * 25).attr("r", 7).style("fill", color(char)).style('stroke', color(char))
            svg.append("text").attr('class', char + ' legend').attr("x", width + 20).attr("y", 50 + i * 25).text(char).style("font-size", "15px").attr("alignment-baseline", "middle")
        })

        d3.selectAll('legend')
            .on('mouseover', function () {
                d3.select(this).attr('r', 10)
            })
            .on('mouseout', function () {
                d3.select(this).attr('r', 8)
            })

        // Draw the line
        svg.selectAll(".line")
            .data(sumstat)
            .enter()
            .append("path")
            .attr('id', d => d.key)
            .attr('class', 'show')
            .attr("fill", "none")
            .attr("stroke", function (d) { return color(d.key) })
            .attr("stroke-width", 1.5)
            .attr("d", function (d) {
                return d3.line()
                    .x(function (d) { return x(d.part); })
                    .y(function (d) { return y(+d.n); })
                    .curve(d3.curveMonotoneX)
                    (d.values)
            })

        // dots and examples
        var dots = sumstat.forEach(function(table, i) {
            svg.selectAll('dot')
            .data(table.values).enter()
            .append('circle')
            .attr('class', d => 'dot '+ 'dot'+d.char)
            // .attr('id',function(d) { return d.char })
            .attr('cx', function (d) { return x(d.part) })
            .attr('cy', function (d) { return y(+d.n) })
            .style('fill', 'black')
            .style('opacity', .7)
            .attr('r', 5)  
            .attr('cursor','pointer')
            .attr('stroke','transparent')
            .attr('stroke-width',18)
            .attr('display','none')
        })
        var showExamples = false
        // show/hide example button for linechart
        d3.select('#showexamples').on('click', function() {
            var display = d3.selectAll('.dot').attr('display')
            if (display == 'none') {
                d3.selectAll('.dot').attr('display','show')
                d3.selectAll('.legend').each(function() {
                    var char = d3.select(this).attr('class').split(' ')[0]
                    d3.select(this).style('fill', color(char))
                    d3.select('#'+char).attr('stroke-width', 1.5).attr('class', 'show')
                })
                $('.examples').show()
                d3.selectAll('.dot').style('fill','black')
                d3.select('#timespan').text('')
                d3.select('#chosenchar').text('(select dot above)')
                d3.select('#showexamples').text('Hide textual examples mapped onto the graph')
                showExamples = true
            } else {
                d3.selectAll('.dot').attr('display','none')
                $('.examples').hide()
                d3.select('#showexamples').text('Show textual examples mapped onto the graph')
                emotions.forEach(function(emo) {
                    d3.select('#'+emo+'examples').html('')
                    d3.select('#'+emo+'ct').text('')
                })
                showExamples = false
            }

        })

        // querying for examples
        var emotions = ['счастье','радость','восторг']
        d3.selectAll('.dot')
        .on('mouseover',function(d) {
            d3.select(this).attr('r',8)
        })
        .on('mouseout',function() {
            d3.select(this).attr('r',5)
        })
        // clicking a dot
        .on('click', function (d) {
            var thispart = d.part
            var char = d.char

            d3.selectAll('.dot').style('fill','black')
            d3.select(this).style('fill','red')

            d3.select('#chosenchar').text(char).style('color',color(char))

            d3.csv('examples/' + char + '.csv', function (examples) {
                var exampleObj = {
                    'счастье' : [],
                    'радость' : [],
                    'восторг' : []
                }
                examples.forEach(function(e) {
                    if (e.totalpart == thispart) {
                        exampleObj[e.concept].push(e)
                    }
                })
                // for each emotional concept
                emotions.forEach(function(emo) {
                    // display count
                    d3.select('#'+emo+'ct').text('('+exampleObj[emo].length+')')
                    // for each example, construct HTML
                    var paragraphs = []
                    if (exampleObj[emo].length == 0) {
                        paragraphs = [`No co-occurrences of ${emo} and ${char} in this part.`]
                    }
                    exampleObj[emo].forEach(function(e) {
                        
                        var engPart = '?'
                        partMarkers.forEach(function(p) {
                            if (p[0] == d.part) {
                                engPart = p[1]
                            }
                        })
                        var engVol = '?'
                        volMarkers.forEach(function(v,i) {
                            if (volMarkers[i][0] <= d.part && volMarkers[i+1][0] >= d.part) {
                                engVol = volMarkers[i][1]
                            }
                            if (d.part == 17) {
                                engVol = 'Epilogue'
                            }
                        })
                        var timespan = ` in ${engVol}, ${engPart}`
                        d3.select('#timespan').text(timespan)
                        timespan = timespan +  `, ${e.chapter}`
                        var thishtml = `<h5>${timespan} <span style='float: right'><a href="https://ilibrary.ru/text/11/p.${e.value}/index.html" target="_blank">Read online</a></span></h5><p>${e.emphasis}</p>`
                        e.token.split(';').forEach(function(t) {
                            thishtml = thishtml.replace(t.toUpperCase(), `<span style='color: red'>${t.toUpperCase()}</span>`)
                        })
                        paragraphs.push(thishtml)
                    })
                    d3.select('#'+emo+'examples').html(paragraphs.join('<hr>'))
                })
            })  
        })

        // right-hand legend
        d3.selectAll('.legend').on('click', function () {
            var classNames = d3.select(this).attr('class')
            var char = classNames.split(' ')[0]
            // show/hide path
            var path = d3.select('#' + char)
            var pathClass = path.attr('class')

            if (pathClass == 'show') {
                path.attr('stroke-width', 0).attr('class', 'hide')
                d3.select(this).style('fill','white')
                if (showExamples) {
                    d3.selectAll('.dot'+char).attr('display','none')
                }
            } else {
                path.attr('stroke-width', 1.5).attr('class', 'show')
                d3.select(this).style('fill', color(char))
                if (showExamples) {
                    d3.selectAll('.dot'+char).attr('display','show')
                }
            }
        })

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