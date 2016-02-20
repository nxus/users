/* 
* @Author: mike
* @Date:   2015-12-14 07:52:50
* @Last Modified 2016-02-20
* @Last Modified time: 2016-02-20 13:14:32
*/

'use strict';

import UserModel from './models/userModel'
import TeamModel from './models/teamModel'

import APIController from './controllers/apiController'

import authMiddleware from './middleware/authMiddleware'
import ensureAuthenticated from './middleware/ensureAuthenticated'
import ensureAdmin from './middleware/ensureAdmin'
import sessionMiddleware from './middleware/sessionMiddleware'

import createAdminIfNone from './tasks/createAdminIfNone'

/**
 * The Users Module provides a complete user authentication and authorization system.
 * 
 */
export default class Users {
  constructor(app) {
    this.app = app
    this.controllers = {}
    this.tasks = {}
    this.middleware = {}

    this.protectedRoutes = []
    this.adminRoutes = []

    app.get('users').use(this).gather('protectedRoute').gather('ensureAdmin')

    app.get('storage').model(UserModel)
    app.get('storage').model(TeamModel)

    app.get('metrics').capture('user')
    
    app.get('templater').template('user-login', 'ejs', __dirname+"/../views/login.ejs")
    app.get('templater').template('user-profile', 'ejs', __dirname+"/../views/profile.ejs")
    app.get('templater').template('user-forgot-email', 'ejs', __dirname+"/../views/forgot-email.ejs")
    app.get('templater').template('user-forgot-password', 'ejs', __dirname+"/../views/forgot-password.ejs")
    app.get('templater').template('user-welcome-email', 'ejs', __dirname+"/../views/welcome-email.ejs")

    app.get('admin-ui').adminModel(__dirname+'/controllers/adminController.js')

    app.get('templater').provideAfter('template', 'admin-user-form', 'ejs', __dirname+"/../views/users/form.ejs")

    this.controllers.api = new APIController(app)

    this.middleware.session = sessionMiddleware(this, app)
    this.middleware.auth = authMiddleware(this, app)
    this.middleware.ensureAuthenticated = ensureAuthenticated(this, app)
    this.middleware.ensureAdmin = ensureAdmin(this, app)
    
    this.tasks.createAdminIfNone = createAdminIfNone(app)

    app.get('storage').on('model.create.user', this._sendWelcomeEmail.bind(this))
  }

  _sendWelcomeEmail(user) {
    this.app.log.debug('Sending welcome email to', user.email)
    var link = "http://"+this.app.config.baseUrl+"/login"
    this.app.get('templater').render('user-welcome-email', {user, link, siteName: this.app.config.siteName}).then((content) => {
      let fromEmail = (this.app.config.users && this.app.config.users.forgotPasswordEmail) ? this.app.config.users.forgotPasswordEmail : "noreply@"+((this.app.config.mailer && this.app.config.mailer.emailDomain) || this.app.config.baseUrl) 
      return this.app.get('mailer').send(user.email, fromEmail, "Welcome to "+this.app.config.siteName, content)
    })
  }

  protectedRoute(route) {
    this.protectedRoutes.push(route);
  }

  ensureAdmin(route) {
    this.adminRoutes.push(route);
  }
}

