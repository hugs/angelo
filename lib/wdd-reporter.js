/**
 * Module dependencies.
 */

var mocha = require('mocha')
var Base = mocha.reporters.Base
var color = Base.color;
var stackTrace = require('stack-trace');

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

  var self = this
    , stats = this.stats
    , total = runner.total;

  runner.on('start', function(){
    console.log(JSON.stringify( ['start', { total: total }] ));
  });
  
  runner.on('test', function(test){
    console.log(JSON.stringify( ['test', info(test)] ));
  });  

  runner.on('pass', function(test){
    console.log(JSON.stringify( ['pass', pass(test)] ));
  });

  runner.on('fail', function(test, err){
    test = fail(test, err);
    console.log(JSON.stringify( ['fail', test] ));
  });  
  
  runner.on('test end', function(test){
    console.log(JSON.stringify( ['test end', {id:test.id}] ));
  });    

  runner.on('end', function(){
    process.stdout.write(JSON.stringify( ['end', self.stats] ));
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

function info(test) {
  return {
     id: test.id,
     parentTitle: test.parent.fullTitle(),
     title: test.title,
     duration: test.duration
  }
}

function pass(test) {
  return {
     id: test.id,
     duration: test.duration
  }
}

function fail(test, err) {
  //console.log(err.stack)
  //console.log(err)
  //trace = stackTrace.parse(err)
  //console.log(trace[0])
  //console.log(trace[1])
  return {
     id: test.id,     
     duration: test.duration,
     error: err
  }
}