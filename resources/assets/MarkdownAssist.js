'use strict'

import pi from '~pi'

import MarkdownIt from 'markdown-it'
import pluginFootnote from 'markdown-it-footnote'
import pluginTocAndAnchor from 'markdown-it-toc-and-anchor'
import pluginCheckbox from 'markdown-it-checkbox'
import pluginEmoji from 'markdown-it-emoji'
import pluginMark from 'markdown-it-mark'
import pluginSub from 'markdown-it-sub'
import pluginSup from 'markdown-it-sup'
import pluginAbbr from 'markdown-it-abbr'
import pluginDeflist from 'markdown-it-deflist'
import pluginContainer from 'markdown-it-container'
import pluginIns from 'markdown-it-ins'

import 'github-markdown-css'

const features = Symbol('features')

// https://markdown-it.github.io/
// Inject line numbers for sync scroll. Notes:
//
// - We track only headings and paragraphs on first level. That's enough.
// - Footnotes content causes jumps. Level limit filter it automatically.
const injectLineNumbers = (tokens, idx, options, env, slf) => {
  let line
  if (tokens[idx].map && tokens[idx].level === 0) {
    line = tokens[idx].map[0]
    tokens[idx].attrJoin('class', 'line')
    tokens[idx].attrSet('data-line', pi.sign(line))
  }

  return slf.renderToken(tokens, idx, options, env, slf)
}

/**
 * https://markdown-it.github.io/markdown-it
 */
class MarkdownAssist {

  constructor({
    html =         true,         // Enable HTML tags in source
    xhtmlOut =     false,        // Use '/' to close single tags (<br />).
                                 // This is only for full CommonMark compatibility.
    breaks =       false,        // Convert '\n' in paragraphs into <br>
    langPrefix =   'language-',  // CSS language prefix for fenced blocks. Can be
                                 // useful for external highlighters.
    linkify =      true,         // Autoconvert URL-like text to links

    // Enable some language-neutral replacement + quotes beautification
    typographer =  true,

    // Double + single quotes replacement pairs, when typographer enabled,
    // and smartquotes on. Could be either a String or an Array.
    //
    // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
    // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
    quotes = '“”‘’',

    // Highlighter function. Should return escaped HTML,
    // or '' if the source string is not changed and should be escaped externaly.
    // If result starts with <pre... internal wrapper is skipped.
    //highlight(/*source, lang*/) { return '' }
    highlight = null,

    // CMAssist class
    CMAssist = null,
    // Highlight options, see CMAssist.getHighlight
    CMAssistHighlightOptions = {}
  }) {
    this.options = {
      html,
      xhtmlOut,
      breaks,
      langPrefix,
      linkify,
      typographer,
      quotes,
      highlight
    }

    this.instance = MarkdownIt(this.options)
      .use(pluginTocAndAnchor, {
        anchorClassName: 'anchor',
        anchorLinkSymbol: ''
      })
      .use(pluginFootnote)
      .use(pluginCheckbox)
      .use(pluginEmoji)
      .use(pluginMark)
      .use(pluginSub)
      .use(pluginSup)
      .use(pluginAbbr)
      .use(pluginDeflist)
      .use(pluginContainer)
      .use(pluginIns)

    this.instance.renderer.rules.paragraph_open =
      this.instance.renderer.rules.heading_open =
        injectLineNumbers

    this.CMAssist = CMAssist
    this.CMAssistHighlightOptions = CMAssistHighlightOptions
  }

  tes(theme) {
    const hasCMAssist = null != this.CMAssist

    // Highlight using CMAssist
    if (null == this.options.highlight && hasCMAssist) {
      const that = this
      const highlight = (code, lang) => {
        lang = lang || 'text'
        const highlightOptions = Object.assign({}, that.CMAssistHighlightOptions, {
          input: code, mode: lang, theme, inputIsElement: false
        })

        console.info(code, `lang: ${lang}, theme: ${theme} 111`)
        const res = that.CMAssist.getHighlight(highlightOptions)
        console.info(res, `lang: ${lang}, theme: ${theme} 222`)
        return res
      }

      for (let elem of nodes.values()) {
        const codeInfo = pi.deepUnsign(elem.dataset.code)

        const highlightOptions = Object.assign({}, this.CMAssistHighlightOptions, {
          input: codeInfo.code, mode: codeInfo.lang, theme, inputIsElement: false
        })

        const res = this.CMAssist.getHighlight(highlightOptions)
        elem.innerHTML = res
      }

      this.instance.set({highlight})
    }
  }

  [features](method, {input, env = {}, theme}) {
    const hasCMAssist = null != this.CMAssist

    // Highlight using CMAssist
    if (null == this.options.highlight && hasCMAssist) {
      const highlight = (code, lang) => {
        lang = lang || 'text'
        const codeInfo = pi.sign({lang, code, theme})
        return `<pre class="mirror-hl" data-code="${codeInfo}"><code>${code}</code></pre>`
      }

      this.instance.set({highlight})
    }

    let result = this.instance[method](input, env)
    return `<article class="markdown-body">${result}</article>`
  }

  render({input, env = {}, theme}) {
    return this[features]('render', {input, env, theme})
  }

  renderInline({input, env = {}, theme}) {
    return this[features]('renderInline', {input, env, theme})
  }

  static containerStyle(styles = '.warning { background-color: #eaea83; padding: 12px; border-radius: 6px;}') {
    pi.addStyle(styles, 'container-warning')
  }

}

export default MarkdownAssist
