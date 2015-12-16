/* 
* @Author: Mike Reich
* @Date:   2015-12-14 12:07:38
* @Last Modified 2015-12-15
*/

'use strict';

import expressSession from 'express-session';
import _ from 'underscore';
var FileStore = require('session-file-store')(expressSession);

module.exports = (plugin, app) => {
  app.get('router').provideBefore('middleware', expressSession(
    {
      cookie: {
          maxAge: 1000*60*60*24 // 3 hour session
      },
      secret: app.config.secret || 'nxusapp',
      name: "_nxusid",
      store: new FileStore,
      resave: true,
      saveUninitialized: false
    }
  ))
};
