<template>
  <v-app id="login" class="primary">
    <v-content>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4 lg4>
            <v-card class="elevation-20">
              <v-card-text>
                <div class="layout column align-center">
                  <h5>&nbsp</h5>
                  <img src="/logo.png" alt="Libra of Constellation" width="240" height="60">
                  <!--<h1 class="flex my-4 primary&#45&#45text">&nbsp</h1>-->
                  <h1>&nbsp</h1>
                </div>
                <v-form>
                  <v-text-field
                    name="email"
                    type="text"
                    v-model="account.email"
                    prepend-icon="person"
                    :label="$t('account.email')"
                    :data-vv-as="$t('account.email')"
                    v-validate="'required|email'"
                    :error-messages="errors.collect('email')"
                  ></v-text-field>
                  <v-text-field
                    name="password"
                    :type="isVisiblePassword ? 'text' : 'password'"
                    v-model="account.password"
                    :append-icon="isVisiblePassword ? 'visibility_off' : 'visibility'"
                    @click:append="isVisiblePassword = !isVisiblePassword"
                    @keyup.enter="signIn"
                    :label="$t('account.password')"
                    :data-vv-as="$t('account.password')"
                    v-validate="'required'"
                    prepend-icon="lock"
                    :error-messages="errors.collect('password')"
                  ></v-text-field>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <!--<v-btn icon>-->
                  <!--<v-icon color="blue">fa fa-facebook-square fa-lg</v-icon>-->
                <!--</v-btn>-->
                <v-spacer></v-spacer>
                <v-btn block color="primary" @click="signIn" :loading="loading">{{$t('login.submit')}}</v-btn>
              </v-card-actions>

              <v-snackbar
                v-model="notify.visible"
                color="error"
                top
                vertical
                :timeout="notify.timeout"
              >
                {{ notify.text }}
                <v-btn
                  dark
                  flat
                  @click="notify.visible = false"
                >
                  {{$t('button.close')}}
                </v-btn>
              </v-snackbar>

            </v-card>
          </v-flex>
        </v-layout>
      </v-container>
    </v-content>
  </v-app>
</template>

<script>
  import pi from '~pi'
  import { mapActions } from 'vuex'
  import validator from '~/plugins/validator'

  export default {

    layout: 'blank',
    data: () => ({
      account: {
        email: '',
        password: ''
      },
      isVisiblePassword: false,
      loading: false,
      notify: {
        visible: false,
        timeout: 6000,
        text: ''
      }
    }),

    head() {
      return {
        title: this.$t('login.title'),
        meta: [
          {hid: 'description', name: 'description', content: this.$t('login.description')}
        ]
      }
    },

    beforeMount() {
      this.$libra.restore(this, () => this.$t('login.messages'))
    },

    mounted() {
    },

    methods: {
      ...mapActions('user', [
        'login'
      ]),
      signIn() {

        this.$validator.validateAll().then((result) => {
          if (result) {
            this.loading = true

            this.login({account: this.account}).then(response => {
              this.loading = false
              this.$router.push({path: '/'})
            }).catch(({hint}) => {
              this.notify.visible = true
              this.notify.text = hint
              this.loading = false
            })
          }
        })

      }
    }

  }
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
