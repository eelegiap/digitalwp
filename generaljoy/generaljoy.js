
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
        .domain([0, 370])
        .range([0, 3000])

    // var charHeight = {
    //     "Андрей Болконский": .2 * height,
    //     "Пьер Безухов": .3 * height,
    //     "Наташа": .4 * height,
    //     'Николай Ростов': .5 * height,
    //     'Соня': .6 * height,
    //     'Марья': .7 * height
    // }

    let simulation = d3.forceSimulation(nodes)
        .force('x', d3.forceX().x(d => xScale(d.value)).strength(1))
        .force('y', d3.forceY().y(function (d) { 
            // return charHeight[d.character] })
            return height/2})
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

    u.enter()
        .append('circle')
        // .attr('r', d => d.radius + 1))
        .attr('r', 6)
        .classed('offclick', true)
        .style('fill', '#00a8e8')
        .attr('opacity', d => getOpacity(d))
        .merge(u)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .on('click', function (d) {
            if (d3.select(this).attr('class') == 'offclick') {
                d3.selectAll('circle').each(function (d, i) {
                    d3.select(this)
                        .style('fill','#00a8e8')
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

    // append volume markers
    var volMarkers = [[1, 'Volume 1'],[66, 'Volume 2'],[164, 'Volume 3'],[260, 'Volume 4'],[334, 'Epilogue'], [362, 'END']]
    volMarkers.forEach(function(p) {
        var page = p[0]; var volName = p[1];

        vis
            .append("line")
            .attr("x1", xScale(page))  //<<== change your code here
            .attr("y1", .1 * height)
            .attr("x2", xScale(page))  //<<== and here
            .attr("y2", .9 * height)
            .style("stroke-width", 2)
            .style("stroke", "red")
            .style("fill", "none")
        vis
            .append('text')
            .attr('text-anchor', 'middle')
            .attr('x', xScale(page))
            .attr('y', .95 * height)
            .text(volName)


    })

    // render an axis
    const xAxis = d3.axisBottom().scale(xScale)
    axis.call(xAxis)

}