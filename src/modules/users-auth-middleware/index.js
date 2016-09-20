/* 
* @Author: Mike Reich
* @Date:   2015-12-14 12:01:06
* @Last Modified 2016-09-15
*/

'use strict';

import passport from 'passport'
import LocalStrategy from 'passport-local'

import HasUserModel from '../../HasUserModel'
import {router} from 'nxus-router'

export default class UsersAuthMiddleware extends HasUserModel {
  constructor() {
    super()
    passport.use(
      new LocalStrategy((username, password, done) => {
        this.models.User.findOne({ email: username }).populate('roles').populate('team')
          .then((user) => {
            if(!user)                           return done(null, false, { message: 'Incorrect email address.' })
            if(!user.validPassword(password))   return done(null, false, { message: 'Incorrect password.' })
            if(!user.enabled)                   return done(null, false, { message: 'Your account has been disabled.' })
            return done(null, user)
          })
      })
    )

    passport.serializeUser((user, done) => {
      done(null, user)
    })

    passport.deserializeUser((user, done) =>{
      done(null, user)
    })

    router.default().provide('middleware', passport.initialize());
    router.default().provide('middleware', passport.session());
//    return passport;
  }
};
