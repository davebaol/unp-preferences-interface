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
  maxRequestBodySize: '5mb',
  errorsForDebugging: false,
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
  }
} 


module.exports = (options, callback) => {
  const opts = merge.recursive(true, defaultOptions, options);

  // Create express app
  const app = express();

  // Init express error handlers
  const appHandlers = handlers(opts.errorsForDebugging);
  
  // Mount middleware
  app.use(bodyParser.json({ limit: opts.maxRequestBodySize }));

  function route(resource, callback) {
    const router = express.Router();
    callback(router, opts.endpoints[resource]);
    router.all('/', appHandlers.methodNotAllowed);
    app.use(`/api/v1/${resource}`, router);
  }
  
  // Mount users
  route('users', (router, resource) => {
    router.post('/', resource.getUsers);
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

  // Mount error handlers
  app.use(appHandlers.notFound);
  app.use(appHandlers.error);

  // Start server
  app.listen(opts.port, callback);
};
