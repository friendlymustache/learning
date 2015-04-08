import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

Router.map(function() {
  this.route('results', {path: '/search/:query'});
  this.route('topic', {path: "/topics/:name"});
});

export default Router;
