/* 
* @Author: Mike Reich
* @Date:   2015-12-14 12:16:14
* @Last Modified 2015-12-14
*/

'use strict';

module.exports = function(plugin, app) {
  app.get('router').before('middleware', (req, res, next) => {
    var host = req.get('host')
    if(!host)
      return next()
    var subdomain = host.match(/^[^\.]+/i)
    if(subdomain && subdomain[0])
      subdomain = subdomain[0]
    return app.get('storage').emit('getModel').with('Team').then((Team) => {
      return Team.findOne({name: subdomain})
    }).then((team) => {
      req.teamId = null
      if(team) req.teamId = team._id
      if (req.originalUrl.indexOf('/admin') == 0 && !req.isAuthenticated()) {
        return res.redirect(app.config.loginRoute || '/login?redirect=' + encodeURIComponent(req.originalUrl));
      }
      return next()
    }).catch(err => next(err));
  })
};