import Ember from 'ember';

export default Ember.View.extend({
  attributeBindings: ['style'],
  style: "width: 960px; height: 500px;",
  classNames: ["topic-graph"],

  setDimensions : function() {
    
    var defaultWidth = 700;
    var defaultHeight = 300;

    var heightString = "width: " + defaultWidth + "px; ";
    var widthString = "height: " + defaultHeight + "px;";

    var width = this.get('width');
    var height = this.get('height');

    if (width !== undefined) {
      widthString = "width: " + width + "px; ";
    }
    else {
      this.set('width', defaultWidth);
    }

    if (height !== undefined) {
      heightString = "height: " + height + "px;";
    }
    else {
      this.set('height', defaultHeight);
    }

    var style = widthString + heightString;
    this.set('style', style);
  },

  isArray : function(obj) {
    return Object.prototype.toString.call( obj ) === '[object Array]';
  },

  validateEdge : function(edge) {
    return (edge.source !== undefined && edge.target !== undefined 
      && edge.source !== null && edge.target !== null);
  },

  getNodes : function() {
    return this.get('nodes');
  },

  getNode : function(id) {
    return this.getNodes().filterBy('id', id)[0];
  },

  getEdges : function() {
    var edges = this.get('edges');
    var output = [];
    for(var i = 0, edge; edge = edges[i]; i++) {
      edge.source = this.getNode(edge.prereq_id);
      edge.target = this.getNode(edge.topic_id);

      if (this.validateEdge(edge)) {
        output.push(edge);
      }

    }
    return output;
  },

  getClassName : function(name) {
    return "." + name;
  },

  clearGraph : function() {
    var svg = this.get('svg');
    if (svg !== undefined) {
      svg.selectAll("*").remove();
    }
  },
  
  drawGraph : function(nodes, edges, context) {
    var width = context.get('width'),
        height = context.get('height');
    var color = d3.scale.category20();
    var svgClassName = 'root-svg';

    var force = d3.layout.force()
        .charge(-200)
        .gravity(0.05 * Math.log(nodes.length))
        .linkDistance(30)
        .size([width, height]);


    var svg = this.get('svg');
    if (svg === undefined) {
      svg = d3.select(".topic-graph").append("svg")
          .attr("width", width)
          .attr("height", height)
          .attr('class', svgClassName);
      this.set('svg', svg);
    }

    force
        .nodes(nodes)
        .links(edges)
        .start();
    console.log("Started animation");


    var gnodes = svg.selectAll('g.gnode')
      .data(nodes)
      .enter()
      .append('g')
      .classed('gnode', true);  
    console.log("Added groups");


    var link = svg.selectAll(".link")
        .data(edges)
      .enter().append("line")
        .attr("class", "link")
        .style("stroke-width", function(d) { return 3.0; /* Math.sqrt(d.value); */ });

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
      
         
      gnodes.attr("transform", function(d) { 
          return 'translate(' + [d.x, d.y] + ')'; 
      });
      
        
    });
  },

  updateGraph : function() {
    var nodes = this.getNodes();

    if (nodes.length > 0) {
      this.drawGraph(this.getNodes(), this.getEdges(), this);    
    }
  }.observes('nodes', 'edges'),

  didInsertElement: function() {
    this.setDimensions();    
    this.drawGraph(this.getNodes(), this.getEdges(), this);

  }  	
});
