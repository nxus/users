
class PermissionManager {
  constructor(user, permissionObjs) {
    this._user = user
    this._permisionObjs = permissionObjs
    // construct user permissions list
    this._permissions = []
  }

  populate() {
    return Promise.resolve()
  }

  allow(permissionName, obj = null) {
    if (!this.includes(permissionName)) {
      return false
    }
    if (obj && this._permissionObjs[permissionName].checkObject) {
      return this._permissionObjs[permissionName].checkObject(obj, this._user)
    } else {
      return true
    }
  }

  includes(permissionName) {
    if (this._user.admin) {
      return true
    }
    return this._permissions.includes(permissionName)
  }
}
