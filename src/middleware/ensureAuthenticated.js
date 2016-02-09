/* 
* @Author: Mike Reich
* @Date:   2015-12-14 12:16:14
* @Last Modified 2015-12-16
*/

'use strict';

import _ from 'underscore';

import Router from 'routes';

module.exports = function(plugin, app) {
  var router = new Router();
  var noop = () => {};
  app.get('router').provideBefore('middleware', (req, res, next) => {
    // var host = req.get('host')
    // if(!host)
    //   return next()
    // var subdomain = host.match(/^[^\.]+/i)
    // if(subdomain && subdomain[0])
    //   subdomain = subdomain[0]
    // return app.get('storage').getModel('team').then((Team) => {
    //   //console.log('team', Team)
    //   return Team.findOne({name: subdomain})
    // }).then((team) => {
    //   req.teamId = null
    //   if(team) req.teamId = team._id
    //   
    
    var protectedRoutes = _.unique(plugin.protectedRoutes);

    var _checkRoute = (route, protectedRoutes) => {
      router.routes = [];
      router.routeMap = [];
      protectedRoutes.forEach((r) => {
        router.addRoute(r, noop)
      }) 
      var match = router.match(route);
      return typeof match != 'undefined'
    }

    if (_checkRoute(req.path, protectedRoutes) && !req.isAuthenticated()) {
      return res.redirect(app.config.loginRoute || '/login?redirect=' + encodeURIComponent(req.originalUrl));
    }
    return next()
    // }).catch(err => next(err));
  })
};
