'use strict'

const lz = use('lz-string')
const {validate} = use('Validator')

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

    session.put('token', token)
    return {}
  }

  async delete({auth, response}) {
    await auth.logout()
    return response.redirect('/')
  }
}

module.exports = SessionController
