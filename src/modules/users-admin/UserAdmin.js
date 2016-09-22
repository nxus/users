import {AdminController} from 'nxus-admin'

export default class UserAdmin extends AdminController {
  constructor(opts) {
    opts = {
      model: 'users-user',
      displayFields: [
        'email',
        'nameFirst',
        'nameLast',
        'position',
        'enabled',
        'admin',
        'lastLogIn'
      ],
      ...opts
    }
    super(opts)
  }

  save(req, res) {
    console.log("Ready to save")
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
