'use strict'

import lz from 'lz-string'

import isNull from 'lodash/isNull'
import isUndefined from 'lodash/isUndefined'
import isString from 'lodash/isString'
import isArray from 'lodash/isArray'
import isFunction from 'lodash/isFunction'
import uniqueId from 'lodash/uniqueId'
import delay from 'lodash/delay'
import has from 'lodash/has'
import clone from 'lodash/clone'
import debounce from 'lodash/debounce'

const lodashModules = {
  isNull,
  isUndefined,
  isString,
  isArray,
  isFunction,
  uniqueId,
  delay,
  has,
  clone,
  debounce
}

const storage = global.localStorage
let core = {}

const encipher = (target) => {
  if (typeof target !== 'string') {
    target = JSON.stringify(target)
  }

  return lz.compressToEncodedURIComponent(target)
}

const decipher = (target) => {
  return lz.decompressFromEncodedURIComponent(target)
}

const deepDecipher = (val) => {
  try {
    val = core.unsign(val)
  } catch (e) {}

  try {
    val = JSON.parse(val)
  } catch (e) {}

  return val
}

const storeData = (key, value) => {
  if (isUndefined(value)) {
    return storage.getItem(key)
  }

  if (isNull(value)) {
    let v = storage.getItem(key)
    storage.removeItem(key)
    return v
  }

  storage.setItem(key, value)
  return value
}

const storeSign = (key, value) => {
  let cur = deepDecipher(storeData(key) || {})
  if (isUndefined(value)) {
    return cur
  }

  if (isNull(value)) {
    storeData(key, value)
    return cur
  }

  let v = Object.assign({}, cur, value)
  storeData(key, encipher(v))
  return v
}

Object.assign(core, {
  sign: (target) => encipher(target),
  unsign: (target) => decipher(target),
  deepUnsign: (val) => deepDecipher(val),

  store: (key, value) => storeSign(key, value),
  storeData: (key, value) => storeData(key, value)
}, lodashModules)

//use instead: this.$vuetify.breakpoint.width
/*
core.viewport = () => {
  //https://stackoverflow.com/questions/1248081/get-the-browser-viewport-dimensions-with-javascript
  return {
    width: Math.max(document.documentElement.clientWidth, global.innerWidth || 0),
    height: Math.max(document.documentElement.clientHeight, global.innerHeight || 0)
  }
}
 */

function appendToHead(elId = core.uniqueId('#head-el-'), definedEl) {
  elId = /^#/.test(elId) ? elId : `#${elId}`
  let existStyle = document.querySelector(elId)
  if (existStyle) existStyle.remove()

  definedEl.setAttribute('id', elId.substring(1))
  document.querySelector('head').appendChild(definedEl)
}

core.css = (style, styleId) => {
  let link = document.createElement('link')
  link.setAttribute('rel', 'stylesheet')
  link.setAttribute('type', 'text/css')
  link.setAttribute('href', style)
  appendToHead(styleId, link)
}

core.addStyle = (styleString, styleId) => {
  let style = document.createElement('style')
  style.type = 'text/css'
  style.innerHTML = styleString
  appendToHead(styleId, style)
}

core.styles = (target, style = {}) => {
  if (core.isString(target)) {
    for (let el of core.query(target, true)) {
      core.styles(el, style)
    }
  } else if (target) {
    for (let [k, v] of Object.entries(style)) {
      target.style[k] = v
    }
  }
}

core.script = (script, callback, scriptId) => {
  let aScript = document.createElement('script')
  aScript.setAttribute('type', 'text/javascript')

  if (isFunction(callback)) {
    if (aScript.readyState) {
      aScript.onreadystatechange = function() {
        if (aScript.readyState === "loaded" || aScript.readyState === "complete") {
          aScript.onreadystatechange = null
          callback()
        }
      }
    } else {
      aScript.onload = function() {
        callback()
      }
    }
  }

  aScript.setAttribute('src', script)
  appendToHead(scriptId, aScript)
}

