import {NxusModule} from 'nxus-core'
import _ from 'underscore'

import {router} from 'nxus-router'

import PermissionManager from './PermissionManager'

class UserPermissions extends NxusModule {
  constructor(opts) {
    super(opts)

    this._permissions = {}
    this._routePermissions = {}

    router.middleware(::this._userMiddleware)
    router.middleware(::this._checkMiddleware)

    // Need to register admin page for PermissionsList / Role definition
    // that uses the list of available permissions
    //
    // Also need to write default roles if they do not exist
  }

  /*
   * Register a permission
   * @param {string} name Permission name
   * @param {function|string} [handler|route] A handler or route to wrap with a permission check
   * @param {function} [checkObject] function(obj, user) that returns boolean for access to a specific object
   * @param {string} [roleName] Default role name to contain this permission
   */
  allow(name, handler = null, checkObject = null, roleName = null) {
    this._permissions[name] = {
      name,
      handler,
      checkObject,
      roleName
    }
    if (_.isString(handler)) {
      // Route
      this._routePermissions[handler] = name
    } else {
      // Wrap handler
      return _checkPermission(name, checkObject, handler)
    }
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

const userPermissions = UserPermissions.getProxy()
export {UserPermissions as default, userPermissions}
