'use strict'

import pi from '~pi'

const root = global // window

let encode = (target) => {
  return JSON.stringify(target || {})
}

let decode = (target) => {
  if (!pi.isString(target)) {
    return target
  }

  return JSON.parse(target || '{}')
}

const isRoot = (targetWin) => {
  return targetWin ? root.top === targetWin : root.top === root.self
}

/*
    ack example
    fr=IFrames.of('#ifr_100001')
    fr.listenReply()
    // if 'SOURCE' event return {src: 'abc'}
    fr.tellEvent('SOURCE', {}, (data) => {console.log('ack: ' + JSON.stringify(data))})
    // -> ack: {"src": "abc"}
   */
const ackCalls = (eventId, ackCallback) => {
  let rootW = isRoot() ? window : top.window
  let varN = '__defineIframeACKer__'

  rootW[varN] = rootW[varN] || {}
  if (undefined === ackCallback) {
    return rootW[varN][eventId]
  }

  if (null === ackCallback) {
    delete rootW[varN][eventId]
  } else {
    rootW[varN][eventId] = ackCallback
  }
}

/**
 * type     1 tell, 2 reply, 3 ack
 */
const eventOn = (eventName, type, data = {}, sender, ackCallback, eventId, instanceOfAssist) => {
  if (sender && eventName && eventName.length > 0) {
    eventId = eventId || (type + pi.uniqueId() + '_' + Date.now())
    if (pi.isFunction(ackCallback)) {
      ackCalls(eventId, ackCallback)
    }

    sender.bind(instanceOfAssist)({id: eventId, event: eventName, type, data})
  }
}

class IFrameAssist {

  constructor(target) {
    let iFrame = null
    if (pi.isString(target)) {
      const selector = /^#/.test(target) ? target : ('iframe[name="' + target + '"]')
      let theIFrames = pi.querySelector(selector, true) || []
      if (theIFrames.length) {
        iFrame = theIFrames[0]
      } else {
        let el
        if (parent && (el = parent.document.querySelector(selector))) {
          iFrame = el
        } else if (top && (el = top.document.querySelector(selector))) {
          iFrame = el
        }
      }
    } else {
      iFrame = target || root.frameElement
    }

    this.instance = iFrame
  }

  isAvailable() {
    return null != this.instance
  }

  isUrlSource() {
    return !!this.attr('src')
  }

  getId() {
    return this.attr('id')
  }

  getName() {
    return this.attr('name')
  }

  attr(options = {}) {
    if (typeof options === 'string') {
      return this.instance.getAttribute(options)
    }

    for (let [k, v] of Object.entries(options)) {
      if (null !== v) {
        this.instance.setAttribute(k, v)
      }
    }

    return this
  }

  write(text = '') {
    const target = this.getDocument()
    target.open()
    target.write(text)
    target.close()
    return this
  }

  getUrl() {
    return this.isUrlSource() ? this.attr('src') : null
  }

  openUrl(url, onReadyHandle = (instanceOfIFrameAssist, event) => {}) {
    this.attr({ src: url })
    this.onReadyHandle = (e) => {
      pi.isFunction(onReadyHandle) && onReadyHandle(this, e)
    }

    document.getElementById(this.getId()).onload = this.onReadyHandle
    return this
  }

  reload(onReadyHandle) {
    try {
      this.getDocument().location.reload(true)
    } catch (e) {
      if (this.isUrlSource()) {
        this.openUrl(this.getUrl(), onReadyHandle || this.onReadyHandle)
      }
    }

    return this
  }

  getDocument() {
    return this.instance.contentDocument || this.instance.contentWindow.document
  }

  post(data, origin, sender) {
    if (data && sender) {
      try {
        data.iframe = this.getInfo()
        sender.postMessage(encode(data), origin || '*')
      } catch (e) {
        root.console && console.warn(e.message, 'iFrame.post')
      }
    }
  }

  /**
   * Post a message to this iFrame, parent -> iFrame
   * @param data
   * @param origin
   */
  tell(data, origin) {
    this.post(data, origin, this.instance.contentWindow)
  }

  /**
   * Publish a message to parent from this iFrame, iFrame -> parent
   * @param data
   * @param origin
   */
  reply(data, origin) {
    try {
      const theRoot = this.instance.contentWindow.parent
      const target = theRoot.postMessage ? theRoot : (theRoot.document.postMessage ? theRoot.document : undefined)
      this.post(data, origin, target)
    } catch (e) {
      root.console && console.warn(e.message, 'iFrame.reply')
    }
  }

