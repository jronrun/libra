'use strict'

import pi from '~pi'
import {defineEx} from './NMAssist'

const ex = Symbol('ex')

const predefineDirectives = [
  ['new', 'n'],
  ['edit', 'e'],
  ['del', 'd'],
  ['help', 'h'],
  ['theme', 'th'],
  ['mode', 'm'],
  ['joinline', 'jo', 'joinLines'],
  ['wnew', 'wn', 'saveAsNew'],
  ['asnew', 'asn'],
  ['open', 'o'],
  ['menu'],
  ['quit', 'q'],
  ['share'],
  ['shared'],
  ['view', 'v'],
  ['fullscreen', 'full', 'fullscreenTgl'],
  ['live'],
  ['info'],
  ['w'],
  ['ww'],
  ['wq'],
  ['save', 'sa'],
  ['rich'],
  ['compare', 'comp'],
  ['format', 'fo'],
  ['wrapword', 'wrap', 'wordwrap'],
  ['foldall', 'folda', 'foldAll'],
  ['unfoldall', 'unfolda', 'unfoldAll'],
  ['jump', false, 'jumpToLine']
]

const directives = {}

class NMAssistDirective {

  constructor(instanceOfNMAssist) {
    this.instance = instanceOfNMAssist
    this.overrideHandles = {}

    for (let directive of predefineDirectives) {
      this[ex](...directive)
    }
  }

  [ex](value, short = '', handle, label, describe) {
    let aHandle = null
    handle = handle || value
    label = label || `directive.${value}.label`
    describe = describe || `directive.${value}.desc`

    const that = this
    if (pi.isFunction(handle)) {
      aHandle = (args, cm) => {
        handle.bind(that)(args, cm)
      }
    } else {
      aHandle = (args, cm) => {
        let theHandle
        if (pi.isFunction(theHandle = this.overrideHandles[handle])) {
          theHandle.bind(that)(args, cm)
        } else if (pi.isFunction(theHandle = this[handle])) {
          theHandle.bind(that)(args, cm)
        } else if (pi.isFunction(theHandle = this.instance[handle])) {
          theHandle.bind(that.instance)()
        }
      }
    }

    let props = {label, value, short, describe, handle: aHandle}

    defineEx(props.value, props.handle, props.describe, props.short)
    directives[value] = props

    return props
  }

  /**
   * Register new directives
   * usage:
   * <pre>
      register('test', 'te', function (args, cm) {
        // this point to NMAssistDirective instance
        this.w(args, cm) //call instance of NMAssistDirective's w method
      })
   * </pre>
   *
   * @param value       directive name
   * @param short       directive short name
   * @param handle      directive handle
   * @param label       directive label
   * @param describe    directive description
   * @returns {*}
   */
  register(value, short, handle, label, describe) {
    return this[ex](value, short, handle, label, describe)
  }

  /**
   * Register the handle that override to default behave.
   * usage:
   * <pre>
   {
     // override NMAssistDirective's w method
     w: function(args, cm) {
      // this point to NMAssistDirective instance
      this.w(args, cm) //call instance of NMAssistDirective's w method
     }
   }
   </pre>
   */
  registerHandle(theHandles = {}) {
    for (let [value, handle] of Object.entries(theHandles)) {
      this.overrideHandles[value] = handle
    }
  }

  new(args, cm) {

  }

  edit(args, cm) {

  }

  del(args, cm) {

  }

  help(args, cm) {

  }

  theme(args) {

  }

  joinLines(args) {
    let start = 0, end = undefined
    if (args.args) {
      const len = args.args.length
      if (1 === len) {
        start = parseInt(args.args[0]) - 1
      } else if (len > 1) {
        start = parseInt(args.args[0]) - 1
        end = parseInt(args.args[1]) - 1
      }
    }
    this.instance.joinLine(start, end)
  }

  mode(args) {
    core.menu.lang.change(args.get(0), args.get(1))
  }

  wnew(args, cm) {

  }

  asnew(args, cm) {

  }

  open(args, cm) {

  }

  menu(args, cm) {

  }

  quit(args, cm) {

  }

  share(args, cm) {

  }

  shared(args, cm) {

  }

  view(args) {

  }

  live(args) {

  }

  info(args, cm) {

  }

  w(args, cm) {

  }

  ww(args, cm) {

  }

  wq(args, cm) {

  }

  save(args, cm) {

  }

  rich(args, cm) {

  }

  compare(args, cm) {

  }

  format(args, cm) {
    this.instance.format((value, doneHandle) => {
      const aData = this.instance.getNotifyContent().data
      aData.content = value
      transform.beautify(aData, (aResult) => {
        doneHandle(aResult)
      })
    })
  }
}

export default NMAssistDirective
