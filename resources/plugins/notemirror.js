'use strict'

import { CMAssist } from '~/plugins/codingmirror'

import 'codemirror/addon/display/rulers'
import 'codemirror/addon/edit/trailingspace'

import 'codemirror/addon/lint/coffeescript-lint'
import 'codemirror/addon/lint/css-lint'
import 'codemirror/addon/lint/html-lint'
import 'codemirror/addon/lint/javascript-lint'
import 'codemirror/addon/lint/json-lint'
import 'codemirror/addon/lint/lint.css'
import 'codemirror/addon/lint/lint'
import 'codemirror/addon/lint/yaml-lint'

import 'codemirror/keymap/vim'

import NMAssist from '../utils/NMAssist'
export { NMAssist, CMAssist }