core.formatJSON = (target, space = 2) => {
  return JSON.stringify(isString(target) ? JSON.parse(target) : target, false, space)
}

core.isJSON = (target, logMsgIfError = false) => {
  try {
    JSON.parse(isString(target) ? target : JSON.stringify(target))
    return true
  } catch(e) {
    if (logMsgIfError) {
      console && console.warn(`isJSON: ${e.message}`)
    }
    return false
  }
}

core.isWindow = (obj) => {
  return obj != null && obj === obj.window
}

core.scrollTop = (elem) => {
  let method = 'scrollTop'
  let prop = 'pageYOffset'

  // Coalesce documents and windows
  let win
  if (core.isWindow(elem)) {
    win = elem
  } else if (elem.nodeType === 9) {
    win = elem.defaultView
  }

  return win ? win[ prop ] : elem[ method ]
}


core.offset = (elem) => {
  // Return zeros for disconnected and hidden (display: none) elements (gh-2310)
  // Support: IE <=11 only
  // Running getBoundingClientRect on a
  // disconnected node in IE throws an error
  if (!elem.getClientRects || !elem.getClientRects().length ) {
    return { top: 0, left: 0 }
  }

  // Get document-relative position by adding viewport scroll to viewport-relative gBCR
  let rect = elem.getBoundingClientRect()
  let win = elem.ownerDocument.defaultView

  return {
    top: rect.top + win.pageYOffset,
    left: rect.left + win.pageXOffset
  }
}

core.querySelector = (selector, isAll = false, context = document) => {
  return true === isAll ? context.querySelectorAll(selector) : context.querySelector(selector)
}

core.query = (selector, isAll = false, context = document) => {
  if (/^[A-Za-z0-9]+$/.test(selector)) {
    let results = core.querySelector(selector, isAll, context)
    if (results === null) {
      selector = `[name=${selector}]`
    } else {
      return results
    }
  }

  return core.querySelector(selector, isAll, context)
}

core.toggleFullScreen = (callback) => {
  let doc = global.document
  let docEl = doc.documentElement

  let requestFullScreen = docEl.requestFullscreen
    || docEl.mozRequestFullScreen
    || docEl.webkitRequestFullScreen
    || docEl.msRequestFullscreen

  if (!requestFullScreen) {
    return
  }

  let cancelFullScreen = doc.exitFullscreen
    || doc.mozCancelFullScreen
    || doc.webkitExitFullscreen
    || doc.msExitFullscreen

  if (!cancelFullScreen) {
    return
  }

  let switchFull = false
  if (!doc.fullscreenElement
    && !doc.mozFullScreenElement
    && !doc.webkitFullscreenElement
    && !doc.msFullscreenElement) {
    requestFullScreen.call(docEl)
    switchFull = true
  } else {
    cancelFullScreen.call(doc)
  }

  core.isFunction(callback) && callback(switchFull)
}

core.isURL = (text) => {
  return /^(http|ftp|https):\/\/[\w-]+(\.[\w-]+)+([\w.,@?^=%&amp;:\/~+#-]*[\w@?^=%&amp;\/~+#-])?/.test(text)
}

/**
 * Replace HTML, https://plainjs.com/javascript/manipulation/replace-a-dom-element-36/
 * @param oldEl   html element
 * @param newEl   html element or html string
 */
core.replaceHTML = (oldEl, newEl) => {
  const theNewEl = isString(newEl) ? core.createElementFromHTML(newEl) : newEl
  oldEl.parentNode.replaceChild(theNewEl, oldEl)
}

// https://stackoverflow.com/questions/494143/creating-a-new-dom-element-from-an-html-string-using-built-in-dom-methods-or-pro
core.createElementFromHTML = (htmlString) => {
  const div = document.createElement('div')
  div.innerHTML = htmlString.trim()

  // Change this to div.childNodes to support multiple top-level nodes
  return div.firstChild
}

export default core
