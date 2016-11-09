import {application, NxusModule} from 'nxus-core'
import {router} from 'nxus-router'
import {templater} from 'nxus-templater'
import {users} from '../../'
import HasUserModel from '../../HasUserModel'

export default class UsersProfile extends HasUserModel {
  constructor() {
    super()
    
    templater.default().template(__dirname+"/../../../templates/user-profile.ejs", "page")

    users.getBaseUrl().then((baseUrl) => {
      this.baseUrl = baseUrl
      router.route('GET', this.baseUrl+'profile', ::this._profileHandler)
      router.route('POST', this.baseUrl+'profile/save', ::this._saveProfile)
    })
  }

  _profileHandler(req, res) {
    if(!req.user) return res.redirect(this.baseUrl+'login')
    return templater.render('user-profile', {user: req.user, req}).then(::res.send)
  }

  _saveProfile(req, res) {
    var user = req.body
    user.enabled = true
    if(user.id == "")
      delete user.id
    if(!user.password || (user.password && user.password.length == 0)) {
      delete user.password
    } 
    return this.models.User.update(user.id, user).then(() => {
      req.flash('success', 'Your profile has been saved.')
      req.login(user, () => {res.redirect(this.baseUrl+"profile")})
    })
  }
}

