const server = require('..');

const options = {
  port: 8084,
  maxRequestBodySize: "10mb"
};

server({}, options);
