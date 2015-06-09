var net = require('net')
  , through = require('through')
  , spawn = require('child_process').spawn
  , Promise = require('bluebird')
  , shellescape = require('shell-escape')
  , fs = require('fs')
  , request = require('request')
  , which = require('which')
  , progress = require('request-progress')
  , etc = require('./etc')
  , shell  = require('./logs')
  , isWin = /^win/.test(process.platform);


// throw error is a necessary executable isn't in our path
insurePath = function(cmd){
  try{
    which.sync(cmd);
  } catch (err) {
    e = []
      .concat("executables for: ")
      .concat(cmd)
      .concat(" was not found in your ")
      .concat(isWin? "%PATH%" : "$PATH")
      .join('');
    throw new Error(e);
  }
}

cmds = [
  'vboxheadless',
  'VBoxManage'
].forEach(insurePath);



var audiocontroller = 'null';
switch (process.platform) {
  case 'darwin':
    audiocontroller = 'coreaudio';
    break;
  case 'freebsd':
  case 'linux':
  case 'sunos':
    audiocontroller = 'alsa';
    break;
  case 'win32':
    audiocontroller = 'dsound';
    break;
}

try {
  var publickey = fs.readFileSync(etc.PATH_KEY, 'utf-8');
} catch (err) {
  console.error('ERR No Tessel public key found.');
  console.error('ERR Please install the t2-cli and run `t2 key generate` first.');
  process.exit(1);
}

var spawn = require('child_process').spawn
  , concat = require('concat-stream')
  , Promise = require('bluebird')
  , inquirer = require("inquirer")


