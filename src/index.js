/* 
* @Author: mike
* @Date:   2015-12-14 07:52:50
* @Last Modified 2015-12-16
* @Last Modified time: 2015-12-16 06:46:59
*/

'use strict';

import UserModel from './models/userModel'
import TeamModel from './models/teamModel'

import APIController from './controllers/apiController'

import authMiddleware from './middleware/authMiddleware'
import ensureAuthenticated from './middleware/ensureAuthenticated'
import sessionMiddleware from './middleware/sessionMiddleware'

import createAdminIfNone from './tasks/createAdminIfNone'

export default class Users {
  constructor(app) {
    this.app = app
    this.controllers = {}
    this.tasks = {}
    this.middleware = {}

    this.protectedRoutes = []

    app.get('users').gather('protectedRoute', this._saveProtectedRoute.bind(this))

    app.get('storage').provide('model', UserModel)
    app.get('storage').provide('model', TeamModel)
    app.get('templater').provide('template', 'user-login', 'ejs', __dirname+"/../views/login.ejs")

    this.controllers.api = new APIController(this, app)

    this.middleware.session = sessionMiddleware(this, app)
    this.middleware.auth = authMiddleware(this, app)
    this.middleware.ensureAuthenticated = ensureAuthenticated(this, app)
    
    this.tasks.createAdminIfNone = createAdminIfNone(app)
  }

  _saveProtectedRoute(route) {
    this.protectedRoutes.push(route);
  }
}

