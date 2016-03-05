/* 
* @Author: Mike Reich
* @Date:   2015-12-14 12:26:40
* @Last Modified 2016-03-05
*/

'use strict';

const defaultUser = {
  email: "admin@nxus.org",
  nameFirst: "Admin",
  nameLast: "User",
  password: Math.random().toString(36).slice(-12),
  enabled: true,
  admin: true
}

export default (app) => {
  app.on('launch', () => {
    app.get('storage').getModel('user').then((User) => {
      if(app.config.host)
        defaultUser.email = "admin@"+app.config.host
      if(app.config.NODE_ENV == 'test')
        defaultUser.password = 'test'
      return User.findOne().where({admin: true}).then((user) => {
        if(!user) {
          return User.create(defaultUser).then(() => {
            app.log.info('default user created', defaultUser.email, "with password "+defaultUser.password)
          }).catch((e) => {
            app.log.info('could not create user', e)
          })
        }
      }).catch((e) => {
        app.log.error('Error creating default user', e)
      })
    })
  })
}
