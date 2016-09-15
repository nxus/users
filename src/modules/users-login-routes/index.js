import passport from 'passport'

import {application, NxusModule} from 'nxus-core'
import {router} from 'nxus-router'
import {templater} from 'nxus-templater'
import HasUserModel from '../../HasUserModel'

export default class UsersLoginRoutes extends HasUserModel {
  constructor() {
    super()
    
    templater.default().template(__dirname+"/../../../templates/user-login.ejs", "bare")
    templater.default().template(__dirname+"/../../../templates/user-forgot-email.ejs")
    templater.default().template(__dirname+"/../../../templates/user-forgot-password.ejs")
    
    let baseUrl = application.config['users'].baseUrl

    if(baseUrl[baseUrl.length-1] != '/') baseUrl += '/'
    
    router.route('GET', baseUrl+'logout', ::this._logoutHandler)
    router.route('POST', baseUrl+'forgot', ::this._forgotSaveHandler)
    router.route('GET', baseUrl+'login-link', ::this._loginLinkHandler)
    router.route('GET', baseUrl+'login', ::this._loginPageHandler)
    router.route('GET', baseUrl+'forgot', ::this._forgotHandler)
    router.route('POST', baseUrl+'login', [::this._authenticationCallback, ::this._loginHandler])
  }

  _loginPageHandler(req, res) {
    return templater.render('user-login', {req, user: req.user, redirect: req.param('redirect')}).then(::res.send)
  }

  _forgotHandler(req, res) {
    return templater.render('user-forgot-password', {req, user: req.user}).then(::res.send)
  }

  _forgotSaveHandler(req, res) {
    var email = req.param('email')
    return this.models.User.findOne({email}).then((user) => {
      if(!user) throw new Error('No user matching that email was found.')
      var link = "http://"+this.app.config.baseUrl+baseUrl+"login-link?token="+user.resetPasswordToken
      return templater.render('user-forgot-email', {user, email, link, siteName: this.app.config.siteName})
    }).then((content) => {
      let fromEmail = (this.app.config.users && this.app.config.users.forgotPasswordEmail) ? this.app.config.users.forgotPasswordEmail : "noreply@"+((this.app.config.mailer && this.app.config.mailer.emailDomain) || this.app.config.host) 
      return this.app.get('mailer').send(email, fromEmail, "Password recovery", content, {html: content})
    }).then(() => {
      req.flash('info', 'An email has been sent to the address you provided.');
      res.redirect(baseUrl+'login');
    }).catch((e) => {
      req.flash('error', e)
      res.redirect(baseUrl+'login');
    });
  }

  _loginLinkHandler(req, res) {
    var resetPasswordToken = req.param('token')
    return this.models.User.findOne({resetPasswordToken}).then((user) => {
      if(!user) throw new Error('No user found')
      req.login(user, () => {res.redirect(baseUrl+'profile')})
    }).catch(() => {
      res.redirect(baseUrl+'login')
    })
  }
  
  _authenticationCallback(req, res, next) {
    let failureRedirect = baseUrl+'login'
    if (req.param.redirect) {
      failureRedirect += '?redirect=' + encodeURIComponent(req.param('redirect'))
    }
    passport.authenticate('local', {failureRedirect: failureRedirect, failureFlash: true})(req, res, next)
  }

  _loginHandler(req, res) {
    req.session.flash = []
    req.session.save(err => {
      var r = req.param('redirect')
      if (r) {
        return res.redirect(r)
      } else
        return res.redirect("/")
    })
  }
  
  _logoutHandler(req, res) {
    req.session.flash = []
    req.session.save(err => {
      req.logout()
      if(req.params.redirect)
        res.redirect(req.params.redirect)
      else
        res.redirect(baseUrl+'login')
    })
  }
}
