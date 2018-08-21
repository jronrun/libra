'use strict'

const lz = use('lz-string')
const {validate} = use('Validator')

class SessionController {

  async login({request, response, auth}) {
    const message = 'Username or password is incorrect'
    const rules = {
      email: 'required|email',
      password: 'required'
    }

    const params = request.all()
    const validation = await validate(params, rules)
    if (validation.fails()) {
      return response.status(401).json({message})
    }

    const {username, password} = params
    let aPassword = lz.decompressFromEncodedURIComponent(password)

    let token
    try {
      token = await auth.attempt(username, aPassword)
    } catch (e) {
      return response.status(401).json({message})
    }

    return {
      token: lz.compressToEncodedURIComponent(JSON.stringify(token))
    }
  }

  async delete({auth, response}) {
    await auth.logout()
    return response.redirect('/')
  }
}

module.exports = SessionController
