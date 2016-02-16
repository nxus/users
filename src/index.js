/* 
* @Author: mike
* @Date:   2015-12-14 07:52:50
* @Last Modified 2016-02-15
* @Last Modified time: 2016-02-15 17:59:28
*/

'use strict';

import UserModel from './models/userModel'
import TeamModel from './models/teamModel'

import APIController from './controllers/apiController'

import authMiddleware from './middleware/authMiddleware'
import ensureAuthenticated from './middleware/ensureAuthenticated'
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

    app.get('users').use(this).gather('protectedRoute')

    app.get('storage').model(UserModel)
    app.get('storage').model(TeamModel)

    app.get('metrics').capture('user')
    
    app.get('templater').template('user-login', 'ejs', __dirname+"/../views/login.ejs")
    app.get('templater').template('user-profile', 'ejs', __dirname+"/../views/profile.ejs")
    app.get('templater').template('user-forgot-email', 'ejs', __dirname+"/../views/forgot-email.ejs")

    app.get('admin-ui').adminModel("user", {
        iconClass: 'fa fa-users',
        ignore: [
            'id',
            'objectId', 
            'updatedAt', 
            'position', 
            'salt', 
            'passwordHash', 
            'verifyToken', 
            'resetPasswordToken', 
            'resetPasswordExpires', 
            'verified', 
            'role', 
            'team', 
            'lastLogIn',
            'metadata'
        ],
        save: this.saveUser
    })

    app.get('templater').provideAfter('template', 'admin-user-form', 'ejs', __dirname+"/../views/users/form.ejs")

    this.controllers.api = new APIController(app)

    this.middleware.session = sessionMiddleware(this, app)
    this.middleware.auth = authMiddleware(this, app)
    this.middleware.ensureAuthenticated = ensureAuthenticated(this, app)
    
    this.tasks.createAdminIfNone = createAdminIfNone(app)
  }

  saveUser (req, res, s) {
        let user = req.body
        user.enabled = true
        if(!user.admin)
          user.admin = false
        if(user.id == "")
          delete user.id
        if(!user.password || (user.password && user.password == ""))
          delete user.password
        console.log('user', user)
        s._save(req, res, user)
    }

  protectedRoute(route) {
    this.protectedRoutes.push(route);
  }
}

