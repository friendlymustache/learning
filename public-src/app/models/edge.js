import DS from 'ember-data';

export default DS.Model.extend({
  prereq_id: DS.attr('number'),
  topic_id: DS.attr('number'),
  // topic: DS.belongsTo('topic')
});
