#!/usr/bin/env node

var parser = require("nomnom");

parser.command('create')
  .callback(function () {
    require('./create');
  })
  .help('creates the vm image')

parser.command('run')
  .callback(function () {
    require('./run');
  })
  .help('launches the vm for testing')

parser.command('destroy')
  .callback(function () {
    require('./destroy');
  })
  .help('destroys the vm')

parser.parse();
