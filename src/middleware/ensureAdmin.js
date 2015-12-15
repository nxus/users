/* 
* @Author: Mike Reich
* @Date:   2015-12-14 12:15:02
* @Last Modified 2015-12-14 @Last Modified time: 2015-12-14 12:15:02
*/

'use strict';

module.exports = (app) => {
  app.get('router').before('middleware',(req, res, next) => {
    if (!req.isAuthenticated() || !req.user) {
      return res.redirect(app.config.loginRoute || '/login?redirect=' + encodeURIComponent(req.originalUrl));
    }
    if (!req.user.isEditor()) return res.send(403); 
    if (req.user.isEditor()) return next();
  });
};