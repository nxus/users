/* 
* @Author: Mike Reich
* @Date:   2015-12-14 11:57:54
* @Last Modified 2016-01-27
*/

'use strict';


import passport from 'passport'
import fs from 'fs'

const isDev = process.env.NODE_ENV !== 'production';

export default class APIController {
  constructor(plugin, app) {
    this.app = app;
    var router = app.get('router')

    router.provide('route', 'GET', '/logout', this._logoutHandler.bind(this))
    router.provide('route', 'POST', '/forgot', this._forgotHandler.bind(this))
    router.provide('route', 'GET', '/login-link', this._loginLinkHandler.bind(this))
    router.provide('route', 'GET', '/profile', this._profileHandler.bind(this))
    router.provide('route', 'POST', '/profile/save', this._saveProfile.bind(this))

    app.on('startup', () => {
      router.request('getExpressApp').then((expressApp) => {
        expressApp.post(
          '/login',
          this._authenticationCallback.bind(this),
          this._loginHandler.bind(this)
        )
      })
    })
  }

  _profileHandler(req, res) {
    return this.app.get('templater').request('renderPartial', 'user-profile', 'default', {user: req.user, req}).then(res.send.bind(res))
  }

  _saveProfile(req, res) {
    var user = req.body
    user.enabled = true
    if(!user.admin)
      user.admin = false
    if(user.id == "")
      delete user.id
    if(!user.password || (user.password && user.password.length == 0)) {
      delete user.password
    } else
    this.app.get('storage').request('getModel', 'user').then((User) => {
      return User.update(user.id, user)
    }).then(() => {
      req.flash('success', 'Your profile has been saved.')
      req.login(user, () => {res.redirect("/profile")})
    })
  }

  _forgotHandler(req, res) {
    var email = req.param('email')
    this.app.get('storage').request('getModel', 'user').then((User) => {
      return User.findOne({email})
    }).then((user) => {
      if(!user) throw new Error('User not found')
      var link = this.app.config.host+"/login-link?token="+user.resetPasswordToken
      return this.app.get('templater').request('render', 'user-forgot-email', {user, email, link})
    }).then((content) => {
      return this.app.get('mailer').request('send', email, "noreply@"+this.app.config.host, "Password recovery", content)
    }).then(() => {
      req.flash('info', 'An email has been sent to the address you provided.');
      res.redirect('/login');
    }).catch(() => {
      res.redirect('/login');
    });
  }

