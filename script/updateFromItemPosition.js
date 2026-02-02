let navLis = []
let stackArticles = []
let lastPassed = null
let offsetOffset = 0
let rAFPending = false

function updateOffsets () {
  navLis = [...document.querySelectorAll('header nav ul li')]
  stackArticles = [...document.querySelectorAll('div#stack article[id]')]
  offsetOffset = stackArticles[0].offsetTop

  stackArticles.forEach(function (el) {
    el.style.setProperty('scroll-margin-top', offsetOffset + 'px')
    el.style.setProperty('min-height', 'calc(100vh - ' + offsetOffset + 'px)')
  })
}

function getLastArticleFrom (y) {
  var i = stackArticles.findIndex(function (el) {
    return el.offsetTop >= y
  })
  if (i === -1) return stackArticles[stackArticles.length - 1]
  if (i === 0) return null
  return stackArticles[i - 1]
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
  rAFPending = true
  requestAnimationFrame(function () {
    rAFPending = false
    lastPassed = getLastArticleFrom(window.scrollY + offsetOffset + 1)
    updateCurrentLi(lastPassed)
  })
}

document.addEventListener('DOMContentLoaded', function () {
  updateOffsets()
  onScroll()
})

window.addEventListener('scroll', onScroll, { passive: true })
window.addEventListener('resize', updateOffsets, { passive: true })
