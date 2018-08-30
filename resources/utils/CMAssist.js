'use strict'

import pi from '~pi'

const modes = {}
const languages = {}
const loadedTheme = ['default', 'lemon']
const thirdThemes = [
  'chrome-devtools', 'cssedit', 'eiffel', 'github', 'mac-classic', 'one-dark', 'sidewalkchalk', 'summerfruit',
  'tomorrow-night-blue', 'toy-chest'
]
const themes = [...[
  'default', 'lemon', '3024-day', '3024-night', 'abcdef', 'ambiance', 'base16-dark', 'base16-light', 'bespin',
  'blackboard', 'cobalt',
  'colorforth', 'dracula', 'eclipse', 'elegant', 'erlang-dark', 'hopscotch', 'icecoder', 'isotope', 'lesser-dark',
  'liquibyte',
  'material', 'mbo', 'mdn-like', 'midnight', 'monokai', 'neat', 'neo', 'night', 'paraiso-dark', 'paraiso-light',
  'pastel-on-dark',
  'railscasts', 'rubyblue', 'seti', 'solarized,dark', 'solarized,light', 'the-matrix', 'tomorrow-night-bright',
  'tomorrow-night-eighties',
  'ttcn', 'twilight', 'vibrant-ink', 'xq-dark', 'xq-light', 'yeti', 'zenburn'
], ...thirdThemes]

const blackBGMark = [
  'dark', 'night', 'black', 'abcdef'
]

const highlightTemplate = ({id, theme} = {}) => `
  <textarea style="display: none;" id="hl_src_${id}"></textarea>
  <div id="hl_ctx_${id}" style="display: none;">
    <pre id="hl_pre_${id}" class="CodeMirror cm-s-${theme}"></pre>
  </div>
`

let initializeModeInfo = () => {
  let {modeInfo} = CodeMirror
  if (modeInfo.length > 0 && (modeInfo[0].id || 0) > 0) {
    return modeInfo
  }

  //["name", "mime", "mode"], Optional property: ["ext", "mimes", "file", "alias"]
  let aModeInfoArray = []
  modeInfo.forEach((item) => {
    item.id = pi.uniqueId()
    item.theMimes = (item.mimes && item.mimes.length > 0)
      ? item.mimes : ('null' !== item.mime ? [item.mime] : [])

    languages[item.name.toLowerCase()] = item
    modes[item.mode.toLowerCase()] = item

    aModeInfoArray.push(item)
  })

  return CodeMirror.modeInfo = aModeInfoArray
}

let getModeInfo = (lang = '') => {
  lang = lang.toLowerCase()
  let info = languages[lang] || modes[lang]
  if (info) {
    return info
  }

  let tryExt = /.+\.([^.]+)$/.exec(lang)
  if (tryExt) {
    info = CodeMirror.findModeByExtension(tryExt[1])
  } else if (/\//.test(lang)) {
    info = CodeMirror.findModeByMIME(lang)
    info.mime = lang
  }
  if (info) {
    return info
  }

  info = CodeMirror.findModeByFileName(lang)
  if (info) {
    return info
  }

  info = CodeMirror.findModeByName(lang)
  if (info) {
    return info
  }

  info = CodeMirror.findModeByExtension(lang)
  if (info) {
    return info
  }

  return null
}

let loadModeReady = (modeBasePath, callback) => {
  if (pi.isFunction(CodeMirror.autoLoadMode)) {
    pi.isFunction(callback) && callback()
  } else {
    pi.script(`${modeBasePath}/addon/mode/loadmode.js`, () => {
      CodeMirror.modeURL = `${modeBasePath}/mode/%N/%N.js`
      pi.isFunction(callback) && callback()
    })
  }
}

let inputReadNotifyEvtHandle = null
let inputReadNotifyEvt = 'inputReadNotifyEvt'
let customEvts = ['fullscreen']

const predefineKeyActions = {
  Esc: 'fullscreenTgl',
  'Ctrl-L':'guttersTgl'
}

let mirrorBasePath = ''
let thirdThemePath = ''

class CMAssist {

  /*
  instance = null
  assistOptions
  events
  commands = []
   */

