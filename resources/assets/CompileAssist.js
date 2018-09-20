'use strict'

import pi from '~pi'

let markdownAssist
let loadingMarkdownAssist = false
const COMPILES = []

const register = ({key = [], handle = async (input, {modeName, theme}) => {}, order = 100}) => {
  COMPILES.push({key, handle, order})
}

register({
  order: 10,
  match: (input) => pi.isURL(input),
  key: ['URL'],
  /**
   * URL handle
   * @param input
   * @param modeName
   * @param theme
   * @param render  an instance of IFrameAssist
   * @returns {Promise<*>}
   */
  handle: async (input, {modeName, theme, render}) => {
    if (render && pi.isFunction(render.openUrl)) {
      render.openUrl(input)
    }

    return input
  }
})

register({
  order: 20,
  match: (input) => pi.isJSON(input),
  key: ['JSON', 'JSON-LD'],
  /**
   * JSON, JSON-LD handle
   * @param input
   * @param modeName
   * @param theme
   * @param replacer  A function that transforms the results.
   * @param space     Adds indentation, white space, and line break characters to
   * the return-value JSON text to make it easier to read.
   * @returns {Promise<*>}
   */
  handle: async (input, {modeName, theme, replacer = false, space = 2}) => {
    return JSON.stringify(input, replacer, space)
  }
})

register({
  key: ['HTML'],
  /**
   * HTML handle
   * @param input
   * @param modeName
   * @param theme
   * @param render  an instance of IFrameAssist
   * @returns {Promise<*>}
   */
  handle: async (input, {modeName, theme, render}) => {
    if (render && pi.isFunction(render.write)) {
      render.write(input)
    }

    return input
  }
})

register({
  key: ['Markdown', 'GitHub Flavored Markdown'],
  /**
   * Markdown handle
   * @param input
   * @param modeName
   * @param theme
   * @param markdownOptions   see MarkdownAssist
   * @returns {Promise<void>}
   */
  handle: async (input, {modeName, theme, markdownOptions = {}}) => {
    if (loadingMarkdownAssist) {
      return
    }

    if (!markdownAssist) {
      loadingMarkdownAssist = true
      // https://www.zcfy.cc/article/es-proposal-import-2352.html
      const loaded = await import('~/assets/MarkdownAssist')
      markdownAssist = new loaded.default(markdownOptions)
      loadingMarkdownAssist = false
    }

    return await markdownAssist.render({input, theme})
  }
})

const getCompiler = (modeName, input) => {
  COMPILES.sort((left, right) => left.order > right.order)

  // for (let [index, elem] of COMPILES.entries())
  for (let elem of COMPILES.values()) {
    if ((pi.isFunction(elem.match) && elem.match(input))
      || elem.key.includes(modeName)) {
      return elem
    }
  }

  return null
}

class CompileAssist {

  constructor(options = {}) {
    this.options = options
  }

  /**
   * Compile
   * @param input
   * @param modeName
   * @param theme
   * @param render
   * @param replacer
   * @param space
   * @param markdownOptions
   */
  compile({input, modeName, theme}, {
    render,         // For 'HTML', 'URL'; An instance of IFrameAssist
    markdownOptions,  // For 'Markdown', 'GitHub Flavored Markdown'; see MarkdownAssist

    replacer,       // For 'JSON', 'JSON-LD'; A function that transforms the results.
    space,          // For 'JSON', 'JSON-LD'; Adds indentation, white space, and line break characters to
  } = {}) {
    const compiler = getCompiler(modeName, input)
    if (null == compiler) {
      throw new Error(`There is none registered compiler for ${modeName}, use CompileAssist.register to support`)
    }

    return compiler.handle.bind(this)(input, {
      modeName,
      theme,
      render,
      replacer,
      space,
      markdownOptions
    })
  }

  /**
   * Register Compiler
   * @param key       modeName info name (CMAssist.langInfo)
   * @param handle    this point to CompileAssist instance
   * @param order
   * @param match     custom matcher, match > key
   * @see codemirror/mode/meta.js
   */
  static register({
    key = [],
    handle = async (input, {modeName, theme}) => {},
    order = 100,
    match = (input) => {}
  }) {
    register(key, handle, order)
  }

}

export default CompileAssist
