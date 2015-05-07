# tessel 2 vm generation

This project uses a Tessel 2 build and packer to create a VM. Issues with Tessel 2 builds can be filed on this repo.

## Running a Tessel 2 VM

Tessel 2 VMs are published to the Vagrant registry. To quickly get started, copy the Vagrantfile included in this repo to a new directory.

First install the "triggers" plugin for Vagrant:

```
vagrant plugin install vagrant-triggers
```

Then to boot the VM:

```
vagrant up
```

The hostname of your new Tessel should be listed in green in the output. This can be used in `t2 run <script.js> --name <hostname>` to push and run code on the VM.

TODO: how to use binary builds! For some code to play with in the VM, clone https://github.com/tcr/stillframe, explode the archives, and load it into the VM. The run it from shell using `node` as usual.

## Building a Vagrant box from scratch

To test:

```
make clean
make download
make all
```

And you'll have a box at `build/tessel2.box`.

## License

MIT/ASL2
