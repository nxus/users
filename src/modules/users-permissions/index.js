import {application} from 'nxus-core'
import {storage, HasModels} from 'nxus-storage'
import _ from 'underscore'
import Promise from 'bluebird'

import {router} from 'nxus-router'

import routes from 'routes'

import PermissionManager from './PermissionManager'

/**
 * Permissions system
 * 
 * This module provides a role & permission list approach to managing user access in Nxus.
 * Routes (or other guarded functionality) is associated with a Permission name, and permissions
 * are assigned to Roles. A User may have multiple roles, and a permission may belong to multiple roles.
 * 
 * Permissions and roles can also be scoped to specific model objects, allowing users access to just those objects
 * they own or have been given a role in managing. 
 * 
 * ## Usage
 * `import {permissions} from 'nxus-users'
 * 
 * ### Registering permissions and roles
 * 
 * `permissions.register('permission-name', ['Default Role'])
 * 
 * ### Guarding routes and handlers
 * 
 * `permissions.guard('/my/route', 'permission-name')
 * 
 * `permissions.guardHandler(::this._myRoute, 'permission-name').then((handler) => { router.route('/my/route', handler) })
 * 
 * ### Checking for user permissions in handlers/templates
 * 
 * `req.user.permissions.allows('permission-name')
 * `req.user.permissions.allows('permission-name', object)
 * 
 * ### Object-level permissions
 * 
 * Object role assignments need a collection object that subclasses ObjectRoleModel and overrides the `object` attribute:
 * 
 * ```
  import {ObjectRoleModel} from 'nxus-users'
  export default ObjectRoleModel.extend{{
    identity: 'my-object-roles',
    attributes: { object: { model: 'my-object'}}
  }}
 * ````
 * 
 * The permissions should be registered with an extra argument naming this model collection:
 * 
 * `permissions.register('my-object-permission', ['Object Editor'], 'my-object-roles')
 * 
 * Alternatively, this may be a function that accepts `(objectId, user)` and returns the roles assigned -
 * This can implement traversing the object model to reach a parent with the permissions, or entirely override
 * how and where role assignments are stored.
 * 
 * Guards should be set with the extra argument naming the URL param to use as objectId to lookup.
 * 
 * `permissions.guard('/edit/:id', 'my-object-permission', 'id')
 * 
 */

class UsersPermissions extends HasModels {
  constructor(opts={}) {
    opts.modelNames = {'users-role': 'Role', 'users-user': 'User'}
    super(opts)

    this._permissions = {}

    this._defaultRoles = {}

    this._routesPermissions = new routes()

    router.middleware(::this._userMiddleware)
    router.middleware(::this._checkMiddleware)

    // Create roles if they do not exist, adding missing perms
    this.__appListener = ::this._createRoles
    application.on('startup', this.__appListener)
    application.on('stop', () => {application.removeListener('startup', this.__appListener)})
  }

  _createRoles() {
    return Promise.map(_.keys(this._defaultRoles), async (role) => {
      let roleObj = await this.models.Role.createOrUpdate({role}, {role, systemDefined: true})
      this.log.info("Created role", role)
      roleObj.permissions = _.union(roleObj.permissions || [], this._defaultRoles[role])
      return roleObj.save()
    })
  }


  /*
   * Register a permission
   * @param {string} name Permission name
   * @param {string|array} [defaultRoles] Default role name(s) to contain this permission
   * @param {object} [objectModel] Collection of ObjectRoleModel for object permissions, or function (objectId, user) to return the roles a user has for a given object
   */
  register(name, defaultRoles=null, objectModel=null) {
    this.log.info("Registering permission", name, "for", defaultRoles, objectModel)
    this._permissions[name] = {
      name,
      objectModel,
    }
    if(defaultRoles) {
      if (!_.isArray(defaultRoles)) {
        defaultRoles = [defaultRoles]
      }
      for (let role of defaultRoles) {
        if (!this._defaultRoles[role]) {
          this._defaultRoles[role] = []
        }
        this._defaultRoles[role].push(name)
      }
    }
  }
  
