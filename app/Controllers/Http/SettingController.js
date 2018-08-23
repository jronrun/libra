'use strict'

const {validate} = use('Validator')
const status = use('http-status')
const LOCALE_KEY = 'custom_locale'

class SettingController {

  async setLocale({request, session, antl}) {
    const availableLocales = antl.availableLocales().join(',')
    const rules = {
      locale: `required|in:${availableLocales}`
    }

    const params = request.all()
    const validation = await validate(params, rules)
    if (validation.fails()) {
      const message = antl.formatMessage('invalid.locale', params)
      return response.status(status.BAD_REQUEST).json({message})
    }

    session.put(LOCALE_KEY, params.locale)
  }

}

module.exports = SettingController
