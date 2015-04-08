import Ember from 'ember';

export default Ember.Route.extend({
	actions: {
		search: function(query) {
	      this.transitionTo('results', query);
		}
	}		
});
