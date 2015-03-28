import Ember from 'ember';

export default Ember.Route.extend({
	model: function(params) {
		return this.store.find('topic', params.name);
	},

	afterModel : function(model) {
		debugger;
	},
});
