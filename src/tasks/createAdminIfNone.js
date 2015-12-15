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
  password: "admin"
}

export default (app) => {
  app.on('launch', () => {
    app.get('storage').request('getModel', 'user').then((User) => {
      console.log("User", User);
      return User.findOne().where({admin: true}).then((user) => {
        if(!user) {
          console.log("Here", User.adapters, User.connections);
          return User.create(defaultUser).then((user) => {
            console.log('default user created:', user.email, "password:", user.password);
          }).catch((e) => {
            console.log('could not create user', e)
          })
        }
      })
    })
  })
}
