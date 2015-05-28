var spawn = require('child_process').spawn
  , etc = require('./etc')
  , fs = require('fs')
  , Connection = require('ssh2')

try {
  var hostname = fs.readFileSync(etc.PATH_VM_NAME, 'utf-8');
} catch (err) {
  console.error('No VM found. Please run `t2-vm create` first');
  process.exit(1);
}

etc.seekDevice(hostname, function (err, data) {
  var ip = data.addresses[0];

  var p = spawn('ssh', ['-i', etc.PATH_PRIVATE_KEY, 'root@' + ip], {
    stdio: 'inherit'
  });
  p.on('exit', function () {
    process.exit(0);
  })
});
