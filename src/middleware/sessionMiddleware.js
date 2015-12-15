/* 
* @Author: Mike Reich
* @Date:   2015-12-14 12:07:38
* @Last Modified 2015-12-15
*/

'use strict';

import expressSession from 'express-session';
import _ from 'underscore';
var WaterlineStore = require('connect-waterline')(expressSession);

module.exports = (plugin, app) => {
  var opts = _.pick(app.config.storage, 'adapters', 'connections')
  opts.connections['connect-waterline'] = opts.connections.default;
  app.get('router').before('middleware', expressSession(
    {
      cookie: {
          maxAge: 1000*60*60*24, // 3 hour session
          domain: app.config.COOKIE_DOMAIN || 'nxus'
      },
      secret: app.config.secret || 'nxusapp',
      name: "_nxusid",
      store: new WaterlineStore(opts)
    }
  ))
};
