var spawn = require('child_process').spawn
  , mdns = require('mdns-js')
  , etc = require('./etc')
  , fs = require('fs')
  , concat = require('concat-stream')

try {
  var hostname = fs.readFileSync(etc.PATH_VM_NAME, 'utf-8');
} catch (err) {
  console.error('No VM found. Please run `t2-vm create` first');
  process.exit(1);
}

setTimeout(function () {
  if (!isonline) {
    console.error('ERROR The VM failed to connect to the network.')
    console.error('ERROR Please re-run this command and hope for the best.')
    console.error('ERROR Ensure your Wifi policy allows connections to other')
    console.error('ERROR devices on the network.')
    process.exit(1);
  }
}, 60*1000)

console.log('INFO Halting VM ...');
var p = etc.stopvm(etc.VM_NAME);
p.stdout.pipe(concat(function (data) {
  if (module.parent.verbose)
    console.log(data.toString());
  if (data.toString().match(/invalid machine name/i)) {
    console.error('ERR  No VM exists. Run t2-vm create first.')
    process.exit(1);
  }
}))
p.stderr.pipe(concat(function(data) {
  if (module.parent.verbose)
    console.log(data.toString());
}))
p.on('exit', function () {
  console.log('INFO VM terminated.');
  process.exit();
})

etc.seekDevice(hostname, function (err, data) {
  console.error('INFO VM is now online.');
  console.log(hostname);
  console.log(data.addresses[0]);
  isonline = true;
})
