import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  links: DS.hasMany('link'),


  parent: DS.belongsTo('topic', {inverse: 'children', async: true}),

  // It's ok to store children using a separate model that
  // inherits from topics because children will always be
  // separate from prereqs
  children : DS.hasMany('topic', {inverse: 'parent', async: true}),
  edges: DS.hasMany('edge'),

  // prereqs : DS.hasMany('topic'),
  prereqs : (function() {
    return this.get('edges').map(function(data) {
      debugger;
      return this.find(data.get('prereq_id'));
    }, this);
  }).property('edges.@each'),

});
