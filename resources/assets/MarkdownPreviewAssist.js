'use strict'

import pi from '~pi'

const root = global

const previewScrollListener = Symbol('previewScrollListener')

let lastLineNo = 0
let scrollMap = null
let isScrollMapReady = false
let isScrollMapBuilding = false

let isTempStopScrollBehave = false

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
 *  let isTempStopScrollBehave = false
 *
    IFrames.registers({
      LINE_COUNT: () => {
        // return source line count
        return {
          linesCount: that.instanceOfCMAssist.lineCount()
        }
      },
      // listen scroll from preview to markdown source event
      SCROLL_PV_TO_MD: (evtName, {line}) => {
         isTempStopScrollBehave = true
         that.instanceOfCMAssist.scrollToLine(parseInt(line))
      }
    })

    scrollMdToPv() {
      if (isTempStopScrollBehave) {
        return
      }

      this.frameInstance.tellEvent('SCROLL_MD_TO_PV', this.instance.visibleLines())
    }

    // toggle scroll from preview to markdown source
    this.frameInstance.tellEvent('SWITCH_SCROLL_NOTIFY', {isOn: false})

     const scroll = pi.debounce(scrollMdToPv, 50, {maxWait: 100})
     that.instanceOfCMAssist = new NMAssist(cm, {
        scroll
      })

    that.instanceOfCMAssist.getWrapperElement().addEventListener('touchstart', () => {
      isTempStopScrollBehave = false
    })
    that.instanceOfCMAssist.getWrapperElement().addEventListener('mouseover', () => {
      isTempStopScrollBehave = false
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
        isTempStopScrollBehave = true
        that.roll(evtData)
      },
      // toggle scroll from preview to markdown source event
      SWITCH_SCROLL_NOTIFY: (evtName, {isOn}) => {
        that.switchScrollNotify(isOn)
      }
    })

    this[previewScrollListener] = pi.debounce(this.notify.bind(this), 50, {maxWait: 100})
    this.switchScrollNotify()

    const scrollContainer = pi.querySelector(this.selector)
    scrollContainer.addEventListener('touchstart', () => {
      isTempStopScrollBehave = false
    })
    scrollContainer.addEventListener('mouseover', () => {
      isTempStopScrollBehave = false
    })
  }

  switchScrollNotify(isOn = true) {
    const scrollEventName = 'scroll'
    const scrollContainer = pi.querySelector(this.selector)

    if (isOn) {
      scrollContainer.addEventListener(scrollEventName, this[previewScrollListener])
    } else {
      scrollContainer.removeEventListener(scrollEventName, this[previewScrollListener])
    }
  }

  /**
   * Synchronize scroll from preview to markdown source
   * @returns {Promise<void>}
   */
  notify() {
    if (isTempStopScrollBehave) {
      return
    }

    if (!this.previewToMarkdown) {
      return
    }

    if (!isScrollMapReady) {
      this.buildScrollMap()
    }

    if (!isScrollMapReady) {
      return
    }

    // line and html map
    let scrollContainer = pi.querySelector(this.selector)
    let scrollTop  = pi.scrollTop(scrollContainer)
    let lines
    let line

    lines = Object.keys(scrollMap)

    if (lines.length < 1) {
      return
    }

    line = lines[0]

    for (let idx = 1; idx < lines.length; idx++) {
      if (scrollMap[lines[idx]] < scrollTop) {
        line = lines[idx]
        continue
      }

      break
    }

    if (lastLineNo !== line) {
      lastLineNo = line
      this.IFrames.getInstance().replyEvent('SCROLL_PV_TO_MD', {line})
    }
  }

  /**
   * Synchronize scroll from source to preview
   * @param top         source top line number
   * @param bottom      source bottom line number
   */
  async roll({top, bottom}) {
    if (!this.markdownToPreview) {
      return
    }

    if (!isScrollMapReady) {
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
    let {linesCount} = await this.getLinesCount()
    buildMarkdownScrollMap({
      linesCount,
      selector: this.selector,
      lineClass: this.lineClass
    })
  }

}

export default MarkdownPreviewAssist
