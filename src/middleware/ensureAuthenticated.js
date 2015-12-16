/* 
* @Author: Mike Reich
* @Date:   2015-12-14 12:16:14
* @Last Modified 2015-12-15
*/

'use strict';

module.exports = function(plugin, app) {
  app.get('router').provideBefore('middleware', (req, res, next) => {
    // var host = req.get('host')
    // if(!host)
    //   return next()
    // var subdomain = host.match(/^[^\.]+/i)
    // if(subdomain && subdomain[0])
    //   subdomain = subdomain[0]
    // return app.get('storage').request('getModel', 'team').then((Team) => {
    //   //console.log('team', Team)
    //   return Team.findOne({name: subdomain})
    // }).then((team) => {
    //   req.teamId = null
    //   if(team) req.teamId = team._id
    console.log('authenticated', req.isAuthenticated())
    if (req.path.indexOf("/login") == -1 && 
          req.path.indexOf("/img") == -1 && 
          req.path.indexOf("/js") == -1 && 
          req.path.indexOf("/scripts") == -1 && !req.isAuthenticated()) {
      return res.redirect(app.config.loginRoute || '/login?redirect=' + encodeURIComponent(req.originalUrl));
    }
    return next()
    // }).catch(err => next(err));
  })
};