  tellEvent(eventName, data, ackCallback) {
    eventOn(eventName, 1, data, this.tell, ackCallback, false, this)
  }

  replyEvent(eventName, data, ackCallback) {
    eventOn(eventName, 2, data, this.reply, ackCallback, false, this)
  }

  listen(callback, once, aListener) {
    const that = this
    if (aListener && aListener.postMessage) {
      if (pi.isFunction(callback)) {
        let _cb = null
        _cb = (e) => {
          if (once) {
            aListener.removeEventListener('message', _cb)
          }

          let evtData = decode((e.originalEvent || e).data)
          let ackFunc = ackCalls(evtData.id)
          let ackFuncAvail = pi.isFunction(ackFunc)

          if (3 === evtData.type) {
            ackFuncAvail && ackFunc(evtData.data || {}, evtData)
            ackCalls(evtData.id, null)
          } else if ([1, 2].indexOf(evtData.type) !== -1) {
            let ackData = callback(evtData, e) || {}
            if (ackFuncAvail) {
              //1 tell, 2 reply
              switch (evtData.type) {
                case 1:
                  ackFunc = that.reply
                  break
                case 2:
                  ackFunc = (data, origin) => {
                    let ackTell = IFrames.of(evtData.iframe.id)
                    if (ackTell.isAvailable()) {
                      ackTell.tell(data, origin)
                    }
                  }
                  break
              }

              eventOn(evtData.event, 3, ackData, ackFunc, false, evtData.id, that)
            }
          } else {
            callback(evtData, e)
          }
        }

        aListener.addEventListener('message', _cb)
      }
    }
  }

  listenTell(callback, once) {
    this.listen(callback || (() => {}), once, this.instance.contentWindow)
  }

  listenReply(callback, once) {
    this.listen(callback || (() => {}), once, window)
  }

  getInfo() {
    return {
      id: this.instance.getAttribute("id"),
      name: this.instance.getAttribute("name"),
      src: this.instance.getAttribute('src')
    }
  }

  $(selector, isAll = false) {
    return pi.query(selector, isAll, this.instance.contentDocument)
  }

}

let aFrames = null
let isEventHandleBind = false
const aFramesEventHandle = {}
const getDefaultFrame = () => {
  return null == aFrames ? (aFrames = IFrames.of()) : aFrames
}

/**
 * <pre> Usage:
 * // 1. In Window
   // register event handle

   const testIFrameId = 'testIFrameId'
   IFrames.registers({
      TEST: (evtName, evtData) => {
        console.info('in window: ' + evtName + ' ' + JSON.stringify(evtData))
        return {windowTestAckData: {msg: 'this from window TEST event ack'}}
      }
    })

   const testIFrame = IFrames.create({id: testIFrameId, width: 200, height: 200, frameborder: 2})
   // the target url page must has load the script IFrame.js
   testIFrame.openUrl('http://192.168.20.19:3000/athena',
   (assist) => console.info('in window: ' + assist.getUrl() + ' load successfully'))




   // 2. In IFrame
   // register event handle
   IFrames.registers({
      TEST: (evtName, evtData) => {
        console.warn('in iFrame: ' + evtName + ' ' + JSON.stringify(evtData))
        return {iFrameTestAckData: {msg: 'this from iFrame TEST event ack'}}
      }
    })
   IFrames.register('TEST_ONCE', (evtName, evtData) => {
      console.warn('in iFrame (TEST_ONCE): ' + evtName + ' ' + JSON.stringify(evtData))
      return {TEST_ONCE_AckData: {once: true}}
    }, true)

   const selfIFrame = IFrames.of()



   // 3. when window & iFrame ready
   // In Window
   testIFrame.tellEvent('TEST', {windowTriggerEvent: {msg: 'this from window tell iFrame'}}, (data) => {
      console.info('in window: ' + JSON.stringify(data))
    })

    testIFrame.tellEvent('TEST_ONCE', {windowTriggerTestOnce: {msg: 'TEST_ONCE this from window tell iFrame'}}, (data) => {
      console.info('in window: (only first call is valid) ' + JSON.stringify(data))
    })

    IFrames.of(testIFrameId).replyEvent('TEST',
      {iFrameTriggerEvent: {msg: 'this from iFrame reply window', callInWindow: true}}, (data) => {
      console.info('in window: ' + JSON.stringify(data))
    })

   // In IFrame
   selfIFrame.replyEvent('TEST', {iFrameTriggerEvent: {msg: 'this from iFrame reply window'}}, (data) => {
      console.warn('in iFrame: ' + JSON.stringify(data))
    })
</pre>
 */
