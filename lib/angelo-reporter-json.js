/**
 * Module dependencies.
 */

var mocha = require('mocha');
var Base = mocha.reporters.Base;
var color = Base.color;
var stackTrace = require('stack-trace');
var util = require('util');

/**
 * Expose `List`.
 */

exports = module.exports = List;

/**
 * Initialize a new `List` test reporter.
 *
 * @param {Runner} runner
 * @api public
 */

function List(runner) {
  Base.call(this, runner);

  var self = this;
  var stats = this.stats;
  var total = runner.total;

  runner.on('start', function(){
    console.log(JSON.stringify( ['start', { total: total }] ));
  });

  runner.on('suite', function(suite){
    if (suite.id != undefined) {
      console.log(JSON.stringify( ['suite', suite_info(suite)] ));
    }
  });

  runner.on('test', function(test){
    console.log(JSON.stringify( ['test', info(test)] ));
  });

  runner.on('pass', function(test){
    console.log(JSON.stringify( ['pass', pass(test)] ));
  });

  runner.on('fail', function(test, err){
    process.stdout.write('\n---------------------------- FAIL ----------------------------\n');
    process.stdout.write('Title: ' + test.title + '\n');
    process.stdout.write(err.stack);
    process.stdout.write('---------------------------- FAIL ----------------------------\n\n');    
    
    test = fail(test, err);
    console.log(JSON.stringify( ['fail', test] ));
  });

  runner.on('test end', function(test){
    console.log(JSON.stringify( ['test end', {id: test.id}] ));
  });

  runner.on('suite end', function(suite){
    if (suite.id != undefined) {
      console.log(JSON.stringify( ['suite end', {id: suite.id}] ));
    }
  });

  runner.on('end', function(){
    console.log(JSON.stringify( ['end', self.stats] ));
  });
}

/**
 * Return a plain-object representation of `test`
 * free of cyclic properties etc.
 *
 * @param {Object} test
 * @return {Object}
 * @api private
 */


function suite_info(suite) {
  return {
     id: suite.id,
     title: suite.title,
  }
}

function info(test) {
  return {
     id: test.id,
     suiteId: test.parent.id,
     title: test.title
  }
}

function pass(test) {
  return {
     id: test.id,
     duration: test.duration
  }
}

function fail(test, err) {
  //trace = stackTrace.parse(err)
  //console.log(trace[0])
  //console.log(trace[1])
  return {
     id: test.id,
     duration: test.duration,
     err: {
       name: err.name,
       message: err.message,
       stack: err.stack
     }
  }
}