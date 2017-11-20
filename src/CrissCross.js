import * as events from './event-types';
import Item from './Item';

const _items = new WeakMap();
const _observers = new WeakMap();

export default class CrissCross {
  constructor() {
    _items.set(this, []);
    _observers.set(this, []);

    this._intersected = this._intersected.bind(this);
  }

  create(target, {
    offset = 0,
    root = null,
  } = {}) {
    let $el = target;

    // Target is CSS selector
    if (typeof $el === 'string') {
      $el = document.querySelector(target);
    }

    // Target is valid element
    if (!$el || !($el instanceof HTMLElement)) {
      throw new Error('[🎤 criss-cross] Invalid target. Should be an HTMLElement.');
    }

    // Target is root child
    if (root !== null && !root.contains($el)) {
      throw new Error('[🎤 criss-cross] Invalid target. Should be a child of root.');
    }

    const options = CrissCross._setOptions(offset, root);
    const observer = this._createObserver(options);
    const item = this._createItem($el, observer);

    item.init();

    return item;
  }

  update(item, {
    offset = 0,
    root = null,
  } = {}) {
    item.pause();
    this._destroyObserver(item.observer);

    const options = CrissCross._setOptions(offset, root);
    const observer = this._createObserver(options);

    item.observer = observer;
    item.resume();
  }

  destroy() {
    const items = _items.get(this);
    const observers = _observers.get(this);

    items.length = 0;
    observers.forEach(observer => {
      observer.disconnect();
    });
    observers.length = 0;
  }

  static _setOptions(offset, root) {
    const options = {
      root: null,
      rootMargin: '0px 0px 0px 0px',
      // !DEV
      // precision properties ? from > 0 to 1 ?
      // threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1], // Perf matters?
      threshold: [0, 1],
    };

    if (typeof offset === 'object') {
      const top = offset.top || 0;
      const bottom = offset.bottom || 0;

      options.rootMargin = `${top}px 0px ${bottom}px 0px`;
    } else {
      options.rootMargin = `${offset}px 0px ${offset}px 0px`;
    }

    options.root = root;

    return options;
  }

  _intersected(entries, observer) {
    // Get observed items
    const items = this._getItems(observer);

    entries.forEach(entry => {
      // Get entry's related item
      // console.info(entry);

      const item = items.find(item => {
        if (item.isLocked) {
          return item.$ghost === entry.target;
        }

        return item.$el === entry.target;
      });

      item.isBeforeViewport = entry.boundingClientRect.top < entry.rootBounds.top;
      item.isAfterViewport = entry.boundingClientRect.top + entry.boundingClientRect.height >
      entry.rootBounds.top + entry.rootBounds.height;

      if (entry.isIntersecting) {
        item.isInViewport = true;
        if (entry.intersectionRatio >= 1) {
          item.isFullyInViewport = true;
        } else {
          item.isFullyInViewport = false;
        }
      } else {
        item.isInViewport = false;
        item.isFullyInViewport = false;
      }

      if (item.wasInViewport === undefined) {
        // First run, on 'init'
        if (item.isInViewport && !item.isFullyInViewport) {
          if (item.isAfterViewport) {
            item.trigger(events.ENTER_VIEWPORT);
          }
          if (item.isBeforeViewport) {
            item.trigger(events.EXIT_VIEWPORT);
          }
          item.trigger(events.VISIBILITY_CHANGE);
        }
        if (item.isFullyInViewport) {
          item.trigger(events.FULLY_ENTER_VIEWPORT);
          item.trigger(events.VISIBILITY_CHANGE);
        }
        if (!item.isInViewport && item.isBeforeViewport) {
          item.trigger(events.EXIT_VIEWPORT);
          item.trigger(events.FULLY_EXIT_VIEWPORT);
        }
      } else {
        if (item.isInViewport && !item.wasInViewport) {
          item.trigger(events.ENTER_VIEWPORT);
          item.trigger(events.VISIBILITY_CHANGE);
          item.trigger(events.STATE_CHANGE);
        }

        if (item.isFullyInViewport && !item.wasFullyInViewport) {
          item.trigger(events.FULLY_ENTER_VIEWPORT);
          item.trigger(events.STATE_CHANGE);
        }

        if (!item.isFullyInViewport && item.wasFullyInViewport) {
          item.trigger(events.EXIT_VIEWPORT);
          item.trigger(events.STATE_CHANGE);
        }

        if (!item.isInViewport && item.wasInViewport) {
          item.trigger(events.FULLY_EXIT_VIEWPORT);
          item.trigger(events.VISIBILITY_CHANGE);
          item.trigger(events.STATE_CHANGE);
        }
      }

      item.wasBeforeViewport = item.isBeforeViewport;
      item.wasInViewport = item.isInViewport;
      item.wasFullyInViewport = item.isFullyInViewport;
      item.wasAfterViewport = item.isAfterViewport;
    });
  }

  _createObserver(options) {
    const existingObserver = this._getObserver(options);

    if (existingObserver) {
      return existingObserver;
    }

    const newObserver = new IntersectionObserver(
      this._intersected,
      options
    );

    this._addObserver(newObserver);

    return newObserver;
  }

  _addObserver(observer) {
    _observers.get(this).push(observer);
  }

  _getObserver(options) {
    const observers = _observers.get(this);

    return observers.find(observer => observer.root === options.root &&
      observer.rootMargin === options.rootMargin);
  }

  _destroyObserver(observer) {
    const observers = _observers.get(this);
    const index = observers.indexOf(observer);

    observer.disconnect();
    observers.splice(index, 1);
  }

  _createItem($el, observer) {
    const item = new Item($el, observer, this);

    this._addItem(item);

    return item;
  }

  _addItem(item) {
    _items.get(this).push(item);
  }

  _getItems(observer) {
    const items = _items.get(this);

    return items.filter(item => item.observer === observer);
  }

  _destroyItem(item) {
    const items = _items.get(this);
    const index = items.indexOf(item);
    const { observer } = item;

    items.splice(index, 1);

    const remainingItems = this._getItems(observer);

    if (remainingItems.length === 0) {
      this._destroyObserver(observer);
    }
  }
}
