#!/usr/bin/env node

var parser = require("nomnom");

parser.command('create')
  .callback(function (opts) {
    require('./create').create(opts);
  })
  .option('image', {
    help: 'path to a VM image instead of downloading the default one',
    metavar: 'FILE.vdi'
  })
  .option('nbNetInterfaces', {
    abbr: 'n',
    full: 'nb-network-interfaces',
    help: 'set the number of network interfaces. Only the last one is bridged (2 by default)',
    default: 2,
    callback: function(nb) {
      var pnb = parseInt(nb)
      if ((nb != parseInt(nb)) || (pnb > 4) || (pnb < 1)) {
         return "nb-network-interfaces must be an integer between 1 and 4";
      }
    },
    transform: function(nb) { return parseInt(nb); }
  })
  .help('creates the vm image')

parser.command('launch')
    .options({
        verbose: {
           abbr: 'v',
           flag: true,
           help: "Show VBoxManage output."
        }
    })
  .callback(function (opt) {
    module.verbose = opt.verbose;
    require('./run');
  })
  .help('launches the vm for testing')

parser.command('halt')
    .options({
        verbose: {
           abbr: 'v',
           flag: true,
           help: "show vboxheadless output"
        }
    })
  .callback(function (opt) {
    module.verbose = opt.verbose;
    require('./halt');
  })
  .help('halts the vm')

parser.command('run')
  .callback(function () {
    console.error('DEPRECATED: Use the command "t2-vm launch" instead.');
    process.exit(255);
  })

parser.command('destroy')
  .callback(function () {
    require('./destroy');
  })
  .help('destroys the vm')

parser.command('shell')
  .callback(function () {
    require('./shell');
  })
  .help('launches a shell for the vm')

parser.parse();
