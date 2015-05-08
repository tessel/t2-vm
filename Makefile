all: build build/tessel2.box

.PHONY: all clean pure

VM_NAME:=tessel2

clean:
	rm -rf build

pure:
	VBoxManage unregistervm $(VM_NAME) --delete || true
	cp build/x86/openwrt-x86-generic-combined-ext4.vdi build/tessel2.vdi
	VBoxManage createvm --name $(VM_NAME) --ostype "Linux" --register
	VBoxManage storagectl $(VM_NAME) --name "IDE Controller" --add ide 
	VBoxManage storageattach $(VM_NAME) --storagectl "IDE Controller" --port 0 --device 0 --type hdd --medium build/tessel2.vdi
	VBoxManage modifyvm $(VM_NAME) --audiocontroller ac97 --audio coreaudio
	VBoxManage modifyvm $(VM_NAME) --nic1 bridged --bridgeadapter1 "en0: Wi-Fi (AirPort)"
	VBoxManage modifyvm $(VM_NAME) --nic2 bridged --bridgeadapter2 "en0: Wi-Fi (AirPort)"
	VBoxManage modifyvm $(VM_NAME) --usb on
	VBoxManage usbfilter add 0 --target $(VM_NAME) --name Arduino --vendorid 0x2341 --productid 0x0043
	# node read.js
	VBoxManage modifyvm $(VM_NAME) --uart1 0x3F8 4 --uartmode1 server /tmp/tessel.port
	VBoxManage startvm $(VM_NAME) --type headless
	node read.js
	#VBoxManage export tessel2 -o build/tessel2.ova

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
