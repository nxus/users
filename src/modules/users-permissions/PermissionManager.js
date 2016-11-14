
class PermissionManager {
  constructor(user) {
    this._user = user
    this._permissionObjs = {}
    
    // construct user permissions list
    this._permissions = new Set()
    this.addRoles(this._user.roles)
  }

  addRoles(roles, objectId) {
    this._addRoles(roles, this._permissions)
    if (objectId) {
      if (!this._permissionObjs[objectId]) {
        this._permissionObjs[objectId] = new Set()
      }
      this._addRoles(roles, this._permissionObjs[objectId])
    }
  }

  _addRoles(roles, pSet) {
    for (let role of roles) {
      for (let p of role.permissions) {
        pSet.add(p)
      }
    }
    
  }

  // TODO checkObject needs updating here - roles added per-object tracked above?
  allows(permissionName, obj = null) {
    if (this._user.admin) {
      return true
    }
    if (!this.has(permissionName)) {
      return false
    }
    if (obj && this._permissionObjs[obj.id]) {
      return this._permissionObjs[obj.id].has(permissionName)
    } else {
      return true
    }
  }

  has(permissionName) {
    if (this._user.admin) {
      return true
    }
    return this._permissions.has(permissionName)
  }
}

export {PermissionManager as default}
