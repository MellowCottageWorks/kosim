var navLis = []
var stackArticles = []
var articleOffsets = []
var lastPassed = null
var offsetOffset = 0
var rAFPending = false

function updateOffsets () {
  navLis = [].slice.call(document.querySelectorAll('header nav ul li'))
  stackArticles = [].slice.call(document.querySelectorAll('div#stack article[id]'))
  offsetOffset = stackArticles[0].offsetTop

  stackArticles.forEach(function (el) {
    el.style.setProperty('scroll-margin-top', offsetOffset + 'px')
    el.style.setProperty('min-height', 'calc(100vh - ' + offsetOffset + 'px)')
  })

  cacheArticleOffsets()
}

function cacheArticleOffsets () {
  articleOffsets = []
  var cumulative = 0
  for (var i = 0; i < stackArticles.length; i++) {
    articleOffsets.push(cumulative)
    if (i < stackArticles.length - 1) {
      cumulative += stackArticles[i].offsetHeight
    }
  }
}

function getLastArticleFrom (y) {
  var index = 0
  for (var i = 0; i < articleOffsets.length; i++) {
    if (articleOffsets[i] <= y) {
      index = i
    }
  }
  return stackArticles[index]
}

function updateCurrentLi (article) {
  if (!article) return

  navLis.forEach(function (li) {
    li.classList.remove('above', 'current', 'below')
  })

  var currentIndex = stackArticles.findIndex(function (el) {
    return el.id === article.id
  })

  for (var i = 0; i < navLis.length; i++) {
    if (i < currentIndex) {
      navLis[i].classList.add('above')
    } else if (i === currentIndex) {
      navLis[i].classList.add('current')
    } else {
      navLis[i].classList.add('below')
    }
  }
}

function onScroll () {
  if (rAFPending) return
  if (typeof pageScrollLocked !== 'undefined' && pageScrollLocked) return
  rAFPending = true
  requestAnimationFrame(function () {
    rAFPending = false
    lastPassed = getLastArticleFrom(window.scrollY + 1)
    updateCurrentLi(lastPassed)
  })
}

document.addEventListener('DOMContentLoaded', function () {
  updateOffsets()
  onScroll()
})

window.addEventListener('scroll', onScroll, { passive: true })
window.addEventListener('resize', updateOffsets, { passive: true })
