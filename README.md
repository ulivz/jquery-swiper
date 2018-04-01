# JQuery Swiper

> A fully responsive jquery swiper whose core is only ≈ 150 SLOC.


# Features

- Responsive.
- Fast with using CSS3 (GPU acceleration).
- At mobile, **_swipe_** to swtich.
- At desktop side, **_drag_** to move (Support **_inertial movement_**).
- Support **_Rebound_** and **_Smoothing Scroll_**.
- All view can call API to switch view.

Check out the online demo: http://www.v2js.com/jquery-swiper


# Usage

```js
// Initialize
const slick = tinySlick($track, {
  breakpoint: 0.2, // % to the screen's width, use to determine whether to switch silde.
  rebound: 200 // maxiunm px value of rebound. set 0 to disable rebound.
})

// Event
$track.on('event-type-change', (e, eventType) => {
  // eventType would be 'click' or 'mouse'(drag or touchmove).
})

$track.on('pos-status-change', (e, posStatus) => {
  // posStatus would be 'START', 'MIDDLE' or 'END'.
})

// Move slide
slick.slideTo('PREV') // To previos slide
slick.slideTo('NEXT') // To next slide
slick.slideTo(100) // To specified position (px)
```

## Author

**jquery-swiper** © [ulivz](https://github.com/ULIVZ), Released under the [MIT](./LICENSE) License.<br>
Authored and maintained by ulivz with help from contributors ([list](https://github.com/ULIVZ/jquery-swiper/contributors)).

> [github.com/ulivz](https://github.com/ulivz) · GitHub [@ulivz](https://github.com/ULIVZ)
