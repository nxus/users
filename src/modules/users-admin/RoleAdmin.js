import {AdminController} from 'nxus-admin'
import {DataTablesMixin} from 'nxus-web'
import {permissions} from '../../'
import _ from 'underscore'

export default class RoleAdmin extends DataTablesMixin(AdminController) {
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
    return super.defaultContext(req).then((ctx) => {
      ctx.permissions = _.values(this._permissions)
      return ctx
    })

  }

  save(req, res) {
    if (!_.isArray(req.body.permissions)) {
      req.body.permissions = [req.body.permissions]
    }
    super.save(req, res)
  }
}
