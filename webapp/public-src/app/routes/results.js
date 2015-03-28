import Ember from 'ember';

export default Ember.Route.extend({
	model: function(params) {
		return this.store.find('topic', {name: params.query});
	},

	setupController : function(controller, model) {
		controller.set('nodes_exist', (model.content.length != 0));
		this._super(controller, model);
	}
});