  constructor(instanceOfCodeMirror, events = {}, assistOptions = {}) {
    initializeModeInfo()
    this.instance = instanceOfCodeMirror
    this.commands = []

    this.assistOptions = Object.assign({
      basePath: mirrorBasePath,
      thirdThemePath: thirdThemePath
    }, assistOptions)

    this.events = Object.assign({
      inputRead: (cm, changeObj) => {
        this.format()
      },

      keyHandled(cm, keyName, event) {

      },

      onFullscreen: function (isFullscreen) {

      }
    }, events)

    for (let [k, v] of Object.entries(this.events)) {
      //CodeMirror event
      if (!customEvts.includes(k) && pi.isFunction(v)) {
        if ('keyHandled' === k) {
          this.instance.on(k, (cm, keyName, event) => {
            v(cm, keyName, event)
            if ('Backspace' === keyName && this.attrs(inputReadNotifyEvt)) {
              this.notifyContent()
            }
          })
        } else if ('inputRead' === k) {
          this.instance.on(k, (cm, changeObj) => {
            v(cm, changeObj)
            if (this.attrs(inputReadNotifyEvt)) {
              this.notifyContent()
            }
          })
        } else {
          this.instance.on(k, v)
        }
      }
    }

    /* [
        "selectAll", "singleSelection", "killLine", "deleteLine", "delLineLeft", "delWrappedLineLeft", "delWrappedLineRight",
        "undo", "redo", "undoSelection", "redoSelection", "goDocStart", "goDocEnd", "goLineStart", "goLineStartSmart",
        "goLineEnd", "goLineRight", "goLineLeft", "goLineLeftSmart", "goLineUp", "goLineDown", "goPageUp", "goPageDown",
        "goCharLeft", "goCharRight", "goColumnLeft", "goColumnRight", "goWordLeft", "goGroupRight", "goGroupLeft", "goWordRight",
        "delCharBefore", "delCharAfter", "delWordBefore", "delWordAfter", "delGroupBefore", "delGroupAfter", "indentAuto",
        "indentMore", "indentLess", "insertTab", "insertSoftTab", "defaultTab", "transposeChars", "newlineAndIndent",
        "openLine", "toggleOverwrite", "toggleComment", "closeTag", "newlineAndIndentContinueMarkdownList", "toMatchingTag",
        "toggleFold", "fold", "unfold", "foldAll", "unfoldAll", "autocomplete", "jumpToLine", "find", "findPersistent",
        "findPersistentNext", "findPersistentPrev", "findNext", "findPrev", "clearSearch", "replace", "replaceAll",
        "wrapLines", "goNextDiff", "goPrevDiff"
      ] */

    for (let k of Object.keys(CodeMirror.commands)) {
      let commandM = {}
      commandM[k] = () => {
        return this.handleCmd(k)
      }
      Object.assign(this, commandM)
      this.commands.push(k)
    }
  }

  static setMirrorBase({theMirrorBasePath, theThirdThemePath} = {
    theMirrorBasePath: '',
    theThirdThemePath: ''
  }) {
    mirrorBasePath = theMirrorBasePath
    thirdThemePath = theThirdThemePath
  }

  static getMirrorOptions(options = {}) {
    let extraKeys = Object.assign({
      //http://codemirror.net/doc/manual.html#commands
      'Ctrl-K': 'toMatchingTag',
      'Ctrl-J': 'autocomplete',
      'Ctrl-Q': 'toggleFold'
    }, options.extraKeys || {})

    return Object.assign({
      autofocus: false,
      lineNumbers: false,
      matchBrackets: true,
      theme: 'lemon',
      styleActiveLine: false,
      readOnly: false,
      mode: 'text/x-markdown',
      autoCloseBrackets: true,
      autoCloseTags: true,
      lineWrapping: true,
      foldGutter: true,
      content: '',
      scrollbarStyle: 'null', //native
      gutters: [],
      matchTags: {
        bothTags: true
      }
    }, options, {
      extraKeys: extraKeys
    })
  }

  langInfo(lang) {
    return getModeInfo(lang)
  }

  isThirdTheme(target = this.theme()) {
    return thirdThemes.filter(item => {
      return item === target
    }).length > 0
  }

  isBlackBGTheme(target = this.theme()) {
    let isBlackBG = false
    for (let bbg of blackBGMark) {
      if (target.includes(bbg)) {
        isBlackBG = true
        break
      }
    }

    return isBlackBG
  }

  requireTheme(themeName) {
    themeName = /^solarized/.test(themeName) ? 'solarized' : themeName
    if (!themes.includes(themeName)) {
      throw Error('Cound not find theme ' + themeName)
    }

    if (!loadedTheme.includes(themeName)) {
      let themePath = this.isThirdTheme(themeName)
        ? `${this.assistOptions.thirdThemePath}/${themeName}.css`
        : `${this.assistOptions.basePath}/theme/${themeName}.css`
      pi.css(themePath)
      loadedTheme.push(themeName)
    }

    return themeName
  }

  doc() {
    return this.instance.doc
  }

