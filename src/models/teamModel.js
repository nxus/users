/* 
* @Author: Mike Reich
* @Date:   2015-12-14 11:54:06
* @Last Modified 2015-12-14
*/

'use strict';

import {Waterline} from '@nxus/storage'

module.exports = Waterline.Collection.extend({
  identity: 'team',
  connection: 'default',
  attributes: {
    name: 'string',
    enabled: { 
      type: 'boolean', 
      defaultsTo: true 
    },
    users: {
      collection: 'user',
      via: 'team'
    },
    metadata: 'json'
  }
});


