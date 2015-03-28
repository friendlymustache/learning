/* jshint ignore:start */

/* jshint ignore:end */

define('learning/adapters/application', ['exports', 'ember-data', 'learning/config/environment'], function (exports, DS, config) {

	'use strict';

	exports['default'] = DS['default'].ActiveModelAdapter.extend({
		host: config['default'].host });

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

	exports['default'] = Ember['default'].ArrayController.extend({
		actions: {
			goToResult: function goToResult(topic) {
				this.transitionToRoute("topic", topic.name);
			}
		}

	});

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
define('learning/models/child', ['exports', 'learning/models/topic'], function (exports, topic) {

	'use strict';

	exports['default'] = topic['default'].extend();

});
define('learning/models/edge', ['exports', 'ember-data'], function (exports, DS) {

  'use strict';

  exports['default'] = DS['default'].Model.extend({
    prereq_id: DS['default'].attr("string"),
    topic: DS['default'].belongsTo("topic") });

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
define('learning/models/parent', ['exports', 'learning/models/topic'], function (exports, topic) {

	'use strict';

	exports['default'] = topic['default'].extend({});

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
    links: DS['default'].hasMany("link"),

    parent: DS['default'].belongsTo("topic", { inverse: "children", async: true }),

    // It's ok to store children using a separate model that
    // inherits from topics because children will always be
    // separate from prereqs
    children: DS['default'].hasMany("topic", { inverse: "parent", async: true }),
    edges: DS['default'].hasMany("edge"),

    // prereqs : DS.hasMany('topic'),
    prereqs: (function () {
      return this.get("edges").map(function (data) {
        return this.find(data.get("prereq_id"));
      }, this);
    }).property("edges.@each") });

});
define('learning/router', ['exports', 'ember', 'learning/config/environment'], function (exports, Ember, config) {

  'use strict';

  var Router = Ember['default'].Router.extend({
    location: config['default'].locationType
  });

  Router.map(function () {
    this.route("results", { path: "/search/:query" });
    this.route("topic", { path: "/topics/:name" });
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
			controller.set("nodes_exist", model.content.length !== 0);
			this._super(controller, model);
		}
	});

});
define('learning/routes/topic', ['exports', 'ember'], function (exports, Ember) {

	'use strict';

	exports['default'] = Ember['default'].Route.extend({
		model: function model(params) {
			return this.store.find("topic", params.name);
		},

		getParentsList: function getParentsList(model) {
			var parent = model.get("parent");
			var parentId = parent.get("id");
			if (parentId === undefined) {
				return [];
			}
			var parentRecord = this.store.getById("parent", parentId);
			return this.getParentsList(parentRecord).concat([parentRecord]);
		},

		setupController: function setupController(controller, model) {
			var parentsList = this.getParentsList(model);
			this._super(controller, model);
			controller.set("parents", parentsList);
		} });

});
define('learning/serializers/topic', ['exports', 'ember-data'], function (exports, DS) {

	'use strict';

	exports['default'] = DS['default'].RESTSerializer.extend({

		extractSingle: function extractSingle(store, primaryType, rawPayload, name) {
			var id;
			for (var topic in rawPayload.topics) {
				if (topic.name === name) {
					id = topic.id;
				}
			}
			return this._super(store, primaryType, rawPayload, id);
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
        dom.setAttribute(el1,"class","ui inverted blue menu");
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","ui left floated item");
        var el3 = dom.createTextNode(" \n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createElement("i");
        dom.setAttribute(el3,"class","cloud icon");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n		");
        dom.appendChild(el2, el3);
        var el3 = dom.createTextNode("\n	");
        dom.appendChild(el2, el3);
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n	");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","ui right floated item");
        var el3 = dom.createTextNode(" Login ");
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
        var morph0 = dom.createMorphAt(dom.childAt(element0, [1]),2,3);
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
          var el2 = dom.createTextNode(" Results (double click to go to topic page) ");
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
          inline(env, morph0, context, "view", ["topic-graph"], {"nodes": get(env, context, "model")});
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
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode(" ");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode(" ");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, content = hooks.content;
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
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            content(env, morph0, context, "par.name");
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
          var el1 = dom.createTextNode("  	  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n	  ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("i");
          dom.setAttribute(el1,"class","right chevron icon divider");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
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
          var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
          block(env, morph0, context, "link-to", ["topic", get(env, context, "par.name")], {"class": "section"}, child0, null);
          return fragment;
        }
      };
    }());
    var child1 = (function() {
      var child0 = (function() {
        return {
          isHTMLBars: true,
          blockParams: 0,
          cachedFragment: null,
          hasRendered: false,
          build: function build(dom) {
            var el0 = dom.createDocumentFragment();
            var el1 = dom.createTextNode("				");
            dom.appendChild(el0, el1);
            var el1 = dom.createElement("a");
            dom.setAttribute(el1,"target","_blank");
            dom.setAttribute(el1,"class","item link");
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
          var el1 = dom.createTextNode("	    ");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","ui small header");
          var el2 = dom.createTextNode(" Links ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
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
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[3]); }
          var morph0 = dom.createMorphAt(fragment,2,3,contextualElement);
          block(env, morph0, context, "each", [get(env, context, "links")], {"keyword": "link"}, child0, null);
          return fragment;
        }
      };
    }());
    var child2 = (function() {
      var child0 = (function() {
        var child0 = (function() {
          return {
            isHTMLBars: true,
            blockParams: 0,
            cachedFragment: null,
            hasRendered: false,
            build: function build(dom) {
              var el0 = dom.createDocumentFragment();
              var el1 = dom.createTextNode(" ");
              dom.appendChild(el0, el1);
              var el1 = dom.createTextNode(" ");
              dom.appendChild(el0, el1);
              return el0;
            },
            render: function render(context, env, contextualElement) {
              var dom = env.dom;
              var hooks = env.hooks, content = hooks.content;
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
              var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
              content(env, morph0, context, "topic.name");
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
            var el1 = dom.createTextNode("			");
            dom.appendChild(el0, el1);
            var el1 = dom.createTextNode("\n");
            dom.appendChild(el0, el1);
            return el0;
          },
          render: function render(context, env, contextualElement) {
            var dom = env.dom;
            var hooks = env.hooks, get = hooks.get, block = hooks.block;
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
            var morph0 = dom.createMorphAt(fragment,0,1,contextualElement);
            block(env, morph0, context, "link-to", ["topic", get(env, context, "topic.name")], {"class": "item"}, child0, null);
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
          var el1 = dom.createTextNode("		");
          dom.appendChild(el0, el1);
          var el1 = dom.createElement("div");
          dom.setAttribute(el1,"class","ui small header");
          var el2 = dom.createTextNode(" Subtopics ");
          dom.appendChild(el1, el2);
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("\n");
          dom.appendChild(el0, el1);
          var el1 = dom.createTextNode("");
          dom.appendChild(el0, el1);
          return el0;
        },
        render: function render(context, env, contextualElement) {
          var dom = env.dom;
          var hooks = env.hooks, get = hooks.get, block = hooks.block;
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
          if (this.cachedFragment) { dom.repairClonedNode(fragment,[3]); }
          var morph0 = dom.createMorphAt(fragment,2,3,contextualElement);
          block(env, morph0, context, "each", [get(env, context, "children")], {"keyword": "topic"}, child0, null);
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
        var el1 = dom.createTextNode("\n\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","ui breadcrumb");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("  ");
        dom.appendChild(el1, el2);
        var el2 = dom.createElement("div");
        dom.setAttribute(el2,"class","active section");
        dom.appendChild(el1, el2);
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
        dom.appendChild(el0, el1);
        var el1 = dom.createTextNode("\n\n");
        dom.appendChild(el0, el1);
        var el1 = dom.createElement("div");
        dom.setAttribute(el1,"class","ui link list");
        var el2 = dom.createTextNode("\n");
        dom.appendChild(el1, el2);
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
        if (this.cachedFragment) { dom.repairClonedNode(fragment,[7]); }
        var element1 = dom.childAt(fragment, [3]);
        var element2 = dom.childAt(fragment, [5]);
        var morph0 = dom.createMorphAt(dom.childAt(fragment, [1]),0,1);
        var morph1 = dom.createMorphAt(element1,0,1);
        var morph2 = dom.createMorphAt(dom.childAt(element1, [2]),-1,-1);
        var morph3 = dom.createMorphAt(element2,0,1);
        var morph4 = dom.createMorphAt(element2,1,-1);
        var morph5 = dom.createMorphAt(fragment,6,7,contextualElement);
        content(env, morph0, context, "name");
        block(env, morph1, context, "each", [get(env, context, "parents")], {"keyword": "par"}, child0, null);
        content(env, morph2, context, "name");
        block(env, morph3, context, "if", [get(env, context, "links")], {}, child1, null);
        block(env, morph4, context, "if", [get(env, context, "children")], {}, child2, null);
        content(env, morph5, context, "outlet");
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
define('learning/tests/models/child.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/child.js should pass jshint', function() { 
    ok(true, 'models/child.js should pass jshint.'); 
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
define('learning/tests/models/parent.jshint', function () {

  'use strict';

  module('JSHint - models');
  test('models/parent.js should pass jshint', function() { 
    ok(true, 'models/parent.js should pass jshint.'); 
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
    ok(true, 'routes/results.js should pass jshint.'); 
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
    ok(true, 'serializers/topic.js should pass jshint.'); 
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
define('learning/tests/unit/models/child-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("child", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('learning/tests/unit/models/child-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/child-test.js should pass jshint', function() { 
    ok(true, 'unit/models/child-test.js should pass jshint.'); 
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
define('learning/tests/unit/models/parent-test', ['ember-qunit'], function (ember_qunit) {

  'use strict';

  ember_qunit.moduleForModel("parent", {
    // Specify the other units that are required for this test.
    needs: []
  });

  ember_qunit.test("it exists", function (assert) {
    var model = this.subject();
    // var store = this.store();
    assert.ok(!!model);
  });

});
define('learning/tests/unit/models/parent-test.jshint', function () {

  'use strict';

  module('JSHint - unit/models');
  test('unit/models/parent-test.js should pass jshint', function() { 
    ok(true, 'unit/models/parent-test.js should pass jshint.'); 
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
    ok(false, 'views/topic-graph.js should pass jshint.\nviews/topic-graph.js: line 133, col 13, \'d3\' is not defined.\nviews/topic-graph.js: line 139, col 17, \'d3\' is not defined.\n\n2 errors'); 
  });

});
define('learning/views/topic-graph', ['exports', 'ember'], function (exports, Ember) {

  'use strict';

  exports['default'] = Ember['default'].View.extend({
    attributeBindings: ["style"],
    classNames: ["topic-graph"],
    svgClassName: "topic-graph",

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

    _getNodes: function _getNodes() {
      return this.get("nodes").toArray();
    },

    getNodes: function getNodes() {
      var nodes = this._getNodes();
      var output = [];
      for (var i = 0; i < nodes.length; i++) {
        var nodeJson = nodes[i].toJSON();
        nodeJson.id = nodes[i].get("id");
        output.push(nodeJson);
      }
      return output;
    },

    getNode: function getNode(id) {
      var matchingNodes = this.getNodes().filterBy("id", id);
      return matchingNodes[0];
    },

    getIndexWithProperty: function getIndexWithProperty(array, prop, value) {
      for (var i = 0, elem; elem = array[i]; i++) {
        if (elem[prop] === value) {
          return i;
        }
      }
    },

    getEdges: function getEdges() {
      var nodes = this.getNodes();
      var nodeEdges = this.get("nodes").getEach("edges");
      var output = [];

      for (var i = 0, edgeList; edgeList = nodeEdges[i]; i++) {
        var edgeArr = edgeList.toArray();
        for (var j = 0, edge; edge = edgeArr[j]; j++) {
          var edgeJSON = edge.toJSON();
          edgeJSON.source = this.getIndexWithProperty(nodes, "id", edgeJSON.prereq_id);
          edgeJSON.target = this.getIndexWithProperty(nodes, "id", edgeJSON.topic);
          delete edgeJSON.topic;
          delete edgeJSON.prereq_id;
          output.push(edgeJSON);
        }
      }

      /*
      var edges = [];
      var output = [];
      for(var i = 0, edge; edge = edges[i]; i++) {
        edge.source = this.getNode(edge.get('prereq_id'));
        edge.target = this.getNode(edge.get('topic.id'));
         if (this.validateEdge(edge)) {
          output.push(edge);
        }
       }
      */
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
      var width = this.get("width"),
          height = this.get("height");

      var svg = this.get("svg");
      if (svg === undefined) {
        var svgClass = this.getClassName(this.get("svgClassName"));
        svg = d3.select(svgClass).append("svg").attr("width", width).attr("height", height);
        this.set("svg", svg);
      }

      var force = d3.layout.force().gravity(0.05).distance(100).charge(-100).size([width, height]);

      force.nodes(nodes).links(edges).start();

      var link = svg.selectAll(".link").data(edges).enter().append("line").attr("class", "link");

      var node = svg.selectAll(".node").data(nodes).enter().append("g").attr("class", "node").call(force.drag);

      node.append("circle").attr("x", -8).attr("y", -8).attr("class", "node").attr("r", 5).on("dblclick", function (d) {
        context.goToResult(d);
      });

      node.append("text").attr("dx", 12).attr("dy", ".35em").text(function (d) {
        return d.name;
      }).on("dblclick", function (d) {
        context.goToResult(d);
      });

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

        node.attr("transform", function (d) {
          return "translate(" + d.x + "," + d.y + ")";
        });
      });
    },

    goToResult: function goToResult(topic) {
      this.get("controller").send("goToResult", topic);
    },

    updateGraph: (function () {
      var nodes = this.getNodes();
      this.clearGraph();
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
  require("learning/app")["default"].create({"name":"learning","version":"0.0.0.8103c59e"});
}

/* jshint ignore:end */
//# sourceMappingURL=learning.map