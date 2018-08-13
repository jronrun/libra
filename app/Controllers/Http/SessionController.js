'use strict'

class SessionController {

  async login({ request, auth }) {
    const { email, password } = request.all()
    let token = await auth.attempt(email, password)

    console.log(token)
    return 'Logged in successfully'
  }

  async delete ({ auth, response }) {
    await auth.logout()
    return response.redirect('/')
  }
}

module.exports = SessionController
