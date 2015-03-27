import Ember from 'ember';

export default Ember.ArrayController.extend({
	actions : {
		goToResult : function(topic) {
			this.transitionToRoute('topic', topic.name);
		}
	}

});
