var width = 960,
    height = 500;
var maxRadius = 20,
    maxHeight = height / 2 - maxRadius;
var csvData = []; // data retrieve from CSV
var memorizedSortedData = []; // allow to maintain sort when changing radius
var arrangementMax = -Infinity; // allow to detect extremes accumulations
var beeswarmArrangement = []; // allow to manage extreme accumulations wihtout executing Beeswarm arrangement
var showMetrics = false;


var availableSortings = ["shuffled", "minToMax", "maxToMin", "fromExtremes"];
var availableOrientations = ["horizontal", "vertical"];
var availableSides = ["symetric", "positive", "negative"];
var availableExtremesManagementStrategies = ["none"/*, "omit"*/, "wrap", "modulo", "linear stretch", "log stretch"];

var ctrls, config = {
    manyPoints: false,
    sorting: "maxToMin",
    reshuffle: function () {
        if (config.sorting === "shuffled") {
            renewData();
            drawBeeswarm();
        }
    },
    radius: 4,
    orientation: "horizontal",
    side: "symetric",
    strategy: "none"
};
insertControls();

var fill = d3.scale.linear().domain([1, 150]).range(['lightgreen', 'pink']);

var xScale = function (x) { return width / 2 + 400 * x; };
var yScale = function (x) { return height / 2 - 350 * x; };

var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

var axis = svg.append("line")
    .attr("id", "axis");

var nodeContainer = svg.append("g").attr("id", "node-container");

var tooltip, stem, rank, value;
prepareTooltip();

//-->for metrics purpose
var informationPanel, computationTimeInfo, dataLengthInfo, posibleCollidersInfo, placementInfo, visitedCollidersInfo;
prepareMetricsPanel();
//<--for metrics purpose

function showAxis() {
    if (config.orientation === "horizontal") {
        axis.attr("x1", 0)
            .attr("y1", height / 2)
            .attr("x2", width)
            .attr("y2", height / 2);
    } else {
        axis.attr("x1", width / 2)
            .attr("y1", 0)
            .attr("x2", width / 2)
            .attr("y2", height);
    }
};

function manageExtremeAccumulation(bee) {
    var freeCoord = (config.orientation === "horizontal") ? bee.y : bee.x;
    if (arrangementMax <= maxHeight) {
        return freeCoord;
    } else if (config.strategy === "none") {
        return freeCoord;
    } else if (config.strategy === "wrap") {
        return (Math.abs(freeCoord) > maxHeight) ? Math.sign(freeCoord) * maxHeight : freeCoord;
    } else if (config.strategy === "modulo") {
        return freeCoord % maxHeight;
    } else if (config.strategy === "linear stretch") {
        return maxHeight * freeCoord / arrangementMax;
    } else if (config.strategy === "log stretch") {
        //log strecth allows to have litle overlapping near the axis, and huge overlapping at maxHeight, so that areas where there is no extreme accumulation are still sparse

        // return freeCoord - Math.sign(freeCoord)*(arrangementMax-maxHeight)*Math.pow(freeCoord/arrangementMax,2);
        // return Math.sign(freeCoord)*maxHeight*(Math.pow(Math.abs(freeCoord)/arrangementMax,0.5));
        return maxHeight * Math.sign(freeCoord) * Math.log((Math.E - 1) * Math.abs(freeCoord) / arrangementMax + 1);
    }
}

function showCircles() {
    nodeContainer.selectAll("circle").remove();
    var node = nodeContainer.selectAll("circle")
        .data(beeswarmArrangement)
        .enter().append("circle")
        .attr("r", config.radius - 0.75)
        .attr("cx", function (bee) {
            if (config.orientation === "horizontal") {
                return bee.x;
            } else {
                return width / 2 + manageExtremeAccumulation(bee);
            }
        })
        .attr("cy", function (bee) {
            if (config.orientation === "vertical") {
                return bee.y;
            } else {
                return height / 2 + manageExtremeAccumulation(bee);
            }
        })
        .style("fill", function (d) { return fill(d.datum.rank); })
        .style("stroke", function (d) { return d3.rgb(fill(d.datum.rank)).darker(); })
        .on("mouseenter", function (d) {
            stem.text(d.datum.stem);
            rank.text(d.datum.rank);
            value.text(d.datum.trend);
            tooltip.transition().duration(0).style("opacity", 1); // remove fade out transition on mouseleave
        })
        .on("mouseleave", function (d) {
            tooltip.transition().duration(1000).style("opacity", 0);
        });
};

