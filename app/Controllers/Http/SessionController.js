'use strict'

const lz = use('lz-string')
const {validate} = use('Validator')
const status = use('http-status')
const TOKEN_KEY = 'token'

class SessionController {

  async login({request, response, session, auth, locale, antl}) {
    const message = antl.formatMessage('invalid.credentials')
    const rules = {
      username: 'required|email',
      password: 'required'
    }

    const params = request.all()
    const validation = await validate(params, rules)
    if (validation.fails()) {
      return response.status(status.UNAUTHORIZED).json({message})
    }

    const {username, password} = params
    let aPassword = lz.decompressFromEncodedURIComponent(password)

    let token
    try {
      token = await auth.attempt(username, aPassword)
    } catch (e) {
      return response.status(status.UNAUTHORIZED).json({message})
    }

    session.put(TOKEN_KEY, token)
    return {}
  }

  async delete({auth, session, response}) {
    session.forget(TOKEN_KEY)
    return response.redirect('/')
  }
}

module.exports = SessionController
