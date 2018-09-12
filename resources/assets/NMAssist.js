'use strict'

import pi from '~pi'
import CMAssist from './CMAssist'

const doDefineEx = (cmd, exHandle, desc = '', shortCmd) => {
  if (!cmd || !pi.isFunction(exHandle)) {
    return
  }

  let exBody = {
    cmd,
    exHandle,
    desc,
    shortCmd: shortCmd || cmd
  }

  CodeMirror.Vim.defineEx(exBody.cmd, exBody.shortCmd, (cm, params) => {
    params = Object.assign({
      args: [],
      argString: '',
      input: '',
      line: false,
      commandName: ''
    }, params)

    params.get = (index = 0, defaultValue) => {
      if (params.args && params.args.length > index) {
        return params.args[index]
      }

      return defaultValue
    }

    exBody.exHandle(params, cm)
  })
}

export { doDefineEx as defineEx }

class NMAssist extends CMAssist {
  /*
  instance = null
   */

  constructor(instanceOfCodeMirror, assistEvents = {}, assistOptions = {}) {
    super(instanceOfCodeMirror, Object.assign({
      inputRead: function (cm, changeObj) {
      }
    }, assistEvents), assistOptions)

    this.instance = instanceOfCodeMirror
  }

  static getMirrorOptions(options = {}) {
    let extraKeys = Object.assign({
      //http://codemirror.net/doc/manual.html#commands
      "Ctrl-/": 'toggleComment',
      "Ctrl-A": 'selectAll'
    }, options.extraKeys || {})

    return CMAssist.getMirrorOptions(Object.assign({
      mode: 'markdown',
      keyMap: 'vim',
      fullScreen: false,
      autofocus: true,
      lineNumbers: true,
      lineNumberFormatter: (line) => {
        return 1 === line ? '' : line
      },
      showCursorWhenSelecting: true,
      styleActiveLine: true
    }, options, {
      extraKeys: extraKeys
    }))
  }

  static defineEx(cmd, exHandle, desc = '', shortCmd) {
    return doDefineEx(cmd, exHandle, desc, shortCmd)
  }

  visualMode() {
    return CodeMirror.Vim.exitInsertMode(this.instance)
  }

  editMode() {
    return this.handleVimKey('i')
  }

  handleVimEx(input) {
    return CodeMirror.Vim.handleEx(this.instance, input)
  }

  handleVimKey(input, origin) {
    return CodeMirror.Vim.handleKey(this.instance, input, origin)
  }

  joinLine(startLine = 0, endLine) {
    let start = startLine
    let end = endLine || this.instance.lineCount()
    let cursor = this.instance.getCursor()

    let tmpCursor = pi.clone(cursor)
    tmpCursor.line = start
    this.instance.setCursor(tmpCursor)

    for (let idx = start; idx < end; idx++) {
      this.handleVimKey('J')
    }

    this.instance.setCursor(cursor)
  }
}

export default NMAssist
