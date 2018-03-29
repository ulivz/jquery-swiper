function tinySlick(el, options) {
  el = $(el)

  options = $.extend({
    breakpoint: 0.2,
    rebound: 0,
    mode: 'swipe'
  }, options)

  let currentX = 0 // current value of transformX
  let initX = 0
  let prevX
  let nextX
  let $window = $(window)
  let windowWidth = $window.width()
  let max = 0
  let min = windowWidth - el.width()

  $window.on('resize', () => {
    windowWidth = $window.width()
  })

  function touchstart(event) {
    console.warn('touchstart')
    var events = event.touches[0] || event;
    prevX = events.pageX
  }

  function touchmove(event) {
    console.warn('touchmove')
    let events = event.touches[0] || event;
    nextX = events.pageX
    let diff = nextX - prevX
    prevX = nextX
    currentX = currentX + diff
    if (currentX > max + options.rebound) {
      currentX = max + options.rebound
    } else if (currentX < min - options.rebound) {
      currentX = min - options.rebound
    }
    requestAnimationFrame(() => {
      el.css('transform', `translate3d(${currentX}px, 0, 0)`)
    })
  }

  function touchend() {
    // console.log('initX = ' + initX)
    // console.log('currentX = ' + currentX)

    let gain = Math.abs(currentX) / windowWidth
    let diff = (currentX - initX) / windowWidth

    let maxGain = Math.ceil(gain)
    let minGain = Math.floor(gain)
    let shouldSwitch = Math.abs(diff) > options.breakpoint

    // console.log('gain = ' + gain)
    // console.log('diff = ' + diff)
    // console.log('Should switch: ' + (shouldSwitch))

    if (diff > 0) {
      if (initX === 0) {
        currentX = 0
      } else {
        currentX = -windowWidth * (shouldSwitch ? minGain : maxGain)
      }
    } else {
      currentX = -windowWidth * (shouldSwitch ? maxGain : minGain)
    }

    console.log('currentX = ' + currentX)

    if (currentX < min) {
      currentX = min
    } else if (currentX > max) {
      currentX = max
    }

    initX = currentX

    el.off('touchmove', touchmove)
    el.css({
      transition: `transform 0.5s`,
      transform: `translate3d(${currentX}px, 0, 0)`
    })
    setTimeout(() => {
      el.on('touchmove', touchmove)
      el.css({
        transition: ''
      })
    }, 500)
  }

  el.on({
    touchmove,
    touchstart,
    touchend
  })
}