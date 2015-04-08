import Ember from 'ember';

export default Ember.ObjectController.extend({

	// Takes an object representing a list of children and filters out
	// children with duplicate names
	// Takes an object representing a list of children and filters out
	// children with duplicate names
	filterChildren : function(children) {
		this.set('nameHash', {});
		return children.filter(function(child) {
			var nameHash = this.get('nameHash');
			var name = child.get('name');
			var result = (nameHash[name] === undefined);
			nameHash[name] = true;
			return result;
		}, this);
	},


	displayChildren : function() {
		var children = this.get('model.children');
		displayChildren = [];
		if (children !== undefined) {
			var displayChildren = this.filterChildren(children);
			debugger;
		}
		return displayChildren;		
	}.property('model', 'model.children')
});