  /*
   * Guard a route with a permission
   * @param {function|string} [handler|route] A handler or route to wrap with a permission check
   * @param {string} name Permission name
   * @param {object} [objectParam] URL param for object permissions object key
   * @returns {function} Wrapped handler for method handlers
   */
  guard(route, name, objectParam=null) {
    this._routesPermissions.addRoute(route, () => {return [name, objectParam]})
  }
  /*
   * Guard a handler method with a permission
   * @param {function|string} [handler|route] A handler or route to wrap with a permission check
   * @param {string} name Permission name
   * @param {object} [objectParam] URL param for object permissions object key
   * @returns {function} Wrapped handler for method handlers
   */
  guardHandler(handler, name, objectParam=null) {
    // Wrap handler
      return this._checkPermission(name, handler, objectParam)
  }
  /*
   * [Deprecated] Register a permission and guard a route handler in one
   * @param {string} name Permission name
   * @param {function|string} [handler|route] A handler or route to wrap with a permission check
   * @param {object} [objectParams] Mapping of req params to ObjectRoleModel identity
   * @param {string|array} [roleName] Default role name(s) to contain this permission
   * @returns {function} Wrapped handler for method handlers
   */
  allow(name, handler = null, objectParams = null, roleName = null) {
    let coll, param
    if (objectParams) {
      let keys = _.keys(objectParams)
      if (keys.length > 1) {
        throw new Error("permissions.allow does not support multiple objectParams values: "+ keys)
      }
      param = _.first(keys)
      coll = objectParams[param]
    }
    this.register(name, roleName, coll)
    if (_.isString(handler)) {
      return this.guard(handler, name, param)
    } else {
      return this.guardHandler(handler, name, param)
    }
  }
  /*
   * Get users with a given (non-object) permission
   * @param {string} name Permission name
   * @returns {Array} user objects with this permission
   */
  async getUsersWithPermission(name) {
    let roles = await this.models.Role.find({permissions: name}).populate('users')
    return _.flatten(_.pluck(roles, 'users'))
  }
  

  getPermissions() {
    return this._permissions
  }

  async getRoles() {
    let roles = await this.models.Role.find()
    let ret = {}
    for (let role of roles) {
      ret[role.role] = role
    }
    return ret
  }

  _checkPermission(name, handler, objectParam) {
    return async (req, res, next) => {
      if (handler) {
        // Route handler, after middleware
        next = () => { handler(req, res) }
        await this._setObjectRoles(req.user, name, req.params[objectParam])
      }
      if (req.user.permissions.has(name)) {
        next()
      } else {
        this.log.info("Denied access for", req.path, name, req.user ? req.user.email : "no one")
        res.status(403).send("Permission Denied")
      }
    }
  }

  async _checkMiddleware(req, res, next) {
    let routePermission = this._routesPermissions.match(req.path)
    // TODO this probably needs to support nested/multiple matches
    if (req.user && routePermission) {
      let [permission, objectParam] = routePermission.fn()
      this.log.info("Checking route permission for ", req.path, permission, objectParam, "in", routePermission.params)
      await this._setObjectRoles(req.user, permission, routePermission.params[objectParam])
      this._checkPermission(permission, null, objectParam)(req, res, next)
    } else {
      next()
    }
  }

  async _userMiddleware(req, res, next) {
    if (req.user) {
      let u = await this.models.User.findOne(req.user.id).populate('roles').populate('team')
      req.user.permissions = new PermissionManager(u)
      next()
    } else {
      next()
    }
  }

  async _setObjectRoles(user, permission, objectId) {
    let objectModel = this._permissions[permission].objectModel
    if (!objectModel) return
    let roles
    if (_.isString(objectModel)) {
      let model = await storage.getModel(objectModel)
      roles = await model.find({user: user.id, object: objectId}).populate('role')
    } else {
      roles = await objectModel(objectId, user)
    }
    user.permissions.addRoles(_.pluck(roles, 'role'), objectId)
  }

}

const permissions = UsersPermissions.getProxy()
export {UsersPermissions as default, permissions}
