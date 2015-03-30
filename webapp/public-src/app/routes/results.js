import Ember from 'ember';

export default Ember.Route.extend({

	beforeModel : function() {
		console.log("in beforemodel hook for results");
	},

	model: function(params) {
		console.log("in model hook for results");
		return this.store.find('topic', {name: params.query});
	},

	setupController : function(controller, model) {
		controller.set('nodes_exist', (model.content.length !== 0));
		this._super(controller, model);
		debugger;
	}
});
