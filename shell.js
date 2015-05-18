var colors = require('colors');

noop       = function(){};
shell      = {};

shell.debug = process.env.DEBUG ? function(msg){
  console.log("DEBUG: ", msg);
} : noop;

shell.info = function(msg){
  console.log(msg.cyan);
};

shell.error = function(msg){
  console.log(msg.red);
};

shell.warn = function(msg){
  console.log(msg.yellow);
};

shell.success = function(msg){
  console.log(msg.green);
};

module.exports = shell;