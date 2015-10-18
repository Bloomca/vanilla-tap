/* global define */

import { isElement } from './isNode';

const VanillaTap = (element, cb, options = {}) => {
  // tap library
  // from here -- https://github.com/filamentgroup/tappy/blob/master/tappy.js
  // the goal was to get rid of jQuery
  // and to rewrite in es6
  let resetTimer;
  let startY;
  let startX;
  let cancel;
  const scrollTolerance = options.scrollTolerance || 10;

  if (!isElement(element)) throw new Error('you should provide actual DOM node');
  if (typeof cb !== 'function') throw new Error('you should provide correct callback function');

  function getCoords(e) {
    const ev = e.originalEvent || e;
    const touches = ev.touches || ev.targetTouches;

    return touches ? [ touches[ 0 ].pageX, touches[ 0 ].pageY ] : null;
  }

  function start(e) {
    if ((e.touches && e.touches.length > 1)
     || (e.targetTouches && e.targetTouches.length > 1)) return false;

    const coords = getCoords(e);
    startX = coords[ 0 ];
    startY = coords[ 1 ];
  }

  // any touchscroll that results in > tolerance should cancel the tap
  function move(e) {
    if (!cancel) {
      const coords = getCoords(e);
      if (coords && (Math.abs( startY - coords[ 1 ] ) > scrollTolerance)
       || Math.abs(startX - coords[ 0 ] ) > scrollTolerance ) {
        cancel = true;
      }
    }
  }

  function end(e) {
    clearTimeout(resetTimer);
    resetTimer = setTimeout(() => {
      cancel = false;
    }, 500);

    // make sure no modifiers are present. thx http://www.jacklmoore.com/notes/click-events/
    if (( e.which && e.which > 1 ) || e.shiftKey || e.altKey || e.metaKey || e.ctrlKey ) return;

    e.preventDefault();

    // this part prevents a double callback from touch and mouse on the same tap

    // if a scroll happened between touchstart and touchend
    if (cancel) {
      cancel = false;
      return;
    }

    cb(e);
  }

  element.addEventListener('touchstart', start);
  element.addEventListener('touchmove', move);
  element.addEventListener('touchend', end);

  return function dispose() {
    element.removeEventListener('touchstart', start);
    element.removeEventListener('touchmove', move);
    element.removeEventListener('touchend', end);
  };
};

export default VanillaTap;
