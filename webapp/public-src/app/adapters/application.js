import DS from 'ember-data';
import config from 'learning/config/environment';


export default DS.ActiveModelAdapter.extend({
	host: config.host,
	namespace: config.namespace
});
