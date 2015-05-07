require "shellwords"

VAGRANTFILE_API_VERSION = "2"
 
Vagrant.configure(VAGRANTFILE_API_VERSION) do |config|
  config.ssh.username = "root"
  config.ssh.password = "tessel2" 
  config.ssh.shell = "ash"
  config.ssh.insert_key = false
 
  config.vm.synced_folder ".", "/vagrant", disabled: true
 
  config.vm.box = ENV.fetch('TESSEL2_BOX', 'technicalmachine/tessel2')
 
  config.vm.provider :virtualbox do |vb, override|
    # Add usb filter for Arduino
    vb.customize ['modifyvm', :id, '--usb', 'on']
    vb.customize ['usbfilter', 'add', '0', '--target', :id, '--name', 'Arduino', '--vendorid', '0x2341', '--productid', '0x0043']

    keypath = File.expand_path('~/.tessel/id_rsa.pub')
    idpath = '.vagrant/machines/default/virtualbox/id'

    # Switch to bridged network after provision
    created = File.exist?(idpath)
    if not created then
      pubkey = File.read(keypath)

      override.vm.provision "shell", inline: "echo %s >> /etc/dropbear/authorized_keys; echo Hostname: $HOSTNAME; poweroff; sleep 10000000" % Shellwords.escape(pubkey)

      override.trigger.after [:up, :provision] do
        id = File.read(idpath)

        run "vboxmanage modifyvm " + id + " --nic1 bridged --bridgeadapter1 \"en0: Wi-Fi (AirPort)\""
        sleep 1
        run "vboxmanage startvm " + id + " --type headless"
      end
    end
  end
end
