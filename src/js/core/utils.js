S.nextId = function() {
  return 'sid_' + id++;
}

S.map = function() {
  var _map = {},
    map = function(key, value) {
      console.log('attempting to store ' + key.sid);
      if(!key.sid)
        throw new Error('S.map() requires sid property. Use S.nextId().');
      if(typeof value === 'undefined') {
        return _map[key.sid];
      }
      _map[key.sid] = value;
    };

  map.clear = function() {
    _map = {};
  };

  map.delete = function(key) {
    if(!key.sid)
      throw new Error('S.map() requires sid property. Use S.nextId().');
    delete _map[key.sid];
  };

  map.has = function(key) {
    if(!key.sid)
      throw new Error('S.map() requires sid property. Use S.nextId().');
    return typeof _map[key.sid] !== 'undefined';
  }

  map.forEach = function(fn, thisArg) {
    if(!thisArg)
      thisArg = {};
    for(var key in _map) {
      fn.call(thisArg, [key, _map[key]]);
    }
  }

  return map;
}

S.wait = function(func, time) {
  setTimeout(func, time);
}