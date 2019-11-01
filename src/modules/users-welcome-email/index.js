import striptags from 'striptags'

import {application, NxusModule} from 'nxus-core'
import {storage} from 'nxus-storage'
import {mailer} from 'nxus-mailer'
import {templater} from 'nxus-templater'
import {users} from '../../../'

export default class UsersWelcomeEmail extends NxusModule {
  constructor() {
    super()
    templater.default().template(__dirname+"/../../../templates/user-welcome-email.ejs")

    storage.on('model.create.users-user', ::this._sendWelcomeEmail)

    users.getBaseUrl().then((baseUrl) => {
      this.baseUrl = baseUrl
    })
  }

  /* `users-user` model create event listener to send welcome email to user.
   * It renders the `user-welcome-email` template to provide the body of
   * the welcome email. The rendered result provides HTML message
   * content, and is stripped of HTML tags to provide plaintext content.
   */
  _sendWelcomeEmail(model, user) {
    this.log.debug('Sending welcome email to', user.email)
    var link
    if (user.password) {
      link = "http://"+application.config.baseUrl+this.baseUrl+"login"
    } else {
      link = "http://"+application.config.baseUrl+this.baseUrl+"login-link?token="+user.resetPasswordToken
    }

    let tempPass = user.tempPassword
    delete user.tempPassword
    templater.render('user-welcome-email', {user, tempPass, link, siteName: application.config.siteName}).then((html) => {
      let fromEmail = (application.config.users && application.config.users.forgotPasswordEmail) ? application.config.users.forgotPasswordEmail : "noreply@"+((application.config.mailer && application.config.mailer.emailDomain) || application.config.host)
      return mailer.send(user.email, fromEmail, "Welcome to "+application.config.siteName, striptags(html), {html})
    })
  }
  
}