function drawBeeswarm() {
    var data = copyData(memorizedSortedData);

    var startTime = Date.now();
    var swarm = d3.beeswarm()
        .data(data)
        .radius(config.radius)
        .orientation(config.orientation)
        .side(config.side)
        .distributeOn(function (d) {
            if (config.orientation === "horizontal") {
                return xScale(d.trend);
            } else {
                return yScale(d.trend);
            }
        })
    beeswarmArrangement = swarm.arrange();
    if (showMetrics) {
        updateMetrics((Date.now() - startTime), data.length, swarm.metrics());
    }

    computeArrangementMax();
    showOrHideExtremeAccumulationCtrl();
    showAxis();
    showCircles();
};

d3.csv("newdata.csv", dottype, function (error, data) {
    if (error) throw error;
    renewData();
    drawBeeswarm();
});

////////////////////////
// bl.ocks' utilities //
////////////////////////

function dottype(d) {
    d.id = d.stem;
    d.stem = d.stem;
    d.rank = +d.rank;
    d.trend = +d.trend;
    csvData.push(d);
    return d;
};

function copyData(data) {
    return data.map(function (d) {
        return {
            id: d.id,
            stem: d.stem,
            rank: d.rank,
            trend: d.trend
        }
    });
};

function quadruple(data) {
    // Quadruples data while maintaining order and uniq id
    var quadrupledData = [],
        i;
    data.forEach(function (d) {
        for (i = 3; i > 0; i--) {
            quadrupledData.push({
                id: d.id + "_" + i,
                stem: d.stem,
                rank: d.rank,
                trend: d.trend + i * 1E-6
            })
        }
        quadrupledData.push(d);
    })
    return quadrupledData;
};

function computeArrangementMax() {
    arrangementMax = -Infinity;
    if (config.orientation === "horizontal") {
        beeswarmArrangement.forEach(function (bee) {
            if (arrangementMax < Math.abs(bee.y)) {
                arrangementMax = Math.abs(bee.y);
            }
        })
    } else {
        beeswarmArrangement.forEach(function (bee) {
            if (arrangementMax < Math.abs(bee.x)) {
                arrangementMax = Math.abs(bee.x);
            }
        })
    }
}

function renewData() {
    var newData = copyData(csvData);

    if (config.manyPoints) {
        newData = quadruple(newData);
    }

    if (config.sorting === "maxToMin") {
        memorizedSortedData = newData;
    } else if (config.sorting === "minToMax") {
        memorizedSortedData = newData.reverse();
    } else if (config.sorting === "fromExtremes") {
        var dataLength = newData.length;
        memorizedSortedData = [];
        for (var i = 0; i < (dataLength - 1) / 2; i++) {
            memorizedSortedData.push(newData[i]);
            memorizedSortedData.push(newData[dataLength - 1 - i]);
        }
        if (dataLength % 2 === 1) {
            memorizedSortedData.push(newData[(dataLength - 1) / 2]);
        }
    } else {
        memorizedSortedData = d3.shuffle(newData);
    }
};

function insertControls() {
    ctrls = new dat.GUI({ width: 200 });

    var inputDataFolder = ctrls.addFolder("Input Data");
    inputDataFolder.open();
    var manyPointsCtrl = inputDataFolder.add(config, "manyPoints");
    manyPointsCtrl.onChange(function (value) {
        renewData();
        drawBeeswarm();
    });
    var sortingCtrl = inputDataFolder.add(config, "sorting", availableSortings);
    sortingCtrl.onChange(function (value) {
        showOrHideReshuffle();

        renewData();
        drawBeeswarm();
    });
    inputDataFolder.add(config, "reshuffle");

    var beeswarmFolder = ctrls.addFolder("Beeswarm Configuration");
    beeswarmFolder.open();
    var radiusCtrl = beeswarmFolder.add(config, "radius", 1, maxRadius);
    radiusCtrl.onChange(function (value) {
        drawBeeswarm();
    });
    var orientaionCtrl = beeswarmFolder.add(config, "orientation", availableOrientations);
    orientaionCtrl.onChange(function (value) {
        drawBeeswarm();
    });
    var sideCtrl = beeswarmFolder.add(config, "side", availableSides);
    sideCtrl.onChange(function (value) {
        drawBeeswarm();
    });

    var extremesManagementFolder = ctrls.addFolder("Extreme Accumulation Mngt.");
    extremesManagementFolder.open();
    var strategyCtrl = extremesManagementFolder.add(config, "strategy", availableExtremesManagementStrategies);
    strategyCtrl.onChange(function (value) {
        // no need to recompute Beeswarm arrangment
        // these strategies only applies when rendering data (and not when arranging data)
        showCircles();
    })

    showOrHideReshuffle();
    showOrHideExtremeAccumulationCtrl();
};

