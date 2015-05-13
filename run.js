#!/usr/bin/env node

var spawn = require('child_process').spawn
  , mdns = require('mdns-js')
  , etc = require('./etc')
  , fs = require('fs')

try {
  var hostname = fs.readFileSync(etc.PATH_VM_NAME, 'utf-8');
} catch (err) {
  console.error('No VM found. Please run `t2-vm create` first');
  process.exit(1);
}

// Ignore other mdns daemons running, like avahi or bonjour
mdns.excludeInterface('0.0.0.0');

// Create a Tessel browser
var browser = mdns.createBrowser('_tessel._tcp');

// When the browser finds a new device
var isonline = false;
browser.on('update', function (data) {
  if (!isonline && data.host == hostname + '.local') {
    console.error('INFO VM is now online.');
    console.log(hostname);
  }
});

process.on('uncaughtException', function () {
  // Swallow this, it may be random encoding errors in mdns
  return;
})

// When the browser becomes ready
browser.once('ready', function(){
  try {
    // Start discovering Tessels
    setInterval(function () {
      browser.discover();
    }, 2000);
  } catch (err) {
    console.log(err);
  }
});

console.log('INFO Booting VM...');
var p = etc.startvm(etc.VM_NAME);
