import Ember from 'ember';

export default Ember.View.extend({
  attributeBindings: ['style'],
  classNames: ["topic-graph"],
  svgClassName : "topic-graph",

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
    var width = this.get('width'),
        height = this.get('height');
    var context = this;

    var svg = this.get('svg');
    if (svg === undefined) {
      var svgClass = this.getClassName(this.get('svgClassName'));      
      svg = d3.select(svgClass).append("svg")
              .attr("width", width)
              .attr("height", height);
      this.set('svg', svg);
    }        

    var force = d3.layout.force()
        .gravity(.05)
        .distance(100)
        .charge(-100)
        .size([width, height]);

    force.nodes(nodes).links(edges).start();

    var link = svg.selectAll(".link")
        .data(edges)
      .enter().append("line")
        .attr("class", "link");

    var node = svg.selectAll(".node")
        .data(nodes)
      .enter().append("g")
        .attr("class", "node")
        .call(force.drag);

    /*
    node.append("image")
        .attr("xlink:href", "https://github.com/favicon.ico")
        .attr("x", -8)
        .attr("y", -8)
        .attr("width", 16)
        .attr("height", 16);
    */

    node.append("circle")
        .attr("x", -8)
        .attr("y", -8)    
        .attr("class", "node")
        .attr("r", 5)       
        .on("dblclick", function(d) { context.goToResult(d); });        

    node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function(d) { return d.name })
        .on("dblclick", function(d) { context.goToResult(d); });

    force.on("tick", function() {
      link.attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
    });
  },

  goToResult : function(topic) {
    this.get('controller').send('goToResult', topic);
  },

  updateGraph : function() {
    var nodes = this.getNodes();
    this.clearGraph();
    if (nodes.length > 0) {
      this.drawGraph(this.getNodes(), this.getEdges(), this);    
    }
  }.observes('nodes', 'edges'),

  didInsertElement: function() {
    this.setDimensions();    
    this.drawGraph(this.getNodes(), this.getEdges(), this);

  }  	
});
