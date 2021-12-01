
function render(nodes) {
    const svg = d3.select('svg')
    const width = +svg.attr('width')
    const height = +svg.attr('height')
    const vis = svg.select('g.vis')
    const axis = svg.select('g.axis')
    const f = d3.format('.2f')


    // var color = d3.scaleOrdinal()
    //     .domain(["Андрей Болконский", "Пьер Безухов", "Наташа", 'Николай Ростов', 'Соня', 'Марья'])
    //     .range(["#ef476f", "#1b9aaa", "#ffc43d", '#06d6a0', '#b185db', '#6f523b'])

    const xScale = d3.scaleLinear()
        .domain([66, 164])
        .range([0, 1200])

    var eHeight = {
        "счастье": .2 * height,
        "радость": .5 * height,
        'восторг': .7 * height,
    }

    let simulation = d3.forceSimulation(nodes)
        .force('x', d3.forceX().x(d => xScale(d.value)+6).strength(1))
        .force('y', d3.forceY().y(function (d) { 
            return eHeight[d.emotionwords] })
            // return height/2})
            .strength(1))
        .force('collision', d3.forceCollide(7))//.radius(d => d.radius + 1))

    simulation.stop()

    for (let i = 0; i < nodes.length; ++i) {
        simulation.tick()
    }



    //append circles
    const u = vis.selectAll('circle')
        .data(nodes)
    function getOpacity(d) {
        var emotions = d.emotionwords.split(';')
        var oVal = .1
        if (emotions.includes('счастье')) {
            oVal = .4
        } if (emotions.includes('радость')) {
            oVal = .7
        } if (emotions.includes('восторг')) {
            oVal = 1
        }
        return oVal
    }
    function getColor(d) {
        var emotions = d.emotionwords.split(';')
        var eColor = ''
        if (emotions.includes('счастье')) {
            eColor = "#ef476f"
        } if (emotions.includes('радость')) {
            eColor = "#1b9aaa"
        } if (emotions.includes('восторг')) {
            eColor = "#ffc43d"
        }
        return eColor
    }
    var maxcx = 0
    
    u.enter()
        .append('circle')
        // .attr('r', d => d.radius + 1))
        .attr('r', 4)
        .classed('offclick', true)
        .style('fill', d => getColor(d))
        // .attr('opacity', d => getOpacity(d))
        .merge(u)
        .attr('cx', function(d) {
            if (d.x > maxcx) {
                maxcx = d.x
            }
            return d.x})
        .attr('cy', d => d.y)
        .on('click', function (d) {
            if (d3.select(this).attr('class') == 'offclick') {
                d3.selectAll('circle').each(function (d, i) {
                    d3.select(this)
                        .style('fill', d => getColor(d))
                        .attr('opacity', d => getOpacity(d))
                })
                d3.select(this)
                    .style('fill', 'black')
                    .attr('opacity', 1)
                    .attr('class', 'onclick')
            }
            var emphasis = d.emphasis
            d.keytokens.split(';').forEach(function (token) {
                emphasis = emphasis.replaceAll(token.toUpperCase(), '<span style="color: red">' + token.toUpperCase() + '</span>')
            })

            console.log(emphasis)
            d3.select('#js-info').html(`
            <p>Location: ${d.volume}, ${d.part}, ${d.chapter} (<a href="https://ilibrary.ru/text/11/p.${d.value}/index.html" target="_blank">URL to online book</a>)</p>
            <p>Keywords found: ${d.keywords}</p>
            <p>${emphasis}</p>`)
        })

    u.exit().remove()

    console.log(maxcx)
    // append volume markers
    var volMarkers = [[66, 'Volume 2'],[164, 'End Volume 2']]
        // 'Volume 3'],[260, 'Volume 4'],[334, 'Epilogue'], [362, 'END']]
    var partMarkers = [
        // [1, 'Part 1'],
        // [26, 'Part 2'],
        // [47, 'Part 3'],
        [66, 'Part 1'],
        [82, 'Part 2'],
        [103, 'Part 3'],
        [129, 'Part 4'],
        [142, 'Part 5'],
        // [164, 'Part 1'],
        // [187, 'Part 2'],
        // [226, 'Part 3'],
        // [260, 'Part 1'],
        // [276, 'Part 2'],
        // [295, 'Part 3'],
        // [314, 'Part 4'],
        // [334, 'Part 1'],
        // [350, 'Part 2']
    ]

    volMarkers.forEach(function(p) {
        var page = p[0]; var volName = p[1];

        vis
            .append("line")
            .attr("x1", xScale(page))  //<<== change your code here
            .attr("y1", 0 * height)
            .attr("x2", xScale(page))  //<<== and here
            .attr("y2", .8 * height)
            .style("stroke-width", 2)
            .style("stroke", "red")
            .style('opacity',.5)
            .style("fill", "none")
        vis
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('x', xScale(page))
            .attr('y', .9 * height)
            .text(volName)
    })

    partMarkers.forEach(function(p) {
        var page = p[0]; var name = p[1];

        vis
            .append("line")
            .attr("x1", xScale(page))  //<<== change your code here
            .attr("y1", 0 * height)
            .attr("x2", xScale(page))  //<<== and here
            .attr("y2", .8 * height)
            .style("stroke-width", 1)
            .style("stroke", "gray")
            .style('opacity',.5)
            .style("fill", "none")
        vis
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('class','partMarker')
            .attr('x', xScale(page))
            .attr('y', .85 * height)
            .text(name)
    })


    // render an axis
    const xAxis = d3.axisBottom().scale(xScale)
    axis.call(xAxis)

}