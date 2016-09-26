
class PermissionManager {
  constructor(user, permissionObjs) {
    this._user = user
    this._permisionObjs = permissionObjs
    
    // construct user permissions list
    this._permissions = new Set()
    this._user.roles.forEach((role) => {
      for (let p of role.permissions) {
        this._permissions.add(p)
      }
    })
  }

  allows(permissionName, obj = null) {
    if (!this.has(permissionName)) {
      return false
    }
    if (obj && this._permissionObjs[permissionName].checkObject) {
      return this._permissionObjs[permissionName].checkObject(obj, this._user)
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
