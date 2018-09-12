'use strict'

import { CMAssist } from '~/plugins/codingmirror'

import 'codemirror/addon/merge/merge.css'
import 'codemirror/addon/merge/merge'

// Google DiffMaGtchPatch
import DiffMatchPatch from 'diff-match-patch'

// DiffMatchPatch config with global
global.diff_match_patch = DiffMatchPatch
global.DIFF_DELETE = -1
global.DIFF_INSERT = 1
global.DIFF_EQUAL = 0

import MVAssist from '../assets/MVAssist'

export { MVAssist, CMAssist }
