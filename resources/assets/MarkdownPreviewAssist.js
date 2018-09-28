'use strict'

import pi from '~pi'

const root = global

let lastLineNo = 0
let scrollMap = null
let isScrollMapReady = false
let isScrollMapBuilding = false

function buildMarkdownScrollMap({selector, lineClass, linesCount = 0}) {
  if (isScrollMapBuilding) {
    return []
  }

  isScrollMapBuilding = true
  isScrollMapReady = false

  let _scrollMap = []
  let nonEmptyList = []
  let lines = pi.querySelector(`${selector} .${lineClass}`, true)
  let markdownLinesCount = linesCount

  let containerElem = pi.querySelector(selector)
  let offset = pi.scrollTop(containerElem) - pi.offset(containerElem).top

  for (let idx = 0; idx < markdownLinesCount; idx++) {
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

  nonEmptyList.push(markdownLinesCount)
  _scrollMap[markdownLinesCount] = containerElem.scrollHeight

  let pos = 0
  let a
  let b
  for (let idx = 1; idx < markdownLinesCount; idx++) {
    if (_scrollMap[idx] !== -1) {
      pos++
      continue
    }

    a = nonEmptyList[pos]
    b = nonEmptyList[pos + 1]
    _scrollMap[idx] = Math.round((_scrollMap[b] * (idx - a) + _scrollMap[a] * (b - idx)) / (b - a))
  }

  scrollMap = _scrollMap
  isScrollMapReady = true
  isScrollMapBuilding = false

  return scrollMap
}

/**
 * Assist class for markdown preview,
 * in source page listen event
 * <pre>
    IFrames.registers({
      LINE_COUNT: () => {
        // return source line count
        return {
          linesCount: that.instanceOfCMAssist.lineCount()
        }
      },
      // listen scroll from preview to markdown source event
      SCROLL_PV_TO_MD: (evtName, evtData) => {
      }
    })
 * </pre>
 */
class MarkdownPreviewAssist {

  constructor({
    selector,                                 // markdown preview container selector
    lineClass = 'line',                       // line class
    IFrames = null                            // IFrames
  }) {
    this.selector = selector
    this.lineClass = lineClass
    this.IFrames = IFrames

    this.markdownToPreview = true        // if synchronize scroll from markdown source to preview
    this.previewToMarkdown = true        // if synchronize scroll from preview to markdown source

    const that = this
    this.IFrames.registers({
      // listen scroll from markdown source to preview event
      SCROLL_MD_TO_PV: (evtName, evtData) => {
        that.roll(evtData)
      }
    })
  }

  /**
   * Synchronize scroll from source to preview
   * @param top         source top line number
   * @param bottom      source bottom line number
   */
  async roll({top, bottom}) {
    if (!scrollMap) {
      await this.buildScrollMap()
    }

    if (!isScrollMapReady) {
      return
    }

    let lineNo = parseInt(top || 0)
    let realLineNo = -1
    let posTo = scrollMap[lineNo]

    if (lineNo === lastLineNo) {
      return
    }

    if (pi.isUndefined(posTo)) {
      if (lineNo > lastLineNo) {
        let lineEnd = parseInt(bottom || 0);
        for (i = lineNo; i <= lineEnd; i++) {
          if (!pi.isUndefined(posTo = scrollMap[i])) {
            realLineNo = i
            break
          }
        }
      } else {
        for (i = lineNo; i >= 0; i--) {
          if (!pi.isUndefined(posTo = scrollMap[i])) {
            realLineNo = i
            break
          }
        }
      }
    }

    if (pi.isUndefined(posTo) || lastLineNo === realLineNo) {
      return
    }

    pi.querySelector(`${this.selector}`).scrollTop = posTo
    lastLineNo = lineNo;
  }

  /**
   * Get markdown source lines count
   * @param eventName
   * @returns {Promise<any>}
   */
  getLinesCount(eventName = 'LINE_COUNT') {
    const that = this
    return new Promise((resolve) => {
      that.IFrames.getInstance().replyEvent(eventName, {}, (evtData) => {
        resolve(evtData)
      })
    })
  }

  /**
   * Build Markdown Preview Scroll Map
   */
  async buildScrollMap() {
    if (!this.markdownToPreview && !this.previewToMarkdown) {
      return
    }

    let {linesCount} = await this.getLinesCount()
    buildMarkdownScrollMap({
      linesCount,
      selector: this.selector,
      lineClass: this.lineClass
    })
  }

}

export default MarkdownPreviewAssist