  val(data) {
    if (pi.isUndefined(data)) {
      return this.instance.getValue()
    }

    this.instance.setValue(data)
    this.refreshDelay()
    return data
  }

  refreshDelay(wait) {
    pi.delay((cm) => {
      this.instance.refresh()
    }, wait || 100, this.instance)
  }

  handleCmd(input) {
    return this.instance.execCommand(input)
  }

  isSelected() {
    return this.doc().somethingSelected()
  }

  selected(isNoneMirrorTextIfNoneSelected) {
    let text = ''

    if (this.isSelected()) {
      text = this.instance.doc().getSelection()
    } else {
      if (true !== isNoneMirrorTextIfNoneSelected) {
        text = this.val()
      }
    }

    return text
  }

  replaceSelected(code, collapse, origin) {
    this.doc().replaceSelection(code, collapse, origin)
  }

  attrs(optionKey, optionVal) {
    if (pi.isJSON(optionKey)) {
      for (let [k, v] of Object.entries(optionKey)) {
        this.instance.setOption(k, v)
      }
      return optionKey
    }

    if (pi.isUndefined(optionKey)) {
      return this.instance.options
    }

    if (pi.isArray(optionKey)) {
      let rAttr = {}

      for (let elem of optionKey.values()) {
        rAttr[okey] = this.instance.getOption(okey)
      }

      return rAttr
    }

    let aVal = this.instance.getOption(optionKey)
    if (pi.isUndefined(optionVal)) {
      return aVal
    }

    this.instance.setOption(optionKey, optionVal)
    return aVal
  }

  theme(th) {
    if (pi.isUndefined(th)) {
      return this.attrs('theme')
    }

    th = this.requireTheme(th)
    this.attrs('theme', th)
    return th
  }

  mode(langName, optionalChosenMimeOrExt) {
    let cmeKey = 'chosenMimeOrExt'
    if (pi.isUndefined(langName)) {
      let rInfo = {}

      Object.assign(rInfo, this.langInfo(this.attrs('mode') || 'Plain Text'))
      Object.assign(rInfo, {
        chosenMimeOrExt: this.attrs(cmeKey) || ''
      })

      return rInfo
    }

    let info = this.langInfo(langName)
    if (!info) {
      throw Error('Could not find a mode corresponding to ' + langName)
    }

    let spec = info.mime, mode = info.mode
    spec = 'null' === spec ? mode : spec
    this.attrs('mode', spec)
    this.autoLoadMode(mode)

    if (optionalChosenMimeOrExt) {
      this.attrs(cmeKey, optionalChosenMimeOrExt)
    } else {
      let curCME = this.attrs(cmeKey) || ''
      if (!info.theMimes.includes(curCME)) {
        this.attrs(cmeKey, info.theMimes.length > 0 ? info.theMimes[0] : '')
      }
    }

    return info
  }

  autoLoadMode(mode) {
    let cm = this.instance
    loadModeReady(this.assistOptions.basePath, () => {
      CodeMirror.autoLoadMode(cm, mode)
    })
  }

  requireMode(mode, callback) {
    let aLangInfo = this.langInfo(mode)
    if (null == aLangInfo) {
      console && console.warn(`requireMode ignored. invalid mode ${mode}`)
      return
    }

    let reqM = function (aMode) {
      if (!pi.has(CodeMirror.modes, aMode)) {
        CodeMirror.requireMode(aMode, function () {
          pi.isFunction(callback) && callback(aLangInfo)
        })
      } else {
        pi.isFunction(callback) && callback(aLangInfo)
      }
    }

    loadModeReady(this.assistOptions.basePath, () => {
      reqM(aLangInfo.mode)
    })
  }

  tip(msg, tipOptions, tipTemplate = `<span style="color: orange">${msg}</span>`) {
    return this.instance.openNotification(tipTemplate, Object.assign({
      bottom: true,
      duration: 5000
    }, tipOptions || {}))
  }

  //opt 1 toggle, 2 true, 3 false, 4 get
  tglOption(optionKey, opt = 1) {
    switch (opt) {
      case 1:
        this.attrs(optionKey, !this.attrs(optionKey))
        break
      case 2:
        this.attrs(optionKey, true)
        break
      case 3:
        this.attrs(optionKey, false)
        break
      case 4:
        break
    }

    return this.attrs(optionKey)
  }

  wordwrap() {
    return this.tglOption('lineWrapping')
  }

  elId() {
    let theId = this.el().getAttribute('id')
    if (!theId) {
      theId = 'mirror_' + pi.uniqueId()
      this.el().setAttribute('id', theId)
    }

    return '#' + theId
  }

