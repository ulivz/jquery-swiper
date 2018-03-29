function tinySlick(el, options) {
  el = $(el)

  options = $.extend({
    breakpoint: 0.25,
    rebound: 0,
    mode: 'swipe'
  }, options)

  let currentX = 0 // current value of transformX
  let initX = 0
  let prevX = 0
  let nextX = 0
  let $window = $(window)
  let winW = $window.width()
  let maxX = 0
  let minX = winW - el.width()
  let isMobile = false

  let isMouseDown = true

  $window.on('resize', () => {
    winW = $window.width()
  })

  function start(e) {
    let type = e.originalEvent.type
    if (type === 'mousedown') {
      isMouseDown = true
    }
    console.warn(type)
    e = e.touches ? e.touches[0] : e
    prevX = e.pageX || e.x
  }

  function move(e) {
    let type = e.originalEvent.type
    console.warn(type)

    if (type === 'mousemove' && !isMouseDown) {
      return
    }
    e = e.touches ? e.touches[0] : e
    nextX = e.pageX
    let diff = nextX - prevX
    console.log(diff)
    prevX = nextX
    currentX = currentX + diff
    if (currentX > maxX + options.rebound) {
      currentX = maxX + options.rebound
    } else if (currentX < minX - options.rebound) {
      currentX = minX - options.rebound
    }
    requestAnimationFrame(() => {
      el.css('transform', `translate3d(${currentX}px, 0, 0)`)
    })
  }

  function end(e) {
    let type = e.originalEvent.type
    isMouseDown = false
    console.warn(type)
    e = e.touches ? e.touches[0] : e
    // console.log('initX = ' + initX)
    // console.log('currentX = ' + currentX)

    let gain = Math.abs(currentX) / winW
    let diff = (currentX - initX) / winW

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
        currentX = -winW * (shouldSwitch ? minGain : maxGain)
      }
    } else {
      currentX = -winW * (shouldSwitch ? maxGain : minGain)
    }

    console.log('currentX = ' + currentX)

    if (currentX < minX) {
      currentX = minX
    } else if (currentX > maxX) {
      currentX = maxX
    }

    initX = currentX

    el.off('touchmove', touchmove)
    el.css({
      transition: `transform 0.3s`,
      transform: `translate3d(${currentX}px, 0, 0)`
    })
    setTimeout(() => {
      el.on('touchmove', touchmove)
      el.css({
        transition: ''
      })
    }, 300)
  }

  const mousedown = start
  const mousemove = move
  const mouseup = end
  const touchstart = start
  const touchmove = move
  const touchend = end

  el.on({
    mousedown,
    mousemove,
    mouseup,
    touchstart,
    touchmove,
    touchend
  })
}