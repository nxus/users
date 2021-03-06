/* 
* @Author: Mike Reich
* @Date:   2015-12-14 12:26:40
* @Last Modified 2016-03-05
*/

'use strict';

import {application as app, NxusModule} from 'nxus-core'
import {permissions} from '../..'
import Promise from 'bluebird'
import HasUserModel from '../../HasUserModel'

const defaultUser = {
  email: "admin@nxus.org",
  nameFirst: "Admin",
  nameLast: "User",
  password: Math.random().toString(36).slice(-12),
  enabled: true,
  admin: true
}

export default class CreateAdminIfNone extends HasUserModel {
  constructor() {
    super()
    app.once('launch', () => {
      let User = this.models.User
      if(app.config.host)
        defaultUser.email = "admin@"+app.config.host
      if(app.config.NODE_ENV == 'test')
        defaultUser.password = 'test'
      return User.findOne().where({admin: true}).then((user) => {
        if(!user) {
          return Promise.all([
            User.create(defaultUser),
            permissions.getRoles()
          ]).spread((user, roles) => {
            if (roles['Admin']) {
              user.roles.add(roles['Admin'])
              return user.save()
            }
          }).then(() => {
            this.log.info('default user created', defaultUser.email, "with password "+defaultUser.password)
          }).catch((e) => {
            this.log.info('could not create user', e)
          })
        }
      }).catch((e) => {
        this.log.error('Error creating default user', e)
      })
    })
  }
}
