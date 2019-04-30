import {AdminController} from 'nxus-admin'
import {DataTablesMixin} from 'nxus-web'

export default class UserAdmin extends DataTablesMixin(AdminController) {
  constructor(opts) {
    opts = {
      model: 'users-user',
      displayName: 'Users',
      displayFields: [
        'email',
        'nameFirst',
        'nameLast',
        'position',
        'enabled',
        'admin',
        'roles'
      ],
      listFields: [
        'email',
        'nameFirst',
        'nameLast',
        'position',
        'enabled',
        'admin',
        'updatedAt',
        'createdAt',
      ],
      ignoreFields: ['id'],
      paginationOptions: {
        sortField: 'updatedAt',
        sortDirection: 'DESC',
        itemsPerPage: 20
      },
      downloadType: 'csv',
      ...opts
    }
    super(opts)
  }

  edit(req, res, query) {
    // No clue why populate = ['roles'] is returning the intersection rather than the role objects,
    // manually fix here
    return super.edit(req, res, query).then((context) => {
      return this.model.findOne({id: context.object.id}).populate('roles').then((x) => {
        context.object.roles = x.roles
        return context
      })
    })
  }

  save(req, res) {
    let user = req.body
    user.enabled = true
    if(!user.admin)
      user.admin = false
    if(user.id == "")
      delete user.id
    if(!user.password || (user.password && user.password == ""))
      delete user.password
    this.log.debug('Saving user', user.email)
    return super.save(req, res)
  }
}
