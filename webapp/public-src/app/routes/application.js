import Ember from 'ember';

export default Ember.Route.extend({

	model : function() {
		console.log("HEY GUYS");
	},

	actions: {
		search: function(query) {
	      this.transitionTo('results', query);
		}
	}		
});
