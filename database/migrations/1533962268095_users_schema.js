'use strict'

const Schema = use('Schema')

class UsersSchema extends Schema {
  up () {
    this.create('users', (table) => {
      table.increments()
      table.string('username').unique()
      table.string('email').unique().index()
      table.string('password', 80)
      table.smallint('gender')
      table.smallint('status')
      table.boolean('enabled')
      table.boolean('credentials_expired')
      table.boolean('expired')
      table.boolean('locked')
      table.timestamps(false, true)
    })
  }

  down () {
    this.drop('users')
  }
}

module.exports = UsersSchema
