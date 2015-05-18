
var slice = [].slice;

module.exports = (function() {

  function Capped_Collection(max) {
    this.max = max != null ? max : 500;
    this._ = [];
    this;
  }

  Capped_Collection.prototype.all = function() {
    return this._;
  };

  Capped_Collection.prototype.trimLeft = function() {
    if (this._.length <= this.max) {
      return this;
    }
    Array.prototype.splice.call(this._, 0, this._.length - this.max);
    return this;
  };

  Capped_Collection.prototype.trimRight = function() {
    if (this._.length <= this.max) {
      return this;
    }
    Array.prototype.splice.call(this._, this.max, this._.length - this.max);
    return this;
  };

  Capped_Collection.prototype.at = function(i) {
    return this._[i];
  };

  Capped_Collection.prototype.last = function(n) {
    if (!n) {
      return this.at(this._.length - 1);
    }
    return this.slice(n * -1);
  };

  Capped_Collection.prototype.pop = function(){
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return Array.prototype.pop.apply(this._, args);
  };

  Capped_Collection.prototype.slice = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    return Array.prototype.slice.apply(this._, args);
  };

  Capped_Collection.prototype.push = function() {
    var args;
    args = 1 <= arguments.length ? slice.call(arguments, 0) : [];
    Array.prototype.push.apply(this._, args);
    this.trimLeft();
    return this;
  };

  Capped_Collection.prototype.__defineGetter__('length', function() {
    return this._.length;
  });

  return Capped_Collection;
})();