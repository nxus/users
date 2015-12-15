/* 
* @Author: Mike Reich
* @Date:   2015-12-14 12:07:38
* @Last Modified 2015-12-14
*/

'use strict';

import expressSession from 'express-session';
import _ from 'underscore';
var WaterlineStore = require('connect-waterline')(expressSession);

module.exports = (plugin, app) => {
  app.get('router').before('middleware', expressSession(
    {
      cookie: {
          maxAge: 1000*60*60*24, // 3 hour session
          domain: app.config.COOKIE_DOMAIN || 'nxus'
      },
      secret: app.config.secret,
      name: "_ddid",
      store: new WaterlineStore(_.pick(app.config.storage, 'adapters', 'connections'))
    }
  ))
};
