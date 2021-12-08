// 
drawBubbles('all')

d3.selectAll('.bubblebutton').on('click', function() {
    var char = d3.select(this).attr('id').split('button')[0]
    drawBubbles(char)
})

function drawBubbles(character) {
    $('#bubble').empty()
    d3.select('#bubbleexamples').html('')
    d3.select('#bubbleword').text('(select bubble)')

    d3.json('bubbledata/'+character+'data.json', function (dataset) {
        d3.json('bubbledata/'+character+'sents.json', function (sentdata) {
            var diameter = 600;
    
            function color(i) {
                return '#bbdefb'
            }
    
            var charColor = d3.scaleOrdinal()
            .domain(['Andrei','Pierre','Natasha','all'])
            .range(['#3d405b', '#81b29a', '#e07a5f','lightgrey'])

            if (character == 'all') {
                d3.select('#bubchar').text('all characters').style('color',charColor(character))
            } else {
                d3.select('#bubchar').text(character).style('color',charColor(character))
            }

            var bubble = d3.pack(dataset)
                .size([diameter, diameter])
                .padding(1.5);
    
            var svg2 = d3.select("#bubble")
                .append("svg")
                .attr("width", diameter)
                .attr("height", diameter)
                .attr("class", "bubble");
    
            var nodes = d3.hierarchy(dataset)
                .sum(function (d) { return d.Count; });
    
            var node = svg2.selectAll(".node")
                .data(bubble(nodes).descendants())
                .enter()
                .filter(function (d) {
                    return !d.children
                })
                .append("g")
                .attr("class", "node")
                .attr("transform", function (d) {
                    return "translate(" + d.x + "," + d.y + ")";
                });
    
            node.append("title")
                .text(function (d) {
                    return d.Name + ": " + d.Count;
                });
    
            node.append("circle")
                .attr("r", function (d) {
                    return d.r;
                })
                .style("fill", function (d, i) {
                    return charColor(character);
                })
                .attr('opacity',.4)
                .attr('id', d => d.data.Name)
                // .style('stroke','gray')
                .attr('class', 'clickable')
    
            node.append("text")
                .attr("dy", ".05em")
                .style("text-anchor", "middle")
                .text(function (d) {
                    return d.data.Name.substring(0, d.r / 2.7);
                })
                .attr("font-family", "sans-serif")
                .attr("font-size", function (d) {
                    return d.r / 2.7;
                })
                .attr("fill", "black")
                .attr('class', 'clickable')
    
    
            node.append("text")
                .attr("dy", "1.5em")
                .style("text-anchor", "middle")
                .text(function (d) {
                    return d.data.Count;
                })
                // .attr("font-family", "Gill Sans", "Gill Sans MT")
                .attr("font-size", function (d) {
                    return d.r / 2.7;
                })
                .attr("fill", "white")
                .attr('class', 'clickable')
    
            d3.select(self.frameElement)
                // .style("height", diameter + "px");
    
            d3.selectAll('.clickable')
                .on('mouseover', function (d) {
                    d3.select('#' + d.data.Name).transition().attr('r', d => d.r * .75)
                 })
                .on('mouseout', function (d) {
                    d3.select('#' + d.data.Name).transition().attr('r', d => d.r)
                })
                .on('click', function(d) {
                    var sentencearr = sentdata[d.data.Name]
                    console.log(d.data.Name)
                    var htmlsents = sentencearr.join('<br><br>')
                    d3.select('#bubbleword').text(d.data.Name)
                    d3.select('#bubbleexamples').html(htmlsents)
                })
        })
    
    })
}