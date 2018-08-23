'use strict'

const LOCALE_KEY = 'custom_locale'

class LocaleDetector {
  async handle({request, session, antl}, next) {
    let manualLocale = request.header(LOCALE_KEY)
    if (!manualLocale) {
      manualLocale = session.get(LOCALE_KEY)
    }

    if (manualLocale && antl.availableLocales().includes(manualLocale)) {
      antl.forLocale(manualLocale)
    }

    await next()
  }
}

module.exports = LocaleDetector
