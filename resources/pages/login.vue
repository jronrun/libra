<template>
  <v-app id="login" class="primary">
    <v-content>
      <v-container fluid fill-height>
        <v-layout align-center justify-center>
          <v-flex xs12 sm8 md4 lg4>
            <v-card class="elevation-12 pa-3">
              <v-card-text>
                <div class="layout column align-center">
                  <img src="/logo.png" alt="Vue Material Admin" width="240" height="60">
                  <!--<h1 class="flex my-4 primary&#45;&#45;text">&nbsp;</h1>-->
                  <h1>&nbsp;</h1>
                </div>
                <v-form>
                  <v-text-field append-icon="person" name="login" label="Login" type="text" v-model="model.username">
                  </v-text-field>
                  <v-text-field append-icon="lock" name="password" label="Password" id="password" type="password" v-model="model.password">
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
  export default {
    layout: 'blank',
    data: () => ({
      loading: false,
      model: {
        username: '',
        password: ''
      }
    }),

    head () {
      return {
        title: 'Libra Login',
        meta: [
          { hid: 'description', name: 'description', content: 'My custom description' }
        ]
      }
    },

    methods: {
      login () {
        this.loading = true;
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
