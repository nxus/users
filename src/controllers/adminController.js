/* 
* @Author: Mike Reich
* @Date:   2016-02-05 10:09:46
* @Last Modified 2016-02-05
*/

'use strict';

import {AdminBase} from '@nxus/admin-ui'

export default class AdminController extends AdminBase {
  base_url () {
    return '/users'
  }

  template_dir () {
    return __dirname+"/../../views/users"    
  }

  model_id () {
    return 'user'
  }
  
  save (req, res) {
    let user = req.body
    user.enabled = true
    if(!user.admin)
      user.admin = false
    if(user.id == "")
      delete user.id
    if(!user.password || (user.password && user.password == ""))
      delete user.password
    console.log('user', user)
    super._save(req, res, user)
  }
}