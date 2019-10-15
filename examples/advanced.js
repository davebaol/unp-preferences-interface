const server = require('..');

const options = {
  port: 8084,
  context: '', // no context
  maxRequestBodySize: "10mb",
  preMount: app => {
    console.log('preMount: before mounting endpoints you can use any express middleware, for instance cors or more endpoints');
  },
  postMount: app => {
    console.log('postMount: after mounting endpoints you can use any express middleware, for instance custom error handlers or more endpoints');
  },
  errorHandlers: { enabled: true, debug: true},
  endpoints: {
    users: {
      getUser: (req, res, next) => res.sendStatus(404),
      getUsers: (req, res, next) => res.json([]),
    }
  }
};

server(options, () => {
  console.log('Sample UNP-Preferences server started at', new Date().toISOString(), 'on port', options.port)
});
