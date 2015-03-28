import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  parent: DS.belongsTo('topic', {inverse: 'children'}),

  // It's ok to store children using a separate model that
  // inherits from topics because children will always be
  // separate from prereqs
  children : DS.hasMany('child', {inverse: 'parent'}),
  edges: DS.hasMany('edge'),

  prereqs : DS.hasMany('topic'),
  links: DS.hasMany('link')

});
