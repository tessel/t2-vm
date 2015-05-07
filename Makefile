all: build build/tessel2.box

.PHONY: all clean

VM_NAME:=tessel2

clean:
	rm -rf build

build/tessel2.ova:
	VBoxManage unregistervm $(VM_NAME) --delete || true
	VBoxManage createvm --name $(VM_NAME) --ostype "Linux" --register
	VBoxManage storagectl $(VM_NAME) --name "IDE Controller" --add ide 
	VBoxManage storageattach $(VM_NAME) --storagectl "IDE Controller" --port 0 --device 0 --type hdd --medium build/x86/openwrt-x86-generic-combined-ext4.vdi
	VBoxManage export tessel2 -o build/tessel2.ova

build/tessel2.box: build/tessel2.ova
	cd build; packer build ../packer.json
	mv build/packer_virtualbox-ovf_virtualbox.box build/tessel2.box

build:
	mkdir -p build

build/artifact.tar.gz: build
	# Just an example
	cd build; axel -a https://technical-tusk.storage.googleapis.com/16f7830635d2f9d3aa1f6b613243799a910d9efe.tar.gz
	cd build; mv 16f7830635d2f9d3aa1f6b613243799a910d9efe.tar.gz artifact.tar.gz

download: build/artifact.tar.gz
	cd build; tar -xjvf artifact.tar.gz

run:
	# Just an example
	vagrant box remove ./build/tessel2.box -f || true
	rm -rf /Users/tim/VirtualBox\ VMs/tessel* || true

	TESSEL2_BOX=./build/tessel2.box vagrant up
	TESSEL2_BOX=./build/tessel2.box vagrant ssh
