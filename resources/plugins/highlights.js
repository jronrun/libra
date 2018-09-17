'use strict'

import CodeMirror from 'codemirror/lib/codemirror'
import 'codemirror/lib/codemirror.css'

import 'codemirror/addon/runmode/runmode'

global.CodeMirror = CodeMirror

import CMAssist, { highlights } from '../assets/CMAssistConfig'
export { CMAssist, highlights }
