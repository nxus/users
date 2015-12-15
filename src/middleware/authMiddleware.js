/* 
* @Author: Mike Reich
* @Date:   2015-12-14 12:01:06
* @Last Modified 2015-12-14 @Last Modified time: 2015-12-14 12:01:06
*/

'use strict';

import passport from 'passport'
import {LocalStrategy} from 'passport-local'

module.exports = (plugin, app) => {
  passport.use(
    new LocalStrategy(
      (function() {
        return function(username, password, done){
          app.emit('storage.getModel', 'User', (err, User) => {
            User.findOne({ email: username })
              .exec(function(err, user) {
                if(err)                             return done(err);
                if(!user)                           return done(null, false, { message: 'Incorrect email address.' });
                if(!user.enabled)                   return done(null, false, { message: 'Your account has been disabled.' });
                if(!user.validPassword(password))   return done(null, false, { message: 'Incorrect password.' });
                app.get('users').emit('loggedIn', user)
                return done(null, user);
            });
          })
        }
      })()
    )
  );

  passport.serializeUser(function(user, done){
    done(null, user);
  });

  passport.deserializeUser(function(user, done){
    done(null, user);
  });

  app.get('router').before('middleware', passport.initialize());
  app.get('router').before('middleware', passport.session());

  return passport;
};
