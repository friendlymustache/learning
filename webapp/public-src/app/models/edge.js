import DS from 'ember-data';

export default DS.Model.extend({
  prereq_id: DS.attr('string'),
  topic: DS.belongsTo('topic'),
});
