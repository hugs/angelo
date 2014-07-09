var net = require('net');
var util = require('util');
var mocha = require('mocha');
var actorify = require('actorify');
require('coffee-script/register');
assert = require('better-assert');
mocha.interfaces['wdd'] = require('./wdd-interface');

var PORT = 3000;
var VERBOSE = true;

if (process.argv.length === 3) {
  PORT = process.argv[2];
} else {
  console.log('Usage:\n  node mocha-player.js <port>');
  process.exit();
}

function info(message) {
  if (VERBOSE) {
    process.stdout.write(message);
  }
}

m = new mocha();
m.ui('wdd');
m._reporter = require('./wdd-reporter');

net.createServer(function(sock) {
  var actor = actorify(sock);

  // redirect logging to the socket...
  _console_log = console.log;
  console.log = function(message) {
    actor.send('logged', message);
    info('Player sending log: ' + message + '\n');
  };

  actor.on('ready', function() {
    info('Player received message: ready\n');
    actor.send('readied');
  });

  actor.on('echo', function(message) {
    info('Player received message: echo\n');
    if (message) {
      info('  message: ' + util.inspect(message) + '\n');
    }
    actor.send('echoed', message ? message : null);
  });

  actor.on('load', function(filePath) {
    info('Player received message: load\n');
    info('  path: ' + filePath + '\n');

    m.addFile(filePath);

    // Parse the file so we can get the list of suites and tests.
    m.loadFiles();

    // Create a playlist of all suites and tests.
    var playlist = [];
    if (m.suite.suites.length > 0) {
      for (var j in m.suite.suites) {
        var suite = {
          title: m.suite.suites[j].title,
          id: m.suite.suites[j].id
        };
        var tests = [];

        for (var k in m.suite.suites[j].tests) {
          tests.push({
            title: m.suite.suites[j].tests[k].title,
            id: m.suite.suites[j].tests[k].id,
            source: m.suite.suites[j].tests[k].fn.toString()
          });
        }
        playlist.push([suite,tests]);
      }
    } else {
      var suite = {
        title: '',
        id: 0
      };
      var tests = [];
      for (var i in m.suite.tests) {
        tests.push({
          title: m.suite.tests[i].title,
          id: m.suite.tests[i].id
        });
      }
      playlist.push([suite,tests]);
    }
    actor.send('loaded', playlist);
  });

  actor.on('start', function() {
    info('Player received message: start\n');
    actor.send('started');
    m.run(function(failures) {
      info('Player sending message: stopped\n');
      var restart = true;
      actor.send('stopped', restart);
      process.exit(failures);
    });
  });

  actor.on('stop', function(restart) {
    info('Player received command: stop\n');
    info('Player sending message: stopped\n');
    actor.send('stopped', restart ? restart : null);
    process.exit();
  });

}).listen(PORT);

process.on('SIGINT', function() {
  info('\nPlayer got sigint');
  process.exit();
});

process.on('SIGTERM', function() {
  info('\nPlayer got sigterm');
  process.exit();
});

process.on('exit', function() {
  info('\nPlayer exiting...\n');
});

info('Player process pid: ' + process.pid + '\n');
info('Player listening on port ' + PORT + '\n');