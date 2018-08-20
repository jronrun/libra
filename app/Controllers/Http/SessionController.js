'use strict'

const lz = use('lz-string')
const { validate } = use('Validator')


class SessionController {

  async login({ request, response, auth }) {
    const { username, password } = request.all()
    let aPassword = lz.decompressFromEncodedURIComponent(password)

    let token
    try {
      token = await auth.attempt(username, aPassword)
    } catch (e) {
      return response.status(401).json({
        message: 'Username or password is incorrect'
      })
    }

    return {
      token: lz.compressToEncodedURIComponent(JSON.stringify(token))
    }
  }

  async delete ({ auth, response }) {
    await auth.logout()
    return response.redirect('/')
  }
}

module.exports = SessionController
