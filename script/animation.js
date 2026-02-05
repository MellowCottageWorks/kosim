document.addEventListener('DOMContentLoaded', function () {
  // --- Navigation click handling ---
  var dots = document.querySelectorAll('header nav .indicator-dot')

  function getScrollTargets () {
    var targets = {}
    stackArticles.forEach(function (el, i) {
      targets[el.id] = articleOffsets[i]
    })
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

  // --- Hero CTA: scroll to bottom of page ---
  var heroCta = document.getElementById('hero-cta')
  if (heroCta) {
    heroCta.addEventListener('click', function (e) {
      e.preventDefault()
      if (typeof pageScrollLocked !== 'undefined' && pageScrollLocked) return
      var lastArticle = stackArticles[stackArticles.length - 1]
      if (lastArticle) {
        updateCurrentLi(lastArticle)
      }
      var bottom = document.documentElement.scrollHeight - window.innerHeight
      if (typeof window.animateScrollTo === 'function') {
        window.animateScrollTo(bottom)
      } else {
        window.scrollTo({ top: bottom, behavior: 'smooth' })
      }
    })
  }

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

  // --- Why-we-started: slide images in from sides (replayable) + text scramble ---

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

    // Text scramble setup
    var scrambleChars =
      [...Array(26)].map((_,i)=>String.fromCharCode(i+97))
        .concat(
      [...Array(26)].map((_,i)=>String.fromCharCode(i+65))
      )//.concat('1234567890!@#$%^&*()-_=+[]{}|;:\'",./<>?'.split('')
    var textContainer = whyWeStarted.querySelector('div')
    var textElements = textContainer ? textContainer.querySelectorAll('p') : []
    var originalTexts = []
    var scrambleStarted = false

    // Store original HTML and hide text initially
    textElements.forEach(function (el) {
      originalTexts.push(el.innerHTML)
      el.style.opacity = '0'
    })

    function scrambleText (el, finalHtml, delay) {
      setTimeout(function () {
        el.style.opacity = '1'

        // Extract text nodes while preserving HTML structure
        var temp = document.createElement('div')
        temp.innerHTML = finalHtml

        // Get all text content positions
        var textContent = temp.textContent
        var chars = textContent.split('')
        var duration = 800
        var stagger = duration / chars.length
        var start = performance.now()

        function step (now) {
          var elapsed = now - start
          var revealed = Math.floor(elapsed / stagger)

          // Build scrambled version
          var result = ''
          var charIndex = 0

          var punctuationChars = '·:;\'`¨˙'

          function processNode (node) {
            if (node.nodeType === 3) { // Text node
              var text = node.textContent
              for (var i = 0; i < text.length; i++) {
                var c = text[i]
                if (charIndex < revealed) {
                  result += c
                } else if (c === ' ' || c === '\n') {
                  // Preserve whitespace
                  result += c
                } else if (c === ',' || c === '.') {
                  // Scramble punctuation with similar-width characters
                  result += punctuationChars[Math.floor(Math.random() * punctuationChars.length)]
                } else {
                  result += scrambleChars[Math.floor(Math.random() * scrambleChars.length)]
                }
                charIndex++
              }
            } else if (node.nodeType === 1) { // Element node
              var tagName = node.tagName.toLowerCase()
              var selfClosing = ['br', 'hr', 'img', 'input', 'meta', 'link']
              result += '<' + tagName
              for (var j = 0; j < node.attributes.length; j++) {
                result += ' ' + node.attributes[j].name + '="' + node.attributes[j].value + '"'
              }
              if (selfClosing.indexOf(tagName) !== -1) {
                result += '>'
              } else {
                result += '>'
                for (var k = 0; k < node.childNodes.length; k++) {
                  processNode(node.childNodes[k])
                }
                result += '</' + tagName + '>'
              }
            }
          }

          for (var i = 0; i < temp.childNodes.length; i++) {
            processNode(temp.childNodes[i])
          }

          el.innerHTML = result

          if (revealed < chars.length) {
            requestAnimationFrame(step)
          } else {
            el.innerHTML = finalHtml
          }
        }

        requestAnimationFrame(step)
      }, delay)
    }

    function startScramble () {
      if (scrambleStarted) return
      scrambleStarted = true

      textElements.forEach(function (el, i) {
        scrambleText(el, originalTexts[i], i * 300)
      })
    }

    function resetScramble () {
      scrambleStarted = false
      textElements.forEach(function (el) {
        el.style.opacity = '0'
      })
    }

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
          startScramble()
        } else {
          if (leftImage) {
            leftImage.style.transform = 'translateX(-150px)'
            leftImage.style.opacity = '0'
          }
          if (rightImage) {
            rightImage.style.transform = 'translate(' + dx + 'px, ' + dy + 'px)'
            rightImage.style.opacity = '0'
          }
          resetScramble()
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
    var counters = values.querySelectorAll('strong[data-count-up]')
    var counted = false

    // Parse each counter's text to extract number and suffix
    var counterData = []
    counters.forEach(function (el) {
      var text = el.textContent.trim()
      // Match number (with optional commas) and everything after
      var match = text.match(/^([\d,]+)(.*)$/)
      if (match) {
        var numStr = match[1]
        var suffix = match[2]
        var useComma = numStr.indexOf(',') !== -1
        var target = parseInt(numStr.replace(/,/g, ''), 10)
        counterData.push({ el: el, target: target, suffix: suffix, useComma: useComma })
      }
    })

    function formatNumber (n, useComma) {
      if (!useComma) return String(n)
      return n.toLocaleString()
    }

    function animateCounters () {
      if (counted) return
      counted = true

      counterData.forEach(function (data) {
        var duration = 2700
        var start = performance.now()

        function step (now) {
          var elapsed = now - start
          var progress = Math.min(elapsed / duration, 1)
          // ease-out quad
          var eased = 1 - (1 - progress) * (1 - progress)
          var current = Math.round(eased * data.target)

          data.el.textContent = formatNumber(current, data.useComma) + data.suffix

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
