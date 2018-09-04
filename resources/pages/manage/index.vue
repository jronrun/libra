<template>
  <section class="container">
    <no-ssr placeholder="Codemirror Loading...">
      <codemirror v-model="code"
                  :options="cmOption"
                  @cursorActivity="onCmCursorActivity"
                  @ready="onCmReady"
                  @focus="onCmFocus"
                  @blur="onCmBlur">
      </codemirror>
    </no-ssr>
  </section>
</template>

<script>
  let NMAssist
  if (process.browser) {
    ({NMAssist} = require('~/plugins/notemirror'))
  }

  export default {
    layout: 'manage',
    data() {
      const code =
        `test`
      return {
        code,
        cmOption: null
      }
    },
    beforeMount() {
      this.cmOption = NMAssist.getMirrorOptions()
    },
    mounted() {
      console.log('manage/index mounted')
    },
    methods: {
      onCmCursorActivity(codemirror) {
        console.log('onCmCursorActivity', codemirror)
      },
      onCmReady(codemirror) {
        global.inst = new NMAssist(codemirror)
      },
      onCmFocus(codemirror) {
        console.log('onCmFocus', codemirror)
      },
      onCmBlur(codemirror) {
        console.log('onCmBlur', codemirror)
      }
    }
  }
</script>

<style>
  .container {
    width: 60%;
    margin: 0 auto;
    padding: 50px 0;
    text-align: left;
  }
</style>
