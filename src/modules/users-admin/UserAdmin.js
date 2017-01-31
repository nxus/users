import {AdminController} from 'nxus-admin'

export default class UserAdmin extends AdminController {
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
