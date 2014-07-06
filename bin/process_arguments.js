var argv = require('minimist')(process.argv.slice(2))

processArgs = function(){
  fileArg = argv._

  noFile = function(){
    return (fileArg.length === 0)
  }
  tooManyFiles = function(){
    return (fileArg.length > 1)
  }

  if (noFile() || tooManyFiles()) {
    console.log("\nUsage: angelo <file>\n") 
    process.exit(1)
  }
  
  return fileArg[0]

}

module.exports = processArgs