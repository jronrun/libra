'use strict'

const AUTHORIZATION_KEY = 'authorization'

class SessionAuthDetector {
  async handle ({ request, session }, next) {
    let token = request.header(AUTHORIZATION_KEY)

    if (!token) {
      let credentials = session.get('token')
      if (credentials) {
        request.request.headers[AUTHORIZATION_KEY] = `${credentials.type} ${credentials.token}`
      }
    }

    await next()
  }
}

module.exports = SessionAuthDetector
