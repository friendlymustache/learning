import Ember from 'ember';

export default Ember.Controller.extend({
	actions: {
		search: function(query) {
	      this.transitionToRoute('results', query);
		}
	}	
});
