# tessel 2 vm generation

This project uses a Tessel 2 build and packer to create a VM. Issues with Tessel 2 builds can be filed on this repo.

## Running a Tessel 2 VM

Tessel 2 VMs are published to the Vagrant registry. To quickly get started, use the Vagrantfile included in this repo. (If you want to use a local copy, change the line to `config.vm.box = "./build/tessel2.box"`)

```
vagrant up
vagrant ssh
```

TODO: how to use the command line with it! For some code to play with in the VM, clone https://github.com/tcr/stillframe, explode the archives, and load it into the VM. The run it from shell using `node` as usual.

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
