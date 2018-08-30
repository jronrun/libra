'use strict'

import pi from '~pi'
import CMAssist from '../utils/CMAssist'

let mirrorWrap = (instanceOfCodemirror, assistEvents, assistOptions) => {
  return new CMAssist(instanceOfCodemirror, assistEvents, assistOptions)
}

const assists = Symbol('assists')
const editors = Symbol('editors')
const editorsName = ['left', 'middle', 'right']

class MVAssist {
  /*
  elementId
  instance = null
  left
  middle
  right
   */

  /**
   * panels 2: value orig,
   * panels 3: origLeft value orig
   */
  constructor(instanceOfMergeView, assistEvents = {}, assistOptions = {}) {
    this.instance = instanceOfMergeView
    this.elementId = pi.uniqueId('merge-view-')

    this[assists] = {assistEvents, assistOptions}
    this[editors]()
    this.beauty()
  }

  [editors]() {
    let assistEvents = this[assists].assistEvents
    let assistOptions = this[assists].assistOptions

    this.left = this.is2Panels()
      ? mirrorWrap(this.instance.editor(), assistEvents, assistOptions)
      : mirrorWrap(this.instance.leftOriginal(), assistEvents, assistOptions)

    this.middle = this.is2Panels() ? null : mirrorWrap(this.instance.editor(), assistEvents, assistOptions)
    this.right = mirrorWrap(this.instance.rightOriginal(), assistEvents, assistOptions)
  }

  /**
   * panels 2: value orig, panels 3: origLeft value orig
   * @param options
   */
  static getMirrorOptions(options = {}) {
    return Object.assign({
      origLeft: undefined,
      value: '',
      orig: '',

      connect: null,
      mode: '',
      lineNumbers: true,
      revertButtons: true,
      showDifferences: true,
      highlightDifferences: true,
      collapseIdentical: false,
      allowEditingOriginals: true
    }, options)
  }

  is2Panels() {
    return pi.isUndefined(this.instance.options.origLeft)
  }

  tglOption(optionKey) {
    this.attrs(optionKey, !this.attrs(optionKey))
    return this.attrs(optionKey)
  }

  attrs(optionKey, optionVal) {
    if (pi.isJSON(optionKey)) {
      for (let [k, v] of Object.entries(optionKey)) {
        this.instance.options[k] = v
      }
      return optionKey
    }

    if (pi.isUndefined(optionKey)) {
      return this.instance.options
    }

    if (pi.isArray(optionKey)) {
      let rAttr = {}
      for (let elem of optionKey.values()) {
        rAttr[elem] = this.instance.options[elem]
      }
      return rAttr
    }

    let aVal = this.instance.options[optionKey]
    if (pi.isUndefined(optionVal)) {
      return aVal
    }

    this.instance.options[optionKey] = optionVal
    return aVal
  }

  next() {
    CodeMirror.commands.goNextDiff(this.left.instance)
  }

  prev() {
    CodeMirror.commands.goPrevDiff(this.left.instance)
  }

  differencesTgl(value) {
    let val = pi.isUndefined(value) ? !this.attrs('highlightDifferences') : value
    this.instance.setShowDifferences(val)
    this.attrs('highlightDifferences', val)
    return this
  }

  alignTgl() {
    return this.refresh({
      connect: this.attrs('connect') ? null : 'align'
    })
  }

  collapseTgl() {
    this.tglOption('collapseIdentical');
    let vs = this.viewsState();
    return this.refresh({
      value: vs.middle ? vs.middle.content : vs.left.content,
      orig: vs.right.content
    });
  }

  allowEditOrigTgl() {
    this.tglOption('allowEditingOriginals');
    return this.refresh();
  }

  revertButtonsTgl() {
    this.tglOption('revertButtons');
    return this.refresh();
  }

  lineNumbersTgl() {
    this.tglOption('lineNumbers');
    return this.refresh();
  }

  panelsTgl() {
    let origLeft = undefined
    let value = this.left.val()
    let orig = this.right.val()

    if (this.is2Panels()) {
      // 2 -> 3
      origLeft = this.left.val()
    }

    return this.refresh({
      origLeft: origLeft,
      value: value,
      orig: orig
    });
  }

  refresh(options = {}) {
    let newOptions = {}
    let prevAttributes = this.attrs()

    let defaultViewState = {
      mode: {name: this.left.mode().name},
      theme: this.left.theme()
    }
    let prevViewsState = this.viewsState(options)
    Object.assign(newOptions, prevAttributes, options)

    let anElement = pi.query(`#${this.elementId}`)
    anElement.innerHTML = ''
    this.instance = CodeMirror.MergeView(anElement, newOptions)
    this[editors]()

    this.actions((inst, instN) => {
      let instState = Object.assign(prevViewsState[instN] || defaultViewState, {
        content: undefined
      })

      inst.state(instState)
    })

    this.beauty()
    return this
  }

  mergedView() {
    return this.is2Panels() ? this.left : this.middle
  }

  beauty({
    wrap = {
      border: 'none'
    },
    gap = {
      'border-color': '#d9edf7',
      'background-color': '#ffffff'
    },
    gutters = {
      border: 'none',
      'background-color': '#ffffff'
    }
  } = {}) {
    pi.styles(this.instance.wrap, wrap)
    pi.styles('.CodeMirror-merge-gap', gap)
    pi.styles('.CodeMirror-gutters', gutters)
  }

  setSize(width, height) {
    this.actions((inst) => {
      inst.setSize(width, height)
    })
  }

  /**
   * Same action to each mirror instance
   * @param doFunction    function(inst) {}
   */
  actions(doFunction) {
    for (let elem of editorsName.values()) {
      let aMirror = null
      if (null != (aMirror = this[elem])) {
        pi.isFunction(doFunction) && doFunction(aMirror, elem)
      }
    }
  }

  viewsState(options = {}) {
    let viewVals = {}
    let is2Panels = this.is2Panels()

    if (!pi.has(options, 'origLeft')) {
      //viewVals.left = is2Panels ? this.instance.editor().getValue() : this.instance.leftOriginal().getValue()
      viewVals.left = this.left.state()
    }

    if (!pi.has(options, 'value')) {
      //viewVals.middle = this.instance.editor().getValue()
      viewVals.middle = is2Panels ? undefined : this.middle.state()
    }

    if (!pi.has(options, 'orig')) {
      //viewVals.right = this.instance.rightOriginal().getValue()
      viewVals.right = this.right.state()
    }

    viewVals.is2Panels = is2Panels
    return viewVals
  }

}

export default MVAssist
