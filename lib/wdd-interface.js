/**
 * Module dependencies.
 */

var mocha = require('mocha')
var Suite = mocha.Suite
var Test = mocha.Test
var utils = mocha.utils
var uuid = require('node-uuid')

/**
 * WDD-style interface:
 *
 *     playlist('Account Creation');
 *
 *     workflow('Create account', function(){
 *        // go to url
 *        // fill out forms
 *        // assert account created
 *     });
 *
 *
 */

module.exports = function(suite){
  var suites = [suite];

  suite.on('pre-require', function(context, file, mocha){

    /**
     * Execute before running tests.
     */

    context.before = function(name, fn){
      suites[0].beforeAll(name, fn);
    };

    /**
     * Execute after running tests.
     */

    context.after = function(name, fn){
      suites[0].afterAll(name, fn);
    };

    /**
     * Execute before each test case.
     */

    context.beforeEach = function(name, fn){
      suites[0].beforeEach(name, fn);
    };

    /**
     * Execute after each test case.
     */

    context.afterEach = function(name, fn){
      suites[0].afterEach(name, fn);
    };

    /**
     * Describe a "suite" with the given `title`.
     */

    context.playlist = function(title){
      if (suites.length > 1) suites.shift();
      var suite = Suite.create(suites[0], title);
      suite.file = file;
      suite.id = uuid.v4();
      suites.unshift(suite);
      return suite;
    };

    /**
     * Exclusive test-case.
     */

    context.playlist.only = function(title, fn){
      var suite = context.suite(title, fn);
      mocha.grep(suite.fullTitle());
    };

    /**
     * Describe a specification or test-case
     * with the given `title` and callback `fn`
     * acting as a thunk.
     */

    context.workflow = function(title, fn){
      var test = new Test(title, fn);
      test.file = file;
      test.id = uuid.v4();
      suites[0].addTest(test);
      return test;
    };

    /**
     * Exclusive test-case.
     */

    context.workflow.only = function(title, fn){
      var test = context.test(title, fn);
      var reString = '^' + utils.escapeRegexp(test.fullTitle()) + '$';
      mocha.grep(new RegExp(reString));
    };

    /**
     * Pending test case.
     */

    context.workflow.skip = function(title){
      context.test(title);
    };
  });
};