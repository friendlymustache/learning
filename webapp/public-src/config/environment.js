/* jshint node: true */

module.exports = function(environment) {

  var ENV = {
    namespace:'v/1',
    modulePrefix: 'learning',
    environment: environment,
    baseURL:'/v1',
    locationType: 'hash',
    EmberENV: {
      FEATURES: {
        // Here you can enable experimental features on an ember canary build
        // e.g. 'with-controller': true
      }
    },

    APP: {
      // Here you can pass flags/options to your application instance
      // when it is created
    }
  };


  if (environment === 'development') {
    // ENV.APP.LOG_RESOLVER = true;
    // ENV.APP.LOG_ACTIVE_GENERATION = true;
    // ENV.APP.LOG_TRANSITIONS = true;
    // ENV.APP.LOG_TRANSITIONS_INTERNAL = true;
    // ENV.APP.LOG_VIEW_LOOKUPS = true;
    ENV.host = 'http://localhost:3000';
  }

  if (environment === 'test') {
    // Testem prefers this...
    ENV.baseURL = '/';
    ENV.locationType = 'none';

    // keep test console output quieter
    ENV.APP.LOG_ACTIVE_GENERATION = false;
    ENV.APP.LOG_VIEW_LOOKUPS = false;

    ENV.APP.rootElement = '#ember-testing';
  }

  if (environment === 'production') {
    ENV.host = 'http://cumulus-beta.herokuapp.com';
  }

  if (environment === 'staging') {
    ENV.host = 'http://cumulus-staging.herokuapp.com';
  }

  /*
  if (process.env !== undefined) {
    console.log("Old base url: " + ENV.baseURL 
      + "new base URL: " + process.env.baseURL);
    ENV.baseURL = process.env.baseURL;
  }

  console.log("Final value of baseURL:'/v1',
  */
  return ENV;
};
