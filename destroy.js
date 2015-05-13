var spawn = require('child_process').spawn
  , etc = require('./etc')
  , fs = require('fs')
  , Promise = require('bluebird')

function forceUnlink (loc) {
  try {
    fs.unlinkSync(loc);
  } catch (e) { }
}

Promise.try(function () {
  console.error('Deleting...');
})
.then(function () {
  return etc.exec('VBoxManage', ['unregistervm', etc.VM_NAME, '--delete'], {
    quiet: true
  })
})
.then(function () {
  console.error('Existing VM deleted.');
}, function () {
  console.error('No VM detected.');
})
.then(function () {
  forceUnlink(etc.PATH_VM_NAME);
  forceUnlink(etc.PATH_VM_VDI);
  forceUnlink(etc.PATH_VM_PORT);
})
