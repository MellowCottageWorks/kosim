const getComputedStyleProperty = (
  function () {
    const getStylesheet = filename => Array.from(document.styleSheets)
      .find(s =>
        typeof s.href === "string" && s.href.includes(filename)
      ) || null

    const getRules = sheet => {
      if (!sheet) return []
      try {
        return Array.from(sheet.cssRules || sheet.rules || [])
      } catch { return [] }
    }
    const getRule = (sheet, selectorText) => getRules(sheet)
      .find(r =>
        r && r.selectorText === selectorText
      ) || null

    const getElement = selectorText =>
      document.querySelector(selectorText) || null

    /*const getProperty = (rule, propertyName) => {
      if (!rule?.style) return null
      const v = rule.style.getPropertyValue(propertyName)
      return v ? parseCSSValue(v) : null
    }*/

    const getComputedProperty = (e, propertyName) => {
      if (!e) return null
      const v = getComputedStyle(e).getPropertyValue(propertyName)
      return v !== "" ? v.trim() : null
    }

    return (cssFilename, selectorText, propertyName) => {
      const s = getStylesheet(cssFilename)
      if (!s) {
        console.error("Can't find the stylesheet.")
        return null
      }
      const r = getRule(s, selectorText)
      if (!r) {
        console.error("Can't find the rule with the selector text.")
        return null
      }
      const e = getElement(selectorText)
      if (!e) {
        console.error("Can't find the first element with the selector text.")
        return null
      }
      const v = getComputedProperty(e, propertyName)
      if (v == null) {
        console.error("Can't find the property with the property name.")
        return null
      }

      return v
    }
  }
)()

const parseCSSValue = value => {
  if (value == null) return null
  const v = value.trim()
  if (/^-?\d+(\.\d+)?px$/.test(v)) { return parseFloat(v) }
  if (/^-?\d+(\.\d+)?$/.test(v)) { return Number(v) }
  return v;
};
