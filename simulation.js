var wGraph = 1200
var hGraph = 1200
var barWidth = 10

var p=1//credule parameter - currently not used
var starter=0.02//0.1 spread
let mode=-1
let alpha=0.5


let infected = new Set([]);
let propEdgesIds;

const fill = d3.scaleOrdinal(d3.schemeCategory10);

// how many edges does each incoming node form
var m = 2;

let nodes;



					function othername() {
					   m = parseInt( document.getElementById("connectionsInput").value);
    					starter = parseFloat(document.getElementById("startersInput").value)/100;
            
console.log("param updated",m,p)
					}

d3.select("#restartButton").on("click", function() {
    m = Number(document.getElementById("mRange").value)
    prefAt = document.getElementById("prefAt").checked
    console.log("m=", m, ", prefAt = ", prefAt)
    resetGraph();
})

d3.select("#rumorButton").on("click", function() {
    mode++
    console.log('mode++')
    if (mode==0){
        iter=0
//
//         for (let c = 0; c < 1000; c++) {
// console.log(c)
//               addNode();
//               update();
//         }
        var interval = d3.interval(function(){
            addNode();
            update();
            iter++;
            if (mode>0) {
                interval.stop(); // <== !!!
                return;
            }}, 0);
    }
    if (mode>=1){
        if (mode==1) {
            console.log('compute neighbours')
            for (let e in edgesD) {
                s = edgesD[e].source.id
                t = edgesD[e].target.id
                nodesD[s].neighbours.push(t)
                nodesD[t].neighbours.push(s)
            }
        }

        console.log(nodesD)
        let counts={'sane':0,'incube':0,'infected':0}

            edges=edgesG.selectAll(".edge")
                .data(edgesD)
                .enter()
                .append("line")
                //.attr('stroke-width',1)
                .attr("class", "edge")
        for (let i in nodesD) {
          //determines if i gets incubed
            n=nodesD[i]

            console.log(i,n.state)
            var c = document.getElementById("node"+n.id);
            c.style.fill = n.state=="sane"?'lightgrey' : n.state=="incube"? 'red' :'black';
            let neighbInf=0
            neighbs=nodesD[i].neighbours
            console.log('neighbs',neighbs)
            propEdgesIds=[]
            if (1==1){
            for (let k in neighbs){

                ns=nodesD[neighbs[k]].state
                if (ns=='infected'){
                  propEdgesIds.push(n.id+'|'+neighbs[k],neighbs[k]+'|'+n.id)
                  neighbInf = neighbInf +1
                  console.log(propEdgesIds)
              }
                //console.log(k,ns,neighbInf)
            }
            if (neighbInf>=2){
                for (e in propEdgesIds){
                  console.log('prop',propEdgesIds[e])
                  try {var c = document.getElementById(propEdgesIds[e]);
                      c.style.stroke = 'red';
                    c.style['stroke-width'] = '12px';}
                      catch{}

                }
            }
          }
            nodesD[i].state=(n.state =='incube' || n.state=='infected') ?'infected':neighbInf>=2? 'incube':'sane'
            counts[nodesD[i].state]+=1

        }
        console.log(counts)


        document.getElementById("numNodes").innerHTML = nodesD.length+" individus"
        document.getElementById("numSane").innerHTML = counts['sane']+" sains"
        document.getElementById("numIncube").innerHTML = counts['incube']+" incubent"
        document.getElementById("numInfected").innerHTML = counts['infected']+" infectés"

    }

})


function clickFn(){
        addNode()
    update()
}

// create svg
var graphSVG = d3.select("#graphDiv")
    .append("svg")
    .attr("height", hGraph)
    .attr("width", wGraph)
    .on("click",clickFn)

const vis = graphSVG.append("g");

// create g elements for edges and nodes
var edgesG = vis.append("g")
var nodesG = vis.append("g")
//var statsG = statsSVG.append("g")

