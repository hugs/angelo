var fs = require('fs');
var net = require('net');
var path = require('path');
var util = require('util');
var actorify = require('actorify');
var spawn = require('child_process').spawn;
var EventEmitter = require('events').EventEmitter;

function Angelo(args) {
  this.filePath = '';
  this.nodeBinary = 'node';

  if (args) {
    // If args is a string, we're going to assume the
    // common case that it's a file path
    if (typeof args === 'string') {
      this.filePath = args;
    } else {
      var keys = Object.keys(args);
      keys.forEach(function(key) {
        this[key] = args[key];
      }, this);
    }
  }
  this.init();
}

util.inherits(Angelo, EventEmitter);

Angelo.prototype.init = function() {
  this.initPlayer();

  setTimeout(function(_this) {
    _this.initConnection();
    _this.initActor();
    _this.actor.send('ready');
  }, 250, this);
};

Angelo.prototype.initPlayer = function() {
  var binFullPath = fs.realpathSync(__filename);
  var binDir = path.dirname(binFullPath);
  var libDir = path.join(binDir, '../lib');
  var playerPath = path.join(libDir, 'mocha-player.js');

  this.player  = spawn(this.nodeBinary, [playerPath, 3000], {detached:false});

  if (!process.hasOwnProperty('children')) {
    process.children = {};
  }
  process.children[this.player.pid] = this.player;

  this.player.on('exit', function() {
    delete process.children[this.pid];
  });
};

Angelo.prototype.initConnection = function() {
  this.sock = net.connect(3000);

  this.sock.on('error', function() {
    console.log('socket error');
  });
};

Angelo.prototype.initActor = function() {
  this.actor = actorify(this.sock);
  this.send = this.actor.send;

  this.actor.on('readied', function() {
    process.stdout.write('Client received message: readied\n');
    if (this.filePath !== '') {
      this.load();
    }
  }.bind(this));

  this.actor.on('echoed', function(message) {
    process.stdout.write('Client received message: echoed\n');
    if (message) {
      process.stdout.write('Client received echoed content: ' + util.inspect(message) + '\n');
    }
  });

  this.actor.on('loaded', function(playlists) {
    process.stdout.write('Client received message: loaded\n');
    if (playlists) {
      process.stdout.write('Client received load: ' + JSON.stringify(playlists,null,2) + '\n');
    }
    this.playlists = playlists;
    this.emit('loaded');
  }.bind(this));

  this.actor.on('started', function() {
    process.stdout.write('Client received message: started\n');
  });

  this.actor.on('logged', function(message) {
    if (message) {
      process.stdout.write('Client received log: ' + message + '\n');
    }
  });

  this.actor.on('stopped', function(restart) {
    process.stdout.write('Client received message: stopped\n');
    // Re-init everything
    if (restart) {
      setTimeout(function(_this) {
        _this.init();
      }, 250, this);
  }
  }.bind(this));
};

Angelo.prototype.echo = function(message) {
  this.actor.send('echo', message);
};

Angelo.prototype.load = function(newFilePath) {
  if (newFilePath) {
    this.filePath = newFilePath;
  }
  if (this.filePath) {
    this.actor.send('load', this.filePath);
  }
};

Angelo.prototype.play = function() {
  this.actor.send('start');
};

Angelo.prototype.stop = function() {
  var restart = false;
  this.actor.send('stop', restart);
};

Angelo.prototype.restart = function() {
  var restart = true;
  this.actor.send('stop', restart);
};

process.on("SIGINT", function() {
  process.stdout.write('Exiting...\n');
  process.exit();
});

process.on('SIGTERM', function() {
  process.stdout.write('Exiting...\n');
  process.exit();
});

process.on('exit', function () {
  // process.stdout.write('Event: "exit"\n');
  if (process.hasOwnProperty('children')) {
    // console.log('Child processes:');
    for (var key in process.children) {
      if (process.children.hasOwnProperty(key)) {
        // console.log('  pid: ' + process.children[key].pid);
        // console.log('  exitCode: ' + process.children[key].exitCode);
        // console.log('  killed: ' + process.children[key].killed);
        if ((process.children[key].exitCode === null) && (process.children[key].killed === false)) {
          process.children[key].kill('SIGINT');
          // console.log("  ... but now it's dead!");
        }
      }
    }
  }
  process.exit();
});

module.exports.Angelo = Angelo;