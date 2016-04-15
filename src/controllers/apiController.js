/* 
* @Author: Mike Reich
* @Date:   2015-12-14 11:57:54
* @Last Modified 2016-04-14
*/

'use strict';


import passport from 'passport'
import fs from 'fs'

const isDev = process.env.NODE_ENV !== 'production';

export default class APIController {
  constructor(app) {
    this.app = app;
    var router = app.get('router')

    router.route('GET', '/logout', this._logoutHandler.bind(this))
    router.route('POST', '/forgot', this._forgotSaveHandler.bind(this))
    router.route('GET', '/login-link', this._loginLinkHandler.bind(this))
    router.route('GET', '/profile', this._profileHandler.bind(this))
    router.route('GET', '/login', this._loginPageHandler.bind(this))
    router.route('GET', '/forgot', this._forgotHandler.bind(this))
    router.route('POST', '/profile/save', this._saveProfile.bind(this))

    app.on('startup', () => {
      router.getExpressApp().then((expressApp) => {
        expressApp.post(
          '/login',
          this._authenticationCallback.bind(this),
          this._loginHandler.bind(this)
        )
      })
    })
  }

  _loginPageHandler(req, res) {
    return this.app.get('templater').render('user-login', {req, user: req.user, redirect: req.param('redirect')}).then(res.send.bind(res))
  }

  _forgotHandler(req, res) {
    return this.app.get('templater').render('user-forgot-password', {req, user: req.user}).then(res.send.bind(res))
  }

  _profileHandler(req, res) {
    return this.app.get('templater').render('user-profile', {title: 'Your Profile', user: req.user, req}).then(res.send.bind(res))
  }

  _saveProfile(req, res) {
    var user = req.body
    user.enabled = true
    if(user.id == "")
      delete user.id
    if(!user.password || (user.password && user.password.length == 0)) {
      delete user.password
    } 
    this.app.get('storage').getModel('user').then((User) => {
      return User.update(user.id, user)
    }).then(() => {
      req.flash('success', 'Your profile has been saved.')
      req.login(user, () => {res.redirect("/profile")})
    })
    }

  _forgotSaveHandler(req, res) {
    var email = req.param('email')
    this.app.get('storage').getModel('user').then((User) => {
      return User.findOne({email})
    }).then((user) => {
      if(!user) throw new Error('No user matching that email was found.')
      var link = "http://"+this.app.config.baseUrl+"/login-link?token="+user.resetPasswordToken
      return this.app.get('templater').render('user-forgot-email', {user, email, link, siteName: this.app.config.siteName})
    }).then((content) => {
      let fromEmail = (this.app.config.users && this.app.config.users.forgotPasswordEmail) ? this.app.config.users.forgotPasswordEmail : "noreply@"+((this.app.config.mailer && this.app.config.mailer.emailDomain) || this.app.config.baseUrl) 
      return this.app.get('mailer').send(email, fromEmail, "Password recovery", content, {html: content})
    }).then(() => {
      req.flash('info', 'An email has been sent to the address you provided.');
      res.redirect('/login');
    }).catch((e) => {
      req.flash('error', e)
      res.redirect('/login');
    });
  }

  _loginLinkHandler(req, res) {
    var resetPasswordToken = req.param('token')
    this.app.get('storage').getModel('user').then((User) => {
      return User.findOne({resetPasswordToken})
    }).then((user) => {
      if(!user) throw new Error('No user found')
      req.login(user, () => {res.redirect('/profile')})
    }).catch(() => {
      res.redirect('/login')
    })
  }

  _authenticationCallback(req, res, next) {
    let failureRedirect = '/login'
    if (req.param.redirect) {
      failureRedirect += '?redirect=' + encodeURIComponent(req.param('redirect'))
    }
    passport.authenticate('local', {failureRedirect: failureRedirect, failureFlash: true})(req, res, next)
  }

  _loginHandler(req, res) {
    this.app.get('storage').getModel('user').then((User) => {
      req.session.flash = []
      req.session.save(err => {
        var r = req.param('redirect')
        if (r) {
          return res.redirect(r)
        } else
          return res.redirect("/")
      })
    })
  }

  _logoutHandler(req, res) {
    this.app.emit('user.loggedOut', req.user)
    req.session.flash = []
    req.session.save(err => {
      this.app.log.debug('logged out', req.user)
      req.logout()
      if(req.params.redirect)
        res.redirect(req.params.redirect)
      else
        res.redirect('/login')
    })
  }
}
