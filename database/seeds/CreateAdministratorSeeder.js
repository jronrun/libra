'use strict'

const Env = use('Env')

/*
|--------------------------------------------------------------------------
| CreateAdministratorSeeder
|--------------------------------------------------------------------------
|
| Make use of the Factory instance to seed database with dummy data or
| make use of Lucid models directly.
|
*/

const Factory = use('Factory')

class CreateAdministratorSeeder {
  async run () {
    const role = await Factory.model('Adonis/Acl/Role').create()
    const user = await Factory.model('App/Models/User').create({
      username: Env.get('ADMIN_USERNAME', 'administrator'),
      email: Env.get('ADMIN_EMAIL', 'admin@test.com'),
      password: Env.get('ADMIN_PASSWORD', 'admin_secret'),
    })

    await user.roles().attach([role.id])
  }
}

module.exports = CreateAdministratorSeeder