  _loginLinkHandler(req, res) {
    var resetPasswordToken = req.param('token')
    this.app.get('storage').request('getModel', 'user').then((User) => {
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
    console.log('login callback')
    this.app.get('storage').request('getModel', 'user').then((User) => {
      req.session.flash = []
      req.session.save(err => {
        var r = req.param.redirect
        if (r) {
          if (r === '/' && User.isEditor(req.user)) {
            return res.redirect('/admin')
          }
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

  // _authenticationCallback(req, res, next) {
  //   let failureRedirect = '/login'
  //   if (req.param('redirect')) {
  //     failureRedirect += '?redirect=' + encodeURIComponent(req.param('redirect'))
  //   }
  //   passport.authenticate('local', {failureRedirect: failureRedirect, failureFlash: true})(req, res, next)
  // }

  // _generateVerifyUrl(user) {
  //   const teamName = user.team.name
  //   const verifyEndpoint = `/api/users/${user._id}/verify/${user.verifyToken}`
  //   return `http://${teamName}.${this.appDomain}${verifyEndpoint}`
  // }

  // _sendInviteEmail(userId) {
  //   this.app.emit('storage.getModel', 'User', (err, User) => {
  //     this.app.log.warn('userId', userId)
  //     User.findOne({ _id: userId }).populate('team').exec((err, user) => {
  //       const link = this._generateResetPasswordUrl(user)
  //       const teamName = user.team.name
  //       var role = "view"
  //       if (user.isEditor()) role = "edit"
  //       this.app.emit('mail.send', {
  //         recipients: [user.email],
  //         subject: `DataDash.io: You've been invited`,
  //         messageText: this.render('inviteEmail', {
  //           teamName: teamName,
  //           user: user,
  //           role: role,
  //           link: link
  //         })
  //       })
  //     })
  //   })
  // }

  // _loginHandler(req, res) {
  //   this.app.emit('storage.getModel', 'User', (err, User) => {
  //     var r = req.param('redirect')
  //     if (r) {
  //       /// default redirect in `login.ejs` is `/`, override for admin users
  //       if (r === '/' && User.isEditor(req.user)) {
  //         return res.redirect('/admin')
  //       }
          
  //       req.session.flash = []
  //       req.session.save(err => {
  //         return res.redirect(req.param('redirect'))
  //       })  
  //     } else {
  //       res.json({msg: "Successfully Authenticated"})
  //     }  
  //   })
  // }

  // _verifyTokenHandler(req, res) {
  //   this.app.emit('storage.getModel', 'User', (err, User) => {
  //     User.findOne({
  //       _id: req.params.id,
  //       verifyToken: req.params.token
  //     }).populate('team').exec((err, user) => {
  //       if (err) return res.status(500).send(err)

  //       user.resetVerifyToken();
  //       User.update({ _id: user._id }, {
  //         verified: true,
  //         verifyToken: user.verifyToken
  //       }, null, (err) => {
  //         if (err) return res.status(500).send(err)

  //         this.app.emit('flash.setMessage', req, 'Your account has been verified.')
  //         res.redirect('/login')
  //       });
  //     });
  //   })
  // }

  // _resendInvitationHandler(req, res) {
  //   this.app.emit('storage.getModel', 'User', (err, User) => {
  //     User.findOne({_id: req.params.id}).exec((err, user) => {
  //       if (err) return res.status(500).send(err)
  //       this._sendInviteEmail(user);
  //       this.app.emit('flash.setMessage', req, `Invitation email sent to ${user.email}.`)
  //       res.status(200).send('Ok')
  //     });
  //   })
  // }

  // _generateResetPasswordUrl(user) {
  //   const teamName = user.team.name
  //   const resetPasswordEndpoint = `/api/users/${user._id}/reset/${user.resetPasswordToken}`
  //   return `http://${teamName}.${this.appDomain}${resetPasswordEndpoint}`
  // }

  // _sendForgotPasswordEmail(user) {
  //   const link = this._generateResetPasswordUrl(user)
  //   this.app.emit('mail.send', {
  //     recipients: [user.email],
  //     subject: 'DataDash.io: Reset Password Request',
  //     messageHtml: `
  //       <p>Hello ${user.email}!</p>

  //       <p>Someone has requested a link to change your password. You can do this through the link below.</p>

  //       <p><a href="${link}">${link}</a></p>

  //       <p>If you didn't request this, please ignore this email.</p>
  //       <p>Your password won't change until you access the link above and create a new one.</p>
  //     `
  //   });
  // }

  // _forgotPassword(req, res) {
  //   this.app.emit('storage.getModel', 'User', (err, User) => {
  //     User.findOne({ email: req.body.email }).populate('team').exec((err, user) => {
  //       if (err || !user) {
  //         this.app.emit('flash.setMessage', req, 'Error', 'No account with that email address exists.')
  //         return res.redirect('/login')
  //       }
  //       user.resetResetPasswordToken()
  //       user.resetPasswordExpires = Date.now() + 3600000 // 1 hour
  //       user.save(err => {
  //         this._sendForgotPasswordEmail(user)
  //         this.app.emit('flash.setMessage', req, `A confimation email was sent to ${user.email}`)
  //         return res.redirect('/login')
  //       })
  //     })
  //   })
  // }

  // _verifyResetPasswordToken(req, res) {
  //   const { token } = req.params;
  //   this.app.emit('storage.getModel', 'User', (err, User) => {
  //     User.findOne({ resetPasswordToken: token }).exec((err, user) => {
  //       if (err || !user) {
  //         this.app.emit('flash.setMessage', req, 'Password reset token is invalid or has expired.')
  //         return res.redirect('/forgot')
  //       }
  //       res.redirect(`/reset-password/${user.id}`)
  //     })
  //   })
  // }

  // _renderResetPassword(page, next) {
  //   const id = page.req.params.userId
  //   this.app.emit('flash.getMessages', page.req, (messages) => {
  //     page.template = 'admin-app'
  //     page.title = 'Reset Password'
  //     page.body = this.render('resetPassword', {id: id, flash: this.render('messages', {messages: messages})})
  //     next()
  //   })
  // }

  // _resetPassword(req, res) {
  //   const { id, newPassword, confirmPassword } = req.body;

  //   this.app.emit('storage.getModel', 'User', (err, User) => {
  //     User.findOne({ _id: id }).exec((err, user) => {
  //       if (err || !user) {
  //         this.app.emit('flash.setMessage', req, 'Error', 'Could not find user.')
  //         return res.redirect(`/reset-password/${id}`)
  //       }

  //       if (user.resetPasswordExpires && user.resetPasswordExpires <= Date.now()) {
  //         this.app.emit('flash.setMessage', req, 'Error', `Your token has expired.`)
  //         return res.redirect(`/reset-password/${id}`)
  //       }

  //       if (newPassword !== confirmPassword) {
  //         this.app.emit('flash.setMessage', req, 'Error', `Passwords don't match`)
  //         return res.redirect(`/reset-password/${id}`)
  //       }

  //       user.set('verified', true)
  //       user.set('password', newPassword)
  //       user.save((err) => {
  //         this.app.emit('flash.setMessage', req, 'Your password has been updated.')
  //         res.redirect(`/login`)
  //       })
  //     })
  //   })
  // }
}
