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

  app.before('startup', () => {
    app.get('storage').request('getModel', 'connect-session').then((sessionModel) => {
      app.get('router').before('middleware', expressSession(
        {
          cookie: {
            maxAge: 1000*60*60*24, // 3 hour session
            domain: app.config.COOKIE_DOMAIN || 'nxus'
          },
          secret: app.config.secret || 'nxusapp',
          name: "_nxusid",
          store: new WaterlineStore({model: sessionModel})
        }
      ));
    });
  });
};
