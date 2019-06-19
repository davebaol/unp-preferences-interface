const server = require('..');

const options = {
  port: 8084,
  maxRequestBodySize: "10mb",
  errorsForDebugging: true,
  // use default endopints returning 501 Not Implemented
};

server(options, () => {
  console.log('Sample UNP-Preferences server started at', new Date().toISOString(), 'on port', options.port)
});
