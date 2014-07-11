var argv = require('minimist')(process.argv.slice(2));

var processArgs = function() {
  var fileArg = argv._;

  var noFile = function() {
    return (fileArg.length === 0);
  };

  var tooManyFiles = function() {
    return (fileArg.length > 1);
  };

  if (noFile() || tooManyFiles()) {
    console.log("\nUsage: angelo <file>\n");
    process.exit(1);
  }
  
  var filePath = fileArg[0];
  
  var verbose = false;
  if (argv.hasOwnProperty('verbose')) {
    verbose = true;
  }
  
  var args = {
    filePath: filePath,
    verbose: verbose,
    nodeBinary: process.execPath
  }

  return args;
};

module.exports = processArgs;
