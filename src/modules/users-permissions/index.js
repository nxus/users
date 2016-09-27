import {application} from 'nxus-core'
import {HasModels} from 'nxus-storage'
import _ from 'underscore'
import Promise from 'bluebird'

import {router} from 'nxus-router'

import PermissionManager from './PermissionManager'

class UsersPermissions extends HasModels {
  constructor(opts) {
    opts.modelNames = {'users-role': 'Role'}
    super(opts)

    this._permissions = {}
    this._routePermissions = {}

    this._defaultRoles = {}

    router.middleware(::this._userMiddleware)
    router.middleware(::this._checkMiddleware)

    // Create roles if they do not exist, adding missing perms
    application.on('startup', () => {
      return Promise.map(_.keys(this._defaultRoles), (role) => {
        return this.models.Role.createOrUpdate({role}, {role}).then((roleObj) => {
          this.log.info("Created role", role)
          roleObj.permissions = _.union(roleObj.permissions || [], this._defaultRoles[role])
          return roleObj.save()
        })
      })
    })
  }

  /*
   * Register a permission
   * @param {string} name Permission name
   * @param {function|string} [handler|route] A handler or route to wrap with a permission check
   * @param {function} [checkObject] function(obj, user) that returns boolean for access to a specific object
   * @param {string|array} [roleName] Default role name(s) to contain this permission
   */
  allow(name, handler = null, checkObject = null, roleName = null) {
    this._permissions[name] = {
      name,
      handler,
      checkObject,
    }
    if(roleName) {
      if (!_.isArray(roleName)) {
        roleName = [roleName]
      }
      for (let role of roleName) {
        if (!this._defaultRoles[role]) {
          this._defaultRoles[role] = []
        }
        this._defaultRoles[role].push(name)
      }
    }
    if (_.isString(handler)) {
      // Route
      this._routePermissions[handler] = name
    } else {
      // Wrap handler
      return _checkPermission(name, checkObject, handler)
    }
  }

  getPermissions() {
    return this._permissions
  }

  _checkPermission(name, checkObject, handler) {
    return function(req, res, next) {
      if (handler) {
        next = handler
      }
      req.checkObject = checkObject
      if (req.user.permissions.has(name)) {
        next()
      } else {
        res.status(403).send("Permission Denied")
      }
    }
  }

  _checkMiddleware(req, res, next) {
    // TODO this needs to check for route matches not just full path for params
    let routePermission = this._routePermissions[req.path]
    if (routePermission) {
      let check = this._checkPermission(routePermission,
                                        this._permissions[routePermission].checkObject)
      check(req, res, next)
    } else {
      next()
    }
  }

  _userMiddleware(req, res, next) {
    if (req.user) {
      req.user.permissions = new PermissionManager(req.user, this._permissions)
    }
    next()
  }

}

const permissions = UsersPermissions.getProxy()
export {UsersPermissions as default, permissions}
