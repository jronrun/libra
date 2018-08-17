<template>
  <v-app id="login" class="primary">
    <v-content>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4 lg4>
            <v-card class="elevation-20">
              <v-card-text>
                <div class="layout column align-center">
                  <h5>&nbsp;</h5>
                  <img src="/logo.png" alt="Libra of Constellation" width="240" height="60">
                  <!--<h1 class="flex my-4 primary&#45;&#45;text">&nbsp;</h1>-->
                  <h1>&nbsp;</h1>
                </div>
                <v-form>
                  <v-text-field prepend-icon="person"
                                label="E-mail"
                                type="text"
                                name="email"
                                v-validate="'required|email'"
                                :error-messages="errors.collect('email')"
                                data-vv-as="邮箱地址"
                  ></v-text-field>
                  <p>{{ $t('about.introduction') }}</p>
                  <v-text-field
                    :append-icon="isVisiblePassword ? 'visibility_off' : 'visibility'"
                    :type="isVisiblePassword ? 'text' : 'password'"
                    @click:append="isVisiblePassword = !isVisiblePassword"
                    prepend-icon="lock" name="password" label="Password">
                  </v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-btn icon>
                  <v-icon color="blue">fa fa-facebook-square fa-lg</v-icon>
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn block color="primary" @click="login" :loading="loading">Login</v-btn>
              </v-card-actions>
            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  import pi from '~pi'
  import validator from '~/plugins/validator'

  export default {

    layout: 'blank',
    data: () => ({
      email: '',

      isVisiblePassword: false,
      loading: false
    }),

    head() {
      return {
        title: 'Login - Libra',
        meta: [
          {hid: 'description', name: 'description', content: 'My custom description'}
        ]
      }
    },

    methods: {
      login() {
        // if (this.isVisiblePassword) {
        //   this.$store.commit('SET_LANG', 'en')
        // } else {
        //   this.$store.commit('SET_LANG', 'zh')
        // }
        // this.$i18n.locale = this.$store.state.locale

        this.$i18n.change(this.isVisiblePassword ? 'en' : 'zh_CN')

        this.$validator.validateAll().then((result, a) => {
          if (result) { // eslint-disable-next-line
            this.loading = true
            console.log('From Submitted!');
            return;
          }
          console.log('Correct them errors!');
        });
      }
    }

  };
</script>
<style scoped lang="css">
  #login {
    height: 50%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    content: "";
    z-index: 0;
  }
</style>
