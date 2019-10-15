const express = require('express');
const bodyParser = require('body-parser');
const Boom = require('@hapi/boom');
const merge = require('merge');
const handlers = require('./handlers');

function notImplemented(req, res, next) {
  return next(Boom.notImplemented());
}

const defaultOptions = {
  port: 8081,
  context: '/api/v1',
  maxRequestBodySize: '5mb',
  errorHandlers: { enabled: true, debug: false},
  preMount: undefined,
  endpoints: {
    users: {
      getUser: notImplemented,
      getUsers: notImplemented,
      postUser: notImplemented
    },
    services: {
      getServices: notImplemented,
      getService: notImplemented,
      createService: notImplemented,
      updateService: notImplemented
    }  
  },
  postMount: undefined
};
  
function mountEndpoints(server) {
  // Mount middleware
  server.app.use(bodyParser.json({ limit: server.options.maxRequestBodySize }));

  const route = (resource, callback) => {
    const router = express.Router();
    callback(router, server.options.endpoints[resource]);
    if (server.errorHandlers) {
      router.all('/', server.errorHandlers.methodNotAllowed);
    }
    server.app.use(`${server.options.context}/${resource}`, router);
  }

  // Mount users
  route('users', (router, resource) => {
    router.get('/', resource.getUsers);
    router.get('/:user_id', resource.getUser);
    router.post('/:user_id', resource.postUser);
  });

  // Mount services
  route('services', (router, resource) => {
    router.get('/', resource.getServices);
    router.post('/', resource.createService);
    router.get('/:service_id', resource.getService);
    router.post('/:service_id', resource.updateService);
    //router.delete('/:service_id', resource.deleteService);
  });
}

module.exports = function(options, app, callback) {
  if (arguments.length <= 2) {
    callback = app;
    app = undefined;
  }

  this.options = merge.recursive(true, defaultOptions, options || {});
  this.app = app ? app : express();
  this.errorHandlers = this.options.errorHandlers.enabled? handlers(this.options.errorHandlers.debug) : undefined;

  if (typeof this.options.preMount === 'function') {
    this.options.preMount(this.app);
  }

  mountEndpoints(this);

  if (typeof this.options.postMount === 'function') {
    this.options.postMount(this.app);
  }

  // Mount final error handlers
  if (this.errorHandlers) {
    this.app.use(errorHandlers.notFound);
    this.app.use(errorHandlers.error);
  }

  // Start server
  this.app.listen(this.options.port, callback);
};
