import DS from 'ember-data';

export default DS.RESTSerializer.extend({

	extractArray: function(store, primaryType, rawPayload) {
		var map = Ember.ArrayPolyfills.map;
	    var payload = this.normalizePayload(rawPayload);
	    var primaryTypeName = primaryType.typeKey;
	    var outputArrays = {};
	    var primaryArray;

	    for (var prop in payload) {
	      var typeKey = prop;
	      var forcedSecondary = false;

	      if (prop.charAt(0) === '_') {
	        forcedSecondary = true;
	        typeKey = prop.substr(1);
	      }

	      var typeName = this.typeForRoot(typeKey);
	      if (!store.modelFactoryFor(typeName)) {
	        Ember.warn(this.warnMessageNoModelForKey(prop, typeName), false);
	        continue;
	      }
	      var type = store.modelFor(typeName);
	      var typeSerializer = store.serializerFor(type);
	      var isPrimary = (!forcedSecondary && (type.typeKey === primaryTypeName));

	      /*jshint loopfunc:true*/
	      var normalizedArray = map.call(payload[prop], function(hash) {
	        return typeSerializer.normalize(type, hash, prop);
	      }, this);

	      if (isPrimary) {
	        primaryArray = normalizedArray;
	        outputArrays.primary = primaryArray;
	      } else {
	        store.pushMany(typeName, normalizedArray);
	        outputArrays[typeName] = normalizedArray;
	      }
	    }

	    // return primaryArray;
	    return [{id: -1, link_ids : [], edge_ids: [], extraAttrs: outputArrays}];
	  },

	extractSingle : function(store, primaryType, rawPayload, id) {
		return this._super(store, primaryType, rawPayload, id);
	},

	normalizePayload: function(payload) {
		return this._super(payload);

		/* Add IDs to edges. Commented out for now, in favor
		 * of just using provided implementation
		 */

		/*
		var incoming_edges = payload.incoming_edges;
		var topics = payload.topics;

		// Dict mapping topic ids to edges ending at those
		// topics (edges we should follow to get the topic's prereqs)
		var topic_id_to_edges = {};

		// Assign each incoming_edge an ID for Ember's sake,
		// set its postreq_id field to topic_id
		if (incoming_edges !== undefined) {
			for(var i = 0; i < incoming_edges.length; i++) {
				var edge = payload.incoming_edges[i];
				var topic_id = edge.postreq_id;

				edge.id = i + 1;
				edge.topic_id = topic_id;

				if (topic_id_to_edges[topic_id] !== undefined) {
					topic_id_to_edges[topic_id].push(edge.id);
				}
				else {
					topic_id_to_edges[topic_id] = [edge.id];
				}

				delete edge.postreq_id;
			}
		}


		if (topics !== undefined) {
			for(var topic, i = 0; topic = topics[i]; i++) {
				topic.edge_ids = topic_id_to_edges[topic.id];
				delete topic.incoming_edge_ids;
			}
		}

		payload.edges = payload.incoming_edges;
		delete payload.incoming_edges;
		// debugger;		
		return payload;
		*/
	},
});
