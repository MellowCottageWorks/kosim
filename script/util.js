var getComputedStyleProperty = (function () {
  function getStylesheet (filename) {
    return Array.from(document.styleSheets).find(function (s) {
      return typeof s.href === 'string' && s.href.includes(filename)
    }) || null
  }

  function getRules (sheet) {
    if (!sheet) return []
    try {
      return Array.from(sheet.cssRules || sheet.rules || [])
    } catch (e) { return [] }
  }

  function getRule (sheet, selector) {
    return getRules(sheet).find(function (r) {
      return r && r.selectorText === selector
    }) || null
  }

  function getComputed (el, prop) {
    if (!el) return null
    var v = getComputedStyle(el).getPropertyValue(prop)
    return v !== '' ? v.trim() : null
  }

  return function (cssFilename, selectorText, propertyName) {
    var s = getStylesheet(cssFilename)
    if (!s) {
      console.error('Cannot find stylesheet.')
      return null
    }

    var r = getRule(s, selectorText)
    if (!r) {
      console.error('Cannot find rule: ' + selectorText)
      return null
    }

    var el = document.querySelector(selectorText)
    if (!el) {
      console.error('Cannot find element: ' + selectorText)
      return null
    }

    var v = getComputed(el, propertyName)
    if (v == null) {
      console.error('Cannot find property: ' + propertyName)
      return null
    }

    return v
  }
})()

function parseCSSValue (value) {
  if (value == null) return null
  var v = value.trim()
  if (/^-?\d+(\.\d+)?px$/.test(v)) return parseFloat(v)
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v)
  return v
}
