/* 
* @Author: Mike Reich
* @Date:   2015-12-14 11:54:06
* @Last Modified 2016-05-20
*/

'use strict';

import {BaseModel} from 'nxus-storage'

module.exports = BaseModel.extend({
  identity: 'users_team',
  connection: 'default',
  attributes: {
    name: 'string',
    enabled: { 
      type: 'boolean', 
      defaultsTo: true 
    },
    users: {
      collection: 'users_user',
      via: 'team'
    },
    metadata: 'json'
  }
});


