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
const anchorLinkSymbol = '<svg class="octicon octicon-link" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M4 9h1v1H4c-1.5 0-3-1.69-3-3.5S2.55 3 4 3h4c1.45 0 3 1.69 3 3.5 0 1.41-.91 2.72-2 3.25V8.59c.58-.45 1-1.27 1-2.09C10 5.22 8.98 4 8 4H4c-.98 0-2 1.22-2 2.5S3 9 4 9zm9-3h-1v1h1c1 0 2 1.22 2 2.5S13.98 12 13 12H9c-.98 0-2-1.22-2-2.5 0-.83.42-1.64 1-2.09V6.25c-1.09.53-2 1.84-2 3.25C6 11.31 7.55 13 9 13h4c1.45 0 3-1.69 3-3.5S14.5 6 13 6z"></path></svg>'

// https://markdown-it.github.io/
// Inject line numbers for sync scroll. Notes:
//
// - We track only headings and paragraphs on first level. That's enough.
// - Footnotes content causes jumps. Level limit filter it automatically.
const injectLineNumbers = (tokens, idx, options, env, slf) => {
  let line
  const token = tokens[idx]
  if (token.map && token.level === 0) {
    line = token.map[0]
    token.attrJoin('class', 'line')
    token.attrSet('data-line', line)
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
    CMAssistHighlightOptions = {},
    // Render
    template = (result) => `<article class="markdown-body" style="padding: 2.3rem;">${result}</article>`,
    style = '.warning { background-color: #eaea83; padding: 12px; border-radius: 6px;}'
  }) {
    this.isCMAssistHighlight = null == highlight && null != CMAssist

    // Highlight using CMAssist
    if (this.isCMAssistHighlight) {
      highlight = (code, lang) => {
        lang = lang || 'text'
        const codeInfo = pi.sign({lang, code})
        return `<pre class="mirror-hl" data-code="${codeInfo}">${code}</pre>`
      }
    }

    this.options = {
      html,
      xhtmlOut,
      breaks,
      langPrefix,
      linkify,
      typographer,
      quotes,
      highlight,
      template
    }

    this.instance = MarkdownIt(this.options)

    this.instance.renderer.rules.paragraph_open =
      this.instance.renderer.rules.heading_open =
        injectLineNumbers

    this.instance
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
      .use(pluginContainer, 'warning')
      .use(pluginIns)

    this.CMAssist = CMAssist
    this.CMAssistHighlightOptions = CMAssistHighlightOptions

    pi.addStyle(style, 'md-custom-style')
  }

  async [features](method, {input, env = {}, theme}) {
    let result = this.instance[method](input, env)

    if (pi.isFunction(this.options.template)) {
      result = this.options.template(result)
    }

    if (this.isCMAssistHighlight) {
      const hlId = pi.uniqueId('md-hl-')
      let div = document.createElement('div')
      div.setAttribute('id', hlId)
      div.setAttribute('style', 'display:none;')
      div.innerHTML = result
      pi.query('body').appendChild(div)

      const anchors = pi.querySelector(`#${hlId} a.anchor`, true)
      for (let elem of anchors.values()) {
        elem.innerHTML = anchorLinkSymbol
      }

      const hlEls = pi.querySelector(`#${hlId} pre.mirror-hl`, true)
      for (let elem of hlEls.values()) {
        const codeInfo = pi.deepUnsign(elem.dataset.code)

        const highlightOptions = Object.assign({}, this.CMAssistHighlightOptions, {
          input: codeInfo.code, mode: codeInfo.lang, theme, inputIsElement: false
        })

        const res = await this.CMAssist.getHighlight(highlightOptions)
        pi.replaceHTML(elem, res)
      }

      const tmpEl = pi.querySelector(`#${hlId}`)
      result = tmpEl.innerHTML
      tmpEl.remove()
    }

    return result
  }

  async render({input, env = {}, theme}) {
    return await this[features]('render', {input, env, theme})
  }

  async renderInline({input, env = {}, theme}) {
    return await this[features]('renderInline', {input, env, theme})
  }

}

export default MarkdownAssist
