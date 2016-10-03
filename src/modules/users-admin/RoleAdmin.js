import {AdminController} from 'nxus-admin'
import {permissions} from '../../'
import _ from 'underscore'

export default class RoleAdmin extends AdminController {
  constructor(opts) {
    opts = {
      model: 'users-role',
      displayName: 'Roles',
      displayFields: [
        'role'
      ],
      ...opts
    }
    super(opts)

    permissions.getPermissions().then((perms) => {
      this._permissions = perms
    })
  }

  defaultContext(req) {
    return {
      permissions: _.values(this._permissions),
      ...super.defaultContext(req)
    }
  }

  save(req, res) {
    if (!_.isArray(req.body.permissions)) {
      req.body.permissions = [req.body.permissions]
    }
    super.save(req, res)
  }
}