Promise.try(function () {
  shell.info('Initializing VM...');
  return etc.exec('VBoxManage', ['createvm', '--name', etc.VM_NAME, '--ostype', 'Linux', '--register'], {
    quiet: true,
  })
})
.catch(function () {
  shell.info('(Replacing previous VM...)');
  return etc.exec('VBoxManage', ['unregistervm', etc.VM_NAME, '--delete'], {
    quiet: false,
  })
  .then(function () {
    return etc.exec('VBoxManage', ['createvm', '--name', etc.VM_NAME, '--ostype', 'Linux', '--register'])
  });
})
.then(function () {
  return new Promise(function (resolve, reject) {
    var p = spawn('VBoxManage', ['list', 'bridgedifs'])
    p.stdout.pipe(concat(function (data) {
      var R = /^Name:\s*(.*?)$/mg;
      var D = /^Name:\s*(.*?)$/m;
      var names = data.toString().match(R).map(function (line) {
        return line.match(D)[1];
      })
      resolve(names);
    })) 
    p.on('exit', function (code) {
      code ? reject(code) : resolve();
    })
  });
})
.then(function (names) {
  return new Promise(function (resolve, reject) {
    inquirer.prompt([
      {
        type: "rawlist",
        name: "bridge",
        message: "Choose a bridge interface (or hit enter)",
        choices: names
      },
    ], function (answers) {
      resolve(answers.bridge);
    })
  })
})
.then(function (bridge) {
  shell.info('Downloading image...');

  var el = setInterval(function () {
    process.stderr.write('.');
  }, 500);

  request(etc.VM_URL)
  .pipe(fs.createWriteStream(etc.PATH_VM_VDI))
  .on('close', function (err) {
    clearInterval(el);
    shell.success(' downloaded ...');
    next();
  })

  // var multimeter = require('multimeter');
  // var multi = multimeter(process);

  // // Note that the options argument is optional 
  // multi.drop(function (bar) {
  //   bar.percent(0);
  //   progress(request(etc.VM_URL), {
  //       throttle: 100,  // Throttle the progress event to 2000ms, defaults to 1000ms 
  //       delay: 100      // Only start to emit after 1000ms delay, defaults to 10000ms 
  //   })
  //   .on('progress', function (state) {
  //       // console.log('total size in bytes', state.total);
  //       // console.log('received size in bytes', state.received);
  //       // console.log('percent', state.percent);
  //       bar.percent(state.percent);
  //   })
  //   .on('error', function (err) {
  //       // Do something with err 
  //   })
  //   .pipe(fs.createWriteStream(etc.PATH_VM_VDI))
  //   .on('error', function (err) {
  //       // Do something with err 
  //   })
  //   .on('close', function (err) {
  //       // Saved to doogle.png! 
  //       bar.percent(100);
  //       multi.charm.end();
  //       console.error('');
  //       next();
  //   })
  // });

  function next () {
    Promise.try(function () {
      shell.info('Creating VM...');
    })
    .then(function () {
      return etc.exec('VBoxManage', ['storagectl', etc.VM_NAME, '--name', 'IDE Controller', '--add', 'ide'])
    })
    .then(function () {
      return etc.exec('VBoxManage', ['storageattach', etc.VM_NAME, '--storagectl', 'IDE Controller', '--port', '0', '--device', '0', '--type', 'hdd', '--medium', etc.PATH_VM_VDI])
    })
    .then(function () {
      return etc.exec('VBoxManage', ['modifyvm', etc.VM_NAME, '--memory', '64', '--audiocontroller', 'ac97', '--audio', audiocontroller, '--nic1', 'nat', '--nic2', 'bridged', '--bridgeadapter2', bridge, '--usb', 'on'])
    })
    .then(function () {
      return etc.exec('VBoxManage', ['usbfilter', 'add', '0', '--target', etc.VM_NAME, '--name', 'Arduino', '--vendorid', '0x2341', '--productid', '0x0043'])
    })
    .then(function () {
      shell.info("Attaching to serial port: "+etc.PATH_VM_PORT);
      return etc.exec('VBoxManage', ['modifyvm', etc.VM_NAME, '--uart1', '0x3F8', '4', '--uartmode1', 'server', etc.PATH_VM_PORT])
    })
    .then(function () {
      var p = etc.startvm(etc.VM_NAME);

      Promise.resolve()
      .delay(
        // VM takes 10+ seconds to startup
        10*1000
      ).then(function () {
        shell.info('Configuring VM...');

        var s = net.createConnection({
          path: etc.PATH_VM_PORT
        }, function () {
          
          // This throws from stderr on shutdown, never allowing you to record the VM name
          s.on('error', function(err){
            // Silence is golden
          });

          p.on('exit', function () {
            s.end();
          })

          shell.info('Opened serial connection to VirtualBox...');
          shell.info('Awaiting hostname...');

          var r  = /^root@(Tessel-[0-9A-F]+):/m;
          var hostname = null;

          var pingid = setInterval(function () {
            s.write('\n');
          }, 100);

          var warnid = setTimeout(function () {
            shell.warn('This seems to be taking way too long.')
            shell.warn('Perhaps CTRL+C and try again.')
          }, 60*1000);

          var chunker = etc.chunks(128);
          s.pipe(chunker)
          .on('data', function listener (data) {
            data = data.toString();
            var r = /^root@(Tessel-[0-9A-F]+):/m;
            if (data.match(r)) {
              // Shut down listener.
              var hostname = data.match(r)[1];
              s.unpipe(chunker);
              chunker.removeListener('data', listener);

              clearInterval(pingid);
              clearTimeout(warnid);

              initialize(hostname);
            }
          });

          function initialize (hostname) {
            p.on('exit', function () {
              console.log('VM ready. Run `t2-vm launch`');
              console.log("Found Tessel: ", hostname);
              fs.writeFileSync(etc.PATH_VM_NAME, hostname);
            });

            shell.info('Configuring VM settings...');

            s.write([
              [
                "sed -ie '20,22c",
                "   option input ACCEPT",
                "   option output ACCEPT",
                "   option forward ACCEPT' /etc/config/firewall"
              ].join('\\\n'),
              shellescape(['echo', publickey]) + ' >> /etc/dropbear/authorized_keys',
              '/etc/init.d/tessel-mdns enable',
              'poweroff',
              ''
            ].join('\n'));
          }
        });
      });
    });
  }
});