/* 
* @Author: Mike Reich
* @Date:   2015-12-14 11:54:06
* @Last Modified 2015-12-14
*/

'use strict';

import {Waterline} from '@nxus/storage'
import ConnectWaterline from 'connect-waterline'
import _ from 'underscore'

module.exports = Waterline.Collection.extend(_.defaults({
  identity: 'connect-session',
  connection: 'default'
}, ConnectWaterline.defaultModelDefinition));