class IFrames {

  /**
   * Returns an IFrameAssist instance
   * @param target
   * @returns {IFrameAssist}
   */
  static of(target) {
    return new IFrameAssist(target)
  }

  static getInstance() {
    return getDefaultFrame()
  }

  static setEncryption (encodeFunc, decodeFunc) {
    if (pi.isFunction(encodeFunc)) {
      encode = encodeFunc
    }

    if (pi.isFunction(encodeFunc)) {
      decode = decodeFunc
    }
  }

  /**
   * Create a new iFrame
   * @param id
   * @param name
   * @param align
   * @param allowfullscreen
   * @param frameborder
   * @param height
   * @param width
   * @param longdesc
   * @param marginheight
   * @param marginwidth
   * @param mozallowfullscreen
   * @param webkitallowfullscreen
   * @param referrerpolicy
   * @param scrolling
   * @param sandbox
   * @param seamless
   * @param src
   * @param srcdoc
   * @param selector
   * @returns {IFrameAssist}
   */
  static create({
    id = 'ifr_' + pi.uniqueId(),
    name = null,
    align = null,
    allowfullscreen = null,
    frameborder = 0,
    height = '100%',
    width = '100%',
    longdesc = null,
    marginheight = null,
    marginwidth = null,
    mozallowfullscreen = null,
    webkitallowfullscreen = null,
    referrerpolicy = null,
    scrolling = null,
    sandbox = null,
    seamless = null,
    src = null,
    srcdoc = null
  } = {}, selector = 'body') {
    name = name || id

    const iFrame = document.createElement('iframe')
    const frameAssist = IFrames.of(iFrame)

    frameAssist.attr({
      id, name, align, allowfullscreen, frameborder, height, width, longdesc, marginheight, marginwidth,
      mozallowfullscreen, webkitallowfullscreen, referrerpolicy, scrolling, sandbox, seamless, src, srcdoc
    })

    pi.querySelector(selector).appendChild(iFrame)

    try {
      frameAssist.document = frameAssist.getDocument()
      frameAssist.docInited = true
    } catch (e) {/**/}

    return frameAssist
  }

  /**
   * Post Event in iFrame
   * @param eventName
   * @param data
   * @param callback (data, event) => {}
   * @param fromIFrame
   */
  static post(eventName, data, callback, fromIFrame) {
    if (fromIFrame) {
      const aFrame = IFrames.of(fromIFrame)
      if (aFrame.isAvailable()) {
        aFrame.tellEvent(eventName, data, callback)
      }
    } else {
      getDefaultFrame().replyEvent(eventName, data, callback)
    }
  }

  /**
   * Publish Message in iFrame
   * @param data
   */
  static publish(data) {
    if (data && !isRoot()) {
      getDefaultFrame().reply(data)
    }
  }

  /**
   * Listener Message
   * @param callback  (data, event) => {}
   * @param once
   */
  static subscribe(callback, once) {
    getDefaultFrame().listen(callback, once, root)
  }

  /**
   * Register events handle, events { TEST: (evtName, evtData) => {} }
   * @param events
   * @param once
   */
  static registers(events = {}, once) {
    for (let [eventName, eventHandle] of Object.entries(events)) {
      if (pi.isFunction(eventHandle)) {
        IFrames.register(eventName, eventHandle, once)
      }
    }
  }

  /**
   * Register event handle, callback(evtName, evtData, data)
   * @param eventName
   * @param callback (evtName, evtData) => {}
   * @param once
   */
  static register(eventName, callback, once) {
    if (!aFramesEventHandle[eventName]) {
      aFramesEventHandle[eventName] = {
        once: once,
        func: callback
      }
    }

    if (!isEventHandleBind) {
      IFrames.subscribe((data) => {
        const evtName = data.event
        const evtData = data.data
        if (data && evtName) {
          const handle = aFramesEventHandle[evtName] || {}
          if (pi.isFunction(handle.func)) {
            const ackData = handle.func(evtName, evtData, data)
            if (true === handle.once) {
              delete aFramesEventHandle[evtName]
            }
            return ackData
          }
        }
      })

      isEventHandleBind = true
    }
  }
}

export { IFrameAssist }

export default IFrames
