document.addEventListener('DOMContentLoaded', function () {
  // --- Navigation click handling ---
  // Snap to top to read clean offsetTop values, then restore scroll
  var dots = document.querySelectorAll('header nav .indicator-dot')

  function getScrollTargets () {
    var saved = window.scrollY
    window.scrollTo({ top: 0 })

    var targets = {}
    stackArticles.forEach(function (el) {
      targets[el.id] = el.offsetTop - offsetOffset
    })

    window.scrollTo({ top: saved })
    return targets
  }

  var scrollTargets = getScrollTargets()

  window.addEventListener('resize', function () {
    scrollTargets = getScrollTargets()
  })

  dots.forEach(function (dot) {
    dot.addEventListener('click', function (e) {
      e.preventDefault()
      if (typeof pageScrollLocked !== 'undefined' && pageScrollLocked) return
      var id = dot.getAttribute('href').substring(1)
      if (id in scrollTargets) {
        window.scrollTo({ top: scrollTargets[id], behavior: 'smooth' })
      }
    })
  })

  // --- Shared helpers ---

  // One-shot observer: adds 'animate' class once, then stops observing
  function observeOnce (el, threshold) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !el.classList.contains('animate')) {
          el.classList.add('animate')
          observer.unobserve(el)
        }
      })
    }, { threshold: threshold })
    observer.observe(el)
  }

  // --- Why-we-started: slide images in from sides (replayable) ---

  var whyWeStarted = document.getElementById('why-we-started')
  if (whyWeStarted) {
    var rightImage = whyWeStarted.querySelector('p:first-of-type > img.right')
    var leftImage = whyWeStarted.querySelector('p:nth-of-type(2) > img.left')

    var angle = -60 * Math.PI / 180
    var dx = 150 * Math.cos(angle)
    var dy = 150 * Math.sin(angle)
    var easing = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.8s ease-out'

    if (leftImage) leftImage.style.transition = easing
    if (rightImage) rightImage.style.transition = easing

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          if (leftImage) {
            leftImage.style.transform = 'translateX(0)'
            leftImage.style.opacity = '1'
          }
          if (rightImage) {
            rightImage.style.transform = 'translate(0, 0)'
            rightImage.style.opacity = '0.5'
          }
        } else {
          if (leftImage) {
            leftImage.style.transform = 'translateX(-150px)'
            leftImage.style.opacity = '0'
          }
          if (rightImage) {
            rightImage.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)'
            rightImage.style.opacity = '0'
          }
        }
      })
    }, { threshold: 0.3 })

    observer.observe(whyWeStarted)
  }

  // --- One-shot section animations ---

  var coreStrengths = document.getElementById('core-strengths')
  if (coreStrengths) observeOnce(coreStrengths, 0.2)

  var coreStrengthsCont = document.getElementById('core-strengths-cont')
  if (coreStrengthsCont) observeOnce(coreStrengthsCont, 0.2)

  // --- Process section: animation + tomato parallax ---

  var process = document.getElementById('process')
  if (process) {
    observeOnce(process, 0.2)

    var tomatoImg = process.querySelector('p:last-of-type img')
    if (tomatoImg) {
      var ticking = false

      function handleParallax () {
        var rect = process.getBoundingClientRect()
        var vh = window.innerHeight
        var progress = Math.max(0, Math.min(2,
          (vh - rect.top) / (vh + rect.height)
        ))
        tomatoImg.style.transform = 'translateY(' + (progress * rect.height * 0.9) + 'px)'
      }

      window.addEventListener('scroll', function () {
        if (!ticking) {
          requestAnimationFrame(function () {
            handleParallax()
            ticking = false
          })
          ticking = true
        }
      })

      handleParallax()
    }
  }

  // --- Values section: count-up numbers ---

  var values = document.getElementById('values-and-direction')
  if (values) {
    var counters = values.querySelectorAll('strong[data-count-to]')
    var counted = false

    function formatNumber (n, useComma) {
      if (!useComma) return String(n)
      return n.toLocaleString()
    }

    function animateCounters () {
      if (counted) return
      counted = true

      counters.forEach(function (el) {
        var target = parseInt(el.getAttribute('data-count-to'), 10)
        var suffix = el.getAttribute('data-count-suffix') || ''
        var useComma = el.getAttribute('data-count-comma') === 'true'
        var duration = 2700
        var start = performance.now()

        function step (now) {
          var elapsed = now - start
          var progress = Math.min(elapsed / duration, 1)
          // ease-out quad
          var eased = 1 - (1 - progress) * (1 - progress)
          var current = Math.round(eased * target)

          el.textContent = formatNumber(current, useComma) + suffix

          if (progress < 1) {
            requestAnimationFrame(step)
          }
        }

        requestAnimationFrame(step)
      })
    }

    var valuesObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounters()
          valuesObserver.unobserve(values)
        }
      })
    }, { threshold: 0.32 })

    valuesObserver.observe(values)
  }

  // --- Featured product: mouse-following tilt ---

  var featuredProduct = document.getElementById('featured-product')
  if (featuredProduct) {
    var mockupImg = featuredProduct.querySelector('div.product > img')

    if (mockupImg) {
      var maxTilt = 15

      mockupImg.style.transition = 'transform 0.1s ease-out'

      featuredProduct.addEventListener('mousemove', function (e) {
        var rect = mockupImg.getBoundingClientRect()
        var cx = rect.left + rect.width / 2
        var cy = rect.top + rect.height / 2

        var dx = Math.max(-rect.width / 2, Math.min(rect.width / 2, e.clientX - cx))
        var dy = Math.max(-rect.height / 2, Math.min(rect.height / 2, e.clientY - cy))

        var rotateY = (dx / rect.width) * maxTilt * 2
        var rotateX = -(dy / rect.height) * maxTilt * 2

        mockupImg.style.transform =
          'perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)'
      })

      featuredProduct.addEventListener('mouseleave', function () {
        mockupImg.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)'
      })
    }
  }
})
