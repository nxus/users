import {application, NxusModule} from 'nxus-core'
import {router} from 'nxus-router'
import HasUserModel from '../../HasUserModel'

export default class UsersProfile extends HasUserModel {
  constructor() {
    super()
    
    templater.default().template(__dirname+"/../../../templates/user-profile.ejs", "page")

    router.route('GET', '/profile', ::this._profileHandler)
    router.route('POST', '/profile/save', ::this._saveProfile)
  }

  _profileHandler(req, res) {
    return templater.render('user-profile', {title: 'Your Profile', user: req.user, req}).then(::res.send)
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
      req.login(user, () => {res.redirect("/profile")})
    })
  }
}

