/* jshint ignore:start */

/* jshint ignore:end */

define('learning/adapters/application', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	exports['default'] = DS['default'].ActiveModelAdapter.extend({
		host: "http://localhost:3000" });

});
define('learning/app', ['exports', 'ember', 'ember/resolver', 'ember/load-initializers', 'learning/config/environment'], function (exports, Ember, Resolver, loadInitializers, config) {

  'use strict';

  Ember['default'].MODEL_FACTORY_INJECTIONS = true;

  var App = Ember['default'].Application.extend({
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix,
    Resolver: Resolver['default']
  });

  loadInitializers['default'](App, config['default'].modulePrefix);

  exports['default'] = App;

});
define('learning/controllers/application', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Controller.extend({
		actions: {
			search: function search(query) {
				this.transitionToRoute("results", query);
			}
		}
	});

});
define('learning/controllers/results', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].ArrayController.extend({});

});
define('learning/initializers/app-version', ['exports', 'learning/config/environment', 'ember'], function (exports, config, Ember) {

  'use strict';

  var classify = Ember['default'].String.classify;

  exports['default'] = {
    name: "App Version",
    initialize: function initialize(container, application) {
      var appName = classify(application.toString());
      Ember['default'].libraries.register(appName, config['default'].APP.version);
    }
  };

});
define('learning/initializers/export-application-global', ['exports', 'ember', 'learning/config/environment'], function (exports, Ember, config) {

  'use strict';

  exports.initialize = initialize;

  function initialize(container, application) {
    var classifiedName = Ember['default'].String.classify(config['default'].modulePrefix);

    if (config['default'].exportApplicationGlobal && !window[classifiedName]) {
      window[classifiedName] = application;
    }
  }

  ;

  exports['default'] = {
    name: "export-application-global",

    initialize: initialize
  };

});
define('learning/models/edge', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    prereq_id: DS['default'].attr("number"),
    topic_id: DS['default'].attr("number") });

  // topic: DS.belongsTo('topic')

});
define('learning/models/incoming-edge', ['exports', 'learning/models/edge'], function (exports, edge) {

	'use strict';

	exports['default'] = edge['default'].extend();

});
define('learning/models/link', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    title: DS['default'].attr("string"),
    url: DS['default'].attr("string")
  });

});
define('learning/models/postreq', ['exports', 'learning/models/topic'], function (exports, topic) {

	'use strict';

	exports['default'] = topic['default'].extend({});

});
define('learning/models/prereq', ['exports', 'learning/models/topic'], function (exports, topic) {

	'use strict';

	exports['default'] = topic['default'].extend({});

});
define('learning/models/topic', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    name: DS['default'].attr("string"),
    parent: DS['default'].belongsTo("topic"),
    edges: DS['default'].hasMany("edge"),

    prereqs: DS['default'].hasMany("prereq"),
    postreq: DS['default'].hasMany("postreq"),
    extraAttrs: DS['default'].attr(),

    links: DS['default'].hasMany("link")

  });

});
define('learning/router', ['exports', 'ember', 'learning/config/environment'], function (exports, Ember, config) {

  'use strict';

  var Router = Ember['default'].Router.extend({
    location: config['default'].locationType
  });

  Router.map(function () {
    this.route("results", { path: "/search/:query" });
    this.route("topic", { path: "/:name" });
  });

  exports['default'] = Router;

});
define('learning/routes/application', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({});

});
define('learning/routes/results', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({
		model: function model(params) {
			return this.store.find("topic", { name: params.query });
		},

		setupController: function setupController(controller, model) {

			var nodes = [];

			var names = model.getEach("name");
			var ids = model.getEach("ids");

			for (var i = 0; i < names.length; i++) {
				nodes.push({ name: names[i], id: ids[i] });
			}

			var extraAttrs = model.getEach("extraAttrs")[0];
			var links = extraAttrs.link;
			var edges = extraAttrs.edge;
			var topics = extraAttrs.primary;
			controller.set("nodes_exist", topics.length != 0);

			this._super(controller, topics);
			controller.set("graph_nodes", topics);
			controller.set("graph_edges", edges);
		}
	});

});
define('learning/routes/topic', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({
		model: function model(params) {
			return this.store.find("topic", params.name);
		} });

});
define('learning/serializers/topic', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	exports['default'] = DS['default'].RESTSerializer.extend({

		extractArray: function extractArray(store, primaryType, rawPayload) {
			var map = Ember.ArrayPolyfills.map;
			var payload = this.normalizePayload(rawPayload);
			var primaryTypeName = primaryType.typeKey;
			var outputArrays = {};
			var primaryArray;

			for (var prop in payload) {
				var typeKey = prop;
				var forcedSecondary = false;

				if (prop.charAt(0) === "_") {
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
				var isPrimary = !forcedSecondary && type.typeKey === primaryTypeName;

				/*jshint loopfunc:true*/
				var normalizedArray = map.call(payload[prop], function (hash) {
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
			return [{ id: 300, name: "Topic.js serializer", link_ids: [], edge_ids: [], extraAttrs: outputArrays }];
		},

		normalizePayload: function normalizePayload(payload) {

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
		} });

});
define('learning/templates/application', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createTextNode(" Cumulus ");
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","ui inverted menu");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","ui left floated item");
        var el3 = dom.createTextNode(" ");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode(" ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","ui right floated item");
        var el3 = dom.createTextNode(" Right menu ");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("form");
        dom.setAttribute(el2,"class","ui item centered form");
        dom.setAttribute(el2,"style","width: 50%");
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("div");
        dom.setAttribute(el3,"class","ui small left icon input");
        var el4 = dom.createTextNode("\n		  ");
        dom.appendChild(el3, el4);
        var el4 = dom.createElement("i");
        dom.setAttribute(el4,"class","search icon");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("\n		  ");
        dom.appendChild(el3, el4);
        var el4 = dom.createTextNode("	\n		");
        dom.appendChild(el3, el4);
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","ui centered page grid");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","sixteen wide column");
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, block = hooks.block, get = hooks.get, element = hooks.element, inline = hooks.inline, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var element0 = dom.childAt(fragment, [0]);
        var element1 = dom.childAt(element0, [5]);
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),0,1);
        var morph1 = dom.createMorphAt(dom.childAt(element1, [1]),2,3);
        var morph2 = dom.createMorphAt(dom.childAt(fragment, [2, 1]),0,1);
        block(env, morph0, context, "link-to", ["index"], {}, child0, null);
        element(env, element1, context, "action", ["search", get(env, context, "query")], {"on": "submit"});
        inline(env, morph1, context, "input", [], {"class": "ui left icon", "value": get(env, context, "query"), "placeholder": "What do you want to learn?"});
        content(env, morph2, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('learning/templates/components/topic-graph', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createElement("div");
        dom.setAttribute(el0,"class","topic-graph");
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        return fragment;
      }
    };
  }()));

});
define('learning/templates/results', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("	");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","ui header");
          var el2 = dom.createTextNode(" Results ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n	");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode(" \n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, inline = hooks.inline;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var morph0 = dom.createMorphAt(fragment,2,3,contextualElement);
          inline(env, morph0, context, "view", ["topic-graph"], {"nodes": get(env, context, "graph_nodes"), "edges": get(env, context, "graph_edges")});
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("	");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","ui header");
          var el2 = dom.createTextNode(" No results ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","ui segment");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, get = hooks.get, block = hooks.block, content = hooks.content;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [0]),0,-1);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [2]),0,1);
        block(env, morph0, context, "if", [get(env, context, "nodes_exist")], {}, child0, child1);
        content(env, morph1, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('learning/templates/topic', ['exports'], function (exports) {

  'use strict';

  exports['default'] = Ember.HTMLBars.template((function() {
    var child0 = (function() {
      return {
        isHTMLBars: true,
        blockParams: 0,
        cachedFragment: null,
        hasRendered: false,
        build: function build(dom) {
          var el0 = dom.createDocumentFragment();
          var el1 = dom.createTextNode("			");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("a");
          dom.setAttribute(el1,"target","_blank");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, element = hooks.element, content = hooks.content;
          dom.detectNamespace(contextualElement);
          var fragment;
          if (env.useFragmentCache && dom.canClone) {
            if (this.cachedFragment === null) {
              fragment = this.build(dom);
              if (this.hasRendered) {
                this.cachedFragment = fragment;
              } else {
                this.hasRendered = true;
              }
            }
            if (this.cachedFragment) {
              fragment = dom.cloneNode(this.cachedFragment, true);
            }
          } else {
            fragment = this.build(dom);
          }
          var element0 = dom.childAt(fragment, [1]);
          var morph0 = dom.createMorphAt(element0,-1,-1);
          element(env, element0, context, "bind-attr", [], {"href": "link.url"});
          content(env, morph0, context, "link.title");
          return fragment;
        }
      };
    }());
    return {
      isHTMLBars: true,
      blockParams: 0,
      cachedFragment: null,
      hasRendered: false,
      build: function build(dom) {
        var el0 = dom.createDocumentFragment();
        var el1 = dom.createTextNode("\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","ui centered header");
        var el2 = dom.createTextNode(" ");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode(" ");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","ui link list");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("");
        dom.appendChild(el0, el1);
        return el0;
      },
      render: function render(context, env, contextualElement) {
        var dom = env.dom;
        var hooks = env.hooks, content = hooks.content, get = hooks.get, block = hooks.block;
        dom.detectNamespace(contextualElement);
        var fragment;
        if (env.useFragmentCache && dom.canClone) {
          if (this.cachedFragment === null) {
            fragment = this.build(dom);
            if (this.hasRendered) {
              this.cachedFragment = fragment;
            } else {
              this.hasRendered = true;
            }
          }
          if (this.cachedFragment) {
            fragment = dom.cloneNode(this.cachedFragment, true);
          }
        } else {
          fragment = this.build(dom);
        }
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[5]); }
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
        var morph1 = dom.createMorphAt(dom.childAt(fragment, [3]),0,-1);
        var morph2 = dom.createMorphAt(fragment,4,5,contextualElement);
        content(env, morph0, context, "name");
        block(env, morph1, context, "each", [get(env, context, "links")], {"keyword": "link"}, child0, null);
        content(env, morph2, context, "outlet");
        return fragment;
      }
    };
  }()));

});
define('learning/tests/adapters/application.jshint', function () {

  'use strict';

  module('JSHint - adapters');
  test('adapters/application.js should pass jshint', function() { 
    ok(true, 'adapters/application.js should pass jshint.'); 
  });

});
define('learning/tests/app.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('app.js should pass jshint', function() { 
    ok(true, 'app.js should pass jshint.'); 
  });

});
define('learning/tests/controllers/application.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/application.js should pass jshint', function() { 
    ok(true, 'controllers/application.js should pass jshint.'); 
  });

});
define('learning/tests/controllers/results.jshint', function () {

  'use strict';

  module('JSHint - controllers');
  test('controllers/results.js should pass jshint', function() { 
    ok(true, 'controllers/results.js should pass jshint.'); 
  });

});
define('learning/tests/helpers/resolver', ['exports', 'ember/resolver', 'learning/config/environment'], function (exports, Resolver, config) {

  'use strict';

  var resolver = Resolver['default'].create();

  resolver.namespace = {
    modulePrefix: config['default'].modulePrefix,
    podModulePrefix: config['default'].podModulePrefix
  };

  exports['default'] = resolver;

});
define('learning/tests/helpers/resolver.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/resolver.js should pass jshint', function() { 
    ok(true, 'helpers/resolver.js should pass jshint.'); 
  });

});
define('learning/tests/helpers/start-app', ['exports', 'ember', 'learning/app', 'learning/router', 'learning/config/environment'], function (exports, Ember, Application, Router, config) {

  'use strict';



  exports['default'] = startApp;
  function startApp(attrs) {
    var application;

    var attributes = Ember['default'].merge({}, config['default'].APP);
    attributes = Ember['default'].merge(attributes, attrs); // use defaults, but you can override;

    Ember['default'].run(function () {
      application = Application['default'].create(attributes);
      application.setupForTesting();
      application.injectTestHelpers();
    });

    return application;
  }

});
define('learning/tests/helpers/start-app.jshint', function () {

  'use strict';

  module('JSHint - helpers');
  test('helpers/start-app.js should pass jshint', function() { 
    ok(true, 'helpers/start-app.js should pass jshint.'); 
  });

});
define('learning/tests/models/edge.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/edge.js should pass jshint', function() { 
    ok(true, 'models/edge.js should pass jshint.'); 
  });

});
define('learning/tests/models/incoming-edge.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/incoming-edge.js should pass jshint', function() { 
    ok(true, 'models/incoming-edge.js should pass jshint.'); 
  });

});
define('learning/tests/models/link.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/link.js should pass jshint', function() { 
    ok(true, 'models/link.js should pass jshint.'); 
  });

});
define('learning/tests/models/postreq.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/postreq.js should pass jshint', function() { 
    ok(true, 'models/postreq.js should pass jshint.'); 
  });

});
define('learning/tests/models/prereq.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/prereq.js should pass jshint', function() { 
    ok(true, 'models/prereq.js should pass jshint.'); 
  });

});
define('learning/tests/models/topic.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/topic.js should pass jshint', function() { 
    ok(true, 'models/topic.js should pass jshint.'); 
  });

});
define('learning/tests/router.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('router.js should pass jshint', function() { 
    ok(true, 'router.js should pass jshint.'); 
  });

});
define('learning/tests/routes/application.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/application.js should pass jshint', function() { 
    ok(true, 'routes/application.js should pass jshint.'); 
  });

});
define('learning/tests/routes/results.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/results.js should pass jshint', function() { 
    ok(false, 'routes/results.js should pass jshint.\nroutes/results.js: line 24, col 56, Expected \'!==\' and instead saw \'!=\'.\nroutes/results.js: line 21, col 13, \'links\' is defined but never used.\n\n2 errors'); 
  });

});
define('learning/tests/routes/topic.jshint', function () {

  'use strict';

  module('JSHint - routes');
  test('routes/topic.js should pass jshint', function() { 
    ok(true, 'routes/topic.js should pass jshint.'); 
  });

});
define('learning/tests/serializers/topic.jshint', function () {

  'use strict';

  module('JSHint - serializers');
  test('serializers/topic.js should pass jshint', function() { 
    ok(false, 'serializers/topic.js should pass jshint.\nserializers/topic.js: line 6, col 19, \'Ember\' is not defined.\nserializers/topic.js: line 23, col 13, \'Ember\' is not defined.\n\n2 errors'); 
  });

});
define('learning/tests/test-helper', ['learning/tests/helpers/resolver', 'ember-qunit'], function (resolver, ember_qunit) {

	'use strict';

	ember_qunit.setResolver(resolver['default']);

});
define('learning/tests/test-helper.jshint', function () {

  'use strict';

  module('JSHint - .');
  test('test-helper.js should pass jshint', function() { 
    ok(true, 'test-helper.js should pass jshint.'); 
  });

});
define('learning/tests/unit/adapters/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("adapter:application", "ApplicationAdapter", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var adapter = this.subject();
    assert.ok(adapter);
  });

  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']

});
define('learning/tests/unit/adapters/application-test.jshint', function () {

  'use strict';

  module('JSHint - unit/adapters');
  test('unit/adapters/application-test.js should pass jshint', function() { 
    ok(true, 'unit/adapters/application-test.js should pass jshint.'); 
  });

});
define('learning/tests/unit/controllers/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:application", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('learning/tests/unit/controllers/application-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/application-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/application-test.js should pass jshint.'); 
  });

});
define('learning/tests/unit/controllers/results-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:results", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('learning/tests/unit/controllers/results-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/results-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/results-test.js should pass jshint.'); 
  });

});
define('learning/tests/unit/controllers/topics-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("controller:topics", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var controller = this.subject();
    assert.ok(controller);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('learning/tests/unit/controllers/topics-test.jshint', function () {

  'use strict';

  module('JSHint - unit/controllers');
  test('unit/controllers/topics-test.js should pass jshint', function() { 
    ok(true, 'unit/controllers/topics-test.js should pass jshint.'); 
  });

});
define('learning/tests/unit/models/edge-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("edge", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('learning/tests/unit/models/edge-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/edge-test.js should pass jshint', function() { 
    ok(true, 'unit/models/edge-test.js should pass jshint.'); 
  });

});
define('learning/tests/unit/models/incoming-edge-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("incoming-edge", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('learning/tests/unit/models/incoming-edge-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/incoming-edge-test.js should pass jshint', function() { 
    ok(true, 'unit/models/incoming-edge-test.js should pass jshint.'); 
  });

});
define('learning/tests/unit/models/link-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("link", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('learning/tests/unit/models/link-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/link-test.js should pass jshint', function() { 
    ok(true, 'unit/models/link-test.js should pass jshint.'); 
  });

});
define('learning/tests/unit/models/postreq-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("postreq", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('learning/tests/unit/models/postreq-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/postreq-test.js should pass jshint', function() { 
    ok(true, 'unit/models/postreq-test.js should pass jshint.'); 
  });

});
define('learning/tests/unit/models/prereq-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("prereq", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('learning/tests/unit/models/prereq-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/prereq-test.js should pass jshint', function() { 
    ok(true, 'unit/models/prereq-test.js should pass jshint.'); 
  });

});
define('learning/tests/unit/models/topic-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("topic", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('learning/tests/unit/models/topic-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/topic-test.js should pass jshint', function() { 
    ok(true, 'unit/models/topic-test.js should pass jshint.'); 
  });

});
define('learning/tests/unit/routes/application-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:application", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('learning/tests/unit/routes/application-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/application-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/application-test.js should pass jshint.'); 
  });

});
define('learning/tests/unit/routes/index-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:index", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('learning/tests/unit/routes/index-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/index-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/index-test.js should pass jshint.'); 
  });

});
define('learning/tests/unit/routes/search/results-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:search/results", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('learning/tests/unit/routes/search/results-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes/search');
  test('unit/routes/search/results-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/search/results-test.js should pass jshint.'); 
  });

});
define('learning/tests/unit/routes/topic-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:topic", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('learning/tests/unit/routes/topic-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/topic-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/topic-test.js should pass jshint.'); 
  });

});
define('learning/tests/unit/routes/topics-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("route:topics", {});

  ember_qunit.test("it exists", function (assert) {
    var route = this.subject();
    assert.ok(route);
  });

  // Specify the other units that are required for this test.
  // needs: ['controller:foo']

});
define('learning/tests/unit/routes/topics-test.jshint', function () {

  'use strict';

  module('JSHint - unit/routes');
  test('unit/routes/topics-test.js should pass jshint', function() { 
    ok(true, 'unit/routes/topics-test.js should pass jshint.'); 
  });

});
define('learning/tests/unit/serializers/topic-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("serializer:topic", {});

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var serializer = this.subject();
    assert.ok(serializer);
  });

  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']

});
define('learning/tests/unit/serializers/topic-test.jshint', function () {

  'use strict';

  module('JSHint - unit/serializers');
  test('unit/serializers/topic-test.js should pass jshint', function() { 
    ok(true, 'unit/serializers/topic-test.js should pass jshint.'); 
  });

});
define('learning/tests/unit/views/topic-graph-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleFor("view:topic-graph");

  // Replace this with your real tests.
  ember_qunit.test("it exists", function (assert) {
    var view = this.subject();
    assert.ok(view);
  });

});
define('learning/tests/unit/views/topic-graph-test.jshint', function () {

  'use strict';

  module('JSHint - unit/views');
  test('unit/views/topic-graph-test.js should pass jshint', function() { 
    ok(true, 'unit/views/topic-graph-test.js should pass jshint.'); 
  });

});
define('learning/tests/views/topic-graph.jshint', function () {

  'use strict';

  module('JSHint - views');
  test('views/topic-graph.js should pass jshint', function() { 
    ok(false, 'views/topic-graph.js should pass jshint.\nviews/topic-graph.js: line 43, col 7, Bad line breaking before \'&&\'.\nviews/topic-graph.js: line 83, col 17, \'d3\' is not defined.\nviews/topic-graph.js: line 86, col 17, \'d3\' is not defined.\nviews/topic-graph.js: line 95, col 13, \'d3\' is not defined.\nviews/topic-graph.js: line 83, col 9, \'color\' is defined but never used.\nviews/topic-graph.js: line 124, col 9, \'node\' is defined but never used.\nviews/topic-graph.js: line 132, col 9, \'labels\' is defined but never used.\nviews/topic-graph.js: line 121, col 41, \'d\' is defined but never used.\n\n8 errors'); 
  });

});
define('learning/views/topic-graph', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].View.extend({
    attributeBindings: ["style"],
    style: "width: 960px; height: 500px;",
    classNames: ["topic-graph"],

    setDimensions: function setDimensions() {

      var defaultWidth = 700;
      var defaultHeight = 300;

      var heightString = "width: " + defaultWidth + "px; ";
      var widthString = "height: " + defaultHeight + "px;";

      var width = this.get("width");
      var height = this.get("height");

      if (width !== undefined) {
        widthString = "width: " + width + "px; ";
      } else {
        this.set("width", defaultWidth);
      }

      if (height !== undefined) {
        heightString = "height: " + height + "px;";
      } else {
        this.set("height", defaultHeight);
      }

      var style = widthString + heightString;
      this.set("style", style);
    },

    isArray: function isArray(obj) {
      return Object.prototype.toString.call(obj) === "[object Array]";
    },

    validateEdge: function validateEdge(edge) {
      return edge.source !== undefined && edge.target !== undefined && edge.source !== null && edge.target !== null;
    },

    getNodes: function getNodes() {
      return this.get("nodes");
    },

    getNode: function getNode(id) {
      return this.getNodes().filterBy("id", id)[0];
    },

    getEdges: function getEdges() {
      var edges = this.get("edges");
      var output = [];
      for (var i = 0, edge; edge = edges[i]; i++) {
        edge.source = this.getNode(edge.prereq_id);
        edge.target = this.getNode(edge.topic_id);

        if (this.validateEdge(edge)) {
          output.push(edge);
        }
      }
      return output;
    },

    getClassName: function getClassName(name) {
      return "." + name;
    },

    clearGraph: function clearGraph() {
      var svg = this.get("svg");
      if (svg !== undefined) {
        svg.selectAll("*").remove();
      }
    },

    drawGraph: function drawGraph(nodes, edges, context) {
      var width = context.get("width"),
          height = context.get("height");
      var color = d3.scale.category20();
      var svgClassName = "root-svg";

      var force = d3.layout.force().charge(-200).gravity(0.05 * Math.log(nodes.length)).linkDistance(30).size([width, height]);

      var svg = this.get("svg");
      if (svg === undefined) {
        svg = d3.select(".topic-graph").append("svg").attr("width", width).attr("height", height).attr("class", svgClassName);
        this.set("svg", svg);
      }

      force.nodes(nodes).links(edges).start();
      console.log("Started animation");

      var gnodes = svg.selectAll("g.gnode").data(nodes).enter().append("g").classed("gnode", true);
      console.log("Added groups");

      var link = svg.selectAll(".link").data(edges).enter().append("line").attr("class", "link").style("stroke-width", function (d) {
        return 3; /* Math.sqrt(d.value); */
      });

      console.log("Added links");
      var node = gnodes.append("circle").attr("class", "node").attr("r", 5)
      //.style("fill", function(d) { return color(d.group); })
      .call(force.drag);

      console.log("Added circles");

      var labels = gnodes.append("text").text(function (d) {
        return d.name;
      });

      console.log("Added labels");

      force.on("tick", function () {
        link.attr("x1", function (d) {
          return d.source.x;
        }).attr("y1", function (d) {
          return d.source.y;
        }).attr("x2", function (d) {
          return d.target.x;
        }).attr("y2", function (d) {
          return d.target.y;
        });

        gnodes.attr("transform", function (d) {
          return "translate(" + [d.x, d.y] + ")";
        });
      });
    },

    updateGraph: (function () {
      var nodes = this.getNodes();

      if (nodes.length > 0) {
        this.drawGraph(this.getNodes(), this.getEdges(), this);
      }
    }).observes("nodes", "edges"),

    didInsertElement: function didInsertElement() {
      this.setDimensions();
      this.drawGraph(this.getNodes(), this.getEdges(), this);
    }
  });

});
/* jshint ignore:start */

/* jshint ignore:end */

/* jshint ignore:start */

define('learning/config/environment', ['ember'], function(Ember) {
  var prefix = 'learning';
/* jshint ignore:start */

try {
  var metaName = prefix + '/config/environment';
  var rawConfig = Ember['default'].$('meta[name="' + metaName + '"]').attr('content');
  var config = JSON.parse(unescape(rawConfig));

  return { 'default': config };
}
catch(err) {
  throw new Error('Could not read config from meta tag with name "' + metaName + '".');
}

/* jshint ignore:end */

});

if (runningTests) {
  require("learning/tests/test-helper");
} else {
  require("learning/app")["default"].create({"name":"learning","version":"0.0.0.5cea0b37"});
}

/* jshint ignore:end */
//# sourceMappingURL=learning.map