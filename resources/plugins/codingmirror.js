'use strict'

import Vue from 'vue'

import CodeMirror from 'codemirror/lib/codemirror'
import 'codemirror/lib/codemirror.css'

import 'codemirror/addon/comment/comment'
import 'codemirror/addon/comment/continuecomment'
import 'codemirror/addon/dialog/dialog.css'
import 'codemirror/addon/dialog/dialog'

import 'codemirror/addon/display/autorefresh'
import 'codemirror/addon/display/fullscreen.css'
import 'codemirror/addon/display/fullscreen'
import 'codemirror/addon/display/panel'
import 'codemirror/addon/display/placeholder'

import 'codemirror/addon/edit/closebrackets'
import 'codemirror/addon/edit/closetag'
import 'codemirror/addon/edit/continuelist'
import 'codemirror/addon/edit/matchbrackets'
import 'codemirror/addon/edit/matchtags'

import 'codemirror/addon/fold/brace-fold'
import 'codemirror/addon/fold/comment-fold'
import 'codemirror/addon/fold/foldcode'
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/fold/foldgutter'
import 'codemirror/addon/fold/indent-fold'
import 'codemirror/addon/fold/markdown-fold'
import 'codemirror/addon/fold/xml-fold'

import 'codemirror/addon/hint/anyword-hint'
import 'codemirror/addon/hint/css-hint'
import 'codemirror/addon/hint/html-hint'
import 'codemirror/addon/hint/javascript-hint'
import 'codemirror/addon/hint/show-hint.css'
import 'codemirror/addon/hint/show-hint'
import 'codemirror/addon/hint/sql-hint'
import 'codemirror/addon/hint/xml-hint'

import 'codemirror/addon/runmode/runmode'
import 'codemirror/addon/scroll/annotatescrollbar'

import 'codemirror/addon/search/jump-to-line'
import 'codemirror/addon/search/match-highlighter'
import 'codemirror/addon/search/matchesonscrollbar.css'
import 'codemirror/addon/search/matchesonscrollbar'
import 'codemirror/addon/search/search'
import 'codemirror/addon/search/searchcursor'

import 'codemirror/addon/selection/active-line'
import 'codemirror/addon/selection/mark-selection'
import 'codemirror/addon/selection/selection-pointer'

import 'codemirror/addon/wrap/hardwrap'

import 'codemirror/mode/meta'
import 'codemirror/mode/javascript/javascript'

// Cannot read property 'attach' of undefined. https://github.com/surmon-china/vue-codemirror/issues/33
import 'codemirror/keymap/sublime'

import VueCodemirror from 'vue-codemirror'
Vue.use(VueCodemirror)

global.CodeMirror = CodeMirror

/**
  if (process.browser) {
    const {CMAssist} = require('~/plugins/codingmirror.js')
  }

   <no-ssr placeholder="Codemirror Loading...">
     <codemirror v-model="code"
         :options="mirrorOptions"
         @cursorActivity="onMirrorCursorActivity"
         @ready="onMirrorReady"
         @focus="onMirrorFocus"
         @blur="onMirrorBlur">
     </codemirror>
   </no-ssr>
 */
import CMAssist from '../utils/CMAssist'
export { CMAssist }
