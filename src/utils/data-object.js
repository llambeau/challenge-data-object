import { Memoizable } from '../decorators/memoize';

const witherName = (attrName) => {
  return 'with' + attrName[0].toUpperCase() + attrName.slice(1);
}

export default class DataObject extends Memoizable {

  constructor(raw = {}, cache = {}) {
    super(cache);

    // Save the raw def
    Object.defineProperty(this, "_raw", {
      value: raw,
      enumerable: false,
      writable: false
    });
    // Add our magic attributes
    Object.keys(raw).forEach((key) => {
      this.defineAttr(key);
    });
    // Make the instance immutable
    Object.freeze(this);
  }

  withOverride(attrName, newValue, originalValue) {
    const override = [];
    override[attrName] = newValue;
    const newRaw = Object.assign({}, this._raw, override);
    const newCache = this.cloneCache();
    delete newCache[attrName];
    return new this.constructor(newRaw, newCache);
  }

  defineAttr(attrName) {
    this[witherName(attrName)] = (newValue) => {
      const originalValue = this._raw[attrName];
      return this.withOverride(attrName, newValue, originalValue);
    };

    Object.defineProperty(this, attrName, {
      get: () => {
        const originalValue = this._raw[attrName];
        return originalValue;
      },
      set: () => {
        throw new Error(`Setting value of ${attrName} is forbidden, please use the immutable setters.`);
      }
    })
  }

}
