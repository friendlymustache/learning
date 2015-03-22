import DS from 'ember-data';

export default DS.Model.extend({
  name: DS.attr('string'),

  // Specify the inverse relation for prereqs as postreqs
  prereqs: DS.hasMany('prereq'),
  postreq: DS.hasMany('postreq'),
  links: DS.hasMany('link')

});
