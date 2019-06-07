const Boom = require('@hapi/boom');

function formatBoomPayload(error) {
  return {
    ...error.output.payload,
    ...(error.data ? { data: error.data } : {})
  };
}

module.exports = {
  error(err, req, res, next) {
    if (err instanceof Error) {
      if (!Boom.isBoom(err)) {
        Boom.boomify(err);
      }
      res.status(err.output.statusCode).send(formatBoomPayload(err));
    }
    return next();
  },
  notFound(req, res, next) {
    return req.route? next() : next(Boom.notFound());
  },
  methodNotAllowed(req, res, next) {
    return next(Boom.methodNotAllowed(`${req.method} ${req.originalUrl || req.url}`));
  }
};