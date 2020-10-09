import DataObject from '../../src/utils/data-object';
import { memoize } from '../../src/decorators/memoize';
import { expect } from 'chai';

describe('#DataObject', () => {

  let object;
  beforeEach(() => {
    object = new DataObject({
      foo: 'foo',
      bar: 'bar'
    });
  });

  describe('#constructor', () => {

    it('works', () => {
      expect(new DataObject()).to.be.an.instanceof(DataObject);
    });

    it('exposes the raw attributes with getters', () => {
      expect(object.foo).to.equal('foo');
    });

    it('returns frozen objects', () => {
      expect(Object.isFrozen(object)).to.equal(true);
      expect(() => {
        object.newproperty = 2;
      }).to.throw(/object is not extensible/);
    });

  });

  describe('the functional aspect of the object', () => {

    it('generates one with-er for each attribute', () => {
      expect(object.withFoo).to.be.an.instanceof(Function);
      expect(object.withBar).to.be.an.instanceof(Function);
    });

    it('returns a new instance of the object', () => {
      // foo
      let newObject = object.withFoo('new foo value');
      expect(newObject).to.not.equal(object);
      // bar
      newObject = object.withBar('new bar value');
      expect(newObject).to.not.equal(object);
    });

    it('returns a new instance and clones data attributes', () => {
      // foo
      let newObject1 = object.withFoo('new foo value');
      expect(object.foo).to.equal('foo');
      expect(newObject1.foo).to.equal('new foo value');
      expect(newObject1.bar).to.equal('bar');
      // bar
      let newObject2 = object.withBar('new bar value');
      expect(newObject2).to.not.equal(object);
      expect(newObject2).to.not.equal(newObject1);
      expect(object.bar).to.equal('bar');
      expect(newObject2.bar).to.equal('new bar value');
    });

  });

  describe('trying to change the object state', () => {

    it('is forbidden for raw attributes', () => {
      const set = (attr, value) => () => object[attr] = value;
      expect(set('foo', 'not foo')).to.throw(/Setting value of foo is forbidden/);
      expect(set('bar', 'not bar')).to.throw(/Setting value of bar is forbidden/);
    });

  });

  describe('when subclassing', () => {

    class Person extends DataObject {

    };

    it('still behaves as the DataObject class', () => {
      const p = new Person({ foo: 'foo', bar: 'bar' });
      expect(p).to.be.an.instanceof(DataObject);
      expect(p).to.be.an.instanceof(Person);
      expect(p.foo).to.equal('foo');
      expect(p.bar).to.equal('bar');

      expect(p.withFoo).to.be.an.instanceof(Function);
      const p2 = p.withFoo('new foo');
      expect(p2).to.be.an.instanceof(DataObject);
      expect(p2).to.be.an.instanceof(Person);
    });

  });

  describe('when subclassing and using @memoize(depField)', () => {
    let callCount;
    beforeEach(() => {
      callCount = 0;
    });

    class Person extends DataObject {
      @memoize('name')
      get nameUpperCase() {
        callCount++;
        return this.name.toUpperCase();
      }
      @memoize('birthYear')
      get age() {
        return 2020 - this.birthYear;
      }
    }

    it('caches the memoized functions', () => {
      const p = new Person({ name: 'foo' });
      expect(p.nameUpperCase).to.equal('FOO');
      expect(callCount).to.equal(1);
      expect(p.nameUpperCase).to.equal('FOO');
      // Shouldn't have been called the second time, that's the whole point ;-)
      expect(callCount).to.equal(1);
    });

    describe('when using the functional modifiers', () => {
      it('resets the (memoized) cache when creating new objects through with-ers', () => {
        const p = new Person({ name: 'foo' });
        expect(p.nameUpperCase).to.equal('FOO');

        const p2 = p.withName('bar');
        expect(p2.name).to.equal('bar');
        expect(p2.nameUpperCase).to.equal('BAR');
      });

      it('does not loose the cache for untouched items', () => {
        const p = new Person({ name: 'foo', birthYear: 2000 });
        expect(p.nameUpperCase).to.equal('FOO');
        expect(callCount).to.equal(1);
        expect(p.age).to.equal(20);

        const p2 = p.withBirthYear(1985);
        expect(p2.nameUpperCase).to.equal('FOO');
        expect(callCount).to.equal(1);
        expect(p2.age).to.equal(35);
      });
    });

  });

});