// initial graph: 2 connected nodes
let x=Math.random()
var nodesD = [{"id": 0, "weight": 0,"state":x<starter? "infected":"sane","credule": x<p,'neighbours':[]}]
var nodesWeighted = [1]
var newNode = 0; // ids of existing nodes
var edgesD = []

// initialise variable to store max degree measured
var len = 0;

// scaling area of node to its degree
var rScale = d3.scalePow()
            .exponent(0.5)
            .domain([0,10])
            .range([1,15])

// initialise simulation
var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }))
    .force("charge", d3.forceManyBody().strength(-50))
    .force("center", d3.forceCenter(wGraph/2,hGraph/2))
    .force('collision', d3.forceCollide(function(d) {
                        return 10
                        }))

simulation
  .nodes(nodesD)
  .on("tick", ticked);

simulation.force("link")
  .links(edgesD);

// initialise stats display
var margin = {top: 20, right: 20, bottom: 35, left: 35},
    wStats = 400 - margin.left - margin.right,
    hStats = 350 - margin.top - margin.bottom

// scales
var xScale = d3.scaleBand().rangeRound([0, wStats]).paddingInner([0.2]).paddingOuter([0.05])
var yScale = d3.scaleLinear().range([hStats,0])

// axes
var xAxis = d3.axisBottom().scale(xScale)
var yAxis = d3.axisLeft().scale(yScale)

// append stats svg and g elements for chart and axes
var statsG = d3.select("#statsDiv").append("svg")
    .attr("width", wStats + margin.left + margin.right)
    .attr("height", hStats + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

statsG.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + hStats + ")")

statsG.append("g")
    .attr("class", "y axis")

statsG.append("text")
    .attr("text-anchor", "end")
    .attr("transform", "rotate(270)")
    .attr("font-size", "14px")
    .attr("y", -20)
    .text("Number of nodes")

statsG.append("text")
    .attr("text-anchor", "end")
    .attr("font-size", "14px")
    .attr("x", wStats)
    .attr("y", 325)
    .text("Degree")



// this will create the initial display, afterwards, it will automatically add a new node every x seconds and update()
update()

// add a new node every two seconds
//var twoSeconds = d3.interval(everyInterval, 2000);

function addNode () {
        newNode += 1;
        let x=Math.random()
        nodesD.push({"id": newNode, "weight": m ,"state":x<starter? "infected":"sane","credule": x<p,'neighbours':[]}); // add new node
        for (var k = 0; k < m; k++) {
            var tgt = chooseTarget(newNode )
            edgesD.push({source: newNode, target: tgt}); // add new link
            nodesWeighted.push(newNode, tgt) // add nodes to weighted list because they each have one more link now
            console.log(tgt,m)
            nodesD[tgt].weight += 1
        }

}

function update() {
    // update nodes and edges with the updated dataset, restart the simulation
    console.log('mode',mode)
    /*
    console.log(nodesD,edgesD)
    console.log(nodesD)
    console.log('infected',infected)
    */







    vis.attr("transform", "scale("+5/(5+Math.log(nodesD.length+1))+")")


    nodes=nodesG.selectAll(".node")
        .data(nodesD)
        .enter()
        .append("circle")
        .attr("class", "node")
        .attr('id',d=>"node"+d.id)
        .attr("r", function(d) {return mode<1?rScale(d.weight):30})
        .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended))
        .style('fill',d=>fill(d.id));

    d3.selectAll(".node").transition().attr("r", function(d) {return rScale(d.weight)})



    edges=edgesG.selectAll(".edge")
        .data(edgesD)
        .enter()
        .append("line")
        .attr('id',d=>(d.source)+'|'+(d.target))
        .attr("class", "edge")

    // restart force layout
    simulation.nodes(nodesD);
    simulation.force("link").links(edgesD);
    simulation.alpha(1).restart();

    // update stats display
    updateStats()
}