  el() {
    return this.instance.getWrapperElement()
  }

  /**
   * Enable default key action, enable all predefine keys if no argument.</br>
   * <pre>
   * {
   *  Esc: false, // disable Esc key
   *  Esc: 'Ctrl-Esc' // map Esc key to 'Ctrl-Esc'
   * }
   * </pre>
   * @see predefineKeyActions
   */
  mapPredefineKeys(enablePredefineKeys = {}) {
    let keyActions = {}
    for (let [key, act] of Object.entries(predefineKeyActions)) {
      let keyMapValue = enablePredefineKeys[key]
      // default is enable or enable explicit by true value
      if (pi.isUndefined(keyMapValue) || true === keyMapValue) {
        keyActions[key] = act
      }
      // change default key to the given value
      else if (pi.isString(keyMapValue)) {
        keyActions[keyMapValue] = act
      }
    }

    pi.delay(() => {
      this.mapKeys(keyActions)
    }, 300)
  }

  mapKeys(keymap = {}) {
    let custKeys = {}
    let that = this

    for (let [k, v] of Object.entries(keymap)) {
      if (pi.isString(v)) {
        custKeys[k] = (cm) => {
          return that[v]()
        }
       } else if (pi.isFunction(v)) {
        custKeys[k] = (cm) => {
          return v()
        }
      }
    }

    this.extraKeys(custKeys)
  }

  extraKeys(keymap = {}) {
    this.instance.setOption("extraKeys", Object.assign(this.instance.getOption('extraKeys') || {}, keymap))
  }

  toLastLine() {
    //this.instance.scrollIntoView({line: this.instance.lastLine()})
    this.toLine(this.instance.lastLine() + 1)
  }

  toLine(line, ch) {
    let aLines = this.visibleLines()
    if (line > aLines.bottom) {
      line = line + (aLines.bottom - aLines.top - 2)
    }

    this.instance.setCursor((line || 1) - 1, ch || 0)
  }

  scrollToLine(lineNo, mode) {
    let coord = this.instance.charCoords({line: lineNo, ch: 0}, mode || 'local')
    let scrollElArr = this.instance.getWrapperElement().getElementsByClassName('CodeMirror-scroll')
    if (scrollElArr.length) {
      scrollElArr[0].scrollTop = coord.top
    }

    //   $(this.instance.getWrapperElement()).find('.CodeMirror-scroll').stop(true).animate({
    //     scrollTop: coord.top
    //   }, 100, 'linear')
  }

  visibleLines(occludeToleranceTop = 0, occludeToleranceBottom = 0) {
    let scrollInfo = this.instance.getScrollInfo()
    let from = this.instance.coordsChar({left: 0, top: occludeToleranceTop + scrollInfo.top}, 'local')
    let bottomY = scrollInfo.clientHeight - occludeToleranceBottom + scrollInfo.top
    let to = this.instance.coordsChar({left: 0, top: bottomY}, 'local')
    return {top: from.line + 1, bottom: to.line + 1}
  }

  //opt 1 toggle, 2 show, 3 unshow, 4 get
  guttersTgl(opt = 1, options) {
    let hasGutters = ((this.attrs('gutters') || []).length > 0)
    switch (opt) {
      case 1:
        return this.guttersTgl(options, hasGutters ? 3 : 2)
      case 2:
        if (!hasGutters) {
          options = Object.assign({
            foldGutter: true,
            lineNumbers: true,
            gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter']
          }, options || {})

          this.attrs(options)
        }
        break
      case 3:
        if (hasGutters) {
          options = Object.assign({
            foldGutter: false,
            lineNumbers: false,
            gutters: []
          }, options || {})

          this.attrs(options)
        }
        break
      case 4:
        break
    }

    return (this.attrs('gutters') || []).length > 0
  }

  fullscreenTgl(full) {
    if (!this.instance.getOption('fullScreen')) {
      this.fullBefore = {
        lineNumbers: this.instance.getOption('lineNumbers'),
        styleActiveLine: this.instance.getOption('styleActiveLine')
      }
    }

    let isFullscreen = null
    this.instance.setOption("fullScreen", !full ? !this.instance.getOption("fullScreen") : full)
    if (this.instance.getOption('fullScreen')) {
      this.instance.setOption('lineNumbers', true)
      this.instance.setOption('styleActiveLine', true)
      isFullscreen = true
    } else {
      for (let [k, v] of Object.entries(this.fullBefore)) {
        this.instance.setOption(k, v)
      }
      isFullscreen = false
    }

    pi.isFunction(this.events.onFullscreen) && this.events.onFullscreen(isFullscreen)
    return isFullscreen
  }

