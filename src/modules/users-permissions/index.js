import {application} from 'nxus-core'
import {default as storage, HasModels} from 'nxus-storage'
import _ from 'underscore'
import Promise from 'bluebird'

import {router} from 'nxus-router'

import routes from 'routes'

import PermissionManager from './PermissionManager'

class UsersPermissions extends HasModels {
  constructor(opts) {
    opts.modelNames = {'users-role': 'Role'}
    super(opts)

    this._permissions = {}

    this._defaultRoles = {}

    this._routesPermissions = new routes()

    router.middleware(::this._userMiddleware)
    router.middleware(::this._checkMiddleware)

    // Create roles if they do not exist, adding missing perms
    application.on('startup', () => {
      return Promise.map(_.keys(this._defaultRoles), (role) => {
        return this.models.Role.createOrUpdate({role}, {role, systemDefined: true}).then((roleObj) => {
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
   * @param {object} [objectParams] Mapping of req params to ObjectRoleModel identity
   * @param {string|array} [roleName] Default role name(s) to contain this permission
   */
  allow(name, handler = null, objectParams = null, roleName = null) {
    this._permissions[name] = {
      name,
      handler,
      objectParams,
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
      this._routesPermissions.addRoute(handler, () => {return name})
    } else {
      // Wrap handler
      return _checkPermission(name, handler)
    }
  }

  getPermissions() {
    return this._permissions
  }

  getRoles() {
    return this.models.Role.find().then((roles) => {
      let ret = {}
      for (let role of roles) {
        ret[role.role] = role
      }
      return ret
    })
  }

  _checkPermission(name, handler) {
    return function(req, res, next) {
      if (handler) {
        next = () => { handler(req, res) }
      }
      if (req.user.permissions.has(name)) {
        next()
      } else {
        res.status(403).send("Permission Denied")
      }
    }
  }

  _checkMiddleware(req, res, next) {
    let routePermission = this._routesPermissions.match(req.path)
    // TODO this probably needs to support nested/multiple matches
    this.log.info("Checking for route permission", req.path)
    if (req.user && routePermission) {
      let permission = routePermission()
      this.log.info("Checking route permission for ", req.path, permission, routePermission.params)
      this._getObjectRoles(req.user, permission, routePermission.params).then((roles) => {
        req.user.permissions.addRoles(roles)
        let check = this._checkPermission(permission)
        check(req, res, next)
      })
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

  _getObjectPermissions(user, permission, params) {
    let objectParams = this._permissions[permission].objectParams
    return Promise.map(objectParams, (param) => {
      return storage.get(objectParams[param])
    }).then((model) => {
      return model.find({user: user, object: params[param]}).populate('role')
    }).then((roles) => {
      return _.pluck(roles, 'role')
    })
  }

}

const permissions = UsersPermissions.getProxy()
export {UsersPermissions as default, permissions}
