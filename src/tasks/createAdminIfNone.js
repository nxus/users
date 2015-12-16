/* 
* @Author: Mike Reich
* @Date:   2015-12-14 12:26:40
* @Last Modified 2015-12-15
*/

'use strict';

const defaultUser = {
  email: "admin@nxus.org",
  nameFirst: "Admin",
  nameLast: "User",
  password: "admin",
  enabled: true,
  admin: true
}

export default (app) => {
  app.on('launch', () => {
    app.get('storage').request('getModel', 'user').then((User) => {
      return User.findOne().where({admin: true}).then((user) => {
        if(!user) {
          return User.create(defaultUser).then(() => {
            console.log('default user created')
          }).catch((e) => {
            console.log('could not create user', e)
          })
        }
      })
    })
  })
}