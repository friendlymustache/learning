import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),
  parent: DS.belongsTo('topic'),
  topics : DS.hasMany('topic', {inverse: 'parent'}),
  edges: DS.hasMany('edge'),

  /*
  prereqs: DS.hasMany('prereq'),
  postreq: DS.hasMany('postreq'),
  */
  extraAttrs : DS.attr(),
  
  
  links: DS.hasMany('link')

});
