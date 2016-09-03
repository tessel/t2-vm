# Tessel 2 VM Tool
[![Code of Conduct](https://img.shields.io/badge/%E2%9D%A4-code%20of%20conduct-blue.svg?style=flat)](https://github.com/tessel/project/blob/master/CONDUCT.md)

Command line tool to run a Tessel 2 VM for local testing.

## Prerequisites
[VirtualBox and its extension pack](https://www.virtualbox.org/wiki/Downloads)

## Installation
```
npm install -g git+https://github.com/tessel/t2-vm.git
```

## Running a Tessel 2 VM

Make sure you have the [t2-cli](https://github.com/tessel/t2-cli) installed to generate your local key.

```
t2 key generate
t2-vm create
t2-vm launch
```

The resulting hostname can be used to push code to the local VM:

```
t2-vm launch index.js --name Tessel-XXXXXXXXXX
```

![Example usage](https://cloud.githubusercontent.com/assets/80639/7619962/32ffa39c-f971-11e4-919a-8b64057a450c.png)

TODO: how to use binary builds! For some code to play with in the VM, clone https://github.com/tcr/stillframe, explode the archives, and load it into the VM. The run it from shell using `node` as usual.

## Copyright and License

Copyright 2016 Tessel

Dual-licensed under the [Apache License, Version 2.0](./APACHE-LICENSE), and the [MIT License](./MIT-LICENSE).
