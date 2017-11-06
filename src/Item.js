import * as events from './event-types';
import {
  $outerHeight,
  $insertAfter,
} from './dom';

const eventTypes = Object.values(events);
const _callbacks = new WeakMap();

class Item {
  constructor($el, observer, manager) {
    this.$el = $el;
    this.observer = observer;
    this.manager = manager;

    this.isInViewport = false;
    this.isFullyInViewport = false;
    this.isBeforeViewport = false;
    this.isAfterViewport = false;

    _callbacks.set(this, {});

    eventTypes.forEach(type => {
      _callbacks.get(this)[type] = [];
    });
  }

  get target() {
    return this.isLocked ? this.$ghost : this.$el;
  }

  init() {
    this.observer.observe(this.target);
  }

  pause() {
    this.observer.unobserve(this.target);
  }

  resume() {
    this.init();
  }

  destroy() {
    this.pause();
    this.manager._destroyItem(this);
  }

  // !DEV
  // May be not needed?
  // update() {
  //   this.pause();
  //   this.resume();
  // }

  lock() {
    if (this.isLocked) {
      return;
    }

    if (getComputedStyle(this.$el).position !== 'absolute') {
      throw new Error('[🎤 criss-cross] Target should be in absolute position.');
    }

    const clone = this.$el.cloneNode(false);
    const { classList } = clone;

    while (classList.length > 0) {
      classList.remove(classList.item(0));
    }

    clone.style.position = 'absolute';
    clone.style.top = `${this.$el.offsetTop}px`;
    clone.style.left = `${this.$el.offsetLeft}px`;
    // !DEV
    // !!! fixed width may causes horizontal scroll and trigger observer…
    // clone.style.width = `${$outerWidth(this.$el)}px`;
    clone.style.width = '100%';
    clone.style.height = `${$outerHeight(this.$el)}px`;
    clone.style.visibility = 'hidden';
    clone.style.opacity = 0;

    this.$ghost = clone;
    this.observer.unobserve(this.$el);
    this.observer.observe(this.$ghost);
    this.isLocked = true;

    $insertAfter(clone, this.$el);
  }

  unlock() {
    if (!this.isLocked) {
      return;
    }

    this.observer.unobserve(this.$ghost);
    this.observer.observe(this.$el);
    this.isLocked = false;

    this.$ghost.remove();
  }

  on(type, cb, one = false) {
    const callbacks = _callbacks.get(this);

    if (callbacks[type]) {
      callbacks[type].push({
        cb,
        one,
      });
    } else {
      throw new Error(`[🎤 criss-cross] Unavailable listener '${type}' [${eventTypes.join(', ')}]`);
    }
  }

  one(type, cb) {
    this.on(type, cb, true);
  }

  off(type, cb) {
    const callbacks = _callbacks.get(this);

    if (callbacks[type]) {
      callbacks[type].some((callback, i) => {
        if (callback.cb === cb) {
          callbacks[type].splice(i, 1);
        }

        return callback.cb === cb;
      });
    } else {
      throw new Error(`[🎤 criss-cross] Unavailable listener '${type}' [${eventTypes.join(', ')}]`);
    }
  }

  trigger(type) {
    const callbacks = _callbacks.get(this);

    if (callbacks[type].length > 0) {
      callbacks[type].forEach(callback => {
        callback.cb();

        if (callback.one) {
          this.off(type, callback.cb);
        }
      });
    }
  }
}

eventTypes.forEach(type => {
  Item.prototype[type] = function addCallback(cb) {
    this.on(type, cb);
  };
});

export default Item;
