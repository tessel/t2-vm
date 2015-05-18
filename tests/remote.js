var Remote = require('../remote-exec')
  , net = require('net')
  , etc = require('../etc');


debug = function(data){
 console.log(data.join(''), "\n")
};

firewall = ["sed -ie '20,22c",
  "   option input ACCEPT",
  "   option output ACCEPT",
  "   option forward ACCEPT'",
  "-f /etc/config/firewall"
].join('\\\n');

var s = net.createConnection({
    path: etc.PATH_VM_PORT
  }, function () {
    

    vm = Remote.bind(s);
    
    vm
      .run('echo test', function(err, result){
        debug(result);
      })
      .exec(function(){
        console.log('done...');
        process.exit(0);
      });

  });