function ticked() {
    // assign updated positions to nodes and edges
    edgesG.selectAll(".edge")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });


    nodesG.selectAll(".node")
        .attr("cx", d=> d.x)//function(d) { return d.x = Math.max(rScale(d.weight), Math.min(wGraph  - rScale(d.weight), d.x)); }) //
        .attr("cy", d=>d.y)//function(d) { return d.y = Math.max(rScale(d.weight), Math.min(hGraph - rScale(d.weight), d.y)); });

}

function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}

function chooseTarget() {
    // choose a target for an incoming node
    chosenPref = nodesWeighted[Math.floor((Math.random() * nodesWeighted.length))];
    chosenUnif = nodesD[Math.floor(Math.random() * (nodesD.length-1))].id


    return Math.random()<alpha? chosenUnif : chosenPref
}

function compare(a1,a2){
    return a1[1]>a2[1]? -1 : 1

}
function updateStats() {
    document.getElementById("numNodes").innerHTML = nodesD.length+" individus"
    // update stats bar chart
    var statsD = collectStats()
    statsD.sort(compare)
    statsD=statsD.splice(0,Math.floor(statsD.length/2))
    //console.log('statsd',statsD)

    // fix horizontal scale and axis
    keysList = [];
    for (var i=0; i<statsD.length; i++) {
        keysList.push(statsD[i][0])
    }
    xScale.domain(keysList)
    if (keysList.length>10) {
        xAxis.tickValues(keysList.filter(function(d,i) {return !(i%Math.round(keysList.length/10))}))
    }
    else {
        xAxis.tickValues(keysList)
    }

    // fix vertical scale and axis
    yScale.domain([0, d3.max(statsD, function(d) {return d[1]})])

    var maxYTick = d3.max(statsD, function(d) {return d[1]})
    if (maxYTick<10) {
        yAxis.ticks(maxYTick)
    }
    else {
        yAxis.ticks(10)
    }
    // if (maxYTick<10) {
    //     yAxis.tickValues(d3.range(maxYTick))
    // }
    // else {
    //     yAxis.tickValues()
    // }

    // var maxXTick = d3.max(statsD, function(d) {return d[0]})+1
    // if (maxXTick<10) {
    //     xAxis.tickValues(d3.range(maxXTick))
    // }
    // else {
    //     xAxis.tickValues().ticks(10)
    // }


    // axes
    statsG.select(".x.axis").transition().duration(100).call(xAxis)
    statsG.select(".y.axis").transition().duration(100).call(yAxis)


    statsG.selectAll(".bar")
        .data(statsD)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", yScale(0))
        .attr("height", function(d) {return hStats-yScale(0)})

    // transition all new/ exisiting bars
    statsG.selectAll(".bar")
        .transition()
        .duration(100)
        .attr("x", function(d) {return xScale(Number(d[0])) })
        .attr("width", xScale.bandwidth())
        .attr("y", function(d) {return yScale(d[1])})
        .attr("height", function(d) {return hStats - yScale(d[1])})
}

function collectStats() {
    // collect stats
    // return an array [[degree, frequency], ...]
    var count = _.countBy(nodesD, function(n) {return n.weight})
    var keys = Object.keys(count).map(Number)
    len = d3.max([len, d3.max(keys)])
    countA = [];
    max=100
    for (let k in keys){
        c=count[k]
        if (c>max){
            max=c
        }
        if (c>2) {
            countA.push([k,c])
        }



    }
    /*
    for (var i=0; i<=len; i++) {
        countA.push([i, 0])
    }
    for (var i=0; i<keys.length; i++) {
        countA[keys[i]][1] = count[keys[i]]
    }
    */

    return countA
}

function resetGraph() {
    // clearInterval(twoSeconds)
    // reset data
    nodesD = [{"id": 1, "weight": 0}]
    nodesWeighted = [1]
    newNode = 1; // ids of existing nodes
    edgesD = []
    len = 0

    // clear g elements
    d3.selectAll(".node").remove()
    d3.selectAll(".edge").remove()

    // restart timer
    // twoSeconds = d3.interval(everyInterval, 2000);
}
