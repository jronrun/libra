'use strict'

/*
|--------------------------------------------------------------------------
| Routes
|--------------------------------------------------------------------------
|
| Http routes are entry points to your web application. You can create
| routes for different URL's and bind Controller actions to them.
|
| A complete guide on routing is available here.
| http://adonisjs.com/guides/routing
|
*/

const Route = use('Route')

Route.group(() => {
  Route.post('locale', 'SettingController.setLocale')

}).prefix('settings')

Route.group(() => {
  Route.post('login', 'SessionController.login')

}).middleware(['guest'])

Route.group(() => {
  Route.get('logout', 'SessionController.delete')

}).middleware(['auth'])

Route.any('*', 'NuxtController.render')
