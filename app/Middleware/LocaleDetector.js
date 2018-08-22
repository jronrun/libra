'use strict'

class LocaleDetector {
  async handle ({ request, session, antl }, next) {
    //request.request.headers['aa']=11
    let manualLocale = request.header('custom-locale')
    if (manualLocale) {
      antl.forLocale(manualLocale)
    }

    await next()
  }
}

module.exports = LocaleDetector
