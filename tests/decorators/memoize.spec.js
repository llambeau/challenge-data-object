import { Memoizable, memoize } from '../../src/decorators/memoize';
import { expect } from 'chai';

describe('@memoize', () => {

  it('is a function', () => {
    expect(memoize).to.be.an.instanceOf(Function);
  });

  describe('when used as a function decorator', () => {

    class Test extends Memoizable {
      constructor() {
        super();
        this.callCount = 0;
      }
      @memoize
      heavyWork() {
        this.callCount++;
        return 42;
      }

      @memoize
      get name() {
        this.callCount++;
        return 'louis';
      }
    }

    it('works as expected with functions', () => {
      const t = new Test();
      expect(t.heavyWork()).to.equal(42);
      expect(t.callCount).to.equal(1);
      expect(t.heavyWork()).to.equal(42);
      expect(t.callCount).to.equal(1);
    });

    it('works as expected with getters', () => {
      const t = new Test();
      expect(t.name).to.equal('louis');
      expect(t.callCount).to.equal(1);
      expect(t.name).to.equal('louis');
      expect(t.callCount).to.equal(1);
    });

  });

});
