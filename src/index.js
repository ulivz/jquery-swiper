/*!
 * jquery-swiper v0.0.1
 * (c) 2016-2018 ULIVZ
 * Released under the MIT License.
 */

function tinySlick(el, options) {
  el = $(el)

  options = $.extend({
    breakpoint: 0.25,
    mediaBreakpoint: 1024,
    rebound: 0
  }, options)

  let $window = $(window)
  let winW = $window.width()
  let maxX = 0
  let minX = winW - el.width()
  let initX = 0
  let currentX = 0
  let startT = 0
  let endT = 0
  let isActive = false
  let prevX = 0
  let nextX = 0

  $window.on('resize', () => {
    winW = $window.width()
  })

  function start(e, cb) {
    console.warn('start')
    isActive = true
    prevX = e.pageX || e.x
    cb && cb()
    startT = Date.now()
  }

  function move(e, cb) {
    if (!isActive) return
    nextX = e.pageX || e.x
    let diff = nextX - prevX
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

  function end(e, cb) {
    console.warn('end')
    isActive = false
    endT = Date.now()

    let distance = currentX - initX
    let speed = distance / (endT - startT)

    cb && cb(distance, speed)

    if (currentX < minX) {
      currentX = minX
    } else if (currentX > maxX) {
      currentX = maxX
    }

    initX = currentX

    el.css({
      transition: `transform 0.3s ease-out`,
      transform: `translate3d(${currentX}px, 0, 0)`
    })
    setTimeout(() => {
      el.css({
        transition: ''
      })
    }, 300)
  }

  const mousedown = start
  const mousemove = move
  const mouseup = (e) => {
    end(e, (distance, speed) => {
      currentX = currentX + speed * 1000
    })
  }

  const touchstart = (e) => {
    start(e.touches[0] || e)
  }
  const touchmove = (e) => {
    move(e.touches[0] || e)
  }
  const touchend = (e) => {
    end(e, () => {
      let gain = Math.abs(currentX) / winW
      let diff = (currentX - initX) / winW

      let maxGain = Math.ceil(gain)
      let minGain = Math.floor(gain)
      let shouldSwitch = Math.abs(diff) > options.breakpoint

      if (diff > 0) {
        if (initX === 0) {
          currentX = 0
        } else {
          currentX = -winW * (shouldSwitch ? minGain : maxGain)
        }
      } else {
        currentX = -winW * (shouldSwitch ? maxGain : minGain)
      }
      console.log(currentX)
    })
  }

  el.on({
    mousedown,
    mousemove,
    mouseup,
    touchstart,
    touchmove,
    touchend
  })

}