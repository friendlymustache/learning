import Ember from 'ember';

export default Ember.View.extend({
  attributeBindings: ['style'],
  style: "width: 960px; height: 500px;",
  classNames: ["topic-graph"],

  isArray : function(obj) {
    return Object.prototype.toString.call( obj ) === '[object Array]';
  },

  validateEdge : function(source, target) {
    return (source !== undefined && target !== undefined 
      && source !== null && target !== null);
  },

  getNodes : function() {
    return this.get('nodes');
  },

  getEdges : function() {
    var edges = this.get('edges');
    var output = [];
    for(var i = 0, edge; edge = edges[i]; i++) {
      edge.source = edge.prereq_id;
      edge.target = edge.topic_id;

      if (this.validateEdge(edge.source, edge.target)) {
        output.push(edge);
      }

    }
    debugger;
    return output;
  },
  
  drawGraph : function(nodes, edges) {
    var width = 960,
        height = 500;
    var color = d3.scale.category20();

    var force = d3.layout.force()
        .charge(-120)
        .linkDistance(30)
        .size([width, height]);

    var svg = d3.select(".topic-graph").append("svg")
        .attr("width", width)
        .attr("height", height);

    force
        .nodes(nodes)
        .links(edges)
        .start();

    console.log("Started animation");
    var link = svg.selectAll(".link")
        .data(edges)
      .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function(d) { return Math.sqrt(d.value); });

    console.log("Added links");      
    var node = gnodes.append("circle")
        .attr("class", "node")
        .attr("r", 5)
        //.style("fill", function(d) { return color(d.group); })
        .call(force.drag);

    console.log("Added circles");        

    var labels = gnodes.append("text")
        .text(function(d) { return d.name; });

    console.log("Added labels");        
      
    force.on("tick", function() {
      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });
      
      /*          
      gnodes.attr("transform", function(d) { 
          return 'translate(' + [d.x, d.y] + ')'; 
      });
      */
        
    });
  },

  didInsertElement: function() {
    this.drawGraph(this.getNodes(), this.getEdges());

  }  	
});
