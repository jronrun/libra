'use strict'

import CodeMirror from 'codemirror/lib/codemirror'
import 'codemirror/lib/codemirror.css'

import 'codemirror/addon/runmode/runmode'

import 'codemirror/mode/meta'

global.CodeMirror = CodeMirror

import CMAssist, { highlights } from '../assets/CMAssist'
import CMAssistConfig from '../assets/CMAssistConfig'
CMAssistConfig(CMAssist)

export { CMAssist, highlights }
