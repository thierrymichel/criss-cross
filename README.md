# 🎤 criss-cross

![stability-wip](https://img.shields.io/badge/stability-work_in_progress-lightgrey.svg?style=flat-square)
[![Npm Version](https://img.shields.io/npm/v/criss-cross.svg?style=flat-square)](https://www.npmjs.com/package/criss-cross)
[![Build Status](https://img.shields.io/travis/thierrymichel/criss-cross/master.svg?style=flat-square)](https://travis-ci.org/thierrymichel/criss-cross)
[![Coverage Status](https://img.shields.io/coveralls/thierrymichel/criss-cross/master.svg?style=flat-square)](https://coveralls.io/github/thierrymichel/criss-cross?branch=master)

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
