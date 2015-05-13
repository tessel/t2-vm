var net = require('net')
  , through = require('through')
  , spawn = require('child_process').spawn
  , Promise = require('bluebird')
  , shellescape = require('shell-escape')
  , fs = require('fs')
  , request = require('request')
  , progress = require('request-progress')
  , etc = require('./etc')

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

new Promise(function (resolve, reject) {
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
  console.error('Downloading VM...');

  var el = setInterval(function () {
    process.stderr.write('.');
  }, 500);

  request(etc.VM_URL)
  .pipe(fs.createWriteStream(etc.PATH_VM_VDI))
  .on('close', function (err) {
    clearInterval(el);
    console.error(' done.');
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
      console.error('Creating VM...');
    })
    .then(function () {
      return etc.exec('VBoxManage', ['createvm', '--name', etc.VM_NAME, '--ostype', 'Linux', '--register'])
    })
    .then(function () {
      return etc.exec('VBoxManage', ['storagectl', etc.VM_NAME, '--name', 'IDE Controller', '--add', 'ide'])
    })
    .then(function () {
      return etc.exec('VBoxManage', ['storageattach', etc.VM_NAME, '--storagectl', 'IDE Controller', '--port', '0', '--device', '0', '--type', 'hdd', '--medium', etc.PATH_VM_VDI])
    })
    .then(function () {
      return etc.exec('VBoxManage', ['modifyvm', etc.VM_NAME, '--audiocontroller', 'ac97', '--audio', audiocontroller, '--nic1', 'nat', '--nic2', 'bridged', '--bridgeadapter2', bridge, '--usb', 'on'])
    })
    .then(function () {
      return etc.exec('VBoxManage', ['usbfilter', 'add', '0', '--target', etc.VM_NAME, '--name', 'Arduino', '--vendorid', '0x2341', '--productid', '0x0043'])
    })
    .then(function () {
      return etc.exec('VBoxManage', ['modifyvm', etc.VM_NAME, '--uart1', '0x3F8', '4', '--uartmode1', 'server', etc.PATH_VM_PORT])
    })
    .then(function () {
      var p = etc.startvm(etc.VM_NAME);

      Promise.resolve()
      .delay(3000)
      .then(function () {
        console.error('Configuring VM...');

        var s = net.createConnection({
          path: etc.PATH_VM_PORT,
        }, function () {
          // process.stdin.pipe(s).pipe(process.stdout);
          // s.pipe(require('fs').createWriteStream('ugh.txt'));
          // return;

          p.on('exit', function () {
            s.end();
          })
          

          var id = setInterval(function () {
            s.write('\n');
          }, 100);

          var chunker = etc.chunks(128);
          s.pipe(chunker)
          .on('data', function (data) {
            data = data.toString();
            var r = /^root@(Tessel-[0-9A-F]+):/m;
            if (data.match(r)) {
              // Shut it down
              var hostname = data.match(r)[1];
              clearInterval(id);
              s.unpipe(chunker);

              p.on('exit', function () {
                console.log('VM ready. Run `t2-vm run`');
                console.log(hostname);
                fs.writeFileSync(etc.PATH_VM_NAME, hostname);
              })

              // Write our terminating commands
              s.write('sed -ie \'20,22c\\\n     option input ACCEPT\\\n     option output ACCEPT\\\n     option forward ACCEPT\' /etc/config/firewall\n');
              s.write(shellescape(['echo', publickey]) + ' >> /etc/dropbear/authorized_keys\n')
              s.write('\npoweroff\n')
            }
          });
        })
      });
    });
  }
});
