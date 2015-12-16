/* 
* @Author: Mike Reich
* @Date:   2015-12-14 12:01:06
* @Last Modified 2015-12-15
*/

'use strict';

import passport from 'passport'
import LocalStrategy from 'passport-local'

module.exports = (plugin, app) => {
  passport.use(
    new LocalStrategy((username, password, done) => {
      app.get('storage').request('getModel', 'user').then((User) => {
        User.findOne({ email: username })
        .then((user) => {
          if(!user)                           return done(null, false, { message: 'Incorrect email address.' });
          if(!user.enabled)                   return done(null, false, { message: 'Your account has been disabled.' });
          if(!user.validPassword(password))   return done(null, false, { message: 'Incorrect password.' });
          return done(null, user);
        });
      });
    })
  );

  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser((user, done) =>{
    done(null, user);
  });

  app.get('router').provideBefore('middleware', passport.initialize());
  app.get('router').provideBefore('middleware', passport.session());
  return passport;
};
