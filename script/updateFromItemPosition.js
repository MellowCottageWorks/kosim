let header = document.querySelector('header')
let navLis = []
let stackArticles = []
let lastPassed = null
let offsetOffset = 0
let rAFPending = false

const updateOffsets = () => {
  navLis = [...document.querySelectorAll("header nav ul li")]
  stackArticles = [...document.querySelectorAll("div#stack article[id]")]
  offsetOffset = stackArticles[0].offsetTop

  stackArticles.forEach(v => {
    v.style.setProperty(
      'scroll-margin-top',
      `${offsetOffset}px`
    )
    // if (v.id === 'hero')
    v.style.setProperty('min-height',
    `calc(100vh - ${offsetOffset}px)`)
  })
}
const getLastArticlePositionFrom = y => {
  let i = stackArticles.findIndex(v => v.offsetTop >= y)
  switch (i) {
    case -1: return stackArticles[stackArticles.length - 1]
    case 0: return null
    default: return stackArticles[i - 1]
  }
}
const updateCurrentLi = lP => {
  if (!lP) return
  navLis.forEach(v =>
    v.classList.remove('above', 'current', 'below')
  )
  const currentArticleIndex = stackArticles.findIndex(v =>
    v.id === lP.id)

  for (let i = 0; i < navLis.length; i++) switch (true) {
    case i < currentArticleIndex:
      navLis[i].classList.add('above')
      break
    case i === currentArticleIndex:
      navLis[i].classList.add('current')
      break
    default:
      navLis[i].classList.add('below')
      break
  }
}
const rAFCallbackToGetLastArticle = () => {
  if (rAFPending) return
  rAFPending = true
  requestAnimationFrame(() => {
    rAFPending = false
    lastPassed = getLastArticlePositionFrom(window.scrollY + offsetOffset + 1)
    updateCurrentLi(lastPassed)
  })
}

document.addEventListener("DOMContentLoaded", () => {
  updateOffsets()
  rAFCallbackToGetLastArticle()
})

window.addEventListener(
  'scroll', rAFCallbackToGetLastArticle, { passive: true }
)
window.addEventListener('resize', updateOffsets, { passive: true })