  checkIsJson(text) {
    if (!pi.isJSON(text || this.selected())) {
      alert('The selected or content is not a valid json.')
      return false
    }

    return true
  }

  isJSON(noneLogWarnMsg) {
    return pi.isJSON(this.instance.getValue(), !noneLogWarnMsg)
  }

  // formatHandle(value, doneHandle(beautifyValue))
  format(formatHandle, notUseDefaultJsonFormat) {
    let cursor = this.instance.getCursor()
    let targetValue = this.selected()
    let isSelectedTxt = this.isSelected()

    let aDoneHandle = (aValue) => {
      if (isSelectedTxt) {
        this.replaceSelected(aValue)
      } else {
        this.instance.setValue(aValue)
      }

      this.instance.setCursor(cursor)
      this.refreshDelay()
    }

    if (!notUseDefaultJsonFormat && pi.isJSON(targetValue)) {
      aDoneHandle(pi.fmtJSON(targetValue))
    } else {
      pi.isFunction(formatHandle) && formatHandle(targetValue, (beautifyValue) => {
        aDoneHandle(beautifyValue)
      }, isSelectedTxt)
    }
  }

  linesInfo(mode = 'local') {
    let cmLines = [], lc = this.instance.lineCount()
    cmLines[0] = 0
    for (let i = 1; i <= lc; i++) {
      cmLines[i] = this.instance.charCoords({line: i, ch: 0}, mode)
    }

    return cmLines
  }

  state({mode /* {name: '', mime: ''} */, theme, content} = {}) {
    if (pi.isJSON(mode)) {
      let {name, mime} = mode
      this.mode(name, mime)
    }

    if (!pi.isUndefined(theme)) {
      this.theme(theme)
    }

    if (!pi.isUndefined(content)) {
      this.val(content)
    }

    let cMode = this.mode()
    return {
      mode: {
        name: cMode.name,
        mime: cMode.chosenMimeOrExt || cMode.mime
      },
      theme: this.theme(),
      content: this.val()
    }
  }

  getNotifyContent(customData = {}, evtName = 'MIRROR_INPUT_READ_NOTIFY') {
    let mirrorData = {
      event: evtName,
      data: this.state()
    }

    mirrorData.data = Object.assign(customData, mirrorData.data)
    return mirrorData
  }

  setNotifyContentHandle(handle) {
    inputReadNotifyEvtHandle = handle
  }

  notifyContent(customData, evtName) {
    pi.isFunction(inputReadNotifyEvtHandle)
    && inputReadNotifyEvtHandle(this.getNotifyContent(customData, evtName))
  }

  inputReadNotifyTgl(opt) {
    return this.tglOption(inputReadNotifyEvt, opt)
  }

  readonlyTgl(isNocursor) {
    if (!isNocursor) {
      return this.tglOption('readOnly')
    } else {
      return this.attrs('readOnly', 'nocursor')
    }
  }

  chgFontSize(size) {
    this.chgStyle({
      'font-size': size + 'px'
    })
  }

  chgStyle(styles = {}) {
    for (let [k, v] of Object.entries(styles)) {
      this.instance.getWrapperElement().style[k] = v
    }
    this.refreshDelay()
  }

  setSize(width, height) {
    this.instance.setSize(width, height)
  }

  highlight(inputSelector, modeSpec, outputSelector, callback) {
    this.requireMode(modeSpec, (modeInfo) => {
      CodeMirror.runMode(pi.query(inputSelector).value, modeInfo.mime, pi.query(outputSelector))
      pi.isFunction(callback) && callback(modeInfo)
    })
  }

  highlights({
      input = '',
      inputIsElement = false,
      callback = (result) => {},
      mode = 'text',
      theme = 'default'
    } = {}) {

    let hlId = pi.uniqueId('highlighted-')
    let hlSrcId = `#hl_src_${hlId}`
    let hlCtxId = `#hl_ctx_${hlId}`
    let hlPreId = `#hl_pre_${hlId}`

    let div = document.createElement('div')
    div.setAttribute('id', hlId)
    div.innerHTML = highlightTemplate({id: hlId, theme: theme})

    pi.query('body').append(div)
    pi.query(hlSrcId).value = inputIsElement ? pi.query(input).value : input

    this.highlight(hlSrcId, mode, hlPreId, (modeInfo) => {
      let theOutput = pi.query(hlCtxId).innerHTML
      pi.query(`#${hlId}`).remove()
      pi.isFunction(callback) && callback(theOutput, modeInfo, theme);
    })
  }
}

export default CMAssist
