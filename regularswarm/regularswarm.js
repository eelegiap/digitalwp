function render(nodes) {
    const svg = d3.select('svg') 
    const width = +svg.attr('width')
    const height = +svg.attr('height')
    const vis = svg.select('g.vis') 
    const axis = svg.select('g.axis') 
    const f = d3.format('.2f')


    var color = d3.scaleOrdinal()
    .domain(["Андрей Болконский", "Пьер Безухов", "Наташа",'Николай Ростов'])
    .range([ "#ef476f", "#1b9aaa", "#ffc43d",'#06d6a0'])

    const xScale = d3.scaleLinear()
        .domain([0, 370])
        .range([0, 1200])

    let simulation = d3.forceSimulation(nodes) 
        .force('x', d3.forceX().x(d => xScale(d.value)).strength(1))
        .force('y', d3.forceY().y(d => height/2).strength(1))
        .force('collision', d3.forceCollide(7))//.radius(d => d.radius + 1))

    simulation.stop()

    for (let i = 0; i < nodes.length; ++i){
        simulation.tick()
    }     

    //append circles
    const u = vis.selectAll('circle')
        .data(nodes)

    u.enter()
        .append('circle')
        // .attr('r', d => d.radius + 1))
        .attr('r', 6)
        .style('fill', d => color(d.character))
        .merge(u)
        .attr('cx', d => d.x)
        .attr('cy', d => d.y)
        .on('click', function(d) {
            d3.select('#js-info').html(`
            <p>Location: ${d.volume}, ${d.part}, ${d.chapter}</p>
            <p>Character: <span style='color:${color(d.character)}'>${d.character}</span></p>
            <p>Keywords found: ${d.keywords}</p>
            <p>${d.emphasis}</p>`)
        })

    u.exit().remove()

    // render an axis
    const xAxis = d3.axisBottom().scale(xScale)
    axis.call(xAxis)

}