import {AdminController} from 'nxus-admin'
import {DataTablesMixin} from 'nxus-web'

export default class UserAdmin extends DataTablesMixin(AdminController) {
  constructor(opts) {
    opts = {
      model: 'users-user',
      displayName: 'Users',
      // TO DO:
      //   The ViewController _modelAttributes() method uses displayFields,
      //   if defined, to filter the attribute list – if an attribute isn't
      //   in displayFields, it's excluded from the attribute list.
      //   Unfortunately, this means that attributes used in the list or
      //   edit context won't be included unless they are specified in
      //   displayFields. For the time being, we're just stuffing all the
      //   fields we use in any context into displayFields.
      displayFields: [
        'email',
        'nameFirst',
        'nameLast',
        'position',
        'enabled',
        'admin',
        'roles',
        'updatedAt',
        'createdAt'
      ],
      listFields: [
        'email',
        'nameFirst',
        'nameLast',
        'position',
        'enabled',
        'admin',
        'updatedAt',
        'createdAt'
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

  defaultContext(req, related=false) {
    return super.defaultContext(req, related).then((ret) => {
      ret.editFields = ['email', 'nameFirst', 'nameLast', 'position', 'enabled', 'admin', 'roles']
      return ret
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
    if(!Array.isArray(user.roles))
      user.roles = user.roles ? [user.roles] : []
    this.log.debug('Saving user', user.email)
    return super.save(req, res)
  }
}
