'use strict'

import pi from '~pi'
import JSON5s from './JSON5s'

const beautifies = [
  {
    key: ['sql'],
    beautify: (source, step) => {
      return vkbeautify.sql(source, step)
    }
  },
  {
    key: ['xml'],
    beautify: (source, step) => {
      return vkbeautify.xml(source, step)
    }
  },
  {
    key: ['css'],
    beautify: (source, options) => {
      return css_beautify(source, options)
    }
  },
  {
    key: ['htmlembedded', 'htmlmixed'],
    beautify: (source, options) => {
      return html_beautify(source, options)
    }
  },

  {
    type: 'name',
    key: ['JSON', 'JSON-LD'],
    beautify: (source, space = 2) => {
      return JSON5s.stringify(source, false, space)
    }
  },
  {
    type: 'name',
    key: ['JavaScript', 'Embedded Javascript', 'TypeScript'],
    beautify: (source, options) => {
      return js_beautify(source, options)
    }
  }
]

class Beauties {

}

export default Beauties
