'use strict'

class RedirectIfAuthenticated {
  async handle ({ auth, request, response }, next) {
    /**
     * Verify if we are logged in.
     * ref: https://adonisjs.com/docs/4.1/authentication#_check
     */
    try {
      await auth.check()

      return response.redirect('/')
    } catch (e) {}

    await next()

  }
}

module.exports = RedirectIfAuthenticated
