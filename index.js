const express = require('express');
const bodyParser = require('body-parser');
const Boom = require('@hapi/boom');
const handlers = require('./handlers');

function notImplemented(req, res, next) {
  return next(Boom.notImplemented());
}

const defaultEndpoints = {
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

function merge(endpoints, resourse) {
  return Object.assign({}, defaultEndpoints[resourse], endpoints[resourse]);
}

function route(app, endpoints, resourceName, callback) {
  const resource = merge(endpoints, resourceName);
  const router = express.Router();
  callback(router, resource);
  router.all('/', handlers.methodNotAllowed);
  app.use(`/api/v1/${resourceName}`, router);
}


module.exports = (endpoints, options) => {
  const app = express();

  console.log(JSON.stringify(options, null, 2));
  
  // Mount middleware
  app.use(bodyParser.json({ limit: options.maxRequestBodySize }));

  // Mount users
  route(app, endpoints, 'users', (router, resource) => {
    router.post('/', resource.getUsers);
    router.get('/:user_id', resource.getUser);
    router.post('/:user_id', resource.postUser);
  });

  // Mount services
  route(app, endpoints, 'services', (router, resource) => {
    router.get('/', resource.getServices);
    router.post('/', resource.createService);
    router.get('/:service_id', resource.getService);
    router.post('/:service_id', resource.updateService);
    //router.delete('/:service_id', resource.deleteService);
  });

  // Mount error handlers
  app.use(handlers.notFound);
  app.use(handlers.error);

  // Start server
  app.listen(options.port, () => {
    console.log('preferences started at', new Date().toISOString(), 'on port', options.port);
  });
};
