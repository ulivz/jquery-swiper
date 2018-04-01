/*!
 * jquery-swiper v0.0.1
 * (c) 2016-2018 ULIVZ
 * Released under the MIT License.
 */

const SLICK_DIRECTIONS = {
  PREV: 'PREV',
  NEXT: 'NEXT'
};

const SLICK_POSITIONS = {
  START: 'START',
  MIDDLE: 'MIDDLE',
  END: 'END'
};

function tinySlick(el, options) {
  el = $(el);

  options = $.extend({
    breakpoint: 0.25,
    rebound: 0
  }, options);

  let $window = $(window);
  let winW = $window.width();
  let trackW = 0;
  let maxX = 0;
  let minX = winW - trackW;
  let initX = 0;
  let currentX = 0;
  let startT = 0;
  let endT = 0;
  let prevX = 0;
  let nextX = 0;
  let dragging = false;
  let transitioning = false;
  let posStatus = SLICK_POSITIONS.START;

  function refreshTrackW() {
    let w = [...el.children()].map(subEl => $(subEl).width()).reduce((prev, next) => prev + next, 0);
    trackW = w;
    el.css('width', w);
    minX = winW - trackW;
  }

  refreshTrackW();

  $window.on('resize', () => {
    let oldWinW = winW;
    winW = $window.width();
    refreshTrackW();
    toPos(oldWinW / winW * currentX, 0);
  });

  function toPos(position, duration = 0.5) {
    el.trigger('scroll');
    refreshTrackW();
    if (transitioning) {
      return;
    }
    transitioning = true;
    currentX = position;
    if (position < minX) {
      currentX = minX;
    } else if (position > maxX) {
      currentX = maxX;
    }
    initX = currentX;
    el.css({
      transition: `transform ${duration}s ease-out`,
      transform: `translate3d(${currentX}px, 0, 0)`
    });
    return new Promise((resolve) => {
      setTimeout(() => {
        el.css('transition', '');
        transitioning = false;
        let newPosStatus;
        if (currentX === minX) {
          newPosStatus = SLICK_POSITIONS.END;
        } else if (currentX === maxX) {
          newPosStatus = SLICK_POSITIONS.START;
        } else {
          newPosStatus = SLICK_POSITIONS.MIDDLE;
        }
        if (newPosStatus !== posStatus) {
          posStatus = newPosStatus;
          el.trigger('pos-status-change', posStatus);
        }
        el.trigger('scroll');
        resolve();
      }, duration * 1000);
    });
  }

  function slideTo(direction) {
    if (typeof direction === 'number') {
      return toPos(direction);
    } else if (typeof direction === 'string') {
      return toPos(direction === SLICK_DIRECTIONS.PREV ? currentX + winW : currentX - winW);
    }
  }

  function start(e) {
    dragging = true;
    prevX = e.pageX || e.x;
    startT = Date.now();
  }

  function move(e) {
    if (!dragging) {
      return;
    }
    el.trigger('scroll');
    nextX = e.pageX || e.x;
    let diff = nextX - prevX;
    prevX = nextX;
    currentX = currentX + diff;
    if (currentX > maxX + options.rebound) {
      currentX = maxX + options.rebound;
    } else if (currentX < minX - options.rebound) {
      currentX = minX - options.rebound;
    }
    requestAnimationFrame(() => {
      el.css('transform', `translate3d(${currentX}px, 0, 0)`);
    });
  }

  function end(e, cb) {
    dragging = false;
    endT = Date.now();
    if (initX === currentX) {
      el.trigger('event-type-change', 'click');
      return;
    }
    el.trigger('event-type-change', 'mouse');
    cb && cb();
    toPos(currentX, 0.3);
  }

  const mousedown = start;
  const mousemove = move;
  const mouseup = (e) => end(e, () => {
    let distance = currentX - initX;
    let speed = distance / (endT - startT);
    currentX = currentX + speed * 450;
  });

  const touchstart = (e) => start(e.touches ? e.touches[0] : e.originalEvent.touches[0] || e);
  const touchmove = (e) => move(e.touches ? e.touches[0] : e.originalEvent.touches[0] || e);
  const touchend = (e) => end(e, () => {
    let gain = Math.abs(currentX) / winW;
    let diff = (currentX - initX) / winW;
    let maxGain = Math.ceil(gain);
    let minGain = Math.floor(gain);
    let shouldSwitch = Math.abs(diff) > options.breakpoint;
    if (diff > 0) {
      if (initX === 0) {
        currentX = 0;
      } else {
        currentX = -winW * (shouldSwitch ? minGain : maxGain);
      }
    } else {
      currentX = -winW * (shouldSwitch ? maxGain : minGain);
    }
  });

  el.on({
    mousedown,
    mousemove,
    mouseup,
    mouseleave: mouseup,
    touchstart,
    touchmove,
    touchend
  });
  return {
    slideTo
  };
}