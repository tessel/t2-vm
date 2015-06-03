
var etc = require('./etc');
var noop= function(){ };

module.exports = function(){
  var instance     = {};
  instance.vm      = null;
  instance.queue   = [];
  instance.SIZE    = 1024*(1/10);
  instance.chunker = etc.chunks(instance.SIZE);
  instance.fin     = noop;

  instance.reset   = function(){
    instance.buff = [];
    clearInterval(instance.poll);
    return instance;
  };


  instance.reset();

  instance.exec = function(fin){
    if ( fin ) instance.fin = fin;
    instance.next();
  }

  instance.next = function(){

    if ( instance.queue.length < 1 ) return instance.fin();
    var pair = instance.queue.shift();//.apply(null, Array.prototype.slice.call(arguments, 0));
    var cmd  = pair[0];
    var cb   = pair[1];
    
    instance.listen(cb, cmd);

    instance.vm.write(cmd+"\n");
    //instance.vm.write("echo {{end}}\n")
    instance.poll = setInterval(instance.vm.write.bind(instance.vm, "echo {{end}}\n"), 100);

    return instance;
  }

  // watches for command completion and such
  instance.watcher = function (data){
    var data = data.toString();
    //multiline command
    if ( !~data.indexOf("{{end}}") ) return instance.buff.push(data);                 
    
    instance.buff.push(data);

    var result = instance.buff.slice(0);

    instance
      .reset()
      .downstream
      .removeAllListeners();

    this.after(null, result);
    instance.next();
  }

  instance.listen = function (cb, cmd){
    instance.downstream.on( 'data', instance.watcher.bind({
        after: cb, cmd: cmd
      })
    );
    return instance;
  }

  
  instance.bind = function (vm){
    if ( instance.pipe ) instance.pipe.removeAllListeners();
    instance.vm = vm;
    instance.downstream = instance.vm.pipe(instance.chunker);
    return instance;
  }

  instance.run = function (cmd, fn){
    
    instance.queue.push([ cmd, fn || noop ]);

    return instance;
  }

  instance.then = function (fn){
    last = instance.queue.length-1
    
    instance.queue[last][1] = fn
    return instance;
  }


  return instance;

}();