'use strict';

import Users from '../src/index'

describe("Users", () => {
  var module;
   
  describe("Load", function() {
    it("should not be null", () => Users.should.not.be.null)

    it("should be instantiated", function() {
      this.timeout(5000)
      module = new Users();
      module.should.not.be.null;
    });
  });
  describe("Init", () => {
    beforeEach(() => {
      module = new Users();
    });

    it("should provide routes", () => {
      app.get('router').provide.calledWith('route', 'GET', '/logout').should.be.true
      app.get('router').provide.calledWith('route', 'GET', '/forgot').should.be.true
      app.get('router').provide.calledWith('route', 'POST', '/forgot').should.be.true
      app.get('router').provide.calledWith('route', 'GET', '/login-link').should.be.true
      app.get('router').provide.calledWith('route', 'GET', '/profile').should.be.true
      app.get('router').provide.calledWith('route', 'GET', '/login').should.be.true
      app.get('router').provide.calledWith('route', 'POST', '/profile/save').should.be.true
    });
  });
});
