'use strict'

const Factory = use('Factory')

Factory.blueprint('Adonis/Acl/Role', (faker, index, data) => {
  const defaultValue = {
    slug: 'administrator',
    name: 'Administrator',
    description: ''
  }

  return Object.assign(defaultValue, data)
})

Factory.blueprint('App/Models/User', (faker, index, data) => {
  const defaultValue = {
    username: faker.username(),
    email: faker.email(),
    password: 'secret',
    gender: 1,
    status: 1,
    enabled: false,
    credentials_expired: false,
    expired: false,
    locked: false
  }

  return Object.assign(defaultValue, data)
})
