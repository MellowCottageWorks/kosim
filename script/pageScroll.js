var pageScrollLocked = false

document.addEventListener('DOMContentLoaded', function () {
  var duration = 500
  var targets = []
  var touchStartY = null
  var touchStartIndex = null
  var touchStartScroll = null

  function cacheTargets () {
    targets = articleOffsets.slice()
    targets[targets.length - 1] =
      document.documentElement.scrollHeight - window.innerHeight
  }

  cacheTargets()
  window.addEventListener('resize', cacheTargets)

  function getCurrentIndex () {
    var scrollY = window.scrollY
    var index = 0
    for (var i = 0; i < targets.length; i++) {
      if (targets[i] <= scrollY + 1) {
        index = i
      }
    }
    return index
  }

  function easeOutCubic (t) {
    return 1 - Math.pow(1 - t, 3)
  }

  function animateScroll (from, to) {
    pageScrollLocked = true
    var start = performance.now()

    function step (now) {
      var elapsed = now - start
      var progress = Math.min(elapsed / duration, 1)
      var eased = easeOutCubic(progress)

      window.scrollTo(0, from + (to - from) * eased)

      if (progress < 1) {
        requestAnimationFrame(step)
      } else {
        pageScrollLocked = false
      }
    }

    requestAnimationFrame(step)
  }

  function snapTo (direction) {
    if (pageScrollLocked) return

    var currentIndex = getCurrentIndex()
    var nextIndex

    if (direction > 0) {
      nextIndex = Math.min(currentIndex + 1, targets.length - 1)
    } else {
      nextIndex = Math.max(currentIndex - 1, 0)
    }

    var from = window.scrollY
    var to = targets[nextIndex]

    if (Math.abs(from - to) < 2) return

    updateCurrentLi(stackArticles[nextIndex])
    animateScroll(from, to)
  }

  // Wheel events
  document.addEventListener('wheel', function (e) {
    e.preventDefault()
    snapTo(e.deltaY)
  }, { passive: false })

  // Touch events — let browser scroll freely, snap on release
  document.addEventListener('touchstart', function (e) {
    if (pageScrollLocked) return
    touchStartY = e.touches[0].clientY
    touchStartScroll = window.scrollY
    touchStartIndex = getCurrentIndex()
  }, { passive: true })

  document.addEventListener('touchmove', function (e) {
    if (pageScrollLocked) return
  })

  document.addEventListener('touchend', function (e) {
    if (pageScrollLocked || touchStartY === null || touchStartIndex === null) return

    var touchEndY = e.changedTouches[0].clientY
    var deltaY = touchStartY - touchEndY
    var savedIndex = touchStartIndex
    var savedScroll = touchStartScroll
    touchStartY = null
    touchStartIndex = null
    touchStartScroll = null

    if (Math.abs(deltaY) < 30) {
      // undo small native scroll: snap back to where the gesture started
      var from = window.scrollY
      var to = targets[savedIndex]

      if (Math.abs(from - to) >= 2) {
        updateCurrentLi(stackArticles[savedIndex])
        animateScroll(from, to)
      }
      return
    }

    // Use the saved index from touchstart, not current scroll position
    var nextIndex

    if (deltaY > 0) {
      nextIndex = Math.min(savedIndex + 1, targets.length - 1)
    } else {
      nextIndex = Math.max(savedIndex - 1, 0)
    }

    // Animate from where we started, not where native scroll took us
    var from = savedScroll
    var to = targets[nextIndex]

    if (Math.abs(from - to) < 2) return

    // Immediately jump back to start position to prevent visual jump
    window.scrollTo(0, from)

    updateCurrentLi(stackArticles[nextIndex])
    animateScroll(from, to)
  }, { passive: true })
})
