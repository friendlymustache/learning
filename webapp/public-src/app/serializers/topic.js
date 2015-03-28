import DS from 'ember-data';

export default DS.RESTSerializer.extend({

	extractSingle : function(store, primaryType, rawPayload, name) {
		var id = undefined;
		for (var topic in rawPayload.topics) {
			if (topic.name == name) {
				id = topic.id;
			}
		}
		return this._super(store, primaryType, rawPayload, id);
	}
});
