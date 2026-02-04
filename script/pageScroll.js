var pageScrollLocked = false

document.addEventListener('DOMContentLoaded', function () {
  var duration = 500
  var targets = []

  function cacheTargets () {
    var saved = window.scrollY
    window.scrollTo({ top: 0 })

    targets = stackArticles.map(function (el, i) {
      if (i === stackArticles.length - 1) {
        return document.documentElement.scrollHeight - window.innerHeight
      }
      return el.offsetTop - offsetOffset
    })

    window.scrollTo({ top: saved })
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

  document.addEventListener('wheel', function (e) {
    if (pageScrollLocked) {
      e.preventDefault()
      return
    }

    e.preventDefault()

    var currentIndex = getCurrentIndex()
    var nextIndex

    if (e.deltaY > 0) {
      nextIndex = Math.min(currentIndex + 1, targets.length - 1)
    } else {
      nextIndex = Math.max(currentIndex - 1, 0)
    }

    var from = window.scrollY
    var to = targets[nextIndex]

    if (Math.abs(from - to) < 2) return

    animateScroll(from, to)
  }, { passive: false })
})
