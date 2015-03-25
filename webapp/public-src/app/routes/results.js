import Ember from 'ember';

export default Ember.Route.extend({
	model: function(params) {
		return this.store.find('topic', {name: params.query});
	},

	setupController : function(controller, model) {
		

		var nodes = [];

		var names = model.getEach('name');
		var ids = model.getEach('ids');

		for(var i = 0; i < names.length; i++) {
			nodes.push({name: names[i], id: ids[i]});
		}

		var extraAttrs = model.getEach('extraAttrs')[0];
		var links = extraAttrs.link;
		var edges = extraAttrs.edge;
		var topics = extraAttrs.primary;
		controller.set('nodes_exist', (topics.length != 0));

		this._super(controller, topics);		
		controller.set('graph_nodes', topics);
		controller.set('graph_edges', edges);
	}
});
