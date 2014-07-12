var fs = require('fs');
var net = require('net');
var path = require('path');
var util = require('util');
var actorify = require('actorify');
var spawn = require('child_process').spawn;
var EventEmitter = require('events').EventEmitter;

var VERBOSE = false;

function info(message) {
  if (VERBOSE) {
    console.log(message.toString())
  }
}

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
    if (args.verbose) {
      VERBOSE = true;
    }
  }
  this.init();
}

util.inherits(Angelo, EventEmitter);

Angelo.prototype.init = function() {
  this.initPlayer();

  // TODO: Make this smarter and give up after N tries...
  this.initConnection();
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

  this.player.stdout.on('data', function(data) {
    info(data);
  });
};

Angelo.prototype.initConnection = function() {
  this.sock = net.connect(3000);
  
  this.sock.on('connect', function() {
    info('Client connected to Player\n');
    this.initActor();
    this.actor.send('ready');    
  }.bind(this));

  this.sock.on('error', function() {
    process.stdout.write('.');
    setTimeout(function(_this) {
      _this.initConnection();
    }, 20, this);      
  }.bind(this));

};

Angelo.prototype.initActor = function() {
  this.actor = actorify(this.sock);
  this.send = this.actor.send;

  this.actor.on('readied', function() {
    info('Client received message: readied\n');
    if (this.filePath !== '') {
      this.load();
    }
  }.bind(this));

  this.actor.on('echoed', function(message) {
    info('Client received message: echoed\n');
    if (message) {
      info('Client received echoed content: ' + util.inspect(message) + '\n');
    }
  });

  this.actor.on('loaded', function(playlists) {
    info('Client received message: loaded\n');
    if (playlists) {
      info('Client received load: ' + JSON.stringify(playlists,null,2) + '\n');
    }
    this.playlists = playlists;
    this.emit('loaded');
  }.bind(this));

  this.actor.on('started', function() {
    info('Client received message: started\n');
  });

  this.actor.on('logged', function(message) {
    if (message) {
      info('Client received log: ')
      //process.stdout.write(message + '\n');
      try {
        msg = JSON.parse(message);
      } catch (err) {
        msg = message;
      }
      process.stdout.write(message + '\n');
    }
  });

  this.actor.on('stopped', function(restart) {
    info('Client received message: stopped\n');
    // Re-init everything
    if (restart) {
      setTimeout(function(_this) {
        _this.init();
      }, 20, this);
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
  var restart = true;
  this.actor.send('start', restart);
};

Angelo.prototype.playOnce = function() {
  var restart = false;
  this.actor.send('start', restart);
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
  info('Exiting...\n');
  process.exit();
});

process.on('SIGTERM', function() {
  info('Exiting...\n');
  process.exit();
});

process.on('exit', function () {
  // info('Event: "exit"\n');
  if (process.hasOwnProperty('children')) {
    // info('Child processes:');
    for (var key in process.children) {
      if (process.children.hasOwnProperty(key)) {
        // info('  pid: ' + process.children[key].pid);
        // info('  exitCode: ' + process.children[key].exitCode);
        // info('  killed: ' + process.children[key].killed);
        if ((process.children[key].exitCode === null) && (process.children[key].killed === false)) {
          process.children[key].kill('SIGINT');
          // info("  ... but now it's dead!");
        }
      }
    }
  }
  process.exit();
});

module.exports.Angelo = Angelo;
