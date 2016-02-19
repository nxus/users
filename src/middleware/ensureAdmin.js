/* 
* @Author: Mike Reich
* @Date:   2015-12-14 12:15:02
* @Last Modified 2016-02-19
*/

'use strict';

import _ from 'underscore';

import Router from 'routes';

module.exports = function(plugin, app) {
  var router = new Router();
  var noop = () => {};
  app.get('router').provideBefore('middleware', (req, res, next) => {
    var protectedRoutes = _.unique(plugin.adminRoutes);

    var _checkRoute = (route, protectedRoutes) => {
      router.routes = [];
      router.routeMap = [];
      protectedRoutes.forEach((r) => {
        router.addRoute(r, noop)
      }) 
      var match = router.match(route);
      return typeof match != 'undefined'
    }
    //console.log('protected route', _checkRoute(req.path, protectedRoutes))
    if (_checkRoute(req.path, protectedRoutes)) {
      if (!req.isAuthenticated()) return res.redirect(app.config.loginRoute || '/login?redirect=' + encodeURIComponent(req.originalUrl));
      if (!req.user.admin) return res.send(403); 
      else return next();
    }
    return next()
  });
};