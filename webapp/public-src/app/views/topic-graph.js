import Ember from 'ember';

export default Ember.View.extend({
  attributeBindings: ['style'],
  classNames: ["topic-graph", "ui", "segment", "raised"],
  svgClassName : "topic-graph",

  setDimensions : function() {
    
    // Build strings used to form style attribute
    var defaultWidth = 700;
    var defaultHeight = 300;
    var widthString = "width: " + defaultWidth + "px;";
    var heightString = "height: " + defaultHeight + "px;";

    // Get the passed-in width and height arguments. 
    var width = this.get('width');
    var height = this.get('height');

    // If user passed in a width, use the passed-in width to construct
    // the <style> string (see below)
    if (width !== undefined) {
      widthString = "width: " + width + "px;";
    }

    // Otherwise, go with the default width
    else {
      this.set('width', defaultWidth);
    }

    if (height !== undefined) {
      heightString = "height: " + height + "px;";
    }
    else {
      this.set('height', defaultHeight);
    }

    // var style = widthString + heightString;
    // this.set('style', style);
  },


  isArray : function(obj) {
    return Object.prototype.toString.call( obj ) === '[object Array]';
  },


  validateEdge : function(edge) {
    return (edge.source !== undefined && edge.target !== undefined &&
      edge.source !== null && edge.target !== null);
  },


  _getNodes : function() {
    return this.get('nodes').toArray();
  },

  getNodes : function() {
    var nodes = this._getNodes();
    var output = [];
    for (var i = 0; i < nodes.length; i++) {
      var nodeJson = nodes[i].toJSON();
      nodeJson.id = nodes[i].get('id');
      output.push(nodeJson);
    }
    return output;
  },


  getNode : function(id) {
    var matchingNodes = this.getNodes().filterBy('id', id);
    return matchingNodes[0];
  },

  getIndexWithProperty : function(array, prop, value) {
    for(var i = 0, elem; elem = array[i]; i++) {
      if (elem[prop] === value) {
        return i;
      }
    }
  },


  getEdges : function() {
    var nodes = this.getNodes();
    var nodeEdges = this.get('nodes').getEach('edges');
    var output = [];

    for (var i = 0, edgeList; edgeList = nodeEdges[i]; i++) {
      var edgeArr = edgeList.toArray();
      for (var j = 0, edge; edge = edgeArr[j]; j++) {
        var edgeJSON = edge.toJSON();
        edgeJSON.source = this.getIndexWithProperty(nodes, 'id', edgeJSON.prereq_id);
        edgeJSON.target = this.getIndexWithProperty(nodes, 'id', edgeJSON.topic);
        delete edgeJSON['topic'];
        delete edgeJSON['prereq_id'];
        output.push(edgeJSON);
      }
    }

    /*
    var edges = [];
    var output = [];
    for(var i = 0, edge; edge = edges[i]; i++) {
      edge.source = this.getNode(edge.get('prereq_id'));
      edge.target = this.getNode(edge.get('topic.id'));

      if (this.validateEdge(edge)) {
        output.push(edge);
      }

    }
    */
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

    var svg = this.get('svg');
    if (svg === undefined) {
      var svgClass = this.getClassName(this.get('svgClassName'));      
      svg = d3.select(svgClass)
             .append("div")
             .classed("svg-container", true) // container class to make it responsive
             .append("svg")
             .attr("preserveAspectRatio", "xMinYMin meet")
             .attr("viewBox", "0 0 600 400")
             //class to make it responsive
             .classed("svg-content-responsive", true); 
              /*      
              .attr("width", width)
              .attr("height", height);
              */
      this.set('svg', svg); 
    }        

    var force = d3.layout.force()
        .gravity(0.05)
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
        .attr("class", "node");
        
    node.append("circle")
        .attr("x", -8)
        .attr("y", -8)    
        .attr("class", "node")
        .attr("r", 5)       
        .call(force.drag);

    node.append("text")
        .attr("dx", 12)
        .attr("dy", ".35em")
        .text(function(d) { return d.name; })
        .on("click", function(d) { context.goToResult(d); });

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
