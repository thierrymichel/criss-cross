# criss-cross 🎤

A simple and fast API to manage viewport and  DOM elements intersections as you scroll.

> It uses [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API), so make sure to add a [polyfill](https://github.com/WICG/IntersectionObserver/tree/gh-pages/polyfill).

## Usage

```js
import crissCross from 'criss-cross';

const $el = document.querySelector('.el');
const watcher = crissCross.create($el);

watcher.enterViewport(() => {
  if (!$el.classList.contains('is-animated')) {
    $el.classList.add('is-animated');
  }
});
```
