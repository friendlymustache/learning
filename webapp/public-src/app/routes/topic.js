import Ember from 'ember';

export default Ember.Route.extend({
	model: function(params) {
		return this.store.find('topic', params.name);
	},

	getParentsList : function(model) {
		var parent = model.get('parent');
		var parentId = parent.get('id');
		if (parentId === undefined) {
			return [];
		}
		var parentRecord = this.store.getById('parent', parentId);				
		return this.getParentsList(parentRecord).concat([parentRecord]);
	},

	setupController : function(controller, model) {
		var parentsList = this.getParentsList(model);
		this._super(controller, model);
		controller.set('parents', parentsList);
	},
});
