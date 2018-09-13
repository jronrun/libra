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

import './css/markdown.styl'

const features = Symbol('features')

const defaultOptions = {
  html:         true,         // Enable HTML tags in source
  xhtmlOut:     false,        // Use '/' to close single tags (<br />).
                              // This is only for full CommonMark compatibility.
  breaks:       false,        // Convert '\n' in paragraphs into <br>
  langPrefix:   'language-',  // CSS language prefix for fenced blocks. Can be
                              // useful for external highlighters.
  linkify:      true,         // Autoconvert URL-like text to links

  // Enable some language-neutral replacement + quotes beautification
  typographer:  true,

  // Double + single quotes replacement pairs, when typographer enabled,
  // and smartquotes on. Could be either a String or an Array.
  //
  // For example, you can use '«»„“' for Russian, '„“‚‘' for German,
  // and ['«\xA0', '\xA0»', '‹\xA0', '\xA0›'] for French (including nbsp).
  quotes: '“”‘’',

  // Highlighter function. Should return escaped HTML,
  // or '' if the source string is not changed and should be escaped externaly.
  // If result starts with <pre... internal wrapper is skipped.
  //highlight(/*str, lang*/) { return '' }
  highlight: null
}

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

// const features11 = (method, src, env, theme, callback) => {
//   var hasMirror = !pi.isBlank(options.mirror), hasOutput = null != options.output && $(options.output).length;
//   if (hasOutput) {
//     $(options.output).hide();
//   }
//
//   //highlight using codemirror
//   if (null == inst.options.highlight && hasMirror) {
//     inst.options.highlight = function (code, lang) {
//       var theTmpl = '<pre class="mirror-hl" data-lang="<%= pi.sign(lang) %>" data-code="<%= pi.sign(code)%>"><code><%=code %></code></pre>';
//       return tmpl(theTmpl, {
//         lang: lang || 'text',
//         code: inst.utils.escapeHtml(code)
//       });
//     }
//   }
//
//   var markedHtml = inst[method](src, env), tmpId = 'tmp-mdit-' + pi.uniqueId(),
//     inRoot = function (subSelector) {
//       return tmpId + ' ' + subSelector;
//     };
//
//   $('<div>').attr({ id: tmpId}).css({ display: 'none'}).appendTo('body');
//   $(tmpId = sel(tmpId)).html([
//     '<article class="markdown-body">',
//     markedHtml,
//     '</article>'
//   ].join('\n'));
//
//   var featuresLast = function () {
//     $(inRoot('a.anchor')).html(anchorLinkSymbol);
//     $(inRoot('blockquote')).css({
//       margin: '0 0 1rem'
//     });
//     $(inRoot('table')).addClass('table table-hover table-sm');
//     $(inRoot('input[type="checkbox"]')).attr({disabled: true}).addClass('disabled');
//
//     var resultH = $(tmpId).html();
//     $(tmpId).remove();
//
//     if (hasOutput) {
//       $(options.output).html(resultH).fadeIn(1000);
//     }
//
//     $.isFunction(callback) && callback(resultH);
//   };
//
//   if (hasMirror) {
//     var mirrorHls = $(inRoot('pre.mirror-hl')), hCount = mirrorHls.length;
//     if (hCount > 0) {
//       mirrorHls.each(function () {
//         var info = pi.data(this), thiz = this, langInfo = (options.mirror.modeInfo(info.lang) || {});
//
//         options.mirror.highlights({
//           input: pi.unescape(info.code),
//           mode: langInfo.mime || langInfo.mode || 'text',
//           theme: theme || 'lemon',
//           style: {
//             height: '100%',
//             margin: -16,
//             padding: '1rem',
//             'font-size': 14,
//             'overflow-x': 'auto'
//           },
//           resultHandle: function (ret) {
//             $(thiz).html(ret);
//             hCount--;
//             if (0 === hCount) {
//               featuresLast();
//             }
//           }
//         });
//       });
//     } else {
//       featuresLast();
//     }
//   } else {
//     featuresLast();
//   }
//
//   return true;
// }

class MarkdownAssist {

  constructor(instanceOfCMAssist, markdownOptions = {}) {
    this.mirror = instanceOfCMAssist
    this.markdownOptions = Object.assign(defaultOptions, markdownOptions)

    this.instance = MarkdownIt(this.markdownOptions)
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

    MarkdownAssist.containerStyle()
    this.instance.renderer.rules.paragraph_open = this.instance.renderer.rules.heading_open = injectLineNumbers
  }

  [features](method, src, env, theme, callback) {
    const hasMirror = !this.mirror

    // highlight using code mirror
    if (null == this.markdownOptions.highlight && hasMirror) {
      this.markdownOptions.highlight = (code, lang = 'text') => {
        const dataLang = pi.sign(lang)
        const dataCode = pi.sign(this.instance.utils.escapeHtml(code))
        return `<pre class="mirror-hl" data-lang="${dataLang}" data-code="${dataCode}"><code>${code}</code></pre>`
      }
    }

    const markedHtml = this.instance[method](src, env)
    return markedHtml


  }

  render(src, env, theme, callback) {
    return this[features]('render', src, env, theme, callback)
  }

  renderInline(src, env, theme) {
    return this[features]('renderInline', src, env, theme, callback)
  }

  static containerStyle(styles = '.warning { background-color: #eaea83; padding: 12px; border-radius: 6px;}') {
    pi.addStyle(styles, 'container-warning')
  }

}

export default MarkdownAssist
