'use strict'

import pi from '~pi'
import JSON5 from 'json5'
import {parse, tokenize} from 'jju/lib/parse'
import {stringify} from 'jju/lib/stringify'
import {analyze} from 'jju/lib/analyze'

const COMMENT_TYPE = 'comment'
const WHITESPACE_TYPE = 'whitespace'
const NEWLINE_TYPE = 'newline'

const tabs = (count) => {
  return new Array(count + 1).join('\t')
}

const nextToken = (tokens, curIdx) => {
  tokens = tokens || []
  let tkn = { raw: '', type: '', stack: [], value: ''}
  let tl = tokens.length
  let betnHasNL = 0

  for (let idx = curIdx; idx < tl; idx++) {
    if (idx + 1 >= tl) {
      break
    }

    tkn = tokens[idx + 1]
    if (tkn.type !== WHITESPACE_TYPE && tkn.type !== NEWLINE_TYPE) {
      break
    } else if (tkn.type === NEWLINE_TYPE) {
      ++betnHasNL
    }
  }

  tkn.betnHasNL = betnHasNL
  return tkn
}

const prevToken = (tokens = [], curIdx) => {
  let tkn = { raw: '', type: '', stack: [], value: ''}
  let betnHasNL = 0

  for (let idx = curIdx; idx > 0; idx--) {
    if (idx - 1 < 0) {
      break
    }

    tkn = tokens[idx - 1]
    if (tkn.type !== WHITESPACE_TYPE && tkn.type !== NEWLINE_TYPE) {
      break
    } else if (tkn.type === NEWLINE_TYPE) {
      ++betnHasNL
    }
  }

  tkn.betnHasNL = betnHasNL
  return tkn
}

const json5format = (target) => {
  let tokens = tokenize(target)
  let out = ''
  let indent = 0

  for (let [idx, token] of tokens.entries()) {
    let sep = token.raw
    let nl = '\n'
    let prev = null
    let next = null

    switch (token.type) {
      case WHITESPACE_TYPE:
        break
      case COMMENT_TYPE:
        prev = prevToken(tokens, idx)
        if (COMMENT_TYPE === prev.type) {
          out += tabs(indent)
        }
        if (/^\/\*/.test(sep)) {
          sep = nl + sep.replace(/\n/g, nl + tabs(indent))
        }
        out += sep + nl
        break

      case 'key':
        prev = prevToken(tokens, idx)
        if (COMMENT_TYPE === prev.type) {
          out += tabs(indent)
        }
        out += sep
        break

      case 'literal':
        prev = prevToken(tokens, idx)
        if (COMMENT_TYPE === prev.type) {
          out += tabs(indent)
        }
        out += sep
        break

      case 'separator':
        if ('{' === sep || '[' === sep) {
          out += sep + nl + tabs(++indent)
        } else if ('}' === sep || ']' === sep) {
          out += nl + tabs(--indent) + sep
        } else if (',' === sep) {
          next = nextToken(tokens, idx)
          if (next.raw !== '}' && next.raw !== ']') {
            out += sep

            if (next.type === COMMENT_TYPE) {
              if (next.betnHasNL > 0) {
                out += nl
              }
            } else {
              out += nl
            }

            out += tabs(indent)
          }
          //out += sep + nl + tabs(indent)
        } else if (':' === sep) {
          out += sep + ' '
        } else {
          out += sep
        }
        break

      case NEWLINE_TYPE:
        break
    }
  }

  return out
}

class JSON5s {

  static format(target) {
    if (!pi.isString(target)) {
      target = stringify(target);
    }

    return json5format(target)
  }

  static toggleStandardJSON(target) {
    if (JSON5s.isStandardJSON(target)) {
      return stringify(JSON5s.parse(target))
    }

    return JSON.stringify(JSON5s.parse(target))
  }

  static formatStandardJSON(target, replacer = false, space = 2) {
    return JSON.stringify(target, replacer, space)
  }

  static isStandardJSON(target, noneLogWarnMsg = true) {
    try {
      if (!pi.isString(target)) {
        target = JSON.stringify(target)
      }

      JSON.parse(target)
    } catch (e) {
      if (!noneLogWarnMsg) {
        console.warn('There is not a standard JSON', e)
      }

      return false
    }

    return true
  }

  static parse(target, options) {
    if (!pi.isString(target)) {
      target = stringify(target)
    }

    return parse(target, options)
  }

  static stringify(target, options, space) {
    return stringify(target, options, space)
  }

}

export {JSON5, tokenize, analyze}

export default JSON5s
