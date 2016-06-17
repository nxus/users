/* 
* @Author: Mike Reich
* @Date:   2016-02-05 10:09:46
* @Last Modified 2016-05-20
*/

'use strict';

import {AdminBase} from 'nxus-admin-ui'

export default class AdminController extends AdminBase {

  constructor(app, opts) {
    super(app, opts)
  }

  ignore() {
    return [
      'id',
      'objectId', 
      'updatedAt', 
      'position', 
      'salt', 
      'password', 
      'verifyToken', 
      'resetPasswordToken', 
      'resetPasswordExpires', 
      'verified', 
      'role', 
      'team', 
      'lastLogIn',
      'metadata'
    ];
  }

  iconClass() { return 'fa fa-users'};

  base() { return '/users' };

  model() { return 'user' }

  save (req, res) {
    let user = req.body
    user.enabled = true
    if(!user.admin)
      user.admin = false
    if(user.id == "")
      delete user.id
    if(!user.password || (user.password && user.password == ""))
      delete user.password
    this.app.log.debug('Saving user', user)
    super._save(req, res, user)
  }

}