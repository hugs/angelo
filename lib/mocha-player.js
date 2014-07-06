var util = require('util')
var mocha = require('mocha')
require('coffee-script/register')
mocha.interfaces['wdd'] = require('./wdd-interface')
assert = require('better-assert')

process.stdin.setEncoding('utf8');

m = new mocha()
m.ui('wdd')
m._reporter = require('./wdd-reporter') 

process.stdin.on('data', function (msg) {
  try {
    msg = JSON.parse(msg)
  } catch (e) {
    // console.log(e)
    return e
  }
  
  command = msg[0]
  if (command === 'load') {
    return load( msg[1].file );
  }
  if (command === 'play') {   
    return play();
  }
  
  if (command === 'echo') {   
    return echo(msg);
  }
  
  if (command === 'ui') {   
    return ui(msg[1].interface);
  }
  if (command === 'end') {
    return end();
  } 
});

function load(filePath) {
  m.addFile(filePath)

  // Parse the file so we can get the list of suites and tests.
  m.loadFiles()

  // If we don't do this before playing the suite, everything will get 
  // loaded twice...
  // m.files = []

  // Print out all suites and tests
  parsed = ''
  if (m.suite.suites.length > 0) {  
    parsed += '\n'  
    for (var j in m.suite.suites) {
      //console.log('  - ' + m.suite.suites[j].title)
      parsed += '  - ' + m.suite.suites[j].title + '\n'
    
      for (var k in m.suite.suites[j].tests) {
        parsed += '    - ' + m.suite.suites[j].tests[k].title + ' ' + m.suite.suites[j].tests[k].id + '\n'
      }
    }
  } else {
    for (var i in m.suite.tests) {
      parsed += '  - ' + m.suite.tests[i].title + '\n'
    }
  }
  console.log(parsed)
}

function play() {
  m.run(function(failures){
    process.exit(failures)
  })
}

function echo(msg){
  console.log('received message:', util.inspect(msg));  
}

function ui(interface){
  m.ui(interface)  
}

function end() {
  process.exit()
}