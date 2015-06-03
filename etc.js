var net = require('net')
  , through = require('through')
  , spawn = require('child_process').spawn
  , Promise = require('bluebird')
  , expandTilde = require('expand-tilde')
  , fs = require('fs')
  , isWin = /^win/.test(process.platform);


function chunks (count) {
  var bufs = [], len = 0;
  return through(function write (buf) {
    // console.log(buf, len);
    bufs.push(buf);
    len += buf.length;
    if (len > count) {
      var full = Buffer.concat(bufs);
      bufs = [];
      for (var i = 0; i < Math.floor(full.length/count)*count ; i += count) {
        this.queue(full.slice(i, i + count));
      }
      if (i < full.length) {
        bufs.push(full.slice(i));
      }
    }
  }, function end () {
    if (bufs.length) {
      this.queue(Buffer.concat(bufs));
    }
    this.queue(null);
  })
}

function exec (p, args, opts) {
  opts = opts || {};
  return new Promise(function (resolve, reject) {
    // console.log('exec:', p, args);
    var proc = spawn(p, args, opts);
    // proc.stdout.pipe(process.stdout);
    if (!opts.quiet) {
      proc.stderr.pipe(process.stderr);
    } 
    proc.on('exit', function (code) {
      code ? reject(code) : resolve();
    })
  });
}

// windows may or may not have vbox, and that depending on your flavor of Git, that shell may or may not have your Windows user %path% exported into it
// it's much safer to just assume vbox is in the path from the create.js insurePath check on startup
function startvm (name) {
  return isWin ?
    spawn('vboxheadless', ['-s', name])
  :
    spawn('sh', ['vboxheadless', '-s', name]);
}

exports.VM_NAME      = 'tessel2';
exports.PATH_KEY     = expandTilde('~/.tessel/id_rsa.pub');
exports.PATH_VM_NAME = expandTilde('~/.tessel/vm_name');
exports.PATH_VM_VDI  = expandTilde('~/.tessel/vm.vdi');

// Windows serial ports use predefined pipe sockets
// Google virtualbox serial ports windows for a lot more info on this
exports.PATH_VM_PORT = exports.PATH_VM_PORT = function(){
  return isWin ?
    '\\\\.\\pipe\\COM1'
  :
    expandTilde('~/.tessel/vm.port');
}();

exports.VM_URL = "http://storage.googleapis.com/tessel-builds/ccc157a289db14791ee7250733a0b7b5fb9c06c8.vdi";

exports.exec = exec;
exports.chunks = chunks;
exports.startvm = startvm;
