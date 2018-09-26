'use strict'

import pi from '~pi'

const root = global

let scrollMap = null
let isScrollMapReady = false
let isScrollMapBuilding = false

/**
 * Build Markdown Scroll Map
 * @param selector    container selector
 * @param line        line selector
 * @param linesCount  source line count
 * @returns {*}
 */
function buildMarkdownScrollMap({selector, line = '.line', linesCount = 0}) {
  if (isScrollMapBuilding) {
    return
  }

  isScrollMapBuilding = true
  isScrollMapReady = false

  let _scrollMap = []
  let nonEmptyList = []
  let lines = pi.querySelector(`${selector} ${line}`, true)

  let containerElem = pi.querySelector(selector)
  let offset = pi.scrollTop(containerElem) - pi.offset(containerElem).top

  for (let i = 0; i < linesCount; i++) {
    _scrollMap.push(-1)
  }

  nonEmptyList.push(0)
  _scrollMap[0] = 0

  for (let elem of lines.values()) {
    let t = parseInt(elem.dataset.line)
    if (t === '') {
      return
    }

    if (t !== 0) {
      nonEmptyList.push(t)
    }
    _scrollMap[t] = Math.round(pi.offset(elem).top + offset)
  }

  nonEmptyList.push(linesCount)
  _scrollMap[linesCount] = containerElem.scrollHeight

  let pos = 0
  let a
  let b
  for (i = 1; i < linesCount; i++) {
    if (_scrollMap[i] !== -1) {
      pos++
      continue
    }

    a = nonEmptyList[pos]
    b = nonEmptyList[pos + 1]
    _scrollMap[i] = Math.round((_scrollMap[b] * (i - a) + _scrollMap[a] * (b - i)) / (b - a))
  }

  scrollMap = _scrollMap
  isScrollMapReady = true
  isScrollMapBuilding = false

  return scrollMap
}

class MarkdownPreviewAssist {

  constructor() {

  }

}

export default MarkdownPreviewAssist
