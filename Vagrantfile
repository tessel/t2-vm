VAGRANTFILE_API_VERSION = "2"
 
Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.ssh.username = "root"
  config.ssh.password = "tessel2" 
  config.ssh.shell = "ash"
 
  config.vm.synced_folder ".", "/vagrant", disabled: true
 
  config.vm.box = "technicalmachine/tessel2"
 
  # Add usb filter for Arduino
  config.vm.provider :virtualbox do |vb|
    vb.customize ['modifyvm', :id, '--usb', 'on']
    vb.customize ['usbfilter', 'add', '0', '--target', :id, '--name', 'Arduino', '--vendorid', '0x2341', '--productid', '0x0043']
  end
end
