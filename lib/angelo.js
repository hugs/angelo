var fs = require('fs');
var path = require('path');
var spawn = require('child_process').spawn;

function Angelo(args){
  this.filePath = '';
  this.nodeBinary = 'node';
  this._used = false;

  if (args) {
    // If args is a string, we're going to assume the
    // common case that it's a file path 
    if (typeof args === 'string') {
      this.filePath = args
    } else {
      var keys = Object.keys(args);
      keys.forEach(function(key){
        this[key] = args[key];
      }, this);
    }
  }

  this.create_player();

  if (this.filePath) {
    this.load();
  }
}

Angelo.prototype.create_player = function() {
  var bin_full_path = fs.realpathSync(__filename);
  var bin_dir = path.dirname(bin_full_path);
  var lib_dir = path.join(bin_dir, '../lib');
  var player_path = path.join(lib_dir, 'mocha-player.js');

  this.player  = spawn(this.nodeBinary, [player_path]);

  this.player.stdout.on('data', function (data) {
    console.log('' + data);
  });

  this.player.stderr.on('data', function (data) {
    console.log('' + data);
  });

  this.player.send = function(message){
    jsonMsg = JSON.stringify(message);
    this.stdin.write(jsonMsg + '\n');
  }
}

Angelo.prototype.load = function(newFilePath) {
  if (newFilePath) {
    this.filePath = newFilePath;
  }
  if (this.filePath) {
    this.player.send( ['load', {file:this.filePath}] );
  }
}

Angelo.prototype.play = function() {
  if (!this._used) {
    if (this.filePath) {
      this.player.send( ['play'] );
      this._used = true;
    }
  } else {
    throw new Error("Playing complete. To play again, create a new Angelo object.");
  }
}

Angelo.prototype.echo = function(text) {
  this.player.send( ['echo', {text:text}] );
}

Angelo.prototype.end = function() {
  this.player.send( ['end'] );
}

module.exports.Angelo = Angelo;


/* Testing:

var Angelo = require('./angelo').Angelo
var a = new Angelo('test/playlist.js')
a.play()


> a.echo('this is awesome')
received message: [ 'echo', { text: 'this is awesome' } ]

*/

