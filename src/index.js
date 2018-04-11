/*!
 * jquery-swiper v0.0.1
 * (c) 2016-2018 ULIVZ
 * Released under the MIT License.
 */

const SLICK_POSITIONS = {
  START: 'START',
  PREV: 'PREV',
  NEXT: 'NEXT'
};

const SLICK_POSITION_STATUS = {
  START: 'START',
  MIDDLE: 'MIDDLE',
  END: 'END'
};

const POSITION_STATUS_CHANGE_EVENT = 'pos-status-change';
const EVENT_TYPE_CHANGE_EVENT = 'event-type-change';
const EVENT_TYPES = {
  CLICK: 'click',
  MOVE: 'move'
};

class TinySlick {
  constructor(el, options) {
    this.el = $(el);
    this.options = $.extend({ breakpoint: 0.25, rebound: 0 }, options);
    this.trackW = 0;         // Slide's track's width
    this.maxX = 0;         // maximum value of transformX
    this.minX = 0;         // minimum value of transformX
    this.initX = 0;         // initial transformX before every move/drag
    this.currentX = 0;         // current transformX
    this.startT = 0;         // start timestamp when triggering touchstart/mousedown
    this.endT = 0;         // end timestamp when triggering touchstart/mousedown
    this.prevX = 0;         // transformX before triggering each touchmove
    this.nextX = 0;         // transformX after triggering each touchmove
    this.dragging = false;     // Whether user is dragged
    this.transitioning = false;     // Whether slide is in transitioning
    this.posStatus = SLICK_POSITIONS.START;
    this.winW = $(window).width();

    this._refreshTrackW();

    $(window).on('resize', () => {
      let oldWinW = this.winW;
      this.winW = $(window).width();
      this._refreshTrackW();
      this._slideTo(oldWinW / this.winW * this.currentX, 0);
    });

    const mousedown = this.onStart.bind(this);
    const mousemove = this.onMove.bind(this);
    const mouseup = (e) => this.onEnd(e, () => {
      let distance = this.currentX - this.initX;
      let speed = distance / (this.endT - this.startT);
      this.currentX = this.currentX + speed * 450;
    });

    const touchstart = (e) => this.onStart(e.touches ? e.touches[0] : e.originalEvent.touches[0] || e);
    const touchmove = (e) => this.onMove(e.touches ? e.touches[0] : e.originalEvent.touches[0] || e);
    const touchend = (e) => this.onEnd(e, () => {
      let gain = Math.abs(this.currentX) / this.winW;
      let diff = (this.currentX - this.initX) / this.winW;
      let maxGain = Math.ceil(gain);
      let minGain = Math.floor(gain);
      let shouldSwitch = Math.abs(diff) > this.options.breakpoint;
      if (diff > 0) {
        if (this.initX === 0) {
          this.currentX = 0;
        } else {
          this.currentX = -this.winW * (shouldSwitch ? minGain : maxGain);
        }
      } else {
        this.currentX = -this.winW * (shouldSwitch ? maxGain : minGain);
      }
    });
    this.el.on({
      mousedown,
      mousemove,
      mouseup,
      mouseleave: mouseup,
      touchstart,
      touchmove,
      touchend
    });

  }

  slideTo(position) {
    if (position === SLICK_POSITIONS.START) {
      return this._slideTo(0);
    }
    return this._slideTo(position === SLICK_POSITIONS.PREV ? this.currentX + this.winW : this.currentX - this.winW);
  }

  /**
   * Slide to specific position.
   * @param {number} position
   * @param {number} duration
   * @returns {Promise|Promise<T>}
   */
  _slideTo(position, duration = 0.5) {
    this.el.trigger('scroll'); // Fake scroll event, for lazy load
    this._refreshTrackW();
    if (this.transitioning) {
      return;
    }
    this.transitioning = true;
    this.currentX = position;
    if (this.currentX < this.minX) {
      this.currentX = this.minX;
    } else if (this.currentX > this.maxX) {
      this.currentX = this.maxX;
    }
    this.initX = this.currentX;
    this.el.css({
      transition: `transform ${duration}s ease-out`,
      transform: `translate3d(${this.currentX}px, 0, 0)`
    });
    setTimeout(() => {
      this.el.css('transition', '');
      this.transitioning = false;
      let newPosStatus;
      const { START, MIDDLE, END } = SLICK_POSITION_STATUS;
      if (this.currentX === this.minX) {
        newPosStatus = END;
      } else if (this.currentX === this.maxX) {
        newPosStatus = START;
      } else {
        newPosStatus = MIDDLE;
      }
      if (newPosStatus !== this.posStatus) {
        this.posStatus = newPosStatus;
        this.el.trigger(POSITION_STATUS_CHANGE_EVENT, this.posStatus);
      }
      this.el.trigger('scroll');
    }, duration * 1000);
  }

  _refreshTrackW() {
    let w = [...this.el.children()].map(subEl => $(subEl).width()).reduce((prev, next) => prev + next, 0);
    this.trackW = w;
    this.el.css('width', w);
    this.minX = this.winW - this.trackW;
  }

  onStart(e) {
    this.dragging = true;
    this.prevX = e.pageX || e.x;
    this.startT = Date.now();
  }

  onMove(e) {
    if (!this.dragging) {
      return;
    }
    this.el.trigger('scroll');
    this.nextX = e.pageX || e.x;
    let diff = this.nextX - this.prevX;
    this.prevX = this.nextX;
    this.currentX = this.currentX + diff;
    if (this.currentX > this.maxX + this.options.rebound) {
      this.currentX = this.maxX + this.options.rebound;
    } else if (this.currentX < this.minX - this.options.rebound) {
      this.currentX = this.minX - this.options.rebound;
    }
    requestAnimationFrame(() => {
      this.el.css('transform', `translate3d(${this.currentX}px, 0, 0)`);
    });
  }

  onEnd(e, cb) {
    // Avoid trigger twice.
    e.stopPropagation();
    e.preventDefault();

    this.dragging = false;
    this.endT = Date.now();
    if (this.initX === this.currentX) {
      this.el.trigger(EVENT_TYPE_CHANGE_EVENT, EVENT_TYPES.CLICK);
      this.el.trigger('click');
      return;
    }
    this.el.trigger(EVENT_TYPE_CHANGE_EVENT, EVENT_TYPES.MOVE);
    cb && cb();
    this._slideTo(this.currentX, 0.3);
  }
}

const tinySlick = (...args) => new TinySlick(...args);
