/* 
* @Author: mike
* @Date:   2015-12-14 07:52:50
* @Last Modified 2016-08-09
* @Last Modified time: 2016-08-09 09:20:07
*/
/**
 * [![Build Status](https://travis-ci.org/nxus/users.svg?branch=master)](https://travis-ci.org/nxus/users)
 * 
 * User management module for Nxus apps.  Users provides a complete framework for managing users, authenticating routes and sessions.
 * 
 * ## Install
 * 
 *     > npm install nxus-users --save
 * 
 * ## Quickstart
 * 
 * Once Users is installed in your app, you are ready to go.  It includes the following components:
 * 
 * -   user/team models
 * -   login/logout routes
 * -   authentication/session middleware
 * 
 * ## Models
 * 
 * Uses defines a set of common models you can use to build your application, using the @nxus/storage module (which uses Waterline to provide common ORM functionality).
 * 
 * ### User
 * 
 * Accessing the user model:
 * 
 *     storage.getModel('users_user').then((User) => {
 *       ...
 *     });
 * 
 * **Fields**
 * 
 * -   email: string
 * -   password: string
 * -   nameFirst: string
 * -   nameLast: string
 * -   position: string
 * -   enabled: boolean
 * -   admin: boolean
 * -   lastLogin: datetime
 * -   metadata: JSON
 * -   team: relation to Team model
 * 
 * **Convenience Methods**
 * 
 * -   name(): first + last name
 * -   isAdmin(): boolean if user is an Admin
 * -   validPassword(pass): returns true if the password is valid
 * 
 * ## Templates
 * 
 * Users defines a set of common templates you can use in your app
 * 
 * ### login
 * 
 * A login form preconfigured to work with the login/logout routes. Markup supports basic Bootstrap 3 CSS.
 * 
 *     templater.render('users-login').then((content) => {
 *       ...
 *     }
 * 
 * ## Routes
 * 
 * The Users module defines some convience routes for handling basic user functionality.
 * 
 * ### /login
 * 
 * **Params**
 * Expects to recieve a POSTed form with the values `username`, `password` and `redirect`. `redirect` should be a url to redirect the user to on success.  On login failure, the user will be redirected back to /login.
 * 
 * ### /logout
 * 
 * **Params**
 * Expects to recieve a GET request with the param `redirect`, which is a url where the user will be redirected on successful logout.
 * 
 * # API
 * -----
 */

'use strict';

import {HasModels} from 'nxus-storage'
import {router} from 'nxus-router'

import routesRouter from 'routes'

/**
 * The Users Module provides a complete user authentication and authorization system.
 * 
 */
class Users extends HasModels {
  constructor() {
    super()
    this.protectedRoutes = new Set()
    this.adminRoutes = new Set()

//    app.get('metrics').capture('user')
    
//    templater.replace().template(__dirname+"/../views/users/admin-user-form.ejs")

//    app.get('admin-ui').adminModel(__dirname+'/controllers/adminController.js')


    router.default().middleware(::this._ensureAuthenticated)
    router.default().middleware(::this._ensureAdmin)
    
  }

  protectedRoute(route) {
    this.protectedRoutes.add(route)
  }

  ensureAdmin(route) {
    this.adminRoutes.add(route)
  }

  _checkRoute(route, routes) {
    let r = new routesRouter()
    r.routes = [];
    r.routeMap = [];
    routes.forEach((r) => {
      r.addRoute(r, () => {})
    })
    var match = r.match(route);
    return typeof match != 'undefined'
  }

  _ensureAuthenticated(req, res, next) {
    if (this._checkRoute(req.path, this.protectedRoutes) && !req.isAuthenticated()) {
      return res.redirect(app.config.loginRoute || '/login?redirect=' + encodeURIComponent(req.originalUrl))
    }
    return next()
  }

  _ensureAdmin(req, res, next) {
    if (this._checkRoute(req.path, this.adminRoutes)) {
      if (!req.isAuthenticated()) return res.redirect(app.config.loginRoute || '/login?redirect=' + encodeURIComponent(req.originalUrl))
      if (!req.user.admin) return res.send(403)
      else return next()
    }
    return next()
  }
}

const users = Users.getProxy()
export {Users as default, users}