function showOrHideReshuffle() {
    ctrls.__folders["Input Data"].__controllers.forEach(function (c) {
        if (c.property === "reshuffle") {
            c.domElement.parentElement.parentElement.style.display = (config.sorting === "shuffled") ? "block" : "none";
        }
    })
};

function showOrHideExtremeAccumulationCtrl() {
    if (arrangementMax > maxHeight) {
        ctrls.__folders["Extreme Accumulation Mngt."].domElement.style.display = "block";
    } else {
        ctrls.__folders["Extreme Accumulation Mngt."].domElement.style.display = "none";
    }
};

function prepareTooltip() {
    tooltip = svg.append("g")
        .attr("id", "tooltip")
        .attr("transform", "translate(" + [width / 2, 50] + ")")
        .style("opacity", 0);
    var titles = tooltip.append("g").attr("transform", "translate(" + [-5, 0] + ")")
    titles.append("text").attr("text-anchor", "end").text("stem(fr):");
    titles.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "translate(" + [0, 15] + ")")
        .text("rank:");
    titles.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "translate(" + [0, 30] + ")")
        .text("x-value:");
    var values = tooltip.append("g").attr("transform", "translate(" + [5, 0] + ")")
    stem = values.append("text")
        .attr("text-anchor", "start");
    rank = values.append("text")
        .attr("text-anchor", "start")
        .attr("transform", "translate(" + [0, 15] + ")");
    value = values.append("text")
        .attr("text-anchor", "start")
        .attr("transform", "translate(" + [0, 30] + ")");
};

function prepareMetricsPanel() {
    var i = 4;
    informationPanel = svg.append("g")
        .attr("id", "infomation-panel")
        .attr("transform", "translate(" + [width - 20, height - 20] + ")");
    computationTimeInfo = informationPanel.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "translate(" + [0, -15 * i--] + ")");
    dataLengthInfo = informationPanel.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "translate(" + [0, -15 * i--] + ")");
    possibleCollidersInfo = informationPanel.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "translate(" + [0, -15 * i--] + ")");
    placementInfo = informationPanel.append("text")
        .attr("text-anchor", "end")
        .attr("transform", "translate(" + [0, -15 * i--] + ")");
    visitedCollidersInfo = informationPanel.append("text")
        .attr("text-anchor", "end");
};

function updateMetrics(elapsed, length, metrics) {
    computationTimeInfo.text("Arrangement took: " + elapsed + " ms");
    dataLengthInfo.text("# data: " + length);
    possibleCollidersInfo.text("# possible colliders: ~" + Math.round(metrics.totalPossibleColliders * 100 / length) / 100 + " per data (" + metrics.maxPossibleColliders + " max, " + metrics.totalPossibleColliders + " total)");
    placementInfo.text("# tested placements: ~" + Math.round(metrics.totalTestedPlacements * 100 / length) / 100 + " per data (" + (metrics.maxPossibleColliders * 2) + " max, " + metrics.totalTestedPlacements + " total)");
    visitedCollidersInfo.text("# collision checks: ~" + Math.round(metrics.totalVisitedColliders * 100 / metrics.totalTestedPlacements) / 100 + " per placement (" + metrics.maxVisitedColliders + " max, " + metrics.totalVisitedColliders + " total)")
};

function showOnTheFlyCircleArrangement(d, type) {
    nodeContainer.selectAll("circle.test").remove();
    nodeContainer.append("circle")
        .datum(d)
        .classed(type, true)
        .attr("r", config.radius)
        .attr("cx", function (d) { return d.x; })
        .attr("cy", function (d) { return height / 2 + d.y; })
        .style("fill", function (d) { return fill(d.rank); })
        .style("stroke", function (d) { return d3.rgb(fill(d.rank)).darker(); })
};