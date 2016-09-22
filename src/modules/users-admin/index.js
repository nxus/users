import {NxusModule} from 'nxus-core'
import {admin} from 'nxus-admin'
import {templater} from 'nxus-templater'

import UserAdmin from './UserAdmin'

class UsersAdmin extends NxusModule {
  constructor(opts) {
    super(opts)

    new UserAdmin()
    templater.template(__dirname+'/templates/admin-user-form.ejs', 'admin-page', 'users-user-admin-create')
    templater.template(__dirname+'/templates/admin-user-form.ejs', 'admin-page', 'users-user-admin-edit')
      
    admin.manage({
      model: 'users-team',
      displayName: 'Teams',
      displayFields: [
        'name',
        'enabled'
      ]
    })
    admin.manage({
      model: 'users-role',
      displayName: 'Roles',
      displayFields: [
        'role'
      ]
    })
  }
}

export default UsersAdmin
