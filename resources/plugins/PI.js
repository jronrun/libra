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

const lodashModules = {
  isNull,
  isUndefined,
  isString,
  isArray,
  isFunction,
  uniqueId,
  delay,
  has,
  clone
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
  document.querySelector('head').append(definedEl)
}

core.css = (style, styleId) => {
  let link = document.createElement('link')
  link.setAttribute('rel', 'stylesheet')
  link.setAttribute('type', 'text/css')
  link.setAttribute('href', style)
  appendToHead(styleId, link)
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

core.fmtJSON = (target, space = 2) => {
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

export default core
