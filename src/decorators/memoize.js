class Memoizable {
  constructor(cache = {}) {
    Object.defineProperty(this, '_memoize', {
      enumerable: false,
      writable: true,
      value: cache
    });
  }


  cloneCache() {
    return Object.assign({}, this._memoize);
  }

}

const memoize = (target, namespacing="global") => {
  // In the case the decorator is called with namespacing, we receive first the argument
  // For instance:
  //
  // @memoize
  // function bla() {}
  //
  if (!target.kind) {
    namespacing = target;
    return (target) => memoize(target, namespacing);
  }

  const wrap = (field) => {
    const original = target.descriptor[field];
    target.descriptor[field] = function(...args) {
      if (!(this instanceof Memoizable)) {
        throw new Error(`Unable to use @memoize() on a non Memoizable class. Ensure you extend Memoizable`);
      }
      this._memoize[namespacing] = this._memoize[namespacing] || {};
      const nsCache = this._memoize[namespacing];
      if (!nsCache[target.key]) {
        nsCache[target.key] = original.apply(this, args);
      }
      return nsCache[target.key];
    }
  }

  if (typeof target.descriptor.value === 'function') {
    wrap('value');
  } else if (typeof target.descriptor.get === 'function') {
    wrap('get');
  }
  return target;
}

export { Memoizable, memoize };
