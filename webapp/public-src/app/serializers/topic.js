import DS from 'ember-data';

export default DS.RESTSerializer.extend({

	extractSingle : function(store, primaryType, rawPayload, name) {
		var id = undefined;
		for (var topic in rawPayload.topics) {
			if (topic.name == name) {
				id = topic.id;
			}
		}
		return this._extractSingle(store, primaryType, rawPayload, id);
	},

	_extractSingle :  function(store, primaryType, rawPayload, recordId) {

		var forEach = Ember.ArrayPolyfills.forEach;
		var map = Ember.ArrayPolyfills.map;
		var camelize = Ember.String.camelize;

	    var payload = this.normalizePayload(rawPayload);
	    var primaryTypeName = primaryType.typeKey;
	    var primaryRecord;

	    for (var prop in payload) {
	      var typeName  = this.typeForRoot(prop);

	      if (!store.modelFactoryFor(typeName)) {
	        Ember.warn(this.warnMessageNoModelForKey(prop, typeName), false);
	        continue;
	      }
	      var type = store.modelFor(typeName);
	      var isPrimary = type.typeKey === primaryTypeName;
	      var value = payload[prop];

	      if (value === null) {
	        continue;
	      }

	      // legacy support for singular resources
	      if (isPrimary && Ember.typeOf(value) !== "array" ) {
	        primaryRecord = this.normalize(primaryType, value, prop);
	        continue;
	      }

	      /*jshint loopfunc:true*/
	      forEach.call(value, function(hash) {
	        var typeName = this.typeForRoot(prop);
	        var type = store.modelFor(typeName);
	        var typeSerializer = store.serializerFor(type);

	        hash = typeSerializer.normalize(type, hash, prop);

	        var isFirstCreatedRecord = isPrimary && !recordId && !primaryRecord;
	        var isUpdatedRecord = isPrimary && coerceId(hash.id) === recordId;

	        // debugger;
	        // find the primary record.
	        //
	        // It's either:
	        // * the record with the same ID as the original request
	        // * in the case of a newly created record that didn't have an ID, the first
	        //   record in the Array
	        if (isFirstCreatedRecord || isUpdatedRecord) {
	          primaryRecord = hash;
	        } else {
	          store.push(typeName, hash);
	        }
	      }, this);
	    }

	    return primaryRecord;
  	},														

});
