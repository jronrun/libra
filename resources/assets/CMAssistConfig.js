'use strict'

import CMAssist, { highlights } from './CMAssist'

CMAssist.setMirrorBase({
  // theMirrorBasePath: 'https://cdn.bootcss.com/codemirror/5.38.0',
  theMirrorBasePath: 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.40.0',
  theThirdThemePath: '/mirror/theme'
})

export { highlights }
export default CMAssist
